import { Temporal } from "@js-temporal/polyfill";
import { prisma } from "@/lib/prisma";
import { ORG_TZ, orgDayRange } from "@/lib/orgTime";
import {
  isPromotionPercent,
  type PromotionPercent,
} from "@/lib/promotion-constants";

export interface ActivePromotionRecord {
  id: string;
  title: string;
  percent: number;
  from: Date;
  to: Date;
  isGlobal: boolean;
  serviceIds: string[];
}

export interface ActiveServicePromotion {
  id: string;
  title: string;
  percent: PromotionPercent;
  from: Date;
  to: Date;
  isGlobal: boolean;
}

export type PromotionAnnouncement = ActiveServicePromotion;

export type SerializedPromotionAnnouncement = Omit<
  PromotionAnnouncement,
  "from" | "to"
> & {
  from: string;
  to: string;
};

export interface ServicePromotionPricing {
  serviceId: string;
  originalPriceCents: number | null;
  finalPriceCents: number | null;
  promotion: ActiveServicePromotion | null;
}

export function calculatePromotionalPriceCents(
  originalPriceCents: number,
  percent: number,
): number {
  if (!Number.isInteger(originalPriceCents) || originalPriceCents < 0) {
    throw new Error("Original price must be a non-negative integer");
  }
  if (!isPromotionPercent(percent)) {
    throw new Error("Unsupported promotion percentage");
  }

  return Math.round((originalPriceCents * (100 - percent)) / 100);
}

export function buildPromotionDateRange(
  fromDateISO: string,
  toDateISO: string,
): { from: Date; to: Date } {
  const fromRange = orgDayRange(fromDateISO);
  const toRange = orgDayRange(toDateISO);

  if (fromRange.start >= toRange.end) {
    throw new Error("Promotion start must not be after its end");
  }

  return {
    from: fromRange.start,
    to: new Date(toRange.end.getTime() - 1),
  };
}

export function formatPromotionOrgDate(date: Date): string {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime())
    .toZonedDateTimeISO(ORG_TZ)
    .toPlainDate()
    .toString();
}

export function selectBestPromotionForService(
  serviceId: string,
  promotions: readonly ActivePromotionRecord[],
): ActiveServicePromotion | null {
  const applicable = promotions
    .filter(
      (promotion) =>
        isPromotionPercent(promotion.percent) &&
        (promotion.isGlobal || promotion.serviceIds.includes(serviceId)),
    )
    .sort(
      (left, right) =>
        right.percent - left.percent ||
        left.to.getTime() - right.to.getTime() ||
        left.id.localeCompare(right.id),
    );
  const selected = applicable[0];

  if (!selected || !isPromotionPercent(selected.percent)) return null;

  return {
    id: selected.id,
    title: selected.title,
    percent: selected.percent,
    from: selected.from,
    to: selected.to,
    isGlobal: selected.isGlobal,
  };
}

/**
 * Selects the promotion shown in public catalogs.
 *
 * Promotion creation acts as publication: a non-expired promotion is visible
 * before its start date. A currently active promotion has priority; otherwise
 * the nearest upcoming promotion is shown. Financial calculations must keep
 * using getActivePromotionsForServices() for the appointment date.
 */
export function selectPublishedPromotionForService(
  serviceId: string,
  promotions: readonly ActivePromotionRecord[],
  at: Date = new Date(),
): ActiveServicePromotion | null {
  const visible = promotions.filter(
    (promotion) =>
      promotion.to >= at &&
      isPromotionPercent(promotion.percent) &&
      (promotion.isGlobal || promotion.serviceIds.includes(serviceId)),
  );
  const active = visible.filter((promotion) => promotion.from <= at);
  const activeSelection = selectBestPromotionForService(serviceId, active);
  if (activeSelection) return activeSelection;

  const upcoming = visible.filter((promotion) => promotion.from > at);
  if (upcoming.length === 0) return null;

  const nearestStart = Math.min(
    ...upcoming.map((promotion) => promotion.from.getTime()),
  );

  return selectBestPromotionForService(
    serviceId,
    upcoming.filter(
      (promotion) => promotion.from.getTime() === nearestStart,
    ),
  );
}

export async function getActivePromotionsForServices(
  serviceIds: readonly string[],
  at: Date = new Date(),
): Promise<Map<string, ActiveServicePromotion>> {
  const uniqueServiceIds = Array.from(new Set(serviceIds.filter(Boolean)));
  if (uniqueServiceIds.length === 0) return new Map();

  const rows = await prisma.promotion.findMany({
    where: {
      from: { lte: at },
      to: { gte: at },
      OR: [
        { isGlobal: true },
        { items: { some: { serviceId: { in: uniqueServiceIds } } } },
      ],
    },
    select: {
      id: true,
      title: true,
      percent: true,
      from: true,
      to: true,
      isGlobal: true,
      items: {
        where: { serviceId: { in: uniqueServiceIds } },
        select: { serviceId: true },
      },
    },
    orderBy: [{ percent: "desc" }, { to: "asc" }, { createdAt: "desc" }],
  });

  const promotions: ActivePromotionRecord[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    percent: row.percent,
    from: row.from,
    to: row.to,
    isGlobal: row.isGlobal,
    serviceIds: row.items.map((item) => item.serviceId),
  }));
  const result = new Map<string, ActiveServicePromotion>();

  for (const serviceId of uniqueServiceIds) {
    const promotion = selectBestPromotionForService(serviceId, promotions);
    if (promotion) result.set(serviceId, promotion);
  }

  return result;
}

export async function getPublishedPromotionsForServices(
  serviceIds: readonly string[],
  at: Date = new Date(),
): Promise<Map<string, ActiveServicePromotion>> {
  const uniqueServiceIds = Array.from(new Set(serviceIds.filter(Boolean)));
  if (uniqueServiceIds.length === 0) return new Map();

  const rows = await prisma.promotion.findMany({
    where: {
      to: { gte: at },
      OR: [
        { isGlobal: true },
        { items: { some: { serviceId: { in: uniqueServiceIds } } } },
      ],
    },
    select: {
      id: true,
      title: true,
      percent: true,
      from: true,
      to: true,
      isGlobal: true,
      items: {
        where: { serviceId: { in: uniqueServiceIds } },
        select: { serviceId: true },
      },
    },
    orderBy: [
      { from: "asc" },
      { percent: "desc" },
      { to: "asc" },
      { createdAt: "desc" },
    ],
  });

  const promotions: ActivePromotionRecord[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    percent: row.percent,
    from: row.from,
    to: row.to,
    isGlobal: row.isGlobal,
    serviceIds: row.items.map((item) => item.serviceId),
  }));
  const result = new Map<string, ActiveServicePromotion>();

  for (const serviceId of uniqueServiceIds) {
    const promotion = selectPublishedPromotionForService(
      serviceId,
      promotions,
      at,
    );
    if (promotion) result.set(serviceId, promotion);
  }

  return result;
}

export function distinctPromotionAnnouncements(
  promotions: Iterable<ActiveServicePromotion>,
): PromotionAnnouncement[] {
  const byId = new Map<string, PromotionAnnouncement>();

  for (const promotion of promotions) {
    byId.set(promotion.id, promotion);
  }

  return Array.from(byId.values()).sort(
    (left, right) =>
      right.percent - left.percent ||
      left.to.getTime() - right.to.getTime() ||
      left.id.localeCompare(right.id),
  );
}

export function serializePromotionAnnouncements(
  promotions: readonly PromotionAnnouncement[],
): SerializedPromotionAnnouncement[] {
  return promotions.map((promotion) => ({
    ...promotion,
    from: promotion.from.toISOString(),
    to: promotion.to.toISOString(),
  }));
}

export async function getActivePromotionAnnouncements(
  at: Date = new Date(),
): Promise<PromotionAnnouncement[]> {
  const rows = await prisma.promotion.findMany({
    where: {
      from: { lte: at },
      to: { gte: at },
      OR: [
        { isGlobal: true },
        {
          items: {
            some: {
              service: {
                isActive: true,
                isArchived: false,
                parentId: { not: null },
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      percent: true,
      from: true,
      to: true,
      isGlobal: true,
    },
    orderBy: [{ percent: "desc" }, { to: "asc" }, { createdAt: "desc" }],
  });

  return rows.flatMap((row) =>
    isPromotionPercent(row.percent)
      ? [
          {
            id: row.id,
            title: row.title,
            percent: row.percent,
            from: row.from,
            to: row.to,
            isGlobal: row.isGlobal,
          },
        ]
      : [],
  );
}

export async function getPublishedPromotionAnnouncements(
  at: Date = new Date(),
): Promise<PromotionAnnouncement[]> {
  const rows = await prisma.promotion.findMany({
    where: {
      to: { gte: at },
      OR: [
        { isGlobal: true },
        {
          items: {
            some: {
              service: {
                isActive: true,
                isArchived: false,
                parentId: { not: null },
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      percent: true,
      from: true,
      to: true,
      isGlobal: true,
    },
    orderBy: [
      { from: "asc" },
      { percent: "desc" },
      { to: "asc" },
      { createdAt: "desc" },
    ],
  });

  return rows.flatMap((row) =>
    isPromotionPercent(row.percent)
      ? [
          {
            id: row.id,
            title: row.title,
            percent: row.percent,
            from: row.from,
            to: row.to,
            isGlobal: row.isGlobal,
          },
        ]
      : [],
  );
}

export async function getServicePromotionPricing(
  serviceId: string,
  at: Date = new Date(),
): Promise<ServicePromotionPricing | null> {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      isActive: true,
      isArchived: false,
      parentId: { not: null },
    },
    select: { id: true, priceCents: true },
  });
  if (!service) return null;

  const promotion = (await getActivePromotionsForServices([service.id], at)).get(
    service.id,
  ) ?? null;
  const finalPriceCents =
    service.priceCents != null && promotion
      ? calculatePromotionalPriceCents(service.priceCents, promotion.percent)
      : service.priceCents;

  return {
    serviceId: service.id,
    originalPriceCents: service.priceCents,
    finalPriceCents,
    promotion,
  };
}

export function promotionPricingSnapshot(pricing: ServicePromotionPricing) {
  return {
    originalPriceCents: pricing.originalPriceCents,
    finalPriceCents: pricing.finalPriceCents,
    promotionTitle: pricing.promotion?.title ?? null,
    promotionPercent: pricing.promotion?.percent ?? null,
  };
}

export async function getAppointmentPayableCents(
  appointmentId: string,
): Promise<number | null> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      finalPriceCents: true,
      service: { select: { priceCents: true } },
    },
  });
  if (!appointment) return null;
  return appointment.finalPriceCents ?? appointment.service.priceCents;
}
