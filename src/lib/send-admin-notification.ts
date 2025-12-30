// src/lib/send-admin-notification.ts
// Универсальная функция для отправки уведомлений администратору

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

/**
 * Отправляет уведомление администратору о новой записи через Telegram
 */
export async function sendAdminNotification(appointment: AppointmentData): Promise<void> {
  try {
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    
    if (!adminChatId) {
      console.warn('[Admin Notification] TELEGRAM_ADMIN_CHAT_ID not configured - skipping notification');
      return;
    }

    console.log('[Admin Notification] Sending to admin:', adminChatId);

    // Форматируем дату и время
    const dateStr = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(appointment.startAt);

    const startTime = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(appointment.startAt);

    const endTime = new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
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

    // Отправляем через webhook
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
      return;
    }

    console.log('[Admin Notification] ✅ Sent successfully');
  } catch (error) {
    console.error('[Admin Notification] Error:', error);
    // Не бросаем ошибку - уведомление не должно блокировать создание записи
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