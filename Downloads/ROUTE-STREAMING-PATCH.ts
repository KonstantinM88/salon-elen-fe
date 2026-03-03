// ═══════════════════════════════════════════════════════════════
// ROUTE.TS — SSE STREAMING PATCH
// ═══════════════════════════════════════════════════════════════
//
// This patch modifies the GPT section of route.ts to support
// real OpenAI streaming via SSE. Fast-paths remain instant JSON.
//
// ═══════════════════════════════════════════════════════════════

// ─── CHANGE 1: Add imports (top of file) ────────────────────
//
// Add these imports near the top of route.ts:

/*
import { createSSEWriter, SSE_HEADERS, type SSEWriter } from '@/lib/ai/sse-stream';
import { streamingGptCall, toolCallsToMessage } from '@/lib/ai/streaming-gpt';
*/


// ─── CHANGE 2: Extend ChatRequest (line ~65) ────────────────
//
// Add `stream` field:

/*
interface ChatRequest {
  sessionId: string;
  message: string;
  locale?: string;
  inputMode?: 'text' | 'voice' | 'otp';
  stream?: boolean;  // ← NEW: request SSE streaming for GPT responses
}
*/


// ─── CHANGE 3: Parse stream flag (line ~2333) ───────────────
//
// After: const { sessionId, message, locale, inputMode } = body;
// Add:

/*
  const { sessionId, message, locale, inputMode, stream: wantStream } = body;
  const isVoiceTurn = inputMode === 'voice';
*/


// ─── CHANGE 4: Replace GPT section (line ~3747 to ~4571) ────
//
// This is the main change. Replace the entire tool-calling loop
// and final response section with the streaming version below.
//
// FROM (approximately line 3747):
//   try {
//     const toolCallLog: { name: string; durationMs: number }[] = [];
//     ...
//     let response = await client.chat.completions.create({
//     ...
//   } catch (error) {
//
// TO (replace everything from `try {` to the `catch`):

/*
  // ─── Streaming vs non-streaming path ─────────────────────
  const useSSE = wantStream === true;
  const sse = useSSE ? createSSEWriter() : undefined;

  // If streaming, start the response immediately so the client
  // can begin reading SSE events while we process.
  const sseResponse = sse
    ? new Response(sse.stream, { headers: SSE_HEADERS })
    : undefined;

  // Run GPT processing in a separate async context for SSE
  // (we need to return the Response before the stream completes)
  if (sse && sseResponse) {
    // Fire-and-forget the async GPT processing
    (async () => {
      try {
        await runGptWithStreaming(
          client,
          messages,
          tools,
          sse,
          sessionId,
          session,
          isVoiceTurn,
        );
      } catch (error) {
        console.error('[AI Chat] Streaming GPT error:', error);
        sse.sendError(fallbackTextByLocale(session.locale));
      }
    })();

    return sseResponse as unknown as NextResponse;
  }

  // Non-streaming path (voice calls, legacy clients)
  try {
*/

// The non-streaming path stays as-is (existing tool loop code).
// After the existing catch block, add the new streaming function:

/*
// ─── Streaming GPT processor ────────────────────────────────
async function runGptWithStreaming(
  client: OpenAI,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  tools: OpenAI.Chat.ChatCompletionTool[],
  sse: SSEWriter,
  sessionId: string,
  session: ReturnType<typeof getSession> & {},
  isVoiceTurn: boolean,
): Promise<void> {
  const toolCallLog: { name: string; durationMs: number }[] = [];
  const missingServiceSignals: MissingServiceSignal[] = [];

  let iterations = 0;
  let otpSentDuringSession = false;
  let bookingCompletedDuringSession = false;
  let finalText = '';

  // First GPT call (streaming)
  let result = await streamingGptCall(client, {
    model: MODEL,
    messages,
    tools,
    tool_choice: 'auto',
    temperature: TEMPERATURE,
    max_tokens: 1024,
  }, sse);

  while (iterations < MAX_TOOL_ITERATIONS) {
    // If text response → we're done (text was already streamed to SSE)
    if (result.toolCalls.length === 0) {
      finalText = result.content;
      break;
    }

    // ── Process tool calls ────────────────────────────────
    // Add assistant message with tool calls to history
    messages.push(toolCallsToMessage(result));

    for (const tc of result.toolCalls) {
      const fnName = tc.function.name;
      let parsedArgs: Record<string, unknown> = {};
      try {
        parsedArgs = JSON.parse(tc.function.arguments);
      } catch {
        // Invalid JSON from model
      }

      // Notify client of tool progress
      sse.sendToolProgress(fnName);

      // ── Execute tool (same logic as existing non-streaming code) ──
      // NOTE: Copy the existing tool execution block here.
      // The tool execution logic (lines ~3782-4470 in original) handles:
      // - reserve_slot sessionId binding
      // - complete_booking draftId binding
      // - start_verification auto-correction
      // - Session state updates (selectedServiceIds, selectedMasterId, etc.)
      // - otpSentDuringSession / bookingCompletedDuringSession flags
      // - missingServiceSignals collection

      const startMs = Date.now();

      // Apply sessionId/draftId overrides
      if (fnName === 'reserve_slot') {
        parsedArgs.sessionId = sessionId;
      }
      if (
        fnName === 'complete_booking' &&
        typeof session.context.draftId === 'string' &&
        session.context.draftId
      ) {
        parsedArgs.draftId = session.context.draftId;
      }

      const toolResult = await executeTool(fnName, parsedArgs);
      const durationMs = Date.now() - startMs;
      toolCallLog.push({ name: fnName, durationMs });

      // ── Update session state from tool results ──
      // (same logic as existing code - update selectedServiceIds,
      //  selectedMasterId, lastDateISO, draftId, etc.)
      // Copy the session state update blocks from existing route.ts here.
      //
      // IMPORTANT: This is the section from approx. line 3850 to 4460
      // that handles each tool's result and updates session context.
      // It must be copied verbatim from the existing non-streaming code.

      // Track OTP/booking flags
      if (fnName === 'start_verification' && toolResult?.ok) {
        otpSentDuringSession = true;
      }
      if (fnName === 'complete_booking' && toolResult?.status === 'ok') {
        bookingCompletedDuringSession = true;
        otpSentDuringSession = false;
      }

      // Add tool result to messages
      messages.push({
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(toolResult ?? { error: 'Tool not found' }),
      });
    }

    // Next GPT call (streaming) — this time text deltas will pipe to SSE
    result = await streamingGptCall(client, {
      model: MODEL,
      messages,
      tools,
      tool_choice: 'auto',
      temperature: TEMPERATURE,
      max_tokens: 1024,
    }, sse);

    iterations++;
  }

  // If no text was produced, force a final reply
  if (!finalText && !result.didStreamText) {
    const forced = await streamingGptCall(client, {
      model: MODEL,
      messages,
      tools,
      tool_choice: 'none',
      temperature: TEMPERATURE,
      max_tokens: 512,
    }, sse);
    finalText = forced.content;
  } else if (result.content) {
    finalText = result.content;
  }

  if (!finalText) {
    finalText = fallbackTextByLocale(session.locale);
    sse.sendDelta(finalText);
  }

  // Save to session history
  appendSessionMessage(sessionId, 'assistant', finalText);

  // Process missing service signals (same as existing code)
  if (missingServiceSignals.length > 0) {
    const currentSession = getSession(sessionId);
    const reported = new Set(currentSession?.context.reportedMissingQueries ?? []);
    const uniqueSignals = missingServiceSignals.filter((signal) => {
      const key = signal.query.trim().toLowerCase();
      if (!key || reported.has(key)) return false;
      reported.add(key);
      return true;
    });
    for (const signal of uniqueSignals) {
      const latest = getSession(sessionId);
      await reportMissingServiceInquiry({
        sessionId,
        locale: session.locale,
        query: signal.query,
        transcript: latest?.context.chatHistory ?? [],
        alternatives: signal.suggestedAlternatives,
      });
    }
    upsertSession(sessionId, {
      context: { reportedMissingQueries: Array.from(reported) },
    });
  }

  // Compute inputMode
  const finalInputMode = bookingCompletedDuringSession
    ? 'text'
    : otpSentDuringSession
      ? 'otp'
      : undefined;

  console.log(
    `[AI Chat] session=${sessionId.slice(0, 8)}... streaming=true tools=${toolCallLog.length} iterations=${iterations}`,
  );

  // Send final metadata and close stream
  sse.sendMeta({
    inputMode: finalInputMode,
    sessionId,
    toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
  });
}
*/


// ═══════════════════════════════════════════════════════════════
// SUMMARY OF CHANGES:
//
// 1. Two new imports: sse-stream.ts, streaming-gpt.ts
// 2. ChatRequest gets `stream?: boolean` field
// 3. Parse `wantStream` from body
// 4. Before the non-streaming GPT section, add SSE branching:
//    - If wantStream: create SSEWriter, return Response immediately,
//      run GPT in async context
//    - If !wantStream: existing code (unchanged)
// 5. New `runGptWithStreaming()` function that uses `streamingGptCall()`
//    for real OpenAI token-by-token streaming
//
// IMPORTANT:
// The tool execution logic inside `runGptWithStreaming` must mirror
// the existing tool processing code in the non-streaming loop.
// The cleanest approach is to extract tool processing into a shared
// function `processToolResult(fnName, parsedArgs, toolResult, session, ...)`
// that both streaming and non-streaming paths call.
//
// ═══════════════════════════════════════════════════════════════
