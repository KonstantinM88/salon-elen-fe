// src/lib/send-admin-notification.ts
// Универсальная функция для отправки уведомлений администратору

import { ORG_TZ } from "@/lib/orgTime";

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

function escapeMarkdown(value: string): string {
  return value.replace(/([_*[\]()~`>#+=|{}.!\\-])/g, '\\$1');
}

async function sendTelegramAdminMarkdownMessage(message: string): Promise<void> {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!adminChatId) {
    console.warn('[Admin Notification] TELEGRAM_ADMIN_CHAT_ID not configured - skipping notification');
    return;
  }

  const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/telegram/webhook`;

  const response = await fetch(`${webhookUrl}?action=notify&chatId=${adminChatId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Admin Notification] Failed to send:', errorData);
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

    await sendTelegramAdminMarkdownMessage(message);

    console.log('[Admin Notification] ✅ Sent successfully');
  } catch (error) {
    console.error('[Admin Notification] Error:', error);
    // Не бросаем ошибку - уведомление не должно блокировать создание записи
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
