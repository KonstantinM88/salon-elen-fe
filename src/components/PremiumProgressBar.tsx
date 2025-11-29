"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  User,
  CalendarDays,
  FileText,
  CheckCircle2,
  CreditCard,
  ScissorsLineDashed,
} from "lucide-react";

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

/* Премиальный логотип-глаз */
function PremiumEyeLogo({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 120 80"
      className={className ?? "w-12 h-8 sm:w-14 sm:h-9"}
    >
      <defs>
        <linearGradient id="pe-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFEFB0" />
          <stop offset="40%" stopColor="#FFC94A" />
          <stop offset="100%" stopColor="#FFB020" />
        </linearGradient>

        <radialGradient id="pe-iris" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#90F9FF" />
          <stop offset="35%" stopColor="#22D3EE" />
          <stop offset="70%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        <radialGradient id="pe-iris-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d="M8 26 Q60 4 112 24"
        fill="none"
        stroke="url(#pe-gold)"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M10 52 Q60 74 110 50"
        fill="none"
        stroke="url(#pe-gold)"
        strokeWidth="3.6"
        strokeLinecap="round"
      />

      <path
        d="M26 55 Q35 67 44 59"
        fill="none"
        stroke="url(#pe-gold)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M46 57 Q55 71 63 60"
        fill="none"
        stroke="url(#pe-gold)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M70 57 Q79 69 90 60"
        fill="none"
        stroke="url(#pe-gold)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <ellipse
        cx="60"
        cy="38"
        rx="30"
        ry="17"
        fill="url(#pe-gold)"
        opacity={0.16}
      />

      <circle cx="60" cy="38" r="14" fill="url(#pe-iris-glow)" opacity={0.6} />
      <circle cx="60" cy="38" r="10" fill="url(#pe-iris)" />

      <circle cx="60" cy="38" r="5" fill="#020617" />
      <circle cx="56" cy="33.5" r="2.3" fill="#fff" opacity={0.95} />
    </svg>
  );
}

/* Иконки для шагов */
const premiumStepIcons: Record<string, React.ReactNode> = {
  services: <ScissorsLineDashed className="h-4 w-4" />,
  master: <User className="h-4 w-4" />,
  calendar: <CalendarDays className="h-4 w-4" />,
  client: <FileText className="h-4 w-4" />,
  verify: <CheckCircle2 className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
};

export default function PremiumProgressBar({
  currentStep,
  steps,
  showLogo = true,
}: PremiumProgressBarProps): React.JSX.Element {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="booking-header fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#020617] via-slate-950 to-[#020617] backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.9)]"
    >
      {/* верхняя неоновая линия */}
      <div className="h-[2px] w-full bg-[linear-gradient(90deg,#22d3ee,#a855f7,#f97316,#22c55e,#22d3ee)] bg-[length:220%_2px] animate-[bg-slide_9s_linear_infinite]" />

      {/* ───── ДЕСКТОПНЫЙ РЯД ───── */}
      <div className="hidden sm:flex sm:mx-auto sm:max-w-6xl sm:items-center sm:gap-4 sm:px-6 sm:py-4">
        {showLogo && (
          <div className="flex items-center gap-3 mr-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-[0_0_18px_rgba(245,197,24,0.8)]"
            >
              <div className="absolute inset-[2px] rounded-full bg-black/90 flex items-center justify-center">
                <PremiumEyeLogo className="w-8 h-5" />
              </div>
              <motion.div
                className="absolute inset-[-6px] rounded-full bg-amber-300/40 blur-xl"
                animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            <div className="flex flex-col leading-tight">
              <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-sm font-semibold tracking-wide text-transparent">
                Salon Elen
              </span>
              <span className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
                премиальный букинг
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-1 items-center justify-end">
          <div className="flex w-full items-center gap-3 overflow-x-hidden pb-1">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              const iconNode =
                premiumStepIcons[step.id] ?? (
                  <span className="text-sm">{step.icon}</span>
                );

              return (
                <React.Fragment key={step.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="inline-flex items-center"
                  >
                    <div className="flex items-center gap-2 px-1">
                      {/* круг иконки шага */}
                      <div className="relative inline-flex h-9 w-9 items-center justify-center">
                        <span
                          className={`absolute inset-0 rounded-full blur-md ${
                            isCurrent
                              ? "bg-gradient-to-br from-amber-400 via-yellow-300 to-emerald-300 opacity-95"
                              : isCompleted
                              ? "bg-gradient-to-br from-emerald-400 via-sky-400 to-emerald-300 opacity-85"
                              : "bg-slate-800/60 opacity-60"
                          }`}
                        />
                        {isCurrent && (
                          <motion.span
                            className="absolute inset-[-8px] rounded-full bg-amber-300/60 blur-xl z-0"
                            animate={{
                              scale: [1, 1.18, 1],
                              opacity: [0.6, 0, 0.6],
                            }}
                            transition={{
                              duration: 1.8,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                        <span
                          className={`relative inline-flex h-[32px] w-[32px] items-center justify-center rounded-full border text-[13px] ${
                            isCurrent
                              ? "z-10 border-amber-200 bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-400 text-black shadow-[0_0_16px_rgba(245,197,24,0.9)]"
                              : isCompleted
                              ? "border-emerald-300 bg-slate-950 text-emerald-200 shadow-[0_0_16px_rgba(34,197,94,0.85)]"
                              : "border-white/16 bg-black/70 text-slate-200"
                          }`}
                        >
                          {iconNode}
                        </span>
                      </div>

                      <div className="hidden min-w-[70px] sm:flex">
                        <span
                          className={`text-xs ${
                            isCurrent
                              ? "bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
                              : isCompleted
                              ? "text-emerald-200"
                              : "text-slate-200"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {index < steps.length - 1 && (
                    <div className="hidden h-px flex-1 items-center sm:flex">
                      <div
                        className={`h-[2px] w-full rounded-full bg-gradient-to-r ${
                          index < currentStep
                            ? "from-emerald-400 via-emerald-300 to-sky-400"
                            : "from-slate-700 via-slate-800 to-slate-900"
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ───── МОБИЛЬНЫЙ РЯД ───── */}
      <div className="sm:hidden px-4 pt-3 pb-3">
        <div
          className="
            flex items-center justify-center gap-3
            overflow-x-auto
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {/* глаз как первая иконка ряда */}
          {showLogo && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.6)]"
            >
              <div className="absolute inset-[2px] rounded-full bg-black/90 flex items-center justify-center">
                <PremiumEyeLogo className="w-7 h-4" />
              </div>
              <motion.div
                className="absolute inset-[-6px] rounded-full bg-amber-300/40 blur-xl"
                animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          )}

          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const iconNode =
              premiumStepIcons[step.id] ?? (
                <span className="text-sm">{step.icon}</span>
              );

            return (
              <React.Fragment key={step.id}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (index + 1) * 0.08 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`
                      relative w-10 h-10 rounded-full flex items-center justify-center
                      transition-all duration-500
                      ${
                        isCurrent
                          ? "bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.8)] scale-110"
                          : isCompleted
                          ? "bg-gradient-to-br from-cyan-400 to-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.9)]"
                          : "bg-black/70 border border-white/25 shadow-[0_0_10px_rgba(148,163,184,0.45)]"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <div
                        className={`text-sm ${
                          isCurrent ? "text-black font-bold" : "text-white/80"
                        }`}
                      >
                        {iconNode}
                      </div>
                    )}

                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-300 animate-ping opacity-75" />
                    )}
                  </div>

                  <div
                    className={`
                      text-[10px] font-medium text-center whitespace-nowrap
                      transition-all duration-300
                      ${
                        isCurrent
                          ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500"
                          : isCompleted
                          ? "text-cyan-300"
                          : "text-white/60"
                      }
                    `}
                  >
                    {step.label}
                  </div>
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* нижний прогресс-бар */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.header>
  );
}




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
