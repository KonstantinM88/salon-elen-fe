// ========================================
// Обработка выбора способа оплаты
// Используем appointmentId (реальная запись),
// а не draftId (черновик)
// ========================================
// src/app/api/booking/payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';
import { translate, type MessageKey } from '@/i18n/messages';

type PaymentMethod = 'card' | 'paypal' | 'cash';

type PaymentRequest = {
  appointmentId?: string;
  paymentMethod?: PaymentMethod;
};

type PaymentSuccessResponse = {
  ok: true;
  message: string;
  paymentUrl?: string;
};

type PaymentErrorResponse = {
  error: string;
};

type PaymentResponse = PaymentSuccessResponse | PaymentErrorResponse;

export async function POST(
  req: NextRequest,
): Promise<NextResponse<PaymentResponse>> {
  const locale = resolveLocale(req);
  const t = (key: MessageKey) => translate(locale, key);

  try {
    const body = (await req.json()) as PaymentRequest;
    const { appointmentId, paymentMethod } = body;

    // Валидация входных данных
    if (!appointmentId || !paymentMethod) {
      return NextResponse.json(
        {
          error: t('api_payment_missing_params'),
        },
        { status: 400 },
      );
    }

    if (!['card', 'paypal', 'cash'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: t('api_payment_invalid_method') },
        { status: 400 },
      );
    }

    // 1. Находим запись
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: {
        id: true,
        status: true,
        serviceId: true,
        customerName: true,
        email: true,
        phone: true,
        notes: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: t('api_payment_not_found') },
        { status: 404 },
      );
    }

    // 2. Получаем данные услуги (name + priceCents)
    const service = await prisma.service.findUnique({
      where: { id: appointment.serviceId },
      select: {
        name: true,
        priceCents: true,
      },
    });

    const serviceName = service?.name ?? t('api_payment_unknown_service');

    // 3. Обновляем notes, добавляя способ оплаты
    const existingNotes = appointment.notes || '';
    const paymentNote = `${t('api_payment_note_prefix')}: ${paymentMethod}`;
    const newNotes = existingNotes
      ? `${paymentNote}\n${existingNotes}`
      : paymentNote;

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        notes: newNotes,
      },
    });

    console.log(
      `[Payment] Запись ${appointmentId}: выбран способ оплаты ${paymentMethod} для услуги "${serviceName}"`,
    );

    // 4. Обработка способов оплаты
    switch (paymentMethod) {
      case 'card': {
        // TODO: интеграция со Stripe / YooKassa и т.д.

        console.log('[Payment] TODO: Интеграция со Stripe');
        return NextResponse.json({
          ok: true,
          message: t('api_payment_card_redirect'),
          // paymentUrl: 'https://stripe.com/...'
        });
      }

      case 'paypal': {
        // TODO: интеграция с PayPal
        console.log('[Payment] TODO: Интеграция с PayPal');
        return NextResponse.json({
          ok: true,
          message: t('api_payment_paypal_redirect'),
          // paymentUrl: 'https://paypal.com/...'
        });
      }

      case 'cash': {
        // Наличные — оплата в салоне, ничего дополнительно не делаем
        return NextResponse.json({
          ok: true,
          message: t('api_payment_cash'),
        });
      }

      default:
        return NextResponse.json(
          { error: t('api_payment_unknown_method') },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('[Payment Error]:', error);
    return NextResponse.json(
      { error: t('api_payment_error') },
      { status: 500 },
    );
  }
}

function resolveLocale(req: NextRequest): Locale {
  const cookieLocale = req.cookies.get('locale')?.value as Locale | undefined;
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  const header = req.headers.get('accept-language') ?? '';
  const match = header.match(/\b(de|en|ru)\b/i);
  if (match) {
    const value = match[1].toLowerCase() as Locale;
    if (LOCALES.includes(value)) {
      return value;
    }
  }

  return DEFAULT_LOCALE;
}