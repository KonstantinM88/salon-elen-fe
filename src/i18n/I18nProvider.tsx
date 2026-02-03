// src/i18n/I18nProvider.tsx
"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./locales";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && LOCALES.includes(v as Locale);
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const searchParams = useSearchParams();
  const urlLang = searchParams.get("lang");

  const [locale, setLocaleState] = useState<Locale>(
    isLocale(urlLang) ? (urlLang as Locale) : initialLocale,
  );

  useEffect(() => {
    if (isLocale(urlLang) && urlLang !== locale) {
      setLocaleState(urlLang as Locale);
    }
  }, [urlLang, locale]);

  const setLocale = (next: Locale) => {
    if (next === locale) return;

    setLocaleState(next);

    if (typeof document !== "undefined" && typeof window !== "undefined") {
      const maxAgeSeconds = 60 * 60 * 24 * 365;
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `locale=${next}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;

      const url = new URL(window.location.href);
      if (next === DEFAULT_LOCALE) {
        url.searchParams.delete("lang");
      } else {
        url.searchParams.set("lang", next);
      }
      window.location.assign(url.toString());
    }
  };

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}




//---------03.02.26--------//
// // src/i18n/I18nProvider.tsx
// 'use client';

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   type ReactNode,
// } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
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
//   const searchParams = useSearchParams();
//   // ✅ Читаем ?lang= из URL для SEO (Google будет индексировать ?lang=ru, ?lang=en)
//   const urlLang = searchParams?.get('lang') as Locale | null;
  
//   // Приоритет: URL параметр > cookie > default
//   const safeInitial = (urlLang && LOCALES.includes(urlLang))
//     ? urlLang
//     : LOCALES.includes(initialLocale)
//       ? initialLocale
//       : DEFAULT_LOCALE;

//   const [locale, setLocaleState] = useState<Locale>(safeInitial);
//   const router = useRouter();

//   // ✅ Обновляем locale если изменился URL параметр ?lang=
//   useEffect(() => {
//     if (urlLang && LOCALES.includes(urlLang) && urlLang !== locale) {
//       setLocaleState(urlLang);
//       // Также обновляем cookie для consistency
//       const maxAgeSeconds = 60 * 60 * 24 * 365;
//       document.cookie = `locale=${urlLang}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
//     }
//   }, [urlLang, locale]);

//   const setLocale = (next: Locale) => {
//     if (next === locale) return;
    
//     setLocaleState(next);

//     if (typeof document !== 'undefined') {
//       const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 год
//       document.cookie = `locale=${next}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
      
//       // Перезагружаем страницу чтобы Server Components получили новый cookie
//       window.location.reload();
//     }
//   };

//   const value: I18nContextValue = useMemo(
//     () => ({ locale, setLocale }),
//     // eslint-disable-next-line react-hooks/exhaustive-deps
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




// // src/i18n/I18nProvider.tsx
// 'use client';

// import {
//   createContext,  // импортируем createContext
//   useContext,
//   useMemo,
//   useState,
//   type ReactNode,
// } from 'react';
// import { useRouter } from 'next/navigation';  // импортируем роутер
// import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';  // импортируем доступные локали

// type I18nContextValue = { // тип значения контекста
//   locale: Locale; // текущая локаль
//   setLocale: (next: Locale) => void;  // функция для смены локали
// };

// const I18nContext = createContext<I18nContextValue | undefined>(undefined);  // создаём контекст

// type I18nProviderProps = {  // пропсы провайдера
//   initialLocale: Locale;  // начальная локаль
//   children: ReactNode;  // дочерние элементы
// };

// export function I18nProvider({ initialLocale, children }: I18nProviderProps) {  // провайдер локализации
//   const safeInitial = LOCALES.includes(initialLocale)  // проверяем что начальная локаль поддерживается
//     ? initialLocale // проверяем валидность начальной локали
//     : DEFAULT_LOCALE; // если невалидна, используем локаль по умолчанию

//   const [locale, setLocaleState] = useState<Locale>(safeInitial);  // состояние локали
//   const router = useRouter(); // получаем роутер для навигации

//   const setLocale = (next: Locale) => {  // функция смены локали
//     if (next === locale) return;  // если локаль не изменилась, выходим
    
//     setLocaleState(next); // обновляем состояние локали 

//     if (typeof document !== 'undefined') {  // проверяем что мы на клиенте
//       const maxAgeSeconds = 60 * 60 * 24 * 365; // 1 год
//       document.cookie = `locale=${next}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`; // устанавливаем cookie
      
//       // Перезагружаем страницу чтобы Server Components получили новый cookie
//       // router.refresh() не работает надёжно, используем полную перезагрузку
//       window.location.reload(); // перезагружаем страницу
//     }
//   };

//   const value: I18nContextValue = useMemo( // мемоизируем значение контекста
//     () => ({ locale, setLocale }),  // мемоизируем значение контекста
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [locale], // пересоздаём только при изменении локали
//   );

//   return (
//     <I18nContext.Provider value={value}>{children}</I18nContext.Provider> // возвращаем провайдер с контекстом
//   );
// }

// export function useI18n(): I18nContextValue { // хук для использования контекста
//   const ctx = useContext(I18nContext);  // получаем контекст
//   if (!ctx) { // если контекст не найден
//     throw new Error('useI18n must be used inside I18nProvider');  // ошибка если контекст не найден
//   }
//   return ctx; // возвращаем контекст
// }




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
