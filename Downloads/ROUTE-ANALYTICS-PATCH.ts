// ═══════════════════════════════════════════════════════════════
// ANALYTICS INTEGRATION PATCH
// ═══════════════════════════════════════════════════════════════
//
// How to integrate ai-analytics.ts into the existing codebase.
//
// ═══════════════════════════════════════════════════════════════


// ─── CHANGE 1: Import in route.ts (top of file) ────────────

/*
import {
  initSessionAnalytics,
  trackRequestMetrics,
  detectFunnelStage,
  type RequestMetrics,
} from '@/lib/ai/ai-analytics';
*/


// ─── CHANGE 2: Init session analytics (after session upsert) ─
//
// In the POST handler, after upsertSession is first called and
// the session is established (~line 2340-2360), add:

/*
  // Initialize analytics on first request
  const isNewSession = !getSession(sessionId);

  // ... existing upsertSession call ...

  // After session is created/updated:
  if (isNewSession || !session.context.chatHistory?.length) {
    initSessionAnalytics({
      sessionId,
      locale: session.locale,
      userAgent: req.headers.get('user-agent') || undefined,
      ip,
      referrer: req.headers.get('referer') || undefined,
    });
  }
*/


// ─── CHANGE 3: Track fast-path responses ────────────────────
//
// At EACH fast-path return point (NextResponse.json), add
// tracking before the return. Example pattern:

/*
  // Before: return NextResponse.json({ text, sessionId, ... });
  // After:
  trackRequestMetrics(sessionId, {
    isFastPath: true,
    funnelStage: detectFunnelStage(session.context),
    consultationUsed: session.context.consultationMode,
    consultationTopic: session.context.consultationTopic,
  });
  return NextResponse.json({ text, sessionId, ... });
*/

// IMPORTANT: There are ~30+ fast-path return points in route.ts.
// The simplest approach is a helper function:

/*
  function returnFastPath(
    response: ChatResponse,
    extraMetrics?: Partial<RequestMetrics>,
  ): NextResponse<ChatResponse> {
    trackRequestMetrics(sessionId, {
      isFastPath: true,
      funnelStage: detectFunnelStage(session.context),
      consultationUsed: session.context.consultationMode,
      consultationTopic: session.context.consultationTopic,
      ...extraMetrics,
    });
    return NextResponse.json(response);
  }

  // Then replace all fast-path returns:
  // Before: return NextResponse.json({ text, sessionId });
  // After:  return returnFastPath({ text, sessionId });
*/


// ─── CHANGE 4: Track GPT responses (non-streaming) ─────────
//
// At the end of the non-streaming GPT section, before the
// final return NextResponse.json (line ~4566):

/*
  trackRequestMetrics(sessionId, {
    isGptCall: true,
    toolCalls: toolCallLog,
    funnelStage: detectFunnelStage(session.context),
    bookingCompleted: bookingCompletedDuringSession,
    appointmentId: bookingCompletedDuringSession
      ? session.context.draftId
      : undefined,
    consultationUsed: session.context.consultationMode,
    consultationTopic: session.context.consultationTopic,
  });

  return NextResponse.json({
    text,
    sessionId,
    toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
    inputMode: finalInputMode,
  });
*/


// ─── CHANGE 5: Track GPT responses (SSE streaming) ─────────
//
// In the SSE streaming function, before sse.sendMeta():

/*
  trackRequestMetrics(sessionId, {
    isGptCall: true,
    isStreaming: true,
    toolCalls: toolCallLog,
    funnelStage: detectFunnelStage(session.context),
    bookingCompleted: bookingCompletedDuringSession,
    consultationUsed: session.context.consultationMode,
    consultationTopic: session.context.consultationTopic,
  });

  sse.sendMeta({ ... });
*/


// ─── CHANGE 6: Track errors ────────────────────────────────
//
// In the catch block (both JSON and SSE paths):

/*
  trackRequestMetrics(sessionId, {
    isGptCall: true,
    isStreaming: useSSE,
    error: true,
    retried: true, // if retry was attempted
    toolCalls: toolCallLog,
    funnelStage: detectFunnelStage(session.context),
  });
*/


// ─── CHANGE 7: Track voice requests ────────────────────────
//
// In voice/route.ts, after the internal chat call succeeds,
// OR pass isVoice flag through the chat request:

/*
  // Option A: In route.ts, detect voice from inputMode
  trackRequestMetrics(sessionId, {
    isGptCall: true,
    isVoice: isVoiceTurn,
    // ... other metrics
  });
*/


// ─── CHANGE 8: Finalize on session expiry ──────────────────
//
// In session-store.ts, in the cleanup interval that removes
// expired sessions (~line 239), call finalize:

/*
  // In the setInterval cleanup:
  import { finalizeSessionAnalytics } from '@/lib/ai/ai-analytics';

  // When deleting expired session:
  if (Date.now() - session.lastActiveAt.getTime() > SESSION_TTL_MS) {
    finalizeSessionAnalytics(sessionId);
    sessions.delete(sessionId);
  }
*/


// ─── CHANGE 9: Track booking completion ────────────────────
//
// In the complete_booking tool result processing, when
// bookingCompletedDuringSession is set to true, extract
// the appointmentId from the tool result:

/*
  if (fnName === 'complete_booking' && toolResult?.status === 'ok') {
    bookingCompletedDuringSession = true;
    // Extract appointmentId if available
    completedAppointmentId = toolResult.appointmentId || session.context.draftId;
  }
*/


// ═══════════════════════════════════════════════════════════════
// DEPLOYMENT STEPS:
//
// 1. Add AiChatSession model to prisma/schema.prisma
//    (see PRISMA-AI-ANALYTICS.ts)
//
// 2. Run migration:
//    npx prisma migrate dev --name add_ai_chat_session
//    npx prisma generate
//
// 3. Copy ai-analytics.ts to src/lib/ai/ai-analytics.ts
//
// 4. Apply integration changes to:
//    - src/app/api/ai/chat/route.ts (Changes 1-7, 9)
//    - src/lib/ai/session-store.ts (Change 8)
//
// 5. Test:
//    - Send a few messages, check ai_chat_session table
//    - Complete a booking, verify bookingCompleted=true
//    - Check funnel stage progression
//
// 6. Verify with:
//    SELECT locale, device_type, funnel_stage, booking_completed,
//           message_count, duration_sec
//    FROM ai_chat_session
//    ORDER BY created_at DESC
//    LIMIT 20;
//
// ═══════════════════════════════════════════════════════════════
//
// OPTIONAL: Admin API endpoint for analytics dashboard
//
// Create src/app/api/admin/ai-analytics/route.ts:
//
// import { getAnalyticsSummary } from '@/lib/ai/ai-analytics';
//
// export async function GET(req: NextRequest) {
//   // Auth check...
//   const url = new URL(req.url);
//   const days = parseInt(url.searchParams.get('days') || '7', 10);
//   const to = new Date();
//   const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
//
//   const summary = await getAnalyticsSummary(from, to);
//   return NextResponse.json(summary);
// }
//
// This gives you:
// GET /api/admin/ai-analytics?days=7
// → { totalSessions: 142, completedBookings: 23, conversionRate: 16.2, ... }
//
// ═══════════════════════════════════════════════════════════════
