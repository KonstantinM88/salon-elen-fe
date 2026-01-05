// src/app/api/booking/reserve-slot/route.ts
// ✅ Резервирование слота на 5 минут

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ReserveSlotRequest = {
  masterId: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  sessionId: string; // UUID клиента
};

export async function POST(request: NextRequest) {
  try {
    const body: ReserveSlotRequest = await request.json();
    const { masterId, startAt, endAt, sessionId } = body;

    if (!masterId || !startAt || !endAt || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);
    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return NextResponse.json(
        { error: 'Invalid time range' },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60_000); // +5 минут
    const conflictError = 'SLOT_TAKEN';

    const reservation = await prisma.$transaction(async (tx) => {
      // Чистим устаревшие резервации реже (внутри транзакции, чтобы не плодить гонки)
      await tx.temporarySlotReservation.deleteMany({
        where: { expiresAt: { lt: now } },
      });

      // Блокируем мастера на время проверки/резервации
      await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${masterId} FOR UPDATE`;

      const conflictingAppointment = await tx.appointment.findFirst({
        where: {
          masterId,
          status: { not: 'CANCELED' },
          startAt: { lt: endDate },
          endAt: { gt: startDate },
        },
        select: { id: true },
      });

      if (conflictingAppointment) {
        throw new Error(conflictError);
      }

      const existingReservation = await tx.temporarySlotReservation.findFirst({
        where: {
          masterId,
          startAt: { lt: endDate },
          endAt: { gt: startDate },
          expiresAt: { gte: now },
          NOT: { sessionId },
        },
        select: { id: true },
      });

      if (existingReservation) {
        throw new Error(conflictError);
      }

      return tx.temporarySlotReservation.upsert({
        where: { sessionId },
        update: {
          masterId,
          startAt: startDate,
          endAt: endDate,
          expiresAt,
        },
        create: {
          masterId,
          startAt: startDate,
          endAt: endDate,
          sessionId,
          expiresAt,
        },
      });
    });

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      expiresAt: reservation.expiresAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return NextResponse.json(
        { error: 'Slot already reserved by another client' },
        { status: 409 }
      );
    }
    console.error('[Reserve Slot] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
