import Link from "next/link";
import { ArrowRight, CalendarDays, Tag } from "lucide-react";

import type { SeoLocale } from "@/lib/seo-locale";
import { ORG_TZ } from "@/lib/orgTime";
import type {
  PromotionAnnouncement,
  SerializedPromotionAnnouncement,
} from "@/lib/promotions";
import styles from "./PromotionTicker.module.css";

type PromotionTickerProps = {
  locale: SeoLocale;
  promotions: readonly (
    | PromotionAnnouncement
    | SerializedPromotionAnnouncement
  )[];
};

const COPY: Record<
  SeoLocale,
  {
    label: string;
    period: string;
    cta: string;
    ariaPrefix: string;
  }
> = {
  de: {
    label: "Aktionen",
    period: "Aktionszeitraum",
    cta: "Preise ansehen",
    ariaPrefix: "Aktuelle und kommende Aktionen",
  },
  ru: {
    label: "Акции",
    period: "Период акции",
    cta: "Смотреть цены",
    ariaPrefix: "Текущие и предстоящие акции",
  },
  en: {
    label: "Offers",
    period: "Offer period",
    cta: "View prices",
    ariaPrefix: "Current and upcoming offers",
  },
};

const INTL_LOCALE: Record<SeoLocale, string> = {
  de: "de-DE",
  ru: "ru-RU",
  en: "en-GB",
};

function formatDate(date: Date | string, locale: SeoLocale): string {
  const normalizedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(normalizedDate.getTime())) return "";

  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: ORG_TZ,
  }).format(normalizedDate);
}

function localeHref(path: string, locale: SeoLocale): string {
  return locale === "de" ? path : `${path}?lang=${locale}`;
}

export default function PromotionTicker({
  locale,
  promotions,
}: PromotionTickerProps) {
  if (promotions.length === 0) return null;

  const t = COPY[locale];
  const repetitions = Math.max(1, Math.ceil(8 / promotions.length));
  const visualItems = Array.from({ length: repetitions }, () => promotions).flat();
  const ariaLabel = `${t.ariaPrefix}: ${promotions
    .map(
      (promotion) =>
        `${promotion.title}, ${promotion.percent}%, ${t.period} ${formatDate(
          promotion.from,
          locale,
        )} - ${formatDate(promotion.to, locale)}`,
    )
    .join("; ")}. ${t.cta}.`;

  const sequence = (sequenceKey: string) => (
    <span className={styles.sequence} aria-hidden="true">
      {visualItems.map((promotion, index) => (
        <span className={styles.item} key={`${sequenceKey}-${promotion.id}-${index}`}>
          <strong className={styles.discount}>-{promotion.percent}%</strong>
          <span className={styles.title}>{promotion.title}</span>
          <span className={styles.period}>
            <CalendarDays aria-hidden="true" />
            {formatDate(promotion.from, locale)} - {formatDate(promotion.to, locale)}
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <aside className={styles.shell} aria-label={t.ariaPrefix}>
      <Link
        href={localeHref("/prices", locale)}
        className={styles.link}
        aria-label={ariaLabel}
      >
        <span className={styles.badge} aria-hidden="true">
          <span className={styles.badgeIcon}>
            <Tag />
          </span>
          <span className={styles.badgeText}>{t.label}</span>
        </span>

        <span className={styles.viewport} aria-hidden="true">
          <span className={styles.track}>
            {sequence("primary")}
            {sequence("duplicate")}
          </span>
        </span>

        <span className={styles.cta} aria-hidden="true">
          {t.cta}
          <ArrowRight />
        </span>
      </Link>
    </aside>
  );
}
