// src/app/booking/(steps)/services/ServicesStepClient.tsx
//------была
// src/app/booking/(steps)/services/page.tsx
// страница выбора услуг в многошаговом бронировании
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import { Sparkles, Star, Zap, Award } from "lucide-react";

import type { Locale } from "@/i18n/locales";
import { translate, type MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/I18nProvider";
import { useTranslations } from "@/i18n/useTranslations";

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

interface ServiceDto {
  id: string;
  title: string;
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string;
}

interface GroupDto {
  id: string;
  title: string;
  services: ServiceDto[];
}

interface PromotionDto {
  id: string;
  title: string;
  percent: number;
  isGlobal: boolean;
}

interface ApiResponse {
  groups: GroupDto[];
  promotions: PromotionDto[];
}

const categoryIcons: Record<string, string> = {
  Маникюр: "💅",
  Стрижка: "✂️",
};

export default function ServicesPage(): React.JSX.Element {
  const router = useRouter();

  // ✅ ИСПРАВЛЕНО: Используем вашу систему i18n
  const { locale } = useI18n();
  const t = useTranslations();

  const numberLocale =
    locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "ru-RU";

  // ✅ ИСПРАВЛЕНО: Зависимость от t вместо locale
  const bookingSteps = useMemo(
    () => [
      { id: "services", label: t("booking_step_services"), icon: "✨" },
      { id: "master", label: t("booking_step_master"), icon: "👤" },
      { id: "calendar", label: t("booking_step_date"), icon: "📅" },
      { id: "client", label: t("booking_step_client"), icon: "📝" },
      { id: "verify", label: t("booking_step_verify"), icon: "✓" },
      { id: "payment", label: t("booking_step_payment"), icon: "💳" },
    ],
    [t],
  );

  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ❗ Храним ключ сообщения, а не готовый текст
  const [errorKey, setErrorKey] = useState<MessageKey | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      try {
        setLoading(true);
        setErrorKey(null);
        const response = await fetch("/api/booking/services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ locale }),
        });
        if (!response.ok) throw new Error("SERVICE_FETCH_ERROR");
        const data: ApiResponse = await response.json();
        setGroups(data.groups);
      } catch (err) {
        console.error("Error fetching services:", err);
        setErrorKey("booking_error_loading");
      } finally {
        setLoading(false);
      }
    };

    void fetchServices();
  }, [locale]);

  const allServices = groups.flatMap((g) => g.services);
  const categories: string[] = ["all", ...groups.map((g) => g.title)];

  const filteredGroups =
    selectedCategory === "all"
      ? groups
      : groups.filter((g) => g.title === selectedCategory);

  const toggleService = (serviceId: string): void => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const totalPrice = allServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

  const totalDuration = allServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.durationMin, 0);

  const handleContinue = (): void => {
    const params = new URLSearchParams();
    selectedServices.forEach((id) => params.append("s", id));
    router.push(`/booking/master?${params.toString()}`);
  };

  const formatPrice = (cents: number): string =>
    (cents / 100).toLocaleString(numberLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const error = errorKey ? t(errorKey) : null;

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        <div className="fixed inset-x-0 top-0 z-50">
          <PremiumProgressBar currentStep={0} steps={bookingSteps} />
        </div>

        <BookingAnimatedBackground />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative text-center"
          >
            <div className="relative mx-auto h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-amber-400 animate-pulse" />
            </div>
            <p className="mt-6 text-base font-medium text-white/70">
              {t("booking_loading_text")}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black">
        <div className="fixed inset-x-0 top-0 z-50">
          <PremiumProgressBar currentStep={0} steps={bookingSteps} />
        </div>

        <BookingAnimatedBackground />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md text-center"
          >
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="mb-4 text-2xl font-bold text-red-400">{error}</h2>
            <button
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-105"
            >
              {t("booking_error_retry")}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="fixed inset-x-0 top-0 z-50">
        <PremiumProgressBar currentStep={0} steps={bookingSteps} />
      </div>

      <BookingAnimatedBackground />
      <FloatingParticles />

      <div className="booking-content relative z-10 px-4 pt-28 pb-40 md:pt-32 md:pb-48">
        <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center md:mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
              className="mb-5 inline-block md:mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
                <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px] animate-pulse" />
                <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black shadow-[0_0_40px_rgba(245,158,11,0.6)] md:px-8 md:py-3 md:text-sm">
                  <Star className="h-4 w-4 md:h-5 md:h-5" />
                  <span>{t("booking_hero_badge")}</span>
                  <Star className="h-4 w-4 md:h-5 md:h-5" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="
                mb-3
                text-4xl font-serif italic leading-tight text-transparent
                bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text
                drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
                md:mb-4 md:text-5xl
                lg:text-5xl xl:text-6xl 2xl:text-7xl
              "
            >
              {t("booking_hero_title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="brand-script brand-subtitle mx-auto max-w-2xl text-base md:text-lg"
            >
              {t("booking_hero_subtitle")}
            </motion.p>
          </motion.div>

          {/* 🌈 КАТЕГОРИИ С РАДУЖНЫМ КОНТУРОМ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-10 flex flex-wrap justify-center gap-3 md:mb-14 md:gap-4"
          >
            {categories.map((category, index) => {
              const isAll = category === "all";
              const isActive = selectedCategory === category;

              const label = isAll ? t("booking_category_all") : category;
              const icon = isAll ? "✨" : categoryIcons[category] || "✨";

              return (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`group relative rounded-2xl text-sm font-semibold uppercase tracking-wide transition-all duration-300 md:text-base font-serif italic ${
                    isActive ? "text-black px-6 py-2.5 md:px-8 md:py-3" : "text-gray-200 hover:text-white"
                  }`}
                >
                  {isActive ? (
                    // Активная кнопка - золотой градиент (как раньше)
                    <>
                      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px]" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_25px_rgba(245,158,11,0.5)]" />
                      <span className="relative flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        {label}
                      </span>
                    </>
                  ) : (
                    // 🌈 Неактивная кнопка - радужный контур + очень темный фон
                    <div className="p-[2px] rounded-2xl bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 opacity-60 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-black to-slate-950 backdrop-blur-xl px-6 py-2.5 md:px-8 md:py-3 border border-white/5 group-hover:border-emerald-400/20 transition-all duration-300">
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{icon}</span>
                          {label}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* ГРУППЫ И УСЛУГИ */}
          <div className="space-y-14 md:space-y-16">
            {filteredGroups.map((group, groupIndex) => (
              <motion.section
                key={group.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.08 + 0.6 }}
                className="relative"
              >
                <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                  <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
                </div>

                <div className="relative">
                  <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

                    <div className="relative inline-flex rounded-full bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 p-[2px] shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                      <div className="inline-flex items-center justify-between gap-3 rounded-full bg-slate-950/90 px-5 py-2 backdrop-blur-xl">
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50">
                          <Sparkles className="h-4 w-4 text-black" />
                        </div>
                        <h2 className="text-lg font-semibold tracking-wider uppercase text-amber-100 md:text-xl italic font-serif">
                          {group.title}
                        </h2>
                        <span className="relative inline-flex h-1.5 w-10 overflow-hidden rounded-full bg-slate-900/80">
                          <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400" />
                        </span>
                      </div>
                    </div>

                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
                    <AnimatePresence mode="popLayout">
                      {group.services.map((service, index) => {
                        const isSelected = selectedServices.includes(service.id);
                        const isHovered = hoveredCard === service.id;
                        const price = service.priceCents
                          ? formatPrice(service.priceCents)
                          : t("booking_price_on_request");

                        return (
                          <motion.div
                            key={service.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{
                              delay: index * 0.04,
                              type: "spring",
                              stiffness: 260,
                              damping: 24,
                            }}
                            whileHover={{ y: -6, scale: 1.018 }}
                            onHoverStart={() => setHoveredCard(service.id)}
                            onHoverEnd={() => setHoveredCard(null)}
                            onClick={() => toggleService(service.id)}
                            className="group relative cursor-pointer"
                          >
                            <div
                              className={`absolute -inset-3 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                                isSelected
                                  ? "bg-gradient-to-r from-amber-500/50 via-yellow-400/40 to-amber-500/50"
                                  : "bg-gradient-to-r from-emerald-500/30 via-sky-500/25 to-fuchsia-500/30"
                              }`}
                            />

                            <motion.div
                              className={`relative h-full rounded-2xl p-[2px] transition-all duration-500 ${
                                isSelected
                                  ? "bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 shadow-[0_0_35px_rgba(245,158,11,0.6)]"
                                  : "bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 shadow-[0_0_25px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]"
                              }`}
                              animate={
                                !isSelected && isHovered
                                  ? {
                                      backgroundPosition: [
                                        "0% 50%",
                                        "100% 50%",
                                        "0% 50%",
                                      ],
                                    }
                                  : {}
                              }
                              transition={{
                                duration: 3,
                                ease: "linear",
                                repeat: Infinity,
                              }}
                              style={{
                                backgroundSize: "200% 200%",
                              }}
                            >
                              <div
                                className={`relative h-full overflow-hidden rounded-[calc(1rem-2px)] backdrop-blur-xl transition-all duration-500 ${
                                  isSelected
                                    ? "bg-gradient-to-br from-black/80 via-amber-900/30 to-black/90"
                                    : "bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-black/95"
                                }`}
                              >
                                <div
                                  className={`pointer-events-none absolute inset-0 rounded-[calc(1rem-2px)] transition-opacity duration-500 ${
                                    isSelected
                                      ? "bg-gradient-to-br from-amber-500/8 via-yellow-400/6 to-amber-500/8 opacity-100"
                                      : "bg-gradient-to-br from-emerald-500/10 via-sky-500/8 to-fuchsia-500/10 opacity-0 group-hover:opacity-100"
                                  }`}
                                  style={{ mixBlendMode: "soft-light" }}
                                />

                                <div className="pointer-events-none absolute inset-0 opacity-40">
                                  <motion.div
                                    animate={{
                                      backgroundPosition: [
                                        "0% 0%",
                                        "100% 100%",
                                        "0% 0%",
                                      ],
                                    }}
                                    transition={{
                                      duration: 20,
                                      repeat: Infinity,
                                      ease: "linear",
                                    }}
                                    className="absolute inset-0"
                                    style={{
                                      backgroundImage: isSelected
                                        ? "radial-gradient(circle at 0% 0%, rgba(245,158,11,0.15) 0, transparent 50%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.15) 0, transparent 50%)"
                                        : "radial-gradient(circle at 0% 0%, rgba(16,185,129,0.12) 0, transparent 50%), radial-gradient(circle at 100% 100%, rgba(14,165,233,0.12) 0, transparent 50%)",
                                      backgroundSize: "200% 200%",
                                    }}
                                  />
                                </div>

                                <div className="relative p-5 md:p-6">
                                  <div className="mb-4 flex items-start justify-between">
                                    <motion.div
                                      initial={false}
                                      animate={{
                                        scale: isSelected ? 1.08 : 1,
                                        rotate: isSelected ? 360 : 0,
                                      }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 18,
                                      }}
                                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                                        isSelected
                                          ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
                                          : "border-white/40 bg-black/40"
                                      }`}
                                    >
                                      {isSelected && (
                                        <motion.svg
                                          initial={{ scale: 0, rotate: -180 }}
                                          animate={{ scale: 1, rotate: 0 }}
                                          className="h-4 w-4 text-black"
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
                                        </motion.svg>
                                      )}
                                    </motion.div>

                                    <motion.div
                                      animate={{ rotate: [0, 3, -3, 0] }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 3,
                                      }}
                                      className="relative"
                                    >
                                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
                                      <div className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-black/80 px-2.5 py-1">
                                        <Sparkles className="h-3 w-3 text-amber-300" />
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
                                          premium
                                        </span>
                                      </div>
                                    </motion.div>
                                  </div>

                                  <h3
                                    className={`mb-2 text-lg font-semibold italic font-serif transition-all md:text-xl ${
                                      isSelected || isHovered
                                        ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
                                        : "text-white"
                                    }`}
                                  >
                                    {service.title}
                                  </h3>

                                  {service.description && (
                                    <p className="mb-5 line-clamp-2 text-xs font-light italic text-gray-300/80 md:text-sm">
                                      {service.description}
                                    </p>
                                  )}

                                  <div className="flex items-end justify-between gap-3">
                                    <div>
                                      <div className="mb-0.5 flex items-baseline gap-1.5">
                                        <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent italic md:text-3xl">
                                          {price}
                                        </span>
                                        <span className="text-lg font-bold text-amber-300 italic md:text-xl">
                                          €
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-400 italic md:text-sm">
                                        <Zap className="h-4 w-4 text-amber-300" />
                                        <span>
                                          {service.durationMin}{" "}
                                          {t("booking_minutes")}
                                        </span>
                                      </div>
                                    </div>

                                    <motion.div
                                      animate={{
                                        scale: isHovered ? 1 : 0.9,
                                        rotate: isHovered ? -2 : 0,
                                        opacity: isHovered ? 1 : 0.8,
                                      }}
                                      className={`flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
                                        isSelected
                                          ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
                                          : "border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-black"
                                      }`}
                                    >
                                      <Award
                                        className={`h-7 w-7 ${
                                          isSelected ? "text-black" : "text-cyan-300"
                                        }`}
                                      />
                                    </motion.div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedServices.length > 0 && (
          <>
            {/* MOBILE BAR */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="md:hidden sticky bottom-0 z-50 p-4"
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)",
              }}
            >
              <div className="mx-auto w-full max-w-screen-2xl">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
                  <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1 font-medium italic">
                          {t("booking_bar_selected_label")}{" "}
                          <span className="text-amber-400 font-bold">
                            {selectedServices.length}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent italic">
                            {formatPrice(totalPrice)}
                          </span>
                          <span className="text-2xl font-bold text-amber-400 italic">
                            €
                          </span>
                          <span className="text-base text-gray-500 italic">
                            • {totalDuration} {t("booking_minutes_short")}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleContinue}
                        className="relative group shrink-0"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                          <span>{t("booking_continue")}</span>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* DESKTOP BAR */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <div className="mx-auto w-full max-w-screen-2xl">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
                  <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                      <div>
                        <div className="text-sm text-gray-400 mb-2 font-medium italic">
                          {t("booking_bar_selected_label")}{" "}
                          <span className="text-amber-400 font-bold">
                            {selectedServices.length}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-4">
                          <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent italic">
                            {formatPrice(totalPrice)}
                          </span>
                          <span className="text-3xl font-bold text-amber-400 italic">
                            €
                          </span>
                          <span className="text-xl text-gray-500 ml-2 italic">
                            • {totalDuration} {t("booking_minutes_short")}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleContinue}
                        className="relative group"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                          <span>{t("booking_continue")}</span>
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .bg-300\% {
          background-size: 300% 300%;
        }

        .brand-subtitle {
          background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
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
        .brand-subtitle:active {
          text-shadow:
            0 0 12px rgba(139, 92, 246, 0.45),
            0 0 22px rgba(59, 130, 246, 0.35),
            0 0 32px rgba(6, 182, 212, 0.28);
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
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
}



