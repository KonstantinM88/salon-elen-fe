// src/app/api/telegram/verify-code/route.ts
// ✅ ИСПРАВЛЕНО: Добавлено детальное логирование
// ✅ БЕЗ ANY: Все типы явно указаны

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhoneDigits } from '@/lib/phone';

interface VerifyCodeRequest {
  sessionId: string;
  code: string;
}

interface UserData {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  telegramUserId: number | null;
}

interface VerifyCodeResponse {
  success: boolean;
  verified: boolean;
  sessionId: string;
  message: string;
  userData: UserData | null;
}

type TelegramUserMatch = {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  telegramUserId: bigint | null;
  telegramChatId: bigint | null;
};

export async function POST(request: NextRequest) {
  console.log('=== [Verify Code] START ===');
  
  try {
    const body: VerifyCodeRequest = await request.json();
    const { sessionId, code } = body;

    console.log('[Verify Code] Request:', { sessionId, code });

    if (!sessionId || !code) {
      console.log('[Verify Code] ERROR: Missing data');
      return NextResponse.json(
        { error: 'Missing sessionId or code' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      console.log('[Verify Code] ERROR: Invalid code format');
      return NextResponse.json(
        { error: 'Code must be 6 digits' },
        { status: 400 }
      );
    }

    console.log('[Verify Code] Looking up verification...');
    
    const verification = await prisma.telegramVerification.findUnique({
      where: { sessionId },
    });

    if (!verification) {
      console.log('[Verify Code] ERROR: Session not found');
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('[Verify Code] Verification found:', {
      id: verification.id,
      phone: verification.phone,
      verified: verification.verified,
      expiresAt: verification.expiresAt,
    });

    if (new Date() > verification.expiresAt) {
      console.log('[Verify Code] ERROR: Code expired');
      return NextResponse.json(
        { error: 'Code expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (verification.verified) {
      console.log('[Verify Code] ERROR: Code already used');
      return NextResponse.json(
        { error: 'Code already used' },
        { status: 400 }
      );
    }

    if (verification.code !== code) {
      console.log('[Verify Code] ERROR: Invalid code. Expected:', verification.code, 'Got:', code);
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      );
    }

    console.log('[Verify Code] Code is valid, marking as verified...');

    const updated = await prisma.telegramVerification.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    console.log('[Verify Code] Checking for existing user...');

    let existingUser: TelegramUserMatch | null = null;

    if (verification.telegramUserId) {
      existingUser = await prisma.telegramUser.findUnique({
        where: { telegramUserId: verification.telegramUserId },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          telegramUserId: true,
          telegramChatId: true,
        },
      });
    }

    if (!existingUser) {
      const phoneDigits = normalizePhoneDigits(verification.phone);
      const matches = await prisma.telegramUser.findMany({
        where: { phone: { endsWith: phoneDigits } },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          telegramUserId: true,
          telegramChatId: true,
        },
      });

      if (matches.length === 1) {
        existingUser = matches[0];
      }
    }

    console.log('[Verify Code] Existing user:', existingUser);

    const userData: UserData | null =
      existingUser && existingUser.telegramUserId
        ? {
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            telegramUserId: Number(existingUser.telegramUserId),
          }
        : null;

    const hasUserData = Boolean(userData);

    console.log('[Verify Code] Has user data?', hasUserData);

    if (hasUserData) {
      console.log('[Verify Code] ✅ RETURNING WITH USER DATA - will auto-skip step 3');
    } else {
      console.log('[Verify Code] ✅ RETURNING WITHOUT USER DATA - will show step 3');
    }

    const response: VerifyCodeResponse = {
      success: true,
      verified: true,
      sessionId: updated.sessionId,
      message: 'Code verified successfully',
      userData,
    };

    console.log('[Verify Code] Response:', JSON.stringify(response, null, 2));
    console.log('=== [Verify Code] SUCCESS ===');

    return NextResponse.json(response);
  } catch (error) {
    console.error('=== [Verify Code] ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('=== [Verify Code] END (with error) ===');
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}





//-----------исправляем баг с получением данных пользователя после верификации------- 
// // src/app/api/telegram/verify-code/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { sessionId, code } = body;

//     // Валидация
//     if (!sessionId || !code) {
//       return NextResponse.json(
//         { error: 'Missing sessionId or code' },
//         { status: 400 }
//       );
//     }

//     // Валидация кода (6 цифр)
//     if (!/^\d{6}$/.test(code)) {
//       return NextResponse.json(
//         { error: 'Code must be 6 digits' },
//         { status: 400 }
//       );
//     }

//     // Найти верификацию
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     // Проверить истёк ли код
//     if (new Date() > verification.expiresAt) {
//       return NextResponse.json(
//         { error: 'Code expired. Please request a new one.' },
//         { status: 400 }
//       );
//     }

//     // Проверить уже ли верифицирован
//     if (verification.verified) {
//       return NextResponse.json(
//         { error: 'Code already used' },
//         { status: 400 }
//       );
//     }

//     // Проверить код
//     if (verification.code !== code) {
//       return NextResponse.json(
//         { error: 'Invalid code' },
//         { status: 400 }
//       );
//     }

//     // Пометить как верифицированный
//     const updated = await prisma.telegramVerification.update({
//       where: { id: verification.id },
//       data: {
//         verified: true,
//         // telegramUserId будет добавлен позже, когда получим от бота
//       },
//     });

//     // Проверить есть ли уже зарегистрированный пользователь
//     const existingUser = await prisma.telegramUser.findUnique({
//       where: { phone: verification.phone },
//       select: {
//         email: true,
//         firstName: true,
//         lastName: true,
//         telegramUserId: true,
//         telegramChatId: true,
//       },
//     });

//     // Если пользователь существует и у него есть email (не null)
//     const hasUserData = existingUser && existingUser.email;

//     return NextResponse.json({
//       success: true,
//       verified: true,
//       sessionId: updated.sessionId,
//       message: 'Code verified successfully',
//       // Данные пользователя если есть
//       userData: hasUserData ? {
//         email: existingUser.email,
//         firstName: existingUser.firstName,
//         lastName: existingUser.lastName,
//         telegramUserId: existingUser.telegramUserId ? Number(existingUser.telegramUserId) : null,
//       } : null,
//     });
//   } catch (error) {
//     console.error('Verify code error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }





//--------всё работает, дорабатываем автоматизацию------- 
// // src/app/api/telegram/verify-code/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { sessionId, code } = body;

//     // Валидация
//     if (!sessionId || !code) {
//       return NextResponse.json(
//         { error: 'Missing sessionId or code' },
//         { status: 400 }
//       );
//     }

//     // Валидация кода (6 цифр)
//     if (!/^\d{6}$/.test(code)) {
//       return NextResponse.json(
//         { error: 'Code must be 6 digits' },
//         { status: 400 }
//       );
//     }

//     // Найти верификацию
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     // Проверить истёк ли код
//     if (new Date() > verification.expiresAt) {
//       return NextResponse.json(
//         { error: 'Code expired. Please request a new one.' },
//         { status: 400 }
//       );
//     }

//     // Проверить уже ли верифицирован
//     if (verification.verified) {
//       return NextResponse.json(
//         { error: 'Code already used' },
//         { status: 400 }
//       );
//     }

//     // Проверить код
//     if (verification.code !== code) {
//       return NextResponse.json(
//         { error: 'Invalid code' },
//         { status: 400 }
//       );
//     }

//     // Пометить как верифицированный
//     const updated = await prisma.telegramVerification.update({
//       where: { id: verification.id },
//       data: {
//         verified: true,
//         // telegramUserId будет добавлен позже, когда получим от бота
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       verified: true,
//       sessionId: updated.sessionId,
//       message: 'Code verified successfully',
//     });
//   } catch (error) {
//     console.error('Verify code error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
