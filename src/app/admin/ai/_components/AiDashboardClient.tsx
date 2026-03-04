// src/app/admin/ai/_components/AiDashboardClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bot,
  Users,
  CheckCircle2,
  Clock,
  MessageSquare,
  Mic,
  Zap,
  AlertTriangle,
  Filter,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { SeoLocale } from '@/lib/seo-locale';

// ─── Types ──────────────────────────────────────────────────

interface DashboardData {
  period: { from: string; to: string; days: number };
  current: {
    totalSessions: number;
    completedBookings: number;
    conversionRate: number;
    avgDurationSec: number;
    avgMessages: number;
    voicePercent: number;
    streamingPercent: number;
    consultPercent: number;
    errorTotal: number;
    retryTotal: number;
    errorRate: number;
    gptTotal: number;
    fastPathTotal: number;
    fastPathPercent: number;
    toolTotal: number;
    avgToolMs: number;
  };
  previous: {
    totalSessions: number;
    completedBookings: number;
    conversionRate: number;
    avgDurationSec: number;
    avgMessages: number;
    errorTotal: number;
  };
  byLocale: Record<string, number>;
  byDevice: Record<string, number>;
  byFunnel: Record<string, number>;
  daily: Array<{ date: string; sessions: number; bookings: number; errors: number }>;
  topicCounts: Record<string, number>;
  sessionList: Array<{
    id: string;
    sessionId: string;
    locale: string;
    deviceType: string;
    messageCount: number;
    gptCallCount: number;
    fastPathCount: number;
    toolCallCount: number;
    errorCount: number;
    funnelStage: string;
    bookingCompleted: boolean;
    consultationUsed: boolean;
    consultationTopics: string | null;
    usedVoice: boolean;
    usedStreaming: boolean;
    durationSec: number;
    startedAt: string;
    endedAt: string;
  }>;
}

// ─── Translations ───────────────────────────────────────────

const T = {
  de: {
    overview: 'Übersicht', sessions: 'Sitzungen', funnel: 'Funnel', quality: 'Qualität',
    period: 'Zeitraum', today: 'Heute', days7: '7 Tage', days14: '14 Tage', days30: '30 Tage', days90: '90 Tage',
    totalSessions: 'Sitzungen', bookings: 'Buchungen', conversion: 'Konversion',
    avgDuration: 'Ø Dauer', avgMessages: 'Ø Nachrichten', voiceUsage: 'Spracheingabe',
    streaming: 'Streaming', errors: 'Fehler', retries: 'Wiederholungen', errorRate: 'Fehlerrate',
    fastPath: 'Fast-Path', gptCalls: 'GPT-Aufrufe', tools: 'Tool-Aufrufe', avgToolMs: 'Ø Tool-Latenz',
    consultation: 'Beratung', vsLast: 'vs vorheriger Zeitraum',
    locale: 'Sprache', device: 'Gerät', stage: 'Stufe', messages: 'Nachrichten',
    duration: 'Dauer', voice: 'Sprache', stream: 'SSE', error: 'Fehler', booked: 'Gebucht',
    consult: 'Beratung', started: 'Beginn', noData: 'Keine Daten',
    funnelNone: 'Keine', funnelCatalog: 'Katalog', funnelMaster: 'Meister', funnelDate: 'Datum',
    funnelSlot: 'Slot', funnelContact: 'Kontakt', funnelOtp: 'OTP', funnelCompleted: 'Gebucht',
    topTopics: 'Top Beratungsthemen', topDevices: 'Nach Gerät', topLocales: 'Nach Sprache',
    errorsByDevice: 'Fehler nach Gerät',
  },
  ru: {
    overview: 'Обзор', sessions: 'Сессии', funnel: 'Воронка', quality: 'Качество',
    period: 'Период', today: 'Сегодня', days7: '7 дней', days14: '14 дней', days30: '30 дней', days90: '90 дней',
    totalSessions: 'Сессии', bookings: 'Записи', conversion: 'Конверсия',
    avgDuration: 'Ø Длительность', avgMessages: 'Ø Сообщений', voiceUsage: 'Голос',
    streaming: 'Стриминг', errors: 'Ошибки', retries: 'Повторы', errorRate: 'Доля ошибок',
    fastPath: 'Fast-Path', gptCalls: 'GPT-вызовы', tools: 'Tool-вызовы', avgToolMs: 'Ø Latency tools',
    consultation: 'Консультация', vsLast: 'vs прошлый период',
    locale: 'Язык', device: 'Устройство', stage: 'Этап', messages: 'Сообщений',
    duration: 'Длит.', voice: 'Голос', stream: 'SSE', error: 'Ошибки', booked: 'Запись',
    consult: 'Конс.', started: 'Начало', noData: 'Нет данных',
    funnelNone: 'Нет', funnelCatalog: 'Каталог', funnelMaster: 'Мастер', funnelDate: 'Дата',
    funnelSlot: 'Слот', funnelContact: 'Контакт', funnelOtp: 'OTP', funnelCompleted: 'Запись',
    topTopics: 'Топ тем консультаций', topDevices: 'По устройствам', topLocales: 'По языкам',
    errorsByDevice: 'Ошибки по устройствам',
  },
  en: {
    overview: 'Overview', sessions: 'Sessions', funnel: 'Funnel', quality: 'Quality',
    period: 'Period', today: 'Today', days7: '7 days', days14: '14 days', days30: '30 days', days90: '90 days',
    totalSessions: 'Sessions', bookings: 'Bookings', conversion: 'Conversion',
    avgDuration: 'Avg Duration', avgMessages: 'Avg Messages', voiceUsage: 'Voice Usage',
    streaming: 'Streaming', errors: 'Errors', retries: 'Retries', errorRate: 'Error Rate',
    fastPath: 'Fast-Path', gptCalls: 'GPT Calls', tools: 'Tool Calls', avgToolMs: 'Avg Tool Latency',
    consultation: 'Consultation', vsLast: 'vs previous period',
    locale: 'Locale', device: 'Device', stage: 'Stage', messages: 'Messages',
    duration: 'Duration', voice: 'Voice', stream: 'SSE', error: 'Errors', booked: 'Booked',
    consult: 'Consult', started: 'Started', noData: 'No data',
    funnelNone: 'None', funnelCatalog: 'Catalog', funnelMaster: 'Master', funnelDate: 'Date',
    funnelSlot: 'Slot', funnelContact: 'Contact', funnelOtp: 'OTP', funnelCompleted: 'Completed',
    topTopics: 'Top Consultation Topics', topDevices: 'By Device', topLocales: 'By Locale',
    errorsByDevice: 'Errors by Device',
  },
} as const;

type Translations = Readonly<Record<keyof (typeof T)['ru'], string>>;

const TABS = ['overview', 'sessions', 'funnel', 'quality'] as const;
type Tab = (typeof TABS)[number];

const PERIOD_OPTIONS = [
  { days: 1, key: 'today' },
  { days: 7, key: 'days7' },
  { days: 14, key: 'days14' },
  { days: 30, key: 'days30' },
  { days: 90, key: 'days90' },
] as const;

const FUNNEL_STAGES = ['none', 'catalog', 'master', 'date', 'slot', 'contact', 'otp', 'completed'] as const;

const FUNNEL_COLORS: Record<string, string> = {
  none: 'bg-slate-500/60',
  catalog: 'bg-blue-500/70',
  master: 'bg-indigo-500/70',
  date: 'bg-violet-500/70',
  slot: 'bg-purple-500/70',
  contact: 'bg-pink-500/70',
  otp: 'bg-amber-500/70',
  completed: 'bg-emerald-500/80',
};

// ─── Helpers ────────────────────────────────────────────────

function fmtDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function trend(curr: number, prev: number): 'up' | 'down' | 'flat' {
  if (prev === 0) return curr > 0 ? 'up' : 'flat';
  const pct = ((curr - prev) / prev) * 100;
  if (pct > 3) return 'up';
  if (pct < -3) return 'down';
  return 'flat';
}

function trendPct(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? '+∞' : '0%';
  const pct = Math.round(((curr - prev) / prev) * 100);
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

function TrendIcon({ dir }: { dir: 'up' | 'down' | 'flat' }) {
  if (dir === 'up') return <TrendingUp className="h-3 w-3" />;
  if (dir === 'down') return <TrendingDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
}

function DeviceIcon({ type }: { type: string }) {
  if (type === 'mobile') return <Smartphone className="h-4 w-4" />;
  if (type === 'tablet') return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

// ─── Component ──────────────────────────────────────────────

export default function AiDashboardClient({
  data,
  locale,
}: {
  data: DashboardData;
  locale: SeoLocale;
}) {
  const t: Translations = T[locale];
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>('overview');
  const [sessionFilter, setSessionFilter] = useState({
    locale: '',
    device: '',
    funnel: '',
    errorsOnly: false,
    voiceOnly: false,
  });
  const [sortField, setSortField] = useState<string>('startedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { current: c, previous: p } = data;

  // Period selector
  const handlePeriod = (days: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('days', String(days));
    router.push(`/admin/ai?${params.toString()}`);
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    let list = data.sessionList;
    if (sessionFilter.locale) list = list.filter((s) => s.locale === sessionFilter.locale);
    if (sessionFilter.device) list = list.filter((s) => s.deviceType === sessionFilter.device);
    if (sessionFilter.funnel) list = list.filter((s) => s.funnelStage === sessionFilter.funnel);
    if (sessionFilter.errorsOnly) list = list.filter((s) => s.errorCount > 0);
    if (sessionFilter.voiceOnly) list = list.filter((s) => s.usedVoice);

    list = [...list].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortField];
      const bv = (b as Record<string, unknown>)[sortField];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av ?? '').localeCompare(String(bv ?? ''))
        : String(bv ?? '').localeCompare(String(av ?? ''));
    });

    return list;
  }, [data.sessionList, sessionFilter, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const funnelLabel = (stage: string) =>
    (t as Record<string, string>)[`funnel${stage.charAt(0).toUpperCase()}${stage.slice(1)}`] || stage;

  // ─── Render ─────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Period + Tabs ────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Period selector */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => handlePeriod(opt.days)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                data.period.days === opt.days
                  ? 'bg-violet-500/30 text-violet-300 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {(t as Record<string, string>)[opt.key]}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {TABS.map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                tab === tb
                  ? 'bg-violet-500/30 text-violet-300 shadow-sm'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {(t as Record<string, string>)[tb]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'overview' && (
            <OverviewTab c={c} p={p} daily={data.daily} t={t} fmtDuration={fmtDuration} />
          )}
          {tab === 'sessions' && (
            <SessionsTab
              sessions={filteredSessions}
              filter={sessionFilter}
              setFilter={setSessionFilter}
              sortField={sortField}
              sortDir={sortDir}
              toggleSort={toggleSort}
              funnelLabel={funnelLabel}
              t={t}
            />
          )}
          {tab === 'funnel' && (
            <FunnelTab byFunnel={data.byFunnel} total={c.totalSessions} funnelLabel={funnelLabel} t={t} />
          )}
          {tab === 'quality' && (
            <QualityTab
              c={c}
              byDevice={data.byDevice}
              byLocale={data.byLocale}
              topicCounts={data.topicCounts}
              sessions={data.sessionList}
              t={t}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────

function KPI({
  icon,
  label,
  value,
  trendDir,
  trendValue,
  color = 'violet',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trendDir?: 'up' | 'down' | 'flat';
  trendValue?: string;
  color?: 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'blue' | 'pink';
}) {
  const gradients: Record<string, string> = {
    violet: 'from-violet-500/15 to-purple-500/15 border-violet-500/25',
    emerald: 'from-emerald-500/15 to-green-500/15 border-emerald-500/25',
    amber: 'from-amber-500/15 to-yellow-500/15 border-amber-500/25',
    rose: 'from-rose-500/15 to-pink-500/15 border-rose-500/25',
    sky: 'from-sky-500/15 to-cyan-500/15 border-sky-500/25',
    blue: 'from-blue-500/15 to-indigo-500/15 border-blue-500/25',
    pink: 'from-pink-500/15 to-rose-500/15 border-pink-500/25',
  };
  const iconColor: Record<string, string> = {
    violet: 'text-violet-400', emerald: 'text-emerald-400', amber: 'text-amber-400',
    rose: 'text-rose-400', sky: 'text-sky-400', blue: 'text-blue-400', pink: 'text-pink-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${gradients[color]} p-5 backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={iconColor[color]}>{icon}</div>
        {trendDir && trendValue && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              trendDir === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
              trendDir === 'down' ? 'bg-red-500/20 text-red-400' :
              'bg-slate-500/20 text-slate-400'
            }`}
          >
            <TrendIcon dir={trendDir} />
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-sm text-slate-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </motion.div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────

function OverviewTab({
  c,
  p,
  daily,
  t,
  fmtDuration,
}: {
  c: DashboardData['current'];
  p: DashboardData['previous'];
  daily: DashboardData['daily'];
  t: Translations;
  fmtDuration: (s: number) => string;
}) {
  return (
    <div className="space-y-6">
      {/* Row 1: Core KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI icon={<Users className="h-5 w-5" />} label={t.totalSessions} value={c.totalSessions}
          trendDir={trend(c.totalSessions, p.totalSessions)} trendValue={trendPct(c.totalSessions, p.totalSessions)}
          color="violet" />
        <KPI icon={<CheckCircle2 className="h-5 w-5" />} label={t.bookings} value={c.completedBookings}
          trendDir={trend(c.completedBookings, p.completedBookings)} trendValue={trendPct(c.completedBookings, p.completedBookings)}
          color="emerald" />
        <KPI icon={<TrendingUp className="h-5 w-5" />} label={t.conversion} value={`${c.conversionRate}%`}
          trendDir={trend(c.conversionRate, p.conversionRate)} trendValue={trendPct(c.conversionRate, p.conversionRate)}
          color="amber" />
        <KPI icon={<Clock className="h-5 w-5" />} label={t.avgDuration} value={fmtDuration(c.avgDurationSec)}
          trendDir={trend(p.avgDurationSec, c.avgDurationSec)} trendValue={trendPct(c.avgDurationSec, p.avgDurationSec)}
          color="sky" />
      </div>

      {/* Row 2: Usage */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI icon={<MessageSquare className="h-5 w-5" />} label={t.avgMessages} value={c.avgMessages} color="blue" />
        <KPI icon={<Mic className="h-5 w-5" />} label={t.voiceUsage} value={`${c.voicePercent}%`} color="pink" />
        <KPI icon={<Zap className="h-5 w-5" />} label={t.streaming} value={`${c.streamingPercent}%`} color="violet" />
        <KPI icon={<Sparkles className="h-5 w-5" />} label={t.consultation} value={`${c.consultPercent}%`} color="rose" />
      </div>

      {/* Row 3: Technical */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI icon={<AlertTriangle className="h-5 w-5" />} label={t.errors} value={c.errorTotal}
          trendDir={trend(p.errorTotal, c.errorTotal)} trendValue={trendPct(c.errorTotal, p.errorTotal)}
          color="rose" />
        <KPI icon={<Zap className="h-5 w-5" />} label={t.fastPath} value={`${c.fastPathPercent}%`} color="emerald" />
        <KPI icon={<Bot className="h-5 w-5" />} label={t.gptCalls} value={c.gptTotal} color="violet" />
        <KPI icon={<Clock className="h-5 w-5" />} label={t.avgToolMs} value={`${c.avgToolMs}ms`} color="sky" />
      </div>

      {/* Daily sparkline */}
      {daily.length > 1 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="mb-3 text-sm font-medium text-slate-400">{t.totalSessions} — {t.bookings}</div>
          <div className="flex items-end gap-1" style={{ height: 80 }}>
            {daily.map((d, i) => {
              const maxS = Math.max(...daily.map((x) => x.sessions), 1);
              const hS = Math.round((d.sessions / maxS) * 70);
              const hB = Math.round((d.bookings / maxS) * 70);
              return (
                <div key={i} className="group relative flex flex-1 items-end gap-[1px]" title={`${d.date}: ${d.sessions} / ${d.bookings}`}>
                  <div className="flex-1 rounded-t bg-violet-500/40 transition-all group-hover:bg-violet-400/60" style={{ height: hS }} />
                  <div className="flex-1 rounded-t bg-emerald-500/40 transition-all group-hover:bg-emerald-400/60" style={{ height: hB || 1 }} />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-500">
            <span>{daily[0]?.date.slice(5)}</span>
            <span>{daily[daily.length - 1]?.date.slice(5)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sessions Tab ───────────────────────────────────────────

function SessionsTab({
  sessions,
  filter,
  setFilter,
  sortField,
  sortDir,
  toggleSort,
  funnelLabel,
  t,
}: {
  sessions: DashboardData['sessionList'];
  filter: { locale: string; device: string; funnel: string; errorsOnly: boolean; voiceOnly: boolean };
  setFilter: (f: typeof filter) => void;
  sortField: string;
  sortDir: 'asc' | 'desc';
  toggleSort: (f: string) => void;
  funnelLabel: (s: string) => string;
  t: Translations;
}) {
  const SortIcon = ({ field }: { field: string }) => (
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3 opacity-30" />
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
        <Filter className="h-4 w-4 text-slate-400" />
        <select value={filter.locale} onChange={(e) => setFilter({ ...filter, locale: e.target.value })}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
          <option value="">{t.locale}</option>
          <option value="de">DE</option><option value="ru">RU</option><option value="en">EN</option>
        </select>
        <select value={filter.device} onChange={(e) => setFilter({ ...filter, device: e.target.value })}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
          <option value="">{t.device}</option>
          <option value="mobile">Mobile</option><option value="desktop">Desktop</option><option value="tablet">Tablet</option>
        </select>
        <select value={filter.funnel} onChange={(e) => setFilter({ ...filter, funnel: e.target.value })}
          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
          <option value="">{t.stage}</option>
          {FUNNEL_STAGES.map((s) => <option key={s} value={s}>{funnelLabel(s)}</option>)}
        </select>
        <label className="flex items-center gap-1 text-xs text-slate-400">
          <input type="checkbox" checked={filter.errorsOnly}
            onChange={(e) => setFilter({ ...filter, errorsOnly: e.target.checked })}
            className="rounded border-white/20" />
          {t.error}
        </label>
        <label className="flex items-center gap-1 text-xs text-slate-400">
          <input type="checkbox" checked={filter.voiceOnly}
            onChange={(e) => setFilter({ ...filter, voiceOnly: e.target.checked })}
            className="rounded border-white/20" />
          {t.voice}
        </label>
        <span className="ml-auto text-xs text-slate-500">{sessions.length}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-left text-slate-400">
              {[
                { key: 'locale', label: t.locale },
                { key: 'deviceType', label: t.device },
                { key: 'messageCount', label: t.messages },
                { key: 'funnelStage', label: t.stage },
                { key: 'errorCount', label: t.error },
                { key: 'durationSec', label: t.duration },
                { key: 'startedAt', label: t.started },
              ].map((col) => (
                <th key={col.key} className="cursor-pointer px-3 py-2.5 font-medium hover:text-white"
                  onClick={() => toggleSort(col.key)}>
                  <span className="inline-flex items-center gap-1">{col.label} <SortIcon field={col.key} /></span>
                </th>
              ))}
              <th className="px-3 py-2.5 font-medium">{t.booked}</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-500">{t.noData}</td></tr>
            ) : sessions.map((s) => (
              <tr key={s.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3 text-slate-500" />{s.locale.toUpperCase()}</span>
                </td>
                <td className="px-3 py-2"><DeviceIcon type={s.deviceType} /></td>
                <td className="px-3 py-2 font-mono">{s.messageCount}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${FUNNEL_COLORS[s.funnelStage] || 'bg-slate-500/50'}`}>
                    {funnelLabel(s.funnelStage)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {s.errorCount > 0 && <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-red-400">{s.errorCount}</span>}
                </td>
                <td className="px-3 py-2 font-mono text-slate-400">{fmtDuration(s.durationSec)}</td>
                <td className="px-3 py-2 text-slate-400">
                  {new Date(s.startedAt).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-3 py-2">
                  {s.bookingCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Funnel Tab ─────────────────────────────────────────────

function FunnelTab({
  byFunnel,
  total,
  funnelLabel,
  t,
}: {
  byFunnel: Record<string, number>;
  total: number;
  funnelLabel: (s: string) => string;
  t: Translations;
}) {
  const maxCount = Math.max(...Object.values(byFunnel), 1);

  return (
    <div className="space-y-6">
      {/* Horizontal funnel bars */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="space-y-3">
          {FUNNEL_STAGES.map((stage, i) => {
            const count = byFunnel[stage] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const barW = Math.max(2, Math.round((count / maxCount) * 100));
            const dropoff = i > 0 ? (byFunnel[FUNNEL_STAGES[i - 1]] || 0) - count : 0;

            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-20 text-right text-xs text-slate-400">{funnelLabel(stage)}</div>
                <div className="flex-1">
                  <div className="relative h-7 overflow-hidden rounded-lg bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barW}%` }}
                      transition={{ delay: i * 0.06 + 0.15, duration: 0.5, ease: 'easeOut' }}
                      className={`absolute inset-y-0 left-0 rounded-lg ${FUNNEL_COLORS[stage]}`}
                    />
                    <div className="relative z-10 flex h-full items-center px-3 text-xs font-medium text-white">
                      {count}
                    </div>
                  </div>
                </div>
                <div className="w-12 text-right text-xs font-mono text-slate-400">{pct}%</div>
                {i > 0 && dropoff > 0 && (
                  <div className="w-16 text-right text-[10px] text-red-400/70">
                    −{dropoff}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Flow arrows */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        {FUNNEL_STAGES.map((stage, i) => (
          <span key={stage} className="flex items-center gap-1">
            <span className={`inline-block rounded-full px-2 py-0.5 ${FUNNEL_COLORS[stage]} text-white`}>
              {funnelLabel(stage)} ({byFunnel[stage] || 0})
            </span>
            {i < FUNNEL_STAGES.length - 1 && <ArrowRight className="h-3 w-3 text-slate-600" />}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Quality Tab ────────────────────────────────────────────

function QualityTab({
  c,
  byDevice,
  byLocale,
  topicCounts,
  sessions,
  t,
}: {
  c: DashboardData['current'];
  byDevice: Record<string, number>;
  byLocale: Record<string, number>;
  topicCounts: Record<string, number>;
  sessions: DashboardData['sessionList'];
  t: Translations;
}) {
  // Error rate by device
  const errorByDevice: Record<string, { total: number; errors: number }> = {};
  for (const s of sessions) {
    const d = s.deviceType;
    if (!errorByDevice[d]) errorByDevice[d] = { total: 0, errors: 0 };
    errorByDevice[d].total++;
    errorByDevice[d].errors += s.errorCount;
  }

  const sortedTopics = Object.entries(topicCounts).sort(([, a], [, b]) => b - a);
  const sortedDevices = Object.entries(byDevice).sort(([, a], [, b]) => b - a);
  const sortedLocales = Object.entries(byLocale).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      {/* Row 1: Error + technical KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KPI icon={<AlertTriangle className="h-5 w-5" />} label={t.errorRate} value={`${c.errorRate}%`} color="rose" />
        <KPI icon={<Zap className="h-5 w-5" />} label={t.retries} value={c.retryTotal} color="amber" />
        <KPI icon={<Clock className="h-5 w-5" />} label={t.avgToolMs} value={`${c.avgToolMs}ms`} color="sky" />
      </div>

      {/* Distribution cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Topics */}
        <DistributionCard title={t.topTopics} items={sortedTopics} color="violet" />
        {/* Devices */}
        <DistributionCard title={t.topDevices} items={sortedDevices} color="sky" />
        {/* Locales */}
        <DistributionCard title={t.topLocales} items={sortedLocales} color="amber" />
      </div>

      {/* Error by device */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="mb-3 text-sm font-medium text-slate-400">{t.errorsByDevice}</div>
        <div className="space-y-2">
          {Object.entries(errorByDevice).map(([device, data]) => {
            const rate = data.total > 0 ? Math.round((data.errors / data.total) * 100) : 0;
            return (
              <div key={device} className="flex items-center gap-3">
                <DeviceIcon type={device} />
                <span className="w-16 text-xs text-slate-400">{device}</span>
                <div className="flex-1">
                  <div className="relative h-4 overflow-hidden rounded-full bg-white/5">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-red-500/40" style={{ width: `${Math.min(rate, 100)}%` }} />
                  </div>
                </div>
                <span className="w-12 text-right text-xs font-mono text-slate-400">{rate}%</span>
                <span className="w-10 text-right text-[10px] text-slate-500">{data.errors} err</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Distribution Card ──────────────────────────────────────

function DistributionCard({
  title,
  items,
  color = 'violet',
}: {
  title: string;
  items: Array<[string, number]>;
  color?: string;
}) {
  const total = items.reduce((a, [, v]) => a + v, 0) || 1;
  const barColor: Record<string, string> = {
    violet: 'bg-violet-500/50', sky: 'bg-sky-500/50', amber: 'bg-amber-500/50',
    emerald: 'bg-emerald-500/50', rose: 'bg-rose-500/50',
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-3 text-sm font-medium text-slate-400">{title}</div>
      {items.length === 0 ? (
        <div className="text-xs text-slate-500">—</div>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map(([key, count]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-20 truncate text-xs text-slate-300">{key || '—'}</span>
              <div className="flex-1">
                <div className="relative h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${barColor[color] || 'bg-violet-500/50'}`}
                    style={{ width: `${Math.round((count / total) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="w-8 text-right text-[10px] font-mono text-slate-400">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
