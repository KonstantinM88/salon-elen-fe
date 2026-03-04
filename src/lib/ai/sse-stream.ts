// src/lib/ai/sse-stream.ts
//
// Server-side SSE (Server-Sent Events) helpers for streaming AI responses.
//
// Protocol:
//   data: {"t":"d","c":"chunk text"}\n\n          — text delta
//   data: {"t":"p","n":"tool_name","step":"..."}\n\n — tool progress indicator
//   data: {"t":"m","done":true,...}\n\n           — metadata (final event)
//   data: {"t":"e","message":"error msg"}\n\n      — error
//   : hb\n\n                                      — heartbeat comment

const encoder = new TextEncoder();
const DELTA_FLUSH_INTERVAL_MS = 75;
const DELTA_FLUSH_MAX_CHARS = 72;
const DELTA_FLUSH_MIN_CHARS = 24;
const SAFE_DELTA_BOUNDARY_RE = /[\s.,!?;:\n)]$/;
const PARAGRAPH_BOUNDARY_RE = /\n{2,}$/;
const HEARTBEAT_INTERVAL_MS = 20_000;

export interface SSEWriter {
  /** Send a text delta chunk to the client */
  sendDelta(content: string): void;
  /** Notify client that a tool is being executed (optional progress) */
  sendToolProgress(toolName: string, step?: string): void;
  /** Send final metadata and close the stream */
  sendMeta(meta: Record<string, unknown>): void;
  /** Send error and close the stream */
  sendError(message: string): void;
  /** The underlying ReadableStream to pass to Response */
  readonly stream: ReadableStream<Uint8Array>;
}

/**
 * Creates an SSE writer for streaming responses to the client.
 *
 * Usage:
 * ```ts
 * const sse = createSSEWriter();
 * // ... in async code:
 * sse.sendDelta("Hello ");
 * sse.sendDelta("world!");
 * sse.sendMeta({ inputMode: 'text', sessionId: '...' });
 * return new Response(sse.stream, { headers: SSE_HEADERS });
 * ```
 */
export function createSSEWriter(): SSEWriter {
  let controller: ReadableStreamDefaultController<Uint8Array>;
  let closed = false;
  let deltaBuffer = '';
  let lastDeltaFlushAt = Date.now();
  let deltaFlushTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
      heartbeatTimer = setInterval(() => {
        enqueueComment('hb');
      }, HEARTBEAT_INTERVAL_MS);
    },
    cancel() {
      closed = true;
      clearTimers();
    },
  });

  function clearTimers(): void {
    if (deltaFlushTimer !== null) {
      clearTimeout(deltaFlushTimer);
      deltaFlushTimer = null;
    }
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  }

  function enqueueData(data: string): void {
    if (closed) return;
    try {
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
    } catch {
      // Stream already closed by client disconnect
      closed = true;
      clearTimers();
    }
  }

  function enqueueComment(comment: string): void {
    if (closed) return;
    try {
      controller.enqueue(encoder.encode(`: ${comment}\n\n`));
    } catch {
      closed = true;
      clearTimers();
    }
  }

  function flushDeltaBuffer(): void {
    if (!deltaBuffer) return;
    const chunk = deltaBuffer;
    deltaBuffer = '';
    lastDeltaFlushAt = Date.now();
    if (deltaFlushTimer !== null) {
      clearTimeout(deltaFlushTimer);
      deltaFlushTimer = null;
    }
    enqueueData(JSON.stringify({ t: 'd', c: chunk }));
  }

  function scheduleDeltaFlush(): void {
    if (closed || deltaFlushTimer !== null) return;
    deltaFlushTimer = setTimeout(() => {
      deltaFlushTimer = null;
      flushDeltaBuffer();
    }, DELTA_FLUSH_INTERVAL_MS);
  }

  function close(): void {
    if (closed) return;
    flushDeltaBuffer();
    clearTimers();
    closed = true;
    try {
      controller.close();
    } catch {
      // Already closed
    }
  }

  return {
    stream,

    sendDelta(content: string) {
      if (!content) return;
      deltaBuffer += content;

      const now = Date.now();
      const hitLengthLimit = deltaBuffer.length >= DELTA_FLUSH_MAX_CHARS;
      const hitParagraphBoundary = PARAGRAPH_BOUNDARY_RE.test(deltaBuffer);
      const hitTimeLimit =
        now - lastDeltaFlushAt >= DELTA_FLUSH_INTERVAL_MS &&
        deltaBuffer.length >= DELTA_FLUSH_MIN_CHARS;
      const hitSafeBoundary =
        SAFE_DELTA_BOUNDARY_RE.test(deltaBuffer) &&
        deltaBuffer.length >= DELTA_FLUSH_MIN_CHARS;

      if (hitLengthLimit || hitParagraphBoundary || hitTimeLimit || hitSafeBoundary) {
        flushDeltaBuffer();
        return;
      }

      scheduleDeltaFlush();
    },

    sendToolProgress(toolName: string, step?: string) {
      flushDeltaBuffer();
      enqueueData(
        JSON.stringify({
          t: 'p',
          n: toolName,
          step: step || undefined,
        }),
      );
    },

    sendMeta(meta: Record<string, unknown>) {
      flushDeltaBuffer();
      enqueueData(JSON.stringify({ t: 'm', done: true, ...meta }));
      close();
    },

    sendError(message: string) {
      flushDeltaBuffer();
      enqueueData(JSON.stringify({ t: 'e', message }));
      close();
    },
  };
}

/** Standard headers for SSE responses */
export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no', // Disable Nginx buffering for SSE
} as const;
