// src/app/api/booking/verify/telegram/confirm/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';
import { verifyOTP, deleteOTP } from '@/lib/otp-store';

type ConfirmBody = {
  email?: string;
  code?: string;
  draftId?: string;
};

type SuccessResponse = {
  ok: true;
  message: string;
  appointmentId: string;
};

type ErrorResponse = {
  ok: false;
  error: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = (await req.json()) as ConfirmBody;
    const { email, code, draftId } = body;

    // Валидация
    if (!email || !code || !draftId) {
      return NextResponse.json(
        { ok: false, error: 'Email, код и draftId обязательны' },
        { status: 400 }
      );
    }

    console.log(`[Telegram OTP Verify] Проверка кода для ${email}:${draftId}`);

    // Проверяем код через OTP store
    const verification = verifyOTP('telegram', email, draftId, code);

    if (!verification.valid) {
      return NextResponse.json(
        { ok: false, error: verification.error || 'Неверный код' },
        { status: 400 }
      );
    }

    // Код верный! Удаляем из хранилища
    deleteOTP('telegram', email, draftId);
    console.log(`[Telegram OTP] Код подтверждён для ${email}:${draftId}`);

    // Достаём черновик
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      return NextResponse.json(
        { ok: false, error: 'Черновик записи не найден' },
        { status: 404 }
      );
    }

    // Проверяем email
    if (draft.email !== email) {
      return NextResponse.json(
        { ok: false, error: 'E-mail не совпадает с данными черновика' },
        { status: 400 }
      );
    }

    // Проверяем что слот всё ещё свободен
    const overlapping = await prisma.appointment.findFirst({
      where: {
        masterId: draft.masterId,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
        startAt: { lt: draft.endAt },
        endAt: { gt: draft.startAt },
      },
      select: { id: true },
    });

    if (overlapping) {
      return NextResponse.json(
        { ok: false, error: 'Выбранный слот уже занят' },
        { status: 409 }
      );
    }

    // ✅ Создаём реальную запись из черновика
    const appointment = await prisma.appointment.create({
      data: {
        serviceId: draft.serviceId,
        masterId: draft.masterId,
        startAt: draft.startAt,
        endAt: draft.endAt,
        customerName: draft.customerName,
        phone: draft.phone,
        email: draft.email,
        notes: draft.notes,
        status: AppointmentStatus.PENDING,
      },
      select: { id: true },
    });

    // Удаляем черновик
    try {
      await prisma.bookingDraft.delete({ where: { id: draftId } });
    } catch (cleanupErr) {
      console.warn('[Telegram OTP] Не удалось удалить черновик', cleanupErr);
    }

    console.log(
      `[Telegram OTP] Telegram подтверждён, создана запись ${appointment.id} из черновика ${draftId}`
    );

    return NextResponse.json({
      ok: true,
      message: 'Telegram подтверждён, запись создана',
      appointmentId: appointment.id,
    });
  } catch (error) {
    console.error('[Telegram OTP Verify Error]:', error);
    return NextResponse.json(
      { ok: false, error: 'Ошибка проверки кода' },
      { status: 500 }
    );
  }
}
