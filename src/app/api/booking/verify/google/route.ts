// src/app/api/booking/verify/google/route.ts
/**
 * POST /api/booking/verify/google
 * 
 * Генерирует OAuth URL для авторизации через Google
 * и создаёт запрос на верификацию в БД
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleOAuth } from '@/lib/google-oauth';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';
import { translate, type MessageKey } from '@/i18n/messages';

type RequestBody = {
  email: string;
  draftId: string;
};

type SuccessResponse = {
  ok: true;
  authUrl: string;
  state: string;
  message: string;
};

type ErrorResponse = {
  ok: false;
  error: string;
};

type ResponseData = SuccessResponse | ErrorResponse;

/**
 * POST handler
 * 
 * Создаёт запрос на верификацию и возвращает OAuth URL
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ResponseData>> {
  const locale = resolveLocale(req);
  const t = (key: MessageKey) => translate(locale, key);

  try {
    // Валидация конфигурации
    try {
      GoogleOAuth.validateGoogleOAuthConfig();
    } catch (configError) {
      console.error('[Google OAuth] Config error:', configError);
      return NextResponse.json(
        {
          ok: false,
          error: t('api_google_oauth_not_configured'),
        },
        { status: 500 }
      );
    }

    // Парсинг тела запроса
    const body = (await req.json()) as RequestBody;
    const { email, draftId } = body;

    // Валидация входных данных
    if (!email || !draftId) {
      return NextResponse.json(
        {
          ok: false,
          error: t('api_google_oauth_missing_params'),
        },
        { status: 400 }
      );
    }

    // Проверяем, что draft существует
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
      select: {
        id: true,
        email: true,
      },
    });

    if (!draft) {
      return NextResponse.json(
        {
          ok: false,
          error: t('api_google_oauth_draft_not_found'),
        },
        { status: 404 }
      );
    }

    if (draft.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        {
          ok: false,
          error: t('api_google_oauth_email_mismatch'),
        },
        { status: 400 }
      );
    }

    // Генерируем state токен для CSRF защиты
    const state = GoogleOAuth.generateStateToken();

    // Создаём запрос на верификацию в БД
    // Expiry: 15 минут
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Удаляем старые неиспользованные запросы для этого email/draft
    await prisma.googleVerificationRequest.deleteMany({
      where: {
        email: email.toLowerCase(),
        draftId,
        verified: false,
        expiresAt: {
          lt: new Date(), // Удаляем только истёкшие
        },
      },
    });

    // Создаём новый запрос
    await prisma.googleVerificationRequest.create({
      data: {
        email: email.toLowerCase(),
        draftId,
        state,
        expiresAt,
        verified: false,
      },
    });

    console.log(`[Google OAuth] Created verification request for ${email}`);
    console.log(`[Google OAuth] State: ${state}`);
    console.log(`[Google OAuth] Draft ID: ${draftId}`);

    // Генерируем OAuth URL
    const authUrl = GoogleOAuth.generateAuthUrl(state);

    console.log(`[Google OAuth] Generated authUrl: ${authUrl.substring(0, 100)}...`);

    return NextResponse.json({
      ok: true,
      authUrl,
      state,
      message: t('api_google_oauth_generated'),
    });
  } catch (error) {
    console.error('[Google OAuth API] Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : t('api_google_oauth_error');

    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
      },
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
