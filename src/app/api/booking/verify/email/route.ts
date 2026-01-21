// src/app/api/booking/verify/email/route.ts
/**
 * API для отправки OTP кода верификации на email при бронировании
 * Использует Resend вместо nodemailer
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, saveOTP, OTPMethod } from '@/lib/otp-store';
import { sendOTPEmail } from '@/lib/email-otp';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';
import { translate, type MessageKey } from '@/i18n/messages';

type SendCodeRequest = {
  email?: string;
  draftId?: string;
};

type SendCodeResponse = {
  ok: boolean;
  message?: string;
  error?: string;
  devCode?: string;
};

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

export async function POST(
  req: NextRequest
): Promise<NextResponse<SendCodeResponse>> {
  try {
    const locale = resolveLocale(req);
    const t = (key: MessageKey) => translate(locale, key);

    const body = (await req.json()) as SendCodeRequest;
    const { email, draftId } = body;

    // Валидация
    if (!email || !draftId) {
      return NextResponse.json(
        { ok: false, error: t('booking_verify_email_api_missing_params') },
        { status: 400 }
      );
    }

    // Проверяем что черновик существует
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
      select: { id: true, email: true },
    });

    if (!draft) {
      return NextResponse.json(
        { ok: false, error: t('booking_verify_email_api_draft_not_found') },
        { status: 404 }
      );
    }

    // Проверяем что email совпадает
    if (draft.email !== email) {
      return NextResponse.json(
        { ok: false, error: t('booking_verify_email_api_email_mismatch') },
        { status: 400 }
      );
    }

    // Генерируем 6-значный OTP код
    const code = generateOTP();

    // Сохраняем в хранилище
    saveOTP('email' as OTPMethod, email, draftId, code, {
      ttlMinutes: 10,
    });

    console.log(`[Email OTP] Создан код для ${email}`);
    console.log(`[Email OTP] Код: ${code}`);

    // Отправляем email через Resend
    const sendResult = await sendOTPEmail(email, code, {
      expiryMinutes: 10,
      locale,
    });

    if (!sendResult.ok) {
      console.error(`[Email OTP] Ошибка отправки: ${sendResult.error}`);
      return NextResponse.json(
        { ok: false, error: t('booking_verify_email_api_send_failed') },
        { status: 500 }
      );
    }

    console.log(`[Email OTP] Код отправлен на ${email}`);

    // В режиме разработки отправляем код в ответе
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        ok: true,
        message: t('booking_verify_email_sent_message'),
        devCode: code, // ТОЛЬКО ДЛЯ РАЗРАБОТКИ
      });
    }

    return NextResponse.json({
      ok: true,
      message: t('booking_verify_email_sent_message'),
    });
  } catch (error) {
    console.error('[Email OTP Error]:', error);
    return NextResponse.json(
      { ok: false, error: translate(DEFAULT_LOCALE, 'booking_verify_email_api_error') },
      { status: 500 }
    );
  }
}