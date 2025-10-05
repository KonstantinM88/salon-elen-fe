import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** минуты от начала дня */
type Slot = { start: number; end: number };

/** шаг сетки (мин) и пауза после каждой записи (мин) */
const STEP_MIN = 10;
const BREAK_AFTER_MIN = 10;

/* ---------- helpers ---------- */

/** округление к шагу */
function ceilToStep(min: number, step: number): number {
  return Math.ceil(min / step) * step;
}
function floorToStep(min: number, step: number): number {
  return Math.floor(min / step) * step;
}

function mergeBusy(input: Slot[]): Slot[] {
  if (input.length === 0) return [];
  const arr = [...input].sort((a, b) => a.start - b.start);
  const out: Slot[] = [];
  let cur = { ...arr[0] };
  for (let i = 1; i < arr.length; i += 1) {
    const it = arr[i];
    if (it.start <= cur.end) cur.end = Math.max(cur.end, it.end);
    else {
      out.push(cur);
      cur = { ...it };
    }
  }
  out.push(cur);
  return out;
}

/** work \ busy -> free */
function subtractBusy(work: Slot, busy: Slot[]): Slot[] {
  if (busy.length === 0) return [work];
  const merged = mergeBusy(busy);
  const free: Slot[] = [];
  let start = work.start;

  for (const b of merged) {
    if (b.start > start) free.push({ start, end: Math.min(b.start, work.end) });
    start = Math.max(start, b.end);
    if (start >= work.end) break;
  }
  if (start < work.end) free.push({ start, end: work.end });
  return free;
}

/** разложить free на слоты фиксированной длительности */
function generateSlots(free: Slot[], duration: number, step: number): Slot[] {
  const out: Slot[] = [];
  for (const f of free) {
    let s = ceilToStep(f.start, step);
    const lastStart = f.end - duration;
    while (s <= lastStart) {
      out.push({ start: s, end: s + duration });
      s += step;
    }
  }
  return out;
}

/** YYYY-MM-DD */
function isValidISODate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const test = new Date(`${d}T00:00:00`);
  return Number.isFinite(test.getTime());
}

/** локальные сутки */
function localDayRange(dateISO: string): { start: Date; end: Date } {
  const start = new Date(`${dateISO}T00:00:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/* ---------- GET ---------- */

export async function GET(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const serviceSlug = url.searchParams.get("serviceSlug") ?? "";
    const dateISO = url.searchParams.get("dateISO") ?? "";

    if (!serviceSlug || !dateISO || !isValidISODate(dateISO)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Нужна длительность и активность услуги
    const service = await prisma.service.findUnique({
      where: { slug: serviceSlug },
      select: { durationMin: true, isActive: true },
    });
    if (!service || !service.isActive || !Number.isFinite(service.durationMin)) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Рабочее окно по дню недели (локально)
    const dayStartLocal = new Date(`${dateISO}T00:00:00`);
    const weekday = dayStartLocal.getDay(); // 0..6 (вс..сб)

    const wh = await prisma.workingHours.findUnique({
      where: { weekday },
      select: { isClosed: true, startMinutes: true, endMinutes: true },
    });
    if (!wh || wh.isClosed) return NextResponse.json<Slot[]>([], { status: 200 });

    const workStart = floorToStep(
      Math.max(0, Math.min(24 * 60, wh.startMinutes)),
      STEP_MIN
    );
    const workEnd = ceilToStep(
      Math.max(workStart, wh.endMinutes),
      STEP_MIN
    );

    if (workEnd - workStart < service.durationMin) {
      return NextResponse.json<Slot[]>([], { status: 200 });
    }
    const workWindow: Slot = { start: workStart, end: workEnd };

    // Берём все записи (PENDING/CONFIRMED) за сутки: блокируем время глобально
    const { start: dayStart, end: dayEnd } = localDayRange(dateISO);
    const busyRaw = await prisma.appointment.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lt: dayEnd },
        endAt: { gt: dayStart },
      },
      select: { startAt: true, endAt: true },
      orderBy: { startAt: "asc" },
    });

    // В минуты от начала дня (+10 мин «хвост» паузы), затем обрезаем рабочим окном
    const busy: Slot[] = busyRaw
      .map(({ startAt, endAt }) => {
        const startMin = Math.floor((startAt.getTime() - dayStart.getTime()) / 60000);
        const endMin = Math.ceil((endAt.getTime() - dayStart.getTime()) / 60000) + BREAK_AFTER_MIN;
        return { start: startMin, end: endMin };
      })
      .filter(b => Number.isFinite(b.start) && Number.isFinite(b.end) && b.end > b.start)
      .map(b => ({
        start: Math.max(b.start, workWindow.start),
        end: Math.min(b.end, workWindow.end),
      }))
      .filter(b => b.end > b.start);

    const free = subtractBusy(workWindow, busy);
    const slots = generateSlots(free, service.durationMin, STEP_MIN);

    // уникализируем
    const uniq = new Map<string, Slot>();
    for (const s of slots) {
      if (Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start) {
        uniq.set(`${s.start}-${s.end}`, s);
      }
    }
    const clean = [...uniq.values()].sort((a, b) => a.start - b.start);

    return NextResponse.json<Slot[]>(clean, { status: 200 });
  } catch (e) {
    const msg =
      process.env.NODE_ENV === "development"
        ? `availability error: ${String(e)}`
        : "Internal error";
    console.error(msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
