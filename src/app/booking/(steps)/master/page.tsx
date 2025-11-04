'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import PremiumProgressBar from '@/components/PremiumProgressBar';
import { User, ChevronRight, ArrowLeft } from 'lucide-react';

interface Master {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

const BOOKING_STEPS = [
  { id: 'services', label: 'Услуга', icon: '✨' },
  { id: 'master', label: 'Мастер', icon: '👤' },
  { id: 'calendar', label: 'Дата', icon: '📅' },
  { id: 'client', label: 'Данные', icon: '📝' },
  { id: 'verify', label: 'Проверка', icon: '✓' },
  { id: 'payment', label: 'Оплата', icon: '💳' },
];

/* ------------------------------- Shell ------------------------------- */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <header
        className={`
          booking-header fixed top-0 inset-x-0 z-50
          bg-black/45 backdrop-blur-md border-b border-white/10
        `}
      >
        <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
          <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
        </div>
      </header>

      {/* отступ под фикс-хедер */}
      <div className="h-[84px] md:h-[96px]" />

      {children}
    </div>
  );
}

/* ---------------------------- Видео ниже ---------------------------- */
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

/* ---------------------- Карточка мастера ---------------------- */
function MasterCard({
  master,
  onSelect,
  index,
}: {
  master: Master;
  onSelect: (id: string) => void;
  index: number;
}) {
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
  };

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, scale: 0.98, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
      onClick={() => onSelect(master.id)}
      onPointerDown={handlePointerDown}
      className={`
        group relative w-full max-w-[900px] xl:max-w-[1020px] mx-auto
        cursor-pointer rounded-3xl border border-white/15
        bg-black/30 backdrop-blur-sm
        p-6 md:p-8 text-left
        transition-all duration-300
        hover:border-amber-500/50 hover:bg-black/40
        hover:shadow-[0_0_48px_rgba(245,197,24,0.25)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
        overflow-hidden
      `}
    >
      {/* свечение карточки */}
      <div
        className="pointer-events-none absolute -inset-4 rounded-[28px] opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(135deg, rgba(245,197,24,.35), rgba(253,224,71,.35))',
        }}
      />

      {/* ripple */}
      <AnimatePresence>
        {ripple && (
          <motion.span
            key={ripple.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.12, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65 }}
            className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(253,224,71,0.45)_0%,rgba(253,224,71,0.22)_45%,rgba(253,224,71,0)_70%)]"
            style={{
              width: 420,
              height: 420,
              left: ripple.x - 210,
              top: ripple.y - 210,
              filter:
                'drop-shadow(0 0 12px rgba(253,224,71,.35)) drop-shadow(0 0 26px rgba(245,197,24,.25))',
            }}
            onAnimationComplete={() => setRipple(null)}
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center gap-5 md:gap-6">
        {/* аватар + ореол */}
        <div className="relative shrink-0">
          <span
            className={`
              absolute -inset-2 rounded-full
              bg-[radial-gradient(circle,rgba(253,224,71,.45)_0%,rgba(253,224,71,.12)_50%,rgba(253,224,71,0)_72%)]
              opacity-70 blur-md transition-all
              group-hover:opacity-100 group-hover:blur-lg
            `}
          />
          <span className="sparkle absolute -top-1 right-0 w-3 h-3 rounded-full bg-amber-300/90" />
          <span className="sparkle-delay absolute -bottom-1 left-0 w-2.5 h-2.5 rounded-full bg-yellow-200/90" />

          {master.avatarUrl ? (
            <span className="block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/15 group-hover:ring-amber-400/60 transition-all relative">
              <Image
                src={master.avatarUrl}
                alt={master.name}
                width={96}
                height={96}
                sizes="(max-width:768px) 64px, 96px"
                className="h-full w-full object-cover"
              />
            </span>
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
              <User className="w-8 h-8 md:w-10 md:h-10 text-black" />
            </div>
          )}
        </div>

        {/* имя — неон золото */}
        <div className="flex-1 min-w-0">
          <h3 className="mb-1 relative inline-block">
            <span className="stardust pointer-events-none absolute -top-3 -left-4" />
            <span
              className={`
                neon-gold text-xl md:text-2xl font-extrabold
                text-transparent bg-clip-text
                bg-gradient-to-r from-[#FFE08A] via-[#FFF4C2] to-[#FFE08A]
                transition-all group-hover:neon-gold-boost group-active:neon-gold-boost
              `}
            >
              {master.name}
            </span>
          </h3>
          <p className="text-white/75 text-xs md:text-sm">Нажмите, чтобы выбрать</p>
        </div>

        <ChevronRight className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-white/50 transition-all group-hover:text-amber-400 group-hover:translate-x-2" />
      </div>
    </motion.button>
  );
}

/* --------------------------- Страница --------------------------- */
function MasterInner(): React.JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  const serviceIds = useMemo<string[]>(
    () => params.getAll('s').filter(Boolean),
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
        qs.set('serviceIds', serviceIds.join(','));
        const res = await fetch(`/api/masters?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { masters: Master[] };
        if (!cancelled) setMasters(data.masters ?? []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Не удалось загрузить мастеров';
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
    serviceIds.forEach((id) => qs.append('s', id));
    qs.set('m', masterId);
    router.push(`/booking/calendar?${qs.toString()}`);
  };

  if (serviceIds.length === 0) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
          <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
              <div className="text-5xl md:text-6xl mb-6">⚠️</div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Услуги не выбраны
              </h2>
              <p className="text-white/80 mb-8">Пожалуйста, сначала выберите услуги.</p>
              <button
                onClick={() => router.push('/booking/services')}
                className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] hover:scale-105 transition-all duration-300"
              >
                Выбрать услуги
              </button>
            </motion.div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
          <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
              <div className="flex items-center justify-center mb-8">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
                />
              </div>
              <p className="mt-6 text-center text-white/80 font-medium">Загрузка мастеров…</p>
            </motion.div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
          <div className="pt-10 md:pt-12 lg:pt-14 flex items-center justify-center min-h-[60vh]">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
              <div className="text-6xl mb-6">❌</div>
              <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-3">Ошибка</h2>
              <p className="text-white/80 mb-8">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
              >
                Попробовать снова
              </button>
            </motion.div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
        {/* Центр: капсула + заголовок */}
        <div className="w-full flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative inline-block mt-5 md:mt-6 mb-6 md:mb-7"
          >
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
                <User className="w-4 h-4 text-black/80" />
              </span>
              <span className="font-serif italic tracking-wide text-sm md:text-base">
                Шаг 2 — Выбор мастера
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`
              mx-auto text-center
              text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
              font-serif italic leading-tight
              mb-3 md:mb-4
              text-transparent bg-clip-text
              bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
              drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
            `}
          >
            Выбор мастера
          </motion.h1>

          {/* ИЗМЕНЁННЫЙ ПОДЗАГОЛОВОК */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="
              mx-auto text-center max-w-2xl
              brand-script
              font-serif tracking-wide
              text-lg md:text-xl
              brand-subtitle
            "
          >
            Выберите мастера для ваших услуг
          </motion.p>
        </div>

        {/* Список мастеров */}
        <div className="mt-8 md:mt-10 grid grid-cols-1 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {masters.map((m, i) => (
              <MasterCard key={m.id} master={m} index={i} onSelect={selectMaster} />
            ))}
          </AnimatePresence>
        </div>

        {/* Назад */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`
            fixed inset-x-0 bottom-2 z-20 px-4
            sm:bottom-3 sm:px-6
            lg:static lg:inset-auto lg:bottom-auto lg:z-auto lg:px-0
            mt-6 md:mt-10
          `}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="mx-auto w-full max-w-screen-2xl">
            <button
              type="button"
              onClick={() => router.push('/booking/services')}
              className="inline-flex items-center gap-2 text-white/85 hover:text-amber-400 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Вернуться к выбору услуг
            </button>
          </div>
        </motion.div>
      </main>

      <VideoSection />

      {/* глобальные эффекты */}
      <style jsx global>{`
        .neon-gold {
          filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.55))
            drop-shadow(0 0 6px rgba(255, 215, 0, 0.45))
            drop-shadow(0 0 12px rgba(253, 224, 71, 0.35));
          animation: neon-flicker 2.8s ease-in-out infinite;
        }
        .neon-gold-boost {
          filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.7))
            drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))
            drop-shadow(0 0 20px rgba(253, 224, 71, 0.55))
            drop-shadow(0 0 34px rgba(245, 197, 24, 0.35));
        }
        @keyframes neon-flicker {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.55))
              drop-shadow(0 0 6px rgba(255, 215, 0, 0.45))
              drop-shadow(0 0 12px rgba(253, 224, 71, 0.35));
          }
          48% {
            filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.65))
              drop-shadow(0 0 9px rgba(255, 215, 0, 0.55))
              drop-shadow(0 0 18px rgba(253, 224, 71, 0.45));
          }
          50% {
            filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8))
              drop-shadow(0 0 14px rgba(255, 215, 0, 0.7))
              drop-shadow(0 0 26px rgba(253, 224, 71, 0.6));
          }
        }

        .sparkle, .sparkle-delay {
          box-shadow: 0 0 6px rgba(253, 224, 71, 0.75),
            0 0 12px rgba(245, 197, 24, 0.55);
          animation: sparkle-pop 1.8s ease-in-out infinite;
        }
        .sparkle-delay { animation-delay: 0.7s; }
        @keyframes sparkle-pop {
          0%, 100% { transform: scale(0.6); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }

        .stardust {
          width: 72px; height: 28px;
          background:
            radial-gradient(2px 2px at 12% 40%, rgba(253,224,71,.9) 0, rgba(253,224,71,0) 65%),
            radial-gradient(1.6px 1.6px at 48% 62%, rgba(255,241,175,.95) 0, rgba(255,241,175,0) 65%),
            radial-gradient(1.8px 1.8px at 78% 38%, rgba(255,230,120,.9) 0, rgba(255,230,120,0) 65%);
          filter: drop-shadow(0 0 6px rgba(253,224,71,.55));
          animation: dust-float 3.6s ease-in-out infinite;
          opacity: .85;
        }

        /* ====== фирменная подсветка для подзаголовка ====== */
        .brand-subtitle{
          background: linear-gradient(90deg, #8B5CF6 0%, #3B82F6 50%, #06B6D4 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow:
            0 0 10px rgba(139, 92, 246, 0.35),
            0 0 18px rgba(59, 130, 246, 0.25),
            0 0 28px rgba(6, 182, 212, 0.22);
          filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.15));
        }
        .brand-subtitle:hover,
        .brand-subtitle:active{
          text-shadow:
            0 0 12px rgba(139, 92, 246, 0.45),
            0 0 22px rgba(59, 130, 246, 0.35),
            0 0 32px rgba(6, 182, 212, 0.28);
        }

        /* ====== ДОБАВЛЕНО: фирменный «прописной» шрифт ====== */
        .brand-script{
          font-family: var(--brand-script, 'YourBrandScript', 'Cormorant Infant', 'Playfair Display', serif);
          font-style: italic;
          font-weight: 600;
          letter-spacing: .02em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </PageShell>
  );
}

/* ------------------------------- Export ------------------------------- */
export default function MasterPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      }
    >
      <MasterInner />
    </Suspense>
  );
}



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

//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="mx-auto text-center text-base md:text-lg text-white/85 max-w-2xl font-light"
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

// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   Suspense,
// } from 'react';
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

// /* -------------------------------------------------------
//    ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ------------------------------------------------------- */

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="min-h-screen relative overflow-hidden bg-black">
//       {/* ВАЖНО: добавили booking-header, чтобы layout не скрывал этот header */}
//       <header className="booking-header fixed top-0 inset-x-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//           <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       {/* Отступ под фикс-хедер */}
//       <div className="h-[84px] md:h-[96px]" />

//       {children}
//     </div>
//   );
// }

// /** Задний план видео — НЕ фикс. Располагается НИЖЕ контента. */
// function VideoSection() {
//   return (
//     <section className="relative py-8 sm:py-10">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)]">
//         <video
//           className="
//             absolute inset-0 h-full w-full
//             object-contain 2xl:object-cover
//             object-[50%_92%] lg:object-[50%_98%] xl:object-[50%_104%] 2xl:object-[50%_96%]
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

//         {/* Лёгкое затемнение для читаемости */}
//         <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/5 pointer-events-none" />
//       </div>
//     </section>
//   );
// }

// /** Карточка мастера с «золотым рипплом», неоновым именем и подсветкой аватара */
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
//     if (e.pointerType === 'mouse' && e.button !== 0) return;
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
//         type: 'spring',
//         stiffness: 260,
//         damping: 26,
//       }}
//       onClick={() => onSelect(master.id)}
//       onPointerDown={handlePointerDown}
//       className="
//         group relative w-full max-w-[900px] xl:max-w-[1020px] mx-auto
//         cursor-pointer rounded-3xl border border-white/15
//         bg-black/30 backdrop-blur-sm
//         p-6 md:p-8 text-left
//         transition-all duration-300
//         hover:border-amber-500/50 hover:bg-black/40
//         hover:shadow-[0_0_48px_rgba(245,197,24,0.25)]
//         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
//         overflow-hidden
//       "
//     >
//       <div
//         className="
//           pointer-events-none absolute -inset-4 rounded-[28px]
//           opacity-0 blur-xl transition-opacity duration-600
//           group-hover:opacity-100
//         "
//         style={{
//           background:
//             'linear-gradient(135deg, rgba(245,197,24,.35), rgba(253,224,71,.35))',
//         }}
//       />

//       <AnimatePresence>
//         {ripple && (
//           <motion.span
//             key={ripple.id}
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{ opacity: 0.12, scale: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.65, ease: 'easeOut' }}
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
//         {/* Аватар + подсветка */}
//         <div className="relative shrink-0">
//           <span
//             className="
//               absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(253,224,71,.45)_0%,rgba(253,224,71,.12)_50%,rgba(253,224,71,0)_72%)]
//               opacity-70 blur-md
//               group-hover:opacity-100 group-hover:blur-lg
//               transition-all
//             "
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

//         {/* Имя — неоновое золото + искорки */}
//         <div className="flex-1 min-w-0">
//           <h3 className="mb-1 relative inline-block">
//             <span className="stardust pointer-events-none absolute -top-3 -left-4" />
//             <span
//               className="
//                 neon-gold
//                 text-xl md:text-2xl font-extrabold
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#FFE08A] via-[#FFF4C2] to-[#FFE08A]
//                 transition-all
//                 group-hover:neon-gold-boost group-active:neon-gold-boost
//               "
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

// /* -------------------------------------------------------
//    ОСНОВНАЯ СТРАНИЦА
// ------------------------------------------------------- */

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
//         const res = await fetch(`/api/masters?${qs.toString()}`, {
//           cache: 'no-store',
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = (await res.json()) as { masters: Master[] };
//         if (!cancelled) setMasters(data.masters ?? []);
//       } catch (e) {
//         const msg =
//           e instanceof Error ? e.message : 'Не удалось загрузить мастеров';
//         if (!cancelled) setError(msg);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void loadMasters();
//     return () => { cancelled = true; };
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
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center max-w-md"
//             >
//               <div className="text-5xl md:text-6xl mb-6">⚠️</div>
//               <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
//                 Услуги не выбраны
//               </h2>
//               <p className="text-white/80 mb-8">
//                 Пожалуйста, сначала выберите услуги.
//               </p>
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
//             <motion.div
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="w-full max-w-5xl"
//             >
//               <div className="flex items-center justify-center mb-8">
//                 <motion.div
//                   initial={{ rotate: 0 }}
//                   animate={{ rotate: 360 }}
//                   transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
//                   className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//                 />
//               </div>
//               <p className="mt-6 text-center text-white/80 font-medium">
//                 Загрузка мастеров…
//               </p>
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
//             <motion.div
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-center max-w-md"
//             >
//               <div className="text-6xl mb-6">❌</div>
//               <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-3">
//                 Ошибка
//               </h2>
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
//         {/* Капсула */}
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ delay: 0.12, type: 'spring', stiffness: 210 }}
//           className="inline-block mb-6 md:mb-7 mt-2 md:mt-3"
//         >
//           <div className="relative">
//             <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 to-yellow-500/40 rounded-full blur-xl opacity-60 animate-pulse" />
//             <div className="relative bg-gradient-to-r from-amber-500/60 to-yellow-500/60 text-black/90 px-5 md:px-7 py-2.5 md:py-3 rounded-full font-bold flex items-center gap-2 shadow-lg backdrop-blur-md border border-white/15">
//               <span className="inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-black/15">
//                 <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-black/80" />
//               </span>
//               <span className="text-sm md:text-base tracking-wide">
//                 Шаг 2 — Выбор мастера
//               </span>
//             </div>
//           </div>
//         </motion.div>

//         {/* Заголовок */}
//         <motion.h1
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.22 }}
//           className="
//             text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//             font-serif italic leading-tight
//             mb-3 md:mb-4
//             text-transparent bg-clip-text
//             bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//             drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//           "
//         >
//           Выбор мастера
//         </motion.h1>

//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.32 }}
//           className="text-base md:text-lg text-white/85 max-w-2xl font-light"
//         >
//           Выберите мастера для ваших услуг
//         </motion.p>

//         {/* Сетка мастеров */}
//         <div className="mt-8 md:mt-10 grid grid-cols-1 gap-6 md:gap-8">
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

//         {/* Кнопка «назад» */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.25 }}
//           className="
//             fixed inset-x-0 bottom-2 z-20 px-4
//             sm:bottom-3 sm:px-6
//             lg:static lg:inset-auto lg:bottom-auto lg:z-auto lg:px-0
//             mt-6 md:mt-10
//           "
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

//       {/* Видео ниже контента */}
//       <VideoSection />

//       {/* Глобальные стили эффектов */}
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

//         .sparkle,
//         .sparkle-delay {
//           box-shadow: 0 0 6px rgba(253, 224, 71, 0.75),
//             0 0 12px rgba(245, 197, 24, 0.55);
//           animation: sparkle-pop 1.8s ease-in-out infinite;
//         }
//         .sparkle-delay { animation-delay: 0.7s; }
//         @keyframes sparkle-pop {
//           0%, 100% { transform: scale(0.6); opacity: 0.8; }
//           50%     { transform: scale(1.15); opacity: 1; }
//         }

//         .stardust {
//           width: 72px;
//           height: 28px;
//           background:
//             radial-gradient(2px 2px at 12% 40%, rgba(253,224,71,0.9) 0, rgba(253,224,71,0) 65%),
//             radial-gradient(1.6px 1.6px at 48% 62%, rgba(255,241,175,0.95) 0, rgba(255,241,175,0) 65%),
//             radial-gradient(1.8px 1.8px at 78% 38%, rgba(255,230,120,0.9) 0, rgba(255,230,120,0) 65%);
//           filter: drop-shadow(0 0 6px rgba(253, 224, 71, 0.55));
//           animation: dust-float 3.6s ease-in-out infinite;
//           opacity: 0.85;
//         }
//         @keyframes dust-float {
//           0%, 100% { transform: translateY(0) translateX(0); opacity: 0.85; }
//           50%      { transform: translateY(-4px) translateX(2px); opacity: 1; }
//         }
//       `}</style>
//     </PageShell>
//   );
// }

// /* Оборачиваем в Suspense */
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

// import React, { useState, useEffect, Suspense, useRef, useCallback, JSX } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { User, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';

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

// /* -------------------- Карточка мастера (с золотым всплеском) -------------------- */
// function MasterCard({
//   master,
//   index,
//   onSelect,
// }: {
//   master: Master;
//   index: number;
//   onSelect: (id: string) => void;
// }) {
//   // локальное состояние для мобайл-ripple
//   const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

//   const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
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
//       transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
//       onPointerDown={handlePointerDown}
//       whileTap={{ scale: 0.985 }}
//       onClick={() => onSelect(master.id)}
//       className="
//         group relative cursor-pointer rounded-3xl border border-white/15
//         bg-black/30 backdrop-blur-sm p-6 md:p-8 text-left transition-all duration-300
//         hover:border-amber-500/50 hover:bg-black/40 hover:shadow-[0_0_40px_rgba(245,197,24,0.25)]
//         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
//         active:bg-black/50 active:border-amber-400/50
//         w-full max-w-[720px] xl:max-w-[880px] xl:mx-auto
//       "
//     >
//       {/* Золотой всплеск (мобилка) */}
//       {ripple && (
//         <motion.span
//           key={ripple.id}
//           className="md:hidden pointer-events-none absolute rounded-full"
//           style={{
//             left: ripple.x,
//             top: ripple.y,
//             width: 12,
//             height: 12,
//             translate: '-6px -6px',
//             background:
//               'radial-gradient(circle, rgba(255,215,0,0.50) 0%, rgba(253,224,71,0.35) 30%, rgba(245,197,24,0.22) 55%, rgba(245,197,24,0.12) 70%, rgba(0,0,0,0) 80%)',
//             filter: 'blur(0.5px)',
//             zIndex: 0,
//           }}
//           initial={{ scale: 0, opacity: 0.95 }}
//           animate={{ scale: 22, opacity: 0 }}
//           transition={{ duration: 0.7, ease: 'easeOut' }}
//         />
//       )}

//       {/* свечение по ховеру (десктоп) */}
//       <div
//         className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
//         style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.35), rgba(253,224,71,0.35))' }}
//       />

//       <div className="relative z-[1] flex items-center gap-5 md:gap-6">
//         <div className="relative">
//           {master.avatarUrl ? (
//             <span className="block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//               <Image
//                 src={master.avatarUrl}
//                 alt={master.name}
//                 width={80}
//                 height={80}
//                 sizes="(max-width:768px) 64px, 80px"
//                 className="h-full w-full object-cover"
//               />
//             </span>
//           ) : (
//             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//               <User className="w-8 h-8 md:w-10 md:h-10 text-black" />
//             </div>
//           )}
//           <div className="absolute -top-1 -right-1">
//             <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
//           </div>
//         </div>

//         <div className="flex-1 min-w-0">
//           <h3 className="text-xl md:text-2xl font-extrabold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-400 transition-colors">
//             {master.name}
//           </h3>
//           <p className="text-white/75 text-xs md:text-sm">Нажмите, чтобы выбрать</p>
//         </div>

//         <ChevronRight className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-white/50 transition-all group-hover:text-amber-400 group-hover:translate-x-2" />
//       </div>
//     </motion.button>
//   );
// }

// /* ----------------------------------- Page ----------------------------------- */
// function MasterInner(): React.JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params]
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
//     return () => { cancelled = true; };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append('s', id));
//     qs.set('m', masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   const CardSkeleton = ({ count = 4 }: { count?: number }) => (
//     <div className="grid md:grid-cols-2 gap-6 xl:grid-cols-1 xl:place-items-center">
//       {Array.from({ length: count }).map((_, i) => (
//         // eslint-disable-next-line react/no-array-index-key
//         <motion.div
//           key={i}
//           initial={{ opacity: 0, y: 10, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ delay: i * 0.08 }}
//           className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 w-full max-w-[720px] xl:max-w-[880px] xl:mx-auto"
//         >
//           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-yellow-500/0 animate-pulse" />
//           <div className="flex items-center gap-6">
//             <div className="rounded-full bg-white/10 w-20 h-20" />
//             <div className="flex-1 space-y-3">
//               <div className="h-5 w-1/2 rounded bg-white/10" />
//               <div className="h-4 w-2/3 rounded bg-white/10" />
//             </div>
//             <div className="h-8 w-8 rounded bg-white/10" />
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );

//   const Header = (): JSX.Element => (
//     <div
//       className="
//         fixed top-0 inset-x-0 z-40
//         bg-black/40 backdrop-blur-md border-b border-white/10
//         shadow-[0_10px_40px_rgba(0,0,0,0.45)]
//       "
//     >
//       <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//       </div>
//     </div>
//   );

//   const PageShell = ({ children }: { children: React.ReactNode }) => (
//     <div className="min-h-screen bg-black text-white">
//       <Header />
//       {/* отступ от закреплённого хедера */}
//       <div className="pt-[92px] md:pt-[100px]">{children}</div>
//     </div>
//   );

//   if (serviceIds.length === 0) {
//     return (
//       <PageShell>
//         <div className="flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="text-center max-w-md"
//           >
//             <div className="text-5xl md:text-6xl mb-6">⚠️</div>
//             <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
//               Услуги не выбраны
//             </h2>
//             <p className="text-white/80 mb-8">Пожалуйста, сначала выберите услуги.</p>
//             <button
//               onClick={() => router.push('/booking/services')}
//               className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] hover:scale-105 transition-all duration-300"
//             >
//               Выбрать услуги
//             </button>
//           </motion.div>
//         </div>
//       </PageShell>
//     );
//   }

//   if (loading) {
//     return (
//       <PageShell>
//         <div className="flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
//             <div className="flex items-center justify-center mb-8">
//               <motion.div
//                 initial={{ rotate: 0 }}
//                 animate={{ rotate: 360 }}
//                 transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
//                 className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//               />
//             </div>
//             <CardSkeleton count={4} />
//             <p className="mt-8 text-center text-white/80 font-medium">Загрузка мастеров…</p>
//           </motion.div>
//         </div>
//       </PageShell>
//     );
//   }

//   if (error) {
//     return (
//       <PageShell>
//         <div className="flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
//             <div className="text-6xl mb-6">❌</div>
//             <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-3">Ошибка</h2>
//             <p className="text-white/80 mb-8">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//             >
//               Попробовать снова
//             </button>
//           </motion.div>
//         </div>
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       {/* Заголовок */}
//       <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 24 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center mb-10 md:mb-14 lg:mb-16"
//         >
//           {/* капсула — отодвинута от хедера */}
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
//             className="inline-block mb-5 md:mb-6 mt-6 md:mt-8 lg:mt-10"
//           >
//             <div className="relative">
//               <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 to-yellow-500/40 rounded-full blur-xl opacity-60 animate-pulse" />
//               <div className="relative bg-gradient-to-r from-amber-500/60 to-yellow-500/60 text-black/90 px-5 md:px-8 py-2.5 md:py-3 rounded-full font-bold flex items-center gap-2 shadow-lg backdrop-blur-md border border-white/15">
//                 <User className="w-4 h-4 md:w-5 md:h-5 text-black/80" />
//                 <span className="text-sm md:text-base tracking-wide">Шаг 2 — Выбор мастера</span>
//               </div>
//             </div>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="
//               text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//               font-serif italic leading-tight lg:whitespace-nowrap
//               mb-3 md:mb-4 text-transparent bg-clip-text
//               bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//               drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//               lg:bg-gradient-to-r lg:from-[#7CFFFB] lg:via-[#22D3EE] lg:to-[#7CFFFB]
//               lg:drop-shadow-[0_0_22px_rgba(34,211,238,0.6)]
//               xl:bg-gradient-to-r xl:from-[#F5C518]/90 xl:via-[#FFD166]/90 xl:to-[#F5C518]/90
//               xl:drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//             "
//           >
//             Выбор мастера
//           </motion.h1>

//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.35 }}
//             className="text-base md:text-lg text-white/85 max-w-2xl mx-auto font-light"
//           >
//             Выберите мастера для ваших услуг
//           </motion.p>
//         </motion.div>
//       </div>

//       {/* Сетка карточек мастеров */}
//       {masters.length > 0 && (
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-24 md:mb-20 xl:grid-cols-1 xl:place-items-center">
//             <AnimatePresence mode="popLayout">
//               {masters.map((m, i) => (
//                 <MasterCard key={m.id} master={m} index={i} onSelect={selectMaster} />
//               ))}
//             </AnimatePresence>
//           </div>
//         </div>
//       )}

//       {/* Кнопка «назад» — фикс у низа на мобилке, в потоке на >=lg */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.2 }}
//         className="
//           fixed inset-x-0 bottom-2 z-20 px-4
//           sm:bottom-3 sm:px-6
//           lg:static lg:inset-auto lg:bottom-auto lg:z-auto lg:px-0
//         "
//         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
//       >
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <button
//             type="button"
//             onClick={() => router.push('/booking/services')}
//             className="inline-flex items-center gap-2 text-white/85 hover:text-amber-400 font-medium transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Вернуться к выбору услуг
//           </button>
//         </div>
//       </motion.div>

//       {/* Видео-блок (не фиксируется, просто секция ниже контента) */}
//       <VideoSection />
//     </PageShell>
//   );
// }

// /** Отдельная секция с видео: не фиксируется, можно легко регулировать кадр. */
// function VideoSection(): React.JSX.Element {
//   const [ready, setReady] = useState<boolean>(false);
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const handleCanPlay = useCallback(() => setReady(true), []);

//   useEffect(() => {
//     const v = videoRef.current;
//     if (!v) return;
//     const play = async () => {
//       try { await v.play(); } catch { /* ignore */ }
//     };
//     void play();
//   }, []);

//   return (
//     <section className="mt-12 md:mt-16 xl:mt-20">
//       <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//         <div className="relative w-full aspect-[16/9] md:aspect-[21/9] 2xl:h-[720px] overflow-hidden rounded-2xl border border-white/10">
//           <video
//             ref={videoRef}
//             className="
//               absolute inset-0 w-full h-full
//               object-contain 2xl:object-cover
//               /* Регулировка видимой зоны (чем больше второй %, тем ниже кадр) */
//               object-[50%_85%] lg:object-[50%_95%] xl:object-[50%_102%] 2xl:object-[50%_96%]
//               transition-[object-position] duration-500
//             "
//             autoPlay
//             muted
//             loop
//             playsInline
//             preload="metadata"
//             aria-hidden="true"
//             poster="/fallback-poster.jpg"
//             onCanPlay={handleCanPlay}
//           >
//             <source src="/SE-logo-video-master.webm" type="video/webm" />
//             <source src="/SE-logo-video-master.mp4" type="video/mp4" />
//           </video>

//           {/* мягкое затемнение для стиля */}
//           <div className="absolute inset-0 bg-black/20 md:bg-black/15" />

//           {/* Постер, пока видео не готово */}
//           <AnimatePresence>
//             {!ready && (
//               <motion.div
//                 key="posterOverlay"
//                 initial={{ opacity: 1 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.45 }}
//                 className="absolute inset-0 flex items-center justify-center"
//                 style={{
//                   background:
//                     'radial-gradient(900px 540px at 50% 72%, rgba(253,224,71,0.10), rgba(0,0,0,0) 60%)',
//                 }}
//               >
//                 <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0)_40%,_rgba(0,0,0,0.32)_100%)]" />
//                 <Image
//                   src="/fallback-poster.jpg"
//                   alt="Salon Elen"
//                   width={960}
//                   height={540}
//                   sizes="(max-width: 1024px) 90vw, 960px"
//                   className="relative rounded-2xl shadow-2xl shadow-yellow-500/10"
//                   priority
//                 />
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </section>
//   );
// }

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

// import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { User, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';

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

// function MasterInner(): React.JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
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
//     return () => { cancelled = true; };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append('s', id));
//     qs.set('m', masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   const CardSkeleton = ({ count = 4 }: { count?: number }) => (
//     <div className="grid md:grid-cols-2 gap-6 xl:grid-cols-1 xl:place-items-center">
//       {Array.from({ length: count }).map((_, i) => (
//         // eslint-disable-next-line react/no-array-index-key
//         <motion.div
//           key={i}
//           initial={{ opacity: 0, y: 10, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ delay: i * 0.08 }}
//           className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 w-full max-w-[720px] xl:max-w-[880px] xl:mx-auto"
//         >
//           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-yellow-500/0 animate-pulse" />
//           <div className="flex items-center gap-6">
//             <div className="rounded-full bg-white/10 w-20 h-20" />
//             <div className="flex-1 space-y-3">
//               <div className="h-5 w-1/2 rounded bg-white/10" />
//               <div className="h-4 w-2/3 rounded bg-white/10" />
//             </div>
//             <div className="h-8 w-8 rounded bg-white/10" />
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );

//   const Shell = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
//     <div className="min-h-screen relative overflow-visible">
//       {/* Десктопный фикс-фон (только ≥ lg) */}
//       <FixedBgVideoDesktop />

//       {/* Фикс-хедер */}
//       <div
//         className="
//           fixed top-0 inset-x-0 z-40
//           bg-black/40 backdrop-blur-md border-b border-white/10
//           shadow-[0_10px_40px_rgba(0,0,0,0.45)]
//         "
//       >
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8 py-3">
//           <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         </div>
//       </div>

//       {/* Контент под шапкой */}
//       <div className="relative z-10 text-white pt-[116px] md:pt-[132px] lg:pt-[144px]">{children}</div>
//     </div>
//   );

//   if (serviceIds.length === 0) {
//     return (
//       <Shell>
//         <div className="flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
//             <div className="text-5xl md:text-6xl mb-6">⚠️</div>
//             <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
//               Услуги не выбраны
//             </h2>
//             <p className="text-white/80 mb-8">Пожалуйста, сначала выберите услуги.</p>
//             <button
//               onClick={() => router.push('/booking/services')}
//               className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] hover:scale-105 transition-all duration-300"
//             >
//               Выбрать услуги
//             </button>
//           </motion.div>
//         </div>
//       </Shell>
//     );
//   }

//   if (loading) {
//     return (
//       <Shell>
//         <div className="flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
//             <div className="flex items-center justify-center mb-8">
//               <motion.div
//                 initial={{ rotate: 0 }}
//                 animate={{ rotate: 360 }}
//                 transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
//                 className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//               />
//             </div>
//             <CardSkeleton count={4} />
//             <p className="mt-8 text-center text-white/80 font-medium">Загрузка мастеров…</p>
//           </motion.div>
//         </div>
//       </Shell>
//     );
//   }

//   if (error) {
//     return (
//       <Shell>
//         <div className="flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
//             <div className="text-6xl mb-6">❌</div>
//             <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-3">Ошибка</h2>
//             <p className="text-white/80 mb-8">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//             >
//               Попробовать снова
//             </button>
//           </motion.div>
//         </div>
//       </Shell>
//     );
//   }

//   return (
//     <Shell>
//       <div className="pb-10 md:pb-16 lg:pb-24">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           {/* Заголовок */}
//           <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-12 lg:mb-14">
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
//               className="inline-block mb-5 md:mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 to-yellow-500/40 rounded-full blur-xl opacity-60 animate-pulse" />
//                 <div className="relative bg-gradient-to-r from-amber-500/60 to-yellow-500/60 text-black/90 px-5 md:px-8 py-2.5 md:py-3 rounded-full font-bold flex items-center gap-2 shadow-lg backdrop-blur-md border border-white/15">
//                   <User className="w-4 h-4 md:w-5 md:h-5 text-black/80" />
//                   <span className="text-sm md:text-base tracking-wide">Шаг 2 — Выбор мастера</span>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 12 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.25 }}
//               className="
//                 text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//                 font-serif italic leading-tight lg:whitespace-nowrap
//                 mb-3 md:mb-4 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//                 drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                 lg:bg-gradient-to-r lg:from-[#7CFFFB] lg:via-[#22D3EE] lg:to-[#7CFFFB]
//                 lg:drop-shadow-[0_0_22px_rgba(34,211,238,0.6)]
//                 xl:bg-gradient-to-r xl:from-[#F5C518]/90 xl:via-[#FFD166]/90 xl:to-[#F5C518]/90
//                 xl:drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//               "
//             >
//               Выбор мастера
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.35 }}
//               className="text-base md:text-lg text-white/85 max-w-2xl mx-auto font-light"
//             >
//               Выберите мастера для ваших услуг
//             </motion.p>
//           </motion.div>

//           {/* Сетка карточек */}
//           {masters.length > 0 && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12 xl:grid-cols-1 xl:place-items-center">
//               <AnimatePresence mode="popLayout">
//                 {masters.map((master, index) => (
//                   <motion.button
//                     type="button"
//                     key={master.id}
//                     layout
//                     initial={{ opacity: 0, scale: 0.98, y: 18 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.96 }}
//                     transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
//                     onClick={() => selectMaster(master.id)}
//                     className="group relative cursor-pointer rounded-3xl border border-white/15 bg-black/30 backdrop-blur-sm p-6 md:p-8 text-left transition-all duration-300 hover:border-amber-500/50 hover:bg-black/40 hover:shadow-[0_0_40px_rgba(245,197,24,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 w-full max-w-[720px] xl:max-w-[880px] xl:mx-auto"
//                   >
//                     <div
//                       className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
//                       style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.35), rgba(253,224,71,0.35))' }}
//                     />
//                     <div className="relative flex items-center gap-5 md:gap-6">
//                       <div className="relative">
//                         {master.avatarUrl ? (
//                           <span className="block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//                             <Image
//                               src={master.avatarUrl}
//                               alt={master.name}
//                               width={80}
//                               height={80}
//                               sizes="(max-width:768px) 64px, 80px"
//                               className="h-full w-full object-cover"
//                             />
//                           </span>
//                         ) : (
//                           <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//                             <User className="w-8 h-8 md:w-10 md:h-10 text-black" />
//                           </div>
//                         )}
//                         <div className="absolute -top-1 -right-1">
//                           <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
//                         </div>
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <h3 className="text-xl md:text-2xl font-extrabold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-400 transition-colors">
//                           {master.name}
//                         </h3>
//                         <p className="text-white/75 text-xs md:text-sm">Нажмите, чтобы выбрать</p>
//                       </div>

//                       <ChevronRight className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-white/50 transition-all group-hover:text-amber-400 group-hover:translate-x-2" />
//                     </div>
//                   </motion.button>
//                 ))}
//               </AnimatePresence>
//             </div>
//           )}
//         </div>

//         {/* Мобильное видео — обычный блок ниже карточки. НЕ fixed. */}
//         <InlineVideoMobile />

//         {/* Back link — мобилка фикс у низа; ≥lg — в потоке */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.2 }}
//           className="
//             fixed inset-x-0 bottom-2 z-20 px-4
//             sm:bottom-3 sm:px-6
//             lg:static lg:inset-auto lg:bottom-auto lg:z-auto lg:px-0
//           "
//           style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
//         >
//           <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
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
//       </div>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
//         .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease-in-out infinite; }
//         .bg-300% { background-size: 300% 300%; }
//         @media (prefers-reduced-motion: reduce) {
//           .animate-gradient { animation: none; }
//           video.bg-video { animation: none; }
//         }
//       `}</style>
//     </Shell>
//   );
// }

// /* =========================
//    ВИДЕО: МОБИЛЬНАЯ ВЕРСИЯ
//    ========================= */
// function InlineVideoMobile(): React.JSX.Element {
//   const [ready, setReady] = useState(false);
//   const ref = useRef<HTMLVideoElement | null>(null);
//   const onReady = useCallback(() => setReady(true), []);

//   useEffect(() => {
//     const v = ref.current;
//     if (!v) return;
//     const play = async () => { try { await v.play(); } catch {} };
//     void play();
//   }, []);

//   return (
//     <div className="block lg:hidden">
//       {/* отступ от блока мастера — регулируй mt-* */}
//       <div className="mt-8 px-4">
//         <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
//           {/* соотношение сторон — можно менять */}
//           <div className="aspect-[16/9] w-full">
//             <video
//               ref={ref}
//               className="bg-video h-full w-full object-contain object-[50%_90%]"
//               autoPlay
//               muted
//               loop
//               playsInline
//               preload="metadata"
//               aria-hidden="true"
//               poster="/fallback-poster.jpg"
//               onCanPlay={onReady}
//             >
//               <source src="/SE-logo-video-master.webm" type="video/webm" />
//               <source src="/SE-logo-video-master.mp4" type="video/mp4" />
//             </video>
//             {!ready && (
//               <div className="absolute inset-0 flex items-center justify-center bg-black/40">
//                 <Image
//                   src="/fallback-poster.jpg"
//                   alt="Salon Elen"
//                   width={960}
//                   height={540}
//                   className="w-full h-full object-cover opacity-70"
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    ВИДЕО: ДЕСКТОПНЫЙ ФОН (fixed)
//    ========================= */
// function FixedBgVideoDesktop(): React.JSX.Element {
//   const [ready, setReady] = useState(false);
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const onReady = useCallback(() => setReady(true), []);

//   useEffect(() => {
//     const v = videoRef.current;
//     if (!v) return;
//     const play = async () => { try { await v.play(); } catch {} };
//     void play();
//   }, []);

//   return (
//     <div
//       className="
//         hidden lg:block
//         fixed inset-x-0 bottom-0 z-0 pointer-events-none overflow-hidden
//         top-36 xl:top-48 2xl:top-56
//       "
//     >
//       <div className="absolute inset-0 bg-black" />
//       <video
//         ref={videoRef}
//         className="
//           bg-video absolute inset-0 h-full w-full
//           object-contain 2xl:object-cover
//           object-[50%_95%] xl:object-[50%_102%] 2xl:object-[50%_96%]
//           transition-transform duration-500
//         "
//         autoPlay
//         muted
//         loop
//         playsInline
//         preload="metadata"
//         aria-hidden="true"
//         poster="/fallback-poster.jpg"
//         onCanPlay={onReady}
//       >
//         <source src="/SE-logo-video-master.webm" type="video/webm" />
//         <source src="/SE-logo-video-master.mp4" type="video/mp4" />
//       </video>

//       <div className="absolute inset-0 bg-black/30 xl:bg-black/25" />

//       <AnimatePresence>
//         {!ready && (
//           <motion.div
//             key="posterOverlayDesk"
//             initial={{ opacity: 1 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.45 }}
//             className="absolute inset-0 flex items-center justify-center"
//             style={{ background: 'radial-gradient(900px 540px at 50% 72%, rgba(253,224,71,0.10), rgba(0,0,0,0) 60%)' }}
//           >
//             <Image
//               src="/fallback-poster.jpg"
//               alt="Salon Elen"
//               width={1200}
//               height={675}
//               className="relative rounded-2xl shadow-2xl shadow-yellow-500/10"
//               priority
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

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







//---------работал но новый апгрейт под новые реалии
// // src/app/booking/(steps)/master/page.tsx
// 'use client';

// import React, { useState, useEffect, Suspense, useRef, useCallback, JSX } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { User, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';

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

// function MasterInner(): JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
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
//     return () => { cancelled = true; };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append('s', id));
//     qs.set('m', masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   const CardSkeleton = ({ count = 4 }: { count?: number }) => (
//     <div className="grid md:grid-cols-2 gap-6 xl:grid-cols-1 xl:place-items-center">
//       {Array.from({ length: count }).map((_, i) => (
//         // eslint-disable-next-line react/no-array-index-key
//         <motion.div
//           key={i}
//           initial={{ opacity: 0, y: 10, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ delay: i * 0.08 }}
//           className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 w-full max-w-[720px] xl:max-w-[880px] xl:mx-auto"
//         >
//           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-yellow-500/0 animate-pulse" />
//           <div className="flex items-center gap-6">
//             <div className="rounded-full bg-white/10 w-20 h-20" />
//             <div className="flex-1 space-y-3">
//               <div className="h-5 w-1/2 rounded bg-white/10" />
//               <div className="h-4 w-2/3 rounded bg-white/10" />
//             </div>
//             <div className="h-8 w-8 rounded bg-white/10" />
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );

//   const Shell = ({ children }: { children: React.ReactNode }): JSX.Element => (
//     <div className="min-h-screen relative overflow-hidden">
//       <BackgroundVideo />
//       <div className="relative z-10 text-white">{children}</div>
//     </div>
//   );

//   if (serviceIds.length === 0) {
//     return (
//       <Shell>
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="pt-14 md:pt-20 lg:pt-24 flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
//             <div className="text-5xl md:text-6xl mb-6">⚠️</div>
//             <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
//               Услуги не выбраны
//             </h2>
//             <p className="text-white/80 mb-8">Пожалуйста, сначала выберите услуги.</p>
//             <button
//               onClick={() => router.push('/booking/services')}
//               className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] hover:scale-105 transition-all duration-300"
//             >
//               Выбрать услуги
//             </button>
//           </motion.div>
//         </div>
//       </Shell>
//     );
//   }

//   if (loading) {
//     return (
//       <Shell>
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="pt-14 md:pt-20 lg:pt-24 flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
//             <div className="flex items-center justify-center mb-8">
//               <motion.div
//                 initial={{ rotate: 0 }}
//                 animate={{ rotate: 360 }}
//                 transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
//                 className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//               />
//             </div>
//             <CardSkeleton count={4} />
//             <p className="mt-8 text-center text-white/80 font-medium">Загрузка мастеров…</p>
//           </motion.div>
//         </div>
//       </Shell>
//     );
//   }

//   if (error) {
//     return (
//       <Shell>
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="pt-14 md:pt-20 lg:pt-24 flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
//             <div className="text-6xl mb-6">❌</div>
//             <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-3">Ошибка</h2>
//             <p className="text-white/80 mb-8">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//             >
//               Попробовать снова
//             </button>
//           </motion.div>
//         </div>
//       </Shell>
//     );
//   }

//   return (
//     <Shell>
//       <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />

//       <div className="pt-14 md:pt-20 lg:pt-24 pb-16 md:pb-20 lg:pb-24 px-4">
//         {/* Ширина контейнера: без .container, чтобы не было внешнего ограничения.
//             Мобилка/лаптоп без изменений; на desktop — шире и по центру. */}
//         <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//           <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 md:mb-14 lg:mb-16">
//             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200 }} className="inline-block mb-5 md:mb-6">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 to-yellow-500/40 rounded-full blur-xl opacity-60 animate-pulse" />
//                 <div className="relative bg-gradient-to-r from-amber-500/60 to-yellow-500/60 text-black/90 px-5 md:px-8 py-2.5 md:py-3 rounded-full font-bold flex items-center gap-2 shadow-lg backdrop-blur-md border border-white/15">
//                   <User className="w-4 h-4 md:w-5 md:h-5 text-black/80" />
//                   <span className="text-sm md:text-base tracking-wide">Шаг 2 — Выбор мастера</span>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 12 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.25 }}
//               className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-serif italic leading-tight lg:whitespace-nowrap mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 drop-shadow-[0_0_18px_rgba(245,197,24,0.35)] lg:bg-gradient-to-r lg:from-[#7CFFFB] lg:via-[#22D3EE] lg:to-[#7CFFFB] lg:drop-shadow-[0_0_22px_rgba(34,211,238,0.6)] xl:bg-gradient-to-r xl:from-[#F5C518]/90 xl:via-[#FFD166]/90 xl:to-[#F5C518]/90 xl:drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]"
//             >
//               Выбор мастера
//             </motion.h1>

//             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-base md:text-lg text-white/85 max-w-2xl mx-auto font-light">
//               Выберите мастера для ваших услуг
//             </motion.p>
//           </motion.div>

//           {/* Сетка: desktop — одна колонка и центрирование элементов */}
//           {masters.length > 0 && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-24 md:mb-20 xl:grid-cols-1 xl:place-items-center">
//               <AnimatePresence mode="popLayout">
//                 {masters.map((master, index) => (
//                   <motion.button
//                     type="button"
//                     key={master.id}
//                     layout
//                     initial={{ opacity: 0, scale: 0.98, y: 18 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.96 }}
//                     transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
//                     onClick={() => selectMaster(master.id)}
//                     className="group relative cursor-pointer rounded-3xl border border-white/15 bg-black/30 backdrop-blur-sm p-6 md:p-8 text-left transition-all duration-300 hover:border-amber-500/50 hover:bg-black/40 hover:shadow-[0_0_40px_rgba(245,197,24,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 w-full max-w-[720px] xl:max-w-[880px] xl:mx-auto"
//                   >
//                     <div className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.35), rgba(253,224,71,0.35))' }} />
//                     <div className="relative flex items-center gap-5 md:gap-6">
//                       <div className="relative">
//                         {master.avatarUrl ? (
//                           <span className="block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//                             <Image src={master.avatarUrl} alt={master.name} width={80} height={80} sizes="(max-width:768px) 64px, 80px" className="h-full w-full object-cover" />
//                           </span>
//                         ) : (
//                           <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//                             <User className="w-8 h-8 md:w-10 md:h-10 text-black" />
//                           </div>
//                         )}
//                         <div className="absolute -top-1 -right-1">
//                           <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
//                         </div>
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <h3 className="text-xl md:text-2xl font-extrabold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-400 transition-colors">
//                           {master.name}
//                         </h3>
//                         <p className="text-white/75 text-xs md:text-sm">Нажмите, чтобы выбрать</p>
//                       </div>

//                       <ChevronRight className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-white/50 transition-all group-hover:text-amber-400 group-hover:translate-x-2" />
//                     </div>
//                   </motion.button>
//                 ))}
//               </AnimatePresence>
//             </div>
//           )}

//           {/* Back link: мобилка фикс у низа; >=lg — в потоке */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="fixed inset-x-0 bottom-2 z-20 px-4 sm:bottom-3 sm:px-6 lg:static lg:inset-auto lg:bottom-auto lg:z-auto lg:px-0"
//           >
//             <div className="mx-auto w-full max-w-screen-2xl px-4 xl:px-8">
//               <button
//                 type="button"
//                 onClick={() => router.push('/booking/services')}
//                 className="inline-flex items-center gap-2 text-white/85 hover:text-amber-400 font-medium transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//                 Вернуться к выбору услуг
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease-in-out infinite;
//         }
//         .bg-300% { background-size: 300% 300%; }
//         @media (prefers-reduced-motion: reduce) {
//           .animate-gradient { animation: none; }
//           video.bg-video { animation: none; }
//         }
//       `}</style>
//     </Shell>
//   );
// }

// /** Фон-видео. Регулировка вертикального кадрирования — процент во втором значении:
//  * object-[50%_90%] (ниже), object-[50%_70%] (выше), и т.д. */
// function BackgroundVideo(): JSX.Element {
//   const [ready, setReady] = useState<boolean>(false);
//   const videoRef = useRef<HTMLVideoElement | null>(null);

//   const handleCanPlay = useCallback(() => setReady(true), []);

//   useEffect(() => {
//     const v = videoRef.current;
//     if (!v) return;
//     const play = async (): Promise<void> => {
//       try { await v.play(); } catch { /* ignore */ }
//     };
//     void play();
//   }, []);

//   return (
//     <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
//       <div className="absolute inset-0 bg-black" />

//       <video
//         ref={videoRef}
//         className="bg-video absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_98%] xl:object-[50%_88%] 2xl:object-[50%_86%] transition-transform duration-500"
//         autoPlay
//         muted
//         loop
//         playsInline
//         preload="metadata"
//         aria-hidden="true"
//         poster="/fallback-poster.jpg"
//         onCanPlay={handleCanPlay}
//       >
//         <source src="/SE-logo-video-master.webm" type="video/webm" />
//         <source src="/SE-logo-video-master.mp4" type="video/mp4" />
//       </video>

//       <div className="absolute inset-0 bg-black/35 sm:bg-black/30 xl:bg-black/25" />

//       <AnimatePresence>
//         {!ready && (
//           <motion.div
//             key="posterOverlay"
//             initial={{ opacity: 1 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.45 }}
//             className="absolute inset-0 flex items-center justify-center"
//             style={{ background: 'radial-gradient(900px 540px at 50% 72%, rgba(253,224,71,0.10), rgba(0,0,0,0) 60%)' }}
//           >
//             <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0)_40%,_rgba(0,0,0,0.32)_100%)]" />
//             <Image
//               src="/fallback-poster.jpg"
//               alt="Salon Elen"
//               width={960}
//               height={540}
//               sizes="(max-width: 1024px) 70vw, 960px"
//               className="relative rounded-2xl shadow-2xl shadow-yellow-500/10"
//               priority
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export default function MasterPage(): JSX.Element {
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






//------------было хорошо для мобильной версии но плохо для Desktop
// // src/app/booking/(steps)/master/page.tsx
// 'use client';

// import React, { useState, useEffect, Suspense, useRef, useCallback, JSX } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { User, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';

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

// function MasterInner(): JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
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
//     return () => { cancelled = true; };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach((id) => qs.append('s', id));
//     qs.set('m', masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   const CardSkeleton = ({ count = 4 }: { count?: number }) => (
//     <div className="grid md:grid-cols-2 gap-6">
//       {Array.from({ length: count }).map((_, i) => (
//         // eslint-disable-next-line react/no-array-index-key
//         <motion.div
//           key={i}
//           initial={{ opacity: 0, y: 10, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ delay: i * 0.08 }}
//           className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8"
//         >
//           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-yellow-500/0 animate-pulse" />
//           <div className="flex items-center gap-6">
//             <div className="rounded-full bg-white/10 w-20 h-20" />
//             <div className="flex-1 space-y-3">
//               <div className="h-5 w-1/2 rounded bg-white/10" />
//               <div className="h-4 w-2/3 rounded bg-white/10" />
//             </div>
//             <div className="h-8 w-8 rounded bg-white/10" />
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );

//   const Shell = ({ children }: { children: React.ReactNode }): JSX.Element => (
//     <div className="min-h-screen relative overflow-hidden">
//       <BackgroundVideo />
//       <div className="relative z-10 text-white">{children}</div>
//     </div>
//   );

//   if (serviceIds.length === 0) {
//     return (
//       <Shell>
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="pt-14 md:pt-20 lg:pt-24 flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
//             <div className="text-5xl md:text-6xl mb-6">⚠️</div>
//             <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
//               Услуги не выбраны
//             </h2>
//             <p className="text-white/80 mb-8">Пожалуйста, сначала выберите услуги.</p>
//             <button
//               onClick={() => router.push('/booking/services')}
//               className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] hover:scale-105 transition-all duration-300"
//             >
//               Выбрать услуги
//             </button>
//           </motion.div>
//         </div>
//       </Shell>
//     );
//   }

//   if (loading) {
//     return (
//       <Shell>
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="pt-14 md:pt-20 lg:pt-24 flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl">
//             <div className="flex items-center justify-center mb-8">
//               <motion.div
//                 initial={{ rotate: 0 }}
//                 animate={{ rotate: 360 }}
//                 transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
//                 className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//               />
//             </div>
//             <CardSkeleton count={4} />
//             <p className="mt-8 text-center text-white/80 font-medium">Загрузка мастеров…</p>
//           </motion.div>
//         </div>
//       </Shell>
//     );
//   }

//   if (error) {
//     return (
//       <Shell>
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="pt-14 md:pt-20 lg:pt-24 flex items-center justify-center min-h-[70vh] px-4">
//           <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
//             <div className="text-6xl mb-6">❌</div>
//             <h2 className="text-2xl md:text-3xl font-bold text-red-400 mb-3">Ошибка</h2>
//             <p className="text-white/80 mb-8">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//             >
//               Попробовать снова
//             </button>
//           </motion.div>
//         </div>
//       </Shell>
//     );
//   }

//   return (
//     <Shell>
//       <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />

//       <div className="pt-14 md:pt-20 lg:pt-24 pb-16 md:pb-20 lg:pb-24 px-4">
//         <div className="container mx-auto max-w-5xl">
//           {/* Header */}
//           <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 md:mb-14 lg:mb-16">
//             {/* Полупрозрачная капсула */}
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
//               className="inline-block mb-5 md:mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 to-yellow-500/40 rounded-full blur-xl opacity-60 animate-pulse" />
//                 <div className="relative bg-gradient-to-r from-amber-500/60 to-yellow-500/60 text-black/90 px-5 md:px-8 py-2.5 md:py-3 rounded-full font-bold flex items-center gap-2 shadow-lg backdrop-blur-md border border-white/15">
//                   <User className="w-4 h-4 md:w-5 md:h-5 text-black/80" />
//                   <span className="text-sm md:text-base tracking-wide">Шаг 2 — Выбор мастера</span>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Заголовок: на laptop — неоновый циан; на desktop — тёплое золото */}
//             <motion.h1
//               initial={{ opacity: 0, y: 12 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.25 }}
//               className="
//                 text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//                 font-serif italic leading-tight
//                 lg:whitespace-nowrap
//                 mb-3 md:mb-4
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//                 drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                 lg:bg-gradient-to-r lg:from-[#7CFFFB] lg:via-[#22D3EE] lg:to-[#7CFFFB]
//                 lg:drop-shadow-[0_0_22px_rgba(34,211,238,0.6)]
//                 xl:bg-gradient-to-r xl:from-[#F5C518]/90 xl:via-[#FFD166]/90 xl:to-[#F5C518]/90
//                 xl:drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//               "
//             >
//               Выбор мастера
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.35 }}
//               className="text-base md:text-lg text-white/85 max-w-2xl mx-auto font-light"
//             >
//               Выберите мастера для ваших услуг
//             </motion.p>
//           </motion.div>

//           {/* Masters grid */}
//           {masters.length > 0 && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-24 md:mb-20">
//               <AnimatePresence mode="popLayout">
//                 {masters.map((master, index) => (
//                   <motion.button
//                     type="button"
//                     key={master.id}
//                     layout
//                     initial={{ opacity: 0, scale: 0.98, y: 18 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.96 }}
//                     transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
//                     onClick={() => selectMaster(master.id)}
//                     className="group relative cursor-pointer rounded-3xl border border-white/15 bg-black/30 backdrop-blur-sm p-6 md:p-8 text-left transition-all duration-300 hover:border-amber-500/50 hover:bg-black/40 hover:shadow-[0_0_40px_rgba(245,197,24,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
//                   >
//                     <div
//                       className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
//                       style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.35), rgba(253,224,71,0.35))' }}
//                     />
//                     <div className="relative flex items-center gap-5 md:gap-6">
//                       <div className="relative">
//                         {master.avatarUrl ? (
//                           <span className="block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//                             <Image
//                               src={master.avatarUrl}
//                               alt={master.name}
//                               width={80}
//                               height={80}
//                               sizes="(max-width:768px) 64px, 80px"
//                               className="h-full w-full object-cover"
//                             />
//                           </span>
//                         ) : (
//                           <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//                             <User className="w-8 h-8 md:w-10 md:h-10 text-black" />
//                           </div>
//                         )}
//                         <div className="absolute -top-1 -right-1">
//                           <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
//                         </div>
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <h3 className="text-xl md:text-2xl font-extrabold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-400 transition-colors">
//                           {master.name}
//                         </h3>
//                         <p className="text-white/75 text-xs md:text-sm">Нажмите, чтобы выбрать</p>
//                       </div>

//                       <ChevronRight className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 text-white/50 transition-all group-hover:text-amber-400 group-hover:translate-x-2" />
//                     </div>
//                   </motion.button>
//                 ))}
//               </AnimatePresence>
//             </div>
//           )}

//           {/* Back link — на laptop фиксируем почти у низа, на desktop обычный */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="
//     fixed inset-x-0 bottom-2 z-20           /* mobile: фиксирован низ экрана */
//     px-4                                   /* мобильные отступы слева/справа */
//     sm:bottom-3 sm:px-6                    /* чуть больше зазор на sm */
//     lg:static lg:inset-auto lg:bottom-auto /* >= lg: возвращаем в поток */
//     lg:z-auto lg:px-0
//   "
//           >
//             <div className="container mx-auto max-w-5xl px-0 lg:px-4">
//               <button
//                 type="button"
//                 onClick={() => router.push('/booking/services')}
//                 className="inline-flex items-center gap-2 text-white/85 hover:text-amber-400 font-medium transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//                 Вернуться к выбору услуг
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease-in-out infinite;
//         }
//         .bg-300% { background-size: 300% 300%; }
//         @media (prefers-reduced-motion: reduce) {
//           .animate-gradient { animation: none; }
//           video.bg-video { animation: none; }
//         }
//       `}</style>
//     </Shell>
//   );
// }

// /**
//  * ФОН-ВИДЕО
//  * >>> РЕГУЛИРОВАТЬ ВЫСОТУ ЗДЕСЬ <<<
//  * Меняй процент в object-[50%_XX%] для нужного брейкпоинта:
//  * - базовый/мобильный:       object-[50%_60%]
//  * - laptop (lg):             lg:object-[50%_68%]
//  * - desktop (xl):            xl:object-[50%_88%]
//  * - очень большие (2xl):     2xl:object-[50%_86%]
//  * Больше процент — ниже кадр.
//  */
// function BackgroundVideo(): JSX.Element {
//   const [ready, setReady] = useState<boolean>(false);
//   const videoRef = useRef<HTMLVideoElement | null>(null);

//   const handleCanPlay = useCallback(() => setReady(true), []);

//   useEffect(() => {
//     const v = videoRef.current;
//     if (!v) return;
//     const play = async (): Promise<void> => {
//       try { await v.play(); } catch { /* ignore */ }
//     };
//     void play();
//   }, []);

//   return (
//     <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
//       <div className="absolute inset-0 bg-black" />

//       <video
//         ref={videoRef}
//         className="
//           bg-video absolute inset-0 h-full w-full
//           object-contain 2xl:object-cover
//           object-[50%_90%] lg:object-[50%_98%] xl:object-[50%_88%] 2xl:object-[50%_86%]
//           transition-transform duration-500
//         "
//         autoPlay
//         muted
//         loop
//         playsInline
//         preload="metadata"
//         aria-hidden="true"
//         poster="/fallback-poster.jpg"
//         onCanPlay={handleCanPlay}
//       >
//         <source src="/SE-logo-video-master.webm" type="video/webm" />
//         <source src="/SE-logo-video-master.mp4" type="video/mp4" />
//       </video>

//       <div className="absolute inset-0 bg-black/35 sm:bg-black/30 xl:bg-black/25" />

//       <AnimatePresence>
//         {!ready && (
//           <motion.div
//             key="posterOverlay"
//             initial={{ opacity: 1 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.45 }}
//             className="absolute inset-0 flex items-center justify-center"
//             style={{ background: 'radial-gradient(900px 540px at 50% 72%, rgba(253,224,71,0.10), rgba(0,0,0,0) 60%)' }}
//           >
//             <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0)_40%,_rgba(0,0,0,0.32)_100%)]" />
//             <Image
//               src="/fallback-poster.jpg"
//               alt="Salon Elen"
//               width={960}
//               height={540}
//               sizes="(max-width: 1024px) 70vw, 960px"
//               className="relative rounded-2xl shadow-2xl shadow-yellow-500/10"
//               priority
//             />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export default function MasterPage(): JSX.Element {
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









// // src/app/booking/(steps)/master/page.tsx
// 'use client';

// import React, { useState, useEffect, Suspense, JSX } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { User, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';

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

// function MasterInner(): JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
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

//         const res = await fetch(`/api/masters?${qs.toString()}`, {
//           cache: 'no-store',
//         });

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

//   const CardSkeleton = ({ count = 4 }: { count?: number }) => (
//     <div className="grid md:grid-cols-2 gap-6">
//       {Array.from({ length: count }).map((_, i) => (
//         // eslint-disable-next-line react/no-array-index-key
//         <motion.div
//           key={i}
//           initial={{ opacity: 0, y: 10, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ delay: i * 0.08 }}
//           className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8"
//         >
//           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-yellow-500/0 animate-pulse" />
//           <div className="flex items-center gap-6">
//             <div className="rounded-full bg-white/10 w-20 h-20" />
//             <div className="flex-1 space-y-3">
//               <div className="h-5 w-1/2 rounded bg-white/10" />
//               <div className="h-4 w-2/3 rounded bg-white/10" />
//             </div>
//             <div className="h-8 w-8 rounded bg-white/10" />
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );

//   // ---------- Early states ----------
//   if (serviceIds.length === 0) {
//     return (
//       <div className="min-h-screen bg-black text-white">
//         <BackgroundVideo />
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />

//         <div className="relative pt-32 flex items-center justify-center min-h-[80vh]">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="text-center max-w-md px-6"
//           >
//             <div className="text-6xl mb-6">⚠️</div>
//             <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
//               Услуги не выбраны
//             </h2>
//             <p className="text-white/70 mb-8">Пожалуйста, сначала выберите услуги.</p>
//             <button
//               onClick={() => router.push('/booking/services')}
//               className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] hover:scale-105 transition-all duration-300"
//             >
//               Выбрать услуги
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white">
//         <BackgroundVideo />
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />

//         <div className="relative pt-32 flex items-center justify-center min-h-[70vh]">
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="w-full max-w-5xl px-4"
//           >
//             <div className="flex items-center justify-center mb-8">
//               <motion.div
//                 initial={{ rotate: 0 }}
//                 animate={{ rotate: 360 }}
//                 transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
//                 className="w-16 h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//               />
//             </div>
//             <CardSkeleton count={4} />
//             <p className="mt-8 text-center text-white/70 font-medium">Загрузка мастеров…</p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-black text-white">
//         <BackgroundVideo />
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />

//         <div className="relative pt-32 flex items-center justify-center min-h-[80vh]">
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center px-6"
//           >
//             <div className="text-6xl mb-6">❌</div>
//             <h2 className="text-2xl font-bold text-red-400 mb-3">Ошибка</h2>
//             <p className="text-white/80 mb-8">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//             >
//               Попробовать снова
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // ---------- Main UI ----------
//   return (
//     <div className="min-h-screen bg-black relative overflow-hidden text-white">
//       {/* Фон-видео (адаптивно) */}
//       <BackgroundVideo />

//       <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />

//       <div className="relative pt-32 pb-28 px-4">
//         <div className="container mx-auto max-w-5xl">
//           {/* Header / Step badge */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
//               className="inline-block mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl opacity-50 animate-pulse" />
//                 <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl">
//                   <User className="w-5 h-5" />
//                   <span>Шаг 2 — Выбор мастера</span>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="text-5xl md:text-6xl font-black mb-6 leading-tight"
//             >
//               <span className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent animate-gradient bg-300%">
//                 Выбор мастера
//               </span>
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.5 }}
//               className="text-lg text-white/80 max-w-2xl mx-auto font-light"
//             >
//               Выберите мастера для ваших услуг
//             </motion.p>
//           </motion.div>

//           {/* Empty state */}
//           {!masters.length && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-20"
//             >
//               <div className="text-6xl mb-6">😔</div>
//               <h3 className="text-2xl font-bold text-white mb-4">Нет доступных мастеров</h3>
//               <p className="text-white/80 mb-8 max-w-md mx-auto">
//                 К сожалению, для выбранных услуг сейчас нет подходящих мастеров.
//               </p>
//               <button
//                 onClick={() => router.push('/booking/services')}
//                 className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//               >
//                 Изменить услуги
//               </button>
//             </motion.div>
//           )}

//           {/* Masters grid */}
//           {masters.length > 0 && (
//             <div className="grid md:grid-cols-2 gap-8 mb-16">
//               <AnimatePresence mode="popLayout">
//                 {masters.map((master, index) => (
//                   <motion.button
//                     type="button"
//                     key={master.id}
//                     layout
//                     initial={{ opacity: 0, scale: 0.96, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.95 }}
//                     transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
//                     onClick={() => selectMaster(master.id)}
//                     className="group relative cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all duration-300 hover:border-amber-500/50 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(245,197,24,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
//                   >
//                     {/* Glow */}
//                     <div
//                       className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
//                       style={{ background: 'linear-gradient(135deg, rgba(245,197,24,0.35), rgba(253,224,71,0.35))' }}
//                     />

//                     <div className="relative flex items-center gap-6">
//                       <div className="relative">
//                         {master.avatarUrl ? (
//                           <span className="block w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//                             <Image
//                               src={master.avatarUrl}
//                               alt={master.name}
//                               width={80}
//                               height={80}
//                               sizes="80px"
//                               className="h-full w-full object-cover"
//                             />
//                           </span>
//                         ) : (
//                           <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//                             <User className="w-10 h-10 text-black" />
//                           </div>
//                         )}
//                         <div className="absolute -top-1 -right-1">
//                           <Sparkles className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
//                         </div>
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <h3 className="text-2xl font-extrabold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-400 transition-colors">
//                           {master.name}
//                         </h3>
//                         <p className="text-white/70 text-sm">Нажмите, чтобы выбрать</p>
//                       </div>

//                       <ChevronRight className="w-8 h-8 flex-shrink-0 text-white/40 transition-all group-hover:text-amber-400 group-hover:translate-x-2" />
//                     </div>
//                   </motion.button>
//                 ))}
//               </AnimatePresence>
//             </div>
//           )}

//           {/* Back link */}
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
//             <button
//               type="button"
//               onClick={() => router.push('/booking/services')}
//               className="inline-flex items-center gap-2 text-white/80 hover:text-amber-400 font-medium transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               Вернуться к выбору услуг
//             </button>
//           </motion.div>
//         </div>
//       </div>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300% {
//           background-size: 300% 300%;
//         }
//         /* Уважение к предпочтениям пользователя */
//         @media (prefers-reduced-motion: reduce) {
//           .animate-gradient { animation: none; }
//           video.bg-video { animation: none; }
//         }
//       `}</style>
//     </div>
//   );
// }

// /**
//  * Адаптивный видео-фон:
//  * Положите файлы в public:
//  *   /SE-logo-video-master.webm
//  *   /SE-logo-video-master.mp4
//  *   /fallback-poster.jpg  (можно экспортировать первым кадром)
//  * Видео заглушено, проигрывается inline и покрывает весь экран.
//  */
// function BackgroundVideo(): JSX.Element {
//   return (
//     <div className="fixed inset-0 -z-10">
//       {/* лёгкое затемнение поверх видео для читаемости контента */}
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.45),_rgba(0,0,0,0.85))]" />
//       <video
//         className="bg-video absolute inset-0 h-full w-full object-cover"
//         autoPlay
//         muted
//         loop
//         playsInline
//         preload="metadata"
//         aria-hidden="true"
//         poster="/fallback-poster.jpg"
//       >
//         <source src="/SE-logo-video-master.webm" type="video/webm" />
//         <source src="/SE-logo-video-master.mp4" type="video/mp4" />
//       </video>
//     </div>
//   );
// }

// export default function MasterPage(): JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-black flex items-center justify-center">
//           <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }



///---------------без видео
// // src/app/booking/(steps)/master/page.tsx
// 'use client';

// import React, { useState, useEffect, Suspense, JSX } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Image from 'next/image';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { User, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';

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

// function MasterInner(): JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
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

//         const res = await fetch(`/api/masters?${qs.toString()}`, {
//           cache: 'no-store',
//         });

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

//   // ---------- UI helpers ----------
//   const CardSkeleton = ({ count = 4 }: { count?: number }) => (
//     <div className="grid md:grid-cols-2 gap-6">
//       {Array.from({ length: count }).map((_, i) => (
//         <motion.div
//           // eslint-disable-next-line react/no-array-index-key
//           key={i}
//           initial={{ opacity: 0, y: 10, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ delay: i * 0.08 }}
//           className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8"
//         >
//           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-yellow-500/0 animate-pulse" />
//           <div className="flex items-center gap-6">
//             <div className="rounded-full bg-white/10 w-20 h-20" />
//             <div className="flex-1 space-y-3">
//               <div className="h-5 w-1/2 rounded bg-white/10" />
//               <div className="h-4 w-2/3 rounded bg-white/10" />
//             </div>
//             <div className="h-8 w-8 rounded bg-white/10" />
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );

//   // ---------- Early states ----------
//   if (serviceIds.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="relative pt-32 flex items-center justify-center min-h-[80vh]">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="text-center max-w-md px-6"
//           >
//             <div className="text-6xl mb-6">⚠️</div>
//             <h2 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
//               Услуги не выбраны
//             </h2>
//             <p className="text-white/60 mb-8">
//               Пожалуйста, сначала выберите услуги.
//             </p>
//             <button
//               onClick={() => router.push('/booking/services')}
//               className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:shadow-[0_0_40px_rgba(245,197,24,0.6)] hover:scale-105 transition-all duration-300"
//             >
//               Выбрать услуги
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="relative pt-32 flex items-center justify-center min-h-[70vh]">
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="w-full max-w-5xl px-4"
//           >
//             <div className="flex items-center justify-center mb-8">
//               <motion.div
//                 initial={{ rotate: 0 }}
//                 animate={{ rotate: 360 }}
//                 transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
//                 className="w-16 h-16 rounded-full border-4 border-yellow-500/30 border-t-yellow-500"
//               />
//             </div>
//             <CardSkeleton count={4} />
//             <p className="mt-8 text-center text-white/60 font-medium">
//               Загрузка мастеров…
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="relative pt-32 flex items-center justify-center min-h-[80vh]">
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center px-6"
//           >
//             <div className="text-6xl mb-6">❌</div>
//             <h2 className="text-2xl font-bold text-red-400 mb-3">Ошибка</h2>
//             <p className="text-white/70 mb-8">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//             >
//               Попробовать снова
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // ---------- Main UI ----------
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 relative overflow-hidden">
//       <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />

//       {/* Animated Background (в стиле страницы услуг) */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
//           transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
//           className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//         <motion.div
//           animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
//           transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
//           className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//       </div>

//       <div className="relative pt-32 pb-28 px-4">
//         <div className="container mx-auto max-w-5xl">
//           {/* Header / Step badge */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
//               className="inline-block mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl opacity-50 animate-pulse" />
//                 <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl">
//                   <User className="w-5 h-5" />
//                   <span>Шаг 2 — Выбор мастера</span>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="text-5xl md:text-6xl font-black mb-6 leading-tight"
//             >
//               <span className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent animate-gradient bg-300%">
//                 Найдите своего мастера
//               </span>
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.5 }}
//               className="text-lg text-gray-400 max-w-2xl mx-auto font-light"
//             >
//               Наши специалисты выполнят выбранные вами услуги на высоком уровне
//             </motion.p>
//           </motion.div>

//           {/* Empty state */}
//           {!masters.length && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-20"
//             >
//               <div className="text-6xl mb-6">😔</div>
//               <h3 className="text-2xl font-bold text-white mb-4">Нет доступных мастеров</h3>
//               <p className="text-white/60 mb-8 max-w-md mx-auto">
//                 К сожалению, для выбранных услуг сейчас нет подходящих мастеров.
//               </p>
//               <button
//                 onClick={() => router.push('/booking/services')}
//                 className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_30px_rgba(245,197,24,0.45)] hover:scale-105 transition-all duration-300"
//               >
//                 Изменить услуги
//               </button>
//             </motion.div>
//           )}

//           {/* Masters grid */}
//           {masters.length > 0 && (
//             <div className="grid md:grid-cols-2 gap-8 mb-16">
//               <AnimatePresence mode="popLayout">
//                 {masters.map((master, index) => (
//                   <motion.button
//                     type="button"
//                     key={master.id}
//                     layout
//                     initial={{ opacity: 0, scale: 0.96, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.95 }}
//                     transition={{ delay: index * 0.06, type: 'spring', stiffness: 260, damping: 26 }}
//                     onClick={() => selectMaster(master.id)}
//                     className="group relative cursor-pointer rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all duration-300 hover:border-amber-500/50 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(245,197,24,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
//                   >
//                     {/* Glow */}
//                     <div
//                       className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
//                       style={{ background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.35), rgba(253, 224, 71, 0.35))' }}
//                     />

//                     <div className="relative flex items-center gap-6">
//                       <div className="relative">
//                         {master.avatarUrl ? (
//                           <span className="block w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//                             <Image
//                               src={master.avatarUrl}
//                               alt={master.name}
//                               width={80}
//                               height={80}
//                               sizes="80px"
//                               className="h-full w-full object-cover"
//                             />
//                           </span>
//                         ) : (
//                           <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-amber-400/60 transition-all">
//                             <User className="w-10 h-10 text-black" />
//                           </div>
//                         )}
//                         <div className="absolute -top-1 -right-1">
//                           <Sparkles className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
//                         </div>
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <h3 className="text-2xl font-extrabold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-yellow-400 transition-colors">
//                           {master.name}
//                         </h3>
//                         <p className="text-white/60 text-sm">Нажмите, чтобы выбрать</p>
//                       </div>

//                       <ChevronRight className="w-8 h-8 flex-shrink-0 text-white/30 transition-all group-hover:text-amber-400 group-hover:translate-x-2" />
//                     </div>
//                   </motion.button>
//                 ))}
//               </AnimatePresence>
//             </div>
//           )}

//           {/* Back link */}
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
//             <button
//               type="button"
//               onClick={() => router.push('/booking/services')}
//               className="inline-flex items-center gap-2 text-white/70 hover:text-amber-400 font-medium transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               Вернуться к выбору услуг
//             </button>
//           </motion.div>
//         </div>
//       </div>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300% {
//           background-size: 300% 300%;
//         }
//       `}</style>
//     </div>
//   );
// }

// export default function MasterPage(): JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
//           <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }




//------------работала но пробуем новый дизайн 03/11
// //src/app/booking/(steps)/master/page.tsx
// 'use client';

// import React, { useState, useEffect, Suspense } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter, useSearchParams } from 'next/navigation';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { User, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';

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

// function MasterInner() {
//   const router = useRouter();
//   const params = useSearchParams();

//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );

//   const [masters, setMasters] = useState<Master[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadMasters() {
//       if (serviceIds.length === 0) {
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         const qs = new URLSearchParams();
//         qs.set('serviceIds', serviceIds.join(','));
        
//         const res = await fetch(`/api/masters?${qs.toString()}`, { 
//           cache: 'no-store' 
//         });

//         if (!res.ok) {
//           throw new Error(`HTTP ${res.status}`);
//         }

//         const data = await res.json() as { masters: Master[] };

//         if (!cancelled) {
//           setMasters(data.masters ?? []);
//         }
//       } catch (e: unknown) {
//         if (!cancelled) {
//           const msg = e instanceof Error ? e.message : 'Не удалось загрузить мастеров';
//           setError(msg);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     void loadMasters();

//     return () => {
//       cancelled = true;
//     };
//   }, [serviceIds]);

//   const selectMaster = (masterId: string) => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     qs.set('m', masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   if (serviceIds.length === 0) {
//     return (
//       <div className="min-h-screen bg-black text-white">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
        
//         <div className="relative pt-32 flex items-center justify-center min-h-[80vh]">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="text-center max-w-md px-4"
//           >
//             <div className="text-6xl mb-6">⚠️</div>
//             <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//               Услуги не выбраны
//             </h2>
//             <p className="text-white/60 mb-8">
//               Пожалуйста, сначала выберите услуги
//             </p>
//             <button
//               onClick={() => router.push('/booking/services')}
//               className="px-8 py-4 rounded-full font-bold bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:shadow-[0_0_40px_rgba(255,215,0,0.7)] hover:scale-105 transition-all duration-300"
//             >
//               Выбрать услуги
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
        
//         <div className="relative pt-32 flex items-center justify-center min-h-[80vh]">
//           <div className="text-center">
//             <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
//             <p className="text-white/60">Загрузка мастеров...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-black text-white">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
        
//         <div className="relative pt-32 flex items-center justify-center min-h-[80vh]">
//           <div className="text-center px-4">
//             <div className="text-6xl mb-6">❌</div>
//             <h2 className="text-2xl font-bold text-red-400 mb-4">Ошибка</h2>
//             <p className="text-white/60 mb-8">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-8 py-4 rounded-full font-bold bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:scale-105 transition-all duration-300"
//             >
//               Попробовать снова
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white">
//       <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />

//       {/* Фоновые эффекты */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] animate-pulse"></div>
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
//       </div>

//       <div className="relative pt-32 pb-20 px-4">
//         <div className="container mx-auto max-w-5xl">
//           {/* Заголовок */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-12"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: 'spring' }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-6"
//             >
//               <User className="w-4 h-4 text-yellow-400" />
//               <span className="text-yellow-400 text-sm font-medium">Шаг 2</span>
//             </motion.div>
            
//             <h1 className="text-5xl md:text-6xl font-bold mb-4">
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
//                 Выбор мастера
//               </span>
//             </h1>
//             <p className="text-xl text-white/60">
//               Выберите мастера для ваших услуг
//             </p>
//           </motion.div>

//           {!masters.length && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-20"
//             >
//               <div className="text-6xl mb-6">😔</div>
//               <h3 className="text-2xl font-bold text-white mb-4">
//                 Нет доступных мастеров
//               </h3>
//               <p className="text-white/60 mb-8 max-w-md mx-auto">
//                 К сожалению, для выбранных услуг нет мастеров, которые могут выполнить все услуги.
//               </p>
//               <button
//                 onClick={() => router.push('/booking/services')}
//                 className="px-8 py-4 rounded-full font-bold bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:scale-105 transition-all duration-300"
//               >
//                 Изменить услуги
//               </button>
//             </motion.div>
//           )}

//           {masters.length > 0 && (
//             <div className="grid md:grid-cols-2 gap-6 mb-12">
//               <AnimatePresence mode="popLayout">
//                 {masters.map((master, index) => (
//                   <motion.div
//                     key={master.id}
//                     layout
//                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.9 }}
//                     transition={{ delay: index * 0.1 }}
//                     onClick={() => selectMaster(master.id)}
//                     className="group relative cursor-pointer bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-yellow-400/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all duration-300"
//                   >
//                     <div className="flex items-center gap-6">
//                       <div className="relative">
//                         {master.avatarUrl ? (
//                           <img
//                             src={master.avatarUrl}
//                             alt={master.name}
//                             className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-yellow-400/50 transition-all"
//                           />
//                         ) : (
//                           <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center ring-2 ring-white/10 group-hover:ring-yellow-400/50 transition-all">
//                             <User className="w-10 h-10 text-black" />
//                           </div>
//                         )}
//                         <div className="absolute -top-1 -right-1">
//                           <Sparkles className="w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
//                         </div>
//                       </div>
                      
//                       <div className="flex-1">
//                         <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-amber-600 transition-all mb-2">
//                           {master.name}
//                         </h3>
//                         <p className="text-white/60 text-sm">
//                           Нажмите для выбора
//                         </p>
//                       </div>

//                       <ChevronRight className="w-8 h-8 text-white/30 group-hover:text-yellow-400 group-hover:translate-x-2 transition-all" />
//                     </div>

//                     {/* Эффект свечения */}
//                     <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-600/0 group-hover:from-yellow-400/5 group-hover:to-amber-600/5 rounded-3xl transition-all duration-500 pointer-events-none"></div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>
//           )}

//           {/* Кнопка назад */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5 }}
//           >
//             <button
//               onClick={() => router.push('/booking/services')}
//               className="inline-flex items-center gap-2 text-white/60 hover:text-yellow-400 font-medium transition-colors"
//             >
//               <ArrowLeft className="w-5 h-5" />
//               Вернуться к выбору услуг
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function MasterPage() {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-black flex items-center justify-center">
//           <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }



//------------работал но старый дизайн 03/11
// //src/app/booking/(steps)/master/page.tsx
// 'use client';

// import * as React from 'react';
// import { JSX, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { User, ChevronRight } from 'lucide-react';

// /* =========================
//    Типы
// ========================= */

// type Master = {
//   id: string;
//   name: string;
//   avatarUrl?: string | null;
// };

// /* =========================
//    Внутренний компонент
// ========================= */

// function MasterInner(): JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   // Получаем service IDs из параметров URL
//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );

//   const [masters, setMasters] = React.useState<Master[]>([]);
//   const [loading, setLoading] = React.useState<boolean>(true);
//   const [error, setError] = React.useState<string | null>(null);

//   // Загрузка мастеров
//   React.useEffect(() => {
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
        
//         const res = await fetch(`/api/masters?${qs.toString()}`, { 
//           cache: 'no-store' 
//         });

//         if (!res.ok) {
//           throw new Error(`HTTP ${res.status}`);
//         }

//         const data = (await res.json()) as { masters: Master[] };

//         if (!cancelled) {
//           setMasters(data.masters ?? []);
//         }
//       } catch (e: unknown) {
//         if (!cancelled) {
//           const msg = e instanceof Error ? e.message : 'Не удалось загрузить мастеров';
//           setError(msg);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     void loadMasters();

//     return () => {
//       cancelled = true;
//     };
//   }, [serviceIds]);

//   // Переход к календарю с выбранным мастером
//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     qs.set('m', masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   // Если услуги не выбраны
//   if (serviceIds.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
//           <div className="text-6xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">
//             Услуги не выбраны
//           </h2>
//           <p className="text-gray-600 mb-6">
//             Пожалуйста, сначала выберите услуги
//           </p>
//           <Link
//             href="/booking/services"
//             className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
//           >
//             Выбрать услуги
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
//             <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
//               <User className="w-8 h-8" />
//               Выбор мастера
//             </h1>
//             <p className="text-blue-100 mt-2">
//               Выберите мастера для ваших услуг
//             </p>
//           </div>

//           <div className="p-6 md:p-8">
//             {loading && (
//               <div className="text-center py-12">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
//                 <p className="mt-4 text-gray-600">Загрузка мастеров…</p>
//               </div>
//             )}

//             {error && (
//               <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
//                 <p className="text-red-700 font-semibold mb-2">Ошибка</p>
//                 <p className="text-red-600">{error}</p>
//               </div>
//             )}

//             {!loading && !error && masters.length === 0 && (
//               <div className="text-center py-12">
//                 <div className="text-6xl mb-4">😔</div>
//                 <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                   Нет доступных мастеров
//                 </h3>
//                 <p className="text-gray-600 mb-6">
//                   К сожалению, для выбранных услуг нет мастеров, которые могут выполнить все услуги.
//                   Попробуйте выбрать другие услуги или оформите отдельные записи.
//                 </p>
//                 <Link
//                   href="/booking/services"
//                   className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
//                 >
//                   Изменить услуги
//                 </Link>
//               </div>
//             )}

//             {!loading && !error && masters.length > 0 && (
//               <div className="grid gap-4 md:grid-cols-2">
//                 {masters.map((master) => (
//                   <button
//                     key={master.id}
//                     onClick={() => selectMaster(master.id)}
//                     className="group relative bg-gray-50 rounded-xl p-6 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border-2 border-transparent hover:border-blue-300 transition-all duration-200 text-left"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="flex-shrink-0">
//                         {master.avatarUrl ? (
//                           <img
//                             src={master.avatarUrl}
//                             alt={master.name}
//                             className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all"
//                           />
//                         ) : (
//                           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all">
//                             <User className="w-8 h-8 text-white" />
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex-1">
//                         <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
//                           {master.name}
//                         </h3>
//                         <p className="text-sm text-gray-600 mt-1">
//                           Нажмите для выбора
//                         </p>
//                       </div>

//                       <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Навигация назад */}
//           <div className="border-t border-gray-200 p-6 md:p-8 bg-gray-50">
//             <Link
//               href="/booking/services"
//               className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
//             >
//               <svg 
//                 className="w-5 h-5" 
//                 fill="none" 
//                 stroke="currentColor" 
//                 viewBox="0 0 24 24"
//               >
//                 <path 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   strokeWidth={2} 
//                   d="M15 19l-7-7 7-7" 
//                 />
//               </svg>
//               Вернуться к выбору услуг
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    Обёртка
// ========================= */

// export default function MasterPage(): JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-8 shadow-xl">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Загрузка…</p>
//           </div>
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }



//--------------добавляем аватар
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import PremiumProgressBar from '@/components/PremiumProgressBar';

// // Типы из API
// interface MasterDto {
//   id: string;
//   name: string;
// }

// interface ApiResponse {
//   masters: MasterDto[];
//   defaultMasterId: string | null;
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// export default function MasterPage() {
//   const router = useRouter();
//   const [masters, setMasters] = useState<MasterDto[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedMaster, setSelectedMaster] = useState<string | null>(null);

//   // Загрузка мастеров из API
//   useEffect(() => {
//     const fetchMasters = async () => {
//       try {
//         setLoading(true);

//         // Получаем выбранные услуги из sessionStorage
//         const selectedServicesStr = sessionStorage.getItem('selectedServices');
//         const selectedServices = selectedServicesStr ? JSON.parse(selectedServicesStr) : [];

//         // Формируем URL с параметрами
//         const params = new URLSearchParams();
//         selectedServices.forEach((id: string) => {
//           params.append('serviceIds', id);
//         });

//         const response = await fetch(`/api/masters?${params.toString()}`);

//         if (!response.ok) {
//           throw new Error('Ошибка загрузки мастеров');
//         }

//         const data: ApiResponse = await response.json();
//         setMasters(data.masters);

//         // Автоматически выбираем первого мастера, если есть
//         if (data.defaultMasterId) {
//           setSelectedMaster(data.defaultMasterId);
//         }

//         setError(null);
//       } catch (err) {
//         console.error('Error fetching masters:', err);
//         setError('Не удалось загрузить мастеров');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMasters();
//   }, []);

//   const handleContinue = () => {
//     if (!selectedMaster) return;

//     // Сохраняем выбранного мастера
//     sessionStorage.setItem('selectedMaster', selectedMaster);
//     router.push('/booking/calendar');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="pt-32">
//           <div className="animate-pulse text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
//             Загрузка мастеров...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="pt-32 text-center">
//           <div className="text-2xl text-red-400 mb-4">❌ {error}</div>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-3 bg-cyan-400 text-black rounded-full font-medium"
//           >
//             Попробовать снова
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Progress Bar */}
//       <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />

//       {/* Фоновые эффекты */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
//         <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
//       </div>

//       {/* Основной контент */}
//       <div className="relative pt-32 pb-32 px-4">
//         <div className="container mx-auto max-w-7xl">

//           {/* Заголовок */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-12"
//           >
//             <h1 className="text-5xl md:text-6xl font-bold mb-4">
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600">
//                 Выберите мастера
//               </span>
//             </h1>
//             <p className="text-xl text-white/60">
//               Наши профессионалы создадут идеальный образ для вас
//             </p>
//           </motion.div>

//           {/* Опция "Любой мастер" */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="flex justify-center mb-12"
//           >
//             <motion.div
//               whileHover={{ scale: 1.02 }}
//               onClick={() => setSelectedMaster('any')}
//               className={`
//                 cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 max-w-md
//                 ${selectedMaster === 'any'
//                   ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.3)]'
//                   : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
//                 }
//               `}
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(147,51,234,0.5)]">
//                   🎲
//                 </div>
//                 <div className="flex-1">
//                   <div className="font-bold text-lg mb-1">Любой доступный мастер</div>
//                   <div className="text-white/60 text-sm">Ближайшее свободное время</div>
//                 </div>
//                 {selectedMaster === 'any' && (
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                   >
//                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//                       <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                       </svg>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* Сетка мастеров */}
//           {masters.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//               <AnimatePresence mode="popLayout">
//                 {masters.map((master, index) => {
//                   const isSelected = selectedMaster === master.id;

//                   return (
//                     <motion.div
//                       key={master.id}
//                       layout
//                       initial={{ opacity: 0, scale: 0.9 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       exit={{ opacity: 0, scale: 0.9 }}
//                       transition={{ delay: index * 0.05 }}
//                       onClick={() => setSelectedMaster(master.id)}
//                       className={`
//                         group relative cursor-pointer rounded-3xl overflow-hidden
//                         transition-all duration-500
//                         ${isSelected
//                           ? 'bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,212,255,0.3)]'
//                           : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
//                         }
//                       `}
//                     >
//                       {/* Контент карточки */}
//                       <div className="p-6">
//                         <div className="flex items-start gap-4 mb-4">
//                           {/* Аватар */}
//                           <div className={`
//                             w-20 h-20 rounded-full flex items-center justify-center text-4xl
//                             bg-gradient-to-br from-cyan-400 to-blue-600
//                             shadow-[0_0_20px_rgba(0,212,255,0.4)]
//                             ${isSelected ? 'scale-110' : ''}
//                             transition-all duration-300
//                           `}>
//                             👤
//                           </div>

//                           <div className="flex-1">
//                             <h3 className="text-2xl font-bold mb-1 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-600 transition-all duration-300">
//                               {master.name}
//                             </h3>
//                             <p className="text-white/60 text-sm">
//                               Профессиональный мастер
//                             </p>
//                           </div>

//                           {/* Чекбокс */}
//                           {isSelected && (
//                             <motion.div
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.5)]"
//                             >
//                               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                               </svg>
//                             </motion.div>
//                           )}
//                         </div>
//                       </div>

//                       {/* Эффект свечения при hover */}
//                       <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-blue-600/0 group-hover:from-cyan-400/5 group-hover:to-blue-600/5 transition-all duration-500 pointer-events-none"></div>
//                     </motion.div>
//                   );
//                 })}
//               </AnimatePresence>
//             </div>
//           ) : (
//             <div className="text-center py-20">
//               <div className="text-6xl mb-4">🔍</div>
//               <div className="text-2xl text-white/60 mb-2">Мастера не найдены</div>
//               <div className="text-white/40">Попробуйте выбрать другие услуги</div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Фиксированная нижняя панель */}
//       <AnimatePresence>
//         {selectedMaster && (
//           <motion.div
//             initial={{ y: 100, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 100, opacity: 0 }}
//             className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 p-6"
//           >
//             <div className="container mx-auto max-w-7xl flex items-center justify-between flex-wrap gap-4">
//               <div>
//                 <div className="text-sm text-white/60 mb-1">
//                   Выбранный мастер
//                 </div>
//                 <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
//                   {selectedMaster === 'any'
//                     ? 'Любой доступный мастер'
//                     : masters.find(m => m.id === selectedMaster)?.name
//                   }
//                 </div>
//               </div>

//               <button
//                 onClick={handleContinue}
//                 className="
//                   px-8 py-4 rounded-full font-bold text-lg
//                   bg-gradient-to-r from-cyan-400 to-blue-600
//                   text-black shadow-[0_0_30px_rgba(0,212,255,0.5)]
//                   hover:shadow-[0_0_40px_rgba(0,212,255,0.7)]
//                   hover:scale-105
//                   transition-all duration-300
//                   flex items-center gap-2
//                 "
//               >
//                 Продолжить
//                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
