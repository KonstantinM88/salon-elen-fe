// src/app/api/payment/capture-paypal-order/route.ts
// ✅ С TELEGRAM УВЕДОМЛЕНИЯМИ АДМИНИСТРАТОРУ

import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalApiUrl } from '@/lib/paypal-utils';
import { prisma } from '@/lib/prisma';
import { sendStatusChangeEmail } from '@/lib/email';
import { sendAdminNotification } from '@/lib/send-admin-notification';
import { notifyClientAppointmentStatus } from '@/lib/telegram-bot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, appointmentId } = body;

    console.log('🔵 [PayPal Capture] Starting:', { orderId, appointmentId });

    if (!orderId || !appointmentId) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and appointmentId' },
        { status: 400 }
      );
    }

    // ✅ Получаем access token через utils
    const accessToken = await getPayPalAccessToken();
    const PAYPAL_API = getPayPalApiUrl();

    // ✅ Захватываем платёж (capture)
    const response = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    console.log('🔵 [PayPal Capture] Response:', {
      status: response.status,
      captureStatus: data.status,
    });

    if (!response.ok) {
      console.error('🔴 [PayPal Capture] Failed:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to capture PayPal payment' },
        { status: response.status }
      );
    }

    // ✅ Проверяем статус capture
    if (data.status !== 'COMPLETED') {
      console.error('🔴 [PayPal Capture] Order not completed:', data.status);
      return NextResponse.json(
        { error: 'Payment not completed', status: data.status },
        { status: 400 }
      );
    }

    // ✅ Получаем capture ID
    const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    if (!captureId) {
      console.error('🔴 [PayPal Capture] No capture ID found');
      return NextResponse.json(
        { error: 'No capture ID in response' },
        { status: 500 }
      );
    }

    console.log('✅ [PayPal Capture] Success:', captureId);

    // ✅ Обновляем appointment в базе данных с include
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { notes: true },
      });

      const existingNotes = appointment?.notes || '';
      const paymentNote = `PayPal Payment ID: ${captureId}\nPayPal Order ID: ${orderId}`;
      const newNotes = existingNotes
        ? `${paymentNote}\n${existingNotes}`
        : paymentNote;

      const updated = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus: 'PAID',
          notes: newNotes,
        },
        select: {
          id: true,
          customerName: true,
          phone: true,
          email: true,
          masterId: true,
          startAt: true,
          endAt: true,
          paymentStatus: true,
          bookingMethod: true,
          locale: true, // ✅ Явно выбираем locale
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

      console.log('✅ [PayPal Capture] Appointment updated:', appointmentId);

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
        paymentStatus: updated.paymentStatus,
        bookingMethod: updated.bookingMethod,
      }).catch((err) => {
        console.error('🔴 [PayPal Capture] Failed to send Telegram notification:', err);
      });

      const serviceName = updated.service?.parent?.name
        ? `${updated.service.parent.name} / ${updated.service.name}`
        : updated.service?.name || '—';
      const masterName = updated.master?.name || '—';

      if (updated.email) {
        sendStatusChangeEmail({
          appointmentId: updated.id,
          customerName: updated.customerName,
          email: updated.email,
          serviceName,
          masterName,
          startAt: updated.startAt,
          endAt: updated.endAt,
          status: 'PENDING',
          locale: (updated.locale as 'de' | 'ru' | 'en') || 'de',
        }).catch((err) => {
          console.error('🔴 [PayPal Capture] Email send error:', err);
        });
      }

      if (updated.phone) {
        notifyClientAppointmentStatus({
          appointmentId: updated.id,
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
          console.error('🔴 [PayPal Capture] Telegram send error:', err);
        });
      }

    } catch (dbError) {
      console.error('🔴 [PayPal Capture] DB update failed:', dbError);
      // Не возвращаем ошибку, т.к. оплата всё равно прошла
      // Админ может вручную проверить по orderId в PayPal Dashboard
    }

    // ✅ Возвращаем успешный результат
    return NextResponse.json({
      success: true,
      captureId: captureId,
      orderId: orderId,
    });
  } catch (error) {
    console.error('🔴 [PayPal Capture] Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to capture PayPal payment' 
      },
      { status: 500 }
    );
  }
}




//-------------исправляем уведомление клиенту на его язык по его выбору при записи------------
// // src/app/api/payment/capture-paypal-order/route.ts
// // ✅ С TELEGRAM УВЕДОМЛЕНИЯМИ АДМИНИСТРАТОРУ

// import { NextRequest, NextResponse } from 'next/server';
// import { getPayPalAccessToken, getPayPalApiUrl } from '@/lib/paypal-utils';
// import { prisma } from '@/lib/prisma';
// import { sendStatusChangeEmail } from '@/lib/email';
// import { sendAdminNotification } from '@/lib/send-admin-notification';
// import { notifyClientAppointmentStatus } from '@/lib/telegram-bot';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { orderId, appointmentId } = body;

//     console.log('🔵 [PayPal Capture] Starting:', { orderId, appointmentId });

//     if (!orderId || !appointmentId) {
//       return NextResponse.json(
//         { error: 'Missing required fields: orderId and appointmentId' },
//         { status: 400 }
//       );
//     }

//     // ✅ Получаем access token через utils
//     const accessToken = await getPayPalAccessToken();
//     const PAYPAL_API = getPayPalApiUrl();

//     // ✅ Захватываем платёж (capture)
//     const response = await fetch(
//       `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${accessToken}`,
//         },
//       }
//     );

//     const data = await response.json();

//     console.log('🔵 [PayPal Capture] Response:', {
//       status: response.status,
//       captureStatus: data.status,
//     });

//     if (!response.ok) {
//       console.error('🔴 [PayPal Capture] Failed:', data);
//       return NextResponse.json(
//         { error: data.message || 'Failed to capture PayPal payment' },
//         { status: response.status }
//       );
//     }

//     // ✅ Проверяем статус capture
//     if (data.status !== 'COMPLETED') {
//       console.error('🔴 [PayPal Capture] Order not completed:', data.status);
//       return NextResponse.json(
//         { error: 'Payment not completed', status: data.status },
//         { status: 400 }
//       );
//     }

//     // ✅ Получаем capture ID
//     const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;

//     if (!captureId) {
//       console.error('🔴 [PayPal Capture] No capture ID found');
//       return NextResponse.json(
//         { error: 'No capture ID in response' },
//         { status: 500 }
//       );
//     }

//     console.log('✅ [PayPal Capture] Success:', captureId);

//     // ✅ Обновляем appointment в базе данных с include
//     try {
//       const appointment = await prisma.appointment.findUnique({
//         where: { id: appointmentId },
//         select: { notes: true },
//       });

//       const existingNotes = appointment?.notes || '';
//       const paymentNote = `PayPal Payment ID: ${captureId}\nPayPal Order ID: ${orderId}`;
//       const newNotes = existingNotes
//         ? `${paymentNote}\n${existingNotes}`
//         : paymentNote;

//       const updated = await prisma.appointment.update({
//         where: { id: appointmentId },
//         data: {
//           paymentStatus: 'PAID',
//           notes: newNotes,
//         },
//         include: {
//           service: {
//             select: {
//               name: true,
//               parent: {
//                 select: {
//                   name: true,
//                 },
//               },
//             },
//           },
//           master: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       });

//       console.log('✅ [PayPal Capture] Appointment updated:', appointmentId);

//       // ✅ ОТПРАВКА TELEGRAM УВЕДОМЛЕНИЯ АДМИНИСТРАТОРУ
//       sendAdminNotification({
//         id: updated.id,
//         customerName: updated.customerName,
//         phone: updated.phone,
//         email: updated.email || null,
//         serviceName: updated.service?.name || 'Услуга не указана',
//         masterName: updated.master?.name || 'Мастер не указан',
//         masterId: updated.masterId || null,
//         startAt: updated.startAt,
//         endAt: updated.endAt,
//         paymentStatus: updated.paymentStatus,
//       }).catch((err) => {
//         console.error('🔴 [PayPal Capture] Failed to send Telegram notification:', err);
//       });

//       const serviceName = updated.service?.parent?.name
//         ? `${updated.service.parent.name} / ${updated.service.name}`
//         : updated.service?.name || '—';
//       const masterName = updated.master?.name || '—';

//       if (updated.email) {
//         sendStatusChangeEmail({
//           customerName: updated.customerName,
//           email: updated.email,
//           serviceName,
//           masterName,
//           startAt: updated.startAt,
//           endAt: updated.endAt,
//           status: 'PENDING',
//           locale: (updated.locale as 'de' | 'ru' | 'en') || 'de',
//         }).catch((err) => {
//           console.error('🔴 [PayPal Capture] Email send error:', err);
//         });
//       }

//       if (updated.phone) {
//         notifyClientAppointmentStatus({
//           customerName: updated.customerName,
//           email: updated.email,
//           phone: updated.phone,
//           serviceName,
//           masterName,
//           startAt: updated.startAt,
//           endAt: updated.endAt,
//           status: 'PENDING',
//           locale: (updated.locale as 'de' | 'ru' | 'en') || 'de',
//         }).catch((err) => {
//           console.error('🔴 [PayPal Capture] Telegram send error:', err);
//         });
//       }

//     } catch (dbError) {
//       console.error('🔴 [PayPal Capture] DB update failed:', dbError);
//       // Не возвращаем ошибку, т.к. оплата всё равно прошла
//       // Админ может вручную проверить по orderId в PayPal Dashboard
//     }

//     // ✅ Возвращаем успешный результат
//     return NextResponse.json({
//       success: true,
//       captureId: captureId,
//       orderId: orderId,
//     });
//   } catch (error) {
//     console.error('🔴 [PayPal Capture] Error:', error);
//     return NextResponse.json(
//       { 
//         error: error instanceof Error ? error.message : 'Failed to capture PayPal payment' 
//       },
//       { status: 500 }
//     );
//   }
// }



//---------31.01.26-------
// // src/app/api/payment/capture-paypal-order/route.ts
// // ✅ С TELEGRAM УВЕДОМЛЕНИЯМИ АДМИНИСТРАТОРУ

// import { NextRequest, NextResponse } from 'next/server';
// import { getPayPalAccessToken, getPayPalApiUrl } from '@/lib/paypal-utils';
// import { prisma } from '@/lib/prisma';
// import { sendStatusChangeEmail } from '@/lib/email';
// import { sendAdminNotification } from '@/lib/send-admin-notification';
// import { notifyClientAppointmentStatus } from '@/lib/telegram-bot';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { orderId, appointmentId } = body;

//     console.log('🔵 [PayPal Capture] Starting:', { orderId, appointmentId });

//     if (!orderId || !appointmentId) {
//       return NextResponse.json(
//         { error: 'Missing required fields: orderId and appointmentId' },
//         { status: 400 }
//       );
//     }

//     // ✅ Получаем access token через utils
//     const accessToken = await getPayPalAccessToken();
//     const PAYPAL_API = getPayPalApiUrl();

//     // ✅ Захватываем платёж (capture)
//     const response = await fetch(
//       `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${accessToken}`,
//         },
//       }
//     );

//     const data = await response.json();

//     console.log('🔵 [PayPal Capture] Response:', {
//       status: response.status,
//       captureStatus: data.status,
//     });

//     if (!response.ok) {
//       console.error('🔴 [PayPal Capture] Failed:', data);
//       return NextResponse.json(
//         { error: data.message || 'Failed to capture PayPal payment' },
//         { status: response.status }
//       );
//     }

//     // ✅ Проверяем статус capture
//     if (data.status !== 'COMPLETED') {
//       console.error('🔴 [PayPal Capture] Order not completed:', data.status);
//       return NextResponse.json(
//         { error: 'Payment not completed', status: data.status },
//         { status: 400 }
//       );
//     }

//     // ✅ Получаем capture ID
//     const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;

//     if (!captureId) {
//       console.error('🔴 [PayPal Capture] No capture ID found');
//       return NextResponse.json(
//         { error: 'No capture ID in response' },
//         { status: 500 }
//       );
//     }

//     console.log('✅ [PayPal Capture] Success:', captureId);

//     // ✅ Обновляем appointment в базе данных с include
//     try {
//       const appointment = await prisma.appointment.findUnique({
//         where: { id: appointmentId },
//         select: { notes: true },
//       });

//       const existingNotes = appointment?.notes || '';
//       const paymentNote = `PayPal Payment ID: ${captureId}\nPayPal Order ID: ${orderId}`;
//       const newNotes = existingNotes
//         ? `${paymentNote}\n${existingNotes}`
//         : paymentNote;

//       const updated = await prisma.appointment.update({
//         where: { id: appointmentId },
//         data: {
//           paymentStatus: 'PAID',
//           notes: newNotes,
//         },
//         include: {
//           service: {
//             select: {
//               name: true,
//               parent: {
//                 select: {
//                   name: true,
//                 },
//               },
//             },
//           },
//           master: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       });

//       console.log('✅ [PayPal Capture] Appointment updated:', appointmentId);

//       // ✅ ОТПРАВКА TELEGRAM УВЕДОМЛЕНИЯ АДМИНИСТРАТОРУ
//       sendAdminNotification({
//         id: updated.id,
//         customerName: updated.customerName,
//         phone: updated.phone,
//         email: updated.email || null,
//         serviceName: updated.service?.name || 'Услуга не указана',
//         masterName: updated.master?.name || 'Мастер не указан',
//         masterId: updated.masterId || null,
//         startAt: updated.startAt,
//         endAt: updated.endAt,
//         paymentStatus: updated.paymentStatus,
//       }).catch((err) => {
//         console.error('🔴 [PayPal Capture] Failed to send Telegram notification:', err);
//       });

//       const serviceName = updated.service?.parent?.name
//         ? `${updated.service.parent.name} / ${updated.service.name}`
//         : updated.service?.name || '—';
//       const masterName = updated.master?.name || '—';

//       if (updated.email) {
//         sendStatusChangeEmail({
//           customerName: updated.customerName,
//           email: updated.email,
//           serviceName,
//           masterName,
//           startAt: updated.startAt,
//           endAt: updated.endAt,
//           status: 'PENDING',
//         }).catch((err) => {
//           console.error('🔴 [PayPal Capture] Email send error:', err);
//         });
//       }

//       if (updated.phone) {
//         notifyClientAppointmentStatus({
//           customerName: updated.customerName,
//           email: updated.email,
//           phone: updated.phone,
//           serviceName,
//           masterName,
//           startAt: updated.startAt,
//           endAt: updated.endAt,
//           status: 'PENDING',
//         }).catch((err) => {
//           console.error('🔴 [PayPal Capture] Telegram send error:', err);
//         });
//       }

//     } catch (dbError) {
//       console.error('🔴 [PayPal Capture] DB update failed:', dbError);
//       // Не возвращаем ошибку, т.к. оплата всё равно прошла
//       // Админ может вручную проверить по orderId в PayPal Dashboard
//     }

//     // ✅ Возвращаем успешный результат
//     return NextResponse.json({
//       success: true,
//       captureId: captureId,
//       orderId: orderId,
//     });
//   } catch (error) {
//     console.error('🔴 [PayPal Capture] Error:', error);
//     return NextResponse.json(
//       { 
//         error: error instanceof Error ? error.message : 'Failed to capture PayPal payment' 
//       },
//       { status: 500 }
//     );
//   }
// }
