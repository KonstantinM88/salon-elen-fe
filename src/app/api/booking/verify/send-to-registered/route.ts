// src/app/api/booking/verify/telegram/send-to-registered/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

type SendToRegisteredRequest = {
  email: string;
  draftId: string;
};

type SendToRegisteredResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * POST /api/booking/verify/telegram/send-to-registered
 * 
 * Отправляет код подтверждения зарегистрированному пользователю
 * Вызывается ботом после регистрации пользователя
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<SendToRegisteredResponse>> {
  try {
    const body = (await req.json()) as SendToRegisteredRequest;
    const { email, draftId } = body;

    if (!email || !draftId) {
      return NextResponse.json(
        { success: false, error: 'Email и draftId обязательны' },
        { status: 400 }
      );
    }

    // Получаем пользователя из БД
    const telegramUser = await prisma.telegramUser.findUnique({
      where: { email },
      select: {
        id: true,
        telegramChatId: true,
      },
    });

    if (!telegramUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Получаем OTP код из memory store
    const { getOTP } = await import('@/lib/otp-store');
    const otpEntry = getOTP('telegram', email, draftId);

    if (!otpEntry) {
      return NextResponse.json(
        { success: false, error: 'Код не найден' },
        { status: 404 }
      );
    }

    const code = otpEntry.code;

    console.log(`[Send to Registered] Отправка кода ${code} пользователю ${email}`);

    // ✅ ИСПРАВЛЕНО: Конвертируем BigInt в Number
    const chatId = Number(telegramUser.telegramChatId);

    // Отправляем код через webhook бота
    const BOT_SECRET = process.env.BOT_SECRET || 'your-bot-secret-key';
    const BOT_URL = process.env.BOT_URL || 'http://localhost:3001';

    await axios.post(
      `${BOT_URL}/send-code`,
      {
        email,
        chatId, // ✅ Теперь это Number, не BigInt
        code,
        draftId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOT_SECRET}`,
        },
      }
    );

    console.log(`[Send to Registered] Код отправлен успешно`);

    return NextResponse.json({
      success: true,
      message: 'Код отправлен',
    });
  } catch (error) {
    console.error('[Send to Registered Error]:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Ошибка отправки кода';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}