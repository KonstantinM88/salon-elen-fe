// src/app/api/telegram/complete-registration/route.ts
// ✅ ИСПРАВЛЕНО: 
// 1. Использует firstName из TelegramUser для customerName
// 2. Fallback на email только если firstName отсутствует
// 3. ДОБАВЛЕНО: Автоматическое создание клиентов

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizePhoneDigits } from '@/lib/phone';
// import { sendAdminNotification } from '@/lib/send-admin-notification';

// Определяем тип транзакции Prisma
type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

interface CompleteRegistrationRequest {
  sessionId: string;
  email?: string | null;
  birthDate?: string | null;
  telegramUserId?: number | null;
}

interface AppointmentResponse {
  id: string;
  serviceId: string;
  serviceName: string;
  masterId: string | null;
  masterName: string;
  startAt: Date;
  endAt: Date;
  status: string;
  paymentStatus: string;
}

interface CompleteRegistrationResponse {
  success: boolean;
  appointmentId: string;
  appointment: AppointmentResponse;
  message: string;
}

type TelegramUserMatch = {
  id: string;
  email: string | null;
  telegramUserId: bigint | null;
  firstName: string | null;
  lastName: string | null;
};

export async function POST(request: NextRequest) {
  console.log('=== [Complete Registration] START ===');
  
  try {
    const body: CompleteRegistrationRequest = await request.json();
    console.log('[Complete Registration] Request body:', JSON.stringify(body, null, 2));
    
    const { sessionId, email, birthDate, telegramUserId } = body;

    if (!sessionId) {
      console.log('[Complete Registration] ERROR: Missing sessionId');
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    console.log('[Complete Registration] Looking up verification:', sessionId);
    
    const verification = await prisma.telegramVerification.findUnique({
      where: { sessionId },
    });

    if (!verification) {
      console.log('[Complete Registration] ERROR: Session not found');
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('[Complete Registration] Verification found:', {
      id: verification.id,
      phone: verification.phone,
      verified: verification.verified,
      appointmentId: verification.appointmentId,
    });

    if (!verification.verified) {
      console.log('[Complete Registration] ERROR: Session not verified');
      return NextResponse.json(
        { error: 'Session not verified. Please verify code first.' },
        { status: 400 }
      );
    }

    if (verification.appointmentId) {
      console.log('[Complete Registration] ERROR: Appointment already created:', verification.appointmentId);
      return NextResponse.json(
        { error: 'Appointment already created' },
        { status: 400 }
      );
    }

    if (new Date() > verification.expiresAt) {
      console.log('[Complete Registration] ERROR: Session expired');
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 400 }
      );
    }

    let finalEmail = email;
    const finalBirthDate = birthDate;
    let finalTelegramUserId = telegramUserId;

    console.log('[Complete Registration] Looking up TelegramUser:', verification.phone);

    // ✅ ИСПРАВЛЕНО: Получаем ВСЕ данные включая firstName, lastName
    let existingUser: TelegramUserMatch | null = null;

    if (verification.telegramUserId) {
      existingUser = await prisma.telegramUser.findUnique({
        where: { telegramUserId: verification.telegramUserId },
        select: {
          id: true,
          email: true,
          telegramUserId: true,
          firstName: true,
          lastName: true,
        },
      });
    }

    if (!existingUser) {
      const phoneDigits = normalizePhoneDigits(verification.phone);
      const matches = await prisma.telegramUser.findMany({
        where: { phone: { endsWith: phoneDigits } },
        select: {
          id: true,
          email: true,
          telegramUserId: true,
          firstName: true,
          lastName: true,
        },
      });

      if (matches.length === 1) {
        existingUser = matches[0];
      }
    }

    if (existingUser) {
      console.log('[Complete Registration] Existing user found:', existingUser);
      
      if (!finalEmail && existingUser.email) {
        finalEmail = existingUser.email;
        console.log('[Complete Registration] Using email from TelegramUser:', finalEmail);
      }

      if (!finalTelegramUserId && existingUser.telegramUserId) {
        finalTelegramUserId = Number(existingUser.telegramUserId);
        console.log('[Complete Registration] Using telegramUserId:', finalTelegramUserId);
      }
    } else {
      console.log('[Complete Registration] No existing TelegramUser found');
    }

    if (!finalTelegramUserId && verification.telegramUserId) {
      finalTelegramUserId = Number(verification.telegramUserId);
      console.log('[Complete Registration] Using telegramUserId from verification:', finalTelegramUserId);
    }

    if (finalEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail)) {
        console.log('[Complete Registration] ERROR: Invalid email:', finalEmail);
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    console.log('[Complete Registration] Final data:', {
      email: finalEmail,
      birthDate: finalBirthDate,
      telegramUserId: finalTelegramUserId,
    });

    // ✅ ИСПРАВЛЕНО: Определяем customerName с приоритетом firstName
    let customerName = 'Telegram User';
    
    if (existingUser) {
      if (existingUser.firstName) {
        // Используем firstName + lastName если есть
        customerName = existingUser.lastName 
          ? `${existingUser.firstName} ${existingUser.lastName}`.trim()
          : existingUser.firstName;
        console.log('[Complete Registration] Using name from TelegramUser:', customerName);
      } else if (finalEmail) {
        // Fallback на email только если firstName нет
        customerName = finalEmail.split('@')[0];
        console.log('[Complete Registration] Using email as name:', customerName);
      }
    } else if (finalEmail) {
      // Если пользователя нет вообще - используем email
      customerName = finalEmail.split('@')[0];
      console.log('[Complete Registration] Using email as name (no user):', customerName);
    }

    console.log('[Complete Registration] Starting transaction...');

    let shouldUpdateTelegramEmail = Boolean(finalEmail && existingUser);

    if (shouldUpdateTelegramEmail && finalEmail && existingUser) {
      if (existingUser.email && existingUser.email !== finalEmail) {
        shouldUpdateTelegramEmail = false;
      }
    }

    if (shouldUpdateTelegramEmail && finalEmail && existingUser) {
      const emailOwner = await prisma.telegramUser.findUnique({
        where: { email: finalEmail },
        select: { id: true },
      });

      if (emailOwner && emailOwner.id !== existingUser.id) {
        shouldUpdateTelegramEmail = false;
        console.log('[Complete Registration] Email already in use, skipping TelegramUser update');
      }
    }

    const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      console.log('[Complete Registration] Transaction: Updating verification...');
      
      const updatedVerification = await tx.telegramVerification.update({
        where: { id: verification.id },
        data: {
          email: finalEmail || null,
          birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
          telegramUserId: finalTelegramUserId ? BigInt(finalTelegramUserId) : null,
        },
      });

      console.log('[Complete Registration] Transaction: Creating appointment...');

      // ✅ СОЗДАНИЕ/ПОИСК КЛИЕНТА
      const phoneStr = verification.phone.trim();
      const emailStr = finalEmail ? finalEmail.trim() : '';

      let clientId: string | null = null;

      // Ищем существующего клиента
      if (phoneStr || emailStr) {
        console.log('[Complete Registration] Transaction: Looking for existing client...');
        const existing = await tx.client.findFirst({
          where: {
            OR: [
              ...(phoneStr ? [{ phone: phoneStr }] : []),
              ...(emailStr ? [{ email: emailStr }] : []),
            ],
          },
          select: { id: true, birthDate: true },
        });

        if (existing) {
          clientId = existing.id;
          console.log('[Complete Registration] Transaction: Found existing client:', clientId);
          
          // ✅ ИСПРАВЛЕНИЕ: Обновляем дату рождения, если она изменилась
          if (finalBirthDate) {
            const newBirthDate = new Date(finalBirthDate);
            const existingBirthDate = existing.birthDate;
            
            // Сравниваем даты (только yyyy-mm-dd, игнорируем время)
            const newDateStr = newBirthDate.toISOString().split('T')[0];
            const existingDateStr = existingBirthDate ? existingBirthDate.toISOString().split('T')[0] : null;
            
            if (newDateStr !== existingDateStr) {
              await tx.client.update({
                where: { id: existing.id },
                data: { birthDate: newBirthDate },
              });
              console.log('[Complete Registration] Transaction: Updated client birthDate:', newDateStr);
            }
          }
        }
      }

      // Если не нашли - создаём нового
      if (!clientId && (phoneStr || emailStr)) {
        console.log('[Complete Registration] Transaction: Creating new client...');
        const newClient = await tx.client.create({
          data: {
            name: customerName,
            phone: phoneStr,
            email: emailStr,
            birthDate: finalBirthDate ? new Date(finalBirthDate) : new Date('1990-01-01'),
            referral: null,
          },
          select: { id: true },
        });

        clientId = newClient.id;
        console.log('[Complete Registration] Transaction: Created new client:', clientId);
      }

      const appointment = await tx.appointment.create({
        data: {
          serviceId: verification.serviceId,
          clientId,  // ✅ Связь с клиентом!
          masterId: verification.masterId,
          startAt: new Date(verification.startAt),
          endAt: new Date(verification.endAt),
          customerName: customerName,  // ✅ ИСПРАВЛЕНО: используем вычисленное имя
          phone: verification.phone,
          email: finalEmail || null,
          birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        },
        include: {
          service: true,
          master: true,
        },
      });

      console.log('[Complete Registration] Transaction: Appointment created:', appointment.id);

      console.log('[Complete Registration] Transaction: Linking appointment...');

      await tx.telegramVerification.update({
        where: { id: verification.id },
        data: { appointmentId: appointment.id },
      });

      if (shouldUpdateTelegramEmail && finalEmail && existingUser) {
        console.log('[Complete Registration] Transaction: Updating TelegramUser email...');
        await tx.telegramUser.update({
          where: { id: existingUser.id },
          data: { email: finalEmail },
        });
        console.log('[Complete Registration] Transaction: TelegramUser updated');
      }

      return { appointment, verification: updatedVerification };
    });

    console.log('[Complete Registration] Transaction completed!');
    console.log('[Complete Registration] Created appointment:', result.appointment.id);

    // // 📢 Отправляем уведомление администратору
    // sendAdminNotification({
    //   id: result.appointment.id,
    //   customerName: result.appointment.customerName,  // ✅ Теперь будет "Константин"
    //   phone: result.appointment.phone,
    //   email: result.appointment.email,
    //   serviceName: result.appointment.service.name,
    //   masterName: result.appointment.master?.name || 'Не указан',
    //   masterId: result.appointment.masterId,
    //   startAt: result.appointment.startAt,
    //   endAt: result.appointment.endAt,
    //   paymentStatus: result.appointment.paymentStatus,
    // }).catch(err => {
    //   console.error('[Complete Registration] Notification error:', err);
    // });

    const response: CompleteRegistrationResponse = {
      success: true,
      appointmentId: result.appointment.id,
      appointment: {
        id: result.appointment.id,
        serviceId: result.appointment.serviceId,
        serviceName: result.appointment.service.name,
        masterId: result.appointment.masterId,
        masterName: result.appointment.master?.name || 'Unknown Master',
        startAt: result.appointment.startAt,
        endAt: result.appointment.endAt,
        status: result.appointment.status,
        paymentStatus: result.appointment.paymentStatus,
      },
      message: 'Appointment created successfully',
    };

    console.log('[Complete Registration] Response:', JSON.stringify(response, null, 2));
    console.log('=== [Complete Registration] SUCCESS ===');

    return NextResponse.json(response);
  } catch (error) {
    console.error('=== [Complete Registration] ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('=== [Complete Registration] END (with error) ===');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}






// // src/app/api/telegram/complete-registration/route.ts
// // ✅ ИСПРАВЛЕНО: 
// // 1. Использует firstName из TelegramUser для customerName
// // 2. Fallback на email только если firstName отсутствует
// // 3. ДОБАВЛЕНО: Автоматическое создание клиентов

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { normalizePhoneDigits } from '@/lib/phone';
// // import { sendAdminNotification } from '@/lib/send-admin-notification';

// // Определяем тип транзакции Prisma
// type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// interface CompleteRegistrationRequest {
//   sessionId: string;
//   email?: string | null;
//   birthDate?: string | null;
//   telegramUserId?: number | null;
// }

// interface AppointmentResponse {
//   id: string;
//   serviceId: string;
//   serviceName: string;
//   masterId: string | null;
//   masterName: string;
//   startAt: Date;
//   endAt: Date;
//   status: string;
//   paymentStatus: string;
// }

// interface CompleteRegistrationResponse {
//   success: boolean;
//   appointmentId: string;
//   appointment: AppointmentResponse;
//   message: string;
// }

// type TelegramUserMatch = {
//   id: string;
//   email: string | null;
//   telegramUserId: bigint | null;
//   firstName: string | null;
//   lastName: string | null;
// };

// export async function POST(request: NextRequest) {
//   console.log('=== [Complete Registration] START ===');
  
//   try {
//     const body: CompleteRegistrationRequest = await request.json();
//     console.log('[Complete Registration] Request body:', JSON.stringify(body, null, 2));
    
//     const { sessionId, email, birthDate, telegramUserId } = body;

//     if (!sessionId) {
//       console.log('[Complete Registration] ERROR: Missing sessionId');
//       return NextResponse.json(
//         { error: 'Missing sessionId' },
//         { status: 400 }
//       );
//     }

//     console.log('[Complete Registration] Looking up verification:', sessionId);
    
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       console.log('[Complete Registration] ERROR: Session not found');
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     console.log('[Complete Registration] Verification found:', {
//       id: verification.id,
//       phone: verification.phone,
//       verified: verification.verified,
//       appointmentId: verification.appointmentId,
//     });

//     if (!verification.verified) {
//       console.log('[Complete Registration] ERROR: Session not verified');
//       return NextResponse.json(
//         { error: 'Session not verified. Please verify code first.' },
//         { status: 400 }
//       );
//     }

//     if (verification.appointmentId) {
//       console.log('[Complete Registration] ERROR: Appointment already created:', verification.appointmentId);
//       return NextResponse.json(
//         { error: 'Appointment already created' },
//         { status: 400 }
//       );
//     }

//     if (new Date() > verification.expiresAt) {
//       console.log('[Complete Registration] ERROR: Session expired');
//       return NextResponse.json(
//         { error: 'Session expired' },
//         { status: 400 }
//       );
//     }

//     let finalEmail = email;
//     const finalBirthDate = birthDate;
//     let finalTelegramUserId = telegramUserId;

//     console.log('[Complete Registration] Looking up TelegramUser:', verification.phone);

//     // ✅ ИСПРАВЛЕНО: Получаем ВСЕ данные включая firstName, lastName
//     let existingUser: TelegramUserMatch | null = null;

//     if (verification.telegramUserId) {
//       existingUser = await prisma.telegramUser.findUnique({
//         where: { telegramUserId: verification.telegramUserId },
//         select: {
//           id: true,
//           email: true,
//           telegramUserId: true,
//           firstName: true,
//           lastName: true,
//         },
//       });
//     }

//     if (!existingUser) {
//       const phoneDigits = normalizePhoneDigits(verification.phone);
//       const matches = await prisma.telegramUser.findMany({
//         where: { phone: { endsWith: phoneDigits } },
//         select: {
//           id: true,
//           email: true,
//           telegramUserId: true,
//           firstName: true,
//           lastName: true,
//         },
//       });

//       if (matches.length === 1) {
//         existingUser = matches[0];
//       }
//     }

//     if (existingUser) {
//       console.log('[Complete Registration] Existing user found:', existingUser);
      
//       if (!finalEmail && existingUser.email) {
//         finalEmail = existingUser.email;
//         console.log('[Complete Registration] Using email from TelegramUser:', finalEmail);
//       }

//       if (!finalTelegramUserId && existingUser.telegramUserId) {
//         finalTelegramUserId = Number(existingUser.telegramUserId);
//         console.log('[Complete Registration] Using telegramUserId:', finalTelegramUserId);
//       }
//     } else {
//       console.log('[Complete Registration] No existing TelegramUser found');
//     }

//     if (!finalTelegramUserId && verification.telegramUserId) {
//       finalTelegramUserId = Number(verification.telegramUserId);
//       console.log('[Complete Registration] Using telegramUserId from verification:', finalTelegramUserId);
//     }

//     if (finalEmail) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(finalEmail)) {
//         console.log('[Complete Registration] ERROR: Invalid email:', finalEmail);
//         return NextResponse.json(
//           { error: 'Invalid email format' },
//           { status: 400 }
//         );
//       }
//     }

//     console.log('[Complete Registration] Final data:', {
//       email: finalEmail,
//       birthDate: finalBirthDate,
//       telegramUserId: finalTelegramUserId,
//     });

//     // ✅ ИСПРАВЛЕНО: Определяем customerName с приоритетом firstName
//     let customerName = 'Telegram User';
    
//     if (existingUser) {
//       if (existingUser.firstName) {
//         // Используем firstName + lastName если есть
//         customerName = existingUser.lastName 
//           ? `${existingUser.firstName} ${existingUser.lastName}`.trim()
//           : existingUser.firstName;
//         console.log('[Complete Registration] Using name from TelegramUser:', customerName);
//       } else if (finalEmail) {
//         // Fallback на email только если firstName нет
//         customerName = finalEmail.split('@')[0];
//         console.log('[Complete Registration] Using email as name:', customerName);
//       }
//     } else if (finalEmail) {
//       // Если пользователя нет вообще - используем email
//       customerName = finalEmail.split('@')[0];
//       console.log('[Complete Registration] Using email as name (no user):', customerName);
//     }

//     console.log('[Complete Registration] Starting transaction...');

//     let shouldUpdateTelegramEmail = Boolean(finalEmail && existingUser);

//     if (shouldUpdateTelegramEmail && finalEmail && existingUser) {
//       if (existingUser.email && existingUser.email !== finalEmail) {
//         shouldUpdateTelegramEmail = false;
//       }
//     }

//     if (shouldUpdateTelegramEmail && finalEmail && existingUser) {
//       const emailOwner = await prisma.telegramUser.findUnique({
//         where: { email: finalEmail },
//         select: { id: true },
//       });

//       if (emailOwner && emailOwner.id !== existingUser.id) {
//         shouldUpdateTelegramEmail = false;
//         console.log('[Complete Registration] Email already in use, skipping TelegramUser update');
//       }
//     }

//     const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
//       console.log('[Complete Registration] Transaction: Updating verification...');
      
//       const updatedVerification = await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: {
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           telegramUserId: finalTelegramUserId ? BigInt(finalTelegramUserId) : null,
//         },
//       });

//       console.log('[Complete Registration] Transaction: Creating appointment...');

//       // ✅ СОЗДАНИЕ/ПОИСК КЛИЕНТА
//       const phoneStr = verification.phone.trim();
//       const emailStr = finalEmail ? finalEmail.trim() : '';

//       let clientId: string | null = null;

//       // Ищем существующего клиента
//       if (phoneStr || emailStr) {
//         console.log('[Complete Registration] Transaction: Looking for existing client...');
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
//           console.log('[Complete Registration] Transaction: Found existing client:', clientId);
//         }
//       }

//       // Если не нашли - создаём нового
//       if (!clientId && (phoneStr || emailStr)) {
//         console.log('[Complete Registration] Transaction: Creating new client...');
//         const newClient = await tx.client.create({
//           data: {
//             name: customerName,
//             phone: phoneStr,
//             email: emailStr,
//             birthDate: finalBirthDate ? new Date(finalBirthDate) : new Date('1990-01-01'),
//             referral: null,
//           },
//           select: { id: true },
//         });

//         clientId = newClient.id;
//         console.log('[Complete Registration] Transaction: Created new client:', clientId);
//       }

//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: verification.serviceId,
//           clientId,  // ✅ Связь с клиентом!
//           masterId: verification.masterId,
//           startAt: new Date(verification.startAt),
//           endAt: new Date(verification.endAt),
//           customerName: customerName,  // ✅ ИСПРАВЛЕНО: используем вычисленное имя
//           phone: verification.phone,
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//         include: {
//           service: true,
//           master: true,
//         },
//       });

//       console.log('[Complete Registration] Transaction: Appointment created:', appointment.id);

//       console.log('[Complete Registration] Transaction: Linking appointment...');

//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       if (shouldUpdateTelegramEmail && finalEmail && existingUser) {
//         console.log('[Complete Registration] Transaction: Updating TelegramUser email...');
//         await tx.telegramUser.update({
//           where: { id: existingUser.id },
//           data: { email: finalEmail },
//         });
//         console.log('[Complete Registration] Transaction: TelegramUser updated');
//       }

//       return { appointment, verification: updatedVerification };
//     });

//     console.log('[Complete Registration] Transaction completed!');
//     console.log('[Complete Registration] Created appointment:', result.appointment.id);

//     // // 📢 Отправляем уведомление администратору
//     // sendAdminNotification({
//     //   id: result.appointment.id,
//     //   customerName: result.appointment.customerName,  // ✅ Теперь будет "Константин"
//     //   phone: result.appointment.phone,
//     //   email: result.appointment.email,
//     //   serviceName: result.appointment.service.name,
//     //   masterName: result.appointment.master?.name || 'Не указан',
//     //   masterId: result.appointment.masterId,
//     //   startAt: result.appointment.startAt,
//     //   endAt: result.appointment.endAt,
//     //   paymentStatus: result.appointment.paymentStatus,
//     // }).catch(err => {
//     //   console.error('[Complete Registration] Notification error:', err);
//     // });

//     const response: CompleteRegistrationResponse = {
//       success: true,
//       appointmentId: result.appointment.id,
//       appointment: {
//         id: result.appointment.id,
//         serviceId: result.appointment.serviceId,
//         serviceName: result.appointment.service.name,
//         masterId: result.appointment.masterId,
//         masterName: result.appointment.master?.name || 'Unknown Master',
//         startAt: result.appointment.startAt,
//         endAt: result.appointment.endAt,
//         status: result.appointment.status,
//         paymentStatus: result.appointment.paymentStatus,
//       },
//       message: 'Appointment created successfully',
//     };

//     console.log('[Complete Registration] Response:', JSON.stringify(response, null, 2));
//     console.log('=== [Complete Registration] SUCCESS ===');

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('=== [Complete Registration] ERROR ===');
//     console.error('Error details:', error);
//     console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
//     console.log('=== [Complete Registration] END (with error) ===');
    
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }





// //---------работает до 07.01.26 добавил регистрацию клиента в БД-------
// // src/app/api/telegram/complete-registration/route.ts
// // ✅ ИСПРАВЛЕНО: 
// // 1. Использует firstName из TelegramUser для customerName
// // 2. Fallback на email только если firstName отсутствует

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { normalizePhoneDigits } from '@/lib/phone';
// // import { sendAdminNotification } from '@/lib/send-admin-notification';

// // Определяем тип транзакции Prisma
// type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// interface CompleteRegistrationRequest {
//   sessionId: string;
//   email?: string | null;
//   birthDate?: string | null;
//   telegramUserId?: number | null;
// }

// interface AppointmentResponse {
//   id: string;
//   serviceId: string;
//   serviceName: string;
//   masterId: string | null;
//   masterName: string;
//   startAt: Date;
//   endAt: Date;
//   status: string;
//   paymentStatus: string;
// }

// interface CompleteRegistrationResponse {
//   success: boolean;
//   appointmentId: string;
//   appointment: AppointmentResponse;
//   message: string;
// }

// type TelegramUserMatch = {
//   id: string;
//   email: string | null;
//   telegramUserId: bigint | null;
//   firstName: string | null;
//   lastName: string | null;
// };

// export async function POST(request: NextRequest) {
//   console.log('=== [Complete Registration] START ===');
  
//   try {
//     const body: CompleteRegistrationRequest = await request.json();
//     console.log('[Complete Registration] Request body:', JSON.stringify(body, null, 2));
    
//     const { sessionId, email, birthDate, telegramUserId } = body;

//     if (!sessionId) {
//       console.log('[Complete Registration] ERROR: Missing sessionId');
//       return NextResponse.json(
//         { error: 'Missing sessionId' },
//         { status: 400 }
//       );
//     }

//     console.log('[Complete Registration] Looking up verification:', sessionId);
    
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       console.log('[Complete Registration] ERROR: Session not found');
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     console.log('[Complete Registration] Verification found:', {
//       id: verification.id,
//       phone: verification.phone,
//       verified: verification.verified,
//       appointmentId: verification.appointmentId,
//     });

//     if (!verification.verified) {
//       console.log('[Complete Registration] ERROR: Session not verified');
//       return NextResponse.json(
//         { error: 'Session not verified. Please verify code first.' },
//         { status: 400 }
//       );
//     }

//     if (verification.appointmentId) {
//       console.log('[Complete Registration] ERROR: Appointment already created:', verification.appointmentId);
//       return NextResponse.json(
//         { error: 'Appointment already created' },
//         { status: 400 }
//       );
//     }

//     if (new Date() > verification.expiresAt) {
//       console.log('[Complete Registration] ERROR: Session expired');
//       return NextResponse.json(
//         { error: 'Session expired' },
//         { status: 400 }
//       );
//     }

//     let finalEmail = email;
//     const finalBirthDate = birthDate;
//     let finalTelegramUserId = telegramUserId;

//     console.log('[Complete Registration] Looking up TelegramUser:', verification.phone);

//     // ✅ ИСПРАВЛЕНО: Получаем ВСЕ данные включая firstName, lastName
//     let existingUser: TelegramUserMatch | null = null;

//     if (verification.telegramUserId) {
//       existingUser = await prisma.telegramUser.findUnique({
//         where: { telegramUserId: verification.telegramUserId },
//         select: {
//           id: true,
//           email: true,
//           telegramUserId: true,
//           firstName: true,
//           lastName: true,
//         },
//       });
//     }

//     if (!existingUser) {
//       const phoneDigits = normalizePhoneDigits(verification.phone);
//       const matches = await prisma.telegramUser.findMany({
//         where: { phone: { endsWith: phoneDigits } },
//         select: {
//           id: true,
//           email: true,
//           telegramUserId: true,
//           firstName: true,
//           lastName: true,
//         },
//       });

//       if (matches.length === 1) {
//         existingUser = matches[0];
//       }
//     }

//     if (existingUser) {
//       console.log('[Complete Registration] Existing user found:', existingUser);
      
//       if (!finalEmail && existingUser.email) {
//         finalEmail = existingUser.email;
//         console.log('[Complete Registration] Using email from TelegramUser:', finalEmail);
//       }

//       if (!finalTelegramUserId && existingUser.telegramUserId) {
//         finalTelegramUserId = Number(existingUser.telegramUserId);
//         console.log('[Complete Registration] Using telegramUserId:', finalTelegramUserId);
//       }
//     } else {
//       console.log('[Complete Registration] No existing TelegramUser found');
//     }

//     if (!finalTelegramUserId && verification.telegramUserId) {
//       finalTelegramUserId = Number(verification.telegramUserId);
//       console.log('[Complete Registration] Using telegramUserId from verification:', finalTelegramUserId);
//     }

//     if (finalEmail) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(finalEmail)) {
//         console.log('[Complete Registration] ERROR: Invalid email:', finalEmail);
//         return NextResponse.json(
//           { error: 'Invalid email format' },
//           { status: 400 }
//         );
//       }
//     }

//     console.log('[Complete Registration] Final data:', {
//       email: finalEmail,
//       birthDate: finalBirthDate,
//       telegramUserId: finalTelegramUserId,
//     });

//     // ✅ ИСПРАВЛЕНО: Определяем customerName с приоритетом firstName
//     let customerName = 'Telegram User';
    
//     if (existingUser) {
//       if (existingUser.firstName) {
//         // Используем firstName + lastName если есть
//         customerName = existingUser.lastName 
//           ? `${existingUser.firstName} ${existingUser.lastName}`.trim()
//           : existingUser.firstName;
//         console.log('[Complete Registration] Using name from TelegramUser:', customerName);
//       } else if (finalEmail) {
//         // Fallback на email только если firstName нет
//         customerName = finalEmail.split('@')[0];
//         console.log('[Complete Registration] Using email as name:', customerName);
//       }
//     } else if (finalEmail) {
//       // Если пользователя нет вообще - используем email
//       customerName = finalEmail.split('@')[0];
//       console.log('[Complete Registration] Using email as name (no user):', customerName);
//     }

//     console.log('[Complete Registration] Starting transaction...');

//     let shouldUpdateTelegramEmail = Boolean(finalEmail && existingUser);

//     if (shouldUpdateTelegramEmail && finalEmail && existingUser) {
//       if (existingUser.email && existingUser.email !== finalEmail) {
//         shouldUpdateTelegramEmail = false;
//       }
//     }

//     if (shouldUpdateTelegramEmail && finalEmail && existingUser) {
//       const emailOwner = await prisma.telegramUser.findUnique({
//         where: { email: finalEmail },
//         select: { id: true },
//       });

//       if (emailOwner && emailOwner.id !== existingUser.id) {
//         shouldUpdateTelegramEmail = false;
//         console.log('[Complete Registration] Email already in use, skipping TelegramUser update');
//       }
//     }

//     const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
//       console.log('[Complete Registration] Transaction: Updating verification...');
      
//       const updatedVerification = await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: {
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           telegramUserId: finalTelegramUserId ? BigInt(finalTelegramUserId) : null,
//         },
//       });

//       console.log('[Complete Registration] Transaction: Creating appointment...');

//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: verification.serviceId,
//           masterId: verification.masterId,
//           startAt: new Date(verification.startAt),
//           endAt: new Date(verification.endAt),
//           customerName: customerName,  // ✅ ИСПРАВЛЕНО: используем вычисленное имя
//           phone: verification.phone,
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//         include: {
//           service: true,
//           master: true,
//         },
//       });

//       console.log('[Complete Registration] Transaction: Appointment created:', appointment.id);

//       console.log('[Complete Registration] Transaction: Linking appointment...');

//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       if (shouldUpdateTelegramEmail && finalEmail && existingUser) {
//         console.log('[Complete Registration] Transaction: Updating TelegramUser email...');
//         await tx.telegramUser.update({
//           where: { id: existingUser.id },
//           data: { email: finalEmail },
//         });
//         console.log('[Complete Registration] Transaction: TelegramUser updated');
//       }

//       return { appointment, verification: updatedVerification };
//     });

//     console.log('[Complete Registration] Transaction completed!');
//     console.log('[Complete Registration] Created appointment:', result.appointment.id);

//     // // 📢 Отправляем уведомление администратору
//     // sendAdminNotification({
//     //   id: result.appointment.id,
//     //   customerName: result.appointment.customerName,  // ✅ Теперь будет "Константин"
//     //   phone: result.appointment.phone,
//     //   email: result.appointment.email,
//     //   serviceName: result.appointment.service.name,
//     //   masterName: result.appointment.master?.name || 'Не указан',
//     //   masterId: result.appointment.masterId,
//     //   startAt: result.appointment.startAt,
//     //   endAt: result.appointment.endAt,
//     //   paymentStatus: result.appointment.paymentStatus,
//     // }).catch(err => {
//     //   console.error('[Complete Registration] Notification error:', err);
//     // });

//     const response: CompleteRegistrationResponse = {
//       success: true,
//       appointmentId: result.appointment.id,
//       appointment: {
//         id: result.appointment.id,
//         serviceId: result.appointment.serviceId,
//         serviceName: result.appointment.service.name,
//         masterId: result.appointment.masterId,
//         masterName: result.appointment.master?.name || 'Unknown Master',
//         startAt: result.appointment.startAt,
//         endAt: result.appointment.endAt,
//         status: result.appointment.status,
//         paymentStatus: result.appointment.paymentStatus,
//       },
//       message: 'Appointment created successfully',
//     };

//     console.log('[Complete Registration] Response:', JSON.stringify(response, null, 2));
//     console.log('=== [Complete Registration] SUCCESS ===');

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('=== [Complete Registration] ERROR ===');
//     console.error('Error details:', error);
//     console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
//     console.log('=== [Complete Registration] END (with error) ===');
    
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }






//-----------работает добовляем предупреждение о не правильном введение кода-----
// // src/app/api/telegram/complete-registration/route.ts
// // ✅ ОБНОВЛЕНО: Использует общую функцию sendAdminNotification из @/lib

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { sendAdminNotification } from '@/lib/send-admin-notification';

// // Определяем тип транзакции Prisma
// type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// interface CompleteRegistrationRequest {
//   sessionId: string;
//   email?: string | null;
//   birthDate?: string | null;
//   telegramUserId?: number | null;
// }

// interface AppointmentResponse {
//   id: string;
//   serviceId: string;
//   serviceName: string;
//   masterId: string | null;
//   masterName: string;
//   startAt: Date;
//   endAt: Date;
//   status: string;
//   paymentStatus: string;
// }

// interface CompleteRegistrationResponse {
//   success: boolean;
//   appointmentId: string;
//   appointment: AppointmentResponse;
//   message: string;
// }

// export async function POST(request: NextRequest) {
//   console.log('=== [Complete Registration] START ===');
  
//   try {
//     const body: CompleteRegistrationRequest = await request.json();
//     console.log('[Complete Registration] Request body:', JSON.stringify(body, null, 2));
    
//     const { sessionId, email, birthDate, telegramUserId } = body;

//     if (!sessionId) {
//       console.log('[Complete Registration] ERROR: Missing sessionId');
//       return NextResponse.json(
//         { error: 'Missing sessionId' },
//         { status: 400 }
//       );
//     }

//     console.log('[Complete Registration] Looking up verification:', sessionId);
    
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       console.log('[Complete Registration] ERROR: Session not found');
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     console.log('[Complete Registration] Verification found:', {
//       id: verification.id,
//       phone: verification.phone,
//       verified: verification.verified,
//       appointmentId: verification.appointmentId,
//     });

//     if (!verification.verified) {
//       console.log('[Complete Registration] ERROR: Session not verified');
//       return NextResponse.json(
//         { error: 'Session not verified. Please verify code first.' },
//         { status: 400 }
//       );
//     }

//     if (verification.appointmentId) {
//       console.log('[Complete Registration] ERROR: Appointment already created:', verification.appointmentId);
//       return NextResponse.json(
//         { error: 'Appointment already created' },
//         { status: 400 }
//       );
//     }

//     if (new Date() > verification.expiresAt) {
//       console.log('[Complete Registration] ERROR: Session expired');
//       return NextResponse.json(
//         { error: 'Session expired' },
//         { status: 400 }
//       );
//     }

//     let finalEmail = email;
//     const finalBirthDate = birthDate;
//     let finalTelegramUserId = telegramUserId;

//     console.log('[Complete Registration] Looking up TelegramUser:', verification.phone);

//     if (!finalEmail || !finalTelegramUserId) {
//       const existingUser = await prisma.telegramUser.findUnique({
//         where: { phone: verification.phone },
//         select: {
//           email: true,
//           telegramUserId: true,
//         },
//       });

//       if (existingUser) {
//         console.log('[Complete Registration] Existing user found:', existingUser);
        
//         if (!finalEmail && existingUser.email) {
//           finalEmail = existingUser.email;
//           console.log('[Complete Registration] Using email from TelegramUser:', finalEmail);
//         }

//         if (!finalTelegramUserId && existingUser.telegramUserId) {
//           finalTelegramUserId = Number(existingUser.telegramUserId);
//           console.log('[Complete Registration] Using telegramUserId:', finalTelegramUserId);
//         }
//       } else {
//         console.log('[Complete Registration] No existing TelegramUser found');
//       }
//     }

//     if (finalEmail) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(finalEmail)) {
//         console.log('[Complete Registration] ERROR: Invalid email:', finalEmail);
//         return NextResponse.json(
//           { error: 'Invalid email format' },
//           { status: 400 }
//         );
//       }
//     }

//     console.log('[Complete Registration] Final data:', {
//       email: finalEmail,
//       birthDate: finalBirthDate,
//       telegramUserId: finalTelegramUserId,
//     });

//     console.log('[Complete Registration] Starting transaction...');

//     const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
//       console.log('[Complete Registration] Transaction: Updating verification...');
      
//       const updatedVerification = await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: {
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           telegramUserId: finalTelegramUserId ? BigInt(finalTelegramUserId) : null,
//         },
//       });

//       console.log('[Complete Registration] Transaction: Creating appointment...');

//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: verification.serviceId,
//           masterId: verification.masterId,
//           startAt: new Date(verification.startAt),
//           endAt: new Date(verification.endAt),
//           customerName: finalEmail ? finalEmail.split('@')[0] : 'Telegram User',
//           phone: verification.phone,
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//         include: {
//           service: true,
//           master: true,
//         },
//       });

//       console.log('[Complete Registration] Transaction: Appointment created:', appointment.id);

//       console.log('[Complete Registration] Transaction: Linking appointment...');

//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       if (finalEmail) {
//         console.log('[Complete Registration] Transaction: Updating TelegramUser email...');
//         await tx.telegramUser.update({
//           where: { phone: verification.phone },
//           data: { email: finalEmail },
//         });
//         console.log('[Complete Registration] Transaction: TelegramUser updated');
//       }

//       return { appointment, verification: updatedVerification };
//     });

//     console.log('[Complete Registration] Transaction completed!');
//     console.log('[Complete Registration] Created appointment:', result.appointment.id);

//     // 📢 Отправляем уведомление администратору (используем общую функцию)
//     sendAdminNotification({
//       id: result.appointment.id,
//       customerName: result.appointment.customerName,
//       phone: result.appointment.phone,
//       email: result.appointment.email,
//       serviceName: result.appointment.service.name,
//       masterName: result.appointment.master?.name || 'Не указан',
//       masterId: result.appointment.masterId,
//       startAt: result.appointment.startAt,
//       endAt: result.appointment.endAt,
//       paymentStatus: result.appointment.paymentStatus,
//     }).catch(err => {
//       // Логируем, но не прерываем процесс
//       console.error('[Complete Registration] Notification error:', err);
//     });

//     const response: CompleteRegistrationResponse = {
//       success: true,
//       appointmentId: result.appointment.id,
//       appointment: {
//         id: result.appointment.id,
//         serviceId: result.appointment.serviceId,
//         serviceName: result.appointment.service.name,
//         masterId: result.appointment.masterId,
//         masterName: result.appointment.master?.name || 'Unknown Master',
//         startAt: result.appointment.startAt,
//         endAt: result.appointment.endAt,
//         status: result.appointment.status,
//         paymentStatus: result.appointment.paymentStatus,
//       },
//       message: 'Appointment created successfully',
//     };

//     console.log('[Complete Registration] Response:', JSON.stringify(response, null, 2));
//     console.log('=== [Complete Registration] SUCCESS ===');

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('=== [Complete Registration] ERROR ===');
//     console.error('Error details:', error);
//     console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
//     console.log('=== [Complete Registration] END (with error) ===');
    
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }





//--------исправлено с общей доработкой уведомления администратору-------
// // src/app/api/telegram/complete-registration/route.ts
// // ✅ ИСПРАВЛЕНО: Добавлено детальное логирование
// // ✅ БЕЗ ANY: Все типы явно указаны

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// // Определяем тип транзакции Prisma
// type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// interface CompleteRegistrationRequest {
//   sessionId: string;
//   email?: string | null;
//   birthDate?: string | null;
//   telegramUserId?: number | null;
// }

// interface AppointmentResponse {
//   id: string;
//   serviceId: string;
//   serviceName: string;
//   masterId: string | null;  // ✅ Изменено на | null
//   masterName: string;
//   startAt: Date;
//   endAt: Date;
//   status: string;
//   paymentStatus: string;
// }

// interface CompleteRegistrationResponse {
//   success: boolean;
//   appointmentId: string;
//   appointment: AppointmentResponse;
//   message: string;
// }

// /**
//  * Отправляет уведомление администратору о новой заявке
//  */
// async function sendAdminNotification(appointment: {
//   id: string;
//   customerName: string;
//   phone: string;
//   email: string | null;
//   serviceName: string;
//   masterName: string;
//   masterId: string | null;  // ✅ Добавлен | null
//   startAt: Date;
//   endAt: Date;
//   paymentStatus: string;
// }) {
//   try {
//     const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    
//     if (!adminChatId) {
//       console.log('[Admin Notification] TELEGRAM_ADMIN_CHAT_ID not configured, skipping');
//       return;
//     }

//     // Форматируем дату и время
//     const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//     });
    
//     const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
//       hour: '2-digit',
//       minute: '2-digit',
//     });

//     const date = dateFormatter.format(appointment.startAt);
//     const startTime = timeFormatter.format(appointment.startAt);
//     const endTime = timeFormatter.format(appointment.endAt);

//     // Формируем сообщение
//     const message = `
// 🎉 *НОВАЯ ОНЛАЙН ЗАЯВКА*

// 👤 *Клиент:* ${appointment.customerName}
// 📞 *Телефон:* ${appointment.phone}
// ${appointment.email ? `📧 *Email:* ${appointment.email}\n` : ''}✂️ *Услуга:* ${appointment.serviceName}
// 👩‍💼 *Мастер:* ${appointment.masterName}

// 📅 *Дата:* ${date}
// 🕐 *Время:* ${startTime} - ${endTime}

// 💳 *Оплата:* ${appointment.paymentStatus === 'PAID' ? '✅ Оплачено' : '⏳ Ожидает оплаты'}

// 🆔 ID: \`${appointment.id}\`
// `.trim();

//     console.log('[Admin Notification] Sending to admin:', adminChatId);

//     // Отправляем через webhook
//     const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/telegram/webhook`;
//     const response = await fetch(`${webhookUrl}?action=notify&chatId=${adminChatId}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ message }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('[Admin Notification] Failed:', errorData);
//       return;
//     }

//     console.log('[Admin Notification] ✅ Sent successfully');
//   } catch (error) {
//     console.error('[Admin Notification] Error:', error);
//     // Не прерываем процесс
//   }
// }

// export async function POST(request: NextRequest) {
//   console.log('=== [Complete Registration] START ===');
  
//   try {
//     const body: CompleteRegistrationRequest = await request.json();
//     console.log('[Complete Registration] Request body:', JSON.stringify(body, null, 2));
    
//     const { sessionId, email, birthDate, telegramUserId } = body;

//     if (!sessionId) {
//       console.log('[Complete Registration] ERROR: Missing sessionId');
//       return NextResponse.json(
//         { error: 'Missing sessionId' },
//         { status: 400 }
//       );
//     }

//     console.log('[Complete Registration] Looking up verification:', sessionId);
    
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       console.log('[Complete Registration] ERROR: Session not found');
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     console.log('[Complete Registration] Verification found:', {
//       id: verification.id,
//       phone: verification.phone,
//       verified: verification.verified,
//       appointmentId: verification.appointmentId,
//     });

//     if (!verification.verified) {
//       console.log('[Complete Registration] ERROR: Session not verified');
//       return NextResponse.json(
//         { error: 'Session not verified. Please verify code first.' },
//         { status: 400 }
//       );
//     }

//     if (verification.appointmentId) {
//       console.log('[Complete Registration] ERROR: Appointment already created:', verification.appointmentId);
//       return NextResponse.json(
//         { error: 'Appointment already created' },
//         { status: 400 }
//       );
//     }

//     if (new Date() > verification.expiresAt) {
//       console.log('[Complete Registration] ERROR: Session expired');
//       return NextResponse.json(
//         { error: 'Session expired' },
//         { status: 400 }
//       );
//     }

//     let finalEmail = email;
//     const finalBirthDate = birthDate;
//     let finalTelegramUserId = telegramUserId;

//     console.log('[Complete Registration] Looking up TelegramUser:', verification.phone);

//     if (!finalEmail || !finalTelegramUserId) {
//       const existingUser = await prisma.telegramUser.findUnique({
//         where: { phone: verification.phone },
//         select: {
//           email: true,
//           telegramUserId: true,
//         },
//       });

//       if (existingUser) {
//         console.log('[Complete Registration] Existing user found:', existingUser);
        
//         if (!finalEmail && existingUser.email) {
//           finalEmail = existingUser.email;
//           console.log('[Complete Registration] Using email from TelegramUser:', finalEmail);
//         }

//         if (!finalTelegramUserId && existingUser.telegramUserId) {
//           finalTelegramUserId = Number(existingUser.telegramUserId);
//           console.log('[Complete Registration] Using telegramUserId:', finalTelegramUserId);
//         }
//       } else {
//         console.log('[Complete Registration] No existing TelegramUser found');
//       }
//     }

//     if (finalEmail) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(finalEmail)) {
//         console.log('[Complete Registration] ERROR: Invalid email:', finalEmail);
//         return NextResponse.json(
//           { error: 'Invalid email format' },
//           { status: 400 }
//         );
//       }
//     }

//     console.log('[Complete Registration] Final data:', {
//       email: finalEmail,
//       birthDate: finalBirthDate,
//       telegramUserId: finalTelegramUserId,
//     });

//     console.log('[Complete Registration] Starting transaction...');

//     const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
//       console.log('[Complete Registration] Transaction: Updating verification...');
      
//       const updatedVerification = await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: {
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           telegramUserId: finalTelegramUserId ? BigInt(finalTelegramUserId) : null,
//         },
//       });

//       console.log('[Complete Registration] Transaction: Creating appointment...');

//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: verification.serviceId,
//           masterId: verification.masterId,
//           startAt: new Date(verification.startAt),
//           endAt: new Date(verification.endAt),
//           customerName: finalEmail ? finalEmail.split('@')[0] : 'Telegram User',
//           phone: verification.phone,
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//         include: {
//           service: true,
//           master: true,
//         },
//       });

//       console.log('[Complete Registration] Transaction: Appointment created:', appointment.id);

//       console.log('[Complete Registration] Transaction: Linking appointment...');

//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       if (finalEmail) {
//         console.log('[Complete Registration] Transaction: Updating TelegramUser email...');
//         await tx.telegramUser.update({
//           where: { phone: verification.phone },
//           data: { email: finalEmail },
//         });
//         console.log('[Complete Registration] Transaction: TelegramUser updated');
//       }

//       return { appointment, verification: updatedVerification };
//     });

//     console.log('[Complete Registration] Transaction completed!');
//     console.log('[Complete Registration] Created appointment:', result.appointment.id);

//     // 📢 Отправляем уведомление администратору
//     sendAdminNotification({
//       id: result.appointment.id,
//       customerName: result.appointment.customerName,
//       phone: result.appointment.phone,
//       email: result.appointment.email,
//       serviceName: result.appointment.service.name,
//       masterName: result.appointment.master?.name || 'Unknown Master',
//       masterId: result.appointment.masterId,  // ✅ Добавлено
//       startAt: result.appointment.startAt,
//       endAt: result.appointment.endAt,
//       paymentStatus: result.appointment.paymentStatus,
//     }).catch(err => {
//       // Логируем, но не прерываем процесс
//       console.error('[Complete Registration] Notification error:', err);
//     });

//     const response: CompleteRegistrationResponse = {
//       success: true,
//       appointmentId: result.appointment.id,
//       appointment: {
//         id: result.appointment.id,
//         serviceId: result.appointment.serviceId,
//         serviceName: result.appointment.service.name,
//         masterId: result.appointment.masterId,
//         masterName: result.appointment.master?.name || 'Unknown Master',
//         startAt: result.appointment.startAt,
//         endAt: result.appointment.endAt,
//         status: result.appointment.status,
//         paymentStatus: result.appointment.paymentStatus,
//       },
//       message: 'Appointment created successfully',
//     };

//     console.log('[Complete Registration] Response:', JSON.stringify(response, null, 2));
//     console.log('=== [Complete Registration] SUCCESS ===');

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('=== [Complete Registration] ERROR ===');
//     console.error('Error details:', error);
//     console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
//     console.log('=== [Complete Registration] END (with error) ===');
    
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }




//--------работало но не проходила сборка-----
// // src/app/api/telegram/complete-registration/route.ts
// // ✅ ИСПРАВЛЕНО: Добавлено детальное логирование
// // ✅ БЕЗ ANY: Все типы явно указаны

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// // Определяем тип транзакции Prisma
// type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// interface CompleteRegistrationRequest {
//   sessionId: string;
//   email?: string | null;
//   birthDate?: string | null;
//   telegramUserId?: number | null;
// }

// interface AppointmentResponse {
//   id: string;
//   serviceId: string;
//   serviceName: string;
//   masterId: string;
//   masterName: string;
//   startAt: Date;
//   endAt: Date;
//   status: string;
//   paymentStatus: string;
// }

// interface CompleteRegistrationResponse {
//   success: boolean;
//   appointmentId: string;
//   appointment: AppointmentResponse;
//   message: string;
// }

// export async function POST(request: NextRequest) {
//   console.log('=== [Complete Registration] START ===');
  
//   try {
//     const body: CompleteRegistrationRequest = await request.json();
//     console.log('[Complete Registration] Request body:', JSON.stringify(body, null, 2));
    
//     const { sessionId, email, birthDate, telegramUserId } = body;

//     if (!sessionId) {
//       console.log('[Complete Registration] ERROR: Missing sessionId');
//       return NextResponse.json(
//         { error: 'Missing sessionId' },
//         { status: 400 }
//       );
//     }

//     console.log('[Complete Registration] Looking up verification:', sessionId);
    
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       console.log('[Complete Registration] ERROR: Session not found');
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     console.log('[Complete Registration] Verification found:', {
//       id: verification.id,
//       phone: verification.phone,
//       verified: verification.verified,
//       appointmentId: verification.appointmentId,
//     });

//     if (!verification.verified) {
//       console.log('[Complete Registration] ERROR: Session not verified');
//       return NextResponse.json(
//         { error: 'Session not verified. Please verify code first.' },
//         { status: 400 }
//       );
//     }

//     if (verification.appointmentId) {
//       console.log('[Complete Registration] ERROR: Appointment already created:', verification.appointmentId);
//       return NextResponse.json(
//         { error: 'Appointment already created' },
//         { status: 400 }
//       );
//     }

//     if (new Date() > verification.expiresAt) {
//       console.log('[Complete Registration] ERROR: Session expired');
//       return NextResponse.json(
//         { error: 'Session expired' },
//         { status: 400 }
//       );
//     }

//     let finalEmail = email;
//     const finalBirthDate = birthDate;
//     let finalTelegramUserId = telegramUserId;

//     console.log('[Complete Registration] Looking up TelegramUser:', verification.phone);

//     if (!finalEmail || !finalTelegramUserId) {
//       const existingUser = await prisma.telegramUser.findUnique({
//         where: { phone: verification.phone },
//         select: {
//           email: true,
//           telegramUserId: true,
//         },
//       });

//       if (existingUser) {
//         console.log('[Complete Registration] Existing user found:', existingUser);
        
//         if (!finalEmail && existingUser.email) {
//           finalEmail = existingUser.email;
//           console.log('[Complete Registration] Using email from TelegramUser:', finalEmail);
//         }

//         if (!finalTelegramUserId && existingUser.telegramUserId) {
//           finalTelegramUserId = Number(existingUser.telegramUserId);
//           console.log('[Complete Registration] Using telegramUserId:', finalTelegramUserId);
//         }
//       } else {
//         console.log('[Complete Registration] No existing TelegramUser found');
//       }
//     }

//     if (finalEmail) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(finalEmail)) {
//         console.log('[Complete Registration] ERROR: Invalid email:', finalEmail);
//         return NextResponse.json(
//           { error: 'Invalid email format' },
//           { status: 400 }
//         );
//       }
//     }

//     console.log('[Complete Registration] Final data:', {
//       email: finalEmail,
//       birthDate: finalBirthDate,
//       telegramUserId: finalTelegramUserId,
//     });

//     console.log('[Complete Registration] Starting transaction...');

//     const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
//       console.log('[Complete Registration] Transaction: Updating verification...');
      
//       const updatedVerification = await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: {
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           telegramUserId: finalTelegramUserId ? BigInt(finalTelegramUserId) : null,
//         },
//       });

//       console.log('[Complete Registration] Transaction: Creating appointment...');

//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: verification.serviceId,
//           masterId: verification.masterId,
//           startAt: new Date(verification.startAt),
//           endAt: new Date(verification.endAt),
//           customerName: finalEmail ? finalEmail.split('@')[0] : 'Telegram User',
//           phone: verification.phone,
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//         include: {
//           service: true,
//           master: true,
//         },
//       });

//       console.log('[Complete Registration] Transaction: Appointment created:', appointment.id);

//       console.log('[Complete Registration] Transaction: Linking appointment...');

//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       if (finalEmail) {
//         console.log('[Complete Registration] Transaction: Updating TelegramUser email...');
//         await tx.telegramUser.update({
//           where: { phone: verification.phone },
//           data: { email: finalEmail },
//         });
//         console.log('[Complete Registration] Transaction: TelegramUser updated');
//       }

//       return { appointment, verification: updatedVerification };
//     });

//     console.log('[Complete Registration] Transaction completed!');
//     console.log('[Complete Registration] Created appointment:', result.appointment.id);

//     const response: CompleteRegistrationResponse = {
//       success: true,
//       appointmentId: result.appointment.id,
//       appointment: {
//         id: result.appointment.id,
//         serviceId: result.appointment.serviceId,
//         serviceName: result.appointment.service.name,
//         masterId: result.appointment.masterId,
//         masterName: result.appointment.master?.name || 'Unknown Master',
//         startAt: result.appointment.startAt,
//         endAt: result.appointment.endAt,
//         status: result.appointment.status,
//         paymentStatus: result.appointment.paymentStatus,
//       },
//       message: 'Appointment created successfully',
//     };

//     console.log('[Complete Registration] Response:', JSON.stringify(response, null, 2));
//     console.log('=== [Complete Registration] SUCCESS ===');

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error('=== [Complete Registration] ERROR ===');
//     console.error('Error details:', error);
//     console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
//     console.log('=== [Complete Registration] END (with error) ===');
    
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }




//---------исправляем в новой версии с доработкой данных из TelegramUser--------
// // src/app/api/telegram/complete-registration/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { sessionId, email, birthDate, telegramUserId } = body;

//     console.log('[Complete Registration] Request body:', body);

//     // Валидация
//     if (!sessionId) {
//       console.log('[Complete Registration] ERROR: Missing sessionId');
//       return NextResponse.json(
//         { error: 'Missing sessionId' },
//         { status: 400 }
//       );
//     }

//     // Найти верификацию
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     // Проверить верифицирована ли
//     if (!verification.verified) {
//       return NextResponse.json(
//         { error: 'Session not verified. Please verify code first.' },
//         { status: 400 }
//       );
//     }

//     // Проверить не создан ли уже Appointment
//     if (verification.appointmentId) {
//       return NextResponse.json(
//         { error: 'Appointment already created' },
//         { status: 400 }
//       );
//     }

//     // Проверить истёк ли срок действия
//     if (new Date() > verification.expiresAt) {
//       return NextResponse.json(
//         { error: 'Session expired' },
//         { status: 400 }
//       );
//     }

//     // Попытаться получить данные из существующего TelegramUser
//     let finalEmail = email;
//     const finalBirthDate = birthDate; // birthDate не храним в TelegramUser
//     let finalTelegramUserId = telegramUserId;

//     if (!finalEmail || !finalTelegramUserId) {
//       const existingUser = await prisma.telegramUser.findUnique({
//         where: { phone: verification.phone },
//         select: {
//           email: true,
//           telegramUserId: true,
//         },
//       });

//       if (existingUser) {
//         // Использовать email из TelegramUser если не предоставлен
//         if (!finalEmail && existingUser.email) {
//           finalEmail = existingUser.email;
//           console.log('[Complete Registration] Using email from TelegramUser:', finalEmail);
//         }

//         // Использовать telegramUserId из TelegramUser
//         if (!finalTelegramUserId && existingUser.telegramUserId) {
//           finalTelegramUserId = Number(existingUser.telegramUserId);
//           console.log('[Complete Registration] Using telegramUserId from TelegramUser:', finalTelegramUserId);
//         }
//       }
//     }

//     // Валидация email (если предоставлен)
//     if (finalEmail) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(finalEmail)) {
//         return NextResponse.json(
//           { error: 'Invalid email format' },
//           { status: 400 }
//         );
//       }
//     }

//     // Создать Appointment в транзакции
//     const result = await prisma.$transaction(async (tx) => {
//       // 1. Обновить верификацию (добавить опциональные данные)
//       const updatedVerification = await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: {
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           telegramUserId: finalTelegramUserId ? BigInt(finalTelegramUserId) : null,
//         },
//       });

//       // 2. Создать Appointment
//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: verification.serviceId,
//           masterId: verification.masterId,
//           startAt: new Date(verification.startAt),
//           endAt: new Date(verification.endAt),
//           customerName: finalEmail ? finalEmail.split('@')[0] : 'Telegram User',
//           phone: verification.phone,
//           email: finalEmail || null,
//           birthDate: finalBirthDate ? new Date(finalBirthDate) : null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//         include: {
//           service: true,
//           master: true,
//         },
//       });

//       // 3. Связать верификацию с Appointment
//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       // 4. Обновить TelegramUser с email (для будущих записей)
//       if (finalEmail) {
//         await tx.telegramUser.update({
//           where: { phone: verification.phone },
//           data: { email: finalEmail },
//         });
//         console.log('[Complete Registration] Updated TelegramUser email:', finalEmail);
//       }

//       return { appointment, verification: updatedVerification };
//     });

//     return NextResponse.json({
//       success: true,
//       appointmentId: result.appointment.id,
//       appointment: {
//         id: result.appointment.id,
//         serviceId: result.appointment.serviceId,
//         serviceName: result.appointment.service.name,
//         masterId: result.appointment.masterId,
//         masterName: result.appointment.master?.name || 'Unknown Master',  // ✅ Исправлено
//         startAt: result.appointment.startAt,
//         endAt: result.appointment.endAt,
//         status: result.appointment.status,
//         paymentStatus: result.appointment.paymentStatus,
//       },
//       message: 'Appointment created successfully',
//     });
//   } catch (error) {
//     console.error('Complete registration error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }




//--------всё работает, дорабатываем автоматизацию-------
// // src/app/api/telegram/complete-registration/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { sessionId, email, birthDate, telegramUserId } = body;

//     console.log('[Complete Registration] Request body:', body);

//     // Валидация
//     if (!sessionId) {
//       console.log('[Complete Registration] ERROR: Missing sessionId');
//       return NextResponse.json(
//         { error: 'Missing sessionId' },
//         { status: 400 }
//       );
//     }

//     // Найти верификацию
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     // Проверить верифицирована ли
//     if (!verification.verified) {
//       return NextResponse.json(
//         { error: 'Session not verified. Please verify code first.' },
//         { status: 400 }
//       );
//     }

//     // Проверить не создан ли уже Appointment
//     if (verification.appointmentId) {
//       return NextResponse.json(
//         { error: 'Appointment already created' },
//         { status: 400 }
//       );
//     }

//     // Проверить истёк ли срок действия
//     if (new Date() > verification.expiresAt) {
//       return NextResponse.json(
//         { error: 'Session expired' },
//         { status: 400 }
//       );
//     }

//     // Валидация email (если предоставлен)
//     if (email) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(email)) {
//         return NextResponse.json(
//           { error: 'Invalid email format' },
//           { status: 400 }
//         );
//       }
//     }

//     // Создать Appointment в транзакции
//     const result = await prisma.$transaction(async (tx) => {
//       // 1. Обновить верификацию (добавить опциональные данные)
//       const updatedVerification = await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: {
//           email: email || null,
//           birthDate: birthDate ? new Date(birthDate) : null,
//           telegramUserId: telegramUserId ? BigInt(telegramUserId) : null,
//         },
//       });

//       // 2. Создать Appointment
//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: verification.serviceId,
//           masterId: verification.masterId,
//           startAt: new Date(verification.startAt),
//           endAt: new Date(verification.endAt),
//           customerName: email ? email.split('@')[0] : 'Telegram User',
//           phone: verification.phone,
//           email: email || null,
//           birthDate: birthDate ? new Date(birthDate) : null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//         include: {
//           service: true,
//           master: true,
//         },
//       });

//       // 3. Связать верификацию с Appointment
//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       return { appointment, verification: updatedVerification };
//     });

//     return NextResponse.json({
//       success: true,
//       appointmentId: result.appointment.id,
//       appointment: {
//         id: result.appointment.id,
//         serviceId: result.appointment.serviceId,
//         serviceName: result.appointment.service.name,
//         masterId: result.appointment.masterId,
//         masterName: result.appointment.master?.name || 'Unknown Master',  // ✅ Исправлено
//         startAt: result.appointment.startAt,
//         endAt: result.appointment.endAt,
//         status: result.appointment.status,
//         paymentStatus: result.appointment.paymentStatus,
//       },
//       message: 'Appointment created successfully',
//     });
//   } catch (error) {
//     console.error('Complete registration error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }





//-----------исправляем ошибку с окончанием регистрации--------------
// // src/app/api/telegram/send-code/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { phone, serviceId, masterId, startAt, endAt } = body;

//     console.log('[Telegram Send Code] Request:', { phone, serviceId, masterId, startAt, endAt });

//     // Валидация
//     if (!phone || !serviceId || !masterId || !startAt || !endAt) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Валидация телефона (базовая)
//     const phoneRegex = /^\+\d{10,15}$/;
//     if (!phoneRegex.test(phone)) {
//       console.log('[Telegram Send Code] Invalid phone format:', phone);
//       return NextResponse.json(
//         { error: 'Invalid phone format. Use format: +4917789951064' },
//         { status: 400 }
//       );
//     }

//     // Генерация 6-значного кода
//     const code = Math.floor(100000 + Math.random() * 900000).toString();

//     // Генерация уникального sessionId
//     const sessionId = crypto.randomUUID();

//     console.log('[Telegram Send Code] Generated:', { code, sessionId });

//     // Срок действия кода - 10 минут
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     // Удалить старые неверифицированные записи для этого телефона
//     await prisma.telegramVerification.deleteMany({
//       where: {
//         phone,
//         verified: false,
//         expiresAt: { lt: new Date() }, // Только истёкшие
//       },
//     });

//     console.log('[Telegram Send Code] Creating verification with data:', {
//       phone,
//       code,
//       sessionId,
//       serviceId,
//       masterId,
//       startAt,
//       endAt,
//       expiresAt,
//       verified: false,
//     });

//     // Создать новую верификацию
//     const verification = await prisma.telegramVerification.create({
//       data: {
//         phone,
//         code,
//         sessionId,
//         serviceId,
//         masterId,
//         startAt,
//         endAt,
//         expiresAt,
//         verified: false,
//       },
//     });

//     console.log('[Telegram Send Code] Verification created:', verification.id);

//     // Отправить код в Telegram через webhook
//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
//     try {
//       console.log('[Telegram Send Code] Sending to Telegram via webhook');
//       const response = await fetch(`${baseUrl}/api/telegram/webhook?phone=${encodeURIComponent(phone)}&code=${code}`);
//       const data = await response.json();
      
//       if (!response.ok) {
//         console.error('[Telegram Send Code] Telegram webhook error:', data);
//       } else {
//         console.log('[Telegram Send Code] Code sent to Telegram successfully');
//       }
//     } catch (telegramError) {
//       console.error('[Telegram Send Code] Telegram webhook error:', telegramError);
//       // Продолжаем, даже если Telegram не ответил
//     }

//     console.log('[Telegram Send Code] Success:', {
//       sessionId: verification.sessionId,
//       expiresAt: verification.expiresAt,
//     });

//     return NextResponse.json({
//       success: true,
//       sessionId: verification.sessionId,
//       expiresAt: verification.expiresAt,
//       message: 'Code sent to Telegram',
//     });
//   } catch (error) {
//     console.error('[Telegram Send Code] Error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }





//--------исправляем под прямое взаимодействие с ботом telegram----------
// // src/app/api/telegram/complete-registration/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { sessionId, email, birthDate, telegramUserId } = body;

//     // Валидация
//     if (!sessionId) {
//       return NextResponse.json(
//         { error: 'Missing sessionId' },
//         { status: 400 }
//       );
//     }

//     // Найти верификацию
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     // Проверить верифицирована ли
//     if (!verification.verified) {
//       return NextResponse.json(
//         { error: 'Session not verified. Please verify code first.' },
//         { status: 400 }
//       );
//     }

//     // Проверить не создан ли уже Appointment
//     if (verification.appointmentId) {
//       return NextResponse.json(
//         { error: 'Appointment already created' },
//         { status: 400 }
//       );
//     }

//     // Проверить истёк ли срок действия
//     if (new Date() > verification.expiresAt) {
//       return NextResponse.json(
//         { error: 'Session expired' },
//         { status: 400 }
//       );
//     }

//     // Валидация email (если предоставлен)
//     if (email) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(email)) {
//         return NextResponse.json(
//           { error: 'Invalid email format' },
//           { status: 400 }
//         );
//       }
//     }

//     // Создать Appointment в транзакции
//     const result = await prisma.$transaction(async (tx) => {
//       // 1. Обновить верификацию (добавить опциональные данные)
//       const updatedVerification = await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: {
//           email: email || null,
//           birthDate: birthDate ? new Date(birthDate) : null,
//           telegramUserId: telegramUserId ? BigInt(telegramUserId) : null,
//         },
//       });

//       // 2. Создать Appointment
//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: verification.serviceId,
//           masterId: verification.masterId,
//           startAt: new Date(verification.startAt),
//           endAt: new Date(verification.endAt),
//           customerName: email ? email.split('@')[0] : 'Telegram User',
//           phone: verification.phone,
//           email: email || null,
//           birthDate: birthDate ? new Date(birthDate) : null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//         include: {
//           service: true,
//           master: true,
//         },
//       });

//       // 3. Связать верификацию с Appointment
//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       return { appointment, verification: updatedVerification };
//     });

//     return NextResponse.json({
//       success: true,
//       appointmentId: result.appointment.id,
//       appointment: {
//         id: result.appointment.id,
//         serviceId: result.appointment.serviceId,
//         serviceName: result.appointment.service.name,
//         masterId: result.appointment.masterId,
//         masterName: result.appointment.master?.name || 'Unknown Master',  // ✅ Исправлено
//         startAt: result.appointment.startAt,
//         endAt: result.appointment.endAt,
//         status: result.appointment.status,
//         paymentStatus: result.appointment.paymentStatus,
//       },
//       message: 'Appointment created successfully',
//     });
//   } catch (error) {
//     console.error('Complete registration error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }




// // src/app/api/telegram/complete-registration/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { sessionId, email, birthDate, telegramUserId } = body;

//     // Валидация
//     if (!sessionId) {
//       return NextResponse.json(
//         { error: 'Missing sessionId' },
//         { status: 400 }
//       );
//     }

//     // Найти верификацию
//     const verification = await prisma.telegramVerification.findUnique({
//       where: { sessionId },
//     });

//     if (!verification) {
//       return NextResponse.json(
//         { error: 'Session not found' },
//         { status: 404 }
//       );
//     }

//     // Проверить верифицирована ли
//     if (!verification.verified) {
//       return NextResponse.json(
//         { error: 'Session not verified. Please verify code first.' },
//         { status: 400 }
//       );
//     }

//     // Проверить не создан ли уже Appointment
//     if (verification.appointmentId) {
//       return NextResponse.json(
//         { error: 'Appointment already created' },
//         { status: 400 }
//       );
//     }

//     // Проверить истёк ли срок действия
//     if (new Date() > verification.expiresAt) {
//       return NextResponse.json(
//         { error: 'Session expired' },
//         { status: 400 }
//       );
//     }

//     // Валидация email (если предоставлен)
//     if (email) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(email)) {
//         return NextResponse.json(
//           { error: 'Invalid email format' },
//           { status: 400 }
//         );
//       }
//     }

//     // Создать Appointment в транзакции
//     const result = await prisma.$transaction(async (tx) => {
//       // 1. Обновить верификацию (добавить опциональные данные)
//       const updatedVerification = await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: {
//           email: email || null,
//           birthDate: birthDate ? new Date(birthDate) : null,
//           telegramUserId: telegramUserId ? BigInt(telegramUserId) : null,
//         },
//       });

//       // 2. Создать Appointment
//       const appointment = await tx.appointment.create({
//         data: {
//           serviceId: verification.serviceId,
//           masterId: verification.masterId,
//           startAt: new Date(verification.startAt),
//           endAt: new Date(verification.endAt),
//           customerName: email ? email.split('@')[0] : 'Telegram User',
//           phone: verification.phone,
//           email: email || null,
//           birthDate: birthDate ? new Date(birthDate) : null,
//           status: 'PENDING',
//           paymentStatus: 'PENDING',
//         },
//         include: {
//           service: true,
//           master: true,
//         },
//       });

//       // 3. Связать верификацию с Appointment
//       await tx.telegramVerification.update({
//         where: { id: verification.id },
//         data: { appointmentId: appointment.id },
//       });

//       return { appointment, verification: updatedVerification };
//     });

//     return NextResponse.json({
//       success: true,
//       appointmentId: result.appointment.id,
//       appointment: {
//         id: result.appointment.id,
//         serviceId: result.appointment.serviceId,
//         serviceName: result.appointment.service.name,
//         masterId: result.appointment.masterId,
//         masterName: result.appointment.master.name,
//         startAt: result.appointment.startAt,
//         endAt: result.appointment.endAt,
//         status: result.appointment.status,
//         paymentStatus: result.appointment.paymentStatus,
//       },
//       message: 'Appointment created successfully',
//     });
//   } catch (error) {
//     console.error('Complete registration error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
