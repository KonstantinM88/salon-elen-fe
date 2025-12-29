// src/components/TelegramRegistrationModal.tsx

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTelegram } from 'react-icons/fa';
import { X, ExternalLink, CheckCircle } from 'lucide-react';

interface TelegramRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  botUsername: string; // Например: @salon_elen_bot
  phone: string;
}

export function TelegramRegistrationModal({
  isOpen,
  onClose,
  botUsername,
  phone,
}: TelegramRegistrationModalProps) {
  // Deep link к боту с номером телефона
  // Формат: https://t.me/bot?start=phone_380679014039
  const phoneParam = phone.replace('+', ''); // Убрать +
  const botUrl = `https://t.me/${botUsername.replace('@', '')}?start=phone_${phoneParam}`;

  const handleOpenBot = () => {
    // Открыть бота в новой вкладке
    window.open(botUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-white"
              >
                <X size={20} />
              </button>

              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-4">
                  <FaTelegram className="text-4xl text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="mb-2 text-center text-2xl font-bold text-white">
                Регистрация в Telegram боте
              </h2>

              {/* Subtitle */}
              <p className="mb-6 text-center text-slate-300">
                Для получения кодов подтверждения необходимо зарегистрироваться в нашем Telegram боте
              </p>

              {/* Phone */}
              <div className="mb-6 rounded-xl bg-slate-800/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Ваш номер:</span>
                  <span className="font-mono text-lg text-cyan-400">{phone}</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6 space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
                    1
                  </div>
                  <p className="text-sm text-slate-300">
                    Нажмите кнопку ниже, чтобы открыть Telegram бота
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-400">
                    2
                  </div>
                  <p className="text-sm text-slate-300">
                    Бот автоматически зарегистрирует ваш номер <code className="rounded bg-slate-700 px-1 py-0.5 text-cyan-400">{phone}</code>
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-400">
                    <CheckCircle size={16} />
                  </div>
                  <p className="text-sm text-slate-300">
                    Вернитесь сюда и нажмите «Я зарегистрировался»
                  </p>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={handleOpenBot}
                className="group relative mb-4 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/50"
              >
                <div className="flex items-center justify-center gap-2">
                  <FaTelegram className="text-xl" />
                  <span>Открыть Telegram бота</span>
                  <ExternalLink size={16} className="opacity-70" />
                </div>
              </button>

              {/* Secondary button */}
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-slate-700/50 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-700"
              >
                Я зарегистрировался
              </button>

              {/* Note */}
              <p className="mt-4 text-center text-xs text-slate-400">
                После регистрации вы будете получать коды подтверждения в Telegram
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}






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