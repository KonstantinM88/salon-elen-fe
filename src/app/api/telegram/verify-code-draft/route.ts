// src/app/api/telegram/verify-code-draft/route.ts
// ✅ По аналогии с verify-code/route.ts
// ✅ БЕЗ any - явная типизация tx
// ✅ БЕЗ обновления TelegramUser.email (вызывает конфликт)
// ✅ БЕЗ отправки уведомления - оно отправится после оплаты

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhoneDigits } from '@/lib/phone';

interface VerifyCodeDraftRequest {
  sessionId: string;
  code: string;
  draftId: string;
}

// ✅ Определяем тип транзакции Prisma
type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

type TelegramUserMatch = {
  firstName: string | null;
  lastName: string | null;
};

export async function POST(request: NextRequest) {
  console.log('=== [Telegram Verify Code Draft] START ===');
  
  try {
    const body: VerifyCodeDraftRequest = await request.json();
    const { sessionId, code, draftId } = body;

    console.log('[Telegram Verify Code Draft] Request:', { sessionId, code, draftId });

    if (!sessionId || !code || !draftId) {
      console.log('[Telegram Verify Code Draft] ERROR: Missing fields');
      return NextResponse.json(
        { error: 'Missing sessionId, code, or draftId' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      console.log('[Telegram Verify Code Draft] ERROR: Invalid code format');
      return NextResponse.json(
        { error: 'Code must be 6 digits' },
        { status: 400 }
      );
    }

    console.log('[Telegram Verify Code Draft] Looking up verification...');
    
    const verification = await prisma.telegramVerification.findUnique({
      where: { sessionId },
    });

    if (!verification) {
      console.log('[Telegram Verify Code Draft] ERROR: Session not found');
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('[Telegram Verify Code Draft] Verification found:', {
      id: verification.id,
      phone: verification.phone,
      verified: verification.verified,
      expiresAt: verification.expiresAt,
    });

    if (new Date() > verification.expiresAt) {
      console.log('[Telegram Verify Code Draft] ERROR: Code expired');
      return NextResponse.json(
        { error: 'Code expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (verification.verified) {
      console.log('[Telegram Verify Code Draft] ERROR: Code already used');
      return NextResponse.json(
        { error: 'Code already used' },
        { status: 400 }
      );
    }

    if (verification.code !== code) {
      console.log('[Telegram Verify Code Draft] ERROR: Invalid code. Expected:', verification.code, 'Got:', code);
      return NextResponse.json(
        { error: 'Invalid code' },
        { status: 400 }
      );
    }

    console.log('[Telegram Verify Code Draft] Code is valid!');

    // Загрузить BookingDraft
    console.log('[Telegram Verify Code Draft] Loading draft:', draftId);
    
    const draft = await prisma.bookingDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      console.log('[Telegram Verify Code Draft] ERROR: Draft not found');
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    console.log('[Telegram Verify Code Draft] Draft loaded:', {
      customerName: draft.customerName,
      email: draft.email,
    });

    // Получить данные пользователя из TelegramUser
    let telegramUser: TelegramUserMatch | null = null;

    if (verification.telegramUserId) {
      telegramUser = await prisma.telegramUser.findUnique({
        where: { telegramUserId: verification.telegramUserId },
        select: {
          firstName: true,
          lastName: true,
        },
      });
    }

    if (!telegramUser) {
      const phoneDigits = normalizePhoneDigits(verification.phone);
      const matches = await prisma.telegramUser.findMany({
        where: { phone: { endsWith: phoneDigits } },
        select: {
          firstName: true,
          lastName: true,
        },
      });

      if (matches.length === 1) {
        telegramUser = matches[0];
      }
    }

    console.log('[Telegram Verify Code Draft] Telegram user:', telegramUser);

    // Определяем customerName с приоритетом
    let customerName = draft.customerName;
    
    if (telegramUser && telegramUser.firstName) {
      customerName = telegramUser.lastName 
        ? `${telegramUser.firstName} ${telegramUser.lastName}`.trim()
        : telegramUser.firstName;
      console.log('[Telegram Verify Code Draft] Using name from TelegramUser:', customerName);
    }

    // Финальные данные
    const finalEmail = verification.email || draft.email;
    const finalBirthDate = verification.birthDate || draft.birthDate;

    console.log('[Telegram Verify Code Draft] Creating appointment...');

    // ✅ ПРОСТАЯ ТРАНЗАКЦИЯ - с явной типизацией tx
    // ✅ БЕЗ обновления TelegramUser.email (вызывает конфликт)
    const appointment = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Обновить verification
      await tx.telegramVerification.update({
        where: { id: verification.id },
        data: { verified: true },
      });

      console.log('[Telegram Verify Code Draft] Transaction: Creating appointment...');

      // Создать Appointment из Draft
      const newAppointment = await tx.appointment.create({
        data: {
          serviceId: draft.serviceId,
          masterId: draft.masterId,
          startAt: draft.startAt,
          endAt: draft.endAt,
          customerName: customerName,
          phone: verification.phone,
          email: finalEmail || null,
          birthDate: finalBirthDate || null,
          notes: draft.notes || null,
          referral: draft.referral || null,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        },
      });

      console.log('[Telegram Verify Code Draft] Transaction: Appointment created:', newAppointment.id);

      // Связать verification с appointment
      await tx.telegramVerification.update({
        where: { id: verification.id },
        data: { appointmentId: newAppointment.id },
      });

      return newAppointment;
    });

    console.log('[Telegram Verify Code Draft] Transaction completed!');
    console.log('[Telegram Verify Code Draft] SUCCESS');

    return NextResponse.json({
      success: true,
      verified: true,
      appointmentId: appointment.id,
      message: 'Code verified and appointment created',
    });
  } catch (error) {
    console.error('=== [Telegram Verify Code Draft] ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}







//----------возникает ошибка если емейл уже существует но другой номер телефона, можно будет позже подумать
//  как это обработать лучше, пока не обновляем емейл если другой номер телефона----------
// // src/app/api/telegram/verify-code-draft/route.ts
// // ✅ Проверка кода и создание Appointment из BookingDraft
// // ✅ БЕЗ отправки уведомления - оно отправится после оплаты
// // ✅ Оптимизированная транзакция без include

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// interface VerifyCodeDraftRequest {
//   sessionId: string;
//   code: string;
//   draftId: string;
// }

// // Определяем тип транзакции Prisma
// type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// export async function POST(request: NextRequest) {
//   console.log('=== [Telegram Verify Code Draft] START ===');
  
//   try {
//     const body: VerifyCodeDraftRequest = await request.json();
//     const { sessionId, code, draftId } = body;

//     console.log('[Telegram Verify Code Draft] Request:', { sessionId, code, draftId });

//     if (!sessionId || !code || !draftId) {
//       console.log('[Telegram Verify Code Draft] ERROR: Missing fields');
//       return NextResponse.json(
//         { error: 'Missing sessionId, code, or draftId' },
//         { status: 400 }
//       );
//     }

//     if (!/^\d{6}$/.test(code)) {
//       console.log('[Telegram Verify Code Draft] ERROR: Invalid code format');
//       return NextResponse.json(
//         { error: 'Code must be 6 digits' },
//         { status: 400 }
//       );
//     }

//     console.log('[Telegram Verify Code Draft] Looking up verification...');
    
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       console.log('[Telegram Verify Code Draft] ERROR: Session not found');
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     console.log('[Telegram Verify Code Draft] Verification found:', {
//       id: verification.id,
//       phone: verification.phone,
//       verified: verification.verified,
//       expiresAt: verification.expiresAt,
//     });

//     if (new Date() > verification.expiresAt) {
//       console.log('[Telegram Verify Code Draft] ERROR: Code expired');
//       return NextResponse.json(
//         { error: 'Code expired. Please request a new one.' },
//         { status: 400 }
//       );
//     }

//     if (verification.verified) {
//       console.log('[Telegram Verify Code Draft] ERROR: Code already used');
//       return NextResponse.json(
//         { error: 'Code already used' },
//         { status: 400 }
//       );
//     }

//     if (verification.code !== code) {
//       console.log('[Telegram Verify Code Draft] ERROR: Invalid code. Expected:', verification.code, 'Got:', code);
//       return NextResponse.json(
//         { error: 'Invalid code' },
//         { status: 400 }
//       );
//     }

//     console.log('[Telegram Verify Code Draft] Code is valid!');

//     // Загрузить BookingDraft
//     console.log('[Telegram Verify Code Draft] Loading draft:', draftId);
    
//     const draft = await prisma.bookingDraft.findUnique({
//       where: { id: draftId },
//     });

//     if (!draft) {
//       console.log('[Telegram Verify Code Draft] ERROR: Draft not found');
//       return NextResponse.json(
//         { error: 'Draft not found' },
//         { status: 404 }
//       );
//     }

//     console.log('[Telegram Verify Code Draft] Draft loaded:', {
//       customerName: draft.customerName,
//       email: draft.email,
//     });

//     // Получить данные пользователя из TelegramUser
//     const telegramUser = await prisma.telegramUser.findUnique({
//       where: { phone: verification.phone },
//       select: {
//         email: true,
//         telegramUserId: true,
//         firstName: true,
//         lastName: true,
//       },
//     });

//     console.log('[Telegram Verify Code Draft] Telegram user:', telegramUser);

//     // Определяем customerName с приоритетом
//     let customerName = draft.customerName;
    
//     if (telegramUser && telegramUser.firstName) {
//       customerName = telegramUser.lastName 
//         ? `${telegramUser.firstName} ${telegramUser.lastName}`.trim()
//         : telegramUser.firstName;
//       console.log('[Telegram Verify Code Draft] Using name from TelegramUser:', customerName);
//     }

//     // Финальные данные
//     const finalEmail = verification.email || draft.email;
//     const finalBirthDate = verification.birthDate || draft.birthDate;

//     console.log('[Telegram Verify Code Draft] Starting transaction...');

//     // ✅ ОПТИМИЗИРОВАННАЯ ТРАНЗАКЦИЯ - БЕЗ include
//     const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
//       // Обновить verification
//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { verified: true },
//       });

//       console.log('[Telegram Verify Code Draft] Transaction: Creating appointment...');

//       // Создать Appointment из Draft БЕЗ include
//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: draft.serviceId,
//           masterId: draft.masterId,
//           startAt: draft.startAt,
//           endAt: draft.endAt,
//           customerName: customerName,
//           phone: verification.phone,
//           email: finalEmail || null,
//           birthDate: finalBirthDate || null,
//           notes: draft.notes || null,
//           referral: draft.referral || null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//       });

//       console.log('[Telegram Verify Code Draft] Transaction: Appointment created:', appointment.id);

//       // Связать verification с appointment
//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       // Обновить TelegramUser email если нужно
//       if (finalEmail && telegramUser) {
//         await tx.telegramUser.update({
//           where: { phone: verification.phone },
//           data: { email: finalEmail },
//         });
//       }

//       return { appointmentId: appointment.id };
//     });

//     console.log('[Telegram Verify Code Draft] Transaction completed!');

//     // ❌ ЗАКОММЕНТИРОВАНО: Уведомление отправится после оплаты
//     // ✅ Если нужно отправить уведомление, раскомментируй и загрузи данные:
//     /*
//     const appointmentWithDetails = await prisma.appointment.findUnique({
//       where: { id: result.appointmentId },
//       include: {
//         service: true,
//         master: true,
//       },
//     });

//     if (appointmentWithDetails) {
//       sendAdminNotification({
//         id: appointmentWithDetails.id,
//         customerName: appointmentWithDetails.customerName,
//         phone: appointmentWithDetails.phone,
//         email: appointmentWithDetails.email,
//         serviceName: appointmentWithDetails.service.name,
//         masterName: appointmentWithDetails.master?.name || 'Не указан',
//         masterId: appointmentWithDetails.masterId,
//         startAt: appointmentWithDetails.startAt,
//         endAt: appointmentWithDetails.endAt,
//         paymentStatus: appointmentWithDetails.paymentStatus,
//       }).catch(err => {
//         console.error('[Telegram Verify Code Draft] Notification error:', err);
//       });
//     }
//     */

//     console.log('[Telegram Verify Code Draft] SUCCESS');

//     return NextResponse.json({
//       success: true,
//       verified: true,
//       appointmentId: result.appointmentId,
//       message: 'Code verified and appointment created',
//     });
//   } catch (error) {
//     console.error('=== [Telegram Verify Code Draft] ERROR ===');
//     console.error('Error details:', error);
//     console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }






// // src/app/api/telegram/verify-code-draft/route.ts
// // ✅ Проверка кода и создание Appointment из BookingDraft

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// // import { sendAdminNotification } from '@/lib/send-admin-notification';

// interface VerifyCodeDraftRequest {
//   sessionId: string;
//   code: string;
//   draftId: string;
// }

// // Определяем тип транзакции Prisma
// type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// export async function POST(request: NextRequest) {
//   console.log('=== [Telegram Verify Code Draft] START ===');
  
//   try {
//     const body: VerifyCodeDraftRequest = await request.json();
//     const { sessionId, code, draftId } = body;

//     console.log('[Telegram Verify Code Draft] Request:', { sessionId, code, draftId });

//     if (!sessionId || !code || !draftId) {
//       console.log('[Telegram Verify Code Draft] ERROR: Missing fields');
//       return NextResponse.json(
//         { error: 'Missing sessionId, code, or draftId' },
//         { status: 400 }
//       );
//     }

//     if (!/^\d{6}$/.test(code)) {
//       console.log('[Telegram Verify Code Draft] ERROR: Invalid code format');
//       return NextResponse.json(
//         { error: 'Code must be 6 digits' },
//         { status: 400 }
//       );
//     }

//     console.log('[Telegram Verify Code Draft] Looking up verification...');
    
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       console.log('[Telegram Verify Code Draft] ERROR: Session not found');
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     console.log('[Telegram Verify Code Draft] Verification found:', {
//       id: verification.id,
//       phone: verification.phone,
//       verified: verification.verified,
//       expiresAt: verification.expiresAt,
//     });

//     if (new Date() > verification.expiresAt) {
//       console.log('[Telegram Verify Code Draft] ERROR: Code expired');
//       return NextResponse.json(
//         { error: 'Code expired. Please request a new one.' },
//         { status: 400 }
//       );
//     }

//     if (verification.verified) {
//       console.log('[Telegram Verify Code Draft] ERROR: Code already used');
//       return NextResponse.json(
//         { error: 'Code already used' },
//         { status: 400 }
//       );
//     }

//     if (verification.code !== code) {
//       console.log('[Telegram Verify Code Draft] ERROR: Invalid code');
//       return NextResponse.json(
//         { error: 'Invalid code' },
//         { status: 400 }
//       );
//     }

//     console.log('[Telegram Verify Code Draft] Code is valid!');

//     // Загрузить BookingDraft
//     console.log('[Telegram Verify Code Draft] Loading draft:', draftId);
    
//     const draft = await prisma.bookingDraft.findUnique({
//       where: { id: draftId },
//     });

//     if (!draft) {
//       console.log('[Telegram Verify Code Draft] ERROR: Draft not found');
//       return NextResponse.json(
//         { error: 'Draft not found' },
//         { status: 404 }
//       );
//     }

//     console.log('[Telegram Verify Code Draft] Draft loaded:', {
//       customerName: draft.customerName,
//       email: draft.email,
//     });

//     // Получить данные пользователя из TelegramUser
//     const telegramUser = await prisma.telegramUser.findUnique({
//       where: { phone: verification.phone },
//       select: {
//         email: true,
//         telegramUserId: true,
//         firstName: true,
//         lastName: true,
//       },
//     });

//     console.log('[Telegram Verify Code Draft] Telegram user:', telegramUser);

//     // Определяем customerName с приоритетом
//     let customerName = draft.customerName;
    
//     if (telegramUser && telegramUser.firstName) {
//       customerName = telegramUser.lastName 
//         ? `${telegramUser.firstName} ${telegramUser.lastName}`.trim()
//         : telegramUser.firstName;
//       console.log('[Telegram Verify Code Draft] Using name from TelegramUser:', customerName);
//     }

//     // Финальные данные
//     const finalEmail = verification.email || draft.email;
//     const finalBirthDate = verification.birthDate || draft.birthDate;

//     console.log('[Telegram Verify Code Draft] Starting transaction...');

//     const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
//       // Обновить verification
//       const updatedVerification = await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { verified: true },
//       });

//       console.log('[Telegram Verify Code Draft] Transaction: Creating appointment...');

//       // Создать Appointment из Draft
//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: draft.serviceId,
//           masterId: draft.masterId,
//           startAt: draft.startAt,
//           endAt: draft.endAt,
//           customerName: customerName,
//           phone: verification.phone,
//           email: finalEmail || null,
//           birthDate: finalBirthDate || null,
//           notes: draft.notes || null,
//           referral: draft.referral || null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//         include: {
//           service: true,
//           master: true,
//         },
//       });

//       console.log('[Telegram Verify Code Draft] Transaction: Appointment created:', appointment.id);

//       // Связать verification с appointment
//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       // Обновить TelegramUser email если нужно
//       if (finalEmail && telegramUser) {
//         await tx.telegramUser.update({
//           where: { phone: verification.phone },
//           data: { email: finalEmail },
//         });
//       }

//       return { appointment, verification: updatedVerification };
//     });

//     console.log('[Telegram Verify Code Draft] Transaction completed!');

//     // // Отправить уведомление администратору
//     // sendAdminNotification({
//     //   id: result.appointment.id,
//     //   customerName: result.appointment.customerName,
//     //   phone: result.appointment.phone,
//     //   email: result.appointment.email,
//     //   serviceName: result.appointment.service.name,
//     //   masterName: result.appointment.master?.name || 'Не указан',
//     //   masterId: result.appointment.masterId,
//     //   startAt: result.appointment.startAt,
//     //   endAt: result.appointment.endAt,
//     //   paymentStatus: result.appointment.paymentStatus,
//     // }).catch(err => {
//     //   console.error('[Telegram Verify Code Draft] Notification error:', err);
//     // });

//     console.log('[Telegram Verify Code Draft] SUCCESS');

//     return NextResponse.json({
//       success: true,
//       verified: true,
//       appointmentId: result.appointment.id,
//       message: 'Code verified and appointment created',
//     });
//   } catch (error) {
//     console.error('=== [Telegram Verify Code Draft] ERROR ===');
//     console.error('Error details:', error);
    
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }
