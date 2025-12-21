// src/app/api/payment/create-stripe-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// ✅ ИСПРАВЛЕНО: Используем правильную версию API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, amount, locale = 'en' } = body;

    if (!appointmentId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Создаём Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Сумма в центах
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        appointmentId,
        locale,
      },
      description: `Salon Elen - Appointment ${appointmentId}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}