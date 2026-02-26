// src/lib/ai/tools/list-services.ts

import { prisma } from '@/lib/prisma';

interface Args {
  locale: string;
  query?: string;
}

export async function listServices(args: Args) {
  const locale = args.locale || 'de';

  const parents = await prisma.service.findMany({
    where: { isActive: true, isArchived: false, parentId: null },
    select: {
      id: true,
      name: true,
      translations: {
        where: { locale },
        select: { name: true, description: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const parentIds = parents.map((p) => p.id);

  const children = await prisma.service.findMany({
    where: {
      isActive: true,
      isArchived: false,
      parentId: { in: parentIds },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      durationMin: true,
      priceCents: true,
      parentId: true,
      translations: {
        where: { locale },
        select: { name: true, description: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  const groups = parents.map((p) => {
    const t = p.translations[0];
    return {
      id: p.id,
      title: t?.name || p.name,
      services: children
        .filter((c) => c.parentId === p.id)
        .map((c) => {
          const ct = c.translations[0];
          return {
            id: c.id,
            slug: c.slug,
            title: ct?.name || c.name,
            description: ct?.description ?? c.description ?? null,
            durationMin: c.durationMin,
            priceCents: c.priceCents ?? null,
          };
        }),
    };
  });

  // Apply query filter if provided
  if (args.query) {
    const q = args.query.toLowerCase();
    const filtered = groups
      .map((g) => ({
        ...g,
        services: g.services.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.slug.toLowerCase().includes(q) ||
            (s.description && s.description.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.services.length > 0);
    return { groups: filtered };
  }

  return { groups };
}
