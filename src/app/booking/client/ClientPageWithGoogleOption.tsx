// src/app/booking/client/ClientPageWithGoogleOption.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FiEdit, FiCheck, FiShield, FiZap } from "react-icons/fi";
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
import PremiumProgressBar from "@/components/PremiumProgressBar";

interface ClientPageWithGoogleOptionProps {
  serviceId: string;
  masterId: string;
  startAt: string;
  endAt: string;
  selectedDate: string;
}

/** шаги как на других страницах бронирования */
const BOOKING_STEPS = [
  { id: "services", label: "Услуга", icon: "✨" },
  { id: "master", label: "Мастер", icon: "👤" },
  { id: "calendar", label: "Дата", icon: "📅" },
  { id: "client", label: "Данные", icon: "📝" },
  { id: "verify", label: "Проверка", icon: "✓" },
  { id: "payment", label: "Оплата", icon: "💳" },
];

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

    // 🔥 ОТКРЫВАЕМ POPUP ДО FETCH - ТАК БРАУЗЕР НЕ БЛОКИРУЕТ!
    const popup = openGooglePopup("about:blank");
    
    if (!popup) {
      setError("Не удалось открыть окно. Разрешите всплывающие окна в браузере.");
      setLoading(false);
      return;
    }

    try {
      setShowGoogleAuth(true);

      const res = await fetch("/api/booking/client/google-quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, masterId, startAt, endAt }),
      });

      const data: {
        ok?: boolean;
        error?: string;
        authUrl?: string;
        requestId?: string;
      } = await res.json();

      if (!res.ok || !data.ok || !data.authUrl || !data.requestId) {
        popup.close(); // Закрываем popup при ошибке
        throw new Error(data.error || "Ошибка инициализации Google OAuth");
      }

      // 🔥 ПЕРЕНАПРАВЛЯЕМ УЖЕ ОТКРЫТЫЙ POPUP НА GOOGLE
      popup.location.href = data.authUrl;
      startPolling(data.requestId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка авторизации";
      setError(msg);
      setShowGoogleAuth(false);
      if (popup && !popup.closed) {
        popup.close();
      }
    } finally {
      setLoading(false);
    }
  };

  const openGooglePopup = (url: string): Window | null => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    return window.open(
      url,
      "Google OAuth",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );
  };

  const startPolling = (requestId: string) => {
    setIsPolling(true);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/booking/client/google-quick/status?requestId=${encodeURIComponent(
            requestId,
          )}`,
        );
        const data: {
          verified?: boolean;
          appointmentId?: string;
          error?: string;
        } = await res.json();

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
        setError(
          e instanceof Error
            ? e.message
            : "Ошибка при проверке статуса авторизации",
        );
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
    router.push(
      `/booking/client/form?s=${encodeURIComponent(
        serviceId,
      )}&m=${encodeURIComponent(
        masterId,
      )}&start=${encodeURIComponent(startAt)}&end=${encodeURIComponent(
        endAt,
      )}&d=${encodeURIComponent(selectedDate)}`,
    );
  };

  const isDisabled = loading || isPolling;

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <BookingAnimatedBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* 🔝 Бронировочный хедер + логотип + степпер */}
        <header className="booking-header fixed inset-x-0 top-0 z-40 border-b border-[#D4AF37]/25 bg-black/70 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-[#D4AF37]/15 to-cyan-500/10" />
          <div className="relative mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
            <div className="mb-3 flex items-center gap-4">
              <Link href="/" className="group inline-flex items-center gap-3">
                {/* Новый логотип */}
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg shadow-black/70 ring-1 ring-black">
                  <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
                    <span className="text-xl leading-none">💎</span>
                  </div>
                </div>
                <div>
                  <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15] drop-shadow-[0_0_12px_rgba(250,204,21,0.45)]">
                    Salon Elen
                  </span>
                  <span className="block text-xs text-cyan-400/85">
                    Premium Beauty Experience
                  </span>
                </div>
              </Link>
            </div>

            <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
          </div>
        </header>

        {/* отступ под фиксированный хедер */}
        <div className="h-[120px]" />

        {/* Основной контент */}
        <main className="flex flex-1 items-center justify-center px-4 pb-10 pt-6 sm:pb-12">
          <div className="w-full max-w-4xl">
            {/* Заголовок — КАК НА СТРАНИЦЕ УСЛУГ */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center"
            >
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="
                  text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
                  font-serif italic leading-tight
                  text-transparent bg-clip-text
                  bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
                  drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
                  lg:bg-gradient-to-r lg:from-[#7CFFFB] lg:via-[#22D3EE] lg:to-[#7CFFFB]
                  lg:drop-shadow-[0_0_22px_rgba(34,211,238,0.6)]
                  xl:bg-gradient-to-r xl:from-[#F5C518]/90 xl:via-[#FFD166]/90 xl:to-[#F5C518]/90
                  xl:drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
                  mb-3 md:mb-4
                "
              >
                Как вы хотите продолжить?
              </motion.h1>
              {/* 🔥 КУРСИВНЫЙ ИТАЛИК ПОДЗАГОЛОВОК */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-cyan-400/95 font-semibold italic tracking-wide drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]"
              >
                Выберите удобный способ регистрации
              </motion.p>
            </motion.div>

            {/* Ошибка */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300 backdrop-blur-xl"
              >
                {error}
              </motion.div>
            )}

            {/* Статус Google авторизации */}
            {showGoogleAuth && isPolling && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-center text-sm text-cyan-100 backdrop-blur-xl"
              >
                Ожидаем подтверждение через Google... Это может занять несколько
                секунд.
              </motion.div>
            )}

            {/* 🔥 Две карточки с ИДЕАЛЬНО ВЫРОВНЕННЫМИ КНОПКАМИ */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Google вариант */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                  <div className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] px-4 py-1 text-sm font-bold text-black shadow-lg">
                    ⚡ Рекомендуем
                  </div>
                </div>

                {/* 🔥 GRID LAYOUT */}
                <div className="grid h-full grid-rows-[auto_auto_auto_1fr_auto] gap-4 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-xl shadow-[#D4AF37]/10 transition-shadow group-hover:shadow-2xl group-hover:shadow-[#D4AF37]/20">
                  {/* 1. Анимированный Google-бейдж */}
                  <div className="flex justify-center">
                    <motion.div
                      animate={{
                        rotate: [-4, 3, -4],
                        boxShadow: [
                          "0 0 22px rgba(212,175,55,0.7)",
                          "0 0 30px rgba(212,175,55,1)",
                          "0 0 22px rgba(212,175,55,0.7)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut",
                      }}
                      whileHover={{ scale: 1.08 }}
                      className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#D4AF37]/60 bg-gradient-to-br from-[#D4AF37]/25 via-zinc-900 to-black"
                    >
                      <FcGoogle className="h-12 w-12" />
                    </motion.div>
                  </div>

                  {/* 2. Заголовок */}
                  <h2 className="text-center text-2xl font-bold">
                    <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
                      Быстрая регистрация
                    </span>
                  </h2>

                  {/* 3. Описание */}
                  <p className="text-center text-gray-300">
                    Войдите через Google и сразу перейдите к оплате
                  </p>

                  {/* 4. 🔥 СПИСОК С ФИКСИРОВАННОЙ ВЫСОТОЙ - КЛЮЧ К ВЫРАВНИВАНИЮ! */}
                  <div className="space-y-3 min-h-[160px] flex flex-col justify-start">
                    {[
                      "Один клик до оплаты",
                      "Автозаполнение данных",
                      "Безопасно и надёжно",
                      "Экономия времени",
                    ].map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center gap-3 text-sm text-gray-300"
                      >
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20">
                          <FiCheck className="h-4 w-4 text-[#D4AF37]" />
                        </div>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* 5. Кнопка - всегда внизу */}
                  <div className="space-y-3">
                    {/* 🔥 УЛУЧШЕННАЯ КНОПКА С ПРИЗЫВОМ К ДЕЙСТВИЮ */}
                    <motion.button
                      type="button"
                      onClick={handleGoogleRegistration}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { y: -2, scale: 1.02 } : undefined}
                      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                      animate={
                        !isDisabled
                          ? {
                              boxShadow: [
                                "0 0 26px rgba(212,175,55,0.7)",
                                "0 0 38px rgba(212,175,55,1)",
                                "0 0 26px rgba(212,175,55,0.7)",
                              ],
                            }
                          : undefined
                      }
                      transition={
                        !isDisabled
                          ? {
                              duration: 2.2,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut",
                            }
                          : undefined
                      }
                      className="group/btn relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-[#D4AF37]/60 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] px-6 py-4 text-base font-bold text-black shadow-2xl shadow-[#D4AF37]/50 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {/* Анимированный блик */}
                      {!isDisabled && (
                        <motion.div
                          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ translateX: ["0%", "200%"] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                      
                      {loading ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/40 border-t-transparent" />
                          Подключение...
                        </>
                      ) : (
                        <>
                          <FiZap className="h-5 w-5 transition-transform group-hover/btn:rotate-12" />
                          <span className="relative">Начать за 1 клик</span>
                          <motion.span
                            animate={{ x: [0, 4, 0] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              repeatType: "loop",
                            }}
                            className="inline-block text-lg"
                          >
                            →
                          </motion.span>
                        </>
                      )}
                    </motion.button>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                      <FiShield className="h-4 w-4" />
                      <span>Защищено Google OAuth 2.0</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Ручная форма */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="group relative"
              >
                {/* 🔥 GRID LAYOUT */}
                <div className="grid h-full grid-rows-[auto_auto_auto_1fr_auto] gap-4 rounded-2xl bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 p-8 shadow-xl shadow-cyan-500/10 transition-shadow group-hover:shadow-2xl group-hover:shadow-cyan-500/20">
                  {/* 1. Бирюзовый квадратик */}
                  <div className="flex justify-center">
                    <motion.div
                      animate={{
                        y: [0, -3, 0],
                        boxShadow: [
                          "0 0 20px rgba(34,211,238,0.8)",
                          "0 0 30px rgba(34,211,238,1)",
                          "0 0 20px rgba(34,211,238,0.8)",
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut",
                      }}
                      whileHover={{ scale: 1.08, rotate: -2 }}
                      className="flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/70 bg-gradient-to-br from-cyan-500/20 via-zinc-900 to-black"
                    >
                      <FiEdit className="h-10 w-10 text-cyan-400" />
                    </motion.div>
                  </div>

                  {/* 2. Заголовок */}
                  <h2 className="text-center text-2xl font-bold">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Заполнить форму
                    </span>
                  </h2>

                  {/* 3. Описание */}
                  <p className="text-center text-gray-300">
                    Традиционный способ с полным контролем над данными
                  </p>

                  {/* 4. 🔥 СПИСОК С 4 ЭЛЕМЕНТАМИ ДЛЯ ВЫРАВНИВАНИЯ! */}
                  <div className="space-y-3 min-h-[160px] flex flex-col justify-start">
                    {[
                      "Полный контроль данных",
                      "Без Google аккаунта",
                      "Привычный процесс",
                      "Верификация через Telegram",
                    ].map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center gap-3 text-sm text-gray-300"
                      >
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
                          <FiCheck className="h-4 w-4 text-cyan-400" />
                        </div>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* 5. Кнопка - всегда внизу */}
                  <div className="space-y-3">
                    <motion.button
                      type="button"
                      onClick={handleManualForm}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { y: -2, scale: 1.02 } : undefined}
                      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                      className="inline-flex w-full items-center justify-center gap-3 rounded-xl border-2 border-cyan-500/50 bg-gradient-to-r from-cyan-500/20 via-slate-900 to-cyan-500/10 px-6 py-4 text-base font-semibold text-cyan-100 shadow-lg shadow-cyan-500/20 transition-all hover:border-cyan-500/70 hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiEdit className="h-5 w-5" />
                      Заполнить форму
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                        className="inline-block text-lg"
                      >
                        →
                      </motion.span>
                    </motion.button>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                      <FiShield className="h-4 w-4" />
                      <span>Подтверждение через Telegram Bot</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Подпись внизу */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center text-sm text-gray-400"
            >
              <p>
                Оба способа безопасны и надёжны.{" "}
                <span className="text-[#D4AF37]">
                  Выберите тот, который вам удобнее.
                </span>
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

//---------работает выравниваю кнопки и красивее заголовок------
// // src/app/booking/client/ClientPageWithGoogleOption.tsx
// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { FcGoogle } from "react-icons/fc";
// import { FiEdit, FiCheck, FiShield } from "react-icons/fi";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";

// interface ClientPageWithGoogleOptionProps {
//   serviceId: string;
//   masterId: string;
//   startAt: string;
//   endAt: string;
//   selectedDate: string;
// }

// /** шаги как на других страницах бронирования */
// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

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

//   const handleGoogleRegistration = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       setShowGoogleAuth(true);

//       const res = await fetch("/api/booking/client/google-quick", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ serviceId, masterId, startAt, endAt }),
//       });

//       const data: {
//         ok?: boolean;
//         error?: string;
//         authUrl?: string;
//         requestId?: string;
//       } = await res.json();

//       if (!res.ok || !data.ok || !data.authUrl || !data.requestId) {
//         throw new Error(data.error || "Ошибка инициализации Google OAuth");
//       }

//       const popup = openGooglePopup(data.authUrl);

//       if (popup) {
//         startPolling(data.requestId);
//       } else {
//         throw new Error(
//           "Не удалось открыть окно. Разрешите всплывающие окна в браузере.",
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

//   const openGooglePopup = (authUrl: string): Window | null => {
//     const width = 500;
//     const height = 600;
//     const left = window.screenX + (window.outerWidth - width) / 2;
//     const top = window.screenY + (window.outerHeight - height) / 2;

//     return window.open(
//       authUrl,
//       "Google OAuth",
//       `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
//     );
//   };

//   const startPolling = (requestId: string) => {
//     setIsPolling(true);

//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/client/google-quick/status?requestId=${encodeURIComponent(
//             requestId,
//           )}`,
//         );
//         const data: {
//           verified?: boolean;
//           appointmentId?: string;
//           error?: string;
//         } = await res.json();

//         if (data.verified === true && data.appointmentId) {
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }
//           router.push(`/booking/payment?appointment=${data.appointmentId}`);
//         } else if (data.error) {
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
//             : "Ошибка при проверке статуса авторизации",
//         );
//         setShowGoogleAuth(false);
//       }
//     }, 2000);
//   };

//   React.useEffect(() => {
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, []);

//   const handleManualForm = () => {
//     router.push(
//       `/booking/client/form?s=${encodeURIComponent(
//         serviceId,
//       )}&m=${encodeURIComponent(
//         masterId,
//       )}&start=${encodeURIComponent(startAt)}&end=${encodeURIComponent(
//         endAt,
//       )}&d=${encodeURIComponent(selectedDate)}`,
//     );
//   };

//   const isDisabled = loading || isPolling;

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <BookingAnimatedBackground />

//       <div className="relative z-10 flex min-h-screen flex-col">
//         {/* 🔝 Бронировочный хедер + логотип + степпер */}
//         <header className="booking-header fixed inset-x-0 top-0 z-40 border-b border-[#D4AF37]/25 bg-black/70 backdrop-blur-xl">
//           <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-[#D4AF37]/15 to-cyan-500/10" />
//           <div className="relative mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//             <div className="mb-3 flex items-center gap-4">
//               <Link href="/" className="group inline-flex items-center gap-3">
//                 {/* Новый логотип */}
//                 <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg shadow-black/70 ring-1 ring-black">
//                   <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
//                   <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
//                     <span className="text-xl leading-none">💎</span>
//                   </div>
//                 </div>
//                 <div>
//                   <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15] drop-shadow-[0_0_12px_rgba(250,204,21,0.45)]">
//                     Salon Elen
//                   </span>
//                   <span className="block text-xs text-cyan-400/85">
//                     Premium Beauty Experience
//                   </span>
//                 </div>
//               </Link>
//             </div>

//             <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//           </div>
//         </header>

//         {/* отступ под фиксированный хедер */}
//         <div className="h-[120px]" />

//         {/* Основной контент */}
//         <main className="flex flex-1 items-center justify-center px-4 pb-10 pt-6 sm:pb-12">
//           <div className="w-full max-w-4xl">
//             {/* Заголовок */}
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mb-10 text-center"
//             >
//               <h1 className="bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37] bg-clip-text text-4xl font-serif text-transparent sm:text-5xl md:text-6xl">
//                 Как вы хотите продолжить?
//               </h1>
//               <p className="mt-3 text-base font-light tracking-wide text-cyan-400/90 sm:text-lg">
//                 Выберите удобный способ регистрации
//               </p>
//             </motion.div>

//             {/* Ошибка */}
//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300 backdrop-blur-xl"
//               >
//                 {error}
//               </motion.div>
//             )}

//             {/* Статус Google авторизации */}
//             {showGoogleAuth && isPolling && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-center text-sm text-cyan-100 backdrop-blur-xl"
//               >
//                 Ожидаем подтверждение через Google... Это может занять несколько
//                 секунд.
//               </motion.div>
//             )}

//             {/* Две карточки выбора */}
//             <div className="grid gap-6 md:grid-cols-2">
//               {/* Google вариант */}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 }}
//                 whileHover={{ scale: 1.02 }}
//                 className="group relative"
//               >
//                 <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
//                   <div className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] px-4 py-1 text-sm font-bold text-black shadow-lg">
//                     ⚡ Рекомендуем
//                   </div>
//                 </div>

//                 <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-xl shadow-[#D4AF37]/10 transition-shadow group-hover:shadow-2xl group-hover:shadow-[#D4AF37]/20">
//                   {/* Анимированный Google-бейдж */}
//                   <div className="mb-6 flex justify-center">
//                     <motion.div
//                       animate={{
//                         rotate: [-4, 3, -4],
//                         boxShadow: [
//                           "0 0 22px rgba(212,175,55,0.7)",
//                           "0 0 30px rgba(212,175,55,1)",
//                           "0 0 22px rgba(212,175,55,0.7)",
//                         ],
//                       }}
//                       transition={{
//                         duration: 3,
//                         repeat: Infinity,
//                         repeatType: "loop",
//                         ease: "easeInOut",
//                       }}
//                       whileHover={{ scale: 1.08 }}
//                       className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#D4AF37]/60 bg-gradient-to-br from-[#D4AF37]/25 via-zinc-900 to-black"
//                     >
//                       <FcGoogle className="h-12 w-12" />
//                     </motion.div>
//                   </div>

//                   <h2 className="mb-4 text-center text-2xl font-bold">
//                     <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
//                       Быстрая регистрация
//                     </span>
//                   </h2>

//                   <p className="mb-6 text-center text-gray-300">
//                     Войдите через Google и сразу перейдите к оплате
//                   </p>

//                   <div className="mb-8 space-y-3">
//                     {[
//                       "Один клик до оплаты",
//                       "Автозаполнение данных",
//                       "Безопасно и надёжно",
//                       "Экономия времени",
//                     ].map((benefit) => (
//                       <div
//                         key={benefit}
//                         className="flex items-center gap-3 text-sm text-gray-300"
//                       >
//                         <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20">
//                           <FiCheck className="h-4 w-4 text-[#D4AF37]" />
//                         </div>
//                         <span>{benefit}</span>
//                       </div>
//                     ))}
//                   </div>

//                   {/* CTA-кнопка Google */}
//                   <motion.button
//                     type="button"
//                     onClick={handleGoogleRegistration}
//                     disabled={isDisabled}
//                     whileHover={!isDisabled ? { y: -1 } : undefined}
//                     whileTap={!isDisabled ? { scale: 0.97 } : undefined}
//                     animate={
//                       !isDisabled
//                         ? {
//                             boxShadow: [
//                               "0 0 26px rgba(212,175,55,0.7)",
//                               "0 0 38px rgba(212,175,55,1)",
//                               "0 0 26px rgba(212,175,55,0.7)",
//                             ],
//                           }
//                         : undefined
//                     }
//                     transition={
//                       !isDisabled
//                         ? {
//                             duration: 2.2,
//                             repeat: Infinity,
//                             repeatType: "loop",
//                             ease: "easeInOut",
//                           }
//                         : undefined
//                     }
//                     className="inline-flex items-center justify-center gap-3 rounded-xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#D4AF37]/90 via-amber-300 to-[#D4AF37]/90 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-[#D4AF37]/40 disabled:cursor-not-allowed disabled:opacity-60"
//                   >
//                     {loading ? (
//                       <>
//                         <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-transparent" />
//                         Инициализация...
//                       </>
//                     ) : (
//                       <>
//                         <FcGoogle className="h-5 w-5" />
//                         Продолжить с Google
//                         <motion.span
//                           animate={{ x: [0, 4, 0] }}
//                           transition={{
//                             duration: 1.1,
//                             repeat: Infinity,
//                             repeatType: "loop",
//                           }}
//                           className="inline-block"
//                         >
//                           →
//                         </motion.span>
//                       </>
//                     )}
//                   </motion.button>

//                   <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
//                     <FiShield className="h-4 w-4" />
//                     <span>Защищено Google OAuth 2.0</span>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Ручная форма */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//                 whileHover={{ scale: 1.02 }}
//                 className="group relative"
//               >
//                 <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 p-8 shadow-xl shadow-cyan-500/10 transition-shadow group-hover:shadow-2xl group-hover:shadow-cyan-500/20">
//                   {/* Бирюзовый квадратик с постоянным свечением */}
//                   <div className="mb-6 flex justify-center">
//                     <motion.div
//                       animate={{
//                         y: [0, -3, 0],
//                         boxShadow: [
//                           "0 0 20px rgba(34,211,238,0.8)",
//                           "0 0 30px rgba(34,211,238,1)",
//                           "0 0 20px rgba(34,211,238,0.8)",
//                         ],
//                       }}
//                       transition={{
//                         duration: 3,
//                         repeat: Infinity,
//                         repeatType: "loop",
//                         ease: "easeInOut",
//                       }}
//                       whileHover={{ scale: 1.08, rotate: -2 }}
//                       className="flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/70 bg-gradient-to-br from-cyan-500/20 via-zinc-900 to-black"
//                     >
//                       <FiEdit className="h-10 w-10 text-cyan-400" />
//                     </motion.div>
//                   </div>

//                   <h2 className="mb-4 text-center text-2xl font-bold">
//                     <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                       Заполнить форму
//                     </span>
//                   </h2>

//                   <p className="mb-6 text-center text-gray-300">
//                     Традиционный способ с полным контролем над данными
//                   </p>

//                   <div className="mb-8 space-y-3">
//                     {[
//                       "Полный контроль данных",
//                       "Без Google аккаунта",
//                       "Привычный процесс",
//                     ].map((benefit) => (
//                       <div
//                         key={benefit}
//                         className="flex items-center gap-3 text-sm text-gray-300"
//                       >
//                         <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
//                           <FiCheck className="h-4 w-4 text-cyan-400" />
//                         </div>
//                         <span>{benefit}</span>
//                       </div>
//                     ))}
//                   </div>

//                   <motion.button
//                     type="button"
//                     onClick={handleManualForm}
//                     disabled={isDisabled}
//                     whileHover={!isDisabled ? { y: -1 } : undefined}
//                     whileTap={!isDisabled ? { scale: 0.97 } : undefined}
//                     className="inline-flex items-center justify-center gap-3 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 via-slate-900 to-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-100 shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
//                   >
//                     <FiEdit className="h-5 w-5" />
//                     Заполнить форму
//                     <motion.span
//                       animate={{ x: [0, 4, 0] }}
//                       transition={{
//                         duration: 1.1,
//                         repeat: Infinity,
//                         repeatType: "loop",
//                       }}
//                       className="inline-block"
//                     >
//                       →
//                     </motion.span>
//                   </motion.button>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Подпись внизу */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="mt-8 text-center text-sm text-gray-400"
//             >
//               <p>
//                 Оба способа безопасны и надёжны.{" "}
//                 <span className="text-[#D4AF37]">
//                   Выберите тот, который вам удобнее.
//                 </span>
//               </p>
//             </motion.div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }




//---------уже есть анимация но пытаюсь улучшить------- 
// // src/app/booking/client/ClientPageWithGoogleOption.tsx
// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { FcGoogle } from "react-icons/fc";
// import { FiEdit, FiCheck, FiShield } from "react-icons/fi";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";

// /* ==== шаги как на других страницах бронирования ==== */
// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// interface ClientPageWithGoogleOptionProps {
//   serviceId: string;
//   masterId: string;
//   startAt: string;
//   endAt: string;
//   selectedDate: string;
// }

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

//   const startPolling = (requestId: string) => {
//     setIsPolling(true);

//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/client/google-quick/status?requestId=${encodeURIComponent(
//             requestId
//           )}`
//         );
//         const data: {
//           verified?: boolean;
//           appointmentId?: string;
//           error?: string;
//         } = await res.json();

//         if (data.verified === true && data.appointmentId) {
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }
//           router.push(`/booking/payment?appointment=${data.appointmentId}`);
//         } else if (data.error) {
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

//   React.useEffect(() => {
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, []);

//   const handleGoogleRegistration = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       setShowGoogleAuth(true);

//       const res = await fetch("/api/booking/client/google-quick", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ serviceId, masterId, startAt, endAt }),
//       });

//       const data: {
//         ok?: boolean;
//         error?: string;
//         authUrl?: string;
//         requestId?: string;
//       } = await res.json();

//       if (!res.ok || !data.ok || !data.authUrl || !data.requestId) {
//         throw new Error(data.error || "Ошибка инициализации Google OAuth");
//       }

//       const popup = openGooglePopup(data.authUrl);

//       if (popup) {
//         startPolling(data.requestId);
//       } else {
//         // более мягкое сообщение, но оставляем подсказку
//         throw new Error(
//           "Не удалось открыть окно авторизации. Разрешите всплывающие окна в браузере и попробуйте ещё раз."
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

//   const handleManualForm = () => {
//     router.push(
//       `/booking/client/form?s=${encodeURIComponent(
//         serviceId
//       )}&m=${encodeURIComponent(
//         masterId
//       )}&start=${encodeURIComponent(startAt)}&end=${encodeURIComponent(
//         endAt
//       )}&d=${encodeURIComponent(selectedDate)}`
//     );
//   };

//   const isDisabled = loading || isPolling;

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <BookingAnimatedBackground />

//       <div className="relative z-10 flex min-h-screen flex-col">
//         {/* ===== Фиксированный хедер: логотип + прогресс-бар ===== */}
//         <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
//           <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//             {/* верхняя полоса с логотипом */}
//             <div className="mb-3 flex items-center justify-between gap-4">
//               <Link href="/" className="group inline-flex items-center gap-3">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] via-zinc-900 to-black shadow-lg shadow-[#D4AF37]/35 transition-transform group-hover:scale-105">
//                   {/* "новый" логотип — можно потом заменить на <Image /> */}
//                   <span className="text-[26px] leading-none">💎</span>
//                 </div>
//                 <div className="leading-tight">
//                   <span className="block font-serif text-xl font-bold tracking-wide text-[#F5C518]">
//                     Salon Elen
//                   </span>
//                   <span className="block text-xs text-cyan-400/80">
//                     Premium Beauty Experience
//                   </span>
//                 </div>
//               </Link>

//               <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-white/50 md:inline">
//                 Онлайн-запись
//               </span>
//             </div>

//             {/* прогресс-бар шагов, как на других экранах */}
//             <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//           </div>
//         </header>

//         {/* отступ под фиксированный хедер */}
//         <div className="h-[118px] shrink-0 md:h-[130px]" />

//         {/* ================== Основной контент ================== */}
//         <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-6 sm:pt-4 sm:pb-16">
//           <div className="w-full max-w-4xl">
//             {/* Заголовок */}
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mb-10 text-center"
//             >
//               <h1 className="bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37] bg-clip-text text-4xl font-serif text-transparent sm:text-5xl md:text-6xl">
//                 Как вы хотите продолжить?
//               </h1>
//               <p className="mt-3 text-base font-light tracking-wide text-cyan-400/90 sm:text-lg">
//                 Выберите удобный способ регистрации
//               </p>
//             </motion.div>

//             {/* Ошибка */}
//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200 backdrop-blur-xl"
//               >
//                 {error}
//               </motion.div>
//             )}

//             {/* Статус Google авторизации */}
//             {showGoogleAuth && isPolling && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="mb-6 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-center text-sm text-cyan-50 backdrop-blur-xl"
//               >
//                 Ожидаем подтверждение через Google… Это может занять несколько
//                 секунд.
//               </motion.div>
//             )}

//             {/* Две карточки выбора */}
//             <div className="grid gap-6 md:grid-cols-2">
//               {/* Google вариант */}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 }}
//                 whileHover={{ scale: 1.02 }}
//                 className="group relative"
//               >
//                 {/* бейдж «Рекомендуем» */}
//                 <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
//                   <div className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] px-4 py-1 text-sm font-bold text-black shadow-lg">
//                     ⚡ Рекомендуем
//                   </div>
//                 </div>

//                 <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-xl shadow-[#D4AF37]/10 transition-shadow group-hover:shadow-2xl group-hover:shadow-[#D4AF37]/25">
//                   <div className="mb-6 flex justify-center">
//                     {/* анимированная капсула с Google-иконкой */}
//                     <motion.div
//                       className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/25 via-zinc-900 to-black shadow-lg"
//                       initial={{ scale: 0.9, rotate: 0 }}
//                       animate={{
//                         scale: [1, 1.06, 1],
//                         rotate: [0, -2, 2, 0],
//                       }}
//                       transition={{
//                         duration: 4,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                       }}
//                       whileHover={{ scale: 1.12 }}
//                     >
//                       <FcGoogle className="h-12 w-12" />
//                     </motion.div>
//                   </div>

//                   <h2 className="mb-4 text-center text-2xl font-bold">
//                     <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
//                       Быстрая регистрация
//                     </span>
//                   </h2>

//                   <p className="mb-6 text-center text-gray-200">
//                     Войдите через Google и сразу перейдите к оплате
//                   </p>

//                   <div className="mb-8 space-y-3">
//                     {[
//                       "Один клик до оплаты",
//                       "Автозаполнение данных",
//                       "Безопасно и надёжно",
//                       "Экономия времени",
//                     ].map((benefit) => (
//                       <div
//                         key={benefit}
//                         className="flex items-center gap-3 text-sm text-gray-200"
//                       >
//                         <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20">
//                           <FiCheck className="h-4 w-4 text-[#D4AF37]" />
//                         </div>
//                         <span>{benefit}</span>
//                       </div>
//                     ))}
//                   </div>

//                   <button
//                     type="button"
//                     onClick={handleGoogleRegistration}
//                     disabled={isDisabled}
//                     className="inline-flex items-center justify-center gap-3 rounded-xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#D4AF37]/90 via-amber-300 to-[#D4AF37]/90 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-[#D4AF37]/40 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//                   >
//                     {loading ? (
//                       <>
//                         <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-transparent" />
//                         Инициализация…
//                       </>
//                     ) : (
//                       <>
//                         <FcGoogle className="h-5 w-5" />
//                         Продолжить с Google
//                         <motion.span
//                           className="inline-block translate-x-0"
//                           whileHover={{ x: 3 }}
//                         >
//                           →
//                         </motion.span>
//                       </>
//                     )}
//                   </button>

//                   <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
//                     <FiShield className="h-4 w-4" />
//                     <span>Защищено Google OAuth 2.0</span>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Ручная форма */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//                 whileHover={{ scale: 1.02 }}
//                 className="group relative"
//               >
//                 <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 p-8 shadow-xl shadow-cyan-500/10 transition-shadow group-hover:shadow-2xl group-hover:shadow-cyan-500/25">
//                   <div className="mb-6 flex justify-center">
//                     <motion.div
//                       className="flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/15 via-zinc-900 to-black shadow-lg"
//                       whileHover={{ scale: 1.08 }}
//                     >
//                       <FiEdit className="h-10 w-10 text-cyan-400" />
//                     </motion.div>
//                   </div>

//                   <h2 className="mb-4 text-center text-2xl font-bold">
//                     <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                       Заполнить форму
//                     </span>
//                   </h2>

//                   <p className="mb-6 text-center text-gray-200">
//                     Традиционный способ с полным контролем над данными
//                   </p>

//                   <div className="mb-8 space-y-3">
//                     {[
//                       "Полный контроль данных",
//                       "Без Google аккаунта",
//                       "Привычный процесс",
//                     ].map((benefit) => (
//                       <div
//                         key={benefit}
//                         className="flex items-center gap-3 text-sm text-gray-200"
//                       >
//                         <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
//                           <FiCheck className="h-4 w-4 text-cyan-400" />
//                         </div>
//                         <span>{benefit}</span>
//                       </div>
//                     ))}
//                   </div>

//                   <button
//                     type="button"
//                     onClick={handleManualForm}
//                     disabled={isDisabled}
//                     className="inline-flex items-center justify-center gap-3 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 via-slate-900 to-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-100 shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//                   >
//                     <FiEdit className="h-5 w-5" />
//                     Заполнить форму
//                     <motion.span
//                       className="inline-block translate-x-0"
//                       whileHover={{ x: 3 }}
//                     >
//                       →
//                     </motion.span>
//                   </button>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Подпись внизу */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="mt-8 text-center text-sm text-gray-400"
//             >
//               <p>
//                 Оба способа безопасны и надёжны.{" "}
//                 <span className="text-[#D4AF37]">
//                   Выберите тот, который вам удобнее.
//                 </span>
//               </p>
//             </motion.div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }



// //-------всё работает, пробую добавить анимацию--------
// // src/app/booking/client/ClientPageWithGoogleOption.tsx
// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { FcGoogle } from "react-icons/fc";
// import { FiEdit, FiZap, FiCheck, FiShield } from "react-icons/fi";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";

// interface ClientPageWithGoogleOptionProps {
//   serviceId: string;
//   masterId: string;
//   startAt: string;
//   endAt: string;
//   selectedDate: string;
// }

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

//   const handleGoogleRegistration = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       // Показываем UI Google-авторизации
//       setShowGoogleAuth(true);

//       const res = await fetch("/api/booking/client/google-quick", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ serviceId, masterId, startAt, endAt }),
//       });

//       const data: {
//         ok?: boolean;
//         error?: string;
//         authUrl?: string;
//         requestId?: string;
//       } = await res.json();

//       if (!res.ok || !data.ok || !data.authUrl || !data.requestId) {
//         throw new Error(data.error || "Ошибка инициализации Google OAuth");
//       }

//       const popup = openGooglePopup(data.authUrl);

//       if (popup) {
//         // начинаем polling статуса
//         startPolling(data.requestId);
//       } else {
//         throw new Error("Не удалось открыть окно. Разрешите всплывающие окна в браузере.");
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка авторизации";
//       setError(msg);
//       setShowGoogleAuth(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openGooglePopup = (authUrl: string): Window | null => {
//     const width = 500;
//     const height = 600;
//     const left = window.screenX + (window.outerWidth - width) / 2;
//     const top = window.screenY + (window.outerHeight - height) / 2;

//     return window.open(
//       authUrl,
//       "Google OAuth",
//       `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
//     );
//   };

//   const startPolling = (requestId: string) => {
//     setIsPolling(true);

//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/client/google-quick/status?requestId=${encodeURIComponent(requestId)}`,
//         );
//         const data: {
//           verified?: boolean;
//           appointmentId?: string;
//           error?: string;
//         } = await res.json();

//         if (data.verified === true && data.appointmentId) {
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }
//           router.push(`/booking/payment?appointment=${data.appointmentId}`);
//         } else if (data.error) {
//           throw new Error(data.error);
//         }
//       } catch (e) {
//         console.error("[Google Quick Reg] Polling error:", e);
//         setIsPolling(false);
//         if (pollingRef.current) {
//           clearInterval(pollingRef.current);
//           pollingRef.current = null;
//         }
//         setError(e instanceof Error ? e.message : "Ошибка при проверке статуса авторизации");
//         setShowGoogleAuth(false);
//       }
//     }, 2000);
//   };

//   React.useEffect(() => {
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, []);

//   const handleManualForm = () => {
//     router.push(
//       `/booking/client/form?s=${encodeURIComponent(serviceId)}&m=${encodeURIComponent(
//         masterId,
//       )}&start=${encodeURIComponent(startAt)}&end=${encodeURIComponent(
//         endAt,
//       )}&d=${encodeURIComponent(selectedDate)}`,
//     );
//   };

//   const isDisabled = loading || isPolling;

//   return (
//     <div className="relative min-h-screen bg-black overflow-hidden">
//       <BookingAnimatedBackground />

//       <div className="relative z-10 flex min-h-screen flex-col">
//         {/* 💎 Фирменный хедер */}
//         <header className="booking-header relative border-b border-[#D4AF37]/20 bg-black/40 backdrop-blur-xl">
//           <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-[#D4AF37]/5 to-cyan-500/5" />

//           <div className="container relative mx-auto px-4 py-4">
//             <Link href="/" className="group inline-flex items-center gap-3">
//               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] via-zinc-900 to-black shadow-lg shadow-[#D4AF37]/20 transition-transform group-hover:scale-105">
//                 <span className="text-2xl">💎</span>
//               </div>
//               <div>
//                 <span className="block font-serif text-2xl font-bold tracking-wide text-[#D4AF37]">
//                   Salon Elen
//                 </span>
//                 <span className="block text-xs text-cyan-400/70">Premium Beauty Experience</span>
//               </div>
//             </Link>
//           </div>
//         </header>

//         {/* Основной контент */}
//         <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-12">
//           <div className="w-full max-w-4xl">
//             {/* Заголовок */}
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mb-10 text-center"
//             >
//               <h1 className="bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37] bg-clip-text text-4xl font-serif italic font-bold leading-tight text-transparent sm:text-5xl md:text-6xl">
//                 Как вы хотите продолжить?
//               </h1>
//               <p className="mt-3 text-base font-light tracking-wide text-cyan-400/90 sm:text-lg">
//                 Выберите удобный способ регистрации
//               </p>
//             </motion.div>

//             {/* Ошибка */}
//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300 backdrop-blur-xl"
//               >
//                 {error}
//               </motion.div>
//             )}

//             {/* Статус Google авторизации */}
//             {showGoogleAuth && isPolling && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-center text-sm text-cyan-100 backdrop-blur-xl"
//               >
//                 Ожидаем подтверждение через Google... Это может занять несколько секунд.
//               </motion.div>
//             )}

//             {/* Две карточки выбора */}
//             <div className="grid gap-6 md:grid-cols-2">
//               {/* Google вариант */}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 }}
//                 whileHover={{ scale: 1.02 }}
//                 className="group relative"
//               >
//                 <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
//                   <div className="rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] px-4 py-1 text-sm font-bold text-black shadow-lg">
//                     ⚡ Рекомендуем
//                   </div>
//                 </div>

//                 <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 shadow-xl shadow-[#D4AF37]/10 transition-shadow group-hover:shadow-2xl group-hover:shadow-[#D4AF37]/20">
//                   <div className="mb-6 flex justify-center">
//                     <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 via-zinc-900 to-black shadow-lg transition-transform group-hover:scale-110">
//                       <FcGoogle className="h-12 w-12" />
//                     </div>
//                   </div>

//                   <h2 className="mb-4 text-center text-2xl font-bold">
//                     <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">
//                       Быстрая регистрация
//                     </span>
//                   </h2>

//                   <p className="mb-6 text-center text-gray-300">
//                     Войдите через Google и сразу перейдите к оплате
//                   </p>

//                   <div className="mb-8 space-y-3">
//                     {["Один клик до оплаты", "Автозаполнение данных", "Безопасно и надёжно", "Экономия времени"].map(
//                       (benefit) => (
//                         <div key={benefit} className="flex items-center gap-3 text-sm text-gray-300">
//                           <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20">
//                             <FiCheck className="h-4 w-4 text-[#D4AF37]" />
//                           </div>
//                           <span>{benefit}</span>
//                         </div>
//                       ),
//                     )}
//                   </div>

//                   <button
//                     type="button"
//                     onClick={handleGoogleRegistration}
//                     disabled={isDisabled}
//                     className="inline-flex items-center justify-center gap-3 rounded-xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#D4AF37]/90 via-amber-300 to-[#D4AF37]/90 px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-[#D4AF37]/40 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//                   >
//                     {loading ? (
//                       <>
//                         <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-transparent" />
//                         Инициализация...
//                       </>
//                     ) : (
//                       <>
//                         <FcGoogle className="h-5 w-5" />
//                         Продолжить с Google
//                         <motion.span className="inline-block translate-x-0 transition-transform group-hover:translate-x-1">
//                           →
//                         </motion.span>
//                       </>
//                     )}
//                   </button>

//                   <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
//                     <FiShield className="h-4 w-4" />
//                     <span>Защищено Google OAuth 2.0</span>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Ручная форма */}
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//                 whileHover={{ scale: 1.02 }}
//                 className="group relative"
//               >
//                 <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-zinc-950 via-slate-900 to-zinc-950 p-8 shadow-xl shadow-cyan-500/10 transition-shadow group-hover:shadow-2xl group-hover:shadow-cyan-500/20">
//                   <div className="mb-6 flex justify-center">
//                     <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/15 via-zinc-900 to-black shadow-lg transition-transform group-hover:scale-110">
//                       <FiEdit className="h-10 w-10 text-cyan-400" />
//                     </div>
//                   </div>

//                   <h2 className="mb-4 text-center text-2xl font-bold">
//                     <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                       Заполнить форму
//                     </span>
//                   </h2>

//                   <p className="mb-6 text-center text-gray-300">
//                     Традиционный способ с полным контролем над данными
//                   </p>

//                   <div className="mb-8 space-y-3">
//                     {["Полный контроль данных", "Без Google аккаунта", "Привычный процесс"].map((benefit) => (
//                       <div key={benefit} className="flex items-center gap-3 text-sm text-gray-300">
//                         <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-cyan-500/20">
//                           <FiCheck className="h-4 w-4 text-cyan-400" />
//                         </div>
//                         <span>{benefit}</span>
//                       </div>
//                     ))}
//                   </div>

//                   <button
//                     type="button"
//                     onClick={handleManualForm}
//                     disabled={isDisabled}
//                     className="inline-flex items-center justify-center gap-3 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 via-slate-900 to-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-100 shadow-lg shadow-cyan-500/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//                   >
//                     <FiEdit className="h-5 w-5" />
//                     Заполнить форму
//                     <motion.span className="inline-block translate-x-0 transition-transform group-hover:translate-x-1">
//                       →
//                     </motion.span>
//                   </button>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Подпись внизу */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="mt-8 text-center text-sm text-gray-400"
//             >
//               <p>
//                 Оба способа безопасны и надёжны.{" "}
//                 <span className="text-[#D4AF37]">Выберите тот, который вам удобнее.</span>
//               </p>
//             </motion.div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }



//--------работает с хедером пробую новый задний фон-------
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

//   const handleGoogleRegistration = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       setShowGoogleAuth(true);

//       const res = await fetch("/api/booking/client/google-quick", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ serviceId, masterId, startAt, endAt }),
//       });

//       const data = await res.json();

//       if (!res.ok || !data.ok || !data.authUrl) {
//         throw new Error(data.error || "Ошибка инициализации Google OAuth");
//       }

//       const popup = openGooglePopup(data.authUrl);

//       if (popup) {
//         startPolling(data.requestId);
//       } else {
//         throw new Error("Не удалось открыть окно. Разрешите всплывающие окна в браузере.");
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка авторизации";
//       setError(msg);
//       setShowGoogleAuth(false);
//     } finally {
//       setLoading(false);
//     }
//   };

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

//   const startPolling = (requestId: string) => {
//     setIsPolling(true);

//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await fetch(`/api/booking/client/google-quick/status?requestId=${requestId}`);
//         const data = await res.json();

//         if (data.verified === true && data.appointmentId) {
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }
//           router.push(`/booking/payment?appointment=${data.appointmentId}`);
//         } else if (data.error) {
//           throw new Error(data.error);
//         }
//       } catch (e) {
//         console.error("[Google Quick Reg] Polling error:", e);
//         setIsPolling(false);
//         if (pollingRef.current) {
//           clearInterval(pollingRef.current);
//           pollingRef.current = null;
//         }
//         setError(e instanceof Error ? e.message : "Ошибка при проверке статуса авторизации");
//         setShowGoogleAuth(false);
//       }
//     }, 2000);
//   };

//   React.useEffect(() => {
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, []);

//   const handleManualForm = () => {
//     router.push(`/booking/client/form?s=${serviceId}&m=${masterId}&start=${startAt}&end=${endAt}&d=${selectedDate}`);
//   };

//   return (
//     <div className="min-h-screen bg-black">
//       {/* 💎 ФИРМЕННЫЙ ХЕДЕР */}
//       <header className="booking-header relative border-b border-[#D4AF37]/20 bg-black/40 backdrop-blur-xl">
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

//       {/* КОНТЕНТ */}
//       <div className="flex items-center justify-center p-6 py-16">
//         <div className="max-w-4xl w-full">
//           {/* ЗАГОЛОВОК КАК НА СТРАНИЦЕ УСЛУГ */}
//           <motion.div 
//             initial={{ opacity: 0, y: -20 }} 
//             animate={{ opacity: 1, y: 0 }} 
//             className="text-center mb-12"
//           >
//             <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic font-bold mb-4 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] bg-clip-text text-transparent leading-tight">
//               Как вы хотите продолжить?
//             </h1>
//             <p className="text-cyan-400/90 text-base sm:text-lg font-light tracking-wide">
//               Выберите удобный способ регистрации
//             </p>
//           </motion.div>

//           {error && (
//             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl">
//               <p className="text-red-400 text-center">{error}</p>
//             </motion.div>
//           )}

//           {showGoogleAuth && isPolling && (
//             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-xl text-center">
//               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 mb-4">
//                 <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
//                   <FcGoogle className="w-8 h-8" />
//                 </motion.div>
//               </div>
//               <p className="text-cyan-300 font-medium text-lg">Завершите вход в Google...</p>
//               <p className="text-gray-400 text-sm mt-2">После авторизации вы автоматически перейдёте к оплате</p>
//             </motion.div>
//           )}

//           {!showGoogleAuth && (
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Google регистрация */}
//               <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.02 }} className="relative group">
//                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
//                   <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black text-sm font-bold shadow-lg">
//                     ⚡ Рекомендуем
//                   </div>
//                 </div>

//                 <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-[#FFD700]/5 border-2 border-[#D4AF37]/30 backdrop-blur-xl hover:border-[#D4AF37]/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/20">
//                   <div className="flex justify-center mb-6">
//                     <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#FFD700] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
//                       <FcGoogle className="w-12 h-12" />
//                     </div>
//                   </div>

//                   <h2 className="text-2xl font-bold text-center mb-4">
//                     <span className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">Быстрая регистрация</span>
//                   </h2>

//                   <p className="text-gray-300 text-center mb-6">Войдите через Google и сразу перейдите к оплате</p>

//                   <div className="space-y-3 mb-8">
//                     {["Один клик до оплаты", "Автозаполнение данных", "Безопасно и надёжно", "Экономия времени"].map((benefit, index) => (
//                       <motion.div key={benefit} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }} className="flex items-center gap-3">
//                         <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
//                           <FiCheck className="w-4 h-4 text-[#D4AF37]" />
//                         </div>
//                         <span className="text-gray-300">{benefit}</span>
//                       </motion.div>
//                     ))}
//                   </div>

//                   <button onClick={handleGoogleRegistration} disabled={loading} className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-bold text-lg hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group">
//                     {loading ? (
//                       <>
//                         <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
//                           <FiZap className="w-5 h-5" />
//                         </motion.div>
//                         Загрузка...
//                       </>
//                     ) : (
//                       <>
//                         <FcGoogle className="w-6 h-6" />
//                         Продолжить с Google
//                         <motion.span className="group-hover:translate-x-1 transition-transform inline-block">→</motion.span>
//                       </>
//                     )}
//                   </button>

//                   <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
//                     <FiShield className="w-4 h-4" />
//                     <span>Защищено Google OAuth 2.0</span>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Ручная форма */}
//               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02 }} className="relative group">
//                 <div className="h-full p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border-2 border-cyan-500/20 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10">
//                   <div className="flex justify-center mb-6">
//                     <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
//                       <FiEdit className="w-10 h-10 text-cyan-400" />
//                     </div>
//                   </div>

//                   <h2 className="text-2xl font-bold text-center mb-4">
//                     <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Заполнить форму</span>
//                   </h2>

//                   <p className="text-gray-300 text-center mb-6">Традиционный способ с полным контролем над данными</p>

//                   <div className="space-y-3 mb-8">
//                     {["Полный контроль данных", "Без Google аккаунта", "Привычный процесс"].map((benefit, index) => (
//                       <motion.div key={benefit} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }} className="flex items-center gap-3">
//                         <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
//                           <FiCheck className="w-4 h-4 text-cyan-400" />
//                         </div>
//                         <span className="text-gray-300">{benefit}</span>
//                       </motion.div>
//                     ))}
//                   </div>

//                   <button onClick={handleManualForm} className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 text-cyan-300 font-bold text-lg hover:border-cyan-500/50 hover:bg-cyan-500/30 transition-all flex items-center justify-center gap-3 group">
//                     <FiEdit className="w-5 h-5" />
//                     Заполнить форму
//                     <motion.span className="group-hover:translate-x-1 transition-transform inline-block">→</motion.span>
//                   </button>
//                 </div>
//               </motion.div>
//             </div>
//           )}

//           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 text-center text-gray-400 text-sm">
//             <p>
//               Оба способа безопасны и надёжны. <span className="text-[#D4AF37]">Выберите тот, который вам удобнее.</span>
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }

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