// ═══════════════════════════════════════════════════════════════
// ChatWidget.tsx — SSE STREAMING PATCH
// ═══════════════════════════════════════════════════════════════
//
// Replace the `sendMessage` function (lines ~237-304) with this version.
// The rest of ChatWidget stays unchanged.
//
// ═══════════════════════════════════════════════════════════════

// ─── ADD: New ref for tracking streaming message ID ─────────
//
// Add near the other refs (line ~173):
//
//   const streamingMsgIdRef = useRef<string | null>(null);

// ─── REPLACE: sendMessage function ──────────────────────────

/*
  const sendMessage = useCallback(
    async (text: string) => {
      setIsLoading(true);

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            message: text,
            locale,
            stream: true, // ← Request SSE streaming
          }),
        });

        if (res.status === 429) {
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: t.rateLimit,
              timestamp: new Date(),
            },
          ]);
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const contentType = res.headers.get('content-type') || '';

        // ── SSE streaming response (GPT path) ──────────────
        if (contentType.includes('text/event-stream')) {
          await handleSSEResponse(res);
          return;
        }

        // ── JSON response (fast-path) ──────────────────────
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.text,
            timestamp: new Date(),
          },
        ]);

        if (data.inputMode === 'otp') {
          setInputMode('otp');
        } else if (data.inputMode === 'text' || inputMode === 'otp') {
          setInputMode('text');
        }
      } catch (err) {
        console.error('[ChatWidget] Error:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: t.error,
            timestamp: new Date(),
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
        streamingMsgIdRef.current = null;
      }
    },
    [sessionId, locale, t, inputMode],
  );
*/

// ─── ADD: handleSSEResponse helper (inside the component) ───
//
// Add this right before `sendMessage`, or as a nested function
// inside `sendMessage`. Both work.

/*
  /**
   * Process an SSE streaming response from the server.
   * Creates a message placeholder and appends text chunks in real-time.
   *\/
  async function handleSSEResponse(res: Response): Promise<void> {
    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('No response body for SSE');
    }

    const decoder = new TextDecoder();
    const msgId = `ai-stream-${Date.now()}`;
    streamingMsgIdRef.current = msgId;
    let accumulated = '';

    // Create empty streaming message
    setMessages((prev) => [
      ...prev,
      {
        id: msgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    // We're now "streaming" — hide the typing indicator
    setIsLoading(false);

    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6); // Remove "data: " prefix
          if (!jsonStr.trim()) continue;

          try {
            const event = JSON.parse(jsonStr);

            switch (event.t) {
              case 'd': {
                // Text delta — append to message
                accumulated += event.c;
                const current = accumulated; // Capture for closure
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === msgId ? { ...msg, content: current } : msg,
                  ),
                );
                break;
              }

              case 'p': {
                // Tool progress — could show indicator
                // For now, just log it
                console.log(`[ChatWidget] Tool: ${event.n}`);
                break;
              }

              case 'm': {
                // Metadata (final event) — update inputMode etc.
                if (event.inputMode === 'otp') {
                  setInputMode('otp');
                } else if (event.inputMode === 'text') {
                  setInputMode('text');
                }
                break;
              }

              case 'e': {
                // Error event
                console.error('[ChatWidget] SSE error:', event.message);
                if (accumulated === '') {
                  // No text was streamed yet — replace with error
                  const errorText = event.message || t.error;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === msgId
                        ? { ...msg, content: errorText, isError: true }
                        : msg,
                    ),
                  );
                }
                break;
              }
            }
          } catch {
            // Malformed JSON — skip
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // If stream ended without any text, show fallback
    if (accumulated === '') {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, content: t.error, isError: true } : msg,
        ),
      );
    }
  }
*/


// ═══════════════════════════════════════════════════════════════
// HOW IT WORKS:
//
// 1. Client sends POST with `stream: true`
//
// 2. Server returns either:
//    a) JSON (fast-path) → handled as before
//    b) SSE stream (GPT path) → handled by handleSSEResponse
//
// 3. SSE handling:
//    - Creates empty message immediately (user sees message bubble appear)
//    - As text deltas arrive, updates the message content in real-time
//    - Tool progress events logged (could show "Searching availability...")
//    - Metadata event at the end sets inputMode (OTP switch etc.)
//
// 4. The `isLoading` state:
//    - Set to true at start of sendMessage (shows typing dots)
//    - Set to false WHEN first delta arrives (streaming bubble replaces dots)
//    - For JSON responses: set to false after response is processed
//
// ═══════════════════════════════════════════════════════════════
//
// OPTIONAL ENHANCEMENT: Tool progress UI
//
// When event.t === 'p' arrives, you could show a subtle indicator
// in the streaming message. For example:
//
//   case 'p': {
//     const toolLabel = {
//       search_availability: locale === 'ru' ? '🔍 Ищу свободное время...' : '🔍 Suche Verfügbarkeit...',
//       list_services: locale === 'ru' ? '📋 Загружаю услуги...' : '📋 Lade Leistungen...',
//       reserve_slot: locale === 'ru' ? '📅 Бронирую...' : '📅 Reserviere...',
//     }[event.n] || '';
//
//     if (toolLabel) {
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg.id === msgId ? { ...msg, content: toolLabel } : msg,
//         ),
//       );
//     }
//     break;
//   }
//
// This shows "🔍 Searching availability..." while tools run,
// then gets replaced by the actual GPT text when it starts streaming.
//
// ═══════════════════════════════════════════════════════════════
//
// VOICE ROUTE:
//
// The voice route (/api/ai/voice) calls /api/ai/chat internally via fetch.
// It should NOT send stream: true because:
// - It needs the complete text to return to the client
// - STT already adds latency, streaming doesn't help much
// - The voice ChatWidget handler expects a JSON response
//
// No changes needed to voice/route.ts.
//
// ═══════════════════════════════════════════════════════════════
//
// NGINX CONFIGURATION:
//
// SSE requires that Nginx does NOT buffer the response.
// The server sends `X-Accel-Buffering: no` header, but you should
// also verify the Nginx proxy config has:
//
//   proxy_buffering off;
//
// Or per-location:
//   location /api/ai/chat {
//     proxy_pass ...;
//     proxy_buffering off;
//     proxy_cache off;
//     proxy_set_header Connection '';
//     proxy_http_version 1.1;
//     chunked_transfer_encoding off;
//   }
//
// ═══════════════════════════════════════════════════════════════
