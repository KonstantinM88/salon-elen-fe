  // src/app/api/telegram/webhook/route.ts

import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { changeAppointmentStatus } from '@/lib/booking/status-change';
import {
  getAppointmentRescheduleDateOptions,
  getAppointmentRescheduleSlots,
  rescheduleAppointment,
} from '@/lib/booking/reschedule-appointment';
import {
  createAdminQuickAppointment,
  getAdminQuickBookingDateOptions,
  getAdminQuickBookingSlots,
  listAdminQuickBookingMastersForService,
  listAdminQuickBookingServices,
} from '@/lib/booking/admin-quick-appointment';
import {
  formatUpcomingAppointmentsHtmlChunks,
  getUpcomingAppointmentsReport,
  type UpcomingAppointmentsDays,
} from '@/lib/booking/upcoming-appointments-report';
import { isPhoneDigitsValid, normalizePhoneDigits } from '@/lib/phone';
import { AppointmentStatus } from '@/lib/prisma-client';
import {
  APPOINTMENT_RESCHEDULE_ACTION_PREFIX,
  APPOINTMENT_STATUS_ACTION_PREFIX,
} from '@/lib/send-admin-notification';
import { parseTelegramAdminChatIds } from '@/lib/telegram-admin-chat-ids';
import { ORG_TZ } from '@/lib/orgTime';
import {
  maskPhoneForLog,
  redactTextForLog,
  summarizeTelegramUpdateForLog,
} from '@/lib/telegram/logging';
import { sendTelegramMessage as sendTelegramApiMessage } from '@/lib/telegram/sender';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const ADMIN_QUICK_BOOKING_ACTION_PREFIX = 'qb';
const UPCOMING_APPOINTMENTS_ACTION_PREFIX = 'upcoming';
const APPOINTMENT_RESCHEDULE_DATE_ACTION_PREFIX = 'appt_rs_date';
const APPOINTMENT_RESCHEDULE_SLOT_ACTION_PREFIX = 'appt_rs_slot';
const UPCOMING_APPOINTMENT_DAYS: UpcomingAppointmentsDays[] = [7, 14, 30];

function safeCompareSecret(value: string | null, expected: string | null): boolean {
  if (!value || !expected) return false;

  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function isTelegramWebhookAuthorized(request: NextRequest): boolean {
  const expectedSecret =
    process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN ||
    process.env.TELEGRAM_WEBHOOK_SECRET ||
    null;

  if (!expectedSecret) {
    return true;
  }

  return safeCompareSecret(
    request.headers.get('x-telegram-bot-api-secret-token'),
    expectedSecret,
  );
}

function isInternalNotifyAuthorized(request: NextRequest): boolean {
  const expectedSecret = process.env.TELEGRAM_INTERNAL_NOTIFY_SECRET || null;

  if (!expectedSecret) {
    return false;
  }

  return safeCompareSecret(
    request.headers.get('x-salon-telegram-internal-secret'),
    expectedSecret,
  );
}

const formatDeepLinkPhone = (value: string): string | null => {
  const digits = normalizePhoneDigits(value);
  if (!digits) {
    return null;
  }

  let normalizedDigits = digits;
  if (digits.length === 10 && digits.startsWith('0')) {
    normalizedDigits = `38${digits}`;
  }

  if (!isPhoneDigitsValid(normalizedDigits)) {
    return null;
  }

  return `+${normalizedDigits}`;
};

  // Хранилище для связи телефон ↔ chat_id
  // В продакшене используй TelegramUser из БД!
  const pendingReschedules = new Map<
    string,
    { appointmentId: string; expiresAt: number }
  >();
  const phoneToChat = new Map<string, number>();
  type QuickBookingState = {
    serviceId?: string;
    masterId?: string;
    dateISO?: string;
    time?: string;
    expiresAt: number;
  };
  type QuickBookingServiceOption = {
    id: string;
    name: string;
    parentName: string | null;
    durationMin: number;
    priceCents: number | null;
  };
  type QuickBookingServiceCategory = {
    title: string;
    services: QuickBookingServiceOption[];
  };
  const pendingQuickBookings = new Map<string, QuickBookingState>();
  const QUICK_BOOKING_UNCATEGORIZED_KEY = '__other__';

  // Отправка сообщения в Telegram (HTML)
  type TelegramInlineKeyboardButton = {
    text: string;
    callback_data?: string;
    url?: string;
  };

  type TelegramInlineKeyboardMarkup = {
    inline_keyboard: TelegramInlineKeyboardButton[][];
  };

  async function sendTelegramMessage(
    chatId: number,
    text: string,
    replyMarkup?: TelegramInlineKeyboardMarkup,
  ) {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
        }),
      });
      
      const data = await response.json();
      
      if (!data.ok) {
        console.error('[Telegram Webhook] Send message error:', data);
        return { success: false, error: data.description };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('[Telegram Webhook] Send message failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Отправка сообщения с поддержкой Markdown
   */
  // POST - Webhook от Telegram ИЛИ отправка уведомлений
  type TelegramCallbackQuery = {
    id: string;
    from: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    message?: {
      message_id: number;
      chat: {
        id: number | string;
      };
    };
    data?: string;
  };

  const APPOINTMENT_STATUSES: AppointmentStatus[] = [
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.DONE,
    AppointmentStatus.CANCELED,
  ];

  function isAppointmentStatus(value: string): value is AppointmentStatus {
    return APPOINTMENT_STATUSES.includes(value as AppointmentStatus);
  }

  function isAdminCallback(callbackQuery: TelegramCallbackQuery): boolean {
    const adminChatIds = new Set(parseTelegramAdminChatIds());
    const fromId = String(callbackQuery.from.id);
    const chatId = callbackQuery.message?.chat.id
      ? String(callbackQuery.message.chat.id)
      : null;

    return adminChatIds.has(fromId) || (chatId ? adminChatIds.has(chatId) : false);
  }

  async function answerCallbackQuery(
    callbackQueryId: string,
    text: string,
    showAlert = false,
  ): Promise<void> {
    try {
      await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: showAlert,
        }),
      });
    } catch (error) {
      console.error('[Telegram Webhook] answerCallbackQuery failed:', error);
    }
  }

  function getCallbackActor(callbackQuery: TelegramCallbackQuery): string {
    const username = callbackQuery.from.username
      ? `@${callbackQuery.from.username}`
      : [callbackQuery.from.first_name, callbackQuery.from.last_name]
          .filter(Boolean)
          .join(' ')
          .trim();

    return username
      ? `telegram:${callbackQuery.from.id}:${username}`
      : `telegram:${callbackQuery.from.id}`;
  }

  function getMessageActor(from: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
  }): string {
    const username = from.username
      ? `@${from.username}`
      : [from.first_name, from.last_name].filter(Boolean).join(' ').trim();

    return username ? `telegram:${from.id}:${username}` : `telegram:${from.id}`;
  }

  function isAdminMessage(chatId: number | string, fromId: number): boolean {
    const adminChatIds = new Set(parseTelegramAdminChatIds());
    return adminChatIds.has(String(chatId)) || adminChatIds.has(String(fromId));
  }

  function pendingRescheduleKey(chatId: number | string, fromId: number): string {
    return `${chatId}:${fromId}`;
  }

  function parseRescheduleText(
    text: string,
  ): { dateISO: string; time: string } | null {
    const value = text.trim().replace(/\s+/g, ' ');
    const iso = value.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})$/);
    if (iso) {
      return {
        dateISO: iso[1],
        time: `${iso[2].padStart(2, '0')}:${iso[3]}`,
      };
    }

    const local = value.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2}|\d{4}))?\s+(\d{1,2}):(\d{2})$/);
    if (!local) return null;

    const now = new Date();
    const currentYear = Number(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: ORG_TZ,
        year: 'numeric',
      }).format(now),
    );
    const yearRaw = local[3];
    const year = yearRaw
      ? Number(yearRaw.length === 2 ? `20${yearRaw}` : yearRaw)
      : currentYear;
    const month = local[2].padStart(2, '0');
    const day = local[1].padStart(2, '0');

    return {
      dateISO: `${year}-${month}-${day}`,
      time: `${local[4].padStart(2, '0')}:${local[5]}`,
    };
  }

  function parseRescheduleDate(text: string): string | null {
    const value = text.trim().replace(/\s+/g, ' ');
    const iso = value.match(/^(\d{4}-\d{2}-\d{2})$/);
    if (iso) return iso[1];

    const local = value.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2}|\d{4}))?$/);
    if (!local) return null;

    const now = new Date();
    const currentYear = Number(
      new Intl.DateTimeFormat('en-CA', {
        timeZone: ORG_TZ,
        year: 'numeric',
      }).format(now),
    );
    const yearRaw = local[3];
    const year = yearRaw
      ? Number(yearRaw.length === 2 ? `20${yearRaw}` : yearRaw)
      : currentYear;
    const month = local[2].padStart(2, '0');
    const day = local[1].padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function buildRescheduleSlotKeyboard(
    appointmentId: string,
    dateISO: string,
    slots: Array<{ time: string; displayTime: string }>,
  ): TelegramInlineKeyboardMarkup {
    const buttons = slots.map((slot) => ({
      text: slot.displayTime,
      callback_data: `${APPOINTMENT_RESCHEDULE_SLOT_ACTION_PREFIX}:${appointmentId}:${dateISO}:${slot.time.replace(':', '')}`,
    }));
    const rows: TelegramInlineKeyboardButton[][] = [];

    for (let index = 0; index < buttons.length; index += 3) {
      rows.push(buttons.slice(index, index + 3));
    }

    return { inline_keyboard: rows };
  }

  function formatRescheduleDateButtonText({
    dateISO,
    slotsCount,
    firstSlotTime,
  }: {
    dateISO: string;
    slotsCount: number;
    firstSlotTime: string | null;
  }): string {
    const date = new Date(`${dateISO}T12:00:00.000Z`);
    const label = new Intl.DateTimeFormat('ru-RU', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      timeZone: ORG_TZ,
    }).format(date);
    const firstSlot = firstSlotTime ? ` с ${firstSlotTime}` : '';
    return `${label}${firstSlot} (${slotsCount})`;
  }

  function buildRescheduleDateKeyboard(
    appointmentId: string,
    dates: Array<{
      dateISO: string;
      slotsCount: number;
      firstSlotTime: string | null;
    }>,
  ): TelegramInlineKeyboardMarkup {
    const buttons = dates.map((date) => ({
      text: formatRescheduleDateButtonText(date),
      callback_data: `${APPOINTMENT_RESCHEDULE_DATE_ACTION_PREFIX}:${appointmentId}:${date.dateISO}`,
    }));
    const rows: TelegramInlineKeyboardButton[][] = [];

    for (let index = 0; index < buttons.length; index += 2) {
      rows.push(buttons.slice(index, index + 2));
    }

    return { inline_keyboard: rows };
  }

  function escapeTelegramHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function truncateButtonText(value: string, maxLength = 52): string {
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.length > maxLength
      ? `${normalized.slice(0, Math.max(0, maxLength - 3))}...`
      : normalized;
  }

  function parseUpcomingAppointmentDays(value: string | undefined): UpcomingAppointmentsDays | null {
    const days = Number(value);
    return UPCOMING_APPOINTMENT_DAYS.includes(days as UpcomingAppointmentsDays)
      ? (days as UpcomingAppointmentsDays)
      : null;
  }

  function parseUpcomingAppointmentCommand(text: string): UpcomingAppointmentsDays | null {
    const command = text.trim().split(/\s+/)[0]?.split('@')[0];
    const match = command?.match(/^\/(?:next|terms|appointments)(7|14|30)$/);
    return match ? parseUpcomingAppointmentDays(match[1]) : null;
  }

  async function sendUpcomingAppointmentsReport(
    chatId: number | string,
    days: UpcomingAppointmentsDays,
  ): Promise<void> {
    const report = await getUpcomingAppointmentsReport({ days });
    const chunks = formatUpcomingAppointmentsHtmlChunks(report);

    for (const chunk of chunks) {
      await sendTelegramMessage(Number(chatId), chunk);
    }
  }

  function buildAdminMenuKeyboard(): TelegramInlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          {
            text: '➕ Добавить новую запись',
            callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:start`,
          },
        ],
        [
          {
            text: '📅 7 дней',
            callback_data: `${UPCOMING_APPOINTMENTS_ACTION_PREFIX}:7`,
          },
          {
            text: '📅 14 дней',
            callback_data: `${UPCOMING_APPOINTMENTS_ACTION_PREFIX}:14`,
          },
          {
            text: '📅 30 дней',
            callback_data: `${UPCOMING_APPOINTMENTS_ACTION_PREFIX}:30`,
          },
        ],
      ],
    };
  }

  function quickBookingServiceTitle(service: QuickBookingServiceOption): string {
    return service.name;
  }

  function quickBookingServiceDetails(service: QuickBookingServiceOption): string {
    const details = [
      `${service.durationMin} мин`,
      typeof service.priceCents === 'number'
        ? `${(service.priceCents / 100).toFixed(0)}€`
        : null,
    ]
      .filter(Boolean)
      .join(', ');

    return details;
  }

  function buildQuickBookingServiceCategories(
    services: QuickBookingServiceOption[],
  ): QuickBookingServiceCategory[] {
    const byCategory = new Map<string, QuickBookingServiceCategory>();

    for (const service of services) {
      const parentName = service.parentName?.trim();
      const key = parentName
        ? parentName.toLocaleLowerCase('ru-RU')
        : QUICK_BOOKING_UNCATEGORIZED_KEY;
      const title = parentName || 'Другие услуги';
      const existing = byCategory.get(key);

      if (existing) {
        existing.services.push(service);
      } else {
        byCategory.set(key, {
          title,
          services: [service],
        });
      }
    }

    return Array.from(byCategory.values())
      .map((category) => ({
        ...category,
        services: [...category.services].sort((a, b) =>
          quickBookingServiceTitle(a).localeCompare(quickBookingServiceTitle(b), 'ru'),
        ),
      }))
      .sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }

  function buildQuickBookingCategoryKeyboard(
    categories: QuickBookingServiceCategory[],
  ): TelegramInlineKeyboardMarkup {
    const rows = categories.map((category, index) => [
      {
        text: truncateButtonText(`${category.title} (${category.services.length})`, 42),
        callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:cat:${index}`,
      },
    ]);

    rows.push([
      {
        text: 'Отмена',
        callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:cancel`,
      },
    ]);

    return { inline_keyboard: rows };
  }

  function buildQuickBookingServiceText(category: QuickBookingServiceCategory): string {
    const lines = category.services.map((service, index) => {
      const title = escapeTelegramHtml(quickBookingServiceTitle(service));
      const details = quickBookingServiceDetails(service);

      return details
        ? `<b>${index + 1}.</b> ${title} - ${escapeTelegramHtml(details)}`
        : `<b>${index + 1}.</b> ${title}`;
    });

    return [
      `Категория: <b>${escapeTelegramHtml(category.title)}</b>`,
      '',
      'Полный список услуг в этой категории:',
      '',
      ...lines,
      '',
      'Выберите услугу по номеру на кнопке ниже.',
    ].join('\n');
  }

  function buildQuickBookingServiceKeyboard(
    services: QuickBookingServiceOption[],
  ): TelegramInlineKeyboardMarkup {
    const buttons = services.map((service, index) => ({
      text: String(index + 1),
      callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:svc:${service.id}`,
    }));
    const rows: TelegramInlineKeyboardButton[][] = [];

    for (let index = 0; index < buttons.length; index += 4) {
      rows.push(buttons.slice(index, index + 4));
    }

    rows.push([
      {
        text: '⬅️ Категории',
        callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:cats`,
      },
    ]);
    rows.push([
      {
        text: 'Отмена',
        callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:cancel`,
      },
    ]);

    return { inline_keyboard: rows };
  }

  function buildQuickBookingMasterKeyboard(
    masters: Array<{ id: string; name: string }>,
  ): TelegramInlineKeyboardMarkup {
    const buttons = masters.map((master) => ({
      text: truncateButtonText(master.name, 40),
      callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:master:${master.id}`,
    }));
    const rows: TelegramInlineKeyboardButton[][] = [];

    for (let index = 0; index < buttons.length; index += 2) {
      rows.push(buttons.slice(index, index + 2));
    }

    rows.push([
      {
        text: 'Отмена',
        callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:cancel`,
      },
    ]);

    return { inline_keyboard: rows };
  }

  function formatQuickBookingDateButtonText({
    dateISO,
    slotsCount,
    firstSlotTime,
  }: {
    dateISO: string;
    slotsCount: number;
    firstSlotTime: string | null;
  }): string {
    const date = new Date(`${dateISO}T12:00:00.000Z`);
    const label = new Intl.DateTimeFormat('ru-RU', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      timeZone: ORG_TZ,
    }).format(date);
    const firstSlot = firstSlotTime ? ` с ${firstSlotTime}` : '';
    return `${label}${firstSlot} (${slotsCount})`;
  }

  function buildQuickBookingDateKeyboard(
    dates: Array<{
      dateISO: string;
      slotsCount: number;
      firstSlotTime: string | null;
    }>,
  ): TelegramInlineKeyboardMarkup {
    const buttons = dates.map((date) => ({
      text: formatQuickBookingDateButtonText(date),
      callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:date:${date.dateISO}`,
    }));
    const rows: TelegramInlineKeyboardButton[][] = [];

    for (let index = 0; index < buttons.length; index += 2) {
      rows.push(buttons.slice(index, index + 2));
    }

    rows.push([
      {
        text: 'Отмена',
        callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:cancel`,
      },
    ]);

    return { inline_keyboard: rows };
  }

  function buildQuickBookingSlotKeyboard(
    slots: Array<{ time: string; displayTime: string }>,
  ): TelegramInlineKeyboardMarkup {
    const buttons = slots.map((slot) => ({
      text: slot.displayTime,
      callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:slot:${slot.time.replace(':', '')}`,
    }));
    const rows: TelegramInlineKeyboardButton[][] = [];

    for (let index = 0; index < buttons.length; index += 3) {
      rows.push(buttons.slice(index, index + 3));
    }

    rows.push([
      {
        text: 'Отмена',
        callback_data: `${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:cancel`,
      },
    ]);

    return { inline_keyboard: rows };
  }

  function quickBookingErrorText(error: string): string {
    const map: Record<string, string> = {
      INVALID_INPUT: 'Некорректные данные записи',
      INVALID_PHONE: 'Некорректный номер телефона',
      SERVICE_NOT_FOUND: 'Услуга не найдена или недоступна',
      MASTER_NOT_FOUND: 'Мастер не найден',
      SLOT_TAKEN: 'Этот слот уже занят',
      UPDATE_FAILED: 'Не удалось создать запись',
    };

    return map[error] ?? 'Не удалось создать запись';
  }

  function parseQuickBookingContactText(text: string): {
    phone: string;
    customerName: string | null;
    email: string | null;
  } {
    const trimmed = text.trim();
    const emailMatch = trimmed.match(/[^\s,;<>]+@[^\s,;<>]+\.[^\s,;<>]+/i);
    const email = emailMatch?.[0].replace(/[.,;]+$/, '').toLowerCase() ?? null;
    const withoutEmail = emailMatch
      ? trimmed.replace(emailMatch[0], ' ')
      : trimmed;
    const phoneMatch = withoutEmail.match(/\+?\d[\d\s().-]{6,}\d/);
    const phone = phoneMatch
      ? phoneMatch[0].replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
      : trimmed;
    const customerName = phoneMatch
      ? withoutEmail
          .replace(phoneMatch[0], ' ')
          .replace(/[;,]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim() || null
      : null;

    return { phone, customerName, email };
  }

  async function setupAdminTelegramMenu(chatId: number | string): Promise<void> {
    try {
      await Promise.all([
        fetch(`${TELEGRAM_API_URL}/setChatMenuButton`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            menu_button: { type: 'commands' },
          }),
        }),
        fetch(`${TELEGRAM_API_URL}/setMyCommands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scope: { type: 'chat', chat_id: chatId },
            commands: [
              {
                command: 'add',
                description: 'Добавить новую запись',
              },
              {
                command: 'next7',
                description: 'Ближайшие термины на 7 дней',
              },
              {
                command: 'next14',
                description: 'Ближайшие термины на 14 дней',
              },
              {
                command: 'next30',
                description: 'Ближайшие термины на 30 дней',
              },
              {
                command: 'admin',
                description: 'Открыть админ-меню',
              },
              {
                command: 'cancel',
                description: 'Отменить текущий диалог',
              },
              {
                command: 'start',
                description: 'Начать работу с ботом',
              },
            ],
          }),
        }),
      ]);
    } catch (menuError) {
      console.error('[Telegram Webhook] Admin menu setup error:', menuError);
    }
  }

  async function sendAdminMenu(chatId: number | string): Promise<void> {
    await setupAdminTelegramMenu(chatId);
    await sendTelegramMessage(
      Number(chatId),
      [
        '<b>Админ-меню Salon Elen</b>',
        '',
        'Можно быстро создать запись клиента без входа в админку.',
        'Также можно посмотреть ближайшие термины на 7, 14 или 30 дней.',
        'Услуги, даты и слоты берутся из актуального расписания.',
        '',
        'Команды для быстрого доступа: <code>/add</code>, <code>/next7</code>, <code>/next14</code>, <code>/next30</code>.',
      ].join('\n'),
      buildAdminMenuKeyboard(),
    );
  }

  async function beginQuickBooking(
    chatId: number | string,
    fromId: number,
  ): Promise<void> {
    const services = await listAdminQuickBookingServices();
    const categories = buildQuickBookingServiceCategories(services);
    pendingQuickBookings.set(pendingRescheduleKey(chatId, fromId), {
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    if (services.length === 0) {
      await sendTelegramMessage(
        Number(chatId),
        'Нет активных услуг для записи. Проверьте прайс в админке.',
      );
      return;
    }

    await sendTelegramMessage(
      Number(chatId),
      [
        '➕ <b>Быстрая запись клиента</b>',
        '',
        'Сначала выберите категорию услуги.',
        'После этого бот покажет полный список услуг в выбранной категории.',
      ].join('\n'),
      buildQuickBookingCategoryKeyboard(categories),
    );
  }

  function getQuickBookingPending(
    chatId: number | string,
    fromId: number,
  ): { key: string; state: QuickBookingState } | null {
    const key = pendingRescheduleKey(chatId, fromId);
    const state = pendingQuickBookings.get(key);
    if (!state) return null;

    if (state.expiresAt < Date.now()) {
      pendingQuickBookings.delete(key);
      return null;
    }

    return { key, state };
  }

  async function finishQuickBookingFromState({
    chatId,
    key,
    state,
    actor,
    phone,
    customerName,
    email,
  }: {
    chatId: number | string;
    key: string;
    state: QuickBookingState;
    actor: string;
    phone: string;
    customerName: string | null;
    email: string | null;
  }): Promise<void> {
    if (!state.serviceId || !state.masterId || !state.dateISO || !state.time) {
      pendingQuickBookings.delete(key);
      await sendTelegramMessage(
        Number(chatId),
        'Данные быстрой записи устарели. Начните заново через /admin.',
      );
      return;
    }

    const result = await createAdminQuickAppointment({
      serviceId: state.serviceId,
      masterId: state.masterId,
      dateISO: state.dateISO,
      time: state.time,
      phone,
      customerName,
      email,
      changedBy: actor,
    });

    if (!result.ok) {
      await sendTelegramMessage(
        Number(chatId),
        `Не удалось создать запись: <code>${escapeTelegramHtml(quickBookingErrorText(result.error))}</code>`,
      );
      return;
    }

    pendingQuickBookings.delete(key);
    const when = new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: ORG_TZ,
    }).format(result.startAt);

    await sendTelegramMessage(
      Number(chatId),
      [
        '✅ <b>Запись создана</b>',
        '',
        `Клиент: <b>${escapeTelegramHtml(result.customerName)}</b>`,
        `Время: <code>${escapeTelegramHtml(when)}</code>`,
        `ID: <code>${escapeTelegramHtml(result.appointmentId)}</code>`,
      ].join('\n'),
    );
  }

  function rescheduleErrorText(error: string): string {
    const map: Record<string, string> = {
      NOT_FOUND: 'Запись не найдена',
      MISSING_MASTER: 'У записи не указан мастер',
      INVALID_DATE: 'Некорректная дата',
      INVALID_TIME: 'Некорректное время',
      PAST: 'Нельзя перенести запись в прошлое',
      OUTSIDE_WORKING_HOURS: 'Время вне рабочего графика мастера',
      TIME_OFF: 'В это время у мастера недоступность',
      CONFLICT: 'Это время уже занято',
      UPDATE_FAILED: 'Не удалось перенести запись',
    };

    return map[error] ?? 'Не удалось перенести запись';
  }

  async function handleAppointmentRescheduleCallback(
    callbackQuery: TelegramCallbackQuery,
  ): Promise<NextResponse> {
    const data = callbackQuery.data ?? '';
    const [prefix, appointmentId] = data.split(':');

    if (prefix !== APPOINTMENT_RESCHEDULE_ACTION_PREFIX || !appointmentId) {
      await answerCallbackQuery(callbackQuery.id, 'Неизвестное действие', true);
      return NextResponse.json({ ok: true });
    }

    if (!isAdminCallback(callbackQuery)) {
      await answerCallbackQuery(callbackQuery.id, 'Нет доступа', true);
      return NextResponse.json({ ok: true });
    }

    const chatId = callbackQuery.message?.chat.id ?? callbackQuery.from.id;
    pendingReschedules.set(
      pendingRescheduleKey(chatId, callbackQuery.from.id),
      {
        appointmentId,
        expiresAt: Date.now() + 10 * 60 * 1000,
      },
    );

    if (process.env.TELEGRAM_RESCHEDULE_DATE_BUTTONS !== 'false') {
      const datesResult = await getAppointmentRescheduleDateOptions({
        appointmentId,
        daysToScan: 45,
        limit: 12,
      });

      if (!datesResult.ok) {
        await answerCallbackQuery(
          callbackQuery.id,
          rescheduleErrorText(datesResult.error),
          true,
        );
        return NextResponse.json({ ok: true });
      }

      await answerCallbackQuery(callbackQuery.id, 'Выберите дату');

      if (datesResult.dates.length === 0) {
        await sendTelegramMessage(
          Number(chatId),
          [
            '📅 <b>Перенос записи</b>',
            '',
            'В ближайшие дни свободных дат не найдено.',
            'Можно отправить дату вручную, например <code>10.06</code>, и бот проверит слоты.',
            '',
            'Для отмены отправьте <code>/cancel</code>.',
          ].join('\n'),
        );
        return NextResponse.json({ ok: true });
      }

      await sendTelegramMessage(
        Number(chatId),
        [
          '📅 <b>Перенос записи</b>',
          '',
          'Выберите свободную дату. В скобках указано количество свободных слотов.',
          'После выбора даты бот покажет доступное время.',
          '',
          'Можно также отправить дату вручную: <code>10.06</code>.',
        ].join('\n'),
        buildRescheduleDateKeyboard(appointmentId, datesResult.dates),
      );

      return NextResponse.json({ ok: true });
    }

    await answerCallbackQuery(callbackQuery.id, 'Введите новую дату и время');
    await sendTelegramMessage(
      Number(chatId),
      [
        '📅 <b>Перенос записи</b>',
        '',
        'Ответьте сообщением с новой датой и временем:',
        '<code>29.05</code>',
        'или',
        '<code>29.05 14:30</code>',
        'или',
        '<code>2026-05-29 14:30</code>',
        '',
        'Для отмены отправьте <code>/cancel</code>.',
      ].join('\n'),
    );

    return NextResponse.json({ ok: true });
  }

  async function handlePendingRescheduleMessage({
    chatId,
    text,
    from,
  }: {
    chatId: number | string;
    text: string;
    from: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  }): Promise<boolean> {
    if (!isAdminMessage(chatId, from.id)) return false;

    const key = pendingRescheduleKey(chatId, from.id);
    const pending = pendingReschedules.get(key);
    if (!pending) return false;

    if (pending.expiresAt < Date.now()) {
      pendingReschedules.delete(key);
      await sendTelegramMessage(Number(chatId), '⏱ Время ожидания истекло. Нажмите «Перенести» еще раз.');
      return true;
    }

    if (text.trim() === '/cancel') {
      pendingReschedules.delete(key);
      await sendTelegramMessage(Number(chatId), 'Перенос отменен.');
      return true;
    }

    const parsed = parseRescheduleText(text);
    if (!parsed) {
      const dateISO = parseRescheduleDate(text);
      if (dateISO) {
        const slotsResult = await getAppointmentRescheduleSlots({
          appointmentId: pending.appointmentId,
          dateISO,
          limit: 42,
        });

        if (!slotsResult.ok) {
          await sendTelegramMessage(
            Number(chatId),
            `Не удалось загрузить свободные слоты: <code>${rescheduleErrorText(slotsResult.error)}</code>`,
          );
          return true;
        }

        if (slotsResult.slots.length === 0) {
          await sendTelegramMessage(
            Number(chatId),
            'На эту дату нет свободных слотов. Отправьте другую дату.',
          );
          return true;
        }

        await sendTelegramMessage(
          Number(chatId),
          `Свободные слоты на <code>${dateISO}</code>:`,
          buildRescheduleSlotKeyboard(
            pending.appointmentId,
            dateISO,
            slotsResult.slots,
          ),
        );
        return true;
      }

      await sendTelegramMessage(
        Number(chatId),
        'Не удалось распознать дату и время. Пример: <code>29.05 14:30</code>',
      );
      return true;
    }

    const result = await rescheduleAppointment({
      appointmentId: pending.appointmentId,
      dateISO: parsed.dateISO,
      time: parsed.time,
      changedBy: getMessageActor(from),
      reason: `Rescheduled from Telegram bot to ${parsed.dateISO} ${parsed.time}`,
    });

    if (!result.ok) {
      await sendTelegramMessage(
        Number(chatId),
        `Не удалось перенести запись: <code>${result.error}</code>`,
      );
      return true;
    }

    pendingReschedules.delete(key);
    await sendTelegramMessage(
      Number(chatId),
      `✅ Запись перенесена на <code>${parsed.dateISO} ${parsed.time}</code>.`,
    );
    return true;
  }

  async function handleAppointmentRescheduleDateCallback(
    callbackQuery: TelegramCallbackQuery,
  ): Promise<NextResponse> {
    const data = callbackQuery.data ?? '';
    const [prefix, appointmentId, dateISO] = data.split(':');

    if (
      prefix !== APPOINTMENT_RESCHEDULE_DATE_ACTION_PREFIX ||
      !appointmentId ||
      !dateISO
    ) {
      await answerCallbackQuery(callbackQuery.id, 'Некорректная дата', true);
      return NextResponse.json({ ok: true });
    }

    if (!isAdminCallback(callbackQuery)) {
      await answerCallbackQuery(callbackQuery.id, 'Нет доступа', true);
      return NextResponse.json({ ok: true });
    }

    const slotsResult = await getAppointmentRescheduleSlots({
      appointmentId,
      dateISO,
      limit: 42,
    });

    if (!slotsResult.ok) {
      await answerCallbackQuery(
        callbackQuery.id,
        rescheduleErrorText(slotsResult.error),
        true,
      );
      return NextResponse.json({ ok: true });
    }

    const chatId = callbackQuery.message?.chat.id ?? callbackQuery.from.id;
    pendingReschedules.set(
      pendingRescheduleKey(chatId, callbackQuery.from.id),
      {
        appointmentId,
        expiresAt: Date.now() + 10 * 60 * 1000,
      },
    );

    await answerCallbackQuery(callbackQuery.id, 'Выберите время');

    if (slotsResult.slots.length === 0) {
      await sendTelegramMessage(
        Number(chatId),
        'На эту дату нет свободных слотов. Выберите другую дату или отправьте дату вручную.',
      );
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(
      Number(chatId),
      `Свободные слоты на <code>${dateISO}</code>:`,
      buildRescheduleSlotKeyboard(appointmentId, dateISO, slotsResult.slots),
    );

    return NextResponse.json({ ok: true });
  }

  async function handleAppointmentRescheduleSlotCallback(
    callbackQuery: TelegramCallbackQuery,
  ): Promise<NextResponse> {
    const data = callbackQuery.data ?? '';
    const [prefix, appointmentId, dateISO, rawTime] = data.split(':');
    const time =
      rawTime && /^\d{4}$/.test(rawTime)
        ? `${rawTime.slice(0, 2)}:${rawTime.slice(2)}`
        : null;

    if (
      prefix !== APPOINTMENT_RESCHEDULE_SLOT_ACTION_PREFIX ||
      !appointmentId ||
      !dateISO ||
      !time
    ) {
      await answerCallbackQuery(callbackQuery.id, 'Некорректный слот', true);
      return NextResponse.json({ ok: true });
    }

    if (!isAdminCallback(callbackQuery)) {
      await answerCallbackQuery(callbackQuery.id, 'РќРµС‚ РґРѕСЃС‚СѓРїР°', true);
      return NextResponse.json({ ok: true });
    }

    const result = await rescheduleAppointment({
      appointmentId,
      dateISO,
      time,
      changedBy: getCallbackActor(callbackQuery),
      reason: `Rescheduled from Telegram bot slot button to ${dateISO} ${time}`,
    });

    if (!result.ok) {
      await answerCallbackQuery(
        callbackQuery.id,
        rescheduleErrorText(result.error),
        true,
      );
      return NextResponse.json({ ok: true });
    }

    const chatId = callbackQuery.message?.chat.id ?? callbackQuery.from.id;
    pendingReschedules.delete(
      pendingRescheduleKey(chatId, callbackQuery.from.id),
    );

    await answerCallbackQuery(callbackQuery.id, 'Запись перенесена');
    await sendTelegramMessage(
      Number(chatId),
      `✅ Запись перенесена на <code>${dateISO} ${time}</code>.`,
    );

    return NextResponse.json({ ok: true });
  }

  async function handleUpcomingAppointmentsCallback(
    callbackQuery: TelegramCallbackQuery,
  ): Promise<NextResponse> {
    const data = callbackQuery.data ?? '';
    const [prefix, rawDays] = data.split(':');
    const days = parseUpcomingAppointmentDays(rawDays);

    if (prefix !== UPCOMING_APPOINTMENTS_ACTION_PREFIX || !days) {
      await answerCallbackQuery(callbackQuery.id, 'Некорректный период', true);
      return NextResponse.json({ ok: true });
    }

    if (!isAdminCallback(callbackQuery)) {
      await answerCallbackQuery(callbackQuery.id, 'Нет доступа', true);
      return NextResponse.json({ ok: true });
    }

    const chatId = callbackQuery.message?.chat.id ?? callbackQuery.from.id;
    await answerCallbackQuery(callbackQuery.id, `Показываю термины на ${days} дней`);
    await sendUpcomingAppointmentsReport(chatId, days);

    return NextResponse.json({ ok: true });
  }

  async function handleQuickBookingCallback(
    callbackQuery: TelegramCallbackQuery,
  ): Promise<NextResponse> {
    const data = callbackQuery.data ?? '';
    const parts = data.split(':');
    const action = parts[1];

    if (parts[0] !== ADMIN_QUICK_BOOKING_ACTION_PREFIX || !action) {
      await answerCallbackQuery(callbackQuery.id, 'Неизвестное действие', true);
      return NextResponse.json({ ok: true });
    }

    if (!isAdminCallback(callbackQuery)) {
      await answerCallbackQuery(callbackQuery.id, 'Нет доступа', true);
      return NextResponse.json({ ok: true });
    }

    const chatId = callbackQuery.message?.chat.id ?? callbackQuery.from.id;
    const key = pendingRescheduleKey(chatId, callbackQuery.from.id);
    const expiresAt = Date.now() + 15 * 60 * 1000;

    if (action === 'cancel') {
      pendingQuickBookings.delete(key);
      await answerCallbackQuery(callbackQuery.id, 'Быстрая запись отменена');
      await sendTelegramMessage(Number(chatId), 'Быстрая запись отменена.');
      return NextResponse.json({ ok: true });
    }

    if (action === 'start') {
      await answerCallbackQuery(callbackQuery.id, 'Выберите категорию');
      await beginQuickBooking(chatId, callbackQuery.from.id);
      return NextResponse.json({ ok: true });
    }

    const pending = getQuickBookingPending(chatId, callbackQuery.from.id);
    if (!pending) {
      await answerCallbackQuery(callbackQuery.id, 'Сессия устарела', true);
      await sendTelegramMessage(
        Number(chatId),
        'Время ожидания истекло. Начните заново через /admin.',
      );
      return NextResponse.json({ ok: true });
    }

    if (action === 'cats') {
      const services = await listAdminQuickBookingServices();
      const categories = buildQuickBookingServiceCategories(services);
      pendingQuickBookings.set(key, { expiresAt });

      await answerCallbackQuery(callbackQuery.id, 'Выберите категорию');

      if (categories.length === 0) {
        await sendTelegramMessage(
          Number(chatId),
          'Нет активных услуг для записи. Проверьте прайс в админке.',
        );
        return NextResponse.json({ ok: true });
      }

      await sendTelegramMessage(
        Number(chatId),
        [
          '➕ <b>Быстрая запись клиента</b>',
          '',
          'Выберите категорию услуги.',
        ].join('\n'),
        buildQuickBookingCategoryKeyboard(categories),
      );
      return NextResponse.json({ ok: true });
    }

    if (action === 'cat') {
      const rawCategoryIndex = parts[2];
      if (!rawCategoryIndex || !/^\d+$/.test(rawCategoryIndex)) {
        await answerCallbackQuery(callbackQuery.id, 'Категория не выбрана', true);
        return NextResponse.json({ ok: true });
      }
      const categoryIndex = Number(rawCategoryIndex);

      const services = await listAdminQuickBookingServices();
      const categories = buildQuickBookingServiceCategories(services);
      const category = categories[categoryIndex];

      if (!category) {
        await answerCallbackQuery(callbackQuery.id, 'Категория устарела', true);
        await sendTelegramMessage(
          Number(chatId),
          'Список услуг изменился. Выберите категорию заново.',
          buildQuickBookingCategoryKeyboard(categories),
        );
        return NextResponse.json({ ok: true });
      }

      pendingQuickBookings.set(key, { expiresAt });
      await answerCallbackQuery(callbackQuery.id, 'Выберите услугу');
      await sendTelegramMessage(
        Number(chatId),
        buildQuickBookingServiceText(category),
        buildQuickBookingServiceKeyboard(category.services),
      );
      return NextResponse.json({ ok: true });
    }

    if (action === 'svc') {
      const serviceId = parts[2];
      if (!serviceId) {
        await answerCallbackQuery(callbackQuery.id, 'Услуга не выбрана', true);
        return NextResponse.json({ ok: true });
      }

      const masters = await listAdminQuickBookingMastersForService(serviceId);
      pendingQuickBookings.set(key, { serviceId, expiresAt });
      await answerCallbackQuery(callbackQuery.id, 'Выберите мастера');

      if (masters.length === 0) {
        const services = await listAdminQuickBookingServices();
        const categories = buildQuickBookingServiceCategories(services);
        await sendTelegramMessage(
          Number(chatId),
          'Для этой услуги нет доступных мастеров. Выберите другую услугу.',
          buildQuickBookingCategoryKeyboard(categories),
        );
        return NextResponse.json({ ok: true });
      }

      await sendTelegramMessage(
        Number(chatId),
        'Выберите мастера для записи:',
        buildQuickBookingMasterKeyboard(masters),
      );
      return NextResponse.json({ ok: true });
    }

    if (action === 'master') {
      const masterId = parts[2];
      if (!masterId || !pending.state.serviceId) {
        await answerCallbackQuery(callbackQuery.id, 'Мастер не выбран', true);
        return NextResponse.json({ ok: true });
      }

      const nextState = {
        serviceId: pending.state.serviceId,
        masterId,
        expiresAt,
      };
      pendingQuickBookings.set(key, nextState);
      const dates = await getAdminQuickBookingDateOptions({
        serviceId: nextState.serviceId,
        masterId,
        daysToScan: 45,
        limit: 12,
      });

      await answerCallbackQuery(callbackQuery.id, 'Выберите дату');

      if (dates.length === 0) {
        await sendTelegramMessage(
          Number(chatId),
          'В ближайшие 45 дней нет свободных дат для этой услуги и мастера.',
        );
        return NextResponse.json({ ok: true });
      }

      await sendTelegramMessage(
        Number(chatId),
        [
          'Выберите свободную дату.',
          'В скобках указано количество доступных слотов.',
        ].join('\n'),
        buildQuickBookingDateKeyboard(dates),
      );
      return NextResponse.json({ ok: true });
    }

    if (action === 'date') {
      const dateISO = parts[2];
      if (!dateISO || !pending.state.serviceId || !pending.state.masterId) {
        await answerCallbackQuery(callbackQuery.id, 'Дата не выбрана', true);
        return NextResponse.json({ ok: true });
      }

      const nextState = {
        ...pending.state,
        dateISO,
        expiresAt,
      };
      pendingQuickBookings.set(key, nextState);
      const slots = await getAdminQuickBookingSlots({
        serviceId: pending.state.serviceId,
        masterId: pending.state.masterId,
        dateISO,
        limit: 42,
      });

      await answerCallbackQuery(callbackQuery.id, 'Выберите время');

      if (slots.length === 0) {
        await sendTelegramMessage(
          Number(chatId),
          'На эту дату нет свободных слотов. Выберите другую дату.',
        );
        return NextResponse.json({ ok: true });
      }

      await sendTelegramMessage(
        Number(chatId),
        `Свободные слоты на <code>${escapeTelegramHtml(dateISO)}</code>:`,
        buildQuickBookingSlotKeyboard(slots),
      );
      return NextResponse.json({ ok: true });
    }

    if (action === 'slot') {
      const rawTime = parts[2];
      const time =
        rawTime && /^\d{4}$/.test(rawTime)
          ? `${rawTime.slice(0, 2)}:${rawTime.slice(2)}`
          : null;

      if (!time || !pending.state.serviceId || !pending.state.masterId || !pending.state.dateISO) {
        await answerCallbackQuery(callbackQuery.id, 'Слот не выбран', true);
        return NextResponse.json({ ok: true });
      }

      pendingQuickBookings.set(key, {
        ...pending.state,
        time,
        expiresAt,
      });
      await answerCallbackQuery(callbackQuery.id, 'Введите телефон клиента');
      await sendTelegramMessage(
        Number(chatId),
        [
          `Выбран слот: <code>${escapeTelegramHtml(pending.state.dateISO)} ${escapeTelegramHtml(time)}</code>`,
          '',
          'Введите телефон клиента.',
          'Можно сразу добавить имя и email через запятую:',
          '<code>+4917612345678, Anna, anna@mail.com</code>',
          '',
          'Если у вас есть только номер, отправьте только номер. Клиент получит SMS.',
          'Для отмены отправьте <code>/cancel</code>.',
        ].join('\n'),
      );
      return NextResponse.json({ ok: true });
    }

    await answerCallbackQuery(callbackQuery.id, 'Неизвестное действие', true);
    return NextResponse.json({ ok: true });
  }

  async function handlePendingQuickBookingMessage({
    chatId,
    text,
    from,
  }: {
    chatId: number | string;
    text: string;
    from: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  }): Promise<boolean> {
    if (!isAdminMessage(chatId, from.id)) return false;

    const pending = getQuickBookingPending(chatId, from.id);
    if (!pending) return false;

    if (text.trim() === '/cancel') {
      pendingQuickBookings.delete(pending.key);
      await sendTelegramMessage(Number(chatId), 'Быстрая запись отменена.');
      return true;
    }

    if (
      !pending.state.serviceId ||
      !pending.state.masterId ||
      !pending.state.dateISO ||
      !pending.state.time
    ) {
      await sendTelegramMessage(
        Number(chatId),
        'Продолжите выбор записи кнопками или отправьте /cancel.',
      );
      return true;
    }

    const contact = parseQuickBookingContactText(text);
    await finishQuickBookingFromState({
      chatId,
      key: pending.key,
      state: pending.state,
      actor: getMessageActor(from),
      phone: contact.phone,
      customerName: contact.customerName,
      email: contact.email,
    });
    return true;
  }

  async function handleAppointmentStatusCallback(
    callbackQuery: TelegramCallbackQuery,
  ): Promise<NextResponse> {
    const data = callbackQuery.data ?? '';
    const [prefix, appointmentId, requestedStatus] = data.split(':');

    if (prefix !== APPOINTMENT_STATUS_ACTION_PREFIX || !appointmentId) {
      await answerCallbackQuery(callbackQuery.id, 'Неизвестное действие', true);
      return NextResponse.json({ ok: true });
    }

    if (!isAdminCallback(callbackQuery)) {
      await answerCallbackQuery(callbackQuery.id, 'Нет доступа', true);
      console.warn('[Telegram Webhook] Unauthorized admin callback:', {
        fromId: callbackQuery.from.id,
        chatId: callbackQuery.message?.chat.id,
        data,
      });
      return NextResponse.json({ ok: true });
    }

    if (!requestedStatus || !isAppointmentStatus(requestedStatus)) {
      await answerCallbackQuery(callbackQuery.id, 'Некорректный статус', true);
      return NextResponse.json({ ok: true });
    }

    const result = await changeAppointmentStatus({
      appointmentId,
      status: requestedStatus,
      changedBy: getCallbackActor(callbackQuery),
      reason: `Status changed from Telegram bot to ${requestedStatus}`,
    });

    if (!result.ok) {
      await answerCallbackQuery(
        callbackQuery.id,
        result.error === 'NOT_FOUND'
          ? 'Запись не найдена'
          : 'Не удалось изменить статус',
        true,
      );
      return NextResponse.json({ ok: true });
    }

    if (!result.changed) {
      await answerCallbackQuery(callbackQuery.id, 'Статус уже установлен');
      return NextResponse.json({ ok: true });
    }

    await answerCallbackQuery(
      callbackQuery.id,
      `Статус изменен: ${result.previousStatus} → ${result.status}`,
    );

    console.log('[Telegram Webhook] Admin changed appointment status:', {
      appointmentId,
      previousStatus: result.previousStatus,
      status: result.status,
      changedBy: getCallbackActor(callbackQuery),
    });

    return NextResponse.json({ ok: true });
  }

  export async function POST(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const action = url.searchParams.get('action');
      
      // ✅ НОВОЕ: Если это запрос на отправку уведомления администратору
      if (action === 'notify') {
        if (!isInternalNotifyAuthorized(request)) {
          console.warn('[Telegram Webhook] Rejected unauthorized internal notify request');
          return NextResponse.json(
            { error: 'Unauthorized internal notify request' },
            { status: 403 },
          );
        }

        const chatIdParam = url.searchParams.get('chatId');
        const body = await request.json();
        const message = body.message;
        const adminChatIds = parseTelegramAdminChatIds(chatIdParam);
        
        if (adminChatIds.length === 0 || typeof message !== 'string' || !message.trim()) {
          return NextResponse.json(
            { error: 'Missing chatId or message' },
            { status: 400 }
          );
        }
        
        console.log('[Telegram Webhook] Sending notification to:', adminChatIds.join(', '));

        const results = await Promise.all(
          adminChatIds.map((chatId) =>
            sendTelegramApiMessage({
              chatId,
              text: message,
              parseMode: 'Markdown',
            }),
          ),
        );

        const failedDetails = results.flatMap((result) => {
          if (!result.ok) {
            return [result.description ?? 'Unknown Telegram send error'];
          }

          return [];
        });

        if (failedDetails.length > 0) {
          return NextResponse.json(
            {
              error: 'Failed to send message',
              details: failedDetails,
            },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ success: true, sentTo: adminChatIds.length });
      }
      
      // ✅ Иначе это обычный webhook от Telegram
      if (!isTelegramWebhookAuthorized(request)) {
        console.warn('[Telegram Webhook] Rejected request with invalid Telegram secret token');
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }

      const update = await request.json();
      
      console.log('[Telegram Webhook] Update received:', summarizeTelegramUpdateForLog(update));
      
      // Получить сообщение
      if (update.callback_query) {
        const callbackData = String(update.callback_query.data ?? '');
        if (callbackData.startsWith(`${ADMIN_QUICK_BOOKING_ACTION_PREFIX}:`)) {
          return handleQuickBookingCallback(
            update.callback_query as TelegramCallbackQuery,
          );
        }

        if (callbackData.startsWith(`${UPCOMING_APPOINTMENTS_ACTION_PREFIX}:`)) {
          return handleUpcomingAppointmentsCallback(
            update.callback_query as TelegramCallbackQuery,
          );
        }

        if (callbackData.startsWith(`${APPOINTMENT_RESCHEDULE_DATE_ACTION_PREFIX}:`)) {
          return handleAppointmentRescheduleDateCallback(
            update.callback_query as TelegramCallbackQuery,
          );
        }

        if (callbackData.startsWith(`${APPOINTMENT_RESCHEDULE_SLOT_ACTION_PREFIX}:`)) {
          return handleAppointmentRescheduleSlotCallback(
            update.callback_query as TelegramCallbackQuery,
          );
        }

        if (callbackData.startsWith(`${APPOINTMENT_RESCHEDULE_ACTION_PREFIX}:`)) {
          return handleAppointmentRescheduleCallback(
            update.callback_query as TelegramCallbackQuery,
          );
        }

        return handleAppointmentStatusCallback(
          update.callback_query as TelegramCallbackQuery,
        );
      }

      const message = update.message;
      if (!message) {
        return NextResponse.json({ ok: true });
      }
      
      const chatId = message.chat.id;
      const text = message.text;
      const from = message.from;
      
      console.log('[Telegram Webhook] Message:', {
        chatId,
        text: redactTextForLog(text),
        from: from.username,
      });
      
      // Команда /start
      if (
        typeof text === 'string' &&
        (await handlePendingRescheduleMessage({ chatId, text, from }))
      ) {
        return NextResponse.json({ ok: true });
      }

      if (
        typeof text === 'string' &&
        (await handlePendingQuickBookingMessage({ chatId, text, from }))
      ) {
        return NextResponse.json({ ok: true });
      }

      if (
        typeof text === 'string' &&
        isAdminMessage(chatId, from.id) &&
        (text === '/add' ||
          text === '/new' ||
          text === '/quick' ||
          text === '/create')
      ) {
        await beginQuickBooking(chatId, from.id);
        return NextResponse.json({ ok: true });
      }

      if (typeof text === 'string' && isAdminMessage(chatId, from.id)) {
        const upcomingDays = parseUpcomingAppointmentCommand(text);
        if (upcomingDays) {
          await sendUpcomingAppointmentsReport(chatId, upcomingDays);
          return NextResponse.json({ ok: true });
        }
      }

      if (
        typeof text === 'string' &&
        isAdminMessage(chatId, from.id) &&
        (text === '/admin' || text === '/menu' || text === '/start')
      ) {
        await sendAdminMenu(chatId);
        return NextResponse.json({ ok: true });
      }

      if (text === '/start' || text?.startsWith('/start ')) {
        const firstName = from.first_name || 'Guest';
        
        // Проверить параметр start (deep link)
        const startParam = text.split(' ')[1]; // Например: phone_380679014039
        
        if (startParam && startParam.startsWith('phone_')) {
          // Извлечь номер телефона
          const phoneFromParam = formatDeepLinkPhone(
            startParam.replace('phone_', '')
          );
          
          console.log('[Telegram Webhook] Deep link registration:', maskPhoneForLog(phoneFromParam));
          
          // Валидация номера
          const phoneRegex = /^\+\d{10,15}$/;
          if (phoneFromParam && phoneRegex.test(phoneFromParam)) {
            // Автоматически зарегистрировать номер
            try {
              await prisma.telegramUser.upsert({
                where: { phone: phoneFromParam },
                update: { 
                  telegramChatId: BigInt(chatId),
                  telegramUserId: BigInt(from.id),
                  firstName: from.first_name,
                  lastName: from.last_name,
                  username: from.username,
                  updatedAt: new Date(),
                },
                create: {
                  id: `tg-${chatId}`,
                  // Email не создаётся - он optional и будет добавлен при complete-registration
                  phone: phoneFromParam,
                  telegramUserId: BigInt(from.id),
                  telegramChatId: BigInt(chatId),
                  firstName: from.first_name,
                  lastName: from.last_name,
                  username: from.username,
                },
              });
              
              console.log('[Telegram Webhook] Auto-registered from deep link:', maskPhoneForLog(phoneFromParam));
              
              // Отправить подтверждение
              await sendTelegramMessage(chatId, `
  👋 <b>Привет, ${firstName}!</b>

  ✅ <b>Регистрация завершена!</b>

  Твой номер телефона <code>${phoneFromParam}</code> успешно сохранён.

  🎉 Теперь ты будешь получать коды подтверждения здесь!

  📝 <b>Что дальше?</b>
  • Вернись на сайт
  • Нажми "Я зарегистрировался"
  • Код подтверждения придёт сюда автоматически ✨
              `);
              
              return NextResponse.json({ ok: true });
            } catch (dbError) {
              console.error('[Telegram Webhook] Auto-registration error:', dbError);
            }
          }
        }
        
        // Обычное приветствие
        await sendTelegramMessage(chatId, `
  👋 <b>Привет, ${firstName}!</b>

  Я бот для записи в салон <b>Elen</b>.

  📱 <b>Чтобы получать коды подтверждения:</b>
  1. Отправь мне свой номер телефона
  2. Формат: <code>+380679014039</code>

  💡 <b>Chat ID:</b> <code>${chatId}</code>
        `);
        
        // Установить кнопку Menu
        try {
          await fetch(`${TELEGRAM_API_URL}/setChatMenuButton`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              menu_button: {
                type: 'commands'
              }
            }),
          });
          
          // Установить команды
          await fetch(`${TELEGRAM_API_URL}/setMyCommands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              commands: [
                {
                  command: 'start',
                  description: 'Начать работу с ботом'
                },
                {
                  command: 'help',
                  description: 'Помощь'
                }
              ]
            }),
          });
        } catch (menuError) {
          console.error('[Telegram Webhook] Menu button error:', menuError);
        }
        
        return NextResponse.json({ ok: true });
      }
      
      // Получение телефона от пользователя
      const phoneRegex = /^\+\d{10,15}$/;
      if (phoneRegex.test(text)) {
        // Сохранить в памяти (в продакшене - в БД через TelegramUser)
        
        // Сохранить в БД (опционально, но рекомендуется)
        try {
          await prisma.telegramUser.upsert({
            where: { phone: text },
            update: { 
              telegramChatId: BigInt(chatId),
              telegramUserId: BigInt(from.id),
              firstName: from.first_name,
              lastName: from.last_name,
              username: from.username,
              updatedAt: new Date(),
            },
            create: {
              id: `tg-${chatId}`,
              // Email не создаётся - он optional и будет добавлен при complete-registration
              phone: text,
              telegramUserId: BigInt(from.id),
              telegramChatId: BigInt(chatId),
              firstName: from.first_name,
              lastName: from.last_name,
              username: from.username,
            },
          });
          
          console.log('[Telegram Webhook] Saved to DB:', maskPhoneForLog(text), 'saved for chatId:', chatId);
        } catch (dbError) {
          console.error('[Telegram Webhook] DB save error:', dbError);
          // Продолжаем, даже если БД не сохранилась
        }
        
        await sendTelegramMessage(chatId, `
  ✅ <b>Телефон сохранён:</b> <code>${text}</code>

  🎉 Теперь ты будешь получать коды подтверждения здесь!

  📝 <b>Как это работает:</b>
  • При записи на сайте выбери "Войти через Telegram"
  • Введи свой номер телефона
  • Код придёт сюда в бот
  • Введи код на сайте и готово! ✨
        `);
        
        return NextResponse.json({ ok: true });
      }
      
      // Неизвестная команда
      await sendTelegramMessage(chatId, `
  ❓ <b>Неизвестная команда</b>

  Доступные команды:
  • <code>/start</code> - начать работу
  • Отправь номер телефона в формате: <code>+380679014039</code>
      `);
      
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error('[Telegram Webhook] Error:', error);
      return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
    }
  }

  // GET - Отправка кода (вызывается из send-code API)
  export async function GET(request: NextRequest) {
    try {
      if (!isInternalNotifyAuthorized(request)) {
        return NextResponse.json(
          { error: 'Deprecated endpoint' },
          { status: 410 },
        );
      }

      const searchParams = request.nextUrl.searchParams;
      const phone = searchParams.get('phone');
      const code = searchParams.get('code');
      
      if (!phone || !code) {
        return NextResponse.json(
          { error: 'Missing phone or code' },
          { status: 400 }
        );
      }
      
      console.log('[Telegram Webhook] Deprecated send code request:', maskPhoneForLog(phone));
      
      // Найти chat_id в памяти
      let chatId = phoneToChat.get(phone);
      
      // Если нет в памяти - попробовать найти в БД
      if (!chatId) {
        try {
          const user = await prisma.telegramUser.findUnique({
            where: { phone },
          });
          
          if (user) {
            chatId = Number(user.telegramChatId);
            phoneToChat.set(phone, chatId);  // Кэшировать
            console.log('[Telegram Webhook] Loaded from DB:', maskPhoneForLog(phone), 'saved for chatId:', chatId);
          }
        } catch (dbError) {
          console.error('[Telegram Webhook] DB lookup error:', dbError);
        }
      }
      
      if (!chatId) {
        console.log('[Telegram Webhook] Chat ID not found for:', maskPhoneForLog(phone));
        return NextResponse.json(
          { 
            error: 'Phone not registered. User must send /start and phone to bot first.',
            phone: maskPhoneForLog(phone),
          },
          { status: 404 }
        );
      }
      
      // Отправить код в Telegram
      const result = await sendTelegramMessage(chatId, `
  🔐 <b>Код подтверждения для записи:</b>

  <code>${code}</code>

  ⏰ Действителен <b>10 минут</b>

  📝 Введи этот код на сайте для завершения записи.
      `);
      
      if (!result.success) {
        return NextResponse.json(
          { error: 'Failed to send message', details: result.error },
          { status: 500 }
        );
      }
      
      console.log('[Telegram Webhook] Code sent successfully:', maskPhoneForLog(phone), 'sent to chatId:', chatId);
      
      return NextResponse.json({ 
        success: true, 
        chatId,
        message: 'Code sent to Telegram',
      });
    } catch (error) {
      console.error('[Telegram Webhook] Send code error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
