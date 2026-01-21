// src/app/api/telegram/verify-code-draft/route.ts
// ✅ По аналогии с verify-code/route.ts
// ✅ БЕЗ any - явная типизация tx
// ✅ БЕЗ обновления TelegramUser.email (вызывает конфликт)
// ✅ БЕЗ отправки уведомления - оно отправится после оплаты
// ✅ ДОБАВЛЕНО: Автоматическое создание клиентов

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhoneDigits } from '@/lib/phone';

interface VerifyCodeDraftRequest {
  sessionId: string;
  code: string;
  draftId: string;
}

// ✅ Определяем тип транзакции Prisma
type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

type TelegramUserMatch = {
  firstName: string | null;
  lastName: string | null;
};

export async function POST(request: NextRequest) {
  console.log('=== [Telegram Verify Code Draft] START ===');
  
  try {
    const body: VerifyCodeDraftRequest = await request.json();
    const { sessionId, code, draftId } = body;

    console.log('[Telegram Verify Code Draft] Request:', { sessionId, code, draftId });

    if (!sessionId || !code || !draftId) {
      console.log('[Telegram Verify Code Draft] ERROR: Missing fields');
      return NextResponse.json(
        { error: 'Missing sessionId, code, or draftId' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      console.log('[Telegram Verify Code Draft] ERROR: Invalid code format');
      return NextResponse.json(
        { error: 'Code must be 6 digits' },
        { status: 400 }
      );
    }

    console.log('[Telegram Verify Code Draft] Looking up verification...');
    
    const verification = await prisma.telegramVerification.findUnique({
      where: { sessionId },
    });

    if (!verification) {
      console.log('[Telegram Verify Code Draft] ERROR: Session not found');
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('[Telegram Verify Code Draft] Verification found:', {
      id: verification.id,
      phone: verification.phone,
      verified: verification.verified,
      expiresAt: verification.expiresAt,
    });

    if (new Date() > verification.expiresAt) {
      console.log('[Telegram Verify Code Draft] ERROR: Code expired');
      return NextResponse.json(
        { error: 'Code expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (verification.verified) {
      console.log('[Telegram Verify Code Draft] ERROR: Code already used');
      return NextResponse.json(
        { error: 'Code already used' },
        { status: 400 }
      );
    }

    if (verification.code !== code) {
      console.log('[Telegram Verify Code Draft] ERROR: Invalid code. Expected:', verification.code, 'Got:', code);
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      );
    }

    console.log('[Telegram Verify Code Draft] Code is valid!');

    // Загрузить BookingDraft
    console.log('[Telegram Verify Code Draft] Loading draft:', draftId);
    
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      console.log('[Telegram Verify Code Draft] ERROR: Draft not found');
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    console.log('[Telegram Verify Code Draft] Draft loaded:', {
      customerName: draft.customerName,
      email: draft.email,
    });

    // Получить данные пользователя из TelegramUser
    let telegramUser: TelegramUserMatch | null = null;

    if (verification.telegramUserId) {
      telegramUser = await prisma.telegramUser.findUnique({
        where: { telegramUserId: verification.telegramUserId },
        select: {
          firstName: true,
          lastName: true,
        },
      });
    }

    if (!telegramUser) {
      const phoneDigits = normalizePhoneDigits(verification.phone);
      const matches = await prisma.telegramUser.findMany({
        where: { phone: { endsWith: phoneDigits } },
        select: {
          firstName: true,
          lastName: true,
        },
      });

      if (matches.length === 1) {
        telegramUser = matches[0];
      }
    }

    console.log('[Telegram Verify Code Draft] Telegram user:', telegramUser);

    // Определяем customerName с приоритетом
    let customerName = draft.customerName;
    
    if (telegramUser && telegramUser.firstName) {
      customerName = telegramUser.lastName 
        ? `${telegramUser.firstName} ${telegramUser.lastName}`.trim()
        : telegramUser.firstName;
      console.log('[Telegram Verify Code Draft] Using name from TelegramUser:', customerName);
    }

    // Финальные данные
    const finalEmail = verification.email || draft.email;
    const finalBirthDate = verification.birthDate || draft.birthDate;

    console.log('[Telegram Verify Code Draft] Creating appointment...');

    // ✅ ПРОСТАЯ ТРАНЗАКЦИЯ - с явной типизацией tx
    // ✅ БЕЗ обновления TelegramUser.email (вызывает конфликт)
    const appointment = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Обновить verification
      await tx.telegramVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      });

      console.log('[Telegram Verify Code Draft] Transaction: Creating appointment...');

      // ✅ СОЗДАНИЕ/ПОИСК КЛИЕНТА
      const phoneStr = verification.phone.trim();
      const emailStr = finalEmail ? finalEmail.trim() : '';

      let clientId: string | null = null;

      // Ищем существующего клиента
      if (phoneStr || emailStr) {
        console.log('[Telegram Verify Code Draft] Transaction: Looking for existing client...');
        const existing = await tx.client.findFirst({
          where: {
            OR: [
              ...(phoneStr ? [{ phone: phoneStr }] : []),
              ...(emailStr ? [{ email: emailStr }] : []),
            ],
          },
          select: { id: true, birthDate: true },
        });

        if (existing) {
          clientId = existing.id;
          console.log('[Telegram Verify Code Draft] Transaction: Found existing client:', clientId);
          
          // ✅ ИСПРАВЛЕНИЕ: Обновляем дату рождения, если она изменилась
          if (finalBirthDate) {
            const newBirthDate = finalBirthDate instanceof Date ? finalBirthDate : new Date(finalBirthDate);
            const existingBirthDate = existing.birthDate;
            
            // Сравниваем даты (только yyyy-mm-dd, игнорируем время)
            const newDateStr = newBirthDate.toISOString().split('T')[0];
            const existingDateStr = existingBirthDate ? existingBirthDate.toISOString().split('T')[0] : null;
            
            if (newDateStr !== existingDateStr) {
              await tx.client.update({
                where: { id: existing.id },
                data: { birthDate: newBirthDate },
              });
              console.log('[Telegram Verify Code Draft] Transaction: Updated client birthDate:', newDateStr);
            }
          }
        }
      }

      // Если не нашли - создаём нового
      if (!clientId && (phoneStr || emailStr)) {
        console.log('[Telegram Verify Code Draft] Transaction: Creating new client...');
        const newClient = await tx.client.create({
          data: {
            name: customerName,
            phone: phoneStr,
            email: emailStr,
            birthDate: finalBirthDate || new Date('1990-01-01'),
            referral: draft.referral || null,
          },
          select: { id: true },
        });

        clientId = newClient.id;
        console.log('[Telegram Verify Code Draft] Transaction: Created new client:', clientId);
      }

      // Создать Appointment из Draft
      const newAppointment = await tx.appointment.create({
        data: {
          serviceId: draft.serviceId,
          clientId,  // ✅ Связь с клиентом!
          masterId: draft.masterId,
          startAt: draft.startAt,
          endAt: draft.endAt,
          customerName: customerName,
          phone: verification.phone,
          email: finalEmail || null,
          birthDate: finalBirthDate || null,
          notes: draft.notes || null,
          referral: draft.referral || null,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        },
      });

      console.log('[Telegram Verify Code Draft] Transaction: Appointment created:', newAppointment.id);

      // Связать verification с appointment
      await tx.telegramVerification.update({
        where: { id: verification.id },
        data: { appointmentId: newAppointment.id },
      });

      return newAppointment;
    });

    console.log('[Telegram Verify Code Draft] Transaction completed!');
    console.log('[Telegram Verify Code Draft] SUCCESS');

    return NextResponse.json({
      success: true,
      verified: true,
      appointmentId: appointment.id,
      message: 'Code verified and appointment created',
    });
  } catch (error) {
    console.error('=== [Telegram Verify Code Draft] ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}