// src/app/api/booking/verify/telegram/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { isConfirmed, getOTP } from '@/lib/otp-store';

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
    const { searchParams } = new URL(req.url);
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
    const confirmed = isConfirmed('telegram', email, draftId);

    // Проверяем истёк ли код
    const otpEntry = getOTP('telegram', email, draftId);
    const expired = !otpEntry; // Если entry не найден - значит истёк или не существует

    return NextResponse.json({
      ok: true,
      confirmed,
      expired,
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