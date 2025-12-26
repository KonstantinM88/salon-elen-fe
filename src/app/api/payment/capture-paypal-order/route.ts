// src/app/api/payment/capture-paypal-order/route.ts
// ✅ ФИНАЛЬНАЯ ВЕРСИЯ - использует utils и обновляет БД

import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalApiUrl } from '@/lib/paypal-utils';
import { prisma } from '@/lib/prisma';

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

    // ✅ Обновляем appointment в базе данных
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

      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus: 'PAID',
          notes: newNotes,
        },
      });

      console.log('✅ [PayPal Capture] Appointment updated:', appointmentId);
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




//------исправленный файл (закомментирован)------
// // src/app/api/payment/capture-paypal-order/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { getPayPalAccessToken, getPayPalApiUrl } from '@/lib/paypal-utils';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { orderId, appointmentId } = body;

//     if (!orderId || !appointmentId) {
//       return NextResponse.json(
//         { error: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     const accessToken = await getPayPalAccessToken();
//     const PAYPAL_API = getPayPalApiUrl();

//     // Захватываем платёж
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

//     if (!response.ok) {
//       console.error('PayPal capture error:', data);
//       throw new Error(data.message || 'Failed to capture PayPal payment');
//     }

//     // TODO: Обновить статус аппоинтмента в базе данных
//     // await prisma.appointment.update({
//     //   where: { id: appointmentId },
//     //   data: {
//     //     paymentStatus: 'paid',
//     //     paymentMethod: 'paypal',
//     //     paypalOrderId: orderId,
//     //     paypalCaptureId: data.purchase_units[0].payments.captures[0].id,
//     //   },
//     // });

//     return NextResponse.json({
//       success: true,
//       captureId: data.purchase_units[0].payments.captures[0].id,
//     });
//   } catch (error) {
//     console.error('Error capturing PayPal payment:', error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Failed to capture PayPal payment' },
//       { status: 500 }
//     );
//   }
// }