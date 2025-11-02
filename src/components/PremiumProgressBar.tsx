'use client';

import React from 'react';

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
  showLogo = true 
}: PremiumProgressBarProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
      {/* Логотип Salon Elen */}
      {showLogo && (
        <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-xl md:text-2xl shadow-[0_0_20px_rgba(255,215,0,0.5)] animate-pulse">
            👁️
          </div>
          
          <div className="hidden sm:block">
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 font-bold text-lg md:text-xl tracking-wider">
              Salon Elen
            </div>
          </div>
        </div>
      )}

      {/* Шаги прогресса */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-center gap-2 md:gap-4 max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-1 md:gap-2">
                  <div
                    className={`
                      relative w-10 h-10 md:w-12 md:h-12 rounded-full 
                      flex items-center justify-center
                      transition-all duration-500
                      ${isCurrent 
                        ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_20px_rgba(255,215,0,0.6)] scale-110' 
                        : isCompleted
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                        : 'bg-white/5 border border-white/20'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className={`text-sm md:text-base ${isCurrent ? 'text-black font-bold' : 'text-white/50'}`}>
                        {step.icon}
                      </div>
                    )}
                    
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-400 animate-ping opacity-75" />
                    )}
                  </div>
                  
                  <div className={`
                    text-[10px] md:text-xs font-medium text-center whitespace-nowrap
                    transition-all duration-300
                    ${isCurrent 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600' 
                      : isCompleted
                      ? 'text-cyan-400'
                      : 'text-white/40'
                    }
                  `}>
                    {step.label}
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block flex-1 h-0.5 bg-white/10 relative overflow-hidden max-w-[60px] lg:max-w-[80px]">
                    <div
                      className={`
                        absolute inset-0 h-full transition-all duration-500
                        ${isCompleted 
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-600 w-full' 
                          : 'bg-transparent w-0'
                        }
                      `}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Прогресс бар внизу */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 shadow-[0_0_10px_rgba(255,215,0,0.6)] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}



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
