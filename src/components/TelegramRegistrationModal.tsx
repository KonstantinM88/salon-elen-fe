// src/components/TelegramRegistrationModal.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Check } from 'lucide-react';
import { useTranslations } from '@/i18n/useTranslations';

interface TelegramRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  botUsername: string;
  phone: string;
}

export function TelegramRegistrationModal({
  isOpen,
  onClose,
  botUsername,
  phone,
}: TelegramRegistrationModalProps) {
  const t = useTranslations();
  const rawDigits = phone.replace(/\D/g, '');
  const normalizedDigits =
    rawDigits.length === 10 && rawDigits.startsWith('0')
      ? `38${rawDigits}`
      : rawDigits;
  const telegramUrl = normalizedDigits
    ? `https://t.me/${botUsername}?start=phone_${normalizedDigits}`
    : `https://t.me/${botUsername}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-sky-400/30 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 shadow-[0_0_50px_rgba(56,189,248,0.3)] backdrop-blur-xl sm:p-8"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="space-y-6">
                {/* Title */}
                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-sky-400/70 bg-gradient-to-br from-sky-400/25 to-slate-900"
                  >
                    <svg
                      className="h-10 w-10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ color: '#2AABEE' }}
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                  </motion.div>

                  <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                    {t('booking_telegram_modal_title')}
                  </h2>
                  <p className="text-sm text-slate-300 sm:text-base">
                    {t('booking_telegram_modal_subtitle')}
                  </p>
                </div>

                {/* Phone info */}
                <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-4 backdrop-blur-xl">
                  <p className="text-center text-sm text-sky-100">
                    {t('booking_telegram_modal_phone_label')}{' '}
                    <span className="font-bold text-sky-300">{phone}</span>
                  </p>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-white">
                    {t('booking_telegram_modal_how_title')}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-300">
                        1
                      </div>
                      <p className="flex-1 text-sm text-slate-200">
                        {t('booking_telegram_modal_step_open_bot')}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-300">
                        2
                      </div>
                      <p className="flex-1 text-sm text-slate-200">
                        {t('booking_telegram_modal_step_register')}{' '}
                        <span className="font-semibold text-sky-300">{phone}</span>
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">
                        <Check className="h-4 w-4" />
                      </div>
                      <p className="flex-1 text-sm text-slate-200">
                        {t('booking_telegram_modal_step_done')}{' '}
                        <span className="font-semibold text-emerald-300">
                          {t('booking_telegram_modal_button_done')}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  {/* Open Telegram button */}
                  <motion.a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3.5 text-base font-bold text-white shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all hover:shadow-[0_0_40px_rgba(56,189,248,0.7)]"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                    <span>{t('booking_telegram_modal_button_open')}</span>
                    <ExternalLink className="h-4 w-4" />
                  </motion.a>

                  {/* I'm registered button */}
                  <motion.button
                    type="button"
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl border-2 border-emerald-400/50 bg-emerald-500/10 px-6 py-3.5 text-base font-bold text-emerald-300 transition-all hover:border-emerald-400/70 hover:bg-emerald-500/20"
                  >
                    ✓ {t('booking_telegram_modal_button_done')}
                  </motion.button>
                </div>

                {/* Info */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
                  <p className="text-center text-xs text-slate-400">
                    {t('booking_telegram_modal_note')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}




//--------на главной странице всё работало, добавляю оптимизазацию для мобильной версии для полной регистрации
// // src/components/TelegramRegistrationModal.tsx

// 'use client';

// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaTelegram } from 'react-icons/fa';
// import { X, ExternalLink, CheckCircle } from 'lucide-react';

// interface TelegramRegistrationModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   botUsername: string; // Например: @salon_elen_bot
//   phone: string;
// }

// export function TelegramRegistrationModal({
//   isOpen,
//   onClose,
//   botUsername,
//   phone,
// }: TelegramRegistrationModalProps) {
//   // Deep link к боту с номером телефона
//   // Формат: https://t.me/bot?start=phone_380679014039
//   const phoneParam = phone.replace('+', ''); // Убрать +
//   const botUrl = `https://t.me/${botUsername.replace('@', '')}?start=phone_${phoneParam}`;

//   const handleOpenBot = () => {
//     // Открыть бота в новой вкладке
//     window.open(botUrl, '_blank');
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Overlay */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
//             onClick={onClose}
//           />

//           {/* Modal */}
//           <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 20 }}
//               className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Close button */}
//               <button
//                 onClick={onClose}
//                 className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
//               >
//                 <X size={20} />
//               </button>

//               {/* Icon */}
//               <div className="mb-6 flex justify-center">
//                 <div className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-4">
//                   <FaTelegram className="text-4xl text-white" />
//                 </div>
//               </div>

//               {/* Title */}
//               <h2 className="mb-2 text-center text-2xl font-bold text-white">
//                 Регистрация в Telegram боте
//               </h2>

//               {/* Subtitle */}
//               <p className="mb-6 text-center text-slate-300">
//                 Для получения кодов подтверждения необходимо зарегистрироваться в нашем Telegram боте
//               </p>

//               {/* Phone */}
//               <div className="mb-6 rounded-xl bg-slate-800/50 p-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-slate-400">Ваш номер:</span>
//                   <span className="font-mono text-lg text-cyan-400">{phone}</span>
//                 </div>
//               </div>

//               {/* Instructions */}
//               <div className="mb-6 space-y-3">
//                 <div className="flex gap-3">
//                   <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
//                     1
//                   </div>
//                   <p className="text-sm text-slate-300">
//                     Нажмите кнопку ниже, чтобы открыть Telegram бота
//                   </p>
//                 </div>

//                 <div className="flex gap-3">
//                   <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
//                     2
//                   </div>
//                   <p className="text-sm text-slate-300">
//                     Бот автоматически зарегистрирует ваш номер <code className="rounded bg-slate-700 px-1 py-0.5 text-cyan-400">{phone}</code>
//                   </p>
//                 </div>

//                 <div className="flex gap-3">
//                   <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-400">
//                     <CheckCircle size={16} />
//                   </div>
//                   <p className="text-sm text-slate-300">
//                     Вернитесь сюда и нажмите «Я зарегистрировался»
//                   </p>
//                 </div>
//               </div>

//               {/* Button */}
//               <button
//                 onClick={handleOpenBot}
//                 className="group relative mb-4 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/50"
//               >
//                 <div className="flex items-center justify-center gap-2">
//                   <FaTelegram className="text-xl" />
//                   <span>Открыть Telegram бота</span>
//                   <ExternalLink size={16} className="opacity-70" />
//                 </div>
//               </button>

//               {/* Secondary button */}
//               <button
//                 onClick={onClose}
//                 className="w-full rounded-xl bg-slate-700/50 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-700"
//               >
//                 Я зарегистрировался
//               </button>

//               {/* Note */}
//               <p className="mt-4 text-center text-xs text-slate-400">
//                 После регистрации вы будете получать коды подтверждения в Telegram
//               </p>
//             </motion.div>
//           </div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }






//---------всё работает, дорабатываем автоматизацию-----
// // src/components/TelegramRegistrationModal.tsx

// 'use client';

// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaTelegram } from 'react-icons/fa';
// import { X, ExternalLink, CheckCircle } from 'lucide-react';

// interface TelegramRegistrationModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   botUsername: string; // Например: @salon_elen_bot
//   phone: string;
// }

// export function TelegramRegistrationModal({
//   isOpen,
//   onClose,
//   botUsername,
//   phone,
// }: TelegramRegistrationModalProps) {
//   // Deep link к боту
//   const botUrl = `https://t.me/${botUsername.replace('@', '')}?start=register`;

//   const handleOpenBot = () => {
//     // Открыть бота в новой вкладке
//     window.open(botUrl, '_blank');
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Overlay */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
//             onClick={onClose}
//           />

//           {/* Modal */}
//           <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 20 }}
//               className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Close button */}
//               <button
//                 onClick={onClose}
//                 className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
//               >
//                 <X size={20} />
//               </button>

//               {/* Icon */}
//               <div className="mb-6 flex justify-center">
//                 <div className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-4">
//                   <FaTelegram className="text-4xl text-white" />
//                 </div>
//               </div>

//               {/* Title */}
//               <h2 className="mb-2 text-center text-2xl font-bold text-white">
//                 Регистрация в Telegram боте
//               </h2>

//               {/* Subtitle */}
//               <p className="mb-6 text-center text-slate-300">
//                 Для получения кодов подтверждения необходимо зарегистрироваться в нашем Telegram боте
//               </p>

//               {/* Phone */}
//               <div className="mb-6 rounded-xl bg-slate-800/50 p-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-slate-400">Ваш номер:</span>
//                   <span className="font-mono text-lg text-cyan-400">{phone}</span>
//                 </div>
//               </div>

//               {/* Instructions */}
//               <div className="mb-6 space-y-3">
//                 <div className="flex gap-3">
//                   <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
//                     1
//                   </div>
//                   <p className="text-sm text-slate-300">
//                     Нажмите кнопку ниже, чтобы открыть Telegram бота
//                   </p>
//                 </div>

//                 <div className="flex gap-3">
//                   <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
//                     2
//                   </div>
//                   <p className="text-sm text-slate-300">
//                     Отправьте боту команду <code className="rounded bg-slate-700 px-1 py-0.5 text-cyan-400">/start</code>
//                   </p>
//                 </div>

//                 <div className="flex gap-3">
//                   <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
//                     3
//                   </div>
//                   <p className="text-sm text-slate-300">
//                     Отправьте боту свой номер телефона: <code className="rounded bg-slate-700 px-1 py-0.5 text-cyan-400">{phone}</code>
//                   </p>
//                 </div>

//                 <div className="flex gap-3">
//                   <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-400">
//                     <CheckCircle size={16} />
//                   </div>
//                   <p className="text-sm text-slate-300">
//                     Вернитесь сюда и нажмите «Я зарегистрировался»
//                   </p>
//                 </div>
//               </div>

//               {/* Button */}
//               <button
//                 onClick={handleOpenBot}
//                 className="group relative mb-4 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/50"
//               >
//                 <div className="flex items-center justify-center gap-2">
//                   <FaTelegram className="text-xl" />
//                   <span>Открыть Telegram бота</span>
//                   <ExternalLink size={16} className="opacity-70" />
//                 </div>
//               </button>

//               {/* Secondary button */}
//               <button
//                 onClick={onClose}
//                 className="w-full rounded-xl bg-slate-700/50 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-700"
//               >
//                 Я зарегистрировался
//               </button>

//               {/* Note */}
//               <p className="mt-4 text-center text-xs text-slate-400">
//                 После регистрации вы будете получать коды подтверждения в Telegram
//               </p>
//             </motion.div>
//           </div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }
