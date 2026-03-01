# Readme01.03_07

Отчёт сформирован по состоянию рабочей директории относительно последнего коммита (`HEAD`).

## Сводка

- Изменено файлов: `5`
- Вставок: `589`
- Удалений: `115`

Изменённые файлы:

1. `src/app/api/ai/chat/route.ts`
2. `src/app/api/ai/voice/route.ts`
3. `src/lib/ai/tools/create-draft.ts`
4. `src/lib/ai/verification-choice.ts`
5. `src/lib/booking/finalize-booking.ts`

## Детализация изменений

### 1) `src/app/api/ai/chat/route.ts`

- Расширен контракт запроса:
  - добавлено поле `inputMode?: 'text' | 'voice' | 'otp'`.
- Улучшено распознавание контактных сообщений:
  - добавлено определение намерения передать телефон (в т.ч. голосом);
  - добавлено распознавание словесных числовых токенов (русские числительные);
  - смягчено распознавание `sobaka/собака` в email-контексте.
- Обновлён `looksLikeNameOnlyPayload`:
  - добавлена очистка пунктуации перед валидацией имени.
- Обновлён `shouldApplyScopeGuard(...)`:
  - добавлен параметр `voiceMode`;
  - при выборе метода регистрации используется mode-aware детект;
  - в этапе сбора контакта отключены лишние блокировки, если уже выбран метод верификации.
- Обновлён текст сбора контактов `buildContactCollectionTextForMethod(...)`:
  - добавлен `voiceMode`;
  - для голосового флоу при `sms_otp` и `telegram_otp` запрашиваются только имя + телефон (без email);
  - текстовый сценарий сохранён.
- В `POST` обработке:
  - читается `inputMode`, вычисляется `isVoiceTurn`;
  - выбор метода регистрации/верификации стал mode-aware;
  - при показе выбора методов после резерва учитывается `voiceMode`;
  - добавлен `voicePrompt` в системные подсказки модели:
    - в voice-режиме не требовать email для Telegram/SMS.
- Добавлена защита от гонки инструментов:
  - если в одном батче есть `create_draft`, удаляются `start_verification` до фактического создания черновика.
- Скорректирован `autoVerificationCandidate`:
  - теперь хранит только `draftId` (без зависимости от email).

### 2) `src/app/api/ai/voice/route.ts`

- Значительно расширена предобработка голосового транскрипта:
  - добавлены регулярки и intent-детект для email/phone;
  - добавлены словари русских числительных (единицы/десятки/сотни);
  - добавлена транслитерация RU→LAT для email;
  - добавлены функции:
    - `transliterateRu`
    - `sanitizeEmailCandidate`
    - `extractEmailCandidate`
    - `isSpokenPhoneToken`
    - `parseSpokenPhoneTokens`
    - `extractSpokenPhone`
- `normalizeVoiceTranscript(...)` теперь:
  - извлекает и нормализует email-кандидат;
  - извлекает телефон из словесного ввода;
  - добавляет найденные контакты в текст, если они не были распознаны напрямую.
- При форварде в чат добавлено:
  - `inputMode: 'voice'`.

### 3) `src/lib/ai/tools/create-draft.ts`

- Улучшена нормализация email перед созданием черновика:
  - добавлена транслитерация RU→LAT;
  - расширено распознавание `sobaka/собака`;
  - поддержка unicode-локальной части в шаблоне склейки;
  - коррекция `jmail` → `gmail`;
  - итоговый email приводится к lowercase.

### 4) `src/lib/ai/verification-choice.ts`

- Добавлен `MethodChoiceOptions` с флагом `voiceMode`.
- `buildRegistrationMethodChoiceText(...)`:
  - теперь mode-aware;
  - в voice-режиме скрываются Google и Email;
  - остаются Telegram/SMS (если SMS включён).
- `buildVerificationMethodChoiceText(...)`:
  - теперь mode-aware;
  - в voice-режиме скрывается Email;
  - fallback перестроен: при наличии телефона приоритет Telegram, иначе Email.
- `detectRegistrationMethodChoice(...)`:
  - в voice-режиме игнорирует Google/Email, оставляет Telegram/SMS.
- `detectVerificationMethodChoice(...)`:
  - в voice-режиме игнорирует Email.

### 5) `src/lib/booking/finalize-booking.ts`

- Усилен блок поиска/создания клиента:
  - добавлены хелперы:
    - `fallbackDigits`
    - `buildFallbackPhone`
    - `buildFallbackEmail`
    - `isUniqueConstraintError`
    - `buildClientLookupOr`
  - email нормализуется в lowercase.
- Если отсутствуют контактные данные, формируются fallback `phone/email` для стабильного создания `Client`.
- Добавлена обработка `P2002` (unique constraint):
  - при конфликте на `client.create(...)` выполняется повторный поиск существующего клиента;
  - если найден — используется его `id`, транзакция продолжается.

## Примечание

- В рабочем дереве также есть предупреждения Git о нормализации окончаний строк (CRLF→LF) для:
  - `src/app/api/ai/voice/route.ts`
  - `src/lib/ai/verification-choice.ts`
- Эти предупреждения не являются отдельными функциональными изменениями.
