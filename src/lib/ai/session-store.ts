// src/lib/ai/session-store.ts
// In-memory session store for AI assistant conversations.
// For production with multiple instances, replace with Redis.

import type { Locale } from '@/i18n/locales';
import { finalizeSessionAnalytics } from '@/lib/ai/ai-analytics';
import { resetTurnCounter } from '@/lib/ai/turn-tracker';

export type OtpVerificationMethod = 'email_otp' | 'sms_otp' | 'telegram_otp';
export type PendingVerificationMethod = OtpVerificationMethod | 'google_oauth';

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface DateSuggestionOption {
  dateISO: string;
  label: string;
  count: number;
}

export interface AiSession {
  id: string;
  /** OpenAI Responses API: previous response_id for multi-turn */
  previousResponseId: string | null;
  locale: Locale;
  createdAt: Date;
  lastActiveAt: Date;
  /** Accumulated context for the session */
  context: {
    /** Consultation-first mode (do not auto-jump into booking catalog flow). */
    consultationMode?: boolean;
    /** Active consultation topic for consultation-first flow. */
    consultationTopic?: 'pmu' | 'brows_lashes' | 'nails' | 'hair' | 'hydrafacial';
    /** Last concrete consultation technique user selected (for seamless bridge to booking). */
    consultationTechnique?:
      | 'powder_brows'
      | 'hairstroke_brows'
      | 'aquarell_lips'
      | 'lips_3d'
      | 'lashline'
      | 'upper_lower';
    /** Waiting for explicit confirmation to book the consultation-selected technique. */
    awaitingConsultationBookingConfirmation?: boolean;
    /**
     * Service name (title) the user is currently looking at in consultation mode.
     * Used for non-PMU categories where there is no `consultationTechnique`.
     */
    consultationServiceTitle?: string;
    selectedServiceIds?: string[];
    selectedMasterId?: string;
    reservedSlot?: { startAt: string; endAt: string };
    draftId?: string;
    /** Last searched date */
    lastDateISO?: string;
    /** Last preferred time filter */
    lastPreferredTime?: 'morning' | 'afternoon' | 'evening' | 'any';
    /** Whether last availability search returned 0 slots */
    lastNoSlots?: boolean;
    /** Date options suggested to user for selection */
    lastSuggestedDateOptions?: DateSuggestionOption[];
    /** Chat history for multi-turn context */
    chatHistory?: ChatHistoryEntry[];
    /** Tracked missing service queries (to avoid duplicate reports) */
    reportedMissingQueries?: string[];
    /** Whether we're waiting for user to pick registration method after slot reserve */
    awaitingRegistrationMethod?: boolean;
    /**
     * Method selected by user before OTP is sent.
     * google_oauth is handled as a handoff to booking/client Google flow.
     */
    pendingVerificationMethod?: PendingVerificationMethod;
    /** OTP method already used for the current draft, needed for complete_booking. */
    activeVerificationMethod?: OtpVerificationMethod;
    /** Whether we're waiting for user to pick verification method */
    awaitingVerificationMethod?: boolean;
  };
}

declare global {
  var __aiSessionStore: Map<string, AiSession> | undefined;
  var __aiRateLimitStore: Map<string, number[]> | undefined;
}

function getSessions(): Map<string, AiSession> {
  if (!global.__aiSessionStore) {
    global.__aiSessionStore = new Map();
  }
  return global.__aiSessionStore;
}

function getRateLimits(): Map<string, number[]> {
  if (!global.__aiRateLimitStore) {
    global.__aiRateLimitStore = new Map();
  }
  return global.__aiRateLimitStore;
}

const sessions = getSessions();
const rateLimits = getRateLimits();

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CHAT_HISTORY = 32; // Keep last N messages

export function getSession(sessionId: string): AiSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  if (Date.now() - session.lastActiveAt.getTime() > SESSION_TTL_MS) {
    finalizeSessionAnalytics(sessionId);
    resetTurnCounter(sessionId);
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

export function upsertSession(
  sessionId: string,
  updates: Partial<Pick<AiSession, 'previousResponseId' | 'locale' | 'context'>>,
): AiSession {
  const existing = getSession(sessionId);

  if (existing) {
    if (updates.previousResponseId !== undefined) {
      existing.previousResponseId = updates.previousResponseId;
    }
    if (updates.locale) {
      existing.locale = updates.locale;
    }
    if (updates.context) {
      existing.context = { ...existing.context, ...updates.context };
    }
    existing.lastActiveAt = new Date();
    sessions.set(sessionId, existing);
    return existing;
  }

  const newSession: AiSession = {
    id: sessionId,
    previousResponseId: updates.previousResponseId ?? null,
    locale: updates.locale ?? 'de',
    createdAt: new Date(),
    lastActiveAt: new Date(),
    context: updates.context ?? {},
  };

  sessions.set(sessionId, newSession);
  return newSession;
}

/**
 * Append a message to the session's chat history.
 * Automatically trims to MAX_CHAT_HISTORY entries.
 */
export function appendSessionMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
): void {
  const session = getSession(sessionId);
  if (!session) return;

  if (!session.context.chatHistory) {
    session.context.chatHistory = [];
  }

  session.context.chatHistory.push({
    role,
    content,
    timestamp: Date.now(),
  });

  if (session.context.chatHistory.length > MAX_CHAT_HISTORY) {
    session.context.chatHistory = session.context.chatHistory.slice(-MAX_CHAT_HISTORY);
  }

  session.lastActiveAt = new Date();
  sessions.set(sessionId, session);
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '20', 10);

/**
 * Check if a request from this key is within rate limits.
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(
  key: string,
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const timestamps = (rateLimits.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    const oldest = timestamps[0];
    const retryAfterMs = oldest + RATE_LIMIT_WINDOW_MS - now;
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  timestamps.push(now);
  rateLimits.set(key, timestamps);

  return { allowed: true };
}

function cleanup() {
  const now = Date.now();

  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActiveAt.getTime() > SESSION_TTL_MS) {
      finalizeSessionAnalytics(id);
      resetTurnCounter(id);
      sessions.delete(id);
    }
  }

  const windowStart = now - RATE_LIMIT_WINDOW_MS * 2;
  for (const [key, timestamps] of rateLimits.entries()) {
    const filtered = timestamps.filter((t) => t > windowStart);
    if (filtered.length === 0) {
      rateLimits.delete(key);
    } else {
      rateLimits.set(key, filtered);
    }
  }
}

if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(cleanup, 5 * 60 * 1000);
  if (typeof cleanupTimer === 'object' && typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref();
  }
}
