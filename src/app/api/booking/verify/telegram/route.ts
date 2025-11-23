// src/app/api/booking/verify/telegram/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  saveOTP,
  OTPMethod,
} from '@/lib/otp-store';
import crypto from 'crypto';

type VerifyRequest = {
  email?: string;
  draftId?: string;
};

type VerifyResponse =
  | {
      ok: true;
      message: string;
      method: 'registered' | 'deep_link';
      deepLink?: string;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Генерирует 6-значный OTP код
 */
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * POST /api/booking/verify/telegram
 * 
 * Генерирует OTP код для Telegram и возвращает:
 * - deep link (если пользователь не зарегистрирован)
 * - или отправляет код через бота (если зарегистрирован)
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<VerifyResponse>> {
  try {
    const body = (await req.json()) as VerifyRequest;
    const { email, draftId } = body;

    // Валидация
    if (!email || !draftId) {
      return NextResponse.json(
        { ok: false, error: 'Email и draftId обязательны' },
        { status: 400 }
      );
    }

    // Проверяем что draft существует
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
      select: { id: true, email: true },
    });

    if (!draft || draft.email !== email) {
      return NextResponse.json(
        { ok: false, error: 'Черновик не найден или email не совпадает' },
        { status: 404 }
      );
    }

    // Генерируем OTP код
    const code = generateOTP();

    // Сохраняем в memory store
    saveOTP('telegram' as OTPMethod, email, draftId, code);

    console.log(`[OTP Store] Сохранён telegram код для ${email}:${draftId}`);
    console.log(`[Telegram OTP] Создан код для ${email}`);
    console.log(`[Telegram OTP] Код: ${code}`);

    // Проверяем зарегистрирован ли пользователь в Telegram
    const telegramUser = await prisma.telegramUser.findUnique({
      where: { email },
      select: { id: true, telegramChatId: true },
    });

    if (telegramUser) {
      // ✅ Пользователь зарегистрирован - отправляем через бота
      console.log(`[Telegram OTP] Пользователь зарегистрирован, отправляем через бота`);

      try {
        const BOT_SECRET = process.env.BOT_SECRET || 'your-bot-secret-key';
        const BOT_URL = process.env.BOT_URL || 'http://localhost:3001';

        const response = await fetch(`${BOT_URL}/send-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BOT_SECRET}`,
          },
          body: JSON.stringify({
            email,
            chatId: Number(telegramUser.telegramChatId),
            code,
            draftId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Bot API error: ${response.status}`);
        }

        console.log(`[Telegram OTP] Код отправлен через бота`);

        return NextResponse.json({
          ok: true,
          message: 'Код отправлен в Telegram',
          method: 'registered',
        });
      } catch (error) {
        console.error('[Telegram OTP] Ошибка отправки через бота:', error);
        
        // Fallback: вернём deep link
        const shortPayload = {
          d: draftId,  // ✅ Короткий ключ
        };

        const encodedPayload = Buffer.from(JSON.stringify(shortPayload)).toString('base64');
        const deepLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${encodedPayload}`;

        console.log(`[Telegram OTP] Fallback - используем deep link`);
        console.log(`[Telegram OTP] Deep link длина: ${encodedPayload.length} символов`);

        return NextResponse.json({
          ok: true,
          message: 'Откройте Telegram для получения кода',
          method: 'deep_link',
          deepLink,
        });
      }
    } else {
      // ❌ Пользователь НЕ зарегистрирован - возвращаем deep link
      console.log(`[Telegram OTP] Пользователь не зарегистрирован, используем deep link`);

      // ✅ ИСПРАВЛЕНО: Короткий payload (только draftId)
      const shortPayload = {
        d: draftId,  // Используем короткий ключ 'd' вместо 'draftId'
      };

      const encodedPayload = Buffer.from(JSON.stringify(shortPayload)).toString('base64');
      
      console.log(`[Telegram OTP] Payload: ${JSON.stringify(shortPayload)}`);
      console.log(`[Telegram OTP] Encoded (base64): ${encodedPayload}`);
      console.log(`[Telegram OTP] Длина payload: ${encodedPayload.length} символов`);

      if (encodedPayload.length > 64) {
        console.error(`[Telegram OTP] ⚠️ ПРЕДУПРЕЖДЕНИЕ: Payload слишком длинный (${encodedPayload.length} > 64)!`);
      }

      const deepLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${encodedPayload}`;

      console.log(`[Telegram OTP] Deep link создан: ${deepLink}`);

      return NextResponse.json({
        ok: true,
        message: 'Откройте Telegram для регистрации и получения кода',
        method: 'deep_link',
        deepLink,
      });
    }
  } catch (error) {
    console.error('[Telegram OTP Error]:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Ошибка создания кода верификации';

    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}



// // src/app/api/booking/verify/telegram/route.ts - PRODUCTION VERSION

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { generateOTP, saveOTP } from '@/lib/otp-store';
// import axios from 'axios';

// type SendCodeRequest = {
//   email?: string;
//   draftId?: string;
// };

// type SendCodeResponse = {
//   ok: boolean;
//   message?: string;
//   error?: string;
//   devCode?: string;
// };

// const BOT_URL = process.env.BOT_URL || 'http://localhost:3001';
// const BOT_SECRET = process.env.BOT_SECRET || 'your-bot-secret-key';

// export async function POST(
//   req: NextRequest
// ): Promise<NextResponse<SendCodeResponse>> {
//   try {
//     const body = (await req.json()) as SendCodeRequest;
//     const { email, draftId } = body;

//     // Валидация
//     if (!email || !draftId) {
//       return NextResponse.json(
//         { ok: false, error: 'Email и draftId обязательны' },
//         { status: 400 }
//       );
//     }

//     // Проверяем что черновик существует
//     const draft = await prisma.bookingDraft.findUnique({
//       where: { id: draftId },
//       select: { id: true, email: true },
//     });

//     if (!draft) {
//       return NextResponse.json(
//         { ok: false, error: 'Черновик записи не найден' },
//         { status: 404 }
//       );
//     }

//     // Проверяем что email совпадает
//     if (draft.email !== email) {
//       return NextResponse.json(
//         { ok: false, error: 'E-mail не совпадает с данными черновика' },
//         { status: 400 }
//       );
//     }

//     // Проверяем, есть ли у пользователя сохранённый Telegram chat ID
//     const telegramUser = await prisma.telegramUser.findUnique({
//       where: { email },
//       select: { telegramChatId: true },
//     });

//     // Генерируем 6-значный OTP код
//     const code = generateOTP();

//     // Сохраняем в хранилище
//     saveOTP('telegram', email, draftId, code, {
//       ttlMinutes: 10,
//     });

//     console.log(`[Telegram OTP] Создан код для ${email}`);
//     console.log(`[Telegram OTP] Код: ${code}`);

//     // Если у пользователя есть сохранённый chat ID - отправляем напрямую
//     if (telegramUser?.telegramChatId) {
//       console.log(`[Telegram OTP] Пользователь зарегистрирован, отправка через webhook`);

//       try {
//         await axios.post(
//           `${BOT_URL}/send-code`,
//           {
//             email,
//             chatId: telegramUser.telegramChatId,
//             code,
//             draftId,
//           },
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               'Authorization': `Bearer ${BOT_SECRET}`,
//             },
//             timeout: 10000,
//           }
//         );

//         // В режиме разработки отправляем код в ответе
//         if (process.env.NODE_ENV === 'development') {
//           return NextResponse.json({
//             ok: true,
//             message: 'Код отправлен в Telegram',
//             devCode: code, // ТОЛЬКО ДЛЯ РАЗРАБОТКИ
//           });
//         }

//         return NextResponse.json({
//           ok: true,
//           message: 'Код отправлен в Telegram',
//         });

//       } catch (error) {
//         console.error('[Telegram OTP] Ошибка отправки через webhook:', error);
//         // Фоллбэк на deep link если webhook не сработал
//       }
//     }

//     // Если пользователь не зарегистрирован - возвращаем deep link
//     console.log(`[Telegram OTP] Пользователь не зарегистрирован, используем deep link`);

//     const payload = Buffer.from(
//       JSON.stringify({ draftId, email })
//     ).toString('base64');

//     const deepLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${payload}`;

//     // В режиме разработки отправляем код в ответе
//     if (process.env.NODE_ENV === 'development') {
//       return NextResponse.json({
//         ok: true,
//         message: 'Deep link создан',
//         deepLink,
//         devCode: code, // ТОЛЬКО ДЛЯ РАЗРАБОТКИ
//       });
//     }

//     return NextResponse.json({
//       ok: true,
//       message: 'Deep link создан',
//       deepLink,
//     });

//   } catch (error) {
//     console.error('[Telegram OTP Error]:', error);
//     return NextResponse.json(
//       { ok: false, error: 'Ошибка создания кода' },
//       { status: 500 }
//     );
//   }
// }

// // src/app/api/booking/verify/telegram/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { generateOTP, saveOTP } from '@/lib/otp-store';
// import { generateTelegramDeepLink } from '@/lib/telegram-crypto';

// type SendCodeRequest = {
//   email?: string;
//   draftId?: string;
// };

// type SendCodeResponse = {
//   ok: boolean;
//   message?: string;
//   deepLink?: string;
//   devCode?: string;
//   error?: string;
// };

// export async function POST(
//   req: NextRequest
// ): Promise<NextResponse<SendCodeResponse>> {
//   try {
//     const body = (await req.json()) as SendCodeRequest;
//     const { email, draftId } = body;

//     // Валидация
//     if (!email || !draftId) {
//       return NextResponse.json(
//         { ok: false, error: 'Email и draftId обязательны' },
//         { status: 400 }
//       );
//     }

//     // Проверяем что черновик существует
//     const draft = await prisma.bookingDraft.findUnique({
//       where: { id: draftId },
//       select: { id: true, email: true },
//     });

//     if (!draft) {
//       return NextResponse.json(
//         { ok: false, error: 'Черновик записи не найден' },
//         { status: 404 }
//       );
//     }

//     // Проверяем что email совпадает
//     if (draft.email !== email) {
//       return NextResponse.json(
//         { ok: false, error: 'E-mail не совпадает с данными черновика' },
//         { status: 400 }
//       );
//     }

//     // Генерируем 6-значный OTP код
//     const code = generateOTP();

//     // Сохраняем в хранилище (без telegramUserId, так как пользователь ещё не открыл бота)
//     saveOTP('telegram', email, draftId, code, {
//       ttlMinutes: 10,
//     });

//     // Генерируем зашифрованный deep link
//     const deepLink = generateTelegramDeepLink(draftId, email);

//     console.log(`[Telegram OTP] Создан deep link для ${email}`);
//     console.log(`[Telegram OTP] Код: ${code}`);

//     // В режиме разработки отправляем код в ответе
//     if (process.env.NODE_ENV === 'development') {
//       return NextResponse.json({
//         ok: true,
//         message: 'Deep link создан',
//         deepLink,
//         devCode: code, // ТОЛЬКО ДЛЯ РАЗРАБОТКИ
//       });
//     }

//     return NextResponse.json({
//       ok: true,
//       message: 'Deep link создан',
//       deepLink,
//     });
//   } catch (error) {
//     console.error('[Telegram OTP Error]:', error);
//     return NextResponse.json(
//       { ok: false, error: 'Ошибка создания deep link' },
//       { status: 500 }
//     );
//   }
// }
