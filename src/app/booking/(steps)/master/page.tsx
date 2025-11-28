"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
import { User, ChevronRight, ArrowLeft, Sparkles, Star, Crown } from "lucide-react";

interface Master {
  id: string;
  name: string;
  avatarUrl?: string | null;
  description?: string | null;
  specialty?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
}

const BOOKING_STEPS = [
  { id: "services", label: "Услуга", icon: "✨" },
  { id: "master", label: "Мастер", icon: "👤" },
  { id: "calendar", label: "Дата", icon: "📅" },
  { id: "client", label: "Данные", icon: "📝" },
  { id: "verify", label: "Проверка", icon: "✓" },
  { id: "payment", label: "Оплата", icon: "💳" },
];

/* ===================== Floating Particles Background ===================== */
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    // Генерируем частицы только на клиенте - БЕЗ SSR ошибок!
    const newParticles = [...Array(20)].map((_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      id: i,
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute h-1 w-1 rounded-full bg-amber-400/30"
          initial={{ x: particle.x, y: particle.y, opacity: 0 }}
          animate={{
            x: [particle.x, Math.random() * window.innerWidth, particle.x],
            y: [particle.y, Math.random() * window.innerHeight, particle.y],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ===================== Page Shell ===================== */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <BookingAnimatedBackground />
      <FloatingParticles />

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

/* ===================== Master Card - PREMIUM REDESIGN ===================== */
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 280,
        damping: 25,
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect(master.id)}
      className="group relative mx-auto w-full max-w-[900px] cursor-pointer xl:max-w-[1020px]"
    >
      {/* Outer Glow */}
      <div
        className={`absolute -inset-6 rounded-[32px] bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40 opacity-0 blur-2xl transition-opacity duration-700 ${
          isHovered ? "opacity-100" : ""
        }`}
      />

      {/* Main Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/40 via-slate-950/60 to-black/40 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-500 group-hover:border-amber-500/60 group-hover:shadow-[0_0_60px_rgba(245,197,24,0.4)] md:p-8 lg:p-10">
        {/* Animated Background Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(245,197,24,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(253,224,71,0.12) 0%, transparent 50%)",
              backgroundSize: "200% 200%",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative flex items-center gap-4 md:gap-6 lg:gap-8">
          {/* Avatar Section */}
          <div className="relative shrink-0">
            {/* Animated Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 opacity-30 blur-md"
            />

            {/* Sparkles */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 z-10"
            >
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-amber-400" />
            </motion.div>

            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              className="absolute -bottom-2 -left-2 z-10"
            >
              <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-300" />
            </motion.div>

            {/* Avatar */}
            <div className="relative">
              {master.avatarUrl ? (
                <div className="relative h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 overflow-hidden rounded-full ring-4 ring-amber-500/50 transition-all group-hover:ring-amber-400">
                  <Image
                    src={master.avatarUrl}
                    alt={master.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 ring-4 ring-amber-500/50 transition-all group-hover:ring-amber-400">
                  <User className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-black" />
                </div>
              )}
            </div>

            {/* VIP Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
              className="absolute -bottom-1 -right-1 z-10"
            >
              <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50">
                <Crown className="h-3.5 w-3.5 md:h-4 md:w-4 text-black" />
              </div>
            </motion.div>
          </div>

          {/* Info Section */}
          <div className="min-w-0 flex-1">
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="mb-2 md:mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1"
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                VIP Master
              </span>
            </motion.div>

            {/* Name with Glow Effect - ИСПРАВЛЕНО для мобильных */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="mb-1.5 md:mb-2 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-xl font-extrabold text-transparent md:text-2xl lg:text-3xl xl:text-4xl break-words"
              style={{
                textShadow:
                  "0 0 30px rgba(245,197,24,0.5), 0 0 60px rgba(253,224,71,0.3)",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {master.name}
            </motion.h3>

            {/* Description/Specialty - БЕРЁМ ИЗ ДАННЫХ */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="text-sm text-white/70 md:text-base lg:text-lg break-words"
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {master.description || master.specialty || "Мастер салона красоты"}
            </motion.p>

            {/* Rating Stars - БЕРЁМ ИЗ ДАННЫХ */}
            {(master.rating || master.reviewCount) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="mt-2 md:mt-3 flex flex-wrap items-center gap-1"
              >
                {master.rating && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 md:h-4 md:w-4 ${
                          i < Math.floor(master.rating!)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-600 text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs md:text-sm text-white/60">
                      {master.rating.toFixed(1)}
                      {master.reviewCount && ` (${master.reviewCount} отзывов)`}
                    </span>
                  </>
                )}
                {!master.rating && master.reviewCount && (
                  <span className="text-xs md:text-sm text-white/60">
                    {master.reviewCount} отзывов
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Arrow Icon */}
          <motion.div
            animate={{
              x: isHovered ? 8 : 0,
            }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex-shrink-0"
          >
            <div className="flex h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50 transition-all group-hover:shadow-xl group-hover:shadow-amber-500/60">
              <ChevronRight className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-black" />
            </div>
          </motion.div>
        </div>

        {/* Bottom Shine Effect */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      </div>
    </motion.div>
  );
}

/* ===================== Main Page Component ===================== */
function MasterInner(): React.JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  const serviceIds = useMemo<string[]>(
    () => params.getAll("s").filter(Boolean),
    [params],
  );

  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMasters(): Promise<void> {
      if (serviceIds.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const qs = new URLSearchParams();
        qs.set("serviceIds", serviceIds.join(","));
        const res = await fetch(`/api/masters?${qs.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { masters: Master[] };
        if (!cancelled) setMasters(data.masters ?? []);
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Не удалось загрузить мастеров";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMasters();
    return () => {
      cancelled = true;
    };
  }, [serviceIds]);

  const selectMaster = (masterId: string): void => {
    const qs = new URLSearchParams();
    serviceIds.forEach((id) => qs.append("s", id));
    qs.set("m", masterId);
    router.push(`/booking/calendar?${qs.toString()}`);
  };

  /* ---------- No Services ---------- */
  if (serviceIds.length === 0) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
          <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md text-center"
            >
              <div className="mb-6 text-5xl md:text-6xl">⚠️</div>
              <h2 className="mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
                Услуги не выбраны
              </h2>
              <p className="mb-8 text-white/80">
                Пожалуйста, сначала выберите услуги.
              </p>
              <button
                onClick={() => router.push("/booking/services")}
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(245,197,24,0.7)]"
              >
                Выбрать услуги
              </button>
            </motion.div>
          </div>
        </div>
      </PageShell>
    );
  }

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
                className="mx-auto mb-6 h-20 w-20 rounded-full border-4 border-amber-500/30 border-t-amber-500"
              />
              <p className="text-lg font-medium text-white/80">
                Загрузка мастеров…
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
              <h2 className="mb-4 text-3xl font-bold text-red-400">Ошибка</h2>
              <p className="mb-8 text-white/80">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.5)] transition-all hover:scale-105"
              >
                Попробовать снова
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
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-6 py-3"
              >
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span className="font-semibold text-amber-300">
                  Нет подходящего мастера
                </span>
              </motion.div>

              <h2 className="mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text font-serif text-4xl italic text-transparent md:text-5xl">
                Выбранные услуги выполняют разные мастера
              </h2>

              <p className="brand-script brand-subtitle mx-auto mb-8 max-w-lg text-lg md:text-xl">
                Выберите набор услуг одного специалиста или вернитесь к выбору
              </p>

              <button
                onClick={() => router.push("/booking/services")}
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.5)] transition-all hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5" />
                Вернуться к услугам
              </button>
            </motion.div>
          </div>
        </main>

        <VideoSection />
      </PageShell>
    );
  }

  /* ---------- Masters List ---------- */
  return (
    <PageShell>
      <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
        {/* Hero Section */}
        <div className="flex w-full flex-col items-center text-center pt-8 md:pt-12">
          {/* Premium Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative mb-6 md:mb-8"
          >
            <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 opacity-50 blur-xl" />
            <div className="relative flex items-center gap-3 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-8 py-3 shadow-[0_10px_40px_rgba(245,197,24,0.5)]">
              <Crown className="h-5 w-5 text-black md:h-6 md:w-6" />
              <span className="font-serif text-base font-bold italic text-black md:text-lg">
                Шаг 2 — Выбор Премиум Мастера
              </span>
              <Crown className="h-5 w-5 text-black md:h-6 md:w-6" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text font-serif text-5xl italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(245,197,24,0.5)] md:mb-5 md:text-6xl lg:text-7xl"
          >
            Выбор мастера
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="brand-script brand-subtitle mx-auto max-w-2xl text-lg md:text-xl"
          >
            Наши эксперты создадут для вас идеальный образ
          </motion.p>
        </div>

        {/* Masters Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:gap-8 lg:gap-10">
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

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 mb-8 text-center md:mt-16"
        >
          <button
            onClick={() => router.push("/booking/services")}
            className="inline-flex items-center gap-2 font-medium text-white/70 transition-colors hover:text-amber-400"
          >
            <ArrowLeft className="h-5 w-5" />
            Вернуться к выбору услуг
          </button>
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
            0 0 10px rgba(139, 92, 246, 0.4),
            0 0 20px rgba(59, 130, 246, 0.3),
            0 0 30px rgba(6, 182, 212, 0.25);
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
      `}</style>
    </PageShell>
  );
}

/* ===================== Export ===================== */
export default function MasterPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-500" />
        </div>
      }
    >
      <MasterInner />
    </Suspense>
  );
}


//-------уже вот вот осталось добавить описание мастера и рейтинг-------
// "use client";

// import React, { useState, useEffect, useMemo, Suspense } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import { User, ChevronRight, ArrowLeft, Sparkles, Star, Crown } from "lucide-react";

// interface Master {
//   id: string;
//   name: string;
//   avatarUrl?: string | null;
//   description?: string | null;
//   specialty?: string | null;
//   rating?: number | null;
//   reviewCount?: number | null;
// }

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// /* ===================== Floating Particles Background ===================== */
// function FloatingParticles() {
//   const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

//   useEffect(() => {
//     setDimensions({
//       width: window.innerWidth,
//       height: window.innerHeight,
//     });

//     const handleResize = () => {
//       setDimensions({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       });
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div className="pointer-events-none absolute inset-0 overflow-hidden">
//       {[...Array(20)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute h-1 w-1 rounded-full bg-amber-400/30"
//           initial={{
//             x: Math.random() * dimensions.width,
//             y: Math.random() * dimensions.height,
//           }}
//           animate={{
//             x: Math.random() * dimensions.width,
//             y: Math.random() * dimensions.height,
//             scale: [1, 1.5, 1],
//             opacity: [0.3, 0.8, 0.3],
//           }}
//           transition={{
//             duration: Math.random() * 10 + 10,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// /* ===================== Page Shell ===================== */
// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black text-white">
//       <BookingAnimatedBackground />
//       <FloatingParticles />

//       <div className="relative z-10 min-h-screen">
//         <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//           <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//             <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//           </div>
//         </header>

//         <div className="h-[84px] md:h-[96px]" />

//         {children}
//       </div>
//     </div>
//   );
// }

// /* ===================== Video Section ===================== */
// function VideoSection() {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%] bg-black"
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

//         <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
//       </div>
//     </section>
//   );
// }

// /* ===================== Master Card - PREMIUM REDESIGN ===================== */
// function MasterCard({
//   master,
//   onSelect,
//   index,
// }: {
//   master: Master;
//   onSelect: (id: string) => void;
//   index: number;
// }) {
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, scale: 0.95, y: 30 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.92 }}
//       transition={{
//         delay: index * 0.1,
//         type: "spring",
//         stiffness: 280,
//         damping: 25,
//       }}
//       whileHover={{ y: -8, scale: 1.02 }}
//       onHoverStart={() => setIsHovered(true)}
//       onHoverEnd={() => setIsHovered(false)}
//       onClick={() => onSelect(master.id)}
//       className="group relative mx-auto w-full max-w-[900px] cursor-pointer xl:max-w-[1020px]"
//     >
//       {/* Outer Glow */}
//       <div
//         className={`absolute -inset-6 rounded-[32px] bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40 opacity-0 blur-2xl transition-opacity duration-700 ${
//           isHovered ? "opacity-100" : ""
//         }`}
//       />

//       {/* Main Card */}
//       <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/40 via-slate-950/60 to-black/40 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-500 group-hover:border-amber-500/60 group-hover:shadow-[0_0_60px_rgba(245,197,24,0.4)] md:p-8 lg:p-10">
//         {/* Animated Background Pattern */}
//         <div className="pointer-events-none absolute inset-0 opacity-20">
//           <motion.div
//             animate={{
//               backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
//             }}
//             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
//             className="absolute inset-0"
//             style={{
//               backgroundImage:
//                 "radial-gradient(circle at 20% 50%, rgba(245,197,24,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(253,224,71,0.12) 0%, transparent 50%)",
//               backgroundSize: "200% 200%",
//             }}
//           />
//         </div>

//         {/* Content */}
//         <div className="relative flex items-center gap-4 md:gap-6 lg:gap-8">
//           {/* Avatar Section */}
//           <div className="relative shrink-0">
//             {/* Animated Ring */}
//             <motion.div
//               animate={{ rotate: 360 }}
//               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//               className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 opacity-30 blur-md"
//             />

//             {/* Sparkles */}
//             <motion.div
//               animate={{
//                 scale: [1, 1.2, 1],
//                 opacity: [0.6, 1, 0.6],
//               }}
//               transition={{ duration: 2, repeat: Infinity }}
//               className="absolute -top-2 -right-2 z-10"
//             >
//               <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-amber-400" />
//             </motion.div>

//             <motion.div
//               animate={{
//                 scale: [1, 1.3, 1],
//                 opacity: [0.5, 1, 0.5],
//               }}
//               transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
//               className="absolute -bottom-2 -left-2 z-10"
//             >
//               <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-300" />
//             </motion.div>

//             {/* Avatar */}
//             <div className="relative">
//               {master.avatarUrl ? (
//                 <div className="relative h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 overflow-hidden rounded-full ring-4 ring-amber-500/50 transition-all group-hover:ring-amber-400">
//                   <Image
//                     src={master.avatarUrl}
//                     alt={master.name}
//                     width={128}
//                     height={128}
//                     className="h-full w-full object-cover"
//                   />
//                 </div>
//               ) : (
//                 <div className="flex h-20 w-20 md:h-24 md:w-24 lg:h-28 lg:w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 ring-4 ring-amber-500/50 transition-all group-hover:ring-amber-400">
//                   <User className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-black" />
//                 </div>
//               )}
//             </div>

//             {/* VIP Badge */}
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
//               className="absolute -bottom-1 -right-1 z-10"
//             >
//               <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50">
//                 <Crown className="h-3.5 w-3.5 md:h-4 md:w-4 text-black" />
//               </div>
//             </motion.div>
//           </div>

//           {/* Info Section */}
//           <div className="min-w-0 flex-1">
//             {/* Premium Badge */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.1 + 0.2 }}
//               className="mb-2 md:mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1"
//             >
//               <Sparkles className="h-3 w-3 text-amber-400" />
//               <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
//                 VIP Master
//               </span>
//             </motion.div>

//             {/* Name with Glow Effect - ИСПРАВЛЕНО для мобильных */}
//             <motion.h3
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 + 0.3 }}
//               className="mb-1.5 md:mb-2 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-xl font-extrabold text-transparent md:text-2xl lg:text-3xl xl:text-4xl break-words"
//               style={{
//                 textShadow:
//                   "0 0 30px rgba(245,197,24,0.5), 0 0 60px rgba(253,224,71,0.3)",
//                 wordBreak: "break-word",
//                 overflowWrap: "break-word",
//               }}
//             >
//               {master.name}
//             </motion.h3>

//             {/* Description/Specialty - БЕРЁМ ИЗ ДАННЫХ */}
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: index * 0.1 + 0.4 }}
//               className="text-sm text-white/70 md:text-base lg:text-lg break-words"
//               style={{
//                 wordBreak: "break-word",
//                 overflowWrap: "break-word",
//               }}
//             >
//               {master.specialty || master.description || "Мастер салона красоты"}
//             </motion.p>

//             {/* Rating Stars - БЕРЁМ ИЗ ДАННЫХ */}
//             {(master.rating || master.reviewCount) && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: index * 0.1 + 0.5 }}
//                 className="mt-2 md:mt-3 flex flex-wrap items-center gap-1"
//               >
//                 {master.rating && (
//                   <>
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`h-3.5 w-3.5 md:h-4 md:w-4 ${
//                           i < Math.floor(master.rating!)
//                             ? "fill-amber-400 text-amber-400"
//                             : "fill-gray-600 text-gray-600"
//                         }`}
//                       />
//                     ))}
//                     <span className="ml-2 text-xs md:text-sm text-white/60">
//                       {master.rating.toFixed(1)}
//                       {master.reviewCount && ` (${master.reviewCount} отзывов)`}
//                     </span>
//                   </>
//                 )}
//                 {!master.rating && master.reviewCount && (
//                   <span className="text-xs md:text-sm text-white/60">
//                     {master.reviewCount} отзывов
//                   </span>
//                 )}
//               </motion.div>
//             )}
//           </div>

//           {/* Arrow Icon */}
//           <motion.div
//             animate={{
//               x: isHovered ? 8 : 0,
//             }}
//             transition={{ type: "spring", stiffness: 300 }}
//             className="flex-shrink-0"
//           >
//             <div className="flex h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50 transition-all group-hover:shadow-xl group-hover:shadow-amber-500/60">
//               <ChevronRight className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-black" />
//             </div>
//           </motion.div>
//         </div>

//         {/* Bottom Shine Effect */}
//         <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
//       </div>
//     </motion.div>
//   );
// }

// /* ===================== Main Page Component ===================== */
// function MasterInner(): React.JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = useMemo<string[]>(
//     () => params.getAll("s").filter(Boolean),
//     [params],
//   );

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       setError(null);

//       try {
//         const qs = new URLSearchParams();
//         qs.set("serviceIds", serviceIds.join(","));
//         const res = await fetch(`/api/masters?${qs.toString()}`, {
//           cache: "no-store",
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = (await res.json()) as { masters: Master[] };
//         if (!cancelled) setMasters(data.masters ?? []);
//       } catch (e) {
//         const msg =
//           e instanceof Error ? e.message : "Не удалось загрузить мастеров";
//         if (!cancelled) setError(msg);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void loadMasters();
//     return () => {
//       cancelled = true;
//     };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append("s", id));
//     qs.set("m", masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   /* ---------- No Services ---------- */
//   if (serviceIds.length === 0) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="max-w-md text-center"
//             >
//               <div className="mb-6 text-5xl md:text-6xl">⚠️</div>
//               <h2 className="mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
//                 Услуги не выбраны
//               </h2>
//               <p className="mb-8 text-white/80">
//                 Пожалуйста, сначала выберите услуги.
//               </p>
//               <button
//                 onClick={() => router.push("/booking/services")}
//                 className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(245,197,24,0.7)]"
//               >
//                 Выбрать услуги
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   /* ---------- Loading ---------- */
//   if (loading) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center"
//             >
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
//                 className="mx-auto mb-6 h-20 w-20 rounded-full border-4 border-amber-500/30 border-t-amber-500"
//               />
//               <p className="text-lg font-medium text-white/80">
//                 Загрузка мастеров…
//               </p>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   /* ---------- Error ---------- */
//   if (error) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="max-w-md text-center"
//             >
//               <div className="mb-6 text-6xl">❌</div>
//               <h2 className="mb-4 text-3xl font-bold text-red-400">Ошибка</h2>
//               <p className="mb-8 text-white/80">{error}</p>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.5)] transition-all hover:scale-105"
//               >
//                 Попробовать снова
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   /* ---------- No Masters ---------- */
//   if (masters.length === 0) {
//     return (
//       <PageShell>
//         <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="max-w-xl text-center"
//             >
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 200 }}
//                 className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-6 py-3"
//               >
//                 <Sparkles className="h-5 w-5 text-amber-400" />
//                 <span className="font-semibold text-amber-300">
//                   Нет подходящего мастера
//                 </span>
//               </motion.div>

//               <h2 className="mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text font-serif text-4xl italic text-transparent md:text-5xl">
//                 Выбранные услуги выполняют разные мастера
//               </h2>

//               <p className="brand-script brand-subtitle mx-auto mb-8 max-w-lg text-lg md:text-xl">
//                 Выберите набор услуг одного специалиста или вернитесь к выбору
//               </p>

//               <button
//                 onClick={() => router.push("/booking/services")}
//                 className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.5)] transition-all hover:scale-105"
//               >
//                 <ArrowLeft className="h-5 w-5" />
//                 Вернуться к услугам
//               </button>
//             </motion.div>
//           </div>
//         </main>

//         <VideoSection />
//       </PageShell>
//     );
//   }

//   /* ---------- Masters List ---------- */
//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//         {/* Hero Section */}
//         <div className="flex w-full flex-col items-center text-center pt-8 md:pt-12">
//           {/* Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-6 md:mb-8"
//           >
//             <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 opacity-50 blur-xl" />
//             <div className="relative flex items-center gap-3 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-8 py-3 shadow-[0_10px_40px_rgba(245,197,24,0.5)]">
//               <Crown className="h-5 w-5 text-black md:h-6 md:w-6" />
//               <span className="font-serif text-base font-bold italic text-black md:text-lg">
//                 Шаг 2 — Выбор Премиум Мастера
//               </span>
//               <Crown className="h-5 w-5 text-black md:h-6 md:w-6" />
//             </div>
//           </motion.div>

//           {/* Title */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="mb-4 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text font-serif text-5xl italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(245,197,24,0.5)] md:mb-5 md:text-6xl lg:text-7xl"
//           >
//             Выбор мастера
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script brand-subtitle mx-auto max-w-2xl text-lg md:text-xl"
//           >
//             Наши эксперты создадут для вас идеальный образ
//           </motion.p>
//         </div>

//         {/* Masters Grid */}
//         <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:gap-8 lg:gap-10">
//           <AnimatePresence mode="popLayout">
//             {masters.map((m, i) => (
//               <MasterCard
//                 key={m.id}
//                 master={m}
//                 index={i}
//                 onSelect={selectMaster}
//               />
//             ))}
//           </AnimatePresence>
//         </div>

//         {/* Back Button */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.4 }}
//           className="mt-12 mb-8 text-center md:mt-16"
//         >
//           <button
//             onClick={() => router.push("/booking/services")}
//             className="inline-flex items-center gap-2 font-medium text-white/70 transition-colors hover:text-amber-400"
//           >
//             <ArrowLeft className="h-5 w-5" />
//             Вернуться к выбору услуг
//           </button>
//         </motion.div>
//       </main>

//       <VideoSection />

//       <style jsx global>{`
//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
//           -webkit-background-clip: text;
//           background-clip: text;
//           color: transparent;
//           text-shadow:
//             0 0 10px rgba(139, 92, 246, 0.4),
//             0 0 20px rgba(59, 130, 246, 0.3),
//             0 0 30px rgba(6, 182, 212, 0.25);
//         }
//         .brand-script {
//           font-family: var(
//             --brand-script,
//             "Cormorant Infant",
//             "Playfair Display",
//             serif
//           );
//           font-style: italic;
//           font-weight: 600;
//           letter-spacing: 0.02em;
//         }
//       `}</style>
//     </PageShell>
//   );
// }

// /* ===================== Export ===================== */
// export default function MasterPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex min-h-screen items-center justify-center bg-black">
//           <div className="h-20 w-20 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-500" />
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }


//------------новый дизайн но нужно даработать--------
// "use client";

// import React, { useState, useEffect, useMemo, Suspense } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import { User, ChevronRight, ArrowLeft, Sparkles, Star, Crown } from "lucide-react";

// interface Master {
//   id: string;
//   name: string;
//   avatarUrl?: string | null;
// }

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// /* ===================== Floating Particles Background ===================== */
// function FloatingParticles() {
//   return (
//     <div className="pointer-events-none absolute inset-0 overflow-hidden">
//       {[...Array(20)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute h-1 w-1 rounded-full bg-amber-400/30"
//           initial={{
//             x: Math.random() * window.innerWidth,
//             y: Math.random() * window.innerHeight,
//           }}
//           animate={{
//             x: Math.random() * window.innerWidth,
//             y: Math.random() * window.innerHeight,
//             scale: [1, 1.5, 1],
//             opacity: [0.3, 0.8, 0.3],
//           }}
//           transition={{
//             duration: Math.random() * 10 + 10,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// /* ===================== Page Shell ===================== */
// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black text-white">
//       <BookingAnimatedBackground />
//       <FloatingParticles />

//       <div className="relative z-10 min-h-screen">
//         <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//           <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//             <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//           </div>
//         </header>

//         <div className="h-[84px] md:h-[96px]" />

//         {children}
//       </div>
//     </div>
//   );
// }

// /* ===================== Video Section ===================== */
// function VideoSection() {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%] bg-black"
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

//         <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
//       </div>
//     </section>
//   );
// }

// /* ===================== Master Card - PREMIUM REDESIGN ===================== */
// function MasterCard({
//   master,
//   onSelect,
//   index,
// }: {
//   master: Master;
//   onSelect: (id: string) => void;
//   index: number;
// }) {
//   const [isHovered, setIsHovered] = useState(false);

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, scale: 0.95, y: 30 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.92 }}
//       transition={{
//         delay: index * 0.1,
//         type: "spring",
//         stiffness: 280,
//         damping: 25,
//       }}
//       whileHover={{ y: -8, scale: 1.02 }}
//       onHoverStart={() => setIsHovered(true)}
//       onHoverEnd={() => setIsHovered(false)}
//       onClick={() => onSelect(master.id)}
//       className="group relative mx-auto w-full max-w-[900px] cursor-pointer xl:max-w-[1020px]"
//     >
//       {/* Outer Glow */}
//       <div
//         className={`absolute -inset-6 rounded-[32px] bg-gradient-to-r from-amber-500/40 via-yellow-400/40 to-amber-500/40 opacity-0 blur-2xl transition-opacity duration-700 ${
//           isHovered ? "opacity-100" : ""
//         }`}
//       />

//       {/* Main Card */}
//       <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black/40 via-slate-950/60 to-black/40 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-500 group-hover:border-amber-500/60 group-hover:shadow-[0_0_60px_rgba(245,197,24,0.4)] md:p-10">
//         {/* Animated Background Pattern */}
//         <div className="pointer-events-none absolute inset-0 opacity-20">
//           <motion.div
//             animate={{
//               backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
//             }}
//             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
//             className="absolute inset-0"
//             style={{
//               backgroundImage:
//                 "radial-gradient(circle at 20% 50%, rgba(245,197,24,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(253,224,71,0.12) 0%, transparent 50%)",
//               backgroundSize: "200% 200%",
//             }}
//           />
//         </div>

//         {/* Content */}
//         <div className="relative flex items-center gap-6 md:gap-8">
//           {/* Avatar Section */}
//           <div className="relative shrink-0">
//             {/* Animated Ring */}
//             <motion.div
//               animate={{ rotate: 360 }}
//               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//               className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 opacity-30 blur-md"
//             />

//             {/* Sparkles */}
//             <motion.div
//               animate={{
//                 scale: [1, 1.2, 1],
//                 opacity: [0.6, 1, 0.6],
//               }}
//               transition={{ duration: 2, repeat: Infinity }}
//               className="absolute -top-2 -right-2 z-10"
//             >
//               <Sparkles className="h-6 w-6 text-amber-400" />
//             </motion.div>

//             <motion.div
//               animate={{
//                 scale: [1, 1.3, 1],
//                 opacity: [0.5, 1, 0.5],
//               }}
//               transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
//               className="absolute -bottom-2 -left-2 z-10"
//             >
//               <Star className="h-5 w-5 text-yellow-300" />
//             </motion.div>

//             {/* Avatar */}
//             <div className="relative">
//               {master.avatarUrl ? (
//                 <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-amber-500/50 transition-all group-hover:ring-amber-400 md:h-28 md:w-28">
//                   <Image
//                     src={master.avatarUrl}
//                     alt={master.name}
//                     width={128}
//                     height={128}
//                     className="h-full w-full object-cover"
//                   />
//                 </div>
//               ) : (
//                 <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 ring-4 ring-amber-500/50 transition-all group-hover:ring-amber-400 md:h-28 md:w-28">
//                   <User className="h-12 w-12 text-black md:h-14 md:w-14" />
//                 </div>
//               )}
//             </div>

//             {/* VIP Badge */}
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
//               className="absolute -bottom-1 -right-1 z-10"
//             >
//               <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50">
//                 <Crown className="h-4 w-4 text-black" />
//               </div>
//             </motion.div>
//           </div>

//           {/* Info Section */}
//           <div className="min-w-0 flex-1">
//             {/* Premium Badge */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.1 + 0.2 }}
//               className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1"
//             >
//               <Sparkles className="h-3 w-3 text-amber-400" />
//               <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
//                 VIP Master
//               </span>
//             </motion.div>

//             {/* Name with Glow Effect */}
//             <motion.h3
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 + 0.3 }}
//               className="mb-2 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl"
//               style={{
//                 textShadow:
//                   "0 0 30px rgba(245,197,24,0.5), 0 0 60px rgba(253,224,71,0.3)",
//               }}
//             >
//               {master.name}
//             </motion.h3>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: index * 0.1 + 0.4 }}
//               className="text-base text-white/70 md:text-lg"
//             >
//               Эксперт по эстетике бровей и ресниц
//             </motion.p>

//             {/* Rating Stars */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: index * 0.1 + 0.5 }}
//               className="mt-3 flex items-center gap-1"
//             >
//               {[...Array(5)].map((_, i) => (
//                 <Star
//                   key={i}
//                   className="h-4 w-4 fill-amber-400 text-amber-400"
//                 />
//               ))}
//               <span className="ml-2 text-sm text-white/60">5.0 (127 отзывов)</span>
//             </motion.div>
//           </div>

//           {/* Arrow Icon */}
//           <motion.div
//             animate={{
//               x: isHovered ? 8 : 0,
//             }}
//             transition={{ type: "spring", stiffness: 300 }}
//             className="flex-shrink-0"
//           >
//             <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50 transition-all group-hover:shadow-xl group-hover:shadow-amber-500/60 md:h-16 md:w-16">
//               <ChevronRight className="h-7 w-7 text-black md:h-8 md:w-8" />
//             </div>
//           </motion.div>
//         </div>

//         {/* Bottom Shine Effect */}
//         <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
//       </div>
//     </motion.div>
//   );
// }

// /* ===================== Main Page Component ===================== */
// function MasterInner(): React.JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = useMemo<string[]>(
//     () => params.getAll("s").filter(Boolean),
//     [params],
//   );

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       setError(null);

//       try {
//         const qs = new URLSearchParams();
//         qs.set("serviceIds", serviceIds.join(","));
//         const res = await fetch(`/api/masters?${qs.toString()}`, {
//           cache: "no-store",
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = (await res.json()) as { masters: Master[] };
//         if (!cancelled) setMasters(data.masters ?? []);
//       } catch (e) {
//         const msg =
//           e instanceof Error ? e.message : "Не удалось загрузить мастеров";
//         if (!cancelled) setError(msg);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void loadMasters();
//     return () => {
//       cancelled = true;
//     };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append("s", id));
//     qs.set("m", masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   /* ---------- No Services ---------- */
//   if (serviceIds.length === 0) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="max-w-md text-center"
//             >
//               <div className="mb-6 text-5xl md:text-6xl">⚠️</div>
//               <h2 className="mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
//                 Услуги не выбраны
//               </h2>
//               <p className="mb-8 text-white/80">
//                 Пожалуйста, сначала выберите услуги.
//               </p>
//               <button
//                 onClick={() => router.push("/booking/services")}
//                 className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(245,197,24,0.7)]"
//               >
//                 Выбрать услуги
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   /* ---------- Loading ---------- */
//   if (loading) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center"
//             >
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
//                 className="mx-auto mb-6 h-20 w-20 rounded-full border-4 border-amber-500/30 border-t-amber-500"
//               />
//               <p className="text-lg font-medium text-white/80">
//                 Загрузка мастеров…
//               </p>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   /* ---------- Error ---------- */
//   if (error) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="max-w-md text-center"
//             >
//               <div className="mb-6 text-6xl">❌</div>
//               <h2 className="mb-4 text-3xl font-bold text-red-400">Ошибка</h2>
//               <p className="mb-8 text-white/80">{error}</p>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.5)] transition-all hover:scale-105"
//               >
//                 Попробовать снова
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   /* ---------- No Masters ---------- */
//   if (masters.length === 0) {
//     return (
//       <PageShell>
//         <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="max-w-xl text-center"
//             >
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: "spring", stiffness: 200 }}
//                 className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-6 py-3"
//               >
//                 <Sparkles className="h-5 w-5 text-amber-400" />
//                 <span className="font-semibold text-amber-300">
//                   Нет подходящего мастера
//                 </span>
//               </motion.div>

//               <h2 className="mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text font-serif text-4xl italic text-transparent md:text-5xl">
//                 Выбранные услуги выполняют разные мастера
//               </h2>

//               <p className="brand-script brand-subtitle mx-auto mb-8 max-w-lg text-lg md:text-xl">
//                 Выберите набор услуг одного специалиста или вернитесь к выбору
//               </p>

//               <button
//                 onClick={() => router.push("/booking/services")}
//                 className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.5)] transition-all hover:scale-105"
//               >
//                 <ArrowLeft className="h-5 w-5" />
//                 Вернуться к услугам
//               </button>
//             </motion.div>
//           </div>
//         </main>

//         <VideoSection />
//       </PageShell>
//     );
//   }

//   /* ---------- Masters List ---------- */
//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//         {/* Hero Section */}
//         <div className="flex w-full flex-col items-center text-center pt-8 md:pt-12">
//           {/* Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-6 md:mb-8"
//           >
//             <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 opacity-50 blur-xl" />
//             <div className="relative flex items-center gap-3 rounded-full border border-amber-400/50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-8 py-3 shadow-[0_10px_40px_rgba(245,197,24,0.5)]">
//               <Crown className="h-5 w-5 text-black md:h-6 md:w-6" />
//               <span className="font-serif text-base font-bold italic text-black md:text-lg">
//                 Шаг 2 — Выбор Премиум Мастера
//               </span>
//               <Crown className="h-5 w-5 text-black md:h-6 md:w-6" />
//             </div>
//           </motion.div>

//           {/* Title */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="mb-4 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text font-serif text-5xl italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(245,197,24,0.5)] md:mb-5 md:text-6xl lg:text-7xl"
//           >
//             Выбор мастера
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script brand-subtitle mx-auto max-w-2xl text-lg md:text-xl"
//           >
//             Наши эксперты создадут для вас идеальный образ
//           </motion.p>
//         </div>

//         {/* Masters Grid */}
//         <div className="mt-12 grid grid-cols-1 gap-8 md:mt-16 md:gap-10">
//           <AnimatePresence mode="popLayout">
//             {masters.map((m, i) => (
//               <MasterCard
//                 key={m.id}
//                 master={m}
//                 index={i}
//                 onSelect={selectMaster}
//               />
//             ))}
//           </AnimatePresence>
//         </div>

//         {/* Back Button */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.4 }}
//           className="mt-12 mb-8 text-center md:mt-16"
//         >
//           <button
//             onClick={() => router.push("/booking/services")}
//             className="inline-flex items-center gap-2 font-medium text-white/70 transition-colors hover:text-amber-400"
//           >
//             <ArrowLeft className="h-5 w-5" />
//             Вернуться к выбору услуг
//           </button>
//         </motion.div>
//       </main>

//       <VideoSection />

//       <style jsx global>{`
//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
//           -webkit-background-clip: text;
//           background-clip: text;
//           color: transparent;
//           text-shadow:
//             0 0 10px rgba(139, 92, 246, 0.4),
//             0 0 20px rgba(59, 130, 246, 0.3),
//             0 0 30px rgba(6, 182, 212, 0.25);
//         }
//         .brand-script {
//           font-family: var(
//             --brand-script,
//             "Cormorant Infant",
//             "Playfair Display",
//             serif
//           );
//           font-style: italic;
//           font-weight: 600;
//           letter-spacing: 0.02em;
//         }
//       `}</style>
//     </PageShell>
//   );
// }

// /* ===================== Export ===================== */
// export default function MasterPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex min-h-screen items-center justify-center bg-black">
//           <div className="h-20 w-20 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-500" />
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }



//--------рабочий код с новым задним фоном, но хочу улучшить дизайн----
// "use client";

// import React, { useState, useEffect, useMemo, Suspense } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import { User, ChevronRight, ArrowLeft } from "lucide-react";

// interface Master {
//   id: string;
//   name: string;
//   avatarUrl?: string | null;
// }

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// /* ===================== Общий shell как в client/form ===================== */

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black text-white">
//       {/* общий анимированный фон */}
//       <BookingAnimatedBackground />

//       {/* всё содержимое поверх фона */}
//       <div className="relative z-10 min-h-screen">
//         {/* Хедер с прогресс-баром и степпером */}
//         <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//           <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//             <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
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
//       <div
//         className="
//           relative mx-auto w-full max-w-screen-2xl
//           aspect-[16/9]
//           rounded-2xl overflow-hidden
//           border border-white/10
//           shadow-[0_0_80px_rgba(255,215,0,.12)]
//           bg-black
//         "
//       >
//         <video
//           className="
//             h-full w-full
//             object-contain 2xl:object-cover
//             object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]
//             bg-black
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

//         {/* лёгкое обрамление сверху — не закрывает видео */}
//         <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
//       </div>
//     </section>
//   );
// }

// /* ===================== Карточка мастера ===================== */

// function MasterCard({
//   master,
//   onSelect,
//   index,
// }: {
//   master: Master;
//   onSelect: (id: string) => void;
//   index: number;
// }) {
//   const [ripple, setRipple] = useState<{
//     x: number;
//     y: number;
//     id: number;
//   } | null>(null);

//   const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
//     if (e.pointerType === "mouse" && e.button !== 0) return;
//     const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//     setRipple({
//       x: e.clientX - rect.left,
//       y: e.clientY - rect.top,
//       id: Date.now(),
//     });
//   };

//   return (
//     <motion.button
//       type="button"
//       layout
//       initial={{ opacity: 0, scale: 0.98, y: 18 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.96 }}
//       transition={{
//         delay: index * 0.06,
//         type: "spring",
//         stiffness: 260,
//         damping: 26,
//       }}
//       onClick={() => onSelect(master.id)}
//       onPointerDown={handlePointerDown}
//       className={`
//         group relative mx-auto w-full max-w-[900px] xl:max-w-[1020px]
//         cursor-pointer overflow-hidden rounded-3xl border border-white/15
//         bg-black/30 p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.75)]
//         backdrop-blur-sm transition-all duration-300
//         hover:border-amber-500/50 hover:bg-black/40
//         hover:shadow-[0_0_48px_rgba(245,197,24,0.25)]
//         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
//         md:p-8
//       `}
//     >
//       {/* свечение карточки */}
//       <div
//         className="pointer-events-none absolute -inset-4 rounded-[28px] opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100"
//         style={{
//           background:
//             "linear-gradient(135deg, rgba(245,197,24,.35), rgba(253,224,71,.35))",
//         }}
//       />

//       {/* ripple */}
//       <AnimatePresence>
//         {ripple && (
//           <motion.span
//             key={ripple.id}
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{ opacity: 0.12, scale: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.65 }}
//             className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.45)_0%,rgba(253,224,71,0.22)_45%,rgba(253,224,71,0)_70%)]"
//             style={{
//               width: 420,
//               height: 420,
//               left: ripple.x - 210,
//               top: ripple.y - 210,
//               filter:
//                 "drop-shadow(0 0 12px rgba(253,224,71,.35)) drop-shadow(0 0 26px rgba(245,197,24,.25))",
//             }}
//             onAnimationComplete={() => setRipple(null)}
//           />
//         )}
//       </AnimatePresence>

//       <div className="relative flex items-center gap-5 md:gap-6">
//         {/* аватар + ореол */}
//         <div className="relative shrink-0">
//           <span
//             className={`
//               absolute -inset-2 rounded-full
//               bg-[radial-gradient(circle,rgba(253,224,71,.45)_0%,rgba(253,224,71,.12)_50%,rgba(253,224,71,0)_72%)]
//               opacity-70 blur-md transition-all
//               group-hover:opacity-100 group-hover:blur-lg
//             `}
//           />
//           <span className="sparkle absolute -top-1 right-0 h-3 w-3 rounded-full bg-amber-300/90" />
//           <span className="sparkle-delay absolute -bottom-1 left-0 h-2.5 w-2.5 rounded-full bg-yellow-200/90" />

//           {master.avatarUrl ? (
//             <span className="relative block h-16 w-16 overflow-hidden rounded-full ring-2 ring-white/15 transition-all group-hover:ring-amber-400/60 md:h-20 md:w-20">
//               <Image
//                 src={master.avatarUrl}
//                 alt={master.name}
//                 width={96}
//                 height={96}
//                 sizes="(max-width:768px) 64px, 96px"
//                 className="h-full w-full object-cover"
//               />
//             </span>
//           ) : (
//             <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 ring-2 ring-white/10 transition-all group-hover:ring-amber-400/60 md:h-20 md:w-20">
//               <User className="h-8 w-8 text-black md:h-10 md:w-10" />
//             </div>
//           )}
//         </div>

//         {/* имя — неон золото */}
//         <div className="min-w-0 flex-1">
//           <h3 className="relative mb-1 inline-block">
//             <span className="stardust pointer-events-none absolute -top-3 -left-4" />
//             <span
//               className={`
//                 neon-gold bg-gradient-to-r from-[#FFE08A] via-[#FFF4C2] to-[#FFE08A]
//                 bg-clip-text text-xl font-extrabold text-transparent
//                 transition-all group-hover:neon-gold-boost group-active:neon-gold-boost
//                 md:text-2xl
//               `}
//             >
//               {master.name}
//             </span>
//           </h3>
//           <p className="text-xs text-white/75 md:text-sm">
//             Нажмите, чтобы выбрать
//           </p>
//         </div>

//         <ChevronRight className="h-6 w-6 flex-shrink-0 text-white/50 transition-all group-hover:translate-x-2 group-hover:text-amber-400 md:h-8 md:w-8" />
//       </div>
//     </motion.button>
//   );
// }

// /* ===================== Основная страница ===================== */

// function MasterInner(): React.JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = useMemo<string[]>(
//     () => params.getAll("s").filter(Boolean),
//     [params],
//   );

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       setError(null);

//       try {
//         const qs = new URLSearchParams();
//         qs.set("serviceIds", serviceIds.join(","));
//         const res = await fetch(`/api/masters?${qs.toString()}`, {
//           cache: "no-store",
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = (await res.json()) as { masters: Master[] };
//         if (!cancelled) setMasters(data.masters ?? []);
//       } catch (e) {
//         const msg =
//           e instanceof Error ? e.message : "Не удалось загрузить мастеров";
//         if (!cancelled) setError(msg);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void loadMasters();
//     return () => {
//       cancelled = true;
//     };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append("s", id));
//     qs.set("m", masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   /* ---------- кейс: нет услуг ---------- */
//   if (serviceIds.length === 0) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="max-w-md text-center"
//             >
//               <div className="mb-6 text-5xl md:text-6xl">⚠️</div>
//               <h2 className="mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
//                 Услуги не выбраны
//               </h2>
//               <p className="mb-8 text-white/80">
//                 Пожалуйста, сначала выберите услуги.
//               </p>
//               <button
//                 onClick={() => router.push("/booking/services")}
//                 className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] md:px-8 md:py-4"
//               >
//                 Выбрать услуги
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   /* ---------- загрузка ---------- */
//   if (loading) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="w-full max-w-5xl"
//             >
//               <div className="mb-8 flex items-center justify-center">
//                 <motion.div
//                   initial={{ rotate: 0 }}
//                   animate={{ rotate: 360 }}
//                   transition={{
//                     repeat: Infinity,
//                     duration: 1.2,
//                     ease: "linear",
//                   }}
//                   className="h-12 w-12 rounded-full border-4 border-yellow-500/30 border-t-yellow-500 md:h-16 md:w-16"
//                 />
//               </div>
//               <p className="mt-6 text-center font-medium text-white/80">
//                 Загрузка мастеров…
//               </p>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   /* ---------- ошибка ---------- */
//   if (error) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="max-w-md text-center"
//             >
//               <div className="mb-6 text-6xl">❌</div>
//               <h2 className="mb-3 text-2xl font-bold text-red-400 md:text-3xl">
//                 Ошибка
//               </h2>
//               <p className="mb-8 text-white/80">{error}</p>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] transition-all duration-300 hover:scale-105 md:px-8 md:py-4"
//               >
//                 Попробовать снова
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   /* ---------- нет мастера под набор услуг ---------- */
//   if (!loading && masters.length === 0) {
//     return (
//       <PageShell>
//         <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="flex min-h-[60vh] items-center justify-center pt-10 md:pt-12 lg:pt-14">
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="max-w-xl text-center"
//             >
//               <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80">
//                 <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
//                 <span>Нет подходящего мастера</span>
//               </div>

//               <h2 className="mb-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text font-serif text-3xl italic text-transparent md:text-4xl">
//                 Выбранные услуги выполняют разные мастера
//               </h2>

//               <p className="brand-script brand-subtitle mx-auto mb-8 max-w-lg text-base md:text-lg">
//                 Похоже, вы выбрали услуги из разных категорий. Выберите набор
//                 услуг, который может выполнить один специалист, или вернитесь к
//                 выбору услуг.
//               </p>

//               <button
//                 onClick={() => router.push("/booking/services")}
//                 className="cta-glow group inline-flex items-center gap-2 rounded-2xl px-7 py-4 font-semibold"
//               >
//                 <ArrowLeft className="h-5 w-5" />
//                 Вернуться к выбору услуг
//               </button>
//             </motion.div>
//           </div>
//         </main>

//         <VideoSection />

//         <style jsx global>{`
//           .cta-glow {
//             background: linear-gradient(
//               90deg,
//               #8b5cf6 0%,
//               #3b82f6 50%,
//               #06b6d4 100%
//             );
//             color: white;
//             box-shadow:
//               0 8px 30px rgba(59, 130, 246, 0.35),
//               0 0 24px rgba(6, 182, 212, 0.25);
//             transition:
//               transform 0.2s ease,
//               box-shadow 0.2s ease,
//               filter 0.2s ease;
//           }
//           .cta-glow:hover {
//             transform: translateY(-1px) scale(1.02);
//             box-shadow:
//               0 10px 36px rgba(59, 130, 246, 0.45),
//               0 0 34px rgba(6, 182, 212, 0.35);
//             filter: saturate(1.1);
//           }
//           .cta-glow:active {
//             transform: translateY(0) scale(0.99);
//           }
//         `}</style>
//       </PageShell>
//     );
//   }

//   /* ---------- Нормальный список мастеров ---------- */
//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//         {/* Центр: улучшенный бейдж «Шаг 2 — Выбор мастера» */}
//         <div className="flex w-full flex-col items-center text-center">
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 320, damping: 24 }}
//             className="relative mt-5 mb-6 inline-block md:mt-6 md:mb-7"
//           >
//             {/* мягкое внешнее свечение */}
//             <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-amber-500/35 via-yellow-400/35 to-amber-500/35 blur-xl opacity-70" />

//             {/* сам бейдж — ИСПРАВЛЕНО: className одной строкой */}
//             <div className="relative flex items-center gap-2 rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-500/90 via-yellow-400/95 to-amber-500/90 px-7 py-2.5 text-black shadow-[0_10px_40px_rgba(245,197,24,0.45)] backdrop-blur-sm md:px-9 md:py-3">
//               <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/15 bg-black/15">
//                 <User className="h-4 w-4 text-black/80" />
//               </span>
//               <span className="font-serif text-sm italic tracking-wide md:text-base">
//                 Шаг 2 — Выбор мастера
//               </span>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className={`
//               mx-auto mb-3 text-center text-4xl font-serif italic leading-tight
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//               drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//               md:mb-4 md:text-5xl
//               lg:text-5xl xl:text-6xl 2xl:text-7xl
//             `}
//           >
//             Выбор мастера
//           </motion.h1>

//           {/* Подзаголовок (брендовый шрифт и подсветка) */}
//           <motion.p
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="
//               brand-script brand-subtitle
//               mx-auto max-w-2xl text-lg
//               tracking-wide
//               md:text-xl
//             "
//           >
//             Выберите мастера для ваших услуг
//           </motion.p>
//         </div>

//         {/* Список мастеров */}
//         <div className="mt-8 grid grid-cols-1 gap-6 md:mt-10 md:gap-8">
//           <AnimatePresence mode="popLayout">
//             {masters.map((m, i) => (
//               <MasterCard key={m.id} master={m} index={i} onSelect={selectMaster} />
//             ))}
//           </AnimatePresence>
//         </div>

//         {/* Кнопка "Назад" */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className={`
//             fixed inset-x-0 bottom-2 z-20 px-4
//             sm:bottom-3 sm:px-6
//             lg:static lg:inset-auto lg:bottom-auto lg:z-auto lg:px-0
//             mt-6 md:mt-10
//           `}
//           style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//         >
//           <div className="mx-auto w-full max-w-screen-2xl">
//             <button
//               type="button"
//               onClick={() => router.push("/booking/services")}
//               className="inline-flex items-center gap-2 font-medium text-white/85 transition-colors hover:text-amber-400"
//             >
//               <ArrowLeft className="h-5 w-5" />
//               Вернуться к выбору услуг
//             </button>
//           </div>
//         </motion.div>
//       </main>

//       <VideoSection />

//       {/* глобальные эффекты (как были) */}
//       <style jsx global>{`
//         .neon-gold {
//           filter:
//             drop-shadow(0 0 2px rgba(255, 215, 0, 0.55))
//             drop-shadow(0 0 6px rgba(255, 215, 0, 0.45))
//             drop-shadow(0 0 12px rgba(253, 224, 71, 0.35));
//           animation: neon-flicker 2.8s ease-in-out infinite;
//         }
//         .neon-gold-boost {
//           filter:
//             drop-shadow(0 0 3px rgba(255, 215, 0, 0.7))
//             drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))
//             drop-shadow(0 0 20px rgba(253, 224, 71, 0.55))
//             drop-shadow(0 0 34px rgba(245, 197, 24, 0.35));
//         }
//         @keyframes neon-flicker {
//           0%,
//           100% {
//             filter:
//               drop-shadow(0 0 2px rgba(255, 215, 0, 0.55))
//               drop-shadow(0 0 6px rgba(255, 215, 0, 0.45))
//               drop-shadow(0 0 12px rgba(253, 224, 71, 0.35));
//           }
//           48% {
//             filter:
//               drop-shadow(0 0 3px rgba(255, 215, 0, 0.65))
//               drop-shadow(0 0 9px rgba(255, 215, 0, 0.55))
//               drop-shadow(0 0 18px rgba(253, 224, 71, 0.45));
//           }
//           50% {
//             filter:
//               drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))
//               drop-shadow(0 0 14px rgba(255, 215, 0, 0.7))
//               drop-shadow(0 0 26px rgba(253, 224, 71, 0.6));
//           }
//         }

//         .sparkle,
//         .sparkle-delay {
//           box-shadow:
//             0 0 6px rgba(253, 224, 71, 0.75),
//             0 0 12px rgba(245, 197, 24, 0.55);
//           animation: sparkle-pop 1.8s ease-in-out infinite;
//         }
//         .sparkle-delay {
//           animation-delay: 0.7s;
//         }
//         @keyframes sparkle-pop {
//           0%,
//           100% {
//             transform: scale(0.6);
//             opacity: 0.8;
//           }
//           50% {
//             transform: scale(1.15);
//             opacity: 1;
//           }
//         }

//         .stardust {
//           width: 72px;
//           height: 28px;
//           background:
//             radial-gradient(
//               2px 2px at 12% 40%,
//               rgba(253, 224, 71, 0.9) 0,
//               rgba(253, 224, 71, 0) 65%
//             ),
//             radial-gradient(
//               1.6px 1.6px at 48% 62%,
//               rgba(255, 241, 175, 0.95) 0,
//               rgba(255, 241, 175, 0) 65%
//             ),
//             radial-gradient(
//               1.8px 1.8px at 78% 38%,
//               rgba(255, 230, 120, 0.9) 0,
//               rgba(255, 230, 120, 0) 65%
//             );
//           filter: drop-shadow(0 0 6px rgba(253, 224, 71, 0.55));
//           animation: dust-float 3.6s ease-in-out infinite;
//           opacity: 0.85;
//         }

//         .brand-subtitle {
//           background: linear-gradient(
//             90deg,
//             #8b5cf6 0%,
//             #3b82f6 50%,
//             #06b6d4 100%
//           );
//           -webkit-background-clip: text;
//           background-clip: text;
//           color: transparent;
//           text-shadow:
//             0 0 10px rgba(139, 92, 246, 0.35),
//             0 0 18px rgba(59, 130, 246, 0.25),
//             0 0 28px rgba(6, 182, 212, 0.22);
//           filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.15));
//         }
//         .brand-subtitle:hover,
//         .brand-subtitle:active {
//           text-shadow:
//             0 0 12px rgba(139, 92, 246, 0.45),
//             0 0 22px rgba(59, 130, 246, 0.35),
//             0 0 32px rgba(6, 182, 212, 0.28);
//         }

//         .brand-script {
//           font-family: var(
//             --brand-script,
//             "YourBrandScript",
//             "Cormorant Infant",
//             "Playfair Display",
//             serif
//           );
//           font-style: italic;
//           font-weight: 600;
//           letter-spacing: 0.02em;
//           -webkit-font-smoothing: antialiased;
//           -moz-osx-font-smoothing: grayscale;
//         }
//       `}</style>
//     </PageShell>
//   );
// }

// /* ===================== Export ===================== */

// export default function MasterPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex min-h-screen items-center justify-center bg-black">
//           <div className="h-16 w-16 animate-spin rounded-full border-4 border-yellow-500/30 border-t-yellow-500" />
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }




//-----------рабочий файл меняем задний вид---------
// 'use client';

// import React, { useState, useEffect, useMemo, Suspense } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { User, ChevronRight, ArrowLeft } from 'lucide-react';

// interface Master {
//   id: string;
//   name: string;
//   avatarUrl?: string | null;
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// /* ------------------------------- Shell ------------------------------- */
// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen relative overflow-hidden bg-black">
//       <header
//         className={`
//           booking-header fixed top-0 inset-x-0 z-50
//           bg-black/45 backdrop-blur-md border-b border-white/10
//         `}
//       >
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//           <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       {/* отступ под фикс-хедер */}
//       <div className="h-[84px] md:h-[96px]" />

//       {children}
//     </div>
//   );
// }

// /* ---------------------------- Видео ниже ---------------------------- */
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

// /* ---------------------- Карточка мастера ---------------------- */
// function MasterCard({
//   master,
//   onSelect,
//   index,
// }: {
//   master: Master;
//   onSelect: (id: string) => void;
//   index: number;
// }) {
//   const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

//   const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
//     if (e.pointerType === 'mouse' && e.button !== 0) return;
//     const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//     setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
//   };

//   return (
//     <motion.button
//       type="button"
//       layout
//       initial={{ opacity: 0, scale: 0.98, y: 18 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.96 }}
//       transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
//       onClick={() => onSelect(master.id)}
//       onPointerDown={handlePointerDown}
//       className={`
//         group relative w-full max-w-[900px] xl:max-w-[1020px] mx-auto
//         cursor-pointer rounded-3xl border border-white/15
//         bg-black/30 backdrop-blur-sm
//         p-6 md:p-8 text-left
//         transition-all duration-300
//         hover:border-amber-500/50 hover:bg-black/40
//         hover:shadow-[0_0_48px_rgba(245,197,24,0.25)]
//         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
//         overflow-hidden
//       `}
//     >
//       {/* свечение карточки */}
//       <div
//         className="pointer-events-none absolute -inset-4 rounded-[28px] opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100"
//         style={{
//           background:
//             'linear-gradient(135deg, rgba(245,197,24,.35), rgba(253,224,71,.35))',
//         }}
//       />

//       {/* ripple */}
//       <AnimatePresence>
//         {ripple && (
//           <motion.span
//             key={ripple.id}
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{ opacity: 0.12, scale: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.65 }}
//             className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.45)_0%,rgba(253,224,71,0.22)_45%,rgba(253,224,71,0)_70%)]"
//             style={{
//               width: 420,
//               height: 420,
//               left: ripple.x - 210,
//               top: ripple.y - 210,
//               filter:
//                 'drop-shadow(0 0 12px rgba(253,224,71,.35)) drop-shadow(0 0 26px rgba(245,197,24,.25))',
//             }}
//             onAnimationComplete={() => setRipple(null)}
//           />
//         )}
//       </AnimatePresence>

//       <div className="relative flex items-center gap-5 md:gap-6">
//         {/* аватар + ореол */}
//         <div className="relative shrink-0">
//           <span
//             className={`
//               absolute -inset-2 rounded-full
//               bg-[radial-gradient(circle,rgba(253,224,71,.45)_0%,rgba(253,224,71,.12)_50%,rgba(253,224,71,0)_72%)]
//               opacity-70 blur-md transition-all
//               group-hover:opacity-100 group-hover:blur-lg
//             `}
//           />
//           <span className="sparkle absolute -top-1 right-0 w-3 h-3 rounded-full bg-amber-300/90" />
//           <span className="sparkle-delay absolute -bottom-1 left-0 w-2.5 h-2.5 rounded-full bg-yellow-200/90" />

//           {master.avatarUrl ? (
//             <span className="block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/15 group-hover:ring-amber-400/60 transition-all relative">
//               <Image
//                 src={master.avatarUrl}
//                 alt={master.name}
//                 width={96}
//                 height={96}
//                 sizes="(max-width:768px) 64px, 96px"
//                 className="h-full w-full object-cover"
//               />
//             </span>
//           ) : (
//             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//               <User className="w-8 h-8 md:w-10 md:h-10 text-black" />
//             </div>
//           )}
//         </div>

//         {/* имя — неон золото */}
//         <div className="flex-1 min-w-0">
//           <h3 className="mb-1 relative inline-block">
//             <span className="stardust pointer-events-none absolute -top-3 -left-4" />
//             <span
//               className={`
//                 neon-gold text-xl md:text-2xl font-extrabold
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#FFE08A] via-[#FFF4C2] to-[#FFE08A]
//                 transition-all group-hover:neon-gold-boost group-active:neon-gold-boost
//               `}
//             >
//               {master.name}
//             </span>
//           </h3>
//           <p className="text-white/75 text-xs md:text-sm">Нажмите, чтобы выбрать</p>
//         </div>

//         <ChevronRight className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-white/50 transition-all group-hover:text-amber-400 group-hover:translate-x-2" />
//       </div>
//     </motion.button>
//   );
// }

// /* --------------------------- Страница --------------------------- */
// function MasterInner(): React.JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       setError(null);

//       try {
//         const qs = new URLSearchParams();
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/masters?${qs.toString()}`, { cache: 'no-store' });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = (await res.json()) as { masters: Master[] };
//         if (!cancelled) setMasters(data.masters ?? []);
//       } catch (e) {
//         const msg = e instanceof Error ? e.message : 'Не удалось загрузить мастеров';
//         if (!cancelled) setError(msg);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void loadMasters();
//     return () => {
//       cancelled = true;
//     };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append('s', id));
//     qs.set('m', masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   if (serviceIds.length === 0) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
//             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
//               <div className="text-5xl md:text-6xl mb-6">⚠️</div>
//               <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
//                 Услуги не выбраны
//               </h2>
//               <p className="text-white/80 mb-8">Пожалуйста, сначала выберите услуги.</p>
//               <button
//                 onClick={() => router.push('/booking/services')}
//                 className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] hover:scale-105 transition-all duration-300"
//               >
//                 Выбрать услуги
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   if (loading) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
//             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
//               <div className="flex items-center justify-center mb-8">
//                 <motion.div
//                   initial={{ rotate: 0 }}
//                   animate={{ rotate: 360 }}
//                   transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
//                   className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//                 />
//               </div>
//               <p className="mt-6 text-center text-white/80 font-medium">Загрузка мастеров…</p>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   if (error) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
//             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
//               <div className="text-6xl mb-6">❌</div>
//               <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-3">Ошибка</h2>
//               <p className="text-white/80 mb-8">{error}</p>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//               >
//                 Попробовать снова
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   /* ---------- НОВЫЙ ПУСТОЙ КЕЙС: нет мастера под набор услуг ---------- */
//   if (!loading && masters.length === 0) {
//     return (
//       <PageShell>
//         <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-center max-w-xl"
//             >
//               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/80 mb-5">
//                 <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
//                 <span>Нет подходящего мастера</span>
//               </div>

//               <h2 className="text-3xl md:text-4xl font-serif italic bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-3">
//                 Выбранные услуги выполняют разные мастера
//               </h2>

//               <p className="brand-script brand-subtitle mx-auto max-w-lg text-base md:text-lg mb-8">
//                 Похоже, вы выбрали услуги из разных категорий. Выберите набор услуг,
//                 который может выполнить один специалист, или вернитесь к выбору услуг.
//               </p>

//               <button
//                 onClick={() => router.push('/booking/services')}
//                 className="cta-glow group inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-semibold"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//                 Вернуться к выбору услуг
//               </button>
//             </motion.div>
//           </div>
//         </main>

//         <VideoSection />

//         <style jsx global>{`
//           .cta-glow{
//             background: linear-gradient(90deg,#8B5CF6 0%, #3B82F6 50%, #06B6D4 100%);
//             color: white;
//             box-shadow:
//               0 8px 30px rgba(59,130,246,.35),
//               0 0 24px rgba(6,182,212,.25);
//             transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
//           }
//           .cta-glow:hover{
//             transform: translateY(-1px) scale(1.02);
//             box-shadow:
//               0 10px 36px rgba(59,130,246,.45),
//               0 0 34px rgba(6,182,212,.35);
//             filter: saturate(1.1);
//           }
//           .cta-glow:active{ transform: translateY(0) scale(.99); }
//         `}</style>
//       </PageShell>
//     );
//   }

//   /* ---------------- Нормальный список мастеров ---------------- */
//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//         {/* Центр: капсула + заголовок */}
//         <div className="w-full flex flex-col items-center text-center">
//           <motion.div
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: 'spring', stiffness: 300, damping: 26 }}
//             className="relative inline-block mt-5 md:mt-6 mb-6 md:mb-7"
//           >
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
//                 <User className="w-4 h-4 text-black/80" />
//               </span>
//               <span className="font-serif italic tracking-wide text-sm md:text-base">
//                 Шаг 2 — Выбор мастера
//               </span>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className={`
//               mx-auto text-center
//               text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//               font-serif italic leading-tight
//               mb-3 md:mb-4
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//               drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//             `}
//           >
//             Выбор мастера
//           </motion.h1>

//           {/* Подзаголовок (брендовый шрифт и подсветка) */}
//           <motion.p
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="
//               mx-auto text-center max-w-2xl
//               brand-script
//               font-serif tracking-wide
//               text-lg md:text-xl
//               brand-subtitle
//             "
//           >
//             Выберите мастера для ваших услуг
//           </motion.p>
//         </div>

//         {/* Список мастеров */}
//         <div className="mt-8 md:mt-10 grid grid-cols-1 gap-6 md:gap-8">
//           <AnimatePresence mode="popLayout">
//             {masters.map((m, i) => (
//               <MasterCard key={m.id} master={m} index={i} onSelect={selectMaster} />
//             ))}
//           </AnimatePresence>
//         </div>

//         {/* Назад */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className={`
//             fixed inset-x-0 bottom-2 z-20 px-4
//             sm:bottom-3 sm:px-6
//             lg:static lg:inset-auto lg:bottom-auto lg:z-auto lg:px-0
//             mt-6 md:mt-10
//           `}
//           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
//         >
//           <div className="mx-auto w-full max-w-screen-2xl">
//             <button
//               type="button"
//               onClick={() => router.push('/booking/services')}
//               className="inline-flex items-center gap-2 text-white/85 hover:text-amber-400 font-medium transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               Вернуться к выбору услуг
//             </button>
//           </div>
//         </motion.div>
//       </main>

//       <VideoSection />

//       {/* глобальные эффекты */}
//       <style jsx global>{`
//         .neon-gold {
//           filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.55))
//             drop-shadow(0 0 6px rgba(255, 215, 0, 0.45))
//             drop-shadow(0 0 12px rgba(253, 224, 71, 0.35));
//           animation: neon-flicker 2.8s ease-in-out infinite;
//         }
//         .neon-gold-boost {
//           filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.7))
//             drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))
//             drop-shadow(0 0 20px rgba(253, 224, 71, 0.55))
//             drop-shadow(0 0 34px rgba(245, 197, 24, 0.35));
//         }
//         @keyframes neon-flicker {
//           0%, 100% {
//             filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.55))
//               drop-shadow(0 0 6px rgba(255, 215, 0, 0.45))
//               drop-shadow(0 0 12px rgba(253, 224, 71, 0.35));
//           }
//           48% {
//             filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.65))
//               drop-shadow(0 0 9px rgba(255, 215, 0, 0.55))
//               drop-shadow(0 0 18px rgba(253, 224, 71, 0.45));
//           }
//           50% {
//             filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))
//               drop-shadow(0 0 14px rgba(255, 215, 0, 0.7))
//               drop-shadow(0 0 26px rgba(253, 224, 71, 0.6));
//           }
//         }

//         .sparkle, .sparkle-delay {
//           box-shadow: 0 0 6px rgba(253, 224, 71, 0.75),
//             0 0 12px rgba(245, 197, 24, 0.55);
//           animation: sparkle-pop 1.8s ease-in-out infinite;
//         }
//         .sparkle-delay { animation-delay: 0.7s; }
//         @keyframes sparkle-pop {
//           0%, 100% { transform: scale(0.6); opacity: 0.8; }
//           50% { transform: scale(1.15); opacity: 1; }
//         }

//         .stardust {
//           width: 72px; height: 28px;
//           background:
//             radial-gradient(2px 2px at 12% 40%, rgba(253,224,71,.9) 0, rgba(253,224,71,0) 65%),
//             radial-gradient(1.6px 1.6px at 48% 62%, rgba(255,241,175,.95) 0, rgba(255,241,175,0) 65%),
//             radial-gradient(1.8px 1.8px at 78% 38%, rgba(255,230,120,.9) 0, rgba(255,230,120,0) 65%);
//           filter: drop-shadow(0 0 6px rgba(253,224,71,.55));
//           animation: dust-float 3.6s ease-in-out infinite;
//           opacity: .85;
//         }

//         /* ====== фирменная подсветка для подзаголовка ====== */
//         .brand-subtitle{
//           background: linear-gradient(90deg, #8B5CF6 0%, #3B82F6 50%, #06B6D4 100%);
//           -webkit-background-clip: text;
//           background-clip: text;
//           color: transparent;
//           text-shadow:
//             0 0 10px rgba(139, 92, 246, 0.35),
//             0 0 18px rgba(59, 130, 246, 0.25),
//             0 0 28px rgba(6, 182, 212, 0.22);
//           filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.15));
//         }
//         .brand-subtitle:hover,
//         .brand-subtitle:active{
//           text-shadow:
//             0 0 12px rgba(139, 92, 246, 0.45),
//             0 0 22px rgba(59, 130, 246, 0.35),
//             0 0 32px rgba(6, 182, 212, 0.28);
//         }

//         /* фирменный «прописной» шрифт */
//         .brand-script{
//           font-family: var(--brand-script, 'YourBrandScript', 'Cormorant Infant', 'Playfair Display', serif);
//           font-style: italic;
//           font-weight: 600;
//           letter-spacing: .02em;
//           -webkit-font-smoothing: antialiased;
//           -moz-osx-font-smoothing: grayscale;
//         }
//       `}</style>
//     </PageShell>
//   );
// }

// /* ------------------------------- Export ------------------------------- */
// export default function MasterPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen flex items-center justify-center bg-black">
//           <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }





//-------------исключаем выбор услуг если нет такого мастера
// //src/app/booking/steps/master/page.tsx
// 'use client';

// import React, { useState, useEffect, useMemo, Suspense } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { User, ChevronRight, ArrowLeft } from 'lucide-react';

// interface Master {
//   id: string;
//   name: string;
//   avatarUrl?: string | null;
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// /* ------------------------------- Shell ------------------------------- */
// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen relative overflow-hidden bg-black">
//       <header
//         className={`
//           booking-header fixed top-0 inset-x-0 z-50
//           bg-black/45 backdrop-blur-md border-b border-white/10
//         `}
//       >
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//           <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       {/* отступ под фикс-хедер */}
//       <div className="h-[84px] md:h-[96px]" />

//       {children}
//     </div>
//   );
// }

// /* ---------------------------- Видео ниже ---------------------------- */
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

// /* ---------------------- Карточка мастера ---------------------- */
// function MasterCard({
//   master,
//   onSelect,
//   index,
// }: {
//   master: Master;
//   onSelect: (id: string) => void;
//   index: number;
// }) {
//   const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

//   const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
//     if (e.pointerType === 'mouse' && e.button !== 0) return;
//     const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//     setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
//   };

//   return (
//     <motion.button
//       type="button"
//       layout
//       initial={{ opacity: 0, scale: 0.98, y: 18 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.96 }}
//       transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
//       onClick={() => onSelect(master.id)}
//       onPointerDown={handlePointerDown}
//       className={`
//         group relative w-full max-w-[900px] xl:max-w-[1020px] mx-auto
//         cursor-pointer rounded-3xl border border-white/15
//         bg-black/30 backdrop-blur-sm
//         p-6 md:p-8 text-left
//         transition-all duration-300
//         hover:border-amber-500/50 hover:bg-black/40
//         hover:shadow-[0_0_48px_rgba(245,197,24,0.25)]
//         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
//         overflow-hidden
//       `}
//     >
//       {/* свечение карточки */}
//       <div
//         className="pointer-events-none absolute -inset-4 rounded-[28px] opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100"
//         style={{
//           background:
//             'linear-gradient(135deg, rgba(245,197,24,.35), rgba(253,224,71,.35))',
//         }}
//       />

//       {/* ripple */}
//       <AnimatePresence>
//         {ripple && (
//           <motion.span
//             key={ripple.id}
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{ opacity: 0.12, scale: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.65 }}
//             className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.45)_0%,rgba(253,224,71,0.22)_45%,rgba(253,224,71,0)_70%)]"
//             style={{
//               width: 420,
//               height: 420,
//               left: ripple.x - 210,
//               top: ripple.y - 210,
//               filter:
//                 'drop-shadow(0 0 12px rgba(253,224,71,.35)) drop-shadow(0 0 26px rgba(245,197,24,.25))',
//             }}
//             onAnimationComplete={() => setRipple(null)}
//           />
//         )}
//       </AnimatePresence>

//       <div className="relative flex items-center gap-5 md:gap-6">
//         {/* аватар + ореол */}
//         <div className="relative shrink-0">
//           <span
//             className={`
//               absolute -inset-2 rounded-full
//               bg-[radial-gradient(circle,rgba(253,224,71,.45)_0%,rgba(253,224,71,.12)_50%,rgba(253,224,71,0)_72%)]
//               opacity-70 blur-md transition-all
//               group-hover:opacity-100 group-hover:blur-lg
//             `}
//           />
//           <span className="sparkle absolute -top-1 right-0 w-3 h-3 rounded-full bg-amber-300/90" />
//           <span className="sparkle-delay absolute -bottom-1 left-0 w-2.5 h-2.5 rounded-full bg-yellow-200/90" />

//           {master.avatarUrl ? (
//             <span className="block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/15 group-hover:ring-amber-400/60 transition-all relative">
//               <Image
//                 src={master.avatarUrl}
//                 alt={master.name}
//                 width={96}
//                 height={96}
//                 sizes="(max-width:768px) 64px, 96px"
//                 className="h-full w-full object-cover"
//               />
//             </span>
//           ) : (
//             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//               <User className="w-8 h-8 md:w-10 md:h-10 text-black" />
//             </div>
//           )}
//         </div>

//         {/* имя — неон золото */}
//         <div className="flex-1 min-w-0">
//           <h3 className="mb-1 relative inline-block">
//             <span className="stardust pointer-events-none absolute -top-3 -left-4" />
//             <span
//               className={`
//                 neon-gold text-xl md:text-2xl font-extrabold
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#FFE08A] via-[#FFF4C2] to-[#FFE08A]
//                 transition-all group-hover:neon-gold-boost group-active:neon-gold-boost
//               `}
//             >
//               {master.name}
//             </span>
//           </h3>
//           <p className="text-white/75 text-xs md:text-sm">Нажмите, чтобы выбрать</p>
//         </div>

//         <ChevronRight className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-white/50 transition-all group-hover:text-amber-400 group-hover:translate-x-2" />
//       </div>
//     </motion.button>
//   );
// }

// /* --------------------------- Страница --------------------------- */
// function MasterInner(): React.JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       setError(null);

//       try {
//         const qs = new URLSearchParams();
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/masters?${qs.toString()}`, { cache: 'no-store' });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = (await res.json()) as { masters: Master[] };
//         if (!cancelled) setMasters(data.masters ?? []);
//       } catch (e) {
//         const msg = e instanceof Error ? e.message : 'Не удалось загрузить мастеров';
//         if (!cancelled) setError(msg);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void loadMasters();
//     return () => {
//       cancelled = true;
//     };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append('s', id));
//     qs.set('m', masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   if (serviceIds.length === 0) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
//             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
//               <div className="text-5xl md:text-6xl mb-6">⚠️</div>
//               <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
//                 Услуги не выбраны
//               </h2>
//               <p className="text-white/80 mb-8">Пожалуйста, сначала выберите услуги.</p>
//               <button
//                 onClick={() => router.push('/booking/services')}
//                 className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] hover:scale-105 transition-all duration-300"
//               >
//                 Выбрать услуги
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   if (loading) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
//             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
//               <div className="flex items-center justify-center mb-8">
//                 <motion.div
//                   initial={{ rotate: 0 }}
//                   animate={{ rotate: 360 }}
//                   transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
//                   className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//                 />
//               </div>
//               <p className="mt-6 text-center text-white/80 font-medium">Загрузка мастеров…</p>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   if (error) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
//             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
//               <div className="text-6xl mb-6">❌</div>
//               <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-3">Ошибка</h2>
//               <p className="text-white/80 mb-8">{error}</p>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//               >
//                 Попробовать снова
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//         {/* Центр: капсула + заголовок */}
//         <div className="w-full flex flex-col items-center text-center">
//           <motion.div
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: 'spring', stiffness: 300, damping: 26 }}
//             className="relative inline-block mt-5 md:mt-6 mb-6 md:mb-7"
//           >
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
//                 <User className="w-4 h-4 text-black/80" />
//               </span>
//               <span className="font-serif italic tracking-wide text-sm md:text-base">
//                 Шаг 2 — Выбор мастера
//               </span>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className={`
//               mx-auto text-center
//               text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//               font-serif italic leading-tight
//               mb-3 md:mb-4
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//               drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//             `}
//           >
//             Выбор мастера
//           </motion.h1>

//           {/* ИЗМЕНЁННЫЙ ПОДЗАГОЛОВОК */}
//           <motion.p
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="
//               mx-auto text-center max-w-2xl
//               brand-script
//               font-serif tracking-wide
//               text-lg md:text-xl
//               brand-subtitle
//             "
//           >
//             Выберите мастера для ваших услуг
//           </motion.p>
//         </div>

//         {/* Список мастеров */}
//         <div className="mt-8 md:mt-10 grid grid-cols-1 gap-6 md:gap-8">
//           <AnimatePresence mode="popLayout">
//             {masters.map((m, i) => (
//               <MasterCard key={m.id} master={m} index={i} onSelect={selectMaster} />
//             ))}
//           </AnimatePresence>
//         </div>

//         {/* Назад */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className={`
//             fixed inset-x-0 bottom-2 z-20 px-4
//             sm:bottom-3 sm:px-6
//             lg:static lg:inset-auto lg:bottom-auto lg:z-auto lg:px-0
//             mt-6 md:mt-10
//           `}
//           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
//         >
//           <div className="mx-auto w-full max-w-screen-2xl">
//             <button
//               type="button"
//               onClick={() => router.push('/booking/services')}
//               className="inline-flex items-center gap-2 text-white/85 hover:text-amber-400 font-medium transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               Вернуться к выбору услуг
//             </button>
//           </div>
//         </motion.div>
//       </main>

//       <VideoSection />

//       {/* глобальные эффекты */}
//       <style jsx global>{`
//         .neon-gold {
//           filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.55))
//             drop-shadow(0 0 6px rgba(255, 215, 0, 0.45))
//             drop-shadow(0 0 12px rgba(253, 224, 71, 0.35));
//           animation: neon-flicker 2.8s ease-in-out infinite;
//         }
//         .neon-gold-boost {
//           filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.7))
//             drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))
//             drop-shadow(0 0 20px rgba(253, 224, 71, 0.55))
//             drop-shadow(0 0 34px rgba(245, 197, 24, 0.35));
//         }
//         @keyframes neon-flicker {
//           0%, 100% {
//             filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.55))
//               drop-shadow(0 0 6px rgba(255, 215, 0, 0.45))
//               drop-shadow(0 0 12px rgba(253, 224, 71, 0.35));
//           }
//           48% {
//             filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.65))
//               drop-shadow(0 0 9px rgba(255, 215, 0, 0.55))
//               drop-shadow(0 0 18px rgba(253, 224, 71, 0.45));
//           }
//           50% {
//             filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))
//               drop-shadow(0 0 14px rgba(255, 215, 0, 0.7))
//               drop-shadow(0 0 26px rgba(253, 224, 71, 0.6));
//           }
//         }

//         .sparkle, .sparkle-delay {
//           box-shadow: 0 0 6px rgba(253, 224, 71, 0.75),
//             0 0 12px rgba(245, 197, 24, 0.55);
//           animation: sparkle-pop 1.8s ease-in-out infinite;
//         }
//         .sparkle-delay { animation-delay: 0.7s; }
//         @keyframes sparkle-pop {
//           0%, 100% { transform: scale(0.6); opacity: 0.8; }
//           50% { transform: scale(1.15); opacity: 1; }
//         }

//         .stardust {
//           width: 72px; height: 28px;
//           background:
//             radial-gradient(2px 2px at 12% 40%, rgba(253,224,71,.9) 0, rgba(253,224,71,0) 65%),
//             radial-gradient(1.6px 1.6px at 48% 62%, rgba(255,241,175,.95) 0, rgba(255,241,175,0) 65%),
//             radial-gradient(1.8px 1.8px at 78% 38%, rgba(255,230,120,.9) 0, rgba(255,230,120,0) 65%);
//           filter: drop-shadow(0 0 6px rgba(253,224,71,.55));
//           animation: dust-float 3.6s ease-in-out infinite;
//           opacity: .85;
//         }

//         /* ====== фирменная подсветка для подзаголовка ====== */
//         .brand-subtitle{
//           background: linear-gradient(90deg, #8B5CF6 0%, #3B82F6 50%, #06B6D4 100%);
//           -webkit-background-clip: text;
//           background-clip: text;
//           color: transparent;
//           text-shadow:
//             0 0 10px rgba(139, 92, 246, 0.35),
//             0 0 18px rgba(59, 130, 246, 0.25),
//             0 0 28px rgba(6, 182, 212, 0.22);
//           filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.15));
//         }
//         .brand-subtitle:hover,
//         .brand-subtitle:active{
//           text-shadow:
//             0 0 12px rgba(139, 92, 246, 0.45),
//             0 0 22px rgba(59, 130, 246, 0.35),
//             0 0 32px rgba(6, 182, 212, 0.28);
//         }

//         /* ====== ДОБАВЛЕНО: фирменный «прописной» шрифт ====== */
//         .brand-script{
//           font-family: var(--brand-script, 'YourBrandScript', 'Cormorant Infant', 'Playfair Display', serif);
//           font-style: italic;
//           font-weight: 600;
//           letter-spacing: .02em;
//           -webkit-font-smoothing: antialiased;
//           -moz-osx-font-smoothing: grayscale;
//         }
//       `}</style>
//     </PageShell>
//   );
// }

// /* ------------------------------- Export ------------------------------- */
// export default function MasterPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen flex items-center justify-center bg-black">
//           <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }



// 'use client';

// import React, { useState, useEffect, useMemo, Suspense } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { User, ChevronRight, ArrowLeft } from 'lucide-react';

// interface Master {
//   id: string;
//   name: string;
//   avatarUrl?: string | null;
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// /* ------------------------------- Shell ------------------------------- */
// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen relative overflow-hidden bg-black">
//       <header
//         className={`
//           booking-header fixed top-0 inset-x-0 z-50
//           bg-black/45 backdrop-blur-md border-b border-white/10
//         `}
//       >
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//           <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       {/* отступ под фикс-хедер */}
//       <div className="h-[84px] md:h-[96px]" />

//       {children}
//     </div>
//   );
// }

// /* ---------------------------- Видео ниже ---------------------------- */
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

// /* ---------------------- Карточка мастера ---------------------- */
// function MasterCard({
//   master,
//   onSelect,
//   index,
// }: {
//   master: Master;
//   onSelect: (id: string) => void;
//   index: number;
// }) {
//   const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

//   const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
//     if (e.pointerType === 'mouse' && e.button !== 0) return;
//     const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
//     setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
//   };

//   return (
//     <motion.button
//       type="button"
//       layout
//       initial={{ opacity: 0, scale: 0.98, y: 18 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.96 }}
//       transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
//       onClick={() => onSelect(master.id)}
//       onPointerDown={handlePointerDown}
//       className={`
//         group relative w-full max-w-[900px] xl:max-w-[1020px] mx-auto
//         cursor-pointer rounded-3xl border border-white/15
//         bg-black/30 backdrop-blur-sm
//         p-6 md:p-8 text-left
//         transition-all duration-300
//         hover:border-amber-500/50 hover:bg-black/40
//         hover:shadow-[0_0_48px_rgba(245,197,24,0.25)]
//         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
//         overflow-hidden
//       `}
//     >
//       {/* свечение карточки */}
//       <div
//         className="pointer-events-none absolute -inset-4 rounded-[28px] opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100"
//         style={{
//           background:
//             'linear-gradient(135deg, rgba(245,197,24,.35), rgba(253,224,71,.35))',
//         }}
//       />

//       {/* ripple */}
//       <AnimatePresence>
//         {ripple && (
//           <motion.span
//             key={ripple.id}
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{ opacity: 0.12, scale: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.65 }}
//             className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.45)_0%,rgba(253,224,71,0.22)_45%,rgba(253,224,71,0)_70%)]"
//             style={{
//               width: 420,
//               height: 420,
//               left: ripple.x - 210,
//               top: ripple.y - 210,
//               filter:
//                 'drop-shadow(0 0 12px rgba(253,224,71,.35)) drop-shadow(0 0 26px rgba(245,197,24,.25))',
//             }}
//             onAnimationComplete={() => setRipple(null)}
//           />
//         )}
//       </AnimatePresence>

//       <div className="relative flex items-center gap-5 md:gap-6">
//         {/* аватар + ореол */}
//         <div className="relative shrink-0">
//           <span
//             className={`
//               absolute -inset-2 rounded-full
//               bg-[radial-gradient(circle,rgba(253,224,71,.45)_0%,rgba(253,224,71,.12)_50%,rgba(253,224,71,0)_72%)]
//               opacity-70 blur-md transition-all
//               group-hover:opacity-100 group-hover:blur-lg
//             `}
//           />
//         <span className="sparkle absolute -top-1 right-0 w-3 h-3 rounded-full bg-amber-300/90" />
//           <span className="sparkle-delay absolute -bottom-1 left-0 w-2.5 h-2.5 rounded-full bg-yellow-200/90" />

//           {master.avatarUrl ? (
//             <span className="block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/15 group-hover:ring-amber-400/60 transition-all relative">
//               <Image
//                 src={master.avatarUrl}
//                 alt={master.name}
//                 width={96}
//                 height={96}
//                 sizes="(max-width:768px) 64px, 96px"
//                 className="h-full w-full object-cover"
//               />
//             </span>
//           ) : (
//             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//               <User className="w-8 h-8 md:w-10 md:h-10 text-black" />
//             </div>
//           )}
//         </div>

//         {/* имя — неон золото */}
//         <div className="flex-1 min-w-0">
//           <h3 className="mb-1 relative inline-block">
//             <span className="stardust pointer-events-none absolute -top-3 -left-4" />
//             <span
//               className={`
//                 neon-gold text-xl md:text-2xl font-extrabold
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#FFE08A] via-[#FFF4C2] to-[#FFE08A]
//                 transition-all group-hover:neon-gold-boost group-active:neon-gold-boost
//               `}
//             >
//               {master.name}
//             </span>
//           </h3>
//           <p className="text-white/75 text-xs md:text-sm">Нажмите, чтобы выбрать</p>
//         </div>

//         <ChevronRight className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-white/50 transition-all group-hover:text-amber-400 group-hover:translate-x-2" />
//       </div>
//     </motion.button>
//   );
// }

// /* --------------------------- Страница --------------------------- */
// function MasterInner(): React.JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       setError(null);

//       try {
//         const qs = new URLSearchParams();
//         qs.set('serviceIds', serviceIds.join(','));
//         const res = await fetch(`/api/masters?${qs.toString()}`, { cache: 'no-store' });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = (await res.json()) as { masters: Master[] };
//         if (!cancelled) setMasters(data.masters ?? []);
//       } catch (e) {
//         const msg = e instanceof Error ? e.message : 'Не удалось загрузить мастеров';
//         if (!cancelled) setError(msg);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void loadMasters();
//     return () => {
//       cancelled = true;
//     };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append('s', id));
//     qs.set('m', masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   if (serviceIds.length === 0) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
//             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
//               <div className="text-5xl md:text-6xl mb-6">⚠️</div>
//               <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
//                 Услуги не выбраны
//               </h2>
//               <p className="text-white/80 mb-8">Пожалуйста, сначала выберите услуги.</p>
//               <button
//                 onClick={() => router.push('/booking/services')}
//                 className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] hover:scale-105 transition-all duration-300"
//               >
//                 Выбрать услуги
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   if (loading) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
//             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
//               <div className="flex items-center justify-center mb-8">
//                 <motion.div
//                   initial={{ rotate: 0 }}
//                   animate={{ rotate: 360 }}
//                   transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
//                   className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//                 />
//               </div>
//               <p className="mt-6 text-center text-white/80 font-medium">Загрузка мастеров…</p>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   if (error) {
//     return (
//       <PageShell>
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
//             <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
//               <div className="text-6xl mb-6">❌</div>
//               <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-3">Ошибка</h2>
//               <p className="text-white/80 mb-8">{error}</p>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//               >
//                 Попробовать снова
//               </button>
//             </motion.div>
//           </div>
//         </div>
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//         {/* Центр: капсула + заголовок */}
//         <div className="w-full flex flex-col items-center text-center">
//           <motion.div
//             initial={{ scale: 0.96, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: 'spring', stiffness: 300, damping: 26 }}
//             className="relative inline-block mt-5 md:mt-6 mb-6 md:mb-7"
//           >
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
//                 <User className="w-4 h-4 text-black/80" />
//               </span>
//               <span className="font-serif italic tracking-wide text-sm md:text-base">
//                 Шаг 2 — Выбор мастера
//               </span>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className={`
//               mx-auto text-center
//               text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//               font-serif italic leading-tight
//               mb-3 md:mb-4
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//               drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//             `}
//           >
//             Выбор мастера
//           </motion.h1>

//           {/* ИЗМЕНЁННЫЙ ПОДЗАГОЛОВОК */}
//           <motion.p
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="
//               mx-auto text-center max-w-2xl
//               font-serif tracking-wide
//               text-lg md:text-xl
//               brand-subtitle
//             "
//           >
//             Выберите мастера для ваших услуг
//           </motion.p>
//         </div>

//         {/* Список мастеров */}
//         <div className="mt-8 md:mt-10 grid grid-cols-1 gap-6 md:gap-8">
//           <AnimatePresence mode="popLayout">
//             {masters.map((m, i) => (
//               <MasterCard key={m.id} master={m} index={i} onSelect={selectMaster} />
//             ))}
//           </AnimatePresence>
//         </div>

//         {/* Назад */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className={`
//             fixed inset-x-0 bottom-2 z-20 px-4
//             sm:bottom-3 sm:px-6
//             lg:static lg:inset-auto lg:bottom-auto lg:z-auto lg:px-0
//             mt-6 md:mt-10
//           `}
//           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
//         >
//           <div className="mx-auto w-full max-w-screen-2xl">
//             <button
//               type="button"
//               onClick={() => router.push('/booking/services')}
//               className="inline-flex items-center gap-2 text-white/85 hover:text-amber-400 font-medium transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               Вернуться к выбору услуг
//             </button>
//           </div>
//         </motion.div>
//       </main>

//       <VideoSection />

//       {/* глобальные эффекты */}
//       <style jsx global>{`
//         .neon-gold {
//           filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.55))
//             drop-shadow(0 0 6px rgba(255, 215, 0, 0.45))
//             drop-shadow(0 0 12px rgba(253, 224, 71, 0.35));
//           animation: neon-flicker 2.8s ease-in-out infinite;
//         }
//         .neon-gold-boost {
//           filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.7))
//             drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))
//             drop-shadow(0 0 20px rgba(253, 224, 71, 0.55))
//             drop-shadow(0 0 34px rgba(245, 197, 24, 0.35));
//         }
//         @keyframes neon-flicker {
//           0%, 100% {
//             filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.55))
//               drop-shadow(0 0 6px rgba(255, 215, 0, 0.45))
//               drop-shadow(0 0 12px rgba(253, 224, 71, 0.35));
//           }
//           48% {
//             filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.65))
//               drop-shadow(0 0 9px rgba(255, 215, 0, 0.55))
//               drop-shadow(0 0 18px rgba(253, 224, 71, 0.45));
//           }
//           50% {
//             filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))
//               drop-shadow(0 0 14px rgba(255, 215, 0, 0.7))
//               drop-shadow(0 0 26px rgba(253, 224, 71, 0.6));
//           }
//         }

//         .sparkle, .sparkle-delay {
//           box-shadow: 0 0 6px rgba(253, 224, 71, 0.75),
//             0 0 12px rgba(245, 197, 24, 0.55);
//           animation: sparkle-pop 1.8s ease-in-out infinite;
//         }
//         .sparkle-delay { animation-delay: 0.7s; }
//         @keyframes sparkle-pop {
//           0%, 100% { transform: scale(0.6); opacity: 0.8; }
//           50% { transform: scale(1.15); opacity: 1; }
//         }

//         .stardust {
//           width: 72px; height: 28px;
//           background:
//             radial-gradient(2px 2px at 12% 40%, rgba(253,224,71,.9) 0, rgba(253,224,71,0) 65%),
//             radial-gradient(1.6px 1.6px at 48% 62%, rgba(255,241,175,.95) 0, rgba(255,241,175,0) 65%),
//             radial-gradient(1.8px 1.8px at 78% 38%, rgba(255,230,120,.9) 0, rgba(255,230,120,0) 65%);
//           filter: drop-shadow(0 0 6px rgba(253,224,71,.55));
//           animation: dust-float 3.6s ease-in-out infinite;
//           opacity: .85;
//         }

//         /* ====== ДОБАВЛЕНО: фирменная подсветка для подзаголовка ====== */
//         .brand-subtitle{
//           background: linear-gradient(90deg, #8B5CF6 0%, #3B82F6 50%, #06B6D4 100%);
//           -webkit-background-clip: text;
//           background-clip: text;
//           color: transparent;
//           text-shadow:
//             0 0 10px rgba(139, 92, 246, 0.35),
//             0 0 18px rgba(59, 130, 246, 0.25),
//             0 0 28px rgba(6, 182, 212, 0.22);
//           filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.15));
//         }
//         .brand-subtitle:hover,
//         .brand-subtitle:active{
//           text-shadow:
//             0 0 12px rgba(139, 92, 246, 0.45),
//             0 0 22px rgba(59, 130, 246, 0.35),
//             0 0 32px rgba(6, 182, 212, 0.28);
//         }
//       `}</style>
//     </PageShell>
//   );
// }

// /* ------------------------------- Export ------------------------------- */
// export default function MasterPage(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen flex items-center justify-center bg-black">
//           <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }




