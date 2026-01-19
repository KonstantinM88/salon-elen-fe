// src/lib/i18n-utils.ts

// ✅ ДОБАВЛЕНО: Экспортируем типы и константы для компонентов
export type Locale = 'de' | 'ru' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['de', 'ru', 'en'];

export const LOCALE_NAMES: Record<Locale, string> = {
  de: 'Deutsch',
  ru: 'Русский',
  en: 'English',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  de: '🇩🇪',
  ru: '🇷🇺',
  en: '🇬🇧',
};

type Translation = {
  locale: string;
  name: string;
  description: string | null;
};

/**
 * Получить перевод с fallback на другие языки
 * Приоритет: запрошенный язык → немецкий → первый доступный
 */
export function getTranslationWithFallback(
  translations: Translation[] | undefined,
  locale: string = 'de'
): Translation {
  if (!translations || translations.length === 0) {
    return { locale: 'de', name: 'Unnamed Service', description: null };
  }

  // Попытка найти запрошенный язык
  const requested = translations.find((t) => t.locale === locale);
  if (requested && requested.name) return requested;

  // Fallback на немецкий
  const german = translations.find((t) => t.locale === 'de');
  if (german && german.name) return german;

  // Fallback на первый доступный
  return translations[0];
}

/**
 * Получить все доступные языки для услуги
 */
export function getAvailableLocales(translations: Translation[] | undefined): string[] {
  if (!translations) return [];
  return translations
    .filter((t) => t.name)
    .map((t) => t.locale);
}

/**
 * Проверить есть ли перевод на конкретный язык
 */
export function hasTranslation(
  translations: Translation[] | undefined,
  locale: string
): boolean {
  if (!translations) return false;
  return translations.some((t) => t.locale === locale && t.name);
}

/**
 * Получить флаг языка по коду
 */
export function getLanguageFlag(locale: string): string {
  const flags: Record<string, string> = {
    de: '🇩🇪',
    ru: '🇷🇺',
    en: '🇬🇧',
  };
  return flags[locale] || '🌐';
}

/**
 * Получить название языка по коду
 */
export function getLanguageName(locale: string): string {
  const names: Record<string, string> = {
    de: 'Deutsch',
    ru: 'Русский',
    en: 'English',
  };
  return names[locale] || locale.toUpperCase();
}






// // src/lib/i18n-utils.ts

// type Translation = {
//   locale: string;
//   name: string;
//   description: string | null;
// };

// /**
//  * Получить перевод с fallback на другие языки
//  * Приоритет: запрошенный язык → немецкий → первый доступный
//  */
// export function getTranslationWithFallback(
//   translations: Translation[] | undefined,
//   locale: string = 'de'
// ): Translation {
//   if (!translations || translations.length === 0) {
//     return { locale: 'de', name: 'Unnamed Service', description: null };
//   }

//   // Попытка найти запрошенный язык
//   const requested = translations.find((t) => t.locale === locale);
//   if (requested && requested.name) return requested;

//   // Fallback на немецкий
//   const german = translations.find((t) => t.locale === 'de');
//   if (german && german.name) return german;

//   // Fallback на первый доступный
//   return translations[0];
// }

// /**
//  * Получить все доступные языки для услуги
//  */
// export function getAvailableLocales(translations: Translation[] | undefined): string[] {
//   if (!translations) return [];
//   return translations
//     .filter((t) => t.name)
//     .map((t) => t.locale);
// }

// /**
//  * Проверить есть ли перевод на конкретный язык
//  */
// export function hasTranslation(
//   translations: Translation[] | undefined,
//   locale: string
// ): boolean {
//   if (!translations) return false;
//   return translations.some((t) => t.locale === locale && t.name);
// }

// /**
//  * Получить флаг языка по коду
//  */
// export function getLanguageFlag(locale: string): string {
//   const flags: Record<string, string> = {
//     de: '🇩🇪',
//     ru: '🇷🇺',
//     en: '🇬🇧',
//   };
//   return flags[locale] || '🌐';
// }

// /**
//  * Получить название языка по коду
//  */
// export function getLanguageName(locale: string): string {
//   const names: Record<string, string> = {
//     de: 'Deutsch',
//     ru: 'Русский',
//     en: 'English',
//   };
//   return names[locale] || locale.toUpperCase();
// }