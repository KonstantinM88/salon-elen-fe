// telegram-bot/bot.ts
import TelegramBot from 'node-telegram-bot-api';
import axios, { AxiosResponse } from 'axios';
import { config } from 'dotenv';
import path from 'path';

// ✅ Загружаем .env из корня проекта
config({ path: path.resolve(__dirname, '../.env') });

// =====================================
// Типы для API
// =====================================

interface TelegramCallbackRequest {
  payload: string;
  telegramUserId: number;
  telegramChatId: number;
}

interface TelegramCallbackResponse {
  success: boolean;
  email?: string;
  draftId?: string;
  message?: string;
}

// =====================================
// Конфигурация
// =====================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET || '';

if (!BOT_TOKEN) {
  throw new Error('❌ TELEGRAM_BOT_TOKEN не установлен в .env');
}

if (!TELEGRAM_SECRET) {
  throw new Error('❌ TELEGRAM_SECRET не установлен в .env');
}

console.log('🔐 TELEGRAM_SECRET (первые 16 символов):', TELEGRAM_SECRET.substring(0, 16) + '...');
console.log('📡 API URL:', API_URL);

// =====================================
// Инициализация бота
// =====================================

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🚀 Telegram бот SalonElen запущен в режиме polling...');

// =====================================
// Обработчики команд
// =====================================

// /start
bot.onText(/\/start$/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'друг';

  bot.sendMessage(
    chatId,
    `👋 Привет, ${firstName}!\n\n` +
      `Я бот салона красоты **Salon Elen** 💅✨\n\n` +
      `Используйте меня для подтверждения записи через Telegram!\n\n` +
      `📱 Просто перейдите по ссылке из сайта, и я помогу подтвердить вашу запись.`,
    { parse_mode: 'Markdown' }
  );
});

// /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `🆘 **Помощь по боту Salon Elen**\n\n` +
      `**Как использовать:**\n` +
      `1. Перейдите на сайт salon-elen.com\n` +
      `2. Выберите услугу и мастера\n` +
      `3. Заполните данные и выберите "Telegram"\n` +
      `4. Нажмите на кнопку "Подтвердить"\n\n` +
      `**Команды:**\n` +
      `/start - Начать работу\n` +
      `/help - Показать эту справку\n\n` +
      `**Поддержка:** @salon_elen_support`,
    { parse_mode: 'Markdown' }
  );
});

// =====================================
// Deep Links (callback_query)
// =====================================

bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;
  const data = query.data;

  if (!chatId || !data) {
    return;
  }

  console.log(`📩 Получен callback_query: ${data}`);

  if (data.startsWith('confirm_')) {
    const payload = data.replace('confirm_', '');

    try {
      // ✅ Правильная типизация axios response
      const response: AxiosResponse<TelegramCallbackResponse> = await axios.post(
        `${API_URL}/api/booking/verify/telegram/callback`,
        {
          payload,
          telegramUserId: query.from.id,
          telegramChatId: chatId,
        } as TelegramCallbackRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      // ✅ Теперь result имеет правильный тип!
      const result = response.data;

      if (result.success) {
        await bot.editMessageText(
          `✅ **Подтверждено!**\n\n` +
            `Ваша запись успешно подтверждена.\n` +
            `Email: ${result.email}\n\n` +
            `Спасибо за выбор Salon Elen! 💅✨`,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
          }
        );

        await bot.answerCallbackQuery(query.id, {
          text: '✅ Запись подтверждена!',
        });
      } else {
        await bot.answerCallbackQuery(query.id, {
          text: result.message || '❌ Ошибка подтверждения',
          show_alert: true,
        });
      }
    } catch (error) {
      console.error('❌ Ошибка при подтверждении:', error);

      await bot.answerCallbackQuery(query.id, {
        text: '❌ Ошибка связи с сервером. Попробуйте позже.',
        show_alert: true,
      });
    }
  }
});

// =====================================
// Deep Links (через /start параметр)
// =====================================

bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'друг';
  const payload = match?.[1];

  if (!payload) {
    return;
  }

  console.log(`🔗 Получен deep link: ${payload}`);

  try {
    // ✅ Правильная типизация axios response
    const response: AxiosResponse<TelegramCallbackResponse> = await axios.post(
      `${API_URL}/api/booking/verify/telegram/callback`,
      {
        payload,
        telegramUserId: msg.from?.id,
        telegramChatId: chatId,
      } as TelegramCallbackRequest,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    // ✅ Теперь result имеет правильный тип!
    const result = response.data;

    if (result.success) {
      await bot.sendMessage(
        chatId,
        `✅ **Подтверждение записи**\n\n` +
          `Привет, ${firstName}!\n\n` +
          `Для подтверждения записи нажмите кнопку ниже:`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '✅ Подтвердить запись',
                  callback_data: `confirm_${payload}`,
                },
              ],
            ],
          },
        }
      );
    } else {
      await bot.sendMessage(
        chatId,
        `❌ **Ошибка**\n\n${result.message || 'Не удалось загрузить данные записи.'}`,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    console.error('❌ Ошибка при обработке deep link:', error);

    await bot.sendMessage(
      chatId,
      `❌ **Ошибка**\n\nНе удалось связаться с сервером. Попробуйте позже.`,
      { parse_mode: 'Markdown' }
    );
  }
});

// =====================================
// Обработка ошибок
// =====================================

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

process.on('SIGINT', () => {
  console.log('\n👋 Остановка бота...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Остановка бота...');
  bot.stopPolling();
  process.exit(0);
});

console.log('✅ Бот готов к работе!');
