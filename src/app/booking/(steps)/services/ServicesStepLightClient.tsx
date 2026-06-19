"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

import PremiumProgressBar from "@/components/PremiumProgressBar";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/I18nProvider";
import { useTranslations } from "@/i18n/useTranslations";

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

function LightBackground(): React.JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#fffafa_0%,#f8eeee_42%,#ead8db_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.76),rgba(255,255,255,0.2)_42%,rgba(126,76,91,0.08))]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0))]" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-[linear-gradient(0deg,rgba(126,76,91,0.14),rgba(255,255,255,0))]" />
    </div>
  );
}

function BookingProgress({
  steps,
}: {
  steps: Array<{ id: string; label: string; icon: string }>;
}): React.JSX.Element {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <PremiumProgressBar currentStep={0} steps={steps} variant="light" />
    </div>
  );
}

export default function ServicesStepLightClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const t = useTranslations();

  const numberLocale =
    locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "ru-RU";

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
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<MessageKey | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      try {
        setLoading(true);
        setErrorKey(null);

        const response = await fetch("/api/booking/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale }),
        });

        if (!response.ok) throw new Error("SERVICE_FETCH_ERROR");

        const data: ApiResponse = await response.json();
        setGroups(data.groups);
      } catch (error) {
        console.error("Error fetching services:", error);
        setErrorKey("booking_error_loading");
      } finally {
        setLoading(false);
      }
    };

    void fetchServices();
  }, [locale]);

  const preselectId = searchParams.get("preselect");

  useEffect(() => {
    if (!preselectId || groups.length === 0 || selectedServices.length > 0) return;

    const exists = groups.some((group) =>
      group.services.some((service) => service.id === preselectId),
    );

    if (exists) setSelectedServices([preselectId]);
  }, [groups, preselectId, selectedServices.length]);

  const allServices = useMemo(
    () => groups.flatMap((group) => group.services),
    [groups],
  );

  const categories = useMemo(
    () => ["all", ...groups.map((group) => group.title)],
    [groups],
  );

  const filteredGroups =
    selectedCategory === "all"
      ? groups
      : groups.filter((group) => group.title === selectedCategory);

  const selectedSet = useMemo(
    () => new Set(selectedServices),
    [selectedServices],
  );

  const selectedItems = useMemo(
    () => allServices.filter((service) => selectedSet.has(service.id)),
    [allServices, selectedSet],
  );

  const totalPrice = selectedItems.reduce(
    (sum, service) => sum + (service.priceCents ?? 0),
    0,
  );

  const totalDuration = selectedItems.reduce(
    (sum, service) => sum + service.durationMin,
    0,
  );

  const formatPrice = (cents: number): string =>
    (cents / 100).toLocaleString(numberLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const toggleService = (serviceId: string): void => {
    setSelectedServices((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  };

  const handleContinue = (): void => {
    const params = new URLSearchParams();
    selectedServices.forEach((id) => params.append("s", id));
    router.push(`/booking/master?${params.toString()}`);
  };

  const error = errorKey ? t(errorKey) : null;

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f8eeee] text-[#38272d]">
        <BookingProgress steps={bookingSteps} />
        <LightBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-rose-200/80 bg-white/82 shadow-[0_24px_70px_rgba(126,76,91,0.16)]">
              <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-rose-400 animate-spin" />
              <Sparkles className="h-10 w-10 text-rose-500" />
            </div>
            <p className="mt-6 text-base font-medium text-[#7d4e5b]/78">
              {t("booking_loading_text")}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f8eeee] text-[#38272d]">
        <BookingProgress steps={bookingSteps} />
        <LightBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-28">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md rounded-[2rem] border border-rose-200/80 bg-white/86 p-8 text-center shadow-[0_28px_80px_rgba(126,76,91,0.16)]"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="mb-5 text-xl font-semibold text-[#7d4e5b]">
              {error}
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-gradient-to-r from-[#a8556c] via-[#d97891] to-[#f0b66e] px-8 py-3.5 font-semibold text-white shadow-[0_18px_44px_rgba(184,91,117,0.24)] transition hover:brightness-105"
            >
              {t("booking_error_retry")}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8eeee] text-[#38272d]">
      <BookingProgress steps={bookingSteps} />
      <LightBackground />

      <div className="booking-content relative z-10 px-4 pb-40 pt-28 md:pb-48 md:pt-34">
        <div className="mx-auto w-full max-w-7xl">
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center md:mb-14"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-300/60 bg-white/72 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b5368] shadow-sm backdrop-blur"
            >
              <Star className="h-3.5 w-3.5 text-rose-500" />
              <span>{t("booking_hero_badge")}</span>
              <Star className="h-3.5 w-3.5 text-amber-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-playfair text-4xl font-light leading-tight tracking-tight text-[#38272d] sm:text-5xl lg:text-6xl"
            >
              <span className="bg-gradient-to-r from-[#7d4e5b] via-[#c06b86] to-[#d89a54] bg-clip-text text-transparent">
                {t("booking_hero_title")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6f5860] md:text-lg"
            >
              {t("booking_hero_subtitle")}
            </motion.p>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-10 flex flex-wrap justify-center gap-2.5 md:mb-14 md:gap-3"
          >
            {categories.map((category, index) => {
              const isAll = category === "all";
              const isActive = selectedCategory === category;
              const label = isAll ? t("booking_category_all") : category;

              return (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * index }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition md:px-5 md:py-2.5 ${
                    isActive
                      ? "border-[#9b5368] bg-[#7d4e5b] text-white shadow-[0_16px_34px_rgba(126,76,91,0.22)]"
                      : "border-rose-200/80 bg-white/72 text-[#7d4e5b] shadow-sm hover:border-rose-300 hover:bg-white"
                  }`}
                >
                  <Sparkles
                    className={`h-3.5 w-3.5 ${
                      isActive ? "text-white" : "text-rose-500"
                    }`}
                  />
                  <span>{label}</span>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="space-y-12 md:space-y-16">
            {filteredGroups.map((group, groupIndex) => (
              <motion.section
                key={group.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.06 + 0.4 }}
              >
                <div className="mb-6 flex items-center gap-4 md:mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
                  <div className="inline-flex items-center gap-3 rounded-full border border-rose-200/80 bg-white/76 px-4 py-2 shadow-sm backdrop-blur">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7d4e5b] md:text-base">
                      {group.title}
                    </h2>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  <AnimatePresence mode="popLayout">
                    {group.services.map((service, index) => {
                      const isSelected = selectedSet.has(service.id);
                      const isHovered = hoveredCard === service.id;
                      const price =
                        service.priceCents == null
                          ? t("booking_price_on_request")
                          : formatPrice(service.priceCents);

                      return (
                        <motion.button
                          key={service.id}
                          layout
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{
                            delay: index * 0.025,
                            type: "spring",
                            stiffness: 250,
                            damping: 24,
                          }}
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.985 }}
                          onHoverStart={() => setHoveredCard(service.id)}
                          onHoverEnd={() => setHoveredCard(null)}
                          onClick={() => toggleService(service.id)}
                          className={`group relative h-full rounded-[1.35rem] border p-[1px] text-left transition ${
                            isSelected
                              ? "border-[#b85b75]/70 bg-gradient-to-br from-[#b85b75]/95 via-[#e996aa]/90 to-[#f0bd78]/90 shadow-[0_24px_64px_rgba(184,91,117,0.26)]"
                              : "border-rose-200/80 bg-white/72 shadow-[0_18px_50px_rgba(126,76,91,0.10)] hover:border-rose-300/90 hover:bg-white"
                          }`}
                        >
                          <div
                            className={`relative flex h-full min-h-[238px] flex-col overflow-hidden rounded-[calc(1.35rem-1px)] p-5 backdrop-blur ${
                              isSelected
                                ? "bg-white/92"
                                : "bg-white/78"
                            }`}
                          >
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
                                  isSelected
                                    ? "border-[#b85b75] bg-[#b85b75] text-white"
                                    : "border-rose-200 bg-white text-rose-300 group-hover:text-rose-500"
                                }`}
                              >
                                {isSelected ? (
                                  <CheckCircle2 className="h-4.5 w-4.5" />
                                ) : (
                                  <span className="h-2.5 w-2.5 rounded-full bg-current" />
                                )}
                              </span>

                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b5368]">
                                <Sparkles className="h-3 w-3 text-rose-500" />
                                Salon Elen
                              </span>
                            </div>

                            <h3
                              className={`text-base font-semibold leading-snug transition md:text-lg ${
                                isSelected || isHovered
                                  ? "text-[#7d4e5b]"
                                  : "text-[#38272d]"
                              }`}
                            >
                              {service.title}
                            </h3>

                            {service.description && (
                              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6f5860]">
                                {service.description}
                              </p>
                            )}

                            <div className="mt-auto pt-6">
                              <div className="flex items-end justify-between gap-4">
                                <div>
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-bold tracking-tight text-[#9b5368] md:text-3xl">
                                      {price}
                                    </span>
                                    <span className="text-base font-semibold text-[#9b5368]">
                                      {service.priceCents == null ? "" : "€"}
                                    </span>
                                  </div>
                                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#7d4e5b]/68">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    <span>
                                      {service.durationMin} {t("booking_minutes")}
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition ${
                                    isSelected
                                      ? "bg-[#7d4e5b] text-white shadow-[0_14px_32px_rgba(126,76,91,0.25)]"
                                      : "border border-rose-100 bg-rose-50/70 text-rose-500"
                                  }`}
                                >
                                  {isSelected ? (
                                    <Award className="h-6 w-6" />
                                  ) : (
                                    <Zap className="h-5 w-5" />
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </div>

      {selectedServices.length > 0 && <div className="h-28 md:h-36" />}

      <AnimatePresence>
        {selectedServices.length > 0 && (
          <motion.div
            initial={{ y: 70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 70, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-50 p-3 md:p-6"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
            }}
          >
            <div className="mx-auto max-w-6xl">
              <div className="rounded-[1.75rem] border border-rose-200/80 bg-white/92 p-4 shadow-[0_24px_80px_rgba(126,76,91,0.22)] backdrop-blur-xl md:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7d4e5b]/60">
                      {t("booking_bar_selected_label")}{" "}
                      <span className="text-[#9b5368]">{selectedServices.length}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-2xl font-bold text-[#7d4e5b] md:text-4xl">
                        {formatPrice(totalPrice)}
                      </span>
                      <span className="text-base font-semibold text-[#7d4e5b] md:text-xl">
                        €
                      </span>
                      <span className="text-sm text-[#6f5860] md:text-base">
                        {totalDuration} {t("booking_minutes_short")}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinue}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#9b5368] via-[#d97891] to-[#f0b66e] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(184,91,117,0.28)] transition hover:brightness-105 md:px-8 md:py-4 md:text-base"
                  >
                    <span>{t("booking_continue")}</span>
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
