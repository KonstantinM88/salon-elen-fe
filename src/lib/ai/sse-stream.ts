// src/lib/ai/sse-stream.ts
//
// Server-side SSE (Server-Sent Events) helpers for streaming AI responses.
//
// Protocol:
//   data: {"t":"d","c":"chunk text"}\n\n          — text delta
//   data: {"t":"p","n":"tool_name"}\n\n           — tool progress indicator
//   data: {"t":"m","inputMode":"text",...}\n\n     — metadata (final event)
//   data: {"t":"e","message":"error msg"}\n\n      — error

const encoder = new TextEncoder();

export interface SSEWriter {
  /** Send a text delta chunk to the client */
  sendDelta(content: string): void;
  /** Notify client that a tool is being executed (optional progress) */
  sendToolProgress(toolName: string): void;
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

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
    cancel() {
      closed = true;
    },
  });

  function enqueue(data: string): void {
    if (closed) return;
    try {
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));
    } catch {
      // Stream already closed by client disconnect
      closed = true;
    }
  }

  function close(): void {
    if (closed) return;
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
      enqueue(JSON.stringify({ t: 'd', c: content }));
    },

    sendToolProgress(toolName: string) {
      enqueue(JSON.stringify({ t: 'p', n: toolName }));
    },

    sendMeta(meta: Record<string, unknown>) {
      enqueue(JSON.stringify({ t: 'm', ...meta }));
      close();
    },

    sendError(message: string) {
      enqueue(JSON.stringify({ t: 'e', message }));
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