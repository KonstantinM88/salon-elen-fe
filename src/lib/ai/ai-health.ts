// src/lib/ai/ai-health.ts
//
// Health monitoring and Telegram daily summary for AI assistant.
// - Real-time health status (for admin dashboard widget)
// - Daily summary sent to Telegram admin chat
// - Alert on high error rate

import { prisma } from '@/lib/prisma';
import { Temporal } from '@js-temporal/polyfill';
import { isYmd, ORG_TZ, orgDayRange } from '@/lib/orgTime';
import { getBookingMethodLabel } from '@/lib/booking/booking-method';
import { buildUpcomingAppointmentsMarkdownReport } from '@/lib/booking/upcoming-appointments-report';
import { getSiteVisitSummary } from '@/lib/site-analytics';

const AI_HEALTH_DB_RETRY_DELAY_MS = 750;
const AI_HEALTH_DB_MAX_ATTEMPTS = Math.max(
  1,
  parseInt(process.env.AI_HEALTH_DB_MAX_ATTEMPTS || '4', 10),
);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function collectErrorMessages(error: unknown): string {
  const messages: string[] = [];
  let current: unknown = error;

  for (let depth = 0; depth < 4 && current; depth += 1) {
    if (current instanceof Error) {
      messages.push(current.message);
    } else if (typeof current === 'string') {
      messages.push(current);
    }

    if (typeof current !== 'object' || current === null || !('cause' in current)) {
      break;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return messages.join(' ');
}

function isTransientDbConnectionError(error: unknown): boolean {
  const message = collectErrorMessages(error);
  return /connection terminated|connection timeout|terminated unexpectedly|ECONNRESET|ETIMEDOUT|P1001|P1017/i.test(message);
}

async function withTransientDbRetry<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  let attempt = 1;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (!isTransientDbConnectionError(error) || attempt >= AI_HEALTH_DB_MAX_ATTEMPTS) {
        throw error;
      }

      const delayMs = Math.min(
        AI_HEALTH_DB_RETRY_DELAY_MS * 2 ** (attempt - 1),
        5000,
      );
      console.warn(
        `[AI Health] Transient DB error during ${label}; retry ${attempt}/${AI_HEALTH_DB_MAX_ATTEMPTS - 1} in ${delayMs}ms`,
      );
      await sleep(delayMs);
      attempt += 1;
    }
  }
}

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
  return withTransientDbRetry('get health status', getAiHealthStatusOnce);
}

async function getAiHealthStatusOnce(): Promise<AiHealthStatus> {
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
  dateISO: string;
  date: string;
  siteVisits: number;
  sitePageviews: number;
  aiReferrals: number;
  aiTrafficSources: Array<{ source: string; label: string; visits: number; pageviews: number }>;
  appointmentCreations: number;
  bookingMethods: Array<{ method: string; label: string; count: number }>;
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
function orgTodayISO(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ORG_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function shiftDateISO(dateISO: string, days: number): string {
  return Temporal.PlainDate.from(dateISO).add({ days }).toString();
}

function displayDateISO(dateISO: string): string {
  const [year, month, day] = dateISO.split('-');
  return `${day}.${month}.${year}`;
}

function resolveDailySummaryDateISO(date?: Date | string): string {
  if (typeof date === 'string') {
    if (!isYmd(date)) {
      throw new Error(`Daily summary date must be YYYY-MM-DD, got "${date}"`);
    }
    return date;
  }

  if (date) {
    return orgTodayISO(date);
  }

  return shiftDateISO(orgTodayISO(), -1);
}

export function resolveDailySummaryDateParam(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (value === 'today') return orgTodayISO();
  if (value === 'yesterday') return shiftDateISO(orgTodayISO(), -1);
  if (isYmd(value)) return value;
  throw new Error(`Unsupported date param "${value}". Use YYYY-MM-DD, today, or yesterday.`);
}

export async function buildDailySummary(date?: Date | string): Promise<DailySummaryData> {
  return withTransientDbRetry('build daily summary', () => buildDailySummaryOnce(date));
}

async function buildDailySummaryOnce(date?: Date | string): Promise<DailySummaryData> {
  const dateISO = resolveDailySummaryDateISO(date);
  const { start: dayStart, end: dayEnd } = orgDayRange(dateISO);
  const dateStr = displayDateISO(dateISO);

  const [sessions, siteSummary, createdAppointments] = await Promise.all([
    prisma.aiChatSession.findMany({
      where: { startedAt: { gte: dayStart, lt: dayEnd } },
    }),
    getSiteVisitSummary(dateISO),
    prisma.appointment.findMany({
      where: {
        createdAt: { gte: dayStart, lt: dayEnd },
        deletedAt: null,
      },
      select: {
        bookingMethod: true,
      },
    }),
  ]);

  const bookingMethodCounts = new Map<string, number>();
  for (const appointment of createdAppointments) {
    const method = appointment.bookingMethod || 'website';
    bookingMethodCounts.set(method, (bookingMethodCounts.get(method) ?? 0) + 1);
  }

  const bookingMethods = Array.from(bookingMethodCounts.entries())
    .map(([method, count]) => ({
      method,
      label: getBookingMethodLabel(method),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  const total = sessions.length;
  if (total === 0) {
    return {
      dateISO,
      date: dateStr,
      siteVisits: siteSummary.siteVisits,
      sitePageviews: siteSummary.sitePageviews,
      aiReferrals: siteSummary.aiReferrals,
      aiTrafficSources: siteSummary.aiTrafficSources,
      appointmentCreations: createdAppointments.length,
      bookingMethods,
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
    dateISO,
    date: dateStr,
    siteVisits: siteSummary.siteVisits,
    sitePageviews: siteSummary.sitePageviews,
    aiReferrals: siteSummary.aiReferrals,
    aiTrafficSources: siteSummary.aiTrafficSources,
    appointmentCreations: createdAppointments.length,
    bookingMethods,
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
  const bookingMethodLines = data.bookingMethods.length > 0
    ? data.bookingMethods
        .map((item) => `   • ${escMd(item.label)}: *${item.count}*`)
        .join('\n')
    : '   • \\-';
  const aiTrafficLines = data.aiTrafficSources.length > 0
    ? data.aiTrafficSources
        .map((item) => `   • ${escMd(item.label)}: *${item.visits}*`)
        .join('\n')
    : '   • \\-';

  return `🤖 *AI Ассистент \\— Дневной отчёт*

📅 *Дата:* ${escMd(data.date)}

━━━━━━━━━━━━━━━━━━━━━

📊 *Основные показатели*
🌐 Посещения сайта: *${data.siteVisits}*
📄 Просмотры страниц: *${data.sitePageviews}*
🤖 Переходы из AI\\-поиска: *${data.aiReferrals}*
${aiTrafficLines}
👥 Сессии: *${data.totalSessions}*
📝 Записи: *${data.completedBookings}* ${conv}
🧭 Все новые записи за день: *${data.appointmentCreations}*
${bookingMethodLines}
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
  return withTransientDbRetry('check error rate alert', () =>
    checkErrorRateAlertOnce(windowMinutes, thresholdPercent),
  );
}

async function checkErrorRateAlertOnce(
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
export async function sendDailySummaryToTelegram(date?: Date | string): Promise<boolean> {
  try {
    const summary = await buildDailySummary(date);
    let upcomingAppointments: string;

    try {
      upcomingAppointments = await withTransientDbRetry(
        'build upcoming appointments report',
        () => buildUpcomingAppointmentsMarkdownReport(7, { limit: 12 }),
      );
    } catch (upcomingError) {
      console.error('[AI Health] Failed to build upcoming appointments block:', upcomingError);
      upcomingAppointments =
        '📅 *Ближайшие термины на 7 дней*\n\nНе удалось получить список из\\-за временной ошибки БД\\. Откройте список через меню бота: /admin';
    }

    const message = `${formatDailySummaryTelegram(summary)}

━━━━━━━━━━━━━━━━━━━━━

${upcomingAppointments}`;
    await sendTelegramAdminMessage(message);

    console.log(`[AI Health] Daily summary sent for ${summary.dateISO}: ${summary.totalSessions} sessions, ${summary.completedBookings} bookings`);
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
    console.error('[AI Health] Failed to check or send alert:', err);
    return false;
  }
}

// ─── Telegram Sender (reuses existing pattern) ──────────────

async function sendTelegramAdminMessage(message: string): Promise<void> {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) {
    throw new Error('TELEGRAM_ADMIN_CHAT_ID not configured');
  }

  const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/telegram/webhook`;

  const res = await fetch(`${webhookUrl}?action=notify&chatId=${encodeURIComponent(adminChatId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Telegram send failed: ${JSON.stringify(err)}`);
  }
}
