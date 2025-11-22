// src/app/api/booking/verify/email/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';
import {
  verifyOTP,
  deleteOTP,
  VerificationMethod,
} from '@/lib/otp-store';

// ---------- Типы ----------
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
  error: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = (await req.json()) as ConfirmBody;
    const { email, code, draftId } = body;

    if (!email || !code || !draftId) {
      return NextResponse.json(
        { error: 'Email, код и draftId обязательны' },
        { status: 400 },
      );
    }

    console.log(`[OTP Verify] Проверка кода для ${email}:${draftId}`);

    // Проверяем OTP код через централизованную функцию
    const verification = verifyOTP(
      'email' as VerificationMethod,
      email,
      draftId,
      code
    );

    if (!verification.valid) {
      console.log(`[OTP Verify] Неверный код для ${email}:${draftId}`);
      return NextResponse.json(
        { error: verification.error || 'Неверный код' },
        { status: 400 },
      );
    }

    console.log(`[OTP Verify] Код подтверждён для ${email}:${draftId}`);

    // Код верный! Удаляем из хранилища
    deleteOTP('email' as VerificationMethod, email, draftId);

    // Достаём ЧЕРНОВИК
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Черновик записи не найден' },
        { status: 404 },
      );
    }

    // Проверяем, что email совпадает
    if (draft.email !== email) {
      return NextResponse.json(
        { error: 'E-mail не совпадает с данными черновика' },
        { status: 400 },
      );
    }

    // Проверяем, что слот всё ещё свободен
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
        { error: 'Выбранный слот уже занят' },
        { status: 409 },
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
      console.warn('[OTP Verify] Не удалось удалить черновик', cleanupErr);
    }

    console.log(
      `[OTP] Email ${email} подтверждён, создана запись ${appointment.id} из черновика ${draftId}`,
    );

    return NextResponse.json({
      ok: true,
      message: 'Email подтверждён, запись создана',
      appointmentId: appointment.id,
    });
  } catch (error) {
    console.error('[OTP Verify Error]:', error);
    return NextResponse.json(
      { error: 'Ошибка проверки кода' },
      { status: 500 },
    );
  }
}

// тестовая строка
