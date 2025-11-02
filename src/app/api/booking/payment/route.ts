// src/app/api/booking/payment/route.ts
// ========================================
// ВЕРСИЯ: 4 (РЕАЛЬНАЯ ФИНАЛЬНАЯ - ИСПОЛЬЗУЕТСЯ name ВМЕСТО title)
// ДАТА: 2025-11-01
// ВАЖНО: В вашей Prisma схеме Service использует поле "name", а не "title"!
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type PaymentMethod = 'card' | 'paypal' | 'cash';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftId, paymentMethod } = body as {
      draftId: string;
      paymentMethod: PaymentMethod;
    };

    // Валидация входных данных
    if (!draftId || !paymentMethod) {
      return NextResponse.json(
        { error: 'draftId и paymentMethod обязательны' },
        { status: 400 }
      );
    }

    if (!['card', 'paypal', 'cash'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Некорректный способ оплаты' },
        { status: 400 }
      );
    }

    // ============================================
    // ЗАПРОС 1: Получаем запись appointment
    // ============================================
    const appointment = await prisma.appointment.findUnique({
      where: { id: draftId },
      select: {
        id: true,
        status: true,
        serviceId: true,
        customerName: true,
        email: true,
        phone: true,
        notes: true, // ВАЖНО: нужно для сохранения старых notes
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Запись не найдена' },
        { status: 404 }
      );
    }

    // ============================================
    // ЗАПРОС 2: Получаем данные услуги ОТДЕЛЬНО
    // Это решает проблему TypeScript с вложенным select
    // ============================================
    const service = await prisma.service.findUnique({
      where: { id: appointment.serviceId },
      select: {
        name: true,  // ← ИСПРАВЛЕНО: в вашей схеме поле называется name, а не title!
        priceCents: true,
      },
    });

    // ============================================
    // Формируем новые notes с сохранением старых
    // ============================================
    const existingNotes = appointment.notes || '';
    const paymentNote = `Способ оплаты: ${paymentMethod}`;
    const newNotes = existingNotes 
      ? `${paymentNote}\n${existingNotes}` 
      : paymentNote;

    // ============================================
    // Сохраняем способ оплаты в notes
    // ============================================
    await prisma.appointment.update({
      where: { id: draftId },
      data: {
        notes: newNotes,
      },
    });

    // ============================================
    // Логирование с БЕЗОПАСНОЙ проверкой service
    // service может быть null, используем optional chaining
    // ============================================
    const serviceName = service?.name || 'неизвестная услуга';  // ← ИСПРАВЛЕНО: name вместо title
    console.log(
      `[Payment] Запись ${draftId}: выбран способ оплаты ${paymentMethod} для услуги "${serviceName}"`
    );

    // ============================================
    // Обработка в зависимости от способа оплаты
    // ============================================
    switch (paymentMethod) {
      case 'card': {
        // TODO: Интеграция со Stripe/Yookassa
        // Пример:
        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        // const session = await stripe.checkout.sessions.create({
        //   payment_method_types: ['card'],
        //   line_items: [{
        //     price_data: {
        //       currency: 'eur',
        //       product_data: { name: serviceName },  // ← используем serviceName
        //       unit_amount: service?.priceCents || 0,
        //     },
        //     quantity: 1,
        //   }],
        //   mode: 'payment',
        //   success_url: `${process.env.NEXT_PUBLIC_URL}/booking/confirmation?id=${draftId}`,
        //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/booking/payment?draft=${draftId}`,
        // });
        // return NextResponse.json({ paymentUrl: session.url });

        // Пока заглушка
        console.log('[Payment] TODO: Интеграция со Stripe');
        return NextResponse.json({
          ok: true,
          message: 'Переход к оплате картой',
          // paymentUrl: 'https://stripe.com/...',
        });
      }

      case 'paypal': {
        // TODO: Интеграция с PayPal
        console.log('[Payment] TODO: Интеграция с PayPal');
        return NextResponse.json({
          ok: true,
          message: 'Переход к оплате через PayPal',
          // paymentUrl: 'https://paypal.com/...',
        });
      }

      case 'cash': {
        // Наличные - оплата в салоне
        return NextResponse.json({
          ok: true,
          message: 'Оплата наличными в салоне',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Неизвестный способ оплаты' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Payment Error]:', error);
    return NextResponse.json(
      { error: 'Ошибка обработки оплаты' },
      { status: 500 }
    );
  }
}