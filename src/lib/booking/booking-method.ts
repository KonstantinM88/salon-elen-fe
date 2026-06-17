export const BOOKING_METHOD = {
  website: "website",
  websiteEmail: "website_email",
  websiteSms: "website_sms",
  websiteTelegram: "website_telegram",
  websiteGoogle: "website_google",
  aiEmailOtp: "ai_email_otp",
  aiSmsOtp: "ai_sms_otp",
  aiTelegramOtp: "ai_telegram_otp",
  telegramBot: "telegram_bot",
  adminQuick: "admin_quick",
  api: "api",
} as const;

export type BookingMethod = (typeof BOOKING_METHOD)[keyof typeof BOOKING_METHOD];

const BOOKING_METHOD_LABELS_RU: Record<string, string> = {
  [BOOKING_METHOD.website]: "Сайт",
  [BOOKING_METHOD.websiteEmail]: "Сайт / Email",
  [BOOKING_METHOD.websiteSms]: "Сайт / SMS",
  [BOOKING_METHOD.websiteTelegram]: "Сайт / Telegram",
  [BOOKING_METHOD.websiteGoogle]: "Сайт / Google",
  [BOOKING_METHOD.aiEmailOtp]: "AI ассистент / Email",
  [BOOKING_METHOD.aiSmsOtp]: "AI ассистент / SMS",
  [BOOKING_METHOD.aiTelegramOtp]: "AI ассистент / Telegram",
  [BOOKING_METHOD.telegramBot]: "Telegram бот",
  [BOOKING_METHOD.adminQuick]: "Админ / быстрая запись",
  [BOOKING_METHOD.api]: "API",
};

export function bookingMethodForAiOtp(method: string): BookingMethod {
  switch (method) {
    case "sms_otp":
      return BOOKING_METHOD.aiSmsOtp;
    case "telegram_otp":
      return BOOKING_METHOD.aiTelegramOtp;
    case "email_otp":
    default:
      return BOOKING_METHOD.aiEmailOtp;
  }
}

export function getBookingMethodLabel(method?: string | null): string {
  if (!method) return BOOKING_METHOD_LABELS_RU[BOOKING_METHOD.website];
  return BOOKING_METHOD_LABELS_RU[method] ?? method;
}
