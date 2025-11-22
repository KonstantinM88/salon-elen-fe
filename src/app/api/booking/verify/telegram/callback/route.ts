// src/app/api/booking/verify/telegram/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';
import { getOTP, confirmOTP, deleteOTP } from '@/lib/otp-store';

/**
 * Webhook для автоподтверждения через кнопку в Telegram боте
 * 
 * Вызывается Telegram ботом когда пользователь нажимает "✅ Подтвердить сейчас"
 */

type CallbackBody = {
  email?: string;
  draftId?: string;
  telegramUserId?: number;
  telegramChatId?: number;
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
    const body = (await req.json()) as CallbackBody;
    const { email, draftId, telegramUserId, telegramChatId } = body;

    // Валидация
    if (!email || !draftId || !telegramUserId) {
      return NextResponse.json(
        { ok: false, error: 'Email, draftId и telegramUserId обязательны' },
        { status: 400 }
      );
    }

    console.log(
      `[Telegram Callback] Автоподтверждение для ${email}:${draftId} от пользователя ${telegramUserId}`
    );

    // Получаем OTP запись
    const otpEntry = getOTP('telegram', email, draftId);

    if (!otpEntry) {
      return NextResponse.json(
        { ok: false, error: 'Код не найден или истёк' },
        { status: 404 }
      );
    }

    // Проверяем срок действия
    if (Date.now() > otpEntry.expiresAt) {
      deleteOTP('telegram', email, draftId);
      return NextResponse.json(
        { ok: false, error: 'Срок действия кода истёк' },
        { status: 400 }
      );
    }

    // Помечаем как подтверждённый
    const confirmed = confirmOTP('telegram', email, draftId);

    if (!confirmed) {
      return NextResponse.json(
        { ok: false, error: 'Не удалось подтвердить код' },
        { status: 500 }
      );
    }

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
        notes: draft.notes ? `${draft.notes} [Подтверждено через Telegram]` : '[Подтверждено через Telegram]',
        status: AppointmentStatus.PENDING,
      },
      select: { id: true },
    });

    // Удаляем код из хранилища
    deleteOTP('telegram', email, draftId);

    // Удаляем черновик
    try {
      await prisma.bookingDraft.delete({ where: { id: draftId } });
    } catch (cleanupErr) {
      console.warn('[Telegram Callback] Не удалось удалить черновик', cleanupErr);
    }

    console.log(
      `[Telegram Callback] ✅ Автоподтверждение успешно! Создана запись ${appointment.id}`
    );

    return NextResponse.json({
      ok: true,
      message: 'Запись успешно подтверждена через Telegram!',
      appointmentId: appointment.id,
    });
  } catch (error) {
    console.error('[Telegram Callback Error]:', error);
    return NextResponse.json(
      { ok: false, error: 'Ошибка автоподтверждения' },
      { status: 500 }
    );
  }
}
