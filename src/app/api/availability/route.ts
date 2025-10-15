// src/app/api/availability/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";
import { wallMinutesToUtc } from "@/lib/orgTime";

type Slot = { start: string; end: string };

// через сколько минут от «сейчас» ещё показываем слот
const MIN_LEAD_MIN = 30;
// шаг, если у услуги нет duration (на всякий случай)
const STEP_FALLBACK_MIN = 10;
// технологические буферы вокруг занятости
const BASE_BREAK_BEFORE_MIN = 10; // базовый минимум «до» записи (далее усилим до длительности)
const BREAK_AFTER_MIN = 10;       // «после» записи

function isValidISODate(d: string): boolean {
  // YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

type UtcIntv = { start: Date; end: Date };
type DebugInfo = {
  params: { serviceSlug: string; dateISO: string; masterId?: string };
  weekday: number;
  workingHours: { startMin: number; endMin: number };
  duration: number;
  step: number;
  bufferBefore: number;
  bufferAfter: number;
  timeOffUtc: { start: string; end: string }[];
  apptsUtc: { start: string; end: string }[];
  busyUtc: { start: string; end: string }[];
};

function mergeUtcIntervals(list: UtcIntv[]): UtcIntv[] {
  if (!list.length) return [];
  const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime());
  const out: UtcIntv[] = [];
  let cur = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i += 1) {
    const it = sorted[i];
    if (it.start.getTime() <= cur.end.getTime()) {
      if (it.end.getTime() > cur.end.getTime()) cur.end = it.end;
    } else {
      out.push(cur);
      cur = { ...it };
    }
  }
  out.push(cur);
  return out;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
    const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
    const masterId = (
      url.searchParams.get("masterId") ??
      url.searchParams.get("staffId") ??
      ""
    ).trim();
    const wantDebug = url.searchParams.get("debug") === "1";

    if (!serviceSlug || !isValidISODate(dateISO)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { slug: serviceSlug },
      select: { id: true, durationMin: true, isActive: true },
    });

    if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
      return NextResponse.json(
        { error: "Service not found or inactive" },
        { status: 404 }
      );
    }

    // Локальная полуночь → UTC и локальный weekday
    const dayStartUtc = wallMinutesToUtc(dateISO, 0);
    const dayEndUtc = wallMinutesToUtc(dateISO, 24 * 60);
    const weekday = new Date(dayStartUtc).getUTCDay();

    // --- рабочие часы (минуты от локальной полуночи)
    let startMin = 0;
    let endMin = 0;

    if (masterId) {
      const wh = await prisma.masterWorkingHours.findUnique({
        where: { masterId_weekday: { masterId, weekday } },
        select: { isClosed: true, startMinutes: true, endMinutes: true },
      });
      if (!wh || wh.isClosed) {
        const res = NextResponse.json<Slot[]>([], { status: 200 });
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
      startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
      endMin = Math.max(startMin, wh.endMinutes);
    } else {
      const wh = await prisma.workingHours.findUnique({
        where: { weekday },
        select: { isClosed: true, startMinutes: true, endMinutes: true },
      });
      if (!wh || !wh.startMinutes || !wh.endMinutes || wh.isClosed) {
        const res = NextResponse.json<Slot[]>([], { status: 200 });
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
      startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
      endMin = Math.max(startMin, wh.endMinutes);
    }

    // --- перерывы/отпуска: локальные минуты → UTC интервалы
    const timeOffRaw = masterId
      ? await prisma.masterTimeOff.findMany({
          where: { masterId, date: { gte: dayStartUtc, lt: dayEndUtc } },
          select: { startMinutes: true, endMinutes: true },
        })
      : await prisma.timeOff.findMany({
          where: { date: { gte: dayStartUtc, lt: dayEndUtc } },
          select: { startMinutes: true, endMinutes: true },
        });

    const timeOffUtc: UtcIntv[] = timeOffRaw
      .map(({ startMinutes, endMinutes }) => ({
        start: wallMinutesToUtc(dateISO, startMinutes),
        end: wallMinutesToUtc(dateISO, endMinutes),
      }))
      .filter((x) => x.end.getTime() > x.start.getTime());

    // --- уже забронированные интервалы (UTC) + буферы ДО/ПОСЛЕ
    const appts = await prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        ...(masterId ? { masterId } : {}),
        startAt: { lt: dayEndUtc },
        endAt: { gt: dayStartUtc },
      },
      select: { startAt: true, endAt: true },
      orderBy: { startAt: "asc" },
    });

    const duration = service.durationMin;
    const step = duration || STEP_FALLBACK_MIN;

    // главный момент: буфер «до» — не меньше длительности услуги
    const bufferBefore = Math.max(BASE_BREAK_BEFORE_MIN, duration);
    const bufferAfter = BREAK_AFTER_MIN;

    const apptsUtc: UtcIntv[] = appts.map(({ startAt, endAt }) => ({
      start: addMinutes(startAt, -bufferBefore),
      end: addMinutes(endAt, bufferAfter),
    }));

    // --- объединённые занятые окна
    const busyUtc = mergeUtcIntervals([...apptsUtc, ...timeOffUtc]);

    // --- построение свободных слотов
    const leadThresholdUtc = new Date(Date.now() + MIN_LEAD_MIN * 60_000);

    const alignUp = (m: number, st: number): number => Math.ceil(m / st) * st;

    const out: Slot[] = [];
    let s = alignUp(startMin, step);
    const lastStart = endMin - duration;

    // пересечение: касания считаем конфликтом (<= / >=)
    const overlapsUtc = (a: Date, b: Date): boolean =>
      busyUtc.some((x) => x.start <= b && a <= x.end);

    while (s <= lastStart) {
      const slotStartUtc = wallMinutesToUtc(dateISO, s);
      const slotEndUtc = wallMinutesToUtc(dateISO, s + duration);

      // не показываем слишком близкие к «сейчас»
      if (slotStartUtc.getTime() < leadThresholdUtc.getTime()) {
        s += step;
        continue;
      }

      if (!overlapsUtc(slotStartUtc, slotEndUtc)) {
        out.push({
          start: slotStartUtc.toISOString(),
          end: slotEndUtc.toISOString(),
        });
      }
      s += step;
    }

    if (wantDebug) {
      const payload: { slots: Slot[]; debug: DebugInfo } = {
        slots: out,
        debug: {
          params: { serviceSlug, dateISO, masterId: masterId || undefined },
          weekday,
          workingHours: { startMin, endMin },
          duration,
          step,
          bufferBefore,
          bufferAfter,
          timeOffUtc: timeOffUtc.map((t) => ({
            start: t.start.toISOString(),
            end: t.end.toISOString(),
          })),
          apptsUtc: apptsUtc.map((a) => ({
            start: a.start.toISOString(),
            end: a.end.toISOString(),
          })),
          busyUtc: busyUtc.map((b) => ({
            start: b.start.toISOString(),
            end: b.end.toISOString(),
          })),
        },
      };
      const res = NextResponse.json(payload, { status: 200 });
      res.headers.set("Cache-Control", "no-store");
      return res;
    }

    const res = NextResponse.json<Slot[]>(out, { status: 200 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (e) {
    const msg =
      process.env.NODE_ENV === "development"
        ? `availability error: ${String(e)}`
        : "Internal error";
    console.error(msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}








// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { orgDayRange } from "@/lib/orgTime";
// import { addMinutes } from "date-fns";

// type Slot = { start: string; end: string };

// const STEP_FALLBACK_MIN = 10;
// const BREAK_AFTER_MIN = 10;

// function isValidISODate(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// function weekdayFromISO(dateISO: string): number {
//   // День недели считаем от локальной полуночи TZ салона (orgDayRange),
//   // здесь — достаточно от ISO-строки:
//   return new Date(`${dateISO}T00:00:00Z`).getUTCDay();
// }

// type Intv = { start: number; end: number };

// function mergeIntervals(list: Intv[]): Intv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start - b.start);
//   const out: Intv[] = [];
//   let cur = { ...sorted[0] };
//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     if (it.start <= cur.end) cur.end = Math.max(cur.end, it.end);
//     else {
//       out.push(cur);
//       cur = { ...it };
//     }
//   }
//   out.push(cur);
//   return out;
// }

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
//     const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
//     const masterId = (
//       url.searchParams.get("masterId") ??
//       url.searchParams.get("staffId") ??
//       ""
//     ).trim();

//     if (!serviceSlug || !isValidISODate(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });
//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json(
//         { error: "Service not found or inactive" },
//         { status: 404 }
//       );
//     }

//     // Границы дня в UTC по TZ салона
//     const { start: dayStart, end: dayEnd } = orgDayRange(dateISO);
//     const weekday = weekdayFromISO(dateISO);

//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     }

//     // Не рабочее время / тайм-оффы
//     const timeOff: { startMinutes: number; endMinutes: number }[] = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     // Уже занятые записи (PENDING/CONFIRMED)
//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: dayEnd },
//         endAt: { gt: dayStart },
//         ...(masterId ? { masterId } : {}),
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const busyRaw: Intv[] = [
//       ...appts.map(({ startAt, endAt }) => {
//         const s = Math.floor((startAt.getTime() - dayStart.getTime()) / 60000);
//         const e =
//           Math.ceil((endAt.getTime() - dayStart.getTime()) / 60000) +
//           BREAK_AFTER_MIN;
//         return { start: s, end: e };
//       }),
//       ...timeOff.map((t) => ({ start: t.startMinutes, end: t.endMinutes })),
//     ]
//       .map((b) => ({
//         start: Math.max(b.start, startMin),
//         end: Math.min(b.end, endMin),
//       }))
//       .filter((b) => b.end > b.start);

//     const busy = mergeIntervals(busyRaw);

//     // Генерация слотов
//     const duration = service.durationMin;
//     const step = duration || STEP_FALLBACK_MIN;
//     const align = (m: number, st: number): number => Math.ceil(m / st) * st;

//     const prelim: Slot[] = [];
//     let s = align(startMin, step);
//     const lastStart = endMin - duration;

//     const overlaps = (a: number, b: number): boolean =>
//       busy.some((x) => x.start < b && a < x.end);

//     while (s <= lastStart) {
//       const e = s + duration;
//       // предварительная фильтрация
//       if (!overlaps(s, e)) {
//         prelim.push({
//           start: addMinutes(dayStart, s).toISOString(),
//           end: addMinutes(dayStart, e).toISOString(),
//         });
//       }
//       s += step;
//     }

//     // Финальная защита от «проскакиваний» (точно выкидываем всё, что пересекается)
//     const finalOut = prelim.filter((slot) => {
//       const sMin = Math.round((new Date(slot.start).getTime() - dayStart.getTime()) / 60000);
//       const eMin = Math.round((new Date(slot.end).getTime() - dayStart.getTime()) / 60000);
//       return !busy.some((x) => x.start < eMin && sMin < x.end);
//     });

//     return NextResponse.json<Slot[]>(finalOut, { status: 200 });
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }






// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { orgDayRange } from "@/lib/orgTime";
// import { addMinutes } from "date-fns";

// export const dynamic = "force-dynamic"; // <— без кэша на 100%

// type Slot = { start: string; end: string };

// const STEP_FALLBACK_MIN = 10;
// const BREAK_AFTER_MIN = 10;

// function isValidISODate(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// function weekdayFromISO(dateISO: string): number {
//   // от ISO-полуночи стабильнее, смещение TZ учитывает orgDayRange
//   return new Date(`${dateISO}T00:00:00Z`).getUTCDay();
// }

// type Intv = { start: number; end: number };

// function mergeIntervals(list: Intv[]): Intv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start - b.start);
//   const out: Intv[] = [];
//   let cur = { ...sorted[0] };
//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     if (it.start <= cur.end) cur.end = Math.max(cur.end, it.end);
//     else {
//       out.push(cur);
//       cur = { ...it };
//     }
//   }
//   out.push(cur);
//   return out;
// }

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
//     const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
//     const masterId = (
//       url.searchParams.get("masterId") ??
//       url.searchParams.get("staffId") ??
//       ""
//     ).trim();

//     if (!serviceSlug || !isValidISODate(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });
//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json(
//         { error: "Service not found or inactive" },
//         { status: 404 }
//       );
//     }

//     // Границы дня по TZ салона
//     const { start: dayStart, end: dayEnd } = orgDayRange(dateISO);
//     const weekday = weekdayFromISO(dateISO);

//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     }

//     // Выходные окна (отпуска и т.п.)
//     const timeOff: { startMinutes: number; endMinutes: number }[] = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     // Брони за сутки
//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: dayEnd },
//         endAt: { gt: dayStart },
//         ...(masterId ? { masterId } : {}),
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     // «занято» в минутах от начала дня
//     const busyRaw: Intv[] = [
//       ...appts.map(({ startAt, endAt }) => {
//         const s = Math.floor((startAt.getTime() - dayStart.getTime()) / 60000);
//         const e =
//           Math.ceil((endAt.getTime() - dayStart.getTime()) / 60000) +
//           BREAK_AFTER_MIN;
//         return { start: s, end: e };
//       }),
//       ...timeOff.map((t) => ({ start: t.startMinutes, end: t.endMinutes })),
//     ]
//       .map((b) => ({
//         start: Math.max(b.start, startMin),
//         end: Math.min(b.end, endMin),
//       }))
//       .filter((b) => b.end > b.start);

//     const busy = mergeIntervals(busyRaw);

//     const duration = service.durationMin;
//     const step = duration || STEP_FALLBACK_MIN;

//     const align = (m: number, st: number): number => Math.ceil(m / st) * st;

//     // Предварительные слоты
//     const prelim: Slot[] = [];
//     let s = align(startMin, step);
//     const lastStart = endMin - duration;

//     const overlapsBusy = (a: number, b: number): boolean =>
//       busy.some((x) => x.start < b && a < x.end);

//     while (s <= lastStart) {
//       const e = s + duration;
//       if (!overlapsBusy(s, e)) {
//         prelim.push({
//           start: addMinutes(dayStart, s).toISOString(),
//           end: addMinutes(dayStart, e).toISOString(),
//         });
//       }
//       s += step;
//     }

//     // --- ФИНАЛЬНАЯ СТРАХОВКА ---
//     // Сверяем каждый слот с реальными апкойнтами этого дня
//     const apptsMs = appts.map((a) => ({
//       s: a.startAt.getTime(),
//       e: a.endAt.getTime(),
//     }));

//     const result = prelim.filter((slot) => {
//       const sMs = new Date(slot.start).getTime();
//       const eMs = new Date(slot.end).getTime();
//       return !apptsMs.some((a) => a.s < eMs && sMs < a.e);
//     });

//     // Отдаём без кэша (на случай прокси)
//     const res = NextResponse.json<Slot[]>(result, { status: 200 });
//     res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
//     return res;
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }




//-----------пока оставлю
// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { orgDayRange } from "@/lib/orgTime";
// import { addMinutes } from "date-fns";

// type Slot = { start: string; end: string };

// const STEP_FALLBACK_MIN = 10;   // если по какой-то причине duration не пришёл
// const BREAK_AFTER_MIN   = 10;   // пауза после каждой записи, мин

// function isValidISODate(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// function weekdayFromISO(dateISO: string): number {
//   // достаточно UTC-дня из ISO
//   return new Date(`${dateISO}T00:00:00Z`).getUTCDay();
// }

// type Intv = { start: number; end: number };

// // слияние пересекающихся интервалов занятости
// function mergeIntervals(list: Intv[]): Intv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start - b.start);
//   const out: Intv[] = [];
//   let cur = { ...sorted[0] };
//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     if (it.start <= cur.end) cur.end = Math.max(cur.end, it.end);
//     else { out.push(cur); cur = { ...it }; }
//   }
//   out.push(cur);
//   return out;
// }

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
//     const dateISO     = (url.searchParams.get("dateISO") ?? "").trim();
//     const masterId    = (
//       url.searchParams.get("masterId") ??
//       url.searchParams.get("staffId") ??
//       ""
//     ).trim();

//     if (!serviceSlug || !isValidISODate(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     // целевая услуга (её duration определяет шаг слотов)
//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });
//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json({ error: "Service not found or inactive" }, { status: 404 });
//     }

//     // Границы ДНЯ в UTC по TZ салона (строго по орг-времени)
//     const { start: dayStart, end: dayEnd } = orgDayRange(dateISO);
//     const weekday = weekdayFromISO(dateISO);

//     // рабочие часы: либо персональные мастера, либо общие
//     let startMin = 0;
//     let endMin   = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin   = Math.max(startMin, wh.endMinutes);
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin   = Math.max(startMin, wh.endMinutes);
//     }

//     // выходные/перерывы
//     const timeOff: { startMinutes: number; endMinutes: number }[] = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     // уже созданные записи (PENDING/CONFIRMED) на этот день + мастер (если выбран)
//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: dayEnd },
//         endAt:   { gt: dayStart },
//         ...(masterId ? { masterId } : {}),
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     // интервал занятости: [start, ceil(end)+BREAK_AFTER_MIN]
//     const busyRaw: Intv[] = [
//       ...appts.map(({ startAt, endAt }) => {
//         const s = Math.max(0, Math.floor((startAt.getTime() - dayStart.getTime()) / 60000));
//         const e = Math.min(24 * 60,
//           Math.ceil((endAt.getTime() - dayStart.getTime()) / 60000) + BREAK_AFTER_MIN
//         );
//         return { start: s, end: e };
//       }),
//       ...timeOff.map((t) => ({ start: t.startMinutes, end: t.endMinutes })),
//     ]
//       .map((b) => ({                         // ограничиваем рабочими часами
//         start: Math.max(b.start, startMin),
//         end:   Math.min(b.end,   endMin),
//       }))
//       .filter((b) => b.end > b.start);

//     const busy = mergeIntervals(busyRaw);

//     // не показываем прошедшие слоты текущего дня
//     const now = new Date();
//     const nowIsToday = now >= dayStart && now < dayEnd;
//     const nowMin = nowIsToday ? Math.ceil((now.getTime() - dayStart.getTime()) / 60000) : -1;

//     const duration = Number(service.durationMin) || STEP_FALLBACK_MIN;
//     const step     = duration;

//     const alignUp = (m: number, st: number) => Math.ceil(m / st) * st;

//     const out: Slot[] = [];
//     let s = alignUp(startMin, step);
//     if (nowIsToday) s = Math.max(s, alignUp(nowMin, step)); // сразу перескакиваем за «текущее» время

//     const lastStart = endMin - duration;

//     const overlaps = (a: number, b: number) =>
//       busy.some((x) => x.start < b && a < x.end); // стандартное пересечение полуоткрытых интервалов

//     while (s <= lastStart) {
//       const e = s + duration;
//       if (!overlaps(s, e)) {
//         out.push({
//           start: addMinutes(dayStart, s).toISOString(),
//           end:   addMinutes(dayStart, e).toISOString(),
//         });
//       }
//       s += step;
//     }

//     return NextResponse.json<Slot[]>(out, { status: 200 });
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }






// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { orgDayRange } from "@/lib/orgTime";
// import { addMinutes } from "date-fns";

// type Slot = { start: string; end: string };

// const STEP_FALLBACK_MIN = 10;
// const BREAK_AFTER_MIN = 10;

// // За сколько минут до начала ещё разрешаем запись.
// // Поставь 30, если нужно скрывать слоты ближе чем за 30 минут от «сейчас».
// const MIN_LEAD_MIN = 30;

// function isValidISODate(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// function weekdayFromISO(dateISO: string): number {
//   // День недели считаем от ISO-строки (UTC-полночь безопасна для индекса дня)
//   return new Date(`${dateISO}T00:00:00Z`).getUTCDay();
// }

// type Intv = { start: number; end: number };

// function mergeIntervals(list: Intv[]): Intv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start - b.start);
//   const out: Intv[] = [];
//   let cur = { ...sorted[0] };
//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     if (it.start <= cur.end) cur.end = Math.max(cur.end, it.end);
//     else {
//       out.push(cur);
//       cur = { ...it };
//     }
//   }
//   out.push(cur);
//   return out;
// }

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
//     const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
//     const masterId = (
//       url.searchParams.get("masterId") ??
//       url.searchParams.get("staffId") ??
//       ""
//     ).trim();

//     if (!serviceSlug || !isValidISODate(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });
//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json(
//         { error: "Service not found or inactive" },
//         { status: 404 }
//       );
//     }

//     // Границы дня (локального для салона) в UTC — ключ к отсутствию сдвигов
//     const { start: dayStart, end: dayEnd } = orgDayRange(dateISO);
//     const weekday = weekdayFromISO(dateISO);

//     // Если день уже целиком в прошлом — сразу пусто
//     const now = new Date();
//     if (now >= dayEnd) {
//       return NextResponse.json<Slot[]>([], { status: 200 });
//     }

//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     }

//     // Нельзя предлагать слоты «раньше, чем сейчас» для текущего дня
//     // (учитываем минимальный буфер MIN_LEAD_MIN)
//     if (now > dayStart) {
//       const nowMin = Math.ceil((now.getTime() - dayStart.getTime()) / 60000) + MIN_LEAD_MIN;
//       startMin = Math.max(startMin, nowMin);
//       if (startMin >= endMin) {
//         // Ничего не осталось в текущем дне — пусто
//         return NextResponse.json<Slot[]>([], { status: 200 });
//       }
//     }

//     const timeOff: { startMinutes: number; endMinutes: number }[] = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: dayEnd },
//         endAt: { gt: dayStart },
//         ...(masterId ? { masterId } : {}),
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const busyRaw: Intv[] = [
//       ...appts.map(({ startAt, endAt }) => {
//         const s = Math.floor((startAt.getTime() - dayStart.getTime()) / 60000);
//         const e =
//           Math.ceil((endAt.getTime() - dayStart.getTime()) / 60000) +
//           BREAK_AFTER_MIN;
//         return { start: s, end: e };
//       }),
//       ...timeOff.map((t) => ({ start: t.startMinutes, end: t.endMinutes })),
//     ]
//       .map((b) => ({
//         start: Math.max(b.start, startMin),
//         end: Math.min(b.end, endMin),
//       }))
//       .filter((b) => b.end > b.start);

//     const busy = mergeIntervals(busyRaw);

//     const duration = service.durationMin;
//     const step = duration;

//     const align = (m: number, st: number): number => Math.ceil(m / st) * st;

//     const out: Slot[] = [];
//     let s = align(startMin, step);
//     const lastStart = endMin - duration;

//     const overlaps = (a: number, b: number): boolean =>
//       busy.some((x) => x.start < b && a < x.end);

//     while (s <= lastStart) {
//       const e = s + duration;
//       if (!overlaps(s, e)) {
//         out.push({
//           start: addMinutes(dayStart, s).toISOString(),
//           end: addMinutes(dayStart, e).toISOString(),
//         });
//       }
//       s += step || STEP_FALLBACK_MIN;
//     }

//     return NextResponse.json<Slot[]>(out, { status: 200 });
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }




//----------------временный файл, хранить в архиве- работал но предлагал запись которая уже не доступна---------------
// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { orgDayRange, ORG_TZ } from "@/lib/orgTime";
// import { addMinutes } from "date-fns";

// type Slot = { start: string; end: string };

// const STEP_FALLBACK_MIN = 10;
// const BREAK_AFTER_MIN = 10;
// // Если хотите буфер (например, нельзя записаться ближе чем за 30 минут) — поменяйте на 30
// const MIN_LEAD_MIN = 0;

// function isValidISODate(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// function weekdayFromISO(dateISO: string): number {
//   // день недели считаем от локальной полуночи TZ салона (orgDayRange),
//   // а здесь достаточно от ISO-строки:
//   return new Date(`${dateISO}T00:00:00Z`).getUTCDay();
// }

// type Intv = { start: number; end: number };

// function mergeIntervals(list: Intv[]): Intv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start - b.start);
//   const out: Intv[] = [];
//   let cur = { ...sorted[0] };
//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     if (it.start <= cur.end) cur.end = Math.max(cur.end, it.end);
//     else {
//       out.push(cur);
//       cur = { ...it };
//     }
//   }
//   out.push(cur);
//   return out;
// }

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
//     const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
//     const masterId = (
//       url.searchParams.get("masterId") ??
//       url.searchParams.get("staffId") ??
//       ""
//     ).trim();

//     if (!serviceSlug || !isValidISODate(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });
//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json(
//         { error: "Service not found or inactive" },
//         { status: 404 }
//       );
//     }

//     // Границы дня в UTC по TZ салона — ключ к отсутствию сдвигов.
//     const { start: dayStart, end: dayEnd } = orgDayRange(dateISO);
//     const weekday = weekdayFromISO(dateISO);

//     // ---- NOW в TZ салона: если спрашивают сегодняшний день, не показывать слоты раньше "сейчас + буфер"
//     const nowUtc = new Date();
//     const todayISOinOrg = new Intl.DateTimeFormat("en-CA", {
//       timeZone: ORG_TZ,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     }).format(nowUtc); // YYYY-MM-DD в TZ салона

//     let minStartMin = 0;
//     if (todayISOinOrg === dateISO) {
//       const minutesSinceDayStart = Math.floor((nowUtc.getTime() - dayStart.getTime()) / 60000);
//       minStartMin = Math.max(0, minutesSinceDayStart + MIN_LEAD_MIN);
//     }

//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     }

//     // Сдвигаем нижнюю границу на «сейчас + буфер», если речь о сегодняшнем дне
//     startMin = Math.max(startMin, minStartMin);

//     const timeOff: { startMinutes: number; endMinutes: number }[] = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: dayEnd },
//         endAt: { gt: dayStart },
//         ...(masterId ? { masterId } : {}),
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const busyRaw: Intv[] = [
//       ...appts.map(({ startAt, endAt }) => {
//         const s = Math.floor((startAt.getTime() - dayStart.getTime()) / 60000);
//         const e =
//           Math.ceil((endAt.getTime() - dayStart.getTime()) / 60000) +
//           BREAK_AFTER_MIN;
//         return { start: s, end: e };
//       }),
//       ...timeOff.map((t) => ({ start: t.startMinutes, end: t.endMinutes })),
//     ]
//       .map((b) => ({
//         start: Math.max(b.start, startMin),
//         end: Math.min(b.end, endMin),
//       }))
//       .filter((b) => b.end > b.start);

//     const busy = mergeIntervals(busyRaw);

//     const duration = service.durationMin;
//     const step = duration;

//     const align = (m: number, st: number): number => Math.ceil(m / st) * st;

//     const out: Slot[] = [];
//     let s = align(startMin, step);
//     const lastStart = endMin - duration;

//     const overlaps = (a: number, b: number): boolean =>
//       busy.some((x) => x.start < b && a < x.end);

//     while (s <= lastStart) {
//       const e = s + duration;
//       if (!overlaps(s, e)) {
//         out.push({
//           start: addMinutes(dayStart, s).toISOString(),
//           end: addMinutes(dayStart, e).toISOString(),
//         });
//       }
//       s += step || STEP_FALLBACK_MIN;
//     }

//     return NextResponse.json<Slot[]>(out, { status: 200 });
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }







// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";
// import { orgDayRange } from "@/lib/orgTime";
// import { addMinutes } from "date-fns";

// type Slot = { start: string; end: string };

// const STEP_FALLBACK_MIN = 10;
// const BREAK_AFTER_MIN = 10;

// function isValidISODate(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// function weekdayFromISO(dateISO: string): number {
//   return new Date(`${dateISO}T00:00:00Z`).getUTCDay();
// }

// type Intv = { start: number; end: number };

// function mergeIntervals(list: Intv[]): Intv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start - b.start);
//   const out: Intv[] = [];
//   let cur = { ...sorted[0] };
//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     if (it.start <= cur.end) cur.end = Math.max(cur.end, it.end);
//     else { out.push(cur); cur = { ...it }; }
//   }
//   out.push(cur);
//   return out;
// }

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
//     const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
//     const masterId = (
//       url.searchParams.get("masterId") ??
//       url.searchParams.get("staffId") ??
//       ""
//     ).trim();

//     if (!serviceSlug || !isValidISODate(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });
//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json({ error: "Service not found or inactive" }, { status: 404 });
//     }

//     const { start: dayStart, end: dayEnd } = orgDayRange(dateISO);
//     const weekday = weekdayFromISO(dateISO);

//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     }

//     const timeOff: { startMinutes: number; endMinutes: number }[] = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStart, lt: dayEnd } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: dayEnd },
//         endAt: { gt: dayStart },
//         ...(masterId ? { masterId } : {}),
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const busyRaw: Intv[] = [
//       ...appts.map(({ startAt, endAt }) => {
//         const s = Math.floor((startAt.getTime() - dayStart.getTime()) / 60000);
//         const e = Math.ceil((endAt.getTime() - dayStart.getTime()) / 60000) + BREAK_AFTER_MIN;
//         return { start: s, end: e };
//       }),
//       ...timeOff.map(t => ({ start: t.startMinutes, end: t.endMinutes })),
//     ]
//       .map(b => ({ start: Math.max(b.start, startMin), end: Math.min(b.end, endMin) }))
//       .filter(b => b.end > b.start);

//     const busy = mergeIntervals(busyRaw);

//     const duration = service.durationMin;
//     const step = duration;

//     const align = (m: number, st: number): number => Math.ceil(m / st) * st;

//     const out: Slot[] = [];
//     let s = align(startMin, step);
//     const lastStart = endMin - duration;

//     const overlaps = (a: number, b: number): boolean => busy.some(x => x.start < b && a < x.end);

//     while (s <= lastStart) {
//       const e = s + duration;
//       if (!overlaps(s, e)) {
//         out.push({
//           start: addMinutes(dayStart, s).toISOString(),
//           end: addMinutes(dayStart, e).toISOString(),
//         });
//       }
//       s += step || STEP_FALLBACK_MIN;
//     }

//     return NextResponse.json<Slot[]>(out, { status: 200 });
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }










// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// /** минуты от начала дня */
// type Slot = { start: number; end: number };

// /** шаг сетки (мин) и пауза после каждой записи (мин) */
// const STEP_MIN = 10;
// const BREAK_AFTER_MIN = 10;

// /* ---------- helpers ---------- */

// /** округление к шагу */
// function ceilToStep(min: number, step: number): number {
//   return Math.ceil(min / step) * step;
// }
// function floorToStep(min: number, step: number): number {
//   return Math.floor(min / step) * step;
// }

// function mergeBusy(input: Slot[]): Slot[] {
//   if (input.length === 0) return [];
//   const arr = [...input].sort((a, b) => a.start - b.start);
//   const out: Slot[] = [];
//   let cur = { ...arr[0] };
//   for (let i = 1; i < arr.length; i += 1) {
//     const it = arr[i];
//     if (it.start <= cur.end) cur.end = Math.max(cur.end, it.end);
//     else {
//       out.push(cur);
//       cur = { ...it };
//     }
//   }
//   out.push(cur);
//   return out;
// }

// /** work \ busy -> free */
// function subtractBusy(work: Slot, busy: Slot[]): Slot[] {
//   if (busy.length === 0) return [work];
//   const merged = mergeBusy(busy);
//   const free: Slot[] = [];
//   let start = work.start;

//   for (const b of merged) {
//     if (b.start > start) free.push({ start, end: Math.min(b.start, work.end) });
//     start = Math.max(start, b.end);
//     if (start >= work.end) break;
//   }
//   if (start < work.end) free.push({ start, end: work.end });
//   return free;
// }

// /** разложить free на слоты фиксированной длительности */
// function generateSlots(free: Slot[], duration: number, step: number): Slot[] {
//   const out: Slot[] = [];
//   for (const f of free) {
//     let s = ceilToStep(f.start, step);
//     const lastStart = f.end - duration;
//     while (s <= lastStart) {
//       out.push({ start: s, end: s + duration });
//       s += step;
//     }
//   }
//   return out;
// }

// /** YYYY-MM-DD */
// function isValidISODate(d: string): boolean {
//   if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
//   const test = new Date(`${d}T00:00:00`);
//   return Number.isFinite(test.getTime());
// }

// /** локальные сутки */
// function localDayRange(dateISO: string): { start: Date; end: Date } {
//   const start = new Date(`${dateISO}T00:00:00`);
//   const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
//   return { start, end };
// }

// /* ---------- GET ---------- */

// export async function GET(req: Request): Promise<Response> {
//   try {
//     const url = new URL(req.url);
//     const serviceSlug = url.searchParams.get("serviceSlug") ?? "";
//     const dateISO = url.searchParams.get("dateISO") ?? "";
//     const masterId =
//       (url.searchParams.get("masterId") ?? // NEW основной параметр
//         url.searchParams.get("staffId") ?? // NEW обратная совместимость со старым именем
//         "").trim();

//     if (!serviceSlug || !dateISO || !isValidISODate(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     // Длительность и активность услуги
//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { durationMin: true, isActive: true },
//     });
//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json({ error: "Service not found" }, { status: 404 });
//     }

//     // День недели (локально)
//     const dayStartLocal = new Date(`${dateISO}T00:00:00`);
//     const weekday = dayStartLocal.getDay(); // 0..6

//     // Глобальные часы салона
//     const whSalon = await prisma.workingHours.findUnique({
//       where: { weekday },
//       select: { isClosed: true, startMinutes: true, endMinutes: true },
//     });

//     // Часы мастера (если выбран)
//     const whMaster = masterId
//       ? await prisma.masterWorkingHours.findUnique({
//           where: { masterId_weekday: { masterId, weekday } },
//           select: { isClosed: true, startMinutes: true, endMinutes: true },
//         })
//       : null;

//     // Если салон закрыт — слоты пустые
//     if (!whSalon || whSalon.isClosed) {
//       return NextResponse.json<Slot[]>([], { status: 200 });
//     }
//     // Если у мастера задано "закрыто" — пусто
//     if (masterId && whMaster && whMaster.isClosed) {
//       return NextResponse.json<Slot[]>([], { status: 200 });
//     }

//     // Базовое окно — салон
//     let workStart = floorToStep(
//       Math.max(0, Math.min(24 * 60, whSalon.startMinutes)),
//       STEP_MIN
//     );
//     let workEnd = ceilToStep(Math.max(workStart, whSalon.endMinutes), STEP_MIN);

//     // Пересечение с окном мастера (если есть)
//     if (masterId && whMaster) {
//       const mStart = floorToStep(
//         Math.max(0, Math.min(24 * 60, whMaster.startMinutes)),
//         STEP_MIN
//       );
//       const mEnd = ceilToStep(Math.max(mStart, whMaster.endMinutes), STEP_MIN);
//       workStart = Math.max(workStart, mStart);
//       workEnd = Math.min(workEnd, mEnd);
//     }

//     if (workEnd - workStart < service.durationMin) {
//       return NextResponse.json<Slot[]>([], { status: 200 });
//     }
//     const workWindow: Slot = { start: workStart, end: workEnd };

//     // Сутки для выборок
//     const { start: dayStart, end: dayEnd } = localDayRange(dateISO);

//     // Занятость по записям (мастер — если выбран)
//     const busyFromAppointments = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         startAt: { lt: dayEnd },
//         endAt: { gt: dayStart },
//         ...(masterId ? { masterId } : {}),
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     // Исключения салона за этот день
//     const salonTimeOff = await prisma.timeOff.findMany({
//       where: { date: dayStart },
//       select: { startMinutes: true, endMinutes: true },
//     });

//     // Исключения мастера (если выбран)
//     const masterTimeOff = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: dayStart },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : [];

//     // Собираем busy-интервалы
//     const busy: Slot[] = [
//       // из записей (с паузой после)
//       ...busyFromAppointments
//         .map(({ startAt, endAt }) => {
//           const startMin = Math.floor(
//             (startAt.getTime() - dayStart.getTime()) / 60000
//           );
//           const endMin =
//             Math.ceil((endAt.getTime() - dayStart.getTime()) / 60000) +
//             BREAK_AFTER_MIN;
//           return { start: startMin, end: endMin };
//         })
//         .filter(
//           (b) =>
//             Number.isFinite(b.start) &&
//             Number.isFinite(b.end) &&
//             b.end > b.start
//         ),
//       // из исключений салона
//       ...salonTimeOff.map((t) => ({
//         start: t.startMinutes,
//         end: t.endMinutes,
//       })),
//       // из исключений мастера
//       ...masterTimeOff.map((t) => ({
//         start: t.startMinutes,
//         end: t.endMinutes,
//       })),
//     ]
//       // обрезаем рабочим окном
//       .map((b) => ({
//         start: Math.max(b.start, workWindow.start),
//         end: Math.min(b.end, workWindow.end),
//       }))
//       .filter((b) => b.end > b.start);

//     const free = subtractBusy(workWindow, busy);
//     const slots = generateSlots(free, service.durationMin, STEP_MIN);

//     // уникализируем
//     const uniq = new Map<string, Slot>();
//     for (const s of slots) {
//       if (Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start) {
//         uniq.set(`${s.start}-${s.end}`, s);
//       }
//     }
//     const clean = [...uniq.values()].sort((a, b) => a.start - b.start);

//     return NextResponse.json<Slot[]>(clean, { status: 200 });
//   } catch (e) {
//     const msg =
//       process.env.NODE_ENV === "development"
//         ? `availability error: ${String(e)}`
//         : "Internal error";
//     console.error(msg);
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }
