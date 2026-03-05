// src/app/admin/ai/_components/AiHealthWidget.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  RefreshCw,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
} from 'lucide-react';
import type { SeoLocale } from '@/lib/seo-locale';

interface HealthData {
  status: 'healthy' | 'degraded' | 'down';
  emoji: string;
  sessionsLastHour: number;
  errorsLastHour: number;
  errorRateLastHour: number;
  avgToolMsLastHour: number;
  sessionsToday: number;
  bookingsToday: number;
  conversionToday: number;
  minutesSinceLastError: number | null;
}

const T = {
  de: {
    title: 'AI Status', refresh: 'Aktualisieren', sendSummary: 'Bericht senden',
    healthy: 'Gesund', degraded: 'Eingeschränkt', down: 'Störung',
    lastHour: 'Letzte Stunde', today: 'Heute',
    sessions: 'Sitzungen', bookings: 'Buchungen', errors: 'Fehler',
    errorRate: 'Fehlerrate', toolLatency: 'Tool-Latenz', conversion: 'Konversion',
    noErrorsFor: 'Fehlerfrei seit', min: 'min', sent: 'Gesendet!', sending: 'Sende...',
  },
  ru: {
    title: 'AI Статус', refresh: 'Обновить', sendSummary: 'Отправить отчёт',
    healthy: 'Здоров', degraded: 'Ухудшен', down: 'Сбой',
    lastHour: 'Последний час', today: 'Сегодня',
    sessions: 'Сессии', bookings: 'Записи', errors: 'Ошибки',
    errorRate: 'Доля ошибок', toolLatency: 'Latency tools', conversion: 'Конверсия',
    noErrorsFor: 'Без ошибок', min: 'мин', sent: 'Отправлено!', sending: 'Отправка...',
  },
  en: {
    title: 'AI Status', refresh: 'Refresh', sendSummary: 'Send Summary',
    healthy: 'Healthy', degraded: 'Degraded', down: 'Down',
    lastHour: 'Last Hour', today: 'Today',
    sessions: 'Sessions', bookings: 'Bookings', errors: 'Errors',
    errorRate: 'Error Rate', toolLatency: 'Tool Latency', conversion: 'Conversion',
    noErrorsFor: 'Error-free for', min: 'min', sent: 'Sent!', sending: 'Sending...',
  },
} as const;

const STATUS_STYLES = {
  healthy: { bg: 'from-emerald-500/15 to-green-500/15', border: 'border-emerald-500/25', dot: 'bg-emerald-500', text: 'text-emerald-400' },
  degraded: { bg: 'from-amber-500/15 to-yellow-500/15', border: 'border-amber-500/25', dot: 'bg-amber-500', text: 'text-amber-400' },
  down: { bg: 'from-red-500/15 to-rose-500/15', border: 'border-red-500/25', dot: 'bg-red-500', text: 'text-red-400' },
};

export default function AiHealthWidget({ locale }: { locale: SeoLocale }) {
  const t = T[locale];
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<'idle' | 'sending' | 'sent'>('idle');

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai-health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const handleSendSummary = async () => {
    setSending('sending');
    try {
      await fetch('/api/admin/ai-health?action=daily', { method: 'POST' });
      setSending('sent');
      setTimeout(() => setSending('idle'), 2000);
    } catch {
      setSending('idle');
    }
  };

  if (loading && !health) {
    return (
      <div className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
    );
  }

  if (!health) return null;

  const style = STATUS_STYLES[health.status];
  const statusLabel = t[health.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${style.bg} ${style.border} p-5 backdrop-blur-xl`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-slate-300" />
          <span className="text-sm font-semibold text-slate-200">{t.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status dot + label */}
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${style.dot} animate-pulse`} />
            <span className={`text-xs font-medium ${style.text}`}>{statusLabel}</span>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            title={t.refresh}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Last hour */}
        <div className="space-y-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{t.lastHour}</div>
          <Metric icon={<Users className="h-3 w-3" />} label={t.sessions} value={health.sessionsLastHour} />
          <Metric icon={<AlertTriangle className="h-3 w-3" />} label={t.errors} value={health.errorsLastHour}
            accent={health.errorsLastHour > 0 ? 'red' : undefined} />
          <Metric icon={<Wrench className="h-3 w-3" />} label={t.toolLatency} value={`${health.avgToolMsLastHour}ms`} />
        </div>

        {/* Today */}
        <div className="space-y-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{t.today}</div>
          <Metric icon={<Users className="h-3 w-3" />} label={t.sessions} value={health.sessionsToday} />
          <Metric icon={<CheckCircle2 className="h-3 w-3" />} label={t.bookings} value={health.bookingsToday}
            accent={health.bookingsToday > 0 ? 'green' : undefined} />
          <Metric icon={<Clock className="h-3 w-3" />} label={t.conversion} value={`${health.conversionToday}%`} />
        </div>
      </div>

      {/* Error-free streak */}
      {health.minutesSinceLastError != null && health.minutesSinceLastError > 30 && (
        <div className="mt-3 text-[10px] text-emerald-400/70">
          ✅ {t.noErrorsFor} {health.minutesSinceLastError} {t.min}
        </div>
      )}

      {/* Send summary button */}
      <div className="mt-4 border-t border-white/5 pt-3">
        <button
          onClick={handleSendSummary}
          disabled={sending !== 'idle'}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <Send className="h-3 w-3" />
          {sending === 'sending' ? t.sending : sending === 'sent' ? `✅ ${t.sent}` : t.sendSummary}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Metric row ─────────────────────────────────────────────

function Metric({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: 'red' | 'green';
}) {
  const valueColor = accent === 'red' ? 'text-red-400' : accent === 'green' ? 'text-emerald-400' : 'text-white';

  return (
    <div className="flex items-center gap-2">
      <div className="text-slate-500">{icon}</div>
      <span className="flex-1 text-[11px] text-slate-400">{label}</span>
      <span className={`text-xs font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}