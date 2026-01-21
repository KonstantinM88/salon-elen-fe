// src/app/api/booking/client/sms-phone/resend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePinCode, sendPinSms } from '@/lib/zadarma-sms';
import bcrypt from 'bcrypt';

const PIN_TTL_SECONDS = 10 * 60;  // 10 минут
const RESEND_COOLDOWN_SECONDS = 60; // 1 минута

function secondsLeft(now: Date, lastSentAt: Date, cooldownSeconds: number): number {
  const diffMs = now.getTime() - lastSentAt.getTime();
  const left = cooldownSeconds - Math.floor(diffMs / 1000);
  return left > 0 ? left : 0;
}

/**
 * POST /api/booking/client/sms-phone/resend
 * Повторная отправка PIN с защитой от спама (cooldown)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId } = body as { registrationId?: string };

    console.log('[SMS Phone Resend] Resending PIN for:', registrationId);

    if (!registrationId) {
      return NextResponse.json({ ok: false, error: 'Missing registrationId' }, { status: 400 });
    }

    const registration = await prisma.smsPhoneRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!registration) {
      return NextResponse.json({ ok: false, error: 'Registration request not found' }, { status: 404 });
    }

    const now = new Date();

    if (registration.expiresAt < now) {
      return NextResponse.json({ ok: false, error: 'Registration request expired' }, { status: 400 });
    }

    if (registration.verified) {
      return NextResponse.json({ ok: false, error: 'Registration already verified' }, { status: 400 });
    }

    // lastSentAt = pinExpiresAt - PIN_TTL
    const lastSentAt = new Date(registration.pinExpiresAt.getTime() - PIN_TTL_SECONDS * 1000);
    const left = secondsLeft(now, lastSentAt, RESEND_COOLDOWN_SECONDS);

    if (left > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Пожалуйста, подождите ${left} сек. перед повторной отправкой.`,
          cooldownSeconds: left,
        },
        { status: 429 }
      );
    }

    const newPin = generatePinCode();
    const hashedPin = await bcrypt.hash(newPin, 10);
    const pinExpiresAt = new Date(now.getTime() + PIN_TTL_SECONDS * 1000);

    await prisma.smsPhoneRegistration.update({
      where: { id: registration.id },
      data: {
        pinCode: hashedPin,
        pinExpiresAt,
        attempts: 0,
      },
    });

    const sendResult = await sendPinSms(registration.phone, newPin);

    if (!sendResult.success) {
      return NextResponse.json(
        { ok: false, error: 'Не удалось отправить SMS. Попробуйте позже.' },
        { status: 500 }
      );
    }

    console.log('[SMS Phone Resend] ✅ New PIN sent via Zadarma');

    return NextResponse.json({
      ok: true,
      message: 'New PIN sent successfully',
      expiresIn: PIN_TTL_SECONDS,
      cooldownSeconds: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error('[SMS Phone Resend] Error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}