// src/app/api/booking/verify/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import {
  generateOTP,
  saveOTP,
  VerificationMethod,
} from '@/lib/otp-store';

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

    // Проверяем ЧЕРНОВИК
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

    // Проверяем, что email совпадает с черновиком
    if (draft.email !== email) {
      return NextResponse.json(
        { error: 'E-mail не совпадает с данными черновика' },
        { status: 400 }
      );
    }

    // Генерируем 6-значный код
    const code = generateOTP();

    // Сохраняем в хранилище (10 минут)
    saveOTP('email' as VerificationMethod, email, draftId, code, {
      ttlMinutes: 10,
    });

    console.log(`[OTP Store] Сохранён код для ${email}:${draftId}: ${code}`);

    // Отправляем email через SMTP
    try {
      await sendOTPEmail(email, code);
      console.log(`[OTP] Код для ${email}: ${code} (отправлен через SMTP)`);
    } catch (emailError) {
      console.error('[OTP] Ошибка отправки email:', emailError);
      // В dev режиме продолжаем работу даже при ошибке SMTP
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
