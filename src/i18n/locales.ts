// src/i18n/locales.ts

export const LOCALES = ['de', 'en', 'ru'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'de';
