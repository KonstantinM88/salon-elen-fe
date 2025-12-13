// src/app/booking/verify/TelegramVerification.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "@/i18n/useTranslations";

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
  method?: 'registered' | 'deep_link';
  deepLink?: string;
  devCode?: string;
};

type TelegramStatusResponse =
  | {
      ok: true;
      method: "telegram";
      confirmed: true;
      appointmentId?: string;
      message: string;
    }
  | {
      ok: true;
      method: "telegram";
      confirmed: false;
      pending: true;
      message: string;
    }
  | {
      ok: false;
      method: "telegram";
      expired: true;
      message: string;
    }
  | {
      ok: false;
      method: "telegram";
      error: string;
    };

interface TelegramVerificationProps {
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
}

export function TelegramVerification({
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
}: TelegramVerificationProps) {
  const t = useTranslations();
  
  const [deepLink, setDeepLink] = React.useState<string | null>(null);
  const [codeSent, setCodeSent] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);
  const [isRegistered, setIsRegistered] = React.useState(false);
  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
  const verifyingRef = React.useRef(false);
  
  // ✅ Защита от двойного рендеринга
  const linkGeneratedRef = React.useRef(false);
  const isMountedRef = React.useRef(false);

  // ✅ Генерируем код ОДИН РАЗ при монтировании
  React.useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      
      if (!linkGeneratedRef.current) {
        linkGeneratedRef.current = true;
        handleGenerateCode();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Polling для проверки автоподтверждения
  React.useEffect(() => {
    if (!isPolling) return;

    const stopPolling = () => {
      setIsPolling(false);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/booking/verify/telegram/status?email=${encodeURIComponent(
            email
          )}&draftId=${encodeURIComponent(draftId)}`
        );

        const data = (await res.json()) as TelegramStatusResponse;

        if (!res.ok) {
          throw new Error("Ошибка проверки статуса");
        }

        if (data.ok && data.confirmed) {
          stopPolling();

          setError(null);
          setSuccess(
            data.message || t("booking_verify_telegram_success")
          );

          const appointmentId = data.appointmentId;
          if (appointmentId) {
            setTimeout(() => {
              onVerifySuccess(appointmentId);
            }, 1000);
          } else {
            // Без appointmentId не уходим на оплату, чтобы не попасть на пустую страницу
            setSuccess(null);
            setError(
              "Не удалось получить идентификатор записи. Попробуйте подтвердить ещё раз или выберите email."
            );
          }
          return;
        }

        if (!data.ok) {
          stopPolling();

          const isExpired = "expired" in data && data.expired === true;
          const message = isExpired
            ? (("message" in data && data.message) ||
                "Код истёк. Запросите новый.")
            : (("error" in data && data.error) ||
                "Ошибка проверки статуса");

          setError(message);
          return;
        }
      } catch (err) {
        console.error("[Polling] Ошибка:", err);
      }
    };

    // Сразу проверяем первый раз
    checkStatus();

    // Проверяем каждые 2 секунды
    pollingRef.current = setInterval(checkStatus, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isPolling, email, draftId, setSuccess, onVerifySuccess, t]);

  const handleGenerateCode = async () => {
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

      // ✅ ИСПРАВЛЕНО: Проверяем только ok, deepLink теперь опциональный
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Не удалось создать код");
      }

      setCodeSent(true);

      // ✅ ИСПРАВЛЕНО: Обрабатываем оба случая
      if (data.method === 'registered') {
        // Пользователь зарегистрирован - код отправлен через бота
        setIsRegistered(true);
        setSuccess(t("booking_verify_telegram_code_sent"));
        
        // Сразу начинаем polling
        setIsPolling(true);
      } else if (data.method === 'deep_link' && data.deepLink) {
        // Пользователь НЕ зарегистрирован - нужен deep link
        setDeepLink(data.deepLink);
        
        // Пробуем открыть Telegram автоматически
        const newWindow = window.open(data.deepLink, '_blank');
        
        if (newWindow && !newWindow.closed) {
          setSuccess(t("booking_verify_telegram_opening"));
          setIsPolling(true);
        } else {
          setSuccess(t("booking_verify_telegram_click_button"));
        }
      } else {
        // Неизвестный метод или отсутствует deepLink
        throw new Error("Некорректный ответ от сервера");
      }

      if (data.devCode) {
        console.log(`[DEV] Код для тестирования: ${data.devCode}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка создания кода";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTelegram = () => {
    if (deepLink) {
      window.open(deepLink, "_blank");
      
      if (!isPolling) {
        setIsPolling(true);
        setSuccess(t("booking_verify_telegram_waiting"));
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError(t("booking_verify_error_enter_code"));
      return;
    }

    if (verifyingRef.current) return;

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

      // ✅ ИСПРАВЛЕНО: Раздельная проверка HTTP и бизнес-логики
      if (!res.ok) {
        throw new Error("Ошибка сервера");
      }

      // ✅ TypeScript теперь понимает, что если !data.ok, то есть data.error
      if (!data.ok) {
        throw new Error(data.error);
      }

      setSuccess(t("booking_verify_success_redirect"));
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
            {t("booking_verify_telegram_title")}
          </p>
          <p className="text-xs text-white/60 md:text-sm">
            {isRegistered
              ? t("booking_verify_telegram_desc_registered")
              : t("booking_verify_telegram_desc_unregistered")}
          </p>
        </div>
      </div>

      {/* Индикатор загрузки при создании кода */}
      {!codeSent ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-sm text-white/60">{t("booking_verify_telegram_sending_code")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Кнопка открытия Telegram (только для не зарегистрированных) */}
          {!isRegistered && deepLink && (
            <button
              type="button"
              onClick={handleOpenTelegram}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:brightness-110"
            >
              🚀 {isPolling ? t("booking_verify_telegram_reopen_button") : t("booking_verify_telegram_open_button")}
            </button>
          )}

          {/* Индикатор polling */}
          {isPolling && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-sm text-blue-300">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
              <span>
                {isRegistered
                  ? t("booking_verify_telegram_waiting_bot")
                  : t("booking_verify_telegram_waiting")}
              </span>
            </div>
          )}

          {/* Разделитель */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/40 px-2 text-white/50">{t("booking_verify_telegram_divider")}</span>
            </div>
          </div>

          {/* Ввод кода вручную */}
          <div className="space-y-2">
            <label className="mb-1 block text-xs font-medium text-white/80 md:text-sm">
              {t("booking_verify_telegram_enter_code")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder={t("booking_verify_telegram_code_placeholder")}
              className="w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-center text-2xl font-mono tracking-[0.6em] text-white/90"
            />
            <p className="mt-1 text-xs text-white/50">
              {t("booking_verify_telegram_code_valid")}
            </p>
          </div>

          {/* Кнопка подтверждения кода */}
          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={loading || !code || code.length !== 6}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_15px_40px_rgba(245,197,24,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("booking_verify_telegram_checking") : t("booking_verify_telegram_confirm_button")}
          </button>
        </div>
      )}

      {/* Сообщения об ошибках/успехе */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="telegram-error"
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
            key="telegram-success"
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




//-----------добавляю перевод---------
// // src/app/booking/verify/TelegramVerification.tsx
// "use client";

// import * as React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { AlertCircle, CheckCircle2 } from "lucide-react";

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
//   method?: 'registered' | 'deep_link';
//   deepLink?: string;
//   devCode?: string;
// };

// type TelegramStatusResponse =
//   | {
//       ok: true;
//       method: "telegram";
//       confirmed: true;
//       appointmentId?: string;
//       message: string;
//     }
//   | {
//       ok: true;
//       method: "telegram";
//       confirmed: false;
//       pending: true;
//       message: string;
//     }
//   | {
//       ok: false;
//       method: "telegram";
//       expired: true;
//       message: string;
//     }
//   | {
//       ok: false;
//       method: "telegram";
//       error: string;
//     };

// interface TelegramVerificationProps {
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
// }

// export function TelegramVerification({
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
// }: TelegramVerificationProps) {
//   const [deepLink, setDeepLink] = React.useState<string | null>(null);
//   const [codeSent, setCodeSent] = React.useState(false);
//   const [isPolling, setIsPolling] = React.useState(false);
//   const [isRegistered, setIsRegistered] = React.useState(false);
//   const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
//   const verifyingRef = React.useRef(false);
  
//   // ✅ Защита от двойного рендеринга
//   const linkGeneratedRef = React.useRef(false);
//   const isMountedRef = React.useRef(false);

//   // ✅ Генерируем код ОДИН РАЗ при монтировании
//   React.useEffect(() => {
//     if (!isMountedRef.current) {
//       isMountedRef.current = true;
      
//       if (!linkGeneratedRef.current) {
//         linkGeneratedRef.current = true;
//         handleGenerateCode();
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ✅ Polling для проверки автоподтверждения
//   React.useEffect(() => {
//     if (!isPolling) return;

//     const stopPolling = () => {
//       setIsPolling(false);
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };

//     const checkStatus = async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/verify/telegram/status?email=${encodeURIComponent(
//             email
//           )}&draftId=${encodeURIComponent(draftId)}`
//         );

//         const data = (await res.json()) as TelegramStatusResponse;

//         if (!res.ok) {
//           throw new Error("Ошибка проверки статуса");
//         }

//         if (data.ok && data.confirmed) {
//           stopPolling();

//           setError(null);
//           setSuccess(
//             data.message ||
//               "✅ Подтверждено через Telegram! Переход к оплате..."
//           );

//           const appointmentId = data.appointmentId;
//           if (appointmentId) {
//             setTimeout(() => {
//               onVerifySuccess(appointmentId);
//             }, 1000);
//           } else {
//             // Без appointmentId не уходим на оплату, чтобы не попасть на пустую страницу
//             setSuccess(null);
//             setError(
//               "Не удалось получить идентификатор записи. Попробуйте подтвердить ещё раз или выберите email."
//             );
//           }
//           return;
//         }

//         if (!data.ok) {
//           stopPolling();

//           const isExpired = "expired" in data && data.expired === true;
//           const message = isExpired
//             ? (("message" in data && data.message) ||
//                 "Код истёк. Запросите новый.")
//             : (("error" in data && data.error) ||
//                 "Ошибка проверки статуса");

//           setError(message);
//           return;
//         }
//       } catch (err) {
//         console.error("[Polling] Ошибка:", err);
//       }
//     };

//     // Сразу проверяем первый раз
//     checkStatus();

//     // Проверяем каждые 2 секунды
//     pollingRef.current = setInterval(checkStatus, 2000);

//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, [isPolling, email, draftId, setSuccess, onVerifySuccess]);

//   const handleGenerateCode = async () => {
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

//       // ✅ ИСПРАВЛЕНО: Проверяем только ok, deepLink теперь опциональный
//       if (!res.ok || !data.ok) {
//         throw new Error(data.error || "Не удалось создать код");
//       }

//       setCodeSent(true);

//       // ✅ ИСПРАВЛЕНО: Обрабатываем оба случая
//       if (data.method === 'registered') {
//         // Пользователь зарегистрирован - код отправлен через бота
//         setIsRegistered(true);
//         setSuccess("✈️ Код отправлен в Telegram! Проверьте бота и нажмите кнопку подтверждения.");
        
//         // Сразу начинаем polling
//         setIsPolling(true);
//       } else if (data.method === 'deep_link' && data.deepLink) {
//         // Пользователь НЕ зарегистрирован - нужен deep link
//         setDeepLink(data.deepLink);
        
//         // Пробуем открыть Telegram автоматически
//         const newWindow = window.open(data.deepLink, '_blank');
        
//         if (newWindow && !newWindow.closed) {
//           setSuccess("✈️ Telegram открывается... Ожидание подтверждения.");
//           setIsPolling(true);
//         } else {
//           setSuccess("⚠️ Нажмите кнопку ниже, чтобы открыть Telegram.");
//         }
//       } else {
//         // Неизвестный метод или отсутствует deepLink
//         throw new Error("Некорректный ответ от сервера");
//       }

//       if (data.devCode) {
//         console.log(`[DEV] Код для тестирования: ${data.devCode}`);
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка создания кода";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenTelegram = () => {
//     if (deepLink) {
//       window.open(deepLink, "_blank");
      
//       if (!isPolling) {
//         setIsPolling(true);
//         setSuccess("Ожидание подтверждения из Telegram...");
//       }
//     }
//   };

//   const handleVerifyCode = async () => {
//     if (!code || code.length !== 6) {
//       setError("Введите 6-значный код");
//       return;
//     }

//     if (verifyingRef.current) return;

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

//       // ✅ ИСПРАВЛЕНО: Раздельная проверка HTTP и бизнес-логики
//       if (!res.ok) {
//         throw new Error("Ошибка сервера");
//       }

//       // ✅ TypeScript теперь понимает, что если !data.ok, то есть data.error
//       if (!data.ok) {
//         throw new Error(data.error);
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
//             {isRegistered
//               ? "Код отправлен в Telegram бот. Проверьте сообщения и нажмите кнопку подтверждения."
//               : "Telegram откроется автоматически. Вы получите код для ввода или сможете подтвердить сразу кнопкой в боте."}
//           </p>
//         </div>
//       </div>

//       {/* Индикатор загрузки при создании кода */}
//       {!codeSent ? (
//         <div className="flex flex-col items-center justify-center py-8 space-y-3">
//           <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
//           <p className="text-sm text-white/60">Отправка кода...</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {/* Кнопка открытия Telegram (только для не зарегистрированных) */}
//           {!isRegistered && deepLink && (
//             <button
//               type="button"
//               onClick={handleOpenTelegram}
//               className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:brightness-110"
//             >
//               🚀 {isPolling ? "Открыть Telegram повторно" : "Открыть Telegram"}
//             </button>
//           )}

//           {/* Индикатор polling */}
//           {isPolling && (
//             <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-sm text-blue-300">
//               <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
//               <span>
//                 {isRegistered
//                   ? "Ожидание подтверждения в Telegram боте..."
//                   : "Ожидание подтверждения..."}
//               </span>
//             </div>
//           )}

//           {/* Разделитель */}
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

//           {/* Кнопка подтверждения кода */}
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
//             key="telegram-error"
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
//             key="telegram-success"
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

// // src/app/booking/verify/TelegramVerification.tsx
// "use client";

// import * as React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { AlertCircle, CheckCircle2 } from "lucide-react";

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
//   deepLink?: string;
// };

// interface TelegramVerificationProps {
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
// }

// export function TelegramVerification({
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
// }: TelegramVerificationProps) {
//   const [deepLink, setDeepLink] = React.useState<string | null>(null);
//   const [codeSent, setCodeSent] = React.useState(false);
//   const [isPolling, setIsPolling] = React.useState(false);
//   const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
//   const verifyingRef = React.useRef(false);
  
//   // ✅ УСИЛЕННАЯ защита от двойного рендеринга
//   const linkGeneratedRef = React.useRef(false);
//   const isMountedRef = React.useRef(false);

//   // ✅ Генерируем deep link ОДИН РАЗ при монтировании
//   React.useEffect(() => {
//     console.log('[TelegramVerification] ==========================================');
//     console.log('[TelegramVerification] useEffect монтирования сработал');
//     console.log('[TelegramVerification] State:', {
//       isMounted: isMountedRef.current,
//       linkGenerated: linkGeneratedRef.current,
//       codeSent,
//       email,
//       draftId
//     });

//     if (!isMountedRef.current) {
//       console.log('[TelegramVerification] ✅ Первое монтирование!');
//       isMountedRef.current = true;
      
//       if (!linkGeneratedRef.current) {
//         console.log('[TelegramVerification] ✅ Ссылка не генерировалась, запускаем генерацию...');
//         linkGeneratedRef.current = true;
//         handleGenerateDeepLink();
//       } else {
//         console.log('[TelegramVerification] ⚠️ Ссылка уже была сгенерирована!');
//       }
//     } else {
//       console.log('[TelegramVerification] ⚠️ Компонент уже был смонтирован!');
//     }
    
//     console.log('[TelegramVerification] ==========================================');
    
//     return () => {
//       console.log('[TelegramVerification] Компонент размонтируется');
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ✅ Polling для проверки автоподтверждения
//   React.useEffect(() => {
//     console.log('[Polling useEffect] Сработал, isPolling:', isPolling);
    
//     if (!isPolling) {
//       console.log('[Polling] НЕ активен, выходим');
//       return;
//     }

//     console.log('[Polling] ✅ Активен! Запускаем polling...');

//     const checkStatus = async () => {
//       try {
//         console.log('[Polling] 🔍 Проверка статуса...', { email, draftId });
        
//         const url = `/api/booking/verify/telegram/status?email=${encodeURIComponent(
//           email
//         )}&draftId=${encodeURIComponent(draftId)}`;
        
//         console.log('[Polling] URL:', url);
        
//         const res = await fetch(url);
//         console.log('[Polling] Response status:', res.status);

//         const data = await res.json();
//         console.log('[Polling] Response data:', JSON.stringify(data, null, 2));

//         // ✅ Проверяем правильное поле!
//         if (data.verified === true) {
//           console.log('[Polling] ✅✅✅ ПОДТВЕРЖДЕНО! Останавливаем polling...');
          
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }

//           setSuccess("✅ Подтверждено через Telegram! Переход к оплате...");

//           // Если есть appointmentId в ответе - используем его
//           if (data.appointmentId) {
//             console.log('[Polling] Переход с appointmentId:', data.appointmentId);
//             setTimeout(() => {
//               onVerifySuccess(data.appointmentId);
//             }, 1000);
//           } else {
//             console.log('[Polling] Переход без appointmentId');
//             setTimeout(() => {
//               window.location.href = "/booking/payment";
//             }, 1000);
//           }
//         } else {
//           console.log('[Polling] ⏳ Ещё не подтверждено. verified:', data.verified);
//         }
//       } catch (err) {
//         console.error("[Polling] ❌ Ошибка:", err);
//       }
//     };

//     // Сразу проверяем первый раз
//     console.log('[Polling] Первая проверка статуса (сразу)...');
//     checkStatus();

//     // Проверяем каждые 2 секунды
//     console.log('[Polling] Устанавливаем интервал (каждые 2 сек)...');
//     pollingRef.current = setInterval(checkStatus, 2000);

//     return () => {
//       console.log('[Polling] Очистка интервала');
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, [isPolling, email, draftId, setSuccess, onVerifySuccess]);

//   const handleGenerateDeepLink = async () => {
//     console.log('[handleGenerateDeepLink] ========================================');
//     console.log('[handleGenerateDeepLink] ▶️ НАЧАЛО ФУНКЦИИ');
//     console.log('[handleGenerateDeepLink] Email:', email);
//     console.log('[handleGenerateDeepLink] DraftId:', draftId);
//     console.log('[handleGenerateDeepLink] Состояние ДО:', {
//       codeSent,
//       hasDeepLink: !!deepLink,
//       loading,
//       error,
//       success
//     });
    
//     console.log('[handleGenerateDeepLink] 1️⃣ Устанавливаю loading=true...');
//     setLoading(true);
//     console.log('[handleGenerateDeepLink] 2️⃣ Очищаю error и success...');
//     setError(null);
//     setSuccess(null);

//     try {
//       console.log('[handleGenerateDeepLink] 3️⃣ Отправка POST запроса...');
//       console.log('[handleGenerateDeepLink] URL: /api/booking/verify/telegram');
//       console.log('[handleGenerateDeepLink] Body:', JSON.stringify({ email, draftId }));
      
//       const res = await fetch("/api/booking/verify/telegram", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, draftId }),
//       });

//       console.log('[handleGenerateDeepLink] 4️⃣ Получен ответ!');
//       console.log('[handleGenerateDeepLink] res.ok:', res.ok);
//       console.log('[handleGenerateDeepLink] res.status:', res.status);
//       console.log('[handleGenerateDeepLink] res.statusText:', res.statusText);
      
//       console.log('[handleGenerateDeepLink] 5️⃣ Парсинг JSON...');
//       const data = (await res.json()) as SendCodeResponse;
      
//       console.log('[handleGenerateDeepLink] 6️⃣ Данные получены!');
//       console.log('[handleGenerateDeepLink] data:', JSON.stringify(data, null, 2));
//       console.log('[handleGenerateDeepLink] data.ok:', data.ok);
//       console.log('[handleGenerateDeepLink] data.deepLink:', data.deepLink);
//       console.log('[handleGenerateDeepLink] data.error:', data.error);

//       console.log('[handleGenerateDeepLink] 7️⃣ Проверка условий...');
//       console.log('[handleGenerateDeepLink] !res.ok:', !res.ok);
//       console.log('[handleGenerateDeepLink] !data.ok:', !data.ok);
//       console.log('[handleGenerateDeepLink] !data.deepLink:', !data.deepLink);

//       if (!res.ok || !data.ok || !data.deepLink) {
//         const errorMsg = data.error || "Не удалось создать ссылку";
//         console.error('[handleGenerateDeepLink] ❌ ОШИБКА! Условие сработало:', errorMsg);
//         console.error('[handleGenerateDeepLink] Причина:', {
//           resOk: res.ok,
//           dataOk: data.ok,
//           hasDeepLink: !!data.deepLink
//         });
//         throw new Error(errorMsg);
//       }

//       console.log('[handleGenerateDeepLink] 8️⃣ ✅ Проверки пройдены!');
//       console.log('[handleGenerateDeepLink] Deep link:', data.deepLink);

//       console.log('[handleGenerateDeepLink] 9️⃣ Сохраняю deepLink в state...');
//       setDeepLink(data.deepLink);
      
//       console.log('[handleGenerateDeepLink] 🔟 Устанавливаю codeSent=true...');
//       setCodeSent(true);

//       // 🚀 АВТОМАТИЧЕСКИ открываем Telegram
//       console.log('[handleGenerateDeepLink] 1️⃣1️⃣ Открываю Telegram...');
//       const newWindow = window.open(data.deepLink, '_blank');
      
//       // Проверяем, удалось ли открыть окно
//       if (newWindow && !newWindow.closed) {
//         console.log('[handleGenerateDeepLink] ✅ Окно открылось! Запускаю polling...');
//         setIsPolling(true);
//         setSuccess("✈️ Telegram открывается... Ожидание подтверждения.");
//       } else {
//         console.log('[handleGenerateDeepLink] ⚠️ Popup заблокирован');
//         setSuccess("⚠️ Нажмите кнопку ниже, чтобы открыть Telegram.");
//       }

//       if (data.devCode) {
//         console.log(`[handleGenerateDeepLink] 📝 DEV Код: ${data.devCode}`);
//       }
      
//       console.log('[handleGenerateDeepLink] ✅ УСПЕШНОЕ ЗАВЕРШЕНИЕ!');
//       console.log('[handleGenerateDeepLink] Состояние ПОСЛЕ:', {
//         codeSentSet: true,
//         deepLinkSet: !!data.deepLink,
//         pollingStarted: newWindow && !newWindow.closed
//       });
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка создания ссылки";
//       console.error('[handleGenerateDeepLink] ❌❌❌ КРИТИЧЕСКАЯ ОШИБКА!');
//       console.error('[handleGenerateDeepLink] Сообщение:', msg);
//       console.error('[handleGenerateDeepLink] Stack:', e);
//       console.error('[handleGenerateDeepLink] Type:', typeof e);
//       setError(msg);
//     } finally {
//       console.log('[handleGenerateDeepLink] 🏁 Finally блок');
//       console.log('[handleGenerateDeepLink] Устанавливаю loading=false...');
//       setLoading(false);
//       console.log('[handleGenerateDeepLink] ========================================');
//     }
//   };

//   const handleOpenTelegram = () => {
//     console.log('[handleOpenTelegram] Клик!', { hasDeepLink: !!deepLink, deepLink });
    
//     if (deepLink) {
//       console.log('[handleOpenTelegram] Открываю Telegram:', deepLink);
//       window.open(deepLink, "_blank");
      
//       if (!isPolling) {
//         console.log('[handleOpenTelegram] Запускаю polling...');
//         setIsPolling(true);
//         setSuccess("Ожидание подтверждения из Telegram...");
//       }
//     } else {
//       console.error('[handleOpenTelegram] ❌ deepLink отсутствует!');
//     }
//   };

//   const handleVerifyCode = async () => {
//     console.log('[handleVerifyCode] Вызов, код:', code);
    
//     if (!code || code.length !== 6) {
//       console.warn('[handleVerifyCode] Некорректная длина кода');
//       setError("Введите 6-значный код");
//       return;
//     }

//     if (verifyingRef.current) {
//       console.log('[handleVerifyCode] Уже выполняется, пропускаем...');
//       return;
//     }

//     verifyingRef.current = true;
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       console.log('[handleVerifyCode] Отправка запроса...');
      
//       const res = await fetch("/api/booking/verify/telegram/confirm", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, code, draftId }),
//       });

//       const data = (await res.json()) as VerifyResponse;
//       console.log('[handleVerifyCode] Ответ:', data);

//       if (!res.ok) {
//         throw new Error("Ошибка сети при проверке кода");
//       }

//       if (!data.ok) {
//         throw new Error(data.error || "Неверный код");
//       }

//       console.log('[handleVerifyCode] ✅ Код подтверждён! appointmentId:', data.appointmentId);
//       setSuccess("Верификация успешна! Переход к оплате...");
      
//       setTimeout(() => {
//         onVerifySuccess(data.appointmentId);
//       }, 1000);
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка проверки кода";
//       console.error('[handleVerifyCode] ❌ Ошибка:', msg);
//       setError(msg);
//     } finally {
//       setLoading(false);
//       verifyingRef.current = false;
//     }
//   };

//   console.log('[Render] 🎨 TelegramVerification рендерится', {
//     codeSent,
//     isPolling,
//     hasDeepLink: !!deepLink,
//     loading,
//     hasError: !!error,
//     hasSuccess: !!success,
//     email,
//     draftId
//   });

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
//             Telegram откроется автоматически. Вы получите код для ввода или сможете подтвердить сразу кнопкой в боте.
//           </p>
//         </div>
//       </div>

//       {/* Индикатор загрузки при создании ссылки */}
//       {!codeSent ? (
//         <div className="flex flex-col items-center justify-center py-8 space-y-3">
//           <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
//           <p className="text-sm text-white/60">Создание ссылки...</p>
//           <p className="text-xs text-white/40">Проверьте Console (F12) для отладки</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {/* Кнопка открытия Telegram */}
//           <button
//             type="button"
//             onClick={handleOpenTelegram}
//             disabled={!deepLink}
//             className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             🚀 {isPolling ? "Открыть Telegram повторно" : "Открыть Telegram"}
//           </button>

//           {/* Индикатор polling */}
//           {isPolling && (
//             <div className="flex items-center justify-center gap-2 text-sm text-blue-300">
//               <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
//               Ожидание подтверждения...
//             </div>
//           )}

//           {/* Разделитель */}
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

//           {/* Кнопка подтверждения кода */}
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


// // src/app/booking/verify/VerifyPageClient.tsx - ИСПРАВЛЕНО

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

//   // ✅ ИСПРАВЛЕНО: Polling для проверки автоподтверждения
//   React.useEffect(() => {
//     if (!isPolling) return;

//     const checkStatus = async () => {
//       try {
//         console.log('[Polling] Проверка статуса...', { email, draftId });
        
//         const res = await fetch(
//           `/api/booking/verify/telegram/status?email=${encodeURIComponent(
//             email
//           )}&draftId=${encodeURIComponent(draftId)}`
//         );

//         const data = await res.json();
//         console.log('[Polling] Ответ сервера:', data);

//         // ✅ ИСПРАВЛЕНО: Проверяем правильные поля!
//         if (data.verified === true) {
//           console.log('[Polling] ✅ Подтверждено!');
          
//           setIsPolling(false);
//           if (pollingRef.current) clearInterval(pollingRef.current);

//           setSuccess("✅ Подтверждено через Telegram! Переход к оплате...");

//           // Переходим на оплату
//           setTimeout(() => {
//             window.location.href = "/booking/payment";
//           }, 1000);
//         } else {
//           console.log('[Polling] Ещё не подтверждено, ждём...');
//         }
//       } catch (err) {
//         console.error("[Polling] Ошибка:", err);
//       }
//     };

//     // Проверяем каждые 2 секунды
//     pollingRef.current = setInterval(checkStatus, 2000);

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

//       // 🚀 АВТОМАТИЧЕСКИ открываем Telegram
//       const newWindow = window.open(data.deepLink, '_blank');
      
//       // Проверяем, удалось ли открыть окно (popup blocker мог заблокировать)
//       if (newWindow && !newWindow.closed) {
//         setIsPolling(true); // ✅ Начинаем polling для автоподтверждения
//         setSuccess("✈️ Telegram открывается... Ожидание подтверждения.");
//       } else {
//         // Popup заблокирован - покажем кнопку для ручного открытия
//         setSuccess("⚠️ Нажмите кнопку ниже, чтобы открыть Telegram.");
//       }

//       if (data.devCode) {
//         console.log(`[DEV] Код для тестирования: ${data.devCode}`);
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
//       // ✅ Начинаем polling для автоподтверждения
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
//             Нажмите кнопку ниже - Telegram откроется автоматически. 
//             Вы получите код для ввода или сможете подтвердить сразу кнопкой в боте.
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
//             🚀 {isPolling ? "Открыть Telegram повторно" : "Открыть Telegram"}
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

// export { TelegramVerification };


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

//       if (data.ok && data.confirmed) {
//   setIsPolling(false);
//   if (pollingRef.current) clearInterval(pollingRef.current);

//   setSuccess("✅ Подтверждено через Telegram! Переход к оплате...");

//   const appointmentId = data.appointmentId;
//   setTimeout(() => {
//     if (appointmentId) {
//       onVerifySuccess(appointmentId);
//     } else {
//       // fallback: просто идём на payment, а он сам разрулит
//       window.location.href = "/booking/payment";
//     }
//   }, 1000);
// }


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

//       // 🚀 АВТОМАТИЧЕСКИ открываем Telegram
//       const newWindow = window.open(data.deepLink, '_blank');
      
//       // Проверяем, удалось ли открыть окно (popup blocker мог заблокировать)
//       if (newWindow && !newWindow.closed) {
//         setIsPolling(true); // Начинаем polling для автоподтверждения
//         setSuccess("✈️ Telegram открывается... Ожидание подтверждения.");
//       } else {
//         // Popup заблокирован - покажем кнопку для ручного открытия
//         setSuccess("⚠️ Нажмите кнопку ниже, чтобы открыть Telegram.");
//       }

//       if (data.devCode) {
//         console.log(`[DEV] Код для тестирования: ${data.devCode}`);
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
//             Нажмите кнопку ниже - Telegram откроется автоматически. 
//             Вы получите код для ввода или сможете подтвердить сразу кнопкой в боте.
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
//             🚀 {isPolling ? "Открыть Telegram повторно" : "Открыть Telegram"}
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
