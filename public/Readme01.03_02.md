# Readme01.03_02

Changes after last commit (HEAD).

- Base commit (short): `d37f551`

## git status --short

```bash
 M src/app/api/ai/chat/route.ts
 M src/components/ai/ChatWidget.tsx
 M src/lib/ai/tools/create-draft.ts
 M src/lib/ai/tools/start-verification.ts
?? src/app/api/ai/voice/route.ts
?? src/components/ai/VoiceButton.tsx
```

## git diff --name-status HEAD

```bash
M	src/app/api/ai/chat/route.ts
M	src/components/ai/ChatWidget.tsx
M	src/lib/ai/tools/create-draft.ts
M	src/lib/ai/tools/start-verification.ts
```

## git diff --stat HEAD

```bash
 src/app/api/ai/chat/route.ts           | 570 +++++++++++++++++++++++++++++++--
 src/components/ai/ChatWidget.tsx       | 541 ++++++++++++++++++++++++++++++-
 src/lib/ai/tools/create-draft.ts       |  48 ++-
 src/lib/ai/tools/start-verification.ts |  66 +++-
 4 files changed, 1192 insertions(+), 33 deletions(-)
```

## Full diff (tracked files)

```diff
diff --git a/src/app/api/ai/chat/route.ts b/src/app/api/ai/chat/route.ts
index f8aad70..2fd214c 100644
--- a/src/app/api/ai/chat/route.ts
+++ b/src/app/api/ai/chat/route.ts
@@ -18,6 +18,7 @@ import { searchAvailabilityMonth } from '@/lib/ai/tools/search-month';
 import { searchAvailability } from '@/lib/ai/tools/search-availability';
 import { listServices } from '@/lib/ai/tools/list-services';
 import { listMastersForServices } from '@/lib/ai/tools/list-masters';
+import { reserveSlot } from '@/lib/ai/tools/reserve-slot';
 import { startVerification } from '@/lib/ai/tools/start-verification';
 import {
   buildRegistrationMethodChoiceText,
@@ -127,18 +128,195 @@ function isTomorrowRequest(text: string): boolean {
   return value === 'завтра' || value === 'tomorrow' || value === 'morgen';
 }
 
+function looksLikeMonthNameDateInput(text: string): boolean {
+  const value = normalizeInput(text).replace(/ё/g, 'е');
+  if (!value) return false;
+
+  if (
+    /\b\d{1,2}\s+(январ[ья]?|феврал[ья]?|март[а]?|апрел[ья]?|ма[йя]|июн[ья]?|июл[ья]?|август[а]?|сентябр[ья]?|октябр[ья]?|ноябр[ья]?|декабр[ья]?)\b/u.test(
+      value,
+    )
+  ) {
+    return true;
+  }
+
+  if (
+    /\b\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/u.test(
+      value,
+    )
+  ) {
+    return true;
+  }
+
+  if (
+    /\b\d{1,2}\s+(januar|februar|maerz|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\b/u.test(
+      value,
+    )
+  ) {
+    return true;
+  }
+
+  return false;
+}
+
+function detectPreferredTimeInput(
+  text: string,
+): 'morning' | 'afternoon' | 'evening' | 'any' | null {
+  const value = normalizeInput(text).replace(/ё/g, 'е');
+  if (!value) return null;
+
+  const hasNegation = /\b(не|not|kein|keine|nicht)\b/u.test(value);
+  const hasMorning =
+    /\b(утро|утром|утра|morning|vormittag)\b/u.test(value) ||
+    value.includes('am vormittag');
+  const hasAfternoon =
+    /\b(день|днем|днём|дня|afternoon|nachmittag)\b/u.test(value) ||
+    value.includes('am nachmittag') ||
+    value.includes('после обеда');
+  const hasEvening =
+    /\b(вечер|вечером|вечера|evening|abend)\b/u.test(value) ||
+    value.includes('am abend');
+
+  if (
+    /\b(любое время|в любое время|любой|any time|anytime|egal|any)\b/u.test(value)
+  ) {
+    return 'any';
+  }
+
+  if (hasMorning && hasNegation && !hasAfternoon && !hasEvening) {
+    // "не подходит утро" -> default to daytime slots.
+    return 'afternoon';
+  }
+
+  if (hasMorning) return 'morning';
+  if (hasAfternoon) return 'afternoon';
+  if (hasEvening) return 'evening';
+
+  return null;
+}
+
+function extractPreferredStartTimeInput(text: string): string | null {
+  const value = normalizeInput(text).replace(/ё/g, 'е');
+  if (!value) return null;
+
+  const hhmm = value.match(/\b([01]?\d|2[0-3])\s*[:.]\s*([0-5]\d)\b/u);
+  if (hhmm) {
+    const hh = hhmm[1].padStart(2, '0');
+    const mm = hhmm[2];
+    return `${hh}:${mm}`;
+  }
+
+  const hhSpaced = value.match(/\b([01]?\d|2[0-3])\s+([0-5]\d)\b/u);
+  if (hhSpaced) {
+    const hh = hhSpaced[1].padStart(2, '0');
+    const mm = hhSpaced[2];
+    return `${hh}:${mm}`;
+  }
+
+  for (const [phrase, hour] of RU_SPOKEN_HOUR_MAP) {
+    if (
+      value.includes(`${phrase} ноль ноль`) ||
+      value.includes(`${phrase} 00`) ||
+      value.includes(`${phrase} ровно`)
+    ) {
+      return `${String(hour).padStart(2, '0')}:00`;
+    }
+  }
+
+  return null;
+}
+
 const TIME_PREFERENCE_INPUTS = new Set<string>([
   'утро',
+  'утром',
+  'утра',
   'день',
+  'днем',
+  'днём',
+  'дня',
+  'после обеда',
   'вечер',
+  'вечером',
+  'вечера',
   'morning',
   'afternoon',
   'evening',
   'vormittag',
+  'am vormittag',
   'nachmittag',
+  'am nachmittag',
   'abend',
+  'am abend',
+  'any',
+  'любое время',
+  'в любое время',
 ]);
 
+const RU_MONTH_NUMBER_MAP: Record<string, number> = {
+  январ: 1,
+  январь: 1,
+  января: 1,
+  феврал: 2,
+  февраль: 2,
+  февраля: 2,
+  март: 3,
+  марта: 3,
+  апрел: 4,
+  апрель: 4,
+  апреля: 4,
+  май: 5,
+  мая: 5,
+  июн: 6,
+  июнь: 6,
+  июня: 6,
+  июл: 7,
+  июль: 7,
+  июля: 7,
+  август: 8,
+  августа: 8,
+  сентябр: 9,
+  сентябрь: 9,
+  сентября: 9,
+  октябр: 10,
+  октябрь: 10,
+  октября: 10,
+  ноябр: 11,
+  ноябрь: 11,
+  ноября: 11,
+  декабр: 12,
+  декабрь: 12,
+  декабря: 12,
+};
+
+const RU_SPOKEN_HOUR_MAP: Array<[string, number]> = [
+  ['двадцать три', 23],
+  ['двадцать два', 22],
+  ['двадцать один', 21],
+  ['двадцать', 20],
+  ['девятнадцать', 19],
+  ['восемнадцать', 18],
+  ['семнадцать', 17],
+  ['шестнадцать', 16],
+  ['пятнадцать', 15],
+  ['четырнадцать', 14],
+  ['тринадцать', 13],
+  ['двенадцать', 12],
+  ['одиннадцать', 11],
+  ['десять', 10],
+  ['девять', 9],
+  ['восемь', 8],
+  ['семь', 7],
+  ['шесть', 6],
+  ['пять', 5],
+  ['четыре', 4],
+  ['три', 3],
+  ['два', 2],
+  ['две', 2],
+  ['один', 1],
+  ['одна', 1],
+  ['ноль', 0],
+];
+
 const BOOKING_DOMAIN_KEYWORDS = [
   // RU
   'запис',
@@ -233,6 +411,9 @@ function looksLikeDateOrTimeSelection(text: string): boolean {
   if (!value) return false;
   if (isNearestDateRequest(value) || isTomorrowRequest(value)) return true;
   if (TIME_PREFERENCE_INPUTS.has(value)) return true;
+  if (detectPreferredTimeInput(value)) return true;
+  if (looksLikeMonthNameDateInput(value)) return true;
+  if (extractPreferredStartTimeInput(value)) return true;
   if (/\b\d{1,2}[:.]\d{2}\s*[–-]\s*\d{1,2}[:.]\d{2}\b/.test(value)) return true;
   if (/\b\d{1,2}[./-]\d{1,2}\b/.test(value)) return true;
   return false;
@@ -243,7 +424,13 @@ function looksLikeContactPayload(text: string): boolean {
   if (!value) return false;
   const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value);
   const hasPhone = /(?:\+?\d[\d\s().-]{6,}\d)/.test(value);
-  return hasEmail || hasPhone;
+  const hasObfuscatedEmail =
+    /[A-Z0-9._%+-]+(?:\s*|[-_.]?)(?:sobaka|собака)(?:\s*|[-_.]?)[A-Z0-9.-]+(?:\.[A-Z]{2,})+/iu.test(
+      value,
+    ) ||
+    /\b(email|e-mail|почта|емейл|имейл|майл)\b/iu.test(value) ||
+    /\b(sobaka|собака)\b/iu.test(value);
+  return hasEmail || hasPhone || hasObfuscatedEmail;
 }
 
 function looksLikeServiceOptionPayload(text: string): boolean {
@@ -298,6 +485,8 @@ function looksLikeResendRequest(text: string): boolean {
 function shouldApplyScopeGuard(text: string, session: AiSession): boolean {
   const normalizedInput = normalizeInput(text);
   if (!normalizedInput) return false;
+  const awaitingContact = Boolean(session.context.reservedSlot && !session.context.draftId);
+  const awaitingOtp = Boolean(session.context.draftId);
 
   if (session.context.awaitingRegistrationMethod) {
     // During method-selection step allow only explicit method clicks/texts.
@@ -305,17 +494,12 @@ function shouldApplyScopeGuard(text: string, session: AiSession): boolean {
     return true;
   }
 
-  // Always allow clearly booking-related messages.
-  if (isLikelyBookingDomainMessage(text)) return false;
-
-  const awaitingContact = Boolean(session.context.reservedSlot && !session.context.draftId);
   if (awaitingContact) {
     // During contact step allow name/email/phone-like payloads only.
     if (looksLikeContactPayload(text) || looksLikeNameOnlyPayload(text)) return false;
     return true;
   }
 
-  const awaitingOtp = Boolean(session.context.draftId);
   if (awaitingOtp) {
     // During OTP step allow code, resend requests, email correction and simple confirmations.
     if (
@@ -329,6 +513,26 @@ function shouldApplyScopeGuard(text: string, session: AiSession): boolean {
     return true;
   }
 
+  // If any booking context exists, allow domain-adjacent free-form user phrasing.
+  // This prevents accidental guard triggers in active voice flows.
+  const hasAnyBookingState = Boolean(
+    (session.context.selectedServiceIds?.length ?? 0) > 0 ||
+      session.context.selectedMasterId ||
+      session.context.reservedSlot ||
+      session.context.draftId ||
+      session.context.pendingVerificationMethod ||
+      session.context.awaitingRegistrationMethod ||
+      session.context.awaitingVerificationMethod ||
+      session.context.lastDateISO ||
+      (session.context.lastSuggestedDateOptions?.length ?? 0) > 0,
+  );
+  if (hasAnyBookingState) {
+    return false;
+  }
+
+  // Always allow clearly booking-related messages.
+  if (isLikelyBookingDomainMessage(text)) return false;
+
   // Outside booking scope: block any non-domain chat/small-talk/trivia.
   return true;
 }
@@ -521,6 +725,50 @@ function parseExplicitDateInputToISO(
   return candidate;
 }
 
+function parseMonthNameDateInputToISO(
+  input: string,
+  referenceDateISO: string,
+): string | null {
+  const normalized = normalizeInput(input).replace(/ё/g, 'е');
+  const ruMatch = normalized.match(
+    /\b(\d{1,2})\s+(январ[ья]?|феврал[ья]?|март[а]?|апрел[ья]?|ма[йя]|июн[ья]?|июл[ья]?|август[а]?|сентябр[ья]?|октябр[ья]?|ноябр[ья]?|декабр[ья]?)\b/u,
+  );
+
+  if (!ruMatch) return null;
+
+  const day = Number.parseInt(ruMatch[1], 10);
+  const monthToken = ruMatch[2].toLowerCase();
+  const month = RU_MONTH_NUMBER_MAP[monthToken];
+  if (!day || !month) return null;
+
+  const referenceYear = Number.parseInt(referenceDateISO.slice(0, 4), 10);
+  const fallbackYear = Number.isInteger(referenceYear)
+    ? referenceYear
+    : new Date().getUTCFullYear();
+
+  let candidate = toISODate(fallbackYear, month, day);
+  if (!candidate) return null;
+
+  if (candidate < referenceDateISO) {
+    const nextYearCandidate = toISODate(fallbackYear + 1, month, day);
+    if (nextYearCandidate) {
+      candidate = nextYearCandidate;
+    }
+  }
+
+  return candidate;
+}
+
+function parseFlexibleDateInputToISO(
+  input: string,
+  referenceDateISO: string,
+): string | null {
+  return (
+    parseExplicitDateInputToISO(input, referenceDateISO) ??
+    parseMonthNameDateInputToISO(input, referenceDateISO)
+  );
+}
+
 async function buildNearestDateOptions(params: {
   masterId: string;
   serviceIds: string[];
@@ -654,6 +902,40 @@ function buildSlotTakenAlternativesText(
   return `${intro}\n${followUp}\n${options}`;
 }
 
+function matchSlotFromInput(
+  input: string,
+  slots: Array<{ startAt: string; endAt: string; displayTime: string }>,
+): { startAt: string; endAt: string; displayTime: string } | null {
+  const normalized = normalizeInput(input).replace(/ё/g, 'е');
+  if (!normalized || slots.length === 0) return null;
+
+  const normalizedRanges = slots.map((slot) => {
+    const range = normalizeInput(slot.displayTime).replace(/\s+/g, '');
+    const start = range.split(/[–-]/)[0];
+    return { slot, range, start };
+  });
+
+  const compactInput = normalized.replace(/\s+/g, '');
+
+  for (const item of normalizedRanges) {
+    if (
+      compactInput === item.range ||
+      compactInput.includes(item.range) ||
+      compactInput.includes(item.start)
+    ) {
+      return item.slot;
+    }
+  }
+
+  const preferredStart = extractPreferredStartTimeInput(normalized);
+  if (!preferredStart) return null;
+
+  return (
+    normalizedRanges.find((item) => item.start.startsWith(preferredStart))?.slot ??
+    null
+  );
+}
+
 function fallbackTextByLocale(locale: 'de' | 'ru' | 'en'): string {
   if (locale === 'ru') {
     return 'Извините, не удалось сформировать ответ. Хотите, я сразу покажу ближайшие свободные даты?';
@@ -688,6 +970,16 @@ function buildVerificationAutoText(
     return 'SMS konnte nicht gesendet werden: Telefonnummer hat ein ungültiges Format.\n\nBitte geben Sie die Nummer im internationalen Format `+49...` oder `+38...` an und senden Sie Ihre Kontaktdaten erneut.';
   }
 
+  if (opts.error === 'EMAIL_FORMAT_INVALID') {
+    if (locale === 'ru') {
+      return 'Не удалось отправить код: email указан в неверном формате.\n\nПожалуйста, укажите корректный email в формате `name@example.com`.';
+    }
+    if (locale === 'en') {
+      return 'Could not send code: email format is invalid.\n\nPlease provide a valid email in the `name@example.com` format.';
+    }
+    return 'Der Code konnte nicht gesendet werden: E-Mail-Format ist ungültig.\n\nBitte geben Sie eine korrekte E-Mail im Format `name@example.com` an.';
+  }
+
   if (locale === 'ru') {
     return `Не удалось отправить код подтверждения (${opts.error ?? 'ошибка отправки'}).\n\nПроверьте введённые контактные данные и напишите "отправь код ещё раз".`;
   }
@@ -1325,6 +1617,12 @@ async function tryHandleCatalogSelectionFastPath(
     }
   }
 
+  const matchedService = chooseBestMatch(
+    flatServices,
+    (s) => normalizeChoiceText(s.title),
+    input,
+  );
+
   const matchedGroup = chooseBestMatch(
     groups,
     (g) => normalizeChoiceText(g.title),
@@ -1333,13 +1631,22 @@ async function tryHandleCatalogSelectionFastPath(
 
   if (matchedGroup) {
     const groupNorm = normalizeChoiceText(matchedGroup.title);
+    const serviceNorm = matchedService
+      ? normalizeChoiceText(matchedService.title)
+      : '';
     const inputTokens = tokenizeNormalized(input);
     const groupTokens = tokenizeNormalized(groupNorm);
+    const hasStrongServiceMatch =
+      Boolean(serviceNorm) &&
+      (input === serviceNorm ||
+        input.includes(serviceNorm) ||
+        serviceNorm.includes(input));
     const startsWithGroup =
       input === groupNorm || input.startsWith(`${groupNorm} `);
     const isDirectGroupChoice =
-      startsWithGroup ||
-      (input.includes(groupNorm) && inputTokens.length <= groupTokens.length + 2);
+      !hasStrongServiceMatch &&
+      (startsWithGroup ||
+        (input.includes(groupNorm) && inputTokens.length <= groupTokens.length + 2));
 
     if (!isDirectGroupChoice) {
       // User most likely clicked a specific service with overlapping words.
@@ -1378,11 +1685,6 @@ async function tryHandleCatalogSelectionFastPath(
     }
   }
 
-  const matchedService = chooseBestMatch(
-    flatServices,
-    (s) => normalizeChoiceText(s.title),
-    input,
-  );
   if (!matchedService) return null;
 
   const startedMasters = Date.now();
@@ -1850,18 +2152,19 @@ export async function POST(
 
   // Deterministic manual date input (e.g. 28.02 / 28-02 / 28/02).
   if (selectedMasterId && selectedServiceIds.length > 0) {
-    const explicitDateISO = parseExplicitDateInputToISO(
+    const explicitDateISO = parseFlexibleDateInputToISO(
       message,
       session.context.lastDateISO ?? todayISO(),
     );
 
     if (explicitDateISO) {
+      const requestedPreferredTime = detectPreferredTimeInput(message) ?? 'any';
       const startedAt = Date.now();
       const availabilityResult = await searchAvailability({
         masterId: selectedMasterId,
         dateISO: explicitDateISO,
         serviceIds: selectedServiceIds,
-        preferredTime: 'any',
+        preferredTime: requestedPreferredTime,
       });
       const durationMs = Date.now() - startedAt;
       const slots = Array.isArray(availabilityResult.slots)
@@ -1874,7 +2177,7 @@ export async function POST(
         upsertSession(sessionId, {
           context: {
             lastDateISO: explicitDateISO,
-            lastPreferredTime: 'any',
+            lastPreferredTime: requestedPreferredTime,
             lastNoSlots: false,
             lastSuggestedDateOptions: undefined,
           },
@@ -1913,12 +2216,12 @@ export async function POST(
       appendSessionMessage(sessionId, 'assistant', text);
       upsertSession(sessionId, {
         context: {
-          lastDateISO: explicitDateISO,
-          lastPreferredTime: 'any',
-          lastNoSlots: optionsMap.length === 0,
-          lastSuggestedDateOptions: optionsMap,
-        },
-      });
+            lastDateISO: explicitDateISO,
+            lastPreferredTime: requestedPreferredTime,
+            lastNoSlots: optionsMap.length === 0,
+            lastSuggestedDateOptions: optionsMap,
+          },
+        });
 
       console.log(
         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=manual-date-no-slots date=${explicitDateISO} days=${optionsMap.length}`,
@@ -2011,6 +2314,229 @@ export async function POST(
     }
   }
 
+  // Deterministic follow-up: natural-language preferred time on already chosen date.
+  if (selectedMasterId && selectedServiceIds.length > 0 && session.context.lastDateISO) {
+    const preferredTime = detectPreferredTimeInput(message);
+    if (preferredTime) {
+      const dateISO = session.context.lastDateISO;
+      const startedAt = Date.now();
+      const preferredResult = await searchAvailability({
+        masterId: selectedMasterId,
+        dateISO,
+        serviceIds: selectedServiceIds,
+        preferredTime,
+      });
+      const durationMs = Date.now() - startedAt;
+      const preferredSlots = Array.isArray(preferredResult.slots)
+        ? preferredResult.slots
+        : [];
+
+      if (preferredSlots.length > 0) {
+        const text = buildSlotsForDateText(session.locale, dateISO, preferredSlots);
+        appendSessionMessage(sessionId, 'assistant', text);
+        upsertSession(sessionId, {
+          context: {
+            lastDateISO: dateISO,
+            lastPreferredTime: preferredTime,
+            lastNoSlots: false,
+            lastSuggestedDateOptions: undefined,
+          },
+        });
+
+        console.log(
+          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=preferred-time-picked date=${dateISO} preferred=${preferredTime} slots=${preferredSlots.length}`,
+        );
+
+        return NextResponse.json({
+          text,
+          sessionId,
+          toolCalls: [{ name: 'search_availability', durationMs }],
+        });
+      }
+
+      // If no slots for preferred period, show full-day alternatives on the same date.
+      const fallbackStartedAt = Date.now();
+      const anyTimeResult = await searchAvailability({
+        masterId: selectedMasterId,
+        dateISO,
+        serviceIds: selectedServiceIds,
+        preferredTime: 'any',
+      });
+      const fallbackDurationMs = Date.now() - fallbackStartedAt;
+      const anyTimeSlots = Array.isArray(anyTimeResult.slots)
+        ? anyTimeResult.slots
+        : [];
+
+      const noPreferredText =
+        session.locale === 'ru'
+          ? 'На выбранный период свободных слотов нет. Вот все доступные варианты на эту дату:'
+          : session.locale === 'en'
+            ? 'No free slots for that time period. Here are all available options on this date:'
+            : 'Für diesen Zeitraum gibt es keine freien Slots. Hier sind alle verfügbaren Optionen an diesem Datum:';
+
+      const text =
+        anyTimeSlots.length > 0
+          ? `${noPreferredText}\n\n${buildSlotsForDateText(session.locale, dateISO, anyTimeSlots)}`
+          : buildSlotsForDateText(session.locale, dateISO, []);
+
+      appendSessionMessage(sessionId, 'assistant', text);
+      upsertSession(sessionId, {
+        context: {
+          lastDateISO: dateISO,
+          lastPreferredTime: preferredTime,
+          lastNoSlots: anyTimeSlots.length === 0,
+          lastSuggestedDateOptions: undefined,
+        },
+      });
+
+      console.log(
+        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=preferred-time-no-slots date=${dateISO} preferred=${preferredTime}`,
+      );
+
+      return NextResponse.json({
+        text,
+        sessionId,
+        toolCalls: [
+          { name: 'search_availability', durationMs },
+          { name: 'search_availability', durationMs: fallbackDurationMs },
+        ],
+      });
+    }
+  }
+
+  // Deterministic follow-up: spoken time slot selection (e.g. "14:00", "четырнадцать ноль ноль").
+  if (
+    selectedMasterId &&
+    selectedServiceIds.length > 0 &&
+    session.context.lastDateISO &&
+    !session.context.reservedSlot
+  ) {
+    const normalizedMessage = normalizeInput(message);
+    const looksLikeSlotChoice =
+      /\b\d{1,2}[:.]\d{2}\s*[–-]\s*\d{1,2}[:.]\d{2}\b/u.test(
+        normalizedMessage,
+      ) ||
+      /\b\d{1,2}[.:]\d{1,2}[.:]\d{1,2}\b/u.test(normalizedMessage) ||
+      Boolean(extractPreferredStartTimeInput(message));
+    if (looksLikeSlotChoice) {
+      const dateISO = session.context.lastDateISO;
+      const startedAt = Date.now();
+      const availabilityResult = await searchAvailability({
+        masterId: selectedMasterId,
+        dateISO,
+        serviceIds: selectedServiceIds,
+        preferredTime: 'any',
+      });
+      const availabilityDurationMs = Date.now() - startedAt;
+      const slots = Array.isArray(availabilityResult.slots)
+        ? availabilityResult.slots
+        : [];
+      const matchedSlot = matchSlotFromInput(message, slots);
+
+      if (matchedSlot) {
+        const reserveStartedAt = Date.now();
+        const reserveResult = await reserveSlot({
+          masterId: selectedMasterId,
+          startAt: matchedSlot.startAt,
+          endAt: matchedSlot.endAt,
+          sessionId,
+        });
+        const reserveDurationMs = Date.now() - reserveStartedAt;
+
+        if (reserveResult.success) {
+          const text = buildRegistrationMethodChoiceText(session.locale);
+          appendSessionMessage(sessionId, 'assistant', text);
+          upsertSession(sessionId, {
+            context: {
+              reservedSlot: {
+                startAt: matchedSlot.startAt,
+                endAt: matchedSlot.endAt,
+              },
+              lastDateISO: dateISO,
+              lastPreferredTime: 'any',
+              lastNoSlots: false,
+              lastSuggestedDateOptions: undefined,
+              awaitingRegistrationMethod: true,
+              pendingVerificationMethod: undefined,
+              awaitingVerificationMethod: false,
+            },
+          });
+
+          console.log(
+            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=slot-picked-by-time date=${dateISO} slot="${matchedSlot.displayTime}"`,
+          );
+
+          return NextResponse.json({
+            text,
+            sessionId,
+            toolCalls: [
+              { name: 'search_availability', durationMs: availabilityDurationMs },
+              { name: 'reserve_slot', durationMs: reserveDurationMs },
+            ],
+            inputMode: 'text',
+          });
+        }
+
+        if (reserveResult.error === 'SLOT_TAKEN') {
+          const refreshStartedAt = Date.now();
+          const refreshed = await searchAvailability({
+            masterId: selectedMasterId,
+            dateISO,
+            serviceIds: selectedServiceIds,
+            preferredTime: 'any',
+          });
+          const refreshDurationMs = Date.now() - refreshStartedAt;
+          const text = buildSlotTakenAlternativesText(
+            session.locale,
+            dateISO,
+            refreshed.slots ?? [],
+          );
+
+          appendSessionMessage(sessionId, 'assistant', text);
+          upsertSession(sessionId, {
+            context: {
+              draftId: undefined,
+              reservedSlot: undefined,
+              awaitingVerificationMethod: false,
+              awaitingRegistrationMethod: false,
+              pendingVerificationMethod: undefined,
+            },
+          });
+
+          console.log(
+            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=slot-picked-by-time-taken date=${dateISO}`,
+          );
+
+          return NextResponse.json({
+            text,
+            sessionId,
+            toolCalls: [
+              { name: 'search_availability', durationMs: availabilityDurationMs },
+              { name: 'reserve_slot', durationMs: reserveDurationMs },
+              { name: 'search_availability', durationMs: refreshDurationMs },
+            ],
+            inputMode: 'text',
+          });
+        }
+      }
+
+      // User tried to pick time, but we could not map it to a slot.
+      const text =
+        session.locale === 'ru'
+          ? `Не удалось распознать выбранное время. Пожалуйста, выберите один из доступных слотов:\n\n${buildSlotsForDateText(session.locale, dateISO, slots)}`
+          : session.locale === 'en'
+            ? `I could not recognize the selected time. Please choose one of the available slots:\n\n${buildSlotsForDateText(session.locale, dateISO, slots)}`
+            : `Die gewählte Zeit konnte nicht erkannt werden. Bitte wählen Sie einen der verfügbaren Slots:\n\n${buildSlotsForDateText(session.locale, dateISO, slots)}`;
+
+      appendSessionMessage(sessionId, 'assistant', text);
+      return NextResponse.json({
+        text,
+        sessionId,
+        toolCalls: [{ name: 'search_availability', durationMs: availabilityDurationMs }],
+      });
+    }
+  }
+
   // Deterministic follow-up: user confirms after "no slots" -> check month availability
   if (
     session.context.lastNoSlots &&
diff --git a/src/components/ai/ChatWidget.tsx b/src/components/ai/ChatWidget.tsx
index 0aa910c..b6ddc6f 100644
--- a/src/components/ai/ChatWidget.tsx
+++ b/src/components/ai/ChatWidget.tsx
@@ -6,6 +6,7 @@ import { motion, AnimatePresence } from 'framer-motion';
 import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
 import { ChatMessage, type Message } from './ChatMessage';
 import { OtpInput } from './OtpInput';
+import { VoiceButton } from './VoiceButton';
 
 // ─── Config ─────────────────────────────────────────────────────
 
@@ -81,7 +82,7 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);
 
-  // Focus input when opening
+  // Focus input when opening (only in text mode)
   useEffect(() => {
     if (isOpen && inputMode === 'text') {
       setTimeout(() => inputRef.current?.focus(), 300);
@@ -117,6 +118,8 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
     setInputMode('text');
   }, [t.welcome]);
 
+  // ─── Core send logic ─────────────────────────────────────────
+
   const sendMessage = useCallback(
     async (text: string) => {
       setIsLoading(true);
@@ -165,7 +168,6 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
         if (data.inputMode === 'otp') {
           setInputMode('otp');
         } else if (data.inputMode === 'text' || inputMode === 'otp') {
-          // Explicit text mode, or we were in OTP and server didn't say stay in OTP
           setInputMode('text');
         }
       } catch (err) {
@@ -180,7 +182,6 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
             isError: true,
           },
         ]);
-        // On error, stay in current mode
       } finally {
         setIsLoading(false);
       }
@@ -188,6 +189,8 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
     [sessionId, locale, t, inputMode],
   );
 
+  // ─── Text input handlers ──────────────────────────────────────
+
   const handleOptionClick = useCallback(
     (text: string) => {
       if (isLoading) return;
@@ -262,6 +265,62 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
     sendMessage(resendText);
   }, [isLoading, locale, sendMessage]);
 
+  // ─── Voice handlers ───────────────────────────────────────────
+
+  const handleVoiceResult = useCallback(
+    (result: { transcript: string; text: string; inputMode?: string }) => {
+      // Add user message (transcribed text)
+      if (result.transcript) {
+        setMessages((prev) => [
+          ...prev,
+          {
+            id: `user-voice-${Date.now()}`,
+            role: 'user',
+            content: `🎙 ${result.transcript}`,
+            timestamp: new Date(),
+          },
+        ]);
+      }
+
+      // Add AI response
+      setMessages((prev) => [
+        ...prev,
+        {
+          id: `ai-voice-${Date.now()}`,
+          role: 'assistant',
+          content: result.text,
+          timestamp: new Date(),
+        },
+      ]);
+
+      // Update input mode
+      if (result.inputMode === 'otp') {
+        setInputMode('otp');
+      } else if (result.inputMode === 'text') {
+        setInputMode('text');
+      }
+    },
+    [],
+  );
+
+  const handleVoiceError = useCallback(
+    (error: string) => {
+      setMessages((prev) => [
+        ...prev,
+        {
+          id: `error-voice-${Date.now()}`,
+          role: 'assistant',
+          content: error,
+          timestamp: new Date(),
+          isError: true,
+        },
+      ]);
+    },
+    [],
+  );
+
+  // ─── Render ───────────────────────────────────────────────────
+
   return (
     <>
       {/* ── Floating Button ───────────────────────────────── */}
@@ -348,7 +407,6 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
             {/* ── Messages ────────────────────────────────── */}
             <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
               {messages.map((msg, idx) => {
-                // isLatest = last assistant message in the list
                 const isLatestAssistant =
                   msg.role === 'assistant' &&
                   !msg.isError &&
@@ -427,6 +485,19 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
                         el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
                       }}
                     />
+
+                    {/* Voice button — shown when input is empty */}
+                    {!input.trim() && (
+                      <VoiceButton
+                        onResult={handleVoiceResult}
+                        onError={handleVoiceError}
+                        sessionId={sessionId}
+                        locale={locale}
+                        disabled={isLoading}
+                      />
+                    )}
+
+                    {/* Send button — shown when there's text */}
                     <button
                       onClick={handleSend}
                       disabled={!input.trim() || isLoading}
@@ -436,6 +507,8 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
                           input.trim() && !isLoading
                             ? 'linear-gradient(135deg, #FFD700, #FFA000)'
                             : 'rgba(255, 255, 255, 0.1)',
+                        // Hide send button when voice is shown (no text)
+                        display: input.trim() ? 'flex' : 'none',
                       }}
                     >
                       {isLoading ? (
@@ -457,6 +530,466 @@ export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
 
 
 
+//-------01.03.26 добавляем голосовой ввод и подтверждение кода
+// // src/components/ai/ChatWidget.tsx
+// 'use client';
+
+// import { useState, useRef, useEffect, useCallback } from 'react';
+// import { motion, AnimatePresence } from 'framer-motion';
+// import { MessageCircle, X, Send, Loader2, RotateCcw } from 'lucide-react';
+// import { ChatMessage, type Message } from './ChatMessage';
+// import { OtpInput } from './OtpInput';
+
+// // ─── Config ─────────────────────────────────────────────────────
+
+// const API_URL = '/api/ai/chat';
+
+// function generateSessionId(): string {
+//   return crypto.randomUUID();
+// }
+
+// // ─── Translations ───────────────────────────────────────────────
+
+// const UI_TEXT = {
+//   de: {
+//     placeholder: 'Ihre Nachricht...',
+//     welcome: 'Hallo! 👋 Ich bin Elen-AI, Ihr Buchungsassistent. Wie kann ich Ihnen helfen?\n\n[option] 📅 Termin buchen [/option]\n[option] 💅 Leistungen & Preise [/option]\n[option] 📍 Anfahrt & Öffnungszeiten [/option]',
+//     error: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
+//     rateLimit: 'Bitte warten Sie einen Moment, bevor Sie eine neue Nachricht senden.',
+//     title: 'Salon Elen',
+//     subtitle: 'Buchungsassistent',
+//     newChat: 'Neuer Chat',
+//   },
+//   ru: {
+//     placeholder: 'Ваше сообщение...',
+//     welcome: 'Привет! 👋 Я Elen-AI, ассистент записи. Чем могу помочь?\n\n[option] 📅 Записаться на приём [/option]\n[option] 💅 Услуги и цены [/option]\n[option] 📍 Адрес и часы работы [/option]',
+//     error: 'Извините, произошла ошибка. Попробуйте ещё раз.',
+//     rateLimit: 'Пожалуйста, подождите немного перед отправкой нового сообщения.',
+//     title: 'Salon Elen',
+//     subtitle: 'Ассистент записи',
+//     newChat: 'Новый чат',
+//   },
+//   en: {
+//     placeholder: 'Your message...',
+//     welcome: 'Hello! 👋 I\'m Elen-AI, your booking assistant. How can I help?\n\n[option] 📅 Book an appointment [/option]\n[option] 💅 Services & prices [/option]\n[option] 📍 Location & hours [/option]',
+//     error: 'Sorry, something went wrong. Please try again.',
+//     rateLimit: 'Please wait a moment before sending a new message.',
+//     title: 'Salon Elen',
+//     subtitle: 'Booking Assistant',
+//     newChat: 'New Chat',
+//   },
+// } as const;
+
+// type SupportedLocale = keyof typeof UI_TEXT;
+
+// // ─── Types ──────────────────────────────────────────────────────
+
+// type InputMode = 'text' | 'otp';
+
+// // ─── Component ──────────────────────────────────────────────────
+
+// interface ChatWidgetProps {
+//   locale?: string;
+// }
+
+// export default function ChatWidget({ locale: propLocale }: ChatWidgetProps) {
+//   const locale: SupportedLocale =
+//     propLocale && propLocale in UI_TEXT
+//       ? (propLocale as SupportedLocale)
+//       : 'de';
+//   const t = UI_TEXT[locale];
+
+//   const [isOpen, setIsOpen] = useState(false);
+//   const [messages, setMessages] = useState<Message[]>([]);
+//   const [input, setInput] = useState('');
+//   const [isLoading, setIsLoading] = useState(false);
+//   const [sessionId, setSessionId] = useState(() => generateSessionId());
+//   const [inputMode, setInputMode] = useState<InputMode>('text');
+
+//   const messagesEndRef = useRef<HTMLDivElement>(null);
+//   const inputRef = useRef<HTMLTextAreaElement>(null);
+
+//   // Scroll to bottom on new messages
+//   useEffect(() => {
+//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
+//   }, [messages]);
+
+//   // Focus input when opening
+//   useEffect(() => {
+//     if (isOpen && inputMode === 'text') {
+//       setTimeout(() => inputRef.current?.focus(), 300);
+//     }
+//   }, [isOpen, inputMode]);
+
+//   // Welcome message on first open
+//   useEffect(() => {
+//     if (isOpen && messages.length === 0) {
+//       setMessages([
+//         {
+//           id: 'welcome',
+//           role: 'assistant',
+//           content: t.welcome,
+//           timestamp: new Date(),
+//         },
+//       ]);
+//     }
+//   }, [isOpen, messages.length, t.welcome]);
+
+//   const handleNewChat = useCallback(() => {
+//     setSessionId(generateSessionId());
+//     setMessages([
+//       {
+//         id: 'welcome',
+//         role: 'assistant',
+//         content: t.welcome,
+//         timestamp: new Date(),
+//       },
+//     ]);
+//     setInput('');
+//     setIsLoading(false);
+//     setInputMode('text');
+//   }, [t.welcome]);
+
+//   const sendMessage = useCallback(
+//     async (text: string) => {
+//       setIsLoading(true);
+
+//       try {
+//         const res = await fetch(API_URL, {
+//           method: 'POST',
+//           headers: { 'Content-Type': 'application/json' },
+//           body: JSON.stringify({
+//             sessionId,
+//             message: text,
+//             locale,
+//           }),
+//         });
+
+//         if (res.status === 429) {
+//           setMessages((prev) => [
+//             ...prev,
+//             {
+//               id: `error-${Date.now()}`,
+//               role: 'assistant',
+//               content: t.rateLimit,
+//               timestamp: new Date(),
+//             },
+//           ]);
+//           return;
+//         }
+
+//         if (!res.ok) {
+//           throw new Error(`HTTP ${res.status}`);
+//         }
+
+//         const data = await res.json();
+
+//         setMessages((prev) => [
+//           ...prev,
+//           {
+//             id: `ai-${Date.now()}`,
+//             role: 'assistant',
+//             content: data.text,
+//             timestamp: new Date(),
+//           },
+//         ]);
+
+//         // Switch input mode based on server response
+//         if (data.inputMode === 'otp') {
+//           setInputMode('otp');
+//         } else if (data.inputMode === 'text' || inputMode === 'otp') {
+//           // Explicit text mode, or we were in OTP and server didn't say stay in OTP
+//           setInputMode('text');
+//         }
+//       } catch (err) {
+//         console.error('[ChatWidget] Error:', err);
+//         setMessages((prev) => [
+//           ...prev,
+//           {
+//             id: `error-${Date.now()}`,
+//             role: 'assistant',
+//             content: t.error,
+//             timestamp: new Date(),
+//             isError: true,
+//           },
+//         ]);
+//         // On error, stay in current mode
+//       } finally {
+//         setIsLoading(false);
+//       }
+//     },
+//     [sessionId, locale, t, inputMode],
+//   );
+
+//   const handleOptionClick = useCallback(
+//     (text: string) => {
+//       if (isLoading) return;
+//       const userMsg: Message = {
+//         id: `user-${Date.now()}`,
+//         role: 'user',
+//         content: text,
+//         timestamp: new Date(),
+//       };
+//       setMessages((prev) => [...prev, userMsg]);
+//       sendMessage(text);
+//     },
+//     [isLoading, sendMessage],
+//   );
+
+//   const handleSend = useCallback(async () => {
+//     const text = input.trim();
+//     if (!text || isLoading) return;
+
+//     const userMsg: Message = {
+//       id: `user-${Date.now()}`,
+//       role: 'user',
+//       content: text,
+//       timestamp: new Date(),
+//     };
+
+//     setMessages((prev) => [...prev, userMsg]);
+//     setInput('');
+//     sendMessage(text);
+//   }, [input, isLoading, sendMessage]);
+
+//   const handleKeyDown = (e: React.KeyboardEvent) => {
+//     if (e.key === 'Enter' && !e.shiftKey) {
+//       e.preventDefault();
+//       handleSend();
+//     }
+//   };
+
+//   // ─── OTP handlers ─────────────────────────────────────────────
+
+//   const handleOtpSubmit = useCallback(
+//     (code: string) => {
+//       if (isLoading) return;
+//       const userMsg: Message = {
+//         id: `user-${Date.now()}`,
+//         role: 'user',
+//         content: code,
+//         timestamp: new Date(),
+//       };
+//       setMessages((prev) => [...prev, userMsg]);
+//       sendMessage(code);
+//     },
+//     [isLoading, sendMessage],
+//   );
+
+//   const handleOtpResend = useCallback(() => {
+//     if (isLoading) return;
+//     const resendText =
+//       locale === 'ru'
+//         ? 'отправь код ещё раз'
+//         : locale === 'en'
+//           ? 'send code again'
+//           : 'Code erneut senden';
+
+//     const userMsg: Message = {
+//       id: `user-${Date.now()}`,
+//       role: 'user',
+//       content: resendText,
+//       timestamp: new Date(),
+//     };
+//     setMessages((prev) => [...prev, userMsg]);
+//     sendMessage(resendText);
+//   }, [isLoading, locale, sendMessage]);
+
+//   return (
+//     <>
+//       {/* ── Floating Button ───────────────────────────────── */}
+//       <AnimatePresence>
+//         {!isOpen && (
+//           <motion.button
+//             initial={{ scale: 0, opacity: 0 }}
+//             animate={{ scale: 1, opacity: 1 }}
+//             exit={{ scale: 0, opacity: 0 }}
+//             whileHover={{ scale: 1.1 }}
+//             whileTap={{ scale: 0.95 }}
+//             onClick={() => setIsOpen(true)}
+//             className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl sm:h-16 sm:w-16"
+//             style={{
+//               background: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 100%)',
+//               boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
+//             }}
+//             aria-label="Chat öffnen"
+//           >
+//             <MessageCircle className="h-6 w-6 text-gray-900 sm:h-7 sm:w-7" />
+//           </motion.button>
+//         )}
+//       </AnimatePresence>
+
+//       {/* ── Chat Panel ────────────────────────────────────── */}
+//       <AnimatePresence>
+//         {isOpen && (
+//           <motion.div
+//             initial={{ opacity: 0, y: 20, scale: 0.95 }}
+//             animate={{ opacity: 1, y: 0, scale: 1 }}
+//             exit={{ opacity: 0, y: 20, scale: 0.95 }}
+//             transition={{ type: 'spring', damping: 25, stiffness: 300 }}
+//             className="fixed bottom-0 right-0 z-50 flex h-full w-full flex-col sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:rounded-2xl"
+//             style={{
+//               background: 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
+//               border: '1px solid rgba(255, 215, 0, 0.15)',
+//               boxShadow:
+//                 '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.08)',
+//             }}
+//           >
+//             {/* ── Header ──────────────────────────────────── */}
+//             <div
+//               className="flex items-center justify-between rounded-t-none px-4 py-3 sm:rounded-t-2xl"
+//               style={{
+//                 background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
+//                 borderBottom: '1px solid rgba(255, 215, 0, 0.1)',
+//               }}
+//             >
+//               <div className="flex items-center gap-3">
+//                 <div
+//                   className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-gray-900"
+//                   style={{
+//                     background: 'linear-gradient(135deg, #FFD700, #FFA000)',
+//                   }}
+//                 >
+//                   E
+//                 </div>
+//                 <div>
+//                   <h3 className="text-sm font-semibold text-white">
+//                     {t.title}
+//                   </h3>
+//                   <p className="text-xs text-gray-400">{t.subtitle}</p>
+//                 </div>
+//               </div>
+
+//               <div className="flex items-center gap-1">
+//                 <button
+//                   onClick={handleNewChat}
+//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
+//                   title={t.newChat}
+//                 >
+//                   <RotateCcw className="h-4 w-4" />
+//                 </button>
+//                 <button
+//                   onClick={() => setIsOpen(false)}
+//                   className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
+//                   aria-label="Chat schließen"
+//                 >
+//                   <X className="h-5 w-5" />
+//                 </button>
+//               </div>
+//             </div>
+
+//             {/* ── Messages ────────────────────────────────── */}
+//             <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
+//               {messages.map((msg, idx) => {
+//                 // isLatest = last assistant message in the list
+//                 const isLatestAssistant =
+//                   msg.role === 'assistant' &&
+//                   !msg.isError &&
+//                   idx === messages.length - 1;
+
+//                 return (
+//                   <ChatMessage
+//                     key={msg.id}
+//                     message={msg}
+//                     onOptionClick={isLatestAssistant ? handleOptionClick : undefined}
+//                     isLatest={isLatestAssistant}
+//                   />
+//                 );
+//               })}
+
+//               {isLoading && (
+//                 <div className="mb-3 flex items-start gap-2">
+//                   <div
+//                     className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-gray-900"
+//                     style={{
+//                       background: 'linear-gradient(135deg, #FFD700, #FFA000)',
+//                     }}
+//                   >
+//                     E
+//                   </div>
+//                   <div className="rounded-xl rounded-tl-sm bg-white/5 px-3 py-2">
+//                     <div className="flex gap-1">
+//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
+//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
+//                       <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
+//                     </div>
+//                   </div>
+//                 </div>
+//               )}
+
+//               <div ref={messagesEndRef} />
+//             </div>
+
+//             {/* ── Input Area ─────────────────────────────── */}
+//             <AnimatePresence mode="wait">
+//               {inputMode === 'otp' ? (
+//                 <OtpInput
+//                   key="otp-input"
+//                   onSubmit={handleOtpSubmit}
+//                   isLoading={isLoading}
+//                   locale={locale}
+//                   onResend={handleOtpResend}
+//                 />
+//               ) : (
+//                 <motion.div
+//                   key="text-input"
+//                   initial={{ opacity: 0, y: 8 }}
+//                   animate={{ opacity: 1, y: 0 }}
+//                   exit={{ opacity: 0, y: -8 }}
+//                   transition={{ duration: 0.2 }}
+//                   className="px-3 py-3"
+//                   style={{
+//                     borderTop: '1px solid rgba(255, 215, 0, 0.1)',
+//                     background: 'rgba(255, 255, 255, 0.02)',
+//                   }}
+//                 >
+//                   <div className="flex items-end gap-2">
+//                     <textarea
+//                       ref={inputRef}
+//                       value={input}
+//                       onChange={(e) => setInput(e.target.value)}
+//                       onKeyDown={handleKeyDown}
+//                       placeholder={t.placeholder}
+//                       rows={1}
+//                       disabled={isLoading}
+//                       className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500/40 focus:bg-white/8 disabled:opacity-50"
+//                       style={{ maxHeight: '100px' }}
+//                       onInput={(e) => {
+//                         const el = e.currentTarget;
+//                         el.style.height = 'auto';
+//                         el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
+//                       }}
+//                     />
+//                     <button
+//                       onClick={handleSend}
+//                       disabled={!input.trim() || isLoading}
+//                       className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
+//                       style={{
+//                         background:
+//                           input.trim() && !isLoading
+//                             ? 'linear-gradient(135deg, #FFD700, #FFA000)'
+//                             : 'rgba(255, 255, 255, 0.1)',
+//                       }}
+//                     >
+//                       {isLoading ? (
+//                         <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
+//                       ) : (
+//                         <Send className="h-4 w-4 text-gray-900" />
+//                       )}
+//                     </button>
+//                   </div>
+//                 </motion.div>
+//               )}
+//             </AnimatePresence>
+//           </motion.div>
+//         )}
+//       </AnimatePresence>
+//     </>
+//   );
+// }
+
+
+
 //------01.03.26 форма подтверждения кода
 // // src/components/ai/ChatWidget.tsx
 // 'use client';
diff --git a/src/lib/ai/tools/create-draft.ts b/src/lib/ai/tools/create-draft.ts
index 8d0502b..a616017 100644
--- a/src/lib/ai/tools/create-draft.ts
+++ b/src/lib/ai/tools/create-draft.ts
@@ -15,8 +15,54 @@ interface Args {
   locale: string;
 }
 
+function sanitizeEmailCandidate(candidate: string): string {
+  if (!candidate.includes('@')) return candidate;
+
+  const parts = candidate.split('@');
+  if (parts.length !== 2) return candidate;
+
+  let [local, domain] = parts;
+
+  local = local.replace(/\.+/g, '.').replace(/^\.+|\.+$/g, '');
+  domain = domain.replace(/^\.+/, '').replace(/\.+/g, '.').replace(/\.+$/g, '');
+
+  if (!local || !domain) return candidate;
+  return `${local}@${domain}`;
+}
+
+function normalizeEmailInput(raw: string): string {
+  const value = String(raw || '').trim();
+  if (!value) return '';
+
+  let candidate = value.toLowerCase();
+  candidate = candidate.replace(/ё/g, 'е');
+
+  candidate = candidate
+    .replace(/(собака|sobaka)\s*[.,]/giu, '@')
+    .replace(/\b(собака|sobaka)\b/giu, '@')
+    .replace(/\b(точка|dot)\b/giu, '.');
+
+  candidate = candidate
+    .replace(/\s*@\s*/g, '@')
+    .replace(/\s*\.\s*/g, '.')
+    .replace(/\s+/g, '');
+
+  // Handle glued "userSobaka.gmail.com"
+  candidate = candidate.replace(
+    /^([a-z0-9._%+-]+)(?:sobaka|собака)[\s._-]*([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/iu,
+    '$1@$2',
+  );
+
+  candidate = candidate.replace(/@\.{1,}/g, '@');
+  candidate = sanitizeEmailCandidate(candidate);
+
+  return candidate;
+}
+
 export async function createDraft(args: Args) {
   try {
+    const normalizedEmail = normalizeEmailInput(args.email);
+
     const draft = await prisma.bookingDraft.create({
       data: {
         serviceId: args.serviceId,
@@ -25,7 +71,7 @@ export async function createDraft(args: Args) {
         endAt: new Date(args.endAt),
         customerName: args.customerName,
         phone: args.phone || '',
-        email: args.email,
+        email: normalizedEmail,
         birthDate: args.birthDate ? new Date(args.birthDate) : null,
         notes: args.notes || null,
         locale: args.locale || 'de',
diff --git a/src/lib/ai/tools/start-verification.ts b/src/lib/ai/tools/start-verification.ts
index 851e4fc..3ed25e9 100644
--- a/src/lib/ai/tools/start-verification.ts
+++ b/src/lib/ai/tools/start-verification.ts
@@ -46,6 +46,49 @@ function normalizePhoneForVerification(phone: string): string {
   return startsWithPlus ? `+${digitsOnly}` : digitsOnly;
 }
 
+function sanitizeEmailCandidate(candidate: string): string {
+  if (!candidate.includes('@')) return candidate;
+
+  const parts = candidate.split('@');
+  if (parts.length !== 2) return candidate;
+
+  let [local, domain] = parts;
+  local = local.replace(/\.+/g, '.').replace(/^\.+|\.+$/g, '');
+  domain = domain.replace(/^\.+/, '').replace(/\.+/g, '.').replace(/\.+$/g, '');
+
+  if (!local || !domain) return candidate;
+  return `${local}@${domain}`;
+}
+
+function normalizeEmailForVerification(email: string): string {
+  const value = String(email || '').trim().toLowerCase().replace(/ё/g, 'е');
+  if (!value) return '';
+
+  let candidate = value
+    .replace(/(собака|sobaka)\s*[.,]/giu, '@')
+    .replace(/\b(собака|sobaka)\b/giu, '@')
+    .replace(/\b(точка|dot)\b/giu, '.');
+
+  candidate = candidate
+    .replace(/\s*@\s*/g, '@')
+    .replace(/\s*\.\s*/g, '.')
+    .replace(/\s+/g, '');
+
+  candidate = candidate.replace(
+    /^([a-z0-9._%+-]+)(?:sobaka|собака)[\s._-]*([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/iu,
+    '$1@$2',
+  );
+
+  candidate = candidate.replace(/@\.{1,}/g, '@');
+  candidate = sanitizeEmailCandidate(candidate);
+
+  return candidate;
+}
+
+function isValidEmailFormat(email: string): boolean {
+  return /^[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+$/i.test(email);
+}
+
 function validateSmsPhoneFormat(phone: string): { ok: true; normalized: string } | { ok: false } {
   const normalized = normalizePhoneForVerification(phone);
   if (!normalized.startsWith('+')) return { ok: false };
@@ -74,17 +117,28 @@ async function handleEmailOtp(
   draft: { id: string; email: string; locale: string | null },
   contact: string,
 ): Promise<VerificationResult> {
-  if (draft.email !== contact) {
+  const normalizedDraftEmail = normalizeEmailForVerification(draft.email);
+  const normalizedContact = normalizeEmailForVerification(contact);
+
+  if (normalizedDraftEmail !== normalizedContact) {
     return { ok: false, error: 'EMAIL_MISMATCH' };
   }
 
+  if (!isValidEmailFormat(normalizedContact)) {
+    return {
+      ok: false,
+      error: 'EMAIL_FORMAT_INVALID',
+      message: 'Invalid email format',
+    };
+  }
+
   const code = generateOTP();
-  saveOTP('email' as OTPMethod, contact, draft.id, code, { ttlMinutes: 10 });
+  saveOTP('email' as OTPMethod, normalizedContact, draft.id, code, { ttlMinutes: 10 });
 
-  console.log(`[AI start_verification] email OTP for ${maskEmail(contact)}: ${code}`);
+  console.log(`[AI start_verification] email OTP for ${maskEmail(normalizedContact)}: ${code}`);
 
   const locale = (draft.locale || 'de') as Locale;
-  const sendResult = await sendOTPEmail(contact, code, {
+  const sendResult = await sendOTPEmail(normalizedContact, code, {
     expiryMinutes: 10,
     locale,
   });
@@ -96,8 +150,8 @@ async function handleEmailOtp(
 
   return {
     ok: true,
-    message: `Verification code sent to ${maskEmail(contact)}`,
-    contactMasked: maskEmail(contact),
+    message: `Verification code sent to ${maskEmail(normalizedContact)}`,
+    contactMasked: maskEmail(normalizedContact),
     expiresInMinutes: 10,
   };
 }
```

## New file content (untracked)

### `src/app/api/ai/voice/route.ts`

```ts
// src/app/api/ai/voice/route.ts
// Voice endpoint: audio → Whisper STT → forward to /api/ai/chat → return transcript + response

import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';

// ─── Config ─────────────────────────────────────────────────────

const WHISPER_MODEL = 'whisper-1';

/** Map locale to Whisper language hint (ISO 639-1) */
function whisperLanguage(locale: string): string | undefined {
  switch (locale) {
    case 'de':
      return 'de';
    case 'ru':
      return 'ru';
    case 'en':
      return 'en';
    default:
      return undefined; // let Whisper auto-detect
  }
}

function normalizeVoiceTranscript(raw: string, locale: string): string {
  let text = raw.trim();
  if (!text) return text;

  // Email obfuscation normalization for RU/EN speech:
  // "name sobaka gmail tochka com" -> "name@gmail.com"
  const hasEmailIntent =
    /\b(email|e-mail|почта|емейл|имейл|майл|gmail|outlook|yahoo|sobaka|собака|точка|dot)\b/iu.test(
      text,
    ) || text.includes('@');

  if (hasEmailIntent) {
    text = text
      .replace(/ё/g, 'е')
      .replace(/(собака|sobaka)\s*[.,]/giu, '@')
      .replace(/\b(собака|sobaka)\b/giu, '@')
      .replace(/\b(точка|dot)\b/giu, '.')
      .replace(/\s*@\s*/g, '@')
      .replace(/\s*\.\s*/g, '.')
      .replace(/\s+/g, '');

    // Handle glued forms: "userSobaka.gmail.com"
    text = text.replace(
      /^([a-z0-9._%+-]+)(?:sobaka|собака)[\s._-]*([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/iu,
      '$1@$2',
    );

    text = text.replace(/@\.{1,}/g, '@');
    if (text.includes('@')) {
      const parts = text.split('@');
      if (parts.length === 2) {
        const local = parts[0].replace(/\.+/g, '.').replace(/^\.+|\.+$/g, '');
        const domain = parts[1]
          .replace(/^\.+/, '')
          .replace(/\.+/g, '.')
          .replace(/\.+$/g, '');
        if (local && domain) {
          text = `${local}@${domain}`;
        }
      }
    }
  }

  // Minor punctuation cleanup after STT.
  if (locale === 'ru') {
    text = text.replace(/\s{2,}/g, ' ').trim();
  }

  return text;
}

// ─── Handler ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI not configured (missing OPENAI_API_KEY)' },
      { status: 503 },
    );
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const sessionId = formData.get('sessionId') as string | null;
    const locale = (formData.get('locale') as string | null) ?? 'de';

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'Missing audio file' },
        { status: 400 },
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 },
      );
    }

    // Validate audio size (max 25MB — Whisper limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large (max 25MB)' },
        { status: 413 },
      );
    }

    // ── Step 1: Whisper STT ────────────────────────────────────
    const client = new OpenAI({ apiKey });

    const startSTT = Date.now();

    // Convert Blob → File for OpenAI SDK
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const fileName = audioFile instanceof File ? audioFile.name : 'voice.webm';
    const file = await toFile(audioBuffer, fileName, {
      type: audioFile.type || 'audio/webm',
    });

    const transcription = await client.audio.transcriptions.create({
      model: WHISPER_MODEL,
      file,
      language: whisperLanguage(locale),
      response_format: 'text',
    });

    const sttMs = Date.now() - startSTT;
    const transcriptRaw =
      typeof transcription === 'string'
        ? transcription.trim()
        : String(transcription).trim();
    const transcript = normalizeVoiceTranscript(transcriptRaw, locale);

    console.log(
      `[AI Voice] STT ${sttMs}ms locale=${locale} len=${transcript.length} text="${transcript.slice(0, 80)}"`,
    );

    if (!transcript) {
      const emptyMsg =
        locale === 'ru'
          ? 'Не удалось распознать речь. Попробуйте ещё раз.'
          : locale === 'en'
            ? 'Could not recognize speech. Please try again.'
            : 'Sprache konnte nicht erkannt werden. Bitte versuchen Sie es erneut.';

      return NextResponse.json({
        transcript: '',
        text: emptyMsg,
        sessionId,
      });
    }

    // ── Step 2: Forward to chat endpoint ───────────────────────
    const startChat = Date.now();

    // Build absolute URL for internal fetch
    const protocol = req.headers.get('x-forwarded-proto') ?? 'http';
    const host = req.headers.get('host') ?? 'localhost:3000';
    const chatUrl = `${protocol}://${host}/api/ai/chat`;

    const chatRes = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        message: transcript,
        locale,
      }),
    });

    const chatMs = Date.now() - startChat;

    if (!chatRes.ok) {
      console.error(`[AI Voice] Chat forwarding failed: ${chatRes.status}`);
      return NextResponse.json(
        { error: 'Chat processing failed', transcript },
        { status: 502 },
      );
    }

    const chatData = await chatRes.json();

    console.log(
      `[AI Voice] Chat ${chatMs}ms total=${sttMs + chatMs}ms`,
    );

    return NextResponse.json({
      transcript,
      text: chatData.text,
      sessionId: chatData.sessionId ?? sessionId,
      inputMode: chatData.inputMode,
      toolCalls: chatData.toolCalls,
    });
  } catch (error) {
    console.error('[AI Voice] Error:', error);

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `Whisper API error: ${error.status}` },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: 'Internal voice processing error' },
      { status: 500 },
    );
  }
}
```

### `src/components/ai/VoiceButton.tsx`

```tsx
// src/components/ai/VoiceButton.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────

type VoiceState = 'idle' | 'recording' | 'processing';

interface VoiceButtonProps {
  /** Called with transcribed text + AI response */
  onResult: (result: { transcript: string; text: string; inputMode?: string }) => void;
  /** Called on error */
  onError?: (error: string) => void;
  /** Session ID for the chat */
  sessionId: string;
  /** Current locale */
  locale: 'de' | 'ru' | 'en';
  /** Whether the chat is currently loading */
  disabled?: boolean;
}

// ─── Labels ─────────────────────────────────────────────────────

const LABELS = {
  de: {
    record: 'Sprachaufnahme starten',
    stop: 'Aufnahme beenden',
    processing: 'Wird verarbeitet…',
    noMic: 'Kein Mikrofon verfügbar',
    error: 'Spracherkennung fehlgeschlagen',
  },
  ru: {
    record: 'Начать запись голоса',
    stop: 'Остановить запись',
    processing: 'Обработка…',
    noMic: 'Микрофон недоступен',
    error: 'Ошибка распознавания голоса',
  },
  en: {
    record: 'Start voice recording',
    stop: 'Stop recording',
    processing: 'Processing…',
    noMic: 'No microphone available',
    error: 'Voice recognition failed',
  },
} as const;

// ─── Helpers ────────────────────────────────────────────────────

/** Pick the best supported audio MIME type for MediaRecorder */
function pickMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const mime of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return 'audio/webm'; // fallback
}

// ─── Component ──────────────────────────────────────────────────

export function VoiceButton({
  onResult,
  onError,
  sessionId,
  locale,
  disabled = false,
}: VoiceButtonProps) {
  const t = LABELS[locale] ?? LABELS.de;
  const [state, setState] = useState<VoiceState>('idle');
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  const sendAudio = useCallback(
    async (blob: Blob) => {
      setState('processing');

      try {
        const formData = new FormData();
        // Determine extension from MIME
        const ext = mimeTypeRef.current.includes('mp4') ? 'mp4' : 'webm';
        formData.append('audio', blob, `voice.${ext}`);
        formData.append('sessionId', sessionId);
        formData.append('locale', locale);

        const res = await fetch('/api/ai/voice', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        onResult({
          transcript: data.transcript,
          text: data.text,
          inputMode: data.inputMode,
        });
      } catch (err) {
        console.error('[VoiceButton] Error:', err);
        onError?.(t.error);
      } finally {
        setState('idle');
        setDuration(0);
      }
    },
    [sessionId, locale, onResult, onError, t.error],
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      mimeTypeRef.current = pickMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeTypeRef.current,
      });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        chunksRef.current = [];

        // Only send if we have meaningful audio (>0.3s, ~5KB)
        if (blob.size > 5000) {
          sendAudio(blob);
        } else {
          setState('idle');
          setDuration(0);
        }
      };

      recorder.start(250); // collect in 250ms chunks
      setState('recording');
      setDuration(0);

      // Duration timer
      timerRef.current = setInterval(() => {
        setDuration((d) => {
          const next = d + 1;
          // Auto-stop at 60 seconds
          if (next >= 60) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.error('[VoiceButton] Mic error:', err);
      onError?.(t.noMic);
      setState('idle');
    }
  }, [sendAudio, stopRecording, onError, t.noMic]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (state === 'recording') {
      stopRecording();
    } else if (state === 'idle') {
      startRecording();
    }
    // If 'processing', ignore clicks
  }, [disabled, state, stopRecording, startRecording]);

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(1, '0')}:${String(s % 60).padStart(2, '0')}`;

  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';

  return (
    <div className="relative flex items-center">
      {/* Duration badge */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="mr-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1"
            style={{ background: 'rgba(239, 68, 68, 0.15)' }}
          >
            {/* Pulsing dot */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs tabular-nums text-red-400">
              {formatDuration(duration)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button */}
      <motion.button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        whileTap={{ scale: 0.9 }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-30"
        style={{
          background: isRecording
            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
            : isProcessing
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.08)',
          border: isRecording
            ? '1px solid rgba(239, 68, 68, 0.4)'
            : '1px solid rgba(255, 255, 255, 0.1)',
        }}
        title={
          isRecording ? t.stop : isProcessing ? t.processing : t.record
        }
        aria-label={
          isRecording ? t.stop : isProcessing ? t.processing : t.record
        }
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : isRecording ? (
          <Square className="h-3.5 w-3.5 text-white" fill="white" />
        ) : (
          <Mic className="h-4 w-4 text-gray-400" />
        )}
      </motion.button>
    </div>
  );
}```

