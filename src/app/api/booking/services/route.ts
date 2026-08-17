// src/app/api/booking/services/route.ts
// ✅ С поддержкой переводов (i18n)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  calculatePromotionalPriceCents,
  formatPromotionOrgDate,
  getPublishedPromotionsForServices,
} from '@/lib/promotions';

type ServicePromotionDto = {
  id: string;
  title: string;
  percent: number;
  from: string;
  to: string;
  discountedPriceCents: number;
};

type ServiceDto = {
  id: string;
  title: string;
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string;
  promotion: ServicePromotionDto | null;
};

type GroupDto = {
  id: string;
  title: string;
  services: ServiceDto[];
};

type PromotionDto = {
  id: string;
  title: string;
  percent: number;
  isGlobal: boolean;
};

type Payload = {
  groups: GroupDto[];
  promotions: PromotionDto[];
};

export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function POST(request: NextRequest) {
  try {
    // Получаем locale из тела запроса или заголовка
    let locale = 'de'; // дефолт - немецкий
    try {
      const body = await request.json();
      if (body?.locale && ['de', 'ru', 'en'].includes(body.locale)) {
        locale = body.locale;
      }
    } catch {
      // Если тело пустое или не JSON, используем заголовок
      const headerLocale = request.headers.get('x-locale') || request.headers.get('accept-language')?.split(',')[0]?.split('-')[0];
      if (headerLocale && ['de', 'ru', 'en'].includes(headerLocale)) {
        locale = headerLocale;
      }
    }

    // Родительские услуги (категории)
    const parents = await prisma.service.findMany({
      where: { isActive: true, isArchived: false, parentId: null },
      select: { 
        id: true, 
        name: true,
        translations: {
          where: { locale },
          select: { name: true, description: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    // Дочерние услуги
    const parentIds = parents.map(p => p.id);
    const children = await prisma.service.findMany({
      where: {
        isActive: true,
        isArchived: false,
        parentId: { in: parentIds },
      },
      select: {
        id: true,
        name: true,
        description: true,
        durationMin: true,
        priceCents: true,
        parentId: true,
        translations: {
          where: { locale },
          select: { name: true, description: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    const promotionMap = await getPublishedPromotionsForServices(
      children.map((service) => service.id),
    );

    // Формируем ответ с учетом переводов
    const groups: GroupDto[] = parents.map(p => {
      // Используем перевод если есть, иначе базовое название
      const parentTranslation = p.translations[0];
      const parentTitle = parentTranslation?.name || p.name;

      return {
        id: p.id,
        title: parentTitle,
        services: children
          .filter(c => c.parentId === p.id)
          .map(c => {
            const childTranslation = c.translations[0];
            const promotion = promotionMap.get(c.id) ?? null;
            return {
              id: c.id,
              title: childTranslation?.name || c.name,
              description: childTranslation?.description ?? c.description ?? null,
              durationMin: c.durationMin,
              priceCents: c.priceCents ?? null,
              parentId: c.parentId!,
              promotion:
                promotion && c.priceCents != null
                  ? {
                      id: promotion.id,
                      title: promotion.title,
                      percent: promotion.percent,
                      from: formatPromotionOrgDate(promotion.from),
                      to: formatPromotionOrgDate(promotion.to),
                      discountedPriceCents: calculatePromotionalPriceCents(
                        c.priceCents,
                        promotion.percent,
                      ),
                    }
                  : null,
            };
          }),
      };
    });

    const promotionById = new Map<string, PromotionDto>();
    for (const promotion of promotionMap.values()) {
      promotionById.set(promotion.id, {
        id: promotion.id,
        title: promotion.title,
        percent: promotion.percent,
        isGlobal: promotion.isGlobal,
      });
    }

    const payload: Payload = {
      groups,
      promotions: Array.from(promotionById.values()),
    };
    return NextResponse.json(payload);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
