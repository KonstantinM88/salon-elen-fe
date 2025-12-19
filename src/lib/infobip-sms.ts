// lib/infobip-sms.ts
/**
 * Infobip Simple SMS API integration
 * 
 * Setup:
 * 1. Add to .env:
 *    INFOBIP_API_KEY=ed********************
 *    INFOBIP_BASE_URL=https://************* 
 * */


const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL || 'https://gr6zk8.api.infobip.com';

if (!INFOBIP_API_KEY) {
  console.warn('[Infobip SMS] Missing API key. SMS will not work.');
}

interface SendSmsResponse {
  messages: Array<{
    messageId: string;
    status: {
      groupId: number;
      groupName: string;
      id: number;
      name: string;
      description: string;
    };
    to: string;
  }>;
}

/**
 * Генерирует 4-значный PIN код
 */
export function generatePinCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Отправляет SMS с PIN кодом через Infobip SMS API
 */
export async function sendPinSms(
  phoneNumber: string,
  pin: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  if (!INFOBIP_API_KEY) {
    console.error('[Infobip SMS] API not configured');
    return { success: false, error: 'Infobip SMS not configured' };
  }

  try {
    console.log(`[Infobip SMS] Sending PIN to ${phoneNumber}`);

    const url = `${INFOBIP_BASE_URL}/sms/2/text/advanced`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            from: 'Salon Elen',
            destinations: [
              {
                to: phoneNumber,
              },
            ],
            text: `Ваш PIN код для Salon Elen: ${pin}\n\nКод действителен 10 минут.\n\nЕсли вы не запрашивали этот код, проигнорируйте сообщение.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Infobip SMS] Error response:', errorData);
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }

    const data: SendSmsResponse = await response.json();
    
    if (!data.messages || data.messages.length === 0) {
      throw new Error('No messages in response');
    }

    const message = data.messages[0];
    console.log('[Infobip SMS] ✅ SMS sent:', message.messageId);
    console.log('[Infobip SMS] Status:', message.status.name);

    return {
      success: true,
      messageId: message.messageId,
    };
  } catch (error) {
    console.error('[Infobip SMS] Error sending SMS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
}

/**
 * Форматирует номер телефона для Infobip
 * Добавляет + если отсутствует
 */
export function formatPhoneForInfobip(phone: string): string {
  // Удаляем все пробелы и специальные символы кроме +
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Добавляем + если отсутствует
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

/**
 * Валидация номера телефона
 * Проверяет формат E.164
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  const formatted = formatPhoneForInfobip(phone);
  
  // E.164 формат: +[country code][number]
  // Пример: +4917789951064
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  
  if (!e164Regex.test(formatted)) {
    return {
      valid: false,
      error: 'Invalid phone number format. Use E.164 format: +[country code][number]',
    };
  }
  
  return { valid: true };
}