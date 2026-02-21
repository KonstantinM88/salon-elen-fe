// src/components/admin/RegistrationStats.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MessageSquare, Send, Mail, ExternalLink } from 'lucide-react';
import { IconGlow } from './IconGlow';
import type { SeoLocale } from '@/lib/seo-locale';

type RegistrationMethod = 'sms' | 'telegram' | 'google' | 'email';
type Period = '7d' | '30d' | '90d' | 'all';

type Stats = {
  total: number;
  byMethod: {
    sms: number;
    telegram: number;
    google: number;
    email: number;
  };
  byStatus: {
    completed: number;
    pending: number;
  };
  timeline: Array<{
    date: string;
    sms: number;
    telegram: number;
    google: number;
    email: number;
  }>;
  recentRegistrations: Array<{
    id: string;
    method: RegistrationMethod;
    contact: string;
    status: 'completed' | 'pending';
    createdAt: string;
    appointmentId: string | null;
  }>;
};

type StatsCopy = {
  title: string;
  subtitle: string;
  period7d: string;
  period30d: string;
  period90d: string;
  periodAll: string;
  totalRegistrations: string;
  googleEmail: string;
  timeline: string;
  distribution: string;
  noData: string;
  recentTitle: string;
  recentSubtitle: string;
  method: string;
  contact: string;
  status: string;
  date: string;
  open: string;
  completed: string;
  pending: string;
  failedToFetch: string;
  unknownError: string;
  loadFailed: string;
  loadStatsError: string;
};

const COLORS = {
  sms: '#f59e0b',
  telegram: '#0088cc',
  google: '#ef4444',
  email: '#8b5cf6',
};

const METHOD_LABELS: Record<RegistrationMethod, string> = {
  sms: 'SMS',
  telegram: 'Telegram',
  google: 'Google',
  email: 'Email',
};

const INTL_BY_LOCALE: Record<SeoLocale, string> = {
  de: 'de-DE',
  ru: 'ru-RU',
  en: 'en-US',
};

const STATS_COPY: Record<SeoLocale, StatsCopy> = {
  de: {
    title: 'Registrierungsstatistik',
    subtitle: 'Analyse der Kundenregistrierungsmethoden',
    period7d: '7 Tage',
    period30d: '30 Tage',
    period90d: '90 Tage',
    periodAll: 'Gesamt',
    totalRegistrations: 'Registrierungen gesamt',
    googleEmail: 'Google / E-Mail',
    timeline: 'Registrierungsverlauf',
    distribution: 'Verteilung nach Methoden',
    noData: 'Keine Daten fuer den ausgewaehlten Zeitraum',
    recentTitle: 'Letzte Registrierungen',
    recentSubtitle: '20 letzte Eintraege • Klicken fuer die Buchung',
    method: 'Methode',
    contact: 'Kontakt',
    status: 'Status',
    date: 'Datum',
    open: 'Oeffnen',
    completed: 'Abgeschlossen',
    pending: 'Ausstehend',
    failedToFetch: 'Statistiken konnten nicht geladen werden',
    unknownError: 'Unbekannter Fehler',
    loadFailed: 'Fehler beim Laden der Statistiken',
    loadStatsError: 'Fehler beim Laden der Statistik',
  },
  ru: {
    title: 'Статистика регистраций',
    subtitle: 'Анализ методов регистрации клиентов',
    period7d: '7 дней',
    period30d: '30 дней',
    period90d: '90 дней',
    periodAll: 'Всё время',
    totalRegistrations: 'Всего регистраций',
    googleEmail: 'Google / Email',
    timeline: 'Динамика регистраций',
    distribution: 'Распределение по методам',
    noData: 'Нет данных за выбранный период',
    recentTitle: 'Последние регистрации',
    recentSubtitle: '20 последних записей • Кликните для просмотра заявки',
    method: 'Метод',
    contact: 'Контакт',
    status: 'Статус',
    date: 'Дата',
    open: 'Открыть',
    completed: 'Завершено',
    pending: 'В ожидании',
    failedToFetch: 'Не удалось получить статистику',
    unknownError: 'Неизвестная ошибка',
    loadFailed: 'Ошибка загрузки статистики',
    loadStatsError: 'Ошибка загрузки статистики',
  },
  en: {
    title: 'Registration statistics',
    subtitle: 'Analysis of customer registration methods',
    period7d: '7 days',
    period30d: '30 days',
    period90d: '90 days',
    periodAll: 'All time',
    totalRegistrations: 'Total registrations',
    googleEmail: 'Google / Email',
    timeline: 'Registration trend',
    distribution: 'Distribution by method',
    noData: 'No data for the selected period',
    recentTitle: 'Recent registrations',
    recentSubtitle: '20 latest entries • Click to open booking',
    method: 'Method',
    contact: 'Contact',
    status: 'Status',
    date: 'Date',
    open: 'Open',
    completed: 'Completed',
    pending: 'Pending',
    failedToFetch: 'Failed to fetch statistics',
    unknownError: 'Unknown error',
    loadFailed: 'Failed to load statistics',
    loadStatsError: 'Statistics load error',
  },
};

const PERIODS: Period[] = ['7d', '30d', '90d', 'all'];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

type RegistrationStatsProps = {
  locale?: SeoLocale;
};

export function RegistrationStats({ locale = 'de' }: RegistrationStatsProps) {
  const t = STATS_COPY[locale];
  const intlLocale = INTL_BY_LOCALE[locale];
  const [period, setPeriod] = useState<Period>('30d');
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/registration-stats?period=${period}`);
        if (!response.ok) throw new Error(t.failedToFetch);
        const result = await response.json();
        if (result.success) {
          setData(result.stats);
        } else {
          setError(result.error || t.unknownError);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t.loadFailed);
      } finally {
        setLoading(false);
      }
    }

    void fetchStats();
  }, [period, t.failedToFetch, t.loadFailed, t.unknownError]);

  const periodLabels: Record<Period, string> = useMemo(
    () => ({
      '7d': t.period7d,
      '30d': t.period30d,
      '90d': t.period90d,
      all: t.periodAll,
    }),
    [t.period7d, t.period30d, t.period90d, t.periodAll]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
        <p className="font-medium">{t.loadStatsError}</p>
        {error && <p className="mt-1 text-sm opacity-80">{error}</p>}
      </div>
    );
  }

  const pieData = [
    { name: 'SMS', value: data.byMethod.sms, color: COLORS.sms },
    { name: 'Telegram', value: data.byMethod.telegram, color: COLORS.telegram },
    { name: 'Google', value: data.byMethod.google, color: COLORS.google },
    { name: 'Email', value: data.byMethod.email, color: COLORS.email },
  ].filter((chartItem) => chartItem.value > 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="mt-1 text-sm opacity-70">{t.subtitle}</p>
        </div>

        <div className="inline-flex rounded-xl bg-white/5 p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                rounded-lg px-4 py-2 text-sm font-medium transition-all
                ${period === p ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-300 hover:text-white'}
              `}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item} className="card-glass p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-70">{t.totalRegistrations}</p>
              <p className="mt-2 text-3xl font-bold">{data.total}</p>
            </div>
            <IconGlow tone="violet" className="h-12 w-12 ring-2 ring-violet-400/30 bg-violet-500/10">
              <MessageSquare className="h-6 w-6 text-violet-300" />
            </IconGlow>
          </div>
        </motion.div>

        <motion.div variants={item} className="card-glass p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-70">SMS</p>
              <p className="mt-2 text-3xl font-bold">{data.byMethod.sms}</p>
            </div>
            <IconGlow tone="amber" className="h-12 w-12 ring-2 ring-amber-400/30 bg-amber-500/10">
              <MessageSquare className="h-6 w-6 text-amber-300" />
            </IconGlow>
          </div>
        </motion.div>

        <motion.div variants={item} className="card-glass p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-70">Telegram</p>
              <p className="mt-2 text-3xl font-bold">{data.byMethod.telegram}</p>
            </div>
            <IconGlow tone="sky" className="h-12 w-12 ring-2 ring-sky-400/30 bg-sky-500/10">
              <Send className="h-6 w-6 text-sky-300" />
            </IconGlow>
          </div>
        </motion.div>

        <motion.div variants={item} className="card-glass p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-70">{t.googleEmail}</p>
              <p className="mt-2 text-3xl font-bold">{data.byMethod.google + data.byMethod.email}</p>
            </div>
            <IconGlow tone="rose" className="h-12 w-12 ring-2 ring-rose-400/30 bg-rose-500/10">
              <Mail className="h-6 w-6 text-rose-300" />
            </IconGlow>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glass p-4 md:p-6"
        >
          <h3 className="mb-4 font-semibold text-sm md:text-base">{t.timeline}</h3>
          {data.timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
              <LineChart data={data.timeline} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString(intlLocale, { day: '2-digit', month: '2-digit' })
                  }
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString(intlLocale)}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="sms" stroke={COLORS.sms} strokeWidth={2} name="SMS" />
                <Line
                  type="monotone"
                  dataKey="telegram"
                  stroke={COLORS.telegram}
                  strokeWidth={2}
                  name="Telegram"
                />
                <Line type="monotone" dataKey="google" stroke={COLORS.google} strokeWidth={2} name="Google" />
                <Line type="monotone" dataKey="email" stroke={COLORS.email} strokeWidth={2} name="Email" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] md:h-[300px] items-center justify-center text-gray-500 text-sm">
              {t.noData}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-glass p-4 md:p-6"
        >
          <h3 className="mb-4 font-semibold text-sm md:text-base">{t.distribution}</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const p = percent !== undefined ? percent : 0;
                    return `${name}: ${(p * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] md:h-[300px] items-center justify-center text-gray-500 text-sm">
              {t.noData}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-glass overflow-hidden"
      >
        <div className="border-b border-white/10 p-6">
          <h3 className="font-semibold">{t.recentTitle}</h3>
          <p className="mt-1 text-sm opacity-70">{t.recentSubtitle}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/5 bg-white/5 text-left text-sm">
              <tr>
                <th className="p-4 font-medium">{t.method}</th>
                <th className="p-4 font-medium">{t.contact}</th>
                <th className="p-4 font-medium">{t.status}</th>
                <th className="p-4 font-medium">{t.date}</th>
                <th className="p-4 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recentRegistrations.map((reg) => (
                <tr
                  key={reg.id}
                  onClick={() => {
                    if (reg.appointmentId) {
                      router.push(`/admin/bookings?search=${reg.appointmentId}`);
                    }
                  }}
                  className={`hover:bg-white/[0.02] transition-colors ${reg.appointmentId ? 'cursor-pointer' : ''}`}
                >
                  <td className="p-4">
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${COLORS[reg.method]}20`,
                        color: COLORS[reg.method],
                      }}
                    >
                      {METHOD_LABELS[reg.method]}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">{reg.contact}</td>
                  <td className="p-4">
                    {reg.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                        ✓ {t.completed}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
                        ⏳ {t.pending}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm opacity-70">
                    {new Date(reg.createdAt).toLocaleDateString(intlLocale, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-4">
                    {reg.appointmentId && (
                      <div className="flex items-center gap-1 text-xs text-sky-400 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-3 w-3" />
                        <span className="hidden lg:inline">{t.open}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
