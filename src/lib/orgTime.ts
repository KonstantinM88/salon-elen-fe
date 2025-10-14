// src/lib/orgTime.ts
// Единая TZ салона: читаем из любого из переменных и даём дефолт
export const ORG_TZ =
  process.env.ORG_TZ ||
  process.env.SALON_TZ ||
  process.env.NEXT_PUBLIC_ORG_TZ ||
  "Europe/Berlin";

/**
 * formatToParts → достаём локальные компоненты времени для UTC-инстанта
 */
function partsInTZ(d: Date, tz: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p = fmt.formatToParts(d);
  const get = (t: string) => Number(p.find((x) => x.type === t)?.value ?? "0");
  return {
    y: get("year"),
    m: get("month"),
    d: get("day"),
    hh: get("hour"),
    mm: get("minute"),
  };
}

/**
 * Прибить гвоздями нужную локальную дату/время (стенная «Europe/Berlin»)
 * к реальному UTC-инстанту. Работает без сторонних библиотек.
 *
 * Алгоритм:
 * 1) Берём начальное предположение как Date.UTC(Y,M,D,h,m).
 * 2) Смотрим, во что этот UTC-инстант превращается в нужной TZ.
 * 3) Считаем разницу с «желанной» локальной датой/временем и одним шагом
 *    корректируем UTC (обычно сходится за 1 шаг, включая дни с DST).
 */
function wallToUtcInstant(
  tz: string,
  y: number,
  m: number, // 1..12
  d: number,
  hh: number,
  mm: number
): Date {
  // Предположение: это уже нужная локальная дата как будто бы в UTC
  let utc = new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0));

  // Посмотрим, как она отображается в tz
  const seen = partsInTZ(utc, tz);

  // Считаем «разницу в минутах» с поправкой на смещение по дням/месяцам/годам
  const wantTotal = (((y * 13 + m) * 32 + d) * 24 + hh) * 60 + mm;
  const seenTotal = (((seen.y * 13 + seen.m) * 32 + seen.d) * 24 + seen.hh) * 60 + seen.mm;
  const deltaMin = wantTotal - seenTotal;

  if (deltaMin !== 0) {
    utc = new Date(utc.getTime() - deltaMin * 60_000);
  }

  return utc;
}

/** YYYY-MM-DD → {y,m,d} */
function parseISODate(iso: string): { y: number; m: number; d: number } {
  const [Y, M, D] = iso.split("-").map(Number);
  return { y: Y, m: M, d: D };
}

/** YYYY-MM-DD + N дней → YYYY-MM-DD */
function addDaysISO(iso: string, days: number): string {
  const { y, m, d } = parseISODate(iso);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const y2 = dt.getUTCFullYear();
  const m2 = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d2 = String(dt.getUTCDate()).padStart(2, "0");
  return `${y2}-${m2}-${d2}`;
}

/**
 * Возвращает границы «организационного дня» в UTC
 * (от локальной полуночи до следующей локальной полуночи).
 */
export function orgDayRange(dateISO: string): { start: Date; end: Date } {
  const { y, m, d } = parseISODate(dateISO);
  const start = wallToUtcInstant(ORG_TZ, y, m, d, 0, 0);
  const nextISO = addDaysISO(dateISO, 1);
  const { y: y2, m: m2, d: d2 } = parseISODate(nextISO);
  const end = wallToUtcInstant(ORG_TZ, y2, m2, d2, 0, 0);
  return { start, end };
}

/**
 * «Стенные» минуты дня (в TZ салона) → UTC Date.
 * minutes: 0..1440 (например, 9:30 = 570).
 */
export function wallMinutesToUtc(dateISO: string, minutes: number): Date {
  const { y, m, d } = parseISODate(dateISO);
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return wallToUtcInstant(ORG_TZ, y, m, d, hh, mm);
}
