// ═══════════════════════════════════════════════════════════════
// ROUTE.TS — TURN TRACKING PATCH
// ═══════════════════════════════════════════════════════════════
//
// Integrates TurnBuilder into the request lifecycle.
// One TurnBuilder per request — accumulates data, saves at end.
//
// ═══════════════════════════════════════════════════════════════

// ─── CHANGE 1: Add import ───────────────────────────────────

/*
import { TurnBuilder } from '@/lib/ai/turn-tracker';
import { detectFunnelStage } from '@/lib/ai/ai-analytics';
*/


// ─── CHANGE 2: Create TurnBuilder at request start ──────────
//
// After body parsing and session creation (~line 2347),
// right after `appendSessionMessage(sessionId, 'user', message)`:

/*
  const turn = new TurnBuilder(sessionId, message, inputMode);
*/


// ─── CHANGE 3: Tag fast-path returns ────────────────────────
//
// At EACH fast-path return, before the return statement, add:
//
// Pattern:

/*
  // Example for catalog selection fast-path:
  turn
    .setFastPath('catalog-selection')
    .setAssistantMessage(text)
    .setFunnelStage(detectFunnelStage(session.context))
    .save();
  return NextResponse.json({ text, sessionId, ... });
*/

// Named fast-paths (use these names for fastPathName):
//
// - 'scope-guard'           — off-topic blocked
// - 'booking-start'         — new booking intent detected
// - 'full-catalog'          — full service list requested
// - 'nearest-date'          — nearest available date
// - 'tomorrow'              — tomorrow availability
// - 'explicit-date'         — DD.MM date input
// - 'suggested-date'        — picked a suggested date
// - 'catalog-selection'     — service/master selected from catalog
// - 'master-picked'         — master selected
// - 'registration-method'   — Google/Telegram/SMS/Email choice
// - 'contact-payload'       — user sent contact details
// - 'verification-method'   — verification channel chosen
// - 'otp-code'              — OTP code submitted
// - 'resend-code'           — OTP resend requested
// - 'google-handoff'        — redirect to Google OAuth
// - 'consultation-topic'    — consultation topic detected
// - 'consultation-technique'— technique selected in consultation
// - 'consultation-confirm'  — booking confirmed from consultation
// - 'consultation-decline'  — declined booking suggestion
// - 'occasion-*'            — occasion detected (wedding/vacation/etc)
// - 'hydrafacial-compare'   — Hydrafacial tier comparison
// - 'brows-lashes-compare'  — Brows/Lashes comparison
// - 'pmu-healing'           — PMU healing info
// - 'pmu-safety'            — PMU safety/side effects info
//
// HELPER: Instead of tagging each return individually, use a wrapper:

/*
  function returnFastPath(
    name: string,
    response: ChatResponse & { inputMode?: string },
  ): NextResponse {
    turn
      .setFastPath(name)
      .setAssistantMessage(response.text)
      .setFunnelStage(detectFunnelStage(session.context))
      .save();
    return NextResponse.json(response);
  }

  // Then replace:
  // return NextResponse.json({ text, sessionId });
  // With:
  // return returnFastPath('catalog-selection', { text, sessionId });
*/


// ─── CHANGE 4: Track tool runs in GPT loop ─────────────────
//
// In the tool execution section, after each tool completes
// (both streaming and non-streaming paths):

/*
  // After: const toolResult = await executeTool(fnName, parsedArgs);
  // After: const durationMs = Date.now() - startMs;

  turn.addToolRun({
    toolName: fnName,
    step: mapToolNameToProgressStep?.(fnName),
    durationMs,
    ok: !toolResult?.error,
    errorCode: toolResult?.error ? String(toolResult.error).slice(0, 64) : undefined,
    errorMessageSafe: toolResult?.error ? String(toolResult.message || toolResult.error).slice(0, 512) : undefined,
    startedAt: new Date(Date.now() - durationMs),
  });
*/


// ─── CHANGE 5: Track GPT response (non-streaming) ──────────
//
// At the end of the non-streaming GPT section, before the
// final return:

/*
  turn
    .setGptCall(iterations)
    .setResponseMode('json')
    .setAssistantMessage(text)
    .setFunnelStage(detectFunnelStage(session.context))
    .save();

  return NextResponse.json({ text, sessionId, ... });
*/


// ─── CHANGE 6: Track GPT response (SSE streaming) ──────────
//
// In the SSE streaming function, before sse.sendMeta():

/*
  turn
    .setGptCall(iterations)
    .setResponseMode('sse')
    .setAssistantMessage(finalText)
    .setFunnelStage(detectFunnelStage(session.context))
    .save();

  sse.sendMeta({ ... });
*/

// For TTFD tracking in SSE mode, capture when first delta is sent:
// In streaming-gpt.ts, record the timestamp of the first text delta.
// Then: turn.setTtfd(firstDeltaTime - requestStartTime);


// ─── CHANGE 7: Track errors ────────────────────────────────
//
// In catch blocks:

/*
  // Non-streaming error:
  turn
    .setGptCall(iterations)
    .setError(classified.category, classified.category, classified.original?.message)
    .setRetried()
    .setFunnelStage(detectFunnelStage(session.context))
    .save();

  // SSE error:
  turn
    .setGptCall(iterations)
    .setResponseMode('sse')
    .setError(classified.category, classified.category, classified.original?.message)
    .save();

  // Degraded (fallback used):
  turn
    .setGptCall(iterations)
    .setDegraded()
    .setAssistantMessage(fallbackText)
    .setFunnelStage(detectFunnelStage(session.context))
    .save();
*/


// ─── CHANGE 8: Cleanup on session expiry ────────────────────
//
// In session-store.ts cleanup interval, alongside
// finalizeSessionAnalytics:

/*
  import { resetTurnCounter } from '@/lib/ai/turn-tracker';

  // When deleting expired session:
  resetTurnCounter(sessionId);
*/


// ═══════════════════════════════════════════════════════════════
// DEPLOYMENT:
//
// 1. Add models to schema.prisma (PRISMA-AI-TURNS.ts)
// 2. Run migration:
//    npx prisma migrate dev --name add_ai_turn_tracking
//    npx prisma generate
// 3. Copy turn-tracker.ts → src/lib/ai/turn-tracker.ts
// 4. Apply changes 1-8 to route.ts
// 5. Add resetTurnCounter to session-store.ts cleanup
// 6. Test: send a few messages, check:
//    SELECT * FROM ai_chat_turn ORDER BY created_at DESC LIMIT 10;
//    SELECT * FROM ai_tool_run ORDER BY created_at DESC LIMIT 10;
//
// ═══════════════════════════════════════════════════════════════
