// Единые форматтеры дат/времени

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

/**
 * Текущий сдвиг зоны для заданной даты (в мс).
 * Трюк через Intl: получаем компоненты в зоне и собираем UTC-время,
 * разница и будет смещением.
 */
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
 *
 * Если в БД оказались значения, уже «сдвинутые» зоной (например, 17:00Z,
 * а человек записывался на 15:00 по Берлину), то мы вычитаем сдвиг зоны
 * и выводим результат в UTC — так на экране будет 15:00.
 *
 * Это не меняет данные в БД и не влияет на логику Prisma.
 */
function wallClockFromOrgZone(d: Date): Date {
  const off = tzOffsetMs(ORG_TZ, d);     // например +02:00 -> 7200000
  return new Date(d.getTime() - off);    // 17:00Z -> 15:00Z
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
