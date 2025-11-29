"use client";

import * as React from "react";
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
  ChevronUp,
  Home,
  Tag,
  Newspaper,
  Info,
  User,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  glowClass: string;
  ringClass: string;
};

const mainNav: NavItem[] = [
  {
    href: "/",
    label: "Главная",
    icon: Home,
    glowClass: "from-sky-500 via-cyan-400 to-emerald-400",
    ringClass: "shadow-[0_0_16px_rgba(56,189,248,0.8)]",
  },
  {
    href: "/services",
    label: "Услуги",
    icon: Scissors,
    glowClass: "from-fuchsia-500 via-pink-500 to-amber-400",
    ringClass: "shadow-[0_0_16px_rgba(236,72,153,0.85)]",
  },
  {
    href: "/prices",
    label: "Цены",
    icon: Tag,
    glowClass: "from-amber-400 via-yellow-300 to-emerald-300",
    ringClass: "shadow-[0_0_16px_rgba(251,191,36,0.85)]",
  },
  {
    href: "/news",
    label: "Новости",
    icon: Newspaper,
    glowClass: "from-sky-400 via-violet-400 to-fuchsia-500",
    ringClass: "shadow-[0_0_16px_rgba(129,140,248,0.8)]",
  },
  {
    href: "/about",
    label: "О нас",
    icon: Info,
    glowClass: "from-emerald-400 via-teal-400 to-sky-400",
    ringClass: "shadow-[0_0_16px_rgba(45,212,191,0.8)]",
  },
  {
    href: "/contacts",
    label: "Контакты",
    icon: MapPin,
    glowClass: "from-emerald-400 via-lime-400 to-amber-300",
    ringClass: "shadow-[0_0_16px_rgba(74,222,128,0.85)]",
  },
];

const clientNav: NavItem[] = [
  {
    href: "/booking",
    label: "Онлайн-запись",
    icon: CalendarCheck,
    glowClass: "from-emerald-400 via-sky-400 to-fuchsia-400",
    ringClass: "shadow-[0_0_16px_rgba(16,185,129,0.9)]",
  },
  {
    href: "/booking/client",
    label: "Личный кабинет записи",
    icon: User,
    glowClass: "from-sky-400 via-indigo-400 to-emerald-300",
    ringClass: "shadow-[0_0_16px_rgba(59,130,246,0.85)]",
  },
  {
    href: "/admin",
    label: "Вход для администратора/мастера",
    icon: ShieldCheck,
    glowClass: "from-fuchsia-500 via-purple-500 to-emerald-400",
    ringClass: "shadow-[0_0_16px_rgba(192,38,211,0.9)]",
  },
];

const socials = [
  {
    href: "https://instagram.com",
    label: "Instagram",
    icon: Instagram,
    bgClass: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    ringClass: "ring-fuchsia-400/70",
    tooltip: "Открыть Instagram салона",
  },
  {
    href: "https://facebook.com",
    label: "Facebook",
    icon: Facebook,
    bgClass: "from-[#1877F2] via-[#1d4ed8] to-[#0f172a]",
    ringClass: "ring-sky-400/70",
    tooltip: "Открыть Facebook страницу",
  },
  {
    href: "https://youtube.com",
    label: "YouTube",
    icon: Youtube,
    bgClass: "from-[#FF0000] via-[#b91c1c] to-[#0f172a]",
    ringClass: "ring-red-500/70",
    tooltip: "Открыть YouTube канал",
  },
];

const messengers = [
  {
    href: "https://t.me/",
    label: "Telegram",
    pillClass:
      "border-sky-400/50 bg-sky-500/10 hover:border-sky-400/80 hover:bg-sky-500/20",
    dotClass: "bg-sky-400",
    tooltip: "Записаться через Telegram",
  },
  {
    href: "https://wa.me/",
    label: "WhatsApp",
    pillClass:
      "border-emerald-400/60 bg-emerald-500/10 hover:border-emerald-400/90 hover:bg-emerald-500/20",
    dotClass: "bg-emerald-400",
    tooltip: "Записаться через WhatsApp",
  },
  {
    href: "viber://chat",
    label: "Viber",
    pillClass:
      "border-purple-400/60 bg-purple-500/10 hover:border-purple-400/90 hover:bg-purple-500/20",
    dotClass: "bg-purple-400",
    tooltip: "Записаться через Viber",
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

export default function SiteFooter(): React.JSX.Element {
  const year = new Date().getFullYear();

  const handleScrollTop = () => {
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
      {/* Неоновая линия сверху футера */}
      <div className="pointer-events-none h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

      {/* Собственный фон футера */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(244,63,94,0.2),_transparent_55%)]" />
        <div className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute right-[-4rem] top-0 h-52 w-52 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-[-3rem] left-1/4 h-60 w-60 rounded-full bg-emerald-500/25 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-12">
        {/* Верхний блок: бренд + CTA букинга */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative flex flex-col gap-6 border-b border-white/5 pb-8 md:flex-row md:items-center md:justify-between"
        >
          {/* Мягкое свечение под блоком */}
          <div className="pointer-events-none absolute inset-x-10 -top-6 h-12 rounded-full bg-white/10 blur-3xl" />

          {/* Левый премиальный блок с бейджами и описанием */}
          <motion.div
            whileHover={{ y: -1 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative max-w-xl rounded-3xl bg-gradient-to-br from-emerald-400/80 via-emerald-300/10 to-sky-500/70 p-[1px] shadow-[0_0_32px_rgba(16,185,129,0.55)]"
          >
            <div className="relative space-y-3 rounded-[1.45rem] bg-gradient-to-br from-slate-950/96 via-slate-900/90 to-slate-950/96 px-4 py-4 ring-1 ring-white/10 backdrop-blur-xl">
              {/* мягкие подсветки внутри */}
              <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-40 rounded-full bg-emerald-400/18 blur-3xl" />
              <div className="pointer-events-none absolute right-0 bottom-[-2rem] h-28 w-40 rounded-full bg-sky-400/18 blur-3xl" />

              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300 shadow-[0_0_16px_rgba(15,23,42,0.9)]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(45,255,196,0.9)]" />
                </span>
                <span className="text-[10px] font-medium text-slate-200">
                  Онлайн-запись премиум-класса
                </span>
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              </motion.div>

              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.45, delay: 0.12 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl bg-gradient-to-r from-fuchsia-500/40 via-sky-500/25 to-emerald-400/40 p-[1px]"
                  >
                    <div className="flex items-center gap-2 rounded-[10px] bg-black/80 px-3 py-1.5">
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-100">
                        Salon Elen
                      </span>
                      <motion.span
                        animate={{ width: ["1rem", "1.8rem", "1rem"] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="h-1 w-4 rounded-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-300"
                      />
                    </div>
                  </motion.div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                  Современная студия красоты в Halle с умной системой онлайн-бронирования:
                  выберите услугу, мастера и удобное время за пару кликов — без ожидания на линии.
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Блок букинга + кнопки справа */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            {/* Премиальная карточка "Быстрая запись" */}
            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative flex flex-1 flex-col gap-2 rounded-3xl bg-gradient-to-br from-emerald-400/80 via-emerald-300/10 to-sky-400/70 p-[1px] shadow-[0_0_34px_rgba(16,185,129,0.65)]"
            >
              <div className="relative flex h-full flex-col justify-between rounded-[1.45rem] bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 px-4 pb-3 pt-3 ring-1 ring-emerald-400/35 backdrop-blur-xl">
                <div className="pointer-events-none absolute -left-6 -top-10 h-32 w-40 rounded-full bg-emerald-400/18 blur-3xl" />
                <div className="pointer-events-none absolute right-0 bottom-[-2rem] h-28 w-40 rounded-full bg-sky-400/16 blur-3xl" />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
                      Быстрая запись
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-50">
                      Свободные слоты сегодня и на ближайшие дни
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative inline-flex h-9 w-9 items-center justify-center"
                  >
                    <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-emerald-300 opacity-80 blur-md" />
                    <span className="absolute inset-[1px] rounded-full border border-emerald-300/60 bg-slate-950/90 shadow-[0_0_16px_rgba(34,197,94,0.8)]" />
                    <CalendarCheck className="relative h-4 w-4 text-emerald-200" />
                  </motion.div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                  <StepPill icon={Scissors} text="1. Выберите услугу" />
                  <StepPill icon={Sparkles} text="2. Выберите мастера" />
                  <StepPill icon={CalendarCheck} text="3. Подтвердите время" />
                </div>
              </div>
            </motion.div>

            {/* Блок кнопок справа */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-col gap-2 sm:w-52"
            >
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Link
                  href="/booking"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_35px_rgba(56,189,248,0.55)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                >
                  Онлайн-запись
                  <motion.span
                    className="inline-flex"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </Link>
              </motion.div>

              {/* Премиальная кнопка "Позвонить администратору" */}
              <motion.a
                href="tel:+490000000000"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400/80 via-emerald-300/10 to-sky-500/80 p-[1px] shadow-[0_0_26px_rgba(16,185,129,0.7)]"
              >
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-[1.05rem] bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-slate-950/95 px-4 py-2.5 text-xs font-medium text-slate-100 ring-1 ring-emerald-300/40 backdrop-blur-xl">
                  <span className="relative inline-flex h-6 w-6 items-center justify-center">
                    <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-emerald-300 opacity-70 blur-md" />
                    <span className="absolute inset-[1px] rounded-full border border-emerald-200/70 bg-slate-950/90 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                    <Phone className="relative h-3.5 w-3.5 text-emerald-100" />
                  </span>
                  <span>Позвонить администратору</span>
                </span>
              </motion.a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Мобильный блок соцсетей */}
        <div className="mt-8 md:hidden">
          <SocialsSectionMobile />
        </div>

        {/* Основная сетка */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 grid gap-6 md:grid-cols-4"
        >
          {/* Локация / время работы */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <ColumnCard>
              <SectionTitle>Салон &amp; локация</SectionTitle>
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -4 }}
                    className="mt-0.5 rounded-full bg-sky-500/20 p-1"
                  >
                    <MapPin className="h-4 w-4 text-sky-400" />
                  </motion.div>
                  <div>
                    <p>Halle (Saale)</p>
                    <p className="text-xs text-slate-300">
                      Точный адрес и подробная схема проезда — в разделе{" "}
                      <Link href="/contacts" className="underline underline-offset-2">
                        контакты
                      </Link>
                      .
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 4 }}
                    className="mt-0.5 rounded-full bg-emerald-500/20 p-1"
                  >
                    <Clock className="h-4 w-4 text-emerald-400" />
                  </motion.div>
                  <div className="space-y-1">
                    <p>Ежедневно: 10:00 – 20:00</p>
                    <p className="text-xs text-slate-300">
                      Онлайн-запись доступна 24/7 — выберите удобное время даже ночью.
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-slate-100">Контакты</p>
                  <Tooltip label="Позвонить в салон">
                    <a
                      href="tel:+490000000000"
                      className="flex items-center gap-2 text-slate-300 transition hover:text-emerald-300"
                    >
                      <Phone className="h-4 w-4" />
                      +49 (0) 000 000 000
                    </a>
                  </Tooltip>
                  <Tooltip label="Написать на e-mail">
                    <a
                      href="mailto:info@salon-elen.de"
                      className="flex items-center gap-2 text-slate-300 transition hover:text-sky-300"
                    >
                      <Mail className="h-4 w-4" />
                      info@salon-elen.de
                    </a>
                  </Tooltip>
                </div>
              </div>
            </ColumnCard>
          </motion.div>

          {/* Навигация */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.45, delay: 0.12 }}
          >
            <ColumnCard>
              <SectionTitle>Навигация</SectionTitle>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {mainNav.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.li
                      key={item.href}
                      variants={fadeInUp}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                    >
                      <motion.div whileHover={{ x: 2 }}>
                        <Link
                          href={item.href}
                          className="group inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-sky-100"
                        >
                          <span className="relative inline-flex h-7 w-7 items-center justify-center">
                            <span
                              className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${item.glowClass} opacity-80 blur-md transition group-hover:opacity-100`}
                            />
                            <span
                              className={`absolute inset-[1px] rounded-full border border-white/10 bg-slate-950/85 ${item.ringClass} transition`}
                            />
                            <Icon className="relative h-3.5 w-3.5 text-slate-100 transition group-hover:scale-105" />
                          </span>
                          <span className="underline-offset-4 group-hover:underline">
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    </motion.li>
                  );
                })}
              </ul>
            </ColumnCard>
          </motion.div>

          {/* Для клиентов / мастеров */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.45, delay: 0.18 }}
          >
            <ColumnCard>
              <SectionTitle>Для клиентов и мастеров</SectionTitle>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {clientNav.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.li
                      key={item.href}
                      variants={fadeInUp}
                      transition={{ duration: 0.3, delay: 0.06 * index }}
                    >
                      <motion.div whileHover={{ x: 2 }}>
                        <Link
                          href={item.href}
                          className="group inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-emerald-100"
                        >
                          <span className="relative inline-flex h-7 w-7 items-center justify-center">
                            <span
                              className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${item.glowClass} opacity-80 blur-md transition group-hover:opacity-100`}
                            />
                            <span
                              className={`absolute inset-[1px] rounded-full border border-white/10 bg-slate-950/85 ${item.ringClass} transition`}
                            />
                            <Icon className="relative h-3.5 w-3.5 text-slate-100 transition group-hover:scale-105" />
                          </span>
                          <span className="underline-offset-4 group-hover:underline">
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.4, delay: 0.26 }}
                whileHover={{ y: -1 }}
                className="mt-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-slate-900/80 to-slate-950 p-3 text-xs text-slate-300"
              >
                <p className="font-medium text-slate-100">Партнёрство с мастерами</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                  Ищете современный салон с прозрачным онлайн-расписанием и комфортными
                  условиями? Напишите нам — обсудим сотрудничество.
                </p>
              </motion.div>
            </ColumnCard>
          </motion.div>

          {/* Соцсети — десктоп */}
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.45, delay: 0.22 }}
            className="hidden md:block"
          >
            <ColumnCard>
              <SocialsSectionDesktop />
            </ColumnCard>
          </motion.div>
        </motion.div>

        {/* Нижняя полоса с кнопкой "Наверх" */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45, delay: 0.3 }}
          className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-4 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>© {year} Salon Elen. Все права защищены.</p>
          <div className="flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ y: -1 }}>
              <Link
                href="/privacy"
                className="transition hover:text-slate-200 hover:underline hover:underline-offset-4"
              >
                Политика конфиденциальности
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -1 }}>
              <Link
                href="/terms"
                className="transition hover:text-slate-200 hover:underline hover:underline-offset-4"
              >
                Условия использования
              </Link>
            </motion.div>
            <motion.button
              type="button"
              onClick={handleScrollTop}
              whileHover={{ y: -1, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-[0_0_14px_rgba(15,23,42,0.8)] backdrop-blur-sm hover:border-sky-400/70 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
            >
              <ChevronUp className="h-3 w-3" />
              Наверх
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}

function SectionTitle(props: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"
    >
      <span className="h-1 w-5 rounded-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-300" />
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
        {props.children}
      </h3>
    </motion.div>
  );
}

function StepPill(props: { icon: React.ElementType; text: string }) {
  const Icon = props.icon;
  return (
    <motion.span
      whileHover={{ scale: 1.03 }}
      className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] text-slate-200 ring-1 ring-emerald-300/40 backdrop-blur-sm"
    >
      <Icon className="h-3 w-3 text-emerald-300" />
      {props.text}
    </motion.span>
  );
}

type TooltipProps = {
  label: string;
  children: React.ReactNode;
};

function Tooltip({ label, children }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute -top-8 left-1/2 z-20 w-max -translate-x-1/2 rounded-full bg-black/90 px-3 py-1 text-[10px] font-medium text-slate-100 opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover:-translate-y-1 group-hover:opacity-100">
        {label}
      </div>
    </div>
  );
}

/* ====== Универсальная премиальная карточка секции ====== */

function ColumnCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="relative h-full rounded-3xl bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[1px] shadow-[0_0_32px_rgba(251,191,36,0.35)]"
    >
      <div className="relative h-full rounded-[1.4rem] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 px-4 py-4 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-10 left-6 h-28 w-40 rounded-full bg-amber-300/18 blur-3xl" />
        {children}
      </div>
    </motion.div>
  );
}

/* ====== Блоки соцсетей / мессенджеров ====== */

function SocialsSectionDesktop() {
  return (
    <>
      <SectionTitle>Соцсети &amp; мессенджеры</SectionTitle>

      <motion.div variants={fadeIn} className="mt-3 flex flex-wrap gap-2">
        {socials.map((link, index) => (
          <motion.div
            key={link.label}
            variants={fadeInUp}
            transition={{ duration: 0.3, delay: 0.05 * index }}
          >
            <Tooltip label={link.tooltip}>
              <motion.a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                whileHover={{ y: -3, scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-slate-100 shadow-[0_0_22px_rgba(15,23,42,0.9)] backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2"
              >
                <span
                  className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${link.bgClass} opacity-70 blur-md`}
                />
                <span
                  className={`absolute inset-[1px] rounded-full border border-white/10 ring-0 ${link.ringClass}`}
                />
                <link.icon className="relative h-4 w-4" />
              </motion.a>
            </Tooltip>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-3 space-y-2 text-xs text-slate-300">
        <p className="font-medium text-slate-100">Запись через мессенджеры</p>
        <div className="flex flex-wrap gap-1.5">
          {messengers.map((m, index) => (
            <motion.div
              key={m.label}
              variants={fadeInUp}
              transition={{ duration: 0.3, delay: 0.08 * index }}
            >
              <Tooltip label={m.tooltip}>
                <motion.a
                  href={m.href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] text-slate-100 backdrop-blur-sm transition ${m.pillClass}`}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dotClass} opacity-60`}
                    />
                    <span
                      className={`relative inline-flex h-2 w-2 rounded-full ${m.dotClass} shadow-[0_0_10px_rgba(74,222,128,0.9)]`}
                    />
                  </span>
                  {m.label}
                </motion.a>
              </Tooltip>
            </motion.div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          Напишите в удобном мессенджере — ответим максимально быстро ✨
        </p>
      </div>
    </>
  );
}

function SocialsSectionMobile() {
  return (
    <ColumnCard>
      <SectionTitle>Соцсети &amp; мессенджеры</SectionTitle>

      <div className="mt-3 flex flex-wrap gap-2">
        {socials.map((link) => (
          <Tooltip key={link.label} label={link.tooltip}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-slate-100 shadow-[0_0_22px_rgba(15,23,42,0.9)] backdrop-blur-sm"
            >
              <span
                className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${link.bgClass} opacity-70 blur-md`}
              />
              <span
                className={`absolute inset-[1px] rounded-full border border-white/10 ring-0 ${link.ringClass}`}
              />
              <link.icon className="relative h-4 w-4" />
            </a>
          </Tooltip>
        ))}
      </div>

      <div className="mt-3 space-y-2 text-xs text-slate-300">
        <p className="font-medium text-slate-100">Запись через мессенджеры</p>
        <div className="flex flex-wrap gap-1.5">
          {messengers.map((m) => (
            <Tooltip key={m.label} label={m.tooltip}>
              <a
                href={m.href}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] text-slate-100 backdrop-blur-sm transition ${m.pillClass}`}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dotClass} opacity-60`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${m.dotClass} shadow-[0_0_10px_rgba(74,222,128,0.9)]`}
                  />
                </span>
                {m.label}
              </a>
            </Tooltip>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          Напишите в удобном мессенджере — ответим максимально быстро ✨
        </p>
      </div>
    </ColumnCard>
  );
}




//---------дорабатываем----
// "use client";

// import * as React from "react";
// import Link from "next/link";
// import {
//   Instagram,
//   Facebook,
//   Youtube,
//   Mail,
//   Phone,
//   MapPin,
//   Clock,
//   ArrowRight,
//   CalendarCheck,
//   Scissors,
//   Sparkles,
//   ChevronUp,
//   Home,
//   Tag,
//   Newspaper,
//   Info,
//   User,
//   ShieldCheck,
// } from "lucide-react";
// import { motion } from "framer-motion";

// type NavItem = {
//   href: string;
//   label: string;
//   icon: React.ElementType;
//   glowClass: string;
//   ringClass: string;
// };

// const mainNav: NavItem[] = [
//   {
//     href: "/",
//     label: "Главная",
//     icon: Home,
//     glowClass: "from-sky-500 via-cyan-400 to-emerald-400",
//     ringClass: "shadow-[0_0_16px_rgba(56,189,248,0.8)]",
//   },
//   {
//     href: "/services",
//     label: "Услуги",
//     icon: Scissors,
//     glowClass: "from-fuchsia-500 via-pink-500 to-amber-400",
//     ringClass: "shadow-[0_0_16px_rgba(236,72,153,0.85)]",
//   },
//   {
//     href: "/prices",
//     label: "Цены",
//     icon: Tag,
//     glowClass: "from-amber-400 via-yellow-300 to-emerald-300",
//     ringClass: "shadow-[0_0_16px_rgba(251,191,36,0.85)]",
//   },
//   {
//     href: "/news",
//     label: "Новости",
//     icon: Newspaper,
//     glowClass: "from-sky-400 via-violet-400 to-fuchsia-500",
//     ringClass: "shadow-[0_0_16px_rgba(129,140,248,0.8)]",
//   },
//   {
//     href: "/about",
//     label: "О нас",
//     icon: Info,
//     glowClass: "from-emerald-400 via-teal-400 to-sky-400",
//     ringClass: "shadow-[0_0_16px_rgba(45,212,191,0.8)]",
//   },
//   {
//     href: "/contacts",
//     label: "Контакты",
//     icon: MapPin,
//     glowClass: "from-emerald-400 via-lime-400 to-amber-300",
//     ringClass: "shadow-[0_0_16px_rgba(74,222,128,0.85)]",
//   },
// ];

// const clientNav: NavItem[] = [
//   {
//     href: "/booking",
//     label: "Онлайн-запись",
//     icon: CalendarCheck,
//     glowClass: "from-emerald-400 via-sky-400 to-fuchsia-400",
//     ringClass: "shadow-[0_0_16px_rgba(16,185,129,0.9)]",
//   },
//   {
//     href: "/booking/client",
//     label: "Личный кабинет записи",
//     icon: User,
//     glowClass: "from-sky-400 via-indigo-400 to-emerald-300",
//     ringClass: "shadow-[0_0_16px_rgba(59,130,246,0.85)]",
//   },
//   {
//     href: "/admin",
//     label: "Вход для администратора/мастера",
//     icon: ShieldCheck,
//     glowClass: "from-fuchsia-500 via-purple-500 to-emerald-400",
//     ringClass: "shadow-[0_0_16px_rgba(192,38,211,0.9)]",
//   },
// ];

// const socials = [
//   {
//     href: "https://instagram.com",
//     label: "Instagram",
//     icon: Instagram,
//     bgClass: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
//     ringClass: "ring-fuchsia-400/70",
//     tooltip: "Открыть Instagram салона",
//   },
//   {
//     href: "https://facebook.com",
//     label: "Facebook",
//     icon: Facebook,
//     bgClass: "from-[#1877F2] via-[#1d4ed8] to-[#0f172a]",
//     ringClass: "ring-sky-400/70",
//     tooltip: "Открыть Facebook страницу",
//   },
//   {
//     href: "https://youtube.com",
//     label: "YouTube",
//     icon: Youtube,
//     bgClass: "from-[#FF0000] via-[#b91c1c] to-[#0f172a]",
//     ringClass: "ring-red-500/70",
//     tooltip: "Открыть YouTube канал",
//   },
// ];

// const messengers = [
//   {
//     href: "https://t.me/",
//     label: "Telegram",
//     pillClass:
//       "border-sky-400/50 bg-sky-500/10 hover:border-sky-400/80 hover:bg-sky-500/20",
//     dotClass: "bg-sky-400",
//     tooltip: "Записаться через Telegram",
//   },
//   {
//     href: "https://wa.me/",
//     label: "WhatsApp",
//     pillClass:
//       "border-emerald-400/60 bg-emerald-500/10 hover:border-emerald-400/90 hover:bg-emerald-500/20",
//     dotClass: "bg-emerald-400",
//     tooltip: "Записаться через WhatsApp",
//   },
//   {
//     href: "viber://chat",
//     label: "Viber",
//     pillClass:
//       "border-purple-400/60 bg-purple-500/10 hover:border-purple-400/90 hover:bg-purple-500/20",
//     dotClass: "bg-purple-400",
//     tooltip: "Записаться через Viber",
//   },
// ];

// const fadeInUp = {
//   hidden: { opacity: 0, y: 18 },
//   visible: { opacity: 1, y: 0 },
// };

// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1 },
// };

// export default function SiteFooter(): React.JSX.Element {
//   const year = new Date().getFullYear();

//   const handleScrollTop = () => {
//     if (typeof window !== "undefined") {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   return (
//     <motion.footer
//       initial={{ opacity: 0, y: 18 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.55, ease: "easeOut" }}
//       className="relative mt-16 overflow-hidden border-t border-white/5 bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-sm text-slate-200"
//     >
//       {/* Неоновая линия сверху футера */}
//       <div className="pointer-events-none h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Собственный фон футера */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(244,63,94,0.2),_transparent_55%)]" />
//         <div className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-4rem] top-0 h-52 w-52 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-[-3rem] left-1/4 h-60 w-60 rounded-full bg-emerald-500/25 blur-3xl" />
//       </div>

//       <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-12">
//         {/* Верхний блок: бренд + CTA букинга */}
//         <motion.div
//           variants={fadeInUp}
//           initial="hidden"
//           animate="visible"
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className="relative flex flex-col gap-6 border-b border-white/5 pb-8 md:flex-row md:items-center md:justify-between"
//         >
//           {/* Мягкое свечение под блоком */}
//           <div className="pointer-events-none absolute inset-x-10 -top-6 h-12 rounded-full bg-white/10 blur-3xl" />

//           <div className="space-y-3">
//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.05 }}
//               className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300 shadow-[0_0_20px_rgba(15,23,42,0.9)]"
//             >
//               <span className="relative flex h-2 w-2">
//                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
//                 <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(45,255,196,0.9)]" />
//               </span>
//               <span className="text-[10px] font-medium text-slate-200">
//                 Онлайн-запись премиум-класса
//               </span>
//             </motion.div>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.45, delay: 0.12 }}
//             >
//               <div className="flex items-center gap-2">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   className="rounded-xl bg-gradient-to-r from-fuchsia-500/30 via-sky-500/15 to-emerald-400/25 p-[1px]"
//                 >
//                   <div className="flex items-center gap-1 rounded-[10px] bg-black/70 px-3 py-1.5">
//                     <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
//                       Salon Elen
//                     </span>
//                     <motion.span
//                       animate={{ width: ["1rem", "1.7rem", "1rem"] }}
//                       transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
//                       className="h-1 w-4 rounded-full bg-gradient-to-r from-fuchsia-400 to-emerald-300"
//                     />
//                   </div>
//                 </motion.div>
//               </div>
//               <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
//                 Современная студия красоты в Halle с умной системой онлайн-бронирования:
//                 выберите услугу, мастера и удобное время за пару кликов — без ожидания на линии.
//               </p>
//             </motion.div>
//           </div>

//           {/* Блок букинга + кнопки */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.18 }}
//             className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
//           >
//             <motion.div
//               whileHover={{ y: -2, scale: 1.01 }}
//               transition={{ type: "spring", stiffness: 260, damping: 22 }}
//               className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-slate-950/90 to-slate-950 shadow-[0_0_32px_rgba(16,185,129,0.45)]"
//             >
//               <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/40 blur-3xl" />
//               <div className="flex items-center justify-between gap-3 px-4 pt-3">
//                 <div>
//                   <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
//                     Быстрая запись
//                   </p>
//                   <p className="text-sm font-semibold text-slate-50">
//                     Свободные слоты сегодня и на ближайшие дни
//                   </p>
//                 </div>
//                 <motion.div
//                   animate={{ rotate: [0, 8, -6, 0] }}
//                   transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
//                   className="hidden rounded-xl bg-black/40 p-2 sm:block"
//                 >
//                   <CalendarCheck className="h-5 w-5 text-emerald-300" />
//                 </motion.div>
//               </div>
//               <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-1 text-[11px] text-slate-300">
//                 <StepPill icon={Scissors} text="1. Выберите услугу" />
//                 <StepPill icon={Sparkles} text="2. Выберите мастера" />
//                 <StepPill icon={CalendarCheck} text="3. Подтвердите время" />
//               </div>
//             </motion.div>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.25 }}
//               className="flex flex-col gap-2 sm:w-48"
//             >
//               <motion.div
//                 whileHover={{ y: -2, scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               >
//                 <Link
//                   href="/booking"
//                   className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_35px_rgba(56,189,248,0.55)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
//                 >
//                   Онлайн-запись
//                   <motion.span
//                     className="inline-flex"
//                     initial={{ x: 0 }}
//                     whileHover={{ x: 4 }}
//                     transition={{ type: "spring", stiffness: 260, damping: 20 }}
//                   >
//                     <ArrowRight className="h-4 w-4" />
//                   </motion.span>
//                 </Link>
//               </motion.div>
//               <motion.a
//                 href="tel:+490000000000"
//                 whileHover={{ y: -1 }}
//                 className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/70 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
//               >
//                 <Phone className="h-3.5 w-3.5" />
//                 Позвонить администратору
//               </motion.a>
//             </motion.div>
//           </motion.div>
//         </motion.div>

//         {/* Мобильный блок соцсетей */}
//         <div className="mt-8 md:hidden">
//           <SocialsSectionMobile />
//         </div>

//         {/* Основная сетка */}
//         <motion.div
//           variants={fadeIn}
//           initial="hidden"
//           animate="visible"
//           transition={{ duration: 0.6, delay: 0.1 }}
//           className="mt-8 grid gap-6 md:grid-cols-4"
//         >
//           {/* Локация / время работы */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.05 }}
//           >
//             <ColumnCard>
//               <SectionTitle>Салон &amp; локация</SectionTitle>
//               <div className="mt-3 space-y-3 text-sm text-slate-300">
//                 <div className="flex items-start gap-2">
//                   <motion.div
//                     whileHover={{ scale: 1.1, rotate: -4 }}
//                     className="mt-0.5 rounded-full bg-sky-500/20 p-1"
//                   >
//                     <MapPin className="h-4 w-4 text-sky-400" />
//                   </motion.div>
//                   <div>
//                     <p>Halle (Saale)</p>
//                     <p className="text-xs text-slate-300">
//                       Точный адрес и подробная схема проезда — в разделе{" "}
//                       <Link href="/contacts" className="underline underline-offset-2">
//                         контакты
//                       </Link>
//                       .
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-2">
//                   <motion.div
//                     whileHover={{ scale: 1.1, rotate: 4 }}
//                     className="mt-0.5 rounded-full bg-emerald-500/20 p-1"
//                   >
//                     <Clock className="h-4 w-4 text-emerald-400" />
//                   </motion.div>
//                   <div className="space-y-1">
//                     <p>Ежедневно: 10:00 – 20:00</p>
//                     <p className="text-xs text-slate-300">
//                       Онлайн-запись доступна 24/7 — выберите удобное время даже ночью.
//                     </p>
//                   </div>
//                 </div>
//                 <div className="space-y-1 text-sm">
//                   <p className="font-medium text-slate-100">Контакты</p>
//                   <Tooltip label="Позвонить в салон">
//                     <a
//                       href="tel:+490000000000"
//                       className="flex items-center gap-2 text-slate-300 transition hover:text-emerald-300"
//                     >
//                       <Phone className="h-4 w-4" />
//                       +49 (0) 000 000 000
//                     </a>
//                   </Tooltip>
//                   <Tooltip label="Написать на e-mail">
//                     <a
//                       href="mailto:info@salon-elen.de"
//                       className="flex items-center gap-2 text-slate-300 transition hover:text-sky-300"
//                     >
//                       <Mail className="h-4 w-4" />
//                       info@salon-elen.de
//                     </a>
//                   </Tooltip>
//                 </div>
//               </div>
//             </ColumnCard>
//           </motion.div>

//           {/* Навигация */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.12 }}
//           >
//             <ColumnCard>
//               <SectionTitle>Навигация</SectionTitle>
//               <ul className="mt-3 space-y-2 text-sm text-slate-300">
//                 {mainNav.map((item, index) => {
//                   const Icon = item.icon;
//                   return (
//                     <motion.li
//                       key={item.href}
//                       variants={fadeInUp}
//                       transition={{ duration: 0.3, delay: 0.05 * index }}
//                     >
//                       <motion.div whileHover={{ x: 2 }}>
//                         <Link
//                           href={item.href}
//                           className="group inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-sky-100"
//                         >
//                           <span className="relative inline-flex h-7 w-7 items-center justify-center">
//                             <span
//                               className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${item.glowClass} opacity-80 blur-md transition group-hover:opacity-100`}
//                             />
//                             <span
//                               className={`absolute inset-[1px] rounded-full border border-white/10 bg-slate-950/85 ${item.ringClass} transition`}
//                             />
//                             <Icon className="relative h-3.5 w-3.5 text-slate-100 transition group-hover:scale-105" />
//                           </span>
//                           <span className="underline-offset-4 group-hover:underline">
//                             {item.label}
//                           </span>
//                         </Link>
//                       </motion.div>
//                     </motion.li>
//                   );
//                 })}
//               </ul>
//             </ColumnCard>
//           </motion.div>

//           {/* Для клиентов / мастеров */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.18 }}
//           >
//             <ColumnCard>
//               <SectionTitle>Для клиентов и мастеров</SectionTitle>
//               <ul className="mt-3 space-y-2 text-sm text-slate-300">
//                 {clientNav.map((item, index) => {
//                   const Icon = item.icon;
//                   return (
//                     <motion.li
//                       key={item.href}
//                       variants={fadeInUp}
//                       transition={{ duration: 0.3, delay: 0.06 * index }}
//                     >
//                       <motion.div whileHover={{ x: 2 }}>
//                         <Link
//                           href={item.href}
//                           className="group inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-emerald-100"
//                         >
//                           <span className="relative inline-flex h-7 w-7 items-center justify-center">
//                             <span
//                               className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${item.glowClass} opacity-80 blur-md transition group-hover:opacity-100`}
//                             />
//                             <span
//                               className={`absolute inset-[1px] rounded-full border border-white/10 bg-slate-950/85 ${item.ringClass} transition`}
//                             />
//                             <Icon className="relative h-3.5 w-3.5 text-slate-100 transition group-hover:scale-105" />
//                           </span>
//                           <span className="underline-offset-4 group-hover:underline">
//                             {item.label}
//                           </span>
//                         </Link>
//                       </motion.div>
//                     </motion.li>
//                   );
//                 })}
//               </ul>

//               <motion.div
//                 variants={fadeInUp}
//                 transition={{ duration: 0.4, delay: 0.26 }}
//                 whileHover={{ y: -1 }}
//                 className="mt-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-slate-900/80 to-slate-950 p-3 text-xs text-slate-300"
//               >
//                 <p className="font-medium text-slate-100">Партнёрство с мастерами</p>
//                 <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
//                   Ищете современный салон с прозрачным онлайн-расписанием и комфортными
//                   условиями? Напишите нам — обсудим сотрудничество.
//                 </p>
//               </motion.div>
//             </ColumnCard>
//           </motion.div>

//           {/* Соцсети — десктоп */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.22 }}
//             className="hidden md:block"
//           >
//             <ColumnCard>
//               <SocialsSectionDesktop />
//             </ColumnCard>
//           </motion.div>
//         </motion.div>

//         {/* Нижняя полоса с кнопкой "Наверх" */}
//         <motion.div
//           variants={fadeInUp}
//           initial="hidden"
//           animate="visible"
//           transition={{ duration: 0.45, delay: 0.3 }}
//           className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-4 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between"
//         >
//           <p>© {year} Salon Elen. Все права защищены.</p>
//           <div className="flex flex-wrap items-center gap-3">
//             <motion.div whileHover={{ y: -1 }}>
//               <Link
//                 href="/privacy"
//                 className="transition hover:text-slate-200 hover:underline hover:underline-offset-4"
//               >
//                 Политика конфиденциальности
//               </Link>
//             </motion.div>
//             <motion.div whileHover={{ y: -1 }}>
//               <Link
//                 href="/terms"
//                 className="transition hover:text-slate-200 hover:underline hover:underline-offset-4"
//               >
//                 Условия использования
//               </Link>
//             </motion.div>
//             <motion.button
//               type="button"
//               onClick={handleScrollTop}
//               whileHover={{ y: -1, scale: 1.04 }}
//               whileTap={{ scale: 0.96 }}
//               className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-[0_0_14px_rgba(15,23,42,0.8)] backdrop-blur-sm hover:border-sky-400/70 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
//             >
//               <ChevronUp className="h-3 w-3" />
//               Наверх
//             </motion.button>
//           </div>
//         </motion.div>
//       </div>
//     </motion.footer>
//   );
// }

// function SectionTitle(props: { children: React.ReactNode }) {
//   return (
//     <motion.div
//       whileHover={{ x: 2 }}
//       className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"
//     >
//       <span className="h-1 w-5 rounded-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-300" />
//       <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
//         {props.children}
//       </h3>
//     </motion.div>
//   );
// }

// function StepPill(props: { icon: React.ElementType; text: string }) {
//   const Icon = props.icon;
//   return (
//     <motion.span
//       whileHover={{ scale: 1.03 }}
//       className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] text-slate-200 ring-1 ring-white/10 backdrop-blur-sm"
//     >
//       <Icon className="h-3 w-3 text-emerald-300" />
//       {props.text}
//     </motion.span>
//   );
// }

// type TooltipProps = {
//   label: string;
//   children: React.ReactNode;
// };

// function Tooltip({ label, children }: TooltipProps) {
//   return (
//     <div className="group relative inline-flex">
//       {children}
//       <div className="pointer-events-none absolute -top-8 left-1/2 z-20 w-max -translate-x-1/2 rounded-full bg-black/90 px-3 py-1 text-[10px] font-medium text-slate-100 opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover:-translate-y-1 group-hover:opacity-100">
//         {label}
//       </div>
//     </div>
//   );
// }

// /* ====== Универсальная премиальная карточка секции ====== */

// function ColumnCard({ children }: { children: React.ReactNode }) {
//   return (
//     <motion.div
//       whileHover={{ y: -2, scale: 1.01 }}
//       transition={{ type: "spring", stiffness: 260, damping: 24 }}
//       className="relative h-full rounded-3xl bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[1px] shadow-[0_0_32px_rgba(251,191,36,0.35)]"
//     >
//       <div className="relative h-full rounded-[1.4rem] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 px-4 py-4 ring-1 ring-white/10 backdrop-blur-xl">
//         <div className="pointer-events-none absolute -top-10 left-6 h-28 w-40 rounded-full bg-amber-300/18 blur-3xl" />
//         {children}
//       </div>
//     </motion.div>
//   );
// }

// /* ====== Блоки соцсетей / мессенджеров ====== */

// function SocialsSectionDesktop() {
//   return (
//     <>
//       <SectionTitle>Соцсети &amp; мессенджеры</SectionTitle>

//       <motion.div variants={fadeIn} className="mt-3 flex flex-wrap gap-2">
//         {socials.map((link, index) => (
//           <motion.div
//             key={link.label}
//             variants={fadeInUp}
//             transition={{ duration: 0.3, delay: 0.05 * index }}
//           >
//             <Tooltip label={link.tooltip}>
//               <motion.a
//                 href={link.href}
//                 target="_blank"
//                 rel="noreferrer"
//                 aria-label={link.label}
//                 whileHover={{ y: -3, scale: 1.08 }}
//                 whileTap={{ scale: 0.96 }}
//                 className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-slate-100 shadow-[0_0_22px_rgba(15,23,42,0.9)] backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2"
//               >
//                 <span
//                   className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${link.bgClass} opacity-70 blur-md`}
//                 />
//                 <span
//                   className={`absolute inset-[1px] rounded-full border border-white/10 ring-0 ${link.ringClass}`}
//                 />
//                 <link.icon className="relative h-4 w-4" />
//               </motion.a>
//             </Tooltip>
//           </motion.div>
//         ))}
//       </motion.div>

//       <div className="mt-3 space-y-2 text-xs text-slate-300">
//         <p className="font-medium text-slate-100">Запись через мессенджеры</p>
//         <div className="flex flex-wrap gap-1.5">
//           {messengers.map((m, index) => (
//             <motion.div
//               key={m.label}
//               variants={fadeInUp}
//               transition={{ duration: 0.3, delay: 0.08 * index }}
//             >
//               <Tooltip label={m.tooltip}>
//                 <motion.a
//                   href={m.href}
//                   target="_blank"
//                   rel="noreferrer"
//                   whileHover={{ y: -2, scale: 1.05 }}
//                   whileTap={{ scale: 0.97 }}
//                   className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] text-slate-100 backdrop-blur-sm transition ${m.pillClass}`}
//                 >
//                   <span className="relative flex h-2 w-2">
//                     <span
//                       className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dotClass} opacity-60`}
//                     />
//                     <span
//                       className={`relative inline-flex h-2 w-2 rounded-full ${m.dotClass} shadow-[0_0_10px_rgba(74,222,128,0.9)]`}
//                     />
//                   </span>
//                   {m.label}
//                 </motion.a>
//               </Tooltip>
//             </motion.div>
//           ))}
//         </div>
//         <p className="text-[11px] text-slate-400">
//           Напишите в удобном мессенджере — ответим максимально быстро ✨
//         </p>
//       </div>
//     </>
//   );
// }

// function SocialsSectionMobile() {
//   return (
//     <ColumnCard>
//       <SectionTitle>Соцсети &amp; мессенджеры</SectionTitle>

//       <div className="mt-3 flex flex-wrap gap-2">
//         {socials.map((link) => (
//           <Tooltip key={link.label} label={link.tooltip}>
//             <a
//               href={link.href}
//               target="_blank"
//               rel="noreferrer"
//               aria-label={link.label}
//               className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-slate-100 shadow-[0_0_22px_rgba(15,23,42,0.9)] backdrop-blur-sm"
//             >
//               <span
//                 className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${link.bgClass} opacity-70 blur-md`}
//               />
//               <span
//                 className={`absolute inset-[1px] rounded-full border border-white/10 ring-0 ${link.ringClass}`}
//               />
//               <link.icon className="relative h-4 w-4" />
//             </a>
//           </Tooltip>
//         ))}
//       </div>

//       <div className="mt-3 space-y-2 text-xs text-slate-300">
//         <p className="font-medium text-slate-100">Запись через мессенджеры</p>
//         <div className="flex flex-wrap gap-1.5">
//           {messengers.map((m) => (
//             <Tooltip key={m.label} label={m.tooltip}>
//               <a
//                 href={m.href}
//                 target="_blank"
//                 rel="noreferrer"
//                 className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] text-slate-100 backdrop-blur-sm transition ${m.pillClass}`}
//               >
//                 <span className="relative flex h-2 w-2">
//                   <span
//                     className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dotClass} opacity-60`}
//                   />
//                   <span
//                     className={`relative inline-flex h-2 w-2 rounded-full ${m.dotClass} shadow-[0_0_10px_rgba(74,222,128,0.9)]`}
//                   />
//                 </span>
//                 {m.label}
//               </a>
//             </Tooltip>
//           ))}
//         </div>
//         <p className="text-[11px] text-slate-400">
//           Напишите в удобном мессенджере — ответим максимально быстро ✨
//         </p>
//       </div>
//     </ColumnCard>
//   );
// }



//------уже супер но пробую лучше-----
// "use client";

// import * as React from "react";
// import Link from "next/link";
// import {
//   Instagram,
//   Facebook,
//   Youtube,
//   Mail,
//   Phone,
//   MapPin,
//   Clock,
//   ArrowRight,
//   CalendarCheck,
//   Scissors,
//   Sparkles,
//   ChevronUp,
//   Home,
//   Tag,
//   Newspaper,
//   Info,
//   User,
//   ShieldCheck,
// } from "lucide-react";
// import { motion } from "framer-motion";

// type NavItem = {
//   href: string;
//   label: string;
//   icon: React.ElementType;
// };

// const mainNav: NavItem[] = [
//   { href: "/", label: "Главная", icon: Home },
//   { href: "/services", label: "Услуги", icon: Scissors },
//   { href: "/prices", label: "Цены", icon: Tag },
//   { href: "/news", label: "Новости", icon: Newspaper },
//   { href: "/about", label: "О нас", icon: Info },
//   { href: "/contacts", label: "Контакты", icon: MapPin },
// ];

// const clientNav: NavItem[] = [
//   { href: "/booking", label: "Онлайн-запись", icon: CalendarCheck },
//   { href: "/booking/client", label: "Личный кабинет записи", icon: User },
//   { href: "/admin", label: "Вход для администратора/мастера", icon: ShieldCheck },
// ];

// const socials = [
//   {
//     href: "https://instagram.com",
//     label: "Instagram",
//     icon: Instagram,
//     bgClass: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
//     ringClass: "ring-fuchsia-400/70",
//     tooltip: "Открыть Instagram салона",
//   },
//   {
//     href: "https://facebook.com",
//     label: "Facebook",
//     icon: Facebook,
//     bgClass: "from-[#1877F2] via-[#1d4ed8] to-[#0f172a]",
//     ringClass: "ring-sky-400/70",
//     tooltip: "Открыть Facebook страницу",
//   },
//   {
//     href: "https://youtube.com",
//     label: "YouTube",
//     icon: Youtube,
//     bgClass: "from-[#FF0000] via-[#b91c1c] to-[#0f172a]",
//     ringClass: "ring-red-500/70",
//     tooltip: "Открыть YouTube канал",
//   },
// ];

// const messengers = [
//   {
//     href: "https://t.me/",
//     label: "Telegram",
//     pillClass:
//       "border-sky-400/50 bg-sky-500/10 hover:border-sky-400/80 hover:bg-sky-500/20",
//     dotClass: "bg-sky-400",
//     tooltip: "Записаться через Telegram",
//   },
//   {
//     href: "https://wa.me/",
//     label: "WhatsApp",
//     pillClass:
//       "border-emerald-400/60 bg-emerald-500/10 hover:border-emerald-400/90 hover:bg-emerald-500/20",
//     dotClass: "bg-emerald-400",
//     tooltip: "Записаться через WhatsApp",
//   },
//   {
//     href: "viber://chat",
//     label: "Viber",
//     pillClass:
//       "border-purple-400/60 bg-purple-500/10 hover:border-purple-400/90 hover:bg-purple-500/20",
//     dotClass: "bg-purple-400",
//     tooltip: "Записаться через Viber",
//   },
// ];

// const fadeInUp = {
//   hidden: { opacity: 0, y: 18 },
//   visible: { opacity: 1, y: 0 },
// };

// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1 },
// };

// export default function SiteFooter(): React.JSX.Element {
//   const year = new Date().getFullYear();

//   const handleScrollTop = () => {
//     if (typeof window !== "undefined") {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   return (
//     <motion.footer
//       initial={{ opacity: 0, y: 18 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.55, ease: "easeOut" }}
//       className="relative mt-16 overflow-hidden border-t border-white/5 bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-sm text-slate-200"
//     >
//       {/* Неоновая линия сверху футера */}
//       <div className="pointer-events-none h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Собственный фон футера */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(244,63,94,0.2),_transparent_55%)]" />
//         <div className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-fuchsia-600/30 blur-3xl" />
//         <div className="absolute right-[-4rem] top-0 h-52 w-52 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-[-3rem] left-1/4 h-60 w-60 rounded-full bg-emerald-500/25 blur-3xl" />
//       </div>

//       <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-12">
//         {/* Верхний блок: бренд + CTA букинга */}
//         <motion.div
//           variants={fadeInUp}
//           initial="hidden"
//           animate="visible"
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className="relative flex flex-col gap-6 border-b border-white/5 pb-8 md:flex-row md:items-center md:justify-between"
//         >
//           {/* Мягкое свечение под блоком */}
//           <div className="pointer-events-none absolute inset-x-10 -top-6 h-12 rounded-full bg-white/10 blur-3xl" />

//           <div className="space-y-3">
//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.05 }}
//               className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300 shadow-[0_0_20px_rgba(15,23,42,0.9)]"
//             >
//               <span className="relative flex h-2 w-2">
//                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
//                 <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(45,255,196,0.9)]" />
//               </span>
//               <span className="text-[10px] font-medium text-slate-200">
//                 Онлайн-запись премиум-класса
//               </span>
//             </motion.div>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.45, delay: 0.12 }}
//             >
//               <div className="flex items-center gap-2">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   className="rounded-xl bg-gradient-to-r from-fuchsia-500/30 via-sky-500/15 to-emerald-400/25 p-[1px]"
//                 >
//                   <div className="flex items-center gap-1 rounded-[10px] bg-black/70 px-3 py-1.5">
//                     <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
//                       Salon Elen
//                     </span>
//                     <motion.span
//                       animate={{ width: ["1rem", "1.7rem", "1rem"] }}
//                       transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
//                       className="h-1 w-4 rounded-full bg-gradient-to-r from-fuchsia-400 to-emerald-300"
//                     />
//                   </div>
//                 </motion.div>
//               </div>
//               <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-300 sm:text-sm">
//                 Современная студия красоты в Halle с умной системой онлайн-бронирования:
//                 выберите услугу, мастера и удобное время за пару кликов — без ожидания на линии.
//               </p>
//             </motion.div>
//           </div>

//           {/* Блок букинга + кнопки */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.18 }}
//             className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
//           >
//             <motion.div
//               whileHover={{ y: -2, scale: 1.01 }}
//               transition={{ type: "spring", stiffness: 260, damping: 22 }}
//               className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-slate-950/90 to-slate-950 shadow-[0_0_32px_rgba(16,185,129,0.45)]"
//             >
//               <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/40 blur-3xl" />
//               <div className="flex items-center justify-between gap-3 px-4 pt-3">
//                 <div>
//                   <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
//                     Быстрая запись
//                   </p>
//                   <p className="text-sm font-semibold text-slate-50">
//                     Свободные слоты сегодня и на ближайшие дни
//                   </p>
//                 </div>
//                 <motion.div
//                   animate={{ rotate: [0, 8, -6, 0] }}
//                   transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
//                   className="hidden rounded-xl bg-black/40 p-2 sm:block"
//                 >
//                   <CalendarCheck className="h-5 w-5 text-emerald-300" />
//                 </motion.div>
//               </div>
//               <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-1 text-[11px] text-slate-300">
//                 <StepPill icon={Scissors} text="1. Выберите услугу" />
//                 <StepPill icon={Sparkles} text="2. Выберите мастера" />
//                 <StepPill icon={CalendarCheck} text="3. Подтвердите время" />
//               </div>
//             </motion.div>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.25 }}
//               className="flex flex-col gap-2 sm:w-48"
//             >
//               <motion.div
//                 whileHover={{ y: -2, scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               >
//                 <Link
//                   href="/booking"
//                   className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_35px_rgba(56,189,248,0.55)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
//                 >
//                   Онлайн-запись
//                   <motion.span
//                     className="inline-flex"
//                     initial={{ x: 0 }}
//                     whileHover={{ x: 4 }}
//                     transition={{ type: "spring", stiffness: 260, damping: 20 }}
//                   >
//                     <ArrowRight className="h-4 w-4" />
//                   </motion.span>
//                 </Link>
//               </motion.div>
//               <motion.a
//                 href="tel:+490000000000"
//                 whileHover={{ y: -1 }}
//                 className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/70 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
//               >
//                 <Phone className="h-3.5 w-3.5" />
//                 Позвонить администратору
//               </motion.a>
//             </motion.div>
//           </motion.div>
//         </motion.div>

//         {/* Мобильный блок соцсетей */}
//         <div className="mt-8 md:hidden">
//           <SocialsSectionMobile />
//         </div>

//         {/* Основная сетка */}
//         <motion.div
//           variants={fadeIn}
//           initial="hidden"
//           animate="visible"
//           transition={{ duration: 0.6, delay: 0.1 }}
//           className="mt-8 grid gap-6 md:grid-cols-4"
//         >
//           {/* Локация / время работы */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.05 }}
//           >
//             <ColumnCard>
//               <SectionTitle>Салон &amp; локация</SectionTitle>
//               <div className="mt-3 space-y-3 text-sm text-slate-300">
//                 <div className="flex items-start gap-2">
//                   <motion.div
//                     whileHover={{ scale: 1.1, rotate: -4 }}
//                     className="mt-0.5 rounded-full bg-sky-500/20 p-1"
//                   >
//                     <MapPin className="h-4 w-4 text-sky-400" />
//                   </motion.div>
//                   <div>
//                     <p>Halle (Saale)</p>
//                     <p className="text-xs text-slate-300">
//                       Точный адрес и подробная схема проезда — в разделе{" "}
//                       <Link href="/contacts" className="underline underline-offset-2">
//                         контакты
//                       </Link>
//                       .
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-2">
//                   <motion.div
//                     whileHover={{ scale: 1.1, rotate: 4 }}
//                     className="mt-0.5 rounded-full bg-emerald-500/20 p-1"
//                   >
//                     <Clock className="h-4 w-4 text-emerald-400" />
//                   </motion.div>
//                   <div className="space-y-1">
//                     <p>Ежедневно: 10:00 – 20:00</p>
//                     <p className="text-xs text-slate-300">
//                       Онлайн-запись доступна 24/7 — выберите удобное время даже ночью.
//                     </p>
//                   </div>
//                 </div>
//                 <div className="space-y-1 text-sm">
//                   <p className="font-medium text-slate-100">Контакты</p>
//                   <Tooltip label="Позвонить в салон">
//                     <a
//                       href="tel:+490000000000"
//                       className="flex items-center gap-2 text-slate-300 transition hover:text-emerald-300"
//                     >
//                       <Phone className="h-4 w-4" />
//                       +49 (0) 000 000 000
//                     </a>
//                   </Tooltip>
//                   <Tooltip label="Написать на e-mail">
//                     <a
//                       href="mailto:info@salon-elen.de"
//                       className="flex items-center gap-2 text-slate-300 transition hover:text-sky-300"
//                     >
//                       <Mail className="h-4 w-4" />
//                       info@salon-elen.de
//                     </a>
//                   </Tooltip>
//                 </div>
//               </div>
//             </ColumnCard>
//           </motion.div>

//           {/* Навигация */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.12 }}
//           >
//             <ColumnCard>
//               <SectionTitle>Навигация</SectionTitle>
//               <ul className="mt-3 space-y-2 text-sm text-slate-300">
//                 {mainNav.map((item, index) => {
//                   const Icon = item.icon;
//                   return (
//                     <motion.li
//                       key={item.href}
//                       variants={fadeInUp}
//                       transition={{ duration: 0.3, delay: 0.05 * index }}
//                     >
//                       <motion.div whileHover={{ x: 2 }}>
//                         <Link
//                           href={item.href}
//                           className="group inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-sky-300"
//                         >
//                           <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 ring-1 ring-white/10 shadow-[0_0_12px_rgba(15,23,42,0.9)] transition group-hover:bg-sky-500/15 group-hover:ring-sky-400/70">
//                             <Icon className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-sky-300" />
//                           </span>
//                           <span className="underline-offset-4 group-hover:underline">
//                             {item.label}
//                           </span>
//                         </Link>
//                       </motion.div>
//                     </motion.li>
//                   );
//                 })}
//               </ul>
//             </ColumnCard>
//           </motion.div>

//           {/* Для клиентов / мастеров */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.18 }}
//           >
//             <ColumnCard>
//               <SectionTitle>Для клиентов и мастеров</SectionTitle>
//               <ul className="mt-3 space-y-2 text-sm text-slate-300">
//                 {clientNav.map((item, index) => {
//                   const Icon = item.icon;
//                   return (
//                     <motion.li
//                       key={item.href}
//                       variants={fadeInUp}
//                       transition={{ duration: 0.3, delay: 0.06 * index }}
//                     >
//                       <motion.div whileHover={{ x: 2 }}>
//                         <Link
//                           href={item.href}
//                           className="group inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-emerald-300"
//                         >
//                           <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 ring-1 ring-white/10 shadow-[0_0_12px_rgba(15,23,42,0.9)] transition group-hover:bg-emerald-500/15 group-hover:ring-emerald-400/70">
//                             <Icon className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-emerald-300" />
//                           </span>
//                           <span className="underline-offset-4 group-hover:underline">
//                             {item.label}
//                           </span>
//                         </Link>
//                       </motion.div>
//                     </motion.li>
//                   );
//                 })}
//               </ul>

//               <motion.div
//                 variants={fadeInUp}
//                 transition={{ duration: 0.4, delay: 0.26 }}
//                 whileHover={{ y: -1 }}
//                 className="mt-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-slate-900/80 to-slate-950 p-3 text-xs text-slate-300"
//               >
//                 <p className="font-medium text-slate-100">Партнёрство с мастерами</p>
//                 <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
//                   Ищете современный салон с прозрачным онлайн-расписанием и комфортными
//                   условиями? Напишите нам — обсудим сотрудничество.
//                 </p>
//               </motion.div>
//             </ColumnCard>
//           </motion.div>

//           {/* Соцсети — десктоп */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.22 }}
//             className="hidden md:block"
//           >
//             <ColumnCard>
//               <SocialsSectionDesktop />
//             </ColumnCard>
//           </motion.div>
//         </motion.div>

//         {/* Нижняя полоса с кнопкой "Наверх" */}
//         <motion.div
//           variants={fadeInUp}
//           initial="hidden"
//           animate="visible"
//           transition={{ duration: 0.45, delay: 0.3 }}
//           className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-4 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between"
//         >
//           <p>© {year} Salon Elen. Все права защищены.</p>
//           <div className="flex flex-wrap items-center gap-3">
//             <motion.div whileHover={{ y: -1 }}>
//               <Link
//                 href="/privacy"
//                 className="transition hover:text-slate-200 hover:underline hover:underline-offset-4"
//               >
//                 Политика конфиденциальности
//               </Link>
//             </motion.div>
//             <motion.div whileHover={{ y: -1 }}>
//               <Link
//                 href="/terms"
//                 className="transition hover:text-slate-200 hover:underline hover:underline-offset-4"
//               >
//                 Условия использования
//               </Link>
//             </motion.div>
//             <motion.button
//               type="button"
//               onClick={handleScrollTop}
//               whileHover={{ y: -1, scale: 1.04 }}
//               whileTap={{ scale: 0.96 }}
//               className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] font-medium text-slate-200 shadow-[0_0_14px_rgba(15,23,42,0.8)] backdrop-blur-sm hover:border-sky-400/70 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
//             >
//               <ChevronUp className="h-3 w-3" />
//               Наверх
//             </motion.button>
//           </div>
//         </motion.div>
//       </div>
//     </motion.footer>
//   );
// }

// function SectionTitle(props: { children: React.ReactNode }) {
//   return (
//     <motion.div
//       whileHover={{ x: 2 }}
//       className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"
//     >
//       <span className="h-1 w-5 rounded-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-300" />
//       <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
//         {props.children}
//       </h3>
//     </motion.div>
//   );
// }

// function StepPill(props: { icon: React.ElementType; text: string }) {
//   const Icon = props.icon;
//   return (
//     <motion.span
//       whileHover={{ scale: 1.03 }}
//       className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] text-slate-200 ring-1 ring-white/10 backdrop-blur-sm"
//     >
//       <Icon className="h-3 w-3 text-emerald-300" />
//       {props.text}
//     </motion.span>
//   );
// }

// type TooltipProps = {
//   label: string;
//   children: React.ReactNode;
// };

// function Tooltip({ label, children }: TooltipProps) {
//   return (
//     <div className="group relative inline-flex">
//       {children}
//       <div className="pointer-events-none absolute -top-8 left-1/2 z-20 w-max -translate-x-1/2 rounded-full bg-black/90 px-3 py-1 text-[10px] font-medium text-slate-100 opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover:-translate-y-1 group-hover:opacity-100">
//         {label}
//       </div>
//     </div>
//   );
// }

// /* ====== Универсальная «живая» карточка секции — премиальный фон ====== */

// function ColumnCard({ children }: { children: React.ReactNode }) {
//   return (
//     <motion.div
//       whileHover={{ y: -2, scale: 1.01 }}
//       transition={{ type: "spring", stiffness: 260, damping: 24 }}
//       className="relative h-full rounded-3xl bg-gradient-to-br from-amber-400/80 via-amber-200/20 to-emerald-400/60 p-[1px] shadow-[0_0_32px_rgba(251,191,36,0.35)]"
//     >
//       {/* внутренний стеклянный слой */}
//       <div className="relative h-full rounded-[1.4rem] bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95 px-4 py-4 ring-1 ring-white/10 backdrop-blur-xl">
//         {/* мягкий блик сверху */}
//         <div className="pointer-events-none absolute -top-10 left-6 h-28 w-40 rounded-full bg-amber-300/18 blur-3xl" />
//         {children}
//       </div>
//     </motion.div>
//   );
// }

// /* ====== Блоки соцсетей / мессенджеров ====== */

// function SocialsSectionDesktop() {
//   return (
//     <>
//       <SectionTitle>Соцсети &amp; мессенджеры</SectionTitle>

//       <motion.div variants={fadeIn} className="mt-3 flex flex-wrap gap-2">
//         {socials.map((link, index) => (
//           <motion.div
//             key={link.label}
//             variants={fadeInUp}
//             transition={{ duration: 0.3, delay: 0.05 * index }}
//           >
//             <Tooltip label={link.tooltip}>
//               <motion.a
//                 href={link.href}
//                 target="_blank"
//                 rel="noreferrer"
//                 aria-label={link.label}
//                 whileHover={{ y: -3, scale: 1.08 }}
//                 whileTap={{ scale: 0.96 }}
//                 className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-slate-100 shadow-[0_0_22px_rgba(15,23,42,0.9)] backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2"
//               >
//                 <span
//                   className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${link.bgClass} opacity-70 blur-md`}
//                 />
//                 <span
//                   className={`absolute inset-[1px] rounded-full border border-white/10 ring-0 ${link.ringClass}`}
//                 />
//                 <link.icon className="relative h-4 w-4" />
//               </motion.a>
//             </Tooltip>
//           </motion.div>
//         ))}
//       </motion.div>

//       <div className="mt-3 space-y-2 text-xs text-slate-300">
//         <p className="font-medium text-slate-100">Запись через мессенджеры</p>
//         <div className="flex flex-wrap gap-1.5">
//           {messengers.map((m, index) => (
//             <motion.div
//               key={m.label}
//               variants={fadeInUp}
//               transition={{ duration: 0.3, delay: 0.08 * index }}
//             >
//               <Tooltip label={m.tooltip}>
//                 <motion.a
//                   href={m.href}
//                   target="_blank"
//                   rel="noreferrer"
//                   whileHover={{ y: -2, scale: 1.05 }}
//                   whileTap={{ scale: 0.97 }}
//                   className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] text-slate-100 backdrop-blur-sm transition ${m.pillClass}`}
//                 >
//                   <span className="relative flex h-2 w-2">
//                     <span
//                       className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dotClass} opacity-60`}
//                     />
//                     <span
//                       className={`relative inline-flex h-2 w-2 rounded-full ${m.dotClass} shadow-[0_0_10px_rgba(74,222,128,0.9)]`}
//                     />
//                   </span>
//                   {m.label}
//                 </motion.a>
//               </Tooltip>
//             </motion.div>
//           ))}
//         </div>
//         <p className="text-[11px] text-slate-400">
//           Напишите в удобном мессенджере — ответим максимально быстро ✨
//         </p>
//       </div>
//     </>
//   );
// }

// function SocialsSectionMobile() {
//   return (
//     <ColumnCard>
//       <SectionTitle>Соцсети &amp; мессенджеры</SectionTitle>

//       <div className="mt-3 flex flex-wrap gap-2">
//         {socials.map((link) => (
//           <Tooltip key={link.label} label={link.tooltip}>
//             <a
//               href={link.href}
//               target="_blank"
//               rel="noreferrer"
//               aria-label={link.label}
//               className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-slate-100 shadow-[0_0_22px_rgba(15,23,42,0.9)] backdrop-blur-sm"
//             >
//               <span
//                 className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${link.bgClass} opacity-70 blur-md`}
//               />
//               <span
//                 className={`absolute inset-[1px] rounded-full border border-white/10 ring-0 ${link.ringClass}`}
//               />
//               <link.icon className="relative h-4 w-4" />
//             </a>
//           </Tooltip>
//         ))}
//       </div>

//       <div className="mt-3 space-y-2 text-xs text-slate-300">
//         <p className="font-medium text-slate-100">Запись через мессенджеры</p>
//         <div className="flex flex-wrap gap-1.5">
//           {messengers.map((m) => (
//             <Tooltip key={m.label} label={m.tooltip}>
//               <a
//                 href={m.href}
//                 target="_blank"
//                 rel="noreferrer"
//                 className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] text-slate-100 backdrop-blur-sm transition ${m.pillClass}`}
//               >
//                 <span className="relative flex h-2 w-2">
//                   <span
//                     className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dotClass} opacity-60`}
//                   />
//                   <span
//                     className={`relative inline-flex h-2 w-2 rounded-full ${m.dotClass} shadow-[0_0_10px_rgba(74,222,128,0.9)]`}
//                   />
//                 </span>
//                 {m.label}
//               </a>
//             </Tooltip>
//           ))}
//         </div>
//         <p className="text-[11px] text-slate-400">
//           Напишите в удобном мессенджере — ответим максимально быстро ✨
//         </p>
//       </div>
//     </ColumnCard>
//   );
// }







///-----всё работает для мобилы и десктопа но пробую лучше-------
// "use client";

// import * as React from "react";
// import Link from "next/link";
// import {
//   Instagram,
//   Facebook,
//   Youtube,
//   Mail,
//   Phone,
//   MapPin,
//   Clock,
//   ArrowRight,
//   CalendarCheck,
//   Scissors,
//   Sparkles,
// } from "lucide-react";
// import { motion } from "framer-motion";

// const mainNav = [
//   { href: "/", label: "Главная" },
//   { href: "/services", label: "Услуги" },
//   { href: "/prices", label: "Цены" },
//   { href: "/news", label: "Новости" },
//   { href: "/about", label: "О нас" },
//   { href: "/contacts", label: "Контакты" },
// ];

// const clientNav = [
//   { href: "/booking", label: "Онлайн-запись" },
//   { href: "/booking/client", label: "Личный кабинет записи" },
//   { href: "/admin", label: "Вход для администратора/мастера" },
// ];

// const socials = [
//   {
//     href: "https://instagram.com",
//     label: "Instagram",
//     icon: Instagram,
//     bgClass: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
//     ringClass: "ring-fuchsia-400/70",
//     tooltip: "Открыть Instagram салона",
//   },
//   {
//     href: "https://facebook.com",
//     label: "Facebook",
//     icon: Facebook,
//     bgClass: "from-[#1877F2] via-[#1d4ed8] to-[#0f172a]",
//     ringClass: "ring-sky-400/70",
//     tooltip: "Открыть Facebook страницу",
//   },
//   {
//     href: "https://youtube.com",
//     label: "YouTube",
//     icon: Youtube,
//     bgClass: "from-[#FF0000] via-[#b91c1c] to-[#0f172a]",
//     ringClass: "ring-red-500/70",
//     tooltip: "Открыть YouTube канал",
//   },
// ];

// const messengers = [
//   {
//     href: "https://t.me/",
//     label: "Telegram",
//     pillClass:
//       "border-sky-400/50 bg-sky-500/10 hover:border-sky-400/80 hover:bg-sky-500/20",
//     dotClass: "bg-sky-400",
//     tooltip: "Записаться через Telegram",
//   },
//   {
//     href: "https://wa.me/",
//     label: "WhatsApp",
//     pillClass:
//       "border-emerald-400/60 bg-emerald-500/10 hover:border-emerald-400/90 hover:bg-emerald-500/20",
//     dotClass: "bg-emerald-400",
//     tooltip: "Записаться через WhatsApp",
//   },
//   {
//     href: "viber://chat",
//     label: "Viber",
//     pillClass:
//       "border-purple-400/60 bg-purple-500/10 hover:border-purple-400/90 hover:bg-purple-500/20",
//     dotClass: "bg-purple-400",
//     tooltip: "Записаться через Viber",
//   },
// ];

// const fadeInUp = {
//   hidden: { opacity: 0, y: 18 },
//   visible: { opacity: 1, y: 0 },
// };

// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1 },
// };

// export default function SiteFooter(): React.JSX.Element {
//   const year = new Date().getFullYear();

//   return (
//     <motion.footer
//       initial={{ opacity: 0, y: 18 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.55, ease: "easeOut" }}
//       className="relative mt-16 overflow-hidden border-t border-white/5 bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-sm text-slate-200"
//     >
//       {/* Неоновая линия с анимацией */}
//       <div className="pointer-events-none h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Светящиеся шары-фон */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute -left-10 top-0 h-48 w-48 rounded-full bg-fuchsia-600/25 blur-3xl" />
//         <div className="absolute right-0 top-10 h-52 w-52 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
//       </div>

//       <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-12">
//         {/* Верхний блок: бренд + CTA букинга */}
//         <motion.div
//           variants={fadeInUp}
//           initial="hidden"
//           animate="visible"
//           transition={{ duration: 0.5, ease: "easeOut" }}
//           className="relative flex flex-col gap-6 border-b border-white/5 pb-8 md:flex-row md:items-center md:justify-between"
//         >
//           {/* Мягкое свечение под блоком */}
//           <div className="pointer-events-none absolute inset-x-10 -top-6 h-12 rounded-full bg-white/5 blur-3xl" />

//           <div className="space-y-3">
//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.05 }}
//               className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300 shadow-[0_0_20px_rgba(15,23,42,0.9)]"
//             >
//               <span className="relative flex h-2 w-2">
//                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
//                 <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(45,255,196,0.9)]" />
//               </span>
//               <span className="text-[10px] font-medium text-slate-200">
//                 Онлайн-запись премиум-класса
//               </span>
//             </motion.div>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.45, delay: 0.12 }}
//             >
//               <div className="flex items-center gap-2">
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   className="rounded-xl bg-gradient-to-r from-fuchsia-500/20 via-sky-500/10 to-emerald-400/20 p-[1px]"
//                 >
//                   <div className="flex items-center gap-1 rounded-[10px] bg-black/60 px-3 py-1.5">
//                     <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
//                       Salon Elen
//                     </span>
//                     <motion.span
//                       animate={{ width: ["1rem", "1.7rem", "1rem"] }}
//                       transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
//                       className="h-1 w-4 rounded-full bg-gradient-to-r from-fuchsia-400 to-emerald-300"
//                     />
//                   </div>
//                 </motion.div>
//               </div>
//               <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
//                 Современная студия красоты в Halle с умной системой онлайн-бронирования:
//                 выберите услугу, мастера и удобное время за пару кликов — без ожидания на линии.
//               </p>
//             </motion.div>
//           </div>

//           {/* Блок букинга + кнопки */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.18 }}
//             className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
//           >
//             <motion.div
//               whileHover={{ y: -2, scale: 1.01 }}
//               transition={{ type: "spring", stiffness: 260, damping: 22 }}
//               className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-500/12 via-slate-950/90 to-slate-950 shadow-[0_0_32px_rgba(16,185,129,0.4)]"
//             >
//               <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/35 blur-3xl" />
//               <div className="flex items-center justify-between gap-3 px-4 pt-3">
//                 <div>
//                   <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
//                     Быстрая запись
//                   </p>
//                   <p className="text-sm font-semibold text-slate-50">
//                     Свободные слоты сегодня и на ближайшие дни
//                   </p>
//                 </div>
//                 <motion.div
//                   animate={{ rotate: [0, 8, -6, 0] }}
//                   transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
//                   className="hidden rounded-xl bg-black/40 p-2 sm:block"
//                 >
//                   <CalendarCheck className="h-5 w-5 text-emerald-300" />
//                 </motion.div>
//               </div>
//               <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-1 text-[11px] text-slate-400">
//                 <StepPill icon={Scissors} text="1. Выберите услугу" />
//                 <StepPill icon={Sparkles} text="2. Выберите мастера" />
//                 <StepPill icon={CalendarCheck} text="3. Подтвердите время" />
//               </div>
//             </motion.div>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.25 }}
//               className="flex flex-col gap-2 sm:w-48"
//             >
//               <motion.div
//                 whileHover={{ y: -2, scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               >
//                 <Link
//                   href="/booking"
//                   className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_35px_rgba(56,189,248,0.5)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
//                 >
//                   Онлайн-запись
//                   <motion.span
//                     className="inline-flex"
//                     initial={{ x: 0 }}
//                     whileHover={{ x: 4 }}
//                     transition={{ type: "spring", stiffness: 260, damping: 20 }}
//                   >
//                     <ArrowRight className="h-4 w-4" />
//                   </motion.span>
//                 </Link>
//               </motion.div>
//               <motion.a
//                 href="tel:+490000000000"
//                 whileHover={{ y: -1 }}
//                 className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
//               >
//                 <Phone className="h-3.5 w-3.5" />
//                 Позвонить администратору
//               </motion.a>
//             </motion.div>
//           </motion.div>
//         </motion.div>

//         {/* Мобильный блок соцсетей — показываем сразу, чтобы точно не отрезался высотой страницы */}
//         <div className="mt-8 md:hidden">
//           <SocialsSectionMobile />
//         </div>

//         {/* Основная сетка (на мобиле все четыре блока идут друг за другом, ничего не скрыто) */}
//         <motion.div
//           variants={fadeIn}
//           initial="hidden"
//           animate="visible"
//           transition={{ duration: 0.6, delay: 0.1 }}
//           className="mt-8 grid gap-8 md:grid-cols-4"
//         >
//           {/* Локация / время работы */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.05 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Салон &amp; локация</SectionTitle>
//             <div className="space-y-3 text-sm text-slate-300">
//               <div className="flex items-start gap-2">
//                 <motion.div
//                   whileHover={{ scale: 1.1, rotate: -4 }}
//                   className="mt-0.5 rounded-full bg-sky-500/15 p-1"
//                 >
//                   <MapPin className="h-4 w-4 text-sky-400" />
//                 </motion.div>
//                 <div>
//                   <p>Halle (Saale)</p>
//                   <p className="text-xs text-slate-400">
//                     Точный адрес и подробная схема проезда — в разделе{" "}
//                     <Link href="/contacts" className="underline underline-offset-2">
//                       контакты
//                     </Link>
//                     .
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-2">
//                 <motion.div
//                   whileHover={{ scale: 1.1, rotate: 4 }}
//                   className="mt-0.5 rounded-full bg-emerald-500/15 p-1"
//                 >
//                   <Clock className="h-4 w-4 text-emerald-400" />
//                 </motion.div>
//                 <div className="space-y-1">
//                   <p>Ежедневно: 10:00 – 20:00</p>
//                   <p className="text-xs text-slate-400">
//                     Онлайн-запись доступна 24/7 — выберите удобное время даже ночью.
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-1 text-sm">
//                 <p className="font-medium text-slate-100">Контакты</p>
//                 <Tooltip label="Позвонить в салон">
//                   <a
//                     href="tel:+490000000000"
//                     className="flex items-center gap-2 text-slate-300 transition hover:text-emerald-300"
//                   >
//                     <Phone className="h-4 w-4" />
//                     +49 (0) 000 000 000
//                   </a>
//                 </Tooltip>
//                 <Tooltip label="Написать на e-mail">
//                   <a
//                     href="mailto:info@salon-elen.de"
//                     className="flex items-center gap-2 text-slate-300 transition hover:text-sky-300"
//                   >
//                     <Mail className="h-4 w-4" />
//                     info@salon-elen.de
//                   </a>
//                 </Tooltip>
//               </div>
//             </div>
//           </motion.div>

//           {/* Навигация по сайту */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.12 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Навигация</SectionTitle>
//             <ul className="space-y-2 text-sm text-slate-300">
//               {mainNav.map((item, index) => (
//                 <motion.li
//                   key={item.href}
//                   variants={fadeInUp}
//                   transition={{ duration: 0.3, delay: 0.05 * index }}
//                 >
//                   <motion.div whileHover={{ x: 2 }}>
//                     <Link
//                       href={item.href}
//                       className="group inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-sky-300"
//                     >
//                       <span className="h-1 w-1 rounded-full bg-sky-400/70 transition group-hover:w-3 group-hover:bg-emerald-300" />
//                       <span className="underline-offset-4 group-hover:underline">
//                         {item.label}
//                       </span>
//                     </Link>
//                   </motion.div>
//                 </motion.li>
//               ))}
//             </ul>
//           </motion.div>

//           {/* Для клиентов / мастеров */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.18 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Для клиентов и мастеров</SectionTitle>
//             <ul className="space-y-2 text-sm text-slate-300">
//               {clientNav.map((item, index) => (
//                 <motion.li
//                   key={item.href}
//                   variants={fadeInUp}
//                   transition={{ duration: 0.3, delay: 0.06 * index }}
//                 >
//                   <motion.div whileHover={{ x: 2 }}>
//                     <Link
//                       href={item.href}
//                       className="group inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-emerald-300"
//                     >
//                       <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/18 text-[9px] font-semibold text-emerald-300 group-hover:bg-emerald-400/30">
//                         •
//                       </span>
//                       <span className="underline-offset-4 group-hover:underline">
//                         {item.label}
//                       </span>
//                     </Link>
//                   </motion.div>
//                 </motion.li>
//               ))}
//             </ul>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.26 }}
//               whileHover={{ y: -1 }}
//               className="mt-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-slate-900/70 to-slate-950 p-3 text-xs text-slate-300"
//             >
//               <p className="font-medium text-slate-100">Партнёрство с мастерами</p>
//               <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
//                 Ищете современный салон с прозрачным онлайн-расписанием и комфортными условиями?
//                 Напишите нам — обсудим сотрудничество.
//               </p>
//             </motion.div>
//           </motion.div>

//           {/* Соцсети и мессенджеры — десктопная версия (на мобиле скрыта, чтобы не было дублирования) */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.22 }}
//             className="hidden space-y-4 md:block"
//           >
//             <SocialsSectionDesktop />
//           </motion.div>
//         </motion.div>

//         {/* Нижняя полоса */}
//         <motion.div
//           variants={fadeInUp}
//           initial="hidden"
//           animate="visible"
//           transition={{ duration: 0.45, delay: 0.3 }}
//           className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-4 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between"
//         >
//           <p>© {year} Salon Elen. Все права защищены.</p>
//           <div className="flex flex-wrap gap-3">
//             <motion.div whileHover={{ y: -1 }}>
//               <Link
//                 href="/privacy"
//                 className="transition hover:text-slate-300 hover:underline hover:underline-offset-4"
//               >
//                 Политика конфиденциальности
//               </Link>
//             </motion.div>
//             <motion.div whileHover={{ y: -1 }}>
//               <Link
//                 href="/terms"
//                 className="transition hover:text-slate-300 hover:underline hover:underline-offset-4"
//               >
//                 Условия использования
//               </Link>
//             </motion.div>
//           </div>
//         </motion.div>
//       </div>
//     </motion.footer>
//   );
// }

// function SectionTitle(props: { children: React.ReactNode }) {
//   return (
//     <motion.div
//       whileHover={{ x: 2 }}
//       className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1"
//     >
//       <span className="h-1 w-5 rounded-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-300" />
//       <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
//         {props.children}
//       </h3>
//     </motion.div>
//   );
// }

// function StepPill(props: { icon: React.ElementType; text: string }) {
//   const Icon = props.icon;
//   return (
//     <motion.span
//       whileHover={{ scale: 1.03 }}
//       className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] text-slate-300 ring-1 ring-white/5 backdrop-blur-sm"
//     >
//       <Icon className="h-3 w-3 text-emerald-300" />
//       {props.text}
//     </motion.span>
//   );
// }

// type TooltipProps = {
//   label: string;
//   children: React.ReactNode;
// };

// function Tooltip({ label, children }: TooltipProps) {
//   return (
//     <div className="group relative inline-flex">
//       {children}
//       <div className="pointer-events-none absolute -top-8 left-1/2 z-20 w-max -translate-x-1/2 rounded-full bg-black/90 px-3 py-1 text-[10px] font-medium text-slate-100 opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover:-translate-y-1 group-hover:opacity-100">
//         {label}
//       </div>
//     </div>
//   );
// }

// /* ====== БЛОКИ СОЦСЕТЕЙ / МЕССЕНДЖЕРОВ ====== */

// function SocialsSectionDesktop() {
//   return (
//     <>
//       <SectionTitle>Соцсети &amp; мессенджеры</SectionTitle>

//       {/* Соцсети */}
//       <motion.div variants={fadeIn} className="flex flex-wrap gap-2">
//         {socials.map((link, index) => (
//           <motion.div
//             key={link.label}
//             variants={fadeInUp}
//             transition={{ duration: 0.3, delay: 0.05 * index }}
//           >
//             <Tooltip label={link.tooltip}>
//               <motion.a
//                 href={link.href}
//                 target="_blank"
//                 rel="noreferrer"
//                 aria-label={link.label}
//                 whileHover={{ y: -3, scale: 1.08 }}
//                 whileTap={{ scale: 0.96 }}
//                 className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-slate-100 shadow-[0_0_22px_rgba(15,23,42,0.9)] backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2"
//               >
//                 <span
//                   className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${link.bgClass} opacity-70 blur-md`}
//                 />
//                 <span
//                   className={`absolute inset-[1px] rounded-full border border-white/10 ring-0 ${link.ringClass}`}
//                 />
//                 <link.icon className="relative h-4 w-4" />
//               </motion.a>
//             </Tooltip>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* Мессенджеры */}
//       <div className="space-y-2 text-xs text-slate-300">
//         <p className="font-medium text-slate-100">Запись через мессенджеры</p>
//         <div className="flex flex-wrap gap-1.5">
//           {messengers.map((m, index) => (
//             <motion.div
//               key={m.label}
//               variants={fadeInUp}
//               transition={{ duration: 0.3, delay: 0.08 * index }}
//             >
//               <Tooltip label={m.tooltip}>
//                 <motion.a
//                   href={m.href}
//                   target="_blank"
//                   rel="noreferrer"
//                   whileHover={{ y: -2, scale: 1.05 }}
//                   whileTap={{ scale: 0.97 }}
//                   className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] text-slate-100 backdrop-blur-sm transition ${m.pillClass}`}
//                 >
//                   <span className="relative flex h-2 w-2">
//                     <span
//                       className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dotClass} opacity-60`}
//                     />
//                     <span
//                       className={`relative inline-flex h-2 w-2 rounded-full ${m.dotClass} shadow-[0_0_10px_rgba(74,222,128,0.9)]`}
//                     />
//                   </span>
//                   {m.label}
//                 </motion.a>
//               </Tooltip>
//             </motion.div>
//           ))}
//         </div>
//         <p className="text-[11px] text-slate-500">
//           Напишите в удобном мессенджере — ответим максимально быстро ✨
//         </p>
//       </div>
//     </>
//   );
// }

// function SocialsSectionMobile() {
//   return (
//     <div className="space-y-4">
//       <SectionTitle>Соцсети &amp; мессенджеры</SectionTitle>

//       <div className="flex flex-wrap gap-2">
//         {socials.map((link) => (
//           <Tooltip key={link.label} label={link.tooltip}>
//             <a
//               href={link.href}
//               target="_blank"
//               rel="noreferrer"
//               aria-label={link.label}
//               className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-slate-100 shadow-[0_0_22px_rgba(15,23,42,0.9)] backdrop-blur-sm"
//             >
//               <span
//                 className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${link.bgClass} opacity-70 blur-md`}
//               />
//               <span
//                 className={`absolute inset-[1px] rounded-full border border-white/10 ring-0 ${link.ringClass}`}
//               />
//               <link.icon className="relative h-4 w-4" />
//             </a>
//           </Tooltip>
//         ))}
//       </div>

//       <div className="space-y-2 text-xs text-slate-300">
//         <p className="font-medium text-slate-100">Запись через мессенджеры</p>
//         <div className="flex flex-wrap gap-1.5">
//           {messengers.map((m) => (
//             <Tooltip key={m.label} label={m.tooltip}>
//               <a
//                 href={m.href}
//                 target="_blank"
//                 rel="noreferrer"
//                 className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] text-slate-100 backdrop-blur-sm transition ${m.pillClass}`}
//               >
//                 <span className="relative flex h-2 w-2">
//                   <span
//                     className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dotClass} opacity-60`}
//                   />
//                   <span
//                     className={`relative inline-flex h-2 w-2 rounded-full ${m.dotClass} shadow-[0_0_10px_rgba(74,222,128,0.9)]`}
//                   />
//                 </span>
//                 {m.label}
//               </a>
//             </Tooltip>
//           ))}
//         </div>
//         <p className="text-[11px] text-slate-500">
//           Напишите в удобном мессенджере — ответим максимально быстро ✨
//         </p>
//       </div>
//     </div>
//   );
// }




//------уже супер но хочу лучше-------
// "use client";

// import * as React from "react";
// import Link from "next/link";
// import {
//   Instagram,
//   Facebook,
//   Youtube,
//   Mail,
//   Phone,
//   MapPin,
//   Clock,
//   ArrowRight,
//   CalendarCheck,
//   Scissors,
//   Sparkles,
// } from "lucide-react";
// import { motion } from "framer-motion";

// const mainNav = [
//   { href: "/", label: "Главная" },
//   { href: "/services", label: "Услуги" },
//   { href: "/prices", label: "Цены" },
//   { href: "/news", label: "Новости" },
//   { href: "/about", label: "О нас" },
//   { href: "/contacts", label: "Контакты" },
// ];

// const clientNav = [
//   { href: "/booking", label: "Онлайн-запись" },
//   { href: "/booking/client", label: "Личный кабинет записи" },
//   { href: "/admin", label: "Вход для администратора/мастера" },
// ];

// const socials = [
//   {
//     href: "https://instagram.com",
//     label: "Instagram",
//     icon: Instagram,
//     bgClass: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
//     ringClass: "ring-fuchsia-400/70",
//     tooltip: "Открыть Instagram салона",
//   },
//   {
//     href: "https://facebook.com",
//     label: "Facebook",
//     icon: Facebook,
//     bgClass: "from-[#1877F2] via-[#1d4ed8] to-[#0f172a]",
//     ringClass: "ring-sky-400/70",
//     tooltip: "Открыть Facebook страницу",
//   },
//   {
//     href: "https://youtube.com",
//     label: "YouTube",
//     icon: Youtube,
//     bgClass: "from-[#FF0000] via-[#b91c1c] to-[#0f172a]",
//     ringClass: "ring-red-500/70",
//     tooltip: "Открыть YouTube канал",
//   },
// ];

// const messengers = [
//   {
//     href: "https://t.me/",
//     label: "Telegram",
//     pillClass:
//       "border-sky-400/50 bg-sky-500/10 hover:border-sky-400/80 hover:bg-sky-500/20",
//     dotClass: "bg-sky-400",
//     tooltip: "Записаться через Telegram",
//   },
//   {
//     href: "https://wa.me/",
//     label: "WhatsApp",
//     pillClass:
//       "border-emerald-400/60 bg-emerald-500/10 hover:border-emerald-400/90 hover:bg-emerald-500/20",
//     dotClass: "bg-emerald-400",
//     tooltip: "Записаться через WhatsApp",
//   },
//   {
//     href: "viber://chat",
//     label: "Viber",
//     pillClass:
//       "border-purple-400/60 bg-purple-500/10 hover:border-purple-400/90 hover:bg-purple-500/20",
//     dotClass: "bg-purple-400",
//     tooltip: "Записаться через Viber",
//   },
// ];

// const fadeInUp = {
//   hidden: { opacity: 0, y: 18 },
//   visible: { opacity: 1, y: 0 },
// };

// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1 },
// };

// export default function SiteFooter(): React.JSX.Element {
//   const year = new Date().getFullYear();

//   return (
//     <motion.footer
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: true, margin: "-80px" }}
//       transition={{ staggerChildren: 0.08 }}
//       className="relative mt-16 overflow-hidden border-t border-white/5 bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-sm text-slate-200"
//     >
//       {/* Неоновая линия с анимацией */}
//       <div className="pointer-events-none h-px w-full bg-[linear-gradient(90deg,#f97316,#ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Светящиеся шары-фон */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute -left-10 top-0 h-48 w-48 rounded-full bg-fuchsia-600/25 blur-3xl" />
//         <div className="absolute right-0 top-10 h-52 w-52 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
//       </div>

//       <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-12">
//         {/* Верхний блок: бренд + CTA букинга */}
//         <motion.div
//           variants={fadeInUp}
//           transition={{ duration: 0.4, ease: "easeOut" }}
//           className="relative flex flex-col gap-6 border-b border-white/5 pb-8 md:flex-row md:items-center md:justify-between"
//         >
//           {/* Мягкое свечение под блоком */}
//           <div className="pointer-events-none absolute inset-x-10 -top-6 h-12 rounded-full bg-white/5 blur-3xl" />

//           <div className="space-y-3">
//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.05 }}
//               className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300 shadow-[0_0_20px_rgba(15,23,42,0.9)]"
//             >
//               <span className="relative flex h-2 w-2">
//                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
//                 <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(45,255,196,0.9)]" />
//               </span>
//               <span className="text-[10px] font-medium text-slate-200">
//                 Онлайн-запись премиум-класса
//               </span>
//             </motion.div>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.45, delay: 0.12 }}
//             >
//               <div className="flex items-center gap-2">
//                 <div className="rounded-xl bg-gradient-to-r from-fuchsia-500/20 via-sky-500/10 to-emerald-400/20 p-[1px]">
//                   <div className="flex items-center gap-1 rounded-[10px] bg-black/60 px-3 py-1.5">
//                     <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
//                       Salon Elen
//                     </span>
//                     <span className="h-1 w-7 rounded-full bg-gradient-to-r from-fuchsia-400 to-emerald-300" />
//                   </div>
//                 </div>
//               </div>
//               <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
//                 Современная студия красоты в Halle с умной системой онлайн-бронирования:
//                 выберите услугу, мастера и удобное время за пару кликов — без ожидания на линии.
//               </p>
//             </motion.div>
//           </div>

//           {/* Блок букинга + кнопки */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.18 }}
//             className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
//           >
//             <motion.div
//               whileHover={{ y: -2, scale: 1.01 }}
//               transition={{ type: "spring", stiffness: 260, damping: 22 }}
//               className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-500/12 via-slate-950/90 to-slate-950 shadow-[0_0_32px_rgba(16,185,129,0.4)]"
//             >
//               <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/35 blur-3xl" />
//               <div className="flex items-center justify-between gap-3 px-4 pt-3">
//                 <div>
//                   <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
//                     Быстрая запись
//                   </p>
//                   <p className="text-sm font-semibold text-slate-50">
//                     Свободные слоты сегодня и на ближайшие дни
//                   </p>
//                 </div>
//                 <motion.div
//                   animate={{ rotate: [0, 8, -6, 0] }}
//                   transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
//                   className="hidden rounded-xl bg-black/40 p-2 sm:block"
//                 >
//                   <CalendarCheck className="h-5 w-5 text-emerald-300" />
//                 </motion.div>
//               </div>
//               <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-1 text-[11px] text-slate-400">
//                 <StepPill icon={Scissors} text="1. Выберите услугу" />
//                 <StepPill icon={Sparkles} text="2. Выберите мастера" />
//                 <StepPill icon={CalendarCheck} text="3. Подтвердите время" />
//               </div>
//             </motion.div>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.25 }}
//               className="flex flex-col gap-2 sm:w-48"
//             >
//               <motion.div
//                 whileHover={{ y: -2, scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               >
//                 <Link
//                   href="/booking"
//                   className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_35px_rgba(56,189,248,0.5)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
//                 >
//                   Онлайн-запись
//                   <motion.span
//                     className="inline-flex"
//                     initial={{ x: 0 }}
//                     whileHover={{ x: 4 }}
//                     transition={{ type: "spring", stiffness: 260, damping: 20 }}
//                   >
//                     <ArrowRight className="h-4 w-4" />
//                   </motion.span>
//                 </Link>
//               </motion.div>
//               <a
//                 href="tel:+490000000000"
//                 className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
//               >
//                 <Phone className="h-3.5 w-3.5" />
//                 Позвонить администратору
//               </a>
//             </motion.div>
//           </motion.div>
//         </motion.div>

//         {/* Основная сетка */}
//         <motion.div
//           variants={fadeIn}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="mt-8 grid gap-8 md:grid-cols-4"
//         >
//           {/* Локация / время работы */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.05 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Салон &amp; локация</SectionTitle>
//             <div className="space-y-3 text-sm text-slate-300">
//               <div className="flex items-start gap-2">
//                 <motion.div
//                   whileHover={{ scale: 1.1, rotate: -4 }}
//                   className="mt-0.5 rounded-full bg-sky-500/15 p-1"
//                 >
//                   <MapPin className="h-4 w-4 text-sky-400" />
//                 </motion.div>
//                 <div>
//                   <p>Halle (Saale)</p>
//                   <p className="text-xs text-slate-400">
//                     Точный адрес и подробная схема проезда — в разделе{" "}
//                     <Link href="/contacts" className="underline underline-offset-2">
//                       контакты
//                     </Link>
//                     .
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-2">
//                 <motion.div
//                   whileHover={{ scale: 1.1, rotate: 4 }}
//                   className="mt-0.5 rounded-full bg-emerald-500/15 p-1"
//                 >
//                   <Clock className="h-4 w-4 text-emerald-400" />
//                 </motion.div>
//                 <div className="space-y-1">
//                   <p>Ежедневно: 10:00 – 20:00</p>
//                   <p className="text-xs text-slate-400">
//                     Онлайн-запись доступна 24/7 — выберите удобное время даже ночью.
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-1 text-sm">
//                 <p className="font-medium text-slate-100">Контакты</p>
//                 <a
//                   href="tel:+490000000000"
//                   className="flex items-center gap-2 text-slate-300 transition hover:text-emerald-300"
//                 >
//                   <Phone className="h-4 w-4" />
//                   +49 (0) 000 000 000
//                 </a>
//                 <a
//                   href="mailto:info@salon-elen.de"
//                   className="flex items-center gap-2 text-slate-300 transition hover:text-sky-300"
//                 >
//                   <Mail className="h-4 w-4" />
//                   info@salon-elen.de
//                 </a>
//               </div>
//             </div>
//           </motion.div>

//           {/* Навигация по сайту */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.12 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Навигация</SectionTitle>
//             <ul className="space-y-2 text-sm text-slate-300">
//               {mainNav.map((item, index) => (
//                 <motion.li
//                   key={item.href}
//                   variants={fadeInUp}
//                   transition={{ duration: 0.3, delay: 0.05 * index }}
//                 >
//                   <Link
//                     href={item.href}
//                     className="inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-sky-300"
//                   >
//                     <span className="h-1 w-1 rounded-full bg-sky-400/70 transition group-hover:w-3 group-hover:bg-emerald-300" />
//                     <span className="underline-offset-4 hover:underline">
//                       {item.label}
//                     </span>
//                   </Link>
//                 </motion.li>
//               ))}
//             </ul>
//           </motion.div>

//           {/* Для клиентов / мастеров */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.18 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Для клиентов и мастеров</SectionTitle>
//             <ul className="space-y-2 text-sm text-slate-300">
//               {clientNav.map((item, index) => (
//                 <motion.li
//                   key={item.href}
//                   variants={fadeInUp}
//                   transition={{ duration: 0.3, delay: 0.06 * index }}
//                 >
//                   <Link
//                     href={item.href}
//                     className="inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-emerald-300"
//                   >
//                     <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/18 text-[9px] font-semibold text-emerald-300 hover:bg-emerald-400/30">
//                       •
//                     </span>
//                     <span className="underline-offset-4 hover:underline">
//                       {item.label}
//                     </span>
//                   </Link>
//                 </motion.li>
//               ))}
//             </ul>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.26 }}
//               whileHover={{ y: -1 }}
//               className="mt-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-slate-900/70 to-slate-950 p-3 text-xs text-slate-300"
//             >
//               <p className="font-medium text-slate-100">Партнёрство с мастерами</p>
//               <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
//                 Ищете современный салон с прозрачным онлайн-расписанием и комфортными условиями?
//                 Напишите нам — обсудим сотрудничество.
//               </p>
//             </motion.div>
//           </motion.div>

//           {/* Соцсети и мессенджеры с цветом и tooltip’ами */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.22 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Соцсети &amp; мессенджеры</SectionTitle>

//             {/* Соцсети */}
//             <motion.div variants={fadeIn} className="flex flex-wrap gap-2">
//               {socials.map((link, index) => (
//                 <motion.div
//                   key={link.label}
//                   variants={fadeInUp}
//                   transition={{ duration: 0.3, delay: 0.05 * index }}
//                 >
//                   <Tooltip label={link.tooltip}>
//                     <motion.a
//                       href={link.href}
//                       target="_blank"
//                       rel="noreferrer"
//                       aria-label={link.label}
//                       whileHover={{ y: -3, scale: 1.08 }}
//                       whileTap={{ scale: 0.96 }}
//                       className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-slate-100 shadow-[0_0_22px_rgba(15,23,42,0.9)] backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2"
//                     >
//                       {/* внешнее сияние */}
//                       <span
//                         className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-br ${link.bgClass} opacity-70 blur-md`}
//                       />
//                       {/* внутренняя граница */}
//                       <span
//                         className={`absolute inset-[1px] rounded-full border border-white/10 ring-0 ${link.ringClass}`}
//                       />
//                       {/* лёгкий micro-ping при hover (через group нам не нужен, просто постоянный low-opacity) */}
//                       <span className="pointer-events-none absolute h-full w-full rounded-full bg-white/5 opacity-0" />
//                       <link.icon className="relative h-4 w-4" />
//                     </motion.a>
//                   </Tooltip>
//                 </motion.div>
//               ))}
//             </motion.div>

//             {/* Мессенджеры */}
//             <div className="space-y-2 text-xs text-slate-300">
//               <p className="font-medium text-slate-100">Запись через мессенджеры</p>
//               <div className="flex flex-wrap gap-1.5">
//                 {messengers.map((m, index) => (
//                   <motion.div
//                     key={m.label}
//                     variants={fadeInUp}
//                     transition={{ duration: 0.3, delay: 0.08 * index }}
//                   >
//                     <Tooltip label={m.tooltip}>
//                       <motion.a
//                         href={m.href}
//                         target="_blank"
//                         rel="noreferrer"
//                         whileHover={{ y: -2, scale: 1.05 }}
//                         whileTap={{ scale: 0.97 }}
//                         className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] text-slate-100 backdrop-blur-sm transition ${m.pillClass}`}
//                       >
//                         {/* индикатор онлайн-статуса */}
//                         <span className="relative flex h-2 w-2">
//                           <span
//                             className={`absolute inline-flex h-full w-full animate-ping rounded-full ${m.dotClass} opacity-60`}
//                           />
//                           <span
//                             className={`relative inline-flex h-2 w-2 rounded-full ${m.dotClass} shadow-[0_0_10px_rgba(74,222,128,0.9)]`}
//                           />
//                         </span>
//                         {m.label}
//                       </motion.a>
//                     </Tooltip>
//                   </motion.div>
//                 ))}
//               </div>
//               <p className="text-[11px] text-slate-500">
//                 Напишите в удобном мессенджере — ответим максимально быстро ✨
//               </p>
//             </div>
//           </motion.div>
//         </motion.div>

//         {/* Нижняя полоса */}
//         <motion.div
//           variants={fadeInUp}
//           transition={{ duration: 0.45, delay: 0.28 }}
//           className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-4 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between"
//         >
//           <p>© {year} Salon Elen. Все права защищены.</p>
//           <div className="flex flex-wrap gap-3">
//             <Link
//               href="/privacy"
//               className="transition hover:text-slate-300 hover:underline hover:underline-offset-4"
//             >
//               Политика конфиденциальности
//             </Link>
//             <Link
//               href="/terms"
//               className="transition hover:text-slate-300 hover:underline hover:underline-offset-4"
//             >
//               Условия использования
//             </Link>
//           </div>
//         </motion.div>
//       </div>
//     </motion.footer>
//   );
// }

// function SectionTitle(props: { children: React.ReactNode }) {
//   return (
//     <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
//       <span className="h-1 w-5 rounded-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-300" />
//       <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
//         {props.children}
//       </h3>
//     </div>
//   );
// }

// function StepPill(props: { icon: React.ElementType; text: string }) {
//   const Icon = props.icon;
//   return (
//     <motion.span
//       whileHover={{ scale: 1.03 }}
//       className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] text-slate-300 ring-1 ring-white/5 backdrop-blur-sm"
//     >
//       <Icon className="h-3 w-3 text-emerald-300" />
//       {props.text}
//     </motion.span>
//   );
// }

// type TooltipProps = {
//   label: string;
//   children: React.ReactNode;
// };

// function Tooltip({ label, children }: TooltipProps) {
//   return (
//     <div className="group relative inline-flex">
//       {children}
//       <div className="pointer-events-none absolute -top-8 left-1/2 z-20 w-max -translate-x-1/2 rounded-full bg-black/90 px-3 py-1 text-[10px] font-medium text-slate-100 opacity-0 shadow-lg ring-1 ring-white/10 transition group-hover:-translate-y-1 group-hover:opacity-100">
//         {label}
//       </div>
//     </div>
//   );
// }



//-----------хорошо но работаем дальше над новым футером---------//
// "use client";

// import * as React from "react";
// import Link from "next/link";
// import {
//   Instagram,
//   Facebook,
//   Youtube,
//   Mail,
//   Phone,
//   MapPin,
//   Clock,
//   ArrowRight,
//   CalendarCheck,
//   Scissors,
//   Sparkles,
// } from "lucide-react";
// import { motion } from "framer-motion";

// const mainNav = [
//   { href: "/", label: "Главная" },
//   { href: "/services", label: "Услуги" },
//   { href: "/prices", label: "Цены" },
//   { href: "/news", label: "Новости" },
//   { href: "/about", label: "О нас" },
//   { href: "/contacts", label: "Контакты" },
// ];

// const clientNav = [
//   { href: "/booking", label: "Онлайн-запись" },
//   { href: "/booking/client", label: "Личный кабинет записи" },
//   { href: "/admin", label: "Вход для администратора/мастера" },
// ];

// const socials = [
//   {
//     href: "https://instagram.com",
//     label: "Instagram",
//     icon: Instagram,
//   },
//   {
//     href: "https://facebook.com",
//     label: "Facebook",
//     icon: Facebook,
//   },
//   {
//     href: "https://youtube.com",
//     label: "YouTube",
//     icon: Youtube,
//   },
// ];

// const messengers = [
//   {
//     href: "https://t.me/",
//     label: "Telegram",
//   },
//   {
//     href: "https://wa.me/",
//     label: "WhatsApp",
//   },
//   {
//     href: "viber://chat",
//     label: "Viber",
//   },
// ];

// const fadeInUp = {
//   hidden: { opacity: 0, y: 18 },
//   visible: { opacity: 1, y: 0 },
// };

// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1 },
// };

// export default function SiteFooter(): React.JSX.Element {
//   const year = new Date().getFullYear();

//   return (
//     <motion.footer
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: true, margin: "-80px" }}
//       transition={{ staggerChildren: 0.08 }}
//       className="relative mt-16 overflow-hidden border-t border-white/5 bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-sm text-slate-200"
//     >
//       {/* Неоновая линия */}
//       <div className="pointer-events-none h-px w-full bg-[linear-gradient(90deg,#f97316, #ec4899,#22d3ee,#22c55e,#f97316)] bg-[length:200%_2px] animate-[bg-slide_9s_linear_infinite]" />

//       {/* Светящиеся шары-фон (мягкий премиум glow) */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         <div className="absolute -left-10 top-0 h-48 w-48 rounded-full bg-fuchsia-600/25 blur-3xl" />
//         <div className="absolute right-0 top-10 h-52 w-52 rounded-full bg-sky-500/25 blur-3xl" />
//         <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
//       </div>

//       <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-12">
//         {/* Верхний блок: бренд + CTA букинга */}
//         <motion.div
//           variants={fadeInUp}
//           transition={{ duration: 0.4, ease: "easeOut" }}
//           className="relative flex flex-col gap-6 border-b border-white/5 pb-8 md:flex-row md:items-center md:justify-between"
//         >
//           {/* Мягкое свечение под блоком */}
//           <div className="pointer-events-none absolute inset-x-10 -top-6 h-12 rounded-full bg-white/5 blur-3xl" />

//           <div className="space-y-3">
//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.05 }}
//               className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300 shadow-[0_0_20px_rgba(15,23,42,0.9)]"
//             >
//               <span className="relative flex h-2 w-2">
//                 <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
//                 <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(45,255,196,0.9)]" />
//               </span>
//               <span className="text-[10px] font-medium text-slate-200">
//                 Онлайн-запись премиум-класса
//               </span>
//             </motion.div>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.45, delay: 0.12 }}
//             >
//               <div className="flex items-center gap-2">
//                 <div className="rounded-xl bg-gradient-to-r from-fuchsia-500/20 via-sky-500/10 to-emerald-400/20 p-[1px]">
//                   <div className="flex items-center gap-1 rounded-[10px] bg-black/60 px-3 py-1.5">
//                     <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
//                       Salon Elen
//                     </span>
//                     <span className="h-1 w-7 rounded-full bg-gradient-to-r from-fuchsia-400 to-emerald-300" />
//                   </div>
//                 </div>
//               </div>
//               <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
//                 Современная студия красоты в Halle с умной системой онлайн-бронирования:
//                 выберите услугу, мастера и удобное время за пару кликов — без ожидания на линии.
//               </p>
//             </motion.div>
//           </div>

//           {/* Блок букинга + кнопки */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.18 }}
//             className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
//           >
//             <motion.div
//               whileHover={{ y: -2, scale: 1.01 }}
//               transition={{ type: "spring", stiffness: 260, damping: 22 }}
//               className="relative flex flex-1 flex-col gap-2 overflow-hidden rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-500/12 via-slate-950/90 to-slate-950 shadow-[0_0_32px_rgba(16,185,129,0.4)]"
//             >
//               <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-400/35 blur-3xl" />
//               <div className="flex items-center justify-between gap-3 px-4 pt-3">
//                 <div>
//                   <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
//                     Быстрая запись
//                   </p>
//                   <p className="text-sm font-semibold text-slate-50">
//                     Свободные слоты сегодня и на ближайшие дни
//                   </p>
//                 </div>
//                 <motion.div
//                   animate={{ rotate: [0, 8, -6, 0] }}
//                   transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
//                   className="hidden rounded-xl bg-black/40 p-2 sm:block"
//                 >
//                   <CalendarCheck className="h-5 w-5 text-emerald-300" />
//                 </motion.div>
//               </div>
//               <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-1 text-[11px] text-slate-400">
//                 <StepPill icon={Scissors} text="1. Выберите услугу" />
//                 <StepPill icon={Sparkles} text="2. Выберите мастера" />
//                 <StepPill icon={CalendarCheck} text="3. Подтвердите время" />
//               </div>
//             </motion.div>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.25 }}
//               className="flex flex-col gap-2 sm:w-48"
//             >
//               <motion.div
//                 whileHover={{ y: -2, scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               >
//                 <Link
//                   href="/booking"
//                   className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_14px_35px_rgba(56,189,248,0.5)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
//                 >
//                   Онлайн-запись
//                   <motion.span
//                     className="inline-flex"
//                     initial={{ x: 0 }}
//                     whileHover={{ x: 4 }}
//                     transition={{ type: "spring", stiffness: 260, damping: 20 }}
//                   >
//                     <ArrowRight className="h-4 w-4" />
//                   </motion.span>
//                 </Link>
//               </motion.div>
//               <a
//                 href="tel:+490000000000"
//                 className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
//               >
//                 <Phone className="h-3.5 w-3.5" />
//                 Позвонить администратору
//               </a>
//             </motion.div>
//           </motion.div>
//         </motion.div>

//         {/* Основная сетка */}
//         <motion.div
//           variants={fadeIn}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="mt-8 grid gap-8 md:grid-cols-4"
//         >
//           {/* Локация / время работы */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.05 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Салон &amp; локация</SectionTitle>
//             <div className="space-y-3 text-sm text-slate-300">
//               <div className="flex items-start gap-2">
//                 <motion.div
//                   whileHover={{ scale: 1.1, rotate: -4 }}
//                   className="mt-0.5 rounded-full bg-sky-500/15 p-1"
//                 >
//                   <MapPin className="h-4 w-4 text-sky-400" />
//                 </motion.div>
//                 <div>
//                   <p>Halle (Saale)</p>
//                   <p className="text-xs text-slate-400">
//                     Точный адрес и подробная схема проезда — в разделе{" "}
//                     <Link href="/contacts" className="underline underline-offset-2">
//                       контакты
//                     </Link>
//                     .
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-2">
//                 <motion.div
//                   whileHover={{ scale: 1.1, rotate: 4 }}
//                   className="mt-0.5 rounded-full bg-emerald-500/15 p-1"
//                 >
//                   <Clock className="h-4 w-4 text-emerald-400" />
//                 </motion.div>
//                 <div className="space-y-1">
//                   <p>Ежедневно: 10:00 – 20:00</p>
//                   <p className="text-xs text-slate-400">
//                     Онлайн-запись доступна 24/7 — выберите удобное время даже ночью.
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-1 text-sm">
//                 <p className="font-medium text-slate-100">Контакты</p>
//                 <a
//                   href="tel:+490000000000"
//                   className="flex items-center gap-2 text-slate-300 transition hover:text-emerald-300"
//                 >
//                   <Phone className="h-4 w-4" />
//                   +49 (0) 000 000 000
//                 </a>
//                 <a
//                   href="mailto:info@salon-elen.de"
//                   className="flex items-center gap-2 text-slate-300 transition hover:text-sky-300"
//                 >
//                   <Mail className="h-4 w-4" />
//                   info@salon-elen.de
//                 </a>
//               </div>
//             </div>
//           </motion.div>

//           {/* Навигация по сайту */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.12 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Навигация</SectionTitle>
//             <ul className="space-y-2 text-sm text-slate-300">
//               {mainNav.map((item, index) => (
//                 <motion.li
//                   key={item.href}
//                   variants={fadeInUp}
//                   transition={{ duration: 0.3, delay: 0.05 * index }}
//                 >
//                   <Link
//                     href={item.href}
//                     className="group inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-sky-300"
//                   >
//                     <span className="h-1 w-1 rounded-full bg-sky-400/70 transition group-hover:w-3 group-hover:bg-emerald-300" />
//                     <span className="underline-offset-4 group-hover:underline">
//                       {item.label}
//                     </span>
//                   </Link>
//                 </motion.li>
//               ))}
//             </ul>
//           </motion.div>

//           {/* Для клиентов / мастеров */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.18 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Для клиентов и мастеров</SectionTitle>
//             <ul className="space-y-2 text-sm text-slate-300">
//               {clientNav.map((item, index) => (
//                 <motion.li
//                   key={item.href}
//                   variants={fadeInUp}
//                   transition={{ duration: 0.3, delay: 0.06 * index }}
//                 >
//                   <Link
//                     href={item.href}
//                     className="group inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-emerald-300"
//                   >
//                     <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/18 text-[9px] font-semibold text-emerald-300 group-hover:bg-emerald-400/30">
//                       •
//                     </span>
//                     <span className="underline-offset-4 group-hover:underline">
//                       {item.label}
//                     </span>
//                   </Link>
//                 </motion.li>
//               ))}
//             </ul>

//             <motion.div
//               variants={fadeInUp}
//               transition={{ duration: 0.4, delay: 0.26 }}
//               whileHover={{ y: -1 }}
//               className="mt-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-slate-900/70 to-slate-950 p-3 text-xs text-slate-300"
//             >
//               <p className="font-medium text-slate-100">Партнёрство с мастерами</p>
//               <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
//                 Ищете современный салон с прозрачным онлайн-расписанием и комфортными условиями?
//                 Напишите нам — обсудим сотрудничество.
//               </p>
//             </motion.div>
//           </motion.div>

//           {/* Соцсети и мессенджеры */}
//           <motion.div
//             variants={fadeInUp}
//             transition={{ duration: 0.45, delay: 0.22 }}
//             className="space-y-4"
//           >
//             <SectionTitle>Соцсети &amp; мессенджеры</SectionTitle>

//             <motion.div
//               variants={fadeIn}
//               className="flex flex-wrap gap-2"
//             >
//               {socials.map((link, index) => (
//                 <motion.a
//                   key={link.label}
//                   href={link.href}
//                   target="_blank"
//                   rel="noreferrer"
//                   aria-label={link.label}
//                   variants={fadeInUp}
//                   transition={{ duration: 0.3, delay: 0.05 * index }}
//                   whileHover={{ y: -2, scale: 1.05 }}
//                   whileTap={{ scale: 0.97 }}
//                   className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-slate-100 shadow-[0_0_18px_rgba(15,23,42,0.9)] backdrop-blur-sm transition hover:border-sky-400/60 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
//                 >
//                   <link.icon className="h-4 w-4" />
//                 </motion.a>
//               ))}
//             </motion.div>

//             <div className="space-y-2 text-xs text-slate-300">
//               <p className="font-medium text-slate-100">Запись через мессенджеры</p>
//               <div className="flex flex-wrap gap-1.5">
//                 {messengers.map((m, index) => (
//                   <motion.a
//                     key={m.label}
//                     href={m.href}
//                     target="_blank"
//                     rel="noreferrer"
//                     variants={fadeInUp}
//                     transition={{ duration: 0.3, delay: 0.08 * index }}
//                     whileHover={{ y: -1, scale: 1.03 }}
//                     className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 text-[11px] text-slate-200 backdrop-blur-sm transition hover:border-emerald-400/60 hover:text-emerald-200"
//                   >
//                     <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
//                     {m.label}
//                   </motion.a>
//                 ))}
//               </div>
//               <p className="text-[11px] text-slate-500">
//                 Напишите в удобном мессенджере — ответим максимально быстро ✨
//               </p>
//             </div>
//           </motion.div>
//         </motion.div>

//         {/* Нижняя полоса */}
//         <motion.div
//           variants={fadeInUp}
//           transition={{ duration: 0.45, delay: 0.28 }}
//           className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-4 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between"
//         >
//           <p>
//             © {year} Salon Elen. Все права защищены.
//           </p>
//           <div className="flex flex-wrap gap-3">
//             <Link
//               href="/privacy"
//               className="transition hover:text-slate-300 hover:underline hover:underline-offset-4"
//             >
//               Политика конфиденциальности
//             </Link>
//             <Link
//               href="/terms"
//               className="transition hover:text-slate-300 hover:underline hover:underline-offset-4"
//             >
//               Условия использования
//             </Link>
//           </div>
//         </motion.div>
//       </div>
//     </motion.footer>
//   );
// }

// function SectionTitle(props: { children: React.ReactNode }) {
//   return (
//     <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
//       <span className="h-1 w-5 rounded-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-300" />
//       <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
//         {props.children}
//       </h3>
//     </div>
//   );
// }

// function StepPill(props: { icon: React.ElementType; text: string }) {
//   const Icon = props.icon;
//   return (
//     <motion.span
//       whileHover={{ scale: 1.03 }}
//       className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] text-slate-300 ring-1 ring-white/5 backdrop-blur-sm"
//     >
//       <Icon className="h-3 w-3 text-emerald-300" />
//       {props.text}
//     </motion.span>
//   );
// }



//---------уже красивый футер но хочу ещё лучше---------//
// "use client";

// import * as React from "react";
// import Link from "next/link";
// import {
//   Instagram,
//   Facebook,
//   Youtube,
//   Mail,
//   Phone,
//   MapPin,
//   Clock,
//   ArrowRight,
//   CalendarCheck,
//   Scissors,
//   Sparkles,
// } from "lucide-react";

// function cx(...xs: Array<string | false | null | undefined>) {
//   return xs.filter(Boolean).join(" ");
// }

// const mainNav = [
//   { href: "/", label: "Главная" },
//   { href: "/services", label: "Услуги" },
//   { href: "/prices", label: "Цены" },
//   { href: "/news", label: "Новости" },
//   { href: "/about", label: "О нас" },
//   { href: "/contacts", label: "Контакты" },
// ];

// const clientNav = [
//   { href: "/booking", label: "Онлайн-запись" },
//   { href: "/booking/client", label: "Личный кабинет записи" },
//   { href: "/admin", label: "Вход для администратора/мастера" },
// ];

// const socials = [
//   {
//     href: "https://instagram.com",
//     label: "Instagram",
//     icon: Instagram,
//   },
//   {
//     href: "https://facebook.com",
//     label: "Facebook",
//     icon: Facebook,
//   },
//   {
//     href: "https://youtube.com",
//     label: "YouTube",
//     icon: Youtube,
//   },
// ];

// const messengers = [
//   {
//     href: "https://t.me/",
//     label: "Telegram",
//   },
//   {
//     href: "https://wa.me/",
//     label: "WhatsApp",
//   },
//   {
//     href: "viber://chat",
//     label: "Viber",
//   },
// ];

// export default function SiteFooter(): React.JSX.Element {
//   const year = new Date().getFullYear();

//   return (
//     <footer className="mt-16 border-t border-white/5 bg-gradient-to-b from-slate-950/40 via-slate-950 to-black/95 text-sm text-slate-200">
//       {/* Неоновая линия как в админке */}
//       <div className="pointer-events-none h-px w-full bg-gradient-to-r from-fuchsia-500/70 via-sky-400/70 to-emerald-400/70" />

//       <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8 lg:pt-12">
//         {/* Верхний блок: бренд + премиальный CTA букинга */}
//         <div className="flex flex-col gap-6 border-b border-white/5 pb-8 md:flex-row md:items-center md:justify-between">
//           <div className="space-y-3">
//             <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-300">
//               <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(45,255,196,0.8)]" />
//               Онлайн-запись премиум-класса
//             </div>
//             <div>
//               <div className="text-lg font-semibold leading-tight tracking-tight sm:text-xl">
//                 Salon Elen
//               </div>
//               <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400 sm:text-sm">
//                 Современная студия красоты в Halle с умной системой онлайн-бронирования: выберите услугу, мастера и удобное время за пару кликов.
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
//             <div className="flex flex-1 flex-col gap-2 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-slate-900/80 to-slate-950/90 px-4 py-3 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
//               <div className="flex items-center justify-between gap-3">
//                 <div>
//                   <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">
//                     Быстрая запись
//                   </p>
//                   <p className="text-sm font-semibold text-slate-50">
//                     Свободные слоты сегодня и на неделю вперёд
//                   </p>
//                 </div>
//                 <div className="hidden rounded-xl bg-black/40 p-2 sm:block">
//                   <CalendarCheck className="h-5 w-5 text-emerald-300" />
//                 </div>
//               </div>
//               <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
//                 <StepPill icon={Scissors} text="1. Выбор услуги" />
//                 <StepPill icon={Sparkles} text="2. Мастер" />
//                 <StepPill icon={CalendarCheck} text="3. Время и подтверждение" />
//               </div>
//             </div>

//             <div className="flex flex-col gap-2 sm:w-44">
//               <Link
//                 href="/booking"
//                 className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_12px_30px_rgba(56,189,248,0.45)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
//               >
//                 Онлайн-запись
//                 <ArrowRight className="h-4 w-4" />
//               </Link>
//               <a
//                 href="tel:+490000000000"
//                 className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/50 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
//               >
//                 <Phone className="h-3.5 w-3.5" />
//                 Позвонить администратору
//               </a>
//             </div>
//           </div>
//         </div>

//         {/* Основная сетка */}
//         <div className="mt-8 grid gap-8 md:grid-cols-4">
//           {/* Локация / время работы */}
//           <div className="space-y-4">
//             <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
//               Салон &amp; локация
//             </h3>
//             <div className="space-y-3 text-sm text-slate-300">
//               <div className="flex items-start gap-2">
//                 <MapPin className="mt-0.5 h-4 w-4 text-sky-400" />
//                 <div>
//                   <p>Halle (Saale)</p>
//                   <p className="text-xs text-slate-400">
//                     Точный адрес и подробная схема проезда — в разделе{" "}
//                     <Link href="/contacts" className="underline underline-offset-2">
//                       контакты
//                     </Link>
//                     .
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-2">
//                 <Clock className="mt-0.5 h-4 w-4 text-emerald-400" />
//                 <div className="space-y-1">
//                   <p>Ежедневно: 10:00 – 20:00</p>
//                   <p className="text-xs text-slate-400">
//                     Онлайн-запись доступна 24/7 — выберите удобное время даже ночью.
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-1 text-sm">
//                 <p className="font-medium text-slate-100">Контакты</p>
//                 <a
//                   href="tel:+490000000000"
//                   className="flex items-center gap-2 text-slate-300 transition hover:text-emerald-300"
//                 >
//                   <Phone className="h-4 w-4" />
//                   +49 (0) 000 000 000
//                 </a>
//                 <a
//                   href="mailto:info@salon-elen.de"
//                   className="flex items-center gap-2 text-slate-300 transition hover:text-sky-300"
//                 >
//                   <Mail className="h-4 w-4" />
//                   info@salon-elen.de
//                 </a>
//               </div>
//             </div>
//           </div>

//           {/* Навигация по сайту */}
//           <div className="space-y-4">
//             <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
//               Навигация
//             </h3>
//             <ul className="space-y-2 text-sm text-slate-300">
//               {mainNav.map((item) => (
//                 <li key={item.href}>
//                   <Link
//                     href={item.href}
//                     className="inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-sky-300 hover:underline hover:underline-offset-4"
//                   >
//                     <span className="h-1 w-1 rounded-full bg-sky-400/70" />
//                     {item.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Для клиентов / мастеров */}
//           <div className="space-y-4">
//             <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
//               Для клиентов и мастеров
//             </h3>
//             <ul className="space-y-2 text-sm text-slate-300">
//               {clientNav.map((item) => (
//                 <li key={item.href}>
//                   <Link
//                     href={item.href}
//                     className="inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-slate-300 transition hover:text-emerald-300 hover:underline hover:underline-offset-4"
//                   >
//                     <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-[9px] font-semibold text-emerald-300">
//                       •
//                     </span>
//                     {item.label}
//                   </Link>
//                 </li>
//               ))}
//             </ul>

//             <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
//               <p className="font-medium text-slate-100">Партнёрство с мастерами</p>
//               <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
//                 Ищете современный салон с прозрачным онлайн-расписанием? Напишите нам — расскажем про условия для мастеров.
//               </p>
//             </div>
//           </div>

//           {/* Соцсети и мессенджеры */}
//           <div className="space-y-4">
//             <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
//               Соцсети &amp; мессенджеры
//             </h3>

//             <div className="flex flex-wrap gap-2">
//               {socials.map((link) => (
//                 <a
//                   key={link.label}
//                   href={link.href}
//                   target="_blank"
//                   rel="noreferrer"
//                   aria-label={link.label}
//                   className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-slate-100 shadow-[0_0_18px_rgba(15,23,42,0.9)] transition hover:-translate-y-0.5 hover:border-sky-400/60 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
//                 >
//                   <link.icon className="h-4 w-4" />
//                 </a>
//               ))}
//             </div>

//             <div className="space-y-2 text-xs text-slate-300">
//               <p className="font-medium text-slate-100">Запись через мессенджеры</p>
//               <div className="flex flex-wrap gap-1.5">
//                 {messengers.map((m) => (
//                   <a
//                     key={m.label}
//                     href={m.href}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200"
//                   >
//                     <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
//                     {m.label}
//                   </a>
//                 ))}
//               </div>
//               <p className="text-[11px] text-slate-500">
//                 Напишите в удобном мессенджере — ответим максимально быстро ✨
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Нижняя полоса */}
//         <div className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-4 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
//           <p>
//             © {year} Salon Elen. Все права защищены.
//           </p>
//           <div className="flex flex-wrap gap-3">
//             <Link
//               href="/privacy"
//               className="transition hover:text-slate-300 hover:underline hover:underline-offset-4"
//             >
//               Политика конфиденциальности
//             </Link>
//             <Link
//               href="/terms"
//               className="transition hover:text-slate-300 hover:underline hover:underline-offset-4"
//             >
//               Условия использования
//             </Link>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

// function StepPill(props: { icon: React.ElementType; text: string }) {
//   const Icon = props.icon;
//   return (
//     <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] text-slate-300 ring-1 ring-white/5">
//       <Icon className="h-3 w-3 text-emerald-300" />
//       {props.text}
//     </span>
//   );
// }




//---------мой старый футер ниже---------//
// "use client";

// import * as React from "react";
// import Link from "next/link";
// import {
//   Instagram,
//   Facebook,
//   Youtube,
//   Github,
//   Linkedin,
//   Mail,
//   Phone,
//   MapPin,
// } from "lucide-react";

// /* --- Кастомные SVG (цвет берётся из currentColor) --- */
// const Telegram = (props: React.SVGProps<SVGSVGElement>) => (
//   <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
//     <path d="M9.04 13.66 8.7 17.3c.48 0 .69-.2.94-.44l2.26-2.16 4.68 3.43c.86.47 1.47.22 1.7-.79l3.08-14.46h.01c.27-1.25-.45-1.74-1.28-1.43L1.2 8.9c-1.23.48-1.21 1.16-.21 1.47l4.76 1.49L18.73 5.2c.7-.46 1.35-.21.82.25L9.04 13.66Z"/>
//   </svg>
// );

// const WhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
//   <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
//     <path d="M20.52 3.49A11.91 11.91 0 0 0 12.01 0C5.37 0 .02 5.35.02 12c0 2.11.55 4.19 1.59 6.02L0 24l6.15-1.6A12 12 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.51ZM12 21.58c-2.02 0-3.98-.55-5.69-1.6l-.41-.25-3.65.95.98-3.56-.26-.42A9.59 9.59 0 1 1 12 21.58Zm5.49-7.2c-.3-.16-1.77-.88-2.04-.98-.27-.1-.47-.16-.67.16-.19.3-.77.97-.95 1.17-.18.2-.35.22-.65.06-.3-.16-1.25-.46-2.38-1.48-.88-.79-1.48-1.77-1.65-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.04-.38-.02-.54-.06-.16-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02s-.53.07-.81.38c-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.58-.36Z"/>
//   </svg>
// );

// const Viber = (props: React.SVGProps<SVGSVGElement>) => (
//   <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
//     <path d="M17.3 2.03C8.88-.23 3.27 3.8 3.27 3.8S.2 5.93.2 10.5c0 2.7 1.6 5.47 3.04 7.03 1.29 1.4 2.63 1.35 2.63 1.35l.03 3.1s3.38-.87 5.37-2.23c1.99-1.36 9.11-.8 10.74-7.65 1.64-6.85-3.99-9.25-4.71-9.07Zm-2.02 10.59c-.16.3-.93.58-1.27.61-.34.03-.55.15-1.28-.18-.73-.33-2.41-1.1-3.77-3.01-1.37-1.9-1.64-3.29-1.73-3.63-.09-.34.09-.92.4-1.07.32-.15.7-.27.9-.22.2.05.57.94.7 1.29.13.35.44.93.31 1.23-.13.3-.67.44-.49.76.19.32.83 1.54 1.9 2.5 1.24 1.13 2.29 1.47 2.61 1.6.32.13.52-.18.82-.42.3-.25.54-.53.85-.43.31.1 1.97.93 2.31 1.09.34.16.28.54.12.84Zm.75-2.14-.84-.36a.29.29 0 0 1-.17-.38l.02-.05c.08-.2.3-.3.5-.22l.84.36a.29.29 0 0 1 .17.38l-.02.05a.4.4 0 0 1-.5.22Zm.93-1.81-1.19-.51a.4.4 0 0 1-.23-.53l.03-.06a.41.41 0 0 1 .54-.22l1.19.51c.2.08.3.32.21.53l-.03.06a.41.41 0 0 1-.52.22Zm.96-1.85-1.48-.63a.47.47 0 0 1-.27-.61l.02-.06a.49.49 0 0 1 .63-.27l1.49.63c.23.1.34.39.23.63l-.02.05a.5.5 0 0 1-.6.26Z"/>
//   </svg>
// );

// /* --- Тип и утилита под цветные бейджи --- */
// type Social = {
//   name: string;
//   href: string;
//   icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
//   /** tailwind-градиент или одноцветная заливка бейджа */
//   bg: string; // пример: "bg-[#1877F2]" или "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#833AB4]"
// };

// const socials: Social[] = [
//   { name: "Telegram", href: "https://t.me/username", icon: Telegram, bg: "bg-[#229ED9]" },
//   { name: "WhatsApp", href: "https://wa.me/380000000000", icon: WhatsApp, bg: "bg-[#25D366]" },
//   { name: "Viber", href: "https://invite.viber.com", icon: Viber, bg: "bg-[#7360F2]" },
//   {
//     name: "Instagram",
//     href: "https://instagram.com/yourbrand",
//     icon: Instagram,
//     bg: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#833AB4]",
//   },
//   { name: "Facebook", href: "https://facebook.com/yourbrand", icon: Facebook, bg: "bg-[#1877F2]" },
//   { name: "YouTube", href: "https://youtube.com/@yourbrand", icon: Youtube, bg: "bg-[#FF0000]" },
//   { name: "LinkedIn", href: "https://linkedin.com/company/yourbrand", icon: Linkedin, bg: "bg-[#0A66C2]" },
//   { name: "GitHub", href: "https://github.com/yourorg", icon: Github, bg: "bg-gradient-to-br from-slate-800 to-slate-900" },
// ];

// /* --- Сам футер --- */
// export default function SiteFooter() {
//   const year = new Date().getFullYear();

//   return (
//     <footer className="mt-16 border-t border-gray-200/70 dark:border-gray-800">
//       <div className="container py-10">
//         <div className="grid gap-10 md:grid-cols-4">
//           {/* Бренд / контакты */}
//           <div className="space-y-3">
//             <Link href="/" className="text-xl font-semibold tracking-tight">
//               Salon Elen
//             </Link>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               Красота и уход в Halle: стрижки, маникюр, уход за кожей и макияж.
//             </p>
//             <div className="flex items-center gap-3 pt-1 text-sm text-gray-700 dark:text-gray-300">
//               <Phone size={16} className="opacity-70" />
//               <a href="tel:+491234567890" className="hover:underline">
//                 +49 123 456 7890
//               </a>
//             </div>
//             <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
//               <Mail size={16} className="opacity-70" />
//               <a href="mailto:info@salon-elen.de" className="hover:underline">
//                 info@salon-elen.de
//               </a>
//             </div>
//             <div className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
//               <MapPin size={16} className="mt-0.5 opacity-70" />
//               <span>Halle, адрес салона 123</span>
//             </div>
//           </div>

//           {/* Навигация */}
//           <div>
//             <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
//               Навигация
//             </h4>
//             <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
//               <li><Link className="hover:underline" href="/">Главная</Link></li>
//               <li><Link className="hover:underline" href="/services">Услуги</Link></li>
//               <li><Link className="hover:underline" href="/prices">Цены</Link></li>
//               <li><Link className="hover:underline" href="/contacts">Контакты</Link></li>
//               <li><Link className="hover:underline" href="/booking">Запись</Link></li>
//             </ul>
//           </div>

//           {/* Время работы */}
//           <div>
//             <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
//               Время работы
//             </h4>
//             <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
//               <li>Пн–Пт: 10:00–19:00</li>
//               <li>Сб: 10:00–16:00</li>
//               <li>Вс: выходной</li>
//             </ul>
//           </div>

//           {/* Соцсети (цветные) */}
//           <div>
//             <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
//               Мы на связи
//             </h4>

//             <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-5">
//               {socials.map((s) => (
//                 <a
//                   key={s.name}
//                   href={s.href}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   aria-label={s.name}
//                   className="group inline-flex items-center justify-center"
//                 >
//                   <span
//                     className={[
//                       // цветной бейдж
//                       "inline-flex h-10 w-10 items-center justify-center rounded-full",
//                       s.bg,
//                       // эффект свечения/тени на ховере
//                       "shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition",
//                       "group-hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]",
//                       "group-hover:translate-y-[-2px]",
//                     ].join(" ")}
//                   >
//                     <s.icon className="h-5 w-5 text-white" />
//                   </span>
//                 </a>
//               ))}
//             </div>

//             <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
//               Напишите в удобном мессенджере — ответим быстро ✨
//             </p>
//           </div>
//         </div>

//         <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200/70 pt-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400 md:flex-row">
//           <p>© {year} Salon Elen. Все права защищены.</p>
//           <div className="flex gap-4">
//             <Link className="hover:underline" href="/privacy">Политика конфиденциальности</Link>
//             <Link className="hover:underline" href="/terms">Условия использования</Link>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }
