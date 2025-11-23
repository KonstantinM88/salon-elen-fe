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

type RegisterUserResponse =
  | {
      ok: true;
      message: string;
      userId: string;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * POST /api/telegram/register-user
 * 
 * Регистрирует Telegram пользователя в БД
 * Вызывается ботом при первом /start с payload
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<RegisterUserResponse>> {
  try {
    const body = (await req.json()) as RegisterUserRequest;
    const {
      email,
      telegramUserId,
      telegramChatId,
      firstName,
      lastName,
      username,
    } = body;

    // Валидация
    if (!email || !telegramUserId || !telegramChatId) {
      return NextResponse.json(
        { ok: false, error: 'Email, telegramUserId и telegramChatId обязательны' },
        { status: 400 }
      );
    }

    console.log(`[Telegram Register] Регистрация пользователя: ${email} (${telegramUserId})`);

    // Проверяем существует ли пользователь
    const existingUser = await prisma.telegramUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`[Telegram Register] Пользователь уже существует: ${email}`);
      
      // Обновляем данные если изменились
      const updatedUser = await prisma.telegramUser.update({
        where: { email },
        data: {
          telegramUserId: BigInt(telegramUserId),
          telegramChatId: BigInt(telegramChatId),
          firstName,
          lastName,
          username,
        },
      });

      return NextResponse.json({
        ok: true,
        message: 'Пользователь обновлён',
        userId: updatedUser.id,
      });
    }

    // Создаём нового пользователя
    const newUser = await prisma.telegramUser.create({
      data: {
        email,
        telegramUserId: BigInt(telegramUserId),
        telegramChatId: BigInt(telegramChatId),
        firstName,
        lastName,
        username,
      },
    });

    console.log(`[Telegram Register] Пользователь создан: ${email}`);

    return NextResponse.json({
      ok: true,
      message: 'Пользователь зарегистрирован',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('[Telegram Register Error]:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Ошибка регистрации пользователя';

    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}