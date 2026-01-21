// src/app/api/appointments/[id]/route.ts
// ✅ ИСПРАВЛЕНО с учетом реальной Prisma схемы

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  id: string;
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<Params> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: 'ID not provided' }, { status: 400 });
    }

    // ✅ Получаем appointment с данными service и master (оба через include)
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,        // ✅ В схеме это name (мапится на title в БД)
            durationMin: true,
            priceCents: true,  // ✅ В схеме это priceCents, не price
          },
        },
        master: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // ✅ ВЫЧИСЛЯЕМ РЕАЛЬНУЮ СУММУ (в центах для Stripe)
    // Если priceCents null или undefined → fallback на 5000 (50€)
    const totalPrice = appt.service.priceCents ?? 5000;
    const totalPriceEur = (totalPrice / 100).toFixed(2);

    // Форматируем ответ для удобства использования
    const response = {
      id: appt.id,
      serviceTitle: appt.service.name,  // ✅ name из Prisma
      masterName: appt.master?.name || 'Не указан',
      startAt: appt.startAt.toISOString(),
      endAt: appt.endAt.toISOString(),
      duration: appt.service.durationMin,
      customerName: appt.customerName,
      email: appt.email,
      phone: appt.phone,
      notes: appt.notes,
      birthDate: appt.birthDate?.toISOString() || null,
      referral: appt.referral,
      status: appt.status,
      paymentStatus: appt.paymentStatus, // ✅ Добавлено из схемы
      createdAt: appt.createdAt.toISOString(),
      
      // ID для других целей
      serviceId: appt.serviceId,
      masterId: appt.masterId,
      clientId: appt.clientId,
      
      // ✅ ДОБАВЛЕНО: Данные для оплаты
      totalPrice: totalPrice,        // В центах (например: 7500 = 75€)
      totalPriceEur: totalPriceEur, // Для отображения (например: "75.00")
      
      // ✅ ДОБАВЛЕНО: Детальная информация об услуге
      serviceDetails: {
        id: appt.service.id,
        name: appt.service.name,
        price: appt.service.priceCents ?? 0, // ✅ priceCents
        priceEur: ((appt.service.priceCents ?? 0) / 100).toFixed(2),
        duration: appt.service.durationMin,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
