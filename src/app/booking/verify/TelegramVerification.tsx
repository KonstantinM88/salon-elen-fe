// src/app/booking/verify/VerifyPageClient.tsx - ОБНОВЛЁННАЯ ВЕРСИЯ с Telegram

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  Shield,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type VerificationMethod = "email" | "telegram";

type VerifyResponse =
  | {
      ok: true;
      message: string;
      appointmentId: string;
    }
  | {
      ok: false;
      error: string;
    };

type SendCodeResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
  devCode?: string;
  deepLink?: string; // Для Telegram
};

// Компонент для Telegram метода
function TelegramVerification({
  email,
  draftId,
  loading,
  setLoading,
  error,
  setError,
  success,
  setSuccess,
  code,
  setCode,
  onVerifySuccess,
}: {
  email: string;
  draftId: string;
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (v: string | null) => void;
  success: string | null;
  setSuccess: (v: string | null) => void;
  code: string;
  setCode: (v: string) => void;
  onVerifySuccess: (appointmentId: string) => void;
}) {
  const [deepLink, setDeepLink] = React.useState<string | null>(null);
  const [codeSent, setCodeSent] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
  const verifyingRef = React.useRef(false);

  // Генерируем deep link при монтировании
  React.useEffect(() => {
    handleGenerateDeepLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling для проверки автоподтверждения
  React.useEffect(() => {
    if (!isPolling) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/booking/verify/telegram/status?email=${encodeURIComponent(
            email
          )}&draftId=${encodeURIComponent(draftId)}`
        );

        const data = await res.json();

        if (data.ok && data.confirmed) {
          // Автоподтверждение успешно!
          setIsPolling(false);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }

          setSuccess("✅ Подтверждено через Telegram! Переход к оплате...");
          
          // Нужно получить appointmentId через callback
          // Так как автоподтверждение уже создало Appointment, 
          // мы можем перейти сразу к оплате
          // TODO: получить appointmentId из статуса или редиректнуть на payment
          setTimeout(() => {
            // Редирект на payment (если есть appointmentId)
            window.location.href = "/booking/payment";
          }, 1500);
        }

        if (data.expired) {
          setIsPolling(false);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
          setError("Код истёк. Пожалуйста, запросите новый.");
        }
      } catch (err) {
        console.error("[Polling] Ошибка:", err);
      }
    };

    // Проверяем каждые 3 секунды
    pollingRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isPolling, email, draftId, setSuccess, setError]);

  const handleGenerateDeepLink = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/booking/verify/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, draftId }),
      });

      const data = (await res.json()) as SendCodeResponse;

      if (!res.ok || !data.ok || !data.deepLink) {
        throw new Error(data.error || "Не удалось создать ссылку");
      }

      setDeepLink(data.deepLink);
      setCodeSent(true);

      // 🚀 АВТОМАТИЧЕСКИ открываем Telegram
      const newWindow = window.open(data.deepLink, '_blank');
      
      // Проверяем, удалось ли открыть окно (popup blocker мог заблокировать)
      if (newWindow && !newWindow.closed) {
        setIsPolling(true); // Начинаем polling для автоподтверждения
        setSuccess("✈️ Telegram открывается... Ожидание подтверждения.");
      } else {
        // Popup заблокирован - покажем кнопку для ручного открытия
        setSuccess("⚠️ Нажмите кнопку ниже, чтобы открыть Telegram.");
      }

      if (data.devCode) {
        console.log(`[DEV] Код для тестирования: ${data.devCode}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка создания ссылки";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTelegram = () => {
    if (deepLink) {
      window.open(deepLink, "_blank");
      // Начинаем polling для автоподтверждения
      setIsPolling(true);
      setSuccess("Ожидание подтверждения из Telegram...");
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError("Введите 6-значный код");
      return;
    }

    if (verifyingRef.current) {
      return;
    }

    verifyingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/booking/verify/telegram/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, draftId }),
      });

      const data = (await res.json()) as VerifyResponse;

      if (!res.ok) {
        throw new Error("Ошибка сети при проверке кода");
      }

      if (!data.ok) {
        throw new Error(data.error || "Неверный код");
      }

      setSuccess("Верификация успешна! Переход к оплате...");
      setTimeout(() => {
        onVerifySuccess(data.appointmentId);
      }, 1000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка проверки кода";
      setError(msg);
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  };

  return (
    <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15">
          <span className="text-xl">✈️</span>
        </div>
        <div className="space-y-1.5 text-sm">
          <p className="font-medium text-white/90">
            Подтвердите через Telegram
          </p>
          <p className="text-xs text-white/60 md:text-sm">
            Нажмите кнопку ниже - Telegram откроется автоматически. 
            Вы получите код для ввода или сможете подтвердить сразу кнопкой в боте.
          </p>
        </div>
      </div>

      {/* Кнопка открытия Telegram */}
      {!codeSent ? (
        <button
          type="button"
          onClick={handleGenerateDeepLink}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Создание ссылки..." : "Открыть Telegram"}
        </button>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleOpenTelegram}
            disabled={!deepLink}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            🚀 {isPolling ? "Открыть Telegram повторно" : "Открыть Telegram"}
          </button>

          {isPolling && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-300">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
              Ожидание подтверждения...
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/40 px-2 text-white/50">или</span>
            </div>
          </div>

          {/* Ввод кода вручную */}
          <div className="space-y-2">
            <label className="mb-1 block text-xs font-medium text-white/80 md:text-sm">
              Введите 6-значный код из Telegram
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-center text-2xl font-mono tracking-[0.6em] text-white/90"
            />
            <p className="mt-1 text-xs text-white/50">
              Код действителен 10 минут.
            </p>
          </div>

          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={loading || !code || code.length !== 6}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_15px_40px_rgba(245,197,24,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Проверка..." : "Подтвердить код"}
          </button>
        </div>
      )}

      {/* Сообщения об ошибках/успехе */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-200"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ПРИМЕЧАНИЕ: Это только часть компонента для Telegram
// В реальном файле нужно будет:
// 1. Добавить этот компонент в существующий VerifyPageClient.tsx
// 2. Активировать кнопку Telegram (убрать disabled)
// 3. Добавить условие для рендеринга TelegramVerification когда selectedMethod === "telegram"

export { TelegramVerification };


// // src/app/booking/verify/VerifyPageClient.tsx - ОБНОВЛЁННАЯ ВЕРСИЯ с Telegram

// "use client";

// import * as React from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   ArrowLeft,
//   Mail,
//   ShieldCheck,
//   Shield,
//   Clock3,
//   CheckCircle2,
//   AlertCircle,
// } from "lucide-react";

// type VerificationMethod = "email" | "telegram";

// type VerifyResponse =
//   | {
//       ok: true;
//       message: string;
//       appointmentId: string;
//     }
//   | {
//       ok: false;
//       error: string;
//     };

// type SendCodeResponse = {
//   ok?: boolean;
//   message?: string;
//   error?: string;
//   devCode?: string;
//   deepLink?: string; // Для Telegram
// };

// // Компонент для Telegram метода
// function TelegramVerification({
//   email,
//   draftId,
//   loading,
//   setLoading,
//   error,
//   setError,
//   success,
//   setSuccess,
//   code,
//   setCode,
//   onVerifySuccess,
// }: {
//   email: string;
//   draftId: string;
//   loading: boolean;
//   setLoading: (v: boolean) => void;
//   error: string | null;
//   setError: (v: string | null) => void;
//   success: string | null;
//   setSuccess: (v: string | null) => void;
//   code: string;
//   setCode: (v: string) => void;
//   onVerifySuccess: (appointmentId: string) => void;
// }) {
//   const [deepLink, setDeepLink] = React.useState<string | null>(null);
//   const [codeSent, setCodeSent] = React.useState(false);
//   const [isPolling, setIsPolling] = React.useState(false);
//   const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
//   const verifyingRef = React.useRef(false);

//   // Генерируем deep link при монтировании
//   React.useEffect(() => {
//     handleGenerateDeepLink();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Polling для проверки автоподтверждения
//   React.useEffect(() => {
//     if (!isPolling) return;

//     const checkStatus = async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/verify/telegram/status?email=${encodeURIComponent(
//             email
//           )}&draftId=${encodeURIComponent(draftId)}`
//         );

//         const data = await res.json();

//         if (data.ok && data.confirmed) {
//           // Автоподтверждение успешно!
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//           }

//           setSuccess("✅ Подтверждено через Telegram! Переход к оплате...");
          
//           // Нужно получить appointmentId через callback
//           // Так как автоподтверждение уже создало Appointment, 
//           // мы можем перейти сразу к оплате
//           // TODO: получить appointmentId из статуса или редиректнуть на payment
//           setTimeout(() => {
//             // Редирект на payment (если есть appointmentId)
//             window.location.href = "/booking/payment";
//           }, 1500);
//         }

//         if (data.expired) {
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//           }
//           setError("Код истёк. Пожалуйста, запросите новый.");
//         }
//       } catch (err) {
//         console.error("[Polling] Ошибка:", err);
//       }
//     };

//     // Проверяем каждые 3 секунды
//     pollingRef.current = setInterval(checkStatus, 3000);

//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//       }
//     };
//   }, [isPolling, email, draftId, setSuccess, setError]);

//   const handleGenerateDeepLink = async () => {
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch("/api/booking/verify/telegram", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, draftId }),
//       });

//       const data = (await res.json()) as SendCodeResponse;

//       if (!res.ok || !data.ok || !data.deepLink) {
//         throw new Error(data.error || "Не удалось создать ссылку");
//       }

//       setDeepLink(data.deepLink);
//       setCodeSent(true);
//       setSuccess("Deep link создан! Откройте Telegram.");

//       if (data.devCode) {
//         console.log(`[DEV] Код для тестирования: ${data.devCode}`);
//         setSuccess(
//           `Deep link создан! Dev код: ${data.devCode}`
//         );
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка создания ссылки";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenTelegram = () => {
//     if (deepLink) {
//       window.open(deepLink, "_blank");
//       // Начинаем polling для автоподтверждения
//       setIsPolling(true);
//       setSuccess("Ожидание подтверждения из Telegram...");
//     }
//   };

//   const handleVerifyCode = async () => {
//     if (!code || code.length !== 6) {
//       setError("Введите 6-значный код");
//       return;
//     }

//     if (verifyingRef.current) {
//       return;
//     }

//     verifyingRef.current = true;
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch("/api/booking/verify/telegram/confirm", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, code, draftId }),
//       });

//       const data = (await res.json()) as VerifyResponse;

//       if (!res.ok) {
//         throw new Error("Ошибка сети при проверке кода");
//       }

//       if (!data.ok) {
//         throw new Error(data.error || "Неверный код");
//       }

//       setSuccess("Верификация успешна! Переход к оплате...");
//       setTimeout(() => {
//         onVerifySuccess(data.appointmentId);
//       }, 1000);
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка проверки кода";
//       setError(msg);
//     } finally {
//       setLoading(false);
//       verifyingRef.current = false;
//     }
//   };

//   return (
//     <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5">
//       <div className="flex items-start gap-3">
//         <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15">
//           <span className="text-xl">✈️</span>
//         </div>
//         <div className="space-y-1.5 text-sm">
//           <p className="font-medium text-white/90">
//             Подтвердите через Telegram
//           </p>
//           <p className="text-xs text-white/60 md:text-sm">
//             Откройте Telegram и получите 6-значный код или подтвердите сразу
//             нажав кнопку в боте.
//           </p>
//         </div>
//       </div>

//       {/* Кнопка открытия Telegram */}
//       {!codeSent ? (
//         <button
//           type="button"
//           onClick={handleGenerateDeepLink}
//           disabled={loading}
//           className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           {loading ? "Создание ссылки..." : "Открыть Telegram"}
//         </button>
//       ) : (
//         <div className="space-y-4">
//           <button
//             type="button"
//             onClick={handleOpenTelegram}
//             disabled={!deepLink}
//             className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             🚀 Открыть Telegram
//           </button>

//           {isPolling && (
//             <div className="flex items-center justify-center gap-2 text-sm text-blue-300">
//               <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
//               Ожидание подтверждения...
//             </div>
//           )}

//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <div className="w-full border-t border-white/10"></div>
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-black/40 px-2 text-white/50">или</span>
//             </div>
//           </div>

//           {/* Ввод кода вручную */}
//           <div className="space-y-2">
//             <label className="mb-1 block text-xs font-medium text-white/80 md:text-sm">
//               Введите 6-значный код из Telegram
//             </label>
//             <input
//               type="text"
//               inputMode="numeric"
//               maxLength={6}
//               value={code}
//               onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
//               placeholder="000000"
//               className="w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-center text-2xl font-mono tracking-[0.6em] text-white/90"
//             />
//             <p className="mt-1 text-xs text-white/50">
//               Код действителен 10 минут.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={handleVerifyCode}
//             disabled={loading || !code || code.length !== 6}
//             className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_15px_40px_rgba(245,197,24,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading ? "Проверка..." : "Подтвердить код"}
//           </button>
//         </div>
//       )}

//       {/* Сообщения об ошибках/успехе */}
//       <AnimatePresence mode="wait">
//         {error && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200"
//           >
//             <AlertCircle className="h-4 w-4 shrink-0" />
//             <span>{error}</span>
//           </motion.div>
//         )}
//         {success && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             className="flex items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-200"
//           >
//             <CheckCircle2 className="h-4 w-4 shrink-0" />
//             <span>{success}</span>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ПРИМЕЧАНИЕ: Это только часть компонента для Telegram
// // В реальном файле нужно будет:
// // 1. Добавить этот компонент в существующий VerifyPageClient.tsx
// // 2. Активировать кнопку Telegram (убрать disabled)
// // 3. Добавить условие для рендеринга TelegramVerification когда selectedMethod === "telegram"

// export { TelegramVerification };
