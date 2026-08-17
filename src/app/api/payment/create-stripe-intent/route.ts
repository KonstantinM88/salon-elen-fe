// src/app/api/payment/create-stripe-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAppointmentPayableCents } from '@/lib/promotions';

// ✅ ИСПРАВЛЕНО: Используем правильную версию API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, locale = 'en' } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const amount = await getAppointmentPayableCents(appointmentId);
    if (amount == null) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Appointment price is unavailable' }, { status: 422 });
    }

    // Создаём Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
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
