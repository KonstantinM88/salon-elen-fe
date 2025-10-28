// src/lib/datetime.ts

const ORG_TZ = process.env.NEXT_PUBLIC_ORG_TZ || 'Europe/Berlin';

// === Обычные даты (например createdAt) — по часовому поясу салона ===
export function fmtDT(d: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: ORG_TZ,
    hour12: false,
  }).format(d);
}

export function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeZone: ORG_TZ,
  }).format(d);
}

export function fmtTime(d: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ORG_TZ,
    hour12: false,
  }).format(d);
}

function tzOffsetMs(zone: string, d: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(dtf.formatToParts(d).map(p => [p.type, p.value]));
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

/**
 * Хот-фикс отображения времени визита.
 * См. ваше исходное пояснение.
 */
function wallClockFromOrgZone(d: Date): Date {
  const off = tzOffsetMs(ORG_TZ, d);
  return new Date(d.getTime() - off);
}

export function fmtVisitDate(d: Date) {
  const w = wallClockFromOrgZone(d);
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeZone: 'UTC',
  }).format(w);
}

export function fmtVisitTime(d: Date) {
  const w = wallClockFromOrgZone(d);
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: false,
  }).format(w);
}



//------------------27/10
// /** Возвращает UTC-ISO начала дня и конца дня, если календарный день задан для TZ салона */
// export function buildDayUtcRange(
//     dateISO: string,
//     tz: string
//   ): { dayStartUtc: string; dayEndUtc: string; weekday: number } {
//     // создаём «локальную полночь» в TZ салона и переводим в UTC
//     const startLocal = new Date(`${dateISO}T00:00:00`);
//     const offsetMin = tzOffsetMinutes(startLocal, tz);
//     const dayStartUtcDate = new Date(startLocal.getTime() - offsetMin * 60000);
//     const dayEndUtcDate = new Date(dayStartUtcDate.getTime() + 24 * 60 * 60000);
  
//     // weekday считаем как для TZ салона
//     const weekday = new Date(dayStartUtcDate.getTime() + offsetMin * 60000).getDay();
  
//     return {
//       dayStartUtc: dayStartUtcDate.toISOString(),
//       dayEndUtc: dayEndUtcDate.toISOString(),
//       weekday,
//     };
//   }
  
//   /** Перевод «минут от локальной полуночи TZ» в UTC-ISO */
//   export function minutesToUtcISO(dayStartUtcISO: string, minutesFromMidnight: number): string {
//     const base = new Date(dayStartUtcISO).getTime();
//     return new Date(base + minutesFromMidnight * 60000).toISOString();
//   }
  
//   /** Текущее «сейчас» в TZ салона, но в виде UTC-ISO (для отсечения прошлого) */
//   export function tzNowUtcISO(tz: string): string {
//     const now = new Date();
//     const offsetMin = tzOffsetMinutes(now, tz);
//     const utcTime = new Date(now.getTime() - offsetMin * 60000);
//     return utcTime.toISOString();
//   }
  
//   /** Оценка смещения временной зоны (минуты) для конкретной даты без внешних библиотек */
//   export function tzOffsetMinutes(at: Date, tz: string): number {
//     const partsTz = new Intl.DateTimeFormat("en-US", {
//       timeZone: tz,
//       hour12: false,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     }).formatToParts(at);
  
//     const partsUtc = new Intl.DateTimeFormat("en-US", {
//       timeZone: "UTC",
//       hour12: false,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     }).formatToParts(at);
  
//     const hTz = toNum(partsTz, "hour");
//     const mTz = toNum(partsTz, "minute");
//     const sTz = toNum(partsTz, "second");
  
//     const hUtc = toNum(partsUtc, "hour");
//     const mUtc = toNum(partsUtc, "minute");
//     const sUtc = toNum(partsUtc, "second");
  
//     // смещение = (локальное время(TZ) - UTC) в минутах
//     const diffSec = (hTz * 3600 + mTz * 60 + sTz) - (hUtc * 3600 + mUtc * 60 + sUtc);
//     // нормализуем в диапазон [-12h; +14h]
//     const normalized = ((diffSec + 18 * 3600) % (24 * 3600)) - 18 * 3600;
//     return Math.round(normalized / 60);
//   }
  
//   function toNum(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
//     const val = parts.find((p) => p.type === type)?.value ?? "0";
//     return Number(val);
//   }
  
//   /** Сумма длительностей (на будущее — если будет несколько услуг) */
//   export function sumDurationsMin(list: number[]): number {
//     return list.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
//   }
  


// /** Возвращает UTC-ISO начала дня и конца дня, если календарный день задан для TZ салона */
// export function buildDayUtcRange(dateISO: string, tz: string): {
//     dayStartUtc: string;
//     dayEndUtc: string;
//     weekday: number; // 0=вс, 1=пн, ... 6=сб
//   } {
//     // создаём «локальную полночь» в TZ салона и переводим в UTC
//     const startLocal = new Date(`${dateISO}T00:00:00`);
//     // получаем сдвиг TZ для этой даты
//     const offsetMin = tzOffsetMinutes(startLocal, tz);
//     const dayStartUtcDate = new Date(startLocal.getTime() - offsetMin * 60000);
//     const dayEndUtcDate = new Date(dayStartUtcDate.getTime() + 24 * 60 * 60000);
  
//     // weekday считаем как для TZ салона
//     const weekday = new Date(dayStartUtcDate.getTime() + offsetMin * 60000).getDay();
  
//     return {
//       dayStartUtc: dayStartUtcDate.toISOString(),
//       dayEndUtc: dayEndUtcDate.toISOString(),
//       weekday,
//     };
//   }
  
//   /** Перевод «минут от локальной полуночи TZ» в UTC-ISO */
//   export function minutesToUtcISO(dayStartUtcISO: string, minutesFromMidnight: number): string {
//     const base = new Date(dayStartUtcISO).getTime();
//     return new Date(base + minutesFromMidnight * 60000).toISOString();
//   }
  
//   /** Текущее «сейчас» в TZ салона, но в виде UTC-ISO (для отсечения прошлого) */
//   export function tzNowUtcISO(tz: string): string {
//     const now = new Date();
//     const offsetMin = tzOffsetMinutes(now, tz);
//     const utcTime = new Date(now.getTime() - offsetMin * 60000);
//     return utcTime.toISOString();
//   }
  
//   /** Оценка смещения временной зоны (минуты) для конкретной даты без внешних библиотек */
//   export function tzOffsetMinutes(at: Date, tz: string): number {
//     // Интерпретируем ту же «стеновую» дату в нужной TZ и в UTC, сравниваем часы/минуты
//     // Берём компоненты в TZ
//     const partsTz = new Intl.DateTimeFormat("en-US", {
//       timeZone: tz,
//       hour12: false,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     }).formatToParts(at);
  
//     const partsUtc = new Intl.DateTimeFormat("en-US", {
//       timeZone: "UTC",
//       hour12: false,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     }).formatToParts(at);
  
//     const hTz = toNum(partsTz, "hour");
//     const mTz = toNum(partsTz, "minute");
//     const sTz = toNum(partsTz, "second");
  
//     const hUtc = toNum(partsUtc, "hour");
//     const mUtc = toNum(partsUtc, "minute");
//     const sUtc = toNum(partsUtc, "second");
  
//     // смещение = (локальное время(TZ) - UTC) в минутах
//     const diffSec = (hTz * 3600 + mTz * 60 + sTz) - (hUtc * 3600 + mUtc * 60 + sUtc);
//     // нормализуем в диапазон [-12h; +14h] с учётом переходов
//     const normalized = ((diffSec + 18 * 3600) % (24 * 3600)) - 18 * 3600;
//     return Math.round(normalized / 60);
//   }
  
//   function toNum(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
//     const val = parts.find((p) => p.type === type)?.value ?? "0";
//     return Number(val);
//   }
  
//   /** Сумма длительностей (на будущее — если будет несколько услуг) */
//   export function sumDurationsMin(list: number[]): number {
//     return list.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0);
//   }
  