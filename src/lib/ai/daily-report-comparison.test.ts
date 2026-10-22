import assert from 'node:assert/strict';
import test from 'node:test';
import {
  summarizeDailyReportComparison,
  type DailyHeadlinePoint,
} from '@/lib/ai/daily-report-comparison';

test('daily comparison uses the previous seven complete days and fills missing days', () => {
  const baseline: DailyHeadlinePoint[] = [
    {
      dateISO: '2026-10-20',
      siteVisits: 14,
      sitePageviews: 28,
      appointmentCreations: 7,
      totalSessions: 10,
      completedBookings: 2,
      conversionRate: 20,
    },
  ];
  const comparison = summarizeDailyReportComparison(
    '2026-10-21',
    {
      siteVisits: 21,
      sitePageviews: 42,
      appointmentCreations: 3,
      totalSessions: 5,
      completedBookings: 1,
      conversionRate: 20,
    },
    baseline,
  );

  assert.equal(comparison.weeklyStartISO, '2026-10-14');
  assert.equal(comparison.weeklyEndISO, '2026-10-20');
  assert.equal(comparison.previous.siteVisits, 14);
  assert.equal(comparison.weeklyAverage.siteVisits, 2);
  assert.equal(comparison.weeklyTotals.sitePageviews, 28);
  assert.equal(comparison.weeklyTotals.conversionRate, 20);
  assert.equal(comparison.currentWeekStartISO, '2026-10-15');
  assert.equal(comparison.currentWeekEndISO, '2026-10-21');
  assert.equal(comparison.previousWeekStartISO, '2026-10-08');
  assert.equal(comparison.previousWeekEndISO, '2026-10-14');
  assert.equal(comparison.currentWeekTotals.siteVisits, 35);
  assert.equal(comparison.previousWeekTotals.siteVisits, 0);
});
