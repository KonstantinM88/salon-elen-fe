// src/app/api/telegram/check-registration/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPhoneDigitsValid, normalizePhoneDigits } from '@/lib/phone';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Missing phone parameter' },
        { status: 400 }
      );
    }

    const phoneDigits = normalizePhoneDigits(phone);
    if (!isPhoneDigitsValid(phoneDigits)) {
      return NextResponse.json(
        { error: 'Invalid phone format. Use format: +380679014039' },
        { status: 400 }
      );
    }

    console.log('[Check Registration] Checking phone:', phone);

    // Проверить есть ли пользователь в БД
    const matches = await prisma.telegramUser.findMany({
      where: { phone: { endsWith: phoneDigits } },
      select: {
        id: true,
        phone: true,
        telegramChatId: true,
        firstName: true,
        username: true,
      },
    });

    if (matches.length > 1) {
      console.log('[Check Registration] Multiple matches found, using first');
    }

    const user = matches[0];

    if (user) {
      console.log('[Check Registration] User found:', user.id);
      return NextResponse.json({
        registered: true,
        chatId: Number(user.telegramChatId),
        firstName: user.firstName,
        username: user.username,
      });
    }

    console.log('[Check Registration] User not found');
    return NextResponse.json({
      registered: false,
    });
  } catch (error) {
    console.error('[Check Registration] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
