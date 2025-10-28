// src/app/api/email/verify/request/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function genCode(len = 6) {
  const s = Math.floor(10 ** (len - 1) + Math.random() * 9 * 10 ** (len - 1));
  return String(s);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email_required" }, { status: 400 });
    }

    // Инвалидируем старые коды для этого e-mail
    await prisma.emailVerification.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    const code = genCode(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.emailVerification.create({
      data: { email, code, expiresAt },
    });

    // Здесь интеграция с реальной отправкой письма.
    // Пока логируем код на сервере для теста.
    console.log(`[verify][${email}] code: ${code}`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
