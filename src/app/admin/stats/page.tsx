// src/app/admin/stats/page.tsx
import type { ReactElement, ComponentPropsWithoutRef } from 'react';
import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AppointmentStatus } from '@prisma/client';
import {
  addDays,
  startOfDay,
  startOfMonth,
  startOfYear,
  subMonths,
  startOfWeek,
  format,
} from 'date-fns';
import { ru } from 'date-fns/locale';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = 'force-dynamic';

function fmtDate(d: Date): string {
  return format(d, 'dd.MM.yyyy', { locale: ru });
}
function fmtDayShort(d: Date): string {
  return format(d, 'dd.MM', { locale: ru });
}
function moneyFromCents(cents: number, currency: string): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format((cents || 0) / 100);
}
function getOne(sp: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

/** Рассчитываем границы периода [from, to) по пресету/ручному выбору */
function resolveRange(sp: Record<string, string | string[] | undefined>): {
  from: Date;
  to: Date;
  label: string;
  period: string;
  fromStr: string;
  toStr: string;
} {
  const now = new Date();
  const todayStart = startOfDay(now);

  const period = getOne(sp, 'period') ?? 'thisMonth';
  const fromStr = getOne(sp, 'from');
  const toStr = getOne(sp, 'to');

  let from = todayStart;
  let to = addDays(todayStart, 1);
  let label = 'Сегодня';

  switch (period) {
    case 'today': {
      from = todayStart;
      to = addDays(from, 1);
      label = 'Сегодня';
      break;
    }
    case '7d': {
      from = addDays(todayStart, -6);
      to = addDays(todayStart, 1);
      label = 'Последние 7 дней';
      break;
    }
    case '30d': {
      from = addDays(todayStart, -29);
      to = addDays(todayStart, 1);
      label = 'Последние 30 дней';
      break;
    }
    case 'thisMonth': {
      from = startOfMonth(now);
      const nextMonthStart = startOfMonth(addDays(now, 32));
      to = nextMonthStart;
      label = 'Текущий месяц';
      break;
    }
    case 'lastMonth': {
      const last = subMonths(now, 1);
      from = startOfMonth(last);
      const nextMonthStart = startOfMonth(addDays(last, 32));
      to = nextMonthStart;
      label = 'Прошлый месяц';
      break;
    }
    case 'thisYear': {
      from = startOfYear(now);
      const nextYearStart = startOfYear(addDays(now, 370));
      to = nextYearStart;
      label = 'Текущий год';
      break;
    }
    case 'custom': {
      const f = fromStr ? new Date(fromStr) : todayStart;
      const t = toStr ? addDays(startOfDay(new Date(toStr)), 1) : addDays(startOfDay(f), 1);
      from = startOfDay(f);
      to = t;
      label = `C ${fmtDate(from)} по ${fmtDate(addDays(to, -1))}`;
      break;
    }
    default: {
      from = startOfMonth(now);
      to = startOfMonth(addDays(now, 32));
      label = 'Текущий месяц';
    }
  }
  return { from, to, label, period, fromStr: fromStr ?? '', toStr: toStr ?? '' };
}

export default async function StatsPage({
  searchParams,
}: { searchParams: SearchParams }): Promise<ReactElement> {
  const sp = await searchParams;
  const { from, to, label, period, fromStr, toStr } = resolveRange(sp);
  const currency = (getOne(sp, 'currency') ?? 'EUR').toUpperCase();
  const group = getOne(sp, 'group') === 'week' ? 'week' : 'day';
  const now = new Date();

  // Достаём записи (минимально необходимый select)
  const appts = await prisma.appointment.findMany({
    where: { startAt: { gte: from, lt: to } },
    select: {
      id: true,
      status: true,
      startAt: true,
      service: { select: { id: true, name: true, priceCents: true } },
      master: { select: { id: true, name: true } },
    },
    orderBy: { startAt: 'asc' },
  });

  const sumCents = (xs: typeof appts, predicate: (a: (typeof appts)[number]) => boolean) =>
    xs.reduce((acc, a) => (predicate(a) ? acc + (a.service?.priceCents ?? 0) : acc), 0);

  const count = (pred: (a: (typeof appts)[number]) => boolean) => appts.reduce((n, a) => (pred(a) ? n + 1 : n), 0);

  const total = appts.length;
  const done = count((a) => a.status === AppointmentStatus.DONE);
  const futureConfirmed = count((a) => a.status === AppointmentStatus.CONFIRMED && a.startAt >= now);
  const canceled = count((a) => a.status === AppointmentStatus.CANCELED);

  const revenueDone = sumCents(appts, (a) => a.status === AppointmentStatus.DONE);
  const revenueFutureConfirmed = sumCents(
    appts,
    (a) => a.status === AppointmentStatus.CONFIRMED && a.startAt >= now,
  );

  // ───────── Разбивка по мастерам ─────────
  type Row = {
    id: string;
    name: string;
    total: number;
    done: number;
    futureConfirmed: number;
    canceled: number;
    pending: number;
    revenueDone: number;
    revenueFutureConfirmed: number;
  };
  const byMaster = new Map<string, Row>();
  for (const a of appts) {
    const id = a.master?.id ?? 'none';
    const name = a.master?.name ?? 'Без мастера';
    const r = byMaster.get(id) ?? {
      id,
      name,
      total: 0,
      done: 0,
      futureConfirmed: 0,
      canceled: 0,
      pending: 0,
      revenueDone: 0,
      revenueFutureConfirmed: 0,
    };
    r.total += 1;
    if (a.status === AppointmentStatus.DONE) {
      r.done += 1;
      r.revenueDone += a.service?.priceCents ?? 0;
    } else if (a.status === AppointmentStatus.CONFIRMED) {
      if (a.startAt >= now) {
        r.futureConfirmed += 1;
        r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
      }
    } else if (a.status === AppointmentStatus.CANCELED) {
      r.canceled += 1;
    } else {
      r.pending += 1;
    }
    byMaster.set(id, r);
  }
  const byMasterArr = [...byMaster.values()].sort((a, b) => b.revenueDone - a.revenueDone);

  // ───────── Разбивка по услугам ─────────
  type SRow = {
    id: string;
    name: string;
    total: number;
    done: number;
    revenueDone: number;
    futureConfirmed: number;
    revenueFutureConfirmed: number;
  };
  const byService = new Map<string, SRow>();
  for (const a of appts) {
    const sid = a.service?.id ?? 'unknown';
    const name = a.service?.name ?? 'Удалённая услуга';
    const r = byService.get(sid) ?? {
      id: sid,
      name,
      total: 0,
      done: 0,
      revenueDone: 0,
      futureConfirmed: 0,
      revenueFutureConfirmed: 0,
    };
    r.total += 1;
    if (a.status === AppointmentStatus.DONE) {
      r.done += 1;
      r.revenueDone += a.service?.priceCents ?? 0;
    } else if (a.status === AppointmentStatus.CONFIRMED && a.startAt >= now) {
      r.futureConfirmed += 1;
      r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
    }
    byService.set(sid, r);
  }
  const byServiceArr = [...byService.values()].sort((a, b) => b.revenueDone - a.revenueDone);

  // ───────── Динамика по времени ─────────
  type TBucket = { key: string; start: Date; cntDone: number; revDone: number };
  const buckets = new Map<string, TBucket>();
  const makeKey = (d: Date): { key: string; start: Date } => {
    if (group === 'week') {
      const startW = startOfWeek(d, { locale: ru, weekStartsOn: 1 });
      return { key: `W${format(startW, 'yyyy-ww')}`, start: startW };
    }
    const startD = startOfDay(d);
    return { key: format(startD, 'yyyy-MM-dd'), start: startD };
  };
  for (const a of appts) {
    const { key, start } = makeKey(a.startAt);
    const b = buckets.get(key) ?? { key, start, cntDone: 0, revDone: 0 };
    if (a.status === AppointmentStatus.DONE) {
      b.cntDone += 1;
      b.revDone += a.service?.priceCents ?? 0;
    }
    buckets.set(key, b);
  }
  const timeline = [...buckets.values()].sort((x, y) => x.start.getTime() - y.start.getTime());
  const seriesCount = timeline.map((t) => t.cntDone);
  const seriesRevenue = timeline.map((t) => t.revDone / 100);

  return (
    <main className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold">Статистика</h1>
        <Link href="/admin" className="link">← Дашборд</Link>
      </div>

      {/* Фильтр периода + валюта + группировка */}
      <section className="rounded-2xl border p-4 space-y-3">
        <h2 className="font-medium">Период</h2>
        <form className="grid lg:grid-cols-[520px,1fr] gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select name="period" defaultValue={period}>
              <option value="today">Сегодня</option>
              <option value="7d">Последние 7 дней</option>
              <option value="30d">Последние 30 дней</option>
              <option value="thisMonth">Текущий месяц</option>
              <option value="lastMonth">Прошлый месяц</option>
              <option value="thisYear">Текущий год</option>
              <option value="custom">Произвольный</option>
            </Select>
            <Select name="currency" defaultValue={currency}>
              <option value="EUR">€ EUR</option>
              <option value="USD">$ USD</option>
              <option value="UAH">₴ UAH</option>
              <option value="PLN">zł PLN</option>
            </Select>
            <Select name="group" defaultValue={group}>
              <option value="day">По дням</option>
              <option value="week">По неделям</option>
            </Select>
            <button className="btn btn-primary" type="submit">Применить</button>
          </div>

          <div className="grid sm:grid-cols-3 gap-2">
            <Input label="Дата с" type="date" name="from" defaultValue={fromStr || undefined} />
            <Input label="Дата по" type="date" name="to" defaultValue={toStr || undefined} />
            <div className="self-end text-sm opacity-70">{label}</div>
          </div>
        </form>

        {/* Экспорт CSV — формы GET без префетча, открываются в новой вкладке */}
        <div className="flex flex-wrap gap-2 pt-1">
          <ExportButton title="Экспорт CSV — заявки" type="raw" period={period} from={fromStr} to={toStr} currency={currency} group={group} />
          <ExportButton title="Экспорт CSV — мастера" type="masters" period={period} from={fromStr} to={toStr} currency={currency} group={group} />
          <ExportButton title="Экспорт CSV — услуги" type="services" period={period} from={fromStr} to={toStr} currency={currency} group={group} />
          <ExportButton title="Экспорт CSV — динамика" type="timeline" period={period} from={fromStr} to={toStr} currency={currency} group={group} />
        </div>
      </section>

      {/* Карточки-сводка */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Заявки (всего)" value={String(total)} />
        <Card title="Выполнено" value={String(done)} />
        <Card title="Будущие подтверждённые" value={String(futureConfirmed)} />
        <Card title="Отменено" value={String(canceled)} />
      </section>

      {/* Касса */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Card title="Касса (выполненные)" value={moneyFromCents(revenueDone, currency)} />
        <Card title="Касса (будущие подтверждённые)" value={moneyFromCents(revenueFutureConfirmed, currency)} />
      </section>

      {/* Динамика */}
      <section className="space-y-3">
        <h2 className="font-medium">Динамика ({group === 'week' ? 'недели' : 'дни'})</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border p-3">
            <div className="text-sm opacity-70 mb-2">Количество выполненных</div>
            <Sparkline data={seriesCount} />
          </div>
          <div className="rounded-2xl border p-3">
            <div className="text-sm opacity-70 mb-2">Касса (выполненные)</div>
            <Sparkline data={seriesRevenue} />
          </div>
        </div>

        <div className="rounded-2xl border overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">{group === 'week' ? 'Неделя (начало)' : 'День'}</th>
                <th className="p-3">Выполнено</th>
                <th className="p-3">Касса (вып.)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {timeline.map((t) => (
                <tr key={t.key}>
                  <td className="p-3 whitespace-nowrap">
                    {group === 'week' ? fmtDate(t.start) : fmtDayShort(t.start)}
                  </td>
                  <td className="p-3">{t.cntDone}</td>
                  <td className="p-3 whitespace-nowrap">{moneyFromCents(t.revDone, currency)}</td>
                </tr>
              ))}
              {timeline.length === 0 && (
                <tr><td className="p-3 opacity-70" colSpan={3}>Нет данных за выбранный период</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* По мастерам */}
      <section className="space-y-3">
        <h2 className="font-medium">Разбивка по мастерам</h2>
        <div className="rounded-2xl border overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">Мастер</th>
                <th className="p-3">Заявок</th>
                <th className="p-3">Выполнено</th>
                <th className="p-3">Будущие подтв.</th>
                <th className="p-3">Отменено</th>
                <th className="p-3">Ожидают</th>
                <th className="p-3">Касса (вып.)</th>
                <th className="p-3">Касса (буд.)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {byMasterArr.map((r) => (
                <tr key={r.id}>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.total}</td>
                  <td className="p-3">{r.done}</td>
                  <td className="p-3">{r.futureConfirmed}</td>
                  <td className="p-3">{r.canceled}</td>
                  <td className="p-3">{r.pending}</td>
                  <td className="p-3 whitespace-nowrap">{moneyFromCents(r.revenueDone, currency)}</td>
                  <td className="p-3 whitespace-nowrap">{moneyFromCents(r.revenueFutureConfirmed, currency)}</td>
                </tr>
              ))}
              {byMasterArr.length === 0 && (
                <tr><td className="p-3 opacity-70" colSpan={8}>Нет данных за выбранный период</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* По услугам */}
      <section className="space-y-3">
        <h2 className="font-medium">Разбивка по услугам</h2>
        <div className="rounded-2xl border overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">Услуга</th>
                <th className="p-3">Заявок</th>
                <th className="p-3">Выполнено</th>
                <th className="p-3">Касса (вып.)</th>
                <th className="p-3">Будущие подтв.</th>
                <th className="p-3">Касса (буд.)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {byServiceArr.map((r) => (
                <tr key={r.id}>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.total}</td>
                  <td className="p-3">{r.done}</td>
                  <td className="p-3 whitespace-nowrap">{moneyFromCents(r.revenueDone, currency)}</td>
                  <td className="p-3">{r.futureConfirmed}</td>
                  <td className="p-3 whitespace-nowrap">{moneyFromCents(r.revenueFutureConfirmed, currency)}</td>
                </tr>
              ))}
              {byServiceArr.length === 0 && (
                <tr><td className="p-3 opacity-70" colSpan={6}>Нет данных за выбранный период</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

/* ───────── small UI helpers ───────── */

function Card({ title, value }: { title: string; value: string }): ReactElement {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm opacity-70">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function Input(
  { label, className, ...props }:
  { label: string } & Omit<ComponentPropsWithoutRef<'input'>, 'className'> & { className?: string }
): ReactElement {
  return (
    <label className={`grid gap-1 text-sm ${className ?? ''}`}>
      <span className="opacity-70">{label}</span>
      <input {...props} className="input" />
    </label>
  );
}

function Select(props: ComponentPropsWithoutRef<'select'>): ReactElement {
  return <select {...props} className="input" />;
}

/** Кнопка экспорта: форма GET → /admin/stats/export, без префетча, новая вкладка */
function ExportButton({
  title, type, period, from, to, currency, group,
}: {
  title: string;
  type: 'raw' | 'masters' | 'services' | 'timeline';
  period: string;
  from?: string;
  to?: string;
  currency: string;
  group: 'day' | 'week';
}): ReactElement {
  return (
    <form action="/admin/stats/export" method="GET" target="_blank" className="inline">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="period" value={period} />
      {from ? <input type="hidden" name="from" value={from} /> : null}
      {to ? <input type="hidden" name="to" value={to} /> : null}
      <input type="hidden" name="currency" value={currency} />
      <input type="hidden" name="group" value={group} />
      {/* защита от префетча */}
      <input type="hidden" name="download" value="1" />
      <button type="submit" className="btn btn-outline btn-sm">{title}</button>
    </form>
  );
}

/** Мини-график SVG (спарклайн) */
function Sparkline({
  data,
  width = 560,
  height = 80,
}: {
  data: ReadonlyArray<number>;
  width?: number;
  height?: number;
}): ReactElement {
  const w = Math.max(60, width);
  const h = Math.max(40, height);
  if (!data.length) {
    return <div className="text-sm opacity-70">Нет данных</div>;
    }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1e-6, max - min);
  const step = w / Math.max(1, data.length - 1);

  const points = data.map((v, i) => {
    const x = Math.round(i * step);
    const y = Math.round(h - ((v - min) / range) * (h - 4) - 2);
    return `${x},${y}`;
  });
  const path = `M ${points.join(' L ')}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="block">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1"
        points={`0,${h - 1} ${w},${h - 1}`}
      />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      {points.map((p, i) => {
        const [x, y] = p.split(',').map((n) => Number(n));
        return <circle key={i} cx={x} cy={y} r="2" fill="currentColor" />;
      })}
    </svg>
  );
}
