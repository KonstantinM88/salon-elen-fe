// src/lib/ai/ai-content.ts
//
// DB-backed AI content with in-memory cache.
// knowledge.ts remains the fallback when no DB record exists.

import { prisma } from '@/lib/prisma';
import { PERMANENT_HALLE, localeToLang, type Lang } from './knowledge';

// ─── Cache ──────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000;

interface CBlock {
  key: string; title: string; contentDe: string; contentRu: string; contentEn: string;
  context: string; triggerIntent: string | null; priority: number;
  enabled: boolean; serviceSlug: string | null; version: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __aiContentCache: { map: Map<string, CBlock>; at: number } | undefined;
}

function cached(): Map<string, CBlock> | null {
  const c = global.__aiContentCache;
  if (c && Date.now() - c.at < CACHE_TTL_MS) return c.map;
  return null;
}

async function loadAll(): Promise<Map<string, CBlock>> {
  const hit = cached();
  if (hit) return hit;

  try {
    const rows = await prisma.aiContentBlock.findMany({
      where: { enabled: true, publishedAt: { not: null } },
      orderBy: { priority: 'desc' },
    });
    const map = new Map<string, CBlock>();
    for (const r of rows) map.set(r.key, r as CBlock);
    global.__aiContentCache = { map, at: Date.now() };
    return map;
  } catch (err) {
    console.error('[AI Content] load error:', err);
    return global.__aiContentCache?.map || new Map();
  }
}

export function invalidateContentCache(): void {
  global.__aiContentCache = undefined;
}

// ─── Public Getters ─────────────────────────────────────────

function pickLang(b: CBlock, locale: string): string {
  const l = localeToLang(locale);
  return l === 'RU' ? b.contentRu : l === 'EN' ? b.contentEn : b.contentDe;
}

/** Get content by key. Returns null if not in DB (caller falls back to knowledge.ts). */
export async function getContent(key: string, locale: string): Promise<string | null> {
  const blocks = await loadAll();
  const b = blocks.get(key);
  return b ? pickLang(b, locale) : null;
}

/** Get content by triggerIntent. */
export async function getContentByIntent(intent: string, locale: string): Promise<string | null> {
  const blocks = await loadAll();
  for (const b of blocks.values()) {
    if (b.triggerIntent === intent) return pickLang(b, locale);
  }
  return null;
}

/** Get all blocks for a context. */
export async function getContentsByContext(
  context: string, locale: string,
): Promise<Array<{ key: string; title: string; content: string }>> {
  const blocks = await loadAll();
  const out: Array<{ key: string; title: string; content: string }> = [];
  for (const b of blocks.values()) {
    if (b.context === context) out.push({ key: b.key, title: b.title, content: pickLang(b, locale) });
  }
  return out;
}

// ─── Service Config ─────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __aiSvcCache: { map: Map<string, SvcConf>; at: number } | undefined;
}

interface SvcConf {
  serviceId: string;
  showInConsultation: boolean;
  showInAssistantMenu: boolean;
  showInBooking: boolean;
  aiOrder: number;
  aiTags: string | null;
  aiDescriptionDe: string | null;
  aiDescriptionRu: string | null;
  aiDescriptionEn: string | null;
  idealForDe: string | null;
  idealForRu: string | null;
  idealForEn: string | null;
}

async function loadSvcConfigs(): Promise<Map<string, SvcConf>> {
  const c = global.__aiSvcCache;
  if (c && Date.now() - c.at < CACHE_TTL_MS) return c.map;

  try {
    const rows = await prisma.aiServiceConfig.findMany();
    const map = new Map<string, SvcConf>();
    for (const r of rows) map.set(r.serviceId, r as SvcConf);
    global.__aiSvcCache = { map, at: Date.now() };
    return map;
  } catch {
    return global.__aiSvcCache?.map || new Map();
  }
}

export async function isServiceVisibleInAi(
  serviceId: string, ctx: 'consultation' | 'menu' | 'booking',
): Promise<boolean> {
  const configs = await loadSvcConfigs();
  const c = configs.get(serviceId);
  if (!c) return true;
  return ctx === 'consultation' ? c.showInConsultation : ctx === 'menu' ? c.showInAssistantMenu : c.showInBooking;
}

export async function getServiceIdealFor(serviceId: string, locale: string): Promise<string | null> {
  const configs = await loadSvcConfigs();
  const c = configs.get(serviceId);
  if (!c) return null;
  const l = localeToLang(locale);
  return l === 'RU' ? c.idealForRu : l === 'EN' ? c.idealForEn : c.idealForDe;
}

// ─── Admin CRUD ─────────────────────────────────────────────

export async function listBlocks() {
  return prisma.aiContentBlock.findMany({
    orderBy: [{ context: 'asc' }, { priority: 'desc' }, { key: 'asc' }],
  });
}

export async function createBlock(data: {
  key: string; title: string; contentDe: string; contentRu: string; contentEn: string;
  context: string; triggerIntent?: string; priority?: number; serviceSlug?: string;
  enabled?: boolean; publish?: boolean;
}) {
  invalidateContentCache();
  return prisma.aiContentBlock.create({
    data: {
      key: data.key, title: data.title,
      contentDe: data.contentDe, contentRu: data.contentRu, contentEn: data.contentEn,
      context: data.context, triggerIntent: data.triggerIntent || null,
      priority: data.priority ?? 0, serviceSlug: data.serviceSlug || null,
      enabled: data.enabled ?? true,
      publishedAt: data.publish ? new Date() : null,
    },
  });
}

export async function updateBlock(id: string, data: Record<string, unknown>) {
  invalidateContentCache();
  const { publish, ...rest } = data;
  return prisma.aiContentBlock.update({
    where: { id },
    data: {
      ...rest,
      ...(publish ? { publishedAt: new Date() } : {}),
      version: { increment: 1 },
    },
  });
}

export async function deleteBlock(id: string) {
  invalidateContentCache();
  return prisma.aiContentBlock.delete({ where: { id } });
}

export async function toggleBlock(id: string, enabled: boolean) {
  invalidateContentCache();
  return prisma.aiContentBlock.update({ where: { id }, data: { enabled } });
}

export async function publishBlock(id: string) {
  invalidateContentCache();
  return prisma.aiContentBlock.update({
    where: { id },
    data: { publishedAt: new Date(), version: { increment: 1 } },
  });
}

export async function listSvcConfigs() {
  return prisma.aiServiceConfig.findMany({ orderBy: { aiOrder: 'asc' } });
}

export async function upsertSvcConfig(serviceId: string, data: Partial<SvcConf>) {
  global.__aiSvcCache = undefined;
  return prisma.aiServiceConfig.upsert({
    where: { serviceId },
    create: { serviceId, ...data } as any,
    update: data,
  });
}

// ─── Seed ───────────────────────────────────────────────────

const KB = PERMANENT_HALLE;

/** Seed initial content blocks from knowledge.ts. Idempotent. */
export async function seedFromKnowledge(): Promise<number> {
  const seeds: Array<Parameters<typeof createBlock>[0] & { key: string }> = [
    { key: 'objection_unnatural', title: 'Objection: Unnatural look',
      contentDe: KB.pmu.objections.DE.unnatural, contentRu: KB.pmu.objections.RU.unnatural, contentEn: KB.pmu.objections.EN.unnatural,
      context: 'objection', triggerIntent: 'objection_unnatural', priority: 10, publish: true },
    { key: 'objection_pain', title: 'Objection: Pain',
      contentDe: KB.pmu.objections.DE.pain, contentRu: KB.pmu.objections.RU.pain, contentEn: KB.pmu.objections.EN.pain,
      context: 'objection', triggerIntent: 'objection_pain', priority: 9, publish: true },
    { key: 'objection_price', title: 'Objection: Too expensive',
      contentDe: KB.pmu.objections.DE.expensive, contentRu: KB.pmu.objections.RU.expensive, contentEn: KB.pmu.objections.EN.expensive,
      context: 'objection', triggerIntent: 'objection_price', priority: 8, publish: true },
    { key: 'objection_healing', title: 'Objection: Long healing',
      contentDe: KB.pmu.objections.DE.healing_long, contentRu: KB.pmu.objections.RU.healing_long, contentEn: KB.pmu.objections.EN.healing_long,
      context: 'objection', triggerIntent: 'objection_healing', priority: 7, publish: true },
    { key: 'pmu_faq_what_is', title: 'FAQ: What is PMU?',
      contentDe: KB.pmu.faq.DE.what_is, contentRu: KB.pmu.faq.RU.what_is, contentEn: KB.pmu.faq.EN.what_is,
      context: 'faq', triggerIntent: 'pmu_what_is', priority: 10, publish: true },
    { key: 'pmu_faq_duration', title: 'FAQ: How long does PMU last?',
      contentDe: KB.pmu.faq.DE.duration, contentRu: KB.pmu.faq.RU.duration, contentEn: KB.pmu.faq.EN.duration,
      context: 'faq', triggerIntent: 'pmu_duration', priority: 9, publish: true },
    { key: 'pmu_healing_rules', title: 'PMU Healing rules',
      contentDe: KB.pmu.healing_1_30.DE.rules.join('\n'), contentRu: KB.pmu.healing_1_30.RU.rules.join('\n'), contentEn: KB.pmu.healing_1_30.EN.rules.join('\n'),
      context: 'aftercare', triggerIntent: 'pmu_healing', priority: 10, publish: true },
    { key: 'hydrafacial_faq_how', title: 'Hydrafacial: How it works',
      contentDe: KB.hydrafacial.faq.DE.how_it_works, contentRu: KB.hydrafacial.faq.RU.how_it_works, contentEn: KB.hydrafacial.faq.EN.how_it_works,
      context: 'faq', triggerIntent: 'hydrafacial_how', priority: 8, publish: true },
    { key: 'hydrafacial_faq_skin', title: 'Hydrafacial: Skin types',
      contentDe: KB.hydrafacial.faq.DE.skin_types, contentRu: KB.hydrafacial.faq.RU.skin_types, contentEn: KB.hydrafacial.faq.EN.skin_types,
      context: 'faq', triggerIntent: 'hydrafacial_skin_types', priority: 7, publish: true },
    { key: 'occasion_wedding', title: 'Occasion: Wedding',
      contentDe: KB.occasions.wedding.DE.tip, contentRu: KB.occasions.wedding.RU.tip, contentEn: KB.occasions.wedding.EN.tip,
      context: 'occasion', triggerIntent: 'occasion_wedding', priority: 10, publish: true },
    { key: 'occasion_vacation', title: 'Occasion: Vacation',
      contentDe: KB.occasions.vacation.DE.tip, contentRu: KB.occasions.vacation.RU.tip, contentEn: KB.occasions.vacation.EN.tip,
      context: 'occasion', triggerIntent: 'occasion_vacation', priority: 9, publish: true },
  ];

  let created = 0;
  for (const s of seeds) {
    const exists = await prisma.aiContentBlock.findUnique({ where: { key: s.key } });
    if (!exists) { await createBlock(s); created++; }
  }
  console.log(`[AI Content] Seeded ${created}/${seeds.length} blocks`);
  return created;
}
