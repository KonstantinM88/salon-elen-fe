// src/components/site-footer.tsx
"use client";

import * as React from "react";
import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CalendarCheck,
  Scissors,
  Sparkles,
  Home,
  Tag,
  Newspaper,
  Info,
  User,
  ShieldCheck,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "@/i18n/useTranslations";
import RainbowCTA from "@/components/RainbowCTA";

type MainNavKey =
  | "nav_home"
  | "nav_services"
  | "nav_prices"
  | "nav_contacts"
  | "nav_news"
  | "nav_about";

type FooterClientKey =
  | "footer_client_booking"
  | "footer_client_cabinet"
  | "footer_client_admin";

type SocialTooltipKey =
  | "footer_socials_instagram_hint"
  | "footer_socials_facebook_hint"
  | "footer_socials_youtube_hint";

type MessengerLabelKey = "footer_messenger_email" | "footer_messenger_call";

type MainNavItem = {
  href: string;
  labelKey: MainNavKey;
  icon: ElementType;
  glowClass: string;
  ringClass: string;
};

type ClientNavItem = {
  href: string;
  labelKey: FooterClientKey;
  icon: ElementType;
  glowClass: string;
  ringClass: string;
};

type SocialItem = {
  href: string;
  label: string;
  icon: ElementType;
  bgClass: string;
  ringClass: string;
  tooltipKey: SocialTooltipKey;
};

type MessengerItem = {
  href: string;
  labelKey: MessengerLabelKey;
  icon: ElementType;
  bgClass: string;
  ringClass: string;
};

const mainNav: MainNavItem[] = [
  {
    href: "/",
    labelKey: "nav_home",
    icon: Home,
    glowClass: "from-sky-500 via-cyan-400 to-emerald-400",
    ringClass: "shadow-[0_0_16px_rgba(56,189,248,0.8)]",
  },
  {
    href: "/services",
    labelKey: "nav_services",
    icon: Scissors,
    glowClass: "from-fuchsia-500 via-pink-500 to-amber-400",
    ringClass: "shadow-[0_0_16px_rgba(236,72,153,0.85)]",
  },
  {
    href: "/prices",
    labelKey: "nav_prices",
    icon: Tag,
    glowClass: "from-amber-400 via-yellow-300 to-emerald-300",
    ringClass: "shadow-[0_0_16px_rgba(251,191,36,0.85)]",
  },
  {
    href: "/news",
    labelKey: "nav_news",
    icon: Newspaper,
    glowClass: "from-sky-400 via-violet-400 to-fuchsia-500",
    ringClass: "shadow-[0_0_16px_rgba(129,140,248,0.8)]",
  },
  {
    href: "/about",
    labelKey: "nav_about",
    icon: Info,
    glowClass: "from-emerald-400 via-teal-400 to-sky-400",
    ringClass: "shadow-[0_0_16px_rgba(45,212,191,0.8)]",
  },
  {
    href: "/contacts",
    labelKey: "nav_contacts",
    icon: MapPin,
    glowClass: "from-emerald-400 via-lime-400 to-amber-300",
    ringClass: "shadow-[0_0_16px_rgba(74,222,128,0.85)]",
  },
];

const clientNav: ClientNavItem[] = [
  {
    href: "/booking",
    labelKey: "footer_client_booking",
    icon: CalendarCheck,
    glowClass: "from-emerald-400 via-sky-400 to-fuchsia-400",
    ringClass: "shadow-[0_0_16px_rgba(16,185,129,0.9)]",
  },
  {
    href: "/booking/client",
    labelKey: "footer_client_cabinet",
    icon: User,
    glowClass: "from-sky-400 via-indigo-400 to-emerald-300",
    ringClass: "shadow-[0_0_16px_rgba(59,130,246,0.85)]",
  },
  {
    href: "/for-masters",
    labelKey: "footer_client_admin",
    icon: ShieldCheck,
    glowClass: "from-emerald-400 via-teal-400 to-sky-400",
    ringClass: "shadow-[0_0_16px_rgba(45,212,191,0.9)]",
  },
];

const socials: SocialItem[] = [
  {
    href: "https://instagram.com",
    label: "Instagram",
    icon: Instagram,
    bgClass: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    ringClass: "ring-fuchsia-400/70",
    tooltipKey: "footer_socials_instagram_hint",
  },
  {
    href: "https://facebook.com",
    label: "Facebook",
    icon: Facebook,
    bgClass: "from-[#1877F2] via-[#1d4ed8] to-[#0f172a]",
    ringClass: "ring-sky-400/70",
    tooltipKey: "footer_socials_facebook_hint",
  },
  {
    href: "https://youtube.com",
    label: "YouTube",
    icon: Youtube,
    bgClass: "from-[#FF0000] via-[#f97316] to-[#7f1d1d]",
    ringClass: "ring-red-400/70",
    tooltipKey: "footer_socials_youtube_hint",
  },
];

const messengers: MessengerItem[] = [
  {
    href: "mailto:elen69@web.de",
    labelKey: "footer_messenger_email",
    icon: Mail,
    bgClass: "from-sky-500 via-emerald-400 to-emerald-500",
    ringClass: "ring-emerald-300/70",
  },
  {
    href: "tel:+491778995106",
    labelKey: "footer_messenger_call",
    icon: Phone,
    bgClass: "from-emerald-400 via-teal-400 to-sky-500",
    ringClass: "ring-emerald-300/70",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

type NeonCardProps = {
  children: ReactNode;
  className?: string;
};

function NeonCard({ children, className }: NeonCardProps): React.JSX.Element {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={`relative h-full rounded-3xl bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 p-[1px] shadow-[0_0_32px_rgba(16,185,129,0.55)] ${
        className ?? ""
      }`}
    >
      <div className="relative h-full rounded-[1.4rem] bg-slate-950/96 px-4 py-4 ring-1 ring-white/10 backdrop-blur-xl sm:px-5 sm:py-5">
        <div className="pointer-events-none absolute inset-0 rounded-[1.4rem] bg-gradient-to-br from-emerald-500/12 via-sky-500/10 to-fuchsia-500/12 mix-blend-soft-light" />
        {children}
      </div>
    </motion.div>
  );
}

/** Заголовок секции футера — мини-капсула с неоновым бордером и радужной полоской */
type SectionTitleProps = {
  children: ReactNode;
};

function SectionTitle({ children }: SectionTitleProps): React.JSX.Element {
  return (
    <div className="relative inline-flex w-full rounded-full bg-gradient-to-r from-emerald-500/80 via-sky-500/80 to-fuchsia-500/80 p-[1px] shadow-[0_0_18px_rgba(16,185,129,0.65)]">
      <div className="inline-flex w-full items-center justify-between gap-3 rounded-full bg-slate-950/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-200">
        <span className="truncate">{children}</span>
        <span className="relative inline-flex h-1.5 w-10 overflow-hidden rounded-full bg-slate-900/80">
          <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400" />
        </span>
      </div>
    </div>
  );
}

type RoundIconProps = {
  icon: ElementType;
  iconClassName?: string;
  glowClass: string;
  ringShadowClass?: string;
};

function RoundIcon({
  icon: Icon,
  iconClassName,
  glowClass,
  ringShadowClass,
}: RoundIconProps): React.JSX.Element {
  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center">
      <span
        className={`pointer-events-none absolute inline-flex h-7 w-7 rounded-full bg-gradient-to-br ${glowClass} opacity-80 blur-md`}
      />
      <span
        className={`absolute inset-[1px] rounded-full border border-white/10 bg-slate-950/85 ${
          ringShadowClass ?? ""
        }`}
      />
      <Icon
        className={`relative h-3.5 w-3.5 text-slate-50 ${
          iconClassName ?? ""
        }`}
      />
    </span>
  );
}

export default function SiteFooter(): React.JSX.Element {
  const t = useTranslations();
  const year = new Date().getFullYear();

  const handleScrollTop = (): void => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative mt-16 overflow-hidden border-t border-white/5 bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-sm text-slate-200"
    >
      {/* фон */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
      >
        <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8 lg:pb-12 lg:pt-14">
        {/* верхний блок */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid gap-5 border-b border-white/5 pb-8 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)]"
        >
          <NeonCard>
            <div className="relative space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-100 shadow-[0_0_16px_rgba(34,197,94,0.5)] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                <span className="uppercase tracking-[0.18em]">
                  Salon Elen • Halle (Saale) Lessingstrasse 37.
                </span>
              </div>

              <h2 className="text-lg font-semibold leading-snug text-slate-50 sm:text-xl">
                {t("footer_top_title")}
              </h2>

              <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">
                {t("footer_top_text")}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 text-[11px] text-slate-200 ring-1 ring-emerald-400/40">
                  <CalendarCheck className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{t("footer_top_chip_online")}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 text-[11px] text-slate-200 ring-1 ring-sky-400/40">
                  <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                  <span>{t("footer_top_chip_premium")}</span>
                </div>
              </div>

              <div className="pt-1">
                <RainbowCTA
                  href="/booking"
                  label={t("hero_cta_book")}
                  className="w-full justify-center sm:w-auto"
                  idle
                />
              </div>
            </div>
          </NeonCard>

          <div className="flex flex-col gap-3">
            <NeonCard>
              <div className="space-y-2 text-xs text-slate-200">
                <p className="font-semibold text-slate-50">
                  {t("footer_quick_title")}
                </p>
                <p className="text-[11px] text-slate-300">
                  {t("footer_quick_text")}
                </p>
                <ol className="mt-2 space-y-1">
                  <li className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 ring-1 ring-emerald-400/40">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-black">
                      1
                    </span>
                    <span>{t("footer_quick_step1")}</span>
                  </li>
                  <li className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 ring-1 ring-sky-400/40">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[10px] font-semibold text-black">
                      2
                    </span>
                    <span>{t("footer_quick_step2")}</span>
                  </li>
                  <li className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 ring-1 ring-fuchsia-400/40">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-fuchsia-500 text-[10px] font-semibold text-black">
                      3
                    </span>
                    <span>{t("footer_quick_step3")}</span>
                  </li>
                </ol>
              </div>
            </NeonCard>

            <NeonCard>
              <div className="flex flex-col gap-2 text-xs text-slate-200">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-black/40 px-3 py-2 ring-1 ring-emerald-400/40">
                  <RoundIcon
                    icon={CalendarCheck}
                    glowClass="from-emerald-400 via-sky-400 to-fuchsia-400"
                    ringShadowClass="shadow-[0_0_16px_rgba(16,185,129,0.9)]"
                  />
                  <span>{t("footer_quick_adv1")}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl bg-black/40 px-3 py-2 ring-1 ring-sky-400/40">
                  <RoundIcon
                    icon={Phone}
                    glowClass="from-sky-400 via-indigo-400 to-emerald-300"
                    ringShadowClass="shadow-[0_0_16px_rgba(59,130,246,0.85)]"
                  />
                  <span>{t("footer_quick_adv2")}</span>
                </div>
              </div>
            </NeonCard>
          </div>
        </motion.div>

        {/* нижняя сетка */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-8 grid gap-6 md:grid-cols-4"
        >
          {/* Салон & локация */}
          <NeonCard>
            <SectionTitle>{t("footer_about_section")}</SectionTitle>
            <div className="mt-3 space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <RoundIcon
                  icon={MapPin}
                  glowClass="from-sky-500 via-cyan-400 to-emerald-400"
                  ringShadowClass="shadow-[0_0_16px_rgba(56,189,248,0.8)]"
                />
                <div>
                  <p>Halle (Saale) Lessingstrasse 37.</p>
                  <p className="text-xs text-slate-300">
                    {t("footer_about_description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-300">
                <RoundIcon
                  icon={Clock}
                  glowClass="from-emerald-400 via-lime-400 to-amber-300"
                  ringShadowClass="shadow-[0_0_16px_rgba(74,222,128,0.85)]"
                />
                <div className="space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                    {t("footer_hours_label")}
                  </p>
                  <p>{t("footer_hours_weekdays")}</p>
                  <p>{t("footer_hours_saturday")}</p>
                  <p>{t("footer_hours_sunday")}</p>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <p className="font-medium text-slate-100">
                  {t("footer_contacts_title")}
                </p>
                <a
                  href="tel:+491778995106"
                  className="flex items-center gap-2 text-slate-300 transition hover:text-emerald-300"
                >
                  <RoundIcon
                    icon={Phone}
                    glowClass="from-emerald-400 via-teal-400 to-sky-400"
                    ringShadowClass="shadow-[0_0_16px_rgba(45,212,191,0.9)]"
                  />
                  +49 177 899 5106
                </a>
                <a
                  href="mailto:elen69@web.de"
                  className="flex items-center gap-2 text-slate-300 transition hover:text-sky-300"
                >
                  <RoundIcon
                    icon={Mail}
                    glowClass="from-sky-400 via-indigo-400 to-fuchsia-500"
                    ringShadowClass="shadow-[0_0_16px_rgba(129,140,248,0.8)]"
                  />
                  info@salon-elen.de
                </a>
              </div>
            </div>
          </NeonCard>

          {/* Навигация */}
          <NeonCard>
            <SectionTitle>{t("footer_navigation_section")}</SectionTitle>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-sky-100"
                    >
                      <span className="relative inline-flex h-7 w-7 items-center justify-center">
                        <span
                          className={`pointer-events-none absolute inline-flex h-7 w-7 rounded-full bg-gradient-to-br ${item.glowClass} opacity-80 blur-md transition group-hover:opacity-100`}
                        />
                        <span
                          className={`absolute inset-[1px] rounded-full border border-white/10 bg-slate-950/85 ${item.ringClass} transition`}
                        />
                        <Icon className="relative h-3.5 w-3.5 text-slate-100 transition group-hover:scale-105" />
                      </span>
                      <span className="underline-offset-4 group-hover:underline">
                        {t(item.labelKey)}
                      </span>
                      <ArrowRight className="h-3 w-3 text-sky-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </NeonCard>

          {/* Для клиентов и мастеров */}
          <NeonCard>
            <SectionTitle>{t("footer_clients_section")}</SectionTitle>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {clientNav.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-emerald-100"
                    >
                      <span className="relative inline-flex h-7 w-7 items-center justify-center">
                        <span
                          className={`pointer-events-none absolute inline-flex h-7 w-7 rounded-full bg-gradient-to-br ${item.glowClass} opacity-80 blur-md transition group-hover:opacity-100`}
                        />
                        <span
                          className={`absolute inset-[1px] rounded-full border border-white/10 bg-slate-950/85 ${item.ringClass} transition`}
                        />
                        <Icon className="relative h-3.5 w-3.5 text-slate-100 transition group-hover:scale-105" />
                      </span>
                      <span className="underline-offset-4 group-hover:underline">
                        {t(item.labelKey)}
                      </span>
                      <ArrowRight className="h-3 w-3 text-emerald-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-2 text-[11px] text-emerald-100 shadow-[0_0_14px_rgba(16,185,129,0.5)]">
              <p className="mb-0.5 font-semibold">
                {t("footer_client_partnership_title")}
              </p>
              <p>{t("footer_client_partnership_text")}</p>
            </div>
          </NeonCard>

          {/* Соцсети */}
          <NeonCard>
            <SocialsSection />
          </NeonCard>
        </motion.div>

        {/* нижняя линия */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-4 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            © {year} Salon Elen. {t("footer_copyright")}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/privacy"
              className="transition hover:text-slate-200 hover:underline hover:underline-offset-4"
            >
              {t("footer_privacy")}
            </Link>
            <Link
              href="/terms"
              className="transition hover:text-slate-200 hover:underline hover:underline-offset-4"
            >
              {t("footer_terms")}
            </Link>
            <button
              type="button"
              onClick={handleScrollTop}
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/60 bg-slate-950/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-200 shadow-[0_0_14px_rgba(15,23,42,0.8)] backdrop-blur-sm hover:border-sky-400/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
            >
              <ChevronUp className="h-3 w-3" />
              {t("footer_back_to_top")}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}

function SocialsSection(): React.JSX.Element {
  const t = useTranslations();

  return (
    <div className="space-y-3">
      <SectionTitle>{t("footer_socials_section")}</SectionTitle>

      <motion.div variants={fadeIn} className="mt-3 flex flex-wrap gap-2">
        {socials.map((social) => {
          const Icon = social.icon;
          return (
            <motion.a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -1 }}
              className="group inline-flex flex-1 items-center justify-between gap-2 rounded-2xl border border-white/8 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 shadow-[0_0_18px_rgba(15,23,42,0.9)] ring-1 ring-white/10 transition hover:border-white/20 hover:ring-sky-400/50"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br ${social.bgClass} ring-2 ${social.ringClass} shadow-[0_0_18px_rgba(56,189,248,0.7)]`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <span className="font-medium">{social.label}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {t(social.tooltipKey)}
              </span>
            </motion.a>
          );
        })}
      </motion.div>

      <motion.div
        variants={fadeIn}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="flex flex-wrap gap-2 text-xs text-slate-300"
      >
        {messengers.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group inline-flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 shadow-[0_0_16px_rgba(15,23,42,0.9)] transition hover:border-emerald-400/60 hover:text-emerald-50"
            >
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br ${item.bgClass} ring-2 ${item.ringClass} shadow-[0_0_18px_rgba(45,212,191,0.8)]`}
              >
                <Icon className="h-3.5 w-3.5 text-white" />
              </span>
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
