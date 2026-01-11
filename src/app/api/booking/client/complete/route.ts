//---------работает добавляем ответ админ боту при успешной регистрации-------
// src/app/api/booking/client/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/**
 * POST /api/booking/client/complete
 *
 * Завершает регистрацию после получения номера телефона.
 * Создаёт Appointment с полными данными клиента.
 */

const requestSchema = z.object({
  registrationId: z.string().min(1),
  phone: z.string().min(1, "Номер телефона обязателен").trim(),
  birthday: z.string().optional(), // ISO date string, опционально
});

export async function POST(req: NextRequest) {
  try {
    console.log("[Complete Registration] Starting...");

    // Парсинг и валидация
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid data",
          details: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    const { registrationId, phone, birthday } = parsed.data;

    console.log("[Complete Registration] Request:", {
      registrationId,
      phone: "***",
      birthday: birthday ? "provided" : "not provided",
    });

    // Поиск запроса на регистрацию
    const quickReg = await prisma.googleQuickRegistration.findUnique({
      where: { id: registrationId },
    });

    if (!quickReg) {
      return NextResponse.json(
        {
          ok: false,
          error: "Registration request not found",
        },
        { status: 404 }
      );
    }

    // Проверка что регистрация ещё не завершена
    if (quickReg.verified) {
      // Если уже завершена, возвращаем существующий appointment
      if (quickReg.appointmentId) {
        console.log("[Complete Registration] Already completed, returning existing appointment");
        return NextResponse.json({
          ok: true,
          appointmentId: quickReg.appointmentId,
          message: "Registration already completed",
        });
      }
    }

    // Проверка истечения срока
    if (quickReg.expiresAt < new Date()) {
      return NextResponse.json(
        {
          ok: false,
          error: "Registration request has expired. Please start again.",
        },
        { status: 410 }
      );
    }

    const customerEmail = quickReg.email;
    const customerName = quickReg.customerName;

    // Проверка наличия email и customerName
    if (!customerEmail || !customerName) {
      return NextResponse.json(
        {
          ok: false,
          error: "Discord authorization data not found. Please re-authorize.",
        },
        { status: 400 }
      );
    }

    const customerEmailStr = customerEmail.trim();
    const customerNameStr = customerName.trim();
    const phoneStr = phone.trim();

    console.log("[Complete Registration] Creating appointment...");

    // Парсим дату рождения если она есть
    let birthdayDate: Date | undefined;
    if (birthday) {
      try {
        birthdayDate = new Date(birthday);
        // Проверяем что дата валидна
        if (isNaN(birthdayDate.getTime())) {
          birthdayDate = undefined;
        }
      } catch {
        birthdayDate = undefined;
      }
    }

    const conflictError = 'SLOT_TAKEN';

    const appointment = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${quickReg.masterId} FOR UPDATE`;

      const conflicting = await tx.appointment.findFirst({
        where: {
          masterId: quickReg.masterId,
          status: { not: 'CANCELED' },
          startAt: { lt: quickReg.endAt },
          endAt: { gt: quickReg.startAt },
        },
        select: { id: true },
      });

      if (conflicting) {
        throw new Error(conflictError);
      }

      // ✅ СОЗДАНИЕ/ПОИСК КЛИЕНТА
      const emailStr = customerEmailStr;

      let clientId: string | null = null;

      // Ищем существующего клиента
      if (phoneStr || emailStr) {
        const existing = await tx.client.findFirst({
          where: {
            OR: [
              ...(phoneStr ? [{ phone: phoneStr }] : []),
              ...(emailStr ? [{ email: emailStr }] : []),
            ],
          },
          select: { id: true },
        });

        if (existing) {
          clientId = existing.id;
        }
      }

      // Если не нашли - создаём нового
      if (!clientId && (phoneStr || emailStr)) {
        const newClient = await tx.client.create({
          data: {
            name: customerNameStr,
            phone: phoneStr,
            email: emailStr,
            birthDate: birthdayDate || new Date('1990-01-01'),
            referral: null,
          },
          select: { id: true },
        });

        clientId = newClient.id;
      }

      const created = await tx.appointment.create({
        data: {
          serviceId: quickReg.serviceId,
          clientId,  // ✅ Связь с клиентом!
          masterId: quickReg.masterId,
          startAt: quickReg.startAt,
          endAt: quickReg.endAt,
          customerName: customerNameStr,
          email: customerEmailStr,
          phone: phoneStr, // ✅ Номер телефона от пользователя (обязательный)!
          birthDate: birthdayDate, // ✅ Дата рождения (опциональная) — поле модели Appointment
          status: "PENDING",
        },
      });

      await tx.googleQuickRegistration.update({
        where: { id: quickReg.id },
        data: {
          verified: true,
          appointmentId: created.id,
          birthDate: birthdayDate ?? quickReg.birthDate ?? null,
        },
      });

      return created;
    });

    console.log("[Complete Registration] Appointment created:", appointment.id);

    console.log("[Complete Registration] ✅ SUCCESS!");

    return NextResponse.json({
      ok: true,
      appointmentId: appointment.id,
      message: "Registration completed successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return NextResponse.json(
        { ok: false, error: 'Time slot is no longer available' },
        { status: 409 }
      );
    }
    console.error("[Complete Registration] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}






//-------------работало до 07.01.26 добоавил регистрацию клиента в БД-------
// //---------работает добавляем ответ админ боту при успешной регистрации-------
// // src/app/api/booking/client/complete/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { z } from "zod";

// /**
//  * POST /api/booking/client/complete
//  *
//  * Завершает регистрацию после получения номера телефона.
//  * Создаёт Appointment с полными данными клиента.
//  */

// const requestSchema = z.object({
//   registrationId: z.string().min(1),
//   phone: z.string().min(1, "Номер телефона обязателен").trim(),
//   birthday: z.string().optional(), // ISO date string, опционально
// });

// export async function POST(req: NextRequest) {
//   try {
//     console.log("[Complete Registration] Starting...");

//     // Парсинг и валидация
//     const body = await req.json();
//     const parsed = requestSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Invalid data",
//           details: parsed.error.errors,
//         },
//         { status: 400 }
//       );
//     }

//     const { registrationId, phone, birthday } = parsed.data;

//     console.log("[Complete Registration] Request:", {
//       registrationId,
//       phone: "***",
//       birthday: birthday ? "provided" : "not provided",
//     });

//     // Поиск запроса на регистрацию
//     const quickReg = await prisma.googleQuickRegistration.findUnique({
//       where: { id: registrationId },
//     });

//     if (!quickReg) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Registration request not found",
//         },
//         { status: 404 }
//       );
//     }

//     // Проверка что регистрация ещё не завершена
//     if (quickReg.verified) {
//       // Если уже завершена, возвращаем существующий appointment
//       if (quickReg.appointmentId) {
//         console.log("[Complete Registration] Already completed, returning existing appointment");
//         return NextResponse.json({
//           ok: true,
//           appointmentId: quickReg.appointmentId,
//           message: "Registration already completed",
//         });
//       }
//     }

//     // Проверка истечения срока
//     if (quickReg.expiresAt < new Date()) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Registration request has expired. Please start again.",
//         },
//         { status: 410 }
//       );
//     }

//     const customerEmail = quickReg.email;
//     const customerName = quickReg.customerName;

//     // Проверка наличия email и customerName
//     if (!customerEmail || !customerName) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Discord authorization data not found. Please re-authorize.",
//         },
//         { status: 400 }
//       );
//     }

//     console.log("[Complete Registration] Creating appointment...");

//     // Парсим дату рождения если она есть
//     let birthdayDate: Date | undefined;
//     if (birthday) {
//       try {
//         birthdayDate = new Date(birthday);
//         // Проверяем что дата валидна
//         if (isNaN(birthdayDate.getTime())) {
//           birthdayDate = undefined;
//         }
//       } catch {
//         birthdayDate = undefined;
//       }
//     }

//     const conflictError = 'SLOT_TAKEN';

//     const appointment = await prisma.$transaction(async (tx) => {
//       await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${quickReg.masterId} FOR UPDATE`;

//       const conflicting = await tx.appointment.findFirst({
//         where: {
//           masterId: quickReg.masterId,
//           status: { not: 'CANCELED' },
//           startAt: { lt: quickReg.endAt },
//           endAt: { gt: quickReg.startAt },
//         },
//         select: { id: true },
//       });

//       if (conflicting) {
//         throw new Error(conflictError);
//       }

//       const created = await tx.appointment.create({
//         data: {
//           serviceId: quickReg.serviceId,
//           masterId: quickReg.masterId,
//           startAt: quickReg.startAt,
//           endAt: quickReg.endAt,
//           customerName,
//           email: customerEmail,
//           phone: phone.trim(), // ✅ Номер телефона от пользователя (обязательный)!
//           birthDate: birthdayDate, // ✅ Дата рождения (опциональная) — поле модели Appointment
//           status: "PENDING",
//         },
//       });

//       await tx.googleQuickRegistration.update({
//         where: { id: quickReg.id },
//         data: {
//           verified: true,
//           appointmentId: created.id,
//           birthDate: birthdayDate ?? quickReg.birthDate ?? null,
//         },
//       });

//       return created;
//     });

//     console.log("[Complete Registration] Appointment created:", appointment.id);

//     console.log("[Complete Registration] ✅ SUCCESS!");

//     return NextResponse.json({
//       ok: true,
//       appointmentId: appointment.id,
//       message: "Registration completed successfully",
//     });
//   } catch (error) {
//     if (error instanceof Error && error.message === 'SLOT_TAKEN') {
//       return NextResponse.json(
//         { ok: false, error: 'Time slot is no longer available' },
//         { status: 409 }
//       );
//     }
//     console.error("[Complete Registration] Error:", error);
//     return NextResponse.json(
//       {
//         ok: false,
//         error: error instanceof Error ? error.message : "Internal server error",
//       },
//       { status: 500 }
//     );
//   }
// }





//------------ошибка с датой рождения исправляю с GPT--------
// // src/app/api/booking/client/complete/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { z } from "zod";

// /**
//  * POST /api/booking/client/complete
//  * 
//  * Завершает регистрацию после получения номера телефона.
//  * Создаёт Appointment с полными данными клиента.
//  */

// const requestSchema = z.object({
//   registrationId: z.string().min(1),
//   phone: z.string().min(1, "Номер телефона обязателен").trim(),
//   birthday: z.string().optional(), // ISO date string, опционально
// });

// export async function POST(req: NextRequest) {
//   try {
//     console.log("[Complete Registration] Starting...");

//     // Парсинг и валидация
//     const body = await req.json();
//     const parsed = requestSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Неверные данные",
//           details: parsed.error.errors,
//         },
//         { status: 400 }
//       );
//     }

//     const { registrationId, phone, birthday } = parsed.data;

//     console.log("[Complete Registration] Request:", { 
//       registrationId, 
//       phone: "***",
//       birthday: birthday ? "provided" : "not provided" 
//     });

//     // Поиск запроса на регистрацию
//     const quickReg = await prisma.googleQuickRegistration.findUnique({
//       where: { id: registrationId },
//     });

//     if (!quickReg) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Запрос на регистрацию не найден",
//         },
//         { status: 404 }
//       );
//     }

//     // Проверка что регистрация ещё не завершена
//     if (quickReg.verified) {
//       // Если уже завершена, возвращаем существующий appointment
//       if (quickReg.appointmentId) {
//         console.log("[Complete Registration] Already completed, returning existing appointment");
//         return NextResponse.json({
//           ok: true,
//           appointmentId: quickReg.appointmentId,
//           message: "Регистрация уже завершена",
//         });
//       }
//     }

//     // Проверка истечения срока
//     if (quickReg.expiresAt < new Date()) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Срок действия запроса истёк. Пожалуйста, начните заново.",
//         },
//         { status: 410 }
//       );
//     }

//     // Проверка наличия email и customerName
//     if (!quickReg.email || !quickReg.customerName) {
//       return NextResponse.json(
//         {
//           ok: false,
//           error: "Данные авторизации не найдены. Пожалуйста, авторизуйтесь заново.",
//         },
//         { status: 400 }
//       );
//     }

//     console.log("[Complete Registration] Creating appointment...");

//     // Парсим дату рождения если она есть
//     let birthdayDate: Date | undefined;
//     if (birthday) {
//       try {
//         birthdayDate = new Date(birthday);
//         // Проверяем что дата валидна
//         if (isNaN(birthdayDate.getTime())) {
//           birthdayDate = undefined;
//         }
//       } catch {
//         birthdayDate = undefined;
//       }
//     }

//     // Создание Appointment с полными данными
//     const appointment = await prisma.appointment.create({
//       data: {
//         serviceId: quickReg.serviceId,
//         masterId: quickReg.masterId,
//         startAt: quickReg.startAt,
//         endAt: quickReg.endAt,
//         customerName: quickReg.customerName,
//         email: quickReg.email,
//         phone: phone.trim(), // ✅ Номер телефона от пользователя (обязательный)!
//         birthday: birthdayDate, // ✅ Дата рождения (опциональная)
//         status: "PENDING",
//       },
//     });

//     console.log("[Complete Registration] Appointment created:", appointment.id);

//     // Обновление статуса регистрации
//     await prisma.googleQuickRegistration.update({
//       where: { id: quickReg.id },
//       data: {
//         verified: true,
//         appointmentId: appointment.id,
//       },
//     });

//     console.log("[Complete Registration] ✅ SUCCESS!");

//     return NextResponse.json({
//       ok: true,
//       appointmentId: appointment.id,
//       message: "Регистрация завершена успешно",
//     });
//   } catch (error) {
//     console.error("[Complete Registration] Error:", error);
//     return NextResponse.json(
//       {
//         ok: false,
//         error: error instanceof Error ? error.message : "Внутренняя ошибка сервера",
//       },
//       { status: 500 }
//     );
//   }
// }
