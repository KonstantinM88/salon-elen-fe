// src/app/api/booking/verify/email/confirm/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { email, code, draftId } = (await req.json()) as {
    email?: string;
    code?: string;
    draftId?: string;
  };

  if (!email || !code) {
    return NextResponse.json(
      { ok: false, error: "email и code обязательны" },
      { status: 400 }
    );
  }

  try {
    // Берём последнюю неиспользованную запись по этому email
    const rec = await prisma.emailVerification.findFirst({
      where: { email, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!rec) {
      return NextResponse.json(
        { ok: false, error: "Код не найден. Отправьте новый." },
        { status: 400 }
      );
    }

    if (rec.expiresAt <= new Date()) {
      return NextResponse.json(
        { ok: false, error: "Код просрочен. Отправьте новый." },
        { status: 400 }
      );
    }

    if (rec.code !== code) {
      return NextResponse.json(
        { ok: false, error: "Неверный код." },
        { status: 400 }
      );
    }

    // Помечаем использованным
    await prisma.emailVerification.update({
      where: { id: rec.id },
      data: { used: true },
    });

    // При необходимости можно что-то сделать с draftId (пока ничего не меняем)
    if (draftId) {
      // await prisma.appointment.update({ where: { id: draftId }, data: { ... } });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("verify/email/confirm error:", e);
    const msg = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json(
      { ok: false, error: `Ошибка подтверждения: ${msg}` },
      { status: 500 }
    );
  }
}
