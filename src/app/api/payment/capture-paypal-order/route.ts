// src/app/api/payment/capture-paypal-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalApiUrl } from '@/lib/paypal-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, appointmentId } = body;

    if (!orderId || !appointmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();
    const PAYPAL_API = getPayPalApiUrl();

    // Захватываем платёж
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

    if (!response.ok) {
      console.error('PayPal capture error:', data);
      throw new Error(data.message || 'Failed to capture PayPal payment');
    }

    // TODO: Обновить статус аппоинтмента в базе данных
    // await prisma.appointment.update({
    //   where: { id: appointmentId },
    //   data: {
    //     paymentStatus: 'paid',
    //     paymentMethod: 'paypal',
    //     paypalOrderId: orderId,
    //     paypalCaptureId: data.purchase_units[0].payments.captures[0].id,
    //   },
    // });

    return NextResponse.json({
      success: true,
      captureId: data.purchase_units[0].payments.captures[0].id,
    });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture PayPal payment' },
      { status: 500 }
    );
  }
}