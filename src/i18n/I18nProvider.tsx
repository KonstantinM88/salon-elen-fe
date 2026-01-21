// src/i18n/I18nProvider.tsx
'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

type I18nProviderProps = {
  initialLocale: Locale;
  children: ReactNode;
};

export function I18nProvider({ initialLocale, children }: I18nProviderProps) {
  const safeInitial = LOCALES.includes(initialLocale)
    ? initialLocale
    : DEFAULT_LOCALE;

  const [locale, setLocaleState] = useState<Locale>(safeInitial);
  const router = useRouter();

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    
    setLocaleState(next);

    if (typeof document !== 'undefined') {
      const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 год
      document.cookie = `locale=${next}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
      
      // Перезагружаем страницу чтобы Server Components получили новый cookie
      // router.refresh() не работает надёжно, используем полную перезагрузку
      window.location.reload();
    }
  };

  const value: I18nContextValue = useMemo(
    () => ({ locale, setLocale }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return ctx;
}




//--------добавляем перезагрузку страницы при смене локали--------//
// // src/i18n/I18nProvider.tsx
// 'use client';

// import {
//   createContext,
//   useContext,
//   useMemo,
//   useState,
//   type ReactNode,
// } from 'react';
// import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

// type I18nContextValue = {
//   locale: Locale;
//   setLocale: (next: Locale) => void;
// };

// const I18nContext = createContext<I18nContextValue | undefined>(undefined);

// type I18nProviderProps = {
//   initialLocale: Locale;
//   children: ReactNode;
// };

// export function I18nProvider({ initialLocale, children }: I18nProviderProps) {
//   const safeInitial = LOCALES.includes(initialLocale)
//     ? initialLocale
//     : DEFAULT_LOCALE;

//   const [locale, setLocaleState] = useState<Locale>(safeInitial);

//   const setLocale = (next: Locale) => {
//     setLocaleState(next);

//     if (typeof document !== 'undefined') {
//       const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 год
//       document.cookie = `locale=${next}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
//     }
//   };

//   const value: I18nContextValue = useMemo(
//     () => ({ locale, setLocale }),
//     [locale],
//   );

//   return (
//     <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
//   );
// }

// export function useI18n(): I18nContextValue {
//   const ctx = useContext(I18nContext);
//   if (!ctx) {
//     throw new Error('useI18n must be used inside I18nProvider');
//   }
//   return ctx;
// }
