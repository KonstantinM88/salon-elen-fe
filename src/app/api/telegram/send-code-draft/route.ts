// src/app/api/telegram/send-code-draft/route.ts
// ✅ Отправка кода в Telegram с привязкой к BookingDraft

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPhoneDigitsValid, normalizePhoneDigits } from '@/lib/phone';

interface SendCodeDraftRequest {
  phone: string;
  email: string;
  draftId: string;
}

export async function POST(request: NextRequest) {
  console.log('=== [Telegram Send Code Draft] START ===');
  
  try {
    const body: SendCodeDraftRequest = await request.json();
    const { phone, email, draftId } = body;

    console.log('[Telegram Send Code Draft] Request:', { phone, email, draftId });

    // Валидация
    if (!phone || !draftId) {
      console.log('[Telegram Send Code Draft] ERROR: Missing fields');
      return NextResponse.json(
        { error: 'Missing phone or draftId' },
        { status: 400 }
      );
    }

    const phoneDigits = normalizePhoneDigits(phone);
    if (!isPhoneDigitsValid(phoneDigits)) {
      console.log('[Telegram Send Code Draft] ERROR: Invalid phone format:', phone);
      return NextResponse.json(
        { error: 'Invalid phone format. Use format: +380679014039' },
        { status: 400 }
      );
    }

    const matches = await prisma.telegramUser.findMany({
      where: { phone: { endsWith: phoneDigits } },
      select: {
        phone: true,
        telegramUserId: true,
      },
    });

    if (matches.length === 0) {
      return NextResponse.json(
        { error: 'Phone not registered in Telegram bot' },
        { status: 404 }
      );
    }

    if (matches.length > 1) {
      return NextResponse.json(
        { error: 'Multiple users found. Use full phone number with country code.' },
        { status: 409 }
      );
    }

    const matchedUser = matches[0];
    const resolvedPhone = matchedUser.phone;

    // Загрузить BookingDraft
    console.log('[Telegram Send Code Draft] Loading draft:', draftId);
    
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      console.log('[Telegram Send Code Draft] ERROR: Draft not found');
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    console.log('[Telegram Send Code Draft] Draft loaded:', {
      serviceId: draft.serviceId,
      masterId: draft.masterId,
      startAt: draft.startAt,
    });

    // Генерация 6-значного кода
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = crypto.randomUUID();

    console.log('[Telegram Send Code Draft] Generated:', { code, sessionId });

    // Срок действия кода - 10 минут
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Удалить старые неверифицированные записи для этого телефона
    await prisma.telegramVerification.deleteMany({
      where: {
        phone: resolvedPhone,
        verified: false,
        expiresAt: { lt: new Date() },
      },
    });

    // Создать новую верификацию с данными из draft
    const verification = await prisma.telegramVerification.create({
      data: {
        phone: resolvedPhone,
        code,
        sessionId,
        serviceId: draft.serviceId,
        masterId: draft.masterId,
        startAt: draft.startAt.toISOString(),
        endAt: draft.endAt.toISOString(),
        email: email || null,
        birthDate: draft.birthDate || null,
        expiresAt,
        verified: false,
        telegramUserId: matchedUser.telegramUserId,
      },
    });

    console.log('[Telegram Send Code Draft] Verification created:', verification.id);

    // Отправить код в Telegram через webhook
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
      console.log('[Telegram Send Code Draft] Sending to Telegram via webhook');
      const response = await fetch(
        `${baseUrl}/api/telegram/webhook?phone=${encodeURIComponent(resolvedPhone)}&code=${code}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[Telegram Send Code Draft] Telegram webhook error:', data);
      } else {
        console.log('[Telegram Send Code Draft] Code sent to Telegram successfully');
      }
    } catch (telegramError) {
      console.error('[Telegram Send Code Draft] Telegram webhook error:', telegramError);
      // Продолжаем, даже если Telegram не ответил
    }

    console.log('[Telegram Send Code Draft] SUCCESS');

    return NextResponse.json({
      success: true,
      sessionId: verification.sessionId,
      expiresAt: verification.expiresAt,
      message: 'Code sent to Telegram',
    });
  } catch (error) {
    console.error('=== [Telegram Send Code Draft] ERROR ===');
    console.error('Error details:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
