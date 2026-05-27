// src/app/api/ai/chat/route.ts
// AI assistant endpoint using OpenAI Chat Completions with function calling.

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildSystemPrompt } from '@/lib/ai/system-prompt';
import { TOOLS } from '@/lib/ai/tools-schema';
import { executeTool, type ToolCallRequest } from '@/lib/ai/tool-executor';
import {
  createSSEWriter,
  SSE_HEADERS,
} from '@/lib/ai/sse-stream';
import { streamingGptCall, toolCallsToMessage } from '@/lib/ai/streaming-gpt';
import {
  type AiSession,
  getSession,
  upsertSession,
  checkRateLimit,
  appendSessionMessage,
} from '@/lib/ai/session-store';
import {
  initSessionAnalytics,
  trackRequestMetrics,
  detectFunnelStage,
  type RequestMetrics,
} from '@/lib/ai/ai-analytics';
import { TurnBuilder } from '@/lib/ai/turn-tracker';
import {
  withRetry,
  createLoopTimeout,
  classifyError,
  buildErrorText,
  buildToolFallbackText,
} from '@/lib/ai/resilience';
import { reportMissingServiceInquiry } from '@/lib/ai/missing-service-report';
import { searchAvailabilityMonth } from '@/lib/ai/tools/search-month';
import { searchAvailability } from '@/lib/ai/tools/search-availability';
import { listServices } from '@/lib/ai/tools/list-services';
import { listMastersForServices } from '@/lib/ai/tools/list-masters';
import { reserveSlot } from '@/lib/ai/tools/reserve-slot';
import { startVerification } from '@/lib/ai/tools/start-verification';
import {
  buildRegistrationMethodChoiceText,
  detectRegistrationMethodChoice,
  buildVerificationMethodChoiceText,
  detectVerificationMethodChoice,
  getContactForMethod,
} from '@/lib/ai/verification-choice';
import {
  buildKnowledgeBrowsLashesDetailsText,
  buildKnowledgeBrowsLashesComparisonText,
  buildKnowledgeBrowsLashesStyleText,
  buildKnowledgeConsultationStartText,
  buildKnowledgePmuHealingText,
  buildKnowledgePmuLipsChoiceText,
  buildKnowledgeHydrafacialGoalText,
  buildKnowledgeHydrafacialDetailsText,
  buildKnowledgeHydrafacialComparisonText,
  buildKnowledgeOccasionText,
  buildKnowledgeConsultationStyleText,
  buildKnowledgePmuContraindicationsText,
  buildKnowledgePmuTechniqueDetailsText,
  buildKnowledgePmuTechniqueContraindicationsText,
  buildKnowledgePmuTechniqueSafetyText,
  buildKnowledgePmuFaqText,
  buildKnowledgePmuPreparationText,
  buildKnowledgeSystemMessage,
  detectKnowledgeOccasion,
  detectKnowledgeConsultationStyle,
  detectKnowledgeConsultationTopic,
  detectKnowledgeHydrafacialGoal,
  detectKnowledgePmuTechnique,
  buildKnowledgePmuTechniqueText,
  buildKnowledgeLocationHoursText,
  getKnowledgeMenuOptions,
  isKnowledgeBrowsLashesDetailsIntent,
  isKnowledgeBrowsLashesComparisonIntent,
  isKnowledgeDetailsIntent,
  isKnowledgeHydrafacialDetailsIntent,
  isKnowledgeHydrafacialComparisonIntent,
  isKnowledgeLocationHoursIntent,
  isKnowledgePmuContraindicationsIntent,
  isKnowledgePmuHealingIntent,
  isKnowledgePmuFaqIntent,
  isKnowledgePmuPreparationIntent,
  isKnowledgePmuLipsChoiceIntent,
  isConsultationIntentByKnowledge,
} from '@/lib/ai/knowledge';
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
  inputMode?: 'text' | 'voice' | 'otp';
  stream?: boolean;
  forceGpt?: boolean;
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

function looksLikeMonthNameDateInput(text: string): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;

  if (
    /(?:^|[^\p{L}\p{N}])\d{1,2}\s+(январ[ья]?|феврал[ья]?|март[а]?|апрел[ья]?|ма[йя]|июн[ья]?|июл[ья]?|август[а]?|сентябр[ья]?|октябр[ья]?|ноябр[ья]?|декабр[ья]?)(?:$|[^\p{L}\p{N}])/u.test(
      value,
    )
  ) {
    return true;
  }

  if (
    /(?:^|[^\p{L}\p{N}])\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:$|[^\p{L}\p{N}])/u.test(
      value,
    )
  ) {
    return true;
  }

  if (
    /(?:^|[^\p{L}\p{N}])\d{1,2}\s+(januar|februar|maerz|märz|april|mai|juni|juli|august|september|oktober|november|dezember)(?:$|[^\p{L}\p{N}])/u.test(
      value,
    )
  ) {
    return true;
  }

  return false;
}

function detectPreferredTimeInput(
  text: string,
): 'morning' | 'afternoon' | 'evening' | 'any' | null {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return null;

  const hasNegation = /\b(не|not|kein|keine|nicht)\b/u.test(value);
  const hasMorning =
    /\b(утро|утром|утра|morning|vormittag)\b/u.test(value) ||
    value.includes('am vormittag');
  const hasAfternoon =
    /\b(день|днем|днём|дня|afternoon|nachmittag)\b/u.test(value) ||
    value.includes('am nachmittag') ||
    value.includes('после обеда');
  const hasEvening =
    /\b(вечер|вечером|вечера|evening|abend)\b/u.test(value) ||
    value.includes('am abend');

  if (
    /\b(любое время|в любое время|любой|any time|anytime|egal|any)\b/u.test(value)
  ) {
    return 'any';
  }

  if (hasMorning && hasNegation && !hasAfternoon && !hasEvening) {
    // "не подходит утро" -> default to daytime slots.
    return 'afternoon';
  }

  if (hasMorning) return 'morning';
  if (hasAfternoon) return 'afternoon';
  if (hasEvening) return 'evening';

  return null;
}

function extractPreferredStartTimeInput(text: string): string | null {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return null;

  const hhmm = value.match(/\b([01]?\d|2[0-3])\s*[:.]\s*([0-5]\d)\b/u);
  if (hhmm) {
    const hh = hhmm[1].padStart(2, '0');
    const mm = hhmm[2];
    return `${hh}:${mm}`;
  }

  const hhSpaced = value.match(/\b([01]?\d|2[0-3])\s+([0-5]\d)\b/u);
  if (hhSpaced) {
    const hh = hhSpaced[1].padStart(2, '0');
    const mm = hhSpaced[2];
    return `${hh}:${mm}`;
  }

  for (const [phrase, hour] of RU_SPOKEN_HOUR_MAP) {
    if (
      value.includes(`${phrase} ноль ноль`) ||
      value.includes(`${phrase} 00`) ||
      value.includes(`${phrase} ровно`)
    ) {
      return `${String(hour).padStart(2, '0')}:00`;
    }
  }

  return null;
}

const TIME_PREFERENCE_INPUTS = new Set<string>([
  'утро',
  'утром',
  'утра',
  'день',
  'днем',
  'днём',
  'дня',
  'после обеда',
  'вечер',
  'вечером',
  'вечера',
  'morning',
  'afternoon',
  'evening',
  'vormittag',
  'am vormittag',
  'nachmittag',
  'am nachmittag',
  'abend',
  'am abend',
  'any',
  'любое время',
  'в любое время',
]);

const RU_MONTH_NUMBER_MAP: Record<string, number> = {
  январ: 1,
  январь: 1,
  января: 1,
  феврал: 2,
  февраль: 2,
  февраля: 2,
  март: 3,
  марта: 3,
  апрел: 4,
  апрель: 4,
  апреля: 4,
  май: 5,
  мая: 5,
  июн: 6,
  июнь: 6,
  июня: 6,
  июл: 7,
  июль: 7,
  июля: 7,
  август: 8,
  августа: 8,
  сентябр: 9,
  сентябрь: 9,
  сентября: 9,
  октябр: 10,
  октябрь: 10,
  октября: 10,
  ноябр: 11,
  ноябрь: 11,
  ноября: 11,
  декабр: 12,
  декабрь: 12,
  декабря: 12,
};

const RU_SPOKEN_HOUR_MAP: Array<[string, number]> = [
  ['двадцать три', 23],
  ['двадцать два', 22],
  ['двадцать один', 21],
  ['двадцать', 20],
  ['девятнадцать', 19],
  ['восемнадцать', 18],
  ['семнадцать', 17],
  ['шестнадцать', 16],
  ['пятнадцать', 15],
  ['четырнадцать', 14],
  ['тринадцать', 13],
  ['двенадцать', 12],
  ['одиннадцать', 11],
  ['десять', 10],
  ['девять', 9],
  ['восемь', 8],
  ['семь', 7],
  ['шесть', 6],
  ['пять', 5],
  ['четыре', 4],
  ['три', 3],
  ['два', 2],
  ['две', 2],
  ['один', 1],
  ['одна', 1],
  ['ноль', 0],
];

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
  'ногтев',
  'дизайн',
  'педик',
  'ресниц',
  'бров',
  'перманент',
  'микронед',
  'мезо',
  'стриж',
  'окраш',
  'код подтверждения',
  'консультац',
  'подбор',
  'подбери',
  'подберите',
  'подберём',
  'помоги выбрать',
  'помогите выбрать',
  'что выбрать',
  'что лучше',
  'что подходит',
  'что подойдет',
  'что подойдёт',
  // RU intent verbs (short clarifications like "хочу", "нужно" after a service list)
  'хочу',
  'хотим',
  'хотел бы',
  'хотела бы',
  'нужно',
  'надо',
  'pmu',
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
  'pmu',
  'haarschnitt',
  'coloring',
  'bestätigungscode',
  'beratung',
  'konsultation',
  'empfehlung',
  // DE intent verbs
  'möchte',
  'moechte',
  'ich will',
  'brauche',
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
  'pmu',
  'haircut',
  'verification code',
  'consultation',
  'consult',
  'recommendation',
  'recommend',
  'help choose',
  // EN intent verbs
  'i want',
  'i need',
  'want to',
  'need to',
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
  if (detectPreferredTimeInput(value)) return true;
  if (looksLikeMonthNameDateInput(value)) return true;
  if (extractPreferredStartTimeInput(value)) return true;
  if (/\b\d{1,2}[:.]\d{2}\s*[–-]\s*\d{1,2}[:.]\d{2}\b/.test(value)) return true;
  if (/\b\d{1,2}[./-]\d{1,2}\b/.test(value)) return true;
  return false;
}

function looksLikeContactPayload(text: string): boolean {
  const value = text.trim();
  if (!value) return false;
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value);
  const hasPhone = /(?:\+?\d[\d\s().-]{6,}\d)/.test(value);
  const hasPhoneIntent = /\b(телефон|номер|phone|mobile|handy|kontakt|контакт|telegram|телеграм|whatsapp)\b/iu.test(
    value,
  );
  const spokenNumberTokens =
    value.match(
      /\b(плюс|plus|ноль|нуль|один|одна|два|две|три|четыре|пять|шесть|семь|восемь|девять|десять|одиннадцать|двенадцать|тринадцать|четырнадцать|пятнадцать|шестнадцать|семнадцать|восемнадцать|девятнадцать|двадцать|тридцать|сорок|пятьдесят|шестьдесят|семьдесят|восемьдесят|девяносто|сто|двести|триста|четыреста|пятьсот|шестьсот|семьсот|восемьсот|девятьсот)\b/giu,
    ) ?? [];
  const hasSpokenPhone = hasPhoneIntent && spokenNumberTokens.length >= 3;
  const hasObfuscatedEmail =
    /[A-Z0-9._%+-]+(?:\s*|[-_.]?)(?:sobaka|собака)(?:\s*|[-_.]?)[A-Z0-9.-]+(?:\.[A-Z]{2,})+/iu.test(
      value,
    ) ||
    /\b(email|e-mail|почта|емейл|имейл|майл)\b/iu.test(value) ||
    /(sobaka|собака)/iu.test(value);
  return hasEmail || hasPhone || hasObfuscatedEmail || hasSpokenPhone;
}

function looksLikeServiceOptionPayload(text: string): boolean {
  const value = normalizeInput(text);
  if (!value) return false;
  // UI option payload: "<service> — 60 мин., 35,00 €" (or "min.")
  return /[—–-]\s*\d{1,3}\s*(?:мин\.?|min\.?)/iu.test(value);
}

function looksLikePricedOptionPayload(text: string): boolean {
  const value = normalizeInput(text);
  if (!value) return false;
  // UI option payload used in consultation blocks: "<service> — ... 55 €"
  return /[—–-].*\d{1,4}(?:[.,]\d{1,2})?\s*€/iu.test(value);
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

function mapToolNameToProgressStep(toolName: string): string {
  switch (toolName) {
    case 'list_services':
      return 'loading_services';
    case 'list_masters_for_services':
      return 'loading_masters';
    case 'search_availability':
    case 'search_availability_month':
      return 'searching_slots';
    case 'reserve_slot':
      return 'reserving_slot';
    case 'create_draft':
      return 'creating_draft';
    case 'start_verification':
      return 'sending_otp';
    case 'complete_booking':
      return 'confirming_booking';
    default:
      return `tool:${toolName}`;
  }
}

function isConsultationOperationalBookingInput(text: string): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;
  if (looksLikeDateOrTimeSelection(text)) return true;
  if (isAffirmativeFollowUp(text)) return true;

  const hints = [
    'выбрать дату',
    'выбери дату',
    'время',
    'дата',
    'мастер',
    'slot',
    'date',
    'time',
    'master',
    'uhrzeit',
    'datum',
    'meister',
    'записаться',
    'запись',
    'book',
    'booking',
    'buchen',
    'buchung',
  ];
  return hints.some((h) => value.includes(h));
}

function isServiceAvailabilityInquiry(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;
  if (looksLikeServiceOptionPayload(text) || looksLikePricedOptionPayload(text)) return false;
  if (looksLikeDateOrTimeSelection(text)) return false;

  const serviceHints = [
    'маник',
    'ногт',
    'педик',
    'бров',
    'ресниц',
    'перманент',
    'pmu',
    'hydra',
    'hydrafacial',
    'стриж',
    'окраш',
    'lifting',
    'lash',
    'brow',
    'nail',
    'nagel',
    'wimper',
    'augenbrau',
    'haarschnitt',
  ];
  const hasServiceHint = serviceHints.some((hint) => value.includes(hint));
  if (!hasServiceHint) return false;

  const hasQuestionMark = /[?？]/u.test(text);

  if (locale === 'ru') {
    const ruCues = [
      'есть ли',
      'есть у вас',
      'у вас есть',
      'а есть',
      'интересует',
      'меня интересует',
      'интересует услуга',
      'интересуюсь',
      'предлагаете',
      'делаете',
      'оказываете',
      'имеется',
      'видел на сайте',
      'видела на сайте',
      'на сайте в услугах',
      'в списке услуг',
      'в прайсе',
    ];
    return hasQuestionMark || ruCues.some((cue) => value.includes(cue));
  }
  if (locale === 'en') {
    const enCues = [
      'do you have',
      'is there',
      'do you offer',
      'interested in',
      'i am interested in',
      'offer',
      'i saw on the site',
      'on your site',
      'in your services list',
    ];
    return hasQuestionMark || enCues.some((cue) => value.includes(cue));
  }
  const deCues = [
    'gibt es',
    'bieten sie',
    'habt ihr',
    'haben sie',
    'interessiere mich',
    'ich interessiere mich',
    'ich habe auf der website gesehen',
    'auf ihrer website',
    'in der leistungsliste',
  ];
  return hasQuestionMark || deCues.some((cue) => value.includes(cue));
}

type ConsultationTechnique = NonNullable<
  AiSession['context']['consultationTechnique']
>;
type ConsultationTopic = NonNullable<AiSession['context']['consultationTopic']>;

type SelectionCatalogGroup = {
  id: string;
  title: string;
  services: Array<{
    id: string;
    title: string;
    durationMin: number;
    priceCents: number | null;
  }>;
};

type SelectionCatalogService = {
  id: string;
  title: string;
  groupTitle: string;
};

function getConsultationTechniqueBookingLabels(
  locale: 'de' | 'ru' | 'en',
  technique: ConsultationTechnique,
): string[] {
  if (technique === 'powder_brows') {
    return locale === 'ru'
      ? ['Пудровые брови', 'Powder Brows']
      : locale === 'en'
        ? ['Powder Brows', 'Пудровые брови']
        : ['Powder Brows', 'Пудровые брови'];
  }
  if (technique === 'hairstroke_brows') {
    return locale === 'ru'
      ? ['Волосковая техника', 'Hairstroke Brows']
      : locale === 'en'
        ? ['Hairstroke Brows', 'Волосковая техника']
        : ['Hairstroke Brows', 'Волосковая техника'];
  }
  if (technique === 'aquarell_lips') {
    return locale === 'ru'
      ? ['Акварельные губы', 'Aquarell Lips']
      : locale === 'en'
        ? ['Aquarelle Lips', 'Акварельные губы']
        : ['Aquarell Lips', 'Акварельные губы'];
  }
  if (technique === 'lips_3d') {
    return locale === 'ru'
      ? ['3D губы', '3D Lips']
      : locale === 'en'
        ? ['3D Lips', '3D губы']
        : ['3D Lips', '3D губы'];
  }
  if (technique === 'upper_lower') {
    return locale === 'ru'
      ? ['Межресничка верх+низ', 'Верх+низ', 'Wimpernkranz oben + unten']
      : locale === 'en'
        ? ['Upper + lower lash line', 'Lash line upper + lower', 'Межресничка верх+низ']
        : ['Wimpernkranz oben + unten', 'Oben + unten', 'Межресничка верх+низ'];
  }
  return locale === 'ru'
    ? ['Межресничка', 'Lash line', 'Wimpernkranz']
    : locale === 'en'
      ? ['Lash line', 'Межресничка', 'Wimpernkranz']
      : ['Wimpernkranz', 'Lash line', 'Межресничка'];
}

function isLikelyPmuGroupTitle(title: string): boolean {
  const value = normalizeChoiceText(title);
  return (
    value.includes('pmu') ||
    value.includes('перманент') ||
    value.includes('permanent')
  );
}

function isLikelyComboOrCorrectionService(title: string): boolean {
  const raw = title.toLowerCase();
  const normalized = normalizeChoiceText(title);
  return (
    normalized.includes('комбо') ||
    normalized.includes('combo') ||
    normalized.includes('коррек') ||
    normalized.includes('correction') ||
    normalized.includes('refresh') ||
    normalized.includes('nachbehandlung') ||
    normalized.includes('auffrisch') ||
    raw.includes('+')
  );
}

function resolveConsultationTechniqueService(
  locale: 'de' | 'ru' | 'en',
  technique: ConsultationTechnique,
  groups: SelectionCatalogGroup[],
): SelectionCatalogService | null {
  const flatServices: SelectionCatalogService[] = groups.flatMap((group) =>
    group.services.map((service) => ({
      id: service.id,
      title: service.title,
      groupTitle: group.title,
    })),
  );
  if (flatServices.length === 0) return null;

  const pmuPool = flatServices.filter(
    (service) =>
      isLikelyPmuGroupTitle(service.groupTitle) ||
      isLikelyPmuGroupTitle(service.title),
  );
  const pool = pmuPool.length > 0 ? pmuPool : flatServices;
  const labels = getConsultationTechniqueBookingLabels(locale, technique).map((label) =>
    normalizeChoiceText(label),
  );

  const browsRe = /(бров|brow|augenbrau)/u;
  const lipsRe = /(губ|lip|lipp)/u;
  const lashRe = /(межреснич|lash line|lashline|wimpernkranz)/u;
  const upperLowerRe = /(верх.*низ|upper.*lower|oben.*unten)/u;
  const powderRe = /(powder|пудров|puder)/u;
  const hairstrokeRe = /(hairstroke|волосков|härchen|haerchen)/u;
  const aquarellRe = /(aquarell|акварел)/u;
  const lips3dRe = /(3d)/u;

  let best: SelectionCatalogService | null = null;
  let bestScore = 0;

  for (const service of pool) {
    const normalizedTitle = normalizeChoiceText(service.title);
    let score = 0;

    if (labels.some((label) => label === normalizedTitle)) {
      score += 1200;
    }
    if (
      labels.some(
        (label) =>
          label.length > 0 &&
          (normalizedTitle.includes(label) || label.includes(normalizedTitle)),
      )
    ) {
      score += 250;
    }

    if (isLikelyPmuGroupTitle(service.groupTitle)) score += 120;
    if (isLikelyComboOrCorrectionService(service.title)) score -= 900;

    switch (technique) {
      case 'powder_brows':
        if (powderRe.test(normalizedTitle)) score += 900;
        if (browsRe.test(normalizedTitle)) score += 150;
        if (
          hairstrokeRe.test(normalizedTitle) ||
          aquarellRe.test(normalizedTitle) ||
          lips3dRe.test(normalizedTitle) ||
          lipsRe.test(normalizedTitle) ||
          lashRe.test(normalizedTitle)
        ) {
          score -= 450;
        }
        break;
      case 'hairstroke_brows':
        if (hairstrokeRe.test(normalizedTitle)) score += 900;
        if (browsRe.test(normalizedTitle)) score += 150;
        if (
          powderRe.test(normalizedTitle) ||
          aquarellRe.test(normalizedTitle) ||
          lips3dRe.test(normalizedTitle) ||
          lipsRe.test(normalizedTitle) ||
          lashRe.test(normalizedTitle)
        ) {
          score -= 450;
        }
        break;
      case 'aquarell_lips':
        if (aquarellRe.test(normalizedTitle)) score += 900;
        if (lipsRe.test(normalizedTitle)) score += 150;
        if (
          powderRe.test(normalizedTitle) ||
          hairstrokeRe.test(normalizedTitle) ||
          lips3dRe.test(normalizedTitle) ||
          browsRe.test(normalizedTitle) ||
          lashRe.test(normalizedTitle)
        ) {
          score -= 450;
        }
        break;
      case 'lips_3d':
        if (lips3dRe.test(normalizedTitle)) score += 850;
        if (lipsRe.test(normalizedTitle)) score += 150;
        if (
          aquarellRe.test(normalizedTitle) ||
          powderRe.test(normalizedTitle) ||
          hairstrokeRe.test(normalizedTitle) ||
          browsRe.test(normalizedTitle) ||
          lashRe.test(normalizedTitle)
        ) {
          score -= 450;
        }
        break;
      case 'lashline':
        if (lashRe.test(normalizedTitle)) score += 900;
        if (upperLowerRe.test(normalizedTitle)) score -= 280;
        if (browsRe.test(normalizedTitle) || lipsRe.test(normalizedTitle)) score -= 420;
        break;
      case 'upper_lower':
        if (upperLowerRe.test(normalizedTitle)) score += 1000;
        if (lashRe.test(normalizedTitle)) score += 120;
        if (browsRe.test(normalizedTitle) || lipsRe.test(normalizedTitle)) score -= 420;
        break;
    }

    if (score > bestScore) {
      bestScore = score;
      best = service;
    }
  }

  return bestScore > 0 ? best : null;
}

function buildConsultationBookingConfirmText(
  locale: 'de' | 'ru' | 'en',
  technique: ConsultationTechnique,
): string {
  const display = getConsultationTechniqueBookingLabels(locale, technique)[0];
  if (locale === 'ru') {
    return `Подтвердите, пожалуйста: записываем вас на услугу "${display}"?\n\n[option] ✅ Да, записаться на ${display} [/option]\n[option] 🔁 Выбрать другую услугу [/option]`;
  }
  if (locale === 'en') {
    return `Please confirm: should I book you for "${display}"?\n\n[option] ✅ Yes, book ${display} [/option]\n[option] 🔁 Choose another service [/option]`;
  }
  return `Bitte bestätigen: Soll ich Sie für "${display}" eintragen?\n\n[option] ✅ Ja, ${display} buchen [/option]\n[option] 🔁 Andere Leistung wählen [/option]`;
}

function buildConsultationTechniqueSuitabilityText(
  locale: 'de' | 'ru' | 'en',
  technique: ConsultationTechnique,
): string {
  const serviceTitle = getConsultationTechniqueBookingLabels(locale, technique)[0];
  return buildSelectedServiceSuitabilityText(
    locale,
    serviceTitle,
    locale === 'ru'
      ? 'ПЕРМАНЕНТНЫЙ МАКИЯЖ'
      : locale === 'en'
        ? 'PERMANENT MAKEUP'
        : 'PERMANENT MAKE-UP',
  );
}

function buildHydrafacialSelectedServiceDetailsText(
  locale: 'de' | 'ru' | 'en',
  serviceTitle: string,
): string | null {
  const titleNorm = normalizeChoiceText(serviceTitle);
  const bookingCta =
    locale === 'ru'
      ? '[option] 📅 Подобрать время и записаться [/option]'
      : locale === 'en'
        ? '[option] 📅 Pick time and book [/option]'
        : '[option] 📅 Zeit finden und buchen [/option]';

  if (titleNorm.includes('signature')) {
    if (locale === 'ru') {
      return `Signature Hydrafacial 🌿 Базовый формат: глубокое очищение, мягкая экстракция и интенсивное увлажнение.
Подходит для регулярного ухода и быстрого «освежения» кожи без восстановления.

${bookingCta}`;
    }
    if (locale === 'en') {
      return `Signature Hydrafacial 🌿 Base format: deep cleansing, gentle extraction and intense hydration.
Best for regular maintenance and a quick skin refresh with zero downtime.

${bookingCta}`;
    }
    return `Signature Hydrafacial 🌿 Basisformat: Tiefenreinigung, sanfte Extraktion und intensive Hydration.
Ideal für regelmäßige Pflege und einen schnellen Frische-Effekt ohne Ausfallzeit.

${bookingCta}`;
  }

  if (titleNorm.includes('deluxe')) {
    if (locale === 'ru') {
      return `Deluxe Hydrafacial ✨ Всё из Signature + усиленный пилинг и LED-терапия.
Подходит, если кожа выглядит уставшей или тусклой и нужен более заметный результат.

${bookingCta}`;
    }
    if (locale === 'en') {
      return `Deluxe Hydrafacial ✨ Everything in Signature + intensive peel and LED therapy.
Great if skin looks tired or dull and you want a more visible glow result.

${bookingCta}`;
    }
    return `Deluxe Hydrafacial ✨ Enthält alles aus Signature + intensives Peeling und LED-Therapie.
Ideal bei müder, fahler Haut für einen sichtbareren Glow-Effekt.

${bookingCta}`;
  }

  if (titleNorm.includes('platinum')) {
    if (locale === 'ru') {
      return `Platinum Hydrafacial 👑 Всё из Deluxe + лимфодренаж и премиум-сыворотки.
Максимально насыщенный формат для выраженного glow-эффекта и подготовки к событию.

${bookingCta}`;
    }
    if (locale === 'en') {
      return `Platinum Hydrafacial 👑 Everything in Deluxe + lymphatic drainage and premium serums.
Our most intensive format for maximum glow and event-level skin prep.

${bookingCta}`;
    }
    return `Platinum Hydrafacial 👑 Enthält alles aus Deluxe + Lymphdrainage und Premium-Seren.
Unser intensivstes Format für maximalen Glow und Event-Vorbereitung.

${bookingCta}`;
  }

  return null;
}

function buildHydrafacialSelectedServiceSuitabilityText(
  locale: 'de' | 'ru' | 'en',
  serviceTitle: string,
): string | null {
  const titleNorm = normalizeChoiceText(serviceTitle);
  const bookingCta =
    locale === 'ru'
      ? '[option] 📅 Подобрать время и записаться [/option]'
      : locale === 'en'
        ? '[option] 📅 Pick time and book [/option]'
        : '[option] 📅 Zeit finden und buchen [/option]';

  if (titleNorm.includes('signature')) {
    if (locale === 'ru') {
      return `Signature Hydrafacial 🌿 Кому подходит:
• как регулярный базовый уход раз в 4–6 недель;
• если хочется глубокого очищения и свежего тона без агрессивного воздействия;
• как первый Hydrafacial для знакомства с процедурой.

${bookingCta}`;
    }
    if (locale === 'en') {
      return `Signature Hydrafacial 🌿 Best for:
• regular baseline care every 4-6 weeks;
• deep cleansing + hydration with a gentle feel;
• first-time Hydrafacial clients.

${bookingCta}`;
    }
    return `Signature Hydrafacial 🌿 Geeignet für:
• regelmäßige Basispflege alle 4-6 Wochen;
• Tiefenreinigung + Hydration mit sanftem Verlauf;
• Hydrafacial-Einstieg beim ersten Termin.

${bookingCta}`;
  }

  if (titleNorm.includes('deluxe')) {
    if (locale === 'ru') {
      return `Deluxe Hydrafacial ✨ Кому подходит:
• если кожа выглядит уставшей/тусклой;
• при неровном тоне, когда нужен заметный glow;
• перед важным событием, когда нужен более выраженный эффект.

${bookingCta}`;
    }
    if (locale === 'en') {
      return `Deluxe Hydrafacial ✨ Best for:
• tired or dull-looking skin;
• uneven tone when you want more visible glow;
• pre-event skin prep with a stronger result.

${bookingCta}`;
    }
    return `Deluxe Hydrafacial ✨ Geeignet für:
• müde oder fahle Haut;
• ungleichmäßigen Teint mit Wunsch nach mehr Glow;
• Event-Vorbereitung mit sichtbarerem Effekt.

${bookingCta}`;
  }

  if (titleNorm.includes('platinum')) {
    if (locale === 'ru') {
      return `Platinum Hydrafacial 👑 Кому подходит:
• если нужен максимально выраженный glow-эффект;
• при сухой/обезвоженной коже для интенсивного насыщения;
• перед мероприятиями (фото, свадьба, важная встреча).

${bookingCta}`;
    }
    if (locale === 'en') {
      return `Platinum Hydrafacial 👑 Best for:
• maximum glow and premium-level skin prep;
• dry or dehydrated skin needing intensive hydration;
• major events (photos, wedding, important meetings).

${bookingCta}`;
    }
    return `Platinum Hydrafacial 👑 Geeignet für:
• maximalen Glow und intensives Premium-Treatment;
• trockene/dehydrierte Haut mit hohem Pflegebedarf;
• große Anlässe (Fotos, Hochzeit, wichtige Termine).

${bookingCta}`;
  }

  return null;
}

function isSelectedServiceSuitabilityIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;

  if (locale === 'ru') {
    return (
      value.includes('кому подходит') ||
      value.includes('для кого') ||
      value.includes('подойдет') ||
      value.includes('подойдёт') ||
      value.includes('подходит ли') ||
      value.includes('мне подойдет') ||
      value.includes('сухая кожа') ||
      value.includes('жирная кожа') ||
      value.includes('чувствительная кожа')
    );
  }

  if (locale === 'en') {
    return (
      value.includes('who is it for') ||
      value.includes('who does it suit') ||
      value.includes('is it suitable') ||
      value.includes('am i suitable') ||
      value.includes('dry skin') ||
      value.includes('sensitive skin')
    );
  }

  return (
    value.includes('fur wen') ||
    value.includes('für wen') ||
    value.includes('geeignet') ||
    value.includes('passt das') ||
    value.includes('trockene haut') ||
    value.includes('empfindliche haut')
  );
}

function buildSelectedServiceSuitabilityText(
  locale: 'de' | 'ru' | 'en',
  serviceTitle: string,
  groupTitle?: string,
): string {
  const bookingCta =
    locale === 'ru'
      ? '[option] 📅 Подобрать время и записаться [/option]'
      : locale === 'en'
        ? '[option] 📅 Pick time and book [/option]'
        : '[option] 📅 Zeit finden und buchen [/option]';

  const technique = detectKnowledgePmuTechnique(serviceTitle, locale);
  if (technique === 'powder_brows') {
    return locale === 'ru'
      ? `Powder Brows 🌸 Подходит, если хотите максимально мягкий и натуральный эффект без резких границ.

${bookingCta}`
      : locale === 'en'
        ? `Powder Brows 🌸 Great if you want the softest, most natural brow result without sharp edges.

${bookingCta}`
        : `Powder Brows 🌸 Ideal, wenn Sie einen besonders weichen, natürlichen Effekt ohne harte Konturen möchten.

${bookingCta}`;
  }
  if (technique === 'hairstroke_brows') {
    return locale === 'ru'
      ? `Hairstroke Brows 🌸 Подходит, если хотите более структурный и выразительный «волосковый» результат.

${bookingCta}`
      : locale === 'en'
        ? `Hairstroke Brows 🌸 Best if you want a more defined, textured hair-stroke look.

${bookingCta}`
        : `Hairstroke Brows 🌸 Geeignet, wenn Sie ein deutlicheres, strukturiertes Härchen-Ergebnis möchten.

${bookingCta}`;
  }
  if (technique === 'aquarell_lips') {
    return locale === 'ru'
      ? `Aquarell Lips 🌸 Подходит, если нужен деликатный натуральный оттенок губ на каждый день.

${bookingCta}`
      : locale === 'en'
        ? `Aquarell Lips 🌸 Great for a soft, natural everyday lip tint.

${bookingCta}`
        : `Aquarell Lips 🌸 Ideal für einen sanften, natürlichen Farbton im Alltag.

${bookingCta}`;
  }
  if (technique === 'lips_3d') {
    return locale === 'ru'
      ? `3D Lips 🌸 Подходит, если хотите более насыщенный оттенок и визуально более объёмный эффект.

${bookingCta}`
      : locale === 'en'
        ? `3D Lips 🌸 Best if you prefer a richer color and a visually fuller lip effect.

${bookingCta}`
        : `3D Lips 🌸 Geeignet, wenn Sie einen intensiveren Ton und mehr optisches Volumen wünschen.

${bookingCta}`;
  }

  const combined = `${normalizeChoiceText(groupTitle ?? '')} ${normalizeChoiceText(serviceTitle)}`;
  const isHydrafacial =
    combined.includes('hydra') ||
    combined.includes('hydrafacial') ||
    combined.includes('гидра');
  if (isHydrafacial) {
    return (
      buildHydrafacialSelectedServiceSuitabilityText(locale, serviceTitle) ??
      buildKnowledgeHydrafacialDetailsText(locale)
    );
  }

  const browsLashesRe = /(бров|ресниц|lash|brow|wimper|augenbrau)/u;
  if (browsLashesRe.test(combined)) {
    return locale === 'ru'
      ? `Эта процедура подходит, если хотите улучшить форму бровей/ресниц и получить аккуратный результат без длительного восстановления 🌸

${bookingCta}`
      : locale === 'en'
        ? `This treatment is suitable if you want cleaner brow/lash shape and a polished look with minimal downtime 🌸

${bookingCta}`
        : `Diese Behandlung passt, wenn Sie Brauen/Wimpern sauber formen und ein gepflegtes Ergebnis ohne lange Ausfallzeit möchten 🌸

${bookingCta}`;
  }

  if (locale === 'ru') {
    return `${serviceTitle} 🌸
Подходит, если хотите аккуратный, стойкий результат и минимум времени на ежедневный макияж/уход.

${bookingCta}`;
  }
  if (locale === 'en') {
    return `${serviceTitle} 🌸
Suitable if you want a polished long-lasting result and less daily makeup/styling effort.

${bookingCta}`;
  }
  return `${serviceTitle} 🌸
Geeignet, wenn Sie ein gepflegtes, langanhaltendes Ergebnis und weniger täglichen Styling-Aufwand möchten.

${bookingCta}`;
}

function buildSelectedServiceDetailsText(
  locale: 'de' | 'ru' | 'en',
  serviceTitle: string,
  groupTitle?: string,
  durationMin?: number,
): string {
  const technique = detectKnowledgePmuTechnique(serviceTitle, locale);
  if (technique) {
    return buildKnowledgePmuTechniqueDetailsText(locale, technique);
  }

  const combined = `${normalizeChoiceText(groupTitle ?? '')} ${normalizeChoiceText(serviceTitle)}`;
  const isHydrafacial =
    combined.includes('hydra') ||
    combined.includes('hydrafacial') ||
    combined.includes('гидра');
  if (isHydrafacial) {
    return (
      buildHydrafacialSelectedServiceDetailsText(locale, serviceTitle) ??
      buildKnowledgeHydrafacialDetailsText(locale)
    );
  }

  const browsLashesRe = /(бров|ресниц|lash|brow|wimper|augenbrau)/u;
  if (browsLashesRe.test(combined)) {
    return buildKnowledgeBrowsLashesDetailsText(locale);
  }

  const durationText =
    typeof durationMin === 'number' && durationMin > 0
      ? locale === 'ru'
        ? `Длительность: около **${durationMin} мин.**.`
        : locale === 'en'
          ? `Duration: about **${durationMin} min**.`
          : `Dauer: etwa **${durationMin} Min.**.`
      : locale === 'ru'
        ? 'Длительность зависит от выбранного формата.'
        : locale === 'en'
          ? 'Duration depends on the selected format.'
          : 'Die Dauer hängt vom gewählten Format ab.';

  const nailsRe = /(маник|ногт|педик|nail|nagel|manik)/u;
  if (nailsRe.test(combined)) {
    if (locale === 'ru') {
      return `${serviceTitle} 💅
Классический маникюр обычно включает придание формы ногтям, обработку кутикулы и аккуратный уход за ногтевой пластиной.
${durationText}
Перед визитом лучше сообщить, есть ли чувствительность кожи или предыдущее покрытие, чтобы мастер подобрал комфортный формат процедуры.

[option] 📅 Подобрать время и записаться [/option]`;
    }
    if (locale === 'en') {
      return `${serviceTitle} 💅
Classic manicure usually includes nail shaping, cuticle care, and neat basic nail treatment.
${durationText}
Before the visit, it helps to mention any skin sensitivity or existing coating so the master can choose the most comfortable procedure format.

[option] 📅 Pick time and book [/option]`;
    }
    return `${serviceTitle} 💅
Eine klassische Maniküre umfasst in der Regel Nagelform, Nagelhautpflege und eine saubere Basispflege der Nägel.
${durationText}
Vor dem Termin ist es hilfreich, eventuelle Hautempfindlichkeit oder vorhandenes Material zu erwähnen, damit die Meisterin das passende Vorgehen wählt.

[option] 📅 Zeit finden und buchen [/option]`;
  }

  const hairRe = /(стриж|волос|окраш|hair|haarschnitt|farbe)/u;
  if (hairRe.test(combined)) {
    if (locale === 'ru') {
      return `${serviceTitle} ✂️
Это услуга по стрижке/волосам с подбором формы под тип волос и желаемый результат.
${durationText}
Перед визитом удобно подготовить референс (фото желаемого результата), чтобы быстрее согласовать длину и форму.

[option] 📅 Подобрать время и записаться [/option]`;
    }
    if (locale === 'en') {
      return `${serviceTitle} ✂️
This is a haircut/hair service where shape is adjusted to your hair type and desired result.
${durationText}
It is useful to bring a reference photo so the length and shape can be aligned quickly.

[option] 📅 Pick time and book [/option]`;
    }
    return `${serviceTitle} ✂️
Das ist eine Haar-/Schnittleistung, bei der Form und Ergebnis auf Ihren Haartyp abgestimmt werden.
${durationText}
Ein Referenzfoto ist hilfreich, damit Länge und Form schnell abgestimmt werden können.

[option] 📅 Zeit finden und buchen [/option]`;
  }

  if (locale === 'ru') {
    return `${serviceTitle} 🌸
Это услуга из нашего каталога. Могу помочь подобрать формат, мастера и ближайшее время.

[option] 📅 Подобрать время и записаться [/option]`;
  }
  if (locale === 'en') {
    return `${serviceTitle} 🌸
This service is available in our catalog. I can help choose format, specialist, and nearest time.

[option] 📅 Pick time and book [/option]`;
  }
  return `${serviceTitle} 🌸
Diese Leistung ist in unserem Katalog verfügbar. Ich helfe gern bei Auswahl von Format, Meisterin und nächster freier Zeit.

[option] 📅 Zeit finden und buchen [/option]`;
}

/**
 * Build a SERVICE-SPECIFIC consultation card for the consultation flow.
 *
 * Why a new function: `buildSelectedServiceDetailsText` returns CATEGORY-level
 * generic text for brows/lashes (and similar) — so all 11 brows-lashes services
 * looked identical. This function:
 *   1) First uses the service description from the DB (admin-controlled source of truth)
 *   2) Falls back to per-service templated content matched by title
 *   3) Falls back to PMU technique flow when the title maps to a known technique
 *   4) Finally falls back to the generic category text
 *
 * Always includes the service price + duration + booking CTA + back link.
 */
function buildServiceConsultationCard(
  locale: 'de' | 'ru' | 'en',
  service: { title: string; description: string | null; durationMin: number; priceCents: number | null },
  groupTitle: string,
): string {
  const { title, description, durationMin, priceCents } = service;

  // First try existing PMU technique flow — keeps rich PMU consultation intact
  const pmuTechnique = detectKnowledgePmuTechnique(title, locale);
  if (pmuTechnique) {
    return buildKnowledgePmuTechniqueDetailsText(locale, pmuTechnique);
  }

  // Build core meta lines (price + duration)
  const priceStr = priceCents
    ? `${(priceCents / 100).toFixed(2).replace('.', ',')} €`
    : null;

  const durationLabel =
    locale === 'ru'
      ? 'Длительность'
      : locale === 'en'
        ? 'Duration'
        : 'Dauer';
  const priceLabel =
    locale === 'ru'
      ? 'Цена'
      : locale === 'en'
        ? 'Price'
        : 'Preis';
  const minStr = locale === 'en' ? 'min' : locale === 'de' ? 'Min.' : 'мин.';

  const metaLines: string[] = [];
  if (durationMin > 0) metaLines.push(`⏱️ ${durationLabel}: ~${durationMin} ${minStr}`);
  if (priceStr) metaLines.push(`💰 ${priceLabel}: **${priceStr}**`);

  // Build per-service templates (matched by normalized title)
  const titleNorm = normalizeChoiceText(title);
  const groupNorm = normalizeChoiceText(groupTitle);

  // ── Brows & Lashes (Lifting) ──────────────────────────────────────
  const isLashLift =
    titleNorm.includes('лифтинг ресниц') ||
    titleNorm.includes('lash lift') ||
    (titleNorm.includes('подтяжка') && titleNorm.includes('ресниц'));
  const isBrowLift =
    (titleNorm.includes('подтяжка') && titleNorm.includes('бров')) ||
    titleNorm.includes('brow lift') ||
    titleNorm.includes('brauenlifting');
  const isHybridBrows =
    titleNorm.includes('гибрид') && titleNorm.includes('бров');
  const isClassicBrowCorrection =
    (titleNorm.includes('классическ') && titleNorm.includes('коррекц') && titleNorm.includes('бров'));
  const isWax =
    titleNorm.includes('воск') || titleNorm.includes('эпиляц') || titleNorm.includes('wax');
  const isLashTinting =
    titleNorm.includes('окрашивание ресниц');
  const isComboLashBrow =
    titleNorm.includes('комбо') && (titleNorm.includes('ресниц') || titleNorm.includes('бров'));
  const isLashExtensionsCorrection =
    titleNorm.includes('наращивание ресниц') && titleNorm.includes('коррекция');
  const isLashExtensionsNew =
    titleNorm.includes('наращивание ресниц') && !titleNorm.includes('коррекция') && !titleNorm.includes('снятие');
  const isLashRemoval =
    titleNorm.includes('снятие') && titleNorm.includes('ресниц');

  // ── Microneedling ─────────────────────────────────────────────────
  const isMicroneedlingCourse =
    (titleNorm.includes('микронидл') || titleNorm.includes('microneedl')) && titleNorm.includes('курс');
  const isMicroneedlingSingle =
    (titleNorm.includes('микронидл') || titleNorm.includes('microneedl')) && !titleNorm.includes('курс');

  // ── PMU corrections / combos (not in the 6 main techniques) ───────
  const isPmuCorrection =
    groupNorm.includes('перманент') && titleNorm.includes('коррекц');
  const isPmuRefresh =
    groupNorm.includes('перманент') && (titleNorm.includes('обновление') || titleNorm.includes('refresh'));
  const isPmuCombo =
    groupNorm.includes('перманент') && titleNorm.includes('комбо');

  // Helper to compose the card body.
  // Skips the template intro if the DB description is substantial AND
  // already overlaps with the intro (avoids duplicate paragraphs like
  // we saw in Hydrafacial cards).
  const compose = (
    icon: string,
    intro: string,
    idealFor: string | null,
    healing: string | null,
  ): string => {
    const dbDesc = description?.trim() ?? '';
    const isDbDescSubstantial = dbDesc.length >= 80;
    // Detect overlap: take first 30 chars of intro and check if they appear in DB desc
    const introHead = intro.replace(/^[^a-zA-Zа-яА-ЯёЁ]+/, '').slice(0, 30).toLowerCase();
    const overlaps =
      introHead.length >= 15 && dbDesc.toLowerCase().includes(introHead);

    const blocks = [`${icon} **${title}**`, ''];
    // Show intro only when there's no substantial overlapping DB description
    if (!(isDbDescSubstantial && overlaps)) {
      blocks.push(intro);
      if (idealFor) blocks.push('', idealFor);
    }
    if (dbDesc) {
      if (blocks[blocks.length - 1] !== '') blocks.push('');
      blocks.push(`📝 ${dbDesc}`);
    }
    if (metaLines.length) blocks.push('', ...metaLines);
    if (healing) blocks.push('', healing);

    const cta =
      locale === 'ru'
        ? ['', '[option] 📅 Подобрать время и записаться [/option]', '[option] ↩️ Назад к списку услуг [/option]']
        : locale === 'en'
          ? ['', '[option] 📅 Pick time and book [/option]', '[option] ↩️ Back to service list [/option]']
          : ['', '[option] 📅 Zeit finden und buchen [/option]', '[option] ↩️ Zurück zur Leistungsliste [/option]'];
    blocks.push(...cta);
    return blocks.join('\n');
  };

  // ─── Per-service intros ───────────────────────────────────────────
  if (locale === 'ru') {
    if (isLashLift) {
      return compose(
        '✨',
        'Лифтинг ресниц приподнимает ресницы от корней — взгляд становится открытым и выразительным без наращивания.',
        '🌸 Подходит, если хотите естественный «открытый взгляд», который держится 6–8 недель.',
        '🌿 После: не мочить ~24 часа, не пользоваться щипцами для завивки.',
      );
    }
    if (isBrowLift) {
      return compose(
        '🌸',
        'Подтяжка бровей (лифтинг) фиксирует волоски в нужном направлении — брови выглядят ухоженными, плотнее и аккуратнее.',
        'Эффект ~4–6 недель, без ежедневной укладки.',
        '🌿 После: 24 часа не мочить, без сауны и активного спорта.',
      );
    }
    if (isHybridBrows) {
      return compose(
        '✨',
        'Гибридные брови — комбинация воскового моделирования и нити для максимальной точности формы и аккуратной зачистки.',
        '🌸 Подходит, когда нужна выразительная, чистая форма без жёстких краёв.',
        null,
      );
    }
    if (isClassicBrowCorrection) {
      return compose(
        '✨',
        'Классическая коррекция бровей — деликатное оформление формы пинцетом/воском с учётом ваших черт лица.',
        'Регулярная коррекция — раз в 3–4 недели для аккуратного вида.',
        null,
      );
    }
    if (isWax) {
      return compose(
        '✨',
        'Восковая эпиляция — деликатное и точное удаление нежелательных волосков с минимальным раздражением.',
        null,
        '🌿 После: 24 часа избегать сауны, прямого солнца и тяжёлой косметики на зону.',
      );
    }
    if (isLashTinting) {
      return compose(
        '✨',
        'Окрашивание ресниц делает их визуально гуще и выразительнее, особенно у светлых ресниц — эффект 3–4 недели.',
        null,
        null,
      );
    }
    if (isComboLashBrow) {
      return compose(
        '💫',
        'Комбо-услуга — оформляем взгляд и брови в один визит. Экономит время и даёт цельный результат.',
        null,
        null,
      );
    }
    if (isLashExtensionsNew) {
      return compose(
        '✨',
        'Полное наращивание ресниц: добавляем объём и длину по выбранному эффекту. Носибельность 3–4 недели до коррекции.',
        '🌸 Подходит, если хочется постоянный «накрашенный» взгляд без туши.',
        '🌿 После: первые 24 часа не мочить, без сауны и горячей воды; правильный уход = долгая носка.',
      );
    }
    if (isLashExtensionsCorrection) {
      return compose(
        '✨',
        'Коррекция наращивания: освежаем существующие ресницы — снимаем выпавшие и доращиваем новые до полной плотности.',
        '🌸 Делать каждые 2–3 недели, чтобы держать стабильный объём.',
        null,
      );
    }
    if (isLashRemoval) {
      return compose(
        '✨',
        'Бережное снятие нарощенных ресниц специальным составом, без повреждения собственных.',
        null,
        null,
      );
    }
    if (isMicroneedlingSingle) {
      return compose(
        '🔬',
        'Микронидлинг — игольчатая фракционная процедура: микропроколы запускают регенерацию, выработку коллагена и подтягивают кожу.',
        '🌸 Помогает с тонкими морщинами, пост-акне, расширенными порами и общим тонусом кожи.',
        '🌿 1–3 дня лёгкое покраснение, 3–5 дней — деликатное шелушение. Эффект растёт 4–6 недель.',
      );
    }
    if (isMicroneedlingCourse) {
      return compose(
        '🔬',
        'Микронидлинг курсом даёт **выраженный накопительный эффект** на коллаген, текстуру и тонус кожи. Курс эффективнее одной процедуры в разы.',
        '🌸 Идеально для системной работы с возрастными изменениями, пост-акне или общим обновлением кожи.',
        '🌿 Между процедурами интервал ~3–4 недели. Между ними — щадящий уход и SPF.',
      );
    }
    if (isPmuCorrection) {
      return compose(
        '💄',
        'Коррекция перманентного макияжа — обновляем форму и насыщенность цвета после первичной процедуры или со временем.',
        '🌸 Возможна для бровей, губ и межреснички. Длительность и интенсивность подбираем индивидуально.',
        '🌿 Заживление мягче, чем после первичной процедуры, ~2–3 недели. Полные рекомендации по уходу — на консультации.',
      );
    }
    if (isPmuRefresh) {
      return compose(
        '💄',
        'Обновление PMU — возвращаем форму и насыщенность через 12+ месяцев после первичной процедуры.',
        '🌸 Подбираем интенсивность под текущее состояние пигмента и ваши пожелания.',
        '🌿 Период заживления — как при первичной процедуре, ~4 недели.',
      );
    }
    if (isPmuCombo) {
      return compose(
        '💄',
        'Комбо PMU — выполняем сразу две техники за один визит, например **Powder Brows + межресничное заполнение**. Экономит время и даёт цельный результат.',
        '🌸 Подходит, если хочется максимально оформленный «уже с макияжем» взгляд за одну процедуру.',
        '🌿 Заживление ~4 недели, как при стандартной PMU-процедуре.',
      );
    }
  }

  if (locale === 'en') {
    if (isLashLift) {
      return compose('✨', 'Lash lift curls lashes from the roots — open, expressive gaze without extensions.', '🌸 Best for a natural "open eyes" look lasting 6–8 weeks.', '🌿 After: do not wet for ~24 hours, no curling tongs.');
    }
    if (isBrowLift) {
      return compose('🌸', 'Brow lifting fixes hairs in the desired direction — brows look groomed and fuller without daily styling.', 'Effect ~4–6 weeks.', '🌿 After: do not wet for 24h, no sauna, no intense sport.');
    }
    if (isHybridBrows) {
      return compose('✨', 'Hybrid brows — combination of wax shaping and threading for precise form and clean finish.', '🌸 Best when you want an expressive, neat shape without harsh edges.', null);
    }
    if (isClassicBrowCorrection) {
      return compose('✨', 'Classic brow correction — gentle shaping with tweezers/wax tailored to your facial features.', 'Recommended every 3–4 weeks for a neat look.', null);
    }
    if (isWax) {
      return compose('✨', 'Waxing — gentle and precise hair removal with minimal irritation.', null, '🌿 After: avoid sauna, direct sun and heavy cosmetics on the area for 24h.');
    }
    if (isLashTinting) {
      return compose('✨', 'Lash tinting makes lashes visually fuller and more expressive — effect lasts 3–4 weeks.', null, null);
    }
    if (isComboLashBrow) {
      return compose('💫', 'Combo service — both gaze and brows done in one visit. Saves time and gives a cohesive result.', null, null);
    }
    if (isLashExtensionsNew) {
      return compose('✨', 'Full lash extensions: adds volume and length per chosen effect. Wears beautifully for 3–4 weeks until refill.', '🌸 Best for a permanent "made-up" look without mascara.', '🌿 After: keep dry first 24h, no sauna/hot water; proper care = longer wear.');
    }
    if (isLashExtensionsCorrection) {
      return compose('✨', 'Lash refill: refresh the set — remove fallen lashes and fill in with new ones back to full density.', '🌸 Recommended every 2–3 weeks to keep consistent volume.', null);
    }
    if (isLashRemoval) {
      return compose('✨', 'Gentle extension removal with a special solution — no damage to natural lashes.', null, null);
    }
    if (isMicroneedlingSingle) {
      return compose('🔬', 'Microneedling — fractional needle treatment: micro-punctures trigger regeneration, collagen production and skin tightening.', '🌸 Helps with fine wrinkles, post-acne, enlarged pores and overall skin tone.', '🌿 1–3 days mild redness, 3–5 days gentle flaking. Effect builds over 4–6 weeks.');
    }
    if (isMicroneedlingCourse) {
      return compose('🔬', 'Microneedling course gives a **pronounced cumulative effect** on collagen, texture and tone. Far more effective than a single procedure.', '🌸 Ideal for systematic anti-age work, post-acne or comprehensive skin renewal.', '🌿 ~3–4 weeks between procedures. Gentle care and SPF in between.');
    }
    if (isPmuCorrection) {
      return compose('💄', 'PMU correction — we refresh shape and color intensity after the initial procedure or over time.', '🌸 Available for brows, lips, lash line. Duration and intensity tailored individually.', '🌿 Healing is milder than initial PMU, ~2–3 weeks. Full aftercare on consultation.');
    }
    if (isPmuRefresh) {
      return compose('💄', 'PMU refresh — restores shape and intensity 12+ months after initial procedure.', '🌸 Intensity matched to current pigment state and your wishes.', '🌿 Healing similar to initial procedure, ~4 weeks.');
    }
    if (isPmuCombo) {
      return compose('💄', 'PMU combo — two techniques in one visit, e.g. **Powder Brows + lash line**. Saves time, cohesive result.', '🌸 Best for a maximally polished "already made up" look in one go.', '🌿 Healing ~4 weeks, same as a standard PMU procedure.');
    }
  }

  // German fallbacks
  if (isLashLift) {
    return compose('✨', 'Wimpernlifting richtet die Wimpern an der Wurzel auf — offener, ausdrucksstarker Blick ohne Extensions.', '🌸 Ideal für einen natürlichen "offenen Blick", hält 6–8 Wochen.', '🌿 Danach: ~24 Stunden nicht nass machen, keine Wimpernzange.');
  }
  if (isBrowLift) {
    return compose('🌸', 'Brauenlifting fixiert die Härchen in die gewünschte Richtung — gepflegte, dichtere Brauen ohne tägliches Stylen.', 'Effekt ~4–6 Wochen.', '🌿 Danach: 24 h nicht nass, keine Sauna, kein intensiver Sport.');
  }
  if (isHybridBrows) {
    return compose('✨', 'Hybrid-Brauen — Kombination aus Wachs und Fadentechnik für eine präzise, saubere Form.', '🌸 Ideal für eine ausdrucksstarke Form ohne harte Kanten.', null);
  }
  if (isClassicBrowCorrection) {
    return compose('✨', 'Klassische Brauenkorrektur — sanftes Formen mit Pinzette/Wachs, abgestimmt auf Ihre Gesichtszüge.', 'Alle 3–4 Wochen für einen gepflegten Look.', null);
  }
  if (isWax) {
    return compose('✨', 'Waxing — sanfte und präzise Haarentfernung mit minimaler Reizung.', null, '🌿 Danach: 24 h Sauna, direkte Sonne und schwere Kosmetik meiden.');
  }
  if (isLashTinting) {
    return compose('✨', 'Wimpernfärbung — Wimpern wirken voller und ausdrucksstärker. Effekt 3–4 Wochen.', null, null);
  }
  if (isComboLashBrow) {
    return compose('💫', 'Kombi-Service — Blick und Brauen in einem Termin. Spart Zeit, einheitliches Ergebnis.', null, null);
  }
  if (isLashExtensionsNew) {
    return compose('✨', 'Komplette Wimpernverlängerung: Volumen und Länge nach gewähltem Effekt. Hält 3–4 Wochen bis zur Auffüllung.', '🌸 Ideal für einen dauerhaft "geschminkten" Blick ohne Mascara.', '🌿 Danach: erste 24 h trocken halten, keine Sauna/heißes Wasser; richtige Pflege = lange Haltbarkeit.');
  }
  if (isLashExtensionsCorrection) {
    return compose('✨', 'Wimpern-Auffüllung: Set auffrischen — ausgefallene Wimpern ersetzen und auf volle Dichte aufstocken.', '🌸 Alle 2–3 Wochen für konstantes Volumen.', null);
  }
  if (isLashRemoval) {
    return compose('✨', 'Schonende Entfernung der Extensions mit Speziallösung — ohne Schaden für die eigenen Wimpern.', null, null);
  }
  if (isMicroneedlingSingle) {
    return compose('🔬', 'Microneedling — fraktionierte Nadelbehandlung: Mikroverletzungen aktivieren Regeneration, Kollagenbildung und Hautstraffung.', '🌸 Hilft bei feinen Falten, Post-Akne, vergrößerten Poren und Hauttonus.', '🌿 1–3 Tage leichte Rötung, 3–5 Tage feines Schuppen. Effekt baut sich über 4–6 Wochen auf.');
  }
  if (isMicroneedlingCourse) {
    return compose('🔬', 'Microneedling-Kur ergibt einen **deutlichen kumulativen Effekt** auf Kollagen, Textur und Tonus. Deutlich wirksamer als eine einzelne Behandlung.', '🌸 Ideal für systematische Anti-Aging-Arbeit, Post-Akne oder umfassende Hauterneuerung.', '🌿 ~3–4 Wochen Abstand. Dazwischen sanfte Pflege und SPF.');
  }
  if (isPmuCorrection) {
    return compose('💄', 'PMU-Korrektur — Form und Farbintensität nach der Erstbehandlung oder mit der Zeit auffrischen.', '🌸 Möglich für Brauen, Lippen, Wimpernkranz. Dauer und Intensität individuell abgestimmt.', '🌿 Heilung sanfter als die Erstbehandlung, ~2–3 Wochen. Vollständige Pflege bei der Beratung.');
  }
  if (isPmuRefresh) {
    return compose('💄', 'PMU-Auffrischung — Form und Intensität 12+ Monate nach der Erstbehandlung wiederherstellen.', '🌸 Intensität an aktuellen Pigmentstand und Ihre Wünsche angepasst.', '🌿 Heilung wie bei der Erstbehandlung, ~4 Wochen.');
  }
  if (isPmuCombo) {
    return compose('💄', 'PMU-Kombi — zwei Techniken in einem Termin, z. B. **Powder Brows + Wimpernkranz**. Zeitsparend, geschlossenes Ergebnis.', '🌸 Ideal für einen maximal "schon geschminkten" Look in einem Schritt.', '🌿 Heilung ~4 Wochen, wie eine Standard-PMU-Behandlung.');
  }

  // ── Generic fallback (uses DB description if available) ───────────
  const genericIntro =
    description?.trim() ??
    (locale === 'ru'
      ? `Это услуга из нашего каталога. Подберём формат, мастера и ближайшее время.`
      : locale === 'en'
        ? `This service is available in our catalog. I can help choose format, specialist and nearest time.`
        : `Diese Leistung ist in unserem Katalog verfügbar. Ich helfe bei Auswahl von Format, Meisterin und nächstem Termin.`);
  return compose('🌸', genericIntro, null, null);
}

function isConsultationBookingConfirmIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;
  if (isAffirmativeFollowUp(text)) return true;

  if (locale === 'ru') {
    return (
      value.includes('да, запис') ||
      value.includes('да запис') ||
      value.includes('подтвержда') ||
      value.includes('записываем')
    );
  }
  if (locale === 'en') {
    return (
      value.includes('yes, book') ||
      value.includes('yes book') ||
      value.includes('confirm') ||
      value.includes('book this')
    );
  }
  return (
    value.includes('ja, buch') ||
    value.includes('ja buch') ||
    value.includes('bestatige') ||
    value.includes('bestätige')
  );
}

function isConsultationBookingDeclineIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;
  if (value === 'нет' || value === 'no' || value === 'nein') return true;

  if (locale === 'ru') {
    return (
      value.includes('другую услуг') ||
      value.includes('выбрать другую') ||
      value.includes('не эту')
    );
  }
  if (locale === 'en') {
    return value.includes('another service') || value.includes('not this');
  }
  return value.includes('andere leistung') || value.includes('nicht diese');
}

function looksLikeNameOnlyPayload(text: string): boolean {
  const value = text.trim();
  if (!value || value.length > 60) return false;
  if (/[?！？]/u.test(value)) return false;
  if (/\d/.test(value)) return false;

  const parts = value
    .replace(/[.,!;:]+/gu, ' ')
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

function shouldApplyScopeGuard(
  text: string,
  session: AiSession,
  options?: { voiceMode?: boolean },
): boolean {
  const voiceMode = Boolean(options?.voiceMode);
  const normalizedInput = normalizeInput(text);
  if (!normalizedInput) return false;
  const awaitingContact = Boolean(session.context.reservedSlot && !session.context.draftId);
  const awaitingOtp = Boolean(session.context.draftId);

  if (session.context.awaitingRegistrationMethod) {
    // During method-selection step allow only explicit method clicks/texts.
    if (detectRegistrationMethodChoice(text, { voiceMode })) return false;
    return true;
  }

  if (awaitingContact) {
    // Contact collection in voice mode is often free-form and noisy.
    // Avoid scope-guard loops while we are explicitly waiting for contact data.
    if (looksLikeContactPayload(text) || looksLikeNameOnlyPayload(text)) return false;
    if (session.context.pendingVerificationMethod) return false;
    return true;
  }

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

  // In consultation mode allow free-form consultation dialogue and do not
  // force menu/scope answers unless a booking flow is active.
  if (session.context.consultationMode) {
    return false;
  }

  // If any booking context exists, allow domain-adjacent free-form user phrasing.
  // This prevents accidental guard triggers in active voice flows.
  const hasAnyBookingState = Boolean(
    (session.context.selectedServiceIds?.length ?? 0) > 0 ||
      session.context.selectedMasterId ||
      session.context.reservedSlot ||
      session.context.draftId ||
      session.context.pendingVerificationMethod ||
      session.context.awaitingRegistrationMethod ||
      session.context.awaitingVerificationMethod ||
      session.context.lastDateISO ||
      (session.context.lastSuggestedDateOptions?.length ?? 0) > 0,
  );
  if (hasAnyBookingState) {
    return false;
  }

  // Always allow clearly booking-related messages.
  if (isLikelyBookingDomainMessage(text)) return false;

  // Outside booking scope: block any non-domain chat/small-talk/trivia.
  return true;
}

function buildScopeGuardText(
  locale: 'de' | 'ru' | 'en',
  hasActiveBookingFlow: boolean,
): string {
  const options = getKnowledgeMenuOptions(locale)
    .map((item) => `[option] ${item} [/option]`)
    .join('\n');

  if (locale === 'ru') {
    const header = hasActiveBookingFlow
      ? 'Я помогаю только с записью и вопросами о салоне. Давайте продолжим текущую запись.'
      : 'Я помогаю только с записью и вопросами о салоне.';
    const continueOption = hasActiveBookingFlow
      ? '[option] ✅ Продолжить запись [/option]\n'
      : '';
    return `${header}\n\n${continueOption}${options}`;
  }

  if (locale === 'en') {
    const header = hasActiveBookingFlow
      ? 'I can only help with salon bookings and service questions. Let us continue your current booking.'
      : 'I can only help with salon bookings and service questions.';
    const continueOption = hasActiveBookingFlow
      ? '[option] ✅ Continue booking [/option]\n'
      : '';
    return `${header}\n\n${continueOption}${options}`;
  }

  const header = hasActiveBookingFlow
    ? 'Ich helfe nur bei Terminbuchung und Salonfragen. Lassen Sie uns Ihre aktuelle Buchung fortsetzen.'
    : 'Ich helfe nur bei Terminbuchung und Salonfragen.';
  const continueOption = hasActiveBookingFlow
    ? '[option] ✅ Buchung fortsetzen [/option]\n'
    : '';
  return `${header}\n\n${continueOption}${options}`;
}

function buildMainMenuText(locale: 'de' | 'ru' | 'en'): string {
  const options = getKnowledgeMenuOptions(locale)
    .map((item) => `[option] ${item} [/option]`)
    .join('\n');

  if (locale === 'ru') {
    return `Готово, вернула в начало 🌸 Чем могу помочь?\n\n${options}`;
  }
  if (locale === 'en') {
    return `Done, I returned to the main menu 🌸 How can I help?\n\n${options}`;
  }
  return `Erledigt, ich bin zurück im Hauptmenü 🌸 Wobei kann ich helfen?\n\n${options}`;
}

function isGreetingIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  if (isLikelyBookingDomainMessage(text)) return false;
  if (looksLikeServiceOptionPayload(text) || looksLikePricedOptionPayload(text)) return false;

  const normalized = normalizeInput(text)
    .replace(/ё/g, 'е')
    .replace(/[!?.,;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return false;

  const maxTokens = 5;
  if (normalized.split(' ').length > maxTokens) return false;

  if (locale === 'ru') {
    const greetings = new Set([
      'привет',
      'приветик',
      'здравствуй',
      'здравствуйте',
      'доброе утро',
      'добрый день',
      'добрый вечер',
      'салют',
    ]);
    return greetings.has(normalized);
  }
  if (locale === 'en') {
    const greetings = new Set([
      'hi',
      'hello',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
    ]);
    return greetings.has(normalized);
  }

  const greetings = new Set([
    'hallo',
    'hi',
    'hey',
    'guten morgen',
    'guten tag',
    'guten abend',
    'servus',
    'moin',
  ]);
  return greetings.has(normalized);
}

function buildGreetingText(locale: 'de' | 'ru' | 'en'): string {
  if (locale === 'ru') {
    return 'Привет! 👋 Рада тебя видеть. Я помогу записаться, подобрать услугу или подсказать цены и свободное время. Что выберем?';
  }
  if (locale === 'en') {
    return 'Hello! 👋 Nice to see you. I can help with booking, choosing a service, prices, and available time slots. What would you like to do?';
  }
  return 'Hallo! 👋 Schön, Sie zu sehen. Ich helfe bei Terminbuchung, Serviceauswahl, Preisen und freien Zeiten. Womit möchten Sie starten?';
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

function buildCancelBookingOption(locale: 'de' | 'ru' | 'en'): string {
  return locale === 'ru'
    ? '[option] ❌ Отменить текущую запись [/option]'
    : locale === 'en'
      ? '[option] ❌ Cancel current booking [/option]'
      : '[option] ❌ Aktuelle Buchung abbrechen [/option]';
}

function buildNoSlotsFollowUpText(
  locale: 'de' | 'ru' | 'en',
  optionsMap: DateSuggestionOption[],
): string {
  const cancelOption = buildCancelBookingOption(locale);
  if (optionsMap.length === 0) {
    if (locale === 'ru') {
      return `К сожалению, в ближайшие даты свободных окон не нашлось. Хотите, я проверю другого мастера?\n\n${cancelOption}`;
    }
    if (locale === 'en') {
      return `Unfortunately, I could not find free slots in the nearest dates. Do you want me to check another master?\n\n${cancelOption}`;
    }
    return `Leider habe ich in den nächsten Tagen keine freien Slots gefunden. Soll ich einen anderen Meister prüfen?\n\n${cancelOption}`;
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

  return `${header}\n\n${options}\n${cancelOption}\n\n${manualHint}`;
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
  const m = value.match(
    /(?:^|[^\p{L}\p{N}])(\d{1,2})[./-](\d{1,2})(?:$|[^\p{L}\p{N}])/u,
  );
  if (!m) return null;
  const day = Number.parseInt(m[1], 10);
  const month = Number.parseInt(m[2], 10);
  if (Number.isNaN(day) || Number.isNaN(month)) return null;
  if (day < 1 || day > 31) return null;
  if (month < 1 || month > 12) return null;
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`;
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

function parseMonthNameDateInputToISO(
  input: string,
  referenceDateISO: string,
): string | null {
  const normalized = normalizeInput(input).replace(/ё/g, 'е');
  const ruMatch = normalized.match(
    /(?:^|[^\p{L}\p{N}])(\d{1,2})\s+(январ[ья]?|феврал[ья]?|март[а]?|апрел[ья]?|ма[йя]|июн[ья]?|июл[ья]?|август[а]?|сентябр[ья]?|октябр[ья]?|ноябр[ья]?|декабр[ья]?)(?:$|[^\p{L}\p{N}])/u,
  );

  if (!ruMatch) return null;

  const day = Number.parseInt(ruMatch[1], 10);
  const monthToken = ruMatch[2].toLowerCase();
  const month = RU_MONTH_NUMBER_MAP[monthToken];
  if (!day || !month) return null;

  const referenceYear = Number.parseInt(referenceDateISO.slice(0, 4), 10);
  const fallbackYear = Number.isInteger(referenceYear)
    ? referenceYear
    : new Date().getUTCFullYear();

  let candidate = toISODate(fallbackYear, month, day);
  if (!candidate) return null;

  if (candidate < referenceDateISO) {
    const nextYearCandidate = toISODate(fallbackYear + 1, month, day);
    if (nextYearCandidate) {
      candidate = nextYearCandidate;
    }
  }

  return candidate;
}

function parseFlexibleDateInputToISO(
  input: string,
  referenceDateISO: string,
): string | null {
  return (
    parseExplicitDateInputToISO(input, referenceDateISO) ??
    parseMonthNameDateInputToISO(input, referenceDateISO)
  );
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
  const cancelOption = buildCancelBookingOption(locale);
  const label = formatDateLabel(dateISO, locale);
  if (slots.length === 0) {
    if (locale === 'ru') {
      return `На ${label} свободных слотов нет. Хотите, я предложу другие даты?\n\n${cancelOption}`;
    }
    if (locale === 'en') {
      return `There are no free slots on ${label}. Do you want me to suggest other dates?\n\n${cancelOption}`;
    }
    return `Für ${label} gibt es keine freien Slots. Soll ich andere Tage vorschlagen?\n\n${cancelOption}`;
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

  return `${header}\n\n${options}\n${cancelOption}`;
}

function buildSlotTakenAlternativesText(
  locale: 'de' | 'ru' | 'en',
  dateISO: string,
  slots: Array<{ displayTime: string }>,
): string {
  const cancelOption = buildCancelBookingOption(locale);
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

  return `${intro}\n${followUp}\n${options}\n${cancelOption}`;
}

function matchSlotFromInput(
  input: string,
  slots: Array<{ startAt: string; endAt: string; displayTime: string }>,
): { startAt: string; endAt: string; displayTime: string } | null {
  const normalized = normalizeInput(input).replace(/ё/g, 'е');
  if (!normalized || slots.length === 0) return null;

  const normalizedRanges = slots.map((slot) => {
    const range = normalizeInput(slot.displayTime).replace(/\s+/g, '');
    const start = range.split(/[–-]/)[0];
    return { slot, range, start };
  });

  const compactInput = normalized.replace(/\s+/g, '');

  for (const item of normalizedRanges) {
    if (
      compactInput === item.range ||
      compactInput.includes(item.range) ||
      compactInput.includes(item.start)
    ) {
      return item.slot;
    }
  }

  const preferredStart = extractPreferredStartTimeInput(normalized);
  if (!preferredStart) return null;

  return (
    normalizedRanges.find((item) => item.start.startsWith(preferredStart))?.slot ??
    null
  );
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

  if (opts.error === 'EMAIL_FORMAT_INVALID') {
    if (locale === 'ru') {
      return 'Не удалось отправить код: email указан в неверном формате.\n\nПожалуйста, укажите корректный email в формате `name@example.com`.';
    }
    if (locale === 'en') {
      return 'Could not send code: email format is invalid.\n\nPlease provide a valid email in the `name@example.com` format.';
    }
    return 'Der Code konnte nicht gesendet werden: E-Mail-Format ist ungültig.\n\nBitte geben Sie eine korrekte E-Mail im Format `name@example.com` an.';
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
  options?: { voiceMode?: boolean },
): string {
  const voiceMode = Boolean(options?.voiceMode);
  if (locale === 'ru') {
    if (method === 'email_otp') {
      return 'Вы выбрали подтверждение по Email.\nПожалуйста, укажите ваше имя и адрес электронной почты для завершения записи.\nВаши данные будут использоваться только для управления записью.';
    }
    if (method === 'sms_otp') {
      if (voiceMode) {
        return 'Вы выбрали подтверждение по SMS.\nПожалуйста, укажите ваше имя и номер телефона для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
      }
      return 'Вы выбрали подтверждение по SMS.\nПожалуйста, укажите ваше имя, номер телефона и адрес электронной почты для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
    }
    if (voiceMode) {
      return 'Вы выбрали подтверждение через Telegram.\nПожалуйста, укажите ваше имя и номер телефона (привязанный к Telegram-боту) для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
    }
    return 'Вы выбрали подтверждение через Telegram.\nПожалуйста, укажите ваше имя, номер телефона (привязанный к Telegram-боту) и адрес электронной почты для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
  }

  if (locale === 'en') {
    if (method === 'email_otp') {
      return 'You chose Email verification.\nPlease provide your name and email address to finish the booking.\nYour data will only be used for appointment management.';
    }
    if (method === 'sms_otp') {
      if (voiceMode) {
        return 'You chose SMS verification.\nPlease provide your name and phone number to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
      }
      return 'You chose SMS verification.\nPlease provide your name, phone number, and email address to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
    }
    if (voiceMode) {
      return 'You chose Telegram verification.\nPlease provide your name and phone number (linked to our Telegram bot) to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
    }
    return 'You chose Telegram verification.\nPlease provide your name, phone number (linked to our Telegram bot), and email address to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
  }

  if (method === 'email_otp') {
    return 'Sie haben E-Mail-Verifizierung gewählt.\nBitte geben Sie Ihren Namen und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nIhre Daten werden nur zur Terminverwaltung verwendet.';
  }
  if (method === 'sms_otp') {
    if (voiceMode) {
      return 'Sie haben SMS-Verifizierung gewählt.\nBitte geben Sie Ihren Namen und Ihre Telefonnummer an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
    }
    return 'Sie haben SMS-Verifizierung gewählt.\nBitte geben Sie Ihren Namen, Ihre Telefonnummer und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
  }
  if (voiceMode) {
    return 'Sie haben Telegram-Verifizierung gewählt.\nBitte geben Sie Ihren Namen und Ihre Telefonnummer (mit Telegram-Bot verknüpft) an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
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

function normalizeServiceHintTypos(
  value: string,
  locale: 'de' | 'ru' | 'en',
): string {
  let fixed = value;

  if (locale === 'ru') {
    fixed = fixed
      .replace(/\bмаинкюр\b/gu, 'маникюр')
      .replace(/\bманикур\b/gu, 'маникюр')
      .replace(/\bпермамент\b/gu, 'перманент')
      .replace(/\bперманет\b/gu, 'перманент')
      .replace(/\bстришка\b/gu, 'стрижка');
  } else if (locale === 'en') {
    fixed = fixed
      .replace(/\bmanucure\b/gu, 'manicure')
      .replace(/\bpeducure\b/gu, 'pedicure')
      .replace(/\bhair cut\b/gu, 'haircut');
  } else {
    fixed = fixed
      .replace(/\bmanikur\b/gu, 'manikure')
      .replace(/\bhaar schnitt\b/gu, 'haarschnitt');
  }

  return fixed.trim();
}

function extractServiceSelectionInput(
  text: string,
  locale: 'de' | 'ru' | 'en',
): string {
  const normalized = normalizeInput(text).replace(/ё/g, 'е').trim();
  if (!normalized) return normalized;

  let candidate = normalized;

  if (locale === 'ru') {
    candidate = candidate
      .replace(
        /^(?:пожалуйста\s+)?(?:хочу\s+)?(?:запис(?:аться|ать)?|запись)\s*(?:на\s*)?(?:прием|приём)?\s*(?:на\s*)?/u,
        '',
      )
      .replace(/^(?:мне\s+)?(?:нужно\s+)?(?:запись|записаться)\s*(?:на\s*)?/u, '')
      .trim();
  } else if (locale === 'en') {
    candidate = candidate
      .replace(
        /^(?:please\s+)?(?:i\s+want\s+to\s+|i\s+would\s+like\s+to\s+)?(?:book|schedule)\s*(?:an?\s*)?(?:appointment|slot)?\s*(?:for\s*)?/u,
        '',
      )
      .trim();
  } else {
    candidate = candidate
      .replace(
        /^(?:bitte\s+)?(?:ich\s+m(?:o|ö)chte\s+)?(?:buchen|termin\s+buchen|einen?\s+termin\s+buchen)\s*(?:fur|für)?\s*/u,
        '',
      )
      .trim();
  }

  const effective = candidate || normalized;
  return normalizeServiceHintTypos(effective, locale);
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
  groupTitle?: string,
): string {
  const minutes = locale === 'ru' ? 'мин.' : 'min.';
  const icon = categoryEmoji(groupTitle ?? '');
  return `[option] ${icon} ${service.title} — ${service.durationMin} ${minutes}, ${formatPrice(locale, service.priceCents)} [/option]`;
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

function buildServiceAvailabilityGroupText(
  locale: 'de' | 'ru' | 'en',
  categoryTitle: string,
  options: string[],
  hasActiveBookingFlow: boolean,
): string {
  const continueOption = hasActiveBookingFlow
    ? locale === 'ru'
      ? '\n[option] ✅ Продолжить текущую запись [/option]'
      : locale === 'en'
        ? '\n[option] ✅ Continue current booking [/option]'
        : '\n[option] ✅ Aktuelle Buchung fortsetzen [/option]'
    : '';

  if (locale === 'ru') {
    return `Да, у нас есть услуги в категории "${categoryTitle}" 🌸\n\n${options.join('\n')}${continueOption}\n\nВыберите услугу, и я помогу с записью.`;
  }
  if (locale === 'en') {
    return `Yes, we offer services in "${categoryTitle}" 🌸\n\n${options.join('\n')}${continueOption}\n\nChoose a service and I will help with booking.`;
  }
  return `Ja, wir bieten Leistungen in der Kategorie "${categoryTitle}" an 🌸\n\n${options.join('\n')}${continueOption}\n\nWählen Sie eine Leistung, dann helfe ich mit der Buchung.`;
}

function buildServiceAvailabilitySingleText(
  locale: 'de' | 'ru' | 'en',
  serviceTitle: string,
  groupTitle: string,
  hasActiveBookingFlow: boolean,
): string {
  const serviceOption = `[option] ${categoryEmoji(groupTitle)} ${serviceTitle} [/option]`;
  const continueOption = hasActiveBookingFlow
    ? locale === 'ru'
      ? '\n[option] ✅ Продолжить текущую запись [/option]'
      : locale === 'en'
        ? '\n[option] ✅ Continue current booking [/option]'
        : '\n[option] ✅ Aktuelle Buchung fortsetzen [/option]'
    : '';

  if (locale === 'ru') {
    return `Да, услуга "${serviceTitle}" есть в нашем каталоге 🌸\n\n${serviceOption}${continueOption}\n\nЕсли хотите, перейдем к выбору даты и времени.`;
  }
  if (locale === 'en') {
    return `Yes, "${serviceTitle}" is available in our catalog 🌸\n\n${serviceOption}${continueOption}\n\nIf you want, we can continue with date and time selection.`;
  }
  return `Ja, "${serviceTitle}" ist in unserem Katalog verfügbar 🌸\n\n${serviceOption}${continueOption}\n\nWenn Sie möchten, machen wir direkt mit Datum und Uhrzeit weiter.`;
}

function buildServiceAvailabilityNotFoundText(
  locale: 'de' | 'ru' | 'en',
  options: string[],
  hasActiveBookingFlow: boolean,
): string {
  const continueOption = hasActiveBookingFlow
    ? locale === 'ru'
      ? '\n[option] ✅ Продолжить текущую запись [/option]'
      : locale === 'en'
        ? '\n[option] ✅ Continue current booking [/option]'
        : '\n[option] ✅ Aktuelle Buchung fortsetzen [/option]'
    : '';

  if (locale === 'ru') {
    return `Похоже, такой услуги сейчас нет в активном каталоге.\n\n${options.join('\n')}${continueOption}\n\nМогу предложить доступные категории выше.`;
  }
  if (locale === 'en') {
    return `It looks like this service is not available in the active catalog right now.\n\n${options.join('\n')}${continueOption}\n\nI can offer available categories above.`;
  }
  return `Diese Leistung ist aktuell nicht im aktiven Katalog verfügbar.\n\n${options.join('\n')}${continueOption}\n\nIch kann Ihnen verfügbare Kategorien oben anbieten.`;
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
  const cancelOption = buildCancelBookingOption(locale);
  if (locale === 'ru') {
    return `Вы выбрали услугу "${serviceTitle}".\n\nЭту услугу выполнит мастер ${masterName}.\n\nСначала выберите дату, затем время:\n\n[option] 📅 Завтра [/option]\n[option] 📅 Ближайшая дата [/option]\n${cancelOption}\n\nИли напишите дату в формате ДД.ММ.`;
  }
  if (locale === 'en') {
    return `You selected "${serviceTitle}".\n\nThis service can be done by ${masterName}.\n\nPlease choose a date first, then we will pick time:\n\n[option] 📅 Tomorrow [/option]\n[option] 📅 Nearest date [/option]\n${cancelOption}\n\nOr type a date in DD.MM format.`;
  }
  return `Sie haben die Leistung "${serviceTitle}" gewählt.\n\nDiese Leistung übernimmt ${masterName}.\n\nBitte wählen Sie zuerst ein Datum, danach die Uhrzeit:\n\n[option] 📅 Morgen [/option]\n[option] 📅 Nächstes Datum [/option]\n${cancelOption}\n\nOder schreiben Sie ein Datum im Format TT.MM.`;
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
      ? [
          'новый термин',
          'новая запись',
          'новую запись',
          'хочу новую запись',
          'хочу новый термин',
          'новый прием',
          'новый приём',
          'начать заново',
        ]
      : locale === 'en'
        ? ['new appointment', 'new booking', 'start over', 'book again']
        : ['neuer termin', 'neue buchung', 'neu anfangen', 'erneut buchen'];

  if (restartPhrases.some((p) => value.includes(p))) return true;
  if (locale === 'ru' && /нов(ый|ую)\s+(термин|запис)/u.test(value)) return true;

  const startPhrases =
    locale === 'ru'
      ? [
          'записаться на приём',
          'записаться на прием',
          'записаться',
          'хочу записаться',
          'продолжить запись',
          'подобрать время и записаться',
          'подобрать время',
        ]
      : locale === 'en'
        ? [
            'book appointment',
            'book a slot',
            'continue booking',
            'i want to book',
            'pick time and book',
          ]
        : [
            'termin buchen',
            'buchung starten',
            'buchung fortsetzen',
            'ich möchte buchen',
            'zeit finden und buchen',
          ];

  if (!hasActiveBookingFlow) {
    return startPhrases.some((p) => value.includes(p));
  }

  // In active flow, restart only on explicit re-entry asks; avoid accidental resets
  // on vague CTA clicks like "подобрать время".
  const reentryPhrases =
    locale === 'ru'
      ? [
          'записаться на приём',
          'записаться на прием',
          'записаться',
          'хочу записаться',
        ]
      : locale === 'en'
        ? ['book appointment', 'i want to book', 'book now']
        : ['termin buchen', 'ich möchte buchen', 'jetzt buchen'];

  return reentryPhrases.some((p) => value.includes(p));
}

function isChangeServiceIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;

  if (locale === 'ru') {
    const phrases = [
      'новая услуга',
      'другая услуга',
      'другую услугу',
      'назад к услугам',
      'назад к выбору услуг',
      'назад к выбору услуги',
      'вернуться к услугам',
      'возврат к услугам',
      'сменить услугу',
      'смени услугу',
      'поменять услугу',
      'выбрать другую услугу',
      'хочу другую услугу',
    ];
    return phrases.some((p) => value.includes(p));
  }

  if (locale === 'en') {
    const phrases = [
      'new service',
      'another service',
      'back to services',
      'return to services',
      'change service',
      'switch service',
      'choose another service',
    ];
    return phrases.some((p) => value.includes(p));
  }

  const phrases = [
    'neue leistung',
    'andere leistung',
    'zuruck zu leistungen',
    'zurück zu leistungen',
    'leistung wechseln',
    'andere dienstleistung',
  ];
  return phrases.some((p) => value.includes(p));
}

function isCancelBookingIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;

  if (locale === 'ru') {
    const phrases = [
      'отмени запись',
      'отмена записи',
      'отменить запись',
      'отмени текущую запись',
      'отменить текущую запись',
      'отменить бронь',
      'отмени бронь',
      'отмена брони',
      'сбрось запись',
    ];
    return phrases.some((p) => value.includes(p));
  }

  if (locale === 'en') {
    const phrases = [
      'cancel booking',
      'cancel appointment',
      'cancel my booking',
      'cancel current booking',
      'cancel the current booking',
    ];
    return phrases.some((p) => value.includes(p));
  }

  const phrases = [
    'buchung abbrechen',
    'termin absagen',
    'aktuelle buchung abbrechen',
    'aktuelle buchung stornieren',
    'buchung stornieren',
  ];
  return phrases.some((p) => value.includes(p));
}

function isResetToMainMenuIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;

  if (locale === 'ru') {
    const phrases = [
      'верни на самое начало',
      'верни на начало',
      'верни на главную',
      'вернись в самое начало',
      'вернуться в самое начало',
      'вернись в начало',
      'вернись на начало',
      'вернуться в начало',
      'вернуться на начало',
      'перейди на главную',
      'перейди в главное меню',
      'назад в главное меню',
      'назад в меню',
      'вернуться в главное меню',
      'на главную',
      'в главное меню',
      'главная страница',
      'главная',
      'в самое начало',
      'в начало',
      'главное меню',
      'начать сначала',
      'начни сначала',
      'сбрось диалог',
      'сбрось чат',
      'к всем услугам',
      'ко всем услугам',
      'все услуги',
      'все категории',
      'выбрать другую категорию',
      'к категориям',
    ];
    return phrases.some((p) => value.includes(p));
  }

  if (locale === 'en') {
    const phrases = [
      'back to start',
      'return to start',
      'go to main menu',
      'main menu',
      'start from beginning',
      'reset chat',
      'all services',
      'all categories',
      'back to categories',
      'show all',
    ];
    return phrases.some((p) => value.includes(p));
  }

  const phrases = [
    'zuruck zum anfang',
    'zurück zum anfang',
    'zum anfang',
    'hauptmenu',
    'hauptmenü',
    'neu starten',
    'chat zurucksetzen',
    'chat zurücksetzen',
    'alle leistungen',
    'alle kategorien',
    'zurück zu den kategorien',
    'andere kategorie wählen',
    'andere kategorie waehlen',
  ];
  return phrases.some((p) => value.includes(p));
}

function isConsultationBookOptionIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;

  if (locale === 'ru') {
    return (
      value.includes('подобрать время и записаться') ||
      value === 'подобрать время'
    );
  }
  if (locale === 'en') {
    return value.includes('pick time and book');
  }
  return value.includes('zeit finden und buchen');
}

function isConsultationSpecificBookingIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;

  if (locale === 'ru') {
    return (
      value.includes('записаться на ') ||
      value.includes('да записаться на ') ||
      value.includes('хочу записаться на ')
    );
  }
  if (locale === 'en') {
    return (
      value.includes('book ') ||
      value.includes('i want to book ')
    );
  }
  return (
    value.includes('buchen ') ||
    value.includes('ich mochte buchen ') ||
    value.includes('ich möchte buchen ')
  );
}

function isConsultationIntent(text: string, locale: 'de' | 'ru' | 'en'): boolean {
  return isConsultationIntentByKnowledge(text, locale);
}

function isConsultationTopicAutoStartIntent(
  text: string,
  locale: 'de' | 'ru' | 'en',
): boolean {
  const value = normalizeInput(text).replace(/ё/g, 'е');
  if (!value) return false;
  if (looksLikeServiceOptionPayload(text) || looksLikePricedOptionPayload(text)) return false;
  if (isConsultationSpecificBookingIntent(text, locale)) return false;
  if (isBookingStartIntent(text, locale, false)) return false;

  const hasSelectionVerb = /\b(запис|выб|book|buchen|choose|select|auswahl)\b/u.test(value);
  if (hasSelectionVerb) return false;

  if (isKnowledgeDetailsIntent(text, locale)) return true;
  if (/[?？]/u.test(text)) return true;

  if (locale === 'ru') {
    const cues = ['расскажи', 'подскажи', 'объясни', 'что', 'какие', 'какой', 'как', 'для кого', 'кому подходит'];
    return cues.some((cue) => value.includes(cue));
  }
  if (locale === 'en') {
    const cues = ['tell me', 'explain', 'what', 'which', 'how', 'who is it for', 'for whom'];
    return cues.some((cue) => value.includes(cue));
  }
  const cues = ['erzahl', 'erzähl', 'erklar', 'erklär', 'was', 'welche', 'wie', 'fur wen', 'für wen'];
  return cues.some((cue) => value.includes(cue));
}

function buildConsultationStartText(
  locale: 'de' | 'ru' | 'en',
  groups: SelectionCatalogGroup[] = [],
): string {
  const intro =
    buildKnowledgeConsultationStartText(locale).split('\n\n[option]')[0]?.trim() ?? '';

  const activeGroups = groups.filter((group) => group.services.length > 0);

  if (activeGroups.length === 0) {
    return locale === 'ru'
      ? 'Сейчас не удалось загрузить активный каталог услуг. Могу попробовать ещё раз или помочь с общими вопросами по салону.'
      : locale === 'en'
        ? 'I could not load the active service catalog right now. I can try again or help with general salon questions.'
        : 'Ich konnte den aktiven Leistungskatalog gerade nicht laden. Ich kann es erneut versuchen oder allgemeine Fragen zum Salon beantworten.';
  }

  // Show only beauty-consultation-relevant categories in the consultation menu.
  // Haircut, manicure, microneedling etc. are bookable but don't need a
  // guided PMU/beauty consultation flow — they go straight to booking.
  const isConsultationCategory = (title: string): boolean => {
    const v = normalizeChoiceText(title);
    return (
      v.includes('перманент') || v.includes('permanent') || v.includes('pmu') ||
      v.includes('brow') || v.includes('augenbrau') || v.includes('бров') ||
      v.includes('ресниц') || v.includes('wimper') || v.includes('lash') ||
      v.includes('наращ') ||
      v.includes('hydra') || v.includes('гидра') ||
      v.includes('микронидл') || v.includes('microneedl') || v.includes('мезо')
    );
  };

  const consultationGroups = activeGroups.filter((g) => isConsultationCategory(g.title));
  const otherGroups = activeGroups.filter((g) => !isConsultationCategory(g.title));

  // Build options: curated consultation topics first, then a single "other services" shortcut
  const consultationOptions = consultationGroups
    .map((group) => `[option] ${categoryEmoji(group.title)} ${group.title} [/option]`);

  const bookOtherOption = otherGroups.length > 0
    ? locale === 'ru'
      ? `[option] 📅 Другие услуги и запись [/option]`
      : locale === 'en'
        ? `[option] 📅 Other services & booking [/option]`
        : `[option] 📅 Andere Leistungen & Buchen [/option]`
    : null;

  const allOptions = [
    ...consultationOptions,
    ...(bookOtherOption ? [bookOtherOption] : []),
  ];

  if (allOptions.length === 0) {
    // Fallback: show everything
    const fallbackOptions = activeGroups
      .slice(0, 8)
      .map((group) => `[option] ${categoryEmoji(group.title)} ${group.title} [/option]`);
    const ask =
      locale === 'ru'
        ? 'Выберите категорию:'
        : locale === 'en'
          ? 'Choose a category:'
          : 'Wählen Sie eine Kategorie:';
    return `${intro}\n\n${ask}\n${fallbackOptions.join('\n')}`;
  }

  const ask =
    locale === 'ru'
      ? 'Выберите направление, и я помогу подобрать подходящую услугу:'
      : locale === 'en'
        ? 'Choose a topic and I will help find the right service for you:'
        : 'Wählen Sie ein Thema, und ich helfe bei der passenden Leistung:';

  return `${intro}\n\n${ask}\n${allOptions.join('\n')}`;
}

function consultationTopicMatchesGroup(
  topic: ConsultationTopic,
  groupTitle: string,
): boolean {
  const value = normalizeChoiceText(groupTitle);
  if (topic === 'pmu') {
    return (
      value.includes('pmu') ||
      value.includes('permanent') ||
      value.includes('перманент')
    );
  }
  if (topic === 'brows_lashes') {
    return (
      !consultationTopicMatchesGroup('pmu', groupTitle) &&
      (
        value.includes('brow') ||
        value.includes('lash') ||
        value.includes('wimper') ||
        value.includes('augenbrau') ||
        value.includes('бров') ||
        value.includes('ресниц')
      )
    );
  }
  if (topic === 'hydrafacial') {
    return value.includes('hydra') || value.includes('hydrafacial');
  }
  return false;
}

function consultationTopicMatchesService(
  topic: ConsultationTopic,
  groupTitle: string,
  serviceTitle: string,
): boolean {
  if (consultationTopicMatchesGroup(topic, groupTitle)) return true;

  const value = normalizeChoiceText(`${groupTitle} ${serviceTitle}`);
  if (topic === 'pmu') {
    return (
      value.includes('pmu') ||
      value.includes('permanent') ||
      value.includes('перманент') ||
      value.includes('powder') ||
      value.includes('hairstroke') ||
      value.includes('aquarell') ||
      value.includes('wimpernkranz') ||
      value.includes('межреснич')
    );
  }
  if (topic === 'brows_lashes') {
    return (
      !consultationTopicMatchesGroup('pmu', groupTitle) &&
      (
        value.includes('brow') ||
        value.includes('lash') ||
        value.includes('wimper') ||
        value.includes('augenbrau') ||
        value.includes('бров') ||
        value.includes('ресниц') ||
        value.includes('lifting') ||
        value.includes('styling')
      )
    );
  }
  if (topic === 'hydrafacial') {
    return value.includes('hydra') || value.includes('hydrafacial');
  }
  return false;
}

function buildConsultationTopicText(
  locale: 'de' | 'ru' | 'en',
  topic: ConsultationTopic,
  groups: SelectionCatalogGroup[],
): string {
  if (topic === 'nails' || topic === 'hair') {
    const activeOptions = groups
      .filter((group) => group.services.length > 0)
      .slice(0, 6)
      .map((group) => `[option] ${categoryEmoji(group.title)} ${group.title} [/option]`);
    const suffix = activeOptions.length > 0 ? `\n\n${activeOptions.join('\n')}` : '';
    return locale === 'ru'
      ? `Этой услуги сейчас нет в активном каталоге салона.${suffix}`
      : locale === 'en'
        ? `This service is not available in the active salon catalog right now.${suffix}`
        : `Diese Leistung ist aktuell nicht im aktiven Salon-Katalog verfügbar.${suffix}`;
  }

  const matchedGroups = groups
    .map((group) => ({
      ...group,
      services: group.services.filter((service) =>
        consultationTopicMatchesService(topic, group.title, service.title),
      ),
    }))
    .filter((group) => group.services.length > 0);

  const serviceOptions = matchedGroups.flatMap((group) =>
    group.services
      .slice(0, 6)
      .map((service) => formatServiceOption(locale, service, group.title)),
  ).slice(0, 8);

  if (serviceOptions.length === 0) {
    return buildConsultationStartText(locale, groups);
  }

  const intro =
    topic === 'pmu'
      ? locale === 'ru'
        ? 'Отлично, подберём PMU по актуальному каталогу 🌸'
        : locale === 'en'
          ? "Great, let's choose PMU from the current catalog 🌸"
          : 'Sehr gern, wir wählen PMU aus dem aktuellen Katalog 🌸'
      : topic === 'brows_lashes'
        ? locale === 'ru'
          ? 'Супер, подберём брови/ресницы из актуальных услуг 🌸'
          : locale === 'en'
            ? "Perfect, let's choose brows/lashes from the current services 🌸"
            : 'Super, wir wählen Brows/Lashes aus den aktuellen Leistungen 🌸'
        : locale === 'ru'
          ? 'Хороший выбор, подберём Hydrafacial из актуального каталога 🌿'
          : locale === 'en'
            ? "Good choice, let's choose Hydrafacial from the current catalog 🌿"
            : 'Gute Wahl, wir wählen Hydrafacial aus dem aktuellen Katalog 🌿';

  const ask =
    locale === 'ru'
      ? 'Какой вариант смотрим?'
      : locale === 'en'
        ? 'Which option should we look at?'
        : 'Welche Option schauen wir uns an?';

  return `${intro}\n\n${serviceOptions.join('\n')}\n\n${ask}`;
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
    value.includes('бров') ||
    value.includes('наращ') ||
    value.includes('wimper') ||
    value.includes('lash')
  ) {
    return '✨';
  }
  if (value.includes('маник') || value.includes('nagel') || value.includes('ногт')) return '💅';
  if (value.includes('перманент') || value.includes('permanent') || value.includes('pmu')) {
    return '💄';
  }
  if (
    value.includes('стриж') ||
    value.includes('haarschnitt') ||
    value.includes('hair') ||
    value.includes('женск') ||
    value.includes('мужск') ||
    value.includes('weiblich') ||
    value.includes('männlich') ||
    value.includes('окраш') ||
    value.includes('farbe') ||
    value.includes('färb') ||
    value.includes('coloring')
  ) {
    return '✂️';
  }
  if (value.includes('hydrafacial') || value.includes('hydra')) return '💧';
  if (value.includes('педик') || value.includes('fuß') || value.includes('pedik')) return '🦶';
  if (
    value.includes('микронидл') ||
    value.includes('microneedl') ||
    value.includes('мезо') ||
    value.includes('meso')
  ) {
    return '🔬';
  }
  return '🌸';
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

/**
 * Lightweight check: does the user's message look like a click on a current
 * catalog group title or service name (without obvious price/option markers)?
 *
 * Used inside the consultation flow so that typing/clicking e.g. "Микронидлинг"
 * while in a different consultation topic still routes to that group rather
 * than bouncing back to the same consultation menu.
 *
 * Returns true when the normalized input exactly matches an active group title
 * OR is a strong substring match of an active group/service title.
 */
async function isLikelyCatalogGroupOrServiceName(
  text: string,
  locale: 'de' | 'ru' | 'en',
): Promise<boolean> {
  const input = normalizeChoiceText(text);
  if (!input) return false;
  // Avoid touching obvious chat phrases (questions, multi-word free text)
  if (input.length < 3) return false;

  try {
    const catalog = await listServices({ locale });
    const groups = catalog.groups ?? [];
    for (const g of groups) {
      const groupNorm = normalizeChoiceText(g.title);
      if (!groupNorm) continue;
      // Exact group click
      if (input === groupNorm) return true;
      // User typed group title (possibly with extra words like "хочу записаться на хх")
      if (input.includes(groupNorm) && groupNorm.length >= 5) return true;
      for (const s of g.services) {
        const sNorm = normalizeChoiceText(s.title);
        if (!sNorm) continue;
        if (input === sNorm) return true;
        if (input.includes(sNorm) && sNorm.length >= 6) return true;
      }
    }
  } catch {
    // If the catalog lookup fails, defer to other checks
  }
  return false;
}

async function tryHandleCatalogSelectionFastPath(
  session: AiSession,
  sessionId: string,
  message: string,
): Promise<ChatResponse | null> {
  const input = normalizeCatalogSelectionInput(message);
  if (!input) return null;
  const normalizedMessage = normalizeInput(message);
  const inputTokens = tokenizeNormalized(input);
  const explicitCatalogPayload =
    looksLikeServiceOptionPayload(message) || looksLikePricedOptionPayload(message);
  const hasSelectionVerb = /\b(запис|выб|book|buchen|choose|select|auswahl)\b/u.test(
    normalizedMessage,
  );
  // Prevent accidental service auto-selection from long free-form prompts
  // (e.g. FAQ/consultation questions) that only weakly overlap with service titles.
  if (!explicitCatalogPayload && inputTokens.length > 8 && !hasSelectionVerb) {
    return null;
  }
  const contextServiceIds = session.context.selectedServiceIds ?? [];
  const isAwaitingMasterChoice =
    contextServiceIds.length > 0 && !session.context.selectedMasterId;
  if (input.length < 4 && !isAwaitingMasterChoice) return null;
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

  const flatServices = groups.flatMap((g) =>
    g.services.map((s) => ({
      ...s,
      groupTitle: g.title,
    })),
  );

  // If service is already selected but master is not, treat message as master choice first.
  if (isAwaitingMasterChoice) {
    const startedMasters = Date.now();
    const mastersResult = await listMastersForServices({ serviceIds: contextServiceIds });
    const mastersDurationMs = Date.now() - startedMasters;
    const masters = mastersResult.masters ?? [];

    if (masters.length > 1) {
      const matchedMaster = chooseBestMatch(
        masters,
        (m) => normalizeChoiceText(m.name),
        input,
      );

      if (matchedMaster) {
        const matchedNorm = normalizeChoiceText(matchedMaster.name);
        const isStrongMasterMatch =
          input === matchedNorm ||
          input.includes(matchedNorm) ||
          matchedNorm.includes(input);

        if (isStrongMasterMatch) {
          const effectiveServiceIds =
            mastersResult.matchedServiceIds?.length
              ? mastersResult.matchedServiceIds
              : contextServiceIds;
          const serviceTitle =
            flatServices.find((s) => s.id === effectiveServiceIds[0])?.title ??
            (session.locale === 'ru'
              ? 'выбранная услуга'
              : session.locale === 'en'
                ? 'selected service'
                : 'gewählte Leistung');

          const text = buildSingleMasterText(
            session.locale,
            serviceTitle,
            matchedMaster.name,
          );

          appendSessionMessage(sessionId, 'assistant', text);
          upsertSession(sessionId, {
            context: {
              selectedServiceIds: effectiveServiceIds,
              selectedMasterId: matchedMaster.id,
              lastSuggestedDateOptions: undefined,
              lastDateISO: undefined,
              lastPreferredTime: undefined,
              lastNoSlots: false,
            },
          });

          console.log(
            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=master-picked master="${matchedMaster.name}" serviceIds=${effectiveServiceIds.length}`,
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
      }
    }
  }

  const matchedService = chooseBestMatch(
    flatServices,
    (s) => normalizeChoiceText(s.title),
    input,
  );

  const matchedGroup = chooseBestMatch(
    groups,
    (g) => normalizeChoiceText(g.title),
    input,
  );

  if (isServiceAvailabilityInquiry(message, session.locale)) {
    const matchedGroupScore = matchedGroup
      ? choiceScore(normalizeChoiceText(matchedGroup.title), input)
      : 0;
    const matchedServiceScore = matchedService
      ? choiceScore(normalizeChoiceText(matchedService.title), input)
      : 0;

    if (
      matchedGroup &&
      matchedGroup.services.length > 0 &&
      matchedGroupScore >= 500 &&
      matchedGroupScore >= matchedServiceScore
    ) {
      const serviceOptions = matchedGroup.services
        .slice(0, 8)
        .map((s) => formatServiceOption(session.locale, s, matchedGroup.title));
      const text = buildServiceAvailabilityGroupText(
        session.locale,
        matchedGroup.title,
        serviceOptions,
        hasActiveServiceSelection,
      );
      appendSessionMessage(sessionId, 'assistant', text);

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-availability-group group="${matchedGroup.title}"`,
      );

      return {
        text,
        sessionId,
        toolCalls: [{ name: 'list_services', durationMs: listDurationMs }],
      };
    }

    if (matchedService && matchedServiceScore >= 500) {
      const text = buildServiceAvailabilitySingleText(
        session.locale,
        matchedService.title,
        matchedService.groupTitle,
        hasActiveServiceSelection,
      );
      appendSessionMessage(sessionId, 'assistant', text);

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-availability-service service="${matchedService.title}"`,
      );

      return {
        text,
        sessionId,
        toolCalls: [{ name: 'list_services', durationMs: listDurationMs }],
      };
    }

    const groupOptions = groups
      .slice(0, 6)
      .map((group) => `[option] ${categoryEmoji(group.title)} ${group.title} [/option]`);
    const text = buildServiceAvailabilityNotFoundText(
      session.locale,
      groupOptions,
      hasActiveServiceSelection,
    );
    appendSessionMessage(sessionId, 'assistant', text);

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-availability-not-found`,
    );

    return {
      text,
      sessionId,
      toolCalls: [{ name: 'list_services', durationMs: listDurationMs }],
    };
  }

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

  if (matchedGroup) {
    const groupNorm = normalizeChoiceText(matchedGroup.title);
    const serviceNorm = matchedService
      ? normalizeChoiceText(matchedService.title)
      : '';
    const inputTokens = tokenizeNormalized(input);
    const groupTokens = tokenizeNormalized(groupNorm);

    // EXACT group title match → it's a category click. Period.
    // Without this, when services in a group start with the group name
    // (e.g. "Микронидлинг (одна процедура)" in group "Микронидлинг"),
    // the substring check below would treat the click as a service pick
    // and skip the service-list step entirely.
    const isExactGroupMatch = input === groupNorm;

    const hasStrongServiceMatch =
      !isExactGroupMatch &&
      Boolean(serviceNorm) &&
      (input === serviceNorm ||
        input.includes(serviceNorm) ||
        serviceNorm.includes(input));
    const startsWithGroup =
      input === groupNorm || input.startsWith(`${groupNorm} `);
    const isBookingVerbGroupChoice =
      hasSelectionVerb &&
      input.includes(groupNorm);
    const isDirectGroupChoice =
      isExactGroupMatch ||
      (!hasStrongServiceMatch &&
      (
        startsWithGroup ||
        isBookingVerbGroupChoice ||
        (input.includes(groupNorm) && inputTokens.length <= groupTokens.length + 2)
      ));

    if (!isDirectGroupChoice) {
      // User most likely clicked a specific service with overlapping words.
      // Continue to concrete service matching below.
    } else {
      const serviceOptions = matchedGroup.services
        .slice(0, 12)
        .map((s) => formatServiceOption(session.locale, s, matchedGroup.title));
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

  if (!matchedService) return null;

  const matchedServiceNorm = normalizeChoiceText(matchedService.title);
  const matchedServiceTokens = tokenizeNormalized(matchedServiceNorm);
  const inputTokenSet = new Set(inputTokens);
  const overlapCount = matchedServiceTokens.reduce(
    (acc, token) => (inputTokenSet.has(token) ? acc + 1 : acc),
    0,
  );
  const hasStrongServiceMatch =
    input === matchedServiceNorm ||
    input.includes(matchedServiceNorm) ||
    overlapCount >= Math.max(2, Math.ceil(matchedServiceTokens.length / 2));

  const hasGenericCategoryIntent =
    /\b(перманент|макияж|pmu|hydrafacial|брови|ресницы|губы|service|services|leistung|behandlung|augenbrauen|wimpern|lippen)\b/u.test(
      normalizedMessage,
    );
  const asksGenericInfoBeforeBooking =
    isKnowledgeDetailsIntent(message, session.locale) &&
    !explicitCatalogPayload &&
    !hasSelectionVerb &&
    hasGenericCategoryIntent;

  if (asksGenericInfoBeforeBooking) {
    return null;
  }

  if (!explicitCatalogPayload && !hasStrongServiceMatch) {
    // Do not turn broad informational prompts into concrete booking selections.
    if (!hasSelectionVerb && hasGenericCategoryIntent) {
      return null;
    }
    if (inputTokens.length > 4) {
      return null;
    }
  }

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
      .map((s) => formatServiceOption(session.locale, s, matchedService.groupTitle));

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

  const { sessionId, message, locale, inputMode, stream: wantStream } = body;
  const isVoiceTurn = inputMode === 'voice';
  const forceGpt =
    body.forceGpt === true || req.headers.get('x-ai-force-gpt') === '1';

  if (!sessionId || !message?.trim()) {
    return NextResponse.json(
      { error: 'sessionId and message are required' },
      { status: 400 },
    );
  }

  const existingSession = getSession(sessionId);

  // Get or create session
  const session = upsertSession(sessionId, {
    locale: (locale as 'de' | 'ru' | 'en') ?? 'de',
  });

  const shouldInitAnalytics =
    !existingSession || !(existingSession.context.chatHistory?.length);
  if (shouldInitAnalytics) {
    initSessionAnalytics({
      sessionId,
      locale: session.locale,
      userAgent: req.headers.get('user-agent') || undefined,
      ip,
      referrer:
        req.headers.get('referer') ||
        req.headers.get('referrer') ||
        undefined,
    });
  }

  appendSessionMessage(sessionId, 'user', message);
  const turn = new TurnBuilder(sessionId, message, inputMode);
  let turnUsedGpt = false;
  let turnResponseMode: 'json' | 'sse' = 'json';
  let turnIterations = 0;
  let turnRetried = false;
  let turnOutcome: 'ok' | 'error' | 'timeout' | 'aborted' | 'degraded' = 'ok';
  let turnErrorCategory: string | undefined;
  let turnErrorCode: string | undefined;
  let turnErrorMessageSafe: string | undefined;
  const selectedMasterId = session.context.selectedMasterId;
  const selectedServiceIds = session.context.selectedServiceIds ?? [];
  const suggestedDateOptions = session.context.lastSuggestedDateOptions ?? [];
  const hasActiveBookingFlow = Boolean(
    selectedMasterId ||
      selectedServiceIds.length > 0 ||
      session.context.reservedSlot ||
      session.context.draftId,
  );

  let analyticsTracked = false;
  const trackMetrics = (metrics: Partial<RequestMetrics>): void => {
    if (analyticsTracked) return;
    analyticsTracked = true;
    try {
      const latestContext = getSession(sessionId)?.context ?? session.context;
      trackRequestMetrics(sessionId, {
        isVoice: isVoiceTurn,
        funnelStage: detectFunnelStage(latestContext),
        consultationUsed: Boolean(latestContext.consultationMode),
        consultationTopic: latestContext.consultationTopic,
        ...metrics,
      }, session.locale);
    } catch (analyticsError) {
      console.error(
        `[AI Analytics] session=${sessionId.slice(0, 8)}... tracking failed`,
        analyticsError,
      );
    }
  };

  try {
  if (!forceGpt) {
  if (
    !hasActiveBookingFlow &&
    session.context.awaitingConsultationBookingConfirmation &&
    session.context.consultationTechnique
  ) {
    const technique = session.context.consultationTechnique;
    if (isSelectedServiceSuitabilityIntent(message, session.locale)) {
      const text = buildConsultationTechniqueSuitabilityText(session.locale, technique);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-suitability-followup technique=${technique}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }
    if (isKnowledgeDetailsIntent(message, session.locale)) {
      const text = buildKnowledgePmuTechniqueDetailsText(session.locale, technique);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-details-awaiting-confirm technique=${technique}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }
    if (isKnowledgePmuContraindicationsIntent(message, session.locale)) {
      const text = buildKnowledgePmuTechniqueContraindicationsText(session.locale, technique);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-contraindications-awaiting-confirm technique=${technique}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }
    if (isKnowledgePmuHealingIntent(message, session.locale)) {
      const text = buildKnowledgePmuTechniqueSafetyText(session.locale, technique);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-safety-awaiting-confirm technique=${technique}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    if (isConsultationBookingConfirmIntent(message, session.locale)) {
      const fallbackStartedAt = Date.now();
      const fallbackCatalog = await listServices({ locale: session.locale });
      const fallbackDurationMs = Date.now() - fallbackStartedAt;
      const fallbackGroups = (fallbackCatalog.groups ?? []) as SelectionCatalogGroup[];
      const resolvedService = resolveConsultationTechniqueService(
        session.locale,
        technique,
        fallbackGroups,
      );

      let selectionFastPath: ChatResponse | null = null;
      if (resolvedService) {
        selectionFastPath = await tryHandleCatalogSelectionFastPath(
          session,
          sessionId,
          resolvedService.title,
        );
      }
      if (!selectionFastPath) {
        const bookingLabels = getConsultationTechniqueBookingLabels(
          session.locale,
          technique,
        );
        for (const label of bookingLabels) {
          selectionFastPath = await tryHandleCatalogSelectionFastPath(
            session,
            sessionId,
            label,
          );
          if (selectionFastPath) break;
        }
      }

      if (selectionFastPath) {
        upsertSession(sessionId, {
          context: {
            consultationMode: false,
            consultationTopic: undefined,
            consultationTechnique: undefined,
            awaitingConsultationBookingConfirmation: false,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-booking-confirm technique=${technique} service="${resolvedService?.title ?? 'n/a'}"`,
        );

        return NextResponse.json(selectionFastPath);
      }

      const fallbackGroupTitles = fallbackGroups
        .map((g) => g.title)
        .filter(Boolean);
      const text = buildBookingStartText(session.locale, fallbackGroupTitles);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationMode: false,
          consultationTopic: undefined,
          consultationTechnique: undefined,
          awaitingConsultationBookingConfirmation: false,
          selectedServiceIds: undefined,
          selectedMasterId: undefined,
          lastSuggestedDateOptions: undefined,
          lastDateISO: undefined,
          lastPreferredTime: undefined,
          lastNoSlots: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-booking-confirm-fallback technique=${technique}`,
      );

      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [{ name: 'list_services', durationMs: fallbackDurationMs }],
        inputMode: 'text',
      });
    }

    if (isConsultationBookingDeclineIntent(message, session.locale)) {
      const topic = session.context.consultationTopic ?? 'pmu';
      const startedAt = Date.now();
      const catalog = await listServices({ locale: session.locale });
      const durationMs = Date.now() - startedAt;
      const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
      const text = buildConsultationTopicText(session.locale, topic, groups);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          awaitingConsultationBookingConfirmation: false,
          consultationTechnique: undefined,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-booking-decline`,
      );

      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [{ name: 'list_services', durationMs }],
      });
    }

    const text = buildConsultationBookingConfirmText(session.locale, technique);
    appendSessionMessage(sessionId, 'assistant', text);

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-booking-confirm-repeat`,
    );

    return NextResponse.json({
      text,
      sessionId,
    });
  }

  const hasAnyInteractiveFlow = Boolean(
    hasActiveBookingFlow ||
      session.context.consultationMode ||
      session.context.awaitingRegistrationMethod ||
      session.context.awaitingVerificationMethod ||
      session.context.pendingVerificationMethod,
  );

  if (hasAnyInteractiveFlow && isCancelBookingIntent(message, session.locale)) {
    const staleDraftId = session.context.draftId;
    if (staleDraftId) {
      await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
        /* ignore cleanup errors */
      });
    }
    await prisma.temporarySlotReservation.deleteMany({
      where: { sessionId },
    }).catch(() => {
      /* ignore cleanup errors */
    });

    const text =
      session.locale === 'ru'
        ? 'Текущую запись отменили. Чем могу помочь дальше? 🌸\n\n' +
          getKnowledgeMenuOptions(session.locale)
            .map((item) => `[option] ${item} [/option]`)
            .join('\n')
        : session.locale === 'en'
          ? 'Current booking has been canceled. What would you like to do next? 🌸\n\n' +
            getKnowledgeMenuOptions(session.locale)
              .map((item) => `[option] ${item} [/option]`)
              .join('\n')
          : 'Die aktuelle Buchung wurde abgebrochen. Wie darf ich weiterhelfen? 🌸\n\n' +
            getKnowledgeMenuOptions(session.locale)
              .map((item) => `[option] ${item} [/option]`)
              .join('\n');

    appendSessionMessage(sessionId, 'assistant', text);
    upsertSession(sessionId, {
      previousResponseId: null,
      context: {
        consultationMode: false,
        consultationTopic: undefined,
        consultationTechnique: undefined,
        awaitingConsultationBookingConfirmation: false,
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
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=booking-cancelled`,
    );

    return NextResponse.json({
      text,
      sessionId,
      inputMode: 'text',
    });
  }

  if (isResetToMainMenuIntent(message, session.locale)) {
    const staleDraftId = session.context.draftId;
    if (staleDraftId) {
      await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
        /* ignore cleanup errors */
      });
    }
    await prisma.temporarySlotReservation.deleteMany({
      where: { sessionId },
    }).catch(() => {
      /* ignore cleanup errors */
    });

    const text = buildMainMenuText(session.locale);
    appendSessionMessage(sessionId, 'assistant', text);
    upsertSession(sessionId, {
      previousResponseId: null,
      context: {
        consultationMode: false,
        consultationTopic: undefined,
        consultationTechnique: undefined,
        awaitingConsultationBookingConfirmation: false,
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
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=main-menu-reset`,
    );

    return NextResponse.json({
      text,
      sessionId,
      inputMode: 'text',
    });
  }

  if (!hasAnyInteractiveFlow && isGreetingIntent(message, session.locale)) {
    const text = buildGreetingText(session.locale);
    appendSessionMessage(sessionId, 'assistant', text);

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=greeting`,
    );

    return NextResponse.json({
      text,
      sessionId,
      inputMode: 'text',
    });
  }

  if (
    (hasActiveBookingFlow || session.context.consultationMode) &&
    isChangeServiceIntent(message, session.locale)
  ) {
    const staleDraftId = session.context.draftId;
    if (staleDraftId) {
      await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
        /* ignore cleanup errors */
      });
    }
    await prisma.temporarySlotReservation.deleteMany({
      where: { sessionId },
    }).catch(() => {
      /* ignore cleanup errors */
    });

    const startedAt = Date.now();
    const catalog = await listServices({ locale: session.locale });
    const durationMs = Date.now() - startedAt;
    const groups = (catalog.groups ?? []) as Array<{ title: string }>;
    const groupTitles = groups.map((g) => g.title).filter(Boolean);
    const restartText = buildBookingStartText(session.locale, groupTitles);
    const intro =
      session.locale === 'ru'
        ? 'Хорошо, выберем другую услугу 🌸'
        : session.locale === 'en'
          ? 'Sure, let us choose another service 🌸'
          : 'Gerne, wir wählen eine andere Leistung 🌸';
    const text = `${intro}\n\n${restartText}`;

    appendSessionMessage(sessionId, 'assistant', text);
    upsertSession(sessionId, {
      previousResponseId: null,
      context: {
        consultationMode: false,
        consultationTopic: undefined,
        consultationTechnique: undefined,
        awaitingConsultationBookingConfirmation: false,
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
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=change-service groups=${groupTitles.length}`,
    );

    return NextResponse.json({
      text,
      sessionId,
      toolCalls: [{ name: 'list_services', durationMs }],
      inputMode: 'text',
    });
  }

  // Deterministic booking start/restart entrypoint:
  // handles intents like "записаться", "новый термин", "book appointment".
  if (
    isBookingStartIntent(message, session.locale, hasActiveBookingFlow) &&
    !(
      session.context.consultationMode &&
      !hasActiveBookingFlow &&
      (
        isConsultationBookOptionIntent(message, session.locale) ||
        isConsultationSpecificBookingIntent(message, session.locale)
      )
    )
  ) {
    // If user already named a concrete service ("хочу записаться на маникюр"),
    // resolve selection immediately instead of sending the generic category list again.
    const serviceSelectionInput = extractServiceSelectionInput(
      message,
      session.locale,
    );
    const directSelection = await tryHandleCatalogSelectionFastPath(
      session,
      sessionId,
      serviceSelectionInput,
    );
    if (directSelection) {
      return NextResponse.json(directSelection);
    }

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
        consultationMode: false,
        consultationTopic: undefined,
        consultationTechnique: undefined,
        awaitingConsultationBookingConfirmation: false,
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
      inputMode: 'text',
    });
  }

  // ---------- Occasion-based recommendation ----------
  const detectedOccasion = detectKnowledgeOccasion(message, session.locale);
  if (
    detectedOccasion &&
    !hasActiveBookingFlow &&
    !session.context.consultationMode &&
    !looksLikeServiceOptionPayload(message) &&
    !looksLikePricedOptionPayload(message)
  ) {
    const text = buildKnowledgeOccasionText(
      session.locale as 'de' | 'en' | 'ru',
      detectedOccasion,
    );
    appendSessionMessage(sessionId, 'assistant', text);

    if (!session.context.consultationMode) {
      upsertSession(sessionId, {
        context: {
          consultationMode: true,
          consultationTopic: detectedOccasion === 'correction' ? 'pmu' : undefined,
          consultationTechnique: undefined,
          awaitingConsultationBookingConfirmation: false,
        },
      });
    }

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=occasion-${detectedOccasion}`,
    );

    return NextResponse.json({
      text,
      sessionId,
    });
  }

  if (!hasActiveBookingFlow && !session.context.consultationMode) {
    const consultationTopic = detectKnowledgeConsultationTopic(message, session.locale);
    if (
      consultationTopic &&
      isConsultationTopicAutoStartIntent(message, session.locale)
    ) {
      const startedAt = Date.now();
      const catalog = await listServices({ locale: session.locale });
      const durationMs = Date.now() - startedAt;
      const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
      const text = buildConsultationTopicText(
        session.locale,
        consultationTopic,
        groups,
      );
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationMode: true,
          consultationTopic,
          consultationTechnique: undefined,
          awaitingConsultationBookingConfirmation: false,
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
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-topic-autostart topic=${consultationTopic}`,
      );

      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [{ name: 'list_services', durationMs }],
      });
    }
  }

  // Deterministic consultation entrypoint for the new menu option.
  if (
    !hasActiveBookingFlow &&
    !session.context.consultationMode &&
    isConsultationIntent(message, session.locale)
  ) {
    const startedAt = Date.now();
    const catalog = await listServices({ locale: session.locale });
    const durationMs = Date.now() - startedAt;
    const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
    const text = buildConsultationStartText(session.locale, groups);
    appendSessionMessage(sessionId, 'assistant', text);
    upsertSession(sessionId, {
      context: {
        consultationMode: true,
        consultationTopic: undefined,
        consultationTechnique: undefined,
        awaitingConsultationBookingConfirmation: false,
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
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-start`,
    );

    return NextResponse.json({
      text,
      sessionId,
      toolCalls: [{ name: 'list_services', durationMs }],
    });
  }

  // Consultation-first mode: keep a friendly advisory flow until user explicitly
  // asks to proceed to booking.
  if (!hasActiveBookingFlow && session.context.consultationMode) {
    const activeConsultationTopic = session.context.consultationTopic;

    if (!activeConsultationTopic) {
      const consultationTopic = detectKnowledgeConsultationTopic(message, session.locale);
      if (consultationTopic) {
        const startedAt = Date.now();
        const catalog = await listServices({ locale: session.locale });
        const durationMs = Date.now() - startedAt;
        const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
        const text = buildConsultationTopicText(
          session.locale,
          consultationTopic,
          groups,
        );
        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            consultationTopic,
            consultationTechnique: undefined,
            awaitingConsultationBookingConfirmation: false,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-topic topic=${consultationTopic}`,
        );

        return NextResponse.json({
          text,
          sessionId,
          toolCalls: [{ name: 'list_services', durationMs }],
        });
      }

      // No knowledge-topic match. Before falling back to catalog-selection
      // (which would jump straight to date picker on service clicks), check
      // if the user clicked a SPECIFIC SERVICE (priced/service option payload)
      // for a category that has no Knowledge-topic mapping (e.g. Микронидлинг,
      // Маникюр). Show a rich consultation card with DB description + per-
      // service template instead.
      //
      // We only intercept here for priced/service-option clicks, NOT bare
      // category names — those should still flow through catalog-selection
      // to show the service list.
      if (
        !session.context.consultationTechnique &&
        (looksLikePricedOptionPayload(message) || looksLikeServiceOptionPayload(message)) &&
        !detectKnowledgePmuTechnique(message, session.locale)
      ) {
        const startedAt = Date.now();
        const catalog = await listServices({ locale: session.locale });
        const durationMs = Date.now() - startedAt;

        const input = normalizeChoiceText(message);
        let foundService:
          | { id: string; title: string; durationMin: number; priceCents: number | null; description: string | null }
          | null = null;
        let foundGroupTitle: string | null = null;

        for (const g of catalog.groups ?? []) {
          for (const s of g.services) {
            const sNorm = normalizeChoiceText(s.title);
            if (!sNorm) continue;
            if (input === sNorm || input.includes(sNorm)) {
              foundService = {
                id: s.id,
                title: s.title,
                durationMin: s.durationMin,
                priceCents: s.priceCents ?? null,
                description: s.description ?? null,
              };
              foundGroupTitle = g.title;
              break;
            }
          }
          if (foundService) break;
        }

        if (foundService) {
          const text = buildServiceConsultationCard(
            session.locale,
            {
              title: foundService.title,
              description: foundService.description ?? null,
              durationMin: foundService.durationMin,
              priceCents: foundService.priceCents,
            },
            foundGroupTitle ?? '',
          );

          appendSessionMessage(sessionId, 'assistant', text);
          upsertSession(sessionId, {
            context: {
              consultationServiceTitle: foundService.title,
              // KEEP consultationMode. consultationTopic stays undefined for
              // non-Knowledge categories — the booking-from-card handler below
              // does not require activeConsultationTopic to fire.
            },
          });

          console.log(
            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-service-card topic=none service="${foundService.title}"`,
          );

          return NextResponse.json({
            text,
            sessionId,
            toolCalls: [{ name: 'list_services', durationMs }],
          });
        }
      }

      // No knowledge-topic match. Try catalog selection fast-path:
      // if the user clicked a service GROUP name (e.g. "Микронидлинг",
      // "Другие услуги и запись") that is in the live catalog but not in
      // the curated consultation topics, route to service selection so
      // they don't get stuck looping in the consultation menu.
      const catalogSelection = await tryHandleCatalogSelectionFastPath(
        session,
        sessionId,
        message,
      );
      if (catalogSelection) {
        // Important: when the user clicks a CATEGORY name (e.g. "Микронидлинг"),
        // catalog-selection returns the service-list view but the user is still
        // in consultation. We keep `consultationMode` ON so the next click on a
        // specific service inside that category triggers the consultation-service-card
        // flow (rich service card) instead of jumping straight to the date picker.
        //
        // consultationMode is cleared later by the explicit "Подобрать время и
        // записаться" path (`consultation-service-card-to-booking`).
        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-to-catalog-selection`,
        );
        return NextResponse.json(catalogSelection);
      }
    }

    // ---------- consultation → Hydrafacial comparison ----------
    if (
      isKnowledgeHydrafacialComparisonIntent(message, session.locale)
    ) {
      const text = buildKnowledgeHydrafacialComparisonText(
        session.locale as 'de' | 'en' | 'ru',
      );
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationTopic: 'hydrafacial',
          consultationTechnique: undefined,
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-hydrafacial-compare`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    // ---------- consultation → Brows & Lashes comparison ----------
    if (
      isKnowledgeBrowsLashesComparisonIntent(message, session.locale)
    ) {
      const text = buildKnowledgeBrowsLashesComparisonText(
        session.locale as 'de' | 'en' | 'ru',
      );
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationTopic: 'brows_lashes',
          consultationTechnique: undefined,
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-brows-lashes-compare`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    if (
      activeConsultationTopic === 'hydrafacial' &&
      isKnowledgeHydrafacialDetailsIntent(message, session.locale)
    ) {
      const text = buildKnowledgeHydrafacialDetailsText(
        session.locale as 'de' | 'en' | 'ru',
      );
      appendSessionMessage(sessionId, 'assistant', text);

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-hydrafacial-details`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    if (
      activeConsultationTopic === 'brows_lashes' &&
      isKnowledgeBrowsLashesDetailsIntent(message, session.locale)
    ) {
      const text = buildKnowledgeBrowsLashesDetailsText(
        session.locale as 'de' | 'en' | 'ru',
      );
      appendSessionMessage(sessionId, 'assistant', text);

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-brows-lashes-details`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    if (
      (activeConsultationTopic === 'pmu' || !activeConsultationTopic) &&
      isKnowledgePmuContraindicationsIntent(message, session.locale)
    ) {
      const contraindicationsTechnique =
        session.context.consultationTechnique ??
        detectKnowledgePmuTechnique(message, session.locale);
      const text = contraindicationsTechnique
        ? buildKnowledgePmuTechniqueContraindicationsText(
            session.locale,
            contraindicationsTechnique,
          )
        : buildKnowledgePmuContraindicationsText(session.locale);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationTopic: 'pmu',
          consultationTechnique: contraindicationsTechnique ?? undefined,
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        contraindicationsTechnique
          ? `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-contraindications technique=${contraindicationsTechnique}`
          : `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-contraindications`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    if (
      (activeConsultationTopic === 'pmu' || !activeConsultationTopic) &&
      isKnowledgePmuHealingIntent(message, session.locale)
    ) {
      const healingTechnique =
        session.context.consultationTechnique ??
        detectKnowledgePmuTechnique(message, session.locale);
      const text = healingTechnique
        ? buildKnowledgePmuTechniqueSafetyText(session.locale, healingTechnique)
        : buildKnowledgePmuHealingText(session.locale);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationTopic: 'pmu',
          consultationTechnique: healingTechnique ?? undefined,
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        healingTechnique
          ? `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-safety technique=${healingTechnique}`
          : `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-healing`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    if (
      (activeConsultationTopic === 'pmu' || !activeConsultationTopic) &&
      isKnowledgePmuLipsChoiceIntent(message, session.locale)
    ) {
      const text = buildKnowledgePmuLipsChoiceText(session.locale);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationTopic: 'pmu',
          consultationTechnique: undefined,
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-lips-options`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    const technique = detectKnowledgePmuTechnique(message, session.locale);
    if (technique) {
      if (isConsultationOperationalBookingInput(message)) {
        const text = buildConsultationBookingConfirmText(session.locale, technique);
        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            consultationTechnique: technique,
            awaitingConsultationBookingConfirmation: true,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-booking-cta technique=${technique}`,
        );

        return NextResponse.json({
          text,
          sessionId,
        });
      }

      const wantsDetails = isKnowledgeDetailsIntent(message, session.locale);
      const text = wantsDetails
        ? buildKnowledgePmuTechniqueDetailsText(session.locale, technique)
        : buildKnowledgePmuTechniqueText(session.locale, technique);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationTechnique: technique,
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=${wantsDetails ? 'consultation-technique-details' : 'consultation-technique'} technique=${technique}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    if (
      session.context.consultationTechnique &&
      isKnowledgeDetailsIntent(message, session.locale)
    ) {
      const text = buildKnowledgePmuTechniqueDetailsText(
        session.locale,
        session.context.consultationTechnique,
      );
      appendSessionMessage(sessionId, 'assistant', text);

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-details-followup technique=${session.context.consultationTechnique}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    // FAQ click inside a technique view ("❓ Частые вопросы" / "❓ FAQ" / "❓ Häufige Fragen")
    if (
      session.context.consultationTechnique &&
      isKnowledgePmuFaqIntent(message, session.locale)
    ) {
      const text = buildKnowledgePmuFaqText(session.locale);
      appendSessionMessage(sessionId, 'assistant', text);

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-faq technique=${session.context.consultationTechnique}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    // Preparation click ("📋 Как подготовиться" / "📋 How to prepare" / "📋 So bereiten Sie sich vor")
    if (
      session.context.consultationTechnique &&
      isKnowledgePmuPreparationIntent(message, session.locale)
    ) {
      const text = buildKnowledgePmuPreparationText(
        session.locale,
        session.context.consultationTechnique,
      );
      appendSessionMessage(sessionId, 'assistant', text);

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-preparation technique=${session.context.consultationTechnique}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }
    if (
      session.context.consultationTechnique &&
      isSelectedServiceSuitabilityIntent(message, session.locale)
    ) {
      const text = buildConsultationTechniqueSuitabilityText(
        session.locale,
        session.context.consultationTechnique,
      );
      appendSessionMessage(sessionId, 'assistant', text);

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-suitability technique=${session.context.consultationTechnique}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    // If the user already saw a non-PMU service consultation card and now
    // clicked "Подобрать время и записаться", route them through the catalog
    // selection using the stored service title.
    //
    // Note: this fires regardless of activeConsultationTopic because
    // non-Knowledge categories (Микронидлинг, Маникюр) never get a topic set.
    if (
      !session.context.consultationTechnique &&
      session.context.consultationServiceTitle &&
      isConsultationOperationalBookingInput(message)
    ) {
      const storedTitle = session.context.consultationServiceTitle;
      const catalogSelection = await tryHandleCatalogSelectionFastPath(
        session,
        sessionId,
        storedTitle,
      );
      if (catalogSelection) {
        upsertSession(sessionId, {
          context: {
            consultationMode: false,
            consultationTopic: undefined,
            consultationTechnique: undefined,
            consultationServiceTitle: undefined,
            awaitingConsultationBookingConfirmation: false,
          },
        });
        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-service-card-to-booking service="${storedTitle}"`,
        );
        return NextResponse.json(catalogSelection);
      }
    }

    // In consultation mode, intercept clicks on specific services (priced or
    // service-option payloads) for NON-PMU categories. Show a rich consultation
    // card (description, duration, price, healing/aftercare hints) before
    // jumping to date picker. The user explicitly clicks "Подобрать время и
    // записаться" to proceed.
    //
    // PMU services are already handled by the technique block above — we don't
    // want to duplicate or override that flow.
    if (
      activeConsultationTopic &&
      !session.context.consultationTechnique &&
      (looksLikePricedOptionPayload(message) || looksLikeServiceOptionPayload(message)) &&
      !detectKnowledgePmuTechnique(message, session.locale)
    ) {
      const startedAt = Date.now();
      const catalog = await listServices({ locale: session.locale });
      const durationMs = Date.now() - startedAt;

      const input = normalizeChoiceText(message);
      let foundService:
        | { id: string; title: string; durationMin: number; priceCents: number | null; description: string | null }
        | null = null;
      let foundGroupTitle: string | null = null;

      for (const g of catalog.groups ?? []) {
        for (const s of g.services) {
          const sNorm = normalizeChoiceText(s.title);
          if (!sNorm) continue;
          if (input === sNorm || input.includes(sNorm)) {
            foundService = {
              id: s.id,
              title: s.title,
              durationMin: s.durationMin,
              priceCents: s.priceCents ?? null,
              description: s.description ?? null,
            };
            foundGroupTitle = g.title;
            break;
          }
        }
        if (foundService) break;
      }

      if (foundService) {
        // Build SERVICE-SPECIFIC consultation card (not category-level).
        // Uses DB description first, then per-service templates, then generic fallback.
        const text = buildServiceConsultationCard(
          session.locale,
          {
            title: foundService.title,
            description: foundService.description ?? null,
            durationMin: foundService.durationMin,
            priceCents: foundService.priceCents,
          },
          foundGroupTitle ?? '',
        );

        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            consultationServiceTitle: foundService.title,
            // KEEP consultationMode + consultationTopic so the user stays in flow
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-service-card topic=${activeConsultationTopic} service="${foundService.title}"`,
        );

        return NextResponse.json({
          text,
          sessionId,
          toolCalls: [{ name: 'list_services', durationMs }],
        });
      }
    }

    // When user is already in a consultation topic but clicks a service /
    // category / specific booking intent — let them switch / drill into the
    // catalog instead of bouncing back to the same topic menu.
    // Previously this was restricted to non-PMU topics, but users in PMU
    // consultation also need to be able to type "Микронидлинг" or click a
    // different category and have it actually navigate.
    if (
      activeConsultationTopic &&
      (
        looksLikeServiceOptionPayload(message) ||
        looksLikePricedOptionPayload(message) ||
        isConsultationSpecificBookingIntent(message, session.locale) ||
        // Allow plain category-name clicks too (e.g. "Микронидлинг", "HYDRAFACIAL")
        await isLikelyCatalogGroupOrServiceName(message, session.locale)
      )
    ) {
      const consultationSelection = await tryHandleCatalogSelectionFastPath(
        session,
        sessionId,
        message,
      );
      if (consultationSelection) {
        upsertSession(sessionId, {
          context: {
            consultationMode: false,
            consultationTopic: undefined,
            consultationTechnique: undefined,
            awaitingConsultationBookingConfirmation: false,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-service-selection topic=${activeConsultationTopic}`,
        );

        return NextResponse.json(consultationSelection);
      }
    }

    if (activeConsultationTopic === 'hydrafacial') {
      const hydrafacialGoal = detectKnowledgeHydrafacialGoal(
        message,
        session.locale,
      );
      if (hydrafacialGoal) {
        const text = buildKnowledgeHydrafacialGoalText(
          session.locale,
          hydrafacialGoal,
        );
        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            consultationTechnique: undefined,
            awaitingConsultationBookingConfirmation: false,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-hydrafacial-goal goal=${hydrafacialGoal}`,
        );

        return NextResponse.json({
          text,
          sessionId,
        });
      }
    }

    const consultationStyle = detectKnowledgeConsultationStyle(
      message,
      session.locale,
    );
    if (consultationStyle) {
      const text =
        activeConsultationTopic === 'brows_lashes'
          ? buildKnowledgeBrowsLashesStyleText(session.locale, consultationStyle)
          : buildKnowledgeConsultationStyleText(session.locale, consultationStyle);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationTechnique: undefined,
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-style style=${consultationStyle}`,
      );

      return NextResponse.json({
        text,
        sessionId,
      });
    }

    const consultationTopic = detectKnowledgeConsultationTopic(message, session.locale);
    if (consultationTopic && consultationTopic !== activeConsultationTopic) {
      const startedAt = Date.now();
      const catalog = await listServices({ locale: session.locale });
      const durationMs = Date.now() - startedAt;
      const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
      const text = buildConsultationTopicText(
        session.locale,
        consultationTopic,
        groups,
      );
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationTopic,
          consultationTechnique: undefined,
          awaitingConsultationBookingConfirmation: false,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-topic topic=${consultationTopic}`,
      );

      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [{ name: 'list_services', durationMs }],
      });
    }

    if (isConsultationOperationalBookingInput(message)) {
      const technique = session.context.consultationTechnique;
      if (technique) {
        const text = buildConsultationBookingConfirmText(session.locale, technique);
        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            awaitingConsultationBookingConfirmation: true,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-bridge-to-booking-confirm technique=${technique}`,
        );

        return NextResponse.json({
          text,
          sessionId,
        });
      }

      if (activeConsultationTopic === 'pmu') {
        const startedAt = Date.now();
        const catalog = await listServices({ locale: session.locale });
        const durationMs = Date.now() - startedAt;
        const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
        const text = buildConsultationTopicText(session.locale, 'pmu', groups);
        appendSessionMessage(sessionId, 'assistant', text);

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-bridge-to-booking-pmu-technique-required`,
        );

        return NextResponse.json({
          text,
          sessionId,
          toolCalls: [{ name: 'list_services', durationMs }],
        });
      }

      const startedAt = Date.now();
      const catalog = await listServices({ locale: session.locale });
      const durationMs = Date.now() - startedAt;
      const groups = (catalog.groups ?? []) as Array<{ title: string }>;
      const groupTitles = groups.map((g) => g.title).filter(Boolean);
      const text = buildBookingStartText(session.locale, groupTitles);
      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          consultationMode: false,
          consultationTopic: undefined,
          consultationTechnique: undefined,
          awaitingConsultationBookingConfirmation: false,
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
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-bridge-to-booking-start groups=${groupTitles.length}`,
      );

      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [{ name: 'list_services', durationMs }],
        inputMode: 'text',
      });
    }

    const startedAt = Date.now();
    const catalog = await listServices({ locale: session.locale });
    const durationMs = Date.now() - startedAt;
    const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
    const text = activeConsultationTopic
      ? buildConsultationTopicText(session.locale, activeConsultationTopic, groups)
      : buildConsultationStartText(session.locale, groups);
    appendSessionMessage(sessionId, 'assistant', text);

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-fallback topic=${activeConsultationTopic ?? 'none'}`,
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

  // Deterministic details response for the currently selected service in booking flow.
  // Prevents random-language fallbacks from the LLM when user asks "подробнее".
  const asksSelectedServiceDetails = isKnowledgeDetailsIntent(message, session.locale);
  const asksSelectedServiceSuitability = isSelectedServiceSuitabilityIntent(
    message,
    session.locale,
  );
  if (
    hasActiveBookingFlow &&
    selectedServiceIds.length > 0 &&
    (asksSelectedServiceDetails || asksSelectedServiceSuitability)
  ) {
    const startedAt = Date.now();
    const catalog = await listServices({ locale: session.locale });
    const durationMs = Date.now() - startedAt;
    const groups = (catalog.groups ?? []) as Array<{
      id: string;
      title: string;
      services: Array<{
        id: string;
        title: string;
        durationMin: number;
      }>;
    }>;
    const selectedService = groups
      .flatMap((group) =>
        group.services.map((service) => ({
          id: service.id,
          title: service.title,
          groupTitle: group.title,
          durationMin: service.durationMin,
        })),
      )
      .find((service) => selectedServiceIds.includes(service.id));

    if (selectedService) {
      const text = asksSelectedServiceSuitability
        ? buildSelectedServiceSuitabilityText(
            session.locale,
            selectedService.title,
            selectedService.groupTitle,
          )
        : buildSelectedServiceDetailsText(
            session.locale,
            selectedService.title,
            selectedService.groupTitle,
            selectedService.durationMin,
          );
      appendSessionMessage(sessionId, 'assistant', text);

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=${asksSelectedServiceSuitability ? 'booking-selected-service-suitability' : 'booking-selected-service-details'} service="${selectedService.title}"`,
      );

      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [{ name: 'list_services', durationMs }],
      });
    }
  }

  // Deterministic selection flow first:
  // category click -> concrete services, service click -> masters/date step.
  // Important: run before scope-guard, otherwise service option clicks can be blocked.
  let selectionFastPath: ChatResponse | null = null;
  const shouldRunSelectionFastPath =
    isServiceAvailabilityInquiry(message, session.locale) ||
    !session.context.consultationMode ||
    hasActiveBookingFlow;
  if (shouldRunSelectionFastPath) {
    selectionFastPath = await tryHandleCatalogSelectionFastPath(
      session,
      sessionId,
      message,
    );
  }
  if (selectionFastPath) {
    upsertSession(sessionId, {
      context: {
        consultationMode: false,
        consultationTopic: undefined,
        consultationTechnique: undefined,
        awaitingConsultationBookingConfirmation: false,
      },
    });
    return NextResponse.json(selectionFastPath);
  }

  // Deterministic registration-method selection after slot reservation.
  if (session.context.awaitingRegistrationMethod && session.context.reservedSlot) {
    const selectedMethod = detectRegistrationMethodChoice(message, { voiceMode: isVoiceTurn });
    if (selectedMethod) {
      if (selectedMethod === 'google_oauth') {
        const handoffUrl = buildGoogleHandoffUrl(session);
        const effectiveMethod = handoffUrl ? selectedMethod : 'email_otp';
        const keepMethodStep = Boolean(handoffUrl);
        const text = handoffUrl
          ? buildGoogleHandoffText(session.locale, handoffUrl)
          : buildContactCollectionTextForMethod(session.locale, 'email_otp', {
              voiceMode: isVoiceTurn,
            });

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

      const text = buildContactCollectionTextForMethod(session.locale, selectedMethod, {
        voiceMode: isVoiceTurn,
      });
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

  if (shouldApplyScopeGuard(message, session, { voiceMode: isVoiceTurn })) {
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

  // Deterministic location/hours reply to avoid language drift in generic LLM answers.
  if (isKnowledgeLocationHoursIntent(message, session.locale)) {
    const text = buildKnowledgeLocationHoursText(session.locale);
    appendSessionMessage(sessionId, 'assistant', text);

    console.log(
      `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=location-hours`,
    );

    return NextResponse.json({
      text,
      sessionId,
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
    const explicitDateISO = parseFlexibleDateInputToISO(
      message,
      session.context.lastDateISO ?? todayISO(),
    );

    if (explicitDateISO) {
      const requestedPreferredTime = detectPreferredTimeInput(message) ?? 'any';
      const startedAt = Date.now();
      const availabilityResult = await searchAvailability({
        masterId: selectedMasterId,
        dateISO: explicitDateISO,
        serviceIds: selectedServiceIds,
        preferredTime: requestedPreferredTime,
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
            lastPreferredTime: requestedPreferredTime,
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
            lastPreferredTime: requestedPreferredTime,
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

  // Deterministic follow-up: natural-language preferred time on already chosen date.
  if (selectedMasterId && selectedServiceIds.length > 0 && session.context.lastDateISO) {
    const preferredTime = detectPreferredTimeInput(message);
    if (preferredTime) {
      const dateISO = session.context.lastDateISO;
      const startedAt = Date.now();
      const preferredResult = await searchAvailability({
        masterId: selectedMasterId,
        dateISO,
        serviceIds: selectedServiceIds,
        preferredTime,
      });
      const durationMs = Date.now() - startedAt;
      const preferredSlots = Array.isArray(preferredResult.slots)
        ? preferredResult.slots
        : [];

      if (preferredSlots.length > 0) {
        const text = buildSlotsForDateText(session.locale, dateISO, preferredSlots);
        appendSessionMessage(sessionId, 'assistant', text);
        upsertSession(sessionId, {
          context: {
            lastDateISO: dateISO,
            lastPreferredTime: preferredTime,
            lastNoSlots: false,
            lastSuggestedDateOptions: undefined,
          },
        });

        console.log(
          `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=preferred-time-picked date=${dateISO} preferred=${preferredTime} slots=${preferredSlots.length}`,
        );

        return NextResponse.json({
          text,
          sessionId,
          toolCalls: [{ name: 'search_availability', durationMs }],
        });
      }

      // If no slots for preferred period, show full-day alternatives on the same date.
      const fallbackStartedAt = Date.now();
      const anyTimeResult = await searchAvailability({
        masterId: selectedMasterId,
        dateISO,
        serviceIds: selectedServiceIds,
        preferredTime: 'any',
      });
      const fallbackDurationMs = Date.now() - fallbackStartedAt;
      const anyTimeSlots = Array.isArray(anyTimeResult.slots)
        ? anyTimeResult.slots
        : [];

      const noPreferredText =
        session.locale === 'ru'
          ? 'На выбранный период свободных слотов нет. Вот все доступные варианты на эту дату:'
          : session.locale === 'en'
            ? 'No free slots for that time period. Here are all available options on this date:'
            : 'Für diesen Zeitraum gibt es keine freien Slots. Hier sind alle verfügbaren Optionen an diesem Datum:';

      const text =
        anyTimeSlots.length > 0
          ? `${noPreferredText}\n\n${buildSlotsForDateText(session.locale, dateISO, anyTimeSlots)}`
          : buildSlotsForDateText(session.locale, dateISO, []);

      appendSessionMessage(sessionId, 'assistant', text);
      upsertSession(sessionId, {
        context: {
          lastDateISO: dateISO,
          lastPreferredTime: preferredTime,
          lastNoSlots: anyTimeSlots.length === 0,
          lastSuggestedDateOptions: undefined,
        },
      });

      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=preferred-time-no-slots date=${dateISO} preferred=${preferredTime}`,
      );

      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [
          { name: 'search_availability', durationMs },
          { name: 'search_availability', durationMs: fallbackDurationMs },
        ],
      });
    }
  }

  // Deterministic follow-up: spoken time slot selection (e.g. "14:00", "четырнадцать ноль ноль").
  if (
    selectedMasterId &&
    selectedServiceIds.length > 0 &&
    session.context.lastDateISO &&
    !session.context.reservedSlot
  ) {
    const normalizedMessage = normalizeInput(message);
    const looksLikeSlotChoice =
      /\b\d{1,2}[:.]\d{2}\s*[–-]\s*\d{1,2}[:.]\d{2}\b/u.test(
        normalizedMessage,
      ) ||
      /\b\d{1,2}[.:]\d{1,2}[.:]\d{1,2}\b/u.test(normalizedMessage) ||
      Boolean(extractPreferredStartTimeInput(message));
    if (looksLikeSlotChoice) {
      const dateISO = session.context.lastDateISO;
      const startedAt = Date.now();
      const availabilityResult = await searchAvailability({
        masterId: selectedMasterId,
        dateISO,
        serviceIds: selectedServiceIds,
        preferredTime: 'any',
      });
      const availabilityDurationMs = Date.now() - startedAt;
      const slots = Array.isArray(availabilityResult.slots)
        ? availabilityResult.slots
        : [];
      const matchedSlot = matchSlotFromInput(message, slots);

      if (matchedSlot) {
        const reserveStartedAt = Date.now();
        const reserveResult = await reserveSlot({
          masterId: selectedMasterId,
          startAt: matchedSlot.startAt,
          endAt: matchedSlot.endAt,
          sessionId,
        });
        const reserveDurationMs = Date.now() - reserveStartedAt;

        if (reserveResult.success) {
          const text = buildRegistrationMethodChoiceText(session.locale, {
            voiceMode: isVoiceTurn,
          });
          appendSessionMessage(sessionId, 'assistant', text);
          upsertSession(sessionId, {
            context: {
              reservedSlot: {
                startAt: matchedSlot.startAt,
                endAt: matchedSlot.endAt,
              },
              lastDateISO: dateISO,
              lastPreferredTime: 'any',
              lastNoSlots: false,
              lastSuggestedDateOptions: undefined,
              awaitingRegistrationMethod: true,
              pendingVerificationMethod: undefined,
              awaitingVerificationMethod: false,
            },
          });

          console.log(
            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=slot-picked-by-time date=${dateISO} slot="${matchedSlot.displayTime}"`,
          );

          return NextResponse.json({
            text,
            sessionId,
            toolCalls: [
              { name: 'search_availability', durationMs: availabilityDurationMs },
              { name: 'reserve_slot', durationMs: reserveDurationMs },
            ],
            inputMode: 'text',
          });
        }

        if (reserveResult.error === 'SLOT_TAKEN') {
          const refreshStartedAt = Date.now();
          const refreshed = await searchAvailability({
            masterId: selectedMasterId,
            dateISO,
            serviceIds: selectedServiceIds,
            preferredTime: 'any',
          });
          const refreshDurationMs = Date.now() - refreshStartedAt;
          const text = buildSlotTakenAlternativesText(
            session.locale,
            dateISO,
            refreshed.slots ?? [],
          );

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
            `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=slot-picked-by-time-taken date=${dateISO}`,
          );

          return NextResponse.json({
            text,
            sessionId,
            toolCalls: [
              { name: 'search_availability', durationMs: availabilityDurationMs },
              { name: 'reserve_slot', durationMs: reserveDurationMs },
              { name: 'search_availability', durationMs: refreshDurationMs },
            ],
            inputMode: 'text',
          });
        }
      }

      // User tried to pick time, but we could not map it to a slot.
      const text =
        session.locale === 'ru'
          ? `Не удалось распознать выбранное время. Пожалуйста, выберите один из доступных слотов:\n\n${buildSlotsForDateText(session.locale, dateISO, slots)}`
          : session.locale === 'en'
            ? `I could not recognize the selected time. Please choose one of the available slots:\n\n${buildSlotsForDateText(session.locale, dateISO, slots)}`
            : `Die gewählte Zeit konnte nicht erkannt werden. Bitte wählen Sie einen der verfügbaren Slots:\n\n${buildSlotsForDateText(session.locale, dateISO, slots)}`;

      appendSessionMessage(sessionId, 'assistant', text);
      return NextResponse.json({
        text,
        sessionId,
        toolCalls: [{ name: 'search_availability', durationMs: availabilityDurationMs }],
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
    const chosenMethod = detectVerificationMethodChoice(message, {
      voiceMode: isVoiceTurn,
    });
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
          inputMode: verifyRes?.ok ? 'otp' : undefined,
        });
      }
    }
  }

  }

  // Build messages
  const systemPrompt = buildSystemPrompt(session.locale);
  const knowledgePrompt = buildKnowledgeSystemMessage(session.locale);

  // Inject live active catalog so GPT never suggests inactive services.
  // This is a lightweight read (isActive=true, isArchived=false) — same filter list_services uses.
  let liveCatalogPrompt: string | null = null;
  try {
    const liveCatalog = await listServices({ locale: session.locale });
    if (liveCatalog.groups.length > 0) {
      const catalogLines = liveCatalog.groups.map((g) => {
        const titles = g.services.map((s) => s.title).join(', ');
        return `  ${g.title}: ${titles}`;
      }).join('\n');
      liveCatalogPrompt =
        `AKTIVER LEISTUNGSKATALOG (Stand: jetzt, ${liveCatalog.totalServices} Leistungen aktiv):\n` +
        `KRITISCH: Empfehle AUSSCHLIESSLICH Leistungen aus dieser Liste. Alle anderen gelten als inaktiv.\n` +
        catalogLines;
    }
  } catch {
    // Non-fatal — GPT falls back to tool calls
  }

  const stateHints: string[] = [];
  if (session.context.consultationMode) {
    stateHints.push('consultationMode=true');
  }
  if (session.context.consultationTopic) {
    stateHints.push(`consultationTopic=${session.context.consultationTopic}`);
  }
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
  if (isVoiceTurn) {
    stateHints.push('inputMode=voice');
  }

  const statePrompt =
    stateHints.length > 0
      ? `SESSION STATE (do not reset booking flow): ${stateHints.join(' | ')}`
      : null;
  const voicePrompt = isVoiceTurn
    ? 'VOICE INPUT MODE: Keep prompts short. For Telegram/SMS contact collection ask only name + phone. Do not ask for email in voice flow. If email is missing in voice flow, continue with phone-based verification methods.'
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
    { role: 'system', content: knowledgePrompt },
    ...(liveCatalogPrompt ? [{ role: 'system', content: liveCatalogPrompt } as const] : []),
    ...(statePrompt ? [{ role: 'system', content: statePrompt } as const] : []),
    ...(voicePrompt ? [{ role: 'system', content: voicePrompt } as const] : []),
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

  const useSSE = wantStream === true && !isVoiceTurn;
  const sse = useSSE ? createSSEWriter() : undefined;
  turnUsedGpt = true;
  turnResponseMode = useSSE ? 'sse' : 'json';
  const toolCallLog: { name: string; durationMs: number }[] = [];
  const missingServiceSignals: MissingServiceSignal[] = [];
  const loopTimeout = createLoopTimeout();
  const collectedToolResults: Array<{ name: string; result: string }> = [];

  try {
    // Tool-calling loop
    let response: OpenAI.Chat.ChatCompletion | null = null;
    let streamResult: Awaited<ReturnType<typeof streamingGptCall>> | null = null;

    if (useSSE && sse) {
      streamResult = await withRetry(
        () =>
          streamingGptCall(
            client,
            {
              model: MODEL,
              messages,
              tools,
              tool_choice: 'auto',
              temperature: TEMPERATURE,
              max_tokens: 1024,
            },
            sse,
          ),
        {
          onRetry: (attempt, classified) => {
            console.warn(
              `[AI Chat SSE] session=${sessionId.slice(0, 8)}... GPT retry #${attempt} reason=${classified.category}`,
            );
          },
          signal: loopTimeout.signal,
        },
      );
    } else {
      response = await withRetry(
        () =>
          client.chat.completions.create({
            model: MODEL,
            messages,
            tools,
            tool_choice: 'auto',
            temperature: TEMPERATURE,
            max_tokens: 1024,
          }),
        {
          onRetry: (attempt, classified) => {
            console.warn(
              `[AI Chat] session=${sessionId.slice(0, 8)}... GPT retry #${attempt} reason=${classified.category}`,
            );
          },
          signal: loopTimeout.signal,
        },
      );
    }

    let iterations = 0;
    let otpSentDuringSession = false;
    let bookingCompletedDuringSession = false;
    let completedAppointmentId: string | undefined;

    while (iterations < MAX_TOOL_ITERATIONS) {
      const choice = response?.choices[0];
      const streamToolCalls = streamResult?.toolCalls ?? [];
      const hasToolCalls = useSSE
        ? streamToolCalls.length > 0
        : Boolean(
            choice?.finish_reason === 'tool_calls' &&
              choice.message.tool_calls &&
              choice.message.tool_calls.length > 0,
          );

      if (!useSSE && !choice) break;

      // If the model wants to call tools
      if (hasToolCalls) {
        // Add assistant message with tool calls to history
        if (useSSE && streamResult) {
          messages.push(toolCallsToMessage(streamResult));
        } else if (choice) {
          messages.push(choice.message);
        }

        // Execute all tool calls in parallel
        // Note: OpenAI SDK has union types for tool calls, we need explicit narrowing
        const toolCalls: ToolCallRequest[] = [];
        const parsedArgsByCallId = new Map<string, Record<string, unknown>>();
        const modelToolCalls = useSSE
          ? streamToolCalls
          : ((choice?.message.tool_calls ?? []) as Array<{
              id: string;
              function: { name: string; arguments: string };
            }>);
        for (const tc of modelToolCalls) {
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

        // Prevent race: model may call start_verification in the same batch as create_draft.
        // Verification must start only after draft is actually persisted.
        const awaitingContactFlow = Boolean(
          session.context.reservedSlot &&
            !session.context.draftId &&
            session.context.pendingVerificationMethod,
        );
        if (awaitingContactFlow) {
          const hasCreateDraftCall = toolCalls.some((call) => call.name === 'create_draft');
          if (hasCreateDraftCall) {
            for (let i = toolCalls.length - 1; i >= 0; i -= 1) {
              if (toolCalls[i].name === 'start_verification') {
                toolCalls.splice(i, 1);
              }
            }
          }
        }

        if (useSSE && sse) {
          for (const call of toolCalls) {
            sse.sendToolProgress(call.name, mapToolNameToProgressStep(call.name));
          }
        }

        const results = await Promise.all(toolCalls.map(executeTool));
        const contextPatch: Partial<AiSession['context']> = {};
        let reservedSlotJustCreated = false;
        let bookingCompletedInBatch = false;
        let autoVerificationCandidate: { draftId: string } | null = null;
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

          if (result.name !== 'list_services') {
            contextPatch.consultationMode = false;
            contextPatch.consultationTopic = undefined;
            contextPatch.consultationTechnique = undefined;
            contextPatch.awaitingConsultationBookingConfirmation = false;
          }

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
              if (payload.ok) {
                otpSentDuringSession = true;
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
                autoVerificationCandidate = { draftId: payload.draftId };
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
                appointmentId?: string;
              };

              if (payload.ok) {
                bookingCompletedInBatch = true;
                bookingCompletedDuringSession = true;
                completedAppointmentId =
                  typeof payload.appointmentId === 'string'
                    ? payload.appointmentId
                    : completedAppointmentId;
                otpSentDuringSession = false;
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
          let toolOk = true;
          let toolErrorCode: string | undefined;
          let toolErrorMessageSafe: string | undefined;
          try {
            const parsedToolResult = JSON.parse(result.result) as {
              error?: string;
              code?: string;
              message?: string;
            };
            if (parsedToolResult?.error) {
              toolOk = false;
              toolErrorCode =
                parsedToolResult.code ||
                parsedToolResult.error.slice(0, 64);
              toolErrorMessageSafe =
                parsedToolResult.message ||
                parsedToolResult.error.slice(0, 512);
            }
          } catch {
            // Keep defaults when tool result is not JSON.
          }

          turn.addToolRun({
            toolName: result.name,
            step: mapToolNameToProgressStep(result.name),
            durationMs: result.durationMs,
            ok: toolOk,
            errorCode: toolErrorCode,
            errorMessageSafe: toolErrorMessageSafe,
            startedAt: new Date(Date.now() - result.durationMs),
          });

          toolCallLog.push({ name: result.name, durationMs: result.durationMs });
          collectedToolResults.push({ name: result.name, result: result.result });
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
            inputMode: 'text',
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
          const text = buildRegistrationMethodChoiceText(session.locale, {
            voiceMode: isVoiceTurn,
          });
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
              inputMode: verifyRes?.ok ? 'otp' : undefined,
            });
          }

          // Fallback: method not selected yet -> present choice after draft creation.
          const text = buildVerificationMethodChoiceText(session.locale, {
            hasEmail: Boolean(draftForChoice?.email),
            hasPhone: Boolean(draftForChoice?.phone),
            voiceMode: isVoiceTurn,
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
        if (loopTimeout.isExpired()) {
          console.warn(
            `[AI Chat] session=${sessionId.slice(0, 8)}... loop timeout after ${iterations} iterations`,
          );
          break;
        }

        if (useSSE && sse) {
          streamResult = await withRetry(
            () =>
              streamingGptCall(
                client,
                {
                  model: MODEL,
                  messages,
                  tools,
                  tool_choice: 'auto',
                  temperature: TEMPERATURE,
                  max_tokens: 1024,
                },
                sse,
              ),
            {
              onRetry: (attempt, classified) => {
                console.warn(
                  `[AI Chat SSE] session=${sessionId.slice(0, 8)}... GPT retry #${attempt} (iter=${iterations}) reason=${classified.category}`,
                );
              },
              signal: loopTimeout.signal,
            },
          );
          response = null;
        } else {
          response = await withRetry(
            () =>
              client.chat.completions.create({
                model: MODEL,
                messages,
                tools,
                tool_choice: 'auto',
                temperature: TEMPERATURE,
                max_tokens: 1024,
              }),
            {
              onRetry: (attempt, classified) => {
                console.warn(
                  `[AI Chat] session=${sessionId.slice(0, 8)}... GPT retry #${attempt} (iter=${iterations}) reason=${classified.category}`,
                );
              },
              signal: loopTimeout.signal,
            },
          );
        }

        iterations++;
        continue;
      }

      // Model returned a text response — we're done
      break;
    }
    turnIterations = iterations;

    // Extract final text
    let text = '';
    if (useSSE) {
      text =
        typeof streamResult?.content === 'string' ? streamResult.content.trim() : '';
    } else {
      const finalMessage = response?.choices[0]?.message;
      text =
        typeof finalMessage?.content === 'string'
          ? finalMessage.content.trim()
          : '';
    }

    // If model ended without text (e.g. too many tool iterations), force a final textual reply.
    if (!text) {
      try {
        if (useSSE && sse) {
          const forced = await withRetry(
            () =>
              streamingGptCall(
                client,
                {
                  model: MODEL,
                  messages,
                  tools,
                  tool_choice: 'none',
                  temperature: TEMPERATURE,
                  max_tokens: 512,
                },
                sse,
              ),
            {
              maxRetries: 1,
              onRetry: (attempt, classified) => {
                console.warn(
                  `[AI Chat SSE] session=${sessionId.slice(0, 8)}... forced-reply retry #${attempt} reason=${classified.category}`,
                );
              },
              signal: loopTimeout.signal,
            },
          );
          streamResult = forced;
          text =
            typeof forced.content === 'string' ? forced.content.trim() : '';
        } else {
          const forced = await withRetry(
            () =>
              client.chat.completions.create({
                model: MODEL,
                messages,
                tools,
                tool_choice: 'none',
                temperature: TEMPERATURE,
                max_tokens: 512,
              }),
            {
              maxRetries: 1,
              onRetry: (attempt, classified) => {
                console.warn(
                  `[AI Chat] session=${sessionId.slice(0, 8)}... forced-reply retry #${attempt} reason=${classified.category}`,
                );
              },
              signal: loopTimeout.signal,
            },
          );
          const finalMessage = forced.choices[0]?.message;
          text =
            typeof finalMessage?.content === 'string'
              ? finalMessage.content.trim()
              : '';
        }
      } catch (forceError) {
        console.warn('[AI Chat] Forced final response failed:', forceError);
      }
    }

    if (!text) {
      text = fallbackTextByLocale(session.locale);
      if (useSSE && sse) {
        sse.sendDelta(text);
      }
    }

    const assistantMessageId = `assistant-${Date.now()}`;
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

    const finalInputMode = bookingCompletedDuringSession
      ? 'text'
      : otpSentDuringSession
        ? 'otp'
        : undefined;

    trackMetrics({
      isGptCall: true,
      isStreaming: useSSE,
      toolCalls: toolCallLog,
      bookingCompleted: bookingCompletedDuringSession,
      appointmentId: bookingCompletedDuringSession
        ? (completedAppointmentId ?? getSession(sessionId)?.context.draftId ?? session.context.draftId)
        : undefined,
    });

    if (useSSE && sse) {
      sse.sendMeta({
        inputMode: finalInputMode,
        sessionId,
        messageId: assistantMessageId,
        toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
      });
      return new NextResponse(sse.stream, {
        headers: SSE_HEADERS,
      }) as unknown as NextResponse<ChatResponse | { error: string }>;
    }

    return NextResponse.json({
      text,
      sessionId,
      toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
      inputMode: finalInputMode,
    });
  } catch (error) {
    const classified = classifyError(error);

    console.error(
      `[AI Chat] session=${sessionId.slice(0, 8)}... GPT error category=${classified.category} retryable=${classified.retryable}`,
      error instanceof Error ? error.message : error,
    );

    trackMetrics({
      isGptCall: true,
      isStreaming: useSSE,
      toolCalls: toolCallLog,
      error: true,
      retried: true,
    });
    turnRetried = true;

    const fallbackText = buildToolFallbackText(collectedToolResults, session.locale);
    if (fallbackText) {
      turnOutcome = 'degraded';
      console.log(
        `[AI Chat] session=${sessionId.slice(0, 8)}... using tool-based fallback response`,
      );
      appendSessionMessage(sessionId, 'assistant', fallbackText);

      if (useSSE && sse) {
        sse.sendDelta(fallbackText);
        sse.sendMeta({
          sessionId,
          degraded: true,
          toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
        });
        return new NextResponse(sse.stream, {
          headers: SSE_HEADERS,
        }) as unknown as NextResponse<ChatResponse | { error: string }>;
      }

      return NextResponse.json({
        text: fallbackText,
        sessionId,
        toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
      });
    }

    const userErrorText = buildErrorText(classified, session.locale);
    const httpStatus = classified.category === 'rate_limit' ? 429 : 500;
    turnOutcome = classified.category === 'timeout' ? 'timeout' : 'error';
    turnErrorCategory = classified.category;
    turnErrorCode = classified.category;
    turnErrorMessageSafe =
      classified.original instanceof Error
        ? classified.original.message
        : userErrorText;

    if (useSSE && sse) {
      sse.sendError(userErrorText);
      return new NextResponse(sse.stream, {
        headers: SSE_HEADERS,
      }) as unknown as NextResponse<ChatResponse | { error: string }>;
    }

    return NextResponse.json(
      {
        error: userErrorText,
        category: classified.category,
        retryable: classified.retryable,
      },
      { status: httpStatus },
    );
  } finally {
    loopTimeout.clear();
  }
  } finally {
    if (!analyticsTracked) {
      trackMetrics({
        isFastPath: true,
      });
    }
    try {
      const latestSession = getSession(sessionId);
      const latestContext = latestSession?.context ?? session.context;
      const chatHistory = latestContext.chatHistory ?? [];
      const lastAssistantMessage = [...chatHistory]
        .reverse()
        .find((entry) => entry.role === 'assistant')?.content;

      if (turnUsedGpt) {
        turn.setGptCall(turnIterations).setResponseMode(turnResponseMode);
      } else {
        turn.setFastPath('fast-path');
      }

      if (turnRetried) {
        turn.setRetried();
      }

      if (turnOutcome === 'degraded') {
        turn.setDegraded();
      } else if (turnOutcome === 'timeout') {
        turn.setTimeout();
      } else if (turnOutcome === 'error') {
        turn.setError(turnErrorCategory, turnErrorCode, turnErrorMessageSafe);
      }

      if (lastAssistantMessage) {
        turn.setAssistantMessage(lastAssistantMessage);
      }

      turn.setFunnelStage(detectFunnelStage(latestContext)).save();
    } catch (turnSaveError) {
      console.error(
        `[AI Turn] session=${sessionId.slice(0, 8)}... save failed`,
        turnSaveError,
      );
    }
  }
}



// // src/app/api/ai/chat/route.ts
// // AI assistant endpoint using OpenAI Chat Completions with function calling.

// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai';
// import { buildSystemPrompt } from '@/lib/ai/system-prompt';
// import { TOOLS } from '@/lib/ai/tools-schema';
// import { executeTool, type ToolCallRequest } from '@/lib/ai/tool-executor';
// import {
//   createSSEWriter,
//   SSE_HEADERS,
// } from '@/lib/ai/sse-stream';
// import { streamingGptCall, toolCallsToMessage } from '@/lib/ai/streaming-gpt';
// import {
//   type AiSession,
//   getSession,
//   upsertSession,
//   checkRateLimit,
//   appendSessionMessage,
// } from '@/lib/ai/session-store';
// import {
//   initSessionAnalytics,
//   trackRequestMetrics,
//   detectFunnelStage,
//   type RequestMetrics,
// } from '@/lib/ai/ai-analytics';
// import { TurnBuilder } from '@/lib/ai/turn-tracker';
// import {
//   withRetry,
//   createLoopTimeout,
//   classifyError,
//   buildErrorText,
//   buildToolFallbackText,
// } from '@/lib/ai/resilience';
// import { reportMissingServiceInquiry } from '@/lib/ai/missing-service-report';
// import { searchAvailabilityMonth } from '@/lib/ai/tools/search-month';
// import { searchAvailability } from '@/lib/ai/tools/search-availability';
// import { listServices } from '@/lib/ai/tools/list-services';
// import { listMastersForServices } from '@/lib/ai/tools/list-masters';
// import { reserveSlot } from '@/lib/ai/tools/reserve-slot';
// import { startVerification } from '@/lib/ai/tools/start-verification';
// import {
//   buildRegistrationMethodChoiceText,
//   detectRegistrationMethodChoice,
//   buildVerificationMethodChoiceText,
//   detectVerificationMethodChoice,
//   getContactForMethod,
// } from '@/lib/ai/verification-choice';
// import {
//   buildKnowledgeBrowsLashesDetailsText,
//   buildKnowledgeBrowsLashesComparisonText,
//   buildKnowledgeBrowsLashesStyleText,
//   buildKnowledgeConsultationStartText,
//   buildKnowledgePmuHealingText,
//   buildKnowledgePmuLipsChoiceText,
//   buildKnowledgeHydrafacialGoalText,
//   buildKnowledgeHydrafacialDetailsText,
//   buildKnowledgeHydrafacialComparisonText,
//   buildKnowledgeOccasionText,
//   buildKnowledgeConsultationStyleText,
//   buildKnowledgePmuContraindicationsText,
//   buildKnowledgePmuTechniqueDetailsText,
//   buildKnowledgePmuTechniqueContraindicationsText,
//   buildKnowledgePmuTechniqueSafetyText,
//   buildKnowledgeSystemMessage,
//   detectKnowledgeOccasion,
//   detectKnowledgeConsultationStyle,
//   detectKnowledgeConsultationTopic,
//   detectKnowledgeHydrafacialGoal,
//   detectKnowledgePmuTechnique,
//   buildKnowledgePmuTechniqueText,
//   buildKnowledgeLocationHoursText,
//   getKnowledgeMenuOptions,
//   isKnowledgeBrowsLashesDetailsIntent,
//   isKnowledgeBrowsLashesComparisonIntent,
//   isKnowledgeDetailsIntent,
//   isKnowledgeHydrafacialDetailsIntent,
//   isKnowledgeHydrafacialComparisonIntent,
//   isKnowledgeLocationHoursIntent,
//   isKnowledgePmuContraindicationsIntent,
//   isKnowledgePmuHealingIntent,
//   isKnowledgePmuLipsChoiceIntent,
//   isConsultationIntentByKnowledge,
// } from '@/lib/ai/knowledge';
// import { prisma } from '@/lib/prisma';

// // ─── Config ─────────────────────────────────────────────────────

// const MAX_TOOL_ITERATIONS = parseInt(
//   process.env.AI_MAX_TOOL_ITERATIONS || '8',
//   10,
// );
// const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
// const TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE || '0.15');

// function getClient(): OpenAI | null {
//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) return null;
//   return new OpenAI({ apiKey });
// }

// // ─── Types ──────────────────────────────────────────────────────

// interface ChatRequest {
//   sessionId: string;
//   message: string;
//   locale?: string;
//   inputMode?: 'text' | 'voice' | 'otp';
//   stream?: boolean;
//   forceGpt?: boolean;
// }

// interface ChatResponse {
//   text: string;
//   sessionId: string;
//   toolCalls?: { name: string; durationMs: number }[];
// }

// interface MissingServiceSignal {
//   query: string;
//   suggestedAlternatives: Array<{
//     title: string;
//     groupTitle?: string | null;
//     durationMin?: number | null;
//     priceCents?: number | null;
//   }>;
// }

// interface DateSuggestionOption {
//   dateISO: string;
//   label: string;
//   count: number;
// }

// const AFFIRMATIVE_MESSAGES = new Set([
//   'yes',
//   'yeah',
//   'yep',
//   'sure',
//   'ok',
//   'okay',
//   'check',
//   'ja',
//   'да',
//   'ага',
//   'ок',
//   'хорошо',
//   'проверь',
//   'проверяй',
//   'покажи',
//   'показать',
//   'show',
//   'дa',
// ]);

// function normalizeInput(text: string): string {
//   return text.toLowerCase().replace(/\s+/g, ' ').trim();
// }

// function isAffirmativeFollowUp(text: string): boolean {
//   const value = normalizeInput(text);
//   if (AFFIRMATIVE_MESSAGES.has(value)) return true;
//   // tolerate simple typos like "порверь"
//   return (
//     value.includes('пров') ||
//     value.includes('check') ||
//     value.includes('покаж') ||
//     value.includes('show')
//   );
// }

// function isNearestDateRequest(text: string): boolean {
//   const value = normalizeInput(text);
//   return (
//     value === 'ближайшая дата' ||
//     value === 'ближайший день' ||
//     value === 'nearest date' ||
//     value === 'next date' ||
//     value === 'nächstes datum' ||
//       value === 'naechstes datum'
//   );
// }

// function isTomorrowRequest(text: string): boolean {
//   const value = normalizeInput(text);
//   return value === 'завтра' || value === 'tomorrow' || value === 'morgen';
// }

// function looksLikeMonthNameDateInput(text: string): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;

//   if (
//     /(?:^|[^\p{L}\p{N}])\d{1,2}\s+(январ[ья]?|феврал[ья]?|март[а]?|апрел[ья]?|ма[йя]|июн[ья]?|июл[ья]?|август[а]?|сентябр[ья]?|октябр[ья]?|ноябр[ья]?|декабр[ья]?)(?:$|[^\p{L}\p{N}])/u.test(
//       value,
//     )
//   ) {
//     return true;
//   }

//   if (
//     /(?:^|[^\p{L}\p{N}])\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:$|[^\p{L}\p{N}])/u.test(
//       value,
//     )
//   ) {
//     return true;
//   }

//   if (
//     /(?:^|[^\p{L}\p{N}])\d{1,2}\s+(januar|februar|maerz|märz|april|mai|juni|juli|august|september|oktober|november|dezember)(?:$|[^\p{L}\p{N}])/u.test(
//       value,
//     )
//   ) {
//     return true;
//   }

//   return false;
// }

// function detectPreferredTimeInput(
//   text: string,
// ): 'morning' | 'afternoon' | 'evening' | 'any' | null {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return null;

//   const hasNegation = /\b(не|not|kein|keine|nicht)\b/u.test(value);
//   const hasMorning =
//     /\b(утро|утром|утра|morning|vormittag)\b/u.test(value) ||
//     value.includes('am vormittag');
//   const hasAfternoon =
//     /\b(день|днем|днём|дня|afternoon|nachmittag)\b/u.test(value) ||
//     value.includes('am nachmittag') ||
//     value.includes('после обеда');
//   const hasEvening =
//     /\b(вечер|вечером|вечера|evening|abend)\b/u.test(value) ||
//     value.includes('am abend');

//   if (
//     /\b(любое время|в любое время|любой|any time|anytime|egal|any)\b/u.test(value)
//   ) {
//     return 'any';
//   }

//   if (hasMorning && hasNegation && !hasAfternoon && !hasEvening) {
//     // "не подходит утро" -> default to daytime slots.
//     return 'afternoon';
//   }

//   if (hasMorning) return 'morning';
//   if (hasAfternoon) return 'afternoon';
//   if (hasEvening) return 'evening';

//   return null;
// }

// function extractPreferredStartTimeInput(text: string): string | null {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return null;

//   const hhmm = value.match(/\b([01]?\d|2[0-3])\s*[:.]\s*([0-5]\d)\b/u);
//   if (hhmm) {
//     const hh = hhmm[1].padStart(2, '0');
//     const mm = hhmm[2];
//     return `${hh}:${mm}`;
//   }

//   const hhSpaced = value.match(/\b([01]?\d|2[0-3])\s+([0-5]\d)\b/u);
//   if (hhSpaced) {
//     const hh = hhSpaced[1].padStart(2, '0');
//     const mm = hhSpaced[2];
//     return `${hh}:${mm}`;
//   }

//   for (const [phrase, hour] of RU_SPOKEN_HOUR_MAP) {
//     if (
//       value.includes(`${phrase} ноль ноль`) ||
//       value.includes(`${phrase} 00`) ||
//       value.includes(`${phrase} ровно`)
//     ) {
//       return `${String(hour).padStart(2, '0')}:00`;
//     }
//   }

//   return null;
// }

// const TIME_PREFERENCE_INPUTS = new Set<string>([
//   'утро',
//   'утром',
//   'утра',
//   'день',
//   'днем',
//   'днём',
//   'дня',
//   'после обеда',
//   'вечер',
//   'вечером',
//   'вечера',
//   'morning',
//   'afternoon',
//   'evening',
//   'vormittag',
//   'am vormittag',
//   'nachmittag',
//   'am nachmittag',
//   'abend',
//   'am abend',
//   'any',
//   'любое время',
//   'в любое время',
// ]);

// const RU_MONTH_NUMBER_MAP: Record<string, number> = {
//   январ: 1,
//   январь: 1,
//   января: 1,
//   феврал: 2,
//   февраль: 2,
//   февраля: 2,
//   март: 3,
//   марта: 3,
//   апрел: 4,
//   апрель: 4,
//   апреля: 4,
//   май: 5,
//   мая: 5,
//   июн: 6,
//   июнь: 6,
//   июня: 6,
//   июл: 7,
//   июль: 7,
//   июля: 7,
//   август: 8,
//   августа: 8,
//   сентябр: 9,
//   сентябрь: 9,
//   сентября: 9,
//   октябр: 10,
//   октябрь: 10,
//   октября: 10,
//   ноябр: 11,
//   ноябрь: 11,
//   ноября: 11,
//   декабр: 12,
//   декабрь: 12,
//   декабря: 12,
// };

// const RU_SPOKEN_HOUR_MAP: Array<[string, number]> = [
//   ['двадцать три', 23],
//   ['двадцать два', 22],
//   ['двадцать один', 21],
//   ['двадцать', 20],
//   ['девятнадцать', 19],
//   ['восемнадцать', 18],
//   ['семнадцать', 17],
//   ['шестнадцать', 16],
//   ['пятнадцать', 15],
//   ['четырнадцать', 14],
//   ['тринадцать', 13],
//   ['двенадцать', 12],
//   ['одиннадцать', 11],
//   ['десять', 10],
//   ['девять', 9],
//   ['восемь', 8],
//   ['семь', 7],
//   ['шесть', 6],
//   ['пять', 5],
//   ['четыре', 4],
//   ['три', 3],
//   ['два', 2],
//   ['две', 2],
//   ['один', 1],
//   ['одна', 1],
//   ['ноль', 0],
// ];

// const BOOKING_DOMAIN_KEYWORDS = [
//   // RU
//   'запис',
//   'брон',
//   'термин',
//   'прием',
//   'услуг',
//   'спис',
//   'цена',
//   'цен',
//   'прайс',
//   'прайс-лист',
//   'стоим',
//   'стоимост',
//   'мастер',
//   'салон',
//   'адрес',
//   'часы',
//   'маник',
//   'ногтев',
//   'дизайн',
//   'педик',
//   'ресниц',
//   'бров',
//   'перманент',
//   'микронед',
//   'мезо',
//   'стриж',
//   'окраш',
//   'код подтверждения',
//   'консультац',
//   'подбор',
//   'подберите',
//   'что подойдет',
//   'что подойдёт',
//   'pmu',
//   // DE
//   'termin',
//   'buch',
//   'leistung',
//   'preise',
//   'preis',
//   'kosten',
//   'liste',
//   'meister',
//   'salon',
//   'adresse',
//   'öffnungs',
//   'oeffnungs',
//   'nagel',
//   'pedik',
//   'wimper',
//   'augenbrau',
//   'permanent',
//   'pmu',
//   'haarschnitt',
//   'coloring',
//   'bestätigungscode',
//   'beratung',
//   'konsultation',
//   'empfehlung',
//   // EN
//   'book',
//   'booking',
//   'appointment',
//   'service',
//   'services',
//   'price',
//   'prices',
//   'cost',
//   'costs',
//   'list',
//   'master',
//   'salon',
//   'address',
//   'hours',
//   'nails',
//   'pedicure',
//   'lashes',
//   'brows',
//   'permanent',
//   'pmu',
//   'haircut',
//   'verification code',
//   'consultation',
//   'consult',
//   'recommendation',
//   'recommend',
//   'help choose',
// ];

// const RESEND_CODE_HINTS = [
//   'новый код',
//   'код еще раз',
//   'код ещё раз',
//   'отправь код',
//   'resend',
//   'send code again',
//   'new code',
//   'code again',
//   'erneut',
//   'neuer code',
//   'code erneut',
// ];

// function looksLikeDateOrTimeSelection(text: string): boolean {
//   const value = normalizeInput(text);
//   if (!value) return false;
//   if (isNearestDateRequest(value) || isTomorrowRequest(value)) return true;
//   if (TIME_PREFERENCE_INPUTS.has(value)) return true;
//   if (detectPreferredTimeInput(value)) return true;
//   if (looksLikeMonthNameDateInput(value)) return true;
//   if (extractPreferredStartTimeInput(value)) return true;
//   if (/\b\d{1,2}[:.]\d{2}\s*[–-]\s*\d{1,2}[:.]\d{2}\b/.test(value)) return true;
//   if (/\b\d{1,2}[./-]\d{1,2}\b/.test(value)) return true;
//   return false;
// }

// function looksLikeContactPayload(text: string): boolean {
//   const value = text.trim();
//   if (!value) return false;
//   const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value);
//   const hasPhone = /(?:\+?\d[\d\s().-]{6,}\d)/.test(value);
//   const hasPhoneIntent = /\b(телефон|номер|phone|mobile|handy|kontakt|контакт|telegram|телеграм|whatsapp)\b/iu.test(
//     value,
//   );
//   const spokenNumberTokens =
//     value.match(
//       /\b(плюс|plus|ноль|нуль|один|одна|два|две|три|четыре|пять|шесть|семь|восемь|девять|десять|одиннадцать|двенадцать|тринадцать|четырнадцать|пятнадцать|шестнадцать|семнадцать|восемнадцать|девятнадцать|двадцать|тридцать|сорок|пятьдесят|шестьдесят|семьдесят|восемьдесят|девяносто|сто|двести|триста|четыреста|пятьсот|шестьсот|семьсот|восемьсот|девятьсот)\b/giu,
//     ) ?? [];
//   const hasSpokenPhone = hasPhoneIntent && spokenNumberTokens.length >= 3;
//   const hasObfuscatedEmail =
//     /[A-Z0-9._%+-]+(?:\s*|[-_.]?)(?:sobaka|собака)(?:\s*|[-_.]?)[A-Z0-9.-]+(?:\.[A-Z]{2,})+/iu.test(
//       value,
//     ) ||
//     /\b(email|e-mail|почта|емейл|имейл|майл)\b/iu.test(value) ||
//     /(sobaka|собака)/iu.test(value);
//   return hasEmail || hasPhone || hasObfuscatedEmail || hasSpokenPhone;
// }

// function looksLikeServiceOptionPayload(text: string): boolean {
//   const value = normalizeInput(text);
//   if (!value) return false;
//   // UI option payload: "<service> — 60 мин., 35,00 €" (or "min.")
//   return /[—–-]\s*\d{1,3}\s*(?:мин\.?|min\.?)/iu.test(value);
// }

// function looksLikePricedOptionPayload(text: string): boolean {
//   const value = normalizeInput(text);
//   if (!value) return false;
//   // UI option payload used in consultation blocks: "<service> — ... 55 €"
//   return /[—–-].*\d{1,4}(?:[.,]\d{1,2})?\s*€/iu.test(value);
// }

// function isLikelyBookingDomainMessage(text: string): boolean {
//   const normalizedInput = normalizeInput(text);
//   if (!normalizedInput) return false;

//   if (looksLikeServiceOptionPayload(text)) return true;
//   if (looksLikeDateOrTimeSelection(text)) return true;
//   if (looksLikeContactPayload(text)) return true;
//   if (/^\d{6}$/.test(normalizedInput)) return true; // OTP code
//   if (isNearestDateRequest(text) || isTomorrowRequest(text) || isAffirmativeFollowUp(text)) {
//     return true;
//   }
//   if (parseDayMonth(normalizedInput)) return true;

//   return BOOKING_DOMAIN_KEYWORDS.some((keyword) => normalizedInput.includes(keyword));
// }

// function mapToolNameToProgressStep(toolName: string): string {
//   switch (toolName) {
//     case 'list_services':
//       return 'loading_services';
//     case 'list_masters_for_services':
//       return 'loading_masters';
//     case 'search_availability':
//     case 'search_availability_month':
//       return 'searching_slots';
//     case 'reserve_slot':
//       return 'reserving_slot';
//     case 'create_draft':
//       return 'creating_draft';
//     case 'start_verification':
//       return 'sending_otp';
//     case 'complete_booking':
//       return 'confirming_booking';
//     default:
//       return `tool:${toolName}`;
//   }
// }

// function isConsultationOperationalBookingInput(text: string): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;
//   if (looksLikeDateOrTimeSelection(text)) return true;
//   if (isAffirmativeFollowUp(text)) return true;

//   const hints = [
//     'выбрать дату',
//     'выбери дату',
//     'время',
//     'дата',
//     'мастер',
//     'slot',
//     'date',
//     'time',
//     'master',
//     'uhrzeit',
//     'datum',
//     'meister',
//     'записаться',
//     'запись',
//     'book',
//     'booking',
//     'buchen',
//     'buchung',
//   ];
//   return hints.some((h) => value.includes(h));
// }

// function isServiceAvailabilityInquiry(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;
//   if (looksLikeServiceOptionPayload(text) || looksLikePricedOptionPayload(text)) return false;
//   if (looksLikeDateOrTimeSelection(text)) return false;

//   const serviceHints = [
//     'маник',
//     'ногт',
//     'педик',
//     'бров',
//     'ресниц',
//     'перманент',
//     'pmu',
//     'hydra',
//     'hydrafacial',
//     'стриж',
//     'окраш',
//     'lifting',
//     'lash',
//     'brow',
//     'nail',
//     'nagel',
//     'wimper',
//     'augenbrau',
//     'haarschnitt',
//   ];
//   const hasServiceHint = serviceHints.some((hint) => value.includes(hint));
//   if (!hasServiceHint) return false;

//   const hasQuestionMark = /[?？]/u.test(text);

//   if (locale === 'ru') {
//     const ruCues = [
//       'есть ли',
//       'есть у вас',
//       'у вас есть',
//       'а есть',
//       'интересует',
//       'меня интересует',
//       'интересует услуга',
//       'интересуюсь',
//       'предлагаете',
//       'делаете',
//       'оказываете',
//       'имеется',
//       'видел на сайте',
//       'видела на сайте',
//       'на сайте в услугах',
//       'в списке услуг',
//       'в прайсе',
//     ];
//     return hasQuestionMark || ruCues.some((cue) => value.includes(cue));
//   }
//   if (locale === 'en') {
//     const enCues = [
//       'do you have',
//       'is there',
//       'do you offer',
//       'interested in',
//       'i am interested in',
//       'offer',
//       'i saw on the site',
//       'on your site',
//       'in your services list',
//     ];
//     return hasQuestionMark || enCues.some((cue) => value.includes(cue));
//   }
//   const deCues = [
//     'gibt es',
//     'bieten sie',
//     'habt ihr',
//     'haben sie',
//     'interessiere mich',
//     'ich interessiere mich',
//     'ich habe auf der website gesehen',
//     'auf ihrer website',
//     'in der leistungsliste',
//   ];
//   return hasQuestionMark || deCues.some((cue) => value.includes(cue));
// }

// type ConsultationTechnique = NonNullable<
//   AiSession['context']['consultationTechnique']
// >;
// type ConsultationTopic = NonNullable<AiSession['context']['consultationTopic']>;

// type SelectionCatalogGroup = {
//   id: string;
//   title: string;
//   services: Array<{
//     id: string;
//     title: string;
//     durationMin: number;
//     priceCents: number | null;
//   }>;
// };

// type SelectionCatalogService = {
//   id: string;
//   title: string;
//   groupTitle: string;
// };

// function getConsultationTechniqueBookingLabels(
//   locale: 'de' | 'ru' | 'en',
//   technique: ConsultationTechnique,
// ): string[] {
//   if (technique === 'powder_brows') {
//     return locale === 'ru'
//       ? ['Пудровые брови', 'Powder Brows']
//       : locale === 'en'
//         ? ['Powder Brows', 'Пудровые брови']
//         : ['Powder Brows', 'Пудровые брови'];
//   }
//   if (technique === 'hairstroke_brows') {
//     return locale === 'ru'
//       ? ['Волосковая техника', 'Hairstroke Brows']
//       : locale === 'en'
//         ? ['Hairstroke Brows', 'Волосковая техника']
//         : ['Hairstroke Brows', 'Волосковая техника'];
//   }
//   if (technique === 'aquarell_lips') {
//     return locale === 'ru'
//       ? ['Акварельные губы', 'Aquarell Lips']
//       : locale === 'en'
//         ? ['Aquarelle Lips', 'Акварельные губы']
//         : ['Aquarell Lips', 'Акварельные губы'];
//   }
//   if (technique === 'lips_3d') {
//     return locale === 'ru'
//       ? ['3D губы', '3D Lips']
//       : locale === 'en'
//         ? ['3D Lips', '3D губы']
//         : ['3D Lips', '3D губы'];
//   }
//   if (technique === 'upper_lower') {
//     return locale === 'ru'
//       ? ['Межресничка верх+низ', 'Верх+низ', 'Wimpernkranz oben + unten']
//       : locale === 'en'
//         ? ['Upper + lower lash line', 'Lash line upper + lower', 'Межресничка верх+низ']
//         : ['Wimpernkranz oben + unten', 'Oben + unten', 'Межресничка верх+низ'];
//   }
//   return locale === 'ru'
//     ? ['Межресничка', 'Lash line', 'Wimpernkranz']
//     : locale === 'en'
//       ? ['Lash line', 'Межресничка', 'Wimpernkranz']
//       : ['Wimpernkranz', 'Lash line', 'Межресничка'];
// }

// function isLikelyPmuGroupTitle(title: string): boolean {
//   const value = normalizeChoiceText(title);
//   return (
//     value.includes('pmu') ||
//     value.includes('перманент') ||
//     value.includes('permanent')
//   );
// }

// function isLikelyComboOrCorrectionService(title: string): boolean {
//   const raw = title.toLowerCase();
//   const normalized = normalizeChoiceText(title);
//   return (
//     normalized.includes('комбо') ||
//     normalized.includes('combo') ||
//     normalized.includes('коррек') ||
//     normalized.includes('correction') ||
//     normalized.includes('refresh') ||
//     normalized.includes('nachbehandlung') ||
//     normalized.includes('auffrisch') ||
//     raw.includes('+')
//   );
// }

// function resolveConsultationTechniqueService(
//   locale: 'de' | 'ru' | 'en',
//   technique: ConsultationTechnique,
//   groups: SelectionCatalogGroup[],
// ): SelectionCatalogService | null {
//   const flatServices: SelectionCatalogService[] = groups.flatMap((group) =>
//     group.services.map((service) => ({
//       id: service.id,
//       title: service.title,
//       groupTitle: group.title,
//     })),
//   );
//   if (flatServices.length === 0) return null;

//   const pmuPool = flatServices.filter(
//     (service) =>
//       isLikelyPmuGroupTitle(service.groupTitle) ||
//       isLikelyPmuGroupTitle(service.title),
//   );
//   const pool = pmuPool.length > 0 ? pmuPool : flatServices;
//   const labels = getConsultationTechniqueBookingLabels(locale, technique).map((label) =>
//     normalizeChoiceText(label),
//   );

//   const browsRe = /(бров|brow|augenbrau)/u;
//   const lipsRe = /(губ|lip|lipp)/u;
//   const lashRe = /(межреснич|lash line|lashline|wimpernkranz)/u;
//   const upperLowerRe = /(верх.*низ|upper.*lower|oben.*unten)/u;
//   const powderRe = /(powder|пудров|puder)/u;
//   const hairstrokeRe = /(hairstroke|волосков|härchen|haerchen)/u;
//   const aquarellRe = /(aquarell|акварел)/u;
//   const lips3dRe = /(3d)/u;

//   let best: SelectionCatalogService | null = null;
//   let bestScore = 0;

//   for (const service of pool) {
//     const normalizedTitle = normalizeChoiceText(service.title);
//     let score = 0;

//     if (labels.some((label) => label === normalizedTitle)) {
//       score += 1200;
//     }
//     if (
//       labels.some(
//         (label) =>
//           label.length > 0 &&
//           (normalizedTitle.includes(label) || label.includes(normalizedTitle)),
//       )
//     ) {
//       score += 250;
//     }

//     if (isLikelyPmuGroupTitle(service.groupTitle)) score += 120;
//     if (isLikelyComboOrCorrectionService(service.title)) score -= 900;

//     switch (technique) {
//       case 'powder_brows':
//         if (powderRe.test(normalizedTitle)) score += 900;
//         if (browsRe.test(normalizedTitle)) score += 150;
//         if (
//           hairstrokeRe.test(normalizedTitle) ||
//           aquarellRe.test(normalizedTitle) ||
//           lips3dRe.test(normalizedTitle) ||
//           lipsRe.test(normalizedTitle) ||
//           lashRe.test(normalizedTitle)
//         ) {
//           score -= 450;
//         }
//         break;
//       case 'hairstroke_brows':
//         if (hairstrokeRe.test(normalizedTitle)) score += 900;
//         if (browsRe.test(normalizedTitle)) score += 150;
//         if (
//           powderRe.test(normalizedTitle) ||
//           aquarellRe.test(normalizedTitle) ||
//           lips3dRe.test(normalizedTitle) ||
//           lipsRe.test(normalizedTitle) ||
//           lashRe.test(normalizedTitle)
//         ) {
//           score -= 450;
//         }
//         break;
//       case 'aquarell_lips':
//         if (aquarellRe.test(normalizedTitle)) score += 900;
//         if (lipsRe.test(normalizedTitle)) score += 150;
//         if (
//           powderRe.test(normalizedTitle) ||
//           hairstrokeRe.test(normalizedTitle) ||
//           lips3dRe.test(normalizedTitle) ||
//           browsRe.test(normalizedTitle) ||
//           lashRe.test(normalizedTitle)
//         ) {
//           score -= 450;
//         }
//         break;
//       case 'lips_3d':
//         if (lips3dRe.test(normalizedTitle)) score += 850;
//         if (lipsRe.test(normalizedTitle)) score += 150;
//         if (
//           aquarellRe.test(normalizedTitle) ||
//           powderRe.test(normalizedTitle) ||
//           hairstrokeRe.test(normalizedTitle) ||
//           browsRe.test(normalizedTitle) ||
//           lashRe.test(normalizedTitle)
//         ) {
//           score -= 450;
//         }
//         break;
//       case 'lashline':
//         if (lashRe.test(normalizedTitle)) score += 900;
//         if (upperLowerRe.test(normalizedTitle)) score -= 280;
//         if (browsRe.test(normalizedTitle) || lipsRe.test(normalizedTitle)) score -= 420;
//         break;
//       case 'upper_lower':
//         if (upperLowerRe.test(normalizedTitle)) score += 1000;
//         if (lashRe.test(normalizedTitle)) score += 120;
//         if (browsRe.test(normalizedTitle) || lipsRe.test(normalizedTitle)) score -= 420;
//         break;
//     }

//     if (score > bestScore) {
//       bestScore = score;
//       best = service;
//     }
//   }

//   return bestScore > 0 ? best : null;
// }

// function buildConsultationBookingConfirmText(
//   locale: 'de' | 'ru' | 'en',
//   technique: ConsultationTechnique,
// ): string {
//   const display = getConsultationTechniqueBookingLabels(locale, technique)[0];
//   if (locale === 'ru') {
//     return `Подтвердите, пожалуйста: записываем вас на услугу "${display}"?\n\n[option] ✅ Да, записаться на ${display} [/option]\n[option] 🔁 Выбрать другую услугу [/option]`;
//   }
//   if (locale === 'en') {
//     return `Please confirm: should I book you for "${display}"?\n\n[option] ✅ Yes, book ${display} [/option]\n[option] 🔁 Choose another service [/option]`;
//   }
//   return `Bitte bestätigen: Soll ich Sie für "${display}" eintragen?\n\n[option] ✅ Ja, ${display} buchen [/option]\n[option] 🔁 Andere Leistung wählen [/option]`;
// }

// function buildConsultationTechniqueSuitabilityText(
//   locale: 'de' | 'ru' | 'en',
//   technique: ConsultationTechnique,
// ): string {
//   const serviceTitle = getConsultationTechniqueBookingLabels(locale, technique)[0];
//   return buildSelectedServiceSuitabilityText(
//     locale,
//     serviceTitle,
//     locale === 'ru'
//       ? 'ПЕРМАНЕНТНЫЙ МАКИЯЖ'
//       : locale === 'en'
//         ? 'PERMANENT MAKEUP'
//         : 'PERMANENT MAKE-UP',
//   );
// }

// function buildHydrafacialSelectedServiceDetailsText(
//   locale: 'de' | 'ru' | 'en',
//   serviceTitle: string,
// ): string | null {
//   const titleNorm = normalizeChoiceText(serviceTitle);
//   const bookingCta =
//     locale === 'ru'
//       ? '[option] 📅 Подобрать время и записаться [/option]'
//       : locale === 'en'
//         ? '[option] 📅 Pick time and book [/option]'
//         : '[option] 📅 Zeit finden und buchen [/option]';

//   if (titleNorm.includes('signature')) {
//     if (locale === 'ru') {
//       return `Signature Hydrafacial 🌿 Базовый формат: глубокое очищение, мягкая экстракция и интенсивное увлажнение.
// Подходит для регулярного ухода и быстрого «освежения» кожи без восстановления.

// ${bookingCta}`;
//     }
//     if (locale === 'en') {
//       return `Signature Hydrafacial 🌿 Base format: deep cleansing, gentle extraction and intense hydration.
// Best for regular maintenance and a quick skin refresh with zero downtime.

// ${bookingCta}`;
//     }
//     return `Signature Hydrafacial 🌿 Basisformat: Tiefenreinigung, sanfte Extraktion und intensive Hydration.
// Ideal für regelmäßige Pflege und einen schnellen Frische-Effekt ohne Ausfallzeit.

// ${bookingCta}`;
//   }

//   if (titleNorm.includes('deluxe')) {
//     if (locale === 'ru') {
//       return `Deluxe Hydrafacial ✨ Всё из Signature + усиленный пилинг и LED-терапия.
// Подходит, если кожа выглядит уставшей или тусклой и нужен более заметный результат.

// ${bookingCta}`;
//     }
//     if (locale === 'en') {
//       return `Deluxe Hydrafacial ✨ Everything in Signature + intensive peel and LED therapy.
// Great if skin looks tired or dull and you want a more visible glow result.

// ${bookingCta}`;
//     }
//     return `Deluxe Hydrafacial ✨ Enthält alles aus Signature + intensives Peeling und LED-Therapie.
// Ideal bei müder, fahler Haut für einen sichtbareren Glow-Effekt.

// ${bookingCta}`;
//   }

//   if (titleNorm.includes('platinum')) {
//     if (locale === 'ru') {
//       return `Platinum Hydrafacial 👑 Всё из Deluxe + лимфодренаж и премиум-сыворотки.
// Максимально насыщенный формат для выраженного glow-эффекта и подготовки к событию.

// ${bookingCta}`;
//     }
//     if (locale === 'en') {
//       return `Platinum Hydrafacial 👑 Everything in Deluxe + lymphatic drainage and premium serums.
// Our most intensive format for maximum glow and event-level skin prep.

// ${bookingCta}`;
//     }
//     return `Platinum Hydrafacial 👑 Enthält alles aus Deluxe + Lymphdrainage und Premium-Seren.
// Unser intensivstes Format für maximalen Glow und Event-Vorbereitung.

// ${bookingCta}`;
//   }

//   return null;
// }

// function buildHydrafacialSelectedServiceSuitabilityText(
//   locale: 'de' | 'ru' | 'en',
//   serviceTitle: string,
// ): string | null {
//   const titleNorm = normalizeChoiceText(serviceTitle);
//   const bookingCta =
//     locale === 'ru'
//       ? '[option] 📅 Подобрать время и записаться [/option]'
//       : locale === 'en'
//         ? '[option] 📅 Pick time and book [/option]'
//         : '[option] 📅 Zeit finden und buchen [/option]';

//   if (titleNorm.includes('signature')) {
//     if (locale === 'ru') {
//       return `Signature Hydrafacial 🌿 Кому подходит:
// • как регулярный базовый уход раз в 4–6 недель;
// • если хочется глубокого очищения и свежего тона без агрессивного воздействия;
// • как первый Hydrafacial для знакомства с процедурой.

// ${bookingCta}`;
//     }
//     if (locale === 'en') {
//       return `Signature Hydrafacial 🌿 Best for:
// • regular baseline care every 4-6 weeks;
// • deep cleansing + hydration with a gentle feel;
// • first-time Hydrafacial clients.

// ${bookingCta}`;
//     }
//     return `Signature Hydrafacial 🌿 Geeignet für:
// • regelmäßige Basispflege alle 4-6 Wochen;
// • Tiefenreinigung + Hydration mit sanftem Verlauf;
// • Hydrafacial-Einstieg beim ersten Termin.

// ${bookingCta}`;
//   }

//   if (titleNorm.includes('deluxe')) {
//     if (locale === 'ru') {
//       return `Deluxe Hydrafacial ✨ Кому подходит:
// • если кожа выглядит уставшей/тусклой;
// • при неровном тоне, когда нужен заметный glow;
// • перед важным событием, когда нужен более выраженный эффект.

// ${bookingCta}`;
//     }
//     if (locale === 'en') {
//       return `Deluxe Hydrafacial ✨ Best for:
// • tired or dull-looking skin;
// • uneven tone when you want more visible glow;
// • pre-event skin prep with a stronger result.

// ${bookingCta}`;
//     }
//     return `Deluxe Hydrafacial ✨ Geeignet für:
// • müde oder fahle Haut;
// • ungleichmäßigen Teint mit Wunsch nach mehr Glow;
// • Event-Vorbereitung mit sichtbarerem Effekt.

// ${bookingCta}`;
//   }

//   if (titleNorm.includes('platinum')) {
//     if (locale === 'ru') {
//       return `Platinum Hydrafacial 👑 Кому подходит:
// • если нужен максимально выраженный glow-эффект;
// • при сухой/обезвоженной коже для интенсивного насыщения;
// • перед мероприятиями (фото, свадьба, важная встреча).

// ${bookingCta}`;
//     }
//     if (locale === 'en') {
//       return `Platinum Hydrafacial 👑 Best for:
// • maximum glow and premium-level skin prep;
// • dry or dehydrated skin needing intensive hydration;
// • major events (photos, wedding, important meetings).

// ${bookingCta}`;
//     }
//     return `Platinum Hydrafacial 👑 Geeignet für:
// • maximalen Glow und intensives Premium-Treatment;
// • trockene/dehydrierte Haut mit hohem Pflegebedarf;
// • große Anlässe (Fotos, Hochzeit, wichtige Termine).

// ${bookingCta}`;
//   }

//   return null;
// }

// function isSelectedServiceSuitabilityIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;

//   if (locale === 'ru') {
//     return (
//       value.includes('кому подходит') ||
//       value.includes('для кого') ||
//       value.includes('подойдет') ||
//       value.includes('подойдёт') ||
//       value.includes('подходит ли') ||
//       value.includes('мне подойдет') ||
//       value.includes('сухая кожа') ||
//       value.includes('жирная кожа') ||
//       value.includes('чувствительная кожа')
//     );
//   }

//   if (locale === 'en') {
//     return (
//       value.includes('who is it for') ||
//       value.includes('who does it suit') ||
//       value.includes('is it suitable') ||
//       value.includes('am i suitable') ||
//       value.includes('dry skin') ||
//       value.includes('sensitive skin')
//     );
//   }

//   return (
//     value.includes('fur wen') ||
//     value.includes('für wen') ||
//     value.includes('geeignet') ||
//     value.includes('passt das') ||
//     value.includes('trockene haut') ||
//     value.includes('empfindliche haut')
//   );
// }

// function buildSelectedServiceSuitabilityText(
//   locale: 'de' | 'ru' | 'en',
//   serviceTitle: string,
//   groupTitle?: string,
// ): string {
//   const bookingCta =
//     locale === 'ru'
//       ? '[option] 📅 Подобрать время и записаться [/option]'
//       : locale === 'en'
//         ? '[option] 📅 Pick time and book [/option]'
//         : '[option] 📅 Zeit finden und buchen [/option]';

//   const technique = detectKnowledgePmuTechnique(serviceTitle, locale);
//   if (technique === 'powder_brows') {
//     return locale === 'ru'
//       ? `Powder Brows 🌸 Подходит, если хотите максимально мягкий и натуральный эффект без резких границ.

// ${bookingCta}`
//       : locale === 'en'
//         ? `Powder Brows 🌸 Great if you want the softest, most natural brow result without sharp edges.

// ${bookingCta}`
//         : `Powder Brows 🌸 Ideal, wenn Sie einen besonders weichen, natürlichen Effekt ohne harte Konturen möchten.

// ${bookingCta}`;
//   }
//   if (technique === 'hairstroke_brows') {
//     return locale === 'ru'
//       ? `Hairstroke Brows 🌸 Подходит, если хотите более структурный и выразительный «волосковый» результат.

// ${bookingCta}`
//       : locale === 'en'
//         ? `Hairstroke Brows 🌸 Best if you want a more defined, textured hair-stroke look.

// ${bookingCta}`
//         : `Hairstroke Brows 🌸 Geeignet, wenn Sie ein deutlicheres, strukturiertes Härchen-Ergebnis möchten.

// ${bookingCta}`;
//   }
//   if (technique === 'aquarell_lips') {
//     return locale === 'ru'
//       ? `Aquarell Lips 🌸 Подходит, если нужен деликатный натуральный оттенок губ на каждый день.

// ${bookingCta}`
//       : locale === 'en'
//         ? `Aquarell Lips 🌸 Great for a soft, natural everyday lip tint.

// ${bookingCta}`
//         : `Aquarell Lips 🌸 Ideal für einen sanften, natürlichen Farbton im Alltag.

// ${bookingCta}`;
//   }
//   if (technique === 'lips_3d') {
//     return locale === 'ru'
//       ? `3D Lips 🌸 Подходит, если хотите более насыщенный оттенок и визуально более объёмный эффект.

// ${bookingCta}`
//       : locale === 'en'
//         ? `3D Lips 🌸 Best if you prefer a richer color and a visually fuller lip effect.

// ${bookingCta}`
//         : `3D Lips 🌸 Geeignet, wenn Sie einen intensiveren Ton und mehr optisches Volumen wünschen.

// ${bookingCta}`;
//   }

//   const combined = `${normalizeChoiceText(groupTitle ?? '')} ${normalizeChoiceText(serviceTitle)}`;
//   const isHydrafacial =
//     combined.includes('hydra') ||
//     combined.includes('hydrafacial') ||
//     combined.includes('гидра');
//   if (isHydrafacial) {
//     return (
//       buildHydrafacialSelectedServiceSuitabilityText(locale, serviceTitle) ??
//       buildKnowledgeHydrafacialDetailsText(locale)
//     );
//   }

//   const browsLashesRe = /(бров|ресниц|lash|brow|wimper|augenbrau)/u;
//   if (browsLashesRe.test(combined)) {
//     return locale === 'ru'
//       ? `Эта процедура подходит, если хотите улучшить форму бровей/ресниц и получить аккуратный результат без длительного восстановления 🌸

// ${bookingCta}`
//       : locale === 'en'
//         ? `This treatment is suitable if you want cleaner brow/lash shape and a polished look with minimal downtime 🌸

// ${bookingCta}`
//         : `Diese Behandlung passt, wenn Sie Brauen/Wimpern sauber formen und ein gepflegtes Ergebnis ohne lange Ausfallzeit möchten 🌸

// ${bookingCta}`;
//   }

//   if (locale === 'ru') {
//     return `${serviceTitle} 🌸
// Подходит, если хотите аккуратный, стойкий результат и минимум времени на ежедневный макияж/уход.

// ${bookingCta}`;
//   }
//   if (locale === 'en') {
//     return `${serviceTitle} 🌸
// Suitable if you want a polished long-lasting result and less daily makeup/styling effort.

// ${bookingCta}`;
//   }
//   return `${serviceTitle} 🌸
// Geeignet, wenn Sie ein gepflegtes, langanhaltendes Ergebnis und weniger täglichen Styling-Aufwand möchten.

// ${bookingCta}`;
// }

// function buildSelectedServiceDetailsText(
//   locale: 'de' | 'ru' | 'en',
//   serviceTitle: string,
//   groupTitle?: string,
//   durationMin?: number,
// ): string {
//   const technique = detectKnowledgePmuTechnique(serviceTitle, locale);
//   if (technique) {
//     return buildKnowledgePmuTechniqueDetailsText(locale, technique);
//   }

//   const combined = `${normalizeChoiceText(groupTitle ?? '')} ${normalizeChoiceText(serviceTitle)}`;
//   const isHydrafacial =
//     combined.includes('hydra') ||
//     combined.includes('hydrafacial') ||
//     combined.includes('гидра');
//   if (isHydrafacial) {
//     return (
//       buildHydrafacialSelectedServiceDetailsText(locale, serviceTitle) ??
//       buildKnowledgeHydrafacialDetailsText(locale)
//     );
//   }

//   const browsLashesRe = /(бров|ресниц|lash|brow|wimper|augenbrau)/u;
//   if (browsLashesRe.test(combined)) {
//     return buildKnowledgeBrowsLashesDetailsText(locale);
//   }

//   const durationText =
//     typeof durationMin === 'number' && durationMin > 0
//       ? locale === 'ru'
//         ? `Длительность: около **${durationMin} мин.**.`
//         : locale === 'en'
//           ? `Duration: about **${durationMin} min**.`
//           : `Dauer: etwa **${durationMin} Min.**.`
//       : locale === 'ru'
//         ? 'Длительность зависит от выбранного формата.'
//         : locale === 'en'
//           ? 'Duration depends on the selected format.'
//           : 'Die Dauer hängt vom gewählten Format ab.';

//   const nailsRe = /(маник|ногт|педик|nail|nagel|manik)/u;
//   if (nailsRe.test(combined)) {
//     if (locale === 'ru') {
//       return `${serviceTitle} 💅
// Классический маникюр обычно включает придание формы ногтям, обработку кутикулы и аккуратный уход за ногтевой пластиной.
// ${durationText}
// Перед визитом лучше сообщить, есть ли чувствительность кожи или предыдущее покрытие, чтобы мастер подобрал комфортный формат процедуры.

// [option] 📅 Подобрать время и записаться [/option]`;
//     }
//     if (locale === 'en') {
//       return `${serviceTitle} 💅
// Classic manicure usually includes nail shaping, cuticle care, and neat basic nail treatment.
// ${durationText}
// Before the visit, it helps to mention any skin sensitivity or existing coating so the master can choose the most comfortable procedure format.

// [option] 📅 Pick time and book [/option]`;
//     }
//     return `${serviceTitle} 💅
// Eine klassische Maniküre umfasst in der Regel Nagelform, Nagelhautpflege und eine saubere Basispflege der Nägel.
// ${durationText}
// Vor dem Termin ist es hilfreich, eventuelle Hautempfindlichkeit oder vorhandenes Material zu erwähnen, damit die Meisterin das passende Vorgehen wählt.

// [option] 📅 Zeit finden und buchen [/option]`;
//   }

//   const hairRe = /(стриж|волос|окраш|hair|haarschnitt|farbe)/u;
//   if (hairRe.test(combined)) {
//     if (locale === 'ru') {
//       return `${serviceTitle} ✂️
// Это услуга по стрижке/волосам с подбором формы под тип волос и желаемый результат.
// ${durationText}
// Перед визитом удобно подготовить референс (фото желаемого результата), чтобы быстрее согласовать длину и форму.

// [option] 📅 Подобрать время и записаться [/option]`;
//     }
//     if (locale === 'en') {
//       return `${serviceTitle} ✂️
// This is a haircut/hair service where shape is adjusted to your hair type and desired result.
// ${durationText}
// It is useful to bring a reference photo so the length and shape can be aligned quickly.

// [option] 📅 Pick time and book [/option]`;
//     }
//     return `${serviceTitle} ✂️
// Das ist eine Haar-/Schnittleistung, bei der Form und Ergebnis auf Ihren Haartyp abgestimmt werden.
// ${durationText}
// Ein Referenzfoto ist hilfreich, damit Länge und Form schnell abgestimmt werden können.

// [option] 📅 Zeit finden und buchen [/option]`;
//   }

//   if (locale === 'ru') {
//     return `${serviceTitle} 🌸
// Это услуга из нашего каталога. Могу помочь подобрать формат, мастера и ближайшее время.

// [option] 📅 Подобрать время и записаться [/option]`;
//   }
//   if (locale === 'en') {
//     return `${serviceTitle} 🌸
// This service is available in our catalog. I can help choose format, specialist, and nearest time.

// [option] 📅 Pick time and book [/option]`;
//   }
//   return `${serviceTitle} 🌸
// Diese Leistung ist in unserem Katalog verfügbar. Ich helfe gern bei Auswahl von Format, Meisterin und nächster freier Zeit.

// [option] 📅 Zeit finden und buchen [/option]`;
// }

// function isConsultationBookingConfirmIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;
//   if (isAffirmativeFollowUp(text)) return true;

//   if (locale === 'ru') {
//     return (
//       value.includes('да, запис') ||
//       value.includes('да запис') ||
//       value.includes('подтвержда') ||
//       value.includes('записываем')
//     );
//   }
//   if (locale === 'en') {
//     return (
//       value.includes('yes, book') ||
//       value.includes('yes book') ||
//       value.includes('confirm') ||
//       value.includes('book this')
//     );
//   }
//   return (
//     value.includes('ja, buch') ||
//     value.includes('ja buch') ||
//     value.includes('bestatige') ||
//     value.includes('bestätige')
//   );
// }

// function isConsultationBookingDeclineIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;
//   if (value === 'нет' || value === 'no' || value === 'nein') return true;

//   if (locale === 'ru') {
//     return (
//       value.includes('другую услуг') ||
//       value.includes('выбрать другую') ||
//       value.includes('не эту')
//     );
//   }
//   if (locale === 'en') {
//     return value.includes('another service') || value.includes('not this');
//   }
//   return value.includes('andere leistung') || value.includes('nicht diese');
// }

// function looksLikeNameOnlyPayload(text: string): boolean {
//   const value = text.trim();
//   if (!value || value.length > 60) return false;
//   if (/[?！？]/u.test(value)) return false;
//   if (/\d/.test(value)) return false;

//   const parts = value
//     .replace(/[.,!;:]+/gu, ' ')
//     .split(/\s+/)
//     .map((p) => p.trim())
//     .filter(Boolean);

//   if (parts.length === 0 || parts.length > 3) return false;

//   return parts.every((p) => /^[\p{L}'-]{2,}$/u.test(p));
// }

// function looksLikeOtpCode(text: string): boolean {
//   const value = normalizeInput(text);
//   return /^\d{4,8}$/.test(value);
// }

// function looksLikeResendRequest(text: string): boolean {
//   const value = normalizeInput(text);
//   return RESEND_CODE_HINTS.some((hint) => value.includes(hint));
// }

// function shouldApplyScopeGuard(
//   text: string,
//   session: AiSession,
//   options?: { voiceMode?: boolean },
// ): boolean {
//   const voiceMode = Boolean(options?.voiceMode);
//   const normalizedInput = normalizeInput(text);
//   if (!normalizedInput) return false;
//   const awaitingContact = Boolean(session.context.reservedSlot && !session.context.draftId);
//   const awaitingOtp = Boolean(session.context.draftId);

//   if (session.context.awaitingRegistrationMethod) {
//     // During method-selection step allow only explicit method clicks/texts.
//     if (detectRegistrationMethodChoice(text, { voiceMode })) return false;
//     return true;
//   }

//   if (awaitingContact) {
//     // Contact collection in voice mode is often free-form and noisy.
//     // Avoid scope-guard loops while we are explicitly waiting for contact data.
//     if (looksLikeContactPayload(text) || looksLikeNameOnlyPayload(text)) return false;
//     if (session.context.pendingVerificationMethod) return false;
//     return true;
//   }

//   if (awaitingOtp) {
//     // During OTP step allow code, resend requests, email correction and simple confirmations.
//     if (
//       looksLikeOtpCode(text) ||
//       looksLikeResendRequest(text) ||
//       looksLikeContactPayload(text) ||
//       isAffirmativeFollowUp(text)
//     ) {
//       return false;
//     }
//     return true;
//   }

//   // In consultation mode allow free-form consultation dialogue and do not
//   // force menu/scope answers unless a booking flow is active.
//   if (session.context.consultationMode) {
//     return false;
//   }

//   // If any booking context exists, allow domain-adjacent free-form user phrasing.
//   // This prevents accidental guard triggers in active voice flows.
//   const hasAnyBookingState = Boolean(
//     (session.context.selectedServiceIds?.length ?? 0) > 0 ||
//       session.context.selectedMasterId ||
//       session.context.reservedSlot ||
//       session.context.draftId ||
//       session.context.pendingVerificationMethod ||
//       session.context.awaitingRegistrationMethod ||
//       session.context.awaitingVerificationMethod ||
//       session.context.lastDateISO ||
//       (session.context.lastSuggestedDateOptions?.length ?? 0) > 0,
//   );
//   if (hasAnyBookingState) {
//     return false;
//   }

//   // Always allow clearly booking-related messages.
//   if (isLikelyBookingDomainMessage(text)) return false;

//   // Outside booking scope: block any non-domain chat/small-talk/trivia.
//   return true;
// }

// function buildScopeGuardText(
//   locale: 'de' | 'ru' | 'en',
//   hasActiveBookingFlow: boolean,
// ): string {
//   const options = getKnowledgeMenuOptions(locale)
//     .map((item) => `[option] ${item} [/option]`)
//     .join('\n');

//   if (locale === 'ru') {
//     const header = hasActiveBookingFlow
//       ? 'Я помогаю только с записью и вопросами о салоне. Давайте продолжим текущую запись.'
//       : 'Я помогаю только с записью и вопросами о салоне.';
//     const continueOption = hasActiveBookingFlow
//       ? '[option] ✅ Продолжить запись [/option]\n'
//       : '';
//     return `${header}\n\n${continueOption}${options}`;
//   }

//   if (locale === 'en') {
//     const header = hasActiveBookingFlow
//       ? 'I can only help with salon bookings and service questions. Let us continue your current booking.'
//       : 'I can only help with salon bookings and service questions.';
//     const continueOption = hasActiveBookingFlow
//       ? '[option] ✅ Continue booking [/option]\n'
//       : '';
//     return `${header}\n\n${continueOption}${options}`;
//   }

//   const header = hasActiveBookingFlow
//     ? 'Ich helfe nur bei Terminbuchung und Salonfragen. Lassen Sie uns Ihre aktuelle Buchung fortsetzen.'
//     : 'Ich helfe nur bei Terminbuchung und Salonfragen.';
//   const continueOption = hasActiveBookingFlow
//     ? '[option] ✅ Buchung fortsetzen [/option]\n'
//     : '';
//   return `${header}\n\n${continueOption}${options}`;
// }

// function buildMainMenuText(locale: 'de' | 'ru' | 'en'): string {
//   const options = getKnowledgeMenuOptions(locale)
//     .map((item) => `[option] ${item} [/option]`)
//     .join('\n');

//   if (locale === 'ru') {
//     return `Готово, вернула в начало 🌸 Чем могу помочь?\n\n${options}`;
//   }
//   if (locale === 'en') {
//     return `Done, I returned to the main menu 🌸 How can I help?\n\n${options}`;
//   }
//   return `Erledigt, ich bin zurück im Hauptmenü 🌸 Wobei kann ich helfen?\n\n${options}`;
// }

// function isGreetingIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   if (isLikelyBookingDomainMessage(text)) return false;
//   if (looksLikeServiceOptionPayload(text) || looksLikePricedOptionPayload(text)) return false;

//   const normalized = normalizeInput(text)
//     .replace(/ё/g, 'е')
//     .replace(/[!?.,;:]+/g, ' ')
//     .replace(/\s+/g, ' ')
//     .trim();
//   if (!normalized) return false;

//   const maxTokens = 5;
//   if (normalized.split(' ').length > maxTokens) return false;

//   if (locale === 'ru') {
//     const greetings = new Set([
//       'привет',
//       'приветик',
//       'здравствуй',
//       'здравствуйте',
//       'доброе утро',
//       'добрый день',
//       'добрый вечер',
//       'салют',
//     ]);
//     return greetings.has(normalized);
//   }
//   if (locale === 'en') {
//     const greetings = new Set([
//       'hi',
//       'hello',
//       'hey',
//       'good morning',
//       'good afternoon',
//       'good evening',
//     ]);
//     return greetings.has(normalized);
//   }

//   const greetings = new Set([
//     'hallo',
//     'hi',
//     'hey',
//     'guten morgen',
//     'guten tag',
//     'guten abend',
//     'servus',
//     'moin',
//   ]);
//   return greetings.has(normalized);
// }

// function buildGreetingText(locale: 'de' | 'ru' | 'en'): string {
//   if (locale === 'ru') {
//     return 'Привет! 👋 Рада тебя видеть. Я помогу записаться, подобрать услугу или подсказать цены и свободное время. Что выберем?';
//   }
//   if (locale === 'en') {
//     return 'Hello! 👋 Nice to see you. I can help with booking, choosing a service, prices, and available time slots. What would you like to do?';
//   }
//   return 'Hallo! 👋 Schön, Sie zu sehen. Ich helfe bei Terminbuchung, Serviceauswahl, Preisen und freien Zeiten. Womit möchten Sie starten?';
// }

// function formatDateLabel(dateISO: string, locale: 'de' | 'ru' | 'en'): string {
//   const [y, m, d] = dateISO.split('-').map((v) => parseInt(v, 10));
//   const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12, 0, 0));
//   const fmtLocale = locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'de-DE';
//   return dt.toLocaleDateString(fmtLocale, {
//     weekday: 'short',
//     day: '2-digit',
//     month: '2-digit',
//   });
// }

// function buildCancelBookingOption(locale: 'de' | 'ru' | 'en'): string {
//   return locale === 'ru'
//     ? '[option] ❌ Отменить текущую запись [/option]'
//     : locale === 'en'
//       ? '[option] ❌ Cancel current booking [/option]'
//       : '[option] ❌ Aktuelle Buchung abbrechen [/option]';
// }

// function buildNoSlotsFollowUpText(
//   locale: 'de' | 'ru' | 'en',
//   optionsMap: DateSuggestionOption[],
// ): string {
//   const cancelOption = buildCancelBookingOption(locale);
//   if (optionsMap.length === 0) {
//     if (locale === 'ru') {
//       return `К сожалению, в ближайшие даты свободных окон не нашлось. Хотите, я проверю другого мастера?\n\n${cancelOption}`;
//     }
//     if (locale === 'en') {
//       return `Unfortunately, I could not find free slots in the nearest dates. Do you want me to check another master?\n\n${cancelOption}`;
//     }
//     return `Leider habe ich in den nächsten Tagen keine freien Slots gefunden. Soll ich einen anderen Meister prüfen?\n\n${cancelOption}`;
//   }

//   const header =
//     locale === 'ru'
//       ? 'Нашла ближайшие свободные дни. Какой день проверить по времени?'
//       : locale === 'en'
//         ? 'I found the nearest available days. Which day should I check for exact times?'
//         : 'Ich habe die nächsten freien Tage gefunden. Welchen Tag soll ich mit Uhrzeiten prüfen?';

//   const optionEmoji = locale === 'ru' ? '📅' : '📅';
//   const options = optionsMap
//     .slice(0, 6)
//     .map(
//       (opt) =>
//         `[option] ${optionEmoji} ${opt.label} (${opt.count}) [/option]`,
//     )
//     .join('\n');

//   const manualHint =
//     locale === 'ru'
//       ? 'Или укажите желаемую дату в формате ДД.ММ (например, 10.03).'
//       : locale === 'en'
//         ? 'Or type your preferred date in DD.MM format (for example, 10.03).'
//         : 'Oder geben Sie Ihr Wunschdatum im Format TT.MM ein (zum Beispiel 10.03).';

//   return `${header}\n\n${options}\n${cancelOption}\n\n${manualHint}`;
// }

// function mapMonthDaysToOptions(
//   days: Record<string, number> | undefined,
//   locale: 'de' | 'ru' | 'en',
// ): DateSuggestionOption[] {
//   return Object.entries(days ?? {})
//     .sort(([a], [b]) => a.localeCompare(b))
//     .map(([dateISO, count]) => ({
//       dateISO,
//       label: formatDateLabel(dateISO, locale),
//       count,
//     }));
// }

// function normalizeSuggestedDateInput(value: string): string {
//   return normalizeChoiceText(value)
//     .replace(/\(\s*\d+\s*\)/g, '')
//     .replace(/\s+/g, ' ')
//     .trim();
// }

// function parseDayMonth(value: string): string | null {
//   const m = value.match(
//     /(?:^|[^\p{L}\p{N}])(\d{1,2})[./-](\d{1,2})(?:$|[^\p{L}\p{N}])/u,
//   );
//   if (!m) return null;
//   const day = Number.parseInt(m[1], 10);
//   const month = Number.parseInt(m[2], 10);
//   if (Number.isNaN(day) || Number.isNaN(month)) return null;
//   if (day < 1 || day > 31) return null;
//   if (month < 1 || month > 12) return null;
//   return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`;
// }

// function dateIsoToDayMonth(dateISO: string): string {
//   const [, month, day] = dateISO.split('-');
//   return `${day}.${month}`;
// }

// function todayISO(): string {
//   return new Date().toISOString().slice(0, 10);
// }

// function shiftDateISO(dateISO: string, days: number): string {
//   const dt = new Date(`${dateISO}T00:00:00.000Z`);
//   if (Number.isNaN(dt.getTime())) return dateISO;
//   dt.setUTCDate(dt.getUTCDate() + days);
//   return dt.toISOString().slice(0, 10);
// }

// function nextMonthISO(monthISO: string): string {
//   const [year, month] = monthISO
//     .split('-')
//     .map((part) => Number.parseInt(part, 10));
//   if (!year || !month) return monthISO;
//   const dt = new Date(Date.UTC(year, month - 1, 1));
//   if (Number.isNaN(dt.getTime())) return monthISO;
//   dt.setUTCMonth(dt.getUTCMonth() + 1);
//   return dt.toISOString().slice(0, 7);
// }

// function toISODate(year: number, month: number, day: number): string | null {
//   if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
//     return null;
//   }
//   if (month < 1 || month > 12 || day < 1 || day > 31) return null;

//   const dt = new Date(Date.UTC(year, month - 1, day));
//   if (
//     Number.isNaN(dt.getTime()) ||
//     dt.getUTCFullYear() !== year ||
//     dt.getUTCMonth() !== month - 1 ||
//     dt.getUTCDate() !== day
//   ) {
//     return null;
//   }

//   return dt.toISOString().slice(0, 10);
// }

// function parseExplicitDateInputToISO(
//   input: string,
//   referenceDateISO: string,
// ): string | null {
//   const dayMonth = parseDayMonth(input);
//   if (!dayMonth) return null;

//   const [dayRaw, monthRaw] = dayMonth.split('.');
//   const day = Number.parseInt(dayRaw, 10);
//   const month = Number.parseInt(monthRaw, 10);
//   if (!day || !month) return null;

//   const referenceYear = Number.parseInt(referenceDateISO.slice(0, 4), 10);
//   const fallbackYear = Number.isInteger(referenceYear)
//     ? referenceYear
//     : new Date().getUTCFullYear();

//   let candidate = toISODate(fallbackYear, month, day);
//   if (!candidate) return null;

//   // If the date for current reference year is already in the past,
//   // interpret it as next year's date.
//   if (candidate < referenceDateISO) {
//     const nextYearCandidate = toISODate(fallbackYear + 1, month, day);
//     if (nextYearCandidate) {
//       candidate = nextYearCandidate;
//     }
//   }

//   return candidate;
// }

// function parseMonthNameDateInputToISO(
//   input: string,
//   referenceDateISO: string,
// ): string | null {
//   const normalized = normalizeInput(input).replace(/ё/g, 'е');
//   const ruMatch = normalized.match(
//     /(?:^|[^\p{L}\p{N}])(\d{1,2})\s+(январ[ья]?|феврал[ья]?|март[а]?|апрел[ья]?|ма[йя]|июн[ья]?|июл[ья]?|август[а]?|сентябр[ья]?|октябр[ья]?|ноябр[ья]?|декабр[ья]?)(?:$|[^\p{L}\p{N}])/u,
//   );

//   if (!ruMatch) return null;

//   const day = Number.parseInt(ruMatch[1], 10);
//   const monthToken = ruMatch[2].toLowerCase();
//   const month = RU_MONTH_NUMBER_MAP[monthToken];
//   if (!day || !month) return null;

//   const referenceYear = Number.parseInt(referenceDateISO.slice(0, 4), 10);
//   const fallbackYear = Number.isInteger(referenceYear)
//     ? referenceYear
//     : new Date().getUTCFullYear();

//   let candidate = toISODate(fallbackYear, month, day);
//   if (!candidate) return null;

//   if (candidate < referenceDateISO) {
//     const nextYearCandidate = toISODate(fallbackYear + 1, month, day);
//     if (nextYearCandidate) {
//       candidate = nextYearCandidate;
//     }
//   }

//   return candidate;
// }

// function parseFlexibleDateInputToISO(
//   input: string,
//   referenceDateISO: string,
// ): string | null {
//   return (
//     parseExplicitDateInputToISO(input, referenceDateISO) ??
//     parseMonthNameDateInputToISO(input, referenceDateISO)
//   );
// }

// async function buildNearestDateOptions(params: {
//   masterId: string;
//   serviceIds: string[];
//   locale: 'de' | 'ru' | 'en';
//   startDateISO: string;
//   minCount?: number;
// }): Promise<DateSuggestionOption[]> {
//   const { masterId, serviceIds, locale, startDateISO } = params;
//   const minCount = params.minCount ?? 6;
//   const byDate = new Map<string, DateSuggestionOption>();

//   const appendDays = (days?: Record<string, number>) => {
//     for (const option of mapMonthDaysToOptions(days, locale)) {
//       if (option.dateISO < startDateISO) continue;
//       if (!byDate.has(option.dateISO)) {
//         byDate.set(option.dateISO, option);
//       }
//     }
//   };

//   const firstMonthISO = startDateISO.slice(0, 7);
//   const firstMonth = await searchAvailabilityMonth({
//     masterId,
//     monthISO: firstMonthISO,
//     serviceIds,
//   });
//   appendDays(firstMonth.days);

//   if (byDate.size < minCount) {
//     const secondMonthISO = nextMonthISO(firstMonthISO);
//     const secondMonth = await searchAvailabilityMonth({
//       masterId,
//       monthISO: secondMonthISO,
//       serviceIds,
//     });
//     appendDays(secondMonth.days);
//   }

//   return Array.from(byDate.values())
//     .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
//     .slice(0, 12);
// }

// function matchSuggestedDateOption(
//   input: string,
//   options: DateSuggestionOption[],
// ): DateSuggestionOption | null {
//   const norm = normalizeSuggestedDateInput(input);
//   if (!norm) return null;

//   for (const option of options) {
//     const optionNorm = normalizeSuggestedDateInput(option.label);
//     if (
//       norm === optionNorm ||
//       norm.includes(optionNorm) ||
//       optionNorm.includes(norm)
//     ) {
//       return option;
//     }
//   }

//   const dm = parseDayMonth(norm);
//   if (dm) {
//     const found = options.find((o) => dateIsoToDayMonth(o.dateISO) === dm);
//     if (found) return found;
//   }

//   return null;
// }

// function buildSlotsForDateText(
//   locale: 'de' | 'ru' | 'en',
//   dateISO: string,
//   slots: Array<{ displayTime: string }>,
// ): string {
//   const cancelOption = buildCancelBookingOption(locale);
//   const label = formatDateLabel(dateISO, locale);
//   if (slots.length === 0) {
//     if (locale === 'ru') {
//       return `На ${label} свободных слотов нет. Хотите, я предложу другие даты?\n\n${cancelOption}`;
//     }
//     if (locale === 'en') {
//       return `There are no free slots on ${label}. Do you want me to suggest other dates?\n\n${cancelOption}`;
//     }
//     return `Für ${label} gibt es keine freien Slots. Soll ich andere Tage vorschlagen?\n\n${cancelOption}`;
//   }

//   const header =
//     locale === 'ru'
//       ? `Вот свободные слоты на ${label}. Какой слот вам подходит?`
//       : locale === 'en'
//         ? `Here are free slots for ${label}. Which time works for you?`
//         : `Hier sind freie Slots für ${label}. Welche Uhrzeit passt Ihnen?`;

//   const options = slots
//     .slice(0, 12)
//     .map((s) => `[option] 🕐 ${s.displayTime} [/option]`)
//     .join('\n');

//   return `${header}\n\n${options}\n${cancelOption}`;
// }

// function buildSlotTakenAlternativesText(
//   locale: 'de' | 'ru' | 'en',
//   dateISO: string,
//   slots: Array<{ displayTime: string }>,
// ): string {
//   const cancelOption = buildCancelBookingOption(locale);
//   const label = formatDateLabel(dateISO, locale);
//   const intro =
//     locale === 'ru'
//       ? `К сожалению, этот слот уже был занят другим клиентом. Давайте проверим другие доступные слоты на ${label}.`
//       : locale === 'en'
//         ? `Unfortunately, that slot has already been taken by another client. Let us check other available times on ${label}.`
//         : `Leider wurde dieser Slot bereits von einem anderen Kunden belegt. Lassen Sie uns andere verfügbare Zeiten am ${label} prüfen.`;

//   if (slots.length === 0) {
//     return `${intro}\n\n${buildNoSlotsFollowUpText(locale, [])}`;
//   }

//   const followUp =
//     locale === 'ru'
//       ? 'Вот альтернативные варианты:\nКакой слот вам подходит?'
//       : locale === 'en'
//         ? 'Here are alternative options:\nWhich slot works for you?'
//         : 'Hier sind alternative Optionen:\nWelcher Slot passt Ihnen?';

//   const options = slots
//     .slice(0, 12)
//     .map((s) => `[option] 🕐 ${s.displayTime} [/option]`)
//     .join('\n');

//   return `${intro}\n${followUp}\n${options}\n${cancelOption}`;
// }

// function matchSlotFromInput(
//   input: string,
//   slots: Array<{ startAt: string; endAt: string; displayTime: string }>,
// ): { startAt: string; endAt: string; displayTime: string } | null {
//   const normalized = normalizeInput(input).replace(/ё/g, 'е');
//   if (!normalized || slots.length === 0) return null;

//   const normalizedRanges = slots.map((slot) => {
//     const range = normalizeInput(slot.displayTime).replace(/\s+/g, '');
//     const start = range.split(/[–-]/)[0];
//     return { slot, range, start };
//   });

//   const compactInput = normalized.replace(/\s+/g, '');

//   for (const item of normalizedRanges) {
//     if (
//       compactInput === item.range ||
//       compactInput.includes(item.range) ||
//       compactInput.includes(item.start)
//     ) {
//       return item.slot;
//     }
//   }

//   const preferredStart = extractPreferredStartTimeInput(normalized);
//   if (!preferredStart) return null;

//   return (
//     normalizedRanges.find((item) => item.start.startsWith(preferredStart))?.slot ??
//     null
//   );
// }

// function fallbackTextByLocale(locale: 'de' | 'ru' | 'en'): string {
//   if (locale === 'ru') {
//     return 'Извините, не удалось сформировать ответ. Хотите, я сразу покажу ближайшие свободные даты?';
//   }
//   if (locale === 'en') {
//     return 'Sorry, I could not generate a response. Do you want me to show the nearest available dates right away?';
//   }
//   return 'Entschuldigung, ich konnte keine Antwort generieren. Soll ich direkt die nächsten freien Termine zeigen?';
// }

// function buildVerificationAutoText(
//   locale: 'de' | 'ru' | 'en',
//   opts: { ok: boolean; contactMasked?: string; error?: string },
// ): string {
//   if (opts.ok) {
//     if (locale === 'ru') {
//       return `Код подтверждения отправлен на ${opts.contactMasked ?? 'ваш email'}.\n\nПожалуйста, введите 6-значный код для завершения бронирования.\n\nЕсли письма нет 1–2 минуты, проверьте папку "Спам".`;
//     }
//     if (locale === 'en') {
//       return `A verification code has been sent to ${opts.contactMasked ?? 'your email'}.\n\nPlease enter the 6-digit code to complete the booking.\n\nIf you do not see the email within 1-2 minutes, check your Spam folder.`;
//     }
//     return `Ein Bestätigungscode wurde an ${opts.contactMasked ?? 'Ihre E-Mail'} gesendet.\n\nBitte geben Sie den 6-stelligen Code ein, um die Buchung abzuschließen.\n\nWenn keine E-Mail innerhalb von 1-2 Minuten kommt, prüfen Sie bitte den Spam-Ordner.`;
//   }

//   if (opts.error === 'PHONE_FORMAT_INVALID') {
//     if (locale === 'ru') {
//       return 'Не удалось отправить SMS: номер телефона в неверном формате.\n\nПожалуйста, укажите номер в международном формате `+49...` или `+38...` и повторите контактные данные.';
//     }
//     if (locale === 'en') {
//       return 'Could not send SMS: phone number format is invalid.\n\nPlease provide the number in international format `+49...` or `+38...` and resend your contact details.';
//     }
//     return 'SMS konnte nicht gesendet werden: Telefonnummer hat ein ungültiges Format.\n\nBitte geben Sie die Nummer im internationalen Format `+49...` oder `+38...` an und senden Sie Ihre Kontaktdaten erneut.';
//   }

//   if (opts.error === 'EMAIL_FORMAT_INVALID') {
//     if (locale === 'ru') {
//       return 'Не удалось отправить код: email указан в неверном формате.\n\nПожалуйста, укажите корректный email в формате `name@example.com`.';
//     }
//     if (locale === 'en') {
//       return 'Could not send code: email format is invalid.\n\nPlease provide a valid email in the `name@example.com` format.';
//     }
//     return 'Der Code konnte nicht gesendet werden: E-Mail-Format ist ungültig.\n\nBitte geben Sie eine korrekte E-Mail im Format `name@example.com` an.';
//   }

//   if (locale === 'ru') {
//     return `Не удалось отправить код подтверждения (${opts.error ?? 'ошибка отправки'}).\n\nПроверьте введённые контактные данные и напишите "отправь код ещё раз".`;
//   }
//   if (locale === 'en') {
//     return `I could not send the verification code (${opts.error ?? 'send error'}).\n\nPlease check your contact data and type "send code again".`;
//   }
//   return `Der Bestätigungscode konnte nicht gesendet werden (${opts.error ?? 'Sendeproblem'}).\n\nBitte prüfen Sie Ihre Kontaktdaten und schreiben Sie "Code erneut senden".`;
// }

// function buildContactCollectionTextForMethod(
//   locale: 'de' | 'ru' | 'en',
//   method: 'email_otp' | 'sms_otp' | 'telegram_otp',
//   options?: { voiceMode?: boolean },
// ): string {
//   const voiceMode = Boolean(options?.voiceMode);
//   if (locale === 'ru') {
//     if (method === 'email_otp') {
//       return 'Вы выбрали подтверждение по Email.\nПожалуйста, укажите ваше имя и адрес электронной почты для завершения записи.\nВаши данные будут использоваться только для управления записью.';
//     }
//     if (method === 'sms_otp') {
//       if (voiceMode) {
//         return 'Вы выбрали подтверждение по SMS.\nПожалуйста, укажите ваше имя и номер телефона для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
//       }
//       return 'Вы выбрали подтверждение по SMS.\nПожалуйста, укажите ваше имя, номер телефона и адрес электронной почты для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
//     }
//     if (voiceMode) {
//       return 'Вы выбрали подтверждение через Telegram.\nПожалуйста, укажите ваше имя и номер телефона (привязанный к Telegram-боту) для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
//     }
//     return 'Вы выбрали подтверждение через Telegram.\nПожалуйста, укажите ваше имя, номер телефона (привязанный к Telegram-боту) и адрес электронной почты для завершения записи.\nНомер телефона указывайте в международном формате: +49... или +38...\nВаши данные будут использоваться только для управления записью.';
//   }

//   if (locale === 'en') {
//     if (method === 'email_otp') {
//       return 'You chose Email verification.\nPlease provide your name and email address to finish the booking.\nYour data will only be used for appointment management.';
//     }
//     if (method === 'sms_otp') {
//       if (voiceMode) {
//         return 'You chose SMS verification.\nPlease provide your name and phone number to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
//       }
//       return 'You chose SMS verification.\nPlease provide your name, phone number, and email address to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
//     }
//     if (voiceMode) {
//       return 'You chose Telegram verification.\nPlease provide your name and phone number (linked to our Telegram bot) to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
//     }
//     return 'You chose Telegram verification.\nPlease provide your name, phone number (linked to our Telegram bot), and email address to finish the booking.\nPhone must be in international format: +49... or +38...\nYour data will only be used for appointment management.';
//   }

//   if (method === 'email_otp') {
//     return 'Sie haben E-Mail-Verifizierung gewählt.\nBitte geben Sie Ihren Namen und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nIhre Daten werden nur zur Terminverwaltung verwendet.';
//   }
//   if (method === 'sms_otp') {
//     if (voiceMode) {
//       return 'Sie haben SMS-Verifizierung gewählt.\nBitte geben Sie Ihren Namen und Ihre Telefonnummer an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
//     }
//     return 'Sie haben SMS-Verifizierung gewählt.\nBitte geben Sie Ihren Namen, Ihre Telefonnummer und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
//   }
//   if (voiceMode) {
//     return 'Sie haben Telegram-Verifizierung gewählt.\nBitte geben Sie Ihren Namen und Ihre Telefonnummer (mit Telegram-Bot verknüpft) an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
//   }
//   return 'Sie haben Telegram-Verifizierung gewählt.\nBitte geben Sie Ihren Namen, Ihre Telefonnummer (mit Telegram-Bot verknüpft) und Ihre E-Mail-Adresse an, um die Buchung abzuschließen.\nDie Telefonnummer bitte im internationalen Format angeben: +49... oder +38...\nIhre Daten werden nur zur Terminverwaltung verwendet.';
// }

// function buildMissingContactForMethodText(
//   locale: 'de' | 'ru' | 'en',
//   method: 'email_otp' | 'sms_otp' | 'telegram_otp',
// ): string {
//   if (locale === 'ru') {
//     if (method === 'email_otp') {
//       return 'Для подтверждения по Email нужен корректный email. Пожалуйста, укажите email и повторите.';
//     }
//     if (method === 'sms_otp') {
//       return 'Для подтверждения по SMS нужен номер телефона в формате +49... или +38.... Пожалуйста, укажите корректный номер и повторите.';
//     }
//     return 'Для подтверждения через Telegram нужен номер телефона, привязанный к Telegram-боту, в формате +49... или +38.... Пожалуйста, укажите корректный номер и повторите.';
//   }

//   if (locale === 'en') {
//     if (method === 'email_otp') {
//       return 'Email verification needs a valid email address. Please provide your email and try again.';
//     }
//     if (method === 'sms_otp') {
//       return 'SMS verification needs a phone number in +49... or +38... format. Please provide a valid number and try again.';
//     }
//     return 'Telegram verification needs a phone number linked to our bot in +49... or +38... format. Please provide a valid number and try again.';
//   }

//   if (method === 'email_otp') {
//     return 'Für die E-Mail-Verifizierung wird eine gültige E-Mail-Adresse benötigt. Bitte E-Mail angeben und erneut versuchen.';
//   }
//   if (method === 'sms_otp') {
//     return 'Für die SMS-Verifizierung wird eine Telefonnummer im Format +49... oder +38... benötigt. Bitte korrekte Nummer angeben und erneut versuchen.';
//   }
//   return 'Für die Telegram-Verifizierung wird eine mit dem Bot verknüpfte Telefonnummer im Format +49... oder +38... benötigt. Bitte korrekte Nummer angeben und erneut versuchen.';
// }

// function buildGoogleHandoffUrl(session: AiSession): string | null {
//   const serviceId = session.context.selectedServiceIds?.[0];
//   const masterId = session.context.selectedMasterId;
//   const reserved = session.context.reservedSlot;

//   if (!serviceId || !masterId || !reserved) return null;

//   const selectedDate = reserved.startAt.slice(0, 10);
//   const params = new URLSearchParams({
//     s: serviceId,
//     m: masterId,
//     start: reserved.startAt,
//     end: reserved.endAt,
//     d: selectedDate,
//   });
//   const path = `/booking/client?${params.toString()}`;

//   const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');
//   return baseUrl ? `${baseUrl}${path}` : path;
// }

// function escapeOptionAttr(value: string): string {
//   return value.replace(/"/g, '%22').replace(/\]/g, '%5D');
// }

// function buildGoogleHandoffText(locale: 'de' | 'ru' | 'en', url: string): string {
//   const safeUrl = escapeOptionAttr(url);

//   if (locale === 'ru') {
//     return `Вы выбрали регистрацию через Google.\nНажмите кнопку ниже, чтобы продолжить в защищённом потоке:\n[option url="${safeUrl}"]🔐 Продолжить через Google[/option]`;
//   }
//   if (locale === 'en') {
//     return `You selected Google registration.\nTap the button below to continue in the secure flow:\n[option url="${safeUrl}"]🔐 Continue with Google[/option]`;
//   }
//   return `Sie haben Google-Registrierung gewählt.\nKlicken Sie auf die Schaltfläche unten, um im sicheren Flow fortzufahren:\n[option url="${safeUrl}"]🔐 Mit Google fortfahren[/option]`;
// }

// function normalizeChoiceText(value: string): string {
//   return value
//     .replace(
//       /^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F]+\s*/u,
//       '',
//     )
//     .toLowerCase()
//     .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
//     .replace(/\s+/g, ' ')
//     .trim();
// }

// function normalizeCatalogSelectionInput(value: string): string {
//   // Strip UI metadata from option clicks:
//   // "Обычный — 60 мин., 35,00 €" -> "Обычный"
//   const compact = value
//     .replace(/\s*[—–-]\s*\d{1,3}\s*(?:мин\.?|min\.?).*$/iu, '')
//     .trim();
//   return normalizeChoiceText(compact);
// }

// function normalizeServiceHintTypos(
//   value: string,
//   locale: 'de' | 'ru' | 'en',
// ): string {
//   let fixed = value;

//   if (locale === 'ru') {
//     fixed = fixed
//       .replace(/\bмаинкюр\b/gu, 'маникюр')
//       .replace(/\bманикур\b/gu, 'маникюр')
//       .replace(/\bпермамент\b/gu, 'перманент')
//       .replace(/\bперманет\b/gu, 'перманент')
//       .replace(/\bстришка\b/gu, 'стрижка');
//   } else if (locale === 'en') {
//     fixed = fixed
//       .replace(/\bmanucure\b/gu, 'manicure')
//       .replace(/\bpeducure\b/gu, 'pedicure')
//       .replace(/\bhair cut\b/gu, 'haircut');
//   } else {
//     fixed = fixed
//       .replace(/\bmanikur\b/gu, 'manikure')
//       .replace(/\bhaar schnitt\b/gu, 'haarschnitt');
//   }

//   return fixed.trim();
// }

// function extractServiceSelectionInput(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): string {
//   const normalized = normalizeInput(text).replace(/ё/g, 'е').trim();
//   if (!normalized) return normalized;

//   let candidate = normalized;

//   if (locale === 'ru') {
//     candidate = candidate
//       .replace(
//         /^(?:пожалуйста\s+)?(?:хочу\s+)?(?:запис(?:аться|ать)?|запись)\s*(?:на\s*)?(?:прием|приём)?\s*(?:на\s*)?/u,
//         '',
//       )
//       .replace(/^(?:мне\s+)?(?:нужно\s+)?(?:запись|записаться)\s*(?:на\s*)?/u, '')
//       .trim();
//   } else if (locale === 'en') {
//     candidate = candidate
//       .replace(
//         /^(?:please\s+)?(?:i\s+want\s+to\s+|i\s+would\s+like\s+to\s+)?(?:book|schedule)\s*(?:an?\s*)?(?:appointment|slot)?\s*(?:for\s*)?/u,
//         '',
//       )
//       .trim();
//   } else {
//     candidate = candidate
//       .replace(
//         /^(?:bitte\s+)?(?:ich\s+m(?:o|ö)chte\s+)?(?:buchen|termin\s+buchen|einen?\s+termin\s+buchen)\s*(?:fur|für)?\s*/u,
//         '',
//       )
//       .trim();
//   }

//   const effective = candidate || normalized;
//   return normalizeServiceHintTypos(effective, locale);
// }

// function tokenizeNormalized(value: string): string[] {
//   return normalizeChoiceText(value)
//     .split(' ')
//     .map((t) => t.trim())
//     .filter((t) => t.length > 1);
// }

// function choiceScore(candidate: string, input: string): number {
//   if (!candidate || !input) return 0;
//   if (candidate === input) return 10000;

//   let score = 0;

//   if (input.includes(candidate)) {
//     score += 400 + candidate.length;
//   }
//   if (candidate.includes(input)) {
//     score += 300 + input.length;
//   }

//   const candTokens = tokenizeNormalized(candidate);
//   const inputTokens = new Set(tokenizeNormalized(input));
//   if (candTokens.length > 0 && inputTokens.size > 0) {
//     const overlap = candTokens.reduce(
//       (acc, token) => (inputTokens.has(token) ? acc + 1 : acc),
//       0,
//     );
//     if (overlap > 0) {
//       score += overlap * 80;
//       if (overlap === candTokens.length) {
//         score += 250;
//       }
//       // Prefer more specific (longer) variants when overlap is similar.
//       score += candTokens.length * 5;
//     }
//   }

//   return score;
// }

// function chooseBestMatch<T>(
//   items: T[],
//   getCandidate: (item: T) => string,
//   input: string,
// ): T | null {
//   let best: T | null = null;
//   let bestScore = 0;

//   for (const item of items) {
//     const candidate = getCandidate(item);
//     const score = choiceScore(candidate, input);
//     if (score > bestScore) {
//       bestScore = score;
//       best = item;
//     }
//   }

//   return bestScore > 0 ? best : null;
// }

// function formatPrice(locale: 'de' | 'ru' | 'en', priceCents: number | null): string {
//   if (priceCents == null) {
//     return locale === 'ru' ? 'цена по запросу' : locale === 'en' ? 'price on request' : 'Preis auf Anfrage';
//   }
//   const value = (priceCents / 100).toFixed(2);
//   const localized = locale === 'en' ? value : value.replace('.', ',');
//   return `${localized} €`;
// }

// function formatServiceOption(
//   locale: 'de' | 'ru' | 'en',
//   service: { title: string; durationMin: number; priceCents: number | null },
//   groupTitle?: string,
// ): string {
//   const minutes = locale === 'ru' ? 'мин.' : 'min.';
//   const icon = categoryEmoji(groupTitle ?? '');
//   return `[option] ${icon} ${service.title} — ${service.durationMin} ${minutes}, ${formatPrice(locale, service.priceCents)} [/option]`;
// }

// function buildCategoryToServiceText(
//   locale: 'de' | 'ru' | 'en',
//   categoryTitle: string,
//   options: string[],
// ): string {
//   const intro =
//     locale === 'ru'
//       ? `Вы выбрали категорию "${categoryTitle}". Чтобы записаться, выберите конкретную услугу:`
//       : locale === 'en'
//         ? `You selected the category "${categoryTitle}". To continue booking, please choose a specific service:`
//         : `Sie haben die Kategorie "${categoryTitle}" gewählt. Für die Buchung wählen Sie bitte eine konkrete Leistung:`;
//   const question =
//     locale === 'ru'
//       ? 'Какую услугу выбираем?'
//       : locale === 'en'
//         ? 'Which service would you like to choose?'
//         : 'Welche Leistung möchten Sie wählen?';

//   return `${intro}\n\n${options.join('\n')}\n\n${question}`;
// }

// function buildServiceAvailabilityGroupText(
//   locale: 'de' | 'ru' | 'en',
//   categoryTitle: string,
//   options: string[],
//   hasActiveBookingFlow: boolean,
// ): string {
//   const continueOption = hasActiveBookingFlow
//     ? locale === 'ru'
//       ? '\n[option] ✅ Продолжить текущую запись [/option]'
//       : locale === 'en'
//         ? '\n[option] ✅ Continue current booking [/option]'
//         : '\n[option] ✅ Aktuelle Buchung fortsetzen [/option]'
//     : '';

//   if (locale === 'ru') {
//     return `Да, у нас есть услуги в категории "${categoryTitle}" 🌸\n\n${options.join('\n')}${continueOption}\n\nВыберите услугу, и я помогу с записью.`;
//   }
//   if (locale === 'en') {
//     return `Yes, we offer services in "${categoryTitle}" 🌸\n\n${options.join('\n')}${continueOption}\n\nChoose a service and I will help with booking.`;
//   }
//   return `Ja, wir bieten Leistungen in der Kategorie "${categoryTitle}" an 🌸\n\n${options.join('\n')}${continueOption}\n\nWählen Sie eine Leistung, dann helfe ich mit der Buchung.`;
// }

// function buildServiceAvailabilitySingleText(
//   locale: 'de' | 'ru' | 'en',
//   serviceTitle: string,
//   groupTitle: string,
//   hasActiveBookingFlow: boolean,
// ): string {
//   const serviceOption = `[option] ${categoryEmoji(groupTitle)} ${serviceTitle} [/option]`;
//   const continueOption = hasActiveBookingFlow
//     ? locale === 'ru'
//       ? '\n[option] ✅ Продолжить текущую запись [/option]'
//       : locale === 'en'
//         ? '\n[option] ✅ Continue current booking [/option]'
//         : '\n[option] ✅ Aktuelle Buchung fortsetzen [/option]'
//     : '';

//   if (locale === 'ru') {
//     return `Да, услуга "${serviceTitle}" есть в нашем каталоге 🌸\n\n${serviceOption}${continueOption}\n\nЕсли хотите, перейдем к выбору даты и времени.`;
//   }
//   if (locale === 'en') {
//     return `Yes, "${serviceTitle}" is available in our catalog 🌸\n\n${serviceOption}${continueOption}\n\nIf you want, we can continue with date and time selection.`;
//   }
//   return `Ja, "${serviceTitle}" ist in unserem Katalog verfügbar 🌸\n\n${serviceOption}${continueOption}\n\nWenn Sie möchten, machen wir direkt mit Datum und Uhrzeit weiter.`;
// }

// function buildServiceAvailabilityNotFoundText(
//   locale: 'de' | 'ru' | 'en',
//   options: string[],
//   hasActiveBookingFlow: boolean,
// ): string {
//   const continueOption = hasActiveBookingFlow
//     ? locale === 'ru'
//       ? '\n[option] ✅ Продолжить текущую запись [/option]'
//       : locale === 'en'
//         ? '\n[option] ✅ Continue current booking [/option]'
//         : '\n[option] ✅ Aktuelle Buchung fortsetzen [/option]'
//     : '';

//   if (locale === 'ru') {
//     return `Похоже, такой услуги сейчас нет в активном каталоге.\n\n${options.join('\n')}${continueOption}\n\nМогу предложить доступные категории выше.`;
//   }
//   if (locale === 'en') {
//     return `It looks like this service is not available in the active catalog right now.\n\n${options.join('\n')}${continueOption}\n\nI can offer available categories above.`;
//   }
//   return `Diese Leistung ist aktuell nicht im aktiven Katalog verfügbar.\n\n${options.join('\n')}${continueOption}\n\nIch kann Ihnen verfügbare Kategorien oben anbieten.`;
// }

// function buildNoMasterForServiceText(
//   locale: 'de' | 'ru' | 'en',
//   serviceTitle: string,
//   options: string[],
// ): string {
//   const intro =
//     locale === 'ru'
//       ? `Для услуги "${serviceTitle}" сейчас нет назначенных мастеров.`
//       : locale === 'en'
//         ? `There are currently no assigned masters for "${serviceTitle}".`
//         : `Für die Leistung "${serviceTitle}" sind aktuell keine Meister zugewiesen.`;
//   const ask =
//     locale === 'ru'
//       ? 'Выберите, пожалуйста, другую конкретную услугу:'
//       : locale === 'en'
//         ? 'Please choose another specific service:'
//         : 'Bitte wählen Sie eine andere konkrete Leistung:';

//   return options.length > 0 ? `${intro}\n\n${ask}\n\n${options.join('\n')}` : `${intro}\n\n${ask}`;
// }

// function buildSingleMasterText(
//   locale: 'de' | 'ru' | 'en',
//   serviceTitle: string,
//   masterName: string,
// ): string {
//   const cancelOption = buildCancelBookingOption(locale);
//   if (locale === 'ru') {
//     return `Вы выбрали услугу "${serviceTitle}".\n\nЭту услугу выполнит мастер ${masterName}.\n\nСначала выберите дату, затем время:\n\n[option] 📅 Завтра [/option]\n[option] 📅 Ближайшая дата [/option]\n${cancelOption}\n\nИли напишите дату в формате ДД.ММ.`;
//   }
//   if (locale === 'en') {
//     return `You selected "${serviceTitle}".\n\nThis service can be done by ${masterName}.\n\nPlease choose a date first, then we will pick time:\n\n[option] 📅 Tomorrow [/option]\n[option] 📅 Nearest date [/option]\n${cancelOption}\n\nOr type a date in DD.MM format.`;
//   }
//   return `Sie haben die Leistung "${serviceTitle}" gewählt.\n\nDiese Leistung übernimmt ${masterName}.\n\nBitte wählen Sie zuerst ein Datum, danach die Uhrzeit:\n\n[option] 📅 Morgen [/option]\n[option] 📅 Nächstes Datum [/option]\n${cancelOption}\n\nOder schreiben Sie ein Datum im Format TT.MM.`;
// }

// function buildMultipleMastersText(
//   locale: 'de' | 'ru' | 'en',
//   serviceTitle: string,
//   options: string[],
// ): string {
//   const intro =
//     locale === 'ru'
//       ? `Услугу "${serviceTitle}" могут выполнить следующие мастера:`
//       : locale === 'en'
//         ? `The service "${serviceTitle}" can be performed by:`
//         : `Die Leistung "${serviceTitle}" kann von folgenden Meistern ausgeführt werden:`;
//   const ask =
//     locale === 'ru'
//       ? 'Кого выберем?'
//       : locale === 'en'
//         ? 'Who would you like to choose?'
//         : 'Wen möchten Sie wählen?';
//   return `${intro}\n\n${options.join('\n')}\n\n${ask}`;
// }

// function isFullCatalogRequest(text: string, locale: 'de' | 'ru' | 'en'): boolean {
//   const value = normalizeInput(text);
//   if (!value) return false;

//   if (locale === 'ru') {
//     const ruPhrases = [
//       'услуги и цены',
//       'какие услуги',
//       'все услуги',
//       'полный список',
//       'полный прайс',
//       'прайс лист',
//       'прайс-лист',
//       'цены',
//       'стоимость',
//       'сколько стоит',
//     ];
//     return ruPhrases.some((p) => value.includes(p));
//   }

//   if (locale === 'en') {
//     const enPhrases = [
//       'services and prices',
//       'services & prices',
//       'what services',
//       'full list',
//       'price list',
//       'prices',
//       'how much',
//     ];
//     return enPhrases.some((p) => value.includes(p));
//   }

//   const dePhrases = [
//     'leistungen und preise',
//     'leistungen & preise',
//     'welche leistungen',
//     'vollständige liste',
//     'volle liste',
//     'preisliste',
//     'preise',
//     'kosten',
//     'was kostet',
//   ];
//   return dePhrases.some((p) => value.includes(p));
// }

// function isBookingStartIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
//   hasActiveBookingFlow: boolean,
// ): boolean {
//   const value = normalizeInput(text);
//   if (!value) return false;

//   const restartPhrases =
//     locale === 'ru'
//       ? [
//           'новый термин',
//           'новая запись',
//           'новую запись',
//           'хочу новую запись',
//           'хочу новый термин',
//           'новый прием',
//           'новый приём',
//           'начать заново',
//         ]
//       : locale === 'en'
//         ? ['new appointment', 'new booking', 'start over', 'book again']
//         : ['neuer termin', 'neue buchung', 'neu anfangen', 'erneut buchen'];

//   if (restartPhrases.some((p) => value.includes(p))) return true;
//   if (locale === 'ru' && /нов(ый|ую)\s+(термин|запис)/u.test(value)) return true;

//   const startPhrases =
//     locale === 'ru'
//       ? [
//           'записаться на приём',
//           'записаться на прием',
//           'записаться',
//           'хочу записаться',
//           'продолжить запись',
//           'подобрать время и записаться',
//           'подобрать время',
//         ]
//       : locale === 'en'
//         ? [
//             'book appointment',
//             'book a slot',
//             'continue booking',
//             'i want to book',
//             'pick time and book',
//           ]
//         : [
//             'termin buchen',
//             'buchung starten',
//             'buchung fortsetzen',
//             'ich möchte buchen',
//             'zeit finden und buchen',
//           ];

//   if (!hasActiveBookingFlow) {
//     return startPhrases.some((p) => value.includes(p));
//   }

//   // In active flow, restart only on explicit re-entry asks; avoid accidental resets
//   // on vague CTA clicks like "подобрать время".
//   const reentryPhrases =
//     locale === 'ru'
//       ? [
//           'записаться на приём',
//           'записаться на прием',
//           'записаться',
//           'хочу записаться',
//         ]
//       : locale === 'en'
//         ? ['book appointment', 'i want to book', 'book now']
//         : ['termin buchen', 'ich möchte buchen', 'jetzt buchen'];

//   return reentryPhrases.some((p) => value.includes(p));
// }

// function isChangeServiceIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;

//   if (locale === 'ru') {
//     const phrases = [
//       'новая услуга',
//       'другая услуга',
//       'другую услугу',
//       'назад к услугам',
//       'назад к выбору услуг',
//       'назад к выбору услуги',
//       'вернуться к услугам',
//       'возврат к услугам',
//       'сменить услугу',
//       'смени услугу',
//       'поменять услугу',
//       'выбрать другую услугу',
//       'хочу другую услугу',
//     ];
//     return phrases.some((p) => value.includes(p));
//   }

//   if (locale === 'en') {
//     const phrases = [
//       'new service',
//       'another service',
//       'back to services',
//       'return to services',
//       'change service',
//       'switch service',
//       'choose another service',
//     ];
//     return phrases.some((p) => value.includes(p));
//   }

//   const phrases = [
//     'neue leistung',
//     'andere leistung',
//     'zuruck zu leistungen',
//     'zurück zu leistungen',
//     'leistung wechseln',
//     'andere dienstleistung',
//   ];
//   return phrases.some((p) => value.includes(p));
// }

// function isCancelBookingIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;

//   if (locale === 'ru') {
//     const phrases = [
//       'отмени запись',
//       'отмена записи',
//       'отменить запись',
//       'отмени текущую запись',
//       'отменить текущую запись',
//       'отменить бронь',
//       'отмени бронь',
//       'отмена брони',
//       'сбрось запись',
//     ];
//     return phrases.some((p) => value.includes(p));
//   }

//   if (locale === 'en') {
//     const phrases = [
//       'cancel booking',
//       'cancel appointment',
//       'cancel my booking',
//       'cancel current booking',
//       'cancel the current booking',
//     ];
//     return phrases.some((p) => value.includes(p));
//   }

//   const phrases = [
//     'buchung abbrechen',
//     'termin absagen',
//     'aktuelle buchung abbrechen',
//     'aktuelle buchung stornieren',
//     'buchung stornieren',
//   ];
//   return phrases.some((p) => value.includes(p));
// }

// function isResetToMainMenuIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;

//   if (locale === 'ru') {
//     const phrases = [
//       'верни на самое начало',
//       'верни на начало',
//       'верни на главную',
//       'вернись в самое начало',
//       'вернуться в самое начало',
//       'вернись в начало',
//       'вернуться в начало',
//       'перейди на главную',
//       'перейди в главное меню',
//       'назад в главное меню',
//       'вернуться в главное меню',
//       'на главную',
//       'в главное меню',
//       'главная страница',
//       'главная',
//       'в самое начало',
//       'в начало',
//       'главное меню',
//       'начать сначала',
//       'начни сначала',
//       'сбрось диалог',
//       'сбрось чат',
//     ];
//     return phrases.some((p) => value.includes(p));
//   }

//   if (locale === 'en') {
//     const phrases = [
//       'back to start',
//       'return to start',
//       'go to main menu',
//       'main menu',
//       'start from beginning',
//       'reset chat',
//     ];
//     return phrases.some((p) => value.includes(p));
//   }

//   const phrases = [
//     'zuruck zum anfang',
//     'zurück zum anfang',
//     'zum anfang',
//     'hauptmenu',
//     'hauptmenü',
//     'neu starten',
//     'chat zurucksetzen',
//     'chat zurücksetzen',
//   ];
//   return phrases.some((p) => value.includes(p));
// }

// function isConsultationBookOptionIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;

//   if (locale === 'ru') {
//     return (
//       value.includes('подобрать время и записаться') ||
//       value === 'подобрать время'
//     );
//   }
//   if (locale === 'en') {
//     return value.includes('pick time and book');
//   }
//   return value.includes('zeit finden und buchen');
// }

// function isConsultationSpecificBookingIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;

//   if (locale === 'ru') {
//     return (
//       value.includes('записаться на ') ||
//       value.includes('да записаться на ') ||
//       value.includes('хочу записаться на ')
//     );
//   }
//   if (locale === 'en') {
//     return (
//       value.includes('book ') ||
//       value.includes('i want to book ')
//     );
//   }
//   return (
//     value.includes('buchen ') ||
//     value.includes('ich mochte buchen ') ||
//     value.includes('ich möchte buchen ')
//   );
// }

// function isConsultationIntent(text: string, locale: 'de' | 'ru' | 'en'): boolean {
//   return isConsultationIntentByKnowledge(text, locale);
// }

// function isConsultationTopicAutoStartIntent(
//   text: string,
//   locale: 'de' | 'ru' | 'en',
// ): boolean {
//   const value = normalizeInput(text).replace(/ё/g, 'е');
//   if (!value) return false;
//   if (looksLikeServiceOptionPayload(text) || looksLikePricedOptionPayload(text)) return false;
//   if (isConsultationSpecificBookingIntent(text, locale)) return false;
//   if (isBookingStartIntent(text, locale, false)) return false;

//   const hasSelectionVerb = /\b(запис|выб|book|buchen|choose|select|auswahl)\b/u.test(value);
//   if (hasSelectionVerb) return false;

//   if (isKnowledgeDetailsIntent(text, locale)) return true;
//   if (/[?？]/u.test(text)) return true;

//   if (locale === 'ru') {
//     const cues = ['расскажи', 'подскажи', 'объясни', 'что', 'какие', 'какой', 'как', 'для кого', 'кому подходит'];
//     return cues.some((cue) => value.includes(cue));
//   }
//   if (locale === 'en') {
//     const cues = ['tell me', 'explain', 'what', 'which', 'how', 'who is it for', 'for whom'];
//     return cues.some((cue) => value.includes(cue));
//   }
//   const cues = ['erzahl', 'erzähl', 'erklar', 'erklär', 'was', 'welche', 'wie', 'fur wen', 'für wen'];
//   return cues.some((cue) => value.includes(cue));
// }

// function buildConsultationStartText(
//   locale: 'de' | 'ru' | 'en',
//   groups: SelectionCatalogGroup[] = [],
// ): string {
//   const intro =
//     buildKnowledgeConsultationStartText(locale).split('\n\n[option]')[0]?.trim() ?? '';
//   const activeGroups = groups.filter((group) => group.services.length > 0);
//   const options = activeGroups
//     .slice(0, 8)
//     .map((group) => `[option] ${categoryEmoji(group.title)} ${group.title} [/option]`);

//   if (options.length === 0) {
//     return locale === 'ru'
//       ? 'Сейчас не удалось загрузить активный каталог услуг. Могу попробовать ещё раз или помочь с общими вопросами по салону.'
//       : locale === 'en'
//         ? 'I could not load the active service catalog right now. I can try again or help with general salon questions.'
//         : 'Ich konnte den aktiven Leistungskatalog gerade nicht laden. Ich kann es erneut versuchen oder allgemeine Fragen zum Salon beantworten.';
//   }

//   const ask =
//     locale === 'ru'
//       ? 'Выберите актуальную категорию, и я помогу подобрать услугу:'
//       : locale === 'en'
//         ? 'Choose a current category and I will help you pick the right service:'
//         : 'Wählen Sie eine aktuelle Kategorie, dann helfe ich bei der passenden Leistung:';

//   return `${intro}\n\n${ask}\n${options.join('\n')}`;
// }

// function consultationTopicMatchesGroup(
//   topic: ConsultationTopic,
//   groupTitle: string,
// ): boolean {
//   const value = normalizeChoiceText(groupTitle);
//   if (topic === 'pmu') {
//     return (
//       value.includes('pmu') ||
//       value.includes('permanent') ||
//       value.includes('перманент')
//     );
//   }
//   if (topic === 'brows_lashes') {
//     return (
//       !consultationTopicMatchesGroup('pmu', groupTitle) &&
//       (
//         value.includes('brow') ||
//         value.includes('lash') ||
//         value.includes('wimper') ||
//         value.includes('augenbrau') ||
//         value.includes('бров') ||
//         value.includes('ресниц')
//       )
//     );
//   }
//   if (topic === 'hydrafacial') {
//     return value.includes('hydra') || value.includes('hydrafacial');
//   }
//   return false;
// }

// function consultationTopicMatchesService(
//   topic: ConsultationTopic,
//   groupTitle: string,
//   serviceTitle: string,
// ): boolean {
//   if (consultationTopicMatchesGroup(topic, groupTitle)) return true;

//   const value = normalizeChoiceText(`${groupTitle} ${serviceTitle}`);
//   if (topic === 'pmu') {
//     return (
//       value.includes('pmu') ||
//       value.includes('permanent') ||
//       value.includes('перманент') ||
//       value.includes('powder') ||
//       value.includes('hairstroke') ||
//       value.includes('aquarell') ||
//       value.includes('wimpernkranz') ||
//       value.includes('межреснич')
//     );
//   }
//   if (topic === 'brows_lashes') {
//     return (
//       !consultationTopicMatchesGroup('pmu', groupTitle) &&
//       (
//         value.includes('brow') ||
//         value.includes('lash') ||
//         value.includes('wimper') ||
//         value.includes('augenbrau') ||
//         value.includes('бров') ||
//         value.includes('ресниц') ||
//         value.includes('lifting') ||
//         value.includes('styling')
//       )
//     );
//   }
//   if (topic === 'hydrafacial') {
//     return value.includes('hydra') || value.includes('hydrafacial');
//   }
//   return false;
// }

// function buildConsultationTopicText(
//   locale: 'de' | 'ru' | 'en',
//   topic: ConsultationTopic,
//   groups: SelectionCatalogGroup[],
// ): string {
//   if (topic === 'nails' || topic === 'hair') {
//     const activeOptions = groups
//       .filter((group) => group.services.length > 0)
//       .slice(0, 6)
//       .map((group) => `[option] ${categoryEmoji(group.title)} ${group.title} [/option]`);
//     const suffix = activeOptions.length > 0 ? `\n\n${activeOptions.join('\n')}` : '';
//     return locale === 'ru'
//       ? `Этой услуги сейчас нет в активном каталоге салона.${suffix}`
//       : locale === 'en'
//         ? `This service is not available in the active salon catalog right now.${suffix}`
//         : `Diese Leistung ist aktuell nicht im aktiven Salon-Katalog verfügbar.${suffix}`;
//   }

//   const matchedGroups = groups
//     .map((group) => ({
//       ...group,
//       services: group.services.filter((service) =>
//         consultationTopicMatchesService(topic, group.title, service.title),
//       ),
//     }))
//     .filter((group) => group.services.length > 0);

//   const serviceOptions = matchedGroups.flatMap((group) =>
//     group.services
//       .slice(0, 6)
//       .map((service) => formatServiceOption(locale, service, group.title)),
//   ).slice(0, 8);

//   if (serviceOptions.length === 0) {
//     return buildConsultationStartText(locale, groups);
//   }

//   const intro =
//     topic === 'pmu'
//       ? locale === 'ru'
//         ? 'Отлично, подберём PMU по актуальному каталогу 🌸'
//         : locale === 'en'
//           ? "Great, let's choose PMU from the current catalog 🌸"
//           : 'Sehr gern, wir wählen PMU aus dem aktuellen Katalog 🌸'
//       : topic === 'brows_lashes'
//         ? locale === 'ru'
//           ? 'Супер, подберём брови/ресницы из актуальных услуг 🌸'
//           : locale === 'en'
//             ? "Perfect, let's choose brows/lashes from the current services 🌸"
//             : 'Super, wir wählen Brows/Lashes aus den aktuellen Leistungen 🌸'
//         : locale === 'ru'
//           ? 'Хороший выбор, подберём Hydrafacial из актуального каталога 🌿'
//           : locale === 'en'
//             ? "Good choice, let's choose Hydrafacial from the current catalog 🌿"
//             : 'Gute Wahl, wir wählen Hydrafacial aus dem aktuellen Katalog 🌿';

//   const ask =
//     locale === 'ru'
//       ? 'Какой вариант смотрим?'
//       : locale === 'en'
//         ? 'Which option should we look at?'
//         : 'Welche Option schauen wir uns an?';

//   return `${intro}\n\n${serviceOptions.join('\n')}\n\n${ask}`;
// }

// function isDesiredDateQuestion(text: string, locale: 'de' | 'ru' | 'en'): boolean {
//   const value = normalizeInput(text);
//   if (!value) return false;
//   if (parseDayMonth(value)) return false;
//   if (value.includes(':')) return false; // likely time-related, not date selection

//   if (locale === 'ru') {
//     const ruPhrases = [
//       'есть даты',
//       'другая дата',
//       'другую дату',
//       'после 10',
//       'после 10.',
//       'после 10 ',
//       'после 10.03',
//       'на другую дату',
//     ];
//     return ruPhrases.some((p) => value.includes(p));
//   }

//   if (locale === 'en') {
//     const enPhrases = [
//       'other date',
//       'another date',
//       'dates after',
//       'after 10',
//       'can i pick date',
//       'preferred date',
//     ];
//     return enPhrases.some((p) => value.includes(p));
//   }

//   const dePhrases = [
//     'anderes datum',
//     'andere datum',
//     'daten nach',
//     'nach 10',
//     'wunschdatum',
//   ];
//   return dePhrases.some((p) => value.includes(p));
// }

// function buildBookingStartText(
//   locale: 'de' | 'ru' | 'en',
//   groupTitles: string[],
// ): string {
//   const intro =
//     locale === 'ru'
//       ? 'Какую услугу вы хотели бы заказать? Вот некоторые из наших предложений:'
//       : locale === 'en'
//         ? 'What service would you like to book? Here are some options:'
//         : 'Welche Leistung möchten Sie buchen? Hier sind einige Optionen:';
//   const ask =
//     locale === 'ru'
//       ? 'Пожалуйста, выберите услугу!'
//       : locale === 'en'
//         ? 'Please choose a service!'
//         : 'Bitte wählen Sie eine Leistung!';

//   if (groupTitles.length === 0) {
//     return `${intro}\n${ask}`;
//   }

//   const options = groupTitles
//     .slice(0, 8)
//     .map((title) => `[option] ${categoryEmoji(title)} ${title} [/option]`)
//     .join('\n');

//   return `${intro}\n${ask}\n${options}`;
// }

// function categoryEmoji(title: string): string {
//   const value = normalizeChoiceText(title);
//   if (
//     value.includes('brow') ||
//     value.includes('augenbrau') ||
//     value.includes('ресниц') ||
//     value.includes('бров')
//   ) {
//     return '✨';
//   }
//   if (value.includes('маник') || value.includes('nagel')) return '💅';
//   if (value.includes('перманент') || value.includes('permanent') || value.includes('pmu')) {
//     return '💄';
//   }
//   if (value.includes('стриж') || value.includes('haarschnitt') || value.includes('hair')) {
//     return '✂️';
//   }
//   if (value.includes('hydrafacial') || value.includes('hydra')) return '💧';
//   if (value.includes('педик') || value.includes('fuß') || value.includes('pedik')) return '🦶';
//   return '•';
// }

// function formatServiceLine(
//   locale: 'de' | 'ru' | 'en',
//   groupTitle: string,
//   service: { title: string; durationMin: number; priceCents: number | null },
// ): string {
//   const minutes = locale === 'ru' ? 'мин.' : 'min.';
//   return `${categoryEmoji(groupTitle)} ${service.title} — ${service.durationMin} ${minutes}, ${formatPrice(locale, service.priceCents)}`;
// }

// function buildFullCatalogText(
//   locale: 'de' | 'ru' | 'en',
//   groups: Array<{
//     title: string;
//     services: Array<{ title: string; durationMin: number; priceCents: number | null }>;
//   }>,
// ): string {
//   const intro =
//     locale === 'ru'
//       ? 'Вот полный список наших услуг и цен:'
//       : locale === 'en'
//         ? 'Here is our full list of services and prices:'
//         : 'Hier ist unsere vollständige Liste mit Leistungen und Preisen:';

//   const ask =
//     locale === 'ru'
//       ? 'Если хотите, подберу мастера и ближайшее время для выбранной услуги.'
//       : locale === 'en'
//         ? 'If you want, I can suggest a master and nearest time for the selected service.'
//         : 'Wenn Sie möchten, finde ich direkt einen Meister und die nächste freie Zeit für die gewählte Leistung.';

//   const body = groups
//     .map((group) => {
//       const lines = group.services.map((service) => formatServiceLine(locale, group.title, service));
//       return `**${group.title}**\n${lines.join('\n')}`;
//     })
//     .join('\n\n');

//   return `${intro}\n\n${body}\n\n${ask}`;
// }

// async function tryHandleCatalogSelectionFastPath(
//   session: AiSession,
//   sessionId: string,
//   message: string,
// ): Promise<ChatResponse | null> {
//   const input = normalizeCatalogSelectionInput(message);
//   if (!input) return null;
//   const normalizedMessage = normalizeInput(message);
//   const inputTokens = tokenizeNormalized(input);
//   const explicitCatalogPayload =
//     looksLikeServiceOptionPayload(message) || looksLikePricedOptionPayload(message);
//   const hasSelectionVerb = /\b(запис|выб|book|buchen|choose|select|auswahl)\b/u.test(
//     normalizedMessage,
//   );
//   // Prevent accidental service auto-selection from long free-form prompts
//   // (e.g. FAQ/consultation questions) that only weakly overlap with service titles.
//   if (!explicitCatalogPayload && inputTokens.length > 8 && !hasSelectionVerb) {
//     return null;
//   }
//   const contextServiceIds = session.context.selectedServiceIds ?? [];
//   const isAwaitingMasterChoice =
//     contextServiceIds.length > 0 && !session.context.selectedMasterId;
//   if (input.length < 4 && !isAwaitingMasterChoice) return null;
//   if (isAffirmativeFollowUp(message)) return null;
//   const hasActiveServiceSelection =
//     (session.context.selectedServiceIds?.length ?? 0) > 0 ||
//     Boolean(session.context.selectedMasterId);
//   if (
//     hasActiveServiceSelection &&
//     looksLikeDateOrTimeSelection(message)
//   ) {
//     return null;
//   }

//   const startedList = Date.now();
//   const catalog = await listServices({ locale: session.locale });
//   const listDurationMs = Date.now() - startedList;
//   const groups = (catalog.groups ?? []) as Array<{
//     id: string;
//     title: string;
//     services: Array<{
//       id: string;
//       title: string;
//       durationMin: number;
//       priceCents: number | null;
//     }>;
//   }>;
//   if (groups.length === 0) return null;

//   const flatServices = groups.flatMap((g) =>
//     g.services.map((s) => ({
//       ...s,
//       groupTitle: g.title,
//     })),
//   );

//   // If service is already selected but master is not, treat message as master choice first.
//   if (isAwaitingMasterChoice) {
//     const startedMasters = Date.now();
//     const mastersResult = await listMastersForServices({ serviceIds: contextServiceIds });
//     const mastersDurationMs = Date.now() - startedMasters;
//     const masters = mastersResult.masters ?? [];

//     if (masters.length > 1) {
//       const matchedMaster = chooseBestMatch(
//         masters,
//         (m) => normalizeChoiceText(m.name),
//         input,
//       );

//       if (matchedMaster) {
//         const matchedNorm = normalizeChoiceText(matchedMaster.name);
//         const isStrongMasterMatch =
//           input === matchedNorm ||
//           input.includes(matchedNorm) ||
//           matchedNorm.includes(input);

//         if (isStrongMasterMatch) {
//           const effectiveServiceIds =
//             mastersResult.matchedServiceIds?.length
//               ? mastersResult.matchedServiceIds
//               : contextServiceIds;
//           const serviceTitle =
//             flatServices.find((s) => s.id === effectiveServiceIds[0])?.title ??
//             (session.locale === 'ru'
//               ? 'выбранная услуга'
//               : session.locale === 'en'
//                 ? 'selected service'
//                 : 'gewählte Leistung');

//           const text = buildSingleMasterText(
//             session.locale,
//             serviceTitle,
//             matchedMaster.name,
//           );

//           appendSessionMessage(sessionId, 'assistant', text);
//           upsertSession(sessionId, {
//             context: {
//               selectedServiceIds: effectiveServiceIds,
//               selectedMasterId: matchedMaster.id,
//               lastSuggestedDateOptions: undefined,
//               lastDateISO: undefined,
//               lastPreferredTime: undefined,
//               lastNoSlots: false,
//             },
//           });

//           console.log(
//             `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=master-picked master="${matchedMaster.name}" serviceIds=${effectiveServiceIds.length}`,
//           );

//           return {
//             text,
//             sessionId,
//             toolCalls: [
//               { name: 'list_services', durationMs: listDurationMs },
//               { name: 'list_masters_for_services', durationMs: mastersDurationMs },
//             ],
//           };
//         }
//       }
//     }
//   }

//   const matchedService = chooseBestMatch(
//     flatServices,
//     (s) => normalizeChoiceText(s.title),
//     input,
//   );

//   const matchedGroup = chooseBestMatch(
//     groups,
//     (g) => normalizeChoiceText(g.title),
//     input,
//   );

//   if (isServiceAvailabilityInquiry(message, session.locale)) {
//     const matchedGroupScore = matchedGroup
//       ? choiceScore(normalizeChoiceText(matchedGroup.title), input)
//       : 0;
//     const matchedServiceScore = matchedService
//       ? choiceScore(normalizeChoiceText(matchedService.title), input)
//       : 0;

//     if (
//       matchedGroup &&
//       matchedGroup.services.length > 0 &&
//       matchedGroupScore >= 500 &&
//       matchedGroupScore >= matchedServiceScore
//     ) {
//       const serviceOptions = matchedGroup.services
//         .slice(0, 8)
//         .map((s) => formatServiceOption(session.locale, s, matchedGroup.title));
//       const text = buildServiceAvailabilityGroupText(
//         session.locale,
//         matchedGroup.title,
//         serviceOptions,
//         hasActiveServiceSelection,
//       );
//       appendSessionMessage(sessionId, 'assistant', text);

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-availability-group group="${matchedGroup.title}"`,
//       );

//       return {
//         text,
//         sessionId,
//         toolCalls: [{ name: 'list_services', durationMs: listDurationMs }],
//       };
//     }

//     if (matchedService && matchedServiceScore >= 500) {
//       const text = buildServiceAvailabilitySingleText(
//         session.locale,
//         matchedService.title,
//         matchedService.groupTitle,
//         hasActiveServiceSelection,
//       );
//       appendSessionMessage(sessionId, 'assistant', text);

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-availability-service service="${matchedService.title}"`,
//       );

//       return {
//         text,
//         sessionId,
//         toolCalls: [{ name: 'list_services', durationMs: listDurationMs }],
//       };
//     }

//     const groupOptions = groups
//       .slice(0, 6)
//       .map((group) => `[option] ${categoryEmoji(group.title)} ${group.title} [/option]`);
//     const text = buildServiceAvailabilityNotFoundText(
//       session.locale,
//       groupOptions,
//       hasActiveServiceSelection,
//     );
//     appendSessionMessage(sessionId, 'assistant', text);

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-availability-not-found`,
//     );

//     return {
//       text,
//       sessionId,
//       toolCalls: [{ name: 'list_services', durationMs: listDurationMs }],
//     };
//   }

//   // In active booking flow, do not switch service/category from free-form text.
//   // Allow only explicit catalog choices (exact group/service title or service option payload).
//   if (hasActiveServiceSelection && !looksLikeServiceOptionPayload(message)) {
//     const isExactGroupChoice = groups.some(
//       (g) => normalizeChoiceText(g.title) === input,
//     );
//     const isExactServiceChoice = groups.some((g) =>
//       g.services.some((s) => normalizeChoiceText(s.title) === input),
//     );
//     if (!isExactGroupChoice && !isExactServiceChoice) {
//       return null;
//     }
//   }

//   if (matchedGroup) {
//     const groupNorm = normalizeChoiceText(matchedGroup.title);
//     const serviceNorm = matchedService
//       ? normalizeChoiceText(matchedService.title)
//       : '';
//     const inputTokens = tokenizeNormalized(input);
//     const groupTokens = tokenizeNormalized(groupNorm);
//     const hasStrongServiceMatch =
//       Boolean(serviceNorm) &&
//       (input === serviceNorm ||
//         input.includes(serviceNorm) ||
//         serviceNorm.includes(input));
//     const startsWithGroup =
//       input === groupNorm || input.startsWith(`${groupNorm} `);
//     const isBookingVerbGroupChoice =
//       hasSelectionVerb &&
//       input.includes(groupNorm);
//     const isDirectGroupChoice =
//       !hasStrongServiceMatch &&
//       (
//         startsWithGroup ||
//         isBookingVerbGroupChoice ||
//         (input.includes(groupNorm) && inputTokens.length <= groupTokens.length + 2)
//       );

//     if (!isDirectGroupChoice) {
//       // User most likely clicked a specific service with overlapping words.
//       // Continue to concrete service matching below.
//     } else {
//       const serviceOptions = matchedGroup.services
//         .slice(0, 12)
//         .map((s) => formatServiceOption(session.locale, s, matchedGroup.title));
//       const text = buildCategoryToServiceText(
//         session.locale,
//         matchedGroup.title,
//         serviceOptions,
//       );

//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           selectedServiceIds: undefined,
//           selectedMasterId: undefined,
//           lastSuggestedDateOptions: undefined,
//           lastDateISO: undefined,
//           lastPreferredTime: undefined,
//           lastNoSlots: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=category-to-services group="${matchedGroup.title}"`,
//       );

//       return {
//         text,
//         sessionId,
//         toolCalls: [{ name: 'list_services', durationMs: listDurationMs }],
//       };
//     }
//   }

//   if (!matchedService) return null;

//   const matchedServiceNorm = normalizeChoiceText(matchedService.title);
//   const matchedServiceTokens = tokenizeNormalized(matchedServiceNorm);
//   const inputTokenSet = new Set(inputTokens);
//   const overlapCount = matchedServiceTokens.reduce(
//     (acc, token) => (inputTokenSet.has(token) ? acc + 1 : acc),
//     0,
//   );
//   const hasStrongServiceMatch =
//     input === matchedServiceNorm ||
//     input.includes(matchedServiceNorm) ||
//     overlapCount >= Math.max(2, Math.ceil(matchedServiceTokens.length / 2));

//   const hasGenericCategoryIntent =
//     /\b(перманент|макияж|pmu|hydrafacial|брови|ресницы|губы|service|services|leistung|behandlung|augenbrauen|wimpern|lippen)\b/u.test(
//       normalizedMessage,
//     );
//   const asksGenericInfoBeforeBooking =
//     isKnowledgeDetailsIntent(message, session.locale) &&
//     !explicitCatalogPayload &&
//     !hasSelectionVerb &&
//     hasGenericCategoryIntent;

//   if (asksGenericInfoBeforeBooking) {
//     return null;
//   }

//   if (!explicitCatalogPayload && !hasStrongServiceMatch) {
//     // Do not turn broad informational prompts into concrete booking selections.
//     if (!hasSelectionVerb && hasGenericCategoryIntent) {
//       return null;
//     }
//     if (inputTokens.length > 4) {
//       return null;
//     }
//   }

//   const startedMasters = Date.now();
//   const mastersResult = await listMastersForServices({ serviceIds: [matchedService.id] });
//   const mastersDurationMs = Date.now() - startedMasters;

//   if (!mastersResult.masters || mastersResult.masters.length === 0) {
//     const alternatives = flatServices
//       .filter(
//         (s) =>
//           s.groupTitle === matchedService.groupTitle &&
//           s.id !== matchedService.id,
//       )
//       .slice(0, 10)
//       .map((s) => formatServiceOption(session.locale, s, matchedService.groupTitle));

//     const text = buildNoMasterForServiceText(
//       session.locale,
//       matchedService.title,
//       alternatives,
//     );
//     appendSessionMessage(sessionId, 'assistant', text);
//     upsertSession(sessionId, {
//       context: {
//         selectedServiceIds: [matchedService.id],
//         selectedMasterId: undefined,
//         lastSuggestedDateOptions: undefined,
//         lastDateISO: undefined,
//         lastPreferredTime: undefined,
//         lastNoSlots: false,
//       },
//     });

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-no-master service="${matchedService.title}"`,
//     );

//     return {
//       text,
//       sessionId,
//       toolCalls: [
//         { name: 'list_services', durationMs: listDurationMs },
//         { name: 'list_masters_for_services', durationMs: mastersDurationMs },
//       ],
//     };
//   }

//   if (mastersResult.masters.length === 1) {
//     const master = mastersResult.masters[0];
//     const text = buildSingleMasterText(
//       session.locale,
//       matchedService.title,
//       master.name,
//     );
//     appendSessionMessage(sessionId, 'assistant', text);
//     upsertSession(sessionId, {
//       context: {
//         selectedServiceIds: [matchedService.id],
//         selectedMasterId: master.id,
//         lastSuggestedDateOptions: undefined,
//         lastDateISO: undefined,
//         lastPreferredTime: undefined,
//         lastNoSlots: false,
//       },
//     });

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-single-master service="${matchedService.title}" master="${master.name}"`,
//     );

//     return {
//       text,
//       sessionId,
//       toolCalls: [
//         { name: 'list_services', durationMs: listDurationMs },
//         { name: 'list_masters_for_services', durationMs: mastersDurationMs },
//       ],
//     };
//   }

//   const masterOptions = mastersResult.masters
//     .slice(0, 10)
//     .map((m) => `[option] 👩‍🎨 ${m.name} [/option]`);
//   const text = buildMultipleMastersText(
//     session.locale,
//     matchedService.title,
//     masterOptions,
//   );
//   appendSessionMessage(sessionId, 'assistant', text);
//   upsertSession(sessionId, {
//     context: {
//       selectedServiceIds: [matchedService.id],
//       selectedMasterId: undefined,
//       lastSuggestedDateOptions: undefined,
//       lastDateISO: undefined,
//       lastPreferredTime: undefined,
//       lastNoSlots: false,
//     },
//   });

//   console.log(
//     `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=service-multi-master service="${matchedService.title}" masters=${mastersResult.masters.length}`,
//   );

//   return {
//     text,
//     sessionId,
//     toolCalls: [
//       { name: 'list_services', durationMs: listDurationMs },
//       { name: 'list_masters_for_services', durationMs: mastersDurationMs },
//     ],
//   };
// }

// // ─── Route Handler ──────────────────────────────────────────────

// export async function POST(
//   req: NextRequest,
// ): Promise<NextResponse<ChatResponse | { error: string }>> {
//   // Kill switch
//   if (process.env.AI_ASSISTANT_ENABLED !== 'true') {
//     return NextResponse.json(
//       { error: 'AI assistant is disabled' },
//       { status: 503 },
//     );
//   }

//   const client = getClient();
//   if (!client) {
//     return NextResponse.json(
//       { error: 'AI not configured (missing OPENAI_API_KEY)' },
//       { status: 503 },
//     );
//   }

//   // Rate limiting by IP
//   const ip =
//     req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
//     req.headers.get('x-real-ip') ||
//     'unknown';

//   const rateCheck = checkRateLimit(`ip:${ip}`);
//   if (!rateCheck.allowed) {
//     return NextResponse.json(
//       { error: `Rate limit exceeded. Retry in ${Math.ceil(rateCheck.retryAfterMs / 1000)}s` },
//       { status: 429 },
//     );
//   }

//   // Parse body
//   let body: ChatRequest;
//   try {
//     body = await req.json();
//   } catch {
//     return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
//   }

//   const { sessionId, message, locale, inputMode, stream: wantStream } = body;
//   const isVoiceTurn = inputMode === 'voice';
//   const forceGpt =
//     body.forceGpt === true || req.headers.get('x-ai-force-gpt') === '1';

//   if (!sessionId || !message?.trim()) {
//     return NextResponse.json(
//       { error: 'sessionId and message are required' },
//       { status: 400 },
//     );
//   }

//   const existingSession = getSession(sessionId);

//   // Get or create session
//   const session = upsertSession(sessionId, {
//     locale: (locale as 'de' | 'ru' | 'en') ?? 'de',
//   });

//   const shouldInitAnalytics =
//     !existingSession || !(existingSession.context.chatHistory?.length);
//   if (shouldInitAnalytics) {
//     initSessionAnalytics({
//       sessionId,
//       locale: session.locale,
//       userAgent: req.headers.get('user-agent') || undefined,
//       ip,
//       referrer:
//         req.headers.get('referer') ||
//         req.headers.get('referrer') ||
//         undefined,
//     });
//   }

//   appendSessionMessage(sessionId, 'user', message);
//   const turn = new TurnBuilder(sessionId, message, inputMode);
//   let turnUsedGpt = false;
//   let turnResponseMode: 'json' | 'sse' = 'json';
//   let turnIterations = 0;
//   let turnRetried = false;
//   let turnOutcome: 'ok' | 'error' | 'timeout' | 'aborted' | 'degraded' = 'ok';
//   let turnErrorCategory: string | undefined;
//   let turnErrorCode: string | undefined;
//   let turnErrorMessageSafe: string | undefined;
//   const selectedMasterId = session.context.selectedMasterId;
//   const selectedServiceIds = session.context.selectedServiceIds ?? [];
//   const suggestedDateOptions = session.context.lastSuggestedDateOptions ?? [];
//   const hasActiveBookingFlow = Boolean(
//     selectedMasterId ||
//       selectedServiceIds.length > 0 ||
//       session.context.reservedSlot ||
//       session.context.draftId,
//   );

//   let analyticsTracked = false;
//   const trackMetrics = (metrics: Partial<RequestMetrics>): void => {
//     if (analyticsTracked) return;
//     analyticsTracked = true;
//     try {
//       const latestContext = getSession(sessionId)?.context ?? session.context;
//       trackRequestMetrics(sessionId, {
//         isVoice: isVoiceTurn,
//         funnelStage: detectFunnelStage(latestContext),
//         consultationUsed: Boolean(latestContext.consultationMode),
//         consultationTopic: latestContext.consultationTopic,
//         ...metrics,
//       }, session.locale);
//     } catch (analyticsError) {
//       console.error(
//         `[AI Analytics] session=${sessionId.slice(0, 8)}... tracking failed`,
//         analyticsError,
//       );
//     }
//   };

//   try {
//   if (!forceGpt) {
//   if (
//     !hasActiveBookingFlow &&
//     session.context.awaitingConsultationBookingConfirmation &&
//     session.context.consultationTechnique
//   ) {
//     const technique = session.context.consultationTechnique;
//     if (isSelectedServiceSuitabilityIntent(message, session.locale)) {
//       const text = buildConsultationTechniqueSuitabilityText(session.locale, technique);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-suitability-followup technique=${technique}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }
//     if (isKnowledgeDetailsIntent(message, session.locale)) {
//       const text = buildKnowledgePmuTechniqueDetailsText(session.locale, technique);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-details-awaiting-confirm technique=${technique}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }
//     if (isKnowledgePmuContraindicationsIntent(message, session.locale)) {
//       const text = buildKnowledgePmuTechniqueContraindicationsText(session.locale, technique);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-contraindications-awaiting-confirm technique=${technique}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }
//     if (isKnowledgePmuHealingIntent(message, session.locale)) {
//       const text = buildKnowledgePmuTechniqueSafetyText(session.locale, technique);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-safety-awaiting-confirm technique=${technique}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     if (isConsultationBookingConfirmIntent(message, session.locale)) {
//       const fallbackStartedAt = Date.now();
//       const fallbackCatalog = await listServices({ locale: session.locale });
//       const fallbackDurationMs = Date.now() - fallbackStartedAt;
//       const fallbackGroups = (fallbackCatalog.groups ?? []) as SelectionCatalogGroup[];
//       const resolvedService = resolveConsultationTechniqueService(
//         session.locale,
//         technique,
//         fallbackGroups,
//       );

//       let selectionFastPath: ChatResponse | null = null;
//       if (resolvedService) {
//         selectionFastPath = await tryHandleCatalogSelectionFastPath(
//           session,
//           sessionId,
//           resolvedService.title,
//         );
//       }
//       if (!selectionFastPath) {
//         const bookingLabels = getConsultationTechniqueBookingLabels(
//           session.locale,
//           technique,
//         );
//         for (const label of bookingLabels) {
//           selectionFastPath = await tryHandleCatalogSelectionFastPath(
//             session,
//             sessionId,
//             label,
//           );
//           if (selectionFastPath) break;
//         }
//       }

//       if (selectionFastPath) {
//         upsertSession(sessionId, {
//           context: {
//             consultationMode: false,
//             consultationTopic: undefined,
//             consultationTechnique: undefined,
//             awaitingConsultationBookingConfirmation: false,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-booking-confirm technique=${technique} service="${resolvedService?.title ?? 'n/a'}"`,
//         );

//         return NextResponse.json(selectionFastPath);
//       }

//       const fallbackGroupTitles = fallbackGroups
//         .map((g) => g.title)
//         .filter(Boolean);
//       const text = buildBookingStartText(session.locale, fallbackGroupTitles);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationMode: false,
//           consultationTopic: undefined,
//           consultationTechnique: undefined,
//           awaitingConsultationBookingConfirmation: false,
//           selectedServiceIds: undefined,
//           selectedMasterId: undefined,
//           lastSuggestedDateOptions: undefined,
//           lastDateISO: undefined,
//           lastPreferredTime: undefined,
//           lastNoSlots: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-booking-confirm-fallback technique=${technique}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [{ name: 'list_services', durationMs: fallbackDurationMs }],
//         inputMode: 'text',
//       });
//     }

//     if (isConsultationBookingDeclineIntent(message, session.locale)) {
//       const topic = session.context.consultationTopic ?? 'pmu';
//       const startedAt = Date.now();
//       const catalog = await listServices({ locale: session.locale });
//       const durationMs = Date.now() - startedAt;
//       const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
//       const text = buildConsultationTopicText(session.locale, topic, groups);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           awaitingConsultationBookingConfirmation: false,
//           consultationTechnique: undefined,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-booking-decline`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [{ name: 'list_services', durationMs }],
//       });
//     }

//     const text = buildConsultationBookingConfirmText(session.locale, technique);
//     appendSessionMessage(sessionId, 'assistant', text);

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-booking-confirm-repeat`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//     });
//   }

//   const hasAnyInteractiveFlow = Boolean(
//     hasActiveBookingFlow ||
//       session.context.consultationMode ||
//       session.context.awaitingRegistrationMethod ||
//       session.context.awaitingVerificationMethod ||
//       session.context.pendingVerificationMethod,
//   );

//   if (hasAnyInteractiveFlow && isCancelBookingIntent(message, session.locale)) {
//     const staleDraftId = session.context.draftId;
//     if (staleDraftId) {
//       await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
//         /* ignore cleanup errors */
//       });
//     }
//     await prisma.temporarySlotReservation.deleteMany({
//       where: { sessionId },
//     }).catch(() => {
//       /* ignore cleanup errors */
//     });

//     const text =
//       session.locale === 'ru'
//         ? 'Текущую запись отменили. Чем могу помочь дальше? 🌸\n\n' +
//           getKnowledgeMenuOptions(session.locale)
//             .map((item) => `[option] ${item} [/option]`)
//             .join('\n')
//         : session.locale === 'en'
//           ? 'Current booking has been canceled. What would you like to do next? 🌸\n\n' +
//             getKnowledgeMenuOptions(session.locale)
//               .map((item) => `[option] ${item} [/option]`)
//               .join('\n')
//           : 'Die aktuelle Buchung wurde abgebrochen. Wie darf ich weiterhelfen? 🌸\n\n' +
//             getKnowledgeMenuOptions(session.locale)
//               .map((item) => `[option] ${item} [/option]`)
//               .join('\n');

//     appendSessionMessage(sessionId, 'assistant', text);
//     upsertSession(sessionId, {
//       previousResponseId: null,
//       context: {
//         consultationMode: false,
//         consultationTopic: undefined,
//         consultationTechnique: undefined,
//         awaitingConsultationBookingConfirmation: false,
//         selectedServiceIds: undefined,
//         selectedMasterId: undefined,
//         reservedSlot: undefined,
//         draftId: undefined,
//         lastDateISO: undefined,
//         lastPreferredTime: undefined,
//         lastNoSlots: false,
//         lastSuggestedDateOptions: undefined,
//         awaitingRegistrationMethod: false,
//         pendingVerificationMethod: undefined,
//         awaitingVerificationMethod: false,
//       },
//     });

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=booking-cancelled`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       inputMode: 'text',
//     });
//   }

//   if (isResetToMainMenuIntent(message, session.locale)) {
//     const staleDraftId = session.context.draftId;
//     if (staleDraftId) {
//       await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
//         /* ignore cleanup errors */
//       });
//     }
//     await prisma.temporarySlotReservation.deleteMany({
//       where: { sessionId },
//     }).catch(() => {
//       /* ignore cleanup errors */
//     });

//     const text = buildMainMenuText(session.locale);
//     appendSessionMessage(sessionId, 'assistant', text);
//     upsertSession(sessionId, {
//       previousResponseId: null,
//       context: {
//         consultationMode: false,
//         consultationTopic: undefined,
//         consultationTechnique: undefined,
//         awaitingConsultationBookingConfirmation: false,
//         selectedServiceIds: undefined,
//         selectedMasterId: undefined,
//         reservedSlot: undefined,
//         draftId: undefined,
//         lastDateISO: undefined,
//         lastPreferredTime: undefined,
//         lastNoSlots: false,
//         lastSuggestedDateOptions: undefined,
//         awaitingRegistrationMethod: false,
//         pendingVerificationMethod: undefined,
//         awaitingVerificationMethod: false,
//       },
//     });

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=main-menu-reset`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       inputMode: 'text',
//     });
//   }

//   if (!hasAnyInteractiveFlow && isGreetingIntent(message, session.locale)) {
//     const text = buildGreetingText(session.locale);
//     appendSessionMessage(sessionId, 'assistant', text);

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=greeting`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       inputMode: 'text',
//     });
//   }

//   if (
//     (hasActiveBookingFlow || session.context.consultationMode) &&
//     isChangeServiceIntent(message, session.locale)
//   ) {
//     const staleDraftId = session.context.draftId;
//     if (staleDraftId) {
//       await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
//         /* ignore cleanup errors */
//       });
//     }
//     await prisma.temporarySlotReservation.deleteMany({
//       where: { sessionId },
//     }).catch(() => {
//       /* ignore cleanup errors */
//     });

//     const startedAt = Date.now();
//     const catalog = await listServices({ locale: session.locale });
//     const durationMs = Date.now() - startedAt;
//     const groups = (catalog.groups ?? []) as Array<{ title: string }>;
//     const groupTitles = groups.map((g) => g.title).filter(Boolean);
//     const restartText = buildBookingStartText(session.locale, groupTitles);
//     const intro =
//       session.locale === 'ru'
//         ? 'Хорошо, выберем другую услугу 🌸'
//         : session.locale === 'en'
//           ? 'Sure, let us choose another service 🌸'
//           : 'Gerne, wir wählen eine andere Leistung 🌸';
//     const text = `${intro}\n\n${restartText}`;

//     appendSessionMessage(sessionId, 'assistant', text);
//     upsertSession(sessionId, {
//       previousResponseId: null,
//       context: {
//         consultationMode: false,
//         consultationTopic: undefined,
//         consultationTechnique: undefined,
//         awaitingConsultationBookingConfirmation: false,
//         selectedServiceIds: undefined,
//         selectedMasterId: undefined,
//         reservedSlot: undefined,
//         draftId: undefined,
//         lastDateISO: undefined,
//         lastPreferredTime: undefined,
//         lastNoSlots: false,
//         lastSuggestedDateOptions: undefined,
//         awaitingRegistrationMethod: false,
//         pendingVerificationMethod: undefined,
//         awaitingVerificationMethod: false,
//       },
//     });

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=change-service groups=${groupTitles.length}`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       toolCalls: [{ name: 'list_services', durationMs }],
//       inputMode: 'text',
//     });
//   }

//   // Deterministic booking start/restart entrypoint:
//   // handles intents like "записаться", "новый термин", "book appointment".
//   if (
//     isBookingStartIntent(message, session.locale, hasActiveBookingFlow) &&
//     !(
//       session.context.consultationMode &&
//       !hasActiveBookingFlow &&
//       (
//         isConsultationBookOptionIntent(message, session.locale) ||
//         isConsultationSpecificBookingIntent(message, session.locale)
//       )
//     )
//   ) {
//     // If user already named a concrete service ("хочу записаться на маникюр"),
//     // resolve selection immediately instead of sending the generic category list again.
//     const serviceSelectionInput = extractServiceSelectionInput(
//       message,
//       session.locale,
//     );
//     const directSelection = await tryHandleCatalogSelectionFastPath(
//       session,
//       sessionId,
//       serviceSelectionInput,
//     );
//     if (directSelection) {
//       return NextResponse.json(directSelection);
//     }

//     const startedAt = Date.now();
//     const catalog = await listServices({ locale: session.locale });
//     const durationMs = Date.now() - startedAt;
//     const groups = (catalog.groups ?? []) as Array<{ title: string }>;
//     const groupTitles = groups.map((g) => g.title).filter(Boolean);
//     const text = buildBookingStartText(session.locale, groupTitles);

//     appendSessionMessage(sessionId, 'assistant', text);
//     upsertSession(sessionId, {
//       previousResponseId: null,
//       context: {
//         consultationMode: false,
//         consultationTopic: undefined,
//         consultationTechnique: undefined,
//         awaitingConsultationBookingConfirmation: false,
//         selectedServiceIds: undefined,
//         selectedMasterId: undefined,
//         reservedSlot: undefined,
//         draftId: undefined,
//         lastDateISO: undefined,
//         lastPreferredTime: undefined,
//         lastNoSlots: false,
//         lastSuggestedDateOptions: undefined,
//         awaitingRegistrationMethod: false,
//         pendingVerificationMethod: undefined,
//         awaitingVerificationMethod: false,
//       },
//     });

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=booking-start groups=${groupTitles.length}`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       toolCalls: [{ name: 'list_services', durationMs }],
//       inputMode: 'text',
//     });
//   }

//   // ---------- Occasion-based recommendation ----------
//   const detectedOccasion = detectKnowledgeOccasion(message, session.locale);
//   if (
//     detectedOccasion &&
//     !hasActiveBookingFlow &&
//     !session.context.consultationMode &&
//     !looksLikeServiceOptionPayload(message) &&
//     !looksLikePricedOptionPayload(message)
//   ) {
//     const text = buildKnowledgeOccasionText(
//       session.locale as 'de' | 'en' | 'ru',
//       detectedOccasion,
//     );
//     appendSessionMessage(sessionId, 'assistant', text);

//     if (!session.context.consultationMode) {
//       upsertSession(sessionId, {
//         context: {
//           consultationMode: true,
//           consultationTopic: detectedOccasion === 'correction' ? 'pmu' : undefined,
//           consultationTechnique: undefined,
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });
//     }

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=occasion-${detectedOccasion}`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//     });
//   }

//   if (!hasActiveBookingFlow && !session.context.consultationMode) {
//     const consultationTopic = detectKnowledgeConsultationTopic(message, session.locale);
//     if (
//       consultationTopic &&
//       isConsultationTopicAutoStartIntent(message, session.locale)
//     ) {
//       const startedAt = Date.now();
//       const catalog = await listServices({ locale: session.locale });
//       const durationMs = Date.now() - startedAt;
//       const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
//       const text = buildConsultationTopicText(
//         session.locale,
//         consultationTopic,
//         groups,
//       );
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationMode: true,
//           consultationTopic,
//           consultationTechnique: undefined,
//           awaitingConsultationBookingConfirmation: false,
//           selectedServiceIds: undefined,
//           selectedMasterId: undefined,
//           reservedSlot: undefined,
//           draftId: undefined,
//           lastDateISO: undefined,
//           lastPreferredTime: undefined,
//           lastNoSlots: false,
//           lastSuggestedDateOptions: undefined,
//           awaitingRegistrationMethod: false,
//           pendingVerificationMethod: undefined,
//           awaitingVerificationMethod: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-topic-autostart topic=${consultationTopic}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [{ name: 'list_services', durationMs }],
//       });
//     }
//   }

//   // Deterministic consultation entrypoint for the new menu option.
//   if (
//     !hasActiveBookingFlow &&
//     !session.context.consultationMode &&
//     isConsultationIntent(message, session.locale)
//   ) {
//     const startedAt = Date.now();
//     const catalog = await listServices({ locale: session.locale });
//     const durationMs = Date.now() - startedAt;
//     const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
//     const text = buildConsultationStartText(session.locale, groups);
//     appendSessionMessage(sessionId, 'assistant', text);
//     upsertSession(sessionId, {
//       context: {
//         consultationMode: true,
//         consultationTopic: undefined,
//         consultationTechnique: undefined,
//         awaitingConsultationBookingConfirmation: false,
//         selectedServiceIds: undefined,
//         selectedMasterId: undefined,
//         reservedSlot: undefined,
//         draftId: undefined,
//         lastDateISO: undefined,
//         lastPreferredTime: undefined,
//         lastNoSlots: false,
//         lastSuggestedDateOptions: undefined,
//         awaitingRegistrationMethod: false,
//         pendingVerificationMethod: undefined,
//         awaitingVerificationMethod: false,
//       },
//     });

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-start`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       toolCalls: [{ name: 'list_services', durationMs }],
//     });
//   }

//   // Consultation-first mode: keep a friendly advisory flow until user explicitly
//   // asks to proceed to booking.
//   if (!hasActiveBookingFlow && session.context.consultationMode) {
//     const activeConsultationTopic = session.context.consultationTopic;

//     if (!activeConsultationTopic) {
//       const consultationTopic = detectKnowledgeConsultationTopic(message, session.locale);
//       if (consultationTopic) {
//         const startedAt = Date.now();
//         const catalog = await listServices({ locale: session.locale });
//         const durationMs = Date.now() - startedAt;
//         const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
//         const text = buildConsultationTopicText(
//           session.locale,
//           consultationTopic,
//           groups,
//         );
//         appendSessionMessage(sessionId, 'assistant', text);
//         upsertSession(sessionId, {
//           context: {
//             consultationTopic,
//             consultationTechnique: undefined,
//             awaitingConsultationBookingConfirmation: false,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-topic topic=${consultationTopic}`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//           toolCalls: [{ name: 'list_services', durationMs }],
//         });
//       }
//     }

//     // ---------- consultation → Hydrafacial comparison ----------
//     if (
//       isKnowledgeHydrafacialComparisonIntent(message, session.locale)
//     ) {
//       const text = buildKnowledgeHydrafacialComparisonText(
//         session.locale as 'de' | 'en' | 'ru',
//       );
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationTopic: 'hydrafacial',
//           consultationTechnique: undefined,
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-hydrafacial-compare`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     // ---------- consultation → Brows & Lashes comparison ----------
//     if (
//       isKnowledgeBrowsLashesComparisonIntent(message, session.locale)
//     ) {
//       const text = buildKnowledgeBrowsLashesComparisonText(
//         session.locale as 'de' | 'en' | 'ru',
//       );
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationTopic: 'brows_lashes',
//           consultationTechnique: undefined,
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-brows-lashes-compare`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     if (
//       activeConsultationTopic === 'hydrafacial' &&
//       isKnowledgeHydrafacialDetailsIntent(message, session.locale)
//     ) {
//       const text = buildKnowledgeHydrafacialDetailsText(
//         session.locale as 'de' | 'en' | 'ru',
//       );
//       appendSessionMessage(sessionId, 'assistant', text);

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-hydrafacial-details`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     if (
//       activeConsultationTopic === 'brows_lashes' &&
//       isKnowledgeBrowsLashesDetailsIntent(message, session.locale)
//     ) {
//       const text = buildKnowledgeBrowsLashesDetailsText(
//         session.locale as 'de' | 'en' | 'ru',
//       );
//       appendSessionMessage(sessionId, 'assistant', text);

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-brows-lashes-details`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     if (
//       (activeConsultationTopic === 'pmu' || !activeConsultationTopic) &&
//       isKnowledgePmuContraindicationsIntent(message, session.locale)
//     ) {
//       const contraindicationsTechnique =
//         session.context.consultationTechnique ??
//         detectKnowledgePmuTechnique(message, session.locale);
//       const text = contraindicationsTechnique
//         ? buildKnowledgePmuTechniqueContraindicationsText(
//             session.locale,
//             contraindicationsTechnique,
//           )
//         : buildKnowledgePmuContraindicationsText(session.locale);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationTopic: 'pmu',
//           consultationTechnique: contraindicationsTechnique ?? undefined,
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         contraindicationsTechnique
//           ? `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-contraindications technique=${contraindicationsTechnique}`
//           : `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-contraindications`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     if (
//       (activeConsultationTopic === 'pmu' || !activeConsultationTopic) &&
//       isKnowledgePmuHealingIntent(message, session.locale)
//     ) {
//       const healingTechnique =
//         session.context.consultationTechnique ??
//         detectKnowledgePmuTechnique(message, session.locale);
//       const text = healingTechnique
//         ? buildKnowledgePmuTechniqueSafetyText(session.locale, healingTechnique)
//         : buildKnowledgePmuHealingText(session.locale);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationTopic: 'pmu',
//           consultationTechnique: healingTechnique ?? undefined,
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         healingTechnique
//           ? `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-safety technique=${healingTechnique}`
//           : `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-healing`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     if (
//       (activeConsultationTopic === 'pmu' || !activeConsultationTopic) &&
//       isKnowledgePmuLipsChoiceIntent(message, session.locale)
//     ) {
//       const text = buildKnowledgePmuLipsChoiceText(session.locale);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationTopic: 'pmu',
//           consultationTechnique: undefined,
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-lips-options`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     const technique = detectKnowledgePmuTechnique(message, session.locale);
//     if (technique) {
//       if (isConsultationOperationalBookingInput(message)) {
//         const text = buildConsultationBookingConfirmText(session.locale, technique);
//         appendSessionMessage(sessionId, 'assistant', text);
//         upsertSession(sessionId, {
//           context: {
//             consultationTechnique: technique,
//             awaitingConsultationBookingConfirmation: true,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-booking-cta technique=${technique}`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//         });
//       }

//       const wantsDetails = isKnowledgeDetailsIntent(message, session.locale);
//       const text = wantsDetails
//         ? buildKnowledgePmuTechniqueDetailsText(session.locale, technique)
//         : buildKnowledgePmuTechniqueText(session.locale, technique);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationTechnique: technique,
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=${wantsDetails ? 'consultation-technique-details' : 'consultation-technique'} technique=${technique}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     if (
//       session.context.consultationTechnique &&
//       isKnowledgeDetailsIntent(message, session.locale)
//     ) {
//       const text = buildKnowledgePmuTechniqueDetailsText(
//         session.locale,
//         session.context.consultationTechnique,
//       );
//       appendSessionMessage(sessionId, 'assistant', text);

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-details-followup technique=${session.context.consultationTechnique}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }
//     if (
//       session.context.consultationTechnique &&
//       isSelectedServiceSuitabilityIntent(message, session.locale)
//     ) {
//       const text = buildConsultationTechniqueSuitabilityText(
//         session.locale,
//         session.context.consultationTechnique,
//       );
//       appendSessionMessage(sessionId, 'assistant', text);

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-technique-suitability technique=${session.context.consultationTechnique}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     if (
//       activeConsultationTopic &&
//       activeConsultationTopic !== 'pmu' &&
//       (
//         looksLikeServiceOptionPayload(message) ||
//         looksLikePricedOptionPayload(message) ||
//         isConsultationSpecificBookingIntent(message, session.locale)
//       )
//     ) {
//       const consultationSelection = await tryHandleCatalogSelectionFastPath(
//         session,
//         sessionId,
//         message,
//       );
//       if (consultationSelection) {
//         upsertSession(sessionId, {
//           context: {
//             consultationMode: false,
//             consultationTopic: undefined,
//             consultationTechnique: undefined,
//             awaitingConsultationBookingConfirmation: false,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-service-selection topic=${activeConsultationTopic}`,
//         );

//         return NextResponse.json(consultationSelection);
//       }
//     }

//     if (activeConsultationTopic === 'hydrafacial') {
//       const hydrafacialGoal = detectKnowledgeHydrafacialGoal(
//         message,
//         session.locale,
//       );
//       if (hydrafacialGoal) {
//         const text = buildKnowledgeHydrafacialGoalText(
//           session.locale,
//           hydrafacialGoal,
//         );
//         appendSessionMessage(sessionId, 'assistant', text);
//         upsertSession(sessionId, {
//           context: {
//             consultationTechnique: undefined,
//             awaitingConsultationBookingConfirmation: false,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-hydrafacial-goal goal=${hydrafacialGoal}`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//         });
//       }
//     }

//     const consultationStyle = detectKnowledgeConsultationStyle(
//       message,
//       session.locale,
//     );
//     if (consultationStyle) {
//       const text =
//         activeConsultationTopic === 'brows_lashes'
//           ? buildKnowledgeBrowsLashesStyleText(session.locale, consultationStyle)
//           : buildKnowledgeConsultationStyleText(session.locale, consultationStyle);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationTechnique: undefined,
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-style style=${consultationStyle}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }

//     const consultationTopic = detectKnowledgeConsultationTopic(message, session.locale);
//     if (consultationTopic && consultationTopic !== activeConsultationTopic) {
//       const startedAt = Date.now();
//       const catalog = await listServices({ locale: session.locale });
//       const durationMs = Date.now() - startedAt;
//       const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
//       const text = buildConsultationTopicText(
//         session.locale,
//         consultationTopic,
//         groups,
//       );
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationTopic,
//           consultationTechnique: undefined,
//           awaitingConsultationBookingConfirmation: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-topic topic=${consultationTopic}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [{ name: 'list_services', durationMs }],
//       });
//     }

//     if (isConsultationOperationalBookingInput(message)) {
//       const technique = session.context.consultationTechnique;
//       if (technique) {
//         const text = buildConsultationBookingConfirmText(session.locale, technique);
//         appendSessionMessage(sessionId, 'assistant', text);
//         upsertSession(sessionId, {
//           context: {
//             awaitingConsultationBookingConfirmation: true,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-bridge-to-booking-confirm technique=${technique}`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//         });
//       }

//       if (activeConsultationTopic === 'pmu') {
//         const startedAt = Date.now();
//         const catalog = await listServices({ locale: session.locale });
//         const durationMs = Date.now() - startedAt;
//         const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
//         const text = buildConsultationTopicText(session.locale, 'pmu', groups);
//         appendSessionMessage(sessionId, 'assistant', text);

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-bridge-to-booking-pmu-technique-required`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//           toolCalls: [{ name: 'list_services', durationMs }],
//         });
//       }

//       const startedAt = Date.now();
//       const catalog = await listServices({ locale: session.locale });
//       const durationMs = Date.now() - startedAt;
//       const groups = (catalog.groups ?? []) as Array<{ title: string }>;
//       const groupTitles = groups.map((g) => g.title).filter(Boolean);
//       const text = buildBookingStartText(session.locale, groupTitles);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           consultationMode: false,
//           consultationTopic: undefined,
//           consultationTechnique: undefined,
//           awaitingConsultationBookingConfirmation: false,
//           selectedServiceIds: undefined,
//           selectedMasterId: undefined,
//           reservedSlot: undefined,
//           draftId: undefined,
//           lastDateISO: undefined,
//           lastPreferredTime: undefined,
//           lastNoSlots: false,
//           lastSuggestedDateOptions: undefined,
//           awaitingRegistrationMethod: false,
//           pendingVerificationMethod: undefined,
//           awaitingVerificationMethod: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-bridge-to-booking-start groups=${groupTitles.length}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [{ name: 'list_services', durationMs }],
//         inputMode: 'text',
//       });
//     }

//     const startedAt = Date.now();
//     const catalog = await listServices({ locale: session.locale });
//     const durationMs = Date.now() - startedAt;
//     const groups = (catalog.groups ?? []) as SelectionCatalogGroup[];
//     const text = activeConsultationTopic
//       ? buildConsultationTopicText(session.locale, activeConsultationTopic, groups)
//       : buildConsultationStartText(session.locale, groups);
//     appendSessionMessage(sessionId, 'assistant', text);

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=consultation-fallback topic=${activeConsultationTopic ?? 'none'}`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       toolCalls: [{ name: 'list_services', durationMs }],
//     });
//   }

//   // Deterministic handling for free-form date questions while service/master are already fixed.
//   // Example: "есть даты после 10" -> keep current service and ask for exact DD.MM date.
//   if (
//     selectedMasterId &&
//     selectedServiceIds.length > 0 &&
//     isDesiredDateQuestion(message, session.locale)
//   ) {
//     const text =
//       session.locale === 'ru'
//         ? 'Да, можно выбрать желаемую дату.\nНапишите дату в формате ДД.ММ (например, 10.03), и я сразу покажу свободное время.'
//         : session.locale === 'en'
//           ? 'Yes, you can choose your preferred date.\nType a date in DD.MM format (for example, 10.03), and I will show free slots right away.'
//           : 'Ja, Sie können Ihr Wunschdatum wählen.\nSchreiben Sie das Datum im Format TT.MM (zum Beispiel 10.03), und ich zeige sofort freie Zeiten.';

//     appendSessionMessage(sessionId, 'assistant', text);

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=date-guidance`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//     });
//   }

//   // Deterministic details response for the currently selected service in booking flow.
//   // Prevents random-language fallbacks from the LLM when user asks "подробнее".
//   const asksSelectedServiceDetails = isKnowledgeDetailsIntent(message, session.locale);
//   const asksSelectedServiceSuitability = isSelectedServiceSuitabilityIntent(
//     message,
//     session.locale,
//   );
//   if (
//     hasActiveBookingFlow &&
//     selectedServiceIds.length > 0 &&
//     (asksSelectedServiceDetails || asksSelectedServiceSuitability)
//   ) {
//     const startedAt = Date.now();
//     const catalog = await listServices({ locale: session.locale });
//     const durationMs = Date.now() - startedAt;
//     const groups = (catalog.groups ?? []) as Array<{
//       id: string;
//       title: string;
//       services: Array<{
//         id: string;
//         title: string;
//         durationMin: number;
//       }>;
//     }>;
//     const selectedService = groups
//       .flatMap((group) =>
//         group.services.map((service) => ({
//           id: service.id,
//           title: service.title,
//           groupTitle: group.title,
//           durationMin: service.durationMin,
//         })),
//       )
//       .find((service) => selectedServiceIds.includes(service.id));

//     if (selectedService) {
//       const text = asksSelectedServiceSuitability
//         ? buildSelectedServiceSuitabilityText(
//             session.locale,
//             selectedService.title,
//             selectedService.groupTitle,
//           )
//         : buildSelectedServiceDetailsText(
//             session.locale,
//             selectedService.title,
//             selectedService.groupTitle,
//             selectedService.durationMin,
//           );
//       appendSessionMessage(sessionId, 'assistant', text);

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=${asksSelectedServiceSuitability ? 'booking-selected-service-suitability' : 'booking-selected-service-details'} service="${selectedService.title}"`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [{ name: 'list_services', durationMs }],
//       });
//     }
//   }

//   // Deterministic selection flow first:
//   // category click -> concrete services, service click -> masters/date step.
//   // Important: run before scope-guard, otherwise service option clicks can be blocked.
//   let selectionFastPath: ChatResponse | null = null;
//   const shouldRunSelectionFastPath =
//     isServiceAvailabilityInquiry(message, session.locale) ||
//     !session.context.consultationMode ||
//     hasActiveBookingFlow;
//   if (shouldRunSelectionFastPath) {
//     selectionFastPath = await tryHandleCatalogSelectionFastPath(
//       session,
//       sessionId,
//       message,
//     );
//   }
//   if (selectionFastPath) {
//     upsertSession(sessionId, {
//       context: {
//         consultationMode: false,
//         consultationTopic: undefined,
//         consultationTechnique: undefined,
//         awaitingConsultationBookingConfirmation: false,
//       },
//     });
//     return NextResponse.json(selectionFastPath);
//   }

//   // Deterministic registration-method selection after slot reservation.
//   if (session.context.awaitingRegistrationMethod && session.context.reservedSlot) {
//     const selectedMethod = detectRegistrationMethodChoice(message, { voiceMode: isVoiceTurn });
//     if (selectedMethod) {
//       if (selectedMethod === 'google_oauth') {
//         const handoffUrl = buildGoogleHandoffUrl(session);
//         const effectiveMethod = handoffUrl ? selectedMethod : 'email_otp';
//         const keepMethodStep = Boolean(handoffUrl);
//         const text = handoffUrl
//           ? buildGoogleHandoffText(session.locale, handoffUrl)
//           : buildContactCollectionTextForMethod(session.locale, 'email_otp', {
//               voiceMode: isVoiceTurn,
//             });

//         appendSessionMessage(sessionId, 'assistant', text);
//         upsertSession(sessionId, {
//           context: {
//             awaitingRegistrationMethod: keepMethodStep,
//             pendingVerificationMethod: effectiveMethod,
//             awaitingVerificationMethod: false,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=registration-method method=${selectedMethod}`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//         });
//       }

//       const text = buildContactCollectionTextForMethod(session.locale, selectedMethod, {
//         voiceMode: isVoiceTurn,
//       });
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           awaitingRegistrationMethod: false,
//           pendingVerificationMethod: selectedMethod,
//           awaitingVerificationMethod: false,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=registration-method method=${selectedMethod}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//       });
//     }
//   }

//   if (shouldApplyScopeGuard(message, session, { voiceMode: isVoiceTurn })) {
//     const text = buildScopeGuardText(session.locale, hasActiveBookingFlow);
//     appendSessionMessage(sessionId, 'assistant', text);

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=scope-guard active=${hasActiveBookingFlow}`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//     });
//   }

//   // Deterministic full catalog view to avoid partial/unstable LLM formatting.
//   if (isFullCatalogRequest(message, session.locale)) {
//     const startedAt = Date.now();
//     const catalog = await listServices({ locale: session.locale });
//     const durationMs = Date.now() - startedAt;
//     const groups = (catalog.groups ?? []) as Array<{
//       title: string;
//       services: Array<{ title: string; durationMin: number; priceCents: number | null }>;
//     }>;
//     const text = buildFullCatalogText(session.locale, groups);

//     appendSessionMessage(sessionId, 'assistant', text);

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=services-full-list groups=${groups.length} services=${catalog.matchedServices ?? 0}`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       toolCalls: [{ name: 'list_services', durationMs }],
//     });
//   }

//   // Deterministic location/hours reply to avoid language drift in generic LLM answers.
//   if (isKnowledgeLocationHoursIntent(message, session.locale)) {
//     const text = buildKnowledgeLocationHoursText(session.locale);
//     appendSessionMessage(sessionId, 'assistant', text);

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=location-hours`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//     });
//   }

//   // Deterministic "nearest date" action from clickable option.
//   if (
//     selectedMasterId &&
//     selectedServiceIds.length > 0 &&
//     isNearestDateRequest(message)
//   ) {
//     const startDateISO = session.context.lastDateISO ?? todayISO();
//     const startedAt = Date.now();
//     const optionsMap = await buildNearestDateOptions({
//       masterId: selectedMasterId,
//       serviceIds: selectedServiceIds,
//       locale: session.locale,
//       startDateISO,
//       minCount: 6,
//     });
//     const durationMs = Date.now() - startedAt;
//     const text = buildNoSlotsFollowUpText(session.locale, optionsMap);

//     appendSessionMessage(sessionId, 'assistant', text);
//     upsertSession(sessionId, {
//       context: {
//         lastDateISO: startDateISO,
//         lastNoSlots: optionsMap.length === 0,
//         lastSuggestedDateOptions: optionsMap,
//       },
//     });

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=nearest-date days=${optionsMap.length}`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       toolCalls: [{ name: 'search_availability_month', durationMs }],
//     });
//   }

//   // Deterministic "tomorrow" action from clickable option.
//   if (
//     selectedMasterId &&
//     selectedServiceIds.length > 0 &&
//     isTomorrowRequest(message)
//   ) {
//     const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
//     const dateISO = tomorrowDate.toISOString().slice(0, 10);
//     const startedAt = Date.now();
//     const availabilityResult = await searchAvailability({
//       masterId: selectedMasterId,
//       dateISO,
//       serviceIds: selectedServiceIds,
//       preferredTime: 'any',
//     });
//     const durationMs = Date.now() - startedAt;
//     const slots = Array.isArray(availabilityResult.slots)
//       ? availabilityResult.slots
//       : [];

//     if (slots.length > 0) {
//       const text = buildSlotsForDateText(session.locale, dateISO, slots);
//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           lastDateISO: dateISO,
//           lastPreferredTime: 'any',
//           lastNoSlots: false,
//           lastSuggestedDateOptions: undefined,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=tomorrow slots=${slots.length}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [{ name: 'search_availability', durationMs }],
//       });
//     }

//     const monthStartedAt = Date.now();
//     const optionsMap = await buildNearestDateOptions({
//       masterId: selectedMasterId,
//       serviceIds: selectedServiceIds,
//       locale: session.locale,
//       startDateISO: shiftDateISO(dateISO, 1),
//       minCount: 6,
//     });
//     const monthDurationMs = Date.now() - monthStartedAt;
//     const text = buildNoSlotsFollowUpText(session.locale, optionsMap);

//     appendSessionMessage(sessionId, 'assistant', text);
//     upsertSession(sessionId, {
//       context: {
//         lastDateISO: dateISO,
//         lastPreferredTime: 'any',
//         lastNoSlots: optionsMap.length === 0,
//         lastSuggestedDateOptions: optionsMap,
//       },
//     });

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=tomorrow-no-slots days=${optionsMap.length}`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       toolCalls: [
//         { name: 'search_availability', durationMs },
//         { name: 'search_availability_month', durationMs: monthDurationMs },
//       ],
//     });
//   }

//   // Deterministic manual date input (e.g. 28.02 / 28-02 / 28/02).
//   if (selectedMasterId && selectedServiceIds.length > 0) {
//     const explicitDateISO = parseFlexibleDateInputToISO(
//       message,
//       session.context.lastDateISO ?? todayISO(),
//     );

//     if (explicitDateISO) {
//       const requestedPreferredTime = detectPreferredTimeInput(message) ?? 'any';
//       const startedAt = Date.now();
//       const availabilityResult = await searchAvailability({
//         masterId: selectedMasterId,
//         dateISO: explicitDateISO,
//         serviceIds: selectedServiceIds,
//         preferredTime: requestedPreferredTime,
//       });
//       const durationMs = Date.now() - startedAt;
//       const slots = Array.isArray(availabilityResult.slots)
//         ? availabilityResult.slots
//         : [];

//       if (slots.length > 0) {
//         const text = buildSlotsForDateText(session.locale, explicitDateISO, slots);
//         appendSessionMessage(sessionId, 'assistant', text);
//         upsertSession(sessionId, {
//           context: {
//             lastDateISO: explicitDateISO,
//             lastPreferredTime: requestedPreferredTime,
//             lastNoSlots: false,
//             lastSuggestedDateOptions: undefined,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=manual-date-picked date=${explicitDateISO} slots=${slots.length}`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//           toolCalls: [{ name: 'search_availability', durationMs }],
//         });
//       }

//       const monthStartedAt = Date.now();
//       const optionsMap = await buildNearestDateOptions({
//         masterId: selectedMasterId,
//         serviceIds: selectedServiceIds,
//         locale: session.locale,
//         startDateISO: shiftDateISO(explicitDateISO, 1),
//         minCount: 6,
//       });
//       const monthDurationMs = Date.now() - monthStartedAt;
//       const dayLabel = formatDateLabel(explicitDateISO, session.locale);
//       const noSlotsPrefix =
//         session.locale === 'ru'
//           ? `На ${dayLabel} свободных слотов нет.`
//           : session.locale === 'en'
//             ? `There are no free slots on ${dayLabel}.`
//             : `Für ${dayLabel} gibt es keine freien Slots.`;
//       const followUpText = buildNoSlotsFollowUpText(session.locale, optionsMap);
//       const text = `${noSlotsPrefix}\n\n${followUpText}`;

//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//             lastDateISO: explicitDateISO,
//             lastPreferredTime: requestedPreferredTime,
//             lastNoSlots: optionsMap.length === 0,
//             lastSuggestedDateOptions: optionsMap,
//           },
//         });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=manual-date-no-slots date=${explicitDateISO} days=${optionsMap.length}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [
//           { name: 'search_availability', durationMs },
//           { name: 'search_availability_month', durationMs: monthDurationMs },
//         ],
//       });
//     }
//   }

//   // Deterministic follow-up: user picked one of date suggestions.
//   // We intentionally search with preferredTime=any to avoid stale time filters.
//   if (selectedMasterId && selectedServiceIds.length > 0 && suggestedDateOptions.length > 0) {
//     const pickedDate = matchSuggestedDateOption(message, suggestedDateOptions);
//     if (pickedDate) {
//       const startedAt = Date.now();
//       const availabilityResult = await searchAvailability({
//         masterId: selectedMasterId,
//         dateISO: pickedDate.dateISO,
//         serviceIds: selectedServiceIds,
//         preferredTime: 'any',
//       });
//       const durationMs = Date.now() - startedAt;
//       const slots = Array.isArray(availabilityResult.slots)
//         ? availabilityResult.slots
//         : [];

//       if (slots.length > 0) {
//         const text = buildSlotsForDateText(session.locale, pickedDate.dateISO, slots);
//         appendSessionMessage(sessionId, 'assistant', text);
//         upsertSession(sessionId, {
//           context: {
//             lastDateISO: pickedDate.dateISO,
//             lastPreferredTime: 'any',
//             lastNoSlots: false,
//             lastSuggestedDateOptions: undefined,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=suggested-date-picked date=${pickedDate.dateISO} slots=${slots.length}`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//           toolCalls: [{ name: 'search_availability', durationMs }],
//         });
//       }

//       const monthStartedAt = Date.now();
//       const optionsMap = await buildNearestDateOptions({
//         masterId: selectedMasterId,
//         serviceIds: selectedServiceIds,
//         locale: session.locale,
//         startDateISO: shiftDateISO(pickedDate.dateISO, 1),
//         minCount: 6,
//       });
//       const monthDurationMs = Date.now() - monthStartedAt;
//       const text = buildNoSlotsFollowUpText(session.locale, optionsMap);

//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           lastDateISO: pickedDate.dateISO,
//           lastPreferredTime: 'any',
//           lastNoSlots: optionsMap.length === 0,
//           lastSuggestedDateOptions: optionsMap,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=suggested-date-no-slots date=${pickedDate.dateISO} days=${optionsMap.length}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [
//           { name: 'search_availability', durationMs },
//           { name: 'search_availability_month', durationMs: monthDurationMs },
//         ],
//       });
//     }
//   }

//   // Deterministic follow-up: natural-language preferred time on already chosen date.
//   if (selectedMasterId && selectedServiceIds.length > 0 && session.context.lastDateISO) {
//     const preferredTime = detectPreferredTimeInput(message);
//     if (preferredTime) {
//       const dateISO = session.context.lastDateISO;
//       const startedAt = Date.now();
//       const preferredResult = await searchAvailability({
//         masterId: selectedMasterId,
//         dateISO,
//         serviceIds: selectedServiceIds,
//         preferredTime,
//       });
//       const durationMs = Date.now() - startedAt;
//       const preferredSlots = Array.isArray(preferredResult.slots)
//         ? preferredResult.slots
//         : [];

//       if (preferredSlots.length > 0) {
//         const text = buildSlotsForDateText(session.locale, dateISO, preferredSlots);
//         appendSessionMessage(sessionId, 'assistant', text);
//         upsertSession(sessionId, {
//           context: {
//             lastDateISO: dateISO,
//             lastPreferredTime: preferredTime,
//             lastNoSlots: false,
//             lastSuggestedDateOptions: undefined,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=preferred-time-picked date=${dateISO} preferred=${preferredTime} slots=${preferredSlots.length}`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//           toolCalls: [{ name: 'search_availability', durationMs }],
//         });
//       }

//       // If no slots for preferred period, show full-day alternatives on the same date.
//       const fallbackStartedAt = Date.now();
//       const anyTimeResult = await searchAvailability({
//         masterId: selectedMasterId,
//         dateISO,
//         serviceIds: selectedServiceIds,
//         preferredTime: 'any',
//       });
//       const fallbackDurationMs = Date.now() - fallbackStartedAt;
//       const anyTimeSlots = Array.isArray(anyTimeResult.slots)
//         ? anyTimeResult.slots
//         : [];

//       const noPreferredText =
//         session.locale === 'ru'
//           ? 'На выбранный период свободных слотов нет. Вот все доступные варианты на эту дату:'
//           : session.locale === 'en'
//             ? 'No free slots for that time period. Here are all available options on this date:'
//             : 'Für diesen Zeitraum gibt es keine freien Slots. Hier sind alle verfügbaren Optionen an diesem Datum:';

//       const text =
//         anyTimeSlots.length > 0
//           ? `${noPreferredText}\n\n${buildSlotsForDateText(session.locale, dateISO, anyTimeSlots)}`
//           : buildSlotsForDateText(session.locale, dateISO, []);

//       appendSessionMessage(sessionId, 'assistant', text);
//       upsertSession(sessionId, {
//         context: {
//           lastDateISO: dateISO,
//           lastPreferredTime: preferredTime,
//           lastNoSlots: anyTimeSlots.length === 0,
//           lastSuggestedDateOptions: undefined,
//         },
//       });

//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=preferred-time-no-slots date=${dateISO} preferred=${preferredTime}`,
//       );

//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [
//           { name: 'search_availability', durationMs },
//           { name: 'search_availability', durationMs: fallbackDurationMs },
//         ],
//       });
//     }
//   }

//   // Deterministic follow-up: spoken time slot selection (e.g. "14:00", "четырнадцать ноль ноль").
//   if (
//     selectedMasterId &&
//     selectedServiceIds.length > 0 &&
//     session.context.lastDateISO &&
//     !session.context.reservedSlot
//   ) {
//     const normalizedMessage = normalizeInput(message);
//     const looksLikeSlotChoice =
//       /\b\d{1,2}[:.]\d{2}\s*[–-]\s*\d{1,2}[:.]\d{2}\b/u.test(
//         normalizedMessage,
//       ) ||
//       /\b\d{1,2}[.:]\d{1,2}[.:]\d{1,2}\b/u.test(normalizedMessage) ||
//       Boolean(extractPreferredStartTimeInput(message));
//     if (looksLikeSlotChoice) {
//       const dateISO = session.context.lastDateISO;
//       const startedAt = Date.now();
//       const availabilityResult = await searchAvailability({
//         masterId: selectedMasterId,
//         dateISO,
//         serviceIds: selectedServiceIds,
//         preferredTime: 'any',
//       });
//       const availabilityDurationMs = Date.now() - startedAt;
//       const slots = Array.isArray(availabilityResult.slots)
//         ? availabilityResult.slots
//         : [];
//       const matchedSlot = matchSlotFromInput(message, slots);

//       if (matchedSlot) {
//         const reserveStartedAt = Date.now();
//         const reserveResult = await reserveSlot({
//           masterId: selectedMasterId,
//           startAt: matchedSlot.startAt,
//           endAt: matchedSlot.endAt,
//           sessionId,
//         });
//         const reserveDurationMs = Date.now() - reserveStartedAt;

//         if (reserveResult.success) {
//           const text = buildRegistrationMethodChoiceText(session.locale, {
//             voiceMode: isVoiceTurn,
//           });
//           appendSessionMessage(sessionId, 'assistant', text);
//           upsertSession(sessionId, {
//             context: {
//               reservedSlot: {
//                 startAt: matchedSlot.startAt,
//                 endAt: matchedSlot.endAt,
//               },
//               lastDateISO: dateISO,
//               lastPreferredTime: 'any',
//               lastNoSlots: false,
//               lastSuggestedDateOptions: undefined,
//               awaitingRegistrationMethod: true,
//               pendingVerificationMethod: undefined,
//               awaitingVerificationMethod: false,
//             },
//           });

//           console.log(
//             `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=slot-picked-by-time date=${dateISO} slot="${matchedSlot.displayTime}"`,
//           );

//           return NextResponse.json({
//             text,
//             sessionId,
//             toolCalls: [
//               { name: 'search_availability', durationMs: availabilityDurationMs },
//               { name: 'reserve_slot', durationMs: reserveDurationMs },
//             ],
//             inputMode: 'text',
//           });
//         }

//         if (reserveResult.error === 'SLOT_TAKEN') {
//           const refreshStartedAt = Date.now();
//           const refreshed = await searchAvailability({
//             masterId: selectedMasterId,
//             dateISO,
//             serviceIds: selectedServiceIds,
//             preferredTime: 'any',
//           });
//           const refreshDurationMs = Date.now() - refreshStartedAt;
//           const text = buildSlotTakenAlternativesText(
//             session.locale,
//             dateISO,
//             refreshed.slots ?? [],
//           );

//           appendSessionMessage(sessionId, 'assistant', text);
//           upsertSession(sessionId, {
//             context: {
//               draftId: undefined,
//               reservedSlot: undefined,
//               awaitingVerificationMethod: false,
//               awaitingRegistrationMethod: false,
//               pendingVerificationMethod: undefined,
//             },
//           });

//           console.log(
//             `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=slot-picked-by-time-taken date=${dateISO}`,
//           );

//           return NextResponse.json({
//             text,
//             sessionId,
//             toolCalls: [
//               { name: 'search_availability', durationMs: availabilityDurationMs },
//               { name: 'reserve_slot', durationMs: reserveDurationMs },
//               { name: 'search_availability', durationMs: refreshDurationMs },
//             ],
//             inputMode: 'text',
//           });
//         }
//       }

//       // User tried to pick time, but we could not map it to a slot.
//       const text =
//         session.locale === 'ru'
//           ? `Не удалось распознать выбранное время. Пожалуйста, выберите один из доступных слотов:\n\n${buildSlotsForDateText(session.locale, dateISO, slots)}`
//           : session.locale === 'en'
//             ? `I could not recognize the selected time. Please choose one of the available slots:\n\n${buildSlotsForDateText(session.locale, dateISO, slots)}`
//             : `Die gewählte Zeit konnte nicht erkannt werden. Bitte wählen Sie einen der verfügbaren Slots:\n\n${buildSlotsForDateText(session.locale, dateISO, slots)}`;

//       appendSessionMessage(sessionId, 'assistant', text);
//       return NextResponse.json({
//         text,
//         sessionId,
//         toolCalls: [{ name: 'search_availability', durationMs: availabilityDurationMs }],
//       });
//     }
//   }

//   // Deterministic follow-up: user confirms after "no slots" -> check month availability
//   if (
//     session.context.lastNoSlots &&
//     isAffirmativeFollowUp(message) &&
//     selectedMasterId &&
//     selectedServiceIds.length > 0
//   ) {
//     const sameDateISO = session.context.lastDateISO;
//     if (sameDateISO) {
//       const sameDayStartedAt = Date.now();
//       const sameDayResult = await searchAvailability({
//         masterId: selectedMasterId,
//         dateISO: sameDateISO,
//         serviceIds: selectedServiceIds,
//         preferredTime: 'any',
//       });
//       const sameDayDurationMs = Date.now() - sameDayStartedAt;

//       if ((sameDayResult.slots?.length ?? 0) > 0) {
//         const text = buildSlotsForDateText(
//           session.locale,
//           sameDateISO,
//           sameDayResult.slots ?? [],
//         );

//         appendSessionMessage(sessionId, 'assistant', text);
//         upsertSession(sessionId, {
//           context: {
//             lastDateISO: sameDateISO,
//             lastPreferredTime: 'any',
//             lastNoSlots: false,
//             lastSuggestedDateOptions: undefined,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=no-slots-same-day-recheck date=${sameDateISO} slots=${sameDayResult.slots?.length ?? 0}`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//           toolCalls: [{ name: 'search_availability', durationMs: sameDayDurationMs }],
//         });
//       }
//     }

//     const startedAt = Date.now();
//     const optionsMap = await buildNearestDateOptions({
//       masterId: selectedMasterId,
//       serviceIds: selectedServiceIds,
//       locale: session.locale,
//       startDateISO: shiftDateISO(session.context.lastDateISO ?? todayISO(), 1),
//       minCount: 6,
//     });
//     const durationMs = Date.now() - startedAt;
//     const text = buildNoSlotsFollowUpText(session.locale, optionsMap);

//     appendSessionMessage(sessionId, 'assistant', text);
//     upsertSession(sessionId, {
//       context: {
//         lastNoSlots: optionsMap.length === 0,
//         lastSuggestedDateOptions: optionsMap,
//       },
//     });

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=no-slots-follow-up days=${optionsMap.length}`,
//     );

//     return NextResponse.json({
//       text,
//       sessionId,
//       toolCalls: [{ name: 'search_availability_month', durationMs }],
//     });
//   }

//   // ─── Deterministic: user picks verification method ────────
//   if (session.context.awaitingVerificationMethod && session.context.draftId) {
//     const chosenMethod = detectVerificationMethodChoice(message, {
//       voiceMode: isVoiceTurn,
//     });
//     if (chosenMethod) {
//       // Look up the draft to get contact info
//       const draft = await prisma.bookingDraft.findUnique({
//         where: { id: session.context.draftId },
//         select: { email: true, phone: true },
//       });

//       if (draft) {
//         const contact = getContactForMethod(chosenMethod, draft.email, draft.phone);

//         if (!contact) {
//           const noContactText =
//             session.locale === 'ru'
//               ? 'Для этого метода нет контактных данных. Пожалуйста, выберите другой способ.'
//               : session.locale === 'en'
//                 ? 'No contact info available for this method. Please choose another way.'
//                 : 'Keine Kontaktdaten für diese Methode vorhanden. Bitte wählen Sie eine andere.';
//           appendSessionMessage(sessionId, 'assistant', noContactText);
//           return NextResponse.json({ text: noContactText, sessionId });
//         }

//         const startedAt = Date.now();
//         const verifyRes = await startVerification({
//           method: chosenMethod,
//           draftId: session.context.draftId,
//           contact,
//         });
//         const durationMs = Date.now() - startedAt;

//         const text = buildVerificationAutoText(session.locale, {
//           ok: Boolean(verifyRes?.ok),
//           contactMasked:
//             typeof verifyRes === 'object' && verifyRes && 'contactMasked' in verifyRes
//               ? (verifyRes.contactMasked as string | undefined)
//               : undefined,
//           error:
//             typeof verifyRes === 'object' && verifyRes && 'error' in verifyRes
//               ? String(verifyRes.error ?? '')
//               : undefined,
//         });

//         appendSessionMessage(sessionId, 'assistant', text);
//         upsertSession(sessionId, {
//           context: {
//             awaitingVerificationMethod: false,
//             pendingVerificationMethod: verifyRes?.ok ? undefined : chosenMethod,
//           },
//         });

//         console.log(
//           `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=verification-method-chosen method=${chosenMethod} ok=${Boolean(verifyRes?.ok)}`,
//         );

//         return NextResponse.json({
//           text,
//           sessionId,
//           toolCalls: [{ name: 'start_verification', durationMs }],
//           inputMode: verifyRes?.ok ? 'otp' : undefined,
//         });
//       }
//     }
//   }

//   }

//   // Build messages
//   const systemPrompt = buildSystemPrompt(session.locale);
//   const knowledgePrompt = buildKnowledgeSystemMessage(session.locale);
//   const stateHints: string[] = [];
//   if (session.context.consultationMode) {
//     stateHints.push('consultationMode=true');
//   }
//   if (session.context.consultationTopic) {
//     stateHints.push(`consultationTopic=${session.context.consultationTopic}`);
//   }
//   if (session.context.selectedServiceIds && session.context.selectedServiceIds.length > 0) {
//     stateHints.push(`selectedServiceIds=${session.context.selectedServiceIds.join(',')}`);
//   }
//   if (session.context.selectedMasterId) {
//     stateHints.push(`selectedMasterId=${session.context.selectedMasterId}`);
//   }
//   if (session.context.lastDateISO) {
//     stateHints.push(`lastDateISO=${session.context.lastDateISO}`);
//   }
//   if (session.context.lastPreferredTime) {
//     stateHints.push(`lastPreferredTime=${session.context.lastPreferredTime}`);
//   }
//   if (session.context.lastNoSlots !== undefined) {
//     stateHints.push(`lastNoSlots=${String(session.context.lastNoSlots)}`);
//   }
//   if (session.context.awaitingRegistrationMethod) {
//     stateHints.push('awaitingRegistrationMethod=true');
//   }
//   if (session.context.pendingVerificationMethod) {
//     stateHints.push(`pendingVerificationMethod=${session.context.pendingVerificationMethod}`);
//   }
//   if (session.context.awaitingVerificationMethod) {
//     stateHints.push('awaitingVerificationMethod=true');
//   }
//   if (isVoiceTurn) {
//     stateHints.push('inputMode=voice');
//   }

//   const statePrompt =
//     stateHints.length > 0
//       ? `SESSION STATE (do not reset booking flow): ${stateHints.join(' | ')}`
//       : null;
//   const voicePrompt = isVoiceTurn
//     ? 'VOICE INPUT MODE: Keep prompts short. For Telegram/SMS contact collection ask only name + phone. Do not ask for email in voice flow. If email is missing in voice flow, continue with phone-based verification methods.'
//     : null;

//   const historyMessages: OpenAI.Chat.ChatCompletionMessageParam[] = (
//     session.context.chatHistory ?? []
//   )
//     .slice(-16)
//     .filter((m) => m.content?.trim())
//     .map((m) => ({
//       role: m.role,
//       content: m.content,
//     }) as OpenAI.Chat.ChatCompletionMessageParam);

//   // Build conversation history from session
//   // Keep recent dialogue context to avoid flow resets between turns.
//   const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
//     { role: 'system', content: systemPrompt },
//     { role: 'system', content: knowledgePrompt },
//     ...(statePrompt ? [{ role: 'system', content: statePrompt } as const] : []),
//     ...(voicePrompt ? [{ role: 'system', content: voicePrompt } as const] : []),
//     ...historyMessages,
//     { role: 'user', content: message },
//   ];

//   // Tool definitions for OpenAI
//   const tools: OpenAI.Chat.ChatCompletionTool[] = TOOLS.map((t) => ({
//     type: 'function' as const,
//     function: {
//       name: t.name,
//       description: t.description,
//       parameters: t.parameters,
//     },
//   }));

//   const useSSE = wantStream === true && !isVoiceTurn;
//   const sse = useSSE ? createSSEWriter() : undefined;
//   turnUsedGpt = true;
//   turnResponseMode = useSSE ? 'sse' : 'json';
//   const toolCallLog: { name: string; durationMs: number }[] = [];
//   const missingServiceSignals: MissingServiceSignal[] = [];
//   const loopTimeout = createLoopTimeout();
//   const collectedToolResults: Array<{ name: string; result: string }> = [];

//   try {
//     // Tool-calling loop
//     let response: OpenAI.Chat.ChatCompletion | null = null;
//     let streamResult: Awaited<ReturnType<typeof streamingGptCall>> | null = null;

//     if (useSSE && sse) {
//       streamResult = await withRetry(
//         () =>
//           streamingGptCall(
//             client,
//             {
//               model: MODEL,
//               messages,
//               tools,
//               tool_choice: 'auto',
//               temperature: TEMPERATURE,
//               max_tokens: 1024,
//             },
//             sse,
//           ),
//         {
//           onRetry: (attempt, classified) => {
//             console.warn(
//               `[AI Chat SSE] session=${sessionId.slice(0, 8)}... GPT retry #${attempt} reason=${classified.category}`,
//             );
//           },
//           signal: loopTimeout.signal,
//         },
//       );
//     } else {
//       response = await withRetry(
//         () =>
//           client.chat.completions.create({
//             model: MODEL,
//             messages,
//             tools,
//             tool_choice: 'auto',
//             temperature: TEMPERATURE,
//             max_tokens: 1024,
//           }),
//         {
//           onRetry: (attempt, classified) => {
//             console.warn(
//               `[AI Chat] session=${sessionId.slice(0, 8)}... GPT retry #${attempt} reason=${classified.category}`,
//             );
//           },
//           signal: loopTimeout.signal,
//         },
//       );
//     }

//     let iterations = 0;
//     let otpSentDuringSession = false;
//     let bookingCompletedDuringSession = false;
//     let completedAppointmentId: string | undefined;

//     while (iterations < MAX_TOOL_ITERATIONS) {
//       const choice = response?.choices[0];
//       const streamToolCalls = streamResult?.toolCalls ?? [];
//       const hasToolCalls = useSSE
//         ? streamToolCalls.length > 0
//         : Boolean(
//             choice?.finish_reason === 'tool_calls' &&
//               choice.message.tool_calls &&
//               choice.message.tool_calls.length > 0,
//           );

//       if (!useSSE && !choice) break;

//       // If the model wants to call tools
//       if (hasToolCalls) {
//         // Add assistant message with tool calls to history
//         if (useSSE && streamResult) {
//           messages.push(toolCallsToMessage(streamResult));
//         } else if (choice) {
//           messages.push(choice.message);
//         }

//         // Execute all tool calls in parallel
//         // Note: OpenAI SDK has union types for tool calls, we need explicit narrowing
//         const toolCalls: ToolCallRequest[] = [];
//         const parsedArgsByCallId = new Map<string, Record<string, unknown>>();
//         const modelToolCalls = useSSE
//           ? streamToolCalls
//           : ((choice?.message.tool_calls ?? []) as Array<{
//               id: string;
//               function: { name: string; arguments: string };
//             }>);
//         for (const tc of modelToolCalls) {
//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           const fn = (tc as any).function as
//             | { name: string; arguments: string }
//             | undefined;
//           if (fn) {
//             let effectiveArgsJson = fn.arguments;
//             let parsedArgs: Record<string, unknown> | null = null;
//             try {
//               parsedArgs = JSON.parse(fn.arguments) as Record<string, unknown>;

//               // Always bind reserve_slot to the current chat session.
//               if (fn.name === 'reserve_slot') {
//                 parsedArgs.sessionId = sessionId;
//                 effectiveArgsJson = JSON.stringify(parsedArgs);
//               }

//               // Keep complete_booking bound to the latest session draft to avoid stale draftId usage.
//               if (
//                 fn.name === 'complete_booking' &&
//                 typeof session.context.draftId === 'string' &&
//                 session.context.draftId
//               ) {
//                 const incomingDraftId =
//                   typeof parsedArgs.draftId === 'string' ? parsedArgs.draftId : undefined;
//                 if (incomingDraftId !== session.context.draftId) {
//                   parsedArgs.draftId = session.context.draftId;
//                   effectiveArgsJson = JSON.stringify(parsedArgs);
//                 }
//               }

//               parsedArgsByCallId.set(tc.id, parsedArgs);
//             } catch {
//               // Ignore malformed args, tool executor will handle errors
//             }

//             toolCalls.push({
//               id: tc.id,
//               name: fn.name,
//               arguments: effectiveArgsJson,
//             });
//           }
//         }

//         const isContactPayloadMessage = looksLikeContactPayload(message);

//         // When the user sends contact details, keep create_draft aligned with
//         // the already reserved slot for this session.
//         let reserveArgsInBatch:
//           | { masterId: string; startAt: string; endAt: string }
//           | null = null;
//         for (const call of toolCalls) {
//           if (call.name !== 'reserve_slot') continue;
//           const parsed = parsedArgsByCallId.get(call.id);
//           if (
//             parsed &&
//             typeof parsed.masterId === 'string' &&
//             typeof parsed.startAt === 'string' &&
//             typeof parsed.endAt === 'string'
//           ) {
//             reserveArgsInBatch = {
//               masterId: parsed.masterId,
//               startAt: parsed.startAt,
//               endAt: parsed.endAt,
//             };
//             break;
//           }
//         }

//         const reserveArgsFromSession =
//           session.context.reservedSlot &&
//           typeof session.context.selectedMasterId === 'string' &&
//           session.context.selectedMasterId
//             ? {
//                 masterId: session.context.selectedMasterId,
//                 startAt: session.context.reservedSlot.startAt,
//                 endAt: session.context.reservedSlot.endAt,
//               }
//             : null;

//         // If contacts are being provided, force reserve_slot to use the
//         // slot that is currently reserved in session context.
//         if (isContactPayloadMessage && reserveArgsFromSession) {
//           for (const call of toolCalls) {
//             if (call.name !== 'reserve_slot') continue;
//             const parsed = parsedArgsByCallId.get(call.id);
//             if (!parsed) continue;

//             parsed.masterId = reserveArgsFromSession.masterId;
//             parsed.startAt = reserveArgsFromSession.startAt;
//             parsed.endAt = reserveArgsFromSession.endAt;
//             parsed.sessionId = sessionId;
//             call.arguments = JSON.stringify(parsed);
//           }
//         }

//         const createDraftArgsSource =
//           isContactPayloadMessage
//             ? (reserveArgsFromSession ?? reserveArgsInBatch)
//             : reserveArgsInBatch;

//         if (createDraftArgsSource) {
//           for (const call of toolCalls) {
//             if (call.name !== 'create_draft') continue;
//             const parsed = parsedArgsByCallId.get(call.id);
//             if (!parsed) continue;

//             let changed = false;
//             if (parsed.masterId !== createDraftArgsSource.masterId) {
//               parsed.masterId = createDraftArgsSource.masterId;
//               changed = true;
//             }
//             if (parsed.startAt !== createDraftArgsSource.startAt) {
//               parsed.startAt = createDraftArgsSource.startAt;
//               changed = true;
//             }
//             if (parsed.endAt !== createDraftArgsSource.endAt) {
//               parsed.endAt = createDraftArgsSource.endAt;
//               changed = true;
//             }

//             if (changed) {
//               call.arguments = JSON.stringify(parsed);
//             }
//           }
//         }

//         // Prevent race: model may call start_verification in the same batch as create_draft.
//         // Verification must start only after draft is actually persisted.
//         const awaitingContactFlow = Boolean(
//           session.context.reservedSlot &&
//             !session.context.draftId &&
//             session.context.pendingVerificationMethod,
//         );
//         if (awaitingContactFlow) {
//           const hasCreateDraftCall = toolCalls.some((call) => call.name === 'create_draft');
//           if (hasCreateDraftCall) {
//             for (let i = toolCalls.length - 1; i >= 0; i -= 1) {
//               if (toolCalls[i].name === 'start_verification') {
//                 toolCalls.splice(i, 1);
//               }
//             }
//           }
//         }

//         if (useSSE && sse) {
//           for (const call of toolCalls) {
//             sse.sendToolProgress(call.name, mapToolNameToProgressStep(call.name));
//           }
//         }

//         const results = await Promise.all(toolCalls.map(executeTool));
//         const contextPatch: Partial<AiSession['context']> = {};
//         let reservedSlotJustCreated = false;
//         let bookingCompletedInBatch = false;
//         let autoVerificationCandidate: { draftId: string } | null = null;
//         const hasExplicitStartVerification = results.some(
//           (r) => r.name === 'start_verification',
//         );
//         const explicitStartVerificationCalls: Array<{
//           draftId?: string;
//           contact?: string;
//           ok: boolean;
//         }> = [];
//         let slotTakenInBatch = false;
//         let slotTakenDateISO: string | undefined;
//         let slotTakenMasterId: string | undefined;

//         // Add tool results to messages
//         for (const result of results) {
//           const parsedArgs = parsedArgsByCallId.get(result.id);

//           if (result.name !== 'list_services') {
//             contextPatch.consultationMode = false;
//             contextPatch.consultationTopic = undefined;
//             contextPatch.consultationTechnique = undefined;
//             contextPatch.awaitingConsultationBookingConfirmation = false;
//           }

//           if (result.name === 'list_services') {
//             try {
//               const payload = JSON.parse(result.result) as {
//                 noMatches?: boolean;
//                 query?: string | null;
//                 suggestedAlternatives?: Array<{
//                   title: string;
//                   groupTitle?: string | null;
//                   durationMin?: number | null;
//                   priceCents?: number | null;
//                 }>;
//               };

//               if (payload.noMatches && typeof payload.query === 'string' && payload.query.trim()) {
//                 missingServiceSignals.push({
//                   query: payload.query.trim(),
//                   suggestedAlternatives: payload.suggestedAlternatives ?? [],
//                 });
//               }
//             } catch {
//               // Ignore malformed tool payload
//             }
//           }

//           if (result.name === 'list_masters_for_services') {
//             try {
//               const payload = JSON.parse(result.result) as {
//                 matchedServiceIds?: string[];
//                 defaultMasterId?: string | null;
//                 masters?: Array<{ id: string }>;
//                 requiresSpecificService?: boolean;
//               };

//               const argServiceIds = Array.isArray(parsedArgs?.serviceIds)
//                 ? parsedArgs.serviceIds.filter((s): s is string => typeof s === 'string')
//                 : [];

//               if (argServiceIds.length > 0) {
//                 contextPatch.selectedServiceIds = argServiceIds;
//               }

//               if (Array.isArray(payload.matchedServiceIds)) {
//                 contextPatch.selectedServiceIds = payload.matchedServiceIds;
//               }

//               if (
//                 payload.defaultMasterId &&
//                 Array.isArray(payload.masters) &&
//                 payload.masters.length === 1
//               ) {
//                 contextPatch.selectedMasterId = payload.defaultMasterId;
//               }

//               if (payload.requiresSpecificService) {
//                 contextPatch.selectedMasterId = undefined;
//                 contextPatch.lastNoSlots = false;
//                 contextPatch.lastSuggestedDateOptions = undefined;
//               }
//             } catch {
//               // Ignore malformed payload
//             }
//           }

//           if (result.name === 'search_availability') {
//             try {
//               const payload = JSON.parse(result.result) as {
//                 count?: number;
//               };

//               if (typeof parsedArgs?.masterId === 'string') {
//                 contextPatch.selectedMasterId = parsedArgs.masterId;
//               }
//               if (Array.isArray(parsedArgs?.serviceIds)) {
//                 contextPatch.selectedServiceIds = parsedArgs.serviceIds.filter(
//                   (s): s is string => typeof s === 'string',
//                 );
//               }
//               if (typeof parsedArgs?.dateISO === 'string') {
//                 contextPatch.lastDateISO = parsedArgs.dateISO;
//                 contextPatch.lastSuggestedDateOptions = undefined;
//               }
//               if (
//                 parsedArgs?.preferredTime === 'morning' ||
//                 parsedArgs?.preferredTime === 'afternoon' ||
//                 parsedArgs?.preferredTime === 'evening' ||
//                 parsedArgs?.preferredTime === 'any'
//               ) {
//                 contextPatch.lastPreferredTime = parsedArgs.preferredTime;
//               }

//               if (typeof payload.count === 'number') {
//                 contextPatch.lastNoSlots = payload.count === 0;
//                 if (payload.count > 0) {
//                   contextPatch.lastSuggestedDateOptions = undefined;
//                 }
//               }
//             } catch {
//               // Ignore malformed payload
//             }
//           }

//           if (result.name === 'reserve_slot') {
//             try {
//               const payload = JSON.parse(result.result) as {
//                 success?: boolean;
//                 error?: string;
//               };

//               if (typeof parsedArgs?.masterId === 'string') {
//                 contextPatch.selectedMasterId = parsedArgs.masterId;
//               }

//               if (
//                 payload.success &&
//                 typeof parsedArgs?.startAt === 'string' &&
//                 typeof parsedArgs?.endAt === 'string'
//               ) {
//                 contextPatch.reservedSlot = {
//                   startAt: parsedArgs.startAt,
//                   endAt: parsedArgs.endAt,
//                 };
//                 contextPatch.lastNoSlots = false;
//                 reservedSlotJustCreated = true;
//               }

//               if (
//                 payload.error === 'SLOT_TAKEN' &&
//                 typeof parsedArgs?.startAt === 'string' &&
//                 typeof parsedArgs?.endAt === 'string'
//               ) {
//                 slotTakenInBatch = true;
//                 slotTakenDateISO = parsedArgs.startAt.slice(0, 10);
//                 slotTakenMasterId =
//                   typeof parsedArgs.masterId === 'string'
//                     ? parsedArgs.masterId
//                     : slotTakenMasterId;
//                 const sameAsCurrentReservation =
//                   session.context.reservedSlot?.startAt === parsedArgs.startAt &&
//                   session.context.reservedSlot?.endAt === parsedArgs.endAt;

//                 if (!sameAsCurrentReservation) {
//                   contextPatch.reservedSlot = undefined;
//                 }
//                 contextPatch.draftId = undefined;
//                 contextPatch.awaitingVerificationMethod = false;
//                 contextPatch.awaitingRegistrationMethod = false;
//                 contextPatch.pendingVerificationMethod = undefined;
//               }
//             } catch {
//               // Ignore malformed payload
//             }
//           }

//           if (result.name === 'search_availability_month') {
//             try {
//               const payload = JSON.parse(result.result) as {
//                 days?: Record<string, number>;
//               };

//               if (typeof parsedArgs?.masterId === 'string') {
//                 contextPatch.selectedMasterId = parsedArgs.masterId;
//               }
//               if (Array.isArray(parsedArgs?.serviceIds)) {
//                 contextPatch.selectedServiceIds = parsedArgs.serviceIds.filter(
//                   (s): s is string => typeof s === 'string',
//                 );
//               }

//               const optionsMap = mapMonthDaysToOptions(payload.days, session.locale);
//               contextPatch.lastNoSlots = optionsMap.length === 0;
//               contextPatch.lastSuggestedDateOptions = optionsMap;
//             } catch {
//               // Ignore malformed payload
//             }
//           }

//           if (result.name === 'start_verification') {
//             try {
//               const payload = JSON.parse(result.result) as {
//                 ok?: boolean;
//               };

//               const draftIdArg =
//                 typeof parsedArgs?.draftId === 'string' ? parsedArgs.draftId : undefined;
//               const contactArg =
//                 typeof parsedArgs?.contact === 'string' ? parsedArgs.contact : undefined;

//               explicitStartVerificationCalls.push({
//                 draftId: draftIdArg,
//                 contact: contactArg,
//                 ok: Boolean(payload.ok),
//               });

//               if (payload.ok && draftIdArg && !contextPatch.draftId) {
//                 contextPatch.draftId = draftIdArg;
//               }
//               if (payload.ok) {
//                 otpSentDuringSession = true;
//               }
//             } catch {
//               explicitStartVerificationCalls.push({ ok: false });
//             }
//           }

//           if (result.name === 'create_draft') {
//             try {
//               const payload = JSON.parse(result.result) as {
//                 draftId?: string;
//                 error?: string;
//               };

//               if (slotTakenInBatch) {
//                 if (payload.draftId && !payload.error) {
//                   await prisma.bookingDraft
//                     .delete({ where: { id: payload.draftId } })
//                     .catch(() => {
//                       /* ignore cleanup errors */
//                     });
//                 }
//                 continue;
//               }

//               if (payload.draftId && !payload.error) {
//                 contextPatch.draftId = payload.draftId;
//                 contextPatch.awaitingRegistrationMethod = false;
//                 if (
//                   typeof parsedArgs?.startAt === 'string' &&
//                   typeof parsedArgs?.endAt === 'string'
//                 ) {
//                   contextPatch.reservedSlot = {
//                     startAt: parsedArgs.startAt,
//                     endAt: parsedArgs.endAt,
//                   };
//                 }
//                 autoVerificationCandidate = { draftId: payload.draftId };
//               }
//             } catch {
//               // Ignore malformed payload
//             }
//           }

//           if (result.name === 'complete_booking') {
//             try {
//               const payload = JSON.parse(result.result) as {
//                 ok?: boolean;
//                 error?: string;
//                 appointmentId?: string;
//               };

//               if (payload.ok) {
//                 bookingCompletedInBatch = true;
//                 bookingCompletedDuringSession = true;
//                 completedAppointmentId =
//                   typeof payload.appointmentId === 'string'
//                     ? payload.appointmentId
//                     : completedAppointmentId;
//                 otpSentDuringSession = false;
//                 contextPatch.selectedServiceIds = undefined;
//                 contextPatch.selectedMasterId = undefined;
//                 contextPatch.draftId = undefined;
//                 contextPatch.reservedSlot = undefined;
//                 contextPatch.lastDateISO = undefined;
//                 contextPatch.lastPreferredTime = undefined;
//                 contextPatch.lastSuggestedDateOptions = undefined;
//                 contextPatch.lastNoSlots = false;
//                 contextPatch.awaitingVerificationMethod = false;
//                 contextPatch.awaitingRegistrationMethod = false;
//                 contextPatch.pendingVerificationMethod = undefined;
//               }

//               if (payload.error === 'SLOT_TAKEN') {
//                 slotTakenInBatch = true;
//                 slotTakenMasterId = session.context.selectedMasterId ?? slotTakenMasterId;
//                 slotTakenDateISO =
//                   session.context.reservedSlot?.startAt?.slice(0, 10) ??
//                   session.context.lastDateISO ??
//                   slotTakenDateISO;

//                 const staleDraftId =
//                   typeof parsedArgs?.draftId === 'string' ? parsedArgs.draftId : undefined;
//                 if (staleDraftId) {
//                   await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
//                     /* ignore cleanup errors */
//                   });
//                 }

//                 contextPatch.draftId = undefined;
//                 contextPatch.reservedSlot = undefined;
//                 contextPatch.awaitingVerificationMethod = false;
//                 contextPatch.awaitingRegistrationMethod = false;
//                 contextPatch.pendingVerificationMethod = undefined;
//               }
//             } catch {
//               // Ignore malformed payload
//             }
//           }

//           messages.push({
//             role: 'tool',
//             tool_call_id: result.id,
//             content: result.result,
//           });
//           let toolOk = true;
//           let toolErrorCode: string | undefined;
//           let toolErrorMessageSafe: string | undefined;
//           try {
//             const parsedToolResult = JSON.parse(result.result) as {
//               error?: string;
//               code?: string;
//               message?: string;
//             };
//             if (parsedToolResult?.error) {
//               toolOk = false;
//               toolErrorCode =
//                 parsedToolResult.code ||
//                 parsedToolResult.error.slice(0, 64);
//               toolErrorMessageSafe =
//                 parsedToolResult.message ||
//                 parsedToolResult.error.slice(0, 512);
//             }
//           } catch {
//             // Keep defaults when tool result is not JSON.
//           }

//           turn.addToolRun({
//             toolName: result.name,
//             step: mapToolNameToProgressStep(result.name),
//             durationMs: result.durationMs,
//             ok: toolOk,
//             errorCode: toolErrorCode,
//             errorMessageSafe: toolErrorMessageSafe,
//             startedAt: new Date(Date.now() - result.durationMs),
//           });

//           toolCallLog.push({ name: result.name, durationMs: result.durationMs });
//           collectedToolResults.push({ name: result.name, result: result.result });
//         }

//         if (Object.keys(contextPatch).length > 0) {
//           upsertSession(sessionId, {
//             previousResponseId: bookingCompletedInBatch ? null : undefined,
//             context: contextPatch,
//           });
//         }

//         if (slotTakenInBatch) {
//           const staleDraftId =
//             typeof contextPatch.draftId === 'string'
//               ? contextPatch.draftId
//               : typeof session.context.draftId === 'string'
//                 ? session.context.draftId
//                 : undefined;
//           if (staleDraftId) {
//             await prisma.bookingDraft.delete({ where: { id: staleDraftId } }).catch(() => {
//               /* ignore cleanup errors */
//             });
//           }

//           const masterIdForRecovery =
//             slotTakenMasterId ??
//             contextPatch.selectedMasterId ??
//             session.context.selectedMasterId;
//           const dateISOForRecovery =
//             slotTakenDateISO ??
//             session.context.lastDateISO ??
//             todayISO();
//           const serviceIdsForRecovery =
//             contextPatch.selectedServiceIds ??
//             session.context.selectedServiceIds ??
//             [];

//           let text: string;
//           if (masterIdForRecovery && serviceIdsForRecovery.length > 0) {
//             const availability = await searchAvailability({
//               masterId: masterIdForRecovery,
//               dateISO: dateISOForRecovery,
//               serviceIds: serviceIdsForRecovery,
//               preferredTime: 'any',
//             });

//             text = buildSlotTakenAlternativesText(
//               session.locale,
//               dateISOForRecovery,
//               availability.slots ?? [],
//             );
//           } else {
//             text = buildSlotTakenAlternativesText(
//               session.locale,
//               dateISOForRecovery,
//               [],
//             );
//           }

//           appendSessionMessage(sessionId, 'assistant', text);
//           upsertSession(sessionId, {
//             context: {
//               draftId: undefined,
//               reservedSlot: undefined,
//               awaitingVerificationMethod: false,
//               awaitingRegistrationMethod: false,
//               pendingVerificationMethod: undefined,
//             },
//           });

//           console.log(
//             `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=slot-taken-recovery date=${dateISOForRecovery}`,
//           );

//           return NextResponse.json({
//             text,
//             sessionId,
//             toolCalls: toolCallLog,
//             inputMode: 'text',
//           });
//         }

//         const hasDraftAfterTools = Object.prototype.hasOwnProperty.call(contextPatch, 'draftId')
//           ? Boolean(contextPatch.draftId)
//           : Boolean(session.context.draftId);
//         const pendingMethodAfterTools = Object.prototype.hasOwnProperty.call(
//           contextPatch,
//           'pendingVerificationMethod',
//         )
//           ? contextPatch.pendingVerificationMethod
//           : session.context.pendingVerificationMethod;

//         // After successful slot reserve, show registration method chooser only
//         // when method is not selected yet.
//         if (reservedSlotJustCreated && !hasDraftAfterTools && !pendingMethodAfterTools) {
//           const text = buildRegistrationMethodChoiceText(session.locale, {
//             voiceMode: isVoiceTurn,
//           });
//           appendSessionMessage(sessionId, 'assistant', text);
//           upsertSession(sessionId, {
//             context: {
//               awaitingRegistrationMethod: true,
//               pendingVerificationMethod: undefined,
//               awaitingVerificationMethod: false,
//             },
//           });

//           console.log(
//             `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=registration-method-choice-after-reserve`,
//           );

//           return NextResponse.json({
//             text,
//             sessionId,
//             toolCalls: toolCallLog,
//           });
//         }

//         const matchedExplicitStart = autoVerificationCandidate
//           ? explicitStartVerificationCalls.some(
//               (call) => call.ok && call.draftId === autoVerificationCandidate?.draftId,
//             )
//           : false;

//         if (autoVerificationCandidate && (!hasExplicitStartVerification || !matchedExplicitStart)) {
//           const draftForChoice = await prisma.bookingDraft.findUnique({
//             where: { id: autoVerificationCandidate.draftId },
//             select: { email: true, phone: true },
//           });

//           const selectedMethod = session.context.pendingVerificationMethod;

//           if (
//             selectedMethod &&
//             selectedMethod !== 'google_oauth' &&
//             (selectedMethod === 'email_otp' ||
//               selectedMethod === 'sms_otp' ||
//               selectedMethod === 'telegram_otp')
//           ) {
//             const contact = getContactForMethod(
//               selectedMethod,
//               draftForChoice?.email,
//               draftForChoice?.phone,
//             );

//             if (!contact) {
//               const text = buildMissingContactForMethodText(session.locale, selectedMethod);
//               appendSessionMessage(sessionId, 'assistant', text);

//               return NextResponse.json({
//                 text,
//                 sessionId,
//                 toolCalls: toolCallLog,
//               });
//             }

//             const startedAt = Date.now();
//             const verifyRes = await startVerification({
//               method: selectedMethod,
//               draftId: autoVerificationCandidate.draftId,
//               contact,
//             });
//             const durationMs = Date.now() - startedAt;

//             const text = buildVerificationAutoText(session.locale, {
//               ok: Boolean(verifyRes?.ok),
//               contactMasked:
//                 typeof verifyRes === 'object' && verifyRes && 'contactMasked' in verifyRes
//                   ? (verifyRes.contactMasked as string | undefined)
//                   : undefined,
//               error:
//                 typeof verifyRes === 'object' && verifyRes && 'error' in verifyRes
//                   ? String(verifyRes.error ?? '')
//                   : undefined,
//             });

//             appendSessionMessage(sessionId, 'assistant', text);
//             upsertSession(sessionId, {
//               context: {
//                 awaitingVerificationMethod: false,
//                 pendingVerificationMethod: verifyRes?.ok ? undefined : selectedMethod,
//               },
//             });

//             console.log(
//               `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=verification-start-selected method=${selectedMethod} ok=${Boolean(verifyRes?.ok)}`,
//             );

//             return NextResponse.json({
//               text,
//               sessionId,
//               toolCalls: [...toolCallLog, { name: 'start_verification', durationMs }],
//               inputMode: verifyRes?.ok ? 'otp' : undefined,
//             });
//           }

//           // Fallback: method not selected yet -> present choice after draft creation.
//           const text = buildVerificationMethodChoiceText(session.locale, {
//             hasEmail: Boolean(draftForChoice?.email),
//             hasPhone: Boolean(draftForChoice?.phone),
//             voiceMode: isVoiceTurn,
//           });

//           appendSessionMessage(sessionId, 'assistant', text);
//           upsertSession(sessionId, {
//             context: {
//               awaitingVerificationMethod: true,
//             },
//           });

//           console.log(
//             `[AI Chat] session=${sessionId.slice(0, 8)}... fastpath=verification-method-choice email=${Boolean(draftForChoice?.email)} phone=${Boolean(draftForChoice?.phone)}`,
//           );

//           return NextResponse.json({
//             text,
//             sessionId,
//             toolCalls: toolCallLog,
//           });
//         }

//         // Call model again with tool results
//         if (loopTimeout.isExpired()) {
//           console.warn(
//             `[AI Chat] session=${sessionId.slice(0, 8)}... loop timeout after ${iterations} iterations`,
//           );
//           break;
//         }

//         if (useSSE && sse) {
//           streamResult = await withRetry(
//             () =>
//               streamingGptCall(
//                 client,
//                 {
//                   model: MODEL,
//                   messages,
//                   tools,
//                   tool_choice: 'auto',
//                   temperature: TEMPERATURE,
//                   max_tokens: 1024,
//                 },
//                 sse,
//               ),
//             {
//               onRetry: (attempt, classified) => {
//                 console.warn(
//                   `[AI Chat SSE] session=${sessionId.slice(0, 8)}... GPT retry #${attempt} (iter=${iterations}) reason=${classified.category}`,
//                 );
//               },
//               signal: loopTimeout.signal,
//             },
//           );
//           response = null;
//         } else {
//           response = await withRetry(
//             () =>
//               client.chat.completions.create({
//                 model: MODEL,
//                 messages,
//                 tools,
//                 tool_choice: 'auto',
//                 temperature: TEMPERATURE,
//                 max_tokens: 1024,
//               }),
//             {
//               onRetry: (attempt, classified) => {
//                 console.warn(
//                   `[AI Chat] session=${sessionId.slice(0, 8)}... GPT retry #${attempt} (iter=${iterations}) reason=${classified.category}`,
//                 );
//               },
//               signal: loopTimeout.signal,
//             },
//           );
//         }

//         iterations++;
//         continue;
//       }

//       // Model returned a text response — we're done
//       break;
//     }
//     turnIterations = iterations;

//     // Extract final text
//     let text = '';
//     if (useSSE) {
//       text =
//         typeof streamResult?.content === 'string' ? streamResult.content.trim() : '';
//     } else {
//       const finalMessage = response?.choices[0]?.message;
//       text =
//         typeof finalMessage?.content === 'string'
//           ? finalMessage.content.trim()
//           : '';
//     }

//     // If model ended without text (e.g. too many tool iterations), force a final textual reply.
//     if (!text) {
//       try {
//         if (useSSE && sse) {
//           const forced = await withRetry(
//             () =>
//               streamingGptCall(
//                 client,
//                 {
//                   model: MODEL,
//                   messages,
//                   tools,
//                   tool_choice: 'none',
//                   temperature: TEMPERATURE,
//                   max_tokens: 512,
//                 },
//                 sse,
//               ),
//             {
//               maxRetries: 1,
//               onRetry: (attempt, classified) => {
//                 console.warn(
//                   `[AI Chat SSE] session=${sessionId.slice(0, 8)}... forced-reply retry #${attempt} reason=${classified.category}`,
//                 );
//               },
//               signal: loopTimeout.signal,
//             },
//           );
//           streamResult = forced;
//           text =
//             typeof forced.content === 'string' ? forced.content.trim() : '';
//         } else {
//           const forced = await withRetry(
//             () =>
//               client.chat.completions.create({
//                 model: MODEL,
//                 messages,
//                 tools,
//                 tool_choice: 'none',
//                 temperature: TEMPERATURE,
//                 max_tokens: 512,
//               }),
//             {
//               maxRetries: 1,
//               onRetry: (attempt, classified) => {
//                 console.warn(
//                   `[AI Chat] session=${sessionId.slice(0, 8)}... forced-reply retry #${attempt} reason=${classified.category}`,
//                 );
//               },
//               signal: loopTimeout.signal,
//             },
//           );
//           const finalMessage = forced.choices[0]?.message;
//           text =
//             typeof finalMessage?.content === 'string'
//               ? finalMessage.content.trim()
//               : '';
//         }
//       } catch (forceError) {
//         console.warn('[AI Chat] Forced final response failed:', forceError);
//       }
//     }

//     if (!text) {
//       text = fallbackTextByLocale(session.locale);
//       if (useSSE && sse) {
//         sse.sendDelta(text);
//       }
//     }

//     const assistantMessageId = `assistant-${Date.now()}`;
//     appendSessionMessage(sessionId, 'assistant', text);

//     if (missingServiceSignals.length > 0) {
//       const currentSession = getSession(sessionId);
//       const reported = new Set(currentSession?.context.reportedMissingQueries ?? []);

//       const uniqueSignals = missingServiceSignals.filter((signal) => {
//         const key = signal.query.trim().toLowerCase();
//         if (!key || reported.has(key)) return false;
//         reported.add(key);
//         return true;
//       });

//       for (const signal of uniqueSignals) {
//         const latest = getSession(sessionId);
//         await reportMissingServiceInquiry({
//           sessionId,
//           locale: session.locale,
//           query: signal.query,
//           transcript: latest?.context.chatHistory ?? [],
//           alternatives: signal.suggestedAlternatives,
//         });
//       }

//       upsertSession(sessionId, {
//         context: {
//           reportedMissingQueries: Array.from(reported),
//         },
//       });
//     }

//     // Update session
//     upsertSession(sessionId, {});

//     console.log(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... history=${historyMessages.length} tools=${toolCallLog.length} iterations=${iterations}`,
//     );

//     const finalInputMode = bookingCompletedDuringSession
//       ? 'text'
//       : otpSentDuringSession
//         ? 'otp'
//         : undefined;

//     trackMetrics({
//       isGptCall: true,
//       isStreaming: useSSE,
//       toolCalls: toolCallLog,
//       bookingCompleted: bookingCompletedDuringSession,
//       appointmentId: bookingCompletedDuringSession
//         ? (completedAppointmentId ?? getSession(sessionId)?.context.draftId ?? session.context.draftId)
//         : undefined,
//     });

//     if (useSSE && sse) {
//       sse.sendMeta({
//         inputMode: finalInputMode,
//         sessionId,
//         messageId: assistantMessageId,
//         toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
//       });
//       return new NextResponse(sse.stream, {
//         headers: SSE_HEADERS,
//       }) as unknown as NextResponse<ChatResponse | { error: string }>;
//     }

//     return NextResponse.json({
//       text,
//       sessionId,
//       toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
//       inputMode: finalInputMode,
//     });
//   } catch (error) {
//     const classified = classifyError(error);

//     console.error(
//       `[AI Chat] session=${sessionId.slice(0, 8)}... GPT error category=${classified.category} retryable=${classified.retryable}`,
//       error instanceof Error ? error.message : error,
//     );

//     trackMetrics({
//       isGptCall: true,
//       isStreaming: useSSE,
//       toolCalls: toolCallLog,
//       error: true,
//       retried: true,
//     });
//     turnRetried = true;

//     const fallbackText = buildToolFallbackText(collectedToolResults, session.locale);
//     if (fallbackText) {
//       turnOutcome = 'degraded';
//       console.log(
//         `[AI Chat] session=${sessionId.slice(0, 8)}... using tool-based fallback response`,
//       );
//       appendSessionMessage(sessionId, 'assistant', fallbackText);

//       if (useSSE && sse) {
//         sse.sendDelta(fallbackText);
//         sse.sendMeta({
//           sessionId,
//           degraded: true,
//           toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
//         });
//         return new NextResponse(sse.stream, {
//           headers: SSE_HEADERS,
//         }) as unknown as NextResponse<ChatResponse | { error: string }>;
//       }

//       return NextResponse.json({
//         text: fallbackText,
//         sessionId,
//         toolCalls: toolCallLog.length > 0 ? toolCallLog : undefined,
//       });
//     }

//     const userErrorText = buildErrorText(classified, session.locale);
//     const httpStatus = classified.category === 'rate_limit' ? 429 : 500;
//     turnOutcome = classified.category === 'timeout' ? 'timeout' : 'error';
//     turnErrorCategory = classified.category;
//     turnErrorCode = classified.category;
//     turnErrorMessageSafe =
//       classified.original instanceof Error
//         ? classified.original.message
//         : userErrorText;

//     if (useSSE && sse) {
//       sse.sendError(userErrorText);
//       return new NextResponse(sse.stream, {
//         headers: SSE_HEADERS,
//       }) as unknown as NextResponse<ChatResponse | { error: string }>;
//     }

//     return NextResponse.json(
//       {
//         error: userErrorText,
//         category: classified.category,
//         retryable: classified.retryable,
//       },
//       { status: httpStatus },
//     );
//   } finally {
//     loopTimeout.clear();
//   }
//   } finally {
//     if (!analyticsTracked) {
//       trackMetrics({
//         isFastPath: true,
//       });
//     }
//     try {
//       const latestSession = getSession(sessionId);
//       const latestContext = latestSession?.context ?? session.context;
//       const chatHistory = latestContext.chatHistory ?? [];
//       const lastAssistantMessage = [...chatHistory]
//         .reverse()
//         .find((entry) => entry.role === 'assistant')?.content;

//       if (turnUsedGpt) {
//         turn.setGptCall(turnIterations).setResponseMode(turnResponseMode);
//       } else {
//         turn.setFastPath('fast-path');
//       }

//       if (turnRetried) {
//         turn.setRetried();
//       }

//       if (turnOutcome === 'degraded') {
//         turn.setDegraded();
//       } else if (turnOutcome === 'timeout') {
//         turn.setTimeout();
//       } else if (turnOutcome === 'error') {
//         turn.setError(turnErrorCategory, turnErrorCode, turnErrorMessageSafe);
//       }

//       if (lastAssistantMessage) {
//         turn.setAssistantMessage(lastAssistantMessage);
//       }

//       turn.setFunnelStage(detectFunnelStage(latestContext)).save();
//     } catch (turnSaveError) {
//       console.error(
//         `[AI Turn] session=${sessionId.slice(0, 8)}... save failed`,
//         turnSaveError,
//       );
//     }
//   }
// }
