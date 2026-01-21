// src/app/booking/widget.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

/** ---------- TZ helpers (Europe/Berlin) ---------- */

const ORG_TZ: string =
  process.env.NEXT_PUBLIC_ORG_TZ ?? "Europe/Berlin";

/** Смещение TZ (мс) для заданного UTC-инстанта. Положительное для TZ восточнее UTC. */
function tzOffsetMs(tz: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(at);
  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = p.value;

  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );
  return asUTC - at.getTime(); // ключевой знак
}

/** UTC-время локальной полуночи организации для указанной даты (YYYY-MM-DD) */
function orgDayStart(dateISO: string, tz: string = ORG_TZ): Date {
  const utcMidnight = new Date(`${dateISO}T00:00:00Z`);
  const offset = tzOffsetMs(tz, utcMidnight);
  // локальная полночь (в координатах UTC)
  return new Date(utcMidnight.getTime() - offset);
}

/** Локальные минуты от полуночи (0..1439) по ISO-времени слота */
function minsFromIso(dateISO: string, iso: string, tz: string = ORG_TZ): number {
  const day0 = orgDayStart(dateISO, tz).getTime();
  const t = new Date(iso).getTime();
  return Math.round((t - day0) / 60_000);
}

/** ---------- Типы ---------- */

type ApiSlotRaw = {
  start: string; // ISO от API
  end: string;   // ISO от API
};

type Slot = ApiSlotRaw & {
  startMin: number; // вычисляем на клиенте
  endMin: number;   // вычисляем на клиенте
};

type Props = {
  serviceSlug: string;
  dateISO: string; // YYYY-MM-DD
  masterId?: string;
};

export default function BookingWidget({ serviceSlug, dateISO, masterId }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [picked, setPicked] = useState<Slot | null>(null);

  // Форматтер времени для кнопок
  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: ORG_TZ,
      }),
    []
  );

  useEffect(() => {
    setPicked(null); // сбрасываем выбор при смене параметров

    const q = new URLSearchParams({
      serviceSlug,
      dateISO,
      ...(masterId ? { masterId } : {}),
    });

    (async () => {
      const r = await fetch(`/api/availability?${q.toString()}`, { cache: "no-store" });
      const raw: ApiSlotRaw[] = await r.json();

      // Преобразуем к слоту с минутами (совместимо со старым сервером)
      const mapped: Slot[] = raw.map((s) => {
        const startMin = minsFromIso(dateISO, s.start);
        const endMin = minsFromIso(dateISO, s.end);
        return { ...s, startMin, endMin };
      });

      setSlots(mapped);
    })().catch(console.error);
  }, [serviceSlug, dateISO, masterId]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {slots.map((s) => {
          const label = timeFmt.format(new Date(s.start));
          const isPicked = picked?.start === s.start;

          return (
            <button
              key={`${s.start}-${s.end}`}
              onClick={() => setPicked(s)}
              className={`rounded px-3 py-2 border transition ${
                isPicked ? "bg-sky-600 text-white" : "bg-white text-black"
              }`}
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>

      {picked && (
        <form action="/booking" method="post" className="mt-3 space-y-2">
          {/* обязательные скрытые поля для сервера (совместимость) */}
          <input type="hidden" name="serviceSlug" value={serviceSlug} />
          <input type="hidden" name="dateISO" value={dateISO} />
          <input type="hidden" name="startMin" value={picked.startMin} />
          <input type="hidden" name="endMin" value={picked.endMin} />
          {masterId && <input type="hidden" name="masterId" value={masterId} />}

          {/* дополнительно передаём ISO — если на сервере уже есть поддержка ISO, он сможет их использовать */}
          <input type="hidden" name="startISO" value={picked.start} />
          <input type="hidden" name="endISO" value={picked.end} />

          {/* Остальные поля формы (имя/телефон/email/др и т.д.) должны быть выше по верстке формы страницы */}
          <button type="submit" className="rounded bg-emerald-600 text-white px-4 py-2">
            Записаться на {timeFmt.format(new Date(picked.start))}
          </button>
        </form>
      )}
    </div>
  );
}