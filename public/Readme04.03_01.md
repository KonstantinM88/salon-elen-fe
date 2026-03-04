# Readme04.03_01

Дата: 04.03.2026  
Контекст: изменения в рабочем дереве после последнего коммита (`HEAD`).

## 1) Сводка по git

Текущий статус (`git status --short`):

```txt
 D Downloads/CHATWIDGET-STREAMING-PATCH.ts
 D Downloads/NGINX-SSE-CONFIG.conf
 D Downloads/ROUTE-STREAMING-PATCH.ts
 M src/app/api/ai/chat/route.ts
 M src/components/ai/ChatMessage.tsx
 M src/components/ai/ChatWidget.tsx
 M src/lib/ai/sse-stream.ts
?? Downloads/CHATWIDGET-ERROR-RECOVERY-PATCH.ts
?? Downloads/ROUTE-ERROR-RECOVERY-PATCH.ts
?? src/lib/ai/resilience.ts
```

Статистика изменений (`git diff --stat HEAD`):

```txt
 Downloads/CHATWIDGET-STREAMING-PATCH.ts | 303 -------------------------------
 Downloads/NGINX-SSE-CONFIG.conf         |  56 ------
 Downloads/ROUTE-STREAMING-PATCH.ts      | 311 --------------------------------
 src/app/api/ai/chat/route.ts            | 250 ++++++++++++++++++-------
 src/components/ai/ChatMessage.tsx       |  29 ++-
 src/components/ai/ChatWidget.tsx        | 176 ++++++++++++++++--
 src/lib/ai/sse-stream.ts                |  20 +-
 7 files changed, 396 insertions(+), 749 deletions(-)
```

Построчно (`git diff --numstat HEAD`):

```txt
0   303 Downloads/CHATWIDGET-STREAMING-PATCH.ts
0   56  Downloads/NGINX-SSE-CONFIG.conf
0   311 Downloads/ROUTE-STREAMING-PATCH.ts
189 61  src/app/api/ai/chat/route.ts
28  1   src/components/ai/ChatMessage.tsx
165 11  src/components/ai/ChatWidget.tsx
14  6   src/lib/ai/sse-stream.ts
```

## 2) Детализация изменений

### `src/app/api/ai/chat/route.ts` (M, +189/-61)

Ключевые изменения:

1. Добавлен `forceGpt` в `ChatRequest` и поддержка принудительного обхода fastpath:
   - `forceGpt` из body или заголовка `x-ai-force-gpt: 1` (`~2715`).
   - Fastpath-блок обёрнут в `if (!forceGpt) { ... }`.
2. Подключён слой устойчивости из `src/lib/ai/resilience.ts`:
   - `withRetry`, `createLoopTimeout`, `classifyError`, `buildErrorText`, `buildToolFallbackText`.
3. Добавлен loop timeout:
   - `const loopTimeout = createLoopTimeout();` (`~4551`).
   - Проверка `loopTimeout.isExpired()` перед следующими GPT-вызовами.
   - Очистка в `finally`: `loopTimeout.clear();` (`~5600`).
4. GPT-вызовы (обычные и SSE) обёрнуты в `withRetry(...)`:
   - первый вызов,
   - повторные в tool-loop,
   - forced final reply (`tool_choice: 'none'`).
5. В потоковой ветке добавлен progress-сигнал по инструментам:
   - `sse.sendToolProgress(call.name, mapToolNameToProgressStep(call.name));` (`~4788`).
6. Для graceful fallback собираются результаты tool calls:
   - `collectedToolResults.push(...)` (`~5118`).
7. Обновлён catch-блок:
   - Классификация ошибок (`classifyError`).
   - Попытка вернуть ответ на основе уже выполненных tools (`buildToolFallbackText`).
   - SSE-degraded meta (`degraded: true`) при fallback.
   - Для JSON-ответа добавлены поля `category` и `retryable`.

### `src/components/ai/ChatWidget.tsx` (M, +165/-11)

Ключевые изменения:

1. Расширены локализованные тексты:
   - `retry`, `offline`, `reconnecting` для `de/ru/en`.
2. Добавлено состояние сети:
   - `isOffline` + `online/offline` listeners.
3. Добавлен контроль SSE inactivity timeout:
   - `SSE_TIMEOUT_MS = 35000`,
   - перезапуск таймера на каждом chunk/event,
   - `reader.cancel()` при таймауте.
4. Добавлена обработка heartbeat-комментариев SSE (`line.startsWith(':')`).
5. Добавлена retry-механика:
   - `retryPayload` для ошибок,
   - `handleRetry(...)` с повторной отправкой сообщения.
6. Улучшена обработка ошибок API:
   - парсинг `error/retryable` из не-OK JSON ответа.
7. UX офлайн-режима:
   - предупреждающий banner `t.offline`,
   - блокировка send/input/voice/OTP при `isOffline`.

### `src/components/ai/ChatMessage.tsx` (M, +28/-1)

Ключевые изменения:

1. В `Message` добавлено поле `retryPayload?: string`.
2. В пропсах добавлены:
   - `onRetry?: (retryPayload: string, messageId: string) => void`,
   - `retryLabel?: string`.
3. Добавлена кнопка retry в error-сообщениях:
   - иконка `RotateCcw` (`lucide-react`),
   - показ только если `message.isError && message.retryPayload && onRetry`.

### `src/lib/ai/sse-stream.ts` (M, +14/-6)

Тюнинг чанкования SSE-дельт:

1. Параметры буферизации изменены:
   - `DELTA_FLUSH_INTERVAL_MS: 60 -> 75`,
   - `DELTA_FLUSH_MAX_CHARS: 48 -> 72`,
   - добавлен `DELTA_FLUSH_MIN_CHARS = 24`.
2. Добавлены регулярки безопасных границ:
   - `SAFE_DELTA_BOUNDARY_RE`,
   - `PARAGRAPH_BOUNDARY_RE`.
3. Flush теперь срабатывает не на каждый пробел/знак, а при достаточном накоплении буфера или явной границе абзаца.

Цель: сделать поток визуально стабильнее и уменьшить «дробление» текста на микро-чанки.

### `src/lib/ai/resilience.ts` (новый файл, untracked)

Добавлен новый модуль устойчивости:

1. Классификация ошибок OpenAI/сети/таймаутов (`classifyError`).
2. Ретраи с экспоненциальным backoff и jitter (`withRetry`).
3. Таймауты:
   - per-call timeout (`createTimeout`),
   - loop timeout (`createLoopTimeout`).
4. Локализованные пользовательские тексты ошибок (`buildErrorText`).
5. Graceful fallback на базе tool-результатов (`buildToolFallbackText`).

### `Downloads` (служебные patch-файлы)

Удалены:

1. `Downloads/CHATWIDGET-STREAMING-PATCH.ts`
2. `Downloads/ROUTE-STREAMING-PATCH.ts`
3. `Downloads/NGINX-SSE-CONFIG.conf`

Добавлены (untracked):

1. `Downloads/CHATWIDGET-ERROR-RECOVERY-PATCH.ts`
2. `Downloads/ROUTE-ERROR-RECOVERY-PATCH.ts`

## 3) Итог

После последнего коммита в проекте:

1. Усилен backend AI-роут (`route.ts`) в части retry/timeout/fallback/error-classification.
2. Усилен frontend-виджет (`ChatWidget.tsx`, `ChatMessage.tsx`) в части offline и retry UX.
3. Улучшено SSE-чанкование (`sse-stream.ts`) для более плавного стрима.
4. Добавлен отдельный модуль устойчивости (`resilience.ts`).
5. Обновлены/заменены рабочие patch-файлы в `Downloads`.

