// src/app/api/booking/verify/email/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ ИСПОЛЬЗУЕМ ТО ЖЕ ГЛОБАЛЬНОЕ хранилище что и в email/route.ts
declare global {
  var otpStore: Map<string, { code: string; expiresAt: number }> | undefined;
}

global.otpStore = global.otpStore || new Map<string, { code: string; expiresAt: number }>();
const otpStore = global.otpStore;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, draftId } = body;

    if (!email || !code || !draftId) {
      return NextResponse.json(
        { error: 'Email, код и draftId обязательны' },
        { status: 400 }
      );
    }

    console.log(`[OTP Verify] Проверка кода для ${email}:${draftId}`);
    console.log(`[OTP Store] Коды в хранилище:`, Array.from(otpStore.keys()));

    // Проверяем код
    const key = `${email}:${draftId}`;
    const stored = otpStore.get(key);

    if (!stored) {
      console.log(`[OTP Verify] Код не найден для ${key}`);
      return NextResponse.json(
        { error: 'Код не найден. Запросите новый код' },
        { status: 404 }
      );
    }

    console.log(`[OTP Verify] Найден код: ${stored.code}, введён: ${code}`);

    // Проверяем срок действия
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(key);
      console.log(`[OTP Verify] Код истёк для ${key}`);
      return NextResponse.json(
        { error: 'Срок действия кода истек. Запросите новый код' },
        { status: 400 }
      );
    }

    // Проверяем совпадение кода
    if (stored.code !== code) {
      console.log(`[OTP Verify] Неверный код для ${key}`);
      return NextResponse.json(
        { error: 'Неверный код' },
        { status: 400 }
      );
    }

    // Код верный! Удаляем из хранилища
    otpStore.delete(key);
    console.log(`[OTP Verify] Код подтверждён для ${key}`);

    // Обновляем запись - помечаем email как подтвержденный
    const appointment = await prisma.appointment.update({
      where: { id: draftId },
      data: {
        notes: 'Email подтвержден',
      },
      select: { id: true },
    });

    console.log(`[OTP] Email ${email} подтвержден для записи ${draftId}`);

    return NextResponse.json({
      ok: true,
      message: 'Email подтвержден',
      appointmentId: appointment.id,
    });
  } catch (error) {
    console.error('[OTP Verify Error]:', error);
    return NextResponse.json(
      { error: 'Ошибка проверки кода' },
      { status: 500 }
    );
  }
}




// // src/app/api/booking/verify/email/confirm/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   const { email, code, draftId } = (await req.json()) as {
//     email?: string;
//     code?: string;
//     draftId?: string;
//   };

//   if (!email || !code) {
//     return NextResponse.json(
//       { ok: false, error: "email и code обязательны" },
//       { status: 400 }
//     );
//   }

//   try {
//     // Берём последнюю неиспользованную запись по этому email
//     const rec = await prisma.emailVerification.findFirst({
//       where: { email, used: false },
//       orderBy: { createdAt: "desc" },
//     });

//     if (!rec) {
//       return NextResponse.json(
//         { ok: false, error: "Код не найден. Отправьте новый." },
//         { status: 400 }
//       );
//     }

//     if (rec.expiresAt <= new Date()) {
//       return NextResponse.json(
//         { ok: false, error: "Код просрочен. Отправьте новый." },
//         { status: 400 }
//       );
//     }

//     if (rec.code !== code) {
//       return NextResponse.json(
//         { ok: false, error: "Неверный код." },
//         { status: 400 }
//       );
//     }

//     // Помечаем использованным
//     await prisma.emailVerification.update({
//       where: { id: rec.id },
//       data: { used: true },
//     });

//     // При необходимости можно что-то сделать с draftId (пока ничего не меняем)
//     if (draftId) {
//       // await prisma.appointment.update({ where: { id: draftId }, data: { ... } });
//     }

//     return NextResponse.json({ ok: true });
//   } catch (e) {
//     console.error("verify/email/confirm error:", e);
//     const msg = e instanceof Error ? e.message : "Internal error";
//     return NextResponse.json(
//       { ok: false, error: `Ошибка подтверждения: ${msg}` },
//       { status: 500 }
//     );
//   }
// }
