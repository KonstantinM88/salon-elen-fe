// src/app/booking/verify/VerifyPageClient.tsx
"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import { TelegramVerification } from "./TelegramVerification";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  Shield,
  Clock3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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

const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
  { id: "services", label: "Услуга", icon: "✨" },
  { id: "master", label: "Мастер", icon: "👤" },
  { id: "calendar", label: "Дата", icon: "📅" },
  { id: "client", label: "Данные", icon: "📝" },
  { id: "verify", label: "Проверка", icon: "✓" },
  { id: "payment", label: "Оплата", icon: "💳" },
];

function PageShell({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Хедер с прогресс-баром */}
      <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
          <PremiumProgressBar currentStep={4} steps={BOOKING_STEPS} />
        </div>
      </header>

      {/* отступ под фиксированный хедер */}
      <div className="h-[84px] md:h-[96px]" />

      {children}
    </div>
  );
}

/* ===================== Видео-секция с логотипом ===================== */

function VideoSection(): React.JSX.Element {
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/10" />
      </div>
    </section>
  );
}

/* ===================== Основной компонент ===================== */

export default function VerifyPageClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const draftId = searchParams.get("draft") ?? "";
  const email = searchParams.get("email") ?? "";

  const [selectedMethod, setSelectedMethod] =
    React.useState<VerificationMethod>("email");
  const [code, setCode] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // защита от повторных запросов
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
      setSuccess(`Код отправлен на ${email}`);

      if (data.devCode) {
        console.log(`[DEV] Код для тестирования: ${data.devCode}`);
        setSuccess(`Код отправлен на ${email}. Dev код: ${data.devCode}`);
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
      setError("Введите 6-значный код");
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

      // 1. проверяем HTTP-статус
      if (!res.ok) {
        throw new Error("Ошибка сети при проверке кода");
      }

      // 2. бизнес-логика
      if (!data.ok) {
        throw new Error(data.error || "Неверный код");
      }

      const appointmentId = data.appointmentId;

      if (!appointmentId) {
        throw new Error(
          "Не удалось получить идентификатор записи (appointmentId)"
        );
      }

      setSuccess("Верификация успешна! Переход к оплате...");

      // передаём appointmentId, а не draftId
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
      <PageShell>
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
            <p className="text-sm md:text-base text-red-200">
              Некорректные параметры. Пожалуйста, начните запись заново.
            </p>
            <Link
              href="/booking"
              className="mt-4 inline-block text-sm text-amber-300 underline hover:text-amber-200"
            >
              Вернуться к выбору услуг
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

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
        {/* Верхний блок: back + шаг + заголовок */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex w-full items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-amber-300 hover:bg-white/10 hover:text-amber-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Назад</span>
            </button>

            <div className="hidden text-xs font-medium text-white/60 sm:flex sm:items-center sm:gap-2">
              <span className="rounded-full bg-white/5 px-3 py-1">
                Шаг <span className="text-amber-300">5</span> из 6
              </span>
            </div>
          </div>

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative mb-6 inline-block"
          >
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40 blur-xl opacity-70" />
            <div className="relative flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-amber-500/70 via-yellow-500/70 to-amber-500/70 px-6 py-2.5 text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)] backdrop-blur-sm">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/15">
                <ShieldCheck className="h-4 w-4 text-black/80" />
              </span>
              <span className="font-serif text-sm tracking-wide">
                Шаг 5 — Подтверждение email
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="
              mb-3 mx-auto text-center
              text-4xl md:text-5xl lg:text-5xl xl:text-6xl
              font-serif italic leading-tight
              text-transparent bg-clip-text
              bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
              drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
            "
          >
            Подтверждение записи
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto flex max-w-3xl items-center justify-center gap-3 md:gap-4"
          >
            <Mail className="h-5 w-5 text-sky-200/90 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
            <p
              className="
                font-serif text-center text-lg text-transparent
                bg-gradient-to-r from-[#6DDCFF] via-[#7F5DFF] to-[#FF4FD8]
                bg-clip-text drop-shadow-[0_0_22px_rgba(80,180,255,0.9)]
                uppercase md:text-xl
              "
            >
              Проверьте почту и введите код, чтобы окончательно забронировать
              время.
            </p>
            <Mail className="h-5 w-5 text-fuchsia-200/90 drop-shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
          </motion.div>
        </div>

        {/* Основной блок: слева верификация, справа инфо */}
        <div className="mt-8 grid items-start gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {/* Левая часть — методы + ввод кода */}
          <motion.section
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
            <div className="pointer-events-none absolute -top-20 left-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="relative space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-white/90 md:text-lg">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15">
                    <Shield className="h-4 w-4 text-amber-300" />
                  </span>
                  Способ подтверждения
                </h2>
                <p className="text-xs text-white/55 md:text-sm">
                  Мы отправим одноразовый код на{" "}
                  <span className="font-medium text-amber-300">
                    {maskedEmail}
                  </span>
                  .
                </p>
              </div>

              {/* Методы верификации */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Email — активный */}
                <button
                  type="button"
                  onClick={() => handleMethodSelect("email")}
                  className={`
                    flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition
                    ${
                      selectedMethod === "email"
                        ? "border-amber-400/90 bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.35)]"
                        : "border-white/10 bg-white/5 hover:border-amber-300/70 hover:bg-white/10"
                    }
                  `}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-xl">
                    📧
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Email</div>
                    <div className="text-xs text-white/65">
                      Получить код на почту
                    </div>
                  </div>
                  {selectedMethod === "email" && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
                      <svg
                        className="h-3 w-3 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>

                {/* Google — заглушка */}
                <button
                  type="button"
                  disabled
                  className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left opacity-45"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl">
                    🔐
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Google</div>
                    <div className="text-xs text-white/60">
                      Скоро будет доступно
                    </div>
                  </div>
                </button>

                {/* Telegram — АКТИВНАЯ кнопка */}
                <button
                  type="button"
                  onClick={() => handleMethodSelect("telegram")}
                  className={`
                    flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition
                    ${
                      selectedMethod === "telegram"
                        ? "border-blue-400/90 bg-gradient-to-r from-blue-500/25 via-blue-600/20 to-blue-500/25 shadow-[0_0_25px_rgba(59,130,246,0.35)]"
                        : "border-white/10 bg-white/5 hover:border-blue-300/70 hover:bg-white/10"
                    }
                  `}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-xl">
                    ✈️
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Telegram</div>
                    <div className="text-xs text-white/65">
                      Получить код в Telegram
                    </div>
                  </div>
                  {selectedMethod === "telegram" && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>

                {/* WhatsApp — заглушка */}
                <button
                  type="button"
                  disabled
                  className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left opacity-45"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl">
                    💬
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">WhatsApp</div>
                    <div className="text-xs text-white/60">
                      Скоро будет доступно
                    </div>
                  </div>
                </button>
              </div>

              {/* Блок верификации для Email */}
              <AnimatePresence mode="wait">
                {selectedMethod === "email" && (
                  <motion.div
                    key="email-method"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15">
                        <Mail className="h-4 w-4 text-amber-300" />
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <p className="font-medium text-white/90">
                          Подтвердите ваш email
                        </p>
                        <p className="text-xs text-white/60 md:text-sm">
                          Мы отправим одноразовый 6-значный код на почту{" "}
                          <span className="font-medium text-amber-300">
                            {email}
                          </span>
                          . Введите его ниже, чтобы завершить бронь.
                        </p>
                      </div>
                    </div>

                    {/* Email (только просмотр) */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-white/70">
                        Почта для подтверждения
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/70"
                      />
                      <p className="mt-1 text-xs text-white/45">
                        Если email неверный, вернитесь на предыдущий шаг и
                        исправьте его.
                      </p>
                    </div>

                    {!codeSent ? (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={handleSendCode}
                          disabled={loading || !email}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_15px_40px_rgba(245,197,24,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loading ? "Отправка…" : "Отправить код"}
                        </button>
                        <p className="flex items-center gap-2 text-xs text-white/55">
                          <Clock3 className="h-3.5 w-3.5 text-amber-300" />
                          Обычно письмо приходит в течение пары секунд.
                          Проверьте также папку «Спам».
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="mb-1 block text-xs font-medium text-white/80 md:text-sm">
                            Введите 6-значный код
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
                            className="w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-center text-2xl font-mono tracking-[0.6em] text-white/90"
                            autoFocus
                          />
                          <p className="mt-1 text-xs text-white/50">
                            Код действителен ограниченное время. Если вы не
                            успели ввести его, запросите новый.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={loading || code.length !== 6}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-black shadow-[0_15px_40px_rgba(16,185,129,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loading ? "Проверка…" : "Подтвердить код"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setCodeSent(false);
                            setCode("");
                            setError(null);
                            setSuccess(null);
                          }}
                          disabled={loading}
                          className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Отправить код повторно
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Блок верификации для Telegram */}
                {selectedMethod === "telegram" && (
                  <motion.div
                    key="telegram-method"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
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
                      onVerifySuccess={(appointmentId) => {
                        router.push(
                          `/booking/payment?appointment=${encodeURIComponent(
                            appointmentId
                          )}`
                        );
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Сообщения об ошибке/успехе в фирменном стиле */}
              <div className="space-y-3 pt-2">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs md:text-sm text-red-200"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {success && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs md:text-sm text-emerald-200"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.section>

          {/* Правая часть — подсказки и статус */}
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
            <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative space-y-5">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-transparent bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text md:text-xl">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20">
                  <ShieldCheck className="h-4 w-4 text-amber-200" />
                </span>
                Безопасное подтверждение
              </h3>

              <p className="text-sm text-white/70 md:text-base">
                Мы используем одноразовый код, чтобы убедиться, что бронь
                действительно делаете вы. Это помогает защищать ваши данные и
                расписание салона.
              </p>

              <div className="mt-2 space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Clock3 className="h-4 w-4 text-amber-300" />
                  <span>Обычно код приходит в течение 1–2 минут.</span>
                </div>
                <ul className="mt-1 space-y-1.5 text-xs text-white/60 md:text-sm">
                  <li>• Проверьте папку «Спам» или «Промоакции».</li>
                  <li>• Убедитесь, что адрес почты указан без опечаток.</li>
                  <li>• Если письмо не пришло — запросите код ещё раз.</li>
                </ul>
              </div>

              <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                  Ваш прогресс
                </p>
                <ol className="space-y-1.5 text-xs text-white/70 md:text-sm">
                  <li>1. Вы выбрали услугу и мастера.</li>
                  <li>2. Указали дату и время.</li>
                  <li>3. Заполнили контактные данные.</li>
                  <li>
                    4. Сейчас — подтверждение email.
                    <span className="ml-1 text-emerald-300">
                      Остался всего один шаг!
                    </span>
                  </li>
                  <li>5. Далее — страница оплаты и финальное подтверждение.</li>
                </ol>
              </div>

              <div className="mt-2 border-t border-white/10 pt-3 text-xs text-white/50 md:text-sm">
                Если возникли сложности с подтверждением, вы всегда можете
                позвонить нам или написать — мы поможем завершить запись.
              </div>
            </div>
          </motion.aside>
        </div>
      </main>

      <VideoSection />
    </PageShell>
  );
}

//--------работал внедряем телеграмм бота--------
// // src/app/booking/verify/VerifyPageClient.tsx
// "use client";

// import * as React from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// // import { TelegramVerification } from "./TelegramVerification";
// import {
//   ArrowLeft,
//   Mail,
//   ShieldCheck,
//   Shield,
//   Clock3,
//   CheckCircle2,
//   AlertCircle,
// } from "lucide-react";

// type VerificationMethod = "email" | "google" | "telegram" | "whatsapp";

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
// };

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function PageShell({
//   children,
// }: {
//   children: React.ReactNode;
// }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black text-white">
//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={4} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       {/* отступ под фиксированный хедер */}
//       <div className="h-[84px] md:h-[96px]" />

//       {children}
//     </div>
//   );
// }

// /* ===================== Видео-секция с логотипом ===================== */

// function VideoSection(): React.JSX.Element {
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
//         <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/10" />
//       </div>
//     </section>
//   );
// }

// /* ===================== Основной компонент ===================== */

// export default function VerifyPageClient(): React.JSX.Element {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const draftId = searchParams.get("draft") ?? "";
//   const email = searchParams.get("email") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<VerificationMethod>("email");
//   const [code, setCode] = React.useState("");
//   const [codeSent, setCodeSent] = React.useState(false);
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const [success, setSuccess] = React.useState<string | null>(null);

//   // защита от повторных запросов
//   const sendingRef = React.useRef(false);
//   const verifyingRef = React.useRef(false);

//   const baseDisabled = !draftId || !email;

//   const handleSendCode = async (): Promise<void> => {
//     if (!email) {
//       setError("Email не указан");
//       return;
//     }

//     if (sendingRef.current) {
//       console.log("[OTP] Запрос уже отправляется, пропускаем дубликат");
//       return;
//     }

//     sendingRef.current = true;
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch("/api/booking/verify/email", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, draftId }),
//       });

//       const data = (await res.json()) as SendCodeResponse;

//       if (!res.ok || !data.ok) {
//         throw new Error(data.error || "Не удалось отправить код");
//       }

//       setCodeSent(true);
//       setSuccess(`Код отправлен на ${email}`);

//       if (data.devCode) {
//         console.log(`[DEV] Код для тестирования: ${data.devCode}`);
//         setSuccess(`Код отправлен на ${email}. Dev код: ${data.devCode}`);
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка отправки кода";
//       setError(msg);
//     } finally {
//       setLoading(false);
//       sendingRef.current = false;
//     }
//   };

//   const handleVerifyCode = async (): Promise<void> => {
//     if (!code || code.length !== 6) {
//       setError("Введите 6-значный код");
//       return;
//     }

//     if (verifyingRef.current) {
//       console.log("[OTP] Проверка уже выполняется, пропускаем дубликат");
//       return;
//     }

//     verifyingRef.current = true;
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch("/api/booking/verify/email/confirm", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, code, draftId }),
//       });

//       const data = (await res.json()) as VerifyResponse;

//       // 1. проверяем HTTP-статус
//       if (!res.ok) {
//         throw new Error("Ошибка сети при проверке кода");
//       }

//       // 2. бизнес-логика
//       if (!data.ok) {
//         throw new Error(data.error || "Неверный код");
//       }

//       const appointmentId = data.appointmentId;

//       if (!appointmentId) {
//         throw new Error(
//           "Не удалось получить идентификатор записи (appointmentId)"
//         );
//       }

//       setSuccess("Верификация успешна! Переход к оплате...");

//       // передаём appointmentId, а не draftId
//       setTimeout(() => {
//         router.push(
//           `/booking/payment?appointment=${encodeURIComponent(appointmentId)}`
//         );
//       }, 1000);
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : "Ошибка проверки кода";
//       setError(msg);
//     } finally {
//       setLoading(false);
//       verifyingRef.current = false;
//     }
//   };

//   const handleMethodSelect = (method: VerificationMethod): void => {
//     setSelectedMethod(method);
//     setCodeSent(false);
//     setCode("");
//     setError(null);
//     setSuccess(null);
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
//               className="mt-4 inline-block text-sm text-amber-300 underline hover:text-amber-200"
//             >
//               Вернуться к выбору услуг
//             </Link>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   const maskedEmail =
//     email.length > 5
//       ? email.replace(
//           /^(.{2}).+(@.+)$/,
//           (_match, p1: string, p2: string) => `${p1}***${p2}`
//         )
//       : email;

//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* Верхний блок: back + шаг + заголовок */}
//         <div className="flex flex-col items-center text-center">
//           <div className="mb-4 flex w-full items-center justify-between gap-3">
//             <button
//               type="button"
//               onClick={() => router.back()}
//               className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-amber-300 hover:bg-white/10 hover:text-amber-100"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               <span>Назад</span>
//             </button>

//             <div className="hidden text-xs font-medium text-white/60 sm:flex sm:items-center sm:gap-2">
//               <span className="rounded-full bg-white/5 px-3 py-1">
//                 Шаг <span className="text-amber-300">5</span> из 6
//               </span>
//             </div>
//           </div>

//           <motion.div
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 26 }}
//             className="relative mb-6 inline-block"
//           >
//             <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40 blur-xl opacity-70" />
//             <div className="relative flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-r from-amber-500/70 via-yellow-500/70 to-amber-500/70 px-6 py-2.5 text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)] backdrop-blur-sm">
//               <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/15">
//                 <ShieldCheck className="h-4 w-4 text-black/80" />
//               </span>
//               <span className="font-serif text-sm tracking-wide">
//                 Шаг 5 — Подтверждение email
//               </span>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="
//               mb-3 mx-auto text-center
//               text-4xl md:text-5xl lg:text-5xl xl:text-6xl
//               font-serif italic leading-tight
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//               drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//             "
//           >
//             Подтверждение записи
//           </motion.h1>

//           <motion.div
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="mx-auto flex max-w-3xl items-center justify-center gap-3 md:gap-4"
//           >
//             <Mail className="h-5 w-5 text-sky-200/90 drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
//             <p
//               className="
//                 font-serif text-center text-lg text-transparent
//                 bg-gradient-to-r from-[#6DDCFF] via-[#7F5DFF] to-[#FF4FD8]
//                 bg-clip-text drop-shadow-[0_0_22px_rgba(80,180,255,0.9)]
//                 uppercase md:text-xl
//               "
//             >
//               Проверьте почту и введите код, чтобы окончательно забронировать
//               время.
//             </p>
//             <Mail className="h-5 w-5 text-fuchsia-200/90 drop-shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
//           </motion.div>
//         </div>

//         {/* Основной блок: слева верификация, справа инфо */}
//         <div className="mt-8 grid items-start gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
//           {/* Левая часть — методы + ввод кода */}
//           <motion.section
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
//             <div className="pointer-events-none absolute -top-20 left-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

//             <div className="relative space-y-4">
//               <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//                 <h2 className="flex items-center gap-2 text-base font-semibold text-white/90 md:text-lg">
//                   <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15">
//                     <Shield className="h-4 w-4 text-amber-300" />
//                   </span>
//                   Способ подтверждения
//                 </h2>
//                 <p className="text-xs text-white/55 md:text-sm">
//                   Мы отправим одноразовый код на{" "}
//                   <span className="font-medium text-amber-300">
//                     {maskedEmail}
//                   </span>
//                   .
//                 </p>
//               </div>

//               {/* Методы верификации */}
//               <div className="grid gap-3 sm:grid-cols-2">
//                 {/* Email — активный */}
//                 <button
//                   type="button"
//                   onClick={() => handleMethodSelect("email")}
//                   className={`
//                     flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition
//                     ${
//                       selectedMethod === "email"
//                         ? "border-amber-400/90 bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.35)]"
//                         : "border-white/10 bg-white/5 hover:border-amber-300/70 hover:bg-white/10"
//                     }
//                   `}
//                 >
//                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-xl">
//                     📧
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium">Email</div>
//                     <div className="text-xs text-white/65">
//                       Получить код на почту
//                     </div>
//                   </div>
//                   {selectedMethod === "email" && (
//                     <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
//                       <svg
//                         className="h-3 w-3 text-black"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={3}
//                           d="M5 13l4 4L19 7"
//                         />
//                       </svg>
//                     </div>
//                   )}
//                 </button>

//                 {/* Остальные методы — заглушки */}
//                 <button
//                   type="button"
//                   disabled
//                   className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left opacity-45"
//                 >
//                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl">
//                     🔐
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium">Google</div>
//                     <div className="text-xs text-white/60">
//                       Скоро будет доступно
//                     </div>
//                   </div>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => handleMethodSelect("telegram")}
//                   className={`...${
//                     selectedMethod === "telegram"
//                       ? "активный_стиль"
//                       : "обычный_стиль"
//                   }`}
//                 >
//                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl">
//                     ✈️
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium">Telegram</div>
//                     <div className="text-xs text-white/60">
//                       Скоро будет доступно
//                     </div>
//                   </div>
//                 </button>

//                 <button
//                   type="button"
//                   disabled
//                   className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left opacity-45"
//                 >
//                   <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl">
//                     💬
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-medium">WhatsApp</div>
//                     <div className="text-xs text-white/60">
//                       Скоро будет доступно
//                     </div>
//                   </div>
//                 </button>
//               </div>

//               {/* Блок верификации для Email */}
//               <AnimatePresence mode="wait">
//                 {selectedMethod === "email" && (
//                   <motion.div
//                     key="email-method"
//                     initial={{ opacity: 0, y: 12 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -8 }}
//                     transition={{ duration: 0.2 }}
//                     className="mt-4 space-y-5 rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5"
//                   >
//                     <div className="flex items-start gap-3">
//                       <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15">
//                         <Mail className="h-4 w-4 text-amber-300" />
//                       </div>
//                       <div className="space-y-1.5 text-sm">
//                         <p className="font-medium text-white/90">
//                           Подтвердите ваш email
//                         </p>
//                         <p className="text-xs text-white/60 md:text-sm">
//                           Мы отправим одноразовый 6-значный код на почту{" "}
//                           <span className="font-medium text-amber-300">
//                             {email}
//                           </span>
//                           . Введите его ниже, чтобы завершить бронь.
//                         </p>
//                       </div>
//                     </div>

//                     {/* Email (только просмотр) */}
//                     <div className="space-y-2">
//                       <label className="block text-xs font-medium text-white/70">
//                         Почта для подтверждения
//                       </label>
//                       <input
//                         type="email"
//                         value={email}
//                         disabled
//                         className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/70"
//                       />
//                       <p className="mt-1 text-xs text-white/45">
//                         Если email неверный, вернитесь на предыдущий шаг и
//                         исправьте его.
//                       </p>
//                     </div>

//                     {!codeSent ? (
//                       <div className="space-y-3">
//                         <button
//                           type="button"
//                           onClick={handleSendCode}
//                           disabled={loading || !email}
//                           className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_15px_40px_rgba(245,197,24,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                           {loading ? "Отправка…" : "Отправить код"}
//                         </button>
//                         <p className="flex items-center gap-2 text-xs text-white/55">
//                           <Clock3 className="h-3.5 w-3.5 text-amber-300" />
//                           Обычно письмо приходит в течение пары секунд.
//                           Проверьте также папку «Спам».
//                         </p>
                        
//                       </div>
//                     ) : (
//                       <div className="space-y-4">
//                         <div className="space-y-2">
//                           <label className="mb-1 block text-xs font-medium text-white/80 md:text-sm">
//                             Введите 6-значный код
//                           </label>
//                           <input
//                             type="text"
//                             inputMode="numeric"
//                             maxLength={6}
//                             value={code}
//                             onChange={(event) =>
//                               setCode(event.target.value.replace(/\D/g, ""))
//                             }
//                             placeholder="000000"
//                             className="w-full rounded-2xl border border-white/20 bg-black/60 px-4 py-3 text-center text-2xl font-mono tracking-[0.6em] text-white/90"
//                             autoFocus
//                           />
//                           <p className="mt-1 text-xs text-white/50">
//                             Код действителен ограниченное время. Если вы не
//                             успели ввести его, запросите новый.
//                           </p>
//                         </div>

//                         <button
//                           type="button"
//                           onClick={handleVerifyCode}
//                           disabled={loading || code.length !== 6}
//                           className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-black shadow-[0_15px_40px_rgba(16,185,129,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                           {loading ? "Проверка…" : "Подтвердить код"}
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => {
//                             setCodeSent(false);
//                             setCode("");
//                             setError(null);
//                             setSuccess(null);
//                           }}
//                           disabled={loading}
//                           className="w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                           Отправить код повторно
//                         </button>
//                       </div>
//                     )}
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Сообщения об ошибке/успехе в фирменном стиле */}
//               <div className="space-y-3 pt-2">
//                 <AnimatePresence>
//                   {error && (
//                     <motion.div
//                       key="error"
//                       initial={{ opacity: 0, y: 6 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -6 }}
//                       className="flex items-start gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs md:text-sm text-red-200"
//                     >
//                       <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
//                       <span>{error}</span>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 <AnimatePresence>
//                   {success && (
//                     <motion.div
//                       key="success"
//                       initial={{ opacity: 0, y: 6 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -6 }}
//                       className="flex items-start gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs md:text-sm text-emerald-200"
//                     >
//                       <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
//                       <span>{success}</span>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//             </div>
//           </motion.section>

//           {/* Правая часть — подсказки и статус */}
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
//             <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

//             <div className="relative space-y-5">
//               <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-transparent bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text md:text-xl">
//                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20">
//                   <ShieldCheck className="h-4 w-4 text-amber-200" />
//                 </span>
//                 Безопасное подтверждение
//               </h3>

//               <p className="text-sm text-white/70 md:text-base">
//                 Мы используем одноразовый код, чтобы убедиться, что бронь
//                 действительно делаете вы. Это помогает защищать ваши данные и
//                 расписание салона.
//               </p>

//               <div className="mt-2 space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
//                 <div className="flex items-center gap-2 text-sm text-white/80">
//                   <Clock3 className="h-4 w-4 text-amber-300" />
//                   <span>Обычно код приходит в течение 1–2 минут.</span>
//                 </div>
//                 <ul className="mt-1 space-y-1.5 text-xs text-white/60 md:text-sm">
//                   <li>• Проверьте папку «Спам» или «Промоакции».</li>
//                   <li>• Убедитесь, что адрес почты указан без опечаток.</li>
//                   <li>• Если письмо не пришло — запросите код ещё раз.</li>
//                 </ul>
//               </div>

//               <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-black/40 p-4">
//                 <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
//                   Ваш прогресс
//                 </p>
//                 <ol className="space-y-1.5 text-xs text-white/70 md:text-sm">
//                   <li>1. Вы выбрали услугу и мастера.</li>
//                   <li>2. Указали дату и время.</li>
//                   <li>3. Заполнили контактные данные.</li>
//                   <li>
//                     4. Сейчас — подтверждение email.
//                     <span className="ml-1 text-emerald-300">
//                       Остался всего один шаг!
//                     </span>
//                   </li>
//                   <li>5. Далее — страница оплаты и финальное подтверждение.</li>
//                 </ol>
//               </div>

//               <div className="mt-2 border-t border-white/10 pt-3 text-xs text-white/50 md:text-sm">
//                 Если возникли сложности с подтверждением, вы всегда можете
//                 позвонить нам или написать — мы поможем завершить запись.
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       <VideoSection />
//     </PageShell>
//   );
// }

//---------всё работает приводим к стилю---------
// // src/app/booking/verify/VerifyPageClient.tsx
// 'use client';

// import * as React from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// type VerificationMethod = 'email' | 'google' | 'telegram' | 'whatsapp';

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

// export default function VerifyPageClient(): React.JSX.Element {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const draftId = searchParams.get('draft') ?? '';
//   const email = searchParams.get('email') ?? '';

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<VerificationMethod>('email');
//   const [code, setCode] = React.useState('');
//   const [codeSent, setCodeSent] = React.useState(false);
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const [success, setSuccess] = React.useState<string | null>(null);

//   // защита от повторных запросов
//   const sendingRef = React.useRef(false);
//   const verifyingRef = React.useRef(false);

//   const handleSendCode = async (): Promise<void> => {
//     if (!email) {
//       setError('Email не указан');
//       return;
//     }

//     if (sendingRef.current) {
//       console.log('[OTP] Запрос уже отправляется, пропускаем дубликат');
//       return;
//     }

//     sendingRef.current = true;
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch('/api/booking/verify/email', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, draftId }),
//       });

//       const data = (await res.json()) as {
//         ok?: boolean;
//         message?: string;
//         error?: string;
//         devCode?: string;
//       };

//       if (!res.ok || !data.ok) {
//         throw new Error(data.error || 'Не удалось отправить код');
//       }

//       setCodeSent(true);
//       setSuccess(`Код отправлен на ${email}`);

//       if (data.devCode) {
//         console.log(`[DEV] Код для тестирования: ${data.devCode}`);
//         setSuccess(
//           `Код отправлен на ${email}. Dev код: ${data.devCode}`,
//         );
//       }
//     } catch (e) {
//       const msg =
//         e instanceof Error ? e.message : 'Ошибка отправки кода';
//       setError(msg);
//     } finally {
//       setLoading(false);
//       sendingRef.current = false;
//     }
//   };

//   const handleVerifyCode = async (): Promise<void> => {
//     if (!code || code.length !== 6) {
//       setError('Введите 6-значный код');
//       return;
//     }

//     if (verifyingRef.current) {
//       console.log(
//         '[OTP] Проверка уже выполняется, пропускаем дубликат',
//       );
//       return;
//     }

//     verifyingRef.current = true;
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch('/api/booking/verify/email/confirm', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, code, draftId }),
//       });

//       const data: VerifyResponse = await res.json();

//       // сначала проверяем HTTP-статус
//       if (!res.ok) {
//         throw new Error('Ошибка сети при проверке кода');
//       }

//       // затем уже бизнес-логику
//       if (!data.ok) {
//         // здесь TypeScript уже знает, что data — ветка с error
//         throw new Error(data.error || 'Неверный код');
//       }

//       // здесь TypeScript знает, что data.ok === true
//       const appointmentId = data.appointmentId;

//       if (!appointmentId) {
//         throw new Error(
//           'Не удалось получить идентификатор записи (appointmentId)',
//         );
//       }

//       setSuccess('Верификация успешна! Переход к оплате...');

//       // передаём appointmentId, а не draftId
//       setTimeout(() => {
//         router.push(
//           `/booking/payment?appointment=${encodeURIComponent(
//             appointmentId,
//           )}`,
//         );
//       }, 1000);
//     } catch (e) {
//       const msg =
//         e instanceof Error ? e.message : 'Ошибка проверки кода';
//       setError(msg);
//     } finally {
//       setLoading(false);
//       verifyingRef.current = false;
//     }
//   };

//   const handleMethodSelect = (method: VerificationMethod): void => {
//     setSelectedMethod(method);
//     setCodeSent(false);
//     setCode('');
//     setError(null);
//     setSuccess(null);
//   };

//   return (
//     <div className="mx-auto max-w-2xl px-4 pb-28">
//       <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
//       <h2 className="mt-2 text-lg text-muted-foreground">
//         Подтверждение личности
//       </h2>

//       {/* Методы верификации */}
//       <div className="mt-6 rounded-xl border border-border bg-card p-6">
//         <h3 className="mb-4 font-medium">
//           Выберите способ подтверждения:
//         </h3>

//         <div className="grid gap-3">
//           {/* Email */}
//           <button
//             type="button"
//             onClick={() => handleMethodSelect('email')}
//             className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition
//               ${
//                 selectedMethod === 'email'
//                   ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-200'
//                   : 'border-border hover:border-indigo-300'
//               }`}
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
//               📧
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">Email</div>
//               <div className="text-sm text-muted-foreground">
//                 Получить код на почту
//               </div>
//             </div>
//             {selectedMethod === 'email' && (
//               <div className="flex size-5 items-center justify-center rounded-full bg-indigo-600">
//                 <svg
//                   className="size-3 text-white"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={3}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//               </div>
//             )}
//           </button>

//           {/* Остальные методы — заглушки */}
//           <button
//             type="button"
//             disabled
//             className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50"
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
//               🔐
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">Google</div>
//               <div className="text-sm text-muted-foreground">
//                 Скоро будет доступно
//               </div>
//             </div>
//           </button>

//           <button
//             type="button"
//             disabled
//             className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50"
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
//               ✈️
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">Telegram</div>
//               <div className="text-sm text-muted-foreground">
//                 Скоро будет доступно
//               </div>
//             </div>
//           </button>

//           <button
//             type="button"
//             disabled
//             className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50"
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
//               💬
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">WhatsApp</div>
//               <div className="text-sm text-muted-foreground">
//                 Скоро будет доступно
//               </div>
//             </div>
//           </button>
//         </div>
//       </div>

//       {/* Email верификация */}
//       {selectedMethod === 'email' && (
//         <div className="mt-6 rounded-xl border border-border bg-card p-6">
//           <h3 className="mb-4 font-medium">
//             Подтверждение через Email
//           </h3>

//           {!codeSent ? (
//             <div className="space-y-4">
//               <div>
//                 <label className="mb-2 block text-sm font-medium">
//                   Ваш email:
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   disabled
//                   className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-muted-foreground"
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={handleSendCode}
//                 disabled={loading || !email}
//                 className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {loading ? 'Отправка...' : 'Отправить код'}
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <div>
//                 <label className="mb-2 block text-sm font-medium">
//                   Введите 6-значный код:
//                 </label>
//                 <input
//                   type="text"
//                   inputMode="numeric"
//                   maxLength={6}
//                   value={code}
//                   onChange={(e) =>
//                     setCode(e.target.value.replace(/\D/g, ''))
//                   }
//                   placeholder="000000"
//                   className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-2xl font-mono tracking-widest"
//                   autoFocus
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={handleVerifyCode}
//                 disabled={loading || code.length !== 6}
//                 className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {loading ? 'Проверка...' : 'Подтвердить код'}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setCodeSent(false);
//                   setCode('');
//                   setError(null);
//                   setSuccess(null);
//                 }}
//                 disabled={loading}
//                 className="w-full rounded-xl border border-border px-5 py-2 font-medium text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 Отправить код повторно
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Сообщения */}
//       {error && (
//         <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
//           {error}
//         </div>
//       )}

//       {success && (
//         <div className="mt-4 rounded-lg border border-emerald-500 bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
//           ✓ {success}
//         </div>
//       )}

//       {/* Нижняя панель навигации */}
//       <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//         <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
//           >
//             Назад
//           </button>

//           <div className="text-sm text-muted-foreground">
//             Шаг 5 из 6
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import * as React from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// type VerificationMethod = 'email' | 'google' | 'telegram' | 'whatsapp';

// export default function VerifyPageClient(): React.JSX.Element {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const draftId = searchParams.get('draft') ?? '';
//   const email = searchParams.get('email') ?? '';

//   const [selectedMethod, setSelectedMethod] = React.useState<VerificationMethod>('email');
//   const [code, setCode] = React.useState('');
//   const [codeSent, setCodeSent] = React.useState(false);
//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const [success, setSuccess] = React.useState<string | null>(null);

//   // ✅ ДОБАВЛЕНО: защита от повторных запросов
//   const sendingRef = React.useRef(false);
//   const verifyingRef = React.useRef(false);

//   const handleSendCode = async (): Promise<void> => {
//     if (!email) {
//       setError('Email не указан');
//       return;
//     }

//     // ✅ ЗАЩИТА: если уже отправляется, игнорируем
//     if (sendingRef.current) {
//       console.log('[OTP] Запрос уже отправляется, пропускаем дубликат');
//       return;
//     }

//     sendingRef.current = true;
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch('/api/booking/verify/email', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, draftId }),
//       });

//       const data = await res.json();

//       if (!data.ok) {
//         throw new Error(data.error || 'Не удалось отправить код');
//       }

//       setCodeSent(true);
//       setSuccess(`Код отправлен на ${email}`);

//       // ✅ ДОБАВЛЕНО: показываем код в dev режиме
//       if (data.devCode) {
//         console.log(`[DEV] Код для тестирования: ${data.devCode}`);
//         setSuccess(`Код отправлен на ${email}. Dev код: ${data.devCode}`);
//       }
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : 'Ошибка отправки кода';
//       setError(msg);
//     } finally {
//       setLoading(false);
//       sendingRef.current = false;
//     }
//   };

//   const handleVerifyCode = async (): Promise<void> => {
//     if (!code || code.length !== 6) {
//       setError('Введите 6-значный код');
//       return;
//     }

//     // ✅ ЗАЩИТА: если уже проверяется, игнорируем
//     if (verifyingRef.current) {
//       console.log('[OTP] Проверка уже выполняется, пропускаем дубликат');
//       return;
//     }

//     verifyingRef.current = true;
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const res = await fetch('/api/booking/verify/email/confirm', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, code, draftId }),
//       });

//       const data = await res.json();

//       if (!data.ok) {
//         throw new Error(data.error || 'Неверный код');
//       }

//       setSuccess('Верификация успешна! Переход к оплате...');

//       // Переход к оплате
//       setTimeout(() => {
//         router.push(`/booking/payment?draft=${encodeURIComponent(draftId)}`);
//       }, 1000);
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : 'Ошибка проверки кода';
//       setError(msg);
//     } finally {
//       setLoading(false);
//       verifyingRef.current = false;
//     }
//   };

//   const handleMethodSelect = (method: VerificationMethod): void => {
//     setSelectedMethod(method);
//     setCodeSent(false);
//     setCode('');
//     setError(null);
//     setSuccess(null);
//   };

//   return (
//     <div className="mx-auto max-w-2xl px-4 pb-28">
//       <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
//       <h2 className="mt-2 text-lg text-muted-foreground">Подтверждение личности</h2>

//       {/* Методы верификации */}
//       <div className="mt-6 rounded-xl border border-border bg-card p-6">
//         <h3 className="mb-4 font-medium">Выберите способ подтверждения:</h3>

//         <div className="grid gap-3">
//           {/* Email */}
//           <button
//             type="button"
//             onClick={() => handleMethodSelect('email')}
//             className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition
//               ${selectedMethod === 'email'
//                 ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-200'
//                 : 'border-border hover:border-indigo-300'}`}
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20">
//               📧
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">Email</div>
//               <div className="text-sm text-muted-foreground">Получить код на почту</div>
//             </div>
//             {selectedMethod === 'email' && (
//               <div className="size-5 rounded-full bg-indigo-600 flex items-center justify-center">
//                 <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//             )}
//           </button>

//           {/* Google - Заглушка */}
//           <button
//             type="button"
//             disabled
//             className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50 cursor-not-allowed"
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
//               🔐
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">Google</div>
//               <div className="text-sm text-muted-foreground">Скоро будет доступно</div>
//             </div>
//           </button>

//           {/* Telegram - Заглушка */}
//           <button
//             type="button"
//             disabled
//             className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50 cursor-not-allowed"
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
//               ✈️
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">Telegram</div>
//               <div className="text-sm text-muted-foreground">Скоро будет доступно</div>
//             </div>
//           </button>

//           {/* WhatsApp - Заглушка */}
//           <button
//             type="button"
//             disabled
//             className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-left opacity-50 cursor-not-allowed"
//           >
//             <div className="flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-500/20">
//               💬
//             </div>
//             <div className="flex-1">
//               <div className="font-medium">WhatsApp</div>
//               <div className="text-sm text-muted-foreground">Скоро будет доступно</div>
//             </div>
//           </button>
//         </div>
//       </div>

//       {/* Email верификация */}
//       {selectedMethod === 'email' && (
//         <div className="mt-6 rounded-xl border border-border bg-card p-6">
//           <h3 className="mb-4 font-medium">Подтверждение через Email</h3>

//           {!codeSent ? (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">Ваш email:</label>
//                 <input
//                   type="email"
//                   value={email}
//                   disabled
//                   className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-muted-foreground"
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={handleSendCode}
//                 disabled={loading || !email}
//                 className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? 'Отправка...' : 'Отправить код'}
//               </button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">Введите 6-значный код:</label>
//                 <input
//                   type="text"
//                   inputMode="numeric"
//                   maxLength={6}
//                   value={code}
//                   onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
//                   placeholder="000000"
//                   className="w-full rounded-lg border border-border bg-background px-4 py-3 text-center text-2xl font-mono tracking-widest"
//                   autoFocus
//                 />
//               </div>

//               <button
//                 type="button"
//                 onClick={handleVerifyCode}
//                 disabled={loading || code.length !== 6}
//                 className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? 'Проверка...' : 'Подтвердить код'}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setCodeSent(false);
//                   setCode('');
//                   setError(null);
//                   setSuccess(null);
//                 }}
//                 disabled={loading}
//                 className="w-full rounded-xl border border-border px-5 py-2 font-medium text-muted-foreground transition hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Отправить код повторно
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Сообщения */}
//       {error && (
//         <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
//           {error}
//         </div>
//       )}

//       {success && (
//         <div className="mt-4 rounded-lg border border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300">
//           ✓ {success}
//         </div>
//       )}

//       {/* Нижняя панель навигации */}
//       <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//         <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
//           >
//             Назад
//           </button>

//           <div className="text-sm text-muted-foreground">
//             Шаг 5 из 6
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
