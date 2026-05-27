import { prisma } from '@/lib/prisma';
import { ORG_TZ } from '@/lib/orgTime';

export interface RecordSiteVisitInput {
  visitId: string;
  path: string;
  locale?: string;
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
}

export interface SiteVisitSummary {
  siteVisits: number;
  sitePageviews: number;
}

function orgDateISO(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ORG_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function detectDeviceType(ua?: string | null): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  if (!ua) return 'unknown';
  const lower = ua.toLowerCase();

  if (lower.includes('ipad') || (lower.includes('android') && !lower.includes('mobile'))) {
    return 'tablet';
  }
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

function anonymizeIp(ip?: string | null): string | null {
  if (!ip || ip === 'unknown') return null;

  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
  }

  if (ip.includes(':')) {
    const parts = ip.split(':');
    return `${parts.slice(0, 3).join(':')}::`;
  }

  return null;
}

function sanitizeVisitId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.:-]/g, '').slice(0, 128);
}

function sanitizePath(value: string): string {
  const path = value.trim();
  if (!path.startsWith('/')) return '/';
  return path.split(/[?#]/u)[0].slice(0, 512) || '/';
}

function sanitizeLocale(value?: string): string | undefined {
  return value && ['de', 'en', 'ru'].includes(value) ? value : undefined;
}

function truncate(value: string | null | undefined, max: number): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function recordSiteVisit(input: RecordSiteVisitInput): Promise<void> {
  const visitId = sanitizeVisitId(input.visitId);
  if (!visitId) return;

  const dateISO = orgDateISO();
  const path = sanitizePath(input.path);
  const userAgent = truncate(input.userAgent, 512);

  await prisma.siteVisit.upsert({
    where: {
      visitId_dateISO: {
        visitId,
        dateISO,
      },
    },
    create: {
      visitId,
      dateISO,
      entryPath: path,
      lastPath: path,
      referrer: truncate(input.referrer, 512),
      locale: sanitizeLocale(input.locale),
      userAgent,
      deviceType: detectDeviceType(userAgent),
      ipAnon: anonymizeIp(input.ip),
      pageviews: 1,
    },
    update: {
      lastPath: path,
      pageviews: { increment: 1 },
      locale: sanitizeLocale(input.locale),
    },
  });
}

export async function getSiteVisitSummary(dateISO: string): Promise<SiteVisitSummary> {
  const [siteVisits, pageviewAggregate] = await Promise.all([
    prisma.siteVisit.count({ where: { dateISO } }),
    prisma.siteVisit.aggregate({
      where: { dateISO },
      _sum: { pageviews: true },
    }),
  ]);

  return {
    siteVisits,
    sitePageviews: pageviewAggregate._sum.pageviews ?? 0,
  };
}
