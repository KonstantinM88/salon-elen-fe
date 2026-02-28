// src/lib/ai/tools/list-services.ts

import { prisma } from '@/lib/prisma';

interface Args {
  locale: string;
  query?: string;
}

interface RawServiceRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string | null;
  translations: Array<{
    name: string;
    description: string | null;
  }>;
}

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string | null;
  groupId: string;
  groupTitle: string;
  searchText: string;
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function scoreMatch(itemText: string, queryNorm: string, queryTokens: string[]): number {
  let score = 0;

  if (itemText.includes(queryNorm)) {
    score += 100;
  }

  for (const token of queryTokens) {
    if (itemText.includes(token)) {
      score += 12;
      continue;
    }

    const stem = token.slice(0, Math.max(3, token.length - 1));
    if (stem.length >= 3 && itemText.includes(stem)) {
      score += 6;
    }
  }

  return score;
}

function getLocalizedName(row: RawServiceRow): string {
  return row.translations[0]?.name || row.name;
}

function getLocalizedDescription(row: RawServiceRow): string | null {
  return row.translations[0]?.description ?? row.description ?? null;
}

function findRootServiceId(
  serviceId: string,
  byId: Map<string, RawServiceRow>,
): string {
  const visited = new Set<string>();
  let current = byId.get(serviceId);

  while (current?.parentId && byId.has(current.parentId) && !visited.has(current.parentId)) {
    visited.add(current.id);
    const parent = byId.get(current.parentId);
    if (!parent) break;
    current = parent;
  }

  return current?.id ?? serviceId;
}

export async function listServices(args: Args) {
  const locale = args.locale || 'de';
  const query = args.query?.trim() || null;
  const normalizedQuery = query ? normalizeText(query) : null;
  const queryTokens = normalizedQuery ? tokenize(normalizedQuery) : [];

  const all = await prisma.service.findMany({
    where: { isActive: true, isArchived: false },
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
    orderBy: [{ name: 'asc' }],
  });

  const byId = new Map<string, RawServiceRow>(
    all.map((row) => [row.id, row as RawServiceRow]),
  );

  const rootTitles = new Map<string, string>();
  for (const row of all) {
    const rootId = findRootServiceId(row.id, byId);
    if (!rootTitles.has(rootId)) {
      const root = byId.get(rootId) ?? row;
      rootTitles.set(rootId, getLocalizedName(root));
    }
  }

  const bookable: ServiceItem[] = all
    .filter((row) => row.durationMin > 0)
    .map((row) => {
      const rootId = findRootServiceId(row.id, byId);
      const groupTitle = rootTitles.get(rootId) || 'Other services';
      const title = getLocalizedName(row);
      const description = getLocalizedDescription(row);
      const searchText = normalizeText(
        [
          title,
          row.slug,
          description ?? '',
          groupTitle,
        ].join(' '),
      );

      return {
        id: row.id,
        slug: row.slug,
        title,
        description,
        durationMin: row.durationMin,
        priceCents: row.priceCents ?? null,
        parentId: row.parentId,
        groupId: rootId,
        groupTitle,
        searchText,
      };
    });

  const filtered = normalizedQuery
    ? bookable
        .map((item) => ({
          item,
          score: scoreMatch(item.searchText, normalizedQuery, queryTokens),
        }))
        .filter((x) => x.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.item.title.localeCompare(b.item.title, locale);
        })
        .map((x) => x.item)
    : bookable;

  const groupsMap = new Map<
    string,
    {
      id: string;
      title: string;
      services: Array<{
        id: string;
        slug: string;
        title: string;
        description: string | null;
        durationMin: number;
        priceCents: number | null;
      }>;
    }
  >();

  for (const item of filtered) {
    if (!groupsMap.has(item.groupId)) {
      groupsMap.set(item.groupId, {
        id: item.groupId,
        title: item.groupTitle,
        services: [],
      });
    }

    groupsMap.get(item.groupId)?.services.push({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      durationMin: item.durationMin,
      priceCents: item.priceCents,
    });
  }

  const groups = Array.from(groupsMap.values())
    .map((group) => ({
      ...group,
      services: group.services.sort((a, b) =>
        a.title.localeCompare(b.title, locale),
      ),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, locale));

  const noMatches = Boolean(normalizedQuery) && filtered.length === 0;
  const suggestedAlternatives = noMatches
    ? bookable.slice(0, 8).map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        durationMin: item.durationMin,
        priceCents: item.priceCents,
        groupTitle: item.groupTitle,
      }))
    : [];

  console.log(
    `[AI list_services] locale=${locale} query="${query ?? ''}" total=${bookable.length} matched=${filtered.length} noMatches=${noMatches}`,
  );

  return {
    groups,
    query,
    totalServices: bookable.length,
    matchedServices: filtered.length,
    noMatches,
    suggestedAlternatives,
  };
}
