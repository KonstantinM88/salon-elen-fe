// src/components/PremiumProgressBar.tsx
// ФИНАЛЬНАЯ ВЕРСИЯ: gap-2 (8px) + 7 символов (Dienstl..)
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "@/i18n/useTranslations";

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface PremiumProgressBarProps {
  currentStep: number;
  steps: Step[];
  showLogo?: boolean;
}

export default function PremiumProgressBar({
  currentStep,
  steps,
  showLogo = true,
}: PremiumProgressBarProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;
  const t = useTranslations();

  // ✅ Функция для сокращения длинных названий на мобильных (7 символов)
  const truncateLabel = (label: string, maxLength: number = 7) => {
    if (label.length <= maxLength) return label;
    return label.substring(0, maxLength) + '..';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
      {/* 👁️ УЛУЧШЕННЫЙ ЛОГОТИП С СВЕЧЕНИЕМ */}
      {showLogo && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-3"
        >
          {/* Логотип с двойным контейнером и свечением */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 p-0.5 shadow-xl shadow-amber-500/40"
          >
            {/* Внутренний контейнер */}
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-2xl md:text-3xl"
              >
                👁️
              </motion.span>
            </div>

            {/* Пульсирующее свечение */}
            <motion.div
              className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* Текст логотипа */}
          <div className="hidden sm:block">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl font-bold tracking-wider italic bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent"
            >
              {t("site_name")}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs uppercase tracking-widest text-amber-300/70 italic"
            >
              {t("booking_header_subtitle")}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ШАГИ ПРОГРЕССА - GAP: 8px + 7 СИМВОЛОВ */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        {/* ✅ ФИНАЛЬНАЯ ВЕРСИЯ: pl-16 sm:pl-20 md:pl-0 + gap-2 sm:gap-3 md:gap-4 + 7 символов */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto pl-16 sm:pl-20 md:pl-0">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <React.Fragment key={step.id}>
                {/* ✨ Улучшенная анимация шага */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="flex flex-col items-center gap-1 md:gap-2"
                >
                  {/* Иконка шага с улучшенными эффектами */}
                  <div className="relative">
                    {/* Свечение для текущего шага */}
                    {isCurrent && (
                      <motion.div
                        className="absolute -inset-2 md:-inset-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 blur-xl md:blur-2xl"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0.6, 0.3, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}

                    {/* 🌈 РАДУЖНЫЙ КОНТУР - обертка для завершенных и неактивных */}
                    {!isCurrent ? (
                      <div
                        className={`
                          p-[2px] rounded-full
                          bg-gradient-to-r from-cyan-400 via-purple-500 via-orange-500 to-amber-400
                          ${isCompleted ? 'opacity-100' : 'opacity-50'}
                        `}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className={`
                            w-10 h-10 md:w-14 md:h-14 rounded-full 
                            flex items-center justify-center text-base md:text-xl
                            transition-all duration-500 shadow-xl md:shadow-2xl
                            ${
                              isCompleted
                                ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-500/50"
                                : "bg-slate-900 text-white/40"
                            }
                          `}
                        >
                          {/* Иконка или чекмарк */}
                          {isCompleted ? (
                            <motion.svg
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}
                              className="w-5 h-5 md:w-7 md:h-7 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={4}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </motion.svg>
                          ) : (
                            <div className="font-bold">{step.icon}</div>
                          )}
                        </motion.div>
                      </div>
                    ) : (
                      // Текущий шаг БЕЗ радужного контура
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="relative w-10 h-10 md:w-14 md:h-14 rounded-full 
                          flex items-center justify-center text-base md:text-xl
                          transition-all duration-500 shadow-xl md:shadow-2xl
                          bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 text-black scale-105 md:scale-110 shadow-amber-500/60"
                      >
                        <div className="font-bold text-black">{step.icon}</div>

                        {/* Анимированное кольцо для текущего шага */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 md:border-4 border-amber-300/60"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Название шага - 7 СИМВОЛОВ НА МОБИЛЬНЫХ */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={`
                      text-[9px] md:text-xs font-medium text-center whitespace-nowrap italic uppercase tracking-wider
                      transition-all duration-300
                      ${
                        isCurrent
                          ? "bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent font-bold"
                          : isCompleted
                          ? "text-cyan-300"
                          : "text-white/40"
                      }
                    `}
                  >
                    {/* ✅ 7 символов: DIENSTL.. вместо DIENST.. */}
                    <span className="md:hidden">{truncateLabel(step.label, 7)}</span>
                    <span className="hidden md:inline">{step.label}</span>
                  </motion.div>
                </motion.div>

                {/* ✨ Анимированная линия между шагами */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden max-w-[60px] lg:max-w-[80px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isCompleted ? "100%" : "0%" }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 h-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30"
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 🌈 ЖИВАЯ РАДУЖНАЯ ПОЛОСА С ПРОГРЕССОМ */}
      <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-slate-900/50 overflow-hidden">
        {/* Основная радужная полоса с прогрессом */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative h-full bg-gradient-to-r from-cyan-400 via-purple-500 via-orange-500 to-amber-400 shadow-xl"
        >
          {/* Движущийся блик */}
          <motion.div
            className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    </div>
  );
}




//----------почти то что надо--------
// // src/components/PremiumProgressBar.tsx
// // ВАРИАНТ: Больший gap (gap-2 sm:gap-3)
// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useTranslations } from "@/i18n/useTranslations";

// interface Step {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface PremiumProgressBarProps {
//   currentStep: number;
//   steps: Step[];
//   showLogo?: boolean;
// }

// export default function PremiumProgressBar({
//   currentStep,
//   steps,
//   showLogo = true,
// }: PremiumProgressBarProps) {
//   const progress = ((currentStep + 1) / steps.length) * 100;
//   const t = useTranslations();

//   // ✅ Функция для сокращения длинных названий на мобильных
//   const truncateLabel = (label: string, maxLength: number = 7) => {
//     if (label.length <= maxLength) return label;
//     return label.substring(0, maxLength) + '..';
//   };

//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
//       {/* 👁️ УЛУЧШЕННЫЙ ЛОГОТИП С СВЕЧЕНИЕМ */}
//       {showLogo && (
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5 }}
//           className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-3"
//         >
//           {/* Логотип с двойным контейнером и свечением */}
//           <motion.div
//             whileHover={{ scale: 1.1 }}
//             className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 p-0.5 shadow-xl shadow-amber-500/40"
//           >
//             {/* Внутренний контейнер */}
//             <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
//               <motion.span
//                 animate={{ scale: [1, 1.08, 1] }}
//                 transition={{ duration: 4, repeat: Infinity }}
//                 className="text-2xl md:text-3xl"
//               >
//                 👁️
//               </motion.span>
//             </div>

//             {/* Пульсирующее свечение */}
//             <motion.div
//               className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl"
//               animate={{ opacity: [0.4, 0.7, 0.4] }}
//               transition={{ duration: 3, repeat: Infinity }}
//             />
//           </motion.div>

//           {/* Текст логотипа */}
//           <div className="hidden sm:block">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2 }}
//               className="text-xl md:text-2xl font-bold tracking-wider italic bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent"
//             >
//               {t("site_name")}
//             </motion.div>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//               className="text-xs uppercase tracking-widest text-amber-300/70 italic"
//             >
//               {t("booking_header_subtitle")}
//             </motion.div>
//           </div>
//         </motion.div>
//       )}

//       {/* ШАГИ ПРОГРЕССА - GAP: 8px → 12px → 16px */}
//       <div className="container mx-auto px-4 py-3 md:py-4">
//         {/* ✅ Gap: gap-2 sm:gap-3 md:gap-4 (8px → 12px → 16px) */}
//         <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto pl-16 sm:pl-20 md:pl-0">
//           {steps.map((step, index) => {
//             const isCompleted = index < currentStep;
//             const isCurrent = index === currentStep;

//             return (
//               <React.Fragment key={step.id}>
//                 {/* ✨ Улучшенная анимация шага */}
//                 <motion.div
//                   initial={{ scale: 0.8, opacity: 0, y: 10 }}
//                   animate={{ scale: 1, opacity: 1, y: 0 }}
//                   transition={{
//                     delay: index * 0.1,
//                     type: "spring",
//                     stiffness: 200,
//                     damping: 15,
//                   }}
//                   className="flex flex-col items-center gap-1 md:gap-2"
//                 >
//                   {/* Иконка шага с улучшенными эффектами */}
//                   <div className="relative">
//                     {/* Свечение для текущего шага */}
//                     {isCurrent && (
//                       <motion.div
//                         className="absolute -inset-2 md:-inset-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 blur-xl md:blur-2xl"
//                         animate={{
//                           scale: [1, 1.4, 1],
//                           opacity: [0.6, 0.3, 0.6],
//                         }}
//                         transition={{
//                           duration: 2,
//                           repeat: Infinity,
//                           ease: "easeInOut",
//                         }}
//                       />
//                     )}

//                     {/* 🌈 РАДУЖНЫЙ КОНТУР - обертка для завершенных и неактивных */}
//                     {!isCurrent ? (
//                       <div
//                         className={`
//                           p-[2px] rounded-full
//                           bg-gradient-to-r from-cyan-400 via-purple-500 via-orange-500 to-amber-400
//                           ${isCompleted ? 'opacity-100' : 'opacity-50'}
//                         `}
//                       >
//                         <motion.div
//                           whileHover={{ scale: 1.05 }}
//                           className={`
//                             w-10 h-10 md:w-14 md:h-14 rounded-full 
//                             flex items-center justify-center text-base md:text-xl
//                             transition-all duration-500 shadow-xl md:shadow-2xl
//                             ${
//                               isCompleted
//                                 ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-500/50"
//                                 : "bg-slate-900 text-white/40"
//                             }
//                           `}
//                         >
//                           {/* Иконка или чекмарк */}
//                           {isCompleted ? (
//                             <motion.svg
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               transition={{
//                                 type: "spring",
//                                 stiffness: 300,
//                                 damping: 20,
//                               }}
//                               className="w-5 h-5 md:w-7 md:h-7 text-white"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                               strokeWidth={4}
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M5 13l4 4L19 7"
//                               />
//                             </motion.svg>
//                           ) : (
//                             <div className="font-bold">{step.icon}</div>
//                           )}
//                         </motion.div>
//                       </div>
//                     ) : (
//                       // Текущий шаг БЕЗ радужного контура
//                       <motion.div
//                         whileHover={{ scale: 1.05 }}
//                         className="relative w-10 h-10 md:w-14 md:h-14 rounded-full 
//                           flex items-center justify-center text-base md:text-xl
//                           transition-all duration-500 shadow-xl md:shadow-2xl
//                           bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 text-black scale-105 md:scale-110 shadow-amber-500/60"
//                       >
//                         <div className="font-bold text-black">{step.icon}</div>

//                         {/* Анимированное кольцо для текущего шага */}
//                         <motion.div
//                           className="absolute inset-0 rounded-full border-2 md:border-4 border-amber-300/60"
//                           animate={{
//                             scale: [1, 1.5, 1],
//                             opacity: [1, 0, 1],
//                           }}
//                           transition={{
//                             duration: 2,
//                             repeat: Infinity,
//                             ease: "easeInOut",
//                           }}
//                         />
//                       </motion.div>
//                     )}
//                   </div>

//                   {/* Название шага - СОКРАЩЕНО НА МОБИЛЬНЫХ */}
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: index * 0.1 + 0.2 }}
//                     className={`
//                       text-[9px] md:text-xs font-medium text-center whitespace-nowrap italic uppercase tracking-wider
//                       transition-all duration-300
//                       ${
//                         isCurrent
//                           ? "bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent font-bold"
//                           : isCompleted
//                           ? "text-cyan-300"
//                           : "text-white/40"
//                       }
//                     `}
//                   >
//                     {/* ✅ ИЗМЕНЕНО: Сокращение на мобильных, полное на десктопе */}
//                     <span className="md:hidden">{truncateLabel(step.label, 6)}</span>
//                     <span className="hidden md:inline">{step.label}</span>
//                   </motion.div>
//                 </motion.div>

//                 {/* ✨ Анимированная линия между шагами */}
//                 {index < steps.length - 1 && (
//                   <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden max-w-[60px] lg:max-w-[80px]">
//                     <motion.div
//                       initial={{ width: 0 }}
//                       animate={{ width: isCompleted ? "100%" : "0%" }}
//                       transition={{
//                         duration: 0.5,
//                         delay: index * 0.1,
//                         ease: "easeOut",
//                       }}
//                       className="absolute inset-0 h-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30"
//                     />
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       {/* 🌈 ЖИВАЯ РАДУЖНАЯ ПОЛОСА С ПРОГРЕССОМ */}
//       <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-slate-900/50 overflow-hidden">
//         {/* Основная радужная полоса с прогрессом */}
//         <motion.div
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.8, ease: "easeInOut" }}
//           className="relative h-full bg-gradient-to-r from-cyan-400 via-purple-500 via-orange-500 to-amber-400 shadow-xl"
//         >
//           {/* Движущийся блик */}
//           <motion.div
//             className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
//             animate={{ x: ["-100%", "100%"] }}
//             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//           />
//         </motion.div>
//       </div>
//     </div>
//   );
// }


//------------пробуем компактно разместить иконки чтобы услуги не перекрывли
// // // src/components/PremiumProgressBar.tsx
// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useTranslations } from "@/i18n/useTranslations";

// interface Step {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface PremiumProgressBarProps {
//   currentStep: number;
//   steps: Step[];
//   showLogo?: boolean;
// }

// export default function PremiumProgressBar({
//   currentStep,
//   steps,
//   showLogo = true,
// }: PremiumProgressBarProps) {
//   const progress = ((currentStep + 1) / steps.length) * 100;
//   const t = useTranslations();

//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
//       {/* 👁️ УЛУЧШЕННЫЙ ЛОГОТИП С СВЕЧЕНИЕМ */}
//       {showLogo && (
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5 }}
//           className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-3"
//         >
//           {/* Логотип с двойным контейнером и свечением */}
//           <motion.div
//             whileHover={{ scale: 1.1 }}
//             className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 p-0.5 shadow-xl shadow-amber-500/40"
//           >
//             {/* Внутренний контейнер */}
//             <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
//               <motion.span
//                 animate={{ scale: [1, 1.08, 1] }}
//                 transition={{ duration: 4, repeat: Infinity }}
//                 className="text-2xl md:text-3xl"
//               >
//                 👁️
//               </motion.span>
//             </div>

//             {/* Пульсирующее свечение */}
//             <motion.div
//               className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl"
//               animate={{ opacity: [0.4, 0.7, 0.4] }}
//               transition={{ duration: 3, repeat: Infinity }}
//             />
//           </motion.div>

//           {/* Текст логотипа */}
//           <div className="hidden sm:block">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2 }}
//               className="text-xl md:text-2xl font-bold tracking-wider italic bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent"
//             >
//               {t("site_name")}
//             </motion.div>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//               className="text-xs uppercase tracking-widest text-amber-300/70 italic"
//             >
//               {t("booking_header_subtitle")}
//             </motion.div>
//           </div>
//         </motion.div>
//       )}

//       {/* ШАГИ ПРОГРЕССА */}
//       <div className="container mx-auto px-4 py-3 md:py-4">
//         <div className="flex items-center justify-center gap-1.5 md:gap-4 max-w-4xl mx-auto">
//           {steps.map((step, index) => {
//             const isCompleted = index < currentStep;
//             const isCurrent = index === currentStep;

//             return (
//               <React.Fragment key={step.id}>
//                 {/* ✨ Улучшенная анимация шага */}
//                 <motion.div
//                   initial={{ scale: 0.8, opacity: 0, y: 10 }}
//                   animate={{ scale: 1, opacity: 1, y: 0 }}
//                   transition={{
//                     delay: index * 0.1,
//                     type: "spring",
//                     stiffness: 200,
//                     damping: 15,
//                   }}
//                   className="flex flex-col items-center gap-1 md:gap-2"
//                 >
//                   {/* Иконка шага с улучшенными эффектами */}
//                   <div className="relative">
//                     {/* Свечение для текущего шага */}
//                     {isCurrent && (
//                       <motion.div
//                         className="absolute -inset-2 md:-inset-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 blur-xl md:blur-2xl"
//                         animate={{
//                           scale: [1, 1.4, 1],
//                           opacity: [0.6, 0.3, 0.6],
//                         }}
//                         transition={{
//                           duration: 2,
//                           repeat: Infinity,
//                           ease: "easeInOut",
//                         }}
//                       />
//                     )}

//                     {/* 🌈 РАДУЖНЫЙ КОНТУР - обертка для завершенных и неактивных */}
//                     {!isCurrent ? (
//                       <div
//                         className={`
//                           p-[2px] rounded-full
//                           bg-gradient-to-r from-cyan-400 via-purple-500 via-orange-500 to-amber-400
//                           ${isCompleted ? 'opacity-100' : 'opacity-50'}
//                         `}
//                       >
//                         <motion.div
//                           whileHover={{ scale: 1.05 }}
//                           className={`
//                             w-10 h-10 md:w-14 md:h-14 rounded-full 
//                             flex items-center justify-center text-base md:text-xl
//                             transition-all duration-500 shadow-xl md:shadow-2xl
//                             ${
//                               isCompleted
//                                 ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-500/50"
//                                 : "bg-slate-900 text-white/40"
//                             }
//                           `}
//                         >
//                           {/* Иконка или чекмарк */}
//                           {isCompleted ? (
//                             <motion.svg
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               transition={{
//                                 type: "spring",
//                                 stiffness: 300,
//                                 damping: 20,
//                               }}
//                               className="w-5 h-5 md:w-7 md:h-7 text-white"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                               strokeWidth={4}
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 d="M5 13l4 4L19 7"
//                               />
//                             </motion.svg>
//                           ) : (
//                             <div className="font-bold">{step.icon}</div>
//                           )}
//                         </motion.div>
//                       </div>
//                     ) : (
//                       // Текущий шаг БЕЗ радужного контура
//                       <motion.div
//                         whileHover={{ scale: 1.05 }}
//                         className="relative w-10 h-10 md:w-14 md:h-14 rounded-full 
//                           flex items-center justify-center text-base md:text-xl
//                           transition-all duration-500 shadow-xl md:shadow-2xl
//                           bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 text-black scale-105 md:scale-110 shadow-amber-500/60"
//                       >
//                         <div className="font-bold text-black">{step.icon}</div>

//                         {/* Анимированное кольцо для текущего шага */}
//                         <motion.div
//                           className="absolute inset-0 rounded-full border-2 md:border-4 border-amber-300/60"
//                           animate={{
//                             scale: [1, 1.5, 1],
//                             opacity: [1, 0, 1],
//                           }}
//                           transition={{
//                             duration: 2,
//                             repeat: Infinity,
//                             ease: "easeInOut",
//                           }}
//                         />
//                       </motion.div>
//                     )}
//                   </div>

//                   {/* Название шага */}
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: index * 0.1 + 0.2 }}
//                     className={`
//                       text-[9px] md:text-xs font-medium text-center whitespace-nowrap italic uppercase tracking-wider
//                       transition-all duration-300
//                       ${
//                         isCurrent
//                           ? "bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent font-bold"
//                           : isCompleted
//                           ? "text-cyan-300"
//                           : "text-white/40"
//                       }
//                     `}
//                   >
//                     {step.label}
//                   </motion.div>
//                 </motion.div>

//                 {/* ✨ Анимированная линия между шагами */}
//                 {index < steps.length - 1 && (
//                   <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden max-w-[60px] lg:max-w-[80px]">
//                     <motion.div
//                       initial={{ width: 0 }}
//                       animate={{ width: isCompleted ? "100%" : "0%" }}
//                       transition={{
//                         duration: 0.5,
//                         delay: index * 0.1,
//                         ease: "easeOut",
//                       }}
//                       className="absolute inset-0 h-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30"
//                     />
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       {/* 🌈 ЖИВАЯ РАДУЖНАЯ ПОЛОСА С ПРОГРЕССОМ */}
//       <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-slate-900/50 overflow-hidden">
//         {/* Основная радужная полоса с прогрессом */}
//         <motion.div
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.8, ease: "easeInOut" }}
//           className="relative h-full bg-gradient-to-r from-cyan-400 via-purple-500 via-orange-500 to-amber-400 shadow-xl"
//         >
//           {/* Движущийся блик */}
//           <motion.div
//             className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
//             animate={{ x: ["-100%", "100%"] }}
//             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//           />
//         </motion.div>
//       </div>
//     </div>
//   );
// }





//-------уже всё хорошо, пытаюсь подсветить иконки--------
// // src/components/PremiumProgressBar.tsx
// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useTranslations } from "@/i18n/useTranslations";

// interface Step {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface PremiumProgressBarProps {
//   currentStep: number;
//   steps: Step[];
//   showLogo?: boolean;
// }

// export default function PremiumProgressBar({
//   currentStep,
//   steps,
//   showLogo = true,
// }: PremiumProgressBarProps) {
//   const progress = ((currentStep + 1) / steps.length) * 100;
//   const t = useTranslations();

//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
//       {/* 👁️ УЛУЧШЕННЫЙ ЛОГОТИП С СВЕЧЕНИЕМ */}
//       {showLogo && (
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5 }}
//           className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-3"
//         >
//           {/* Логотип с двойным контейнером и свечением */}
//           <motion.div
//             whileHover={{ scale: 1.1 }}
//             className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 p-0.5 shadow-xl shadow-amber-500/40"
//           >
//             {/* Внутренний контейнер */}
//             <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
//               <motion.span
//                 animate={{ scale: [1, 1.08, 1] }}
//                 transition={{ duration: 4, repeat: Infinity }}
//                 className="text-2xl md:text-3xl"
//               >
//                 👁️
//               </motion.span>
//             </div>

//             {/* Пульсирующее свечение */}
//             <motion.div
//               className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl"
//               animate={{ opacity: [0.4, 0.7, 0.4] }}
//               transition={{ duration: 3, repeat: Infinity }}
//             />
//           </motion.div>

//           {/* Текст логотипа */}
//           <div className="hidden sm:block">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2 }}
//               className="text-xl md:text-2xl font-bold tracking-wider italic bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent"
//             >
//               {t("site_name")}
//             </motion.div>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//               className="text-xs uppercase tracking-widest text-amber-300/70 italic"
//             >
//               {t("booking_header_subtitle")}
//             </motion.div>
//           </div>
//         </motion.div>
//       )}

//       {/* ШАГИ ПРОГРЕССА */}
//       <div className="container mx-auto px-4 py-3 md:py-4">
//         <div className="flex items-center justify-center gap-1.5 md:gap-4 max-w-4xl mx-auto">
//           {steps.map((step, index) => {
//             const isCompleted = index < currentStep;
//             const isCurrent = index === currentStep;

//             return (
//               <React.Fragment key={step.id}>
//                 {/* ✨ Улучшенная анимация шага */}
//                 <motion.div
//                   initial={{ scale: 0.8, opacity: 0, y: 10 }}
//                   animate={{ scale: 1, opacity: 1, y: 0 }}
//                   transition={{
//                     delay: index * 0.1,
//                     type: "spring",
//                     stiffness: 200,
//                     damping: 15,
//                   }}
//                   className="flex flex-col items-center gap-1 md:gap-2"
//                 >
//                   {/* Иконка шага с улучшенными эффектами */}
//                   <div className="relative">
//                     {/* Свечение для текущего шага */}
//                     {isCurrent && (
//                       <motion.div
//                         className="absolute -inset-2 md:-inset-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 blur-xl md:blur-2xl"
//                         animate={{
//                           scale: [1, 1.4, 1],
//                           opacity: [0.6, 0.3, 0.6],
//                         }}
//                         transition={{
//                           duration: 2,
//                           repeat: Infinity,
//                           ease: "easeInOut",
//                         }}
//                       />
//                     )}

//                     <motion.div
//                       whileHover={{ scale: 1.05 }}
//                       className={`
//                         relative w-10 h-10 md:w-14 md:h-14 rounded-full 
//                         flex items-center justify-center text-base md:text-xl
//                         transition-all duration-500 shadow-xl md:shadow-2xl
//                         ${
//                           isCurrent
//                             ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 text-black scale-105 md:scale-110 shadow-amber-500/60"
//                             : isCompleted
//                             ? "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-500/50"
//                             : "bg-white/10 border border-white/20 text-white/40"
//                         }
//                       `}
//                     >
//                       {/* Иконка или чекмарк */}
//                       {isCompleted ? (
//                         <motion.svg
//                           initial={{ scale: 0 }}
//                           animate={{ scale: 1 }}
//                           transition={{
//                             type: "spring",
//                             stiffness: 300,
//                             damping: 20,
//                           }}
//                           className="w-5 h-5 md:w-7 md:h-7 text-white"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                           strokeWidth={4}
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             d="M5 13l4 4L19 7"
//                           />
//                         </motion.svg>
//                       ) : (
//                         <div className={`font-bold ${isCurrent ? "text-black" : ""}`}>
//                           {step.icon}
//                         </div>
//                       )}

//                       {/* Анимированное кольцо для текущего шага */}
//                       {isCurrent && (
//                         <motion.div
//                           className="absolute inset-0 rounded-full border-2 md:border-4 border-amber-300/60"
//                           animate={{
//                             scale: [1, 1.5, 1],
//                             opacity: [1, 0, 1],
//                           }}
//                           transition={{
//                             duration: 2,
//                             repeat: Infinity,
//                             ease: "easeInOut",
//                           }}
//                         />
//                       )}
//                     </motion.div>
//                   </div>

//                   {/* Название шага */}
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: index * 0.1 + 0.2 }}
//                     className={`
//                       text-[9px] md:text-xs font-medium text-center whitespace-nowrap italic uppercase tracking-wider
//                       transition-all duration-300
//                       ${
//                         isCurrent
//                           ? "bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent font-bold"
//                           : isCompleted
//                           ? "text-cyan-300"
//                           : "text-white/40"
//                       }
//                     `}
//                   >
//                     {step.label}
//                   </motion.div>
//                 </motion.div>

//                 {/* ✨ Анимированная линия между шагами */}
//                 {index < steps.length - 1 && (
//                   <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden max-w-[60px] lg:max-w-[80px]">
//                     <motion.div
//                       initial={{ width: 0 }}
//                       animate={{ width: isCompleted ? "100%" : "0%" }}
//                       transition={{
//                         duration: 0.5,
//                         delay: index * 0.1,
//                         ease: "easeOut",
//                       }}
//                       className="absolute inset-0 h-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30"
//                     />
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       {/* 🌈 ЖИВАЯ РАДУЖНАЯ ПОЛОСА С ПРОГРЕССОМ */}
//       <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-slate-900/50 overflow-hidden">
//         {/* Основная радужная полоса с прогрессом */}
//         <motion.div
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.8, ease: "easeInOut" }}
//           className="relative h-full bg-gradient-to-r from-cyan-400 via-purple-500 via-orange-500 to-amber-400 shadow-xl"
//         >
//           {/* Движущийся блик */}
//           <motion.div
//             className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
//             animate={{ x: ["-100%", "100%"] }}
//             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//           />
//         </motion.div>
//       </div>
//     </div>
//   );
// }






//-------пробую версию грок--------
// // src/components/PremiumProgressBar.tsx
// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useTranslations } from "@/i18n/useTranslations";

// interface Step {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface PremiumProgressBarProps {
//   currentStep: number;
//   steps: Step[];
//   showLogo?: boolean;
// }

// export default function PremiumProgressBar({
//   currentStep,
//   steps,
//   showLogo = true,
// }: PremiumProgressBarProps) {
//   const progress = ((currentStep + 1) / steps.length) * 100;
//   const t = useTranslations();

//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
//       {/* Логотип Salon Elen */}
//       {showLogo && (
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5 }}
//           className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-3"
//         >
//           {/* 👁️ Простой рабочий логотип */}
//           <motion.div
//             whileHover={{ scale: 1.1 }}
//             className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-xl md:text-2xl shadow-[0_0_20px_rgba(255,215,0,0.5)]"
//           >
//             <motion.div
//               animate={{
//                 scale: [1, 1.05, 1],
//               }}
//               transition={{
//                 duration: 2,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//             >
//               👁️
//             </motion.div>
//           </motion.div>

//           <div className="hidden sm:block">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2 }}
//               className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 font-bold text-lg md:text-xl tracking-wider italic"
//             >
//               {t("site_name")}
//             </motion.div>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//               className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5 italic"
//             >
//               {t("booking_header_subtitle")}
//             </motion.div>
//           </div>
//         </motion.div>
//       )}

//       {/* Шаги прогресса */}
//       <div className="container mx-auto px-4 py-3 md:py-4">
//         <div className="flex items-center justify-center gap-2 md:gap-4 max-w-4xl mx-auto">
//           {steps.map((step, index) => {
//             const isCompleted = index < currentStep;
//             const isCurrent = index === currentStep;

//             return (
//               <React.Fragment key={step.id}>
//                 {/* ✨ Улучшенная анимация шага */}
//                 <motion.div
//                   initial={{ scale: 0.8, opacity: 0, y: 10 }}
//                   animate={{ scale: 1, opacity: 1, y: 0 }}
//                   transition={{
//                     delay: index * 0.1,
//                     type: "spring",
//                     stiffness: 200,
//                     damping: 15,
//                   }}
//                   className="flex flex-col items-center gap-1 md:gap-2"
//                 >
//                   {/* Иконка шага с улучшенными эффектами */}
//                   <div className="relative">
//                     {/* Внешнее свечение для текущего шага */}
//                     {isCurrent && (
//                       <motion.div
//                         className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 blur-xl"
//                         animate={{
//                           scale: [1, 1.3, 1],
//                           opacity: [0.5, 0, 0.5],
//                         }}
//                         transition={{
//                           duration: 2,
//                           repeat: Infinity,
//                           ease: "easeInOut",
//                         }}
//                       />
//                     )}

//                     <motion.div
//                       whileHover={{ scale: 1.05 }}
//                       className={`
//                         relative w-10 h-10 md:w-12 md:h-12 rounded-full 
//                         flex items-center justify-center
//                         transition-all duration-500
//                         ${
//                           isCurrent
//                             ? "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.6)] scale-110"
//                             : isCompleted
//                             ? "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,212,255,0.4)]"
//                             : "bg-white/5 border border-white/20"
//                         }
//                       `}
//                     >
//                       {/* Иконка или чекмарк */}
//                       {isCompleted ? (
//                         <motion.svg
//                           initial={{ scale: 0 }}
//                           animate={{ scale: 1 }}
//                           transition={{
//                             type: "spring",
//                             stiffness: 300,
//                             damping: 20,
//                           }}
//                           className="w-5 h-5 md:w-6 md:h-6 text-white"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={3}
//                             d="M5 13l4 4L19 7"
//                           />
//                         </motion.svg>
//                       ) : (
//                         <div
//                           className={`text-sm md:text-base ${
//                             isCurrent ? "text-black font-bold" : "text-white/50"
//                           }`}
//                         >
//                           {step.icon}
//                         </div>
//                       )}

//                       {/* ✨ Анимированное кольцо для текущего шага */}
//                       {isCurrent && (
//                         <motion.div
//                           className="absolute inset-0 rounded-full border-2 border-yellow-400"
//                           animate={{
//                             scale: [1, 1.4, 1],
//                             opacity: [1, 0, 1],
//                           }}
//                           transition={{
//                             duration: 2,
//                             repeat: Infinity,
//                             ease: "easeInOut",
//                           }}
//                         />
//                       )}
//                     </motion.div>
//                   </div>

//                   {/* Название шага */}
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: index * 0.1 + 0.2 }}
//                     className={`
//                       text-[10px] md:text-xs font-medium text-center whitespace-nowrap italic
//                       transition-all duration-300
//                       ${
//                         isCurrent
//                           ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600"
//                           : isCompleted
//                           ? "text-cyan-400"
//                           : "text-white/40"
//                       }
//                     `}
//                   >
//                     {step.label}
//                   </motion.div>
//                 </motion.div>

//                 {/* ✨ Анимированная линия между шагами */}
//                 {index < steps.length - 1 && (
//                   <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden max-w-[60px] lg:max-w-[80px]">
//                     <motion.div
//                       initial={{ width: 0 }}
//                       animate={{ width: isCompleted ? "100%" : "0%" }}
//                       transition={{
//                         duration: 0.5,
//                         delay: index * 0.1,
//                         ease: "easeOut",
//                       }}
//                       className={`
//                         absolute inset-0 h-full
//                         ${
//                           isCompleted
//                             ? "bg-gradient-to-r from-cyan-400 to-blue-600"
//                             : "bg-transparent"
//                         }
//                       `}
//                     />
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       {/* 🌈 РАДУЖНАЯ ПОЛОСА СНИЗУ С ПРОГРЕССОМ - БОЛЕЕ ВЫРАЗИТЕЛЬНАЯ */}
//       <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-slate-900/50 overflow-hidden">
//         <motion.div
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className="h-full bg-[linear-gradient(90deg,#22d3ee,#a855f7,#f97316,#22c55e,#22d3ee)] bg-[length:200%_100%] animate-[bg-slide_9s_linear_infinite] shadow-[0_0_15px_rgba(34,211,238,0.6),0_0_30px_rgba(168,85,247,0.4)]"
//         />
//       </div>

//       {/* ✨ Добавляем CSS анимацию для радужного градиента */}
//       <style jsx global>{`
//         @keyframes bg-slide {
//           0% {
//             background-position: 0% 0%;
//           }
//           100% {
//             background-position: 200% 0%;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }





// // src/components/PremiumProgressBar.tsx
// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useTranslations } from "@/i18n/useTranslations";

// interface Step {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface PremiumProgressBarProps {
//   currentStep: number;
//   steps: Step[];
//   showLogo?: boolean;
// }

// export default function PremiumProgressBar({
//   currentStep,
//   steps,
//   showLogo = true,
// }: PremiumProgressBarProps) {
//   const progress = ((currentStep + 1) / steps.length) * 100;
//   const t = useTranslations();

//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
//       {/* Логотип Salon Elen */}
//       {showLogo && (
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5 }}
//           className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-3"
//         >
//           {/* 👁️ Простой рабочий логотип */}
//           <motion.div
//             whileHover={{ scale: 1.1 }}
//             className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-xl md:text-2xl shadow-[0_0_20px_rgba(255,215,0,0.5)]"
//           >
//             <motion.div
//               animate={{
//                 scale: [1, 1.05, 1],
//               }}
//               transition={{
//                 duration: 2,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               }}
//             >
//               👁️
//             </motion.div>
//           </motion.div>

//           <div className="hidden sm:block">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2 }}
//               className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 font-bold text-lg md:text-xl tracking-wider"
//             >
//               {t("site_name")}
//             </motion.div>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//               className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5"
//             >
//               {t("booking_header_subtitle")}
//             </motion.div>
//           </div>
//         </motion.div>
//       )}

//       {/* Шаги прогресса */}
//       <div className="container mx-auto px-4 py-3 md:py-4">
//         <div className="flex items-center justify-center gap-2 md:gap-4 max-w-4xl mx-auto">
//           {steps.map((step, index) => {
//             const isCompleted = index < currentStep;
//             const isCurrent = index === currentStep;

//             return (
//               <React.Fragment key={step.id}>
//                 {/* ✨ Улучшенная анимация шага */}
//                 <motion.div
//                   initial={{ scale: 0.8, opacity: 0, y: 10 }}
//                   animate={{ scale: 1, opacity: 1, y: 0 }}
//                   transition={{
//                     delay: index * 0.1,
//                     type: "spring",
//                     stiffness: 200,
//                     damping: 15,
//                   }}
//                   className="flex flex-col items-center gap-1 md:gap-2"
//                 >
//                   {/* Иконка шага с улучшенными эффектами */}
//                   <div className="relative">
//                     {/* Внешнее свечение для текущего шага */}
//                     {isCurrent && (
//                       <motion.div
//                         className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 blur-xl"
//                         animate={{
//                           scale: [1, 1.3, 1],
//                           opacity: [0.5, 0, 0.5],
//                         }}
//                         transition={{
//                           duration: 2,
//                           repeat: Infinity,
//                           ease: "easeInOut",
//                         }}
//                       />
//                     )}

//                     <motion.div
//                       whileHover={{ scale: 1.05 }}
//                       className={`
//                         relative w-10 h-10 md:w-12 md:h-12 rounded-full 
//                         flex items-center justify-center
//                         transition-all duration-500
//                         ${
//                           isCurrent
//                             ? "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.6)] scale-110"
//                             : isCompleted
//                             ? "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,212,255,0.4)]"
//                             : "bg-white/5 border border-white/20"
//                         }
//                       `}
//                     >
//                       {/* Иконка или чекмарк */}
//                       {isCompleted ? (
//                         <motion.svg
//                           initial={{ scale: 0 }}
//                           animate={{ scale: 1 }}
//                           transition={{
//                             type: "spring",
//                             stiffness: 300,
//                             damping: 20,
//                           }}
//                           className="w-5 h-5 md:w-6 md:h-6 text-white"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={3}
//                             d="M5 13l4 4L19 7"
//                           />
//                         </motion.svg>
//                       ) : (
//                         <div
//                           className={`text-sm md:text-base ${
//                             isCurrent ? "text-black font-bold" : "text-white/50"
//                           }`}
//                         >
//                           {step.icon}
//                         </div>
//                       )}

//                       {/* ✨ Анимированное кольцо для текущего шага */}
//                       {isCurrent && (
//                         <motion.div
//                           className="absolute inset-0 rounded-full border-2 border-yellow-400"
//                           animate={{
//                             scale: [1, 1.4, 1],
//                             opacity: [1, 0, 1],
//                           }}
//                           transition={{
//                             duration: 2,
//                             repeat: Infinity,
//                             ease: "easeInOut",
//                           }}
//                         />
//                       )}
//                     </motion.div>
//                   </div>

//                   {/* Название шага */}
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: index * 0.1 + 0.2 }}
//                     className={`
//                       text-[10px] md:text-xs font-medium text-center whitespace-nowrap
//                       transition-all duration-300
//                       ${
//                         isCurrent
//                           ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600"
//                           : isCompleted
//                           ? "text-cyan-400"
//                           : "text-white/40"
//                       }
//                     `}
//                   >
//                     {step.label}
//                   </motion.div>
//                 </motion.div>

//                 {/* ✨ Анимированная линия между шагами */}
//                 {index < steps.length - 1 && (
//                   <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden max-w-[60px] lg:max-w-[80px]">
//                     <motion.div
//                       initial={{ width: 0 }}
//                       animate={{ width: isCompleted ? "100%" : "0%" }}
//                       transition={{
//                         duration: 0.5,
//                         delay: index * 0.1,
//                         ease: "easeOut",
//                       }}
//                       className={`
//                         absolute inset-0 h-full
//                         ${
//                           isCompleted
//                             ? "bg-gradient-to-r from-cyan-400 to-blue-600"
//                             : "bg-transparent"
//                         }
//                       `}
//                     />
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       {/* 🌈 РАДУЖНАЯ ПОЛОСА СНИЗУ С ПРОГРЕССОМ */}
//       <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 overflow-hidden">
//         <motion.div
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className="h-full bg-[linear-gradient(90deg,#22d3ee,#a855f7,#f97316,#22c55e,#22d3ee)] bg-[length:200%_100%] animate-[bg-slide_9s_linear_infinite] shadow-[0_0_10px_rgba(34,211,238,0.5)]"
//         />
//       </div>

//       {/* ✨ Добавляем CSS анимацию для радужного градиента */}
//       <style jsx global>{`
//         @keyframes bg-slide {
//           0% {
//             background-position: 0% 0%;
//           }
//           100% {
//             background-position: 200% 0%;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }






//-----------пробую старый логотип но по новому--------
// // src/components/PremiumProgressBar.tsx
// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import {
//   User,
//   CalendarDays,
//   FileText,
//   CheckCircle2,
//   CreditCard,
//   ScissorsLineDashed,
// } from "lucide-react";
// import { useTranslations } from "@/i18n/useTranslations";

// interface Step {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface PremiumProgressBarProps {
//   currentStep: number;
//   steps: Step[];
//   showLogo?: boolean;
// }

// /* Премиальный логотип-глаз с голубой радужкой */
// function PremiumEyeLogo({ className }: { className?: string }): React.JSX.Element {
//   return (
//     <svg
//       viewBox="0 0 140 100"
//       className={className ?? "w-12 h-8 sm:w-14 sm:h-9"}
//     >
//       <defs>
//         {/* Золотой градиент для ресниц */}
//         <linearGradient id="pe-gold-lashes" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" stopColor="#FFD700" />
//           <stop offset="30%" stopColor="#FFA500" />
//           <stop offset="70%" stopColor="#FFB020" />
//           <stop offset="100%" stopColor="#FF8C00" />
//         </linearGradient>

//         {/* Голубая радужка - как на вашем логотипе */}
//         <radialGradient id="pe-iris-blue" cx="50%" cy="50%" r="50%">
//           <stop offset="0%" stopColor="#E0F7FF" />
//           <stop offset="20%" stopColor="#7DD3FC" />
//           <stop offset="40%" stopColor="#38BDF8" />
//           <stop offset="60%" stopColor="#0EA5E9" />
//           <stop offset="80%" stopColor="#0284C7" />
//           <stop offset="100%" stopColor="#0C4A6E" />
//         </radialGradient>

//         {/* Свечение радужки */}
//         <radialGradient id="pe-iris-glow" cx="50%" cy="50%" r="50%">
//           <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
//           <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.5" />
//           <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
//         </radialGradient>

//         {/* Золотое свечение для ресниц */}
//         <filter id="pe-gold-glow">
//           <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
//           <feMerge>
//             <feMergeNode in="coloredBlur"/>
//             <feMergeNode in="SourceGraphic"/>
//           </feMerge>
//         </filter>
//       </defs>

//       {/* Верхняя дуга глаза */}
//       <path
//         d="M 15 45 Q 70 15 125 45"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="3.5"
//         strokeLinecap="round"
//         filter="url(#pe-gold-glow)"
//       />

//       {/* Нижняя дуга глаза */}
//       <path
//         d="M 15 55 Q 70 75 125 55"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="3"
//         strokeLinecap="round"
//         filter="url(#pe-gold-glow)"
//       />

//       {/* Верхние ресницы (левая группа) */}
//       <path
//         d="M 25 44 Q 20 30 18 22"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M 35 38 Q 32 24 30 16"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2.2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M 45 33 Q 44 20 43 12"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2.4"
//         strokeLinecap="round"
//       />

//       {/* Верхние ресницы (центр) */}
//       <path
//         d="M 60 27 Q 60 14 60 8"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2.6"
//         strokeLinecap="round"
//       />
//       <path
//         d="M 70 26 Q 70 13 70 7"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2.8"
//         strokeLinecap="round"
//       />
//       <path
//         d="M 80 27 Q 80 14 80 8"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2.6"
//         strokeLinecap="round"
//       />

//       {/* Верхние ресницы (правая группа) */}
//       <path
//         d="M 95 33 Q 96 20 97 12"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2.4"
//         strokeLinecap="round"
//       />
//       <path
//         d="M 105 38 Q 108 24 110 16"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2.2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M 115 44 Q 120 30 122 22"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2"
//         strokeLinecap="round"
//       />

//       {/* Нижние ресницы (левая группа) */}
//       <path
//         d="M 30 57 Q 28 68 26 74"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />
//       <path
//         d="M 45 63 Q 44 72 43 78"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M 60 67 Q 60 76 60 82"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2.2"
//         strokeLinecap="round"
//       />

//       {/* Нижние ресницы (правая группа) */}
//       <path
//         d="M 80 67 Q 80 76 80 82"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2.2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M 95 63 Q 96 72 97 78"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M 110 57 Q 112 68 114 74"
//         fill="none"
//         stroke="url(#pe-gold-lashes)"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />

//       {/* Белок глаза с легким золотым оттенком */}
//       <ellipse
//         cx="70"
//         cy="50"
//         rx="35"
//         ry="20"
//         fill="url(#pe-gold-lashes)"
//         opacity={0.08}
//       />

//       {/* Свечение радужки */}
//       <circle 
//         cx="70" 
//         cy="50" 
//         r="16" 
//         fill="url(#pe-iris-glow)" 
//         opacity={0.7} 
//       />

//       {/* Голубая радужка */}
//       <circle 
//         cx="70" 
//         cy="50" 
//         r="12" 
//         fill="url(#pe-iris-blue)" 
//       />

//       {/* Зрачок */}
//       <circle 
//         cx="70" 
//         cy="50" 
//         r="6" 
//         fill="#000814" 
//       />

//       {/* Белый блик (highlight) */}
//       <circle 
//         cx="66" 
//         cy="46" 
//         r="3" 
//         fill="#FFFFFF" 
//         opacity={0.95} 
//       />
      
//       {/* Маленький блик */}
//       <circle 
//         cx="74" 
//         cy="52" 
//         r="1.5" 
//         fill="#FFFFFF" 
//         opacity={0.7} 
//       />
//     </svg>
//   );
// }

// /* Иконки для шагов */
// const premiumStepIcons: Record<string, React.ReactNode> = {
//   services: <ScissorsLineDashed className="h-4 w-4" />,
//   master: <User className="h-4 w-4" />,
//   calendar: <CalendarDays className="h-4 w-4" />,
//   client: <FileText className="h-4 w-4" />,
//   verify: <CheckCircle2 className="h-4 w-4" />,
//   payment: <CreditCard className="h-4 w-4" />,
// };

// export default function PremiumProgressBar({
//   currentStep,
//   steps,
//   showLogo = true,
// }: PremiumProgressBarProps): React.JSX.Element {
//   const progress = ((currentStep + 1) / steps.length) * 100;
//   const t = useTranslations(); // ✅ Добавлено для переводов

//   return (
//     <motion.header
//       initial={{ opacity: 0, y: -8 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.35, ease: "easeOut" }}
//       className="booking-header fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#020617] via-slate-950 to-[#020617] backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.9)]"
//     >
//       {/* верхняя неоновая линия */}
//       <div className="h-[2px] w-full bg-[linear-gradient(90deg,#22d3ee,#a855f7,#f97316,#22c55e,#22d3ee)] bg-[length:220%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* ───── ДЕСКТОПНЫЙ РЯД ───── */}
//       <div className="hidden sm:flex sm:mx-auto sm:max-w-7xl sm:items-center sm:gap-3 sm:px-6 sm:py-4">
//         {showLogo && (
//           <div className="flex items-center gap-2 mr-3 flex-shrink-0">
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-[0_0_18px_rgba(245,197,24,0.8)]"
//             >
//               <div className="absolute inset-[2px] rounded-full bg-black/90 flex items-center justify-center">
//                 <PremiumEyeLogo className="w-8 h-5" />
//               </div>
//               <motion.div
//                 className="absolute inset-[-6px] rounded-full bg-amber-300/40 blur-xl"
//                 animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
//                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//               />
//             </motion.div>

//             <div className="flex flex-col leading-tight">
//               {/* ✅ ИСПРАВЛЕНО: используем переводы */}
//               <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-sm font-semibold tracking-wide text-transparent">
//                 {t("site_name")}
//               </span>
//               <span className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
//                 {t("booking_header_subtitle")}
//               </span>
//             </div>
//           </div>
//         )}

//         {/* ✅ ИСПРАВЛЕНО: увеличен gap для лучшего распределения */}
//         <div className="flex flex-1 items-center min-w-0">
//           <div className="flex w-full items-center justify-between gap-2 py-3">
//             {steps.map((step, index) => {
//               const isCompleted = index < currentStep;
//               const isCurrent = index === currentStep;

//               const iconNode =
//                 premiumStepIcons[step.id] ?? (
//                   <span className="text-sm">{step.icon}</span>
//                 );

//               return (
//                 <React.Fragment key={step.id}>
//                   <motion.div
//                     initial={{ opacity: 0, y: 6 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                     className="flex items-center gap-2 min-w-0"
//                   >
//                     {/* ✅ ИСПРАВЛЕНО: увеличен padding для ring-offset */}
//                     <div className="relative inline-flex h-10 w-10 items-center justify-center p-1.5 flex-shrink-0">
//                       <span
//                         className={`absolute inset-2 rounded-full blur-md ${
//                           isCurrent
//                             ? "bg-gradient-to-br from-amber-400 via-yellow-300 to-emerald-300 opacity-95"
//                             : isCompleted
//                             ? "bg-gradient-to-br from-emerald-400 via-sky-400 to-emerald-300 opacity-85"
//                             : "bg-slate-800/60 opacity-60"
//                         }`}
//                       />
//                       {isCurrent && (
//                         <motion.span
//                           className="absolute inset-[-6px] rounded-full bg-amber-300/60 blur-xl z-0"
//                           animate={{
//                             scale: [1, 1.18, 1],
//                             opacity: [0.6, 0, 0.6],
//                           }}
//                           transition={{
//                             duration: 1.8,
//                             repeat: Infinity,
//                             ease: "easeInOut",
//                           }}
//                         />
//                       )}
//                       <span
//                         className={`relative inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border text-[13px] z-10 ${
//                           isCurrent
//                             ? "border-amber-200 bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-400 text-black shadow-[0_0_16px_rgba(245,197,24,0.9)]"
//                             : isCompleted
//                             ? "border-emerald-300 bg-slate-950 text-emerald-200 shadow-[0_0_16px_rgba(34,197,94,0.85)]"
//                             : "border-white/16 bg-black/70 text-slate-200"
//                         }`}
//                       >
//                         {iconNode}
//                       </span>
//                     </div>

//                     {/* ✅ Адаптивный текст - скрываем на средних экранах */}
//                     <div className="hidden lg:flex min-w-[60px] max-w-[80px]">
//                       <span
//                         className={`text-xs truncate ${
//                           isCurrent
//                             ? "bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                             : isCompleted
//                             ? "text-emerald-200"
//                             : "text-slate-200"
//                         }`}
//                       >
//                         {step.label}
//                       </span>
//                     </div>
//                   </motion.div>

//                   {/* Линия между шагами - показываем только на больших экранах */}
//                   {index < steps.length - 1 && (
//                     <div className="hidden xl:flex h-px flex-1 items-center min-w-[16px] max-w-[40px]">
//                       <div
//                         className={`h-[2px] w-full rounded-full bg-gradient-to-r ${
//                           index < currentStep
//                             ? "from-emerald-400 via-emerald-300 to-sky-400"
//                             : "from-slate-700 via-slate-800 to-slate-900"
//                         }`}
//                       />
//                     </div>
//                   )}
//                 </React.Fragment>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* ───── МОБИЛЬНЫЙ РЯД ───── */}
//       <div className="sm:hidden px-3 pt-5 pb-4">
//         <div
//           className="
//             flex items-start justify-start gap-2
//             overflow-x-auto
//             pb-2
//             [scrollbar-width:none]
//             [-ms-overflow-style:none]
//             [&::-webkit-scrollbar]:hidden
//           "
//         >
//           {/* глаз как первая иконка ряда - ИСПРАВЛЕНО: правильные размеры */}
//           {showLogo && (
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               className="relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.6)] flex-shrink-0"
//             >
//               <div className="absolute inset-[2px] rounded-full bg-black/90 flex items-center justify-center">
//                 {/* ✅ ИСПРАВЛЕНО: w-9 h-6 вместо w-7 h-4 */}
//                 <PremiumEyeLogo className="w-9 h-6" />
//               </div>
//               <motion.div
//                 className="absolute inset-[-6px] rounded-full bg-amber-300/40 blur-xl"
//                 animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
//                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//               />
//             </motion.div>
//           )}

//           {steps.map((step, index) => {
//             const isCompleted = index < currentStep;
//             const isCurrent = index === currentStep;
//             const iconNode =
//               premiumStepIcons[step.id] ?? (
//                 <span className="text-sm">{step.icon}</span>
//               );

//             return (
//               <React.Fragment key={step.id}>
//                 <motion.div
//                   initial={{ scale: 0.9, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   transition={{ delay: (index + 1) * 0.08 }}
//                   className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[48px]"
//                 >
//                   {/* ✅ ИСПРАВЛЕНО: больше padding для эффектов */}
//                   <div className="relative p-2">
//                     <div
//                       className={`
//                         relative w-10 h-10 rounded-full flex items-center justify-center
//                         transition-all duration-500
//                         ${
//                           isCurrent
//                             ? "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.8)] scale-110"
//                             : isCompleted
//                             ? "bg-gradient-to-br from-cyan-400 to-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.9)]"
//                             : "bg-black/70 border border-white/25 shadow-[0_0_10px_rgba(148,163,184,0.45)]"
//                         }
//                       `}
//                     >
//                       {isCompleted ? (
//                         <svg
//                           className="w-5 h-5 text-white"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={3}
//                             d="M5 13l4 4L19 7"
//                           />
//                         </svg>
//                       ) : (
//                         <div
//                           className={`text-sm ${
//                             isCurrent ? "text-black font-bold" : "text-white/80"
//                           }`}
//                         >
//                           {iconNode}
//                         </div>
//                       )}

//                       {isCurrent && (
//                         <div className="absolute inset-0 rounded-full border-2 border-yellow-300 animate-ping opacity-75" />
//                       )}
//                     </div>
//                   </div>

//                   <div
//                     className={`
//                       text-[9px] font-medium text-center whitespace-nowrap
//                       transition-all duration-300
//                       max-w-[48px] overflow-hidden text-ellipsis
//                       ${
//                         isCurrent
//                           ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500"
//                           : isCompleted
//                           ? "text-cyan-300"
//                           : "text-white/60"
//                       }
//                     `}
//                   >
//                     {step.label}
//                   </div>
//                 </motion.div>
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       {/* нижний прогресс-бар */}
//       <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
//         <div
//           className="h-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all duration-500 ease-out"
//           style={{ width: `${progress}%` }}
//         />
//       </div>
//     </motion.header>
//   );
// }



//------------перевод хорошо остался дизайн------
// // src/components/PremiumProgressBar.tsx
// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import {
//   User,
//   CalendarDays,
//   FileText,
//   CheckCircle2,
//   CreditCard,
//   ScissorsLineDashed,
// } from "lucide-react";
// import { useTranslations } from "@/i18n/useTranslations";

// interface Step {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface PremiumProgressBarProps {
//   currentStep: number;
//   steps: Step[];
//   showLogo?: boolean;
// }

// /* Премиальный логотип-глаз */
// function PremiumEyeLogo({ className }: { className?: string }): React.JSX.Element {
//   return (
//     <svg
//       viewBox="0 0 120 80"
//       className={className ?? "w-12 h-8 sm:w-14 sm:h-9"}
//     >
//       <defs>
//         <linearGradient id="pe-gold" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" stopColor="#FFEFB0" />
//           <stop offset="40%" stopColor="#FFC94A" />
//           <stop offset="100%" stopColor="#FFB020" />
//         </linearGradient>

//         <radialGradient id="pe-iris" cx="50%" cy="50%" r="50%">
//           <stop offset="0%" stopColor="#90F9FF" />
//           <stop offset="35%" stopColor="#22D3EE" />
//           <stop offset="70%" stopColor="#0284C7" />
//           <stop offset="100%" stopColor="#020617" />
//         </radialGradient>

//         <radialGradient id="pe-iris-glow" cx="50%" cy="50%" r="50%">
//           <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
//           <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
//         </radialGradient>
//       </defs>

//       <path
//         d="M8 26 Q60 4 112 24"
//         fill="none"
//         stroke="url(#pe-gold)"
//         strokeWidth="4.2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M10 52 Q60 74 110 50"
//         fill="none"
//         stroke="url(#pe-gold)"
//         strokeWidth="3.6"
//         strokeLinecap="round"
//       />

//       <path
//         d="M26 55 Q35 67 44 59"
//         fill="none"
//         stroke="url(#pe-gold)"
//         strokeWidth="2.2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M46 57 Q55 71 63 60"
//         fill="none"
//         stroke="url(#pe-gold)"
//         strokeWidth="2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M70 57 Q79 69 90 60"
//         fill="none"
//         stroke="url(#pe-gold)"
//         strokeWidth="2"
//         strokeLinecap="round"
//       />

//       <ellipse
//         cx="60"
//         cy="38"
//         rx="30"
//         ry="17"
//         fill="url(#pe-gold)"
//         opacity={0.16}
//       />

//       <circle cx="60" cy="38" r="14" fill="url(#pe-iris-glow)" opacity={0.6} />
//       <circle cx="60" cy="38" r="10" fill="url(#pe-iris)" />

//       <circle cx="60" cy="38" r="5" fill="#020617" />
//       <circle cx="56" cy="33.5" r="2.3" fill="#fff" opacity={0.95} />
//     </svg>
//   );
// }

// /* Иконки для шагов */
// const premiumStepIcons: Record<string, React.ReactNode> = {
//   services: <ScissorsLineDashed className="h-4 w-4" />,
//   master: <User className="h-4 w-4" />,
//   calendar: <CalendarDays className="h-4 w-4" />,
//   client: <FileText className="h-4 w-4" />,
//   verify: <CheckCircle2 className="h-4 w-4" />,
//   payment: <CreditCard className="h-4 w-4" />,
// };

// export default function PremiumProgressBar({
//   currentStep,
//   steps,
//   showLogo = true,
// }: PremiumProgressBarProps): React.JSX.Element {
//   const progress = ((currentStep + 1) / steps.length) * 100;
//   const t = useTranslations(); // ✅ Добавлено для переводов

//   return (
//     <motion.header
//       initial={{ opacity: 0, y: -8 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.35, ease: "easeOut" }}
//       className="booking-header fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#020617] via-slate-950 to-[#020617] backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.9)]"
//     >
//       {/* верхняя неоновая линия */}
//       <div className="h-[2px] w-full bg-[linear-gradient(90deg,#22d3ee,#a855f7,#f97316,#22c55e,#22d3ee)] bg-[length:220%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* ───── ДЕСКТОПНЫЙ РЯД ───── */}
//       <div className="hidden sm:flex sm:mx-auto sm:max-w-6xl sm:items-center sm:gap-4 sm:px-6 sm:py-4">
//         {showLogo && (
//           <div className="flex items-center gap-3 mr-2">
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-[0_0_18px_rgba(245,197,24,0.8)]"
//             >
//               <div className="absolute inset-[2px] rounded-full bg-black/90 flex items-center justify-center">
//                 <PremiumEyeLogo className="w-8 h-5" />
//               </div>
//               <motion.div
//                 className="absolute inset-[-6px] rounded-full bg-amber-300/40 blur-xl"
//                 animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
//                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//               />
//             </motion.div>

//             <div className="flex flex-col leading-tight">
//               {/* ✅ ИСПРАВЛЕНО: используем переводы */}
//               <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-sm font-semibold tracking-wide text-transparent">
//                 {t("site_name")}
//               </span>
//               <span className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
//                 {t("booking_header_subtitle")}
//               </span>
//             </div>
//           </div>
//         )}

//         <div className="flex flex-1 items-center justify-end">
//           <div className="flex w-full items-center gap-3 overflow-x-hidden pb-1">
//             {steps.map((step, index) => {
//               const isCompleted = index < currentStep;
//               const isCurrent = index === currentStep;

//               const iconNode =
//                 premiumStepIcons[step.id] ?? (
//                   <span className="text-sm">{step.icon}</span>
//                 );

//               return (
//                 <React.Fragment key={step.id}>
//                   <motion.div
//                     initial={{ opacity: 0, y: 6 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                     className="inline-flex items-center"
//                   >
//                     <div className="flex items-center gap-2 px-1">
//                       {/* круг иконки шага */}
//                       <div className="relative inline-flex h-9 w-9 items-center justify-center">
//                         <span
//                           className={`absolute inset-0 rounded-full blur-md ${
//                             isCurrent
//                               ? "bg-gradient-to-br from-amber-400 via-yellow-300 to-emerald-300 opacity-95"
//                               : isCompleted
//                               ? "bg-gradient-to-br from-emerald-400 via-sky-400 to-emerald-300 opacity-85"
//                               : "bg-slate-800/60 opacity-60"
//                           }`}
//                         />
//                         {isCurrent && (
//                           <motion.span
//                             className="absolute inset-[-8px] rounded-full bg-amber-300/60 blur-xl z-0"
//                             animate={{
//                               scale: [1, 1.18, 1],
//                               opacity: [0.6, 0, 0.6],
//                             }}
//                             transition={{
//                               duration: 1.8,
//                               repeat: Infinity,
//                               ease: "easeInOut",
//                             }}
//                           />
//                         )}
//                         <span
//                           className={`relative inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border text-[13px] ${
//                             isCurrent
//                               ? "z-10 border-amber-200 bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-400 text-black shadow-[0_0_16px_rgba(245,197,24,0.9)]"
//                               : isCompleted
//                               ? "border-emerald-300 bg-slate-950 text-emerald-200 shadow-[0_0_16px_rgba(34,197,94,0.85)]"
//                               : "border-white/16 bg-black/70 text-slate-200"
//                           }`}
//                         >
//                           {iconNode}
//                         </span>
//                       </div>

//                       <div className="hidden min-w-[70px] sm:flex">
//                         <span
//                           className={`text-xs ${
//                             isCurrent
//                               ? "bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                               : isCompleted
//                               ? "text-emerald-200"
//                               : "text-slate-200"
//                           }`}
//                         >
//                           {step.label}
//                         </span>
//                       </div>
//                     </div>
//                   </motion.div>

//                   {index < steps.length - 1 && (
//                     <div className="hidden h-px flex-1 items-center sm:flex">
//                       <div
//                         className={`h-[2px] w-full rounded-full bg-gradient-to-r ${
//                           index < currentStep
//                             ? "from-emerald-400 via-emerald-300 to-sky-400"
//                             : "from-slate-700 via-slate-800 to-slate-900"
//                         }`}
//                       />
//                     </div>
//                   )}
//                 </React.Fragment>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* ───── МОБИЛЬНЫЙ РЯД ───── */}
//       <div className="sm:hidden px-4 pt-3 pb-3">
//         <div
//           className="
//             flex items-center justify-center gap-3
//             overflow-x-auto
//             [scrollbar-width:none]
//             [-ms-overflow-style:none]
//             [&::-webkit-scrollbar]:hidden
//           "
//         >
//           {/* глаз как первая иконка ряда */}
//           {showLogo && (
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               className="relative w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.6)]"
//             >
//               <div className="absolute inset-[2px] rounded-full bg-black/90 flex items-center justify-center">
//                 <PremiumEyeLogo className="w-7 h-4" />
//               </div>
//               <motion.div
//                 className="absolute inset-[-6px] rounded-full bg-amber-300/40 blur-xl"
//                 animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
//                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//               />
//             </motion.div>
//           )}

//           {steps.map((step, index) => {
//             const isCompleted = index < currentStep;
//             const isCurrent = index === currentStep;
//             const iconNode =
//               premiumStepIcons[step.id] ?? (
//                 <span className="text-sm">{step.icon}</span>
//               );

//             return (
//               <React.Fragment key={step.id}>
//                 <motion.div
//                   initial={{ scale: 0.9, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   transition={{ delay: (index + 1) * 0.08 }}
//                   className="flex flex-col items-center gap-1"
//                 >
//                   <div
//                     className={`
//                       relative w-10 h-10 rounded-full flex items-center justify-center
//                       transition-all duration-500
//                       ${
//                         isCurrent
//                           ? "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.8)] scale-110"
//                           : isCompleted
//                           ? "bg-gradient-to-br from-cyan-400 to-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.9)]"
//                           : "bg-black/70 border border-white/25 shadow-[0_0_10px_rgba(148,163,184,0.45)]"
//                       }
//                     `}
//                   >
//                     {isCompleted ? (
//                       <svg
//                         className="w-5 h-5 text-white"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={3}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                     ) : (
//                       <div
//                         className={`text-sm ${
//                           isCurrent ? "text-black font-bold" : "text-white/80"
//                         }`}
//                       >
//                         {iconNode}
//                       </div>
//                     )}

//                     {isCurrent && (
//                       <div className="absolute inset-0 rounded-full border-2 border-yellow-300 animate-ping opacity-75" />
//                     )}
//                   </div>

//                   <div
//                     className={`
//                       text-[10px] font-medium text-center whitespace-nowrap
//                       transition-all duration-300
//                       ${
//                         isCurrent
//                           ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500"
//                           : isCompleted
//                           ? "text-cyan-300"
//                           : "text-white/60"
//                       }
//                     `}
//                   >
//                     {step.label}
//                   </div>
//                 </motion.div>
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       {/* нижний прогресс-бар */}
//       <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
//         <div
//           className="h-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all duration-500 ease-out"
//           style={{ width: `${progress}%` }}
//         />
//       </div>
//     </motion.header>
//   );
// }




//-------пытаюсь исправить проблемы с дизайном и переводом---------
// // src/components/PremiumProgressBar.tsx
// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import {
//   User,
//   CalendarDays,
//   FileText,
//   CheckCircle2,
//   CreditCard,
//   ScissorsLineDashed,
// } from "lucide-react";

// interface Step {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface PremiumProgressBarProps {
//   currentStep: number;
//   steps: Step[];
//   showLogo?: boolean;
// }

// /* Премиальный логотип-глаз */
// function PremiumEyeLogo({ className }: { className?: string }): React.JSX.Element {
//   return (
//     <svg
//       viewBox="0 0 120 80"
//       className={className ?? "w-12 h-8 sm:w-14 sm:h-9"}
//     >
//       <defs>
//         <linearGradient id="pe-gold" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" stopColor="#FFEFB0" />
//           <stop offset="40%" stopColor="#FFC94A" />
//           <stop offset="100%" stopColor="#FFB020" />
//         </linearGradient>

//         <radialGradient id="pe-iris" cx="50%" cy="50%" r="50%">
//           <stop offset="0%" stopColor="#90F9FF" />
//           <stop offset="35%" stopColor="#22D3EE" />
//           <stop offset="70%" stopColor="#0284C7" />
//           <stop offset="100%" stopColor="#020617" />
//         </radialGradient>

//         <radialGradient id="pe-iris-glow" cx="50%" cy="50%" r="50%">
//           <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
//           <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
//         </radialGradient>
//       </defs>

//       <path
//         d="M8 26 Q60 4 112 24"
//         fill="none"
//         stroke="url(#pe-gold)"
//         strokeWidth="4.2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M10 52 Q60 74 110 50"
//         fill="none"
//         stroke="url(#pe-gold)"
//         strokeWidth="3.6"
//         strokeLinecap="round"
//       />

//       <path
//         d="M26 55 Q35 67 44 59"
//         fill="none"
//         stroke="url(#pe-gold)"
//         strokeWidth="2.2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M46 57 Q55 71 63 60"
//         fill="none"
//         stroke="url(#pe-gold)"
//         strokeWidth="2"
//         strokeLinecap="round"
//       />
//       <path
//         d="M70 57 Q79 69 90 60"
//         fill="none"
//         stroke="url(#pe-gold)"
//         strokeWidth="2"
//         strokeLinecap="round"
//       />

//       <ellipse
//         cx="60"
//         cy="38"
//         rx="30"
//         ry="17"
//         fill="url(#pe-gold)"
//         opacity={0.16}
//       />

//       <circle cx="60" cy="38" r="14" fill="url(#pe-iris-glow)" opacity={0.6} />
//       <circle cx="60" cy="38" r="10" fill="url(#pe-iris)" />

//       <circle cx="60" cy="38" r="5" fill="#020617" />
//       <circle cx="56" cy="33.5" r="2.3" fill="#fff" opacity={0.95} />
//     </svg>
//   );
// }

// /* Иконки для шагов */
// const premiumStepIcons: Record<string, React.ReactNode> = {
//   services: <ScissorsLineDashed className="h-4 w-4" />,
//   master: <User className="h-4 w-4" />,
//   calendar: <CalendarDays className="h-4 w-4" />,
//   client: <FileText className="h-4 w-4" />,
//   verify: <CheckCircle2 className="h-4 w-4" />,
//   payment: <CreditCard className="h-4 w-4" />,
// };

// export default function PremiumProgressBar({
//   currentStep,
//   steps,
//   showLogo = true,
// }: PremiumProgressBarProps): React.JSX.Element {
//   const progress = ((currentStep + 1) / steps.length) * 100;

//   return (
//     <motion.header
//       initial={{ opacity: 0, y: -8 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.35, ease: "easeOut" }}
//       className="booking-header fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#020617] via-slate-950 to-[#020617] backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.9)]"
//     >
//       {/* верхняя неоновая линия */}
//       <div className="h-[2px] w-full bg-[linear-gradient(90deg,#22d3ee,#a855f7,#f97316,#22c55e,#22d3ee)] bg-[length:220%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* ───── ДЕСКТОПНЫЙ РЯД ───── */}
//       <div className="hidden sm:flex sm:mx-auto sm:max-w-6xl sm:items-center sm:gap-4 sm:px-6 sm:py-4">
//         {showLogo && (
//           <div className="flex items-center gap-3 mr-2">
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-[0_0_18px_rgba(245,197,24,0.8)]"
//             >
//               <div className="absolute inset-[2px] rounded-full bg-black/90 flex items-center justify-center">
//                 <PremiumEyeLogo className="w-8 h-5" />
//               </div>
//               <motion.div
//                 className="absolute inset-[-6px] rounded-full bg-amber-300/40 blur-xl"
//                 animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
//                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//               />
//             </motion.div>

//             <div className="flex flex-col leading-tight">
//               <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-sm font-semibold tracking-wide text-transparent">
//                 Salon Elen
//               </span>
//               <span className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
//                 премиальный букинг
//               </span>
//             </div>
//           </div>
//         )}

//         <div className="flex flex-1 items-center justify-end">
//           <div className="flex w-full items-center gap-3 overflow-x-hidden pb-1">
//             {steps.map((step, index) => {
//               const isCompleted = index < currentStep;
//               const isCurrent = index === currentStep;

//               const iconNode =
//                 premiumStepIcons[step.id] ?? (
//                   <span className="text-sm">{step.icon}</span>
//                 );

//               return (
//                 <React.Fragment key={step.id}>
//                   <motion.div
//                     initial={{ opacity: 0, y: 6 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                     className="inline-flex items-center"
//                   >
//                     <div className="flex items-center gap-2 px-1">
//                       {/* круг иконки шага */}
//                       <div className="relative inline-flex h-9 w-9 items-center justify-center">
//                         <span
//                           className={`absolute inset-0 rounded-full blur-md ${
//                             isCurrent
//                               ? "bg-gradient-to-br from-amber-400 via-yellow-300 to-emerald-300 opacity-95"
//                               : isCompleted
//                               ? "bg-gradient-to-br from-emerald-400 via-sky-400 to-emerald-300 opacity-85"
//                               : "bg-slate-800/60 opacity-60"
//                           }`}
//                         />
//                         {isCurrent && (
//                           <motion.span
//                             className="absolute inset-[-8px] rounded-full bg-amber-300/60 blur-xl z-0"
//                             animate={{
//                               scale: [1, 1.18, 1],
//                               opacity: [0.6, 0, 0.6],
//                             }}
//                             transition={{
//                               duration: 1.8,
//                               repeat: Infinity,
//                               ease: "easeInOut",
//                             }}
//                           />
//                         )}
//                         <span
//                           className={`relative inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border text-[13px] ${
//                             isCurrent
//                               ? "z-10 border-amber-200 bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-400 text-black shadow-[0_0_16px_rgba(245,197,24,0.9)]"
//                               : isCompleted
//                               ? "border-emerald-300 bg-slate-950 text-emerald-200 shadow-[0_0_16px_rgba(34,197,94,0.85)]"
//                               : "border-white/16 bg-black/70 text-slate-200"
//                           }`}
//                         >
//                           {iconNode}
//                         </span>
//                       </div>

//                       <div className="hidden min-w-[70px] sm:flex">
//                         <span
//                           className={`text-xs ${
//                             isCurrent
//                               ? "bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                               : isCompleted
//                               ? "text-emerald-200"
//                               : "text-slate-200"
//                           }`}
//                         >
//                           {step.label}
//                         </span>
//                       </div>
//                     </div>
//                   </motion.div>

//                   {index < steps.length - 1 && (
//                     <div className="hidden h-px flex-1 items-center sm:flex">
//                       <div
//                         className={`h-[2px] w-full rounded-full bg-gradient-to-r ${
//                           index < currentStep
//                             ? "from-emerald-400 via-emerald-300 to-sky-400"
//                             : "from-slate-700 via-slate-800 to-slate-900"
//                         }`}
//                       />
//                     </div>
//                   )}
//                 </React.Fragment>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* ───── МОБИЛЬНЫЙ РЯД ───── */}
//       <div className="sm:hidden px-4 pt-3 pb-3">
//         <div
//           className="
//             flex items-center justify-center gap-3
//             overflow-x-auto
//             [scrollbar-width:none]
//             [-ms-overflow-style:none]
//             [&::-webkit-scrollbar]:hidden
//           "
//         >
//           {/* глаз как первая иконка ряда */}
//           {showLogo && (
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               className="relative w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.6)]"
//             >
//               <div className="absolute inset-[2px] rounded-full bg-black/90 flex items-center justify-center">
//                 <PremiumEyeLogo className="w-7 h-4" />
//               </div>
//               <motion.div
//                 className="absolute inset-[-6px] rounded-full bg-amber-300/40 blur-xl"
//                 animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
//                 transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//               />
//             </motion.div>
//           )}

//           {steps.map((step, index) => {
//             const isCompleted = index < currentStep;
//             const isCurrent = index === currentStep;
//             const iconNode =
//               premiumStepIcons[step.id] ?? (
//                 <span className="text-sm">{step.icon}</span>
//               );

//             return (
//               <React.Fragment key={step.id}>
//                 <motion.div
//                   initial={{ scale: 0.9, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   transition={{ delay: (index + 1) * 0.08 }}
//                   className="flex flex-col items-center gap-1"
//                 >
//                   <div
//                     className={`
//                       relative w-10 h-10 rounded-full flex items-center justify-center
//                       transition-all duration-500
//                       ${
//                         isCurrent
//                           ? "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.8)] scale-110"
//                           : isCompleted
//                           ? "bg-gradient-to-br from-cyan-400 to-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.9)]"
//                           : "bg-black/70 border border-white/25 shadow-[0_0_10px_rgba(148,163,184,0.45)]"
//                       }
//                     `}
//                   >
//                     {isCompleted ? (
//                       <svg
//                         className="w-5 h-5 text-white"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={3}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                     ) : (
//                       <div
//                         className={`text-sm ${
//                           isCurrent ? "text-black font-bold" : "text-white/80"
//                         }`}
//                       >
//                         {iconNode}
//                       </div>
//                     )}

//                     {isCurrent && (
//                       <div className="absolute inset-0 rounded-full border-2 border-yellow-300 animate-ping opacity-75" />
//                     )}
//                   </div>

//                   <div
//                     className={`
//                       text-[10px] font-medium text-center whitespace-nowrap
//                       transition-all duration-300
//                       ${
//                         isCurrent
//                           ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500"
//                           : isCompleted
//                           ? "text-cyan-300"
//                           : "text-white/60"
//                       }
//                     `}
//                   >
//                     {step.label}
//                   </div>
//                 </motion.div>
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       {/* нижний прогресс-бар */}
//       <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
//         <div
//           className="h-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all duration-500 ease-out"
//           style={{ width: `${progress}%` }}
//         />
//       </div>
//     </motion.header>
//   );
// }




//--------отличный рабочий прогресс бар, можно юзать, но хочу новый-----
// 'use client';

// import React from 'react';

// interface Step {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface PremiumProgressBarProps {
//   currentStep: number;
//   steps: Step[];
//   showLogo?: boolean;
// }

// export default function PremiumProgressBar({ 
//   currentStep, 
//   steps,
//   showLogo = true 
// }: PremiumProgressBarProps) {
//   const progress = ((currentStep + 1) / steps.length) * 100;

//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
//       {/* Логотип Salon Elen */}
//       {showLogo && (
//         <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
//           <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-xl md:text-2xl shadow-[0_0_20px_rgba(255,215,0,0.5)] animate-pulse">
//             👁️
//           </div>
          
//           <div className="hidden sm:block">
//             <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 font-bold text-lg md:text-xl tracking-wider">
//               Salon Elen
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Шаги прогресса */}
//       <div className="container mx-auto px-4 py-3 md:py-4">
//         <div className="flex items-center justify-center gap-2 md:gap-4 max-w-4xl mx-auto">
//           {steps.map((step, index) => {
//             const isCompleted = index < currentStep;
//             const isCurrent = index === currentStep;
            
//             return (
//               <React.Fragment key={step.id}>
//                 <div className="flex flex-col items-center gap-1 md:gap-2">
//                   <div
//                     className={`
//                       relative w-10 h-10 md:w-12 md:h-12 rounded-full 
//                       flex items-center justify-center
//                       transition-all duration-500
//                       ${isCurrent 
//                         ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.6)] scale-110' 
//                         : isCompleted
//                         ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
//                         : 'bg-white/5 border border-white/20'
//                       }
//                     `}
//                   >
//                     {isCompleted ? (
//                       <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                       </svg>
//                     ) : (
//                       <div className={`text-sm md:text-base ${isCurrent ? 'text-black font-bold' : 'text-white/50'}`}>
//                         {step.icon}
//                       </div>
//                     )}
                    
//                     {isCurrent && (
//                       <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping opacity-75" />
//                     )}
//                   </div>
                  
//                   <div className={`
//                     text-[10px] md:text-xs font-medium text-center whitespace-nowrap
//                     transition-all duration-300
//                     ${isCurrent 
//                       ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600' 
//                       : isCompleted
//                       ? 'text-cyan-400'
//                       : 'text-white/40'
//                     }
//                   `}>
//                     {step.label}
//                   </div>
//                 </div>
                
//                 {index < steps.length - 1 && (
//                   <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden max-w-[60px] lg:max-w-[80px]">
//                     <div
//                       className={`
//                         absolute inset-0 h-full transition-all duration-500
//                         ${isCompleted 
//                           ? 'bg-gradient-to-r from-cyan-400 to-blue-600 w-full' 
//                           : 'bg-transparent w-0'
//                         }
//                       `}
//                     />
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       {/* Прогресс бар внизу */}
//       <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
//         <div
//           className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 shadow-[0_0_10px_rgba(255,215,0,0.6)] transition-all duration-500 ease-out"
//           style={{ width: `${progress}%` }}
//         />
//       </div>
//     </div>
//   );
// }



// 'use client';

// import React from 'react';
// import { motion } from 'framer-motion';

// interface Step {
//   id: string;
//   label: string;
//   icon: React.ReactNode;
// }

// interface PremiumProgressBarProps {
//   currentStep: number;
//   steps: Step[];
//   showLogo?: boolean;
// }

// export default function PremiumProgressBar({ 
//   currentStep, 
//   steps,
//   showLogo = true 
// }: PremiumProgressBarProps) {
//   const progress = ((currentStep + 1) / steps.length) * 100;

//   return (
//     <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
//       {/* Логотип Salon Elen */}
//       {showLogo && (
//         <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
//           {/* Глаз - основной логотип */}
//           <div className="relative w-12 h-12">
//             <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-full blur-sm opacity-50 animate-pulse"></div>
//             <div className="relative w-12 h-12 flex items-center justify-center">
//               <svg viewBox="0 0 100 100" className="w-10 h-10">
//                 {/* Золотые ресницы верхние */}
//                 <path d="M20,40 Q30,25 35,30" stroke="url(#goldGradient)" strokeWidth="2" fill="none" strokeLinecap="round"/>
//                 <path d="M30,35 Q35,20 40,28" stroke="url(#goldGradient)" strokeWidth="2" fill="none" strokeLinecap="round"/>
//                 <path d="M45,32 Q50,15 52,25" stroke="url(#goldGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
//                 <path d="M58,30 Q60,18 63,28" stroke="url(#goldGradient)" strokeWidth="2" fill="none" strokeLinecap="round"/>
//                 <path d="M70,35 Q72,22 75,32" stroke="url(#goldGradient)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                
//                 {/* Глаз */}
//                 <ellipse cx="50" cy="50" rx="30" ry="18" fill="url(#goldGradient)" opacity="0.3"/>
                
//                 {/* Голубая радужка */}
//                 <circle cx="50" cy="50" r="12" fill="url(#cyanGradient)"/>
//                 <circle cx="50" cy="50" r="12" fill="url(#cyanGlow)" opacity="0.6"/>
                
//                 {/* Зрачок */}
//                 <circle cx="50" cy="50" r="5" fill="#000"/>
                
//                 {/* Блик */}
//                 <circle cx="48" cy="47" r="2" fill="white" opacity="0.9"/>
                
//                 {/* Золотые ресницы нижние */}
//                 <path d="M25,60 Q30,70 35,65" stroke="url(#goldGradient)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
//                 <path d="M40,62 Q45,72 48,67" stroke="url(#goldGradient)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
//                 <path d="M60,62 Q62,70 66,66" stroke="url(#goldGradient)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                
//                 <defs>
//                   <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                     <stop offset="0%" stopColor="#FFD700"/>
//                     <stop offset="50%" stopColor="#FFA500"/>
//                     <stop offset="100%" stopColor="#FF8C00"/>
//                   </linearGradient>
                  
//                   <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                     <stop offset="0%" stopColor="#00D4FF"/>
//                     <stop offset="100%" stopColor="#0088CC"/>
//                   </linearGradient>
                  
//                   <radialGradient id="cyanGlow">
//                     <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8"/>
//                     <stop offset="100%" stopColor="#00D4FF" stopOpacity="0"/>
//                   </radialGradient>
//                 </defs>
//               </svg>
//             </div>
//           </div>
          
//           <div className="hidden sm:block">
//             <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 font-bold text-xl tracking-wider">
//               Salon Elen
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="container mx-auto px-4 py-4">
//         <div className="flex items-center justify-center gap-2 md:gap-4 max-w-4xl mx-auto">
//           {steps.map((step, index) => {
//             const isCompleted = index < currentStep;
//             const isCurrent = index === currentStep;
            
//             return (
//               <React.Fragment key={step.id}>
//                 {/* Шаг */}
//                 <motion.div
//                   initial={{ scale: 0.8, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   transition={{ delay: index * 0.1 }}
//                   className="flex flex-col items-center gap-2"
//                 >
//                   {/* Иконка шага */}
//                   <div
//                     className={`
//                       relative w-12 h-12 rounded-full flex items-center justify-center
//                       transition-all duration-500
//                       ${isCurrent 
//                         ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.6)] scale-110' 
//                         : isCompleted
//                         ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
//                         : 'bg-white/5 border border-white/20'
//                       }
//                     `}
//                   >
//                     {isCompleted ? (
//                       <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                       </svg>
//                     ) : (
//                       <div className={`text-sm ${isCurrent ? 'text-black font-bold' : 'text-white/50'}`}>
//                         {step.icon}
//                       </div>
//                     )}
                    
//                     {/* Анимированное кольцо для текущего шага */}
//                     {isCurrent && (
//                       <motion.div
//                         className="absolute inset-0 rounded-full border-2 border-yellow-400"
//                         animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
//                         transition={{ duration: 2, repeat: Infinity }}
//                       />
//                     )}
//                   </div>
                  
//                   {/* Название шага */}
//                   <div className={`
//                     text-xs md:text-sm font-medium text-center
//                     transition-all duration-300
//                     ${isCurrent 
//                       ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600' 
//                       : isCompleted
//                       ? 'text-cyan-400'
//                       : 'text-white/40'
//                     }
//                   `}>
//                     {step.label}
//                   </div>
//                 </motion.div>
                
//                 {/* Линия между шагами */}
//                 {index < steps.length - 1 && (
//                   <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden max-w-[80px]">
//                     <motion.div
//                       className={`
//                         absolute inset-0 h-full
//                         ${isCompleted 
//                           ? 'bg-gradient-to-r from-cyan-400 to-blue-600' 
//                           : 'bg-transparent'
//                         }
//                       `}
//                       initial={{ width: 0 }}
//                       animate={{ width: isCompleted ? '100%' : '0%' }}
//                       transition={{ duration: 0.5, delay: index * 0.1 }}
//                     />
//                   </div>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </div>
//       </div>

//       {/* Прогресс бар внизу */}
//       <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
//         <motion.div
//           className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 shadow-[0_0_10px_rgba(255,215,0,0.6)]"
//           initial={{ width: 0 }}
//           animate={{ width: `${progress}%` }}
//           transition={{ duration: 0.5, ease: 'easeOut' }}
//         />
//       </div>
//     </div>
//   );
// }
