// src/components/LanguageSwitcher.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/lib/i18n-utils';
import { setLocale } from '@/app/actions/locale';

type Props = {
  currentLocale: Locale;
  variant?: 'default' | 'compact';
};

export function LanguageSwitcher({ currentLocale, variant = 'default' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLocaleChange = async (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(false);

    try {
      console.log("[LanguageSwitcher] Changing locale to:", newLocale);
      
      // Устанавливаем cookie через Server Action
      const result = await setLocale(newLocale);
      console.log("[LanguageSwitcher] Server action result:", result);
      
      // Также устанавливаем на клиенте для немедленного доступа
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      console.log("[LanguageSwitcher] Cookie set, reloading...");

      // Полная перезагрузка страницы для применения нового языка
      window.location.reload();
    } catch (error) {
      console.error('Error changing locale:', error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm
                   border border-white/10 rounded-lg hover:bg-white/10
                   transition-all disabled:opacity-50"
        >
          <span className="text-lg">{LOCALE_FLAGS[currentLocale]}</span>
          <span className="text-sm font-medium text-white">
            {currentLocale.toUpperCase()}
          </span>
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </button>

        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10
                          rounded-lg shadow-xl z-50 overflow-hidden">
              {SUPPORTED_LOCALES.map(locale => (
                <button
                  key={locale}
                  onClick={() => handleLocaleChange(locale)}
                  disabled={loading || locale === currentLocale}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3
                    text-left transition-all
                    ${locale === currentLocale
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'text-gray-300 hover:bg-white/5'
                    }
                    disabled:opacity-50
                  `}
                >
                  <span className="text-lg">{LOCALE_FLAGS[locale]}</span>
                  <span className="text-sm font-medium">{LOCALE_NAMES[locale]}</span>
                  {locale === currentLocale && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm
                  border border-white/10 rounded-lg p-1">
      {SUPPORTED_LOCALES.map(locale => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          disabled={loading || locale === currentLocale}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md
            font-medium text-sm transition-all
            ${locale === currentLocale
              ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={LOCALE_NAMES[locale]}
        >
          <span className="text-lg">{LOCALE_FLAGS[locale]}</span>
          <span>{locale.toUpperCase()}</span>
          {locale === currentLocale && loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

// Hook для использования в компонентах
export function useCurrentLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'de'; // SSR fallback
  }

  // Читаем из cookie
  const match = document.cookie.match(/locale=([^;]+)/);
  const locale = match?.[1];

  if (locale && SUPPORTED_LOCALES.includes(locale as Locale)) {
    return locale as Locale;
  }

  return 'de'; // Default
}








// // src/components/LanguageSwitcher.tsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { SUPPORTED_LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/lib/i18n-utils';
// import { setLocale } from '@/app/actions/locale';

// type Props = {
//   currentLocale: Locale;
//   variant?: 'default' | 'compact';
// };

// export function LanguageSwitcher({ currentLocale, variant = 'default' }: Props) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleLocaleChange = async (newLocale: Locale) => {
//     if (newLocale === currentLocale) {
//       setIsOpen(false);
//       return;
//     }

//     setLoading(true);
//     setIsOpen(false);

//     try {
//       // Устанавливаем cookie через Server Action
//       await setLocale(newLocale);
      
//       // Также устанавливаем на клиенте для немедленного доступа
//       document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;

//       // Перезагружаем страницу для применения нового языка
//       router.refresh();
//     } catch (error) {
//       console.error('Error changing locale:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (variant === 'compact') {
//     return (
//       <div className="relative">
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           disabled={loading}
//           className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm
//                    border border-white/10 rounded-lg hover:bg-white/10
//                    transition-all disabled:opacity-50"
//         >
//           <span className="text-lg">{LOCALE_FLAGS[currentLocale]}</span>
//           <span className="text-sm font-medium text-white">
//             {currentLocale.toUpperCase()}
//           </span>
//           {loading && (
//             <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//                 fill="none"
//               />
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               />
//             </svg>
//           )}
//         </button>

//         {isOpen && (
//           <>
//             {/* Overlay */}
//             <div
//               className="fixed inset-0 z-40"
//               onClick={() => setIsOpen(false)}
//             />

//             {/* Dropdown */}
//             <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10
//                           rounded-lg shadow-xl z-50 overflow-hidden">
//               {SUPPORTED_LOCALES.map(locale => (
//                 <button
//                   key={locale}
//                   onClick={() => handleLocaleChange(locale)}
//                   disabled={loading || locale === currentLocale}
//                   className={`
//                     w-full flex items-center gap-3 px-4 py-3
//                     text-left transition-all
//                     ${locale === currentLocale
//                       ? 'bg-sky-500/20 text-sky-400'
//                       : 'text-gray-300 hover:bg-white/5'
//                     }
//                     disabled:opacity-50
//                   `}
//                 >
//                   <span className="text-lg">{LOCALE_FLAGS[locale]}</span>
//                   <span className="text-sm font-medium">{LOCALE_NAMES[locale]}</span>
//                   {locale === currentLocale && (
//                     <span className="ml-auto text-xs">✓</span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     );
//   }

//   // Default variant
//   return (
//     <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm
//                   border border-white/10 rounded-lg p-1">
//       {SUPPORTED_LOCALES.map(locale => (
//         <button
//           key={locale}
//           onClick={() => handleLocaleChange(locale)}
//           disabled={loading || locale === currentLocale}
//           className={`
//             flex items-center gap-2 px-4 py-2 rounded-md
//             font-medium text-sm transition-all
//             ${locale === currentLocale
//               ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg'
//               : 'text-gray-400 hover:text-white hover:bg-white/10'
//             }
//             disabled:opacity-50 disabled:cursor-not-allowed
//           `}
//           title={LOCALE_NAMES[locale]}
//         >
//           <span className="text-lg">{LOCALE_FLAGS[locale]}</span>
//           <span>{locale.toUpperCase()}</span>
//           {locale === currentLocale && loading && (
//             <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//                 fill="none"
//               />
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               />
//             </svg>
//           )}
//         </button>
//       ))}
//     </div>
//   );
// }

// // Hook для использования в компонентах
// export function useCurrentLocale(): Locale {
//   if (typeof window === 'undefined') {
//     return 'de'; // SSR fallback
//   }

//   // Читаем из cookie
//   const match = document.cookie.match(/locale=([^;]+)/);
//   const locale = match?.[1];

//   if (locale && SUPPORTED_LOCALES.includes(locale as Locale)) {
//     return locale as Locale;
//   }

//   return 'de'; // Default
// }