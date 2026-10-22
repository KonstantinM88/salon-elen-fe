import { Temporal } from '@js-temporal/polyfill';
import { ORG_TZ, orgDayRange } from '@/lib/orgTime';
import type { DailySummaryData } from '@/lib/ai/ai-health';

export interface DailyHeadlineMetrics {
  siteVisits: number;
  sitePageviews: number;
  appointmentCreations: number;
  totalSessions: number;
  completedBookings: number;
  conversionRate: number;
}

export interface DailyHeadlinePoint extends DailyHeadlineMetrics {
  dateISO: string;
}

export interface DailyReportComparison {
  reportingDateISO: string;
  previousDateISO: string;
  weeklyStartISO: string;
  weeklyEndISO: string;
  currentWeekStartISO: string;
  currentWeekEndISO: string;
  previousWeekStartISO: string;
  previousWeekEndISO: string;
  current: DailyHeadlineMetrics;
  previous: DailyHeadlineMetrics;
  weeklyAverage: DailyHeadlineMetrics;
  weeklyTotals: DailyHeadlineMetrics;
  currentWeekTotals: DailyHeadlineMetrics;
  previousWeekTotals: DailyHeadlineMetrics;
}

const WEEK_DAYS = 7;
const HISTORY_DAYS = WEEK_DAYS * 2 - 1;

function emptyPoint(dateISO: string): DailyHeadlinePoint {
  return {
    dateISO,
    siteVisits: 0,
    sitePageviews: 0,
    appointmentCreations: 0,
    totalSessions: 0,
    completedBookings: 0,
    conversionRate: 0,
  };
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function conversionRate(completedBookings: number, totalSessions: number): number {
  return totalSessions > 0
    ? roundOne((completedBookings / totalSessions) * 100)
    : 0;
}

function localDateISO(date: Date): string {
  return Temporal.Instant.from(date.toISOString())
    .toZonedDateTimeISO(ORG_TZ)
    .toPlainDate()
    .toString();
}

function metricsFromSummary(summary: DailySummaryData): DailyHeadlineMetrics {
  return {
    siteVisits: summary.siteVisits,
    sitePageviews: summary.sitePageviews,
    appointmentCreations: summary.appointmentCreations,
    totalSessions: summary.totalSessions,
    completedBookings: summary.completedBookings,
    conversionRate: summary.conversionRate,
  };
}

function totalMetrics(
  dates: string[],
  byDate: Map<string, DailyHeadlinePoint>,
): DailyHeadlineMetrics {
  const totals = dates.reduce<DailyHeadlineMetrics>(
    (result, dateISO) => {
      const point = byDate.get(dateISO) ?? emptyPoint(dateISO);
      result.siteVisits += point.siteVisits;
      result.sitePageviews += point.sitePageviews;
      result.appointmentCreations += point.appointmentCreations;
      result.totalSessions += point.totalSessions;
      result.completedBookings += point.completedBookings;
      return result;
    },
    {
      siteVisits: 0,
      sitePageviews: 0,
      appointmentCreations: 0,
      totalSessions: 0,
      completedBookings: 0,
      conversionRate: 0,
    },
  );
  totals.conversionRate = conversionRate(
    totals.completedBookings,
    totals.totalSessions,
  );
  return totals;
}

export function summarizeDailyReportComparison(
  reportingDateISO: string,
  current: DailyHeadlineMetrics,
  baseline: DailyHeadlinePoint[],
): DailyReportComparison {
  const reportingDate = Temporal.PlainDate.from(reportingDateISO);
  const expectedDates = Array.from({ length: WEEK_DAYS }, (_, index) =>
    reportingDate.subtract({ days: WEEK_DAYS - index }).toString(),
  );
  const byDate = new Map(baseline.map((point) => [point.dateISO, point]));
  byDate.set(reportingDateISO, {
    dateISO: reportingDateISO,
    ...current,
  });
  const currentWeekDates = Array.from({ length: WEEK_DAYS }, (_, index) =>
    reportingDate.subtract({ days: WEEK_DAYS - 1 - index }).toString(),
  );
  const previousWeekDates = Array.from({ length: WEEK_DAYS }, (_, index) =>
    reportingDate.subtract({ days: WEEK_DAYS * 2 - 1 - index }).toString(),
  );
  const weeklyTotals = totalMetrics(expectedDates, byDate);
  const currentWeekTotals = totalMetrics(currentWeekDates, byDate);
  const previousWeekTotals = totalMetrics(previousWeekDates, byDate);

  const weeklyAverage: DailyHeadlineMetrics = {
    siteVisits: roundOne(weeklyTotals.siteVisits / WEEK_DAYS),
    sitePageviews: roundOne(weeklyTotals.sitePageviews / WEEK_DAYS),
    appointmentCreations: roundOne(weeklyTotals.appointmentCreations / WEEK_DAYS),
    totalSessions: roundOne(weeklyTotals.totalSessions / WEEK_DAYS),
    completedBookings: roundOne(weeklyTotals.completedBookings / WEEK_DAYS),
    conversionRate: weeklyTotals.conversionRate,
  };

  return {
    reportingDateISO,
    previousDateISO: expectedDates.at(-1)!,
    weeklyStartISO: expectedDates[0],
    weeklyEndISO: expectedDates.at(-1)!,
    currentWeekStartISO: currentWeekDates[0],
    currentWeekEndISO: currentWeekDates.at(-1)!,
    previousWeekStartISO: previousWeekDates[0],
    previousWeekEndISO: previousWeekDates.at(-1)!,
    current,
    previous: byDate.get(expectedDates.at(-1)!) ?? emptyPoint(expectedDates.at(-1)!),
    weeklyAverage,
    weeklyTotals,
    currentWeekTotals,
    previousWeekTotals,
  };
}

/**
 * Load the thirteen complete days before the reporting day with three
 * sequential range queries. Together with the already-built reporting day this
 * provides two comparable seven-day windows without rebuilding daily reports.
 */
export async function buildDailyReportComparison(
  summary: DailySummaryData,
): Promise<DailyReportComparison> {
  const { prisma } = await import('@/lib/prisma');
  const reportingDate = Temporal.PlainDate.from(summary.dateISO);
  const historyStartISO = reportingDate.subtract({ days: HISTORY_DAYS }).toString();
  const weeklyEndISO = reportingDate.subtract({ days: 1 }).toString();
  const { start: rangeStart } = orgDayRange(historyStartISO);
  const { end: rangeEnd } = orgDayRange(weeklyEndISO);
  const points = new Map<string, DailyHeadlinePoint>();

  for (let offset = HISTORY_DAYS; offset >= 1; offset -= 1) {
    const dateISO = reportingDate.subtract({ days: offset }).toString();
    points.set(dateISO, emptyPoint(dateISO));
  }

  const visitGroups = await prisma.siteVisit.groupBy({
    by: ['dateISO'],
    where: { dateISO: { gte: historyStartISO, lte: weeklyEndISO } },
    _count: { _all: true },
    _sum: { pageviews: true },
  });
  for (const group of visitGroups) {
    const point = points.get(group.dateISO);
    if (!point) continue;
    point.siteVisits = group._count._all;
    point.sitePageviews = group._sum.pageviews ?? 0;
  }

  const sessions = await prisma.aiChatSession.findMany({
    where: { startedAt: { gte: rangeStart, lt: rangeEnd } },
    select: { startedAt: true, bookingCompleted: true },
  });
  for (const session of sessions) {
    const point = points.get(localDateISO(session.startedAt));
    if (!point) continue;
    point.totalSessions += 1;
    if (session.bookingCompleted) point.completedBookings += 1;
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      createdAt: { gte: rangeStart, lt: rangeEnd },
      deletedAt: null,
    },
    select: { createdAt: true },
  });
  for (const appointment of appointments) {
    const point = points.get(localDateISO(appointment.createdAt));
    if (point) point.appointmentCreations += 1;
  }

  const baseline = Array.from(points.values()).map((point) => ({
    ...point,
    conversionRate: conversionRate(point.completedBookings, point.totalSessions),
  }));

  return summarizeDailyReportComparison(
    summary.dateISO,
    metricsFromSummary(summary),
    baseline,
  );
}
