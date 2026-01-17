// src/app/admin/masters/[id]/ResponsiveHoursFields.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type DayRow = {
  value: number;
  full: string;
  isClosed: boolean;
  start: number;
  end: number;
};

function mmToTime(mm: number | null | undefined): string {
  const v = typeof mm === 'number' && Number.isFinite(mm) ? mm : 0;
  const h = Math.floor(v / 60);
  const m = v % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export default function ResponsiveHoursFields({ days }: { days: DayRow[] }) {
  const [rows, setRows] = useState<DayRow[]>(days);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsDesktop('matches' in e ? e.matches : (e as MediaQueryList).matches);

    onChange(mq);
    mq.addEventListener?.('change', onChange as (e: MediaQueryListEvent) => void);
    return () =>
      mq.removeEventListener?.('change', onChange as (e: MediaQueryListEvent) => void);
  }, []);

  const handleClosedToggle = (weekday: number, next: boolean) => {
    setRows((prev) =>
      prev.map((r) => (r.value === weekday ? { ...r, isClosed: next } : r))
    );
  };

  const byId = useMemo(() => new Map(rows.map((r) => [r.value, r])), [rows]);

  if (!isDesktop) {
    // Мобильные карточки
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3">
        {rows.map((r) => (
          <motion.div
            key={r.value}
            variants={item}
            whileHover={{ scale: 1.01 }}
            className="card-glass card-glass-accent p-3"
          >
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
                  className="input-glass mt-1 w-full px-3 py-1.5 text-sm transition-opacity"
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
                  className="input-glass mt-1 w-full px-3 py-1.5 text-sm transition-opacity"
                  aria-label={`Конец ${r.full}`}
                  disabled={byId.get(r.value)?.isClosed}
                />
              </label>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Десктоп-таблица
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto"
    >
      <table className="table-glass min-w-[720px]">
        <thead className="text-left">
          <tr>
            <th className="py-2 pr-3">День</th>
            <th className="py-2 pr-3">Выходной</th>
            <th className="py-2 pr-3">Начало</th>
            <th className="py-2 pr-3">Конец</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((r, index) => (
            <motion.tr
              key={r.value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
            >
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
                  className="input-glass px-3 py-1.5 text-sm transition-opacity"
                  aria-label={`${r.full}: начало`}
                  disabled={byId.get(r.value)?.isClosed}
                />
              </td>
              <td className="py-2 pr-3">
                <input
                  type="time"
                  name={`wh-${r.value}-end`}
                  defaultValue={mmToTime(r.end)}
                  className="input-glass px-3 py-1.5 text-sm transition-opacity"
                  aria-label={`${r.full}: конец`}
                  disabled={byId.get(r.value)?.isClosed}
                />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
