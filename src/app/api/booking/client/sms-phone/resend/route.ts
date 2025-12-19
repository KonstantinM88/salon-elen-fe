// src/app/api/booking/client/sms-phone/resend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generatePinCode,
  sendPinSms,
} from '@/lib/infobip-sms';
import bcrypt from 'bcrypt';

/**
 * POST /api/booking/client/sms-phone/resend
 * 
 * Повторная отправка PIN кода
 * Генерирует новый PIN, хеширует, обновляет в БД, отправляет SMS
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId } = body;

    console.log('[SMS Phone Resend] Resending PIN for:', registrationId);

    // Валидация входных данных
    if (!registrationId) {
      return NextResponse.json(
        { ok: false, error: 'Missing registrationId' },
        { status: 400 }
      );
    }

    // Поиск registration request
    const registration = await prisma.smsPhoneRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return NextResponse.json(
        { ok: false, error: 'Registration request not found' },
        { status: 404 }
      );
    }

    // Проверка истечения срока действия
    const now = new Date();
    if (registration.expiresAt < now) {
      return NextResponse.json(
        { ok: false, error: 'Registration request expired' },
        { status: 400 }
      );
    }

    // Проверка уже верифицированного запроса
    if (registration.verified) {
      return NextResponse.json(
        { ok: false, error: 'Registration already verified' },
        { status: 400 }
      );
    }

    // Генерация нового PIN
    const newPin = generatePinCode();
    const hashedPin = await bcrypt.hash(newPin, 10);
    
    const pinExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 минут
    
    // Обновление PIN в БД и сброс счётчика попыток
    await prisma.smsPhoneRegistration.update({
      where: { id: registration.id },
      data: {
        pinCode: hashedPin,
        pinExpiresAt,
        attempts: 0, // Сбрасываем попытки при новом PIN
      },
    });

    console.log('[SMS Phone Resend] Generated new PIN');

    // Отправка нового PIN через SMS
    const sendResult = await sendPinSms(registration.phone, newPin);

    if (!sendResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: sendResult.error || 'Failed to send SMS',
        },
        { status: 500 }
      );
    }

    console.log('[SMS Phone Resend] ✅ New PIN sent');

    return NextResponse.json({
      ok: true,
      message: 'New PIN sent successfully',
      expiresIn: 600, // 10 минут в секундах
    });
  } catch (error) {
    console.error('[SMS Phone Resend] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}