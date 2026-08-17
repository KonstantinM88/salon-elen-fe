export const PROMOTION_PERCENT_OPTIONS = [5, 10, 15, 20, 25, 30] as const;

export type PromotionPercent = (typeof PROMOTION_PERCENT_OPTIONS)[number];

export function isPromotionPercent(value: number): value is PromotionPercent {
  return PROMOTION_PERCENT_OPTIONS.includes(value as PromotionPercent);
}

const PROMOTION_DATE_LOCALES: Record<string, string> = {
  de: "de-DE",
  en: "en-GB",
  ru: "ru-RU",
};

function formatPromotionDisplayDate(value: string, locale: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat(PROMOTION_DATE_LOCALES[locale] ?? "de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatPromotionAppointmentPeriod(
  from: string,
  to: string,
  locale: string,
): string {
  const label =
    locale === "ru"
      ? "Для визитов"
      : locale === "en"
        ? "For appointments"
        : "Für Termine";

  return `${label}: ${formatPromotionDisplayDate(from, locale)} - ${formatPromotionDisplayDate(to, locale)}`;
}
