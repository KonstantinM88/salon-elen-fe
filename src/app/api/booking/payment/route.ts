// ========================================
// Обработка выбора способа оплаты
// Используем appointmentId (реальная запись),
// а не draftId (черновик)
// ========================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  try {
    const body = (await req.json()) as PaymentRequest;
    const { appointmentId, paymentMethod } = body;

    // Валидация входных данных
    if (!appointmentId || !paymentMethod) {
      return NextResponse.json(
        {
          error: 'appointmentId и paymentMethod обязательны',
        },
        { status: 400 },
      );
    }

    if (!['card', 'paypal', 'cash'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Некорректный способ оплаты' },
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
        { error: 'Запись не найдена' },
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

    const serviceName = service?.name ?? 'неизвестная услуга';

    // 3. Обновляем notes, добавляя способ оплаты
    const existingNotes = appointment.notes || '';
    const paymentNote = `Способ оплаты: ${paymentMethod}`;
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
          message: 'Переход к оплате картой',
          // paymentUrl: 'https://stripe.com/...'
        });
      }

      case 'paypal': {
        // TODO: интеграция с PayPal
        console.log('[Payment] TODO: Интеграция с PayPal');
        return NextResponse.json({
          ok: true,
          message: 'Переход к оплате через PayPal',
          // paymentUrl: 'https://paypal.com/...'
        });
      }

      case 'cash': {
        // Наличные — оплата в салоне, ничего дополнительно не делаем
        return NextResponse.json({
          ok: true,
          message: 'Оплата наличными в салоне',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Неизвестный способ оплаты' },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('[Payment Error]:', error);
    return NextResponse.json(
      { error: 'Ошибка обработки оплаты' },
      { status: 500 },
    );
  }
}



// // ========================================
// // API оплаты: сохраняем способ оплаты в Appointment
// // Формат ответа согласован с фронтом:
// //   Успех: { ok: true, message: string, paymentUrl?: string }
// //   Ошибка: { error: string }
// // ========================================

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// type PaymentMethod = 'card' | 'paypal' | 'cash';

// type PaymentSuccessResponse = {
//   ok: true;
//   message: string;
//   paymentUrl?: string;
// };

// type PaymentErrorResponse = {
//   error: string;
// };

// type PaymentApiResponse = PaymentSuccessResponse | PaymentErrorResponse;

// type PaymentRequestBody = {
//   appointmentId: string;
//   paymentMethod: PaymentMethod;
// };

// function isPaymentMethod(value: unknown): value is PaymentMethod {
//   return value === 'card' || value === 'paypal' || value === 'cash';
// }

// function isPaymentRequestBody(value: unknown): value is PaymentRequestBody {
//   if (typeof value !== 'object' || value === null) return false;

//   const obj = value as Record<string, unknown>;

//   if (typeof obj.appointmentId !== 'string' || obj.appointmentId.trim().length === 0) {
//     return false;
//   }

//   if (!isPaymentMethod(obj.paymentMethod)) {
//     return false;
//   }

//   return true;
// }

// function jsonError(message: string, status: number): NextResponse<PaymentErrorResponse> {
//   return NextResponse.json<PaymentErrorResponse>(
//     { error: message },
//     { status }
//   );
// }

// function jsonSuccess(
//   data: PaymentSuccessResponse,
//   status = 200
// ): NextResponse<PaymentSuccessResponse> {
//   return NextResponse.json<PaymentSuccessResponse>(data, { status });
// }

// export async function POST(
//   req: NextRequest
// ): Promise<NextResponse<PaymentApiResponse>> {
//   try {
//     const rawBody: unknown = await req.json().catch(() => null);

//     if (!isPaymentRequestBody(rawBody)) {
//       return jsonError('appointmentId и paymentMethod обязательны', 400);
//     }

//     const { appointmentId, paymentMethod } = rawBody;

//     // ============================================
//     // 1. Получаем запись Appointment
//     // ============================================
//     const appointment = await prisma.appointment.findUnique({
//       where: { id: appointmentId },
//       select: {
//         id: true,
//         status: true,
//         serviceId: true,
//         customerName: true,
//         email: true,
//         phone: true,
//         notes: true,
//       },
//     });

//     if (!appointment) {
//       return jsonError('Запись не найдена', 404);
//     }

//     // ============================================
//     // 2. Получаем данные услуги отдельно
//     // ============================================
//     const service = await prisma.service.findUnique({
//       where: { id: appointment.serviceId },
//       select: {
//         name: true,      // В вашей Prisma-схеме — name
//         priceCents: true,
//       },
//     });

//     // ============================================
//     // 3. Обновляем notes: добавляем способ оплаты
//     // ============================================
//     const existingNotes = appointment.notes ?? '';
//     const paymentNote = `Способ оплаты: ${paymentMethod}`;
//     const newNotes =
//       existingNotes.trim().length > 0
//         ? `${paymentNote}\n${existingNotes}`
//         : paymentNote;

//     await prisma.appointment.update({
//       where: { id: appointmentId },
//       data: { notes: newNotes },
//     });

//     const serviceName = service?.name ?? 'неизвестная услуга';
//     console.log(
//       `[Payment] Запись ${appointmentId}: выбран способ оплаты ${paymentMethod} для услуги "${serviceName}"`
//     );

//     // ============================================
//     // 4. Обработка по способу оплаты
//     // Сейчас — заглушки, без реальной интеграции
//     // ============================================
//     switch (paymentMethod) {
//       case 'card': {
//         // TODO: Интеграция со Stripe / YooKassa
//         // Пример (псевдокод):
//         //
//         // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
//         // const session = await stripe.checkout.sessions.create({
//         //   payment_method_types: ['card'],
//         //   line_items: [{
//         //     price_data: {
//         //       currency: 'eur',
//         //       product_data: { name: serviceName },
//         //       unit_amount: service?.priceCents ?? 0,
//         //     },
//         //     quantity: 1,
//         //   }],
//         //   mode: 'payment',
//         //   success_url: `${process.env.NEXT_PUBLIC_URL}/booking/confirmation?id=${appointmentId}`,
//         //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/booking/payment?id=${appointmentId}`,
//         // });
//         //
//         // return jsonSuccess({
//         //   ok: true,
//         //   message: 'Переход к оплате картой',
//         //   paymentUrl: session.url ?? undefined,
//         // });

//         console.log('[Payment] TODO: Интеграция с оплатой картой');
//         return jsonSuccess({
//           ok: true,
//           message: 'Переход к оплате картой',
//           // paymentUrl: 'https://example.com/pay/card/...',
//         });
//       }

//       case 'paypal': {
//         // TODO: Интеграция с PayPal
//         console.log('[Payment] TODO: Интеграция с PayPal');
//         return jsonSuccess({
//           ok: true,
//           message: 'Переход к оплате через PayPal',
//           // paymentUrl: 'https://example.com/pay/paypal/...',
//         });
//       }

//       case 'cash': {
//         // Оплата наличными в салоне — ничего дополнительно не делаем
//         return jsonSuccess({
//           ok: true,
//           message: 'Оплата наличными в салоне',
//         });
//       }
//     }
//   } catch (error) {
//     // Здесь тип — unknown, но мы его не разворачиваем наружу
//     console.error('[Payment Error]:', error);
//     return jsonError('Ошибка обработки оплаты', 500);
//   }
// }



// // ========================================
// // ВЕРСИЯ: 5 (РАБОТАЕМ С Appointment, А НЕ С DRAFT)
// // ДАТА: 2025-11-19
// // Service использует поле "name", а не "title"
// // ========================================

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// type PaymentMethod = 'card' | 'paypal' | 'cash';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { appointmentId, paymentMethod } = body as {
//       appointmentId: string;
//       paymentMethod: PaymentMethod;
//     };

//     // Валидация входных данных
//     if (!appointmentId || !paymentMethod) {
//       return NextResponse.json(
//         { error: 'appointmentId и paymentMethod обязательны' },
//         { status: 400 }
//       );
//     }

//     if (!['card', 'paypal', 'cash'].includes(paymentMethod)) {
//       return NextResponse.json(
//         { error: 'Некорректный способ оплаты' },
//         { status: 400 }
//       );
//     }

//     // ============================================
//     // ЗАПРОС 1: Получаем запись appointment
//     // ============================================
//     const appointment = await prisma.appointment.findUnique({
//       where: { id: appointmentId },
//       select: {
//         id: true,
//         status: true,
//         serviceId: true,
//         customerName: true,
//         email: true,
//         phone: true,
//         notes: true,
//       },
//     });

//     if (!appointment) {
//       return NextResponse.json(
//         { error: 'Запись не найдена' },
//         { status: 404 }
//       );
//     }

//     // ============================================
//     // ЗАПРОС 2: Получаем данные услуги
//     // ============================================
//     const service = await prisma.service.findUnique({
//       where: { id: appointment.serviceId },
//       select: {
//         name: true,     // ← поле name из Prisma-схемы
//         priceCents: true,
//       },
//     });

//     const serviceName = service?.name || 'неизвестная услуга';

//     // ============================================
//     // Формируем новые notes с сохранением старых
//     // ============================================
//     const existingNotes = appointment.notes || '';
//     const paymentNote = `Способ оплаты: ${paymentMethod}`;
//     const newNotes = existingNotes
//       ? `${paymentNote}\n${existingNotes}`
//       : paymentNote;

//     // ============================================
//     // Сохраняем способ оплаты в notes
//     // ============================================
//     await prisma.appointment.update({
//       where: { id: appointmentId },
//       data: {
//         notes: newNotes,
//       },
//     });

//     console.log(
//       `[Payment] Запись ${appointmentId}: выбран способ оплаты ${paymentMethod} для услуги "${serviceName}"`
//     );

//     // ============================================
//     // Обработка в зависимости от способа оплаты
//     // ============================================
//     switch (paymentMethod) {
//       case 'card': {
//         // TODO: Интеграция со Stripe/YooKassa и т.п.
//         // Пример (псевдокод):
//         //
//         // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
//         // const session = await stripe.checkout.sessions.create({
//         //   payment_method_types: ['card'],
//         //   line_items: [{
//         //     price_data: {
//         //       currency: 'eur',
//         //       product_data: { name: serviceName },
//         //       unit_amount: service?.priceCents || 0,
//         //     },
//         //     quantity: 1,
//         //   }],
//         //   mode: 'payment',
//         //   success_url: `${process.env.NEXT_PUBLIC_URL}/booking/confirmation?id=${appointmentId}`,
//         //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/booking/payment?id=${appointmentId}`,
//         // });
//         //
//         // return NextResponse.json({ paymentUrl: session.url });

//         console.log('[Payment] TODO: Интеграция со Stripe');
//         return NextResponse.json({
//           ok: true,
//           message: 'Переход к оплате картой',
//           // paymentUrl: 'https://stripe.com/...',
//         });
//       }

//       case 'paypal': {
//         // TODO: Интеграция с PayPal
//         console.log('[Payment] TODO: Интеграция с PayPal');
//         return NextResponse.json({
//           ok: true,
//           message: 'Переход к оплате через PayPal',
//           // paymentUrl: 'https://paypal.com/...',
//         });
//       }

//       case 'cash': {
//         // Наличные - оплата в салоне, просто подтверждаем
//         return NextResponse.json({
//           ok: true,
//           message: 'Оплата наличными в салоне',
//         });
//       }

//       default:
//         return NextResponse.json(
//           { error: 'Неизвестный способ оплаты' },
//           { status: 400 }
//         );
//     }
//   } catch (error) {
//     console.error('[Payment Error]:', error);
//     return NextResponse.json(
//       { error: 'Ошибка обработки оплаты' },
//       { status: 500 }
//     );
//   }
// }



// // src/app/api/booking/payment/route.ts
// // ========================================
// // ВЕРСИЯ: 4 (РЕАЛЬНАЯ ФИНАЛЬНАЯ - ИСПОЛЬЗУЕТСЯ name ВМЕСТО title)
// // ДАТА: 2025-11-01
// // ВАЖНО: В вашей Prisma схеме Service использует поле "name", а не "title"!
// // ========================================

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// type PaymentMethod = 'card' | 'paypal' | 'cash';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { draftId, paymentMethod } = body as {
//       draftId: string;
//       paymentMethod: PaymentMethod;
//     };

//     // Валидация входных данных
//     if (!draftId || !paymentMethod) {
//       return NextResponse.json(
//         { error: 'draftId и paymentMethod обязательны' },
//         { status: 400 }
//       );
//     }

//     if (!['card', 'paypal', 'cash'].includes(paymentMethod)) {
//       return NextResponse.json(
//         { error: 'Некорректный способ оплаты' },
//         { status: 400 }
//       );
//     }

//     // ============================================
//     // ЗАПРОС 1: Получаем запись appointment
//     // ============================================
//     const appointment = await prisma.appointment.findUnique({
//       where: { id: draftId },
//       select: {
//         id: true,
//         status: true,
//         serviceId: true,
//         customerName: true,
//         email: true,
//         phone: true,
//         notes: true, // ВАЖНО: нужно для сохранения старых notes
//       },
//     });

//     if (!appointment) {
//       return NextResponse.json(
//         { error: 'Запись не найдена' },
//         { status: 404 }
//       );
//     }

//     // ============================================
//     // ЗАПРОС 2: Получаем данные услуги ОТДЕЛЬНО
//     // Это решает проблему TypeScript с вложенным select
//     // ============================================
//     const service = await prisma.service.findUnique({
//       where: { id: appointment.serviceId },
//       select: {
//         name: true,  // ← ИСПРАВЛЕНО: в вашей схеме поле называется name, а не title!
//         priceCents: true,
//       },
//     });

//     // ============================================
//     // Формируем новые notes с сохранением старых
//     // ============================================
//     const existingNotes = appointment.notes || '';
//     const paymentNote = `Способ оплаты: ${paymentMethod}`;
//     const newNotes = existingNotes 
//       ? `${paymentNote}\n${existingNotes}` 
//       : paymentNote;

//     // ============================================
//     // Сохраняем способ оплаты в notes
//     // ============================================
//     await prisma.appointment.update({
//       where: { id: draftId },
//       data: {
//         notes: newNotes,
//       },
//     });

//     // ============================================
//     // Логирование с БЕЗОПАСНОЙ проверкой service
//     // service может быть null, используем optional chaining
//     // ============================================
//     const serviceName = service?.name || 'неизвестная услуга';  // ← ИСПРАВЛЕНО: name вместо title
//     console.log(
//       `[Payment] Запись ${draftId}: выбран способ оплаты ${paymentMethod} для услуги "${serviceName}"`
//     );

//     // ============================================
//     // Обработка в зависимости от способа оплаты
//     // ============================================
//     switch (paymentMethod) {
//       case 'card': {
//         // TODO: Интеграция со Stripe/Yookassa
//         // Пример:
//         // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//         // const session = await stripe.checkout.sessions.create({
//         //   payment_method_types: ['card'],
//         //   line_items: [{
//         //     price_data: {
//         //       currency: 'eur',
//         //       product_data: { name: serviceName },  // ← используем serviceName
//         //       unit_amount: service?.priceCents || 0,
//         //     },
//         //     quantity: 1,
//         //   }],
//         //   mode: 'payment',
//         //   success_url: `${process.env.NEXT_PUBLIC_URL}/booking/confirmation?id=${draftId}`,
//         //   cancel_url: `${process.env.NEXT_PUBLIC_URL}/booking/payment?draft=${draftId}`,
//         // });
//         // return NextResponse.json({ paymentUrl: session.url });

//         // Пока заглушка
//         console.log('[Payment] TODO: Интеграция со Stripe');
//         return NextResponse.json({
//           ok: true,
//           message: 'Переход к оплате картой',
//           // paymentUrl: 'https://stripe.com/...',
//         });
//       }

//       case 'paypal': {
//         // TODO: Интеграция с PayPal
//         console.log('[Payment] TODO: Интеграция с PayPal');
//         return NextResponse.json({
//           ok: true,
//           message: 'Переход к оплате через PayPal',
//           // paymentUrl: 'https://paypal.com/...',
//         });
//       }

//       case 'cash': {
//         // Наличные - оплата в салоне
//         return NextResponse.json({
//           ok: true,
//           message: 'Оплата наличными в салоне',
//         });
//       }

//       default:
//         return NextResponse.json(
//           { error: 'Неизвестный способ оплаты' },
//           { status: 400 }
//         );
//     }
//   } catch (error) {
//     console.error('[Payment Error]:', error);
//     return NextResponse.json(
//       { error: 'Ошибка обработки оплаты' },
//       { status: 500 }
//     );
//   }
// }