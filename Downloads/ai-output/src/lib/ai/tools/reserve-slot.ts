// src/lib/ai/tools/reserve-slot.ts

import { prisma } from '@/lib/prisma';

interface Args {
  masterId: string;
  startAt: string;
  endAt: string;
  sessionId: string;
}

export async function reserveSlot(args: Args) {
  const { masterId, startAt, endAt, sessionId } = args;

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate <= startDate
  ) {
    return { success: false, error: 'INVALID_TIME_RANGE' };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60_000); // +5 min

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      // Cleanup expired
      await tx.temporarySlotReservation.deleteMany({
        where: { expiresAt: { lt: now } },
      });

      // Lock master row
      await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${masterId} FOR UPDATE`;

      // Check conflicting appointments
      const conflictAppt = await tx.appointment.findFirst({
        where: {
          masterId,
          status: { not: 'CANCELED' },
          startAt: { lt: endDate },
          endAt: { gt: startDate },
        },
        select: { id: true },
      });

      if (conflictAppt) throw new Error('SLOT_TAKEN');

      // Check conflicting reservations from OTHER sessions
      const conflictRes = await tx.temporarySlotReservation.findFirst({
        where: {
          masterId,
          startAt: { lt: endDate },
          endAt: { gt: startDate },
          expiresAt: { gte: now },
          NOT: { sessionId },
        },
        select: { id: true },
      });

      if (conflictRes) throw new Error('SLOT_TAKEN');

      // Upsert reservation for this session
      return tx.temporarySlotReservation.upsert({
        where: { sessionId },
        update: { masterId, startAt: startDate, endAt: endDate, expiresAt },
        create: { masterId, startAt: startDate, endAt: endDate, sessionId, expiresAt },
      });
    });

    return {
      success: true,
      reservationId: reservation.id,
      expiresAt: reservation.expiresAt.toISOString(),
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return { success: false, error: 'SLOT_TAKEN' };
    }
    console.error('[AI reserve_slot] Error:', error);
    return { success: false, error: 'INTERNAL_ERROR' };
  }
}
