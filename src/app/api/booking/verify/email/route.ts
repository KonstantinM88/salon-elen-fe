// src/app/api/booking/verify/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// ✅ ГЛОБАЛЬНОЕ хранилище OTP (общее для всех запросов)
// В продакшене использовать Redis
declare global {
  // eslint-disable-next-line no-var
  var otpStore:
    | Map<string, { code: string; expiresAt: number }>
    | undefined;
}

global.otpStore =
  global.otpStore ||
  new Map<string, { code: string; expiresAt: number }>();
const otpStore = global.otpStore;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email: string, code: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Код подтверждения - Salon Elen',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Код подтверждения</h1>
        <p>Ваш код для подтверждения записи в Salon Elen:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h2 style="font-size: 36px; font-family: monospace; letter-spacing: 8px; margin: 0;">${code}</h2>
        </div>
        <p style="color: #666;">Код действует 10 минут.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
      </div>
    `,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, draftId } = body as {
      email?: string;
      draftId?: string;
    };

    if (!email || !draftId) {
      return NextResponse.json(
        { error: 'Email и draftId обязательны' },
        { status: 400 }
      );
    }

    // 🔄 Теперь проверяем ЧЕРНОВИК, а не реальный appointment
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
      select: { id: true, email: true },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'Черновик записи не найден' },
        { status: 404 }
      );
    }

    // Дополнительно проверим, что email совпадает с тем, что в черновике
    if (draft.email !== email) {
      return NextResponse.json(
        { error: 'E-mail не совпадает с данными черновика' },
        { status: 400 }
      );
    }

    // Генерируем 6-значный код
    const code = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 минут

    // Сохраняем в ГЛОБАЛЬНОЕ хранилище (ключ: email+draftId)
    const key = `${email}:${draftId}`;
    otpStore.set(key, { code, expiresAt });

    console.log(`[OTP Store] Сохранён код для ${key}: ${code}`);
    console.log(
      `[OTP Store] Текущие коды:`,
      Array.from(otpStore.keys())
    );

    // Отправляем email через SMTP (Mailtrap / прод)
    try {
      await sendOTPEmail(email, code);
      console.log(
        `[OTP] Код для ${email}: ${code} (отправлен через SMTP)`
      );
    } catch (emailError) {
      console.error('[OTP] Ошибка отправки email:', emailError);
      // Всё равно возвращаем успех, чтобы код работал в dev
      console.log(`[OTP] Dev код для ${email}: ${code}`);
    }

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
    console.error('[OTP Send Error]:', error);
    return NextResponse.json(
      { error: 'Ошибка отправки кода' },
      { status: 500 }
    );
  }
}



// // src/app/api/booking/verify/email/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import nodemailer from 'nodemailer';

// // ✅ ГЛОБАЛЬНОЕ хранилище OTP (общее для всех запросов)
// // В продакшене использовать Redis
// declare global {
//   var otpStore: Map<string, { code: string; expiresAt: number }> | undefined;
// }

// global.otpStore = global.otpStore || new Map<string, { code: string; expiresAt: number }>();
// const otpStore = global.otpStore;

// function generateOTP(): string {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// }

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
//     from: process.env.SMTP_FROM,
//     to: email,
//     subject: 'Код подтверждения - Salon Elen',
//     html: `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h1 style="color: #333;">Код подтверждения</h1>
//         <p>Ваш код для подтверждения записи в Salon Elen:</p>
//         <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
//           <h2 style="font-size: 36px; font-family: monospace; letter-spacing: 8px; margin: 0;">${code}</h2>
//         </div>
//         <p style="color: #666;">Код действует 10 минут.</p>
//         <p style="color: #999; font-size: 12px; margin-top: 30px;">Если вы не запрашивали этот код, проигнорируйте это письмо.</p>
//       </div>
//     `,
//   });
// }

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { email, draftId } = body;

//     if (!email || !draftId) {
//       return NextResponse.json(
//         { error: 'Email и draftId обязательны' },
//         { status: 400 }
//       );
//     }

//     // Проверяем что черновик существует
//     const appointment = await prisma.appointment.findUnique({
//       where: { id: draftId },
//       select: { id: true, email: true, status: true },
//     });

//     if (!appointment) {
//       return NextResponse.json(
//         { error: 'Запись не найдена' },
//         { status: 404 }
//       );
//     }

//     if (appointment.status !== 'PENDING') {
//       return NextResponse.json(
//         { error: 'Запись уже подтверждена' },
//         { status: 400 }
//       );
//     }

//     // Генерируем 6-значный код
//     const code = generateOTP();
//     const expiresAt = Date.now() + 10 * 60 * 1000; // 10 минут

//     // Сохраняем в ГЛОБАЛЬНОЕ хранилище (ключ: email+draftId)
//     const key = `${email}:${draftId}`;
//     otpStore.set(key, { code, expiresAt });

//     console.log(`[OTP Store] Сохранён код для ${key}: ${code}`);
//     console.log(`[OTP Store] Текущие коды:`, Array.from(otpStore.keys()));

//     // Отправляем email через Mailtrap
//     try {
//       await sendOTPEmail(email, code);
//       console.log(`[OTP] Код для ${email}: ${code} (отправлен через Mailtrap)`);
//     } catch (emailError) {
//       console.error('[OTP] Ошибка отправки email:', emailError);
//       // Всё равно возвращаем успех, чтобы код работал в dev режиме
//       console.log(`[OTP] Dev код для ${email}: ${code}`);
//     }

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
//     console.error('[OTP Send Error]:', error);
//     return NextResponse.json(
//       { error: 'Ошибка отправки кода' },
//       { status: 500 }
//     );
//   }
// }




// // src/app/api/booking/verify/email/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export const runtime = "nodejs"; // nodemailer требует node runtime

// const SMTP_HOST = process.env.SMTP_HOST ?? "";
// const SMTP_PORT = Number(process.env.SMTP_PORT ?? 2525);
// const SMTP_USER = process.env.SMTP_USER ?? "";
// const SMTP_PASS = process.env.SMTP_PASS ?? "";
// const SMTP_FROM = process.env.SMTP_FROM ?? "Salon <no-reply@demo.local>";

// function genCode(): string {
//   return String(Math.floor(100000 + Math.random() * 900000)); // 6 цифр
// }

// export async function POST(req: Request) {
//   try {
//     const { email, draftId } = (await req.json()) as { email?: string; draftId?: string };
//     if (!email) return NextResponse.json({ ok: false, error: "email обязателен" }, { status: 400 });

//     const code = genCode();
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

//     await prisma.emailVerification.create({
//       data: { email, code, expiresAt, used: false },
//     });

//     const { default: nodemailer } = await import("nodemailer");
//     const transport = nodemailer.createTransport({
//       host: SMTP_HOST,
//       port: SMTP_PORT,
//       secure: SMTP_PORT === 465, // Mailtrap: 2525 -> false (STARTTLS)
//       auth: { user: SMTP_USER, pass: SMTP_PASS },
//     });

//     await transport.sendMail({
//       from: SMTP_FROM,
//       to: email,
//       subject: "Код подтверждения",
//       text: `Ваш код: ${code}. Действителен 10 минут.`,
//     });

//     return NextResponse.json({ ok: true, sentTo: email, draftId: draftId ?? null });
//   } catch (e) {
//     console.error("verify/email error", e);
//     return NextResponse.json({ ok: false, error: "Не удалось отправить код" }, { status: 500 });
//   }
// }

