// File: src/app/booking/(steps)/client/page.tsx
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
    <div className="min-h-screen relative overflow-hidden bg-black text-white">
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
  );
}

/* ===================== Видео-секция с логотипом ===================== */

function VideoSection() {
  return (
    <section className="relative py-10 sm:py-12">
      <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)]">
        <video
          className="
            absolute inset-0 h-full w-full
            object-contain 2xl:object-cover
            object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/10 pointer-events-none" />
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
      // формируем базовые параметры выбора услуги/мастера/времени
      const qs = new URLSearchParams();
      serviceIds.forEach((id) => qs.append("s", id));
      qs.set("m", masterId);
      qs.set("start", startISO);
      qs.set("end", endISO);

      // создаём черновик брони на сервере
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

      // API должно вернуть { draftId }
      if (result.draftId) {
        const verifyQs = new URLSearchParams(qs);
        const verifyUrl = `/booking/verify?draft=${
          result.draftId
        }&email=${encodeURIComponent(email.trim())}&${verifyQs.toString()}`;

        // переходим на страницу окончательной проверки
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

          {/* Неоновый фирменный текст + иконки */}
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

              {/* Кнопка-капсула */}
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

              {/* Список вариантов */}
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

              {/* Поле "Другое" */}
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

//----------убираем бронь стили пока оставляем
// // File: src/app/booking/(steps)/client/page.tsx
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

//   const baseDisabled =
//     !serviceIds.length || !masterId || !startISO || !endISO;

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
//         err instanceof Error ? err.message : "Не удалось создать запись";
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
//               УКАЖИТЕ ВАШИ ДАННЫЕ, ЧТОБЫ МЫ ПОДТВЕРДИЛИ БРОНЬ И ОТПРАВИЛИ
//               ДЕТАЛИ ЗАПИСИ.
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

//             {/* Ошибка отправки */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
//                 <p className="text-sm md:text-base text-red-200">
//                   {submitErr}
//                 </p>
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
//                   Если вы допустите ошибку в адресе, вы всё равно сможете
//                   прийти на приём, но не получите напоминания и подтверждения.
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

//--------работа с выбором как узнали о нас
// // File: src/app/booking/(steps)/client/page.tsx
// "use client";

// import * as React from "react";
// import { Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
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

//   // Премиум-стили полей (основное "оживление" здесь)
//   const fieldBase =
//     "mt-2 w-full rounded-2xl border border-white/14 " +
//     "bg-gradient-to-r from-[#101827] via-[#020617] to-[#020617] " + // глубокий сине-чёрный
//     "px-4 py-3 text-sm md:text-base text-white/90 placeholder:text-white/40 " +
//     "shadow-[0_0_0_1px_rgba(15,23,42,0.9),0_0_32px_rgba(0,0,0,0.9)] " +
//     "transition-all " +
//     "hover:border-amber-300/70 hover:shadow-[0_0_25px_rgba(245,197,24,0.35)] " +
//     "focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-300";

//   const fieldFilled =
//     "bg-gradient-to-r from-[#152238] via-[#030712] to-[#030712] " + // более «объёмный» градиент
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

//   const baseDisabled =
//     !serviceIds.length || !masterId || !startISO || !endISO;

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
//    *  - проверяет данные на бэкенде,
//    *  - создаёт "черновик" записи,
//    *  - переводит пользователя на шаг /booking/verify
//    *    для окончательной валидации и подтверждения.
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
//         err instanceof Error ? err.message : "Не удалось создать запись";
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
//               Укажите Ваши данные, чтобы мы подтвердили бронь и отправили
//               детали записи
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

//             {/* Как узнали о нас */}
//             <div>
//               <label
//                 htmlFor="referral"
//                 className="block text-sm md:text-base font-medium text-white/85"
//               >
//                 Как вы узнали о нас? <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Info className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//                 <select
//                   id="referral"
//                   value={referral}
//                   onChange={(e) =>
//                     setReferral(e.target.value as ReferralKind | "")
//                   }
//                   className={`${fieldBase} pl-10 pr-10 ${
//                     referral ? fieldFilled : ""
//                   } ${referralErr ? fieldError : ""} bg-[#020617]`}
//                   required
//                 >
//                   <option value="">Выберите вариант</option>
//                   <option value="google">Google</option>
//                   <option value="facebook">Facebook</option>
//                   <option value="instagram">Instagram</option>
//                   <option value="friends">Рекомендация друзей</option>
//                   <option value="other">Другое</option>
//                 </select>
//                 <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-200/80" />
//               </div>

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

//             {/* Ошибка отправки */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
//                 <p className="text-sm md:text-base text-red-200">
//                   {submitErr}
//                 </p>
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
//                   Если вы допустите ошибку в адресе, вы всё равно сможете
//                   прийти на приём, но не получите напоминания и подтверждения.
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

//----------улучшаем
// // File: src/app/booking/(steps)/client/page.tsx
// "use client";

// import * as React from "react";
// import { Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
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

//   // Премиум-стили полей
//   const fieldBase =
//     "mt-2 w-full rounded-2xl border border-white/10 bg-[#05060a]/90 px-4 py-3 " +
//     "text-sm md:text-base text-white placeholder:text-white/35 " +
//     "shadow-[0_0_25px_rgba(0,0,0,0.9)] transition-all " +
//     "focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300/80";
//   const fieldFilled =
//     "bg-gradient-to-r from-white/12 via-white/5 to-white/10 " +
//     "border-amber-300/70 shadow-[0_0_26px_rgba(245,197,24,0.55)]";
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

//   // E-mail теперь обязателен
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

//   const baseDisabled =
//     !serviceIds.length || !masterId || !startISO || !endISO;

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
//    *  - проверяет данные на бэкенде,
//    *  - создаёт "черновик" записи,
//    *  - переводит пользователя на шаг /booking/verify
//    *    для окончательной валидации и подтверждения.
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
//         err instanceof Error ? err.message : "Не удалось создать запись";
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
//               УКАЖИТЕ ВАШИ ДАННЫЕ, ЧТОБЫ МЫ ПОДТВЕРДИЛИ БРОНЬ И ОТПРАВИЛИ
//               ДЕТАЛИ ЗАПИСИ.
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Имя <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Телефон <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 E-mail <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Дата рождения <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
//               <p className="mt-1 text-xs text-white/50">
//                 Для онлайн-записи требуется возраст 16+
//               </p>
//             </div>

//             {/* Как узнали о нас */}
//             <div>
//               <label
//                 htmlFor="referral"
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Как вы узнали о нас? <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Info className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
//                 <select
//                   id="referral"
//                   value={referral}
//                   onChange={(e) =>
//                     setReferral(e.target.value as ReferralKind | "")
//                   }
//                   className={`${fieldBase} pl-10 pr-10 ${
//                     referral ? fieldFilled : ""
//                   } ${referralErr ? fieldError : ""} bg-[#05060a]/90`}
//                   required
//                 >
//                   <option value="">Выберите вариант</option>
//                   <option value="google">Google</option>
//                   <option value="facebook">Facebook</option>
//                   <option value="instagram">Instagram</option>
//                   <option value="friends">Рекомендация друзей</option>
//                   <option value="other">Другое</option>
//                 </select>
//                 <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
//               </div>

//               {referral === "other" && (
//                 <div className="mt-3 relative">
//                   <Info className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Комментарий{" "}
//                 <span className="text-white/45">(необязательно)</span>
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

//             {/* Ошибка отправки */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
//                 <p className="text-sm md:text-base text-red-200">
//                   {submitErr}
//                 </p>
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
//                   text-sm md:text-base text-white/85
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
//                   Если вы допустите ошибку в адресе, вы всё равно сможете
//                   прийти на приём, но не получите напоминания и подтверждения.
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

//-----------улучшаем
// // File: src/app/booking/(steps)/client/page.tsx
// "use client";

// import * as React from "react";
// import { Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { ArrowLeft, Mail, User } from "lucide-react";

// /* ===================== Типы ===================== */

// type EmailCheck =
//   | { state: "idle" }
//   | { state: "checking" }
//   | { state: "ok" }
//   | { state: "fail"; reason?: string }
//   | { state: "unavailable" };

// type ReferralKind = "google" | "facebook" | "instagram" | "friends" | "other";

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

//   // Премиум-стили полей
//   const fieldBase =
//     "mt-2 w-full rounded-2xl border border-white/10 bg-[#05060a]/90 px-4 py-3 " +
//     "text-sm md:text-base text-white placeholder:text-white/35 " +
//     "shadow-[0_0_25px_rgba(0,0,0,0.9)] transition-all " +
//     "focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300/80";
//   const fieldFilled =
//     "bg-gradient-to-r from-white/12 via-white/5 to-white/10 " +
//     "border-amber-300/70 shadow-[0_0_26px_rgba(245,197,24,0.55)]";
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

//   // E-mail теперь обязателен
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

//   const baseDisabled =
//     !serviceIds.length || !masterId || !startISO || !endISO;

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
//    *  - проверяет данные на бэкенде,
//    *  - создаёт "черновик" записи,
//    *  - переводит пользователя на шаг /booking/verify
//    *    для окончательной валидации и подтверждения.
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
//         err instanceof Error ? err.message : "Не удалось создать запись";
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
//               Укажите ваши данные, чтобы мы подтвердили бронь и отправили детали
//               записи.
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Имя <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className={`${fieldBase} ${name ? fieldFilled : ""} ${
//                   nameErr ? fieldError : ""
//                 }`}
//                 placeholder="Ваше полное имя"
//                 required
//               />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Телефон <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="phone"
//                 type="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className={`${fieldBase} ${phone ? fieldFilled : ""} ${
//                   phoneErr ? fieldError : ""
//                 }`}
//                 placeholder="+49 (xxx) xxx-xx-xx"
//                 required
//               />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 E-mail <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Дата рождения <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="birth"
//                 type="date"
//                 value={birth}
//                 onChange={(e) => setBirth(e.target.value)}
//                 min={minBirth}
//                 max={maxBirth}
//                 className={`${fieldBase} ${birth ? fieldFilled : ""} ${
//                   birthErr ? fieldError : ""
//                 }`}
//                 required
//               />
//               {birthErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {birthErr}
//                 </p>
//               )}
//               <p className="mt-1 text-xs text-white/50">
//                 Для онлайн-записи требуется возраст 16+
//               </p>
//             </div>

//             {/* Как узнали о нас */}
//             <div>
//               <label
//                 htmlFor="referral"
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Как вы узнали о нас? <span className="text-red-400">*</span>
//               </label>
//               <select
//                 id="referral"
//                 value={referral}
//                 onChange={(e) =>
//                   setReferral(e.target.value as ReferralKind | "")
//                 }
//                 className={`${fieldBase} pr-9 ${
//                   referral ? fieldFilled : ""
//                 } ${referralErr ? fieldError : ""} bg-[#05060a]/90`}
//                 required
//               >
//                 <option value="">Выберите вариант</option>
//                 <option value="google">Google</option>
//                 <option value="facebook">Facebook</option>
//                 <option value="instagram">Instagram</option>
//                 <option value="friends">Рекомендация друзей</option>
//                 <option value="other">Другое</option>
//               </select>

//               {referral === "other" && (
//                 <input
//                   type="text"
//                   value={referralOther}
//                   onChange={(e) => setReferralOther(e.target.value)}
//                   placeholder="Уточните источник"
//                   className={`${fieldBase} mt-3 ${
//                     referralOther ? fieldFilled : ""
//                   }`}
//                 />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Комментарий{" "}
//                 <span className="text-white/45">(необязательно)</span>
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

//             {/* Ошибка отправки */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
//                 <p className="text-sm md:text-base text-red-200">
//                   {submitErr}
//                 </p>
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
//                   text-sm md:text-base text-white/85
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
//                   Если вы допустите ошибку в адресе, вы всё равно сможете
//                   прийти на приём, но не получите напоминания и подтверждения.
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

//--------почти но нужно улучшать
// // File: src/app/booking/(steps)/client/page.tsx
// "use client";

// import * as React from "react";
// import { Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { ArrowLeft, Mail, User } from "lucide-react";

// /* ===================== Типы ===================== */

// type EmailCheck =
//   | { state: "idle" }
//   | { state: "checking" }
//   | { state: "ok" }
//   | { state: "fail"; reason?: string }
//   | { state: "unavailable" };

// type ReferralKind = "google" | "facebook" | "instagram" | "friends" | "other";

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

//   // Премиум-стили полей
//   const fieldBase =
//     "mt-2 w-full rounded-2xl border border-white/10 bg-[#05060a]/90 px-4 py-3 " +
//     "text-sm md:text-base text-white placeholder:text-white/35 " +
//     "shadow-[0_0_25px_rgba(0,0,0,0.9)] transition-all " +
//     "focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300/80";
//   const fieldFilled =
//     "bg-gradient-to-r from-white/12 via-white/5 to-white/10 " +
//     "border-amber-300/70 shadow-[0_0_26px_rgba(245,197,24,0.55)]";
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

//   // E-mail теперь обязателен
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

//   const baseDisabled =
//     !serviceIds.length || !masterId || !startISO || !endISO;

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
//         err instanceof Error ? err.message : "Не удалось создать запись";
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

//           {/* Неоновый фирменный текст */}
//           <motion.p
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="
//               mx-auto text-center max-w-3xl
//               font-serif tracking-wide
//               text-lg md:text-xl
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#6DDCFF] via-[#7F5DFF] to-[#FF4FD8]
//               drop-shadow-[0_0_22px_rgba(80,180,255,0.9)]
//             "
//           >
//             Укажите ваши данные, чтобы мы подтвердили бронь и отправили детали
//             записи.
//           </motion.p>
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Имя <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className={`${fieldBase} ${name ? fieldFilled : ""} ${
//                   nameErr ? fieldError : ""
//                 }`}
//                 placeholder="Ваше полное имя"
//                 required
//               />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Телефон <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="phone"
//                 type="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className={`${fieldBase} ${phone ? fieldFilled : ""} ${
//                   phoneErr ? fieldError : ""
//                 }`}
//                 placeholder="+49 (xxx) xxx-xx-xx"
//                 required
//               />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 E-mail <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Дата рождения <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="birth"
//                 type="date"
//                 value={birth}
//                 onChange={(e) => setBirth(e.target.value)}
//                 min={minBirth}
//                 max={maxBirth}
//                 className={`${fieldBase} ${birth ? fieldFilled : ""} ${
//                   birthErr ? fieldError : ""
//                 }`}
//                 required
//               />
//               {birthErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {birthErr}
//                 </p>
//               )}
//               <p className="mt-1 text-xs text-white/50">
//                 Для онлайн-записи требуется возраст 16+
//               </p>
//             </div>

//             {/* Как узнали о нас */}
//             <div>
//               <label
//                 htmlFor="referral"
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Как вы узнали о нас? <span className="text-red-400">*</span>
//               </label>
//               <select
//                 id="referral"
//                 value={referral}
//                 onChange={(e) =>
//                   setReferral(e.target.value as ReferralKind | "")
//                 }
//                 className={`${fieldBase} pr-9 ${
//                   referral ? fieldFilled : ""
//                 } ${referralErr ? fieldError : ""} bg-[#05060a]/90`}
//                 required
//               >
//                 <option value="">Выберите вариант</option>
//                 <option value="google">Google</option>
//                 <option value="facebook">Facebook</option>
//                 <option value="instagram">Instagram</option>
//                 <option value="friends">Рекомендация друзей</option>
//                 <option value="other">Другое</option>
//               </select>

//               {referral === "other" && (
//                 <input
//                   type="text"
//                   value={referralOther}
//                   onChange={(e) => setReferralOther(e.target.value)}
//                   placeholder="Уточните источник"
//                   className={`${fieldBase} mt-3 ${
//                     referralOther ? fieldFilled : ""
//                   }`}
//                 />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Комментарий{" "}
//                 <span className="text-white/45">(необязательно)</span>
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

//             {/* Ошибка отправки */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
//                 <p className="text-sm md:text-base text-red-200">
//                   {submitErr}
//                 </p>
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
//                   text-sm md:text-base text-white/85
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
//                 {submitting ? "Создание записи..." : "Забронировать"}
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
//               <h3 className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-3">
//                 Почему мы просим e-mail?
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
//                   Если вы допустите ошибку в адресе, вы всё равно сможете
//                   прийти на приём, но не получите напоминания и подтверждения.
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

//------------нет хедера и бронирует раньше времени
// // File: src/app/booking/(steps)/client/page.tsx
// 'use client';

// import * as React from 'react';
// import { Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import {
//   User,
//   Phone,
//   Mail,
//   Calendar,
//   MessageCircle,
//   Info,
//   ArrowLeft,
// } from 'lucide-react';

// type EmailCheck =
//   | { state: 'idle' }
//   | { state: 'checking' }
//   | { state: 'ok' }
//   | { state: 'fail'; reason?: string }
//   | { state: 'unavailable' };

// type ReferralKind = 'google' | 'facebook' | 'instagram' | 'friends' | 'other';

// function isValidEmailSyntax(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// function formatYMD(d: Date): string {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${y}-${m}-${day}`;
// }

// function yearsAgo(n: number): Date {
//   const d = new Date();
//   d.setFullYear(d.getFullYear() - n);
//   return d;
// }

// function ClientForm(): React.JSX.Element {
//   const params = useSearchParams();
//   const router = useRouter();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );
//   const masterId = params.get('m') ?? '';
//   const startISO = params.get('start') ?? '';
//   const endISO = params.get('end') ?? '';

//   const [name, setName] = React.useState<string>('');
//   const [phone, setPhone] = React.useState<string>('');
//   const [email, setEmail] = React.useState<string>('');
//   const [emailCheck, setEmailCheck] = React.useState<EmailCheck>({
//     state: 'idle',
//   });

//   const [birth, setBirth] = React.useState<string>('');
//   const [referral, setReferral] = React.useState<ReferralKind | ''>('');
//   const [referralOther, setReferralOther] = React.useState<string>('');
//   const [comment, setComment] = React.useState<string>('');

//   const [submitErr, setSubmitErr] = React.useState<string | null>(null);
//   const [submitting, setSubmitting] = React.useState<boolean>(false);

//   const maxBirth = formatYMD(new Date());
//   const minBirth = formatYMD(yearsAgo(120));
//   const minAdult = formatYMD(yearsAgo(16));

//   const nameErr = name.trim().length < 2 ? 'Укажите имя полностью' : null;
//   const phoneErr =
//     phone.trim().length < 6 ? 'Укажите корректный номер телефона' : null;

//   const birthDate = birth ? new Date(birth + 'T00:00:00') : null;
//   let birthErr: string | null = null;
//   if (!birth) birthErr = 'Дата рождения обязательна';
//   else if (birthDate && birthDate > new Date())
//     birthErr = 'Дата в будущем недопустима';
//   else if (birth && birth > minAdult)
//     birthErr = 'Для онлайн-записи требуется возраст 16+';

//   let emailErr: string | null = null;
//   if (!email) {
//     emailErr = 'E-mail обязателен';
//   } else {
//     if (!isValidEmailSyntax(email)) emailErr = 'Некорректный e-mail';
//     else if (emailCheck.state === 'fail')
//       emailErr = emailCheck.reason ?? 'E-mail не подтвержден';
//   }

//   const referralErr =
//     referral === ''
//       ? 'Выберите вариант'
//       : referral === 'other' && !referralOther.trim()
//       ? 'Уточните источник'
//       : null;

//   const baseDisabled = !serviceIds.length || !masterId || !startISO || !endISO;

//   const formValid =
//     !baseDisabled &&
//     !nameErr &&
//     !phoneErr &&
//     !birthErr &&
//     !emailErr &&
//     !referralErr &&
//     emailCheck.state !== 'checking';

//   // Проверка email с задержкой
//   React.useEffect(() => {
//     if (!email || !isValidEmailSyntax(email)) {
//       setEmailCheck({ state: 'idle' });
//       return;
//     }

//     setEmailCheck({ state: 'checking' });
//     const timer = setTimeout(async () => {
//       try {
//         const res = await fetch(
//           `/api/email-check?email=${encodeURIComponent(email)}`,
//         );
//         if (!res.ok) {
//           setEmailCheck({ state: 'unavailable' });
//           return;
//         }
//         const data = await res.json();
//         if (data.ok) {
//           setEmailCheck({ state: 'ok' });
//         } else {
//           setEmailCheck({ state: 'fail', reason: data.reason });
//         }
//       } catch {
//         setEmailCheck({ state: 'unavailable' });
//       }
//     }, 800);

//     return () => clearTimeout(timer);
//   }, [email]);

//   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
//     e.preventDefault();
//     if (!formValid || submitting) return;

//     setSubmitting(true);
//     setSubmitErr(null);

//     try {
//       const qs = new URLSearchParams();
//       serviceIds.forEach((id) => qs.append('s', id));
//       qs.set('m', masterId);
//       qs.set('start', startISO);
//       qs.set('end', endISO);

//       const res = await fetch(`/api/booking/client?${qs.toString()}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           customerName: name.trim(),
//           phone: phone.trim(),
//           email: email.trim(),
//           birthDateISO: birth || undefined,
//           referral: referral === 'other' ? 'other' : referral || undefined,
//           notes: comment.trim() || undefined,
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data.error || `HTTP ${res.status}`);
//       }

//       const result = await res.json();

//       if (result.draftId) {
//         const verifyUrl = `/booking/verify?draft=${
//           result.draftId
//         }&email=${encodeURIComponent(email.trim())}&${qs.toString()}`;
//         router.push(verifyUrl);
//       } else {
//         throw new Error('Некорректный ответ от сервера');
//       }
//     } catch (err) {
//       const msg =
//         err instanceof Error ? err.message : 'Не удалось создать запись';
//       setSubmitErr(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (baseDisabled) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
//         <div className="max-w-xl w-full rounded-2xl border border-red-500/40 bg-red-500/10 p-6 shadow-[0_0_40px_rgba(248,113,113,0.35)]">
//           <p className="text-sm md:text-base">
//             Некорректные параметры. Пожалуйста, начните запись заново.
//           </p>
//           <button
//             type="button"
//             onClick={() => router.push('/booking')}
//             className="mt-4 inline-flex items-center gap-2 rounded-full border border-yellow-400/70 bg-yellow-400/10 px-4 py-2 text-sm hover:bg-yellow-400/20 transition-colors"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Вернуться к выбору услуг
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const baseInputClass =
//     'w-full rounded-2xl border px-4 py-2.5 md:py-3 bg-[#05070d]/95 text-[15px] md:text-base font-serif italic text-sky-100 placeholder:font-sans placeholder:italic placeholder:text-slate-500 shadow-[0_0_22px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:border-amber-300 transition-all duration-200';

//   const neonFilledBorder =
//     'border-amber-300/80 shadow-[0_0_26px_rgba(245,197,24,0.55)]';
//   const normalBorder = 'border-white/15';

//   const nameBorder =
//     nameErr != null
//       ? 'border-red-500/70 shadow-[0_0_22px_rgba(248,113,113,0.55)]'
//       : name.trim()
//       ? neonFilledBorder
//       : normalBorder;

//   const phoneBorder =
//     phoneErr != null
//       ? 'border-red-500/70 shadow-[0_0_22px_rgba(248,113,113,0.55)]'
//       : phone.trim()
//       ? neonFilledBorder
//       : normalBorder;

//   const emailBorder =
//     emailErr != null
//       ? 'border-red-500/70 shadow-[0_0_22px_rgba(248,113,113,0.55)]'
//       : emailCheck.state === 'ok'
//       ? 'border-emerald-400/90 shadow-[0_0_26px_rgba(16,185,129,0.65)]'
//       : email.trim()
//       ? neonFilledBorder
//       : normalBorder;

//   const birthBorder =
//     birthErr != null
//       ? 'border-red-500/70 shadow-[0_0_22px_rgba(248,113,113,0.55)]'
//       : birth
//       ? neonFilledBorder
//       : normalBorder;

//   const referralBorder =
//     referralErr != null
//       ? 'border-red-500/70 shadow-[0_0_22px_rgba(248,113,113,0.55)]'
//       : referral
//       ? neonFilledBorder
//       : normalBorder;

//   const commentBorder = comment.trim() ? neonFilledBorder : normalBorder;

//   return (
//     <div className="min-h-screen bg-black text-white relative overflow-hidden pb-20">
//       {/* мягкие фоновые пятна */}
//       <div className="pointer-events-none fixed inset-0">
//         <div className="absolute -top-40 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[110px]" />
//         <div className="absolute top-1/3 -right-40 w-[420px] h-[420px] bg-sky-500/12 rounded-full blur-[120px]" />
//         <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-[120px]" />
//       </div>

//       <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 md:pt-28">
//         {/* Заголовок */}
//         <div className="text-center mb-10 md:mb-12">
//           <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-amber-500/80 via-yellow-500/80 to-amber-500/80 px-6 md:px-8 py-2.5 shadow-[0_12px_40px_rgba(245,197,24,0.45)]">
//             <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/20">
//               <User className="w-4 h-4 text-black/85" />
//             </span>
//             <span className="font-serif italic text-sm md:text-base text-black">
//               Шаг 4 — Ваши контактные данные
//             </span>
//           </div>

//           <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#F5C518]/90 via-[#FFE38A]/90 to-[#F5C518]/90 drop-shadow-[0_0_18px_rgba(245,197,24,0.45)]">
//             Онлайн-запись
//           </h1>

//           <p className="mt-4 text-base md:text-xl font-serif italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-sky-100 to-fuchsia-300 drop-shadow-[0_0_18px_rgba(56,189,248,0.55)]">
//             Укажите ваши данные, чтобы мы подтвердили бронь и отправили детали
//             записи.
//           </p>
//         </div>

//         {/* Основная сетка: форма + инфо-блок */}
//         <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] gap-6 md:gap-8 items-start">
//           {/* Форма */}
//           <form
//             onSubmit={handleSubmit}
//             className="relative rounded-3xl border border-white/12 bg-black/70 backdrop-blur-md p-5 md:p-7 shadow-[0_0_60px_rgba(0,0,0,0.85)] space-y-6"
//           >
//             {/* Имя */}
//             <div>
//               <label
//                 htmlFor="name"
//                 className="flex items-center gap-2 text-sm md:text-base font-medium text-white/80 mb-1.5"
//               >
//                 <User className="w-4 h-4 text-amber-300" />
//                 <span>
//                   Имя <span className="text-red-400">*</span>
//                 </span>
//               </label>
//               <div className="relative">
//                 <input
//                   id="name"
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className={`${baseInputClass} ${nameBorder} pl-10`}
//                   placeholder="Ваше полное имя"
//                   required
//                 />
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-300/70">
//                   <User className="w-4 h-4" />
//                 </span>
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
//                 className="flex items-center gap-2 text-sm md:text-base font-medium text-white/80 mb-1.5"
//               >
//                 <Phone className="w-4 h-4 text-amber-300" />
//                 <span>
//                   Телефон <span className="text-red-400">*</span>
//                 </span>
//               </label>
//               <div className="relative">
//                 <input
//                   id="phone"
//                   type="tel"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   className={`${baseInputClass} ${phoneBorder} pl-10`}
//                   placeholder="+7 (xxx) xxx-xx-xx"
//                   required
//                 />
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-300/70">
//                   <Phone className="w-4 h-4" />
//                 </span>
//               </div>
//               {phoneErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {phoneErr}
//                 </p>
//               )}
//             </div>

//             {/* E-mail */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="flex items-center gap-2 text-sm md:text-base font-medium text-white/80 mb-1.5"
//               >
//                 <Mail className="w-4 h-4 text-amber-300" />
//                 <span>
//                   E-mail <span className="text-red-400">*</span>
//                 </span>
//               </label>
//               <div className="relative">
//                 <input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className={`${baseInputClass} ${emailBorder} pl-10`}
//                   placeholder="your@email.com"
//                   required
//                 />
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-300/70">
//                   <Mail className="w-4 h-4" />
//                 </span>
//               </div>
//               {emailCheck.state === 'checking' && (
//                 <p className="mt-1 text-xs md:text-sm text-slate-400">
//                   Проверка…
//                 </p>
//               )}
//               {emailCheck.state === 'ok' && !emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-emerald-400">
//                   ✓ E-mail подтверждён
//                 </p>
//               )}
//               {emailCheck.state === 'unavailable' && !emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-slate-400">
//                   Не удалось проверить e-mail, но вы можете продолжить.
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
//                 className="flex items-center gap-2 text-sm md:text-base font-medium text-white/80 mb-1.5"
//               >
//                 <Calendar className="w-4 h-4 text-amber-300" />
//                 <span>
//                   Дата рождения <span className="text-red-400">*</span>
//                 </span>
//               </label>
//               <div className="relative">
//                 <input
//                   id="birth"
//                   type="date"
//                   value={birth}
//                   onChange={(e) => setBirth(e.target.value)}
//                   min={minBirth}
//                   max={maxBirth}
//                   className={`${baseInputClass} ${birthBorder} pr-10`}
//                   required
//                 />
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sky-300/70">
//                   <Calendar className="w-4 h-4" />
//                 </span>
//               </div>
//               {birthErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {birthErr}
//                 </p>
//               )}
//               <p className="mt-1 text-[11px] md:text-xs text-slate-400">
//                 Для онлайн-записи требуется возраст 16+
//               </p>
//             </div>

//             {/* Как узнали о нас */}
//             <div>
//               <label
//                 htmlFor="referral"
//                 className="flex items-center gap-2 text-sm md:text-base font-medium text-white/80 mb-1.5"
//               >
//                 <Info className="w-4 h-4 text-amber-300" />
//                 <span>
//                   Как вы узнали о нас? <span className="text-red-400">*</span>
//                 </span>
//               </label>
//               <div className="relative">
//                 <select
//                   id="referral"
//                   value={referral}
//                   onChange={(e) =>
//                     setReferral(e.target.value as ReferralKind | '')
//                   }
//                   className={`${baseInputClass} ${referralBorder} pr-10 appearance-none`}
//                   required
//                 >
//                   <option value="">Выберите вариант</option>
//                   <option value="google">Google</option>
//                   <option value="facebook">Facebook</option>
//                   <option value="instagram">Instagram</option>
//                   <option value="friends">Рекомендация друзей</option>
//                   <option value="other">Другое</option>
//                 </select>
//                 {/* неоновая «рамка» селекта */}
//                 <div className="pointer-events-none absolute inset-0 rounded-2xl border border-yellow-400/60 opacity-0 group-focus-within:opacity-100" />
//                 <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sky-300/70">
//                   <Info className="w-4 h-4" />
//                 </span>
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sky-200">
//                   ▾
//                 </span>
//               </div>
//               {referral === 'other' && (
//                 <input
//                   type="text"
//                   value={referralOther}
//                   onChange={(e) => setReferralOther(e.target.value)}
//                   placeholder="Уточните источник"
//                   className={`${baseInputClass} ${referralOther.trim() ? neonFilledBorder : normalBorder} mt-2`}
//                 />
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
//                 className="flex items-center gap-2 text-sm md:text-base font-medium text-white/80 mb-1.5"
//               >
//                 <MessageCircle className="w-4 h-4 text-amber-300" />
//                 <span>
//                   Комментарий{' '}
//                   <span className="text-slate-400">(необязательно)</span>
//                 </span>
//               </label>
//               <div className="relative">
//                 <textarea
//                   id="comment"
//                   value={comment}
//                   onChange={(e) => setComment(e.target.value)}
//                   rows={3}
//                   className={`${baseInputClass} ${commentBorder} pr-10 resize-none`}
//                   placeholder="Дополнительная информация или пожелания"
//                 />
//                 <span className="pointer-events-none absolute left-3 top-3 text-sky-300/70">
//                   <MessageCircle className="w-4 h-4" />
//                 </span>
//               </div>
//             </div>

//             {/* Ошибка отправки */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 shadow-[0_0_30px_rgba(248,113,113,0.45)]">
//                 <p className="text-xs md:text-sm text-red-300">{submitErr}</p>
//               </div>
//             )}

//             {/* Кнопки */}
//             <div className="flex flex-col sm:flex-row gap-3 pt-2">
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/60 px-6 py-2.5 text-sm md:text-base text-white/85 hover:border-amber-300/70 hover:text-amber-200 hover:bg-black/80 transition-colors"
//                 disabled={submitting}
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 Назад
//               </button>
//               <button
//                 type="submit"
//                 disabled={!formValid || submitting}
//                 className="flex-1 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-2.5 text-sm md:text-base font-semibold text-black shadow-[0_14px_40px_rgba(245,197,24,0.65)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//               >
//                 {submitting ? 'Создание записи…' : 'Забронировать'}
//               </button>
//             </div>
//           </form>

//           {/* Инфо-блок про e-mail */}
//           <aside className="relative rounded-3xl border border-yellow-400/35 bg-gradient-to-b from-yellow-500/20 via-yellow-500/10 to-black/80 p-5 md:p-6 shadow-[0_0_60px_rgba(245,197,24,0.35)] text-sm md:text-base">
//             <div className="absolute -top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-yellow-300/60 shadow-[0_0_20px_rgba(245,197,24,0.6)]">
//               <Mail className="w-5 h-5 text-yellow-300" />
//             </div>
//             <h3 className="mb-3 text-lg md:text-xl font-semibold text-yellow-300">
//               Почему мы просим e-mail?
//             </h3>
//             <p className="text-white/85 mb-3">
//               На ваш e-mail мы отправим подтверждение брони и все детали
//               записи. Также вы получите напоминание перед визитом.
//             </p>
//             <p className="text-white/80 mb-3">
//               Мы бережно относимся к персональным данным и используем их только
//               для обслуживания вашей записи.
//             </p>
//             <div className="my-3 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
//             <p className="text-white/75 text-sm">
//               Если вы допустите ошибку в e-mail, вы всё равно сможете прийти на
//               приём, но не получите напоминания и подтверждения.
//             </p>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function ClientPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-black flex items-center justify-center">
//           <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
//         </div>
//       }
//     >
//       <ClientForm />
//     </Suspense>
//   );
// }

// // File: src/app/booking/(steps)/client/page.tsx
// 'use client';

// import * as React from 'react';
// import { Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import { User, Mail } from 'lucide-react';

// type EmailCheck =
//   | { state: 'idle' }
//   | { state: 'checking' }
//   | { state: 'ok' }
//   | { state: 'fail'; reason?: string }
//   | { state: 'unavailable' };

// type ReferralKind = 'google' | 'facebook' | 'instagram' | 'friends' | 'other';

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// function isValidEmailSyntax(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// function formatYMD(d: Date): string {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${y}-${m}-${day}`;
// }

// function yearsAgo(n: number): Date {
//   const d = new Date();
//   d.setFullYear(d.getFullYear() - n);
//   return d;
// }

// /** Базовый класс для всех инпутов-капсул */
// const baseFieldClass =
//   'mt-1 w-full rounded-2xl border border-white/15 bg-[#111319]/95 ' +
//   'px-4 py-3 text-sm md:text-base transition-all shadow-[0_0_25px_rgba(0,0,0,0.7)] ' +
//   'focus:outline-none focus:ring-0 focus:border-amber-400/70 ' +
//   'placeholder:text-white/30';

// /** Неоновый текст, когда поле заполнено */
// const neonFieldTextClass = (filled: boolean): string =>
//   filled
//     ? 'font-serif italic text-[#64c7ff] drop-shadow-[0_0_14px_rgba(120,200,255,0.8)]'
//     : 'text-white/80';

// /* ======================= Шапка/оболочка ======================= */

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen bg-black text-white relative overflow-hidden">
//       <header className="booking-header fixed top-0 inset-x-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/10">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//           <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       {/* отступ под фиксированный header */}
//       <div className="h-[84px] md:h-[96px]" />

//       {/* мягкие световые пятна на фоне */}
//       <div className="pointer-events-none fixed inset-0 -z-10">
//         <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-500/12 blur-3xl" />
//         <div className="absolute right-0 bottom-10 h-80 w-80 rounded-full bg-cyan-500/12 blur-3xl" />
//       </div>

//       {children}
//     </div>
//   );
// }

// /* ======================= Форма клиента ======================= */

// function ClientForm(): React.JSX.Element {
//   const params = useSearchParams();
//   const router = useRouter();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );
//   const masterId = params.get('m') ?? '';
//   const startISO = params.get('start') ?? '';
//   const endISO = params.get('end') ?? '';

//   const [name, setName] = React.useState<string>('');
//   const [phone, setPhone] = React.useState<string>('');
//   const [email, setEmail] = React.useState<string>('');
//   const [emailCheck, setEmailCheck] = React.useState<EmailCheck>({ state: 'idle' });

//   const [birth, setBirth] = React.useState<string>('');
//   const [referral, setReferral] = React.useState<ReferralKind | ''>('');
//   const [referralOther, setReferralOther] = React.useState<string>('');
//   const [comment, setComment] = React.useState<string>('');

//   const [submitErr, setSubmitErr] = React.useState<string | null>(null);
//   const [submitting, setSubmitting] = React.useState<boolean>(false);

//   const maxBirth = formatYMD(new Date());
//   const minBirth = formatYMD(yearsAgo(120));
//   const minAdult = formatYMD(yearsAgo(16));

//   const nameErr = name.trim().length < 2 ? 'Укажите имя полностью' : null;
//   const phoneErr = phone.trim().length < 6 ? 'Укажите корректный номер телефона' : null;

//   const birthDate = birth ? new Date(birth + 'T00:00:00') : null;
//   let birthErr: string | null = null;
//   if (!birth) birthErr = 'Дата рождения обязательна';
//   else if (birthDate && birthDate > new Date()) birthErr = 'Дата в будущем недопустима';
//   else if (birth && birth > minAdult) birthErr = 'Для онлайн-записи требуется возраст 16+';

//   // E-mail теперь обязателен
//   let emailErr: string | null = null;
//   if (!email) {
//     emailErr = 'E-mail обязателен';
//   } else if (!isValidEmailSyntax(email)) {
//     emailErr = 'Некорректный e-mail';
//   } else if (emailCheck.state === 'fail') {
//     emailErr = emailCheck.reason ?? 'E-mail не подтвержден';
//   }

//   const referralErr =
//     referral === ''
//       ? 'Выберите вариант'
//       : referral === 'other' && !referralOther.trim()
//       ? 'Уточните источник'
//       : null;

//   const baseDisabled = !serviceIds.length || !masterId || !startISO || !endISO;

//   const formValid =
//     !baseDisabled &&
//     !nameErr &&
//     !phoneErr &&
//     !birthErr &&
//     !emailErr &&
//     !referralErr &&
//     emailCheck.state !== 'checking';

//   // Проверка email с задержкой
//   React.useEffect(() => {
//     if (!email || !isValidEmailSyntax(email)) {
//       setEmailCheck({ state: 'idle' });
//       return;
//     }

//     setEmailCheck({ state: 'checking' });
//     const timer = setTimeout(async () => {
//       try {
//         const res = await fetch(`/api/email-check?email=${encodeURIComponent(email)}`);
//         if (!res.ok) {
//           setEmailCheck({ state: 'unavailable' });
//           return;
//         }
//         const data = await res.json();
//         if (data.ok) {
//           setEmailCheck({ state: 'ok' });
//         } else {
//           setEmailCheck({ state: 'fail', reason: data.reason });
//         }
//       } catch {
//         setEmailCheck({ state: 'unavailable' });
//       }
//     }, 800);

//     return () => clearTimeout(timer);
//   }, [email]);

//   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
//     e.preventDefault();
//     if (!formValid || submitting) return;

//     setSubmitting(true);
//     setSubmitErr(null);

//     try {
//       const qs = new URLSearchParams();
//       serviceIds.forEach(id => qs.append('s', id));
//       qs.set('m', masterId);
//       qs.set('start', startISO);
//       qs.set('end', endISO);

//       const res = await fetch(`/api/booking/client?${qs.toString()}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           customerName: name.trim(),
//           phone: phone.trim(),
//           email: email.trim(),
//           birthDateISO: birth || undefined,
//           referral: referral === 'other' ? 'other' : referral || undefined,
//           notes: comment.trim() || undefined,
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data.error || `HTTP ${res.status}`);
//       }

//       const result = await res.json();
//       if (result.draftId) {
//         const verifyUrl = `/booking/verify?draft=${result.draftId}&email=${encodeURIComponent(
//           email.trim(),
//         )}&${qs.toString()}`;
//         router.push(verifyUrl);
//       } else {
//         throw new Error('Некорректный ответ от сервера');
//       }
//     } catch (err) {
//       const msg = err instanceof Error ? err.message : 'Не удалось создать запись';
//       setSubmitErr(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (baseDisabled) {
//     return (
//       <PageShell>
//         <div className="mx-auto max-w-2xl px-4 py-10">
//           <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
//             <p className="text-red-200">
//               Некорректные параметры. Пожалуйста, начните запись заново.
//             </p>
//             <Link href="/booking" className="mt-4 inline-block text-sm underline">
//               Вернуться к выбору услуг
//             </Link>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 pb-24">
//         {/* Заголовок / шаг */}
//         <div className="w-full flex flex-col items-center text-center">
//           <motion.div
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: 'spring', stiffness: 280, damping: 24 }}
//             className="relative inline-block mt-4 md:mt-6 mb-6"
//           >
//             <div className="absolute -inset-2 rounded-full blur-xl opacity-60 bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40" />
//             <div className="relative flex items-center gap-2 px-6 md:px-8 py-2.5 rounded-full border border-white/15 bg-gradient-to-r from-amber-500/80 via-yellow-500/80 to-amber-500/80 text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)]">
//               <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/15">
//                 <User className="w-4 h-4 text-black/80" />
//               </span>
//               <span className="font-serif italic tracking-wide text-sm md:text-base">
//                 Шаг 4 — Ваши контактные данные
//               </span>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 drop-shadow-[0_0_18px_rgba(245,197,24,0.35)] mb-3 md:mb-4"
//           >
//             Онлайн-запись
//           </motion.h1>

//           {/* НЕОНОВЫЙ СЛОГАН */}
//           <motion.p
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="
//               mx-auto max-w-3xl text-center
//               font-serif italic tracking-wide
//               text-lg md:text-xl
//               text-transparent bg-clip-text bg-gradient-to-r
//               from-[#56d2ff] via-[#7fd6ff] to-[#e079ff]
//               drop-shadow-[0_0_20px_rgba(120,200,255,0.8)]
//             "
//           >
//             Укажите ваши данные, чтобы мы подтвердили бронь и отправили детали записи.
//           </motion.p>
//         </div>

//         {/* Основная сетка: форма + блок про e-mail */}
//         <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] items-start">
//           {/* Левая колонка — форма */}
//           <motion.form
//             onSubmit={handleSubmit}
//             initial={{ opacity: 0, x: -18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.25 }}
//             className="space-y-5 md:space-y-6 rounded-3xl border border-white/12 bg-black/70 p-5 md:p-6 shadow-[0_0_55px_rgba(0,0,0,0.7)]"
//           >
//             {/* Имя */}
//             <div>
//               <label className="block text-xs md:text-sm font-medium text-white/75">
//                 Имя <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 value={name}
//                 onChange={e => setName(e.target.value)}
//                 className={`${baseFieldClass} ${neonFieldTextClass(!!name)}`}
//                 placeholder="Ваше полное имя"
//                 required
//               />
//               {nameErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">{nameErr}</p>
//               )}
//             </div>

//             {/* Телефон */}
//             <div>
//               <label className="block text-xs md:text-sm font-medium text-white/75">
//                 Телефон <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="phone"
//                 type="tel"
//                 value={phone}
//                 onChange={e => setPhone(e.target.value)}
//                 className={`${baseFieldClass} ${neonFieldTextClass(!!phone)}`}
//                 placeholder="+7 (xxx) xxx-xx-xx"
//                 required
//               />
//               {phoneErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">{phoneErr}</p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-white/75">
//                 <span>E-mail</span>
//                 <Mail className="w-3.5 h-3.5 opacity-70" />
//                 <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 className={`${baseFieldClass} ${neonFieldTextClass(!!email)}`}
//                 placeholder="your@email.com"
//                 required
//               />
//               {emailCheck.state === 'checking' && (
//                 <p className="mt-1 text-xs md:text-sm text-white/60">Проверка…</p>
//               )}
//               {emailCheck.state === 'ok' && !emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-emerald-300">
//                   ✓ E-mail подтверждён
//                 </p>
//               )}
//               {emailCheck.state === 'unavailable' && !emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-white/55">
//                   Не удалось проверить e-mail, но вы всё равно можете продолжить.
//                 </p>
//               )}
//               {emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">{emailErr}</p>
//               )}
//             </div>

//             {/* Дата рождения */}
//             <div>
//               <label className="block text-xs md:text-sm font-medium text-white/75">
//                 Дата рождения <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="birth"
//                 type="date"
//                 value={birth}
//                 onChange={e => setBirth(e.target.value)}
//                 min={minBirth}
//                 max={maxBirth}
//                 className={`${baseFieldClass} ${neonFieldTextClass(!!birth)}`}
//                 required
//               />
//               {birthErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">{birthErr}</p>
//               )}
//               <p className="mt-1 text-[11px] md:text-xs text-white/50">
//                 Для онлайн-записи требуется возраст 16+
//               </p>
//             </div>

//             {/* Как узнали о нас */}
//             <div>
//               <label className="block text-xs md:text-sm font-medium text-white/75">
//                 Как вы узнали о нас? <span className="text-red-400">*</span>
//               </label>
//               <select
//                 id="referral"
//                 value={referral}
//                 onChange={e => setReferral(e.target.value as ReferralKind | '')}
//                 className={`${baseFieldClass} ${neonFieldTextClass(!!referral)} cursor-pointer`}
//                 required
//               >
//                 <option value="">Выберите вариант</option>
//                 <option value="google">Google</option>
//                 <option value="facebook">Facebook</option>
//                 <option value="instagram">Instagram</option>
//                 <option value="friends">Рекомендация друзей</option>
//                 <option value="other">Другое</option>
//               </select>
//               {referral === 'other' && (
//                 <input
//                   type="text"
//                   value={referralOther}
//                   onChange={e => setReferralOther(e.target.value)}
//                   placeholder="Уточните источник"
//                   className={`${baseFieldClass} ${neonFieldTextClass(!!referralOther)} mt-2`}
//                 />
//               )}
//               {referralErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">{referralErr}</p>
//               )}
//             </div>

//             {/* Комментарий */}
//             <div>
//               <label className="block text-xs md:text-sm font-medium text-white/75">
//                 Комментарий{' '}
//                 <span className="text-white/45">(необязательно)</span>
//               </label>
//               <textarea
//                 id="comment"
//                 value={comment}
//                 onChange={e => setComment(e.target.value)}
//                 rows={3}
//                 className={`${baseFieldClass} ${neonFieldTextClass(!!comment)} resize-none`}
//                 placeholder="Дополнительная информация или пожелания"
//               />
//             </div>

//             {/* Ошибка отправки */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-100">
//                 {submitErr}
//               </div>
//             )}

//             {/* Кнопки */}
//             <div className="flex flex-col sm:flex-row gap-3 pt-1">
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="sm:w-40 rounded-2xl border border-white/20 bg-black/60 px-6 py-2.5 text-sm md:text-base text-white/80 hover:bg-white/10 hover:text-white transition-colors"
//                 disabled={submitting}
//               >
//                 Назад
//               </button>
//               <button
//                 type="submit"
//                 disabled={!formValid || submitting}
//                 className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-2.5 text-sm md:text-base font-semibold text-black shadow-[0_0_30px_rgba(245,197,24,0.7)] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {submitting ? 'Создание записи…' : 'Забронировать'}
//               </button>
//             </div>
//           </motion.form>

//           {/* Правая колонка — почему e-mail обязателен */}
//           <motion.aside
//             initial={{ opacity: 0, x: 18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/80 via-black/70 to-black/80 p-5 md:p-6 shadow-[0_0_55px_rgba(0,0,0,0.7)] text-sm md:text-[15px] text-white/80"
//           >
//             <h3 className="text-lg md:text-xl font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
//               Почему мы просим e-mail?
//             </h3>
//             <p className="mb-3">
//               На ваш e-mail мы отправим подтверждение брони и все детали записи. Также вы
//               получите напоминание перед визитом.
//             </p>
//             <p className="mb-3">
//               Мы бережно относимся к персональным данным и используем их только для
//               обслуживания вашей записи.
//             </p>
//             <p className="text-xs md:text-sm text-white/70 border-t border-white/10 pt-3 mt-2">
//               Если вы допустите ошибку в e-mail, вы всё равно сможете прийти на приём,
//               но не получите напоминания и подтверждения.
//             </p>
//           </motion.aside>
//         </div>
//       </main>
//     </PageShell>
//   );
// }

// export default function ClientPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen flex items-center justify-center bg-black text-white">
//           <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
//         </div>
//       }
//     >
//       <ClientForm />
//     </Suspense>
//   );
// }

// // File: src/app/booking/(steps)/client/page.tsx
// "use client";

// import * as React from "react";
// import { Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { ArrowLeft, Mail, User } from "lucide-react";

// /* ===================== Типы ===================== */

// type EmailCheck =
//   | { state: "idle" }
//   | { state: "checking" }
//   | { state: "ok" }
//   | { state: "fail"; reason?: string }
//   | { state: "unavailable" };

// type ReferralKind = "google" | "facebook" | "instagram" | "friends" | "other";

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

//   // Премиум-стили полей
//   const fieldBase =
//     "mt-2 w-full rounded-2xl border border-white/10 bg-[#05060a]/90 px-4 py-3 " +
//     "text-sm md:text-base text-white placeholder:text-white/35 " +
//     "shadow-[0_0_25px_rgba(0,0,0,0.9)] transition-all " +
//     "focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300/80";
//   const fieldFilled =
//     "bg-gradient-to-r from-white/12 via-white/5 to-white/10 " +
//     "border-amber-300/70 shadow-[0_0_26px_rgba(245,197,24,0.55)]";
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

//   // E-mail теперь обязателен
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

//   const baseDisabled =
//     !serviceIds.length || !masterId || !startISO || !endISO;

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
//         err instanceof Error ? err.message : "Не удалось создать запись";
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

//           {/* Неоновый фирменный текст */}
//           <motion.p
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="
//               mx-auto text-center max-w-3xl
//               font-serif tracking-wide
//               text-lg md:text-xl
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#6DDCFF] via-[#7F5DFF] to-[#FF4FD8]
//               drop-shadow-[0_0_22px_rgba(80,180,255,0.9)]
//             "
//           >
//             Укажите ваши данные, чтобы мы подтвердили бронь и отправили детали
//             записи.
//           </motion.p>
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Имя <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className={`${fieldBase} ${name ? fieldFilled : ""} ${
//                   nameErr ? fieldError : ""
//                 }`}
//                 placeholder="Ваше полное имя"
//                 required
//               />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Телефон <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="phone"
//                 type="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className={`${fieldBase} ${phone ? fieldFilled : ""} ${
//                   phoneErr ? fieldError : ""
//                 }`}
//                 placeholder="+49 (xxx) xxx-xx-xx"
//                 required
//               />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 E-mail <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Дата рождения <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="birth"
//                 type="date"
//                 value={birth}
//                 onChange={(e) => setBirth(e.target.value)}
//                 min={minBirth}
//                 max={maxBirth}
//                 className={`${fieldBase} ${birth ? fieldFilled : ""} ${
//                   birthErr ? fieldError : ""
//                 }`}
//                 required
//               />
//               {birthErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-400">
//                   {birthErr}
//                 </p>
//               )}
//               <p className="mt-1 text-xs text-white/50">
//                 Для онлайн-записи требуется возраст 16+
//               </p>
//             </div>

//             {/* Как узнали о нас */}
//             <div>
//               <label
//                 htmlFor="referral"
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Как вы узнали о нас? <span className="text-red-400">*</span>
//               </label>
//               <select
//                 id="referral"
//                 value={referral}
//                 onChange={(e) =>
//                   setReferral(e.target.value as ReferralKind | "")
//                 }
//                 className={`${fieldBase} pr-9 ${
//                   referral ? fieldFilled : ""
//                 } ${referralErr ? fieldError : ""} bg-[#05060a]/90`}
//                 required
//               >
//                 <option value="">Выберите вариант</option>
//                 <option value="google">Google</option>
//                 <option value="facebook">Facebook</option>
//                 <option value="instagram">Instagram</option>
//                 <option value="friends">Рекомендация друзей</option>
//                 <option value="other">Другое</option>
//               </select>

//               {referral === "other" && (
//                 <input
//                   type="text"
//                   value={referralOther}
//                   onChange={(e) => setReferralOther(e.target.value)}
//                   placeholder="Уточните источник"
//                   className={`${fieldBase} mt-3 ${
//                     referralOther ? fieldFilled : ""
//                   }`}
//                 />
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
//                 className="block text-sm md:text-base font-medium text-white/80"
//               >
//                 Комментарий{" "}
//                 <span className="text-white/45">(необязательно)</span>
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

//             {/* Ошибка отправки */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
//                 <p className="text-sm md:text-base text-red-200">
//                   {submitErr}
//                 </p>
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
//                   text-sm md:text-base text-white/85
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
//                 {submitting ? "Создание записи..." : "Забронировать"}
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
//               <h3 className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-3">
//                 Почему мы просим e-mail?
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
//                   Если вы допустите ошибку в адресе, вы всё равно сможете
//                   прийти на приём, но не получите напоминания и подтверждения.
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

//---------работает но обновляем стиль-----------
// // File: src/app/booking/(steps)/client/page.tsx
// "use client";

// import * as React from "react";
// import { Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { ArrowLeft, User2, Mail, Sparkles } from "lucide-react";

// type EmailCheck =
//   | { state: "idle" }
//   | { state: "checking" }
//   | { state: "ok" }
//   | { state: "fail"; reason?: string }
//   | { state: "unavailable" };

// type ReferralKind = "google" | "facebook" | "instagram" | "friends" | "other";

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

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

// /* ---------- Общая оболочка ---------- */

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen relative overflow-hidden bg-black text-white">
//       <header
//         className={`
//           fixed top-0 inset-x-0 z-50
//           bg-black/45 backdrop-blur-md border-b border-white/10
//         `}
//       >
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//           <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       {/* отступ под фиксированный header */}
//       <div className="h-[84px] md:h-[96px]" />

//       {children}

//       <div className="pointer-events-none fixed inset-x-0 bottom-[-240px] h-[320px] bg-gradient-to-t from-amber-500/15 via-black/40 to-transparent blur-3xl" />
//     </div>
//   );
// }

// /* ---------- Видео секция ---------- */

// function VideoSection() {
//   return (
//     <section className="relative py-8 sm:py-10">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)]">
//         <video
//           className={`
//             absolute inset-0 h-full w-full
//             object-contain 2xl:object-cover
//             object-[50%_92%] lg:object-[50%_98%] xl:object-[50%_104%] 2xl:object-[50%_96%]
//           `}
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
//         <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/5 pointer-events-none" />
//       </div>
//     </section>
//   );
// }

// /* ---------- Основная форма клиента ---------- */

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

//   const maxBirth = formatYMD(new Date());
//   const minBirth = formatYMD(yearsAgo(120));
//   const minAdult = formatYMD(yearsAgo(16));

//   // ---- Валидация полей ----
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

//   // 👉 E-mail ДОЛЖЕН быть заполнен и корректен
//   let emailErr: string | null = null;
//   const trimmedEmail = email.trim();

//   if (!trimmedEmail) {
//     emailErr = "E-mail обязателен";
//   } else if (!isValidEmailSyntax(trimmedEmail)) {
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

//   // 👉 делаем формулу попроще: emailCheck.state может быть любым, кроме ошибки
//   const formValid =
//     !baseDisabled &&
//     !nameErr &&
//     !phoneErr &&
//     !birthErr &&
//     !emailErr &&
//     !referralErr;

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
//         const verifyUrl = `/booking/verify?draft=${
//           result.draftId
//         }&email=${encodeURIComponent(email.trim())}&${qs.toString()}`;
//         router.push(verifyUrl);
//       } else {
//         throw new Error("Некорректный ответ от сервера");
//       }
//     } catch (err) {
//       const msg =
//         err instanceof Error ? err.message : "Не удалось создать запись";
//       setSubmitErr(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (baseDisabled) {
//     return (
//       <main className="mx-auto max-w-2xl px-4 xl:px-8 pb-24">
//         <div className="mt-10 rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
//           <p className="text-sm md:text-base text-red-200">
//             Некорректные параметры. Пожалуйста, начните запись заново.
//           </p>
//           <Link
//             href="/booking"
//             className="mt-4 inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200 transition-colors"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Вернуться к выбору услуг
//           </Link>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 pb-28">
//         {/* Заголовок */}
//         <div className="w-full flex flex-col items-center text-center">
//           <div className="relative inline-block mt-4 md:mt-6 mb-5 md:mb-6">
//             <div className="absolute -inset-2 rounded-full blur-xl opacity-60 bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40" />
//             <div
//               className={`
//                 relative flex items-center gap-2
//                 px-6 md:px-8 py-2.5 md:py-3
//                 rounded-full border border-white/15
//                 bg-gradient-to-r from-amber-500/70 via-yellow-500/70 to-amber-500/70
//                 text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)]
//                 backdrop-blur-sm
//               `}
//             >
//               <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/15">
//                 <User2 className="w-4 h-4 text-black/80" />
//               </span>
//               <span className="font-serif italic tracking-wide text-sm md:text-base">
//                 Шаг 4 — Ваши контактные данные
//               </span>
//             </div>
//           </div>

//           <h1
//             className={`
//               mx-auto text-center
//               text-4xl md:text-5xl lg:text-5xl xl:text-6xl
//               font-serif italic leading-tight
//               mb-3 md:mb-4
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//               drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//             `}
//           >
//             Онлайн-запись
//           </h1>

//           <p
//             className="
//               mx-auto text-center max-w-2xl
//               font-serif italic tracking-wide
//               text-lg md:text-xl
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#7b5cff] via-[#4f8dff] to-[#3bc5ff]
//             "
//             style={{
//               textShadow:
//                 "0 0 6px rgba(70,140,255,1), 0 0 14px rgba(70,140,255,0.95), 0 0 26px rgba(40,120,255,0.9)",
//             }}
//           >
//             Укажите ваши данные, чтобы мы подтвердили бронь и отправили детали
//             записи.
//           </p>
//         </div>

//         {/* Форма + боковой блок */}
//         <section className="mt-8 md:mt-10 grid gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-start">
//           {/* Левая колонка — форма */}
//           <form
//             onSubmit={handleSubmit}
//             className="relative rounded-3xl bg-gradient-to-br from-black/70 via-black/60 to-black/80 border border-white/12 p-5 md:p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] space-y-6"
//           >
//             <div className="pointer-events-none absolute -top-28 -left-24 w-72 h-72 rounded-full bg-amber-500/12 blur-3xl" />
//             <div className="pointer-events-none absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-yellow-400/10 blur-3xl" />

//             {/* Имя */}
//             <div className="relative">
//               <label
//                 htmlFor="name"
//                 className="block text-sm md:text-[15px] font-medium text-white/80"
//               >
//                 Имя <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="name"
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
//                 placeholder="Ваше полное имя"
//                 required
//               />
//               {nameErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-300">
//                   {nameErr}
//                 </p>
//               )}
//             </div>

//             {/* Телефон */}
//             <div className="relative">
//               <label
//                 htmlFor="phone"
//                 className="block text-sm md:text-[15px] font-medium text-white/80"
//               >
//                 Телефон <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="phone"
//                 type="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
//                 placeholder="+7 (xxx) xxx-xx-xx"
//                 required
//               />
//               {phoneErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-300">
//                   {phoneErr}
//                 </p>
//               )}
//             </div>

//             {/* Email (обязательный) */}
//             <div className="relative">
//               <label
//                 htmlFor="email"
//                 className="flex items-center gap-2 text-sm md:text-[15px] font-medium text-white/80"
//               >
//                 <span>E-mail</span>
//                 <span className="text-red-400">*</span>
//                 <Mail className="w-4 h-4 text-white/50" />
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
//                 placeholder="your@email.com"
//                 required
//               />
//               {emailCheck.state === "checking" && !emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-white/55">
//                   Проверка…
//                 </p>
//               )}
//               {emailCheck.state === "ok" && !emailErr && (
//                 <p className="mt-1 flex items-center gap-1 text-xs md:text-sm text-emerald-300">
//                   <Sparkles className="w-3 h-3" />
//                   E-mail подтверждён
//                 </p>
//               )}
//               {emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-300">
//                   {emailErr}
//                 </p>
//               )}
//               {emailCheck.state === "unavailable" && !emailErr && (
//                 <p className="mt-1 text-xs md:text-sm text-white/45">
//                   Не удалось проверить e-mail, но вы можете продолжить.
//                 </p>
//               )}
//             </div>

//             {/* Дата рождения */}
//             <div className="relative">
//               <label
//                 htmlFor="birth"
//                 className="block text-sm md:text-[15px] font-medium text-white/80"
//               >
//                 Дата рождения <span className="text-red-400">*</span>
//               </label>
//               <input
//                 id="birth"
//                 type="date"
//                 value={birth}
//                 onChange={(e) => setBirth(e.target.value)}
//                 min={minBirth}
//                 max={maxBirth}
//                 className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
//                 required
//               />
//               {birthErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-300">
//                   {birthErr}
//                 </p>
//               )}
//               <p className="mt-1 text-[11px] md:text-xs text-white/45">
//                 Для онлайн-записи требуется возраст 16+
//               </p>
//             </div>

//             {/* Как узнали о нас */}
//             <div className="relative">
//               <label
//                 htmlFor="referral"
//                 className="block text-sm md:text-[15px] font-medium text-white/80"
//               >
//                 Как вы узнали о нас? <span className="text-red-400">*</span>
//               </label>
//               <select
//                 id="referral"
//                 value={referral}
//                 onChange={(e) =>
//                   setReferral(e.target.value as ReferralKind | "")
//                 }
//                 className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
//                 required
//               >
//                 <option value="">Выберите вариант</option>
//                 <option value="google">Google</option>
//                 <option value="facebook">Facebook</option>
//                 <option value="instagram">Instagram</option>
//                 <option value="friends">Рекомендация друзей</option>
//                 <option value="other">Другое</option>
//               </select>
//               {referral === "other" && (
//                 <input
//                   type="text"
//                   value={referralOther}
//                   onChange={(e) => setReferralOther(e.target.value)}
//                   placeholder="Уточните источник"
//                   className="mt-2 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
//                 />
//               )}
//               {referralErr && (
//                 <p className="mt-1 text-xs md:text-sm text-red-300">
//                   {referralErr}
//                 </p>
//               )}
//             </div>

//             {/* Комментарий */}
//             <div className="relative">
//               <label
//                 htmlFor="comment"
//                 className="block text-sm md:text-[15px] font-medium text-white/80"
//               >
//                 Комментарий{" "}
//                 <span className="text-white/45 text-[11px] md:text-xs">
//                   (необязательно)
//                 </span>
//               </label>
//               <textarea
//                 id="comment"
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 rows={3}
//                 className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all resize-none"
//                 placeholder="Дополнительная информация или пожелания"
//               />
//             </div>

//             {/* Ошибка отправки */}
//             {submitErr && (
//               <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
//                 <p className="text-xs md:text-sm text-red-200">{submitErr}</p>
//               </div>
//             )}

//             {/* Кнопки */}
//             <div className="flex flex-col sm:flex-row gap-3 pt-2">
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/40 px-5 py-2.5 text-sm md:text-base text-white/80 hover:bg-white/5 hover:text-amber-300 transition-colors"
//                 disabled={submitting}
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 Назад
//               </button>
//               <button
//                 type="submit"
//                 disabled={!formValid || submitting}
//                 className={`
//                   flex-1 inline-flex items-center justify-center gap-2 rounded-xl
//                   bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
//                   px-6 py-2.5 text-sm md:text-base font-semibold text-black
//                   shadow-[0_0_30px_rgba(245,197,24,0.6)]
//                   hover:shadow-[0_0_40px_rgba(245,197,24,0.85)]
//                   transition-all disabled:opacity-60 disabled:cursor-not-allowed
//                 `}
//               >
//                 {submitting ? "Создание записи…" : "Забронировать"}
//               </button>
//             </div>
//           </form>

//           {/* Правая колонка — инфо-блок */}
//           <aside className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-black/80 via-black/70 to-black/80 p-5 md:p-6 shadow-[0_0_45px_rgba(0,0,0,0.7)]">
//             <div className="pointer-events-none absolute -top-24 right-0 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />
//             <div className="relative space-y-4 text-sm md:text-[15px] text-white/80">
//               <h3 className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-1">
//                 Почему мы просим e-mail?
//               </h3>
//               <p>
//                 На ваш e-mail мы отправим подтверждение брони и все детали
//                 записи. Также вы получите напоминание перед визитом.
//               </p>
//               <p>
//                 Мы бережно относимся к персональным данным и используем их
//                 только для обслуживания вашей записи.
//               </p>
//               <div className="mt-4 rounded-2xl border border-white/15 bg-black/60 p-3 flex items-start gap-3">
//                 <Sparkles className="mt-1 w-4 h-4 text-amber-300" />
//                 <p className="text-xs md:text-sm text-white/75">
//                   Если вы допустите ошибку в e-mail, вы всё равно сможете прийти
//                   на приём, но не получите напоминания и подтверждения.
//                 </p>
//               </div>
//             </div>
//           </aside>
//         </section>
//       </main>

//       <VideoSection />
//     </>
//   );
// }

// /* ---------- Export ---------- */

// export default function ClientPage(): React.JSX.Element {
//   return (
//     <PageShell>
//       <Suspense
//         fallback={
//           <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 pb-28">
//             <div className="min-h-[40vh] flex items-center justify-center">
//               <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
//             </div>
//           </main>
//         }
//       >
//         <ClientForm />
//       </Suspense>
//     </PageShell>
//   );
// }

//---------рабочая форма, но без дизайна---------
// // File: src/app/booking/(steps)/client/page.tsx
// 'use client';

// import * as React from 'react';
// import { Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';

// type EmailCheck =
//   | { state: 'idle' }
//   | { state: 'checking' }
//   | { state: 'ok' }
//   | { state: 'fail'; reason?: string }
//   | { state: 'unavailable' };

// type ReferralKind = 'google' | 'facebook' | 'instagram' | 'friends' | 'other';

// function isValidEmailSyntax(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// function formatYMD(d: Date): string {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${y}-${m}-${day}`;
// }

// function yearsAgo(n: number): Date {
//   const d = new Date();
//   d.setFullYear(d.getFullYear() - n);
//   return d;
// }

// function ClientForm(): React.JSX.Element {
//   const params = useSearchParams();
//   const router = useRouter();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );
//   const masterId = params.get('m') ?? '';
//   const startISO = params.get('start') ?? '';
//   const endISO = params.get('end') ?? '';

//   const [name, setName] = React.useState<string>('');
//   const [phone, setPhone] = React.useState<string>('');
//   const [email, setEmail] = React.useState<string>('');
//   const [emailCheck, setEmailCheck] = React.useState<EmailCheck>({ state: 'idle' });

//   const [birth, setBirth] = React.useState<string>('');
//   const [referral, setReferral] = React.useState<ReferralKind | ''>('');
//   const [referralOther, setReferralOther] = React.useState<string>('');
//   const [comment, setComment] = React.useState<string>('');

//   const [submitErr, setSubmitErr] = React.useState<string | null>(null);
//   const [submitting, setSubmitting] = React.useState<boolean>(false);

//   const maxBirth = formatYMD(new Date());
//   const minBirth = formatYMD(yearsAgo(120));
//   const minAdult = formatYMD(yearsAgo(16));

//   const nameErr = name.trim().length < 2 ? 'Укажите имя полностью' : null;
//   const phoneErr = phone.trim().length < 6 ? 'Укажите корректный номер телефона' : null;

//   const birthDate = birth ? new Date(birth + 'T00:00:00') : null;
//   let birthErr: string | null = null;
//   if (!birth) birthErr = 'Дата рождения обязательна';
//   else if (birthDate && birthDate > new Date()) birthErr = 'Дата в будущем недопустима';
//   else if (birth && birth > minAdult) birthErr = 'Для онлайн-записи требуется возраст 16+';

//   let emailErr: string | null = null;
//   if (email) {
//     if (!isValidEmailSyntax(email)) emailErr = 'Некорректный e-mail';
//     else if (emailCheck.state === 'fail') emailErr = emailCheck.reason ?? 'E-mail не подтвержден';
//   }

//   const referralErr =
//     referral === ''
//       ? 'Выберите вариант'
//       : referral === 'other' && !referralOther.trim()
//       ? 'Уточните источник'
//       : null;

//   const baseDisabled = !serviceIds.length || !masterId || !startISO || !endISO;

//   const formValid =
//     !baseDisabled &&
//     !nameErr &&
//     !phoneErr &&
//     !birthErr &&
//     !emailErr &&
//     !referralErr &&
//     emailCheck.state !== 'checking';

//   // Проверка email с задержкой
//   React.useEffect(() => {
//     if (!email || !isValidEmailSyntax(email)) {
//       setEmailCheck({ state: 'idle' });
//       return;
//     }

//     setEmailCheck({ state: 'checking' });
//     const timer = setTimeout(async () => {
//       try {
//         const res = await fetch(`/api/email-check?email=${encodeURIComponent(email)}`);
//         if (!res.ok) {
//           setEmailCheck({ state: 'unavailable' });
//           return;
//         }
//         const data = await res.json();
//         if (data.ok) {
//           setEmailCheck({ state: 'ok' });
//         } else {
//           setEmailCheck({ state: 'fail', reason: data.reason });
//         }
//       } catch {
//         setEmailCheck({ state: 'unavailable' });
//       }
//     }, 800);

//     return () => clearTimeout(timer);
//   }, [email]);

//   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
//     e.preventDefault();
//     if (!formValid || submitting) return;

//     setSubmitting(true);
//     setSubmitErr(null);

//     try {
//       // Формируем query string с параметрами
//       const qs = new URLSearchParams();
//       serviceIds.forEach(id => qs.append('s', id));
//       qs.set('m', masterId);
//       qs.set('start', startISO);
//       qs.set('end', endISO);

//       // Отправляем POST запрос на API endpoint
//       const res = await fetch(`/api/booking/client?${qs.toString()}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           customerName: name.trim(),
//           phone: phone.trim(),
//           email: email.trim(),
//           birthDateISO: birth || undefined,
//           referral: referral === 'other' ? 'other' : referral || undefined,
//           notes: comment.trim() || undefined,
//         }),
//       });

//       // Если статус НЕ 2xx - это ошибка
//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data.error || `HTTP ${res.status}`);
//       }

//       // Если статус 2xx - парсим успешный ответ
//       const result = await res.json();

//       // API возвращает { draftId: string } при успехе
//       if (result.draftId) {
//         // Успешно создана запись (PENDING)
//         // Переходим на страницу верификации email
//         const verifyUrl = `/booking/verify?draft=${result.draftId}&email=${encodeURIComponent(email.trim())}&${qs.toString()}`;
//         router.push(verifyUrl);
//       } else {
//         throw new Error('Некорректный ответ от сервера');
//       }
//     } catch (err) {
//       const msg = err instanceof Error ? err.message : 'Не удалось создать запись';
//       setSubmitErr(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (baseDisabled) {
//     return (
//       <div className="mx-auto max-w-2xl px-4 py-8">
//         <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
//           <p className="text-destructive">Некорректные параметры. Пожалуйста, начните запись заново.</p>
//           <Link href="/booking" className="mt-4 inline-block text-sm underline">
//             Вернуться к выбору услуг
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-2xl px-4 pb-28">
//       <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
//       <h2 className="mt-2 text-lg text-muted-foreground">Ваши данные</h2>

//       <form onSubmit={handleSubmit} className="mt-6 space-y-6">
//         {/* Имя */}
//         <div>
//           <label htmlFor="name" className="block text-sm font-medium">
//             Имя <span className="text-destructive">*</span>
//           </label>
//           <input
//             id="name"
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             placeholder="Ваше полное имя"
//             required
//           />
//           {nameErr && <p className="mt-1 text-sm text-destructive">{nameErr}</p>}
//         </div>

//         {/* Телефон */}
//         <div>
//           <label htmlFor="phone" className="block text-sm font-medium">
//             Телефон <span className="text-destructive">*</span>
//           </label>
//           <input
//             id="phone"
//             type="tel"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             placeholder="+7 (xxx) xxx-xx-xx"
//             required
//           />
//           {phoneErr && <p className="mt-1 text-sm text-destructive">{phoneErr}</p>}
//         </div>

//         {/* Email */}
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium">
//             E-mail <span className="text-muted-foreground">(необязательно)</span>
//           </label>
//           <input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             placeholder="your@email.com"
//           />
//           {emailCheck.state === 'checking' && (
//             <p className="mt-1 text-sm text-muted-foreground">Проверка...</p>
//           )}
//           {emailCheck.state === 'ok' && (
//             <p className="mt-1 text-sm text-green-600">✓ E-mail подтвержден</p>
//           )}
//           {emailErr && <p className="mt-1 text-sm text-destructive">{emailErr}</p>}
//         </div>

//         {/* Дата рождения */}
//         <div>
//           <label htmlFor="birth" className="block text-sm font-medium">
//             Дата рождения <span className="text-destructive">*</span>
//           </label>
//           <input
//             id="birth"
//             type="date"
//             value={birth}
//             onChange={(e) => setBirth(e.target.value)}
//             min={minBirth}
//             max={maxBirth}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             required
//           />
//           {birthErr && <p className="mt-1 text-sm text-destructive">{birthErr}</p>}
//           <p className="mt-1 text-xs text-muted-foreground">
//             Для онлайн-записи требуется возраст 16+
//           </p>
//         </div>

//         {/* Как узнали о нас */}
//         <div>
//           <label htmlFor="referral" className="block text-sm font-medium">
//             Как вы узнали о нас? <span className="text-destructive">*</span>
//           </label>
//           <select
//             id="referral"
//             value={referral}
//             onChange={(e) => setReferral(e.target.value as ReferralKind | '')}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             required
//           >
//             <option value="">Выберите вариант</option>
//             <option value="google">Google</option>
//             <option value="facebook">Facebook</option>
//             <option value="instagram">Instagram</option>
//             <option value="friends">Рекомендация друзей</option>
//             <option value="other">Другое</option>
//           </select>
//           {referral === 'other' && (
//             <input
//               type="text"
//               value={referralOther}
//               onChange={(e) => setReferralOther(e.target.value)}
//               placeholder="Уточните источник"
//               className="mt-2 w-full rounded-md border bg-background px-3 py-2"
//             />
//           )}
//           {referralErr && <p className="mt-1 text-sm text-destructive">{referralErr}</p>}
//         </div>

//         {/* Комментарий */}
//         <div>
//           <label htmlFor="comment" className="block text-sm font-medium">
//             Комментарий <span className="text-muted-foreground">(необязательно)</span>
//           </label>
//           <textarea
//             id="comment"
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             rows={3}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             placeholder="Дополнительная информация или пожелания"
//           />
//         </div>

//         {/* Ошибка отправки */}
//         {submitErr && (
//           <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
//             <p className="text-sm text-destructive">{submitErr}</p>
//           </div>
//         )}

//         {/* Кнопки */}
//         <div className="flex gap-3">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="rounded-md border px-6 py-2 hover:bg-muted"
//             disabled={submitting}
//           >
//             Назад
//           </button>
//           <button
//             type="submit"
//             disabled={!formValid || submitting}
//             className="flex-1 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
//           >
//             {submitting ? 'Создание записи...' : 'Забронировать'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default function ClientPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="mx-auto mt-6 max-w-2xl rounded-lg border p-4">
//           Загрузка формы...
//         </div>
//       }
//     >
//       <ClientForm />
//     </Suspense>
//   );
// }

// 'use client';

// import * as React from 'react';
// import { Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';

// type EmailCheck =
//   | { state: 'idle' }
//   | { state: 'checking' }
//   | { state: 'ok' }
//   | { state: 'fail'; reason?: string }
//   | { state: 'unavailable' };

// type ReferralKind = 'google' | 'facebook' | 'instagram' | 'friends' | 'other';

// function isValidEmailSyntax(email: string): boolean {
//   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// }

// function formatYMD(d: Date): string {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${y}-${m}-${day}`;
// }

// function yearsAgo(n: number): Date {
//   const d = new Date();
//   d.setFullYear(d.getFullYear() - n);
//   return d;
// }

// function ClientForm(): React.JSX.Element {
//   const params = useSearchParams();
//   const router = useRouter();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );
//   const masterId = params.get('m') ?? '';
//   const startISO = params.get('start') ?? '';
//   const endISO = params.get('end') ?? '';

//   const [name, setName] = React.useState<string>('');
//   const [phone, setPhone] = React.useState<string>('');
//   const [email, setEmail] = React.useState<string>('');
//   const [emailCheck, setEmailCheck] = React.useState<EmailCheck>({ state: 'idle' });

//   const [birth, setBirth] = React.useState<string>('');
//   const [referral, setReferral] = React.useState<ReferralKind | ''>('');
//   const [referralOther, setReferralOther] = React.useState<string>('');
//   const [comment, setComment] = React.useState<string>('');

//   const [submitErr, setSubmitErr] = React.useState<string | null>(null);
//   const [submitting, setSubmitting] = React.useState<boolean>(false);

//   const maxBirth = formatYMD(new Date());
//   const minBirth = formatYMD(yearsAgo(120));
//   const minAdult = formatYMD(yearsAgo(16));

//   const nameErr = name.trim().length < 2 ? 'Укажите имя полностью' : null;
//   const phoneErr = phone.trim().length < 6 ? 'Укажите корректный номер телефона' : null;

//   const birthDate = birth ? new Date(birth + 'T00:00:00') : null;
//   let birthErr: string | null = null;
//   if (!birth) birthErr = 'Дата рождения обязательна';
//   else if (birthDate && birthDate > new Date()) birthErr = 'Дата в будущем недопустима';
//   else if (birth && birth > minAdult) birthErr = 'Для онлайн-записи требуется возраст 16+';

//   let emailErr: string | null = null;
//   if (email) {
//     if (!isValidEmailSyntax(email)) emailErr = 'Некорректный e-mail';
//     else if (emailCheck.state === 'fail') emailErr = emailCheck.reason ?? 'E-mail не подтвержден';
//   }

//   const referralErr =
//     referral === ''
//       ? 'Выберите вариант'
//       : referral === 'other' && !referralOther.trim()
//       ? 'Уточните источник'
//       : null;

//   const baseDisabled = !serviceIds.length || !masterId || !startISO || !endISO;

//   const formValid =
//     !baseDisabled &&
//     !nameErr &&
//     !phoneErr &&
//     !birthErr &&
//     !emailErr &&
//     !referralErr &&
//     emailCheck.state !== 'checking';

//   // Проверка email с задержкой
//   React.useEffect(() => {
//     if (!email || !isValidEmailSyntax(email)) {
//       setEmailCheck({ state: 'idle' });
//       return;
//     }

//     setEmailCheck({ state: 'checking' });
//     const timer = setTimeout(async () => {
//       try {
//         const res = await fetch(`/api/email-check?email=${encodeURIComponent(email)}`);
//         if (!res.ok) {
//           setEmailCheck({ state: 'unavailable' });
//           return;
//         }
//         const data = await res.json();
//         if (data.ok) {
//           setEmailCheck({ state: 'ok' });
//         } else {
//           setEmailCheck({ state: 'fail', reason: data.reason });
//         }
//       } catch {
//         setEmailCheck({ state: 'unavailable' });
//       }
//     }, 800);

//     return () => clearTimeout(timer);
//   }, [email]);

//   const handleSubmit = async (e: React.FormEvent): Promise<void> => {
//     e.preventDefault();
//     if (!formValid || submitting) return;

//     setSubmitting(true);
//     setSubmitErr(null);

//     try {
//       // Формируем query string с параметрами
//       const qs = new URLSearchParams();
//       serviceIds.forEach(id => qs.append('s', id));
//       qs.set('m', masterId);
//       qs.set('start', startISO);
//       qs.set('end', endISO);

//       // Отправляем POST запрос на API endpoint
//       const res = await fetch(`/api/booking/client?${qs.toString()}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           customerName: name.trim(),
//           phone: phone.trim(),
//           email: email.trim(),
//           birthDateISO: birth || undefined,
//           referral: referral === 'other' ? 'other' : referral || undefined,
//           notes: comment.trim() || undefined,
//         }),
//       });

//       // Если статус НЕ 2xx - это ошибка
//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data.error || `HTTP ${res.status}`);
//       }

//       // Если статус 2xx - парсим успешный ответ
//       const result = await res.json();

//       // API возвращает { draftId: string } при успехе
//       if (result.draftId) {
//         // Успешно создана запись
//         // Переходим на страницу подтверждения
//         const confirmUrl = `/booking/confirmation?id=${result.draftId}`;
//         router.push(confirmUrl);
//       } else {
//         throw new Error('Некорректный ответ от сервера');
//       }
//     } catch (err) {
//       const msg = err instanceof Error ? err.message : 'Не удалось создать запись';
//       setSubmitErr(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (baseDisabled) {
//     return (
//       <div className="mx-auto max-w-2xl px-4 py-8">
//         <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
//           <p className="text-destructive">Некорректные параметры. Пожалуйста, начните запись заново.</p>
//           <Link href="/booking" className="mt-4 inline-block text-sm underline">
//             Вернуться к выбору услуг
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-2xl px-4 pb-28">
//       <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
//       <h2 className="mt-2 text-lg text-muted-foreground">Ваши данные</h2>

//       <form onSubmit={handleSubmit} className="mt-6 space-y-6">
//         {/* Имя */}
//         <div>
//           <label htmlFor="name" className="block text-sm font-medium">
//             Имя <span className="text-destructive">*</span>
//           </label>
//           <input
//             id="name"
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             placeholder="Ваше полное имя"
//             required
//           />
//           {nameErr && <p className="mt-1 text-sm text-destructive">{nameErr}</p>}
//         </div>

//         {/* Телефон */}
//         <div>
//           <label htmlFor="phone" className="block text-sm font-medium">
//             Телефон <span className="text-destructive">*</span>
//           </label>
//           <input
//             id="phone"
//             type="tel"
//             value={phone}
//             onChange={(e) => setPhone(e.target.value)}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             placeholder="+7 (xxx) xxx-xx-xx"
//             required
//           />
//           {phoneErr && <p className="mt-1 text-sm text-destructive">{phoneErr}</p>}
//         </div>

//         {/* Email */}
//         <div>
//           <label htmlFor="email" className="block text-sm font-medium">
//             E-mail <span className="text-muted-foreground">(необязательно)</span>
//           </label>
//           <input
//             id="email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             placeholder="your@email.com"
//           />
//           {emailCheck.state === 'checking' && (
//             <p className="mt-1 text-sm text-muted-foreground">Проверка...</p>
//           )}
//           {emailCheck.state === 'ok' && (
//             <p className="mt-1 text-sm text-green-600">✓ E-mail подтвержден</p>
//           )}
//           {emailErr && <p className="mt-1 text-sm text-destructive">{emailErr}</p>}
//         </div>

//         {/* Дата рождения */}
//         <div>
//           <label htmlFor="birth" className="block text-sm font-medium">
//             Дата рождения <span className="text-destructive">*</span>
//           </label>
//           <input
//             id="birth"
//             type="date"
//             value={birth}
//             onChange={(e) => setBirth(e.target.value)}
//             min={minBirth}
//             max={maxBirth}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             required
//           />
//           {birthErr && <p className="mt-1 text-sm text-destructive">{birthErr}</p>}
//           <p className="mt-1 text-xs text-muted-foreground">
//             Для онлайн-записи требуется возраст 16+
//           </p>
//         </div>

//         {/* Как узнали о нас */}
//         <div>
//           <label htmlFor="referral" className="block text-sm font-medium">
//             Как вы узнали о нас? <span className="text-destructive">*</span>
//           </label>
//           <select
//             id="referral"
//             value={referral}
//             onChange={(e) => setReferral(e.target.value as ReferralKind | '')}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             required
//           >
//             <option value="">Выберите вариант</option>
//             <option value="google">Google</option>
//             <option value="facebook">Facebook</option>
//             <option value="instagram">Instagram</option>
//             <option value="friends">Рекомендация друзей</option>
//             <option value="other">Другое</option>
//           </select>
//           {referral === 'other' && (
//             <input
//               type="text"
//               value={referralOther}
//               onChange={(e) => setReferralOther(e.target.value)}
//               placeholder="Уточните источник"
//               className="mt-2 w-full rounded-md border bg-background px-3 py-2"
//             />
//           )}
//           {referralErr && <p className="mt-1 text-sm text-destructive">{referralErr}</p>}
//         </div>

//         {/* Комментарий */}
//         <div>
//           <label htmlFor="comment" className="block text-sm font-medium">
//             Комментарий <span className="text-muted-foreground">(необязательно)</span>
//           </label>
//           <textarea
//             id="comment"
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             rows={3}
//             className="mt-1 w-full rounded-md border bg-background px-3 py-2"
//             placeholder="Дополнительная информация или пожелания"
//           />
//         </div>

//         {/* Ошибка отправки */}
//         {submitErr && (
//           <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
//             <p className="text-sm text-destructive">{submitErr}</p>
//           </div>
//         )}

//         {/* Кнопки */}
//         <div className="flex gap-3">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="rounded-md border px-6 py-2 hover:bg-muted"
//             disabled={submitting}
//           >
//             Назад
//           </button>
//           <button
//             type="submit"
//             disabled={!formValid || submitting}
//             className="flex-1 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
//           >
//             {submitting ? 'Создание записи...' : 'Забронировать'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default function ClientPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="mx-auto mt-6 max-w-2xl rounded-lg border p-4">
//           Загрузка формы...
//         </div>
//       }
//     >
//       <ClientForm />
//     </Suspense>
//   );
// }
