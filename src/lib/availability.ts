import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";

export type Slot = { start: string; end: string }; // ISO строки (UTC)

/**
 * Шаг сетки слотов (минуты).
 * По умолчанию 10, можно задать через .env:
 * NEXT_PUBLIC_SLOT_STEP_MIN=5|10|15
 */
const STEP_MIN = Number(process.env.NEXT_PUBLIC_SLOT_STEP_MIN ?? 10);

/**
 * Буфер после записи (минуты).
 * Сейчас по ТЗ не используем (0), но оставляем возможность включить.
 * NEXT_PUBLIC_BREAK_AFTER_MIN=0
 */
const BREAK_AFTER_MIN = Number(process.env.NEXT_PUBLIC_BREAK_AFTER_MIN ?? 0);

function getOrgTz(explicit?: string): string {
  return (
    explicit ||
    process.env.NEXT_PUBLIC_ORG_TZ ||
    process.env.SALON_TZ ||
    "Europe/Berlin"
  );
}

/** Смещение таймзоны (мс) для заданного UTC-инстанта */
function tzOffsetMs(tz: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(at);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return asUTC - at.getTime();
}

/** Диапазон UTC-инстантов для локальных суток dateISO в tz */
function orgDayRange(dateISO: string, tz: string): { start: Date; end: Date } {
  const utcMidnight = new Date(`${dateISO}T00:00:00Z`);
  const offset = tzOffsetMs(tz, utcMidnight);
  const start = new Date(utcMidnight.getTime() - offset);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/** YYYY-MM-DD проверка */
function isValidISODate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const t = new Date(`${d}T00:00:00Z`);
  return Number.isFinite(t.getTime());
}

/** integer minutes between two UTC instants, rounded down */
function diffMinFloor(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / 60000);
}

/**
 * Свободные интервалы для даты.
 * Можно передать либо `serviceSlug`, либо сразу `durationMin` (для суммы нескольких услуг).
 * Если указан `masterId` — считаем строго по его графику; если нет — по глобальному графику салона.
 */
export async function getFreeSlots(params: {
  dateISO: string;          // '2025-10-05'
  serviceSlug?: string;
  durationMin?: number;
  masterId?: string;        // при наличии — игнорируем часы салона, считаем по мастеру
  tz?: string;              // например, 'Europe/Berlin'
}): Promise<Slot[]> {
  const { dateISO, masterId } = params;
  const ORG_TZ = getOrgTz(params.tz);
  if (!isValidISODate(dateISO)) return [];

  // Блокируем прошлые даты: защитимся на уровне сервиса.
  const todayISO = new Date().toISOString().slice(0, 10);
  if (dateISO < todayISO) return [];

  // Длительность: либо из параметра, либо из услуги.
  let duration: number | null = null;

  if (params.durationMin != null) {
    duration = Number(params.durationMin);
  } else if (params.serviceSlug) {
    const service = await prisma.service.findUnique({
      where: { slug: params.serviceSlug },
      select: { durationMin: true, isActive: true },
    });
    if (!service || !service.isActive) return [];
    duration = service.durationMin;
  }

  if (!Number.isFinite(duration) || (duration as number) <= 0) return [];

  // Локальные сутки салона -> UTC-диапазон
  const { start: dayStart, end: dayEnd } = orgDayRange(dateISO, ORG_TZ);

  // День недели (0..6, 0=вс) — берём по UTC-дате "00:00Z"
  const weekday = new Date(`${dateISO}T00:00:00Z`).getUTCDay();

  // Часы работы: если указан мастер — считаем по его графику, иначе — по салону
  const whMaster = masterId
    ? await prisma.masterWorkingHours.findUnique({
        where: { masterId_weekday: { masterId, weekday } },
        select: { isClosed: true, startMinutes: true, endMinutes: true },
      })
    : null;

  const whSalon = !masterId
    ? await prisma.workingHours.findUnique({
        where: { weekday },
        select: { isClosed: true, startMinutes: true, endMinutes: true },
      })
    : null;

  let baseStartMin = 0;
  let baseEndMin = 0;

  if (masterId) {
    if (!whMaster || whMaster.isClosed) return [];
    baseStartMin = Math.max(0, Math.min(24 * 60, whMaster.startMinutes));
    baseEndMin = Math.max(baseStartMin, whMaster.endMinutes);
  } else {
    if (!whSalon || whSalon.isClosed) return [];
    baseStartMin = Math.max(0, Math.min(24 * 60, whSalon.startMinutes));
    baseEndMin = Math.max(baseStartMin, whSalon.endMinutes);
  }

  // Границы рабочего окна в координатах UTC-инстантов
  const workStart = dayStart; // локальная полночь в UTC
  const start = addMinutes(workStart, baseStartMin);
  const end = addMinutes(workStart, baseEndMin);

  // Перерывы (time off) за сутки — диапазоном [dateISO, nextDateISO)
  const dayStartUtc = new Date(`${dateISO}T00:00:00Z`);
  const nextDayUtc = new Date(dayStartUtc);
  nextDayUtc.setUTCDate(nextDayUtc.getUTCDate() + 1);

  const dayOffs =
    masterId
      ? await prisma.masterTimeOff.findMany({
          where: {
            masterId,
            date: { gte: dayStartUtc, lt: nextDayUtc },
          },
          select: { startMinutes: true, endMinutes: true },
        })
      : await prisma.timeOff.findMany({
          where: { date: { gte: dayStartUtc, lt: nextDayUtc } },
          select: { startMinutes: true, endMinutes: true },
        });

  // Занятые записи за сутки (PENDING|CONFIRMED), без CANCELED, DONE в прошлом нас не волнует
  const appointments = await prisma.appointment.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lt: dayEnd },
      endAt: { gt: dayStart },
      ...(masterId ? { masterId } : {}),
    },
    select: { startAt: true, endAt: true },
    orderBy: { startAt: "asc" },
  });

  // Busy-список в минутах от локальной полуночи
  type Intv = { start: number; end: number };
  const busy: Intv[] = [
    ...appointments.map(a => {
      const s = diffMinFloor(a.startAt, dayStart);
      // буфер после записи — по ТЗ сейчас 0
      const e = diffMinFloor(a.endAt, dayStart) + BREAK_AFTER_MIN;
      return { start: s, end: e };
    }),
    ...dayOffs.map(off => ({ start: off.startMinutes, end: off.endMinutes })),
  ]
    .map(b => ({
      start: Math.max(b.start, baseStartMin),
      end: Math.min(b.end, baseEndMin),
    }))
    .filter(b => b.end > b.start)
    .sort((a, b) => a.start - b.start);

  // Проверка пересечения со слотом
  function overlaps(startMin: number, endMin: number): boolean {
    for (const b of busy) {
      if (b.start < endMin && startMin < b.end) return true;
    }
    return false;
  }

  // Дискретизация: шагаем STEP_MIN, окно — duration
  const dur = duration as number;
  const slots: Slot[] = [];

  let cur = start;
  while (addMinutes(cur, dur) <= end) {
    const slotStart = cur;
    const slotEnd = addMinutes(cur, dur);
    const startMin = diffMinFloor(slotStart, dayStart);
    const endMin = startMin + dur;
    if (!overlaps(startMin, endMin)) {
      slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
    }
    cur = addMinutes(cur, STEP_MIN);
  }

  return slots;
}




//------работал в преведущей версии
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

//   // Занятые записи за сутки (не ограничиваем по услуге, чтобы не дабл-буковать мастера)
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






//------------14.10----------------
// // src/lib/availability.ts
// import { prisma } from "@/lib/prisma";
// import { addMinutes, areIntervalsOverlapping, set } from "date-fns";

// export type Slot = { start: string; end: string }; // ISO строки

// /** Возвращает свободные интервалы для конкретной даты/услуги. */
// export async function getFreeSlots(params: {
//   dateISO: string;         // '2025-10-05'
//   serviceSlug: string;
//   tz?: string;             // например, 'Europe/Berlin' (пока не используем офсет)
// }): Promise<Slot[]> {
//   const { dateISO, serviceSlug } = params;

//   const service = await prisma.service.findUnique({
//     where: { slug: serviceSlug },
//     select: { id: true, durationMin: true, isActive: true },
//   });
//   if (!service || !service.isActive) return [];

//   // дата «полуночь локальная»
//   const day = new Date(`${dateISO}T00:00:00`);

//   // рабочие часы (0..6; 0=вс)
//   const weekday = day.getDay();
//   const wh = await prisma.workingHours.findUnique({ where: { weekday } });
//   if (!wh || wh.isClosed) return [];

//   // границы рабочего дня (в UTC времени сервера)
//   const workStart = set(day, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
//   const start = addMinutes(workStart, wh.startMinutes);
//   const end = addMinutes(workStart, wh.endMinutes);

//   // перерывы на конкретную дату
//   const dayOffs = await prisma.timeOff.findMany({
//     where: {
//       date: day,
//     },
//   });

//   // существующие записи по услуге за день
//   const appointments = await prisma.appointment.findMany({
//     where: {
//       serviceId: service.id,
//       startAt: { gte: start, lt: end },
//       status: { in: ["PENDING", "CONFIRMED"] },
//     },
//     select: { startAt: true, endAt: true },
//   });

//   // дискретизация шагом длительности услуги
//   const stepMin = service.durationMin;
//   const slots: Slot[] = [];
//   let cursor = start;

//   while (addMinutes(cursor, stepMin) <= end) {
//     const slotStart = cursor;
//     const slotEnd = addMinutes(cursor, stepMin);

//     // отсекаем, если пересекается с перерывами
//     const blocked = dayOffs.some(off => {
//       const offStart = addMinutes(workStart, off.startMinutes);
//       const offEnd = addMinutes(workStart, off.endMinutes);
//       return areIntervalsOverlapping({ start: slotStart, end: slotEnd }, { start: offStart, end: offEnd });
//     });

//     // отсекаем, если пересекается с чужими апвт.
//     const busy = appointments.some(a =>
//       areIntervalsOverlapping({ start: slotStart, end: slotEnd }, { start: a.startAt, end: a.endAt })
//     );

//     if (!blocked && !busy) {
//       slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
//     }

//     cursor = addMinutes(cursor, stepMin);
//   }

//   return slots;
// }
