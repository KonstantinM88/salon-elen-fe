# Изменения после последнего коммита

Дата фиксации отчёта: 2026-03-04  
Базовый коммит: `2ee0c50` (`ai bot V5.2 ai-analytics`)

## 1) Общая сводка по tracked-изменениям (`git diff`)

- `8` файлов изменено
- `213` вставок
- `831` удаление

### Deleted (удалены)

- `Downloads/PRISMA-AI-ANALYTICS.ts` (удалён, было `104` строки)
- `Downloads/ROUTE-ANALYTICS-PATCH.ts` (удалён, было `247` строк)
- `Downloads/ai-analytics-route.ts` (удалён, было `89` строк)
- `Downloads/ai-analytics.ts` (удалён, было `384` строки)

### Modified (изменены)

#### `src/app/admin/_components/AdminSidebarServer.tsx`
- Добавлен импорт `Bot` из `lucide-react`.
- В sidebar добавлен новый пункт:
  - Лейбл: `AI Ассистент`
  - URL: `/admin/ai`
  - Иконка: `Bot`
  - Тема: `violet`

#### `src/components/admin/AdminNav.tsx`
- Добавлен импорт `Bot`.
- В тип ключей меню добавлен новый ключ: `ai`.
- В `NAV_ALL` добавлен пункт `/admin/ai`.
- Добавлены локализованные подписи для `ai`:
  - `de`: `AI Assistent`
  - `ru`: `AI Ассистент`
  - `en`: `AI Assistant`
- Для роли `ADMIN` добавлена видимость пункта `ai`.
- В `COLORS` добавлена цветовая схема для `ai` (violet/indigo).

#### `src/lib/ai/ai-analytics.ts`
- В `trackRequestMetrics(...)` добавлен параметр `locale = 'de'`.
- Логика записи метрик изменена с `update` на `upsert`.
- Добавлено `create`-заполнение с базовыми метриками (messageCount, assistantMsgCount, gptCallCount, fastPathCount, toolCallCount, errorCount, retryCount, bookingCompleted, funnelStage и др.).
- Это устраняет race-condition, когда `update` вызывался до появления записи сессии.

#### `src/app/api/ai/chat/route.ts`
- Добавлен `isGreetingIntent(...)` для DE/RU/EN.
- Добавлен `buildGreetingText(...)` с дружелюбным текстом приветствия (DE/RU/EN) без перегрузки меню.
- Добавлена нормализация опечаток по языкам:
  - RU: `маинкюр -> маникюр`, `маникур -> маникюр`, `пермамент -> перманент` и т.д.
  - EN/DE: исправления частых опечаток в названиях услуг.
- Добавлен `extractServiceSelectionInput(...)`:
  - вырезает «служебные» фразы (`хочу записаться на ...`, `I want to book ...`, `ich möchte ... buchen ...`);
  - оставляет ядро выбора услуги;
  - применяет нормализацию опечаток.
- Улучшен fast-path выбора категории/услуги:
  - в `tryHandleCatalogSelectionFastPath(...)` добавлен `isBookingVerbGroupChoice`;
  - пользовательские фразы типа «хочу записаться на маникюр» корректно распознаются как прямой выбор.
- В ветке `booking-start` добавлена попытка прямого разрешения услуги до показа общего списка категорий.
- В `trackRequestMetrics(...)` теперь передаётся `session.locale`.
- Добавлен early fast-path `greeting`, если нет активного интерактивного flow.

## 2) Untracked (новые, ещё не закоммиченные)

### `src/app/admin/ai/page.tsx`
- Добавлена серверная страница `/admin/ai`.
- Реализован сбор данных AI-аналитики через Prisma:
  - текущий период + предыдущий период для сравнения;
  - агрегаты по локали, устройству, этапам воронки;
  - daily-разбивка;
  - консультационные темы;
  - список последних сессий.
- Добавлена локализация заголовка/подзаголовка для `de/ru/en`.
- Добавлен `days` фильтр периода (`1/7/14/30/90`) через query params.
- Подключён клиентский компонент `AiDashboardClient` внутри `Suspense`.

### `src/app/admin/ai/_components/AiDashboardClient.tsx`
- Добавлен client-side UI для AI Dashboard:
  - вкладки: `overview`, `sessions`, `funnel`, `quality`;
  - KPI карточки, тренды, распределения, таблица с фильтрами/сортировкой;
  - funnel-визуализация;
  - quality-метрики (ошибки, ретраи, latency tools, распределения по устройствам/локалям/темам).
- Добавлена мультиязычность интерфейса `de/ru/en` через объект `T`.
- Используются `framer-motion` анимации и `lucide-react` иконки.

### `Downloads/SIDEBAR-AI-NAV-PATCH.ts`
- Новый вспомогательный patch-файл с инструкциями:
  - добавить пункт AI в `AdminSidebarServer.tsx`;
  - опционально добавить AI в `AdminNav.tsx`;
  - описана структура `src/app/admin/ai/...`.

## 3) Текущий статус (`git status --short`)

- `D Downloads/PRISMA-AI-ANALYTICS.ts`
- `D Downloads/ROUTE-ANALYTICS-PATCH.ts`
- `D Downloads/ai-analytics-route.ts`
- `D Downloads/ai-analytics.ts`
- `M src/app/admin/_components/AdminSidebarServer.tsx`
- `M src/app/api/ai/chat/route.ts`
- `M src/components/admin/AdminNav.tsx`
- `M src/lib/ai/ai-analytics.ts`
- `?? Downloads/SIDEBAR-AI-NAV-PATCH.ts`
- `?? src/app/admin/ai/`

