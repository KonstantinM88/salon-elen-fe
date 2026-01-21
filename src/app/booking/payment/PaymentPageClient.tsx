// src/app/booking/payment/PaymentPageClient.tsx
// ✅ ОБНОВЛЁННАЯ ВЕРСИЯ - Stripe и PayPal АКТИВНЫ
"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PremiumProgressBar from "@/components/PremiumProgressBar";
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
import { createSalonAppointmentCalendarLink, createAppleCalendarICSContent } from "@/utils/googleCalendar";
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
  MapPin,
  User2,
} from "lucide-react";
import { useTranslations } from "@/i18n/useTranslations";
import { useLocale } from "@/i18n/LocaleContext";

// ✅ Динамически импортируем компоненты
const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });
const StripePaymentForm = dynamic(() => import('@/components/payment/StripePaymentForm'), { ssr: false });
const PayPalButtons = dynamic(() => import('@/components/payment/PayPalButtons'), { ssr: false });

type PaymentMethod = "onsite" | "stripe" | "paypal";

// ✅ Инициализация Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
  const [isFooterVisible, setIsFooterVisible] = React.useState(false);

  React.useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
      <BookingAnimatedBackground />
      <FloatingParticles />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
      </div>

      <Ballpit
        className={`pointer-events-none transition-opacity duration-500 ${
          isFooterVisible ? "opacity-0" : "opacity-100"
        }`}
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

      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

      <header className="booking-header pointer-events-auto fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
          <PremiumProgressBar currentStep={5} steps={bookingSteps} />
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
  const t = useTranslations();
  const { locale } = useLocale();

  const BOOKING_STEPS = React.useMemo(() => [
    { id: "services", label: t("booking_step_services"), icon: "✨" },
    { id: "master", label: t("booking_step_master"), icon: "👤" },
    { id: "calendar", label: t("booking_step_date"), icon: "📅" },
    { id: "client", label: t("booking_step_client"), icon: "📝" },
    { id: "verify", label: t("booking_step_verify"), icon: "✓" },
    { id: "payment", label: t("booking_step_payment"), icon: "💳" },
  ], [t]);

  const appointmentId = searchParams.get("appointment") ?? "";

  const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod>("onsite");
  const [error, setError] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState<number>(5000);
  const [isCreatingPayment, setIsCreatingPayment] = React.useState(false);

  React.useEffect(() => {
    if (appointmentId) {
      loadAppointmentData();
    }
  }, [appointmentId]);

  const loadAppointmentData = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      if (!response.ok) throw new Error('Failed to load appointment');
      
      const appointment = await response.json();
      setPaymentAmount(appointment.totalPrice || 5000);
    } catch (error) {
      console.error('Error loading appointment:', error);
      setPaymentAmount(5000);
    }
  };

  const createStripePayment = async () => {
    if (!appointmentId) return;
    
    setIsCreatingPayment(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/create-stripe-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          amount: paymentAmount,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error('Error creating Stripe payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create payment');
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleMethodSelect = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);
    setClientSecret(null);

    if (method === 'stripe') {
      await createStripePayment();
    }
  };

  // ✅ ИСПРАВЛЕНО: Убран вызов несуществующего endpoint
  const handlePaymentSuccess = async (paymentId: string) => {
    try {
      console.log('✅ Payment successful:', paymentId);
      
      // ❌ СТАРЫЙ КОД (вызывал 404):
      // await fetch(`/api/appointments/${appointmentId}/payment`, { ... });
      
      // ✅ НОВЫЙ КОД: Stripe webhook уже обновил статус в БД
      // Просто показываем модалку успеха
      setShowModal(true);
    } catch (error) {
      console.error('Error in payment success handler:', error);
      setError('Payment successful but there was an issue. Please contact support.');
    }
  };

  const handleAddToGoogleCalendar = async () => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const response = await fetch(`/api/appointments/${appointmentId}`);
      
      if (!response.ok) {
        throw new Error(t("booking_success_error_load_failed"));
      }
      
      const appointment = await response.json();
      
      const calendarLink = createSalonAppointmentCalendarLink({
        serviceTitle: appointment.serviceTitle,
        masterName: appointment.masterName,
        dateIso: appointment.startAt,
        timeIso: appointment.startAt,
        duration: appointment.duration,
        appointmentId: appointmentId,
        locale: locale,
      });
      
      if (isIOS) {
        window.location.href = calendarLink;
      } else {
        window.open(calendarLink, '_blank', 'noopener,noreferrer');
      }
      
    } catch (error) {
      console.error('Ошибка при создании события календаря:', error);
      alert(t("booking_success_error_load_failed"));
    }
  };

  const handleAddToAppleCalendar = async () => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        const calendarUrl = `/api/appointments/${appointmentId}/calendar?locale=${locale}`;
        window.location.href = calendarUrl;
      } else {
        const response = await fetch(`/api/appointments/${appointmentId}`);
        
        if (!response.ok) {
          throw new Error(t("booking_success_error_load_failed"));
        }
        
        const appointment = await response.json();
        
        const icsContent = createAppleCalendarICSContent({
          serviceTitle: appointment.serviceTitle,
          masterName: appointment.masterName,
          dateIso: appointment.startAt,
          timeIso: appointment.startAt,
          duration: appointment.duration,
          appointmentId: appointmentId,
          locale: locale,
        });
        
        const icsBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(icsBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `SalonElen-${appointmentId}.ics`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      }
      
    } catch (error) {
      console.error('Error creating .ics file:', error);
      alert(t("booking_success_error_load_failed"));
    }
  };

 const handleConfirm = async (): Promise<void> => {
  if (!appointmentId) {
    setError(t("booking_payment_error_missing"));
    return;
  }

  setError(null);
  setIsCreatingPayment(true);

  try {
    const response = await fetch('/api/booking/confirm-onsite-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to confirm payment');
    }

    console.log('✅ [Onsite Payment] Confirmed successfully');
    setShowModal(true);
  } catch (error) {
    console.error('❌ [Onsite Payment] Error:', error);
    setError(
      error instanceof Error 
        ? error.message 
        : 'Failed to confirm payment. Please try again.'
    );
  } finally {
    setIsCreatingPayment(false);
  }
};

  if (!appointmentId) {
    return (
      <PageShell bookingSteps={BOOKING_STEPS}>
        <main className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-24 pt-4 md:pt-6 xl:px-8">
          <div className="mx-auto max-w-2xl rounded-xl md:rounded-2xl border border-red-500/40 bg-red-500/10 p-4 md:p-6 backdrop-blur-xl">
            <div className="flex items-start gap-2 md:gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 md:h-5 md:w-5 text-red-300 flex-shrink-0" />
              <div className="space-y-2">
                <h1 className="text-base md:text-lg font-semibold text-red-100">
                  {t("booking_payment_error_title")}
                </h1>
                <p className="text-xs md:text-sm text-red-100/80 leading-relaxed">
                  {t("booking_payment_error_desc")}
                </p>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-3.5 py-2 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-black shadow-[0_10px_30px_rgba(245,197,24,0.45)] hover:brightness-110"
                >
                  <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {t("booking_payment_error_return")}
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
    <PageShell bookingSteps={BOOKING_STEPS}>
      <main className="pointer-events-auto relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-16 md:pb-24 xl:px-8">
        {/* ПРЕМИУМ ЗАГОЛОВОК */}
        <div className="relative z-10 flex w-full flex-col items-center text-center pt-4 md:pt-8 px-2">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative mb-4 md:mb-8"
          >
            <div className="absolute -inset-4 md:-inset-6 animate-pulse rounded-full bg-gradient-to-r from-amber-400/50 via-yellow-300/50 to-amber-500/50 opacity-70 blur-xl" />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex items-center gap-2 md:gap-3 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-4 py-2 md:px-8 md:py-3 shadow-[0_15px_50px_rgba(251,191,36,0.6)]"
            >
              <Crown className="h-4 w-4 md:h-5 md:w-5 text-black drop-shadow-lg" />
              <span className="font-serif text-xs font-bold italic text-black drop-shadow-sm md:text-base lg:text-lg">
                {t("booking_payment_badge")}
              </span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="brand-script relative mb-3 md:mb-4 text-2xl font-bold italic leading-tight md:text-4xl lg:text-5xl xl:text-6xl px-2"
            style={{
              color: '#FFFFFF',
              textShadow: `
                0 0 20px rgba(251,191,36,0.8),
                0 0 30px rgba(251,191,36,0.6),
                0 2px 4px rgba(0,0,0,0.9),
                0 4px 8px rgba(0,0,0,0.7)
              `,
            }}
          >
            {t("booking_payment_hero_title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="brand-script relative mx-auto max-w-3xl text-base font-semibold italic tracking-wide md:text-xl lg:text-2xl xl:text-3xl px-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: '#FF6EC7',
              textShadow: `
                0 0 15px rgba(255,110,199,0.8),
                0 0 20px rgba(255,110,199,0.5),
                0 2px 4px rgba(0,0,0,0.8),
                0 4px 8px rgba(0,0,0,0.6)
              `,
            }}
          >
            {t("booking_payment_hero_subtitle")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-3 md:mt-4 text-xs md:text-sm px-2"
            style={{
              color: '#E5E7EB',
              textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)',
            }}
          >
            <span className="hidden sm:inline">{t("booking_payment_appointment_id")}{" "}</span>
            <span 
              className="font-mono text-xs md:text-sm font-semibold break-all"
              style={{
                color: '#FCD34D',
                textShadow: '0 0 10px rgba(252,211,77,0.6), 0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {appointmentId}
            </span>
          </motion.p>

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
            className="mx-auto mt-4 md:mt-6 h-0.5 md:h-1 w-24 md:w-32 lg:w-40 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.6)]"
          />
        </div>

        {/* ДВА СТОЛБЦА */}
        <div className="relative z-10 mt-8 md:mt-12 grid items-start gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          {/* ПРЕМИУМ ФОРМА ОПЛАТЫ */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative z-10"
          >
            <div className="relative z-10 rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_50px_rgba(168,85,247,0.4)]">
              <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%)] blur-3xl" />

              <div className="relative z-10 overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-4 md:p-6 lg:p-8 ring-1 ring-white/10 backdrop-blur-xl">
                <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
                <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

                <div className="relative space-y-4 md:space-y-6">
                  <h2 className="brand-script flex items-center gap-2 md:gap-3 text-lg font-bold italic text-white md:text-xl lg:text-2xl">
                    <span className="inline-flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-300" />
                    </span>
                    {t("booking_payment_method_title")}
                  </h2>

                  {/* ✅ МЕТОДЫ ОПЛАТЫ */}
                  <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    
                    {/* ОПЛАТА В САЛОНЕ */}
                    <motion.button
                      type="button"
                      onClick={() => handleMethodSelect("onsite")}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex flex-col items-start gap-2.5 md:gap-3 rounded-xl md:rounded-2xl border px-3 py-3 md:px-4 md:py-4 text-left transition-all ${
                        selectedMethod === "onsite"
                          ? "border-emerald-400/80 bg-gradient-to-r from-emerald-500/30 via-emerald-600/20 to-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                          : "border-white/15 bg-white/5 hover:border-emerald-300/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5 md:gap-3">
                          <div className="relative flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-400/40 shadow-inner">
                            <Wallet className="h-5 w-5 md:h-6 md:w-6 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          </div>
                          <div>
                            <div className="text-sm md:text-base font-bold text-white">{t("booking_payment_onsite_title")}</div>
                            <div className="text-[10px] md:text-xs text-slate-400">{t("booking_payment_onsite_desc")}</div>
                          </div>
                        </div>
                        {selectedMethod === "onsite" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-emerald-500 shadow-lg flex-shrink-0"
                          >
                            <Check className="h-3 w-3 md:h-4 md:w-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>

                    {/* STRIPE */}
                    <motion.button
                      type="button"
                      onClick={() => handleMethodSelect("stripe")}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex flex-col items-start gap-2.5 md:gap-3 rounded-xl md:rounded-2xl border px-3 py-3 md:px-4 md:py-4 text-left transition-all ${
                        selectedMethod === "stripe"
                          ? "border-blue-400/80 bg-gradient-to-r from-blue-500/30 via-blue-600/20 to-blue-500/25 shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                          : "border-white/15 bg-white/5 hover:border-blue-300/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5 md:gap-3">
                          <div className="relative flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 ring-1 ring-blue-400/40 shadow-inner">
                            <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                          </div>
                          <div>
                            <div className="text-sm md:text-base font-bold text-white">{t("booking_payment_stripe_title")}</div>
                            <div className="text-[10px] md:text-xs text-slate-400">{t("booking_payment_stripe_desc")}</div>
                          </div>
                        </div>
                        {selectedMethod === "stripe" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-blue-500 shadow-lg flex-shrink-0"
                          >
                            <Check className="h-3 w-3 md:h-4 md:w-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>

                    {/* PAYPAL */}
                    <motion.button
                      type="button"
                      onClick={() => handleMethodSelect("paypal")}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex flex-col items-start gap-2.5 md:gap-3 rounded-xl md:rounded-2xl border px-3 py-3 md:px-4 md:py-4 text-left transition-all ${
                        selectedMethod === "paypal"
                          ? "border-amber-400/80 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/25 shadow-[0_0_25px_rgba(245,197,24,0.4)]"
                          : "border-white/15 bg-white/5 hover:border-amber-300/50 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2.5 md:gap-3">
                          <div className="relative flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 ring-1 ring-amber-400/40 shadow-inner">
                            <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="currentColor">
                              <path fill="#FFC439" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.641.641 0 0 1 .633-.543h6.854c3.522 0 5.665 1.653 5.665 4.593 0 3.546-2.564 5.874-6.48 5.874h-2.79l-1.75 7.693z"/>
                              <path fill="#169BD7" d="M14.146 3.177h-6.854a.641.641 0 0 0-.633.543L3.552 20.596a.641.641 0 0 0 .633.74h4.606l1.75-7.693h2.79c3.916 0 6.48-2.328 6.48-5.874 0-2.94-2.143-4.593-5.665-4.593z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm md:text-base font-bold text-white">{t("booking_payment_paypal_title")}</div>
                            <div className="text-[10px] md:text-xs text-slate-400">{t("booking_payment_paypal_desc")}</div>
                          </div>
                        </div>
                        {selectedMethod === "paypal" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg flex-shrink-0"
                          >
                            <Check className="h-3 w-3 md:h-4 md:w-4 text-black" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  </div>

                  {/* ФОРМЫ ОПЛАТЫ */}
                  <div className="mt-6">
                    <AnimatePresence mode="wait">
                    {selectedMethod === "stripe" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        {isCreatingPayment ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                              <p className="mt-3 text-sm text-slate-300">{t("booking_payment_stripe_processing")}</p>
                            </div>
                          </div>
                        ) : clientSecret ? (
                          <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <StripePaymentForm
                              amount={paymentAmount}
                              appointmentId={appointmentId}
                              onSuccess={handlePaymentSuccess}
                              onError={(error) => setError(error)}
                            />
                          </Elements>
                        ) : (
                          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-sm text-red-200">
                            Failed to initialize payment. Please try again.
                          </div>
                        )}
                      </motion.div>
                    )}

                    {selectedMethod === "paypal" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <PayPalButtons
                          amount={paymentAmount}
                          appointmentId={appointmentId}
                          onSuccess={handlePaymentSuccess}
                          onError={(error) => setError(error)}
                        />
                      </motion.div>
                    )}

                    {selectedMethod === "onsite" && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="pt-4"
                      >
                        <motion.button
                          type="button"
                          onClick={handleConfirm}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl md:rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-5 py-3.5 md:px-6 md:py-4 text-sm md:text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition-all hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
                        >
                          <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                          {t("booking_payment_confirm_button")}
                        </motion.button>
                        <p className="mt-2 md:mt-3 text-center text-[10px] md:text-xs text-slate-400 leading-relaxed px-2">
                          {t("booking_payment_confirm_terms")}
                        </p>
                      </motion.div>
                    )}
                    </AnimatePresence>
                  </div>

                  {/* ✅ ОБНОВЛЁННЫЙ ИНФО БЛОК */}
                  <div className="space-y-2 md:space-y-3 rounded-xl md:rounded-2xl border border-white/10 bg-slate-900/60 p-3 md:p-4 backdrop-blur-xl">
                    <p className="flex items-center gap-2 text-sm md:text-base font-bold text-white">
                      <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-400 flex-shrink-0" />
                      {t("booking_payment_info_how_works_title")}
                    </p>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                      {t("booking_payment_info_how_works_desc")}
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-start gap-2 md:gap-3 rounded-xl md:rounded-2xl border border-red-500/40 bg-red-500/10 p-3 md:p-4 backdrop-blur-xl"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-red-400" />
                        <span className="text-xs md:text-sm text-red-200">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

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
            <div className="relative z-10 rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
              <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

              <div className="relative z-10 overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-4 md:p-6 lg:p-8 ring-1 ring-white/10 backdrop-blur-xl">
                <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
                <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

                <div className="relative space-y-4 md:space-y-5">
                  <h3 className="brand-script mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-lg font-bold italic md:text-xl lg:text-2xl xl:text-3xl">
                    <span className="inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full border border-cyan-400/70 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                      <Scissors className="h-4 w-4 md:h-5 md:w-5 text-cyan-300" />
                    </span>
                    <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                      {t("booking_payment_summary_title")}
                    </span>
                  </h3>

                  <div className="space-y-2 md:space-y-3 rounded-xl md:rounded-2xl border border-white/10 bg-slate-900/60 p-3 md:p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-white">
                      <User2 className="h-4 w-4 md:h-5 md:w-5 text-cyan-400 flex-shrink-0" />
                      <span>{t("booking_payment_summary_visit")}</span>
                    </div>
                    <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-slate-300">
                      <li className="flex items-start gap-1.5 md:gap-2">
                        <Check className="mt-0.5 h-3 w-3 md:h-4 md:w-4 flex-shrink-0 text-cyan-400" />
                        <span>{t("booking_payment_summary_service")}</span>
                      </li>
                      <li className="flex items-start gap-1.5 md:gap-2">
                        <Check className="mt-0.5 h-3 w-3 md:h-4 md:w-4 flex-shrink-0 text-cyan-400" />
                        <span>{t("booking_payment_summary_master")}</span>
                      </li>
                      <li className="flex items-start gap-1.5 md:gap-2">
                        <Check className="mt-0.5 h-3 w-3 md:h-4 md:w-4 flex-shrink-0 text-cyan-400" />
                        <span className="break-all">{t("booking_payment_summary_datetime")} {appointmentId.slice(0, 8)}...</span>
                      </li>
                      <li className="flex items-start gap-1.5 md:gap-2">
                        <Check className="mt-0.5 h-3 w-3 md:h-4 md:w-4 flex-shrink-0 text-cyan-400" />
                        <span>{t("booking_payment_summary_address")}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 md:space-y-3 rounded-xl md:rounded-2xl border border-white/10 bg-slate-900/60 p-3 md:p-4 backdrop-blur-xl">
                    <p className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-wide text-slate-400">
                      <MapPin className="h-3 w-3 md:h-4 md:w-4 text-cyan-400 flex-shrink-0" />
                      {t("booking_payment_summary_cancellation_title")}
                    </p>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                      {t("booking_payment_summary_cancellation_desc")}
                    </p>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
              </div>
            </div>
          </motion.aside>
        </div>
      </main>

      {/* ПРЕМИУМ МОДАЛКА */}
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
              <div className="relative rounded-[32px] bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[2px] shadow-[0_0_60px_rgba(251,191,36,0.6)]">
                <div className="pointer-events-none absolute -inset-16 rounded-[40px] bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.4),transparent_70%)] blur-3xl" />

                <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 p-6 md:p-8 ring-1 ring-white/10 backdrop-blur-xl">
                  <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-amber-300/30 blur-3xl" />
                  <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="absolute right-4 top-4 md:right-6 md:top-6 inline-flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 transition hover:border-amber-300 hover:bg-black/70 hover:text-amber-200"
                  >
                    <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>

                  <div className="relative z-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="mx-auto mb-5 md:mb-6 flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 ring-4 ring-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                    >
                      <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-emerald-300" />
                    </motion.div>

                    <h2 className="brand-script mb-3 md:mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-2xl md:text-3xl lg:text-4xl font-bold italic text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] px-2">
                      {t("booking_payment_success_title")}
                    </h2>

                    <p className="mb-6 md:mb-8 text-sm md:text-base lg:text-lg text-slate-200 px-4">
                      {t("booking_payment_success_desc")}
                    </p>

                    <div className="flex flex-col gap-2.5 md:gap-3">
                      <Link
                        href="/"
                        className="w-full rounded-xl md:rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-5 py-3 md:px-6 md:py-3.5 text-center text-sm md:text-base font-bold text-black shadow-[0_0_30px_rgba(251,191,36,0.7)] transition hover:shadow-[0_0_40px_rgba(251,191,36,0.9)]"
                      >
                        {t("booking_payment_success_home")}
                      </Link>

                      <motion.button
                        type="button"
                        onClick={handleAddToGoogleCalendar}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative w-full overflow-hidden rounded-xl md:rounded-2xl border border-white/20 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-600/20 px-5 py-3 md:px-6 md:py-3.5 text-center text-sm md:text-base font-semibold text-white transition hover:border-blue-400/60 hover:from-blue-600/30 hover:via-blue-500/30 hover:to-blue-600/30"
                      >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 transition-opacity group-hover:animate-[shimmer_2s_ease-in-out_infinite] group-hover:opacity-100" />
                        
                        <div className="relative flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ 
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3
                            }}
                            className="flex-shrink-0"
                          >
                            <svg 
                              className="h-4 w-4 md:h-5 md:w-5" 
                              viewBox="0 0 24 24" 
                              fill="none"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <path d="M3 10h18" stroke="currentColor" strokeWidth="2"/>
                              <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <circle cx="8" cy="14" r="1.5" fill="#4285F4" className="animate-pulse"/>
                              <circle cx="12" cy="14" r="1.5" fill="#EA4335" className="animate-pulse" style={{ animationDelay: '0.2s' }}/>
                              <circle cx="16" cy="14" r="1.5" fill="#FBBC04" className="animate-pulse" style={{ animationDelay: '0.4s' }}/>
                              <circle cx="8" cy="18" r="1.5" fill="#34A853" className="animate-pulse" style={{ animationDelay: '0.6s' }}/>
                            </svg>
                          </motion.div>
                          <span className="text-xs md:text-sm lg:text-base">{t("booking_payment_success_calendar")}</span>
                        </div>
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={handleAddToAppleCalendar}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative w-full overflow-hidden rounded-xl md:rounded-2xl border border-white/20 bg-gradient-to-r from-purple-600/20 via-purple-500/20 to-purple-600/20 px-5 py-3 md:px-6 md:py-3.5 text-center text-sm md:text-base font-semibold text-white transition hover:border-purple-400/60 hover:from-purple-600/30 hover:via-purple-500/30 hover:to-purple-600/30"
                      >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent opacity-0 transition-opacity group-hover:animate-[shimmer_2s_ease-in-out_infinite] group-hover:opacity-100" />
                        
                        <div className="relative flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ 
                              y: [0, -3, 0],
                              scale: [1, 1.05, 1]
                            }}
                            transition={{ 
                              duration: 2.5,
                              repeat: Infinity,
                              repeatDelay: 2
                            }}
                            className="flex-shrink-0"
                          >
                            <svg 
                              className="h-4 w-4 md:h-5 md:w-5" 
                              viewBox="0 0 24 24" 
                              fill="none"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                              <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
                              <path d="M7 2v4M17 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              <text x="12" y="17" fontSize="8" fill="currentColor" textAnchor="middle" fontWeight="bold">
                                {new Date().getDate()}
                              </text>
                              <circle cx="12" cy="15" r="4" fill="url(#appleGlow)" opacity="0.3" className="animate-pulse"/>
                              <defs>
                                <radialGradient id="appleGlow">
                                  <stop offset="0%" stopColor="#A855F7"/>
                                  <stop offset="100%" stopColor="transparent"/>
                                </radialGradient>
                              </defs>
                            </svg>
                          </motion.div>
                          <span className="text-xs md:text-sm lg:text-base">{t("booking_payment_success_apple_calendar")}</span>
                        </div>
                      </motion.button>

                      <Link
                        href="/booking"
                        className="w-full rounded-xl md:rounded-2xl border border-white/20 bg-white/5 px-5 py-3 md:px-6 md:py-3.5 text-center text-sm md:text-base font-semibold text-white transition hover:bg-white/10"
                      >
                        {t("booking_payment_success_new")}
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
