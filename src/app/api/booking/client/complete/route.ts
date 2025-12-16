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

    // Проверка наличия email и customerName
    if (!quickReg.email || !quickReg.customerName) {
      return NextResponse.json(
        {
          ok: false,
          error: "Discord authorization data not found. Please re-authorize.",
        },
        { status: 400 }
      );
    }

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

    // Создание Appointment с полными данными
    const appointment = await prisma.appointment.create({
      data: {
        serviceId: quickReg.serviceId,
        masterId: quickReg.masterId,
        startAt: quickReg.startAt,
        endAt: quickReg.endAt,
        customerName: quickReg.customerName,
        email: quickReg.email,
        phone: phone.trim(), // ✅ Номер телефона от пользователя (обязательный)!
        birthDate: birthdayDate, // ✅ Дата рождения (опциональная) — поле модели Appointment
        status: "PENDING",
      },
    });

    console.log("[Complete Registration] Appointment created:", appointment.id);

    // Обновление статуса регистрации
    await prisma.googleQuickRegistration.update({
      where: { id: quickReg.id },
      data: {
        verified: true,
        appointmentId: appointment.id,
        birthday: birthdayDate ?? quickReg.birthday ?? null,
      },
    });

    console.log("[Complete Registration] ✅ SUCCESS!");

    return NextResponse.json({
      ok: true,
      appointmentId: appointment.id,
      message: "Registration completed successfully",
    });
  } catch (error) {
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