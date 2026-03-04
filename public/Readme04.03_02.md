# Readme04.03_02

Дата: 04.03.2026  
База сравнения: последний коммит `HEAD` (`346245f`)  
Срез: все изменения в рабочем дереве после `HEAD` (tracked + untracked)

## 1) Полный список изменений после последнего коммита

### 1.1 Изменённые/удалённые tracked файлы

- `D Downloads/CHATWIDGET-STREAMING-PATCH.ts`
- `D Downloads/NGINX-SSE-CONFIG.conf`
- `D Downloads/ROUTE-STREAMING-PATCH.ts`
- `M src/app/api/ai/chat/route.ts`
- `M src/components/ai/ChatMessage.tsx`
- `M src/components/ai/ChatWidget.tsx`
- `M src/lib/ai/knowledge.ts`
- `M src/lib/ai/sse-stream.ts`
- `M src/lib/ai/tools/list-services.ts`

### 1.2 Новые untracked файлы

- `Downloads/CHATWIDGET-ERROR-RECOVERY-PATCH.ts`
- `Downloads/ROUTE-ERROR-RECOVERY-PATCH.ts`
- `public/Readme04.03_01.md`
- `src/lib/ai/resilience.ts`

### 1.3 Статистика tracked-изменений (`git diff --stat HEAD`)

```txt
 Downloads/CHATWIDGET-STREAMING-PATCH.ts | 303 -------------
 Downloads/NGINX-SSE-CONFIG.conf         |  56 ---
 Downloads/ROUTE-STREAMING-PATCH.ts      | 311 --------------
 src/app/api/ai/chat/route.ts            | 729 ++++++++++++++++++++++++++++----
 src/components/ai/ChatMessage.tsx       |  29 +-
 src/components/ai/ChatWidget.tsx        | 176 +++++++-
 src/lib/ai/knowledge.ts                 |  90 +++-
 src/lib/ai/sse-stream.ts                |  20 +-
 src/lib/ai/tools/list-services.ts       | 109 ++++-
 9 files changed, 1043 insertions(+), 780 deletions(-)
```

## 2) Детализация по каждому изменённому файлу

### `src/lib/ai/resilience.ts` (новый файл)

Добавлен модуль устойчивости AI:

- `classifyError(...)` — классификация ошибок (rate limit, timeout, overloaded, auth, network, internal).
- `withRetry(...)` — retry с exponential backoff + jitter и поддержкой `AbortSignal`.
- `createTimeout(...)` — timeout для отдельного запроса.
- `createLoopTimeout(...)` — timeout на весь GPT/tool loop.
- `buildErrorText(...)` — локализованные тексты ошибок для пользователя.
- `buildToolFallbackText(...)` — graceful fallback-ответ на базе уже выполненных tool-результатов.

### `src/app/api/ai/chat/route.ts` (M)

Крупный пакет изменений:

- Подключен resilience-слой:
  - `withRetry`, `createLoopTimeout`, `classifyError`, `buildErrorText`, `buildToolFallbackText`.
- В `ChatRequest` добавлено поле `forceGpt?: boolean`.
- Добавлен принудительный обход fastpath:
  - `forceGpt` из body или заголовка `x-ai-force-gpt: 1`.
- Улучшена консультационная логика:
  - инфо-запросы по теме (например PMU) автозапускают консультацию, а не бронирование;
  - предотвращён преждевременный автопереход к конкретной услуге при общих вопросах.
- Добавлена/расширена обработка “кому подходит”:
  - в консультации,
  - в режиме `awaitingConsultationBookingConfirmation`,
  - в booking-flow для уже выбранной услуги.
- Добавлена технико-специфичная обработка PMU safety/побочек:
  - `buildKnowledgePmuTechniqueSafetyText(...)`,
  - отдельные fastpath-ветки:
    - `consultation-technique-safety`
    - `consultation-technique-safety-awaiting-confirm`.
- Улучшена валидация даты `DD.MM`:
  - строгая проверка границ день/месяц.
- Из reset-intent убран триггер `сначала`, чтобы не было ложных сбросов в главное меню.
- SSE/tool-loop:
  - добавлен loop-timeout и контроль выхода,
  - повторные GPT-вызовы обёрнуты в retry,
  - отправка progress-событий для tool-вызовов,
  - сбор tool-результатов для fallback.
- Обновлена обработка ошибок:
  - классификация ошибок,
  - fallback-ответ при частично выполненных tool calls,
  - в JSON-ошибках возвращаются `category` и `retryable`,
  - для SSE отправляется корректный деградированный ответ/ошибка.

### `src/lib/ai/knowledge.ts` (M)

- Расширен intent `isKnowledgePmuHealingIntent(...)`:
  - RU: ключи побочек/осложнений/противопоказаний/безопасности,
  - EN/DE: side effects, contraindications, risks, safety.
- В `buildKnowledgePmuHealingText(...)` добавлен отдельный блок про временные нормальные реакции после PMU.
- Добавлена новая функция:
  - `buildKnowledgePmuTechniqueSafetyText(locale, technique)` с отдельными ответами по техникам PMU (`powder_brows`, `hairstroke_brows`, `aquarell_lips`, `lips_3d`, `lashline`, `upper_lower`) для RU/EN/DE.

### `src/lib/ai/tools/list-services.ts` (M)

- Добавлена эвристическая локализация названий услуг (`getHeuristicLocalizedName`):
  - особенно для PMU/межреснички/hydrafacial/brows-lashes.
- `getLocalizedName(...)` теперь учитывает locale и fallback-эвристику, если перевода нет.
- `getLocalizedDescription(...)`:
  - для `ru/en` больше не подмешивает дефолтное DE-описание (чтобы избежать “языковой протечки”),
  - для `de` остаётся fallback на `row.description`.

### `src/lib/ai/sse-stream.ts` (M)

Изменено чанкирование SSE-дельт:

- `DELTA_FLUSH_INTERVAL_MS`: `60 -> 75`.
- `DELTA_FLUSH_MAX_CHARS`: `48 -> 72`.
- Добавлен `DELTA_FLUSH_MIN_CHARS = 24`.
- Добавлены безопасные границы flush:
  - `SAFE_DELTA_BOUNDARY_RE`,
  - `PARAGRAPH_BOUNDARY_RE`.

Итог: поток остаётся “живым”, но визуально приходит более крупными, стабильными кусками.

### `src/components/ai/ChatWidget.tsx` (M)

- Добавлены локализации:
  - `retry`, `offline`, `reconnecting` для `de/ru/en`.
- Добавлено состояние сети `isOffline` и listeners `online/offline`.
- В SSE-обработке добавлен timeout тишины потока (`35s`):
  - при timeout сообщение помечается как ошибка с `retryPayload`.
- Обработка heartbeat/comment lines (`:`) в SSE.
- Добавлен retry-поток на клиенте:
  - сохранение `lastUserMessageRef`,
  - `handleRetry(...)` для повторной отправки.
- Улучшена обработка non-OK API ответов:
  - чтение `error` и `retryable` из JSON.
- В офлайне:
  - показывается banner,
  - блокируются send/input/voice/OTP отправки.
- В `ChatMessage` передаются `onRetry` и `retryLabel`.

### `src/components/ai/ChatMessage.tsx` (M)

- В `Message` добавлено поле `retryPayload?: string`.
- В пропсы добавлено:
  - `onRetry?: (retryPayload: string, messageId: string) => void`,
  - `retryLabel?: string`.
- Добавлена кнопка retry для error-сообщений:
  - иконка `RotateCcw`,
  - рендер только если есть `isError` + `retryPayload` + `onRetry`.

### `Downloads/*` (D и ??)

- Удалены старые streaming-патчи:
  - `CHATWIDGET-STREAMING-PATCH.ts`
  - `ROUTE-STREAMING-PATCH.ts`
  - `NGINX-SSE-CONFIG.conf`
- Добавлены новые error-recovery патчи:
  - `CHATWIDGET-ERROR-RECOVERY-PATCH.ts`
  - `ROUTE-ERROR-RECOVERY-PATCH.ts`

### `public/Readme04.03_01.md` (новый, untracked)

- Добавлен предыдущий отчёт по изменениям.

## 3) Итог

После последнего коммита изменения покрывают:

- устойчивость AI backend (retry/timeout/fallback/error classification),
- улучшенную консультационную логику PMU (без автопрыжка в booking),
- технико-специфичные ответы по побочным эффектам и suitability,
- сглаженное SSE-стриминг-поведение,
- улучшенный UX виджета при ошибках и офлайн-сценариях,
- обновление набора вспомогательных patch-файлов в `Downloads`.
