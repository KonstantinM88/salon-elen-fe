// src/lib/booking/bookable-services.ts
// Normalize service IDs to active, non-archived, bookable services only.

import { prisma } from '@/lib/prisma';

export interface NormalizedBookableServiceIds {
  inputIds: string[];
  bookableIds: string[];
  ignoredIds: string[];
}

export async function normalizeBookableServiceIds(
  serviceIds: string[] | null | undefined,
): Promise<NormalizedBookableServiceIds> {
  const inputIds = Array.from(
    new Set(
      (serviceIds ?? [])
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id)),
    ),
  );

  if (inputIds.length === 0) {
    return { inputIds: [], bookableIds: [], ignoredIds: [] };
  }

  const rows = await prisma.service.findMany({
    where: {
      id: { in: inputIds },
      isActive: true,
      isArchived: false,
      durationMin: { gt: 0 },
    },
    select: { id: true },
  });

  const bookableSet = new Set(rows.map((r) => r.id));
  const bookableIds = inputIds.filter((id) => bookableSet.has(id));
  const ignoredIds = inputIds.filter((id) => !bookableSet.has(id));

  return {
    inputIds,
    bookableIds,
    ignoredIds,
  };
}
