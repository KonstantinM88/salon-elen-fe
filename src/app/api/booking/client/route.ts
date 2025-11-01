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

type ApiResponse = {
  draftId: string;
} | {
  error: string;
};

const MS_IN_MIN = 60_000;

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
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

    // Валидация обязательных полей
    if (!body.customerName?.trim() || !body.phone?.trim()) {
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
        { error: 'Запись возможна не ранее чем через 60 минут от текущего времени' },
        { status: 422 }
      );
    }

    // Проверка занятости мастера (только активные статусы)
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
    const [serviceExists, masterExists] = await Promise.all([
      prisma.service.findFirst({
        where: {
          id: serviceIds[0],
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

    // Создаём запись со статусом PENDING
    const created = await prisma.appointment.create({
      data: {
        serviceId: serviceIds[0],
        masterId,
        startAt,
        endAt,
        customerName: body.customerName.trim(),
        phone: body.phone.trim(),
        email: body.email?.trim() || null,
        notes: body.notes?.trim() || null,
        status: AppointmentStatus.PENDING,
      },
      select: { id: true },
    });

    // Возвращаем успешный результат
    return NextResponse.json(
      { draftId: created.id },
      { status: 201 }
    );
  } catch (e) {
    console.error('[api/booking/client] Error:', e);

    const errorMessage = e instanceof Error ? e.message : 'internal_error';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}