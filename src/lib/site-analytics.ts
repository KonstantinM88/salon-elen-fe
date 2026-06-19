import { prisma } from '@/lib/prisma';
import { ORG_TZ } from '@/lib/orgTime';

export interface RecordSiteVisitInput {
  visitId: string;
  path: string;
  locale?: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  userAgent?: string | null;
  ip?: string | null;
}

export interface TrafficSourceSummary {
  source: string;
  label: string;
  visits: number;
  pageviews: number;
}

export interface SiteVisitSummary {
  siteVisits: number;
  sitePageviews: number;
  aiReferrals: number;
  aiTrafficSources: TrafficSourceSummary[];
  trafficSources: TrafficSourceSummary[];
}

const AI_TRAFFIC_SOURCES = new Set(['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot']);

const TRAFFIC_SOURCE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  claude: 'Claude',
  gemini: 'Gemini',
  copilot: 'Microsoft Copilot',
  google: 'Google',
  bing: 'Bing',
  instagram: 'Instagram',
  facebook: 'Facebook',
  social: 'Social',
  referral: 'Referral',
  direct: 'Direct',
};

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

function sanitizeCampaignValue(value: string | null | undefined, max: number): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/[\u0000-\u001f\u007f]/gu, '').slice(0, max) || null;
}

function sourceFromValue(value: string): string | null {
  const normalized = value.toLowerCase();
  if (normalized.includes('chatgpt') || normalized.includes('openai')) return 'chatgpt';
  if (normalized.includes('perplexity')) return 'perplexity';
  if (normalized.includes('claude') || normalized.includes('anthropic')) return 'claude';
  if (normalized.includes('gemini')) return 'gemini';
  if (normalized.includes('copilot')) return 'copilot';
  if (normalized.includes('google')) return 'google';
  if (normalized.includes('bing')) return 'bing';
  if (normalized.includes('instagram')) return 'instagram';
  if (normalized.includes('facebook') || normalized.includes('fb.')) return 'facebook';
  return null;
}

export function classifyTrafficSource(referrer?: string | null, utmSource?: string | null): string {
  const utmMatch = utmSource ? sourceFromValue(utmSource) : null;
  if (utmMatch) return utmMatch;
  if (utmSource?.trim()) return 'campaign';

  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host === 'permanent-halle.de' || host.endsWith('.permanent-halle.de')) return 'direct';
    return sourceFromValue(host) ?? 'referral';
  } catch {
    return sourceFromValue(referrer) ?? 'referral';
  }
}

export async function recordSiteVisit(input: RecordSiteVisitInput): Promise<void> {
  const visitId = sanitizeVisitId(input.visitId);
  if (!visitId) return;

  const dateISO = orgDateISO();
  const path = sanitizePath(input.path);
  const userAgent = truncate(input.userAgent, 512);
  const referrer = truncate(input.referrer, 512);
  const utmSource = sanitizeCampaignValue(input.utmSource, 120);
  const utmMedium = sanitizeCampaignValue(input.utmMedium, 120);
  const utmCampaign = sanitizeCampaignValue(input.utmCampaign, 160);
  const trafficSource = classifyTrafficSource(referrer, utmSource);

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
      referrer,
      trafficSource,
      utmSource,
      utmMedium,
      utmCampaign,
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
      trafficSource,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    },
  });
}

export async function getSiteVisitSummary(dateISO: string): Promise<SiteVisitSummary> {
  const [siteVisits, pageviewAggregate, sourceGroups] = await Promise.all([
    prisma.siteVisit.count({ where: { dateISO } }),
    prisma.siteVisit.aggregate({
      where: { dateISO },
      _sum: { pageviews: true },
    }),
    prisma.siteVisit.groupBy({
      by: ['trafficSource'],
      where: { dateISO },
      _count: { _all: true },
      _sum: { pageviews: true },
      orderBy: { _count: { trafficSource: 'desc' } },
    }),
  ]);

  const trafficSources = sourceGroups.map((group) => ({
    source: group.trafficSource,
    label: TRAFFIC_SOURCE_LABELS[group.trafficSource] ?? group.trafficSource,
    visits: group._count._all,
    pageviews: group._sum.pageviews ?? 0,
  }));
  const aiTrafficSources = trafficSources.filter((item) => AI_TRAFFIC_SOURCES.has(item.source));

  return {
    siteVisits,
    sitePageviews: pageviewAggregate._sum.pageviews ?? 0,
    aiReferrals: aiTrafficSources.reduce((total, item) => total + item.visits, 0),
    aiTrafficSources,
    trafficSources,
  };
}
