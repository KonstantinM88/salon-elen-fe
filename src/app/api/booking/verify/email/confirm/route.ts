// // src/app/api/booking/verify/email/confirm/route.ts
// // ✅ БЕЗ УВЕДОМЛЕНИЯ - оно будет в payment endpoints!

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { verifyEmailOTP } from '@/lib/otp-store';

// type ConfirmEmailRequest = {
//   email: string;
//   code: string;
//   draftId: string;
// };

// type ConfirmEmailResponse =
//   | {
//       success: true;
//       appointmentId: string;
//     }
//   | {
//       success: false;
//       error: string;
//     };

// export async function POST(
//   request: NextRequest
// ): Promise<NextResponse<ConfirmEmailResponse>> {
//   try {
//     const body = (await request.json()) as ConfirmEmailRequest;
//     const { email, code, draftId } = body;

//     console.log(`[OTP Verify] Проверка кода для ${email}:${draftId}`);

//     // ✅ Проверяем OTP код
//     const isValid = verifyEmailOTP(email, draftId, code);

//     if (!isValid) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid or expired verification code' },
//         { status: 400 }
//       );
//     }

//     console.log(`[OTP Verify] Код подтверждён для ${email}:${draftId}`);

//     // ✅ Получаем черновик
//     const draft = await prisma.bookingDraft.findUnique({
//       where: { id: draftId },
//     });

//     if (!draft) {
//       return NextResponse.json(
//         { success: false, error: 'Draft not found' },
//         { status: 404 }
//       );
//     }

//     // ✅ Проверяем слот (не занят ли уже)
//     const existingAppointment = await prisma.appointment.findFirst({
//       where: {
//         masterId: draft.masterId,
//         status: { in: ['PENDING', 'CONFIRMED'] },
//         startAt: { lt: draft.endAt },
//         endAt: { gt: draft.startAt },
//       },
//     });

//     if (existingAppointment) {
//       return NextResponse.json(
//         { success: false, error: 'Time slot is no longer available' },
//         { status: 409 }
//       );
//     }

//     // ✅ Создаём appointment в транзакции
//     const appointment = await prisma.$transaction(async (tx) => {
//       // Создаём appointment
//       const newAppointment = await tx.appointment.create({
//         data: {
//           serviceId: draft.serviceId,
//           masterId: draft.masterId,
//           startAt: draft.startAt,
//           endAt: draft.endAt,
//           customerName: draft.customerName,
//           phone: draft.phone,
//           email: draft.email,
//           birthDate: draft.birthDate,
//           referral: draft.referral,
//           notes: draft.notes,
//           status: 'PENDING',
//           paymentStatus: 'PENDING', // ⏳ Ожидает оплаты
//         },
//         include: {
//           service: {
//             select: {
//               name: true, // ✅ Исправлено: "name" вместо "title"
//             },
//           },
//           master: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       });

//       // Удаляем черновик
//       await tx.bookingDraft.delete({
//         where: { id: draftId },
//       });

//       return newAppointment;
//     });

//     console.log(`[OTP Verify] Appointment создан: ${appointment.id}`);

//     // ❌ УБРАНО: НЕ отправляем уведомление здесь!
//     // Уведомление будет отправлено ПОСЛЕ оплаты в:
//     // - /api/webhooks/stripe (Stripe webhook)
//     // - /api/payment/capture-paypal-order (PayPal capture)
//     // - /api/booking/confirm-onsite-payment (Onsite confirmation)

//     return NextResponse.json({
//       success: true,
//       appointmentId: appointment.id,
//     });
//   } catch (error) {
//     console.error('❌ [OTP Verify] Error:', error);

//     const errorMessage =
//       error instanceof Error ? error.message : 'Failed to confirm email verification';

//     return NextResponse.json(
//       { success: false, error: errorMessage },
//       { status: 500 }
//     );
//   }
// }



//----------работало добовляем отправку телеграм админу при записи по емейл коду подтверждения----------------
// src/app/api/booking/verify/email/confirm/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyOTP,
  deleteOTP,
  OTPMethod,
} from '@/lib/otp-store';

// ---------- Типы ----------

type ConfirmCodeRequest = {
  email?: string;
  code?: string;
  draftId?: string;
};

type VerifyResponse =
  | {
      ok: true;
      message: string;
      appointmentId: string;
    }
  | {
      ok: false;
      error: string;
    };

// ---------- Вспомогательные функции ----------

/**
 * Создаёт Appointment из BookingDraft
 */
async function createAppointmentFromDraft(draftId: string) {
  const draft = await prisma.bookingDraft.findUnique({
    where: { id: draftId },
  });

  if (!draft) {
    throw new Error('Черновик не найден');
  }

  const conflictError = 'SLOT_TAKEN';

  const appointment = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT 1 FROM "Master" WHERE "id" = ${draft.masterId} FOR UPDATE`;

    const conflicting = await tx.appointment.findFirst({
      where: {
        masterId: draft.masterId,
        status: { not: 'CANCELED' },
        startAt: { lt: draft.endAt },
        endAt: { gt: draft.startAt },
      },
      select: { id: true },
    });

    if (conflicting) {
      throw new Error(conflictError);
    }

    const created = await tx.appointment.create({
      data: {
        serviceId: draft.serviceId,
        masterId: draft.masterId,
        startAt: draft.startAt,
        endAt: draft.endAt,
        customerName: draft.customerName,
        phone: draft.phone,
        email: draft.email,
        birthDate: draft.birthDate || null,  // ✅ Правильная обработка nullable
        referral: draft.referral || null,     // ✅ Правильная обработка nullable
        notes: draft.notes || null,           // ✅ Правильная обработка nullable
        status: 'PENDING',
      },
    });

    await tx.bookingDraft.delete({
      where: { id: draftId },
    });

    return created;
  });

  return appointment;
}

// ---------- API Handler ----------

export async function POST(
  req: NextRequest
): Promise<NextResponse<VerifyResponse>> {
  try {
    const body = (await req.json()) as ConfirmCodeRequest;
    const { email, code, draftId } = body;

    // Валидация
    if (!email || !code || !draftId) {
      return NextResponse.json(
        { ok: false, error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    console.log(`[OTP Verify] Проверка кода для ${email}:${draftId}`);

    // Проверяем OTP код через централизованную функцию
    const isValid = verifyOTP('email' as OTPMethod, email, draftId, code);

    if (!isValid) {
      console.log(`[OTP Verify] Неверный код для ${email}:${draftId}`);
      return NextResponse.json(
        { ok: false, error: 'Неверный код или email' },
        { status: 400 }
      );
    }

    console.log(`[OTP Verify] Код подтверждён для ${email}:${draftId}`);

    // Создаём Appointment
    const appointment = await createAppointmentFromDraft(draftId);

    // Удаляем OTP код из хранилища
    deleteOTP('email' as OTPMethod, email, draftId);

    console.log(`[OTP Verify] Appointment создан: ${appointment.id}`);

    return NextResponse.json({
      ok: true,
      message: 'Запись подтверждена',
      appointmentId: appointment.id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return NextResponse.json(
        { ok: false, error: 'Выбранное время уже занято. Пожалуйста, выберите другое время.' },
        { status: 409 }
      );
    }
    console.error('[OTP Verify Error]:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Ошибка подтверждения кода';

    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}
