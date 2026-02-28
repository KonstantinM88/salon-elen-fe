// src/lib/ai/tools/list-masters.ts

import { prisma } from '@/lib/prisma';
import { normalizeBookableServiceIds } from '@/lib/booking/bookable-services';

interface Args {
  serviceIds: string[];
}

export async function listMastersForServices(args: Args) {
  const normalized = await normalizeBookableServiceIds(args.serviceIds);
  const serviceIds = normalized.bookableIds;

  if (serviceIds.length === 0) {
    if (normalized.inputIds.length > 0) {
      // The user picked something non-bookable (often a category).
      // Do not auto-return all masters, otherwise AI may skip specific service selection.
      return {
        masters: [],
        defaultMasterId: null,
        matchedServiceIds: [],
        ignoredServiceIds: normalized.ignoredIds,
        requiresSpecificService: true,
        error: 'NO_BOOKABLE_SERVICE_SELECTED',
      };
    }

    // Return all masters
    const all = await prisma.master.findMany({
      select: { id: true, name: true, avatarUrl: true, bio: true },
      orderBy: { name: 'asc' },
    });
    return {
      masters: all,
      defaultMasterId: all[0]?.id ?? null,
      matchedServiceIds: [],
      ignoredServiceIds: normalized.ignoredIds,
      requiresSpecificService: normalized.inputIds.length > 0,
    };
  }

  // Master must cover ALL selected services
  const andClauses = serviceIds.map((id) => ({
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
    matchedServiceIds: serviceIds,
    ignoredServiceIds: normalized.ignoredIds,
  };
}
