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
  }, []);

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




// // src/app/booking/(steps)/services/page.tsx
// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// import type { Locale } from "@/i18n/locales";
// import { translate, type MessageKey } from "@/i18n/messages";
// import { useI18n } from "@/i18n/I18nProvider";
// import { useTranslations } from "@/i18n/useTranslations";

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

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();

//   // ✅ ИСПРАВЛЕНО: Используем вашу систему i18n
//   const { locale } = useI18n();
//   const t = useTranslations();

//   const numberLocale =
//     locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "ru-RU";

//   // ✅ ИСПРАВЛЕНО: Зависимость от t вместо locale
//   const bookingSteps = useMemo(
//     () => [
//       { id: "services", label: t("booking_step_services"), icon: "✨" },
//       { id: "master", label: t("booking_step_master"), icon: "👤" },
//       { id: "calendar", label: t("booking_step_date"), icon: "📅" },
//       { id: "client", label: t("booking_step_client"), icon: "📝" },
//       { id: "verify", label: t("booking_step_verify"), icon: "✓" },
//       { id: "payment", label: t("booking_step_payment"), icon: "💳" },
//     ],
//     [t],
//   );

//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   // ❗ Храним ключ сообщения, а не готовый текст
//   const [errorKey, setErrorKey] = useState<MessageKey | null>(null);

//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         setErrorKey(null);
//         const response = await fetch("/api/booking/services", {
//           method: "POST",
//         });
//         if (!response.ok) throw new Error("SERVICE_FETCH_ERROR");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setErrorKey("booking_error_loading");
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories: string[] = ["all", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "all"
//       ? groups
//       : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId)
//         ? prev.filter((id) => id !== serviceId)
//         : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string =>
//     (cents / 100).toLocaleString(numberLocale, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//   const error = errorKey ? t(errorKey) : null;

//   if (loading) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative text-center"
//           >
//             <div className="relative mx-auto h-24 w-24">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-amber-400 animate-pulse" />
//             </div>
//             <p className="mt-6 text-base font-medium text-white/70">
//               {t("booking_loading_text")}
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-md text-center"
//           >
//             <div className="mb-4 text-6xl">⚠️</div>
//             <h2 className="mb-4 text-2xl font-bold text-red-400">{error}</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-105"
//             >
//               {t("booking_error_retry")}
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <div className="fixed inset-x-0 top-0 z-50">
//         <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//       </div>

//       <BookingAnimatedBackground />
//       <FloatingParticles />

//       <div className="booking-content relative z-10 px-4 pt-28 pb-40 md:pt-32 md:pb-48">
//         <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//           {/* HERO */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-12 text-center md:mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//               className="mb-5 inline-block md:mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                 <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px] animate-pulse" />
//                 <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black shadow-[0_0_40px_rgba(245,158,11,0.6)] md:px-8 md:py-3 md:text-sm">
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                   <span>{t("booking_hero_badge")}</span>
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 mb-3
//                 text-4xl font-serif italic leading-tight text-transparent
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text
//                 drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
//                 md:mb-4 md:text-5xl
//                 lg:text-5xl xl:text-6xl 2xl:text-7xl
//               "
//             >
//               {t("booking_hero_title")}
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="brand-script brand-subtitle mx-auto max-w-2xl text-base md:text-lg"
//             >
//               {t("booking_hero_subtitle")}
//             </motion.p>
//           </motion.div>

//           {/* 🌈 КАТЕГОРИИ С РАДУЖНЫМ КОНТУРОМ */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="mb-10 flex flex-wrap justify-center gap-3 md:mb-14 md:gap-4"
//           >
//             {categories.map((category, index) => {
//               const isAll = category === "all";
//               const isActive = selectedCategory === category;

//               const label = isAll ? t("booking_category_all") : category;
//               const icon = isAll ? "✨" : categoryIcons[category] || "✨";

//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative rounded-2xl text-sm font-semibold uppercase tracking-wide transition-all duration-300 md:text-base font-serif italic ${
//                     isActive ? "text-black px-6 py-2.5 md:px-8 md:py-3" : "text-gray-200 hover:text-white"
//                   }`}
//                 >
//                   {isActive ? (
//                     // Активная кнопка - золотой градиент (как раньше)
//                     <>
//                       <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px]" />
//                       <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_25px_rgba(245,158,11,0.5)]" />
//                       <span className="relative flex items-center gap-2">
//                         <span className="text-xl">{icon}</span>
//                         {label}
//                       </span>
//                     </>
//                   ) : (
//                     // 🌈 Неактивная кнопка - радужный контур + темно-синий фон
//                     <div className="p-[2px] rounded-2xl bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 opacity-60 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
//                       <div className="rounded-2xl bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl px-6 py-2.5 md:px-8 md:py-3 border border-white/5 group-hover:border-emerald-400/20 transition-all duration-300">
//                         <span className="flex items-center gap-2">
//                           <span className="text-xl">{icon}</span>
//                           {label}
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* ГРУППЫ И УСЛУГИ */}
//           <div className="space-y-14 md:space-y-16">
//             {filteredGroups.map((group, groupIndex) => (
//               <motion.section
//                 key={group.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: groupIndex * 0.08 + 0.6 }}
//                 className="relative"
//               >
//                 <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
//                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                   <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
//                 </div>

//                 <div className="relative">
//                   <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

//                     <div className="relative inline-flex rounded-full bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 p-[2px] shadow-[0_0_25px_rgba(16,185,129,0.5)]">
//                       <div className="inline-flex items-center justify-between gap-3 rounded-full bg-slate-950/90 px-5 py-2 backdrop-blur-xl">
//                         <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50">
//                           <Sparkles className="h-4 w-4 text-black" />
//                         </div>
//                         <h2 className="text-lg font-semibold tracking-wider uppercase text-amber-100 md:text-xl italic font-serif">
//                           {group.title}
//                         </h2>
//                         <span className="relative inline-flex h-1.5 w-10 overflow-hidden rounded-full bg-slate-900/80">
//                           <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400" />
//                         </span>
//                       </div>
//                     </div>

//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                   </div>

//                   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
//                     <AnimatePresence mode="popLayout">
//                       {group.services.map((service, index) => {
//                         const isSelected = selectedServices.includes(service.id);
//                         const isHovered = hoveredCard === service.id;
//                         const price = service.priceCents
//                           ? formatPrice(service.priceCents)
//                           : t("booking_price_on_request");

//                         return (
//                           <motion.div
//                             key={service.id}
//                             layout
//                             initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.92 }}
//                             transition={{
//                               delay: index * 0.04,
//                               type: "spring",
//                               stiffness: 260,
//                               damping: 24,
//                             }}
//                             whileHover={{ y: -6, scale: 1.018 }}
//                             onHoverStart={() => setHoveredCard(service.id)}
//                             onHoverEnd={() => setHoveredCard(null)}
//                             onClick={() => toggleService(service.id)}
//                             className="group relative cursor-pointer"
//                           >
//                             <div
//                               className={`absolute -inset-3 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/50 via-yellow-400/40 to-amber-500/50"
//                                   : "bg-gradient-to-r from-emerald-500/30 via-sky-500/25 to-fuchsia-500/30"
//                               }`}
//                             />

//                             <motion.div
//                               className={`relative h-full rounded-2xl p-[2px] transition-all duration-500 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 shadow-[0_0_35px_rgba(245,158,11,0.6)]"
//                                   : "bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 shadow-[0_0_25px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]"
//                               }`}
//                               animate={
//                                 !isSelected && isHovered
//                                   ? {
//                                       backgroundPosition: [
//                                         "0% 50%",
//                                         "100% 50%",
//                                         "0% 50%",
//                                       ],
//                                     }
//                                   : {}
//                               }
//                               transition={{
//                                 duration: 3,
//                                 ease: "linear",
//                                 repeat: Infinity,
//                               }}
//                               style={{
//                                 backgroundSize: "200% 200%",
//                               }}
//                             >
//                               <div
//                                 className={`relative h-full overflow-hidden rounded-[calc(1rem-2px)] backdrop-blur-xl transition-all duration-500 ${
//                                   isSelected
//                                     ? "bg-gradient-to-br from-black/80 via-amber-900/30 to-black/90"
//                                     : "bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-black/95"
//                                 }`}
//                               >
//                                 <div
//                                   className={`pointer-events-none absolute inset-0 rounded-[calc(1rem-2px)] transition-opacity duration-500 ${
//                                     isSelected
//                                       ? "bg-gradient-to-br from-amber-500/8 via-yellow-400/6 to-amber-500/8 opacity-100"
//                                       : "bg-gradient-to-br from-emerald-500/10 via-sky-500/8 to-fuchsia-500/10 opacity-0 group-hover:opacity-100"
//                                   }`}
//                                   style={{ mixBlendMode: "soft-light" }}
//                                 />

//                                 <div className="pointer-events-none absolute inset-0 opacity-40">
//                                   <motion.div
//                                     animate={{
//                                       backgroundPosition: [
//                                         "0% 0%",
//                                         "100% 100%",
//                                         "0% 0%",
//                                       ],
//                                     }}
//                                     transition={{
//                                       duration: 20,
//                                       repeat: Infinity,
//                                       ease: "linear",
//                                     }}
//                                     className="absolute inset-0"
//                                     style={{
//                                       backgroundImage: isSelected
//                                         ? "radial-gradient(circle at 0% 0%, rgba(245,158,11,0.15) 0, transparent 50%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.15) 0, transparent 50%)"
//                                         : "radial-gradient(circle at 0% 0%, rgba(16,185,129,0.12) 0, transparent 50%), radial-gradient(circle at 100% 100%, rgba(14,165,233,0.12) 0, transparent 50%)",
//                                       backgroundSize: "200% 200%",
//                                     }}
//                                   />
//                                 </div>

//                                 <div className="relative p-5 md:p-6">
//                                   <div className="mb-4 flex items-start justify-between">
//                                     <motion.div
//                                       initial={false}
//                                       animate={{
//                                         scale: isSelected ? 1.08 : 1,
//                                         rotate: isSelected ? 360 : 0,
//                                       }}
//                                       transition={{
//                                         type: "spring",
//                                         stiffness: 260,
//                                         damping: 18,
//                                       }}
//                                       className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
//                                         isSelected
//                                           ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                           : "border-white/40 bg-black/40"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <motion.svg
//                                           initial={{ scale: 0, rotate: -180 }}
//                                           animate={{ scale: 1, rotate: 0 }}
//                                           className="h-4 w-4 text-black"
//                                           fill="none"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={3}
//                                             d="M5 13l4 4L19 7"
//                                           />
//                                         </motion.svg>
//                                       )}
//                                     </motion.div>

//                                     <motion.div
//                                       animate={{ rotate: [0, 3, -3, 0] }}
//                                       transition={{
//                                         duration: 2,
//                                         repeat: Infinity,
//                                         repeatDelay: 3,
//                                       }}
//                                       className="relative"
//                                     >
//                                       <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
//                                       <div className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-black/80 px-2.5 py-1">
//                                         <Sparkles className="h-3 w-3 text-amber-300" />
//                                         <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
//                                           premium
//                                         </span>
//                                       </div>
//                                     </motion.div>
//                                   </div>

//                                   <h3
//                                     className={`mb-2 text-lg font-semibold italic font-serif transition-all md:text-xl ${
//                                       isSelected || isHovered
//                                         ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                                         : "text-white"
//                                     }`}
//                                   >
//                                     {service.title}
//                                   </h3>

//                                   {service.description && (
//                                     <p className="mb-5 line-clamp-2 text-xs font-light italic text-gray-300/80 md:text-sm">
//                                       {service.description}
//                                     </p>
//                                   )}

//                                   <div className="flex items-end justify-between gap-3">
//                                     <div>
//                                       <div className="mb-0.5 flex items-baseline gap-1.5">
//                                         <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent italic md:text-3xl">
//                                           {price}
//                                         </span>
//                                         <span className="text-lg font-bold text-amber-300 italic md:text-xl">
//                                           €
//                                         </span>
//                                       </div>
//                                       <div className="flex items-center gap-2 text-xs text-gray-400 italic md:text-sm">
//                                         <Zap className="h-4 w-4 text-amber-300" />
//                                         <span>
//                                           {service.durationMin}{" "}
//                                           {t("booking_minutes")}
//                                         </span>
//                                       </div>
//                                     </div>

//                                     <motion.div
//                                       animate={{
//                                         scale: isHovered ? 1 : 0.9,
//                                         rotate: isHovered ? -2 : 0,
//                                         opacity: isHovered ? 1 : 0.8,
//                                       }}
//                                       className={`flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
//                                         isSelected
//                                           ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                           : "border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-black"
//                                       }`}
//                                     >
//                                       <Award
//                                         className={`h-7 w-7 ${
//                                           isSelected ? "text-black" : "text-cyan-300"
//                                         }`}
//                                       />
//                                     </motion.div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           </motion.div>
//                         );
//                       })}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </motion.section>
//             ))}
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE BAR */}
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{
//                 paddingBottom:
//                   "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)",
//               }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium italic">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent italic">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400 italic">
//                             €
//                           </span>
//                           <span className="text-base text-gray-500 italic">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
//                         <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-5 h-5"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* DESKTOP BAR */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium italic">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent italic">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400 italic">
//                             €
//                           </span>
//                           <span className="text-xl text-gray-500 ml-2 italic">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
//                         <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-6 h-6"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
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
//     </div>
//   );
// }






// ---------пробую улучшить дизай через грок--------
// // src/app/booking/(steps)/services/page.tsx
// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// import type { Locale } from "@/i18n/locales";
// import { translate, type MessageKey } from "@/i18n/messages";
// import { useI18n } from "@/i18n/I18nProvider";
// import { useTranslations } from "@/i18n/useTranslations";

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

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();

//   // ✅ ИСПРАВЛЕНО: Используем вашу систему i18n
//   const { locale } = useI18n();
//   const t = useTranslations();

//   const numberLocale =
//     locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "ru-RU";

//   // ✅ ИСПРАВЛЕНО: Зависимость от t вместо locale
//   const bookingSteps = useMemo(
//     () => [
//       { id: "services", label: t("booking_step_services"), icon: "✨" },
//       { id: "master", label: t("booking_step_master"), icon: "👤" },
//       { id: "calendar", label: t("booking_step_date"), icon: "📅" },
//       { id: "client", label: t("booking_step_client"), icon: "📝" },
//       { id: "verify", label: t("booking_step_verify"), icon: "✓" },
//       { id: "payment", label: t("booking_step_payment"), icon: "💳" },
//     ],
//     [t],
//   );

//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   // ❗ Храним ключ сообщения, а не готовый текст
//   const [errorKey, setErrorKey] = useState<MessageKey | null>(null);

//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         setErrorKey(null);
//         const response = await fetch("/api/booking/services", {
//           method: "POST",
//         });
//         if (!response.ok) throw new Error("SERVICE_FETCH_ERROR");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setErrorKey("booking_error_loading");
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories: string[] = ["all", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "all"
//       ? groups
//       : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId)
//         ? prev.filter((id) => id !== serviceId)
//         : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string =>
//     (cents / 100).toLocaleString(numberLocale, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//   const error = errorKey ? t(errorKey) : null;

//   if (loading) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative text-center"
//           >
//             <div className="relative mx-auto h-24 w-24">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-amber-400 animate-pulse" />
//             </div>
//             <p className="mt-6 text-base font-medium text-white/70">
//               {t("booking_loading_text")}
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-md text-center"
//           >
//             <div className="mb-4 text-6xl">⚠️</div>
//             <h2 className="mb-4 text-2xl font-bold text-red-400">{error}</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-105"
//             >
//               {t("booking_error_retry")}
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <div className="fixed inset-x-0 top-0 z-50">
//         <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//       </div>

//       <BookingAnimatedBackground />
//       <FloatingParticles />

//       <div className="booking-content relative z-10 px-4 pt-28 pb-40 md:pt-32 md:pb-48">
//         <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//           {/* HERO */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-12 text-center md:mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//               className="mb-5 inline-block md:mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                 <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px] animate-pulse" />
//                 <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black shadow-[0_0_40px_rgba(245,158,11,0.6)] md:px-8 md:py-3 md:text-sm">
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                   <span>{t("booking_hero_badge")}</span>
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 mb-3
//                 text-4xl font-serif italic leading-tight text-transparent
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text
//                 drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
//                 md:mb-4 md:text-5xl
//                 lg:text-5xl xl:text-6xl 2xl:text-7xl
//               "
//             >
//               {t("booking_hero_title")}
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="brand-script brand-subtitle mx-auto max-w-2xl text-base md:text-lg"
//             >
//               {t("booking_hero_subtitle")}
//             </motion.p>
//           </motion.div>

//           {/* КАТЕГОРИИ */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="mb-10 flex flex-wrap justify-center gap-3 md:mb-14 md:gap-4"
//           >
//             {categories.map((category, index) => {
//               const isAll = category === "all";
//               const isActive = selectedCategory === category;

//               const label = isAll ? t("booking_category_all") : category;
//               const icon = isAll ? "✨" : categoryIcons[category] || "✨";

//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative rounded-2xl px-6 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-300 md:px-8 md:py-3 md:text-base ${
//                     isActive ? "text-black" : "text-gray-200 hover:text-white"
//                   }`}
//                 >
//                   {isActive && (
//                     <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px]" />
//                   )}

//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
//                         : "border border-white/12 bg-black/40 backdrop-blur-xl group-hover:border-cyan-400/50 group-hover:bg-black/55 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{icon}</span>
//                     {label}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* ГРУППЫ И УСЛУГИ */}
//           <div className="space-y-14 md:space-y-16">
//             {filteredGroups.map((group, groupIndex) => (
//               <motion.section
//                 key={group.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: groupIndex * 0.08 + 0.6 }}
//                 className="relative"
//               >
//                 <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
//                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                   <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
//                 </div>

//                 <div className="relative">
//                   <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

//                     <div className="relative inline-flex rounded-full bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 p-[2px] shadow-[0_0_25px_rgba(16,185,129,0.5)]">
//                       <div className="inline-flex items-center justify-between gap-3 rounded-full bg-slate-950/90 px-5 py-2 backdrop-blur-xl">
//                         <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50">
//                           <Sparkles className="h-4 w-4 text-black" />
//                         </div>
//                         <h2 className="text-lg font-semibold tracking-wider uppercase text-amber-100 md:text-xl italic font-serif">
//                           {group.title}
//                         </h2>
//                         <span className="relative inline-flex h-1.5 w-10 overflow-hidden rounded-full bg-slate-900/80">
//                           <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400" />
//                         </span>
//                       </div>
//                     </div>

//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                   </div>

//                   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
//                     <AnimatePresence mode="popLayout">
//                       {group.services.map((service, index) => {
//                         const isSelected = selectedServices.includes(service.id);
//                         const isHovered = hoveredCard === service.id;
//                         const price = service.priceCents
//                           ? formatPrice(service.priceCents)
//                           : t("booking_price_on_request");

//                         return (
//                           <motion.div
//                             key={service.id}
//                             layout
//                             initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.92 }}
//                             transition={{
//                               delay: index * 0.04,
//                               type: "spring",
//                               stiffness: 260,
//                               damping: 24,
//                             }}
//                             whileHover={{ y: -6, scale: 1.018 }}
//                             onHoverStart={() => setHoveredCard(service.id)}
//                             onHoverEnd={() => setHoveredCard(null)}
//                             onClick={() => toggleService(service.id)}
//                             className="group relative cursor-pointer"
//                           >
//                             <div
//                               className={`absolute -inset-3 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/50 via-yellow-400/40 to-amber-500/50"
//                                   : "bg-gradient-to-r from-emerald-500/30 via-sky-500/25 to-fuchsia-500/30"
//                               }`}
//                             />

//                             <motion.div
//                               className={`relative h-full rounded-2xl p-[2px] transition-all duration-500 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 shadow-[0_0_35px_rgba(245,158,11,0.6)]"
//                                   : "bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 shadow-[0_0_25px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]"
//                               }`}
//                               animate={
//                                 !isSelected && isHovered
//                                   ? {
//                                       backgroundPosition: [
//                                         "0% 50%",
//                                         "100% 50%",
//                                         "0% 50%",
//                                       ],
//                                     }
//                                   : {}
//                               }
//                               transition={{
//                                 duration: 3,
//                                 ease: "linear",
//                                 repeat: Infinity,
//                               }}
//                               style={{
//                                 backgroundSize: "200% 200%",
//                               }}
//                             >
//                               <div
//                                 className={`relative h-full overflow-hidden rounded-[calc(1rem-2px)] backdrop-blur-xl transition-all duration-500 ${
//                                   isSelected
//                                     ? "bg-gradient-to-br from-black/80 via-amber-900/30 to-black/90"
//                                     : "bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-black/95"
//                                 }`}
//                               >
//                                 <div
//                                   className={`pointer-events-none absolute inset-0 rounded-[calc(1rem-2px)] transition-opacity duration-500 ${
//                                     isSelected
//                                       ? "bg-gradient-to-br from-amber-500/8 via-yellow-400/6 to-amber-500/8 opacity-100"
//                                       : "bg-gradient-to-br from-emerald-500/10 via-sky-500/8 to-fuchsia-500/10 opacity-0 group-hover:opacity-100"
//                                   }`}
//                                   style={{ mixBlendMode: "soft-light" }}
//                                 />

//                                 <div className="pointer-events-none absolute inset-0 opacity-40">
//                                   <motion.div
//                                     animate={{
//                                       backgroundPosition: [
//                                         "0% 0%",
//                                         "100% 100%",
//                                         "0% 0%",
//                                       ],
//                                     }}
//                                     transition={{
//                                       duration: 20,
//                                       repeat: Infinity,
//                                       ease: "linear",
//                                     }}
//                                     className="absolute inset-0"
//                                     style={{
//                                       backgroundImage: isSelected
//                                         ? "radial-gradient(circle at 0% 0%, rgba(245,158,11,0.15) 0, transparent 50%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.15) 0, transparent 50%)"
//                                         : "radial-gradient(circle at 0% 0%, rgba(16,185,129,0.12) 0, transparent 50%), radial-gradient(circle at 100% 100%, rgba(14,165,233,0.12) 0, transparent 50%)",
//                                       backgroundSize: "200% 200%",
//                                     }}
//                                   />
//                                 </div>

//                                 <div className="relative p-5 md:p-6">
//                                   <div className="mb-4 flex items-start justify-between">
//                                     <motion.div
//                                       initial={false}
//                                       animate={{
//                                         scale: isSelected ? 1.08 : 1,
//                                         rotate: isSelected ? 360 : 0,
//                                       }}
//                                       transition={{
//                                         type: "spring",
//                                         stiffness: 260,
//                                         damping: 18,
//                                       }}
//                                       className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
//                                         isSelected
//                                           ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                           : "border-white/40 bg-black/40"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <motion.svg
//                                           initial={{ scale: 0, rotate: -180 }}
//                                           animate={{ scale: 1, rotate: 0 }}
//                                           className="h-4 w-4 text-black"
//                                           fill="none"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={3}
//                                             d="M5 13l4 4L19 7"
//                                           />
//                                         </motion.svg>
//                                       )}
//                                     </motion.div>

//                                     <motion.div
//                                       animate={{ rotate: [0, 3, -3, 0] }}
//                                       transition={{
//                                         duration: 2,
//                                         repeat: Infinity,
//                                         repeatDelay: 3,
//                                       }}
//                                       className="relative"
//                                     >
//                                       <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
//                                       <div className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-black/80 px-2.5 py-1">
//                                         <Sparkles className="h-3 w-3 text-amber-300" />
//                                         <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
//                                           premium
//                                         </span>
//                                       </div>
//                                     </motion.div>
//                                   </div>

//                                   <h3
//                                     className={`mb-2 text-lg font-semibold italic font-serif transition-all md:text-xl ${
//                                       isSelected || isHovered
//                                         ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                                         : "text-white"
//                                     }`}
//                                   >
//                                     {service.title}
//                                   </h3>

//                                   {service.description && (
//                                     <p className="mb-5 line-clamp-2 text-xs font-light italic text-gray-300/80 md:text-sm">
//                                       {service.description}
//                                     </p>
//                                   )}

//                                   <div className="flex items-end justify-between gap-3">
//                                     <div>
//                                       <div className="mb-0.5 flex items-baseline gap-1.5">
//                                         <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent italic md:text-3xl">
//                                           {price}
//                                         </span>
//                                         <span className="text-lg font-bold text-amber-300 italic md:text-xl">
//                                           €
//                                         </span>
//                                       </div>
//                                       <div className="flex items-center gap-2 text-xs text-gray-400 italic md:text-sm">
//                                         <Zap className="h-4 w-4 text-amber-300" />
//                                         <span>
//                                           {service.durationMin}{" "}
//                                           {t("booking_minutes")}
//                                         </span>
//                                       </div>
//                                     </div>

//                                     <motion.div
//                                       animate={{
//                                         scale: isHovered ? 1 : 0.9,
//                                         rotate: isHovered ? -2 : 0,
//                                         opacity: isHovered ? 1 : 0.8,
//                                       }}
//                                       className={`flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
//                                         isSelected
//                                           ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                           : "border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-black"
//                                       }`}
//                                     >
//                                       <Award
//                                         className={`h-7 w-7 ${
//                                           isSelected ? "text-black" : "text-cyan-300"
//                                         }`}
//                                       />
//                                     </motion.div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           </motion.div>
//                         );
//                       })}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </motion.section>
//             ))}
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE BAR */}
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{
//                 paddingBottom:
//                   "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)",
//               }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium italic">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent italic">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400 italic">
//                             €
//                           </span>
//                           <span className="text-base text-gray-500 italic">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
//                         <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-5 h-5"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* DESKTOP BAR */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium italic">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent italic">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400 italic">
//                             €
//                           </span>
//                           <span className="text-xl text-gray-500 ml-2 italic">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
//                         <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-6 h-6"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
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
//     </div>
//   );
// }




//---------исправляю переход языков---------
// // src/app/booking/(steps)/services/page.tsx
// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// import type { Locale } from "@/i18n/locales";
// import { translate, type MessageKey } from "@/i18n/messages";

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

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();

//   const [locale, setLocale] = useState<Locale>("ru");

//   useEffect(() => {
//     if (typeof document === "undefined") return;
//     const lang = document.documentElement.lang as Locale | undefined;
//     if (lang === "ru" || lang === "de" || lang === "en") {
//       setLocale(lang);
//     }
//   }, []);

//   const t = (key: MessageKey) => translate(locale, key);

//   const numberLocale =
//     locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "ru-RU";

//   const bookingSteps = useMemo(
//     () => [
//       { id: "services", label: t("booking_step_services"), icon: "✨" },
//       { id: "master", label: t("booking_step_master"), icon: "👤" },
//       { id: "calendar", label: t("booking_step_date"), icon: "📅" },
//       { id: "client", label: t("booking_step_client"), icon: "📝" },
//       { id: "verify", label: t("booking_step_verify"), icon: "✓" },
//       { id: "payment", label: t("booking_step_payment"), icon: "💳" },
//     ],
//     [locale],
//   );

//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   // ❗ Храним ключ сообщения, а не готовый текст
//   const [errorKey, setErrorKey] = useState<MessageKey | null>(null);

//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         setErrorKey(null);
//         const response = await fetch("/api/booking/services", {
//           method: "POST",
//         });
//         if (!response.ok) throw new Error("SERVICE_FETCH_ERROR");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setErrorKey("booking_error_loading");
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, [locale]);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories: string[] = ["all", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "all"
//       ? groups
//       : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId)
//         ? prev.filter((id) => id !== serviceId)
//         : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string =>
//     (cents / 100).toLocaleString(numberLocale, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//   const error = errorKey ? t(errorKey) : null;

//   if (loading) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative text-center"
//           >
//             <div className="relative mx-auto h-24 w-24">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-amber-400 animate-pulse" />
//             </div>
//             <p className="mt-6 text-base font-medium text-white/70">
//               {t("booking_loading_text")}
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-md text-center"
//           >
//             <div className="mb-4 text-6xl">⚠️</div>
//             <h2 className="mb-4 text-2xl font-bold text-red-400">{error}</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-105"
//             >
//               {t("booking_error_retry")}
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <div className="fixed inset-x-0 top-0 z-50">
//         <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//       </div>

//       <BookingAnimatedBackground />
//       <FloatingParticles />

//       <div className="booking-content relative z-10 px-4 pt-28 pb-40 md:pt-32 md:pb-48">
//         <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//           {/* HERO */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-12 text-center md:mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//               className="mb-5 inline-block md:mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                 <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px] animate-pulse" />
//                 <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black shadow-[0_0_40px_rgba(245,158,11,0.6)] md:px-8 md:py-3 md:text-sm">
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                   <span>{t("booking_hero_badge")}</span>
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 mb-3
//                 text-4xl font-serif italic leading-tight text-transparent
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text
//                 drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
//                 md:mb-4 md:text-5xl
//                 lg:text-5xl xl:text-6xl 2xl:text-7xl
//               "
//             >
//               {t("booking_hero_title")}
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="brand-script brand-subtitle mx-auto max-w-2xl text-base md:text-lg"
//             >
//               {t("booking_hero_subtitle")}
//             </motion.p>
//           </motion.div>

//           {/* КАТЕГОРИИ */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="mb-10 flex flex-wrap justify-center gap-3 md:mb-14 md:gap-4"
//           >
//             {categories.map((category, index) => {
//               const isAll = category === "all";
//               const isActive = selectedCategory === category;

//               const label = isAll ? t("booking_category_all") : category;
//               const icon = isAll ? "✨" : categoryIcons[category] || "✨";

//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative rounded-2xl px-6 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-300 md:px-8 md:py-3 md:text-base ${
//                     isActive ? "text-black" : "text-gray-200 hover:text-white"
//                   }`}
//                 >
//                   {isActive && (
//                     <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px]" />
//                   )}

//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
//                         : "border border-white/12 bg-black/40 backdrop-blur-xl group-hover:border-cyan-400/50 group-hover:bg-black/55 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{icon}</span>
//                     {label}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* ГРУППЫ И УСЛУГИ */}
//           <div className="space-y-14 md:space-y-16">
//             {filteredGroups.map((group, groupIndex) => (
//               <motion.section
//                 key={group.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: groupIndex * 0.08 + 0.6 }}
//                 className="relative"
//               >
//                 <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
//                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                   <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
//                 </div>

//                 <div className="relative">
//                   <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

//                     <div className="relative inline-flex rounded-full bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 p-[2px] shadow-[0_0_25px_rgba(16,185,129,0.5)]">
//                       <div className="inline-flex items-center justify-between gap-3 rounded-full bg-slate-950/90 px-5 py-2 backdrop-blur-xl">
//                         <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50">
//                           <Sparkles className="h-4 w-4 text-black" />
//                         </div>
//                         <h2 className="text-lg font-semibold tracking-wider uppercase text-amber-100 md:text-xl italic font-serif">
//                           {group.title}
//                         </h2>
//                         <span className="relative inline-flex h-1.5 w-10 overflow-hidden rounded-full bg-slate-900/80">
//                           <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400" />
//                         </span>
//                       </div>
//                     </div>

//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                   </div>

//                   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
//                     <AnimatePresence mode="popLayout">
//                       {group.services.map((service, index) => {
//                         const isSelected = selectedServices.includes(service.id);
//                         const isHovered = hoveredCard === service.id;
//                         const price = service.priceCents
//                           ? formatPrice(service.priceCents)
//                           : t("booking_price_on_request");

//                         return (
//                           <motion.div
//                             key={service.id}
//                             layout
//                             initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.92 }}
//                             transition={{
//                               delay: index * 0.04,
//                               type: "spring",
//                               stiffness: 260,
//                               damping: 24,
//                             }}
//                             whileHover={{ y: -6, scale: 1.018 }}
//                             onHoverStart={() => setHoveredCard(service.id)}
//                             onHoverEnd={() => setHoveredCard(null)}
//                             onClick={() => toggleService(service.id)}
//                             className="group relative cursor-pointer"
//                           >
//                             <div
//                               className={`absolute -inset-3 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/50 via-yellow-400/40 to-amber-500/50"
//                                   : "bg-gradient-to-r from-emerald-500/30 via-sky-500/25 to-fuchsia-500/30"
//                               }`}
//                             />

//                             <motion.div
//                               className={`relative h-full rounded-2xl p-[2px] transition-all duration-500 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 shadow-[0_0_35px_rgba(245,158,11,0.6)]"
//                                   : "bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 shadow-[0_0_25px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]"
//                               }`}
//                               animate={
//                                 !isSelected && isHovered
//                                   ? {
//                                       backgroundPosition: [
//                                         "0% 50%",
//                                         "100% 50%",
//                                         "0% 50%",
//                                       ],
//                                     }
//                                   : {}
//                               }
//                               transition={{
//                                 duration: 3,
//                                 ease: "linear",
//                                 repeat: Infinity,
//                               }}
//                               style={{
//                                 backgroundSize: "200% 200%",
//                               }}
//                             >
//                               <div
//                                 className={`relative h-full overflow-hidden rounded-[calc(1rem-2px)] backdrop-blur-xl transition-all duration-500 ${
//                                   isSelected
//                                     ? "bg-gradient-to-br from-black/80 via-amber-900/30 to-black/90"
//                                     : "bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-black/95"
//                                 }`}
//                               >
//                                 <div
//                                   className={`pointer-events-none absolute inset-0 rounded-[calc(1rem-2px)] transition-opacity duration-500 ${
//                                     isSelected
//                                       ? "bg-gradient-to-br from-amber-500/8 via-yellow-400/6 to-amber-500/8 opacity-100"
//                                       : "bg-gradient-to-br from-emerald-500/10 via-sky-500/8 to-fuchsia-500/10 opacity-0 group-hover:opacity-100"
//                                   }`}
//                                   style={{ mixBlendMode: "soft-light" }}
//                                 />

//                                 <div className="pointer-events-none absolute inset-0 opacity-40">
//                                   <motion.div
//                                     animate={{
//                                       backgroundPosition: [
//                                         "0% 0%",
//                                         "100% 100%",
//                                         "0% 0%",
//                                       ],
//                                     }}
//                                     transition={{
//                                       duration: 20,
//                                       repeat: Infinity,
//                                       ease: "linear",
//                                     }}
//                                     className="absolute inset-0"
//                                     style={{
//                                       backgroundImage: isSelected
//                                         ? "radial-gradient(circle at 0% 0%, rgba(245,158,11,0.15) 0, transparent 50%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.15) 0, transparent 50%)"
//                                         : "radial-gradient(circle at 0% 0%, rgba(16,185,129,0.12) 0, transparent 50%), radial-gradient(circle at 100% 100%, rgba(14,165,233,0.12) 0, transparent 50%)",
//                                       backgroundSize: "200% 200%",
//                                     }}
//                                   />
//                                 </div>

//                                 <div className="relative p-5 md:p-6">
//                                   <div className="mb-4 flex items-start justify-between">
//                                     <motion.div
//                                       initial={false}
//                                       animate={{
//                                         scale: isSelected ? 1.08 : 1,
//                                         rotate: isSelected ? 360 : 0,
//                                       }}
//                                       transition={{
//                                         type: "spring",
//                                         stiffness: 260,
//                                         damping: 18,
//                                       }}
//                                       className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
//                                         isSelected
//                                           ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                           : "border-white/40 bg-black/40"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <motion.svg
//                                           initial={{ scale: 0, rotate: -180 }}
//                                           animate={{ scale: 1, rotate: 0 }}
//                                           className="h-4 w-4 text-black"
//                                           fill="none"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={3}
//                                             d="M5 13l4 4L19 7"
//                                           />
//                                         </motion.svg>
//                                       )}
//                                     </motion.div>

//                                     <motion.div
//                                       animate={{ rotate: [0, 3, -3, 0] }}
//                                       transition={{
//                                         duration: 2,
//                                         repeat: Infinity,
//                                         repeatDelay: 3,
//                                       }}
//                                       className="relative"
//                                     >
//                                       <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
//                                       <div className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-black/80 px-2.5 py-1">
//                                         <Sparkles className="h-3 w-3 text-amber-300" />
//                                         <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
//                                           premium
//                                         </span>
//                                       </div>
//                                     </motion.div>
//                                   </div>

//                                   <h3
//                                     className={`mb-2 text-lg font-semibold italic font-serif transition-all md:text-xl ${
//                                       isSelected || isHovered
//                                         ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                                         : "text-white"
//                                     }`}
//                                   >
//                                     {service.title}
//                                   </h3>

//                                   {service.description && (
//                                     <p className="mb-5 line-clamp-2 text-xs font-light italic text-gray-300/80 md:text-sm">
//                                       {service.description}
//                                     </p>
//                                   )}

//                                   <div className="flex items-end justify-between gap-3">
//                                     <div>
//                                       <div className="mb-0.5 flex items-baseline gap-1.5">
//                                         <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent italic md:text-3xl">
//                                           {price}
//                                         </span>
//                                         <span className="text-lg font-bold text-amber-300 italic md:text-xl">
//                                           €
//                                         </span>
//                                       </div>
//                                       <div className="flex items-center gap-2 text-xs text-gray-400 italic md:text-sm">
//                                         <Zap className="h-4 w-4 text-amber-300" />
//                                         <span>
//                                           {service.durationMin}{" "}
//                                           {t("booking_minutes")}
//                                         </span>
//                                       </div>
//                                     </div>

//                                     <motion.div
//                                       animate={{
//                                         scale: isHovered ? 1 : 0.9,
//                                         rotate: isHovered ? -2 : 0,
//                                         opacity: isHovered ? 1 : 0.8,
//                                       }}
//                                       className={`flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
//                                         isSelected
//                                           ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                           : "border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-black"
//                                       }`}
//                                     >
//                                       <Award
//                                         className={`h-7 w-7 ${
//                                           isSelected ? "text-black" : "text-cyan-300"
//                                         }`}
//                                       />
//                                     </motion.div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           </motion.div>
//                         );
//                       })}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </motion.section>
//             ))}
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE BAR */}
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{
//                 paddingBottom:
//                   "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)",
//               }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium italic">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent italic">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400 italic">
//                             €
//                           </span>
//                           <span className="text-base text-gray-500 italic">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
//                         <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-5 h-5"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* DESKTOP BAR */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium italic">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent italic">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400 italic">
//                             €
//                           </span>
//                           <span className="text-xl text-gray-500 ml-2 italic">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
//                         <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-6 h-6"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
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
//     </div>
//   );
// }






//--------не всё отображаеться на другие языки-----
// // src/app/booking/(steps)/services/page.tsx
// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// import type { Locale } from "@/i18n/locales";
// import { translate, type MessageKey } from "@/i18n/messages";

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

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();

//   const [locale, setLocale] = useState<Locale>("ru");

//   useEffect(() => {
//     if (typeof document === "undefined") return;
//     const lang = document.documentElement.lang as Locale | undefined;
//     if (lang === "ru" || lang === "de" || lang === "en") {
//       setLocale(lang);
//     }
//   }, []);

//   const t = (key: MessageKey) => translate(locale, key);

//   const numberLocale =
//     locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "ru-RU";

//   const bookingSteps = useMemo(
//     () => [
//       { id: "services", label: t("booking_step_services"), icon: "✨" },
//       { id: "master", label: t("booking_step_master"), icon: "👤" },
//       { id: "calendar", label: t("booking_step_date"), icon: "📅" },
//       { id: "client", label: t("booking_step_client"), icon: "📝" },
//       { id: "verify", label: t("booking_step_verify"), icon: "✓" },
//       { id: "payment", label: t("booking_step_payment"), icon: "💳" },
//     ],
//     [locale],
//   );

//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch("/api/booking/services", {
//           method: "POST",
//         });
//         if (!response.ok) throw new Error("SERVICE_FETCH_ERROR");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setError(t("booking_error_loading"));
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, [locale]);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories: string[] = ["all", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "all"
//       ? groups
//       : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId)
//         ? prev.filter((id) => id !== serviceId)
//         : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string =>
//     (cents / 100).toLocaleString(numberLocale, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//   if (loading) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative text-center"
//           >
//             <div className="relative mx-auto h-24 w-24">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-amber-400 animate-pulse" />
//             </div>
//             <p className="mt-6 text-base font-medium text-white/70">
//               {t("booking_loading_text")}
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-md text-center"
//           >
//             <div className="mb-4 text-6xl">⚠️</div>
//             <h2 className="mb-4 text-2xl font-bold text-red-400">{error}</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-105"
//             >
//               {t("booking_error_retry")}
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <div className="fixed inset-x-0 top-0 z-50">
//         <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//       </div>

//       <BookingAnimatedBackground />
//       <FloatingParticles />

//       <div className="booking-content relative z-10 px-4 pt-28 pb-40 md:pt-32 md:pb-48">
//         <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-12 text-center md:mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//               className="mb-5 inline-block md:mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                 <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px] animate-pulse" />
//                 <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black shadow-[0_0_40px_rgba(245,158,11,0.6)] md:px-8 md:py-3 md:text-sm">
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                   <span>{t("booking_hero_badge")}</span>
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 mb-3
//                 text-4xl font-serif italic leading-tight text-transparent
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text
//                 drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
//                 md:mb-4 md:text-5xl
//                 lg:text-5xl xl:text-6xl 2xl:text-7xl
//               "
//             >
//               {t("booking_hero_title")}
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="brand-script brand-subtitle mx-auto max-w-2xl text-base md:text-lg"
//             >
//               {t("booking_hero_subtitle")}
//             </motion.p>
//           </motion.div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="mb-10 flex flex-wrap justify-center gap-3 md:mb-14 md:gap-4"
//           >
//             {categories.map((category, index) => {
//               const isAll = category === "all";
//               const isActive = selectedCategory === category;

//               const label = isAll ? t("booking_category_all") : category;
//               const icon = isAll ? "✨" : categoryIcons[category] || "✨";

//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative rounded-2xl px-6 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-300 md:px-8 md:py-3 md:text-base ${
//                     isActive ? "text-black" : "text-gray-200 hover:text-white"
//                   }`}
//                 >
//                   {isActive && (
//                     <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px]" />
//                   )}
                  
//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
//                         : "border border-white/12 bg-black/40 backdrop-blur-xl group-hover:border-cyan-400/50 group-hover:bg-black/55 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{icon}</span>
//                     {label}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           <div className="space-y-14 md:space-y-16">
//             {filteredGroups.map((group, groupIndex) => (
//               <motion.section
//                 key={group.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: groupIndex * 0.08 + 0.6 }}
//                 className="relative"
//               >
//                 <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
//                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                   <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
//                 </div>

//                 <div className="relative">
//                   <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                    
//                     <div className="relative inline-flex rounded-full bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 p-[2px] shadow-[0_0_25px_rgba(16,185,129,0.5)]">
//                       <div className="inline-flex items-center justify-between gap-3 rounded-full bg-slate-950/90 px-5 py-2 backdrop-blur-xl">
//                         <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50">
//                           <Sparkles className="h-4 w-4 text-black" />
//                         </div>
//                         <h2 className="text-lg font-semibold tracking-wider uppercase text-amber-100 md:text-xl italic font-serif">
//                           {group.title}
//                         </h2>
//                         <span className="relative inline-flex h-1.5 w-10 overflow-hidden rounded-full bg-slate-900/80">
//                           <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400" />
//                         </span>
//                       </div>
//                     </div>
                    
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                   </div>

//                   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
//                     <AnimatePresence mode="popLayout">
//                       {group.services.map((service, index) => {
//                         const isSelected = selectedServices.includes(service.id);
//                         const isHovered = hoveredCard === service.id;
//                         const price = service.priceCents
//                           ? formatPrice(service.priceCents)
//                           : t("booking_price_on_request");

//                         return (
//                           <motion.div
//                             key={service.id}
//                             layout
//                             initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.92 }}
//                             transition={{
//                               delay: index * 0.04,
//                               type: "spring",
//                               stiffness: 260,
//                               damping: 24,
//                             }}
//                             whileHover={{ y: -6, scale: 1.018 }}
//                             onHoverStart={() => setHoveredCard(service.id)}
//                             onHoverEnd={() => setHoveredCard(null)}
//                             onClick={() => toggleService(service.id)}
//                             className="group relative cursor-pointer"
//                           >
//                             <div
//                               className={`absolute -inset-3 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/50 via-yellow-400/40 to-amber-500/50"
//                                   : "bg-gradient-to-r from-emerald-500/30 via-sky-500/25 to-fuchsia-500/30"
//                               }`}
//                             />

//                             <motion.div
//                               className={`relative h-full rounded-2xl p-[2px] transition-all duration-500 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 shadow-[0_0_35px_rgba(245,158,11,0.6)]"
//                                   : "bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 shadow-[0_0_25px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.6)]"
//                               }`}
//                               animate={
//                                 !isSelected && isHovered
//                                   ? {
//                                       backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
//                                     }
//                                   : {}
//                               }
//                               transition={{
//                                 duration: 3,
//                                 ease: "linear",
//                                 repeat: Infinity,
//                               }}
//                               style={{
//                                 backgroundSize: "200% 200%",
//                               }}
//                             >
//                               <div
//                                 className={`relative h-full overflow-hidden rounded-[calc(1rem-2px)] backdrop-blur-xl transition-all duration-500 ${
//                                   isSelected
//                                     ? "bg-gradient-to-br from-black/80 via-amber-900/30 to-black/90"
//                                     : "bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-black/95"
//                                 }`}
//                               >
//                                 <div
//                                   className={`pointer-events-none absolute inset-0 rounded-[calc(1rem-2px)] transition-opacity duration-500 ${
//                                     isSelected
//                                       ? "bg-gradient-to-br from-amber-500/8 via-yellow-400/6 to-amber-500/8 opacity-100"
//                                       : "bg-gradient-to-br from-emerald-500/10 via-sky-500/8 to-fuchsia-500/10 opacity-0 group-hover:opacity-100"
//                                   }`}
//                                   style={{ mixBlendMode: "soft-light" }}
//                                 />

//                                 <div className="pointer-events-none absolute inset-0 opacity-40">
//                                   <motion.div
//                                     animate={{
//                                       backgroundPosition: [
//                                         "0% 0%",
//                                         "100% 100%",
//                                         "0% 0%",
//                                       ],
//                                     }}
//                                     transition={{
//                                       duration: 20,
//                                       repeat: Infinity,
//                                       ease: "linear",
//                                     }}
//                                     className="absolute inset-0"
//                                     style={{
//                                       backgroundImage: isSelected
//                                         ? "radial-gradient(circle at 0% 0%, rgba(245,158,11,0.15) 0, transparent 50%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.15) 0, transparent 50%)"
//                                         : "radial-gradient(circle at 0% 0%, rgba(16,185,129,0.12) 0, transparent 50%), radial-gradient(circle at 100% 100%, rgba(14,165,233,0.12) 0, transparent 50%)",
//                                       backgroundSize: "200% 200%",
//                                     }}
//                                   />
//                                 </div>

//                                 <div className="relative p-5 md:p-6">
//                                   <div className="mb-4 flex items-start justify-between">
//                                     <motion.div
//                                       initial={false}
//                                       animate={{
//                                         scale: isSelected ? 1.08 : 1,
//                                         rotate: isSelected ? 360 : 0,
//                                       }}
//                                       transition={{
//                                         type: "spring",
//                                         stiffness: 260,
//                                         damping: 18,
//                                       }}
//                                       className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
//                                         isSelected
//                                           ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                           : "border-white/40 bg-black/40"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <motion.svg
//                                           initial={{ scale: 0, rotate: -180 }}
//                                           animate={{ scale: 1, rotate: 0 }}
//                                           className="h-4 w-4 text-black"
//                                           fill="none"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={3}
//                                             d="M5 13l4 4L19 7"
//                                           />
//                                         </motion.svg>
//                                       )}
//                                     </motion.div>

//                                     <motion.div
//                                       animate={{ rotate: [0, 3, -3, 0] }}
//                                       transition={{
//                                         duration: 2,
//                                         repeat: Infinity,
//                                         repeatDelay: 3,
//                                       }}
//                                       className="relative"
//                                     >
//                                       <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
//                                       <div className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-black/80 px-2.5 py-1">
//                                         <Sparkles className="h-3 w-3 text-amber-300" />
//                                         <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
//                                           premium
//                                         </span>
//                                       </div>
//                                     </motion.div>
//                                   </div>

//                                   <h3
//                                     className={`mb-2 text-lg font-semibold italic font-serif transition-all md:text-xl ${
//                                       isSelected || isHovered
//                                         ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                                         : "text-white"
//                                     }`}
//                                   >
//                                     {service.title}
//                                   </h3>

//                                   {service.description && (
//                                     <p className="mb-5 line-clamp-2 text-xs font-light italic text-gray-300/80 md:text-sm">
//                                       {service.description}
//                                     </p>
//                                   )}

//                                   <div className="flex items-end justify-between gap-3">
//                                     <div>
//                                       <div className="mb-0.5 flex items-baseline gap-1.5">
//                                         <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent italic md:text-3xl">
//                                           {price}
//                                         </span>
//                                         <span className="text-lg font-bold text-amber-300 italic md:text-xl">
//                                           €
//                                         </span>
//                                       </div>
//                                       <div className="flex items-center gap-2 text-xs text-gray-400 italic md:text-sm">
//                                         <Zap className="h-4 w-4 text-amber-300" />
//                                         <span>
//                                           {service.durationMin}{" "}
//                                           {t("booking_minutes")}
//                                         </span>
//                                       </div>
//                                     </div>

//                                     <motion.div
//                                       animate={{
//                                         scale: isHovered ? 1 : 0.9,
//                                         rotate: isHovered ? -2 : 0,
//                                         opacity: isHovered ? 1 : 0.8,
//                                       }}
//                                       className={`flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
//                                         isSelected
//                                           ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                           : "border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-black"
//                                       }`}
//                                     >
//                                       <Award
//                                         className={`h-7 w-7 ${
//                                           isSelected ? "text-black" : "text-cyan-300"
//                                         }`}
//                                       />
//                                     </motion.div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           </motion.div>
//                         );
//                       })}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </motion.section>
//             ))}
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{
//                 paddingBottom:
//                   "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)",
//               }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium italic">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent italic">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400 italic">
//                             €
//                           </span>
//                           <span className="text-base text-gray-500 italic">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
//                         <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-5 h-5"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium italic">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent italic">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400 italic">
//                             €
//                           </span>
//                           <span className="text-xl text-gray-500 ml-2 italic">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
//                         <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-6 h-6"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }




// // src/app/booking/(steps)/services/page.tsx
// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// import type { Locale } from "@/i18n/locales";
// import { translate, type MessageKey } from "@/i18n/messages";

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();

//   // ---- Locale из <html lang="..."> ----
//   const [locale, setLocale] = useState<Locale>("ru");

//   useEffect(() => {
//     if (typeof document === "undefined") return;
//     const lang = document.documentElement.lang as Locale | undefined;
//     if (lang === "ru" || lang === "de" || lang === "en") {
//       setLocale(lang);
//     }
//   }, []);

//   const t = (key: MessageKey) => translate(locale, key);

//   const numberLocale =
//     locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "ru-RU";

//   const bookingSteps = useMemo(
//     () => [
//       { id: "services", label: t("booking_step_services"), icon: "✨" },
//       { id: "master", label: t("booking_step_master"), icon: "👤" },
//       { id: "calendar", label: t("booking_step_date"), icon: "📅" },
//       { id: "client", label: t("booking_step_client"), icon: "📝" },
//       { id: "verify", label: t("booking_step_verify"), icon: "✓" },
//       { id: "payment", label: t("booking_step_payment"), icon: "💳" },
//     ],
//     [locale],
//   );

//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   // ----- загрузка услуг -----
//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch("/api/booking/services", {
//           method: "POST",
//         });
//         if (!response.ok) throw new Error("SERVICE_FETCH_ERROR");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setError(t("booking_error_loading"));
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [locale]); // при смене языка можно перезагрузить (если не нужно — поставь [] )

//   const allServices = groups.flatMap((g) => g.services);
//   const categories: string[] = ["all", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "all"
//       ? groups
//       : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId)
//         ? prev.filter((id) => id !== serviceId)
//         : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string =>
//     (cents / 100).toLocaleString(numberLocale, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//   /* ================= LOADING ================= */

//   if (loading) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative text-center"
//           >
//             <div className="relative mx-auto h-24 w-24">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-amber-400 animate-pulse" />
//             </div>
//             <p className="mt-6 text-base font-medium text-white/70">
//               {t("booking_loading_text")}
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= ERROR ================= */

//   if (error) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-md text-center"
//           >
//             <div className="mb-4 text-6xl">⚠️</div>
//             <h2 className="mb-4 text-2xl font-bold text-red-400">{error}</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-105"
//             >
//               {t("booking_error_retry")}
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= MAIN ================= */

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <div className="fixed inset-x-0 top-0 z-50">
//         <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//       </div>

//       <BookingAnimatedBackground />

//       <div className="booking-content relative z-10 px-4 pt-28 pb-40 md:pt-32 md:pb-48">
//         <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//           {/* HERO */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-12 text-center md:mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//               className="mb-5 inline-block md:mb-6"
//             >
//               <div className="relative">
//                 {/* Outer glow */}
//                 <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                 {/* Border glow */}
//                 <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px] animate-pulse" />
//                 <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black shadow-[0_0_40px_rgba(245,158,11,0.6)] md:px-8 md:py-3 md:text-sm">
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                   <span>{t("booking_hero_badge")}</span>
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 mb-3
//                 text-4xl font-serif italic leading-tight text-transparent
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text
//                 drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
//                 md:mb-4 md:text-5xl
//                 lg:text-5xl xl:text-6xl 2xl:text-7xl
//               "
//             >
//               {t("booking_hero_title")}
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="brand-script brand-subtitle mx-auto max-w-2xl text-base md:text-lg"
//             >
//               {t("booking_hero_subtitle")}
//             </motion.p>
//           </motion.div>

//           {/* КАТЕГОРИИ */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="mb-10 flex flex-wrap justify-center gap-3 md:mb-14 md:gap-4"
//           >
//             {categories.map((category, index) => {
//               const isAll = category === "all";
//               const isActive = selectedCategory === category;

//               const label = isAll ? t("booking_category_all") : category;
//               const icon = isAll ? "✨" : categoryIcons[category] || "✨";

//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative rounded-2xl px-6 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all duration-300 md:px-8 md:py-3 md:text-base ${
//                     isActive ? "text-black" : "text-gray-200 hover:text-white"
//                   }`}
//                 >
//                   {/* Неоновый border glow для активной кнопки */}
//                   {isActive && (
//                     <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 blur-[2px]" />
//                   )}
                  
//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
//                         : "border border-white/12 bg-black/40 backdrop-blur-xl group-hover:border-cyan-400/50 group-hover:bg-black/55 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{icon}</span>
//                     {label}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* ГРУППЫ И УСЛУГИ */}
//           <div className="space-y-14 md:space-y-16">
//             {filteredGroups.map((group, groupIndex) => (
//               <motion.section
//                 key={group.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: groupIndex * 0.08 + 0.6 }}
//                 className="relative"
//               >
//                 <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
//                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                   <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
//                 </div>

//                 <div className="relative">
//                   <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                     <div className="inline-flex items-center gap-3 rounded-full border border-amber-500/40 bg-black/70 px-5 py-2 shadow-[0_0_25px_rgba(245,197,24,0.4)] backdrop-blur-xl">
//                       <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50">
//                         <Sparkles className="h-4 w-4 text-black" />
//                       </div>
//                       <h2 className="text-lg font-semibold tracking-wider uppercase text-amber-100 md:text-xl">
//                         {group.title}
//                       </h2>
//                       {/* Градиентный индикатор как на навигации */}
//                       <div className="h-1 w-12 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 opacity-80" />
//                     </div>
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                   </div>

//                   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
//                     <AnimatePresence mode="popLayout">
//                       {group.services.map((service, index) => {
//                         const isSelected = selectedServices.includes(service.id);
//                         const isHovered = hoveredCard === service.id;
//                         const price = service.priceCents
//                           ? formatPrice(service.priceCents)
//                           : t("booking_price_on_request");

//                         return (
//                           <motion.div
//                             key={service.id}
//                             layout
//                             initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.92 }}
//                             transition={{
//                               delay: index * 0.04,
//                               type: "spring",
//                               stiffness: 260,
//                               damping: 24,
//                             }}
//                             whileHover={{ y: -6, scale: 1.018 }}
//                             onHoverStart={() => setHoveredCard(service.id)}
//                             onHoverEnd={() => setHoveredCard(null)}
//                             onClick={() => toggleService(service.id)}
//                             className="group relative cursor-pointer"
//                           >
//                             {/* Outer Glow - Neon Effect */}
//                             <div
//                               className={`absolute -inset-3 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/60 via-yellow-400/50 to-amber-500/60"
//                                   : "bg-gradient-to-r from-cyan-500/30 via-teal-400/20 to-emerald-400/30"
//                               }`}
//                             />

//                             {/* Neon Border Glow - Like Footer Navigation */}
//                             <div
//                               className={`absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/80 via-yellow-400/80 to-amber-500/80 blur-[2px]"
//                                   : "bg-gradient-to-r from-cyan-500/60 via-teal-400/60 to-emerald-500/60 blur-[2px]"
//                               }`}
//                             />

//                             {/* Card with Neon Border */}
//                             <div
//                               className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
//                                 isSelected
//                                   ? "border-amber-400/90 bg-gradient-to-br from-black/75 via-amber-900/30 to-black/85 shadow-[0_0_30px_rgba(245,158,11,0.5),0_20px_60px_rgba(0,0,0,0.9)]"
//                                   : "border-cyan-400/40 bg-gradient-to-br from-black/70 via-slate-950/90 to-black/95 shadow-[0_0_20px_rgba(6,182,212,0.3),0_20px_55px_rgba(0,0,0,0.85)] group-hover:border-cyan-400/70 group-hover:shadow-[0_0_35px_rgba(6,182,212,0.5),0_20px_60px_rgba(0,0,0,0.9)]"
//                               }`}
//                             >
//                               <div className="pointer-events-none absolute inset-0 opacity-40">
//                                 <motion.div
//                                   animate={{
//                                     backgroundPosition: [
//                                       "0% 0%",
//                                       "100% 100%",
//                                       "0% 0%",
//                                     ],
//                                   }}
//                                   transition={{
//                                     duration: 20,
//                                     repeat: Infinity,
//                                     ease: "linear",
//                                   }}
//                                   className="absolute inset-0"
//                                   style={{
//                                     backgroundImage:
//                                       "radial-gradient(circle at 0% 0%, rgba(56,189,248,0.18) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.22) 0, transparent 55%)",
//                                     backgroundSize: "200% 200%",
//                                   }}
//                                 />
//                               </div>

//                               <div className="relative p-5 md:p-6">
//                                 <div className="mb-4 flex items-start justify-between">
//                                   <motion.div
//                                     initial={false}
//                                     animate={{
//                                       scale: isSelected ? 1.08 : 1,
//                                       rotate: isSelected ? 360 : 0,
//                                     }}
//                                     transition={{
//                                       type: "spring",
//                                       stiffness: 260,
//                                       damping: 18,
//                                     }}
//                                     className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
//                                       isSelected
//                                         ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                         : "border-white/40 bg-black/40"
//                                     }`}
//                                   >
//                                     {isSelected && (
//                                       <motion.svg
//                                         initial={{ scale: 0, rotate: -180 }}
//                                         animate={{ scale: 1, rotate: 0 }}
//                                         className="h-4 w-4 text-black"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                         stroke="currentColor"
//                                       >
//                                         <path
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth={3}
//                                           d="M5 13l4 4L19 7"
//                                         />
//                                       </motion.svg>
//                                     )}
//                                   </motion.div>

//                                   <motion.div
//                                     animate={{ rotate: [0, 3, -3, 0] }}
//                                     transition={{
//                                       duration: 2,
//                                       repeat: Infinity,
//                                       repeatDelay: 3,
//                                     }}
//                                     className="relative"
//                                   >
//                                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
//                                     <div className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-black/80 px-2.5 py-1">
//                                       <Sparkles className="h-3 w-3 text-amber-300" />
//                                       <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
//                                         premium
//                                       </span>
//                                     </div>
//                                   </motion.div>
//                                 </div>

//                                 <h3
//                                   className={`mb-2 text-lg font-semibold transition-all md:text-xl ${
//                                     isSelected || isHovered
//                                       ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                                       : "text-white"
//                                   }`}
//                                 >
//                                   {service.title}
//                                 </h3>

//                                 {service.description && (
//                                   <p className="mb-5 line-clamp-2 text-xs font-light text-gray-300/80 md:text-sm">
//                                     {service.description}
//                                   </p>
//                                 )}

//                                 <div className="flex items-end justify-between gap-3">
//                                   <div>
//                                     <div className="mb-0.5 flex items-baseline gap-1.5">
//                                       <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
//                                         {price}
//                                       </span>
//                                       <span className="text-lg font-bold text-amber-300 md:text-xl">
//                                         €
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center gap-2 text-xs text-gray-400 md:text-sm">
//                                       <Zap className="h-4 w-4 text-amber-300" />
//                                       <span>
//                                         {service.durationMin}{" "}
//                                         {t("booking_minutes")}
//                                       </span>
//                                     </div>
//                                   </div>

//                                   <motion.div
//                                     animate={{
//                                       scale: isHovered ? 1 : 0.9,
//                                       rotate: isHovered ? -2 : 0,
//                                       opacity: isHovered ? 1 : 0.8,
//                                     }}
//                                     className={`flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
//                                       isSelected
//                                         ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                         : "border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-black"
//                                     }`}
//                                   >
//                                     <Award
//                                       className={`h-7 w-7 ${
//                                         isSelected ? "text-black" : "text-cyan-300"
//                                       }`}
//                                     />
//                                   </motion.div>
//                                 </div>
//                               </div>
//                             </div>
//                           </motion.div>
//                         );
//                       })}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </motion.section>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ✅ MOBILE = sticky, DESKTOP = fixed */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE - sticky */}
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{
//                 paddingBottom:
//                   "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)",
//               }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400">
//                             €
//                           </span>
//                           <span className="text-base text-gray-500">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         {/* Неоновый glow */}
//                         <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
//                         {/* Border glow */}
//                         <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-5 h-5"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* DESKTOP/TABLET - fixed */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400">
//                             €
//                           </span>
//                           <span className="text-xl text-gray-500 ml-2">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         {/* Неоновый glow */}
//                         <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition-all" />
//                         {/* Border glow */}
//                         <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/90 via-yellow-400/90 to-amber-500/90 rounded-2xl blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg uppercase tracking-wide flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-6 h-6"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
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
//     </div>
//   );
// }






//-----------всё работало, немного меняю стиль карточек------
// // src/app/booking/(steps)/services/page.tsx
// "use client";

// import React, { useState, useEffect, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// import type { Locale } from "@/i18n/locales";
// import { translate, type MessageKey } from "@/i18n/messages";

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();

//   // ---- Locale из <html lang="..."> ----
//   const [locale, setLocale] = useState<Locale>("ru");

//   useEffect(() => {
//     if (typeof document === "undefined") return;
//     const lang = document.documentElement.lang as Locale | undefined;
//     if (lang === "ru" || lang === "de" || lang === "en") {
//       setLocale(lang);
//     }
//   }, []);

//   const t = (key: MessageKey) => translate(locale, key);

//   const numberLocale =
//     locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "ru-RU";

//   const bookingSteps = useMemo(
//     () => [
//       { id: "services", label: t("booking_step_services"), icon: "✨" },
//       { id: "master", label: t("booking_step_master"), icon: "👤" },
//       { id: "calendar", label: t("booking_step_date"), icon: "📅" },
//       { id: "client", label: t("booking_step_client"), icon: "📝" },
//       { id: "verify", label: t("booking_step_verify"), icon: "✓" },
//       { id: "payment", label: t("booking_step_payment"), icon: "💳" },
//     ],
//     [locale],
//   );

//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   // ----- загрузка услуг -----
//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch("/api/booking/services", {
//           method: "POST",
//         });
//         if (!response.ok) throw new Error("SERVICE_FETCH_ERROR");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setError(t("booking_error_loading"));
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [locale]); // при смене языка можно перезагрузить (если не нужно — поставь [] )

//   const allServices = groups.flatMap((g) => g.services);
//   const categories: string[] = ["all", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "all"
//       ? groups
//       : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId)
//         ? prev.filter((id) => id !== serviceId)
//         : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string =>
//     (cents / 100).toLocaleString(numberLocale, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     });

//   /* ================= LOADING ================= */

//   if (loading) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative text-center"
//           >
//             <div className="relative mx-auto h-24 w-24">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-amber-400 animate-pulse" />
//             </div>
//             <p className="mt-6 text-base font-medium text-white/70">
//               {t("booking_loading_text")}
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= ERROR ================= */

//   if (error) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-md text-center"
//           >
//             <div className="mb-4 text-6xl">⚠️</div>
//             <h2 className="mb-4 text-2xl font-bold text-red-400">{error}</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-105"
//             >
//               {t("booking_error_retry")}
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= MAIN ================= */

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <div className="fixed inset-x-0 top-0 z-50">
//         <PremiumProgressBar currentStep={0} steps={bookingSteps} />
//       </div>

//       <BookingAnimatedBackground />

//       <div className="booking-content relative z-10 px-4 pt-28 pb-40 md:pt-32 md:pb-48">
//         <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//           {/* HERO */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-12 text-center md:mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//               className="mb-5 inline-block md:mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                 <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-semibold uppercase text-black shadow-[0_10px_40px_rgba(245,197,24,0.55)] md:px-8 md:py-3 md:text-sm">
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                   <span>{t("booking_hero_badge")}</span>
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 mb-3
//                 text-4xl font-serif italic leading-tight text-transparent
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text
//                 drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
//                 md:mb-4 md:text-5xl
//                 lg:text-5xl xl:text-6xl 2xl:text-7xl
//               "
//             >
//               {t("booking_hero_title")}
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="brand-script brand-subtitle mx-auto max-w-2xl text-base md:text-lg"
//             >
//               {t("booking_hero_subtitle")}
//             </motion.p>
//           </motion.div>

//           {/* КАТЕГОРИИ */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="mb-10 flex flex-wrap justify-center gap-3 md:mb-14 md:gap-4"
//           >
//             {categories.map((category, index) => {
//               const isAll = category === "all";
//               const isActive = selectedCategory === category;

//               const label = isAll ? t("booking_category_all") : category;
//               const icon = isAll ? "✨" : categoryIcons[category] || "✨";

//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 md:px-8 md:py-3 md:text-base ${
//                     isActive ? "text-black" : "text-gray-200 hover:text-white"
//                   }`}
//                 >
//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-xl shadow-amber-500/50"
//                         : "border border-white/12 bg-black/40 backdrop-blur-xl group-hover:border-amber-400/40 group-hover:bg-black/55"
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{icon}</span>
//                     {label}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* ГРУППЫ И УСЛУГИ */}
//           <div className="space-y-14 md:space-y-16">
//             {filteredGroups.map((group, groupIndex) => (
//               <motion.section
//                 key={group.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: groupIndex * 0.08 + 0.6 }}
//                 className="relative"
//               >
//                 <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
//                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                   <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
//                 </div>

//                 <div className="relative">
//                   <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                     <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-black/70 px-4 py-1.5 shadow-[0_0_22px_rgba(245,197,24,0.35)] backdrop-blur-xl">
//                       <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500">
//                         <Sparkles className="h-4 w-4 text-black" />
//                       </div>
//                       <h2 className="text-lg font-semibold tracking-wide text-amber-100 md:text-xl">
//                         {group.title}
//                       </h2>
//                     </div>
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                   </div>

//                   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
//                     <AnimatePresence mode="popLayout">
//                       {group.services.map((service, index) => {
//                         const isSelected = selectedServices.includes(service.id);
//                         const isHovered = hoveredCard === service.id;
//                         const price = service.priceCents
//                           ? formatPrice(service.priceCents)
//                           : t("booking_price_on_request");

//                         return (
//                           <motion.div
//                             key={service.id}
//                             layout
//                             initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.92 }}
//                             transition={{
//                               delay: index * 0.04,
//                               type: "spring",
//                               stiffness: 260,
//                               damping: 24,
//                             }}
//                             whileHover={{ y: -6, scale: 1.018 }}
//                             onHoverStart={() => setHoveredCard(service.id)}
//                             onHoverEnd={() => setHoveredCard(null)}
//                             onClick={() => toggleService(service.id)}
//                             className="group relative cursor-pointer"
//                           >
//                             <div
//                               className={`absolute -inset-3 rounded-2xl blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/60 via-yellow-400/50 to-amber-500/60"
//                                   : "bg-gradient-to-r from-cyan-500/25 via-emerald-400/15 to-amber-400/25"
//                               }`}
//                             />

//                             <div
//                               className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
//                                 isSelected
//                                   ? "border-amber-400/80 bg-gradient-to-br from-black/70 via-amber-900/25 to-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
//                                   : "border-white/14 bg-gradient-to-br from-black/65 via-slate-950/85 to-black/90 shadow-[0_20px_55px_rgba(0,0,0,0.85)]"
//                               }`}
//                             >
//                               <div className="pointer-events-none absolute inset-0 opacity-40">
//                                 <motion.div
//                                   animate={{
//                                     backgroundPosition: [
//                                       "0% 0%",
//                                       "100% 100%",
//                                       "0% 0%",
//                                     ],
//                                   }}
//                                   transition={{
//                                     duration: 20,
//                                     repeat: Infinity,
//                                     ease: "linear",
//                                   }}
//                                   className="absolute inset-0"
//                                   style={{
//                                     backgroundImage:
//                                       "radial-gradient(circle at 0% 0%, rgba(56,189,248,0.18) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.22) 0, transparent 55%)",
//                                     backgroundSize: "200% 200%",
//                                   }}
//                                 />
//                               </div>

//                               <div className="relative p-5 md:p-6">
//                                 <div className="mb-4 flex items-start justify-between">
//                                   <motion.div
//                                     initial={false}
//                                     animate={{
//                                       scale: isSelected ? 1.08 : 1,
//                                       rotate: isSelected ? 360 : 0,
//                                     }}
//                                     transition={{
//                                       type: "spring",
//                                       stiffness: 260,
//                                       damping: 18,
//                                     }}
//                                     className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
//                                       isSelected
//                                         ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                         : "border-white/40 bg-black/40"
//                                     }`}
//                                   >
//                                     {isSelected && (
//                                       <motion.svg
//                                         initial={{ scale: 0, rotate: -180 }}
//                                         animate={{ scale: 1, rotate: 0 }}
//                                         className="h-4 w-4 text-black"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                         stroke="currentColor"
//                                       >
//                                         <path
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth={3}
//                                           d="M5 13l4 4L19 7"
//                                         />
//                                       </motion.svg>
//                                     )}
//                                   </motion.div>

//                                   <motion.div
//                                     animate={{ rotate: [0, 3, -3, 0] }}
//                                     transition={{
//                                       duration: 2,
//                                       repeat: Infinity,
//                                       repeatDelay: 3,
//                                     }}
//                                     className="relative"
//                                   >
//                                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
//                                     <div className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-black/80 px-2.5 py-1">
//                                       <Sparkles className="h-3 w-3 text-amber-300" />
//                                       <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
//                                         premium
//                                       </span>
//                                     </div>
//                                   </motion.div>
//                                 </div>

//                                 <h3
//                                   className={`mb-2 text-lg font-semibold transition-all md:text-xl ${
//                                     isSelected || isHovered
//                                       ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                                       : "text-white"
//                                   }`}
//                                 >
//                                   {service.title}
//                                 </h3>

//                                 {service.description && (
//                                   <p className="mb-5 line-clamp-2 text-xs font-light text-gray-300/80 md:text-sm">
//                                     {service.description}
//                                   </p>
//                                 )}

//                                 <div className="flex items-end justify-between gap-3">
//                                   <div>
//                                     <div className="mb-0.5 flex items-baseline gap-1.5">
//                                       <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
//                                         {price}
//                                       </span>
//                                       <span className="text-lg font-bold text-amber-300 md:text-xl">
//                                         €
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center gap-2 text-xs text-gray-400 md:text-sm">
//                                       <Zap className="h-4 w-4 text-amber-300" />
//                                       <span>
//                                         {service.durationMin}{" "}
//                                         {t("booking_minutes")}
//                                       </span>
//                                     </div>
//                                   </div>

//                                   <motion.div
//                                     animate={{
//                                       scale: isHovered ? 1 : 0.9,
//                                       rotate: isHovered ? -2 : 0,
//                                       opacity: isHovered ? 1 : 0.8,
//                                     }}
//                                     className={`flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
//                                       isSelected
//                                         ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                         : "border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-black"
//                                     }`}
//                                   >
//                                     <Award
//                                       className={`h-7 w-7 ${
//                                         isSelected ? "text-black" : "text-cyan-300"
//                                       }`}
//                                     />
//                                   </motion.div>
//                                 </div>
//                               </div>
//                             </div>
//                           </motion.div>
//                         );
//                       })}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </motion.section>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ✅ MOBILE = sticky, DESKTOP = fixed */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE - sticky */}
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{
//                 paddingBottom:
//                   "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)",
//               }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400">
//                             €
//                           </span>
//                           <span className="text-base text-gray-500">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base flex items-center gap-3 shadow-2xl">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-5 h-5"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* DESKTOP/TABLET - fixed */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium">
//                           {t("booking_bar_selected_label")}{" "}
//                           <span className="text-amber-400 font-bold">
//                             {selectedServices.length}
//                           </span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400">
//                             €
//                           </span>
//                           <span className="text-xl text-gray-500 ml-2">
//                             • {totalDuration} {t("booking_minutes_short")}
//                           </span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
//                           <span>{t("booking_continue")}</span>
//                           <svg
//                             className="w-6 h-6"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0l-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
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
//     </div>
//   );
// }







// //--------рабочий файл, добавляем языки-----
// // src/app/booking/services/page.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
//   Все: "✨",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("Все");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch("/api/booking/services", { method: "POST" });
//         if (!response.ok) throw new Error("Ошибка загрузки услуг");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setError("Не удалось загрузить услуги");
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories = ["Все", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "Все" ? groups : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string => (cents / 100).toLocaleString("ru-RU");

//   /* ================= LOADING ================= */

//   if (loading) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative text-center"
//           >
//             <div className="relative mx-auto h-24 w-24">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-amber-400 animate-pulse" />
//             </div>
//             <p className="mt-6 text-base font-medium text-white/70">Загружаем премиальные услуги…</p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= ERROR ================= */

//   if (error) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-md text-center"
//           >
//             <div className="mb-4 text-6xl">⚠️</div>
//             <h2 className="mb-4 text-2xl font-bold text-red-400">{error}</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-105"
//             >
//               Попробовать снова
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= MAIN ================= */

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <div className="fixed inset-x-0 top-0 z-50">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//       </div>

//       <BookingAnimatedBackground />

//       <div className="booking-content relative z-10 px-4 pt-28 pb-40 md:pt-32 md:pb-48">
//         <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//           {/* HERO */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-12 text-center md:mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//               className="mb-5 inline-block md:mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                 <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-semibold uppercase text-black shadow-[0_10px_40px_rgba(245,197,24,0.55)] md:px-8 md:py-3 md:text-sm">
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                   <span>Premium Beauty Menu</span>
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 mb-3
//                 text-4xl font-serif italic leading-tight text-transparent
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text
//                 drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
//                 md:mb-4 md:text-5xl
//                 lg:text-5xl xl:text-6xl 2xl:text-7xl
//               "
//             >
//               Выберите услугу
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="brand-script brand-subtitle mx-auto max-w-2xl text-base md:text-lg"
//             >
//               Создайте свой уникальный образ с нашими эксклюзивными премиум-услугами
//             </motion.p>
//           </motion.div>

//           {/* КАТЕГОРИИ */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="mb-10 flex flex-wrap justify-center gap-3 md:mb-14 md:gap-4"
//           >
//             {categories.map((category, index) => {
//               const isActive = selectedCategory === category;
//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 md:px-8 md:py-3 md:text-base ${
//                     isActive ? "text-black" : "text-gray-200 hover:text-white"
//                   }`}
//                 >
//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-xl shadow-amber-500/50"
//                         : "border border-white/12 bg-black/40 backdrop-blur-xl group-hover:border-amber-400/40 group-hover:bg-black/55"
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{categoryIcons[category] || "✨"}</span>
//                     {category}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* ГРУППЫ И УСЛУГИ */}
//           <div className="space-y-14 md:space-y-16">
//             {filteredGroups.map((group, groupIndex) => (
//               <motion.section
//                 key={group.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: groupIndex * 0.08 + 0.6 }}
//                 className="relative"
//               >
//                 <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
//                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                   <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
//                 </div>

//                 <div className="relative">
//                   <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                     <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-black/70 px-4 py-1.5 shadow-[0_0_22px_rgba(245,197,24,0.35)] backdrop-blur-xl">
//                       <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500">
//                         <Sparkles className="h-4 w-4 text-black" />
//                       </div>
//                       <h2 className="text-lg font-semibold tracking-wide text-amber-100 md:text-xl">
//                         {group.title}
//                       </h2>
//                     </div>
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                   </div>

//                   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
//                     <AnimatePresence mode="popLayout">
//                       {group.services.map((service, index) => {
//                         const isSelected = selectedServices.includes(service.id);
//                         const isHovered = hoveredCard === service.id;
//                         const price = service.priceCents
//                           ? formatPrice(service.priceCents)
//                           : "По запросу";

//                         return (
//                           <motion.div
//                             key={service.id}
//                             layout
//                             initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.92 }}
//                             transition={{
//                               delay: index * 0.04,
//                               type: "spring",
//                               stiffness: 260,
//                               damping: 24,
//                             }}
//                             whileHover={{ y: -6, scale: 1.018 }}
//                             onHoverStart={() => setHoveredCard(service.id)}
//                             onHoverEnd={() => setHoveredCard(null)}
//                             onClick={() => toggleService(service.id)}
//                             className="group relative cursor-pointer"
//                           >
//                             <div
//                               className={`absolute -inset-3 rounded-2xl blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/60 via-yellow-400/50 to-amber-500/60"
//                                   : "bg-gradient-to-r from-cyan-500/25 via-emerald-400/15 to-amber-400/25"
//                               }`}
//                             />

//                             <div
//                               className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
//                                 isSelected
//                                   ? "border-amber-400/80 bg-gradient-to-br from-black/70 via-amber-900/25 to-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
//                                   : "border-white/14 bg-gradient-to-br from-black/65 via-slate-950/85 to-black/90 shadow-[0_20px_55px_rgba(0,0,0,0.85)]"
//                               }`}
//                             >
//                               <div className="pointer-events-none absolute inset-0 opacity-40">
//                                 <motion.div
//                                   animate={{
//                                     backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
//                                   }}
//                                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//                                   className="absolute inset-0"
//                                   style={{
//                                     backgroundImage:
//                                       "radial-gradient(circle at 0% 0%, rgba(56,189,248,0.18) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.22) 0, transparent 55%)",
//                                     backgroundSize: "200% 200%",
//                                   }}
//                                 />
//                               </div>

//                               <div className="relative p-5 md:p-6">
//                                 <div className="mb-4 flex items-start justify-between">
//                                   <motion.div
//                                     initial={false}
//                                     animate={{
//                                       scale: isSelected ? 1.08 : 1,
//                                       rotate: isSelected ? 360 : 0,
//                                     }}
//                                     transition={{
//                                       type: "spring",
//                                       stiffness: 260,
//                                       damping: 18,
//                                     }}
//                                     className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
//                                       isSelected
//                                         ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                         : "border-white/40 bg-black/40"
//                                     }`}
//                                   >
//                                     {isSelected && (
//                                       <motion.svg
//                                         initial={{ scale: 0, rotate: -180 }}
//                                         animate={{ scale: 1, rotate: 0 }}
//                                         className="h-4 w-4 text-black"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                         stroke="currentColor"
//                                       >
//                                         <path
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth={3}
//                                           d="M5 13l4 4L19 7"
//                                         />
//                                       </motion.svg>
//                                     )}
//                                   </motion.div>

//                                   <motion.div
//                                     animate={{ rotate: [0, 3, -3, 0] }}
//                                     transition={{
//                                       duration: 2,
//                                       repeat: Infinity,
//                                       repeatDelay: 3,
//                                     }}
//                                     className="relative"
//                                   >
//                                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
//                                     <div className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-black/80 px-2.5 py-1">
//                                       <Sparkles className="h-3 w-3 text-amber-300" />
//                                       <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
//                                         premium
//                                       </span>
//                                     </div>
//                                   </motion.div>
//                                 </div>

//                                 <h3
//                                   className={`mb-2 text-lg font-semibold transition-all md:text-xl ${
//                                     isSelected || isHovered
//                                       ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                                       : "text-white"
//                                   }`}
//                                 >
//                                   {service.title}
//                                 </h3>

//                                 {service.description && (
//                                   <p className="mb-5 line-clamp-2 text-xs font-light text-gray-300/80 md:text-sm">
//                                     {service.description}
//                                   </p>
//                                 )}

//                                 <div className="flex items-end justify-between gap-3">
//                                   <div>
//                                     <div className="mb-0.5 flex items-baseline gap-1.5">
//                                       <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
//                                         {price}
//                                       </span>
//                                       <span className="text-lg font-bold text-amber-300 md:text-xl">
//                                         €
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center gap-2 text-xs text-gray-400 md:text-sm">
//                                       <Zap className="h-4 w-4 text-amber-300" />
//                                       <span>{service.durationMin} минут</span>
//                                     </div>
//                                   </div>

//                                   <motion.div
//                                     animate={{
//                                       scale: isHovered ? 1 : 0.9,
//                                       rotate: isHovered ? -2 : 0,
//                                       opacity: isHovered ? 1 : 0.8,
//                                     }}
//                                     className={`flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
//                                       isSelected
//                                         ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                         : "border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-black"
//                                     }`}
//                                   >
//                                     <Award
//                                       className={`h-7 w-7 ${
//                                         isSelected ? "text-black" : "text-cyan-300"
//                                       }`}
//                                     />
//                                   </motion.div>
//                                 </div>
//                               </div>
//                             </div>
//                           </motion.div>
//                         );
//                       })}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </motion.section>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ✅ РАБОЧАЯ ЛОГИКА: MOBILE = sticky, DESKTOP = fixed */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE - sticky */}
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)" }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium">
//                           Выбрано услуг:{" "}
//                           <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400">€</span>
//                           <span className="text-base text-gray-500">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base flex items-center gap-3 shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* DESKTOP/TABLET - fixed */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium">
//                           Выбрано услуг:{" "}
//                           <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400">€</span>
//                           <span className="text-xl text-gray-500 ml-2">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
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
//     </div>
//   );
// }




// // src/app/booking/services/page.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
//   Все: "✨",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("Все");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch("/api/booking/services", { method: "POST" });
//         if (!response.ok) throw new Error("Ошибка загрузки услуг");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setError("Не удалось загрузить услуги");
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories = ["Все", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "Все" ? groups : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string => (cents / 100).toLocaleString("ru-RU");

//   /* ================= LOADING ================= */

//   if (loading) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         {/* 🔥 FIXED ХЕДЕР - z-50 чтобы был выше всего */}
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative text-center"
//           >
//             <div className="relative mx-auto h-24 w-24">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-amber-400 animate-pulse" />
//             </div>
//             <p className="mt-6 text-base font-medium text-white/70">Загружаем премиальные услуги…</p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= ERROR ================= */

//   if (error) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         {/* 🔥 FIXED ХЕДЕР - z-50 чтобы был выше всего */}
//         <div className="fixed inset-x-0 top-0 z-50">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-md text-center"
//           >
//             <div className="mb-4 text-6xl">⚠️</div>
//             <h2 className="mb-4 text-2xl font-bold text-red-400">{error}</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-105"
//             >
//               Попробовать снова
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= MAIN ================= */

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       {/* 🔥 FIXED ХЕДЕР ВВЕРХУ - z-50 чтобы был выше карточки */}
//       <div className="fixed inset-x-0 top-0 z-50">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//       </div>

//       {/* Анимированный фон */}
//       <BookingAnimatedBackground />

//       {/* Контент с отступом под хедер */}
//       <div className="booking-content relative z-10 px-4 pt-28 pb-40 md:pt-32 md:pb-48">
//         <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//           {/* HERO */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-12 text-center md:mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//               className="mb-5 inline-block md:mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                 <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-semibold uppercase text-black shadow-[0_10px_40px_rgba(245,197,24,0.55)] md:px-8 md:py-3 md:text-sm">
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                   <span>Premium Beauty Menu</span>
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 mb-3
//                 text-4xl font-serif italic leading-tight text-transparent
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text
//                 drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
//                 md:mb-4 md:text-5xl
//                 lg:text-5xl xl:text-6xl 2xl:text-7xl
//               "
//             >
//               Выберите услугу
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="brand-script brand-subtitle mx-auto max-w-2xl text-base md:text-lg"
//             >
//               Создайте свой уникальный образ с нашими эксклюзивными премиум-услугами
//             </motion.p>
//           </motion.div>

//           {/* КАТЕГОРИИ */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="mb-10 flex flex-wrap justify-center gap-3 md:mb-14 md:gap-4"
//           >
//             {categories.map((category, index) => {
//               const isActive = selectedCategory === category;
//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 md:px-8 md:py-3 md:text-base ${
//                     isActive ? "text-black" : "text-gray-200 hover:text-white"
//                   }`}
//                 >
//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-xl shadow-amber-500/50"
//                         : "border border-white/12 bg-black/40 backdrop-blur-xl group-hover:border-amber-400/40 group-hover:bg-black/55"
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{categoryIcons[category] || "✨"}</span>
//                     {category}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* ГРУППЫ И УСЛУГИ */}
//           <div className="space-y-14 md:space-y-16">
//             {filteredGroups.map((group, groupIndex) => (
//               <motion.section
//                 key={group.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: groupIndex * 0.08 + 0.6 }}
//                 className="relative"
//               >
//                 <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
//                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                   <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
//                 </div>

//                 <div className="relative">
//                   {/* заголовок группы */}
//                   <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                     <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-black/70 px-4 py-1.5 shadow-[0_0_22px_rgba(245,197,24,0.35)] backdrop-blur-xl">
//                       <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500">
//                         <Sparkles className="h-4 w-4 text-black" />
//                       </div>
//                       <h2 className="text-lg font-semibold tracking-wide text-amber-100 md:text-xl">
//                         {group.title}
//                       </h2>
//                     </div>
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                   </div>

//                   {/* карточки */}
//                   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
//                     <AnimatePresence mode="popLayout">
//                       {group.services.map((service, index) => {
//                         const isSelected = selectedServices.includes(service.id);
//                         const isHovered = hoveredCard === service.id;
//                         const price = service.priceCents
//                           ? formatPrice(service.priceCents)
//                           : "По запросу";

//                         return (
//                           <motion.div
//                             key={service.id}
//                             layout
//                             initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.92 }}
//                             transition={{
//                               delay: index * 0.04,
//                               type: "spring",
//                               stiffness: 260,
//                               damping: 24,
//                             }}
//                             whileHover={{ y: -6, scale: 1.018 }}
//                             onHoverStart={() => setHoveredCard(service.id)}
//                             onHoverEnd={() => setHoveredCard(null)}
//                             onClick={() => toggleService(service.id)}
//                             className="group relative cursor-pointer"
//                           >
//                             {/* внешняя подсветка */}
//                             <div
//                               className={`absolute -inset-3 rounded-2xl blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/60 via-yellow-400/50 to-amber-500/60"
//                                   : "bg-gradient-to-r from-cyan-500/25 via-emerald-400/15 to-amber-400/25"
//                               }`}
//                             />

//                             {/* карточка */}
//                             <div
//                               className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
//                                 isSelected
//                                   ? "border-amber-400/80 bg-gradient-to-br from-black/70 via-amber-900/25 to-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
//                                   : "border-white/14 bg-gradient-to-br from-black/65 via-slate-950/85 to-black/90 shadow-[0_20px_55px_rgba(0,0,0,0.85)]"
//                               }`}
//                             >
//                               <div className="pointer-events-none absolute inset-0 opacity-40">
//                                 <motion.div
//                                   animate={{
//                                     backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
//                                   }}
//                                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//                                   className="absolute inset-0"
//                                   style={{
//                                     backgroundImage:
//                                       "radial-gradient(circle at 0% 0%, rgba(56,189,248,0.18) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.22) 0, transparent 55%)",
//                                     backgroundSize: "200% 200%",
//                                   }}
//                                 />
//                               </div>

//                               {/* контент карточки */}
//                               <div className="relative p-5 md:p-6">
//                                 <div className="mb-4 flex items-start justify-between">
//                                   {/* чекбокс */}
//                                   <motion.div
//                                     initial={false}
//                                     animate={{
//                                       scale: isSelected ? 1.08 : 1,
//                                       rotate: isSelected ? 360 : 0,
//                                     }}
//                                     transition={{
//                                       type: "spring",
//                                       stiffness: 260,
//                                       damping: 18,
//                                     }}
//                                     className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
//                                       isSelected
//                                         ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                         : "border-white/40 bg-black/40"
//                                     }`}
//                                   >
//                                     {isSelected && (
//                                       <motion.svg
//                                         initial={{ scale: 0, rotate: -180 }}
//                                         animate={{ scale: 1, rotate: 0 }}
//                                         className="h-4 w-4 text-black"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                         stroke="currentColor"
//                                       >
//                                         <path
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth={3}
//                                           d="M5 13l4 4L19 7"
//                                         />
//                                       </motion.svg>
//                                     )}
//                                   </motion.div>

//                                   {/* бейдж PREMIUM */}
//                                   <motion.div
//                                     animate={{ rotate: [0, 3, -3, 0] }}
//                                     transition={{
//                                       duration: 2,
//                                       repeat: Infinity,
//                                       repeatDelay: 3,
//                                     }}
//                                     className="relative"
//                                   >
//                                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
//                                     <div className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-black/80 px-2.5 py-1">
//                                       <Sparkles className="h-3 w-3 text-amber-300" />
//                                       <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
//                                         premium
//                                       </span>
//                                     </div>
//                                   </motion.div>
//                                 </div>

//                                 <h3
//                                   className={`mb-2 text-lg font-semibold transition-all md:text-xl ${
//                                     isSelected || isHovered
//                                       ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                                       : "text-white"
//                                   }`}
//                                 >
//                                   {service.title}
//                                 </h3>

//                                 {service.description && (
//                                   <p className="mb-5 line-clamp-2 text-xs font-light text-gray-300/80 md:text-sm">
//                                     {service.description}
//                                   </p>
//                                 )}

//                                 <div className="flex items-end justify-between gap-3">
//                                   <div>
//                                     <div className="mb-0.5 flex items-baseline gap-1.5">
//                                       <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
//                                         {price}
//                                       </span>
//                                       <span className="text-lg font-bold text-amber-300 md:text-xl">
//                                         €
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center gap-2 text-xs text-gray-400 md:text-sm">
//                                       <Zap className="h-4 w-4 text-amber-300" />
//                                       <span>{service.durationMin} минут</span>
//                                     </div>
//                                   </div>

//                                   <motion.div
//                                     animate={{
//                                       scale: isHovered ? 1 : 0.9,
//                                       rotate: isHovered ? -2 : 0,
//                                       opacity: isHovered ? 1 : 0.8,
//                                     }}
//                                     className={`flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
//                                       isSelected
//                                         ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                         : "border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-black"
//                                     }`}
//                                   >
//                                     <Award
//                                       className={`h-7 w-7 ${
//                                         isSelected ? "text-black" : "text-cyan-300"
//                                       }`}
//                                     />
//                                   </motion.div>
//                                 </div>
//                               </div>
//                             </div>
//                           </motion.div>
//                         );
//                       })}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </motion.section>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* 🔥 FLOATING FOOTER - FIXED ВНИЗУ НА ВСЕХ УСТРОЙСТВАХ */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* Dark overlay for better visibility - БЕЗ BLUR! */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               className="fixed inset-0 bg-black/40 z-30 pointer-events-none"
//             />

//             {/* Floating Card - FIXED for all devices */}
//             <motion.div
//               initial={{ y: "100%", opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: "100%", opacity: 0 }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               className="fixed inset-x-0 bottom-0 z-40"
//             >
//               <div className="container mx-auto px-4 pb-6">
//                 <div className="relative rounded-3xl overflow-hidden shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
//                   {/* Glassmorphism Background */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-gray-900/95 to-gray-800/95 backdrop-blur-2xl" />

//                   {/* Animated Border Glow */}
//                   <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-yellow-400/30 to-amber-500/30 opacity-50 blur-xl animate-pulse" />

//                   {/* Content */}
//                   <div className="relative z-10 p-5 md:p-7">
//                     <div className="flex items-center justify-between gap-4">
//                       <div className="flex-1 min-w-0">
//                         <div className="mb-1 text-xs font-medium text-gray-300/80">
//                           Выбрано услуг:{" "}
//                           <span className="font-bold text-amber-300">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-2 md:gap-3">
//                           <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl md:text-4xl font-black text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-xl md:text-2xl font-bold text-amber-300">€</span>
//                           <span className="text-xs md:text-base text-gray-400">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="group relative shrink-0"
//                       >
//                         <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 blur-lg transition-all group-hover:blur-xl" />
//                         <div className="relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-5 md:px-10 py-3 md:py-4 text-sm md:text-base font-semibold text-black shadow-2xl">
//                           <span>Продолжить</span>
//                           <motion.svg
//                             animate={{ x: [0, 3, 0] }}
//                             transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
//                             className="h-5 w-5"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0-5 5m5-5H6"
//                             />
//                           </motion.svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* Глобальные стили бренда */}
//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
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
//     </div>
//   );
// }

// // src/app/booking/services/page.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
//   Все: "✨",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("Все");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch("/api/booking/services", { method: "POST" });
//         if (!response.ok) throw new Error("Ошибка загрузки услуг");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setError("Не удалось загрузить услуги");
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories = ["Все", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "Все" ? groups : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string => (cents / 100).toLocaleString("ru-RU");

//   /* ================= LOADING ================= */

//   if (loading) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         {/* 🔥 FIXED ХЕДЕР */}
//         <div className="booking-progress-wrap fixed inset-x-0 top-0 z-40">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.85 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative text-center"
//           >
//             <div className="relative mx-auto h-24 w-24">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-amber-400 animate-pulse" />
//             </div>
//             <p className="mt-6 text-base font-medium text-white/70">Загружаем премиальные услуги…</p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= ERROR ================= */

//   if (error) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         {/* 🔥 FIXED ХЕДЕР */}
//         <div className="booking-progress-wrap fixed inset-x-0 top-0 z-40">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <BookingAnimatedBackground />

//         <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="max-w-md text-center"
//           >
//             <div className="mb-4 text-6xl">⚠️</div>
//             <h2 className="mb-4 text-2xl font-bold text-red-400">{error}</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-105"
//             >
//               Попробовать снова
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= MAIN ================= */

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       {/* 🔥 FIXED ХЕДЕР ВВЕРХУ */}
//       <div className="booking-progress-wrap fixed inset-x-0 top-0 z-40">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//       </div>

//       {/* Анимированный фон */}
//       <BookingAnimatedBackground />

//       {/* Контент с отступом под хедер */}
//       <div className="booking-content relative z-10 px-4 pt-28 pb-40 md:pt-32 md:pb-48">
//         <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//           {/* HERO */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-12 text-center md:mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//               className="mb-5 inline-block md:mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                 <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-semibold uppercase text-black shadow-[0_10px_40px_rgba(245,197,24,0.55)] md:px-8 md:py-3 md:text-sm">
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                   <span>Premium Beauty Menu</span>
//                   <Star className="h-4 w-4 md:h-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 mb-3
//                 text-4xl font-serif italic leading-tight text-transparent
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90 bg-clip-text
//                 drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
//                 md:mb-4 md:text-5xl
//                 lg:text-5xl xl:text-6xl 2xl:text-7xl
//               "
//             >
//               Выберите услугу
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="brand-script brand-subtitle mx-auto max-w-2xl text-base md:text-lg"
//             >
//               Создайте свой уникальный образ с нашими эксклюзивными премиум-услугами
//             </motion.p>
//           </motion.div>

//           {/* КАТЕГОРИИ */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="mb-10 flex flex-wrap justify-center gap-3 md:mb-14 md:gap-4"
//           >
//             {categories.map((category, index) => {
//               const isActive = selectedCategory === category;
//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 md:px-8 md:py-3 md:text-base ${
//                     isActive ? "text-black" : "text-gray-200 hover:text-white"
//                   }`}
//                 >
//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-xl shadow-amber-500/50"
//                         : "border border-white/12 bg-black/40 backdrop-blur-xl group-hover:border-amber-400/40 group-hover:bg-black/55"
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{categoryIcons[category] || "✨"}</span>
//                     {category}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* ГРУППЫ И УСЛУГИ */}
//           <div className="space-y-14 md:space-y-16">
//             {filteredGroups.map((group, groupIndex) => (
//               <motion.section
//                 key={group.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: groupIndex * 0.08 + 0.6 }}
//                 className="relative"
//               >
//                 <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
//                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                   <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
//                 </div>

//                 <div className="relative">
//                   {/* заголовок группы */}
//                   <div className="mb-6 flex items-center justify-center gap-4 md:mb-8">
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                     <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-black/70 px-4 py-1.5 shadow-[0_0_22px_rgba(245,197,24,0.35)] backdrop-blur-xl">
//                       <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500">
//                         <Sparkles className="h-4 w-4 text-black" />
//                       </div>
//                       <h2 className="text-lg font-semibold tracking-wide text-amber-100 md:text-xl">
//                         {group.title}
//                       </h2>
//                     </div>
//                     <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                   </div>

//                   {/* карточки */}
//                   <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6">
//                     <AnimatePresence mode="popLayout">
//                       {group.services.map((service, index) => {
//                         const isSelected = selectedServices.includes(service.id);
//                         const isHovered = hoveredCard === service.id;
//                         const price = service.priceCents
//                           ? formatPrice(service.priceCents)
//                           : "По запросу";

//                         return (
//                           <motion.div
//                             key={service.id}
//                             layout
//                             initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                             exit={{ opacity: 0, scale: 0.92 }}
//                             transition={{
//                               delay: index * 0.04,
//                               type: "spring",
//                               stiffness: 260,
//                               damping: 24,
//                             }}
//                             whileHover={{ y: -6, scale: 1.018 }}
//                             onHoverStart={() => setHoveredCard(service.id)}
//                             onHoverEnd={() => setHoveredCard(null)}
//                             onClick={() => toggleService(service.id)}
//                             className="group relative cursor-pointer"
//                           >
//                             {/* внешняя подсветка */}
//                             <div
//                               className={`absolute -inset-3 rounded-2xl blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
//                                 isSelected
//                                   ? "bg-gradient-to-r from-amber-500/60 via-yellow-400/50 to-amber-500/60"
//                                   : "bg-gradient-to-r from-cyan-500/25 via-emerald-400/15 to-amber-400/25"
//                               }`}
//                             />

//                             {/* карточка */}
//                             <div
//                               className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
//                                 isSelected
//                                   ? "border-amber-400/80 bg-gradient-to-br from-black/70 via-amber-900/25 to-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
//                                   : "border-white/14 bg-gradient-to-br from-black/65 via-slate-950/85 to-black/90 shadow-[0_20px_55px_rgba(0,0,0,0.85)]"
//                               }`}
//                             >
//                               <div className="pointer-events-none absolute inset-0 opacity-40">
//                                 <motion.div
//                                   animate={{
//                                     backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
//                                   }}
//                                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//                                   className="absolute inset-0"
//                                   style={{
//                                     backgroundImage:
//                                       "radial-gradient(circle at 0% 0%, rgba(56,189,248,0.18) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.22) 0, transparent 55%)",
//                                     backgroundSize: "200% 200%",
//                                   }}
//                                 />
//                               </div>

//                               {/* контент карточки */}
//                               <div className="relative p-5 md:p-6">
//                                 <div className="mb-4 flex items-start justify-between">
//                                   {/* чекбокс */}
//                                   <motion.div
//                                     initial={false}
//                                     animate={{
//                                       scale: isSelected ? 1.08 : 1,
//                                       rotate: isSelected ? 360 : 0,
//                                     }}
//                                     transition={{
//                                       type: "spring",
//                                       stiffness: 260,
//                                       damping: 18,
//                                     }}
//                                     className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
//                                       isSelected
//                                         ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                         : "border-white/40 bg-black/40"
//                                     }`}
//                                   >
//                                     {isSelected && (
//                                       <motion.svg
//                                         initial={{ scale: 0, rotate: -180 }}
//                                         animate={{ scale: 1, rotate: 0 }}
//                                         className="h-4 w-4 text-black"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                         stroke="currentColor"
//                                       >
//                                         <path
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth={3}
//                                           d="M5 13l4 4L19 7"
//                                         />
//                                       </motion.svg>
//                                     )}
//                                   </motion.div>

//                                   {/* бейдж PREMIUM */}
//                                   <motion.div
//                                     animate={{ rotate: [0, 3, -3, 0] }}
//                                     transition={{
//                                       duration: 2,
//                                       repeat: Infinity,
//                                       repeatDelay: 3,
//                                     }}
//                                     className="relative"
//                                   >
//                                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
//                                     <div className="relative inline-flex items-center gap-1 rounded-full border border-amber-500/60 bg-black/80 px-2.5 py-1">
//                                       <Sparkles className="h-3 w-3 text-amber-300" />
//                                       <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
//                                         premium
//                                       </span>
//                                     </div>
//                                   </motion.div>
//                                 </div>

//                                 <h3
//                                   className={`mb-2 text-lg font-semibold transition-all md:text-xl ${
//                                     isSelected || isHovered
//                                       ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                                       : "text-white"
//                                   }`}
//                                 >
//                                   {service.title}
//                                 </h3>

//                                 {service.description && (
//                                   <p className="mb-5 line-clamp-2 text-xs font-light text-gray-300/80 md:text-sm">
//                                     {service.description}
//                                   </p>
//                                 )}

//                                 <div className="flex items-end justify-between gap-3">
//                                   <div>
//                                     <div className="mb-0.5 flex items-baseline gap-1.5">
//                                       <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-2xl font-extrabold text-transparent md:text-3xl">
//                                         {price}
//                                       </span>
//                                       <span className="text-lg font-bold text-amber-300 md:text-xl">
//                                         €
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center gap-2 text-xs text-gray-400 md:text-sm">
//                                       <Zap className="h-4 w-4 text-amber-300" />
//                                       <span>{service.durationMin} минут</span>
//                                     </div>
//                                   </div>

//                                   <motion.div
//                                     animate={{
//                                       scale: isHovered ? 1 : 0.9,
//                                       rotate: isHovered ? -2 : 0,
//                                       opacity: isHovered ? 1 : 0.8,
//                                     }}
//                                     className={`flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
//                                       isSelected
//                                         ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                         : "border border-cyan-400/30 bg-gradient-to-br from-slate-900 to-black"
//                                     }`}
//                                   >
//                                     <Award
//                                       className={`h-7 w-7 ${
//                                         isSelected ? "text-black" : "text-cyan-300"
//                                       }`}
//                                     />
//                                   </motion.div>
//                                 </div>
//                               </div>
//                             </div>
//                           </motion.div>
//                         );
//                       })}
//                     </AnimatePresence>
//                   </div>
//                 </div>
//               </motion.section>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* 🔥 FLOATING FOOTER - FIXED ВНИЗУ */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE sticky внизу */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               className="sticky bottom-0 z-30 p-4 md:hidden"
//               style={{
//                 paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
//               }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                   <div className="relative rounded-3xl border border-amber-500/60 bg-black/95 p-5 backdrop-blur-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="mb-1 text-xs font-medium text-gray-300/80">
//                           Выбрано услуг:{" "}
//                           <span className="font-bold text-amber-300">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-3xl font-black text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-300">€</span>
//                           <span className="text-sm text-gray-400">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.04 }}
//                         whileTap={{ scale: 0.96 }}
//                         onClick={handleContinue}
//                         className="group relative shrink-0"
//                       >
//                         <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 blur-lg transition-all group-hover:blur-xl" />
//                         <div className="relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-sm font-semibold text-black shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg
//                             className="h-5 w-5"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* DESKTOP fixed внизу */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               transition={{ type: "spring", stiffness: 300, damping: 30 }}
//               className="fixed bottom-0 left-0 right-0 z-30 hidden p-6 md:block"
//               style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
//             >
//               <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 blur-2xl opacity-60" />
//                   <div className="relative rounded-3xl border border-amber-500/60 bg-black/95 p-7 backdrop-blur-2xl shadow-[0_-20px_70px_rgba(0,0,0,0.85)] md:p-8">
//                     <div className="flex flex-wrap items-center justify-between gap-6">
//                       <div>
//                         <div className="mb-2 text-sm font-medium text-gray-300/80">
//                           Выбрано услуг:{" "}
//                           <span className="font-bold text-amber-300">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-5xl font-black text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-300">€</span>
//                           <span className="ml-2 text-xl text-gray-400">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="group relative"
//                       >
//                         <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl transition-all group-hover:blur-2xl" />
//                         <div className="relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-12 py-4 text-lg font-semibold text-black shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
//                           <span>Продолжить</span>
//                           <svg
//                             className="h-6 w-6"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                             stroke="currentColor"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M13 7l5 5m0 0-5 5m5-5H6"
//                             />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       {/* Глобальные стили бренда */}
//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
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
//     </div>
//   );
// }




//--------осталось поднять хедер
// // src/app/booking/services/page.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { BookingAnimatedBackground } from "@/components/layout/BookingAnimatedBackground";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award, SparklesIcon } from "lucide-react";

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// // без any
// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
//   Все: "✨",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("Все");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch("/api/booking/services", { method: "POST" });
//         if (!response.ok) throw new Error("Ошибка загрузки услуг");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setError("Не удалось загрузить услуги");
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories = ["Все", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "Все" ? groups : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string => (cents / 100).toLocaleString("ru-RU");

//   /* ================= LOADING ================= */

//   if (loading) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <BookingAnimatedBackground />
//         <div className="relative z-10 min-h-screen flex flex-col">
//           <div className="booking-progress-wrap">
//             <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//           </div>

//           <div className="flex flex-1 items-center justify-center px-4">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.85 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="relative text-center"
//             >
//               <div className="relative w-24 h-24 mx-auto">
//                 <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//                 <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//                 <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-amber-400 animate-pulse" />
//               </div>
//               <p className="mt-6 text-base md:text-lg text-white/70 font-medium">
//                 Загружаем премиальные услуги…
//               </p>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= ERROR ================= */

//   if (error) {
//     return (
//       <div className="relative min-h-screen overflow-hidden bg-black">
//         <BookingAnimatedBackground />
//         <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
//           <div className="booking-progress-wrap">
//             <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//           </div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center max-w-md"
//           >
//             <div className="text-6xl mb-4">⚠️</div>
//             <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/50"
//             >
//               Попробовать снова
//             </button>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ================= MAIN ================= */

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <BookingAnimatedBackground />

//       <div className="relative z-10 flex min-h-screen flex-col">
//         {/* Закреплённый прогресс-бар */}
//         <div className="booking-progress-wrap">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         {/* Основной контент */}
//         <main className="booking-content relative pt-28 md:pt-32 pb-40 md:pb-48 px-4">
//           <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//             {/* HERO */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mb-12 md:mb-16 text-center"
//             >
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 18 }}
//                 className="inline-block mb-5 md:mb-6"
//               >
//                 <div className="relative">
//                   <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60 animate-pulse" />
//                   <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 px-6 md:px-8 py-2.5 md:py-3 text-black font-semibold shadow-[0_10px_40px_rgba(245,197,24,0.55)]">
//                     <Star className="w-4 h-4 md:w-5 md:h-5" />
//                     <span className="uppercase tracking-wide text-xs md:text-sm">
//                       Premium Beauty Menu
//                     </span>
//                     <Star className="w-4 h-4 md:w-5 md:h-5" />
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.h1
//                 initial={{ opacity: 0, y: 18 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.28 }}
//                 className="
//                   text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//                   font-serif italic leading-tight
//                   text-transparent bg-clip-text
//                   bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//                   drop-shadow-[0_0_22px_rgba(245,197,24,0.45)]
//                   mb-3 md:mb-4
//                 "
//               >
//                 Выберите услугу
//               </motion.h1>

//               <motion.p
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.45 }}
//                 className="mx-auto max-w-2xl brand-script brand-subtitle text-base md:text-lg"
//               >
//                 Создайте свой уникальный образ с нашими эксклюзивными премиум-услугами
//               </motion.p>
//             </motion.div>

//             {/* КАТЕГОРИИ */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.55 }}
//               className="mb-10 md:mb-14 flex flex-wrap justify-center gap-3 md:gap-4"
//             >
//               {categories.map((category, index) => {
//                 const isActive = selectedCategory === category;
//                 return (
//                   <motion.button
//                     key={category}
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: 0.05 * index }}
//                     whileHover={{ scale: 1.05, y: -2 }}
//                     whileTap={{ scale: 0.96 }}
//                     onClick={() => setSelectedCategory(category)}
//                     className={`group relative px-6 md:px-8 py-2.5 md:py-3 rounded-2xl font-semibold text-sm md:text-base transition-all duration-300 ${
//                       isActive ? "text-black" : "text-gray-200 hover:text-white"
//                     }`}
//                   >
//                     <div
//                       className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                         isActive
//                           ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-xl shadow-amber-500/50"
//                           : "bg-black/40 border border-white/12 backdrop-blur-xl group-hover:bg-black/55 group-hover:border-amber-400/40"
//                       }`}
//                     />
//                     <span className="relative flex items-center gap-2">
//                       <span className="text-xl">{categoryIcons[category] || "✨"}</span>
//                       {category}
//                     </span>
//                   </motion.button>
//                 );
//               })}
//             </motion.div>

//             {/* ГРУППЫ И УСЛУГИ */}
//             <div className="space-y-14 md:space-y-16">
//               {filteredGroups.map((group, groupIndex) => (
//                 <motion.section
//                   key={group.id}
//                   initial={{ opacity: 0, y: 30 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: groupIndex * 0.08 + 0.6 }}
//                   className="relative"
//                 >
//                   {/* Подиум-фон под блоком */}
//                   <div className="pointer-events-none absolute -inset-x-8 -top-4 -bottom-10 opacity-70">
//                     <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                     <div className="absolute inset-x-10 bottom-0 h-32 rounded-[999px] bg-gradient-to-r from-black/0 via-black/75 to-black/0 blur-3xl" />
//                   </div>

//                   <div className="relative">
//                     {/* Заголовок группы */}
//                     <div className="mb-6 md:mb-8 flex items-center justify-center gap-4">
//                       <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                       <div className="inline-flex items-center gap-2 rounded-full bg-black/70 border border-amber-500/40 px-4 py-1.5 shadow-[0_0_22px_rgba(245,197,24,0.35)] backdrop-blur-xl">
//                         <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
//                           <SparklesIcon className="w-4 h-4 text-black" />
//                         </div>
//                         <h2 className="text-lg md:text-xl font-semibold text-amber-100 tracking-wide">
//                           {group.title}
//                         </h2>
//                       </div>
//                       <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
//                     </div>

//                     {/* Сетка карточек */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
//                       <AnimatePresence mode="popLayout">
//                         {group.services.map((service, index) => {
//                           const isSelected = selectedServices.includes(service.id);
//                           const isHovered = hoveredCard === service.id;
//                           const price = service.priceCents
//                             ? formatPrice(service.priceCents)
//                             : "По запросу";

//                           return (
//                             <motion.div
//                               key={service.id}
//                               layout
//                               initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                               animate={{ opacity: 1, scale: 1, y: 0 }}
//                               exit={{ opacity: 0, scale: 0.92 }}
//                               transition={{
//                                 delay: index * 0.04,
//                                 type: "spring",
//                                 stiffness: 260,
//                                 damping: 24,
//                               }}
//                               whileHover={{ y: -6, scale: 1.018 }}
//                               onHoverStart={() => setHoveredCard(service.id)}
//                               onHoverEnd={() => setHoveredCard(null)}
//                               onClick={() => toggleService(service.id)}
//                               className="group relative cursor-pointer"
//                             >
//                               {/* Глобальная подсветка карточки */}
//                               <div
//                                 className={`absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${
//                                   isSelected
//                                     ? "bg-gradient-to-r from-amber-500/60 via-yellow-400/50 to-amber-500/60"
//                                     : "bg-gradient-to-r from-cyan-500/25 via-emerald-400/15 to-amber-400/25"
//                                 }`}
//                               />

//                               {/* Карточка */}
//                               <div
//                                 className={`relative rounded-2xl overflow-hidden border backdrop-blur-xl transition-all duration-500 ${
//                                   isSelected
//                                     ? "border-amber-400/80 bg-gradient-to-br from-black/70 via-amber-900/25 to-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
//                                     : "border-white/14 bg-gradient-to-br from-black/65 via-slate-950/85 to-black/90 shadow-[0_20px_55px_rgba(0,0,0,0.85)]"
//                                 }`}
//                               >
//                                 {/* Лёгкая внутренняя анимация света */}
//                                 <div className="pointer-events-none absolute inset-0 opacity-40">
//                                   <motion.div
//                                     animate={{
//                                       backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
//                                     }}
//                                     transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//                                     className="absolute inset-0"
//                                     style={{
//                                       backgroundImage:
//                                         "radial-gradient(circle at 0% 0%, rgba(56,189,248,0.18) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(251,191,36,0.22) 0, transparent 55%)",
//                                       backgroundSize: "200% 200%",
//                                     }}
//                                   />
//                                 </div>

//                                 {/* Контент карточки */}
//                                 <div className="relative p-5 md:p-6">
//                                   {/* Верхняя строка */}
//                                   <div className="mb-4 flex items-start justify-between">
//                                     {/* Чекбокс */}
//                                     <motion.div
//                                       initial={false}
//                                       animate={{
//                                         scale: isSelected ? 1.08 : 1,
//                                         rotate: isSelected ? 360 : 0,
//                                       }}
//                                       transition={{ type: "spring", stiffness: 260, damping: 18 }}
//                                       className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${
//                                         isSelected
//                                           ? "bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-400 shadow-lg shadow-amber-500/50"
//                                           : "border-white/40 bg-black/40"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <motion.svg
//                                           initial={{ scale: 0, rotate: -180 }}
//                                           animate={{ scale: 1, rotate: 0 }}
//                                           className="h-4 w-4 text-black"
//                                           fill="none"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={3}
//                                             d="M5 13l4 4L19 7"
//                                           />
//                                         </motion.svg>
//                                       )}
//                                     </motion.div>

//                                     {/* Маленький бейдж «premium» */}
//                                     <motion.div
//                                       animate={{ rotate: [0, 3, -3, 0] }}
//                                       transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
//                                       className="relative"
//                                     >
//                                       <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 blur-md opacity-50" />
//                                       <div className="relative inline-flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 border border-amber-500/60">
//                                         <Sparkles className="h-3 w-3 text-amber-300" />
//                                         <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-100">
//                                           premium
//                                         </span>
//                                       </div>
//                                     </motion.div>
//                                   </div>

//                                   {/* Название */}
//                                   <h3
//                                     className={`mb-2 text-lg md:text-xl font-semibold transition-all ${
//                                       isSelected || isHovered
//                                         ? "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent"
//                                         : "text-white"
//                                     }`}
//                                   >
//                                     {service.title}
//                                   </h3>

//                                   {/* Описание */}
//                                   {service.description && (
//                                     <p className="mb-5 line-clamp-2 text-xs md:text-sm text-gray-300/80 font-light">
//                                       {service.description}
//                                     </p>
//                                   )}

//                                   {/* Низ карточки */}
//                                   <div className="flex items-end justify-between gap-3">
//                                     {/* Цена + время */}
//                                     <div>
//                                       <div className="mb-0.5 flex items-baseline gap-1.5">
//                                         <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
//                                           {price}
//                                         </span>
//                                         <span className="text-lg md:text-xl font-bold text-amber-300">
//                                           €
//                                         </span>
//                                       </div>
//                                       <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
//                                         <Zap className="h-4 w-4 text-amber-300" />
//                                         <span>{service.durationMin} минут</span>
//                                       </div>
//                                     </div>

//                                     {/* Иконка справа */}
//                                     <motion.div
//                                       animate={{
//                                         scale: isHovered ? 1 : 0.9,
//                                         rotate: isHovered ? -2 : 0,
//                                         opacity: isHovered ? 1 : 0.8,
//                                       }}
//                                       className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl ${
//                                         isSelected
//                                           ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                           : "bg-gradient-to-br from-slate-900 to-black border border-cyan-400/30"
//                                       }`}
//                                     >
//                                       <Award
//                                         className={`h-7 w-7 ${
//                                           isSelected ? "text-black" : "text-cyan-300"
//                                         }`}
//                                       />
//                                     </motion.div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </motion.div>
//                           );
//                         })}
//                       </AnimatePresence>
//                     </div>
//                   </div>
//                 </motion.section>
//               ))}
//             </div>
//           </div>
//         </main>

//         {/* FLOATING FOOTER: сумма + продолжить */}
//         <AnimatePresence>
//           {selectedServices.length > 0 && (
//             <>
//               {/* MOBILE sticky */}
//               <motion.div
//                 initial={{ y: 50, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: 50, opacity: 0 }}
//                 className="md:hidden sticky bottom-0 z-50 p-4"
//                 style={{
//                   paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)",
//                 }}
//               >
//                 <div className="mx-auto w-full max-w-screen-2xl">
//                   <div className="relative">
//                     <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl opacity-60" />
//                     <div className="relative rounded-3xl border border-amber-500/60 bg-black/90 p-5 backdrop-blur-2xl">
//                       <div className="flex items-center justify-between gap-4">
//                         <div>
//                           <div className="mb-1 text-xs font-medium text-gray-300/80">
//                             Выбрано услуг:{" "}
//                             <span className="font-bold text-amber-300">
//                               {selectedServices.length}
//                             </span>
//                           </div>
//                           <div className="flex items-baseline gap-3">
//                             <span className="text-3xl font-black bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
//                               {formatPrice(totalPrice)}
//                             </span>
//                             <span className="text-2xl font-bold text-amber-300">€</span>
//                             <span className="text-sm text-gray-400">• {totalDuration} мин</span>
//                           </div>
//                         </div>

//                         <motion.button
//                           whileHover={{ scale: 1.04 }}
//                           whileTap={{ scale: 0.96 }}
//                           onClick={handleContinue}
//                           className="relative shrink-0 group"
//                         >
//                           <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 blur-lg group-hover:blur-xl transition-all" />
//                           <div className="relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-sm font-semibold text-black shadow-2xl">
//                             <span>Продолжить</span>
//                             <svg
//                               className="h-5 w-5"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M13 7l5 5m0 0-5 5m5-5H6"
//                               />
//                             </svg>
//                           </div>
//                         </motion.button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* DESKTOP fixed */}
//               <motion.div
//                 initial={{ y: 100, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: 100, opacity: 0 }}
//                 className="fixed bottom-0 left-0 right-0 z-40 hidden md:block p-6"
//                 style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//               >
//                 <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">
//                   <div className="relative">
//                     <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-500 blur-2xl opacity-60" />
//                     <div className="relative rounded-3xl border border-amber-500/60 bg-black/92 p-7 md:p-8 backdrop-blur-2xl">
//                       <div className="flex flex-wrap items-center justify-between gap-6">
//                         <div>
//                           <div className="mb-2 text-sm font-medium text-gray-300/80">
//                             Выбрано услуг:{" "}
//                             <span className="font-bold text-amber-300">
//                               {selectedServices.length}
//                             </span>
//                           </div>
//                           <div className="flex items-baseline gap-4">
//                             <span className="text-5xl font-black bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
//                               {formatPrice(totalPrice)}
//                             </span>
//                             <span className="text-3xl font-bold text-amber-300">€</span>
//                             <span className="ml-2 text-xl text-gray-400">
//                               • {totalDuration} мин
//                             </span>
//                           </div>
//                         </div>

//                         <motion.button
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                           onClick={handleContinue}
//                           className="relative group"
//                         >
//                           <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 blur-xl group-hover:blur-2xl transition-all" />
//                           <div className="relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-12 py-4 text-lg font-semibold text-black shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
//                             <span>Продолжить</span>
//                             <svg
//                               className="h-6 w-6"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                               stroke="currentColor"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M13 7l5 5m0 0-5 5m5-5H6"
//                               />
//                             </svg>
//                           </div>
//                         </motion.button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>

//         {/* Глобальные стили под брендовые эффекты */}
//         <style jsx global>{`
//           @keyframes gradient {
//             0%,
//             100% {
//               background-position: 0% 50%;
//             }
//             50% {
//               background-position: 100% 50%;
//             }
//           }
//           .animate-gradient {
//             background-size: 200% 200%;
//             animation: gradient 3s ease infinite;
//           }
//           .bg-300\% {
//             background-size: 300% 300%;
//           }

//           .brand-subtitle {
//             background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
//             -webkit-background-clip: text;
//             background-clip: text;
//             color: transparent;
//             text-shadow:
//               0 0 10px rgba(139, 92, 246, 0.35),
//               0 0 18px rgba(59, 130, 246, 0.25),
//               0 0 28px rgba(6, 182, 212, 0.22);
//             filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.15));
//           }
//           .brand-subtitle:hover,
//           .brand-subtitle:active {
//             text-shadow:
//               0 0 12px rgba(139, 92, 246, 0.45),
//               0 0 22px rgba(59, 130, 246, 0.35),
//               0 0 32px rgba(6, 182, 212, 0.28);
//           }

//           .brand-script {
//             font-family: var(--brand-script, "Cormorant Infant", "Playfair Display", serif);
//             font-style: italic;
//             font-weight: 600;
//             letter-spacing: 0.02em;
//             -webkit-font-smoothing: antialiased;
//             -moz-osx-font-smoothing: grayscale;
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// }



// // src/app/booking/(steps)/services/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import { BookingAnimatedBackground } from '@/components/layout/BookingAnimatedBackground';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { Sparkles, Star, Zap, Award } from 'lucide-react';

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// const categoryIcons: Record<string, string> = {
//   Маникюр: '💅',
//   Стрижка: '✂️',
//   Все: '✨',
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>('Все');
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch('/api/booking/services', { method: 'POST' });
//         if (!response.ok) throw new Error('Ошибка загрузки услуг');

//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching services:', err);
//         setError('Не удалось загрузить услуги');
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories = ['Все', ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === 'Все' ? groups : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append('s', id));

//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string => (cents / 100).toLocaleString('ru-RU');

//   /* ===========
//       LOADING
//   =============*/
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
//         <div className="booking-progress-wrap">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <div className="flex items-center justify-center min-h-screen">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative"
//           >
//             <div className="w-24 h-24 relative">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-amber-500 animate-pulse" />
//             </div>

//             <p className="text-white/60 text-center mt-8 font-medium">
//               Загрузка премиум услуг...
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   /* ===========
//       ERROR
//   =============*/
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
//         <div className="booking-progress-wrap">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
//           <div className="text-6xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>

//           <button
//             onClick={() => window.location.reload()}
//             className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/50"
//           >
//             Попробовать снова
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   /* =======================
//       MAIN PAGE CONTENT
//   =========================*/
//   return (
//     <div className="relative min-h-screen overflow-hidden bg-black">
//       <BookingAnimatedBackground />

//       <div className="relative z-10 flex min-h-screen flex-col">
//         {/* FIXED PROGRESS BAR */}
//         <div className="booking-progress-wrap">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         {/* PAGE INNER CONTENT */}
//         <div className="booking-content relative pt-28 md:pt-32 pb-28 md:pb-32 px-4">
//           <div className="mx-auto w-full max-w-screen-2xl">

//             {/* -----------------------------
//                HERO SECTION
//             ------------------------------ */}
//             <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 md:mb-16">
//               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="inline-block mb-6">
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl opacity-50 animate-pulse" />
//                   <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-xl">
//                     <Star className="w-5 h-5" />
//                     <span>Premium Selection</span>
//                     <Star className="w-5 h-5" />
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.h1
//                 initial={{ opacity: 0, y: 18 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.28 }}
//                 className="
//                   text-4xl md:text-5xl xl:text-6xl
//                   font-serif italic leading-tight
//                   text-transparent bg-clip-text
//                   bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//                   drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                   mb-3
//                 "
//               >
//                 Выберите услугу
//               </motion.h1>

//               <motion.p
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.45 }}
//                 className="mx-auto max-w-2xl brand-script tracking-wide text-base md:text-lg brand-subtitle"
//               >
//                 Создайте свой уникальный образ с нашими эксклюзивными премиум услугами
//               </motion.p>
//             </motion.div>

//             {/* -----------------------------
//                  CATEGORIES
//             ------------------------------ */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.55 }}
//               className="flex flex-wrap gap-3 md:gap-4 justify-center mb-12 md:mb-16"
//             >
//               {categories.map((category, index) => {
//                 const isActive = selectedCategory === category;

//                 return (
//                   <motion.button
//                     key={category}
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: 0.05 * index }}
//                     whileHover={{ scale: 1.05, y: -2 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => setSelectedCategory(category)}
//                     className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all ${
//                       isActive ? 'text-black' : 'text-gray-300 hover:text-white'
//                     }`}
//                   >
//                     <div
//                       className={`absolute inset-0 rounded-2xl transition-all ${
//                         isActive
//                           ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-2xl shadow-amber-500/50'
//                           : 'bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10'
//                       }`}
//                     />
//                     <span className="relative flex items-center gap-2">
//                       <span className="text-xl">{categoryIcons[category] || '✨'}</span>
//                       {category}
//                     </span>
//                   </motion.button>
//                 );
//               })}
//             </motion.div>

//             {/* -----------------------------
//                GROUPS & SERVICES GRID
//             ------------------------------ */}
//             {filteredGroups.map((group, groupIndex) => (
//               <motion.div
//                 key={group.id}
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6 + groupIndex * 0.08 }}
//                 className="mb-20"
//               >
//                 {/* Title */}
//                 <div className="flex items-center gap-4 mb-8">
//                   <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                   <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                     {group.title}
//                   </h2>
//                   <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                 </div>

//                 {/* Services */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
//                   <AnimatePresence mode="popLayout">
//                     {group.services.map((service, index) => {
//                       const isSelected = selectedServices.includes(service.id);
//                       const isHovered = hoveredCard === service.id;
//                       const price = service.priceCents ? formatPrice(service.priceCents) : 'По запросу';

//                       return (
//                         <motion.div
//                           key={service.id}
//                           layout
//                           initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                           animate={{ opacity: 1, scale: 1, y: 0 }}
//                           exit={{ opacity: 0, scale: 0.92 }}
//                           transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
//                           whileHover={{ y: -6, scale: 1.015 }}
//                           onHoverStart={() => setHoveredCard(service.id)}
//                           onHoverEnd={() => setHoveredCard(null)}
//                           onClick={() => toggleService(service.id)}
//                           className="group relative cursor-pointer"
//                         >
//                           {/* Card glow */}
//                           <div
//                             className={`absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg ${
//                               isSelected
//                                 ? 'bg-gradient-to-r from-amber-500/45 to-yellow-500/45'
//                                 : 'bg-gradient-to-r from-amber-500/18 to-yellow-500/18'
//                             }`}
//                           />

//                           {/* MAIN CARD */}
//                           <div
//                             className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
//                               isSelected
//                                 ? 'bg-gradient-to-br from-amber-500/18 via-yellow-500/10 to-amber-500/18 border border-amber-500/40'
//                                 : 'bg-white/5 backdrop-blur-xl border border-white/10'
//                             }`}
//                           >
//                             {/* animated background */}
//                             <div className="absolute inset-0 opacity-25">
//                               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
//                               <motion.div
//                                 animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
//                                 transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse' }}
//                                 className="absolute inset-0"
//                                 style={{
//                                   backgroundImage:
//                                     'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.12) 0%, transparent 50%)',
//                                   backgroundSize: '200% 200%',
//                                 }}
//                               />
//                             </div>

//                             {/* CONTENT */}
//                             <div className="relative p-6">
//                               <div className="flex items-start justify-between mb-4">
//                                 {/* Checkbox */}
//                                 <motion.div
//                                   initial={false}
//                                   animate={{ scale: isSelected ? 1.08 : 1, rotate: isSelected ? 360 : 0 }}
//                                   transition={{ type: 'spring', stiffness: 300 }}
//                                   className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
//                                     isSelected
//                                       ? 'bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-500 shadow-lg shadow-amber-500/40'
//                                       : 'border-white/30 backdrop-blur-sm'
//                                   }`}
//                                 >
//                                   {isSelected && (
//                                     <motion.svg
//                                       initial={{ scale: 0, rotate: -180 }}
//                                       animate={{ scale: 1, rotate: 0 }}
//                                       className="w-4 h-4 text-black"
//                                       fill="none"
//                                       viewBox="0 0 24 24"
//                                       stroke="currentColor"
//                                     >
//                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                     </motion.svg>
//                                   )}
//                                 </motion.div>

//                                 {/* Badge */}
//                                 <motion.div
//                                   animate={{ rotate: [0, 4, -4, 0] }}
//                                   transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
//                                   className="relative"
//                                 >
//                                   <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-md opacity-50" />
//                                   <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-xl">
//                                     <Sparkles className="w-6 h-6 text-black" />
//                                   </div>
//                                 </motion.div>
//                               </div>

//                               <h3
//                                 className={`text-lg font-bold mb-2 transition-all ${
//                                   isSelected || isHovered
//                                     ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400'
//                                     : 'text-white'
//                                 }`}
//                               >
//                                 {service.title}
//                               </h3>

//                               {service.description && (
//                                 <p className="text-gray-400 text-sm mb-5 line-clamp-2">{service.description}</p>
//                               )}

//                               {/* bottom */}
//                               <div className="flex items-end justify-between">
//                                 <div>
//                                   <div className="flex items-baseline gap-1.5 mb-1">
//                                     <span className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                                       {price}
//                                     </span>
//                                     <span className="text-xl font-bold text-amber-400">€</span>
//                                   </div>
//                                   <div className="flex items-center gap-2 text-gray-500 text-sm">
//                                     <Zap className="w-4 h-4" />
//                                     <span>{service.durationMin} минут</span>
//                                   </div>
//                                 </div>

//                                 <motion.div
//                                   animate={{ scale: isHovered ? 1 : 0.85, opacity: isHovered ? 1 : 0.6 }}
//                                   className={`w-14 h-14 rounded-xl flex items-center justify-center ${
//                                     isSelected
//                                       ? 'bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/40'
//                                       : 'bg-white/5'
//                                   }`}
//                                 >
//                                   <Award className={`w-7 h-7 ${isSelected ? 'text-black' : 'text-amber-500'}`} />
//                                 </motion.div>
//                               </div>
//                             </div>
//                           </div>
//                         </motion.div>
//                       );
//                     })}
//                   </AnimatePresence>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>

//         {/* FLOATING FOOTERS */}
//         <AnimatePresence>
//           {selectedServices.length > 0 && (
//             <>
//               {/* MOBILE */}
//               <motion.div
//                 initial={{ y: 50, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: 50, opacity: 0 }}
//                 className="md:hidden sticky bottom-0 z-50 p-4"
//                 style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)' }}
//               >
//                 <div className="mx-auto w-full max-w-screen-2xl">
//                   <div className="relative">
//                     <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                     <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                       <div className="flex items-center justify-between gap-4">
//                         <div>
//                           <div className="text-sm text-gray-400 mb-1 font-medium">
//                             Выбрано услуг: <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                           </div>

//                           <div className="flex items-baseline gap-3">
//                             <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                               {formatPrice(totalPrice)}
//                             </span>
//                             <span className="text-2xl font-bold text-amber-400">€</span>
//                             <span className="text-base text-gray-500">• {totalDuration} мин</span>
//                           </div>
//                         </div>

//                         <motion.button
//                           whileHover={{ scale: 1.03 }}
//                           whileTap={{ scale: 0.97 }}
//                           onClick={handleContinue}
//                           className="relative group shrink-0"
//                         >
//                           <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                           <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base flex items-center gap-3 shadow-2xl">
//                             <span>Продолжить</span>
//                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                             </svg>
//                           </div>
//                         </motion.button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>

//               {/* DESKTOP */}
//               <motion.div
//                 initial={{ y: 100, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 exit={{ y: 100, opacity: 0 }}
//                 className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//                 style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
//               >
//                 <div className="mx-auto w-full max-w-screen-2xl">
//                   <div className="relative">
//                     <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                     <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                       <div className="flex items-center justify-between flex-wrap gap-6">
//                         <div>
//                           <div className="text-sm text-gray-400 mb-2 font-medium">
//                             Выбрано услуг:{' '}
//                             <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                           </div>

//                           <div className="flex items-baseline gap-4">
//                             <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                               {formatPrice(totalPrice)}
//                             </span>
//                             <span className="text-3xl font-bold text-amber-400">€</span>
//                             <span className="text-xl text-gray-500 ml-2">• {totalDuration} мин</span>
//                           </div>
//                         </div>

//                         <motion.button
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                           onClick={handleContinue}
//                           className="relative group"
//                         >
//                           <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                           <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
//                             <span>Продолжить</span>
//                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                             </svg>
//                           </div>
//                         </motion.button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* GLOBAL STYLES */}
//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         /* brand subtitle styling */
//         .brand-subtitle {
//           background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%);
//           -webkit-background-clip: text;
//           background-clip: text;
//           color: transparent;
//           text-shadow: 0 0 10px rgba(139, 92, 246, 0.35),
//             0 0 18px rgba(59, 130, 246, 0.25),
//             0 0 28px rgba(6, 182, 212, 0.22);
//           filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.15));
//         }
//         .brand-subtitle:hover {
//           text-shadow: 0 0 12px rgba(139, 92, 246, 0.45),
//             0 0 22px rgba(59, 130, 246, 0.35),
//             0 0 32px rgba(6, 182, 212, 0.28);
//         }

//         /* cursive brand style */
//         .brand-script {
//           font-family: var(--brand-script, 'YourBrandScript', 'Cormorant Infant', 'Playfair Display', serif);
//           font-style: italic;
//           font-weight: 600;
//           letter-spacing: 0.02em;
//         }
//       `}</style>

//     </div>
//   );
// }



//--------всё работает, меняю только задний фон----------
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { Sparkles, Star, Zap, Award } from 'lucide-react';

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// // без any
// const categoryIcons: Record<string, string> = {
//   Маникюр: '💅',
//   Стрижка: '✂️',
//   Все: '✨',
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>('Все');
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch('/api/booking/services', { method: 'POST' });
//         if (!response.ok) throw new Error('Ошибка загрузки услуг');
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching services:', err);
//         setError('Не удалось загрузить услуги');
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories = ['Все', ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === 'Все' ? groups : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append('s', id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string => (cents / 100).toLocaleString('ru-RU');

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
//         <div className="booking-progress-wrap">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <div className="flex items-center justify-center min-h-screen">
//           <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
//             <div className="w-24 h-24 relative">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-amber-500 animate-pulse" />
//             </div>
//             <p className="text-white/60 text-center mt-8 font-medium">Загрузка премиум услуг...</p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
//         <div className="booking-progress-wrap">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
//           <div className="text-6xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/50"
//           >
//             Попробовать снова
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 relative overflow-hidden">
//       {/* Закреплённый прогресс-бар с золотой линией (см. booking/layout.tsx) */}
//       <div className="booking-progress-wrap">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//       </div>

//       {/* Animated background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
//           transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
//           className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//         <motion.div
//           animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
//           transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
//           className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//       </div>

//       {/* Контент с базовым отступом от прогресс-бара (см. booking/layout.tsx) */}
//       <div className="booking-content relative pt-28 md:pt-32 pb-28 md:pb-32 px-4">
//         <div className="mx-auto w-full max-w-screen-2xl">
//           {/* Hero */}
//           <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 md:mb-16">
//             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="inline-block mb-6">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl opacity-50 animate-pulse" />
//                 <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold flex items-center gap-2 shadow-xl">
//                   <Star className="w-4 h-4 md:w-5 md:h-5" />
//                   <span>Premium Selection</span>
//                   <Star className="w-4 h-4 md:w-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             {/* Заголовок — как в мастере */}
//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//                 font-serif italic leading-tight
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//                 drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                 lg:bg-gradient-to-r lg:from-[#7CFFFB] lg:via-[#22D3EE] lg:to-[#7CFFFB]
//                 lg:drop-shadow-[0_0_22px_rgba(34,211,238,0.6)]
//                 xl:bg-gradient-to-r xl:from-[#F5C518]/90 xl:via-[#FFD166]/90 xl:to-[#F5C518]/90
//                 xl:drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                 mb-3 md:mb-4
//               "
//             >
//               Выберите услугу
//             </motion.h1>

//             {/* === ТОЛЬКО ЭТО ИЗМЕНЕНО: добавлен шрифт brand-script (под «прописной») === */}
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="mx-auto max-w-2xl brand-script tracking-wide text-base md:text-lg brand-subtitle"
//             >
//               Создайте свой уникальный образ с нашими эксклюзивными премиум услугами
//             </motion.p>
//           </motion.div>

//           {/* Категории */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="flex flex-wrap gap-3 md:gap-4 justify-center mb-12 md:mb-16"
//           >
//             {categories.map((category, index) => {
//               const isActive = selectedCategory === category;
//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative px-6 md:px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
//                     isActive ? 'text-black' : 'text-gray-300 hover:text-white'
//                   }`}
//                 >
//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-2xl shadow-amber-500/50'
//                         : 'bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10'
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{categoryIcons[category] || '✨'}</span>
//                     {category}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* Группы и услуги */}
//           {filteredGroups.map((group, groupIndex) => (
//             <motion.div
//               key={group.id}
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: groupIndex * 0.08 + 0.6 }}
//               className="mb-16 md:mb-20"
//             >
//               {/* Заголовок группы */}
//               <div className="flex items-center gap-4 mb-6 md:mb-8">
//                 <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                 <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                   {group.title}
//                 </h2>
//                 <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//               </div>

//               {/* Сетка карточек */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
//                 <AnimatePresence mode="popLayout">
//                   {group.services.map((service, index) => {
//                     const isSelected = selectedServices.includes(service.id);
//                     const isHovered = hoveredCard === service.id;
//                     const price = service.priceCents ? formatPrice(service.priceCents) : 'По запросу';

//                     return (
//                       <motion.div
//                         key={service.id}
//                         layout
//                         initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.92 }}
//                         transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
//                         whileHover={{ y: -6, scale: 1.015 }}
//                         onHoverStart={() => setHoveredCard(service.id)}
//                         onHoverEnd={() => setHoveredCard(null)}
//                         onClick={() => toggleService(service.id)}
//                         className="group relative cursor-pointer"
//                       >
//                         {/* Подсветка */}
//                         <div
//                           className={`absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg ${
//                             isSelected
//                               ? 'bg-gradient-to-r from-amber-500/45 to-yellow-500/45'
//                               : 'bg-gradient-to-r from-amber-500/18 to-yellow-500/18'
//                           }`}
//                         />

//                         {/* Карточка */}
//                         <div
//                           className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
//                             isSelected
//                               ? 'bg-gradient-to-br from-amber-500/18 via-yellow-500/10 to-amber-500/18 border border-amber-500/40'
//                               : 'bg-white/5 backdrop-blur-xl border border-white/10'
//                           }`}
//                         >
//                           {/* Фон-акцент */}
//                           <div className="absolute inset-0 opacity-25">
//                             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
//                             <motion.div
//                               animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
//                               transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse' }}
//                               className="absolute inset-0"
//                               style={{
//                                 backgroundImage:
//                                   'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.12) 0%, transparent 50%)',
//                                 backgroundSize: '200% 200%',
//                               }}
//                             />
//                           </div>

//                           {/* Контент */}
//                           <div className="relative p-5 md:p-6">
//                             {/* Верхняя строка */}
//                             <div className="flex items-start justify-between mb-4">
//                               {/* Чекбокс */}
//                               <motion.div
//                                 initial={false}
//                                 animate={{ scale: isSelected ? 1.08 : 1, rotate: isSelected ? 360 : 0 }}
//                                 transition={{ type: 'spring', stiffness: 300 }}
//                                 className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
//                                   isSelected
//                                     ? 'bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-500 shadow-lg shadow-amber-500/40'
//                                     : 'border-white/30 backdrop-blur-sm'
//                                 }`}
//                               >
//                                 {isSelected && (
//                                   <motion.svg
//                                     initial={{ scale: 0, rotate: -180 }}
//                                     animate={{ scale: 1, rotate: 0 }}
//                                     className="w-4 h-4 text-black"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                     stroke="currentColor"
//                                   >
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                   </motion.svg>
//                                 )}
//                               </motion.div>

//                               {/* Бейдж */}
//                               <motion.div
//                                 animate={{ rotate: [0, 4, -4, 0] }}
//                                 transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
//                                 className="relative"
//                               >
//                                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-md opacity-50" />
//                                 <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-xl">
//                                   <Sparkles className="w-6 h-6 text-black" />
//                                 </div>
//                               </motion.div>
//                             </div>

//                             {/* Заголовок услуги */}
//                             <h3
//                               className={`text-lg md:text-xl font-bold mb-2 transition-all ${
//                                 isSelected || isHovered
//                                   ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400'
//                                   : 'text-white'
//                               }`}
//                             >
//                               {service.title}
//                             </h3>

//                             {/* Описание */}
//                             {service.description && (
//                               <p className="text-gray-400 text-xs md:text-sm mb-5 line-clamp-2 font-light">
//                                 {service.description}
//                               </p>
//                             )}

//                             {/* Низ карточки */}
//                             <div className="flex items-end justify-between">
//                               {/* Цена и длительность */}
//                               <div>
//                                 <div className="flex items-baseline gap-1.5 mb-0.5">
//                                   <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                                     {price}
//                                   </span>
//                                   <span className="text-lg md:text-xl font-bold text-amber-400">€</span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
//                                   <Zap className="w-4 h-4" />
//                                   <span>{service.durationMin} минут</span>
//                                 </div>
//                               </div>

//                               {/* Иконка справа */}
//                               <motion.div
//                                 animate={{ scale: isHovered ? 1 : 0.85, opacity: isHovered ? 1 : 0.6 }}
//                                 className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${
//                                   isSelected
//                                     ? 'bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/40'
//                                     : 'bg-white/5'
//                                 }`}
//                               >
//                                 <Award className={`w-7 h-7 ${isSelected ? 'text-black' : 'text-amber-500'}`} />
//                               </motion.div>
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Floating Footer: мобилка — sticky, tablet/desktop — fixed */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE sticky + safe area */}
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)' }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium">
//                           Выбрано услуг:{' '}
//                           <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400">€</span>
//                           <span className="text-base text-gray-500">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base flex items-center gap-3 shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* TABLET/DESKTOP fixed */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium">
//                           Выбрано услуг:{' '}
//                           <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400">€</span>
//                           <span className="text-xl text-gray-500 ml-2">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         /* === добавлено ранее: фирменная подсветка для подзаголовков === */
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

//         /* === ДОБАВЛЕНО СЕЙЧАС: фирменный «прописной» шрифт === */
//         .brand-script{
//           font-family: var(--brand-script, 'YourBrandScript', 'Cormorant Infant', 'Playfair Display', serif);
//           font-style: italic;
//           font-weight: 600;
//           letter-spacing: .02em;
//           -webkit-font-smoothing: antialiased;
//           -moz-osx-font-smoothing: grayscale;
//         }
//       `}</style>
//     </div>
//   );
// }




// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { Sparkles, Star, Zap, Award } from 'lucide-react';

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// // без any
// const categoryIcons: Record<string, string> = {
//   Маникюр: '💅',
//   Стрижка: '✂️',
//   Все: '✨',
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>('Все');
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch('/api/booking/services', { method: 'POST' });
//         if (!response.ok) throw new Error('Ошибка загрузки услуг');
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching services:', err);
//         setError('Не удалось загрузить услуги');
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories = ['Все', ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === 'Все' ? groups : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append('s', id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string => (cents / 100).toLocaleString('ru-RU');

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
//         <div className="booking-progress-wrap">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <div className="flex items-center justify-center min-h-screen">
//           <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
//             <div className="w-24 h-24 relative">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-amber-500 animate-pulse" />
//             </div>
//             <p className="text-white/60 text-center mt-8 font-medium">Загрузка премиум услуг...</p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
//         <div className="booking-progress-wrap">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
//           <div className="text-6xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/50"
//           >
//             Попробовать снова
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 relative overflow-hidden">
//       {/* Закреплённый прогресс-бар с золотой линией (см. booking/layout.tsx) */}
//       <div className="booking-progress-wrap">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//       </div>

//       {/* Animated background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
//           transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
//           className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//         <motion.div
//           animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
//           transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
//           className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//       </div>

//       {/* Контент с базовым отступом от прогресс-бара (см. booking/layout.tsx) */}
//       <div className="booking-content relative pt-28 md:pt-32 pb-28 md:pb-32 px-4">
//         <div className="mx-auto w-full max-w-screen-2xl">
//           {/* Hero */}
//           <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 md:mb-16">
//             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="inline-block mb-6">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl opacity-50 animate-pulse" />
//                 <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold flex items-center gap-2 shadow-xl">
//                   <Star className="w-4 h-4 md:w-5 md:h-5" />
//                   <span>Premium Selection</span>
//                   <Star className="w-4 h-4 md:w-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             {/* Заголовок — как в мастере */}
//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//                 font-serif italic leading-tight
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//                 drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                 lg:bg-gradient-to-r lg:from-[#7CFFFB] lg:via-[#22D3EE] lg:to-[#7CFFFB]
//                 lg:drop-shadow-[0_0_22px_rgba(34,211,238,0.6)]
//                 xl:bg-gradient-to-r xl:from-[#F5C518]/90 xl:via-[#FFD166]/90 xl:to-[#F5C518]/90
//                 xl:drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                 mb-3 md:mb-4
//               "
//             >
//               Выберите услугу
//             </motion.h1>

//             {/* === ТОЛЬКО ЭТА СТРОКА ИЗМЕНЕНА: фирменный градиент и шрифт === */}
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="mx-auto max-w-2xl font-serif tracking-wide text-base md:text-lg brand-subtitle"
//             >
//               Создайте свой уникальный образ с нашими эксклюзивными премиум услугами
//             </motion.p>
//           </motion.div>

//           {/* Категории */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="flex flex-wrap gap-3 md:gap-4 justify-center mb-12 md:mb-16"
//           >
//             {categories.map((category, index) => {
//               const isActive = selectedCategory === category;
//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative px-6 md:px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
//                     isActive ? 'text-black' : 'text-gray-300 hover:text-white'
//                   }`}
//                 >
//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-2xl shadow-amber-500/50'
//                         : 'bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10'
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{categoryIcons[category] || '✨'}</span>
//                     {category}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* Группы и услуги */}
//           {filteredGroups.map((group, groupIndex) => (
//             <motion.div
//               key={group.id}
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: groupIndex * 0.08 + 0.6 }}
//               className="mb-16 md:mb-20"
//             >
//               {/* Заголовок группы */}
//               <div className="flex items-center gap-4 mb-6 md:mb-8">
//                 <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                 <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                   {group.title}
//                 </h2>
//                 <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//               </div>

//               {/* Сетка карточек */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
//                 <AnimatePresence mode="popLayout">
//                   {group.services.map((service, index) => {
//                     const isSelected = selectedServices.includes(service.id);
//                     const isHovered = hoveredCard === service.id;
//                     const price = service.priceCents ? formatPrice(service.priceCents) : 'По запросу';

//                     return (
//                       <motion.div
//                         key={service.id}
//                         layout
//                         initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.92 }}
//                         transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
//                         whileHover={{ y: -6, scale: 1.015 }}
//                         onHoverStart={() => setHoveredCard(service.id)}
//                         onHoverEnd={() => setHoveredCard(null)}
//                         onClick={() => toggleService(service.id)}
//                         className="group relative cursor-pointer"
//                       >
//                         {/* Подсветка */}
//                         <div
//                           className={`absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg ${
//                             isSelected
//                               ? 'bg-gradient-to-r from-amber-500/45 to-yellow-500/45'
//                               : 'bg-gradient-to-r from-amber-500/18 to-yellow-500/18'
//                           }`}
//                         />

//                         {/* Карточка */}
//                         <div
//                           className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
//                             isSelected
//                               ? 'bg-gradient-to-br from-amber-500/18 via-yellow-500/10 to-amber-500/18 border border-amber-500/40'
//                               : 'bg-white/5 backdrop-blur-xl border border-white/10'
//                           }`}
//                         >
//                           {/* Фон-акцент */}
//                           <div className="absolute inset-0 opacity-25">
//                             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
//                             <motion.div
//                               animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
//                               transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse' }}
//                               className="absolute inset-0"
//                               style={{
//                                 backgroundImage:
//                                   'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.12) 0%, transparent 50%)',
//                                 backgroundSize: '200% 200%',
//                               }}
//                             />
//                           </div>

//                           {/* Контент */}
//                           <div className="relative p-5 md:p-6">
//                             {/* Верхняя строка */}
//                             <div className="flex items-start justify-between mb-4">
//                               {/* Чекбокс */}
//                               <motion.div
//                                 initial={false}
//                                 animate={{ scale: isSelected ? 1.08 : 1, rotate: isSelected ? 360 : 0 }}
//                                 transition={{ type: 'spring', stiffness: 300 }}
//                                 className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
//                                   isSelected
//                                     ? 'bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-500 shadow-lg shadow-amber-500/40'
//                                     : 'border-white/30 backdrop-blur-sm'
//                                 }`}
//                               >
//                                 {isSelected && (
//                                   <motion.svg
//                                     initial={{ scale: 0, rotate: -180 }}
//                                     animate={{ scale: 1, rotate: 0 }}
//                                     className="w-4 h-4 text-black"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                     stroke="currentColor"
//                                   >
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                   </motion.svg>
//                                 )}
//                               </motion.div>

//                               {/* Бейдж */}
//                               <motion.div
//                                 animate={{ rotate: [0, 4, -4, 0] }}
//                                 transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
//                                 className="relative"
//                               >
//                                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-md opacity-50" />
//                                 <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-xl">
//                                   <Sparkles className="w-6 h-6 text-black" />
//                                 </div>
//                               </motion.div>
//                             </div>

//                             {/* Заголовок услуги */}
//                             <h3
//                               className={`text-lg md:text-xl font-bold mb-2 transition-all ${
//                                 isSelected || isHovered
//                                   ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400'
//                                   : 'text-white'
//                               }`}
//                             >
//                               {service.title}
//                             </h3>

//                             {/* Описание */}
//                             {service.description && (
//                               <p className="text-gray-400 text-xs md:text-sm mb-5 line-clamp-2 font-light">
//                                 {service.description}
//                               </p>
//                             )}

//                             {/* Низ карточки */}
//                             <div className="flex items-end justify-between">
//                               {/* Цена и длительность */}
//                               <div>
//                                 <div className="flex items-baseline gap-1.5 mb-0.5">
//                                   <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                                     {price}
//                                   </span>
//                                   <span className="text-lg md:text-xl font-bold text-amber-400">€</span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
//                                   <Zap className="w-4 h-4" />
//                                   <span>{service.durationMin} минут</span>
//                                 </div>
//                               </div>

//                               {/* Иконка справа */}
//                               <motion.div
//                                 animate={{ scale: isHovered ? 1 : 0.85, opacity: isHovered ? 1 : 0.6 }}
//                                 className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${
//                                   isSelected
//                                     ? 'bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/40'
//                                     : 'bg-white/5'
//                                 }`}
//                               >
//                                 <Award className={`w-7 h-7 ${isSelected ? 'text-black' : 'text-amber-500'}`} />
//                               </motion.div>
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Floating Footer: мобилка — sticky, tablet/desktop — fixed */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE sticky + safe area */}
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)' }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium">
//                           Выбрано услуг:{' '}
//                           <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400">€</span>
//                           <span className="text-base text-gray-500">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base flex items-center gap-3 shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* TABLET/DESKTOP fixed */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium">
//                           Выбрано услуг:{' '}
//                           <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400">€</span>
//                           <span className="text-xl text-gray-500 ml-2">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }

//         /* === добавлено: фирменная подсветка для подзаголовков (как на мастере) === */
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
//     </div>
//   );
// }




//-------------всё работает добавляю дизайн
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import PremiumProgressBar from '@/components/PremiumProgressBar';
// import { Sparkles, Star, Zap, Award } from 'lucide-react';

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// // без any
// const categoryIcons: Record<string, string> = {
//   Маникюр: '💅',
//   Стрижка: '✂️',
//   Все: '✨',
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>('Все');
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch('/api/booking/services', { method: 'POST' });
//         if (!response.ok) throw new Error('Ошибка загрузки услуг');
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching services:', err);
//         setError('Не удалось загрузить услуги');
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories = ['Все', ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === 'Все' ? groups : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents ?? 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append('s', id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string => (cents / 100).toLocaleString('ru-RU');

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
//         <div className="booking-progress-wrap">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <div className="flex items-center justify-center min-h-screen">
//           <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
//             <div className="w-24 h-24 relative">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-amber-500 animate-pulse" />
//             </div>
//             <p className="text-white/60 text-center mt-8 font-medium">Загрузка премиум услуг...</p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
//         <div className="booking-progress-wrap">
//           <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         </div>

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
//           <div className="text-6xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/50"
//           >
//             Попробовать снова
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 relative overflow-hidden">
//       {/* Закреплённый прогресс-бар с золотой линией (см. booking/layout.tsx) */}
//       <div className="booking-progress-wrap">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//       </div>

//       {/* Animated background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
//           transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
//           className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//         <motion.div
//           animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
//           transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
//           className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//       </div>

//       {/* Контент с базовым отступом от прогресс-бара (см. booking/layout.tsx) */}
//       <div className="booking-content relative pt-28 md:pt-32 pb-28 md:pb-32 px-4">
//         <div className="mx-auto w-full max-w-screen-2xl">
//           {/* Hero */}
//           <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 md:mb-16">
//             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="inline-block mb-6">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl opacity-50 animate-pulse" />
//                 <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold flex items-center gap-2 shadow-xl">
//                   <Star className="w-4 h-4 md:w-5 md:h-5" />
//                   <span>Premium Selection</span>
//                   <Star className="w-4 h-4 md:w-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             {/* Заголовок — как в мастере */}
//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//                 font-serif italic leading-tight
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//                 drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                 lg:bg-gradient-to-r lg:from-[#7CFFFB] lg:via-[#22D3EE] lg:to-[#7CFFFB]
//                 lg:drop-shadow-[0_0_22px_rgba(34,211,238,0.6)]
//                 xl:bg-gradient-to-r xl:from-[#F5C518]/90 xl:via-[#FFD166]/90 xl:to-[#F5C518]/90
//                 xl:drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                 mb-3 md:mb-4
//               "
//             >
//               Выберите услугу
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto font-light"
//             >
//               Создайте свой уникальный образ с нашими эксклюзивными премиум услугами
//             </motion.p>
//           </motion.div>

//           {/* Категории */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="flex flex-wrap gap-3 md:gap-4 justify-center mb-12 md:mb-16"
//           >
//             {categories.map((category, index) => {
//               const isActive = selectedCategory === category;
//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative px-6 md:px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
//                     isActive ? 'text-black' : 'text-gray-300 hover:text-white'
//                   }`}
//                 >
//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-2xl shadow-amber-500/50'
//                         : 'bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10'
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{categoryIcons[category] || '✨'}</span>
//                     {category}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* Группы и услуги */}
//           {filteredGroups.map((group, groupIndex) => (
//             <motion.div
//               key={group.id}
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: groupIndex * 0.08 + 0.6 }}
//               className="mb-16 md:mb-20"
//             >
//               {/* Заголовок группы */}
//               <div className="flex items-center gap-4 mb-6 md:mb-8">
//                 <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                 <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                   {group.title}
//                 </h2>
//                 <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//               </div>

//               {/* Сетка карточек: 1-2-3-4-5 */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
//                 <AnimatePresence mode="popLayout">
//                   {group.services.map((service, index) => {
//                     const isSelected = selectedServices.includes(service.id);
//                     const isHovered = hoveredCard === service.id;
//                     const price = service.priceCents ? formatPrice(service.priceCents) : 'По запросу';

//                     return (
//                       <motion.div
//                         key={service.id}
//                         layout
//                         initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.92 }}
//                         transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
//                         whileHover={{ y: -6, scale: 1.015 }}
//                         onHoverStart={() => setHoveredCard(service.id)}
//                         onHoverEnd={() => setHoveredCard(null)}
//                         onClick={() => toggleService(service.id)}
//                         className="group relative cursor-pointer"
//                       >
//                         {/* Подсветка */}
//                         <div
//                           className={`absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg ${
//                             isSelected
//                               ? 'bg-gradient-to-r from-amber-500/45 to-yellow-500/45'
//                               : 'bg-gradient-to-r from-amber-500/18 to-yellow-500/18'
//                           }`}
//                         />

//                         {/* Карточка (компактнее) */}
//                         <div
//                           className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
//                             isSelected
//                               ? 'bg-gradient-to-br from-amber-500/18 via-yellow-500/10 to-amber-500/18 border border-amber-500/40'
//                               : 'bg-white/5 backdrop-blur-xl border border-white/10'
//                           }`}
//                         >
//                           {/* Фон-акцент */}
//                           <div className="absolute inset-0 opacity-25">
//                             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
//                             <motion.div
//                               animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
//                               transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse' }}
//                               className="absolute inset-0"
//                               style={{
//                                 backgroundImage:
//                                   'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.12) 0%, transparent 50%)',
//                                 backgroundSize: '200% 200%',
//                               }}
//                             />
//                           </div>

//                           {/* Контент */}
//                           <div className="relative p-5 md:p-6">
//                             {/* Верхняя строка */}
//                             <div className="flex items-start justify-between mb-4">
//                               {/* Чекбокс */}
//                               <motion.div
//                                 initial={false}
//                                 animate={{ scale: isSelected ? 1.08 : 1, rotate: isSelected ? 360 : 0 }}
//                                 transition={{ type: 'spring', stiffness: 300 }}
//                                 className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
//                                   isSelected
//                                     ? 'bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-500 shadow-lg shadow-amber-500/40'
//                                     : 'border-white/30 backdrop-blur-sm'
//                                 }`}
//                               >
//                                 {isSelected && (
//                                   <motion.svg
//                                     initial={{ scale: 0, rotate: -180 }}
//                                     animate={{ scale: 1, rotate: 0 }}
//                                     className="w-4 h-4 text-black"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                     stroke="currentColor"
//                                   >
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                   </motion.svg>
//                                 )}
//                               </motion.div>

//                               {/* Бейдж */}
//                               <motion.div
//                                 animate={{ rotate: [0, 4, -4, 0] }}
//                                 transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
//                                 className="relative"
//                               >
//                                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-md opacity-50" />
//                                 <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-xl">
//                                   <Sparkles className="w-6 h-6 text-black" />
//                                 </div>
//                               </motion.div>
//                             </div>

//                             {/* Заголовок услуги */}
//                             <h3
//                               className={`text-lg md:text-xl font-bold mb-2 transition-all ${
//                                 isSelected || isHovered
//                                   ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400'
//                                   : 'text-white'
//                               }`}
//                             >
//                               {service.title}
//                             </h3>

//                             {/* Описание */}
//                             {service.description && (
//                               <p className="text-gray-400 text-xs md:text-sm mb-5 line-clamp-2 font-light">
//                                 {service.description}
//                               </p>
//                             )}

//                             {/* Низ карточки */}
//                             <div className="flex items-end justify-between">
//                               {/* Цена и длительность */}
//                               <div>
//                                 <div className="flex items-baseline gap-1.5 mb-0.5">
//                                   <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                                     {price}
//                                   </span>
//                                   <span className="text-lg md:text-xl font-bold text-amber-400">€</span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
//                                   <Zap className="w-4 h-4" />
//                                   <span>{service.durationMin} минут</span>
//                                 </div>
//                               </div>

//                               {/* Иконка справа */}
//                               <motion.div
//                                 animate={{ scale: isHovered ? 1 : 0.85, opacity: isHovered ? 1 : 0.6 }}
//                                 className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${
//                                   isSelected
//                                     ? 'bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/40'
//                                     : 'bg-white/5'
//                                 }`}
//                               >
//                                 <Award className={`w-7 h-7 ${isSelected ? 'text-black' : 'text-amber-500'}`} />
//                               </motion.div>
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Floating Footer: мобилка — sticky, tablet/desktop — fixed */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE sticky + safe area */}
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.25rem)' }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium">
//                           Выбрано услуг:{' '}
//                           <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400">€</span>
//                           <span className="text-base text-gray-500">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base flex items-center gap-3 shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* TABLET/DESKTOP fixed */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium">
//                           Выбрано услуг:{' '}
//                           <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400">€</span>
//                           <span className="text-xl text-gray-500 ml-2">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }
//       `}</style>
//     </div>
//   );
// }



//--------делаем отступы хедера
// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// // Иконки для категорий — без any
// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
//   Все: "✨",
// };

// export default function ServicesPage(): React.JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("Все");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async (): Promise<void> => {
//       try {
//         setLoading(true);
//         const response = await fetch("/api/booking/services", { method: "POST" });
//         if (!response.ok) throw new Error("Ошибка загрузки услуг");
//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setError("Не удалось загрузить услуги");
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories = ["Все", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "Все"
//       ? groups
//       : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string): void => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId)
//         ? prev.filter((id) => id !== serviceId)
//         : [...prev, serviceId]
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents || 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = (): void => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number): string => {
//     return (cents / 100).toLocaleString("ru-RU");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         <div className="flex items-center justify-center min-h-screen">
//           <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative">
//             <div className="w-24 h-24 relative">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse" />
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
//               <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-amber-500 animate-pulse" />
//             </div>
//             <p className="text-white/60 text-center mt-8 font-medium">Загрузка премиум услуг...</p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4">
//           <div className="text-6xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/50"
//           >
//             Попробовать снова
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 relative overflow-hidden">
//       <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />

//       {/* Animated Background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//           className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//         <motion.div
//           animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
//           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//           className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//       </div>

//       <div className="relative pt-28 md:pt-32 pb-28 md:pb-32 px-4">
//         <div className="mx-auto w-full max-w-screen-2xl">
//           {/* Hero Section */}
//           <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 md:mb-16">
//             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="inline-block mb-6">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl opacity-50 animate-pulse" />
//                 <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold flex items-center gap-2 shadow-xl">
//                   <Star className="w-4 h-4 md:w-5 md:h-5" />
//                   <span>Premium Selection</span>
//                   <Star className="w-4 h-4 md:w-5 md:h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             {/* Заголовок — как в мастере */}
//             <motion.h1
//               initial={{ opacity: 0, y: 18 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.28 }}
//               className="
//                 text-4xl md:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl
//                 font-serif italic leading-tight
//                 text-transparent bg-clip-text
//                 bg-gradient-to-r from-[#F5C518]/90 via-[#FFD166]/90 to-[#F5C518]/90
//                 drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                 lg:bg-gradient-to-r lg:from-[#7CFFFB] lg:via-[#22D3EE] lg:to-[#7CFFFB]
//                 lg:drop-shadow-[0_0_22px_rgba(34,211,238,0.6)]
//                 xl:bg-gradient-to-r xl:from-[#F5C518]/90 xl:via-[#FFD166]/90 xl:to-[#F5C518]/90
//                 xl:drop-shadow-[0_0_18px_rgba(245,197,24,0.35)]
//                 mb-3 md:mb-4
//               "
//             >
//               Выберите услугу
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.45 }}
//               className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto font-light"
//             >
//               Создайте свой уникальный образ с нашими эксклюзивными премиум услугами
//             </motion.p>
//           </motion.div>

//           {/* Categories Pills */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.55 }}
//             className="flex flex-wrap gap-3 md:gap-4 justify-center mb-12 md:mb-16"
//           >
//             {categories.map((category, index) => {
//               const isActive = selectedCategory === category;
//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.05 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.96 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`group relative px-6 md:px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
//                     isActive ? "text-black" : "text-gray-300 hover:text-white"
//                   }`}
//                 >
//                   <div
//                     className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-2xl shadow-amber-500/50"
//                         : "bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10"
//                     }`}
//                   />
//                   <span className="relative flex items-center gap-2">
//                     <span className="text-xl">{categoryIcons[category] || "✨"}</span>
//                     {category}
//                   </span>
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* Groups & Services */}
//           {filteredGroups.map((group, groupIndex) => (
//             <motion.div
//               key={group.id}
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: groupIndex * 0.08 + 0.6 }}
//               className="mb-16 md:mb-20"
//             >
//               {/* Group Title */}
//               <div className="flex items-center gap-4 mb-6 md:mb-8">
//                 <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//                 <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                   {group.title}
//                 </h2>
//                 <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
//               </div>

//               {/* Services Grid: 1-2-3-4-5 */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
//                 <AnimatePresence mode="popLayout">
//                   {group.services.map((service, index) => {
//                     const isSelected = selectedServices.includes(service.id);
//                     const isHovered = hoveredCard === service.id;
//                     const price = service.priceCents ? formatPrice(service.priceCents) : "По запросу";

//                     return (
//                       <motion.div
//                         key={service.id}
//                         layout
//                         initial={{ opacity: 0, scale: 0.9, y: 16 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.92 }}
//                         transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 26 }}
//                         whileHover={{ y: -6, scale: 1.015 }}
//                         onHoverStart={() => setHoveredCard(service.id)}
//                         onHoverEnd={() => setHoveredCard(null)}
//                         onClick={() => toggleService(service.id)}
//                         className="group relative cursor-pointer"
//                       >
//                         {/* Glow Effect */}
//                         <div
//                           className={`absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg ${
//                             isSelected
//                               ? "bg-gradient-to-r from-amber-500/45 to-yellow-500/45"
//                               : "bg-gradient-to-r from-amber-500/18 to-yellow-500/18"
//                           }`}
//                         />

//                         {/* Card (чуть компактнее) */}
//                         <div
//                           className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
//                             isSelected
//                               ? "bg-gradient-to-br from-amber-500/18 via-yellow-500/10 to-amber-500/18 border border-amber-500/40"
//                               : "bg-white/5 backdrop-blur-xl border border-white/10"
//                           }`}
//                         >
//                           {/* Background Accent */}
//                           <div className="absolute inset-0 opacity-25">
//                             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
//                             <motion.div
//                               animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
//                               transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
//                               className="absolute inset-0"
//                               style={{
//                                 backgroundImage:
//                                   "radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.12) 0%, transparent 50%)",
//                                 backgroundSize: "200% 200%",
//                               }}
//                             />
//                           </div>

//                           {/* Content */}
//                           <div className="relative p-5 md:p-6">
//                             {/* Top Row */}
//                             <div className="flex items-start justify-between mb-4">
//                               {/* Checkbox */}
//                               <motion.div
//                                 initial={false}
//                                 animate={{ scale: isSelected ? 1.08 : 1, rotate: isSelected ? 360 : 0 }}
//                                 transition={{ type: "spring", stiffness: 300 }}
//                                 className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
//                                   isSelected
//                                     ? "bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-500 shadow-lg shadow-amber-500/40"
//                                     : "border-white/30 backdrop-blur-sm"
//                                 }`}
//                               >
//                                 {isSelected && (
//                                   <motion.svg
//                                     initial={{ scale: 0, rotate: -180 }}
//                                     animate={{ scale: 1, rotate: 0 }}
//                                     className="w-4 h-4 text-black"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                     stroke="currentColor"
//                                   >
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                   </motion.svg>
//                                 )}
//                               </motion.div>

//                               {/* Badge */}
//                               <motion.div
//                                 animate={{ rotate: [0, 4, -4, 0] }}
//                                 transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
//                                 className="relative"
//                               >
//                                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-md opacity-50" />
//                                 <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-xl">
//                                   <Sparkles className="w-6 h-6 text-black" />
//                                 </div>
//                               </motion.div>
//                             </div>

//                             {/* Title */}
//                             <h3
//                               className={`text-lg md:text-xl font-bold mb-2 transition-all ${
//                                 isSelected || isHovered
//                                   ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400"
//                                   : "text-white"
//                               }`}
//                             >
//                               {service.title}
//                             </h3>

//                             {/* Description */}
//                             {service.description && (
//                               <p className="text-gray-400 text-xs md:text-sm mb-5 line-clamp-2 font-light">
//                                 {service.description}
//                               </p>
//                             )}

//                             {/* Bottom */}
//                             <div className="flex items-end justify-between">
//                               {/* Price & Duration */}
//                               <div>
//                                 <div className="flex items-baseline gap-1.5 mb-0.5">
//                                   <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                                     {price}
//                                   </span>
//                                   <span className="text-lg md:text-xl font-bold text-amber-400">€</span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
//                                   <Zap className="w-4 h-4" />
//                                   <span>{service.durationMin} минут</span>
//                                 </div>
//                               </div>

//                               {/* Icon */}
//                               <motion.div
//                                 animate={{ scale: isHovered ? 1 : 0.85, opacity: isHovered ? 1 : 0.6 }}
//                                 className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${
//                                   isSelected
//                                     ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/40"
//                                     : "bg-white/5"
//                                 }`}
//                               >
//                                 <Award className={`w-7 h-7 ${isSelected ? "text-black" : "text-amber-500"}`} />
//                               </motion.div>
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Floating Footer (моб. sticky + desktop fixed) */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <>
//             {/* MOBILE: sticky внутрь потока + safe-area */}
//             <motion.div
//               initial={{ y: 50, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 50, opacity: 0 }}
//               className="md:hidden sticky bottom-0 z-50 p-4"
//               style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.25rem)" }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-6">
//                     <div className="flex items-center justify-between gap-4">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-1 font-medium">
//                           Выбрано услуг:{" "}
//                           <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-3">
//                           <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-2xl font-bold text-amber-400">€</span>
//                           <span className="text-base text-gray-500">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.03 }}
//                         whileTap={{ scale: 0.97 }}
//                         onClick={handleContinue}
//                         className="relative group shrink-0"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-7 py-4 rounded-2xl font-bold text-base flex items-center gap-3 shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>

//             {/* DESKTOP/TABLET: fixed как раньше */}
//             <motion.div
//               initial={{ y: 100, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               exit={{ y: 100, opacity: 0 }}
//               className="hidden md:block fixed bottom-0 left-0 right-0 z-50 p-6"
//               style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
//             >
//               <div className="mx-auto w-full max-w-screen-2xl">
//                 <div className="relative">
//                   <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50" />
//                   <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                     <div className="flex items-center justify-between flex-wrap gap-6">
//                       <div>
//                         <div className="text-sm text-gray-400 mb-2 font-medium">
//                           Выбрано услуг:{" "}
//                           <span className="text-amber-400 font-bold">{selectedServices.length}</span>
//                         </div>
//                         <div className="flex items-baseline gap-4">
//                           <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                             {formatPrice(totalPrice)}
//                           </span>
//                           <span className="text-3xl font-bold text-amber-400">€</span>
//                           <span className="text-xl text-gray-500 ml-2">• {totalDuration} мин</span>
//                         </div>
//                       </div>

//                       <motion.button
//                         whileHover={{ scale: 1.05 }}
//                         whileTap={{ scale: 0.95 }}
//                         onClick={handleContinue}
//                         className="relative group"
//                       >
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
//                         <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
//                           <span>Продолжить</span>
//                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
//                           </svg>
//                         </div>
//                       </motion.button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%, 100% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//         }
//         .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease infinite; }
//         .bg-300\% { background-size: 300% 300%; }
//       `}</style>
//     </div>
//   );
// }




//---------работал но новая адаптация 04/11
// //src/app/booking/(steps)/services/page.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import PremiumProgressBar from "@/components/PremiumProgressBar";
// import { Sparkles, Star, Zap, Award } from "lucide-react";

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: "services", label: "Услуга", icon: "✨" },
//   { id: "master", label: "Мастер", icon: "👤" },
//   { id: "calendar", label: "Дата", icon: "📅" },
//   { id: "client", label: "Данные", icon: "📝" },
//   { id: "verify", label: "Проверка", icon: "✓" },
//   { id: "payment", label: "Оплата", icon: "💳" },
// ];

// // Иконки для категорий — без any
// const categoryIcons: Record<string, string> = {
//   Маникюр: "💅",
//   Стрижка: "✂️",
//   Все: "✨",
// };

// export default function ServicesPage() {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("Все");
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [hoveredCard, setHoveredCard] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch("/api/booking/services", {
//           method: "POST",
//         });

//         if (!response.ok) throw new Error("Ошибка загрузки услуг");

//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error("Error fetching services:", err);
//         setError("Не удалось загрузить услуги");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServices();
//   }, []);

//   const allServices = groups.flatMap((g) => g.services);
//   const categories = ["Все", ...groups.map((g) => g.title)];

//   const filteredGroups =
//     selectedCategory === "Все"
//       ? groups
//       : groups.filter((g) => g.title === selectedCategory);

//   const toggleService = (serviceId: string) => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId)
//         ? prev.filter((id) => id !== serviceId)
//         : [...prev, serviceId]
//     );
//   };

//   const totalPrice = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents || 0), 0);

//   const totalDuration = allServices
//     .filter((s) => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = () => {
//     const params = new URLSearchParams();
//     selectedServices.forEach((id) => params.append("s", id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number) => {
//     return (cents / 100).toLocaleString("ru-RU");
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />

//         <div className="flex items-center justify-center min-h-screen">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative"
//           >
//             <div className="w-24 h-24 relative">
//               <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse"></div>
//               <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
//               <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-amber-500 animate-pulse" />
//             </div>
//             <p className="text-white/60 text-center mt-8 font-medium">
//               Загрузка премиум услуг...
//             </p>
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-center px-4"
//         >
//           <div className="text-6xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/50"
//           >
//             Попробовать снова
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 relative overflow-hidden">
//       <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />

//       {/* Animated Background */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           animate={{
//             scale: [1, 1.2, 1],
//             opacity: [0.3, 0.5, 0.3],
//           }}
//           transition={{
//             duration: 8,
//             repeat: Infinity,
//             ease: "easeInOut",
//           }}
//           className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//         <motion.div
//           animate={{
//             scale: [1, 1.3, 1],
//             opacity: [0.2, 0.4, 0.2],
//           }}
//           transition={{
//             duration: 10,
//             repeat: Infinity,
//             ease: "easeInOut",
//             delay: 1,
//           }}
//           className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-500/20 via-transparent to-transparent rounded-full blur-3xl"
//         />
//       </div>

//       <div className="relative pt-32 pb-32 px-4">
//         <div className="container mx-auto max-w-7xl">
//           {/* Hero Section */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-16"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//               className="inline-block mb-6"
//             >
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
//                 <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl">
//                   <Star className="w-5 h-5" />
//                   <span>Premium Selection</span>
//                   <Star className="w-5 h-5" />
//                 </div>
//               </div>
//             </motion.div>

//             <motion.h1
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="text-6xl md:text-8xl font-black mb-6 leading-tight"
//             >
//               <span className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent animate-gradient bg-300%">
//                 Выберите
//               </span>
//               <br />
//               <span className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent animate-gradient bg-300%">
//                 услугу
//               </span>
//             </motion.h1>

//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.5 }}
//               className="text-xl text-gray-400 max-w-2xl mx-auto font-light"
//             >
//               Создайте свой уникальный образ с нашими эксклюзивными премиум
//               услугами
//             </motion.p>
//           </motion.div>

//           {/* Categories Pills */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="flex flex-wrap gap-4 justify-center mb-16"
//           >
//             {categories.map((category, index) => {
//               const isActive = selectedCategory === category;
//               return (
//                 <motion.button
//                   key={category}
//                   initial={{ opacity: 0, scale: 0.8 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.1 * index }}
//                   whileHover={{ scale: 1.05, y: -2 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`
//                     group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300
//                     ${
//                       isActive ? "text-black" : "text-gray-400 hover:text-white"
//                     }
//                   `}
//                 >
//                   {/* Glassmorphism background */}
//                   <div
//                     className={`
//                     absolute inset-0 rounded-2xl transition-all duration-300
//                     ${
//                       isActive
//                         ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-2xl shadow-amber-500/50"
//                         : "bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10"
//                     }
//                   `}
//                   ></div>

//                   <span className="relative flex items-center gap-2">
//                     <span className="text-2xl">
//                       {categoryIcons[category] || "✨"}
//                     </span>
//                     {category}
//                   </span>

//                   {isActive && (
//                     <motion.div
//                       layoutId="activeCategory"
//                       className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl -z-10"
//                       transition={{
//                         type: "spring",
//                         stiffness: 300,
//                         damping: 30,
//                       }}
//                     />
//                   )}
//                 </motion.button>
//               );
//             })}
//           </motion.div>

//           {/* Services Grid */}
//           {filteredGroups.map((group, groupIndex) => (
//             <motion.div
//               key={group.id}
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: groupIndex * 0.1 + 0.7 }}
//               className="mb-20"
//             >
//               {/* Group Title */}
//               <div className="flex items-center gap-4 mb-8">
//                 <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
//                 <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                   {group.title}
//                 </h2>
//                 <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
//               </div>

//               {/* Services Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                 <AnimatePresence mode="popLayout">
//                   {group.services.map((service, index) => {
//                     const isSelected = selectedServices.includes(service.id);
//                     const isHovered = hoveredCard === service.id;
//                     const price = service.priceCents
//                       ? formatPrice(service.priceCents)
//                       : "По запросу";

//                     return (
//                       <motion.div
//                         key={service.id}
//                         layout
//                         initial={{ opacity: 0, scale: 0.9, y: 20 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.9 }}
//                         transition={{
//                           delay: index * 0.05,
//                           type: "spring",
//                           stiffness: 300,
//                           damping: 25,
//                         }}
//                         whileHover={{ y: -8, scale: 1.02 }}
//                         onHoverStart={() => setHoveredCard(service.id)}
//                         onHoverEnd={() => setHoveredCard(null)}
//                         onClick={() => toggleService(service.id)}
//                         className="group relative cursor-pointer"
//                       >
//                         {/* Glow Effect */}
//                         <div
//                           className={`
//                           absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl
//                           ${
//                             isSelected
//                               ? "bg-gradient-to-r from-amber-500/50 to-yellow-500/50"
//                               : "bg-gradient-to-r from-amber-500/20 to-yellow-500/20"
//                           }
//                         `}
//                         ></div>

//                         {/* Card */}
//                         <div
//                           className={`
//                           relative rounded-3xl overflow-hidden transition-all duration-500
//                           ${
//                             isSelected
//                               ? "bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-2 border-amber-500/50"
//                               : "bg-white/5 backdrop-blur-xl border border-white/10"
//                           }
//                         `}
//                         >
//                           {/* Animated Background Pattern */}
//                           <div className="absolute inset-0 opacity-30">
//                             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
//                             <motion.div
//                               animate={{
//                                 backgroundPosition: ["0% 0%", "100% 100%"],
//                               }}
//                               transition={{
//                                 duration: 20,
//                                 repeat: Infinity,
//                                 repeatType: "reverse",
//                               }}
//                               className="absolute inset-0"
//                               style={{
//                                 backgroundImage:
//                                   "radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
//                                 backgroundSize: "200% 200%",
//                               }}
//                             />
//                           </div>

//                           {/* Content */}
//                           <div className="relative p-8">
//                             {/* Top Section */}
//                             <div className="flex items-start justify-between mb-6">
//                               {/* Checkbox */}
//                               <motion.div
//                                 initial={false}
//                                 animate={{
//                                   scale: isSelected ? 1.1 : 1,
//                                   rotate: isSelected ? 360 : 0,
//                                 }}
//                                 transition={{ type: "spring", stiffness: 300 }}
//                                 className={`
//                                   w-8 h-8 rounded-full border-2 flex items-center justify-center
//                                   ${
//                                     isSelected
//                                       ? "bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-500 shadow-lg shadow-amber-500/50"
//                                       : "border-white/30 backdrop-blur-sm"
//                                   }
//                                 `}
//                               >
//                                 {isSelected && (
//                                   <motion.svg
//                                     initial={{ scale: 0, rotate: -180 }}
//                                     animate={{ scale: 1, rotate: 0 }}
//                                     className="w-5 h-5 text-black"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                     stroke="currentColor"
//                                   >
//                                     <path
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                       strokeWidth={3}
//                                       d="M5 13l4 4L19 7"
//                                     />
//                                   </motion.svg>
//                                 )}
//                               </motion.div>

//                               {/* Badge */}
//                               <motion.div
//                                 animate={{
//                                   rotate: [0, 5, -5, 0],
//                                 }}
//                                 transition={{
//                                   duration: 2,
//                                   repeat: Infinity,
//                                   repeatDelay: 3,
//                                 }}
//                                 className="relative"
//                               >
//                                 <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-md opacity-50"></div>
//                                 <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-xl">
//                                   <Sparkles className="w-7 h-7 text-black" />
//                                 </div>
//                               </motion.div>
//                             </div>

//                             {/* Title */}
//                             <h3
//                               className={`
//                               text-2xl font-bold mb-3 transition-all duration-300
//                               ${
//                                 isSelected || isHovered
//                                   ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400"
//                                   : "text-white"
//                               }
//                             `}
//                             >
//                               {service.title}
//                             </h3>

//                             {/* Description */}
//                             {service.description && (
//                               <p className="text-gray-400 text-sm mb-6 line-clamp-2 font-light">
//                                 {service.description}
//                               </p>
//                             )}

//                             {/* Bottom Section */}
//                             <div className="flex items-end justify-between">
//                               {/* Price & Duration */}
//                               <div>
//                                 <div className="flex items-baseline gap-2 mb-1">
//                                   <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                                     {price}
//                                   </span>
//                                   <span className="text-2xl font-bold text-amber-400">
//                                     €
//                                   </span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-gray-500 text-sm">
//                                   <Zap className="w-4 h-4" />
//                                   <span>{service.durationMin} минут</span>
//                                 </div>
//                               </div>

//                               {/* Hover Icon */}
//                               <motion.div
//                                 animate={{
//                                   scale: isHovered ? 1 : 0.8,
//                                   opacity: isHovered ? 1 : 0.5,
//                                 }}
//                                 className={`
//                                   w-16 h-16 rounded-2xl flex items-center justify-center
//                                   ${
//                                     isSelected
//                                       ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
//                                       : "bg-white/5"
//                                   }
//                                 `}
//                               >
//                                 <Award
//                                   className={`w-8 h-8 ${
//                                     isSelected ? "text-black" : "text-amber-500"
//                                   }`}
//                                 />
//                               </motion.div>
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </AnimatePresence>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       {/* Floating Footer */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <motion.div
//             initial={{ y: 100, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 100, opacity: 0 }}
//             className="fixed bottom-0 left-0 right-0 z-50 p-6"
//           >
//             <div className="container mx-auto max-w-7xl">
//               <div className="relative">
//                 {/* Glow */}
//                 <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50"></div>

//                 {/* Content */}
//                 <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
//                   <div className="flex items-center justify-between flex-wrap gap-6">
//                     <div>
//                       <div className="text-sm text-gray-400 mb-2 font-medium">
//                         Выбрано услуг:{" "}
//                         <span className="text-amber-400 font-bold">
//                           {selectedServices.length}
//                         </span>
//                       </div>
//                       <div className="flex items-baseline gap-4">
//                         <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
//                           {formatPrice(totalPrice)}
//                         </span>
//                         <span className="text-3xl font-bold text-amber-400">
//                           €
//                         </span>
//                         <span className="text-xl text-gray-500 ml-2">
//                           • {totalDuration} мин
//                         </span>
//                       </div>
//                     </div>

//                     <motion.button
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       onClick={handleContinue}
//                       className="relative group"
//                     >
//                       <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
//                       <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
//                         <span>Продолжить</span>
//                         <motion.svg
//                           animate={{ x: [0, 5, 0] }}
//                           transition={{ duration: 1.5, repeat: Infinity }}
//                           className="w-6 h-6"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M13 7l5 5m0 0l-5 5m5-5H6"
//                           />
//                         </motion.svg>
//                       </div>
//                     </motion.button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <style jsx global>{`
//         @keyframes gradient {
//           0%,
//           100% {
//             background-position: 0% 50%;
//           }
//           50% {
//             background-position: 100% 50%;
//           }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient 3s ease infinite;
//         }
//         .bg-300\% {
//           background-size: 300% 300%;
//         }
//       `}</style>
//     </div>
//   );
// }

//----------работал но хочу лучше дизайн ниже 03/11----------
// //src/app/booking/(steps)/services/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import PremiumProgressBar from '@/components/PremiumProgressBar';

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// export default function ServicesPage() {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>('Все');
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch('/api/booking/services', {
//           method: 'POST',
//         });

//         if (!response.ok) {
//           throw new Error('Ошибка загрузки услуг');
//         }

//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching services:', err);
//         setError('Не удалось загрузить услуги');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServices();
//   }, []);

//   const allServices = groups.flatMap(g => g.services);
//   const categories = ['Все', ...groups.map(g => g.title)];

//   const filteredGroups = selectedCategory === 'Все'
//     ? groups
//     : groups.filter(g => g.title === selectedCategory);

//   const toggleService = (serviceId: string) => {
//     setSelectedServices(prev =>
//       prev.includes(serviceId)
//         ? prev.filter(id => id !== serviceId)
//         : [...prev, serviceId]
//     );
//   };

//   const totalPrice = allServices
//     .filter(s => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents || 0), 0);

//   const totalDuration = allServices
//     .filter(s => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = () => {
//     const params = new URLSearchParams();
//     selectedServices.forEach(id => params.append('s', id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number) => {
//     return (cents / 100).toLocaleString('ru-RU');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         <div className="pt-32">
//           <div className="animate-pulse text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//             Загрузка услуг...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         <div className="pt-32 text-center">
//           <div className="text-2xl text-red-400 mb-4">❌ {error}</div>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-3 bg-yellow-400 text-black rounded-full font-medium"
//           >
//             Попробовать снова
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white">
//       <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />

//       {/* Фоновые эффекты */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] animate-pulse"></div>
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
//       </div>

//       <div className="relative pt-32 pb-20 px-4">
//         <div className="container mx-auto max-w-7xl">
//           {/* Заголовок */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-12"
//           >
//             <h1 className="text-5xl md:text-6xl font-bold mb-4">
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
//                 Выберите услугу
//               </span>
//             </h1>
//             <p className="text-xl text-white/60">
//               Создайте свой идеальный образ с нашими премиум услугами
//             </p>
//           </motion.div>

//           {/* Категории */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="flex flex-wrap gap-3 justify-center mb-12"
//           >
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => setSelectedCategory(category)}
//                 className={`
//                   px-6 py-3 rounded-full font-medium transition-all duration-300
//                   ${selectedCategory === category
//                     ? 'bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]'
//                     : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
//                   }
//                 `}
//               >
//                 {category}
//               </button>
//             ))}
//           </motion.div>

//           {/* Группы услуг */}
//           {filteredGroups.map((group, groupIndex) => (
//             <div key={group.id} className="mb-12">
//               <motion.h2
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: groupIndex * 0.1 }}
//                 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600"
//               >
//                 {group.title}
//               </motion.h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 <AnimatePresence mode="popLayout">
//                   {group.services.map((service, index) => {
//                     const isSelected = selectedServices.includes(service.id);
//                     const price = service.priceCents ? formatPrice(service.priceCents) : 'По запросу';

//                     return (
//                       <motion.div
//                         key={service.id}
//                         layout
//                         initial={{ opacity: 0, scale: 0.9 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         exit={{ opacity: 0, scale: 0.9 }}
//                         transition={{ delay: index * 0.05 }}
//                         onClick={() => toggleService(service.id)}
//                         className={`
//                           group relative cursor-pointer rounded-3xl overflow-hidden
//                           transition-all duration-500
//                           ${isSelected
//                             ? 'bg-gradient-to-br from-yellow-400/20 to-amber-600/20 border-2 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.3)]'
//                             : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
//                           }
//                         `}
//                       >
//                         {/* Чекбокс */}
//                         <div className="absolute top-4 left-4 z-10">
//                           <div className={`
//                             w-6 h-6 rounded-full border-2 flex items-center justify-center
//                             transition-all duration-300
//                             ${isSelected
//                               ? 'bg-gradient-to-br from-yellow-400 to-amber-600 border-yellow-400'
//                               : 'border-white/30 bg-white/5'
//                             }
//                           `}>
//                             {isSelected && (
//                               <motion.svg
//                                 initial={{ scale: 0 }}
//                                 animate={{ scale: 1 }}
//                                 className="w-4 h-4 text-black"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                                 stroke="currentColor"
//                               >
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                               </motion.svg>
//                             )}
//                           </div>
//                         </div>

//                         <div className="p-6 pt-12">
//                           <h3 className="text-xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-amber-600 transition-all duration-300">
//                             {service.title}
//                           </h3>

//                           {service.description && (
//                             <p className="text-white/60 text-sm mb-4 line-clamp-2">
//                               {service.description}
//                             </p>
//                           )}

//                           <div className="flex items-center justify-between">
//                             <div>
//                               <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//                                 {price} €
//                               </div>
//                               <div className="text-sm text-white/40">
//                                 {service.durationMin} мин
//                               </div>
//                             </div>

//                             <div className={`
//                               w-12 h-12 rounded-full flex items-center justify-center
//                               transition-all duration-300
//                               ${isSelected
//                                 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_15px_rgba(255,215,0,0.4)]'
//                                 : 'bg-white/5'
//                               }
//                             `}>
//                               <span className="text-2xl">✨</span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-600/0 group-hover:from-yellow-400/5 group-hover:to-amber-600/5 transition-all duration-500 pointer-events-none"></div>
//                       </motion.div>
//                     );
//                   })}
//                 </AnimatePresence>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Фиксированная нижняя панель */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <motion.div
//             initial={{ y: 100, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 100, opacity: 0 }}
//             className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 p-6"
//           >
//             <div className="container mx-auto max-w-7xl flex items-center justify-between flex-wrap gap-4">
//               <div>
//                 <div className="text-sm text-white/60 mb-1">
//                   Выбрано услуг: {selectedServices.length}
//                 </div>
//                 <div className="flex items-baseline gap-3">
//                   <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//                     {formatPrice(totalPrice)} €
//                   </div>
//                   <div className="text-white/60">
//                     {totalDuration} мин
//                   </div>
//                 </div>
//               </div>

//               <button
//                 onClick={handleContinue}
//                 className="
//                   px-8 py-4 rounded-full font-bold text-lg
//                   bg-gradient-to-r from-yellow-400 to-amber-600
//                   text-black shadow-[0_0_30px_rgba(255,215,0,0.5)]
//                   hover:shadow-[0_0_40px_rgba(255,215,0,0.7)]
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

//----------работал но старый дизайн ниже 03/11----------
// //src/app/booking/(steps)/services/page.tsx
// 'use client';

// import * as React from 'react';
// import { JSX } from 'react';
// import { useRouter } from 'next/navigation';
// import { ShoppingBag, ChevronRight, AlertTriangle } from 'lucide-react';

// type Service = {
//   id: string;
//   title: string;
//   description?: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string | null;
// };

// type Group = {
//   id: string;
//   title: string;
//   services: Service[];
// };

// type Promotion = {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// };

// type Payload = {
//   groups: Group[];
//   promotions: Promotion[];
// };

// function formatPriceEUR(cents: number): string {
//   return new Intl.NumberFormat('de-DE', {
//     style: 'currency',
//     currency: 'EUR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(cents / 100);
// }

// function formatMinutes(min: number): string {
//   return `${min} мин`;
// }

// function applyBestDiscount(cents: number, promotions: Promotion[]): number {
//   const best = promotions
//     .filter(p => p.isGlobal && p.percent > 0)
//     .reduce<number>((acc, p) => Math.max(acc, p.percent), 0);
//   if (!best) return cents;
//   const discounted = Math.round(cents * (100 - best) / 100);
//   return Math.max(0, discounted);
// }

// export default function ServicesPage(): JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = React.useState<Group[]>([]);
//   const [promotions, setPromotions] = React.useState<Promotion[]>([]);
//   const [selected, setSelected] = React.useState<Set<string>>(new Set());
//   const [loading, setLoading] = React.useState<boolean>(true);
//   const [error, setError] = React.useState<string | null>(null);
//   const [masterWarning, setMasterWarning] = React.useState<string | null>(null);

//   React.useEffect(() => {
//     let cancelled = false;

//     async function load(): Promise<void> {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch('/api/booking/services', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         });
//         if (!res.ok) throw new Error(`Failed to load services: ${res.status}`);
//         const data: Payload = await res.json();
//         if (!cancelled) {
//           setGroups(data.groups ?? []);
//           setPromotions(data.promotions ?? []);
//         }
//       } catch (e: unknown) {
//         const msg = e instanceof Error ? e.message : 'Failed to load services';
//         if (!cancelled) setError(msg);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const toggleService = (id: string): void => {
//     setSelected(prev => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };

//   // Проверка совместимости мастеров
//   React.useEffect(() => {
//     if (selected.size === 0) {
//       setMasterWarning(null);
//       return;
//     }

//     let cancelled = false;

//     async function checkMasterCompatibility(): Promise<void> {
//       try {
//         const serviceIdsParam = Array.from(selected).join(',');
//         const res = await fetch(`/api/masters?serviceIds=${encodeURIComponent(serviceIdsParam)}`, {
//           method: 'GET',
//           cache: 'no-store',
//         });

//         if (!res.ok) throw new Error('Failed to check masters');

//         const data = await res.json();
//         const masters = Array.isArray(data.masters) ? data.masters : [];

//         if (!cancelled) {
//           if (masters.length === 0) {
//             setMasterWarning(
//               'Эти услуги выполняются разными мастерами. Пожалуйста, оформите отдельные записи для несовместимых услуг.'
//             );
//           } else {
//             setMasterWarning(null);
//           }
//         }
//       } catch (e) {
//         console.error('Master compatibility check failed:', e);
//         if (!cancelled) setMasterWarning(null);
//       }
//     }

//     void checkMasterCompatibility();

//     return () => {
//       cancelled = true;
//     };
//   }, [selected]);

//   const flatServices: Service[] = React.useMemo(
//     () => groups.flatMap(g => g.services),
//     [groups],
//   );

//   const byId: Record<string, Service> = React.useMemo(() => {
//     const acc: Record<string, Service> = {};
//     for (const s of flatServices) acc[s.id] = s;
//     return acc;
//   }, [flatServices]);

//   const selectedServices: Service[] = React.useMemo(
//     () => Array.from(selected).map(id => byId[id]).filter(Boolean),
//     [selected, byId],
//   );

//   const totalDurationMin = React.useMemo(
//     () => selectedServices.reduce((sum, s) => sum + (s.durationMin || 0), 0),
//     [selectedServices],
//   );

//   const totalPriceCents = React.useMemo(
//     () =>
//       selectedServices.reduce((sum, s) => {
//         const base = s.priceCents ?? 0;
//         return sum + applyBestDiscount(base, promotions);
//       }, 0),
//     [selectedServices, promotions],
//   );

//   // КРИТИЧЕСКИЙ ФИКС: правильная генерация URL с множественными параметрами
//   const getMasterUrl = React.useCallback((): string => {
//     const params = new URLSearchParams();
//     Array.from(selected).forEach(id => {
//       params.append('s', id);
//     });
//     return `/booking/master?${params.toString()}`;
//   }, [selected]);

//   const handleProceed = (e: React.MouseEvent): void => {
//     e.preventDefault();
//     const url = getMasterUrl();
//     console.log('Navigating to:', url);
//     router.push(url);
//   };

//   const canProceed = selected.size > 0 && !masterWarning;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-32">
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
//             <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
//               <ShoppingBag className="w-8 h-8" />
//               Онлайн запись
//             </h1>
//             <p className="text-blue-100 mt-2">Шаг 1: Выбор услуг</p>
//           </div>

//           <div className="p-6 md:p-8">
//             {loading && (
//               <div className="text-center py-12">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
//                 <p className="mt-4 text-gray-600">Загрузка услуг…</p>
//               </div>
//             )}

//             {error && (
//               <div className="rounded-lg border border-red-200 bg-red-50 p-6">
//                 <p className="text-red-700 font-semibold">Ошибка: {error}</p>
//               </div>
//             )}

//             {masterWarning && (
//               <div className="mb-6 rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
//                 <div className="flex items-start gap-3">
//                   <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
//                   <p className="text-amber-800 font-medium">
//                     {masterWarning}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {!loading && !error && groups.map(group => (
//               <div key={group.id} className="mb-8 last:mb-0">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 px-2 border-l-4 border-blue-500 pl-3">
//                   {group.title}
//                 </h2>
//                 <div className="space-y-3">
//                   {group.services.map(svc => {
//                     const checked = selected.has(svc.id);
//                     const base = svc.priceCents ?? 0;
//                     const withDiscount = applyBestDiscount(base, promotions);
//                     const hasDiscount = withDiscount !== base;

//                     return (
//                       <label
//                         key={svc.id}
//                         className={`
//                           group flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all duration-200
//                           ${checked
//                             ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-lg ring-2 ring-blue-200'
//                             : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
//                           }
//                         `}
//                       >
//                         <input
//                           type="checkbox"
//                           className="mt-1 w-6 h-6 text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer"
//                           checked={checked}
//                           onChange={() => toggleService(svc.id)}
//                         />
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-start justify-between gap-4">
//                             <div className="flex-1">
//                               <h3 className={`text-lg font-semibold transition-colors ${
//                                 checked ? 'text-blue-700' : 'text-gray-800 group-hover:text-blue-600'
//                               }`}>
//                                 {svc.title}
//                               </h3>
//                               {svc.description && (
//                                 <p className="text-sm text-gray-600 mt-2 leading-relaxed">
//                                   {svc.description}
//                                 </p>
//                               )}
//                               <div className="flex items-center gap-3 mt-3">
//                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
//                                   ⏱️ {formatMinutes(svc.durationMin)}
//                                 </span>
//                               </div>
//                             </div>
//                             <div className="text-right flex-shrink-0">
//                               {hasDiscount ? (
//                                 <div>
//                                   <div className="text-base text-gray-400 line-through">
//                                     {formatPriceEUR(base)}
//                                   </div>
//                                   <div className="text-xl font-bold text-green-600">
//                                     {formatPriceEUR(withDiscount)}
//                                   </div>
//                                   <div className="text-xs text-green-600 font-medium">
//                                     Скидка!
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <div className="text-xl font-bold text-gray-800">
//                                   {formatPriceEUR(base)}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Floating footer */}
//       {selected.size > 0 && (
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
//           <div className="max-w-4xl mx-auto px-4 py-5">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="flex-1 text-center sm:text-left">
//                 <div className="text-sm text-gray-600 mb-1">
//                   Выбрано услуг: <span className="font-bold text-blue-600">{selected.size}</span>
//                 </div>
//                 <div className="flex items-baseline justify-center sm:justify-start gap-4">
//                   <span className="text-3xl font-bold text-gray-800">
//                     {formatPriceEUR(totalPriceCents)}
//                   </span>
//                   <span className="text-base text-gray-600">
//                     • {formatMinutes(totalDurationMin)}
//                   </span>
//                 </div>
//               </div>

//               <button
//                 onClick={handleProceed}
//                 disabled={!canProceed}
//                 className={`
//                   flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform
//                   ${canProceed
//                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
//                     : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
//                   }
//                 `}
//               >
//                 Выбрать мастера
//                 <ChevronRight className="w-6 h-6" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
