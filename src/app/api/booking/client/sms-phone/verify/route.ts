// src/app/api/booking/client/sms-phone/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

/**
 * POST /api/booking/client/sms-phone/verify
 * 
 * Проверяет PIN код
 * После успешной верификации НЕ создаёт appointment
 * Возвращает registrationId для перехода на страницу ввода данных
 */

const MAX_ATTEMPTS = 3; // Максимум 3 попытки

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId, pin } = body;

    console.log('[SMS Phone Verify] Verifying PIN for:', registrationId);

    // Валидация входных данных
    if (!registrationId || !pin) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Поиск registration request
    const registration = await prisma.smsPhoneRegistration.findUnique({
      where: { id: registrationId },
      include: {
        service: true,
        master: true,
      },
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

    // Проверка истечения срока действия PIN
    if (registration.pinExpiresAt < now) {
      return NextResponse.json(
        { ok: false, error: 'PIN expired. Request a new one.' },
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

    // Проверка количества попыток
    if (registration.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Maximum attempts reached. Request a new PIN.',
        },
        { status: 400 }
      );
    }

    // Увеличиваем счётчик попыток
    await prisma.smsPhoneRegistration.update({
      where: { id: registration.id },
      data: {
        attempts: registration.attempts + 1,
      },
    });

    // Проверка PIN
    const pinMatches = await bcrypt.compare(pin, registration.pinCode);
    
    if (!pinMatches) {
      const attemptsLeft = MAX_ATTEMPTS - (registration.attempts + 1);
      console.log('[SMS Phone Verify] ❌ Invalid PIN');
      
      return NextResponse.json(
        {
          ok: false,
          error: attemptsLeft > 0 
            ? `Invalid PIN. ${attemptsLeft} attempts remaining.`
            : 'Invalid PIN. Maximum attempts reached. Request a new PIN.',
        },
        { status: 400 }
      );
    }

    console.log('[SMS Phone Verify] ✅ PIN verified');

    // Обновляем registration как verified
    // НО НЕ создаём appointment - это сделаем после ввода данных
    await prisma.smsPhoneRegistration.update({
      where: { id: registration.id },
      data: {
        verified: true,
      },
    });

    console.log('[SMS Phone Verify] ✅ Registration marked as verified');

    // Возвращаем registrationId для перехода на страницу ввода данных
    return NextResponse.json({
      ok: true,
      verified: true,
      registrationId: registration.id,
    });
  } catch (error) {
    console.error('[SMS Phone Verify] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}