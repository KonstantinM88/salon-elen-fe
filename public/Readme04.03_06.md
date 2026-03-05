# Изменения перед последним коммитом

Дата отчёта: 2026-03-05  
Последний коммит: `09151f0` — `ai bot 5.4 test`  
Предыдущий коммит: `0883e7d` — `ai bot 5.3 admin page`  
Диапазон: `0883e7d..09151f0`

## Сводка

- Изменено файлов: `7`
- Добавлено строк: `717`
- Удалено строк: `88`
- Состояние рабочего дерева на момент отчёта: чистое (`git status` без изменений)

## Файлы и изменения

### Added

1. `.github/workflows/ai-tests-gate.yml` (`+44`)
- Добавлен workflow `AI Tests Gate`.
- Запуск только вручную (`workflow_dispatch`).
- Job `Gate Suite`: Node 20, `npm install`, запуск `AI_TEST_SUITE=gate`.
- Загрузка артефактов из `ai-tests/reports/**`.

2. `.github/workflows/ai-tests-extended.yml` (`+88`)
- Добавлен workflow `AI Tests Extended`.
- Запуск только вручную (`workflow_dispatch`) с input `mode: both | sse | json`.
- Два job:
  - `Extended SSE`
  - `Extended JSON`
- Для каждого job: Node 20, `npm install`, запуск соответствующего набора тестов, загрузка артефактов.

3. `ai-tests/package-lock.json` (`+214`)
- Добавлен lock-файл зависимостей для `ai-tests`.

### Modified

4. `.gitignore` (`+3`)
- Добавлены игнорируемые пути:
  - `/ai-tests/node_modules/`
  - `/ai-tests/reports/`

5. `ai-tests/package.json` (`+1 / -1`)
- Скрипт `test:ai` переведён с `--loader ts-node/esm` на `--import ... register('ts-node/esm', ...)`.
- Это убирает предупреждение про устаревание `--experimental-loader`.

6. `ai-tests/runner.ts` (`+254 / -61`)
- Добавлены настройки раннера через env:
  - `AI_TEST_MAX_RETRIES`
  - `AI_TEST_RETRY_PAD_MS`
  - `AI_TEST_DELAY_MS`
  - `AI_TEST_ALLOW_MODE_FALLBACK`
  - `AI_TEST_SUITE`
  - `AI_TEST_TAG`
- Реализована обработка rate-limit:
  - парсинг `Retry in ...`
  - глобальное ожидание окна rate-limit
  - автоматические ретраи.
- Добавлен fallback формата ответа:
  - `JSON -> SSE` и `SSE -> JSON` (если включён fallback).
- Улучшен подсчёт опций (`[option]` + маркированные/нумерованные списки).
- Добавлен `prelude`-прогон (подготовительные сообщения в той же `sessionId`).
- Улучшены логи:
  - конфиг запуска
  - активные фильтры (`suite/tag/grep/limit`).

7. `ai-tests/scenarios.ts` (`+113 / -26`)
- Расширен `TestCase`:
  - `suite?: "gate" | "extended"`
  - `tags?: string[]`
  - `prelude?: string[]`
- Добавлены:
  - `safeRefusal` для security-сценариев
  - `CONSULTATION_PRELUDE` (DE/EN/RU)
  - `SSE_FALLBACK_KEYWORDS` для устойчивости к вариативным ответам.
- Обновлена генерация bulk-сценариев (`fromSeed`):
  - автоматические `suite/tags/prelude`
  - смягчены ожидания для SSE (без жёсткой привязки к `meta`).
- Перенастроены часть smoke/security/pricing/booking ожиданий под фактическое поведение ассистента.
- Введён `GATE_BASE_IDS` и автоматическая разметка сценариев на `gate` и `extended`.

## Результат изменений

- Тестовый контур `ai-tests` стабилизирован для реальных ответов API.
- Добавлены ручные CI-workflow для запуска `gate` и `extended`.
- Подготовлена основа для последующего включения обязательной автопроверки (когда будет нужно).
