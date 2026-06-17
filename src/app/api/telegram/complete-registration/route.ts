// src/app/api/telegram/complete-registration/route.ts
// ✅ ИСПРАВЛЕНО: 
// 1. Использует firstName из TelegramUser для customerName
// 2. Fallback на email только если firstName отсутствует
// 3. ДОБАВЛЕНО: Автоматическое создание клиентов

import { NextRequest, NextResponse } from 'next/server';
import { BOOKING_METHOD } from '@/lib/booking/booking-method';
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
          locale: (verification as { locale?: string }).locale || 'de', // ✅ Язык клиента для уведомлений
          status: 'PENDING',
          paymentStatus: 'PENDING',
          bookingMethod: BOOKING_METHOD.telegramBot,
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




//---------31.01.26
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
//           select: { id: true, birthDate: true },
//         });

//         if (existing) {
//           clientId = existing.id;
//           console.log('[Complete Registration] Transaction: Found existing client:', clientId);
          
//           // ✅ ИСПРАВЛЕНИЕ: Обновляем дату рождения, если она изменилась
//           if (finalBirthDate) {
//             const newBirthDate = new Date(finalBirthDate);
//             const existingBirthDate = existing.birthDate;
            
//             // Сравниваем даты (только yyyy-mm-dd, игнорируем время)
//             const newDateStr = newBirthDate.toISOString().split('T')[0];
//             const existingDateStr = existingBirthDate ? existingBirthDate.toISOString().split('T')[0] : null;
            
//             if (newDateStr !== existingDateStr) {
//               await tx.client.update({
//                 where: { id: existing.id },
//                 data: { birthDate: newBirthDate },
//               });
//               console.log('[Complete Registration] Transaction: Updated client birthDate:', newDateStr);
//             }
//           }
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
