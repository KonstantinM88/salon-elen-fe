// src/lib/ai/ai-health.ts
//
// Health monitoring and Telegram daily summary for AI assistant.
// - Real-time health status (for admin dashboard widget)
// - Daily summary sent to Telegram admin chat
// - Alert on high error rate

import { prisma } from '@/lib/prisma';
import { ORG_TZ } from '@/lib/orgTime';

// ─── Health Status (real-time) ──────────────────────────────

export interface AiHealthStatus {
  /** Overall status */
  status: 'healthy' | 'degraded' | 'down';
  /** Status emoji */
  emoji: string;
  /** Sessions in last hour */
  sessionsLastHour: number;
  /** Errors in last hour */
  errorsLastHour: number;
  /** Error rate percentage (last hour) */
  errorRateLastHour: number;
  /** Average response time in last hour (from tool latency) */
  avgToolMsLastHour: number;
  /** Sessions today */
  sessionsToday: number;
  /** Bookings completed today */
  bookingsToday: number;
  /** Conversion rate today */
  conversionToday: number;
  /** Last session timestamp */
  lastSessionAt: string | null;
  /** Uptime indicator: minutes since last error */
  minutesSinceLastError: number | null;
}

/**
 * Get real-time health status of the AI assistant.
 * Designed to be fast (<50ms) for dashboard widget.
 */
export async function getAiHealthStatus(): Promise<AiHealthStatus> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const [lastHourSessions, todaySessions, lastError] = await Promise.all([
    // Last hour aggregates
    prisma.aiChatSession.aggregate({
      where: { startedAt: { gte: oneHourAgo } },
      _count: true,
      _sum: {
        errorCount: true,
        toolTotalMs: true,
        toolCallCount: true,
      },
    }),

    // Today aggregates
    prisma.aiChatSession.aggregate({
      where: { startedAt: { gte: todayStart } },
      _count: true,
      _sum: { errorCount: true },
    }),

    // Last error timestamp
    prisma.aiChatSession.findFirst({
      where: { errorCount: { gt: 0 } },
      orderBy: { endedAt: 'desc' },
      select: { endedAt: true },
    }),
  ]);

  // Bookings today
  const bookingsToday = await prisma.aiChatSession.count({
    where: {
      startedAt: { gte: todayStart },
      bookingCompleted: true,
    },
  });

  const sessionsLastHour = lastHourSessions._count;
  const errorsLastHour = lastHourSessions._sum.errorCount || 0;
  const toolTotalMs = lastHourSessions._sum.toolTotalMs || 0;
  const toolCount = lastHourSessions._sum.toolCallCount || 0;
  const avgToolMs = toolCount > 0 ? Math.round(toolTotalMs / toolCount) : 0;

  const errorRate = sessionsLastHour > 0
    ? Math.round((errorsLastHour / sessionsLastHour) * 1000) / 10
    : 0;

  const sessionsToday = todaySessions._count;
  const conversionToday = sessionsToday > 0
    ? Math.round((bookingsToday / sessionsToday) * 1000) / 10
    : 0;

  const minutesSinceLastError = lastError?.endedAt
    ? Math.round((now.getTime() - lastError.endedAt.getTime()) / 60000)
    : null;

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'down';
  let emoji: string;

  if (errorRate > 25 || (sessionsLastHour > 5 && errorsLastHour > sessionsLastHour * 0.25)) {
    status = 'down';
    emoji = '🔴';
  } else if (errorRate > 10 || avgToolMs > 2000) {
    status = 'degraded';
    emoji = '🟡';
  } else {
    status = 'healthy';
    emoji = '🟢';
  }

  return {
    status,
    emoji,
    sessionsLastHour,
    errorsLastHour,
    errorRateLastHour: errorRate,
    avgToolMsLastHour: avgToolMs,
    sessionsToday,
    bookingsToday,
    conversionToday,
    lastSessionAt: lastError?.endedAt?.toISOString() || null,
    minutesSinceLastError,
  };
}

// ─── Daily Summary ──────────────────────────────────────────

export interface DailySummaryData {
  date: string;
  totalSessions: number;
  completedBookings: number;
  conversionRate: number;
  avgDurationSec: number;
  avgMessages: number;
  totalErrors: number;
  totalRetries: number;
  errorRate: number;
  voicePercent: number;
  streamingPercent: number;
  consultationPercent: number;
  fastPathPercent: number;
  avgToolMs: number;
  topLocale: string;
  topDevice: string;
  topFunnel: string;
  topConsultationTopic: string;
}

/**
 * Build daily summary data for a specific date.
 * Default: yesterday.
 */
export async function buildDailySummary(date?: Date): Promise<DailySummaryData> {
  const targetDate = date || new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  const dateStr = dayStart.toLocaleDateString('de-DE', {
    timeZone: ORG_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const sessions = await prisma.aiChatSession.findMany({
    where: { startedAt: { gte: dayStart, lte: dayEnd } },
  });

  const total = sessions.length;
  if (total === 0) {
    return {
      date: dateStr,
      totalSessions: 0, completedBookings: 0, conversionRate: 0,
      avgDurationSec: 0, avgMessages: 0, totalErrors: 0, totalRetries: 0,
      errorRate: 0, voicePercent: 0, streamingPercent: 0,
      consultationPercent: 0, fastPathPercent: 0, avgToolMs: 0,
      topLocale: '-', topDevice: '-', topFunnel: '-', topConsultationTopic: '-',
    };
  }

  const completed = sessions.filter((s) => s.bookingCompleted).length;
  let totalDuration = 0, totalMessages = 0, errors = 0, retries = 0;
  let voice = 0, streaming = 0, consult = 0, gpt = 0, fastPath = 0;
  let toolMs = 0, toolCount = 0;

  const localeCounts: Record<string, number> = {};
  const deviceCounts: Record<string, number> = {};
  const funnelCounts: Record<string, number> = {};
  const topicCounts: Record<string, number> = {};

  for (const s of sessions) {
    totalDuration += s.durationSec;
    totalMessages += s.messageCount;
    errors += s.errorCount;
    retries += s.retryCount;
    if (s.usedVoice) voice++;
    if (s.usedStreaming) streaming++;
    if (s.consultationUsed) consult++;
    gpt += s.gptCallCount;
    fastPath += s.fastPathCount;
    toolMs += s.toolTotalMs;
    toolCount += s.toolCallCount;

    localeCounts[s.locale] = (localeCounts[s.locale] || 0) + 1;
    deviceCounts[s.deviceType] = (deviceCounts[s.deviceType] || 0) + 1;
    funnelCounts[s.funnelStage] = (funnelCounts[s.funnelStage] || 0) + 1;

    if (s.consultationTopics) {
      for (const t of s.consultationTopics.split(',').filter(Boolean)) {
        topicCounts[t] = (topicCounts[t] || 0) + 1;
      }
    }
  }

  const topOf = (obj: Record<string, number>) => {
    const sorted = Object.entries(obj).sort(([, a], [, b]) => b - a);
    return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]})` : '-';
  };

  const totalCalls = gpt + fastPath || 1;

  return {
    date: dateStr,
    totalSessions: total,
    completedBookings: completed,
    conversionRate: Math.round((completed / total) * 1000) / 10,
    avgDurationSec: Math.round(totalDuration / total),
    avgMessages: Math.round((totalMessages / total) * 10) / 10,
    totalErrors: errors,
    totalRetries: retries,
    errorRate: Math.round((errors / totalCalls) * 1000) / 10,
    voicePercent: Math.round((voice / total) * 1000) / 10,
    streamingPercent: Math.round((streaming / total) * 1000) / 10,
    consultationPercent: Math.round((consult / total) * 1000) / 10,
    fastPathPercent: Math.round((fastPath / totalCalls) * 1000) / 10,
    avgToolMs: toolCount > 0 ? Math.round(toolMs / toolCount) : 0,
    topLocale: topOf(localeCounts),
    topDevice: topOf(deviceCounts),
    topFunnel: topOf(funnelCounts),
    topConsultationTopic: topOf(topicCounts),
  };
}

// ─── Telegram Daily Message ─────────────────────────────────

/**
 * Format daily summary as a Telegram markdown message.
 */
export function formatDailySummaryTelegram(data: DailySummaryData): string {
  const conv = data.conversionRate > 0 ? `📈 ${data.conversionRate}%` : '📉 0%';
  const errorEmoji = data.totalErrors === 0 ? '✅' : data.errorRate > 10 ? '🔴' : '⚠️';

  return `🤖 *AI Ассистент \\— Дневной отчёт*

📅 *Дата:* ${escMd(data.date)}

━━━━━━━━━━━━━━━━━━━━━

📊 *Основные показатели*
👥 Сессии: *${data.totalSessions}*
📝 Записи: *${data.completedBookings}* ${conv}
⏱ Ø Длительность: *${data.avgDurationSec}s*
💬 Ø Сообщений: *${data.avgMessages}*

━━━━━━━━━━━━━━━━━━━━━

⚡ *Техническое*
🚀 Fast\\-Path: *${data.fastPathPercent}%*
🔧 Ø Tool latency: *${data.avgToolMs}ms*
${errorEmoji} Ошибки: *${data.totalErrors}* \\(${data.errorRate}%\\)
🔄 Повторы: *${data.totalRetries}*

━━━━━━━━━━━━━━━━━━━━━

🎯 *Использование*
🎙 Голос: *${data.voicePercent}%*
📡 Стриминг: *${data.streamingPercent}%*
💬 Консультация: *${data.consultationPercent}%*

━━━━━━━━━━━━━━━━━━━━━

🏆 *Топ*
🌐 Язык: ${escMd(data.topLocale)}
📱 Устройство: ${escMd(data.topDevice)}
🎯 Воронка: ${escMd(data.topFunnel)}
💡 Тема: ${escMd(data.topConsultationTopic)}`;
}

function escMd(s: string): string {
  return s.replace(/([_*[\]()~`>#+=|{}.!\\-])/g, '\\$1');
}

// ─── Alert on High Error Rate ───────────────────────────────

/**
 * Check if error rate in the last N minutes exceeds threshold.
 * Returns alert message or null.
 */
export async function checkErrorRateAlert(
  windowMinutes: number = 15,
  thresholdPercent: number = 15,
): Promise<string | null> {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  const agg = await prisma.aiChatSession.aggregate({
    where: { startedAt: { gte: since } },
    _count: true,
    _sum: { errorCount: true, gptCallCount: true, fastPathCount: true },
  });

  const totalCalls = (agg._sum.gptCallCount || 0) + (agg._sum.fastPathCount || 0);
  const errors = agg._sum.errorCount || 0;

  if (totalCalls < 3) return null; // Not enough data

  const rate = (errors / totalCalls) * 100;
  if (rate < thresholdPercent) return null;

  return `🚨 *AI Ассистент \\— ALERT*

⚠️ Высокая доля ошибок за последние *${windowMinutes} мин*

🔴 Ошибки: *${errors}* из *${totalCalls}* запросов \\(*${Math.round(rate)}%*\\)
👥 Затронуто сессий: *${agg._count}*

Проверьте логи и /admin/ai`;
}

// ─── Send Functions ─────────────────────────────────────────

/**
 * Send the daily summary to Telegram admin chat.
 */
export async function sendDailySummaryToTelegram(): Promise<boolean> {
  try {
    const summary = await buildDailySummary();
    const message = formatDailySummaryTelegram(summary);
    await sendTelegramAdminMessage(message);

    console.log(`[AI Health] Daily summary sent: ${summary.totalSessions} sessions, ${summary.completedBookings} bookings`);
    return true;
  } catch (err) {
    console.error('[AI Health] Failed to send daily summary:', err);
    return false;
  }
}

/**
 * Check error rate and send alert if exceeded.
 */
export async function checkAndAlertErrors(): Promise<boolean> {
  try {
    const alert = await checkErrorRateAlert();
    if (!alert) return false;

    await sendTelegramAdminMessage(alert);
    console.warn('[AI Health] Error rate alert sent');
    return true;
  } catch (err) {
    console.error('[AI Health] Failed to send alert:', err);
    return false;
  }
}

// ─── Telegram Sender (reuses existing pattern) ──────────────

async function sendTelegramAdminMessage(message: string): Promise<void> {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    console.warn('[AI Health] TELEGRAM_ADMIN_CHAT_ID not configured');
    return;
  }

  const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/telegram/webhook`;

  const res = await fetch(`${webhookUrl}?action=notify&chatId=${adminChatId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('[AI Health] Telegram send failed:', err);
  }
}