# Readme03.03_03

Сводка всех изменений в рабочем дереве **после последнего коммита** (по `git status` / `git diff` на текущий момент).

## 1) Статус изменений

### Изменённые tracked-файлы
- `src/app/api/ai/chat/route.ts`
- `src/components/ai/ChatMessage.tsx`
- `src/components/ai/ChatWidget.tsx`

### Новые untracked-файлы/папки
- `src/lib/ai/sse-stream.ts`
- `src/lib/ai/streaming-gpt.ts`
- `Downloads/CHATWIDGET-STREAMING-PATCH.ts`
- `Downloads/ROUTE-STREAMING-PATCH.ts`
- `Downloads/NGINX-SSE-CONFIG.conf`

### Размер diff (tracked)
- `src/app/api/ai/chat/route.ts` — `+197 / -?` (в составе общей статистики ниже)
- `src/components/ai/ChatMessage.tsx` — `+280 / -?`
- `src/components/ai/ChatWidget.tsx` — `+1134 / -?`
- Итого по tracked: **1565 insertions, 46 deletions**

## 2) Детализация по файлам

### `src/components/ai/ChatWidget.tsx`
- Добавлена клиентская обработка SSE-ответа:
  - `handleSSEResponse` (`~360`)
  - потоковый парсинг `data:` событий `d/p/m/e`
  - обновление одного assistant-сообщения по мере прихода дельт
- Добавлен ref для текущего stream-сообщения:
  - `streamingMsgIdRef` (`~173`)
- `sendMessage` переведён на запрос со streaming-флагом:
  - `stream: true` в body (`~487`)
  - ветка `content-type: text/event-stream` (`~509`)
  - fallback на JSON сохранён
- В файле также присутствуют крупные изменения по визуальной теме/вариантам (светлая тема и дополнительные блоки/комментарии с версиями).

### `src/app/api/ai/chat/route.ts`
- Подключена серверная SSE-инфраструктура:
  - `createSSEWriter`, `SSE_HEADERS` из `sse-stream.ts`
  - `streamingGptCall`, `toolCallsToMessage` из `streaming-gpt.ts`
- Расширен контракт запроса:
  - в `ChatRequest` добавлен `stream?: boolean`
  - из body читается `stream: wantStream` (`~2653`)
- Добавлен переключатель режимов:
  - `useSSE = wantStream === true && !isVoiceTurn` (`~4483`)
- GPT-loop адаптирован для двух режимов:
  - non-streaming (старый JSON-путь)
  - streaming через `streamingGptCall` (SSE-путь)
- Для streaming-режима добавлены:
  - отправка прогресса tool calls: `sse.sendToolProgress(...)` (`~4701`)
  - финальная мета: `sse.sendMeta(...)` (`~5388`)
  - обработка ошибки: `sse.sendError(...)` (`~5413`)

### `src/components/ai/ChatMessage.tsx`
- Большие изменения визуального слоя под светлую тему:
  - обновлён стиль сообщений/опций
  - добавлены декоративные анимации/эффекты (например `ph-shimmer`)
- Расширен парсинг опций:
  - `parseOptionUrl(...)` (безопасная обработка `url` в `[option ...]`)
  - `stripEmoji(...)` для нормализации текста опций
- В файле также есть дополнительные закомментированные вариации реализации (Version 1.0 / 2.0 блоки).

## 3) Новые файлы (untracked)

### `src/lib/ai/sse-stream.ts`
- Добавлен helper для SSE-стрима с протоколом событий:
  - `d` — delta текста
  - `p` — прогресс инструмента
  - `m` — метаданные
  - `e` — ошибка
- Экспортируются `createSSEWriter()` и `SSE_HEADERS`.

### `src/lib/ai/streaming-gpt.ts`
- Добавлен streaming-обработчик для OpenAI:
  - `streamingGptCall(...)`
  - аккумулирование tool-calls из stream-дельт
  - отправка текстовых дельт в SSE
- Добавлен адаптер:
  - `toolCallsToMessage(...)` для возврата tool-calls в формат истории сообщений.

### `Downloads/*`
- Добавлены рабочие патч-файлы и пример nginx-конфига для SSE:
  - `CHATWIDGET-STREAMING-PATCH.ts`
  - `ROUTE-STREAMING-PATCH.ts`
  - `NGINX-SSE-CONFIG.conf`

## 4) Примечание

Этот файл фиксирует состояние **до нового коммита**.  
Если нужно, следующим шагом можно сделать `Readme03.03_03.md` в формате changelog по коммитам (с разбивкой: feature/fix/refactor/docs).
