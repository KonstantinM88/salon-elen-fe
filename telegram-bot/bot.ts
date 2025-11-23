// telegram-bot/bot.ts - ФИНАЛЬНАЯ ВЕРСИЯ с обработкой ошибок
import TelegramBot from 'node-telegram-bot-api';
import express, { Express, Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';
import { config } from 'dotenv';
import path from 'path';

// ✅ Загружаем .env из корня проекта
config({ path: path.resolve(__dirname, '../.env') });

// =====================================
// Типы
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

interface SendCodeRequest {
  email: string;
  chatId: number;
  code: string;
  draftId: string;
}

interface RegisterUserRequest {
  email: string;
  telegramUserId: number;
  telegramChatId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
}

interface TelegramError extends Error {
  code?: string;
  response?: {
    statusCode?: number;
    body?: unknown;
  };
}

// =====================================
// Конфигурация
// =====================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET || '';
const BOT_PORT = parseInt(process.env.BOT_PORT || '3001', 10);
const BOT_SECRET = process.env.BOT_SECRET || 'your-bot-secret-key';

if (!BOT_TOKEN) {
  throw new Error('❌ TELEGRAM_BOT_TOKEN не установлен в .env');
}

if (!TELEGRAM_SECRET) {
  throw new Error('❌ TELEGRAM_SECRET не установлен в .env');
}

console.log('🔐 TELEGRAM_SECRET (первые 16 символов):', TELEGRAM_SECRET.substring(0, 16) + '...');
console.log('📡 API URL:', API_URL);
console.log('🔌 BOT HTTP Port:', BOT_PORT);

// =====================================
// Инициализация
// =====================================

const bot = new TelegramBot(BOT_TOKEN, { 
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10
    }
  } 
});

const app: Express = express();

app.use(express.json());

// Middleware для проверки секретного ключа
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${BOT_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

console.log('🚀 Telegram бот SalonElen запущен в режиме polling...');

// =====================================
// DEBUG: Логируем ВСЕ сообщения
// =====================================

bot.on('message', (msg) => {
  console.log(`📨 [DEBUG] Получено сообщение от ${msg.from?.first_name} (ID: ${msg.from?.id})`);
  console.log(`📨 [DEBUG] Текст: ${msg.text}`);
  console.log(`📨 [DEBUG] Chat ID: ${msg.chat.id}`);
});

bot.on('polling_error', (error) => {
  const telegramError = error as TelegramError;
  console.error('❌ [POLLING ERROR]:', telegramError.code || 'UNKNOWN', telegramError.message);
  
  if (telegramError.response) {
    console.error('📡 [POLLING ERROR] Response:', telegramError.response);
  }
});

// =====================================
// HTTP Endpoints
// =====================================

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', bot: 'running' });
});

// Отправка кода OTP пользователю
app.post('/send-code', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, chatId, code, draftId }: SendCodeRequest = req.body;

    if (!email || !chatId || !code || !draftId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    console.log(`📤 Отправка кода ${code} пользователю ${email} (chatId: ${chatId})`);

    // Генерируем payload для кнопки подтверждения
    const confirmPayload = Buffer.from(
      JSON.stringify({ draftId, email })
    ).toString('base64');

    // Отправляем сообщение с кодом и кнопкой
    const result = await bot.sendMessage(
      chatId,
      `✅ *Подтверждение записи*\n\n` +
        `Ваш код подтверждения: *${code}*\n\n` +
        `Введите его на сайте или нажмите кнопку ниже для мгновенного подтверждения.`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✅ Подтвердить запись',
                callback_data: `confirm_${confirmPayload}`,
              },
            ],
          ],
        },
      }
    );

    console.log(`✅ Код ${code} отправлен успешно, message_id: ${result.message_id}`);

    res.json({
      success: true,
      message: 'Код отправлен',
    });
  } catch (error) {
    console.error('❌ Ошибка отправки кода:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send code',
    });
  }
});

// Регистрация нового пользователя
app.post('/register-user', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data: RegisterUserRequest = req.body;

    console.log(`📝 Регистрация пользователя: ${data.email} (${data.telegramUserId})`);

    // Вызываем API для сохранения в БД
    await axios.post(
      `${API_URL}/api/telegram/register-user`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOT_SECRET}`,
        },
        timeout: 10000,
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user',
    });
  }
});

// =====================================
// Telegram Bot Handlers
// =====================================

// /start без параметров
bot.onText(/\/start$/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'друг';
  const telegramUserId = msg.from?.id;

  console.log(`👤 [/start] От пользователя ${firstName} (ID: ${telegramUserId}, Chat: ${chatId})`);

  try {
    // Приветственное сообщение
    const result = await bot.sendMessage(
      chatId,
      `👋 Привет, ${firstName}!\n\n` +
        `Я бот салона красоты **Salon Elen** 💅✨\n\n` +
        `Для подтверждения записи:\n` +
        `1️⃣ Оформите запись на сайте\n` +
        `2️⃣ Выберите "Telegram" как способ подтверждения\n` +
        `3️⃣ Я отправлю вам код для подтверждения\n\n` +
        `Готовы записаться? Перейдите на **salon-elen.com** 🌟`,
      { parse_mode: 'Markdown' }
    );

    console.log(`✅ [/start] Приветствие отправлено для ${firstName}, message_id: ${result.message_id}`);
  } catch (error) {
    console.error(`❌ [/start] Ошибка отправки сообщения для ${firstName}:`, error);
  }
});

// /start с параметром (deep link)
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || 'друг';
  const payload = match?.[1];
  const telegramUserId = msg.from?.id;
  const username = msg.from?.username;
  const lastName = msg.from?.last_name;

  if (!payload || !telegramUserId) {
    console.log(`⚠️ [/start] Отсутствует payload или telegramUserId`);
    return;
  }

  console.log(`🔗 [/start+payload] От ${firstName} (ID: ${telegramUserId}, Chat: ${chatId})`);
  console.log(`🔗 [/start+payload] Payload: ${payload}`);

  try {
    // Декодируем payload
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    const { draftId, email } = decoded;

    if (!draftId || !email) {
      throw new Error('Invalid payload');
    }

    console.log(`📧 [/start+payload] Email: ${email}, DraftID: ${draftId}`);

    // Регистрируем пользователя в БД
    console.log(`📝 [/start+payload] Регистрация пользователя через internal webhook...`);
    
    await axios.post(
      `http://localhost:${BOT_PORT}/register-user`,
      {
        email,
        telegramUserId,
        telegramChatId: chatId,
        firstName,
        lastName,
        username,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOT_SECRET}`,
        },
      }
    );

    console.log(`✅ [/start+payload] Пользователь зарегистрирован`);

    // Отправляем приветствие
    await bot.sendMessage(
      chatId,
      `✅ *Отлично, ${firstName}!*\n\n` +
        `Вы успешно подключили Telegram для подтверждения записей.\n\n` +
        `Сейчас я отправлю вам код подтверждения...`,
      { parse_mode: 'Markdown' }
    );

    console.log(`✅ [/start+payload] Приветствие отправлено`);

    // Вызываем API для отправки кода
    console.log(`📤 [/start+payload] Запрос кода через API...`);
    
    await axios.post(
      `${API_URL}/api/booking/verify/telegram/send-to-registered`,
      { email, draftId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log(`✅ [/start+payload] Код запрошен успешно`);

  } catch (error) {
    console.error('❌ [/start+payload] Ошибка:', error);

    try {
      await bot.sendMessage(
        chatId,
        `❌ **Ошибка**\n\nНе удалось обработать вашу запись. Попробуйте снова с сайта.`,
        { parse_mode: 'Markdown' }
      );
    } catch (sendError) {
      console.error('❌ [/start+payload] Не удалось отправить сообщение об ошибке:', sendError);
    }
  }
});

// /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  console.log(`❓ [/help] От пользователя ${msg.from?.first_name}`);

  try {
    await bot.sendMessage(
      chatId,
      `🆘 **Помощь по боту Salon Elen**\n\n` +
        `**Как использовать:**\n` +
        `1. Перейдите на сайт salon-elen.com\n` +
        `2. Выберите услугу и мастера\n` +
        `3. Заполните данные и выберите "Telegram"\n` +
        `4. Я отправлю вам код для подтверждения\n\n` +
        `**Команды:**\n` +
        `/start - Начать работу\n` +
        `/help - Показать эту справку\n\n` +
        `**Поддержка:** @salon_elen_support`,
      { parse_mode: 'Markdown' }
    );
    
    console.log(`✅ [/help] Справка отправлена`);
  } catch (error) {
    console.error(`❌ [/help] Ошибка отправки справки:`, error);
  }
});

// Обработка callback_query (кнопка подтверждения)
bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;
  const data = query.data;

  if (!chatId || !data) {
    return;
  }

  console.log(`📩 [callback_query] Получен callback: ${data}`);

  if (data.startsWith('confirm_')) {
    const payload = data.replace('confirm_', '');

    try {
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
        
        console.log(`✅ [callback_query] Запись подтверждена для ${result.email}`);
      } else {
        await bot.answerCallbackQuery(query.id, {
          text: result.message || '❌ Ошибка подтверждения',
          show_alert: true,
        });
        
        console.log(`⚠️ [callback_query] Ошибка: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ [callback_query] Ошибка при подтверждении:', error);

      try {
        await bot.answerCallbackQuery(query.id, {
          text: '❌ Ошибка связи с сервером. Попробуйте позже.',
          show_alert: true,
        });
      } catch (answerError) {
        console.error('❌ [callback_query] Не удалось ответить на callback:', answerError);
      }
    }
  }
});

// =====================================
// Обработка ошибок
// =====================================

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

// =====================================
// Запуск HTTP сервера
// =====================================

app.listen(BOT_PORT, () => {
  console.log(`🌐 HTTP сервер бота запущен на порту ${BOT_PORT}`);
  console.log(`✅ Бот готов к работе!`);
  console.log(`🔍 Ожидание сообщений от Telegram...`);
});


// // telegram-bot/bot.ts - PRODUCTION VERSION с HTTP сервером
// import TelegramBot from 'node-telegram-bot-api';
// import express, { Express, Request, Response, NextFunction } from 'express';
// import axios, { AxiosResponse } from 'axios';
// import { config } from 'dotenv';
// import path from 'path';

// // ✅ Загружаем .env из корня проекта
// config({ path: path.resolve(__dirname, '../.env') });

// // =====================================
// // Типы
// // =====================================

// interface TelegramCallbackRequest {
//   payload: string;
//   telegramUserId: number;
//   telegramChatId: number;
// }

// interface TelegramCallbackResponse {
//   success: boolean;
//   email?: string;
//   draftId?: string;
//   message?: string;
// }

// interface SendCodeRequest {
//   email: string;
//   chatId: number;
//   code: string;
//   draftId: string;
// }

// interface RegisterUserRequest {
//   email: string;
//   telegramUserId: number;
//   telegramChatId: number;
//   firstName?: string;
//   lastName?: string;
//   username?: string;
// }

// // =====================================
// // Конфигурация
// // =====================================

// const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
// const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET || '';
// const BOT_PORT = parseInt(process.env.BOT_PORT || '3001', 10);
// const BOT_SECRET = process.env.BOT_SECRET || 'your-bot-secret-key';

// if (!BOT_TOKEN) {
//   throw new Error('❌ TELEGRAM_BOT_TOKEN не установлен в .env');
// }

// if (!TELEGRAM_SECRET) {
//   throw new Error('❌ TELEGRAM_SECRET не установлен в .env');
// }

// console.log('🔐 TELEGRAM_SECRET (первые 16 символов):', TELEGRAM_SECRET.substring(0, 16) + '...');
// console.log('📡 API URL:', API_URL);
// console.log('🔌 BOT HTTP Port:', BOT_PORT);

// // =====================================
// // Инициализация
// // =====================================

// const bot = new TelegramBot(BOT_TOKEN, { polling: true });
// const app: Express = express();

// app.use(express.json());

// // Middleware для проверки секретного ключа
// const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
  
//   if (!authHeader || authHeader !== `Bearer ${BOT_SECRET}`) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
  
//   next();
// };

// console.log('🚀 Telegram бот SalonElen запущен в режиме polling...');

// // =====================================
// // HTTP Endpoints
// // =====================================

// // Health check
// app.get('/health', (req: Request, res: Response) => {
//   res.json({ status: 'ok', bot: 'running' });
// });

// // Отправка кода OTP пользователю
// app.post('/send-code', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const { email, chatId, code, draftId }: SendCodeRequest = req.body;

//     if (!email || !chatId || !code || !draftId) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Missing required fields' 
//       });
//     }

//     console.log(`📤 Отправка кода ${code} пользователю ${email} (chatId: ${chatId})`);

//     // Генерируем payload для кнопки подтверждения
//     const confirmPayload = Buffer.from(
//       JSON.stringify({ draftId, email })
//     ).toString('base64');

//     // Отправляем сообщение с кодом и кнопкой
//     await bot.sendMessage(
//       chatId,
//       `✅ *Подтверждение записи*\n\n` +
//         `Ваш код подтверждения: *${code}*\n\n` +
//         `Введите его на сайте или нажмите кнопку ниже для мгновенного подтверждения.`,
//       {
//         parse_mode: 'Markdown',
//         reply_markup: {
//           inline_keyboard: [
//             [
//               {
//                 text: '✅ Подтвердить запись',
//                 callback_data: `confirm_${confirmPayload}`,
//               },
//             ],
//           ],
//         },
//       }
//     );

//     console.log(`✅ Код ${code} отправлен успешно`);

//     res.json({
//       success: true,
//       message: 'Код отправлен',
//     });
//   } catch (error) {
//     console.error('❌ Ошибка отправки кода:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to send code',
//     });
//   }
// });

// // Регистрация нового пользователя
// app.post('/register-user', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const data: RegisterUserRequest = req.body;

//     console.log(`📝 Регистрация пользователя: ${data.email} (${data.telegramUserId})`);

//     // Вызываем API для сохранения в БД
//     await axios.post(
//       `${API_URL}/api/telegram/register-user`,
//       data,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${BOT_SECRET}`,
//         },
//         timeout: 10000,
//       }
//     );

//     res.json({ success: true });
//   } catch (error) {
//     console.error('❌ Ошибка регистрации:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to register user',
//     });
//   }
// });

// // =====================================
// // Telegram Bot Handlers
// // =====================================

// // /start без параметров
// bot.onText(/\/start$/, async (msg) => {
//   const chatId = msg.chat.id;
//   const firstName = msg.from?.first_name || 'друг';
//   const telegramUserId = msg.from?.id;

//   console.log(`👤 /start от пользователя ${firstName} (${telegramUserId})`);

//   // Приветственное сообщение
//   await bot.sendMessage(
//     chatId,
//     `👋 Привет, ${firstName}!\\n\\n` +
//       `Я бот салона красоты **Salon Elen** 💅✨\\n\\n` +
//       `Для подтверждения записи:\\n` +
//       `1️⃣ Оформите запись на сайте\\n` +
//       `2️⃣ Выберите \"Telegram\" как способ подтверждения\\n` +
//       `3️⃣ Я отправлю вам код для подтверждения\\n\\n` +
//       `Готовы записаться? Перейдите на **salon-elen.com** 🌟`,
//     { parse_mode: 'Markdown' }
//   );
// });

// // /start с параметром (deep link)
// bot.onText(/\/start (.+)/, async (msg, match) => {
//   const chatId = msg.chat.id;
//   const firstName = msg.from?.first_name || 'друг';
//   const payload = match?.[1];
//   const telegramUserId = msg.from?.id;
//   const username = msg.from?.username;
//   const lastName = msg.from?.last_name;

//   if (!payload || !telegramUserId) {
//     return;
//   }

//   console.log(`🔗 Получен deep link от ${firstName} (${telegramUserId}): ${payload}`);

//   try {
//     // Декодируем payload
//     const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
//     const { draftId, email } = decoded;

//     if (!draftId || !email) {
//       throw new Error('Invalid payload');
//     }

//     console.log(`📧 Регистрация связи: ${email} ↔ ${chatId}`);

//     // Регистрируем пользователя в БД
//     await axios.post(
//       `http://localhost:${BOT_PORT}/register-user`,
//       {
//         email,
//         telegramUserId,
//         telegramChatId: chatId,
//         firstName,
//         lastName,
//         username,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${BOT_SECRET}`,
//         },
//       }
//     );

//     // Отправляем приветствие
//     await bot.sendMessage(
//       chatId,
//       `✅ *Отлично, ${firstName}!*\\n\\n` +
//         `Вы успешно подключили Telegram для подтверждения записей.\\n\\n` +
//         `Сейчас я отправлю вам код подтверждения...`,
//       { parse_mode: 'Markdown' }
//     );

//     // Вызываем API для отправки кода
//     await axios.post(
//       `${API_URL}/api/booking/verify/telegram/send-to-registered`,
//       { email, draftId },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         timeout: 10000,
//       }
//     );

//   } catch (error) {
//     console.error('❌ Ошибка при обработке deep link:', error);

//     await bot.sendMessage(
//       chatId,
//       `❌ **Ошибка**\\n\\nНе удалось обработать вашу запись. Попробуйте снова с сайта.`,
//       { parse_mode: 'Markdown' }
//     );
//   }
// });

// // /help
// bot.onText(/\/help/, (msg) => {
//   const chatId = msg.chat.id;

//   bot.sendMessage(
//     chatId,
//     `🆘 **Помощь по боту Salon Elen**\\n\\n` +
//       `**Как использовать:**\\n` +
//       `1. Перейдите на сайт salon-elen.com\\n` +
//       `2. Выберите услугу и мастера\\n` +
//       `3. Заполните данные и выберите \"Telegram\"\\n` +
//       `4. Я отправлю вам код для подтверждения\\n\\n` +
//       `**Команды:**\\n` +
//       `/start - Начать работу\\n` +
//       `/help - Показать эту справку\\n\\n` +
//       `**Поддержка:** @salon_elen_support`,
//     { parse_mode: 'Markdown' }
//   );
// });

// // Обработка callback_query (кнопка подтверждения)
// bot.on('callback_query', async (query) => {
//   const chatId = query.message?.chat.id;
//   const messageId = query.message?.message_id;
//   const data = query.data;

//   if (!chatId || !data) {
//     return;
//   }

//   console.log(`📩 Получен callback_query: ${data}`);

//   if (data.startsWith('confirm_')) {
//     const payload = data.replace('confirm_', '');

//     try {
//       const response: AxiosResponse<TelegramCallbackResponse> = await axios.post(
//         `${API_URL}/api/booking/verify/telegram/callback`,
//         {
//           payload,
//           telegramUserId: query.from.id,
//           telegramChatId: chatId,
//         } as TelegramCallbackRequest,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           timeout: 10000,
//         }
//       );

//       const result = response.data;

//       if (result.success) {
//         await bot.editMessageText(
//           `✅ **Подтверждено!**\\n\\n` +
//             `Ваша запись успешно подтверждена.\\n` +
//             `Email: ${result.email}\\n\\n` +
//             `Спасибо за выбор Salon Elen! 💅✨`,
//           {
//             chat_id: chatId,
//             message_id: messageId,
//             parse_mode: 'Markdown',
//           }
//         );

//         await bot.answerCallbackQuery(query.id, {
//           text: '✅ Запись подтверждена!',
//         });
//       } else {
//         await bot.answerCallbackQuery(query.id, {
//           text: result.message || '❌ Ошибка подтверждения',
//           show_alert: true,
//         });
//       }
//     } catch (error) {
//       console.error('❌ Ошибка при подтверждении:', error);

//       await bot.answerCallbackQuery(query.id, {
//         text: '❌ Ошибка связи с сервером. Попробуйте позже.',
//         show_alert: true,
//       });
//     }
//   }
// });

// // =====================================
// // Обработка ошибок
// // =====================================

// bot.on('polling_error', (error) => {
//   console.error('❌ Polling error:', error);
// });

// process.on('SIGINT', () => {
//   console.log('\\n👋 Остановка бота...');
//   bot.stopPolling();
//   process.exit(0);
// });

// process.on('SIGTERM', () => {
//   console.log('\\n👋 Остановка бота...');
//   bot.stopPolling();
//   process.exit(0);
// });

// // =====================================
// // Запуск HTTP сервера
// // =====================================

// app.listen(BOT_PORT, () => {
//   console.log(`🌐 HTTP сервер бота запущен на порту ${BOT_PORT}`);
//   console.log(`✅ Бот готов к работе!`);
// });



// // telegram-bot/bot.ts
// import TelegramBot from 'node-telegram-bot-api';
// import axios, { AxiosResponse } from 'axios';
// import { config } from 'dotenv';
// import path from 'path';

// // ✅ Загружаем .env из корня проекта
// config({ path: path.resolve(__dirname, '../.env') });

// // =====================================
// // Типы для API
// // =====================================

// interface TelegramCallbackRequest {
//   payload: string;
//   telegramUserId: number;
//   telegramChatId: number;
// }

// interface TelegramCallbackResponse {
//   success: boolean;
//   email?: string;
//   draftId?: string;
//   message?: string;
// }

// // =====================================
// // Конфигурация
// // =====================================

// const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
// const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET || '';

// if (!BOT_TOKEN) {
//   throw new Error('❌ TELEGRAM_BOT_TOKEN не установлен в .env');
// }

// if (!TELEGRAM_SECRET) {
//   throw new Error('❌ TELEGRAM_SECRET не установлен в .env');
// }

// console.log('🔐 TELEGRAM_SECRET (первые 16 символов):', TELEGRAM_SECRET.substring(0, 16) + '...');
// console.log('📡 API URL:', API_URL);

// // =====================================
// // Инициализация бота
// // =====================================

// const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// console.log('🚀 Telegram бот SalonElen запущен в режиме polling...');

// // =====================================
// // Обработчики команд
// // =====================================

// // /start
// bot.onText(/\/start$/, (msg) => {
//   const chatId = msg.chat.id;
//   const firstName = msg.from?.first_name || 'друг';

//   bot.sendMessage(
//     chatId,
//     `👋 Привет, ${firstName}!\n\n` +
//       `Я бот салона красоты **Salon Elen** 💅✨\n\n` +
//       `Используйте меня для подтверждения записи через Telegram!\n\n` +
//       `📱 Просто перейдите по ссылке из сайта, и я помогу подтвердить вашу запись.`,
//     { parse_mode: 'Markdown' }
//   );
// });

// // /help
// bot.onText(/\/help/, (msg) => {
//   const chatId = msg.chat.id;

//   bot.sendMessage(
//     chatId,
//     `🆘 **Помощь по боту Salon Elen**\n\n` +
//       `**Как использовать:**\n` +
//       `1. Перейдите на сайт salon-elen.com\n` +
//       `2. Выберите услугу и мастера\n` +
//       `3. Заполните данные и выберите "Telegram"\n` +
//       `4. Нажмите на кнопку "Подтвердить"\n\n` +
//       `**Команды:**\n` +
//       `/start - Начать работу\n` +
//       `/help - Показать эту справку\n\n` +
//       `**Поддержка:** @salon_elen_support`,
//     { parse_mode: 'Markdown' }
//   );
// });

// // =====================================
// // Deep Links (callback_query)
// // =====================================

// bot.on('callback_query', async (query) => {
//   const chatId = query.message?.chat.id;
//   const messageId = query.message?.message_id;
//   const data = query.data;

//   if (!chatId || !data) {
//     return;
//   }

//   console.log(`📩 Получен callback_query: ${data}`);

//   if (data.startsWith('confirm_')) {
//     const payload = data.replace('confirm_', '');

//     try {
//       // ✅ Правильная типизация axios response
//       const response: AxiosResponse<TelegramCallbackResponse> = await axios.post(
//         `${API_URL}/api/booking/verify/telegram/callback`,
//         {
//           payload,
//           telegramUserId: query.from.id,
//           telegramChatId: chatId,
//         } as TelegramCallbackRequest,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           timeout: 10000,
//         }
//       );

//       // ✅ Теперь result имеет правильный тип!
//       const result = response.data;

//       if (result.success) {
//         await bot.editMessageText(
//           `✅ **Подтверждено!**\n\n` +
//             `Ваша запись успешно подтверждена.\n` +
//             `Email: ${result.email}\n\n` +
//             `Спасибо за выбор Salon Elen! 💅✨`,
//           {
//             chat_id: chatId,
//             message_id: messageId,
//             parse_mode: 'Markdown',
//           }
//         );

//         await bot.answerCallbackQuery(query.id, {
//           text: '✅ Запись подтверждена!',
//         });
//       } else {
//         await bot.answerCallbackQuery(query.id, {
//           text: result.message || '❌ Ошибка подтверждения',
//           show_alert: true,
//         });
//       }
//     } catch (error) {
//       console.error('❌ Ошибка при подтверждении:', error);

//       await bot.answerCallbackQuery(query.id, {
//         text: '❌ Ошибка связи с сервером. Попробуйте позже.',
//         show_alert: true,
//       });
//     }
//   }
// });

// // =====================================
// // Deep Links (через /start параметр)
// // =====================================

// bot.onText(/\/start (.+)/, async (msg, match) => {
//   const chatId = msg.chat.id;
//   const firstName = msg.from?.first_name || 'друг';
//   const payload = match?.[1];

//   if (!payload) {
//     return;
//   }

//   console.log(`🔗 Получен deep link: ${payload}`);

//   try {
//     // ✅ Правильная типизация axios response
//     const response: AxiosResponse<TelegramCallbackResponse> = await axios.post(
//       `${API_URL}/api/booking/verify/telegram/callback`,
//       {
//         payload,
//         telegramUserId: msg.from?.id,
//         telegramChatId: chatId,
//       } as TelegramCallbackRequest,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         timeout: 10000,
//       }
//     );

//     // ✅ Теперь result имеет правильный тип!
//     const result = response.data;

//     if (result.success) {
//       await bot.sendMessage(
//         chatId,
//         `✅ **Подтверждение записи**\n\n` +
//           `Привет, ${firstName}!\n\n` +
//           `Для подтверждения записи нажмите кнопку ниже:`,
//         {
//           parse_mode: 'Markdown',
//           reply_markup: {
//             inline_keyboard: [
//               [
//                 {
//                   text: '✅ Подтвердить запись',
//                   callback_data: `confirm_${payload}`,
//                 },
//               ],
//             ],
//           },
//         }
//       );
//     } else {
//       await bot.sendMessage(
//         chatId,
//         `❌ **Ошибка**\n\n${result.message || 'Не удалось загрузить данные записи.'}`,
//         { parse_mode: 'Markdown' }
//       );
//     }
//   } catch (error) {
//     console.error('❌ Ошибка при обработке deep link:', error);

//     await bot.sendMessage(
//       chatId,
//       `❌ **Ошибка**\n\nНе удалось связаться с сервером. Попробуйте позже.`,
//       { parse_mode: 'Markdown' }
//     );
//   }
// });

// // =====================================
// // Обработка ошибок
// // =====================================

// bot.on('polling_error', (error) => {
//   console.error('❌ Polling error:', error);
// });

// process.on('SIGINT', () => {
//   console.log('\n👋 Остановка бота...');
//   bot.stopPolling();
//   process.exit(0);
// });

// process.on('SIGTERM', () => {
//   console.log('\n👋 Остановка бота...');
//   bot.stopPolling();
//   process.exit(0);
// });

// console.log('✅ Бот готов к работе!');
