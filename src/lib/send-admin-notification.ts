// src/lib/send-admin-notification.ts
// Универсальная функция для отправки уведомлений администратору

import { ORG_TZ } from "@/lib/orgTime";
import { parseTelegramAdminChatIds } from "@/lib/telegram-admin-chat-ids";
import type { AppointmentStatus } from "@/lib/prisma-client";

interface AppointmentData {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  serviceName: string;
  masterName: string;
  masterId: string | null;
  startAt: Date;
  endAt: Date;
  paymentStatus: string;
}

interface MissingServiceNotificationData {
  sessionId: string;
  locale: string;
  query: string;
  bookingLogId?: string;
  alternatives?: Array<{
    title: string;
    groupTitle?: string | null;
    durationMin?: number | null;
    priceCents?: number | null;
  }>;
  transcript?: Array<{
    role: 'user' | 'assistant';
    content: string;
    at?: string;
  }>;
}

interface AppointmentStatusNotificationData {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  serviceName: string;
  masterName: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  previousStatus: AppointmentStatus | null;
  changedBy?: string | null;
}

interface AppointmentRescheduledNotificationData {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  serviceName: string;
  masterName: string;
  oldStartAt: Date;
  oldEndAt: Date;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  changedBy?: string | null;
}

interface TelegramInlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

export const APPOINTMENT_STATUS_ACTION_PREFIX = "appt_status";
export const APPOINTMENT_RESCHEDULE_ACTION_PREFIX = "appt_reschedule";

function escapeMarkdown(value: string): string {
  return value.replace(/([_*[\]()~`>#+=|{}.!\\-])/g, '\\$1');
}

function formatAdminDateTime(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ORG_TZ,
  }).format(date);
}

function formatAdminTime(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ORG_TZ,
  }).format(date);
}

function buildStatusCallbackData(
  appointmentId: string,
  status: AppointmentStatus,
): string {
  return `${APPOINTMENT_STATUS_ACTION_PREFIX}:${appointmentId}:${status}`;
}

function buildAppointmentStatusKeyboard(
  appointmentId: string,
  currentStatus?: AppointmentStatus,
): TelegramInlineKeyboardMarkup {
  const statusButtons: Array<{ status: AppointmentStatus; text: string }> = [
    { status: "CONFIRMED", text: "✅ Подтвердить" },
    { status: "DONE", text: "🎉 Выполнена" },
    { status: "CANCELED", text: "❌ Отменить" },
    { status: "PENDING", text: "🔔 В ожидание" },
  ];

  const rows: TelegramInlineKeyboardButton[][] = [];
  const buttons = statusButtons
    .filter(({ status }) => status !== currentStatus)
    .map(({ status, text }) => ({
      text,
      callback_data: buildStatusCallbackData(appointmentId, status),
    }));

  for (let index = 0; index < buttons.length; index += 2) {
    rows.push(buttons.slice(index, index + 2));
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://permanent-halle.de";
  rows.push([
    {
      text: "📅 Перенести",
      callback_data: `${APPOINTMENT_RESCHEDULE_ACTION_PREFIX}:${appointmentId}`,
    },
  ]);

  rows.push([
    {
      text: "📊 Открыть в админке",
      url: `${baseUrl}/admin/bookings?period=thisYear&by=visit#appointment-${encodeURIComponent(appointmentId)}`,
    },
  ]);

  return { inline_keyboard: rows };
}

async function sendTelegramAdminMarkdownMessage(
  message: string,
  replyMarkup?: TelegramInlineKeyboardMarkup,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatIds = parseTelegramAdminChatIds();

  if (!token) {
    console.warn('[Admin Notification] TELEGRAM_BOT_TOKEN not configured - skipping notification');
    return;
  }

  if (adminChatIds.length === 0) {
    console.warn('[Admin Notification] TELEGRAM_ADMIN_CHAT_ID not configured - skipping notification');
    return;
  }

  console.log(
    `[Admin Notification] Sending Telegram notification to ${adminChatIds.length} admin(s): ${adminChatIds.join(', ')}`
  );

  const results = await Promise.allSettled(
    adminChatIds.map(async (chatId) => {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
          }),
        },
      );

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        description?: string;
      } | null;

      if (!response.ok || !result?.ok) {
        throw new Error(
          `[Admin Notification] Failed for ${chatId}: ${result?.description ?? response.statusText}`,
        );
      }
    }),
  );

  const failedResults = results.filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  failedResults.forEach((result) => {
    console.error('[Admin Notification] Failed to send:', result.reason);
  });

  if (failedResults.length === adminChatIds.length) {
    throw new Error('Failed to send Telegram admin notification to all configured chat IDs');
  }
}

/**
 * Отправляет уведомление администратору о новой записи через Telegram
 */
export async function sendAdminNotification(appointment: AppointmentData): Promise<void> {
  try {
    console.log('[Admin Notification] Sending booking notification');

    // Форматируем дату и время
    const dateStr = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: ORG_TZ,
    }).format(appointment.startAt);

    const startTime = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: ORG_TZ,
    }).format(appointment.startAt);

    const endTime = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: ORG_TZ,
    }).format(appointment.endAt);

    // Эмодзи статуса оплаты
    const paymentEmoji = appointment.paymentStatus === 'PAID' ? '✅' : 
                        appointment.paymentStatus === 'PENDING' ? '⏳' : 
                        appointment.paymentStatus === 'FAILED' ? '❌' : '❓';

    const paymentText = appointment.paymentStatus === 'PAID' ? 'Оплачено' :
                       appointment.paymentStatus === 'PENDING' ? 'Ожидает оплаты' :
                       appointment.paymentStatus === 'FAILED' ? 'Ошибка оплаты' : 'Неизвестно';

    // Формируем сообщение
    const message = `🎉 *НОВАЯ ОНЛАЙН ЗАЯВКА*

━━━━━━━━━━━━━━━━━━━━━

👤 *Клиент:* ${appointment.customerName}
📞 *Телефон:* ${appointment.phone}
${appointment.email ? `📧 *Email:* ${appointment.email}\n` : ''}
✂️ *Услуга:* ${appointment.serviceName}
👩‍💼 *Мастер:* ${appointment.masterName}

📅 *Дата:* ${dateStr}
🕐 *Время:* ${startTime} - ${endTime}

💳 *Оплата:* ${paymentEmoji} ${paymentText}

━━━━━━━━━━━━━━━━━━━━━

🆔 *ID записи:* \`${appointment.id}\``;

    await sendTelegramAdminMarkdownMessage(
      message,
      buildAppointmentStatusKeyboard(appointment.id, "PENDING"),
    );

    console.log('[Admin Notification] ✅ Sent successfully');
  } catch (error) {
    console.error('[Admin Notification] Error:', error);
    // Не бросаем ошибку - уведомление не должно блокировать создание записи
  }
}

export async function sendAdminAppointmentStatusNotification(
  appointment: AppointmentStatusNotificationData,
): Promise<void> {
  try {
    const statusText: Record<AppointmentStatus, string> = {
      PENDING: 'Ожидает подтверждения',
      CONFIRMED: 'Подтверждена',
      DONE: 'Выполнена',
      CANCELED: 'Отменена',
    };

    const statusIcon: Record<AppointmentStatus, string> = {
      PENDING: '🔔',
      CONFIRMED: '✅',
      DONE: '🎉',
      CANCELED: '❌',
    };

    const dateStr = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: ORG_TZ,
    }).format(appointment.startAt);

    const startTime = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: ORG_TZ,
    }).format(appointment.startAt);

    const endTime = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: ORG_TZ,
    }).format(appointment.endAt);

    const previousStatusText = appointment.previousStatus
      ? statusText[appointment.previousStatus]
      : 'Не указан';
    const newStatusText = statusText[appointment.status];

    const message = [
      `${statusIcon[appointment.status]} *СТАТУС ЗАПИСИ ИЗМЕНЕН*`,
      '',
      '━━━━━━━━━━━━━━━━━━━━━',
      '',
      `📌 *Статус:* ${escapeMarkdown(previousStatusText)} → *${escapeMarkdown(newStatusText)}*`,
      appointment.changedBy ? `👤 *Изменил:* ${escapeMarkdown(appointment.changedBy)}` : '',
      '',
      `👥 *Клиент:* ${escapeMarkdown(appointment.customerName)}`,
      `📞 *Телефон:* ${escapeMarkdown(appointment.phone)}`,
      appointment.email ? `📧 *Email:* ${escapeMarkdown(appointment.email)}` : '',
      `✂️ *Услуга:* ${escapeMarkdown(appointment.serviceName)}`,
      `👩‍💼 *Мастер:* ${escapeMarkdown(appointment.masterName)}`,
      '',
      `📅 *Дата:* ${escapeMarkdown(dateStr)}`,
      `🕐 *Время:* ${escapeMarkdown(startTime)} - ${escapeMarkdown(endTime)}`,
      '',
      '━━━━━━━━━━━━━━━━━━━━━',
      '',
      `🆔 *ID записи:* \`${escapeMarkdown(appointment.id)}\``,
    ]
      .filter(Boolean)
      .join('\n');

    await sendTelegramAdminMarkdownMessage(
      message,
      buildAppointmentStatusKeyboard(appointment.id, appointment.status),
    );

    console.log('[Admin Notification] Status-change notification sent');
  } catch (error) {
    console.error('[Admin Notification] Status-change notification failed:', error);
  }
}

export async function sendAdminAppointmentRescheduledNotification(
  appointment: AppointmentRescheduledNotificationData,
): Promise<void> {
  try {
    const oldDateTime = formatAdminDateTime(appointment.oldStartAt);
    const newDateTime = formatAdminDateTime(appointment.startAt);
    const oldTime = formatAdminTime(appointment.oldEndAt);
    const newTime = formatAdminTime(appointment.endAt);

    const message = [
      '📅 *ЗАПИСЬ ПЕРЕНЕСЕНА*',
      '',
      '━━━━━━━━━━━━━━━━━━━━━',
      '',
      `🕘 *Было:* ${escapeMarkdown(oldDateTime)} - ${escapeMarkdown(oldTime)}`,
      `🕐 *Стало:* *${escapeMarkdown(newDateTime)} - ${escapeMarkdown(newTime)}*`,
      appointment.changedBy ? `👤 *Изменил:* ${escapeMarkdown(appointment.changedBy)}` : '',
      '',
      `👥 *Клиент:* ${escapeMarkdown(appointment.customerName)}`,
      `📞 *Телефон:* ${escapeMarkdown(appointment.phone)}`,
      appointment.email ? `📧 *Email:* ${escapeMarkdown(appointment.email)}` : '',
      `✂️ *Услуга:* ${escapeMarkdown(appointment.serviceName)}`,
      `👩‍💼 *Мастер:* ${escapeMarkdown(appointment.masterName)}`,
      `📌 *Статус:* ${escapeMarkdown(appointment.status)}`,
      '',
      '━━━━━━━━━━━━━━━━━━━━━',
      '',
      `🆔 *ID записи:* \`${escapeMarkdown(appointment.id)}\``,
    ]
      .filter(Boolean)
      .join('\n');

    await sendTelegramAdminMarkdownMessage(
      message,
      buildAppointmentStatusKeyboard(appointment.id, appointment.status),
    );

    console.log('[Admin Notification] Reschedule notification sent');
  } catch (error) {
    console.error('[Admin Notification] Reschedule notification failed:', error);
  }
}

export async function sendAdminMissingServiceNotification(
  data: MissingServiceNotificationData,
): Promise<void> {
  try {
    const query = escapeMarkdown(data.query || 'unknown');
    const locale = escapeMarkdown(data.locale || 'de');
    const sessionId = escapeMarkdown(data.sessionId);

    const alternatives = (data.alternatives ?? [])
      .slice(0, 8)
      .map((item) => {
        const title = escapeMarkdown(item.title);
        const group = item.groupTitle ? ` (${escapeMarkdown(item.groupTitle)})` : '';
        const duration =
          typeof item.durationMin === 'number' ? `, ${item.durationMin} min` : '';
        const price =
          typeof item.priceCents === 'number'
            ? `, ${(item.priceCents / 100).toFixed(2)} EUR`
            : '';
        return `• ${title}${group}${duration}${price}`;
      });

    const transcriptLines = (data.transcript ?? [])
      .slice(-8)
      .map((m) => {
        const prefix = m.role === 'user' ? 'Client' : 'AI';
        const text = escapeMarkdown(m.content.replace(/\s+/g, ' ').slice(0, 300));
        return `- ${prefix}: ${text}`;
      });

    const message = [
      '🚨 *AI: Клиент не нашёл услугу*',
      '',
      `🔎 Запрос: ${query}`,
      `🌐 Язык: ${locale}`,
      `🧩 Сессия: \`${sessionId}\``,
      data.bookingLogId ? `🗂 Лог ID: \`${escapeMarkdown(data.bookingLogId)}\`` : '',
      '',
      'Возможные альтернативы:',
      ...(alternatives.length > 0 ? alternatives : ['• Нет предложенных альтернатив']),
      '',
      'Последние сообщения:',
      ...(transcriptLines.length > 0 ? transcriptLines : ['- Нет данных']),
    ]
      .filter(Boolean)
      .join('\n');

    await sendTelegramAdminMarkdownMessage(message);
    console.log('[Admin Notification] ✅ Missing-service notification sent');
  } catch (error) {
    console.error('[Admin Notification] Missing-service notification failed:', error);
  }
}





// // src/lib/send-admin-notification.ts
// // Универсальная функция для отправки уведомлений администратору

// interface AppointmentData {
//   id: string;
//   customerName: string;
//   phone: string;
//   email: string | null;
//   serviceName: string;
//   masterName: string;
//   masterId: string | null;
//   startAt: Date;
//   endAt: Date;
//   paymentStatus: string;
// }

// /**
//  * Отправляет уведомление администратору о новой записи через Telegram
//  */
// export async function sendAdminNotification(appointment: AppointmentData): Promise<void> {
//   try {
//     const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    
//     if (!adminChatId) {
//       console.warn('[Admin Notification] TELEGRAM_ADMIN_CHAT_ID not configured - skipping notification');
//       return;
//     }

//     console.log('[Admin Notification] Sending to admin:', adminChatId);

//     // Форматируем дату и время
//     const dateStr = new Intl.DateTimeFormat('ru-RU', {
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric',
//     }).format(appointment.startAt);

//     const startTime = new Intl.DateTimeFormat('ru-RU', {
//       hour: '2-digit',
//       minute: '2-digit',
//     }).format(appointment.startAt);

//     const endTime = new Intl.DateTimeFormat('ru-RU', {
//       hour: '2-digit',
//       minute: '2-digit',
//     }).format(appointment.endAt);

//     // Эмодзи статуса оплаты
//     const paymentEmoji = appointment.paymentStatus === 'PAID' ? '✅' : 
//                         appointment.paymentStatus === 'PENDING' ? '⏳' : 
//                         appointment.paymentStatus === 'FAILED' ? '❌' : '❓';

//     const paymentText = appointment.paymentStatus === 'PAID' ? 'Оплачено' :
//                        appointment.paymentStatus === 'PENDING' ? 'Ожидает оплаты' :
//                        appointment.paymentStatus === 'FAILED' ? 'Ошибка оплаты' : 'Неизвестно';

//     // Формируем сообщение
//     const message = `🎉 *НОВАЯ ОНЛАЙН ЗАЯВКА*

// ━━━━━━━━━━━━━━━━━━━━━

// 👤 *Клиент:* ${appointment.customerName}
// 📞 *Телефон:* ${appointment.phone}
// ${appointment.email ? `📧 *Email:* ${appointment.email}\n` : ''}
// ✂️ *Услуга:* ${appointment.serviceName}
// 👩‍💼 *Мастер:* ${appointment.masterName}

// 📅 *Дата:* ${dateStr}
// 🕐 *Время:* ${startTime} - ${endTime}

// 💳 *Оплата:* ${paymentEmoji} ${paymentText}

// ━━━━━━━━━━━━━━━━━━━━━

// 🆔 *ID записи:* \`${appointment.id}\``;

//     // Отправляем через webhook
//     const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/telegram/webhook`;
    
//     const response = await fetch(`${webhookUrl}?action=notify&chatId=${adminChatId}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ message }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.error('[Admin Notification] Failed to send:', errorData);
//       return;
//     }

//     console.log('[Admin Notification] ✅ Sent successfully');
//   } catch (error) {
//     console.error('[Admin Notification] Error:', error);
//     // Не бросаем ошибку - уведомление не должно блокировать создание записи
//   }
// }
