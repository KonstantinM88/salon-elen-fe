// src/app/api/ai/chat/route.ts
// AI assistant endpoint using OpenAI Chat Completions with function calling.

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSystemPrompt } from '@/lib/ai/system-prompt';
import { TOOLS } from '@/lib/ai/tools-schema';
import { executeTool, type ToolCallRequest } from '@/lib/ai/tool-executor';
import {
  type AiSession,
  getSession,
  upsertSession,
  checkRateLimit,
  appendSessionMessage,
} from '@/lib/ai/session-store';
import { reportMissingServiceInquiry } from '@/lib/ai/missing-service-report';
import { searchAvailabilityMonth } from '@/lib/ai/tools/search-month';
import { searchAvailability } from '@/lib/ai/tools/search-availability';
import { listServices } from '@/lib/ai/tools/list-services';
import { listMastersForServices } from '@/lib/ai/tools/list-masters';
import { startVerification } from '@/lib/ai/tools/start-verification';
import {
  buildRegistrationMethodChoiceText,
  detectRegistrationMethodChoice,
  buildVerificationMethodChoiceText,
  detectVerificationMethodChoice,
  getContactForMethod,
} from '@/lib/ai/verification-choice';
import { prisma } from '@/lib/prisma';

// ─── Config ─────────────────────────────────────────────────────

const MAX_TOOL_ITERATIONS = parseInt(
  process.env.AI_MAX_TOOL_ITERATIONS || '8',
  10,
);
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || '0.15');

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

// ─── Types ──────────────────────────────────────────────────────

interface ChatRequest {
  sessionId: string;
  message: string;
  locale?: string;
}

interface ChatResponse {
  text: string;
  sessionId: string;
  toolCalls?: { name: string; durationMs: number }[];
}

interface MissingServiceSignal {
  query: string;
  suggestedAlternatives: Array<{
    title: string;
    groupTitle?: string | null;
    durationMin?: number | null;
    priceCents?: number | null;
  }>;
}

interface DateSuggestionOption {
  dateISO: string;
  label: string;
  count: number;
}

const AFFIRMATIVE_MESSAGES = new Set([
  'yes',
  'yeah',
  'yep',
  'sure',
  'ok',
  'okay',
  'check',
  'ja',
  'да',
  'ага',
  'ок',
  'хорошо',
  'проверь',
  'проверяй',
  'покажи',
  'показать',
  'show',
  'дa',
]);

function normalizeInput(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function isAffirmativeFollowUp(text: string): boolean {
  const value = normalizeInput(text);
  if (AFFIRMATIVE_MESSAGES.has(value)) return true;
  // tolerate simple typos like "порверь"
  return (
    value.includes('пров') ||
    value.includes('check') ||
    value.includes('покаж') ||
    value.includes('show')
  );
}

function isNearestDateRequest(text: string): boolean {
  const value = normalizeInput(text);
  return (
    value === 'ближайшая дата' ||
    value === 'ближайший день' ||
    value === 'nearest date' ||
    value === 'next date' ||
    value === 'nächstes datum' ||
      value === 'naechstes datum'
  );
}

function isTomorrowRequest(text: string): boolean {
  const value = normalizeInput(text);
  return value === 'завтра' || value === 'tomorrow' || value === 'morgen';
}

const TIME_PREFERENCE_INPUTS = new Set<string>([
  'утро',
  'день',
  'вечер',
  'morning',
  'afternoon',
  'evening',
  'vormittag',
  'nachmittag',
  'abend',
]);

const BOOKING_DOMAIN_KEYWORDS = [
  // RU
  'запис',
  'брон',
  'термин',
  'прием',
  'услуг',
  'спис',
  'цена',
  'цен',
  'прайс',
  'прайс-лист',
  'стоим',
  'стоимост',
  'мастер',
  'салон',
  'адрес',
  'часы',
  'маник',
  'педик',
  'ресниц',
  'бров',
  'перманент',
  'микронед',
  'мезо',
  'стриж',
  'окраш',
  'код подтверждения',
  // DE
  'termin',
  'buch',
  'leistung',
  'preise',
  'preis',
  'kosten',
  'liste',
  'meister',
  'salon',
  'adresse',
  'öffnungs',
  'oeffnungs',
  'nagel',
  'pedik',
  'wimper',
  'augenbrau',
  'permanent',
  'haarschnitt',
  'coloring',
  'bestätigungscode',
  // EN
  'book',
  'booking',
  'appointment',
  'service',
  'services',
  'price',
  'prices',
  'cost',
  'costs',
  'list',
  'master',
  'salon',
  'address',
  'hours',
  'nails',
  'pedicure',
  'lashes',
  'brows',
  'permanent',
  'haircut',
  'verification code',
];

const RESEND_CODE_HINTS = [
  'новый код',
  'код еще раз',
  'код ещё раз',
  'отправь код',
  'resend',
  'send code again',
  'new code',
  'code again',
  'erneut',
  'neuer code',
  'code erneut',
];

function looksLikeDateOrTimeSelection(text: string): boolean {
  const value = normalizeInput(text);
  if (!value) return false;
  if (isNearestDateRequest(value) || isTomorrowRequest(value)) return true;
  if (TIME_PREFERENCE_INPUTS.has(value)) return true;
  if (/\b\d{1,2}[:.]\d{2}\s*[–-]\s*\d{1,2}[:.]\d{2}\b/.test(value)) return true;
  if (/\b\d{1,2}[./-]\d{1,2}\b/.test(value)) return true;
  return false;
}

function looksLikeContactPayload(text: string): boolean {
  const value = text.trim();
  if (!value) return false;
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value);
  const hasPhone = /(?:\+?\d[\d\s().-]{6,}\d)/.test(value);
  return hasEmail || hasPhone;
}

function looksLikeServiceOptionPayload(text: string): boolean {
  const value = normalizeInput(text);
  if (!value) return false;
  // UI option payload: "<service> — 60 мин., 35,00 €" (or "min.")
  return /[—–-]\s*\d{1,3}\s*(?:мин\.?|min\.?)/iu.test(value);
}

function isLikelyBookingDomainMessage(text: string): boolean {
  const normalizedInput = normalizeInput(text);
  if (!normalizedInput) return false;

  if (looksLikeServiceOptionPayload(text)) return true;
  if (looksLikeDateOrTimeSelection(text)) return true;
  if (looksLikeContactPayload(text)) return true;
  if (/^\d{6}$/.test(normalizedInput)) return true; // OTP code
  if (isNearestDateRequest(text) || isTomorrowRequest(text) || isAffirmativeFollowUp(text)) {
    return true;
  }
  if (parseDayMonth(normalizedInput)) return true;

  return BOOKING_DOMAIN_KEYWORDS.some((keyword) => normalizedInput.includes(keyword));
}

function looksLikeNameOnlyPayload(text: string): boolean {
  const value = text.trim();
  if (!value || value.length > 60) return false;
  if (/[?！？]/u.test(value)) return false;
  if (/\d/.test(value)) return false;

  const parts = value
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0 || parts.length > 3) return false;

  return parts.every((p) => /^[\p{L}'-]{2,}$/u.test(p));
}

function looksLikeOtpCode(text: string): boolean {
  const value = normalizeInput(text);
  return /^\d{4,8}$/.test(value);
}

function looksLikeResendRequest(text: string): boolean {
  const value = normalizeInput(text);
  return RESEND_CODE_HINTS.some((hint) => value.includes(hint));
}

function shouldApplyScopeGuard(text: string, session: AiSession): boolean {
  const normalizedInput = normalizeInput(text);
  if (!normalizedInput) return false;

  if (session.context.awaitingRegistrationMethod) {
    // During method-selection step allow only explicit method clicks/texts.
    if (detectRegistrationMethodChoice(text)) return false;
    return true;
  }

  // Always allow clearly booking-related messages.
  if (isLikelyBookingDomainMessage(text)) return false;

  const awaitingContact = Boolean(session.context.reservedSlot && !session.context.draftId);
  if (awaitingContact) {
    // During contact step allow name/email/phone-like payloads only.
    if (looksLikeContactPayload(text) || looksLikeNameOnlyPayload(text)) return false;
    return true;
  }

  const awaitingOtp = Boolean(session.context.draftId);
  if (awaitingOtp) {
    // During OTP step allow code, resend requests, email correction and simple confirmations.
    if (
      looksLikeOtpCode(text) ||
      looksLikeResendRequest(text) ||
      looksLikeContactPayload(text) ||
      isAffirmativeFollowUp(text)
    ) {
      return false;
    }
    return true;
  }

  // Outside booking scope: block any non-domain chat/small-talk/trivia.
  return true;
}

function buildScopeGuardText(
  locale: 'de' | 'ru' | 'en',
  hasActiveBookingFlow: boolean,
): string {
  if (locale === 'ru') {
    const header = hasActiveBookingFlow
      ? 'Я помогаю только с записью и вопросами о салоне. Давайте продолжим текущую запись.'
      : 'Я помогаю только с записью и вопросами о салоне.';
    const continueOption = hasActiveBookingFlow
      ? '[option] ✅ Продолжить запись [/option]\n'
      : '';
    return `${header}\n\n${continueOption}[option] 📅 Записаться на приём [/option]\n[option] 💅 Услуги и цены [/option]\n[option] 📍 Адрес и часы работы [/option]`;
  }

  if (locale === 'en') {
    const header = hasActiveBookingFlow
      ? 'I can only help with salon bookings and service questions. Let us continue your current booking.'
      : 'I can only help with salon bookings and service questions.';
    const continueOption = hasActiveBookingFlow
      ? '[option] ✅ Continue booking [/option]\n'
      : '';
    return `${header}\n\n${continueOption}[option] 📅 Book appointment [/option]\n[option] 💅 Services & prices [/option]\n[option] 📍 Address & opening hours [/option]`;
  }

  const header = hasActiveBookingFlow
    ? 'Ich helfe nur bei Terminbuchung und Salonfragen. Lassen Sie uns Ihre aktuelle Buchung fortsetzen.'
    : 'Ich helfe nur bei Terminbuchung und Salonfragen.';
  const continueOption = hasActiveBookingFlow
    ? '[option] ✅ Buchung fortsetzen [/option]\n'
    : '';
  return `${header}\n\n${continueOption}[option] 📅 Termin buchen [/option]\n[option] 💅 Leistungen & Preise [/option]\n[option] 📍 Anfahrt & Öffnungszeiten [/option]`;
}

function formatDateLabel(dateISO: string, locale: 'de' | 'ru' | 'en'): string {
  const [y, m, d] = dateISO.split('-').map((v) => parseInt(v, 10));
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12, 0, 0));
  const fmtLocale = locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'de-DE';
  return dt.toLocaleDateString(fmtLocale, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
}

function buildNoSlotsFollowUpText(
  locale: 'de' | 'ru' | 'en',
  optionsMap: DateSuggestionOption[],
): string {
  if (optionsMap.length === 0) {
    if (locale === 'ru') {
      return 'К сожалению, в ближайшие даты свободных окон не нашлось. Хотите, я проверю другого мастера?';
    }
    if (locale === 'en') {
      return 'Unfortunately, I could not find free slots in the nearest dates. Do you want me to check another master?';
    }
    return 'Leider habe ich in den nächsten Tagen keine freien Slots gefunden. Soll ich einen anderen Meister prüfen?';
  }

  const header =
    locale === 'ru'
      ? 'Нашла ближайшие свободные дни. Какой день проверить по времени?'
      : locale === 'en'
        ? 'I found the nearest available days. Which day should I check for exact times?'
        : 'Ich habe die nächsten freien Tage gefunden. Welchen Tag soll ich mit Uhrzeiten prüfen?';

  const optionEmoji = locale === 'ru' ? '📅' : '📅';
  const options = optionsMap
    .slice(0, 6)
    .map(
      (opt) =>
        `[option] ${optionEmoji} ${opt.label} (${opt.count}) [/option]`,
    )
    .join('\n');

  const manualHint =
    locale === 'ru'
      ? 'Или укажите желаемую дату в формате ДД.ММ (например, 10.03).'
      : locale === 'en'
        ? 'Or type your preferred date in DD.MM format (for example, 10.03).'
        : 'Oder geben Sie Ihr Wunschdatum im Format TT.MM ein (zum Beispiel 10.03).';

  return `${header}\n\n${options}\n\n${manualHint}`;
}

function mapMonthDaysToOptions(
  days: Record<string, number> | undefined,
  locale: 'de' | 'ru' | 'en',
): DateSuggestionOption[] {
  return Object.entries(days ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateISO, count]) => ({
      dateISO,
      label: formatDateLabel(dateISO, locale),
      count,
    }));
}

function normalizeSuggestedDateInput(value: string): string {
  return normalizeChoiceText(value)
    .replace(/\(\s*\d+\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDayMonth(value: string): string | null {
  const m = value.match(/(\d{1,2})[./-](\d{1,2})/);
  if (!m) return null;
  return `${m[1].padStart(2, '0')}.${m[2].padStart(2, '0')}`;
}

function dateIsoToDayMonth(dateISO: string): string {
  const [, month, day] = dateISO.split('-');
  return `${day}.${month}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDateISO(dateISO: string, days: number): string {
  const dt = new Date(`${dateISO}T00:00:00.000Z`);
  if (Number.isNaN(dt.getTime())) return dateISO;
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function nextMonthISO(monthISO: string): string {
  const [year, month] = monthISO
    .split('-')
    .map((part) => Number.parseInt(part, 10));
  if (!year || !month) return monthISO;
  const dt = new Date(Date.UTC(year, month - 1, 1));
  if (Number.isNaN(dt.getTime())) return monthISO;
  dt.setUTCMonth(dt.getUTCMonth() + 1);
  return dt.toISOString().slice(0, 7);
}

function toISODate(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(dt.getTime()) ||
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }

  return dt.toISOString().slice(0, 10);
}

function parseExplicitDateInputToISO(
  input: string,
  referenceDateISO: string,
): string | null {
  const dayMonth = parseDayMonth(input);
  if (!dayMonth) return null;

  const [dayRaw, monthRaw] = dayMonth.split('.');
  const day = Number.parseInt(dayRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  if (!day || !month) return null;

  const referenceYear = Number.parseInt(referenceDateISO.slice(0, 4), 10);
  const fallbackYear = Number.isInteger(referenceYear)
    ? referenceYear
    : new Date().getUTCFullYear();

  let candidate = toISODate(fallbackYear, month, day);
  if (!candidate) return null;

  // If the date for current reference year is already in the past,
  // interpret it as next year's date.
  if (candidate < referenceDateISO) {
    const nextYearCandidate = toISODate(fallbackYear + 1, month, day);
    if (nextYearCandidate) {
      candidate = nextYearCandidate;
    }
  }

  return candidate;
}

async function buildNearestDateOptions(params: {
  masterId: string;
  serviceIds: string[];
  locale: 'de' | 'ru' | 'en';
  startDateISO: string;
  minCount?: number;
}): Promise<DateSuggestionOption[]> {
  const { masterId, serviceIds, locale, startDateISO } = params;
  const minCount = params.minCount ?? 6;
  const byDate = new Map<string, DateSuggestionOption>();

  const appendDays = (days?: Record<string, number>) => {
    for (const option of mapMonthDaysToOptions(days, locale)) {
      if (option.dateISO < startDateISO) continue;
      if (!byDate.has(option.dateISO)) {
        byDate.set(option.dateISO, option);
      }
    }
  };

  const firstMonthISO = startDateISO.slice(0, 7);
  const firstMonth = await searchAvailabilityMonth({
    masterId,
    monthISO: firstMonthISO,
    serviceIds,
  });
  appendDays(firstMonth.days);

  if (byDate.size < minCount) {
    const secondMonthISO = nextMonthISO(firstMonthISO);
    const secondMonth = await searchAvailabilityMonth({
      masterId,
      monthISO: secondMonthISO,
      serviceIds,
    });
    appendDays(secondMonth.days);
  }

  return Array.from(byDate.values())
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    .slice(0, 12);
}

function matchSuggestedDateOption(
  input: string,
  options: DateSuggestionOption[],
): DateSuggestionOption | null {
  const norm = normalizeSuggestedDateInput(input);
  if (!norm) return null;

  for (const option of options) {
    const optionNorm = normalizeSuggestedDateInput(option.label);
    if (
      norm === optionNorm ||
      norm.includes(optionNorm) ||
      optionNorm.includes(norm)
    ) {
      return option;
    }
  }

  const dm = parseDayMonth(norm);
  if (dm) {
    const found = options.find((o) => dateIsoToDayMonth(o.dateISO) === dm);
    if (found) return found;
  }

  return null;
}

function buildSlotsForDateText(
  locale: 'de' | 'ru' | 'en',
  dateISO: string,
  slots: Array<{ displayTime: string }>,
): string {
  const label = formatDateLabel(dateISO, locale);
  if (slots.length === 0) {
    if (locale === 'ru') {
      return `На ${label} свободных слотов нет. Хотите, я предложу другие даты?`;
    }
    if (locale === 'en') {
      return `There are no free slots on ${label}. Do you want me to suggest other dates?`;
    }
    return `Für ${label} gibt es keine freien Slots. Soll ich andere Tage vorschlagen?`;
  }

  const header =
    locale === 'ru'
      ? `Вот свободные слоты на ${label}. Какой слот вам подходит?`
      : locale === 'en'
        ? `Here are free slots for ${label}. Which time works for you?`
        : `Hier sind freie Slots für ${label}. Welche Uhrzeit passt Ihnen?`;

  const options = slots
    .slice(0, 12)
    .map((s) => `[option] 🕐 ${s.displayTime} [/option]`)
    .join('\n');

  return `${header}\n\n${options}`;
}

function buildSlotTakenAlternativesText(
  locale: 'de' | 'ru' | 'en',
  dateISO: string,
  slots: Array<{ displayTime: string }>,
): string {
  const label = formatDateLabel(dateISO, locale);
  const intro =
    locale === 'ru'
      ? `К сожалению, этот слот уже был занят другим клиентом. Давайте проверим другие доступные слоты на ${label}.`
      : locale === 'en'
        ? `Unfortunately, that slot has already been taken by another client. Let us check other available times on ${label}.`
        : `Leider wurde dieser Slot bereits von einem anderen Kunden belegt. Lassen Sie uns andere verfügbare Zeiten am ${label} prüfen.`;

  if (slots.length === 0) {
    return `${intro}\n\n${buildNoSlotsFollowUpText(locale, [])}`;
  }

  const followUp =
    locale === 'ru'
      ? 'Вот альтернативные варианты:\nКакой слот вам подходит?'
      : locale === 'en'
        ? 'Here are alternative options:\nWhich slot works for you?'
        : 'Hier sind alternative Optionen:\nWelcher Slot passt Ihnen?';

  const options = slots
    .slice(0, 12)
    .map((s) => `[option] 🕐 ${s.displayTime} [/option]`)
    .join('\n');

  return `${intro}\n${followUp}\n${options}`;
}

function fallbackTextByLocale(locale: 'de' | 'ru' | 'en'): string {
  if (locale === 'ru') {
    return 'Извините, не удалось сформировать ответ. Хотите, я сразу покажу ближайшие свободные даты?';
  }
  if (locale === 'en') {
    return 'Sorry, I could not generate a response. Do you want me to show the nearest available dates right away?';
  }
  return 'Entschuldigung, ich konnte keine Antwort generieren. Soll ich direkt die nächsten freien Termine zeigen?';
}

function buildVerificationAutoText(
  locale: 'de' | 'ru' | 'en',
  opts: { ok: boolean; contactMasked?: string; error?: string },
): string {
  if (opts.ok) {
    if (locale === 'ru') {
      return `Код подтверждения отправлен на ${opts.contactMasked ?? 'ваш email'}.\n\nПожалуйста, введите 6-значный код для завершения бронирования.\n\nЕсли письма нет 1–2 минуты, проверьте папку "Спам".`;
    }
    if (locale === 'en') {
      return `A verification code has been sent to ${opts.contactMasked ?? 'your email'}.\n\nPlease enter the 6-digit code to complete the booking.\n\nIf you do not see the email within 1-2 minutes, check your Spam folder.`;
    }
    return `Ein Bestätigungscode wurde an ${opts.contactMasked ?? 'Ihre E-Mail'} gesendet.\n\nBitte geben Sie den 6-stelligen Code ein, um die Buchung abzuschließen.\n\nWenn keine E-Mail innerhalb von 1-2 Minuten kommt, prüfen Sie bitte den Spam-Ordner.`;
  }

  if (opts.error === 'PHONE_FORMAT_INVALID') {
    if (locale === 'ru') {
      return 'Не удалось отправить SMS: номер телефона в неверном формате.\n\nПожалуйста, укажите номер в международном формате `+49...` или `+38...` и повторите контактные данные.';
    }
    if (locale === 'en') {
      return 'Could not send SMS: phone number format is invalid.\n\nPlease provide the number in international format `+49...` or `+38...` and resend your contact details.';
    }
    return 'SMS konnte nicht gesendet werden: Telefonnummer hat ein ungültiges Format.\n\nBitte geben Sie die Nummer im internationalen Format `+49...` oder `+38...` an und senden Sie Ihre Kontaktdaten erneut.';
  }

  if (locale === 'ru') {
    return `Не удалось отправить код подтверждения (${opts.error ?? 'ошибка отправки'}).\n\nПроверьте введённые контактные данные и напишите "отправь код ещё раз".`;
  }
  if (locale === 'en') {
    return `I could not send the verification code (${opts.error ?? 'send error'}).\n\nPlease check your contact data and type "send code again".`;
  }
  return `Der Bestätigungscode konnte nicht gesendet werden (${opts.error ?? 'Sendeproblem'}).\n\nBitte prüfen Sie Ihre Kontaktdaten und schreiben Sie "Code erneut senden".`;
}

function buildContactCollectionTextForMethod(
  locale: 'de' | 'ru' | 'en',
  method: 'email_otp' | 'sms_otp' | 'telegram_otp',
): string {
  if (locale === 'ru') {
    if (method === 'email_otp') {
      return 'Вы выбрали подтверждение по Email.\nПожалуйста, укажите ваше имя и адрес электронной почты для завершения записи.\nВаши данные будут использоваться только для управления записью.';
    }
    if (method === 'sms_otp') {
      return 'Вы выбрали подтверждение по SMS.\nПожалуйста, укажите ваше имя, номер телефона и адрес электронной почты для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
    }
    return 'Вы выбрали подтверждение через Telegram.\nПожалуйста, укажите ваше имя, номер телефона (привязанный к Telegram-боту) и адрес электронной почты для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
  }

  if (locale === 'en') {
    if (method === 'email_otp') {
      return 'You chose Email verification.\nPlease provide your name and email address to finish the booking.\nYour data will only be used for appointment management.';
    }
    if (method === 'sms_otp') {
      return 'You chose SMS verification.\nPlease provide your name, phone number, and email address to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
    }
    return 'You chose Telegram verification.\nPlease provide your name, phone number (linked to our Telegram bot), and email address to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
  }

  if (method === 'email_otp') {
    return 'Sie haben E-Mail-Verifizierung gewählt.\nBitte geben Sie Ihren Namen und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nIhre Daten werden nur zur Terminverwaltung verwendet.';
  }
  if (method === 'sms_otp') {
    return 'Sie haben SMS-Verifizierung gewählt.\nBitte geben Sie Ihren Namen, Ihre Telefonnummer und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
  }
  return 'Sie haben Telegram-Verifizierung gewählt.\nBitte geben Sie Ihren Namen, Ihre Telefonnummer (mit Telegram-Bot verknüpft) und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
}

function buildMissingContactForMethodText(
  locale: 'de' | 'ru' | 'en',
  method: 'email_otp' | 'sms_otp' | 'telegram_otp',
): string {
  if (locale === 'ru') {
    if (method === 'email_otp') {
      return 'Для подтверждения по Email нужен корректный email. Пожалуйста, укажите email и повторите.';
    }
    if (method === 'sms_otp') {
      return 'Для подтверждения по SMS нужен номер телефона в формате +49... или +38.... Пожалуйста, укажите корректный номер и повторите.';
    }
    return 'Для подтверждения через Telegram нужен номер телефона, привязанный к Telegram-боту, в формате +49... или +38.... Пожалуйста, укажите корректный номер и повторите.';
  }

  if (locale === 'en') {
    if (method === 'email_otp') {
      return 'Email verification needs a valid email address. Please provide your email and try again.';
    }
    if (method === 'sms_otp') {
      return 'SMS verification needs a phone number in +49... or +38... format. Please provide a valid number and try again.';
    }
    return 'Telegram verification needs a phone number linked to our bot in +49... or +38... format. Please provide a valid number and try again.';
  }

  if (method === 'email_otp') {
    return 'Für die E-Mail-Verifizierung wird eine gültige E-Mail-Adresse benötigt. Bitte E-Mail angeben und erneut versuchen.';
  }
  if (method === 'sms_otp') {
    return 'Für die SMS-Verifizierung wird eine Telefonnummer im Format +49... oder +38... benötigt. Bitte korrekte Nummer angeben und erneut versuchen.';
  }
  return 'Für die Telegram-Verifizierung wird eine mit dem Bot verknüpfte Telefonnummer im Format +49... oder +38... benötigt. Bitte korrekte Nummer angeben und erneut versuchen.';
}

function buildGoogleHandoffUrl(session: AiSession): string | null {
  const serviceId = session.context.selectedServiceIds?.[0];
  const masterId = session.context.selectedMasterId;
  const reserved = session.context.reservedSlot;

  if (!serviceId || !masterId || !reserved) return null;

  const selectedDate = reserved.startAt.slice(0, 10);
  const params = new URLSearchParams({
    s: serviceId,
    m: masterId,
    start: reserved.startAt,
    end: reserved.endAt,
    d: selectedDate,
  });
  const path = `/booking/client?${params.toString()}`;

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');
  return baseUrl ? `${baseUrl}${path}` : path;
}

function escapeOptionAttr(value: string): string {
  return value.replace(/"/g, '%22').replace(/\]/g, '%5D');
}

function buildGoogleHandoffText(locale: 'de' | 'ru' | 'en', url: string): string {
  const safeUrl = escapeOptionAttr(url);

  if (locale === 'ru') {
    return `Вы выбрали регистрацию через Google.\nНажмите кнопку ниже, чтобы продолжить в защищённом потоке:\n[option url="${safeUrl}"]🔐 Продолжить через Google[/option]`;
  }
  if (locale === 'en') {
    return `You selected Google registration.\nTap the button below to continue in the secure flow:\n[option url="${safeUrl}"]🔐 Continue with Google[/option]`;
  }
  return `Sie haben Google-Registrierung gewählt.\nKlicken Sie auf die Schaltfläche unten, um im sicheren Flow fortzufahren:\n[option url="${safeUrl}"]🔐 Mit Google fortfahren[/option]`;
}

function normalizeChoiceText(value: string): string {
  return value
    .replace(
      /^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F]+\s*/u,
      '',
    )
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCatalogSelectionInput(value: string): string {
  // Strip UI metadata from option clicks:
  // "Обычный — 60 мин., 35,00 €" -> "Обычный"
  const compact = value
    .replace(/\s*[—–-]\s*\d{1,3}\s*(?:мин\.?|min\.?).*$/iu, '')
    .trim();
  return normalizeChoiceText(compact);
}

function tokenizeNormalized(value: string): string[] {
  return normalizeChoiceText(value)
    .split(' ')
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

function choiceScore(candidate: string, input: string): number {
  if (!candidate || !input) return 0;
  if (candidate === input) return 10000;

  let score = 0;

  if (input.includes(candidate)) {
    score += 400 + candidate.length;
  }
  if (candidate.includes(input)) {
    score += 300 + input.length;
  }

  const candTokens = tokenizeNormalized(candidate);
  const inputTokens = new Set(tokenizeNormalized(input));
  if (candTokens.length > 0 && inputTokens.size > 0) {
    const overlap = candTokens.reduce(
      (acc, token) => (inputTokens.has(token) ? acc + 1 : acc),
      0,
    );
    if (overlap > 0) {
      score += overlap * 80;
      if (overlap === candTokens.length) {
        score += 250;
      }
      // Prefer more specific (longer) variants when overlap is similar.
      score += candTokens.length * 5;
    }
  }

  return score;
}

function chooseBestMatch<T>(
  items: T[],
  getCandidate: (item: T) => string,
  input: string,
): T | null {
  let best: T | null = null;
  let bestScore = 0;

  for (const item of items) {
    const candidate = getCandidate(item);
    const score = choiceScore(candidate, input);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return bestScore > 0 ? best : null;
}

function formatPrice(locale: 'de' | 'ru' | 'en', priceCents: number | null): string {
  if (priceCents == null) {
    return locale === 'ru' ? 'цена по запросу' : locale === 'en' ? 'price on request' : 'Preis auf Anfrage';
  }
  const value = (priceCents / 100).toFixed(2);
  const localized = locale === 'en' ? value : value.replace('.', ',');
  return `${localized} €`;
}

function formatServiceOption(
  locale: 'de' | 'ru' | 'en',
  service: { title: string; durationMin: number; priceCents: number | null },
): string {
  const minutes = locale === 'ru' ? 'мин.' : 'min.';
  return `[option] 💅 ${service.title} — ${service.durationMin} ${minutes}, ${formatPrice(locale, service.priceCents)} [/option]`;
}

function buildCategoryToServiceText(
  locale: 'de' | 'ru' | 'en',
  categoryTitle: string,
  options: string[],
): string {
  const intro =
    locale === 'ru'
      ? `Вы выбрали категорию "${categoryTitle}". Чтобы записаться, выберите конкретную услугу:`
      : locale === 'en'
        ? `You selected the category "${categoryTitle}". To continue booking, please choose a specific service:`
        : `Sie haben die Kategorie "${categoryTitle}" gewählt. Für die Buchung wählen Sie bitte eine konkrete Leistung:`;
  const question =
    locale === 'ru'
      ? 'Какую услугу выбираем?'
      : locale === 'en'
        ? 'Which service would you like to choose?'
        : 'Welche Leistung möchten Sie wählen?';

  return `${intro}\n\n${options.join('\n')}\n\n${question}`;
}

function buildNoMasterForServiceText(
  locale: 'de' | 'ru' | 'en',
  serviceTitle: string,
  options: string[],
): string {
  const intro =
    locale === 'ru'
      ? `Для услуги "${serviceTitle}" сейчас нет назначенных мастеров.`
      : locale === 'en'
        ? `There are currently no assigned masters for "${serviceTitle}".`
        : `Für die Leistung "${serviceTitle}" sind aktuell keine Meister zugewiesen.`;
  const ask =
    locale === 'ru'
      ? 'Выберите, пожалуйста, другую конкретную услугу:'
      : locale === 'en'
        ? 'Please choose another specific service:'
        : 'Bitte wählen Sie eine andere konkrete Leistung:';

  return options.length > 0 ? `${intro}\n\n${ask}\n\n${options.join('\n')}` : `${intro}\n\n${ask}`;
}

function buildSingleMasterText(
  locale: 'de' | 'ru' | 'en',
  serviceTitle: string,
  masterName: string,
): string {
  if (locale === 'ru') {
    return `Вы выбрали услугу "${serviceTitle}".\n\nЭту услугу выполнит мастер ${masterName}.\n\nСначала выберите дату, затем время:\n\n[option] 📅 Завтра [/option]\n[option] 📅 Ближайшая дата [/option]\n\nИли напишите дату в формате ДД.ММ.`;
  }
  if (locale === 'en') {
    return `You selected "${serviceTitle}".\n\nThis service can be done by ${masterName}.\n\nPlease choose a date first, then we will pick time:\n\n[option] 📅 Tomorrow [/option]\n[option] 📅 Nearest date [/option]\n\nOr type a date in DD.MM format.`;
  }
  return `Sie haben die Leistung "${serviceTitle}" gewählt.\n\nDiese Leistung übernimmt ${masterName}.\n\nBitte wählen Sie zuerst ein Datum, danach die Uhrzeit:\n\n[option] 📅 Morgen [/option]\n[option] 📅 Nächstes Datum [/option]\n\nOder schreiben Sie ein Datum im Format TT.MM.`;
}

function buildMultipleMastersText(
  locale: 'de' | 'ru' | 'en',
  serviceTitle: string,
  options: string[],
): string {
  const intro =
    locale === 'ru'
      ? `Услугу "${serviceTitle}" могут выполнить следующие мастера:`
      : locale === 'en'
        ? `The service "${serviceTitle}" can be performed by:`
        : `Die Leistung "${serviceTitle}" kann von folgenden Meistern ausgeführt werden:`;
  const ask =
    locale === 'ru'
      ? 'Кого выберем?'
      : locale === 'en'
        ? 'Who would you like to choose?'
        : 'Wen möchten Sie wählen?';
  return `${intro}\n\n${options.join('\n')}\n\n${ask}`;
}

function isFullCatalogRequest(text: string, locale: 'de' | 'ru' | 'en'): boolean {
  const value = normalizeInput(text);
  if (!value) return false;

  if (locale === 'ru') {
    const ruPhrases = [
      'услуги и цены',
      'какие услуги',
      'все услуги',
      'полный список',
      'полный прайс',
      'прайс лист',
      'прайс-лист',
      'цены',
      'стоимость',
      'сколько стоит',
    ];
    return ruPhrases.some((p) => value.includes(p));
  }

  if (locale === 'en') {
    const enPhrases = [
      'services and prices',
      'services & prices',
      'what services',
      'full list',
      'price list',
      'prices',
      'how much',
    ];
    return enPhrases.some((p) => value.includes(p));
  }

  const dePhrases = [
    'leistungen und preise',
    'leistungen & preise',
    'welche leistungen',
    'vollständige liste',
    'volle liste',
    'preisliste',
    'preise',
    'kosten',
    'was kostet',
  ];
  return dePhrases.some((p) => value.includes(p));
}

function isBookingStartIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
  hasActiveBookingFlow: boolean,
): boolean {
  const value = normalizeInput(text);
  if (!value) return false;

  const restartPhrases =
    locale === 'ru'
      ? ['новый термин', 'новая запись', 'новый прием', 'новый приём', 'начать заново']
      : locale === 'en'
        ? ['new appointment', 'new booking', 'start over', 'book again']
        : ['neuer termin', 'neue buchung', 'neu anfangen', 'erneut buchen'];

  if (restartPhrases.some((p) => value.includes(p))) return true;

  if (hasActiveBookingFlow) return false;

  const startPhrases =
    locale === 'ru'
      ? [
          'записаться на приём',
          'записаться на прием',
          'хочу записаться',
          'продолжить запись',
        ]
      : locale === 'en'
        ? ['book appointment', 'book a slot', 'continue booking', 'i want to book']
        : ['termin buchen', 'buchung starten', 'buchung fortsetzen', 'ich möchte buchen'];

  return startPhrases.some((p) => value.includes(p));
}

function isDesiredDateQuestion(text: string, locale: 'de' | 'ru' | 'en'): boolean {
  const value = normalizeInput(text);
  if (!value) return false;
  if (parseDayMonth(value)) return false;
  if (value.includes(':')) return false; // likely time-related, not date selection

  if (locale === 'ru') {
    const ruPhrases = [
      'есть даты',
      'другая дата',
      'другую дату',
      'после 10',
      'после 10.',
      'после 10 ',
      'после 10.03',
      'на другую дату',
    ];
    return ruPhrases.some((p) => value.includes(p));
  }

  if (locale === 'en') {
    const enPhrases = [
      'other date',
      'another date',
      'dates after',
      'after 10',
      'can i pick date',
      'preferred date',
    ];
    return enPhrases.some((p) => value.includes(p));
  }

  const dePhrases = [
    'anderes datum',
    'andere datum',
    'daten nach',
    'nach 10',
    'wunschdatum',
  ];
  return dePhrases.some((p) => value.includes(p));
}

function buildBookingStartText(
  locale: 'de' | 'ru' | 'en',
  groupTitles: string[],
): string {
  const intro =
    locale === 'ru'
      ? 'Какую услугу вы хотели бы заказать? Вот некоторые из наших предложений:'
      : locale === 'en'
        ? 'What service would you like to book? Here are some options:'
        : 'Welche Leistung möchten Sie buchen? Hier sind einige Optionen:';
  const ask =
    locale === 'ru'
      ? 'Пожалуйста, выберите услугу!'
      : locale === 'en'
        ? 'Please choose a service!'
        : 'Bitte wählen Sie eine Leistung!';

  if (groupTitles.length === 0) {
    return `${intro}\n${ask}`;
  }

  const options = groupTitles
    .slice(0, 8)
    .map((title) => `[option] ${categoryEmoji(title)} ${title} [/option]`)
    .join('\n');

  return `${intro}\n${ask}\n${options}`;
}

function categoryEmoji(title: string): string {
  const value = normalizeChoiceText(title);
  if (
    value.includes('brow') ||
    value.includes('augenbrau') ||
    value.includes('ресниц') ||
    value.includes('бров')
  ) {
    return '✨';
  }
  if (value.includes('маник') || value.includes('nagel')) return '💅';
  if (value.includes('перманент') || value.includes('permanent') || value.includes('pmu')) {
    return '💄';
  }
  if (value.includes('стриж') || value.includes('haarschnitt') || value.includes('hair')) {
    return '✂️';
  }
  if (value.includes('hydrafacial') || value.includes('hydra')) return '💧';
  if (value.includes('педик') || value.includes('fuß') || value.includes('pedik')) return '🦶';
  return '•';
}

function formatServiceLine(
  locale: 'de' | 'ru' | 'en',
  groupTitle: string,
  service: { title: string; durationMin: number; priceCents: number | null },
): string {
  const minutes = locale === 'ru' ? 'мин.' : 'min.';
  return `${categoryEmoji(groupTitle)} ${service.title} — ${service.durationMin} ${minutes}, ${formatPrice(locale, service.priceCents)}`;
}

function buildFullCatalogText(
  locale: 'de' | 'ru' | 'en',
  groups: Array<{
    title: string;
    services: Array<{ title: string; durationMin: number; priceCents: number | null }>;
  }>,
): string {
  const intro =
    locale === 'ru'
      ? 'Вот полный список наших услуг и цен:'
      : locale === 'en'
        ? 'Here is our full list of services and prices:'
        : 'Hier ist unsere vollständige Liste mit Leistungen und Preisen:';

  const ask =
    locale === 'ru'
      ? 'Если хотите, подберу мастера и ближайшее время для выбранной услуги.'
      : locale === 'en'
        ? 'If you want, I can suggest a master and nearest time for the selected service.'
        : 'Wenn Sie möchten, finde ich direkt einen Meister und die nächste freie Zeit für die gewählte Leistung.';

  const body = groups
    .map((group) => {
      const lines = group.services.map((service) => formatServiceLine(locale, group.title, service));
      return `**${group.title}**\n${lines.join('\n')}`;
    })
    .join('\n\n');

  return `${intro}\n\n${body}\n\n${ask}`;
}

async function tryHandleCatalogSelectionFastPath(
  session: AiSession,
  sessionId: string,
  message: string,
): Promise<ChatResponse | null> {
  const input = normalizeCatalogSelectionInput(message);
  if (!input || input.length < 4) return null;
  if (isAffirmativeFollowUp(message)) return null;
  const hasActiveServiceSelection =
    (session.context.selectedServiceIds?.length ?? 0) > 0 ||
    Boolean(session.context.selectedMasterId);
  if (
    hasActiveServiceSelection &&
    looksLikeDateOrTimeSelection(message)
  ) {
    return null;
  }

  const startedList = Date.now();
  const catalog = await listServices({ locale: session.locale });
  const listDurationMs = Date.now() - startedList;
  const groups = (catalog.groups ?? []) as Array<{
    id: string;
    title: string;
    services: Array<{
      id: string;
      title: string;
      durationMin: number;
      priceCents: number | null;
    }>;
  }>;
  if (groups.length === 0) return null;

  // In active booking flow, do not switch service/category from free-form text.
  // Allow only explicit catalog choices (exact group/service title or service option payload).
  if (hasActiveServiceSelection && !looksLikeServiceOptionPayload(message)) {
    const isExactGroupChoice = groups.some(
      (g) => normalizeChoiceText(g.title) === input,
    );
    const isExactServiceChoice = groups.some((g) =>
      g.services.some((s) => normalizeChoiceText(s.title) === input),
    );
    if (!isExactGroupChoice && !isExactServiceChoice) {
      return null;
    }
  }

  const matchedGroup = chooseBestMatch(
    groups,
    (g) => normalizeChoiceText(g.title),
    input,
  );

  if (matchedGroup) {
    const groupNorm = normalizeChoiceText(matchedGroup.title);
    const inputTokens = tokenizeNormalized(input);
    const groupTokens = tokenizeNormalized(groupNorm);
    const startsWithGroup =
      input === groupNorm || input.startsWith(`${groupNorm} `);
    const isDirectGroupChoice =
      startsWithGroup ||
      (input.includes(groupNorm) && inputTokens.length <= groupTokens.length + 2);

    if (!isDirectGroupChoice) {
      // User most likely clicked a specific service with overlapping words.
      // Continue to concrete service matching below.
    } else {
      const serviceOptions = matchedGroup.services
        .slice(0, 12)
        .map((s) => formatServiceOption(session.locale, s));
      const text = buildCategoryToServiceText(
        session.locale,
        matchedGroup.title,
        serviceOptions,
      );

      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          selectedServiceIds: undefined,
          selectedMasterId: undefined,
          lastSuggestedDateOptions: undefined,
          lastDateISO: undefined,
          lastPreferredTime: undefined,
          lastNoSlots: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=category-to-services group="${matchedGroup.title}"`,
      );

      return {
        text,
        sessionId,
        toolCalls: [{ name: 'list_services', durationMs: listDurationMs }],
      };
    }
  }

  const flatServices = groups.flatMap((g) =>
    g.services.map((s) => ({
      ...s,
      groupTitle: g.title,
    })),
  );

  const matchedService = chooseBestMatch(
    flatServices,
    (s) => normalizeChoiceText(s.title),
    input,
  );
  if (!matchedService) return null;

  const startedMasters = Date.now();
  const mastersResult = await listMastersForServices({ serviceIds: [matchedService.id] });
  const mastersDurationMs = Date.now() - startedMasters;

  if (!mastersResult.masters || mastersResult.masters.length === 0) {
    const alternatives = flatServices
      .filter(
        (s) =>
          s.groupTitle === matchedService.groupTitle &&
          s.id !== matchedService.id,
      )
      .slice(0, 10)
      .map((s) => formatServiceOption(session.locale, s));

    const text = buildNoMasterForServiceText(
      session.locale,
      matchedService.title,
      alternatives,
    );
    appendSessionMessage(sessionId, 'assistant', text);
    upsertSession(sessionId, {
      context: {
        selectedServiceIds: [matchedService.id],
        selectedMasterId: undefined,
        lastSuggestedDateOptions: undefined,
        lastDateISO: undefined,
        lastPreferredTime: undefined,
        lastNoSlots: false,
      },
    });

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-no-master service="${matchedService.title}"`,
    );

    return {
      text,
      sessionId,
      toolCalls: [
        { name: 'list_services', durationMs: listDurationMs },
        { name: 'list_masters_for_services', durationMs: mastersDurationMs },
      ],
    };
  }

  if (mastersResult.masters.length === 1) {
    const master = mastersResult.masters[0];
    const text = buildSingleMasterText(
      session.locale,
      matchedService.title,
      master.name,
    );
    appendSessionMessage(sessionId, 'assistant', text);
    upsertSession(sessionId, {
      context: {
        selectedServiceIds: [matchedService.id],
        selectedMasterId: master.id,
        lastSuggestedDateOptions: undefined,
        lastDateISO: undefined,
        lastPreferredTime: undefined,
        lastNoSlots: false,
      },
    });

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-single-master service="${matchedService.title}" master="${master.name}"`,
    );

    return {
      text,
      sessionId,
      toolCalls: [
        { name: 'list_services', durationMs: listDurationMs },
        { name: 'list_masters_for_services', durationMs: mastersDurationMs },
      ],
    };
  }

  const masterOptions = mastersResult.masters
    .slice(0, 10)
    .map((m) => `[option] 👩‍🎨 ${m.name} [/option]`);
  const text = buildMultipleMastersText(
    session.locale,
    matchedService.title,
    masterOptions,
  );
  appendSessionMessage(sessionId, 'assistant', text);
  upsertSession(sessionId, {
    context: {
      selectedServiceIds: [matchedService.id],
      selectedMasterId: undefined,
      lastSuggestedDateOptions: undefined,
      lastDateISO: undefined,
      lastPreferredTime: undefined,
      lastNoSlots: false,
    },
  });

  console.log(
    `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-multi-master service="${matchedService.title}" masters=${mastersResult.masters.length}`,
  );

  return {
    text,
    sessionId,
    toolCalls: [
      { name: 'list_services', durationMs: listDurationMs },
      { name: 'list_masters_for_services', durationMs: mastersDurationMs },
    ],
  };
}

// ─── Route Handler ──────────────────────────────────────────────

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ChatResponse | { error: string }>> {
  // Kill switch
  if (process.env.AI_ASSISTANT_ENABLED !== 'true') {
    return NextResponse.json(
      { error: 'AI assistant is disabled' },
      { status: 503 },
    );
  }

  const client = getClient();
  if (!client) {
    return NextResponse.json(
      { error: 'AI not configured (missing OPENAI_API_KEY)' },
      { status: 503 },
    );
  }

  // Rate limiting by IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const rateCheck = checkRateLimit(`ip:${ip}`);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Retry in ${Math.ceil(rateCheck.retryAfterMs / 1000)}s` },
      { status: 429 },
    );
  }

  // Parse body
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { sessionId, message, locale } = body;

  if (!sessionId || !message?.trim()) {
    return NextResponse.json(
      { error: 'sessionId and message are required' },
      { status: 400 },
    );
  }

  // Get or create session
  const session = upsertSession(sessionId, {
    locale: (locale as 'de' | 'ru' | 'en') ?? 'de',
  });
  appendSessionMessage(sessionId, 'user', message);
  const selectedMasterId = session.context.selectedMasterId;
  const selectedServiceIds = session.context.selectedServiceIds ?? [];
  const suggestedDateOptions = session.context.lastSuggestedDateOptions ?? [];
  const hasActiveBookingFlow = Boolean(
    selectedMasterId ||
      selectedServiceIds.length > 0 ||
      session.context.reservedSlot ||
      session.context.draftId,
  );

  // Deterministic booking start/restart entrypoint:
  // handles intents like "записаться", "новый термин", "book appointment".
  if (isBookingStartIntent(message, session.locale, hasActiveBookingFlow)) {
    const startedAt = Date.now();
    const catalog = await listServices({ locale: session.locale });
    const durationMs = Date.now() - startedAt;
    const groups = (catalog.groups ?? []) as Array<{ title: string }>;
    const groupTitles = groups.map((g) => g.title).filter(Boolean);
    const text = buildBookingStartText(session.locale, groupTitles);

    appendSessionMessage(sessionId, 'assistant', text);
    upsertSession(sessionId, {
      previousResponseId: null,
      context: {
        selectedServiceIds: undefined,
        selectedMasterId: undefined,
        reservedSlot: undefined,
        draftId: undefined,
        lastDateISO: undefined,
        lastPreferredTime: undefined,
        lastNoSlots: false,
        lastSuggestedDateOptions: undefined,
        awaitingRegistrationMethod: false,
        pendingVerificationMethod: undefined,
        awaitingVerificationMethod: false,
      },
    });

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=booking-start groups=${groupTitles.length}`,
    );

    return NextResponse.json({
      text,
      sessionId,
      toolCalls: [{ name: 'list_services', durationMs }],
    });
  }

  // Deterministic handling for free-form date questions while service/master are already fixed.
  // Example: "есть даты после 10" -> keep current service and ask for exact DD.MM date.
  if (
    selectedMasterId &&
    selectedServiceIds.length > 0 &&
    isDesiredDateQuestion(message, session.locale)
  ) {
    const text =
      session.locale === 'ru'
        ? 'Да, можно выбрать желаемую дату.\nНапишите дату в формате ДД.ММ (например, 10.03), и я сразу покажу свободное время.'
        : session.locale === 'en'
          ? 'Yes, you can choose your preferred date.\nType a date in DD.MM format (for example, 10.03), and I will show free slots right away.'
          : 'Ja, Sie können Ihr Wunschdatum wählen.\nSchreiben Sie das Datum im Format TT.MM (zum Beispiel 10.03), und ich zeige sofort freie Zeiten.';

    appendSessionMessage(sessionId, 'assistant', text);

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=date-guidance`,
    );

    return NextResponse.json({
      text,
      sessionId,
    });
  }

  // Deterministic selection flow first:
  // category click -> concrete services, service click -> masters/date step.
  // Important: run before scope-guard, otherwise service option clicks can be blocked.
  const selectionFastPath = await tryHandleCatalogSelectionFastPath(
    session,
    sessionId,
    message,
  );
  if (selectionFastPath) {
    return NextResponse.json(selectionFastPath);
  }

  // Deterministic registration-method selection after slot reservation.
  if (session.context.awaitingRegistrationMethod && session.context.reservedSlot) {
    const selectedMethod = detectRegistrationMethodChoice(message);
    if (selectedMethod) {
      if (selectedMethod === 'google_oauth') {
        const handoffUrl = buildGoogleHandoffUrl(session);
        const effectiveMethod = handoffUrl ? selectedMethod : 'email_otp';
        const keepMethodStep = Boolean(handoffUrl);
        const text = handoffUrl
          ? buildGoogleHandoffText(session.locale, handoffUrl)
          : buildContactCollectionTextForMethod(session.locale, 'email_otp');

        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            awaitingRegistrationMethod: keepMethodStep,
            pendingVerificationMethod: effectiveMethod,
            awaitingVerificationMethod: false,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=registration-method method=${selectedMethod}`,
        );

        return NextResponse.json({
          text,
          sessionId,
        });
      }

      const text = buildContactCollectionTextForMethod(session.locale, selectedMethod);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          awaitingRegistrationMethod: false,
          pendingVerificationMethod: selectedMethod,
          awaitingVerificationMethod: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=registration-method method=${selectedMethod}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }
  }

  if (shouldApplyScopeGuard(message, session)) {
    const text = buildScopeGuardText(session.locale, hasActiveBookingFlow);
    appendSessionMessage(sessionId, 'assistant', text);

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=scope-guard active=${hasActiveBookingFlow}`,
    );

    return NextResponse.json({
      text,
      sessionId,
    });
  }

  // Deterministic full catalog view to avoid partial/unstable LLM formatting.
  if (isFullCatalogRequest(message, session.locale)) {
    const startedAt = Date.now();
    const catalog = await listServices({ locale: session.locale });
    const durationMs = Date.now() - startedAt;
    const groups = (catalog.groups ?? []) as Array<{
      title: string;
      services: Array<{ title: string; durationMin: number; priceCents: number | null }>;
    }>;
    const text = buildFullCatalogText(session.locale, groups);

    appendSessionMessage(sessionId, 'assistant', text);

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=services-full-list groups=${groups.length} services=${catalog.matchedServices ?? 0}`,
    );

    return NextResponse.json({
      text,
      sessionId,
      toolCalls: [{ name: 'list_services', durationMs }],
    });
  }

  // Deterministic "nearest date" action from clickable option.
  if (
    selectedMasterId &&
    selectedServiceIds.length > 0 &&
    isNearestDateRequest(message)
  ) {
    const startDateISO = session.context.lastDateISO ?? todayISO();
    const startedAt = Date.now();
    const optionsMap = await buildNearestDateOptions({
      masterId: selectedMasterId,
      serviceIds: selectedServiceIds,
      locale: session.locale,
      startDateISO,
      minCount: 6,
    });
    const durationMs = Date.now() - startedAt;
    const text = buildNoSlotsFollowUpText(session.locale, optionsMap);

    appendSessionMessage(sessionId, 'assistant', text);
    upsertSession(sessionId, {
      context: {
        lastDateISO: startDateISO,
        lastNoSlots: optionsMap.length === 0,
        lastSuggestedDateOptions: optionsMap,
      },
    });

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=nearest-date days=${optionsMap.length}`,
    );

    return NextResponse.json({
      text,
      sessionId,
      toolCalls: [{ name: 'search_availability_month', durationMs }],
    });
  }

  // Deterministic "tomorrow" action from clickable option.
  if (
    selectedMasterId &&
    selectedServiceIds.length > 0 &&
    isTomorrowRequest(message)
  ) {
    const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dateISO = tomorrowDate.toISOString().slice(0, 10);
    const startedAt = Date.now();
    const availabilityResult = await searchAvailability({
      masterId: selectedMasterId,
      dateISO,
      serviceIds: selectedServiceIds,
      preferredTime: 'any',
    });
    const durationMs = Date.now() - startedAt;
    const slots = Array.isArray(availabilityResult.slots)
      ? availabilityResult.slots
      : [];

    if (slots.length > 0) {
      const text = buildSlotsForDateText(session.locale, dateISO, slots);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          lastDateISO: dateISO,
          lastPreferredTime: 'any',
          lastNoSlots: false,
          lastSuggestedDateOptions: undefined,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=tomorrow slots=${slots.length}`,
      );

      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [{ name: 'search_availability', durationMs }],
      });
    }

    const monthStartedAt = Date.now();
    const optionsMap = await buildNearestDateOptions({
      masterId: selectedMasterId,
      serviceIds: selectedServiceIds,
      locale: session.locale,
      startDateISO: shiftDateISO(dateISO, 1),
      minCount: 6,
    });
    const monthDurationMs = Date.now() - monthStartedAt;
    const text = buildNoSlotsFollowUpText(session.locale, optionsMap);

    appendSessionMessage(sessionId, 'assistant', text);
    upsertSession(sessionId, {
      context: {
        lastDateISO: dateISO,
        lastPreferredTime: 'any',
        lastNoSlots: optionsMap.length === 0,
        lastSuggestedDateOptions: optionsMap,
      },
    });

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=tomorrow-no-slots days=${optionsMap.length}`,
    );

    return NextResponse.json({
      text,
      sessionId,
      toolCalls: [
        { name: 'search_availability', durationMs },
        { name: 'search_availability_month', durationMs: monthDurationMs },
      ],
    });
  }

  // Deterministic manual date input (e.g. 28.02 / 28-02 / 28/02).
  if (selectedMasterId && selectedServiceIds.length > 0) {
    const explicitDateISO = parseExplicitDateInputToISO(
      message,
      session.context.lastDateISO ?? todayISO(),
    );

    if (explicitDateISO) {
      const startedAt = Date.now();
      const availabilityResult = await searchAvailability({
        masterId: selectedMasterId,
        dateISO: explicitDateISO,
        serviceIds: selectedServiceIds,
        preferredTime: 'any',
      });
      const durationMs = Date.now() - startedAt;
      const slots = Array.isArray(availabilityResult.slots)
        ? availabilityResult.slots
        : [];

      if (slots.length > 0) {
        const text = buildSlotsForDateText(session.locale, explicitDateISO, slots);
        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            lastDateISO: explicitDateISO,
            lastPreferredTime: 'any',
            lastNoSlots: false,
            lastSuggestedDateOptions: undefined,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=manual-date-picked date=${explicitDateISO} slots=${slots.length}`,
        );

        return NextResponse.json({
          text,
          sessionId,
          toolCalls: [{ name: 'search_availability', durationMs }],
        });
      }

      const monthStartedAt = Date.now();
      const optionsMap = await buildNearestDateOptions({
        masterId: selectedMasterId,
        serviceIds: selectedServiceIds,
        locale: session.locale,
        startDateISO: shiftDateISO(explicitDateISO, 1),
        minCount: 6,
      });
      const monthDurationMs = Date.now() - monthStartedAt;
      const dayLabel = formatDateLabel(explicitDateISO, session.locale);
      const noSlotsPrefix =
        session.locale === 'ru'
          ? `На ${dayLabel} свободных слотов нет.`
          : session.locale === 'en'
            ? `There are no free slots on ${dayLabel}.`
            : `Für ${dayLabel} gibt es keine freien Slots.`;
      const followUpText = buildNoSlotsFollowUpText(session.locale, optionsMap);
      const text = `${noSlotsPrefix}\n\n${followUpText}`;

      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          lastDateISO: explicitDateISO,
          lastPreferredTime: 'any',
          lastNoSlots: optionsMap.length === 0,
          lastSuggestedDateOptions: optionsMap,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=manual-date-no-slots date=${explicitDateISO} days=${optionsMap.length}`,
      );

      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [
          { name: 'search_availability', durationMs },
          { name: 'search_availability_month', durationMs: monthDurationMs },
        ],
      });
    }
  }

  // Deterministic follow-up: user picked one of date suggestions.
  // We intentionally search with preferredTime=any to avoid stale time filters.
  if (selectedMasterId && selectedServiceIds.length > 0 && suggestedDateOptions.length > 0) {
    const pickedDate = matchSuggestedDateOption(message, suggestedDateOptions);
    if (pickedDate) {
      const startedAt = Date.now();
      const availabilityResult = await searchAvailability({
        masterId: selectedMasterId,
        dateISO: pickedDate.dateISO,
        serviceIds: selectedServiceIds,
        preferredTime: 'any',
      });
      const durationMs = Date.now() - startedAt;
      const slots = Array.isArray(availabilityResult.slots)
        ? availabilityResult.slots
        : [];

      if (slots.length > 0) {
        const text = buildSlotsForDateText(session.locale, pickedDate.dateISO, slots);
        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            lastDateISO: pickedDate.dateISO,
            lastPreferredTime: 'any',
            lastNoSlots: false,
            lastSuggestedDateOptions: undefined,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=suggested-date-picked date=${pickedDate.dateISO} slots=${slots.length}`,
        );

        return NextResponse.json({
          text,
          sessionId,
          toolCalls: [{ name: 'search_availability', durationMs }],
        });
      }

      const monthStartedAt = Date.now();
      const optionsMap = await buildNearestDateOptions({
        masterId: selectedMasterId,
        serviceIds: selectedServiceIds,
        locale: session.locale,
        startDateISO: shiftDateISO(pickedDate.dateISO, 1),
        minCount: 6,
      });
      const monthDurationMs = Date.now() - monthStartedAt;
      const text = buildNoSlotsFollowUpText(session.locale, optionsMap);

      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          lastDateISO: pickedDate.dateISO,
          lastPreferredTime: 'any',
          lastNoSlots: optionsMap.length === 0,
          lastSuggestedDateOptions: optionsMap,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=suggested-date-no-slots date=${pickedDate.dateISO} days=${optionsMap.length}`,
      );

      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [
          { name: 'search_availability', durationMs },
          { name: 'search_availability_month', durationMs: monthDurationMs },
        ],
      });
    }
  }

  // Deterministic follow-up: user confirms after "no slots" -> check month availability
  if (
    session.context.lastNoSlots &&
    isAffirmativeFollowUp(message) &&
    selectedMasterId &&
    selectedServiceIds.length > 0
  ) {
    const sameDateISO = session.context.lastDateISO;
    if (sameDateISO) {
      const sameDayStartedAt = Date.now();
      const sameDayResult = await searchAvailability({
        masterId: selectedMasterId,
        dateISO: sameDateISO,
        serviceIds: selectedServiceIds,
        preferredTime: 'any',
      });
      const sameDayDurationMs = Date.now() - sameDayStartedAt;

      if ((sameDayResult.slots?.length ?? 0) > 0) {
        const text = buildSlotsForDateText(
          session.locale,
          sameDateISO,
          sameDayResult.slots ?? [],
        );

        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            lastDateISO: sameDateISO,
            lastPreferredTime: 'any',
            lastNoSlots: false,
            lastSuggestedDateOptions: undefined,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=no-slots-same-day-recheck date=${sameDateISO} slots=${sameDayResult.slots?.length ?? 0}`,
        );

        return NextResponse.json({
          text,
          sessionId,
          toolCalls: [{ name: 'search_availability', durationMs: sameDayDurationMs }],
        });
      }
    }

    const startedAt = Date.now();
    const optionsMap = await buildNearestDateOptions({
      masterId: selectedMasterId,
      serviceIds: selectedServiceIds,
      locale: session.locale,
      startDateISO: shiftDateISO(session.context.lastDateISO ?? todayISO(), 1),
      minCount: 6,
    });
    const durationMs = Date.now() - startedAt;
    const text = buildNoSlotsFollowUpText(session.locale, optionsMap);

    appendSessionMessage(sessionId, 'assistant', text);
    upsertSession(sessionId, {
      context: {
        lastNoSlots: optionsMap.length === 0,
        lastSuggestedDateOptions: optionsMap,
      },
    });

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=no-slots-follow-up days=${optionsMap.length}`,
    );

    return NextResponse.json({
      text,
      sessionId,
      toolCalls: [{ name: 'search_availability_month', durationMs }],
    });
  }

  // ─── Deterministic: user picks verification method ────────
  if (session.context.awaitingVerificationMethod && session.context.draftId) {
    const chosenMethod = detectVerificationMethodChoice(message);
    if (chosenMethod) {
      // Look up the draft to get contact info
      const draft = await prisma.bookingDraft.findUnique({
        where: { id: session.context.draftId },
        select: { email: true, phone: true },
      });

      if (draft) {
        const contact = getContactForMethod(chosenMethod, draft.email, draft.phone);

        if (!contact) {
          const noContactText =
            session.locale === 'ru'
              ? 'Для этого метода нет контактных данных. Пожалуйста, выберите другой способ.'
              : session.locale === 'en'
                ? 'No contact info available for this method. Please choose another way.'
                : 'Keine Kontaktdaten für diese Methode vorhanden. Bitte wählen Sie eine andere.';
          appendSessionMessage(sessionId, 'assistant', noContactText);
          return NextResponse.json({ text: noContactText, sessionId });
        }

        const startedAt = Date.now();
        const verifyRes = await startVerification({
          method: chosenMethod,
          draftId: session.context.draftId,
          contact,
        });
        const durationMs = Date.now() - startedAt;

        const text = buildVerificationAutoText(session.locale, {
          ok: Boolean(verifyRes?.ok),
          contactMasked:
            typeof verifyRes === 'object' && verifyRes && 'contactMasked' in verifyRes
              ? (verifyRes.contactMasked as string | undefined)
              : undefined,
          error:
            typeof verifyRes === 'object' && verifyRes && 'error' in verifyRes
              ? String(verifyRes.error ?? '')
              : undefined,
        });

        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            awaitingVerificationMethod: false,
            pendingVerificationMethod: verifyRes?.ok ? undefined : chosenMethod,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=verification-method-chosen method=${chosenMethod} ok=${Boolean(verifyRes?.ok)}`,
        );

        return NextResponse.json({
          text,
          sessionId,
          toolCalls: [{ name: 'start_verification', durationMs }],
        });
      }
    }
  }

  // Build messages
  const systemPrompt = buildSystemPrompt(session.locale);
  const stateHints: string[] = [];
  if (session.context.selectedServiceIds && session.context.selectedServiceIds.length > 0) {
    stateHints.push(`selectedServiceIds=${session.context.selectedServiceIds.join(',')}`);
  }
  if (session.context.selectedMasterId) {
    stateHints.push(`selectedMasterId=${session.context.selectedMasterId}`);
  }
  if (session.context.lastDateISO) {
    stateHints.push(`lastDateISO=${session.context.lastDateISO}`);
  }
  if (session.context.lastPreferredTime) {
    stateHints.push(`lastPreferredTime=${session.context.lastPreferredTime}`);
  }
  if (session.context.lastNoSlots !== undefined) {
    stateHints.push(`lastNoSlots=${String(session.context.lastNoSlots)}`);
  }
  if (session.context.awaitingRegistrationMethod) {
    stateHints.push('awaitingRegistrationMethod=true');
  }
  if (session.context.pendingVerificationMethod) {
    stateHints.push(`pendingVerificationMethod=${session.context.pendingVerificationMethod}`);
  }
  if (session.context.awaitingVerificationMethod) {
    stateHints.push('awaitingVerificationMethod=true');
  }

  const statePrompt =
    stateHints.length > 0
      ? `SESSION STATE (do not reset booking flow): ${stateHints.join(' | ')}`
      : null;

  const historyMessages: OpenAI.Chat.ChatCompletionMessageParam[] = (
    session.context.chatHistory ?? []
  )
    .slice(-16)
    .filter((m) => m.content?.trim())
    .map((m) => ({
      role: m.role,
      content: m.content,
    }) as OpenAI.Chat.ChatCompletionMessageParam);

  // Build conversation history from session
  // Keep recent dialogue context to avoid flow resets between turns.
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...(statePrompt ? [{ role: 'system', content: statePrompt } as const] : []),
    ...historyMessages,
    { role: 'user', content: message },
  ];

  // Tool definitions for OpenAI
  const tools: OpenAI.Chat.ChatCompletionTool[] = TOOLS.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));

  try {
    const toolCallLog: { name: string; durationMs: number }[] = [];
    const missingServiceSignals: MissingServiceSignal[] = [];

    // Tool-calling loop
    let response = await client.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: 'auto',
      temperature: TEMPERATURE,
      max_tokens: 1024,
    });

    let iterations = 0;

    while (iterations < MAX_TOOL_ITERATIONS) {
      const choice = response.choices[0];
      if (!choice) break;

      // If the model wants to call tools
      if (
        choice.finish_reason === 'tool_calls' &&
        choice.message.tool_calls &&
        choice.message.tool_calls.length > 0
      ) {
        // Add assistant message with tool calls to history
        messages.push(choice.message);

        // Execute all tool calls in parallel
        // Note: OpenAI SDK has union types for tool calls, we need explicit narrowing
        const toolCalls: ToolCallRequest[] = [];
        const parsedArgsByCallId = new Map<string, Record<string, unknown>>();
        for (const tc of choice.message.tool_calls) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fn = (tc as any).function as
            | { name: string; arguments: string }
            | undefined;
          if (fn) {
            let effectiveArgsJson = fn.arguments;
            let parsedArgs: Record<string, unknown> | null = null;
            try {
              parsedArgs = JSON.parse(fn.arguments) as Record<string, unknown>;

              // Always bind reserve_slot to the current chat session.
              if (fn.name === 'reserve_slot') {
                parsedArgs.sessionId = sessionId;
                effectiveArgsJson = JSON.stringify(parsedArgs);
              }

              // Keep complete_booking bound to the latest session draft to avoid stale draftId usage.
              if (
                fn.name === 'complete_booking' &&
                typeof session.context.draftId === 'string' &&
                session.context.draftId
              ) {
                const incomingDraftId =
                  typeof parsedArgs.draftId === 'string' ? parsedArgs.draftId : undefined;
                if (incomingDraftId !== session.context.draftId) {
                  parsedArgs.draftId = session.context.draftId;
                  effectiveArgsJson = JSON.stringify(parsedArgs);
                }
              }

              parsedArgsByCallId.set(tc.id, parsedArgs);
            } catch {
              // Ignore malformed args, tool executor will handle errors
            }

            toolCalls.push({
              id: tc.id,
              name: fn.name,
              arguments: effectiveArgsJson,
            });
          }
        }

        const isContactPayloadMessage = looksLikeContactPayload(message);

        // When the user sends contact details, keep create_draft aligned with
        // the already reserved slot for this session.
        let reserveArgsInBatch:
          | { masterId: string; startAt: string; endAt: string }
          | null = null;
        for (const call of toolCalls) {
          if (call.name !== 'reserve_slot') continue;
          const parsed = parsedArgsByCallId.get(call.id);
          if (
            parsed &&
            typeof parsed.masterId === 'string' &&
            typeof parsed.startAt === 'string' &&
            typeof parsed.endAt === 'string'
          ) {
            reserveArgsInBatch = {
              masterId: parsed.masterId,
              startAt: parsed.startAt,
              endAt: parsed.endAt,
            };
            break;
          }
        }

        const reserveArgsFromSession =
          session.context.reservedSlot &&
          typeof session.context.selectedMasterId === 'string' &&
          session.context.selectedMasterId
            ? {
                masterId: session.context.selectedMasterId,
                startAt: session.context.reservedSlot.startAt,
                endAt: session.context.reservedSlot.endAt,
              }
            : null;

        // If contacts are being provided, force reserve_slot to use the
        // slot that is currently reserved in session context.
        if (isContactPayloadMessage && reserveArgsFromSession) {
          for (const call of toolCalls) {
            if (call.name !== 'reserve_slot') continue;
            const parsed = parsedArgsByCallId.get(call.id);
            if (!parsed) continue;

            parsed.masterId = reserveArgsFromSession.masterId;
            parsed.startAt = reserveArgsFromSession.startAt;
            parsed.endAt = reserveArgsFromSession.endAt;
            parsed.sessionId = sessionId;
            call.arguments = JSON.stringify(parsed);
          }
        }

        const createDraftArgsSource =
          isContactPayloadMessage
            ? (reserveArgsFromSession ?? reserveArgsInBatch)
            : reserveArgsInBatch;

        if (createDraftArgsSource) {
          for (const call of toolCalls) {
            if (call.name !== 'create_draft') continue;
            const parsed = parsedArgsByCallId.get(call.id);
            if (!parsed) continue;

            let changed = false;
            if (parsed.masterId !== createDraftArgsSource.masterId) {
              parsed.masterId = createDraftArgsSource.masterId;
              changed = true;
            }
            if (parsed.startAt !== createDraftArgsSource.startAt) {
              parsed.startAt = createDraftArgsSource.startAt;
              changed = true;
            }
            if (parsed.endAt !== createDraftArgsSource.endAt) {
              parsed.endAt = createDraftArgsSource.endAt;
              changed = true;
            }

            if (changed) {
              call.arguments = JSON.stringify(parsed);
            }
          }
        }

        const results = await Promise.all(toolCalls.map(executeTool));
        const contextPatch: Partial<AiSession['context']> = {};
        let reservedSlotJustCreated = false;
        let bookingCompletedInBatch = false;
        let autoVerificationCandidate:
          | { draftId: string; email: string }
          | null = null;
        const hasExplicitStartVerification = results.some(
          (r) => r.name === 'start_verification',
        );
        const explicitStartVerificationCalls: Array<{
          draftId?: string;
          contact?: string;
          ok: boolean;
        }> = [];
        let slotTakenInBatch = false;
        let slotTakenDateISO: string | undefined;
        let slotTakenMasterId: string | undefined;

        // Add tool results to messages
        for (const result of results) {
          const parsedArgs = parsedArgsByCallId.get(result.id);

          if (result.name === 'list_services') {
            try {
              const payload = JSON.parse(result.result) as {
                noMatches?: boolean;
                query?: string | null;
                suggestedAlternatives?: Array<{
                  title: string;
                  groupTitle?: string | null;
                  durationMin?: number | null;
                  priceCents?: number | null;
                }>;
              };

              if (payload.noMatches && typeof payload.query === 'string' && payload.query.trim()) {
                missingServiceSignals.push({
                  query: payload.query.trim(),
                  suggestedAlternatives: payload.suggestedAlternatives ?? [],
                });
              }
            } catch {
              // Ignore malformed tool payload
            }
          }

          if (result.name === 'list_masters_for_services') {
            try {
              const payload = JSON.parse(result.result) as {
                matchedServiceIds?: string[];
                defaultMasterId?: string | null;
                masters?: Array<{ id: string }>;
                requiresSpecificService?: boolean;
              };

              const argServiceIds = Array.isArray(parsedArgs?.serviceIds)
                ? parsedArgs.serviceIds.filter((s): s is string => typeof s === 'string')
                : [];

              if (argServiceIds.length > 0) {
                contextPatch.selectedServiceIds = argServiceIds;
              }

              if (Array.isArray(payload.matchedServiceIds)) {
                contextPatch.selectedServiceIds = payload.matchedServiceIds;
              }

              if (
                payload.defaultMasterId &&
                Array.isArray(payload.masters) &&
                payload.masters.length === 1
              ) {
                contextPatch.selectedMasterId = payload.defaultMasterId;
              }

              if (payload.requiresSpecificService) {
                contextPatch.selectedMasterId = undefined;
                contextPatch.lastNoSlots = false;
                contextPatch.lastSuggestedDateOptions = undefined;
              }
            } catch {
              // Ignore malformed payload
            }
          }

          if (result.name === 'search_availability') {
            try {
              const payload = JSON.parse(result.result) as {
                count?: number;
              };

              if (typeof parsedArgs?.masterId === 'string') {
                contextPatch.selectedMasterId = parsedArgs.masterId;
              }
              if (Array.isArray(parsedArgs?.serviceIds)) {
                contextPatch.selectedServiceIds = parsedArgs.serviceIds.filter(
                  (s): s is string => typeof s === 'string',
                );
              }
              if (typeof parsedArgs?.dateISO === 'string') {
                contextPatch.lastDateISO = parsedArgs.dateISO;
                contextPatch.lastSuggestedDateOptions = undefined;
              }
              if (
                parsedArgs?.preferredTime === 'morning' ||
                parsedArgs?.preferredTime === 'afternoon' ||
                parsedArgs?.preferredTime === 'evening' ||
                parsedArgs?.preferredTime === 'any'
              ) {
                contextPatch.lastPreferredTime = parsedArgs.preferredTime;
              }

              if (typeof payload.count === 'number') {
                contextPatch.lastNoSlots = payload.count === 0;
                if (payload.count > 0) {
                  contextPatch.lastSuggestedDateOptions = undefined;
                }
              }
            } catch {
              // Ignore malformed payload
            }
          }

          if (result.name === 'reserve_slot') {
            try {
              const payload = JSON.parse(result.result) as {
                success?: boolean;
                error?: string;
              };

              if (typeof parsedArgs?.masterId === 'string') {
                contextPatch.selectedMasterId = parsedArgs.masterId;
              }

              if (
                payload.success &&
                typeof parsedArgs?.startAt === 'string' &&
                typeof parsedArgs?.endAt === 'string'
              ) {
                contextPatch.reservedSlot = {
                  startAt: parsedArgs.startAt,
                  endAt: parsedArgs.endAt,
                };
                contextPatch.lastNoSlots = false;
                reservedSlotJustCreated = true;
              }

              if (
                payload.error === 'SLOT_TAKEN' &&
                typeof parsedArgs?.startAt === 'string' &&
                typeof parsedArgs?.endAt === 'string'
              ) {
                slotTakenInBatch = true;
                slotTakenDateISO = parsedArgs.startAt.slice(0, 10);
                slotTakenMasterId =
                  typeof parsedArgs.masterId === 'string'
                    ? parsedArgs.masterId
                    : slotTakenMasterId;
                const sameAsCurrentReservation =
                  session.context.reservedSlot?.startAt === parsedArgs.startAt &&
                  session.context.reservedSlot?.endAt === parsedArgs.endAt;

                if (!sameAsCurrentReservation) {
                  contextPatch.reservedSlot = undefined;
                }
                contextPatch.draftId = undefined;
                contextPatch.awaitingVerificationMethod = false;
                contextPatch.awaitingRegistrationMethod = false;
                contextPatch.pendingVerificationMethod = undefined;
              }
            } catch {
              // Ignore malformed payload
            }
          }

          if (result.name === 'search_availability_month') {
            try {
              const payload = JSON.parse(result.result) as {
                days?: Record<string, number>;
              };

              if (typeof parsedArgs?.masterId === 'string') {
                contextPatch.selectedMasterId = parsedArgs.masterId;
              }
              if (Array.isArray(parsedArgs?.serviceIds)) {
                contextPatch.selectedServiceIds = parsedArgs.serviceIds.filter(
                  (s): s is string => typeof s === 'string',
                );
              }

              const optionsMap = mapMonthDaysToOptions(payload.days, session.locale);
              contextPatch.lastNoSlots = optionsMap.length === 0;
              contextPatch.lastSuggestedDateOptions = optionsMap;
            } catch {
              // Ignore malformed payload
            }
          }

          if (result.name === 'start_verification') {
            try {
              const payload = JSON.parse(result.result) as {
                ok?: boolean;
              };

              const draftIdArg =
                typeof parsedArgs?.draftId === 'string' ? parsedArgs.draftId : undefined;
              const contactArg =
                typeof parsedArgs?.contact === 'string' ? parsedArgs.contact : undefined;

              explicitStartVerificationCalls.push({
                draftId: draftIdArg,
                contact: contactArg,
                ok: Boolean(payload.ok),
              });

              if (payload.ok && draftIdArg && !contextPatch.draftId) {
                contextPatch.draftId = draftIdArg;
              }
            } catch {
              explicitStartVerificationCalls.push({ ok: false });
            }
          }

          if (result.name === 'create_draft') {
            try {
              const payload = JSON.parse(result.result) as {
                draftId?: string;
                error?: string;
              };

              if (slotTakenInBatch) {
                if (payload.draftId && !payload.error) {
                  await prisma.bookingDraft
                    .delete({ where: { id: payload.draftId } })
                    .catch(() => {
                      /* ignore cleanup errors */
                    });
                }
                continue;
              }

              const email =
                typeof parsedArgs?.email === 'string' ? parsedArgs.email : null;

              if (payload.draftId && !payload.error) {
                contextPatch.draftId = payload.draftId;
                contextPatch.awaitingRegistrationMethod = false;
                if (
                  typeof parsedArgs?.startAt === 'string' &&
                  typeof parsedArgs?.endAt === 'string'
                ) {
                  contextPatch.reservedSlot = {
                    startAt: parsedArgs.startAt,
                    endAt: parsedArgs.endAt,
                  };
                }
                if (email) {
                  autoVerificationCandidate = { draftId: payload.draftId, email };
                }
              }
            } catch {
              // Ignore malformed payload
            }
          }

          if (result.name === 'complete_booking') {
            try {
              const payload = JSON.parse(result.result) as {
                ok?: boolean;
                error?: string;
              };

              if (payload.ok) {
                bookingCompletedInBatch = true;
                contextPatch.selectedServiceIds = undefined;
                contextPatch.selectedMasterId = undefined;
                contextPatch.draftId = undefined;
                contextPatch.reservedSlot = undefined;
                contextPatch.lastDateISO = undefined;
                contextPatch.lastPreferredTime = undefined;
                contextPatch.lastSuggestedDateOptions = undefined;
                contextPatch.lastNoSlots = false;
                contextPatch.awaitingVerificationMethod = false;
                contextPatch.awaitingRegistrationMethod = false;
                contextPatch.pendingVerificationMethod = undefined;
              }

              if (payload.error === 'SLOT_TAKEN') {
                slotTakenInBatch = true;
                slotTakenMasterId = session.context.selectedMasterId ?? slotTakenMasterId;
                slotTakenDateISO =
                  session.context.reservedSlot?.startAt?.slice(0, 10) ??
                  session.context.lastDateISO ??
                  slotTakenDateISO;

                const staleDraftId =
                  typeof parsedArgs?.draftId === 'string' ? parsedArgs.draftId : undefined;
                if (staleDraftId) {
                  await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
                    /* ignore cleanup errors */
                  });
                }

                contextPatch.draftId = undefined;
                contextPatch.reservedSlot = undefined;
                contextPatch.awaitingVerificationMethod = false;
                contextPatch.awaitingRegistrationMethod = false;
                contextPatch.pendingVerificationMethod = undefined;
              }
            } catch {
              // Ignore malformed payload
            }
          }

          messages.push({
            role: 'tool',
            tool_call_id: result.id,
            content: result.result,
          });
          toolCallLog.push({ name: result.name, durationMs: result.durationMs });
        }

        if (Object.keys(contextPatch).length > 0) {
          upsertSession(sessionId, {
            previousResponseId: bookingCompletedInBatch ? null : undefined,
            context: contextPatch,
          });
        }

        if (slotTakenInBatch) {
          const staleDraftId =
            typeof contextPatch.draftId === 'string'
              ? contextPatch.draftId
              : typeof session.context.draftId === 'string'
                ? session.context.draftId
                : undefined;
          if (staleDraftId) {
            await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
              /* ignore cleanup errors */
            });
          }

          const masterIdForRecovery =
            slotTakenMasterId ??
            contextPatch.selectedMasterId ??
            session.context.selectedMasterId;
          const dateISOForRecovery =
            slotTakenDateISO ??
            session.context.lastDateISO ??
            todayISO();
          const serviceIdsForRecovery =
            contextPatch.selectedServiceIds ??
            session.context.selectedServiceIds ??
            [];

          let text: string;
          if (masterIdForRecovery && serviceIdsForRecovery.length > 0) {
            const availability = await searchAvailability({
              masterId: masterIdForRecovery,
              dateISO: dateISOForRecovery,
              serviceIds: serviceIdsForRecovery,
              preferredTime: 'any',
            });

            text = buildSlotTakenAlternativesText(
              session.locale,
              dateISOForRecovery,
              availability.slots ?? [],
            );
          } else {
            text = buildSlotTakenAlternativesText(
              session.locale,
              dateISOForRecovery,
              [],
            );
          }

          appendSessionMessage(sessionId, 'assistant', text);
          upsertSession(sessionId, {
            context: {
              draftId: undefined,
              reservedSlot: undefined,
              awaitingVerificationMethod: false,
              awaitingRegistrationMethod: false,
              pendingVerificationMethod: undefined,
            },
          });

          console.log(
            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=slot-taken-recovery date=${dateISOForRecovery}`,
          );

          return NextResponse.json({
            text,
            sessionId,
            toolCalls: toolCallLog,
          });
        }

        const hasDraftAfterTools = Object.prototype.hasOwnProperty.call(contextPatch, 'draftId')
          ? Boolean(contextPatch.draftId)
          : Boolean(session.context.draftId);
        const pendingMethodAfterTools = Object.prototype.hasOwnProperty.call(
          contextPatch,
          'pendingVerificationMethod',
        )
          ? contextPatch.pendingVerificationMethod
          : session.context.pendingVerificationMethod;

        // After successful slot reserve, show registration method chooser only
        // when method is not selected yet.
        if (reservedSlotJustCreated && !hasDraftAfterTools && !pendingMethodAfterTools) {
          const text = buildRegistrationMethodChoiceText(session.locale);
          appendSessionMessage(sessionId, 'assistant', text);
          upsertSession(sessionId, {
            context: {
              awaitingRegistrationMethod: true,
              pendingVerificationMethod: undefined,
              awaitingVerificationMethod: false,
            },
          });

          console.log(
            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=registration-method-choice-after-reserve`,
          );

          return NextResponse.json({
            text,
            sessionId,
            toolCalls: toolCallLog,
          });
        }

        const matchedExplicitStart = autoVerificationCandidate
          ? explicitStartVerificationCalls.some(
              (call) => call.ok && call.draftId === autoVerificationCandidate?.draftId,
            )
          : false;

        if (autoVerificationCandidate && (!hasExplicitStartVerification || !matchedExplicitStart)) {
          const draftForChoice = await prisma.bookingDraft.findUnique({
            where: { id: autoVerificationCandidate.draftId },
            select: { email: true, phone: true },
          });

          const selectedMethod = session.context.pendingVerificationMethod;

          if (
            selectedMethod &&
            selectedMethod !== 'google_oauth' &&
            (selectedMethod === 'email_otp' ||
              selectedMethod === 'sms_otp' ||
              selectedMethod === 'telegram_otp')
          ) {
            const contact = getContactForMethod(
              selectedMethod,
              draftForChoice?.email,
              draftForChoice?.phone,
            );

            if (!contact) {
              const text = buildMissingContactForMethodText(session.locale, selectedMethod);
              appendSessionMessage(sessionId, 'assistant', text);

              return NextResponse.json({
                text,
                sessionId,
                toolCalls: toolCallLog,
              });
            }

            const startedAt = Date.now();
            const verifyRes = await startVerification({
              method: selectedMethod,
              draftId: autoVerificationCandidate.draftId,
              contact,
            });
            const durationMs = Date.now() - startedAt;

            const text = buildVerificationAutoText(session.locale, {
              ok: Boolean(verifyRes?.ok),
              contactMasked:
                typeof verifyRes === 'object' && verifyRes && 'contactMasked' in verifyRes
                  ? (verifyRes.contactMasked as string | undefined)
                  : undefined,
              error:
                typeof verifyRes === 'object' && verifyRes && 'error' in verifyRes
                  ? String(verifyRes.error ?? '')
                  : undefined,
            });

            appendSessionMessage(sessionId, 'assistant', text);
            upsertSession(sessionId, {
              context: {
                awaitingVerificationMethod: false,
                pendingVerificationMethod: verifyRes?.ok ? undefined : selectedMethod,
              },
            });

            console.log(
              `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=verification-start-selected method=${selectedMethod} ok=${Boolean(verifyRes?.ok)}`,
            );

            return NextResponse.json({
              text,
              sessionId,
              toolCalls: [...toolCallLog, { name: 'start_verification', durationMs }],
            });
          }

          // Fallback: method not selected yet -> present choice after draft creation.
          const text = buildVerificationMethodChoiceText(session.locale, {
            hasEmail: Boolean(draftForChoice?.email),
            hasPhone: Boolean(draftForChoice?.phone),
          });

          appendSessionMessage(sessionId, 'assistant', text);
          upsertSession(sessionId, {
            context: {
              awaitingVerificationMethod: true,
            },
          });

          console.log(
            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=verification-method-choice email=${Boolean(draftForChoice?.email)} phone=${Boolean(draftForChoice?.phone)}`,
          );

          return NextResponse.json({
            text,
            sessionId,
            toolCalls: toolCallLog,
          });
        }

        // Call model again with tool results
        response = await client.chat.completions.create({
          model: MODEL,
          messages,
          tools,
          tool_choice: 'auto',
          temperature: TEMPERATURE,
          max_tokens: 1024,
        });

        iterations++;
        continue;
      }

      // Model returned a text response — we're done
      break;
    }

    // Extract final text
    let finalMessage = response.choices[0]?.message;
    let text =
      typeof finalMessage?.content === 'string'
        ? finalMessage.content.trim()
        : '';

    // If model ended without text (e.g. too many tool iterations), force a final textual reply.
    if (!text) {
      try {
        const forced = await client.chat.completions.create({
          model: MODEL,
          messages,
          tools,
          tool_choice: 'none',
          temperature: TEMPERATURE,
          max_tokens: 512,
        });
        finalMessage = forced.choices[0]?.message;
        text =
          typeof finalMessage?.content === 'string'
            ? finalMessage.content.trim()
            : '';
      } catch (forceError) {
        console.warn('[AI Chat] Forced final response failed:', forceError);
      }
    }

    if (!text) {
      text = fallbackTextByLocale(session.locale);
    }

    appendSessionMessage(sessionId, 'assistant', text);

    if (missingServiceSignals.length > 0) {
      const currentSession = getSession(sessionId);
      const reported = new Set(currentSession?.context.reportedMissingQueries ?? []);

      const uniqueSignals = missingServiceSignals.filter((signal) => {
        const key = signal.query.trim().toLowerCase();
        if (!key || reported.has(key)) return false;
        reported.add(key);
        return true;
      });

      for (const signal of uniqueSignals) {
        const latest = getSession(sessionId);
        await reportMissingServiceInquiry({
          sessionId,
          locale: session.locale,
          query: signal.query,
          transcript: latest?.context.chatHistory ?? [],
          alternatives: signal.suggestedAlternatives,
        });
      }

      upsertSession(sessionId, {
        context: {
          reportedMissingQueries: Array.from(reported),
        },
      });
    }

    // Update session
    upsertSession(sessionId, {});

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... history=${historyMessages.length} tools=${toolCallLog.length} iterations=${iterations}`,
    );

    return NextResponse.json({
      text,
      sessionId,
      toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
    });
  } catch (error) {
    console.error('[AI Chat] OpenAI error:', error);

    const errorMsg =
      error instanceof OpenAI.APIError
        ? `OpenAI API error: ${error.status}`
        : 'Internal AI error';

    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
