// src/app/booking/payment/PaymentPageClient.tsx
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import PremiumProgressBar from "@/components/PremiumProgressBar";
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
import { createSalonAppointmentCalendarLink } from "@/utils/googleCalendar";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  ShieldCheck,
  Scissors,
  CheckCircle2,
  AlertCircle,
  X,
  Crown,
  Check,
  Clock3,
  MapPin,
  User2,
  Calendar as CalendarIcon,
} from "lucide-react";

// Динамически импортируем Ballpit с отключением SSR
const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

type PaymentMethod = "onsite" | "online_soon";

const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
  { id: "services", label: "Услуга", icon: "✨" },
  { id: "master", label: "Мастер", icon: "👤" },
  { id: "calendar", label: "Дата", icon: "📅" },
  { id: "client", label: "Данные", icon: "📝" },
  { id: "verify", label: "Проверка", icon: "✓" },
  { id: "payment", label: "Оплата", icon: "💳" },
];

/* ===================== Floating Particles - PREMIUM VERSION ===================== */
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

function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
      {/* СЛОЙ 1: Анимированный фон (BookingAnimatedBackground) */}
      <BookingAnimatedBackground />
      
      {/* СЛОЙ 2: Floating Particles */}
      <FloatingParticles />

      {/* СЛОЙ 3: Премиальный фон с радиальными градиентами */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
      </div>

      {/* СЛОЙ 4: 3D Ballpit - ИНТЕРАКТИВНЫЕ ШАРЫ НА ЗАДНЕМ ФОНЕ */}
      <Ballpit
        count={50}
        gravity={0}
        friction={0.9995}
        wallBounce={0.98}
        maxVelocity={0.10}
        minSize={0.4}
        maxSize={0.8}
        followCursor={true}
        colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
      />

      {/* Неоновая верхняя линия */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

      {/* Хедер с прогресс-баром */}
      <header className="booking-header pointer-events-auto fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
          <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
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
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

function VideoSection(): React.JSX.Element {
  return (
    <section className="pointer-events-auto relative z-10 py-10 sm:py-12">
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

export default function PaymentPageClient(): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  const appointmentId = searchParams.get("appointment") ?? "";

  const [selectedMethod, setSelectedMethod] =
    React.useState<PaymentMethod>("onsite");
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  // Обработчик для добавления в Google Calendar
  const handleAddToGoogleCalendar = async () => {
    try {
      // Получаем реальные данные appointment из API
      const response = await fetch(`/api/appointments/${appointmentId}`);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные записи');
      }
      
      const appointment = await response.json();
      
      // Создаём ссылку на Google Calendar с РЕАЛЬНЫМИ данными
      const calendarLink = createSalonAppointmentCalendarLink({
        serviceTitle: appointment.serviceTitle,     // ✅ Реальная услуга
        masterName: appointment.masterName,         // ✅ Реальный мастер
        dateIso: appointment.startAt,               // ✅ Реальная дата начала
        timeIso: appointment.startAt,               // ✅ Реальное время начала
        duration: appointment.duration,             // ✅ Реальная длительность
        appointmentId: appointmentId,
      });
      
      // Открываем Google Calendar в новой вкладке
      window.open(calendarLink, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Ошибка при создании события календаря:', error);
      alert('Не удалось создать событие в календаре. Попробуйте позже.');
    }
  };

  const handleConfirm = (): void => {
    if (!appointmentId) {
      setError(
        "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
      );
      return;
    }

    setError(null);
    setShowModal(true);
  };

  if (!appointmentId) {
    return (
      <PageShell>
        <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
              <div className="space-y-2">
                <h1 className="text-lg font-semibold text-red-100">
                  Ошибка при переходе к оплате
                </h1>
                <p className="text-sm text-red-100/80">
                  Мы не смогли найти идентификатор записи. Возможно, ссылка
                  устарела или шаг подтверждения email был пропущен.
                </p>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Вернуться к записи
                </Link>
              </div>
            </div>
          </div>
        </main>
        <VideoSection />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="pointer-events-auto relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
        {/* ПРЕМИУМ ЗАГОЛОВОК */}
        <div className="relative z-10 flex w-full flex-col items-center text-center pt-8">
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
                Шаг 6 — Оплата и финальное подтверждение
              </span>
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="brand-script relative mb-4 text-4xl font-bold italic leading-tight md:text-5xl lg:text-6xl"
            style={{
              color: '#FFFFFF',
              textShadow: `
                0 0 40px rgba(251,191,36,0.8),
                0 0 60px rgba(251,191,36,0.6),
                0 2px 8px rgba(0,0,0,0.9),
                0 4px 16px rgba(0,0,0,0.7)
              `,
            }}
          >
            Завершение записи
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="brand-script relative mx-auto max-w-3xl text-xl font-semibold italic tracking-wide md:text-2xl lg:text-3xl"
            style={{
              color: '#FF6EC7',
              textShadow: `
                0 0 20px rgba(255,110,199,0.8),
                0 0 30px rgba(255,110,199,0.5),
                0 2px 6px rgba(0,0,0,0.8),
                0 4px 12px rgba(0,0,0,0.6)
              `,
            }}
          >
            Выберите способ оплаты и подтвердите бронь
          </motion.p>

          {/* Appointment ID */}
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4 text-sm"
            style={{
              color: '#E5E7EB',
              textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
            }}
          >
            Номер записи:{" "}
            <span 
              className="font-mono font-semibold"
              style={{
                color: '#FCD34D',
                textShadow: '0 0 10px rgba(252,211,77,0.6), 0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {appointmentId}
            </span>
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

        {/* Два столбца: выбор оплаты + резюме */}
        <div className="relative z-10 mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10"
          >
            {/* ПРЕМИАЛЬНАЯ ОБЁРТКА */}
            <div className="relative z-10 rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-emerald-200/20 to-teal-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
              <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

              {/* ВНУТРЕННЯЯ КАРТОЧКА */}
              <div className="relative z-10 overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
                {/* Внутренние подсветки */}
                <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
                <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

                <div className="relative space-y-6">
                  {/* Заголовок секции */}
                  <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <CreditCard className="h-4 w-4 text-emerald-300" />
                    </span>
                    Способ оплаты
                  </h2>

                  {/* Методы оплаты */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Оплата в салоне */}
                    <motion.button
                      type="button"
                      onClick={() => {
                        setSelectedMethod("onsite");
                        setError(null);
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
                        selectedMethod === "onsite"
                          ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                          : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
                            <Wallet className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          </div>
                          <div>
                            <div className="font-bold text-white">Оплата в салоне</div>
                            <div className="text-xs text-slate-400">На месте</div>
                          </div>
                        </div>
                        {selectedMethod === "onsite" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                          <span>Наличные или карта в салоне</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                          <span>Без предоплаты</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                          <span>Оплата после услуги</span>
                        </li>
                      </ul>
                    </motion.button>

                    {/* Онлайн-оплата - скоро */}
                    <motion.button
                      type="button"
                      onClick={() => {
                        setSelectedMethod("online_soon");
                        setError(null);
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
                        selectedMethod === "online_soon"
                          ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
                          : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
                            <CreditCard className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                          </div>
                          <div>
                            <div className="font-bold text-white">Онлайн-оплата</div>
                            <div className="text-xs text-slate-400">Скоро</div>
                          </div>
                        </div>
                        {selectedMethod === "online_soon" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
                          >
                            <Check className="h-4 w-4 text-black" />
                          </motion.div>
                        )}
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        <li className="flex items-start gap-2">
                          <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
                          <span>Карта, Apple Pay, Google Pay</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
                          <span>В разработке</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
                          <span>Запись всё равно будет подтверждена</span>
                        </li>
                      </ul>
                    </motion.button>
                  </div>

                  {/* Инфо блок */}
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
                    <p className="flex items-center gap-2 font-bold text-white">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Как это работает?
                    </p>
                    <p className="text-sm text-slate-300">
                      Система уже создала запись в расписании салона. Оплата фиксируется
                      на стороне салона. Онлайн-оплата будет добавлена позже.
                    </p>
                  </div>

                  {/* Сообщения об ошибке */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
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

                  {/* Кнопка подтверждения */}
                  <div className="pt-2">
                    <motion.button
                      type="button"
                      onClick={handleConfirm}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Подтвердить запись
                    </motion.button>
                    <p className="mt-3 text-center text-xs text-slate-400">
                      Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона
                    </p>
                  </div>
                </div>

                {/* Нижняя линия */}
                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
              </div>
            </div>
          </motion.section>

          {/* ПРЕМИУМ РЕЗЮМЕ */}
          <motion.aside
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative z-10"
          >
            <div className="relative z-10 rounded-[32px] bg-gradient-to-br from-cyan-400/80 via-sky-200/20 to-blue-400/60 p-[1.5px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
              <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

              <div className="relative z-10 overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
                <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
                <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

                <div className="relative space-y-5">
                  <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                      <Scissors className="h-5 w-5 text-cyan-300" />
                    </span>
                    <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                      Резюме записи
                    </span>
                  </h3>

                  {/* Детали записи */}
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <User2 className="h-5 w-5 text-cyan-400" />
                      <span>Ваш визит в SalonElen</span>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                        <span>Услуга из записи (Appointment)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                        <span>Мастер из записи</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                        <span>Дата и время по ID: {appointmentId.slice(0, 8)}...</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
                        <span>Адрес салона</span>
                      </li>
                    </ul>
                  </div>

                  {/* Политика отмены */}
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                      <MapPin className="h-4 w-4 text-cyan-400" />
                      Политика отмены
                    </p>
                    <p className="text-sm text-slate-300">
                      Если вы не сможете прийти, пожалуйста, отмените запись заранее —
                      это позволит освободить время для других гостей салона.
                    </p>
                  </div>

                  <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
                    После запуска онлайн-оплаты здесь появится блок выбора платёжного
                    метода и статус платежа
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
              </div>
            </div>
          </motion.aside>
        </div>
      </main>

      {/* ПРЕМИУМ МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              key="modal-content"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="relative w-full max-w-lg"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Премиальная обёртка модалки */}
              <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
                <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

                <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
                  {/* Внутренние подсветки */}
                  <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
                  <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

                  {/* Кнопка закрытия */}
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="relative z-10 text-center">
                    {/* Success icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                    >
                      <CheckCircle2 className="h-10 w-10 text-emerald-300" />
                    </motion.div>

                    <h2 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-3xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] md:text-4xl">
                      Запись подтверждена!
                    </h2>

                    <p className="mb-8 text-base text-slate-200 md:text-lg">
                      Ваша запись успешно подтверждена. Оплата будет произведена в
                      салоне.
                    </p>

                    <div className="flex flex-col gap-3">
                      {/* Кнопка главной страницы */}
                      <Link
                        href="/"
                        className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-center font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
                      >
                        На главную страницу
                      </Link>

                      {/* НОВАЯ КНОПКА - Google Calendar */}
                      <motion.button
                        type="button"
                        onClick={handleAddToGoogleCalendar}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative w-full overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 px-6 py-3.5 text-center font-semibold text-white transition hover:border-blue-400/60 hover:from-blue-600/30 hover:via-blue-500/30 hover:to-blue-600/30"
                      >
                        {/* Анимированный градиент фона */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 transition-opacity group-hover:animate-[shimmer_2s_ease-in-out_infinite] group-hover:opacity-100" />
                        
                        <div className="relative flex items-center justify-center gap-2">
                          <CalendarIcon className="h-5 w-5" />
                          <span>Добавить в Google Calendar</span>
                        </div>
                      </motion.button>

                      {/* Кнопка новой записи */}
                      <Link
                        href="/booking"
                        className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
                      >
                        Сделать новую запись
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoSection />
    </PageShell>
  );
}




// // ----------работает, добавляю гугл календарь -----
// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import dynamic from 'next/dynamic';
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   Crown,
//   Check,
//   Clock3,
//   MapPin,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// /* ===================== Floating Particles - PREMIUM VERSION ===================== */
// function FloatingParticles() {
//   const [particles, setParticles] = React.useState<Array<{ x: number; y: number; id: number; color: string }>>([]);

//   React.useEffect(() => {
//     const colors = [
//       "bg-amber-400/30",
//       "bg-fuchsia-400/25",
//       "bg-sky-400/25",
//       "bg-emerald-400/25",
//       "bg-yellow-300/30",
//     ];
    
//     const newParticles = [...Array(30)].map((_, i) => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       id: i,
//       color: colors[Math.floor(Math.random() * colors.length)],
//     }));
//     setParticles(newParticles);
//   }, []);

//   if (particles.length === 0) return null;

//   return (
//     <div className="pointer-events-none absolute inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <motion.div
//           key={particle.id}
//           className={`absolute h-1 w-1 rounded-full ${particle.color}`}
//           initial={{ x: particle.x, y: particle.y, opacity: 0 }}
//           animate={{
//             x: [particle.x, Math.random() * window.innerWidth, particle.x],
//             y: [particle.y, Math.random() * window.innerHeight, particle.y],
//             scale: [1, 2, 1],
//             opacity: [0.3, 1, 0.3],
//           }}
//           transition={{
//             duration: Math.random() * 15 + 10,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* СЛОЙ 1: Анимированный фон (BookingAnimatedBackground) */}
//       <BookingAnimatedBackground />
      
//       {/* СЛОЙ 2: Floating Particles */}
//       <FloatingParticles />

//       {/* СЛОЙ 3: Премиальный фон с радиальными градиентами */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       {/* СЛОЙ 4: 3D Ballpit - ИНТЕРАКТИВНЫЕ ШАРЫ НА ЗАДНЕМ ФОНЕ */}
//       <Ballpit
//         count={50}  // Количество шаров
//         gravity={0}
//         friction={0.9995}  // Минимальное трение для плавного движения
//         wallBounce={0.98}  // Почти полное отражение от стенок
//         maxVelocity={0.10}  // Максимальная скорость шаров
//         minSize={0.4}  // Минимальный размер шара
//         maxSize={0.8}
//         followCursor={true}  // Шары следуют за курсором
//         colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
//       />

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header pointer-events-auto fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[84px] md:h-[96px]" />

//       {children}

//       <style jsx global>{`
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
        
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }

// function VideoSection(): React.JSX.Element {
//   return (
//     <section className="pointer-events-auto relative z-10 py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]"
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

// export default function PaymentPageClient(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [showModal, setShowModal] = React.useState(false);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//       );
//       return;
//     }

//     setError(null);
//     setShowModal(true);
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur-xl">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="pointer-events-auto relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* ПРЕМИУМ ЗАГОЛОВОК */}
//         <div className="relative z-10 flex w-full flex-col items-center text-center pt-8">
//           {/* Ultra Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-8"
//           >
//             <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
//             >
//               <Crown className="h-5 w-5 text-black drop-shadow-lg" />
//               <span className="font-serif text-base font-bold italic text-black drop-shadow-sm md:text-lg">
//                 Шаг 6 — Оплата и финальное подтверждение
//               </span>
//             </motion.div>
//           </motion.div>

//           {/* Title - НОВЫЙ КОНТРАСТНЫЙ ЦВЕТ */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="brand-script relative mb-4 text-4xl font-bold italic leading-tight md:text-5xl lg:text-6xl"
//             style={{
//               color: '#FFFFFF',
//               textShadow: `
//                 0 0 40px rgba(251,191,36,0.8),
//                 0 0 60px rgba(251,191,36,0.6),
//                 0 2px 8px rgba(0,0,0,0.9),
//                 0 4px 16px rgba(0,0,0,0.7)
//               `,
//             }}
//           >
//             Завершение записи
//           </motion.h1>

//           {/* Subtitle - НОВЫЙ ЯРКИЙ КОНТРАСТНЫЙ ЦВЕТ */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script relative mx-auto max-w-3xl text-xl font-semibold italic tracking-wide md:text-2xl lg:text-3xl"
//             style={{
//               color: '#FF6EC7',
//               textShadow: `
//                 0 0 20px rgba(255,110,199,0.8),
//                 0 0 30px rgba(255,110,199,0.5),
//                 0 2px 6px rgba(0,0,0,0.8),
//                 0 4px 12px rgba(0,0,0,0.6)
//               `,
//             }}
//           >
//             Выберите способ оплаты и подтвердите бронь
//           </motion.p>

//           {/* Appointment ID - НОВЫЙ СВЕТЛЫЙ ЦВЕТ */}
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-4 text-sm"
//             style={{
//               color: '#E5E7EB',
//               textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
//             }}
//           >
//             Номер записи:{" "}
//             <span 
//               className="font-mono font-semibold"
//               style={{
//                 color: '#FCD34D',
//                 textShadow: '0 0 10px rgba(252,211,77,0.6), 0 2px 4px rgba(0,0,0,0.8)',
//               }}
//             >
//               {appointmentId}
//             </span>
//           </motion.p>

//           {/* Декоративная линия */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ 
//               scaleX: [1, 1.5, 1],
//               opacity: [0.8, 1, 0.8],
//             }}
//             transition={{ 
//               scaleX: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//               opacity: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//             }}
//             className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] md:w-40"
//           />
//         </div>

//         {/* Два столбца: выбор оплаты + резюме */}
//         <div className="relative z-10 mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
//           {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
//           <motion.section
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="relative z-10"
//           >
//             {/* ПРЕМИАЛЬНАЯ ОБЁРТКА */}
//             <div className="relative z-10 rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-emerald-200/20 to-teal-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

//               {/* ВНУТРЕННЯЯ КАРТОЧКА */}
//               <div className="relative z-10 overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 {/* Внутренние подсветки */}
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

//                 <div className="relative space-y-6">
//                   {/* Заголовок секции */}
//                   <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
//                     <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
//                       <CreditCard className="h-4 w-4 text-emerald-300" />
//                     </span>
//                     Способ оплаты
//                   </h2>

//                   {/* Методы оплаты */}
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {/* Оплата в салоне */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("onsite");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "onsite"
//                           ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
//                             <Wallet className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Оплата в салоне</div>
//                             <div className="text-xs text-slate-400">На месте</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "onsite" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-white" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Наличные или карта в салоне</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Без предоплаты</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Оплата после услуги</span>
//                         </li>
//                       </ul>
//                     </motion.button>

//                     {/* Онлайн-оплата - скоро */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("online_soon");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "online_soon"
//                           ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
//                             <CreditCard className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Онлайн-оплата</div>
//                             <div className="text-xs text-slate-400">Скоро</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "online_soon" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-black" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Карта, Apple Pay, Google Pay</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>В разработке</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Запись всё равно будет подтверждена</span>
//                         </li>
//                       </ul>
//                     </motion.button>
//                   </div>

//                   {/* Инфо блок */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 font-bold text-white">
//                       <ShieldCheck className="h-4 w-4 text-emerald-400" />
//                       Как это работает?
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Система уже создала запись в расписании салона. Оплата фиксируется
//                       на стороне салона. Онлайн-оплата будет добавлена позже.
//                     </p>
//                   </div>

//                   {/* Сообщения об ошибке */}
//                   <AnimatePresence>
//                     {error && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl"
//                       >
//                         <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
//                         <span className="text-sm text-red-200">{error}</span>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {/* Кнопка подтверждения */}
//                   <div className="pt-2">
//                     <motion.button
//                       type="button"
//                       onClick={handleConfirm}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                     >
//                       <CheckCircle2 className="h-5 w-5" />
//                       Подтвердить запись
//                     </motion.button>
//                     <p className="mt-3 text-center text-xs text-slate-400">
//                       Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона
//                     </p>
//                   </div>
//                 </div>

//                 {/* Нижняя линия */}
//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.section>

//           {/* ПРЕМИУМ РЕЗЮМЕ */}
//           <motion.aside
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             className="relative z-10"
//           >
//             <div className="relative z-10 rounded-[32px] bg-gradient-to-br from-cyan-400/80 via-sky-200/20 to-blue-400/60 p-[1.5px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

//               <div className="relative z-10 overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

//                 <div className="relative space-y-5">
//                   <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
//                     <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
//                       <Scissors className="h-5 w-5 text-cyan-300" />
//                     </span>
//                     <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
//                       Резюме записи
//                     </span>
//                   </h3>

//                   {/* Детали записи */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <div className="flex items-center gap-2 text-sm font-semibold text-white">
//                       <User2 className="h-5 w-5 text-cyan-400" />
//                       <span>Ваш визит в SalonElen</span>
//                     </div>
//                     <ul className="space-y-2 text-sm text-slate-300">
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Услуга из записи (Appointment)</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Мастер из записи</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Дата и время по ID: {appointmentId.slice(0, 8)}...</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Адрес салона</span>
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Политика отмены */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
//                       <MapPin className="h-4 w-4 text-cyan-400" />
//                       Политика отмены
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Если вы не сможете прийти, пожалуйста, отмените запись заранее —
//                       это позволит освободить время для других гостей салона.
//                     </p>
//                   </div>

//                   <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
//                     После запуска онлайн-оплаты здесь появится блок выбора платёжного
//                     метода и статус платежа
//                   </div>
//                 </div>

//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       {/* ПРЕМИУМ МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             key="modal-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               key="modal-content"
//               initial={{ scale: 0.8, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ type: "spring", stiffness: 220, damping: 22 }}
//               className="relative w-full max-w-lg"
//               onClick={(event) => event.stopPropagation()}
//             >
//               {/* Премиальная обёртка модалки */}
//               <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
//                 <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

//                 <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                   {/* Внутренние подсветки */}
//                   <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
//                   <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

//                   {/* Кнопка закрытия */}
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>

//                   <div className="relative z-10 text-center">
//                     {/* Success icon */}
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                       className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
//                     >
//                       <CheckCircle2 className="h-10 w-10 text-emerald-300" />
//                     </motion.div>

//                     <h2 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-3xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] md:text-4xl">
//                       Запись подтверждена!
//                     </h2>

//                     <p className="mb-8 text-base text-slate-200 md:text-lg">
//                       Ваша запись успешно подтверждена. Оплата будет произведена в
//                       салоне.
//                     </p>

//                     <div className="flex flex-col gap-3">
//                       <Link
//                         href="/"
//                         className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-center font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                       >
//                         На главную страницу
//                       </Link>

//                       <Link
//                         href="/booking"
//                         className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
//                       >
//                         Сделать новую запись
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <VideoSection />
//     </PageShell>
//   );
// }









// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { Suspense, useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import dynamic from "next/dynamic";

// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";

// import {
//   ArrowLeft,
//   ArrowRight,
//   CalendarClock,
//   Check,
//   CreditCard,
//   Info,
//   Lock,
//   Phone,
//   Receipt,
//   ShieldCheck,
//   Sparkles,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import("@/components/Ballpit"), {
//   ssr: false,
// });

// /* ===================== Типы ===================== */

// type PaymentMethod = "onsite" | "online";

// interface PaymentSummary {
//   serviceTitle: string;
//   masterName: string;
//   dateText: string;
//   timeText: string;
//   priceText: string;
//   durationText: string;
//   appointmentId: string;
// }

// /* ===================== Вспомогательные функции ===================== */

// function formatDateTime(dateIso: string | null, timeIso: string | null): {
//   dateText: string;
//   timeText: string;
// } {
//   if (!dateIso || !timeIso) {
//     return { dateText: "Дата не указана", timeText: "Время не указано" };
//   }

//   const date = new Date(dateIso);
//   const time = new Date(timeIso);

//   const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
//     weekday: "long",
//     day: "2-digit",
//     month: "long",
//   });

//   const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return {
//     dateText: dateFormatter.format(date),
//     timeText: timeFormatter.format(time),
//   };
// }

// /* ===================== Общий shell ===================== */

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function FloatingParticles() {
//   const [particles, setParticles] = React.useState<
//     Array<{ x: number; y: number; id: number; color: string }>
//   >([]);

//   React.useEffect(() => {
//     const colors = [
//       "bg-amber-400/30",
//       "bg-fuchsia-400/25",
//       "bg-sky-400/25",
//       "bg-emerald-400/25",
//       "bg-yellow-300/30",
//     ];

//     const nextParticles = [...Array(30)].map((_, index) => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       id: index,
//       color: colors[Math.floor(Math.random() * colors.length)],
//     }));

//     setParticles(nextParticles);
//   }, []);

//   if (particles.length === 0) return null;

//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <div
//           key={particle.id}
//           className={`pointer-events-none absolute h-1 w-1 rounded-full ${particle.color}`}
//           style={{
//             transform: `translate3d(${particle.x}px, ${particle.y}px, 0)`,
//             opacity: 0.6,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* СЛОЙ 1: базовый анимированный фон */}
//       <BookingAnimatedBackground />

//       {/* СЛОЙ 2: мягкие плавающие частицы */}
//       <FloatingParticles />

//       {/* СЛОЙ 3: большие цветные пятна (глоу) */}
//       <div className="pointer-events-none fixed inset-0 -z-30">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       {/* СЛОЙ 4: 3D Ballpit - интерактивные шары на заднем плане */}
//       <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
//         <Ballpit
//           className="h-full w-full"
//           count={40}
//           gravity={0}
//           friction={0.9995}
//           wallBounce={0.98}
//           maxVelocity={0.05}
//           minSize={0.5}
//           maxSize={1.2}
//           followCursor
//           colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
//         />
//       </div>

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <div className="relative z-10 min-h-screen">
//         {/* Хедер с прогрессом шагов */}
//         <header className="booking-header fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-md">
//           <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//             <PremiumProgressBar currentStep={6} steps={BOOKING_STEPS} />
//           </div>
//         </header>

//         {/* Отступ под хедер */}
//         <div className="h-[84px] md:h-[96px]" />

//         {children}
//       </div>

//       <style jsx global>{`
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
//         @keyframes bg-slide {
//           0%,
//           100% {
//             background-position: 0% 0%;
//           }
//           50% {
//             background-position: 100% 0%;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// /* ===================== HERO С ОПЛАТОЙ ===================== */

// function PaymentHero({ appointmentId }: { appointmentId: string }) {
//   return (
//     <section className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-10 pt-8 md:pt-10 xl:px-8">
//       {/* светящийся фон блока */}
//       <div className="pointer-events-none absolute inset-x-4 top-0 -z-10 h-[260px] rounded-[40px] bg-[radial-gradient(circle_at_10%_0%,rgba(251,191,36,0.4),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(56,189,248,0.35),transparent_55%)] blur-3xl md:inset-x-8 md:h-[280px]" />

//       <div className="relative mx-auto max-w-5xl text-center">
//         {/* бейдж шага */}
//         <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-2 text-sm font-semibold text-black shadow-[0_12px_40px_rgba(251,191,36,0.6)]">
//           <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
//             <CreditCard className="h-3.5 w-3.5" />
//           </span>
//           Шаг 6 — Оплата и финальное подтверждение
//         </div>

//         {/* заголовок */}
//         <h1 className="brand-script mt-6 text-4xl font-extrabold leading-tight text-amber-50 drop-shadow-[0_0_35px_rgba(0,0,0,0.9)] md:text-5xl lg:text-6xl">
//           Завершение записи
//         </h1>

//         {/* подзаголовок */}
//         <p className="mt-4 text-lg font-semibold italic tracking-wide text-cyan-200/95 md:text-xl">
//           Выберите способ оплаты и подтвердите бронь
//         </p>

//         {/* номер записи */}
//         <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100 md:text-sm">
//           <Receipt className="h-4 w-4 text-emerald-300" />
//           Номер записи:
//           <span className="font-mono text-emerald-200">{appointmentId}</span>
//         </p>
//       </div>
//     </section>
//   );
// }

// /* ===================== КАРТОЧКИ ОПЛАТЫ ===================== */

// interface PaymentMethodCardProps {
//   method: PaymentMethod;
//   selected: PaymentMethod;
//   onSelect: (method: PaymentMethod) => void;
// }

// function PaymentMethodCard({
//   method,
//   selected,
//   onSelect,
// }: PaymentMethodCardProps) {
//   const isActive = method === selected;

//   const title = method === "onsite" ? "Оплата в салоне" : "Онлайн-оплата";
//   const subtitle =
//     method === "onsite"
//       ? "На месте, после оказания услуги"
//       : "Скоро — банковской картой или PayPal";

//   const icon =
//     method === "onsite" ? (
//       <CreditCard className="h-5 w-5" />
//     ) : (
//       <Lock className="h-5 w-5" />
//     );

//   return (
//     <button
//       type="button"
//       onClick={() => onSelect(method)}
//       className={[
//         "group relative flex w-full items-center justify-between gap-4 rounded-3xl border px-5 py-4 text-left transition-all md:px-6 md:py-5",
//         "backdrop-blur-xl",
//         isActive
//           ? "border-emerald-400/80 bg-gradient-to-br from-emerald-500/25 via-slate-900/90 to-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.55)]"
//           : "border-white/10 bg-slate-900/80 hover:border-emerald-300/60 hover:bg-slate-900/95 hover:shadow-[0_0_28px_rgba(16,185,129,0.4)]",
//       ].join(" ")}
//     >
//       <div className="flex items-center gap-4">
//         <div
//           className={[
//             "flex h-11 w-11 items-center justify-center rounded-2xl border text-emerald-200 shadow-lg",
//             isActive
//               ? "border-emerald-300/80 bg-emerald-500/20"
//               : "border-emerald-300/40 bg-emerald-500/10 group-hover:bg-emerald-500/20",
//           ].join(" ")}
//         >
//           {icon}
//         </div>

//         <div>
//           <div className="flex items-center gap-2">
//             <h3 className="text-sm font-semibold text-white md:text-base">
//               {title}
//             </h3>
//             {method === "online" && (
//               <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
//                 скоро
//               </span>
//             )}
//           </div>
//           <p className="mt-1 text-xs text-slate-300 md:text-sm">{subtitle}</p>
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         {isActive && (
//           <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100 md:text-xs">
//             <Check className="h-3 w-3" />
//             Выбрано
//           </span>
//         )}
//         <div
//           className={[
//             "flex h-6 w-6 items-center justify-center rounded-full border text-emerald-200",
//             isActive
//               ? "border-emerald-300 bg-emerald-500/40"
//               : "border-emerald-300/50 bg-transparent group-hover:bg-emerald-500/20",
//           ].join(" ")}
//         >
//           {isActive && <Check className="h-3.5 w-3.5" />}
//         </div>
//       </div>

//       <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10 ring-offset-0 ring-offset-transparent" />
//     </button>
//   );
// }

// /* ===================== ОСНОВНАЯ СТРАНИЦА ОПЛАТЫ ===================== */

// function PaymentPageClientInner(): React.JSX.Element {
//   const searchParams = useSearchParams();

//   const appointmentId = searchParams.get("appointment") ?? "—";
//   const serviceTitle = searchParams.get("service") ?? "Услуга из записи";
//   const masterName = searchParams.get("master") ?? "Ваш мастер в SalonElen";

//   const dateIso = searchParams.get("date");
//   const timeIso = searchParams.get("time");

//   const { dateText, timeText } = formatDateTime(dateIso, timeIso);

//   const priceText = searchParams.get("price") ?? "По прайсу салона";
//   const durationText = searchParams.get("duration") ?? "45 минут";

//   const summary: PaymentSummary = {
//     serviceTitle,
//     masterName,
//     dateText,
//     timeText,
//     priceText,
//     durationText,
//     appointmentId,
//   };

//   const [method, setMethod] = useState<PaymentMethod>("onsite");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [submitDone, setSubmitDone] = useState(false);

//   useEffect(() => {
//     setSubmitError(null);
//   }, [method]);

//   const handleConfirm = async () => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);
//     setSubmitError(null);

//     try {
//       await new Promise((resolve) => setTimeout(resolve, 800));
//       setSubmitDone(true);
//     } catch (error) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Не удалось подтвердить запись";
//       setSubmitError(message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const payHint =
//     method === "onsite"
//       ? "Вы оплатите услуги непосредственно в салоне после визита."
//       : "Онлайн-оплата появится позже. Сейчас вы просто фиксируете бронь.";

//   return (
//     <PageShell>
//       <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-16 xl:px-8">
//         <PaymentHero appointmentId={appointmentId} />

//         {/* Основной грид: слева способ оплаты, справа резюме */}
//         <section className="relative z-10 mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
//           {/* ЛЕВАЯ КОЛОНКА – способы оплаты */}
//           <div className="relative z-10">
//             <div className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-br from-emerald-400/50 via-cyan-500/30 to-sky-400/30 opacity-70 blur-3xl" />

//             <div className="relative z-10 rounded-[30px] border border-white/10 bg-slate-950/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur-2xl md:p-7">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
//                   <CreditCard className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/70">
//                     Способ оплаты
//                   </p>
//                   <h2 className="brand-script text-xl font-semibold text-white md:text-2xl">
//                     Выберите, как вам удобнее
//                   </h2>
//                 </div>
//               </div>

//               <div className="mt-5 space-y-3">
//                 <PaymentMethodCard
//                   method="onsite"
//                   selected={method}
//                   onSelect={setMethod}
//                 />
//                 <PaymentMethodCard
//                   method="online"
//                   selected={method}
//                   onSelect={setMethod}
//                 />
//               </div>

//               <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-xs text-emerald-50 md:text-sm">
//                 <div className="flex items-start gap-3">
//                   <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300 md:h-5 md:w-5" />
//                   <div>
//                     <p className="font-semibold">Гарантия сохранности брони</p>
//                     <p className="mt-1 text-emerald-100/90">
//                       Независимо от выбранного способа, ваша запись сохраняется
//                       в системе и администратор салона увидит её сразу после
//                       подтверждения.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-slate-300 md:text-sm">
//                 <div className="flex items-center gap-2">
//                   <Lock className="h-4 w-4 text-slate-200/80" />
//                   <span>
//                     Передача данных защищена, мы не храним данные банковских
//                     карт.
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Phone className="h-4 w-4 text-slate-200/80" />
//                   <span>
//                     Если у вас возникнут вопросы, администратор свяжется с вами
//                     по указанному телефону или e-mail.
//                   </span>
//                 </div>
//               </div>

//               {/* Кнопки */}
//               <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
//                 <button
//                   type="button"
//                   onClick={handleConfirm}
//                   disabled={isSubmitting}
//                   className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_40px_rgba(52,211,153,0.7)] transition-all hover:shadow-[0_24px_55px_rgba(52,211,153,0.9)] disabled:cursor-wait disabled:opacity-70 md:text-base"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
//                       Подтверждаем запись…
//                     </>
//                   ) : submitDone ? (
//                     <>
//                       <Check className="h-4 w-4" />
//                       Запись подтверждена
//                     </>
//                   ) : (
//                     <>
//                       <Sparkles className="h-4 w-4" />
//                       Подтвердить бронь
//                     </>
//                   )}
//                 </button>

//                 <Link
//                   href="/booking/verify"
//                   className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm text-slate-100 transition-all hover:border-emerald-300/70 hover:bg-white/5 md:text-base"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Назад к проверке
//                 </Link>
//               </div>

//               {submitError && (
//                 <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-100 md:text-sm">
//                   <div className="flex items-start gap-2">
//                     <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
//                     <p>{submitError}</p>
//                   </div>
//                 </div>
//               )}

//               <p className="mt-4 text-xs text-slate-400">
//                 {payHint}
//               </p>
//             </div>
//           </div>

//           {/* ПРАВАЯ КОЛОНКА – резюме записи */}
//           <aside className="relative z-10">
//             <div className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-br from-cyan-400/45 via-blue-500/40 to-indigo-500/40 opacity-80 blur-3xl" />

//             <div className="relative z-10 rounded-[30px] border border-white/10 bg-slate-950/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl md:p-7">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-200">
//                   <CalendarClock className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
//                     Резюме записи
//                   </p>
//                   <h2 className="brand-script text-xl font-semibold text-white md:text-2xl">
//                     Ваш визит в SalonElen
//                   </h2>
//                 </div>
//               </div>

//               <div className="mt-5 space-y-4 text-sm text-slate-100 md:text-base">
//                 <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                   <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                     Услуга
//                   </p>
//                   <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                     {summary.serviceTitle}
//                   </p>
//                   <p className="mt-1 flex items-center gap-2 text-xs text-slate-300 md:text-sm">
//                     <User2 className="h-4 w-4 text-slate-300" />
//                     Мастер:{" "}
//                     <span className="font-medium text-slate-100">
//                       {summary.masterName}
//                     </span>
//                   </p>
//                 </div>

//                 <div className="grid gap-3 md:grid-cols-2">
//                   <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                     <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                       Дата и время
//                     </p>
//                     <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                       {summary.dateText}
//                     </p>
//                     <p className="mt-0.5 text-sm text-amber-200">
//                       {summary.timeText}
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                     <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                       Продолжительность
//                     </p>
//                     <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                       {summary.durationText}
//                     </p>
//                     <p className="mt-0.5 text-xs text-slate-300">
//                       Время указано с запасом по регламенту салона.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-emerald-500/15 p-4 ring-1 ring-emerald-300/40">
//                   <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">
//                     Стоимость
//                   </p>
//                   <p className="mt-1 text-lg font-semibold text-emerald-200">
//                     {summary.priceText}
//                   </p>
//                   <p className="mt-1 text-xs text-emerald-100/80">
//                     Итоговая сумма может незначительно отличаться в зависимости
//                     от выбранных дополнительных услуг и материалов.
//                   </p>
//                 </div>

//                 <div className="rounded-2xl border border-dashed border-slate-600/70 bg-slate-900/80 p-4 text-xs text-slate-300 md:text-sm">
//                   <div className="flex items-start gap-2">
//                     <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-200/90" />
//                     <p>
//                       Если вам понадобится изменить или отменить запись, просто
//                       свяжитесь с нами любым удобным способом. Пожалуйста,
//                       предупредите не менее чем за 24 часа — так мы сможем
//                       предложить это время другому гостю.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-400 md:text-sm">
//                 <span>Мы очень ждём вас в салоне ✨</span>
//                 <Link
//                   href="/"
//                   className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300 hover:text-cyan-200"
//                 >
//                   На главную
//                   <ArrowRight className="h-3 w-3" />
//                 </Link>
//               </div>
//             </div>
//           </aside>
//         </section>
//       </main>
//     </PageShell>
//   );
// }

// /* ===================== EXPORT ===================== */

// export default function PaymentPageClient(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950/95 to-black">
//           <div className="h-24 w-24 animate-spin rounded-full border-4 border-emerald-400/30 border-t-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.7)]" />
//         </div>
//       }
//     >
//       <PaymentPageClientInner />
//     </Suspense>
//   );
// }



// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { Suspense, useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import dynamic from "next/dynamic";

// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";

// import {
//   ArrowLeft,
//   ArrowRight,
//   CalendarClock,
//   Check,
//   CreditCard,
//   Info,
//   Lock,
//   Phone,
//   Receipt,
//   ShieldCheck,
//   Sparkles,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import("@/components/Ballpit"), {
//   ssr: false,
// });

// /* ===================== Типы ===================== */

// type PaymentMethod = "onsite" | "online";

// interface PaymentSummary {
//   serviceTitle: string;
//   masterName: string;
//   dateText: string;
//   timeText: string;
//   priceText: string;
//   durationText: string;
//   appointmentId: string;
// }

// /* ===================== Вспомогательные функции ===================== */

// function formatDateTime(dateIso: string | null, timeIso: string | null): {
//   dateText: string;
//   timeText: string;
// } {
//   if (!dateIso || !timeIso) {
//     return { dateText: "Дата не указана", timeText: "Время не указано" };
//   }

//   const date = new Date(dateIso);
//   const time = new Date(timeIso);

//   const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
//     weekday: "long",
//     day: "2-digit",
//     month: "long",
//   });

//   const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return {
//     dateText: dateFormatter.format(date),
//     timeText: timeFormatter.format(time),
//   };
// }

// /* ===================== Общий shell ===================== */

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function FloatingParticles() {
//   const [particles, setParticles] = React.useState<
//     Array<{ x: number; y: number; id: number; color: string }>
//   >([]);

//   React.useEffect(() => {
//     const colors = [
//       "bg-amber-400/30",
//       "bg-fuchsia-400/25",
//       "bg-sky-400/25",
//       "bg-emerald-400/25",
//       "bg-yellow-300/30",
//     ];

//     const nextParticles = [...Array(30)].map((_, index) => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       id: index,
//       color: colors[Math.floor(Math.random() * colors.length)],
//     }));

//     setParticles(nextParticles);
//   }, []);

//   if (particles.length === 0) return null;

//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <div
//           key={particle.id}
//           className={`pointer-events-none absolute h-1 w-1 rounded-full ${particle.color}`}
//           style={{
//             transform: `translate3d(${particle.x}px, ${particle.y}px, 0)`,
//             opacity: 0.6,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* СЛОЙ 1: базовый анимированный фон */}
//       <BookingAnimatedBackground />

//       {/* СЛОЙ 2: мягкие плавающие частицы */}
//       <FloatingParticles />

//       {/* СЛОЙ 3: большие цветные пятна (глоу) */}
//       <div className="pointer-events-none fixed inset-0 -z-30">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       {/* СЛОЙ 4: 3D Ballpit - интерактивные шары на заднем плане */}
//       <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
//         <Ballpit
//           className="h-full w-full"
//           count={20}
//           gravity={0}
//           friction={0.9995}
//           wallBounce={0.98}
//           maxVelocity={0.05}
//           minSize={0.4}
//           maxSize={0.8}
//           followCursor
//           colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
//         />
//       </div>

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <div className="relative z-10 min-h-screen">
//         {/* Хедер с прогрессом шагов */}
//         <header className="booking-header fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-md">
//           <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//             <PremiumProgressBar currentStep={6} steps={BOOKING_STEPS} />
//           </div>
//         </header>

//         {/* Отступ под хедер */}
//         <div className="h-[84px] md:h-[96px]" />

//         {children}
//       </div>

//       <style jsx global>{`
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
//         @keyframes bg-slide {
//           0%,
//           100% {
//             background-position: 0% 0%;
//           }
//           50% {
//             background-position: 100% 0%;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// /* ===================== HERO С ОПЛАТОЙ ===================== */

// function PaymentHero({ appointmentId }: { appointmentId: string }) {
//   return (
//     <section className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-10 pt-8 md:pt-10 xl:px-8">
//       {/* светящийся фон блока */}
//       <div className="pointer-events-none absolute inset-x-4 top-0 -z-10 h-[260px] rounded-[40px] bg-[radial-gradient(circle_at_10%_0%,rgba(251,191,36,0.4),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(56,189,248,0.35),transparent_55%)] blur-3xl md:inset-x-8 md:h-[280px]" />

//       <div className="relative mx-auto max-w-5xl text-center">
//         {/* бейдж шага */}
//         <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-2 text-sm font-semibold text-black shadow-[0_12px_40px_rgba(251,191,36,0.6)]">
//           <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
//             <CreditCard className="h-3.5 w-3.5" />
//           </span>
//           Шаг 6 — Оплата и финальное подтверждение
//         </div>

//         {/* заголовок */}
//         <h1 className="brand-script mt-6 text-4xl font-extrabold leading-tight text-amber-50 drop-shadow-[0_0_35px_rgba(0,0,0,0.9)] md:text-5xl lg:text-6xl">
//           Завершение записи
//         </h1>

//         {/* подзаголовок */}
//         <p className="mt-4 text-lg font-semibold italic tracking-wide text-cyan-200/95 md:text-xl">
//           Выберите способ оплаты и подтвердите бронь
//         </p>

//         {/* номер записи */}
//         <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100 md:text-sm">
//           <Receipt className="h-4 w-4 text-emerald-300" />
//           Номер записи:
//           <span className="font-mono text-emerald-200">{appointmentId}</span>
//         </p>
//       </div>
//     </section>
//   );
// }

// /* ===================== КАРТОЧКИ ОПЛАТЫ ===================== */

// interface PaymentMethodCardProps {
//   method: PaymentMethod;
//   selected: PaymentMethod;
//   onSelect: (method: PaymentMethod) => void;
// }

// function PaymentMethodCard({
//   method,
//   selected,
//   onSelect,
// }: PaymentMethodCardProps) {
//   const isActive = method === selected;

//   const title = method === "onsite" ? "Оплата в салоне" : "Онлайн-оплата";
//   const subtitle =
//     method === "onsite"
//       ? "На месте, после оказания услуги"
//       : "Скоро — банковской картой или PayPal";

//   const icon =
//     method === "onsite" ? (
//       <CreditCard className="h-5 w-5" />
//     ) : (
//       <Lock className="h-5 w-5" />
//     );

//   return (
//     <button
//       type="button"
//       onClick={() => onSelect(method)}
//       className={[
//         "group relative flex w-full items-center justify-between gap-4 rounded-3xl border px-5 py-4 text-left transition-all md:px-6 md:py-5",
//         "backdrop-blur-xl",
//         isActive
//           ? "border-emerald-400/80 bg-gradient-to-br from-emerald-500/25 via-slate-900/90 to-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.55)]"
//           : "border-white/10 bg-slate-900/80 hover:border-emerald-300/60 hover:bg-slate-900/95 hover:shadow-[0_0_28px_rgba(16,185,129,0.4)]",
//       ].join(" ")}
//     >
//       <div className="flex items-center gap-4">
//         <div
//           className={[
//             "flex h-11 w-11 items-center justify-center rounded-2xl border text-emerald-200 shadow-lg",
//             isActive
//               ? "border-emerald-300/80 bg-emerald-500/20"
//               : "border-emerald-300/40 bg-emerald-500/10 group-hover:bg-emerald-500/20",
//           ].join(" ")}
//         >
//           {icon}
//         </div>

//         <div>
//           <div className="flex items-center gap-2">
//             <h3 className="text-sm font-semibold text-white md:text-base">
//               {title}
//             </h3>
//             {method === "online" && (
//               <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
//                 скоро
//               </span>
//             )}
//           </div>
//           <p className="mt-1 text-xs text-slate-300 md:text-sm">{subtitle}</p>
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         {isActive && (
//           <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100 md:text-xs">
//             <Check className="h-3 w-3" />
//             Выбрано
//           </span>
//         )}
//         <div
//           className={[
//             "flex h-6 w-6 items-center justify-center rounded-full border text-emerald-200",
//             isActive
//               ? "border-emerald-300 bg-emerald-500/40"
//               : "border-emerald-300/50 bg-transparent group-hover:bg-emerald-500/20",
//           ].join(" ")}
//         >
//           {isActive && <Check className="h-3.5 w-3.5" />}
//         </div>
//       </div>

//       <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10 ring-offset-0 ring-offset-transparent" />
//     </button>
//   );
// }

// /* ===================== ОСНОВНАЯ СТРАНИЦА ОПЛАТЫ ===================== */

// function PaymentPageClientInner(): React.JSX.Element {
//   const searchParams = useSearchParams();

//   const appointmentId = searchParams.get("appointment") ?? "—";
//   const serviceTitle = searchParams.get("service") ?? "Услуга из записи";
//   const masterName = searchParams.get("master") ?? "Ваш мастер в SalonElen";

//   const dateIso = searchParams.get("date");
//   const timeIso = searchParams.get("time");

//   const { dateText, timeText } = formatDateTime(dateIso, timeIso);

//   const priceText = searchParams.get("price") ?? "По прайсу салона";
//   const durationText = searchParams.get("duration") ?? "45 минут";

//   const summary: PaymentSummary = {
//     serviceTitle,
//     masterName,
//     dateText,
//     timeText,
//     priceText,
//     durationText,
//     appointmentId,
//   };

//   const [method, setMethod] = useState<PaymentMethod>("onsite");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [submitDone, setSubmitDone] = useState(false);

//   useEffect(() => {
//     setSubmitError(null);
//   }, [method]);

//   const handleConfirm = async () => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);
//     setSubmitError(null);

//     try {
//       await new Promise((resolve) => setTimeout(resolve, 800));
//       setSubmitDone(true);
//     } catch (error) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Не удалось подтвердить запись";
//       setSubmitError(message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const payHint =
//     method === "onsite"
//       ? "Вы оплатите услуги непосредственно в салоне после визита."
//       : "Онлайн-оплата появится позже. Сейчас вы просто фиксируете бронь.";

//   return (
//     <PageShell>
//       <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-16 xl:px-8">
//         <PaymentHero appointmentId={appointmentId} />

//         {/* Основной грид: слева способ оплаты, справа резюме */}
//         <section className="relative z-10 mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
//           {/* ЛЕВАЯ КОЛОНКА – способы оплаты */}
//           <div className="relative z-10">
//             <div className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-br from-emerald-400/50 via-cyan-500/30 to-sky-400/30 opacity-70 blur-3xl" />

//             <div className="relative z-10 rounded-[30px] border border-white/10 bg-slate-950/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur-2xl md:p-7">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
//                   <CreditCard className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/70">
//                     Способ оплаты
//                   </p>
//                   <h2 className="brand-script text-xl font-semibold text-white md:text-2xl">
//                     Выберите, как вам удобнее
//                   </h2>
//                 </div>
//               </div>

//               <div className="mt-5 space-y-3">
//                 <PaymentMethodCard
//                   method="onsite"
//                   selected={method}
//                   onSelect={setMethod}
//                 />
//                 <PaymentMethodCard
//                   method="online"
//                   selected={method}
//                   onSelect={setMethod}
//                 />
//               </div>

//               <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-xs text-emerald-50 md:text-sm">
//                 <div className="flex items-start gap-3">
//                   <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300 md:h-5 md:w-5" />
//                   <div>
//                     <p className="font-semibold">Гарантия сохранности брони</p>
//                     <p className="mt-1 text-emerald-100/90">
//                       Независимо от выбранного способа, ваша запись сохраняется
//                       в системе и администратор салона увидит её сразу после
//                       подтверждения.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-slate-300 md:text-sm">
//                 <div className="flex items-center gap-2">
//                   <Lock className="h-4 w-4 text-slate-200/80" />
//                   <span>
//                     Передача данных защищена, мы не храним данные банковских
//                     карт.
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Phone className="h-4 w-4 text-slate-200/80" />
//                   <span>
//                     Если у вас возникнут вопросы, администратор свяжется с вами
//                     по указанному телефону или e-mail.
//                   </span>
//                 </div>
//               </div>

//               {/* Кнопки */}
//               <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
//                 <button
//                   type="button"
//                   onClick={handleConfirm}
//                   disabled={isSubmitting}
//                   className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_40px_rgba(52,211,153,0.7)] transition-all hover:shadow-[0_24px_55px_rgba(52,211,153,0.9)] disabled:cursor-wait disabled:opacity-70 md:text-base"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
//                       Подтверждаем запись…
//                     </>
//                   ) : submitDone ? (
//                     <>
//                       <Check className="h-4 w-4" />
//                       Запись подтверждена
//                     </>
//                   ) : (
//                     <>
//                       <Sparkles className="h-4 w-4" />
//                       Подтвердить бронь
//                     </>
//                   )}
//                 </button>

//                 <Link
//                   href="/booking/verify"
//                   className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm text-slate-100 transition-all hover:border-emerald-300/70 hover:bg-white/5 md:text-base"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Назад к проверке
//                 </Link>
//               </div>

//               {submitError && (
//                 <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-100 md:text-sm">
//                   <div className="flex items-start gap-2">
//                     <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
//                     <p>{submitError}</p>
//                   </div>
//                 </div>
//               )}

//               <p className="mt-4 text-xs text-slate-400">
//                 {payHint}
//               </p>
//             </div>
//           </div>

//           {/* ПРАВАЯ КОЛОНКА – резюме записи */}
//           <aside className="relative z-10">
//             <div className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-br from-cyan-400/45 via-blue-500/40 to-indigo-500/40 opacity-80 blur-3xl" />

//             <div className="relative z-10 rounded-[30px] border border-white/10 bg-slate-950/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl md:p-7">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-200">
//                   <CalendarClock className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
//                     Резюме записи
//                   </p>
//                   <h2 className="brand-script text-xl font-semibold text-white md:text-2xl">
//                     Ваш визит в SalonElen
//                   </h2>
//                 </div>
//               </div>

//               <div className="mt-5 space-y-4 text-sm text-slate-100 md:text-base">
//                 <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                   <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                     Услуга
//                   </p>
//                   <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                     {summary.serviceTitle}
//                   </p>
//                   <p className="mt-1 flex items-center gap-2 text-xs text-slate-300 md:text-sm">
//                     <User2 className="h-4 w-4 text-slate-300" />
//                     Мастер:{" "}
//                     <span className="font-medium text-slate-100">
//                       {summary.masterName}
//                     </span>
//                   </p>
//                 </div>

//                 <div className="grid gap-3 md:grid-cols-2">
//                   <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                     <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                       Дата и время
//                     </p>
//                     <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                       {summary.dateText}
//                     </p>
//                     <p className="mt-0.5 text-sm text-amber-200">
//                       {summary.timeText}
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                     <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                       Продолжительность
//                     </p>
//                     <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                       {summary.durationText}
//                     </p>
//                     <p className="mt-0.5 text-xs text-slate-300">
//                       Время указано с запасом по регламенту салона.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-emerald-500/15 p-4 ring-1 ring-emerald-300/40">
//                   <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">
//                     Стоимость
//                   </p>
//                   <p className="mt-1 text-lg font-semibold text-emerald-200">
//                     {summary.priceText}
//                   </p>
//                   <p className="mt-1 text-xs text-emerald-100/80">
//                     Итоговая сумма может незначительно отличаться в зависимости
//                     от выбранных дополнительных услуг и материалов.
//                   </p>
//                 </div>

//                 <div className="rounded-2xl border border-dashed border-slate-600/70 bg-slate-900/80 p-4 text-xs text-slate-300 md:text-sm">
//                   <div className="flex items-start gap-2">
//                     <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-200/90" />
//                     <p>
//                       Если вам понадобится изменить или отменить запись, просто
//                       свяжитесь с нами любым удобным способом. Пожалуйста,
//                       предупредите не менее чем за 24 часа — так мы сможем
//                       предложить это время другому гостю.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-400 md:text-sm">
//                 <span>Мы очень ждём вас в салоне ✨</span>
//                 <Link
//                   href="/"
//                   className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300 hover:text-cyan-200"
//                 >
//                   На главную
//                   <ArrowRight className="h-3 w-3" />
//                 </Link>
//               </div>
//             </div>
//           </aside>
//         </section>
//       </main>
//     </PageShell>
//   );
// }

// /* ===================== EXPORT ===================== */

// export default function PaymentPageClient(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950/95 to-black">
//           <div className="h-24 w-24 animate-spin rounded-full border-4 border-emerald-400/30 border-t-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.7)]" />
//         </div>
//       }
//     >
//       <PaymentPageClientInner />
//     </Suspense>
//   );
// }



// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { Suspense, useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import dynamic from "next/dynamic";

// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";

// import {
//   ArrowLeft,
//   ArrowRight,
//   CalendarClock,
//   Check,
//   CreditCard,
//   Info,
//   Lock,
//   Phone,
//   Receipt,
//   ShieldCheck,
//   Sparkles,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import("@/components/Ballpit"), {
//   ssr: false,
// });

// /* ===================== Типы ===================== */

// type PaymentMethod = "onsite" | "online";

// interface PaymentSummary {
//   serviceTitle: string;
//   masterName: string;
//   dateText: string;
//   timeText: string;
//   priceText: string;
//   durationText: string;
//   appointmentId: string;
// }

// /* ===================== Вспомогательные функции ===================== */

// function formatDateTime(dateIso: string | null, timeIso: string | null): {
//   dateText: string;
//   timeText: string;
// } {
//   if (!dateIso || !timeIso) {
//     return { dateText: "Дата не указана", timeText: "Время не указано" };
//   }

//   const date = new Date(dateIso);
//   const time = new Date(timeIso);

//   const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
//     weekday: "long",
//     day: "2-digit",
//     month: "long",
//   });

//   const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return {
//     dateText: dateFormatter.format(date),
//     timeText: timeFormatter.format(time),
//   };
// }

// /* ===================== Общий shell ===================== */

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function FloatingParticles() {
//   const [particles, setParticles] = React.useState<
//     Array<{ x: number; y: number; id: number; color: string }>
//   >([]);

//   React.useEffect(() => {
//     const colors = [
//       "bg-amber-400/30",
//       "bg-fuchsia-400/25",
//       "bg-sky-400/25",
//       "bg-emerald-400/25",
//       "bg-yellow-300/30",
//     ];

//     const nextParticles = [...Array(30)].map((_, index) => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       id: index,
//       color: colors[Math.floor(Math.random() * colors.length)],
//     }));

//     setParticles(nextParticles);
//   }, []);

//   if (particles.length === 0) return null;

//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <div
//           key={particle.id}
//           className={`pointer-events-none absolute h-1 w-1 rounded-full ${particle.color}`}
//           style={{
//             transform: `translate3d(${particle.x}px, ${particle.y}px, 0)`,
//             opacity: 0.6,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* СЛОЙ 1: базовый анимированный фон */}
//       <BookingAnimatedBackground />

//       {/* СЛОЙ 2: мягкие плавающие частицы */}
//       <FloatingParticles />

//       {/* СЛОЙ 3: большие цветные пятна (глоу) */}
//       <div className="pointer-events-none fixed inset-0 -z-30">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       {/* СЛОЙ 4: 3D Ballpit - интерактивные шары на заднем плане */}
//       <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
//         <Ballpit
//   className="w-full h-full"
//   count={100}
//   gravity={0.15}
//   friction={0.992}
//   maxVelocity={1.6}
//   minSize={0.4}
//   maxSize={1.0}
//   verticalOffset={0.45}
//   followCursor
//   colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
// />

//       </div>

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <div className="relative z-10 min-h-screen">
//         {/* Хедер с прогрессом шагов */}
//         <header className="booking-header fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-md">
//           <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//             <PremiumProgressBar currentStep={6} steps={BOOKING_STEPS} />
//           </div>
//         </header>

//         {/* Отступ под хедер */}
//         <div className="h-[84px] md:h-[96px]" />

//         {children}
//       </div>

//       <style jsx global>{`
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
//         @keyframes bg-slide {
//           0%,
//           100% {
//             background-position: 0% 0%;
//           }
//           50% {
//             background-position: 100% 0%;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// /* ===================== HERO С ОПЛАТОЙ ===================== */

// function PaymentHero({ appointmentId }: { appointmentId: string }) {
//   return (
//     <section className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-10 pt-8 md:pt-10 xl:px-8">
//       {/* светящийся фон блока */}
//       <div className="pointer-events-none absolute inset-x-4 top-0 -z-10 h-[260px] rounded-[40px] bg-[radial-gradient(circle_at_10%_0%,rgba(251,191,36,0.4),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(56,189,248,0.35),transparent_55%)] blur-3xl md:inset-x-8 md:h-[280px]" />

//       <div className="relative mx-auto max-w-5xl text-center">
//         {/* бейдж шага */}
//         <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-2 text-sm font-semibold text-black shadow-[0_12px_40px_rgba(251,191,36,0.6)]">
//           <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
//             <CreditCard className="h-3.5 w-3.5" />
//           </span>
//           Шаг 6 — Оплата и финальное подтверждение
//         </div>

//         {/* заголовок */}
//         <h1 className="brand-script mt-6 text-4xl font-extrabold leading-tight text-amber-50 drop-shadow-[0_0_35px_rgba(0,0,0,0.9)] md:text-5xl lg:text-6xl">
//           Завершение записи
//         </h1>

//         {/* подзаголовок */}
//         <p className="mt-4 text-lg font-semibold italic tracking-wide text-cyan-200/95 md:text-xl">
//           Выберите способ оплаты и подтвердите бронь
//         </p>

//         {/* номер записи */}
//         <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100 md:text-sm">
//           <Receipt className="h-4 w-4 text-emerald-300" />
//           Номер записи:
//           <span className="font-mono text-emerald-200">{appointmentId}</span>
//         </p>
//       </div>
//     </section>
//   );
// }

// /* ===================== КАРТОЧКИ ОПЛАТЫ ===================== */

// interface PaymentMethodCardProps {
//   method: PaymentMethod;
//   selected: PaymentMethod;
//   onSelect: (method: PaymentMethod) => void;
// }

// function PaymentMethodCard({
//   method,
//   selected,
//   onSelect,
// }: PaymentMethodCardProps) {
//   const isActive = method === selected;

//   const title = method === "onsite" ? "Оплата в салоне" : "Онлайн-оплата";
//   const subtitle =
//     method === "onsite"
//       ? "На месте, после оказания услуги"
//       : "Скоро — банковской картой или PayPal";

//   const icon =
//     method === "onsite" ? (
//       <CreditCard className="h-5 w-5" />
//     ) : (
//       <Lock className="h-5 w-5" />
//     );

//   return (
//     <button
//       type="button"
//       onClick={() => onSelect(method)}
//       className={[
//         "group relative flex w-full items-center justify-between gap-4 rounded-3xl border px-5 py-4 text-left transition-all md:px-6 md:py-5",
//         "backdrop-blur-xl",
//         isActive
//           ? "border-emerald-400/80 bg-gradient-to-br from-emerald-500/25 via-slate-900/90 to-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.55)]"
//           : "border-white/10 bg-slate-900/80 hover:border-emerald-300/60 hover:bg-slate-900/95 hover:shadow-[0_0_28px_rgba(16,185,129,0.4)]",
//       ].join(" ")}
//     >
//       <div className="flex items-center gap-4">
//         <div
//           className={[
//             "flex h-11 w-11 items-center justify-center rounded-2xl border text-emerald-200 shadow-lg",
//             isActive
//               ? "border-emerald-300/80 bg-emerald-500/20"
//               : "border-emerald-300/40 bg-emerald-500/10 group-hover:bg-emerald-500/20",
//           ].join(" ")}
//         >
//           {icon}
//         </div>

//         <div>
//           <div className="flex items-center gap-2">
//             <h3 className="text-sm font-semibold text-white md:text-base">
//               {title}
//             </h3>
//             {method === "online" && (
//               <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
//                 скоро
//               </span>
//             )}
//           </div>
//           <p className="mt-1 text-xs text-slate-300 md:text-sm">{subtitle}</p>
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         {isActive && (
//           <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100 md:text-xs">
//             <Check className="h-3 w-3" />
//             Выбрано
//           </span>
//         )}
//         <div
//           className={[
//             "flex h-6 w-6 items-center justify-center rounded-full border text-emerald-200",
//             isActive
//               ? "border-emerald-300 bg-emerald-500/40"
//               : "border-emerald-300/50 bg-transparent group-hover:bg-emerald-500/20",
//           ].join(" ")}
//         >
//           {isActive && <Check className="h-3.5 w-3.5" />}
//         </div>
//       </div>

//       <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10 ring-offset-0 ring-offset-transparent" />
//     </button>
//   );
// }

// /* ===================== ОСНОВНАЯ СТРАНИЦА ОПЛАТЫ ===================== */

// function PaymentPageClientInner(): React.JSX.Element {
//   const searchParams = useSearchParams();

//   const appointmentId = searchParams.get("appointment") ?? "—";
//   const serviceTitle = searchParams.get("service") ?? "Услуга из записи";
//   const masterName = searchParams.get("master") ?? "Ваш мастер в SalonElen";

//   const dateIso = searchParams.get("date");
//   const timeIso = searchParams.get("time");

//   const { dateText, timeText } = formatDateTime(dateIso, timeIso);

//   const priceText = searchParams.get("price") ?? "По прайсу салона";
//   const durationText = searchParams.get("duration") ?? "45 минут";

//   const summary: PaymentSummary = {
//     serviceTitle,
//     masterName,
//     dateText,
//     timeText,
//     priceText,
//     durationText,
//     appointmentId,
//   };

//   const [method, setMethod] = useState<PaymentMethod>("onsite");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [submitDone, setSubmitDone] = useState(false);

//   useEffect(() => {
//     setSubmitError(null);
//   }, [method]);

//   const handleConfirm = async () => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);
//     setSubmitError(null);

//     try {
//       await new Promise((resolve) => setTimeout(resolve, 800));
//       setSubmitDone(true);
//     } catch (error) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Не удалось подтвердить запись";
//       setSubmitError(message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const payHint =
//     method === "onsite"
//       ? "Вы оплатите услуги непосредственно в салоне после визита."
//       : "Онлайн-оплата появится позже. Сейчас вы просто фиксируете бронь.";

//   return (
//     <PageShell>
//       <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-16 xl:px-8">
//         <PaymentHero appointmentId={appointmentId} />

//         {/* Основной грид: слева способ оплаты, справа резюме */}
//         <section className="relative z-10 mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
//           {/* ЛЕВАЯ КОЛОНКА – способы оплаты */}
//           <div className="relative z-10">
//             <div className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-br from-emerald-400/50 via-cyan-500/30 to-sky-400/30 opacity-70 blur-3xl" />

//             <div className="relative z-10 rounded-[30px] border border-white/10 bg-slate-950/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur-2xl md:p-7">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
//                   <CreditCard className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/70">
//                     Способ оплаты
//                   </p>
//                   <h2 className="brand-script text-xl font-semibold text-white md:text-2xl">
//                     Выберите, как вам удобнее
//                   </h2>
//                 </div>
//               </div>

//               <div className="mt-5 space-y-3">
//                 <PaymentMethodCard
//                   method="onsite"
//                   selected={method}
//                   onSelect={setMethod}
//                 />
//                 <PaymentMethodCard
//                   method="online"
//                   selected={method}
//                   onSelect={setMethod}
//                 />
//               </div>

//               <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-xs text-emerald-50 md:text-sm">
//                 <div className="flex items-start gap-3">
//                   <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300 md:h-5 md:w-5" />
//                   <div>
//                     <p className="font-semibold">Гарантия сохранности брони</p>
//                     <p className="mt-1 text-emerald-100/90">
//                       Независимо от выбранного способа, ваша запись сохраняется
//                       в системе и администратор салона увидит её сразу после
//                       подтверждения.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-slate-300 md:text-sm">
//                 <div className="flex items-center gap-2">
//                   <Lock className="h-4 w-4 text-slate-200/80" />
//                   <span>
//                     Передача данных защищена, мы не храним данные банковских
//                     карт.
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Phone className="h-4 w-4 text-slate-200/80" />
//                   <span>
//                     Если у вас возникнут вопросы, администратор свяжется с вами
//                     по указанному телефону или e-mail.
//                   </span>
//                 </div>
//               </div>

//               {/* Кнопки */}
//               <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
//                 <button
//                   type="button"
//                   onClick={handleConfirm}
//                   disabled={isSubmitting}
//                   className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_40px_rgba(52,211,153,0.7)] transition-all hover:shadow-[0_24px_55px_rgba(52,211,153,0.9)] disabled:cursor-wait disabled:opacity-70 md:text-base"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
//                       Подтверждаем запись…
//                     </>
//                   ) : submitDone ? (
//                     <>
//                       <Check className="h-4 w-4" />
//                       Запись подтверждена
//                     </>
//                   ) : (
//                     <>
//                       <Sparkles className="h-4 w-4" />
//                       Подтвердить бронь
//                     </>
//                   )}
//                 </button>

//                 <Link
//                   href="/booking/verify"
//                   className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm text-slate-100 transition-all hover:border-emerald-300/70 hover:bg-white/5 md:text-base"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Назад к проверке
//                 </Link>
//               </div>

//               {submitError && (
//                 <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-100 md:text-sm">
//                   <div className="flex items-start gap-2">
//                     <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
//                     <p>{submitError}</p>
//                   </div>
//                 </div>
//               )}

//               <p className="mt-4 text-xs text-slate-400">
//                 {payHint}
//               </p>
//             </div>
//           </div>

//           {/* ПРАВАЯ КОЛОНКА – резюме записи */}
//           <aside className="relative z-10">
//             <div className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-br from-cyan-400/45 via-blue-500/40 to-indigo-500/40 opacity-80 blur-3xl" />

//             <div className="relative z-10 rounded-[30px] border border-white/10 bg-slate-950/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl md:p-7">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-200">
//                   <CalendarClock className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
//                     Резюме записи
//                   </p>
//                   <h2 className="brand-script text-xl font-semibold text-white md:text-2xl">
//                     Ваш визит в SalonElen
//                   </h2>
//                 </div>
//               </div>

//               <div className="mt-5 space-y-4 text-sm text-slate-100 md:text-base">
//                 <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                   <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                     Услуга
//                   </p>
//                   <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                     {summary.serviceTitle}
//                   </p>
//                   <p className="mt-1 flex items-center gap-2 text-xs text-slate-300 md:text-sm">
//                     <User2 className="h-4 w-4 text-slate-300" />
//                     Мастер:{" "}
//                     <span className="font-medium text-slate-100">
//                       {summary.masterName}
//                     </span>
//                   </p>
//                 </div>

//                 <div className="grid gap-3 md:grid-cols-2">
//                   <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                     <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                       Дата и время
//                     </p>
//                     <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                       {summary.dateText}
//                     </p>
//                     <p className="mt-0.5 text-sm text-amber-200">
//                       {summary.timeText}
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                     <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                       Продолжительность
//                     </p>
//                     <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                       {summary.durationText}
//                     </p>
//                     <p className="mt-0.5 text-xs text-slate-300">
//                       Время указано с запасом по регламенту салона.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-emerald-500/15 p-4 ring-1 ring-emerald-300/40">
//                   <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">
//                     Стоимость
//                   </p>
//                   <p className="mt-1 text-lg font-semibold text-emerald-200">
//                     {summary.priceText}
//                   </p>
//                   <p className="mt-1 text-xs text-emerald-100/80">
//                     Итоговая сумма может незначительно отличаться в зависимости
//                     от выбранных дополнительных услуг и материалов.
//                   </p>
//                 </div>

//                 <div className="rounded-2xl border border-dashed border-slate-600/70 bg-slate-900/80 p-4 text-xs text-slate-300 md:text-sm">
//                   <div className="flex items-start gap-2">
//                     <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-200/90" />
//                     <p>
//                       Если вам понадобится изменить или отменить запись, просто
//                       свяжитесь с нами любым удобным способом. Пожалуйста,
//                       предупредите не менее чем за 24 часа — так мы сможем
//                       предложить это время другому гостю.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-400 md:text-sm">
//                 <span>Мы очень ждём вас в салоне ✨</span>
//                 <Link
//                   href="/"
//                   className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300 hover:text-cyan-200"
//                 >
//                   На главную
//                   <ArrowRight className="h-3 w-3" />
//                 </Link>
//               </div>
//             </div>
//           </aside>
//         </section>
//       </main>
//     </PageShell>
//   );
// }

// /* ===================== EXPORT ===================== */

// export default function PaymentPageClient(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950/95 to-black">
//           <div className="h-24 w-24 animate-spin rounded-full border-4 border-emerald-400/30 border-t-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.7)]" />
//         </div>
//       }
//     >
//       <PaymentPageClientInner />
//     </Suspense>
//   );
// }



// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { Suspense, useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import dynamic from "next/dynamic";

// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";

// import {
//   ArrowLeft,
//   ArrowRight,
//   CalendarClock,
//   Check,
//   CreditCard,
//   Info,
//   Lock,
//   Phone,
//   Receipt,
//   ShieldCheck,
//   Sparkles,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import("@/components/Ballpit"), {
//   ssr: false,
// });

// /* ===================== Типы ===================== */

// type PaymentMethod = "onsite" | "online";

// interface PaymentSummary {
//   serviceTitle: string;
//   masterName: string;
//   dateText: string;
//   timeText: string;
//   priceText: string;
//   durationText: string;
//   appointmentId: string;
// }

// /* ===================== Вспомогательные функции ===================== */

// function formatDateTime(dateIso: string | null, timeIso: string | null): {
//   dateText: string;
//   timeText: string;
// } {
//   if (!dateIso || !timeIso) {
//     return { dateText: "Дата не указана", timeText: "Время не указано" };
//   }

//   const date = new Date(dateIso);
//   const time = new Date(timeIso);

//   const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
//     weekday: "long",
//     day: "2-digit",
//     month: "long",
//   });

//   const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return {
//     dateText: dateFormatter.format(date),
//     timeText: timeFormatter.format(time),
//   };
// }

// /* ===================== Общий shell ===================== */

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function FloatingParticles() {
//   const [particles, setParticles] = React.useState<
//     Array<{ x: number; y: number; id: number; color: string }>
//   >([]);

//   React.useEffect(() => {
//     const colors = [
//       "bg-amber-400/30",
//       "bg-fuchsia-400/25",
//       "bg-sky-400/25",
//       "bg-emerald-400/25",
//       "bg-yellow-300/30",
//     ];

//     const nextParticles = [...Array(30)].map((_, index) => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       id: index,
//       color: colors[Math.floor(Math.random() * colors.length)],
//     }));

//     setParticles(nextParticles);
//   }, []);

//   if (particles.length === 0) return null;

//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <div
//           key={particle.id}
//           className={`pointer-events-none absolute h-1 w-1 rounded-full ${particle.color}`}
//           style={{
//             transform: `translate3d(${particle.x}px, ${particle.y}px, 0)`,
//             opacity: 0.6,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PageShell({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* СЛОЙ 1: базовый анимированный фон */}
//       <BookingAnimatedBackground />

//       {/* СЛОЙ 2: мягкие плавающие частицы */}
//       <FloatingParticles />

//       {/* СЛОЙ 3: большие цветные пятна (глоу) */}
//       <div className="pointer-events-none fixed inset-0 -z-30">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       {/* СЛОЙ 4: 3D Ballpit - интерактивные шары на заднем плане */}
//       <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
//         <Ballpit
//           className="h-full w-full"
//           count={20}
//           gravity={0}
//           friction={0.9995}
//           wallBounce={0.98}
//           maxVelocity={0.05}
//           minSize={0.4}
//           maxSize={0.8}
//           followCursor
//           colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
//         />
//       </div>

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <div className="relative z-10 min-h-screen">
//         {/* Хедер с прогрессом шагов */}
//         <header className="booking-header fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-md">
//           <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//             <PremiumProgressBar currentStep={6} steps={BOOKING_STEPS} />
//           </div>
//         </header>

//         {/* Отступ под хедер */}
//         <div className="h-[84px] md:h-[96px]" />

//         {children}
//       </div>

//       <style jsx global>{`
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
//         @keyframes bg-slide {
//           0%,
//           100% {
//             background-position: 0% 0%;
//           }
//           50% {
//             background-position: 100% 0%;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// /* ===================== HERO С ОПЛАТОЙ ===================== */

// function PaymentHero({ appointmentId }: { appointmentId: string }) {
//   return (
//     <section className="relative mx-auto w-full max-w-screen-2xl px-4 pb-10 pt-8 md:pt-10 xl:px-8">
//       {/* светящийся фон блока */}
//       <div className="pointer-events-none absolute inset-x-4 top-0 -z-10 h-[260px] rounded-[40px] bg-[radial-gradient(circle_at_10%_0%,rgba(251,191,36,0.4),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(56,189,248,0.35),transparent_55%)] blur-3xl md:inset-x-8 md:h-[280px]" />

//       <div className="relative mx-auto max-w-5xl text-center">
//         {/* бейдж шага */}
//         <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-2 text-sm font-semibold text-black shadow-[0_12px_40px_rgba(251,191,36,0.6)]">
//           <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
//             <CreditCard className="h-3.5 w-3.5" />
//           </span>
//           Шаг 6 — Оплата и финальное подтверждение
//         </div>

//         {/* заголовок */}
//         <h1 className="brand-script mt-6 text-4xl font-extrabold leading-tight text-amber-50 drop-shadow-[0_0_35px_rgba(0,0,0,0.9)] md:text-5xl lg:text-6xl">
//           Завершение записи
//         </h1>

//         {/* подзаголовок */}
//         <p className="mt-4 text-lg font-semibold italic tracking-wide text-cyan-200/95 md:text-xl">
//           Выберите способ оплаты и подтвердите бронь
//         </p>

//         {/* номер записи */}
//         <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100 md:text-sm">
//           <Receipt className="h-4 w-4 text-emerald-300" />
//           Номер записи:
//           <span className="font-mono text-emerald-200">{appointmentId}</span>
//         </p>
//       </div>
//     </section>
//   );
// }

// /* ===================== КАРТОЧКИ ОПЛАТЫ ===================== */

// interface PaymentMethodCardProps {
//   method: PaymentMethod;
//   selected: PaymentMethod;
//   onSelect: (method: PaymentMethod) => void;
// }

// function PaymentMethodCard({
//   method,
//   selected,
//   onSelect,
// }: PaymentMethodCardProps) {
//   const isActive = method === selected;

//   const title = method === "onsite" ? "Оплата в салоне" : "Онлайн-оплата";
//   const subtitle =
//     method === "onsite"
//       ? "На месте, после оказания услуги"
//       : "Скоро — банковской картой или PayPal";

//   const icon =
//     method === "onsite" ? (
//       <CreditCard className="h-5 w-5" />
//     ) : (
//       <Lock className="h-5 w-5" />
//     );

//   return (
//     <button
//       type="button"
//       onClick={() => onSelect(method)}
//       className={[
//         "group relative flex w-full items-center justify-between gap-4 rounded-3xl border px-5 py-4 text-left transition-all md:px-6 md:py-5",
//         "backdrop-blur-xl",
//         isActive
//           ? "border-emerald-400/80 bg-gradient-to-br from-emerald-500/25 via-slate-900/90 to-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.55)]"
//           : "border-white/10 bg-slate-900/80 hover:border-emerald-300/60 hover:bg-slate-900/95 hover:shadow-[0_0_28px_rgba(16,185,129,0.4)]",
//       ].join(" ")}
//     >
//       <div className="flex items-center gap-4">
//         <div
//           className={[
//             "flex h-11 w-11 items-center justify-center rounded-2xl border text-emerald-200 shadow-lg",
//             isActive
//               ? "border-emerald-300/80 bg-emerald-500/20"
//               : "border-emerald-300/40 bg-emerald-500/10 group-hover:bg-emerald-500/20",
//           ].join(" ")}
//         >
//           {icon}
//         </div>

//         <div>
//           <div className="flex items-center gap-2">
//             <h3 className="text-sm font-semibold text-white md:text-base">
//               {title}
//             </h3>
//             {method === "online" && (
//               <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
//                 скоро
//               </span>
//             )}
//           </div>
//           <p className="mt-1 text-xs text-slate-300 md:text-sm">{subtitle}</p>
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         {isActive && (
//           <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100 md:text-xs">
//             <Check className="h-3 w-3" />
//             Выбрано
//           </span>
//         )}
//         <div
//           className={[
//             "flex h-6 w-6 items-center justify-center rounded-full border text-emerald-200",
//             isActive
//               ? "border-emerald-300 bg-emerald-500/40"
//               : "border-emerald-300/50 bg-transparent group-hover:bg-emerald-500/20",
//           ].join(" ")}
//         >
//           {isActive && <Check className="h-3.5 w-3.5" />}
//         </div>
//       </div>

//       <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10 ring-offset-0 ring-offset-transparent" />
//     </button>
//   );
// }

// /* ===================== ОСНОВНАЯ СТРАНИЦА ОПЛАТЫ ===================== */

// function PaymentPageClientInner(): React.JSX.Element {
//   const searchParams = useSearchParams();

//   const appointmentId = searchParams.get("appointment") ?? "—";
//   const serviceTitle = searchParams.get("service") ?? "Услуга из записи";
//   const masterName = searchParams.get("master") ?? "Ваш мастер в SalonElen";

//   const dateIso = searchParams.get("date");
//   const timeIso = searchParams.get("time");

//   const { dateText, timeText } = formatDateTime(dateIso, timeIso);

//   const priceText = searchParams.get("price") ?? "По прайсу салона";
//   const durationText = searchParams.get("duration") ?? "45 минут";

//   const summary: PaymentSummary = {
//     serviceTitle,
//     masterName,
//     dateText,
//     timeText,
//     priceText,
//     durationText,
//     appointmentId,
//   };

//   const [method, setMethod] = useState<PaymentMethod>("onsite");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [submitDone, setSubmitDone] = useState(false);

//   useEffect(() => {
//     setSubmitError(null);
//   }, [method]);

//   const handleConfirm = async () => {
//     if (isSubmitting) return;
//     setIsSubmitting(true);
//     setSubmitError(null);

//     try {
//       await new Promise((resolve) => setTimeout(resolve, 800));
//       setSubmitDone(true);
//     } catch (error) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Не удалось подтвердить запись";
//       setSubmitError(message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const payHint =
//     method === "onsite"
//       ? "Вы оплатите услуги непосредственно в салоне после визита."
//       : "Онлайн-оплата появится позже. Сейчас вы просто фиксируете бронь.";

//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 pb-16 xl:px-8">
//         <PaymentHero appointmentId={appointmentId} />

//         {/* Основной грид: слева способ оплаты, справа резюме */}
//         <section className="relative mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
//           {/* ЛЕВАЯ КОЛОНКА – способы оплаты */}
//           <div className="relative">
//             <div className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-br from-emerald-400/50 via-cyan-500/30 to-sky-400/30 opacity-70 blur-3xl" />

//             <div className="relative rounded-[30px] border border-white/10 bg-slate-950/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur-2xl md:p-7">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
//                   <CreditCard className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/70">
//                     Способ оплаты
//                   </p>
//                   <h2 className="brand-script text-xl font-semibold text-white md:text-2xl">
//                     Выберите, как вам удобнее
//                   </h2>
//                 </div>
//               </div>

//               <div className="mt-5 space-y-3">
//                 <PaymentMethodCard
//                   method="onsite"
//                   selected={method}
//                   onSelect={setMethod}
//                 />
//                 <PaymentMethodCard
//                   method="online"
//                   selected={method}
//                   onSelect={setMethod}
//                 />
//               </div>

//               <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-xs text-emerald-50 md:text-sm">
//                 <div className="flex items-start gap-3">
//                   <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300 md:h-5 md:w-5" />
//                   <div>
//                     <p className="font-semibold">Гарантия сохранности брони</p>
//                     <p className="mt-1 text-emerald-100/90">
//                       Независимо от выбранного способа, ваша запись сохраняется
//                       в системе и администратор салона увидит её сразу после
//                       подтверждения.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-slate-300 md:text-sm">
//                 <div className="flex items-center gap-2">
//                   <Lock className="h-4 w-4 text-slate-200/80" />
//                   <span>
//                     Передача данных защищена, мы не храним данные банковских
//                     карт.
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Phone className="h-4 w-4 text-slate-200/80" />
//                   <span>
//                     Если у вас возникнут вопросы, администратор свяжется с вами
//                     по указанному телефону или e-mail.
//                   </span>
//                 </div>
//               </div>

//               {/* Кнопки */}
//               <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
//                 <button
//                   type="button"
//                   onClick={handleConfirm}
//                   disabled={isSubmitting}
//                   className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-black shadow-[0_18px_40px_rgba(52,211,153,0.7)] transition-all hover:shadow-[0_24px_55px_rgba(52,211,153,0.9)] disabled:cursor-wait disabled:opacity-70 md:text-base"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
//                       Подтверждаем запись…
//                     </>
//                   ) : submitDone ? (
//                     <>
//                       <Check className="h-4 w-4" />
//                       Запись подтверждена
//                     </>
//                   ) : (
//                     <>
//                       <Sparkles className="h-4 w-4" />
//                       Подтвердить бронь
//                     </>
//                   )}
//                 </button>

//                 <Link
//                   href="/booking/verify"
//                   className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm text-slate-100 transition-all hover:border-emerald-300/70 hover:bg-white/5 md:text-base"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Назад к проверке
//                 </Link>
//               </div>

//               {submitError && (
//                 <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-100 md:text-sm">
//                   <div className="flex items-start gap-2">
//                     <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
//                     <p>{submitError}</p>
//                   </div>
//                 </div>
//               )}

//               <p className="mt-4 text-xs text-slate-400">
//                 {payHint}
//               </p>
//             </div>
//           </div>

//           {/* ПРАВАЯ КОЛОНКА – резюме записи */}
//           <aside className="relative">
//             <div className="pointer-events-none absolute -inset-1 rounded-[32px] bg-gradient-to-br from-cyan-400/45 via-blue-500/40 to-indigo-500/40 opacity-80 blur-3xl" />

//             <div className="relative rounded-[30px] border border-white/10 bg-slate-950/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.95)] backdrop-blur-2xl md:p-7">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-200">
//                   <CalendarClock className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
//                     Резюме записи
//                   </p>
//                   <h2 className="brand-script text-xl font-semibold text-white md:text-2xl">
//                     Ваш визит в SalonElen
//                   </h2>
//                 </div>
//               </div>

//               <div className="mt-5 space-y-4 text-sm text-slate-100 md:text-base">
//                 <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                   <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                     Услуга
//                   </p>
//                   <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                     {summary.serviceTitle}
//                   </p>
//                   <p className="mt-1 flex items-center gap-2 text-xs text-slate-300 md:text-sm">
//                     <User2 className="h-4 w-4 text-slate-300" />
//                     Мастер:{" "}
//                     <span className="font-medium text-slate-100">
//                       {summary.masterName}
//                     </span>
//                   </p>
//                 </div>

//                 <div className="grid gap-3 md:grid-cols-2">
//                   <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                     <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                       Дата и время
//                     </p>
//                     <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                       {summary.dateText}
//                     </p>
//                     <p className="mt-0.5 text-sm text-amber-200">
//                       {summary.timeText}
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-slate-900/80 p-4 ring-1 ring-white/10">
//                     <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
//                       Продолжительность
//                     </p>
//                     <p className="mt-1 text-sm font-semibold text-white md:text-base">
//                       {summary.durationText}
//                     </p>
//                     <p className="mt-0.5 text-xs text-slate-300">
//                       Время указано с запасом по регламенту салона.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-emerald-500/15 p-4 ring-1 ring-emerald-300/40">
//                   <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">
//                     Стоимость
//                   </p>
//                   <p className="mt-1 text-lg font-semibold text-emerald-200">
//                     {summary.priceText}
//                   </p>
//                   <p className="mt-1 text-xs text-emerald-100/80">
//                     Итоговая сумма может незначительно отличаться в зависимости
//                     от выбранных дополнительных услуг и материалов.
//                   </p>
//                 </div>

//                 <div className="rounded-2xl border border-dashed border-slate-600/70 bg-slate-900/80 p-4 text-xs text-slate-300 md:text-sm">
//                   <div className="flex items-start gap-2">
//                     <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-200/90" />
//                     <p>
//                       Если вам понадобится изменить или отменить запись, просто
//                       свяжитесь с нами любым удобным способом. Пожалуйста,
//                       предупредите не менее чем за 24 часа — так мы сможем
//                       предложить это время другому гостю.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-slate-400 md:text-sm">
//                 <span>Мы очень ждём вас в салоне ✨</span>
//                 <Link
//                   href="/"
//                   className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300 hover:text-cyan-200"
//                 >
//                   На главную
//                   <ArrowRight className="h-3 w-3" />
//                 </Link>
//               </div>
//             </div>
//           </aside>
//         </section>
//       </main>
//     </PageShell>
//   );
// }

// /* ===================== EXPORT ===================== */

// export default function PaymentPageClient(): React.JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950/95 to-black">
//           <div className="h-24 w-24 animate-spin rounded-full border-4 border-emerald-400/30 border-t-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.7)]" />
//         </div>
//       }
//     >
//       <PaymentPageClientInner />
//     </Suspense>
//   );
// }




//----------работает, но пытаюсь добить больше площадь для шаров и залезание на футер-----
// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import dynamic from 'next/dynamic';
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   Crown,
//   Check,
//   Clock3,
//   MapPin,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// /* ===================== Floating Particles - PREMIUM VERSION ===================== */
// function FloatingParticles() {
//   const [particles, setParticles] = React.useState<Array<{ x: number; y: number; id: number; color: string }>>([]);

//   React.useEffect(() => {
//     const colors = [
//       "bg-amber-400/30",
//       "bg-fuchsia-400/25",
//       "bg-sky-400/25",
//       "bg-emerald-400/25",
//       "bg-yellow-300/30",
//     ];
    
//     const newParticles = [...Array(30)].map((_, i) => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       id: i,
//       color: colors[Math.floor(Math.random() * colors.length)],
//     }));
//     setParticles(newParticles);
//   }, []);

//   if (particles.length === 0) return null;

//   return (
//     <div className="pointer-events-none absolute inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <motion.div
//           key={particle.id}
//           className={`absolute h-1 w-1 rounded-full ${particle.color}`}
//           initial={{ x: particle.x, y: particle.y, opacity: 0 }}
//           animate={{
//             x: [particle.x, Math.random() * window.innerWidth, particle.x],
//             y: [particle.y, Math.random() * window.innerHeight, particle.y],
//             scale: [1, 2, 1],
//             opacity: [0.3, 1, 0.3],
//           }}
//           transition={{
//             duration: Math.random() * 15 + 10,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* СЛОЙ 1: Анимированный фон (BookingAnimatedBackground) */}
//       <BookingAnimatedBackground />
      
//       {/* СЛОЙ 2: Floating Particles */}
//       <FloatingParticles />

//       {/* СЛОЙ 3: Премиальный фон с радиальными градиентами */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       {/* СЛОЙ 4: 3D Ballpit - ИНТЕРАКТИВНЫЕ ШАРЫ НА ЗАДНЕМ ФОНЕ */}
//       <Ballpit
//         count={20}
//         gravity={0}
//         friction={0.9995}
//         wallBounce={0.98}
//         maxVelocity={0.05}
//         minSize={0.4}
//         maxSize={0.8}
//         followCursor={true}
//         colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
//       />

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header pointer-events-auto fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[84px] md:h-[96px]" />

//       {children}

//       <style jsx global>{`
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
        
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }

// function VideoSection(): React.JSX.Element {
//   return (
//     <section className="pointer-events-auto relative z-10 py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]"
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

// export default function PaymentPageClient(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [showModal, setShowModal] = React.useState(false);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//       );
//       return;
//     }

//     setError(null);
//     setShowModal(true);
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur-xl">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="pointer-events-auto relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* ПРЕМИУМ ЗАГОЛОВОК */}
//         <div className="relative z-10 flex w-full flex-col items-center text-center pt-8">
//           {/* Ultra Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-8"
//           >
//             <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
//             >
//               <Crown className="h-5 w-5 text-black drop-shadow-lg" />
//               <span className="font-serif text-base font-bold italic text-black drop-shadow-sm md:text-lg">
//                 Шаг 6 — Оплата и финальное подтверждение
//               </span>
//             </motion.div>
//           </motion.div>

//           {/* Title - НОВЫЙ КОНТРАСТНЫЙ ЦВЕТ */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="brand-script relative mb-4 text-4xl font-bold italic leading-tight md:text-5xl lg:text-6xl"
//             style={{
//               color: '#FFFFFF',
//               textShadow: `
//                 0 0 40px rgba(251,191,36,0.8),
//                 0 0 60px rgba(251,191,36,0.6),
//                 0 2px 8px rgba(0,0,0,0.9),
//                 0 4px 16px rgba(0,0,0,0.7)
//               `,
//             }}
//           >
//             Завершение записи
//           </motion.h1>

//           {/* Subtitle - НОВЫЙ ЯРКИЙ КОНТРАСТНЫЙ ЦВЕТ */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script relative mx-auto max-w-3xl text-xl font-semibold italic tracking-wide md:text-2xl lg:text-3xl"
//             style={{
//               color: '#FF6EC7',
//               textShadow: `
//                 0 0 20px rgba(255,110,199,0.8),
//                 0 0 30px rgba(255,110,199,0.5),
//                 0 2px 6px rgba(0,0,0,0.8),
//                 0 4px 12px rgba(0,0,0,0.6)
//               `,
//             }}
//           >
//             Выберите способ оплаты и подтвердите бронь
//           </motion.p>

//           {/* Appointment ID - НОВЫЙ СВЕТЛЫЙ ЦВЕТ */}
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-4 text-sm"
//             style={{
//               color: '#E5E7EB',
//               textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
//             }}
//           >
//             Номер записи:{" "}
//             <span 
//               className="font-mono font-semibold"
//               style={{
//                 color: '#FCD34D',
//                 textShadow: '0 0 10px rgba(252,211,77,0.6), 0 2px 4px rgba(0,0,0,0.8)',
//               }}
//             >
//               {appointmentId}
//             </span>
//           </motion.p>

//           {/* Декоративная линия */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ 
//               scaleX: [1, 1.5, 1],
//               opacity: [0.8, 1, 0.8],
//             }}
//             transition={{ 
//               scaleX: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//               opacity: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//             }}
//             className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] md:w-40"
//           />
//         </div>

//         {/* Два столбца: выбор оплаты + резюме */}
//         <div className="relative z-10 mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
//           {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
//           <motion.section
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="relative z-10"
//           >
//             {/* ПРЕМИАЛЬНАЯ ОБЁРТКА */}
//             <div className="relative z-10 rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-emerald-200/20 to-teal-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

//               {/* ВНУТРЕННЯЯ КАРТОЧКА */}
//               <div className="relative z-10 overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 {/* Внутренние подсветки */}
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

//                 <div className="relative space-y-6">
//                   {/* Заголовок секции */}
//                   <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
//                     <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
//                       <CreditCard className="h-4 w-4 text-emerald-300" />
//                     </span>
//                     Способ оплаты
//                   </h2>

//                   {/* Методы оплаты */}
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {/* Оплата в салоне */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("onsite");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "onsite"
//                           ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
//                             <Wallet className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Оплата в салоне</div>
//                             <div className="text-xs text-slate-400">На месте</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "onsite" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-white" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Наличные или карта в салоне</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Без предоплаты</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Оплата после услуги</span>
//                         </li>
//                       </ul>
//                     </motion.button>

//                     {/* Онлайн-оплата - скоро */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("online_soon");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "online_soon"
//                           ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
//                             <CreditCard className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Онлайн-оплата</div>
//                             <div className="text-xs text-slate-400">Скоро</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "online_soon" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-black" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Карта, Apple Pay, Google Pay</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>В разработке</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Запись всё равно будет подтверждена</span>
//                         </li>
//                       </ul>
//                     </motion.button>
//                   </div>

//                   {/* Инфо блок */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 font-bold text-white">
//                       <ShieldCheck className="h-4 w-4 text-emerald-400" />
//                       Как это работает?
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Система уже создала запись в расписании салона. Оплата фиксируется
//                       на стороне салона. Онлайн-оплата будет добавлена позже.
//                     </p>
//                   </div>

//                   {/* Сообщения об ошибке */}
//                   <AnimatePresence>
//                     {error && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl"
//                       >
//                         <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
//                         <span className="text-sm text-red-200">{error}</span>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {/* Кнопка подтверждения */}
//                   <div className="pt-2">
//                     <motion.button
//                       type="button"
//                       onClick={handleConfirm}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                     >
//                       <CheckCircle2 className="h-5 w-5" />
//                       Подтвердить запись
//                     </motion.button>
//                     <p className="mt-3 text-center text-xs text-slate-400">
//                       Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона
//                     </p>
//                   </div>
//                 </div>

//                 {/* Нижняя линия */}
//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.section>

//           {/* ПРЕМИУМ РЕЗЮМЕ */}
//           <motion.aside
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             className="relative z-10"
//           >
//             <div className="relative z-10 rounded-[32px] bg-gradient-to-br from-cyan-400/80 via-sky-200/20 to-blue-400/60 p-[1.5px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

//               <div className="relative z-10 overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

//                 <div className="relative space-y-5">
//                   <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
//                     <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
//                       <Scissors className="h-5 w-5 text-cyan-300" />
//                     </span>
//                     <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
//                       Резюме записи
//                     </span>
//                   </h3>

//                   {/* Детали записи */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <div className="flex items-center gap-2 text-sm font-semibold text-white">
//                       <User2 className="h-5 w-5 text-cyan-400" />
//                       <span>Ваш визит в SalonElen</span>
//                     </div>
//                     <ul className="space-y-2 text-sm text-slate-300">
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Услуга из записи (Appointment)</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Мастер из записи</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Дата и время по ID: {appointmentId.slice(0, 8)}...</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Адрес салона</span>
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Политика отмены */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
//                       <MapPin className="h-4 w-4 text-cyan-400" />
//                       Политика отмены
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Если вы не сможете прийти, пожалуйста, отмените запись заранее —
//                       это позволит освободить время для других гостей салона.
//                     </p>
//                   </div>

//                   <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
//                     После запуска онлайн-оплаты здесь появится блок выбора платёжного
//                     метода и статус платежа
//                   </div>
//                 </div>

//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       {/* ПРЕМИУМ МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             key="modal-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               key="modal-content"
//               initial={{ scale: 0.8, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ type: "spring", stiffness: 220, damping: 22 }}
//               className="relative w-full max-w-lg"
//               onClick={(event) => event.stopPropagation()}
//             >
//               {/* Премиальная обёртка модалки */}
//               <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
//                 <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

//                 <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                   {/* Внутренние подсветки */}
//                   <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
//                   <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

//                   {/* Кнопка закрытия */}
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>

//                   <div className="relative z-10 text-center">
//                     {/* Success icon */}
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                       className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
//                     >
//                       <CheckCircle2 className="h-10 w-10 text-emerald-300" />
//                     </motion.div>

//                     <h2 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-3xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] md:text-4xl">
//                       Запись подтверждена!
//                     </h2>

//                     <p className="mb-8 text-base text-slate-200 md:text-lg">
//                       Ваша запись успешно подтверждена. Оплата будет произведена в
//                       салоне.
//                     </p>

//                     <div className="flex flex-col gap-3">
//                       <Link
//                         href="/"
//                         className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-center font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                       >
//                         На главную страницу
//                       </Link>

//                       <Link
//                         href="/booking"
//                         className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
//                       >
//                         Сделать новую запись
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <VideoSection />
//     </PageShell>
//   );
// }


// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import dynamic from 'next/dynamic';
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   Crown,
//   Check,
//   Clock3,
//   MapPin,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// /* ===================== Floating Particles - PREMIUM VERSION ===================== */
// function FloatingParticles() {
//   const [particles, setParticles] = React.useState<Array<{ x: number; y: number; id: number; color: string }>>([]);

//   React.useEffect(() => {
//     const colors = [
//       "bg-amber-400/30",
//       "bg-fuchsia-400/25",
//       "bg-sky-400/25",
//       "bg-emerald-400/25",
//       "bg-yellow-300/30",
//     ];
    
//     const newParticles = [...Array(30)].map((_, i) => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       id: i,
//       color: colors[Math.floor(Math.random() * colors.length)],
//     }));
//     setParticles(newParticles);
//   }, []);

//   if (particles.length === 0) return null;

//   return (
//     <div className="pointer-events-none absolute inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <motion.div
//           key={particle.id}
//           className={`absolute h-1 w-1 rounded-full ${particle.color}`}
//           initial={{ x: particle.x, y: particle.y, opacity: 0 }}
//           animate={{
//             x: [particle.x, Math.random() * window.innerWidth, particle.x],
//             y: [particle.y, Math.random() * window.innerHeight, particle.y],
//             scale: [1, 2, 1],
//             opacity: [0.3, 1, 0.3],
//           }}
//           transition={{
//             duration: Math.random() * 15 + 10,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* СЛОЙ 1: Анимированный фон (BookingAnimatedBackground) */}
//       <BookingAnimatedBackground />
      
//       {/* СЛОЙ 2: Floating Particles */}
//       <FloatingParticles />

//       {/* СЛОЙ 3: Премиальный фон с радиальными градиентами */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       {/* СЛОЙ 4: 3D Ballpit - ИНТЕРАКТИВНЫЕ ШАРЫ НА ЗАДНЕМ ФОНЕ */}
//       <div 
//         className="fixed inset-0 z-[1]" 
//         style={{ touchAction: 'none' }}
//       >
//         <Ballpit
//           count={25}
//           gravity={0}
//           friction={0.9995}
//           wallBounce={0.98}
//           maxVelocity={0.05}
//           minSize={0.3}
//           maxSize={0.7}
//           followCursor={true}
//           colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
//         />
//       </div>

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header pointer-events-auto fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[84px] md:h-[96px]" />

//       {children}

//       <style jsx global>{`
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
        
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }

// function VideoSection(): React.JSX.Element {
//   return (
//     <section className="pointer-events-auto relative z-10 py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]"
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

// export default function PaymentPageClient(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [showModal, setShowModal] = React.useState(false);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//       );
//       return;
//     }

//     setError(null);
//     setShowModal(true);
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur-xl">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="pointer-events-auto relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* ПРЕМИУМ ЗАГОЛОВОК */}
//         <div className="flex w-full flex-col items-center text-center pt-8">
//           {/* Ultra Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-8"
//           >
//             <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
//             >
//               <Crown className="h-5 w-5 text-black drop-shadow-lg" />
//               <span className="font-serif text-base font-bold italic text-black drop-shadow-sm md:text-lg">
//                 Шаг 6 — Оплата и финальное подтверждение
//               </span>
//             </motion.div>
//           </motion.div>

//           {/* Title - НОВЫЙ КОНТРАСТНЫЙ ЦВЕТ */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="brand-script relative mb-4 text-4xl font-bold italic leading-tight md:text-5xl lg:text-6xl"
//             style={{
//               color: '#FFFFFF',
//               textShadow: `
//                 0 0 40px rgba(251,191,36,0.8),
//                 0 0 60px rgba(251,191,36,0.6),
//                 0 2px 8px rgba(0,0,0,0.9),
//                 0 4px 16px rgba(0,0,0,0.7)
//               `,
//             }}
//           >
//             Завершение записи
//           </motion.h1>

//           {/* Subtitle - НОВЫЙ ЯРКИЙ КОНТРАСТНЫЙ ЦВЕТ */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script relative mx-auto max-w-3xl text-xl font-semibold italic tracking-wide md:text-2xl lg:text-3xl"
//             style={{
//               color: '#FF6EC7',
//               textShadow: `
//                 0 0 20px rgba(255,110,199,0.8),
//                 0 0 30px rgba(255,110,199,0.5),
//                 0 2px 6px rgba(0,0,0,0.8),
//                 0 4px 12px rgba(0,0,0,0.6)
//               `,
//             }}
//           >
//             Выберите способ оплаты и подтвердите бронь
//           </motion.p>

//           {/* Appointment ID - НОВЫЙ СВЕТЛЫЙ ЦВЕТ */}
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-4 text-sm"
//             style={{
//               color: '#E5E7EB',
//               textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
//             }}
//           >
//             Номер записи:{" "}
//             <span 
//               className="font-mono font-semibold"
//               style={{
//                 color: '#FCD34D',
//                 textShadow: '0 0 10px rgba(252,211,77,0.6), 0 2px 4px rgba(0,0,0,0.8)',
//               }}
//             >
//               {appointmentId}
//             </span>
//           </motion.p>

//           {/* Декоративная линия */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ 
//               scaleX: [1, 1.5, 1],
//               opacity: [0.8, 1, 0.8],
//             }}
//             transition={{ 
//               scaleX: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//               opacity: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//             }}
//             className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] md:w-40"
//           />
//         </div>

//         {/* Два столбца: выбор оплаты + резюме */}
//         <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
//           {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
//           <motion.section
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="relative"
//           >
//             {/* ПРЕМИАЛЬНАЯ ОБЁРТКА */}
//             <div className="relative rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-emerald-200/20 to-teal-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

//               {/* ВНУТРЕННЯЯ КАРТОЧКА */}
//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 {/* Внутренние подсветки */}
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

//                 <div className="relative space-y-6">
//                   {/* Заголовок секции */}
//                   <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
//                     <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
//                       <CreditCard className="h-4 w-4 text-emerald-300" />
//                     </span>
//                     Способ оплаты
//                   </h2>

//                   {/* Методы оплаты */}
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {/* Оплата в салоне */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("onsite");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "onsite"
//                           ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
//                             <Wallet className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Оплата в салоне</div>
//                             <div className="text-xs text-slate-400">На месте</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "onsite" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-white" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Наличные или карта в салоне</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Без предоплаты</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Оплата после услуги</span>
//                         </li>
//                       </ul>
//                     </motion.button>

//                     {/* Онлайн-оплата - скоро */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("online_soon");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "online_soon"
//                           ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
//                             <CreditCard className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Онлайн-оплата</div>
//                             <div className="text-xs text-slate-400">Скоро</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "online_soon" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-black" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Карта, Apple Pay, Google Pay</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>В разработке</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Запись всё равно будет подтверждена</span>
//                         </li>
//                       </ul>
//                     </motion.button>
//                   </div>

//                   {/* Инфо блок */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 font-bold text-white">
//                       <ShieldCheck className="h-4 w-4 text-emerald-400" />
//                       Как это работает?
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Система уже создала запись в расписании салона. Оплата фиксируется
//                       на стороне салона. Онлайн-оплата будет добавлена позже.
//                     </p>
//                   </div>

//                   {/* Сообщения об ошибке */}
//                   <AnimatePresence>
//                     {error && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl"
//                       >
//                         <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
//                         <span className="text-sm text-red-200">{error}</span>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {/* Кнопка подтверждения */}
//                   <div className="pt-2">
//                     <motion.button
//                       type="button"
//                       onClick={handleConfirm}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                     >
//                       <CheckCircle2 className="h-5 w-5" />
//                       Подтвердить запись
//                     </motion.button>
//                     <p className="mt-3 text-center text-xs text-slate-400">
//                       Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона
//                     </p>
//                   </div>
//                 </div>

//                 {/* Нижняя линия */}
//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.section>

//           {/* ПРЕМИУМ РЕЗЮМЕ */}
//           <motion.aside
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             className="relative"
//           >
//             <div className="relative rounded-[32px] bg-gradient-to-br from-cyan-400/80 via-sky-200/20 to-blue-400/60 p-[1.5px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

//                 <div className="relative space-y-5">
//                   <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
//                     <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
//                       <Scissors className="h-5 w-5 text-cyan-300" />
//                     </span>
//                     <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
//                       Резюме записи
//                     </span>
//                   </h3>

//                   {/* Детали записи */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <div className="flex items-center gap-2 text-sm font-semibold text-white">
//                       <User2 className="h-5 w-5 text-cyan-400" />
//                       <span>Ваш визит в SalonElen</span>
//                     </div>
//                     <ul className="space-y-2 text-sm text-slate-300">
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Услуга из записи (Appointment)</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Мастер из записи</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Дата и время по ID: {appointmentId.slice(0, 8)}...</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Адрес салона</span>
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Политика отмены */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
//                       <MapPin className="h-4 w-4 text-cyan-400" />
//                       Политика отмены
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Если вы не сможете прийти, пожалуйста, отмените запись заранее —
//                       это позволит освободить время для других гостей салона.
//                     </p>
//                   </div>

//                   <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
//                     После запуска онлайн-оплаты здесь появится блок выбора платёжного
//                     метода и статус платежа
//                   </div>
//                 </div>

//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       {/* ПРЕМИУМ МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             key="modal-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               key="modal-content"
//               initial={{ scale: 0.8, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ type: "spring", stiffness: 220, damping: 22 }}
//               className="relative w-full max-w-lg"
//               onClick={(event) => event.stopPropagation()}
//             >
//               {/* Премиальная обёртка модалки */}
//               <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
//                 <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

//                 <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                   {/* Внутренние подсветки */}
//                   <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
//                   <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

//                   {/* Кнопка закрытия */}
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>

//                   <div className="relative z-10 text-center">
//                     {/* Success icon */}
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                       className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
//                     >
//                       <CheckCircle2 className="h-10 w-10 text-emerald-300" />
//                     </motion.div>

//                     <h2 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-3xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] md:text-4xl">
//                       Запись подтверждена!
//                     </h2>

//                     <p className="mb-8 text-base text-slate-200 md:text-lg">
//                       Ваша запись успешно подтверждена. Оплата будет произведена в
//                       салоне.
//                     </p>

//                     <div className="flex flex-col gap-3">
//                       <Link
//                         href="/"
//                         className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-center font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                       >
//                         На главную страницу
//                       </Link>

//                       <Link
//                         href="/booking"
//                         className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
//                       >
//                         Сделать новую запись
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <VideoSection />
//     </PageShell>
//   );
// }


//---------убираем шары на задний фон--------
// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import dynamic from 'next/dynamic';
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   Crown,
//   Check,
//   Clock3,
//   MapPin,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// /* ===================== Floating Particles - PREMIUM VERSION ===================== */
// function FloatingParticles() {
//   const [particles, setParticles] = React.useState<Array<{ x: number; y: number; id: number; color: string }>>([]);

//   React.useEffect(() => {
//     const colors = [
//       "bg-amber-400/30",
//       "bg-fuchsia-400/25",
//       "bg-sky-400/25",
//       "bg-emerald-400/25",
//       "bg-yellow-300/30",
//     ];
    
//     const newParticles = [...Array(30)].map((_, i) => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       id: i,
//       color: colors[Math.floor(Math.random() * colors.length)],
//     }));
//     setParticles(newParticles);
//   }, []);

//   if (particles.length === 0) return null;

//   return (
//     <div className="pointer-events-none absolute inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <motion.div
//           key={particle.id}
//           className={`absolute h-1 w-1 rounded-full ${particle.color}`}
//           initial={{ x: particle.x, y: particle.y, opacity: 0 }}
//           animate={{
//             x: [particle.x, Math.random() * window.innerWidth, particle.x],
//             y: [particle.y, Math.random() * window.innerHeight, particle.y],
//             scale: [1, 2, 1],
//             opacity: [0.3, 1, 0.3],
//           }}
//           transition={{
//             duration: Math.random() * 15 + 10,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* СЛОЙ 1: Анимированный фон (BookingAnimatedBackground) */}
//       <BookingAnimatedBackground />
      
//       {/* СЛОЙ 2: Floating Particles */}
//       <FloatingParticles />

//       {/* СЛОЙ 3: Премиальный фон с радиальными градиентами */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       {/* СЛОЙ 4: 3D Ballpit (поверх всего фона) */}
//       <div className="pointer-events-none fixed inset-0 z-[1]">
//         <Ballpit
//           count={20}
//           gravity={0}
//           friction={0.9995} // Легкое трение для медленного движения
//           wallBounce={0.98}  // Почти упругое отскок
//           maxVelocity={0.05}  // Максимальная скорость частиц
//           minSize={0.3}
//           maxSize={0.9}
//           followCursor={true} // Частицы реагируют на движение курсора
//           colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
//         />
//       </div>

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[84px] md:h-[96px]" />

//       {children}

//       <style jsx global>{`
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
        
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }

// function VideoSection(): React.JSX.Element {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]"
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

// export default function PaymentPageClient(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [showModal, setShowModal] = React.useState(false);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//       );
//       return;
//     }

//     setError(null);
//     setShowModal(true);
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur-xl">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* ПРЕМИУМ ЗАГОЛОВОК */}
//         <div className="flex w-full flex-col items-center text-center pt-8">
//           {/* Ultra Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-8"
//           >
//             <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
//             >
//               <Crown className="h-5 w-5 text-black drop-shadow-lg" />
//               <span className="font-serif text-base font-bold italic text-black drop-shadow-sm md:text-lg">
//                 Шаг 6 — Оплата и финальное подтверждение
//               </span>
//             </motion.div>
//           </motion.div>

//           {/* Title - НОВЫЙ КОНТРАСТНЫЙ ЦВЕТ */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="brand-script relative mb-4 text-4xl font-bold italic leading-tight md:text-5xl lg:text-6xl"
//             style={{
//               color: '#FFFFFF',
//               textShadow: `
//                 0 0 40px rgba(251,191,36,0.8),
//                 0 0 60px rgba(251,191,36,0.6),
//                 0 2px 8px rgba(0,0,0,0.9),
//                 0 4px 16px rgba(0,0,0,0.7)
//               `,
//             }}
//           >
//             Завершение записи
//           </motion.h1>

//           {/* Subtitle - НОВЫЙ ЯРКИЙ КОНТРАСТНЫЙ ЦВЕТ */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script relative mx-auto max-w-3xl text-xl font-semibold italic tracking-wide md:text-2xl lg:text-3xl"
//             style={{
//               color: '#FF6EC7',
//               textShadow: `
//                 0 0 20px rgba(255,110,199,0.8),
//                 0 0 30px rgba(255,110,199,0.5),
//                 0 2px 6px rgba(0,0,0,0.8),
//                 0 4px 12px rgba(0,0,0,0.6)
//               `,
//             }}
//           >
//             Выберите способ оплаты и подтвердите бронь
//           </motion.p>

//           {/* Appointment ID - НОВЫЙ СВЕТЛЫЙ ЦВЕТ */}
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-4 text-sm"
//             style={{
//               color: '#E5E7EB',
//               textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
//             }}
//           >
//             Номер записи:{" "}
//             <span 
//               className="font-mono font-semibold"
//               style={{
//                 color: '#FCD34D',
//                 textShadow: '0 0 10px rgba(252,211,77,0.6), 0 2px 4px rgba(0,0,0,0.8)',
//               }}
//             >
//               {appointmentId}
//             </span>
//           </motion.p>

//           {/* Декоративная линия */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ 
//               scaleX: [1, 1.5, 1],
//               opacity: [0.8, 1, 0.8],
//             }}
//             transition={{ 
//               scaleX: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//               opacity: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//             }}
//             className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] md:w-40"
//           />
//         </div>

//         {/* Два столбца: выбор оплаты + резюме */}
//         <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
//           {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
//           <motion.section
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="relative"
//           >
//             {/* ПРЕМИАЛЬНАЯ ОБЁРТКА */}
//             <div className="relative rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-emerald-200/20 to-teal-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

//               {/* ВНУТРЕННЯЯ КАРТОЧКА */}
//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 {/* Внутренние подсветки */}
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

//                 <div className="relative space-y-6">
//                   {/* Заголовок секции */}
//                   <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
//                     <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
//                       <CreditCard className="h-4 w-4 text-emerald-300" />
//                     </span>
//                     Способ оплаты
//                   </h2>

//                   {/* Методы оплаты */}
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {/* Оплата в салоне */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("onsite");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "onsite"
//                           ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
//                             <Wallet className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Оплата в салоне</div>
//                             <div className="text-xs text-slate-400">На месте</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "onsite" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-white" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Наличные или карта в салоне</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Без предоплаты</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Оплата после услуги</span>
//                         </li>
//                       </ul>
//                     </motion.button>

//                     {/* Онлайн-оплата - скоро */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("online_soon");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "online_soon"
//                           ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
//                             <CreditCard className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Онлайн-оплата</div>
//                             <div className="text-xs text-slate-400">Скоро</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "online_soon" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-black" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Карта, Apple Pay, Google Pay</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>В разработке</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Запись всё равно будет подтверждена</span>
//                         </li>
//                       </ul>
//                     </motion.button>
//                   </div>

//                   {/* Инфо блок */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 font-bold text-white">
//                       <ShieldCheck className="h-4 w-4 text-emerald-400" />
//                       Как это работает?
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Система уже создала запись в расписании салона. Оплата фиксируется
//                       на стороне салона. Онлайн-оплата будет добавлена позже.
//                     </p>
//                   </div>

//                   {/* Сообщения об ошибке */}
//                   <AnimatePresence>
//                     {error && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl"
//                       >
//                         <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
//                         <span className="text-sm text-red-200">{error}</span>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {/* Кнопка подтверждения */}
//                   <div className="pt-2">
//                     <motion.button
//                       type="button"
//                       onClick={handleConfirm}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                     >
//                       <CheckCircle2 className="h-5 w-5" />
//                       Подтвердить запись
//                     </motion.button>
//                     <p className="mt-3 text-center text-xs text-slate-400">
//                       Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона
//                     </p>
//                   </div>
//                 </div>

//                 {/* Нижняя линия */}
//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.section>

//           {/* ПРЕМИУМ РЕЗЮМЕ */}
//           <motion.aside
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             className="relative"
//           >
//             <div className="relative rounded-[32px] bg-gradient-to-br from-cyan-400/80 via-sky-200/20 to-blue-400/60 p-[1.5px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

//                 <div className="relative space-y-5">
//                   <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
//                     <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
//                       <Scissors className="h-5 w-5 text-cyan-300" />
//                     </span>
//                     <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
//                       Резюме записи
//                     </span>
//                   </h3>

//                   {/* Детали записи */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <div className="flex items-center gap-2 text-sm font-semibold text-white">
//                       <User2 className="h-5 w-5 text-cyan-400" />
//                       <span>Ваш визит в SalonElen</span>
//                     </div>
//                     <ul className="space-y-2 text-sm text-slate-300">
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Услуга из записи (Appointment)</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Мастер из записи</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Дата и время по ID: {appointmentId.slice(0, 8)}...</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Адрес салона</span>
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Политика отмены */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
//                       <MapPin className="h-4 w-4 text-cyan-400" />
//                       Политика отмены
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Если вы не сможете прийти, пожалуйста, отмените запись заранее —
//                       это позволит освободить время для других гостей салона.
//                     </p>
//                   </div>

//                   <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
//                     После запуска онлайн-оплаты здесь появится блок выбора платёжного
//                     метода и статус платежа
//                   </div>
//                 </div>

//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       {/* ПРЕМИУМ МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             key="modal-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               key="modal-content"
//               initial={{ scale: 0.8, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ type: "spring", stiffness: 220, damping: 22 }}
//               className="relative w-full max-w-lg"
//               onClick={(event) => event.stopPropagation()}
//             >
//               {/* Премиальная обёртка модалки */}
//               <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
//                 <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

//                 <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                   {/* Внутренние подсветки */}
//                   <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
//                   <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

//                   {/* Кнопка закрытия */}
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>

//                   <div className="relative z-10 text-center">
//                     {/* Success icon */}
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                       className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
//                     >
//                       <CheckCircle2 className="h-10 w-10 text-emerald-300" />
//                     </motion.div>

//                     <h2 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-3xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] md:text-4xl">
//                       Запись подтверждена!
//                     </h2>

//                     <p className="mb-8 text-base text-slate-200 md:text-lg">
//                       Ваша запись успешно подтверждена. Оплата будет произведена в
//                       салоне.
//                     </p>

//                     <div className="flex flex-col gap-3">
//                       <Link
//                         href="/"
//                         className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-center font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                       >
//                         На главную страницу
//                       </Link>

//                       <Link
//                         href="/booking"
//                         className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
//                       >
//                         Сделать новую запись
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <VideoSection />
//     </PageShell>
//   );
// }



//---------всё работает, но меняем цвет надписей--------
// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import dynamic from 'next/dynamic';
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   Crown,
//   Check,
//   Clock3,
//   MapPin,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// /* ===================== Floating Particles - PREMIUM VERSION ===================== */
// function FloatingParticles() {
//   const [particles, setParticles] = React.useState<Array<{ x: number; y: number; id: number; color: string }>>([]);

//   React.useEffect(() => {
//     const colors = [
//       "bg-amber-400/30",
//       "bg-fuchsia-400/25",
//       "bg-sky-400/25",
//       "bg-emerald-400/25",
//       "bg-yellow-300/30",
//     ];
    
//     const newParticles = [...Array(30)].map((_, i) => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       id: i,
//       color: colors[Math.floor(Math.random() * colors.length)],
//     }));
//     setParticles(newParticles);
//   }, []);

//   if (particles.length === 0) return null;

//   return (
//     <div className="pointer-events-none absolute inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <motion.div
//           key={particle.id}
//           className={`absolute h-1 w-1 rounded-full ${particle.color}`}
//           initial={{ x: particle.x, y: particle.y, opacity: 0 }}
//           animate={{
//             x: [particle.x, Math.random() * window.innerWidth, particle.x],
//             y: [particle.y, Math.random() * window.innerHeight, particle.y],
//             scale: [1, 2, 1],
//             opacity: [0.3, 1, 0.3],
//           }}
//           transition={{
//             duration: Math.random() * 15 + 10,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* СЛОЙ 1: Анимированный фон (BookingAnimatedBackground) */}
//       <BookingAnimatedBackground />
      
//       {/* СЛОЙ 2: Floating Particles */}
//       <FloatingParticles />

//       {/* СЛОЙ 3: Премиальный фон с радиальными градиентами */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       {/* СЛОЙ 4: 3D Ballpit (поверх всего фона) */}
//       <div className="pointer-events-none fixed inset-0 z-[1]">
//         <Ballpit
//           count={20}
//           gravity={0}
//           friction={0.9995}
//           wallBounce={0.98}
//           maxVelocity={0.05}
//           minSize={0.3}
//           maxSize={1.0}
//           followCursor={true}
//           colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
//         />
//       </div>

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[84px] md:h-[96px]" />

//       {children}

//       <style jsx global>{`
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
        
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }

// function VideoSection(): React.JSX.Element {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]"
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

// export default function PaymentPageClient(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [showModal, setShowModal] = React.useState(false);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//       );
//       return;
//     }

//     setError(null);
//     setShowModal(true);
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur-xl">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* ПРЕМИУМ ЗАГОЛОВОК */}
//         <div className="flex w-full flex-col items-center text-center pt-8">
//           {/* Ultra Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-8"
//           >
//             <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
//             >
//               <Crown className="h-5 w-5 text-black drop-shadow-lg" />
//               <span className="font-serif text-base font-bold italic text-black drop-shadow-sm md:text-lg">
//                 Шаг 6 — Оплата и финальное подтверждение
//               </span>
//             </motion.div>
//           </motion.div>

//           {/* Title */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-4xl font-bold italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] md:text-5xl lg:text-6xl"
//             style={{
//               textShadow: "0 0 40px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.3)",
//             }}
//           >
//             Завершение записи
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script mx-auto max-w-3xl text-xl font-semibold italic tracking-wide text-cyan-400/95 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] md:text-2xl lg:text-3xl"
//           >
//             Выберите способ оплаты и подтвердите бронь
//           </motion.p>

//           {/* Appointment ID */}
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-4 text-sm text-slate-400"
//           >
//             Номер записи:{" "}
//             <span className="font-mono text-amber-300">{appointmentId}</span>
//           </motion.p>

//           {/* Декоративная линия */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ 
//               scaleX: [1, 1.5, 1],
//               opacity: [0.8, 1, 0.8],
//             }}
//             transition={{ 
//               scaleX: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//               opacity: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//             }}
//             className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] md:w-40"
//           />
//         </div>

//         {/* Два столбца: выбор оплаты + резюме */}
//         <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
//           {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
//           <motion.section
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="relative"
//           >
//             {/* ПРЕМИАЛЬНАЯ ОБЁРТКА */}
//             <div className="relative rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-emerald-200/20 to-teal-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

//               {/* ВНУТРЕННЯЯ КАРТОЧКА */}
//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 {/* Внутренние подсветки */}
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

//                 <div className="relative space-y-6">
//                   {/* Заголовок секции */}
//                   <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
//                     <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
//                       <CreditCard className="h-4 w-4 text-emerald-300" />
//                     </span>
//                     Способ оплаты
//                   </h2>

//                   {/* Методы оплаты */}
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {/* Оплата в салоне */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("onsite");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "onsite"
//                           ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
//                             <Wallet className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Оплата в салоне</div>
//                             <div className="text-xs text-slate-400">На месте</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "onsite" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-white" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Наличные или карта в салоне</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Без предоплаты</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Оплата после услуги</span>
//                         </li>
//                       </ul>
//                     </motion.button>

//                     {/* Онлайн-оплата - скоро */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("online_soon");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "online_soon"
//                           ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
//                             <CreditCard className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Онлайн-оплата</div>
//                             <div className="text-xs text-slate-400">Скоро</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "online_soon" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-black" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Карта, Apple Pay, Google Pay</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>В разработке</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Запись всё равно будет подтверждена</span>
//                         </li>
//                       </ul>
//                     </motion.button>
//                   </div>

//                   {/* Инфо блок */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 font-bold text-white">
//                       <ShieldCheck className="h-4 w-4 text-emerald-400" />
//                       Как это работает?
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Система уже создала запись в расписании салона. Оплата фиксируется
//                       на стороне салона. Онлайн-оплата будет добавлена позже.
//                     </p>
//                   </div>

//                   {/* Сообщения об ошибке */}
//                   <AnimatePresence>
//                     {error && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl"
//                       >
//                         <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
//                         <span className="text-sm text-red-200">{error}</span>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {/* Кнопка подтверждения */}
//                   <div className="pt-2">
//                     <motion.button
//                       type="button"
//                       onClick={handleConfirm}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                     >
//                       <CheckCircle2 className="h-5 w-5" />
//                       Подтвердить запись
//                     </motion.button>
//                     <p className="mt-3 text-center text-xs text-slate-400">
//                       Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона
//                     </p>
//                   </div>
//                 </div>

//                 {/* Нижняя линия */}
//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.section>

//           {/* ПРЕМИУМ РЕЗЮМЕ */}
//           <motion.aside
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             className="relative"
//           >
//             <div className="relative rounded-[32px] bg-gradient-to-br from-cyan-400/80 via-sky-200/20 to-blue-400/60 p-[1.5px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

//                 <div className="relative space-y-5">
//                   <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
//                     <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
//                       <Scissors className="h-5 w-5 text-cyan-300" />
//                     </span>
//                     <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
//                       Резюме записи
//                     </span>
//                   </h3>

//                   {/* Детали записи */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <div className="flex items-center gap-2 text-sm font-semibold text-white">
//                       <User2 className="h-5 w-5 text-cyan-400" />
//                       <span>Ваш визит в SalonElen</span>
//                     </div>
//                     <ul className="space-y-2 text-sm text-slate-300">
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Услуга из записи (Appointment)</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Мастер из записи</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Дата и время по ID: {appointmentId.slice(0, 8)}...</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Адрес салона</span>
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Политика отмены */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
//                       <MapPin className="h-4 w-4 text-cyan-400" />
//                       Политика отмены
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Если вы не сможете прийти, пожалуйста, отмените запись заранее —
//                       это позволит освободить время для других гостей салона.
//                     </p>
//                   </div>

//                   <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
//                     После запуска онлайн-оплаты здесь появится блок выбора платёжного
//                     метода и статус платежа
//                   </div>
//                 </div>

//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       {/* ПРЕМИУМ МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             key="modal-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               key="modal-content"
//               initial={{ scale: 0.8, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ type: "spring", stiffness: 220, damping: 22 }}
//               className="relative w-full max-w-lg"
//               onClick={(event) => event.stopPropagation()}
//             >
//               {/* Премиальная обёртка модалки */}
//               <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
//                 <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

//                 <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                   {/* Внутренние подсветки */}
//                   <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
//                   <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

//                   {/* Кнопка закрытия */}
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>

//                   <div className="relative z-10 text-center">
//                     {/* Success icon */}
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                       className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
//                     >
//                       <CheckCircle2 className="h-10 w-10 text-emerald-300" />
//                     </motion.div>

//                     <h2 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-3xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] md:text-4xl">
//                       Запись подтверждена!
//                     </h2>

//                     <p className="mb-8 text-base text-slate-200 md:text-lg">
//                       Ваша запись успешно подтверждена. Оплата будет произведена в
//                       салоне.
//                     </p>

//                     <div className="flex flex-col gap-3">
//                       <Link
//                         href="/"
//                         className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-center font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                       >
//                         На главную страницу
//                       </Link>

//                       <Link
//                         href="/booking"
//                         className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
//                       >
//                         Сделать новую запись
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <VideoSection />
//     </PageShell>
//   );
// }


//----------уже с шариками но чёрный фон, хочу поменять----
// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import dynamic from 'next/dynamic';
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   Crown,
//   Check,
//   Clock3,
//   MapPin,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black text-white">
//       {/* СЛОЙ 1: Брендовый фон (самый задний) */}
//       <div className="pointer-events-none fixed inset-0 z-0">
//         {/* Основной градиент с темой салона */}
//         <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black" />
        
//         {/* Центральное свечение "глаз" (логотип салона) */}
//         <div 
//           className="absolute inset-0 opacity-40"
//           style={{
//             background: `
//               radial-gradient(ellipse 800px 600px at 50% 45%, 
//                 rgba(34, 211, 238, 0.15) 0%,
//                 rgba(251, 191, 36, 0.12) 25%,
//                 transparent 60%
//               )
//             `
//           }}
//         />
        
//         {/* Золотые акценты по углам */}
//         <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-gradient-radial from-amber-500/10 via-amber-500/5 to-transparent blur-3xl" />
//         <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-gradient-radial from-cyan-500/10 via-cyan-500/5 to-transparent blur-3xl" />
        
//         {/* Тонкие линии-лучи (как от глаза) */}
//         <div 
//           className="absolute inset-0 opacity-20"
//           style={{
//             backgroundImage: `
//               repeating-radial-gradient(
//                 circle at 50% 45%,
//                 transparent 0px,
//                 transparent 50px,
//                 rgba(251, 191, 36, 0.03) 50px,
//                 rgba(251, 191, 36, 0.03) 51px
//               )
//             `
//           }}
//         />
        
//         {/* Анимированные частицы света */}
//         <div className="absolute inset-0">
//           <div className="absolute top-[20%] left-[30%] h-1 w-1 animate-pulse rounded-full bg-amber-300/40 blur-sm" />
//           <div className="absolute top-[60%] right-[25%] h-1 w-1 animate-pulse rounded-full bg-cyan-300/40 blur-sm delay-700" />
//           <div className="absolute bottom-[30%] left-[50%] h-1 w-1 animate-pulse rounded-full bg-amber-400/30 blur-sm delay-1000" />
//           <div className="absolute top-[40%] right-[60%] h-1 w-1 animate-pulse rounded-full bg-cyan-400/30 blur-sm delay-300" />
//         </div>
//       </div>

//       {/* СЛОЙ 2: 3D Ballpit (поверх фона) */}
//       <div className="pointer-events-none fixed inset-0 z-[1]">
//         <Ballpit
//           count={15}
//           gravity={0}
//           friction={0.9995}
//           wallBounce={0.98}
//           maxVelocity={0.05}
//           minSize={0.3}
//           maxSize={1.0}
//           followCursor={true}
//           colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
//         />
//       </div>

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[84px] md:h-[96px]" />

//       {children}

//       <style jsx global>{`
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
        
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
        
//         /* Радиальный градиент для углов */
//         .bg-gradient-radial {
//           background-image: radial-gradient(circle, var(--tw-gradient-stops));
//         }
        
//         /* Задержки для анимации частиц */
//         .delay-300 { animation-delay: 300ms; }
//         .delay-700 { animation-delay: 700ms; }
//         .delay-1000 { animation-delay: 1000ms; }
//       `}</style>
//     </div>
//   );
// }

// function VideoSection(): React.JSX.Element {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]"
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

// export default function PaymentPageClient(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [showModal, setShowModal] = React.useState(false);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//       );
//       return;
//     }

//     setError(null);
//     setShowModal(true);
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur-xl">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* ПРЕМИУМ ЗАГОЛОВОК */}
//         <div className="flex w-full flex-col items-center text-center pt-8">
//           {/* Ultra Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-8"
//           >
//             <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
//             >
//               <Crown className="h-5 w-5 text-black drop-shadow-lg" />
//               <span className="font-serif text-base font-bold italic text-black drop-shadow-sm md:text-lg">
//                 Шаг 6 — Оплата и финальное подтверждение
//               </span>
//             </motion.div>
//           </motion.div>

//           {/* Title */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-4xl font-bold italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] md:text-5xl lg:text-6xl"
//             style={{
//               textShadow: "0 0 40px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.3)",
//             }}
//           >
//             Завершение записи
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script mx-auto max-w-3xl text-xl font-semibold italic tracking-wide text-cyan-400/95 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] md:text-2xl lg:text-3xl"
//           >
//             Выберите способ оплаты и подтвердите бронь
//           </motion.p>

//           {/* Appointment ID */}
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-4 text-sm text-slate-400"
//           >
//             Номер записи:{" "}
//             <span className="font-mono text-amber-300">{appointmentId}</span>
//           </motion.p>

//           {/* Декоративная линия */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ 
//               scaleX: [1, 1.5, 1],
//               opacity: [0.8, 1, 0.8],
//             }}
//             transition={{ 
//               scaleX: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//               opacity: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//             }}
//             className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] md:w-40"
//           />
//         </div>

//         {/* Два столбца: выбор оплаты + резюме */}
//         <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
//           {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
//           <motion.section
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="relative"
//           >
//             {/* ПРЕМИАЛЬНАЯ ОБЁРТКА */}
//             <div className="relative rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-emerald-200/20 to-teal-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

//               {/* ВНУТРЕННЯЯ КАРТОЧКА */}
//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 {/* Внутренние подсветки */}
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

//                 <div className="relative space-y-6">
//                   {/* Заголовок секции */}
//                   <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
//                     <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
//                       <CreditCard className="h-4 w-4 text-emerald-300" />
//                     </span>
//                     Способ оплаты
//                   </h2>

//                   {/* Методы оплаты */}
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {/* Оплата в салоне */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("onsite");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "onsite"
//                           ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
//                             <Wallet className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Оплата в салоне</div>
//                             <div className="text-xs text-slate-400">На месте</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "onsite" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-white" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Наличные или карта в салоне</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Без предоплаты</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Оплата после услуги</span>
//                         </li>
//                       </ul>
//                     </motion.button>

//                     {/* Онлайн-оплата - скоро */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("online_soon");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "online_soon"
//                           ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
//                             <CreditCard className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Онлайн-оплата</div>
//                             <div className="text-xs text-slate-400">Скоро</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "online_soon" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-black" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Карта, Apple Pay, Google Pay</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>В разработке</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Запись всё равно будет подтверждена</span>
//                         </li>
//                       </ul>
//                     </motion.button>
//                   </div>

//                   {/* Инфо блок */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 font-bold text-white">
//                       <ShieldCheck className="h-4 w-4 text-emerald-400" />
//                       Как это работает?
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Система уже создала запись в расписании салона. Оплата фиксируется
//                       на стороне салона. Онлайн-оплата будет добавлена позже.
//                     </p>
//                   </div>

//                   {/* Сообщения об ошибке */}
//                   <AnimatePresence>
//                     {error && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl"
//                       >
//                         <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
//                         <span className="text-sm text-red-200">{error}</span>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {/* Кнопка подтверждения */}
//                   <div className="pt-2">
//                     <motion.button
//                       type="button"
//                       onClick={handleConfirm}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                     >
//                       <CheckCircle2 className="h-5 w-5" />
//                       Подтвердить запись
//                     </motion.button>
//                     <p className="mt-3 text-center text-xs text-slate-400">
//                       Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона
//                     </p>
//                   </div>
//                 </div>

//                 {/* Нижняя линия */}
//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.section>

//           {/* ПРЕМИУМ РЕЗЮМЕ */}
//           <motion.aside
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             className="relative"
//           >
//             <div className="relative rounded-[32px] bg-gradient-to-br from-cyan-400/80 via-sky-200/20 to-blue-400/60 p-[1.5px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

//                 <div className="relative space-y-5">
//                   <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
//                     <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
//                       <Scissors className="h-5 w-5 text-cyan-300" />
//                     </span>
//                     <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
//                       Резюме записи
//                     </span>
//                   </h3>

//                   {/* Детали записи */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <div className="flex items-center gap-2 text-sm font-semibold text-white">
//                       <User2 className="h-5 w-5 text-cyan-400" />
//                       <span>Ваш визит в SalonElen</span>
//                     </div>
//                     <ul className="space-y-2 text-sm text-slate-300">
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Услуга из записи (Appointment)</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Мастер из записи</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Дата и время по ID: {appointmentId.slice(0, 8)}...</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Адрес салона</span>
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Политика отмены */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
//                       <MapPin className="h-4 w-4 text-cyan-400" />
//                       Политика отмены
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Если вы не сможете прийти, пожалуйста, отмените запись заранее —
//                       это позволит освободить время для других гостей салона.
//                     </p>
//                   </div>

//                   <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
//                     После запуска онлайн-оплаты здесь появится блок выбора платёжного
//                     метода и статус платежа
//                   </div>
//                 </div>

//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       {/* ПРЕМИУМ МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             key="modal-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               key="modal-content"
//               initial={{ scale: 0.8, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ type: "spring", stiffness: 220, damping: 22 }}
//               className="relative w-full max-w-lg"
//               onClick={(event) => event.stopPropagation()}
//             >
//               {/* Премиальная обёртка модалки */}
//               <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
//                 <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

//                 <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                   {/* Внутренние подсветки */}
//                   <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
//                   <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

//                   {/* Кнопка закрытия */}
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>

//                   <div className="relative z-10 text-center">
//                     {/* Success icon */}
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                       className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
//                     >
//                       <CheckCircle2 className="h-10 w-10 text-emerald-300" />
//                     </motion.div>

//                     <h2 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-3xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] md:text-4xl">
//                       Запись подтверждена!
//                     </h2>

//                     <p className="mb-8 text-base text-slate-200 md:text-lg">
//                       Ваша запись успешно подтверждена. Оплата будет произведена в
//                       салоне.
//                     </p>

//                     <div className="flex flex-col gap-3">
//                       <Link
//                         href="/"
//                         className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-center font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                       >
//                         На главную страницу
//                       </Link>

//                       <Link
//                         href="/booking"
//                         className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
//                       >
//                         Сделать новую запись
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <VideoSection />
//     </PageShell>
//   );
// }



// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import dynamic from 'next/dynamic';
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   Crown,
//   Check,
//   Clock3,
//   MapPin,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black text-white">
//       {/* 3D Ballpit Background - ОПТИМИЗИРОВАННЫЕ ПАРАМЕТРЫ */}
//       <div className="pointer-events-none fixed inset-0 z-0">
//         <Ballpit
//           count={30}           // ← УМЕНЬШЕНО: меньше шаров = не слипаются
//           gravity={0}           // ← Невесомость
//           friction={0.9995}     // ← УВЕЛИЧЕНО: еще более плавное движение
//           wallBounce={0.98}     // ← Упругий отскок
//           maxVelocity={0.05}    // ← УМЕНЬШЕНО: в 1.6 раза медленнее!
//           minSize={0.4}         // ← УВЕЛИЧЕНО: крупнее минимальный размер
//           maxSize={1.0}         // ← УВЕЛИЧЕНО: крупнее максимальный размер
//           followCursor={true}
//           colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]}
//         />
//       </div>

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[84px] md:h-[96px]" />

//       {children}

//       <style jsx global>{`
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
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }

// function VideoSection(): React.JSX.Element {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]"
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

// export default function PaymentPageClient(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [showModal, setShowModal] = React.useState(false);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//       );
//       return;
//     }

//     setError(null);
//     setShowModal(true);
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur-xl">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* ПРЕМИУМ ЗАГОЛОВОК */}
//         <div className="flex w-full flex-col items-center text-center pt-8">
//           {/* Ultra Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-8"
//           >
//             <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
//             >
//               <Crown className="h-5 w-5 text-black drop-shadow-lg" />
//               <span className="font-serif text-base font-bold italic text-black drop-shadow-sm md:text-lg">
//                 Шаг 6 — Оплата и финальное подтверждение
//               </span>
//             </motion.div>
//           </motion.div>

//           {/* Title */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-4xl font-bold italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] md:text-5xl lg:text-6xl"
//             style={{
//               textShadow: "0 0 40px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.3)",
//             }}
//           >
//             Завершение записи
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script mx-auto max-w-3xl text-xl font-semibold italic tracking-wide text-cyan-400/95 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] md:text-2xl lg:text-3xl"
//           >
//             Выберите способ оплаты и подтвердите бронь
//           </motion.p>

//           {/* Appointment ID */}
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-4 text-sm text-slate-400"
//           >
//             Номер записи:{" "}
//             <span className="font-mono text-amber-300">{appointmentId}</span>
//           </motion.p>

//           {/* Декоративная линия */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ 
//               scaleX: [1, 1.5, 1],
//               opacity: [0.8, 1, 0.8],
//             }}
//             transition={{ 
//               scaleX: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//               opacity: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//             }}
//             className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] md:w-40"
//           />
//         </div>

//         {/* Два столбца: выбор оплаты + резюме */}
//         <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
//           {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
//           <motion.section
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="relative"
//           >
//             {/* ПРЕМИАЛЬНАЯ ОБЁРТКА */}
//             <div className="relative rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-emerald-200/20 to-teal-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

//               {/* ВНУТРЕННЯЯ КАРТОЧКА */}
//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 {/* Внутренние подсветки */}
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

//                 <div className="relative space-y-6">
//                   {/* Заголовок секции */}
//                   <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
//                     <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
//                       <CreditCard className="h-4 w-4 text-emerald-300" />
//                     </span>
//                     Способ оплаты
//                   </h2>

//                   {/* Методы оплаты */}
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {/* Оплата в салоне */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("onsite");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "onsite"
//                           ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
//                             <Wallet className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Оплата в салоне</div>
//                             <div className="text-xs text-slate-400">На месте</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "onsite" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-white" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Наличные или карта в салоне</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Без предоплаты</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Оплата после услуги</span>
//                         </li>
//                       </ul>
//                     </motion.button>

//                     {/* Онлайн-оплата - скоро */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("online_soon");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "online_soon"
//                           ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
//                             <CreditCard className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Онлайн-оплата</div>
//                             <div className="text-xs text-slate-400">Скоро</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "online_soon" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-black" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Карта, Apple Pay, Google Pay</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>В разработке</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Запись всё равно будет подтверждена</span>
//                         </li>
//                       </ul>
//                     </motion.button>
//                   </div>

//                   {/* Инфо блок */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 font-bold text-white">
//                       <ShieldCheck className="h-4 w-4 text-emerald-400" />
//                       Как это работает?
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Система уже создала запись в расписании салона. Оплата фиксируется
//                       на стороне салона. Онлайн-оплата будет добавлена позже.
//                     </p>
//                   </div>

//                   {/* Сообщения об ошибке */}
//                   <AnimatePresence>
//                     {error && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl"
//                       >
//                         <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
//                         <span className="text-sm text-red-200">{error}</span>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {/* Кнопка подтверждения */}
//                   <div className="pt-2">
//                     <motion.button
//                       type="button"
//                       onClick={handleConfirm}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                     >
//                       <CheckCircle2 className="h-5 w-5" />
//                       Подтвердить запись
//                     </motion.button>
//                     <p className="mt-3 text-center text-xs text-slate-400">
//                       Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона
//                     </p>
//                   </div>
//                 </div>

//                 {/* Нижняя линия */}
//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.section>

//           {/* ПРЕМИУМ РЕЗЮМЕ */}
//           <motion.aside
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             className="relative"
//           >
//             <div className="relative rounded-[32px] bg-gradient-to-br from-cyan-400/80 via-sky-200/20 to-blue-400/60 p-[1.5px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

//                 <div className="relative space-y-5">
//                   <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
//                     <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
//                       <Scissors className="h-5 w-5 text-cyan-300" />
//                     </span>
//                     <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
//                       Резюме записи
//                     </span>
//                   </h3>

//                   {/* Детали записи */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <div className="flex items-center gap-2 text-sm font-semibold text-white">
//                       <User2 className="h-5 w-5 text-cyan-400" />
//                       <span>Ваш визит в SalonElen</span>
//                     </div>
//                     <ul className="space-y-2 text-sm text-slate-300">
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Услуга из записи (Appointment)</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Мастер из записи</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Дата и время по ID: {appointmentId.slice(0, 8)}...</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Адрес салона</span>
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Политика отмены */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
//                       <MapPin className="h-4 w-4 text-cyan-400" />
//                       Политика отмены
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Если вы не сможете прийти, пожалуйста, отмените запись заранее —
//                       это позволит освободить время для других гостей салона.
//                     </p>
//                   </div>

//                   <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
//                     После запуска онлайн-оплаты здесь появится блок выбора платёжного
//                     метода и статус платежа
//                   </div>
//                 </div>

//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       {/* ПРЕМИУМ МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             key="modal-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               key="modal-content"
//               initial={{ scale: 0.8, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ type: "spring", stiffness: 220, damping: 22 }}
//               className="relative w-full max-w-lg"
//               onClick={(event) => event.stopPropagation()}
//             >
//               {/* Премиальная обёртка модалки */}
//               <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
//                 <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

//                 <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                   {/* Внутренние подсветки */}
//                   <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
//                   <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

//                   {/* Кнопка закрытия */}
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>

//                   <div className="relative z-10 text-center">
//                     {/* Success icon */}
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                       className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
//                     >
//                       <CheckCircle2 className="h-10 w-10 text-emerald-300" />
//                     </motion.div>

//                     <h2 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-3xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] md:text-4xl">
//                       Запись подтверждена!
//                     </h2>

//                     <p className="mb-8 text-base text-slate-200 md:text-lg">
//                       Ваша запись успешно подтверждена. Оплата будет произведена в
//                       салоне.
//                     </p>

//                     <div className="flex flex-col gap-3">
//                       <Link
//                         href="/"
//                         className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-center font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                       >
//                         На главную страницу
//                       </Link>

//                       <Link
//                         href="/booking"
//                         className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
//                       >
//                         Сделать новую запись
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <VideoSection />
//     </PageShell>
//   );
// }



// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import dynamic from 'next/dynamic';
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   Crown,
//   Check,
//   Clock3,
//   MapPin,
//   User2,
// } from "lucide-react";

// // Динамически импортируем Ballpit с отключением SSR
// const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black text-white">
//       {/* 3D Ballpit Background - ИСПРАВЛЕННЫЕ ПАРАМЕТРЫ */}
//       <div className="pointer-events-none fixed inset-0 z-0">
//         <Ballpit
//           count={180}
//           gravity={0}           // ← ИЗМЕНЕНО: 0 = невесомость, шары плавают
//           friction={0.9992}     // ← ИЗМЕНЕНО: меньше трение = плавнее движение
//           wallBounce={0.98}     // ← ИЗМЕНЕНО: больше отскок от стен
//           maxVelocity={0.08}    // ← ДОБАВЛЕНО: ограничение скорости для плавности
//           minSize={0.5}         // ← ДОБАВЛЕНО: меньший минимальный размер
//           maxSize={1.3}         // ← ДОБАВЛЕНО: больший максимальный размер
//           followCursor={true}
//           colors={[0xff7cf0, 0x9b8cff, 0x8ae9ff, 0xe0e0e0]} // ← Цвета как на React Bits
//         />
//       </div>

//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[84px] md:h-[96px]" />

//       {children}

//       <style jsx global>{`
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
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }

// function VideoSection(): React.JSX.Element {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]"
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

// export default function PaymentPageClient(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [showModal, setShowModal] = React.useState(false);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//       );
//       return;
//     }

//     setError(null);
//     setShowModal(true);
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur-xl">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* ПРЕМИУМ ЗАГОЛОВОК */}
//         <div className="flex w-full flex-col items-center text-center pt-8">
//           {/* Ultra Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-8"
//           >
//             <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
//             >
//               <Crown className="h-5 w-5 text-black drop-shadow-lg" />
//               <span className="font-serif text-base font-bold italic text-black drop-shadow-sm md:text-lg">
//                 Шаг 6 — Оплата и финальное подтверждение
//               </span>
//             </motion.div>
//           </motion.div>

//           {/* Title */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-4xl font-bold italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] md:text-5xl lg:text-6xl"
//             style={{
//               textShadow: "0 0 40px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.3)",
//             }}
//           >
//             Завершение записи
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script mx-auto max-w-3xl text-xl font-semibold italic tracking-wide text-cyan-400/95 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] md:text-2xl lg:text-3xl"
//           >
//             Выберите способ оплаты и подтвердите бронь
//           </motion.p>

//           {/* Appointment ID */}
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-4 text-sm text-slate-400"
//           >
//             Номер записи:{" "}
//             <span className="font-mono text-amber-300">{appointmentId}</span>
//           </motion.p>

//           {/* Декоративная линия */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ 
//               scaleX: [1, 1.5, 1],
//               opacity: [0.8, 1, 0.8],
//             }}
//             transition={{ 
//               scaleX: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//               opacity: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//             }}
//             className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] md:w-40"
//           />
//         </div>

//         {/* Два столбца: выбор оплаты + резюме */}
//         <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
//           {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
//           <motion.section
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="relative"
//           >
//             {/* ПРЕМИАЛЬНАЯ ОБЁРТКА */}
//             <div className="relative rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-emerald-200/20 to-teal-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

//               {/* ВНУТРЕННЯЯ КАРТОЧКА */}
//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 {/* Внутренние подсветки */}
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

//                 <div className="relative space-y-6">
//                   {/* Заголовок секции */}
//                   <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
//                     <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
//                       <CreditCard className="h-4 w-4 text-emerald-300" />
//                     </span>
//                     Способ оплаты
//                   </h2>

//                   {/* Методы оплаты */}
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {/* Оплата в салоне */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("onsite");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "onsite"
//                           ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
//                             <Wallet className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Оплата в салоне</div>
//                             <div className="text-xs text-slate-400">На месте</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "onsite" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-white" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Наличные или карта в салоне</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Без предоплаты</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Оплата после услуги</span>
//                         </li>
//                       </ul>
//                     </motion.button>

//                     {/* Онлайн-оплата - скоро */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("online_soon");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "online_soon"
//                           ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
//                             <CreditCard className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Онлайн-оплата</div>
//                             <div className="text-xs text-slate-400">Скоро</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "online_soon" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-black" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Карта, Apple Pay, Google Pay</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>В разработке</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Запись всё равно будет подтверждена</span>
//                         </li>
//                       </ul>
//                     </motion.button>
//                   </div>

//                   {/* Инфо блок */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 font-bold text-white">
//                       <ShieldCheck className="h-4 w-4 text-emerald-400" />
//                       Как это работает?
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Система уже создала запись в расписании салона. Оплата фиксируется
//                       на стороне салона. Онлайн-оплата будет добавлена позже.
//                     </p>
//                   </div>

//                   {/* Сообщения об ошибке */}
//                   <AnimatePresence>
//                     {error && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl"
//                       >
//                         <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
//                         <span className="text-sm text-red-200">{error}</span>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {/* Кнопка подтверждения */}
//                   <div className="pt-2">
//                     <motion.button
//                       type="button"
//                       onClick={handleConfirm}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                     >
//                       <CheckCircle2 className="h-5 w-5" />
//                       Подтвердить запись
//                     </motion.button>
//                     <p className="mt-3 text-center text-xs text-slate-400">
//                       Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона
//                     </p>
//                   </div>
//                 </div>

//                 {/* Нижняя линия */}
//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.section>

//           {/* ПРЕМИУМ РЕЗЮМЕ */}
//           <motion.aside
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             className="relative"
//           >
//             <div className="relative rounded-[32px] bg-gradient-to-br from-cyan-400/80 via-sky-200/20 to-blue-400/60 p-[1.5px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

//                 <div className="relative space-y-5">
//                   <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
//                     <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
//                       <Scissors className="h-5 w-5 text-cyan-300" />
//                     </span>
//                     <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
//                       Резюме записи
//                     </span>
//                   </h3>

//                   {/* Детали записи */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <div className="flex items-center gap-2 text-sm font-semibold text-white">
//                       <User2 className="h-5 w-5 text-cyan-400" />
//                       <span>Ваш визит в SalonElen</span>
//                     </div>
//                     <ul className="space-y-2 text-sm text-slate-300">
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Услуга из записи (Appointment)</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Мастер из записи</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Дата и время по ID: {appointmentId.slice(0, 8)}...</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Адрес салона</span>
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Политика отмены */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
//                       <MapPin className="h-4 w-4 text-cyan-400" />
//                       Политика отмены
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Если вы не сможете прийти, пожалуйста, отмените запись заранее —
//                       это позволит освободить время для других гостей салона.
//                     </p>
//                   </div>

//                   <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
//                     После запуска онлайн-оплаты здесь появится блок выбора платёжного
//                     метода и статус платежа
//                   </div>
//                 </div>

//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       {/* ПРЕМИУМ МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             key="modal-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               key="modal-content"
//               initial={{ scale: 0.8, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ type: "spring", stiffness: 220, damping: 22 }}
//               className="relative w-full max-w-lg"
//               onClick={(event) => event.stopPropagation()}
//             >
//               {/* Премиальная обёртка модалки */}
//               <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
//                 <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

//                 <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                   {/* Внутренние подсветки */}
//                   <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
//                   <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

//                   {/* Кнопка закрытия */}
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>

//                   <div className="relative z-10 text-center">
//                     {/* Success icon */}
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                       className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
//                     >
//                       <CheckCircle2 className="h-10 w-10 text-emerald-300" />
//                     </motion.div>

//                     <h2 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-3xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] md:text-4xl">
//                       Запись подтверждена!
//                     </h2>

//                     <p className="mb-8 text-base text-slate-200 md:text-lg">
//                       Ваша запись успешно подтверждена. Оплата будет произведена в
//                       салоне.
//                     </p>

//                     <div className="flex flex-col gap-3">
//                       <Link
//                         href="/"
//                         className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-center font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                       >
//                         На главную страницу
//                       </Link>

//                       <Link
//                         href="/booking"
//                         className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
//                       >
//                         Сделать новую запись
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <VideoSection />
//     </PageShell>
//   );
// }


//---------всё работает но хочу попробоват задний фон с шарами---------//
// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   CalendarDays,
//   User2,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
//   X,
//   Crown,
//   Sparkles,
//   Check,
//   Clock3,
//   MapPin,
// } from "lucide-react";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// /* ===================== Floating Particles ===================== */
// function FloatingParticles() {
//   const [particles, setParticles] = React.useState<Array<{ x: number; y: number; id: number; color: string }>>([]);

//   React.useEffect(() => {
//     const colors = [
//       "bg-amber-400/30",
//       "bg-fuchsia-400/25",
//       "bg-sky-400/25",
//       "bg-emerald-400/25",
//       "bg-yellow-300/30",
//     ];
    
//     const newParticles = [...Array(30)].map((_, i) => ({
//       x: Math.random() * window.innerWidth,
//       y: Math.random() * window.innerHeight,
//       id: i,
//       color: colors[Math.floor(Math.random() * colors.length)],
//     }));
//     setParticles(newParticles);
//   }, []);

//   if (particles.length === 0) return null;

//   return (
//     <div className="pointer-events-none absolute inset-0 overflow-hidden">
//       {particles.map((particle) => (
//         <motion.div
//           key={particle.id}
//           className={`absolute h-1 w-1 rounded-full ${particle.color}`}
//           initial={{ x: particle.x, y: particle.y, opacity: 0 }}
//           animate={{
//             x: [particle.x, Math.random() * window.innerWidth, particle.x],
//             y: [particle.y, Math.random() * window.innerHeight, particle.y],
//             scale: [1, 2, 1],
//             opacity: [0.3, 1, 0.3],
//           }}
//           transition={{
//             duration: Math.random() * 15 + 10,
//             repeat: Infinity,
//             ease: "linear",
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       {/* Неоновая верхняя линия */}
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />
      
//       <BookingAnimatedBackground />
//       <FloatingParticles />

//       {/* Премиальный фон с радиальными градиентами */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       <div className="h-[84px] md:h-[96px]" />

//       {children}

//       <style jsx global>{`
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
//         @keyframes bg-slide {
//           0%, 100% { background-position: 0% 0%; }
//           50% { background-position: 100% 0%; }
//         }
//       `}</style>
//     </div>
//   );
// }

// function VideoSection(): React.JSX.Element {
//   return (
//     <section className="relative py-10 sm:py-12">
//       <div className="relative mx-auto w-full max-w-screen-2xl aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,215,0,.12)] bg-black">
//         <video
//           className="absolute inset-0 h-full w-full object-contain 2xl:object-cover object-[50%_90%] lg:object-[50%_96%] xl:object-[50%_100%] 2xl:object-[50%_96%]"
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

// export default function PaymentPageClient(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [showModal, setShowModal] = React.useState(false);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//       );
//       return;
//     }

//     setError(null);
//     setShowModal(true);
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur-xl">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* ПРЕМИУМ ЗАГОЛОВОК */}
//         <div className="flex w-full flex-col items-center text-center pt-8">
//           {/* Ultra Premium Badge */}
//           <motion.div
//             initial={{ scale: 0, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ type: "spring", stiffness: 300, damping: 20 }}
//             className="relative mb-8"
//           >
//             <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="relative flex items-center gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-8 py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
//             >
//               <Crown className="h-5 w-5 text-black drop-shadow-lg" />
//               <span className="font-serif text-base font-bold italic text-black drop-shadow-sm md:text-lg">
//                 Шаг 6 — Оплата и финальное подтверждение
//               </span>
//             </motion.div>
//           </motion.div>

//           {/* Title */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-4xl font-bold italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] md:text-5xl lg:text-6xl"
//             style={{
//               textShadow: "0 0 40px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.3)",
//             }}
//           >
//             Завершение записи
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="brand-script mx-auto max-w-3xl text-xl font-semibold italic tracking-wide text-cyan-400/95 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] md:text-2xl lg:text-3xl"
//           >
//             Выберите способ оплаты и подтвердите бронь
//           </motion.p>

//           {/* Appointment ID */}
//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-4 text-sm text-slate-400"
//           >
//             Номер записи:{" "}
//             <span className="font-mono text-amber-300">{appointmentId}</span>
//           </motion.p>

//           {/* Декоративная линия */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ 
//               scaleX: [1, 1.5, 1],
//               opacity: [0.8, 1, 0.8],
//             }}
//             transition={{ 
//               scaleX: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//               opacity: {
//                 duration: 3,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//               },
//             }}
//             className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)] md:w-40"
//           />
//         </div>

//         {/* Два столбца: выбор оплаты + резюме */}
//         <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
//           {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
//           <motion.section
//             initial={{ opacity: 0, x: -30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="relative"
//           >
//             {/* ПРЕМИАЛЬНАЯ ОБЁРТКА */}
//             <div className="relative rounded-[32px] bg-gradient-to-br from-emerald-400/80 via-emerald-200/20 to-teal-400/60 p-[1.5px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

//               {/* ВНУТРЕННЯЯ КАРТОЧКА */}
//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 {/* Внутренние подсветки */}
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

//                 <div className="relative space-y-6">
//                   {/* Заголовок секции */}
//                   <h2 className="brand-script flex items-center gap-3 text-xl font-bold italic text-white md:text-2xl">
//                     <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
//                       <CreditCard className="h-4 w-4 text-emerald-300" />
//                     </span>
//                     Способ оплаты
//                   </h2>

//                   {/* Методы оплаты */}
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {/* Оплата в салоне */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("onsite");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "onsite"
//                           ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
//                             <Wallet className="h-6 w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Оплата в салоне</div>
//                             <div className="text-xs text-slate-400">На месте</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "onsite" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-white" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Наличные или карта в салоне</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Без предоплаты</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
//                           <span>Оплата после услуги</span>
//                         </li>
//                       </ul>
//                     </motion.button>

//                     {/* Онлайн-оплата - скоро */}
//                     <motion.button
//                       type="button"
//                       onClick={() => {
//                         setSelectedMethod("online_soon");
//                         setError(null);
//                       }}
//                       whileHover={{ scale: 1.02, y: -2 }}
//                       whileTap={{ scale: 0.98 }}
//                       className={`flex flex-col items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
//                         selectedMethod === "online_soon"
//                           ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
//                           : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
//                       }`}
//                     >
//                       <div className="flex w-full items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
//                             <CreditCard className="h-6 w-6 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
//                           </div>
//                           <div>
//                             <div className="font-bold text-white">Онлайн-оплата</div>
//                             <div className="text-xs text-slate-400">Скоро</div>
//                           </div>
//                         </div>
//                         {selectedMethod === "online_soon" && (
//                           <motion.div
//                             initial={{ scale: 0 }}
//                             animate={{ scale: 1 }}
//                             className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg"
//                           >
//                             <Check className="h-4 w-4 text-black" />
//                           </motion.div>
//                         )}
//                       </div>
//                       <ul className="space-y-1.5 text-xs text-slate-300">
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Карта, Apple Pay, Google Pay</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>В разработке</span>
//                         </li>
//                         <li className="flex items-start gap-2">
//                           <Clock3 className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
//                           <span>Запись всё равно будет подтверждена</span>
//                         </li>
//                       </ul>
//                     </motion.button>
//                   </div>

//                   {/* Инфо блок */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 font-bold text-white">
//                       <ShieldCheck className="h-4 w-4 text-emerald-400" />
//                       Как это работает?
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Система уже создала запись в расписании салона. Оплата фиксируется
//                       на стороне салона. Онлайн-оплата будет добавлена позже.
//                     </p>
//                   </div>

//                   {/* Сообщения об ошибке */}
//                   <AnimatePresence>
//                     {error && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -10 }}
//                         className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 backdrop-blur-xl"
//                       >
//                         <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
//                         <span className="text-sm text-red-200">{error}</span>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>

//                   {/* Кнопка подтверждения */}
//                   <div className="pt-2">
//                     <motion.button
//                       type="button"
//                       onClick={handleConfirm}
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                     >
//                       <CheckCircle2 className="h-5 w-5" />
//                       Подтвердить запись
//                     </motion.button>
//                     <p className="mt-3 text-center text-xs text-slate-400">
//                       Нажимая «Подтвердить запись», вы соглашаетесь с условиями салона
//                     </p>
//                   </div>
//                 </div>

//                 {/* Нижняя линия */}
//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.section>

//           {/* ПРЕМИУМ РЕЗЮМЕ */}
//           <motion.aside
//             initial={{ opacity: 0, x: 30 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.4 }}
//             className="relative"
//           >
//             <div className="relative rounded-[32px] bg-gradient-to-br from-cyan-400/80 via-sky-200/20 to-blue-400/60 p-[1.5px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
//               <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

//               <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 ring-1 ring-white/10 backdrop-blur-xl md:p-8">
//                 <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
//                 <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

//                 <div className="relative space-y-5">
//                   <h3 className="brand-script mb-4 flex items-center gap-3 text-xl font-bold italic md:text-2xl lg:text-3xl">
//                     <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
//                       <Scissors className="h-5 w-5 text-cyan-300" />
//                     </span>
//                     <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
//                       Резюме записи
//                     </span>
//                   </h3>

//                   {/* Детали записи */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <div className="flex items-center gap-2 text-sm font-semibold text-white">
//                       <User2 className="h-5 w-5 text-cyan-400" />
//                       <span>Ваш визит в SalonElen</span>
//                     </div>
//                     <ul className="space-y-2 text-sm text-slate-300">
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Услуга из записи (Appointment)</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Мастер из записи</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Дата и время по ID: {appointmentId.slice(0, 8)}...</span>
//                       </li>
//                       <li className="flex items-start gap-2">
//                         <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
//                         <span>Адрес салона</span>
//                       </li>
//                     </ul>
//                   </div>

//                   {/* Политика отмены */}
//                   <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
//                     <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
//                       <MapPin className="h-4 w-4 text-cyan-400" />
//                       Политика отмены
//                     </p>
//                     <p className="text-sm text-slate-300">
//                       Если вы не сможете прийти, пожалуйста, отмените запись заранее —
//                       это позволит освободить время для других гостей салона.
//                     </p>
//                   </div>

//                   <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
//                     После запуска онлайн-оплаты здесь появится блок выбора платёжного
//                     метода и статус платежа
//                   </div>
//                 </div>

//                 <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       {/* ПРЕМИУМ МОДАЛКА ПОДТВЕРЖДЕНИЯ */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             key="modal-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               key="modal-content"
//               initial={{ scale: 0.8, opacity: 0, y: 30 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//               transition={{ type: "spring", stiffness: 220, damping: 22 }}
//               className="relative w-full max-w-lg"
//               onClick={(event) => event.stopPropagation()}
//             >
//               {/* Премиальная обёртка модалки */}
//               <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
//                 <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

//                 <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                   {/* Внутренние подсветки */}
//                   <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
//                   <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

//                   {/* Кнопка закрытия */}
//                   <button
//                     type="button"
//                     onClick={() => setShowModal(false)}
//                     className="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
//                   >
//                     <X className="h-4 w-4" />
//                   </button>

//                   <div className="relative z-10 text-center">
//                     {/* Success icon */}
//                     <motion.div
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//                       className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
//                     >
//                       <CheckCircle2 className="h-10 w-10 text-emerald-300" />
//                     </motion.div>

//                     <h2 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-3xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] md:text-4xl">
//                       Запись подтверждена!
//                     </h2>

//                     <p className="mb-8 text-base text-slate-200 md:text-lg">
//                       Ваша запись успешно подтверждена. Оплата будет произведена в
//                       салоне.
//                     </p>

//                     <div className="flex flex-col gap-3">
//                       <Link
//                         href="/"
//                         className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-3.5 text-center font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
//                       >
//                         На главную страницу
//                       </Link>

//                       <Link
//                         href="/booking"
//                         className="w-full rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-center font-semibold text-white transition hover:bg-white/10"
//                       >
//                         Сделать новую запись
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <VideoSection />
//     </PageShell>
//   );
// }



//----------рабочая версия, приводим в порядок дизайн-----
// // src/app/booking/payment/PaymentPageClient.tsx
// "use client";

// import * as React from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import {
//   ArrowLeft,
//   CreditCard,
//   Wallet,
//   ShieldCheck,
//   CalendarDays,
//   User2,
//   Scissors,
//   CheckCircle2,
//   AlertCircle,
//   X,
// } from "lucide-react";

// type PaymentMethod = "onsite" | "online_soon";

// const BOOKING_STEPS: { id: string; label: string; icon: string }[] = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// function PageShell({ children }: { children: React.ReactNode }): React.JSX.Element {
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black text-white">
//       {/* Хедер с прогресс-баром */}
//       <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//         <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//           <PremiumProgressBar currentStep={5} steps={BOOKING_STEPS} />
//         </div>
//       </header>

//       {/* отступ под фиксированный хедер */}
//       <div className="h-[84px] md:h-[96px]" />

//       {children}
//     </div>
//   );
// }

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

// export default function PaymentPageClient(): React.JSX.Element {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const appointmentId = searchParams.get("appointment") ?? "";

//   const [selectedMethod, setSelectedMethod] =
//     React.useState<PaymentMethod>("onsite");
//   const [error, setError] = React.useState<string | null>(null);
//   const [showModal, setShowModal] = React.useState(false);

//   const handleConfirm = (): void => {
//     if (!appointmentId) {
//       setError(
//         "Отсутствует идентификатор записи. Пожалуйста, начните запись заново.",
//       );
//       return;
//     }

//     setError(null);
//     setShowModal(true);
//   };

//   if (!appointmentId) {
//     return (
//       <PageShell>
//         <main className="mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-6 xl:px-8">
//           <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
//               <div className="space-y-2">
//                 <h1 className="text-lg font-semibold text-red-100">
//                   Ошибка при переходе к оплате
//                 </h1>
//                 <p className="text-sm text-red-100/80">
//                   Мы не смогли найти идентификатор записи. Возможно, ссылка
//                   устарела или шаг подтверждения email был пропущен.
//                 </p>
//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Вернуться к записи
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </main>
//         <VideoSection />
//       </PageShell>
//     );
//   }

//   return (
//     <PageShell>
//       <main className="mx-auto w-full max-w-screen-2xl px-4 pb-24 xl:px-8">
//         {/* Верхняя часть: back + заголовок + подзаголовок */}
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
//                 Шаг <span className="text-amber-300">6</span> из 6
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
//                 Шаг 6 — Оплата и финальное подтверждение
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
//             Завершение записи
//           </motion.h1>

//           {/* НЕОНОВЫЙ ТЕКСТ */}
//           <motion.p
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="
//               mx-auto max-w-2xl
//               text-center text-lg md:text-xl
//               font-serif italic
//               text-transparent bg-clip-text
//               bg-gradient-to-r from-[#6DDCFF] via-[#7F5DFF] to-[#FF4FD8]
//               drop-shadow-[0_0_22px_rgba(80,180,255,0.9)]
//             "
//           >
//             Вы почти у цели. Выберите способ оплаты и подтвердите бронь. Сейчас
//             мы фиксируем время за вами — оплата онлайн появится чуть позже, а
//             пока возможна оплата в салоне.
//           </motion.p>

//           <motion.p
//             initial={{ opacity: 0, y: 4 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.25 }}
//             className="mt-2 text-xs text-white/50 md:text-sm"
//           >
//             Номер вашей записи:{" "}
//             <span className="font-mono text-amber-300">{appointmentId}</span>
//           </motion.p>
//         </div>

//         {/* Два столбца: выбор оплаты + резюме записи */}
//         <div className="mt-8 grid items-start gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
//           {/* Левая колонка: выбор способа оплаты */}
//           <motion.section
//             initial={{ opacity: 0, x: -18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 }}
//             className="
//               relative rounded-3xl border border-white/12
//               bg-gradient-to-br from-black/80 via-black/70 to-black/85
//               p-5 md:p-6 lg:p-7 shadow-[0_0_55px_rgba(0,0,0,0.8)]
//               space-y-6
//             "
//           >
//             <div className="pointer-events-none absolute -top-20 left-0 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

//             <div className="relative space-y-4">
//               <h2 className="flex items-center gap-2 text-base font-semibold text-white/90 md:text-lg">
//                 <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15">
//                   <CreditCard className="h-4 w-4 text-amber-300" />
//                 </span>
//                 Способ оплаты
//               </h2>

//               <div className="grid gap-3 md:grid-cols-2">
//                 {/* Оплата в салоне */}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSelectedMethod("onsite");
//                     setError(null);
//                   }}
//                   className={`
//                     flex flex-col items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition
//                     ${
//                       selectedMethod === "onsite"
//                         ? "border-emerald-400/90 bg-gradient-to-r from-emerald-500/25 via-emerald-500/15 to-emerald-500/25 shadow-[0_0_22px_rgba(16,185,129,0.45)]"
//                         : "border-white/10 bg-white/5 hover:border-emerald-300/70 hover:bg-white/10"
//                     }
//                   `}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
//                       <Wallet className="h-5 w-5 text-emerald-300" />
//                     </div>
//                     <div>
//                       <div className="text-sm font-semibold">
//                         Оплата в салоне
//                       </div>
//                       <div className="text-xs text-white/70">
//                         Оплачиваете услуги на месте перед или после процедуры.
//                       </div>
//                     </div>
//                   </div>
//                   <ul className="mt-1 space-y-1 text-xs text-white/60">
//                     <li>• Подходит для наличных и оплаты картой в салоне.</li>
//                     <li>
//                       • Никаких предоплат — просто приходите в назначенное
//                       время.
//                     </li>
//                   </ul>
//                 </button>

//                 {/* Онлайн-оплата — заглушка */}
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSelectedMethod("online_soon");
//                     setError(null);
//                   }}
//                   className={`
//                     flex flex-col items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition
//                     ${
//                       selectedMethod === "online_soon"
//                         ? "border-amber-400/90 bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-amber-500/25 shadow-[0_0_22px_rgba(245,197,24,0.45)]"
//                         : "border-white/10 bg-white/5 hover:border-amber-300/70 hover:bg-white/10"
//                     }
//                   `}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
//                       <CreditCard className="h-5 w-5 text-amber-300" />
//                     </div>
//                     <div>
//                       <div className="text-sm font-semibold">
//                         Онлайн-оплата (скоро)
//                       </div>
//                       <div className="text-xs text-white/70">
//                         В разработке. Скоро вы сможете оплатить бронь заранее.
//                       </div>
//                     </div>
//                   </div>
//                   <ul className="mt-1 space-y-1 text-xs text-white/60">
//                     <li>• Карта, Apple Pay, Google Pay.</li>
//                     <li>
//                       • Сейчас недоступно, но ваша запись всё равно будет
//                       подтверждена.
//                     </li>
//                   </ul>
//                 </button>
//               </div>

//               <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/65 md:text-sm">
//                 <p className="mb-1 font-medium text-white/80">
//                   Как это работает сейчас?
//                 </p>
//                 <p>
//                   Система уже создала запись в расписании салона по вашему
//                   номеру брони. Оплата фиксируется на стороне салона —
//                   администратор видит вашу запись и способ оплаты «в салоне».
//                   Онлайн-оплата будет добавлена отдельным шагом позже.
//                 </p>
//               </div>

//               {/* Сообщения об ошибке */}
//               <div className="space-y-3 pt-2">
//                 {error && (
//                   <div className="flex items-start gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs md:text-sm text-red-200">
//                     <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
//                     <span>{error}</span>
//                   </div>
//                 )}
//               </div>

//               <div className="pt-2">
//                 <button
//                   type="button"
//                   onClick={handleConfirm}
//                   className="
//                     inline-flex w-full items-center justify-center gap-2
//                     rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500
//                     px-5 py-3 text-sm font-semibold text-black
//                     shadow-[0_15px_40px_rgba(245,197,24,0.45)]
//                     transition hover:brightness-110
//                   "
//                 >
//                   <CheckCircle2 className="h-4 w-4" />
//                   Подтвердить запись
//                 </button>
//                 <p className="mt-2 text-center text-xs text-white/55 md:text-xs">
//                   Нажимая «Подтвердить запись», вы соглашаетесь с условиями
//                   салона и политикой отмены визита.
//                 </p>
//               </div>
//             </div>
//           </motion.section>

//           {/* Правая колонка: резюме записи (пока без реального запроса к БД) */}
//           <motion.aside
//             initial={{ opacity: 0, x: 18 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.35 }}
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
//                   <Scissors className="h-4 w-4 text-amber-200" />
//                 </span>
//                 Резюме вашей записи
//               </h3>

//               {/* Здесь позже можно подставить реальные данные Appointment */}
//               <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
//                 <div className="flex items-center gap-2 text-sm text-white/80">
//                   <User2 className="h-4 w-4 text-amber-300" />
//                   <span>
//                     Ваш визит в SalonElen успешно занесён в расписание.
//                   </span>
//                 </div>
//                 <ul className="mt-1 space-y-1.5 text-xs text-white/65 md:text-sm">
//                   <li>• Услуга: будет подставлена из записи (Appointment).</li>
//                   <li>• Мастер: будет подставлен из записи.</li>
//                   <li>
//                     • Дата и время: подтягиваются по идентификатору{" "}
//                     <span className="font-mono text-amber-300">
//                       {appointmentId}
//                     </span>
//                     .
//                   </li>
//                   <li>
//                     • Адрес салона и доп. детали — также будут выведены из
//                     Appointment.
//                   </li>
//                 </ul>
//                 <p className="mt-2 flex items-center gap-2 text-xs text-white/55">
//                   <CalendarDays className="h-4 w-4 text-amber-300" />
//                   На текущем этапе мы меняем только оформление страницы, без
//                   изменения бизнес-логики получения данных о записи.
//                 </p>
//               </div>

//               <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
//                 <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
//                   Политика отмены
//                 </p>
//                 <p className="text-xs text-white/65 md:text-sm">
//                   Если вы не сможете прийти, пожалуйста, отмените запись
//                   заранее — это позволит освободить время для других гостей
//                   салона. При необходимости администратор свяжется с вами для
//                   уточнения деталей.
//                 </p>
//               </div>

//               <div className="mt-2 border-t border-white/10 pt-3 text-xs text-white/50 md:text-sm">
//                 После запуска онлайн-оплаты сюда будет добавлен блок выбора
//                 платёжного метода (Stripe / PayPal / Klarna) и отображение
//                 статуса платежа.
//               </div>
//             </div>
//           </motion.aside>
//         </div>
//       </main>

//       {/* МОДАЛКА С АНИМАЦИЕЙ ОТКРЫТИЯ/ЗАКРЫТИЯ */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             key="confirm-modal-backdrop"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
//             onClick={() => setShowModal(false)}
//           >
//             <motion.div
//               key="confirm-modal-content"
//               initial={{ scale: 0.8, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 10 }}
//               transition={{ type: "spring", stiffness: 220, damping: 22 }}
//               className="
//                 relative w-full max-w-md rounded-3xl
//                 border border-amber-400/30
//                 bg-gradient-to-br from-black/80 via-black/70 to-black/85
//                 p-7 shadow-[0_0_40px_rgba(245,197,24,0.35)]
//               "
//               onClick={(event) => event.stopPropagation()}
//             >
//               {/* Неоновое свечение */}
//               <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#F5C518]/20 via-yellow-400/15 to-[#F5C518]/20 blur-2xl opacity-40" />

//               {/* Кнопка закрытия */}
//               <button
//                 type="button"
//                 onClick={() => setShowModal(false)}
//                 className="
//                   absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center
//                   rounded-full border border-white/15 bg-black/40 text-white/70
//                   hover:border-amber-300 hover:text-amber-200 hover:bg-black/70
//                 "
//               >
//                 <X className="h-4 w-4" />
//               </button>

//               <div className="relative z-10 text-center">
//                 <h2
//                   className="
//                     text-2xl md:text-3xl font-serif italic
//                     text-transparent bg-clip-text
//                     bg-gradient-to-r from-[#F5C518] via-[#FFD166] to-[#F5C518]
//                     drop-shadow-[0_0_20px_rgba(245,197,24,0.55)]
//                     mb-4
//                   "
//                 >
//                   Запись подтверждена!
//                 </h2>

//                 <p className="text-sm md:text-base text-white/80 mb-8">
//                   Ваша запись подтверждена. Оплата будет произведена в салоне.
//                 </p>

//                 <div className="flex flex-col gap-3">
//                   <Link
//                     href="/"
//                     className="
//                       w-full text-center rounded-xl px-5 py-3
//                       bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500
//                       font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)]
//                       transition hover:brightness-110
//                     "
//                   >
//                     На главную страницу
//                   </Link>

//                   <Link
//                     href="/booking"
//                     className="
//                       w-full text-center rounded-xl px-5 py-3
//                       border border-white/20 bg-white/5 text-white
//                       font-medium hover:bg-white/10
//                     "
//                   >
//                     Сделать новую запись
//                   </Link>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <VideoSection />
//     </PageShell>
//   );
// }
