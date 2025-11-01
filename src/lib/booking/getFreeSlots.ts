// src/lib/booking/getFreeSlots.ts
import { prisma } from "@/lib/prisma";
import { AppointmentStatus } from "@prisma/client";

const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";
const SLOT_STEP_MIN = 5;

/* =========================
   TZ utils
========================= */

function tzOffsetMs(zone: string, d: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  
  const parts = Object.fromEntries(
    dtf.formatToParts(d).map(p => [p.type, p.value])
  );
  
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  
  return asUTC - d.getTime();
}

function zonedMidnightUTC(dateISO: string, zone: string): Date {
  const localMidnight = new Date(`${dateISO}T00:00:00.000Z`);
  const off = tzOffsetMs(zone, localMidnight);
  return new Date(localMidnight.getTime() - off);
}

function getWeekdayInOrgTZ(dateISO: string): number {
  const dUTC = zonedMidnightUTC(dateISO, ORG_TZ);
  const shown = new Intl.DateTimeFormat("en-US", { 
    timeZone: ORG_TZ, 
    weekday: "short" 
  }).format(dUTC).toLowerCase();
  
  const weekdayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  
  return weekdayMap[shown] ?? new Date(dUTC).getUTCDay();
}

function ceilToStep(mins: number, step: number): number {
  return Math.ceil(mins / step) * step;
}

function addMinutesFromZonedMidnight(dateISO: string, mins: number): Date {
  const base = zonedMidnightUTC(dateISO, ORG_TZ);
  return new Date(base.getTime() + mins * 60000);
}

function minutesFromStart(dayStartUTC: Date, dt: Date): number {
  const diff = (dt.getTime() - dayStartUTC.getTime()) / 60000;
  return Math.floor(diff);
}

function minutesFromEnd(dayStartUTC: Date, dt: Date): number {
  const diff = (dt.getTime() - dayStartUTC.getTime()) / 60000;
  return Math.ceil(diff);
}

/* =========================
   Типы
========================= */

export type GetFreeSlotsArgs = {
  dateISO: string;
  masterId: string;
  durationMin?: number;
  serviceIds?: string[];
};

export type SlotDTO = {
  startAt: string;
  endAt: string;
  startMinutes: number;
  endMinutes: number;
};

type Interval = { 
  a: number; 
  b: number; 
};

type WorkingHours = {
  isClosed: boolean;
  startMinutes: number;
  endMinutes: number;
};

type TimeOffRecord = {
  startMinutes: number;
  endMinutes: number;
};

type AppointmentRecord = {
  startAt: Date;
  endAt: Date;
};

type ServiceRecord = {
  durationMin: number | null;
  isActive: boolean;
  isArchived: boolean;
};

/* =========================
   Основная функция
========================= */

export async function getFreeSlots(args: GetFreeSlotsArgs): Promise<SlotDTO[]> {
  const { dateISO, masterId } = args;

  // 1) Вычисляем итоговую длительность
  let totalDuration = args.durationMin ?? 0;
  
  if (args.serviceIds && args.serviceIds.length > 0) {
    const services = await prisma.service.findMany({
      where: { id: { in: args.serviceIds } },
      select: { durationMin: true, isActive: true, isArchived: true },
    });
    
    const active = services
      .filter((s: ServiceRecord) => s.isActive && !s.isArchived);
    
    totalDuration = active.reduce((acc, s) => acc + (s.durationMin ?? 0), 0);
  }
  
  if (!Number.isFinite(totalDuration) || totalDuration <= 0) {
    return [];
  }

  // 2) Получаем рабочие часы мастера
  const weekday = getWeekdayInOrgTZ(dateISO);
  const wh = await prisma.masterWorkingHours.findUnique({
    where: { masterId_weekday: { masterId, weekday } },
    select: { isClosed: true, startMinutes: true, endMinutes: true },
  });
  
  if (!wh || wh.isClosed) {
    return [];
  }

  const workStart = wh.startMinutes;
  const workEnd = wh.endMinutes;

  // 3) Локальная «рамка» дня в UTC
  const dayStartUTC = zonedMidnightUTC(dateISO, ORG_TZ);
  const dayEndUTC = addMinutesFromZonedMidnight(dateISO, 24 * 60);

  // 4) Персональные отгулы мастера
  const timeOff = await prisma.masterTimeOff.findMany({
    where: {
      masterId,
      date: { gte: dayStartUTC, lt: dayEndUTC },
    },
    select: { startMinutes: true, endMinutes: true },
  });

  // 5) Уже занятые интервалы
  const busyStatuses: AppointmentStatus[] = [
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
  ];

  const taken = await prisma.appointment.findMany({
    where: {
      masterId,
      status: { in: busyStatuses },
      startAt: { lt: dayEndUTC },
      endAt: { gt: dayStartUTC },
    },
    select: { startAt: true, endAt: true },
    orderBy: { startAt: "asc" },
  });

  // 6) Строим занятые минутные интервалы
  const busy: Interval[] = [];

  // Переводим отгулы в интервалы
  timeOff.forEach((t: TimeOffRecord) => {
    const a = Math.max(t.startMinutes, workStart);
    const b = Math.min(t.endMinutes, workEnd);
    if (a < b) {
      busy.push({ a, b });
    }
  });

  // Переводим существующие записи
  taken.forEach((appt: AppointmentRecord) => {
    const a0 = minutesFromStart(dayStartUTC, appt.startAt);
    const b0 = minutesFromEnd(dayStartUTC, appt.endAt);
    const a = Math.max(a0, workStart);
    const b = Math.min(b0, workEnd);
    if (a < b) {
      busy.push({ a, b });
    }
  });

  // 7) Сливаем пересекающиеся busy интервалы
  busy.sort((x, y) => x.a - y.a);
  
  const merged: Interval[] = [];
  busy.forEach(cur => {
    const last = merged[merged.length - 1];
    if (!last || last.b <= cur.a) {
      merged.push({ ...cur });
    } else {
      last.b = Math.max(last.b, cur.b);
    }
  });

  // 8) Свободные интервалы
  const free: Interval[] = [];
  let cursor = workStart;
  
  merged.forEach(blk => {
    if (cursor < blk.a) {
      free.push({ a: cursor, b: blk.a });
    }
    cursor = Math.max(cursor, blk.b);
  });
  
  if (cursor < workEnd) {
    free.push({ a: cursor, b: workEnd });
  }

  // 9) Генерация слотов
  const out: SlotDTO[] = [];
  
  free.forEach(f => {
    let start = ceilToStep(f.a, SLOT_STEP_MIN);
    
    while (start + totalDuration <= f.b) {
      const end = start + totalDuration;
      const startAtUTC = addMinutesFromZonedMidnight(dateISO, start);
      const endAtUTC = addMinutesFromZonedMidnight(dateISO, end);
      
      out.push({
        startAt: startAtUTC.toISOString(),
        endAt: endAtUTC.toISOString(),
        startMinutes: start,
        endMinutes: end,
      });
      
      start += SLOT_STEP_MIN;
    }
  });

  return out;
}

export default getFreeSlots;




// // src/lib/booking/getFreeSlots.ts
// import { prisma } from "@/lib/prisma";

// // Часовой пояс салона
// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";

// // Шаг сетки для стартов слотов, мин
// const SLOT_STEP_MIN = 5;

// /* =========================
//    TZ utils
// ========================= */

// /**
//  * Текущий сдвиг зоны для заданной даты (в мс).
//  * Получаем компоненты «как в зоне», собираем UTC-время, разница = смещение.
//  */
// function tzOffsetMs(zone: string, d: Date): number {
//   const dtf = new Intl.DateTimeFormat("en-US", {
//     timeZone: zone,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: false,
//   });
//   const parts = Object.fromEntries(dtf.formatToParts(d).map(p => [p.type, p.value]));
//   const asUTC = Date.UTC(
//     Number(parts.year),
//     Number(parts.month) - 1,
//     Number(parts.day),
//     Number(parts.hour),
//     Number(parts.minute),
//     Number(parts.second),
//   );
//   return asUTC - d.getTime();
// }

// /**
//  * UTC-инстант, соответствующий локальной «полуночи» даты dateISO в зоне zone.
//  * Пример: 2025-10-27 в Europe/Berlin -> 2025-10-26T22:00:00.000Z (если UTC+2).
//  */
// function zonedMidnightUTC(dateISO: string, zone: string): Date {
//   const localMidnight = new Date(`${dateISO}T00:00:00.000Z`);
//   const off = tzOffsetMs(zone, localMidnight);
//   return new Date(localMidnight.getTime() - off);
// }

// /** Номер дня недели в зоне салона: 0=Sunday..6=Saturday */
// function getWeekdayInOrgTZ(dateISO: string): number {
//   const dUTC = zonedMidnightUTC(dateISO, ORG_TZ);
//   const shown = new Intl.DateTimeFormat("en-US", { timeZone: ORG_TZ, weekday: "short" }).format(dUTC).toLowerCase();
//   switch (shown) {
//     case "sun": return 0;
//     case "mon": return 1;
//     case "tue": return 2;
//     case "wed": return 3;
//     case "thu": return 4;
//     case "fri": return 5;
//     case "sat": return 6;
//     default: return new Date(dUTC).getUTCDay();
//   }
// }

// /** Округление вверх к сетке */
// function ceilToStep(mins: number, step: number): number {
//   return Math.ceil(mins / step) * step;
// }

// /** Добавить к «зонной полуночи» минуты и вернуть UTC-инстант */
// function addMinutesFromZonedMidnight(dateISO: string, mins: number): Date {
//   const base = zonedMidnightUTC(dateISO, ORG_TZ);
//   return new Date(base.getTime() + mins * 60000);
// }

// /* =========================
//    Типы
// ========================= */

// export type GetFreeSlotsArgs = {
//   /** Дата в формате YYYY-MM-DD в зоне салона */
//   dateISO: string;
//   /** Идентификатор мастера, слоты считаем по его персональному графику */
//   masterId: string;
//   /**
//    * Либо итоговая длительность, либо массив услуг.
//    * Если переданы обе опции, приоритет у serviceIds.
//    */
//   durationMin?: number;
//   serviceIds?: string[];
// };

// export type SlotDTO = {
//   startAt: string;       // ISO UTC
//   endAt: string;         // ISO UTC
//   startMinutes: number;  // от локальной полуночи
//   endMinutes: number;    // от локальной полуночи
// };

// /* =========================
//    Helpers для минутных координат
// ========================= */

// /** Минуты от локальной полуночи для start-метки: округление вниз */
// function minutesFromStart(dayStartUTC: Date, dt: Date): number {
//   const diff = (dt.getTime() - dayStartUTC.getTime()) / 60000;
//   return Math.floor(diff);
// }

// /** Минуты от локальной полуночи для end-метки: округление вверх */
// function minutesFromEnd(dayStartUTC: Date, dt: Date): number {
//   const diff = (dt.getTime() - dayStartUTC.getTime()) / 60000;
//   return Math.ceil(diff);
// }

// /* =========================
//    Основная функция
// ========================= */

// /**
//  * Возвращает список возможных слотов в течение дня, где помещается суммарная длительность.
//  * Слоты рассчитываются в зоне салона и возвращаются как UTC ISO.
//  */
// export async function getFreeSlots(args: GetFreeSlotsArgs): Promise<SlotDTO[]> {
//   const { dateISO, masterId } = args;

//   // 1) Итоговая длительность: либо явно, либо сумма услуг
//   let totalDuration = args.durationMin ?? 0;
//   if (args.serviceIds && args.serviceIds.length > 0) {
//     const services = await prisma.service.findMany({
//       where: { id: { in: args.serviceIds } },
//       select: { durationMin: true, isActive: true, isArchived: true },
//     });
//     const active = services.filter(s => s.isActive && !s.isArchived);
//     totalDuration = active.reduce((acc, s) => acc + (s.durationMin ?? 0), 0);
//   }
//   if (!Number.isFinite(totalDuration) || totalDuration <= 0) {
//     return [];
//   }

//   // 2) Рабочие часы мастера для этого дня недели
//   const weekday = getWeekdayInOrgTZ(dateISO);
//   const wh = await prisma.masterWorkingHours.findUnique({
//     where: { masterId_weekday: { masterId, weekday } },
//     select: { isClosed: true, startMinutes: true, endMinutes: true },
//   });
//   if (!wh || wh.isClosed) {
//     return [];
//   }

//   // 3) Локальная «рамка» дня в UTC для выборок по пересечениям
//   const dayStartUTC = zonedMidnightUTC(dateISO, ORG_TZ);
//   const dayEndUTC = addMinutesFromZonedMidnight(dateISO, 24 * 60);

//   // 4) Персональные отгулы мастера для этой даты
//   const timeOff = await prisma.masterTimeOff.findMany({
//     where: {
//       masterId,
//       date: { gte: dayStartUTC, lt: dayEndUTC },
//     },
//     select: { startMinutes: true, endMinutes: true },
//   });

//   // 5) Уже занятые интервалы по ожидающим/подтверждённым
//   const taken = await prisma.appointment.findMany({
//     where: {
//       masterId,
//       status: { in: ["PENDING", "CONFIRMED"] },
//       startAt: { lt: dayEndUTC },
//       endAt: { gt: dayStartUTC },
//     },
//     select: { startAt: true, endAt: true },
//     orderBy: { startAt: "asc" },
//   });

//   // 6) Строим занятые «минутные» интервалы в координатах дня
//   type Interval = { a: number; b: number }; // [a,b) минуты от локальной полуночи
//   const busy: Interval[] = [];

//   const workStart = wh.startMinutes;
//   const workEnd = wh.endMinutes;

//   // Переводим отгулы в интервалы
//   for (const t of timeOff) {
//     const a = Math.max(t.startMinutes, workStart);
//     const b = Math.min(t.endMinutes, workEnd);
//     if (a < b) busy.push({ a, b });
//   }

//   // Переводим существующие записи с точным округлением
//   for (const appt of taken) {
//     const a0 = minutesFromStart(dayStartUTC, appt.startAt);
//     const b0 = minutesFromEnd(dayStartUTC, appt.endAt);
//     const a = Math.max(a0, workStart);
//     const b = Math.min(b0, workEnd);
//     if (a < b) busy.push({ a, b });
//   }

//   // 7) Сливаем пересекающиеся busy интервалы
//   busy.sort((x, y) => x.a - y.a);
//   const merged: Interval[] = [];
//   for (const cur of busy) {
//     if (merged.length === 0 || merged[merged.length - 1].b <= cur.a) {
//       merged.push({ ...cur });
//     } else {
//       merged[merged.length - 1].b = Math.max(merged[merged.length - 1].b, cur.b);
//     }
//   }

//   // 8) Свободные интервалы как разность с рабочим окном
//   const free: Interval[] = [];
//   let cursor = workStart;
//   for (const blk of merged) {
//     if (cursor < blk.a) free.push({ a: cursor, b: blk.a });
//     cursor = Math.max(cursor, blk.b);
//   }
//   if (cursor < workEnd) free.push({ a: cursor, b: workEnd });

//   // 9) Генерация стартов слотов по сетке SLOT_STEP_MIN так, чтобы весь блок помещался
//   const out: SlotDTO[] = [];
//   for (const f of free) {
//     let start = ceilToStep(f.a, SLOT_STEP_MIN);
//     while (start + totalDuration <= f.b) {
//       const end = start + totalDuration;
//       const startAtUTC = addMinutesFromZonedMidnight(dateISO, start);
//       const endAtUTC = addMinutesFromZonedMidnight(dateISO, end);
//       out.push({
//         startAt: startAtUTC.toISOString(),
//         endAt: endAtUTC.toISOString(),
//         startMinutes: start,
//         endMinutes: end,
//       });
//       start += SLOT_STEP_MIN;
//     }
//   }

//   return out;
// }

// export default getFreeSlots;




///-----------01/11
// import { prisma } from "@/lib/prisma";

// // Часовой пояс салона
// const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || "Europe/Berlin";

// // Шаг сетки для старта слотов, мин
// const SLOT_STEP_MIN = 5;

// // ============ TZ utils ============

// /**
//  * Текущий сдвиг зоны для заданной даты (в мс).
//  * Получаем компоненты «как в зоне», собираем UTC-время, разница = смещение.
//  */
// function tzOffsetMs(zone: string, d: Date): number {
//   const dtf = new Intl.DateTimeFormat("en-US", {
//     timeZone: zone,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: false,
//   });
//   const parts = Object.fromEntries(
//     dtf.formatToParts(d).map((p) => [p.type, p.value])
//   );
//   const asUTC = Date.UTC(
//     Number(parts.year),
//     Number(parts.month) - 1,
//     Number(parts.day),
//     Number(parts.hour),
//     Number(parts.minute),
//     Number(parts.second)
//   );
//   return asUTC - d.getTime();
// }

// /**
//  * UTC-инстант, соответствующий локальной «полуночи» даты dateISO в зоне zone.
//  * Пример: 2025-10-27 в Europe/Berlin -> 2025-10-26T22:00:00.000Z (если UTC+2).
//  */
// function zonedMidnightUTC(dateISO: string, zone: string): Date {
//   const localMidnight = new Date(`${dateISO}T00:00:00.000Z`);
//   const off = tzOffsetMs(zone, localMidnight);
//   return new Date(localMidnight.getTime() - off);
// }

// /** Номер дня недели в зоне салона: 0=Sunday..6=Saturday */
// function getWeekdayInOrgTZ(dateISO: string): number {
//   // берём локальную полночь в зоне, затем читаем weekday через toLocaleString
//   const dUTC = zonedMidnightUTC(dateISO, ORG_TZ);
//   const shown = new Intl.DateTimeFormat("en-US", {
//     timeZone: ORG_TZ,
//     weekday: "short",
//   }).format(dUTC);
//   // Быстрый маппинг
//   switch (shown.toLowerCase()) {
//     case "sun":
//       return 0;
//     case "mon":
//       return 1;
//     case "tue":
//       return 2;
//     case "wed":
//       return 3;
//     case "thu":
//       return 4;
//     case "fri":
//       return 5;
//     case "sat":
//       return 6;
//     default:
//       return new Date(dUTC).getUTCDay();
//   }
// }

// /** Минуты от начала дня с округлением к сетке */
// function ceilToStep(mins: number, step: number): number {
//   return Math.ceil(mins / step) * step;
// }

// /** Разность в минутах */
// function diffMin(a: Date, b: Date): number {
//   return Math.round((a.getTime() - b.getTime()) / 60000);
// }

// /** Сложить к «зонной полуночи» минуты и вернуть UTC-инстант */
// function addMinutesFromZonedMidnight(dateISO: string, mins: number): Date {
//   const base = zonedMidnightUTC(dateISO, ORG_TZ);
//   return new Date(base.getTime() + mins * 60000);
// }

// // ============ Типы ============

// export type GetFreeSlotsArgs = {
//   /** Дата в формате YYYY-MM-DD в зоне салона */
//   dateISO: string;
//   /** Идентификатор мастера, слоты считаем по его персональному графику */
//   masterId: string;
//   /**
//    * Либо итоговая длительность, либо массив услуг.
//    * Если переданы обе опции, приоритет у serviceIds.
//    */
//   durationMin?: number;
//   serviceIds?: string[];
// };

// export type SlotDTO = {
//   startAt: string; // ISO UTC
//   endAt: string; // ISO UTC
//   startMinutes: number; // от локальной полуночи
//   endMinutes: number; // от локальной полуночи
// };

// // ============ Основная функция ============

// /**
//  * Возвращает список возможных слотов в течение дня, где помещается суммарная длительность.
//  * Слоты рассчитываются в зоне салона и возвращаются как UTC ISO.
//  */
// export async function getFreeSlots(args: GetFreeSlotsArgs): Promise<SlotDTO[]> {
//   const { dateISO, masterId } = args;

//   // 1) Итоговая длительность: либо явно, либо сумма услуг
//   let totalDuration = args.durationMin ?? 0;
//   if (args.serviceIds && args.serviceIds.length > 0) {
//     const services = await prisma.service.findMany({
//       where: { id: { in: args.serviceIds } },
//       select: { durationMin: true, isActive: true, isArchived: true },
//     });
//     // фильтруем выключенные/архивные на всякий случай
//     const active = services.filter((s) => s.isActive && !s.isArchived);
//     totalDuration = active.reduce((acc, s) => acc + s.durationMin, 0);
//   }
//   if (!totalDuration || totalDuration <= 0) {
//     return [];
//   }

//   // 2) Рабочие часы мастера для этого буднего дня
//   const weekday = getWeekdayInOrgTZ(dateISO);
//   const wh = await prisma.masterWorkingHours.findUnique({
//     where: { masterId_weekday: { masterId, weekday } },
//     select: { isClosed: true, startMinutes: true, endMinutes: true },
//   });
//   if (!wh || wh.isClosed) {
//     return [];
//   }

//   // 3) Локальная «рамка» дня в UTC для запросов по пересечениям
//   const dayStartUTC = zonedMidnightUTC(dateISO, ORG_TZ);
//   const dayEndUTC = addMinutesFromZonedMidnight(dateISO, 24 * 60);

//   // 4) Персональные отгулы мастера для этой даты
//   const timeOff = await prisma.masterTimeOff.findMany({
//     where: {
//       masterId,
//       date: {
//         gte: dayStartUTC,
//         lt: dayEndUTC,
//       },
//     },
//     select: { startMinutes: true, endMinutes: true },
//   });

//   // 5) Уже занятые интервалы по подтверждённым/ожидающим
//   const taken = await prisma.appointment.findMany({
//     where: {
//       masterId,
//       status: { in: ["PENDING", "CONFIRMED"] },
//       startAt: { lt: dayEndUTC },
//       endAt: { gt: dayStartUTC },
//     },
//     select: { startAt: true, endAt: true },
//     orderBy: { startAt: "asc" },
//   });

//   // 6) Строим занятые «минутные» интервалы в координатах дня
//   type Interval = { a: number; b: number }; // [a,b) минуты от локальной полуночи

//   const busy: Interval[] = [];

//   // Рабочее окно мастера [wh.startMinutes, wh.endMinutes)
//   const workStart = wh.startMinutes;
//   const workEnd = wh.endMinutes;

//   // Переводим отгулы в интервалы
//   for (const t of timeOff) {
//     const a = Math.max(t.startMinutes, workStart);
//     const b = Math.min(t.endMinutes, workEnd);
//     if (a < b) busy.push({ a, b });
//   }

//   // Переводим существующие записи в «минуты от полуночи»
//   for (const appt of taken) {
//     const a = diffMin(appt.startAt, dayStartUTC);
//     const b = diffMin(appt.endAt, dayStartUTC);
//     const aa = Math.max(a, workStart);
//     const bb = Math.min(b, workEnd);
//     if (aa < bb) busy.push({ a: aa, b: bb });
//   }

//   // 7) Сливаем пересекающиеся busy интервалы
//   busy.sort((x, y) => x.a - y.a);
//   const merged: Interval[] = [];
//   for (const cur of busy) {
//     if (merged.length === 0 || merged[merged.length - 1].b <= cur.a) {
//       merged.push({ ...cur });
//     } else {
//       merged[merged.length - 1].b = Math.max(merged[merged.length - 1].b, cur.b);
//     }
//   }

//   // 8) Свободные интервалы как разность с рабочим окном
//   const free: Interval[] = [];
//   let cursor = workStart;
//   for (const blk of merged) {
//     if (cursor < blk.a) free.push({ a: cursor, b: blk.a });
//     cursor = Math.max(cursor, blk.b);
//   }
//   if (cursor < workEnd) free.push({ a: cursor, b: workEnd });

//   // 9) Генерация стартов слотов по сетке SLOT_STEP_MIN так, чтобы весь блок помещался
//   const out: SlotDTO[] = [];
//   for (const f of free) {
//     let start = ceilToStep(f.a, SLOT_STEP_MIN);
//     while (start + totalDuration <= f.b) {
//       const end = start + totalDuration;
//       const startAtUTC = addMinutesFromZonedMidnight(dateISO, start);
//       const endAtUTC = addMinutesFromZonedMidnight(dateISO, end);
//       out.push({
//         startAt: startAtUTC.toISOString(),
//         endAt: endAtUTC.toISOString(),
//         startMinutes: start,
//         endMinutes: end,
//       });
//       start += SLOT_STEP_MIN;
//     }
//   }

//   return out;
// }

// export default getFreeSlots;




////////////---------------27/10
// // src/lib/booking/getFreeSlots.ts
// import { prisma } from "@/lib/prisma";
// import { addMinutes } from "date-fns";

// export type Slot = { start: string; end: string }; // ISO строки

// const STEP_MIN = 10;
// const BREAK_AFTER_MIN = 10;

// function getOrgTz(explicit?: string): string {
//   return (
//     explicit ||
//     process.env.NEXT_PUBLIC_ORG_TZ ||
//     process.env.SALON_TZ ||
//     "Europe/Berlin"
//   );
// }

// /** Смещение таймзоны (мс) для заданного UTC-инстанта */
// function tzOffsetMs(tz: string, at: Date): number {
//   const dtf = new Intl.DateTimeFormat("en-US", {
//     timeZone: tz,
//     hour12: false,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });
//   const parts = dtf.formatToParts(at);
//   const map: Record<string, string> = {};
//   for (const p of parts) {
//     if (p.type !== "literal") map[p.type] = p.value;
//   }
//   const asUTC = Date.UTC(
//     Number(map.year),
//     Number(map.month) - 1,
//     Number(map.day),
//     Number(map.hour),
//     Number(map.minute),
//     Number(map.second),
//   );
//   return asUTC - at.getTime();
// }

// /** Диапазон UTC-инстантов для локальных суток dateISO в tz */
// function orgDayRange(dateISO: string, tz: string): { start: Date; end: Date } {
//   const utcMidnight = new Date(`${dateISO}T00:00:00Z`);
//   const offset = tzOffsetMs(tz, utcMidnight);
//   const start = new Date(utcMidnight.getTime() - offset);
//   const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
//   return { start, end };
// }

// /** YYYY-MM-DD проверка */
// function isValidISODate(d: string): boolean {
//   if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
//   const t = new Date(`${d}T00:00:00Z`);
//   return Number.isFinite(t.getTime());
// }

// /** Свободные интервалы для даты/услуги, опционально по мастеру. */
// export async function getFreeSlots(params: {
//   dateISO: string;          // '2025-10-05'
//   serviceSlug: string;
//   masterId?: string;        // при наличии — игнорируем часы салона, считаем по мастеру
//   tz?: string;              // например, 'Europe/Berlin'
// }): Promise<Slot[]> {
//   const { dateISO, serviceSlug, masterId } = params;
//   const ORG_TZ = getOrgTz(params.tz);
//   if (!isValidISODate(dateISO)) return [];

//   const service = await prisma.service.findUnique({
//     where: { slug: serviceSlug },
//     select: { id: true, durationMin: true, isActive: true },
//   });
//   if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//     return [];
//   }

//   // Локальные сутки салона -> UTC-диапазон
//   const { start: dayStart, end: dayEnd } = orgDayRange(dateISO, ORG_TZ);

//   // День недели (0..6, 0=вс) — берём по UTC-дате "00:00Z"
//   const weekday = new Date(`${dateISO}T00:00:00Z`).getUTCDay();

//   // Часы работы: если указан мастер — считаем по его графику, иначе — по салону
//   const whMaster = masterId
//     ? await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       })
//     : null;

//   const whSalon = !masterId
//     ? await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       })
//     : null;

//   let baseStartMin = 0;
//   let baseEndMin = 0;

//   if (masterId) {
//     if (!whMaster || whMaster.isClosed) return [];
//     baseStartMin = Math.max(0, Math.min(24 * 60, whMaster.startMinutes));
//     baseEndMin = Math.max(baseStartMin, whMaster.endMinutes);
//   } else {
//     if (!whSalon || whSalon.isClosed) return [];
//     baseStartMin = Math.max(0, Math.min(24 * 60, whSalon.startMinutes));
//     baseEndMin = Math.max(baseStartMin, whSalon.endMinutes);
//   }

//   // Границы рабочего окна в координатах UTC-инстантов
//   const workStart = dayStart; // локальная полночь в UTC
//   const start = addMinutes(workStart, baseStartMin);
//   const end = addMinutes(workStart, baseEndMin);

//   // Перерывы на дату
//   const dayOffs =
//     masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: dayStart },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: dayStart },
//           select: { startMinutes: true, endMinutes: true },
//         });

//   // Занятые записи за сутки
//   const appointments = await prisma.appointment.findMany({
//     where: {
//       status: { in: ["PENDING", "CONFIRMED"] },
//       startAt: { lt: dayEnd },
//       endAt: { gt: dayStart },
//       ...(masterId ? { masterId } : {}),
//     },
//     select: { startAt: true, endAt: true },
//     orderBy: { startAt: "asc" },
//   });

//   // Busy-список в минутах от локальной полуночи
//   type Intv = { start: number; end: number };
//   const busy: Intv[] = [
//     ...appointments.map(a => {
//       const s = Math.floor((a.startAt.getTime() - dayStart.getTime()) / 60000);
//       const e = Math.ceil((a.endAt.getTime() - dayStart.getTime()) / 60000) + BREAK_AFTER_MIN;
//       return { start: s, end: e };
//     }),
//     ...dayOffs.map(off => ({ start: off.startMinutes, end: off.endMinutes })),
//   ]
//     .map(b => ({
//       start: Math.max(b.start, baseStartMin),
//       end: Math.min(b.end, baseEndMin),
//     }))
//     .filter(b => b.end > b.start);

//   // Проверка пересечения со слотом
//   function overlaps(startMin: number, endMin: number): boolean {
//     for (const b of busy) {
//       if (b.start < endMin && startMin < b.end) return true;
//     }
//     return false;
//   }

//   // Дискретизация: шагаем STEP_MIN, окно — duration
//   const duration = service.durationMin;
//   const slots: Slot[] = [];

//   let cur = start;
//   while (addMinutes(cur, duration) <= end) {
//     const slotStart = cur;
//     const slotEnd = addMinutes(cur, duration);
//     const startMin = Math.floor((slotStart.getTime() - dayStart.getTime()) / 60000);
//     const endMin = startMin + duration;
//     if (!overlaps(startMin, endMin)) {
//       slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
//     }
//     cur = addMinutes(cur, STEP_MIN);
//   }

//   return slots;
// }
