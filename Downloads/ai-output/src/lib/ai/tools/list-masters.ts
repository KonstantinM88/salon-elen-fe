// src/lib/ai/tools/list-masters.ts

import { prisma } from '@/lib/prisma';

interface Args {
  serviceIds: string[];
}

export async function listMastersForServices(args: Args) {
  const { serviceIds } = args;

  if (!serviceIds || serviceIds.length === 0) {
    // Return all masters
    const all = await prisma.master.findMany({
      select: { id: true, name: true, avatarUrl: true, bio: true },
      orderBy: { name: 'asc' },
    });
    return { masters: all, defaultMasterId: all[0]?.id ?? null };
  }

  // Validate services exist and are active
  const active = await prisma.service.findMany({
    where: { id: { in: serviceIds }, isActive: true, isArchived: false },
    select: { id: true },
  });
  const activeIds = active.map((s) => s.id);

  if (activeIds.length === 0) {
    return { masters: [], defaultMasterId: null };
  }

  // Master must cover ALL selected services
  const andClauses = activeIds.map((id) => ({
    services: { some: { id } },
  }));

  const masters = await prisma.master.findMany({
    where: { AND: andClauses },
    select: { id: true, name: true, avatarUrl: true, bio: true },
    orderBy: { name: 'asc' },
  });

  return {
    masters,
    defaultMasterId: masters[0]?.id ?? null,
  };
}
