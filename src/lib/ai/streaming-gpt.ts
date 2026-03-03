// src/lib/ai/streaming-gpt.ts
//
// Helper to call OpenAI with streaming, buffer tool calls, and pipe text to SSE.
// Designed to be a drop-in replacement for `client.chat.completions.create()`
// in the tool loop of route.ts.

import type OpenAI from 'openai';
import type { SSEWriter } from './sse-stream';

export interface StreamingGptResult {
  /** Accumulated text content (empty if tool calls) */
  content: string;
  /** Parsed tool calls (empty if text response) */
  toolCalls: Array<{
    id: string;
    function: { name: string; arguments: string };
  }>;
  /** "stop", "tool_calls", etc. */
  finishReason: string;
  /** Whether any text was streamed to the client */
  didStreamText: boolean;
}

/**
 * Execute a single streaming GPT call.
 *
 * - If GPT returns text → pipes deltas to SSE (if provided)
 * - If GPT returns tool_calls → buffers them silently
 *
 * The first delta determines the response type:
 * - `delta.tool_calls` → tool response (no streaming)
 * - `delta.content` → text response (stream to client)
 */
export async function streamingGptCall(
  client: OpenAI,
  params: {
    model: string;
    messages: OpenAI.Chat.ChatCompletionMessageParam[];
    tools: OpenAI.Chat.ChatCompletionTool[];
    tool_choice: 'auto' | 'none';
    temperature: number;
    max_tokens: number;
  },
  sse?: SSEWriter,
): Promise<StreamingGptResult> {
  const stream = await client.chat.completions.create({
    ...params,
    stream: true,
  });

  let content = '';
  let finishReason = '';
  let isToolResponse = false;
  let didStreamText = false;

  // Map<index, accumulated tool call>
  const toolCallsMap = new Map<
    number,
    { id: string; function: { name: string; arguments: string } }
  >();

  for await (const chunk of stream) {
    const choice = chunk.choices[0];
    if (!choice) continue;

    const delta = choice.delta;

    // ── Tool call deltas ────────────────────────────────────
    if (delta?.tool_calls && delta.tool_calls.length > 0) {
      isToolResponse = true;

      for (const tc of delta.tool_calls) {
        const idx = tc.index;

        if (!toolCallsMap.has(idx)) {
          toolCallsMap.set(idx, {
            id: tc.id || '',
            function: { name: tc.function?.name || '', arguments: '' },
          });
        }

        const existing = toolCallsMap.get(idx)!;
        if (tc.id) existing.id = tc.id;
        if (tc.function?.name) existing.function.name = tc.function.name;
        if (tc.function?.arguments) {
          existing.function.arguments += tc.function.arguments;
        }
      }
    }

    // ── Text content deltas ─────────────────────────────────
    if (delta?.content && !isToolResponse) {
      content += delta.content;
      if (sse) {
        sse.sendDelta(delta.content);
        didStreamText = true;
      }
    }

    // ── Finish reason ───────────────────────────────────────
    if (choice.finish_reason) {
      finishReason = choice.finish_reason;
    }
  }

  return {
    content,
    toolCalls: Array.from(toolCallsMap.values()),
    finishReason,
    didStreamText,
  };
}

/**
 * Convert a StreamingGptResult's tool calls into the format expected by
 * OpenAI's message history (assistant message with tool_calls).
 */
export function toolCallsToMessage(
  result: StreamingGptResult,
): OpenAI.Chat.ChatCompletionAssistantMessageParam {
  return {
    role: 'assistant',
    content: result.content || null,
    tool_calls: result.toolCalls.map((tc) => ({
      id: tc.id,
      type: 'function' as const,
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    })),
  };
}