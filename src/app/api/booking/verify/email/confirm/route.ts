// src/app/api/booking/verify/email/confirm/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, deleteOTP, OTPMethod } from '@/lib/otp-store';
import { finalizeBookingFromDraft } from '@/lib/booking/finalize-booking';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';
import { translate, type MessageKey } from '@/i18n/messages';

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

export async function POST(
  req: NextRequest
): Promise<NextResponse<VerifyResponse>> {
  const locale = resolveLocale(req);
  const t = (key: MessageKey) => translate(locale, key);

  try {
    const body = (await req.json()) as ConfirmCodeRequest;
    const { email, code, draftId } = body;

    if (!email || !code || !draftId) {
      return NextResponse.json(
        { ok: false, error: t('api_email_confirm_missing_fields') },
        { status: 400 }
      );
    }

    console.log(`[OTP Verify] Проверка кода для ${email}:${draftId}`);

    const isValid = verifyOTP('email' as OTPMethod, email, draftId, code);
    if (!isValid) {
      console.log(`[OTP Verify] Неверный код для ${email}:${draftId}`);
      return NextResponse.json(
        { ok: false, error: t('api_email_confirm_invalid_code') },
        { status: 400 }
      );
    }

    console.log(`[OTP Verify] Код подтверждён для ${email}:${draftId}`);

    const finalizeResult = await finalizeBookingFromDraft(draftId);
    if (!finalizeResult.ok) {
      if (finalizeResult.error === 'DRAFT_NOT_FOUND') {
        return NextResponse.json(
          { ok: false, error: t('api_email_confirm_draft_not_found') },
          { status: 404 }
        );
      }

      if (finalizeResult.error === 'SLOT_TAKEN') {
        return NextResponse.json(
          { ok: false, error: t('api_email_confirm_slot_taken') },
          { status: 409 }
        );
      }

      console.error('[OTP Verify] Finalize booking failed:', finalizeResult.message);
      return NextResponse.json(
        { ok: false, error: t('api_email_confirm_error') },
        { status: 500 }
      );
    }

    deleteOTP('email' as OTPMethod, email, draftId);
    console.log(`[OTP Verify] Appointment создан: ${finalizeResult.appointmentId}`);

    return NextResponse.json({
      ok: true,
      message: t('api_email_confirm_success'),
      appointmentId: finalizeResult.appointmentId,
    });
  } catch (error) {
    console.error('[OTP Verify Error]:', error);
    return NextResponse.json(
      { ok: false, error: t('api_email_confirm_error') },
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
