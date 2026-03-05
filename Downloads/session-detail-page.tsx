// src/app/admin/ai/session/[sessionId]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionReplay } from '@/lib/ai/turn-tracker';
import { resolveContentLocale } from '@/lib/seo-locale-server';
import SessionReplayClient from '../../_components/SessionReplayClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const { sessionId } = await params;
  const locale = await resolveContentLocale();

  // Fetch session
  const session = await prisma.aiChatSession.findUnique({
    where: { sessionId },
  });

  if (!session) notFound();

  // Fetch turns with tool runs
  const turns = await getSessionReplay(sessionId);

  const sessionData = {
    id: session.id,
    sessionId: session.sessionId,
    locale: session.locale,
    deviceType: session.deviceType,
    userAgent: session.userAgent,
    messageCount: session.messageCount,
    gptCallCount: session.gptCallCount,
    fastPathCount: session.fastPathCount,
    toolCallCount: session.toolCallCount,
    toolTotalMs: session.toolTotalMs,
    errorCount: session.errorCount,
    retryCount: session.retryCount,
    funnelStage: session.funnelStage,
    bookingCompleted: session.bookingCompleted,
    consultationUsed: session.consultationUsed,
    consultationTopics: session.consultationTopics,
    usedVoice: session.usedVoice,
    usedStreaming: session.usedStreaming,
    durationSec: session.durationSec,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt.toISOString(),
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <SessionReplayClient session={sessionData} turns={turns} locale={locale} />
    </div>
  );
}
