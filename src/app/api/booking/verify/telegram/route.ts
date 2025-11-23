// src/app/api/booking/verify/telegram/route.ts - PRODUCTION VERSION

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, saveOTP } from '@/lib/otp-store';
import axios from 'axios';

type SendCodeRequest = {
  email?: string;
  draftId?: string;
};

type SendCodeResponse = {
  ok: boolean;
  message?: string;
  error?: string;
  devCode?: string;
};

const BOT_URL = process.env.BOT_URL || 'http://localhost:3001';
const BOT_SECRET = process.env.BOT_SECRET || 'your-bot-secret-key';

export async function POST(
  req: NextRequest
): Promise<NextResponse<SendCodeResponse>> {
  try {
    const body = (await req.json()) as SendCodeRequest;
    const { email, draftId } = body;

    // Валидация
    if (!email || !draftId) {
      return NextResponse.json(
        { ok: false, error: 'Email и draftId обязательны' },
        { status: 400 }
      );
    }

    // Проверяем что черновик существует
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
      select: { id: true, email: true },
    });

    if (!draft) {
      return NextResponse.json(
        { ok: false, error: 'Черновик записи не найден' },
        { status: 404 }
      );
    }

    // Проверяем что email совпадает
    if (draft.email !== email) {
      return NextResponse.json(
        { ok: false, error: 'E-mail не совпадает с данными черновика' },
        { status: 400 }
      );
    }

    // Проверяем, есть ли у пользователя сохранённый Telegram chat ID
    const telegramUser = await prisma.telegramUser.findUnique({
      where: { email },
      select: { telegramChatId: true },
    });

    // Генерируем 6-значный OTP код
    const code = generateOTP();

    // Сохраняем в хранилище
    saveOTP('telegram', email, draftId, code, {
      ttlMinutes: 10,
    });

    console.log(`[Telegram OTP] Создан код для ${email}`);
    console.log(`[Telegram OTP] Код: ${code}`);

    // Если у пользователя есть сохранённый chat ID - отправляем напрямую
    if (telegramUser?.telegramChatId) {
      console.log(`[Telegram OTP] Пользователь зарегистрирован, отправка через webhook`);

      try {
        await axios.post(
          `${BOT_URL}/send-code`,
          {
            email,
            chatId: telegramUser.telegramChatId,
            code,
            draftId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${BOT_SECRET}`,
            },
            timeout: 10000,
          }
        );

        // В режиме разработки отправляем код в ответе
        if (process.env.NODE_ENV === 'development') {
          return NextResponse.json({
            ok: true,
            message: 'Код отправлен в Telegram',
            devCode: code, // ТОЛЬКО ДЛЯ РАЗРАБОТКИ
          });
        }

        return NextResponse.json({
          ok: true,
          message: 'Код отправлен в Telegram',
        });

      } catch (error) {
        console.error('[Telegram OTP] Ошибка отправки через webhook:', error);
        // Фоллбэк на deep link если webhook не сработал
      }
    }

    // Если пользователь не зарегистрирован - возвращаем deep link
    console.log(`[Telegram OTP] Пользователь не зарегистрирован, используем deep link`);

    const payload = Buffer.from(
      JSON.stringify({ draftId, email })
    ).toString('base64');

    const deepLink = `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${payload}`;

    // В режиме разработки отправляем код в ответе
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        ok: true,
        message: 'Deep link создан',
        deepLink,
        devCode: code, // ТОЛЬКО ДЛЯ РАЗРАБОТКИ
      });
    }

    return NextResponse.json({
      ok: true,
      message: 'Deep link создан',
      deepLink,
    });

  } catch (error) {
    console.error('[Telegram OTP Error]:', error);
    return NextResponse.json(
      { ok: false, error: 'Ошибка создания кода' },
      { status: 500 }
    );
  }
}

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
