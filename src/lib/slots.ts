// src/lib/slots.ts
// Утилиты для работы со слотами и занятостью. Без any.

export type IntervalMin = {
  start: number; // минуты от начала локального дня [0..1440)
  end: number;   // минуты от начала локального дня, строго > start
};

export type SlotISO = {
  start: string; // ISO в UTC
  end: string;   // ISO в UTC
};

export function assertInterval(i: IntervalMin): void {
  if (!(Number.isFinite(i.start) && Number.isFinite(i.end))) {
    throw new Error("Interval must be finite numbers");
  }
  if (i.start < 0 || i.end < 0 || i.start >= 24 * 60 || i.end > 24 * 60) {
    throw new Error("Interval minutes must be within [0, 1440]");
  }
  if (i.end <= i.start) {
    throw new Error("Interval end must be > start");
  }
}

/**
 * Перекрытие для полуоткрытых интервалов [start, end)
 * Конфликт есть только при реальном пересечении.
 */
export function overlaps(a: IntervalMin, b: IntervalMin): boolean {
  return a.start < b.end && a.end > b.start;
}

/**
 * Слияние пересекающихся интервалов.
 * ВАЖНО: соприкасающиеся (a.end === b.start) НЕ склеиваются.
 */
export function mergeBusyIntervals(busy: IntervalMin[]): IntervalMin[] {
  if (busy.length === 0) return [];

  const sorted = [...busy]
    .map((x) => ({ start: Math.floor(x.start), end: Math.floor(x.end) }))
    .sort((i1, i2) => i1.start - i2.start);

  const merged: IntervalMin[] = [];
  for (const cur of sorted) {
    assertInterval(cur);
    const last = merged[merged.length - 1];
    if (!last) {
      merged.push({ ...cur });
      continue;
    }
    // Если текущий начинается ПОСЛЕ или РОВНО в конце предыдущего — это НОВЫЙ блок.
    if (cur.start >= last.end) {
      merged.push({ ...cur });
    } else {
      // Есть реальное перекрытие — расширяем.
      last.end = Math.max(last.end, cur.end);
    }
  }
  return merged;
}

/**
 * Генерация свободных слотов внутри рабочего окна, уважая занятость.
 * Шагаем с шагом stepMin (обычно = durationMin или меньше, например 15).
 * Итоговые интервалы — [start, end), без конфликтов с busy.
 */
export function generateFreeSlots(
  windowStartMin: number,
  windowEndMin: number,
  durationMin: number,
  busy: IntervalMin[],
  stepMin: number
): IntervalMin[] {
  if (durationMin <= 0) throw new Error("durationMin must be > 0");
  if (stepMin <= 0) throw new Error("stepMin must be > 0");
  if (windowEndMin <= windowStartMin) return [];

  const mergedBusy = mergeBusyIntervals(busy);
  const result: IntervalMin[] = [];

  for (let s = windowStartMin; s + durationMin <= windowEndMin; s += stepMin) {
    const e = s + durationMin;
    const candidate: IntervalMin = { start: s, end: e };
    let conflict = false;
    for (const b of mergedBusy) {
      if (overlaps(candidate, b)) {
        conflict = true;
        break;
      }
    }
    if (!conflict) result.push(candidate);
  }

  return result;
}

/**
 * Преобразование минут локального дня в UTC ISO
 * @param dateISO YYYY-MM-DD (локальный день салона)
 * @param tz IANA TZ, например 'Europe/Berlin'
 */
export function dayMinuteToUTCISO(dateISO: string, minute: number, tz: string): string {
  // Создаём локальное время (TZ) и сразу сериализуем в UTC ISO.
  // Без внешних зависимостей: используем Intl + вычисление offset.
  const local = new Date(`${dateISO}T00:00:00`);
  // Вычислим смещение для TZ на конкретную дату (минуты)
  const offsetMin = tzOffsetMinutes(dateISO, tz);
  // Превращаем локальные минуты в UTC миллисекунды:
  // UTC = локал - offset
  const utcMs = local.getTime() + (minute - offsetMin) * 60_000;
  return new Date(utcMs).toISOString();
}

/**
 * Грубая оценка смещения TZ в минутах на указанную дату (без зависимостей).
 * Делается через форматирование времени в данной TZ и сравнение с UTC.
 */
export function tzOffsetMinutes(dateISO: string, tz: string): number {
  const dt = new Date(`${dateISO}T00:00:00Z`); // 00:00 UTC
  // Локальное представление этой же UTC-времени в tz:
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(dt);

  // Соберём локальную дату-время (какой локальный час будет у UTC полуночи)
  const get = (type: string) => fmt.find((p) => p.type === type)?.value ?? "00";
  const yyyy = get("year");
  const mm = get("month");
  const dd = get("day");
  const HH = get("hour");
  const MM = get("minute");

  // Это локальное отображение UTC-полуночи (в TZ). Узнаем разницу.
  const localOfUTC = Date.parse(`${yyyy}-${mm}-${dd}T${HH}:${MM}:00`);
  const utcOfUTC = Date.parse(`${dateISO}T00:00:00Z`);
  const diffMs = localOfUTC - utcOfUTC; // >0 если TZ восточнее
  return Math.round(diffMs / 60000);
}

/**
 * Упаковка в ISO-слоты (UTC)
 */
export function packSlotsISO(
  dateISO: string,
  slots: IntervalMin[],
  tz: string
): SlotISO[] {
  return slots.map((s) => ({
    start: dayMinuteToUTCISO(dateISO, s.start, tz),
    end: dayMinuteToUTCISO(dateISO, s.end, tz),
  }));
}





//-------------работало до без слияния времени
// // src/lib/slots.ts
// import { addMinutes, areIntervalsOverlapping, set } from "date-fns";

// export type DayWindow = {
//   start: Date; // локальное время начала рабочего окна дня
//   end: Date;   // локальное время конца рабочего окна дня
// };

// export type Interval = { start: Date; end: Date };

// export function makeDayWindow(date: Date, startMinutes: number, endMinutes: number): DayWindow {
//   const start = set(date, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
//   const s = addMinutes(start, startMinutes);
//   const e = addMinutes(start, endMinutes);
//   return { start: s, end: e };
// }

// export function subtractBlocks(base: Interval[], blocks: Interval[]): Interval[] {
//   // упрощенно: просто не выдаём слоты, которые пересекаются с блоками
//   // (для сетки 10–30 минут этого достаточно)
//   return base.filter(
//     (it) => !blocks.some((b) => areIntervalsOverlapping(it, b, { inclusive: true }))
//   );
// }

// export function generateGrid(
//   win: DayWindow,
//   stepMin: number,
//   durationMin: number
// ): Interval[] {
//   const res: Interval[] = [];
//   let cursor = new Date(win.start);
//   while (addMinutes(cursor, durationMin) <= win.end) {
//     const start = new Date(cursor);
//     const end = addMinutes(start, durationMin);
//     res.push({ start, end });
//     cursor = addMinutes(cursor, stepMin);
//   }
//   return res;
// }

// export function withBuffer(ints: Interval[], bufferMin: number): Interval[] {
//   if (bufferMin <= 0) return ints;
//   return ints.map((i) => ({ start: i.start, end: addMinutes(i.end, bufferMin) }));
// }

// export function excludeOverlaps(candidates: Interval[], busy: Interval[]): Interval[] {
//   return candidates.filter(
//     (slot) => !busy.some((b) => areIntervalsOverlapping(slot, b, { inclusive: true }))
//   );
// }

// export function humanTime(d: Date): string {
//   return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// }
