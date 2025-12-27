// src/app/api/webhooks/stripe/route.ts
// ✅ Stripe Webhook для автоматического обновления БД после оплаты

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// Инициализация Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Webhook Secret (получишь из Stripe Dashboard)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ [Stripe Webhook] No signature header');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Проверка подписи от Stripe (безопасность!)
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('❌ [Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('🔔 [Stripe Webhook] Event received:', event.type);

  // Обработка успешной оплаты
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const appointmentId = paymentIntent.metadata.appointmentId;

    console.log('💳 [Stripe Webhook] Payment succeeded:', {
      paymentIntentId: paymentIntent.id,
      appointmentId,
      amount: paymentIntent.amount,
    });

    if (appointmentId) {
      try {
        // Обновляем статус в БД
        const updated = await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            paymentStatus: 'PAID',
            notes: paymentIntent.metadata.notes 
              ? `${paymentIntent.metadata.notes}\nStripe Payment: ${paymentIntent.id}`
              : `Stripe Payment: ${paymentIntent.id}`,
          },
        });

        console.log('✅ [Stripe Webhook] Appointment updated:', {
          id: updated.id,
          paymentStatus: updated.paymentStatus,
          customer: updated.customerName,
        });
      } catch (error) {
        console.error('❌ [Stripe Webhook] Error updating appointment:', error);
        return NextResponse.json(
          { error: 'Database update failed' },
          { status: 500 }
        );
      }
    } else {
      console.warn('⚠️ [Stripe Webhook] No appointmentId in metadata');
    }
  }

  // Обработка неудачной оплаты
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const appointmentId = paymentIntent.metadata.appointmentId;

    console.log('❌ [Stripe Webhook] Payment failed:', {
      paymentIntentId: paymentIntent.id,
      appointmentId,
    });

    if (appointmentId) {
      try {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            paymentStatus: 'FAILED',
            notes: `Payment failed: ${paymentIntent.id}`,
          },
        });

        console.log('✅ [Stripe Webhook] Appointment marked as FAILED');
      } catch (error) {
        console.error('❌ [Stripe Webhook] Error updating failed payment:', error);
      }
    }
  }

  // Возвращаем успех Stripe
  return NextResponse.json({ received: true });
}