// src/app/api/booking/services/route.ts
// ✅ С поддержкой переводов (i18n)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ServiceDto = {
  id: string;
  title: string;
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string;
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
            return {
              id: c.id,
              title: childTranslation?.name || c.name,
              description: childTranslation?.description ?? c.description ?? null,
              durationMin: c.durationMin,
              priceCents: c.priceCents ?? null,
              parentId: c.parentId!,
            };
          }),
      };
    });

    const now = new Date();
    const promos = await prisma.promotion.findMany({
      where: { from: { lte: now }, to: { gte: now } },
      select: { id: true, title: true, percent: true, isGlobal: true },
      orderBy: [{ isGlobal: 'desc' }, { percent: 'desc' }],
    });

    const payload: Payload = { groups, promotions: promos };
    return NextResponse.json(payload);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}





//--------работало добавляем сервис переводов-------
// // src/app/api/booking/services/route.ts
// // ✅ БЕЗ any типов

// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// type ServiceDto = {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// };

// type GroupDto = {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// };

// type PromotionDto = {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// };

// type Payload = {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// };

// export function GET() {
//   return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
// }

// export async function POST() {
//   try {
//     const parents = await prisma.service.findMany({
//       where: { isActive: true, isArchived: false, parentId: null },
//       select: { id: true, name: true },
//       orderBy: { name: 'asc' },
//     });

//     const parentIds = parents.map(p => p.id);
//     const children = await prisma.service.findMany({
//       where: {
//         isActive: true,
//         isArchived: false,
//         parentId: { in: parentIds },
//       },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         durationMin: true,
//         priceCents: true,
//         parentId: true,
//       },
//       orderBy: { name: 'asc' },
//     });

//     const groups: GroupDto[] = parents.map(p => ({
//       id: p.id,
//       title: p.name,
//       services: children
//         .filter(c => c.parentId === p.id)
//         .map(c => ({
//           id: c.id,
//           title: c.name,
//           description: c.description ?? null,
//           durationMin: c.durationMin,
//           priceCents: c.priceCents ?? null,
//           parentId: c.parentId!,
//         })),
//     }));

//     const now = new Date();
//     const promos = await prisma.promotion.findMany({
//       where: { from: { lte: now }, to: { gte: now } },
//       select: { id: true, title: true, percent: true, isGlobal: true },
//       orderBy: [{ isGlobal: 'desc' }, { percent: 'desc' }],
//     });

//     const payload: Payload = { groups, promotions: promos };
//     return NextResponse.json(payload);
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: 'internal_error' }, { status: 500 });
//   }
// }



//---------работало добоаляем резервацияю слота---------
// // src/app/api/booking/services/route.ts
// // ✅ Получение списка услуг и групп услуг для страницы /booking/services 
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// type ServiceDto = {
//   id: string;
//   title: string;                 // из Service.name
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// };

// type GroupDto = {
//   id: string;
//   title: string;                 // из Service.name
//   services: ServiceDto[];
// };

// type PromotionDto = {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// };

// type Payload = {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// };

// // Страница /booking/services должна рендериться компонентом, поэтому GET запрещаем здесь.
// export function GET() {
//   return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
// }

// export async function POST() {
//   try {
//     // Родительские услуги (группы)
//     const parents = await prisma.service.findMany({
//       where: { isActive: true, isArchived: false, parentId: null },
//       select: { id: true, name: true },
//       orderBy: { name: 'asc' },        // ВАЖНО: поле name, не title
//     });

//     // Дочерние услуги для этих групп
//     const parentIds = parents.map(p => p.id);
//     const children = await prisma.service.findMany({
//       where: {
//         isActive: true,
//         isArchived: false,
//         parentId: { in: parentIds },
//       },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         durationMin: true,
//         priceCents: true,
//         parentId: true,
//       },
//       orderBy: { name: 'asc' },
//     });

//     const groups: GroupDto[] = parents.map(p => ({
//       id: p.id,
//       title: p.name,  // маппим name -> title для фронта
//       services: children
//         .filter(c => c.parentId === p.id)
//         .map<ServiceDto>(c => ({
//           id: c.id,
//           title: c.name, // маппим name -> title
//           description: c.description ?? null,
//           durationMin: c.durationMin,
//           priceCents: c.priceCents ?? null,
//           parentId: c.parentId!,
//         })),
//     }));

//     // Активные акции
//     const now = new Date();
//     const promos = await prisma.promotion.findMany({
//       where: { from: { lte: now }, to: { gte: now } },
//       select: { id: true, title: true, percent: true, isGlobal: true },
//       orderBy: [{ isGlobal: 'desc' }, { percent: 'desc' }],
//     });

//     const payload: Payload = { groups, promotions: promos };
//     return NextResponse.json(payload);
//   } catch (e) {
//     console.error(e);
//     return NextResponse.json({ error: 'internal_error' }, { status: 500 });
//   }
// }
