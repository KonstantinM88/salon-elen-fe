// src/app/api/telegram/register-user/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RegisterUserRequest = {
  email: string;
  telegramUserId: number;
  telegramChatId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
};

type RegisterUserResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

const BOT_SECRET = process.env.BOT_SECRET || 'your-bot-secret-key';

export async function POST(
  req: NextRequest
): Promise<NextResponse<RegisterUserResponse>> {
  try {
    // Проверяем авторизацию
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || authHeader !== `Bearer ${BOT_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await req.json()) as RegisterUserRequest;
    const { 
      email, 
      telegramUserId, 
      telegramChatId, 
      firstName, 
      lastName, 
      username 
    } = body;

    // Валидация
    if (!email || !telegramUserId || !telegramChatId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`[Telegram Registration] ${email} ↔ ${telegramChatId}`);

    // Upsert пользователя (обновить если существует, создать если нет)
    await prisma.telegramUser.upsert({
      where: { email },
      update: {
        telegramUserId,
        telegramChatId,
        firstName,
        lastName,
        username,
        updatedAt: new Date(),
      },
      create: {
        email,
        telegramUserId,
        telegramChatId,
        firstName,
        lastName,
        username,
      },
    });

    console.log(`[Telegram Registration] Успешно: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
    });

  } catch (error) {
    console.error('[Telegram Registration Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register user' },
      { status: 500 }
    );
  }
}