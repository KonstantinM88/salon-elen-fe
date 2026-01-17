// src/lib/email-otp.ts
/**
 * Утилита для отправки OTP кодов через Resend
 */

import { Resend } from 'resend';

/**
 * Получить экземпляр Resend
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

/**
 * Отправить OTP код на email через Resend
 */
export async function sendOTPEmail(
  email: string,
  code: string,
  options?: {
    expiryMinutes?: number;
    subject?: string;
  }
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  try {
    const resend = getResendClient();
    
    if (!resend) {
      console.warn('⚠️ Resend not configured, skipping email');
      // В DEV режиме просто логируем код
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] OTP Code for ${email}: ${code}`);
        return { ok: true, messageId: 'dev-mode' };
      }
      return { ok: false, error: 'Email service not configured' };
    }

    const expiryMinutes = options?.expiryMinutes || 10;
    const subject = options?.subject || 'Код подтверждения - Salon Elen';

    // HTML шаблон письма
    const html = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Код подтверждения</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
              🔐 Salon Elen
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Подтверждение записи
            </p>
          </div>
          
          <!-- Content -->
          <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px; line-height: 1.6;">
              Здравствуйте!
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 30px; line-height: 1.6;">
              Ваш код подтверждения для завершения записи:
            </p>
            
            <!-- OTP Code -->
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #f3f4f6 100%); 
                        border: 3px solid #667eea; 
                        border-radius: 12px; 
                        padding: 30px; 
                        text-align: center; 
                        margin: 30px 0;">
              <div style="font-size: 48px; 
                          font-weight: 700; 
                          letter-spacing: 12px; 
                          color: #667eea;
                          font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            
            <!-- Warning Box -->
            <div style="background: #fef3c7; 
                        border-left: 4px solid #f59e0b; 
                        padding: 15px; 
                        border-radius: 8px; 
                        margin: 25px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                <strong>⏱️ Важно:</strong> Код действителен в течение <strong>${expiryMinutes} минут</strong>.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 25px; line-height: 1.6;">
              Если вы не оформляли запись в Salon Elen, просто проигнорируйте это письмо.
            </p>
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Salon Elen - Ваша красота, наша забота 💖
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0;">
                📧 booking@news.permanent-halle.de
              </p>
              <p style="color: #d1d5db; font-size: 11px; margin: 15px 0 0 0;">
                Это автоматическое письмо. Пожалуйста, не отвечайте на него.
              </p>
            </div>
            
          </div>
        </div>
      </body>
      </html>
    `;

    // Отправляем через Resend
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Salon Elen <onboarding@resend.dev>',
      to: email,
      subject,
      html,
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      return { ok: false, error: result.error.message };
    }

    console.log(`✅ OTP email sent to ${email} | ID: ${result.data?.id}`);
    return { ok: true, messageId: result.data?.id };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Отправить OTP код с кастомным HTML шаблоном
 */
export async function sendCustomOTPEmail(
  email: string,
  code: string,
  htmlTemplate: string,
  subject: string
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  try {
    const resend = getResendClient();
    
    if (!resend) {
      console.warn('⚠️ Resend not configured, skipping email');
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] OTP Code for ${email}: ${code}`);
        return { ok: true, messageId: 'dev-mode' };
      }
      return { ok: false, error: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Salon Elen <onboarding@resend.dev>',
      to: email,
      subject,
      html: htmlTemplate,
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      return { ok: false, error: result.error.message };
    }

    console.log(`✅ Custom OTP email sent to ${email} | ID: ${result.data?.id}`);
    return { ok: true, messageId: result.data?.id };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}