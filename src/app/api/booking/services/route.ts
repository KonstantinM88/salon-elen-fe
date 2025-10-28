import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type ServiceDto = {
  id: string;
  title: string;                 // из Service.name
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string;
};

type GroupDto = {
  id: string;
  title: string;                 // из Service.name
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

// Страница /booking/services должна рендериться компонентом, поэтому GET запрещаем здесь.
export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

export async function POST() {
  try {
    // Родительские услуги (группы)
    const parents = await prisma.service.findMany({
      where: { isActive: true, isArchived: false, parentId: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },        // ВАЖНО: поле name, не title
    });

    // Дочерние услуги для этих групп
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
      },
      orderBy: { name: 'asc' },
    });

    const groups: GroupDto[] = parents.map(p => ({
      id: p.id,
      title: p.name,  // маппим name -> title для фронта
      services: children
        .filter(c => c.parentId === p.id)
        .map<ServiceDto>(c => ({
          id: c.id,
          title: c.name, // маппим name -> title
          description: c.description ?? null,
          durationMin: c.durationMin,
          priceCents: c.priceCents ?? null,
          parentId: c.parentId!,
        })),
    }));

    // Активные акции
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
