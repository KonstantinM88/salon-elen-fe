import sharp from 'sharp';
import type {
  DailyHeadlineMetrics,
  DailyReportComparison,
} from '@/lib/ai/daily-report-comparison';

const WIDTH = 1080;
const HEIGHT = 2040;
const numberFormat = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
});

interface ChartMetric {
  label: string;
  key: keyof DailyHeadlineMetrics;
  percent?: boolean;
}

const CHART_METRICS: ChartMetric[] = [
  { label: 'Посещения сайта', key: 'siteVisits' },
  { label: 'Просмотры страниц', key: 'sitePageviews' },
  { label: 'Новые записи', key: 'appointmentCreations' },
  { label: 'AI-сессии', key: 'totalSessions' },
  { label: 'Записи через AI', key: 'completedBookings' },
  { label: 'Конверсия AI', key: 'conversionRate', percent: true },
];

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character]!);
}

function displayDate(dateISO: string): string {
  const [year, month, day] = dateISO.split('-');
  return `${day}.${month}.${year}`;
}

function displayValue(value: number, percent = false): string {
  return `${numberFormat.format(value)}${percent ? '%' : ''}`;
}

function deltaLabel(
  current: number,
  previous: number,
  percent = false,
  context = 'к пред. дню',
): string {
  if (percent) {
    const delta = Math.round((current - previous) * 10) / 10;
    if (delta === 0) return 'без изменений';
    return `${delta > 0 ? '+' : ''}${numberFormat.format(delta)} п.п.`;
  }
  if (previous === 0) return current === 0 ? 'без изменений' : 'рост с 0';
  const delta = Math.round(((current - previous) / previous) * 100);
  if (delta === 0) return 'без изменений';
  return `${delta > 0 ? '+' : ''}${delta}% ${context}`;
}

function barWidth(value: number, max: number): number {
  if (value <= 0 || max <= 0) return 0;
  return Math.max(8, Math.round((value / max) * 650));
}

function chartRow(
  label: string,
  value: number,
  max: number,
  y: number,
  color: string,
  displayText: string,
): string {
  return `
    <text x="70" y="${y + 16}" class="row-label">${escapeXml(label)}</text>
    <rect x="220" y="${y}" width="650" height="20" rx="10" fill="#eadfe2"/>
    <rect x="220" y="${y}" width="${barWidth(value, max)}" height="20" rx="10" fill="${color}"/>
    <text x="1010" y="${y + 17}" class="row-value" text-anchor="end">${escapeXml(displayText)}</text>`;
}

function metricGroup(
  metric: ChartMetric,
  comparison: DailyReportComparison,
  index: number,
): string {
  const weekly = comparison.weeklyAverage[metric.key];
  const weeklyTotal = comparison.weeklyTotals[metric.key];
  const previous = comparison.previous[metric.key];
  const current = comparison.current[metric.key];
  const max = Math.max(weekly, previous, current, 1);
  const top = 270 + index * 155;
  const weeklyDisplay = metric.percent
    ? displayValue(weekly, true)
    : `${displayValue(weekly)} · Σ ${displayValue(weeklyTotal)}`;

  return `
    <g>
      <line x1="70" x2="1010" y1="${top - 24}" y2="${top - 24}" stroke="#e7d7db" stroke-width="2"/>
      <text x="70" y="${top}" class="metric-title">${escapeXml(metric.label)}</text>
      <text x="1010" y="${top}" class="metric-delta" text-anchor="end">${escapeXml(deltaLabel(current, previous, metric.percent))}</text>
      ${chartRow('Среднее/день', weekly, max, top + 20, '#9d7684', weeklyDisplay)}
      ${chartRow('Пред. день', previous, max, top + 54, '#d7a56d', displayValue(previous, Boolean(metric.percent)))}
      ${chartRow('Отчёт', current, max, top + 88, '#b12d5b', displayValue(current, Boolean(metric.percent)))}
    </g>`;
}

function weeklyChartRow(
  label: string,
  value: number,
  max: number,
  y: number,
  color: string,
  displayText: string,
): string {
  return `
    <text x="70" y="${y + 14}" class="week-row-label">${escapeXml(label)}</text>
    <rect x="250" y="${y}" width="620" height="17" rx="8.5" fill="#eadfe2"/>
    <rect x="250" y="${y}" width="${value <= 0 ? 0 : Math.max(8, Math.round((value / Math.max(max, 1)) * 620))}" height="17" rx="8.5" fill="${color}"/>
    <text x="1010" y="${y + 15}" class="week-row-value" text-anchor="end">${escapeXml(displayText)}</text>`;
}

function weeklyMetricGroup(
  metric: ChartMetric,
  comparison: DailyReportComparison,
  index: number,
): string {
  const previous = comparison.previousWeekTotals[metric.key];
  const current = comparison.currentWeekTotals[metric.key];
  const max = Math.max(previous, current, 1);
  const top = 1385 + index * 92;

  return `
    <g>
      <text x="70" y="${top}" class="week-metric-title">${escapeXml(metric.label)}</text>
      <text x="1010" y="${top}" class="week-metric-delta" text-anchor="end">${escapeXml(deltaLabel(current, previous, metric.percent, 'к прошлой нед.'))}</text>
      ${weeklyChartRow('Прошлые 7 дней', previous, max, top + 28, '#d7a56d', displayValue(previous, Boolean(metric.percent)))}
      ${weeklyChartRow('Текущие 7 дней', current, max, top + 57, '#b12d5b', displayValue(current, Boolean(metric.percent)))}
    </g>`;
}

export function buildDailyReportChartSvg(comparison: DailyReportComparison): string {
  const period = `${displayDate(comparison.weeklyStartISO)}–${displayDate(comparison.weeklyEndISO)}`;
  const groups = CHART_METRICS.map((metric, index) =>
    metricGroup(metric, comparison, index),
  ).join('');
  const weeklyGroups = CHART_METRICS.map((metric, index) =>
    weeklyMetricGroup(metric, comparison, index),
  ).join('');
  const currentWeekPeriod = `${displayDate(comparison.currentWeekStartISO)}–${displayDate(comparison.currentWeekEndISO)}`;
  const previousWeekPeriod = `${displayDate(comparison.previousWeekStartISO)}–${displayDate(comparison.previousWeekEndISO)}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img">
    <title>Основные показатели Salon Elen</title>
    <desc>Сравнение отчётного дня, предыдущего дня и среднего за семь полных дней.</desc>
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff9f8"/>
        <stop offset="1" stop-color="#f4e7ea"/>
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#b12d5b"/>
        <stop offset="1" stop-color="#ef6f91"/>
      </linearGradient>
      <style>
        text { font-family: "DejaVu Sans", Arial, sans-serif; fill: #332329; }
        .eyebrow { font-size: 22px; font-weight: 700; letter-spacing: 4px; fill: #9a5369; }
        .title { font-size: 54px; font-weight: 700; }
        .period { font-size: 24px; fill: #765f67; }
        .legend { font-size: 20px; fill: #66545b; }
        .metric-title { font-size: 28px; font-weight: 700; }
        .metric-delta { font-size: 20px; font-weight: 700; fill: #b12d5b; }
        .row-label { font-size: 20px; fill: #76636a; }
        .row-value { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .section-title { font-size: 34px; font-weight: 700; }
        .section-period { font-size: 20px; fill: #765f67; }
        .week-metric-title { font-size: 22px; font-weight: 700; }
        .week-metric-delta { font-size: 18px; font-weight: 700; fill: #b12d5b; }
        .week-row-label { font-size: 18px; fill: #76636a; }
        .week-row-value { font-size: 19px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .footer { font-size: 20px; fill: #765f67; }
      </style>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#background)"/>
    <rect x="0" y="0" width="1080" height="14" fill="url(#accent)"/>
    <text x="70" y="70" class="eyebrow">SALON ELEN · ДНЕВНОЙ ОТЧЁТ</text>
    <text x="70" y="132" class="title">Основные показатели</text>
    <text x="70" y="178" class="period">Отчётный день ${escapeXml(displayDate(comparison.reportingDateISO))} · неделя ${escapeXml(period)}</text>
    <circle cx="78" cy="220" r="8" fill="#9d7684"/><text x="98" y="227" class="legend">Среднее/день</text>
    <circle cx="330" cy="220" r="8" fill="#d7a56d"/><text x="350" y="227" class="legend">Предыдущий день</text>
    <circle cx="625" cy="220" r="8" fill="#b12d5b"/><text x="645" y="227" class="legend">Отчётный день</text>
    ${groups}
    <text x="70" y="1188" class="footer">Σ — итог за 7 дней · столбец показывает среднее/день</text>
    <line x1="70" x2="1010" y1="1218" y2="1218" stroke="#d9c4ca" stroke-width="3"/>
    <text x="70" y="1260" class="section-title">Сравнение двух недель</text>
    <text x="70" y="1298" class="section-period">Текущие 7 дней: ${escapeXml(currentWeekPeriod)} · предыдущие: ${escapeXml(previousWeekPeriod)}</text>
    <circle cx="78" cy="1338" r="7" fill="#d7a56d"/><text x="98" y="1345" class="legend">Предыдущие 7 дней</text>
    <circle cx="390" cy="1338" r="7" fill="#b12d5b"/><text x="410" y="1345" class="legend">Текущие 7 дней</text>
    ${weeklyGroups}
    <text x="70" y="1995" class="footer">Оба периода содержат ровно 7 завершённых дней · персональные данные не используются</text>
  </svg>`;
}

export async function renderDailyReportChart(
  comparison: DailyReportComparison,
): Promise<Buffer> {
  return sharp(Buffer.from(buildDailyReportChartSvg(comparison)))
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

export function formatDailyReportChartCaption(
  comparison: DailyReportComparison,
): string {
  const totals = comparison.weeklyTotals;
  const currentWeek = comparison.currentWeekTotals;
  const previousWeek = comparison.previousWeekTotals;
  return [
    `📊 Основные показатели за ${displayDate(comparison.reportingDateISO)}`,
    `Среднее/день рассчитано за ${displayDate(comparison.weeklyStartISO)}–${displayDate(comparison.weeklyEndISO)}:`,
    `🌐 ${numberFormat.format(totals.siteVisits)} посещений · 📄 ${numberFormat.format(totals.sitePageviews)} просмотров`,
    `📅 ${numberFormat.format(totals.appointmentCreations)} записей · 🤖 ${numberFormat.format(totals.completedBookings)} через AI`,
    '',
    `Текущие 7 дней: ${numberFormat.format(currentWeek.siteVisits)} посещений · ${numberFormat.format(currentWeek.appointmentCreations)} записей`,
    `Предыдущие 7 дней: ${numberFormat.format(previousWeek.siteVisits)} посещений · ${numberFormat.format(previousWeek.appointmentCreations)} записей`,
  ].join('\n');
}
