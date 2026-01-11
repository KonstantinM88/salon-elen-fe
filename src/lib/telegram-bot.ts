// src/lib/telegram-bot.ts
// ИСПРАВЛЕНО: Убраны все `any`, добавлены правильные типы

import { AppointmentStatus } from "@prisma/client";
import { ORG_TZ } from "@/lib/orgTime";
import { isPhoneDigitsValid, normalizePhoneDigits } from "@/lib/phone";

const TELEGRAM_API_URL = "https://api.telegram.org";

// ===== ТИПЫ TELEGRAM API =====

interface TelegramInlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

interface TelegramInlineKeyboardMarkup {
  inline_keyboard: TelegramInlineKeyboardButton[][];
}

interface TelegramSendMessageOptions {
  parse_mode?: "Markdown" | "HTML" | "MarkdownV2";
  reply_markup?: TelegramInlineKeyboardMarkup;
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
}

interface TelegramApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  date: number;
  text?: string;
  contact?: {
    phone_number: string;
    first_name: string;
    last_name?: string;
    user_id?: number;
  };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    message?: TelegramMessage;
    data?: string;
  };
}

// ===== ТИПЫ ДЛЯ ПРИЛОЖЕНИЯ =====

interface AppointmentData {
  id: string;
  startAt: Date;
  endAt: Date;
  customerName: string;
  phone: string;
  email?: string | null;
  paymentStatus: string;
}

interface ServiceData {
  name: string;
}

interface MasterData {
  name: string;
}

interface ClientAppointmentStatusData {
  email?: string | null;
  phone: string;
  customerName: string;
  serviceName: string;
  masterName: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
}

// ===== УТИЛИТЫ =====

/**
 * Форматирование даты для уведомлений
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ORG_TZ,
  }).format(date);
}

/**
 * Форматирование времени
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ORG_TZ,
  }).format(date);
}

/**
 * Эмодзи статуса оплаты
 */
function getPaymentStatusEmoji(status: string): string {
  switch (status) {
    case "PAID":
      return "✅";
    case "PENDING":
      return "⏳";
    case "FAILED":
      return "❌";
    case "REFUNDED":
      return "🔄";
    default:
      return "❓";
  }
}

/**
 * Текст статуса оплаты
 */
function getPaymentStatusText(status: string): string {
  switch (status) {
    case "PAID":
      return "Оплачено";
    case "PENDING":
      return "Ожидает оплаты";
    case "FAILED":
      return "Ошибка оплаты";
    case "REFUNDED":
      return "Возврат средств";
    default:
      return "Неизвестно";
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ===== ОСНОВНЫЕ ФУНКЦИИ =====

/**
 * Отправка кода верификации пользователю
 */
export async function sendTelegramCode(
  phone: string,
  code: string
): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error("[Telegram Bot] TELEGRAM_BOT_TOKEN не установлен");
      return false;
    }

    // Ищем пользователя по номеру телефона
    const { prisma } = await import("@/lib/prisma");
    const telegramUser = await prisma.telegramUser.findUnique({
      where: { phone },
    });

    if (!telegramUser) {
      console.error(
        `[Telegram Bot] Пользователь с телефоном ${phone} не найден`
      );
      return false;
    }

    const chatId = Number(telegramUser.telegramChatId);

    // Формируем сообщение
    const message = `💎 *Salon Elen - Код верификации*\n\nВаш код подтверждения:\n\n*${code}*\n\nКод действителен 10 минут.`;

    const options: TelegramSendMessageOptions = {
      parse_mode: "Markdown",
    };

    // Отправляем сообщение
    const response = await fetch(
      `${TELEGRAM_API_URL}/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          ...options,
        }),
      }
    );

    const data =
      (await response.json()) as TelegramApiResponse<TelegramMessage>;

    if (!data.ok) {
      console.error(
        "[Telegram Bot] Ошибка отправки сообщения:",
        data.description
      );
      return false;
    }

    console.log(
      `[Telegram Bot] ✅ Код ${code} отправлен пользователю ${phone} (chatId: ${chatId})`
    );
    return true;
  } catch (error) {
    console.error("[Telegram Bot] Ошибка отправки кода:", error);
    return false;
  }
}

/**
 * Уведомление администратора о новой записи
 */
export async function notifyAdminNewAppointment(
  appointment: AppointmentData,
  user: { name: string; phone: string; email?: string | null },
  service: ServiceData,
  master: MasterData
): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token) {
      console.error("[Telegram Bot] TELEGRAM_BOT_TOKEN не установлен");
      return false;
    }

    if (!adminChatId) {
      console.error("[Telegram Bot] TELEGRAM_ADMIN_CHAT_ID не установлен");
      return false;
    }

    // Форматируем дату и время
    const dateStr = formatDate(appointment.startAt);
    const timeStr = formatTime(appointment.startAt);

    // Эмодзи и текст статуса оплаты
    const paymentEmoji = getPaymentStatusEmoji(appointment.paymentStatus);
    const paymentText = getPaymentStatusText(appointment.paymentStatus);

    // Формируем сообщение
    const message =
      `🎉 *НОВАЯ ЗАПИСЬ!*\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 *Дата:* ${dateStr}\n` +
      `🕐 *Время:* ${timeStr}\n\n` +
      `👤 *Клиент:* ${user.name}\n` +
      `📱 *Телефон:* ${user.phone}\n` +
      (user.email ? `📧 *Email:* ${user.email}\n` : "") +
      `\n✨ *Услуга:* ${service.name}\n` +
      `💆‍♀️ *Мастер:* ${master.name}\n\n` +
      `💳 *Оплата:* ${paymentEmoji} ${paymentText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `🆔 *ID записи:* \`${appointment.id}\``;

    // URL для админ-панели
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://permanent-halle.de";
    const adminUrl = `${baseUrl}/admin/appointments/${appointment.id}`;

    const options: TelegramSendMessageOptions = {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📊 Открыть в админке",
              url: adminUrl,
            },
          ],
        ],
      },
    };

    // Отправляем сообщение
    const response = await fetch(
      `${TELEGRAM_API_URL}/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: message,
          ...options,
        }),
      }
    );

    const data =
      (await response.json()) as TelegramApiResponse<TelegramMessage>;

    if (!data.ok) {
      console.error(
        "[Telegram Bot] Ошибка отправки уведомления админу:",
        data.description
      );
      return false;
    }

    console.log(
      `[Telegram Bot] ✅ Уведомление о записи ${appointment.id} отправлено админу`
    );
    return true;
  } catch (error) {
    console.error("[Telegram Bot] Ошибка отправки уведомления админу:", error);
    return false;
  }
}

/**
 * Уведомление клиента о статусе записи через Telegram
 */
export async function notifyClientAppointmentStatus(
  data: ClientAppointmentStatusData
): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error("[Telegram Bot] TELEGRAM_BOT_TOKEN не установлен");
      return false;
    }

    const { prisma } = await import("@/lib/prisma");
    const emailRaw = data.email?.trim();
    const phoneRaw = data.phone.trim();

    if (!emailRaw && !phoneRaw) {
      console.warn("[Telegram Bot] Contact not provided for client notification");
      return false;
    }

    let telegramUser = null;
    let matchReason: "email" | "phone" | "suffix" | null = null;

    if (emailRaw) {
      telegramUser = await prisma.telegramUser.findFirst({
        where: {
          email: {
            equals: emailRaw,
            mode: "insensitive",
          },
        },
      });
      if (telegramUser) {
        matchReason = "email";
      }
    }

    if (!telegramUser && phoneRaw) {
      const digits = normalizePhoneDigits(phoneRaw);
      const phoneVariants = Array.from(
        new Set([phoneRaw, digits, digits ? `+${digits}` : ""])
      ).filter(Boolean);

      telegramUser = await prisma.telegramUser.findFirst({
        where: { phone: { in: phoneVariants } },
      });
      if (telegramUser) {
        matchReason = "phone";
      }

      if (!telegramUser && digits && isPhoneDigitsValid(digits)) {
        const matches = await prisma.telegramUser.findMany({
          where: { phone: { endsWith: digits } },
          take: 2,
        });

        if (matches.length === 1) {
          telegramUser = matches[0];
          matchReason = "suffix";
        } else if (matches.length > 1) {
          console.warn(
            "[Telegram Bot] Multiple users matched by phone suffix:",
            digits
          );
          return false;
        }
      }
    }

    if (!telegramUser) {
      console.warn("[Telegram Bot] Telegram user not found", {
        email: emailRaw || null,
        phone: phoneRaw || null,
      });
      return false;
    }

    const chatId = Number(telegramUser.telegramChatId);
    console.log("[Telegram Bot] Telegram user matched", {
      reason: matchReason ?? "unknown",
      email: emailRaw || null,
      phone: phoneRaw || null,
      chatId,
      telegramUserId: telegramUser.id,
    });

    const dateStr = formatDate(data.startAt);
    const startTime = formatTime(data.startAt);
    const endTime = formatTime(data.endAt);

    const statusTitle: Record<AppointmentStatus, string> = {
      PENDING: "🔔 Заявка принята",
      CONFIRMED: "✅ Запись подтверждена",
      DONE: "🎉 Спасибо за визит",
      CANCELED: "❌ Запись отменена",
    };

    const statusText: Record<AppointmentStatus, string> = {
      PENDING: "Ожидает подтверждения",
      CONFIRMED: "Подтверждена",
      DONE: "Выполнена",
      CANCELED: "Отменена",
    };

    const statusMessage: Record<AppointmentStatus, string> = {
      PENDING:
        "Мы получили вашу заявку. Администратор свяжется с вами в ближайшее время.",
      CONFIRMED: "Ждём вас! Пожалуйста, приходите за 5 минут до записи.",
      DONE: "Спасибо, что выбрали Salon Elen! Будем рады видеть вас снова.",
      CANCELED:
        "Если хотите перенести запись, пожалуйста, свяжитесь с нами.",
    };

    const message =
      `<b>${escapeHtml(statusTitle[data.status])}</b>\n\n` +
      `Здравствуйте, <b>${escapeHtml(data.customerName)}</b>!\n\n` +
      `📅 Дата: ${escapeHtml(dateStr)}\n` +
      `🕐 Время: ${escapeHtml(startTime)} - ${escapeHtml(endTime)}\n` +
      `✂️ Услуга: ${escapeHtml(data.serviceName)}\n` +
      `👩‍💼 Мастер: ${escapeHtml(data.masterName)}\n` +
      `📌 Статус: <b>${escapeHtml(statusText[data.status])}</b>\n\n` +
      `${escapeHtml(statusMessage[data.status])}`;

    const response = await fetch(
      `${TELEGRAM_API_URL}/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const result =
      (await response.json()) as TelegramApiResponse<TelegramMessage>;

    if (!result.ok) {
      console.error(
        "[Telegram Bot] Ошибка отправки сообщения клиенту:",
        result.description
      );
      return false;
    }

    console.log(
      `[Telegram Bot] ✅ Уведомление отправлено клиенту (chatId: ${chatId})`
    );
    return true;
  } catch (error) {
    console.error("[Telegram Bot] Ошибка отправки клиенту:", error);
    return false;
  }
}

/**
 * Обработка команды /start
 */
async function handleStartCommand(chatId: number): Promise<void> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error("[Telegram Bot] TELEGRAM_BOT_TOKEN не установлен");
      return;
    }

    const message =
      `👋 *Добро пожаловать в Salon Elen!*\n\n` +
      `Для использования бота отправьте ваш номер телефона, нажав кнопку ниже.\n\n` +
      `После этого вы сможете получать коды подтверждения для онлайн-записи.`;

    const options: TelegramSendMessageOptions = {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📱 Отправить номер телефона",
              callback_data: "request_contact",
            },
          ],
        ],
      },
    };

    await fetch(`${TELEGRAM_API_URL}/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        ...options,
      }),
    });

    console.log(`[Telegram Bot] /start обработан для chatId: ${chatId}`);
  } catch (error) {
    console.error("[Telegram Bot] Ошибка обработки /start:", error);
  }
}

/**
 * Обработка полученного контакта
 */
async function handleContactReceived(
  chatId: number,
  phone: string,
  firstName?: string,
  lastName?: string,
  username?: string
): Promise<void> {
  try {
    const { prisma } = await import("@/lib/prisma");

    // Проверяем существует ли пользователь
    const existingUser = await prisma.telegramUser.findUnique({
      where: { phone },
    });

    if (existingUser) {
      // Обновляем chatId если изменился
      await prisma.telegramUser.update({
        where: { phone },
        data: {
          telegramChatId: BigInt(chatId),
          username,
          firstName,
          lastName,
          updatedAt: new Date(),
        },
      });

      console.log(
        `[Telegram Bot] Обновлён пользователь ${phone} с chatId: ${chatId}`
      );
    } else {
      // Создаём нового пользователя
      await prisma.telegramUser.create({
        data: {
          id: `tg-${chatId}`,
          telegramUserId: BigInt(chatId),
          telegramChatId: BigInt(chatId),
          phone,
          username,
          firstName,
          lastName,
        },
      });

      console.log(
        `[Telegram Bot] Создан новый пользователь ${phone} с chatId: ${chatId}`
      );
    }

    // Отправляем подтверждение
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    const message = `✅ *Номер телефона сохранён!*\n\nВаш номер: ${phone}\n\nТеперь вы можете использовать Telegram для подтверждения записей на сайте.`;

    const options: TelegramSendMessageOptions = {
      parse_mode: "Markdown",
    };

    await fetch(`${TELEGRAM_API_URL}/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        ...options,
      }),
    });
  } catch (error) {
    console.error("[Telegram Bot] Ошибка сохранения контакта:", error);
  }
}

/**
 * Обработка webhook от Telegram
 */
export async function handleTelegramWebhook(
  update: TelegramUpdate
): Promise<void> {
  try {
    console.log(
      `[Telegram Bot] Получен update ${update.update_id}:`,
      JSON.stringify(update)
    );

    // Обработка обычных сообщений
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;

      // Команда /start
      if (message.text === "/start") {
        await handleStartCommand(chatId);
        return;
      }

      // Получен контакт
      if (message.contact) {
        const contact = message.contact;
        await handleContactReceived(
          chatId,
          contact.phone_number,
          contact.first_name,
          contact.last_name,
          message.from?.username
        );
        return;
      }
    }

    // Обработка callback query (inline кнопки)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.from.id;
      const data = callbackQuery.data;

      if (data === "request_contact") {
        // Отправляем запрос на контакт
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) return;

        const message = "Пожалуйста, отправьте ваш номер телефона:";

        const replyMarkup = {
          keyboard: [
            [
              {
                text: "📱 Отправить номер телефона",
                request_contact: true,
              },
            ],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        };

        await fetch(`${TELEGRAM_API_URL}/bot${token}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            reply_markup: replyMarkup,
          }),
        });

        // Отвечаем на callback query
        await fetch(`${TELEGRAM_API_URL}/bot${token}/answerCallbackQuery`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
          }),
        });
      }
    }
  } catch (error) {
    console.error("[Telegram Bot] Ошибка обработки webhook:", error);
  }
}

// // src/lib/telegram-bot.ts
// /**
//  * Telegram Bot для Salon Elen
//  *
//  * Функции:
//  * 1. Отправка кодов верификации пользователям
//  * 2. Уведомления администратору о новых записях
//  * 3. Обработка команд бота
//  */

// import { prisma } from './prisma';

// // ───────── Типы ─────────

// type AppointmentData = {
//   id: string;
//   startAt: Date;
//   endAt: Date;
//   customerName: string;
//   phone: string;
//   email: string | null;
//   paymentStatus: string;
// };

// type UserData = {
//   phone: string;
//   customerName: string;
//   email: string | null;
// };

// type ServiceData = {
//   name: string;
//   slug: string;
// };

// type MasterData = {
//   firstName: string;
//   lastName: string;
// };

// // ───────── Конфигурация ─────────

// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
// const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// // Проверка конфигурации
// if (!TELEGRAM_BOT_TOKEN) {
//   console.warn('[Telegram Bot] TELEGRAM_BOT_TOKEN not configured');
// }

// if (!TELEGRAM_ADMIN_CHAT_ID) {
//   console.warn('[Telegram Bot] TELEGRAM_ADMIN_CHAT_ID not configured for admin notifications');
// }

// // ───────── Утилиты ─────────

// /**
//  * Отправка сообщения в Telegram
//  */
// async function sendMessage(chatId: string | number, text: string, options?: {
//   parse_mode?: 'HTML' | 'Markdown';
//   reply_markup?: any;
// }): Promise<boolean> {
//   if (!TELEGRAM_BOT_TOKEN) {
//     console.error('[Telegram Bot] Cannot send message - bot token not configured');
//     return false;
//   }

//   try {
//     const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         chat_id: chatId,
//         text,
//         parse_mode: options?.parse_mode || 'HTML',
//         reply_markup: options?.reply_markup,
//       }),
//     });

//     const data = await response.json();

//     if (!data.ok) {
//       console.error('[Telegram Bot] Send message error:', data);
//       return false;
//     }

//     console.log('[Telegram Bot] Message sent successfully');
//     return true;
//   } catch (error) {
//     console.error('[Telegram Bot] Send message failed:', error);
//     return false;
//   }
// }

// /**
//  * Получение chat_id пользователя по номеру телефона
//  *
//  * Пользователь должен был ранее написать боту /start
//  */
// async function getChatIdByPhone(phone: string): Promise<string | null> {
//   try {
//     // Ищем пользователя в БД, который ранее писал боту
//     const telegramUser = await prisma.telegramUser.findFirst({
//       where: { phone },
//     });

//     return telegramUser?.chatId || null;
//   } catch (error) {
//     console.error('[Telegram Bot] Failed to get chat ID:', error);
//     return null;
//   }
// }

// // ───────── Основные функции ─────────

// /**
//  * Отправка кода верификации пользователю в Telegram
//  *
//  * @param phone - Номер телефона пользователя
//  * @param code - 6-значный код
//  */
// export async function sendTelegramCode(
//   phone: string,
//   code: string
// ): Promise<boolean> {
//   console.log('[Telegram Bot] Sending code to phone:', phone);

//   // Получаем chat_id пользователя
//   const chatId = await getChatIdByPhone(phone);

//   if (!chatId) {
//     console.warn('[Telegram Bot] No chat ID found for phone:', phone);
//     console.warn('[Telegram Bot] User must /start the bot first');
//     return false;
//   }

//   // Форматируем сообщение
//   const message = `
// 💎 <b>Salon Elen - Код верификации</b>

// Ваш код подтверждения:

// <b>${code}</b>

// Код действителен 10 минут.

// <i>Если вы не запрашивали код, проигнорируйте это сообщение.</i>
// `;

//   return await sendMessage(chatId, message);
// }

// /**
//  * 🔔 УВЕДОМЛЕНИЕ АДМИНУ О НОВОЙ ЗАПИСИ
//  *
//  * Отправляется сразу после создания appointment
//  *
//  * @param appointment - Данные записи
//  * @param user - Данные клиента
//  * @param service - Данные услуги
//  * @param master - Данные мастера
//  */
// export async function notifyAdminNewAppointment(
//   appointment: AppointmentData,
//   user: UserData,
//   service: ServiceData,
//   master: MasterData
// ): Promise<boolean> {
//   if (!TELEGRAM_ADMIN_CHAT_ID) {
//     console.warn('[Telegram Bot] Admin notifications disabled - TELEGRAM_ADMIN_CHAT_ID not set');
//     return false;
//   }

//   console.log('[Telegram Bot] Sending admin notification for appointment:', appointment.id);

//   // Форматируем дату и время
//   const date = new Date(appointment.startAt);
//   const dateStr = date.toLocaleDateString('ru-RU', {
//     day: '2-digit',
//     month: 'long',
//     year: 'numeric',
//   });
//   const timeStr = date.toLocaleTimeString('ru-RU', {
//     hour: '2-digit',
//     minute: '2-digit',
//   });

//   // Статус оплаты
//   const paymentStatusEmoji = appointment.paymentStatus === 'PAID' ? '✅' : '⏳';
//   const paymentStatusText = appointment.paymentStatus === 'PAID' ? 'Оплачено' : 'Ожидает оплаты';

//   // Форматируем сообщение для админа
//   const message = `
// 🎉 <b>НОВАЯ ЗАПИСЬ!</b>

// ━━━━━━━━━━━━━━━━━━━━━
// 📅 <b>Дата:</b> ${dateStr}
// 🕐 <b>Время:</b> ${timeStr}

// 👤 <b>Клиент:</b> ${appointment.customerName}
// 📱 <b>Телефон:</b> ${user.phone}
// ${user.email ? `📧 <b>Email:</b> ${user.email}` : ''}

// ✨ <b>Услуга:</b> ${service.name}
// 💆‍♀️ <b>Мастер:</b> ${master.firstName} ${master.lastName}

// 💳 <b>Оплата:</b> ${paymentStatusEmoji} ${paymentStatusText}

// ━━━━━━━━━━━━━━━━━━━━━
// 🆔 ID записи: <code>${appointment.id}</code>

// <i>Управление записью в админ-панели</i>
// `;

//   // Добавляем кнопку для перехода в админ-панель (если есть)
//   const replyMarkup = {
//     inline_keyboard: [
//       [
//         {
//           text: '📊 Открыть в админке',
//           url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/appointments/${appointment.id}`,
//         },
//       ],
//     ],
//   };

//   return await sendMessage(TELEGRAM_ADMIN_CHAT_ID, message, {
//     reply_markup: replyMarkup,
//   });
// }

// /**
//  * Обработка команды /start от пользователя
//  *
//  * Сохраняет chat_id для последующей отправки кодов
//  */
// export async function handleStartCommand(
//   chatId: string,
//   username?: string,
//   firstName?: string
// ): Promise<void> {
//   console.log('[Telegram Bot] /start command from chat:', chatId);

//   // Приветственное сообщение
//   const welcomeMessage = `
// 💎 <b>Добро пожаловать в Salon Elen!</b>

// Привет${firstName ? `, ${firstName}` : ''}! 👋

// Этот бот поможет вам:
// ✅ Получать коды верификации при бронировании
// 🔔 Получать напоминания о записях
// 💬 Связаться с салоном

// <b>Следующий шаг:</b>
// Чтобы привязать ваш номер телефона, используйте кнопку "Отправить номер" ниже, или укажите его при бронировании на сайте.

// <i>Salon Elen - Premium Beauty Experience</i>
// `;

//   const replyMarkup = {
//     keyboard: [
//       [
//         {
//           text: '📱 Отправить номер телефона',
//           request_contact: true,
//         },
//       ],
//     ],
//     resize_keyboard: true,
//     one_time_keyboard: true,
//   };

//   await sendMessage(chatId, welcomeMessage, { reply_markup: replyMarkup });
// }

// /**
//  * Обработка получения контакта (номера телефона) от пользователя
//  *
//  * Сохраняет связь phone <-> chatId для отправки кодов
//  */
// export async function handleContactReceived(
//   chatId: string,
//   phone: string,
//   username?: string,
//   firstName?: string
// ): Promise<void> {
//   console.log('[Telegram Bot] Contact received:', { chatId, phone });

//   // Форматируем телефон
//   const formattedPhone = phone.replace(/\D/g, '');

//   // Сохраняем или обновляем пользователя в БД
//   await prisma.telegramUser.upsert({
//     where: { chatId },
//     create: {
//       chatId,
//       phone: formattedPhone,
//       username: username || null,
//       firstName: firstName || null,
//     },
//     update: {
//       phone: formattedPhone,
//       username: username || null,
//       firstName: firstName || null,
//       updatedAt: new Date(),
//     },
//   });

//   console.log('[Telegram Bot] User saved/updated in database');

//   // Подтверждение
//   const confirmMessage = `
// ✅ <b>Номер телефона сохранён!</b>

// Ваш номер: <code>${phone}</code>

// Теперь вы будете получать:
// • 🔐 Коды верификации при бронировании
// • 🔔 Напоминания о записях
// • 💬 Важные уведомления от салона

// <b>Готово!</b> Теперь можете забронировать услугу на сайте.

// 🌐 <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Перейти на сайт</a>
// `;

//   await sendMessage(chatId, confirmMessage);
// }

// /**
//  * Обработка входящего webhook от Telegram
//  *
//  * Используется в API route: /api/telegram/webhook
//  */
// export async function handleTelegramWebhook(update: any): Promise<void> {
//   console.log('[Telegram Bot] Webhook received:', JSON.stringify(update, null, 2));

//   // Обработка команды /start
//   if (update.message?.text === '/start') {
//     await handleStartCommand(
//       update.message.chat.id.toString(),
//       update.message.from?.username,
//       update.message.from?.first_name
//     );
//     return;
//   }

//   // Обработка полученного контакта
//   if (update.message?.contact) {
//     await handleContactReceived(
//       update.message.chat.id.toString(),
//       update.message.contact.phone_number,
//       update.message.from?.username,
//       update.message.from?.first_name
//     );
//     return;
//   }

//   // Обработка других сообщений
//   if (update.message?.text) {
//     const helpMessage = `
// 💡 <b>Как пользоваться ботом:</b>

// 1️⃣ Отправьте /start чтобы начать
// 2️⃣ Поделитесь номером телефона
// 3️⃣ Забронируйте услугу на сайте
// 4️⃣ Получите код подтверждения здесь

// <b>Нужна помощь?</b>
// Свяжитесь с нами: ${process.env.NEXT_PUBLIC_CONTACT_PHONE || '+49...'}

// 🌐 <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Перейти на сайт</a>
// `;

//     await sendMessage(update.message.chat.id.toString(), helpMessage);
//   }
// }

// // ───────── Экспорт ─────────

// export const TelegramBot = {
//   sendTelegramCode,
//   notifyAdminNewAppointment,
//   handleStartCommand,
//   handleContactReceived,
//   handleTelegramWebhook,
// };
