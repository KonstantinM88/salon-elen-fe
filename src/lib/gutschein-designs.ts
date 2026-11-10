import type { Locale } from '@/i18n/locales';

export const GIFT_DESIGN_KEYS = ['orchid', 'peony', 'ginkgo', 'lily'] as const;
export type GiftDesignKey = typeof GIFT_DESIGN_KEYS[number];

export const giftDesigns = {
  orchid: { image: '/images/gutschein/orchid.webp', background: '#352332', foreground: '#f5dec2', border: '#8d7163',
    names: { de: 'Orchidee · Pflaume & Gold', en: 'Orchid · Plum & gold', ru: 'Орхидея · Слива и золото' } },
  peony: { image: '/images/gutschein/peony.webp', background: '#f2dbd8', foreground: '#543039', border: '#b58083',
    names: { de: 'Pfingstrose · Rosé', en: 'Peony · Blush rose', ru: 'Пион · Пудровая роза' } },
  ginkgo: { image: '/images/gutschein/ginkgo.webp', background: '#dfe6d9', foreground: '#344c3d', border: '#829579',
    names: { de: 'Ginkgo · Salbei', en: 'Ginkgo · Sage green', ru: 'Гинкго · Шалфей' } },
  lily: { image: '/images/gutschein/lily.webp', background: '#f3e5cd', foreground: '#59452d', border: '#b69a68',
    names: { de: 'Lilie · Champagner', en: 'Lily · Champagne', ru: 'Лилия · Шампань' } },
} satisfies Record<GiftDesignKey, { image: string; background: string; foreground: string; border: string; names: Record<Locale, string> }>;

export function getGiftDesign(key: string) {
  return giftDesigns[GIFT_DESIGN_KEYS.find(value => value === key) ?? 'orchid'];
}
