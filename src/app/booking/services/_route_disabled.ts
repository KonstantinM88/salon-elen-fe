import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Ответ фронту
type ServiceDTO = {
  id: string;
  title: string;
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string | null;
};

type GroupDTO = {
  id: string;
  title: string;
  services: ServiceDTO[];
};

type PromotionDTO = {
  id: string;
  title: string;
  percent: number;
  isGlobal: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Payload = {};

function toServiceDTO(s: {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string | null;
}): ServiceDTO {
  return {
    id: s.id,
    title: s.name,
    description: s.description,
    durationMin: s.durationMin,
    priceCents: s.priceCents,
    parentId: s.parentId,
  };
}

export async function POST(req: Request) {
  try {
    // тело сейчас не используется, но парсим для совместимости
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _payload = (await req.json().catch(() => ({}))) as Payload;

    // Родительские услуги (группы)
    const parents = await prisma.service.findMany({
      where: {
        isActive: true,
        isArchived: false,
        parentId: null,
      },
      select: {
        id: true,
        name: true,           // поле в Prisma, в БД мапится на "title"
      },
      orderBy: { name: 'asc' },
    });

    const parentIds = parents.map(p => p.id);

    // Дочерние услуги в выбранных группах
    const children = parentIds.length
      ? await prisma.service.findMany({
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
          },
          orderBy: { name: 'asc' },
        })
      : [];

    // Группировка
    const groups: GroupDTO[] = parents.map(p => ({
      id: p.id,
      title: p.name,
      services: children
        .filter(c => c.parentId === p.id)
        .map(toServiceDTO),
    }));

    // Действующие промо
    const now = new Date();
    const promos = await prisma.promotion.findMany({
      where: {
        from: { lte: now },
        to: { gte: now },
      },
      select: {
        id: true,
        title: true,
        percent: true,
        isGlobal: true,
      },
      orderBy: [
        { isGlobal: 'desc' },    // сначала глобальные
        { percent: 'desc' },     // затем по размеру скидки
      ],
    });

    const promotions: PromotionDTO[] = promos.map(p => ({
      id: p.id,
      title: p.title,
      percent: p.percent,
      isGlobal: p.isGlobal,
    }));

    return NextResponse.json({ groups, promotions });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// На всякий случай разрешим и GET для локальной отладки
export async function GET(req: Request) {
  return POST(req);
}
