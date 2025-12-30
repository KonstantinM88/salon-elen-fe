// src/app/api/booking/verify/email/confirm/route.ts
// ✅ ИСПРАВЛЕНО: name вместо title (Prisma schema)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyOTP,
  deleteOTP,
  OTPMethod,
} from '@/lib/otp-store';
import { sendAdminNotification } from '@/lib/send-admin-notification';

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
 * Проверяет что слот всё ещё свободен
 */
async function checkSlotConflict(
  masterId: string,
  startAt: Date,
  endAt: Date
): Promise<boolean> {
  const conflict = await prisma.appointment.findFirst({
    where: {
      masterId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        {
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
      ],
    },
  });

  return !!conflict;
}

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

  // Проверяем конфликт слота
  const hasConflict = await checkSlotConflict(
    draft.masterId,
    draft.startAt,
    draft.endAt
  );

  if (hasConflict) {
    throw new Error('Выбранное время уже занято. Пожалуйста, выберите другое время.');
  }

  // Создаём Appointment с правильной обработкой nullable полей
  const appointment = await prisma.appointment.create({
    data: {
      serviceId: draft.serviceId,
      masterId: draft.masterId,
      startAt: draft.startAt,
      endAt: draft.endAt,
      customerName: draft.customerName,
      phone: draft.phone,
      email: draft.email,
      birthDate: draft.birthDate || null,
      referral: draft.referral || null,
      notes: draft.notes || null,
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
    include: {
      service: {
        select: {
          name: true,  // ✅ ИСПРАВЛЕНО: name вместо title
        },
      },
      master: {
        select: {
          name: true,
        },
      },
    },
  });

  // Удаляем черновик
  await prisma.bookingDraft.delete({
    where: { id: draftId },
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

    // ✅ ОТПРАВКА TELEGRAM УВЕДОМЛЕНИЯ АДМИНИСТРАТОРУ
    sendAdminNotification({
      id: appointment.id,
      customerName: appointment.customerName,
      phone: appointment.phone,
      email: appointment.email || null,
      serviceName: appointment.service?.name || 'Услуга не указана',  // ✅ ИСПРАВЛЕНО: name вместо title
      masterName: appointment.master?.name || 'Мастер не указан',
      masterId: appointment.masterId || null,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      paymentStatus: appointment.paymentStatus,
    }).catch((err) => {
      console.error('[OTP Verify] Failed to send Telegram notification:', err);
    });

    return NextResponse.json({
      ok: true,
      message: 'Запись подтверждена',
      appointmentId: appointment.id,
    });
  } catch (error) {
    console.error('[OTP Verify Error]:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Ошибка подтверждения кода';

    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}



//----------работало добовляем отправку телеграм админу при записи по емейл коду подтверждения----------------
// // src/app/api/booking/verify/email/confirm/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import {
//   verifyOTP,
//   deleteOTP,
//   OTPMethod,
// } from '@/lib/otp-store';

// // ---------- Типы ----------

// type ConfirmCodeRequest = {
//   email?: string;
//   code?: string;
//   draftId?: string;
// };

// type VerifyResponse =
//   | {
//       ok: true;
//       message: string;
//       appointmentId: string;
//     }
//   | {
//       ok: false;
//       error: string;
//     };

// // ---------- Вспомогательные функции ----------

// /**
//  * Проверяет что слот всё ещё свободен
//  */
// async function checkSlotConflict(
//   masterId: string,
//   startAt: Date,
//   endAt: Date
// ): Promise<boolean> {
//   const conflict = await prisma.appointment.findFirst({
//     where: {
//       masterId,
//       status: { in: ['PENDING', 'CONFIRMED'] },
//       OR: [
//         {
//           startAt: { lt: endAt },
//           endAt: { gt: startAt },
//         },
//       ],
//     },
//   });

//   return !!conflict;
// }

// /**
//  * Создаёт Appointment из BookingDraft
//  */
// async function createAppointmentFromDraft(draftId: string) {
//   const draft = await prisma.bookingDraft.findUnique({
//     where: { id: draftId },
//   });

//   if (!draft) {
//     throw new Error('Черновик не найден');
//   }

//   // Проверяем конфликт слота
//   const hasConflict = await checkSlotConflict(
//     draft.masterId,
//     draft.startAt,
//     draft.endAt
//   );

//   if (hasConflict) {
//     throw new Error('Выбранное время уже занято. Пожалуйста, выберите другое время.');
//   }

//   // Создаём Appointment с правильной обработкой nullable полей
//   const appointment = await prisma.appointment.create({
//     data: {
//       serviceId: draft.serviceId,
//       masterId: draft.masterId,
//       startAt: draft.startAt,
//       endAt: draft.endAt,
//       customerName: draft.customerName,
//       phone: draft.phone,
//       email: draft.email,
//       birthDate: draft.birthDate || null,  // ✅ Правильная обработка nullable
//       referral: draft.referral || null,     // ✅ Правильная обработка nullable
//       notes: draft.notes || null,           // ✅ Правильная обработка nullable
//       status: 'PENDING',
//     },
//   });

//   // Удаляем черновик
//   await prisma.bookingDraft.delete({
//     where: { id: draftId },
//   });

//   return appointment;
// }

// // ---------- API Handler ----------

// export async function POST(
//   req: NextRequest
// ): Promise<NextResponse<VerifyResponse>> {
//   try {
//     const body = (await req.json()) as ConfirmCodeRequest;
//     const { email, code, draftId } = body;

//     // Валидация
//     if (!email || !code || !draftId) {
//       return NextResponse.json(
//         { ok: false, error: 'Все поля обязательны' },
//         { status: 400 }
//       );
//     }

//     console.log(`[OTP Verify] Проверка кода для ${email}:${draftId}`);

//     // Проверяем OTP код через централизованную функцию
//     const isValid = verifyOTP('email' as OTPMethod, email, draftId, code);

//     if (!isValid) {
//       console.log(`[OTP Verify] Неверный код для ${email}:${draftId}`);
//       return NextResponse.json(
//         { ok: false, error: 'Неверный код или email' },
//         { status: 400 }
//       );
//     }

//     console.log(`[OTP Verify] Код подтверждён для ${email}:${draftId}`);

//     // Создаём Appointment
//     const appointment = await createAppointmentFromDraft(draftId);

//     // Удаляем OTP код из хранилища
//     deleteOTP('email' as OTPMethod, email, draftId);

//     console.log(`[OTP Verify] Appointment создан: ${appointment.id}`);

//     return NextResponse.json({
//       ok: true,
//       message: 'Запись подтверждена',
//       appointmentId: appointment.id,
//     });
//   } catch (error) {
//     console.error('[OTP Verify Error]:', error);

//     const errorMessage =
//       error instanceof Error ? error.message : 'Ошибка подтверждения кода';

//     return NextResponse.json(
//       { ok: false, error: errorMessage },
//       { status: 500 }
//     );
//   }
// }