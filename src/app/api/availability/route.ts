// src/app/api/availability/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORG_TZ, wallMinutesToUtc } from "@/lib/orgTime";

type SlotMin = { startMin: number; endMin: number };

// минимальный «лид» до начала слота (минут)
const MIN_LEAD_MIN = 30;
// шаг, если у услуги нет duration (safety)
const STEP_FALLBACK_MIN = 10;

function isYmd(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

type UtcIntv = { start: Date; end: Date };
type DebugInfo = {
  params: { serviceSlug: string; dateISO: string; masterId?: string };
  tz: string;
  weekday: number;
  workingHours: { startMin: number; endMin: number };
  duration: number;
  step: number;
  timeOffUtc: { start: string; end: string }[];
  apptsUtc: { start: string; end: string }[];
  busyUtc: { start: string; end: string }[];
};

/** Склейка занятостей в полуоткрытой логике [start,end) */
function mergeUtcIntervals(list: UtcIntv[]): UtcIntv[] {
  if (!list.length) return [];
  const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime());
  const out: UtcIntv[] = [];
  let cur: UtcIntv = { start: new Date(sorted[0].start), end: new Date(sorted[0].end) };

  for (let i = 1; i < sorted.length; i += 1) {
    const it = sorted[i];
    // объединяем только при реальном пересечении (полуоткрытые интервалы)
    if (it.start.getTime() < cur.end.getTime()) {
      if (it.end.getTime() > cur.end.getTime()) cur.end = it.end;
    } else {
      out.push(cur);
      cur = { start: new Date(it.start), end: new Date(it.end) };
    }
  }
  out.push(cur);
  return out;
}

/** true, если dateISO — «сегодня» в таймзоне салона */
function isOrgToday(dateISO: string): boolean {
  const now = new Date();
  // получаем YYYY-MM-DD «сейчас» в ORG_TZ
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ORG_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-");
  const todayISO = `${parts[0]}-${parts[1]}-${parts[2]}`;
  return todayISO === dateISO;
}

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const serviceSlug = (url.searchParams.get("serviceSlug") ?? "").trim();
    const dateISO = (url.searchParams.get("dateISO") ?? "").trim();
    const masterId = (
      url.searchParams.get("masterId") ?? url.searchParams.get("staffId") ?? ""
    ).trim();
    const wantDebug = url.searchParams.get("debug") === "1";

    if (!serviceSlug || !isYmd(dateISO)) {
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

    // Границы дня (UTC) и weekday (в локальной TZ)
    const dayStartUtc = wallMinutesToUtc(dateISO, 0);
    const dayEndUtc = wallMinutesToUtc(dateISO, 24 * 60);
    const weekday = new Date(dayStartUtc).getUTCDay();

    // Рабочие часы — мастера или общие
    let startMin = 0;
    let endMin = 0;

    if (masterId) {
      const wh = await prisma.masterWorkingHours.findUnique({
        where: { masterId_weekday: { masterId, weekday } },
        select: { isClosed: true, startMinutes: true, endMinutes: true },
      });
      if (!wh || wh.isClosed) {
        const res = NextResponse.json<SlotMin[]>([], { status: 200 });
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
      startMin = Math.max(0, Math.min(1440, wh.startMinutes));
      endMin = Math.max(startMin, Math.min(1440, wh.endMinutes));
    } else {
      const wh = await prisma.workingHours.findUnique({
        where: { weekday },
        select: { isClosed: true, startMinutes: true, endMinutes: true },
      });
      if (!wh || wh.isClosed || !Number.isFinite(wh.startMinutes) || !Number.isFinite(wh.endMinutes)) {
        const res = NextResponse.json<SlotMin[]>([], { status: 200 });
        res.headers.set("Cache-Control", "no-store");
        return res;
      }
      startMin = Math.max(0, Math.min(1440, wh.startMinutes));
      endMin = Math.max(startMin, Math.min(1440, wh.endMinutes));
    }

    // Перерывы/отпуска за день (UTC-диапазон дня)
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

    // Уже забронированные (полуоткрытые [start,end))
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

    const duration: number = service.durationMin ?? STEP_FALLBACK_MIN;
    const step: number = duration;

    const apptsUtc: UtcIntv[] = appts.map(({ startAt, endAt }) => ({
      start: startAt,
      end: endAt,
    }));
    const busyUtc = mergeUtcIntervals([...apptsUtc, ...timeOffUtc]);

    // генерация слотов (в минутах локального дня)
    const out: SlotMin[] = [];

    // «лид» применяем только для выбранного «сегодня»
    const applyLead = isOrgToday(dateISO);
    const nowWithLeadUtc = applyLead
      ? new Date(Date.now() + MIN_LEAD_MIN * 60_000)
      : null;

    const alignUp = (m: number, st: number): number => Math.ceil(m / st) * st;

    let s = alignUp(startMin, step);
    const lastStart = endMin - duration;

    // пересечение полуоткрытых интервалов: aStart < bEnd && bStart < aEnd
    const overlapsUtc = (aStart: Date, aEnd: Date): boolean =>
      busyUtc.some((x) => aStart < x.end && x.start < aEnd);

    while (s <= lastStart) {
      const slotStartUtc = wallMinutesToUtc(dateISO, s);
      const slotEndUtc = wallMinutesToUtc(dateISO, s + duration);

      // скрываем «слишком близкие» к текущему моменту только для сегодняшней даты
      if (nowWithLeadUtc && slotStartUtc.getTime() < nowWithLeadUtc.getTime()) {
        s += step;
        continue;
      }

      if (!overlapsUtc(slotStartUtc, slotEndUtc)) {
        out.push({ startMin: s, endMin: s + duration });
      }
      s += step;
    }

    if (wantDebug) {
      const payload: { slots: SlotMin[]; debug: DebugInfo } = {
        slots: out,
        debug: {
          params: { serviceSlug, dateISO, masterId: masterId || undefined },
          tz: ORG_TZ,
          weekday,
          workingHours: { startMin, endMin },
          duration,
          step,
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

    // Отдаём в минутах (фронт это умеет)
    const res = NextResponse.json<SlotMin[]>(out, { status: 200 });
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







// -----------------работал 
// // src/app/api/availability/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { ORG_TZ, wallMinutesToUtc } from "@/lib/orgTime";

// type Slot = { start: string; end: string };

// // минимальный «лид» до начала слота (минут)
// const MIN_LEAD_MIN = 30;
// // шаг, если у услуги нет duration (safety)
// const STEP_FALLBACK_MIN = 10; 

// function isYmd(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// type UtcIntv = { start: Date; end: Date };
// type DebugInfo = {
//   params: { serviceSlug: string; dateISO: string; masterId?: string };
//   tz: string;
//   weekday: number;
//   workingHours: { startMin: number; endMin: number };
//   duration: number;
//   step: number;
//   timeOffUtc: { start: string; end: string }[];
//   apptsUtc: { start: string; end: string }[];
//   busyUtc: { start: string; end: string }[];
// };

// /** Склейка занятостей в полуоткрытой логике [start,end) */
// function mergeUtcIntervals(list: UtcIntv[]): UtcIntv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime());
//   const out: UtcIntv[] = [];
//   let cur = { ...sorted[0] };

//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     // ВАЖНО: полуоткрытая граница — только если it.start < cur.end, а не <=
//     if (it.start.getTime() < cur.end.getTime()) {
//       if (it.end.getTime() > cur.end.getTime()) cur.end = it.end;
//     } else {
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
//     const masterId = (url.searchParams.get("masterId") ?? url.searchParams.get("staffId") ?? "").trim();
//     const wantDebug = url.searchParams.get("debug") === "1";

//     if (!serviceSlug || !isYmd(dateISO)) {
//       return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
//     }

//     const service = await prisma.service.findUnique({
//       where: { slug: serviceSlug },
//       select: { id: true, durationMin: true, isActive: true },
//     });

//     if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
//       return NextResponse.json({ error: "Service not found or inactive" }, { status: 404 });
//     }

//     // Границы дня (UTC) и weekday в локальной TZ
//     const dayStartUtc = wallMinutesToUtc(dateISO, 0);
//     const dayEndUtc = wallMinutesToUtc(dateISO, 24 * 60);
//     const weekday = new Date(dayStartUtc).getUTCDay();

//     // Рабочие часы мастера/общие
//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) {
//         const res = NextResponse.json<Slot[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(1440, wh.startMinutes));
//       endMin = Math.max(startMin, Math.min(1440, wh.endMinutes));
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || !wh.startMinutes || !wh.endMinutes || wh.isClosed) {
//         const res = NextResponse.json<Slot[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(1440, wh.startMinutes));
//       endMin = Math.max(startMin, Math.min(1440, wh.endMinutes));
//     }

//     // Перерывы/отпуска за день (UTC-диапазон дня!)
//     const timeOffRaw = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     const timeOffUtc: UtcIntv[] = timeOffRaw
//       .map(({ startMinutes, endMinutes }) => ({
//         start: wallMinutesToUtc(dateISO, startMinutes),
//         end: wallMinutesToUtc(dateISO, endMinutes),
//       }))
//       .filter((x) => x.end.getTime() > x.start.getTime());

//     // Уже забронированные (полуоткрытые [start,end))
//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         ...(masterId ? { masterId } : {}),
//         startAt: { lt: dayEndUtc },
//         endAt: { gt: dayStartUtc },
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const duration = service.durationMin || STEP_FALLBACK_MIN;
//     const step = duration;

//     const apptsUtc: UtcIntv[] = appts.map(({ startAt, endAt }) => ({ start: startAt, end: endAt }));
//     const busyUtc = mergeUtcIntervals([...apptsUtc, ...timeOffUtc]);

//     // генерация слотов
//     const leadThresholdUtc = new Date(Date.now() + MIN_LEAD_MIN * 60_000);
//     const alignUp = (m: number, st: number): number => Math.ceil(m / st) * st;

//     const out: Slot[] = [];
//     let s = alignUp(startMin, step);
//     const lastStart = endMin - duration;

//     // полуоткрытые интервалы: конфликт если aStart < bEnd && bStart < aEnd
//     const overlapsUtc = (aStart: Date, aEnd: Date): boolean =>
//       busyUtc.some((x) => aStart < x.end && x.start < aEnd);

//     while (s <= lastStart) {
//       const slotStartUtc = wallMinutesToUtc(dateISO, s);
//       const slotEndUtc = wallMinutesToUtc(dateISO, s + duration);

//       // скрываем «слишком близкие» к текущему моменту
//       if (slotStartUtc.getTime() < leadThresholdUtc.getTime()) {
//         s += step;
//         continue;
//       }

//       if (!overlapsUtc(slotStartUtc, slotEndUtc)) {
//         out.push({ start: slotStartUtc.toISOString(), end: slotEndUtc.toISOString() });
//       }
//       s += step;
//     }

//     if (wantDebug) {
//       const payload: { slots: Slot[]; debug: DebugInfo } = {
//         slots: out,
//         debug: {
//           params: { serviceSlug, dateISO, masterId: masterId || undefined },
//           tz: ORG_TZ,
//           weekday,
//           workingHours: { startMin, endMin },
//           duration,
//           step,
//           timeOffUtc: timeOffUtc.map((t) => ({ start: t.start.toISOString(), end: t.end.toISOString() })),
//           apptsUtc: apptsUtc.map((a) => ({ start: a.start.toISOString(), end: a.end.toISOString() })),
//           busyUtc: busyUtc.map((b) => ({ start: b.start.toISOString(), end: b.end.toISOString() })),
//         },
//       };
//       const res = NextResponse.json(payload, { status: 200 });
//       res.headers.set("Cache-Control", "no-store");
//       return res;
//     }

//     const res = NextResponse.json<Slot[]>(out, { status: 200 });
//     res.headers.set("Cache-Control", "no-store");
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









//----------работало но показывало занятые слоты и не давало брать свободные интервальные----------
// /* eslint-disable no-console */
// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// // import { addMinutes } from "date-fns";
// import { ORG_TZ, wallMinutesToUtc } from "@/lib/orgTime";

// type Slot = { start: string; end: string };

// // минимальный «лид» до начала слота (минут)
// const MIN_LEAD_MIN = 30;
// // шаг, если у услуги нет duration (safety)
// const STEP_FALLBACK_MIN = 10;

// function isYmd(d: string): boolean {
//   return /^\d{4}-\d{2}-\d{2}$/.test(d);
// }

// type UtcIntv = { start: Date; end: Date };
// type DebugInfo = {
//   params: { serviceSlug: string; dateISO: string; masterId?: string };
//   tz: string;
//   weekday: number;
//   workingHours: { startMin: number; endMin: number };
//   duration: number;
//   step: number;
//   timeOffUtc: { start: string; end: string }[];
//   apptsUtc: { start: string; end: string }[];
//   busyUtc: { start: string; end: string }[];
// };

// function mergeUtcIntervals(list: UtcIntv[]): UtcIntv[] {
//   if (!list.length) return [];
//   const sorted = [...list].sort((a, b) => a.start.getTime() - b.start.getTime());
//   const out: UtcIntv[] = [];
//   let cur = { ...sorted[0] };
//   for (let i = 1; i < sorted.length; i += 1) {
//     const it = sorted[i];
//     if (it.start.getTime() <= cur.end.getTime()) {
//       if (it.end.getTime() > cur.end.getTime()) cur.end = it.end;
//     } else {
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
//       url.searchParams.get("masterId") ?? url.searchParams.get("staffId") ?? ""
//     ).trim();
//     const wantDebug = url.searchParams.get("debug") === "1";

//     if (!serviceSlug || !isYmd(dateISO)) {
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

//     // Локальная полуночь → UTC границы дня и weekday в локальном часовом поясе
//     // weekday считаем как у тебя раньше (UTC getUTCDay на UTC-полуночи локального дня)
//     const dayStartUtc = wallMinutesToUtc(dateISO, 0);
//     const dayEndUtc = wallMinutesToUtc(dateISO, 24 * 60);
//     const weekday = new Date(dayStartUtc).getUTCDay();

//     // рабочие часы: либо мастера, либо общие
//     let startMin = 0;
//     let endMin = 0;

//     if (masterId) {
//       const wh = await prisma.masterWorkingHours.findUnique({
//         where: { masterId_weekday: { masterId, weekday } },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || wh.isClosed) {
//         const res = NextResponse.json<Slot[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     } else {
//       const wh = await prisma.workingHours.findUnique({
//         where: { weekday },
//         select: { isClosed: true, startMinutes: true, endMinutes: true },
//       });
//       if (!wh || !wh.startMinutes || !wh.endMinutes || wh.isClosed) {
//         const res = NextResponse.json<Slot[]>([], { status: 200 });
//         res.headers.set("Cache-Control", "no-store");
//         return res;
//       }
//       startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
//       endMin = Math.max(startMin, wh.endMinutes);
//     }

//     // Time off (перерывы/отпуска) — всё в UTC
//     const timeOffRaw = masterId
//       ? await prisma.masterTimeOff.findMany({
//           where: { masterId, date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         })
//       : await prisma.timeOff.findMany({
//           where: { date: { gte: dayStartUtc, lt: dayEndUtc } },
//           select: { startMinutes: true, endMinutes: true },
//         });

//     const timeOffUtc: UtcIntv[] = timeOffRaw
//       .map(({ startMinutes, endMinutes }) => ({
//         start: wallMinutesToUtc(dateISO, startMinutes),
//         end: wallMinutesToUtc(dateISO, endMinutes),
//       }))
//       .filter((x) => x.end.getTime() > x.start.getTime());

//     // уже забронированные (строго [start,end) — без искусственных буферов)
//     const appts = await prisma.appointment.findMany({
//       where: {
//         status: { in: ["PENDING", "CONFIRMED"] },
//         ...(masterId ? { masterId } : {}),
//         startAt: { lt: dayEndUtc },
//         endAt: { gt: dayStartUtc },
//       },
//       select: { startAt: true, endAt: true },
//       orderBy: { startAt: "asc" },
//     });

//     const duration = service.durationMin || STEP_FALLBACK_MIN;
//     const step = duration;

//     const apptsUtc: UtcIntv[] = appts.map(({ startAt, endAt }) => ({
//       start: startAt,
//       end: endAt,
//     }));

//     const busyUtc = mergeUtcIntervals([...apptsUtc, ...timeOffUtc]);

//     // генерация слотов
//     const leadThresholdUtc = new Date(Date.now() + MIN_LEAD_MIN * 60_000);
//     const alignUp = (m: number, st: number): number => Math.ceil(m / st) * st;

//     const out: Slot[] = [];
//     let s = alignUp(startMin, step);
//     const lastStart = endMin - duration;

//     // пересечение для полуоткрытых [a,b) и [x,y): конфликт если a < y && x < b
//     const overlapsUtc = (aStart: Date, aEnd: Date): boolean =>
//       busyUtc.some((x) => aStart < x.end && x.start < aEnd);

//     while (s <= lastStart) {
//       const slotStartUtc = wallMinutesToUtc(dateISO, s);
//       const slotEndUtc = wallMinutesToUtc(dateISO, s + duration);

//       // скрываем слишком «близкие» к текущему моменту
//       if (slotStartUtc.getTime() < leadThresholdUtc.getTime()) {
//         s += step;
//         continue;
//       }

//       if (!overlapsUtc(slotStartUtc, slotEndUtc)) {
//         out.push({
//           start: slotStartUtc.toISOString(),
//           end: slotEndUtc.toISOString(),
//         });
//       }
//       s += step;
//     }

//     if (wantDebug) {
//       const payload: { slots: Slot[]; debug: DebugInfo } = {
//         slots: out,
//         debug: {
//           params: { serviceSlug, dateISO, masterId: masterId || undefined },
//           tz: ORG_TZ,
//           weekday,
//           workingHours: { startMin, endMin },
//           duration,
//           step,
//           timeOffUtc: timeOffUtc.map((t) => ({
//             start: t.start.toISOString(),
//             end: t.end.toISOString(),
//           })),
//           apptsUtc: apptsUtc.map((a) => ({
//             start: a.start.toISOString(),
//             end: a.end.toISOString(),
//           })),
//           busyUtc: busyUtc.map((b) => ({
//             start: b.start.toISOString(),
//             end: b.end.toISOString(),
//           })),
//         },
//       };
//       const res = NextResponse.json(payload, { status: 200 });
//       res.headers.set("Cache-Control", "no-store");
//       return res;
//     }

//     const res = NextResponse.json<Slot[]>(out, { status: 200 });
//     res.headers.set("Cache-Control", "no-store");
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
