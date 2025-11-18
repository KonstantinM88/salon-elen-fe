// File: src/app/booking/(steps)/client/page.tsx
"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import { ArrowLeft, User2, Mail, Sparkles } from "lucide-react";

type EmailCheck =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok" }
  | { state: "fail"; reason?: string }
  | { state: "unavailable" };

type ReferralKind = "google" | "facebook" | "instagram" | "friends" | "other";

const BOOKING_STEPS = [
  { id: "services", label: "Услуга", icon: "✨" },
  { id: "master", label: "Мастер", icon: "👤" },
  { id: "calendar", label: "Дата", icon: "📅" },
  { id: "client", label: "Данные", icon: "📝" },
  { id: "verify", label: "Проверка", icon: "✓" },
  { id: "payment", label: "Оплата", icon: "💳" },
];

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

/* ---------- Общая оболочка ---------- */

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white">
      <header
        className={`
          fixed top-0 inset-x-0 z-50
          bg-black/45 backdrop-blur-md border-b border-white/10
        `}
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
          <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
        </div>
      </header>

      {/* отступ под фиксированный header */}
      <div className="h-[84px] md:h-[96px]" />

      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-[-240px] h-[320px] bg-gradient-to-t from-amber-500/15 via-black/40 to-transparent blur-3xl" />
    </div>
  );
}

/* ---------- Видео секция ---------- */

function VideoSection() {
  return (
    <section className="relative py-8 sm:py-10">
      <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)]">
        <video
          className={`
            absolute inset-0 h-full w-full
            object-contain 2xl:object-cover
            object-[50%_92%] lg:object-[50%_98%] xl:object-[50%_104%] 2xl:object-[50%_96%]
          `}
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/5 pointer-events-none" />
      </div>
    </section>
  );
}

/* ---------- Основная форма клиента ---------- */

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

  const maxBirth = formatYMD(new Date());
  const minBirth = formatYMD(yearsAgo(120));
  const minAdult = formatYMD(yearsAgo(16));

  // ---- Валидация полей ----
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

  // 👉 E-mail ДОЛЖЕН быть заполнен и корректен
  let emailErr: string | null = null;
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    emailErr = "E-mail обязателен";
  } else if (!isValidEmailSyntax(trimmedEmail)) {
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

  // 👉 делаем формулу попроще: emailCheck.state может быть любым, кроме ошибки
  const formValid =
    !baseDisabled &&
    !nameErr &&
    !phoneErr &&
    !birthErr &&
    !emailErr &&
    !referralErr;

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
        const verifyUrl = `/booking/verify?draft=${
          result.draftId
        }&email=${encodeURIComponent(email.trim())}&${qs.toString()}`;
        router.push(verifyUrl);
      } else {
        throw new Error("Некорректный ответ от сервера");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Не удалось создать запись";
      setSubmitErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (baseDisabled) {
    return (
      <main className="mx-auto max-w-2xl px-4 xl:px-8 pb-24">
        <div className="mt-10 rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
          <p className="text-sm md:text-base text-red-200">
            Некорректные параметры. Пожалуйста, начните запись заново.
          </p>
          <Link
            href="/booking"
            className="mt-4 inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к выбору услуг
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 pb-28">
        {/* Заголовок */}
        <div className="w-full flex flex-col items-center text-center">
          <div className="relative inline-block mt-4 md:mt-6 mb-5 md:mb-6">
            <div className="absolute -inset-2 rounded-full blur-xl opacity-60 bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40" />
            <div
              className={`
                relative flex items-center gap-2
                px-6 md:px-8 py-2.5 md:py-3
                rounded-full border border-white/15
                bg-gradient-to-r from-amber-500/70 via-yellow-500/70 to-amber-500/70
                text-black shadow-[0_10px_40px_rgba(245,197,24,0.35)]
                backdrop-blur-sm
              `}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/15">
                <User2 className="w-4 h-4 text-black/80" />
              </span>
              <span className="font-serif italic tracking-wide text-sm md:text-base">
                Шаг 4 — Ваши контактные данные
              </span>
            </div>
          </div>

          <h1
            className={`
              mx-auto text-center
              text-4xl md:text-5xl lg:text-5xl xl:text-6xl
              font-serif italic leading-tight
              mb-3 md:mb-4
              text-transparent bg-clip-text
              bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
              drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
            `}
          >
            Онлайн-запись
          </h1>

          <p
            className="
              mx-auto text-center max-w-2xl
              font-serif italic tracking-wide
              text-lg md:text-xl
              text-transparent bg-clip-text
              bg-gradient-to-r from-[#7b5cff] via-[#4f8dff] to-[#3bc5ff]
            "
            style={{
              textShadow:
                "0 0 6px rgba(70,140,255,1), 0 0 14px rgba(70,140,255,0.95), 0 0 26px rgba(40,120,255,0.9)",
            }}
          >
            Укажите ваши данные, чтобы мы подтвердили бронь и отправили детали
            записи.
          </p>
        </div>

        {/* Форма + боковой блок */}
        <section className="mt-8 md:mt-10 grid gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-start">
          {/* Левая колонка — форма */}
          <form
            onSubmit={handleSubmit}
            className="relative rounded-3xl bg-gradient-to-br from-black/70 via-black/60 to-black/80 border border-white/12 p-5 md:p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] space-y-6"
          >
            <div className="pointer-events-none absolute -top-28 -left-24 w-72 h-72 rounded-full bg-amber-500/12 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-yellow-400/10 blur-3xl" />

            {/* Имя */}
            <div className="relative">
              <label
                htmlFor="name"
                className="block text-sm md:text-[15px] font-medium text-white/80"
              >
                Имя <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
                placeholder="Ваше полное имя"
                required
              />
              {nameErr && (
                <p className="mt-1 text-xs md:text-sm text-red-300">
                  {nameErr}
                </p>
              )}
            </div>

            {/* Телефон */}
            <div className="relative">
              <label
                htmlFor="phone"
                className="block text-sm md:text-[15px] font-medium text-white/80"
              >
                Телефон <span className="text-red-400">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
                placeholder="+7 (xxx) xxx-xx-xx"
                required
              />
              {phoneErr && (
                <p className="mt-1 text-xs md:text-sm text-red-300">
                  {phoneErr}
                </p>
              )}
            </div>

            {/* Email (обязательный) */}
            <div className="relative">
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm md:text-[15px] font-medium text-white/80"
              >
                <span>E-mail</span>
                <span className="text-red-400">*</span>
                <Mail className="w-4 h-4 text-white/50" />
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
                placeholder="your@email.com"
                required
              />
              {emailCheck.state === "checking" && !emailErr && (
                <p className="mt-1 text-xs md:text-sm text-white/55">
                  Проверка…
                </p>
              )}
              {emailCheck.state === "ok" && !emailErr && (
                <p className="mt-1 flex items-center gap-1 text-xs md:text-sm text-emerald-300">
                  <Sparkles className="w-3 h-3" />
                  E-mail подтверждён
                </p>
              )}
              {emailErr && (
                <p className="mt-1 text-xs md:text-sm text-red-300">
                  {emailErr}
                </p>
              )}
              {emailCheck.state === "unavailable" && !emailErr && (
                <p className="mt-1 text-xs md:text-sm text-white/45">
                  Не удалось проверить e-mail, но вы можете продолжить.
                </p>
              )}
            </div>

            {/* Дата рождения */}
            <div className="relative">
              <label
                htmlFor="birth"
                className="block text-sm md:text-[15px] font-medium text-white/80"
              >
                Дата рождения <span className="text-red-400">*</span>
              </label>
              <input
                id="birth"
                type="date"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                min={minBirth}
                max={maxBirth}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
                required
              />
              {birthErr && (
                <p className="mt-1 text-xs md:text-sm text-red-300">
                  {birthErr}
                </p>
              )}
              <p className="mt-1 text-[11px] md:text-xs text-white/45">
                Для онлайн-записи требуется возраст 16+
              </p>
            </div>

            {/* Как узнали о нас */}
            <div className="relative">
              <label
                htmlFor="referral"
                className="block text-sm md:text-[15px] font-medium text-white/80"
              >
                Как вы узнали о нас? <span className="text-red-400">*</span>
              </label>
              <select
                id="referral"
                value={referral}
                onChange={(e) =>
                  setReferral(e.target.value as ReferralKind | "")
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
                required
              >
                <option value="">Выберите вариант</option>
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="friends">Рекомендация друзей</option>
                <option value="other">Другое</option>
              </select>
              {referral === "other" && (
                <input
                  type="text"
                  value={referralOther}
                  onChange={(e) => setReferralOther(e.target.value)}
                  placeholder="Уточните источник"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all"
                />
              )}
              {referralErr && (
                <p className="mt-1 text-xs md:text-sm text-red-300">
                  {referralErr}
                </p>
              )}
            </div>

            {/* Комментарий */}
            <div className="relative">
              <label
                htmlFor="comment"
                className="block text-sm md:text-[15px] font-medium text-white/80"
              >
                Комментарий{" "}
                <span className="text-white/45 text-[11px] md:text-xs">
                  (необязательно)
                </span>
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/70 focus:border-amber-300 transition-all resize-none"
                placeholder="Дополнительная информация или пожелания"
              />
            </div>

            {/* Ошибка отправки */}
            {submitErr && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
                <p className="text-xs md:text-sm text-red-200">{submitErr}</p>
              </div>
            )}

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/40 px-5 py-2.5 text-sm md:text-base text-white/80 hover:bg-white/5 hover:text-amber-300 transition-colors"
                disabled={submitting}
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </button>
              <button
                type="submit"
                disabled={!formValid || submitting}
                className={`
                  flex-1 inline-flex items-center justify-center gap-2 rounded-xl
                  bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500
                  px-6 py-2.5 text-sm md:text-base font-semibold text-black
                  shadow-[0_0_30px_rgba(245,197,24,0.6)]
                  hover:shadow-[0_0_40px_rgba(245,197,24,0.85)]
                  transition-all disabled:opacity-60 disabled:cursor-not-allowed
                `}
              >
                {submitting ? "Создание записи…" : "Забронировать"}
              </button>
            </div>
          </form>

          {/* Правая колонка — инфо-блок */}
          <aside className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-black/80 via-black/70 to-black/80 p-5 md:p-6 shadow-[0_0_45px_rgba(0,0,0,0.7)]">
            <div className="pointer-events-none absolute -top-24 right-0 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative space-y-4 text-sm md:text-[15px] text-white/80">
              <h3 className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-1">
                Почему мы просим e-mail?
              </h3>
              <p>
                На ваш e-mail мы отправим подтверждение брони и все детали
                записи. Также вы получите напоминание перед визитом.
              </p>
              <p>
                Мы бережно относимся к персональным данным и используем их
                только для обслуживания вашей записи.
              </p>
              <div className="mt-4 rounded-2xl border border-white/15 bg-black/60 p-3 flex items-start gap-3">
                <Sparkles className="mt-1 w-4 h-4 text-amber-300" />
                <p className="text-xs md:text-sm text-white/75">
                  Если вы допустите ошибку в e-mail, вы всё равно сможете прийти
                  на приём, но не получите напоминания и подтверждения.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <VideoSection />
    </>
  );
}

/* ---------- Export ---------- */

export default function ClientPage(): React.JSX.Element {
  return (
    <PageShell>
      <Suspense
        fallback={
          <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 pb-28">
            <div className="min-h-[40vh] flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
            </div>
          </main>
        }
      >
        <ClientForm />
      </Suspense>
    </PageShell>
  );
}

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
