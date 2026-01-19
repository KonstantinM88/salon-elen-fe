// src/app/admin/services/TranslationEditor.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Languages, Loader2, Save, X } from 'lucide-react';
import ClientPortal from '@/components/ui/ClientPortal';
import { LOCALE_FLAGS, LOCALE_NAMES, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n-utils';

type TranslationInput = {
  locale: string;
  name: string;
  description: string | null;
};

type Props = {
  serviceId: string;
  serviceName: string;
  translations: TranslationInput[];
  onClose: () => void;
  onSave: () => void;
};

type FormTranslation = {
  name: string;
  description: string;
};

type FormState = Record<Locale, FormTranslation>;

function isLocale(v: string): v is Locale {
  return v === 'de' || v === 'ru' || v === 'en';
}

function buildInitialForm(translations: TranslationInput[]): FormState {
  const base: FormState = {
    de: { name: '', description: '' },
    ru: { name: '', description: '' },
    en: { name: '', description: '' },
  };

  for (const t of translations) {
    if (!isLocale(t.locale)) continue;
    base[t.locale] = {
      name: t.name ?? '',
      description: t.description ?? '',
    };
  }

  return base;
}

export default function TranslationEditor({
  serviceId,
  serviceName,
  translations,
  onClose,
  onSave,
}: Props) {
  // Escape / body scroll lock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const initialForm = useMemo<FormState>(() => buildInitialForm(translations), [translations]);

  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Если translations обновились (router.refresh), синхронизируем форму
  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const filledCount = SUPPORTED_LOCALES.filter((l) => form[l].name.trim().length > 0).length;

  const updateField = (locale: Locale, field: keyof FormTranslation, value: string) => {
    setForm((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      const payloadTranslations: Array<{ locale: Locale; name: string; description: string | null }> =
        SUPPORTED_LOCALES
          .map((l) => {
            const name = form[l].name.trim();
            const desc = form[l].description.trim();
            if (!name) return null;
            return {
              locale: l,
              name,
              description: desc.length ? desc : null,
            };
          })
          .filter((x): x is { locale: Locale; name: string; description: string | null } => x !== null);

      const res = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, translations: payloadTranslations }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || 'Ошибка сохранения');
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ClientPortal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-stretch sm:items-center justify-center p-0 sm:p-6"
          style={{
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className={[
              'relative w-full max-w-6xl',
              'bg-slate-900 border border-white/10 shadow-2xl overflow-hidden',
              'flex flex-col rounded-none sm:rounded-2xl',
              // КЛЮЧ: высота фиксируется и на мобиле, и на десктопе
              'h-[100svh] sm:h-[90svh]',
            ].join(' ')}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="shrink-0 p-4 sm:p-6 border-b border-white/10"
              style={{
                background:
                  'linear-gradient(to right, rgba(139,92,246,0.22), rgba(6,182,212,0.22))',
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="p-2.5 rounded-xl shrink-0"
                    style={{
                      background: 'linear-gradient(to bottom right, #8b5cf6, #06b6d4)',
                      boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <Languages className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                      Редактировать переводы
                    </h2>
                    <p className="text-xs sm:text-sm mt-1 truncate text-white/60">{serviceName}</p>
                    <p className="text-xs mt-1 text-violet-200/90">
                      Заполнено: {filledCount}/3 языков
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-all hover:bg-white/10 shrink-0"
                  type="button"
                  aria-label="Закрыть"
                  title="Закрыть (Esc)"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable content */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {SUPPORTED_LOCALES.map((locale) => {
                    const isFilled = form[locale].name.trim().length > 0;

                    return (
                      <div
                        key={locale}
                        className="min-w-0 p-3 sm:p-4 rounded-xl"
                        style={{
                          border: isFilled
                            ? '1px solid rgba(139,92,246,0.35)'
                            : '1px solid rgba(255,255,255,0.10)',
                          backgroundColor: isFilled
                            ? 'rgba(139,92,246,0.06)'
                            : 'rgba(255,255,255,0.05)',
                        }}
                      >
                        {/* Lang header */}
                        <div className="flex items-center gap-3 mb-3 sm:mb-4 pb-3 border-b border-white/10">
                          <span className="text-2xl">{LOCALE_FLAGS[locale]}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white">{LOCALE_NAMES[locale]}</div>
                            <div className="text-xs text-white/50">{locale.toUpperCase()}</div>
                          </div>
                          {isFilled && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: '#22c55e',
                                boxShadow: '0 0 10px rgba(34,197,94,0.5)',
                              }}
                            />
                          )}
                        </div>

                        {/* Name */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium mb-1.5 text-white/80">
                            Название
                          </label>
                          <input
                            type="text"
                            value={form[locale].name}
                            onChange={(e) => updateField(locale, 'name', e.target.value)}
                            placeholder={`Введите название на ${LOCALE_NAMES[locale].toLowerCase()}`}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-950/40 border border-white/10 outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium mb-1.5 text-white/80">
                            Описание
                          </label>
                          <textarea
                            value={form[locale].description}
                            onChange={(e) => updateField(locale, 'description', e.target.value)}
                            placeholder={`Введите описание на ${LOCALE_NAMES[locale].toLowerCase()}`}
                            rows={4}
                            className="w-full px-3 py-2 rounded-lg text-sm text-white bg-slate-950/40 border border-white/10 outline-none resize-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hint */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border border-cyan-400/20 bg-cyan-500/10">
                  <div className="flex items-start gap-2">
                    <Languages className="h-4 w-4 mt-0.5 shrink-0 text-cyan-300" />
                    <div>
                      <p className="font-medium text-sm text-cyan-200">Подсказка</p>
                      <p className="text-xs mt-1 text-cyan-200/80">
                        Пустые переводы не сохраняются. Заполните хотя бы “Название”.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 p-3 rounded-lg border border-red-400/20 bg-red-500/10 text-red-300">
                    ⚠️ {error}
                  </div>
                )}
              </div>

              {/* Footer (ВСЕГДА ВИДИМ) */}
              <div className="shrink-0 border-t border-white/10 bg-slate-900/80 backdrop-blur p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+16px)]">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all border border-white/10 text-white hover:bg-white/5 disabled:opacity-50"
                  >
                    Отмена
                  </button>

                  <button
                    type="submit"
                    disabled={saving || filledCount === 0}
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all text-white disabled:opacity-50"
                    style={{
                      background:
                        saving || filledCount === 0
                          ? 'rgba(139, 92, 246, 0.30)'
                          : 'linear-gradient(to right, #8b5cf6, #06b6d4)',
                      boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Сохранение...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Сохранить</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ClientPortal>
  );
}








//----------почти работает но не вижу кнопку сохранить-------
// 'use client';

// import { useEffect, useState } from 'react';
// import { Languages, Save, X, Loader2 } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import ClientPortal from '@/components/ui/ClientPortal';

// type Translation = {
//   locale: string;
//   name: string;
//   description: string | null;
// };

// type Props = {
//   serviceId: string;
//   serviceName: string;
//   translations: Translation[];
//   onClose: () => void;
//   onSave: () => void;
// };

// const LANGUAGES = [
//   { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
//   { code: 'ru', name: 'Русский', flag: '🇷🇺' },
//   { code: 'en', name: 'English', flag: '🇬🇧' },
// ];

// export default function TranslationEditor({ 
//   serviceId, 
//   serviceName, 
//   translations,
//   onClose,
//   onSave
// }: Props) {
//   // Ensure the dialog is truly fullscreen even inside "glass" containers
//   // (backdrop-filter creates a containing block for position:fixed).
//   useEffect(() => {
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') onClose();
//     };
//     document.addEventListener('keydown', onKeyDown);
//     // lock body scroll
//     const prevOverflow = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.removeEventListener('keydown', onKeyDown);
//       document.body.style.overflow = prevOverflow;
//     };
//   }, [onClose]);

//   const [formData, setFormData] = useState<Record<string, Translation>>(() => {
//     const data: Record<string, Translation> = {};
//     LANGUAGES.forEach(lang => {
//       const existing = translations.find(t => t.locale === lang.code);
//       data[lang.code] = existing || { locale: lang.code, name: '', description: null };
//     });
//     return data;
//   });

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     try {
//       const response = await fetch('/api/admin/translations', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           serviceId,
//           translations: Object.values(formData).filter(t => t.name.trim()),
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Ошибка сохранения');
//       }

//       onSave();
//       onClose();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка сохранения');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updateTranslation = (locale: string, field: 'name' | 'description', value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [locale]: { ...prev[locale], [field]: value || null }
//     }));
//   };

//   const filledCount = LANGUAGES.filter(lang => formData[lang.code]?.name?.trim()).length;

//   return (
//     <ClientPortal>
//       <AnimatePresence>
//         <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6"
//         style={{
//           backgroundColor: 'rgba(0, 0, 0, 0.75)',
//           backdropFilter: 'blur(8px)',
//         }}
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           className="relative w-full overflow-hidden"
//           style={{
//             maxWidth: '1200px',
//             maxHeight: '90vh',
//             display: 'flex',
//             flexDirection: 'column',
//             backgroundColor: '#0f172a',
//             borderRadius: '16px',
//             border: '1px solid rgba(255, 255, 255, 0.1)',
//             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div 
//             className="relative p-4 sm:p-6"
//             style={{
//               borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
//               background: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))',
//             }}
//           >
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3">
//                 <div 
//                   className="p-2.5 rounded-xl"
//                   style={{
//                     background: 'linear-gradient(to bottom right, #8b5cf6, #06b6d4)',
//                     boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)',
//                   }}
//                 >
//                   <Languages className="h-5 w-5 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg sm:text-xl font-semibold text-white">
//                     Редактировать переводы
//                   </h2>
//                   <p className="text-xs sm:text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
//                     {serviceName}
//                   </p>
//                   <p className="text-xs mt-1" style={{ color: '#c4b5fd' }}>
//                     Заполнено: {filledCount}/3 языков
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-2 rounded-lg transition-all hover:bg-white/10"
//                 type="button"
//               >
//                 <X className="h-5 w-5 text-white" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <form onSubmit={handleSubmit}>
//             <div 
//               className="p-4 sm:p-6"
//               style={{
//                 overflowY: 'auto',
//                 overflowX: 'hidden',
//                 flex: '1 1 auto',
//                 minHeight: 0,
//               }}
//             >
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
//                 {LANGUAGES.map((lang) => {
//                   const translation = formData[lang.code];
//                   const isFilled = translation?.name?.trim();
                  
//                   return (
//                     <div
//                       key={lang.code}
//                       className="min-w-0 p-3 sm:p-4 rounded-xl"
//                       style={{
//                         border: isFilled 
//                           ? '1px solid rgba(139, 92, 246, 0.3)' 
//                           : '1px solid rgba(255, 255, 255, 0.1)',
//                         backgroundColor: isFilled 
//                           ? 'rgba(139, 92, 246, 0.05)' 
//                           : 'rgba(255, 255, 255, 0.05)',
//                       }}
//                     >
//                       {/* Language Header */}
//                       <div 
//                         className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3"
//                         style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
//                       >
//                         <span style={{ fontSize: '24px' }}>{lang.flag}</span>
//                         <div className="flex-1 min-w-0">
//                           <h3 className="font-semibold text-white">{lang.name}</h3>
//                           <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
//                             {lang.code.toUpperCase()}
//                           </p>
//                         </div>
//                         {isFilled && (
//                           <div 
//                             className="w-2 h-2 rounded-full"
//                             style={{
//                               backgroundColor: '#22c55e',
//                               boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
//                             }}
//                           />
//                         )}
//                       </div>

//                       {/* Name Input */}
//                       <div className="mb-3">
//                         <label 
//                           className="block text-sm font-medium mb-1.5"
//                           style={{ color: 'rgba(255, 255, 255, 0.8)' }}
//                         >
//                           Название
//                         </label>
//                         <input
//                           type="text"
//                           value={translation.name}
//                           onChange={(e) => updateTranslation(lang.code, 'name', e.target.value)}
//                           placeholder={`Введите название на ${lang.name.toLowerCase()}`}
//                           style={{
//                             width: '100%',
//                             padding: '8px 12px',
//                             backgroundColor: 'rgba(15, 23, 42, 0.5)',
//                             border: '1px solid rgba(255, 255, 255, 0.1)',
//                             borderRadius: '8px',
//                             color: '#ffffff',
//                             fontSize: '14px',
//                             outline: 'none',
//                           }}
//                           onFocus={(e) => {
//                             e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
//                             e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
//                           }}
//                           onBlur={(e) => {
//                             e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
//                             e.target.style.boxShadow = 'none';
//                           }}
//                         />
//                       </div>

//                       {/* Description Textarea */}
//                       <div>
//                         <label 
//                           className="block text-sm font-medium mb-1.5"
//                           style={{ color: 'rgba(255, 255, 255, 0.8)' }}
//                         >
//                           Описание
//                         </label>
//                         <textarea
//                           value={translation.description || ''}
//                           onChange={(e) => updateTranslation(lang.code, 'description', e.target.value)}
//                           placeholder={`Введите описание на ${lang.name.toLowerCase()}`}
//                           rows={4}
//                           style={{
//                             width: '100%',
//                             padding: '8px 12px',
//                             backgroundColor: 'rgba(15, 23, 42, 0.5)',
//                             border: '1px solid rgba(255, 255, 255, 0.1)',
//                             borderRadius: '8px',
//                             color: '#ffffff',
//                             fontSize: '14px',
//                             outline: 'none',
//                             resize: 'none',
//                           }}
//                           onFocus={(e) => {
//                             e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
//                             e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
//                           }}
//                           onBlur={(e) => {
//                             e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
//                             e.target.style.boxShadow = 'none';
//                           }}
//                         />
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Hint */}
//               <div 
//                 className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg"
//                 style={{
//                   backgroundColor: 'rgba(6, 182, 212, 0.1)',
//                   border: '1px solid rgba(6, 182, 212, 0.2)',
//                 }}
//               >
//                 <div className="flex items-start gap-2">
//                   <Languages className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#06b6d4' }} />
//                   <div>
//                     <p className="font-medium text-sm" style={{ color: '#06b6d4' }}>
//                       Совет:
//                     </p>
//                     <p className="text-xs mt-1" style={{ color: 'rgba(6, 182, 212, 0.8)' }}>
//                       Немецкий (DE) перевод автоматически синхронизируется с основным названием услуги
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Error */}
//               {error && (
//                 <div 
//                   className="mt-4 p-3 rounded-lg"
//                   style={{
//                     backgroundColor: 'rgba(239, 68, 68, 0.1)',
//                     border: '1px solid rgba(239, 68, 68, 0.2)',
//                     color: '#f87171',
//                   }}
//                 >
//                   ⚠️ {error}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div 
//               className="p-4 sm:p-6"
//               style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
//             >
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   disabled={saving}
//                   className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all"
//                   style={{
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     backgroundColor: 'transparent',
//                     color: '#ffffff',
//                   }}
//                 >
//                   Отмена
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving || filledCount === 0}
//                   className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all"
//                   style={{
//                     background: saving || filledCount === 0 
//                       ? 'rgba(139, 92, 246, 0.3)' 
//                       : 'linear-gradient(to right, #8b5cf6, #06b6d4)',
//                     color: '#ffffff',
//                     boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)',
//                     cursor: saving || filledCount === 0 ? 'not-allowed' : 'pointer',
//                     opacity: saving || filledCount === 0 ? 0.5 : 1,
//                   }}
//                 >
//                   <div className="flex items-center justify-center gap-2">
//                     {saving ? (
//                       <>
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         <span>Сохранение...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Save className="h-4 w-4" />
//                         <span>Сохранить переводы</span>
//                       </>
//                     )}
//                   </div>
//                 </button>
//               </div>
//             </div>
//           </form>
//         </motion.div>
//         </motion.div>
//       </AnimatePresence>
//     </ClientPortal>
//   );
// }




//-----------фиксим с гпт--------
// // src/app/admin/services/TranslationEditor.tsx
// 'use client';

// import { useState } from 'react';
// import { Languages, Save, X, Loader2 } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// type Translation = {
//   locale: string;
//   name: string;
//   description: string | null;
// };

// type Props = {
//   serviceId: string;
//   serviceName: string;
//   translations: Translation[];
//   onClose: () => void;
//   onSave: () => void;
// };

// const LANGUAGES = [
//   { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
//   { code: 'ru', name: 'Русский', flag: '🇷🇺' },
//   { code: 'en', name: 'English', flag: '🇬🇧' },
// ];

// export default function TranslationEditor({ 
//   serviceId, 
//   serviceName, 
//   translations,
//   onClose,
//   onSave
// }: Props) {
//   const [formData, setFormData] = useState<Record<string, Translation>>(() => {
//     const data: Record<string, Translation> = {};
//     LANGUAGES.forEach(lang => {
//       const existing = translations.find(t => t.locale === lang.code);
//       data[lang.code] = existing || { locale: lang.code, name: '', description: null };
//     });
//     return data;
//   });

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     try {
//       const response = await fetch('/api/admin/translations', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           serviceId,
//           translations: Object.values(formData).filter(t => t.name.trim()),
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Ошибка сохранения');
//       }

//       onSave();
//       onClose();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка сохранения');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updateTranslation = (locale: string, field: 'name' | 'description', value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [locale]: { ...prev[locale], [field]: value || null }
//     }));
//   };

//   const filledCount = LANGUAGES.filter(lang => formData[lang.code]?.name?.trim()).length;

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
//         style={{
//           backgroundColor: 'rgba(0, 0, 0, 0.75)',
//           backdropFilter: 'blur(8px)',
//         }}
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           className="relative w-full overflow-hidden"
//           style={{
//             maxWidth: '1200px',
//             maxHeight: '90vh',
//             display: 'flex',
//             flexDirection: 'column',
//             backgroundColor: '#0f172a',
//             borderRadius: '16px',
//             border: '1px solid rgba(255, 255, 255, 0.1)',
//             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
//           }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div 
//             className="relative p-4 sm:p-6"
//             style={{
//               borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
//               background: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))',
//             }}
//           >
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3">
//                 <div 
//                   className="p-2.5 rounded-xl"
//                   style={{
//                     background: 'linear-gradient(to bottom right, #8b5cf6, #06b6d4)',
//                     boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)',
//                   }}
//                 >
//                   <Languages className="h-5 w-5 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg sm:text-xl font-semibold text-white">
//                     Редактировать переводы
//                   </h2>
//                   <p className="text-xs sm:text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
//                     {serviceName}
//                   </p>
//                   <p className="text-xs mt-1" style={{ color: '#c4b5fd' }}>
//                     Заполнено: {filledCount}/3 языков
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-2 rounded-lg transition-all hover:bg-white/10"
//                 type="button"
//               >
//                 <X className="h-5 w-5 text-white" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <form onSubmit={handleSubmit}>
//             <div 
//               className="p-4 sm:p-6"
//               style={{
//                 overflowY: 'auto',
//                 overflowX: 'hidden',
//                 flex: '1 1 auto',
//                 minHeight: 0,
//               }}
//             >
//               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
//                 {LANGUAGES.map((lang) => {
//                   const translation = formData[lang.code];
//                   const isFilled = translation?.name?.trim();
                  
//                   return (
//                     <div
//                       key={lang.code}
//                       className="min-w-0 p-3 sm:p-4 rounded-xl"
//                       style={{
//                         border: isFilled 
//                           ? '1px solid rgba(139, 92, 246, 0.3)' 
//                           : '1px solid rgba(255, 255, 255, 0.1)',
//                         backgroundColor: isFilled 
//                           ? 'rgba(139, 92, 246, 0.05)' 
//                           : 'rgba(255, 255, 255, 0.05)',
//                       }}
//                     >
//                       {/* Language Header */}
//                       <div 
//                         className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 pb-3"
//                         style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
//                       >
//                         <span style={{ fontSize: '24px' }}>{lang.flag}</span>
//                         <div className="flex-1 min-w-0">
//                           <h3 className="font-semibold text-white">{lang.name}</h3>
//                           <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
//                             {lang.code.toUpperCase()}
//                           </p>
//                         </div>
//                         {isFilled && (
//                           <div 
//                             className="w-2 h-2 rounded-full"
//                             style={{
//                               backgroundColor: '#22c55e',
//                               boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
//                             }}
//                           />
//                         )}
//                       </div>

//                       {/* Name Input */}
//                       <div className="mb-3">
//                         <label 
//                           className="block text-sm font-medium mb-1.5"
//                           style={{ color: 'rgba(255, 255, 255, 0.8)' }}
//                         >
//                           Название
//                         </label>
//                         <input
//                           type="text"
//                           value={translation.name}
//                           onChange={(e) => updateTranslation(lang.code, 'name', e.target.value)}
//                           placeholder={`Введите название на ${lang.name.toLowerCase()}`}
//                           style={{
//                             width: '100%',
//                             padding: '8px 12px',
//                             backgroundColor: 'rgba(15, 23, 42, 0.5)',
//                             border: '1px solid rgba(255, 255, 255, 0.1)',
//                             borderRadius: '8px',
//                             color: '#ffffff',
//                             fontSize: '14px',
//                             outline: 'none',
//                           }}
//                           onFocus={(e) => {
//                             e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
//                             e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
//                           }}
//                           onBlur={(e) => {
//                             e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
//                             e.target.style.boxShadow = 'none';
//                           }}
//                         />
//                       </div>

//                       {/* Description Textarea */}
//                       <div>
//                         <label 
//                           className="block text-sm font-medium mb-1.5"
//                           style={{ color: 'rgba(255, 255, 255, 0.8)' }}
//                         >
//                           Описание
//                         </label>
//                         <textarea
//                           value={translation.description || ''}
//                           onChange={(e) => updateTranslation(lang.code, 'description', e.target.value)}
//                           placeholder={`Введите описание на ${lang.name.toLowerCase()}`}
//                           rows={4}
//                           style={{
//                             width: '100%',
//                             padding: '8px 12px',
//                             backgroundColor: 'rgba(15, 23, 42, 0.5)',
//                             border: '1px solid rgba(255, 255, 255, 0.1)',
//                             borderRadius: '8px',
//                             color: '#ffffff',
//                             fontSize: '14px',
//                             outline: 'none',
//                             resize: 'none',
//                           }}
//                           onFocus={(e) => {
//                             e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
//                             e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
//                           }}
//                           onBlur={(e) => {
//                             e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
//                             e.target.style.boxShadow = 'none';
//                           }}
//                         />
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Hint */}
//               <div 
//                 className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg"
//                 style={{
//                   backgroundColor: 'rgba(6, 182, 212, 0.1)',
//                   border: '1px solid rgba(6, 182, 212, 0.2)',
//                 }}
//               >
//                 <div className="flex items-start gap-2">
//                   <Languages className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#06b6d4' }} />
//                   <div>
//                     <p className="font-medium text-sm" style={{ color: '#06b6d4' }}>
//                       Совет:
//                     </p>
//                     <p className="text-xs mt-1" style={{ color: 'rgba(6, 182, 212, 0.8)' }}>
//                       Немецкий (DE) перевод автоматически синхронизируется с основным названием услуги
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Error */}
//               {error && (
//                 <div 
//                   className="mt-4 p-3 rounded-lg"
//                   style={{
//                     backgroundColor: 'rgba(239, 68, 68, 0.1)',
//                     border: '1px solid rgba(239, 68, 68, 0.2)',
//                     color: '#f87171',
//                   }}
//                 >
//                   ⚠️ {error}
//                 </div>
//               )}
//             </div>

//             {/* Footer */}
//             <div 
//               className="p-4 sm:p-6"
//               style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
//             >
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   disabled={saving}
//                   className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all"
//                   style={{
//                     border: '1px solid rgba(255, 255, 255, 0.1)',
//                     backgroundColor: 'transparent',
//                     color: '#ffffff',
//                   }}
//                 >
//                   Отмена
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving || filledCount === 0}
//                   className="w-full sm:flex-1 px-4 py-2.5 rounded-xl font-medium text-sm sm:text-base transition-all"
//                   style={{
//                     background: saving || filledCount === 0 
//                       ? 'rgba(139, 92, 246, 0.3)' 
//                       : 'linear-gradient(to right, #8b5cf6, #06b6d4)',
//                     color: '#ffffff',
//                     boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)',
//                     cursor: saving || filledCount === 0 ? 'not-allowed' : 'pointer',
//                     opacity: saving || filledCount === 0 ? 0.5 : 1,
//                   }}
//                 >
//                   <div className="flex items-center justify-center gap-2">
//                     {saving ? (
//                       <>
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                         <span>Сохранение...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Save className="h-4 w-4" />
//                         <span>Сохранить переводы</span>
//                       </>
//                     )}
//                   </div>
//                 </button>
//               </div>
//             </div>
//           </form>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }







// // src/app/admin/services/TranslationEditor.tsx
// 'use client';

// import { useState } from 'react';
// import { Languages, Save, X, Loader2 } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// type Translation = {
//   locale: string;
//   name: string;
//   description: string | null;
// };

// type Props = {
//   serviceId: string;
//   serviceName: string;
//   translations: Translation[];
//   onClose: () => void;
//   onSave: () => void;
// };

// const LANGUAGES = [
//   { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
//   { code: 'ru', name: 'Русский', flag: '🇷🇺' },
//   { code: 'en', name: 'English', flag: '🇬🇧' },
// ];

// export default function TranslationEditor({ 
//   serviceId, 
//   serviceName, 
//   translations,
//   onClose,
//   onSave
// }: Props) {
//   const [formData, setFormData] = useState<Record<string, Translation>>(() => {
//     const data: Record<string, Translation> = {};
//     LANGUAGES.forEach(lang => {
//       const existing = translations.find(t => t.locale === lang.code);
//       data[lang.code] = existing || { locale: lang.code, name: '', description: null };
//     });
//     return data;
//   });

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     try {
//       const response = await fetch('/api/admin/translations', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           serviceId,
//           translations: Object.values(formData).filter(t => t.name.trim()),
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Ошибка сохранения');
//       }

//       onSave();
//       onClose();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка сохранения');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updateTranslation = (locale: string, field: 'name' | 'description', value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [locale]: { ...prev[locale], [field]: value || null }
//     }));
//   };

//   // Подсчитать количество заполненных переводов
//   const filledCount = LANGUAGES.filter(lang => formData[lang.code]?.name?.trim()).length;

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           className="relative w-full max-w-5xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="relative border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 p-6">
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg">
//                   <Languages className="h-5 w-5 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-semibold text-white">Редактировать переводы</h2>
//                   <p className="text-sm text-white/60 mt-1">{serviceName}</p>
//                   <p className="text-xs text-violet-300 mt-1">
//                     Заполнено: {filledCount}/3 языков
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
//                 title="Закрыть (Esc)"
//               >
//                 <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto">
//             {/* ✅ СЕТКА на 3 колонки для desktop, 1 колонка для mobile */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//               {LANGUAGES.map((lang) => {
//                 const translation = formData[lang.code];
//                 const isFilled = translation?.name?.trim();
                
//                 return (
//                   <div
//                     key={lang.code}
//                     className={`p-4 rounded-xl border transition-all ${
//                       isFilled
//                         ? 'border-violet-500/30 bg-violet-500/5'
//                         : 'border-white/10 bg-white/5 hover:bg-white/10'
//                     }`}
//                   >
//                     {/* Заголовок языка */}
//                     <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
//                       <span className="text-3xl">{lang.flag}</span>
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-white">{lang.name}</h3>
//                         <p className="text-xs text-white/50">{lang.code.toUpperCase()}</p>
//                       </div>
//                       {isFilled && (
//                         <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
//                       )}
//                     </div>

//                     <div className="space-y-3">
//                       {/* Name */}
//                       <div>
//                         <label className="block text-sm font-medium text-white/80 mb-1.5">
//                           Название
//                         </label>
//                         <input
//                           type="text"
//                           value={translation.name}
//                           onChange={(e) => updateTranslation(lang.code, 'name', e.target.value)}
//                           className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
//                           placeholder={`Название на ${lang.name.toLowerCase()}`}
//                         />
//                       </div>

//                       {/* Description */}
//                       <div>
//                         <label className="block text-sm font-medium text-white/80 mb-1.5">
//                           Описание
//                         </label>
//                         <textarea
//                           value={translation.description || ''}
//                           onChange={(e) => updateTranslation(lang.code, 'description', e.target.value)}
//                           rows={4}
//                           className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none text-sm"
//                           placeholder={`Описание на ${lang.name.toLowerCase()}`}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Подсказка */}
//             <div className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm">
//               <div className="flex items-start gap-2">
//                 <Languages className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <p className="font-medium">Совет:</p>
//                   <p className="text-xs text-cyan-300/80 mt-1">
//                     Немецкий (DE) перевод автоматически синхронизируется с основным названием услуги
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Error */}
//             {error && (
//               <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
//                 ⚠️ {error}
//               </div>
//             )}

//             {/* Footer */}
//             <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={saving}
//                 className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//               >
//                 Отмена
//               </button>
//               <button
//                 type="submit"
//                 disabled={saving || filledCount === 0}
//                 className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-lg"
//               >
//                 {saving ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Сохранение...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4" />
//                     Сохранить переводы
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }






// // src/app/admin/services/TranslationEditor.tsx
// 'use client';

// import { useState } from 'react';
// import { Languages, Save, X, Loader2 } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// type Translation = {
//   locale: string;
//   name: string;
//   description: string | null;
// };

// type Props = {
//   serviceId: string;
//   serviceName: string;
//   translations: Translation[];
//   onClose: () => void;
//   onSave: () => void;
// };

// const LANGUAGES = [
//   { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
//   { code: 'ru', name: 'Русский', flag: '🇷🇺' },
//   { code: 'en', name: 'English', flag: '🇬🇧' },
// ];

// export default function TranslationEditor({ 
//   serviceId, 
//   serviceName, 
//   translations,
//   onClose,
//   onSave
// }: Props) {
//   const [formData, setFormData] = useState<Record<string, Translation>>(() => {
//     const data: Record<string, Translation> = {};
//     LANGUAGES.forEach(lang => {
//       const existing = translations.find(t => t.locale === lang.code);
//       data[lang.code] = existing || { locale: lang.code, name: '', description: null };
//     });
//     return data;
//   });

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     try {
//       const response = await fetch('/api/admin/translations', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           serviceId,
//           translations: Object.values(formData).filter(t => t.name.trim()),
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Ошибка сохранения');
//       }

//       onSave();
//       onClose();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка сохранения');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updateTranslation = (locale: string, field: 'name' | 'description', value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [locale]: { ...prev[locale], [field]: value || null }
//     }));
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           className="relative w-full max-w-3xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="relative border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 p-6">
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
//                   <Languages className="h-5 w-5 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-semibold text-white">Редактировать переводы</h2>
//                   <p className="text-sm text-white/60 mt-1">{serviceName}</p>
//                 </div>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-2 rounded-lg hover:bg-white/10 transition-colors"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
//             <div className="space-y-6">
//               {LANGUAGES.map((lang) => {
//                 const translation = formData[lang.code];
//                 return (
//                   <div
//                     key={lang.code}
//                     className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
//                   >
//                     <div className="flex items-center gap-3 mb-4">
//                       <span className="text-3xl">{lang.flag}</span>
//                       <div>
//                         <h3 className="font-semibold text-white">{lang.name}</h3>
//                         <p className="text-xs text-white/50">{lang.code.toUpperCase()}</p>
//                       </div>
//                     </div>

//                     <div className="space-y-3">
//                       {/* Name */}
//                       <div>
//                         <label className="block text-sm font-medium text-white/80 mb-1.5">
//                           Название
//                         </label>
//                         <input
//                           type="text"
//                           value={translation.name}
//                           onChange={(e) => updateTranslation(lang.code, 'name', e.target.value)}
//                           className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
//                           placeholder={`Введите название на ${lang.name.toLowerCase()}`}
//                         />
//                       </div>

//                       {/* Description */}
//                       <div>
//                         <label className="block text-sm font-medium text-white/80 mb-1.5">
//                           Описание
//                         </label>
//                         <textarea
//                           value={translation.description || ''}
//                           onChange={(e) => updateTranslation(lang.code, 'description', e.target.value)}
//                           rows={3}
//                           className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
//                           placeholder={`Введите описание на ${lang.name.toLowerCase()}`}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Error */}
//             {error && (
//               <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
//                 {error}
//               </div>
//             )}

//             {/* Footer */}
//             <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={saving}
//                 className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Отмена
//               </button>
//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
//               >
//                 {saving ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Сохранение...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4" />
//                     Сохранить
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }





// // src/app/admin/services/TranslationEditor.tsx
// 'use client';

// import { useState } from 'react';
// import { Languages, Save, X, Loader2 } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// type Translation = {
//   locale: string;
//   name: string;
//   description: string | null;
// };

// type Props = {
//   serviceId: string;
//   serviceName: string;
//   translations: Translation[];
//   onClose: () => void;
//   onSave: () => void;
// };

// const LANGUAGES = [
//   { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
//   { code: 'ru', name: 'Русский', flag: '🇷🇺' },
//   { code: 'en', name: 'English', flag: '🇬🇧' },
// ];

// export default function TranslationEditor({ 
//   serviceId, 
//   serviceName, 
//   translations,
//   onClose,
//   onSave
// }: Props) {
//   const [formData, setFormData] = useState<Record<string, Translation>>(() => {
//     const data: Record<string, Translation> = {};
//     LANGUAGES.forEach(lang => {
//       const existing = translations.find(t => t.locale === lang.code);
//       data[lang.code] = existing || { locale: lang.code, name: '', description: null };
//     });
//     return data;
//   });

//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);

//     try {
//       const response = await fetch('/api/admin/translations', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           serviceId,
//           translations: Object.values(formData).filter(t => t.name.trim()),
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Ошибка сохранения');
//       }

//       onSave();
//       onClose();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Ошибка сохранения');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updateTranslation = (locale: string, field: 'name' | 'description', value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [locale]: { ...prev[locale], [field]: value || null }
//     }));
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           className="relative w-full max-w-3xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="relative border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 p-6">
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
//                   <Languages className="h-5 w-5 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-semibold text-white">Редактировать переводы</h2>
//                   <p className="text-sm text-white/60 mt-1">{serviceName}</p>
//                 </div>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-2 rounded-lg hover:bg-white/10 transition-colors"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
//             <div className="space-y-6">
//               {LANGUAGES.map((lang) => {
//                 const translation = formData[lang.code];
//                 return (
//                   <div
//                     key={lang.code}
//                     className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
//                   >
//                     <div className="flex items-center gap-3 mb-4">
//                       <span className="text-3xl">{lang.flag}</span>
//                       <div>
//                         <h3 className="font-semibold text-white">{lang.name}</h3>
//                         <p className="text-xs text-white/50">{lang.code.toUpperCase()}</p>
//                       </div>
//                     </div>

//                     <div className="space-y-3">
//                       {/* Name */}
//                       <div>
//                         <label className="block text-sm font-medium text-white/80 mb-1.5">
//                           Название
//                         </label>
//                         <input
//                           type="text"
//                           value={translation.name}
//                           onChange={(e) => updateTranslation(lang.code, 'name', e.target.value)}
//                           className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
//                           placeholder={`Введите название на ${lang.name.toLowerCase()}`}
//                         />
//                       </div>

//                       {/* Description */}
//                       <div>
//                         <label className="block text-sm font-medium text-white/80 mb-1.5">
//                           Описание
//                         </label>
//                         <textarea
//                           value={translation.description || ''}
//                           onChange={(e) => updateTranslation(lang.code, 'description', e.target.value)}
//                           rows={3}
//                           className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
//                           placeholder={`Введите описание на ${lang.name.toLowerCase()}`}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Error */}
//             {error && (
//               <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
//                 {error}
//               </div>
//             )}

//             {/* Footer */}
//             <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={saving}
//                 className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Отмена
//               </button>
//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
//               >
//                 {saving ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Сохранение...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4" />
//                     Сохранить
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
