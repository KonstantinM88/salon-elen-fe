// src/lib/ai/resilience.ts
//
// Resilience utilities for AI assistant: retry, timeout, error classification.

import OpenAI from 'openai';

// ─── Configuration ──────────────────────────────────────────

/** Max retries for transient OpenAI errors */
const MAX_RETRIES = parseInt(process.env.AI_MAX_RETRIES || '2', 10);

/** Base delay between retries (ms). Actual = base * 2^attempt + jitter */
const RETRY_BASE_DELAY_MS = parseInt(process.env.AI_RETRY_BASE_DELAY_MS || '800', 10);

/** Hard timeout for a single OpenAI call (ms) */
const OPENAI_CALL_TIMEOUT_MS = parseInt(process.env.AI_CALL_TIMEOUT_MS || '30000', 10);

/** Hard timeout for the entire GPT processing loop including tools (ms) */
const GPT_LOOP_TIMEOUT_MS = parseInt(process.env.AI_LOOP_TIMEOUT_MS || '55000', 10);

// ─── Error Classification ───────────────────────────────────

export interface ClassifiedError {
  /** Is this error worth retrying? */
  retryable: boolean;
  /** Human-facing error category */
  category: 'rate_limit' | 'timeout' | 'overloaded' | 'auth' | 'network' | 'internal';
  /** How long to wait before retry (ms), if retryable */
  retryAfterMs: number;
  /** Original error for logging */
  original: unknown;
}

/**
 * Classify an error into a structured category.
 * Handles OpenAI SDK errors, fetch errors, and generic errors.
 */
export function classifyError(error: unknown): ClassifiedError {
  // OpenAI SDK API errors
  if (error instanceof OpenAI.APIError) {
    const status = error.status;

    // 429 — Rate limited
    if (status === 429) {
      // Parse retry-after header if available
      const retryAfter = parseRetryAfterHeader(error);
      return {
        retryable: true,
        category: 'rate_limit',
        retryAfterMs: retryAfter ?? 5000,
        original: error,
      };
    }

    // 500, 502, 503 — OpenAI server errors (transient)
    if (status && status >= 500 && status <= 503) {
      return {
        retryable: true,
        category: 'overloaded',
        retryAfterMs: 2000,
        original: error,
      };
    }

    // 401, 403 — Auth errors (not retryable)
    if (status === 401 || status === 403) {
      return {
        retryable: false,
        category: 'auth',
        retryAfterMs: 0,
        original: error,
      };
    }

    // 408, 504 — Timeout-like
    if (status === 408 || status === 504) {
      return {
        retryable: true,
        category: 'timeout',
        retryAfterMs: 3000,
        original: error,
      };
    }

    // Other API errors
    return {
      retryable: false,
      category: 'internal',
      retryAfterMs: 0,
      original: error,
    };
  }

  // AbortError from our timeout
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      retryable: true,
      category: 'timeout',
      retryAfterMs: 1000,
      original: error,
    };
  }

  // Network errors (ECONNRESET, ETIMEDOUT, fetch failures)
  if (error instanceof TypeError && error.message?.includes('fetch')) {
    return {
      retryable: true,
      category: 'network',
      retryAfterMs: 2000,
      original: error,
    };
  }

  if (error instanceof Error) {
    const msg = error.message?.toLowerCase() || '';
    if (
      msg.includes('econnreset') ||
      msg.includes('etimedout') ||
      msg.includes('econnrefused') ||
      msg.includes('socket hang up') ||
      msg.includes('network')
    ) {
      return {
        retryable: true,
        category: 'network',
        retryAfterMs: 2000,
        original: error,
      };
    }

    // OpenAI streaming errors
    if (msg.includes('stream') && (msg.includes('error') || msg.includes('closed'))) {
      return {
        retryable: true,
        category: 'network',
        retryAfterMs: 1500,
        original: error,
      };
    }
  }

  // Unknown errors
  return {
    retryable: false,
    category: 'internal',
    retryAfterMs: 0,
    original: error,
  };
}

// ─── Retry with Exponential Backoff ─────────────────────────

export interface RetryOptions {
  /** Override max retries (default: MAX_RETRIES) */
  maxRetries?: number;
  /** Override base delay (default: RETRY_BASE_DELAY_MS) */
  baseDelayMs?: number;
  /** Called on each retry attempt for logging */
  onRetry?: (attempt: number, classified: ClassifiedError) => void;
  /** AbortSignal to cancel retries externally */
  signal?: AbortSignal;
}

/**
 * Execute an async function with automatic retry on transient errors.
 *
 * Uses exponential backoff with jitter:
 *   delay = min(baseDelay * 2^attempt, 10000) + random(0..500)
 *
 * Example:
 * ```ts
 * const result = await withRetry(
 *   () => client.chat.completions.create({ ... }),
 *   { onRetry: (n, e) => console.warn(`Retry ${n}: ${e.category}`) }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const maxRetries = options?.maxRetries ?? MAX_RETRIES;
  const baseDelay = options?.baseDelayMs ?? RETRY_BASE_DELAY_MS;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Check if cancelled
      if (options?.signal?.aborted) {
        throw new DOMException('Retry cancelled', 'AbortError');
      }

      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt >= maxRetries) break;

      const classified = classifyError(error);

      // Don't retry non-retryable errors
      if (!classified.retryable) break;

      // Notify caller
      options?.onRetry?.(attempt + 1, classified);

      // Calculate delay with exponential backoff + jitter
      const expDelay = Math.min(baseDelay * Math.pow(2, attempt), 10000);
      const jitter = Math.floor(Math.random() * 500);
      const delay = Math.max(expDelay + jitter, classified.retryAfterMs);

      // Wait, but respect abort signal
      await sleep(delay, options?.signal);
    }
  }

  throw lastError;
}

// ─── Timeout ────────────────────────────────────────────────

/**
 * Create an AbortController that auto-aborts after `timeoutMs`.
 *
 * Usage:
 * ```ts
 * const { signal, clear } = createTimeout(30000);
 * try {
 *   const result = await client.chat.completions.create({ ..., signal });
 * } finally {
 *   clear(); // prevent timer leak
 * }
 * ```
 */
export function createTimeout(timeoutMs?: number): {
  controller: AbortController;
  signal: AbortSignal;
  clear: () => void;
} {
  const ms = timeoutMs ?? OPENAI_CALL_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return {
    controller,
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

/**
 * Create a loop-level timeout for the entire GPT processing pipeline.
 *
 * Returns an object that can check remaining time and abort if exceeded.
 */
export function createLoopTimeout(timeoutMs?: number): {
  signal: AbortSignal;
  remainingMs: () => number;
  isExpired: () => boolean;
  clear: () => void;
} {
  const ms = timeoutMs ?? GPT_LOOP_TIMEOUT_MS;
  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    remainingMs: () => Math.max(0, ms - (Date.now() - startedAt)),
    isExpired: () => Date.now() - startedAt >= ms,
    clear: () => clearTimeout(timer),
  };
}

// ─── Fallback Text Builder ──────────────────────────────────

/**
 * Build a user-facing error message based on error category and locale.
 * Used when the AI cannot produce a response.
 */
export function buildErrorText(
  classified: ClassifiedError,
  locale: 'de' | 'ru' | 'en',
): string {
  switch (classified.category) {
    case 'rate_limit':
      return {
        de: 'Momentan sind viele Anfragen. Bitte versuchen Sie es in einigen Sekunden erneut. 🙏',
        ru: 'Сейчас много запросов. Попробуйте через несколько секунд. 🙏',
        en: 'Too many requests right now. Please try again in a few seconds. 🙏',
      }[locale];

    case 'timeout':
      return {
        de: 'Die Antwort hat zu lange gedauert. Bitte versuchen Sie es erneut. ⏱️',
        ru: 'Ответ занял слишком много времени. Попробуйте ещё раз. ⏱️',
        en: 'The response took too long. Please try again. ⏱️',
      }[locale];

    case 'overloaded':
      return {
        de: 'Unser Assistent ist gerade überlastet. Bitte versuchen Sie es gleich nochmal. 🌸',
        ru: 'Наш ассистент сейчас перегружен. Попробуйте через минутку. 🌸',
        en: 'Our assistant is currently overloaded. Please try again shortly. 🌸',
      }[locale];

    case 'network':
      return {
        de: 'Verbindungsproblem. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
        ru: 'Проблема соединения. Проверьте подключение к интернету и попробуйте снова.',
        en: 'Connection issue. Please check your internet connection and try again.',
      }[locale];

    case 'auth':
      return {
        de: 'Der Assistent ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später.',
        ru: 'Ассистент временно недоступен. Попробуйте позже.',
        en: 'The assistant is temporarily unavailable. Please try later.',
      }[locale];

    default:
      return {
        de: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
        ru: 'Извините, произошла ошибка. Попробуйте ещё раз.',
        en: 'Sorry, something went wrong. Please try again.',
      }[locale];
  }
}

// ─── Graceful Degradation ───────────────────────────────────

/**
 * When GPT fails mid-loop but we have useful tool results,
 * try to build a reasonable response from the tool data.
 *
 * Returns a fallback text or null if no useful data available.
 */
export function buildToolFallbackText(
  toolResults: Array<{ name: string; result: string }>,
  locale: 'de' | 'ru' | 'en',
): string | null {
  // Try to find the most informative tool result
  for (const tr of toolResults) {
    try {
      const data = JSON.parse(tr.result);

      // list_services → show categories
      if (tr.name === 'list_services' && data.groups && Array.isArray(data.groups)) {
        const categories = data.groups
          .map((g: { title?: string }) => g.title)
          .filter(Boolean)
          .join(', ');
        if (categories) {
          return {
            de: `Hier sind unsere Kategorien: ${categories}.\n\nWelche Kategorie interessiert Sie?`,
            ru: `Вот наши категории: ${categories}.\n\nКакая категория вас интересует?`,
            en: `Here are our categories: ${categories}.\n\nWhich category interests you?`,
          }[locale];
        }
      }

      // search_availability → show slots
      if (tr.name === 'search_availability' && data.slots && Array.isArray(data.slots)) {
        if (data.slots.length === 0) {
          return {
            de: 'Leider sind an diesem Tag keine Termine verfügbar. Möchten Sie einen anderen Tag versuchen?',
            ru: 'К сожалению, на этот день нет свободных окон. Хотите попробовать другой день?',
            en: 'Unfortunately no slots are available on this day. Would you like to try another date?',
          }[locale];
        }

        const slotCount = data.slots.length;
        return {
          de: `Es gibt ${slotCount} verfügbare Termine. Bitte versuchen Sie es erneut, um die Details zu sehen.`,
          ru: `Найдено ${slotCount} свободных окон. Попробуйте ещё раз, чтобы увидеть детали.`,
          en: `Found ${slotCount} available slots. Please try again to see the details.`,
        }[locale];
      }

      // reserve_slot success
      if (tr.name === 'reserve_slot' && data.ok) {
        return {
          de: 'Ihr Termin wurde vorgemerkt! Bitte versuchen Sie es erneut, um die Buchung abzuschließen.',
          ru: 'Время забронировано! Попробуйте ещё раз, чтобы завершить запись.',
          en: 'Your slot has been reserved! Please try again to complete the booking.',
        }[locale];
      }
    } catch {
      // Not JSON, skip
    }
  }

  return null;
}

// ─── Helpers ────────────────────────────────────────────────

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Sleep cancelled', 'AbortError'));
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Sleep cancelled', 'AbortError'));
    }, { once: true });
  });
}

function parseRetryAfterHeader(
  error: InstanceType<typeof OpenAI.APIError>,
): number | null {
  try {
    // OpenAI sometimes includes retry-after in headers
    const headers = (error as unknown as { headers?: Record<string, string> }).headers;
    const retryAfter = headers?.['retry-after'];
    if (retryAfter) {
      const seconds = parseFloat(retryAfter);
      if (!isNaN(seconds)) return Math.ceil(seconds * 1000);
    }
  } catch {
    // Ignore
  }
  return null;
}
