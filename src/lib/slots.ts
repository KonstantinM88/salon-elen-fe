// src/lib/slots.ts
import { addMinutes, areIntervalsOverlapping, set } from "date-fns";

export type DayWindow = {
  start: Date; // локальное время начала рабочего окна дня
  end: Date;   // локальное время конца рабочего окна дня
};

export type Interval = { start: Date; end: Date };

export function makeDayWindow(date: Date, startMinutes: number, endMinutes: number): DayWindow {
  const start = set(date, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  const s = addMinutes(start, startMinutes);
  const e = addMinutes(start, endMinutes);
  return { start: s, end: e };
}

export function subtractBlocks(base: Interval[], blocks: Interval[]): Interval[] {
  // упрощенно: просто не выдаём слоты, которые пересекаются с блоками
  // (для сетки 10–30 минут этого достаточно)
  return base.filter(
    (it) => !blocks.some((b) => areIntervalsOverlapping(it, b, { inclusive: true }))
  );
}

export function generateGrid(
  win: DayWindow,
  stepMin: number,
  durationMin: number
): Interval[] {
  const res: Interval[] = [];
  let cursor = new Date(win.start);
  while (addMinutes(cursor, durationMin) <= win.end) {
    const start = new Date(cursor);
    const end = addMinutes(start, durationMin);
    res.push({ start, end });
    cursor = addMinutes(cursor, stepMin);
  }
  return res;
}

export function withBuffer(ints: Interval[], bufferMin: number): Interval[] {
  if (bufferMin <= 0) return ints;
  return ints.map((i) => ({ start: i.start, end: addMinutes(i.end, bufferMin) }));
}

export function excludeOverlaps(candidates: Interval[], busy: Interval[]): Interval[] {
  return candidates.filter(
    (slot) => !busy.some((b) => areIntervalsOverlapping(slot, b, { inclusive: true }))
  );
}

export function humanTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
