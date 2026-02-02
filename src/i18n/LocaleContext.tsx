// src/i18n/LocaleContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n/locales";

// Интерфейс контекста
interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// Создаём контекст
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Провайдер контекста
interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function LocaleProvider({ children, initialLocale = DEFAULT_LOCALE }: LocaleProviderProps) {
  const searchParams = useSearchParams();
  // ✅ Читаем ?lang= из URL для SEO (Google индексирует эти URL)
  const urlLang = searchParams?.get('lang') as Locale | null;
  
  const [locale, setLocaleState] = useState<Locale>(
    (urlLang && LOCALES.includes(urlLang)) ? urlLang : initialLocale
  );

  // Загружаем локаль: приоритет URL > cookie
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Если есть ?lang= в URL, используем его
      if (urlLang && LOCALES.includes(urlLang)) {
        if (urlLang !== locale) {
          setLocaleState(urlLang);
        }
        // Обновляем cookie для consistency
        document.cookie = `locale=${urlLang}; path=/; max-age=31536000`;
        return;
      }
      
      // Иначе читаем из cookie
      const cookieLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('locale='))
        ?.split('=')[1] as Locale | undefined;
      
      if (cookieLocale && LOCALES.includes(cookieLocale)) {
        setLocaleState(cookieLocale);
      }
    }
  }, [urlLang, locale]);

  // Функция для изменения локали
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    
    if (typeof window !== "undefined") {
      // Сохраняем в cookie
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`; // 1 year
      
      // Также сохраняем в localStorage для backup
      localStorage.setItem("locale", newLocale);
      
      // Перезагружаем страницу чтобы применить новый язык
      window.location.reload();
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

// Хук для использования контекста
export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  
  return context;
}





// // src/i18n/LocaleContext.tsx
// "use client";

// import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/i18n/locales";

// // Интерфейс контекста
// interface LocaleContextType {
//   locale: Locale;
//   setLocale: (locale: Locale) => void;
// }

// // Создаём контекст
// const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// // Провайдер контекста
// interface LocaleProviderProps {
//   children: ReactNode;
//   initialLocale?: Locale;
// }

// export function LocaleProvider({ children, initialLocale = DEFAULT_LOCALE }: LocaleProviderProps) {
//   const [locale, setLocaleState] = useState<Locale>(initialLocale);

//   // Загружаем сохранённую локаль из cookies при монтировании
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       // Читаем из cookie (если есть)
//       const cookieLocale = document.cookie
//         .split('; ')
//         .find(row => row.startsWith('locale='))
//         ?.split('=')[1] as Locale | undefined;
      
//       if (cookieLocale && LOCALES.includes(cookieLocale)) {
//         setLocaleState(cookieLocale);
//       }
//     }
//   }, []);

//   // Функция для изменения локали
//   const setLocale = (newLocale: Locale) => {
//     setLocaleState(newLocale);
    
//     if (typeof window !== "undefined") {
//       // Сохраняем в cookie (синхронизируем с I18nProvider)
//       document.cookie = `locale=${newLocale}; path=/; max-age=31536000`; // 1 year
      
//       // Также сохраняем в localStorage для backup
//       localStorage.setItem("locale", newLocale);
      
//       // Перезагружаем страницу чтобы применить новый язык
//       window.location.reload();
//     }
//   };

//   return (
//     <LocaleContext.Provider value={{ locale, setLocale }}>
//       {children}
//     </LocaleContext.Provider>
//   );
// }

// // Хук для использования контекста
// export function useLocale(): LocaleContextType {
//   const context = useContext(LocaleContext);
  
//   if (context === undefined) {
//     throw new Error("useLocale must be used within a LocaleProvider");
//   }
  
//   return context;
// }