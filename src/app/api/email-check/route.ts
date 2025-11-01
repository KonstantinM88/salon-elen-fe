// src/app/api/email-check/route.ts
import { NextRequest, NextResponse } from 'next/server';

type EmailCheckResponse = {
  ok: boolean;
  reason?: string;
};

export async function GET(req: NextRequest): Promise<NextResponse<EmailCheckResponse>> {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { ok: false, reason: 'Email не указан' },
        { status: 400 }
      );
    }

    // Базовая проверка синтаксиса
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        ok: false,
        reason: 'Некорректный формат email',
      });
    }

    // Проверка длины
    if (email.length > 254) {
      return NextResponse.json({
        ok: false,
        reason: 'Email слишком длинный',
      });
    }

    // Все проверки пройдены
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/email-check] Error:', e);
    return NextResponse.json(
      { ok: false, reason: 'Ошибка проверки email' },
      { status: 500 }
    );
  }
}