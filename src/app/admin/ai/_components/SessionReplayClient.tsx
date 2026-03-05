// src/app/admin/ai/_components/SessionReplayClient.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  User,
  Mic,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Wrench,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Copy,
  MessageSquare,
} from 'lucide-react';
import type { SeoLocale } from '@/lib/seo-locale';
import type { TurnReplayItem } from '@/lib/ai/turn-tracker';

// ─── Types ──────────────────────────────────────────────────

interface SessionData {
  id: string;
  sessionId: string;
  locale: string;
  deviceType: string;
  userAgent: string | null;
  messageCount: number;
  gptCallCount: number;
  fastPathCount: number;
  toolCallCount: number;
  toolTotalMs: number;
  errorCount: number;
  retryCount: number;
  funnelStage: string;
  bookingCompleted: boolean;
  consultationUsed: boolean;
  consultationTopics: string | null;
  usedVoice: boolean;
  usedStreaming: boolean;
  durationSec: number;
  startedAt: string;
  endedAt: string;
}

// ─── Translations ───────────────────────────────────────────

const T = {
  de: {
    back: 'Zurück', sessionDetail: 'Sitzungsdetail', turns: 'Turns', overview: 'Übersicht',
    user: 'Benutzer', assistant: 'Assistent', tool: 'Tool', duration: 'Dauer',
    errors: 'Fehler', fastPath: 'Fast-Path', gpt: 'GPT', mode: 'Modus',
    funnel: 'Stufe', outcome: 'Ergebnis', copy: 'Kopieren', copied: 'Kopiert',
    turnN: 'Turn', noTurns: 'Keine Turns aufgezeichnet',
    toolRuns: 'Tool-Aufrufe', ttfd: 'TTFD', total: 'Total',
    session: 'Sitzung', device: 'Gerät', locale: 'Sprache', voice: 'Sprache',
    streaming: 'Streaming', consultation: 'Beratung', booked: 'Gebucht',
    messages: 'Nachrichten', retries: 'Wiederholungen',
  },
  ru: {
    back: 'Назад', sessionDetail: 'Детали сессии', turns: 'Шаги', overview: 'Обзор',
    user: 'Пользователь', assistant: 'Ассистент', tool: 'Инструмент', duration: 'Длит.',
    errors: 'Ошибки', fastPath: 'Fast-Path', gpt: 'GPT', mode: 'Режим',
    funnel: 'Этап', outcome: 'Результат', copy: 'Копировать', copied: 'Скопировано',
    turnN: 'Шаг', noTurns: 'Нет записанных шагов',
    toolRuns: 'Вызовы tools', ttfd: 'TTFD', total: 'Всего',
    session: 'Сессия', device: 'Устройство', locale: 'Язык', voice: 'Голос',
    streaming: 'Стриминг', consultation: 'Консультация', booked: 'Запись',
    messages: 'Сообщений', retries: 'Повторы',
  },
  en: {
    back: 'Back', sessionDetail: 'Session Detail', turns: 'Turns', overview: 'Overview',
    user: 'User', assistant: 'Assistant', tool: 'Tool', duration: 'Duration',
    errors: 'Errors', fastPath: 'Fast-Path', gpt: 'GPT', mode: 'Mode',
    funnel: 'Stage', outcome: 'Outcome', copy: 'Copy', copied: 'Copied',
    turnN: 'Turn', noTurns: 'No turns recorded',
    toolRuns: 'Tool Runs', ttfd: 'TTFD', total: 'Total',
    session: 'Session', device: 'Device', locale: 'Locale', voice: 'Voice',
    streaming: 'Streaming', consultation: 'Consultation', booked: 'Booked',
    messages: 'Messages', retries: 'Retries',
  },
} as const;

const OUTCOME_STYLES: Record<string, string> = {
  ok: 'bg-emerald-500/20 text-emerald-400',
  error: 'bg-red-500/20 text-red-400',
  timeout: 'bg-amber-500/20 text-amber-400',
  aborted: 'bg-slate-500/20 text-slate-400',
  degraded: 'bg-yellow-500/20 text-yellow-400',
};

function DeviceIcon({ type }: { type: string }) {
  if (type === 'mobile') return <Smartphone className="h-4 w-4" />;
  if (type === 'tablet') return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

function fmtMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ─── Component ──────────────────────────────────────────────

export default function SessionReplayClient({
  session,
  turns,
  locale,
}: {
  session: SessionData;
  turns: TurnReplayItem[];
  locale: SeoLocale;
}) {
  const t = T[locale];
  const [expandedTurns, setExpandedTurns] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggleTurn = (id: string) => {
    setExpandedTurns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(session.sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/ai"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{t.sessionDetail}</h1>
          <button
            onClick={copySessionId}
            className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-white"
          >
            <span className="font-mono">{session.sessionId.slice(0, 16)}...</span>
            <Copy className="h-3 w-3" />
            {copied && <span className="text-emerald-400">{t.copied}</span>}
          </button>
        </div>
      </div>

      {/* Session Overview Card */}
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
        <MetaItem icon={<Globe className="h-4 w-4" />} label={t.locale} value={session.locale.toUpperCase()} />
        <MetaItem icon={<DeviceIcon type={session.deviceType} />} label={t.device} value={session.deviceType} />
        <MetaItem icon={<MessageSquare className="h-4 w-4" />} label={t.messages} value={String(session.messageCount)} />
        <MetaItem icon={<Clock className="h-4 w-4" />} label={t.duration} value={`${session.durationSec}s`} />
        <MetaItem icon={<Zap className="h-4 w-4" />} label={t.fastPath} value={String(session.fastPathCount)} />
        <MetaItem icon={<Bot className="h-4 w-4" />} label={t.gpt} value={String(session.gptCallCount)} />
        <MetaItem icon={<Wrench className="h-4 w-4" />} label={t.toolRuns} value={`${session.toolCallCount} (${session.toolTotalMs}ms)`} />
        <MetaItem icon={<AlertTriangle className="h-4 w-4" />} label={t.errors} value={String(session.errorCount)} accent={session.errorCount > 0 ? 'red' : undefined} />
        <MetaItem
          icon={<CheckCircle2 className="h-4 w-4" />}
          label={t.funnel}
          value={session.funnelStage}
          accent={session.bookingCompleted ? 'green' : undefined}
        />
        {session.usedVoice && <MetaItem icon={<Mic className="h-4 w-4" />} label={t.voice} value="✓" accent="blue" />}
        {session.usedStreaming && <MetaItem icon={<Zap className="h-4 w-4" />} label={t.streaming} value="SSE" accent="violet" />}
        {session.consultationUsed && (
          <MetaItem icon={<Bot className="h-4 w-4" />} label={t.consultation} value={session.consultationTopics || '✓'} accent="pink" />
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">
          {t.turns} ({turns.length})
        </h2>

        {turns.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-slate-500">
            {t.noTurns}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />

            {turns.map((turn, i) => {
              const isExpanded = expandedTurns.has(turn.id);
              const hasError = turn.outcome !== 'ok';
              const hasTools = turn.toolRuns.length > 0;

              return (
                <motion.div
                  key={turn.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="relative pl-12 pb-4"
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-3.5 top-2 h-3 w-3 rounded-full border-2 ${
                      hasError ? 'border-red-500 bg-red-500/30' :
                      turn.isFastPath ? 'border-emerald-500 bg-emerald-500/30' :
                      'border-violet-500 bg-violet-500/30'
                    }`}
                  />

                  {/* Turn card */}
                  <div
                    className={`rounded-xl border bg-white/5 backdrop-blur-sm transition-colors ${
                      hasError ? 'border-red-500/20' : 'border-white/10'
                    }`}
                  >
                    {/* Turn header — clickable */}
                    <button
                      onClick={() => toggleTurn(turn.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span className="text-xs font-mono text-slate-500">#{turn.turnNumber}</span>

                      {/* Mode badge */}
                      {turn.isFastPath ? (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          ⚡ {turn.fastPathName || t.fastPath}
                        </span>
                      ) : (
                        <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                          🤖 {t.gpt}
                          {turn.responseMode === 'sse' && ' SSE'}
                        </span>
                      )}

                      {/* Input mode */}
                      {turn.inputMode === 'voice' && <Mic className="h-3 w-3 text-pink-400" />}

                      {/* Outcome */}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${OUTCOME_STYLES[turn.outcome] || OUTCOME_STYLES.ok}`}>
                        {turn.outcome}
                      </span>

                      {/* Timing */}
                      <span className="ml-auto text-[10px] font-mono text-slate-500">
                        {fmtMs(turn.totalMs)}
                        {turn.ttfdMs != null && (
                          <span className="text-slate-600"> (ttfd: {fmtMs(turn.ttfdMs)})</span>
                        )}
                      </span>

                      {/* Tools count */}
                      {hasTools && (
                        <span className="text-[10px] text-slate-500">
                          🔧{turn.toolRuns.length}
                        </span>
                      )}

                      {/* Expand/collapse */}
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-slate-500" />
                      )}
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/5 px-4 py-3 space-y-3">
                            {/* User message */}
                            {turn.userMessage && (
                              <div className="flex gap-2">
                                <User className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                                <div className="flex-1 rounded-lg bg-sky-500/10 px-3 py-2 text-xs text-slate-300">
                                  {turn.userMessage}
                                </div>
                              </div>
                            )}

                            {/* Tool runs timeline */}
                            {turn.toolRuns.length > 0 && (
                              <div className="space-y-1 pl-6">
                                {turn.toolRuns.map((tr) => (
                                  <div key={tr.id} className="flex items-center gap-2 text-[11px]">
                                    <Wrench className="h-3 w-3 text-slate-500" />
                                    <span className="font-mono text-slate-400">{tr.toolName}</span>
                                    {tr.step && <span className="text-slate-600">({tr.step})</span>}
                                    <span className="font-mono text-slate-500">{fmtMs(tr.durationMs)}</span>
                                    {!tr.ok && (
                                      <span className="rounded bg-red-500/20 px-1 py-0.5 text-red-400">
                                        {tr.errorCode || 'error'}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Assistant message */}
                            {turn.assistantMessage && (
                              <div className="flex gap-2">
                                <Bot className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                                <div className="flex-1 rounded-lg bg-violet-500/10 px-3 py-2 text-xs text-slate-300 whitespace-pre-wrap">
                                  {turn.assistantMessage.length > 500
                                    ? turn.assistantMessage.slice(0, 500) + '...'
                                    : turn.assistantMessage}
                                </div>
                              </div>
                            )}

                            {/* Error details */}
                            {turn.errorCategory && (
                              <div className="flex gap-2 pl-6">
                                <AlertTriangle className="mt-0.5 h-3 w-3 text-red-400" />
                                <div className="text-[11px] text-red-400">
                                  <span className="font-mono">{turn.errorCategory}</span>
                                  {turn.errorCode && <span> / {turn.errorCode}</span>}
                                  {turn.errorMessageSafe && (
                                    <div className="mt-0.5 text-red-400/70">{turn.errorMessageSafe}</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Meta row */}
                            <div className="flex flex-wrap gap-3 pl-6 text-[10px] text-slate-600">
                              <span>{t.funnel}: {turn.funnelStage}</span>
                              <span>{fmtTime(turn.startedAt)} → {fmtTime(turn.endedAt)}</span>
                              {turn.retried && <span className="text-amber-500">retried</span>}
                              {turn.gptIterations > 0 && <span>iterations: {turn.gptIterations}</span>}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MetaItem ───────────────────────────────────────────────

function MetaItem({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: 'red' | 'green' | 'blue' | 'violet' | 'pink';
}) {
  const accentClass = accent
    ? {
        red: 'text-red-400',
        green: 'text-emerald-400',
        blue: 'text-sky-400',
        violet: 'text-violet-400',
        pink: 'text-pink-400',
      }[accent]
    : 'text-slate-300';

  return (
    <div className="flex items-center gap-2">
      <div className="text-slate-500">{icon}</div>
      <div>
        <div className="text-[10px] text-slate-500">{label}</div>
        <div className={`text-xs font-medium ${accentClass}`}>{value}</div>
      </div>
    </div>
  );
}
