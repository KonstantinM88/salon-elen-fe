# ��������� ��᫥ ��᫥����� ������

������ (HEAD): 0f7bda1
��� �ନ஢����: 01.03.2026  2:29:45,52

==== git status --short ==== 
 M src/app/api/ai/chat/route.ts
 M src/components/ai/ChatMessage.tsx
 M src/lib/ai/missing-service-report.ts
 M src/lib/ai/session-store.ts
 M src/lib/ai/system-prompt.ts
 M src/lib/ai/tools-schema.ts
 M src/lib/ai/tools/complete-booking.ts
 M src/lib/ai/tools/start-verification.ts
 M src/lib/otp-store.ts
?? 1100
?? public/Readme01.03.md
?? src/lib/ai/sms-sender.ts
?? src/lib/ai/verification-choice.ts

==== git diff --binary HEAD ==== 
diff --git a/src/app/api/ai/chat/route.ts b/src/app/api/ai/chat/route.ts
index 8de658c..72a1c8d 100644
--- a/src/app/api/ai/chat/route.ts
+++ b/src/app/api/ai/chat/route.ts
@@ -19,6 +19,14 @@ import { searchAvailability } from '@/lib/ai/tools/search-availability';
 import { listServices } from '@/lib/ai/tools/list-services';
 import { listMastersForServices } from '@/lib/ai/tools/list-masters';
 import { startVerification } from '@/lib/ai/tools/start-verification';
+import {
+  buildRegistrationMethodChoiceText,
+  detectRegistrationMethodChoice,
+  buildVerificationMethodChoiceText,
+  detectVerificationMethodChoice,
+  getContactForMethod,
+} from '@/lib/ai/verification-choice';
+import { prisma } from '@/lib/prisma';
 
 // ─── Config ─────────────────────────────────────────────────────
 
@@ -135,6 +143,7 @@ const BOOKING_DOMAIN_KEYWORDS = [
   // RU
   'запис',
   'брон',
+  'термин',
   'прием',
   'услуг',
   'спис',
@@ -235,10 +244,18 @@ function looksLikeContactPayload(text: string): boolean {
   return hasEmail || hasPhone;
 }
 
+function looksLikeServiceOptionPayload(text: string): boolean {
+  const value = normalizeInput(text);
+  if (!value) return false;
+  // UI option payload: "<service> — 60 мин., 35,00 €" (or "min.")
+  return /[—–-]\s*\d{1,3}\s*(?:мин\.?|min\.?)/iu.test(value);
+}
+
 function isLikelyBookingDomainMessage(text: string): boolean {
   const normalizedInput = normalizeInput(text);
   if (!normalizedInput) return false;
 
+  if (looksLikeServiceOptionPayload(text)) return true;
   if (looksLikeDateOrTimeSelection(text)) return true;
   if (looksLikeContactPayload(text)) return true;
   if (/^\d{6}$/.test(normalizedInput)) return true; // OTP code
@@ -280,6 +297,12 @@ function shouldApplyScopeGuard(text: string, session: AiSession): boolean {
   const normalizedInput = normalizeInput(text);
   if (!normalizedInput) return false;
 
+  if (session.context.awaitingRegistrationMethod) {
+    // During method-selection step allow only explicit method clicks/texts.
+    if (detectRegistrationMethodChoice(text)) return false;
+    return true;
+  }
+
   // Always allow clearly booking-related messages.
   if (isLikelyBookingDomainMessage(text)) return false;
 
@@ -382,7 +405,14 @@ function buildNoSlotsFollowUpText(
     )
     .join('\n');
 
-  return `${header}\n\n${options}`;
+  const manualHint =
+    locale === 'ru'
+      ? 'Или укажите желаемую дату в формате ДД.ММ (например, 10.03).'
+      : locale === 'en'
+        ? 'Or type your preferred date in DD.MM format (for example, 10.03).'
+        : 'Oder geben Sie Ihr Wunschdatum im Format TT.MM ein (zum Beispiel 10.03).';
+
+  return `${header}\n\n${options}\n\n${manualHint}`;
 }
 
 function mapMonthDaysToOptions(
@@ -590,6 +620,38 @@ function buildSlotsForDateText(
   return `${header}\n\n${options}`;
 }
 
+function buildSlotTakenAlternativesText(
+  locale: 'de' | 'ru' | 'en',
+  dateISO: string,
+  slots: Array<{ displayTime: string }>,
+): string {
+  const label = formatDateLabel(dateISO, locale);
+  const intro =
+    locale === 'ru'
+      ? `К сожалению, этот слот уже был занят другим клиентом. Давайте проверим другие доступные слоты на ${label}.`
+      : locale === 'en'
+        ? `Unfortunately, that slot has already been taken by another client. Let us check other available times on ${label}.`
+        : `Leider wurde dieser Slot bereits von einem anderen Kunden belegt. Lassen Sie uns andere verfügbare Zeiten am ${label} prüfen.`;
+
+  if (slots.length === 0) {
+    return `${intro}\n\n${buildNoSlotsFollowUpText(locale, [])}`;
+  }
+
+  const followUp =
+    locale === 'ru'
+      ? 'Вот альтернативные варианты:\nКакой слот вам подходит?'
+      : locale === 'en'
+        ? 'Here are alternative options:\nWhich slot works for you?'
+        : 'Hier sind alternative Optionen:\nWelcher Slot passt Ihnen?';
+
+  const options = slots
+    .slice(0, 12)
+    .map((s) => `[option] 🕐 ${s.displayTime} [/option]`)
+    .join('\n');
+
+  return `${intro}\n${followUp}\n${options}`;
+}
+
 function fallbackTextByLocale(locale: 'de' | 'ru' | 'en'): string {
   if (locale === 'ru') {
     return 'Извините, не удалось сформировать ответ. Хотите, я сразу покажу ближайшие свободные даты?';
@@ -614,13 +676,126 @@ function buildVerificationAutoText(
     return `Ein Bestätigungscode wurde an ${opts.contactMasked ?? 'Ihre E-Mail'} gesendet.\n\nBitte geben Sie den 6-stelligen Code ein, um die Buchung abzuschließen.\n\nWenn keine E-Mail innerhalb von 1-2 Minuten kommt, prüfen Sie bitte den Spam-Ordner.`;
   }
 
+  if (opts.error === 'PHONE_FORMAT_INVALID') {
+    if (locale === 'ru') {
+      return 'Не удалось отправить SMS: номер телефона в неверном формате.\n\nПожалуйста, укажите номер в международном формате `+49...` или `+38...` и повторите контактные данные.';
+    }
+    if (locale === 'en') {
+      return 'Could not send SMS: phone number format is invalid.\n\nPlease provide the number in international format `+49...` or `+38...` and resend your contact details.';
+    }
+    return 'SMS konnte nicht gesendet werden: Telefonnummer hat ein ungültiges Format.\n\nBitte geben Sie die Nummer im internationalen Format `+49...` oder `+38...` an und senden Sie Ihre Kontaktdaten erneut.';
+  }
+
+  if (locale === 'ru') {
+    return `Не удалось отправить код подтверждения (${opts.error ?? 'ошибка отправки'}).\n\nПроверьте введённые контактные данные и напишите "отправь код ещё раз".`;
+  }
+  if (locale === 'en') {
+    return `I could not send the verification code (${opts.error ?? 'send error'}).\n\nPlease check your contact data and type "send code again".`;
+  }
+  return `Der Bestätigungscode konnte nicht gesendet werden (${opts.error ?? 'Sendeproblem'}).\n\nBitte prüfen Sie Ihre Kontaktdaten und schreiben Sie "Code erneut senden".`;
+}
+
+function buildContactCollectionTextForMethod(
+  locale: 'de' | 'ru' | 'en',
+  method: 'email_otp' | 'sms_otp' | 'telegram_otp',
+): string {
+  if (locale === 'ru') {
+    if (method === 'email_otp') {
+      return 'Вы выбрали подтверждение по Email.\nПожалуйста, укажите ваше имя и адрес электронной почты для завершения записи.\nВаши данные будут использоваться только для управления записью.';
+    }
+    if (method === 'sms_otp') {
+      return 'Вы выбрали подтверждение по SMS.\nПожалуйста, укажите ваше имя, номер телефона и адрес электронной почты для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
+    }
+    return 'Вы выбрали подтверждение через Telegram.\nПожалуйста, укажите ваше имя, номер телефона (привязанный к Telegram-боту) и адрес электронной почты для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
+  }
+
+  if (locale === 'en') {
+    if (method === 'email_otp') {
+      return 'You chose Email verification.\nPlease provide your name and email address to finish the booking.\nYour data will only be used for appointment management.';
+    }
+    if (method === 'sms_otp') {
+      return 'You chose SMS verification.\nPlease provide your name, phone number, and email address to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
+    }
+    return 'You chose Telegram verification.\nPlease provide your name, phone number (linked to our Telegram bot), and email address to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
+  }
+
+  if (method === 'email_otp') {
+    return 'Sie haben E-Mail-Verifizierung gewählt.\nBitte geben Sie Ihren Namen und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nIhre Daten werden nur zur Terminverwaltung verwendet.';
+  }
+  if (method === 'sms_otp') {
+    return 'Sie haben SMS-Verifizierung gewählt.\nBitte geben Sie Ihren Namen, Ihre Telefonnummer und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
+  }
+  return 'Sie haben Telegram-Verifizierung gewählt.\nBitte geben Sie Ihren Namen, Ihre Telefonnummer (mit Telegram-Bot verknüpft) und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
+}
+
+function buildMissingContactForMethodText(
+  locale: 'de' | 'ru' | 'en',
+  method: 'email_otp' | 'sms_otp' | 'telegram_otp',
+): string {
   if (locale === 'ru') {
-    return `Не удалось отправить код подтверждения (${opts.error ?? 'ошибка отправки'}).\n\nПроверьте email и напишите "отправь код ещё раз".`;
+    if (method === 'email_otp') {
+      return 'Для подтверждения по Email нужен корректный email. Пожалуйста, укажите email и повторите.';
+    }
+    if (method === 'sms_otp') {
+      return 'Для подтверждения по SMS нужен номер телефона в формате +49... или +38.... Пожалуйста, укажите корректный номер и повторите.';
+    }
+    return 'Для подтверждения через Telegram нужен номер телефона, привязанный к Telegram-боту, в формате +49... или +38.... Пожалуйста, укажите корректный номер и повторите.';
   }
+
   if (locale === 'en') {
-    return `I could not send the verification code (${opts.error ?? 'send error'}).\n\nPlease check your email and type "send code again".`;
+    if (method === 'email_otp') {
+      return 'Email verification needs a valid email address. Please provide your email and try again.';
+    }
+    if (method === 'sms_otp') {
+      return 'SMS verification needs a phone number in +49... or +38... format. Please provide a valid number and try again.';
+    }
+    return 'Telegram verification needs a phone number linked to our bot in +49... or +38... format. Please provide a valid number and try again.';
   }
-  return `Der Bestätigungscode konnte nicht gesendet werden (${opts.error ?? 'Sendeproblem'}).\n\nBitte prüfen Sie die E-Mail und schreiben Sie "Code erneut senden".`;
+
+  if (method === 'email_otp') {
+    return 'Für die E-Mail-Verifizierung wird eine gültige E-Mail-Adresse benötigt. Bitte E-Mail angeben und erneut versuchen.';
+  }
+  if (method === 'sms_otp') {
+    return 'Für die SMS-Verifizierung wird eine Telefonnummer im Format +49... oder +38... benötigt. Bitte korrekte Nummer angeben und erneut versuchen.';
+  }
+  return 'Für die Telegram-Verifizierung wird eine mit dem Bot verknüpfte Telefonnummer im Format +49... oder +38... benötigt. Bitte korrekte Nummer angeben und erneut versuchen.';
+}
+
+function buildGoogleHandoffUrl(session: AiSession): string | null {
+  const serviceId = session.context.selectedServiceIds?.[0];
+  const masterId = session.context.selectedMasterId;
+  const reserved = session.context.reservedSlot;
+
+  if (!serviceId || !masterId || !reserved) return null;
+
+  const selectedDate = reserved.startAt.slice(0, 10);
+  const params = new URLSearchParams({
+    s: serviceId,
+    m: masterId,
+    start: reserved.startAt,
+    end: reserved.endAt,
+    d: selectedDate,
+  });
+  const path = `/booking/client?${params.toString()}`;
+
+  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');
+  return baseUrl ? `${baseUrl}${path}` : path;
+}
+
+function escapeOptionAttr(value: string): string {
+  return value.replace(/"/g, '%22').replace(/\]/g, '%5D');
+}
+
+function buildGoogleHandoffText(locale: 'de' | 'ru' | 'en', url: string): string {
+  const safeUrl = escapeOptionAttr(url);
+
+  if (locale === 'ru') {
+    return `Вы выбрали регистрацию через Google.\nНажмите кнопку ниже, чтобы продолжить в защищённом потоке:\n[option url="${safeUrl}"]🔐 Продолжить через Google[/option]`;
+  }
+  if (locale === 'en') {
+    return `You selected Google registration.\nTap the button below to continue in the secure flow:\n[option url="${safeUrl}"]🔐 Continue with Google[/option]`;
+  }
+  return `Sie haben Google-Registrierung gewählt.\nKlicken Sie auf die Schaltfläche unten, um im sicheren Flow fortzufahren:\n[option url="${safeUrl}"]🔐 Mit Google fortfahren[/option]`;
 }
 
 function normalizeChoiceText(value: string): string {
@@ -635,6 +810,15 @@ function normalizeChoiceText(value: string): string {
     .trim();
 }
 
+function normalizeCatalogSelectionInput(value: string): string {
+  // Strip UI metadata from option clicks:
+  // "Обычный — 60 мин., 35,00 €" -> "Обычный"
+  const compact = value
+    .replace(/\s*[—–-]\s*\d{1,3}\s*(?:мин\.?|min\.?).*$/iu, '')
+    .trim();
+  return normalizeChoiceText(compact);
+}
+
 function tokenizeNormalized(value: string): string[] {
   return normalizeChoiceText(value)
     .split(' ')
@@ -835,6 +1019,111 @@ function isFullCatalogRequest(text: string, locale: 'de' | 'ru' | 'en'): boolean
   return dePhrases.some((p) => value.includes(p));
 }
 
+function isBookingStartIntent(
+  text: string,
+  locale: 'de' | 'ru' | 'en',
+  hasActiveBookingFlow: boolean,
+): boolean {
+  const value = normalizeInput(text);
+  if (!value) return false;
+
+  const restartPhrases =
+    locale === 'ru'
+      ? ['новый термин', 'новая запись', 'новый прием', 'новый приём', 'начать заново']
+      : locale === 'en'
+        ? ['new appointment', 'new booking', 'start over', 'book again']
+        : ['neuer termin', 'neue buchung', 'neu anfangen', 'erneut buchen'];
+
+  if (restartPhrases.some((p) => value.includes(p))) return true;
+
+  if (hasActiveBookingFlow) return false;
+
+  const startPhrases =
+    locale === 'ru'
+      ? [
+          'записаться на приём',
+          'записаться на прием',
+          'хочу записаться',
+          'продолжить запись',
+        ]
+      : locale === 'en'
+        ? ['book appointment', 'book a slot', 'continue booking', 'i want to book']
+        : ['termin buchen', 'buchung starten', 'buchung fortsetzen', 'ich möchte buchen'];
+
+  return startPhrases.some((p) => value.includes(p));
+}
+
+function isDesiredDateQuestion(text: string, locale: 'de' | 'ru' | 'en'): boolean {
+  const value = normalizeInput(text);
+  if (!value) return false;
+  if (parseDayMonth(value)) return false;
+  if (value.includes(':')) return false; // likely time-related, not date selection
+
+  if (locale === 'ru') {
+    const ruPhrases = [
+      'есть даты',
+      'другая дата',
+      'другую дату',
+      'после 10',
+      'после 10.',
+      'после 10 ',
+      'после 10.03',
+      'на другую дату',
+    ];
+    return ruPhrases.some((p) => value.includes(p));
+  }
+
+  if (locale === 'en') {
+    const enPhrases = [
+      'other date',
+      'another date',
+      'dates after',
+      'after 10',
+      'can i pick date',
+      'preferred date',
+    ];
+    return enPhrases.some((p) => value.includes(p));
+  }
+
+  const dePhrases = [
+    'anderes datum',
+    'andere datum',
+    'daten nach',
+    'nach 10',
+    'wunschdatum',
+  ];
+  return dePhrases.some((p) => value.includes(p));
+}
+
+function buildBookingStartText(
+  locale: 'de' | 'ru' | 'en',
+  groupTitles: string[],
+): string {
+  const intro =
+    locale === 'ru'
+      ? 'Какую услугу вы хотели бы заказать? Вот некоторые из наших предложений:'
+      : locale === 'en'
+        ? 'What service would you like to book? Here are some options:'
+        : 'Welche Leistung möchten Sie buchen? Hier sind einige Optionen:';
+  const ask =
+    locale === 'ru'
+      ? 'Пожалуйста, выберите услугу!'
+      : locale === 'en'
+        ? 'Please choose a service!'
+        : 'Bitte wählen Sie eine Leistung!';
+
+  if (groupTitles.length === 0) {
+    return `${intro}\n${ask}`;
+  }
+
+  const options = groupTitles
+    .slice(0, 8)
+    .map((title) => `[option] ${categoryEmoji(title)} ${title} [/option]`)
+    .join('\n');
+
+  return `${intro}\n${ask}\n${options}`;
+}
+
 function categoryEmoji(title: string): string {
   const value = normalizeChoiceText(title);
   if (
@@ -902,12 +1191,14 @@ async function tryHandleCatalogSelectionFastPath(
   sessionId: string,
   message: string,
 ): Promise<ChatResponse | null> {
-  const input = normalizeChoiceText(message);
+  const input = normalizeCatalogSelectionInput(message);
   if (!input || input.length < 4) return null;
   if (isAffirmativeFollowUp(message)) return null;
+  const hasActiveServiceSelection =
+    (session.context.selectedServiceIds?.length ?? 0) > 0 ||
+    Boolean(session.context.selectedMasterId);
   if (
-    ((session.context.selectedServiceIds?.length ?? 0) > 0 ||
-      Boolean(session.context.selectedMasterId)) &&
+    hasActiveServiceSelection &&
     looksLikeDateOrTimeSelection(message)
   ) {
     return null;
@@ -928,6 +1219,20 @@ async function tryHandleCatalogSelectionFastPath(
   }>;
   if (groups.length === 0) return null;
 
+  // In active booking flow, do not switch service/category from free-form text.
+  // Allow only explicit catalog choices (exact group/service title or service option payload).
+  if (hasActiveServiceSelection && !looksLikeServiceOptionPayload(message)) {
+    const isExactGroupChoice = groups.some(
+      (g) => normalizeChoiceText(g.title) === input,
+    );
+    const isExactServiceChoice = groups.some((g) =>
+      g.services.some((s) => normalizeChoiceText(s.title) === input),
+    );
+    if (!isExactGroupChoice && !isExactServiceChoice) {
+      return null;
+    }
+  }
+
   const matchedGroup = chooseBestMatch(
     groups,
     (g) => normalizeChoiceText(g.title),
@@ -938,8 +1243,10 @@ async function tryHandleCatalogSelectionFastPath(
     const groupNorm = normalizeChoiceText(matchedGroup.title);
     const inputTokens = tokenizeNormalized(input);
     const groupTokens = tokenizeNormalized(groupNorm);
+    const startsWithGroup =
+      input === groupNorm || input.startsWith(`${groupNorm} `);
     const isDirectGroupChoice =
-      input === groupNorm ||
+      startsWithGroup ||
       (input.includes(groupNorm) && inputTokens.length <= groupTokens.length + 2);
 
     if (!isDirectGroupChoice) {
@@ -1172,6 +1479,135 @@ export async function POST(
       session.context.draftId,
   );
 
+  // Deterministic booking start/restart entrypoint:
+  // handles intents like "записаться", "новый термин", "book appointment".
+  if (isBookingStartIntent(message, session.locale, hasActiveBookingFlow)) {
+    const startedAt = Date.now();
+    const catalog = await listServices({ locale: session.locale });
+    const durationMs = Date.now() - startedAt;
+    const groups = (catalog.groups ?? []) as Array<{ title: string }>;
+    const groupTitles = groups.map((g) => g.title).filter(Boolean);
+    const text = buildBookingStartText(session.locale, groupTitles);
+
+    appendSessionMessage(sessionId, 'assistant', text);
+    upsertSession(sessionId, {
+      previousResponseId: null,
+      context: {
+        selectedServiceIds: undefined,
+        selectedMasterId: undefined,
+        reservedSlot: undefined,
+        draftId: undefined,
+        lastDateISO: undefined,
+        lastPreferredTime: undefined,
+        lastNoSlots: false,
+        lastSuggestedDateOptions: undefined,
+        awaitingRegistrationMethod: false,
+        pendingVerificationMethod: undefined,
+        awaitingVerificationMethod: false,
+      },
+    });
+
+    console.log(
+      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=booking-start groups=${groupTitles.length}`,
+    );
+
+    return NextResponse.json({
+      text,
+      sessionId,
+      toolCalls: [{ name: 'list_services', durationMs }],
+    });
+  }
+
+  // Deterministic handling for free-form date questions while service/master are already fixed.
+  // Example: "есть даты после 10" -> keep current service and ask for exact DD.MM date.
+  if (
+    selectedMasterId &&
+    selectedServiceIds.length > 0 &&
+    isDesiredDateQuestion(message, session.locale)
+  ) {
+    const text =
+      session.locale === 'ru'
+        ? 'Да, можно выбрать желаемую дату.\nНапишите дату в формате ДД.ММ (например, 10.03), и я сразу покажу свободное время.'
+        : session.locale === 'en'
+          ? 'Yes, you can choose your preferred date.\nType a date in DD.MM format (for example, 10.03), and I will show free slots right away.'
+          : 'Ja, Sie können Ihr Wunschdatum wählen.\nSchreiben Sie das Datum im Format TT.MM (zum Beispiel 10.03), und ich zeige sofort freie Zeiten.';
+
+    appendSessionMessage(sessionId, 'assistant', text);
+
+    console.log(
+      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=date-guidance`,
+    );
+
+    return NextResponse.json({
+      text,
+      sessionId,
+    });
+  }
+
+  // Deterministic selection flow first:
+  // category click -> concrete services, service click -> masters/date step.
+  // Important: run before scope-guard, otherwise service option clicks can be blocked.
+  const selectionFastPath = await tryHandleCatalogSelectionFastPath(
+    session,
+    sessionId,
+    message,
+  );
+  if (selectionFastPath) {
+    return NextResponse.json(selectionFastPath);
+  }
+
+  // Deterministic registration-method selection after slot reservation.
+  if (session.context.awaitingRegistrationMethod && session.context.reservedSlot) {
+    const selectedMethod = detectRegistrationMethodChoice(message);
+    if (selectedMethod) {
+      if (selectedMethod === 'google_oauth') {
+        const handoffUrl = buildGoogleHandoffUrl(session);
+        const effectiveMethod = handoffUrl ? selectedMethod : 'email_otp';
+        const keepMethodStep = Boolean(handoffUrl);
+        const text = handoffUrl
+          ? buildGoogleHandoffText(session.locale, handoffUrl)
+          : buildContactCollectionTextForMethod(session.locale, 'email_otp');
+
+        appendSessionMessage(sessionId, 'assistant', text);
+        upsertSession(sessionId, {
+          context: {
+            awaitingRegistrationMethod: keepMethodStep,
+            pendingVerificationMethod: effectiveMethod,
+            awaitingVerificationMethod: false,
+          },
+        });
+
+        console.log(
+          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=registration-method method=${selectedMethod}`,
+        );
+
+        return NextResponse.json({
+          text,
+          sessionId,
+        });
+      }
+
+      const text = buildContactCollectionTextForMethod(session.locale, selectedMethod);
+      appendSessionMessage(sessionId, 'assistant', text);
+      upsertSession(sessionId, {
+        context: {
+          awaitingRegistrationMethod: false,
+          pendingVerificationMethod: selectedMethod,
+          awaitingVerificationMethod: false,
+        },
+      });
+
+      console.log(
+        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=registration-method method=${selectedMethod}`,
+      );
+
+      return NextResponse.json({
+        text,
+        sessionId,
+      });
+    }
+  }
+
   if (shouldApplyScopeGuard(message, session)) {
     const text = buildScopeGuardText(session.locale, hasActiveBookingFlow);
     appendSessionMessage(sessionId, 'assistant', text);
@@ -1566,15 +2002,69 @@ export async function POST(
     });
   }
 
-  // Deterministic selection flow:
-  // category click -> concrete services, service click -> masters/date step.
-  const selectionFastPath = await tryHandleCatalogSelectionFastPath(
-    session,
-    sessionId,
-    message,
-  );
-  if (selectionFastPath) {
-    return NextResponse.json(selectionFastPath);
+  // ─── Deterministic: user picks verification method ────────
+  if (session.context.awaitingVerificationMethod && session.context.draftId) {
+    const chosenMethod = detectVerificationMethodChoice(message);
+    if (chosenMethod) {
+      // Look up the draft to get contact info
+      const draft = await prisma.bookingDraft.findUnique({
+        where: { id: session.context.draftId },
+        select: { email: true, phone: true },
+      });
+
+      if (draft) {
+        const contact = getContactForMethod(chosenMethod, draft.email, draft.phone);
+
+        if (!contact) {
+          const noContactText =
+            session.locale === 'ru'
+              ? 'Для этого метода нет контактных данных. Пожалуйста, выберите другой способ.'
+              : session.locale === 'en'
+                ? 'No contact info available for this method. Please choose another way.'
+                : 'Keine Kontaktdaten für diese Methode vorhanden. Bitte wählen Sie eine andere.';
+          appendSessionMessage(sessionId, 'assistant', noContactText);
+          return NextResponse.json({ text: noContactText, sessionId });
+        }
+
+        const startedAt = Date.now();
+        const verifyRes = await startVerification({
+          method: chosenMethod,
+          draftId: session.context.draftId,
+          contact,
+        });
+        const durationMs = Date.now() - startedAt;
+
+        const text = buildVerificationAutoText(session.locale, {
+          ok: Boolean(verifyRes?.ok),
+          contactMasked:
+            typeof verifyRes === 'object' && verifyRes && 'contactMasked' in verifyRes
+              ? (verifyRes.contactMasked as string | undefined)
+              : undefined,
+          error:
+            typeof verifyRes === 'object' && verifyRes && 'error' in verifyRes
+              ? String(verifyRes.error ?? '')
+              : undefined,
+        });
+
+        appendSessionMessage(sessionId, 'assistant', text);
+        upsertSession(sessionId, {
+          context: {
+            awaitingVerificationMethod: false,
+            pendingVerificationMethod: verifyRes?.ok ? undefined : chosenMethod,
+          },
+        });
+
+        console.log(
+          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=verification-method-chosen method=${chosenMethod} ok=${Boolean(verifyRes?.ok)}`,
+        );
+
+        return NextResponse.json({
+          text,
+          sessionId,
+          toolCalls: [{ name: 'start_verification', durationMs }],
+        });
+      }
+    }
   }
 
   // Build messages
@@ -1595,6 +2085,15 @@ export async function POST(
   if (session.context.lastNoSlots !== undefined) {
     stateHints.push(`lastNoSlots=${String(session.context.lastNoSlots)}`);
   }
+  if (session.context.awaitingRegistrationMethod) {
+    stateHints.push('awaitingRegistrationMethod=true');
+  }
+  if (session.context.pendingVerificationMethod) {
+    stateHints.push(`pendingVerificationMethod=${session.context.pendingVerificationMethod}`);
+  }
+  if (session.context.awaitingVerificationMethod) {
+    stateHints.push('awaitingVerificationMethod=true');
+  }
 
   const statePrompt =
     stateHints.length > 0
@@ -1707,6 +2206,8 @@ export async function POST(
           }
         }
 
+        const isContactPayloadMessage = looksLikeContactPayload(message);
+
         // When the user sends contact details, keep create_draft aligned with
         // the already reserved slot for this session.
         let reserveArgsInBatch:
@@ -1741,9 +2242,26 @@ export async function POST(
               }
             : null;
 
+        // If contacts are being provided, force reserve_slot to use the
+        // slot that is currently reserved in session context.
+        if (isContactPayloadMessage && reserveArgsFromSession) {
+          for (const call of toolCalls) {
+            if (call.name !== 'reserve_slot') continue;
+            const parsed = parsedArgsByCallId.get(call.id);
+            if (!parsed) continue;
+
+            parsed.masterId = reserveArgsFromSession.masterId;
+            parsed.startAt = reserveArgsFromSession.startAt;
+            parsed.endAt = reserveArgsFromSession.endAt;
+            parsed.sessionId = sessionId;
+            call.arguments = JSON.stringify(parsed);
+          }
+        }
+
         const createDraftArgsSource =
-          reserveArgsInBatch ??
-          (looksLikeContactPayload(message) ? reserveArgsFromSession : null);
+          isContactPayloadMessage
+            ? (reserveArgsFromSession ?? reserveArgsInBatch)
+            : reserveArgsInBatch;
 
         if (createDraftArgsSource) {
           for (const call of toolCalls) {
@@ -1773,6 +2291,8 @@ export async function POST(
 
         const results = await Promise.all(toolCalls.map(executeTool));
         const contextPatch: Partial<AiSession['context']> = {};
+        let reservedSlotJustCreated = false;
+        let bookingCompletedInBatch = false;
         let autoVerificationCandidate:
           | { draftId: string; email: string }
           | null = null;
@@ -1784,6 +2304,9 @@ export async function POST(
           contact?: string;
           ok: boolean;
         }> = [];
+        let slotTakenInBatch = false;
+        let slotTakenDateISO: string | undefined;
+        let slotTakenMasterId: string | undefined;
 
         // Add tool results to messages
         for (const result of results) {
@@ -1911,6 +2434,7 @@ export async function POST(
                   endAt: parsedArgs.endAt,
                 };
                 contextPatch.lastNoSlots = false;
+                reservedSlotJustCreated = true;
               }
 
               if (
@@ -1918,6 +2442,12 @@ export async function POST(
                 typeof parsedArgs?.startAt === 'string' &&
                 typeof parsedArgs?.endAt === 'string'
               ) {
+                slotTakenInBatch = true;
+                slotTakenDateISO = parsedArgs.startAt.slice(0, 10);
+                slotTakenMasterId =
+                  typeof parsedArgs.masterId === 'string'
+                    ? parsedArgs.masterId
+                    : slotTakenMasterId;
                 const sameAsCurrentReservation =
                   session.context.reservedSlot?.startAt === parsedArgs.startAt &&
                   session.context.reservedSlot?.endAt === parsedArgs.endAt;
@@ -1925,6 +2455,10 @@ export async function POST(
                 if (!sameAsCurrentReservation) {
                   contextPatch.reservedSlot = undefined;
                 }
+                contextPatch.draftId = undefined;
+                contextPatch.awaitingVerificationMethod = false;
+                contextPatch.awaitingRegistrationMethod = false;
+                contextPatch.pendingVerificationMethod = undefined;
               }
             } catch {
               // Ignore malformed payload
@@ -1985,11 +2519,24 @@ export async function POST(
                 draftId?: string;
                 error?: string;
               };
+
+              if (slotTakenInBatch) {
+                if (payload.draftId && !payload.error) {
+                  await prisma.bookingDraft
+                    .delete({ where: { id: payload.draftId } })
+                    .catch(() => {
+                      /* ignore cleanup errors */
+                    });
+                }
+                continue;
+              }
+
               const email =
                 typeof parsedArgs?.email === 'string' ? parsedArgs.email : null;
 
               if (payload.draftId && !payload.error) {
                 contextPatch.draftId = payload.draftId;
+                contextPatch.awaitingRegistrationMethod = false;
                 if (
                   typeof parsedArgs?.startAt === 'string' &&
                   typeof parsedArgs?.endAt === 'string'
@@ -2012,13 +2559,45 @@ export async function POST(
             try {
               const payload = JSON.parse(result.result) as {
                 ok?: boolean;
+                error?: string;
               };
 
               if (payload.ok) {
+                bookingCompletedInBatch = true;
+                contextPatch.selectedServiceIds = undefined;
+                contextPatch.selectedMasterId = undefined;
                 contextPatch.draftId = undefined;
                 contextPatch.reservedSlot = undefined;
+                contextPatch.lastDateISO = undefined;
+                contextPatch.lastPreferredTime = undefined;
                 contextPatch.lastSuggestedDateOptions = undefined;
                 contextPatch.lastNoSlots = false;
+                contextPatch.awaitingVerificationMethod = false;
+                contextPatch.awaitingRegistrationMethod = false;
+                contextPatch.pendingVerificationMethod = undefined;
+              }
+
+              if (payload.error === 'SLOT_TAKEN') {
+                slotTakenInBatch = true;
+                slotTakenMasterId = session.context.selectedMasterId ?? slotTakenMasterId;
+                slotTakenDateISO =
+                  session.context.reservedSlot?.startAt?.slice(0, 10) ??
+                  session.context.lastDateISO ??
+                  slotTakenDateISO;
+
+                const staleDraftId =
+                  typeof parsedArgs?.draftId === 'string' ? parsedArgs.draftId : undefined;
+                if (staleDraftId) {
+                  await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
+                    /* ignore cleanup errors */
+                  });
+                }
+
+                contextPatch.draftId = undefined;
+                contextPatch.reservedSlot = undefined;
+                contextPatch.awaitingVerificationMethod = false;
+                contextPatch.awaitingRegistrationMethod = false;
+                contextPatch.pendingVerificationMethod = undefined;
               }
             } catch {
               // Ignore malformed payload
@@ -2035,58 +2614,213 @@ export async function POST(
 
         if (Object.keys(contextPatch).length > 0) {
           upsertSession(sessionId, {
+            previousResponseId: bookingCompletedInBatch ? null : undefined,
             context: contextPatch,
           });
         }
 
+        if (slotTakenInBatch) {
+          const staleDraftId =
+            typeof contextPatch.draftId === 'string'
+              ? contextPatch.draftId
+              : typeof session.context.draftId === 'string'
+                ? session.context.draftId
+                : undefined;
+          if (staleDraftId) {
+            await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
+              /* ignore cleanup errors */
+            });
+          }
+
+          const masterIdForRecovery =
+            slotTakenMasterId ??
+            contextPatch.selectedMasterId ??
+            session.context.selectedMasterId;
+          const dateISOForRecovery =
+            slotTakenDateISO ??
+            session.context.lastDateISO ??
+            todayISO();
+          const serviceIdsForRecovery =
+            contextPatch.selectedServiceIds ??
+            session.context.selectedServiceIds ??
+            [];
+
+          let text: string;
+          if (masterIdForRecovery && serviceIdsForRecovery.length > 0) {
+            const availability = await searchAvailability({
+              masterId: masterIdForRecovery,
+              dateISO: dateISOForRecovery,
+              serviceIds: serviceIdsForRecovery,
+              preferredTime: 'any',
+            });
+
+            text = buildSlotTakenAlternativesText(
+              session.locale,
+              dateISOForRecovery,
+              availability.slots ?? [],
+            );
+          } else {
+            text = buildSlotTakenAlternativesText(
+              session.locale,
+              dateISOForRecovery,
+              [],
+            );
+          }
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
+            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=slot-taken-recovery date=${dateISOForRecovery}`,
+          );
+
+          return NextResponse.json({
+            text,
+            sessionId,
+            toolCalls: toolCallLog,
+          });
+        }
+
+        const hasDraftAfterTools = Object.prototype.hasOwnProperty.call(contextPatch, 'draftId')
+          ? Boolean(contextPatch.draftId)
+          : Boolean(session.context.draftId);
+        const pendingMethodAfterTools = Object.prototype.hasOwnProperty.call(
+          contextPatch,
+          'pendingVerificationMethod',
+        )
+          ? contextPatch.pendingVerificationMethod
+          : session.context.pendingVerificationMethod;
+
+        // After successful slot reserve, show registration method chooser only
+        // when method is not selected yet.
+        if (reservedSlotJustCreated && !hasDraftAfterTools && !pendingMethodAfterTools) {
+          const text = buildRegistrationMethodChoiceText(session.locale);
+          appendSessionMessage(sessionId, 'assistant', text);
+          upsertSession(sessionId, {
+            context: {
+              awaitingRegistrationMethod: true,
+              pendingVerificationMethod: undefined,
+              awaitingVerificationMethod: false,
+            },
+          });
+
+          console.log(
+            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=registration-method-choice-after-reserve`,
+          );
+
+          return NextResponse.json({
+            text,
+            sessionId,
+            toolCalls: toolCallLog,
+          });
+        }
+
         const matchedExplicitStart = autoVerificationCandidate
           ? explicitStartVerificationCalls.some(
-              (call) =>
-                call.ok &&
-                call.draftId === autoVerificationCandidate?.draftId &&
-                call.contact === autoVerificationCandidate?.email,
+              (call) => call.ok && call.draftId === autoVerificationCandidate?.draftId,
             )
           : false;
 
-        // Reliability guard:
-        // if model created draft but forgot start_verification
-        // OR started verification for a different draft/email, do it server-side.
         if (autoVerificationCandidate && (!hasExplicitStartVerification || !matchedExplicitStart)) {
-          const startedAt = Date.now();
-          const autoRes = await startVerification({
-            method: 'email_otp',
-            draftId: autoVerificationCandidate.draftId,
-            contact: autoVerificationCandidate.email,
+          const draftForChoice = await prisma.bookingDraft.findUnique({
+            where: { id: autoVerificationCandidate.draftId },
+            select: { email: true, phone: true },
           });
-          const durationMs = Date.now() - startedAt;
-
-          const text = buildVerificationAutoText(session.locale, {
-            ok: Boolean(autoRes?.ok),
-            contactMasked:
-              typeof autoRes === 'object' && autoRes && 'contactMasked' in autoRes
-                ? (autoRes.contactMasked as string | undefined)
-                : undefined,
-            error:
-              typeof autoRes === 'object' && autoRes && 'error' in autoRes
-                ? String(autoRes.error ?? '')
-                : undefined,
+
+          const selectedMethod = session.context.pendingVerificationMethod;
+
+          if (
+            selectedMethod &&
+            selectedMethod !== 'google_oauth' &&
+            (selectedMethod === 'email_otp' ||
+              selectedMethod === 'sms_otp' ||
+              selectedMethod === 'telegram_otp')
+          ) {
+            const contact = getContactForMethod(
+              selectedMethod,
+              draftForChoice?.email,
+              draftForChoice?.phone,
+            );
+
+            if (!contact) {
+              const text = buildMissingContactForMethodText(session.locale, selectedMethod);
+              appendSessionMessage(sessionId, 'assistant', text);
+
+              return NextResponse.json({
+                text,
+                sessionId,
+                toolCalls: toolCallLog,
+              });
+            }
+
+            const startedAt = Date.now();
+            const verifyRes = await startVerification({
+              method: selectedMethod,
+              draftId: autoVerificationCandidate.draftId,
+              contact,
+            });
+            const durationMs = Date.now() - startedAt;
+
+            const text = buildVerificationAutoText(session.locale, {
+              ok: Boolean(verifyRes?.ok),
+              contactMasked:
+                typeof verifyRes === 'object' && verifyRes && 'contactMasked' in verifyRes
+                  ? (verifyRes.contactMasked as string | undefined)
+                  : undefined,
+              error:
+                typeof verifyRes === 'object' && verifyRes && 'error' in verifyRes
+                  ? String(verifyRes.error ?? '')
+                  : undefined,
+            });
+
+            appendSessionMessage(sessionId, 'assistant', text);
+            upsertSession(sessionId, {
+              context: {
+                awaitingVerificationMethod: false,
+                pendingVerificationMethod: verifyRes?.ok ? undefined : selectedMethod,
+              },
+            });
+
+            console.log(
+              `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=verification-start-selected method=${selectedMethod} ok=${Boolean(verifyRes?.ok)}`,
+            );
+
+            return NextResponse.json({
+              text,
+              sessionId,
+              toolCalls: [...toolCallLog, { name: 'start_verification', durationMs }],
+            });
+          }
+
+          // Fallback: method not selected yet -> present choice after draft creation.
+          const text = buildVerificationMethodChoiceText(session.locale, {
+            hasEmail: Boolean(draftForChoice?.email),
+            hasPhone: Boolean(draftForChoice?.phone),
           });
 
           appendSessionMessage(sessionId, 'assistant', text);
-
-          const allToolCalls = [
-            ...toolCallLog,
-            { name: 'start_verification', durationMs },
-          ];
+          upsertSession(sessionId, {
+            context: {
+              awaitingVerificationMethod: true,
+            },
+          });
 
           console.log(
-            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=auto-start-verification ok=${Boolean(autoRes?.ok)}`,
+            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=verification-method-choice email=${Boolean(draftForChoice?.email)} phone=${Boolean(draftForChoice?.phone)}`,
           );
 
           return NextResponse.json({
             text,
             sessionId,
-            toolCalls: allToolCalls,
+            toolCalls: toolCallLog,
           });
         }
 
diff --git a/src/components/ai/ChatMessage.tsx b/src/components/ai/ChatMessage.tsx
index 4a25431..a8a8591 100644
--- a/src/components/ai/ChatMessage.tsx
+++ b/src/components/ai/ChatMessage.tsx
@@ -80,11 +80,37 @@ interface ContentProps {
 }
 
 /**
- * Parse [option]...[/option] tags and regular text.
+ * Parse [option]...[/option] tags (with optional attributes) and regular text.
  */
-function parseContent(content: string): Array<{ type: 'text'; value: string } | { type: 'option'; value: string }> {
-  const parts: Array<{ type: 'text'; value: string } | { type: 'option'; value: string }> = [];
-  const regex = /\[option\]\s*(.*?)\s*\[\/option\]/g;
+function parseOptionUrl(rawAttrs?: string): string | undefined {
+  if (!rawAttrs) return undefined;
+
+  const attrRegex = /([a-zA-Z_][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]+))/g;
+  let match: RegExpExecArray | null;
+  let rawUrl: string | undefined;
+
+  while ((match = attrRegex.exec(rawAttrs)) !== null) {
+    const key = match[1].toLowerCase();
+    const value = (match[2] ?? match[3] ?? match[4] ?? '').trim();
+    if (key === 'url') {
+      rawUrl = value;
+      break;
+    }
+  }
+
+  if (!rawUrl) return undefined;
+  if (rawUrl.startsWith('/booking/')) return rawUrl;
+  if (/^https?:\/\/[^/]+\/booking\//i.test(rawUrl)) return rawUrl;
+  return undefined;
+}
+
+type ParsedPart =
+  | { type: 'text'; value: string }
+  | { type: 'option'; value: string; url?: string };
+
+function parseContent(content: string): ParsedPart[] {
+  const parts: ParsedPart[] = [];
+  const regex = /\[option(?:\s+([^\]]+))?\]\s*([\s\S]*?)\s*\[\/option\]/gi;
 
   let lastIndex = 0;
   let match: RegExpExecArray | null;
@@ -94,7 +120,11 @@ function parseContent(content: string): Array<{ type: 'text'; value: string } |
     if (match.index > lastIndex) {
       parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
     }
-    parts.push({ type: 'option', value: match[1] });
+    parts.push({
+      type: 'option',
+      value: match[2],
+      url: parseOptionUrl(match[1]),
+    });
     lastIndex = regex.lastIndex;
   }
 
@@ -119,7 +149,7 @@ function MessageContent({ content, onOptionClick }: ContentProps) {
 
   // Mixed: text paragraphs + option buttons
   const textParts: string[] = [];
-  const options: string[] = [];
+  const options: Array<{ label: string; url?: string }> = [];
 
   for (const part of parts) {
     if (part.type === 'text') {
@@ -131,7 +161,7 @@ function MessageContent({ content, onOptionClick }: ContentProps) {
       const trimmed = cleaned.trim();
       if (trimmed) textParts.push(trimmed);
     } else {
-      options.push(part.value);
+      options.push({ label: part.value, url: part.url });
     }
   }
 
@@ -145,23 +175,32 @@ function MessageContent({ content, onOptionClick }: ContentProps) {
       {/* Option buttons */}
       {options.length > 0 && (
         <div className="flex flex-col gap-1.5 pt-1">
-          {options.map((opt, i) => (
+          {options.map((opt, i) => {
+            const isClickable = Boolean(opt.url || onOptionClick);
+            return (
             <button
               key={`o-${i}`}
-              onClick={() => onOptionClick?.(stripEmoji(opt))}
-              disabled={!onOptionClick}
+              onClick={() => {
+                if (opt.url) {
+                  window.location.assign(opt.url);
+                  return;
+                }
+                onOptionClick?.(stripEmoji(opt.label));
+              }}
+              disabled={!isClickable}
               className="w-full rounded-lg px-3 py-2 text-left text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-default"
               style={{
-                background: onOptionClick
+                background: isClickable
                   ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 212, 255, 0.08) 100%)'
                   : 'rgba(255, 255, 255, 0.03)',
                 border: '1px solid rgba(255, 215, 0, 0.2)',
-                color: onOptionClick ? '#FFD700' : '#888',
+                color: isClickable ? '#FFD700' : '#888',
               }}
             >
-              {opt}
+              {opt.label}
             </button>
-          ))}
+          );
+          })}
         </div>
       )}
     </div>
diff --git a/src/lib/ai/missing-service-report.ts b/src/lib/ai/missing-service-report.ts
index 54e65e0..5343efb 100644
--- a/src/lib/ai/missing-service-report.ts
+++ b/src/lib/ai/missing-service-report.ts
@@ -1,88 +1,148 @@
 // src/lib/ai/missing-service-report.ts
-// Persist and notify when AI could not match a requested service.
+// Reports when users ask for services that don't exist in the catalog.
+// Useful for salon owner to see demand for new services.
 
-import { prisma } from '@/lib/prisma';
-import { sendAdminMissingServiceNotification } from '@/lib/send-admin-notification';
+import type { ChatHistoryEntry } from './session-store';
 
-interface AlternativeItem {
-  title: string;
-  groupTitle?: string | null;
-  durationMin?: number | null;
-  priceCents?: number | null;
-}
-
-interface SessionMessage {
-  role: 'user' | 'assistant';
-  content: string;
-  at?: string;
-}
-
-interface ReportMissingServiceArgs {
+interface MissingServiceReport {
   sessionId: string;
   locale: string;
   query: string;
-  transcript: SessionMessage[];
-  alternatives?: AlternativeItem[];
-}
-
-function compactText(value: string, max = 1000): string {
-  return value.replace(/\s+/g, ' ').trim().slice(0, max);
+  transcript: ChatHistoryEntry[];
+  alternatives: Array<{
+    title: string;
+    groupTitle?: string | null;
+    durationMin?: number | null;
+    priceCents?: number | null;
+  }>;
 }
 
+/**
+ * Report a missing service inquiry.
+ * Currently logs to console; extend to write to DB table or send Telegram notification.
+ */
 export async function reportMissingServiceInquiry(
-  args: ReportMissingServiceArgs,
-): Promise<{ ok: true; logId: string } | { ok: false; error: string }> {
-  const query = compactText(args.query, 300);
-  if (!query) return { ok: false, error: 'EMPTY_QUERY' };
-
-  const transcript = (args.transcript ?? []).slice(-20).map((m) => ({
-    role: m.role,
-    content: compactText(m.content, 800),
-    at: m.at ?? new Date().toISOString(),
-  }));
-
-  const alternatives = (args.alternatives ?? []).slice(0, 12).map((a) => ({
-    title: compactText(a.title, 120),
-    groupTitle: a.groupTitle ? compactText(a.groupTitle, 120) : null,
-    durationMin: typeof a.durationMin === 'number' ? a.durationMin : null,
-    priceCents: typeof a.priceCents === 'number' ? a.priceCents : null,
-  }));
-
-  try {
-    const created = await prisma.booking.create({
-      data: {
-        name: 'AI Missing Service',
-        phone: `AI-${args.sessionId.slice(0, 20)}`,
-        email: null,
-        message: JSON.stringify(
-          {
-            type: 'ai_missing_service',
-            createdAt: new Date().toISOString(),
-            sessionId: args.sessionId,
-            locale: args.locale,
-            query,
-            alternatives,
-            transcript,
-          },
-          null,
-          2,
-        ),
-      },
-      select: { id: true },
-    });
-
-    await sendAdminMissingServiceNotification({
-      sessionId: args.sessionId,
-      locale: args.locale,
-      query,
-      bookingLogId: created.id,
-      alternatives,
-      transcript,
-    });
-
-    return { ok: true, logId: created.id };
-  } catch (error) {
-    console.error('[AI Missing Service] Failed to persist/report:', error);
-    return { ok: false, error: 'PERSIST_FAILED' };
+  report: MissingServiceReport,
+): Promise<void> {
+  const altNames = report.alternatives.map((a) => a.title).join(', ');
+  const lastMessages = report.transcript
+    .slice(-4)
+    .map((m) => `[${m.role}] ${m.content.slice(0, 100)}`)
+    .join('\n  ');
+
+  console.log(
+    `[Missing Service] session=${report.sessionId.slice(0, 8)}... ` +
+      `locale=${report.locale} query="${report.query}" ` +
+      `alternatives=[${altNames}]`,
+  );
+
+  if (lastMessages) {
+    console.log(`  Recent context:\n  ${lastMessages}`);
   }
+
+  // TODO: Extend with one of:
+  // 1. Write to Prisma `MissingServiceLog` table
+  // 2. Send Telegram notification to admin
+  // 3. Aggregate and email weekly digest
+  //
+  // Example Prisma extension:
+  // await prisma.missingServiceLog.create({
+  //   data: {
+  //     sessionId: report.sessionId,
+  //     locale: report.locale,
+  //     query: report.query,
+  //     alternativesSuggested: altNames,
+  //   },
+  // });
 }
+
+
+
+// // src/lib/ai/missing-service-report.ts
+// // Persist and notify when AI could not match a requested service.
+
+// import { prisma } from '@/lib/prisma';
+// import { sendAdminMissingServiceNotification } from '@/lib/send-admin-notification';
+
+// interface AlternativeItem {
+//   title: string;
+//   groupTitle?: string | null;
+//   durationMin?: number | null;
+//   priceCents?: number | null;
+// }
+
+// interface SessionMessage {
+//   role: 'user' | 'assistant';
+//   content: string;
+//   at?: string;
+// }
+
+// interface ReportMissingServiceArgs {
+//   sessionId: string;
+//   locale: string;
+//   query: string;
+//   transcript: SessionMessage[];
+//   alternatives?: AlternativeItem[];
+// }
+
+// function compactText(value: string, max = 1000): string {
+//   return value.replace(/\s+/g, ' ').trim().slice(0, max);
+// }
+
+// export async function reportMissingServiceInquiry(
+//   args: ReportMissingServiceArgs,
+// ): Promise<{ ok: true; logId: string } | { ok: false; error: string }> {
+//   const query = compactText(args.query, 300);
+//   if (!query) return { ok: false, error: 'EMPTY_QUERY' };
+
+//   const transcript = (args.transcript ?? []).slice(-20).map((m) => ({
+//     role: m.role,
+//     content: compactText(m.content, 800),
+//     at: m.at ?? new Date().toISOString(),
+//   }));
+
+//   const alternatives = (args.alternatives ?? []).slice(0, 12).map((a) => ({
+//     title: compactText(a.title, 120),
+//     groupTitle: a.groupTitle ? compactText(a.groupTitle, 120) : null,
+//     durationMin: typeof a.durationMin === 'number' ? a.durationMin : null,
+//     priceCents: typeof a.priceCents === 'number' ? a.priceCents : null,
+//   }));
+
+//   try {
+//     const created = await prisma.booking.create({
+//       data: {
+//         name: 'AI Missing Service',
+//         phone: `AI-${args.sessionId.slice(0, 20)}`,
+//         email: null,
+//         message: JSON.stringify(
+//           {
+//             type: 'ai_missing_service',
+//             createdAt: new Date().toISOString(),
+//             sessionId: args.sessionId,
+//             locale: args.locale,
+//             query,
+//             alternatives,
+//             transcript,
+//           },
+//           null,
+//           2,
+//         ),
+//       },
+//       select: { id: true },
+//     });
+
+//     await sendAdminMissingServiceNotification({
+//       sessionId: args.sessionId,
+//       locale: args.locale,
+//       query,
+//       bookingLogId: created.id,
+//       alternatives,
+//       transcript,
+//     });
+
+//     return { ok: true, logId: created.id };
+//   } catch (error) {
+//     console.error('[AI Missing Service] Failed to persist/report:', error);
+//     return { ok: false, error: 'PERSIST_FAILED' };
+//   }
+// }
diff --git a/src/lib/ai/session-store.ts b/src/lib/ai/session-store.ts
index c5c66ae..ff1e655 100644
--- a/src/lib/ai/session-store.ts
+++ b/src/lib/ai/session-store.ts
@@ -6,6 +6,18 @@ import type { Locale } from '@/i18n/locales';
 
 // ─── Types ──────────────────────────────────────────────────────
 
+export interface ChatHistoryEntry {
+  role: 'user' | 'assistant';
+  content: string;
+  timestamp: number;
+}
+
+export interface DateSuggestionOption {
+  dateISO: string;
+  label: string;
+  count: number;
+}
+
 export interface AiSession {
   id: string;
   /** OpenAI Responses API: previous response_id for multi-turn */
@@ -17,27 +29,32 @@ export interface AiSession {
   context: {
     selectedServiceIds?: string[];
     selectedMasterId?: string;
-    lastSuggestedDateOptions?: Array<{
-      dateISO: string;
-      label: string;
-      count: number;
-    }>;
+    reservedSlot?: { startAt: string; endAt: string };
+    draftId?: string;
+    /** Last searched date */
     lastDateISO?: string;
+    /** Last preferred time filter */
     lastPreferredTime?: 'morning' | 'afternoon' | 'evening' | 'any';
+    /** Whether last availability search returned 0 slots */
     lastNoSlots?: boolean;
-    reservedSlot?: { startAt: string; endAt: string };
-    draftId?: string;
-    chatHistory?: SessionMessage[];
+    /** Date options suggested to user for selection */
+    lastSuggestedDateOptions?: DateSuggestionOption[];
+    /** Chat history for multi-turn context */
+    chatHistory?: ChatHistoryEntry[];
+    /** Tracked missing service queries (to avoid duplicate reports) */
     reportedMissingQueries?: string[];
+    /** Whether we're waiting for user to pick registration method after slot reserve */
+    awaitingRegistrationMethod?: boolean;
+    /**
+     * Method selected by user for verification after draft creation.
+     * google_oauth is handled as a handoff to booking/client Google flow.
+     */
+    pendingVerificationMethod?: 'email_otp' | 'sms_otp' | 'telegram_otp' | 'google_oauth';
+    /** Whether we're waiting for user to pick verification method */
+    awaitingVerificationMethod?: boolean;
   };
 }
 
-export interface SessionMessage {
-  role: 'user' | 'assistant';
-  content: string;
-  at: string;
-}
-
 // ─── Store ──────────────────────────────────────────────────────
 
 declare global {
@@ -67,6 +84,7 @@ const rateLimits = getRateLimits();
 // ─── Session management ─────────────────────────────────────────
 
 const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
+const MAX_CHAT_HISTORY = 32; // Keep last N messages
 
 export function getSession(sessionId: string): AiSession | null {
   const session = sessions.get(sessionId);
@@ -95,6 +113,7 @@ export function upsertSession(
       existing.locale = updates.locale;
     }
     if (updates.context) {
+      // Merge context, preserving chatHistory unless explicitly overridden
       existing.context = { ...existing.context, ...updates.context };
     }
     existing.lastActiveAt = new Date();
@@ -115,29 +134,37 @@ export function upsertSession(
   return newSession;
 }
 
+/**
+ * Append a message to the session's chat history.
+ * Automatically trims to MAX_CHAT_HISTORY entries.
+ */
 export function appendSessionMessage(
   sessionId: string,
-  role: SessionMessage['role'],
+  role: 'user' | 'assistant',
   content: string,
-): AiSession {
-  const session = upsertSession(sessionId, {});
-  const trimmed = content.trim();
-  if (!trimmed) return session;
-
-  const nextHistory = [
-    ...(session.context.chatHistory ?? []),
-    {
-      role,
-      content: trimmed.slice(0, 4000),
-      at: new Date().toISOString(),
-    },
-  ].slice(-40);
-
-  return upsertSession(sessionId, {
-    context: {
-      chatHistory: nextHistory,
-    },
+): void {
+  const session = getSession(sessionId);
+  if (!session) return;
+
+  if (!session.context.chatHistory) {
+    session.context.chatHistory = [];
+  }
+
+  session.context.chatHistory.push({
+    role,
+    content,
+    timestamp: Date.now(),
   });
+
+  // Trim to keep memory bounded
+  if (session.context.chatHistory.length > MAX_CHAT_HISTORY) {
+    session.context.chatHistory = session.context.chatHistory.slice(
+      -MAX_CHAT_HISTORY,
+    );
+  }
+
+  session.lastActiveAt = new Date();
+  sessions.set(sessionId, session);
 }
 
 // ─── Rate limiting ──────────────────────────────────────────────
@@ -198,3 +225,428 @@ function cleanup() {
 if (typeof setInterval !== 'undefined') {
   setInterval(cleanup, 5 * 60 * 1000);
 }
+
+
+
+
+// // src/lib/ai/session-store.ts
+// // In-memory session store for AI assistant conversations.
+// // For production with multiple instances, replace with Redis.
+
+// import type { Locale } from '@/i18n/locales';
+
+// // ─── Types ──────────────────────────────────────────────────────
+
+// export interface ChatHistoryEntry {
+//   role: 'user' | 'assistant';
+//   content: string;
+//   timestamp: number;
+// }
+
+// export interface DateSuggestionOption {
+//   dateISO: string;
+//   label: string;
+//   count: number;
+// }
+
+// export interface AiSession {
+//   id: string;
+//   /** OpenAI Responses API: previous response_id for multi-turn */
+//   previousResponseId: string | null;
+//   locale: Locale;
+//   createdAt: Date;
+//   lastActiveAt: Date;
+//   /** Accumulated context for the session */
+//   context: {
+//     selectedServiceIds?: string[];
+//     selectedMasterId?: string;
+//     reservedSlot?: { startAt: string; endAt: string };
+//     draftId?: string;
+//     /** Last searched date */
+//     lastDateISO?: string;
+//     /** Last preferred time filter */
+//     lastPreferredTime?: 'morning' | 'afternoon' | 'evening' | 'any';
+//     /** Whether last availability search returned 0 slots */
+//     lastNoSlots?: boolean;
+//     /** Date options suggested to user for selection */
+//     lastSuggestedDateOptions?: DateSuggestionOption[];
+//     /** Chat history for multi-turn context */
+//     chatHistory?: ChatHistoryEntry[];
+//     /** Tracked missing service queries (to avoid duplicate reports) */
+//     reportedMissingQueries?: string[];
+//   };
+// }
+
+// // ─── Store ──────────────────────────────────────────────────────
+
+// declare global {
+//   // eslint-disable-next-line no-var
+//   var __aiSessionStore: Map<string, AiSession> | undefined;
+//   // eslint-disable-next-line no-var
+//   var __aiRateLimitStore: Map<string, number[]> | undefined;
+// }
+
+// function getSessions(): Map<string, AiSession> {
+//   if (!global.__aiSessionStore) {
+//     global.__aiSessionStore = new Map();
+//   }
+//   return global.__aiSessionStore;
+// }
+
+// function getRateLimits(): Map<string, number[]> {
+//   if (!global.__aiRateLimitStore) {
+//     global.__aiRateLimitStore = new Map();
+//   }
+//   return global.__aiRateLimitStore;
+// }
+
+// const sessions = getSessions();
+// const rateLimits = getRateLimits();
+
+// // ─── Session management ─────────────────────────────────────────
+
+// const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
+// const MAX_CHAT_HISTORY = 32; // Keep last N messages
+
+// export function getSession(sessionId: string): AiSession | null {
+//   const session = sessions.get(sessionId);
+//   if (!session) return null;
+
+//   // Check expiry
+//   if (Date.now() - session.lastActiveAt.getTime() > SESSION_TTL_MS) {
+//     sessions.delete(sessionId);
+//     return null;
+//   }
+
+//   return session;
+// }
+
+// export function upsertSession(
+//   sessionId: string,
+//   updates: Partial<Pick<AiSession, 'previousResponseId' | 'locale' | 'context'>>,
+// ): AiSession {
+//   const existing = getSession(sessionId);
+
+//   if (existing) {
+//     if (updates.previousResponseId !== undefined) {
+//       existing.previousResponseId = updates.previousResponseId;
+//     }
+//     if (updates.locale) {
+//       existing.locale = updates.locale;
+//     }
+//     if (updates.context) {
+//       // Merge context, preserving chatHistory unless explicitly overridden
+//       existing.context = { ...existing.context, ...updates.context };
+//     }
+//     existing.lastActiveAt = new Date();
+//     sessions.set(sessionId, existing);
+//     return existing;
+//   }
+
+//   const newSession: AiSession = {
+//     id: sessionId,
+//     previousResponseId: updates.previousResponseId ?? null,
+//     locale: updates.locale ?? 'de',
+//     createdAt: new Date(),
+//     lastActiveAt: new Date(),
+//     context: updates.context ?? {},
+//   };
+
+//   sessions.set(sessionId, newSession);
+//   return newSession;
+// }
+
+// /**
+//  * Append a message to the session's chat history.
+//  * Automatically trims to MAX_CHAT_HISTORY entries.
+//  */
+// export function appendSessionMessage(
+//   sessionId: string,
+//   role: 'user' | 'assistant',
+//   content: string,
+// ): void {
+//   const session = getSession(sessionId);
+//   if (!session) return;
+
+//   if (!session.context.chatHistory) {
+//     session.context.chatHistory = [];
+//   }
+
+//   session.context.chatHistory.push({
+//     role,
+//     content,
+//     timestamp: Date.now(),
+//   });
+
+//   // Trim to keep memory bounded
+//   if (session.context.chatHistory.length > MAX_CHAT_HISTORY) {
+//     session.context.chatHistory = session.context.chatHistory.slice(
+//       -MAX_CHAT_HISTORY,
+//     );
+//   }
+
+//   session.lastActiveAt = new Date();
+//   sessions.set(sessionId, session);
+// }
+
+// // ─── Rate limiting ──────────────────────────────────────────────
+
+// const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
+// const RATE_LIMIT_MAX = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '20', 10);
+
+// /**
+//  * Check if a request from this key is within rate limits.
+//  * Returns { allowed: true } or { allowed: false, retryAfterMs }.
+//  */
+// export function checkRateLimit(
+//   key: string,
+// ): { allowed: true } | { allowed: false; retryAfterMs: number } {
+//   const now = Date.now();
+//   const windowStart = now - RATE_LIMIT_WINDOW_MS;
+
+//   // Get timestamps for this key, filter to current window
+//   const timestamps = (rateLimits.get(key) || []).filter((t) => t > windowStart);
+
+//   if (timestamps.length >= RATE_LIMIT_MAX) {
+//     const oldest = timestamps[0];
+//     const retryAfterMs = oldest + RATE_LIMIT_WINDOW_MS - now;
+//     return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
+//   }
+
+//   timestamps.push(now);
+//   rateLimits.set(key, timestamps);
+
+//   return { allowed: true };
+// }
+
+// // ─── Periodic cleanup ───────────────────────────────────────────
+
+// function cleanup() {
+//   const now = Date.now();
+
+//   // Clean expired sessions
+//   for (const [id, session] of sessions.entries()) {
+//     if (now - session.lastActiveAt.getTime() > SESSION_TTL_MS) {
+//       sessions.delete(id);
+//     }
+//   }
+
+//   // Clean old rate limit entries
+//   const windowStart = now - RATE_LIMIT_WINDOW_MS * 2;
+//   for (const [key, timestamps] of rateLimits.entries()) {
+//     const filtered = timestamps.filter((t) => t > windowStart);
+//     if (filtered.length === 0) {
+//       rateLimits.delete(key);
+//     } else {
+//       rateLimits.set(key, filtered);
+//     }
+//   }
+// }
+
+// // Run cleanup every 5 minutes
+// if (typeof setInterval !== 'undefined') {
+//   setInterval(cleanup, 5 * 60 * 1000);
+// }
+
+
+
+// // src/lib/ai/session-store.ts
+// // In-memory session store for AI assistant conversations.
+// // For production with multiple instances, replace with Redis.
+
+// import type { Locale } from '@/i18n/locales';
+
+// // ─── Types ──────────────────────────────────────────────────────
+
+// export interface AiSession {
+//   id: string;
+//   /** OpenAI Responses API: previous response_id for multi-turn */
+//   previousResponseId: string | null;
+//   locale: Locale;
+//   createdAt: Date;
+//   lastActiveAt: Date;
+//   /** Accumulated context for the session */
+//   context: {
+//     selectedServiceIds?: string[];
+//     selectedMasterId?: string;
+//     lastSuggestedDateOptions?: Array<{
+//       dateISO: string;
+//       label: string;
+//       count: number;
+//     }>;
+//     lastDateISO?: string;
+//     lastPreferredTime?: 'morning' | 'afternoon' | 'evening' | 'any';
+//     lastNoSlots?: boolean;
+//     reservedSlot?: { startAt: string; endAt: string };
+//     draftId?: string;
+//     chatHistory?: SessionMessage[];
+//     reportedMissingQueries?: string[];
+//   };
+// }
+
+// export interface SessionMessage {
+//   role: 'user' | 'assistant';
+//   content: string;
+//   at: string;
+// }
+
+// // ─── Store ──────────────────────────────────────────────────────
+
+// declare global {
+//   // eslint-disable-next-line no-var
+//   var __aiSessionStore: Map<string, AiSession> | undefined;
+//   // eslint-disable-next-line no-var
+//   var __aiRateLimitStore: Map<string, number[]> | undefined;
+// }
+
+// function getSessions(): Map<string, AiSession> {
+//   if (!global.__aiSessionStore) {
+//     global.__aiSessionStore = new Map();
+//   }
+//   return global.__aiSessionStore;
+// }
+
+// function getRateLimits(): Map<string, number[]> {
+//   if (!global.__aiRateLimitStore) {
+//     global.__aiRateLimitStore = new Map();
+//   }
+//   return global.__aiRateLimitStore;
+// }
+
+// const sessions = getSessions();
+// const rateLimits = getRateLimits();
+
+// // ─── Session management ─────────────────────────────────────────
+
+// const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
+
+// export function getSession(sessionId: string): AiSession | null {
+//   const session = sessions.get(sessionId);
+//   if (!session) return null;
+
+//   // Check expiry
+//   if (Date.now() - session.lastActiveAt.getTime() > SESSION_TTL_MS) {
+//     sessions.delete(sessionId);
+//     return null;
+//   }
+
+//   return session;
+// }
+
+// export function upsertSession(
+//   sessionId: string,
+//   updates: Partial<Pick<AiSession, 'previousResponseId' | 'locale' | 'context'>>,
+// ): AiSession {
+//   const existing = getSession(sessionId);
+
+//   if (existing) {
+//     if (updates.previousResponseId !== undefined) {
+//       existing.previousResponseId = updates.previousResponseId;
+//     }
+//     if (updates.locale) {
+//       existing.locale = updates.locale;
+//     }
+//     if (updates.context) {
+//       existing.context = { ...existing.context, ...updates.context };
+//     }
+//     existing.lastActiveAt = new Date();
+//     sessions.set(sessionId, existing);
+//     return existing;
+//   }
+
+//   const newSession: AiSession = {
+//     id: sessionId,
+//     previousResponseId: updates.previousResponseId ?? null,
+//     locale: updates.locale ?? 'de',
+//     createdAt: new Date(),
+//     lastActiveAt: new Date(),
+//     context: updates.context ?? {},
+//   };
+
+//   sessions.set(sessionId, newSession);
+//   return newSession;
+// }
+
+// export function appendSessionMessage(
+//   sessionId: string,
+//   role: SessionMessage['role'],
+//   content: string,
+// ): AiSession {
+//   const session = upsertSession(sessionId, {});
+//   const trimmed = content.trim();
+//   if (!trimmed) return session;
+
+//   const nextHistory = [
+//     ...(session.context.chatHistory ?? []),
+//     {
+//       role,
+//       content: trimmed.slice(0, 4000),
+//       at: new Date().toISOString(),
+//     },
+//   ].slice(-40);
+
+//   return upsertSession(sessionId, {
+//     context: {
+//       chatHistory: nextHistory,
+//     },
+//   });
+// }
+
+// // ─── Rate limiting ──────────────────────────────────────────────
+
+// const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
+// const RATE_LIMIT_MAX = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '20', 10);
+
+// /**
+//  * Check if a request from this key is within rate limits.
+//  * Returns { allowed: true } or { allowed: false, retryAfterMs }.
+//  */
+// export function checkRateLimit(
+//   key: string,
+// ): { allowed: true } | { allowed: false; retryAfterMs: number } {
+//   const now = Date.now();
+//   const windowStart = now - RATE_LIMIT_WINDOW_MS;
+
+//   // Get timestamps for this key, filter to current window
+//   const timestamps = (rateLimits.get(key) || []).filter((t) => t > windowStart);
+
+//   if (timestamps.length >= RATE_LIMIT_MAX) {
+//     const oldest = timestamps[0];
+//     const retryAfterMs = oldest + RATE_LIMIT_WINDOW_MS - now;
+//     return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
+//   }
+
+//   timestamps.push(now);
+//   rateLimits.set(key, timestamps);
+
+//   return { allowed: true };
+// }
+
+// // ─── Periodic cleanup ───────────────────────────────────────────
+
+// function cleanup() {
+//   const now = Date.now();
+
+//   // Clean expired sessions
+//   for (const [id, session] of sessions.entries()) {
+//     if (now - session.lastActiveAt.getTime() > SESSION_TTL_MS) {
+//       sessions.delete(id);
+//     }
+//   }
+
+//   // Clean old rate limit entries
+//   const windowStart = now - RATE_LIMIT_WINDOW_MS * 2;
+//   for (const [key, timestamps] of rateLimits.entries()) {
+//     const filtered = timestamps.filter((t) => t > windowStart);
+//     if (filtered.length === 0) {
+//       rateLimits.delete(key);
+//     } else {
+//       rateLimits.set(key, filtered);
+//     }
+//   }
+// }
+
+// // Run cleanup every 5 minutes
+// if (typeof setInterval !== 'undefined') {
+//   setInterval(cleanup, 5 * 60 * 1000);
+// }
diff --git a/src/lib/ai/system-prompt.ts b/src/lib/ai/system-prompt.ts
index 934803d..abc69bb 100644
--- a/src/lib/ai/system-prompt.ts
+++ b/src/lib/ai/system-prompt.ts
@@ -75,14 +75,8 @@ HARTE REGELN (NIEMALS BRECHEN)
 6. Maximal 1–2 Fragen gleichzeitig. Nicht überladen.
 7. Bei keinen freien Terminen → Alternativen vorschlagen
    (anderer Tag/Meister). Nie eine Sackgasse.
-8. Wenn der Benutzer nach etwas fragt, das nichts mit dem Salon zu tun hat
-   (Smalltalk, private Fragen, Flirt, Mathematik, Übersetzungen, Wetter,
-   Wochentage, Trivia usw.), ANTWORTE NICHT inhaltlich.
-   Stattdessen: 1 kurzer Satz zur Eingrenzung + direkte Rückführung auf
-   Buchung/Leistungen/Adresse.
-9. Wenn der Benutzer im laufenden Buchungsdialog auf deine letzte Frage antwortet
-   (z.B. Datum/Uhrzeit/Präferenz), setze den aktuellen Schritt fort und starte
-   NICHT wieder bei der Dienstauswahl.
+8. Wenn der Benutzer nach etwas fragt, das nichts mit dem Salon zu tun hat,
+   antworte höflich und leite zurück zum Buchungsthema.
 
 ═══════════════════════════════════════════════════
 SALON-WISSEN (FAQ)
@@ -124,38 +118,19 @@ BUCHUNGS-DIALOG (STANDARDFLUSS)
 
 Schritt A — DIENST BESTIMMEN
   • Wenn Benutzer beschreibt ("Ich möchte meine Nägel machen lassen")
-    → Tool list_services aufrufen und ALLE passenden Optionen zeigen (kein 3–5 Limit).
-  • Wenn Kunde "alle", "voller Preis", "ganze Liste" fragt → vollständige Liste zeigen.
-  • Wenn list_services noMatches=true:
-    - ehrlich sagen, dass exakt diese Leistung nicht gefunden wurde,
-    - den Kunden fragen, welche Leistung genau gemeint ist,
-    - 3–8 naheliegende Alternativen aus suggestedAlternatives anbieten.
+    → Tool list_services aufrufen, 3–5 passende Optionen vorschlagen.
   • Bei Mehrfachwahl: Gesamtdauer = Summe aller durationMin.
   • Preis in Euro anzeigen: priceCents / 100, z.B. "35,00 €".
 
 Schritt B — MEISTER BESTIMMEN
   • Tool list_masters_for_services aufrufen.
-  • Wenn Tool requiresSpecificService=true oder error=NO_BOOKABLE_SERVICE_SELECTED:
-    - Meister NICHT anbieten,
-    - zurück zur konkreten Dienstauswahl (Unterdienst) gehen,
-    - list_services mit passender query aufrufen und konkrete Leistungen zeigen.
   • Wenn nur 1 Meister → automatisch zuweisen, Kunden informieren.
   • Wenn mehrere → kurz vorstellen (Name + Bio), fragen.
   • Wenn "mir egal" / "egal" → erstmöglichen verfügbaren wählen.
 
 Schritt C — TAG + ZEITPRÄFERENZ
   • Fragen: "Welcher Tag passt Ihnen?" + "Vormittag/Nachmittag/Abend?"
-  • Wenn du nach Zeitpräferenz fragst, gib IMMER klickbare Optionen
-    in der Sprache des Benutzers:
-    [option] 🌅 Vormittag [/option]
-    [option] 🌤 Nachmittag [/option]
-    [option] 🌙 Abend [/option]
-    [option] 📅 Nächstes Datum [/option]
-    [option] 📅 Morgen [/option]
   • Heute oder morgen? → konkretes Datum berechnen.
-  • Wenn Dienst + Meister bereits gewählt sind und der Kunde eine Zeit nennt
-    (z.B. "morgen um 10"), NICHT erneut list_services aufrufen.
-    Stattdessen direkt search_availability für den genannten Tag/Zeitpräferenz.
   • Tool search_availability aufrufen.
   • Zeitfenster-Mapping:
     - "Vormittag/morgens" → startMinutes < 720 (vor 12:00)
@@ -168,18 +143,23 @@ Schritt D — SLOT WÄHLEN & RESERVIEREN
   • SOFORT Tool reserve_slot aufrufen (5 Min. Reservierung).
   • Bei Konflikt (409) → entschuldigen, neue Slots suchen.
 
-Schritt E — KONTAKTDATEN SAMMELN
-  • Erforderlich: Name + E-Mail.
-  • Optional: Telefon, Geburtsdatum, Anmerkungen.
+Schritt E — REGISTRIERUNGSMETHODE WÄHLEN
+  • DIREKT nach reserve_slot: Methode wählen lassen
+    (Google / Telegram / SMS / E-Mail).
+  • Keine Kontaktdaten abfragen, bevor die Methode gewählt ist.
+
+Schritt F — KONTAKTDATEN SAMMELN (METHODENABHÄNGIG)
+  • E-Mail: Name + E-Mail.
+  • SMS/Telegram: Name + Telefon + E-Mail.
   • DSGVO-Hinweis:
     "Ihre Daten werden ausschließlich für die Terminverwaltung verwendet."
 
-Schritt F — DRAFT ERSTELLEN + VERIFIZIEREN
-  • Tool create_draft mit allen gesammelten Daten.
-  • Tool start_verification (email_otp).
-  • Dem Kunden sagen: "Ein 6-stelliger Code wurde an Ihre E-Mail gesendet."
+Schritt G — DRAFT + CODE SENDEN
+  • Tool create_draft mit den gesammelten Daten.
+  • Danach Tool start_verification mit der gewählten Methode.
+  • Dem Kunden sagen: "Ein 6-stelliger Code wurde an [Kanal] gesendet."
 
-Schritt G — ABSCHLUSS
+Schritt H — ABSCHLUSS
   • Kunde gibt Code ein → Tool complete_booking.
   • Bei Erfolg → Bestätigung:
     ✅ Dienst, Meister, Datum/Uhrzeit, Dauer
@@ -189,12 +169,11 @@ Schritt G — ABSCHLUSS
 FEHLERBEHANDLUNG
 ═══════════════════════════════════════════════════
 • Leere Slots → "Leider ist [Tag] ausgebucht. Soll ich [nächsten Tag] prüfen?"
-• Wenn Kunde danach mit "ja/да/ok/проверь" zustimmt:
-  - NICHT zur Dienstauswahl zurückgehen,
-  - direkt search_availability_month oder search_availability mit nächstem Tag ausführen.
 • splitRequired=true → "Dieser Meister bietet nicht alle Dienste an. Anderer Meister?"
 • reserve_slot 409 → "Dieser Termin wurde gerade vergeben. Hier sind Alternativen: ..."
 • Ungültiger OTP → "Der Code ist falsch oder abgelaufen. Neuen Code senden?"
+• TELEGRAM_NOT_REGISTERED → "Ihr Telefon ist nicht mit unserem Telegram-Bot verbunden. Verwenden Sie bitte E-Mail."
+• SMS_NOT_CONFIGURED → SMS nicht verfügbar, E-Mail-Verifizierung verwenden.
 • SLOT_TAKEN bei complete → "Der Termin wurde vergeben. Ich suche Alternativen..."
 • Datenverarbeitung abgelehnt → "Kein Problem! Rufen Sie uns an: +49 177 899 51 06"
 
@@ -237,3 +216,245 @@ FORMATIERUNG VON OPTIONEN (WICHTIG!)
 • Nutze IMMER passende Emojis am Anfang der Option.
 • KEIN Nummerierung (1. 2. 3.) verwenden — nur [option] Tags.
 `;
+
+
+
+// // src/lib/ai/system-prompt.ts
+
+// import { ORG_TZ } from '@/lib/orgTime';
+
+// /**
+//  * Builds the system prompt with dynamic context (current date, timezone).
+//  */
+// export function buildSystemPrompt(locale?: string): string {
+//   const now = new Date();
+//   const todayStr = now.toLocaleDateString('de-DE', {
+//     timeZone: ORG_TZ,
+//     weekday: 'long',
+//     year: 'numeric',
+//     month: 'long',
+//     day: 'numeric',
+//   });
+//   const currentTime = now.toLocaleTimeString('de-DE', {
+//     timeZone: ORG_TZ,
+//     hour: '2-digit',
+//     minute: '2-digit',
+//   });
+
+//   return `${SYSTEM_PROMPT}
+
+// ═══════════════════════════════════════════════════
+// DYNAMISCHER KONTEXT
+// ═══════════════════════════════════════════════════
+// • Heute: ${todayStr}
+// • Aktuelle Uhrzeit (${ORG_TZ}): ${currentTime}
+// • Sitzungs-Sprache: ${locale ?? 'auto'}
+// `;
+// }
+
+// const SYSTEM_PROMPT = `Du bist Elen-AI — der freundliche Buchungsassistent von Salon Elen,
+// einem Kosmetiksalon in Halle (Saale), spezialisiert auf
+// Permanent Make-up, Nageldesign, Wimpernverlängerung, Mikroneedling und Fußpflege.
+
+// ═══════════════════════════════════════════════════
+// SPRACHE
+// ═══════════════════════════════════════════════════
+// • Bestimme die Sprache des Benutzers anhand seiner ERSTEN Nachricht.
+// • Antworte IMMER in DIESER Sprache für den GESAMTEN Dialog.
+// • Wechsle die Sprache NUR wenn der Benutzer explizit in einer anderen Sprache schreibt.
+// • Wenn der Benutzer Russisch schreibt → ALLE Antworten auf Russisch.
+// • Wenn der Benutzer Deutsch schreibt → ALLE Antworten auf Deutsch.
+// • Wenn der Benutzer Englisch schreibt → ALLE Antworten auf Englisch.
+// • Sprachcode für Tool-Aufrufe: "de" | "ru" | "en".
+// • WICHTIG: Auch bei Tippfehlern die Sprache beibehalten!
+
+// ═══════════════════════════════════════════════════
+// TIPPFEHLER & UMGANGSSPRACHE
+// ═══════════════════════════════════════════════════
+// • Benutzer können Tippfehler machen. Interpretiere Eingaben intelligent:
+//   - "пеоманент" → "перманент" (Permanent Make-up)
+//   - "маникур" → "маникюр" (Maniküre)
+//   - "ногти" → Nageldesign
+//   - "ресницы" / "реснички" → Wimpernverlängerung
+//   - "брови" → Augenbrauen PMU
+//   - "педикур" / "педекюр" → Fußpflege
+// • Verstehe auch Abkürzungen: "PMU" = Permanent Make-up.
+// • Frage NICHT nach bei offensichtlichen Tippfehlern — interpretiere sie.
+
+// ═══════════════════════════════════════════════════
+// HARTE REGELN (NIEMALS BRECHEN)
+// ═══════════════════════════════════════════════════
+// 1. ERFINDE NIEMALS freie Termine. Verfügbarkeit AUSSCHLIESSLICH über
+//    das Tool «search_availability» abrufen.
+// 2. ERSTELLE NIEMALS einen Termin per Text. Buchung NUR über die
+//    Tool-Kette: reserve_slot → create_draft → start_verification → complete_booking.
+// 3. Sage NIEMALS "Ihr Termin ist gebucht", bis complete_booking
+//    status=ok zurückgegeben hat.
+// 4. Zeitzone: IMMER Europe/Berlin. Zeiten dem Kunden in Berliner Zeit anzeigen.
+// 5. DSGVO: Nur nötige Daten erfragen. Telefonnummern/E-Mails NICHT
+//    vollständig wiederholen (z.B. "+49 ***51 06" statt der vollen Nummer).
+// 6. Maximal 1–2 Fragen gleichzeitig. Nicht überladen.
+// 7. Bei keinen freien Terminen → Alternativen vorschlagen
+//    (anderer Tag/Meister). Nie eine Sackgasse.
+// 8. Wenn der Benutzer nach etwas fragt, das nichts mit dem Salon zu tun hat
+//    (Smalltalk, private Fragen, Flirt, Mathematik, Übersetzungen, Wetter,
+//    Wochentage, Trivia usw.), ANTWORTE NICHT inhaltlich.
+//    Stattdessen: 1 kurzer Satz zur Eingrenzung + direkte Rückführung auf
+//    Buchung/Leistungen/Adresse.
+// 9. Wenn der Benutzer im laufenden Buchungsdialog auf deine letzte Frage antwortet
+//    (z.B. Datum/Uhrzeit/Präferenz), setze den aktuellen Schritt fort und starte
+//    NICHT wieder bei der Dienstauswahl.
+
+// ═══════════════════════════════════════════════════
+// SALON-WISSEN (FAQ)
+// ═══════════════════════════════════════════════════
+// • Name: Salon Elen
+// • Inhaberin: Elena — Spezialistin für Permanent Make-up & Kosmetik, seit 2014
+// • Adresse: Lessingstraße 37, 06114 Halle (Saale), Deutschland
+// • Telefon: +49 177 899 51 06
+// • E-Mail: elen69@web.de
+// • Website: https://permanent-halle.de
+// • Telegram: @salonelen
+// • WhatsApp: +49 177 899 51 06
+
+// Öffnungszeiten:
+//   Mo–Fr: 10:00–19:00
+//   Sa:    10:00–16:00
+//   So:    geschlossen
+
+// Dienstleistungsbereiche:
+//   – Permanent Make-up (Augenbrauen, Lippen, Eyeliner)
+//   – Nageldesign (Maniküre klassisch, Japanisch, Verlängerung)
+//   – Wimpernverlängerung
+//   – Mikroneedling / Mesotherapie
+//   – Fußpflege / Pediküre
+//   – Haarschnitte & Coloring
+
+// Anfahrt: Straßenbahn Linien 7, 8 — Haltestelle "Lessingstraße".
+//          Parkplätze in der Umgebung vorhanden.
+
+// Bezahlung: Bar, Kartenzahlung vor Ort.
+//            Online-Vorauszahlung möglich (Stripe / PayPal).
+
+// Stornierung: Kostenlose Stornierung bis 24 Stunden vor dem Termin.
+//              Bitte telefonisch oder per WhatsApp/Telegram absagen.
+
+// ═══════════════════════════════════════════════════
+// BUCHUNGS-DIALOG (STANDARDFLUSS)
+// ═══════════════════════════════════════════════════
+
+// Schritt A — DIENST BESTIMMEN
+//   • Wenn Benutzer beschreibt ("Ich möchte meine Nägel machen lassen")
+//     → Tool list_services aufrufen und ALLE passenden Optionen zeigen (kein 3–5 Limit).
+//   • Wenn Kunde "alle", "voller Preis", "ganze Liste" fragt → vollständige Liste zeigen.
+//   • Wenn list_services noMatches=true:
+//     - ehrlich sagen, dass exakt diese Leistung nicht gefunden wurde,
+//     - den Kunden fragen, welche Leistung genau gemeint ist,
+//     - 3–8 naheliegende Alternativen aus suggestedAlternatives anbieten.
+//   • Bei Mehrfachwahl: Gesamtdauer = Summe aller durationMin.
+//   • Preis in Euro anzeigen: priceCents / 100, z.B. "35,00 €".
+
+// Schritt B — MEISTER BESTIMMEN
+//   • Tool list_masters_for_services aufrufen.
+//   • Wenn Tool requiresSpecificService=true oder error=NO_BOOKABLE_SERVICE_SELECTED:
+//     - Meister NICHT anbieten,
+//     - zurück zur konkreten Dienstauswahl (Unterdienst) gehen,
+//     - list_services mit passender query aufrufen und konkrete Leistungen zeigen.
+//   • Wenn nur 1 Meister → automatisch zuweisen, Kunden informieren.
+//   • Wenn mehrere → kurz vorstellen (Name + Bio), fragen.
+//   • Wenn "mir egal" / "egal" → erstmöglichen verfügbaren wählen.
+
+// Schritt C — TAG + ZEITPRÄFERENZ
+//   • Fragen: "Welcher Tag passt Ihnen?" + "Vormittag/Nachmittag/Abend?"
+//   • Wenn du nach Zeitpräferenz fragst, gib IMMER klickbare Optionen
+//     in der Sprache des Benutzers:
+//     [option] 🌅 Vormittag [/option]
+//     [option] 🌤 Nachmittag [/option]
+//     [option] 🌙 Abend [/option]
+//     [option] 📅 Nächstes Datum [/option]
+//     [option] 📅 Morgen [/option]
+//   • Heute oder morgen? → konkretes Datum berechnen.
+//   • Wenn Dienst + Meister bereits gewählt sind und der Kunde eine Zeit nennt
+//     (z.B. "morgen um 10"), NICHT erneut list_services aufrufen.
+//     Stattdessen direkt search_availability für den genannten Tag/Zeitpräferenz.
+//   • Tool search_availability aufrufen.
+//   • Zeitfenster-Mapping:
+//     - "Vormittag/morgens" → startMinutes < 720 (vor 12:00)
+//     - "Nachmittag/tagsüber" → startMinutes 720–1020 (12:00–17:00)
+//     - "Abend" → startMinutes ≥ 1020 (ab 17:00)
+//   • 4–6 Slots anzeigen. Format: "10:00", "10:15", "10:30".
+
+// Schritt D — SLOT WÄHLEN & RESERVIEREN
+//   • Kunde wählt einen Slot.
+//   • SOFORT Tool reserve_slot aufrufen (5 Min. Reservierung).
+//   • Bei Konflikt (409) → entschuldigen, neue Slots suchen.
+
+// Schritt E — KONTAKTDATEN SAMMELN
+//   • Erforderlich: Name + E-Mail.
+//   • Optional: Telefon, Geburtsdatum, Anmerkungen.
+//   • DSGVO-Hinweis:
+//     "Ihre Daten werden ausschließlich für die Terminverwaltung verwendet."
+
+// Schritt F — DRAFT ERSTELLEN + VERIFIZIEREN
+//   • Tool create_draft mit allen gesammelten Daten.
+//   • Tool start_verification (email_otp).
+//   • Dem Kunden sagen: "Ein 6-stelliger Code wurde an Ihre E-Mail gesendet."
+
+// Schritt G — ABSCHLUSS
+//   • Kunde gibt Code ein → Tool complete_booking.
+//   • Bei Erfolg → Bestätigung:
+//     ✅ Dienst, Meister, Datum/Uhrzeit, Dauer
+//     📍 Lessingstraße 37, 06114 Halle (Saale)
+
+// ═══════════════════════════════════════════════════
+// FEHLERBEHANDLUNG
+// ═══════════════════════════════════════════════════
+// • Leere Slots → "Leider ist [Tag] ausgebucht. Soll ich [nächsten Tag] prüfen?"
+// • Wenn Kunde danach mit "ja/да/ok/проверь" zustimmt:
+//   - NICHT zur Dienstauswahl zurückgehen,
+//   - direkt search_availability_month oder search_availability mit nächstem Tag ausführen.
+// • splitRequired=true → "Dieser Meister bietet nicht alle Dienste an. Anderer Meister?"
+// • reserve_slot 409 → "Dieser Termin wurde gerade vergeben. Hier sind Alternativen: ..."
+// • Ungültiger OTP → "Der Code ist falsch oder abgelaufen. Neuen Code senden?"
+// • SLOT_TAKEN bei complete → "Der Termin wurde vergeben. Ich suche Alternativen..."
+// • Datenverarbeitung abgelehnt → "Kein Problem! Rufen Sie uns an: +49 177 899 51 06"
+
+// ═══════════════════════════════════════════════════
+// STIL & TON
+// ═══════════════════════════════════════════════════
+// • Freundlich, professionell, kurz und knapp.
+// • Maximal 3–4 Sätze pro Antwort.
+// • Immer mit einer Frage oder Auswahl enden.
+// • Emojis: sparsam (✅ 📅 💅 📍).
+// • NIEMALS medizinische Beratung geben.
+// • Bei Beschwerden → an Telefon/E-Mail verweisen.
+
+// ═══════════════════════════════════════════════════
+// FORMATIERUNG VON OPTIONEN (WICHTIG!)
+// ═══════════════════════════════════════════════════
+// • Wenn du dem Benutzer Optionen anbietest (Dienstleistungen, Zeiten,
+//   Meister usw.), verwende IMMER dieses Format:
+
+//   [option] Optionstext [/option]
+
+//   Beispiel für Dienstleistungen:
+//   [option] 💅 Klassische Maniküre — 60 Min., 35 € [/option]
+//   [option] 💅 Japanische Maniküre — 75 Min., 42 € [/option]
+//   [option] 💅 Nagelverlängerung — 120 Min., 70 € [/option]
+
+//   Beispiel für Zeitslots:
+//   [option] 🕐 10:00 [/option]
+//   [option] 🕐 10:15 [/option]
+//   [option] 🕐 10:30 [/option]
+
+//   Beispiel für Kategorien:
+//   [option] 💄 Permanent Make-up [/option]
+//   [option] 💅 Nageldesign [/option]
+//   [option] 👁 Wimpernverlängerung [/option]
+
+// • Diese [option]...[/option] Markierungen werden im Chat als klickbare
+//   Schaltflächen dargestellt. Der Benutzer kann darauf klicken, statt
+//   zu tippen.
+// • Nutze IMMER passende Emojis am Anfang der Option.
+// • KEIN Nummerierung (1. 2. 3.) verwenden — nur [option] Tags.
+// `;
diff --git a/src/lib/ai/tools-schema.ts b/src/lib/ai/tools-schema.ts
index 17c5bea..e927651 100644
--- a/src/lib/ai/tools-schema.ts
+++ b/src/lib/ai/tools-schema.ts
@@ -25,7 +25,7 @@ export const TOOLS: ToolDefinition[] = [
     type: 'function',
     name: 'list_services',
     description:
-      'Получить полный список активных бронируемых услуг салона с ценами и длительностью, сгруппированных по категориям. При query возвращает все совпадения без искусственного лимита; если совпадений нет — noMatches=true и suggestedAlternatives.',
+      'Получить список активных услуг салона с ценами и длительностью, сгруппированных по категориям. Используй для помощи клиенту в выборе услуги.',
     parameters: {
       type: 'object',
       properties: {
@@ -50,7 +50,7 @@ export const TOOLS: ToolDefinition[] = [
     type: 'function',
     name: 'list_masters_for_services',
     description:
-      'Получить мастеров, которые могут выполнить ВСЕ выбранные услуги. Вызывай после выбора КОНКРЕТНОЙ бронируемой услуги. Если передана категория/некорректный id, вернет requiresSpecificService=true и error=NO_BOOKABLE_SERVICE_SELECTED.',
+      'Получить мастеров, которые могут выполнить ВСЕ выбранные услуги. Вызывай после выбора услуг.',
     parameters: {
       type: 'object',
       properties: {
@@ -201,14 +201,15 @@ export const TOOLS: ToolDefinition[] = [
     type: 'function',
     name: 'start_verification',
     description:
-      'Запустить верификацию контакта клиента. Отправляет OTP код на email.',
+      'Запустить верификацию контакта клиента. Отправляет OTP код на email, SMS или Telegram.',
     parameters: {
       type: 'object',
       properties: {
         method: {
           type: 'string',
-          enum: ['email_otp'],
-          description: 'Метод верификации (пока только email_otp)',
+          enum: ['email_otp', 'sms_otp', 'telegram_otp'],
+          description:
+            'Метод верификации: email_otp (по умолчанию), sms_otp (через SMS), telegram_otp (через Telegram бот)',
         },
         draftId: {
           type: 'string',
@@ -216,7 +217,7 @@ export const TOOLS: ToolDefinition[] = [
         },
         contact: {
           type: 'string',
-          description: 'Email адрес клиента',
+          description: 'Email (для email_otp) или номер телефона (для sms_otp/telegram_otp)',
         },
       },
       required: ['method', 'draftId', 'contact'],
@@ -235,8 +236,8 @@ export const TOOLS: ToolDefinition[] = [
       properties: {
         method: {
           type: 'string',
-          enum: ['email_otp'],
-          description: 'Метод верификации',
+          enum: ['email_otp', 'sms_otp', 'telegram_otp'],
+          description: 'Метод верификации (должен совпадать с start_verification)',
         },
         draftId: { type: 'string', description: 'ID черновика' },
         code: {
@@ -249,3 +250,257 @@ export const TOOLS: ToolDefinition[] = [
     },
   },
 ];
+
+
+
+// // src/lib/ai/tools-schema.ts
+// // OpenAI function-calling tool definitions for the booking assistant.
+
+// export type ToolName =
+//   | 'list_services'
+//   | 'list_masters_for_services'
+//   | 'search_availability'
+//   | 'search_availability_month'
+//   | 'reserve_slot'
+//   | 'create_draft'
+//   | 'start_verification'
+//   | 'complete_booking';
+
+// export interface ToolDefinition {
+//   type: 'function';
+//   name: ToolName;
+//   description: string;
+//   parameters: Record<string, unknown>;
+//   strict?: boolean;
+// }
+
+// export const TOOLS: ToolDefinition[] = [
+//   // ── 1. list_services ──────────────────────────────────────────
+//   {
+//     type: 'function',
+//     name: 'list_services',
+//     description:
+//       'Получить полный список активных бронируемых услуг салона с ценами и длительностью, сгруппированных по категориям. При query возвращает все совпадения без искусственного лимита; если совпадений нет — noMatches=true и suggestedAlternatives.',
+//     parameters: {
+//       type: 'object',
+//       properties: {
+//         locale: {
+//           type: 'string',
+//           enum: ['de', 'ru', 'en'],
+//           description: 'Язык для названий и описаний услуг',
+//         },
+//         query: {
+//           type: 'string',
+//           description:
+//             'Необязательный поисковый запрос для фильтрации. Пример: "Maniküre", "ресницы", "nail"',
+//         },
+//       },
+//       required: ['locale'],
+//       additionalProperties: false,
+//     },
+//   },
+
+//   // ── 2. list_masters_for_services ──────────────────────────────
+//   {
+//     type: 'function',
+//     name: 'list_masters_for_services',
+//     description:
+//       'Получить мастеров, которые могут выполнить ВСЕ выбранные услуги. Вызывай после выбора КОНКРЕТНОЙ бронируемой услуги. Если передана категория/некорректный id, вернет requiresSpecificService=true и error=NO_BOOKABLE_SERVICE_SELECTED.',
+//     parameters: {
+//       type: 'object',
+//       properties: {
+//         serviceIds: {
+//           type: 'array',
+//           items: { type: 'string' },
+//           description: 'Массив ID выбранных услуг',
+//         },
+//       },
+//       required: ['serviceIds'],
+//       additionalProperties: false,
+//     },
+//   },
+
+//   // ── 3. search_availability ────────────────────────────────────
+//   {
+//     type: 'function',
+//     name: 'search_availability',
+//     description:
+//       'Найти свободные слоты для мастера на конкретный день. ОБЯЗАТЕЛЬНО вызывать перед предложением времени клиенту. НИКОГДА не выдумывать слоты.',
+//     parameters: {
+//       type: 'object',
+//       properties: {
+//         masterId: { type: 'string', description: 'ID мастера' },
+//         dateISO: {
+//           type: 'string',
+//           description: 'Дата в формате YYYY-MM-DD',
+//         },
+//         serviceIds: {
+//           type: 'array',
+//           items: { type: 'string' },
+//           description:
+//             'ID услуг (суммарная длительность рассчитывается автоматически)',
+//         },
+//         preferredTime: {
+//           type: 'string',
+//           enum: ['morning', 'afternoon', 'evening', 'any'],
+//           description:
+//             'Предпочтение по времени: morning (<12:00), afternoon (12–17), evening (17+), any (все)',
+//         },
+//       },
+//       required: ['masterId', 'dateISO', 'serviceIds'],
+//       additionalProperties: false,
+//     },
+//   },
+
+//   // ── 4. search_availability_month ──────────────────────────────
+//   {
+//     type: 'function',
+//     name: 'search_availability_month',
+//     description:
+//       'Показать обзор свободных дней за месяц. Используй когда клиент спрашивает "когда есть свободное" без конкретной даты.',
+//     parameters: {
+//       type: 'object',
+//       properties: {
+//         masterId: { type: 'string', description: 'ID мастера' },
+//         monthISO: {
+//           type: 'string',
+//           description: 'Месяц в формате YYYY-MM',
+//         },
+//         serviceIds: {
+//           type: 'array',
+//           items: { type: 'string' },
+//           description: 'ID услуг',
+//         },
+//       },
+//       required: ['masterId', 'monthISO', 'serviceIds'],
+//       additionalProperties: false,
+//     },
+//   },
+
+//   // ── 5. reserve_slot ───────────────────────────────────────────
+//   {
+//     type: 'function',
+//     name: 'reserve_slot',
+//     description:
+//       'Зарезервировать выбранный слот на 5 минут, пока собираем контактные данные. ОБЯЗАТЕЛЬНО вызвать СРАЗУ после выбора слота клиентом, ДО сбора данных.',
+//     parameters: {
+//       type: 'object',
+//       properties: {
+//         masterId: { type: 'string' },
+//         startAt: {
+//           type: 'string',
+//           description: 'Начало слота в ISO UTC формате',
+//         },
+//         endAt: {
+//           type: 'string',
+//           description: 'Конец слота в ISO UTC формате',
+//         },
+//         sessionId: {
+//           type: 'string',
+//           description: 'UUID сессии AI-чата',
+//         },
+//       },
+//       required: ['masterId', 'startAt', 'endAt', 'sessionId'],
+//       additionalProperties: false,
+//     },
+//   },
+
+//   // ── 6. create_draft ───────────────────────────────────────────
+//   {
+//     type: 'function',
+//     name: 'create_draft',
+//     description:
+//       'Создать черновик бронирования с контактными данными клиента. Вызывать после reserve_slot и сбора данных.',
+//     parameters: {
+//       type: 'object',
+//       properties: {
+//         serviceId: { type: 'string', description: 'ID выбранной услуги' },
+//         masterId: { type: 'string' },
+//         startAt: { type: 'string', description: 'ISO UTC' },
+//         endAt: { type: 'string', description: 'ISO UTC' },
+//         customerName: { type: 'string', description: 'Имя клиента' },
+//         phone: {
+//           type: 'string',
+//           description: 'Телефон в формате +49... (необязательно)',
+//         },
+//         email: { type: 'string', description: 'Email клиента' },
+//         birthDate: {
+//           type: 'string',
+//           description: 'Дата рождения YYYY-MM-DD (необязательно)',
+//         },
+//         notes: {
+//           type: 'string',
+//           description: 'Примечания клиента (необязательно)',
+//         },
+//         locale: {
+//           type: 'string',
+//           enum: ['de', 'ru', 'en'],
+//           description: 'Язык клиента для уведомлений',
+//         },
+//       },
+//       required: [
+//         'serviceId',
+//         'masterId',
+//         'startAt',
+//         'endAt',
+//         'customerName',
+//         'email',
+//         'locale',
+//       ],
+//       additionalProperties: false,
+//     },
+//   },
+
+//   // ── 7. start_verification ─────────────────────────────────────
+//   {
+//     type: 'function',
+//     name: 'start_verification',
+//     description:
+//       'Запустить верификацию контакта клиента. Отправляет OTP код на email.',
+//     parameters: {
+//       type: 'object',
+//       properties: {
+//         method: {
+//           type: 'string',
+//           enum: ['email_otp'],
+//           description: 'Метод верификации (пока только email_otp)',
+//         },
+//         draftId: {
+//           type: 'string',
+//           description: 'ID черновика бронирования',
+//         },
+//         contact: {
+//           type: 'string',
+//           description: 'Email адрес клиента',
+//         },
+//       },
+//       required: ['method', 'draftId', 'contact'],
+//       additionalProperties: false,
+//     },
+//   },
+
+//   // ── 8. complete_booking ───────────────────────────────────────
+//   {
+//     type: 'function',
+//     name: 'complete_booking',
+//     description:
+//       'Завершить бронирование после верификации. Проверяет OTP код и создаёт запись Appointment.',
+//     parameters: {
+//       type: 'object',
+//       properties: {
+//         method: {
+//           type: 'string',
+//           enum: ['email_otp'],
+//           description: 'Метод верификации',
+//         },
+//         draftId: { type: 'string', description: 'ID черновика' },
+//         code: {
+//           type: 'string',
+//           description: '6-значный OTP код от клиента',
+//         },
+//       },
+//       required: ['method', 'draftId', 'code'],
+//       additionalProperties: false,
+//     },
+//   },
+// ];
diff --git a/src/lib/ai/tools/complete-booking.ts b/src/lib/ai/tools/complete-booking.ts
index 15ca52f..4130b24 100644
--- a/src/lib/ai/tools/complete-booking.ts
+++ b/src/lib/ai/tools/complete-booking.ts
@@ -2,7 +2,7 @@
 
 import { verifyOTP, deleteOTP, type OTPMethod } from '@/lib/otp-store';
 import { prisma } from '@/lib/prisma';
-import { finalizeBookingFromDraft } from '@/lib/booking/finalize-booking';
+import { finalizeBookingFromDraft, type FinalizeResult, type FinalizeError } from '@/lib/booking/finalize-booking';
 
 interface Args {
   method: string;
@@ -10,25 +10,54 @@ interface Args {
   code: string;
 }
 
-export async function completeBooking(args: Args) {
-  const { method, draftId, code } = args;
+type CompleteError = { ok: false; error: string; message?: string };
+type CompleteResult = FinalizeResult | FinalizeError | CompleteError;
+
+/**
+ * Resolve the OTP method and contact info from the method string and draft.
+ */
+function resolveOtpLookup(
+  method: string,
+  draft: { email: string; phone: string | null },
+): { otpMethod: OTPMethod; contact: string } | { error: string } {
+  switch (method) {
+    case 'email_otp':
+      return { otpMethod: 'email', contact: draft.email };
+
+    case 'sms_otp':
+      if (!draft.phone) return { error: 'NO_PHONE' };
+      return { otpMethod: 'sms', contact: draft.phone };
+
+    case 'telegram_otp':
+      if (!draft.phone) return { error: 'NO_PHONE' };
+      return { otpMethod: 'telegram', contact: draft.phone };
 
-  if (method !== 'email_otp') {
-    return { ok: false, error: 'UNSUPPORTED_METHOD' };
+    default:
+      return { error: 'UNSUPPORTED_METHOD' };
   }
+}
+
+export async function completeBooking(args: Args): Promise<CompleteResult> {
+  const { method, draftId, code } = args;
 
-  // Get draft to find the email
+  // Get draft
   const draft = await prisma.bookingDraft.findUnique({
     where: { id: draftId },
-    select: { email: true },
+    select: { email: true, phone: true },
   });
 
   if (!draft) {
     return { ok: false, error: 'DRAFT_NOT_FOUND' };
   }
 
+  // Resolve OTP lookup params
+  const lookup = resolveOtpLookup(method, draft);
+  if ('error' in lookup) {
+    return { ok: false, error: lookup.error };
+  }
+
   // Verify OTP
-  const isValid = verifyOTP('email' as OTPMethod, draft.email, draftId, code);
+  const isValid = verifyOTP(lookup.otpMethod, lookup.contact, draftId, code);
 
   if (!isValid) {
     return {
@@ -46,9 +75,86 @@ export async function completeBooking(args: Args) {
   }
 
   // Cleanup OTP
-  deleteOTP('email' as OTPMethod, draft.email, draftId);
+  deleteOTP(lookup.otpMethod, lookup.contact, draftId);
 
-  console.log(`[AI complete_booking] Appointment created: ${result.appointmentId}`);
+  console.log(`[AI complete_booking] Appointment created: ${result.appointmentId} via ${method}`);
+
+  // Send client confirmation email (fire-and-forget)
+  try {
+    const { sendStatusChangeEmail } = await import('@/lib/email');
+    const appt = await prisma.appointment.findUnique({
+      where: { id: result.appointmentId },
+      include: {
+        service: {
+          select: {
+            name: true,
+            parent: { select: { name: true } },
+          },
+        },
+        master: { select: { name: true } },
+      },
+    });
+
+    if (appt?.email) {
+      const serviceName = appt.service?.parent?.name
+        ? `${appt.service.parent.name} / ${appt.service.name}`
+        : appt.service?.name || '—';
+      const masterName = appt.master?.name || '—';
+
+      void sendStatusChangeEmail({
+        customerName: appt.customerName,
+        email: appt.email,
+        serviceName,
+        masterName,
+        startAt: appt.startAt,
+        endAt: appt.endAt,
+        status: appt.status,
+        locale: (appt.locale as 'de' | 'ru' | 'en') || 'de',
+      });
+    }
+  } catch (e) {
+    console.warn('[AI complete_booking] Client email notification failed:', e);
+  }
+
+  // Send client Telegram status notification (only for Telegram-verified flow)
+  if (method === 'telegram_otp') {
+    try {
+      const { notifyClientAppointmentStatus } = await import('@/lib/telegram-bot');
+      const appt = await prisma.appointment.findUnique({
+        where: { id: result.appointmentId },
+        include: {
+          service: {
+            select: {
+              name: true,
+              parent: { select: { name: true } },
+            },
+          },
+          master: { select: { name: true } },
+        },
+      });
+
+      if (appt?.phone) {
+        const serviceName = appt.service?.parent?.name
+          ? `${appt.service.parent.name} / ${appt.service.name}`
+          : appt.service?.name || '—';
+        const masterName = appt.master?.name || '—';
+
+        void notifyClientAppointmentStatus({
+          customerName: appt.customerName,
+          email: appt.email,
+          phone: appt.phone,
+          serviceName,
+          masterName,
+          startAt: appt.startAt,
+          endAt: appt.endAt,
+          status: appt.status,
+          locale: (appt.locale as 'de' | 'ru' | 'en') || 'de',
+        });
+      }
+    } catch (e) {
+      console.warn('[AI complete_booking] Client Telegram notification failed:', e);
+    }
+  }
 
   // Send admin notification (fire-and-forget)
   try {
@@ -80,3 +186,87 @@ export async function completeBooking(args: Args) {
 
   return result;
 }
+
+
+// // src/lib/ai/tools/complete-booking.ts
+
+// import { verifyOTP, deleteOTP, type OTPMethod } from '@/lib/otp-store';
+// import { prisma } from '@/lib/prisma';
+// import { finalizeBookingFromDraft } from '@/lib/booking/finalize-booking';
+
+// interface Args {
+//   method: string;
+//   draftId: string;
+//   code: string;
+// }
+
+// export async function completeBooking(args: Args) {
+//   const { method, draftId, code } = args;
+
+//   if (method !== 'email_otp') {
+//     return { ok: false, error: 'UNSUPPORTED_METHOD' };
+//   }
+
+//   // Get draft to find the email
+//   const draft = await prisma.bookingDraft.findUnique({
+//     where: { id: draftId },
+//     select: { email: true },
+//   });
+
+//   if (!draft) {
+//     return { ok: false, error: 'DRAFT_NOT_FOUND' };
+//   }
+
+//   // Verify OTP
+//   const isValid = verifyOTP('email' as OTPMethod, draft.email, draftId, code);
+
+//   if (!isValid) {
+//     return {
+//       ok: false,
+//       error: 'INVALID_CODE',
+//       message: 'Invalid or expired verification code',
+//     };
+//   }
+
+//   // Finalize booking (create Appointment from draft)
+//   const result = await finalizeBookingFromDraft(draftId);
+
+//   if (!result.ok) {
+//     return result;
+//   }
+
+//   // Cleanup OTP
+//   deleteOTP('email' as OTPMethod, draft.email, draftId);
+
+//   console.log(`[AI complete_booking] Appointment created: ${result.appointmentId}`);
+
+//   // Send admin notification (fire-and-forget)
+//   try {
+//     const { sendAdminNotification } = await import('@/lib/send-admin-notification');
+//     const appt = await prisma.appointment.findUnique({
+//       where: { id: result.appointmentId },
+//       include: {
+//         service: { select: { name: true } },
+//         master: { select: { name: true } },
+//       },
+//     });
+//     if (appt) {
+//       void sendAdminNotification({
+//         id: appt.id,
+//         customerName: appt.customerName,
+//         phone: appt.phone,
+//         email: appt.email,
+//         serviceName: appt.service.name,
+//         masterName: appt.master?.name ?? 'N/A',
+//         masterId: appt.masterId,
+//         startAt: appt.startAt,
+//         endAt: appt.endAt,
+//         paymentStatus: appt.paymentStatus,
+//       });
+//     }
+//   } catch (e) {
+//     console.warn('[AI complete_booking] Admin notification failed:', e);
+//   }
+
+//   return result;
+// }
diff --git a/src/lib/ai/tools/start-verification.ts b/src/lib/ai/tools/start-verification.ts
index 6e79a61..851e4fc 100644
--- a/src/lib/ai/tools/start-verification.ts
+++ b/src/lib/ai/tools/start-verification.ts
@@ -3,6 +3,7 @@
 import { prisma } from '@/lib/prisma';
 import { generateOTP, saveOTP, type OTPMethod } from '@/lib/otp-store';
 import { sendOTPEmail } from '@/lib/email-otp';
+import { sendSmsOtp, isSmsAvailable } from '@/lib/ai/sms-sender';
 import type { Locale } from '@/i18n/locales';
 
 interface Args {
@@ -11,6 +12,12 @@ interface Args {
   contact: string;
 }
 
+type VerificationResult =
+  | { ok: true; message: string; contactMasked: string; expiresInMinutes: number }
+  | { ok: false; error: string; message?: string };
+
+// ─── Masking ────────────────────────────────────────────────────
+
 function maskEmail(email: string): string {
   const [local, domain] = email.split('@');
   if (!domain) return '***';
@@ -18,41 +25,64 @@ function maskEmail(email: string): string {
     local.length <= 2 ? '***' : `${local[0]}***${local[local.length - 1]}`;
   const parts = domain.split('.');
   const maskedDomain =
-    parts[0].length <= 2
-      ? '***'
-      : `${parts[0][0]}***`;
+    parts[0].length <= 2 ? '***' : `${parts[0][0]}***`;
   return `${maskedLocal}@${maskedDomain}.${parts.slice(1).join('.')}`;
 }
 
-export async function startVerification(args: Args) {
-  const { method, draftId, contact } = args;
+function maskPhone(phone: string): string {
+  const digits = phone.replace(/\D/g, '');
+  if (digits.length < 6) return '***';
+  return `${phone.slice(0, 4)}***${phone.slice(-2)}`;
+}
 
-  // Currently only email_otp is supported
-  if (method !== 'email_otp') {
-    return { ok: false, error: 'UNSUPPORTED_METHOD', message: `Method "${method}" not yet supported` };
+function normalizePhoneForVerification(phone: string): string {
+  const trimmed = String(phone || '').trim();
+  if (!trimmed) return '';
+
+  const startsWithPlus = trimmed.startsWith('+');
+  const digitsOnly = trimmed.replace(/\D/g, '');
+
+  if (!digitsOnly) return '';
+  return startsWithPlus ? `+${digitsOnly}` : digitsOnly;
+}
+
+function validateSmsPhoneFormat(phone: string): { ok: true; normalized: string } | { ok: false } {
+  const normalized = normalizePhoneForVerification(phone);
+  if (!normalized.startsWith('+')) return { ok: false };
+
+  // We intentionally allow only DE/UA families in AI flow.
+  if (!(normalized.startsWith('+49') || normalized.startsWith('+38'))) {
+    return { ok: false };
   }
 
-  // Verify draft exists and email matches
-  const draft = await prisma.bookingDraft.findUnique({
-    where: { id: draftId },
-    select: { id: true, email: true, locale: true },
-  });
+  const digits = normalized.replace(/\D/g, '');
+  if (digits.length < 12 || digits.length > 14) {
+    return { ok: false };
+  }
 
-  if (!draft) {
-    return { ok: false, error: 'DRAFT_NOT_FOUND' };
+  // E.164-like sanity (already normalized).
+  if (!/^\+[1-9]\d{7,13}$/.test(normalized)) {
+    return { ok: false };
   }
 
+  return { ok: true, normalized };
+}
+
+// ─── Methods ────────────────────────────────────────────────────
+
+async function handleEmailOtp(
+  draft: { id: string; email: string; locale: string | null },
+  contact: string,
+): Promise<VerificationResult> {
   if (draft.email !== contact) {
     return { ok: false, error: 'EMAIL_MISMATCH' };
   }
 
-  // Generate and save OTP
   const code = generateOTP();
-  saveOTP('email' as OTPMethod, contact, draftId, code, { ttlMinutes: 10 });
+  saveOTP('email' as OTPMethod, contact, draft.id, code, { ttlMinutes: 10 });
 
-  console.log(`[AI start_verification] OTP for ${maskEmail(contact)}: ${code}`);
+  console.log(`[AI start_verification] email OTP for ${maskEmail(contact)}: ${code}`);
 
-  // Send email
   const locale = (draft.locale || 'de') as Locale;
   const sendResult = await sendOTPEmail(contact, code, {
     expiryMinutes: 10,
@@ -60,24 +90,249 @@ export async function startVerification(args: Args) {
   });
 
   if (!sendResult.ok) {
-    console.error(`[AI start_verification] Send failed: ${sendResult.error}`);
+    console.error(`[AI start_verification] Email send failed: ${sendResult.error}`);
+    return { ok: false, error: 'SEND_FAILED', message: 'Could not send verification email' };
+  }
+
+  return {
+    ok: true,
+    message: `Verification code sent to ${maskEmail(contact)}`,
+    contactMasked: maskEmail(contact),
+    expiresInMinutes: 10,
+  };
+}
+
+async function handleSmsOtp(
+  draft: { id: string; phone: string | null; locale: string | null },
+  contact: string,
+): Promise<VerificationResult> {
+  if (!isSmsAvailable()) {
+    return { ok: false, error: 'SMS_NOT_CONFIGURED', message: 'SMS provider not configured' };
+  }
+
+  // Use the phone from draft, or the provided contact
+  const rawPhone = contact || draft.phone;
+  if (!rawPhone) {
+    return { ok: false, error: 'NO_PHONE', message: 'No phone number available' };
+  }
+
+  const phoneValidation = validateSmsPhoneFormat(rawPhone);
+  if (!phoneValidation.ok) {
     return {
       ok: false,
-      error: 'SEND_FAILED',
-      message: sendResult.error || 'Could not send verification email',
+      error: 'PHONE_FORMAT_INVALID',
+      message: 'Phone must be in +49... or +38... format',
     };
   }
+  const phone = phoneValidation.normalized;
+
+  const code = generateOTP();
 
-  if (sendResult.warning) {
-    console.warn(`[AI start_verification] Warning: ${sendResult.warning}`);
+  console.log(`[AI start_verification] SMS OTP for ${maskPhone(phone)}: ${code}`);
+
+  const sendResult = await sendSmsOtp(phone, code);
+
+  if (!sendResult.ok) {
+    console.error(`[AI start_verification] SMS send failed: ${sendResult.error}`);
+    const err = String(sendResult.error || '').toLowerCase();
+    if (
+      err.includes('invalid') ||
+      err.includes('format') ||
+      err.includes('e.164') ||
+      err.includes('falsche') ||
+      err.includes('wrong')
+    ) {
+      return {
+        ok: false,
+        error: 'PHONE_FORMAT_INVALID',
+        message: 'Phone must be in +49... or +38... format',
+      };
+    }
+    return { ok: false, error: 'SEND_FAILED', message: 'Could not send SMS' };
   }
 
+  saveOTP('sms' as OTPMethod, phone, draft.id, code, { ttlMinutes: 10 });
+
   return {
     ok: true,
-    message: `Verification code sent to ${maskEmail(contact)}`,
-    contactMasked: maskEmail(contact),
+    message: `Verification code sent via SMS to ${maskPhone(phone)}`,
+    contactMasked: maskPhone(phone),
     expiresInMinutes: 10,
-    messageId: sendResult.messageId,
-    warning: sendResult.warning,
   };
 }
+
+async function handleTelegramOtp(
+  draft: { id: string; phone: string | null; locale: string | null },
+  contact: string,
+): Promise<VerificationResult> {
+  const phone = contact || draft.phone;
+  if (!phone) {
+    return { ok: false, error: 'NO_PHONE', message: 'No phone number for Telegram lookup' };
+  }
+
+  // Check if user is registered with our Telegram bot
+  const telegramUser = await prisma.telegramUser.findUnique({
+    where: { phone },
+  });
+
+  if (!telegramUser) {
+    return {
+      ok: false,
+      error: 'TELEGRAM_NOT_REGISTERED',
+      message: `Phone ${maskPhone(phone)} is not registered with our Telegram bot. Please use email or SMS verification instead.`,
+    };
+  }
+
+  const code = generateOTP();
+  saveOTP('telegram' as OTPMethod, phone, draft.id, code, {
+    ttlMinutes: 10,
+    telegramUserId: Number(telegramUser.telegramChatId),
+  });
+
+  console.log(`[AI start_verification] Telegram OTP for ${maskPhone(phone)}: ${code}`);
+
+  const { sendTelegramCode } = await import('@/lib/telegram-bot');
+  const locale = (draft.locale || 'de') as Locale;
+  const sent = await sendTelegramCode(phone, code, locale);
+
+  if (!sent) {
+    console.error(`[AI start_verification] Telegram send failed for ${maskPhone(phone)}`);
+    return { ok: false, error: 'SEND_FAILED', message: 'Could not send Telegram message' };
+  }
+
+  return {
+    ok: true,
+    message: `Verification code sent via Telegram to ${maskPhone(phone)}`,
+    contactMasked: maskPhone(phone),
+    expiresInMinutes: 10,
+  };
+}
+
+// ─── Main ───────────────────────────────────────────────────────
+
+export async function startVerification(args: Args): Promise<VerificationResult> {
+  const { method, draftId, contact } = args;
+
+  // Verify draft exists
+  const draft = await prisma.bookingDraft.findUnique({
+    where: { id: draftId },
+    select: { id: true, email: true, phone: true, locale: true },
+  });
+
+  if (!draft) {
+    return { ok: false, error: 'DRAFT_NOT_FOUND' };
+  }
+
+  switch (method) {
+    case 'email_otp':
+      return handleEmailOtp(
+        { id: draft.id, email: draft.email, locale: draft.locale ?? null },
+        contact,
+      );
+
+    case 'sms_otp':
+      return handleSmsOtp(
+        { id: draft.id, phone: draft.phone, locale: draft.locale ?? null },
+        contact,
+      );
+
+    case 'telegram_otp':
+      return handleTelegramOtp(
+        { id: draft.id, phone: draft.phone, locale: draft.locale ?? null },
+        contact,
+      );
+
+    default:
+      return {
+        ok: false,
+        error: 'UNSUPPORTED_METHOD',
+        message: `Method "${method}" not supported. Use email_otp, sms_otp, or telegram_otp.`,
+      };
+  }
+}
+
+
+
+// // src/lib/ai/tools/start-verification.ts
+
+// import { prisma } from '@/lib/prisma';
+// import { generateOTP, saveOTP, type OTPMethod } from '@/lib/otp-store';
+// import { sendOTPEmail } from '@/lib/email-otp';
+// import type { Locale } from '@/i18n/locales';
+
+// interface Args {
+//   method: string;
+//   draftId: string;
+//   contact: string;
+// }
+
+// function maskEmail(email: string): string {
+//   const [local, domain] = email.split('@');
+//   if (!domain) return '***';
+//   const maskedLocal =
+//     local.length <= 2 ? '***' : `${local[0]}***${local[local.length - 1]}`;
+//   const parts = domain.split('.');
+//   const maskedDomain =
+//     parts[0].length <= 2
+//       ? '***'
+//       : `${parts[0][0]}***`;
+//   return `${maskedLocal}@${maskedDomain}.${parts.slice(1).join('.')}`;
+// }
+
+// export async function startVerification(args: Args) {
+//   const { method, draftId, contact } = args;
+
+//   // Currently only email_otp is supported
+//   if (method !== 'email_otp') {
+//     return { ok: false, error: 'UNSUPPORTED_METHOD', message: `Method "${method}" not yet supported` };
+//   }
+
+//   // Verify draft exists and email matches
+//   const draft = await prisma.bookingDraft.findUnique({
+//     where: { id: draftId },
+//     select: { id: true, email: true, locale: true },
+//   });
+
+//   if (!draft) {
+//     return { ok: false, error: 'DRAFT_NOT_FOUND' };
+//   }
+
+//   if (draft.email !== contact) {
+//     return { ok: false, error: 'EMAIL_MISMATCH' };
+//   }
+
+//   // Generate and save OTP
+//   const code = generateOTP();
+//   saveOTP('email' as OTPMethod, contact, draftId, code, { ttlMinutes: 10 });
+
+//   console.log(`[AI start_verification] OTP for ${maskEmail(contact)}: ${code}`);
+
+//   // Send email
+//   const locale = (draft.locale || 'de') as Locale;
+//   const sendResult = await sendOTPEmail(contact, code, {
+//     expiryMinutes: 10,
+//     locale,
+//   });
+
+//   if (!sendResult.ok) {
+//     console.error(`[AI start_verification] Send failed: ${sendResult.error}`);
+//     return {
+//       ok: false,
+//       error: 'SEND_FAILED',
+//       message: sendResult.error || 'Could not send verification email',
+//     };
+//   }
+
+//   if (sendResult.warning) {
+//     console.warn(`[AI start_verification] Warning: ${sendResult.warning}`);
+//   }
+
+//   return {
+//     ok: true,
+//     message: `Verification code sent to ${maskEmail(contact)}`,
+//     contactMasked: maskEmail(contact),
+//     expiresInMinutes: 10,
+//     messageId: sendResult.messageId,
+//     warning: sendResult.warning,
+//   };
+// }
diff --git a/src/lib/otp-store.ts b/src/lib/otp-store.ts
index 0b7d721..38d7a72 100644
--- a/src/lib/otp-store.ts
+++ b/src/lib/otp-store.ts
@@ -1,6 +1,6 @@
 // src/lib/otp-store.ts
 
-export type OTPMethod = "email" | "telegram";
+export type OTPMethod = "email" | "telegram" | "sms";
 
 export interface OTPEntry {
   code: string;
@@ -228,6 +228,237 @@ export function debugOTPStore(): void {
 
 
 
+//-------28.02.26
+// // src/lib/otp-store.ts
+
+// export type OTPMethod = "email" | "telegram";
+
+// export interface OTPEntry {
+//   code: string;
+//   expiresAt: number;
+//   telegramUserId?: number;
+//   confirmed?: boolean;
+//   /** ID созданной записи Appointment (для Telegram-автоподтверждения) */
+//   appointmentId?: string;
+// }
+
+// // Расширяем global, чтобы store жил между hot-reload'ами
+// declare global {
+//   // eslint-disable-next-line no-var
+//   var __otpStore: Map<string, OTPEntry> | undefined;
+// }
+
+// function getStore(): Map<string, OTPEntry> {
+//   if (!global.__otpStore) {
+//     global.__otpStore = new Map<string, OTPEntry>();
+//   }
+//   return global.__otpStore;
+// }
+
+// const store = getStore();
+
+// function createKey(method: OTPMethod, email: string, draftId: string): string {
+//   return `${method}:${email}:${draftId}`;
+// }
+
+// /**
+//  * Генерирует 6-значный OTP-код
+//  */
+// export function generateOTP(): string {
+//   return String(Math.floor(100000 + Math.random() * 900000));
+// }
+
+// /**
+//  * Сохраняет OTP
+//  */
+// export function saveOTP(
+//   method: OTPMethod,
+//   email: string,
+//   draftId: string,
+//   code: string,
+//   options?: {
+//     ttlMinutes?: number;
+//     telegramUserId?: number;
+//   },
+// ): void {
+//   const key = createKey(method, email, draftId);
+//   const ttlMs = (options?.ttlMinutes ?? 10) * 60 * 1000;
+//   const expiresAt = Date.now() + ttlMs;
+
+//   const entry: OTPEntry = {
+//     code,
+//     expiresAt,
+//     confirmed: false,
+//   };
+
+//   if (options?.telegramUserId) {
+//     entry.telegramUserId = options.telegramUserId;
+//   }
+
+//   store.set(key, entry);
+//   console.log(`[OTP Store] Сохранён ${method} код для ${email}:${draftId}`);
+// }
+
+// /**
+//  * Получает OTP (автоматически удаляет, если истёк)
+//  */
+// export function getOTP(
+//   method: OTPMethod,
+//   email: string,
+//   draftId: string,
+// ): OTPEntry | null {
+//   const key = createKey(method, email, draftId);
+//   const entry = store.get(key);
+
+//   if (!entry) {
+//     console.log(`[OTP Store] Код не найден для ${email}:${draftId}`);
+//     return null;
+//   }
+
+//   if (Date.now() > entry.expiresAt) {
+//     store.delete(key);
+//     console.log(`[OTP Store] Код истёк для ${email}:${draftId}`);
+//     return null;
+//   }
+
+//   return entry;
+// }
+
+// /**
+//  * Проверяет корректность кода (без отметки confirmed)
+//  */
+// export function verifyOTP(
+//   method: OTPMethod,
+//   email: string,
+//   draftId: string,
+//   code: string,
+// ): boolean {
+//   const entry = getOTP(method, email, draftId);
+
+//   if (!entry) {
+//     return false;
+//   }
+
+//   if (entry.code !== code) {
+//     console.log(
+//       `[OTP Store] Неверный код для ${email}:${draftId}. Ожидалось ${entry.code}, получено ${code}`,
+//     );
+//     return false;
+//   }
+
+//   return true;
+// }
+
+// /**
+//  * Отмечает OTP как подтверждённый (используется в Telegram callback)
+//  */
+// export function confirmOTP(
+//   method: OTPMethod,
+//   email: string,
+//   draftId: string,
+//   telegramUserId?: number,
+// ): boolean {
+//   const key = createKey(method, email, draftId);
+//   const entry = store.get(key);
+
+//   if (!entry) {
+//     console.log(
+//       `[OTP Store] Код не найден для подтверждения: ${email}:${draftId}`,
+//     );
+//     return false;
+//   }
+
+//   if (Date.now() > entry.expiresAt) {
+//     store.delete(key);
+//     console.log(
+//       `[OTP Store] Код истёк при подтверждении для ${email}:${draftId}`,
+//     );
+//     return false;
+//   }
+
+//   entry.confirmed = true;
+//   if (telegramUserId) {
+//     entry.telegramUserId = telegramUserId;
+//   }
+
+//   store.set(key, entry);
+
+//   console.log(
+//     `[OTP Store] ✅ Установлен статус confirmed для ${email}:${draftId}`,
+//   );
+//   return true;
+// }
+
+// /**
+//  * Привязывает Appointment к OTP (нужно, чтобы фронт получил appointmentId по polling)
+//  */
+// export function setAppointmentForOTP(
+//   method: OTPMethod,
+//   email: string,
+//   draftId: string,
+//   appointmentId: string,
+// ): void {
+//   const key = createKey(method, email, draftId);
+//   const entry = store.get(key);
+
+//   if (!entry) {
+//     console.log(
+//       `[OTP Store] Невозможно сохранить appointmentId, запись OTP не найдена: ${email}:${draftId}`,
+//     );
+//     return;
+//   }
+
+//   entry.appointmentId = appointmentId;
+//   store.set(key, entry);
+
+//   console.log(
+//     `[OTP Store] 🔗 Привязан appointment ${appointmentId} к OTP ${email}:${draftId}`,
+//   );
+// }
+
+// /**
+//  * Проверяет, подтверждён ли OTP
+//  */
+// export function isConfirmed(
+//   method: OTPMethod,
+//   email: string,
+//   draftId: string,
+// ): boolean {
+//   const entry = getOTP(method, email, draftId);
+//   return !!entry?.confirmed;
+// }
+
+// /**
+//  * Удаляет OTP
+//  */
+// export function deleteOTP(
+//   method: OTPMethod,
+//   email: string,
+//   draftId: string,
+// ): void {
+//   const key = createKey(method, email, draftId);
+//   store.delete(key);
+//   console.log(`[OTP Store] Удалён код для ${email}:${draftId}`);
+// }
+
+// /**
+//  * Отладочная печать
+//  */
+// export function debugOTPStore(): void {
+//   console.log("=== OTP Store Debug ===");
+//   console.log("Всего кодов:", store.size);
+
+//   store.forEach((entry, key) => {
+//     const [method, email, draftId] = key.split(":");
+//     const expired = Date.now() > entry.expiresAt;
+//     console.log(
+//       `${method} | ${email} | ${draftId} | код=${entry.code} | confirmed=${entry.confirmed} | appointmentId=${entry.appointmentId} | expired=${expired}`,
+//     );
+//   });
+// }
+
+
+
 // // src/lib/otp-store.ts - Обновлённая версия с getOTP
 
 // export type OTPMethod = 'email' | 'telegram';

==== Untracked files ==== 
1100
public/Readme01.03.md
src/lib/ai/sms-sender.ts
src/lib/ai/verification-choice.ts

==== CONTENT: 1100 ==== 

==== CONTENT: public/Readme01.03.md ==== 

==== CONTENT: src/lib/ai/sms-sender.ts ==== 

==== CONTENT: src/lib/ai/verification-choice.ts ==== 

==== CONTENT: 1100 ==== 

==== CONTENT: src/lib/ai/sms-sender.ts ==== 
// src/lib/ai/sms-sender.ts
// SMS abstraction for AI assistant.
// Picks the configured provider: ZADARMA (default) > MOBIZON > INFOBIP.

type SendResult = { ok: true } | { ok: false; error: string };

type SmsProvider = 'mobizon' | 'infobip' | 'zadarma';

function hasZadarmaConfig(): boolean {
  return Boolean(process.env.ZADARMA_API_KEY && process.env.ZADARMA_API_SECRET);
}

function detectProvider(): SmsProvider | null {
  // Explicit override
  const explicit = process.env.AI_SMS_PROVIDER?.toLowerCase();
  if (explicit === 'mobizon' || explicit === 'infobip' || explicit === 'zadarma') {
    return explicit;
  }

  // Auto-detect by configured keys
  if (hasZadarmaConfig()) return 'zadarma';
  if (process.env.MOBIZON_API_KEY) return 'mobizon';
  if (process.env.INFOBIP_API_KEY) return 'infobip';

  return null;
}

/**
 * Send an OTP code via SMS to the given phone number.
 */
export async function sendSmsOtp(
  phone: string,
  code: string,
): Promise<SendResult> {
  const provider = detectProvider();

  if (!provider) {
    console.warn(
      '[AI SMS] No SMS provider configured (set ZADARMA_API_KEY + ZADARMA_API_SECRET, or MOBIZON_API_KEY, or INFOBIP_API_KEY)',
    );
    return { ok: false, error: 'SMS_NOT_CONFIGURED' };
  }

  const message = `Salon Elen: Ihr Bestätigungscode ist ${code}. Gültig für 10 Minuten.`;

  try {
    switch (provider) {
      case 'mobizon': {
        const { sendPinSms } = await import('@/lib/mobizon-sms');
        const result = await sendPinSms(phone, code);
        if (result.success) return { ok: true };
        return { ok: false, error: 'error' in result ? String(result.error) : 'MOBIZON_ERROR' };
      }

      case 'infobip': {
        const { sendPinSms } = await import('@/lib/infobip-sms');
        const result = await sendPinSms(phone, code);
        if (result.success) return { ok: true };
        return { ok: false, error: 'error' in result ? String(result.error) : 'INFOBIP_ERROR' };
      }

      case 'zadarma': {
        const { sendPinSms } = await import('@/lib/zadarma-sms');
        const result = await sendPinSms(phone, code);
        if (result.success) return { ok: true };
        return { ok: false, error: 'error' in result ? String(result.error) : 'ZADARMA_ERROR' };
      }

      default:
        return { ok: false, error: 'UNKNOWN_PROVIDER' };
    }
  } catch (err) {
    console.error(`[AI SMS] ${provider} send failed:`, err);
    return { ok: false, error: 'SMS_SEND_FAILED' };
  }
}

/**
 * Check if SMS sending is available (at least one provider configured).
 */
export function isSmsAvailable(): boolean {
  return detectProvider() !== null;
}

==== CONTENT: src/lib/ai/verification-choice.ts ==== 
// src/lib/ai/verification-choice.ts
// Helper functions for verification method selection UI in AI chat.

import { isSmsAvailable } from '@/lib/ai/sms-sender';

type Locale = 'de' | 'ru' | 'en';

interface VerificationOptions {
  hasEmail: boolean;
  hasPhone: boolean;
}

export type RegistrationMethodChoice =
  | 'google_oauth'
  | 'email_otp'
  | 'sms_otp'
  | 'telegram_otp';

/**
 * Build the clickable registration method choice message.
 * This is shown right after slot reservation, before contact collection.
 */
export function buildRegistrationMethodChoiceText(locale: Locale): string {
  const header =
    locale === 'ru'
      ? 'Слот забронирован на 5 минут. Выберите способ регистрации и подтверждения:'
      : locale === 'en'
        ? 'Your slot is reserved for 5 minutes. Choose registration and verification method:'
        : 'Ihr Slot ist für 5 Minuten reserviert. Bitte wählen Sie die Registrierungs- und Verifizierungsmethode:';

  const options: string[] = [];

  const googleLabel =
    locale === 'ru'
      ? '🔐 Google'
      : locale === 'en'
        ? '🔐 Google'
        : '🔐 Google';
  options.push(`[option] ${googleLabel} [/option]`);

  const telegramLabel =
    locale === 'ru'
      ? '💬 Telegram'
      : locale === 'en'
        ? '💬 Telegram'
        : '💬 Telegram';
  options.push(`[option] ${telegramLabel} [/option]`);

  if (isSmsAvailable()) {
    const smsLabel =
      locale === 'ru'
        ? '📱 SMS'
        : locale === 'en'
          ? '📱 SMS'
          : '📱 SMS';
    options.push(`[option] ${smsLabel} [/option]`);
  }

  const emailLabel =
    locale === 'ru'
      ? '📧 Email'
      : locale === 'en'
        ? '📧 Email'
        : '📧 E-Mail';
  options.push(`[option] ${emailLabel} [/option]`);

  return `${header}\n\n${options.join('\n')}`;
}

/**
 * Build the clickable verification method choice message.
 * Shows available methods based on what contact info the user provided.
 */
export function buildVerificationMethodChoiceText(
  locale: Locale,
  options: VerificationOptions,
): string {
  const header =
    locale === 'ru'
      ? 'Данные сохранены! Выберите способ получения кода подтверждения:'
      : locale === 'en'
        ? 'Details saved! Please choose how to receive your verification code:'
        : 'Daten gespeichert! Bitte wählen Sie, wie Sie den Bestätigungscode erhalten möchten:';

  const buttons: string[] = [];

  if (options.hasEmail) {
    const label =
      locale === 'ru'
        ? '📧 Код на Email'
        : locale === 'en'
          ? '📧 Code via Email'
          : '📧 Code per E-Mail';
    buttons.push(`[option] ${label} [/option]`);
  }

  if (options.hasPhone && isSmsAvailable()) {
    const label =
      locale === 'ru'
        ? '📱 Код по SMS'
        : locale === 'en'
          ? '📱 Code via SMS'
          : '📱 Code per SMS';
    buttons.push(`[option] ${label} [/option]`);
  }

  if (options.hasPhone) {
    const label =
      locale === 'ru'
        ? '💬 Код в Telegram'
        : locale === 'en'
          ? '💬 Code via Telegram'
          : '💬 Code per Telegram';
    buttons.push(`[option] ${label} [/option]`);
  }

  // Fallback: if no buttons (shouldn't happen), show email only
  if (buttons.length === 0) {
    const fallbackLabel =
      locale === 'ru'
        ? '📧 Код на Email'
        : locale === 'en'
          ? '📧 Code via Email'
          : '📧 Code per E-Mail';
    buttons.push(`[option] ${fallbackLabel} [/option]`);
  }

  return `${header}\n\n${buttons.join('\n')}`;
}

type VerificationMethod = 'email_otp' | 'sms_otp' | 'telegram_otp';

const EMAIL_PATTERNS = [
  'код на email',
  'code via email',
  'code per e-mail',
  'email',
  'e-mail',
  'почта',
  'почту',
  'имейл',
];

const SMS_PATTERNS = [
  'код по sms',
  'code via sms',
  'code per sms',
  'sms',
  'смс',
];

const TELEGRAM_PATTERNS = [
  'код в telegram',
  'code via telegram',
  'code per telegram',
  'telegram',
  'телеграм',
  'телеграмм',
  'тг',
];

const GOOGLE_PATTERNS = ['google', 'гугл', 'гугле', 'гуглe'];

/**
 * Detect method choice from the "registration method" stage.
 * This stage may include Google.
 */
export function detectRegistrationMethodChoice(text: string): RegistrationMethodChoice | null {
  const normalized = text
    .replace(
      /^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F]+\s*/u,
      '',
    )
    .toLowerCase()
    .trim();

  if (!normalized) return null;

  for (const pattern of GOOGLE_PATTERNS) {
    if (normalized.includes(pattern)) return 'google_oauth';
  }

  for (const pattern of TELEGRAM_PATTERNS) {
    if (normalized.includes(pattern)) return 'telegram_otp';
  }

  for (const pattern of SMS_PATTERNS) {
    if (normalized.includes(pattern)) return 'sms_otp';
  }

  for (const pattern of EMAIL_PATTERNS) {
    if (normalized.includes(pattern)) return 'email_otp';
  }

  return null;
}

/**
 * Detect if the user's message is selecting a verification method.
 * Returns the method if detected, null otherwise.
 */
export function detectVerificationMethodChoice(text: string): VerificationMethod | null {
  const normalized = text
    .replace(
      /^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F]+\s*/u,
      '',
    )
    .toLowerCase()
    .trim();

  if (!normalized) return null;

  // Check Telegram first (avoid "telegram" matching after "email" check)
  for (const pattern of TELEGRAM_PATTERNS) {
    if (normalized.includes(pattern)) return 'telegram_otp';
  }

  for (const SMS_PATTERN of SMS_PATTERNS) {
    if (normalized.includes(SMS_PATTERN)) return 'sms_otp';
  }

  for (const pattern of EMAIL_PATTERNS) {
    if (normalized.includes(pattern)) return 'email_otp';
  }

  return null;
}

/**
 * Get the contact string to use for the given verification method.
 */
export function getContactForMethod(
  method: VerificationMethod,
  email: string | null | undefined,
  phone: string | null | undefined,
): string | null {
  switch (method) {
    case 'email_otp':
      return email || null;
    case 'sms_otp':
    case 'telegram_otp':
      return phone || null;
  }
}
