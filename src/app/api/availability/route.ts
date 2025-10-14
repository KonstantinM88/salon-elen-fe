// src/app/api/availability/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { orgDayRange } from "@/lib/orgTime";
import { addMinutes } from "date-fns";

type Slot = { start: string; end: string };

const STEP_FALLBACK_MIN = 10;
const BREAK_AFTER_MIN = 10;

function isValidISODate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

function weekdayFromISO(dateISO: string): number {
  // день недели считаем от локальной полуночи TZ салона (orgDayRange),
  // а здесь достаточно от ISO-строки:
  return new Date(`${dateISO}T00:00:00Z`).getUTCDay();
}

type Intv = { start: number; end: number };

function mergeIntervals(list: Intv[]): Intv[] {
  if (!list.length) return [];
  const sorted = [...list].sort((a, b) => a.start - b.start);
  const out: Intv[] = [];
  let cur = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i += 1) {
    const it = sorted[i];
    if (it.start <= cur.end) cur.end = Math.max(cur.end, it.end);
    else {
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

    // Границы дня в UTC по TZ салона — ключ к отсутствию сдвигов.
    const { start: dayStart, end: dayEnd } = orgDayRange(dateISO);
    const weekday = weekdayFromISO(dateISO);

    let startMin = 0;
    let endMin = 0;

    if (masterId) {
      const wh = await prisma.masterWorkingHours.findUnique({
        where: { masterId_weekday: { masterId, weekday } },
        select: { isClosed: true, startMinutes: true, endMinutes: true },
      });
      if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
      startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
      endMin = Math.max(startMin, wh.endMinutes);
    } else {
      const wh = await prisma.workingHours.findUnique({
        where: { weekday },
        select: { isClosed: true, startMinutes: true, endMinutes: true },
      });
      if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });
      startMin = Math.max(0, Math.min(24 * 60, wh.startMinutes));
      endMin = Math.max(startMin, wh.endMinutes);
    }

    const timeOff: { startMinutes: number; endMinutes: number }[] = masterId
      ? await prisma.masterTimeOff.findMany({
          where: { masterId, date: { gte: dayStart, lt: dayEnd } },
          select: { startMinutes: true, endMinutes: true },
        })
      : await prisma.timeOff.findMany({
          where: { date: { gte: dayStart, lt: dayEnd } },
          select: { startMinutes: true, endMinutes: true },
        });

    const appts = await prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lt: dayEnd },
        endAt: { gt: dayStart },
        ...(masterId ? { masterId } : {}),
      },
      select: { startAt: true, endAt: true },
      orderBy: { startAt: "asc" },
    });

    const busyRaw: Intv[] = [
      ...appts.map(({ startAt, endAt }) => {
        const s = Math.floor((startAt.getTime() - dayStart.getTime()) / 60000);
        const e =
          Math.ceil((endAt.getTime() - dayStart.getTime()) / 60000) +
          BREAK_AFTER_MIN;
        return { start: s, end: e };
      }),
      ...timeOff.map((t) => ({ start: t.startMinutes, end: t.endMinutes })),
    ]
      .map((b) => ({
        start: Math.max(b.start, startMin),
        end: Math.min(b.end, endMin),
      }))
      .filter((b) => b.end > b.start);

    const busy = mergeIntervals(busyRaw);

    const duration = service.durationMin;
    const step = duration;

    const align = (m: number, st: number): number => Math.ceil(m / st) * st;

    const out: Slot[] = [];
    let s = align(startMin, step);
    const lastStart = endMin - duration;

    const overlaps = (a: number, b: number): boolean =>
      busy.some((x) => x.start < b && a < x.end);

    while (s <= lastStart) {
      const e = s + duration;
      if (!overlaps(s, e)) {
        out.push({
          start: addMinutes(dayStart, s).toISOString(),
          end: addMinutes(dayStart, e).toISOString(),
        });
      }
      s += step || STEP_FALLBACK_MIN;
    }

    return NextResponse.json<Slot[]>(out, { status: 200 });
  } catch (e) {
    const msg =
      process.env.NODE_ENV === "development"
        ? `availability error: ${String(e)}`
        : "Internal error";
    console.error(msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}







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
