// src/app/api/booking/client/google-quick/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { getGoogleAuthUrl } from "@/lib/google-oauth";

/**
 * POST /api/booking/client/google-quick
 * 
 * Инициирует быструю регистрацию через Google OAuth.
 * В отличие от обычной верификации, здесь сразу создаётся Appointment
 * после успешной авторизации без промежуточных шагов.
 */

interface RequestBody {
  serviceId: string;
  masterId: string;
  startAt: string;
  endAt: string;
  locale?: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log("[Google Quick Reg] Initiating quick registration...");

    // Парсинг запроса
    const body = (await req.json()) as RequestBody;
    const { serviceId, masterId, startAt, endAt, locale } = body;

    // Валидация
    if (!serviceId || !masterId || !startAt || !endAt) {
      return NextResponse.json(
        {
          ok: false,
          error: "Отсутствуют обязательные параметры",
        },
        { status: 400 }
      );
    }

    // Проверка существования Service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, isActive: true, isArchived: true },
    });

    if (!service || !service.isActive || service.isArchived) {
      return NextResponse.json(
        {
          ok: false,
          error: "Услуга не найдена или недоступна",
        },
        { status: 404 }
      );
    }

    // Проверка существования Master
    const master = await prisma.master.findUnique({
      where: { id: masterId },
      select: { id: true },
    });

    if (!master) {
      return NextResponse.json(
        {
          ok: false,
          error: "Мастер не найден",
        },
        { status: 404 }
      );
    }

    // Генерируем уникальный state для OAuth
    const state = crypto.randomBytes(32).toString("hex");

    // Удаляем старые неиспользованные запросы (старше 1 часа)
    await prisma.googleQuickRegistration.deleteMany({
      where: {
        verified: false,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Создаём запрос на быструю регистрацию
    const quickReg = await prisma.googleQuickRegistration.create({
      data: {
        state,
        serviceId,
        masterId,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 минут
        verified: false,
        locale: locale || 'de', // Сохраняем язык клиента
      },
    });

    console.log("[Google Quick Reg] Created registration request:", {
      id: quickReg.id,
      state,
      serviceId,
      masterId,
    });

    // Генерируем Google OAuth URL
    const authUrl = getGoogleAuthUrl(state, "quick");

    console.log("[Google Quick Reg] Generated authUrl");

    return NextResponse.json({
      ok: true,
      authUrl,
      requestId: quickReg.id,
    });
  } catch (error) {
    console.error("[Google Quick Reg] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Внутренняя ошибка сервера",
      },
      { status: 500 }
    );
  }
}



//--------31.01.26
// // src/app/api/booking/client/google-quick/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import crypto from "crypto";
// import { getGoogleAuthUrl } from "@/lib/google-oauth";

// /**
//  * POST /api/booking/client/google-quick
//  * 
//  * Инициирует быструю регистрацию через Google OAuth.
//  * В отличие от обычной верификации, здесь сразу создаётся Appointment
//  * после успешной авторизации без промежуточных шагов.
//  */

// interface RequestBody {
//   serviceId: string;
//   masterId: string;
//   startAt: string;
//   endAt: string;
// }

// export async function POST(req: NextRequest) {
//   try {
//     console.log("[Google Quick Reg] Initiating quick registration...");

//     // Парсинг запроса
//     const body = (await req.json()) as RequestBody;
//     const { serviceId, masterId, startAt, endAt } = body;

//     // Валидация
//     if (!serviceId || !masterId || !startAt || !endAt) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Отсутствуют обязательные параметры",
//         },
//         { status: 400 }
//       );
//     }

//     // Проверка существования Service
//     const service = await prisma.service.findUnique({
//       where: { id: serviceId },
//       select: { id: true, isActive: true, isArchived: true },
//     });

//     if (!service || !service.isActive || service.isArchived) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Услуга не найдена или недоступна",
//         },
//         { status: 404 }
//       );
//     }

//     // Проверка существования Master
//     const master = await prisma.master.findUnique({
//       where: { id: masterId },
//       select: { id: true },
//     });

//     if (!master) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Мастер не найден",
//         },
//         { status: 404 }
//       );
//     }

//     // Генерируем уникальный state для OAuth
//     const state = crypto.randomBytes(32).toString("hex");

//     // Удаляем старые неиспользованные запросы (старше 1 часа)
//     await prisma.googleQuickRegistration.deleteMany({
//       where: {
//         verified: false,
//         expiresAt: {
//           lt: new Date(),
//         },
//       },
//     });

//     // Создаём запрос на быструю регистрацию
//     const quickReg = await prisma.googleQuickRegistration.create({
//       data: {
//         state,
//         serviceId,
//         masterId,
//         startAt: new Date(startAt),
//         endAt: new Date(endAt),
//         expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 минут
//         verified: false,
//       },
//     });

//     console.log("[Google Quick Reg] Created registration request:", {
//       id: quickReg.id,
//       state,
//       serviceId,
//       masterId,
//     });

//     // Генерируем Google OAuth URL
//     const authUrl = getGoogleAuthUrl(state, "quick");

//     console.log("[Google Quick Reg] Generated authUrl");

//     return NextResponse.json({
//       ok: true,
//       authUrl,
//       requestId: quickReg.id,
//     });
//   } catch (error) {
//     console.error("[Google Quick Reg] Error:", error);
//     return NextResponse.json(
//       {
//         ok: false,
//         error: error instanceof Error ? error.message : "Внутренняя ошибка сервера",
//       },
//       { status: 500 }
//     );
//   }
// }