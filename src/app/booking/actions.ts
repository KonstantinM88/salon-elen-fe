// src/app/booking/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { wallMinutesToUtc } from "@/lib/orgTime";
import { addMinutes as addMin, isBefore } from "date-fns";

import type {
  ActionResult,
  AvailabilityDTO,
  MasterDTO,
  PromotionBanner,
  ServicesFlat,
  ServiceDTO,
  MoneyCents,
} from "@/lib/types/booking";

const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";
const STEP_MIN = Number(process.env.NEXT_PUBLIC_SLOT_STEP_MIN ?? 10);

const toCents = (n: number): MoneyCents => n as MoneyCents;
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function weekdayOf(dateISO: string): Weekday {
  const d = new Date(`${dateISO}T00:00:00.000Z`);
  return d.getUTCDay() as Weekday;
}

/** ====== УСЛУГИ + АКТИВНЫЕ АКЦИИ ====== */
export async function getServicesFlat(): Promise<ActionResult<ServicesFlat>> {
  // 1) Категории и подуслуги
  const categoriesRaw = await prisma.service.findMany({
    where: { isActive: true, isArchived: false, parentId: null },
    select: {
      id: true,
      name: true,
      children: {
        where: { isActive: true, isArchived: false },
        select: {
          id: true,
          name: true,
          description: true,
          durationMin: true,
          priceCents: true,
          parentId: true,
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const categories = categoriesRaw.map((cat) => ({
    id: cat.id,
    name: cat.name,
    children: cat.children.map<ServiceDTO>((s) => ({
      id: s.id,
      title: s.name,
      excerpt: s.description ?? null,
      durationMin: s.durationMin,
      priceCents: toCents(s.priceCents ?? 0),
      categoryId: cat.id,
      categoryName: cat.name,
      isPromo: false, // переопределим ниже по акциям
    })),
  }));

  const allServices = categories.flatMap((c) => c.children);

  // 2) Активные акции на текущий момент
  const now = new Date();
  const promos = await prisma.promotion.findMany({
    where: { from: { lte: now }, to: { gte: now } },
    include: { items: { select: { serviceId: true } } },
    orderBy: [{ isGlobal: "desc" }, { percent: "desc" }],
  });

  const activeGlobalPercent =
    promos.filter((p) => p.isGlobal).reduce((mx, p) => Math.max(mx, p.percent), 0) || undefined;

  const servicePercentMap = new Map<string, number>();
  for (const p of promos.filter((x) => !x.isGlobal)) {
    for (const it of p.items) {
      const prev = servicePercentMap.get(it.serviceId) ?? 0;
      if (p.percent > prev) servicePercentMap.set(it.serviceId, p.percent);
    }
  }
  const servicePercents =
    servicePercentMap.size > 0 ? (Array.from(servicePercentMap.entries()) as ReadonlyArray<[string, number]>) : undefined;

  const promoServiceIds = new Set<string>(servicePercentMap.keys());
  const promotions = allServices
    .filter((s) => promoServiceIds.has(s.id))
    .map((s) => ({ ...s, isPromo: true }));

  for (const c of categories) {
    c.children = c.children.map((s) => (promoServiceIds.has(s.id) ? { ...s, isPromo: true } : s));
  }

  return {
    ok: true,
    data: {
      promotions,
      categories,
      allServices,
      activeGlobalPercent,
      servicePercents,
    },
  };
}

/** Баннер глобальной акции */
export async function getActivePromotionBanner(): Promise<ActionResult<PromotionBanner>> {
  const now = new Date();
  const p = await prisma.promotion.findFirst({
    where: { isGlobal: true, from: { lte: now }, to: { gte: now } },
    orderBy: { percent: "desc" },
  });
  if (!p) return { ok: true, data: null };
  return {
    ok: true,
    data: {
      percent: p.percent,
      from: p.from.toISOString().slice(0, 10),
      to: p.to.toISOString().slice(0, 10),
    },
  };
}

/** ====== МАСТЕРА ====== */
export async function getMastersFor(serviceIds: string[]): Promise<ActionResult<{ masters: MasterDTO[] }>> {
  if (serviceIds.length === 0) return { ok: false, error: "Нет выбранных услуг" };

  const andClauses = serviceIds.map((sid) => ({ services: { some: { id: sid } } }));
  const raw = await prisma.master.findMany({
    where: { AND: andClauses },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const masters: MasterDTO[] = raw.map((m) => ({
    id: m.id,
    name: m.name,
    canDoAll: true,
    nextFreeDate: null,
  }));

  return { ok: true, data: { masters } };
}

/** ====== КАЛЕНДАРЬ / СЛОТЫ ====== */
async function buildDaySlotsByDb(masterId: string, dateISO: string, durationMin: number): Promise<string[]> {
  const wd = weekdayOf(dateISO);
  const wh = await prisma.masterWorkingHours.findUnique({
    where: { masterId_weekday: { masterId, weekday: wd } },
    select: { isClosed: true, startMinutes: true, endMinutes: true },
  });
  if (!wh || wh.isClosed) return [];

  // wallMinutesToUtc теперь принимает 2 аргумента
  const dayStartUtc = wallMinutesToUtc(dateISO, wh.startMinutes);
  const dayEndUtc = wallMinutesToUtc(dateISO, wh.endMinutes);
  if (!isBefore(dayStartUtc, dayEndUtc)) return [];

  const timeOff = await prisma.masterTimeOff.findMany({
    where: { masterId, date: wallMinutesToUtc(dateISO, 0) },
    select: { startMinutes: true, endMinutes: true },
  });

  const blocksFromTimeOff = timeOff.map(({ startMinutes, endMinutes }) => ({
    start: wallMinutesToUtc(dateISO, startMinutes),
    end: wallMinutesToUtc(dateISO, endMinutes),
  }));

  const appts = await prisma.appointment.findMany({
    where: {
      masterId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lt: dayEndUtc },
      endAt: { gt: dayStartUtc },
    },
    select: { startAt: true, endAt: true },
    orderBy: { startAt: "asc" },
  });

  const blocks = [
    ...blocksFromTimeOff,
    ...appts.map(({ startAt, endAt }) => ({ start: startAt, end: endAt })),
  ].filter(({ start, end }) => isBefore(start, end));

  type Win = { start: Date; end: Date };
  const merged: Win[] = [];
  const sorted = blocks.sort((a, b) => a.start.getTime() - b.start.getTime());
  for (const b of sorted) {
    if (!merged.length) {
      merged.push({ ...b });
      continue;
    }
    const last = merged[merged.length - 1];
    if (b.start <= last.end) {
      if (b.end > last.end) last.end = b.end;
    } else {
      merged.push({ ...b });
    }
  }

  const free: Win[] = [];
  let cursor = dayStartUtc;
  for (const blk of merged) {
    if (isBefore(cursor, blk.start)) free.push({ start: cursor, end: blk.start });
    cursor = blk.end < dayEndUtc ? blk.end : dayEndUtc;
    if (cursor >= dayEndUtc) break;
  }
  if (isBefore(cursor, dayEndUtc)) free.push({ start: cursor, end: dayEndUtc });

  const out: string[] = [];
  for (const w of free) {
    let start = new Date(w.start);
    while (true) {
      const end = addMin(start, durationMin);
      if (end > w.end) break;
      out.push(start.toISOString());
      start = addMin(start, STEP_MIN);
      if (start >= w.end) break;
    }
  }
  return out;
}

export async function getAvailability(masterId: string, durationMin: number): Promise<ActionResult<AvailabilityDTO>> {
  if (!masterId) return { ok: false, error: "Нет мастера" };
  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    return { ok: false, error: "Некорректная длительность" };
  }

  const today = new Date();
  const until = new Date(today);
  until.setDate(until.getDate() + 7 * 8);

  for (let d = new Date(today); d <= until; d.setDate(d.getDate() + 1)) {
    const dateISO = d.toISOString().slice(0, 10);
    const slots = await buildDaySlotsByDb(masterId, dateISO, durationMin);
    if (slots.length > 0) {
      return { ok: true, data: { firstDateISO: dateISO, slots } };
    }
  }
  return { ok: true, data: { firstDateISO: today.toISOString().slice(0, 10), slots: [] } };
}

/** ====== CHECKOUT (создаём PENDING) ====== */
export async function checkout(payload: {
  masterId: string;
  serviceIds: string[];
  startAt: string; // ISO UTC
  client: { name: string; email: string; phone: string };
}): Promise<ActionResult<{ draftId: string; verify: "email" }>> {
  const { masterId, serviceIds, startAt, client } = payload;

  if (!masterId || serviceIds.length === 0 || !startAt) {
    return { ok: false, error: "Заполните услуги, мастера и время" };
  }
  if (!client.name.trim() || !client.email.trim()) {
    return { ok: false, error: "Имя и email обязательны" };
  }

  const start = new Date(startAt);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { durationMin: true },
  });
  const totalMin = services.reduce((a, s) => a + s.durationMin, 0);
  const end = addMin(start, totalMin);

  const overlap = await prisma.appointment.findFirst({
    where: {
      masterId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lt: end },
      endAt: { gt: start },
    },
    select: { id: true },
  });
  if (overlap) return { ok: false, error: "Выбранное время уже занято. Выберите другой слот." };

  const appt = await prisma.appointment.create({
    data: {
      serviceId: serviceIds[0],
      masterId,
      startAt: start,
      endAt: end,
      status: "PENDING",
      customerName: client.name,
      phone: client.phone,
      email: client.email,
    },
    select: { id: true },
  });

  return { ok: true, data: { draftId: appt.id, verify: "email" } };
}

/** ====== ОПЛАТА ====== */
export async function pay(input: { method: "cash" | "card" | "paypal"; draftId: string }): Promise<ActionResult> {
  if (!input.draftId) return { ok: false, error: "Не указан черновик" };

  if (input.method === "cash") {
    await prisma.appointment.update({
      where: { id: input.draftId },
      data: { status: "CONFIRMED" },
    });
    return { ok: true };
  }
  return { ok: false, error: "Онлайн-оплата будет подключена позже" };
}