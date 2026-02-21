// src/app/admin/stats/_components/TopServicesChart.tsx
'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { SeoLocale } from '@/lib/seo-locale';

interface ServiceData {
  name: string;
  revenue: number;
  count: number;
  percentage: number;
}

interface TopServicesChartProps {
  data: ServiceData[];
  currency?: string;
  locale?: SeoLocale;
}

const COLORS = ['#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];

const INTL_BY_LOCALE: Record<SeoLocale, string> = {
  de: 'de-DE',
  ru: 'ru-RU',
  en: 'en-US',
};

const TOP_SERVICES_COPY: Record<
  SeoLocale,
  { title: string; subtitle: string; bookingsWord: string; empty: string }
> = {
  de: {
    title: 'Top Leistungen',
    subtitle: 'Nach Umsatz im Zeitraum',
    bookingsWord: 'Buchungen',
    empty: 'Keine Leistungsdaten',
  },
  ru: {
    title: 'Топ услуги',
    subtitle: 'По выручке за период',
    bookingsWord: 'записей',
    empty: 'Нет данных об услугах',
  },
  en: {
    title: 'Top services',
    subtitle: 'By revenue in selected period',
    bookingsWord: 'bookings',
    empty: 'No service data',
  },
};

export default function TopServicesChart({
  data,
  currency = 'EUR',
  locale = 'de',
}: TopServicesChartProps) {
  const topData = data.slice(0, 5);
  const t = TOP_SERVICES_COPY[locale];
  const intlLocale = INTL_BY_LOCALE[locale];

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ServiceData }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-semibold mb-2">{item.name}</p>
          <p className="text-purple-400 font-bold text-lg">
            {new Intl.NumberFormat(intlLocale, {
              style: 'currency',
              currency,
              maximumFractionDigits: 0,
            }).format(item.revenue)}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {item.count} {t.bookingsWord} • {item.percentage.toFixed(1)}%
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
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl border border-purple-500/20 p-4 sm:p-6"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white">{t.title}</h3>
          <p className="text-xs sm:text-sm text-slate-400">{t.subtitle}</p>
        </div>
      </div>

      {topData.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>{t.empty}</p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={topData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis
                type="number"
                stroke="#64748B"
                style={{ fontSize: '11px' }}
                tickLine={false}
                tickFormatter={(value) =>
                  new Intl.NumberFormat(intlLocale, {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)
                }
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748B"
                style={{ fontSize: '11px' }}
                tickLine={false}
                width={75}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[0, 8, 8, 0]} animationDuration={1000}>
                {topData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
            {topData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-300 flex-1 truncate">{item.name}</span>
                <span className="text-slate-500 font-medium">
                  {item.percentage.toFixed(0)}%
                </span>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
    </motion.div>
  );
}
