// src/app/admin/services/ServicesPageClient.tsx
'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TranslationEditor from './TranslationEditor';
import { getAvailableLocales, getLanguageFlag } from '@/lib/i18n-utils';
import type { SeoLocale } from '@/lib/seo-locale';

type Translation = {
  locale: string;
  name: string;
  description: string | null;
};

type ServiceLike = {
  id: string;
  name: string;
  translations: Translation[];
};

type Props = {
  service: ServiceLike;
  categoryName?: string;
  locale?: SeoLocale;
};

const TRANSLATION_BUTTON_COPY: Record<SeoLocale, { title: string; label: string }> = {
  de: { title: 'Uebersetzungen bearbeiten', label: 'Uebersetzungen' },
  ru: { title: 'Редактировать переводы', label: 'Переводы' },
  en: { title: 'Edit translations', label: 'Translations' },
};

export function TranslationButton({ service, categoryName, locale = 'de' }: Props) {
  const t = TRANSLATION_BUTTON_COPY[locale];
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  const availableLocales = getAvailableLocales(service.translations);
  const hasAllTranslations = availableLocales.length === 3;

  const handleSave = () => {
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={[
          'inline-flex items-center gap-1',
          'px-2 py-1 rounded-lg',
          'bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30',
          'transition-colors',
          'text-xs',
          'whitespace-nowrap',
        ].join(' ')}
        title={t.title}
        type="button"
      >
        <Languages className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden xl:inline">{t.label}</span>

        {!hasAllTranslations && (
          <span className="px-1 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-300">
            {availableLocales.length}/3
          </span>
        )}

        <span className="flex gap-0.5">
          {availableLocales.map((locale) => (
            <span key={locale} className="text-[10px]">
              {getLanguageFlag(locale)}
            </span>
          ))}
        </span>
      </button>

      {isOpen && (
        <TranslationEditor
          locale={locale}
          serviceId={service.id}
          serviceName={categoryName ? `${categoryName} → ${service.name}` : service.name}
          translations={service.translations}
          onClose={() => setIsOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}




// // src/app/admin/services/ServicesPageClient.tsx
// 'use client';

// import { useState } from 'react';
// import { Languages } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import TranslationEditor from './TranslationEditor';
// import { getAvailableLocales, getLanguageFlag } from '@/lib/i18n-utils';

// type Translation = {
//   locale: string;
//   name: string;
//   description: string | null;
// };

// type ServiceLike = {
//   id: string;
//   name: string;
//   translations: Translation[];
// };

// type Props = {
//   service: ServiceLike;
//   categoryName?: string;
// };

// export function TranslationButton({ service, categoryName }: Props) {
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const router = useRouter();

//   const availableLocales = getAvailableLocales(service.translations);
//   const hasAllTranslations = availableLocales.length === 3;

//   const handleSave = () => {
//     router.refresh();
//   };

//   return (
//     <>
//       <button
//         onClick={() => setIsOpen(true)}
//         className={[
//           'inline-flex items-center gap-1.5 sm:gap-2',
//           'px-2.5 sm:px-3 py-1.5 rounded-lg',
//           'bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30',
//           'transition-colors',
//           'text-xs sm:text-sm',
//           'whitespace-nowrap',
//         ].join(' ')}
//         title="Редактировать переводы"
//         type="button"
//       >
//         <Languages className="h-4 w-4 shrink-0" />
//         <span className="hidden sm:inline">Переводы</span>

//         {!hasAllTranslations && (
//           <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-xs bg-yellow-500/20 text-yellow-300">
//             {availableLocales.length}/3
//           </span>
//         )}

//         <span className="flex gap-0.5">
//           {availableLocales.map((locale) => (
//             <span key={locale} className="text-xs">
//               {getLanguageFlag(locale)}
//             </span>
//           ))}
//         </span>
//       </button>

//       {isOpen && (
//         <TranslationEditor
//           serviceId={service.id}
//           serviceName={categoryName ? `${categoryName} → ${service.name}` : service.name}
//           translations={service.translations}
//           onClose={() => setIsOpen(false)}
//           onSave={handleSave}
//         />
//       )}
//     </>
//   );
// }
