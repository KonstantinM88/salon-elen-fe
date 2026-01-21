//----------работало добовляем отправку телеграм админу при записи по емейл коду подтверждения----------------
// src/app/api/booking/verify/email/confirm/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyOTP,
  deleteOTP,
  OTPMethod,
} from '@/lib/otp-store';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';
import { translate, type MessageKey } from '@/i18n/messages';

// ---------- Типы ----------

type ConfirmCodeRequest = {
  email?: string;
  code?: string;
  draftId?: string;
};

type VerifyResponse =
  | {
      ok: true;
      message: string;
      appointmentId: string;
    }
  | {
      ok: false;
      error: string;
    };

// ---------- Вспомогательные функции ----------

/**
 * Создаёт Appointment из BookingDraft
 */
async function createAppointmentFromDraft(
  draftId: string,
  t: (key: MessageKey) => string
) {
  const draft = await prisma.bookingDraft.findUnique({
    where: { id: draftId },
  });

  if (!draft) {
    throw new Error(t('api_email_confirm_draft_not_found'));
  }

  const conflictError = 'SLOT_TAKEN';

  const appointment = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${draft.masterId} FOR UPDATE`;

    const conflicting = await tx.appointment.findFirst({
      where: {
        masterId: draft.masterId,
        status: { not: 'CANCELED' },
        startAt: { lt: draft.endAt },
        endAt: { gt: draft.startAt },
      },
      select: { id: true },
    });

    if (conflicting) {
      throw new Error(conflictError);
    }

    // ✅ СОЗДАНИЕ/ПОИСК КЛИЕНТА
    const phoneStr = (draft.phone ?? '').trim();
    const emailStr = (draft.email ?? '').trim();

    let clientId: string | null = null;

    // Ищем существующего клиента по phone или email
    if (phoneStr || emailStr) {
      const existing = await tx.client.findFirst({
        where: {
          OR: [
            ...(phoneStr ? [{ phone: phoneStr }] : []),
            ...(emailStr ? [{ email: emailStr }] : []),
          ],
        },
        select: { id: true },
      });

      if (existing) {
        clientId = existing.id;
      }
    }

    // Если клиент не найден - создаём нового
    if (!clientId && (phoneStr || emailStr)) {
      const newClient = await tx.client.create({
        data: {
          name: draft.customerName,
          phone: phoneStr,
          email: emailStr,
          birthDate: draft.birthDate || new Date('1990-01-01'),
          referral: draft.referral || null,
        },
        select: { id: true },
      });

      clientId = newClient.id;
    }

    const created = await tx.appointment.create({
      data: {
        serviceId: draft.serviceId,
        clientId,  // ✅ Связываем с клиентом!
        masterId: draft.masterId,
        startAt: draft.startAt,
        endAt: draft.endAt,
        customerName: draft.customerName,
        phone: draft.phone,
        email: draft.email,
        birthDate: draft.birthDate || null,  // ✅ Правильная обработка nullable
        referral: draft.referral || null,     // ✅ Правильная обработка nullable
        notes: draft.notes || null,           // ✅ Правильная обработка nullable
        status: 'PENDING',
      },
    });

    await tx.bookingDraft.delete({
      where: { id: draftId },
    });

    return created;
  });

  return appointment;
}

// ---------- API Handler ----------

export async function POST(
  req: NextRequest
): Promise<NextResponse<VerifyResponse>> {
  try {
    const locale = resolveLocale(req);
    const t = (key: MessageKey) => translate(locale, key);
    const body = (await req.json()) as ConfirmCodeRequest;
    const { email, code, draftId } = body;

    // Валидация
    if (!email || !code || !draftId) {
      return NextResponse.json(
        { ok: false, error: t('api_email_confirm_missing_fields') },
        { status: 400 }
      );
    }

    console.log(`[OTP Verify] Проверка кода для ${email}:${draftId}`);

    // Проверяем OTP код через централизованную функцию
    const isValid = verifyOTP('email' as OTPMethod, email, draftId, code);

    if (!isValid) {
      console.log(`[OTP Verify] Неверный код для ${email}:${draftId}`);
      return NextResponse.json(
        { ok: false, error: t('api_email_confirm_invalid_code') },
        { status: 400 }
      );
    }

    console.log(`[OTP Verify] Код подтверждён для ${email}:${draftId}`);

    // Создаём Appointment
    const appointment = await createAppointmentFromDraft(draftId, t);

    // Удаляем OTP код из хранилища
    deleteOTP('email' as OTPMethod, email, draftId);

    console.log(`[OTP Verify] Appointment создан: ${appointment.id}`);

    return NextResponse.json({
      ok: true,
      message: t('api_email_confirm_success'),
      appointmentId: appointment.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return NextResponse.json(
        { ok: false, error: translate(resolveLocale(req), 'api_email_confirm_slot_taken') },
        { status: 409 }
      );
    }
    console.error('[OTP Verify Error]:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : translate(resolveLocale(req), 'api_email_confirm_error');

    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function resolveLocale(req: NextRequest): Locale {
  const cookieLocale = req.cookies.get('locale')?.value as Locale | undefined;
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  const header = req.headers.get('accept-language') ?? '';
  const match = header.match(/\b(de|en|ru)\b/i);
  if (match) {
    const value = match[1].toLowerCase() as Locale;
    if (LOCALES.includes(value)) {
      return value;
    }
  }

  return DEFAULT_LOCALE;
}