// src/lib/ai/turn-tracker.ts
//
// Records detailed per-turn metrics (AiChatTurn) and per-tool metrics (AiToolRun).
// All writes are fire-and-forget to avoid slowing down responses.
// PII is redacted before storage.

import { prisma } from '@/lib/prisma';

// ─── PII Redaction ──────────────────────────────────────────

const PHONE_RE = /(\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,6}/g;
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const OTP_RE = /\b\d{6}\b/g;

/**
 * Redact PII from text:
 * - Phone numbers → +XX***
 * - Emails → f***@d***.com
 * - 6-digit OTP codes → ******
 */
export function redactPII(text: string | null | undefined): string | null {
  if (!text) return null;

  let redacted = text;

  // Redact phones
  redacted = redacted.replace(PHONE_RE, (match) => {
    // Keep country code prefix if present
    const prefix = match.match(/^\+?\d{1,3}/)?.[0] || '';
    return prefix ? `${prefix}***` : '***';
  });

  // Redact emails
  redacted = redacted.replace(EMAIL_RE, (match) => {
    const [local, domain] = match.split('@');
    const domParts = domain.split('.');
    const tld = domParts.pop() || '';
    return `${local[0]}***@${domParts[0]?.[0] || ''}***.${tld}`;
  });

  // Redact OTP codes (6-digit sequences that look like codes)
  // Only redact if in context of verification/code
  if (/код|code|bestätigungs|verif/i.test(text)) {
    redacted = redacted.replace(OTP_RE, '******');
  }

  return redacted;
}

// ─── Types ──────────────────────────────────────────────────

export interface TurnData {
  sessionId: string;
  turnNumber: number;
  userMessage?: string;
  assistantMessage?: string;
  responseMode: 'json' | 'sse';
  isFastPath: boolean;
  fastPathName?: string;
  isGptCall: boolean;
  gptIterations?: number;
  ttfdMs?: number;
  totalMs: number;
  funnelStage: string;
  outcome: 'ok' | 'error' | 'timeout' | 'aborted' | 'degraded';
  errorCategory?: string;
  errorCode?: string;
  errorMessageSafe?: string;
  retried: boolean;
  inputMode?: string;
  toolRuns: ToolRunData[];
  startedAt: Date;
  endedAt: Date;
}

export interface ToolRunData {
  toolName: string;
  step?: string;
  orderIndex: number;
  durationMs: number;
  ok: boolean;
  errorCode?: string;
  errorMessageSafe?: string;
  startedAt: Date;
}

// ─── Turn Counter ───────────────────────────────────────────

// In-memory turn counters per session (reset when session expires)
declare global {
  // eslint-disable-next-line no-var
  var __aiTurnCounters: Map<string, number> | undefined;
}

function getTurnCounters(): Map<string, number> {
  if (!global.__aiTurnCounters) {
    global.__aiTurnCounters = new Map();
  }
  return global.__aiTurnCounters;
}

/**
 * Get and increment the turn number for a session.
 * Returns the new turn number (starting from 1).
 */
export function nextTurnNumber(sessionId: string): number {
  const counters = getTurnCounters();
  const current = counters.get(sessionId) || 0;
  const next = current + 1;
  counters.set(sessionId, next);
  return next;
}

/** Reset turn counter (called when session is cleaned up) */
export function resetTurnCounter(sessionId: string): void {
  getTurnCounters().delete(sessionId);
}

// ─── Turn Builder ───────────────────────────────────────────

/**
 * Mutable builder for accumulating turn data during request processing.
 * Create at the start of a request, add tool runs as they execute,
 * then call `save()` at the end.
 */
export class TurnBuilder {
  private data: TurnData;
  private toolRuns: ToolRunData[] = [];
  private toolOrderCounter = 0;

  constructor(sessionId: string, userMessage: string, inputMode?: string) {
    this.data = {
      sessionId,
      turnNumber: nextTurnNumber(sessionId),
      userMessage,
      responseMode: 'json',
      isFastPath: false,
      isGptCall: false,
      totalMs: 0,
      funnelStage: 'none',
      outcome: 'ok',
      retried: false,
      inputMode,
      toolRuns: [],
      startedAt: new Date(),
      endedAt: new Date(),
    };
  }

  /** Mark as fast-path response */
  setFastPath(name?: string): this {
    this.data.isFastPath = true;
    this.data.fastPathName = name?.slice(0, 64);
    return this;
  }

  /** Mark as GPT call */
  setGptCall(iterations?: number): this {
    this.data.isGptCall = true;
    this.data.gptIterations = iterations;
    return this;
  }

  /** Set response mode */
  setResponseMode(mode: 'json' | 'sse'): this {
    this.data.responseMode = mode;
    return this;
  }

  /** Set time to first delta (SSE) */
  setTtfd(ms: number): this {
    this.data.ttfdMs = ms;
    return this;
  }

  /** Set assistant response text */
  setAssistantMessage(text: string): this {
    this.data.assistantMessage = text;
    return this;
  }

  /** Set funnel stage */
  setFunnelStage(stage: string): this {
    this.data.funnelStage = stage;
    return this;
  }

  /** Mark as error */
  setError(category?: string, code?: string, message?: string): this {
    this.data.outcome = 'error';
    this.data.errorCategory = category?.slice(0, 32);
    this.data.errorCode = code?.slice(0, 64);
    this.data.errorMessageSafe = message?.slice(0, 512);
    return this;
  }

  /** Mark as timeout */
  setTimeout(): this {
    this.data.outcome = 'timeout';
    return this;
  }

  /** Mark as degraded (graceful fallback) */
  setDegraded(): this {
    this.data.outcome = 'degraded';
    return this;
  }

  /** Mark as retried */
  setRetried(): this {
    this.data.retried = true;
    return this;
  }

  /** Add a tool run result */
  addToolRun(run: Omit<ToolRunData, 'orderIndex'>): this {
    this.toolRuns.push({
      ...run,
      orderIndex: this.toolOrderCounter++,
    });
    return this;
  }

  /**
   * Save the turn to database (fire-and-forget).
   * Call this at the end of request processing.
   */
  save(): void {
    const now = new Date();
    this.data.endedAt = now;
    this.data.totalMs = now.getTime() - this.data.startedAt.getTime();
    this.data.toolRuns = this.toolRuns;

    // Fire-and-forget
    saveTurn(this.data).catch((err) => {
      console.error('[TurnTracker] save error:', err?.message || err);
    });
  }
}

// ─── Database Write ─────────────────────────────────────────

async function saveTurn(data: TurnData): Promise<void> {
  const turn = await prisma.aiChatTurn.create({
    data: {
      sessionId: data.sessionId,
      turnNumber: data.turnNumber,
      userMessage: redactPII(data.userMessage),
      assistantMessage: redactPII(data.assistantMessage)?.slice(0, 4000),
      responseMode: data.responseMode,
      isFastPath: data.isFastPath,
      fastPathName: data.fastPathName,
      isGptCall: data.isGptCall,
      gptIterations: data.gptIterations ?? 0,
      ttfdMs: data.ttfdMs,
      totalMs: data.totalMs,
      funnelStage: data.funnelStage,
      outcome: data.outcome,
      errorCategory: data.errorCategory,
      errorCode: data.errorCode,
      errorMessageSafe: data.errorMessageSafe,
      retried: data.retried,
      inputMode: data.inputMode,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
    },
  });

  // Save tool runs if any
  if (data.toolRuns.length > 0) {
    await prisma.aiToolRun.createMany({
      data: data.toolRuns.map((tr) => ({
        turnId: turn.id,
        toolName: tr.toolName,
        step: tr.step?.slice(0, 64),
        orderIndex: tr.orderIndex,
        durationMs: tr.durationMs,
        ok: tr.ok,
        errorCode: tr.errorCode?.slice(0, 64),
        errorMessageSafe: tr.errorMessageSafe?.slice(0, 512),
        startedAt: tr.startedAt,
      })),
    });
  }
}

// ─── Query: Session Replay ──────────────────────────────────

export interface TurnReplayItem {
  id: string;
  turnNumber: number;
  userMessage: string | null;
  assistantMessage: string | null;
  responseMode: string;
  isFastPath: boolean;
  fastPathName: string | null;
  isGptCall: boolean;
  gptIterations: number;
  ttfdMs: number | null;
  totalMs: number;
  funnelStage: string;
  outcome: string;
  errorCategory: string | null;
  errorCode: string | null;
  errorMessageSafe: string | null;
  retried: boolean;
  inputMode: string | null;
  startedAt: string;
  endedAt: string;
  toolRuns: Array<{
    id: string;
    toolName: string;
    step: string | null;
    orderIndex: number;
    durationMs: number;
    ok: boolean;
    errorCode: string | null;
    errorMessageSafe: string | null;
    startedAt: string;
  }>;
}

/**
 * Get all turns for a session, ordered by turnNumber.
 * Used for session replay in admin.
 */
export async function getSessionReplay(sessionId: string): Promise<TurnReplayItem[]> {
  const turns = await prisma.aiChatTurn.findMany({
    where: { sessionId },
    orderBy: { turnNumber: 'asc' },
    include: {
      toolRuns: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  return turns.map((t) => ({
    id: t.id,
    turnNumber: t.turnNumber,
    userMessage: t.userMessage,
    assistantMessage: t.assistantMessage,
    responseMode: t.responseMode,
    isFastPath: t.isFastPath,
    fastPathName: t.fastPathName,
    isGptCall: t.isGptCall,
    gptIterations: t.gptIterations,
    ttfdMs: t.ttfdMs,
    totalMs: t.totalMs,
    funnelStage: t.funnelStage,
    outcome: t.outcome,
    errorCategory: t.errorCategory,
    errorCode: t.errorCode,
    errorMessageSafe: t.errorMessageSafe,
    retried: t.retried,
    inputMode: t.inputMode,
    startedAt: t.startedAt.toISOString(),
    endedAt: t.endedAt.toISOString(),
    toolRuns: t.toolRuns.map((tr) => ({
      id: tr.id,
      toolName: tr.toolName,
      step: tr.step,
      orderIndex: tr.orderIndex,
      durationMs: tr.durationMs,
      ok: tr.ok,
      errorCode: tr.errorCode,
      errorMessageSafe: tr.errorMessageSafe,
      startedAt: tr.startedAt.toISOString(),
    })),
  }));
}
