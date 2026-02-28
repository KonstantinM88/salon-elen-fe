// src/lib/ai/missing-service-report.ts
// Persist and notify when AI could not match a requested service.

import { prisma } from '@/lib/prisma';
import { sendAdminMissingServiceNotification } from '@/lib/send-admin-notification';

interface AlternativeItem {
  title: string;
  groupTitle?: string | null;
  durationMin?: number | null;
  priceCents?: number | null;
}

interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  at?: string;
}

interface ReportMissingServiceArgs {
  sessionId: string;
  locale: string;
  query: string;
  transcript: SessionMessage[];
  alternatives?: AlternativeItem[];
}

function compactText(value: string, max = 1000): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

export async function reportMissingServiceInquiry(
  args: ReportMissingServiceArgs,
): Promise<{ ok: true; logId: string } | { ok: false; error: string }> {
  const query = compactText(args.query, 300);
  if (!query) return { ok: false, error: 'EMPTY_QUERY' };

  const transcript = (args.transcript ?? []).slice(-20).map((m) => ({
    role: m.role,
    content: compactText(m.content, 800),
    at: m.at ?? new Date().toISOString(),
  }));

  const alternatives = (args.alternatives ?? []).slice(0, 12).map((a) => ({
    title: compactText(a.title, 120),
    groupTitle: a.groupTitle ? compactText(a.groupTitle, 120) : null,
    durationMin: typeof a.durationMin === 'number' ? a.durationMin : null,
    priceCents: typeof a.priceCents === 'number' ? a.priceCents : null,
  }));

  try {
    const created = await prisma.booking.create({
      data: {
        name: 'AI Missing Service',
        phone: `AI-${args.sessionId.slice(0, 20)}`,
        email: null,
        message: JSON.stringify(
          {
            type: 'ai_missing_service',
            createdAt: new Date().toISOString(),
            sessionId: args.sessionId,
            locale: args.locale,
            query,
            alternatives,
            transcript,
          },
          null,
          2,
        ),
      },
      select: { id: true },
    });

    await sendAdminMissingServiceNotification({
      sessionId: args.sessionId,
      locale: args.locale,
      query,
      bookingLogId: created.id,
      alternatives,
      transcript,
    });

    return { ok: true, logId: created.id };
  } catch (error) {
    console.error('[AI Missing Service] Failed to persist/report:', error);
    return { ok: false, error: 'PERSIST_FAILED' };
  }
}
