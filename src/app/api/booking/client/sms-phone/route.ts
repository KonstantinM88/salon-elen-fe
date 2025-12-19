// src/app/api/booking/client/sms-phone/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generatePinCode,
  sendPinSms,
  formatPhoneForInfobip,
  validatePhoneNumber,
} from '@/lib/infobip-sms';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * POST /api/booking/client/sms-phone
 * 
 * Инициализация регистрации через SMS
 * Генерирует PIN, хеширует, сохраняет в БД, отправляет SMS
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, masterId, startAt, endAt, phone } = body;

    console.log('[SMS Phone Reg] Initiating registration:', {
      serviceId,
      masterId,
      phone: phone?.substring(0, 5) + '***',
    });

    // Валидация входных данных
    if (!serviceId || !masterId || !startAt || !endAt || !phone) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Валидация номера телефона
    const formattedPhone = formatPhoneForInfobip(phone);
    const phoneValidation = validatePhoneNumber(formattedPhone);
    
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { ok: false, error: phoneValidation.error || 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Проверка существования service и master
    const [service, master] = await Promise.all([
      prisma.service.findFirst({
        where: { id: serviceId, isActive: true, isArchived: false },
      }),
      prisma.master.findUnique({
        where: { id: masterId },
      }),
    ]);

    if (!service) {
      return NextResponse.json(
        { ok: false, error: 'Service not found or inactive' },
        { status: 404 }
      );
    }

    if (!master) {
      return NextResponse.json(
        { ok: false, error: 'Master not found' },
        { status: 404 }
      );
    }

    // Удаляем старые неподтверждённые записи для этого телефона
    await prisma.smsPhoneRegistration.deleteMany({
      where: {
        phone: formattedPhone,
        verified: false,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Генерация PIN и state
    const pin = generatePinCode(); // 4 цифры
    const state = crypto.randomBytes(32).toString('hex');
    
    // Хешируем PIN для безопасного хранения
    const hashedPin = await bcrypt.hash(pin, 10);
    
    const now = new Date();
    const pinExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 минут
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 минут
    
    // Создаём запись в БД
    const registration = await prisma.smsPhoneRegistration.create({
      data: {
        state,
        phone: formattedPhone,
        pinCode: hashedPin,
        pinExpiresAt,
        serviceId,
        masterId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        expiresAt,
      },
    });

    console.log('[SMS Phone Reg] Registration created:', registration.id);

    // Отправка SMS с PIN
    const sendResult = await sendPinSms(formattedPhone, pin);

    if (!sendResult.success) {
      // Если не удалось отправить SMS, удаляем запись
      await prisma.smsPhoneRegistration.delete({
        where: { id: registration.id },
      });

      return NextResponse.json(
        {
          ok: false,
          error: sendResult.error || 'Failed to send SMS',
        },
        { status: 500 }
      );
    }

    console.log('[SMS Phone Reg] ✅ SMS sent successfully');

    return NextResponse.json({
      ok: true,
      registrationId: registration.id,
      phone: formattedPhone,
      expiresIn: 600, // 10 минут в секундах
    });
  } catch (error) {
    console.error('[SMS Phone Reg] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}