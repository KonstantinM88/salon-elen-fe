// src/app/api/telegram/send-code/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, serviceId, masterId, startAt, endAt } = body;

    console.log('[Telegram Send Code] Request:', { phone, serviceId, masterId, startAt, endAt });

    // Валидация
    if (!phone || !serviceId || !masterId || !startAt || !endAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Валидация телефона (базовая)
    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(phone)) {
      console.log('[Telegram Send Code] Invalid phone format:', phone);
      return NextResponse.json(
        { error: 'Invalid phone format. Use format: +4917789951064' },
        { status: 400 }
      );
    }

    // Генерация 6-значного кода
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Генерация уникального sessionId
    const sessionId = crypto.randomUUID();

    console.log('[Telegram Send Code] Generated:', { code, sessionId });

    // Срок действия кода - 10 минут
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Удалить старые неверифицированные записи для этого телефона
    await prisma.telegramVerification.deleteMany({
      where: {
        phone,
        verified: false,
        expiresAt: { lt: new Date() }, // Только истёкшие
      },
    });

    console.log('[Telegram Send Code] Creating verification with data:', {
      phone,
      code,
      sessionId,
      serviceId,
      masterId,
      startAt,
      endAt,
      expiresAt,
      verified: false,
    });

    // Создать новую верификацию
    const verification = await prisma.telegramVerification.create({
      data: {
        phone,
        code,
        sessionId,
        serviceId,
        masterId,
        startAt,
        endAt,
        expiresAt,
        verified: false,
      },
    });

    console.log('[Telegram Send Code] Verification created:', verification.id);

    // Отправить код в Telegram через webhook
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
      console.log('[Telegram Send Code] Sending to Telegram via webhook');
      const response = await fetch(`${baseUrl}/api/telegram/webhook?phone=${encodeURIComponent(phone)}&code=${code}`);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('[Telegram Send Code] Telegram webhook error:', data);
      } else {
        console.log('[Telegram Send Code] Code sent to Telegram successfully');
      }
    } catch (telegramError) {
      console.error('[Telegram Send Code] Telegram webhook error:', telegramError);
      // Продолжаем, даже если Telegram не ответил
    }

    console.log('[Telegram Send Code] Success:', {
      sessionId: verification.sessionId,
      expiresAt: verification.expiresAt,
    });

    return NextResponse.json({
      success: true,
      sessionId: verification.sessionId,
      expiresAt: verification.expiresAt,
      message: 'Code sent to Telegram',
    });
  } catch (error) {
    console.error('[Telegram Send Code] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}





//-----------новая версия--------
// // src/app/api/telegram/send-code/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { phone, serviceId, masterId, startAt, endAt } = body;

//     console.log('[Telegram Send Code] Request:', { phone, serviceId, masterId, startAt, endAt });

//     // Валидация
//     if (!phone || !serviceId || !masterId || !startAt || !endAt) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Валидация телефона (базовая)
//     const phoneRegex = /^\+\d{10,15}$/;
//     if (!phoneRegex.test(phone)) {
//       console.log('[Telegram Send Code] Invalid phone format:', phone);
//       return NextResponse.json(
//         { error: 'Invalid phone format. Use format: +4917789951064' },
//         { status: 400 }
//       );
//     }

//     // Генерация 6-значного кода
//     const code = Math.floor(100000 + Math.random() * 900000).toString();

//     // Генерация уникального sessionId
//     const sessionId = crypto.randomUUID();

//     console.log('[Telegram Send Code] Generated:', { code, sessionId });

//     // Срок действия кода - 10 минут
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     // Удалить старые неверифицированные записи для этого телефона
//     await prisma.telegramVerification.deleteMany({
//       where: {
//         phone,
//         verified: false,
//         expiresAt: { lt: new Date() }, // Только истёкшие
//       },
//     });

//     console.log('[Telegram Send Code] Creating verification with data:', {
//       phone,
//       code,
//       sessionId,
//       serviceId,
//       masterId,
//       startAt,
//       endAt,
//       expiresAt,
//       verified: false,
//     });

//     // Создать новую верификацию
//     const verification = await prisma.telegramVerification.create({
//       data: {
//         phone,
//         code,
//         sessionId,
//         serviceId,
//         masterId,
//         startAt,
//         endAt,
//         expiresAt,
//         verified: false,
//       },
//     });

//     console.log('[Telegram Send Code] Verification created:', verification.id);

//     // TODO: Отправить код в Telegram бот
//     // Здесь будет вызов API Telegram бота
//     const telegramBotUrl = process.env.TELEGRAM_BOT_URL;
    
//     if (telegramBotUrl) {
//       try {
//         console.log('[Telegram Send Code] Sending to bot:', telegramBotUrl);
//         await fetch(`${telegramBotUrl}/send-code`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ phone, code }),
//         });
//       } catch (telegramError) {
//         console.error('[Telegram Send Code] Telegram bot error:', telegramError);
//         // Продолжаем, даже если бот не ответил
//       }
//     }

//     console.log('[Telegram Send Code] Success:', {
//       sessionId: verification.sessionId,
//       expiresAt: verification.expiresAt,
//     });

//     return NextResponse.json({
//       success: true,
//       sessionId: verification.sessionId,
//       expiresAt: verification.expiresAt,
//       message: 'Code sent to Telegram',
//     });
//   } catch (error) {
//     console.error('[Telegram Send Code] Error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }