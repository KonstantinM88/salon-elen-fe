// src/app/api/booking/client/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';

type SubmitBody = {
  customerName: string;
  phone: string;
  email?: string;
  birthDateISO?: string;
  referral?: 'google' | 'facebook' | 'instagram' | 'friends' | 'other';
  notes?: string;
};

type ApiResponse =
  | {
      draftId: string;
    }
  | {
      error: string;
    };

const MS_IN_MIN = 60_000;

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const url = new URL(req.url);
    const serviceIds = url.searchParams.getAll('s');
    const masterId = url.searchParams.get('m');
    const startISO = url.searchParams.get('start');
    const endISO = url.searchParams.get('end');

    // Валидация параметров
    if (!serviceIds.length || !masterId || !startISO || !endISO) {
      return NextResponse.json(
        { error: 'Некорректные параметры запроса' },
        { status: 400 }
      );
    }

    // Парсинг тела запроса
    let body: SubmitBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Некорректный формат данных' },
        { status: 400 }
      );
    }

    const { customerName, phone, email, birthDateISO, referral, notes } = body;

    // Валидация обязательных полей
    if (!customerName?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: 'Имя и телефон обязательны' },
        { status: 400 }
      );
    }

    const startAt = new Date(startISO);
    const endAt = new Date(endISO);

    // Проверка корректности дат
    if (
      !(startAt instanceof Date) ||
      isNaN(startAt.getTime()) ||
      !(endAt instanceof Date) ||
      isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      return NextResponse.json(
        { error: 'Интервал времени некорректен' },
        { status: 422 }
      );
    }

    // Проверка: запись не раньше чем через 60 минут
    const now = new Date();
    const cutoff = new Date(now.getTime() + 60 * MS_IN_MIN);
    if (startAt < cutoff) {
      return NextResponse.json(
        {
          error:
            'Запись возможна не ранее чем через 60 минут от текущего времени',
        },
        { status: 422 }
      );
    }

    // Проверка занятости мастера (только активные статусы) — по реальным appointment'ам
    const overlapping = await prisma.appointment.findFirst({
      where: {
        masterId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
      },
      select: { id: true },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'Выбранный слот уже занят' },
        { status: 409 }
      );
    }

    // Проверка существования услуги и мастера
    const serviceId = serviceIds[0];

    const [serviceExists, masterExists] = await Promise.all([
      prisma.service.findFirst({
        where: {
          id: serviceId,
          isActive: true,
          isArchived: false,
        },
        select: { id: true },
      }),
      prisma.master.findFirst({
        where: { id: masterId },
        select: { id: true },
      }),
    ]);

    if (!serviceExists) {
      return NextResponse.json(
        { error: 'Услуга не найдена или недоступна' },
        { status: 404 }
      );
    }

    if (!masterExists) {
      return NextResponse.json(
        { error: 'Мастер не найден' },
        { status: 404 }
      );
    }

    // ───── На этом шаге СОЗДАЁМ ТОЛЬКО ЧЕРНОВИК, не реальную запись ─────
    const draft = await prisma.bookingDraft.create({
      data: {
        serviceId,
        masterId,
        startAt,
        endAt,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email?.trim() ?? '',
        birthDate: birthDateISO ? new Date(birthDateISO) : null,
        referral: referral ?? null,
        notes: notes ?? null,
      },
    });

    // Возвращаем ID черновика — реальное бронирование будет после верификации
    return NextResponse.json({ draftId: draft.id }, { status: 201 });
  } catch (e) {
    console.error('[api/booking/client] Error:', e);

    const errorMessage = e instanceof Error ? e.message : 'internal_error';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}