// src/app/api/ai/chat/route.ts
// AI assistant endpoint using OpenAI Chat Completions with function calling.

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSystemPrompt } from '@/lib/ai/system-prompt';
import { TOOLS } from '@/lib/ai/tools-schema';
import { executeTool, type ToolCallRequest } from '@/lib/ai/tool-executor';
import {
  getSession,
  upsertSession,
  checkRateLimit,
} from '@/lib/ai/session-store';

// ─── Config ─────────────────────────────────────────────────────

const MAX_TOOL_ITERATIONS = parseInt(
  process.env.AI_MAX_TOOL_ITERATIONS || '8',
  10,
);
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

// ─── Types ──────────────────────────────────────────────────────

interface ChatRequest {
  sessionId: string;
  message: string;
  locale?: string;
}

interface ChatResponse {
  text: string;
  sessionId: string;
  toolCalls?: { name: string; durationMs: number }[];
}

// ─── Route Handler ──────────────────────────────────────────────

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ChatResponse | { error: string }>> {
  // Kill switch
  if (process.env.AI_ASSISTANT_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'AI assistant is disabled' },
      { status: 503 },
    );
  }

  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: 'AI not configured (missing OPENAI_API_KEY)' },
      { status: 503 },
    );
  }

  // Rate limiting by IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const rateCheck = checkRateLimit(`ip:${ip}`);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Retry in ${Math.ceil(rateCheck.retryAfterMs / 1000)}s` },
      { status: 429 },
    );
  }

  // Parse body
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { sessionId, message, locale } = body;

  if (!sessionId || !message?.trim()) {
    return NextResponse.json(
      { error: 'sessionId and message are required' },
      { status: 400 },
    );
  }

  // Get or create session
  const session = upsertSession(sessionId, {
    locale: (locale as 'de' | 'ru' | 'en') ?? 'de',
  });

  // Build messages
  const systemPrompt = buildSystemPrompt(session.locale);

  // Build conversation history from session
  // We use the simple approach: system + last exchange context + new message
  // For full multi-turn, store messages array in session or use Responses API
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message },
  ];

  // Tool definitions for OpenAI
  const tools: OpenAI.Chat.ChatCompletionTool[] = TOOLS.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));

  try {
    const toolCallLog: { name: string; durationMs: number }[] = [];

    // Tool-calling loop
    let response = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 1024,
    });

    let iterations = 0;

    while (iterations < MAX_TOOL_ITERATIONS) {
      const choice = response.choices[0];
      if (!choice) break;

      // If the model wants to call tools
      if (
        choice.finish_reason === 'tool_calls' &&
        choice.message.tool_calls &&
        choice.message.tool_calls.length > 0
      ) {
        // Add assistant message with tool calls to history
        messages.push(choice.message);

        // Execute all tool calls in parallel
        const toolCalls = choice.message.tool_calls.map(
          (tc): ToolCallRequest => ({
            id: tc.id,
            name: tc.function.name,
            arguments: tc.function.arguments,
          }),
        );

        const results = await Promise.all(toolCalls.map(executeTool));

        // Add tool results to messages
        for (const result of results) {
          messages.push({
            role: 'tool',
            tool_call_id: result.id,
            content: result.result,
          });
          toolCallLog.push({ name: result.name, durationMs: result.durationMs });
        }

        // Call model again with tool results
        response = await client.chat.completions.create({
          model: MODEL,
          messages,
          tools,
          tool_choice: 'auto',
          temperature: 0.3,
          max_tokens: 1024,
        });

        iterations++;
        continue;
      }

      // Model returned a text response — we're done
      break;
    }

    // Extract final text
    const finalMessage = response.choices[0]?.message;
    const text = finalMessage?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';

    // Update session
    upsertSession(sessionId, {});

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... tools=${toolCallLog.length} iterations=${iterations}`,
    );

    return NextResponse.json({
      text,
      sessionId,
      toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
    });
  } catch (error) {
    console.error('[AI Chat] OpenAI error:', error);

    const errorMsg =
      error instanceof OpenAI.APIError
        ? `OpenAI API error: ${error.status}`
        : 'Internal AI error';

    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
