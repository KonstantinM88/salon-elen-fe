// src/app/admin/stats/page.tsx
import type { ReactElement, ComponentPropsWithoutRef } from "react";
import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";
import {
  addDays,
  startOfDay,
  startOfMonth,
  startOfYear,
  subMonths,
  startOfWeek,
  format,
} from "date-fns";
import { ru } from "date-fns/locale";

// ✨ НОВЫЕ КОМПОНЕНТЫ
import KPICard from './_components/KPICard';
import RevenueChart from './_components/RevenueChart';
import TopServicesChart from './_components/TopServicesChart';
import TopMastersTable from './_components/TopMastersTable';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

/* ───────── helpers ───────── */

function fmtDate(d: Date): string {
  return format(d, "dd.MM.yyyy", { locale: ru });
}
function fmtDayShort(d: Date): string {
  return format(d, "dd.MM", { locale: ru });
}
function moneyFromCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format((cents || 0) / 100);
}
function getOne(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}
function percent(part: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}
function enc(v: string) {
  return encodeURIComponent(v);
}
function qs(params: Record<string, string | undefined>): string {
  const pairs = Object.entries(params).filter(([, v]) => v != null && v !== "");
  return pairs.length
    ? `?${pairs.map(([k, v]) => `${enc(k)}=${enc(v!)}`).join("&")}`
    : "";
}
function trend(
  curr: number,
  prev: number
): { dir: "up" | "down" | "flat"; delta: number } {
  if (prev === 0) {
    if (curr === 0) return { dir: "flat", delta: 0 };
    return { dir: "up", delta: 100 };
  }
  const delta = Math.round(((curr - prev) / prev) * 100);
  if (delta > 0) return { dir: "up", delta };
  if (delta < 0) return { dir: "down", delta };
  return { dir: "flat", delta: 0 };
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

  const period = getOne(sp, "period") ?? "thisMonth";
  const fromStr = getOne(sp, "from");
  const toStr = getOne(sp, "to");

  let from = todayStart;
  let to = addDays(todayStart, 1);
  let label = "Сегодня";

  switch (period) {
    case "today": {
      from = todayStart;
      to = addDays(from, 1);
      label = "Сегодня";
      break;
    }
    case "7d": {
      from = addDays(todayStart, -6);
      to = addDays(todayStart, 1);
      label = "Последние 7 дней";
      break;
    }
    case "30d": {
      from = addDays(todayStart, -29);
      to = addDays(todayStart, 1);
      label = "Последние 30 дней";
      break;
    }
    case "thisMonth": {
      from = startOfMonth(now);
      const nextMonthStart = startOfMonth(addDays(now, 32));
      to = nextMonthStart;
      label = "Текущий месяц";
      break;
    }
    case "lastMonth": {
      const last = subMonths(now, 1);
      from = startOfMonth(last);
      const nextMonthStart = startOfMonth(addDays(last, 32));
      to = nextMonthStart;
      label = "Прошлый месяц";
      break;
    }
    case "thisYear": {
      from = startOfYear(now);
      const nextYearStart = startOfYear(addDays(now, 370));
      to = nextYearStart;
      label = "Текущий год";
      break;
    }
    case "custom": {
      const f = fromStr ? new Date(fromStr) : todayStart;
      const t = toStr
        ? addDays(startOfDay(new Date(toStr)), 1)
        : addDays(startOfDay(f), 1);
      from = startOfDay(f);
      to = t;
      label = `C ${fmtDate(from)} по ${fmtDate(addDays(to, -1))}`;
      break;
    }
    default: {
      from = startOfMonth(now);
      to = startOfMonth(addDays(now, 32));
      label = "Текущий месяц";
    }
  }
  return {
    from,
    to,
    label,
    period,
    fromStr: fromStr ?? "",
    toStr: toStr ?? "",
  };
}

/* ───────── page ───────── */

export default async function StatsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<ReactElement> {
  const sp = await searchParams;
  const { from, to, label, period, fromStr, toStr } = resolveRange(sp);
  const currency = (getOne(sp, "currency") ?? "EUR").toUpperCase();
  const group = getOne(sp, "group") === "week" ? "week" : "day";
  const now = new Date();

  // текущий период
  const appts = await prisma.appointment.findMany({
    where: { startAt: { gte: from, lt: to }, deletedAt: null },
    select: {
      id: true,
      status: true,
      startAt: true,
      service: { select: { id: true, name: true, priceCents: true } },
      master: { select: { id: true, name: true } },
    },
    orderBy: { startAt: "asc" },
  });

  // будущие подтверждённые записи (отдельный запрос, независимо от периода)
  const futureApptsConfirmed = await prisma.appointment.findMany({
    where: { 
      startAt: { gte: now }, 
      status: AppointmentStatus.CONFIRMED,
      deletedAt: null 
    },
    select: {
      id: true,
      service: { select: { priceCents: true } },
    },
  });

  // предыдущий период той же длительности
  const periodMs = to.getTime() - from.getTime();
  const prevFrom = new Date(from.getTime() - periodMs);
  const prevTo = from;

  const apptsPrev = await prisma.appointment.findMany({
    where: { startAt: { gte: prevFrom, lt: prevTo }, deletedAt: null },
    select: {
      id: true,
      status: true,
      startAt: true,
      service: { select: { id: true, name: true, priceCents: true } },
      master: { select: { id: true, name: true } },
    },
    orderBy: { startAt: "asc" },
  });

  const sumCents = (
    xs: typeof appts,
    predicate: (a: (typeof appts)[number]) => boolean
  ) =>
    xs.reduce(
      (acc, a) => (predicate(a) ? acc + (a.service?.priceCents ?? 0) : acc),
      0
    );

  const count = (
    xs: typeof appts,
    pred: (a: (typeof appts)[number]) => boolean
  ) => xs.reduce((n, a) => (pred(a) ? n + 1 : n), 0);

  /* totals */
  const total = appts.length;
  const totalPrev = apptsPrev.length;

  const done = count(appts, (a) => a.status === AppointmentStatus.DONE);
  const donePrev = count(apptsPrev, (a) => a.status === AppointmentStatus.DONE);

  // будущие подтверждённые (из отдельного запроса)
  const futureConfirmed = futureApptsConfirmed.length;
  const revenueFutureConfirmed = futureApptsConfirmed.reduce(
    (acc, a) => acc + (a.service?.priceCents ?? 0),
    0
  );

  const canceled = count(appts, (a) => a.status === AppointmentStatus.CANCELED);
  const canceledPrev = count(
    apptsPrev,
    (a) => a.status === AppointmentStatus.CANCELED
  );

  const revenueDone = sumCents(
    appts,
    (a) => a.status === AppointmentStatus.DONE
  );
  const revenueDonePrev = sumCents(
    apptsPrev,
    (a) => a.status === AppointmentStatus.DONE
  );

  /* ───────── Тренды ───────── */
  const totalTrend = trend(total, totalPrev);
  const doneTrend = trend(done, donePrev);
  const canceledTrend = trend(canceled, canceledPrev);
  const revenueDoneTrend = trend(revenueDone, revenueDonePrev);

  /* ───────── Разбивка по мастерам ───────── */
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
    const id = a.master?.id ?? "none";
    const name = a.master?.name ?? "Без мастера";
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
  const byMasterArr = [...byMaster.values()].sort(
    (a, b) => b.revenueDone - a.revenueDone
  );

  // prev by master (для тренда по кассе)
  const byMasterPrev = new Map<
    string,
    { revenueDone: number; done: number; canceled: number }
  >();
  for (const a of apptsPrev) {
    const id = a.master?.id ?? "none";
    const r = byMasterPrev.get(id) ?? { revenueDone: 0, done: 0, canceled: 0 };
    if (a.status === AppointmentStatus.DONE) {
      r.done += 1;
      r.revenueDone += a.service?.priceCents ?? 0;
    } else if (a.status === AppointmentStatus.CANCELED) {
      r.canceled += 1;
    }
    byMasterPrev.set(id, r);
  }

  /* ───────── Разбивка по услугам ───────── */
  type SvcRow = {
    id: string;
    name: string;
    total: number;
    done: number;
    canceled: number;
    revenueDone: number;
  };
  const byService = new Map<string, SvcRow>();
  for (const a of appts) {
    const id = a.service?.id ?? "none";
    const name = a.service?.name ?? "Без услуги";
    const r = byService.get(id) ?? {
      id,
      name,
      total: 0,
      done: 0,
      canceled: 0,
      revenueDone: 0,
    };
    r.total += 1;
    if (a.status === AppointmentStatus.DONE) {
      r.done += 1;
      r.revenueDone += a.service?.priceCents ?? 0;
    } else if (a.status === AppointmentStatus.CANCELED) {
      r.canceled += 1;
    }
    byService.set(id, r);
  }
  const byServiceArr = [...byService.values()].sort(
    (a, b) => b.revenueDone - a.revenueDone
  );

  /* ───────── Группировка по дням/неделям для sparkline ───────── */
  type Daily = {
    date: string; // ISO
    total: number;
    done: number;
    canceled: number;
    revenueDone: number;
    revenueFutureConfirmed: number;
  };
  const grouped = new Map<string, Daily>();
  for (const a of appts) {
    let key: string;
    if (group === "week") {
      const weekStart = startOfWeek(a.startAt, { locale: ru });
      key = weekStart.toISOString();
    } else {
      const dayStart = startOfDay(a.startAt);
      key = dayStart.toISOString();
    }
    const r = grouped.get(key) ?? {
      date: key,
      total: 0,
      done: 0,
      canceled: 0,
      revenueDone: 0,
      revenueFutureConfirmed: 0,
    };
    r.total += 1;
    if (a.status === AppointmentStatus.DONE) {
      r.done += 1;
      r.revenueDone += a.service?.priceCents ?? 0;
    } else if (a.status === AppointmentStatus.CANCELED) {
      r.canceled += 1;
    } else if (a.status === AppointmentStatus.CONFIRMED && a.startAt >= now) {
      r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
    }
    grouped.set(key, r);
  }
  const groupedData = [...grouped.values()].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <div className="mx-auto max-w-[90rem] px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          📊 Статистика
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Аналитика работы салона за выбранный период
        </p>
      </div>

      {/* Фильтры и настройки */}
      <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6">
        <form method="GET" className="space-y-4">
          {/* Период */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <label className="grid gap-1 text-sm">
              <span className="text-slate-300 font-medium">Период</span>
              <Select name="period" defaultValue={period}>
                <option value="today">Сегодня</option>
                <option value="7d">7 дней</option>
                <option value="30d">30 дней</option>
                <option value="thisMonth">Месяц</option>
                <option value="lastMonth">Прошлый месяц</option>
                <option value="thisYear">Год</option>
                <option value="custom">Произвольный</option>
              </Select>
            </label>

            {period === "custom" && (
              <>
                <Input
                  label="Дата с"
                  type="date"
                  name="from"
                  defaultValue={fromStr}
                />
                <Input
                  label="Дата по"
                  type="date"
                  name="to"
                  defaultValue={toStr}
                />
              </>
            )}

            <label className="grid gap-1 text-sm">
              <span className="text-slate-300 font-medium">Валюта</span>
              <Select name="currency" defaultValue={currency}>
                <option value="EUR">€ EUR</option>
                <option value="USD">$ USD</option>
                <option value="RUB">₽ RUB</option>
              </Select>
            </label>
          </div>

          {/* Кнопки */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all"
            >
              Применить
            </button>
            <Link
              href="/admin/stats"
              className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-all"
            >
              Сбросить
            </Link>
          </div>
        </form>

        {/* Период label */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-sm">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="text-slate-400">Период:</span>
            <span className="text-white font-semibold">{label}</span>
          </div>
        </div>
      </div>

      {/* ✨ НОВЫЕ KPI КАРТОЧКИ */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {/* Выручка */}
        <KPICard
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="7" width="18" height="12" rx="2" />
              <path d="M21 10h-5a2 2 0 0 0 0 4h5" />
            </svg>
          }
          label="Выручка"
          value={moneyFromCents(revenueDone, currency)}
          trend={{
            direction: revenueDoneTrend.dir,
            value: `${revenueDoneTrend.delta > 0 ? '+' : ''}${revenueDoneTrend.delta}%`,
            label: 'vs прошлый период',
          }}
          color="gold"
        />

        {/* Клиенты */}
        <KPICard
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="9" cy="7" r="3" />
              <path d="M2 21a7 7 0 0 1 14 0" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M22 21a6 6 0 0 0-8-5.5" />
            </svg>
          }
          label="Выполнено записей"
          value={done}
          trend={{
            direction: doneTrend.dir,
            value: `${doneTrend.delta > 0 ? '+' : ''}${doneTrend.delta}%`,
            label: 'vs прошлый период',
          }}
          color="blue"
        />

        {/* Средний чек */}
        <KPICard
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4" />
            </svg>
          }
          label="Средний чек"
          value={done > 0 ? moneyFromCents(Math.round(revenueDone / done), currency) : '0 €'}
          trend={
            donePrev > 0
              ? {
                  direction: trend(
                    done > 0 ? revenueDone / done : 0,
                    donePrev > 0 ? revenueDonePrev / donePrev : 0
                  ).dir,
                  value: `${trend(done > 0 ? revenueDone / done : 0, donePrev > 0 ? revenueDonePrev / donePrev : 0).delta > 0 ? '+' : ''}${trend(done > 0 ? revenueDone / done : 0, donePrev > 0 ? revenueDonePrev / donePrev : 0).delta}%`,
                  label: 'vs прошлый период',
                }
              : undefined
          }
          color="purple"
        />

        {/* Будущие записи */}
        <KPICard
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          }
          label="Будущие записи"
          value={futureConfirmed}
          trend={{
            direction: 'flat',
            value: moneyFromCents(revenueFutureConfirmed, currency),
            label: 'ожидаемая выручка',
          }}
          color="emerald"
        />
      </div>

      {/* ✨ ГРАФИК ДИНАМИКИ ВЫРУЧКИ */}
      <RevenueChart
        data={groupedData.map((d) => ({
          date: fmtDayShort(new Date(d.date)),
          revenue: d.revenueDone / 100,
          count: d.done,
        }))}
        currency={currency}
      />

      {/* ✨ ТОП УСЛУГИ И МАСТЕРА */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <TopServicesChart
          data={byServiceArr.map((s) => ({
            name: s.name,
            revenue: s.revenueDone / 100,
            count: s.done,
            percentage: total > 0 ? (s.total / total) * 100 : 0,
          }))}
          currency={currency}
        />

        <TopMastersTable
          data={byMasterArr.map((m) => ({
            id: m.id,
            name: m.name,
            revenue: m.revenueDone,
            count: m.done,
            avgCheck: m.done > 0 ? Math.round(m.revenueDone / m.done) : 0,
          }))}
          currency={currency}
        />
      </div>

      {/* Кнопки экспорта */}
      <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Экспорт данных
        </h3>
        <div className="flex flex-wrap gap-3">
          <ExportButton
            title="Экспорт CSV — заявки"
            type="raw"
            period={period}
            from={fromStr}
            to={toStr}
            currency={currency}
            group={group}
          />
          <ExportButton
            title="Экспорт CSV — мастера"
            type="masters"
            period={period}
            from={fromStr}
            to={toStr}
            currency={currency}
            group={group}
          />
          <ExportButton
            title="Экспорт CSV — услуги"
            type="services"
            period={period}
            from={fromStr}
            to={toStr}
            currency={currency}
            group={group}
          />
          <ExportButton
            title="Экспорт CSV — динамика"
            type="timeline"
            period={period}
            from={fromStr}
            to={toStr}
            currency={currency}
            group={group}
          />
        </div>
      </div>

      {/* Детальные таблицы */}
      <div className="space-y-4 sm:space-y-6">
        {/* Таблица по мастерам */}
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Детальная статистика по мастерам
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-800/50">
                <tr className="text-left text-xs sm:text-sm text-slate-300">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap">Мастер</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Всего</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Выполнено</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Будущие</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Отменено</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Касса</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Будущая касса</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {byMasterArr.map((m) => {
                  const prev = byMasterPrev.get(m.id);
                  const trendRev = prev ? trend(m.revenueDone, prev.revenueDone) : null;
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="font-medium text-white text-sm sm:text-base whitespace-nowrap">{m.name}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">{m.total}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">
                        {m.done}
                        {prev && prev.done !== m.done && (
                          <span className={`ml-2 text-xs ${m.done > prev.done ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {m.done > prev.done ? '↑' : '↓'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">{m.futureConfirmed}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">
                        {m.canceled}
                        {prev && prev.canceled !== m.canceled && (
                          <span className={`ml-2 text-xs ${m.canceled < prev.canceled ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {m.canceled < prev.canceled ? '↓' : '↑'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                        <div className="font-semibold text-white text-sm sm:text-base whitespace-nowrap">
                          {moneyFromCents(m.revenueDone, currency)}
                        </div>
                        {trendRev && trendRev.delta !== 0 && (
                          <div className={`text-xs ${trendRev.dir === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {trendRev.dir === 'up' ? '↑' : '↓'} {Math.abs(trendRev.delta)}%
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-400 text-sm sm:text-base whitespace-nowrap">
                        {moneyFromCents(m.revenueFutureConfirmed, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Таблица по услугам */}
        <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-700/50">
            <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="7" cy="17" r="2.5" />
                <circle cx="7" cy="7" r="2.5" />
                <path d="M8.5 8.5 21 21M8.5 15.5 21 3" />
              </svg>
              Детальная статистика по услугам
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead className="bg-slate-800/50">
                <tr className="text-left text-xs sm:text-sm text-slate-300">
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap">Услуга</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Всего</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Выполнено</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Отменено</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Касса</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">% от общей</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {byServiceArr.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="font-medium text-white text-sm sm:text-base whitespace-nowrap">{s.name}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">{s.total}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">{s.done}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">{s.canceled}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-white text-sm sm:text-base whitespace-nowrap">
                      {moneyFromCents(s.revenueDone, currency)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-400 text-sm sm:text-base">
                      {total > 0 ? percent(s.total, total) : '0%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── helper components ───────── */

function Input({
  label,
  className,
  ...props
}: { label: string } & Omit<ComponentPropsWithoutRef<"input">, "className"> & {
    className?: string;
  }): ReactElement {
  return (
    <label className={`grid gap-1 text-sm ${className ?? ""}`}>
      <span className="text-slate-300 font-medium">{label}</span>
      <input
        {...props}
        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
      />
    </label>
  );
}

function Select(props: ComponentPropsWithoutRef<"select">): ReactElement {
  return (
    <select
      {...props}
      className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
    />
  );
}

/** Кнопка экспорта: форма GET → /admin/stats/export, без префетча, новая вкладка */
function ExportButton({
  title,
  type,
  period,
  from,
  to,
  currency,
  group,
}: {
  title: string;
  type: "raw" | "masters" | "services" | "timeline";
  period: string;
  from?: string;
  to?: string;
  currency: string;
  group: "day" | "week";
}): ReactElement {
  return (
    <form
      action="/admin/stats/export"
      method="GET"
      target="_blank"
      className="inline"
    >
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="period" value={period} />
      {from ? <input type="hidden" name="from" value={from} /> : null}
      {to ? <input type="hidden" name="to" value={to} /> : null}
      <input type="hidden" name="currency" value={currency} />
      <input type="hidden" name="group" value={group} />
      <input type="hidden" name="download" value="1" />
      <button
        type="submit"
        className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white hover:border-amber-500/30 transition-all"
      >
        {title}
      </button>
    </form>
  );
}






// // src/app/admin/stats/page.tsx
// import type { ReactElement, ComponentPropsWithoutRef } from "react";
// import React from "react";
// import Link from "next/link";
// import { prisma } from "@/lib/db";
// import { AppointmentStatus } from "@prisma/client";
// import {
//   addDays,
//   startOfDay,
//   startOfMonth,
//   startOfYear,
//   subMonths,
//   startOfWeek,
//   format,
// } from "date-fns";
// import { ru } from "date-fns/locale";

// // ✨ НОВЫЕ КОМПОНЕНТЫ
// import KPICard from './_components/KPICard';
// import RevenueChart from './_components/RevenueChart';
// import TopServicesChart from './_components/TopServicesChart';
// import TopMastersTable from './_components/TopMastersTable';

// type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// export const dynamic = "force-dynamic";

// /* ───────── helpers ───────── */

// function fmtDate(d: Date): string {
//   return format(d, "dd.MM.yyyy", { locale: ru });
// }
// function fmtDayShort(d: Date): string {
//   return format(d, "dd.MM", { locale: ru });
// }
// function moneyFromCents(cents: number, currency: string): string {
//   return new Intl.NumberFormat("ru-RU", {
//     style: "currency",
//     currency,
//     maximumFractionDigits: 0,
//   }).format((cents || 0) / 100);
// }
// function getOne(
//   sp: Record<string, string | string[] | undefined>,
//   key: string
// ): string | undefined {
//   const v = sp[key];
//   return Array.isArray(v) ? v[0] : v;
// }
// function percent(part: number, total: number): string {
//   if (!total) return "0%";
//   return `${Math.round((part / total) * 100)}%`;
// }
// function enc(v: string) {
//   return encodeURIComponent(v);
// }
// function qs(params: Record<string, string | undefined>): string {
//   const pairs = Object.entries(params).filter(([, v]) => v != null && v !== "");
//   return pairs.length
//     ? `?${pairs.map(([k, v]) => `${enc(k)}=${enc(v!)}`).join("&")}`
//     : "";
// }
// function trend(
//   curr: number,
//   prev: number
// ): { dir: "up" | "down" | "flat"; delta: number } {
//   if (prev === 0) {
//     if (curr === 0) return { dir: "flat", delta: 0 };
//     return { dir: "up", delta: 100 };
//   }
//   const delta = Math.round(((curr - prev) / prev) * 100);
//   if (delta > 0) return { dir: "up", delta };
//   if (delta < 0) return { dir: "down", delta };
//   return { dir: "flat", delta: 0 };
// }

// /** Рассчитываем границы периода [from, to) по пресету/ручному выбору */
// function resolveRange(sp: Record<string, string | string[] | undefined>): {
//   from: Date;
//   to: Date;
//   label: string;
//   period: string;
//   fromStr: string;
//   toStr: string;
// } {
//   const now = new Date();
//   const todayStart = startOfDay(now);

//   const period = getOne(sp, "period") ?? "thisMonth";
//   const fromStr = getOne(sp, "from");
//   const toStr = getOne(sp, "to");

//   let from = todayStart;
//   let to = addDays(todayStart, 1);
//   let label = "Сегодня";

//   switch (period) {
//     case "today": {
//       from = todayStart;
//       to = addDays(from, 1);
//       label = "Сегодня";
//       break;
//     }
//     case "7d": {
//       from = addDays(todayStart, -6);
//       to = addDays(todayStart, 1);
//       label = "Последние 7 дней";
//       break;
//     }
//     case "30d": {
//       from = addDays(todayStart, -29);
//       to = addDays(todayStart, 1);
//       label = "Последние 30 дней";
//       break;
//     }
//     case "thisMonth": {
//       from = startOfMonth(now);
//       const nextMonthStart = startOfMonth(addDays(now, 32));
//       to = nextMonthStart;
//       label = "Текущий месяц";
//       break;
//     }
//     case "lastMonth": {
//       const last = subMonths(now, 1);
//       from = startOfMonth(last);
//       const nextMonthStart = startOfMonth(addDays(last, 32));
//       to = nextMonthStart;
//       label = "Прошлый месяц";
//       break;
//     }
//     case "thisYear": {
//       from = startOfYear(now);
//       const nextYearStart = startOfYear(addDays(now, 370));
//       to = nextYearStart;
//       label = "Текущий год";
//       break;
//     }
//     case "custom": {
//       const f = fromStr ? new Date(fromStr) : todayStart;
//       const t = toStr
//         ? addDays(startOfDay(new Date(toStr)), 1)
//         : addDays(startOfDay(f), 1);
//       from = startOfDay(f);
//       to = t;
//       label = `C ${fmtDate(from)} по ${fmtDate(addDays(to, -1))}`;
//       break;
//     }
//     default: {
//       from = startOfMonth(now);
//       to = startOfMonth(addDays(now, 32));
//       label = "Текущий месяц";
//     }
//   }
//   return {
//     from,
//     to,
//     label,
//     period,
//     fromStr: fromStr ?? "",
//     toStr: toStr ?? "",
//   };
// }

// /* ───────── page ───────── */

// export default async function StatsPage({
//   searchParams,
// }: {
//   searchParams: SearchParams;
// }): Promise<ReactElement> {
//   const sp = await searchParams;
//   const { from, to, label, period, fromStr, toStr } = resolveRange(sp);
//   const currency = (getOne(sp, "currency") ?? "EUR").toUpperCase();
//   const group = getOne(sp, "group") === "week" ? "week" : "day";
//   const now = new Date();

//   // текущий период
//   const appts = await prisma.appointment.findMany({
//     where: { startAt: { gte: from, lt: to }, deletedAt: null },
//     select: {
//       id: true,
//       status: true,
//       startAt: true,
//       service: { select: { id: true, name: true, priceCents: true } },
//       master: { select: { id: true, name: true } },
//     },
//     orderBy: { startAt: "asc" },
//   });

//   // будущие подтверждённые записи (отдельный запрос, независимо от периода)
//   const futureApptsConfirmed = await prisma.appointment.findMany({
//     where: { 
//       startAt: { gte: now }, 
//       status: AppointmentStatus.CONFIRMED,
//       deletedAt: null 
//     },
//     select: {
//       id: true,
//       service: { select: { priceCents: true } },
//     },
//   });

//   // предыдущий период той же длительности
//   const periodMs = to.getTime() - from.getTime();
//   const prevFrom = new Date(from.getTime() - periodMs);
//   const prevTo = from;

//   const apptsPrev = await prisma.appointment.findMany({
//     where: { startAt: { gte: prevFrom, lt: prevTo }, deletedAt: null },
//     select: {
//       id: true,
//       status: true,
//       startAt: true,
//       service: { select: { id: true, name: true, priceCents: true } },
//       master: { select: { id: true, name: true } },
//     },
//     orderBy: { startAt: "asc" },
//   });

//   const sumCents = (
//     xs: typeof appts,
//     predicate: (a: (typeof appts)[number]) => boolean
//   ) =>
//     xs.reduce(
//       (acc, a) => (predicate(a) ? acc + (a.service?.priceCents ?? 0) : acc),
//       0
//     );

//   const count = (
//     xs: typeof appts,
//     pred: (a: (typeof appts)[number]) => boolean
//   ) => xs.reduce((n, a) => (pred(a) ? n + 1 : n), 0);

//   /* totals */
//   const total = appts.length;
//   const totalPrev = apptsPrev.length;

//   const done = count(appts, (a) => a.status === AppointmentStatus.DONE);
//   const donePrev = count(apptsPrev, (a) => a.status === AppointmentStatus.DONE);

//   // будущие подтверждённые (из отдельного запроса)
//   const futureConfirmed = futureApptsConfirmed.length;
//   const revenueFutureConfirmed = futureApptsConfirmed.reduce(
//     (acc, a) => acc + (a.service?.priceCents ?? 0),
//     0
//   );

//   const canceled = count(appts, (a) => a.status === AppointmentStatus.CANCELED);
//   const canceledPrev = count(
//     apptsPrev,
//     (a) => a.status === AppointmentStatus.CANCELED
//   );

//   const revenueDone = sumCents(
//     appts,
//     (a) => a.status === AppointmentStatus.DONE
//   );
//   const revenueDonePrev = sumCents(
//     apptsPrev,
//     (a) => a.status === AppointmentStatus.DONE
//   );

//   /* ───────── Тренды ───────── */
//   const totalTrend = trend(total, totalPrev);
//   const doneTrend = trend(done, donePrev);
//   const canceledTrend = trend(canceled, canceledPrev);
//   const revenueDoneTrend = trend(revenueDone, revenueDonePrev);

//   /* ───────── Разбивка по мастерам ───────── */
//   type Row = {
//     id: string;
//     name: string;
//     total: number;
//     done: number;
//     futureConfirmed: number;
//     canceled: number;
//     pending: number;
//     revenueDone: number;
//     revenueFutureConfirmed: number;
//   };
//   const byMaster = new Map<string, Row>();
//   for (const a of appts) {
//     const id = a.master?.id ?? "none";
//     const name = a.master?.name ?? "Без мастера";
//     const r = byMaster.get(id) ?? {
//       id,
//       name,
//       total: 0,
//       done: 0,
//       futureConfirmed: 0,
//       canceled: 0,
//       pending: 0,
//       revenueDone: 0,
//       revenueFutureConfirmed: 0,
//     };
//     r.total += 1;
//     if (a.status === AppointmentStatus.DONE) {
//       r.done += 1;
//       r.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CONFIRMED) {
//       if (a.startAt >= now) {
//         r.futureConfirmed += 1;
//         r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
//       }
//     } else if (a.status === AppointmentStatus.CANCELED) {
//       r.canceled += 1;
//     } else {
//       r.pending += 1;
//     }
//     byMaster.set(id, r);
//   }
//   const byMasterArr = [...byMaster.values()].sort(
//     (a, b) => b.revenueDone - a.revenueDone
//   );

//   // prev by master (для тренда по кассе)
//   const byMasterPrev = new Map<
//     string,
//     { revenueDone: number; done: number; canceled: number }
//   >();
//   for (const a of apptsPrev) {
//     const id = a.master?.id ?? "none";
//     const r = byMasterPrev.get(id) ?? { revenueDone: 0, done: 0, canceled: 0 };
//     if (a.status === AppointmentStatus.DONE) {
//       r.done += 1;
//       r.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CANCELED) {
//       r.canceled += 1;
//     }
//     byMasterPrev.set(id, r);
//   }

//   /* ───────── Разбивка по услугам ───────── */
//   type SvcRow = {
//     id: string;
//     name: string;
//     total: number;
//     done: number;
//     canceled: number;
//     revenueDone: number;
//   };
//   const byService = new Map<string, SvcRow>();
//   for (const a of appts) {
//     const id = a.service?.id ?? "none";
//     const name = a.service?.name ?? "Без услуги";
//     const r = byService.get(id) ?? {
//       id,
//       name,
//       total: 0,
//       done: 0,
//       canceled: 0,
//       revenueDone: 0,
//     };
//     r.total += 1;
//     if (a.status === AppointmentStatus.DONE) {
//       r.done += 1;
//       r.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CANCELED) {
//       r.canceled += 1;
//     }
//     byService.set(id, r);
//   }
//   const byServiceArr = [...byService.values()].sort(
//     (a, b) => b.revenueDone - a.revenueDone
//   );

//   /* ───────── Группировка по дням/неделям для sparkline ───────── */
//   type Daily = {
//     date: string; // ISO
//     total: number;
//     done: number;
//     canceled: number;
//     revenueDone: number;
//     revenueFutureConfirmed: number;
//   };
//   const grouped = new Map<string, Daily>();
//   for (const a of appts) {
//     let key: string;
//     if (group === "week") {
//       const weekStart = startOfWeek(a.startAt, { locale: ru });
//       key = weekStart.toISOString();
//     } else {
//       const dayStart = startOfDay(a.startAt);
//       key = dayStart.toISOString();
//     }
//     const r = grouped.get(key) ?? {
//       date: key,
//       total: 0,
//       done: 0,
//       canceled: 0,
//       revenueDone: 0,
//       revenueFutureConfirmed: 0,
//     };
//     r.total += 1;
//     if (a.status === AppointmentStatus.DONE) {
//       r.done += 1;
//       r.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CANCELED) {
//       r.canceled += 1;
//     } else if (a.status === AppointmentStatus.CONFIRMED && a.startAt >= now) {
//       r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
//     }
//     grouped.set(key, r);
//   }
//   const groupedData = [...grouped.values()].sort((a, b) =>
//     a.date.localeCompare(b.date)
//   );

//   return (
//     <div className="mx-auto max-w-[90rem] px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
//           📊 Статистика
//         </h1>
//         <p className="text-sm sm:text-base text-slate-400">
//           Аналитика работы салона за выбранный период
//         </p>
//       </div>

//       {/* Фильтры и настройки */}
//       <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6">
//         <form method="GET" className="space-y-4">
//           {/* Период */}
//           <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
//             <label className="grid gap-1 text-sm">
//               <span className="text-slate-300 font-medium">Период</span>
//               <Select name="period" defaultValue={period}>
//                 <option value="today">Сегодня</option>
//                 <option value="7d">7 дней</option>
//                 <option value="30d">30 дней</option>
//                 <option value="thisMonth">Месяц</option>
//                 <option value="lastMonth">Прошлый месяц</option>
//                 <option value="thisYear">Год</option>
//                 <option value="custom">Произвольный</option>
//               </Select>
//             </label>

//             {period === "custom" && (
//               <>
//                 <Input
//                   label="Дата с"
//                   type="date"
//                   name="from"
//                   defaultValue={fromStr}
//                 />
//                 <Input
//                   label="Дата по"
//                   type="date"
//                   name="to"
//                   defaultValue={toStr}
//                 />
//               </>
//             )}

//             <label className="grid gap-1 text-sm">
//               <span className="text-slate-300 font-medium">Валюта</span>
//               <Select name="currency" defaultValue={currency}>
//                 <option value="EUR">€ EUR</option>
//                 <option value="USD">$ USD</option>
//                 <option value="RUB">₽ RUB</option>
//               </Select>
//             </label>
//           </div>

//           {/* Кнопки */}
//           <div className="flex flex-wrap gap-3">
//             <button
//               type="submit"
//               className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all"
//             >
//               Применить
//             </button>
//             <Link
//               href="/admin/stats"
//               className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-all"
//             >
//               Сбросить
//             </Link>
//           </div>
//         </form>

//         {/* Период label */}
//         <div className="mt-4 pt-4 border-t border-slate-700/50">
//           <div className="flex items-center gap-2 text-sm">
//             <svg
//               className="w-5 h-5 text-slate-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <rect x="3" y="4" width="18" height="18" rx="2" />
//               <path d="M16 2v4M8 2v4M3 10h18" />
//             </svg>
//             <span className="text-slate-400">Период:</span>
//             <span className="text-white font-semibold">{label}</span>
//           </div>
//         </div>
//       </div>

//       {/* ✨ НОВЫЕ KPI КАРТОЧКИ */}
//       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
//         {/* Выручка */}
//         <KPICard
//           icon={
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <rect x="3" y="7" width="18" height="12" rx="2" />
//               <path d="M21 10h-5a2 2 0 0 0 0 4h5" />
//             </svg>
//           }
//           label="Выручка"
//           value={moneyFromCents(revenueDone, currency)}
//           trend={{
//             direction: revenueDoneTrend.dir,
//             value: `${revenueDoneTrend.delta > 0 ? '+' : ''}${revenueDoneTrend.delta}%`,
//             label: 'vs прошлый период',
//           }}
//           color="gold"
//         />

//         {/* Клиенты */}
//         <KPICard
//           icon={
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <circle cx="9" cy="7" r="3" />
//               <path d="M2 21a7 7 0 0 1 14 0" />
//               <circle cx="17" cy="9" r="2.5" />
//               <path d="M22 21a6 6 0 0 0-8-5.5" />
//             </svg>
//           }
//           label="Выполнено записей"
//           value={done}
//           trend={{
//             direction: doneTrend.dir,
//             value: `${doneTrend.delta > 0 ? '+' : ''}${doneTrend.delta}%`,
//             label: 'vs прошлый период',
//           }}
//           color="blue"
//         />

//         {/* Средний чек */}
//         <KPICard
//           icon={
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4" />
//             </svg>
//           }
//           label="Средний чек"
//           value={done > 0 ? moneyFromCents(Math.round(revenueDone / done), currency) : '0 €'}
//           trend={
//             donePrev > 0
//               ? {
//                   direction: trend(
//                     done > 0 ? revenueDone / done : 0,
//                     donePrev > 0 ? revenueDonePrev / donePrev : 0
//                   ).dir,
//                   value: `${trend(done > 0 ? revenueDone / done : 0, donePrev > 0 ? revenueDonePrev / donePrev : 0).delta > 0 ? '+' : ''}${trend(done > 0 ? revenueDone / done : 0, donePrev > 0 ? revenueDonePrev / donePrev : 0).delta}%`,
//                 }
//               : undefined
//           }
//           color="purple"
//         />

//         {/* Будущие записи */}
//         <KPICard
//           icon={
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path d="M9 12l2 2 4-4" />
//               <circle cx="12" cy="12" r="10" />
//             </svg>
//           }
//           label="Будущие записи"
//           value={futureConfirmed}
//           trend={{
//             direction: 'flat',
//             value: moneyFromCents(revenueFutureConfirmed, currency),
//             label: 'ожидаемая выручка',
//           }}
//           color="emerald"
//         />
//       </div>

//       {/* ✨ ГРАФИК ДИНАМИКИ ВЫРУЧКИ */}
//       <RevenueChart
//         data={groupedData.map((d) => ({
//           date: fmtDayShort(new Date(d.date)),
//           revenue: d.revenueDone / 100,
//           count: d.done,
//         }))}
//         currency={currency}
//       />

//       {/* ✨ ТОП УСЛУГИ И МАСТЕРА */}
//       <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
//         <TopServicesChart
//           data={byServiceArr.map((s) => ({
//             name: s.name,
//             revenue: s.revenueDone / 100,
//             count: s.done,
//             percentage: total > 0 ? (s.total / total) * 100 : 0,
//           }))}
//           currency={currency}
//         />

//         <TopMastersTable
//           data={byMasterArr.map((m) => ({
//             id: m.id,
//             name: m.name,
//             revenue: m.revenueDone,
//             count: m.done,
//             avgCheck: m.done > 0 ? Math.round(m.revenueDone / m.done) : 0,
//           }))}
//           currency={currency}
//         />
//       </div>

//       {/* Кнопки экспорта */}
//       <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-6">
//         <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
//           <svg
//             className="w-5 h-5 text-amber-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//             />
//           </svg>
//           Экспорт данных
//         </h3>
//         <div className="flex flex-wrap gap-3">
//           <ExportButton
//             title="Экспорт CSV — заявки"
//             type="raw"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//           <ExportButton
//             title="Экспорт CSV — мастера"
//             type="masters"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//           <ExportButton
//             title="Экспорт CSV — услуги"
//             type="services"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//           <ExportButton
//             title="Экспорт CSV — динамика"
//             type="timeline"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//         </div>
//       </div>

//       {/* Детальные таблицы */}
//       <div className="space-y-4 sm:space-y-6">
//         {/* Таблица по мастерам */}
//         <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
//           <div className="p-4 sm:p-6 border-b border-slate-700/50">
//             <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
//               <svg
//                 className="w-5 h-5 text-blue-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
//                 />
//               </svg>
//               Детальная статистика по мастерам
//             </h3>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[640px]">
//               <thead className="bg-slate-800/50">
//                 <tr className="text-left text-xs sm:text-sm text-slate-300">
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap">Мастер</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Всего</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Выполнено</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Будущие</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Отменено</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Касса</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Будущая касса</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-700/50">
//                 {byMasterArr.map((m) => {
//                   const prev = byMasterPrev.get(m.id);
//                   const trendRev = prev ? trend(m.revenueDone, prev.revenueDone) : null;
//                   return (
//                     <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
//                       <td className="px-3 sm:px-6 py-3 sm:py-4">
//                         <div className="font-medium text-white text-sm sm:text-base whitespace-nowrap">{m.name}</div>
//                       </td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">{m.total}</td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">
//                         {m.done}
//                         {prev && prev.done !== m.done && (
//                           <span className={`ml-2 text-xs ${m.done > prev.done ? 'text-emerald-400' : 'text-rose-400'}`}>
//                             {m.done > prev.done ? '↑' : '↓'}
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">{m.futureConfirmed}</td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">
//                         {m.canceled}
//                         {prev && prev.canceled !== m.canceled && (
//                           <span className={`ml-2 text-xs ${m.canceled < prev.canceled ? 'text-emerald-400' : 'text-rose-400'}`}>
//                             {m.canceled < prev.canceled ? '↓' : '↑'}
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
//                         <div className="font-semibold text-white text-sm sm:text-base whitespace-nowrap">
//                           {moneyFromCents(m.revenueDone, currency)}
//                         </div>
//                         {trendRev && trendRev.delta !== 0 && (
//                           <div className={`text-xs ${trendRev.dir === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
//                             {trendRev.dir === 'up' ? '↑' : '↓'} {Math.abs(trendRev.delta)}%
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-400 text-sm sm:text-base whitespace-nowrap">
//                         {moneyFromCents(m.revenueFutureConfirmed, currency)}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Таблица по услугам */}
//         <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
//           <div className="p-4 sm:p-6 border-b border-slate-700/50">
//             <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
//               <svg
//                 className="w-5 h-5 text-purple-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <circle cx="7" cy="17" r="2.5" />
//                 <circle cx="7" cy="7" r="2.5" />
//                 <path d="M8.5 8.5 21 21M8.5 15.5 21 3" />
//               </svg>
//               Детальная статистика по услугам
//             </h3>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[560px]">
//               <thead className="bg-slate-800/50">
//                 <tr className="text-left text-xs sm:text-sm text-slate-300">
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium whitespace-nowrap">Услуга</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Всего</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Выполнено</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Отменено</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">Касса</th>
//                   <th className="px-3 sm:px-6 py-2 sm:py-3 font-medium text-right whitespace-nowrap">% от общей</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-700/50">
//                 {byServiceArr.map((s) => (
//                   <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
//                     <td className="px-3 sm:px-6 py-3 sm:py-4">
//                       <div className="font-medium text-white text-sm sm:text-base whitespace-nowrap">{s.name}</div>
//                     </td>
//                     <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">{s.total}</td>
//                     <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">{s.done}</td>
//                     <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-300 text-sm sm:text-base">{s.canceled}</td>
//                     <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-white text-sm sm:text-base whitespace-nowrap">
//                       {moneyFromCents(s.revenueDone, currency)}
//                     </td>
//                     <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-slate-400 text-sm sm:text-base">
//                       {total > 0 ? percent(s.total, total) : '0%'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ───────── helper components ───────── */

// function Input({
//   label,
//   className,
//   ...props
// }: { label: string } & Omit<ComponentPropsWithoutRef<"input">, "className"> & {
//     className?: string;
//   }): ReactElement {
//   return (
//     <label className={`grid gap-1 text-sm ${className ?? ""}`}>
//       <span className="text-slate-300 font-medium">{label}</span>
//       <input
//         {...props}
//         className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
//       />
//     </label>
//   );
// }

// function Select(props: ComponentPropsWithoutRef<"select">): ReactElement {
//   return (
//     <select
//       {...props}
//       className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
//     />
//   );
// }

// /** Кнопка экспорта: форма GET → /admin/stats/export, без префетча, новая вкладка */
// function ExportButton({
//   title,
//   type,
//   period,
//   from,
//   to,
//   currency,
//   group,
// }: {
//   title: string;
//   type: "raw" | "masters" | "services" | "timeline";
//   period: string;
//   from?: string;
//   to?: string;
//   currency: string;
//   group: "day" | "week";
// }): ReactElement {
//   return (
//     <form
//       action="/admin/stats/export"
//       method="GET"
//       target="_blank"
//       className="inline"
//     >
//       <input type="hidden" name="type" value={type} />
//       <input type="hidden" name="period" value={period} />
//       {from ? <input type="hidden" name="from" value={from} /> : null}
//       {to ? <input type="hidden" name="to" value={to} /> : null}
//       <input type="hidden" name="currency" value={currency} />
//       <input type="hidden" name="group" value={group} />
//       <input type="hidden" name="download" value="1" />
//       <button
//         type="submit"
//         className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white hover:border-amber-500/30 transition-all"
//       >
//         {title}
//       </button>
//     </form>
//   );
// }






// // src/app/admin/stats/page.tsx
// import type { ReactElement, ComponentPropsWithoutRef } from "react";
// import React from "react";
// import Link from "next/link";
// import { prisma } from "@/lib/db";
// import { AppointmentStatus } from "@prisma/client";
// import {
//   addDays,
//   startOfDay,
//   startOfMonth,
//   startOfYear,
//   subMonths,
//   startOfWeek,
//   format,
// } from "date-fns";
// import { ru } from "date-fns/locale";

// // ✨ НОВЫЕ КОМПОНЕНТЫ
// import KPICard from './_components/KPICard';
// import RevenueChart from './_components/RevenueChart';
// import TopServicesChart from './_components/TopServicesChart';
// import TopMastersTable from './_components/TopMastersTable';

// type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// export const dynamic = "force-dynamic";

// /* ───────── helpers ───────── */

// function fmtDate(d: Date): string {
//   return format(d, "dd.MM.yyyy", { locale: ru });
// }
// function fmtDayShort(d: Date): string {
//   return format(d, "dd.MM", { locale: ru });
// }
// function moneyFromCents(cents: number, currency: string): string {
//   return new Intl.NumberFormat("ru-RU", {
//     style: "currency",
//     currency,
//     maximumFractionDigits: 0,
//   }).format((cents || 0) / 100);
// }
// function getOne(
//   sp: Record<string, string | string[] | undefined>,
//   key: string
// ): string | undefined {
//   const v = sp[key];
//   return Array.isArray(v) ? v[0] : v;
// }
// function percent(part: number, total: number): string {
//   if (!total) return "0%";
//   return `${Math.round((part / total) * 100)}%`;
// }
// function enc(v: string) {
//   return encodeURIComponent(v);
// }
// function qs(params: Record<string, string | undefined>): string {
//   const pairs = Object.entries(params).filter(([, v]) => v != null && v !== "");
//   return pairs.length
//     ? `?${pairs.map(([k, v]) => `${enc(k)}=${enc(v!)}`).join("&")}`
//     : "";
// }
// function trend(
//   curr: number,
//   prev: number
// ): { dir: "up" | "down" | "flat"; delta: number } {
//   if (prev === 0) {
//     if (curr === 0) return { dir: "flat", delta: 0 };
//     return { dir: "up", delta: 100 };
//   }
//   const delta = Math.round(((curr - prev) / prev) * 100);
//   if (delta > 0) return { dir: "up", delta };
//   if (delta < 0) return { dir: "down", delta };
//   return { dir: "flat", delta: 0 };
// }

// /** Рассчитываем границы периода [from, to) по пресету/ручному выбору */
// function resolveRange(sp: Record<string, string | string[] | undefined>): {
//   from: Date;
//   to: Date;
//   label: string;
//   period: string;
//   fromStr: string;
//   toStr: string;
// } {
//   const now = new Date();
//   const todayStart = startOfDay(now);

//   const period = getOne(sp, "period") ?? "thisMonth";
//   const fromStr = getOne(sp, "from");
//   const toStr = getOne(sp, "to");

//   let from = todayStart;
//   let to = addDays(todayStart, 1);
//   let label = "Сегодня";

//   switch (period) {
//     case "today": {
//       from = todayStart;
//       to = addDays(from, 1);
//       label = "Сегодня";
//       break;
//     }
//     case "7d": {
//       from = addDays(todayStart, -6);
//       to = addDays(todayStart, 1);
//       label = "Последние 7 дней";
//       break;
//     }
//     case "30d": {
//       from = addDays(todayStart, -29);
//       to = addDays(todayStart, 1);
//       label = "Последние 30 дней";
//       break;
//     }
//     case "thisMonth": {
//       from = startOfMonth(now);
//       const nextMonthStart = startOfMonth(addDays(now, 32));
//       to = nextMonthStart;
//       label = "Текущий месяц";
//       break;
//     }
//     case "lastMonth": {
//       const last = subMonths(now, 1);
//       from = startOfMonth(last);
//       const nextMonthStart = startOfMonth(addDays(last, 32));
//       to = nextMonthStart;
//       label = "Прошлый месяц";
//       break;
//     }
//     case "thisYear": {
//       from = startOfYear(now);
//       const nextYearStart = startOfYear(addDays(now, 370));
//       to = nextYearStart;
//       label = "Текущий год";
//       break;
//     }
//     case "custom": {
//       const f = fromStr ? new Date(fromStr) : todayStart;
//       const t = toStr
//         ? addDays(startOfDay(new Date(toStr)), 1)
//         : addDays(startOfDay(f), 1);
//       from = startOfDay(f);
//       to = t;
//       label = `C ${fmtDate(from)} по ${fmtDate(addDays(to, -1))}`;
//       break;
//     }
//     default: {
//       from = startOfMonth(now);
//       to = startOfMonth(addDays(now, 32));
//       label = "Текущий месяц";
//     }
//   }
//   return {
//     from,
//     to,
//     label,
//     period,
//     fromStr: fromStr ?? "",
//     toStr: toStr ?? "",
//   };
// }

// /* ───────── page ───────── */

// export default async function StatsPage({
//   searchParams,
// }: {
//   searchParams: SearchParams;
// }): Promise<ReactElement> {
//   const sp = await searchParams;
//   const { from, to, label, period, fromStr, toStr } = resolveRange(sp);
//   const currency = (getOne(sp, "currency") ?? "EUR").toUpperCase();
//   const group = getOne(sp, "group") === "week" ? "week" : "day";
//   const now = new Date();

//   // текущий период
//   const appts = await prisma.appointment.findMany({
//     where: { startAt: { gte: from, lt: to }, deletedAt: null },
//     select: {
//       id: true,
//       status: true,
//       startAt: true,
//       service: { select: { id: true, name: true, priceCents: true } },
//       master: { select: { id: true, name: true } },
//     },
//     orderBy: { startAt: "asc" },
//   });

//   // предыдущий период той же длительности
//   const periodMs = to.getTime() - from.getTime();
//   const prevFrom = new Date(from.getTime() - periodMs);
//   const prevTo = from;

//   const apptsPrev = await prisma.appointment.findMany({
//     where: { startAt: { gte: prevFrom, lt: prevTo }, deletedAt: null },
//     select: {
//       id: true,
//       status: true,
//       startAt: true,
//       service: { select: { id: true, name: true, priceCents: true } },
//       master: { select: { id: true, name: true } },
//     },
//     orderBy: { startAt: "asc" },
//   });

//   const sumCents = (
//     xs: typeof appts,
//     predicate: (a: (typeof appts)[number]) => boolean
//   ) =>
//     xs.reduce(
//       (acc, a) => (predicate(a) ? acc + (a.service?.priceCents ?? 0) : acc),
//       0
//     );

//   const count = (
//     xs: typeof appts,
//     pred: (a: (typeof appts)[number]) => boolean
//   ) => xs.reduce((n, a) => (pred(a) ? n + 1 : n), 0);

//   /* totals */
//   const total = appts.length;
//   const totalPrev = apptsPrev.length;

//   const done = count(appts, (a) => a.status === AppointmentStatus.DONE);
//   const donePrev = count(apptsPrev, (a) => a.status === AppointmentStatus.DONE);

//   const futureConfirmed = count(
//     appts,
//     (a) => a.status === AppointmentStatus.CONFIRMED && a.startAt >= now
//   );

//   const canceled = count(appts, (a) => a.status === AppointmentStatus.CANCELED);
//   const canceledPrev = count(
//     apptsPrev,
//     (a) => a.status === AppointmentStatus.CANCELED
//   );

//   const revenueDone = sumCents(
//     appts,
//     (a) => a.status === AppointmentStatus.DONE
//   );
//   const revenueDonePrev = sumCents(
//     apptsPrev,
//     (a) => a.status === AppointmentStatus.DONE
//   );

//   const revenueFutureConfirmed = sumCents(
//     appts,
//     (a) => a.status === AppointmentStatus.CONFIRMED && a.startAt >= now
//   );

//   /* ───────── Тренды ───────── */
//   const totalTrend = trend(total, totalPrev);
//   const doneTrend = trend(done, donePrev);
//   const canceledTrend = trend(canceled, canceledPrev);
//   const revenueDoneTrend = trend(revenueDone, revenueDonePrev);

//   /* ───────── Разбивка по мастерам ───────── */
//   type Row = {
//     id: string;
//     name: string;
//     total: number;
//     done: number;
//     futureConfirmed: number;
//     canceled: number;
//     pending: number;
//     revenueDone: number;
//     revenueFutureConfirmed: number;
//   };
//   const byMaster = new Map<string, Row>();
//   for (const a of appts) {
//     const id = a.master?.id ?? "none";
//     const name = a.master?.name ?? "Без мастера";
//     const r = byMaster.get(id) ?? {
//       id,
//       name,
//       total: 0,
//       done: 0,
//       futureConfirmed: 0,
//       canceled: 0,
//       pending: 0,
//       revenueDone: 0,
//       revenueFutureConfirmed: 0,
//     };
//     r.total += 1;
//     if (a.status === AppointmentStatus.DONE) {
//       r.done += 1;
//       r.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CONFIRMED) {
//       if (a.startAt >= now) {
//         r.futureConfirmed += 1;
//         r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
//       }
//     } else if (a.status === AppointmentStatus.CANCELED) {
//       r.canceled += 1;
//     } else {
//       r.pending += 1;
//     }
//     byMaster.set(id, r);
//   }
//   const byMasterArr = [...byMaster.values()].sort(
//     (a, b) => b.revenueDone - a.revenueDone
//   );

//   // prev by master (для тренда по кассе)
//   const byMasterPrev = new Map<
//     string,
//     { revenueDone: number; done: number; canceled: number }
//   >();
//   for (const a of apptsPrev) {
//     const id = a.master?.id ?? "none";
//     const r = byMasterPrev.get(id) ?? { revenueDone: 0, done: 0, canceled: 0 };
//     if (a.status === AppointmentStatus.DONE) {
//       r.done += 1;
//       r.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CANCELED) {
//       r.canceled += 1;
//     }
//     byMasterPrev.set(id, r);
//   }

//   /* ───────── Разбивка по услугам ───────── */
//   type SvcRow = {
//     id: string;
//     name: string;
//     total: number;
//     done: number;
//     canceled: number;
//     revenueDone: number;
//   };
//   const byService = new Map<string, SvcRow>();
//   for (const a of appts) {
//     const id = a.service?.id ?? "none";
//     const name = a.service?.name ?? "Без услуги";
//     const r = byService.get(id) ?? {
//       id,
//       name,
//       total: 0,
//       done: 0,
//       canceled: 0,
//       revenueDone: 0,
//     };
//     r.total += 1;
//     if (a.status === AppointmentStatus.DONE) {
//       r.done += 1;
//       r.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CANCELED) {
//       r.canceled += 1;
//     }
//     byService.set(id, r);
//   }
//   const byServiceArr = [...byService.values()].sort(
//     (a, b) => b.revenueDone - a.revenueDone
//   );

//   /* ───────── Группировка по дням/неделям для sparkline ───────── */
//   type Daily = {
//     date: string; // ISO
//     total: number;
//     done: number;
//     canceled: number;
//     revenueDone: number;
//     revenueFutureConfirmed: number;
//   };
//   const grouped = new Map<string, Daily>();
//   for (const a of appts) {
//     let key: string;
//     if (group === "week") {
//       const weekStart = startOfWeek(a.startAt, { locale: ru });
//       key = weekStart.toISOString();
//     } else {
//       const dayStart = startOfDay(a.startAt);
//       key = dayStart.toISOString();
//     }
//     const r = grouped.get(key) ?? {
//       date: key,
//       total: 0,
//       done: 0,
//       canceled: 0,
//       revenueDone: 0,
//       revenueFutureConfirmed: 0,
//     };
//     r.total += 1;
//     if (a.status === AppointmentStatus.DONE) {
//       r.done += 1;
//       r.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CANCELED) {
//       r.canceled += 1;
//     } else if (a.status === AppointmentStatus.CONFIRMED && a.startAt >= now) {
//       r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
//     }
//     grouped.set(key, r);
//   }
//   const groupedData = [...grouped.values()].sort((a, b) =>
//     a.date.localeCompare(b.date)
//   );

//   return (
//     <div className="mx-auto max-w-[90rem] p-6 space-y-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold text-white mb-2">
//           📊 Статистика
//         </h1>
//         <p className="text-slate-400">
//           Аналитика работы салона за выбранный период
//         </p>
//       </div>

//       {/* Фильтры и настройки */}
//       <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
//         <form method="GET" className="space-y-4">
//           {/* Период */}
//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             <label className="grid gap-1 text-sm">
//               <span className="text-slate-300 font-medium">Период</span>
//               <Select name="period" defaultValue={period}>
//                 <option value="today">Сегодня</option>
//                 <option value="7d">7 дней</option>
//                 <option value="30d">30 дней</option>
//                 <option value="thisMonth">Месяц</option>
//                 <option value="lastMonth">Прошлый месяц</option>
//                 <option value="thisYear">Год</option>
//                 <option value="custom">Произвольный</option>
//               </Select>
//             </label>

//             {period === "custom" && (
//               <>
//                 <Input
//                   label="Дата с"
//                   type="date"
//                   name="from"
//                   defaultValue={fromStr}
//                 />
//                 <Input
//                   label="Дата по"
//                   type="date"
//                   name="to"
//                   defaultValue={toStr}
//                 />
//               </>
//             )}

//             <label className="grid gap-1 text-sm">
//               <span className="text-slate-300 font-medium">Валюта</span>
//               <Select name="currency" defaultValue={currency}>
//                 <option value="EUR">€ EUR</option>
//                 <option value="USD">$ USD</option>
//                 <option value="RUB">₽ RUB</option>
//               </Select>
//             </label>
//           </div>

//           {/* Кнопки */}
//           <div className="flex flex-wrap gap-3">
//             <button
//               type="submit"
//               className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-yellow-600 transition-all"
//             >
//               Применить
//             </button>
//             <Link
//               href="/admin/stats"
//               className="px-6 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-all"
//             >
//               Сбросить
//             </Link>
//           </div>
//         </form>

//         {/* Период label */}
//         <div className="mt-4 pt-4 border-t border-slate-700/50">
//           <div className="flex items-center gap-2 text-sm">
//             <svg
//               className="w-5 h-5 text-slate-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <rect x="3" y="4" width="18" height="18" rx="2" />
//               <path d="M16 2v4M8 2v4M3 10h18" />
//             </svg>
//             <span className="text-slate-400">Период:</span>
//             <span className="text-white font-semibold">{label}</span>
//           </div>
//         </div>
//       </div>

//       {/* ✨ НОВЫЕ KPI КАРТОЧКИ */}
//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//         {/* Выручка */}
//         <KPICard
//           icon={
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <rect x="3" y="7" width="18" height="12" rx="2" />
//               <path d="M21 10h-5a2 2 0 0 0 0 4h5" />
//             </svg>
//           }
//           label="Выручка"
//           value={moneyFromCents(revenueDone, currency)}
//           trend={{
//             direction: revenueDoneTrend.dir,
//             value: `${revenueDoneTrend.delta > 0 ? '+' : ''}${revenueDoneTrend.delta}%`,
//             label: 'vs прошлый период',
//           }}
//           color="gold"
//         />

//         {/* Клиенты */}
//         <KPICard
//           icon={
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <circle cx="9" cy="7" r="3" />
//               <path d="M2 21a7 7 0 0 1 14 0" />
//               <circle cx="17" cy="9" r="2.5" />
//               <path d="M22 21a6 6 0 0 0-8-5.5" />
//             </svg>
//           }
//           label="Выполнено записей"
//           value={done}
//           trend={{
//             direction: doneTrend.dir,
//             value: `${doneTrend.delta > 0 ? '+' : ''}${doneTrend.delta}%`,
//             label: 'vs прошлый период',
//           }}
//           color="blue"
//         />

//         {/* Средний чек */}
//         <KPICard
//           icon={
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4" />
//             </svg>
//           }
//           label="Средний чек"
//           value={done > 0 ? moneyFromCents(Math.round(revenueDone / done), currency) : '0 €'}
//           trend={
//             donePrev > 0
//               ? {
//                   direction: trend(
//                     done > 0 ? revenueDone / done : 0,
//                     donePrev > 0 ? revenueDonePrev / donePrev : 0
//                   ).dir,
//                   value: `${trend(done > 0 ? revenueDone / done : 0, donePrev > 0 ? revenueDonePrev / donePrev : 0).delta > 0 ? '+' : ''}${trend(done > 0 ? revenueDone / done : 0, donePrev > 0 ? revenueDonePrev / donePrev : 0).delta}%`,
//                 }
//               : undefined
//           }
//           color="purple"
//         />

//         {/* Будущие записи */}
//         <KPICard
//           icon={
//             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path d="M9 12l2 2 4-4" />
//               <circle cx="12" cy="12" r="10" />
//             </svg>
//           }
//           label="Будущие записи"
//           value={futureConfirmed}
//           trend={{
//             direction: 'flat',
//             value: moneyFromCents(revenueFutureConfirmed, currency),
//             label: 'ожидаемая выручка',
//           }}
//           color="emerald"
//         />
//       </div>

//       {/* ✨ ГРАФИК ДИНАМИКИ ВЫРУЧКИ */}
//       <RevenueChart
//         data={groupedData.map((d) => ({
//           date: fmtDayShort(new Date(d.date)),
//           revenue: d.revenueDone / 100,
//           count: d.done,
//         }))}
//         currency={currency}
//       />

//       {/* ✨ ТОП УСЛУГИ И МАСТЕРА */}
//       <div className="grid gap-6 lg:grid-cols-2">
//         <TopServicesChart
//           data={byServiceArr.map((s) => ({
//             name: s.name,
//             revenue: s.revenueDone / 100,
//             count: s.done,
//             percentage: total > 0 ? (s.total / total) * 100 : 0,
//           }))}
//           currency={currency}
//         />

//         <TopMastersTable
//           data={byMasterArr.map((m) => ({
//             id: m.id,
//             name: m.name,
//             revenue: m.revenueDone,
//             count: m.done,
//             avgCheck: m.done > 0 ? Math.round(m.revenueDone / m.done) : 0,
//           }))}
//           currency={currency}
//         />
//       </div>

//       {/* Кнопки экспорта */}
//       <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-6">
//         <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//           <svg
//             className="w-5 h-5 text-amber-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//             />
//           </svg>
//           Экспорт данных
//         </h3>
//         <div className="flex flex-wrap gap-3">
//           <ExportButton
//             title="Экспорт CSV — заявки"
//             type="raw"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//           <ExportButton
//             title="Экспорт CSV — мастера"
//             type="masters"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//           <ExportButton
//             title="Экспорт CSV — услуги"
//             type="services"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//           <ExportButton
//             title="Экспорт CSV — динамика"
//             type="timeline"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//         </div>
//       </div>

//       {/* Детальные таблицы */}
//       <div className="space-y-6">
//         {/* Таблица по мастерам */}
//         <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
//           <div className="p-6 border-b border-slate-700/50">
//             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
//               <svg
//                 className="w-5 h-5 text-blue-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
//                 />
//               </svg>
//               Детальная статистика по мастерам
//             </h3>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-slate-800/50">
//                 <tr className="text-left text-sm text-slate-300">
//                   <th className="px-6 py-3 font-medium">Мастер</th>
//                   <th className="px-6 py-3 font-medium text-right">Всего</th>
//                   <th className="px-6 py-3 font-medium text-right">Выполнено</th>
//                   <th className="px-6 py-3 font-medium text-right">Будущие</th>
//                   <th className="px-6 py-3 font-medium text-right">Отменено</th>
//                   <th className="px-6 py-3 font-medium text-right">Касса</th>
//                   <th className="px-6 py-3 font-medium text-right">Будущая касса</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-700/50">
//                 {byMasterArr.map((m) => {
//                   const prev = byMasterPrev.get(m.id);
//                   const trendRev = prev ? trend(m.revenueDone, prev.revenueDone) : null;
//                   return (
//                     <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="font-medium text-white">{m.name}</div>
//                       </td>
//                       <td className="px-6 py-4 text-right text-slate-300">{m.total}</td>
//                       <td className="px-6 py-4 text-right text-slate-300">
//                         {m.done}
//                         {prev && prev.done !== m.done && (
//                           <span className={`ml-2 text-xs ${m.done > prev.done ? 'text-emerald-400' : 'text-rose-400'}`}>
//                             {m.done > prev.done ? '↑' : '↓'}
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 text-right text-slate-300">{m.futureConfirmed}</td>
//                       <td className="px-6 py-4 text-right text-slate-300">
//                         {m.canceled}
//                         {prev && prev.canceled !== m.canceled && (
//                           <span className={`ml-2 text-xs ${m.canceled < prev.canceled ? 'text-emerald-400' : 'text-rose-400'}`}>
//                             {m.canceled < prev.canceled ? '↓' : '↑'}
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <div className="font-semibold text-white">
//                           {moneyFromCents(m.revenueDone, currency)}
//                         </div>
//                         {trendRev && trendRev.delta !== 0 && (
//                           <div className={`text-xs ${trendRev.dir === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
//                             {trendRev.dir === 'up' ? '↑' : '↓'} {Math.abs(trendRev.delta)}%
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 text-right text-slate-400">
//                         {moneyFromCents(m.revenueFutureConfirmed, currency)}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Таблица по услугам */}
//         <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 overflow-hidden">
//           <div className="p-6 border-b border-slate-700/50">
//             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
//               <svg
//                 className="w-5 h-5 text-purple-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <circle cx="7" cy="17" r="2.5" />
//                 <circle cx="7" cy="7" r="2.5" />
//                 <path d="M8.5 8.5 21 21M8.5 15.5 21 3" />
//               </svg>
//               Детальная статистика по услугам
//             </h3>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-slate-800/50">
//                 <tr className="text-left text-sm text-slate-300">
//                   <th className="px-6 py-3 font-medium">Услуга</th>
//                   <th className="px-6 py-3 font-medium text-right">Всего</th>
//                   <th className="px-6 py-3 font-medium text-right">Выполнено</th>
//                   <th className="px-6 py-3 font-medium text-right">Отменено</th>
//                   <th className="px-6 py-3 font-medium text-right">Касса</th>
//                   <th className="px-6 py-3 font-medium text-right">% от общей</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-700/50">
//                 {byServiceArr.map((s) => (
//                   <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
//                     <td className="px-6 py-4">
//                       <div className="font-medium text-white">{s.name}</div>
//                     </td>
//                     <td className="px-6 py-4 text-right text-slate-300">{s.total}</td>
//                     <td className="px-6 py-4 text-right text-slate-300">{s.done}</td>
//                     <td className="px-6 py-4 text-right text-slate-300">{s.canceled}</td>
//                     <td className="px-6 py-4 text-right font-semibold text-white">
//                       {moneyFromCents(s.revenueDone, currency)}
//                     </td>
//                     <td className="px-6 py-4 text-right text-slate-400">
//                       {total > 0 ? percent(s.total, total) : '0%'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ───────── helper components ───────── */

// function Input({
//   label,
//   className,
//   ...props
// }: { label: string } & Omit<ComponentPropsWithoutRef<"input">, "className"> & {
//     className?: string;
//   }): ReactElement {
//   return (
//     <label className={`grid gap-1 text-sm ${className ?? ""}`}>
//       <span className="text-slate-300 font-medium">{label}</span>
//       <input
//         {...props}
//         className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
//       />
//     </label>
//   );
// }

// function Select(props: ComponentPropsWithoutRef<"select">): ReactElement {
//   return (
//     <select
//       {...props}
//       className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
//     />
//   );
// }

// /** Кнопка экспорта: форма GET → /admin/stats/export, без префетча, новая вкладка */
// function ExportButton({
//   title,
//   type,
//   period,
//   from,
//   to,
//   currency,
//   group,
// }: {
//   title: string;
//   type: "raw" | "masters" | "services" | "timeline";
//   period: string;
//   from?: string;
//   to?: string;
//   currency: string;
//   group: "day" | "week";
// }): ReactElement {
//   return (
//     <form
//       action="/admin/stats/export"
//       method="GET"
//       target="_blank"
//       className="inline"
//     >
//       <input type="hidden" name="type" value={type} />
//       <input type="hidden" name="period" value={period} />
//       {from ? <input type="hidden" name="from" value={from} /> : null}
//       {to ? <input type="hidden" name="to" value={to} /> : null}
//       <input type="hidden" name="currency" value={currency} />
//       <input type="hidden" name="group" value={group} />
//       <input type="hidden" name="download" value="1" />
//       <button
//         type="submit"
//         className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white hover:border-amber-500/30 transition-all"
//       >
//         {title}
//       </button>
//     </form>
//   );
// }




//---------работало до 13.01.26 добавляем дизаайн и графики  ----------------
// // src/app/admin/stats/page.tsx
// import type { ReactElement, ComponentPropsWithoutRef } from "react";
// import React from "react";
// import Link from "next/link";
// import { prisma } from "@/lib/db";
// import { AppointmentStatus } from "@prisma/client";
// import {
//   addDays,
//   startOfDay,
//   startOfMonth,
//   startOfYear,
//   subMonths,
//   startOfWeek,
//   format,
// } from "date-fns";
// import { ru } from "date-fns/locale";

// type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// export const dynamic = "force-dynamic";

// /* ───────── helpers ───────── */

// function fmtDate(d: Date): string {
//   return format(d, "dd.MM.yyyy", { locale: ru });
// }
// function fmtDayShort(d: Date): string {
//   return format(d, "dd.MM", { locale: ru });
// }
// function moneyFromCents(cents: number, currency: string): string {
//   return new Intl.NumberFormat("ru-RU", {
//     style: "currency",
//     currency,
//     maximumFractionDigits: 0,
//   }).format((cents || 0) / 100);
// }
// function getOne(
//   sp: Record<string, string | string[] | undefined>,
//   key: string
// ): string | undefined {
//   const v = sp[key];
//   return Array.isArray(v) ? v[0] : v;
// }
// function percent(part: number, total: number): string {
//   if (!total) return "0%";
//   return `${Math.round((part / total) * 100)}%`;
// }
// function enc(v: string) {
//   return encodeURIComponent(v);
// }
// function qs(params: Record<string, string | undefined>): string {
//   const pairs = Object.entries(params).filter(([, v]) => v != null && v !== "");
//   return pairs.length
//     ? `?${pairs.map(([k, v]) => `${enc(k)}=${enc(v!)}`).join("&")}`
//     : "";
// }
// function trend(
//   curr: number,
//   prev: number
// ): { dir: "up" | "down" | "flat"; delta: number } {
//   if (prev === 0) {
//     if (curr === 0) return { dir: "flat", delta: 0 };
//     return { dir: "up", delta: 100 };
//   }
//   const delta = Math.round(((curr - prev) / prev) * 100);
//   if (delta > 0) return { dir: "up", delta };
//   if (delta < 0) return { dir: "down", delta };
//   return { dir: "flat", delta: 0 };
// }

// /** Рассчитываем границы периода [from, to) по пресету/ручному выбору */
// function resolveRange(sp: Record<string, string | string[] | undefined>): {
//   from: Date;
//   to: Date;
//   label: string;
//   period: string;
//   fromStr: string;
//   toStr: string;
// } {
//   const now = new Date();
//   const todayStart = startOfDay(now);

//   const period = getOne(sp, "period") ?? "thisMonth";
//   const fromStr = getOne(sp, "from");
//   const toStr = getOne(sp, "to");

//   let from = todayStart;
//   let to = addDays(todayStart, 1);
//   let label = "Сегодня";

//   switch (period) {
//     case "today": {
//       from = todayStart;
//       to = addDays(from, 1);
//       label = "Сегодня";
//       break;
//     }
//     case "7d": {
//       from = addDays(todayStart, -6);
//       to = addDays(todayStart, 1);
//       label = "Последние 7 дней";
//       break;
//     }
//     case "30d": {
//       from = addDays(todayStart, -29);
//       to = addDays(todayStart, 1);
//       label = "Последние 30 дней";
//       break;
//     }
//     case "thisMonth": {
//       from = startOfMonth(now);
//       const nextMonthStart = startOfMonth(addDays(now, 32));
//       to = nextMonthStart;
//       label = "Текущий месяц";
//       break;
//     }
//     case "lastMonth": {
//       const last = subMonths(now, 1);
//       from = startOfMonth(last);
//       const nextMonthStart = startOfMonth(addDays(last, 32));
//       to = nextMonthStart;
//       label = "Прошлый месяц";
//       break;
//     }
//     case "thisYear": {
//       from = startOfYear(now);
//       const nextYearStart = startOfYear(addDays(now, 370));
//       to = nextYearStart;
//       label = "Текущий год";
//       break;
//     }
//     case "custom": {
//       const f = fromStr ? new Date(fromStr) : todayStart;
//       const t = toStr
//         ? addDays(startOfDay(new Date(toStr)), 1)
//         : addDays(startOfDay(f), 1);
//       from = startOfDay(f);
//       to = t;
//       label = `C ${fmtDate(from)} по ${fmtDate(addDays(to, -1))}`;
//       break;
//     }
//     default: {
//       from = startOfMonth(now);
//       to = startOfMonth(addDays(now, 32));
//       label = "Текущий месяц";
//     }
//   }
//   return {
//     from,
//     to,
//     label,
//     period,
//     fromStr: fromStr ?? "",
//     toStr: toStr ?? "",
//   };
// }

// /* ───────── page ───────── */

// export default async function StatsPage({
//   searchParams,
// }: {
//   searchParams: SearchParams;
// }): Promise<ReactElement> {
//   const sp = await searchParams;
//   const { from, to, label, period, fromStr, toStr } = resolveRange(sp);
//   const currency = (getOne(sp, "currency") ?? "EUR").toUpperCase();
//   const group = getOne(sp, "group") === "week" ? "week" : "day";
//   const now = new Date();

//   // текущий период
//   const appts = await prisma.appointment.findMany({
//     where: { startAt: { gte: from, lt: to } },
//     select: {
//       id: true,
//       status: true,
//       startAt: true,
//       service: { select: { id: true, name: true, priceCents: true } },
//       master: { select: { id: true, name: true } },
//     },
//     orderBy: { startAt: "asc" },
//   });

//   // предыдущий период той же длительности
//   const periodMs = to.getTime() - from.getTime();
//   const prevFrom = new Date(from.getTime() - periodMs);
//   const prevTo = from;

//   const apptsPrev = await prisma.appointment.findMany({
//     where: { startAt: { gte: prevFrom, lt: prevTo } },
//     select: {
//       id: true,
//       status: true,
//       startAt: true,
//       service: { select: { id: true, name: true, priceCents: true } },
//       master: { select: { id: true, name: true } },
//     },
//     orderBy: { startAt: "asc" },
//   });

//   const sumCents = (
//     xs: typeof appts,
//     predicate: (a: (typeof appts)[number]) => boolean
//   ) =>
//     xs.reduce(
//       (acc, a) => (predicate(a) ? acc + (a.service?.priceCents ?? 0) : acc),
//       0
//     );

//   const count = (
//     xs: typeof appts,
//     pred: (a: (typeof appts)[number]) => boolean
//   ) => xs.reduce((n, a) => (pred(a) ? n + 1 : n), 0);

//   /* totals */
//   const total = appts.length;
//   const totalPrev = apptsPrev.length;

//   const done = count(appts, (a) => a.status === AppointmentStatus.DONE);
//   const donePrev = count(apptsPrev, (a) => a.status === AppointmentStatus.DONE);

//   const futureConfirmed = count(
//     appts,
//     (a) => a.status === AppointmentStatus.CONFIRMED && a.startAt >= now
//   );

//   const canceled = count(appts, (a) => a.status === AppointmentStatus.CANCELED);
//   const canceledPrev = count(
//     apptsPrev,
//     (a) => a.status === AppointmentStatus.CANCELED
//   );

//   const revenueDone = sumCents(
//     appts,
//     (a) => a.status === AppointmentStatus.DONE
//   );
//   const revenueDonePrev = sumCents(
//     apptsPrev,
//     (a) => a.status === AppointmentStatus.DONE
//   );

//   const revenueFutureConfirmed = sumCents(
//     appts,
//     (a) => a.status === AppointmentStatus.CONFIRMED && a.startAt >= now
//   );

//   /* ───────── Разбивка по мастерам ───────── */
//   type Row = {
//     id: string;
//     name: string;
//     total: number;
//     done: number;
//     futureConfirmed: number;
//     canceled: number;
//     pending: number;
//     revenueDone: number;
//     revenueFutureConfirmed: number;
//   };
//   const byMaster = new Map<string, Row>();
//   for (const a of appts) {
//     const id = a.master?.id ?? "none";
//     const name = a.master?.name ?? "Без мастера";
//     const r = byMaster.get(id) ?? {
//       id,
//       name,
//       total: 0,
//       done: 0,
//       futureConfirmed: 0,
//       canceled: 0,
//       pending: 0,
//       revenueDone: 0,
//       revenueFutureConfirmed: 0,
//     };
//     r.total += 1;
//     if (a.status === AppointmentStatus.DONE) {
//       r.done += 1;
//       r.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CONFIRMED) {
//       if (a.startAt >= now) {
//         r.futureConfirmed += 1;
//         r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
//       }
//     } else if (a.status === AppointmentStatus.CANCELED) {
//       r.canceled += 1;
//     } else {
//       r.pending += 1;
//     }
//     byMaster.set(id, r);
//   }
//   const byMasterArr = [...byMaster.values()].sort(
//     (a, b) => b.revenueDone - a.revenueDone
//   );

//   // prev by master (для тренда по кассе)
//   const byMasterPrev = new Map<
//     string,
//     { revenueDone: number; done: number; total: number; canceled: number }
//   >();
//   for (const a of apptsPrev) {
//     const id = a.master?.id ?? "none";
//     const prev = byMasterPrev.get(id) ?? {
//       revenueDone: 0,
//       done: 0,
//       total: 0,
//       canceled: 0,
//     };
//     prev.total += 1;
//     if (a.status === AppointmentStatus.DONE) {
//       prev.done += 1;
//       prev.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CANCELED) {
//       prev.canceled += 1;
//     }
//     byMasterPrev.set(id, prev);
//   }

//   /* ───────── Разбивка по услугам ───────── */
//   type SRow = {
//     id: string;
//     name: string;
//     total: number;
//     done: number;
//     revenueDone: number;
//     futureConfirmed: number;
//     revenueFutureConfirmed: number;
//   };
//   const byService = new Map<string, SRow>();
//   for (const a of appts) {
//     const sid = a.service?.id ?? "unknown";
//     const name = a.service?.name ?? "Удалённая услуга";
//     const r = byService.get(sid) ?? {
//       id: sid,
//       name,
//       total: 0,
//       done: 0,
//       revenueDone: 0,
//       futureConfirmed: 0,
//       revenueFutureConfirmed: 0,
//     };
//     r.total += 1;
//     if (a.status === AppointmentStatus.DONE) {
//       r.done += 1;
//       r.revenueDone += a.service?.priceCents ?? 0;
//     } else if (a.status === AppointmentStatus.CONFIRMED && a.startAt >= now) {
//       r.futureConfirmed += 1;
//       r.revenueFutureConfirmed += a.service?.priceCents ?? 0;
//     }
//     byService.set(sid, r);
//   }
//   const byServiceArr = [...byService.values()].sort(
//     (a, b) => b.revenueDone - a.revenueDone
//   );

//   /* ───────── Динамика по времени ───────── */
//   type TBucket = { key: string; start: Date; cntDone: number; revDone: number };
//   const buckets = new Map<string, TBucket>();
//   const makeKey = (d: Date): { key: string; start: Date } => {
//     if (group === "week") {
//       const startW = startOfWeek(d, { locale: ru, weekStartsOn: 1 });
//       return { key: `W${format(startW, "yyyy-ww")}`, start: startW };
//     }
//     const startD = startOfDay(d);
//     return { key: format(startD, "yyyy-MM-dd"), start: startD };
//   };
//   for (const a of appts) {
//     const { key, start } = makeKey(a.startAt);
//     const b = buckets.get(key) ?? { key, start, cntDone: 0, revDone: 0 };
//     if (a.status === AppointmentStatus.DONE) {
//       b.cntDone += 1;
//       b.revDone += a.service?.priceCents ?? 0;
//     }
//     buckets.set(key, b);
//   }
//   const timeline = [...buckets.values()].sort(
//     (x, y) => x.start.getTime() - y.start.getTime()
//   );
//   const seriesCount = timeline.map((t) => t.cntDone);
//   const seriesRevenue = timeline.map((t) => t.revDone / 100);

//   /* chips для пресетов */
//   const chips: Array<{ key: string; label: string }> = [
//     { key: "today", label: "Сегодня" },
//     { key: "7d", label: "7 дней" },
//     { key: "30d", label: "30 дней" },
//     { key: "thisMonth", label: "Месяц" },
//     { key: "lastMonth", label: "Прошлый" },
//     { key: "thisYear", label: "Год" },
//   ];
//   const chipHref = (p: string) =>
//     "/admin/stats" +
//     qs({
//       period: p,
//       currency,
//       group,
//       ...(p === "custom" ? { from: fromStr, to: toStr } : {}),
//     });

//   /* тренды для KPI */
//   const trTotal = trend(total, totalPrev);
//   const trDone = trend(done, donePrev);
//   const trCanceled = trend(canceled, canceledPrev);
//   const trRevenue = trend(revenueDone, revenueDonePrev);

//   return (
//     <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between gap-3">
//         <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
//           Статистика
//         </h1>
//         <Link href="/admin" className="link shrink-0">
//           ← Дашборд
//         </Link>
//       </div>

//       {/* Фильтры */}
//       <section className="rounded-2xl border bg-background p-4 sm:p-5 space-y-4">
//         <div className="flex flex-wrap items-center justify-between gap-3">
//           <h2 className="font-medium flex items-center gap-2">
//             <IconCalendar className="h-5 w-5 text-sky-600" />
//             Период и параметры
//           </h2>
//           <div className="text-xs sm:text-sm opacity-70">{label}</div>
//         </div>

//         {/* Быстрые чипсы периода */}
//         <div className="flex flex-wrap gap-2">
//           {chips.map((c) => {
//             const active = period === c.key;
//             return (
//               <Link
//                 key={c.key}
//                 href={chipHref(c.key)}
//                 className={[
//                   "px-3 py-1.5 rounded-full text-sm border transition-colors",
//                   active
//                     ? "bg-sky-600 text-white border-sky-600"
//                     : "hover:bg-muted/60 border-muted",
//                 ].join(" ")}
//               >
//                 {c.label}
//               </Link>
//             );
//           })}
//         </div>

//         <form className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           {/* слева */}
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
//             <Select name="period" defaultValue={period} aria-label="Период">
//               <option value="today">Сегодня</option>
//               <option value="7d">Последние 7 дней</option>
//               <option value="30d">Последние 30 дней</option>
//               <option value="thisMonth">Текущий месяц</option>
//               <option value="lastMonth">Прошлый месяц</option>
//               <option value="thisYear">Текущий год</option>
//               <option value="custom">Произвольный</option>
//             </Select>
//             <Select name="currency" defaultValue={currency} aria-label="Валюта">
//               <option value="EUR">€ EUR</option>
//               <option value="USD">$ USD</option>
//               <option value="UAH">₴ UAH</option>
//               <option value="PLN">zł PLN</option>
//             </Select>
//             <Select name="group" defaultValue={group} aria-label="Группировка">
//               <option value="day">По дням</option>
//               <option value="week">По неделям</option>
//             </Select>
//             <button className="btn btn-primary" type="submit">
//               Применить
//             </button>
//           </div>

//           {/* справа */}
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//             <Input
//               label="Дата с"
//               type="date"
//               name="from"
//               defaultValue={fromStr || undefined}
//             />
//             <Input
//               label="Дата по"
//               type="date"
//               name="to"
//               defaultValue={toStr || undefined}
//             />
//             <div className="hidden sm:flex items-end">
//               <div className="text-xs sm:text-sm opacity-70">
//                 Выбрано: {label}
//               </div>
//             </div>
//           </div>
//         </form>

//         {/* Экспорт CSV */}
//         <div className="flex flex-wrap gap-2 pt-1">
//           <ExportButton
//             title="Экспорт CSV — заявки"
//             type="raw"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//           <ExportButton
//             title="Экспорт CSV — мастера"
//             type="masters"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//           <ExportButton
//             title="Экспорт CSV — услуги"
//             type="services"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//           <ExportButton
//             title="Экспорт CSV — динамика"
//             type="timeline"
//             period={period}
//             from={fromStr}
//             to={toStr}
//             currency={currency}
//             group={group}
//           />
//         </div>
//       </section>

//       {/* KPI с трендами */}
//       <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//         <KPICard
//           title="Заявки (всего)"
//           value={String(total)}
//           icon={<IconClipboard className="h-5 w-5 text-violet-600" />}
//           tone="info"
//           gradient="from-violet-500/5"
//           trend={trTotal}
//         />
//         <KPICard
//           title="Выполнено"
//           value={String(done)}
//           sub={percent(done, total)}
//           icon={<IconCheck className="h-5 w-5 text-emerald-600" />}
//           tone="success"
//           gradient="from-emerald-500/5"
//           trend={trDone}
//         />
//         <KPICard
//           title="Будущие подтверждённые"
//           value={String(futureConfirmed)}
//           icon={<IconSpark className="h-5 w-5 text-sky-600" />}
//           tone="brand"
//           gradient="from-sky-500/5"
//           /* тренд для будущих намеренно не показываю — он не сопоставим с прошлым периодом */
//         />
//         <KPICard
//           title="Отменено"
//           value={String(canceled)}
//           sub={percent(canceled, total)}
//           icon={<IconCross className="h-5 w-5 text-rose-600" />}
//           tone="danger"
//           gradient="from-rose-500/5"
//           trend={trCanceled}
//         />
//       </section>

//       {/* Касса */}
//       <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//         <KPICard
//           title="Касса (выполненные)"
//           value={moneyFromCents(revenueDone, currency)}
//           icon={<IconWallet className="h-5 w-5 text-emerald-600" />}
//           tone="success"
//           gradient="from-emerald-500/5"
//           trend={trRevenue}
//         />
//         <KPICard
//           title="Касса (будущие подтверждённые)"
//           value={moneyFromCents(revenueFutureConfirmed, currency)}
//           icon={<IconWallet className="h-5 w-5 text-sky-600" />}
//           tone="brand"
//           gradient="from-sky-500/5"
//         />
//       </section>

//       {/* Динамика */}
//       <section className="space-y-3">
//         <h2 className="font-medium flex items-center gap-2">
//           <IconTrend className="h-5 w-5 text-emerald-600" />
//           Динамика ({group === "week" ? "недели" : "дни"})
//         </h2>

//         <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
//           <div className="rounded-2xl border p-3 text-emerald-600">
//             <div className="text-sm opacity-70 mb-2">
//               Количество выполненных
//             </div>
//             <Sparkline data={seriesCount} />
//           </div>
//           <div className="rounded-2xl border p-3 text-sky-600">
//             <div className="text-sm opacity-70 mb-2">Касса (выполненные)</div>
//             <Sparkline data={seriesRevenue} />
//           </div>
//         </div>

//         {/* Таблица/карточки */}
//         <div className="rounded-2xl border">
//           <table className="hidden md:table w-full text-sm">
//             <thead className="bg-muted/40 text-left">
//               <tr>
//                 <th className="p-3">
//                   {group === "week" ? "Неделя (начало)" : "День"}
//                 </th>
//                 <th className="p-3">Выполнено</th>
//                 <th className="p-3">Касса (вып.)</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {timeline.map((t) => (
//                 <tr key={t.key}>
//                   <td className="p-3 whitespace-nowrap">
//                     {group === "week" ? fmtDate(t.start) : fmtDayShort(t.start)}
//                   </td>
//                   <td className="p-3">{t.cntDone}</td>
//                   <td className="p-3 whitespace-nowrap">
//                     {moneyFromCents(t.revDone, currency)}
//                   </td>
//                 </tr>
//               ))}
//               {timeline.length === 0 && (
//                 <tr>
//                   <td className="p-3 opacity-70" colSpan={3}>
//                     Нет данных за выбранный период
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           {/* mobile list */}
//           <ul className="md:hidden divide-y">
//             {timeline.map((t) => (
//               <li key={t.key} className="p-3 flex items-center justify-between">
//                 <div className="text-sm">
//                   <div className="font-medium">
//                     {group === "week" ? fmtDate(t.start) : fmtDayShort(t.start)}
//                   </div>
//                   <div className="opacity-70">Выполнено: {t.cntDone}</div>
//                 </div>
//                 <div className="text-right font-medium">
//                   {moneyFromCents(t.revDone, currency)}
//                 </div>
//               </li>
//             ))}
//             {timeline.length === 0 && (
//               <li className="p-3 text-sm opacity-70">
//                 Нет данных за выбранный период
//               </li>
//             )}
//           </ul>
//         </div>
//       </section>

//       {/* По мастерам */}
//       <section className="space-y-3">
//         <h2 className="font-medium flex items-center gap-2">
//           <IconUsers className="h-5 w-5 text-violet-600" />
//           Разбивка по мастерам
//         </h2>

//         <div className="rounded-2xl border overflow-x-auto">
//           <table className="hidden md:table w-full min-w-[900px] text-sm">
//             <thead className="bg-muted/40 text-left">
//               <tr>
//                 <th className="p-3">Мастер</th>
//                 <th className="p-3">Заявок</th>
//                 <th className="p-3">Выполнено</th>
//                 <th className="p-3">Будущие подтв.</th>
//                 <th className="p-3">Отменено</th>
//                 <th className="p-3">Ожидают</th>
//                 <th className="p-3">Касса (вып.)</th>
//                 <th className="p-3">Касса (буд.)</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {byMasterArr.map((r) => {
//                 const prev = byMasterPrev.get(r.id) ?? {
//                   revenueDone: 0,
//                   done: 0,
//                   total: 0,
//                   canceled: 0,
//                 };
//                 const tr = trend(r.revenueDone, prev.revenueDone);
//                 return (
//                   <tr key={r.id}>
//                     <td className="p-3">
//                       <div className="font-medium">{r.name}</div>
//                       <div className="mt-2">
//                         <ProgressBar
//                           total={r.total}
//                           done={r.done}
//                           canceled={r.canceled}
//                         />
//                       </div>
//                     </td>
//                     <td className="p-3">{r.total}</td>
//                     <td className="p-3">
//                       {r.done}{" "}
//                       <PercentBadge
//                         value={percent(r.done, r.total)}
//                         tone="success"
//                       />
//                     </td>
//                     <td className="p-3">
//                       {r.futureConfirmed}{" "}
//                       <PercentBadge
//                         value={percent(r.futureConfirmed, r.total)}
//                         tone="brand"
//                       />
//                     </td>
//                     <td className="p-3">
//                       {r.canceled}{" "}
//                       <PercentBadge
//                         value={percent(r.canceled, r.total)}
//                         tone="danger"
//                       />
//                     </td>
//                     <td className="p-3">{r.pending}</td>
//                     <td className="p-3 whitespace-nowrap">
//                       <div className="flex items-center gap-2">
//                         {moneyFromCents(r.revenueDone, currency)}
//                         <TrendBadge t={tr} />
//                       </div>
//                     </td>
//                     <td className="p-3 whitespace-nowrap">
//                       {moneyFromCents(r.revenueFutureConfirmed, currency)}
//                     </td>
//                   </tr>
//                 );
//               })}
//               {byMasterArr.length === 0 && (
//                 <tr>
//                   <td className="p-3 opacity-70" colSpan={8}>
//                     Нет данных за выбранный период
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           {/* mobile cards */}
//           <ul className="md:hidden divide-y">
//             {byMasterArr.map((r) => {
//               const prev = byMasterPrev.get(r.id) ?? {
//                 revenueDone: 0,
//                 done: 0,
//                 total: 0,
//                 canceled: 0,
//               };
//               const tr = trend(r.revenueDone, prev.revenueDone);
//               return (
//                 <li key={r.id} className="p-3">
//                   <div className="font-medium">{r.name}</div>
//                   <div className="mt-2">
//                     <ProgressBar
//                       total={r.total}
//                       done={r.done}
//                       canceled={r.canceled}
//                     />
//                   </div>
//                   <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
//                     <RowStat label="Заявок" value={r.total} />
//                     <RowStat
//                       label="Выполнено"
//                       value={`${r.done} (${percent(r.done, r.total)})`}
//                     />
//                     <RowStat
//                       label="Будущие"
//                       value={`${r.futureConfirmed} (${percent(r.futureConfirmed, r.total)})`}
//                     />
//                     <RowStat
//                       label="Отменено"
//                       value={`${r.canceled} (${percent(r.canceled, r.total)})`}
//                     />
//                     <RowStat label="Ожидают" value={r.pending} />
//                     <div className="col-span-2 flex items-center justify-between">
//                       <span className="opacity-70">Касса (вып.)</span>
//                       <span className="font-medium flex items-center gap-2">
//                         {moneyFromCents(r.revenueDone, currency)}{" "}
//                         <TrendBadge t={tr} />
//                       </span>
//                     </div>
//                     <RowStat
//                       label="Касса (буд.)"
//                       value={moneyFromCents(r.revenueFutureConfirmed, currency)}
//                     />
//                   </div>
//                 </li>
//               );
//             })}
//             {byMasterArr.length === 0 && (
//               <li className="p-3 text-sm opacity-70">
//                 Нет данных за выбранный период
//               </li>
//             )}
//           </ul>
//         </div>
//       </section>

//       {/* По услугам */}
//       <section className="space-y-3">
//         <h2 className="font-medium flex items-center gap-2">
//           <IconScissors className="h-5 w-5 text-amber-600" />
//           Разбивка по услугам
//         </h2>

//         <div className="rounded-2xl border overflow-x-auto">
//           <table className="hidden md:table w-full min-w-[760px] text-sm">
//             <thead className="bg-muted/40 text-left">
//               <tr>
//                 <th className="p-3">Услуга</th>
//                 <th className="p-3">Заявок</th>
//                 <th className="p-3">Выполнено</th>
//                 <th className="p-3">Касса (вып.)</th>
//                 <th className="p-3">Будущие подтв.</th>
//                 <th className="p-3">Касса (буд.)</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y">
//               {byServiceArr.map((r) => (
//                 <tr key={r.id}>
//                   <td className="p-3">{r.name}</td>
//                   <td className="p-3">{r.total}</td>
//                   <td className="p-3">
//                     {r.done}{" "}
//                     <PercentBadge
//                       value={percent(r.done, r.total)}
//                       tone="success"
//                     />
//                   </td>
//                   <td className="p-3 whitespace-nowrap">
//                     {moneyFromCents(r.revenueDone, currency)}
//                   </td>
//                   <td className="p-3">
//                     {r.futureConfirmed}{" "}
//                     <PercentBadge
//                       value={percent(r.futureConfirmed, r.total)}
//                       tone="brand"
//                     />
//                   </td>
//                   <td className="p-3 whitespace-nowrap">
//                     {moneyFromCents(r.revenueFutureConfirmed, currency)}
//                   </td>
//                 </tr>
//               ))}
//               {byServiceArr.length === 0 && (
//                 <tr>
//                   <td className="p-3 opacity-70" colSpan={6}>
//                     Нет данных за выбранный период
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           {/* mobile cards */}
//           <ul className="md:hidden divide-y">
//             {byServiceArr.map((r) => (
//               <li key={r.id} className="p-3">
//                 <div className="font-medium">{r.name}</div>
//                 <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
//                   <RowStat label="Заявок" value={r.total} />
//                   <RowStat
//                     label="Выполнено"
//                     value={`${r.done} (${percent(r.done, r.total)})`}
//                   />
//                   <RowStat
//                     label="Касса (вып.)"
//                     value={moneyFromCents(r.revenueDone, currency)}
//                   />
//                   <RowStat
//                     label="Будущие"
//                     value={`${r.futureConfirmed} (${percent(r.futureConfirmed, r.total)})`}
//                   />
//                   <RowStat
//                     label="Касса (буд.)"
//                     value={moneyFromCents(r.revenueFutureConfirmed, currency)}
//                   />
//                 </div>
//               </li>
//             ))}
//             {byServiceArr.length === 0 && (
//               <li className="p-3 text-sm opacity-70">
//                 Нет данных за выбранный период
//               </li>
//             )}
//           </ul>
//         </div>
//       </section>
//     </main>
//   );
// }

// /* ───────── small UI helpers ───────── */

// function KPICard({
//   title,
//   value,
//   sub,
//   icon,
//   tone = "default",
//   gradient,
//   trend,
// }: {
//   title: string;
//   value: string;
//   sub?: string;
//   icon?: ReactElement;
//   tone?: "default" | "success" | "danger" | "brand" | "info";
//   gradient?: string; // e.g. 'from-emerald-500/5'
//   trend?: { dir: "up" | "down" | "flat"; delta: number };
// }): ReactElement {
//   const ring =
//     tone === "success"
//       ? "ring-emerald-200/60 dark:ring-emerald-900/40"
//       : tone === "danger"
//         ? "ring-rose-200/60 dark:ring-rose-900/40"
//         : tone === "brand"
//           ? "ring-sky-200/60 dark:ring-sky-900/40"
//           : tone === "info"
//             ? "ring-violet-200/60 dark:ring-violet-900/40"
//             : "ring-muted/50";
//   return (
//     <div
//       className={`rounded-2xl border p-4 sm:p-5 ring-1 ${ring} bg-gradient-to-br ${gradient ?? ""}`}
//     >
//       <div className="flex items-start justify-between gap-2">
//         <div className="text-xs sm:text-sm opacity-70">{title}</div>
//         {icon ? <div className="shrink-0">{icon}</div> : null}
//       </div>
//       <div className="mt-1 flex items-end gap-2">
//         <div className="text-xl sm:text-2xl font-semibold">{value}</div>
//         {sub ? (
//           <span className="text-xs sm:text-sm opacity-70">({sub})</span>
//         ) : null}
//       </div>
//       {trend ? (
//         <div className="mt-2">
//           <TrendBadge t={trend} />
//         </div>
//       ) : null}
//     </div>
//   );
// }

// function TrendBadge({
//   t,
// }: {
//   t: { dir: "up" | "down" | "flat"; delta: number };
// }): ReactElement {
//   const sign = t.dir === "up" ? "+" : t.dir === "down" ? "" : "";
//   const color =
//     t.dir === "up"
//       ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900"
//       : t.dir === "down"
//         ? "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-900"
//         : "text-muted-foreground bg-muted border-muted-foreground/10";
//   const Arrow =
//     t.dir === "up"
//       ? IconArrowUp
//       : t.dir === "down"
//         ? IconArrowDown
//         : IconArrowRight;
//   return (
//     <span
//       className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${color}`}
//     >
//       <Arrow className="h-3.5 w-3.5" />
//       {t.dir === "flat" ? "0%" : `${sign}${Math.abs(t.delta)}%`}
//     </span>
//   );
// }

// function ProgressBar({
//   total,
//   done,
//   canceled,
// }: {
//   total: number;
//   done: number;
//   canceled: number;
// }): ReactElement {
//   const d = total ? Math.round((done / total) * 100) : 0;
//   const c = total ? Math.round((canceled / total) * 100) : 0;
//   const rest = Math.max(0, 100 - d - c);
//   return (
//     <div className="h-2 rounded-full bg-muted overflow-hidden">
//       <div className="h-full bg-emerald-500" style={{ width: `${d}%` }} />
//       <div className="h-full bg-rose-500" style={{ width: `${c}%` }} />
//       <div
//         className="h-full bg-slate-400/60 dark:bg-slate-600/50"
//         style={{ width: `${rest}%` }}
//       />
//     </div>
//   );
// }

// function PercentBadge({
//   value,
//   tone = "default",
// }: {
//   value: string;
//   tone?: "default" | "success" | "danger" | "brand";
// }): ReactElement {
//   const cls =
//     tone === "success"
//       ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
//       : tone === "danger"
//         ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
//         : tone === "brand"
//           ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900"
//           : "bg-muted text-foreground/80 border-muted-foreground/10";
//   return (
//     <span
//       className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs border ${cls}`}
//     >
//       {value}
//     </span>
//   );
// }

// function RowStat({
//   label,
//   value,
// }: {
//   label: string;
//   value: string | number;
// }): ReactElement {
//   return (
//     <>
//       <div className="opacity-70">{label}</div>
//       <div className="text-right font-medium">{value}</div>
//     </>
//   );
// }

// function Input({
//   label,
//   className,
//   ...props
// }: { label: string } & Omit<ComponentPropsWithoutRef<"input">, "className"> & {
//     className?: string;
//   }): ReactElement {
//   return (
//     <label className={`grid gap-1 text-sm ${className ?? ""}`}>
//       <span className="opacity-70">{label}</span>
//       <input {...props} className="input" />
//     </label>
//   );
// }

// function Select(props: ComponentPropsWithoutRef<"select">): ReactElement {
//   return <select {...props} className="input" />;
// }

// /** Кнопка экспорта: форма GET → /admin/stats/export, без префетча, новая вкладка */
// function ExportButton({
//   title,
//   type,
//   period,
//   from,
//   to,
//   currency,
//   group,
// }: {
//   title: string;
//   type: "raw" | "masters" | "services" | "timeline";
//   period: string;
//   from?: string;
//   to?: string;
//   currency: string;
//   group: "day" | "week";
// }): ReactElement {
//   return (
//     <form
//       action="/admin/stats/export"
//       method="GET"
//       target="_blank"
//       className="inline"
//     >
//       <input type="hidden" name="type" value={type} />
//       <input type="hidden" name="period" value={period} />
//       {from ? <input type="hidden" name="from" value={from} /> : null}
//       {to ? <input type="hidden" name="to" value={to} /> : null}
//       <input type="hidden" name="currency" value={currency} />
//       <input type="hidden" name="group" value={group} />
//       <input type="hidden" name="download" value="1" />
//       <button type="submit" className="btn btn-outline btn-sm">
//         {title}
//       </button>
//     </form>
//   );
// }

// /** Мини-график SVG (спарклайн) — цвет берётся из currentColor контейнера */
// function Sparkline({
//   data,
//   width = 560,
//   height = 80,
// }: {
//   data: ReadonlyArray<number>;
//   width?: number;
//   height?: number;
// }): ReactElement {
//   const w = Math.max(60, width);
//   const h = Math.max(40, height);
//   if (!data.length) return <div className="text-sm opacity-70">Нет данных</div>;

//   const max = Math.max(...data);
//   const min = Math.min(...data);
//   const range = Math.max(1e-6, max - min);
//   const step = w / Math.max(1, data.length - 1);

//   const points = data.map((v, i) => {
//     const x = Math.round(i * step);
//     const y = Math.round(h - ((v - min) / range) * (h - 4) - 2);
//     return `${x},${y}`;
//   });
//   const path = `M ${points.join(" L ")}`;

//   return (
//     <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} className="block">
//       <polyline
//         fill="none"
//         stroke="currentColor"
//         strokeOpacity="0.15"
//         strokeWidth="1"
//         points={`0,${h - 1} ${w},${h - 1}`}
//       />
//       <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
//       {points.map((p, i) => {
//         const [x, y] = p.split(",").map((n) => Number(n));
//         return <circle key={i} cx={x} cy={y} r="2" fill="currentColor" />;
//       })}
//     </svg>
//   );
// }

// /* ───────── tiny inline icons ───────── */

// function IconCalendar({ className = "" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.6"
//     >
//       <rect x="3" y="4" width="18" height="18" rx="2" />
//       <path d="M16 2v4M8 2v4M3 10h18" />
//     </svg>
//   );
// }
// function IconClipboard({ className = "" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.6"
//     >
//       <rect x="6" y="3" width="12" height="18" rx="2" />
//       <path d="M9 3v4h6V3" />
//     </svg>
//   );
// }
// function IconCheck({ className = "" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//     >
//       <path d="M20 6 9 17l-5-5" />
//     </svg>
//   );
// }
// function IconCross({ className = "" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//     >
//       <path d="M18 6 6 18M6 6l12 12" />
//     </svg>
//   );
// }
// function IconWallet({ className = "" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//     >
//       <rect x="3" y="7" width="18" height="12" rx="2" />
//       <path d="M21 10h-5a2 2 0 0 0 0 4h5" />
//     </svg>
//   );
// }
// function IconTrend({ className = "" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//     >
//       <path d="M3 17l6-6 4 4 7-7" />
//       <path d="M14 8h7v7" />
//     </svg>
//   );
// }
// function IconUsers({ className = "" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.6"
//     >
//       <circle cx="9" cy="7" r="3" />
//       <path d="M2 21a7 7 0 0 1 14 0" />
//       <circle cx="17" cy="9" r="2.5" />
//       <path d="M22 21a6 6 0 0 0-8-5.5" />
//     </svg>
//   );
// }
// function IconScissors({ className = "" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.6"
//     >
//       <circle cx="7" cy="17" r="2.5" />
//       <circle cx="7" cy="7" r="2.5" />
//       <path d="M8.5 8.5 21 21M8.5 15.5 21 3" />
//     </svg>
//   );
// }
// function IconSpark({ className = "" }: { className?: string }) {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       className={className}
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//     >
//       <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4" />
//     </svg>
//   );
// }
// function IconArrowUp({ className = "" }: { className?: string }) {
//   return (
//     <svg viewBox="0 0 20 20" className={className} fill="currentColor">
//       <path d="M10 3l5 5h-3v7H8V8H5l5-5z" />
//     </svg>
//   );
// }
// function IconArrowDown({ className = "" }: { className?: string }) {
//   return (
//     <svg viewBox="0 0 20 20" className={className} fill="currentColor">
//       <path d="M10 17l-5-5h3V5h4v7h3l-5 5z" />
//     </svg>
//   );
// }
// function IconArrowRight({ className = "" }: { className?: string }) {
//   return (
//     <svg viewBox="0 0 20 20" className={className} fill="currentColor">
//       <path d="M3 10h10l-4-4v3h8v2H9v3l4-4H3z" />
//     </svg>
//   );
// }
