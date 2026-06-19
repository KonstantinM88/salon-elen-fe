import { NextRequest, NextResponse } from 'next/server';
import { recordSiteVisit } from '@/lib/site-analytics';

export const dynamic = 'force-dynamic';

interface SiteVisitPayload {
  visitId?: unknown;
  path?: unknown;
  locale?: unknown;
  referrer?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
}

function isPublicTrackablePath(path: string): boolean {
  return (
    path.startsWith('/') &&
    !path.startsWith('/admin') &&
    !path.startsWith('/api') &&
    !path.startsWith('/_next') &&
    !path.startsWith('/favicon') &&
    !path.startsWith('/robots.txt') &&
    !path.startsWith('/sitemap')
  );
}

export async function POST(req: NextRequest) {
  let body: SiteVisitPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const visitId = typeof body.visitId === 'string' ? body.visitId : '';
  const path = typeof body.path === 'string' ? body.path : '';
  const locale = typeof body.locale === 'string' ? body.locale : undefined;
  const referrer = typeof body.referrer === 'string' ? body.referrer : undefined;
  const utmSource = typeof body.utmSource === 'string' ? body.utmSource : undefined;
  const utmMedium = typeof body.utmMedium === 'string' ? body.utmMedium : undefined;
  const utmCampaign = typeof body.utmCampaign === 'string' ? body.utmCampaign : undefined;

  if (!visitId || !isPublicTrackablePath(path)) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    null;

  try {
    await recordSiteVisit({
      visitId,
      path,
      locale,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      userAgent: req.headers.get('user-agent'),
      ip,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Site Visit] Failed to record visit:', error);
    return NextResponse.json({ ok: false, error: 'Failed to record visit' }, { status: 500 });
  }
}
