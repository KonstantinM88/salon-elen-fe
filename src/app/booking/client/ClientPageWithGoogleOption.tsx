// src/app/booking/client/ClientPageWithGoogleOption.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FiEdit, FiZap, FiCheck, FiShield } from "react-icons/fi";

interface ClientPageWithGoogleOptionProps {
  serviceId: string;
  masterId: string;
  startAt: string;
  endAt: string;
  selectedDate: string;
}

export default function ClientPageWithGoogleOption({
  serviceId,
  masterId,
  startAt,
  endAt,
  selectedDate,
}: ClientPageWithGoogleOptionProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showGoogleAuth, setShowGoogleAuth] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleGoogleRegistration = async () => {
    setLoading(true);
    setError(null);

    try {
      setShowGoogleAuth(true);

      const res = await fetch("/api/booking/client/google-quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, masterId, startAt, endAt }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok || !data.authUrl) {
        throw new Error(data.error || "Ошибка инициализации Google OAuth");
      }

      const popup = openGooglePopup(data.authUrl);

      if (popup) {
        startPolling(data.requestId);
      } else {
        throw new Error("Не удалось открыть окно. Разрешите всплывающие окна в браузере.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка авторизации";
      setError(msg);
      setShowGoogleAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const openGooglePopup = (authUrl: string): Window | null => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    return window.open(
      authUrl,
      "Google OAuth",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const startPolling = (requestId: string) => {
    setIsPolling(true);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/booking/client/google-quick/status?requestId=${requestId}`);
        const data = await res.json();

        if (data.verified === true && data.appointmentId) {
          setIsPolling(false);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          router.push(`/booking/payment?appointment=${data.appointmentId}`);
        } else if (data.error) {
          throw new Error(data.error);
        }
      } catch (e) {
        console.error("[Google Quick Reg] Polling error:", e);
        setIsPolling(false);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setError(e instanceof Error ? e.message : "Ошибка при проверке статуса авторизации");
        setShowGoogleAuth(false);
      }
    }, 2000);
  };

  React.useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  const handleManualForm = () => {
    router.push(`/booking/client/form?s=${serviceId}&m=${masterId}&start=${startAt}&end=${endAt}&d=${selectedDate}`);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* 💎 ФИРМЕННЫЙ ХЕДЕР */}
      <header className="booking-header relative border-b border-[#D4AF37]/20 bg-black/40 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-[#D4AF37]/5 to-cyan-500/5" />
        
        <div className="container mx-auto px-4 py-4 relative">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#FFD700] to-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 transition-transform group-hover:scale-105">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <span className="block text-2xl font-serif text-[#D4AF37] font-bold tracking-wide">
                Salon Elen
              </span>
              <span className="block text-xs text-cyan-400/70">
                Premium Beauty Experience
              </span>
            </div>
          </Link>
        </div>
      </header>

      {/* КОНТЕНТ */}
      <div className="flex items-center justify-center p-6 py-16">
        <div className="max-w-4xl w-full">
          {/* ЗАГОЛОВОК КАК НА СТРАНИЦЕ УСЛУГ */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic font-bold mb-4 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent leading-tight">
              Как вы хотите продолжить?
            </h1>
            <p className="text-cyan-400/90 text-base sm:text-lg font-light tracking-wide">
              Выберите удобный способ регистрации
            </p>
          </motion.div>

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl">
              <p className="text-red-400 text-center">{error}</p>
            </motion.div>
          )}

          {showGoogleAuth && isPolling && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <FcGoogle className="w-8 h-8" />
                </motion.div>
              </div>
              <p className="text-cyan-300 font-medium text-lg">Завершите вход в Google...</p>
              <p className="text-gray-400 text-sm mt-2">После авторизации вы автоматически перейдёте к оплате</p>
            </motion.div>
          )}

          {!showGoogleAuth && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Google регистрация */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.02 }} className="relative group">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm font-bold shadow-lg">
                    ⚡ Рекомендуем
                  </div>
                </div>

                <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/5 border-2 border-[#D4AF37]/30 backdrop-blur-xl hover:border-[#D4AF37]/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <FcGoogle className="w-12 h-12" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-center mb-4">
                    <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">Быстрая регистрация</span>
                  </h2>

                  <p className="text-gray-300 text-center mb-6">Войдите через Google и сразу перейдите к оплате</p>

                  <div className="space-y-3 mb-8">
                    {["Один клик до оплаты", "Автозаполнение данных", "Безопасно и надёжно", "Экономия времени"].map((benefit, index) => (
                      <motion.div key={benefit} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                          <FiCheck className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                        <span className="text-gray-300">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  <button onClick={handleGoogleRegistration} disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold text-lg hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group">
                    {loading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <FiZap className="w-5 h-5" />
                        </motion.div>
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <FcGoogle className="w-6 h-6" />
                        Продолжить с Google
                        <motion.span className="group-hover:translate-x-1 transition-transform inline-block">→</motion.span>
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <FiShield className="w-4 h-4" />
                    <span>Защищено Google OAuth 2.0</span>
                  </div>
                </div>
              </motion.div>

              {/* Ручная форма */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02 }} className="relative group">
                <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-2 border-cyan-500/20 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                      <FiEdit className="w-10 h-10 text-cyan-400" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-center mb-4">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Заполнить форму</span>
                  </h2>

                  <p className="text-gray-300 text-center mb-6">Традиционный способ с полным контролем над данными</p>

                  <div className="space-y-3 mb-8">
                    {["Полный контроль данных", "Без Google аккаунта", "Привычный процесс"].map((benefit, index) => (
                      <motion.div key={benefit} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <FiCheck className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="text-gray-300">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  <button onClick={handleManualForm} className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 text-cyan-300 font-bold text-lg hover:border-cyan-500/50 hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-3 group">
                    <FiEdit className="w-5 h-5" />
                    Заполнить форму
                    <motion.span className="group-hover:translate-x-1 transition-transform inline-block">→</motion.span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 text-center text-gray-400 text-sm">
            <p>
              Оба способа безопасны и надёжны. <span className="text-[#D4AF37]">Выберите тот, который вам удобнее.</span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// // src/app/booking/client/ClientPageWithGoogleOption.tsx
// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { FcGoogle } from "react-icons/fc";
// import { FiEdit, FiZap, FiCheck, FiShield } from "react-icons/fi";

// interface ClientPageWithGoogleOptionProps {
//   serviceId: string;
//   masterId: string;
//   startAt: string;
//   endAt: string;
//   selectedDate: string;
// }

// /**
//  * Компонент выбора способа регистрации:
//  * 1. Быстрая регистрация через Google (рекомендуется)
//  * 2. Ручное заполнение формы
//  */
// export default function ClientPageWithGoogleOption({
//   serviceId,
//   masterId,
//   startAt,
//   endAt,
//   selectedDate,
// }: ClientPageWithGoogleOptionProps) {
//   const router = useRouter();
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const [showGoogleAuth, setShowGoogleAuth] = React.useState(false);
//   const [isPolling, setIsPolling] = React.useState(false);
//   const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

//   /**
//    * Обработчик выбора "Быстрая регистрация через Google"
//    */
//   const handleGoogleRegistration = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       // Показываем интерфейс Google авторизации
//       setShowGoogleAuth(true);

//       // Инициируем OAuth flow для быстрой регистрации
//       const res = await fetch("/api/booking/client/google-quick", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.ok || !data.authUrl) {
//         throw new Error(data.error || "Ошибка инициализации Google OAuth");
//       }

//       // Открываем popup с Google OAuth
//       const popup = openGooglePopup(data.authUrl);

//       if (popup) {
//         // Начинаем polling для отслеживания статуса
//         startPolling(data.requestId);
//       } else {
//         throw new Error(
//           "Не удалось открыть окно. Разрешите всплывающие окна в браузере."
//         );
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка авторизации";
//       setError(msg);
//       setShowGoogleAuth(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Открытие Google OAuth popup
//    */
//   const openGooglePopup = (authUrl: string): Window | null => {
//     const width = 500;
//     const height = 600;
//     const left = window.screenX + (window.outerWidth - width) / 2;
//     const top = window.screenY + (window.outerHeight - height) / 2;

//     return window.open(
//       authUrl,
//       "Google OAuth",
//       `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
//     );
//   };

//   /**
//    * Polling статуса Google OAuth
//    */
//   const startPolling = (requestId: string) => {
//     setIsPolling(true);

//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/client/google-quick/status?requestId=${requestId}`
//         );
//         const data = await res.json();

//         if (data.verified === true && data.appointmentId) {
//           // ✅ Успешная регистрация!
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }

//           // Переход на страницу оплаты
//           router.push(`/booking/payment?appointment=${data.appointmentId}`);
//         } else if (data.error) {
//           // ❌ Ошибка
//           throw new Error(data.error);
//         }
//       } catch (e) {
//         console.error("[Google Quick Reg] Polling error:", e);
//         setIsPolling(false);
//         if (pollingRef.current) {
//           clearInterval(pollingRef.current);
//           pollingRef.current = null;
//         }
//         setError(
//           e instanceof Error
//             ? e.message
//             : "Ошибка при проверке статуса авторизации"
//         );
//         setShowGoogleAuth(false);
//       }
//     }, 2000);
//   };

//   /**
//    * Cleanup polling при размонтировании
//    */
//   React.useEffect(() => {
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, []);

//   /**
//    * Обработчик выбора "Заполнить форму вручную"
//    */
//   const handleManualForm = () => {
//     // Переход на обычную форму заполнения
//     router.push(
//       `/booking/client/form?s=${serviceId}&m=${masterId}&start=${startAt}&end=${endAt}&d=${selectedDate}`
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#0F0F1E]">
//       {/* 💎 ФИРМЕННЫЙ ХЕДЕР SALON ELEN */}
//       <header className="relative border-b border-[#D4AF37]/20 bg-black/40 backdrop-blur-xl">
//         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-[#D4AF37]/5 to-cyan-500/5" />
        
//         <div className="container mx-auto px-4 py-4 relative">
//           <Link href="/" className="inline-flex items-center gap-3 group">
//             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#FFD700] to-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 transition-transform group-hover:scale-105">
//               <span className="text-2xl">💎</span>
//             </div>
//             <div>
//               <span className="block text-2xl font-serif text-[#D4AF37] font-bold tracking-wide">
//                 Salon Elen
//               </span>
//               <span className="block text-xs text-cyan-400/70">
//                 Premium Beauty Experience
//               </span>
//             </div>
//           </Link>
//         </div>
//       </header>

//       {/* ОСНОВНОЙ КОНТЕНТ */}
//       <div className="flex items-center justify-center p-6 py-12">
//         <div className="max-w-4xl w-full">
//           {/* Заголовок */}
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-8"
//           >
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">
//               <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
//                 Как вы хотите продолжить?
//               </span>
//             </h1>
//             <p className="text-gray-400 text-lg">
//               Выберите удобный способ регистрации
//             </p>
//           </motion.div>

//           {/* Ошибка */}
//           {error && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl"
//             >
//               <p className="text-red-400 text-center">{error}</p>
//             </motion.div>
//           )}

//           {/* Google Auth в процессе */}
//           {showGoogleAuth && isPolling && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="mb-6 p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl text-center"
//             >
//               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
//                 <motion.div
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                 >
//                   <FcGoogle className="w-8 h-8" />
//                 </motion.div>
//               </div>
//               <p className="text-cyan-300 font-medium text-lg">
//                 Завершите вход в Google...
//               </p>
//               <p className="text-gray-400 text-sm mt-2">
//                 После авторизации вы автоматически перейдёте к оплате
//               </p>
//             </motion.div>
//           )}

//           {/* Варианты регистрации */}
//           {!showGoogleAuth && (
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Вариант 1: Быстрая регистрация через Google */}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 }}
//                 whileHover={{ scale: 1.02 }}
//                 className="relative group"
//               >
//                 {/* Рекомендация badge */}
//                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
//                   <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm font-bold shadow-lg">
//                     ⚡ Рекомендуем
//                   </div>
//                 </div>

//                 <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/5 border-2 border-[#D4AF37]/30 backdrop-blur-xl hover:border-[#D4AF37]/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20">
//                   {/* Иконка */}
//                   <div className="flex justify-center mb-6">
//                     <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
//                       <FcGoogle className="w-12 h-12" />
//                     </div>
//                   </div>

//                   {/* Заголовок */}
//                   <h2 className="text-2xl font-bold text-center mb-4">
//                     <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
//                       Быстрая регистрация
//                     </span>
//                   </h2>

//                   <p className="text-gray-300 text-center mb-6">
//                     Войдите через Google и сразу перейдите к оплате
//                   </p>

//                   {/* Преимущества */}
//                   <div className="space-y-3 mb-8">
//                     {[
//                       "Один клик до оплаты",
//                       "Автозаполнение данных",
//                       "Безопасно и надёжно",
//                       "Экономия времени",
//                     ].map((benefit, index) => (
//                       <motion.div
//                         key={benefit}
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.2 + index * 0.1 }}
//                         className="flex items-center gap-3"
//                       >
//                         <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
//                           <FiCheck className="w-4 h-4 text-[#D4AF37]" />
//                         </div>
//                         <span className="text-gray-300">{benefit}</span>
//                       </motion.div>
//                     ))}
//                   </div>

//                   {/* Кнопка */}
//                   <button
//                     onClick={handleGoogleRegistration}
//                     disabled={loading}
//                     className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold text-lg hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
//                   >
//                     {loading ? (
//                       <>
//                         <motion.div
//                           animate={{ rotate: 360 }}
//                           transition={{
//                             duration: 1,
//                             repeat: Infinity,
//                             ease: "linear",
//                           }}
//                         >
//                           <FiZap className="w-5 h-5" />
//                         </motion.div>
//                         Загрузка...
//                       </>
//                     ) : (
//                       <>
//                         <FcGoogle className="w-6 h-6" />
//                         Продолжить с Google
//                         <motion.span
//                           className="group-hover:translate-x-1 transition-transform inline-block"
//                         >
//                           →
//                         </motion.span>
//                       </>
//                     )}
//                   </button>

//                   {/* Безопасность */}
//                   <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
//                     <FiShield className="w-4 h-4" />
//                     <span>Защищено Google OAuth 2.0</span>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Вариант 2: Заполнить форму вручную */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//                 whileHover={{ scale: 1.02 }}
//                 className="relative group"
//               >
//                 <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-2 border-cyan-500/20 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10">
//                   {/* Иконка */}
//                   <div className="flex justify-center mb-6">
//                     <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
//                       <FiEdit className="w-10 h-10 text-cyan-400" />
//                     </div>
//                   </div>

//                   {/* Заголовок */}
//                   <h2 className="text-2xl font-bold text-center mb-4">
//                     <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                       Заполнить форму
//                     </span>
//                   </h2>

//                   <p className="text-gray-300 text-center mb-6">
//                     Традиционный способ с полным контролем над данными
//                   </p>

//                   {/* Описание */}
//                   <div className="space-y-3 mb-8">
//                     {[
//                       "Полный контроль данных",
//                       "Без Google аккаунта",
//                       "Привычный процесс",
//                     ].map((benefit, index) => (
//                       <motion.div
//                         key={benefit}
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.3 + index * 0.1 }}
//                         className="flex items-center gap-3"
//                       >
//                         <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
//                           <FiCheck className="w-4 h-4 text-cyan-400" />
//                         </div>
//                         <span className="text-gray-300">{benefit}</span>
//                       </motion.div>
//                     ))}
//                   </div>

//                   {/* Кнопка */}
//                   <button
//                     onClick={handleManualForm}
//                     className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 text-cyan-300 font-bold text-lg hover:border-cyan-500/50 hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-3 group"
//                   >
//                     <FiEdit className="w-5 h-5" />
//                     Заполнить форму
//                     <motion.span
//                       className="group-hover:translate-x-1 transition-transform inline-block"
//                     >
//                       →
//                     </motion.span>
//                   </button>
//                 </div>
//               </motion.div>
//             </div>
//           )}

//           {/* Дополнительная информация */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="mt-8 text-center text-gray-400 text-sm"
//           >
//             <p>
//               Оба способа безопасны и надёжны.{" "}
//               <span className="text-[#D4AF37]">
//                 Выберите тот, который вам удобнее.
//               </span>
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }

//---------работал но хочу с хедером-------
// // src/app/booking/client/ClientPageWithGoogleOption.tsx
// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { FcGoogle } from "react-icons/fc";
// import { FiEdit, FiZap, FiCheck, FiShield } from "react-icons/fi";

// interface ClientPageWithGoogleOptionProps {
//   serviceId: string;
//   masterId: string;
//   startAt: string;
//   endAt: string;
//   selectedDate: string;
// }

// /**
//  * Компонент выбора способа регистрации:
//  * 1. Быстрая регистрация через Google (рекомендуется)
//  * 2. Ручное заполнение формы
//  */
// export default function ClientPageWithGoogleOption({
//   serviceId,
//   masterId,
//   startAt,
//   endAt,
//   selectedDate,
// }: ClientPageWithGoogleOptionProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const [showGoogleAuth, setShowGoogleAuth] = React.useState(false);
//   const [isPolling, setIsPolling] = React.useState(false);
//   const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

//   /**
//    * Обработчик выбора "Быстрая регистрация через Google"
//    */
//   const handleGoogleRegistration = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       // Показываем интерфейс Google авторизации
//       setShowGoogleAuth(true);

//       // Инициируем OAuth flow для быстрой регистрации
//       const res = await fetch("/api/booking/client/google-quick", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           // ✅ ПРАВИЛЬНАЯ структура API (как в старом коде)
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.ok || !data.authUrl) {
//         throw new Error(data.error || "Ошибка инициализации Google OAuth");
//       }

//       // Открываем popup с Google OAuth
//       const popup = openGooglePopup(data.authUrl);

//       if (popup) {
//         // Начинаем polling для отслеживания статуса
//         startPolling(data.requestId);
//       } else {
//         throw new Error(
//           "Не удалось открыть окно. Разрешите всплывающие окна в браузере."
//         );
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка авторизации";
//       setError(msg);
//       setShowGoogleAuth(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Открытие Google OAuth popup
//    */
//   const openGooglePopup = (authUrl: string): Window | null => {
//     const width = 500;
//     const height = 600;
//     const left = window.screenX + (window.outerWidth - width) / 2;
//     const top = window.screenY + (window.outerHeight - height) / 2;

//     return window.open(
//       authUrl,
//       "Google OAuth",
//       `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
//     );
//   };

//   /**
//    * Polling статуса Google OAuth
//    */
//   const startPolling = (requestId: string) => {
//     setIsPolling(true);

//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/client/google-quick/status?requestId=${requestId}`
//         );
//         const data = await res.json();

//         if (data.verified === true && data.appointmentId) {
//           // ✅ Успешная регистрация!
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }

//           // Переход на страницу оплаты
//           router.push(`/booking/payment?appointment=${data.appointmentId}`);
//         } else if (data.error) {
//           // ❌ Ошибка
//           throw new Error(data.error);
//         }
//       } catch (e) {
//         console.error("[Google Quick Reg] Polling error:", e);
//         setIsPolling(false);
//         if (pollingRef.current) {
//           clearInterval(pollingRef.current);
//           pollingRef.current = null;
//         }
//         setError(
//           e instanceof Error
//             ? e.message
//             : "Ошибка при проверке статуса авторизации"
//         );
//         setShowGoogleAuth(false);
//       }
//     }, 2000);
//   };

//   /**
//    * Cleanup polling при размонтировании
//    */
//   React.useEffect(() => {
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, []);

//   /**
//    * Обработчик выбора "Заполнить форму вручную"
//    */
//   const handleManualForm = () => {
//     // Переход на обычную форму заполнения
//     router.push(
//       `/booking/client/form?s=${serviceId}&m=${masterId}&start=${startAt}&end=${endAt}&d=${selectedDate}`
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#0F0F1E]">
//       {/* 💎 ФИРМЕННЫЙ ХЕДЕР */}
//       <header className="relative border-b border-[#D4AF37]/20 bg-black/40 backdrop-blur-xl">
//         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-[#D4AF37]/5 to-cyan-500/5" />
        
//         <div className="container mx-auto px-4 py-4 relative">
//           <Link href="/" className="inline-flex items-center gap-3 group">
//             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#FFD700] to-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 transition-transform group-hover:scale-105">
//               <span className="text-2xl">💎</span>
//             </div>
//             <div>
//               <span className="block text-2xl font-serif text-[#D4AF37] font-bold tracking-wide">
//                 Salon Elen
//               </span>
//               <span className="block text-xs text-cyan-400/70">
//                 Premium Beauty Experience
//               </span>
//             </div>
//           </Link>
//         </div>
//       </header>

//       {/* ОСНОВНОЙ КОНТЕНТ */}
//       <div className="flex items-center justify-center p-6 py-12">
//         <div className="max-w-4xl w-full">
//           {/* Заголовок */}
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-8"
//           >
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">
//               <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
//                 Как вы хотите продолжить?
//               </span>
//             </h1>
//             <p className="text-gray-400 text-lg">
//               Выберите удобный способ регистрации
//             </p>
//           </motion.div>

//           {/* Ошибка */}
//           {error && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl"
//             >
//               <p className="text-red-400 text-center">{error}</p>
//             </motion.div>
//           )}

//           {/* Google Auth в процессе */}
//           {showGoogleAuth && isPolling && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="mb-6 p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl text-center"
//             >
//               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
//                 <motion.div
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                 >
//                   <FcGoogle className="w-8 h-8" />
//                 </motion.div>
//               </div>
//               <p className="text-cyan-300 font-medium text-lg">
//                 Завершите вход в Google...
//               </p>
//               <p className="text-gray-400 text-sm mt-2">
//                 После авторизации вы автоматически перейдёте к оплате
//               </p>
//             </motion.div>
//           )}

//           {/* Варианты регистрации */}
//           {!showGoogleAuth && (
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Вариант 1: Быстрая регистрация через Google */}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 }}
//                 whileHover={{ scale: 1.02 }}
//                 className="relative group"
//               >
//                 {/* Рекомендация badge */}
//                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
//                   <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm font-bold shadow-lg">
//                     ⚡ Рекомендуем
//                   </div>
//                 </div>

//                 <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/5 border-2 border-[#D4AF37]/30 backdrop-blur-xl hover:border-[#D4AF37]/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20">
//                   {/* Иконка */}
//                   <div className="flex justify-center mb-6">
//                     <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
//                       <FcGoogle className="w-12 h-12" />
//                     </div>
//                   </div>

//                   {/* Заголовок */}
//                   <h2 className="text-2xl font-bold text-center mb-4">
//                     <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
//                       Быстрая регистрация
//                     </span>
//                   </h2>

//                   <p className="text-gray-300 text-center mb-6">
//                     Войдите через Google и сразу перейдите к оплате
//                   </p>

//                   {/* Преимущества */}
//                   <div className="space-y-3 mb-8">
//                     {[
//                       "Один клик до оплаты",
//                       "Автозаполнение данных",
//                       "Безопасно и надёжно",
//                       "Экономия времени",
//                     ].map((benefit, index) => (
//                       <motion.div
//                         key={benefit}
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.2 + index * 0.1 }}
//                         className="flex items-center gap-3"
//                       >
//                         <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
//                           <FiCheck className="w-4 h-4 text-[#D4AF37]" />
//                         </div>
//                         <span className="text-gray-300">{benefit}</span>
//                       </motion.div>
//                     ))}
//                   </div>

//                   {/* Кнопка */}
//                   <button
//                     onClick={handleGoogleRegistration}
//                     disabled={loading}
//                     className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold text-lg hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
//                   >
//                     {loading ? (
//                       <>
//                         <motion.div
//                           animate={{ rotate: 360 }}
//                           transition={{
//                             duration: 1,
//                             repeat: Infinity,
//                             ease: "linear",
//                           }}
//                         >
//                           <FiZap className="w-5 h-5" />
//                         </motion.div>
//                         Загрузка...
//                       </>
//                     ) : (
//                       <>
//                         <FcGoogle className="w-6 h-6" />
//                         Продолжить с Google
//                         <motion.span
//                           className="group-hover:translate-x-1 transition-transform inline-block"
//                         >
//                           →
//                         </motion.span>
//                       </>
//                     )}
//                   </button>

//                   {/* Безопасность */}
//                   <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
//                     <FiShield className="w-4 h-4" />
//                     <span>Защищено Google OAuth 2.0</span>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Вариант 2: Заполнить форму вручную */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//                 whileHover={{ scale: 1.02 }}
//                 className="relative group"
//               >
//                 <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-2 border-cyan-500/20 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10">
//                   {/* Иконка */}
//                   <div className="flex justify-center mb-6">
//                     <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
//                       <FiEdit className="w-10 h-10 text-cyan-400" />
//                     </div>
//                   </div>

//                   {/* Заголовок */}
//                   <h2 className="text-2xl font-bold text-center mb-4">
//                     <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                       Заполнить форму
//                     </span>
//                   </h2>

//                   <p className="text-gray-300 text-center mb-6">
//                     Традиционный способ с полным контролем над данными
//                   </p>

//                   {/* Описание */}
//                   <div className="space-y-3 mb-8">
//                     {[
//                       "Полный контроль данных",
//                       "Без Google аккаунта",
//                       "Привычный процесс",
//                     ].map((benefit, index) => (
//                       <motion.div
//                         key={benefit}
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.3 + index * 0.1 }}
//                         className="flex items-center gap-3"
//                       >
//                         <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
//                           <FiCheck className="w-4 h-4 text-cyan-400" />
//                         </div>
//                         <span className="text-gray-300">{benefit}</span>
//                       </motion.div>
//                     ))}
//                   </div>

//                   {/* Кнопка */}
//                   <button
//                     onClick={handleManualForm}
//                     className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 text-cyan-300 font-bold text-lg hover:border-cyan-500/50 hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-3 group"
//                   >
//                     <FiEdit className="w-5 h-5" />
//                     Заполнить форму
//                     <motion.span
//                       className="group-hover:translate-x-1 transition-transform inline-block"
//                     >
//                       →
//                     </motion.span>
//                   </button>
//                 </div>
//               </motion.div>
//             </div>
//           )}

//           {/* Дополнительная информация */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="mt-8 text-center text-gray-400 text-sm"
//           >
//             <p>
//               Оба способа безопасны и надёжны.{" "}
//               <span className="text-[#D4AF37]">
//                 Выберите тот, который вам удобнее.
//               </span>
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import React from "react";
// import { motion } from "framer-motion";
// import { useRouter, useSearchParams } from "next/navigation";
// import { FcGoogle } from "react-icons/fc";
// import { FiEdit, FiZap, FiCheck, FiShield } from "react-icons/fi";

// interface ClientPageWithGoogleOptionProps {
//   serviceId: string;
//   masterId: string;
//   startAt: string;
//   endAt: string;
//   selectedDate: string;
// }

// /**
//  * Компонент выбора способа регистрации:
//  * 1. Быстрая регистрация через Google (рекомендуется)
//  * 2. Ручное заполнение формы
//  */
// export default function ClientPageWithGoogleOption({
//   serviceId,
//   masterId,
//   startAt,
//   endAt,
//   selectedDate,
// }: ClientPageWithGoogleOptionProps) {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const [showGoogleAuth, setShowGoogleAuth] = React.useState(false);
//   const [isPolling, setIsPolling] = React.useState(false);
//   const pollingRef = React.useRef<NodeJS.Timeout | null>(null);

//   /**
//    * Обработчик выбора "Быстрая регистрация через Google"
//    */
//   const handleGoogleRegistration = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       // Показываем интерфейс Google авторизации
//       setShowGoogleAuth(true);

//       // Инициируем OAuth flow для быстрой регистрации
//       const res = await fetch("/api/booking/client/google-quick", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           serviceId,
//           masterId,
//           startAt,
//           endAt,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.ok || !data.authUrl) {
//         throw new Error(data.error || "Ошибка инициализации Google OAuth");
//       }

//       // Открываем popup с Google OAuth
//       const popup = openGooglePopup(data.authUrl);

//       if (popup) {
//         // Начинаем polling для отслеживания статуса
//         startPolling(data.requestId);
//       } else {
//         throw new Error(
//           "Не удалось открыть окно. Разрешите всплывающие окна в браузере."
//         );
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка авторизации";
//       setError(msg);
//       setShowGoogleAuth(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Открытие Google OAuth popup
//    */
//   const openGooglePopup = (authUrl: string): Window | null => {
//     const width = 500;
//     const height = 600;
//     const left = window.screenX + (window.outerWidth - width) / 2;
//     const top = window.screenY + (window.outerHeight - height) / 2;

//     return window.open(
//       authUrl,
//       "Google OAuth",
//       `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
//     );
//   };

//   /**
//    * Polling статуса Google OAuth
//    */
//   const startPolling = (requestId: string) => {
//     setIsPolling(true);

//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/client/google-quick/status?requestId=${requestId}`
//         );
//         const data = await res.json();

//         if (data.verified === true && data.appointmentId) {
//           // ✅ Успешная регистрация!
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }

//           // Переход на страницу оплаты
//           router.push(`/booking/payment?appointment=${data.appointmentId}`);
//         } else if (data.error) {
//           // ❌ Ошибка
//           throw new Error(data.error);
//         }
//       } catch (e) {
//         console.error("[Google Quick Reg] Polling error:", e);
//         setIsPolling(false);
//         if (pollingRef.current) {
//           clearInterval(pollingRef.current);
//           pollingRef.current = null;
//         }
//         setError(
//           e instanceof Error
//             ? e.message
//             : "Ошибка при проверке статуса авторизации"
//         );
//         setShowGoogleAuth(false);
//       }
//     }, 2000);
//   };

//   /**
//    * Cleanup polling при размонтировании
//    */
//   React.useEffect(() => {
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, []);

//   /**
//    * Обработчик выбора "Заполнить форму вручную"
//    */
//   const handleManualForm = () => {
//     // Переход на обычную форму заполнения
//     router.push(
//       `/booking/client/form?s=${serviceId}&m=${masterId}&start=${startAt}&end=${endAt}&d=${selectedDate}`
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A2E] to-[#0F0F1E] flex items-center justify-center p-6">
//       <div className="max-w-4xl w-full">
//         {/* Заголовок */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center mb-8"
//         >
//           <h1 className="text-4xl md:text-5xl font-bold mb-4">
//             <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
//               Как вы хотите продолжить?
//             </span>
//           </h1>
//           <p className="text-gray-400 text-lg">
//             Выберите удобный способ регистрации
//           </p>
//         </motion.div>

//         {/* Ошибка */}
//         {error && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl"
//           >
//             <p className="text-red-400 text-center">{error}</p>
//           </motion.div>
//         )}

//         {/* Google Auth в процессе */}
//         {showGoogleAuth && isPolling && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="mb-6 p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl text-center"
//           >
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//               >
//                 <FcGoogle className="w-8 h-8" />
//               </motion.div>
//             </div>
//             <p className="text-cyan-300 font-medium text-lg">
//               Завершите вход в Google...
//             </p>
//             <p className="text-gray-400 text-sm mt-2">
//               После авторизации вы автоматически перейдёте к оплате
//             </p>
//           </motion.div>
//         )}

//         {/* Варианты регистрации */}
//         {!showGoogleAuth && (
//           <div className="grid md:grid-cols-2 gap-6">
//             {/* Вариант 1: Быстрая регистрация через Google */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.1 }}
//               whileHover={{ scale: 1.02 }}
//               className="relative group"
//             >
//               {/* Рекомендация badge */}
//               <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
//                 <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm font-bold shadow-lg">
//                   ⚡ Рекомендуем
//                 </div>
//               </div>

//               <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/5 border-2 border-[#D4AF37]/30 backdrop-blur-xl hover:border-[#D4AF37]/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20">
//                 {/* Иконка */}
//                 <div className="flex justify-center mb-6">
//                   <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
//                     <FcGoogle className="w-12 h-12" />
//                   </div>
//                 </div>

//                 {/* Заголовок */}
//                 <h2 className="text-2xl font-bold text-center mb-4">
//                   <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
//                     Быстрая регистрация
//                   </span>
//                 </h2>

//                 <p className="text-gray-300 text-center mb-6">
//                   Войдите через Google и сразу перейдите к оплате
//                 </p>

//                 {/* Преимущества */}
//                 <div className="space-y-3 mb-8">
//                   {[
//                     "Один клик до оплаты",
//                     "Автозаполнение данных",
//                     "Безопасно и надёжно",
//                     "Экономия времени",
//                   ].map((benefit, index) => (
//                     <motion.div
//                       key={benefit}
//                       initial={{ opacity: 0, x: -10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.2 + index * 0.1 }}
//                       className="flex items-center gap-3"
//                     >
//                       <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
//                         <FiCheck className="w-4 h-4 text-[#D4AF37]" />
//                       </div>
//                       <span className="text-gray-300">{benefit}</span>
//                     </motion.div>
//                   ))}
//                 </div>

//                 {/* Кнопка */}
//                 <button
//                   onClick={handleGoogleRegistration}
//                   disabled={loading}
//                   className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold text-lg hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
//                 >
//                   {loading ? (
//                     <>
//                       <motion.div
//                         animate={{ rotate: 360 }}
//                         transition={{
//                           duration: 1,
//                           repeat: Infinity,
//                           ease: "linear",
//                         }}
//                       >
//                         <FiZap className="w-5 h-5" />
//                       </motion.div>
//                       Загрузка...
//                     </>
//                   ) : (
//                     <>
//                       <FcGoogle className="w-6 h-6" />
//                       Продолжить с Google
//                       <motion.span
//                         className="group-hover:translate-x-1 transition-transform inline-block"
//                       >
//                         →
//                       </motion.span>
//                     </>
//                   )}
//                 </button>

//                 {/* Безопасность */}
//                 <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
//                   <FiShield className="w-4 h-4" />
//                   <span>Защищено Google OAuth 2.0</span>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Вариант 2: Заполнить форму вручную */}
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.2 }}
//               whileHover={{ scale: 1.02 }}
//               className="relative group"
//             >
//               <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-2 border-cyan-500/20 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10">
//                 {/* Иконка */}
//                 <div className="flex justify-center mb-6">
//                   <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
//                     <FiEdit className="w-10 h-10 text-cyan-400" />
//                   </div>
//                 </div>

//                 {/* Заголовок */}
//                 <h2 className="text-2xl font-bold text-center mb-4">
//                   <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                     Заполнить форму
//                   </span>
//                 </h2>

//                 <p className="text-gray-300 text-center mb-6">
//                   Традиционный способ с полным контролем над данными
//                 </p>

//                 {/* Описание */}
//                 <div className="space-y-3 mb-8">
//                   {[
//                     "Полный контроль данных",
//                     "Без Google аккаунта",
//                     "Привычный процесс",
//                   ].map((benefit, index) => (
//                     <motion.div
//                       key={benefit}
//                       initial={{ opacity: 0, x: -10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.3 + index * 0.1 }}
//                       className="flex items-center gap-3"
//                     >
//                       <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
//                         <FiCheck className="w-4 h-4 text-cyan-400" />
//                       </div>
//                       <span className="text-gray-300">{benefit}</span>
//                     </motion.div>
//                   ))}
//                 </div>

//                 {/* Кнопка */}
//                 <button
//                   onClick={handleManualForm}
//                   className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 text-cyan-300 font-bold text-lg hover:border-cyan-500/50 hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-3 group"
//                 >
//                   <FiEdit className="w-5 h-5" />
//                   Заполнить форму
//                   <motion.span
//                     className="group-hover:translate-x-1 transition-transform inline-block"
//                   >
//                     →
//                   </motion.span>
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}

//         {/* Дополнительная информация */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className="mt-8 text-center text-gray-400 text-sm"
//         >
//           <p>
//             Оба способа безопасны и надёжны.{" "}
//             <span className="text-[#D4AF37]">
//               Выберите тот, который вам удобнее.
//             </span>
//           </p>
//         </motion.div>
//       </div>
//     </div>
//   );
// }