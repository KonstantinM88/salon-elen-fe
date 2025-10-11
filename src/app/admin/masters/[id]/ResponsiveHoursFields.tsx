"use client";

import { useEffect, useMemo, useState } from "react";

type DayRow = {
  value: number;        // 0..6
  full: string;         // Понедельник...
  isClosed: boolean;
  start: number;        // минуты
  end: number;          // минуты
};

function mmToTime(mm: number | null | undefined): string {
  const v = typeof mm === "number" && Number.isFinite(mm) ? mm : 0;
  const h = Math.floor(v / 60);
  const m = v % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

export default function ResponsiveHoursFields({ days }: { days: DayRow[] }) {
  // локальное состояние только для того, чтобы включать/выключать time-поля при "Выходной"
  const [rows, setRows] = useState<DayRow[]>(days);

  // следим за брейкпоинтом sm (640px), чтобы показывать либо карточки, либо таблицу
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsDesktop("matches" in e ? e.matches : (e as MediaQueryList).matches);

    onChange(mq);
    mq.addEventListener?.("change", onChange as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener?.("change", onChange as (e: MediaQueryListEvent) => void);
  }, []);

  const handleClosedToggle = (weekday: number, next: boolean) => {
    setRows((prev) =>
      prev.map((r) => (r.value === weekday ? { ...r, isClosed: next } : r)),
    );
  };

  // чтобы избежать лишних ререндеров
  const byId = useMemo(() => new Map(rows.map((r) => [r.value, r])), [rows]);

  if (!isDesktop) {
    // ----- Мобильные карточки -----
    return (
      <div className="grid gap-3">
        {rows.map((r) => (
          <div key={r.value} className="rounded-xl border border-white/10 p-3 bg-white/5">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">{r.full}</div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name={`wh-${r.value}-isClosed`}
                  defaultChecked={r.isClosed}
                  className="accent-emerald-500"
                  onChange={(e) => handleClosedToggle(r.value, e.currentTarget.checked)}
                />
                Выходной
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs opacity-70">
                Начало
                <input
                  type="time"
                  name={`wh-${r.value}-start`}
                  defaultValue={mmToTime(r.start)}
                  className="mt-1 w-full rounded-md border bg-transparent px-2 py-1"
                  aria-label={`Начало ${r.full}`}
                  disabled={byId.get(r.value)?.isClosed}
                />
              </label>
              <label className="text-xs opacity-70">
                Конец
                <input
                  type="time"
                  name={`wh-${r.value}-end`}
                  defaultValue={mmToTime(r.end)}
                  className="mt-1 w-full rounded-md border bg-transparent px-2 py-1"
                  aria-label={`Конец ${r.full}`}
                  disabled={byId.get(r.value)?.isClosed}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ----- Десктоп-таблица -----
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[720px] w-full text-sm">
        <thead className="text-left opacity-70">
          <tr>
            <th className="py-2 pr-3">День</th>
            <th className="py-2 pr-3">Выходной</th>
            <th className="py-2 pr-3">Начало</th>
            <th className="py-2 pr-3">Конец</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((r) => (
            <tr key={r.value}>
              <td className="py-2 pr-3">{r.full}</td>
              <td className="py-2 pr-3">
                <input
                  type="checkbox"
                  name={`wh-${r.value}-isClosed`}
                  defaultChecked={r.isClosed}
                  className="accent-emerald-500"
                  aria-label={`${r.full}: выходной`}
                  onChange={(e) => handleClosedToggle(r.value, e.currentTarget.checked)}
                />
              </td>
              <td className="py-2 pr-3">
                <input
                  type="time"
                  name={`wh-${r.value}-start`}
                  defaultValue={mmToTime(r.start)}
                  className="rounded-md border bg-transparent px-2 py-1"
                  aria-label={`${r.full}: начало`}
                  disabled={byId.get(r.value)?.isClosed}
                />
              </td>
              <td className="py-2 pr-3">
                <input
                  type="time"
                  name={`wh-${r.value}-end`}
                  defaultValue={mmToTime(r.end)}
                  className="rounded-md border bg-transparent px-2 py-1"
                  aria-label={`${r.full}: конец`}
                  disabled={byId.get(r.value)?.isClosed}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
