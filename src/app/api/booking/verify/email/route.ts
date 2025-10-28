// src/app/api/booking/verify/email/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // nodemailer требует node runtime

const SMTP_HOST = process.env.SMTP_HOST ?? "";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 2525);
const SMTP_USER = process.env.SMTP_USER ?? "";
const SMTP_PASS = process.env.SMTP_PASS ?? "";
const SMTP_FROM = process.env.SMTP_FROM ?? "Salon <no-reply@demo.local>";

function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 цифр
}

export async function POST(req: Request) {
  try {
    const { email, draftId } = (await req.json()) as { email?: string; draftId?: string };
    if (!email) return NextResponse.json({ ok: false, error: "email обязателен" }, { status: 400 });

    const code = genCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    await prisma.emailVerification.create({
      data: { email, code, expiresAt, used: false },
    });

    const { default: nodemailer } = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // Mailtrap: 2525 -> false (STARTTLS)
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transport.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Код подтверждения",
      text: `Ваш код: ${code}. Действителен 10 минут.`,
    });

    return NextResponse.json({ ok: true, sentTo: email, draftId: draftId ?? null });
  } catch (e) {
    console.error("verify/email error", e);
    return NextResponse.json({ ok: false, error: "Не удалось отправить код" }, { status: 500 });
  }
}

