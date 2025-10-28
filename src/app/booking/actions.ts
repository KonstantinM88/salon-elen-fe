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




//--------------работало добавляем услуги
// // src/app/booking/actions.ts
// "use server";

// import { prisma } from "@/lib/prisma";
// import { wallMinutesToUtc } from "@/lib/orgTime";
// import {
//   addMinutes as addMin,
//   isBefore,
// } from "date-fns";

// import type {
//   ActionResult,
//   AvailabilityDTO,
//   MasterDTO,
//   PromotionBanner,
//   ServicesFlat,
//   ServiceDTO,
//   MoneyCents,
// } from "@/lib/types/booking";

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";
// const STEP_MIN = Number(process.env.NEXT_PUBLIC_SLOT_STEP_MIN ?? 10);

// // маленький helper для брендованных «копеек»
// const toCents = (n: number): MoneyCents => n as MoneyCents;

// type Weekday = 0|1|2|3|4|5|6; // 0=Sunday ... 6=Saturday

// function weekdayOf(dateISO: string): Weekday {
//   // dateISO это YYYY-MM-DD в локали салона; создадим дату в UTC и возьмём .getUTCDay()
//   // День недели от этого не зависит (это календарная дата)
//   const d = new Date(`${dateISO}T00:00:00.000Z`);
//   return d.getUTCDay() as Weekday;
// }

// /** Собираем каталог: категории = Service с parentId=null, подуслуги = children */
// export async function getServicesFlat(): Promise<ActionResult<ServicesFlat>> {
//   const categoriesRaw = await prisma.service.findMany({
//     where: { isActive: true, isArchived: false, parentId: null },
//     select: {
//       id: true,
//       name: true,
//       children: {
//         where: { isActive: true, isArchived: false },
//         select: {
//           id: true,
//           name: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           parentId: true,
//         },
//         orderBy: { name: "asc" },
//       },
//     },
//     orderBy: { name: "asc" },
//   });

//   const categories = categoriesRaw.map((cat) => ({
//     id: cat.id,
//     name: cat.name,
//     children: cat.children.map<ServiceDTO>((s) => ({
//       id: s.id,
//       title: s.name,
//       excerpt: s.description ?? null,
//       durationMin: s.durationMin,
//       priceCents: toCents(s.priceCents ?? 0),
//       categoryId: cat.id,
//       categoryName: cat.name,
//       isPromo: false,
//     })),
//   }));

//   const allServices = categories.flatMap((c) => c.children);

//   // Акции подключим миграциями ниже; пока отдаём пустые промо и проценты.
//   return {
//     ok: true,
//     data: {
//       promotions: [],
//       categories,
//       allServices,
//       activeGlobalPercent: undefined,
//       servicePercents: undefined,
//     },
//   };
// }

// /** Баннер глобальной акции — после миграций прочитаем Promotion(isGlobal=true) по текущей дате */
// export async function getActivePromotionBanner(): Promise<ActionResult<PromotionBanner>> {
//   const now = new Date();
//   // после миграции раскомментируешь:
//   // const p = await prisma.promotion.findFirst({
//   //   where: { isGlobal: true, from: { lte: now }, to: { gte: now } },
//   //   orderBy: { percent: "desc" },
//   // });
//   // if (!p) return { ok: true, data: null };
//   // return { ok: true, data: { percent: p.percent, from: p.from.toISOString().slice(0,10), to: p.to.toISOString().slice(0,10) } };
//   return { ok: true, data: null };
// }

// /** Мастера, умеющие ВСЕ выбранные услуги (пересечение) */
// export async function getMastersFor(serviceIds: string[]): Promise<ActionResult<{ masters: MasterDTO[] }>> {
//   if (serviceIds.length === 0) return { ok: false, error: "Нет выбранных услуг" };

//   // AND + some по m:n
//   const andClauses = serviceIds.map((sid) => ({ services: { some: { id: sid } } }));

//   const raw = await prisma.master.findMany({
//     where: { AND: andClauses },
//     select: { id: true, name: true },
//     orderBy: { name: "asc" },
//   });

//   const masters: MasterDTO[] = raw.map((m) => ({
//     id: m.id,
//     name: m.name,
//     canDoAll: true,
//     nextFreeDate: null, // можно дополнить поиском первого свободного дня
//   }));

//   return { ok: true, data: { masters } };
// }

// /** Слоты на день с учётом MasterWorkingHours, MasterTimeOff и Appointment(PENDING|CONFIRMED) */
// async function buildDaySlotsByDb(masterId: string, dateISO: string, durationMin: number): Promise<string[]> {
//   // 1) рабочие часы на день недели
//   const wd = weekdayOf(dateISO);
//   const wh = await prisma.masterWorkingHours.findUnique({
//     where: { masterId_weekday: { masterId, weekday: wd } },
//     select: { isClosed: true, startMinutes: true, endMinutes: true },
//   });
//   if (!wh || wh.isClosed) return [];

//   // границы рабочего окна в UTC
//   const dayStartUtc = wallMinutesToUtc(dateISO, wh.startMinutes, ORG_TZ);
//   const dayEndUtc   = wallMinutesToUtc(dateISO, wh.endMinutes, ORG_TZ);
//   if (!isBefore(dayStartUtc, dayEndUtc)) return [];

//   // 2) блокирующие интервалы: time off и апойтменты
//   const timeOff = await prisma.masterTimeOff.findMany({
//     where: {
//       masterId,
//       date: wallMinutesToUtc(dateISO, 0, ORG_TZ), // индекс по дате; берём полночь локального дня в UTC
//     },
//     select: { startMinutes: true, endMinutes: true },
//   });

//   // переводим timeOff в UTC интервалы дат
//   const blocksFromTimeOff = timeOff.map(({ startMinutes, endMinutes }) => ({
//     start: wallMinutesToUtc(dateISO, startMinutes, ORG_TZ),
//     end:   wallMinutesToUtc(dateISO, endMinutes, ORG_TZ),
//   }));

//   // апойтменты, перекрывающие этот день
//   const appts = await prisma.appointment.findMany({
//     where: {
//       masterId,
//       status: { in: ["PENDING", "CONFIRMED"] },
//       // (start < dayEnd) AND (end > dayStart) — есть пересечение с днём
//       startAt: { lt: dayEndUtc },
//       endAt:   { gt: dayStartUtc },
//     },
//     select: { startAt: true, endAt: true },
//     orderBy: { startAt: "asc" },
//   });

//   const blocks = [
//     ...blocksFromTimeOff,
//     ...appts.map(({ startAt, endAt }) => ({ start: startAt, end: endAt })),
//   ].filter(({ start, end }) => isBefore(start, end));

//   // 3) вычислим свободные окна = рабочее окно минус блоки
//   type Win = { start: Date; end: Date };
//   const merged: Win[] = [];
//   const sorted = blocks.sort((a, b) => a.start.getTime() - b.start.getTime());
//   for (const b of sorted) {
//     if (!merged.length) {
//       merged.push({ ...b });
//       continue;
//     }
//     const last = merged[merged.length - 1];
//     if (b.start <= last.end) {
//       if (b.end > last.end) last.end = b.end; // сливаем
//     } else {
//       merged.push({ ...b });
//     }
//   }

//   const free: Win[] = [];
//   let cursor = dayStartUtc;
//   for (const blk of merged) {
//     if (isBefore(cursor, blk.start)) free.push({ start: cursor, end: blk.start });
//     if (isBefore(blk.end, dayEndUtc)) {
//       cursor = blk.end;
//     } else {
//       cursor = dayEndUtc;
//       break;
//     }
//   }
//   if (isBefore(cursor, dayEndUtc)) free.push({ start: cursor, end: dayEndUtc });

//   // 4) разложим свободные окна на слоты с шагом STEP_MIN, вмещающие durationMin
//   const out: string[] = [];
//   for (const w of free) {
//     let start = new Date(w.start);
//     while (true) {
//       const end = addMin(start, durationMin);
//       if (end > w.end) break;
//       out.push(start.toISOString());
//       start = addMin(start, STEP_MIN);
//       if (start >= w.end) break;
//     }
//   }
//   return out;
// }

// /** Горизонт вперёд: 8 недель. Находим первый день с >=1 слотом и возвращаем его. */
// export async function getAvailability(masterId: string, durationMin: number): Promise<ActionResult<AvailabilityDTO>> {
//   if (!masterId) return { ok: false, error: "Нет мастера" };
//   if (!Number.isFinite(durationMin) || durationMin <= 0) {
//     return { ok: false, error: "Некорректная длительность" };
//   }

//   const today = new Date();
//   const until = new Date(today);
//   until.setDate(until.getDate() + 7 * 8);

//   for (let d = new Date(today); d <= until; d.setDate(d.getDate() + 1)) {
//     const dateISO = d.toISOString().slice(0, 10);
//     const slots = await buildDaySlotsByDb(masterId, dateISO, durationMin);
//     if (slots.length > 0) {
//       return { ok: true, data: { firstDateISO: dateISO, slots } };
//     }
//   }
//   return { ok: true, data: { firstDateISO: today.toISOString().slice(0, 10), slots: [] } };
// }

// /** Checkout (MVP) — верификация будет через API /api/booking/verify/email */
// export async function checkout(payload: {
//   masterId: string;
//   serviceIds: string[];
//   startAt: string; // ISO UTC
//   client: { name: string; email: string; phone: string };
// }): Promise<ActionResult<{ draftId: string; verify: "email" }>> {
//   const { masterId, serviceIds, startAt, client } = payload;

//   if (!masterId || serviceIds.length === 0 || !startAt) {
//     return { ok: false, error: "Заполните услуги, мастера и время" };
//   }
//   if (!client.name.trim() || !client.email.trim()) {
//     return { ok: false, error: "Имя и email обязательны" };
//   }

//   // Повторная серверная проверка слота
//   const start = new Date(startAt);
//   // суммарная длительность услуг
//   const services = await prisma.service.findMany({
//     where: { id: { in: serviceIds } },
//     select: { durationMin: true },
//   });
//   const totalMin = services.reduce((a, s) => a + s.durationMin, 0);
//   const end = addMin(start, totalMin);

//   // Проверим, что слот свободен (по мастеру)
//   const overlap = await prisma.appointment.findFirst({
//     where: {
//       masterId,
//       status: { in: ["PENDING", "CONFIRMED"] },
//       startAt: { lt: end },
//       endAt: { gt: start },
//     },
//     select: { id: true },
//   });
//   if (overlap) return { ok: false, error: "Выбранное время уже занято. Выберите другой слот." };

//   // Черновик — создадим PENDING appointment (без клиента или с временным)
//   const appt = await prisma.appointment.create({
//     data: {
//       serviceId: serviceIds[0], // бизнес-требование: одна запись — к одному мастеру; сохраним первую услугу
//       masterId,
//       startAt: start,
//       endAt: end,
//       status: "PENDING",
//       customerName: client.name,
//       phone: client.phone,
//       email: client.email,
//     },
//     select: { id: true },
//   });

//   return { ok: true, data: { draftId: appt.id, verify: "email" } };
// }

// /** Оплата: наличные — сразу CONFIRMED */
// export async function pay(input: { method: "cash" | "card" | "paypal"; draftId: string }): Promise<ActionResult> {
//   if (!input.draftId) return { ok: false, error: "Не указан черновик" };

//   if (input.method === "cash") {
//     await prisma.appointment.update({
//       where: { id: input.draftId },
//       data: { status: "CONFIRMED" },
//     });
//     return { ok: true };
//   }
//   return { ok: false, error: "Онлайн-оплата будет подключена позже" };
// }




//---------------черновик но без ошибок
// // src/app/booking/actions.ts
// "use server";

// import { prisma } from "@/lib/prisma";

// // Типы из нашей общей типизации визарда
// import type {
//   ActionResult,
//   AvailabilityDTO,
//   MasterDTO,
//   PromotionBanner,
//   ServicesFlat,
//   ServiceDTO,
//   MoneyCents,
// } from "@/lib/types/booking";

// // Если в твоём проекте есть готовый генератор слотов — импортируй его здесь.
// // Я предполагаю сигнатуру buildDaySlots(masterId, dateISO, durationMin) -> string[] (ISO начала слотов).
// // Если у тебя другое имя функции — просто поправь импорт.
// import { /* buildDaySlots */ } from "@/lib/availability";

// import { addWeeks } from "date-fns";

// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";

// /** Удобный помощник для брендованных «копеек» без any */
// const toCents = (n: number): MoneyCents => n as MoneyCents;

// /**
//  * Собираем каталог услуг с учётом твоей схемы:
//  * - Модель Service имеет поля: name (title), description, durationMin, priceCents?, parent/children
//  * - Категории — это верхнеуровневые Service с дочерними подуслугами (children)
//  * - Промо сейчас отсутствуют в схеме — вернём пустой массив (в дальнейшем подключим таблицы Promotion/PromotionItem)
//  */
// export async function getServicesFlat(): Promise<ActionResult<ServicesFlat>> {
//   // Берём ВСЕ активные сервисы (включая «категории» и «подуслуги»)
//   const services = await prisma.service.findMany({
//     where: { isActive: true, isArchived: false },
//     select: {
//       id: true,
//       name: true,
//       description: true,
//       durationMin: true,
//       priceCents: true,
//       parentId: true,
//       // children нужны, чтобы удобно построить дерево
//       children: {
//         where: { isActive: true, isArchived: false },
//         select: {
//           id: true,
//           name: true,
//           description: true,
//           durationMin: true,
//           priceCents: true,
//           parentId: true,
//         },
//         orderBy: { name: "asc" },
//       },
//     },
//     orderBy: [{ parentId: "asc" }, { name: "asc" }],
//   });

//   // Верхнеуровневые — категории (parentId == null)
//   const roots = services.filter((s) => s.parentId === null);

//   // Соберём DTO
//   const categories = roots.map((cat) => {
//     const children: ServiceDTO[] = (cat.children ?? []).map((child) => ({
//       id: child.id,
//       title: child.name,
//       excerpt: child.description ?? null,
//       durationMin: child.durationMin,
//       priceCents: toCents(child.priceCents ?? 0),
//       categoryId: cat.id,
//       categoryName: cat.name,
//       isPromo: false, // промо пока нет в схеме
//     }));

//     return {
//       id: cat.id,
//       name: cat.name,
//       children,
//     };
//   });

//   // Плоский список всех «листовых» подуслуг (для быстрого пересчёта суммы/минут)
//   const allServices: ServiceDTO[] = categories.flatMap((c) => c.children);

//   // Промоблок (пока пустой — подключим после миграций Promotion/PromotionItem)
//   const promotions: ServiceDTO[] = [];

//   const data: ServicesFlat = {
//     promotions,
//     categories,
//     allServices,
//     activeGlobalPercent: undefined,   // глобальной акции нет в схеме — вернём undefined
//     servicePercents: undefined,       // точечных процентов тоже пока нет
//   };

//   return { ok: true, data };
// }

// /**
//  * Глобальный баннер акции над списком услуг.
//  * В текущей схеме таблиц для акций нет — возвращаем null.
//  * (После добавления таблиц Promotion вернём { percent, from, to } по текущей дате.)
//  */
// export async function getActivePromotionBanner(): Promise<ActionResult<PromotionBanner>> {
//   return { ok: true, data: null };
// }

// /**
//  * Мастера, умеющие ВСЕ выбранные услуги.
//  * Корректно делаем пересечение через AND + some по m:n Master↔Service.
//  */
// export async function getMastersFor(serviceIds: string[]): Promise<ActionResult<{ masters: MasterDTO[] }>> {
//   if (serviceIds.length === 0) {
//     return { ok: false, error: "Нет выбранных услуг" };
//   }

//   // «мастер умеет все выбранные услуги»:
//   // AND: [ { services: { some: { id: s1 } } }, { services: { some: { id: s2 } } }, ... ]
//   const andClauses = serviceIds.map((sid) => ({ services: { some: { id: sid } } }));

//   const mastersRaw = await prisma.master.findMany({
//     where: { AND: andClauses },
//     select: { id: true, name: true },
//     orderBy: { name: "asc" },
//   });

//   // nextFreeDate оставим null — заполним позже (когда подключим твою функцию слотов).
//   const masters: MasterDTO[] = mastersRaw.map((m) => ({
//     id: m.id,
//     name: m.name,
//     canDoAll: true,
//     nextFreeDate: null,
//   }));

//   return { ok: true, data: { masters } };
// }

// /**
//  * Доступность:
//  * - Горизонт вперёд: 8 недель
//  * - Без буферов (ты так просил), шаг слотов — как в твоей lib/availability.ts
//  * - Слот валиден, если помещает durationMin подряд
//  * - Статусы PENDING|CONFIRMED блокируют; CANCELED игнорируем; DONE — в прошлом
//  *
//  * Реализация предполагает существование у тебя функции `buildDaySlots`.
//  * Если у тебя другое имя/сигнатура — поменяй импорт и вызов ниже.
//  */
// export async function getAvailability(
//   masterId: string,
//   durationMin: number
// ): Promise<ActionResult<AvailabilityDTO>> {
//   if (!masterId) return { ok: false, error: "Не указан мастер" };
//   if (!Number.isFinite(durationMin) || durationMin <= 0) {
//     return { ok: false, error: "Некорректная длительность" };
//   }

//   const today = new Date();
//   const until = addWeeks(today, 8);

//   // Перебираем дни, пока не найдём первый день с >=1 валидным слотом
//   for (let d = new Date(today); d <= until; d.setDate(d.getDate() + 1)) {
//     const dateISO = d.toISOString().slice(0, 10);

//     // ===== ВАЖНО =====
//     // Подставь твою функцию генерации слотов на день. Я предполагаю:
//     // const daySlots: string[] = await buildDaySlots(masterId, dateISO, durationMin);
//     // Если её имя иное — просто замени строку ниже.
//     //
//     // Пока оставляю заглушку — пустой список (чтобы файл компилился без твоей функции).
//     const daySlots: string[] = []; // await buildDaySlots(masterId, dateISO, durationMin);

//     if (daySlots.length > 0) {
//       return { ok: true, data: { firstDateISO: dateISO, slots: daySlots } };
//     }
//   }

//   // Если не нашли ничего в горизонте 8 недель — вернём пустые слоты и «сегодня».
//   return {
//     ok: true,
//     data: {
//       firstDateISO: today.toISOString().slice(0, 10),
//       slots: [],
//     },
//   };
// }

// /**
//  * Checkout (MVP):
//  * - Повторно валидируем входные данные
//  * - На этом шаге ты создаёшь драфт (PENDING) и отправляешь одноразовый код (SMTP, 6 цифр, TTL 10 минут)
//  * - Здесь оставляю интерфейс — реализацию отправки кода добавим, когда подключим таблицу `EmailVerification`
//  */
// export async function checkout(payload: {
//   masterId: string;
//   serviceIds: string[];
//   startAt: string; // ISO UTC
//   client: { name: string; email: string; phone: string };
// }): Promise<ActionResult<{ draftId: string; verify: "email" }>> {
//   const { masterId, serviceIds, startAt, client } = payload;

//   if (!masterId || serviceIds.length === 0 || !startAt) {
//     return { ok: false, error: "Заполните услуги, мастера и время" };
//   }
//   if (!client.name.trim() || !client.email.trim()) {
//     return { ok: false, error: "Имя и email обязательны" };
//   }

//   // TODO:
//   // 1) Повторная проверка валидности слота на сервере
//   // 2) Создать черновик (Appointment со статусом PENDING или отдельную Draft-таблицу)
//   // 3) Сгенерировать 6-значный код, положить в EmailVerification (TTL 10 минут)
//   // 4) Отправить код по SMTP

//   const draftId = "draft_please_replace"; // <- замени на реальный id черновика
//   return { ok: true, data: { draftId, verify: "email" } };
// }

// /**
//  * Оплата:
//  * - Наличные: сразу создаём Appointment(CONFIRMED) и возвращаем ok
//  * - Карта/PayPal: позже — создаём PaymentIntent / Checkout и ждём вебхук → CONFIRMED
//  */
// export async function pay(input: {
//   method: "cash" | "card" | "paypal";
//   draftId: string;
// }): Promise<ActionResult> {
//   if (!input.draftId) return { ok: false, error: "Не указан черновик" };

//   if (input.method === "cash") {
//     // TODO: найти черновик, создать Appointment(CONFIRMED), удалить/закрыть черновик
//     return { ok: true };
//   }

//   return { ok: false, error: "Онлайн-оплата будет подключена позже" };
// }
