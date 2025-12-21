// src/app/api/payment/create-paypal-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayPalAccessToken, getPayPalApiUrl } from '@/lib/paypal-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, amount } = body;

    if (!appointmentId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();
    const PAYPAL_API = getPayPalApiUrl();

    // Создаём PayPal order
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: appointmentId,
            amount: {
              currency_code: 'EUR',
              value: (amount / 100).toFixed(2),
            },
            description: `Salon Elen - Appointment ${appointmentId}`,
          },
        ],
        application_context: {
          brand_name: 'Salon Elen',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/payment/success?appointment=${appointmentId}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/payment?appointment=${appointmentId}`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('PayPal order creation error:', data);
      throw new Error(data.message || 'Failed to create PayPal order');
    }

    return NextResponse.json({
      orderId: data.id,
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}

