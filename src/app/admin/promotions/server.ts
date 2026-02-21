// src/app/admin/promotions/server.ts
"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/booking";
import { isSeoLocale, type SeoLocale } from "@/lib/seo-locale";

type PromotionsActionCopy = {
  fillAllFields: string;
  chooseServicesOrGlobal: string;
};

const PROMOTIONS_ACTION_COPY: Record<SeoLocale, PromotionsActionCopy> = {
  de: {
    fillAllFields: "Bitte alle Felder ausfuellen",
    chooseServicesOrGlobal: "Bitte Services auswaehlen oder die Option 'fuer alle Services' aktivieren",
  },
  ru: {
    fillAllFields: "Заполните все поля",
    chooseServicesOrGlobal: "Выберите услуги или включите «на все услуги»",
  },
  en: {
    fillAllFields: "Please fill in all fields",
    chooseServicesOrGlobal: "Choose services or enable the 'all services' option",
  },
};

export async function listPromotions(): Promise<ActionResult<Array<{
  id: string; title: string; percent: number; from: string; to: string; isGlobal: boolean; serviceIds: string[];
}>>> {
  const rows = await prisma.promotion.findMany({
    orderBy: [{ isGlobal: "desc" }, { percent: "desc" }, { from: "desc" }],
    include: { items: { select: { serviceId: true } } },
  });
  const data = rows.map((p) => ({
    id: p.id,
    title: p.title,
    percent: p.percent,
    from: p.from.toISOString().slice(0, 10),
    to: p.to.toISOString().slice(0, 10),
    isGlobal: p.isGlobal,
    serviceIds: p.items.map((i) => i.serviceId),
  }));
  return { ok: true, data };
}

export async function createPromotion(p: {
  title: string; percent: number; from: string; to: string; isGlobal: boolean; serviceIds: string[];
}, locale: SeoLocale = "de"): Promise<ActionResult> {
  const currentLocale = isSeoLocale(locale) ? locale : "de";
  const t = PROMOTIONS_ACTION_COPY[currentLocale];
  const { title, percent, from, to, isGlobal, serviceIds } = p;
  if (!title.trim() || !percent || !from || !to) return { ok: false, error: t.fillAllFields };
  if (!isGlobal && serviceIds.length === 0) return { ok: false, error: t.chooseServicesOrGlobal };

  await prisma.promotion.create({
    data: {
      title,
      percent,
      from: new Date(`${from}T00:00:00.000Z`),
      to: new Date(`${to}T23:59:59.999Z`),
      isGlobal,
      items: isGlobal ? undefined : { createMany: { data: serviceIds.map((sid) => ({ serviceId: sid })) } },
    },
  });

  return { ok: true };
}

export async function deletePromotion(id: string): Promise<ActionResult> {
  await prisma.promotion.delete({ where: { id } });
  return { ok: true };
}
