// src/app/api/email-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';
import { translate, type MessageKey } from '@/i18n/messages';

type EmailCheckResponse = {
  ok: boolean;
  reason?: string;
};

export async function GET(req: NextRequest): Promise<NextResponse<EmailCheckResponse>> {
  const locale = resolveLocale(req);
  const t = (key: MessageKey) => translate(locale, key);

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { ok: false, reason: t('api_email_check_missing') },
        { status: 400 }
      );
    }

    // Базовая проверка синтаксиса
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        ok: false,
        reason: t('api_email_check_invalid'),
      });
    }

    // Проверка длины
    if (email.length > 254) {
      return NextResponse.json({
        ok: false,
        reason: t('api_email_check_too_long'),
      });
    }

    // Все проверки пройдены
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/email-check] Error:', e);
    return NextResponse.json(
      { ok: false, reason: t('api_email_check_error') },
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
