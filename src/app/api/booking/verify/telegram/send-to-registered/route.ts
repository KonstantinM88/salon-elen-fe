// src/app/api/booking/verify/telegram/send-to-registered/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOTP } from '@/lib/otp-store';
import axios from 'axios';

type SendToRegisteredRequest = {
  email: string;
  draftId: string;
};

type SendToRegisteredResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

const BOT_URL = process.env.BOT_URL || 'http://localhost:3001';
const BOT_SECRET = process.env.BOT_SECRET || 'your-bot-secret-key';

export async function POST(
  req: NextRequest
): Promise<NextResponse<SendToRegisteredResponse>> {
  try {
    const body = (await req.json()) as SendToRegisteredRequest;
    const { email, draftId } = body;

    // Валидация
    if (!email || !draftId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Получаем код из OTP store
    const otpEntry = getOTP('telegram', email, draftId);

    if (!otpEntry) {
      return NextResponse.json(
        { success: false, error: 'OTP not found' },
        { status: 404 }
      );
    }

    // Получаем chat ID пользователя
    const telegramUser = await prisma.telegramUser.findUnique({
      where: { email },
      select: { telegramChatId: true },
    });

    if (!telegramUser) {
      return NextResponse.json(
        { success: false, error: 'User not registered' },
        { status: 404 }
      );
    }

    console.log(`[Send to Registered] Отправка кода ${otpEntry.code} пользователю ${email}`);

    // Отправляем код через webhook бота
    await axios.post(
      `${BOT_URL}/send-code`,
      {
        email,
        chatId: telegramUser.telegramChatId,
        code: otpEntry.code,
        draftId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOT_SECRET}`,
        },
        timeout: 10000,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Code sent successfully',
    });

  } catch (error) {
    console.error('[Send to Registered Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send code' },
      { status: 500 }
    );
  }
}