// src/app/booking/verify/VerifyPageClient.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import { TelegramVerification } from "./TelegramVerification";
import { GoogleVerification } from "./GoogleVerification";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  Shield,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Crown,
  Sparkles,
  Check,
} from "lucide-react";
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
import { useTranslations } from "@/i18n/useTranslations";

type VerificationMethod = "email" | "google" | "telegram" | "whatsapp";

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
};

/* ===================== Floating Particles ===================== */
function FloatingParticles() {
  const [particles, setParticles] = React.useState<Array<{ x: number; y: number; id: number; color: string }>>([]);

  React.useEffect(() => {
    const colors = [
      "bg-amber-400/30",
      "bg-fuchsia-400/25",
      "bg-sky-400/25",
      "bg-emerald-400/25",
      "bg-yellow-300/30",
    ];
    
    const newParticles = [...Array(30)].map((_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute h-1 w-1 rounded-full ${particle.color}`}
          initial={{ x: particle.x, y: particle.y, opacity: 0 }}
          animate={{
            x: [particle.x, Math.random() * window.innerWidth, particle.x],
            y: [particle.y, Math.random() * window.innerHeight, particle.y],
            scale: [1, 2, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

interface PageShellProps {
  children: React.ReactNode;
  bookingSteps: Array<{ id: string; label: string; icon: string }>;
}

function PageShell({ children, bookingSteps }: PageShellProps): React.JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
      {/* Неоновая верхняя линия */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />
      
      <BookingAnimatedBackground />
      <FloatingParticles />

      {/* Премиальный фон с радиальными градиентами */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
      </div>

      {/* Хедер с прогресс-баром */}
      <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
          <PremiumProgressBar currentStep={4} steps={bookingSteps} />
        </div>
      </header>

      <div className="h-[84px] md:h-[96px]" />

      {children}

      <style jsx global>{`
        .brand-script {
          font-family: var(
            --brand-script,
            "Cormorant Infant",
            "Playfair Display",
            serif
          );
          font-style: italic;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        @keyframes bg-slide {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 0%; }
        }
      `}</style>
    </div>
  );
}

/* ===================== Видео-секция ===================== */

function VideoSection(): React.JSX.Element {
  return (
    <section className="relative py-10 sm:py-12">
      <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
        <video
          className="absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/fallback-poster.jpg"
          aria-hidden="true"
        >
          <source src="/SE-logo-video-master.webm" type="video/webm" />
          <source src="/SE-logo-video-master.mp4" type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/10" />
      </div>
    </section>
  );
}

/* ===================== Основной компонент ===================== */

export default function VerifyPageClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();

  // Dynamic booking steps with i18n
  const BOOKING_STEPS = React.useMemo(() => [
    { id: "services", label: t("booking_step_services"), icon: "✨" },
    { id: "master", label: t("booking_step_master"), icon: "👤" },
    { id: "calendar", label: t("booking_step_date"), icon: "📅" },
    { id: "client", label: t("booking_step_client"), icon: "📝" },
    { id: "verify", label: t("booking_step_verify"), icon: "✓" },
    { id: "payment", label: t("booking_step_payment"), icon: "💳" },
  ], [t]);

  const successFromUrl = searchParams.get("success");

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const isPopup = !!window.opener && window.opener !== window;
    if (!isPopup) return;
    if (!successFromUrl) return;

    try {
      const targetUrl = `/booking/payment?appointment=${encodeURIComponent(
        successFromUrl
      )}`;
      window.opener.location.href = targetUrl;
    } catch (e) {
      console.error("[VerifyPage] Failed to redirect opener", e);
    }

    window.close();
  }, [successFromUrl]);

  const draftId = searchParams.get("draft") ?? "";
  const email = searchParams.get("email") ?? "";

  const [selectedMethod, setSelectedMethod] =
    React.useState<VerificationMethod>("email");
  const [code, setCode] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const sendingRef = React.useRef(false);
  const verifyingRef = React.useRef(false);

  const baseDisabled = !draftId || !email;

  const handleSendCode = async (): Promise<void> => {
    if (!email) {
      setError("Email не указан");
      return;
    }

    if (sendingRef.current) {
      console.log("[OTP] Запрос уже отправляется, пропускаем дубликат");
      return;
    }

    sendingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/booking/verify/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, draftId }),
      });

      const data = (await res.json()) as SendCodeResponse;

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Не удалось отправить код");
      }

      setCodeSent(true);
      setSuccess(`${t("booking_verify_code_on_email")} ${email}`);

      if (data.devCode) {
        console.log(`[DEV] Код для тестирования: ${data.devCode}`);
        setSuccess(`${t("booking_verify_code_on_email")} ${email}. Dev код: ${data.devCode}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка отправки кода";
      setError(msg);
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!code || code.length !== 6) {
      setError(t("booking_verify_error_enter_code"));
      return;
    }

    if (verifyingRef.current) {
      console.log("[OTP] Проверка уже выполняется, пропускаем дубликат");
      return;
    }

    verifyingRef.current = true;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/booking/verify/email/confirm", {
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

      const appointmentId = data.appointmentId;

      if (!appointmentId) {
        throw new Error(
          "Не удалось получить идентификатор записи (appointmentId)"
        );
      }

      setSuccess(t("booking_verify_success_redirect"));

      setTimeout(() => {
        router.push(
          `/booking/payment?appointment=${encodeURIComponent(appointmentId)}`
        );
      }, 1000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка проверки кода";
      setError(msg);
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  };

  const handleMethodSelect = (method: VerificationMethod): void => {
    setSelectedMethod(method);
    setCodeSent(false);
    setCode("");
    setError(null);
    setSuccess(null);
  };

  if (baseDisabled) {
    return (
      <PageShell bookingSteps={BOOKING_STEPS}>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 backdrop-blur-xl">
            <p className="text-sm md:text-base text-red-200">
              {t("booking_verify_invalid_params")}
            </p>
            <Link
              href="/booking"
              className="mt-4 inline-block text-sm text-amber-300 underline hover:text-amber-200"
            >
              {t("booking_verify_invalid_return")}
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const maskedEmail =
    email.length > 5
      ? email.replace(
          /^(.{2}).+(@.+)$/,
          (_match, p1: string, p2: string) => `${p1}***${p2}`
        )
      : email;

  const onVerifySuccess = (appointmentId: string) => {
    router.push(`/booking/payment?appointment=${encodeURIComponent(appointmentId)}`);
  };

  return (
    <PageShell bookingSteps={BOOKING_STEPS}>
      <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
        {/* ПРЕМИУМ ЗАГОЛОВОК */}
        <div className="flex w-full flex-col items-center text-center pt-8">
          {/* Ultra Premium Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative mb-8"
          >
            <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
            >
              <Crown className="h-5 w-5 text-black drop-shadow-lg" />
              <span className="font-serif text-base font-bold italic text-black drop-shadow-sm md:text-lg">
                {t("booking_verify_badge")}
              </span>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-4xl font-bold italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] md:text-5xl lg:text-6xl"
            style={{
              textShadow: "0 0 40px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.3)",
            }}
          >
            {t("booking_verify_hero_title")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="brand-script mx-auto max-w-3xl text-xl font-semibold italic tracking-wide text-cyan-400/95 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] md:text-2xl lg:text-3xl"
            style={{
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            {t("booking_verify_hero_subtitle")}
          </motion.p>

          {/* Декоративная линия */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{ 
              scaleX: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
              opacity: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] md:w-40"
          />
        </div>

        {/* Основной блок: верификация + инфо */}
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* ПРЕМИУМ ФОРМА ВЕРИФИКАЦИИ */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            {/* ПРЕМИАЛЬНАЯ ОБЁРТКА с цветной радужной границей */}
            <div className="relative rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_50px_rgba(168,85,247,0.4)]">
              <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.3),transparent_65%)] blur-3xl" />

              {/* ВНУТРЕННЯЯ КАРТОЧКА */}
              <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
                {/* Внутренние подсветки */}
                <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-amber-300/20 blur-3xl" />
                <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-emerald-400/18 blur-3xl" />

                <div className="relative space-y-6">
                  {/* Заголовок секции */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-400/20 ring-1 ring-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                        <Shield className="h-4 w-4 text-amber-300" />
                      </span>
                      {t("booking_verify_method_title")}
                    </h2>
                    <p className="text-sm text-slate-300">
                      {t("booking_verify_code_on_email")}{" "}
                      <span className="font-semibold text-amber-300">
                        {maskedEmail}
                      </span>
                    </p>
                  </div>

                  {/* Методы верификации */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Email */}
                    <motion.button
                      type="button"
                      onClick={() => handleMethodSelect("email")}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                        selectedMethod === "email"
                          ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
                          : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
                        <motion.div
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-0 rounded-full bg-amber-400/30 blur-sm"
                        />
                        <motion.div
                          animate={{ y: [0, -2, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="relative z-10"
                        >
                          <Mail className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{t("booking_verify_method_email_title")}</div>
                        <div className="text-xs text-slate-400">
                          {t("booking_verify_method_email_desc")}
                        </div>
                      </div>
                      {selectedMethod === "email" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
                        >
                          <Check className="h-4 w-4 text-black" />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Google */}
                    <motion.button
                      type="button"
                      onClick={() => handleMethodSelect("google")}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                        selectedMethod === "google"
                          ? "border-blue-400/80 bg-gradient-to-r from-blue-500/30 via-blue-600/20 to-blue-500/25 shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                          : "border-white/15 bg-white/5 hover:border-blue-300/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white ring-1 ring-white/20 shadow-lg">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'conic-gradient(from 0deg, #4285F4, #EA4335, #FBBC05, #34A853, #4285F4)',
                            opacity: 0.3,
                            filter: 'blur(4px)',
                          }}
                        />
                        <motion.svg
                          animate={{
                            rotate: [-8, 8, -8],
                            scale: [1, 1.1, 1],
                            y: [0, -2, 0],
                          }}
                          transition={{
                            rotate: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                            scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                          }}
                          className="relative z-10 h-6 w-6"
                          viewBox="0 0 48 48"
                        >
                          <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
                          <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
                          <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
                          <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
                        </motion.svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{t("booking_verify_method_google_title")}</div>
                        <div className="text-xs text-slate-400">
                          {t("booking_verify_method_google_desc")}
                        </div>
                      </div>
                      {selectedMethod === "google" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-lg"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* Telegram */}
                    <motion.button
                      type="button"
                      onClick={() => handleMethodSelect("telegram")}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                        selectedMethod === "telegram"
                          ? "border-sky-400/80 bg-gradient-to-r from-sky-500/30 via-cyan-500/20 to-sky-500/25 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
                          : "border-white/15 bg-white/5 hover:border-sky-300/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#2AABEE] to-[#229ED9] ring-1 ring-sky-400/40 shadow-lg">
                        <motion.div
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.4, 0.7, 0.4],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-0 rounded-full bg-sky-400/40 blur-sm"
                        />
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5,
                          }}
                          className="absolute inset-0 rounded-full bg-cyan-400/40 blur-sm"
                        />
                        <motion.svg
                          animate={{
                            x: [0, 1, 0],
                            y: [0, -1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="relative z-10 h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                        </motion.svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{t("booking_verify_method_telegram_title")}</div>
                        <div className="text-xs text-slate-400">
                          {t("booking_verify_method_telegram_desc")}
                        </div>
                      </div>
                      {selectedMethod === "telegram" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 shadow-lg"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>

                    {/* WhatsApp - disabled */}
                    <button
                      type="button"
                      disabled
                      className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-left opacity-40"
                    >
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 ring-1 ring-white/10 shadow-inner">
                        <Mail className="h-6 w-6 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-white">{t("booking_verify_method_whatsapp_title")}</div>
                        <div className="text-xs text-slate-400">
                          {t("booking_verify_method_whatsapp_desc")}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Блок верификации для Email */}
                  <AnimatePresence mode="wait">
                    {selectedMethod === "email" && (
                      <motion.div
                        key="email-method"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5 rounded-2xl border border-white/15 bg-slate-900/60 p-5 backdrop-blur-xl"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-400/40">
                            <Mail className="h-5 w-5 text-amber-300" />
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="font-bold text-white">
                              {t("booking_verify_email_confirm_title")}
                            </p>
                            <p className="text-slate-300">
                              {t("booking_verify_email_confirm_desc")}{" "}
                              <span className="font-semibold text-amber-300">
                                {email}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Email (только просмотр) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-white">
                            {t("booking_verify_email_label")}
                          </label>
                          <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 py-3 text-sm text-slate-300"
                          />
                          <p className="text-xs text-slate-400">
                            {t("booking_verify_email_wrong_hint")}
                          </p>
                        </div>

                        {!codeSent ? (
                          <div className="space-y-3">
                            <motion.button
                              type="button"
                              onClick={handleSendCode}
                              disabled={loading || !email}
                              whileHover={!loading ? { scale: 1.02 } : undefined}
                              whileTap={!loading ? { scale: 0.98 } : undefined}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)] disabled:opacity-50 disabled:shadow-none"
                            >
                              {loading ? (
                                <>
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                                  {t("booking_verify_email_sending")}
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-5 w-5" />
                                  {t("booking_verify_email_send_code")}
                                </>
                              )}
                            </motion.button>
                            <p className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock3 className="h-4 w-4 text-amber-300" />
                              {t("booking_verify_email_arrives_hint")}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-bold text-white">
                                {t("booking_verify_email_enter_code")}
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={(event) =>
                                  setCode(event.target.value.replace(/\D/g, ""))
                                }
                                placeholder="000000"
                                className="w-full rounded-2xl border border-amber-400/50 bg-slate-900/90 px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-white shadow-[0_0_20px_rgba(251,191,36,0.3)] focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                                autoFocus
                              />
                              <p className="text-xs text-slate-400">
                                {t("booking_verify_email_code_valid")}
                              </p>
                            </div>

                            <motion.button
                              type="button"
                              onClick={handleVerifyCode}
                              disabled={loading || code.length !== 6}
                              whileHover={!(loading || code.length !== 6) ? { scale: 1.02 } : undefined}
                              whileTap={!(loading || code.length !== 6) ? { scale: 0.98 } : undefined}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3.5 text-base font-bold text-white shadow-[0_0_30px_rgba(16,185,129,0.7)] transition-all hover:shadow-[0_0_40px_rgba(16,185,129,0.9)] disabled:opacity-50 disabled:shadow-none"
                            >
                              {loading ? (
                                <>
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                  {t("booking_verify_email_checking")}
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-5 w-5" />
                                  {t("booking_verify_email_confirm_code")}
                                </>
                              )}
                            </motion.button>

                            <button
                              type="button"
                              onClick={() => {
                                setCodeSent(false);
                                setCode("");
                                setError(null);
                                setSuccess(null);
                              }}
                              disabled={loading}
                              className="w-full rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {t("booking_verify_email_resend")}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Блок для Telegram */}
                    {selectedMethod === "telegram" && (
                      <motion.div
                        key="telegram-method"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TelegramVerification
                          email={email}
                          draftId={draftId}
                          loading={loading}
                          setLoading={setLoading}
                          error={error}
                          setError={setError}
                          success={success}
                          setSuccess={setSuccess}
                          code={code}
                          setCode={setCode}
                          onVerifySuccess={onVerifySuccess}
                        />
                      </motion.div>
                    )}

                    {/* Блок для Google */}
                    {selectedMethod === "google" && (
                      <motion.div
                        key="google-method"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <GoogleVerification
                          email={email}
                          draftId={draftId}
                          loading={loading}
                          setLoading={setLoading}
                          error={error}
                          setError={setError}
                          success={success}
                          setSuccess={setSuccess}
                          onVerifySuccess={onVerifySuccess}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Сообщения об ошибке/успехе */}
                  <div className="space-y-3 pt-2">
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          key="error"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl"
                        >
                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                          <span className="text-sm text-red-200">{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {success && (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 backdrop-blur-xl"
                        >
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                          <span className="text-sm text-emerald-200">{success}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Нижняя линия */}
                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
              </div>
            </div>
          </motion.section>

          {/* ПРЕМИУМ ИНФО-БЛОК */}
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="relative rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
              <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

              <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
                <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
                <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

                <div className="relative space-y-5">
                  <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                      <ShieldCheck className="h-5 w-5 text-cyan-300" />
                    </span>
                    <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                      {t("booking_verify_info_title")}
                    </span>
                  </h3>

                  <p className="text-sm text-slate-200/90 md:text-base">
                    {t("booking_verify_info_desc")}
                  </p>

                  <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      <Clock3 className="h-5 w-5 text-cyan-400" />
                      <span className="font-semibold">{t("booking_verify_info_arrives")}</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                        <span>{t("booking_verify_info_check_spam")}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                        <span>{t("booking_verify_info_check_email")}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                        <span>{t("booking_verify_info_resend_if_needed")}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {t("booking_verify_info_progress_title")}
                    </p>
                    <ol className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>{t("booking_verify_info_progress_1")}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>{t("booking_verify_info_progress_2")}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400">✓</span>
                        <span>{t("booking_verify_info_progress_3")}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span className="font-semibold text-cyan-300">
                          {t("booking_verify_info_progress_4")}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-slate-500">○</span>
                        <span className="text-slate-400">{t("booking_verify_info_progress_5")}</span>
                      </li>
                    </ol>
                  </div>

                  <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
                    {t("booking_verify_info_support")}
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
              </div>
            </div>
          </motion.aside>
        </div>
      </main>

      <VideoSection />
    </PageShell>
  );
}
