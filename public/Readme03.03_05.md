# Readme03.03_05

Отчёт по изменениям **после последнего коммита**.

- Базовый коммит: `393ee0b`
- Дата отчёта: `2026-03-03`
- Изменённые файлы:  
  `src/lib/ai/sse-stream.ts`  
  `src/app/api/ai/chat/route.ts`  
  `src/components/ai/ChatWidget.tsx`

## 1) `src/lib/ai/sse-stream.ts`

Сделаны улучшения SSE-потока:

- Расширен протокол событий:
  - `p` теперь поддерживает `step` (`{ t: "p", n: "...", step: "..." }`).
  - `m` теперь явно помечает завершение (`done: true`).
  - Добавлен heartbeat-комментарий `: hb`.
- Добавлены константы для буферизации и heartbeat:
  - `DELTA_FLUSH_INTERVAL_MS = 60`
  - `DELTA_FLUSH_MAX_CHARS = 48`
  - `HEARTBEAT_INTERVAL_MS = 20000`
- `sendToolProgress` обновлён: принимает `toolName` и опционально `step`.
- Реализована буферизация дельт текста:
  - накопление в `deltaBuffer`
  - flush по длине, времени или «безопасной границе» текста
  - отложенный flush через таймер
- Добавлена отправка heartbeat во время открытого SSE-стрима.
- Перед `sendMeta` и `sendError` теперь делается принудительный `flushDeltaBuffer()`.
- Добавлена корректная очистка таймеров (`deltaFlushTimer`, `heartbeatTimer`) при cancel/close/error.
- `sendMeta` теперь отправляет `{ t: "m", done: true, ...meta }`.

## 2) `src/app/api/ai/chat/route.ts`

Сделаны улучшения сервера для progress-событий и финальной мета-информации:

- Добавлена функция `mapToolNameToProgressStep(toolName)`, которая маппит tool calls в унифицированные шаги:
  - `list_services` -> `loading_services`
  - `list_masters_for_services` -> `loading_masters`
  - `search_availability` / `search_availability_month` -> `searching_slots`
  - `reserve_slot` -> `reserving_slot`
  - `create_draft` -> `creating_draft`
  - `start_verification` -> `sending_otp`
  - `complete_booking` -> `confirming_booking`
  - fallback -> `tool:<toolName>`
- В SSE-ветке отправки прогресса:
  - было: `sse.sendToolProgress(call.name)`
  - стало: `sse.sendToolProgress(call.name, mapToolNameToProgressStep(call.name))`
- Добавлен `assistantMessageId` перед финальным ответом ассистента.
- В финальное SSE meta-сообщение добавлен `messageId`.

## 3) `src/components/ai/ChatWidget.tsx`

Сделаны клиентские улучшения streaming UX и progress UX:

- Добавлена локализация подписей progress-статусов:
  - функция `getStreamProgressLabel(locale, step?, toolName?)`
  - языки: `ru`, `de`, `en`
- Добавлен state:
  - `streamProgress: string | null`
- Добавлена UI-плашка progress под сообщениями при стриминге:
  - отображается когда `!isLoading && streamProgress`
- Улучшен парсер SSE-событий:
  - обрабатываются `step` и `done` в событиях.
- Добавлена RAF-буферизация текстовых дельт:
  - накопление в `pendingDelta`
  - обновление сообщения через `requestAnimationFrame`
  - принудительный flush в мета/ошибке/finally
- Добавлен контроль пустого результата:
  - fallback на ошибку только если `!accumulated && !sawMetaDone`

Отдельно сделан точечный фикс плавности progress-строки:

- Добавлена константа:
  - `STREAM_PROGRESS_MIN_UPDATE_MS = 250`
- Добавлены refs для троттлинга:
  - `progressTimerRef`
  - `pendingProgressRef`
  - `lastProgressAtRef`
- Добавлены helper’ы:
  - `clearProgressTimer()`
  - `setStreamProgressSmooth(next, { immediate? })`
- `p`-события теперь обновляют progress через `setStreamProgressSmooth(label)`.
- В терминальных местах (`m`, `e`, `finally`, `new chat`, начало/конец `sendMessage`) используется мгновенный сброс:
  - `setStreamProgressSmooth(null, { immediate: true })`
- Добавлен cleanup таймера progress при unmount.

## Проверка

- Локально выполнена проверка типов:
  - `npm run -s typecheck` (успешно)
