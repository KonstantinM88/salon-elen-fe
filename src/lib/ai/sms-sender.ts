// src/lib/ai/sms-sender.ts
// SMS abstraction for AI assistant.
// Picks the configured provider: ZADARMA (default) > MOBIZON > INFOBIP.

type SendResult = { ok: true } | { ok: false; error: string };

type SmsProvider = 'mobizon' | 'infobip' | 'zadarma';

function hasZadarmaConfig(): boolean {
  return Boolean(process.env.ZADARMA_API_KEY && process.env.ZADARMA_API_SECRET);
}

function detectProvider(): SmsProvider | null {
  // Explicit override
  const explicit = process.env.AI_SMS_PROVIDER?.toLowerCase();
  if (explicit === 'mobizon' || explicit === 'infobip' || explicit === 'zadarma') {
    return explicit;
  }

  // Auto-detect by configured keys
  if (hasZadarmaConfig()) return 'zadarma';
  if (process.env.MOBIZON_API_KEY) return 'mobizon';
  if (process.env.INFOBIP_API_KEY) return 'infobip';

  return null;
}

/**
 * Send an OTP code via SMS to the given phone number.
 */
export async function sendSmsOtp(
  phone: string,
  code: string,
): Promise<SendResult> {
  const provider = detectProvider();

  if (!provider) {
    console.warn(
      '[AI SMS] No SMS provider configured (set ZADARMA_API_KEY + ZADARMA_API_SECRET, or MOBIZON_API_KEY, or INFOBIP_API_KEY)',
    );
    return { ok: false, error: 'SMS_NOT_CONFIGURED' };
  }

  const message = `Salon Elen: Ihr Bestätigungscode ist ${code}. Gültig für 10 Minuten.`;

  try {
    switch (provider) {
      case 'mobizon': {
        const { sendPinSms } = await import('@/lib/mobizon-sms');
        const result = await sendPinSms(phone, code);
        if (result.success) return { ok: true };
        return { ok: false, error: 'error' in result ? String(result.error) : 'MOBIZON_ERROR' };
      }

      case 'infobip': {
        const { sendPinSms } = await import('@/lib/infobip-sms');
        const result = await sendPinSms(phone, code);
        if (result.success) return { ok: true };
        return { ok: false, error: 'error' in result ? String(result.error) : 'INFOBIP_ERROR' };
      }

      case 'zadarma': {
        const { sendPinSms } = await import('@/lib/zadarma-sms');
        const result = await sendPinSms(phone, code);
        if (result.success) return { ok: true };
        return { ok: false, error: 'error' in result ? String(result.error) : 'ZADARMA_ERROR' };
      }

      default:
        return { ok: false, error: 'UNKNOWN_PROVIDER' };
    }
  } catch (err) {
    console.error(`[AI SMS] ${provider} send failed:`, err);
    return { ok: false, error: 'SMS_SEND_FAILED' };
  }
}

/**
 * Check if SMS sending is available (at least one provider configured).
 */
export function isSmsAvailable(): boolean {
  return detectProvider() !== null;
}
