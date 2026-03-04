// src/lib/ai/ai-analytics.ts
//
// Collects AI chat session metrics and persists them to the database.
// Writes are fire-and-forget (non-blocking) so they never slow down responses.

import { prisma } from '@/lib/prisma';

// ─── Types ──────────────────────────────────────────────────

/** Engagement + booking funnel stages in order */
const FUNNEL_STAGES = [
  'none',
  'consultation',
  'catalog',
  'master',
  'date',
  'slot',
  'contact',
  'otp',
  'completed',
] as const;

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

/** Analytics data accumulated during a request */
export interface RequestMetrics {
  isGptCall?: boolean;
  isFastPath?: boolean;
  isStreaming?: boolean;
  isVoice?: boolean;
  toolCalls?: Array<{ name: string; durationMs: number }>;
  error?: boolean;
  retried?: boolean;
  funnelStage?: FunnelStage;
  bookingCompleted?: boolean;
  appointmentId?: string;
  consultationUsed?: boolean;
  consultationTopic?: string;
}

/** Initial session info captured once at session start */
export interface SessionInfo {
  sessionId: string;
  locale: string;
  userAgent?: string;
  ip?: string;
  referrer?: string;
}

// ─── Device Detection ───────────────────────────────────────

function detectDeviceType(ua?: string): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  if (!ua) return 'unknown';
  const lower = ua.toLowerCase();

  // Tablets first (before mobile, since some tablets have "mobile" in UA)
  if (lower.includes('ipad') || (lower.includes('android') && !lower.includes('mobile'))) {
    return 'tablet';
  }
  // Mobile
  if (
    lower.includes('mobile') ||
    lower.includes('iphone') ||
    lower.includes('android') ||
    lower.includes('webos') ||
    lower.includes('opera mini') ||
    lower.includes('opera mobi')
  ) {
    return 'mobile';
  }
  // Desktop (has common desktop browser markers)
  if (
    lower.includes('windows') ||
    lower.includes('macintosh') ||
    lower.includes('linux') ||
    lower.includes('cros')
  ) {
    return 'desktop';
  }

  return 'unknown';
}

/** Anonymize IP: zero last octet for IPv4, last 80 bits for IPv6 */
function anonymizeIp(ip?: string): string | null {
  if (!ip) return null;
  // IPv4
  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
  }
  // IPv6 — truncate to first 3 groups
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 3).join(':') + '::';
  }
  return null;
}

// ─── Funnel Stage Comparison ────────────────────────────────

function funnelIndex(stage: FunnelStage): number {
  return FUNNEL_STAGES.indexOf(stage);
}

/** Returns the further-along stage */
function maxFunnelStage(a: FunnelStage, b: FunnelStage): FunnelStage {
  return funnelIndex(a) >= funnelIndex(b) ? a : b;
}

// ─── Analytics API ──────────────────────────────────────────

/**
 * Ensure an analytics record exists for this session.
 * Called once at the start of the first request in a session.
 * Fire-and-forget — errors are logged but don't block the response.
 */
export function initSessionAnalytics(info: SessionInfo): void {
  const deviceType = detectDeviceType(info.userAgent);
  const ipAnon = anonymizeIp(info.ip);

  // Fire-and-forget upsert
  prisma.aiChatSession
    .upsert({
      where: { sessionId: info.sessionId },
      create: {
        sessionId: info.sessionId,
        locale: info.locale || 'de',
        userAgent: info.userAgent?.slice(0, 512) || null,
        deviceType,
        ipAnon,
        referrer: info.referrer?.slice(0, 512) || null,
        startedAt: new Date(),
        endedAt: new Date(),
      },
      update: {
        // Only update locale if it changed (first message sets it)
        locale: info.locale || undefined,
      },
    })
    .catch((err) => {
      console.error('[AI Analytics] initSession error:', err?.message || err);
    });
}

/**
 * Record metrics from a single request (message → response cycle).
 * Called at the end of each request handler.
 * Fire-and-forget — errors are logged but don't block.
 */
export function trackRequestMetrics(
  sessionId: string,
  metrics: RequestMetrics,
  locale = 'de',
): void {
  const toolCount = metrics.toolCalls?.length ?? 0;
  const toolTotalMs = metrics.toolCalls?.reduce((sum, t) => sum + t.durationMs, 0) ?? 0;

  // Build the incremental update
  const update: Record<string, unknown> = {
    messageCount: { increment: 1 },
    assistantMsgCount: { increment: 1 },
    endedAt: new Date(),
  };

  if (metrics.isGptCall) {
    update.gptCallCount = { increment: 1 };
  }
  if (metrics.isFastPath) {
    update.fastPathCount = { increment: 1 };
  }
  if (metrics.isStreaming) {
    update.usedStreaming = true;
  }
  if (metrics.isVoice) {
    update.usedVoice = true;
  }
  if (toolCount > 0) {
    update.toolCallCount = { increment: toolCount };
    update.toolTotalMs = { increment: toolTotalMs };
  }
  if (metrics.error) {
    update.errorCount = { increment: 1 };
  }
  if (metrics.retried) {
    update.retryCount = { increment: 1 };
  }
  if (metrics.bookingCompleted) {
    update.bookingCompleted = true;
    update.funnelStage = 'completed';
    if (metrics.appointmentId) {
      update.appointmentId = metrics.appointmentId;
    }
  }
  if (metrics.consultationUsed) {
    update.consultationUsed = true;
  }

  const createFunnelStage: FunnelStage =
    metrics.bookingCompleted ? 'completed' : (metrics.funnelStage ?? 'none');

  // Fire-and-forget upsert (safe against init/update race).
  prisma.aiChatSession
    .upsert({
      where: { sessionId },
      create: {
        sessionId,
        locale,
        endedAt: new Date(),
        messageCount: 1,
        assistantMsgCount: 1,
        gptCallCount: metrics.isGptCall ? 1 : 0,
        fastPathCount: metrics.isFastPath ? 1 : 0,
        usedStreaming: Boolean(metrics.isStreaming),
        usedVoice: Boolean(metrics.isVoice),
        toolCallCount: toolCount,
        toolTotalMs,
        errorCount: metrics.error ? 1 : 0,
        retryCount: metrics.retried ? 1 : 0,
        bookingCompleted: Boolean(metrics.bookingCompleted),
        appointmentId: metrics.bookingCompleted && metrics.appointmentId ? metrics.appointmentId : null,
        consultationUsed: Boolean(metrics.consultationUsed),
        consultationTopics: metrics.consultationTopic ? metrics.consultationTopic : null,
        funnelStage: createFunnelStage,
      },
      update,
    })
    .then(async (row) => {
      // Update funnel stage if we advanced further
      if (metrics.funnelStage) {
        const current = (row.funnelStage || 'none') as FunnelStage;
        const next = maxFunnelStage(current, metrics.funnelStage);
        if (next !== current) {
          await prisma.aiChatSession.update({
            where: { sessionId },
            data: { funnelStage: next },
          });
        }
      }

      // Append consultation topic if new
      if (metrics.consultationTopic) {
        const existing = row.consultationTopics || '';
        const topics = new Set(existing.split(',').filter(Boolean));
        if (!topics.has(metrics.consultationTopic)) {
          topics.add(metrics.consultationTopic);
          await prisma.aiChatSession.update({
            where: { sessionId },
            data: { consultationTopics: Array.from(topics).join(',') },
          });
        }
      }
    })
    .catch((err) => {
      // Session record might not exist yet (race condition with init)
      // or other DB error — log and move on
      console.error('[AI Analytics] trackRequest error:', err?.message || err);
    });
}

/**
 * Finalize a session: compute duration and do any cleanup.
 * Called when a session expires from the in-memory store.
 */
export function finalizeSessionAnalytics(sessionId: string): void {
  prisma.aiChatSession
    .findUnique({ where: { sessionId } })
    .then(async (row) => {
      if (!row) return;

      const durationSec = Math.round(
        (row.endedAt.getTime() - row.startedAt.getTime()) / 1000,
      );

      await prisma.aiChatSession.update({
        where: { sessionId },
        data: { durationSec },
      });
    })
    .catch((err) => {
      console.error('[AI Analytics] finalize error:', err?.message || err);
    });
}

// ─── Funnel Stage Helpers ───────────────────────────────────

/**
 * Determine funnel stage from fast-path or tool call context.
 * Call this in route.ts to detect what stage the user reached.
 */
export function detectFunnelStage(context: {
  selectedServiceIds?: string[];
  selectedMasterId?: string;
  lastDateISO?: string;
  reservedSlot?: { startAt: string; endAt: string };
  draftId?: string;
  pendingVerificationMethod?: string;
  awaitingRegistrationMethod?: boolean;
  consultationMode?: boolean;
  consultationTopic?: string;
}): FunnelStage {
  if (context.pendingVerificationMethod || context.draftId) return 'otp';
  if (context.awaitingRegistrationMethod) return 'contact';
  if (context.reservedSlot) return 'slot';
  if (context.lastDateISO) return 'date';
  if (context.selectedMasterId) return 'master';
  if (context.selectedServiceIds && context.selectedServiceIds.length > 0) return 'catalog';
  if (context.consultationMode || Boolean(context.consultationTopic)) return 'consultation';
  return 'none';
}

// ─── Query Helpers (for admin dashboard) ────────────────────

/**
 * Get aggregated analytics for a date range.
 * Useful for an admin dashboard.
 */
export async function getAnalyticsSummary(
  from: Date,
  to: Date,
): Promise<{
  totalSessions: number;
  completedBookings: number;
  conversionRate: number;
  avgDurationSec: number;
  avgMessages: number;
  byLocale: Record<string, number>;
  byDevice: Record<string, number>;
  byFunnelStage: Record<string, number>;
  voiceUsagePercent: number;
  streamingUsagePercent: number;
  topErrors: number;
  consultationPercent: number;
}> {
  const sessions = await prisma.aiChatSession.findMany({
    where: {
      startedAt: { gte: from, lte: to },
    },
    select: {
      locale: true,
      deviceType: true,
      funnelStage: true,
      bookingCompleted: true,
      durationSec: true,
      messageCount: true,
      usedVoice: true,
      usedStreaming: true,
      errorCount: true,
      consultationUsed: true,
    },
  });

  const total = sessions.length;
  if (total === 0) {
    return {
      totalSessions: 0,
      completedBookings: 0,
      conversionRate: 0,
      avgDurationSec: 0,
      avgMessages: 0,
      byLocale: {},
      byDevice: {},
      byFunnelStage: {},
      voiceUsagePercent: 0,
      streamingUsagePercent: 0,
      topErrors: 0,
      consultationPercent: 0,
    };
  }

  const completed = sessions.filter((s) => s.bookingCompleted).length;

  const byLocale: Record<string, number> = {};
  const byDevice: Record<string, number> = {};
  const byFunnelStage: Record<string, number> = {};
  let totalDuration = 0;
  let totalMessages = 0;
  let voiceCount = 0;
  let streamingCount = 0;
  let errorTotal = 0;
  let consultationCount = 0;

  for (const s of sessions) {
    byLocale[s.locale] = (byLocale[s.locale] || 0) + 1;
    byDevice[s.deviceType] = (byDevice[s.deviceType] || 0) + 1;
    byFunnelStage[s.funnelStage] = (byFunnelStage[s.funnelStage] || 0) + 1;
    totalDuration += s.durationSec;
    totalMessages += s.messageCount;
    if (s.usedVoice) voiceCount++;
    if (s.usedStreaming) streamingCount++;
    errorTotal += s.errorCount;
    if (s.consultationUsed) consultationCount++;
  }

  return {
    totalSessions: total,
    completedBookings: completed,
    conversionRate: Math.round((completed / total) * 100 * 10) / 10,
    avgDurationSec: Math.round(totalDuration / total),
    avgMessages: Math.round((totalMessages / total) * 10) / 10,
    byLocale,
    byDevice,
    byFunnelStage,
    voiceUsagePercent: Math.round((voiceCount / total) * 100 * 10) / 10,
    streamingUsagePercent: Math.round((streamingCount / total) * 100 * 10) / 10,
    topErrors: errorTotal,
    consultationPercent: Math.round((consultationCount / total) * 100 * 10) / 10,
  };
}
