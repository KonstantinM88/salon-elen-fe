// src/app/api/booking/verify/google/status/route.ts
/**
 * GET /api/booking/verify/google/status
 * 
 * Проверяет статус Google OAuth верификации
 * Используется для polling с клиента после открытия popup
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';
import { translate, type MessageKey } from '@/i18n/messages';

type SuccessResponse = {
  verified: boolean;
  pending: boolean;
  appointmentId?: string;
  method?: string;
};

type ErrorResponse = {
  error: string;
};

type ResponseData = SuccessResponse | ErrorResponse;

/**
 * GET handler
 * 
 * Query params:
 * - email: email пользователя
 * - draftId: ID черновика бронирования
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<ResponseData>> {
  const locale = resolveLocale(req);
  const t = (key: MessageKey) => translate(locale, key);

  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');
    const draftId = searchParams.get('draftId');

    // Валидация параметров
    if (!email || !draftId) {
      return NextResponse.json(
        { error: t('api_google_status_missing_params') },
        { status: 400 }
      );
    }

    console.log('[Google Status] Checking status for:', { email, draftId });

    // Ищем последний активный запрос верификации
    const verificationRequest = await prisma.googleVerificationRequest.findFirst({
      where: {
        email: email.toLowerCase(),
        draftId,
        expiresAt: {
          gt: new Date(), // Только неистёкшие
        },
      },
      orderBy: {
        createdAt: 'desc', // Самый последний
      },
      select: {
        id: true,
        verified: true,
        appointmentId: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!verificationRequest) {
      console.log('[Google Status] No active verification request found');
      return NextResponse.json({
        verified: false,
        pending: false,
      });
    }

    console.log('[Google Status] Request found:', {
      id: verificationRequest.id,
      verified: verificationRequest.verified,
      appointmentId: verificationRequest.appointmentId,
    });

    // Если верификация завершена
    if (verificationRequest.verified && verificationRequest.appointmentId) {
      console.log('[Google Status] ✅ Verified! Appointment:', verificationRequest.appointmentId);
      return NextResponse.json({
        verified: true,
        pending: false,
        appointmentId: verificationRequest.appointmentId,
        method: 'google',
      });
    }

    // Если ещё в процессе
    console.log('[Google Status] ⏳ Still pending...');
    return NextResponse.json({
      verified: false,
      pending: true,
    });
  } catch (error) {
    console.error('[Google Status] Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : t('api_google_status_error');

    return NextResponse.json(
      { error: errorMessage },
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
