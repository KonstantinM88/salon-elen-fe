// src/components/booking/TimeSlotsList.tsx
"use client";

import React, { JSX } from "react";
import TimeSlot from "./TimeSlot";
import { isPastSlot } from "@/lib/slotGuards";
import { Temporal } from "@js-temporal/polyfill";
import { ORG_TZ } from "@/lib/orgTime";


export interface UiSlot {
  id: string;
  /** UTC-границы слота (Date — именно объект, не строка) */
  start: Date;
  end: Date;
  /**
   * Признак занятости, как отдал бэкенд.
   * Если API отдает 'available', поддержим и его.
   */
  busy?: boolean;
  available?: boolean;
  /** Опционально — готовая подпись; если нет, сформируем сами. */
  label?: string;
}

export interface TimeSlotsListProps {
  dateISO: string;               // YYYY-MM-DD
  slots: UiSlot[];               // как приходят после парсинга ответа API
  selectedSlotId?: string | null;
  onSelect: (slotId: string) => void;
}

/** Формат 'HH:MM—HH:MM' в TZ салона (DST учитывается Temporal'ом). */
function labelFromUtc(startUtc: Date, endUtc: Date): string {
  const z = (d: Date) =>
    Temporal.Instant.fromEpochMilliseconds(d.getTime()).toZonedDateTimeISO(ORG_TZ);
  const s = z(startUtc);
  const e = z(endUtc);
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${pad(s.hour)}:${pad(s.minute)}—${pad(e.hour)}:${pad(e.minute)}`;
}

export default function TimeSlotsList({
  dateISO,
  slots,
  selectedSlotId,
  onSelect,
}: TimeSlotsListProps): JSX.Element {
  // 1) Удаляем слоты, которые бэкенд пометил занятыми:
  const notBusy = slots.filter((s) => {
    // поддерживаем обе семантики: busy === true  или available === false
    const isBusy = s.busy === true || s.available === false;
    return !isBusy;
  });

  // 2) Прячем прошедшие слоты только для «сегодня»:
  const visible = notBusy.filter((s) => !isPastSlot(dateISO, s.start));

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((s) => (
        <TimeSlot
          key={s.id}
          label={s.label ?? labelFromUtc(s.start, s.end)}
          isSelected={selectedSlotId === s.id}
          onSelect={() => onSelect(s.id)}
        />
      ))}

      {visible.length === 0 && (
        <div className="text-sm opacity-70">
          На выбранную дату свободных слотов нет.
        </div>
      )}
    </div>
  );
}
