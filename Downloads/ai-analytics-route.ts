// src/app/api/admin/ai-analytics/route.ts
//
// Admin endpoint for AI chat analytics.
// Usage:
//   GET /api/admin/ai-analytics?days=7
//   GET /api/admin/ai-analytics?from=2026-03-01&to=2026-03-04
//   GET /api/admin/ai-analytics?days=30&detail=true  (includes per-session list)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAnalyticsSummary } from '@/lib/ai/ai-analytics';

export async function GET(req: NextRequest) {
  // ── Auth: admin only ────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse params ────────────────────────────────────────
  const url = new URL(req.url);
  const daysParam = url.searchParams.get('days');
  const fromParam = url.searchParams.get('from');
  const toParam = url.searchParams.get('to');
  const wantDetail = url.searchParams.get('detail') === 'true';

  let from: Date;
  let to: Date;

  if (fromParam && toParam) {
    from = new Date(fromParam);
    to = new Date(toParam);
    // Set to end of day
    to.setHours(23, 59, 59, 999);
  } else {
    const days = parseInt(daysParam || '7', 10);
    to = new Date();
    from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  }

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }

  // ── Get summary ─────────────────────────────────────────
  const summary = await getAnalyticsSummary(from, to);

  // ── Optionally include per-session detail ───────────────
  let sessions: unknown[] | undefined;

  if (wantDetail) {
    const rows = await prisma.aiChatSession.findMany({
      where: {
        startedAt: { gte: from, lte: to },
      },
      orderBy: { startedAt: 'desc' },
      take: 200,
      select: {
        sessionId: true,
        locale: true,
        deviceType: true,
        messageCount: true,
        gptCallCount: true,
        fastPathCount: true,
        toolCallCount: true,
        errorCount: true,
        funnelStage: true,
        bookingCompleted: true,
        consultationUsed: true,
        consultationTopics: true,
        usedVoice: true,
        usedStreaming: true,
        durationSec: true,
        startedAt: true,
        endedAt: true,
      },
    });

    sessions = rows;
  }

  return NextResponse.json({
    period: { from: from.toISOString(), to: to.toISOString() },
    summary,
    ...(sessions ? { sessions } : {}),
  });
}
