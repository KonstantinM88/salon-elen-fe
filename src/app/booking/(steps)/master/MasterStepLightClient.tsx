"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  ChevronRight,
  Crown,
  Loader2,
  Sparkles,
  Star,
  UserRound,
  Wifi,
} from "lucide-react";

import PremiumProgressBar from "@/components/PremiumProgressBar";
import { useI18n } from "@/i18n/I18nProvider";
import { translate } from "@/i18n/messages";
import { useTranslations } from "@/i18n/useTranslations";

interface Master {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

function LightBackground(): React.JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#fffafa_0%,#f8eeee_44%,#ead8db_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.76),rgba(255,255,255,0.26)_46%,rgba(126,76,91,0.09))]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0))]" />
      <div className="absolute inset-x-0 bottom-0 h-80 bg-[linear-gradient(0deg,rgba(126,76,91,0.14),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.72),transparent_42%)]" />
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
      <PremiumProgressBar currentStep={1} steps={steps} variant="light" />
    </div>
  );
}

function PageShell({
  children,
  steps,
}: {
  children: React.ReactNode;
  steps: Array<{ id: string; label: string; icon: string }>;
}): React.JSX.Element {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8eeee] text-[#38272d]">
      <BookingProgress steps={steps} />
      <LightBackground />
      <div className="booking-content relative z-10 px-4 pb-16 pt-28 md:px-6 md:pb-20 md:pt-36">
        {children}
      </div>
    </div>
  );
}

function VideoSectionLight(): React.JSX.Element {
  return (
    <section className="mx-auto mt-14 w-full max-w-6xl md:mt-18">
      <div className="overflow-hidden rounded-[2rem] border border-rose-200/80 bg-white/72 p-2 shadow-[0_28px_90px_rgba(126,76,91,0.14)] backdrop-blur">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[1.55rem] bg-[#ead8db]">
          <video
            className="h-full w-full object-contain object-[50%_92%]"
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
        </div>
      </div>
    </section>
  );
}

function MasterCardLight({
  master,
  onSelect,
  index,
}: {
  master: Master;
  onSelect: (id: string) => void;
  index: number;
}): React.JSX.Element {
  const t = useTranslations();

  return (
    <motion.button
      layout
      type="button"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(master.id)}
      className="group relative w-full rounded-[1.75rem] border border-rose-200/80 bg-white/76 p-[1px] text-left shadow-[0_22px_68px_rgba(126,76,91,0.12)] backdrop-blur transition hover:border-rose-300/90 hover:bg-white"
    >
      <div className="relative overflow-hidden rounded-[calc(1.75rem-1px)] bg-white/82 p-5 md:p-7">
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#9b5368,#d97891,#f0b66e)] opacity-75" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center md:gap-7">
          <div className="relative shrink-0 self-start sm:self-center">
            <div className="absolute -inset-2 rounded-full bg-[conic-gradient(from_120deg,#9b5368,#e79aac,#f0bd78,#9b5368)] opacity-35 blur-md transition group-hover:opacity-55" />
            <div className="relative overflow-hidden rounded-full border-4 border-white shadow-[0_18px_44px_rgba(126,76,91,0.18)]">
              {master.avatarUrl ? (
                <Image
                  src={master.avatarUrl}
                  alt={master.name}
                  width={128}
                  height={128}
                  className="h-24 w-24 object-cover md:h-28 md:w-28 lg:h-32 lg:w-32"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center bg-gradient-to-br from-[#9b5368] via-[#d97891] to-[#f0b66e] text-white md:h-28 md:w-28 lg:h-32 lg:w-32">
                  <UserRound className="h-11 w-11 md:h-14 md:w-14" />
                </div>
              )}
            </div>

            <span className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#7d4e5b] text-white shadow-[0_14px_30px_rgba(126,76,91,0.22)]">
              <Crown className="h-5 w-5" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b5368]">
                <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                {t("booking_master_vip_badge")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                <Wifi className="h-3.5 w-3.5" />
                {t("booking_master_online_booking")}
              </span>
            </div>

            <h3 className="font-playfair text-2xl font-semibold leading-tight text-[#38272d] md:text-3xl">
              {master.name}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6f5860] md:text-base">
              {master.bio || t("booking_master_default_bio")}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7d4e5b]/8 px-3 py-1.5 text-xs font-semibold text-[#7d4e5b]">
                <Star className="h-3.5 w-3.5 fill-[#d97891] text-[#d97891]" />
                {t("booking_master_premium")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-[#9a6a27]">
                <Award className="h-3.5 w-3.5" />
                Salon Elen
              </span>
            </div>
          </div>

          <span className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-2xl bg-gradient-to-r from-[#9b5368] via-[#d97891] to-[#f0b66e] text-white shadow-[0_16px_36px_rgba(184,91,117,0.25)] transition group-hover:translate-x-1 sm:self-center">
            <ChevronRight className="h-6 w-6" />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function LoadingState({
  steps,
}: {
  steps: Array<{ id: string; label: string; icon: string }>;
}): React.JSX.Element {
  const t = useTranslations();

  return (
    <PageShell steps={steps}>
      <div className="flex min-h-[62vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-rose-200/80 bg-white/82 shadow-[0_24px_70px_rgba(126,76,91,0.16)]">
            <Loader2 className="h-10 w-10 animate-spin text-[#9b5368]" />
          </div>
          <p className="mt-6 text-base font-medium text-[#7d4e5b]/78">
            {t("booking_loading_text")}
          </p>
        </motion.div>
      </div>
    </PageShell>
  );
}

function MasterInnerLight(): React.JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const { locale } = useI18n();
  const t = useTranslations();

  const bookingSteps = useMemo(
    () => [
      { id: "services", label: t("booking_step_services"), icon: "1" },
      { id: "master", label: t("booking_step_master"), icon: "2" },
      { id: "calendar", label: t("booking_step_date"), icon: "3" },
      { id: "client", label: t("booking_step_client"), icon: "4" },
      { id: "verify", label: t("booking_step_verify"), icon: "5" },
      { id: "payment", label: t("booking_step_payment"), icon: "6" },
    ],
    [t],
  );

  const serviceIds = useMemo(
    () => params.getAll("s").filter((id) => id.trim()),
    [params],
  );

  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMasters(): Promise<void> {
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

  const selectMaster = (masterId: string): void => {
    const qs = new URLSearchParams();
    serviceIds.forEach((id) => qs.append("s", id));
    qs.set("m", masterId);
    router.push(`/booking/calendar?${qs.toString()}`);
  };

  if (loading) return <LoadingState steps={bookingSteps} />;

  if (error) {
    return (
      <PageShell steps={bookingSteps}>
        <div className="flex min-h-[62vh] items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md rounded-[2rem] border border-rose-200/80 bg-white/86 p-8 text-center shadow-[0_28px_80px_rgba(126,76,91,0.16)]"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="mb-4 text-2xl font-semibold text-[#7d4e5b]">
              {t("booking_error_title")}
            </h2>
            <p className="mb-7 text-sm leading-6 text-[#6f5860]">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-2xl bg-gradient-to-r from-[#a8556c] via-[#d97891] to-[#f0b66e] px-8 py-3.5 font-semibold text-white shadow-[0_18px_44px_rgba(184,91,117,0.24)] transition hover:brightness-105"
            >
              {t("booking_error_retry")}
            </button>
          </motion.div>
        </div>
      </PageShell>
    );
  }

  if (masters.length === 0) {
    return (
      <PageShell steps={bookingSteps}>
        <main className="mx-auto w-full max-w-5xl">
          <div className="flex min-h-[62vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-white/78 px-5 py-2 text-sm font-semibold text-[#9b5368] shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                {t("booking_master_no_available")}
              </div>
              <h1 className="font-playfair text-4xl font-semibold leading-tight text-[#38272d] md:text-5xl">
                {t("booking_master_different_masters")}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6f5860] md:text-lg">
                {t("booking_master_choose_same_specialist")}
              </p>
              <button
                type="button"
                onClick={() => router.push("/booking/services")}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#9b5368] via-[#d97891] to-[#f0b66e] px-7 py-3.5 font-semibold text-white shadow-[0_18px_44px_rgba(184,91,117,0.24)] transition hover:brightness-105"
              >
                <ArrowLeft className="h-5 w-5" />
                {t("booking_master_back_to_services")}
              </button>
            </motion.div>
          </div>
          <VideoSectionLight />
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell steps={bookingSteps}>
      <main className="mx-auto w-full max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center md:mb-14"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-300/60 bg-white/72 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b5368] shadow-sm backdrop-blur">
            <Crown className="h-3.5 w-3.5 text-[#9b5368]" />
            <span>{t("booking_master_step_title")}</span>
            <Crown className="h-3.5 w-3.5 text-amber-500" />
          </div>

          <h1 className="font-playfair text-4xl font-light leading-tight tracking-tight text-[#38272d] sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-[#7d4e5b] via-[#c06b86] to-[#d89a54] bg-clip-text text-transparent">
              {t("booking_master_hero_title")}
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6f5860] md:text-lg">
            {t("booking_master_hero_subtitle")}
          </p>
        </motion.section>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:gap-6">
          <AnimatePresence mode="popLayout">
            {masters.map((master, index) => (
              <MasterCardLight
                key={master.id}
                master={master}
                index={index}
                onSelect={selectMaster}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => router.push("/booking/services")}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-white/72 px-5 py-3 text-sm font-semibold text-[#7d4e5b] shadow-sm backdrop-blur transition hover:border-rose-300 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("booking_master_back_button")}
          </button>
        </div>

        <VideoSectionLight />
      </main>
    </PageShell>
  );
}

export default function MasterStepLightClient(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen overflow-hidden bg-[#f8eeee] text-[#38272d]">
          <LightBackground />
          <div className="relative z-10 flex min-h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#9b5368]" />
          </div>
        </div>
      }
    >
      <MasterInnerLight />
    </Suspense>
  );
}
