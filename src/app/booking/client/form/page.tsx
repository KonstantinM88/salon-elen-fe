// src/app/booking/client/form/page.tsx
"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import {
  ArrowLeft,
  Mail,
  User,
  Phone,
  CalendarDays,
  Info,
  ChevronDown,
  Sparkles,
  Crown,
  Check,
} from "lucide-react";
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
import { useTranslations } from "@/i18n/useTranslations";

/* ===================== Типы ===================== */

type EmailCheck =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok" }
  | { state: "fail"; reason?: string }
  | { state: "unavailable" };

type ReferralKind = "google" | "facebook" | "instagram" | "friends" | "other";

/* ===================== Утилиты ===================== */

function isValidEmailSyntax(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function yearsAgo(n: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d;
}

/* ===================== Floating Particles ===================== */
function FloatingParticles() {
  const [particles, setParticles] = React.useState<
    Array<{ x: number; y: number; id: number; color: string }>
  >([]);

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

/* ===================== Общий shell ===================== */

interface PageShellProps {
  children: React.ReactNode;
  bookingSteps: Array<{ id: string; label: string; icon: string }>;
}

function PageShell({ children, bookingSteps }: PageShellProps) {
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

      <div className="relative z-10 min-h-screen">
        {/* Хедер с прогресс-баром */}
        <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
            <PremiumProgressBar currentStep={3} steps={bookingSteps} />
          </div>
        </header>

        <div className="h-[84px] md:h-[96px]" />

        {children}
      </div>

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
          0%,
          100% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 0%;
          }
        }
      `}</style>
    </div>
  );
}

/* ===================== Видео-секция ===================== */

function VideoSection() {
  return (
    <section className="relative py-10 sm:py-12">
      <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
        <video
          className="h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%] bg-black"
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

        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
      </div>
    </section>
  );
}

/* ===================== Основная форма клиента ===================== */

function ClientForm(): React.JSX.Element {
  const params = useSearchParams();
  const router = useRouter();
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

  // Dynamic referral options with i18n
  const referralOptions = React.useMemo<{ value: ReferralKind; label: string; icon: string }[]>(() => [
    { value: "google", label: t("booking_client_form_referral_google"), icon: "🔍" },
    { value: "facebook", label: t("booking_client_form_referral_facebook"), icon: "📘" },
    { value: "instagram", label: t("booking_client_form_referral_instagram"), icon: "📸" },
    { value: "friends", label: t("booking_client_form_referral_friends"), icon: "👥" },
    { value: "other", label: t("booking_client_form_referral_other"), icon: "💭" },
  ], [t]);

  const serviceIds = React.useMemo<string[]>(
    () => params.getAll("s").filter(Boolean),
    [params]
  );
  const masterId = params.get("m") ?? "";
  const startISO = params.get("start") ?? "";
  const endISO = params.get("end") ?? "";

  const [name, setName] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("");
  const [emailCheck, setEmailCheck] = React.useState<EmailCheck>({
    state: "idle",
  });

  const [birth, setBirth] = React.useState<string>("");
  const [referral, setReferral] = React.useState<ReferralKind | "">("");
  const [referralOther, setReferralOther] = React.useState<string>("");
  const [comment, setComment] = React.useState<string>("");

  const [submitErr, setSubmitErr] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const [referralOpen, setReferralOpen] = React.useState(false);
  const referralBoxRef = React.useRef<HTMLDivElement | null>(null);

  // клик вне кастомного дропдауна
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!referralBoxRef.current) return;
      if (!referralBoxRef.current.contains(e.target as Node)) {
        setReferralOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Премиум-стили полей
  const fieldBase =
    "mt-2 w-full rounded-2xl border border-white/20 " +
    "bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/90 " +
    "px-4 py-3.5 text-sm md:text-base text-white/90 placeholder:text-white/40 " +
    "shadow-[0_0_20px_rgba(0,0,0,0.5)] " +
    "transition-all duration-300 " +
    "hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(251,191,36,0.3)] " +
    "focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/70 " +
    "backdrop-blur-sm";

  const fieldFilled =
    "border-amber-400/60 text-white " +
    "shadow-[0_0_20px_rgba(251,191,36,0.4)]";

  const fieldError =
    "border-red-500/80 ring-2 ring-red-500/60 " +
    "focus:ring-red-500/80 focus:border-red-500/90";

  const maxBirth = formatYMD(new Date());
  const minBirth = formatYMD(yearsAgo(120));
  const minAdult = formatYMD(yearsAgo(16));

  // Validation with i18n
  const nameErr = name.trim().length < 2 ? t("booking_client_form_error_name") : null;
  const phoneErr = phone.trim().length < 6 ? t("booking_client_form_error_phone") : null;

  const birthDate = birth ? new Date(birth + "T00:00:00") : null;
  let birthErr: string | null = null;
  if (!birth) birthErr = t("booking_client_form_error_birth_required");
  else if (birthDate && birthDate > new Date())
    birthErr = t("booking_client_form_error_birth_future");
  else if (birth && birth > minAdult)
    birthErr = t("booking_client_form_error_birth_underage");

  // E-mail обязателен
  let emailErr: string | null = null;
  if (!email) {
    emailErr = t("booking_client_form_error_email_required");
  } else if (!isValidEmailSyntax(email)) {
    emailErr = t("booking_client_form_error_email_invalid");
  } else if (emailCheck.state === "fail") {
    emailErr = emailCheck.reason ?? t("booking_client_form_error_email_not_verified");
  }

  const referralErr =
    referral === ""
      ? t("booking_client_form_error_referral")
      : referral === "other" && !referralOther.trim()
      ? t("booking_client_form_error_referral_other")
      : null;

  const baseDisabled = !serviceIds.length || !masterId || !startISO || !endISO;

  const formValid =
    !baseDisabled &&
    !nameErr &&
    !phoneErr &&
    !birthErr &&
    !emailErr &&
    !referralErr &&
    emailCheck.state !== "checking";

  // Проверка email с задержкой
  React.useEffect(() => {
    if (!email || !isValidEmailSyntax(email)) {
      setEmailCheck({ state: "idle" });
      return;
    }

    setEmailCheck({ state: "checking" });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/email-check?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) {
          setEmailCheck({ state: "unavailable" });
          return;
        }
        const data = await res.json();
        if (data.ok) {
          setEmailCheck({ state: "ok" });
        } else {
          setEmailCheck({ state: "fail", reason: data.reason });
        }
      } catch {
        setEmailCheck({ state: "unavailable" });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formValid || submitting) return;

    setSubmitting(true);
    setSubmitErr(null);

    try {
      const qs = new URLSearchParams();
      serviceIds.forEach((id) => qs.append("s", id));
      qs.set("m", masterId);
      qs.set("start", startISO);
      qs.set("end", endISO);

      const res = await fetch(`/api/booking/client?${qs.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          birthDateISO: birth || undefined,
          referral: referral === "other" ? "other" : referral || undefined,
          notes: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const result = await res.json();

      if (result.draftId) {
        const verifyQs = new URLSearchParams(qs);
        const verifyUrl = `/booking/verify?draft=${
          result.draftId
        }&email=${encodeURIComponent(email.trim())}&${verifyQs.toString()}`;

        router.push(verifyUrl);
      } else {
        throw new Error("Некорректный ответ от сервера");
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Не удалось перейти к проверке данных";
      setSubmitErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (baseDisabled) {
    return (
      <PageShell bookingSteps={BOOKING_STEPS}>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 backdrop-blur-xl">
            <p className="text-sm md:text-base text-red-200">
              {t("booking_client_form_invalid_params")}
            </p>
            <Link
              href="/booking"
              className="mt-4 inline-block text-sm text-amber-300 hover:text-amber-200 underline"
            >
              {t("booking_client_form_invalid_return")}
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const currentReferralOption = referralOptions.find(
    (o) => o.value === referral
  );
  const currentReferralLabel =
    currentReferralOption?.label ?? t("booking_client_form_referral_select");
  const currentReferralIcon = currentReferralOption?.icon ?? "📋";

  return (
    <PageShell bookingSteps={BOOKING_STEPS}>
      <main className="mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
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
                {t("booking_client_form_badge")}
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
              textShadow:
                "0 0 40px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.3)",
            }}
          >
            {t("booking_client_form_hero_title")}
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
            {t("booking_client_form_hero_subtitle")}
          </motion.p>

          {/* Декоративная линия */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0.8 }}
            animate={{
              scaleX: [1, 1.50, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              delay: 0.3,
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

        {/* Основной блок: форма + инфо-блок справа */}
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* ПРЕМИУМ ФОРМА */}
          <motion.form
            onSubmit={handleSubmit}
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
                  {/* Имя */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-bold text-white md:text-base"
                    >
                      {t("booking_client_form_label_name")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                        <User className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`${fieldBase} pl-12 ${
                          name ? fieldFilled : ""
                        } ${nameErr ? fieldError : ""}`}
                        placeholder={t("booking_client_form_placeholder_name")}
                        required
                      />
                    </div>
                    {nameErr && (
                      <div className="mt-1.5 text-xs text-red-400 md:text-sm">
                        {nameErr}
                      </div>
                    )}
                  </div>

                  {/* Телефон */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-bold text-white md:text-base"
                    >
                      {t("booking_client_form_label_phone")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                        <Phone className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`${fieldBase} pl-12 ${
                          phone ? fieldFilled : ""
                        } ${phoneErr ? fieldError : ""}`}
                        placeholder={t("booking_client_form_placeholder_phone")}
                        required
                      />
                    </div>
                    {phoneErr && (
                      <div className="mt-1.5 text-xs text-red-400 md:text-sm">
                        {phoneErr}
                      </div>
                    )}
                  </div>

                  {/* E-mail */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-white md:text-base"
                    >
                      {t("booking_client_form_label_email")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                        <Mail className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${fieldBase} pl-12 ${
                          email ? fieldFilled : ""
                        } ${emailErr ? fieldError : ""}`}
                        placeholder={t("booking_client_form_placeholder_email")}
                        required
                      />
                    </div>

                    {emailCheck.state === "checking" && (
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-cyan-300 md:text-sm">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                        {t("booking_client_form_email_checking")}
                      </div>
                    )}
                    {emailCheck.state === "ok" && !emailErr && (
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-emerald-400 md:text-sm">
                        <Check className="h-4 w-4" />
                        {t("booking_client_form_email_verified")}
                      </div>
                    )}
                    {emailErr && (
                      <div className="mt-1.5 text-xs text-red-400 md:text-sm">
                        {emailErr}
                      </div>
                    )}
                  </div>

                  {/* Дата рождения */}
                  <div>
                    <label
                      htmlFor="birth"
                      className="block text-sm font-bold text-white md:text-base"
                    >
                      {t("booking_client_form_label_birth")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                        <CalendarDays className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                      </div>
                      <input
                        id="birth"
                        type="date"
                        value={birth}
                        onChange={(e) => setBirth(e.target.value)}
                        min={minBirth}
                        max={maxBirth}
                        className={`${fieldBase} pl-12 ${
                          birth ? fieldFilled : ""
                        } ${birthErr ? fieldError : ""}`}
                        required
                      />
                    </div>
                    {birthErr && (
                      <div className="mt-1.5 text-xs text-red-400 md:text-sm">
                        {birthErr}
                      </div>
                    )}
                    <div className="mt-1.5 text-xs text-slate-400">
                      {t("booking_client_form_age_requirement")}
                    </div>
                  </div>

                  {/* Как узнали – премиум дропдаун */}
                  <div ref={referralBoxRef}>
                    <label
                      htmlFor="referral"
                      className="block text-sm font-bold text-white md:text-base"
                    >
                      {t("booking_client_form_label_referral")}{" "}
                      <span className="text-red-400">*</span>
                    </label>

                    <button
                      id="referral"
                      type="button"
                      onClick={() => setReferralOpen((o) => !o)}
                      className={`${fieldBase} flex items-center justify-between pl-4 pr-4 text-left ${
                        referral ? fieldFilled : ""
                      } ${referralErr ? fieldError : ""}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-xl">{currentReferralIcon}</span>
                        <span className="truncate">{currentReferralLabel}</span>
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-amber-400 transition-transform ${
                          referralOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {referralOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="relative z-30 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-white/20 bg-slate-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl"
                        >
                          <div className="py-1">
                            <button
                              type="button"
                              className="w-full px-4 py-2.5 text-left text-xs text-white/60 transition-colors hover:bg-amber-500/10 hover:text-amber-200 md:text-sm"
                              onClick={() => {
                                setReferral("");
                                setReferralOther("");
                                setReferralOpen(false);
                              }}
                            >
                              {t("booking_client_form_referral_select")}
                            </button>

                            {referralOptions.map((opt) => {
                              const isActive = referral === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  className={`w-full px-4 py-2.5 text-left text-xs transition-colors md:text-sm ${
                                    isActive
                                      ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-100"
                                      : "text-white/85 hover:bg-amber-500/10 hover:text-amber-200"
                                  }`}
                                  onClick={() => {
                                    setReferral(opt.value);
                                    setReferralOpen(false);
                                  }}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-base">
                                      {opt.icon}
                                    </span>
                                    <span>{opt.label}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {referral === "other" && (
                      <div className="relative mt-3">
                        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                          <Info className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                        </div>
                        <input
                          type="text"
                          value={referralOther}
                          onChange={(e) => setReferralOther(e.target.value)}
                          placeholder={t("booking_client_form_placeholder_referral_other")}
                          className={`${fieldBase} pl-12 ${
                            referralOther ? fieldFilled : ""
                          }`}
                        />
                      </div>
                    )}

                    {referralErr && (
                      <div className="mt-1.5 text-xs text-red-400 md:text-sm">
                        {referralErr}
                      </div>
                    )}
                  </div>

                  {/* Комментарий */}
                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-sm font-bold text-white md:text-base"
                    >
                      {t("booking_client_form_label_comment")}{" "}
                      <span className="font-normal text-slate-400">
                        {t("booking_client_form_label_optional")}
                      </span>
                    </label>
                    <textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className={`${fieldBase} resize-none align-top ${
                        comment ? fieldFilled : ""
                      }`}
                      placeholder={t("booking_client_form_placeholder_comment")}
                    />
                  </div>

                  {/* Ошибка отправки */}
                  {submitErr && (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl">
                      <div className="text-sm text-red-200 md:text-base">
                        {submitErr}
                      </div>
                    </div>
                  )}

                  {/* Кнопки */}
                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                    <motion.button
                      type="button"
                      onClick={() => router.back()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-5 py-3 text-sm text-white/90 transition-all hover:border-amber-400/50 hover:bg-white/5 md:text-base"
                      disabled={submitting}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t("booking_client_form_button_back")}
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={!formValid || submitting}
                      whileHover={
                        !(!formValid || submitting)
                          ? { scale: 1.02 }
                          : undefined
                      }
                      whileTap={
                        !(!formValid || submitting)
                          ? { scale: 0.98 }
                          : undefined
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-sm font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)] disabled:opacity-50 disabled:shadow-none md:text-base"
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                          {t("booking_client_form_button_submitting")}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          {t("booking_client_form_button_submit")}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Нижняя линия */}
                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
              </div>
            </div>
          </motion.form>

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

                <div className="relative">
                  <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic leading-tight md:text-2xl lg:text-3xl">
                    <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                      <Mail className="h-5 w-5 text-cyan-300" />
                    </span>
                    <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                      {t("booking_client_form_info_title")}
                    </span>
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-200/90 md:text-base">
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                      <span>
                        {t("booking_client_form_info_point_1")}{" "}
                        <span className="font-semibold text-cyan-300">
                          {t("booking_client_form_info_point_1_highlight")}
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                      <span>
                        {t("booking_client_form_info_point_2")}{" "}
                        <span className="font-semibold text-cyan-300">
                          {t("booking_client_form_info_point_2_highlight")}
                        </span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                      <span>
                        {t("booking_client_form_info_point_3")}
                      </span>
                    </li>
                    <li className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-400 md:text-sm">
                      {t("booking_client_form_info_point_3")}
                    </li>
                  </ul>
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

/* ===================== Export ===================== */

export default function ClientPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950/95 to-black">
          <div className="h-24 w-24 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-500 shadow-[0_0_40px_rgba(251,191,36,0.6)]" />
        </div>
      }
    >
      <ClientForm />
    </Suspense>
  );
}