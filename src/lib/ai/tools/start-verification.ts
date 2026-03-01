// src/lib/ai/tools/start-verification.ts

import { prisma } from '@/lib/prisma';
import { generateOTP, saveOTP, type OTPMethod } from '@/lib/otp-store';
import { sendOTPEmail } from '@/lib/email-otp';
import { sendSmsOtp, isSmsAvailable } from '@/lib/ai/sms-sender';
import type { Locale } from '@/i18n/locales';

interface Args {
  method: string;
  draftId: string;
  contact: string;
}

type VerificationResult =
  | { ok: true; message: string; contactMasked: string; expiresInMinutes: number }
  | { ok: false; error: string; message?: string };

// ─── Masking ────────────────────────────────────────────────────

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal =
    local.length <= 2 ? '***' : `${local[0]}***${local[local.length - 1]}`;
  const parts = domain.split('.');
  const maskedDomain =
    parts[0].length <= 2 ? '***' : `${parts[0][0]}***`;
  return `${maskedLocal}@${maskedDomain}.${parts.slice(1).join('.')}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return '***';
  return `${phone.slice(0, 4)}***${phone.slice(-2)}`;
}

function normalizePhoneForVerification(phone: string): string {
  const trimmed = String(phone || '').trim();
  if (!trimmed) return '';

  const startsWithPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (!digitsOnly) return '';
  return startsWithPlus ? `+${digitsOnly}` : digitsOnly;
}

function validateSmsPhoneFormat(phone: string): { ok: true; normalized: string } | { ok: false } {
  const normalized = normalizePhoneForVerification(phone);
  if (!normalized.startsWith('+')) return { ok: false };

  // We intentionally allow only DE/UA families in AI flow.
  if (!(normalized.startsWith('+49') || normalized.startsWith('+38'))) {
    return { ok: false };
  }

  const digits = normalized.replace(/\D/g, '');
  if (digits.length < 12 || digits.length > 14) {
    return { ok: false };
  }

  // E.164-like sanity (already normalized).
  if (!/^\+[1-9]\d{7,13}$/.test(normalized)) {
    return { ok: false };
  }

  return { ok: true, normalized };
}

// ─── Methods ────────────────────────────────────────────────────

async function handleEmailOtp(
  draft: { id: string; email: string; locale: string | null },
  contact: string,
): Promise<VerificationResult> {
  if (draft.email !== contact) {
    return { ok: false, error: 'EMAIL_MISMATCH' };
  }

  const code = generateOTP();
  saveOTP('email' as OTPMethod, contact, draft.id, code, { ttlMinutes: 10 });

  console.log(`[AI start_verification] email OTP for ${maskEmail(contact)}: ${code}`);

  const locale = (draft.locale || 'de') as Locale;
  const sendResult = await sendOTPEmail(contact, code, {
    expiryMinutes: 10,
    locale,
  });

  if (!sendResult.ok) {
    console.error(`[AI start_verification] Email send failed: ${sendResult.error}`);
    return { ok: false, error: 'SEND_FAILED', message: 'Could not send verification email' };
  }

  return {
    ok: true,
    message: `Verification code sent to ${maskEmail(contact)}`,
    contactMasked: maskEmail(contact),
    expiresInMinutes: 10,
  };
}

async function handleSmsOtp(
  draft: { id: string; phone: string | null; locale: string | null },
  contact: string,
): Promise<VerificationResult> {
  if (!isSmsAvailable()) {
    return { ok: false, error: 'SMS_NOT_CONFIGURED', message: 'SMS provider not configured' };
  }

  // Use the phone from draft, or the provided contact
  const rawPhone = contact || draft.phone;
  if (!rawPhone) {
    return { ok: false, error: 'NO_PHONE', message: 'No phone number available' };
  }

  const phoneValidation = validateSmsPhoneFormat(rawPhone);
  if (!phoneValidation.ok) {
    return {
      ok: false,
      error: 'PHONE_FORMAT_INVALID',
      message: 'Phone must be in +49... or +38... format',
    };
  }
  const phone = phoneValidation.normalized;

  const code = generateOTP();

  console.log(`[AI start_verification] SMS OTP for ${maskPhone(phone)}: ${code}`);

  const sendResult = await sendSmsOtp(phone, code);

  if (!sendResult.ok) {
    console.error(`[AI start_verification] SMS send failed: ${sendResult.error}`);
    const err = String(sendResult.error || '').toLowerCase();
    if (
      err.includes('invalid') ||
      err.includes('format') ||
      err.includes('e.164') ||
      err.includes('falsche') ||
      err.includes('wrong')
    ) {
      return {
        ok: false,
        error: 'PHONE_FORMAT_INVALID',
        message: 'Phone must be in +49... or +38... format',
      };
    }
    return { ok: false, error: 'SEND_FAILED', message: 'Could not send SMS' };
  }

  saveOTP('sms' as OTPMethod, phone, draft.id, code, { ttlMinutes: 10 });

  return {
    ok: true,
    message: `Verification code sent via SMS to ${maskPhone(phone)}`,
    contactMasked: maskPhone(phone),
    expiresInMinutes: 10,
  };
}

async function handleTelegramOtp(
  draft: { id: string; phone: string | null; locale: string | null },
  contact: string,
): Promise<VerificationResult> {
  const phone = contact || draft.phone;
  if (!phone) {
    return { ok: false, error: 'NO_PHONE', message: 'No phone number for Telegram lookup' };
  }

  // Check if user is registered with our Telegram bot
  const telegramUser = await prisma.telegramUser.findUnique({
    where: { phone },
  });

  if (!telegramUser) {
    return {
      ok: false,
      error: 'TELEGRAM_NOT_REGISTERED',
      message: `Phone ${maskPhone(phone)} is not registered with our Telegram bot. Please use email or SMS verification instead.`,
    };
  }

  const code = generateOTP();
  saveOTP('telegram' as OTPMethod, phone, draft.id, code, {
    ttlMinutes: 10,
    telegramUserId: Number(telegramUser.telegramChatId),
  });

  console.log(`[AI start_verification] Telegram OTP for ${maskPhone(phone)}: ${code}`);

  const { sendTelegramCode } = await import('@/lib/telegram-bot');
  const locale = (draft.locale || 'de') as Locale;
  const sent = await sendTelegramCode(phone, code, locale);

  if (!sent) {
    console.error(`[AI start_verification] Telegram send failed for ${maskPhone(phone)}`);
    return { ok: false, error: 'SEND_FAILED', message: 'Could not send Telegram message' };
  }

  return {
    ok: true,
    message: `Verification code sent via Telegram to ${maskPhone(phone)}`,
    contactMasked: maskPhone(phone),
    expiresInMinutes: 10,
  };
}

// ─── Main ───────────────────────────────────────────────────────

export async function startVerification(args: Args): Promise<VerificationResult> {
  const { method, draftId, contact } = args;

  // Verify draft exists
  const draft = await prisma.bookingDraft.findUnique({
    where: { id: draftId },
    select: { id: true, email: true, phone: true, locale: true },
  });

  if (!draft) {
    return { ok: false, error: 'DRAFT_NOT_FOUND' };
  }

  switch (method) {
    case 'email_otp':
      return handleEmailOtp(
        { id: draft.id, email: draft.email, locale: draft.locale ?? null },
        contact,
      );

    case 'sms_otp':
      return handleSmsOtp(
        { id: draft.id, phone: draft.phone, locale: draft.locale ?? null },
        contact,
      );

    case 'telegram_otp':
      return handleTelegramOtp(
        { id: draft.id, phone: draft.phone, locale: draft.locale ?? null },
        contact,
      );

    default:
      return {
        ok: false,
        error: 'UNSUPPORTED_METHOD',
        message: `Method "${method}" not supported. Use email_otp, sms_otp, or telegram_otp.`,
      };
  }
}



// // src/lib/ai/tools/start-verification.ts

// import { prisma } from '@/lib/prisma';
// import { generateOTP, saveOTP, type OTPMethod } from '@/lib/otp-store';
// import { sendOTPEmail } from '@/lib/email-otp';
// import type { Locale } from '@/i18n/locales';

// interface Args {
//   method: string;
//   draftId: string;
//   contact: string;
// }

// function maskEmail(email: string): string {
//   const [local, domain] = email.split('@');
//   if (!domain) return '***';
//   const maskedLocal =
//     local.length <= 2 ? '***' : `${local[0]}***${local[local.length - 1]}`;
//   const parts = domain.split('.');
//   const maskedDomain =
//     parts[0].length <= 2
//       ? '***'
//       : `${parts[0][0]}***`;
//   return `${maskedLocal}@${maskedDomain}.${parts.slice(1).join('.')}`;
// }

// export async function startVerification(args: Args) {
//   const { method, draftId, contact } = args;

//   // Currently only email_otp is supported
//   if (method !== 'email_otp') {
//     return { ok: false, error: 'UNSUPPORTED_METHOD', message: `Method "${method}" not yet supported` };
//   }

//   // Verify draft exists and email matches
//   const draft = await prisma.bookingDraft.findUnique({
//     where: { id: draftId },
//     select: { id: true, email: true, locale: true },
//   });

//   if (!draft) {
//     return { ok: false, error: 'DRAFT_NOT_FOUND' };
//   }

//   if (draft.email !== contact) {
//     return { ok: false, error: 'EMAIL_MISMATCH' };
//   }

//   // Generate and save OTP
//   const code = generateOTP();
//   saveOTP('email' as OTPMethod, contact, draftId, code, { ttlMinutes: 10 });

//   console.log(`[AI start_verification] OTP for ${maskEmail(contact)}: ${code}`);

//   // Send email
//   const locale = (draft.locale || 'de') as Locale;
//   const sendResult = await sendOTPEmail(contact, code, {
//     expiryMinutes: 10,
//     locale,
//   });

//   if (!sendResult.ok) {
//     console.error(`[AI start_verification] Send failed: ${sendResult.error}`);
//     return {
//       ok: false,
//       error: 'SEND_FAILED',
//       message: sendResult.error || 'Could not send verification email',
//     };
//   }

//   if (sendResult.warning) {
//     console.warn(`[AI start_verification] Warning: ${sendResult.warning}`);
//   }

//   return {
//     ok: true,
//     message: `Verification code sent to ${maskEmail(contact)}`,
//     contactMasked: maskEmail(contact),
//     expiresInMinutes: 10,
//     messageId: sendResult.messageId,
//     warning: sendResult.warning,
//   };
// }
