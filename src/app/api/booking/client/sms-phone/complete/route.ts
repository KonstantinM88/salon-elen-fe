//---------------07.01.26 добавил регистрацию клиента в БД без проверки
//----------работает добавляеи отчет в телеграмм при завершении регистрации по смс телефону----------------
// src/app/api/booking/client/sms-phone/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/booking/client/sms-phone/complete
 * 
 * Завершение регистрации - сохранение данных пользователя и создание appointment
 * Вызывается после успешной верификации PIN и ввода данных
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId, customerName, email, birthDate } = body;

    console.log('[SMS Phone Complete] Completing registration:', registrationId);

    // Валидация входных данных
    if (!registrationId || !customerName) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Поиск registration request
    const registration = await prisma.smsPhoneRegistration.findUnique({
      where: { id: registrationId },
      include: {
        service: true,
        master: true,
      },
    });

    if (!registration) {
      return NextResponse.json(
        { ok: false, error: 'Registration request not found' },
        { status: 404 }
      );
    }

    // Проверка истечения срока действия
    const now = new Date();
    if (registration.expiresAt < now) {
      return NextResponse.json(
        { ok: false, error: 'Registration request expired' },
        { status: 400 }
      );
    }

    // Проверка верификации
    if (!registration.verified) {
      return NextResponse.json(
        { ok: false, error: 'Registration not verified' },
        { status: 400 }
      );
    }

    // Проверка что appointment ещё не создан
    if (registration.appointmentId) {
      return NextResponse.json(
        { ok: false, error: 'Appointment already created' },
        { status: 400 }
      );
    }

    console.log('[SMS Phone Complete] Creating appointment...');

    // Подготовка данных
    const finalBirthDate = birthDate ? new Date(birthDate) : null;

    const conflictError = 'SLOT_TAKEN';

    const appointment = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${registration.masterId} FOR UPDATE`;

      const conflicting = await tx.appointment.findFirst({
        where: {
          masterId: registration.masterId,
          status: { not: 'CANCELED' },
          startAt: { lt: registration.endAt },
          endAt: { gt: registration.startAt },
        },
        select: { id: true },
      });

      if (conflicting) {
        throw new Error(conflictError);
      }

      // ✅ СОЗДАНИЕ/ПОИСК КЛИЕНТА
      const phoneStr = registration.phone.trim();
      const emailStr = email ? email.trim() : '';

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
            name: customerName.trim(),
            phone: phoneStr,
            email: emailStr,
            birthDate: finalBirthDate || new Date('1990-01-01'),
            referral: null,
          },
          select: { id: true },
        });

        clientId = newClient.id;
      }

      const created = await tx.appointment.create({
        data: {
          serviceId: registration.serviceId,
          clientId,  // ✅ Связь с клиентом!
          masterId: registration.masterId,
          startAt: registration.startAt,
          endAt: registration.endAt,
          customerName: customerName.trim(),
          phone: registration.phone,
          email: email ? email.trim() : null,
          birthDate: finalBirthDate,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        },
      });

      await tx.smsPhoneRegistration.update({
        where: { id: registration.id },
        data: {
          customerName: customerName.trim(),
          email: email ? email.trim() : null,
          birthDate: finalBirthDate,
          appointmentId: created.id,
        },
      });

      return created;
    });

    console.log('[SMS Phone Complete] ✅ Appointment created:', appointment.id);

    console.log('[SMS Phone Complete] ✅ Registration completed');

    return NextResponse.json({
      ok: true,
      appointmentId: appointment.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return NextResponse.json(
        { ok: false, error: 'Time slot is no longer available' },
        { status: 409 }
      );
    }
    console.error('[SMS Phone Complete] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}




//----------работало до 07.01.2026 добавляем клиента в БД не проверяю нет возможности пока
// //----------работает добавляеи отчет в телеграмм при завершении регистрации по смс телефону----------------
// // src/app/api/booking/client/sms-phone/complete/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// /**
//  * POST /api/booking/client/sms-phone/complete
//  * 
//  * Завершение регистрации - сохранение данных пользователя и создание appointment
//  * Вызывается после успешной верификации PIN и ввода данных
//  */

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { registrationId, customerName, email, birthDate } = body;

//     console.log('[SMS Phone Complete] Completing registration:', registrationId);

//     // Валидация входных данных
//     if (!registrationId || !customerName) {
//       return NextResponse.json(
//         { ok: false, error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Поиск registration request
//     const registration = await prisma.smsPhoneRegistration.findUnique({
//       where: { id: registrationId },
//       include: {
//         service: true,
//         master: true,
//       },
//     });

//     if (!registration) {
//       return NextResponse.json(
//         { ok: false, error: 'Registration request not found' },
//         { status: 404 }
//       );
//     }

//     // Проверка истечения срока действия
//     const now = new Date();
//     if (registration.expiresAt < now) {
//       return NextResponse.json(
//         { ok: false, error: 'Registration request expired' },
//         { status: 400 }
//       );
//     }

//     // Проверка верификации
//     if (!registration.verified) {
//       return NextResponse.json(
//         { ok: false, error: 'Registration not verified' },
//         { status: 400 }
//       );
//     }

//     // Проверка что appointment ещё не создан
//     if (registration.appointmentId) {
//       return NextResponse.json(
//         { ok: false, error: 'Appointment already created' },
//         { status: 400 }
//       );
//     }

//     console.log('[SMS Phone Complete] Creating appointment...');

//     // Подготовка данных
//     const finalBirthDate = birthDate ? new Date(birthDate) : null;

//     const conflictError = 'SLOT_TAKEN';

//     const appointment = await prisma.$transaction(async (tx) => {
//       await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${registration.masterId} FOR UPDATE`;

//       const conflicting = await tx.appointment.findFirst({
//         where: {
//           masterId: registration.masterId,
//           status: { not: 'CANCELED' },
//           startAt: { lt: registration.endAt },
//           endAt: { gt: registration.startAt },
//         },
//         select: { id: true },
//       });

//       if (conflicting) {
//         throw new Error(conflictError);
//       }

//       const created = await tx.appointment.create({
//         data: {
//           serviceId: registration.serviceId,
//           masterId: registration.masterId,
//           startAt: registration.startAt,
//           endAt: registration.endAt,
//           customerName: customerName.trim(),
//           phone: registration.phone,
//           email: email ? email.trim() : null,
//           birthDate: finalBirthDate,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//       });

//       await tx.smsPhoneRegistration.update({
//         where: { id: registration.id },
//         data: {
//           customerName: customerName.trim(),
//           email: email ? email.trim() : null,
//           birthDate: finalBirthDate,
//           appointmentId: created.id,
//         },
//       });

//       return created;
//     });

//     console.log('[SMS Phone Complete] ✅ Appointment created:', appointment.id);

//     console.log('[SMS Phone Complete] ✅ Registration completed');

//     return NextResponse.json({
//       ok: true,
//       appointmentId: appointment.id,
//     });
//   } catch (error) {
//     if (error instanceof Error && error.message === 'SLOT_TAKEN') {
//       return NextResponse.json(
//         { ok: false, error: 'Time slot is no longer available' },
//         { status: 409 }
//       );
//     }
//     console.error('[SMS Phone Complete] Error:', error);
//     return NextResponse.json(
//       {
//         ok: false,
//         error: error instanceof Error ? error.message : 'Internal server error',
//       },
//       { status: 500 }
//     );
//   }
// }
