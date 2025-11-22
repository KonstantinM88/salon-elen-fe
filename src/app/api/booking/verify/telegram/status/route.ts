// src/app/api/booking/verify/telegram/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { checkOTPConfirmed } from '@/lib/otp-store';

/**
 * GET эндпоинт для проверки статуса верификации
 * 
 * Используется фронтендом для polling:
 * - Пользователь открыл Telegram и нажал кнопку
 * - Бот вызвал callback API
 * - Фронтенд периодически проверяет статус
 * - Когда confirmed=true → редирект на payment
 */

type StatusResponse = {
  ok: boolean;
  confirmed: boolean;
  expired: boolean;
  error?: string;
};

export async function GET(
  req: NextRequest
): Promise<NextResponse<StatusResponse>> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get('email');
    const draftId = searchParams.get('draftId');

    // Валидация
    if (!email || !draftId) {
      return NextResponse.json(
        {
          ok: false,
          confirmed: false,
          expired: false,
          error: 'Email и draftId обязательны',
        },
        { status: 400 }
      );
    }

    // Проверяем статус в OTP store
    const status = checkOTPConfirmed('telegram', email, draftId);

    return NextResponse.json({
      ok: true,
      confirmed: status.confirmed,
      expired: status.expired,
    });
  } catch (error) {
    console.error('[Telegram Status Error]:', error);
    return NextResponse.json(
      {
        ok: false,
        confirmed: false,
        expired: false,
        error: 'Ошибка проверки статуса',
      },
      { status: 500 }
    );
  }
}
