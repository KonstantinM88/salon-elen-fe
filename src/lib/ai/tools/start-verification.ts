// src/lib/ai/tools/start-verification.ts

import { prisma } from '@/lib/prisma';
import { generateOTP, saveOTP, type OTPMethod } from '@/lib/otp-store';
import { sendOTPEmail } from '@/lib/email-otp';
import type { Locale } from '@/i18n/locales';

interface Args {
  method: string;
  draftId: string;
  contact: string;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const maskedLocal =
    local.length <= 2 ? '***' : `${local[0]}***${local[local.length - 1]}`;
  const parts = domain.split('.');
  const maskedDomain =
    parts[0].length <= 2
      ? '***'
      : `${parts[0][0]}***`;
  return `${maskedLocal}@${maskedDomain}.${parts.slice(1).join('.')}`;
}

export async function startVerification(args: Args) {
  const { method, draftId, contact } = args;

  // Currently only email_otp is supported
  if (method !== 'email_otp') {
    return { ok: false, error: 'UNSUPPORTED_METHOD', message: `Method "${method}" not yet supported` };
  }

  // Verify draft exists and email matches
  const draft = await prisma.bookingDraft.findUnique({
    where: { id: draftId },
    select: { id: true, email: true, locale: true },
  });

  if (!draft) {
    return { ok: false, error: 'DRAFT_NOT_FOUND' };
  }

  if (draft.email !== contact) {
    return { ok: false, error: 'EMAIL_MISMATCH' };
  }

  // Generate and save OTP
  const code = generateOTP();
  saveOTP('email' as OTPMethod, contact, draftId, code, { ttlMinutes: 10 });

  console.log(`[AI start_verification] OTP for ${maskEmail(contact)}: ${code}`);

  // Send email
  const locale = (draft.locale || 'de') as Locale;
  const sendResult = await sendOTPEmail(contact, code, {
    expiryMinutes: 10,
    locale,
  });

  if (!sendResult.ok) {
    console.error(`[AI start_verification] Send failed: ${sendResult.error}`);
    return { ok: false, error: 'SEND_FAILED', message: 'Could not send verification email' };
  }

  return {
    ok: true,
    message: `Verification code sent to ${maskEmail(contact)}`,
    contactMasked: maskEmail(contact),
    expiresInMinutes: 10,
  };
}
