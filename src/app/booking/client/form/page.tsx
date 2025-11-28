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
} from "lucide-react";
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";

/* ===================== Типы ===================== */

type EmailCheck =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok" }
  | { state: "fail"; reason?: string }
  | { state: "unavailable" };

type ReferralKind = "google" | "facebook" | "instagram" | "friends" | "other";

const referralOptions: { value: ReferralKind; label: string }[] = [
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "friends", label: "Рекомендация друзей" },
  { value: "other", label: "Другое" },
];

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

/* ===================== Общий shell как на других шагах ===================== */

const BOOKING_STEPS = [
  { id: "services", label: "Услуга", icon: "✨" },
  { id: "master", label: "Мастер", icon: "👤" },
  { id: "calendar", label: "Дата", icon: "📅" },
  { id: "client", label: "Данные", icon: "📝" },
  { id: "verify", label: "Проверка", icon: "✓" },
  { id: "payment", label: "Оплата", icon: "💳" },
];

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden text-white">
      {/* общий анимированный фон */}
      <BookingAnimatedBackground />

      {/* всё содержимое поверх фона */}
      <div className="relative z-10 min-h-screen">
        {/* Хедер с прогресс-баром */}
        <header className="booking-header fixed top-0 inset-x-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
            <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
          </div>
        </header>

        {/* отступ под фиксированный хедер */}
        <div className="h-[84px] md:h-[96px]" />

        {children}
      </div>
    </div>
  );
}

/* ===================== Видео-секция с логотипом ===================== */

function VideoSection() {
  return (
    <section className="relative py-10 sm:py-12">
      <div
        className="
          relative mx-auto w-full max-w-screen-2xl
          aspect-[16/9]
          rounded-2xl overflow-hidden
          border border-white/10
          shadow-[0_0_80px_rgba(255,215,0,.12)]
          bg-black
        "
      >
        <video
          className="
            h-full w-full
            object-contain 2xl:object-cover
            object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]
            bg-black
          "
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

        {/* лёгкое обрамление сверху — не закрывает видео */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
      </div>
    </section>
  );
}


/* ===================== Основная форма клиента ===================== */

function ClientForm(): React.JSX.Element {
  const params = useSearchParams();
  const router = useRouter();

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
    "mt-2 w-full rounded-2xl border border-white/14 " +
    "bg-gradient-to-r from-[#101827] via-[#020617] to-[#020617] " +
    "px-4 py-3 text-sm md:text-base text-white/90 placeholder:text-white/40 " +
    "shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_32px_rgba(0,0,0,0.9)] " +
    "transition-all " +
    "hover:border-amber-300/70 hover:shadow-[0_0_25px_rgba(245,197,24,0.35)] " +
    "focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-300";

  const fieldFilled =
    "bg-gradient-to-r from-[#152238] via-[#030712] to-[#030712] " +
    "border-amber-300/80 text-[#EAF4FF] " +
    "shadow-[0_0_32px_rgba(245,197,24,0.7)]";

  const fieldError =
    "border-red-500/80 ring-2 ring-red-500/80 " +
    "focus:ring-red-500/90 focus:border-red-500/90";

  const maxBirth = formatYMD(new Date());
  const minBirth = formatYMD(yearsAgo(120));
  const minAdult = formatYMD(yearsAgo(16));

  const nameErr = name.trim().length < 2 ? "Укажите имя полностью" : null;
  const phoneErr =
    phone.trim().length < 6 ? "Укажите корректный номер телефона" : null;

  const birthDate = birth ? new Date(birth + "T00:00:00") : null;
  let birthErr: string | null = null;
  if (!birth) birthErr = "Дата рождения обязательна";
  else if (birthDate && birthDate > new Date())
    birthErr = "Дата в будущем недопустима";
  else if (birth && birth > minAdult)
    birthErr = "Для онлайн-записи требуется возраст 16+";

  // E-mail обязателен
  let emailErr: string | null = null;
  if (!email) {
    emailErr = "E-mail обязателен";
  } else if (!isValidEmailSyntax(email)) {
    emailErr = "Некорректный e-mail";
  } else if (emailCheck.state === "fail") {
    emailErr = emailCheck.reason ?? "E-mail не подтвержден";
  }

  const referralErr =
    referral === ""
      ? "Выберите вариант"
      : referral === "other" && !referralOther.trim()
      ? "Уточните источник"
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

  /**
   * Сабмит на этом шаге:
   *  - проверяет данные и создаёт черновик,
   *  - затем переводит на /booking/verify,
   *  где уже идёт окончательная валидация и подтверждение.
   */
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
      <PageShell>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
            <p className="text-sm md:text-base text-red-200">
              Некорректные параметры. Пожалуйста, начните запись заново.
            </p>
            <Link
              href="/booking"
              className="mt-4 inline-block text-sm text-amber-300 hover:text-amber-200 underline"
            >
              Вернуться к выбору услуг
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const currentReferralLabel =
    referralOptions.find((o) => o.value === referral)?.label ??
    "Выберите вариант";

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 pb-24">
        {/* Заголовок и подзаголовок */}
        <div className="w-full flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative inline-block mt-5 md:mt-6 mb-6 md:mb-7"
          >
            <div className="absolute -inset-2 rounded-full blur-xl opacity-60 bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40" />
            <div
              className="
                relative flex items-center gap-2
                px-6 md:px-8 py-2.5 md:py-3
                rounded-full border border-white/15
                bg-gradient-to-r from-amber-500/70 via-yellow-500/70 to-amber-500/70
                text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)]
                backdrop-blur-sm
              "
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/15">
                <User className="w-4 h-4 text-black/80" />
              </span>
              <span className="font-serif italic tracking-wide text-sm md:text-base">
                Шаг 4 — Ваши контактные данные
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="
              mx-auto text-center
              text-4xl md:text-5xl lg:text-5xl xl:text-6xl
              font-serif italic leading-tight
              mb-3 md:mb-4
              text-transparent bg-clip-text
              bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
              drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
            "
          >
            Онлайн-запись
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl flex items-center justify-center gap-3 md:gap-4"
          >
            <Mail className="w-5 h-5 text-sky-200/90 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
            <p
              className="
                font-serif tracking-wide
                text-lg md:text-xl text-center
                text-transparent bg-clip-text
                bg-gradient-to-r from-[#6DDCFF] via-[#7F5DFF] to-[#FF4FD8]
                drop-shadow-[0_0_22px_rgba(80,180,255,0.9)]
                uppercase
              "
            >
              УКАЖИТЕ ВАШИ ДАННЫЕ, ЧТОБЫ МЫ ПОДТВЕРДИЛИ БРОНЬ И ОТПРАВИЛИ ДЕТАЛИ
              ЗАПИСИ.
            </p>
            <Mail className="w-5 h-5 text-fuchsia-200/90 drop-shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
          </motion.div>
        </div>

        {/* Основной блок: форма + инфо-блок справа */}
        <div className="mt-8 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6 md:gap-8 items-start">
          {/* Форма слева */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="
              relative rounded-3xl border border-white/12
              bg-gradient-to-br from-black/80 via-black/70 to-black/85
              p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]
              space-y-6
            "
          >
            {/* Имя */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm md:text-base font-medium text-white/85"
              >
                Имя <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${fieldBase} pl-10 ${name ? fieldFilled : ""} ${
                    nameErr ? fieldError : ""
                  }`}
                  placeholder="Ваше полное имя"
                  required
                />
              </div>
              {nameErr && (
                <p className="mt-1 text-xs md:text-sm text-red-400">
                  {nameErr}
                </p>
              )}
            </div>

            {/* Телефон */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm md:text-base font-medium text-white/85"
              >
                Телефон <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`${fieldBase} pl-10 ${phone ? fieldFilled : ""} ${
                    phoneErr ? fieldError : ""
                  }`}
                  placeholder="+49 (xxx) xxx-xx-xx"
                  required
                />
              </div>
              {phoneErr && (
                <p className="mt-1 text-xs md:text-sm text-red-400">
                  {phoneErr}
                </p>
              )}
            </div>

            {/* E-mail (обязателен) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm md:text-base font-medium text-white/85"
              >
                E-mail <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${fieldBase} pl-10 ${email ? fieldFilled : ""} ${
                    emailErr ? fieldError : ""
                  }`}
                  placeholder="your@email.com"
                  required
                />
              </div>

              {emailCheck.state === "checking" && (
                <p className="mt-1 text-xs md:text-sm text-white/60">
                  Проверка e-mail…
                </p>
              )}
              {emailCheck.state === "ok" && !emailErr && (
                <p className="mt-1 text-xs md:text-sm text-emerald-400">
                  ✓ E-mail подтверждён
                </p>
              )}
              {emailErr && (
                <p className="mt-1 text-xs md:text-sm text-red-400">
                  {emailErr}
                </p>
              )}
            </div>

            {/* Дата рождения */}
            <div>
              <label
                htmlFor="birth"
                className="block text-sm md:text-base font-medium text-white/85"
              >
                Дата рождения <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
                <input
                  id="birth"
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  min={minBirth}
                  max={maxBirth}
                  className={`${fieldBase} pl-10 ${birth ? fieldFilled : ""} ${
                    birthErr ? fieldError : ""
                  }`}
                  required
                />
              </div>
              {birthErr && (
                <p className="mt-1 text-xs md:text-sm text-red-400">
                  {birthErr}
                </p>
              )}
              <p className="mt-1 text-xs text-white/55">
                Для онлайн-записи требуется возраст 16+
              </p>
            </div>

            {/* Как узнали о нас – кастомный премиальный дропдаун */}
            <div ref={referralBoxRef}>
              <label
                htmlFor="referral"
                className="block text-sm md:text-base font-medium text-white/85"
              >
                Как вы узнали о нас? <span className="text-red-400">*</span>
              </label>

              <button
                id="referral"
                type="button"
                onClick={() => setReferralOpen((o) => !o)}
                className={`${fieldBase} pl-10 pr-10 text-left flex items-center justify-between ${
                  referral ? fieldFilled : ""
                } ${referralErr ? fieldError : ""}`}
              >
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-amber-200/80" />
                  <span className="truncate">{currentReferralLabel}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-amber-200/80 transition-transform ${
                    referralOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {referralOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 8, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="
                      relative z-30
                      rounded-2xl border border-white/14
                      bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617]
                      shadow-[0_18px_40px_rgba(0,0,0,0.85)]
                      mt-1.5 overflow-hidden
                      max-h-60 overflow-y-auto
                    "
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        className="
                          w-full text-left px-4 py-2 text-xs md:text-sm
                          text-white/70 hover:text-amber-200
                          hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-400/5
                          transition-colors
                        "
                        onClick={() => {
                          setReferral("");
                          setReferralOther("");
                          setReferralOpen(false);
                        }}
                      >
                        Выберите вариант
                      </button>

                      {referralOptions.map((opt) => {
                        const isActive = referral === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            className={`
                              w-full text-left px-4 py-2 text-xs md:text-sm
                              transition-colors
                              ${
                                isActive
                                  ? "bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-yellow-400/10 text-amber-100"
                                  : "text-white/85 hover:text-amber-200 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-400/5"
                              }
                            `}
                            onClick={() => {
                              setReferral(opt.value);
                              setReferralOpen(false);
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {referral === "other" && (
                <div className="mt-3 relative">
                  <Info className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
                  <input
                    type="text"
                    value={referralOther}
                    onChange={(e) => setReferralOther(e.target.value)}
                    placeholder="Уточните источник"
                    className={`${fieldBase} pl-10 ${
                      referralOther ? fieldFilled : ""
                    }`}
                  />
                </div>
              )}

              {referralErr && (
                <p className="mt-1 text-xs md:text-sm text-red-400">
                  {referralErr}
                </p>
              )}
            </div>

            {/* Комментарий */}
            <div>
              <label
                htmlFor="comment"
                className="block text-sm md:text-base font-medium text-white/85"
              >
                Комментарий{" "}
                <span className="text-white/50">(необязательно)</span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className={`${fieldBase} align-top ${
                  comment ? fieldFilled : ""
                }`}
                placeholder="Дополнительная информация или пожелания"
              />
            </div>

            {/* Ошибка отправки / перехода */}
            {submitErr && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
                <p className="text-sm md:text-base text-red-200">{submitErr}</p>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-2xl border border-white/20 px-5 py-2.5
                  text-sm md:text-base text-white/90
                  hover:bg-white/10 hover:border-amber-300/70
                  transition-all
                "
                disabled={submitting}
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </button>
              <button
                type="submit"
                disabled={!formValid || submitting}
                className="
                  flex-1 inline-flex items-center justify-center
                  rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
                  px-6 py-3 text-sm md:text-base font-semibold text-black
                  shadow-[0_0_32px_rgba(245,197,24,0.7)]
                  hover:shadow-[0_0_42px_rgba(245,197,24,0.9)]
                  disabled:opacity-50 disabled:shadow-none
                  transition-all
                "
              >
                {submitting ? "Проверка данных…" : "Забронировать"}
              </button>
            </div>
          </motion.form>

          {/* Инфо-блок про e-mail справа */}
          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="
              relative rounded-3xl border border-white/12
              bg-gradient-to-br from-black/80 via-slate-900/80 to-black/90
              p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]
              text-sm md:text-base
            "
          >
            <div className="pointer-events-none absolute -top-24 right-0 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <h3 className="flex items-center gap-2 text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 border border-yellow-300/70">
                  <Mail className="w-4 h-4 text-yellow-300" />
                </span>
                <span>Почему мы просим e-mail?</span>
              </h3>
              <ul className="space-y-3 text-white/80 text-sm md:text-base">
                <li>
                  На ваш e-mail мы отправим{" "}
                  <span className="text-amber-300">
                    подтверждение брони и все детали записи
                  </span>
                  .
                </li>
                <li>
                  Вы получите{" "}
                  <span className="text-amber-300">
                    напоминание перед визитом
                  </span>
                  , чтобы ничего не забыть.
                </li>
                <li>
                  Мы бережно относимся к персональным данным и используем ваш
                  e-mail только для обслуживания вашей записи.
                </li>
                <li className="text-white/70 text-xs md:text-sm pt-1 border-t border-white/10 mt-3">
                  Если вы допустите ошибку в адресе, вы всё равно сможете прийти
                  на приём, но не получите напоминания и подтверждения.
                </li>
              </ul>
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
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      }
    >
      <ClientForm />
    </Suspense>
  );
}




//-----уже с фоном но нужно изменить контейнер для видео----
// // src/app/booking/client/form/page.tsx
// "use client";

// import * as React from "react";
// import { Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   ArrowLeft,
//   Mail,
//   User,
//   Phone,
//   CalendarDays,
//   Info,
//   ChevronDown,
// } from "lucide-react";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";

// /* ===================== Типы ===================== */

// type EmailCheck =
//   | { state: "idle" }
//   | { state: "checking" }
//   | { state: "ok" }
//   | { state: "fail"; reason?: string }
//   | { state: "unavailable" };

// type ReferralKind = "google" | "facebook" | "instagram" | "friends" | "other";

// const referralOptions: { value: ReferralKind; label: string }[] = [
//   { value: "google", label: "Google" },
//   { value: "facebook", label: "Facebook" },
//   { value: "instagram", label: "Instagram" },
//   { value: "friends", label: "Рекомендация друзей" },
//   { value: "other", label: "Другое" },
// ];

// /* ===================== Утилиты ===================== */

// function isValidEmailSyntax(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// function formatYMD(d: Date): string {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// }

// function yearsAgo(n: number): Date {
//   const d = new Date();
//   d.setFullYear(d.getFullYear() - n);
//   return d;
// }

// /* ===================== Общий shell как на других шагах ===================== */

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative min-h-screen bg-black overflow-hidden text-white">
//       {/* наш общий анимированный фон */}
//       <BookingAnimatedBackground />

//       {/* всё содержимое поверх фона */}
//       <div className="relative z-10 min-h-screen">
//         {/* Хедер с прогресс-баром */}
//         <header className="booking-header fixed top-0 inset-x-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
//           <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//             <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//           </div>
//         </header>

//         {/* отступ под фиксированный хедер */}
//         <div className="h-[84px] md:h-[96px]" />

//         {children}
//       </div>
//     </div>
//   );
// }

// /* ===================== Видео-секция с логотипом ===================== */

// function VideoSection() {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)]">
//         <video
//           className="
//             absolute inset-0 h-full w-full
//             object-contain 2xl:object-cover
//             object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]
//           "
//           autoPlay
//           muted
//           loop
//           playsInline
//           preload="metadata"
//           poster="/fallback-poster.jpg"
//           aria-hidden="true"
//         >
//           <source src="/SE-logo-video-master.webm" type="video/webm" />
//           <source src="/SE-logo-video-master.mp4" type="video/mp4" />
//         </video>
//         <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/10 pointer-events-none" />
//       </div>
//     </section>
//   );
// }

// /* ===================== Основная форма клиента ===================== */

// function ClientForm(): React.JSX.Element {
//   const params = useSearchParams();
//   const router = useRouter();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll("s").filter(Boolean),
//     [params]
//   );
//   const masterId = params.get("m") ?? "";
//   const startISO = params.get("start") ?? "";
//   const endISO = params.get("end") ?? "";

//   const [name, setName] = React.useState<string>("");
//   const [phone, setPhone] = React.useState<string>("");
//   const [email, setEmail] = React.useState<string>("");
//   const [emailCheck, setEmailCheck] = React.useState<EmailCheck>({
//     state: "idle",
//   });

//   const [birth, setBirth] = React.useState<string>("");
//   const [referral, setReferral] = React.useState<ReferralKind | "">("");
//   const [referralOther, setReferralOther] = React.useState<string>("");
//   const [comment, setComment] = React.useState<string>("");

//   const [submitErr, setSubmitErr] = React.useState<string | null>(null);
//   const [submitting, setSubmitting] = React.useState<boolean>(false);

//   const [referralOpen, setReferralOpen] = React.useState(false);
//   const referralBoxRef = React.useRef<HTMLDivElement | null>(null);

//   // клик вне кастомного дропдауна
//   React.useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (!referralBoxRef.current) return;
//       if (!referralBoxRef.current.contains(e.target as Node)) {
//         setReferralOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   // Премиум-стили полей
//   const fieldBase =
//     "mt-2 w-full rounded-2xl border border-white/14 " +
//     "bg-gradient-to-r from-[#101827] via-[#020617] to-[#020617] " +
//     "px-4 py-3 text-sm md:text-base text-white/90 placeholder:text-white/40 " +
//     "shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_32px_rgba(0,0,0,0.9)] " +
//     "transition-all " +
//     "hover:border-amber-300/70 hover:shadow-[0_0_25px_rgba(245,197,24,0.35)] " +
//     "focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-300";

//   const fieldFilled =
//     "bg-gradient-to-r from-[#152238] via-[#030712] to-[#030712] " +
//     "border-amber-300/80 text-[#EAF4FF] " +
//     "shadow-[0_0_32px_rgba(245,197,24,0.7)]";

//   const fieldError =
//     "border-red-500/80 ring-2 ring-red-500/80 " +
//     "focus:ring-red-500/90 focus:border-red-500/90";

//   const maxBirth = formatYMD(new Date());
//   const minBirth = formatYMD(yearsAgo(120));
//   const minAdult = formatYMD(yearsAgo(16));

//   const nameErr = name.trim().length < 2 ? "Укажите имя полностью" : null;
//   const phoneErr =
//     phone.trim().length < 6 ? "Укажите корректный номер телефона" : null;

//   const birthDate = birth ? new Date(birth + "T00:00:00") : null;
//   let birthErr: string | null = null;
//   if (!birth) birthErr = "Дата рождения обязательна";
//   else if (birthDate && birthDate > new Date())
//     birthErr = "Дата в будущем недопустима";
//   else if (birth && birth > minAdult)
//     birthErr = "Для онлайн-записи требуется возраст 16+";

//   // E-mail обязателен
//   let emailErr: string | null = null;
//   if (!email) {
//     emailErr = "E-mail обязателен";
//   } else if (!isValidEmailSyntax(email)) {
//     emailErr = "Некорректный e-mail";
//   } else if (emailCheck.state === "fail") {
//     emailErr = emailCheck.reason ?? "E-mail не подтвержден";
//   }

//   const referralErr =
//     referral === ""
//       ? "Выберите вариант"
//       : referral === "other" && !referralOther.trim()
//       ? "Уточните источник"
//       : null;

//   const baseDisabled = !serviceIds.length || !masterId || !startISO || !endISO;

//   const formValid =
//     !baseDisabled &&
//     !nameErr &&
//     !phoneErr &&
//     !birthErr &&
//     !emailErr &&
//     !referralErr &&
//     emailCheck.state !== "checking";

//   // Проверка email с задержкой
//   React.useEffect(() => {
//     if (!email || !isValidEmailSyntax(email)) {
//       setEmailCheck({ state: "idle" });
//       return;
//     }

//     setEmailCheck({ state: "checking" });
//     const timer = setTimeout(async () => {
//       try {
//         const res = await fetch(
//           `/api/email-check?email=${encodeURIComponent(email)}`
//         );
//         if (!res.ok) {
//           setEmailCheck({ state: "unavailable" });
//           return;
//         }
//         const data = await res.json();
//         if (data.ok) {
//           setEmailCheck({ state: "ok" });
//         } else {
//           setEmailCheck({ state: "fail", reason: data.reason });
//         }
//       } catch {
//         setEmailCheck({ state: "unavailable" });
//       }
//     }, 800);

//     return () => clearTimeout(timer);
//   }, [email]);

//   /**
//    * Сабмит на этом шаге:
//    *  - проверяет данные и создаёт черновик,
//    *  - затем переводит на /booking/verify,
//    *  где уже идёт окончательная валидация и подтверждение.
//    */
//   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
//     e.preventDefault();
//     if (!formValid || submitting) return;

//     setSubmitting(true);
//     setSubmitErr(null);

//     try {
//       const qs = new URLSearchParams();
//       serviceIds.forEach((id) => qs.append("s", id));
//       qs.set("m", masterId);
//       qs.set("start", startISO);
//       qs.set("end", endISO);

//       const res = await fetch(`/api/booking/client?${qs.toString()}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           customerName: name.trim(),
//           phone: phone.trim(),
//           email: email.trim(),
//           birthDateISO: birth || undefined,
//           referral: referral === "other" ? "other" : referral || undefined,
//           notes: comment.trim() || undefined,
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data.error || `HTTP ${res.status}`);
//       }

//       const result = await res.json();

//       if (result.draftId) {
//         const verifyQs = new URLSearchParams(qs);
//         const verifyUrl = `/booking/verify?draft=${
//           result.draftId
//         }&email=${encodeURIComponent(email.trim())}&${verifyQs.toString()}`;

//         router.push(verifyUrl);
//       } else {
//         throw new Error("Некорректный ответ от сервера");
//       }
//     } catch (err) {
//       const msg =
//         err instanceof Error
//           ? err.message
//           : "Не удалось перейти к проверке данных";
//       setSubmitErr(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (baseDisabled) {
//     return (
//       <PageShell>
//         <div className="mx-auto max-w-2xl px-4 py-12">
//           <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
//             <p className="text-sm md:text-base text-red-200">
//               Некорректные параметры. Пожалуйста, начните запись заново.
//             </p>
//             <Link
//               href="/booking"
//               className="mt-4 inline-block text-sm text-amber-300 hover:text-amber-200 underline"
//             >
//               Вернуться к выбору услуг
//             </Link>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   const currentReferralLabel =
//     referralOptions.find((o) => o.value === referral)?.label ??
//     "Выберите вариант";

//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 pb-24">
//         {/* Заголовок и подзаголовок */}
//         <div className="w-full flex flex-col items-center text-center">
//           <motion.div
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 26 }}
//             className="relative inline-block mt-5 md:mt-6 mb-6 md:mb-7"
//           >
//             <div className="absolute -inset-2 rounded-full blur-xl opacity-60 bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40" />
//             <div
//               className="
//                 relative flex items-center gap-2
//                 px-6 md:px-8 py-2.5 md:py-3
//                 rounded-full border border-white/15
//                 bg-gradient-to-r from-amber-500/70 via-yellow-500/70 to-amber-500/70
//                 text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)]
//                 backdrop-blur-sm
//               "
//             >
//               <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/15">
//                 <User className="w-4 h-4 text-black/80" />
//               </span>
//               <span className="font-serif italic tracking-wide text-sm md:text-base">
//                 Шаг 4 — Ваши контактные данные
//               </span>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="
//               mx-auto text-center
//               text-4xl md:text-5xl lg:text-5xl xl:text-6xl
//               font-serif italic leading-tight
//               mb-3 md:mb-4
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//               drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//             "
//           >
//             Онлайн-запись
//           </motion.h1>

//           <motion.div
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="mx-auto max-w-3xl flex items-center justify-center gap-3 md:gap-4"
//           >
//             <Mail className="w-5 h-5 text-sky-200/90 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
//             <p
//               className="
//                 font-serif tracking-wide
//                 text-lg md:text-xl text-center
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#6DDCFF] via-[#7F5DFF] to-[#FF4FD8]
//                 drop-shadow-[0_0_22px_rgba(80,180,255,0.9)]
//                 uppercase
//               "
//             >
//               УКАЖИТЕ ВАШИ ДАННЫЕ, ЧТОБЫ МЫ ПОДТВЕРДИЛИ БРОНЬ И ОТПРАВИЛИ ДЕТАЛИ
//               ЗАПИСИ.
//             </p>
//             <Mail className="w-5 h-5 text-fuchsia-200/90 drop-shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
//           </motion.div>
//         </div>

//         {/* Основной блок: форма + инфо-блок справа */}
//         <div className="mt-8 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6 md:gap-8 items-start">
//           {/* Форма слева */}
//           <motion.form
//             onSubmit={handleSubmit}
//             initial={{ opacity: 0, x: -18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.25 }}
//             className="
//               relative rounded-3xl border border-white/12
//               bg-gradient-to-br from-black/80 via-black/70 to-black/85
//               p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]
//               space-y-6
//             "
//           >
//             {/* Имя */}
//             <div>
//               <label
//                 htmlFor="name"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Имя <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                 <input
//                   id="name"
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className={`${fieldBase} pl-10 ${name ? fieldFilled : ""} ${
//                     nameErr ? fieldError : ""
//                   }`}
//                   placeholder="Ваше полное имя"
//                   required
//                 />
//               </div>
//               {nameErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {nameErr}
//                 </p>
//               )}
//             </div>

//             {/* Телефон */}
//             <div>
//               <label
//                 htmlFor="phone"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Телефон <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                 <input
//                   id="phone"
//                   type="tel"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   className={`${fieldBase} pl-10 ${phone ? fieldFilled : ""} ${
//                     phoneErr ? fieldError : ""
//                   }`}
//                   placeholder="+49 (xxx) xxx-xx-xx"
//                   required
//                 />
//               </div>
//               {phoneErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {phoneErr}
//                 </p>
//               )}
//             </div>

//             {/* E-mail (обязателен) */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 E-mail <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className={`${fieldBase} pl-10 ${email ? fieldFilled : ""} ${
//                     emailErr ? fieldError : ""
//                   }`}
//                   placeholder="your@email.com"
//                   required
//                 />
//               </div>

//               {emailCheck.state === "checking" && (
//                 <p className="mt-1 text-xs md:text-sm text-white/60">
//                   Проверка e-mail…
//                 </p>
//               )}
//               {emailCheck.state === "ok" && !emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-emerald-400">
//                   ✓ E-mail подтверждён
//                 </p>
//               )}
//               {emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {emailErr}
//                 </p>
//               )}
//             </div>

//             {/* Дата рождения */}
//             <div>
//               <label
//                 htmlFor="birth"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Дата рождения <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                 <input
//                   id="birth"
//                   type="date"
//                   value={birth}
//                   onChange={(e) => setBirth(e.target.value)}
//                   min={minBirth}
//                   max={maxBirth}
//                   className={`${fieldBase} pl-10 ${birth ? fieldFilled : ""} ${
//                     birthErr ? fieldError : ""
//                   }`}
//                   required
//                 />
//               </div>
//               {birthErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {birthErr}
//                 </p>
//               )}
//               <p className="mt-1 text-xs text-white/55">
//                 Для онлайн-записи требуется возраст 16+
//               </p>
//             </div>

//             {/* Как узнали о нас – кастомный премиальный дропдаун */}
//             <div ref={referralBoxRef}>
//               <label
//                 htmlFor="referral"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Как вы узнали о нас? <span className="text-red-400">*</span>
//               </label>

//               <button
//                 id="referral"
//                 type="button"
//                 onClick={() => setReferralOpen((o) => !o)}
//                 className={`${fieldBase} pl-10 pr-10 text-left flex items-center justify-between ${
//                   referral ? fieldFilled : ""
//                 } ${referralErr ? fieldError : ""}`}
//               >
//                 <span className="flex items-center gap-2">
//                   <Info className="h-4 w-4 text-amber-200/80" />
//                   <span className="truncate">{currentReferralLabel}</span>
//                 </span>
//                 <ChevronDown
//                   className={`h-4 w-4 text-amber-200/80 transition-transform ${
//                     referralOpen ? "rotate-180" : ""
//                   }`}
//                 />
//               </button>

//               <AnimatePresence>
//                 {referralOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 4, scale: 0.98 }}
//                     animate={{ opacity: 1, y: 8, scale: 1 }}
//                     exit={{ opacity: 0, y: 4, scale: 0.98 }}
//                     transition={{ duration: 0.16 }}
//                     className="
//                       relative z-30
//                       rounded-2xl border border-white/14
//                       bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617]
//                       shadow-[0_18px_40px_rgba(0,0,0,0.85)]
//                       mt-1.5 overflow-hidden
//                       max-h-60 overflow-y-auto
//                     "
//                   >
//                     <div className="py-1">
//                       <button
//                         type="button"
//                         className="
//                           w-full text-left px-4 py-2 text-xs md:text-sm
//                           text-white/70 hover:text-amber-200
//                           hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-400/5
//                           transition-colors
//                         "
//                         onClick={() => {
//                           setReferral("");
//                           setReferralOther("");
//                           setReferralOpen(false);
//                         }}
//                       >
//                         Выберите вариант
//                       </button>

//                       {referralOptions.map((opt) => {
//                         const isActive = referral === opt.value;
//                         return (
//                           <button
//                             key={opt.value}
//                             type="button"
//                             className={`
//                               w-full text-left px-4 py-2 text-xs md:text-sm
//                               transition-colors
//                               ${
//                                 isActive
//                                   ? "bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-yellow-400/10 text-amber-100"
//                                   : "text-white/85 hover:text-amber-200 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-400/5"
//                               }
//                             `}
//                             onClick={() => {
//                               setReferral(opt.value);
//                               setReferralOpen(false);
//                             }}
//                           >
//                             {opt.label}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {referral === "other" && (
//                 <div className="mt-3 relative">
//                   <Info className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                   <input
//                     type="text"
//                     value={referralOther}
//                     onChange={(e) => setReferralOther(e.target.value)}
//                     placeholder="Уточните источник"
//                     className={`${fieldBase} pl-10 ${
//                       referralOther ? fieldFilled : ""
//                     }`}
//                   />
//                 </div>
//               )}

//               {referralErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {referralErr}
//                 </p>
//               )}
//             </div>

//             {/* Комментарий */}
//             <div>
//               <label
//                 htmlFor="comment"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Комментарий{" "}
//                 <span className="text-white/50">(необязательно)</span>
//               </label>
//               <textarea
//                 id="comment"
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 rows={3}
//                 className={`${fieldBase} align-top ${
//                   comment ? fieldFilled : ""
//                 }`}
//                 placeholder="Дополнительная информация или пожелания"
//               />
//             </div>

//             {/* Ошибка отправки / перехода */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
//                 <p className="text-sm md:text-base text-red-200">{submitErr}</p>
//               </div>
//             )}

//             {/* Кнопки */}
//             <div className="flex flex-col sm:flex-row gap-3 sm:items-center pt-2">
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="
//                   inline-flex items-center justify-center gap-2
//                   rounded-2xl border border-white/20 px-5 py-2.5
//                   text-sm md:text-base text-white/90
//                   hover:bg-white/10 hover:border-amber-300/70
//                   transition-all
//                 "
//                 disabled={submitting}
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 Назад
//               </button>
//               <button
//                 type="submit"
//                 disabled={!formValid || submitting}
//                 className="
//                   flex-1 inline-flex items-center justify-center
//                   rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
//                   px-6 py-3 text-sm md:text-base font-semibold text-black
//                   shadow-[0_0_32px_rgba(245,197,24,0.7)]
//                   hover:shadow-[0_0_42px_rgba(245,197,24,0.9)]
//                   disabled:opacity-50 disabled:shadow-none
//                   transition-all
//                 "
//               >
//                 {submitting ? "Проверка данных…" : "Забронировать"}
//               </button>
//             </div>
//           </motion.form>

//           {/* Инфо-блок про e-mail справа */}
//           <motion.aside
//             initial={{ opacity: 0, x: 18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="
//               relative rounded-3xl border border-white/12
//               bg-gradient-to-br from-black/80 via-slate-900/80 to-black/90
//               p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]
//               text-sm md:text-base
//             "
//           >
//             <div className="pointer-events-none absolute -top-24 right-0 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />

//             <div className="relative">
//               <h3 className="flex items-center gap-2 text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-3">
//                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 border border-yellow-300/70">
//                   <Mail className="w-4 h-4 text-yellow-300" />
//                 </span>
//                 <span>Почему мы просим e-mail?</span>
//               </h3>
//               <ul className="space-y-3 text-white/80 text-sm md:text-base">
//                 <li>
//                   На ваш e-mail мы отправим{" "}
//                   <span className="text-amber-300">
//                     подтверждение брони и все детали записи
//                   </span>
//                   .
//                 </li>
//                 <li>
//                   Вы получите{" "}
//                   <span className="text-amber-300">
//                     напоминание перед визитом
//                   </span>
//                   , чтобы ничего не забыть.
//                 </li>
//                 <li>
//                   Мы бережно относимся к персональным данным и используем ваш
//                   e-mail только для обслуживания вашей записи.
//                 </li>
//                 <li className="text-white/70 text-xs md:text-sm pt-1 border-t border-white/10 mt-3">
//                   Если вы допустите ошибку в адресе, вы всё равно сможете прийти
//                   на приём, но не получите напоминания и подтверждения.
//                 </li>
//               </ul>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       <VideoSection />
//     </PageShell>
//   );
// }

// /* ===================== Export ===================== */

// export default function ClientPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen flex items-center justify-center bg-black">
//           <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
//         </div>
//       }
//     >
//       <ClientForm />
//     </Suspense>
//   );
// }




//------работает но хочу добавить новый фон-------
// // src/app/booking/client/form/page.tsx
// "use client";

// import * as React from "react";
// import { Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   ArrowLeft,
//   Mail,
//   User,
//   Phone,
//   CalendarDays,
//   Info,
//   ChevronDown,
// } from "lucide-react";

// /* ===================== Типы ===================== */

// type EmailCheck =
//   | { state: "idle" }
//   | { state: "checking" }
//   | { state: "ok" }
//   | { state: "fail"; reason?: string }
//   | { state: "unavailable" };

// type ReferralKind = "google" | "facebook" | "instagram" | "friends" | "other";

// const referralOptions: { value: ReferralKind; label: string }[] = [
//   { value: "google", label: "Google" },
//   { value: "facebook", label: "Facebook" },
//   { value: "instagram", label: "Instagram" },
//   { value: "friends", label: "Рекомендация друзей" },
//   { value: "other", label: "Другое" },
// ];

// /* ===================== Утилиты ===================== */

// function isValidEmailSyntax(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// function formatYMD(d: Date): string {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// }

// function yearsAgo(n: number): Date {
//   const d = new Date();
//   d.setFullYear(d.getFullYear() - n);
//   return d;
// }

// /* ===================== Общий shell как на других шагах ===================== */

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen relative overflow-hidden bg-black text-white">
//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header fixed top-0 inset-x-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//           <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       {/* отступ под фиксированный хедер */}
//       <div className="h-[84px] md:h-[96px]" />

//       {children}
//     </div>
//   );
// }

// /* ===================== Видео-секция с логотипом ===================== */

// function VideoSection() {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)]">
//         <video
//           className="
//             absolute inset-0 h-full w-full
//             object-contain 2xl:object-cover
//             object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]
//           "
//           autoPlay
//           muted
//           loop
//           playsInline
//           preload="metadata"
//           poster="/fallback-poster.jpg"
//           aria-hidden="true"
//         >
//           <source src="/SE-logo-video-master.webm" type="video/webm" />
//           <source src="/SE-logo-video-master.mp4" type="video/mp4" />
//         </video>
//         <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/10 pointer-events-none" />
//       </div>
//     </section>
//   );
// }

// /* ===================== Основная форма клиента ===================== */

// function ClientForm(): React.JSX.Element {
//   const params = useSearchParams();
//   const router = useRouter();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll("s").filter(Boolean),
//     [params]
//   );
//   const masterId = params.get("m") ?? "";
//   const startISO = params.get("start") ?? "";
//   const endISO = params.get("end") ?? "";

//   const [name, setName] = React.useState<string>("");
//   const [phone, setPhone] = React.useState<string>("");
//   const [email, setEmail] = React.useState<string>("");
//   const [emailCheck, setEmailCheck] = React.useState<EmailCheck>({
//     state: "idle",
//   });

//   const [birth, setBirth] = React.useState<string>("");
//   const [referral, setReferral] = React.useState<ReferralKind | "">("");
//   const [referralOther, setReferralOther] = React.useState<string>("");
//   const [comment, setComment] = React.useState<string>("");

//   const [submitErr, setSubmitErr] = React.useState<string | null>(null);
//   const [submitting, setSubmitting] = React.useState<boolean>(false);

//   const [referralOpen, setReferralOpen] = React.useState(false);
//   const referralBoxRef = React.useRef<HTMLDivElement | null>(null);

//   // клик вне кастомного дропдауна
//   React.useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (!referralBoxRef.current) return;
//       if (!referralBoxRef.current.contains(e.target as Node)) {
//         setReferralOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   // Премиум-стили полей
//   const fieldBase =
//     "mt-2 w-full rounded-2xl border border-white/14 " +
//     "bg-gradient-to-r from-[#101827] via-[#020617] to-[#020617] " +
//     "px-4 py-3 text-sm md:text-base text-white/90 placeholder:text-white/40 " +
//     "shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_32px_rgba(0,0,0,0.9)] " +
//     "transition-all " +
//     "hover:border-amber-300/70 hover:shadow-[0_0_25px_rgba(245,197,24,0.35)] " +
//     "focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-300";

//   const fieldFilled =
//     "bg-gradient-to-r from-[#152238] via-[#030712] to-[#030712] " +
//     "border-amber-300/80 text-[#EAF4FF] " +
//     "shadow-[0_0_32px_rgba(245,197,24,0.7)]";

//   const fieldError =
//     "border-red-500/80 ring-2 ring-red-500/80 " +
//     "focus:ring-red-500/90 focus:border-red-500/90";

//   const maxBirth = formatYMD(new Date());
//   const minBirth = formatYMD(yearsAgo(120));
//   const minAdult = formatYMD(yearsAgo(16));

//   const nameErr = name.trim().length < 2 ? "Укажите имя полностью" : null;
//   const phoneErr =
//     phone.trim().length < 6 ? "Укажите корректный номер телефона" : null;

//   const birthDate = birth ? new Date(birth + "T00:00:00") : null;
//   let birthErr: string | null = null;
//   if (!birth) birthErr = "Дата рождения обязательна";
//   else if (birthDate && birthDate > new Date())
//     birthErr = "Дата в будущем недопустима";
//   else if (birth && birth > minAdult)
//     birthErr = "Для онлайн-записи требуется возраст 16+";

//   // E-mail обязателен
//   let emailErr: string | null = null;
//   if (!email) {
//     emailErr = "E-mail обязателен";
//   } else if (!isValidEmailSyntax(email)) {
//     emailErr = "Некорректный e-mail";
//   } else if (emailCheck.state === "fail") {
//     emailErr = emailCheck.reason ?? "E-mail не подтвержден";
//   }

//   const referralErr =
//     referral === ""
//       ? "Выберите вариант"
//       : referral === "other" && !referralOther.trim()
//       ? "Уточните источник"
//       : null;

//   const baseDisabled = !serviceIds.length || !masterId || !startISO || !endISO;

//   const formValid =
//     !baseDisabled &&
//     !nameErr &&
//     !phoneErr &&
//     !birthErr &&
//     !emailErr &&
//     !referralErr &&
//     emailCheck.state !== "checking";

//   // Проверка email с задержкой
//   React.useEffect(() => {
//     if (!email || !isValidEmailSyntax(email)) {
//       setEmailCheck({ state: "idle" });
//       return;
//     }

//     setEmailCheck({ state: "checking" });
//     const timer = setTimeout(async () => {
//       try {
//         const res = await fetch(
//           `/api/email-check?email=${encodeURIComponent(email)}`
//         );
//         if (!res.ok) {
//           setEmailCheck({ state: "unavailable" });
//           return;
//         }
//         const data = await res.json();
//         if (data.ok) {
//           setEmailCheck({ state: "ok" });
//         } else {
//           setEmailCheck({ state: "fail", reason: data.reason });
//         }
//       } catch {
//         setEmailCheck({ state: "unavailable" });
//       }
//     }, 800);

//     return () => clearTimeout(timer);
//   }, [email]);

//   /**
//    * Сабмит на этом шаге:
//    *  - проверяет данные и создаёт черновик,
//    *  - затем переводит на /booking/verify,
//    *  где уже идёт окончательная валидация и подтверждение.
//    */
//   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
//     e.preventDefault();
//     if (!formValid || submitting) return;

//     setSubmitting(true);
//     setSubmitErr(null);

//     try {
//       // формируем базовые параметры выбора услуги/мастера/времени
//       const qs = new URLSearchParams();
//       serviceIds.forEach((id) => qs.append("s", id));
//       qs.set("m", masterId);
//       qs.set("start", startISO);
//       qs.set("end", endISO);

//       // создаём черновик брони на сервере
//       const res = await fetch(`/api/booking/client?${qs.toString()}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           customerName: name.trim(),
//           phone: phone.trim(),
//           email: email.trim(),
//           birthDateISO: birth || undefined,
//           referral: referral === "other" ? "other" : referral || undefined,
//           notes: comment.trim() || undefined,
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data.error || `HTTP ${res.status}`);
//       }

//       const result = await res.json();

//       // API должно вернуть { draftId }
//       if (result.draftId) {
//         const verifyQs = new URLSearchParams(qs);
//         const verifyUrl = `/booking/verify?draft=${
//           result.draftId
//         }&email=${encodeURIComponent(email.trim())}&${verifyQs.toString()}`;

//         // переходим на страницу окончательной проверки
//         router.push(verifyUrl);
//       } else {
//         throw new Error("Некорректный ответ от сервера");
//       }
//     } catch (err) {
//       const msg =
//         err instanceof Error
//           ? err.message
//           : "Не удалось перейти к проверке данных";
//       setSubmitErr(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (baseDisabled) {
//     return (
//       <PageShell>
//         <div className="mx-auto max-w-2xl px-4 py-12">
//           <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
//             <p className="text-sm md:text-base text-red-200">
//               Некорректные параметры. Пожалуйста, начните запись заново.
//             </p>
//             <Link
//               href="/booking"
//               className="mt-4 inline-block text-sm text-amber-300 hover:text-amber-200 underline"
//             >
//               Вернуться к выбору услуг
//             </Link>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   const currentReferralLabel =
//     referralOptions.find((o) => o.value === referral)?.label ??
//     "Выберите вариант";

//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 pb-24">
//         {/* Заголовок и подзаголовок */}
//         <div className="w-full flex flex-col items-center text-center">
//           <motion.div
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 26 }}
//             className="relative inline-block mt-5 md:mt-6 mb-6 md:mb-7"
//           >
//             <div className="absolute -inset-2 rounded-full blur-xl opacity-60 bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40" />
//             <div
//               className="
//                 relative flex items-center gap-2
//                 px-6 md:px-8 py-2.5 md:py-3
//                 rounded-full border border-white/15
//                 bg-gradient-to-r from-amber-500/70 via-yellow-500/70 to-amber-500/70
//                 text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)]
//                 backdrop-blur-sm
//               "
//             >
//               <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/15">
//                 <User className="w-4 h-4 text-black/80" />
//               </span>
//               <span className="font-serif italic tracking-wide text-sm md:text-base">
//                 Шаг 4 — Ваши контактные данные
//               </span>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="
//               mx-auto text-center
//               text-4xl md:text-5xl lg:text-5xl xl:text-6xl
//               font-serif italic leading-tight
//               mb-3 md:mb-4
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//               drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//             "
//           >
//             Онлайн-запись
//           </motion.h1>

//           {/* Неоновый фирменный текст + иконки */}
//           <motion.div
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="mx-auto max-w-3xl flex items-center justify-center gap-3 md:gap-4"
//           >
//             <Mail className="w-5 h-5 text-sky-200/90 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
//             <p
//               className="
//                 font-serif tracking-wide
//                 text-lg md:text-xl text-center
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#6DDCFF] via-[#7F5DFF] to-[#FF4FD8]
//                 drop-shadow-[0_0_22px_rgba(80,180,255,0.9)]
//                 uppercase
//               "
//             >
//               УКАЖИТЕ ВАШИ ДАННЫЕ, ЧТОБЫ МЫ ПОДТВЕРДИЛИ БРОНЬ И ОТПРАВИЛИ ДЕТАЛИ
//               ЗАПИСИ.
//             </p>
//             <Mail className="w-5 h-5 text-fuchsia-200/90 drop-shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
//           </motion.div>
//         </div>

//         {/* Основной блок: форма + инфо-блок справа */}
//         <div className="mt-8 grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6 md:gap-8 items-start">
//           {/* Форма слева */}
//           <motion.form
//             onSubmit={handleSubmit}
//             initial={{ opacity: 0, x: -18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.25 }}
//             className="
//               relative rounded-3xl border border-white/12
//               bg-gradient-to-br from-black/80 via-black/70 to-black/85
//               p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]
//               space-y-6
//             "
//           >
//             {/* Имя */}
//             <div>
//               <label
//                 htmlFor="name"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Имя <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                 <input
//                   id="name"
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className={`${fieldBase} pl-10 ${name ? fieldFilled : ""} ${
//                     nameErr ? fieldError : ""
//                   }`}
//                   placeholder="Ваше полное имя"
//                   required
//                 />
//               </div>
//               {nameErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {nameErr}
//                 </p>
//               )}
//             </div>

//             {/* Телефон */}
//             <div>
//               <label
//                 htmlFor="phone"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Телефон <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                 <input
//                   id="phone"
//                   type="tel"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   className={`${fieldBase} pl-10 ${phone ? fieldFilled : ""} ${
//                     phoneErr ? fieldError : ""
//                   }`}
//                   placeholder="+49 (xxx) xxx-xx-xx"
//                   required
//                 />
//               </div>
//               {phoneErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {phoneErr}
//                 </p>
//               )}
//             </div>

//             {/* E-mail (обязателен) */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 E-mail <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className={`${fieldBase} pl-10 ${email ? fieldFilled : ""} ${
//                     emailErr ? fieldError : ""
//                   }`}
//                   placeholder="your@email.com"
//                   required
//                 />
//               </div>

//               {emailCheck.state === "checking" && (
//                 <p className="mt-1 text-xs md:text-sm text-white/60">
//                   Проверка e-mail…
//                 </p>
//               )}
//               {emailCheck.state === "ok" && !emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-emerald-400">
//                   ✓ E-mail подтверждён
//                 </p>
//               )}
//               {emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {emailErr}
//                 </p>
//               )}
//             </div>

//             {/* Дата рождения */}
//             <div>
//               <label
//                 htmlFor="birth"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Дата рождения <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                 <input
//                   id="birth"
//                   type="date"
//                   value={birth}
//                   onChange={(e) => setBirth(e.target.value)}
//                   min={minBirth}
//                   max={maxBirth}
//                   className={`${fieldBase} pl-10 ${birth ? fieldFilled : ""} ${
//                     birthErr ? fieldError : ""
//                   }`}
//                   required
//                 />
//               </div>
//               {birthErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {birthErr}
//                 </p>
//               )}
//               <p className="mt-1 text-xs text-white/55">
//                 Для онлайн-записи требуется возраст 16+
//               </p>
//             </div>

//             {/* Как узнали о нас – кастомный премиальный дропдаун */}
//             <div ref={referralBoxRef}>
//               <label
//                 htmlFor="referral"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Как вы узнали о нас? <span className="text-red-400">*</span>
//               </label>

//               {/* Кнопка-капсула */}
//               <button
//                 id="referral"
//                 type="button"
//                 onClick={() => setReferralOpen((o) => !o)}
//                 className={`${fieldBase} pl-10 pr-10 text-left flex items-center justify-between ${
//                   referral ? fieldFilled : ""
//                 } ${referralErr ? fieldError : ""}`}
//               >
//                 <span className="flex items-center gap-2">
//                   <Info className="h-4 w-4 text-amber-200/80" />
//                   <span className="truncate">{currentReferralLabel}</span>
//                 </span>
//                 <ChevronDown
//                   className={`h-4 w-4 text-amber-200/80 transition-transform ${
//                     referralOpen ? "rotate-180" : ""
//                   }`}
//                 />
//               </button>

//               {/* Список вариантов */}
//               <AnimatePresence>
//                 {referralOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 4, scale: 0.98 }}
//                     animate={{ opacity: 1, y: 8, scale: 1 }}
//                     exit={{ opacity: 0, y: 4, scale: 0.98 }}
//                     transition={{ duration: 0.16 }}
//                     className="
//                       relative z-30
//                       rounded-2xl border border-white/14
//                       bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617]
//                       shadow-[0_18px_40px_rgba(0,0,0,0.85)]
//                       mt-1.5 overflow-hidden
//                       max-h-60 overflow-y-auto
//                     "
//                   >
//                     <div className="py-1">
//                       <button
//                         type="button"
//                         className="
//                           w-full text-left px-4 py-2 text-xs md:text-sm
//                           text-white/70 hover:text-amber-200
//                           hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-400/5
//                           transition-colors
//                         "
//                         onClick={() => {
//                           setReferral("");
//                           setReferralOther("");
//                           setReferralOpen(false);
//                         }}
//                       >
//                         Выберите вариант
//                       </button>

//                       {referralOptions.map((opt) => {
//                         const isActive = referral === opt.value;
//                         return (
//                           <button
//                             key={opt.value}
//                             type="button"
//                             className={`
//                               w-full text-left px-4 py-2 text-xs md:text-sm
//                               transition-colors
//                               ${
//                                 isActive
//                                   ? "bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-yellow-400/10 text-amber-100"
//                                   : "text-white/85 hover:text-amber-200 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-yellow-400/5"
//                               }
//                             `}
//                             onClick={() => {
//                               setReferral(opt.value);
//                               setReferralOpen(false);
//                             }}
//                           >
//                             {opt.label}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Поле "Другое" */}
//               {referral === "other" && (
//                 <div className="mt-3 relative">
//                   <Info className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                   <input
//                     type="text"
//                     value={referralOther}
//                     onChange={(e) => setReferralOther(e.target.value)}
//                     placeholder="Уточните источник"
//                     className={`${fieldBase} pl-10 ${
//                       referralOther ? fieldFilled : ""
//                     }`}
//                   />
//                 </div>
//               )}

//               {referralErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {referralErr}
//                 </p>
//               )}
//             </div>

//             {/* Комментарий */}
//             <div>
//               <label
//                 htmlFor="comment"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Комментарий{" "}
//                 <span className="text-white/50">(необязательно)</span>
//               </label>
//               <textarea
//                 id="comment"
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 rows={3}
//                 className={`${fieldBase} align-top ${
//                   comment ? fieldFilled : ""
//                 }`}
//                 placeholder="Дополнительная информация или пожелания"
//               />
//             </div>

//             {/* Ошибка отправки / перехода */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
//                 <p className="text-sm md:text-base text-red-200">{submitErr}</p>
//               </div>
//             )}

//             {/* Кнопки */}
//             <div className="flex flex-col sm:flex-row gap-3 sm:items-center pt-2">
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="
//                   inline-flex items-center justify-center gap-2
//                   rounded-2xl border border-white/20 px-5 py-2.5
//                   text-sm md:text-base text-white/90
//                   hover:bg-white/10 hover:border-amber-300/70
//                   transition-all
//                 "
//                 disabled={submitting}
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 Назад
//               </button>
//               <button
//                 type="submit"
//                 disabled={!formValid || submitting}
//                 className="
//                   flex-1 inline-flex items-center justify-center
//                   rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
//                   px-6 py-3 text-sm md:text-base font-semibold text-black
//                   shadow-[0_0_32px_rgba(245,197,24,0.7)]
//                   hover:shadow-[0_0_42px_rgba(245,197,24,0.9)]
//                   disabled:opacity-50 disabled:shadow-none
//                   transition-all
//                 "
//               >
//                 {submitting ? "Проверка данных…" : "Забронировать"}
//               </button>
//             </div>
//           </motion.form>

//           {/* Инфо-блок про e-mail справа */}
//           <motion.aside
//             initial={{ opacity: 0, x: 18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="
//               relative rounded-3xl border border-white/12
//               bg-gradient-to-br from-black/80 via-slate-900/80 to-black/90
//               p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]
//               text-sm md:text-base
//             "
//           >
//             <div className="pointer-events-none absolute -top-24 right-0 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />

//             <div className="relative">
//               <h3 className="flex items-center gap-2 text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-3">
//                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 border border-yellow-300/70">
//                   <Mail className="w-4 h-4 text-yellow-300" />
//                 </span>
//                 <span>Почему мы просим e-mail?</span>
//               </h3>
//               <ul className="space-y-3 text-white/80 text-sm md:text-base">
//                 <li>
//                   На ваш e-mail мы отправим{" "}
//                   <span className="text-amber-300">
//                     подтверждение брони и все детали записи
//                   </span>
//                   .
//                 </li>
//                 <li>
//                   Вы получите{" "}
//                   <span className="text-amber-300">
//                     напоминание перед визитом
//                   </span>
//                   , чтобы ничего не забыть.
//                 </li>
//                 <li>
//                   Мы бережно относимся к персональным данным и используем ваш
//                   e-mail только для обслуживания вашей записи.
//                 </li>
//                 <li className="text-white/70 text-xs md:text-sm pt-1 border-t border-white/10 mt-3">
//                   Если вы допустите ошибку в адресе, вы всё равно сможете прийти
//                   на приём, но не получите напоминания и подтверждения.
//                 </li>
//               </ul>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       <VideoSection />
//     </PageShell>
//   );
// }

// /* ===================== Export ===================== */

// export default function ClientPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen flex items-center justify-center bg-black">
//           <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
//         </div>
//       }
//     >
//       <ClientForm />
//     </Suspense>
//   );
// }

// // src/app/booking/client/form/page.tsx
// "use client";

// import * as React from "react";
// import { Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   ArrowLeft,
//   Mail,
//   User,
//   Phone,
//   CalendarDays,
//   Info,
//   ChevronDown,
// } from "lucide-react";
// import PremiumProgressBar from "@/components/PremiumProgressBar";

// /* ===================== Типы ===================== */

// type EmailCheck =
//   | { state: "idle" }
//   | { state: "checking" }
//   | { state: "ok" }
//   | { state: "fail"; reason?: string }
//   | { state: "unavailable" };

// type ReferralKind = "google" | "facebook" | "instagram" | "friends" | "other";

// const referralOptions: { value: ReferralKind; label: string }[] = [
//   { value: "google", label: "Google" },
//   { value: "facebook", label: "Facebook" },
//   { value: "instagram", label: "Instagram" },
//   { value: "friends", label: "Рекомендация друзей" },
//   { value: "other", label: "Другое" },
// ];

// /* ===================== Утилиты ===================== */

// function isValidEmailSyntax(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// function formatYMD(d: Date): string {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// }

// function yearsAgo(n: number): Date {
//   const d = new Date();
//   d.setFullYear(d.getFullYear() - n);
//   return d;
// }

// /* ===================== Общий shell как на других шагах ===================== */

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen relative overflow-hidden bg-black text-white">
//       <header className="booking-header fixed top-0 inset-x-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//           <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[84px] md:h-[96px]" />

//       {children}
//     </div>
//   );
// }

// /* ===================== Видео-секция с логотипом ===================== */

// function VideoSection() {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[21/9] rounded-[40px] bg-gradient-to-br from-slate-900 via-slate-950 to-black overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)]">
//         <video
//           className="
//             absolute inset-0 h-full w-full
//             object-contain 2xl:object-cover
//             object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]
//           "
//           autoPlay
//           muted
//           loop
//           playsInline
//           preload="metadata"
//           poster="/fallback-poster.jpg"
//           aria-hidden="true"
//         >
//           <source src="/SE-logo-video-master.webm" type="video/webm" />
//           <source src="/SE-logo-video-master.mp4" type="video/mp4" />
//         </video>
//         <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/10 pointer-events-none" />
//       </div>
//     </section>
//   );
// }

// /* ===================== Основная форма клиента ===================== */

// function ClientForm(): React.JSX.Element {
//   const params = useSearchParams();
//   const router = useRouter();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll("s").filter(Boolean),
//     [params],
//   );
//   const masterId = params.get("m") ?? "";
//   const startISO = params.get("start") ?? "";
//   const endISO = params.get("end") ?? "";

//   const [name, setName] = React.useState<string>("");
//   const [phone, setPhone] = React.useState<string>("");
//   const [email, setEmail] = React.useState<string>("");
//   const [emailCheck, setEmailCheck] = React.useState<EmailCheck>({
//     state: "idle",
//   });

//   const [birth, setBirth] = React.useState<string>("");
//   const [referral, setReferral] = React.useState<ReferralKind | null>(null);
//   const [referralOther, setReferralOther] = React.useState<string>("");
//   const [comment, setComment] = React.useState<string>("");

//   const [submitErr, setSubmitErr] = React.useState<string | null>(null);
//   const [submitting, setSubmitting] = React.useState<boolean>(false);

//   const [referralOpen, setReferralOpen] = React.useState(false);
//   const referralBoxRef = React.useRef<HTMLDivElement | null>(null);

//   React.useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (!referralBoxRef.current) return;
//       if (!referralBoxRef.current.contains(e.target as Node)) {
//         setReferralOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const fieldBase =
//     "mt-2 w-full rounded-2xl border border-white/14 " +
//     "bg-gradient-to-r from-[#101827] via-[#020617] to-[#020617] " +
//     "px-4 py-3 text-sm md:text-base text-white/90 placeholder:text-white/40 " +
//     "shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_32px_rgba(0,0,0,0.9)] " +
//     "transition-all " +
//     "hover:border-amber-300/70 hover:shadow-[0_0_25px_rgba(245,197,24,0.35)] " +
//     "focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-300";

//   const fieldFilled =
//     "bg-gradient-to-r from-[#152238] via-[#030712] to-[#030712] " +
//     "border-amber-300/80 text-[#EAF4FF] " +
//     "shadow-[0_0_32px_rgba(245,197,24,0.7)]";

//   const fieldError =
//     "border-red-500/80 ring-2 ring-red-500/80 " +
//     "focus:ring-red-500/90 focus:border-red-500/90";

//   const maxBirth = formatYMD(new Date());
//   const minBirth = formatYMD(yearsAgo(120));
//   const minAdult = formatYMD(yearsAgo(16));

//   const nameErr =
//     !name.trim().length || name.trim().length < 2
//       ? "Укажите, пожалуйста, полное имя"
//       : null;

//   const phoneDigits = phone.replace(/\D/g, "");
//   const phoneErr =
//     !phone.trim().length || phoneDigits.length < 7
//       ? "Укажите, пожалуйста, корректный номер телефона"
//       : null;

//   const birthErr =
//     birth && birth < minBirth
//       ? "Дата рождения слишком далека в прошлом"
//       : birth && birth > maxBirth
//       ? "Дата рождения не может быть в будущем"
//       : birth && birth > minAdult
//       ? "Для онлайн-записи требуется возраст 16+"
//       : !birth
//       ? "Укажите дату рождения"
//       : null;

//   const emailErr =
//     email && !isValidEmailSyntax(email)
//       ? "Похоже, в e-mail есть ошибка"
//       : emailCheck.state === "fail"
//       ? emailCheck.reason ?? "Этот e-mail нельзя использовать"
//       : null;

//   const referralErr =
//     !referral
//       ? "Пожалуйста, выберите вариант"
//       : referral === "other" && !referralOther.trim()
//       ? "Уточните, пожалуйста, источник"
//       : null;

//   const canSubmit =
//     !nameErr &&
//     !phoneErr &&
//     !birthErr &&
//     !emailErr &&
//     !referralErr &&
//     emailCheck.state !== "checking";

//   const referralLabel =
//     referralOptions.find((o) => o.value === referral)?.label ??
//     "Выберите вариант";

//   React.useEffect(() => {
//     if (!email || !isValidEmailSyntax(email)) {
//       setEmailCheck({ state: "idle" });
//       return;
//     }

//     setEmailCheck({ state: "checking" });

//     const timer = setTimeout(async () => {
//       try {
//         const res = await fetch(
//           `/api/email-check?email=${encodeURIComponent(email)}`,
//         );
//         if (!res.ok) {
//           setEmailCheck({ state: "unavailable" });
//           return;
//         }
//         const data: { ok?: boolean; reason?: string } = await res.json();
//         if (data.ok) {
//           setEmailCheck({ state: "ok" });
//         } else {
//           setEmailCheck({ state: "fail", reason: data.reason });
//         }
//       } catch {
//         setEmailCheck({ state: "unavailable" });
//       }
//     }, 800);

//     return () => clearTimeout(timer);
//   }, [email]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!canSubmit || submitting) return;

//     setSubmitting(true);
//     setSubmitErr(null);

//     try {
//       const res = await fetch("/api/booking", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           serviceIds,
//           masterId,
//           startAt: startISO,
//           endAt: endISO,
//           clientName: name.trim(),
//           clientPhone: phone.trim(),
//           clientEmail: email.trim() || null,
//           birthDate: birth || null,
//           referral: referral ?? null,
//           referralOther:
//             referral === "other" ? referralOther.trim() || null : null,
//           comment: comment.trim() || null,
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => null);
//         throw new Error(data?.error || "Не удалось создать запись");
//       }

//       const data: { draftId?: string } = await res.json();
//       const draftId = data.draftId;

//       if (!draftId) {
//         throw new Error("Ответ сервера не содержит ID черновика");
//       }

//       const qs = new URLSearchParams();
//       qs.set("draft", draftId);
//       if (email.trim()) {
//         qs.set("email", email.trim());
//       }

//       router.push(`/booking/verify?${qs.toString()}`);
//     } catch (err) {
//       console.error("[Client form] submit error:", err);
//       setSubmitErr(
//         err instanceof Error
//           ? err.message
//           : "Произошла ошибка при создании записи. Попробуйте ещё раз.",
//       );
//       setSubmitting(false);
//     }
//   };

//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 pb-24">
//         {/* Заголовок и подзаголовок */}
//         <div className="w-full flex flex-col items-center text-center">
//           <motion.div
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 26 }}
//             className="relative inline-block mt-5 md:mt-6 mb-6 md:mb-7"
//           >
//             <div className="absolute -inset-2 rounded-full blur-3xl bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40" />
//             <div
//               className="
//                 relative flex items-center gap-2
//                 px-6 md:px-8 py-2.5 md:py-3
//                 rounded-full border border-white/15
//                 bg-gradient-to-r from-amber-500/70 via-yellow-500/70 to-amber-500/70
//                 text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)]
//                 backdrop-blur-sm
//               "
//             >
//               <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/15">
//                 <User className="w-4 h-4 text-black/80" />
//               </span>
//               <span className="font-serif italic tracking-wide text-sm md:text-base">
//                 Шаг 4 — Ваши контактные данные
//               </span>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ y: 8, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.05, duration: 0.4 }}
//             className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-200"
//           >
//             Расскажите немного о себе
//           </motion.h1>

//           <motion.p
//             initial={{ y: 8, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.12, duration: 0.4 }}
//             className="mt-3 max-w-xl text-sm md:text-base text-white/70"
//           >
//             Эти данные нужны, чтобы подтвердить запись, напомнить о визите и
//             сделать ваш опыт в салоне максимально комфортным.
//           </motion.p>
//         </div>

//         {/* Видео-секция */}
//         <VideoSection />

//         {/* Основной контент: форма + боковая колонка */}
//         <section className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
//           {/* Форма */}
//           <form
//             onSubmit={handleSubmit}
//             className="rounded-3xl border border-white/12 bg-gradient-to-br from-black/80 via-slate-900/80 to-black/90 p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]"
//           >
//             <div className="flex items-center justify-between gap-3 mb-6">
//               <Link
//                 href={
//                   serviceIds.length
//                     ? `/booking/calendar?${serviceIds
//                         .map((s) => `s=${encodeURIComponent(s)}`)
//                         .join("&")}${
//                         masterId ? `&m=${encodeURIComponent(masterId)}` : ""
//                       }${
//                         startISO
//                           ? `&start=${encodeURIComponent(startISO)}`
//                           : ""
//                       }${
//                         endISO ? `&end=${encodeURIComponent(endISO)}` : ""
//                       }`
//                     : "/booking/services"
//                 }
//                 className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs md:text-sm text-white/70 hover:text-white hover:border-white/40 transition"
//               >
//                 <ArrowLeft className="w-3.5 h-3.5" />
//                 <span>Назад к выбору времени</span>
//               </Link>

//               <span className="text-xs md:text-sm text-white/60">
//                 Шаг 4 из 6
//               </span>
//             </div>

//             {/* Поля формы */}
//             <div className="space-y-5 md:space-y-6">
//               {/* Имя */}
//               <div>
//                 <label
//                   htmlFor="name"
//                   className="block text-sm md:text-base font-medium text-white/85"
//                 >
//                   Ваше имя и фамилия <span className="text-red-400">*</span>
//                 </label>
//                 <div className="relative">
//                   <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                   <input
//                     id="name"
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     className={`${fieldBase} pl-10 ${name ? fieldFilled : ""} ${
//                       nameErr ? fieldError : ""
//                     }`}
//                     placeholder="Ваше полное имя"
//                     required
//                   />
//                 </div>
//                 {nameErr && (
//                   <p className="mt-1 text-xs md:text-sm text-red-400">
//                     {nameErr}
//                   </p>
//                 )}
//               </div>

//               {/* Телефон */}
//               <div>
//                 <label
//                   htmlFor="phone"
//                   className="block text-sm md:text-base font-medium text-white/85"
//                 >
//                   Телефон <span className="text-red-400">*</span>
//                 </label>
//                 <div className="relative">
//                   <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                   <input
//                     id="phone"
//                     type="tel"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     className={`${fieldBase} pl-10 ${
//                       phone ? fieldFilled : ""
//                     } ${phoneErr ? fieldError : ""}`}
//                     placeholder="+49 ..."
//                     required
//                   />
//                 </div>
//                 {phoneErr && (
//                   <p className="mt-1 text-xs md:text-sm text-red-400">
//                     {phoneErr}
//                   </p>
//                 )}
//               </div>

//               {/* E-mail */}
//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm md:text-base font-medium text-white/85"
//                 >
//                   E-mail <span className="text-red-400">*</span>
//                 </label>
//                 <div className="relative">
//                   <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                   <input
//                     id="email"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className={`${fieldBase} pl-10 ${
//                       email ? fieldFilled : ""
//                     } ${emailErr ? fieldError : ""}`}
//                     placeholder="name@example.com"
//                     required
//                   />
//                 </div>
//                 {emailCheck.state === "checking" && (
//                   <p className="mt-1 text-xs text-white/60">
//                     Проверяем доступность e-mail...
//                   </p>
//                 )}
//                 {emailCheck.state === "unavailable" && !emailErr && (
//                   <p className="mt-1 text-xs text-white/60">
//                     Сейчас не удалось проверить e-mail, но вы всё равно можете
//                     продолжить.
//                   </p>
//                 )}
//                 {emailErr && (
//                   <p className="mt-1 text-xs md:text-sm text-red-400">
//                     {emailErr}
//                   </p>
//                 )}
//               </div>

//               {/* Дата рождения */}
//               <div>
//                 <label
//                   htmlFor="birth"
//                   className="block text-sm md:text-base font-medium text-white/85"
//                 >
//                   Дата рождения <span className="text-red-400">*</span>
//                 </label>
//                 <div className="relative">
//                   <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                   <input
//                     id="birth"
//                     type="date"
//                     value={birth}
//                     onChange={(e) => setBirth(e.target.value)}
//                     className={`${fieldBase} pl-10 ${
//                       birth ? fieldFilled : ""
//                     } ${birthErr ? fieldError : ""}`}
//                     min={minBirth}
//                     max={maxBirth}
//                     required
//                   />
//                 </div>
//                 {birthErr && (
//                   <p className="mt-1 text-xs md:text-sm text-red-400">
//                     {birthErr}
//                   </p>
//                 )}
//                 <p className="mt-1 text-xs text-white/55">
//                   Для онлайн-записи требуется возраст 16+
//                 </p>
//               </div>

//               {/* Как узнали о нас – кастомный дропдаун */}
//               <div ref={referralBoxRef}>
//                 <label
//                   htmlFor="referral"
//                   className="block text-sm md:text-base font-medium text-white/85"
//                 >
//                   Как вы узнали о нас?{" "}
//                   <span className="text-red-400">*</span>
//                 </label>

//                 <button
//                   id="referral"
//                   type="button"
//                   onClick={() => setReferralOpen((o) => !o)}
//                   className={`${fieldBase} pl-10 pr-10 text-left flex items-center justify-between ${
//                     referral ? fieldFilled : ""
//                   } ${referralErr ? fieldError : ""}`}
//                 >
//                   <span>{referralLabel}</span>
//                   <ChevronDown className="w-4 h-4 opacity-80" />
//                 </button>

//                 <AnimatePresence>
//                   {referralOpen && (
//                     <motion.div
//                       initial={{ opacity: 0, y: -4 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -4 }}
//                       transition={{ duration: 0.16 }}
//                       className="relative mt-2"
//                     >
//                       <div
//                         className="
//                           absolute z-20 w-full rounded-2xl border border-white/15
//                           bg-gradient-to-b from-slate-900 via-slate-950 to-black
//                           shadow-[0_22px_60px_rgba(0,0,0,0.9)]
//                           overflow-hidden
//                         "
//                       >
//                         {referralOptions.map((opt) => (
//                           <button
//                             key={opt.value}
//                             type="button"
//                             onClick={() => {
//                               setReferral(opt.value);
//                               setReferralOpen(false);
//                             }}
//                             className={`
//                               flex w-full items-center justify-between px-4 py-2.5 text-sm text-left
//                               hover:bg-white/10 transition
//                               ${
//                                 referral === opt.value
//                                   ? "bg-white/10 text-amber-300"
//                                   : "text-white/85"
//                               }
//                             `}
//                           >
//                             <span>{opt.label}</span>
//                           </button>
//                         ))}
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {referral === "other" && (
//                   <div className="mt-3 relative">
//                     <Info className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                     <input
//                       type="text"
//                       value={referralOther}
//                       onChange={(e) => setReferralOther(e.target.value)}
//                       placeholder="Уточните источник"
//                       className={`${fieldBase} pl-10 ${
//                         referralOther ? fieldFilled : ""
//                       }`}
//                     />
//                   </div>
//                 )}

//                 {referralErr && (
//                   <p className="mt-1 text-xs md:text-sm text-red-400">
//                     {referralErr}
//                   </p>
//                 )}
//               </div>

//               {/* Комментарий */}
//               <div>
//                 <label
//                   htmlFor="comment"
//                   className="block text-sm md:text-base font-medium text-white/85"
//                 >
//                   Комментарий к записи (необязательно)
//                 </label>
//                 <textarea
//                   id="comment"
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                   className={`${fieldBase} min-h-[96px] ${
//                     comment ? fieldFilled : ""
//                   }`}
//                   placeholder="Например, пожелания к мастеру или детали услуги"
//                 />
//               </div>
//             </div>

//             {submitErr && (
//               <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
//                 {submitErr}
//               </div>
//             )}

//             <div className="mt-6 flex justify-end">
//               <button
//                 type="submit"
//                 disabled={!canSubmit || submitting}
//                 className={`
//                   inline-flex items-center justify-center gap-2 rounded-full px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base font-semibold
//                   ${
//                     canSubmit && !submitting
//                       ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black shadow-[0_10px_40px_rgba(245,197,24,0.45)] hover:shadow-[0_14px_50px_rgba(245,197,24,0.6)] hover:brightness-105"
//                       : "bg-slate-700 text-slate-300 cursor-not-allowed"
//                   }
//                 `}
//               >
//                 {submitting ? "Создаём запись..." : "Продолжить к подтверждению"}
//               </button>
//             </div>
//           </form>

//           {/* Боковая колонка */}
//           <motion.aside
//             initial={{ opacity: 0, x: 18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="
//               relative rounded-3xl border border-white/12
//               bg-gradient-to-br from-black/80 via-slate-900/80 to-black/90
//               p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]
//               text-sm md:text-base
//             "
//           >
//             <div className="pointer-events-none absolute -top-24 right-0 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />

//             <div className="relative">
//               <h3 className="flex items-center gap-2 text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-3">
//                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 border border-yellow-300/70">
//                   <Mail className="w-4 h-4 text-yellow-300" />
//                 </span>
//                 <span>Почему мы просим e-mail?</span>
//               </h3>
//               <ul className="space-y-3 text-white/80 text-sm md:text-base">
//                 <li>
//                   На ваш e-mail мы отправим{" "}
//                   <span className="text-amber-300">
//                     подтверждение брони и все детали записи
//                   </span>
//                   .
//                 </li>
//                 <li>
//                   Вы получите{" "}
//                   <span className="text-amber-300">
//                     напоминание о записи и возможность переноса
//                   </span>
//                   , если планы изменятся.
//                 </li>
//                 <li>
//                   Мы никогда не будем отправлять спам и{" "}
//                   <span className="text-amber-300">
//                     не передаём ваши данные третьим лицам
//                   </span>
//                   .
//                 </li>
//               </ul>

//               <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs md:text-sm text-white/70 flex items-start gap-3">
//                 <Info className="w-4 h-4 mt-0.5 text-amber-300 flex-shrink-0" />
//                 <p>
//                   Если вы не хотите указывать e-mail, вы всё равно можете
//                   записаться через{" "}
//                   <span className="text-amber-300">
//                     телефон или Telegram
//                   </span>{" "}
//                   — просто сообщите об этом администратору.
//                 </p>
//               </div>
//             </div>
//           </motion.aside>
//         </section>
//       </main>
//     </PageShell>
//   );
// }

// /* ===================== Default export ===================== */

// export default function ClientPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen flex items-center justify-center bg-black">
//           <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
//         </div>
//       }
//     >
//       <ClientForm />
//     </Suspense>
//   );
// }
