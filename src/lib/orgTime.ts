// src/lib/orgTime.ts
// Единая точка работы со временем.
// Все расчёты делаем в часовой зоне салона, в БД — только UTC.
// Реализация на Temporal (@js-temporal/polyfill), без date-fns-tz.

import { Temporal } from "@js-temporal/polyfill";

/** Часовой пояс салона. Можно переопределить через SALON_TZ. */
export const ORG_TZ: string = (process.env.SALON_TZ || "Europe/Berlin") as string;

/** YYYY-MM-DD */
export function isYmd(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

/** Левый паддинг для минут/часов. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Полуночь локального дня (Europe/Berlin) → UTC-инстанты начала/конца суток. */
export function orgDayRange(dateISO: string): { start: Date; end: Date } {
  if (!isYmd(dateISO)) {
    throw new Error(`orgDayRange(): dateISO must be YYYY-MM-DD, got "${dateISO}"`);
  }

  const pd = Temporal.PlainDate.from(dateISO);
  const pdtMidnight = Temporal.PlainDateTime.from({
    year: pd.year,
    month: pd.month,
    day: pd.day,
    hour: 0,
    minute: 0,
    second: 0,
  });

  // ✅ PlainDateTime.toZonedDateTime(timeZone)
  const zStart = pdtMidnight.toZonedDateTime(ORG_TZ);
  const zEnd = zStart.add({ days: 1 });

  const start = new Date(zStart.toInstant().epochMilliseconds);
  const end = new Date(zEnd.toInstant().epochMilliseconds);
  return { start, end };
}

/**
 * Локальные «минуты от полуночи» (стены) → UTC-инстант.
 * Учитывает DST, т.к. считает в таймзоне и только затем проецирует в UTC.
 */
export function wallMinutesToUtc(dateISO: string, minutesFromMidnight: number): Date {
  if (!isYmd(dateISO)) {
    throw new Error(`wallMinutesToUtc(): dateISO must be YYYY-MM-DD, got "${dateISO}"`);
  }
  if (!Number.isFinite(minutesFromMidnight) || minutesFromMidnight < 0) {
    throw new Error(`wallMinutesToUtc(): minutes must be >= 0, got "${minutesFromMidnight}"`);
  }

  const hours = Math.floor(minutesFromMidnight / 60);
  const mins = minutesFromMidnight % 60;

  const pd = Temporal.PlainDate.from(dateISO);
  const pt = Temporal.PlainTime.from(`${pad2(hours)}:${pad2(mins)}:00`);

  const zdt = Temporal.PlainDateTime.from({
    year: pd.year,
    month: pd.month,
    day: pd.day,
    hour: pt.hour,
    minute: pt.minute,
    second: 0,
  }).toZonedDateTime(ORG_TZ);

  return new Date(zdt.toInstant().epochMilliseconds);
}

/** Обратное преобразование: UTC-инстант → локальные минуты от полуночи данного dateISO. */
export function utcToWallMinutes(dateISO: string, utcInstant: Date): number {
  if (!isYmd(dateISO)) {
    throw new Error(`utcToWallMinutes(): dateISO must be YYYY-MM-DD, got "${dateISO}"`);
  }
  const ms = utcInstant.getTime();
  if (!Number.isFinite(ms)) {
    throw new Error("utcToWallMinutes(): invalid Date");
  }

  const zdt = Temporal.Instant.fromEpochMilliseconds(ms).toZonedDateTimeISO(ORG_TZ);
  const pd = Temporal.PlainDate.from(dateISO);

  const sameDay = zdt.year === pd.year && zdt.month === pd.month && zdt.day === pd.day;
  if (!sameDay) {
    // возвращаем минуты этого инстанта в его локальном дне
    return zdt.hour * 60 + zdt.minute;
  }
  return zdt.hour * 60 + zdt.minute;
}

/** Сборка UTC-интервала слота из локальных минут. Полуоткрытый интервал [start,end). */
export function makeUtcSlot(
  dateISO: string,
  startMin: number,
  endMin: number
): { start: Date; end: Date } {
  if (endMin <= startMin) {
    throw new Error("makeUtcSlot(): endMin must be > startMin");
  }
  const start = wallMinutesToUtc(dateISO, startMin);
  const end = wallMinutesToUtc(dateISO, endMin);
  return { start, end };
}

/** Проверка пересечения полуоткрытых интервалов [aStart,aEnd) и [bStart,bEnd). */
export function overlapUtc(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Форматирование диапазона в локали салона (для этикеток на UI). */
export function formatWallRangeLabel(startUtc: Date, endUtc: Date): string {
  const s = Temporal.Instant.fromEpochMilliseconds(startUtc.getTime()).toZonedDateTimeISO(ORG_TZ);
  const e = Temporal.Instant.fromEpochMilliseconds(endUtc.getTime()).toZonedDateTimeISO(ORG_TZ);

  const fmt = (z: Temporal.ZonedDateTime): string => `${pad2(z.hour)}:${pad2(z.minute)}`;
  return `${fmt(s)}—${fmt(e)}`; // например: 17:00—17:30
}
