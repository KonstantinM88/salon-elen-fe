"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminAction } from "@/lib/rbac";
import type { ActionResult } from "@/lib/types/booking";
import { isSeoLocale, type SeoLocale } from "@/lib/seo-locale";
import {
  buildPromotionDateRange,
  formatPromotionOrgDate,
} from "@/lib/promotions";
import { isPromotionPercent } from "@/lib/promotion-constants";
import { isYmd } from "@/lib/orgTime";
import { HOME_PROMOTION_ANNOUNCEMENTS_TAG } from "@/lib/cache-tags";

export interface PromotionAdminRow {
  id: string;
  title: string;
  percent: number;
  from: string;
  to: string;
  isGlobal: boolean;
  serviceIds: string[];
}

export interface PromotionServiceGroup {
  id: string;
  title: string;
  services: Array<{
    id: string;
    title: string;
    priceCents: number | null;
  }>;
}

type PromotionsActionCopy = {
  fillAllFields: string;
  invalidPercent: string;
  invalidDate: string;
  invalidRange: string;
  chooseServicesOrGlobal: string;
  unavailableServices: string;
  notFound: string;
  saveFailed: string;
  deleteFailed: string;
};

const PROMOTIONS_ACTION_COPY: Record<SeoLocale, PromotionsActionCopy> = {
  de: {
    fillAllFields: "Bitte Titel und Zeitraum vollstaendig ausfuellen.",
    invalidPercent: "Bitte einen Rabatt von 5, 10, 15, 20, 25 oder 30 % waehlen.",
    invalidDate: "Bitte gueltige Kalenderdaten waehlen.",
    invalidRange: "Das Enddatum darf nicht vor dem Startdatum liegen.",
    chooseServicesOrGlobal: "Bitte Leistungen auswaehlen oder 'alle Leistungen' aktivieren.",
    unavailableServices: "Mindestens eine ausgewaehlte Leistung ist nicht mehr verfuegbar.",
    notFound: "Aktion wurde nicht gefunden.",
    saveFailed: "Aktion konnte nicht gespeichert werden.",
    deleteFailed: "Aktion konnte nicht geloescht werden.",
  },
  ru: {
    fillAllFields: "Укажите название и полный период акции.",
    invalidPercent: "Выберите скидку 5, 10, 15, 20, 25 или 30 %.",
    invalidDate: "Выберите корректные даты в календаре.",
    invalidRange: "Дата окончания не может быть раньше даты начала.",
    chooseServicesOrGlobal: "Выберите услуги или включите «Все услуги».",
    unavailableServices: "Одна или несколько выбранных услуг больше недоступны.",
    notFound: "Акция не найдена.",
    saveFailed: "Не удалось сохранить акцию.",
    deleteFailed: "Не удалось удалить акцию.",
  },
  en: {
    fillAllFields: "Enter a title and complete promotion period.",
    invalidPercent: "Choose a 5, 10, 15, 20, 25 or 30% discount.",
    invalidDate: "Choose valid calendar dates.",
    invalidRange: "The end date cannot be before the start date.",
    chooseServicesOrGlobal: "Select services or enable 'all services'.",
    unavailableServices: "One or more selected services are no longer available.",
    notFound: "Promotion was not found.",
    saveFailed: "Promotion could not be saved.",
    deleteFailed: "Promotion could not be deleted.",
  },
};

function actionCopy(locale: SeoLocale): PromotionsActionCopy {
  return PROMOTIONS_ACTION_COPY[isSeoLocale(locale) ? locale : "de"];
}

export async function listPromotions(): Promise<
  ActionResult<PromotionAdminRow[]>
> {
  await assertAdminAction();
  const rows = await prisma.promotion.findMany({
    orderBy: [{ to: "desc" }, { percent: "desc" }, { createdAt: "desc" }],
    include: { items: { select: { serviceId: true } } },
  });

  return {
    ok: true,
    data: rows.map((promotion) => ({
      id: promotion.id,
      title: promotion.title,
      percent: promotion.percent,
      from: formatPromotionOrgDate(promotion.from),
      to: formatPromotionOrgDate(promotion.to),
      isGlobal: promotion.isGlobal,
      serviceIds: promotion.items.map((item) => item.serviceId),
    })),
  };
}

export async function listPromotionServices(
  locale: SeoLocale = "de",
): Promise<ActionResult<PromotionServiceGroup[]>> {
  await assertAdminAction();
  const selectedLocale = isSeoLocale(locale) ? locale : "de";
  const categories = await prisma.service.findMany({
    where: { parentId: null, isActive: true, isArchived: false },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      translations: {
        where: { locale: selectedLocale },
        select: { name: true },
        take: 1,
      },
      children: {
        where: { isActive: true, isArchived: false },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          priceCents: true,
          translations: {
            where: { locale: selectedLocale },
            select: { name: true },
            take: 1,
          },
        },
      },
    },
  });

  return {
    ok: true,
    data: categories
      .filter((category) => category.children.length > 0)
      .map((category) => ({
        id: category.id,
        title: category.translations[0]?.name || category.name,
        services: category.children.map((service) => ({
          id: service.id,
          title: service.translations[0]?.name || service.name,
          priceCents: service.priceCents,
        })),
      })),
  };
}

export async function createPromotion(
  input: {
    title: string;
    percent: number;
    from: string;
    to: string;
    isGlobal: boolean;
    serviceIds: string[];
  },
  locale: SeoLocale = "de",
): Promise<ActionResult> {
  await assertAdminAction();
  const t = actionCopy(locale);
  const title = input.title.trim().slice(0, 100);
  const serviceIds = Array.from(new Set(input.serviceIds.filter(Boolean)));

  if (!title || !input.from || !input.to) {
    return { ok: false, error: t.fillAllFields };
  }
  if (!isPromotionPercent(input.percent)) {
    return { ok: false, error: t.invalidPercent };
  }
  if (!isYmd(input.from) || !isYmd(input.to)) {
    return { ok: false, error: t.invalidDate };
  }
  if (input.from > input.to) {
    return { ok: false, error: t.invalidRange };
  }
  if (!input.isGlobal && serviceIds.length === 0) {
    return { ok: false, error: t.chooseServicesOrGlobal };
  }

  try {
    if (!input.isGlobal) {
      const availableCount = await prisma.service.count({
        where: {
          id: { in: serviceIds },
          parentId: { not: null },
          isActive: true,
          isArchived: false,
        },
      });
      if (availableCount !== serviceIds.length) {
        return { ok: false, error: t.unavailableServices };
      }
    }

    const range = buildPromotionDateRange(input.from, input.to);
    await prisma.promotion.create({
      data: {
        title,
        percent: input.percent,
        from: range.from,
        to: range.to,
        isGlobal: input.isGlobal,
        items: input.isGlobal
          ? undefined
          : {
              createMany: {
                data: serviceIds.map((serviceId) => ({ serviceId })),
              },
            },
      },
    });

    revalidatePath("/admin/promotions");
    revalidatePath("/booking/services");
    updateTag(HOME_PROMOTION_ANNOUNCEMENTS_TAG);
    revalidatePath("/");
    revalidatePath("/prices");
    revalidatePath("/services");
    return { ok: true };
  } catch (error) {
    console.error("[Promotions] Create failed", error);
    return { ok: false, error: t.saveFailed };
  }
}

export async function deletePromotion(
  id: string,
  locale: SeoLocale = "de",
): Promise<ActionResult> {
  await assertAdminAction();
  const t = actionCopy(locale);

  try {
    const result = await prisma.promotion.deleteMany({ where: { id } });
    if (result.count === 0) return { ok: false, error: t.notFound };

    revalidatePath("/admin/promotions");
    revalidatePath("/booking/services");
    updateTag(HOME_PROMOTION_ANNOUNCEMENTS_TAG);
    revalidatePath("/");
    revalidatePath("/prices");
    revalidatePath("/services");
    return { ok: true };
  } catch (error) {
    console.error("[Promotions] Delete failed", error);
    return { ok: false, error: t.deleteFailed };
  }
}
