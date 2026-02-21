// src/app/admin/stats/_components/RevenueChart.tsx
'use client';

import { motion } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import type { SeoLocale } from '@/lib/seo-locale';

interface DataPoint {
  date: string;
  revenue: number;
  count: number;
}

interface RevenueChartProps {
  data: DataPoint[];
  currency?: string;
  locale?: SeoLocale;
}

const INTL_BY_LOCALE: Record<SeoLocale, string> = {
  de: 'de-DE',
  ru: 'ru-RU',
  en: 'en-US',
};

const REVENUE_CHART_COPY: Record<
  SeoLocale,
  { title: string; subtitle: string; legend: string; recordsSuffix: string; empty: string }
> = {
  de: {
    title: 'Umsatzdynamik',
    subtitle: 'Nach Tagen fuer den ausgewaehlten Zeitraum',
    legend: 'Umsatz',
    recordsSuffix: 'Buchungen',
    empty: 'Keine Daten fuer den ausgewaehlten Zeitraum',
  },
  ru: {
    title: 'Динамика выручки',
    subtitle: 'По дням за выбранный период',
    legend: 'Выручка',
    recordsSuffix: 'записей',
    empty: 'Нет данных за выбранный период',
  },
  en: {
    title: 'Revenue dynamics',
    subtitle: 'By day for selected period',
    legend: 'Revenue',
    recordsSuffix: 'bookings',
    empty: 'No data for selected period',
  },
};

export default function RevenueChart({
  data,
  currency = 'EUR',
  locale = 'de',
}: RevenueChartProps) {
  const t = REVENUE_CHART_COPY[locale];
  const intlLocale = INTL_BY_LOCALE[locale];

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: DataPoint; value: number }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-xl p-4 shadow-2xl">
          <p className="text-slate-400 text-sm mb-2">{payload[0].payload.date}</p>
          <p className="text-amber-400 font-bold text-lg">
            {new Intl.NumberFormat(intlLocale, {
              style: 'currency',
              currency,
              maximumFractionDigits: 0,
            }).format(payload[0].value)}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            {payload[0].payload.count} {t.recordsSuffix}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl border border-amber-500/20 p-4 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              {t.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500" />
            <span className="text-slate-400">{t.legend}</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p>{t.empty}</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              style={{ fontSize: '11px' }}
              tickLine={false}
            />
            <YAxis
              stroke="#64748B"
              style={{ fontSize: '11px' }}
              tickLine={false}
              width={35}
              tickFormatter={(value) =>
                new Intl.NumberFormat(intlLocale, {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value)
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#F59E0B"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
    </motion.div>
  );
}
