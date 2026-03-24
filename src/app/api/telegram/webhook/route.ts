  // src/app/api/telegram/webhook/route.ts

  import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPhoneDigitsValid, normalizePhoneDigits } from '@/lib/phone';
import { parseTelegramAdminChatIds } from '@/lib/telegram-admin-chat-ids';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

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
  const phoneToChat = new Map<string, number>();

  // Отправка сообщения в Telegram (HTML)
  async function sendTelegramMessage(chatId: number, text: string) {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
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
  async function sendTelegramMessageMarkdown(chatId: number | string, text: string) {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      });
      
      const data = await response.json();
      
      if (!data.ok) {
        console.error('[Telegram Webhook] Send markdown message error:', data);
        return { success: false, error: data.description };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('[Telegram Webhook] Send markdown message failed:', error);
      return { success: false, error };
    }
  }

  // POST - Webhook от Telegram ИЛИ отправка уведомлений
  export async function POST(request: NextRequest) {
    try {
      const url = new URL(request.url);
      const action = url.searchParams.get('action');
      
      // ✅ НОВОЕ: Если это запрос на отправку уведомления администратору
      if (action === 'notify') {
        const chatIdParam = url.searchParams.get('chatId');
        const body = await request.json();
        const message = body.message;
        const adminChatIds = parseTelegramAdminChatIds(chatIdParam);
        
        if (adminChatIds.length === 0 || !message) {
          return NextResponse.json(
            { error: 'Missing chatId or message' },
            { status: 400 }
          );
        }
        
        console.log('[Telegram Webhook] Sending notification to:', adminChatIds.join(', '));

        const results = await Promise.allSettled(
          adminChatIds.map((chatId) => sendTelegramMessageMarkdown(chatId, message))
        );

        const failedDetails = results.flatMap((result) => {
          if (result.status === 'rejected') {
            return [result.reason];
          }

          if (!result.value.success) {
            return [result.value.error];
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
      const update = await request.json();
      
      console.log('[Telegram Webhook] Update received:', JSON.stringify(update, null, 2));
      
      // Получить сообщение
      const message = update.message;
      if (!message) {
        return NextResponse.json({ ok: true });
      }
      
      const chatId = message.chat.id;
      const text = message.text;
      const from = message.from;
      
      console.log('[Telegram Webhook] Message:', {
        chatId,
        text,
        from: from.username,
      });
      
      // Команда /start
      if (text === '/start' || text?.startsWith('/start ')) {
        const firstName = from.first_name || 'Guest';
        
        // Проверить параметр start (deep link)
        const startParam = text.split(' ')[1]; // Например: phone_380679014039
        
        if (startParam && startParam.startsWith('phone_')) {
          // Извлечь номер телефона
          const phoneFromParam = formatDeepLinkPhone(
            startParam.replace('phone_', '')
          );
          
          console.log('[Telegram Webhook] Deep link registration:', phoneFromParam);
          
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
              
              console.log('[Telegram Webhook] Auto-registered from deep link:', phoneFromParam);
              
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
        phoneToChat.set(text, chatId);
        
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
          
          console.log('[Telegram Webhook] Saved to DB:', text, '→', chatId);
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
      const searchParams = request.nextUrl.searchParams;
      const phone = searchParams.get('phone');
      const code = searchParams.get('code');
      
      if (!phone || !code) {
        return NextResponse.json(
          { error: 'Missing phone or code' },
          { status: 400 }
        );
      }
      
      console.log('[Telegram Webhook] Send code request:', phone, '→', code);
      
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
            console.log('[Telegram Webhook] Loaded from DB:', phone, '→', chatId);
          }
        } catch (dbError) {
          console.error('[Telegram Webhook] DB lookup error:', dbError);
        }
      }
      
      if (!chatId) {
        console.log('[Telegram Webhook] Chat ID not found for:', phone);
        return NextResponse.json(
          { 
            error: 'Phone not registered. User must send /start and phone to bot first.',
            phone,
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
      
      console.log('[Telegram Webhook] Code sent successfully:', phone, '→', chatId);
      
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
