import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
import {
  buildDailyReportChartSvg,
  renderDailyReportChart,
} from '@/lib/ai/daily-report-chart';
import type { DailyReportComparison } from '@/lib/ai/daily-report-comparison';

const comparison: DailyReportComparison = {
  reportingDateISO: '2026-10-21',
  previousDateISO: '2026-10-20',
  weeklyStartISO: '2026-10-14',
  weeklyEndISO: '2026-10-20',
  currentWeekStartISO: '2026-10-15',
  currentWeekEndISO: '2026-10-21',
  previousWeekStartISO: '2026-10-08',
  previousWeekEndISO: '2026-10-14',
  current: {
    siteVisits: 21,
    sitePageviews: 42,
    appointmentCreations: 3,
    totalSessions: 5,
    completedBookings: 1,
    conversionRate: 20,
  },
  previous: {
    siteVisits: 14,
    sitePageviews: 28,
    appointmentCreations: 2,
    totalSessions: 4,
    completedBookings: 1,
    conversionRate: 25,
  },
  weeklyAverage: {
    siteVisits: 12.4,
    sitePageviews: 25.7,
    appointmentCreations: 1.7,
    totalSessions: 3.1,
    completedBookings: 0.6,
    conversionRate: 18.2,
  },
  weeklyTotals: {
    siteVisits: 87,
    sitePageviews: 180,
    appointmentCreations: 12,
    totalSessions: 22,
    completedBookings: 4,
    conversionRate: 18.2,
  },
  currentWeekTotals: {
    siteVisits: 92,
    sitePageviews: 194,
    appointmentCreations: 13,
    totalSessions: 24,
    completedBookings: 5,
    conversionRate: 20.8,
  },
  previousWeekTotals: {
    siteVisits: 70,
    sitePageviews: 150,
    appointmentCreations: 9,
    totalSessions: 18,
    completedBookings: 3,
    conversionRate: 16.7,
  },
};

test('daily report chart contains all comparison periods', () => {
  const svg = buildDailyReportChartSvg(comparison);
  assert.match(svg, /Среднее\/день/);
  assert.match(svg, /12,4 · Σ 87/);
  assert.match(svg, /Предыдущий день/);
  assert.match(svg, /Отчётный день/);
  assert.match(svg, /21\.10\.2026/);
  assert.match(svg, /Сравнение двух недель/);
  assert.match(svg, /15\.10\.2026–21\.10\.2026/);
  assert.match(svg, /08\.10\.2026–14\.10\.2026/);
  assert.match(svg, /rect width="1080" height="2040" fill="url\(#background\)"/);
});

test('daily report chart renders to a Telegram-ready PNG', async () => {
  const png = await renderDailyReportChart(comparison);
  const metadata = await sharp(png).metadata();
  assert.equal(metadata.format, 'png');
  assert.equal(metadata.width, 1080);
  assert.equal(metadata.height, 2040);
});
