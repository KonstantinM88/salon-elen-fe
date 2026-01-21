//scr//app/booking/(steps)/master/page.tsx
"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
import { User, ChevronRight, ArrowLeft, Sparkles, Star, Crown, Zap } from "lucide-react";
import { translate, type MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/I18nProvider";
import { useTranslations } from "@/i18n/useTranslations";

interface Master {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

/* ===================== Floating Particles - PREMIUM VERSION ===================== */
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number; color: string }>>([]);

  useEffect(() => {
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

/* ===================== Enhanced Page Shell ===================== */
function PageShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations();

  const BOOKING_STEPS = [
    { id: "services", label: t("booking_step_services"), icon: "✨" },
    { id: "master", label: t("booking_step_master"), icon: "👤" },
    { id: "calendar", label: t("booking_step_date"), icon: "📅" },
    { id: "client", label: t("booking_step_client"), icon: "📝" },
    { id: "verify", label: t("booking_step_verify"), icon: "✓" },
    { id: "payment", label: t("booking_step_payment"), icon: "💳" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
      {/* Неоновая верхняя линия - как в футере */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />
      
      <BookingAnimatedBackground />
      <FloatingParticles />

      {/* Премиальный фон с радиальными градиентами - как в футере */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen">
        <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
            <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
          </div>
        </header>

        <div className="h-[84px] md:h-[96px]" />

        {children}
      </div>
    </div>
  );
}

/* ===================== Video Section ===================== */
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

/* ===================== ULTRA PREMIUM Master Card ===================== */
function MasterCard({
  master,
  onSelect,
  index,
}: {
  master: Master;
  onSelect: (id: string) => void;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      whileHover={{ y: -12, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect(master.id)}
      className="group relative mx-auto w-full max-w-[920px] cursor-pointer xl:max-w-[1100px]"
    >
      {/* ПРЕМИАЛЬНАЯ ВНЕШНЯЯ ОБЁРТКА - как ColumnCard в футере */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative h-full rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[1.5px] shadow-[0_0_40px_rgba(251,191,36,0.45)]"
      >
        {/* Мягкое внешнее сияние */}
        <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.25),transparent_65%)] blur-3xl" />

        {/* ВНУТРЕННЯЯ ПРЕМИАЛЬНАЯ КАРТОЧКА */}
        <div className="relative h-full overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl shadow-inner md:p-8 lg:p-10">
          {/* Внутренние подсветки */}
          <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-emerald-400/18 blur-3xl" />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

          {/* Animated Background Pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-25">
            <motion.div
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, rgba(251,191,36,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(circle at 50% 20%, rgba(56,189,248,0.12) 0%, transparent 50%)",
                backgroundSize: "200% 200%",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative flex items-center gap-4 md:gap-6 lg:gap-10">
            {/* Avatar Section - ULTRA PREMIUM */}
            <div className="relative shrink-0">
              {/* Тройное вращающееся кольцо */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-40 blur-lg"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-full bg-gradient-to-r from-fuchsia-400 via-pink-400 to-fuchsia-500 opacity-30 blur-md"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 opacity-35 blur-sm"
              />

              {/* Премиальные sparkles */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-3 z-10"
              >
                <Sparkles className="h-6 w-6 md:h-7 md:w-7 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
              </motion.div>

              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  rotate: [360, 180, 0],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 3.5, repeat: Infinity, delay: 0.7 }}
                className="absolute -bottom-3 -left-3 z-10"
              >
                <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-200 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" />
              </motion.div>

              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.9, 0.5],
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }}
                className="absolute top-0 right-[-1rem] z-10"
              >
                <Zap className="h-4 w-4 md:h-5 md:w-5 text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
              </motion.div>

              {/* Avatar с градиентным кольцом */}
              <div className="relative">
                {master.avatarUrl ? (
                  <div className="relative h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 overflow-hidden rounded-full ring-4 ring-amber-400/70 shadow-[0_0_30px_rgba(251,191,36,0.6)] transition-all group-hover:ring-amber-300 group-hover:shadow-[0_0_40px_rgba(251,191,36,0.8)]">
                    <Image
                      src={master.avatarUrl}
                      alt={master.name}
                      width={160}
                      height={160}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-500 ring-4 ring-amber-400/70 shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                    <User className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 text-black/80" />
                  </div>
                )}

                {/* VIP Crown Badge - больше и ярче */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 12 }}
                  className="absolute -bottom-2 -right-2 z-20 flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.9)]"
                >
                  <Crown className="h-5 w-5 md:h-6 md:w-6 text-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                </motion.div>
              </div>
            </div>

            {/* Text Content - PREMIUM STYLING */}
            <div className="flex-1 space-y-3 md:space-y-4">
              {/* Premium VIP Master Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-300/15 to-amber-400/20 px-4 py-1.5 ring-1 ring-amber-300/40 backdrop-blur-sm"
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="h-4 w-4 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                </motion.div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-200 md:text-sm">
                  {t("booking_master_vip_badge")}
                </span>
              </motion.div>

              {/* Name - ФИРМЕННЫЙ ШРИФТ с градиентом */}
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="brand-script break-words bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-xl font-bold leading-tight text-transparent drop-shadow-[0_0_25px_rgba(251,191,36,0.6)] md:text-2xl lg:text-3xl xl:text-4xl"
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  textShadow: "0 0 30px rgba(251,191,36,0.5), 0 0 50px rgba(251,191,36,0.3)",
                }}
              >
                {master.name}
              </motion.h3>

              {/* Bio - Премиальный текст с градиентом и свечением */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className="relative"
              >
                <p
                  className="text-sm md:text-base lg:text-lg break-words leading-relaxed bg-gradient-to-r from-slate-100 via-white to-slate-100 bg-clip-text text-transparent"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    filter: "drop-shadow(0 2px 8px rgba(255,255,255,0.15))",
                  }}
                >
                  {master.bio || t("booking_master_default_bio")}
                </p>
                {/* Тонкая подсветка снизу */}
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.6, duration: 0.8 }}
                  className="absolute -bottom-1 left-0 h-px w-20 origin-left bg-gradient-to-r from-amber-400/60 via-amber-300/40 to-transparent blur-[0.5px]"
                />
              </motion.div>

              {/* Премиальная полоска с иконками */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="flex flex-wrap items-center gap-2 pt-2"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                  </span>
                  <span className="font-medium">{t("booking_master_online_booking")}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-500/10 px-3 py-1 text-xs text-sky-200 backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-sky-300 text-sky-300" />
                  <span className="font-medium">{t("booking_master_premium")}</span>
                </div>
              </motion.div>
            </div>

            {/* Premium Arrow Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.4, type: "spring" }}
              className="relative shrink-0"
            >
              <motion.div
                animate={{ x: isHovered ? 8 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                {/* Свечение кнопки */}
                <div
                  className={`absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-0 blur-xl transition-opacity duration-500 ${
                    isHovered ? "opacity-70" : ""
                  }`}
                />
                
                <div className="relative flex h-14 w-14 md:h-16 md:w-16 lg:h-18 lg:w-18 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-lg shadow-amber-500/50 transition-shadow group-hover:shadow-xl group-hover:shadow-amber-500/60">
                  <ChevronRight className="h-7 w-7 md:h-8 md:w-8 text-black" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Нижняя неоновая линия внутри карточки */}
          <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ===================== Master Inner ===================== */
function MasterInner(): React.JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const { locale } = useI18n();
  const t = useTranslations();

  const serviceIds = useMemo(
    () => params.getAll("s").filter((id) => id.trim()),
    [params]
  );

  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMasters() {
      if (serviceIds.length === 0) {
        setLoading(false);
        setError(translate(locale, "booking_master_no_services"));
        return;
      }

      try {
        const qs = new URLSearchParams();
        qs.set("serviceIds", serviceIds.join(","));

        const res = await fetch(`/api/masters?${qs.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`${translate(locale, "booking_master_load_error")}: ${res.status}`);
        }

        const data = (await res.json()) as {
          masters: Master[];
          defaultMasterId: string | null;
        };

        if (!isMounted) return;

        setMasters(data.masters ?? []);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to fetch masters:", err);
        setError(err instanceof Error ? err.message : translate(locale, "booking_master_load_error"));
        setLoading(false);
      }
    }

    void fetchMasters();

    return () => {
      isMounted = false;
    };
  }, [serviceIds, locale]);

  const selectMaster = (masterId: string) => {
    const qs = new URLSearchParams();
    serviceIds.forEach((id) => qs.append("s", id));
    qs.set("m", masterId);
    router.push(`/booking/calendar?${qs.toString()}`);
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
          <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-6 h-20 w-20 rounded-full border-4 border-amber-500/30 border-t-amber-500 shadow-[0_0_30px_rgba(251,191,36,0.5)]"
              />
              <p className="text-lg font-medium bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
                {t("booking_loading_text")}
              </p>
            </motion.div>
          </div>
        </div>
      </PageShell>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
          <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md text-center"
            >
              <div className="mb-6 text-6xl">❌</div>
              <h2 className="mb-4 text-3xl font-bold text-red-400">{t("booking_error_title")}</h2>
              <p className="mb-8 text-slate-300">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all hover:scale-105"
              >
                {t("booking_error_retry")}
              </button>
            </motion.div>
          </div>
        </div>
      </PageShell>
    );
  }

  /* ---------- No Masters ---------- */
  if (masters.length === 0) {
    return (
      <PageShell>
        <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
          <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-6 py-3 backdrop-blur-sm"
              >
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span className="font-semibold text-amber-300">
                  {t("booking_master_no_available")}
                </span>
              </motion.div>

              <h2 className="mb-4 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text font-serif text-4xl italic text-transparent md:text-5xl drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                {t("booking_master_different_masters")}
              </h2>

              <p className="brand-script brand-subtitle mx-auto mb-8 max-w-lg text-lg md:text-xl">
                {t("booking_master_choose_same_specialist")}
              </p>

              <button
                onClick={() => router.push("/booking/services")}
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(251,191,36,0.7)]"
              >
                <ArrowLeft className="h-5 w-5" />
                {t("booking_master_back_to_services")}
              </button>
            </motion.div>
          </div>
        </main>

        <VideoSection />
      </PageShell>
    );
  }

  /* ---------- Masters List - ULTRA PREMIUM ---------- */
  return (
    <PageShell>
      <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
        {/* Hero Section - МАКСИМАЛЬНО ПРЕМИАЛЬНО */}
        <div className="flex w-full flex-col items-center text-center pt-10 md:pt-14 lg:pt-16">
          {/* Ultra Premium Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative mb-8 md:mb-10"
          >
            {/* Множественные пульсирующие слои */}
            <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-fuchsia-500/40 via-amber-400/40 to-sky-500/40 opacity-60 blur-2xl" />
            <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-10 py-4 shadow-[0_15px_50px_rgba(251,191,36,0.6)] ring-1 ring-amber-200/50"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Crown className="h-6 w-6 text-black md:h-7 md:w-7 drop-shadow-lg" />
              </motion.div>
              <span className="font-serif text-lg font-bold italic text-black md:text-xl drop-shadow-sm">
                {t("booking_master_step_title")}
              </span>
              <motion.div
                animate={{ rotate: [360, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Crown className="h-6 w-6 text-black md:h-7 md:w-7 drop-shadow-lg" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Title - МАКСИМАЛЬНОЕ СИЯНИЕ */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring" }}
            className="mb-5 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text font-serif text-5xl italic leading-tight text-transparent md:mb-6 md:text-6xl lg:text-7xl xl:text-8xl"
            style={{
              textShadow: "0 0 40px rgba(251,191,36,0.7), 0 0 70px rgba(251,191,36,0.5), 0 0 100px rgba(251,191,36,0.3)",
              filter: "drop-shadow(0 0 30px rgba(251,191,36,0.6))",
            }}
          >
            {t("booking_master_hero_title")}
          </motion.h1>

          {/* Subtitle - ПРЕМИУМ ГРАДИЕНТ */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="brand-script brand-subtitle mx-auto max-w-2xl text-xl md:text-2xl"
          >
            {t("booking_master_hero_subtitle")}
          </motion.p>

          {/* Декоративная линия */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent md:w-40"
          />
        </div>

        {/* Masters Grid - ПРЕМИУМ КАРТОЧКИ */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:mt-18 md:gap-10 lg:gap-12 pb-12">
          <AnimatePresence mode="popLayout">
            {masters.map((m, i) => (
              <MasterCard
                key={m.id}
                master={m}
                index={i}
                onSelect={selectMaster}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Back Button - ПРЕМИУМ СТИЛЬ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-14 mb-10 text-center md:mt-18"
        >
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/booking/services")}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium text-slate-200 backdrop-blur-sm transition-all hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-amber-300"
          >
            <ArrowLeft className="h-5 w-5" />
            {t("booking_master_back_button")}
          </motion.button>
        </motion.div>
      </main>

      <VideoSection />

      <style jsx global>{`
        .brand-subtitle {
          background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow:
            0 0 12px rgba(139, 92, 246, 0.5),
            0 0 24px rgba(59, 130, 246, 0.4),
            0 0 36px rgba(6, 182, 212, 0.3);
        }
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
    </PageShell>
  );
}

/* ===================== Export ===================== */
export default function MasterPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950/95 to-black">
          <div className="h-24 w-24 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-500 shadow-[0_0_40px_rgba(251,191,36,0.6)]" />
        </div>
      }
    >
      <MasterInner />
    </Suspense>
  );
}
