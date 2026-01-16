// src/lib/mobizon-sms.ts
/**
 * Mobizon SMS API integration (transactional/OTP).
 *
 * Docs:
 * - API entry point: https://api.mobizon.gmbh/service/
 * - Send single SMS: https://api.mobizon.gmbh/service/Message/SendSmsMessage
 *
 * Setup (.env):
 *   MOBIZON_API_KEY=your_api_key
 *
 * Optional (.env):
 *   MOBIZON_HOST=api.mobizon.gmbh
 *   MOBIZON_SENDER_ID=YourRegisteredAlpha  # only if you registered Sender ID
 */

const MOBIZON_API_KEY = process.env.MOBIZON_API_KEY;
const MOBIZON_HOST = process.env.MOBIZON_HOST || 'api.mobizon.gmbh';
const MOBIZON_SENDER_ID = process.env.MOBIZON_SENDER_ID; // optional

if (!MOBIZON_API_KEY) {
  console.warn('[Mobizon SMS] Missing MOBIZON_API_KEY. SMS will not work.');
}

export type SendSmsResult =
  | { success: true; messageId?: number; campaignId?: number; status?: number }
  | { success: false; error: string; code?: number; details?: unknown };

type MobizonSendSmsResponse = {
  code: number;
  message: string;
  data?: {
    campaignId?: number;
    messageId?: number;
    status?: number;
  };
};

/**
 * Generates a 4-digit PIN.
 */
export function generatePinCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Formats phone into E.164-ish: keeps digits and leading +.
 */
export function formatPhoneForMobizon(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (!cleaned.startsWith('+')) cleaned = `+${cleaned}`;
  return cleaned;
}

/**
 * Mobizon "recipient" parameter must contain digits only.
 * If the phone contains '+', it should be removed.
 */
export function toMobizonRecipient(phone: string): string {
  const formatted = formatPhoneForMobizon(phone);
  return formatted.replace(/^\+/, '').replace(/\D/g, '');
}

/**
 * Validates phone number (E.164).
 */
export function validatePhoneNumber(
  phone: string
): { valid: boolean; error?: string } {
  const formatted = formatPhoneForMobizon(phone);
  const e164Regex = /^\+[1-9]\d{1,14}$/;

  if (!e164Regex.test(formatted)) {
    return {
      valid: false,
      error:
        'Invalid phone number format. Use E.164 format: +[country code][number]',
    };
  }

  return { valid: true };
}

/**
 * Sends OTP/PIN via Mobizon.
 *
 * Note:
 * - You do NOT need to buy a virtual number.
 * - If "from" is not specified, Mobizon will use your default Sender ID,
 *   or a shared/system Sender ID for the route (if available).
 */
export async function sendPinSms(
  phoneNumber: string,
  pin: string
): Promise<SendSmsResult> {
  if (!MOBIZON_API_KEY) {
    return { success: false, error: 'Mobizon SMS not configured' };
  }

  const recipient = toMobizonRecipient(phoneNumber);

  // Keep message short and clear (OTP). German + Russian as fallback.
  const text = `Ihr Bestaetigungscode: ${pin}. Gueltig 10 Min.\n\nKod: ${pin} (10 min).`;

  const url = `https://${MOBIZON_HOST}/service/message/sendSmsMessage?output=json&api=v1&apiKey=${encodeURIComponent(
    MOBIZON_API_KEY
  )}`;

  const body = new URLSearchParams();
  body.set('recipient', recipient);
  body.set('text', text);

  // Only set Sender ID if user registered it. Otherwise, skip it completely.
  if (MOBIZON_SENDER_ID && MOBIZON_SENDER_ID.trim()) {
    body.set('from', MOBIZON_SENDER_ID.trim());
  }

  // Optional: validity in minutes (docs allow up to 3 days). For OTP keep short.
  body.set('params[validity]', '10');

  try {
    console.log(`[Mobizon SMS] Sending PIN to ${phoneNumber}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const raw = await response.text();

    if (!response.ok) {
      console.error('[Mobizon SMS] HTTP error:', response.status, raw);
      return {
        success: false,
        error: `HTTP ${response.status}: ${raw}`,
      };
    }

    let parsed: MobizonSendSmsResponse;
    try {
      parsed = JSON.parse(raw) as MobizonSendSmsResponse;
    } catch {
      return {
        success: false,
        error: 'Failed to parse Mobizon response as JSON',
        details: raw,
      };
    }

    if (parsed.code !== 0) {
      return {
        success: false,
        error: parsed.message || 'Mobizon API error',
        code: parsed.code,
        details: parsed,
      };
    }

    const messageId = parsed.data?.messageId;
    console.log('[Mobizon SMS] SMS accepted. messageId:', messageId);

    return {
      success: true,
      messageId: parsed.data?.messageId,
      campaignId: parsed.data?.campaignId,
      status: parsed.data?.status,
    };
  } catch (err) {
    console.error('[Mobizon SMS] Error sending SMS:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send SMS',
    };
  }
}
