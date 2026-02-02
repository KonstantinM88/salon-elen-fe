// src/app/api/booking/confirm-onsite-payment/route.ts
// ✅ НОВЫЙ ENDPOINT для подтверждения "Оплаты в салоне"

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendStatusChangeEmail } from '@/lib/email';
import { sendAdminNotification } from '@/lib/send-admin-notification';
import { notifyClientAppointmentStatus } from '@/lib/telegram-bot';

type ConfirmOnsiteRequest = {
  appointmentId: string;
};

type ConfirmOnsiteResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export async function POST(
  request: NextRequest
): Promise<NextResponse<ConfirmOnsiteResponse>> {
  try {
    const body = (await request.json()) as ConfirmOnsiteRequest;
    const { appointmentId } = body;

    console.log('💰 [Onsite Payment] Confirming for:', appointmentId);

    // Валидация
    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Получаем appointment с include для уведомления
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: {
          select: {
            name: true,
            parent: {
              select: {
                name: true,
              },
            },
          },
        },
        master: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Обновляем appointment - добавляем note о выборе оплаты в салоне
    const existingNotes = appointment.notes || '';
    const onsiteNote = 'Клиент выбрал оплату в салоне';
    const newNotes = existingNotes
      ? `${onsiteNote}\n${existingNotes}`
      : onsiteNote;

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        notes: newNotes,
        // paymentStatus остаётся PENDING - клиент оплатит при визите
      },
      include: {
        service: {
          select: {
            name: true,
            parent: {
              select: {
                name: true,
              },
            },
          },
        },
        master: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log('✅ [Onsite Payment] Appointment updated:', appointmentId);

    // ✅ ОТПРАВКА TELEGRAM УВЕДОМЛЕНИЯ АДМИНИСТРАТОРУ
    sendAdminNotification({
      id: updated.id,
      customerName: updated.customerName,
      phone: updated.phone,
      email: updated.email || null,
      serviceName: updated.service?.name || 'Услуга не указана',
      masterName: updated.master?.name || 'Мастер не указан',
      masterId: updated.masterId || null,
      startAt: updated.startAt,
      endAt: updated.endAt,
      paymentStatus: updated.paymentStatus, // PENDING
    }).catch((err) => {
      console.error('❌ [Onsite Payment] Failed to send Telegram notification:', err);
    });

    const serviceName = updated.service?.parent?.name
      ? `${updated.service.parent.name} / ${updated.service.name}`
      : updated.service?.name || '—';
    const masterName = updated.master?.name || '—';

    if (updated.email) {
      sendStatusChangeEmail({
        customerName: updated.customerName,
        email: updated.email,
        serviceName,
        masterName,
        startAt: updated.startAt,
        endAt: updated.endAt,
        status: 'PENDING',
        locale: (updated.locale as 'de' | 'ru' | 'en') || 'de',
      }).catch((err) => {
        console.error('❌ [Onsite Payment] Email send error:', err);
      });
    }

    if (updated.phone) {
      notifyClientAppointmentStatus({
        customerName: updated.customerName,
        email: updated.email,
        phone: updated.phone,
        serviceName,
        masterName,
        startAt: updated.startAt,
        endAt: updated.endAt,
        status: 'PENDING',
        locale: (updated.locale as 'de' | 'ru' | 'en') || 'de',
      }).catch((err) => {
        console.error('❌ [Onsite Payment] Telegram send error:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Onsite payment confirmed',
    });
  } catch (error) {
    console.error('❌ [Onsite Payment] Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to confirm onsite payment';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}


//-------------31.01.26--------------
// // src/app/api/booking/confirm-onsite-payment/route.ts
// // ✅ НОВЫЙ ENDPOINT для подтверждения "Оплаты в салоне"

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { sendStatusChangeEmail } from '@/lib/email';
// import { sendAdminNotification } from '@/lib/send-admin-notification';
// import { notifyClientAppointmentStatus } from '@/lib/telegram-bot';

// type ConfirmOnsiteRequest = {
//   appointmentId: string;
// };

// type ConfirmOnsiteResponse =
//   | {
//       success: true;
//       message: string;
//     }
//   | {
//       success: false;
//       error: string;
//     };

// export async function POST(
//   request: NextRequest
// ): Promise<NextResponse<ConfirmOnsiteResponse>> {
//   try {
//     const body = (await request.json()) as ConfirmOnsiteRequest;
//     const { appointmentId } = body;

//     console.log('💰 [Onsite Payment] Confirming for:', appointmentId);

//     // Валидация
//     if (!appointmentId) {
//       return NextResponse.json(
//         { success: false, error: 'Appointment ID is required' },
//         { status: 400 }
//       );
//     }

//     // Получаем appointment с include для уведомления
//     const appointment = await prisma.appointment.findUnique({
//       where: { id: appointmentId },
//       include: {
//         service: {
//           select: {
//             name: true,
//             parent: {
//               select: {
//                 name: true,
//               },
//             },
//           },
//         },
//         master: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     });

//     if (!appointment) {
//       return NextResponse.json(
//         { success: false, error: 'Appointment not found' },
//         { status: 404 }
//       );
//     }

//     // Обновляем appointment - добавляем note о выборе оплаты в салоне
//     const existingNotes = appointment.notes || '';
//     const onsiteNote = 'Клиент выбрал оплату в салоне';
//     const newNotes = existingNotes
//       ? `${onsiteNote}\n${existingNotes}`
//       : onsiteNote;

//     const updated = await prisma.appointment.update({
//       where: { id: appointmentId },
//       data: {
//         notes: newNotes,
//         // paymentStatus остаётся PENDING - клиент оплатит при визите
//       },
//       include: {
//         service: {
//           select: {
//             name: true,
//             parent: {
//               select: {
//                 name: true,
//               },
//             },
//           },
//         },
//         master: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     });

//     console.log('✅ [Onsite Payment] Appointment updated:', appointmentId);

//     // ✅ ОТПРАВКА TELEGRAM УВЕДОМЛЕНИЯ АДМИНИСТРАТОРУ
//     sendAdminNotification({
//       id: updated.id,
//       customerName: updated.customerName,
//       phone: updated.phone,
//       email: updated.email || null,
//       serviceName: updated.service?.name || 'Услуга не указана',
//       masterName: updated.master?.name || 'Мастер не указан',
//       masterId: updated.masterId || null,
//       startAt: updated.startAt,
//       endAt: updated.endAt,
//       paymentStatus: updated.paymentStatus, // PENDING
//     }).catch((err) => {
//       console.error('❌ [Onsite Payment] Failed to send Telegram notification:', err);
//     });

//     const serviceName = updated.service?.parent?.name
//       ? `${updated.service.parent.name} / ${updated.service.name}`
//       : updated.service?.name || '—';
//     const masterName = updated.master?.name || '—';

//     if (updated.email) {
//       sendStatusChangeEmail({
//         customerName: updated.customerName,
//         email: updated.email,
//         serviceName,
//         masterName,
//         startAt: updated.startAt,
//         endAt: updated.endAt,
//         status: 'PENDING',
//       }).catch((err) => {
//         console.error('❌ [Onsite Payment] Email send error:', err);
//       });
//     }

//     if (updated.phone) {
//       notifyClientAppointmentStatus({
//         customerName: updated.customerName,
//         email: updated.email,
//         phone: updated.phone,
//         serviceName,
//         masterName,
//         startAt: updated.startAt,
//         endAt: updated.endAt,
//         status: 'PENDING',
//       }).catch((err) => {
//         console.error('❌ [Onsite Payment] Telegram send error:', err);
//       });
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Onsite payment confirmed',
//     });
//   } catch (error) {
//     console.error('❌ [Onsite Payment] Error:', error);

//     const errorMessage =
//       error instanceof Error ? error.message : 'Failed to confirm onsite payment';

//     return NextResponse.json(
//       { success: false, error: errorMessage },
//       { status: 500 }
//     );
//   }
// }
