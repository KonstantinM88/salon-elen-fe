export interface LocalCompetitorProfile {
  name: string;
  address: string;
  website: string;
  focus: readonly string[];
}

export const LOCAL_COMPETITOR_DATA_VERIFIED_AT = "2026-08-14";

/**
 * Public local-market reference set. This is not a Google Maps ranking and
 * does not contain inferred ratings, traffic, prices, or quality claims.
 */
export const LOCAL_COMPETITOR_PROFILES: readonly LocalCompetitorProfile[] = [
  {
    name: "Penewlope by Iwa Penewa",
    address: "Richard-Wagner-Straße 52, 06114 Halle (Saale)",
    website: "https://penewlope.de/",
    focus: ["Permanent Make-up", "Hautanalyse", "Aqua Facial", "Microneedling"],
  },
  {
    name: "Miss BeauTyna",
    address: "Große Ulrichstraße 7-9, 06108 Halle (Saale)",
    website: "https://www.missbeautyna.de/",
    focus: ["Permanent Make-up", "Microblading", "Wimpern", "Kosmetik"],
  },
  {
    name: "Glow Beautybar by Ilona",
    address: "Marktplatz 23, 06108 Halle (Saale)",
    website: "https://www.glowbeautybarbyilona.de/",
    focus: ["Permanent Make-up", "Hydrafacial", "Brows", "Lashes"],
  },
  {
    name: "Glitzerstübchen Halle",
    address: "Trothaer Straße 107, 06118 Halle (Saale)",
    website: "https://glitzerstuebchenhalle.de/",
    focus: ["Permanent Make-up", "Wimpern", "Brow- und Lashlifting", "Kosmetik"],
  },
  {
    name: "PMU Studio Halle/Saale",
    address: "Äußere Leipziger Straße 15, 06116 Halle (Saale)",
    website: "https://pmustudiohalle.de/",
    focus: ["Powder Brows", "Microblading", "Permanent Make-up", "UV-Wimpern"],
  },
] as const;

export const SALON_ELEN_POSITIONING_FACTS = [
  "Hairstroke Brows and natural-looking Permanent Make-up are priority expertise areas",
  "appointments can be booked online around the clock",
  "consultation is available in German, English, and Russian",
  "the salon has a fixed location at Lessingstraße 37 in Halle's Paulusviertel",
  "public service pages explain prices, procedure, aftercare, and booking",
] as const;

export function buildLocalCompetitorAiContext() {
  return {
    verifiedAt: LOCAL_COMPETITOR_DATA_VERIFIED_AT,
    limitations:
      "Public positioning reference only; not a ranking and no competitor traffic, review, quality, or market-share data is available.",
    salonElenFacts: SALON_ELEN_POSITIONING_FACTS,
    competitors: LOCAL_COMPETITOR_PROFILES.map((competitor) => ({
      name: competitor.name,
      address: competitor.address,
      website: competitor.website,
      publishedFocus: competitor.focus,
    })),
  };
}

function escapeMarkdown(value: string): string {
  return value.replace(/([_*[\]()`\\])/g, "\\$1");
}

function competitorLines(markdown: boolean): string[] {
  return LOCAL_COMPETITOR_PROFILES.flatMap((competitor, index) => {
    const name = markdown ? `*${escapeMarkdown(competitor.name)}*` : competitor.name;
    const address = markdown ? escapeMarkdown(competitor.address) : competitor.address;
    const focus = competitor.focus.join(", ");
    const site = new URL(competitor.website).hostname.replace(/^www\./, "");

    return [
      `${index + 1}. ${name} — ${address}`,
      `   Фокус: ${markdown ? escapeMarkdown(focus) : focus} · ${site}`,
    ];
  });
}

export function formatLocalCompetitorsMarkdown(): string {
  return [
    "🏙 *5 локальных конкурентов для мониторинга*",
    "Отобраны по географии Halle \(Saale\) и пересечению опубликованных услуг\.",
    "",
    ...competitorLines(true),
    "",
    `Проверено: ${escapeMarkdown(LOCAL_COMPETITOR_DATA_VERIFIED_AT)}\. Это не рейтинг Google Maps и не оценка качества, трафика или доли рынка\.`,
  ].join("\n");
}

export function formatLocalCompetitorsPlainText(): string {
  return [
    "🏙 5 локальных конкурентов для мониторинга",
    "Отобраны по географии Halle (Saale) и пересечению опубликованных услуг.",
    "",
    ...competitorLines(false),
    "",
    `Проверено: ${LOCAL_COMPETITOR_DATA_VERIFIED_AT}. Это не рейтинг Google Maps и не оценка качества, трафика или доли рынка.`,
  ].join("\n");
}
