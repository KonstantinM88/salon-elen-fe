// src/app/api/booking/verify/email/route.ts
/**
 * API для отправки OTP кода верификации на email при бронировании
 * Использует Resend вместо nodemailer
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, saveOTP, OTPMethod } from '@/lib/otp-store';
import { sendOTPEmail } from '@/lib/email-otp';

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

    // Генерируем 6-значный OTP код
    const code = generateOTP();

    // Сохраняем в хранилище
    saveOTP('email' as OTPMethod, email, draftId, code, {
      ttlMinutes: 10,
    });

    console.log(`[Email OTP] Создан код для ${email}`);
    console.log(`[Email OTP] Код: ${code}`);

    // Отправляем email через Resend
    const sendResult = await sendOTPEmail(email, code, {
      expiryMinutes: 10,
      subject: 'Код подтверждения записи - Salon Elen',
    });

    if (!sendResult.ok) {
      console.error(`[Email OTP] Ошибка отправки: ${sendResult.error}`);
      return NextResponse.json(
        { ok: false, error: 'Ошибка отправки кода на email' },
        { status: 500 }
      );
    }

    console.log(`[Email OTP] Код отправлен на ${email}`);

    // В режиме разработки отправляем код в ответе
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        ok: true,
        message: 'Код отправлен на email',
        devCode: code, // ТОЛЬКО ДЛЯ РАЗРАБОТКИ
      });
    }

    return NextResponse.json({
      ok: true,
      message: 'Код отправлен на email',
    });
  } catch (error) {
    console.error('[Email OTP Error]:', error);
    return NextResponse.json(
      { ok: false, error: 'Ошибка отправки кода' },
      { status: 500 }
    );
  }
}








//-------------переходим на продакшенный код--------------
// // src/app/api/booking/verify/email/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { generateOTP, saveOTP, OTPMethod } from '@/lib/otp-store';
// import nodemailer from 'nodemailer';

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

// async function sendOTPEmail(email: string, code: string): Promise<void> {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT),
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: process.env.SMTP_FROM || process.env.SMTP_USER,
//     to: email,
//     subject: 'Код подтверждения записи - Salon Elen',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #d4af37;">Подтверждение записи</h2>
//         <p>Ваш код подтверждения:</p>
//         <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
//           ${code}
//         </div>
//         <p style="color: #666;">Код действителен в течение 10 минут.</p>
//         <p style="color: #666;">Если вы не оформляли запись, просто проигнорируйте это письмо.</p>
//         <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
//         <p style="color: #999; font-size: 12px;">Salon Elen - Салон красоты</p>
//       </div>
//     `,
//   });
// }

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

//     // Сохраняем в хранилище
//     saveOTP('email' as OTPMethod, email, draftId, code, {
//       ttlMinutes: 10,
//     });

//     console.log(`[Email OTP] Создан код для ${email}`);
//     console.log(`[Email OTP] Код: ${code}`);

//     // Отправляем email
//     await sendOTPEmail(email, code);

//     console.log(`[Email OTP] Код отправлен на ${email}`);

//     // В режиме разработки отправляем код в ответе
//     if (process.env.NODE_ENV === 'development') {
//       return NextResponse.json({
//         ok: true,
//         message: 'Код отправлен на email',
//         devCode: code, // ТОЛЬКО ДЛЯ РАЗРАБОТКИ
//       });
//     }

//     return NextResponse.json({
//       ok: true,
//       message: 'Код отправлен на email',
//     });
//   } catch (error) {
//     console.error('[Email OTP Error]:', error);
//     return NextResponse.json(
//       { ok: false, error: 'Ошибка отправки кода' },
//       { status: 500 }
//     );
//   }
// }
