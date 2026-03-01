// src/lib/ai/verification-choice.ts
// Helper functions for verification method selection UI in AI chat.

import { isSmsAvailable } from '@/lib/ai/sms-sender';

type Locale = 'de' | 'ru' | 'en';

interface VerificationOptions {
  hasEmail: boolean;
  hasPhone: boolean;
}

export type RegistrationMethodChoice =
  | 'google_oauth'
  | 'email_otp'
  | 'sms_otp'
  | 'telegram_otp';

/**
 * Build the clickable registration method choice message.
 * This is shown right after slot reservation, before contact collection.
 */
export function buildRegistrationMethodChoiceText(locale: Locale): string {
  const header =
    locale === 'ru'
      ? 'Слот забронирован на 5 минут. Выберите способ регистрации и подтверждения:'
      : locale === 'en'
        ? 'Your slot is reserved for 5 minutes. Choose registration and verification method:'
        : 'Ihr Slot ist für 5 Minuten reserviert. Bitte wählen Sie die Registrierungs- und Verifizierungsmethode:';

  const options: string[] = [];

  const googleLabel =
    locale === 'ru'
      ? '🔐 Google'
      : locale === 'en'
        ? '🔐 Google'
        : '🔐 Google';
  options.push(`[option] ${googleLabel} [/option]`);

  const telegramLabel =
    locale === 'ru'
      ? '💬 Telegram'
      : locale === 'en'
        ? '💬 Telegram'
        : '💬 Telegram';
  options.push(`[option] ${telegramLabel} [/option]`);

  if (isSmsAvailable()) {
    const smsLabel =
      locale === 'ru'
        ? '📱 SMS'
        : locale === 'en'
          ? '📱 SMS'
          : '📱 SMS';
    options.push(`[option] ${smsLabel} [/option]`);
  }

  const emailLabel =
    locale === 'ru'
      ? '📧 Email'
      : locale === 'en'
        ? '📧 Email'
        : '📧 E-Mail';
  options.push(`[option] ${emailLabel} [/option]`);

  return `${header}\n\n${options.join('\n')}`;
}

/**
 * Build the clickable verification method choice message.
 * Shows available methods based on what contact info the user provided.
 */
export function buildVerificationMethodChoiceText(
  locale: Locale,
  options: VerificationOptions,
): string {
  const header =
    locale === 'ru'
      ? 'Данные сохранены! Выберите способ получения кода подтверждения:'
      : locale === 'en'
        ? 'Details saved! Please choose how to receive your verification code:'
        : 'Daten gespeichert! Bitte wählen Sie, wie Sie den Bestätigungscode erhalten möchten:';

  const buttons: string[] = [];

  if (options.hasEmail) {
    const label =
      locale === 'ru'
        ? '📧 Код на Email'
        : locale === 'en'
          ? '📧 Code via Email'
          : '📧 Code per E-Mail';
    buttons.push(`[option] ${label} [/option]`);
  }

  if (options.hasPhone && isSmsAvailable()) {
    const label =
      locale === 'ru'
        ? '📱 Код по SMS'
        : locale === 'en'
          ? '📱 Code via SMS'
          : '📱 Code per SMS';
    buttons.push(`[option] ${label} [/option]`);
  }

  if (options.hasPhone) {
    const label =
      locale === 'ru'
        ? '💬 Код в Telegram'
        : locale === 'en'
          ? '💬 Code via Telegram'
          : '💬 Code per Telegram';
    buttons.push(`[option] ${label} [/option]`);
  }

  // Fallback: if no buttons (shouldn't happen), show email only
  if (buttons.length === 0) {
    const fallbackLabel =
      locale === 'ru'
        ? '📧 Код на Email'
        : locale === 'en'
          ? '📧 Code via Email'
          : '📧 Code per E-Mail';
    buttons.push(`[option] ${fallbackLabel} [/option]`);
  }

  return `${header}\n\n${buttons.join('\n')}`;
}

type VerificationMethod = 'email_otp' | 'sms_otp' | 'telegram_otp';

const EMAIL_PATTERNS = [
  'код на email',
  'code via email',
  'code per e-mail',
  'email',
  'e-mail',
  'почта',
  'почту',
  'имейл',
];

const SMS_PATTERNS = [
  'код по sms',
  'code via sms',
  'code per sms',
  'sms',
  'смс',
];

const TELEGRAM_PATTERNS = [
  'код в telegram',
  'code via telegram',
  'code per telegram',
  'telegram',
  'телеграм',
  'телеграмм',
  'тг',
];

const GOOGLE_PATTERNS = ['google', 'гугл', 'гугле', 'гуглe'];

/**
 * Detect method choice from the "registration method" stage.
 * This stage may include Google.
 */
export function detectRegistrationMethodChoice(text: string): RegistrationMethodChoice | null {
  const normalized = text
    .replace(
      /^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F]+\s*/u,
      '',
    )
    .toLowerCase()
    .trim();

  if (!normalized) return null;

  for (const pattern of GOOGLE_PATTERNS) {
    if (normalized.includes(pattern)) return 'google_oauth';
  }

  for (const pattern of TELEGRAM_PATTERNS) {
    if (normalized.includes(pattern)) return 'telegram_otp';
  }

  for (const pattern of SMS_PATTERNS) {
    if (normalized.includes(pattern)) return 'sms_otp';
  }

  for (const pattern of EMAIL_PATTERNS) {
    if (normalized.includes(pattern)) return 'email_otp';
  }

  return null;
}

/**
 * Detect if the user's message is selecting a verification method.
 * Returns the method if detected, null otherwise.
 */
export function detectVerificationMethodChoice(text: string): VerificationMethod | null {
  const normalized = text
    .replace(
      /^[\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\uFE0F]+\s*/u,
      '',
    )
    .toLowerCase()
    .trim();

  if (!normalized) return null;

  // Check Telegram first (avoid "telegram" matching after "email" check)
  for (const pattern of TELEGRAM_PATTERNS) {
    if (normalized.includes(pattern)) return 'telegram_otp';
  }

  for (const SMS_PATTERN of SMS_PATTERNS) {
    if (normalized.includes(SMS_PATTERN)) return 'sms_otp';
  }

  for (const pattern of EMAIL_PATTERNS) {
    if (normalized.includes(pattern)) return 'email_otp';
  }

  return null;
}

/**
 * Get the contact string to use for the given verification method.
 */
export function getContactForMethod(
  method: VerificationMethod,
  email: string | null | undefined,
  phone: string | null | undefined,
): string | null {
  switch (method) {
    case 'email_otp':
      return email || null;
    case 'sms_otp':
    case 'telegram_otp':
      return phone || null;
  }
}
