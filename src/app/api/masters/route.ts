// src/app/api/masters/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type MasterDto = { 
  id: string; 
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;          // ✅ ДОБАВИЛ bio (описание)
};

type Payload = { masters: MasterDto[]; defaultMasterId: string | null };

/**
 * Возвращает мастеров, которые способны выполнить весь набор услуг.
 * Поддерживает параметры:
 *  - serviceIds: CSV или повторяющиеся query (?serviceIds=ID&serviceIds=ID2)
 *  - serviceSlug: альтернативно, один slug услуги (совместимость)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // Сбор serviceIds из разных вариантов запроса
    const fromCsv = (url.searchParams.get('serviceIds') || '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const repeated = url.searchParams.getAll('serviceIds')
      .flatMap(s => s.split(',').map(x => x.trim()))
      .filter(s => s.length > 0);

    const serviceSlug = url.searchParams.get('serviceSlug')?.trim() || '';

    let serviceIds: string[] = Array.from(new Set([...fromCsv, ...repeated]));

    // Совместимость: один slug услуги
    if (serviceIds.length === 0 && serviceSlug) {
      const bySlug = await prisma.service.findUnique({
        where: { slug: serviceSlug },
        select: { id: true },
      });
      if (bySlug?.id) serviceIds = [bySlug.id];
    }

    // Если услуги не переданы — вернуть всех мастеров
    if (serviceIds.length === 0) {
      const all = await prisma.master.findMany({
        select: { 
          id: true, 
          name: true,
          avatarUrl: true,
          bio: true,              // ✅ ДОБАВИЛ bio
        },
        orderBy: { name: 'asc' },
      });
      const payload: Payload = {
        masters: all,
        defaultMasterId: all[0]?.id ?? null,
      };
      return NextResponse.json(payload);
    }

    // Валидация услуг: берем только активные, неархивные
    const activeServices = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true, isArchived: false },
      select: { id: true },
    });
    const activeIdsSet = new Set(activeServices.map(s => s.id));
    const normalizedServiceIds = serviceIds.filter(id => activeIdsSet.has(id));

    if (normalizedServiceIds.length === 0) {
      const payload: Payload = { masters: [], defaultMasterId: null };
      return NextResponse.json(payload);
    }

    // Требование "мастер покрывает все услуги"
    const andClauses = normalizedServiceIds.map(id => ({
      services: { some: { id } },
    }));

    const masters = await prisma.master.findMany({
      where: {
        AND: andClauses,
      },
      select: { 
        id: true, 
        name: true,
        avatarUrl: true,
        bio: true,              // ✅ ДОБАВИЛ bio
      },
      orderBy: { name: 'asc' },
    });

    const payload: Payload = {
      masters,
      defaultMasterId: masters[0]?.id ?? null,
    };
    return NextResponse.json(payload);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}