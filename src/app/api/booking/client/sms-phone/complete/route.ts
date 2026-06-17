//---------------07.01.26 добавил регистрацию клиента в БД без проверки
//----------работает добавляеи отчет в телеграмм при завершении регистрации по смс телефону----------------
// src/app/api/booking/client/sms-phone/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BOOKING_METHOD } from '@/lib/booking/booking-method';
import { prisma } from '@/lib/prisma';

type ClientLookupCondition = { phone?: string; email?: string };

function fallbackDigits(seed: string): string {
  const digits = Array.from(seed)
    .map((ch) => String(ch.charCodeAt(0) % 10))
    .join('');
  return digits.slice(0, 12).padEnd(12, '0');
}

function buildFallbackEmail(phone: string, seed: string): string {
  const phoneToken = phone.replace(/[^\d]+/g, '').slice(-12);
  const token = phoneToken || fallbackDigits(seed);
  const suffix = seed.slice(-6).toLowerCase();
  return `noemail+${token}-${suffix}@client.local`;
}

function buildClientLookupOr(phone?: string, email?: string): ClientLookupCondition[] {
  return [
    ...(phone ? [{ phone }] : []),
    ...(email ? [{ email }] : []),
  ];
}

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return (error as { code?: unknown }).code === 'P2002';
}

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
        service: { select: { name: true, parent: { select: { name: true } } } },
        master: { select: { name: true } },
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
    const customerNameStr = customerName.trim();
    const emailStr = email ? email.trim().toLowerCase() : '';
    const phoneStr = registration.phone.trim();
    const clientEmail = emailStr || buildFallbackEmail(phoneStr, registration.id);

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
      let clientId: string | null = null;

      // Ищем существующего клиента
      if (phoneStr || emailStr) {
        const existing = await tx.client.findFirst({
          where: {
            OR: buildClientLookupOr(phoneStr || undefined, emailStr || undefined),
          },
          select: { id: true },
        });

        if (existing) {
          clientId = existing.id;
          await tx.client.update({
            where: { id: existing.id },
            data: {
              name: customerNameStr,
              ...(finalBirthDate ? { birthDate: finalBirthDate } : {}),
            },
          });
        }
      }

      // Если не нашли - создаём нового
      if (!clientId && (phoneStr || emailStr)) {
        try {
          const newClient = await tx.client.create({
            data: {
              name: customerNameStr,
              phone: phoneStr,
              email: clientEmail,
              birthDate: finalBirthDate || new Date('1990-01-01'),
              referral: null,
            },
            select: { id: true },
          });

          clientId = newClient.id;
        } catch (error) {
          if (!isUniqueConstraintError(error)) {
            throw error;
          }

          const existingAfterConflict = await tx.client.findFirst({
            where: {
              OR: [
                ...buildClientLookupOr(phoneStr || undefined, emailStr || undefined),
                ...buildClientLookupOr(phoneStr || undefined, clientEmail),
              ],
            },
            select: { id: true },
          });

          if (!existingAfterConflict) {
            throw error;
          }

          clientId = existingAfterConflict.id;
        }
      }

      const created = await tx.appointment.create({
        data: {
          serviceId: registration.serviceId,
          clientId,  // ✅ Связь с клиентом!
          masterId: registration.masterId,
          startAt: registration.startAt,
          endAt: registration.endAt,
          customerName: customerNameStr,
          phone: phoneStr,
          email: emailStr || null,
          birthDate: finalBirthDate,
          locale: (registration as { locale?: string }).locale || 'de', // ✅ Язык клиента для уведомлений
          status: 'PENDING',
          paymentStatus: 'PENDING',
          bookingMethod: BOOKING_METHOD.websiteSms,
        },
      });

      await tx.smsPhoneRegistration.update({
        where: { id: registration.id },
        data: {
          customerName: customerNameStr,
          email: emailStr || null,
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



//---------31.01.26
// //---------------07.01.26 добавил регистрацию клиента в БД без проверки
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
//         service: { select: { name: true, parent: { select: { name: true } } } },
//         master: { select: { name: true } },
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
//     const customerNameStr = customerName.trim();
//     const emailStr = email ? email.trim() : '';
//     const phoneStr = registration.phone.trim();

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

//       // ✅ СОЗДАНИЕ/ПОИСК КЛИЕНТА
//       let clientId: string | null = null;

//       // Ищем существующего клиента
//       if (phoneStr || emailStr) {
//         const existing = await tx.client.findFirst({
//           where: {
//             OR: [
//               ...(phoneStr ? [{ phone: phoneStr }] : []),
//               ...(emailStr ? [{ email: emailStr }] : []),
//             ],
//           },
//           select: { id: true },
//         });

//         if (existing) {
//           clientId = existing.id;
//         }
//       }

//       // Если не нашли - создаём нового
//       if (!clientId && (phoneStr || emailStr)) {
//         const newClient = await tx.client.create({
//           data: {
//             name: customerNameStr,
//             phone: phoneStr,
//             email: emailStr,
//             birthDate: finalBirthDate || new Date('1990-01-01'),
//             referral: null,
//           },
//           select: { id: true },
//         });

//         clientId = newClient.id;
//       }

//       const created = await tx.appointment.create({
//         data: {
//           serviceId: registration.serviceId,
//           clientId,  // ✅ Связь с клиентом!
//           masterId: registration.masterId,
//           startAt: registration.startAt,
//           endAt: registration.endAt,
//           customerName: customerNameStr,
//           phone: phoneStr,
//           email: emailStr || null,
//           birthDate: finalBirthDate,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//       });

//       await tx.smsPhoneRegistration.update({
//         where: { id: registration.id },
//         data: {
//           customerName: customerNameStr,
//           email: emailStr || null,
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
