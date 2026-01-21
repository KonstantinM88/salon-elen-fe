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
