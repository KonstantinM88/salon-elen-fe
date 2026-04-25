// src/lib/email.ts
import { Resend } from 'resend';
import { AppointmentStatus } from '@/lib/prisma-client';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';
import { translate, type MessageKey } from '@/i18n/messages';

/**
 * Интерфейс данных для email уведомления
 */
interface AppointmentEmailData {
  customerName: string;
  email: string;
  serviceName: string;
  masterName: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  previousStatus?: AppointmentStatus;
  locale?: Locale;
}

/**
 * Получить экземпляр Resend (ленивая инициализация)
 * Это предотвращает ошибки при сборке, если API ключ отсутствует
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY not configured');
    return null;
  }
  
  try {
    return new Resend(apiKey);
  } catch (error) {
    console.error('❌ Failed to initialize Resend:', error);
    return null;
  }
}

function resolveLocale(locale?: Locale): Locale {
  if (locale && LOCALES.includes(locale)) {
    return locale;
  }
  return DEFAULT_LOCALE;
}

function getIntlLocale(locale: Locale): string {
  switch (locale) {
    case 'de':
      return 'de-DE';
    case 'en':
      return 'en-US';
    default:
      return 'ru-RU';
  }
}

/**
 * Отправка email уведомления клиенту о изменении статуса
 */
export async function sendStatusChangeEmail(
  data: AppointmentEmailData
): Promise<{ ok: boolean; error?: string }> {
  const locale = resolveLocale(data.locale);
  const t = (key: MessageKey) => translate(locale, key);

  try {
    // Получаем клиента Resend
    const resend = getResendClient();
    
    if (!resend) {
      console.warn('⚠️ Email service not configured, skipping email');
      return { ok: false, error: t('email_service_not_configured') };
    }

    // Формируем письмо
    const subject = getEmailSubject(data.status, t);
    const html = getEmailBody(data, t, locale);

    // Отправляем через Resend
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Salon Elen <onboarding@resend.dev>',
      to: data.email,
      subject,
      html,
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      return { ok: false, error: result.error.message };
    }

    console.log(`✅ Email sent to ${data.email} | ID: ${result.data?.id}`);
    return { ok: true };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : t('email_send_unknown_error') 
    };
  }
}

/**
 * Получить тему письма в зависимости от статуса
 */
function getEmailSubject(
  status: AppointmentStatus,
  t: (key: MessageKey) => string
): string {
  const subjects: Record<AppointmentStatus, MessageKey> = {
    PENDING: 'email_status_subject_pending',
    CONFIRMED: 'email_status_subject_confirmed',
    DONE: 'email_status_subject_done',
    CANCELED: 'email_status_subject_canceled',
  };
  
  return t(subjects[status]);
}

/**
 * Получить HTML тело письма
 */
function getEmailBody(
  data: AppointmentEmailData,
  t: (key: MessageKey) => string,
  locale: Locale
): string {
  const statusEmoji: Record<AppointmentStatus, string> = {
    PENDING: '🔔',
    CONFIRMED: '✅',
    DONE: '🎉',
    CANCELED: '❌',
  };

  const statusText: Record<AppointmentStatus, MessageKey> = {
    PENDING: 'email_status_text_pending',
    CONFIRMED: 'email_status_text_confirmed',
    DONE: 'email_status_text_done',
    CANCELED: 'email_status_text_canceled',
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Персонализированное сообщение в зависимости от статуса
  let message = '';
  
  switch (data.status) {
    case 'PENDING':
      message = `
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          ${t('email_status_message_pending')}
        </p>
      `;
      break;
    
    case 'CONFIRMED':
      message = `
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          ${t('email_status_message_confirmed_intro')}
        </p>
        <p style="font-size: 18px; color: #111827; font-weight: 600; margin: 20px 0;">
          ${t('email_status_message_confirmed_wait').replace('{date}', formatDateTime(data.startAt))}
        </p>
        <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #166534; margin: 0; font-size: 15px;">
            <strong>${t('email_status_message_confirmed_notice_title')}</strong> ${t('email_status_message_confirmed_notice_text')}
          </p>
        </div>
      `;
      break;
    
    case 'DONE':
      message = `
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          ${t('email_status_message_done_intro')}
        </p>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          ${t('email_status_message_done_outro')}
        </p>
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #075985; margin: 0; font-size: 15px;">
            <strong>${t('email_status_message_done_tip_title')}</strong> ${t('email_status_message_done_tip_text')}
          </p>
        </div>
      `;
      break;
    
    case 'CANCELED':
      message = `
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          ${t('email_status_message_canceled_intro')}
        </p>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          ${t('email_status_message_canceled_contact_intro')}
        </p>
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #991b1b; margin: 0; font-size: 15px; line-height: 1.6;">
            ${t('email_status_message_canceled_contact')}
          </p>
        </div>
      `;
      break;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://permanent-halle.de';

  return `
    <!DOCTYPE html>
    <html lang="${locale}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t('email_status_html_title')}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
            ${statusEmoji[data.status]} Salon Elen
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            ${t('email_status_header_subtitle')}
          </p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            ${t('email_status_greeting').replace('{name}', data.customerName)}
          </p>
          
          ${message}
          
          <!-- Booking Details -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 600;">
              ${t('email_status_details_title')}
            </h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 120px; font-size: 14px;">${t('email_status_details_status_label')}</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 14px;">
                  ${statusEmoji[data.status]} ${t(statusText[data.status])}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t('email_status_details_service_label')}</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px;">${data.serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t('email_status_details_master_label')}</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px;">${data.masterName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${t('email_status_details_datetime_label')}</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px;">${formatDateTime(data.startAt)}</td>
              </tr>
            </table>
          </div>
          
          <!-- CTA Button (for CONFIRMED status) -->
          ${data.status === 'CONFIRMED' ? `
            <div style="text-align: center; margin: 25px 0;">
                <a href="${baseUrl}/booking" 
                   style="display: inline-block; 
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          text-decoration: none; 
                          padding: 14px 28px; 
                          border-radius: 8px; 
                          font-weight: 600; 
                          font-size: 16px;">
                ${t('email_status_cta_button')}
              </a>
            </div>
          ` : ''}
          
          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
              ${t('email_status_footer_tagline')}
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0; line-height: 1.6;">
              ${t('email_status_footer_address')}<br>
              ${t('email_status_footer_contacts')}
            </p>
            <p style="color: #d1d5db; font-size: 11px; margin: 15px 0 0 0;">
              ${t('email_status_footer_note')}
            </p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Тестовая отправка email (для проверки настройки)
 */
export async function sendTestEmail(
  to: string,
  locale?: Locale
): Promise<{ ok: boolean; error?: string }> {
  try {
    const resolvedLocale = resolveLocale(locale);
    const t = (key: MessageKey) => translate(resolvedLocale, key);

    const resend = getResendClient();
    
    if (!resend) {
      return { ok: false, error: t('email_service_not_configured') };
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Salon Elen <onboarding@resend.dev>',
      to,
      subject: t('email_test_subject'),
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">${t('email_test_title')}</h1>
          <p>${t('email_test_body')}</p>
          <p style="color: #666; font-size: 14px;">${t('email_test_footer')}</p>
        </div>
      `,
    });

    if (result.error) {
      return { ok: false, error: result.error.message };
    }

    console.log(`✅ Test email sent | ID: ${result.data?.id}`);
    return { ok: true };
  } catch (error) {
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}



// // src/lib/email.ts
// import { AppointmentStatus } from '@prisma/client';

// /**
//  * Интерфейс данных для email уведомления
//  */
// interface AppointmentEmailData {
//   customerName: string;
//   email: string;
//   serviceName: string;
//   masterName: string;
//   startAt: Date;
//   endAt: Date;
//   status: AppointmentStatus;
//   previousStatus?: AppointmentStatus;
// }

// /**
//  * Отправка email уведомления клиенту о изменении статуса
//  */
// export async function sendStatusChangeEmail(
//   data: AppointmentEmailData
// ): Promise<{ ok: boolean; error?: string }> {
//   try {
//     // Формируем текст письма
//     const subject = getEmailSubject(data.status);
//     const body = getEmailBody(data);

//     // Здесь вы можете использовать любой email сервис:
//     // - Resend (рекомендуется)
//     // - SendGrid
//     // - AWS SES
//     // - Nodemailer
    
//     // Пример с Resend:
//     /*
//     import { Resend } from 'resend';
//     const resend = new Resend(process.env.RESEND_API_KEY);
    
//     await resend.emails.send({
//       from: 'Salon Elen <noreply@salon-elen.com>',
//       to: data.email,
//       subject,
//       html: body,
//     });
//     */

//     // Пример с Nodemailer (для начала):
//     const nodemailer = require('nodemailer');
    
//     const transporter = nodemailer.createTransporter({
//       host: process.env.SMTP_HOST || 'smtp.gmail.com',
//       port: Number(process.env.SMTP_PORT) || 587,
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.SMTP_FROM || '"Salon Elen" <noreply@salon-elen.com>',
//       to: data.email,
//       subject,
//       html: body,
//     });

//     console.log(`✅ Email sent to ${data.email} for status ${data.status}`);
//     return { ok: true };
//   } catch (error) {
//     console.error('❌ Email send error:', error);
//     return { 
//       ok: false, 
//       error: error instanceof Error ? error.message : 'Unknown error' 
//     };
//   }
// }

// /**
//  * Получить тему письма в зависимости от статуса
//  */
// function getEmailSubject(status: AppointmentStatus): string {
//   const subjects: Record<AppointmentStatus, string> = {
//     PENDING: '🔔 Новая запись - Ожидает подтверждения',
//     CONFIRMED: '✅ Запись подтверждена - Salon Elen',
//     DONE: '🎉 Спасибо за визит - Salon Elen',
//     CANCELED: '❌ Запись отменена - Salon Elen',
//   };
  
//   return subjects[status];
// }

// /**
//  * Получить HTML тело письма
//  */
// function getEmailBody(data: AppointmentEmailData): string {
//   const statusEmoji: Record<AppointmentStatus, string> = {
//     PENDING: '🔔',
//     CONFIRMED: '✅',
//     DONE: '🎉',
//     CANCELED: '❌',
//   };

//   const statusText: Record<AppointmentStatus, string> = {
//     PENDING: 'В ожидании подтверждения',
//     CONFIRMED: 'Подтверждена',
//     DONE: 'Выполнена',
//     CANCELED: 'Отменена',
//   };

//   const formatDateTime = (date: Date) => {
//     return new Intl.DateTimeFormat('ru-RU', {
//       day: '2-digit',
//       month: 'long',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     }).format(date);
//   };

//   // Персонализированное сообщение в зависимости от статуса
//   let message = '';
  
//   switch (data.status) {
//     case 'PENDING':
//       message = `
//         <p>Мы получили вашу заявку на запись. Наш администратор свяжется с вами в ближайшее время для подтверждения.</p>
//       `;
//       break;
    
//     case 'CONFIRMED':
//       message = `
//         <p>Отличные новости! Ваша запись подтверждена.</p>
//         <p>Ждём вас <strong>${formatDateTime(data.startAt)}</strong></p>
//         <p style="color: #16a34a;">
//           <strong>✨ Не забудьте прийти за 5 минут до начала.</strong>
//         </p>
//       `;
//       break;
    
//     case 'DONE':
//       message = `
//         <p>Спасибо, что выбрали Salon Elen! 💖</p>
//         <p>Надеемся, вам понравился результат. Будем рады видеть вас снова!</p>
//         <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
//           📅 <strong>Совет:</strong> Для поддержания результата рекомендуем записаться через 3-4 недели.
//         </p>
//       `;
//       break;
    
//     case 'CANCELED':
//       message = `
//         <p>К сожалению, ваша запись была отменена.</p>
//         <p>Если это произошло по ошибке или вы хотите записаться на другое время, свяжитесь с нами:</p>
//         <p>
//           📞 <strong>Телефон:</strong> +38 (000) 000-00-00<br>
//           💬 <strong>Telegram:</strong> @salon_elen
//         </p>
//       `;
//       break;
//   }

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Salon Elen - Уведомление</title>
//     </head>
//     <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
//       <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        
//         <!-- Header -->
//         <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
//           <h1 style="color: white; margin: 0; font-size: 28px;">
//             ${statusEmoji[data.status]} Salon Elen
//           </h1>
//           <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
//             Уведомление о записи
//           </p>
//         </div>
        
//         <!-- Content -->
//         <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
//           <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
//             Здравствуйте, <strong>${data.customerName}</strong>!
//           </p>
          
//           ${message}
          
//           <!-- Booking Details -->
//           <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
//             <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px;">
//               📋 Детали записи
//             </h3>
            
//             <table style="width: 100%; border-collapse: collapse;">
//               <tr>
//                 <td style="padding: 8px 0; color: #6b7280; width: 120px;">Статус:</td>
//                 <td style="padding: 8px 0; color: #111827; font-weight: 600;">
//                   ${statusEmoji[data.status]} ${statusText[data.status]}
//                 </td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px 0; color: #6b7280;">Услуга:</td>
//                 <td style="padding: 8px 0; color: #111827;">${data.serviceName}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px 0; color: #6b7280;">Мастер:</td>
//                 <td style="padding: 8px 0; color: #111827;">${data.masterName}</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px 0; color: #6b7280;">Дата и время:</td>
//                 <td style="padding: 8px 0; color: #111827;">${formatDateTime(data.startAt)}</td>
//               </tr>
//             </table>
//           </div>
          
//           <!-- CTA Button (for CONFIRMED status) -->
//           ${data.status === 'CONFIRMED' ? `
//             <div style="text-align: center; margin: 25px 0;">
//               <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://permanent-halle.de/'}/booking" 
//                  style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
//                         color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; 
//                         font-weight: 600; font-size: 16px;">
//                 📅 Записаться снова
//               </a>
//             </div>
//           ` : ''}
          
//           <!-- Footer -->
//           <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
//             <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
//               Salon Elen - Ваша красота, наша забота 💖
//             </p>
//             <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
//               ул. Примерная, 10, Киев<br>
//               📞 +38 (000) 000-00-00 | 📧 hello@salon-elen.com
//             </p>
//             <p style="color: #d1d5db; font-size: 11px; margin: 15px 0 0 0;">
//               Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.
//             </p>
//           </div>
          
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// }

// /**
//  * Отправка email администратору о новой записи
//  */
// export async function sendAdminNotification(
//   data: AppointmentEmailData
// ): Promise<{ ok: boolean; error?: string }> {
//   // Здесь можно отправить уведомление админам
//   // Например, в Telegram или на email
//   return { ok: true };
// }
