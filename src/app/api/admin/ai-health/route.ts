// src/app/api/admin/ai-health/route.ts
//
// Endpoints:
//   GET /api/admin/ai-health              → real-time health status (for widget)
//   POST /api/admin/ai-health?action=daily  → trigger daily summary to Telegram
//   POST /api/admin/ai-health?action=alert  → optional error-rate check
//
// Daily summary can be triggered by:
//   1. External cron (Vercel Cron, GitHub Actions, curl)
//   2. Manual click in admin dashboard
//
// Cron setup (crontab or Vercel):
//   0 8 * * * curl -X POST https://permanent-halle.de/api/admin/ai-health?action=daily -H "Authorization: Bearer $CRON_SECRET"
// Frequent alert polling is disabled by default because it prevents a
// scale-to-zero database from remaining suspended.

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAiHealthStatus,
  sendDailySummaryToTelegram,
  checkAndAlertErrors,
  resolveDailySummaryDateParam,
} from '@/lib/ai/ai-health';

// ─── Auth helper ────────────────────────────────────────────

async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Check stateless cron credentials before resolving a browser session.
  const cronSecret = process.env.CRON_SECRET || process.env.AI_CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth === `Bearer ${cronSecret}`) {
      return true;
    }
  }

  // Vercel Cron header
  const vercelCron = req.headers.get('x-vercel-cron');
  if (vercelCron && process.env.VERCEL) {
    return true;
  }

  // Admin session (from browser)
  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as { role?: string }).role === 'ADMIN') {
    return true;
  }

  return false;
}

function areRealtimeAlertsEnabled(): boolean {
  return /^(1|true|yes)$/i.test(
    process.env.AI_HEALTH_REALTIME_ALERTS_ENABLED?.trim() || '',
  );
}

// ─── GET: Health status ─────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const health = await getAiHealthStatus();
    return NextResponse.json(health);
  } catch (err) {
    console.error('[AI Health API] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to get health status' },
      { status: 500 },
    );
  }
}

// ─── POST: Actions ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'daily': {
      let dateISO: string | undefined;
      try {
        dateISO = resolveDailySummaryDateParam(url.searchParams.get('date'));
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'Invalid date param' },
          { status: 400 },
        );
      }

      const sent = await sendDailySummaryToTelegram(dateISO);
      return NextResponse.json({
        ok: sent,
        action: 'daily_summary',
        date: dateISO ?? 'yesterday',
        message: sent ? 'Daily summary sent to Telegram' : 'Failed to send',
      });
    }

    case 'alert': {
      if (!areRealtimeAlertsEnabled()) {
        return NextResponse.json({
          ok: true,
          action: 'error_alert_check',
          alerted: false,
          skipped: true,
          message: 'Realtime DB alert checks are disabled',
        });
      }

      const alerted = await checkAndAlertErrors();
      return NextResponse.json({
        ok: true,
        action: 'error_alert_check',
        alerted,
        message: alerted ? 'Alert sent' : 'No alert needed',
      });
    }

    default:
      return NextResponse.json(
        { error: `Unknown action: ${action}. Use ?action=daily or ?action=alert` },
        { status: 400 },
      );
  }
}
