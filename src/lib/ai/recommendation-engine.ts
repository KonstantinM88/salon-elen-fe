// src/lib/ai/recommendation-engine.ts
import { PERMANENT_HALLE } from '@/lib/ai/knowledge';

export type Locale = 'de' | 'en' | 'ru';

export type Stage = 'browsing' | 'consulting' | 'selecting' | 'booking' | 'confirmed';

export type IntentTag =
  | 'expressive'
  | 'natural'
  | 'fresh_glow'
  | 'always_polished'
  | 'fuller_brows'
  | 'open_look'
  | 'price_sensitive'
  | 'time_sensitive';

export type ServiceTag =
  | 'pmu_brows'
  | 'pmu_lips'
  | 'pmu_lashline'
  | 'lash_lift'
  | 'brow_lift'
  | 'brow_styling'
  | 'brow_wax'
  | 'hybrid_brows'
  | 'lash_tint'
  | 'hydrafacial';

export interface RecommendationContext {
  locale: Locale;
  stage: Stage;
  selectedServices: ServiceTag[];
  intents: IntentTag[];
  // once the user declined an upsell in the current session, stop offering more
  upsellDeclined: boolean;
}

export interface UpsellCandidate {
  id: string;
  addService: ServiceTag;
  score: number;
  message: string;
}

/**
 * Decide a single best upsell candidate.
 *
 * Rules:
 * - Offer at most 1 upsell.
 * - Only in consulting/selecting/booking.
 * - If already declined => none.
 * - Score threshold >= 4.
 */
export function pickBestUpsell(ctx: RecommendationContext): UpsellCandidate | null {
  if (ctx.upsellDeclined) return null;
  if (!['consulting', 'selecting', 'booking'].includes(ctx.stage)) return null;

  const selected = new Set(ctx.selectedServices);
  const intents = new Set(ctx.intents);

  const candidates: Array<Omit<UpsellCandidate, 'score' | 'message'> & {
    score: number;
    template: keyof typeof TEMPLATES;
  }> = [];

  const stageWeight = ctx.stage === 'booking' ? 2 : ctx.stage === 'selecting' ? 1 : 0;

  // Helper
  const add = (id: string, addService: ServiceTag, base: number, template: keyof typeof TEMPLATES) => {
    // Don't upsell something already selected.
    if (selected.has(addService)) return;
    candidates.push({ id, addService, score: base + stageWeight, template });
  };

  // --- Service-based rules (base scores 0–6) ---

  // PMU brows
  if (selected.has('pmu_brows')) {
    let base = 3;
    if (intents.has('open_look') || intents.has('expressive')) base += 2;
    add('pmu_brows_add_lash_lift', 'lash_lift', base, 'pmu_brows_add_lash_lift');

    base = 3;
    if (intents.has('fuller_brows')) base += 2;
    add('pmu_brows_add_brow_lift', 'brow_lift', base, 'pmu_brows_add_brow_lift');
  }

  // PMU lips
  if (selected.has('pmu_lips')) {
    let base = 3;
    if (intents.has('fresh_glow') || intents.has('always_polished')) base += 2;
    add('pmu_lips_add_hydrafacial', 'hydrafacial', base, 'pmu_lips_add_hydrafacial');
  }

  // PMU lashline
  if (selected.has('pmu_lashline')) {
    let base = 4;
    if (intents.has('open_look') || intents.has('expressive')) base += 1;
    add('pmu_lashline_add_lash_lift', 'lash_lift', base, 'pmu_lashline_add_lash_lift');
  }

  // Lash lift -> brows
  if (selected.has('lash_lift')) {
    let base = 3;
    if (intents.has('always_polished') || intents.has('expressive')) base += 2;
    add('lash_lift_add_brow_styling', 'brow_styling', base, 'lash_lift_add_brow_styling');

    base = 4; // small add-on, high conversion
    add('lash_lift_add_lash_tint', 'lash_tint', base, 'lash_lift_add_lash_tint');
  }

  // Brow lift -> tint
  if (selected.has('brow_lift') || selected.has('hybrid_brows')) {
    const base = 4;
    add('brows_add_tint', 'lash_tint', base, 'brows_add_tint');
  }

  // Brows/Lashes -> Hydrafacial (glow)
  if (selected.has('lash_lift') || selected.has('brow_lift') || selected.has('brow_styling') || selected.has('hybrid_brows')) {
    let base = 3;
    if (intents.has('fresh_glow')) base += 2;
    add('eyes_add_hydrafacial', 'hydrafacial', base, 'eyes_add_hydrafacial');
  }

  // Hydrafacial -> PMU (only if intent)
  if (selected.has('hydrafacial')) {
    let base = 2;
    if (intents.has('always_polished') || intents.has('expressive')) base += 3;
    add('hydrafacial_add_pmu', 'pmu_brows', base, 'hydrafacial_add_pmu');

    base = 3;
    add('hydrafacial_add_lash_lift', 'lash_lift', base, 'hydrafacial_add_lash_lift');
  }

  // pick best
  const best = candidates.sort((a, b) => b.score - a.score)[0];
  if (!best || best.score < 4) return null;

  return {
    id: best.id,
    addService: best.addService,
    score: best.score,
    message: TEMPLATES[best.template][ctx.locale],
  };
}

/**
 * Localized upsell templates.
 * Keep them short and premium. One question at the end.
 */
const TEMPLATES = {
  pmu_brows_add_lash_lift: {
    de: `Viele Kundinnen kombinieren Brauen-PMU mit Lashlifting (${PERMANENT_HALLE.prices.browsLashes.lash_lift} €) — der Blick wirkt offener 🌸 Möchten Sie das ergänzen?`,
    en: `Many clients combine brow PMU with a lash lift (${PERMANENT_HALLE.prices.browsLashes.lash_lift} €) — it opens up the look 🌸 Would you like to add it?`,
    ru: `Многие клиентки сочетают перманент бровей с ламинированием ресниц (${PERMANENT_HALLE.prices.browsLashes.lash_lift} €) — взгляд становится более открытым 🌸 Добавить?`,
  },
  pmu_brows_add_brow_lift: {
    de: `Für besonders gepflegte Brauen ergänzen viele Kundinnen Browlifting (${PERMANENT_HALLE.prices.browsLashes.brow_lift} €) — die Härchen wirken voller 🌸 Soll ich das hinzufügen?`,
    en: `For beautifully styled brows, many clients add a brow lift (${PERMANENT_HALLE.prices.browsLashes.brow_lift} €) — brows look fuller 🌸 Shall I add it?`,
    ru: `Для максимально ухоженных бровей многие добавляют ламинирование бровей (${PERMANENT_HALLE.prices.browsLashes.brow_lift} €) — волоски выглядят объёмнее 🌸 Добавить?`,
  },
  pmu_lips_add_hydrafacial: {
    de: `Für einen besonders frischen Gesamtlook ergänzen viele Kundinnen Lippen-PMU mit Hydrafacial (ab ${PERMANENT_HALLE.prices.hydrafacial.signature} €) 🌿 Möchten Sie das kombinieren?`,
    en: `For an extra fresh overall look, many clients add Hydrafacial (from ${PERMANENT_HALLE.prices.hydrafacial.signature} €) to lip PMU 🌿 Would you like to combine them?`,
    ru: `Для максимально свежего эффекта многие дополняют перманент губ Hydrafacial (от ${PERMANENT_HALLE.prices.hydrafacial.signature} €) 🌿 Хотите совместить?`,
  },
  pmu_lashline_add_lash_lift: {
    de: `Für mehr Ausdruck wird der Wimpernkranz oft mit Lashlifting (${PERMANENT_HALLE.prices.browsLashes.lash_lift} €) kombiniert 🌿 Soll ich das ergänzen?`,
    en: `For more definition, lash line PMU is often combined with a lash lift (${PERMANENT_HALLE.prices.browsLashes.lash_lift} €) 🌿 Shall I add it?`,
    ru: `Для более выразительного эффекта межресничку часто сочетают с ламинированием ресниц (${PERMANENT_HALLE.prices.browsLashes.lash_lift} €) 🌿 Добавить?`,
  },
  lash_lift_add_brow_styling: {
    de: `Damit alles harmonisch wirkt, ergänzen viele Kundinnen nach Lashlifting eine Brauenkorrektur (${PERMANENT_HALLE.prices.browsLashes.brow_styling} €) 🌸 Möchten Sie das dazu?`,
    en: `To keep the look balanced, many clients add brow styling (${PERMANENT_HALLE.prices.browsLashes.brow_styling} €) after a lash lift 🌸 Would you like to add it?`,
    ru: `Чтобы образ выглядел гармонично, после ламинирования ресниц часто добавляют коррекцию бровей (${PERMANENT_HALLE.prices.browsLashes.brow_styling} €) 🌸 Добавить?`,
  },
  lash_lift_add_lash_tint: {
    de: `Kleines Upgrade: Wimpernfärben (${PERMANENT_HALLE.prices.browsLashes.lash_tint} €) macht das Lashlifting noch definierter 🌸 Möchten Sie das ergänzen?`,
    en: `Small upgrade: lash tint (${PERMANENT_HALLE.prices.browsLashes.lash_tint} €) makes the lash lift look even more defined 🌸 Add it?`,
    ru: `Небольшой апгрейд: окрашивание ресниц (${PERMANENT_HALLE.prices.browsLashes.lash_tint} €) делает результат ламинирования ещё выразительнее 🌸 Добавить?`,
  },
  brows_add_tint: {
    de: `Viele Kundinnen ergänzen dazu Färben (${PERMANENT_HALLE.prices.browsLashes.lash_tint} €) für ein gleichmäßigeres Ergebnis 🌸 Soll ich das hinzufügen?`,
    en: `Many clients add tint (${PERMANENT_HALLE.prices.browsLashes.lash_tint} €) for a more even result 🌸 Shall I add it?`,
    ru: `Многие добавляют окрашивание (${PERMANENT_HALLE.prices.browsLashes.lash_tint} €) для более ровного результата 🌸 Добавить?`,
  },
  eyes_add_hydrafacial: {
    de: `Für strahlende Haut ergänzen viele Kundinnen Brow-/Lashbehandlungen mit Hydrafacial (ab ${PERMANENT_HALLE.prices.hydrafacial.signature} €) 🌿 Möchten Sie das dazu?`,
    en: `For glowing skin, many clients add Hydrafacial (from ${PERMANENT_HALLE.prices.hydrafacial.signature} €) to brow/lash treatments 🌿 Would you like to add it?`,
    ru: `Для сияющей кожи многие дополняют брови/ресницы Hydrafacial (от ${PERMANENT_HALLE.prices.hydrafacial.signature} €) 🌿 Добавить?`,
  },
  hydrafacial_add_pmu: {
    de: `Wenn Sie dauerhaft „ready“ sein möchten, passt PMU (z.B. Powder Brows ab ${PERMANENT_HALLE.prices.pmu.brows.powder} €) sehr gut zu Hydrafacial 🌸 Soll ich kurz empfehlen, was zu Ihnen passt?`,
    en: `If you want an always-polished look, PMU (e.g., Powder Brows from ${PERMANENT_HALLE.prices.pmu.brows.powder} €) pairs beautifully with Hydrafacial 🌸 Want a quick recommendation?`,
    ru: `Если хотите всегда выглядеть ухоженно, перманент (например, Powder Brows от ${PERMANENT_HALLE.prices.pmu.brows.powder} €) отлично сочетается с Hydrafacial 🌸 Подобрать вариант?`,
  },
  hydrafacial_add_lash_lift: {
    de: `Für ein rundum gepflegtes Ergebnis ergänzen viele Kundinnen Hydrafacial mit Lashlifting (${PERMANENT_HALLE.prices.browsLashes.lash_lift} €) 🌸 Möchten Sie das hinzufügen?`,
    en: `For a fully polished look, many clients add a lash lift (${PERMANENT_HALLE.prices.browsLashes.lash_lift} €) to Hydrafacial 🌸 Would you like to add it?`,
    ru: `Для полностью ухоженного образа многие дополняют Hydrafacial ламинированием ресниц (${PERMANENT_HALLE.prices.browsLashes.lash_lift} €) 🌸 Добавить?`,
  },
} as const;
