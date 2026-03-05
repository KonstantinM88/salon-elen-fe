// src/app/admin/ai/page.tsx
import { Suspense } from 'react';
import { prisma } from '@/lib/db';
import {
  type SearchParamsPromise,
  type SeoLocale,
} from '@/lib/seo-locale';
import { resolveContentLocale } from '@/lib/seo-locale-server';
import AiDashboardClient from './_components/AiDashboardClient';
import AiHealthWidget from './_components/AiHealthWidget';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: SearchParamsPromise;
};

// ─── Data fetching ──────────────────────────────────────────

async function getAiDashboardData(days: number) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

  // Previous period for comparison
  const prevFrom = new Date(from.getTime() - days * 24 * 60 * 60 * 1000);

  const [sessions, prevSessions] = await Promise.all([
    prisma.aiChatSession.findMany({
      where: { startedAt: { gte: from, lte: to } },
      orderBy: { startedAt: 'desc' },
      take: 500,
    }),
    prisma.aiChatSession.findMany({
      where: { startedAt: { gte: prevFrom, lt: from } },
      select: {
        bookingCompleted: true,
        durationSec: true,
        messageCount: true,
        errorCount: true,
        funnelStage: true,
      },
    }),
  ]);

  // ── Aggregate current period ──────────────────────────
  const total = sessions.length;
  const completed = sessions.filter((s) => s.bookingCompleted).length;

  const byLocale: Record<string, number> = {};
  const byDevice: Record<string, number> = {};
  const byFunnel: Record<string, number> = {};
  let totalDuration = 0;
  let totalMessages = 0;
  let voiceCount = 0;
  let streamingCount = 0;
  let errorTotal = 0;
  let retryTotal = 0;
  let consultCount = 0;
  let gptTotal = 0;
  let fastPathTotal = 0;
  let toolTotal = 0;
  let toolMsTotal = 0;

  for (const s of sessions) {
    byLocale[s.locale] = (byLocale[s.locale] || 0) + 1;
    byDevice[s.deviceType] = (byDevice[s.deviceType] || 0) + 1;
    byFunnel[s.funnelStage] = (byFunnel[s.funnelStage] || 0) + 1;
    totalDuration += s.durationSec;
    totalMessages += s.messageCount;
    if (s.usedVoice) voiceCount++;
    if (s.usedStreaming) streamingCount++;
    errorTotal += s.errorCount;
    retryTotal += s.retryCount;
    if (s.consultationUsed) consultCount++;
    gptTotal += s.gptCallCount;
    fastPathTotal += s.fastPathCount;
    toolTotal += s.toolCallCount;
    toolMsTotal += s.toolTotalMs;
  }

  // ── Aggregate previous period ─────────────────────────
  const prevTotal = prevSessions.length;
  const prevCompleted = prevSessions.filter((s) => s.bookingCompleted).length;
  const prevTotalDuration = prevSessions.reduce((a, s) => a + s.durationSec, 0);
  const prevTotalMessages = prevSessions.reduce((a, s) => a + s.messageCount, 0);
  const prevErrors = prevSessions.reduce((a, s) => a + s.errorCount, 0);

  // ── Daily breakdown ───────────────────────────────────
  const dailyMap = new Map<string, { sessions: number; bookings: number; errors: number }>();
  for (const s of sessions) {
    const day = s.startedAt.toISOString().slice(0, 10);
    const entry = dailyMap.get(day) || { sessions: 0, bookings: 0, errors: 0 };
    entry.sessions++;
    if (s.bookingCompleted) entry.bookings++;
    entry.errors += s.errorCount;
    dailyMap.set(day, entry);
  }
  const daily = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data }));

  // ── Consultation topics ───────────────────────────────
  const topicCounts: Record<string, number> = {};
  for (const s of sessions) {
    if (s.consultationTopics) {
      for (const t of s.consultationTopics.split(',').filter(Boolean)) {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      }
    }
  }

  // ── Session list (for table) ──────────────────────────
  const sessionList = sessions.slice(0, 200).map((s) => ({
    id: s.id,
    sessionId: s.sessionId,
    locale: s.locale,
    deviceType: s.deviceType,
    messageCount: s.messageCount,
    gptCallCount: s.gptCallCount,
    fastPathCount: s.fastPathCount,
    toolCallCount: s.toolCallCount,
    errorCount: s.errorCount,
    funnelStage: s.funnelStage,
    bookingCompleted: s.bookingCompleted,
    consultationUsed: s.consultationUsed,
    consultationTopics: s.consultationTopics,
    usedVoice: s.usedVoice,
    usedStreaming: s.usedStreaming,
    durationSec: s.durationSec,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt.toISOString(),
  }));

  return {
    period: { from: from.toISOString(), to: to.toISOString(), days },
    current: {
      totalSessions: total,
      completedBookings: completed,
      conversionRate: total > 0 ? Math.round((completed / total) * 1000) / 10 : 0,
      avgDurationSec: total > 0 ? Math.round(totalDuration / total) : 0,
      avgMessages: total > 0 ? Math.round((totalMessages / total) * 10) / 10 : 0,
      voicePercent: total > 0 ? Math.round((voiceCount / total) * 1000) / 10 : 0,
      streamingPercent: total > 0 ? Math.round((streamingCount / total) * 1000) / 10 : 0,
      consultPercent: total > 0 ? Math.round((consultCount / total) * 1000) / 10 : 0,
      errorTotal,
      retryTotal,
      errorRate: total > 0 ? Math.round((errorTotal / (gptTotal + fastPathTotal || 1)) * 1000) / 10 : 0,
      gptTotal,
      fastPathTotal,
      fastPathPercent: (gptTotal + fastPathTotal) > 0
        ? Math.round((fastPathTotal / (gptTotal + fastPathTotal)) * 1000) / 10
        : 0,
      toolTotal,
      avgToolMs: toolTotal > 0 ? Math.round(toolMsTotal / toolTotal) : 0,
    },
    previous: {
      totalSessions: prevTotal,
      completedBookings: prevCompleted,
      conversionRate: prevTotal > 0 ? Math.round((prevCompleted / prevTotal) * 1000) / 10 : 0,
      avgDurationSec: prevTotal > 0 ? Math.round(prevTotalDuration / prevTotal) : 0,
      avgMessages: prevTotal > 0 ? Math.round((prevTotalMessages / prevTotal) * 10) / 10 : 0,
      errorTotal: prevErrors,
    },
    byLocale,
    byDevice,
    byFunnel,
    daily,
    topicCounts,
    sessionList,
  };
}

// ─── Page ───────────────────────────────────────────────────

const COPY: Record<SeoLocale, { title: string; subtitle: string }> = {
  de: { title: 'AI Assistent', subtitle: 'Analyse & Monitoring des KI-Assistenten' },
  ru: { title: 'AI Ассистент', subtitle: 'Аналитика и мониторинг AI-ассистента' },
  en: { title: 'AI Assistant', subtitle: 'AI assistant analytics & monitoring' },
};

export default async function AiDashboardPage({ searchParams }: PageProps) {
  const locale = await resolveContentLocale(searchParams);
  const t = COPY[locale];

  const sp = (await searchParams) ?? {};
  const daysParam = typeof sp.days === 'string' ? parseInt(sp.days, 10) : 7;
  const days = [1, 7, 14, 30, 90].includes(daysParam) ? daysParam : 7;

  const data = await getAiDashboardData(days);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{t.title}</h1>
        <p className="mt-1 opacity-60">{t.subtitle}</p>
      </div>

      <div className="mb-6 max-w-md">
        <AiHealthWidget locale={locale} />
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        }
      >
        <AiDashboardClient data={data} locale={locale} />
      </Suspense>
    </div>
  );
}
