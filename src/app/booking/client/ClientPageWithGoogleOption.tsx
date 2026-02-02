// ОБНОВЛЕНО: 4 карточки (Google, Telegram, SMS, Form)
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { Crown, Sparkles, Star, Zap, Check, Shield, Edit, Phone, Send } from "lucide-react";
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import { useTranslations } from "@/i18n/useTranslations";
import { useI18n } from "@/i18n/I18nProvider";

interface ClientPageWithGoogleOptionProps {
  serviceId: string;
  masterId: string;
  startAt: string;
  endAt: string;
  selectedDate: string;
}

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

export default function ClientPageWithGoogleOption({
  serviceId,
  masterId,
  startAt,
  endAt,
  selectedDate,
}: ClientPageWithGoogleOptionProps) {
  const router = useRouter();
  const t = useTranslations();
  const { locale } = useI18n();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showGoogleAuth, setShowGoogleAuth] = React.useState(false);
  const [isPolling, setIsPolling] = React.useState(false);
  const pollingRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const BOOKING_STEPS = React.useMemo(
    () => [
      { id: "services", label: t("booking_step_services"), icon: "✨" },
      { id: "master", label: t("booking_step_master"), icon: "👤" },
      { id: "calendar", label: t("booking_step_date"), icon: "📅" },
      { id: "client", label: t("booking_step_client"), icon: "📝" },
      { id: "verify", label: t("booking_step_verify"), icon: "✓" },
      { id: "payment", label: t("booking_step_payment"), icon: "💳" },
    ],
    [t]
  );

  const handleGoogleRegistration = async () => {
    setLoading(true);
    setError(null);

    const popup = openGooglePopup("about:blank");

    if (!popup) {
      setError(t("booking_client_popup_blocked"));
      setLoading(false);
      return;
    }

    try {
      setShowGoogleAuth(true);

      const res = await fetch("/api/booking/client/google-quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, masterId, startAt, endAt, locale }),
      });

      const data: {
        ok?: boolean;
        error?: string;
        authUrl?: string;
        requestId?: string;
      } = await res.json();

      if (!res.ok || !data.ok || !data.authUrl || !data.requestId) {
        popup.close();
        throw new Error(data.error || t("booking_client_google_error_init"));
      }

      popup.location.href = data.authUrl;
      startPolling(data.requestId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("booking_client_auth_error");
      setError(msg);
      setShowGoogleAuth(false);
      if (popup && !popup.closed) {
        popup.close();
      }
    } finally {
      setLoading(false);
    }
  };

  const openGooglePopup = (url: string): Window | null => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    return window.open(
      url,
      "Google OAuth",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const startPolling = (requestId: string) => {
    setIsPolling(true);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/booking/client/google-quick/status?requestId=${encodeURIComponent(
            requestId
          )}`
        );
        const data: {
          verified?: boolean;
          appointmentId?: string;
          error?: string;
        } = await res.json();

        if (data.verified === true && data.appointmentId) {
          setIsPolling(false);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          router.push(`/booking/payment?appointment=${data.appointmentId}`);
        } else if (data.error) {
          throw new Error(data.error);
        }
      } catch (e) {
        console.error("[Google Quick Reg] Polling error:", e);
        setIsPolling(false);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setError(
          e instanceof Error ? e.message : t("booking_client_auth_error")
        );
        setShowGoogleAuth(false);
      }
    }, 2000);
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof window === "undefined") return;
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      if (
        data &&
        typeof data === "object" &&
        data.type === "booking-complete" &&
        data.appointmentId
      ) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setIsPolling(false);
        setShowGoogleAuth(false);
        router.push(`/booking/payment?appointment=${data.appointmentId}`);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router]);

  React.useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  const handleManualForm = () => {
    router.push(
      `/booking/client/form?s=${encodeURIComponent(
        serviceId
      )}&m=${encodeURIComponent(masterId)}&start=${encodeURIComponent(
        startAt
      )}&end=${encodeURIComponent(endAt)}&d=${encodeURIComponent(selectedDate)}`
    );
  };

  const handleSmsPhoneRegistration = () => {
    router.push(
      `/booking/sms-verify?s=${encodeURIComponent(
        serviceId
      )}&m=${encodeURIComponent(masterId)}&start=${encodeURIComponent(
        startAt
      )}&end=${encodeURIComponent(endAt)}&d=${encodeURIComponent(selectedDate)}`
    );
  };

  const handleTelegramRegistration = () => {
    router.push(
      `/booking/telegram-verify?s=${encodeURIComponent(
        serviceId
      )}&m=${encodeURIComponent(masterId)}&start=${encodeURIComponent(
        startAt
      )}&end=${encodeURIComponent(endAt)}&d=${encodeURIComponent(selectedDate)}`
    );
  };

  const isDisabled = loading || isPolling;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

      <BookingAnimatedBackground />
      <FloatingParticles />

      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
            <div className="mb-3 flex items-center gap-4">
              <Link href="/" className="group inline-flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg shadow-black/70 ring-1 ring-black">
                  <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
                    <span className="text-xl leading-none">💎</span>
                  </div>
                </div>
                <div>
                  <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15] drop-shadow-[0_0_12px_rgba(250,204,21,0.45)]">
                    Salon Elen
                  </span>
                  <span className="block text-xs text-cyan-400/85">
                    Premium Beauty Experience
                  </span>
                </div>
              </Link>
            </div>

            <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
          </div>
        </header>

        <div className="h-[120px]" />

        <main className="flex flex-1 items-center justify-center px-4 pb-10 pt-6 sm:pb-12">
          <div className="w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-4xl font-bold italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] md:text-5xl lg:text-6xl"
                style={{
                  textShadow:
                    "0 0 40px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.3)",
                }}
              >
                {t("booking_client_choice_title")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="brand-script text-xl font-semibold italic tracking-wide text-cyan-400/95 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] md:text-2xl"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                {t("booking_client_choice_subtitle")}
              </motion.p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent md:w-40"
              />
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-center text-sm text-red-200 backdrop-blur-xl"
              >
                ⚠️ {error}
              </motion.div>
            )}

            {showGoogleAuth && isPolling && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-4 text-center text-sm text-cyan-100 backdrop-blur-xl"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                  {t("booking_client_auth_waiting")}
                </div>
              </motion.div>
            )}

            {/* 4 КАРТОЧКИ */}
            <div className="grid gap-8 lg:grid-cols-4">
              {/* GOOGLE */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group relative"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-4 left-1/2 z-20 -translate-x-1/2"
                >
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(251,191,36,0.6)",
                        "0 0 35px rgba(251,191,36,1)",
                        "0 0 20px rgba(251,191,36,0.6)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-5 py-2 shadow-xl"
                  >
                    <Crown className="h-4 w-4 text-black" />
                    <span className="text-sm font-bold text-black">
                      {t("booking_client_choice_recommended")}
                    </span>
                  </motion.div>
                </motion.div>

                <div className="relative h-full rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                  <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.25),transparent_65%)] blur-3xl" />

                  <div className="relative h-full overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
                    <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-amber-300/20 blur-3xl" />
                    <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-emerald-400/18 blur-3xl" />

                    <div className="grid h-full grid-rows-[auto_auto_auto_1fr_auto] gap-5">
                      <div className="flex justify-center">
                        <div className="relative">
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

                          <motion.div
                            animate={{
                              scale: [1, 1.3, 1],
                              rotate: [0, 180, 360],
                              opacity: [0.7, 1, 0.7],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-2 -right-2 z-10"
                          >
                            <Sparkles className="h-5 w-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                          </motion.div>

                          <motion.div
                            animate={{
                              scale: [1, 1.4, 1],
                              rotate: [360, 180, 0],
                              opacity: [0.6, 1, 0.6],
                            }}
                            transition={{ duration: 3.5, repeat: Infinity, delay: 0.7 }}
                            className="absolute -bottom-2 -left-2 z-10"
                          >
                            <Star className="h-4 w-4 text-yellow-200 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" />
                          </motion.div>

                          <motion.div
                            animate={{
                              rotate: [-4, 3, -4],
                              boxShadow: [
                                "0 0 22px rgba(212,175,55,0.7)",
                                "0 0 30px rgba(212,175,55,1)",
                                "0 0 22px rgba(212,175,55,0.7)",
                              ],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut",
                            }}
                            whileHover={{ scale: 1.08 }}
                            className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-amber-400/70 bg-gradient-to-br from-amber-400/25 via-slate-900 to-black"
                          >
                            <FcGoogle className="h-14 w-14" />
                          </motion.div>
                        </div>
                      </div>

                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="brand-script text-center text-2xl font-bold lg:text-3xl"
                      >
                        <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                          {t("booking_client_google_title")}
                        </span>
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="text-center text-base text-slate-200/90 lg:text-lg"
                      >
                        {t("booking_client_google_description")}
                      </motion.p>

                      <div className="flex min-h-[160px] flex-col justify-start space-y-3">
                        {[
                          { text: t("booking_client_google_benefit_1"), icon: "⚡" },
                          { text: t("booking_client_google_benefit_2"), icon: "✨" },
                          { text: t("booking_client_google_benefit_3"), icon: "🛡️" },
                          { text: t("booking_client_google_benefit_4"), icon: "⏱️" },
                        ].map((benefit, i) => (
                          <motion.div
                            key={benefit.text}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="group flex items-center gap-3 text-sm text-slate-200"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-400/20 ring-1 ring-amber-400/40 shadow-[0_0_8px_rgba(251,191,36,0.3)] transition-all group-hover:shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                            >
                              <Check className="h-4 w-4 text-amber-300" />
                            </motion.div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{benefit.icon}</span>
                              <span className="font-medium">{benefit.text}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <motion.button
                          type="button"
                          onClick={handleGoogleRegistration}
                          disabled={isDisabled}
                          whileHover={!isDisabled ? { scale: 1.03 } : undefined}
                          whileTap={!isDisabled ? { scale: 0.97 } : undefined}
                          animate={
                            !isDisabled
                              ? {
                                  boxShadow: [
                                    "0 0 30px rgba(251,191,36,0.7)",
                                    "0 0 50px rgba(251,191,36,1)",
                                    "0 0 30px rgba(251,191,36,0.7)",
                                  ],
                                }
                              : undefined
                          }
                          transition={
                            !isDisabled ? { duration: 2, repeat: Infinity } : undefined
                          }
                          className="group/btn relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-lg font-bold text-black shadow-2xl transition-all disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {!isDisabled && (
                            <motion.div
                              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                              animate={{ translateX: ["0%", "200%"] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1,
                              }}
                            />
                          )}

                          {loading ? (
                            <>
                              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/40 border-t-transparent" />
                              {t("booking_client_google_connecting")}
                            </>
                          ) : (
                            <>
                              <Crown className="h-5 w-5 transition-transform group-hover/btn:rotate-12" />
                              <span className="relative">
                                {t("booking_client_google_button")}
                              </span>
                              <motion.span
                                animate={{ x: [0, 5, 0] }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                }}
                              >
                                →
                              </motion.span>
                            </>
                          )}
                        </motion.button>

                        <div className="flex items-center justify-center gap-2 text-xs text-amber-200/70">
                          <Shield className="h-4 w-4" />
                          <span>{t("booking_client_google_security")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                  </div>
                </div>
              </motion.div>

              {/* TELEGRAM - НОВАЯ КАРТОЧКА */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group relative"
              >
                <div className="relative h-full rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-purple-400 to-violet-500 p-[2px] shadow-[0_0_50px_rgba(168,85,247,0.4)]">
                  <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.25),transparent_65%)] blur-3xl" />

                  <div className="relative h-full overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
                    <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-purple-300/20 blur-3xl" />
                    <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-violet-400/18 blur-3xl" />

                    <div className="grid h-full grid-rows-[auto_auto_auto_1fr_auto] gap-5">
                      <div className="flex justify-center">
                        <div className="relative">
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.4, 0.6, 0.4],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -inset-4 rounded-2xl bg-purple-400/30 blur-xl"
                          />
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                            className="absolute -inset-2 rounded-2xl bg-violet-400/40 blur-lg"
                          />

                          <motion.div
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.2, 1],
                              opacity: [0.6, 1, 0.6],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-2 -right-2 z-10"
                          >
                            <Sparkles className="h-4 w-4 text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
                          </motion.div>

                          <motion.div
                            animate={{
                              y: [0, -3, 0],
                              rotate: [-2, 2, -2],
                              boxShadow: [
                                "0 0 20px rgba(168,85,247,0.8)",
                                "0 0 30px rgba(168,85,247,1)",
                                "0 0 20px rgba(168,85,247,0.8)",
                              ],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut",
                            }}
                            whileHover={{ scale: 1.08, rotate: 5 }}
                            className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-purple-400/70 bg-gradient-to-br from-purple-400/25 via-slate-900 to-black"
                          >
                            <Send className="h-12 w-12 text-purple-300" />
                          </motion.div>
                        </div>
                      </div>

                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55 }}
                        className="brand-script text-center text-2xl font-bold lg:text-3xl"
                      >
                        <span className="bg-gradient-to-r from-purple-200 via-fuchsia-100 to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                          {t("booking_client_telegram_title")}
                        </span>
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center text-base text-slate-200/90 lg:text-lg"
                      >
                        {t("booking_client_telegram_description")}
                      </motion.p>

                      <div className="flex min-h-[160px] flex-col justify-start space-y-3">
                        {[
                          { text: t("booking_client_telegram_benefit_1"), icon: "💬" },
                          { text: t("booking_client_telegram_benefit_2"), icon: "⚡" },
                          { text: t("booking_client_telegram_benefit_3"), icon: "🛡️" },
                          { text: t("booking_client_telegram_benefit_4"), icon: "🔢" },
                        ].map((benefit, i) => (
                          <motion.div
                            key={benefit.text}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.65 + i * 0.1 }}
                            className="group flex items-center gap-3 text-sm text-slate-200"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400/30 to-violet-400/20 ring-1 ring-purple-400/40 shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all group-hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                            >
                              <Check className="h-4 w-4 text-purple-300" />
                            </motion.div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{benefit.icon}</span>
                              <span className="font-medium">{benefit.text}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <motion.button
                          type="button"
                          onClick={handleTelegramRegistration}
                          disabled={isDisabled}
                          whileHover={!isDisabled ? { scale: 1.03 } : undefined}
                          whileTap={!isDisabled ? { scale: 0.97 } : undefined}
                          className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-purple-400/50 bg-gradient-to-r from-purple-500/20 via-slate-900 to-purple-500/10 px-6 py-4 text-lg font-bold text-purple-100 shadow-lg shadow-purple-500/20 transition-all hover:border-purple-400/70 hover:bg-purple-500/30 hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Send className="h-5 w-5" />
                          {t("booking_client_telegram_button")}
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                            }}
                          >
                            →
                          </motion.span>
                        </motion.button>

                        <div className="flex items-center justify-center gap-2 text-xs text-purple-200/70">
                          <Shield className="h-4 w-4" />
                          <span>{t("booking_client_telegram_security")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
                  </div>
                </div>
              </motion.div>

              {/* SMS */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group relative"
              >
                <div className="relative h-full rounded-[32px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 p-[2px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                  <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.25),transparent_65%)] blur-3xl" />

                  <div className="relative h-full overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
                    <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
                    <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

                    <div className="grid h-full grid-rows-[auto_auto_auto_1fr_auto] gap-5">
                      <div className="flex justify-center">
                        <div className="relative">
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.4, 0.6, 0.4],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -inset-4 rounded-2xl bg-emerald-400/30 blur-xl"
                          />
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                            className="absolute -inset-2 rounded-2xl bg-teal-400/40 blur-lg"
                          />

                          <motion.div
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.2, 1],
                              opacity: [0.6, 1, 0.6],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -top-2 -right-2 z-10"
                          >
                            <Sparkles className="h-4 w-4 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                          </motion.div>

                          <motion.div
                            animate={{
                              y: [0, -3, 0],
                              rotate: [-2, 2, -2],
                              boxShadow: [
                                "0 0 20px rgba(16,185,129,0.8)",
                                "0 0 30px rgba(16,185,129,1)",
                                "0 0 20px rgba(16,185,129,0.8)",
                              ],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut",
                            }}
                            whileHover={{ scale: 1.08, rotate: 5 }}
                            className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-emerald-400/70 bg-gradient-to-br from-emerald-400/25 via-slate-900 to-black"
                          >
                            <Phone className="h-12 w-12 text-emerald-300" />
                          </motion.div>
                        </div>
                      </div>

                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="brand-script text-center text-2xl font-bold lg:text-3xl"
                      >
                        <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                          {t("booking_client_sms_title")}
                        </span>
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65 }}
                        className="text-center text-base text-slate-200/90 lg:text-lg"
                      >
                        {t("booking_client_sms_description")}
                      </motion.p>

                      <div className="flex min-h-[160px] flex-col justify-start space-y-3">
                        {[
                          { text: t("booking_client_sms_benefit_1"), icon: "📱" },
                          { text: t("booking_client_sms_benefit_2"), icon: "⚡" },
                          { text: t("booking_client_sms_benefit_3"), icon: "🛡️" },
                          { text: t("booking_client_sms_benefit_4"), icon: "🔢" },
                        ].map((benefit, i) => (
                          <motion.div
                            key={benefit.text}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + i * 0.1 }}
                            className="group flex items-center gap-3 text-sm text-slate-200"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all group-hover:shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                            >
                              <Check className="h-4 w-4 text-emerald-300" />
                            </motion.div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{benefit.icon}</span>
                              <span className="font-medium">{benefit.text}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <motion.button
                          type="button"
                          onClick={handleSmsPhoneRegistration}
                          disabled={isDisabled}
                          whileHover={!isDisabled ? { scale: 1.03 } : undefined}
                          whileTap={!isDisabled ? { scale: 0.97 } : undefined}
                          className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 via-slate-900 to-emerald-500/10 px-6 py-4 text-lg font-bold text-emerald-100 shadow-lg shadow-emerald-500/20 transition-all hover:border-emerald-400/70 hover:bg-emerald-500/30 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Phone className="h-5 w-5" />
                          {t("booking_client_sms_button")}
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                            }}
                          >
                            →
                          </motion.span>
                        </motion.button>

                        <div className="flex items-center justify-center gap-2 text-xs text-emerald-200/70">
                          <Shield className="h-4 w-4" />
                          <span>{t("booking_client_sms_security")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
                  </div>
                </div>
              </motion.div>

              {/* FORM */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="group relative"
              >
                <div className="relative h-full rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
                  <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.25),transparent_65%)] blur-3xl" />

                  <div className="relative h-full overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
                    <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
                    <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

                    <div className="grid h-full grid-rows-[auto_auto_auto_1fr_auto] gap-5">
                      <div className="flex justify-center">
                        <div className="relative">
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.4, 0.6, 0.4],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -inset-4 rounded-2xl bg-cyan-400/30 blur-xl"
                          />
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                            className="absolute -inset-2 rounded-2xl bg-sky-400/40 blur-lg"
                          />

                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.6, 1, 0.6],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                            className="absolute -top-2 -right-2 z-10"
                          >
                            <Zap className="h-4 w-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
                          </motion.div>

                          <motion.div
                            animate={{
                              y: [0, -3, 0],
                              rotate: [-3, 3, -3],
                              boxShadow: [
                                "0 0 20px rgba(34,211,238,0.8)",
                                "0 0 30px rgba(34,211,238,1)",
                                "0 0 20px rgba(34,211,238,0.8)",
                              ],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "loop",
                              ease: "easeInOut",
                            }}
                            whileHover={{ scale: 1.08, rotate: -2 }}
                            className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-cyan-400/70 bg-gradient-to-br from-cyan-400/25 via-slate-900 to-black"
                          >
                            <Edit className="h-12 w-12 text-cyan-300" />
                          </motion.div>
                        </div>
                      </div>

                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="brand-script text-center text-2xl font-bold lg:text-3xl"
                      >
                        <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                          {t("booking_client_form_title")}
                        </span>
                      </motion.h2>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.75 }}
                        className="text-center text-base text-slate-200/90 lg:text-lg"
                      >
                        {t("booking_client_form_description")}
                      </motion.p>

                      <div className="flex min-h-[160px] flex-col justify-start space-y-3">
                        {[
                          { text: t("booking_client_form_benefit_1"), icon: "🔒" },
                          { text: t("booking_client_form_benefit_2"), icon: "✓" },
                          { text: t("booking_client_form_benefit_3"), icon: "📝" },
                          { text: t("booking_client_form_benefit_4"), icon: "💬" },
                        ].map((benefit, i) => (
                          <motion.div
                            key={benefit.text}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                            className="group flex items-center gap-3 text-sm text-slate-200"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-sky-400/20 ring-1 ring-cyan-400/40 shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all group-hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                            >
                              <Check className="h-4 w-4 text-cyan-300" />
                            </motion.div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{benefit.icon}</span>
                              <span className="font-medium">{benefit.text}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <motion.button
                          type="button"
                          onClick={handleManualForm}
                          disabled={isDisabled}
                          whileHover={!isDisabled ? { scale: 1.03 } : undefined}
                          whileTap={!isDisabled ? { scale: 0.97 } : undefined}
                          className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 via-slate-900 to-cyan-500/10 px-6 py-4 text-lg font-bold text-cyan-100 shadow-lg shadow-cyan-500/20 transition-all hover:border-cyan-400/70 hover:bg-cyan-500/30 hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Edit className="h-5 w-5" />
                          {t("booking_client_form_button")}
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                            }}
                          >
                            →
                          </motion.span>
                        </motion.button>

                        <div className="flex items-center justify-center gap-2 text-xs text-cyan-200/70">
                          <Shield className="h-4 w-4" />
                          <span>{t("booking_client_form_security")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 text-center"
            >
              <p className="text-base text-slate-300">
                {t("booking_client_choice_footer")}{" "}
                <span className="bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text font-semibold text-transparent">
                  {t("booking_client_choice_footer_highlight")}
                </span>
              </p>
            </motion.div>
          </div>
        </main>
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




//------------31.01.26--------------
// // ОБНОВЛЕНО: 4 карточки (Google, Telegram, SMS, Form)
// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { FcGoogle } from "react-icons/fc";
// import { Crown, Sparkles, Star, Zap, Check, Shield, Edit, Phone, Send } from "lucide-react";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { useTranslations } from "@/i18n/useTranslations";

// interface ClientPageWithGoogleOptionProps {
//   serviceId: string;
//   masterId: string;
//   startAt: string;
//   endAt: string;
//   selectedDate: string;
// }

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

// export default function ClientPageWithGoogleOption({
//   serviceId,
//   masterId,
//   startAt,
//   endAt,
//   selectedDate,
// }: ClientPageWithGoogleOptionProps) {
//   const router = useRouter();
//   const t = useTranslations();

//   const [loading, setLoading] = React.useState(false);
//   const [error, setError] = React.useState<string | null>(null);
//   const [showGoogleAuth, setShowGoogleAuth] = React.useState(false);
//   const [isPolling, setIsPolling] = React.useState(false);
//   const pollingRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

//   const BOOKING_STEPS = React.useMemo(
//     () => [
//       { id: "services", label: t("booking_step_services"), icon: "✨" },
//       { id: "master", label: t("booking_step_master"), icon: "👤" },
//       { id: "calendar", label: t("booking_step_date"), icon: "📅" },
//       { id: "client", label: t("booking_step_client"), icon: "📝" },
//       { id: "verify", label: t("booking_step_verify"), icon: "✓" },
//       { id: "payment", label: t("booking_step_payment"), icon: "💳" },
//     ],
//     [t]
//   );

//   const handleGoogleRegistration = async () => {
//     setLoading(true);
//     setError(null);

//     const popup = openGooglePopup("about:blank");

//     if (!popup) {
//       setError(t("booking_client_popup_blocked"));
//       setLoading(false);
//       return;
//     }

//     try {
//       setShowGoogleAuth(true);

//       const res = await fetch("/api/booking/client/google-quick", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ serviceId, masterId, startAt, endAt }),
//       });

//       const data: {
//         ok?: boolean;
//         error?: string;
//         authUrl?: string;
//         requestId?: string;
//       } = await res.json();

//       if (!res.ok || !data.ok || !data.authUrl || !data.requestId) {
//         popup.close();
//         throw new Error(data.error || t("booking_client_google_error_init"));
//       }

//       popup.location.href = data.authUrl;
//       startPolling(data.requestId);
//     } catch (e) {
//       const msg = e instanceof Error ? e.message : t("booking_client_auth_error");
//       setError(msg);
//       setShowGoogleAuth(false);
//       if (popup && !popup.closed) {
//         popup.close();
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openGooglePopup = (url: string): Window | null => {
//     const width = 500;
//     const height = 600;
//     const left = window.screenX + (window.outerWidth - width) / 2;
//     const top = window.screenY + (window.outerHeight - height) / 2;

//     return window.open(
//       url,
//       "Google OAuth",
//       `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
//     );
//   };

//   const startPolling = (requestId: string) => {
//     setIsPolling(true);

//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await fetch(
//           `/api/booking/client/google-quick/status?requestId=${encodeURIComponent(
//             requestId
//           )}`
//         );
//         const data: {
//           verified?: boolean;
//           appointmentId?: string;
//           error?: string;
//         } = await res.json();

//         if (data.verified === true && data.appointmentId) {
//           setIsPolling(false);
//           if (pollingRef.current) {
//             clearInterval(pollingRef.current);
//             pollingRef.current = null;
//           }
//           router.push(`/booking/payment?appointment=${data.appointmentId}`);
//         } else if (data.error) {
//           throw new Error(data.error);
//         }
//       } catch (e) {
//         console.error("[Google Quick Reg] Polling error:", e);
//         setIsPolling(false);
//         if (pollingRef.current) {
//           clearInterval(pollingRef.current);
//           pollingRef.current = null;
//         }
//         setError(
//           e instanceof Error ? e.message : t("booking_client_auth_error")
//         );
//         setShowGoogleAuth(false);
//       }
//     }, 2000);
//   };

//   React.useEffect(() => {
//     const handleMessage = (event: MessageEvent) => {
//       if (typeof window === "undefined") return;
//       if (event.origin !== window.location.origin) return;

//       const data = event.data;
//       if (
//         data &&
//         typeof data === "object" &&
//         data.type === "booking-complete" &&
//         data.appointmentId
//       ) {
//         if (pollingRef.current) {
//           clearInterval(pollingRef.current);
//           pollingRef.current = null;
//         }
//         setIsPolling(false);
//         setShowGoogleAuth(false);
//         router.push(`/booking/payment?appointment=${data.appointmentId}`);
//       }
//     };

//     window.addEventListener("message", handleMessage);
//     return () => window.removeEventListener("message", handleMessage);
//   }, [router]);

//   React.useEffect(() => {
//     return () => {
//       if (pollingRef.current) {
//         clearInterval(pollingRef.current);
//         pollingRef.current = null;
//       }
//     };
//   }, []);

//   const handleManualForm = () => {
//     router.push(
//       `/booking/client/form?s=${encodeURIComponent(
//         serviceId
//       )}&m=${encodeURIComponent(masterId)}&start=${encodeURIComponent(
//         startAt
//       )}&end=${encodeURIComponent(endAt)}&d=${encodeURIComponent(selectedDate)}`
//     );
//   };

//   const handleSmsPhoneRegistration = () => {
//     router.push(
//       `/booking/sms-verify?s=${encodeURIComponent(
//         serviceId
//       )}&m=${encodeURIComponent(masterId)}&start=${encodeURIComponent(
//         startAt
//       )}&end=${encodeURIComponent(endAt)}&d=${encodeURIComponent(selectedDate)}`
//     );
//   };

//   const handleTelegramRegistration = () => {
//     router.push(
//       `/booking/telegram-verify?s=${encodeURIComponent(
//         serviceId
//       )}&m=${encodeURIComponent(masterId)}&start=${encodeURIComponent(
//         startAt
//       )}&end=${encodeURIComponent(endAt)}&d=${encodeURIComponent(selectedDate)}`
//     );
//   };

//   const isDisabled = loading || isPolling;

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-white">
//       <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       <BookingAnimatedBackground />
//       <FloatingParticles />

//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(236,72,153,0.25),_transparent_55%),radial-gradient(circle_at_80%_70%,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,191,36,0.15),_transparent_65%)]" />
//         <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-20 left-1/3 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
//         <div className="absolute bottom-[-4rem] right-1/4 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
//       </div>

//       <div className="relative z-10 flex min-h-screen flex-col">
//         <header className="booking-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
//           <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 xl:px-8">
//             <div className="mb-3 flex items-center gap-4">
//               <Link href="/" className="group inline-flex items-center gap-3">
//                 <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#020617] via-black to-[#020617] shadow-lg shadow-black/70 ring-1 ring-black">
//                   <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-amber-300" />
//                   <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#020617]">
//                     <span className="text-xl leading-none">💎</span>
//                   </div>
//                 </div>
//                 <div>
//                   <span className="block font-serif text-2xl font-bold tracking-wide text-[#FACC15] drop-shadow-[0_0_12px_rgba(250,204,21,0.45)]">
//                     Salon Elen
//                   </span>
//                   <span className="block text-xs text-cyan-400/85">
//                     Premium Beauty Experience
//                   </span>
//                 </div>
//               </Link>
//             </div>

//             <PremiumProgressBar currentStep={3} steps={BOOKING_STEPS} />
//           </div>
//         </header>

//         <div className="h-[120px]" />

//         <main className="flex flex-1 items-center justify-center px-4 pb-10 pt-6 sm:pb-12">
//           <div className="w-full max-w-7xl">
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mb-12 text-center"
//             >
//               <motion.h1
//                 initial={{ opacity: 0, y: 18 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="brand-script mb-4 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-4xl font-bold italic leading-tight text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.6)] md:text-5xl lg:text-6xl"
//                 style={{
//                   textShadow:
//                     "0 0 40px rgba(251,191,36,0.5), 0 0 60px rgba(251,191,36,0.3)",
//                 }}
//               >
//                 {t("booking_client_choice_title")}
//               </motion.h1>

//               <motion.p
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.3 }}
//                 className="brand-script text-xl font-semibold italic tracking-wide text-cyan-400/95 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] md:text-2xl"
//                 style={{
//                   fontFamily: "'Cormorant Garamond', serif",
//                 }}
//               >
//                 {t("booking_client_choice_subtitle")}
//               </motion.p>

//               <motion.div
//                 initial={{ scaleX: 0 }}
//                 animate={{ scaleX: 1 }}
//                 transition={{ delay: 0.4, duration: 0.8 }}
//                 className="mx-auto mt-6 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-300 to-transparent md:w-40"
//               />
//             </motion.div>

//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-center text-sm text-red-200 backdrop-blur-xl"
//               >
//                 ⚠️ {error}
//               </motion.div>
//             )}

//             {showGoogleAuth && isPolling && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="mb-6 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-4 text-center text-sm text-cyan-100 backdrop-blur-xl"
//               >
//                 <div className="flex items-center justify-center gap-3">
//                   <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
//                   {t("booking_client_auth_waiting")}
//                 </div>
//               </motion.div>
//             )}

//             {/* 4 КАРТОЧКИ */}
//             <div className="grid gap-8 lg:grid-cols-4">
//               {/* GOOGLE */}
//               <motion.div
//                 initial={{ opacity: 0, x: -30 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.3 }}
//                 whileHover={{ y: -8, scale: 1.01 }}
//                 className="group relative"
//               >
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ delay: 0.5, type: "spring" }}
//                   className="absolute -top-4 left-1/2 z-20 -translate-x-1/2"
//                 >
//                   <motion.div
//                     animate={{
//                       boxShadow: [
//                         "0 0 20px rgba(251,191,36,0.6)",
//                         "0 0 35px rgba(251,191,36,1)",
//                         "0 0 20px rgba(251,191,36,0.6)",
//                       ],
//                     }}
//                     transition={{ duration: 2, repeat: Infinity }}
//                     className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-5 py-2 shadow-xl"
//                   >
//                     <Crown className="h-4 w-4 text-black" />
//                     <span className="text-sm font-bold text-black">
//                       {t("booking_client_choice_recommended")}
//                     </span>
//                   </motion.div>
//                 </motion.div>

//                 <div className="relative h-full rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_50px_rgba(168,85,247,0.5)]">
//                   <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.25),transparent_65%)] blur-3xl" />

//                   <div className="relative h-full overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                     <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-amber-300/20 blur-3xl" />
//                     <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-emerald-400/18 blur-3xl" />

//                     <div className="grid h-full grid-rows-[auto_auto_auto_1fr_auto] gap-5">
//                       <div className="flex justify-center">
//                         <div className="relative">
//                           <motion.div
//                             animate={{ rotate: 360 }}
//                             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
//                             className="absolute -inset-5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-40 blur-lg"
//                           />
//                           <motion.div
//                             animate={{ rotate: -360 }}
//                             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//                             className="absolute -inset-3 rounded-full bg-gradient-to-r from-fuchsia-400 via-pink-400 to-fuchsia-500 opacity-30 blur-md"
//                           />
//                           <motion.div
//                             animate={{ rotate: 360 }}
//                             transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
//                             className="absolute -inset-2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 opacity-35 blur-sm"
//                           />

//                           <motion.div
//                             animate={{
//                               scale: [1, 1.3, 1],
//                               rotate: [0, 180, 360],
//                               opacity: [0.7, 1, 0.7],
//                             }}
//                             transition={{ duration: 3, repeat: Infinity }}
//                             className="absolute -top-2 -right-2 z-10"
//                           >
//                             <Sparkles className="h-5 w-5 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
//                           </motion.div>

//                           <motion.div
//                             animate={{
//                               scale: [1, 1.4, 1],
//                               rotate: [360, 180, 0],
//                               opacity: [0.6, 1, 0.6],
//                             }}
//                             transition={{ duration: 3.5, repeat: Infinity, delay: 0.7 }}
//                             className="absolute -bottom-2 -left-2 z-10"
//                           >
//                             <Star className="h-4 w-4 text-yellow-200 drop-shadow-[0_0_8px_rgba(253,224,71,0.9)]" />
//                           </motion.div>

//                           <motion.div
//                             animate={{
//                               rotate: [-4, 3, -4],
//                               boxShadow: [
//                                 "0 0 22px rgba(212,175,55,0.7)",
//                                 "0 0 30px rgba(212,175,55,1)",
//                                 "0 0 22px rgba(212,175,55,0.7)",
//                               ],
//                             }}
//                             transition={{
//                               duration: 3,
//                               repeat: Infinity,
//                               repeatType: "loop",
//                               ease: "easeInOut",
//                             }}
//                             whileHover={{ scale: 1.08 }}
//                             className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-amber-400/70 bg-gradient-to-br from-amber-400/25 via-slate-900 to-black"
//                           >
//                             <FcGoogle className="h-14 w-14" />
//                           </motion.div>
//                         </div>
//                       </div>

//                       <motion.h2
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.5 }}
//                         className="brand-script text-center text-2xl font-bold lg:text-3xl"
//                       >
//                         <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
//                           {t("booking_client_google_title")}
//                         </span>
//                       </motion.h2>

//                       <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.55 }}
//                         className="text-center text-base text-slate-200/90 lg:text-lg"
//                       >
//                         {t("booking_client_google_description")}
//                       </motion.p>

//                       <div className="flex min-h-[160px] flex-col justify-start space-y-3">
//                         {[
//                           { text: t("booking_client_google_benefit_1"), icon: "⚡" },
//                           { text: t("booking_client_google_benefit_2"), icon: "✨" },
//                           { text: t("booking_client_google_benefit_3"), icon: "🛡️" },
//                           { text: t("booking_client_google_benefit_4"), icon: "⏱️" },
//                         ].map((benefit, i) => (
//                           <motion.div
//                             key={benefit.text}
//                             initial={{ opacity: 0, x: -20 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ delay: 0.6 + i * 0.1 }}
//                             className="group flex items-center gap-3 text-sm text-slate-200"
//                           >
//                             <motion.div
//                               whileHover={{ scale: 1.1, rotate: 5 }}
//                               className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/30 to-yellow-400/20 ring-1 ring-amber-400/40 shadow-[0_0_8px_rgba(251,191,36,0.3)] transition-all group-hover:shadow-[0_0_15px_rgba(251,191,36,0.6)]"
//                             >
//                               <Check className="h-4 w-4 text-amber-300" />
//                             </motion.div>
//                             <div className="flex items-center gap-2">
//                               <span className="text-lg">{benefit.icon}</span>
//                               <span className="font-medium">{benefit.text}</span>
//                             </div>
//                           </motion.div>
//                         ))}
//                       </div>

//                       <div className="space-y-3">
//                         <motion.button
//                           type="button"
//                           onClick={handleGoogleRegistration}
//                           disabled={isDisabled}
//                           whileHover={!isDisabled ? { scale: 1.03 } : undefined}
//                           whileTap={!isDisabled ? { scale: 0.97 } : undefined}
//                           animate={
//                             !isDisabled
//                               ? {
//                                   boxShadow: [
//                                     "0 0 30px rgba(251,191,36,0.7)",
//                                     "0 0 50px rgba(251,191,36,1)",
//                                     "0 0 30px rgba(251,191,36,0.7)",
//                                   ],
//                                 }
//                               : undefined
//                           }
//                           transition={
//                             !isDisabled ? { duration: 2, repeat: Infinity } : undefined
//                           }
//                           className="group/btn relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 px-6 py-4 text-lg font-bold text-black shadow-2xl transition-all disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                           {!isDisabled && (
//                             <motion.div
//                               className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
//                               animate={{ translateX: ["0%", "200%"] }}
//                               transition={{
//                                 duration: 2,
//                                 repeat: Infinity,
//                                 repeatDelay: 1,
//                               }}
//                             />
//                           )}

//                           {loading ? (
//                             <>
//                               <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/40 border-t-transparent" />
//                               {t("booking_client_google_connecting")}
//                             </>
//                           ) : (
//                             <>
//                               <Crown className="h-5 w-5 transition-transform group-hover/btn:rotate-12" />
//                               <span className="relative">
//                                 {t("booking_client_google_button")}
//                               </span>
//                               <motion.span
//                                 animate={{ x: [0, 5, 0] }}
//                                 transition={{
//                                   duration: 1.2,
//                                   repeat: Infinity,
//                                 }}
//                               >
//                                 →
//                               </motion.span>
//                             </>
//                           )}
//                         </motion.button>

//                         <div className="flex items-center justify-center gap-2 text-xs text-amber-200/70">
//                           <Shield className="h-4 w-4" />
//                           <span>{t("booking_client_google_security")}</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
//                   </div>
//                 </div>
//               </motion.div>

//               {/* TELEGRAM - НОВАЯ КАРТОЧКА */}
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.35 }}
//                 whileHover={{ y: -8, scale: 1.01 }}
//                 className="group relative"
//               >
//                 <div className="relative h-full rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-purple-400 to-violet-500 p-[2px] shadow-[0_0_50px_rgba(168,85,247,0.4)]">
//                   <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.25),transparent_65%)] blur-3xl" />

//                   <div className="relative h-full overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                     <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-purple-300/20 blur-3xl" />
//                     <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-violet-400/18 blur-3xl" />

//                     <div className="grid h-full grid-rows-[auto_auto_auto_1fr_auto] gap-5">
//                       <div className="flex justify-center">
//                         <div className="relative">
//                           <motion.div
//                             animate={{
//                               scale: [1, 1.2, 1],
//                               opacity: [0.4, 0.6, 0.4],
//                             }}
//                             transition={{ duration: 2, repeat: Infinity }}
//                             className="absolute -inset-4 rounded-2xl bg-purple-400/30 blur-xl"
//                           />
//                           <motion.div
//                             animate={{
//                               scale: [1, 1.1, 1],
//                               opacity: [0.5, 0.8, 0.5],
//                             }}
//                             transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
//                             className="absolute -inset-2 rounded-2xl bg-violet-400/40 blur-lg"
//                           />

//                           <motion.div
//                             animate={{
//                               rotate: [0, 360],
//                               scale: [1, 1.2, 1],
//                               opacity: [0.6, 1, 0.6],
//                             }}
//                             transition={{ duration: 3, repeat: Infinity }}
//                             className="absolute -top-2 -right-2 z-10"
//                           >
//                             <Sparkles className="h-4 w-4 text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
//                           </motion.div>

//                           <motion.div
//                             animate={{
//                               y: [0, -3, 0],
//                               rotate: [-2, 2, -2],
//                               boxShadow: [
//                                 "0 0 20px rgba(168,85,247,0.8)",
//                                 "0 0 30px rgba(168,85,247,1)",
//                                 "0 0 20px rgba(168,85,247,0.8)",
//                               ],
//                             }}
//                             transition={{
//                               duration: 3,
//                               repeat: Infinity,
//                               repeatType: "loop",
//                               ease: "easeInOut",
//                             }}
//                             whileHover={{ scale: 1.08, rotate: 5 }}
//                             className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-purple-400/70 bg-gradient-to-br from-purple-400/25 via-slate-900 to-black"
//                           >
//                             <Send className="h-12 w-12 text-purple-300" />
//                           </motion.div>
//                         </div>
//                       </div>

//                       <motion.h2
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.55 }}
//                         className="brand-script text-center text-2xl font-bold lg:text-3xl"
//                       >
//                         <span className="bg-gradient-to-r from-purple-200 via-fuchsia-100 to-violet-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
//                           {t("booking_client_telegram_title")}
//                         </span>
//                       </motion.h2>

//                       <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.6 }}
//                         className="text-center text-base text-slate-200/90 lg:text-lg"
//                       >
//                         {t("booking_client_telegram_description")}
//                       </motion.p>

//                       <div className="flex min-h-[160px] flex-col justify-start space-y-3">
//                         {[
//                           { text: t("booking_client_telegram_benefit_1"), icon: "💬" },
//                           { text: t("booking_client_telegram_benefit_2"), icon: "⚡" },
//                           { text: t("booking_client_telegram_benefit_3"), icon: "🛡️" },
//                           { text: t("booking_client_telegram_benefit_4"), icon: "🔢" },
//                         ].map((benefit, i) => (
//                           <motion.div
//                             key={benefit.text}
//                             initial={{ opacity: 0, x: -20 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ delay: 0.65 + i * 0.1 }}
//                             className="group flex items-center gap-3 text-sm text-slate-200"
//                           >
//                             <motion.div
//                               whileHover={{ scale: 1.1, rotate: 5 }}
//                               className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400/30 to-violet-400/20 ring-1 ring-purple-400/40 shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-all group-hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]"
//                             >
//                               <Check className="h-4 w-4 text-purple-300" />
//                             </motion.div>
//                             <div className="flex items-center gap-2">
//                               <span className="text-lg">{benefit.icon}</span>
//                               <span className="font-medium">{benefit.text}</span>
//                             </div>
//                           </motion.div>
//                         ))}
//                       </div>

//                       <div className="space-y-3">
//                         <motion.button
//                           type="button"
//                           onClick={handleTelegramRegistration}
//                           disabled={isDisabled}
//                           whileHover={!isDisabled ? { scale: 1.03 } : undefined}
//                           whileTap={!isDisabled ? { scale: 0.97 } : undefined}
//                           className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-purple-400/50 bg-gradient-to-r from-purple-500/20 via-slate-900 to-purple-500/10 px-6 py-4 text-lg font-bold text-purple-100 shadow-lg shadow-purple-500/20 transition-all hover:border-purple-400/70 hover:bg-purple-500/30 hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                           <Send className="h-5 w-5" />
//                           {t("booking_client_telegram_button")}
//                           <motion.span
//                             animate={{ x: [0, 5, 0] }}
//                             transition={{
//                               duration: 1.2,
//                               repeat: Infinity,
//                             }}
//                           >
//                             →
//                           </motion.span>
//                         </motion.button>

//                         <div className="flex items-center justify-center gap-2 text-xs text-purple-200/70">
//                           <Shield className="h-4 w-4" />
//                           <span>{t("booking_client_telegram_security")}</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-300/40 to-transparent" />
//                   </div>
//                 </div>
//               </motion.div>

//               {/* SMS */}
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4 }}
//                 whileHover={{ y: -8, scale: 1.01 }}
//                 className="group relative"
//               >
//                 <div className="relative h-full rounded-[32px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 p-[2px] shadow-[0_0_50px_rgba(16,185,129,0.4)]">
//                   <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.25),transparent_65%)] blur-3xl" />

//                   <div className="relative h-full overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                     <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
//                     <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-teal-400/18 blur-3xl" />

//                     <div className="grid h-full grid-rows-[auto_auto_auto_1fr_auto] gap-5">
//                       <div className="flex justify-center">
//                         <div className="relative">
//                           <motion.div
//                             animate={{
//                               scale: [1, 1.2, 1],
//                               opacity: [0.4, 0.6, 0.4],
//                             }}
//                             transition={{ duration: 2, repeat: Infinity }}
//                             className="absolute -inset-4 rounded-2xl bg-emerald-400/30 blur-xl"
//                           />
//                           <motion.div
//                             animate={{
//                               scale: [1, 1.1, 1],
//                               opacity: [0.5, 0.8, 0.5],
//                             }}
//                             transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
//                             className="absolute -inset-2 rounded-2xl bg-teal-400/40 blur-lg"
//                           />

//                           <motion.div
//                             animate={{
//                               rotate: [0, 360],
//                               scale: [1, 1.2, 1],
//                               opacity: [0.6, 1, 0.6],
//                             }}
//                             transition={{ duration: 3, repeat: Infinity }}
//                             className="absolute -top-2 -right-2 z-10"
//                           >
//                             <Sparkles className="h-4 w-4 text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
//                           </motion.div>

//                           <motion.div
//                             animate={{
//                               y: [0, -3, 0],
//                               rotate: [-2, 2, -2],
//                               boxShadow: [
//                                 "0 0 20px rgba(16,185,129,0.8)",
//                                 "0 0 30px rgba(16,185,129,1)",
//                                 "0 0 20px rgba(16,185,129,0.8)",
//                               ],
//                             }}
//                             transition={{
//                               duration: 3,
//                               repeat: Infinity,
//                               repeatType: "loop",
//                               ease: "easeInOut",
//                             }}
//                             whileHover={{ scale: 1.08, rotate: 5 }}
//                             className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-emerald-400/70 bg-gradient-to-br from-emerald-400/25 via-slate-900 to-black"
//                           >
//                             <Phone className="h-12 w-12 text-emerald-300" />
//                           </motion.div>
//                         </div>
//                       </div>

//                       <motion.h2
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.6 }}
//                         className="brand-script text-center text-2xl font-bold lg:text-3xl"
//                       >
//                         <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
//                           {t("booking_client_sms_title")}
//                         </span>
//                       </motion.h2>

//                       <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.65 }}
//                         className="text-center text-base text-slate-200/90 lg:text-lg"
//                       >
//                         {t("booking_client_sms_description")}
//                       </motion.p>

//                       <div className="flex min-h-[160px] flex-col justify-start space-y-3">
//                         {[
//                           { text: t("booking_client_sms_benefit_1"), icon: "📱" },
//                           { text: t("booking_client_sms_benefit_2"), icon: "⚡" },
//                           { text: t("booking_client_sms_benefit_3"), icon: "🛡️" },
//                           { text: t("booking_client_sms_benefit_4"), icon: "🔢" },
//                         ].map((benefit, i) => (
//                           <motion.div
//                             key={benefit.text}
//                             initial={{ opacity: 0, x: -20 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ delay: 0.7 + i * 0.1 }}
//                             className="group flex items-center gap-3 text-sm text-slate-200"
//                           >
//                             <motion.div
//                               whileHover={{ scale: 1.1, rotate: 5 }}
//                               className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/20 ring-1 ring-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all group-hover:shadow-[0_0_15px_rgba(16,185,129,0.6)]"
//                             >
//                               <Check className="h-4 w-4 text-emerald-300" />
//                             </motion.div>
//                             <div className="flex items-center gap-2">
//                               <span className="text-lg">{benefit.icon}</span>
//                               <span className="font-medium">{benefit.text}</span>
//                             </div>
//                           </motion.div>
//                         ))}
//                       </div>

//                       <div className="space-y-3">
//                         <motion.button
//                           type="button"
//                           onClick={handleSmsPhoneRegistration}
//                           disabled={isDisabled}
//                           whileHover={!isDisabled ? { scale: 1.03 } : undefined}
//                           whileTap={!isDisabled ? { scale: 0.97 } : undefined}
//                           className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-emerald-400/50 bg-gradient-to-r from-emerald-500/20 via-slate-900 to-emerald-500/10 px-6 py-4 text-lg font-bold text-emerald-100 shadow-lg shadow-emerald-500/20 transition-all hover:border-emerald-400/70 hover:bg-emerald-500/30 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                           <Phone className="h-5 w-5" />
//                           {t("booking_client_sms_button")}
//                           <motion.span
//                             animate={{ x: [0, 5, 0] }}
//                             transition={{
//                               duration: 1.2,
//                               repeat: Infinity,
//                             }}
//                           >
//                             →
//                           </motion.span>
//                         </motion.button>

//                         <div className="flex items-center justify-center gap-2 text-xs text-emerald-200/70">
//                           <Shield className="h-4 w-4" />
//                           <span>{t("booking_client_sms_security")}</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
//                   </div>
//                 </div>
//               </motion.div>

//               {/* FORM */}
//               <motion.div
//                 initial={{ opacity: 0, x: 30 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.5 }}
//                 whileHover={{ y: -8, scale: 1.01 }}
//                 className="group relative"
//               >
//                 <div className="relative h-full rounded-[32px] bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-purple-500 p-[2px] shadow-[0_0_50px_rgba(34,211,238,0.4)]">
//                   <div className="pointer-events-none absolute -inset-12 rounded-[40px] bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.3),transparent_65%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.25),transparent_65%)] blur-3xl" />

//                   <div className="relative h-full overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 p-8 ring-1 ring-white/10 backdrop-blur-xl">
//                     <div className="pointer-events-none absolute -top-16 left-10 h-40 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
//                     <div className="pointer-events-none absolute right-[-3rem] bottom-[-3rem] h-48 w-56 rounded-full bg-blue-400/18 blur-3xl" />

//                     <div className="grid h-full grid-rows-[auto_auto_auto_1fr_auto] gap-5">
//                       <div className="flex justify-center">
//                         <div className="relative">
//                           <motion.div
//                             animate={{
//                               scale: [1, 1.2, 1],
//                               opacity: [0.4, 0.6, 0.4],
//                             }}
//                             transition={{ duration: 2, repeat: Infinity }}
//                             className="absolute -inset-4 rounded-2xl bg-cyan-400/30 blur-xl"
//                           />
//                           <motion.div
//                             animate={{
//                               scale: [1, 1.1, 1],
//                               opacity: [0.5, 0.8, 0.5],
//                             }}
//                             transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
//                             className="absolute -inset-2 rounded-2xl bg-sky-400/40 blur-lg"
//                           />

//                           <motion.div
//                             animate={{
//                               scale: [1, 1.2, 1],
//                               opacity: [0.6, 1, 0.6],
//                             }}
//                             transition={{ duration: 2.5, repeat: Infinity }}
//                             className="absolute -top-2 -right-2 z-10"
//                           >
//                             <Zap className="h-4 w-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
//                           </motion.div>

//                           <motion.div
//                             animate={{
//                               y: [0, -3, 0],
//                               rotate: [-3, 3, -3],
//                               boxShadow: [
//                                 "0 0 20px rgba(34,211,238,0.8)",
//                                 "0 0 30px rgba(34,211,238,1)",
//                                 "0 0 20px rgba(34,211,238,0.8)",
//                               ],
//                             }}
//                             transition={{
//                               duration: 3,
//                               repeat: Infinity,
//                               repeatType: "loop",
//                               ease: "easeInOut",
//                             }}
//                             whileHover={{ scale: 1.08, rotate: -2 }}
//                             className="relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-cyan-400/70 bg-gradient-to-br from-cyan-400/25 via-slate-900 to-black"
//                           >
//                             <Edit className="h-12 w-12 text-cyan-300" />
//                           </motion.div>
//                         </div>
//                       </div>

//                       <motion.h2
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.7 }}
//                         className="brand-script text-center text-2xl font-bold lg:text-3xl"
//                       >
//                         <span className="bg-gradient-to-r from-cyan-200 via-sky-100 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
//                           {t("booking_client_form_title")}
//                         </span>
//                       </motion.h2>

//                       <motion.p
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.75 }}
//                         className="text-center text-base text-slate-200/90 lg:text-lg"
//                       >
//                         {t("booking_client_form_description")}
//                       </motion.p>

//                       <div className="flex min-h-[160px] flex-col justify-start space-y-3">
//                         {[
//                           { text: t("booking_client_form_benefit_1"), icon: "🔒" },
//                           { text: t("booking_client_form_benefit_2"), icon: "✓" },
//                           { text: t("booking_client_form_benefit_3"), icon: "📝" },
//                           { text: t("booking_client_form_benefit_4"), icon: "💬" },
//                         ].map((benefit, i) => (
//                           <motion.div
//                             key={benefit.text}
//                             initial={{ opacity: 0, x: -20 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ delay: 0.8 + i * 0.1 }}
//                             className="group flex items-center gap-3 text-sm text-slate-200"
//                           >
//                             <motion.div
//                               whileHover={{ scale: 1.1, rotate: -5 }}
//                               className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-sky-400/20 ring-1 ring-cyan-400/40 shadow-[0_0_8px_rgba(34,211,238,0.3)] transition-all group-hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]"
//                             >
//                               <Check className="h-4 w-4 text-cyan-300" />
//                             </motion.div>
//                             <div className="flex items-center gap-2">
//                               <span className="text-lg">{benefit.icon}</span>
//                               <span className="font-medium">{benefit.text}</span>
//                             </div>
//                           </motion.div>
//                         ))}
//                       </div>

//                       <div className="space-y-3">
//                         <motion.button
//                           type="button"
//                           onClick={handleManualForm}
//                           disabled={isDisabled}
//                           whileHover={!isDisabled ? { scale: 1.03 } : undefined}
//                           whileTap={!isDisabled ? { scale: 0.97 } : undefined}
//                           className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 via-slate-900 to-cyan-500/10 px-6 py-4 text-lg font-bold text-cyan-100 shadow-lg shadow-cyan-500/20 transition-all hover:border-cyan-400/70 hover:bg-cyan-500/30 hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                           <Edit className="h-5 w-5" />
//                           {t("booking_client_form_button")}
//                           <motion.span
//                             animate={{ x: [0, 5, 0] }}
//                             transition={{
//                               duration: 1.2,
//                               repeat: Infinity,
//                             }}
//                           >
//                             →
//                           </motion.span>
//                         </motion.button>

//                         <div className="flex items-center justify-center gap-2 text-xs text-cyan-200/70">
//                           <Shield className="h-4 w-4" />
//                           <span>{t("booking_client_form_security")}</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
//                   </div>
//                 </div>
//               </motion.div>
//             </div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.6 }}
//               className="mt-10 text-center"
//             >
//               <p className="text-base text-slate-300">
//                 {t("booking_client_choice_footer")}{" "}
//                 <span className="bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text font-semibold text-transparent">
//                   {t("booking_client_choice_footer_highlight")}
//                 </span>
//               </p>
//             </motion.div>
//           </div>
//         </main>
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