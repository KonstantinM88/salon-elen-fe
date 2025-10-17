// src/lib/slotGuards.ts
import { Temporal } from "@js-temporal/polyfill";
import { ORG_TZ } from "@/lib/orgTime";

/**
 * Возвращает true, если слот уже в прошлом И выбранная дата — сегодня (в TZ салона).
 * Для будущих или прошедших дат (не сегодня) слот не считаем «прошедшим».
 */
export function isPastSlot(dateISO: string, startUtc: Date): boolean {
  const now = Temporal.Now.instant();
  const nowZ = now.toZonedDateTimeISO(ORG_TZ);

  const slotZ = Temporal.Instant.fromEpochMilliseconds(
    startUtc.getTime()
  ).toZonedDateTimeISO(ORG_TZ);

  const sameDay =
    slotZ.year === nowZ.year &&
    slotZ.month === nowZ.month &&
    slotZ.day === nowZ.day;

  if (!sameDay) return false;
  return startUtc.getTime() < now.epochMilliseconds;
}
