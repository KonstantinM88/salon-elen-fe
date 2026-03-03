# Readme03.03_01

Отчет по изменениям после последнего коммита (`HEAD`) на текущий момент.

## Измененные файлы (после `HEAD`)

### Modified (tracked)
1. `src/app/api/ai/chat/route.ts`
2. `src/app/api/ai/voice/route.ts`
3. `src/components/ai/ChatWidget.tsx`
4. `src/lib/ai/session-store.ts`
5. `src/lib/ai/system-prompt.ts`

### New (untracked)
1. `src/lib/ai/knowledge.ts`
2. `src/lib/ai/recommendation-engine.ts`
3. `public/Readme03.03_01.md`

## Краткая статистика (`git diff --numstat HEAD`)

- `src/app/api/ai/chat/route.ts`: `+967 / -11`
- `src/app/api/ai/voice/route.ts`: `+3 / -1`
- `src/components/ai/ChatWidget.tsx`: `+3 / -3`
- `src/lib/ai/session-store.ts`: `+14 / -0`
- `src/lib/ai/system-prompt.ts`: `+171 / -383`

Итог по tracked-файлам:
- `1158 insertions(+), 398 deletions(-)`

## Что сделано по файлам

### `src/app/api/ai/chat/route.ts`
- Существенно расширена fastpath-логика для консультационного сценария.
- Добавлен устойчивый переход `консультация -> подтверждение -> запись` без потери контекста.
- Добавлены ветки `consultation-*` (topic/style/technique/healing/booking-confirm/booking-decline и др.).
- Добавлена обработка смены услуги в активном флоу с корректным сбросом промежуточного состояния.
- Усилена телеметрия в логах (`fastpath=*`) для диагностики.

### `src/app/api/ai/voice/route.ts`
- Подключен детектор консультационного интента `isConsultationIntentByKnowledge`.
- В STT-лог добавлен флаг `consult=...`.

### `src/components/ai/ChatWidget.tsx`
- В приветственное меню добавлена отдельная кнопка консультации:
  - DE: `💬 Beratung & Auswahl`
  - RU: `💬 Консультация и подбор`
  - EN: `💬 Consultation & guidance`

### `src/lib/ai/session-store.ts`
- В контекст сессии добавлены поля консультационного режима:
  - `consultationMode`
  - `consultationTopic`
  - `consultationTechnique`
  - `awaitingConsultationBookingConfirmation`

### `src/lib/ai/system-prompt.ts`
- Переработан системный промпт под текущий сценарий: консультация + букинг.
- Уточнены правила tool-driven поведения, формат ответов и ограничения.
- Убран устаревший/дублирующий legacy-блок.

### `src/lib/ai/knowledge.ts` (новый файл)
- Добавлена доменная база знаний для консультаций (RU/DE/EN), включая PMU/заживление/варианты услуг.
- Добавлены детекторы интентов/тем/техник и генераторы консультационных текстов.

### `src/lib/ai/recommendation-engine.ts` (новый файл)
- Добавлен движок рекомендаций/upsell с оценкой кандидатов и локализованными шаблонами.

## Техническое примечание

Файл отражает накопленные рабочие изменения относительно последнего коммита (`HEAD`) на момент формирования отчета.
