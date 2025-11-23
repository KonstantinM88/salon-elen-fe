// src/app/api/booking/verify/telegram/callback/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { confirmOTP, getOTP } from '@/lib/otp-store';

type TelegramCallbackRequest = {
  payload?: string;
  telegramUserId?: number;
  telegramChatId?: number;
};

type TelegramCallbackResponse = {
  success: boolean;
  email?: string;
  draftId?: string;
  message?: string;
};

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
    throw new Error('Выбранное время уже занято');
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
    },
  });

  // Удаляем черновик
  await prisma.bookingDraft.delete({
    where: { id: draftId },
  });

  return appointment;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<TelegramCallbackResponse>> {
  try {
    const body = (await req.json()) as TelegramCallbackRequest;
    const { payload, telegramUserId } = body;

    // Валидация
    if (!payload || !telegramUserId) {
      return NextResponse.json(
        { success: false, message: 'Payload и telegramUserId обязательны' },
        { status: 400 }
      );
    }

    console.log(`[Telegram Callback] Получен payload: ${payload}`);
    console.log(`[Telegram Callback] Payload длина: ${payload.length} символов`);

    // Декодируем payload
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    console.log(`[Telegram Callback] Decoded:`, decoded);
    
    // ✅ ИСПРАВЛЕНО: Поддержка короткого формата
    const draftId = decoded.d || decoded.draftId;
    let email = decoded.e || decoded.email;

    if (!draftId) {
      return NextResponse.json(
        { success: false, message: 'Неверный payload: отсутствует draftId' },
        { status: 400 }
      );
    }

    // Если email нет в payload, получаем его из БД
    if (!email) {
      console.log(`[Telegram Callback] Email отсутствует в payload, получаем из БД...`);
      
      const draft = await prisma.bookingDraft.findUnique({
        where: { id: draftId },
        select: { email: true },
      });

      if (!draft) {
        return NextResponse.json(
          { success: false, message: 'Черновик не найден' },
          { status: 404 }
        );
      }

      email = draft.email;
      console.log(`[Telegram Callback] Email из БД: ${email}`);
    }

    console.log(`[Telegram Callback] Подтверждение для ${email}:${draftId}`);

    // Проверяем что OTP существует
    const otpEntry = getOTP('telegram', email, draftId);

    if (!otpEntry) {
      return NextResponse.json(
        {
          success: false,
          message: 'Код подтверждения не найден или истёк',
        },
        { status: 404 }
      );
    }

    // Устанавливаем статус подтверждения
    const confirmed = confirmOTP('telegram', email, draftId, telegramUserId);

    if (!confirmed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Не удалось подтвердить код',
        },
        { status: 400 }
      );
    }

    console.log(`[Telegram Callback] Код подтверждён для ${email}:${draftId}`);

    // Создаём Appointment
    const appointment = await createAppointmentFromDraft(draftId);

    console.log(`[Telegram Callback] Appointment создан: ${appointment.id}`);

    return NextResponse.json({
      success: true,
      email,
      draftId,
      message: 'Запись подтверждена успешно',
    });
  } catch (error) {
    console.error('[Telegram Callback Error]:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Ошибка подтверждения';

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}


// // src/app/api/booking/verify/telegram/callback/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { confirmOTP, getOTP } from '@/lib/otp-store';

// type TelegramCallbackRequest = {
//   payload?: string;
//   telegramUserId?: number;
//   telegramChatId?: number;
// };

// type TelegramCallbackResponse = {
//   success: boolean;
//   email?: string;
//   draftId?: string;
//   message?: string;
// };

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
//     throw new Error('Выбранное время уже занято');
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

// export async function POST(
//   req: NextRequest
// ): Promise<NextResponse<TelegramCallbackResponse>> {
//   try {
//     const body = (await req.json()) as TelegramCallbackRequest;
//     const { payload, telegramUserId } = body;

//     // Валидация
//     if (!payload || !telegramUserId) {
//       return NextResponse.json(
//         { success: false, message: 'Payload и telegramUserId обязательны' },
//         { status: 400 }
//       );
//     }

//     // Декодируем payload
//     const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
//     const { draftId, email } = decoded;

//     if (!draftId || !email) {
//       return NextResponse.json(
//         { success: false, message: 'Неверный payload' },
//         { status: 400 }
//       );
//     }

//     console.log(`[Telegram Callback] Подтверждение для ${email}:${draftId}`);

//     // Проверяем что OTP существует
//     const otpEntry = getOTP('telegram', email, draftId);

//     if (!otpEntry) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Код подтверждения не найден или истёк',
//         },
//         { status: 404 }
//       );
//     }

//     // Устанавливаем статус подтверждения
//     const confirmed = confirmOTP('telegram', email, draftId, telegramUserId);

//     if (!confirmed) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: 'Не удалось подтвердить код',
//         },
//         { status: 400 }
//       );
//     }

//     console.log(`[Telegram Callback] Код подтверждён для ${email}:${draftId}`);

//     // Создаём Appointment
//     const appointment = await createAppointmentFromDraft(draftId);

//     console.log(`[Telegram Callback] Appointment создан: ${appointment.id}`);

//     return NextResponse.json({
//       success: true,
//       email,
//       draftId,
//       message: 'Запись подтверждена успешно',
//     });
//   } catch (error) {
//     console.error('[Telegram Callback Error]:', error);

//     const errorMessage =
//       error instanceof Error ? error.message : 'Ошибка подтверждения';

//     return NextResponse.json(
//       {
//         success: false,
//         message: errorMessage,
//       },
//       { status: 500 }
//     );
//   }
// }

// // src/app/api/booking/verify/telegram/callback/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { AppointmentStatus } from '@prisma/client';
// import { getOTP, confirmOTP, deleteOTP } from '@/lib/otp-store';

// /**
//  * Webhook для автоподтверждения через кнопку в Telegram боте
//  * 
//  * Вызывается Telegram ботом когда пользователь нажимает "✅ Подтвердить сейчас"
//  */

// type CallbackBody = {
//   email?: string;
//   draftId?: string;
//   telegramUserId?: number;
//   telegramChatId?: number;
// };

// type SuccessResponse = {
//   ok: true;
//   message: string;
//   appointmentId: string;
// };

// type ErrorResponse = {
//   ok: false;
//   error: string;
// };

// type ApiResponse = SuccessResponse | ErrorResponse;

// export async function POST(
//   req: NextRequest
// ): Promise<NextResponse<ApiResponse>> {
//   try {
//     const body = (await req.json()) as CallbackBody;
//     const { email, draftId, telegramUserId, telegramChatId } = body;

//     // Валидация
//     if (!email || !draftId || !telegramUserId) {
//       return NextResponse.json(
//         { ok: false, error: 'Email, draftId и telegramUserId обязательны' },
//         { status: 400 }
//       );
//     }

//     console.log(
//       `[Telegram Callback] Автоподтверждение для ${email}:${draftId} от пользователя ${telegramUserId}`
//     );

//     // Получаем OTP запись
//     const otpEntry = getOTP('telegram', email, draftId);

//     if (!otpEntry) {
//       return NextResponse.json(
//         { ok: false, error: 'Код не найден или истёк' },
//         { status: 404 }
//       );
//     }

//     // Проверяем срок действия
//     if (Date.now() > otpEntry.expiresAt) {
//       deleteOTP('telegram', email, draftId);
//       return NextResponse.json(
//         { ok: false, error: 'Срок действия кода истёк' },
//         { status: 400 }
//       );
//     }

//     // Помечаем как подтверждённый
//     const confirmed = confirmOTP('telegram', email, draftId);

//     if (!confirmed) {
//       return NextResponse.json(
//         { ok: false, error: 'Не удалось подтвердить код' },
//         { status: 500 }
//       );
//     }

//     // Достаём черновик
//     const draft = await prisma.bookingDraft.findUnique({
//       where: { id: draftId },
//     });

//     if (!draft) {
//       return NextResponse.json(
//         { ok: false, error: 'Черновик записи не найден' },
//         { status: 404 }
//       );
//     }

//     // Проверяем email
//     if (draft.email !== email) {
//       return NextResponse.json(
//         { ok: false, error: 'E-mail не совпадает с данными черновика' },
//         { status: 400 }
//       );
//     }

//     // Проверяем что слот всё ещё свободен
//     const overlapping = await prisma.appointment.findFirst({
//       where: {
//         masterId: draft.masterId,
//         status: {
//           in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
//         },
//         startAt: { lt: draft.endAt },
//         endAt: { gt: draft.startAt },
//       },
//       select: { id: true },
//     });

//     if (overlapping) {
//       return NextResponse.json(
//         { ok: false, error: 'Выбранный слот уже занят' },
//         { status: 409 }
//       );
//     }

//     // ✅ Создаём реальную запись из черновика
//     const appointment = await prisma.appointment.create({
//       data: {
//         serviceId: draft.serviceId,
//         masterId: draft.masterId,
//         startAt: draft.startAt,
//         endAt: draft.endAt,
//         customerName: draft.customerName,
//         phone: draft.phone,
//         email: draft.email,
//         notes: draft.notes ? `${draft.notes} [Подтверждено через Telegram]` : '[Подтверждено через Telegram]',
//         status: AppointmentStatus.PENDING,
//       },
//       select: { id: true },
//     });

//     // Удаляем код из хранилища
//     deleteOTP('telegram', email, draftId);

//     // Удаляем черновик
//     try {
//       await prisma.bookingDraft.delete({ where: { id: draftId } });
//     } catch (cleanupErr) {
//       console.warn('[Telegram Callback] Не удалось удалить черновик', cleanupErr);
//     }

//     console.log(
//       `[Telegram Callback] ✅ Автоподтверждение успешно! Создана запись ${appointment.id}`
//     );

//     return NextResponse.json({
//       ok: true,
//       message: 'Запись успешно подтверждена через Telegram!',
//       appointmentId: appointment.id,
//     });
//   } catch (error) {
//     console.error('[Telegram Callback Error]:', error);
//     return NextResponse.json(
//       { ok: false, error: 'Ошибка автоподтверждения' },
//       { status: 500 }
//     );
//   }
// }
