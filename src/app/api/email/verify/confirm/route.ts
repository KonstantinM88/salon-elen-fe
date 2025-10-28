// src/app/api/email/verify/confirm/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) {
      return NextResponse.json({ error: "email_and_code_required" }, { status: 400 });
    }

    const rec = await prisma.emailVerification.findFirst({
      where: { email, code, used: false },
      orderBy: { createdAt: "desc" },
    });

    if (!rec) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }
    if (rec.expiresAt < new Date()) {
      return NextResponse.json({ error: "code_expired" }, { status: 400 });
    }

    await prisma.emailVerification.update({
      where: { id: rec.id },
      data: { used: true },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
