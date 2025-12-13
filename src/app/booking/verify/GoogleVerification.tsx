// src/app/booking/verify/GoogleVerification.tsx
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { useTranslations } from "@/i18n/useTranslations";

type SendCodeResponse = {
  ok?: boolean;
  authUrl?: string;
  state?: string;
  message?: string;
  error?: string;
};

type StatusResponse = {
  verified: boolean;
  pending: boolean;
  appointmentId?: string;
  method?: string;
  error?: string;
};

interface GoogleVerificationProps {
  email: string;
  draftId: string;
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (v: string | null) => void;
  success: string | null;
  setSuccess: (v: string | null) => void;
  onVerifySuccess: (appointmentId: string) => void;
}

export function GoogleVerification({
  email,
  draftId,
  loading,
  setLoading,
  error,
  setError,
  success,
  setSuccess,
  onVerifySuccess,
}: GoogleVerificationProps) {
  const t = useTranslations();
  
  const [authUrl, setAuthUrl] = React.useState<string | null>(null);
  const [isPolling, setIsPolling] = React.useState(false);
  const [popupWindow, setPopupWindow] = React.useState<Window | null>(null);

  const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
  const authInitiatedRef = React.useRef(false);

  // ✅ Авто-старт OAuth ТОЛЬКО:
  //  - в основном окне (не в popup)
  //  - если в URL ещё НЕТ success
  React.useEffect(() => {
    const shouldAutoStart = () => {
      if (typeof window === "undefined") return false;

      // если это popup-окно, ничего не запускаем
      const isPopup = !!window.opener && window.opener !== window;
      if (isPopup) return false;

      // если уже есть success в query (после возврата из Google) —
      // не запускаем OAuth заново
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.get("success")) return false;
      } catch {
        /* ignore */
      }

      return true;
    };

    if (!authInitiatedRef.current && shouldAutoStart()) {
      authInitiatedRef.current = true;
      void handleInitiateAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, draftId]);

  // ✅ Cleanup при размонтировании
  React.useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      // popup сам себя закроет, доступ к нему из родителя может блокироваться COOP
    };
  }, []);

  // ✅ Polling для проверки статуса
  React.useEffect(() => {
    if (!isPolling) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/booking/verify/google/status?email=${encodeURIComponent(
            email
          )}&draftId=${encodeURIComponent(draftId)}`
        );

        const data = (await res.json()) as StatusResponse;

        console.log("[Google Polling] Status:", data);

        if (data.verified === true && data.appointmentId) {
          // ✅ Верификация завершена!
          setIsPolling(false);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }

          setSuccess(t("booking_verify_google_success"));

          setTimeout(() => {
            onVerifySuccess(data.appointmentId!);
          }, 1000);
        }
      } catch (err) {
        console.error("[Google Polling] Error:", err);
      }
    };

    // первая проверка сразу
    void checkStatus();

    // и затем каждые 2 секунды
    pollingRef.current = setInterval(checkStatus, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isPolling, email, draftId, setSuccess, onVerifySuccess, t]);

  /**
   * Инициация OAuth flow
   */
  const handleInitiateAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("[Google OAuth] Initiating auth...");

      const res = await fetch("/api/booking/verify/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, draftId }),
      });

      const data = (await res.json()) as SendCodeResponse;

      if (!res.ok || !data.ok || !data.authUrl) {
        throw new Error(data.error || "Не удалось получить OAuth URL");
      }

      setAuthUrl(data.authUrl);

      console.log("[Google OAuth] Auth URL received, opening popup...");

      const popup = openGooglePopup(data.authUrl);

      if (popup) {
        setPopupWindow(popup);
        setSuccess(t("booking_verify_google_preparing_window"));
        setIsPolling(true);
      } else {
        // popup заблокирован
        setSuccess(t("booking_verify_google_allow_popups"));
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Ошибка инициализации OAuth";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Открыть Google popup
   */
  const openGooglePopup = (url: string): Window | null => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const features = [
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      "toolbar=no",
      "menubar=no",
      "scrollbars=yes",
      "resizable=yes",
    ].join(",");

    return window.open(url, "Google OAuth", features);
  };

  /**
   * Открыть popup повторно
   */
  const handleOpenPopup = () => {
    if (!authUrl) {
      setError("OAuth URL не готов");
      return;
    }

    const popup = openGooglePopup(authUrl);

    if (popup) {
      setPopupWindow(popup);
      setSuccess(t("booking_verify_google_preparing_window"));

      if (!isPolling) {
        setIsPolling(true);
      }
    } else {
      setError("Не удалось открыть popup. Проверьте настройки браузера.");
    }
  };

  return (
    <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15">
          <span className="text-xl">🔐</span>
        </div>
        <div className="space-y-1.5 text-sm">
          <p className="font-medium text-white/90">{t("booking_verify_google_title")}</p>
          <p className="text-xs text-white/60 md:text-sm">
            {t("booking_verify_google_desc")}
          </p>
        </div>
      </div>

      {!authUrl && loading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-sm text-white/60">{t("booking_verify_google_preparing")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Кнопка открытия Google */}
          {authUrl && (
            <button
              type="button"
              onClick={handleOpenPopup}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:brightness-110"
            >
              <span className="text-lg">🔐</span>
              {isPolling ? t("booking_verify_google_reopen_button") : t("booking_verify_google_open_button")}
              <ExternalLink className="h-4 w-4" />
            </button>
          )}

          {/* Индикатор polling */}
          {isPolling && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-sm text-blue-300">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
              <span>{t("booking_verify_google_waiting")}</span>
            </div>
          )}

          {/* Информация о процессе */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/70 space-y-2">
            <p className="font-medium text-white/80">{t("booking_verify_google_how_title")}</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>{t("booking_verify_google_how_step_1")}</li>
              <li>{t("booking_verify_google_how_step_2")}</li>
              <li>{t("booking_verify_google_how_step_3")}</li>
              <li>{t("booking_verify_google_how_step_4")}</li>
            </ol>
          </div>

          {/* Безопасность */}
          <div className="flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-xs text-green-200/80">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{t("booking_verify_google_security_title")}</p>
              <p className="mt-1 text-green-200/60">
                {t("booking_verify_google_security_desc")}
              </p>
            </div>
          </div>
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




//----------добовляю перевод------
// // src/app/booking/verify/GoogleVerification.tsx
// "use client";

// import * as React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";

// type SendCodeResponse = {
//   ok?: boolean;
//   authUrl?: string;
//   state?: string;
//   message?: string;
//   error?: string;
// };

// type StatusResponse = {
//   verified: boolean;
//   pending: boolean;
//   appointmentId?: string;
//   method?: string;
//   error?: string;
// };

// interface GoogleVerificationProps {
//   email: string;
//   draftId: string;
//   loading: boolean;
//   setLoading: (v: boolean) => void;
//   error: string | null;
//   setError: (v: string | null) => void;
//   success: string | null;
//   setSuccess: (v: string | null) => void;
//   onVerifySuccess: (appointmentId: string) => void;
// }

// export function GoogleVerification({
//   email,
//   draftId,
//   loading,
//   setLoading,
//   error,
//   setError,
//   success,
//   setSuccess,
//   onVerifySuccess,
// }: GoogleVerificationProps) {
//   const [authUrl, setAuthUrl] = React.useState<string | null>(null);
//   const [isPolling, setIsPolling] = React.useState(false);
//   const [popupWindow, setPopupWindow] = React.useState<Window | null>(null);

//   const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
//   const authInitiatedRef = React.useRef(false);

//   // ✅ Авто-старт OAuth ТОЛЬКО:
//   //  - в основном окне (не в popup)
//   //  - если в URL ещё НЕТ success
//   React.useEffect(() => {
//     const shouldAutoStart = () => {
//       if (typeof window === "undefined") return false;

//       // если это popup-окно, ничего не запускаем
//       const isPopup = !!window.opener && window.opener !== window;
//       if (isPopup) return false;

//       // если уже есть success в query (после возврата из Google) —
//       // не запускаем OAuth заново
//       try {
//         const url = new URL(window.location.href);
//         if (url.searchParams.get("success")) return false;
//       } catch {
//         /* ignore */
//       }

//       return true;
//     };

//     if (!authInitiatedRef.current && shouldAutoStart()) {
//       authInitiatedRef.current = true;
//       void handleInitiateAuth();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [email, draftId]);

//   // ✅ Cleanup при размонтировании
//   React.useEffect(() => {
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//       // popup сам себя закроет, доступ к нему из родителя может блокироваться COOP
//     };
//   }, []);

//   // ✅ Polling для проверки статуса
//   React.useEffect(() => {
//     if (!isPolling) return;

//     const checkStatus = async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/verify/google/status?email=${encodeURIComponent(
//             email
//           )}&draftId=${encodeURIComponent(draftId)}`
//         );

//         const data = (await res.json()) as StatusResponse;

//         console.log("[Google Polling] Status:", data);

//         if (data.verified === true && data.appointmentId) {
//           // ✅ Верификация завершена!
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }

//           setSuccess("✅ Подтверждено через Google! Переход к оплате...");

//           setTimeout(() => {
//             onVerifySuccess(data.appointmentId!);
//           }, 1000);
//         }
//       } catch (err) {
//         console.error("[Google Polling] Error:", err);
//       }
//     };

//     // первая проверка сразу
//     void checkStatus();

//     // и затем каждые 2 секунды
//     pollingRef.current = setInterval(checkStatus, 2000);

//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, [isPolling, email, draftId, setSuccess, onVerifySuccess]);

//   /**
//    * Инициация OAuth flow
//    */
//   const handleInitiateAuth = async () => {
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       console.log("[Google OAuth] Initiating auth...");

//       const res = await fetch("/api/booking/verify/google", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, draftId }),
//       });

//       const data = (await res.json()) as SendCodeResponse;

//       if (!res.ok || !data.ok || !data.authUrl) {
//         throw new Error(data.error || "Не удалось получить OAuth URL");
//       }

//       setAuthUrl(data.authUrl);

//       console.log("[Google OAuth] Auth URL received, opening popup...");

//       const popup = openGooglePopup(data.authUrl);

//       if (popup) {
//         setPopupWindow(popup);
//         setSuccess("🔐 Google откроется в новом окне...");
//         setIsPolling(true);
//       } else {
//         // popup заблокирован
//         setSuccess("⚠️ Разрешите всплывающие окна и нажмите кнопку ниже.");
//       }
//     } catch (e) {
//       const msg =
//         e instanceof Error ? e.message : "Ошибка инициализации OAuth";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Открыть Google popup
//    */
//   const openGooglePopup = (url: string): Window | null => {
//     const width = 600;
//     const height = 700;
//     const left = window.screenX + (window.outerWidth - width) / 2;
//     const top = window.screenY + (window.outerHeight - height) / 2;

//     const features = [
//       `width=${width}`,
//       `height=${height}`,
//       `left=${left}`,
//       `top=${top}`,
//       "toolbar=no",
//       "menubar=no",
//       "scrollbars=yes",
//       "resizable=yes",
//     ].join(",");

//     return window.open(url, "Google OAuth", features);
//   };

//   /**
//    * Открыть popup повторно
//    */
//   const handleOpenPopup = () => {
//     if (!authUrl) {
//       setError("OAuth URL не готов");
//       return;
//     }

//     const popup = openGooglePopup(authUrl);

//     if (popup) {
//       setPopupWindow(popup);
//       setSuccess("🔐 Google открыт в новом окне...");

//       if (!isPolling) {
//         setIsPolling(true);
//       }
//     } else {
//       setError("Не удалось открыть popup. Проверьте настройки браузера.");
//     }
//   };

//   return (
//     <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5">
//       <div className="flex items-start gap-3">
//         <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15">
//           <span className="text-xl">🔐</span>
//         </div>
//         <div className="space-y-1.5 text-sm">
//           <p className="font-medium text-white/90">Подтвердите через Google</p>
//           <p className="text-xs text-white/60 md:text-sm">
//             Войдите через свой Google аккаунт для быстрого и безопасного
//             подтверждения бронирования.
//           </p>
//         </div>
//       </div>

//       {!authUrl && loading ? (
//         <div className="flex flex-col items-center justify-center py-8 space-y-3">
//           <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
//           <p className="text-sm text-white/60">Подготовка авторизации...</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {/* Кнопка открытия Google */}
//           {authUrl && (
//             <button
//               type="button"
//               onClick={handleOpenPopup}
//               className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:brightness-110"
//             >
//               <span className="text-lg">🔐</span>
//               {isPolling ? "Открыть Google повторно" : "Войти через Google"}
//               <ExternalLink className="h-4 w-4" />
//             </button>
//           )}

//           {/* Индикатор polling */}
//           {isPolling && (
//             <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-sm text-blue-300">
//               <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
//               <span>Ожидание подтверждения из Google...</span>
//             </div>
//           )}

//           {/* Информация о процессе */}
//           <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/70 space-y-2">
//             <p className="font-medium text-white/80">Как это работает:</p>
//             <ol className="space-y-1 list-decimal list-inside">
//               <li>Откроется окно входа в Google</li>
//               <li>Выберите свой аккаунт Google</li>
//               <li>Разрешите доступ к email</li>
//               <li>Автоматически вернётесь к оплате</li>
//             </ol>
//           </div>

//           {/* Безопасность */}
//           <div className="flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-xs text-green-200/80">
//             <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
//             <div>
//               <p className="font-medium">Безопасно и надёжно</p>
//               <p className="mt-1 text-green-200/60">
//                 Мы не получаем доступ к вашему паролю Google. Используется
//                 официальный OAuth протокол.
//               </p>
//             </div>
//           </div>
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



//-------Уже работал, но хочу убрать всплывающееся окно
// "use client";

// import * as React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";

// type SendCodeResponse = {
//   ok?: boolean;
//   authUrl?: string;
//   state?: string;
//   message?: string;
//   error?: string;
// };

// type StatusResponse = {
//   verified: boolean;
//   pending: boolean;
//   appointmentId?: string;
//   method?: string;
//   error?: string;
// };

// interface GoogleVerificationProps {
//   email: string;
//   draftId: string;
//   loading: boolean;
//   setLoading: (v: boolean) => void;
//   error: string | null;
//   setError: (v: string | null) => void;
//   success: string | null;
//   setSuccess: (v: string | null) => void;
//   onVerifySuccess: (appointmentId: string) => void;
// }

// export function GoogleVerification({
//   email,
//   draftId,
//   loading,
//   setLoading,
//   error,
//   setError,
//   success,
//   setSuccess,
//   onVerifySuccess,
// }: GoogleVerificationProps) {
//   const [authUrl, setAuthUrl] = React.useState<string | null>(null);
//   const [isPolling, setIsPolling] = React.useState(false);
//   const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
//   const popupRef = React.useRef<Window | null>(null);

//   // ✅ Polling status
//   React.useEffect(() => {
//     if (!isPolling) return;

//     const checkStatus = async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/verify/google/status?email=${encodeURIComponent(
//             email
//           )}&draftId=${encodeURIComponent(draftId)}`
//         );

//         const data = (await res.json()) as StatusResponse;

//         console.log("[Google Polling] Status:", data);

//         if (data.verified && data.appointmentId) {
//           stopPolling();

//           setSuccess("✅ Google подтверждён! Переходим к оплате...");

//           setTimeout(() => {
//             onVerifySuccess(data.appointmentId!);
//           }, 800);
//         }
//       } catch (err) {
//         console.error("[Google Polling] Error:", err);
//       }
//     };

//     checkStatus();
//     pollingRef.current = setInterval(checkStatus, 2000);

//     return stopPolling;
//   }, [isPolling, email, draftId]);

//   const stopPolling = () => {
//     if (pollingRef.current) {
//       clearInterval(pollingRef.current);
//       pollingRef.current = null;
//     }
//     setIsPolling(false);
//   };

//   /**
//    * Step 1: Request OAuth URL
//    */
//   const handleStartOAuth = async () => {
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch("/api/booking/verify/google", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, draftId }),
//       });

//       const data = (await res.json()) as SendCodeResponse;

//       if (!res.ok || !data.ok || !data.authUrl) {
//         throw new Error(data.error || "Не удалось инициировать Google OAuth");
//       }

//       setAuthUrl(data.authUrl);
//       setSuccess("✅ Google готов — нажмите кнопку снизу!");
//     } catch (err) {
//       setError(
//         err instanceof Error ? err.message : "Ошибка инициализации Google OAuth"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Step 2: Open popup (must be on user click)
//    */
//   const handleOpenPopup = () => {
//     if (!authUrl) {
//       setError("OAuth URL ещё не готов");
//       return;
//     }

//     const width = 520;
//     const height = 720;
//     const left = window.screenX + (window.outerWidth - width) / 2;
//     const top = window.screenY + (window.outerHeight - height) / 2;

//     popupRef.current = window.open(
//       authUrl,
//       "GoogleOAuthPopup",
//       `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
//     );

//     if (popupRef.current) {
//       setSuccess("🔐 Google открыт. Завершите вход в новом окне.");
//       setIsPolling(true);
//     } else {
//       setError("Браузер заблокировал окно. Разрешите popup и попробуйте снова.");
//     }
//   };

//   return (
//     <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5">
//       <p className="font-medium text-white/90">Подтверждение через Google</p>

//       {/* Step 1 button */}
//       {!authUrl && (
//         <button
//           disabled={loading}
//           onClick={handleStartOAuth}
//           className="w-full rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold"
//         >
//           {loading ? "Загрузка..." : "Начать подтверждение"}
//         </button>
//       )}

//       {/* Step 2 button */}
//       {authUrl && (
//         <button
//           onClick={handleOpenPopup}
//           className="w-full rounded-xl bg-green-600 px-5 py-3 text-white font-semibold flex items-center justify-center gap-2"
//         >
//           {isPolling ? "Открыть Google снова" : "Войти через Google"}
//           <ExternalLink className="h-4 w-4" />
//         </button>
//       )}

//       {isPolling && (
//         <div className="text-blue-300 text-sm flex items-center gap-2">
//           <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
//           Ожидание подтверждения...
//         </div>
//       )}

//       {/* Messages */}
//       <AnimatePresence mode="wait">
//         {error && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-red-300 text-sm"
//           >
//             {error}
//           </motion.div>
//         )}
//         {success && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="text-green-300 text-sm"
//           >
//             {success}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }



// // src/app/booking/verify/GoogleVerification.tsx
// "use client";

// import * as React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";

// type SendCodeResponse = {
//   ok?: boolean;
//   authUrl?: string;
//   state?: string;
//   message?: string;
//   error?: string;
// };

// type StatusResponse = {
//   verified: boolean;
//   pending: boolean;
//   appointmentId?: string;
//   method?: string;
//   error?: string;
// };

// interface GoogleVerificationProps {
//   email: string;
//   draftId: string;
//   loading: boolean;
//   setLoading: (v: boolean) => void;
//   error: string | null;
//   setError: (v: string | null) => void;
//   success: string | null;
//   setSuccess: (v: string | null) => void;
//   onVerifySuccess: (appointmentId: string) => void;
// }

// export function GoogleVerification({
//   email,
//   draftId,
//   loading,
//   setLoading,
//   error,
//   setError,
//   success,
//   setSuccess,
//   onVerifySuccess,
// }: GoogleVerificationProps) {
//   const [authUrl, setAuthUrl] = React.useState<string | null>(null);
//   const [isPolling, setIsPolling] = React.useState(false);
//   const [popupWindow, setPopupWindow] = React.useState<Window | null>(null);
//   const pollingRef = React.useRef<NodeJS.Timeout | null>(null);
//   const authInitiatedRef = React.useRef(false);
//   const isMountedRef = React.useRef(false);

//   // ✅ Инициализация OAuth при монтировании
//   React.useEffect(() => {
//     if (!isMountedRef.current) {
//       isMountedRef.current = true;

//       if (!authInitiatedRef.current) {
//         authInitiatedRef.current = true;
//         handleInitiateAuth();
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ✅ Cleanup при размонтировании
//   React.useEffect(() => {
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//       // Не пытаемся закрыть popup - COOP блокирует доступ
//     };
//   }, [popupWindow]);

//   // ✅ Polling для проверки статуса
//   React.useEffect(() => {
//     if (!isPolling) return;

//     const checkStatus = async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/verify/google/status?email=${encodeURIComponent(
//             email
//           )}&draftId=${encodeURIComponent(draftId)}`
//         );

//         const data = (await res.json()) as StatusResponse;

//         console.log('[Google Polling] Status:', data);

//         if (data.verified === true && data.appointmentId) {
//           // ✅ Верификация завершена!
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }

//           // Popup закроется автоматически после redirect
//           // Не пытаемся закрыть вручную - COOP блокирует доступ

//           setSuccess("✅ Подтверждено через Google! Переход к оплате...");

//           setTimeout(() => {
//             onVerifySuccess(data.appointmentId!);
//           }, 1000);
//         }
//       } catch (err) {
//         console.error("[Google Polling] Error:", err);
//       }
//     };

//     // Проверяем сразу
//     checkStatus();

//     // Проверяем каждые 2 секунды
//     pollingRef.current = setInterval(checkStatus, 2000);

//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, [isPolling, email, draftId, setSuccess, onVerifySuccess, popupWindow]);

//   /**
//    * Инициация OAuth flow
//    */
//   const handleInitiateAuth = async () => {
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       console.log('[Google OAuth] Initiating auth...');

//       const res = await fetch("/api/booking/verify/google", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, draftId }),
//       });

//       const data = (await res.json()) as SendCodeResponse;

//       if (!res.ok || !data.ok || !data.authUrl) {
//         throw new Error(data.error || "Не удалось получить OAuth URL");
//       }

//       setAuthUrl(data.authUrl);

//       console.log('[Google OAuth] Auth URL received, opening popup...');

//       // Открываем popup
//       const popup = openGooglePopup(data.authUrl);

//       if (popup) {
//         setPopupWindow(popup);
//         setSuccess("🔐 Google откроется в новом окне...");
//         setIsPolling(true);
//       } else {
//         // Popup заблокирован
//         setSuccess("⚠️ Разрешите всплывающие окна и нажмите кнопку ниже.");
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка инициализации OAuth";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Открыть Google popup
//    */
//   const openGooglePopup = (url: string): Window | null => {
//     const width = 600;
//     const height = 700;
//     const left = window.screenX + (window.outerWidth - width) / 2;
//     const top = window.screenY + (window.outerHeight - height) / 2;

//     const features = [
//       `width=${width}`,
//       `height=${height}`,
//       `left=${left}`,
//       `top=${top}`,
//       'toolbar=no',
//       'menubar=no',
//       'scrollbars=yes',
//       'resizable=yes',
//     ].join(',');

//     return window.open(url, 'Google OAuth', features);
//   };

//   /**
//    * Открыть popup повторно
//    */
//   const handleOpenPopup = () => {
//     if (!authUrl) {
//       setError("OAuth URL не готов");
//       return;
//     }

//     // Открываем новый popup (старый можем не закрывать - COOP блокирует доступ)
//     const popup = openGooglePopup(authUrl);

//     if (popup) {
//       setPopupWindow(popup);
//       setSuccess("🔐 Google открыт в новом окне...");

//       if (!isPolling) {
//         setIsPolling(true);
//       }
//     } else {
//       setError("Не удалось открыть popup. Проверьте настройки браузера.");
//     }
//   };

//   return (
//     <div className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5">
//       <div className="flex items-start gap-3">
//         <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15">
//           <span className="text-xl">🔐</span>
//         </div>
//         <div className="space-y-1.5 text-sm">
//           <p className="font-medium text-white/90">
//             Подтвердите через Google
//           </p>
//           <p className="text-xs text-white/60 md:text-sm">
//             Войдите через свой Google аккаунт для быстрого и безопасного
//             подтверждения бронирования.
//           </p>
//         </div>
//       </div>

//       {/* Индикатор загрузки при создании authUrl */}
//       {!authUrl && loading ? (
//         <div className="flex flex-col items-center justify-center py-8 space-y-3">
//           <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
//           <p className="text-sm text-white/60">Подготовка авторизации...</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {/* Кнопка открытия Google */}
//           {authUrl && (
//             <button
//               type="button"
//               onClick={handleOpenPopup}
//               className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(59,130,246,0.45)] transition hover:brightness-110"
//             >
//               <span className="text-lg">🔐</span>
//               {isPolling ? "Открыть Google повторно" : "Войти через Google"}
//               <ExternalLink className="h-4 w-4" />
//             </button>
//           )}

//           {/* Индикатор polling */}
//           {isPolling && (
//             <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 p-3 text-sm text-blue-300">
//               <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
//               <span>Ожидание подтверждения из Google...</span>
//             </div>
//           )}

//           {/* Информация о процессе */}
//           <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/70 space-y-2">
//             <p className="font-medium text-white/80">Как это работает:</p>
//             <ol className="space-y-1 list-decimal list-inside">
//               <li>Откроется окно входа в Google</li>
//               <li>Выберите свой аккаунт Google</li>
//               <li>Разрешите доступ к email</li>
//               <li>Автоматически вернётесь к оплате</li>
//             </ol>
//           </div>

//           {/* Безопасность */}
//           <div className="flex items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-xs text-green-200/80">
//             <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
//             <div>
//               <p className="font-medium">Безопасно и надёжно</p>
//               <p className="mt-1 text-green-200/60">
//                 Мы не получаем доступ к вашему паролю Google. Используется
//                 официальный OAuth протокол.
//               </p>
//             </div>
//           </div>
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