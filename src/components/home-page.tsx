// src/components/home-page.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  Star,
  Shield,
  Clock,
  Heart,
  ChevronRight,
  ArrowRight,
  MapPin,
  Phone,
  Calendar,
  Award,
  Gem,
  Users,
  Scissors,
  Eye,
  Palette,
  HandMetal,
  Quote,
  Images,
} from "lucide-react";
import RainbowCTA from "@/components/RainbowCTA";
import { useI18n } from "@/i18n/I18nProvider";
import styles from "./home-page.module.css";
import type { Locale } from "@/i18n/locales";

/* ═══════════════════════ TYPES ═══════════════════════ */

type KnownType = "ARTICLE" | "NEWS" | "PROMO";

type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  type: KnownType;
};

type ServiceItem = {
  id: string;
  slug: string;
  name: string;
  cover: string | null;
  description: string | null;
};

type Props = {
  latest: ArticleItem[];
  services?: ServiceItem[];
};

/* ═══════════════════════ i18n ═══════════════════════ */

const t_map: Record<Locale, Record<string, string>> = {
  de: {
    hero_tag: "Willkommen bei Salon Elen",
    hero_title_1: "Schönheit",
    hero_title_2: "die begeistert",
    hero_desc: "Professionelle Kosmetik, Permanent Make-up, Nageldesign und mehr — im Herzen von Halle an der Saale.",
    hero_cta: "Termin buchen",
    hero_services: "Alle Leistungen",
    hero_badge: "Online-Termin 24/7",

    stats_years: "Jahre Erfahrung",
    stats_clients: "Zufriedene Kunden",
    stats_services: "Leistungen",
    stats_rating: "Bewertung",

    services_tag: "Unsere Leistungen",
    services_title: "Was wir am besten können",
    services_desc: "Von Permanent Make-up bis Nageldesign — wir bieten alles für Ihre Schönheit.",
    services_all: "Alle Leistungen ansehen",
    service_1: "Permanent Make-up",
    service_1_desc: "Perfekte Augenbrauen, Lippen und Lidstriche — natürlich und dauerhaft schön.",
    service_2: "Wimpernverlängerung",
    service_2_desc: "Voluminöse, natürlich wirkende Wimpern für einen ausdrucksstarken Blick.",
    service_3: "Nageldesign",
    service_3_desc: "Maniküre, Gelnägel und kreative Designs — Ästhetik bis in die Fingerspitzen.",
    service_4: "Microneedling",
    service_4_desc: "Hautverjüngung und Kollagenboost für ein strahlendes, ebenmäßiges Hautbild.",

    why_tag: "Warum Salon Elen",
    why_title: "Vertrauen Sie den Besten",
    why_1_title: "Zertifizierte Meister",
    why_1_desc: "Unsere Spezialisten verfügen über internationale Zertifikate und langjährige Erfahrung.",
    why_2_title: "Premium Produkte",
    why_2_desc: "Wir arbeiten ausschließlich mit hochwertigen, geprüften Marken und Materialien.",
    why_3_title: "Sterile Sicherheit",
    why_3_desc: "Höchste Hygienestandards und Einwegmaterialien für Ihre Sicherheit.",
    why_4_title: "Individuelle Beratung",
    why_4_desc: "Jede Behandlung wird individuell auf Sie abgestimmt — für perfekte Ergebnisse.",

    gallery_tag: "Unsere Arbeiten",
    gallery_title: "Ergebnisse, die überzeugen",
    gallery_cta: "Galerie ansehen",

    reviews_tag: "Bewertungen",
    reviews_title: "Was unsere Kunden sagen",
    review_1: "Absolut begeistert vom Permanent Make-up! Natürlich und perfekt gemacht.",
    review_1_author: "Anna M.",
    review_2: "Bester Nagelservice in Halle. Komme seit 2 Jahren regelmäßig.",
    review_2_author: "Maria K.",
    review_3: "Die Wimpernverlängerung sieht so natürlich aus. Professionelles Team!",
    review_3_author: "Sophie L.",

    news_tag: "Aktuelles",
    news_title: "News & Artikel",
    news_empty: "Noch keine Beiträge.",
    news_type_ARTICLE: "Artikel",
    news_type_NEWS: "News",
    news_type_PROMO: "Aktion",

    cta_title: "Bereit für Ihre Verwandlung?",
    cta_desc: "Buchen Sie jetzt Ihren Termin — bequem online, 24 Stunden am Tag.",
    cta_btn: "Jetzt buchen",

    contact_tag: "Besuchen Sie uns",
    contact_title: "Salon Elen in Halle",
    contact_address: "Lessingstraße 37, 06114 Halle (Saale)",
    contact_hours: "Mo–Fr 09:00–19:00 · Sa 09:00–16:00",
    contact_phone: "+49 177 899 51 06",
    contact_map: "Auf der Karte ansehen",
  },
  en: {
    hero_tag: "Welcome to Salon Elen",
    hero_title_1: "Beauty",
    hero_title_2: "that inspires",
    hero_desc: "Professional cosmetics, permanent make-up, nail design, and more — in the heart of Halle an der Saale.",
    hero_cta: "Book now",
    hero_services: "All services",
    hero_badge: "Online booking 24/7",

    stats_years: "Years of experience",
    stats_clients: "Happy clients",
    stats_services: "Services",
    stats_rating: "Rating",

    services_tag: "Our services",
    services_title: "What we do best",
    services_desc: "From permanent make-up to nail design — everything for your beauty.",
    services_all: "View all services",
    service_1: "Permanent Make-up",
    service_1_desc: "Perfect brows, lips, and eyeliner — naturally beautiful and long-lasting.",
    service_2: "Eyelash Extensions",
    service_2_desc: "Voluminous, natural-looking lashes for an expressive gaze.",
    service_3: "Nail Design",
    service_3_desc: "Manicure, gel nails, and creative designs — beauty to your fingertips.",
    service_4: "Microneedling",
    service_4_desc: "Skin rejuvenation and collagen boost for a radiant, even complexion.",

    why_tag: "Why Salon Elen",
    why_title: "Trust the best",
    why_1_title: "Certified Masters",
    why_1_desc: "Our specialists hold international certificates and years of experience.",
    why_2_title: "Premium Products",
    why_2_desc: "We use only high-quality, tested brands and materials.",
    why_3_title: "Sterile Safety",
    why_3_desc: "Highest hygiene standards and disposable materials for your safety.",
    why_4_title: "Personal Consultation",
    why_4_desc: "Every treatment is tailored to you — for perfect results.",

    gallery_tag: "Our works",
    gallery_title: "Results that convince",
    gallery_cta: "View gallery",

    reviews_tag: "Reviews",
    reviews_title: "What our clients say",
    review_1: "Absolutely love the permanent make-up! Natural and perfectly done.",
    review_1_author: "Anna M.",
    review_2: "Best nail service in Halle. Been coming regularly for 2 years.",
    review_2_author: "Maria K.",
    review_3: "The lash extensions look so natural. Very professional team!",
    review_3_author: "Sophie L.",

    news_tag: "Latest",
    news_title: "News & Articles",
    news_empty: "No posts yet.",
    news_type_ARTICLE: "Article",
    news_type_NEWS: "News",
    news_type_PROMO: "Promo",

    cta_title: "Ready for your transformation?",
    cta_desc: "Book your appointment now — conveniently online, 24 hours a day.",
    cta_btn: "Book now",

    contact_tag: "Visit us",
    contact_title: "Salon Elen in Halle",
    contact_address: "Lessingstraße 37, 06114 Halle (Saale)",
    contact_hours: "Mon–Fri 09:00–19:00 · Sat 09:00–16:00",
    contact_phone: "+49 177 899 51 06",
    contact_map: "View on map",
  },
  ru: {
    hero_tag: "Добро пожаловать в Salon Elen",
    hero_title_1: "Красота,",
    hero_title_2: "которая вдохновляет",
    hero_desc: "Профессиональная косметология, перманентный макияж, дизайн ногтей и многое другое — в центре Галле.",
    hero_cta: "Записаться",
    hero_services: "Все услуги",
    hero_badge: "Онлайн-запись 24/7",

    stats_years: "Лет опыта",
    stats_clients: "Довольных клиентов",
    stats_services: "Услуг",
    stats_rating: "Рейтинг",

    services_tag: "Наши услуги",
    services_title: "Что мы умеем лучше всего",
    services_desc: "От перманентного макияжа до дизайна ногтей — всё для вашей красоты.",
    services_all: "Смотреть все услуги",
    service_1: "Перманентный макияж",
    service_1_desc: "Идеальные брови, губы и стрелки — естественно и надолго.",
    service_2: "Наращивание ресниц",
    service_2_desc: "Объёмные и естественные ресницы для выразительного взгляда.",
    service_3: "Дизайн ногтей",
    service_3_desc: "Маникюр, гель-лак и креативный дизайн — эстетика до кончиков пальцев.",
    service_4: "Микронидлинг",
    service_4_desc: "Омоложение кожи и стимуляция коллагена для сияющего ровного тона.",

    why_tag: "Почему Salon Elen",
    why_title: "Доверьтесь лучшим",
    why_1_title: "Сертифицированные мастера",
    why_1_desc: "Наши специалисты имеют международные сертификаты и многолетний опыт.",
    why_2_title: "Премиум-продукция",
    why_2_desc: "Мы работаем только с проверенными брендами и качественными материалами.",
    why_3_title: "Стерильная безопасность",
    why_3_desc: "Высочайшие стандарты гигиены и одноразовые материалы для вашей безопасности.",
    why_4_title: "Индивидуальный подход",
    why_4_desc: "Каждая процедура подбирается индивидуально — для идеального результата.",

    gallery_tag: "Наши работы",
    gallery_title: "Результаты, которые говорят сами за себя",
    gallery_cta: "Смотреть галерею",

    reviews_tag: "Отзывы",
    reviews_title: "Что говорят наши клиенты",
    review_1: "В полном восторге от перманентного макияжа! Естественно и идеально.",
    review_1_author: "Анна М.",
    review_2: "Лучший маникюр в Галле. Хожу уже 2 года регулярно.",
    review_2_author: "Мария К.",
    review_3: "Наращивание ресниц выглядит очень натурально. Профессиональная команда!",
    review_3_author: "Софи Л.",

    news_tag: "Новости",
    news_title: "Новости и статьи",
    news_empty: "Публикаций пока нет.",
    news_type_ARTICLE: "Статья",
    news_type_NEWS: "Новость",
    news_type_PROMO: "Акция",

    cta_title: "Готовы к преображению?",
    cta_desc: "Запишитесь прямо сейчас — удобно онлайн, 24 часа в сутки.",
    cta_btn: "Записаться",

    contact_tag: "Приходите к нам",
    contact_title: "Salon Elen в Галле",
    contact_address: "Lessingstraße 37, 06114 Halle (Saale)",
    contact_hours: "Пн–Пт 09:00–19:00 · Сб 09:00–16:00",
    contact_phone: "+49 177 899 51 06",
    contact_map: "Показать на карте",
  },
};

/* ═══════════════════════ HELPERS ═══════════════════════ */

function localeHref(path: string, locale: Locale) {
  if (locale === "de") return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Section wrapper with scroll reveal ── */
function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </section>
  );
}

/* ═══════ SERVICE CONFIG ═══════ */
const SERVICES_CFG = [
  { icon: Eye,      grad: "from-rose-500 to-pink-600",   glow: "shadow-rose-500/30",   ring: "border-rose-400/20",  emoji: "👁️" },
  { icon: Sparkles,  grad: "from-violet-500 to-purple-600", glow: "shadow-violet-500/30", ring: "border-violet-400/20", emoji: "✨" },
  { icon: HandMetal, grad: "from-pink-500 to-rose-600",  glow: "shadow-pink-500/30",   ring: "border-pink-400/20",  emoji: "💅" },
  { icon: Gem,       grad: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/30", ring: "border-emerald-400/20", emoji: "💎" },
];

const WHY_CFG = [
  { icon: Award,  color: "text-rose-500 dark:text-amber-400",    bg: "bg-rose-50 dark:bg-rose-500/10",    ring: "ring-rose-200/60 dark:ring-amber-500/20" },
  { icon: Gem,    color: "text-violet-500 dark:text-violet-400",  bg: "bg-violet-50 dark:bg-violet-500/10", ring: "ring-violet-200/60 dark:ring-violet-500/20" },
  { icon: Shield, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", ring: "ring-emerald-200/60 dark:ring-emerald-500/20" },
  { icon: Heart,  color: "text-pink-500 dark:text-pink-400",      bg: "bg-pink-50 dark:bg-pink-500/10",    ring: "ring-pink-200/60 dark:ring-pink-500/20" },
];

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function HomePage({ latest }: Props) {
  const { locale } = useI18n();
  const t = t_map[locale];

  /* Hero parallax */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 via-white to-white dark:from-[#0a0a0f] dark:via-[#0c0c14] dark:to-[#0a0a0f]">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <div ref={heroRef} className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden">
        {/* Background — Desktop: static image with parallax */}
        <motion.div className="absolute inset-0 z-0 hidden md:block" style={{ y: heroImgY }}>
          <Image
            src="/images/hero.webp"
            alt="Salon Elen"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[65%_40%] scale-110"
          />
        </motion.div>

        {/* Background — Mobile: poster image (LCP) + video overlay */}
        <div className="absolute inset-0 z-0 md:hidden">
          {/* Poster image — loads instantly as LCP */}
          <Image
            src="/images/hero-mobile.webp"
            alt="Salon Elen"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_30%]"
          />
          {/* Video fades in on top once loaded */}
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover object-[50%_30%] animate-[fadeIn_1s_ease_0.5s_both]"
          >
            <source src="/images/hero-video.webm" type="video/webm" />
          </video>
        </div>

        {/* Gradient overlays */}
        {/* Mobile: subtle bottom gradient on light image — keeps face visible */}
        <div className="absolute inset-0 z-[1] md:hidden bg-gradient-to-t from-white/90 via-white/30 to-transparent" />
        {/* Desktop: dark cinematic overlays */}
        <div className="hidden md:block absolute inset-0 z-[1] bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="hidden md:block absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Spotlight shimmer — desktop only */}
        <div className={`absolute inset-0 hidden md:block ${styles.shimmer}`} />

        {/* Floating orbs — desktop only */}
        <div className={`absolute -left-32 top-[15%] w-[420px] h-[420px] rounded-full blur-[80px] z-[1] hidden md:block ${styles.orbA}`} />
        <div className={`absolute right-[10%] top-[40%] w-[340px] h-[340px] rounded-full blur-[70px] z-[1] hidden md:block ${styles.orbB}`} />
        <div className={`absolute left-[30%] bottom-[10%] w-[280px] h-[280px] rounded-full blur-[60px] z-[1] hidden md:block ${styles.orbC}`} />

        {/* Film grain — desktop only */}
        <div className={`absolute inset-0 z-[3] hidden md:block ${styles.noise}`} />

        {/* Decorative orb — desktop only */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-rose-500/8 blur-[120px] z-[1] pointer-events-none hidden md:block" />

        {/* Content — bottom-aligned on mobile, centered on desktop */}
        <motion.div className="relative z-10 w-full" style={{ opacity: heroOpacity }}>
          <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-10 pt-[60svh] md:pb-0 md:pt-0 md:py-0">
            <div className="max-w-2xl">
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-50/60 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1.5 text-[11px] md:text-xs font-medium tracking-wide text-rose-700 mb-4 md:border-white/20 md:bg-white/10 md:text-white/90 md:mb-6"
              >
                <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 text-rose-500 md:text-amber-300" />
                {t.hero_tag}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="font-playfair text-[clamp(34px,8vw,80px)] leading-[0.95] font-light tracking-tight text-gray-900 md:text-white"
              >
                {t.hero_title_1}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 md:from-rose-300 md:via-pink-200 md:to-amber-200">
                  {t.hero_title_2}
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="mt-3 md:mt-6 text-sm md:text-lg text-gray-600 md:text-white/80 leading-relaxed max-w-lg font-cormorant tracking-wide line-clamp-2 md:line-clamp-none"
              >
                {t.hero_desc}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mt-5 md:mt-8 flex flex-wrap gap-3 md:gap-4"
              >
                <RainbowCTA
                  href={localeHref("/booking", locale)}
                  label={t.hero_cta}
                  className="h-11 px-6 text-sm md:h-12 md:px-8 md:text-[15px]"
                  idle
                />
                <Link
                  href={localeHref("/services", locale)}
                  className="group inline-flex h-11 px-5 md:h-12 md:px-6 items-center gap-2 rounded-full border border-rose-300/50 text-rose-700 hover:bg-rose-50 md:border-white/30 md:text-white/90 md:hover:bg-white/10 md:hover:border-white/50 transition-all duration-300 text-sm font-medium"
                >
                  {t.hero_services}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="mt-4 md:mt-6 flex items-center gap-2 text-gray-400 md:text-white/50 text-xs md:text-sm"
              >
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {t.hero_badge}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator — desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
        >
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-1 h-1.5 rounded-full bg-white/60"
            />
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <RevealSection className="relative z-10 -mt-16 sm:-mt-20 mx-auto max-w-6xl px-5 sm:px-8">
        <div className={`relative overflow-hidden rounded-2xl ${styles.glassLine}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { value: 8, suffix: "+", label: t.stats_years, icon: Award },
            { value: 2500, suffix: "+", label: t.stats_clients, icon: Users },
            { value: 50, suffix: "+", label: t.stats_services, icon: Scissors },
            { value: 4.9, suffix: "", label: t.stats_rating, icon: Star, isDecimal: true },
          ].map((stat, i) => (
            <div
              key={i}
              className="relative group rounded-2xl border border-rose-200/30 bg-white/80 backdrop-blur-xl p-5 sm:p-6 text-center shadow-lg shadow-rose-100/20 hover:shadow-xl hover:shadow-rose-200/25 transition-all duration-500 hover:-translate-y-1 dark:border-white/8 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/8"
            >
              <stat.icon className="mx-auto h-5 w-5 text-rose-400 dark:text-amber-400 mb-3 transition-transform duration-500 group-hover:scale-110" />
              <div className="text-3xl sm:text-4xl font-playfair font-light text-rose-900 dark:text-amber-100 tabular-nums">
                {stat.isDecimal ? (
                  <span>4.9</span>
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <div className="mt-1 text-xs sm:text-sm text-rose-700/60 dark:text-white/50 font-medium tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        </div>
      </RevealSection>

      {/* ═══════════════════ SERVICES ═══════════════════ */}
      <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
        {/* ── Visible gradient mesh background ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100/70 via-pink-50/40 to-amber-50/50 dark:from-rose-950/20 dark:via-purple-950/10 dark:to-amber-950/15" />
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-rose-300/25 to-pink-200/20 blur-[80px] dark:from-rose-500/8 dark:to-pink-500/5 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-32 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-amber-200/25 to-rose-200/15 blur-[90px] dark:from-amber-500/6 dark:to-rose-500/4 animate-pulse" style={{ animationDuration: '10s' }} />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        {/* ── Decorative divider top ── */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/40 to-transparent dark:via-amber-500/15" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              {t.services_tag}
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
              {t.services_title}
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-cormorant text-lg tracking-wide">
              {t.services_desc}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES_CFG.map((cfg, i) => {
              const n = i + 1;
              const IconComp = cfg.icon;
              return (
                <Link
                  key={n}
                  href={localeHref("/services", locale)}
                  className="group relative rounded-2xl border border-rose-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg shadow-rose-100/20 hover:shadow-xl hover:shadow-rose-200/30 transition-all duration-500 hover:-translate-y-3 dark:border-white/8 dark:bg-white/[0.05] dark:shadow-none dark:hover:bg-white/[0.08] dark:hover:border-white/12 overflow-hidden"
                >
                  {/* Card inner glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-rose-100/40 via-transparent to-pink-100/30 dark:from-amber-500/5 dark:to-purple-500/5 pointer-events-none" />

                  {/* ── Animated icon container ── */}
                  <div className="relative mb-5">
                    {/* Outer pulse ring */}
                    <div className={`absolute -inset-2 rounded-2xl border ${cfg.ring} opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110 group-hover:animate-ping`} style={{ animationDuration: '2s', animationIterationCount: '1' }} />
                    {/* Glow backdrop */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${cfg.grad} blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                    {/* Icon box */}
                    <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${cfg.grad} ${cfg.glow} shadow-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <IconComp className="h-6 w-6 text-white drop-shadow-sm" />
                    </div>
                  </div>

                  <h3 className="relative font-semibold text-gray-900 dark:text-white mb-2 text-[15px]">
                    {t[`service_${n}`]}
                  </h3>
                  <p className="relative text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t[`service_${n}_desc`]}
                  </p>
                  <div className="relative mt-4 inline-flex items-center gap-1.5 text-rose-600 dark:text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                    <span>{t.hero_services === "Alle Leistungen" ? "Mehr" : t.hero_services === "All services" ? "More" : "Ещё"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href={localeHref("/services", locale)}
              className="group inline-flex items-center gap-2 rounded-full border border-rose-200/50 bg-white/70 backdrop-blur-sm px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100/80 hover:border-rose-300/60 hover:shadow-md transition-all duration-300 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300 dark:hover:bg-amber-500/10"
            >
              {t.services_all}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </RevealSection>

      {/* ═══════════════════ WHY US ═══════════════════ */}
      <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
        {/* ── Gradient mesh background ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tl from-pink-50/60 via-rose-50/30 to-amber-50/40 dark:from-purple-950/15 dark:via-slate-950/5 dark:to-amber-950/10" />
          <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-l from-violet-200/20 to-pink-200/15 blur-[80px] dark:from-violet-500/6 dark:to-pink-500/4 animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-rose-200/20 to-amber-200/15 blur-[70px] dark:from-rose-500/5 dark:to-amber-500/4 animate-pulse" style={{ animationDuration: '9s' }} />
          {/* Cross-hatch pattern */}
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(45deg, currentColor 1px, transparent 1px), linear-gradient(-45deg, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>

        {/* Top divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/30 to-transparent dark:via-amber-500/10" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              <Shield className="h-3.5 w-3.5" />
              {t.why_tag}
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
              {t.why_title}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CFG.map((cfg, i) => {
              const key = String(i + 1);
              const IconComp = cfg.icon;
              return (
                <div
                  key={i}
                  className="group text-center p-6 rounded-2xl border border-rose-100/30 bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:border-rose-200/50 hover:shadow-lg hover:shadow-rose-100/20 dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:border-white/10 transition-all duration-500 hover:-translate-y-1"
                >
                  {/* ── Animated icon with rings ── */}
                  <div className="relative mx-auto w-20 h-20 mb-5">
                    {/* Outer animated ring */}
                    <div className={`absolute inset-0 rounded-full ring-2 ${cfg.ring} opacity-40 group-hover:opacity-80 group-hover:scale-125 transition-all duration-700`} />
                    {/* Middle ring - counter-rotate on hover */}
                    <div className={`absolute inset-1.5 rounded-full ring-1 ${cfg.ring} opacity-20 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 delay-75`} />
                    {/* Icon circle */}
                    <div className={`absolute inset-3 rounded-full ${cfg.bg} flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg`}>
                      <IconComp className={`h-7 w-7 ${cfg.color} transition-transform duration-500 group-hover:scale-110`} />
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t[`why_${key}_title`]}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t[`why_${key}_desc`]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/30 to-transparent dark:via-amber-500/10" />
      </RevealSection>

      {/* ═══════════════════ GALLERY PREVIEW ═══════════════════ */}
      <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
        {/* ── Background ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-50/40 via-white/80 to-pink-50/30 dark:from-purple-950/10 dark:via-slate-950/5 dark:to-amber-950/8" />
          <div className="absolute left-[5%] top-[20%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-sky-200/15 to-violet-200/10 blur-[80px] dark:from-sky-500/5 dark:to-violet-500/3 animate-pulse" style={{ animationDuration: '11s' }} />
        </div>

        <div className="relative">
          <div className="text-center mb-8 sm:mb-10 px-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              <Images className="h-3.5 w-3.5" />
              {t.gallery_tag}
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
              {t.gallery_title}
            </h2>
          </div>

          {/* ── Row 1: scrolls LEFT ── */}
          <div className="relative overflow-hidden mb-3 sm:mb-4">
            <div className="flex gap-3 sm:gap-4 animate-[scroll_35s_linear_infinite] hover:[animation-play-state:paused] w-max">
              {[
                "/images/gallery/injection_1.webp",
                "/images/gallery/g1.webp",
                "/images/gallery/beauty_8.webp",
                "/images/gallery/g2.webp",
                "/images/gallery/brow_1.webp",
                "/images/gallery/beauty_1.webp",
                "/images/gallery/beauty_3.webp",
                "/images/gallery/pmu_2.webp",
                "/images/gallery/beauty_5.webp",
                "/images/gallery/g2.webp",
                "/images/gallery/manicure_1.webp",
                "/images/gallery/beauty_2.webp",
              ].map((src, i) => (
                <div
                  key={`r1-${i}`}
                  className="relative w-[200px] sm:w-[280px] md:w-[320px] aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 group"
                >
                  <Image
                    src={src}
                    alt={`Gallery ${(i % 6) + 1}`}
                    fill
                    loading="lazy"
                    sizes="(max-width:640px) 200px, 320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
            {/* Edge fades */}
            <div className="absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-rose-50/90 via-rose-50/60 dark:from-[#0a0a0f] dark:via-[#0a0a0f]/60 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white via-white/60 dark:from-[#0a0a0f] dark:via-[#0a0a0f]/60 to-transparent z-10 pointer-events-none" />
          </div>

          {/* ── Row 2: scrolls RIGHT (reverse) ── */}
          <div className="relative overflow-hidden">
            <div className="flex gap-3 sm:gap-4 animate-[scrollReverse_40s_linear_infinite] hover:[animation-play-state:paused] w-max">
              {[
                "/images/gallery/beauty_3.webp",
                "/images/gallery/injection_2.webp",
                "/images/gallery/beauty_5.webp",
                "/images/gallery/brow_2.webp",
                "/images/gallery/g1.webp",
                "/images/gallery/beauty_7.webp",
                "/images/gallery/beauty_4.webp",
                "/images/gallery/pmu_1.webp",
                "/images/gallery/beauty_6.webp",
                "/images/gallery/beauty_8.webp",
                "/images/gallery/pmu_3.webp",
                "/images/gallery/beauty_2.webp",
              ].map((src, i) => (
                <div
                  key={`r2-${i}`}
                  className="relative w-[200px] sm:w-[280px] md:w-[320px] aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 group"
                >
                  <Image
                    src={src}
                    alt={`Gallery ${(i % 6) + 1}`}
                    fill
                    loading="lazy"
                    sizes="(max-width:640px) 200px, 320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
            {/* Edge fades */}
            <div className="absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-rose-50/90 via-rose-50/60 dark:from-[#0a0a0f] dark:via-[#0a0a0f]/60 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-white via-white/60 dark:from-[#0a0a0f] dark:via-[#0a0a0f]/60 to-transparent z-10 pointer-events-none" />
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Link
              href={localeHref("/gallerie", locale)}
              className="group inline-flex items-center gap-2 rounded-full border border-rose-200/50 bg-white/70 backdrop-blur-sm px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100/80 hover:shadow-md transition-all duration-300 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300 dark:hover:bg-amber-500/10"
            >
              {t.gallery_cta}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </RevealSection>

      {/* ═══════════════════ REVIEWS ═══════════════════ */}
      <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
        {/* ── Background ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-50/40 via-rose-50/30 to-pink-50/50 dark:from-amber-950/10 dark:via-purple-950/8 dark:to-rose-950/10" />
          <div className="absolute -left-20 top-[30%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-200/20 to-rose-200/15 blur-[80px] dark:from-pink-500/5 dark:to-rose-500/4 animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute right-[5%] top-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-l from-amber-200/20 to-orange-200/15 blur-[70px] dark:from-amber-500/5 dark:to-orange-500/4 animate-pulse" style={{ animationDuration: '13s' }} />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        </div>

        {/* Top divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/30 to-transparent dark:via-amber-500/10" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              <Star className="h-3.5 w-3.5" />
              {t.reviews_tag}
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
              {t.reviews_title}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="group relative rounded-2xl border border-rose-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg shadow-rose-100/15 hover:shadow-xl hover:shadow-rose-200/25 hover:-translate-y-2 transition-all duration-500 dark:border-white/8 dark:bg-white/[0.05] dark:shadow-none dark:hover:bg-white/[0.08] overflow-hidden"
              >
                {/* Card glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-amber-50/40 via-transparent to-rose-50/30 dark:from-amber-500/3 dark:to-rose-500/3 pointer-events-none" />

                {/* Quote icon with glow */}
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-rose-200/30 to-amber-200/20 blur-md opacity-50 dark:from-amber-500/10 dark:to-rose-500/5" />
                  <Quote className="relative h-8 w-8 text-rose-300 dark:text-amber-500/30 mb-3" />
                </div>

                <div className="relative flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
                  ))}
                </div>
                <p className="relative text-gray-700 dark:text-gray-300 leading-relaxed font-cormorant text-base tracking-wide">
                  &ldquo;{t[`review_${n}`]}&rdquo;
                </p>
                <div className="relative mt-4 pt-4 border-t border-rose-100/40 dark:border-white/5">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t[`review_${n}_author`]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ═══════════════════ NEWS ═══════════════════ */}
      {latest.length > 0 && (
        <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-24 sm:pt-32">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              {t.news_tag}
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
              {t.news_title}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {latest.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group block rounded-2xl border border-rose-100/50 bg-white/70 backdrop-blur-sm overflow-hidden shadow-md shadow-rose-100/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 dark:border-white/6 dark:bg-white/[0.03] dark:shadow-none dark:hover:bg-white/[0.05]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-rose-50 dark:bg-white/5">
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-rose-300 dark:text-white/10">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs uppercase tracking-wider text-rose-500 dark:text-amber-400 font-semibold mb-2">
                    {t[`news_type_${item.type}`]}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-amber-300 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </RevealSection>
      )}

      {/* ═══════════════════ CTA ═══════════════════ */}
      <RevealSection className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-24 sm:pt-32 pb-12">
        <div className={`relative overflow-hidden rounded-3xl ${styles.glassLine}`}>
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-500 to-amber-500 dark:from-amber-600 dark:via-amber-500 dark:to-orange-500" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
          <div className={`absolute inset-0 ${styles.ctaGlow}`} />

          <div className="relative z-10 px-6 sm:px-12 py-14 sm:py-16 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-white/60 mb-4" />
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
              {t.cta_title}
            </h2>
            <p className="mt-4 text-white/80 max-w-md mx-auto font-cormorant text-lg tracking-wide">
              {t.cta_desc}
            </p>
            <div className="mt-8">
              <Link
                href={localeHref("/booking", locale)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-rose-700 dark:text-amber-800 font-semibold text-sm shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
              >
                {t.cta_btn}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ═══════════════════ CONTACT STRIP ═══════════════════ */}
      <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pb-20">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
            <MapPin className="h-3.5 w-3.5" />
            {t.contact_tag}
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl font-light tracking-tight text-gray-900 dark:text-white">
            {t.contact_title}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: MapPin, text: t.contact_address, color: "text-rose-500 dark:text-amber-400" },
            { icon: Clock, text: t.contact_hours, color: "text-emerald-500 dark:text-emerald-400" },
            { icon: Phone, text: t.contact_phone, color: "text-sky-500 dark:text-sky-400" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-rose-100/50 bg-white/70 backdrop-blur-sm p-5 dark:border-white/6 dark:bg-white/[0.03]"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-50 dark:bg-white/5 flex items-center justify-center">
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href={localeHref("/contacts", locale)}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-amber-400 hover:text-rose-700 dark:hover:text-amber-300 transition-colors"
          >
            {t.contact_map}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </RevealSection>

      {/* CSS keyframes for gallery scroll + video fade */}
      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}



//------улучшаем загрузку страници и добавляем второй ряд видео------
// // src/components/home-page.tsx
// "use client";

// import { useRef, useEffect, useState, useCallback } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, useInView, useScroll, useTransform } from "framer-motion";
// import {
//   Sparkles,
//   Star,
//   Shield,
//   Clock,
//   Heart,
//   ChevronRight,
//   ArrowRight,
//   MapPin,
//   Phone,
//   Calendar,
//   Award,
//   Gem,
//   Users,
//   Scissors,
//   Eye,
//   Palette,
//   HandMetal,
//   Quote,
//   Images,
// } from "lucide-react";
// import RainbowCTA from "@/components/RainbowCTA";
// import { useI18n } from "@/i18n/I18nProvider";
// import styles from "./home-page.module.css";
// import type { Locale } from "@/i18n/locales";

// /* ═══════════════════════ TYPES ═══════════════════════ */

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// type ServiceItem = {
//   id: string;
//   slug: string;
//   name: string;
//   cover: string | null;
//   description: string | null;
// };

// type Props = {
//   latest: ArticleItem[];
//   services?: ServiceItem[];
// };

// /* ═══════════════════════ i18n ═══════════════════════ */

// const t_map: Record<Locale, Record<string, string>> = {
//   de: {
//     hero_tag: "Willkommen bei Salon Elen",
//     hero_title_1: "Schönheit",
//     hero_title_2: "die begeistert",
//     hero_desc: "Professionelle Kosmetik, Permanent Make-up, Nageldesign und mehr — im Herzen von Halle an der Saale.",
//     hero_cta: "Termin buchen",
//     hero_services: "Alle Leistungen",
//     hero_badge: "Online-Termin 24/7",

//     stats_years: "Jahre Erfahrung",
//     stats_clients: "Zufriedene Kunden",
//     stats_services: "Leistungen",
//     stats_rating: "Bewertung",

//     services_tag: "Unsere Leistungen",
//     services_title: "Was wir am besten können",
//     services_desc: "Von Permanent Make-up bis Nageldesign — wir bieten alles für Ihre Schönheit.",
//     services_all: "Alle Leistungen ansehen",
//     service_1: "Permanent Make-up",
//     service_1_desc: "Perfekte Augenbrauen, Lippen und Lidstriche — natürlich und dauerhaft schön.",
//     service_2: "Wimpernverlängerung",
//     service_2_desc: "Voluminöse, natürlich wirkende Wimpern für einen ausdrucksstarken Blick.",
//     service_3: "Nageldesign",
//     service_3_desc: "Maniküre, Gelnägel und kreative Designs — Ästhetik bis in die Fingerspitzen.",
//     service_4: "Microneedling",
//     service_4_desc: "Hautverjüngung und Kollagenboost für ein strahlendes, ebenmäßiges Hautbild.",

//     why_tag: "Warum Salon Elen",
//     why_title: "Vertrauen Sie den Besten",
//     why_1_title: "Zertifizierte Meister",
//     why_1_desc: "Unsere Spezialisten verfügen über internationale Zertifikate und langjährige Erfahrung.",
//     why_2_title: "Premium Produkte",
//     why_2_desc: "Wir arbeiten ausschließlich mit hochwertigen, geprüften Marken und Materialien.",
//     why_3_title: "Sterile Sicherheit",
//     why_3_desc: "Höchste Hygienestandards und Einwegmaterialien für Ihre Sicherheit.",
//     why_4_title: "Individuelle Beratung",
//     why_4_desc: "Jede Behandlung wird individuell auf Sie abgestimmt — für perfekte Ergebnisse.",

//     gallery_tag: "Unsere Arbeiten",
//     gallery_title: "Ergebnisse, die überzeugen",
//     gallery_cta: "Galerie ansehen",

//     reviews_tag: "Bewertungen",
//     reviews_title: "Was unsere Kunden sagen",
//     review_1: "Absolut begeistert vom Permanent Make-up! Natürlich und perfekt gemacht.",
//     review_1_author: "Anna M.",
//     review_2: "Bester Nagelservice in Halle. Komme seit 2 Jahren regelmäßig.",
//     review_2_author: "Maria K.",
//     review_3: "Die Wimpernverlängerung sieht so natürlich aus. Professionelles Team!",
//     review_3_author: "Sophie L.",

//     news_tag: "Aktuelles",
//     news_title: "News & Artikel",
//     news_empty: "Noch keine Beiträge.",
//     news_type_ARTICLE: "Artikel",
//     news_type_NEWS: "News",
//     news_type_PROMO: "Aktion",

//     cta_title: "Bereit für Ihre Verwandlung?",
//     cta_desc: "Buchen Sie jetzt Ihren Termin — bequem online, 24 Stunden am Tag.",
//     cta_btn: "Jetzt buchen",

//     contact_tag: "Besuchen Sie uns",
//     contact_title: "Salon Elen in Halle",
//     contact_address: "Leipziger Straße 63, 06108 Halle (Saale)",
//     contact_hours: "Mo–Fr 09:00–19:00 · Sa 09:00–16:00",
//     contact_phone: "+49 345 1234567",
//     contact_map: "Auf der Karte ansehen",
//   },
//   en: {
//     hero_tag: "Welcome to Salon Elen",
//     hero_title_1: "Beauty",
//     hero_title_2: "that inspires",
//     hero_desc: "Professional cosmetics, permanent make-up, nail design, and more — in the heart of Halle an der Saale.",
//     hero_cta: "Book now",
//     hero_services: "All services",
//     hero_badge: "Online booking 24/7",

//     stats_years: "Years of experience",
//     stats_clients: "Happy clients",
//     stats_services: "Services",
//     stats_rating: "Rating",

//     services_tag: "Our services",
//     services_title: "What we do best",
//     services_desc: "From permanent make-up to nail design — everything for your beauty.",
//     services_all: "View all services",
//     service_1: "Permanent Make-up",
//     service_1_desc: "Perfect brows, lips, and eyeliner — naturally beautiful and long-lasting.",
//     service_2: "Eyelash Extensions",
//     service_2_desc: "Voluminous, natural-looking lashes for an expressive gaze.",
//     service_3: "Nail Design",
//     service_3_desc: "Manicure, gel nails, and creative designs — beauty to your fingertips.",
//     service_4: "Microneedling",
//     service_4_desc: "Skin rejuvenation and collagen boost for a radiant, even complexion.",

//     why_tag: "Why Salon Elen",
//     why_title: "Trust the best",
//     why_1_title: "Certified Masters",
//     why_1_desc: "Our specialists hold international certificates and years of experience.",
//     why_2_title: "Premium Products",
//     why_2_desc: "We use only high-quality, tested brands and materials.",
//     why_3_title: "Sterile Safety",
//     why_3_desc: "Highest hygiene standards and disposable materials for your safety.",
//     why_4_title: "Personal Consultation",
//     why_4_desc: "Every treatment is tailored to you — for perfect results.",

//     gallery_tag: "Our works",
//     gallery_title: "Results that convince",
//     gallery_cta: "View gallery",

//     reviews_tag: "Reviews",
//     reviews_title: "What our clients say",
//     review_1: "Absolutely love the permanent make-up! Natural and perfectly done.",
//     review_1_author: "Anna M.",
//     review_2: "Best nail service in Halle. Been coming regularly for 2 years.",
//     review_2_author: "Maria K.",
//     review_3: "The lash extensions look so natural. Very professional team!",
//     review_3_author: "Sophie L.",

//     news_tag: "Latest",
//     news_title: "News & Articles",
//     news_empty: "No posts yet.",
//     news_type_ARTICLE: "Article",
//     news_type_NEWS: "News",
//     news_type_PROMO: "Promo",

//     cta_title: "Ready for your transformation?",
//     cta_desc: "Book your appointment now — conveniently online, 24 hours a day.",
//     cta_btn: "Book now",

//     contact_tag: "Visit us",
//     contact_title: "Salon Elen in Halle",
//     contact_address: "Leipziger Straße 63, 06108 Halle (Saale)",
//     contact_hours: "Mon–Fri 09:00–19:00 · Sat 09:00–16:00",
//     contact_phone: "+49 345 1234567",
//     contact_map: "View on map",
//   },
//   ru: {
//     hero_tag: "Добро пожаловать в Salon Elen",
//     hero_title_1: "Красота,",
//     hero_title_2: "которая вдохновляет",
//     hero_desc: "Профессиональная косметология, перманентный макияж, дизайн ногтей и многое другое — в центре Галле.",
//     hero_cta: "Записаться",
//     hero_services: "Все услуги",
//     hero_badge: "Онлайн-запись 24/7",

//     stats_years: "Лет опыта",
//     stats_clients: "Довольных клиентов",
//     stats_services: "Услуг",
//     stats_rating: "Рейтинг",

//     services_tag: "Наши услуги",
//     services_title: "Что мы умеем лучше всего",
//     services_desc: "От перманентного макияжа до дизайна ногтей — всё для вашей красоты.",
//     services_all: "Смотреть все услуги",
//     service_1: "Перманентный макияж",
//     service_1_desc: "Идеальные брови, губы и стрелки — естественно и надолго.",
//     service_2: "Наращивание ресниц",
//     service_2_desc: "Объёмные и естественные ресницы для выразительного взгляда.",
//     service_3: "Дизайн ногтей",
//     service_3_desc: "Маникюр, гель-лак и креативный дизайн — эстетика до кончиков пальцев.",
//     service_4: "Микронидлинг",
//     service_4_desc: "Омоложение кожи и стимуляция коллагена для сияющего ровного тона.",

//     why_tag: "Почему Salon Elen",
//     why_title: "Доверьтесь лучшим",
//     why_1_title: "Сертифицированные мастера",
//     why_1_desc: "Наши специалисты имеют международные сертификаты и многолетний опыт.",
//     why_2_title: "Премиум-продукция",
//     why_2_desc: "Мы работаем только с проверенными брендами и качественными материалами.",
//     why_3_title: "Стерильная безопасность",
//     why_3_desc: "Высочайшие стандарты гигиены и одноразовые материалы для вашей безопасности.",
//     why_4_title: "Индивидуальный подход",
//     why_4_desc: "Каждая процедура подбирается индивидуально — для идеального результата.",

//     gallery_tag: "Наши работы",
//     gallery_title: "Результаты, которые говорят сами за себя",
//     gallery_cta: "Смотреть галерею",

//     reviews_tag: "Отзывы",
//     reviews_title: "Что говорят наши клиенты",
//     review_1: "В полном восторге от перманентного макияжа! Естественно и идеально.",
//     review_1_author: "Анна М.",
//     review_2: "Лучший маникюр в Галле. Хожу уже 2 года регулярно.",
//     review_2_author: "Мария К.",
//     review_3: "Наращивание ресниц выглядит очень натурально. Профессиональная команда!",
//     review_3_author: "Софи Л.",

//     news_tag: "Новости",
//     news_title: "Новости и статьи",
//     news_empty: "Публикаций пока нет.",
//     news_type_ARTICLE: "Статья",
//     news_type_NEWS: "Новость",
//     news_type_PROMO: "Акция",

//     cta_title: "Готовы к преображению?",
//     cta_desc: "Запишитесь прямо сейчас — удобно онлайн, 24 часа в сутки.",
//     cta_btn: "Записаться",

//     contact_tag: "Приходите к нам",
//     contact_title: "Salon Elen в Галле",
//     contact_address: "Leipziger Straße 63, 06108 Halle (Saale)",
//     contact_hours: "Пн–Пт 09:00–19:00 · Сб 09:00–16:00",
//     contact_phone: "+49 345 1234567",
//     contact_map: "Показать на карте",
//   },
// };

// /* ═══════════════════════ HELPERS ═══════════════════════ */

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
// }

// /* ── Animated counter ── */
// function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
//   const ref = useRef<HTMLSpanElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-50px" });
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     if (!isInView) return;
//     let frame: number;
//     const duration = 2000;
//     const start = performance.now();

//     const step = (now: number) => {
//       const elapsed = now - start;
//       const progress = Math.min(elapsed / duration, 1);
//       const eased = 1 - Math.pow(1 - progress, 3);
//       setCount(Math.round(eased * target));
//       if (progress < 1) frame = requestAnimationFrame(step);
//     };
//     frame = requestAnimationFrame(step);
//     return () => cancelAnimationFrame(frame);
//   }, [isInView, target]);

//   return <span ref={ref}>{count}{suffix}</span>;
// }

// /* ── Section wrapper with scroll reveal ── */
// function RevealSection({
//   children,
//   className = "",
//   delay = 0,
// }: {
//   children: React.ReactNode;
//   className?: string;
//   delay?: number;
// }) {
//   const ref = useRef<HTMLElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-80px" });

//   return (
//     <section
//       ref={ref}
//       className={`transition-all duration-700 ${className}`}
//       style={{
//         opacity: isInView ? 1 : 0,
//         transform: isInView ? "translateY(0)" : "translateY(40px)",
//         transitionDelay: `${delay}ms`,
//       }}
//     >
//       {children}
//     </section>
//   );
// }

// /* ═══════ SERVICE CONFIG ═══════ */
// const SERVICES_CFG = [
//   { icon: Eye,      grad: "from-rose-500 to-pink-600",   glow: "shadow-rose-500/30",   ring: "border-rose-400/20",  emoji: "👁️" },
//   { icon: Sparkles,  grad: "from-violet-500 to-purple-600", glow: "shadow-violet-500/30", ring: "border-violet-400/20", emoji: "✨" },
//   { icon: HandMetal, grad: "from-pink-500 to-rose-600",  glow: "shadow-pink-500/30",   ring: "border-pink-400/20",  emoji: "💅" },
//   { icon: Gem,       grad: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/30", ring: "border-emerald-400/20", emoji: "💎" },
// ];

// const WHY_CFG = [
//   { icon: Award,  color: "text-rose-500 dark:text-amber-400",    bg: "bg-rose-50 dark:bg-rose-500/10",    ring: "ring-rose-200/60 dark:ring-amber-500/20" },
//   { icon: Gem,    color: "text-violet-500 dark:text-violet-400",  bg: "bg-violet-50 dark:bg-violet-500/10", ring: "ring-violet-200/60 dark:ring-violet-500/20" },
//   { icon: Shield, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", ring: "ring-emerald-200/60 dark:ring-emerald-500/20" },
//   { icon: Heart,  color: "text-pink-500 dark:text-pink-400",      bg: "bg-pink-50 dark:bg-pink-500/10",    ring: "ring-pink-200/60 dark:ring-pink-500/20" },
// ];

// /* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

// export default function HomePage({ latest }: Props) {
//   const { locale } = useI18n();
//   const t = t_map[locale];

//   /* Hero parallax */
//   const heroRef = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({
//     target: heroRef,
//     offset: ["start start", "end start"],
//   });
//   const heroImgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
//   const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

//   return (
//     <main className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 via-white to-white dark:from-[#0a0a0f] dark:via-[#0c0c14] dark:to-[#0a0a0f]">

//       {/* ═══════════════════ HERO ═══════════════════ */}
//       <div ref={heroRef} className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden">
//         {/* Background — Desktop: static image with parallax */}
//         <motion.div className="absolute inset-0 z-0 hidden md:block" style={{ y: heroImgY }}>
//           <Image
//             src="/images/hero.webp"
//             alt="Salon Elen"
//             fill
//             priority
//             sizes="100vw"
//             className="object-cover object-[65%_40%] scale-110"
//           />
//         </motion.div>

//         {/* Background — Mobile: looping video with poster fallback */}
//         <div className="absolute inset-0 z-0 md:hidden">
//           <video
//             autoPlay
//             muted
//             loop
//             playsInline
//             poster="/images/hero-mobile.webp"
//             className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
//           >
//             <source src="/images/hero-video.webm" type="video/webm" />
//           </video>
//         </div>

//         {/* Gradient overlays */}
//         {/* Mobile: subtle bottom gradient on light image — keeps face visible */}
//         <div className="absolute inset-0 z-[1] md:hidden bg-gradient-to-t from-white/90 via-white/30 to-transparent" />
//         {/* Desktop: dark cinematic overlays */}
//         <div className="hidden md:block absolute inset-0 z-[1] bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
//         <div className="hidden md:block absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-transparent to-black/20" />

//         {/* Spotlight shimmer — desktop only */}
//         <div className={`absolute inset-0 hidden md:block ${styles.shimmer}`} />

//         {/* Floating orbs — desktop only */}
//         <div className={`absolute -left-32 top-[15%] w-[420px] h-[420px] rounded-full blur-[80px] z-[1] hidden md:block ${styles.orbA}`} />
//         <div className={`absolute right-[10%] top-[40%] w-[340px] h-[340px] rounded-full blur-[70px] z-[1] hidden md:block ${styles.orbB}`} />
//         <div className={`absolute left-[30%] bottom-[10%] w-[280px] h-[280px] rounded-full blur-[60px] z-[1] hidden md:block ${styles.orbC}`} />

//         {/* Film grain — desktop only */}
//         <div className={`absolute inset-0 z-[3] hidden md:block ${styles.noise}`} />

//         {/* Decorative orb — desktop only */}
//         <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-rose-500/8 blur-[120px] z-[1] pointer-events-none hidden md:block" />

//         {/* Content — bottom-aligned on mobile, centered on desktop */}
//         <motion.div className="relative z-10 w-full" style={{ opacity: heroOpacity }}>
//           <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-10 pt-[60svh] md:pb-0 md:pt-0 md:py-0">
//             <div className="max-w-2xl">
//               {/* Tag */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.2 }}
//                 className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-50/60 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1.5 text-[11px] md:text-xs font-medium tracking-wide text-rose-700 mb-4 md:border-white/20 md:bg-white/10 md:text-white/90 md:mb-6"
//               >
//                 <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 text-rose-500 md:text-amber-300" />
//                 {t.hero_tag}
//               </motion.div>

//               {/* Title */}
//               <motion.h1
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.7, delay: 0.35 }}
//                 className="font-playfair text-[clamp(34px,8vw,80px)] leading-[0.95] font-light tracking-tight text-gray-900 md:text-white"
//               >
//                 {t.hero_title_1}
//                 <br />
//                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-500 to-amber-500 md:from-rose-300 md:via-pink-200 md:to-amber-200">
//                   {t.hero_title_2}
//                 </span>
//               </motion.h1>

//               {/* Description */}
//               <motion.p
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.55 }}
//                 className="mt-3 md:mt-6 text-sm md:text-lg text-gray-600 md:text-white/80 leading-relaxed max-w-lg font-cormorant tracking-wide line-clamp-2 md:line-clamp-none"
//               >
//                 {t.hero_desc}
//               </motion.p>

//               {/* CTAs */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.7 }}
//                 className="mt-5 md:mt-8 flex flex-wrap gap-3 md:gap-4"
//               >
//                 <RainbowCTA
//                   href={localeHref("/booking", locale)}
//                   label={t.hero_cta}
//                   className="h-11 px-6 text-sm md:h-12 md:px-8 md:text-[15px]"
//                   idle
//                 />
//                 <Link
//                   href={localeHref("/services", locale)}
//                   className="group inline-flex h-11 px-5 md:h-12 md:px-6 items-center gap-2 rounded-full border border-rose-300/50 text-rose-700 hover:bg-rose-50 md:border-white/30 md:text-white/90 md:hover:bg-white/10 md:hover:border-white/50 transition-all duration-300 text-sm font-medium"
//                 >
//                   {t.hero_services}
//                   <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                 </Link>
//               </motion.div>

//               {/* Badge */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.6, delay: 0.9 }}
//                 className="mt-4 md:mt-6 flex items-center gap-2 text-gray-400 md:text-white/50 text-xs md:text-sm"
//               >
//                 <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
//                 {t.hero_badge}
//               </motion.div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Scroll indicator — desktop only */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1.5 }}
//           className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
//         >
//           <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
//             <motion.div
//               animate={{ y: [0, 8, 0] }}
//               transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
//               className="w-1 h-1.5 rounded-full bg-white/60"
//             />
//           </div>
//         </motion.div>
//       </div>

//       {/* ═══════════════════ STATS ═══════════════════ */}
//       <RevealSection className="relative z-10 -mt-16 sm:-mt-20 mx-auto max-w-6xl px-5 sm:px-8">
//         <div className={`relative overflow-hidden rounded-2xl ${styles.glassLine}`}>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
//           {[
//             { value: 8, suffix: "+", label: t.stats_years, icon: Award },
//             { value: 2500, suffix: "+", label: t.stats_clients, icon: Users },
//             { value: 50, suffix: "+", label: t.stats_services, icon: Scissors },
//             { value: 4.9, suffix: "", label: t.stats_rating, icon: Star, isDecimal: true },
//           ].map((stat, i) => (
//             <div
//               key={i}
//               className="relative group rounded-2xl border border-rose-200/30 bg-white/80 backdrop-blur-xl p-5 sm:p-6 text-center shadow-lg shadow-rose-100/20 hover:shadow-xl hover:shadow-rose-200/25 transition-all duration-500 hover:-translate-y-1 dark:border-white/8 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/8"
//             >
//               <stat.icon className="mx-auto h-5 w-5 text-rose-400 dark:text-amber-400 mb-3 transition-transform duration-500 group-hover:scale-110" />
//               <div className="text-3xl sm:text-4xl font-playfair font-light text-rose-900 dark:text-amber-100 tabular-nums">
//                 {stat.isDecimal ? (
//                   <span>4.9</span>
//                 ) : (
//                   <AnimatedCounter target={stat.value} suffix={stat.suffix} />
//                 )}
//               </div>
//               <div className="mt-1 text-xs sm:text-sm text-rose-700/60 dark:text-white/50 font-medium tracking-wide">
//                 {stat.label}
//               </div>
//             </div>
//           ))}
//         </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ SERVICES ═══════════════════ */}
//       <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
//         {/* ── Visible gradient mesh background ── */}
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-100/70 via-pink-50/40 to-amber-50/50 dark:from-rose-950/20 dark:via-purple-950/10 dark:to-amber-950/15" />
//           <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-rose-300/25 to-pink-200/20 blur-[80px] dark:from-rose-500/8 dark:to-pink-500/5 animate-pulse" style={{ animationDuration: '8s' }} />
//           <div className="absolute -bottom-32 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-amber-200/25 to-rose-200/15 blur-[90px] dark:from-amber-500/6 dark:to-rose-500/4 animate-pulse" style={{ animationDuration: '10s' }} />
//           {/* Dot grid */}
//           <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
//         </div>

//         {/* ── Decorative divider top ── */}
//         <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/40 to-transparent dark:via-amber-500/15" />

//         <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
//           <div className="text-center mb-12 sm:mb-16">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               <Sparkles className="h-3.5 w-3.5" />
//               {t.services_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.services_title}
//             </h2>
//             <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-cormorant text-lg tracking-wide">
//               {t.services_desc}
//             </p>
//           </div>

//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//             {SERVICES_CFG.map((cfg, i) => {
//               const n = i + 1;
//               const IconComp = cfg.icon;
//               return (
//                 <Link
//                   key={n}
//                   href={localeHref("/services", locale)}
//                   className="group relative rounded-2xl border border-rose-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg shadow-rose-100/20 hover:shadow-xl hover:shadow-rose-200/30 transition-all duration-500 hover:-translate-y-3 dark:border-white/8 dark:bg-white/[0.05] dark:shadow-none dark:hover:bg-white/[0.08] dark:hover:border-white/12 overflow-hidden"
//                 >
//                   {/* Card inner glow on hover */}
//                   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-rose-100/40 via-transparent to-pink-100/30 dark:from-amber-500/5 dark:to-purple-500/5 pointer-events-none" />

//                   {/* ── Animated icon container ── */}
//                   <div className="relative mb-5">
//                     {/* Outer pulse ring */}
//                     <div className={`absolute -inset-2 rounded-2xl border ${cfg.ring} opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110 group-hover:animate-ping`} style={{ animationDuration: '2s', animationIterationCount: '1' }} />
//                     {/* Glow backdrop */}
//                     <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${cfg.grad} blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
//                     {/* Icon box */}
//                     <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${cfg.grad} ${cfg.glow} shadow-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
//                       <IconComp className="h-6 w-6 text-white drop-shadow-sm" />
//                     </div>
//                   </div>

//                   <h3 className="relative font-semibold text-gray-900 dark:text-white mb-2 text-[15px]">
//                     {t[`service_${n}`]}
//                   </h3>
//                   <p className="relative text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
//                     {t[`service_${n}_desc`]}
//                   </p>
//                   <div className="relative mt-4 inline-flex items-center gap-1.5 text-rose-600 dark:text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
//                     <span>{t.hero_services === "Alle Leistungen" ? "Mehr" : t.hero_services === "All services" ? "More" : "Ещё"}</span>
//                     <ArrowRight className="h-3.5 w-3.5" />
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>

//           <div className="text-center mt-10">
//             <Link
//               href={localeHref("/services", locale)}
//               className="group inline-flex items-center gap-2 rounded-full border border-rose-200/50 bg-white/70 backdrop-blur-sm px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100/80 hover:border-rose-300/60 hover:shadow-md transition-all duration-300 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300 dark:hover:bg-amber-500/10"
//             >
//               {t.services_all}
//               <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//             </Link>
//           </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ WHY US ═══════════════════ */}
//       <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
//         {/* ── Gradient mesh background ── */}
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-tl from-pink-50/60 via-rose-50/30 to-amber-50/40 dark:from-purple-950/15 dark:via-slate-950/5 dark:to-amber-950/10" />
//           <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-l from-violet-200/20 to-pink-200/15 blur-[80px] dark:from-violet-500/6 dark:to-pink-500/4 animate-pulse" style={{ animationDuration: '12s' }} />
//           <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-rose-200/20 to-amber-200/15 blur-[70px] dark:from-rose-500/5 dark:to-amber-500/4 animate-pulse" style={{ animationDuration: '9s' }} />
//           {/* Cross-hatch pattern */}
//           <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(45deg, currentColor 1px, transparent 1px), linear-gradient(-45deg, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
//         </div>

//         {/* Top divider */}
//         <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/30 to-transparent dark:via-amber-500/10" />

//         <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
//           <div className="text-center mb-12 sm:mb-16">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               <Shield className="h-3.5 w-3.5" />
//               {t.why_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.why_title}
//             </h2>
//           </div>

//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//             {WHY_CFG.map((cfg, i) => {
//               const key = String(i + 1);
//               const IconComp = cfg.icon;
//               return (
//                 <div
//                   key={i}
//                   className="group text-center p-6 rounded-2xl border border-rose-100/30 bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:border-rose-200/50 hover:shadow-lg hover:shadow-rose-100/20 dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:border-white/10 transition-all duration-500 hover:-translate-y-1"
//                 >
//                   {/* ── Animated icon with rings ── */}
//                   <div className="relative mx-auto w-20 h-20 mb-5">
//                     {/* Outer animated ring */}
//                     <div className={`absolute inset-0 rounded-full ring-2 ${cfg.ring} opacity-40 group-hover:opacity-80 group-hover:scale-125 transition-all duration-700`} />
//                     {/* Middle ring - counter-rotate on hover */}
//                     <div className={`absolute inset-1.5 rounded-full ring-1 ${cfg.ring} opacity-20 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 delay-75`} />
//                     {/* Icon circle */}
//                     <div className={`absolute inset-3 rounded-full ${cfg.bg} flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg`}>
//                       <IconComp className={`h-7 w-7 ${cfg.color} transition-transform duration-500 group-hover:scale-110`} />
//                     </div>
//                   </div>

//                   <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
//                     {t[`why_${key}_title`]}
//                   </h3>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
//                     {t[`why_${key}_desc`]}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Bottom divider */}
//         <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/30 to-transparent dark:via-amber-500/10" />
//       </RevealSection>

//       {/* ═══════════════════ GALLERY PREVIEW ═══════════════════ */}
//       <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
//         {/* ── Background ── */}
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-b from-rose-50/40 via-white/80 to-pink-50/30 dark:from-purple-950/10 dark:via-slate-950/5 dark:to-amber-950/8" />
//           <div className="absolute left-[5%] top-[20%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-sky-200/15 to-violet-200/10 blur-[80px] dark:from-sky-500/5 dark:to-violet-500/3 animate-pulse" style={{ animationDuration: '11s' }} />
//         </div>

//         <div className="relative">
//           <div className="text-center mb-10 px-5">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               <Images className="h-3.5 w-3.5" />
//               {t.gallery_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.gallery_title}
//             </h2>
//           </div>

//           {/* Horizontal scroll strip */}
//           <div className="relative overflow-hidden">
//             <div className="flex gap-3 animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused] w-max">
//               {[
//                 "/images/services/haircut.webp",
//                 "/images/services/makeup.webp",
//                 "/images/services/manicure.webp",
//                 "/images/hero.webp",
//                 "/images/services/haircut.webp",
//                 "/images/services/makeup.webp",
//                 "/images/services/manicure.webp",
//                 "/images/hero.webp",
//               ].map((src, i) => (
//                 <div
//                   key={i}
//                   className="relative w-[260px] sm:w-[320px] aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 group shadow-lg shadow-rose-100/10 dark:shadow-none"
//                 >
//                   <Image
//                     src={src}
//                     alt={`Gallery ${i + 1}`}
//                     fill
//                     loading="lazy"
//                     sizes="320px"
//                     className="object-cover transition-transform duration-700 group-hover:scale-110"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                   <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
//                     Salon Elen
//                   </div>
//                 </div>
//               ))}
//             </div>
//             {/* Edge fades */}
//             <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-rose-50/80 dark:from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
//             <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
//           </div>

//           <div className="text-center mt-8">
//             <Link
//               href={localeHref("/gallerie", locale)}
//               className="group inline-flex items-center gap-2 rounded-full border border-rose-200/50 bg-white/70 backdrop-blur-sm px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100/80 hover:shadow-md transition-all duration-300 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300 dark:hover:bg-amber-500/10"
//             >
//               {t.gallery_cta}
//               <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//             </Link>
//           </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ REVIEWS ═══════════════════ */}
//       <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
//         {/* ── Background ── */}
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-tr from-amber-50/40 via-rose-50/30 to-pink-50/50 dark:from-amber-950/10 dark:via-purple-950/8 dark:to-rose-950/10" />
//           <div className="absolute -left-20 top-[30%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-200/20 to-rose-200/15 blur-[80px] dark:from-pink-500/5 dark:to-rose-500/4 animate-pulse" style={{ animationDuration: '10s' }} />
//           <div className="absolute right-[5%] top-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-l from-amber-200/20 to-orange-200/15 blur-[70px] dark:from-amber-500/5 dark:to-orange-500/4 animate-pulse" style={{ animationDuration: '13s' }} />
//           {/* Dot grid */}
//           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
//         </div>

//         {/* Top divider */}
//         <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/30 to-transparent dark:via-amber-500/10" />

//         <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
//           <div className="text-center mb-12">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               <Star className="h-3.5 w-3.5" />
//               {t.reviews_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.reviews_title}
//             </h2>
//           </div>

//           <div className="grid gap-5 md:grid-cols-3">
//             {[1, 2, 3].map((n) => (
//               <div
//                 key={n}
//                 className="group relative rounded-2xl border border-rose-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg shadow-rose-100/15 hover:shadow-xl hover:shadow-rose-200/25 hover:-translate-y-2 transition-all duration-500 dark:border-white/8 dark:bg-white/[0.05] dark:shadow-none dark:hover:bg-white/[0.08] overflow-hidden"
//               >
//                 {/* Card glow on hover */}
//                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-amber-50/40 via-transparent to-rose-50/30 dark:from-amber-500/3 dark:to-rose-500/3 pointer-events-none" />

//                 {/* Quote icon with glow */}
//                 <div className="relative">
//                   <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-rose-200/30 to-amber-200/20 blur-md opacity-50 dark:from-amber-500/10 dark:to-rose-500/5" />
//                   <Quote className="relative h-8 w-8 text-rose-300 dark:text-amber-500/30 mb-3" />
//                 </div>

//                 <div className="relative flex gap-0.5 mb-3">
//                   {Array.from({ length: 5 }).map((_, i) => (
//                     <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
//                   ))}
//                 </div>
//                 <p className="relative text-gray-700 dark:text-gray-300 leading-relaxed font-cormorant text-base tracking-wide">
//                   &ldquo;{t[`review_${n}`]}&rdquo;
//                 </p>
//                 <div className="relative mt-4 pt-4 border-t border-rose-100/40 dark:border-white/5">
//                   <span className="text-sm font-semibold text-gray-900 dark:text-white">
//                     {t[`review_${n}_author`]}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ NEWS ═══════════════════ */}
//       {latest.length > 0 && (
//         <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-24 sm:pt-32">
//           <div className="text-center mb-12">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               {t.news_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.news_title}
//             </h2>
//           </div>

//           <div className="grid gap-5 md:grid-cols-3">
//             {latest.map((item) => (
//               <Link
//                 key={item.id}
//                 href={`/news/${item.slug}`}
//                 className="group block rounded-2xl border border-rose-100/50 bg-white/70 backdrop-blur-sm overflow-hidden shadow-md shadow-rose-100/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 dark:border-white/6 dark:bg-white/[0.03] dark:shadow-none dark:hover:bg-white/[0.05]"
//               >
//                 <div className="relative aspect-[16/10] overflow-hidden bg-rose-50 dark:bg-white/5">
//                   {item.cover ? (
//                     <Image
//                       src={item.cover}
//                       alt={item.title}
//                       fill
//                       loading="lazy"
//                       sizes="(max-width: 768px) 100vw, 33vw"
//                       className="object-cover transition-transform duration-700 group-hover:scale-105"
//                     />
//                   ) : (
//                     <div className="flex h-full w-full items-center justify-center text-rose-300 dark:text-white/10">
//                       <Sparkles className="h-8 w-8" />
//                     </div>
//                   )}
//                 </div>
//                 <div className="p-5">
//                   <div className="text-xs uppercase tracking-wider text-rose-500 dark:text-amber-400 font-semibold mb-2">
//                     {t[`news_type_${item.type}`]}
//                   </div>
//                   <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-amber-300 transition-colors leading-snug">
//                     {item.title}
//                   </h3>
//                   {item.excerpt && (
//                     <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
//                       {item.excerpt}
//                     </p>
//                   )}
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </RevealSection>
//       )}

//       {/* ═══════════════════ CTA ═══════════════════ */}
//       <RevealSection className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-24 sm:pt-32 pb-12">
//         <div className={`relative overflow-hidden rounded-3xl ${styles.glassLine}`}>
//           {/* Gradient background */}
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-500 to-amber-500 dark:from-amber-600 dark:via-amber-500 dark:to-orange-500" />
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
//           <div className={`absolute inset-0 ${styles.ctaGlow}`} />

//           <div className="relative z-10 px-6 sm:px-12 py-14 sm:py-16 text-center">
//             <Sparkles className="mx-auto h-8 w-8 text-white/60 mb-4" />
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
//               {t.cta_title}
//             </h2>
//             <p className="mt-4 text-white/80 max-w-md mx-auto font-cormorant text-lg tracking-wide">
//               {t.cta_desc}
//             </p>
//             <div className="mt-8">
//               <Link
//                 href={localeHref("/booking", locale)}
//                 className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-rose-700 dark:text-amber-800 font-semibold text-sm shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
//               >
//                 {t.cta_btn}
//                 <ArrowRight className="h-4 w-4" />
//               </Link>
//             </div>
//           </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ CONTACT STRIP ═══════════════════ */}
//       <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pb-20">
//         <div className="text-center mb-10">
//           <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//             <MapPin className="h-3.5 w-3.5" />
//             {t.contact_tag}
//           </span>
//           <h2 className="font-playfair text-3xl sm:text-4xl font-light tracking-tight text-gray-900 dark:text-white">
//             {t.contact_title}
//           </h2>
//         </div>

//         <div className="grid gap-4 sm:grid-cols-3">
//           {[
//             { icon: MapPin, text: t.contact_address, color: "text-rose-500 dark:text-amber-400" },
//             { icon: Clock, text: t.contact_hours, color: "text-emerald-500 dark:text-emerald-400" },
//             { icon: Phone, text: t.contact_phone, color: "text-sky-500 dark:text-sky-400" },
//           ].map((item, i) => (
//             <div
//               key={i}
//               className="flex items-center gap-4 rounded-2xl border border-rose-100/50 bg-white/70 backdrop-blur-sm p-5 dark:border-white/6 dark:bg-white/[0.03]"
//             >
//               <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-50 dark:bg-white/5 flex items-center justify-center">
//                 <item.icon className={`h-5 w-5 ${item.color}`} />
//               </div>
//               <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
//                 {item.text}
//               </span>
//             </div>
//           ))}
//         </div>

//         <div className="text-center mt-8">
//           <Link
//             href={localeHref("/contacts", locale)}
//             className="group inline-flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-amber-400 hover:text-rose-700 dark:hover:text-amber-300 transition-colors"
//           >
//             {t.contact_map}
//             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//           </Link>
//         </div>
//       </RevealSection>

//       {/* CSS keyframes for gallery scroll */}
//       <style jsx global>{`
//         @keyframes scroll {
//           0% { transform: translateX(0); }
//           100% { transform: translateX(-50%); }
//         }
//       `}</style>
//     </main>
//   );
// }



//-------меняю под видео заставку-----
// // src/components/home-page.tsx
// "use client";

// import { useRef, useEffect, useState, useCallback } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, useInView, useScroll, useTransform } from "framer-motion";
// import {
//   Sparkles,
//   Star,
//   Shield,
//   Clock,
//   Heart,
//   ChevronRight,
//   ArrowRight,
//   MapPin,
//   Phone,
//   Calendar,
//   Award,
//   Gem,
//   Users,
//   Scissors,
//   Eye,
//   Palette,
//   HandMetal,
//   Quote,
//   Images,
// } from "lucide-react";
// import RainbowCTA from "@/components/RainbowCTA";
// import { useI18n } from "@/i18n/I18nProvider";
// import styles from "./home-page.module.css";
// import type { Locale } from "@/i18n/locales";

// /* ═══════════════════════ TYPES ═══════════════════════ */

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// type ServiceItem = {
//   id: string;
//   slug: string;
//   name: string;
//   cover: string | null;
//   description: string | null;
// };

// type Props = {
//   latest: ArticleItem[];
//   services?: ServiceItem[];
// };

// /* ═══════════════════════ i18n ═══════════════════════ */

// const t_map: Record<Locale, Record<string, string>> = {
//   de: {
//     hero_tag: "Willkommen bei Salon Elen",
//     hero_title_1: "Schönheit",
//     hero_title_2: "die begeistert",
//     hero_desc: "Professionelle Kosmetik, Permanent Make-up, Nageldesign und mehr — im Herzen von Halle an der Saale.",
//     hero_cta: "Termin buchen",
//     hero_services: "Alle Leistungen",
//     hero_badge: "Online-Termin 24/7",

//     stats_years: "Jahre Erfahrung",
//     stats_clients: "Zufriedene Kunden",
//     stats_services: "Leistungen",
//     stats_rating: "Bewertung",

//     services_tag: "Unsere Leistungen",
//     services_title: "Was wir am besten können",
//     services_desc: "Von Permanent Make-up bis Nageldesign — wir bieten alles für Ihre Schönheit.",
//     services_all: "Alle Leistungen ansehen",
//     service_1: "Permanent Make-up",
//     service_1_desc: "Perfekte Augenbrauen, Lippen und Lidstriche — natürlich und dauerhaft schön.",
//     service_2: "Wimpernverlängerung",
//     service_2_desc: "Voluminöse, natürlich wirkende Wimpern für einen ausdrucksstarken Blick.",
//     service_3: "Nageldesign",
//     service_3_desc: "Maniküre, Gelnägel und kreative Designs — Ästhetik bis in die Fingerspitzen.",
//     service_4: "Microneedling",
//     service_4_desc: "Hautverjüngung und Kollagenboost für ein strahlendes, ebenmäßiges Hautbild.",

//     why_tag: "Warum Salon Elen",
//     why_title: "Vertrauen Sie den Besten",
//     why_1_title: "Zertifizierte Meister",
//     why_1_desc: "Unsere Spezialisten verfügen über internationale Zertifikate und langjährige Erfahrung.",
//     why_2_title: "Premium Produkte",
//     why_2_desc: "Wir arbeiten ausschließlich mit hochwertigen, geprüften Marken und Materialien.",
//     why_3_title: "Sterile Sicherheit",
//     why_3_desc: "Höchste Hygienestandards und Einwegmaterialien für Ihre Sicherheit.",
//     why_4_title: "Individuelle Beratung",
//     why_4_desc: "Jede Behandlung wird individuell auf Sie abgestimmt — für perfekte Ergebnisse.",

//     gallery_tag: "Unsere Arbeiten",
//     gallery_title: "Ergebnisse, die überzeugen",
//     gallery_cta: "Galerie ansehen",

//     reviews_tag: "Bewertungen",
//     reviews_title: "Was unsere Kunden sagen",
//     review_1: "Absolut begeistert vom Permanent Make-up! Natürlich und perfekt gemacht.",
//     review_1_author: "Anna M.",
//     review_2: "Bester Nagelservice in Halle. Komme seit 2 Jahren regelmäßig.",
//     review_2_author: "Maria K.",
//     review_3: "Die Wimpernverlängerung sieht so natürlich aus. Professionelles Team!",
//     review_3_author: "Sophie L.",

//     news_tag: "Aktuelles",
//     news_title: "News & Artikel",
//     news_empty: "Noch keine Beiträge.",
//     news_type_ARTICLE: "Artikel",
//     news_type_NEWS: "News",
//     news_type_PROMO: "Aktion",

//     cta_title: "Bereit für Ihre Verwandlung?",
//     cta_desc: "Buchen Sie jetzt Ihren Termin — bequem online, 24 Stunden am Tag.",
//     cta_btn: "Jetzt buchen",

//     contact_tag: "Besuchen Sie uns",
//     contact_title: "Salon Elen in Halle",
//     contact_address: "Lessingstraße 37, 06114 Halle (Saale)",
//     contact_hours: "Mo–Fr 09:00–19:00 · Sa 09:00–16:00",
//     contact_phone: "+49 177 8995106",
//     contact_map: "Auf der Karte ansehen",
//   },
//   en: {
//     hero_tag: "Welcome to Salon Elen",
//     hero_title_1: "Beauty",
//     hero_title_2: "that inspires",
//     hero_desc: "Professional cosmetics, permanent make-up, nail design, and more — in the heart of Halle an der Saale.",
//     hero_cta: "Book now",
//     hero_services: "All services",
//     hero_badge: "Online booking 24/7",

//     stats_years: "Years of experience",
//     stats_clients: "Happy clients",
//     stats_services: "Services",
//     stats_rating: "Rating",

//     services_tag: "Our services",
//     services_title: "What we do best",
//     services_desc: "From permanent make-up to nail design — everything for your beauty.",
//     services_all: "View all services",
//     service_1: "Permanent Make-up",
//     service_1_desc: "Perfect brows, lips, and eyeliner — naturally beautiful and long-lasting.",
//     service_2: "Eyelash Extensions",
//     service_2_desc: "Voluminous, natural-looking lashes for an expressive gaze.",
//     service_3: "Nail Design",
//     service_3_desc: "Manicure, gel nails, and creative designs — beauty to your fingertips.",
//     service_4: "Microneedling",
//     service_4_desc: "Skin rejuvenation and collagen boost for a radiant, even complexion.",

//     why_tag: "Why Salon Elen",
//     why_title: "Trust the best",
//     why_1_title: "Certified Masters",
//     why_1_desc: "Our specialists hold international certificates and years of experience.",
//     why_2_title: "Premium Products",
//     why_2_desc: "We use only high-quality, tested brands and materials.",
//     why_3_title: "Sterile Safety",
//     why_3_desc: "Highest hygiene standards and disposable materials for your safety.",
//     why_4_title: "Personal Consultation",
//     why_4_desc: "Every treatment is tailored to you — for perfect results.",

//     gallery_tag: "Our works",
//     gallery_title: "Results that convince",
//     gallery_cta: "View gallery",

//     reviews_tag: "Reviews",
//     reviews_title: "What our clients say",
//     review_1: "Absolutely love the permanent make-up! Natural and perfectly done.",
//     review_1_author: "Anna M.",
//     review_2: "Best nail service in Halle. Been coming regularly for 2 years.",
//     review_2_author: "Maria K.",
//     review_3: "The lash extensions look so natural. Very professional team!",
//     review_3_author: "Sophie L.",

//     news_tag: "Latest",
//     news_title: "News & Articles",
//     news_empty: "No posts yet.",
//     news_type_ARTICLE: "Article",
//     news_type_NEWS: "News",
//     news_type_PROMO: "Promo",

//     cta_title: "Ready for your transformation?",
//     cta_desc: "Book your appointment now — conveniently online, 24 hours a day.",
//     cta_btn: "Book now",

//     contact_tag: "Visit us",
//     contact_title: "Salon Elen in Halle",
//     contact_address: "Lessingstraße 37, 06114 Halle (Saale)",
//     contact_hours: "Mon–Fri 09:00–19:00 · Sat 09:00–16:00",
//     contact_phone: "+49 177 8995106",
//     contact_map: "View on map",
//   },
//   ru: {
//     hero_tag: "Добро пожаловать в Salon Elen",
//     hero_title_1: "Красота,",
//     hero_title_2: "которая вдохновляет",
//     hero_desc: "Профессиональная косметология, перманентный макияж, дизайн ногтей и многое другое — в центре Галле.",
//     hero_cta: "Записаться",
//     hero_services: "Все услуги",
//     hero_badge: "Онлайн-запись 24/7",

//     stats_years: "Лет опыта",
//     stats_clients: "Довольных клиентов",
//     stats_services: "Услуг",
//     stats_rating: "Рейтинг",

//     services_tag: "Наши услуги",
//     services_title: "Что мы умеем лучше всего",
//     services_desc: "От перманентного макияжа до дизайна ногтей — всё для вашей красоты.",
//     services_all: "Смотреть все услуги",
//     service_1: "Перманентный макияж",
//     service_1_desc: "Идеальные брови, губы и стрелки — естественно и надолго.",
//     service_2: "Наращивание ресниц",
//     service_2_desc: "Объёмные и естественные ресницы для выразительного взгляда.",
//     service_3: "Дизайн ногтей",
//     service_3_desc: "Маникюр, гель-лак и креативный дизайн — эстетика до кончиков пальцев.",
//     service_4: "Микронидлинг",
//     service_4_desc: "Омоложение кожи и стимуляция коллагена для сияющего ровного тона.",

//     why_tag: "Почему Salon Elen",
//     why_title: "Доверьтесь лучшим",
//     why_1_title: "Сертифицированные мастера",
//     why_1_desc: "Наши специалисты имеют международные сертификаты и многолетний опыт.",
//     why_2_title: "Премиум-продукция",
//     why_2_desc: "Мы работаем только с проверенными брендами и качественными материалами.",
//     why_3_title: "Стерильная безопасность",
//     why_3_desc: "Высочайшие стандарты гигиены и одноразовые материалы для вашей безопасности.",
//     why_4_title: "Индивидуальный подход",
//     why_4_desc: "Каждая процедура подбирается индивидуально — для идеального результата.",

//     gallery_tag: "Наши работы",
//     gallery_title: "Результаты, которые говорят сами за себя",
//     gallery_cta: "Смотреть галерею",

//     reviews_tag: "Отзывы",
//     reviews_title: "Что говорят наши клиенты",
//     review_1: "В полном восторге от перманентного макияжа! Естественно и идеально.",
//     review_1_author: "Анна М.",
//     review_2: "Лучший маникюр в Галле. Хожу уже 2 года регулярно.",
//     review_2_author: "Мария К.",
//     review_3: "Наращивание ресниц выглядит очень натурально. Профессиональная команда!",
//     review_3_author: "Софи Л.",

//     news_tag: "Новости",
//     news_title: "Новости и статьи",
//     news_empty: "Публикаций пока нет.",
//     news_type_ARTICLE: "Статья",
//     news_type_NEWS: "Новость",
//     news_type_PROMO: "Акция",

//     cta_title: "Готовы к преображению?",
//     cta_desc: "Запишитесь прямо сейчас — удобно онлайн, 24 часа в сутки.",
//     cta_btn: "Записаться",

//     contact_tag: "Приходите к нам",
//     contact_title: "Salon Elen в Галле",
//     contact_address: "Lessingstraße 37, 06114 Halle (Saale)",
//     contact_hours: "Пн–Пт 09:00–19:00 · Сб 09:00–16:00",
//     contact_phone: "+49 177 8995106",
//     contact_map: "Показать на карте",
//   },
// };

// /* ═══════════════════════ HELPERS ═══════════════════════ */

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
// }

// /* ── Animated counter ── */
// function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
//   const ref = useRef<HTMLSpanElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-50px" });
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     if (!isInView) return;
//     let frame: number;
//     const duration = 2000;
//     const start = performance.now();

//     const step = (now: number) => {
//       const elapsed = now - start;
//       const progress = Math.min(elapsed / duration, 1);
//       const eased = 1 - Math.pow(1 - progress, 3);
//       setCount(Math.round(eased * target));
//       if (progress < 1) frame = requestAnimationFrame(step);
//     };
//     frame = requestAnimationFrame(step);
//     return () => cancelAnimationFrame(frame);
//   }, [isInView, target]);

//   return <span ref={ref}>{count}{suffix}</span>;
// }

// /* ── Section wrapper with scroll reveal ── */
// function RevealSection({
//   children,
//   className = "",
//   delay = 0,
// }: {
//   children: React.ReactNode;
//   className?: string;
//   delay?: number;
// }) {
//   const ref = useRef<HTMLElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-80px" });

//   return (
//     <section
//       ref={ref}
//       className={`transition-all duration-700 ${className}`}
//       style={{
//         opacity: isInView ? 1 : 0,
//         transform: isInView ? "translateY(0)" : "translateY(40px)",
//         transitionDelay: `${delay}ms`,
//       }}
//     >
//       {children}
//     </section>
//   );
// }

// /* ═══════ SERVICE CONFIG ═══════ */
// const SERVICES_CFG = [
//   { icon: Eye,      grad: "from-rose-500 to-pink-600",   glow: "shadow-rose-500/30",   ring: "border-rose-400/20",  emoji: "👁️" },
//   { icon: Sparkles,  grad: "from-violet-500 to-purple-600", glow: "shadow-violet-500/30", ring: "border-violet-400/20", emoji: "✨" },
//   { icon: HandMetal, grad: "from-pink-500 to-rose-600",  glow: "shadow-pink-500/30",   ring: "border-pink-400/20",  emoji: "💅" },
//   { icon: Gem,       grad: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/30", ring: "border-emerald-400/20", emoji: "💎" },
// ];

// const WHY_CFG = [
//   { icon: Award,  color: "text-rose-500 dark:text-amber-400",    bg: "bg-rose-50 dark:bg-rose-500/10",    ring: "ring-rose-200/60 dark:ring-amber-500/20" },
//   { icon: Gem,    color: "text-violet-500 dark:text-violet-400",  bg: "bg-violet-50 dark:bg-violet-500/10", ring: "ring-violet-200/60 dark:ring-violet-500/20" },
//   { icon: Shield, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", ring: "ring-emerald-200/60 dark:ring-emerald-500/20" },
//   { icon: Heart,  color: "text-pink-500 dark:text-pink-400",      bg: "bg-pink-50 dark:bg-pink-500/10",    ring: "ring-pink-200/60 dark:ring-pink-500/20" },
// ];

// /* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

// export default function HomePage({ latest }: Props) {
//   const { locale } = useI18n();
//   const t = t_map[locale];

//   /* Hero parallax */
//   const heroRef = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({
//     target: heroRef,
//     offset: ["start start", "end start"],
//   });
//   const heroImgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
//   const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

//   return (
//     <main className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 via-white to-white dark:from-[#0a0a0f] dark:via-[#0c0c14] dark:to-[#0a0a0f]">

//       {/* ═══════════════════ HERO ═══════════════════ */}
//       <div ref={heroRef} className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden">
//         {/* Background image with parallax */}
//         <motion.div className="absolute inset-0 z-0" style={{ y: heroImgY }}>
//           {/* Desktop */}
//           <Image
//             src="/images/hero.webp"
//             alt="Salon Elen"
//             fill
//             priority
//             sizes="100vw"
//             className="hidden md:block object-cover object-[65%_40%] scale-110"
//           />
//           {/* Mobile */}
//           <Image
//             src="/images/hero-mobile.webp"
//             alt="Salon Elen"
//             fill
//             priority
//             sizes="100vw"
//             // className="md:hidden object-cover object-[50%_20%] scale-110"
//             className="md:hidden object-cover object-center scale-110"
//           />
//         </motion.div>

//         {/* Gradient overlays — mobile: bottom-heavy to keep face visible */}
//         <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/30 to-black/5 md:bg-gradient-to-r md:from-black/75 md:via-black/35 md:to-transparent" />
//         <div className="hidden md:block absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-transparent to-black/20" />

//         {/* Spotlight shimmer */}
//         <div className={`absolute inset-0 ${styles.shimmer}`} />

//         {/* Floating orbs */}
//         <div className={`absolute -left-32 top-[15%] w-[420px] h-[420px] rounded-full blur-[80px] z-[1] ${styles.orbA}`} />
//         <div className={`absolute right-[10%] top-[40%] w-[340px] h-[340px] rounded-full blur-[70px] z-[1] ${styles.orbB}`} />
//         <div className={`absolute left-[30%] bottom-[10%] w-[280px] h-[280px] rounded-full blur-[60px] z-[1] ${styles.orbC}`} />

//         {/* Film grain */}
//         <div className={`absolute inset-0 z-[3] ${styles.noise}`} />

//         {/* Decorative orb */}
//         <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-rose-500/8 blur-[120px] z-[1] pointer-events-none" />

//         {/* Content — bottom-aligned on mobile, centered on desktop */}
//         <motion.div className="relative z-10 w-full" style={{ opacity: heroOpacity }}>
//           <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-24 pt-[55svh] md:py-0">
//             <div className="max-w-2xl">
//               {/* Tag */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.2 }}
//                 className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 md:px-4 md:py-1.5 text-[11px] md:text-xs font-medium tracking-wide text-white/90 mb-4 md:mb-6"
//               >
//                 <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5 text-amber-300" />
//                 {t.hero_tag}
//               </motion.div>

//               {/* Title */}
//               <motion.h1
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.7, delay: 0.35 }}
//                 className="font-playfair text-[clamp(32px,7vw,80px)] leading-[0.95] font-light tracking-tight text-white"
//               >
//                 {t.hero_title_1}
//                 <br />
//                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200">
//                   {t.hero_title_2}
//                 </span>
//               </motion.h1>

//               {/* Description — hidden on small mobile, visible on larger */}
//               <motion.p
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.55 }}
//                 className="mt-3 md:mt-6 text-sm md:text-lg text-white/75 md:text-white/80 leading-relaxed max-w-lg font-cormorant tracking-wide line-clamp-2 md:line-clamp-none"
//               >
//                 {t.hero_desc}
//               </motion.p>

//               {/* CTAs */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.7 }}
//                 className="mt-5 md:mt-8 flex flex-wrap gap-3 md:gap-4"
//               >
//                 <RainbowCTA
//                   href={localeHref("/booking", locale)}
//                   label={t.hero_cta}
//                   className="h-11 px-6 text-sm md:h-12 md:px-8 md:text-[15px]"
//                   idle
//                 />
//                 <Link
//                   href={localeHref("/services", locale)}
//                   className="group inline-flex h-11 px-5 md:h-12 md:px-6 items-center gap-2 rounded-full border border-white/30 text-white/90 hover:bg-white/10 hover:border-white/50 transition-all duration-300 text-sm font-medium"
//                 >
//                   {t.hero_services}
//                   <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                 </Link>
//               </motion.div>

//               {/* Badge */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.6, delay: 0.9 }}
//                 className="mt-4 md:mt-6 flex items-center gap-2 text-white/50 text-xs md:text-sm"
//               >
//                 <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
//                 {t.hero_badge}
//               </motion.div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Scroll indicator — hidden on mobile */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1.5 }}
//           className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2"
//         >
//           <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
//             <motion.div
//               animate={{ y: [0, 8, 0] }}
//               transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
//               className="w-1 h-1.5 rounded-full bg-white/60"
//             />
//           </div>
//         </motion.div>
//       </div>

//       {/* ═══════════════════ STATS ═══════════════════ */}
//       <RevealSection className="relative z-10 -mt-16 sm:-mt-20 mx-auto max-w-6xl px-5 sm:px-8">
//         <div className={`relative overflow-hidden rounded-2xl ${styles.glassLine}`}>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
//           {[
//             { value: 8, suffix: "+", label: t.stats_years, icon: Award },
//             { value: 2500, suffix: "+", label: t.stats_clients, icon: Users },
//             { value: 50, suffix: "+", label: t.stats_services, icon: Scissors },
//             { value: 4.9, suffix: "", label: t.stats_rating, icon: Star, isDecimal: true },
//           ].map((stat, i) => (
//             <div
//               key={i}
//               className="relative group rounded-2xl border border-rose-200/30 bg-white/80 backdrop-blur-xl p-5 sm:p-6 text-center shadow-lg shadow-rose-100/20 hover:shadow-xl hover:shadow-rose-200/25 transition-all duration-500 hover:-translate-y-1 dark:border-white/8 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/8"
//             >
//               <stat.icon className="mx-auto h-5 w-5 text-rose-400 dark:text-amber-400 mb-3 transition-transform duration-500 group-hover:scale-110" />
//               <div className="text-3xl sm:text-4xl font-playfair font-light text-rose-900 dark:text-amber-100 tabular-nums">
//                 {stat.isDecimal ? (
//                   <span>4.9</span>
//                 ) : (
//                   <AnimatedCounter target={stat.value} suffix={stat.suffix} />
//                 )}
//               </div>
//               <div className="mt-1 text-xs sm:text-sm text-rose-700/60 dark:text-white/50 font-medium tracking-wide">
//                 {stat.label}
//               </div>
//             </div>
//           ))}
//         </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ SERVICES ═══════════════════ */}
//       <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
//         {/* ── Visible gradient mesh background ── */}
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-100/70 via-pink-50/40 to-amber-50/50 dark:from-rose-950/20 dark:via-purple-950/10 dark:to-amber-950/15" />
//           <div className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-rose-300/25 to-pink-200/20 blur-[80px] dark:from-rose-500/8 dark:to-pink-500/5 animate-pulse" style={{ animationDuration: '8s' }} />
//           <div className="absolute -bottom-32 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-amber-200/25 to-rose-200/15 blur-[90px] dark:from-amber-500/6 dark:to-rose-500/4 animate-pulse" style={{ animationDuration: '10s' }} />
//           {/* Dot grid */}
//           <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
//         </div>

//         {/* ── Decorative divider top ── */}
//         <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/40 to-transparent dark:via-amber-500/15" />

//         <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
//           <div className="text-center mb-12 sm:mb-16">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               <Sparkles className="h-3.5 w-3.5" />
//               {t.services_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.services_title}
//             </h2>
//             <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-cormorant text-lg tracking-wide">
//               {t.services_desc}
//             </p>
//           </div>

//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//             {SERVICES_CFG.map((cfg, i) => {
//               const n = i + 1;
//               const IconComp = cfg.icon;
//               return (
//                 <Link
//                   key={n}
//                   href={localeHref("/services", locale)}
//                   className="group relative rounded-2xl border border-rose-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg shadow-rose-100/20 hover:shadow-xl hover:shadow-rose-200/30 transition-all duration-500 hover:-translate-y-3 dark:border-white/8 dark:bg-white/[0.05] dark:shadow-none dark:hover:bg-white/[0.08] dark:hover:border-white/12 overflow-hidden"
//                 >
//                   {/* Card inner glow on hover */}
//                   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-rose-100/40 via-transparent to-pink-100/30 dark:from-amber-500/5 dark:to-purple-500/5 pointer-events-none" />

//                   {/* ── Animated icon container ── */}
//                   <div className="relative mb-5">
//                     {/* Outer pulse ring */}
//                     <div className={`absolute -inset-2 rounded-2xl border ${cfg.ring} opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110 group-hover:animate-ping`} style={{ animationDuration: '2s', animationIterationCount: '1' }} />
//                     {/* Glow backdrop */}
//                     <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${cfg.grad} blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
//                     {/* Icon box */}
//                     <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${cfg.grad} ${cfg.glow} shadow-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
//                       <IconComp className="h-6 w-6 text-white drop-shadow-sm" />
//                     </div>
//                   </div>

//                   <h3 className="relative font-semibold text-gray-900 dark:text-white mb-2 text-[15px]">
//                     {t[`service_${n}`]}
//                   </h3>
//                   <p className="relative text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
//                     {t[`service_${n}_desc`]}
//                   </p>
//                   <div className="relative mt-4 inline-flex items-center gap-1.5 text-rose-600 dark:text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
//                     <span>{t.hero_services === "Alle Leistungen" ? "Mehr" : t.hero_services === "All services" ? "More" : "Ещё"}</span>
//                     <ArrowRight className="h-3.5 w-3.5" />
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>

//           <div className="text-center mt-10">
//             <Link
//               href={localeHref("/services", locale)}
//               className="group inline-flex items-center gap-2 rounded-full border border-rose-200/50 bg-white/70 backdrop-blur-sm px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100/80 hover:border-rose-300/60 hover:shadow-md transition-all duration-300 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300 dark:hover:bg-amber-500/10"
//             >
//               {t.services_all}
//               <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//             </Link>
//           </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ WHY US ═══════════════════ */}
//       <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
//         {/* ── Gradient mesh background ── */}
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-tl from-pink-50/60 via-rose-50/30 to-amber-50/40 dark:from-purple-950/15 dark:via-slate-950/5 dark:to-amber-950/10" />
//           <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-l from-violet-200/20 to-pink-200/15 blur-[80px] dark:from-violet-500/6 dark:to-pink-500/4 animate-pulse" style={{ animationDuration: '12s' }} />
//           <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-rose-200/20 to-amber-200/15 blur-[70px] dark:from-rose-500/5 dark:to-amber-500/4 animate-pulse" style={{ animationDuration: '9s' }} />
//           {/* Cross-hatch pattern */}
//           <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(45deg, currentColor 1px, transparent 1px), linear-gradient(-45deg, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
//         </div>

//         {/* Top divider */}
//         <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/30 to-transparent dark:via-amber-500/10" />

//         <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
//           <div className="text-center mb-12 sm:mb-16">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               <Shield className="h-3.5 w-3.5" />
//               {t.why_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.why_title}
//             </h2>
//           </div>

//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//             {WHY_CFG.map((cfg, i) => {
//               const key = String(i + 1);
//               const IconComp = cfg.icon;
//               return (
//                 <div
//                   key={i}
//                   className="group text-center p-6 rounded-2xl border border-rose-100/30 bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:border-rose-200/50 hover:shadow-lg hover:shadow-rose-100/20 dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:border-white/10 transition-all duration-500 hover:-translate-y-1"
//                 >
//                   {/* ── Animated icon with rings ── */}
//                   <div className="relative mx-auto w-20 h-20 mb-5">
//                     {/* Outer animated ring */}
//                     <div className={`absolute inset-0 rounded-full ring-2 ${cfg.ring} opacity-40 group-hover:opacity-80 group-hover:scale-125 transition-all duration-700`} />
//                     {/* Middle ring - counter-rotate on hover */}
//                     <div className={`absolute inset-1.5 rounded-full ring-1 ${cfg.ring} opacity-20 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500 delay-75`} />
//                     {/* Icon circle */}
//                     <div className={`absolute inset-3 rounded-full ${cfg.bg} flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg`}>
//                       <IconComp className={`h-7 w-7 ${cfg.color} transition-transform duration-500 group-hover:scale-110`} />
//                     </div>
//                   </div>

//                   <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
//                     {t[`why_${key}_title`]}
//                   </h3>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
//                     {t[`why_${key}_desc`]}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Bottom divider */}
//         <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/30 to-transparent dark:via-amber-500/10" />
//       </RevealSection>

//       {/* ═══════════════════ GALLERY PREVIEW ═══════════════════ */}
//       <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
//         {/* ── Background ── */}
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-b from-rose-50/40 via-white/80 to-pink-50/30 dark:from-purple-950/10 dark:via-slate-950/5 dark:to-amber-950/8" />
//           <div className="absolute left-[5%] top-[20%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-sky-200/15 to-violet-200/10 blur-[80px] dark:from-sky-500/5 dark:to-violet-500/3 animate-pulse" style={{ animationDuration: '11s' }} />
//         </div>

//         <div className="relative">
//           <div className="text-center mb-10 px-5">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               <Images className="h-3.5 w-3.5" />
//               {t.gallery_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.gallery_title}
//             </h2>
//           </div>

//           {/* Horizontal scroll strip */}
//           <div className="relative overflow-hidden">
//             <div className="flex gap-3 animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused] w-max">
//               {[
//                 "/images/services/haircut.webp",
//                 "/images/services/makeup.webp",
//                 "/images/services/manicure.webp",
//                 "/images/hero.webp",
//                 "/images/services/haircut.webp",
//                 "/images/services/makeup.webp",
//                 "/images/services/manicure.webp",
//                 "/images/hero.webp",
//               ].map((src, i) => (
//                 <div
//                   key={i}
//                   className="relative w-[260px] sm:w-[320px] aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 group shadow-lg shadow-rose-100/10 dark:shadow-none"
//                 >
//                   <Image
//                     src={src}
//                     alt={`Gallery ${i + 1}`}
//                     fill
//                     loading="lazy"
//                     sizes="320px"
//                     className="object-cover transition-transform duration-700 group-hover:scale-110"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                   <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
//                     Salon Elen
//                   </div>
//                 </div>
//               ))}
//             </div>
//             {/* Edge fades */}
//             <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-rose-50/80 dark:from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
//             <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
//           </div>

//           <div className="text-center mt-8">
//             <Link
//               href={localeHref("/gallerie", locale)}
//               className="group inline-flex items-center gap-2 rounded-full border border-rose-200/50 bg-white/70 backdrop-blur-sm px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100/80 hover:shadow-md transition-all duration-300 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300 dark:hover:bg-amber-500/10"
//             >
//               {t.gallery_cta}
//               <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//             </Link>
//           </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ REVIEWS ═══════════════════ */}
//       <RevealSection className="relative z-10 pt-20 sm:pt-28 pb-16">
//         {/* ── Background ── */}
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-tr from-amber-50/40 via-rose-50/30 to-pink-50/50 dark:from-amber-950/10 dark:via-purple-950/8 dark:to-rose-950/10" />
//           <div className="absolute -left-20 top-[30%] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-pink-200/20 to-rose-200/15 blur-[80px] dark:from-pink-500/5 dark:to-rose-500/4 animate-pulse" style={{ animationDuration: '10s' }} />
//           <div className="absolute right-[5%] top-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-l from-amber-200/20 to-orange-200/15 blur-[70px] dark:from-amber-500/5 dark:to-orange-500/4 animate-pulse" style={{ animationDuration: '13s' }} />
//           {/* Dot grid */}
//           <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
//         </div>

//         {/* Top divider */}
//         <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300/30 to-transparent dark:via-amber-500/10" />

//         <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
//           <div className="text-center mb-12">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               <Star className="h-3.5 w-3.5" />
//               {t.reviews_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.reviews_title}
//             </h2>
//           </div>

//           <div className="grid gap-5 md:grid-cols-3">
//             {[1, 2, 3].map((n) => (
//               <div
//                 key={n}
//                 className="group relative rounded-2xl border border-rose-200/40 bg-white/80 backdrop-blur-md p-6 shadow-lg shadow-rose-100/15 hover:shadow-xl hover:shadow-rose-200/25 hover:-translate-y-2 transition-all duration-500 dark:border-white/8 dark:bg-white/[0.05] dark:shadow-none dark:hover:bg-white/[0.08] overflow-hidden"
//               >
//                 {/* Card glow on hover */}
//                 <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-amber-50/40 via-transparent to-rose-50/30 dark:from-amber-500/3 dark:to-rose-500/3 pointer-events-none" />

//                 {/* Quote icon with glow */}
//                 <div className="relative">
//                   <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-rose-200/30 to-amber-200/20 blur-md opacity-50 dark:from-amber-500/10 dark:to-rose-500/5" />
//                   <Quote className="relative h-8 w-8 text-rose-300 dark:text-amber-500/30 mb-3" />
//                 </div>

//                 <div className="relative flex gap-0.5 mb-3">
//                   {Array.from({ length: 5 }).map((_, i) => (
//                     <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
//                   ))}
//                 </div>
//                 <p className="relative text-gray-700 dark:text-gray-300 leading-relaxed font-cormorant text-base tracking-wide">
//                   &ldquo;{t[`review_${n}`]}&rdquo;
//                 </p>
//                 <div className="relative mt-4 pt-4 border-t border-rose-100/40 dark:border-white/5">
//                   <span className="text-sm font-semibold text-gray-900 dark:text-white">
//                     {t[`review_${n}_author`]}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ NEWS ═══════════════════ */}
//       {latest.length > 0 && (
//         <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-24 sm:pt-32">
//           <div className="text-center mb-12">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               {t.news_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.news_title}
//             </h2>
//           </div>

//           <div className="grid gap-5 md:grid-cols-3">
//             {latest.map((item) => (
//               <Link
//                 key={item.id}
//                 href={`/news/${item.slug}`}
//                 className="group block rounded-2xl border border-rose-100/50 bg-white/70 backdrop-blur-sm overflow-hidden shadow-md shadow-rose-100/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 dark:border-white/6 dark:bg-white/[0.03] dark:shadow-none dark:hover:bg-white/[0.05]"
//               >
//                 <div className="relative aspect-[16/10] overflow-hidden bg-rose-50 dark:bg-white/5">
//                   {item.cover ? (
//                     <Image
//                       src={item.cover}
//                       alt={item.title}
//                       fill
//                       loading="lazy"
//                       sizes="(max-width: 768px) 100vw, 33vw"
//                       className="object-cover transition-transform duration-700 group-hover:scale-105"
//                     />
//                   ) : (
//                     <div className="flex h-full w-full items-center justify-center text-rose-300 dark:text-white/10">
//                       <Sparkles className="h-8 w-8" />
//                     </div>
//                   )}
//                 </div>
//                 <div className="p-5">
//                   <div className="text-xs uppercase tracking-wider text-rose-500 dark:text-amber-400 font-semibold mb-2">
//                     {t[`news_type_${item.type}`]}
//                   </div>
//                   <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-amber-300 transition-colors leading-snug">
//                     {item.title}
//                   </h3>
//                   {item.excerpt && (
//                     <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
//                       {item.excerpt}
//                     </p>
//                   )}
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </RevealSection>
//       )}

//       {/* ═══════════════════ CTA ═══════════════════ */}
//       <RevealSection className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-24 sm:pt-32 pb-12">
//         <div className={`relative overflow-hidden rounded-3xl ${styles.glassLine}`}>
//           {/* Gradient background */}
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-500 to-amber-500 dark:from-amber-600 dark:via-amber-500 dark:to-orange-500" />
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
//           <div className={`absolute inset-0 ${styles.ctaGlow}`} />

//           <div className="relative z-10 px-6 sm:px-12 py-14 sm:py-16 text-center">
//             <Sparkles className="mx-auto h-8 w-8 text-white/60 mb-4" />
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
//               {t.cta_title}
//             </h2>
//             <p className="mt-4 text-white/80 max-w-md mx-auto font-cormorant text-lg tracking-wide">
//               {t.cta_desc}
//             </p>
//             <div className="mt-8">
//               <Link
//                 href={localeHref("/booking", locale)}
//                 className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-rose-700 dark:text-amber-800 font-semibold text-sm shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
//               >
//                 {t.cta_btn}
//                 <ArrowRight className="h-4 w-4" />
//               </Link>
//             </div>
//           </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ CONTACT STRIP ═══════════════════ */}
//       <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pb-20">
//         <div className="text-center mb-10">
//           <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//             <MapPin className="h-3.5 w-3.5" />
//             {t.contact_tag}
//           </span>
//           <h2 className="font-playfair text-3xl sm:text-4xl font-light tracking-tight text-gray-900 dark:text-white">
//             {t.contact_title}
//           </h2>
//         </div>

//         <div className="grid gap-4 sm:grid-cols-3">
//           {[
//             { icon: MapPin, text: t.contact_address, color: "text-rose-500 dark:text-amber-400" },
//             { icon: Clock, text: t.contact_hours, color: "text-emerald-500 dark:text-emerald-400" },
//             { icon: Phone, text: t.contact_phone, color: "text-sky-500 dark:text-sky-400" },
//           ].map((item, i) => (
//             <div
//               key={i}
//               className="flex items-center gap-4 rounded-2xl border border-rose-100/50 bg-white/70 backdrop-blur-sm p-5 dark:border-white/6 dark:bg-white/[0.03]"
//             >
//               <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-50 dark:bg-white/5 flex items-center justify-center">
//                 <item.icon className={`h-5 w-5 ${item.color}`} />
//               </div>
//               <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
//                 {item.text}
//               </span>
//             </div>
//           ))}
//         </div>

//         <div className="text-center mt-8">
//           <Link
//             href={localeHref("/contacts", locale)}
//             className="group inline-flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-amber-400 hover:text-rose-700 dark:hover:text-amber-300 transition-colors"
//           >
//             {t.contact_map}
//             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//           </Link>
//         </div>
//       </RevealSection>

//       {/* CSS keyframes for gallery scroll */}
//       <style jsx global>{`
//         @keyframes scroll {
//           0% { transform: translateX(0); }
//           100% { transform: translateX(-50%); }
//         }
//       `}</style>
//     </main>
//   );
// }




// // src/components/home-page.tsx
// "use client";

// import type { ReactNode } from "react";
// import { useMemo, useRef, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, useInView } from "framer-motion";
// import {
//   Sparkles,
//   ShieldCheck,
//   Award,
//   Stars,
//   ArrowUpRight,
//   Calendar,
//   MapPin,
//   Phone,
//   Quote,
//   BadgeCheck,
// } from "lucide-react";
// import type { Locale } from "@/i18n/locales";

// import styles from "./home-page.module.css";

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// type Props = {
//   latest: ArticleItem[];
//   locale: Locale;
// };

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
// }

// const copy: Record<Locale, Record<string, string>> = {
//   de: {
//     hero_tag: "Beauty Studio in Halle",
//     hero_title_a: "Natürlich schön.",
//     hero_title_b: "Präzise & modern.",
//     hero_desc:
//       "Permanent Make-up, Wimpern, Nägel & Skin-Treatments — mit ruhiger Beratung, Premium-Materialien und einem Ergebnis, das zu Ihnen passt.",
//     hero_cta_primary: "Termin buchen",
//     hero_cta_secondary: "Leistungen ansehen",
//     hero_chip_1: "Online-Termin 24/7",
//     hero_chip_2: "Hygiene & Sicherheit",
//     hero_chip_3: "Zertifizierte Expertise",

//     trust_title: "Warum Kundinnen uns vertrauen",
//     trust_1: "Zertifizierte Behandlungen",
//     trust_2: "Sterile Standards",
//     trust_3: "Premium-Brands",
//     trust_4: "Individuelle Beratung",

//     services_kicker: "Leistungen",
//     services_title: "Highlights für Ihre Schönheit",
//     services_desc:
//       "Ausgewählte Treatments — präzise, sauber und mit Blick auf natürliche Ergebnisse.",
//     s1: "Permanent Make-up",
//     s1d: "Brow/Lip/Liner — natürlich, harmonisch, langlebig.",
//     s2: "Wimpernverlängerung",
//     s2d: "Von dezent bis voluminös — perfekt abgestimmt.",
//     s3: "Nageldesign",
//     s3d: "Maniküre, Gel-Systeme & elegante Designs.",
//     s4: "Microneedling",
//     s4d: "Glow, Struktur & Frische — sichtbar verfeinert.",
//     services_cta: "Alle Leistungen",

//     proof_kicker: "Qualität",
//     proof_title: "Ihr Ergebnis ist planbar",
//     proof_desc:
//       "Wir arbeiten strukturiert: Beratung → Empfehlung → sorgfältige Umsetzung. Transparent, ruhig und ohne Überraschungen.",
//     proof_point_1: "Klare Beratung & realistische Erwartungen",
//     proof_point_2: "Sanfte, moderne Techniken",
//     proof_point_3: "Hochwertige Materialien",

//     reviews_kicker: "Bewertungen",
//     reviews_title: "Kundenstimmen",
//     r1: "„Sehr professionell — Ergebnis sieht super natürlich aus. Ich komme wieder!“",
//     r2: "„Sauber, freundlich, extrem genau. Bester Salon in Halle.“",
//     r3: "„Top Beratung und ein perfektes Ergebnis. Absolute Empfehlung!“",

//     news_kicker: "Aktuelles",
//     news_title: "News & Artikel",
//     news_empty: "Noch keine Beiträge.",

//     cta_title: "Bereit für Ihren Termin?",
//     cta_text: "Kostenlose Beratung & Online-Buchung. Wir freuen uns auf Sie.",
//     cta_btn: "Jetzt buchen",

//     visit_kicker: "Besuchen Sie uns",
//     visit_title: "Salon Elen — Halle (Saale)",
//     visit_addr: "Lessingstraße 37, 06114 Halle (Saale)",
//     visit_phone: "+49 177 899 51 06",
//     visit_map: "Route öffnen",
//   },
//   en: {
//     hero_tag: "Beauty Studio in Halle",
//     hero_title_a: "Naturally beautiful.",
//     hero_title_b: "Precise & modern.",
//     hero_desc:
//       "Permanent make-up, lashes, nails & skin treatments — calm consultation, premium materials, and results that fit you.",
//     hero_cta_primary: "Book now",
//     hero_cta_secondary: "View services",
//     hero_chip_1: "Online booking 24/7",
//     hero_chip_2: "Hygiene & safety",
//     hero_chip_3: "Certified expertise",

//     trust_title: "Why clients trust us",
//     trust_1: "Certified treatments",
//     trust_2: "Sterile standards",
//     trust_3: "Premium brands",
//     trust_4: "Personal consultation",

//     services_kicker: "Services",
//     services_title: "Highlights for your beauty",
//     services_desc:
//       "Selected treatments — precise, clean and focused on natural results.",
//     s1: "Permanent Make-up",
//     s1d: "Brows/Lips/Liner — natural, balanced, long-lasting.",
//     s2: "Lash Extensions",
//     s2d: "From subtle to volume — tailored to you.",
//     s3: "Nail Design",
//     s3d: "Manicure, gel systems & elegant designs.",
//     s4: "Microneedling",
//     s4d: "Glow, texture & freshness — visibly refined.",
//     services_cta: "All services",

//     proof_kicker: "Quality",
//     proof_title: "A predictable result",
//     proof_desc:
//       "A clear process: consultation → recommendation → careful execution. Transparent, calm and professional.",
//     proof_point_1: "Clear consultation & realistic expectations",
//     proof_point_2: "Gentle modern techniques",
//     proof_point_3: "High-quality materials",

//     reviews_kicker: "Reviews",
//     reviews_title: "What clients say",
//     r1: "“Very professional — looks super natural. I’ll be back!”",
//     r2: "“Clean, friendly, extremely precise. Best salon in Halle.”",
//     r3: "“Great consultation and perfect result. Highly recommended!”",

//     news_kicker: "Latest",
//     news_title: "News & Articles",
//     news_empty: "No posts yet.",

//     cta_title: "Ready for your appointment?",
//     cta_text: "Free consultation & online booking. We’ll be happy to see you.",
//     cta_btn: "Book now",

//     visit_kicker: "Visit us",
//     visit_title: "Salon Elen — Halle (Saale)",
//     visit_addr: "Lessingstraße 37, 06114 Halle (Saale)",
//     visit_phone: "+49 177 899 51 06",
//     visit_map: "Open route",
//   },
//   ru: {
//     hero_tag: "Салон красоты в Halle",
//     hero_title_a: "Естественная красота.",
//     hero_title_b: "Точно и современно.",
//     hero_desc:
//       "Перманентный макияж, ресницы, ногти и уходовые процедуры — спокойная консультация, премиальные материалы и результат, который подходит именно вам.",
//     hero_cta_primary: "Записаться",
//     hero_cta_secondary: "Посмотреть услуги",
//     hero_chip_1: "Онлайн-запись 24/7",
//     hero_chip_2: "Гигиена и безопасность",
//     hero_chip_3: "Сертифицированный мастер",

//     trust_title: "Почему нам доверяют",
//     trust_1: "Сертифицированные процедуры",
//     trust_2: "Стерильные стандарты",
//     trust_3: "Премиальные бренды",
//     trust_4: "Индивидуальная консультация",

//     services_kicker: "Услуги",
//     services_title: "Хиты салона",
//     services_desc:
//       "Отобранные процедуры — аккуратно, чисто, с акцентом на естественный результат.",
//     s1: "Перманентный макияж",
//     s1d: "Брови/губы/стрелки — гармонично и надолго.",
//     s2: "Наращивание ресниц",
//     s2d: "От натурального до объёма — под ваш стиль.",
//     s3: "Дизайн ногтей",
//     s3d: "Маникюр, гель-системы и элегантный дизайн.",
//     s4: "Микронидлинг",
//     s4d: "Сияние, рельеф и свежесть — заметно лучше.",
//     services_cta: "Все услуги",

//     proof_kicker: "Качество",
//     proof_title: "Результат — предсказуемый",
//     proof_desc:
//       "Понятный процесс: консультация → рекомендация → аккуратное выполнение. Спокойно, прозрачно и профессионально.",
//     proof_point_1: "Чёткая консультация без «волшебства»",
//     proof_point_2: "Современные мягкие техники",
//     proof_point_3: "Качественные материалы",

//     reviews_kicker: "Отзывы",
//     reviews_title: "Что говорят клиенты",
//     r1: "«Очень профессионально — выглядит супер естественно. Вернусь ещё!»",
//     r2: "«Чисто, доброжелательно и очень точно. Лучший салон в Halle.»",
//     r3: "«Отличная консультация и идеальный результат. Рекомендую!»",

//     news_kicker: "Новости",
//     news_title: "Новости и статьи",
//     news_empty: "Публикаций пока нет.",

//     cta_title: "Готовы записаться?",
//     cta_text: "Бесплатная консультация и онлайн-запись. Будем рады вам.",
//     cta_btn: "Записаться",

//     visit_kicker: "Как нас найти",
//     visit_title: "Salon Elen — Halle (Saale)",
//     visit_addr: "Lessingstraße 37, 06114 Halle (Saale)",
//     visit_phone: "+49 177 899 51 06",
//     visit_map: "Открыть маршрут",
//   },
// };

// function Reveal({
//   children,
//   delay = 0,
//   className = "",
// }: {
//   children: ReactNode;
//   delay?: number;
//   className?: string;
// }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { once: true, margin: "-90px" });
//   return (
//     <div
//       ref={ref}
//       className={className}
//       style={{
//         opacity: inView ? 1 : 0,
//         transform: inView ? "translateY(0px)" : "translateY(22px)",
//         transition: `all 700ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
//       }}
//     >
//       {children}
//     </div>
//   );
// }

// export default function HomePage({ latest, locale }: Props) {
//   const t = useMemo(() => copy[locale], [locale]);

//   const mapsUrl = useMemo(() => {
//     const q = encodeURIComponent("Lessingstraße 37, 06114 Halle (Saale)");
//     return `https://www.google.com/maps/search/?api=1&query=${q}`;
//   }, []);

//   const [lightbox, setLightbox] = useState<string | null>(null);

//   // Заменишь на реальные фото позже (public/images/before-after/*)
//   const beforeAfter = useMemo(
//     () => [
//       { before: "/images/cta.jpg", after: "/images/hero.webp", label: "Brow / PMU" },
//       { before: "/images/cta.jpg", after: "/images/hero.webp", label: "Lashes" },
//       { before: "/images/cta.jpg", after: "/images/hero.webp", label: "Nails" },
//     ],
//     [],
//   );

//   const brandLoop = useMemo(
//     () => ["LCN", "Monteil Paris", "CNI International", "Permanent Make-up", "Microneedling", "Lashes", "Nails"],
//     [],
//   );

//   return (
//     <main className="relative overflow-hidden bg-gradient-to-b from-rose-50/60 via-white to-white dark:from-[#07070b] dark:via-[#0b0b12] dark:to-[#07070b]">
//       {/* Background FX */}
//       <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div
//           className={[
//             "absolute -top-28 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full blur-3xl",
//             styles.orbA,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-32 -left-28 h-[560px] w-[560px] rounded-full blur-3xl",
//             styles.orbB,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-40 right-[-120px] h-[720px] w-[720px] rounded-full blur-3xl",
//             styles.orbC,
//           ].join(" ")}
//         />
//         <div className={["absolute inset-0", styles.noise].join(" ")} />
//       </div>

//       {/* HERO */}
//       <section className="relative">
//         <div className="relative min-h-[92svh] overflow-hidden">
//           <div className="absolute inset-0">
//             <Image
//               src="/images/hero.webp"
//               alt="Salon Elen"
//               fill
//               priority
//               sizes="100vw"
//               className="hidden md:block object-cover object-[65%_40%] scale-110"
//             />
//             <Image
//               src="/images/hero-mobile.webp"
//               alt="Salon Elen"
//               fill
//               priority
//               sizes="100vw"
//               className="md:hidden object-cover object-center scale-110"
//             />
//             <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent md:from-black/75 md:via-black/35" />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
//             {/* прожектор / shimmer */}
//             <div className={["absolute inset-0", styles.shimmer].join(" ")} />
//           </div>

//           <div className="relative z-10">
//             <div className="mx-auto max-w-7xl px-5 pt-20 pb-10 sm:px-8 sm:pt-24 md:pt-32">
//               <div className="max-w-2xl">
//                 <motion.div
//                   initial={{ opacity: 0, y: 12 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6 }}
//                   className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-extrabold tracking-wide text-white shadow-soft backdrop-blur"
//                 >
//                   <Sparkles className="h-4 w-4 text-amber-300" />
//                   {t.hero_tag}
//                 </motion.div>

//                 <motion.h1
//                   initial={{ opacity: 0, y: 16 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.75, delay: 0.1 }}
//                   className="mt-6 font-playfair text-[clamp(42px,7vw,84px)] font-light leading-[0.95] tracking-tight text-white"
//                 >
//                   {t.hero_title_a}
//                   <br />
//                   <span className="bg-gradient-to-r from-rose-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
//                     {t.hero_title_b}
//                   </span>
//                 </motion.h1>

//                 <motion.p
//                   initial={{ opacity: 0, y: 14 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.7, delay: 0.22 }}
//                   className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base"
//                 >
//                   {t.hero_desc}
//                 </motion.p>

//                 <motion.div
//                   initial={{ opacity: 0, y: 12 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.7, delay: 0.33 }}
//                   className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
//                 >
//                   <Link
//                     href={localeHref("/booking", locale)}
//                     className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-gray-950 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md sm:w-auto"
//                   >
//                     <Calendar className="h-4 w-4" />
//                     {t.hero_cta_primary}
//                     <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
//                   </Link>

//                   <Link
//                     href={localeHref("/services", locale)}
//                     className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-md sm:w-auto"
//                   >
//                     {t.hero_cta_secondary}
//                     <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
//                   </Link>
//                 </motion.div>

//                 <motion.div
//                   initial={{ opacity: 0, y: 12 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.7, delay: 0.44 }}
//                   className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
//                 >
//                   {[
//                     { icon: BadgeCheck, text: t.hero_chip_1 },
//                     { icon: ShieldCheck, text: t.hero_chip_2 },
//                     { icon: Award, text: t.hero_chip_3 },
//                   ].map(({ icon: Icon, text }) => (
//                     <span
//                       key={text}
//                       className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 backdrop-blur"
//                     >
//                       <Icon className="h-4 w-4 text-amber-200" />
//                       {text}
//                     </span>
//                   ))}
//                 </motion.div>
//               </div>
//             </div>

//             {/* trust strip (glass + light line) */}
//             <div className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
//               <div
//                 className={[
//                   "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-soft backdrop-blur",
//                   styles.glassLine,
//                 ].join(" ")}
//               >
//                 <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
//                   <div className="flex items-center gap-3">
//                     <ShieldCheck className="h-5 w-5 text-amber-200" />
//                     <div className="text-sm font-semibold text-white/90">{t.trust_1}</div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Stars className="h-5 w-5 text-amber-200" />
//                     <div className="text-sm font-semibold text-white/90">{t.trust_2}</div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Award className="h-5 w-5 text-amber-200" />
//                     <div className="text-sm font-semibold text-white/90">{t.trust_3}</div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Sparkles className="h-5 w-5 text-amber-200" />
//                     <div className="text-sm font-semibold text-white/90">{t.trust_4}</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* BRANDS MARQUEE */}
//       <section className="relative py-8 sm:py-10">
//         <div className="mx-auto max-w-7xl px-5 sm:px-8">
//           <Reveal>
//             <div className="flex items-center justify-between gap-4">
//               <div className="text-sm font-extrabold text-gray-950/80 dark:text-white/80">
//                 {locale === "de"
//                   ? "Wir arbeiten mit Premium-Brands"
//                   : locale === "en"
//                   ? "We use premium brands"
//                   : "Работаем на премиальных брендах"}
//               </div>
//               <div className="text-xs font-bold text-gray-950/60 dark:text-white/60">
//                 {locale === "de"
//                   ? "Qualität • Hygiene • Ergebnis"
//                   : locale === "en"
//                   ? "Quality • Hygiene • Result"
//                   : "Качество • Гигиена • Результат"}
//               </div>
//             </div>
//           </Reveal>

//           <div
//             className={[
//               "relative mt-4 overflow-hidden rounded-3xl border border-gray-900/10 bg-white/70 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/55",
//               styles.marqueeFrame,
//             ].join(" ")}
//           >
//             <div className={styles.marqueeTrack}>
//               {brandLoop.map((b) => (
//                 <div key={`a-${b}`} className={styles.brandPill}>
//                   {b}
//                 </div>
//               ))}
//               {brandLoop.map((b) => (
//                 <div key={`b-${b}`} className={styles.brandPill}>
//                   {b}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* SERVICES */}
//       <section className="relative py-12 sm:py-16">
//         <div className="mx-auto max-w-7xl px-5 sm:px-8">
//           <Reveal>
//             <div className="flex flex-col gap-3">
//               <p className="inline-flex items-center gap-2 self-start rounded-full border border-gray-900/10 bg-white/80 px-3 py-1 text-xs font-extrabold tracking-wide text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-white">
//                 <Sparkles className="h-4 w-4 text-gold-600" />
//                 {t.services_kicker}
//               </p>
//               <h2 className="text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
//                 {t.services_title}
//               </h2>
//               <p className="max-w-2xl text-sm text-gray-900/70 dark:text-gray-300">
//                 {t.services_desc}
//               </p>
//             </div>
//           </Reveal>

//           <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             {[
//               { title: t.s1, text: t.s1d },
//               { title: t.s2, text: t.s2d },
//               { title: t.s3, text: t.s3d },
//               { title: t.s4, text: t.s4d },
//             ].map((card, i) => (
//               <Reveal key={card.title} delay={80 * i}>
//                 <div
//                   className={[
//                     "group relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 p-5 shadow-soft backdrop-blur transition dark:border-white/10 dark:bg-gray-900/60",
//                     styles.cardHover,
//                   ].join(" ")}
//                 >
//                   <div
//                     className={[
//                       "absolute inset-0 opacity-0 transition group-hover:opacity-100",
//                       styles.cardGlow,
//                     ].join(" ")}
//                   />
//                   <div className="relative">
//                     <div className="text-sm font-extrabold text-gray-950 dark:text-white">
//                       {card.title}
//                     </div>
//                     <p className="mt-2 text-sm leading-relaxed text-gray-900/70 dark:text-gray-300">
//                       {card.text}
//                     </p>
//                     <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-gray-950/70 dark:text-white/70">
//                       <span className="h-2 w-2 rounded-full bg-gold-500" />
//                       {t.trust_title}
//                     </div>
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>

//           <Reveal delay={120} className="mt-7">
//             <Link
//               href={localeHref("/services", locale)}
//               className="group inline-flex items-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-5 py-3 text-sm font-extrabold text-gray-950 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white"
//             >
//               {t.services_cta}
//               <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
//             </Link>
//           </Reveal>
//         </div>
//       </section>

//       {/* QUALITY / PROCESS */}
//       <section className="relative pb-12 sm:pb-16">
//         <div className="mx-auto max-w-7xl px-5 sm:px-8">
//           <div className="grid gap-6 lg:grid-cols-2">
//             <Reveal>
//               <div
//                 className={[
//                   "relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 sm:p-8",
//                   styles.cardHover,
//                 ].join(" ")}
//               >
//                 <div className={["absolute inset-0", styles.processGlow].join(" ")} />
//                 <div className="relative">
//                   <p className="inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-white/75 px-3 py-1 text-xs font-extrabold tracking-wide text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-white">
//                     <ShieldCheck className="h-4 w-4 text-gold-600" />
//                     {t.proof_kicker}
//                   </p>
//                   <h3 className="mt-4 text-xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-2xl">
//                     {t.proof_title}
//                   </h3>
//                   <p className="mt-2 text-sm text-gray-900/70 dark:text-gray-300">
//                     {t.proof_desc}
//                   </p>

//                   <div className="mt-6 space-y-3">
//                     {[t.proof_point_1, t.proof_point_2, t.proof_point_3].map((x) => (
//                       <div key={x} className="flex items-start gap-3">
//                         <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold-500" />
//                         <div className="text-sm font-semibold text-gray-950 dark:text-white">{x}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </Reveal>

//             <Reveal delay={120}>
//               <div
//                 className={[
//                   "relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60",
//                   styles.cardHover,
//                 ].join(" ")}
//               >
//                 <div className="relative aspect-[16/10] w-full">
//                   <Image
//                     src="/images/cta.jpg"
//                     alt="Salon Elen"
//                     fill
//                     className="object-cover"
//                     sizes="(max-width: 1024px) 100vw, 50vw"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
//                 </div>
//                 <div className="p-6 sm:p-8">
//                   <div className="text-xs font-extrabold uppercase tracking-widest text-gray-900/70 dark:text-white/70">
//                     Salon Elen
//                   </div>
//                   <div className="mt-2 text-xl font-extrabold text-gray-950 dark:text-white">
//                     Permanent • Lashes • Nails • Skin
//                   </div>
//                   <p className="mt-2 text-sm text-gray-900/70 dark:text-gray-300">
//                     {locale === "de"
//                       ? "Ein ruhiger Ort für Schönheit — mit Präzision und Stil."
//                       : locale === "en"
//                       ? "A calm place for beauty — with precision and style."
//                       : "Спокойное место для красоты — точно и со вкусом."}
//                   </p>
//                 </div>
//               </div>
//             </Reveal>
//           </div>
//         </div>
//       </section>

//       {/* REVIEWS */}
//       <section className="relative pb-12 sm:pb-16">
//         <div className="mx-auto max-w-7xl px-5 sm:px-8">
//           <Reveal>
//             <div className="flex items-end justify-between gap-4">
//               <div>
//                 <p className="inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-white/80 px-3 py-1 text-xs font-extrabold tracking-wide text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-white">
//                   <Quote className="h-4 w-4 text-gold-600" />
//                   {t.reviews_kicker}
//                 </p>
//                 <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
//                   {t.reviews_title}
//                 </h2>
//               </div>
//             </div>
//           </Reveal>

//           <div className="mt-7 grid gap-4 lg:grid-cols-3">
//             {[t.r1, t.r2, t.r3].map((text, i) => (
//               <Reveal key={text} delay={80 * i}>
//                 <div
//                   className={[
//                     "relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60",
//                     styles.cardHover,
//                   ].join(" ")}
//                 >
//                   <div className="flex items-center gap-2 text-xs font-bold text-gray-950/70 dark:text-white/70">
//                     <Stars className="h-4 w-4 text-gold-600" />
//                     5.0
//                   </div>
//                   <p className="mt-3 text-sm leading-relaxed text-gray-900/75 dark:text-gray-300">
//                     {text}
//                   </p>
//                   <div className="mt-4 flex items-center gap-2 text-xs font-extrabold text-gray-950 dark:text-white">
//                     <BadgeCheck className="h-4 w-4 text-gold-600" />
//                     {locale === "de"
//                       ? "Verifizierte Bewertung"
//                       : locale === "en"
//                       ? "Verified review"
//                       : "Проверенный отзыв"}
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* BEFORE / AFTER */}
//       <section className="relative pb-12 sm:pb-16">
//         <div className="mx-auto max-w-7xl px-5 sm:px-8">
//           <Reveal>
//             <p className="inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-white/80 px-3 py-1 text-xs font-extrabold tracking-wide text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-white">
//               <Sparkles className="h-4 w-4 text-gold-600" />
//               {locale === "de" ? "Vorher / Nachher" : locale === "en" ? "Before / After" : "До / После"}
//             </p>
//             <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
//               {locale === "de" ? "Echte Ergebnisse" : locale === "en" ? "Real results" : "Реальные результаты"}
//             </h2>
//             <p className="mt-2 max-w-2xl text-sm text-gray-900/70 dark:text-gray-300">
//               {locale === "de"
//                 ? "Klicken Sie auf ein Bild, um es größer zu sehen."
//                 : locale === "en"
//                 ? "Click an image to view larger."
//                 : "Нажмите на фото, чтобы открыть крупно."}
//             </p>
//           </Reveal>

//           <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {beforeAfter.map((x, i) => (
//               <Reveal key={x.label} delay={80 * i}>
//                 <div
//                   className={[
//                     "group overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60",
//                     styles.cardHover,
//                   ].join(" ")}
//                 >
//                   <div className="p-4">
//                     <div className="text-sm font-extrabold text-gray-950 dark:text-white">{x.label}</div>
//                     <div className="mt-3 grid grid-cols-2 gap-3">
//                       <button
//                         type="button"
//                         onClick={() => setLightbox(x.before)}
//                         className="relative aspect-[4/3] overflow-hidden rounded-2xl"
//                         aria-label="Open before"
//                       >
//                         <Image
//                           src={x.before}
//                           alt={`${x.label} before`}
//                           fill
//                           className="object-cover transition duration-300 group-hover:scale-[1.02]"
//                           sizes="(max-width:1024px) 50vw, 20vw"
//                         />
//                         <span className={styles.badgeCorner}>Before</span>
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() => setLightbox(x.after)}
//                         className="relative aspect-[4/3] overflow-hidden rounded-2xl"
//                         aria-label="Open after"
//                       >
//                         <Image
//                           src={x.after}
//                           alt={`${x.label} after`}
//                           fill
//                           className="object-cover transition duration-300 group-hover:scale-[1.02]"
//                           sizes="(max-width:1024px) 50vw, 20vw"
//                         />
//                         <span className={styles.badgeCorner}>After</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//         </div>

//         {/* Lightbox */}
//         {lightbox ? (
//           <div
//             role="dialog"
//             aria-modal="true"
//             className={styles.lightboxOverlay}
//             onClick={() => setLightbox(null)}
//           >
//             <div className={styles.lightboxPanel} onClick={(e) => e.stopPropagation()}>
//               <button
//                 type="button"
//                 className={styles.lightboxClose}
//                 onClick={() => setLightbox(null)}
//                 aria-label="Close"
//               >
//                 ✕
//               </button>
//               <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
//                 <Image src={lightbox} alt="Preview" fill className="object-cover" sizes="90vw" />
//               </div>
//             </div>
//           </div>
//         ) : null}
//       </section>

//       {/* NEWS */}
//       <section className="relative pb-12 sm:pb-16">
//         <div className="mx-auto max-w-7xl px-5 sm:px-8">
//           <Reveal>
//             <p className="inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-white/80 px-3 py-1 text-xs font-extrabold tracking-wide text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-white">
//               <Sparkles className="h-4 w-4 text-gold-600" />
//               {t.news_kicker}
//             </p>
//             <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
//               {t.news_title}
//             </h2>
//           </Reveal>

//           <div className="mt-7 grid gap-4 lg:grid-cols-3">
//             {latest.length === 0 ? (
//               <Reveal>
//                 <div className="rounded-3xl border border-gray-900/10 bg-white/80 p-6 text-sm text-gray-900/70 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-gray-300">
//                   {t.news_empty}
//                 </div>
//               </Reveal>
//             ) : (
//               latest.map((a, i) => (
//                 <Reveal key={a.id} delay={80 * i}>
//                   <Link
//                     href={localeHref(`/news/${a.slug}`, locale)}
//                     className={[
//                       "group block overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60",
//                       styles.cardHover,
//                     ].join(" ")}
//                   >
//                     <div className="relative aspect-[16/10] w-full">
//                       <Image
//                         src={a.cover ?? "/images/hero.webp"}
//                         alt={a.title}
//                         fill
//                         className="object-cover"
//                         sizes="(max-width: 1024px) 100vw, 33vw"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent" />
//                     </div>
//                     <div className="p-6">
//                       <div className="text-xs font-extrabold uppercase tracking-widest text-gray-900/60 dark:text-white/60">
//                         {a.type}
//                       </div>
//                       <div className="mt-2 text-base font-extrabold text-gray-950 dark:text-white">
//                         {a.title}
//                       </div>
//                       {a.excerpt ? (
//                         <p className="mt-2 line-clamp-3 text-sm text-gray-900/70 dark:text-gray-300">
//                           {a.excerpt}
//                         </p>
//                       ) : null}
//                       <div className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-gray-950 dark:text-white">
//                         {locale === "de" ? "Mehr lesen" : locale === "en" ? "Read more" : "Читать"}
//                         <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
//                       </div>
//                     </div>
//                   </Link>
//                 </Reveal>
//               ))
//             )}
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="relative pb-12 sm:pb-16">
//         <div className="mx-auto max-w-7xl px-5 sm:px-8">
//           <Reveal>
//             <div
//               className={[
//                 "relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 sm:p-10",
//                 styles.ctaCard,
//               ].join(" ")}
//             >
//               <div className={["absolute inset-0", styles.ctaGlow].join(" ")} />
//               <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                   <div className="text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white">
//                     {t.cta_title}
//                   </div>
//                   <p className="mt-2 max-w-2xl text-sm text-gray-900/70 dark:text-gray-300">
//                     {t.cta_text}
//                   </p>
//                 </div>

//                 <Link
//                   href={localeHref("/booking", locale)}
//                   className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-gray-950 sm:w-auto"
//                 >
//                   {t.cta_btn}
//                   <ArrowUpRight className="h-4 w-4 opacity-80" />
//                 </Link>
//               </div>
//             </div>
//           </Reveal>
//         </div>
//       </section>

//       {/* VISIT */}
//       <section className="relative pb-14 sm:pb-20">
//         <div className="mx-auto max-w-7xl px-5 sm:px-8">
//           <Reveal>
//             <div
//               className={[
//                 "relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 p-6 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 sm:p-10",
//                 styles.cardHover,
//               ].join(" ")}
//             >
//               <div className="text-xs font-extrabold uppercase tracking-widest text-gray-900/60 dark:text-white/60">
//                 {t.visit_kicker}
//               </div>
//               <div className="mt-2 text-2xl font-extrabold text-gray-950 dark:text-white">
//                 {t.visit_title}
//               </div>

//               <div className="mt-5 grid gap-3 sm:grid-cols-3">
//                 <div className="flex items-start gap-3">
//                   <MapPin className="mt-0.5 h-5 w-5 text-gold-600" />
//                   <div className="text-sm font-semibold text-gray-950 dark:text-white">
//                     {t.visit_addr}
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <Phone className="mt-0.5 h-5 w-5 text-gold-600" />
//                   <a
//                     href={`tel:${t.visit_phone.replace(/\s+/g, "")}`}
//                     className="text-sm font-semibold text-gray-950 underline-offset-4 hover:underline dark:text-white"
//                   >
//                     {t.visit_phone}
//                   </a>
//                 </div>
//                 <div className="flex items-start gap-3">
//                   <ArrowUpRight className="mt-0.5 h-5 w-5 text-gold-600" />
//                   <a
//                     href={mapsUrl}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="text-sm font-semibold text-gray-950 underline-offset-4 hover:underline dark:text-white"
//                   >
//                     {t.visit_map}
//                   </a>
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <Link
//                   href={localeHref("/contacts", locale)}
//                   className="group inline-flex items-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-5 py-3 text-sm font-extrabold text-gray-950 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white"
//                 >
//                   {locale === "de" ? "Kontakt" : locale === "en" ? "Contact" : "Контакты"}
//                   <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
//                 </Link>
//               </div>
//             </div>
//           </Reveal>
//         </div>
//       </section>
//     </main>
//   );
// }




//--------14.02.26 редизайн gpt
// // src/components/home-page.tsx
// "use client";

// import { useRef, useEffect, useState, useCallback } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, useInView, useScroll, useTransform } from "framer-motion";
// import {
//   Sparkles,
//   Star,
//   Shield,
//   Clock,
//   Heart,
//   ChevronRight,
//   ArrowRight,
//   MapPin,
//   Phone,
//   Calendar,
//   Award,
//   Gem,
//   Users,
//   Scissors,
//   Eye,
//   Palette,
//   HandMetal,
//   Quote,
//   Images,
// } from "lucide-react";
// import RainbowCTA from "@/components/RainbowCTA";
// import { useI18n } from "@/i18n/I18nProvider";
// import type { Locale } from "@/i18n/locales";

// /* ═══════════════════════ TYPES ═══════════════════════ */

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// type ServiceItem = {
//   id: string;
//   slug: string;
//   name: string;
//   cover: string | null;
//   description: string | null;
// };

// type Props = {
//   latest: ArticleItem[];
//   services?: ServiceItem[];
// };

// /* ═══════════════════════ i18n ═══════════════════════ */

// const t_map: Record<Locale, Record<string, string>> = {
//   de: {
//     hero_tag: "Willkommen bei Salon Elen",
//     hero_title_1: "Schönheit",
//     hero_title_2: "die begeistert",
//     hero_desc: "Professionelle Kosmetik, Permanent Make-up, Nageldesign und mehr — im Herzen von Halle an der Saale.",
//     hero_cta: "Termin buchen",
//     hero_services: "Alle Leistungen",
//     hero_badge: "Online-Termin 24/7",

//     stats_years: "Jahre Erfahrung",
//     stats_clients: "Zufriedene Kunden",
//     stats_services: "Leistungen",
//     stats_rating: "Bewertung",

//     services_tag: "Unsere Leistungen",
//     services_title: "Was wir am besten können",
//     services_desc: "Von Permanent Make-up bis Nageldesign — wir bieten alles für Ihre Schönheit.",
//     services_all: "Alle Leistungen ansehen",
//     service_1: "Permanent Make-up",
//     service_1_desc: "Perfekte Augenbrauen, Lippen und Lidstriche — natürlich und dauerhaft schön.",
//     service_2: "Wimpernverlängerung",
//     service_2_desc: "Voluminöse, natürlich wirkende Wimpern für einen ausdrucksstarken Blick.",
//     service_3: "Nageldesign",
//     service_3_desc: "Maniküre, Gelnägel und kreative Designs — Ästhetik bis in die Fingerspitzen.",
//     service_4: "Microneedling",
//     service_4_desc: "Hautverjüngung und Kollagenboost für ein strahlendes, ebenmäßiges Hautbild.",

//     why_tag: "Warum Salon Elen",
//     why_title: "Vertrauen Sie den Besten",
//     why_1_title: "Zertifizierte Meister",
//     why_1_desc: "Unsere Spezialisten verfügen über internationale Zertifikate und langjährige Erfahrung.",
//     why_2_title: "Premium Produkte",
//     why_2_desc: "Wir arbeiten ausschließlich mit hochwertigen, geprüften Marken und Materialien.",
//     why_3_title: "Sterile Sicherheit",
//     why_3_desc: "Höchste Hygienestandards und Einwegmaterialien für Ihre Sicherheit.",
//     why_4_title: "Individuelle Beratung",
//     why_4_desc: "Jede Behandlung wird individuell auf Sie abgestimmt — für perfekte Ergebnisse.",

//     gallery_tag: "Unsere Arbeiten",
//     gallery_title: "Ergebnisse, die überzeugen",
//     gallery_cta: "Galerie ansehen",

//     reviews_tag: "Bewertungen",
//     reviews_title: "Was unsere Kunden sagen",
//     review_1: "Absolut begeistert vom Permanent Make-up! Natürlich und perfekt gemacht.",
//     review_1_author: "Anna M.",
//     review_2: "Bester Nagelservice in Halle. Komme seit 2 Jahren regelmäßig.",
//     review_2_author: "Maria K.",
//     review_3: "Die Wimpernverlängerung sieht so natürlich aus. Professionelles Team!",
//     review_3_author: "Sophie L.",

//     news_tag: "Aktuelles",
//     news_title: "News & Artikel",
//     news_empty: "Noch keine Beiträge.",
//     news_type_ARTICLE: "Artikel",
//     news_type_NEWS: "News",
//     news_type_PROMO: "Aktion",

//     cta_title: "Bereit für Ihre Verwandlung?",
//     cta_desc: "Buchen Sie jetzt Ihren Termin — bequem online, 24 Stunden am Tag.",
//     cta_btn: "Jetzt buchen",

//     contact_tag: "Besuchen Sie uns",
//     contact_title: "Salon Elen in Halle",
//     contact_address: "Leipziger Straße 63, 06108 Halle (Saale)",
//     contact_hours: "Mo–Fr 09:00–19:00 · Sa 09:00–16:00",
//     contact_phone: "+49 345 1234567",
//     contact_map: "Auf der Karte ansehen",
//   },
//   en: {
//     hero_tag: "Welcome to Salon Elen",
//     hero_title_1: "Beauty",
//     hero_title_2: "that inspires",
//     hero_desc: "Professional cosmetics, permanent make-up, nail design, and more — in the heart of Halle an der Saale.",
//     hero_cta: "Book now",
//     hero_services: "All services",
//     hero_badge: "Online booking 24/7",

//     stats_years: "Years of experience",
//     stats_clients: "Happy clients",
//     stats_services: "Services",
//     stats_rating: "Rating",

//     services_tag: "Our services",
//     services_title: "What we do best",
//     services_desc: "From permanent make-up to nail design — everything for your beauty.",
//     services_all: "View all services",
//     service_1: "Permanent Make-up",
//     service_1_desc: "Perfect brows, lips, and eyeliner — naturally beautiful and long-lasting.",
//     service_2: "Eyelash Extensions",
//     service_2_desc: "Voluminous, natural-looking lashes for an expressive gaze.",
//     service_3: "Nail Design",
//     service_3_desc: "Manicure, gel nails, and creative designs — beauty to your fingertips.",
//     service_4: "Microneedling",
//     service_4_desc: "Skin rejuvenation and collagen boost for a radiant, even complexion.",

//     why_tag: "Why Salon Elen",
//     why_title: "Trust the best",
//     why_1_title: "Certified Masters",
//     why_1_desc: "Our specialists hold international certificates and years of experience.",
//     why_2_title: "Premium Products",
//     why_2_desc: "We use only high-quality, tested brands and materials.",
//     why_3_title: "Sterile Safety",
//     why_3_desc: "Highest hygiene standards and disposable materials for your safety.",
//     why_4_title: "Personal Consultation",
//     why_4_desc: "Every treatment is tailored to you — for perfect results.",

//     gallery_tag: "Our works",
//     gallery_title: "Results that convince",
//     gallery_cta: "View gallery",

//     reviews_tag: "Reviews",
//     reviews_title: "What our clients say",
//     review_1: "Absolutely love the permanent make-up! Natural and perfectly done.",
//     review_1_author: "Anna M.",
//     review_2: "Best nail service in Halle. Been coming regularly for 2 years.",
//     review_2_author: "Maria K.",
//     review_3: "The lash extensions look so natural. Very professional team!",
//     review_3_author: "Sophie L.",

//     news_tag: "Latest",
//     news_title: "News & Articles",
//     news_empty: "No posts yet.",
//     news_type_ARTICLE: "Article",
//     news_type_NEWS: "News",
//     news_type_PROMO: "Promo",

//     cta_title: "Ready for your transformation?",
//     cta_desc: "Book your appointment now — conveniently online, 24 hours a day.",
//     cta_btn: "Book now",

//     contact_tag: "Visit us",
//     contact_title: "Salon Elen in Halle",
//     contact_address: "Leipziger Straße 63, 06108 Halle (Saale)",
//     contact_hours: "Mon–Fri 09:00–19:00 · Sat 09:00–16:00",
//     contact_phone: "+49 345 1234567",
//     contact_map: "View on map",
//   },
//   ru: {
//     hero_tag: "Добро пожаловать в Salon Elen",
//     hero_title_1: "Красота,",
//     hero_title_2: "которая вдохновляет",
//     hero_desc: "Профессиональная косметология, перманентный макияж, дизайн ногтей и многое другое — в центре Галле.",
//     hero_cta: "Записаться",
//     hero_services: "Все услуги",
//     hero_badge: "Онлайн-запись 24/7",

//     stats_years: "Лет опыта",
//     stats_clients: "Довольных клиентов",
//     stats_services: "Услуг",
//     stats_rating: "Рейтинг",

//     services_tag: "Наши услуги",
//     services_title: "Что мы умеем лучше всего",
//     services_desc: "От перманентного макияжа до дизайна ногтей — всё для вашей красоты.",
//     services_all: "Смотреть все услуги",
//     service_1: "Перманентный макияж",
//     service_1_desc: "Идеальные брови, губы и стрелки — естественно и надолго.",
//     service_2: "Наращивание ресниц",
//     service_2_desc: "Объёмные и естественные ресницы для выразительного взгляда.",
//     service_3: "Дизайн ногтей",
//     service_3_desc: "Маникюр, гель-лак и креативный дизайн — эстетика до кончиков пальцев.",
//     service_4: "Микронидлинг",
//     service_4_desc: "Омоложение кожи и стимуляция коллагена для сияющего ровного тона.",

//     why_tag: "Почему Salon Elen",
//     why_title: "Доверьтесь лучшим",
//     why_1_title: "Сертифицированные мастера",
//     why_1_desc: "Наши специалисты имеют международные сертификаты и многолетний опыт.",
//     why_2_title: "Премиум-продукция",
//     why_2_desc: "Мы работаем только с проверенными брендами и качественными материалами.",
//     why_3_title: "Стерильная безопасность",
//     why_3_desc: "Высочайшие стандарты гигиены и одноразовые материалы для вашей безопасности.",
//     why_4_title: "Индивидуальный подход",
//     why_4_desc: "Каждая процедура подбирается индивидуально — для идеального результата.",

//     gallery_tag: "Наши работы",
//     gallery_title: "Результаты, которые говорят сами за себя",
//     gallery_cta: "Смотреть галерею",

//     reviews_tag: "Отзывы",
//     reviews_title: "Что говорят наши клиенты",
//     review_1: "В полном восторге от перманентного макияжа! Естественно и идеально.",
//     review_1_author: "Анна М.",
//     review_2: "Лучший маникюр в Галле. Хожу уже 2 года регулярно.",
//     review_2_author: "Мария К.",
//     review_3: "Наращивание ресниц выглядит очень натурально. Профессиональная команда!",
//     review_3_author: "Софи Л.",

//     news_tag: "Новости",
//     news_title: "Новости и статьи",
//     news_empty: "Публикаций пока нет.",
//     news_type_ARTICLE: "Статья",
//     news_type_NEWS: "Новость",
//     news_type_PROMO: "Акция",

//     cta_title: "Готовы к преображению?",
//     cta_desc: "Запишитесь прямо сейчас — удобно онлайн, 24 часа в сутки.",
//     cta_btn: "Записаться",

//     contact_tag: "Приходите к нам",
//     contact_title: "Salon Elen в Галле",
//     contact_address: "Leipziger Straße 63, 06108 Halle (Saale)",
//     contact_hours: "Пн–Пт 09:00–19:00 · Сб 09:00–16:00",
//     contact_phone: "+49 345 1234567",
//     contact_map: "Показать на карте",
//   },
// };

// /* ═══════════════════════ HELPERS ═══════════════════════ */

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
// }

// /* ── Animated counter ── */
// function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
//   const ref = useRef<HTMLSpanElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-50px" });
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     if (!isInView) return;
//     let frame: number;
//     const duration = 2000;
//     const start = performance.now();

//     const step = (now: number) => {
//       const elapsed = now - start;
//       const progress = Math.min(elapsed / duration, 1);
//       const eased = 1 - Math.pow(1 - progress, 3);
//       setCount(Math.round(eased * target));
//       if (progress < 1) frame = requestAnimationFrame(step);
//     };
//     frame = requestAnimationFrame(step);
//     return () => cancelAnimationFrame(frame);
//   }, [isInView, target]);

//   return <span ref={ref}>{count}{suffix}</span>;
// }

// /* ── Section wrapper with scroll reveal ── */
// function RevealSection({
//   children,
//   className = "",
//   delay = 0,
// }: {
//   children: React.ReactNode;
//   className?: string;
//   delay?: number;
// }) {
//   const ref = useRef<HTMLElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-80px" });

//   return (
//     <section
//       ref={ref}
//       className={`transition-all duration-700 ${className}`}
//       style={{
//         opacity: isInView ? 1 : 0,
//         transform: isInView ? "translateY(0)" : "translateY(40px)",
//         transitionDelay: `${delay}ms`,
//       }}
//     >
//       {children}
//     </section>
//   );
// }

// /* ═══════ SERVICE ICON MAP ═══════ */
// const SERVICE_ICONS = [
//   { icon: Eye, gradient: "from-rose-500 to-pink-600 dark:from-amber-400 dark:to-orange-500" },
//   { icon: Sparkles, gradient: "from-violet-500 to-purple-600 dark:from-violet-400 dark:to-purple-500" },
//   { icon: HandMetal, gradient: "from-pink-500 to-rose-600 dark:from-pink-400 dark:to-rose-500" },
//   { icon: Gem, gradient: "from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500" },
// ];

// /* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

// export default function HomePage({ latest }: Props) {
//   const { locale } = useI18n();
//   const t = t_map[locale];

//   /* Hero parallax */
//   const heroRef = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({
//     target: heroRef,
//     offset: ["start start", "end start"],
//   });
//   const heroImgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
//   const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

//   return (
//     <main className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 via-white to-white dark:from-[#0a0a0f] dark:via-[#0c0c14] dark:to-[#0a0a0f]">

//       {/* ═══════════════════ HERO ═══════════════════ */}
//       <div ref={heroRef} className="relative min-h-[100svh] flex items-center overflow-hidden">
//         {/* Background image with parallax */}
//         <motion.div className="absolute inset-0 z-0" style={{ y: heroImgY }}>
//           {/* Desktop */}
//           <Image
//             src="/images/hero.webp"
//             alt="Salon Elen"
//             fill
//             priority
//             sizes="100vw"
//             className="hidden md:block object-cover object-[65%_40%] scale-110"
//           />
//           {/* Mobile */}
//           <Image
//             src="/images/hero-mobile.webp"
//             alt="Salon Elen"
//             fill
//             priority
//             sizes="100vw"
//             className="md:hidden object-cover object-center scale-110"
//           />
//         </motion.div>

//         {/* Gradient overlays */}
//         <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/70 via-black/40 to-transparent md:from-black/75 md:via-black/35" />
//         <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-transparent to-black/20" />

//         {/* Decorative orb */}
//         <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-rose-500/8 blur-[120px] z-[1] pointer-events-none" />

//         {/* Content */}
//         <motion.div className="relative z-10 w-full" style={{ opacity: heroOpacity }}>
//           <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-0">
//             <div className="max-w-2xl">
//               {/* Tag */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.2 }}
//                 className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 mb-6"
//               >
//                 <Sparkles className="h-3.5 w-3.5 text-amber-300" />
//                 {t.hero_tag}
//               </motion.div>

//               {/* Title */}
//               <motion.h1
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.7, delay: 0.35 }}
//                 className="font-playfair text-[clamp(42px,8vw,80px)] leading-[0.95] font-light tracking-tight text-white"
//               >
//                 {t.hero_title_1}
//                 <br />
//                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200">
//                   {t.hero_title_2}
//                 </span>
//               </motion.h1>

//               {/* Description */}
//               <motion.p
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.55 }}
//                 className="mt-6 text-base sm:text-lg text-white/80 leading-relaxed max-w-lg font-cormorant tracking-wide"
//               >
//                 {t.hero_desc}
//               </motion.p>

//               {/* CTAs */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.7 }}
//                 className="mt-8 flex flex-wrap gap-4"
//               >
//                 <RainbowCTA
//                   href={localeHref("/booking", locale)}
//                   label={t.hero_cta}
//                   className="h-12 px-8 text-[15px]"
//                   idle
//                 />
//                 <Link
//                   href={localeHref("/services", locale)}
//                   className="group inline-flex h-12 px-6 items-center gap-2 rounded-full border border-white/30 text-white/90 hover:bg-white/10 hover:border-white/50 transition-all duration-300 text-sm font-medium"
//                 >
//                   {t.hero_services}
//                   <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                 </Link>
//               </motion.div>

//               {/* Badge */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.6, delay: 0.9 }}
//                 className="mt-6 flex items-center gap-2 text-white/50 text-sm"
//               >
//                 <Calendar className="h-4 w-4" />
//                 {t.hero_badge}
//               </motion.div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Scroll indicator */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1.5 }}
//           className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
//         >
//           <div className="w-5 h-8 rounded-full border-2 border-white/30 flex justify-center pt-1.5">
//             <motion.div
//               animate={{ y: [0, 8, 0] }}
//               transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
//               className="w-1 h-1.5 rounded-full bg-white/60"
//             />
//           </div>
//         </motion.div>
//       </div>

//       {/* ═══════════════════ STATS ═══════════════════ */}
//       <RevealSection className="relative z-10 -mt-16 sm:-mt-20 mx-auto max-w-6xl px-5 sm:px-8">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
//           {[
//             { value: 8, suffix: "+", label: t.stats_years, icon: Award },
//             { value: 2500, suffix: "+", label: t.stats_clients, icon: Users },
//             { value: 50, suffix: "+", label: t.stats_services, icon: Scissors },
//             { value: 4.9, suffix: "", label: t.stats_rating, icon: Star, isDecimal: true },
//           ].map((stat, i) => (
//             <div
//               key={i}
//               className="relative group rounded-2xl border border-rose-200/30 bg-white/80 backdrop-blur-xl p-5 sm:p-6 text-center shadow-lg shadow-rose-100/20 hover:shadow-xl hover:shadow-rose-200/25 transition-all duration-500 hover:-translate-y-1 dark:border-white/8 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/8"
//             >
//               <stat.icon className="mx-auto h-5 w-5 text-rose-400 dark:text-amber-400 mb-3 transition-transform duration-500 group-hover:scale-110" />
//               <div className="text-3xl sm:text-4xl font-playfair font-light text-rose-900 dark:text-amber-100 tabular-nums">
//                 {stat.isDecimal ? (
//                   <span>4.9</span>
//                 ) : (
//                   <AnimatedCounter target={stat.value} suffix={stat.suffix} />
//                 )}
//               </div>
//               <div className="mt-1 text-xs sm:text-sm text-rose-700/60 dark:text-white/50 font-medium tracking-wide">
//                 {stat.label}
//               </div>
//             </div>
//           ))}
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ SERVICES ═══════════════════ */}
//       <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-24 sm:pt-32">
//         <div className="text-center mb-12 sm:mb-16">
//           <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//             <Sparkles className="h-3.5 w-3.5" />
//             {t.services_tag}
//           </span>
//           <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//             {t.services_title}
//           </h2>
//           <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-cormorant text-lg tracking-wide">
//             {t.services_desc}
//           </p>
//         </div>

//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//           {[1, 2, 3, 4].map((n, i) => {
//             const IconComp = SERVICE_ICONS[i].icon;
//             const grad = SERVICE_ICONS[i].gradient;
//             return (
//               <Link
//                 key={n}
//                 href={localeHref("/services", locale)}
//                 className="group relative rounded-2xl border border-rose-100/50 bg-white/70 backdrop-blur-sm p-6 shadow-md shadow-rose-100/10 hover:shadow-xl hover:shadow-rose-200/20 transition-all duration-500 hover:-translate-y-2 dark:border-white/6 dark:bg-white/[0.03] dark:shadow-none dark:hover:bg-white/[0.06] dark:hover:border-white/10"
//               >
//                 <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${grad} shadow-lg mb-4`}>
//                   <IconComp className="h-5 w-5 text-white" />
//                 </div>
//                 <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
//                   {t[`service_${n}`]}
//                 </h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
//                   {t[`service_${n}_desc`]}
//                 </p>
//                 <div className="mt-4 inline-flex items-center gap-1 text-rose-600 dark:text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
//                   <ArrowRight className="h-4 w-4" />
//                 </div>
//               </Link>
//             );
//           })}
//         </div>

//         <div className="text-center mt-10">
//           <Link
//             href={localeHref("/services", locale)}
//             className="group inline-flex items-center gap-2 rounded-full border border-rose-200/50 bg-rose-50/60 px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100/70 hover:border-rose-300/60 transition-all duration-300 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300 dark:hover:bg-amber-500/10"
//           >
//             {t.services_all}
//             <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//           </Link>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ WHY US ═══════════════════ */}
//       <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-24 sm:pt-32">
//         <div className="text-center mb-12 sm:mb-16">
//           <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//             <Shield className="h-3.5 w-3.5" />
//             {t.why_tag}
//           </span>
//           <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//             {t.why_title}
//           </h2>
//         </div>

//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//           {[
//             { icon: Award, key: "1", color: "text-rose-500 dark:text-amber-400" },
//             { icon: Gem, key: "2", color: "text-violet-500 dark:text-violet-400" },
//             { icon: Shield, key: "3", color: "text-emerald-500 dark:text-emerald-400" },
//             { icon: Heart, key: "4", color: "text-pink-500 dark:text-pink-400" },
//           ].map((item, i) => (
//             <div
//               key={i}
//               className="group text-center p-6 rounded-2xl hover:bg-rose-50/50 dark:hover:bg-white/[0.03] transition-all duration-500"
//             >
//               <div className="mx-auto w-14 h-14 rounded-2xl border border-rose-100/60 bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 dark:border-white/8 dark:bg-white/5">
//                 <item.icon className={`h-6 w-6 ${item.color}`} />
//               </div>
//               <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
//                 {t[`why_${item.key}_title`]}
//               </h3>
//               <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
//                 {t[`why_${item.key}_desc`]}
//               </p>
//             </div>
//           ))}
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ GALLERY PREVIEW ═══════════════════ */}
//       <RevealSection className="relative z-10 pt-24 sm:pt-32">
//         <div className="text-center mb-10 px-5">
//           <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//             <Images className="h-3.5 w-3.5" />
//             {t.gallery_tag}
//           </span>
//           <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//             {t.gallery_title}
//           </h2>
//         </div>

//         {/* Horizontal scroll strip */}
//         <div className="relative overflow-hidden">
//           <div className="flex gap-3 animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused] w-max">
//             {[
//               "/images/services/haircut.webp",
//               "/images/services/makeup.webp",
//               "/images/services/manicure.webp",
//               "/images/hero.webp",
//               "/images/services/haircut.webp",
//               "/images/services/makeup.webp",
//               "/images/services/manicure.webp",
//               "/images/hero.webp",
//             ].map((src, i) => (
//               <div
//                 key={i}
//                 className="relative w-[260px] sm:w-[320px] aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 group"
//               >
//                 <Image
//                   src={src}
//                   alt={`Gallery ${i + 1}`}
//                   fill
//                   loading="lazy"
//                   sizes="320px"
//                   className="object-cover transition-transform duration-700 group-hover:scale-110"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//               </div>
//             ))}
//           </div>
//           {/* Edge fades */}
//           <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-rose-50/50 dark:from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
//           <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
//         </div>

//         <div className="text-center mt-8">
//           <Link
//             href={localeHref("/gallerie", locale)}
//             className="group inline-flex items-center gap-2 rounded-full border border-rose-200/50 bg-rose-50/60 px-6 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100/70 transition-all duration-300 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300 dark:hover:bg-amber-500/10"
//           >
//             {t.gallery_cta}
//             <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//           </Link>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ REVIEWS ═══════════════════ */}
//       <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-24 sm:pt-32">
//         <div className="text-center mb-12">
//           <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//             <Star className="h-3.5 w-3.5" />
//             {t.reviews_tag}
//           </span>
//           <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//             {t.reviews_title}
//           </h2>
//         </div>

//         <div className="grid gap-5 md:grid-cols-3">
//           {[1, 2, 3].map((n) => (
//             <div
//               key={n}
//               className="relative rounded-2xl border border-rose-100/50 bg-white/70 backdrop-blur-sm p-6 shadow-md shadow-rose-100/10 dark:border-white/6 dark:bg-white/[0.03] dark:shadow-none"
//             >
//               <Quote className="h-8 w-8 text-rose-200 dark:text-amber-500/20 mb-3" />
//               <div className="flex gap-0.5 mb-3">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
//                 ))}
//               </div>
//               <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-cormorant text-base tracking-wide">
//                 &ldquo;{t[`review_${n}`]}&rdquo;
//               </p>
//               <div className="mt-4 pt-4 border-t border-rose-100/30 dark:border-white/5">
//                 <span className="text-sm font-semibold text-gray-900 dark:text-white">
//                   {t[`review_${n}_author`]}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ NEWS ═══════════════════ */}
//       {latest.length > 0 && (
//         <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-24 sm:pt-32">
//           <div className="text-center mb-12">
//             <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//               {t.news_tag}
//             </span>
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-gray-900 dark:text-white">
//               {t.news_title}
//             </h2>
//           </div>

//           <div className="grid gap-5 md:grid-cols-3">
//             {latest.map((item) => (
//               <Link
//                 key={item.id}
//                 href={`/news/${item.slug}`}
//                 className="group block rounded-2xl border border-rose-100/50 bg-white/70 backdrop-blur-sm overflow-hidden shadow-md shadow-rose-100/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 dark:border-white/6 dark:bg-white/[0.03] dark:shadow-none dark:hover:bg-white/[0.05]"
//               >
//                 <div className="relative aspect-[16/10] overflow-hidden bg-rose-50 dark:bg-white/5">
//                   {item.cover ? (
//                     <Image
//                       src={item.cover}
//                       alt={item.title}
//                       fill
//                       loading="lazy"
//                       sizes="(max-width: 768px) 100vw, 33vw"
//                       className="object-cover transition-transform duration-700 group-hover:scale-105"
//                     />
//                   ) : (
//                     <div className="flex h-full w-full items-center justify-center text-rose-300 dark:text-white/10">
//                       <Sparkles className="h-8 w-8" />
//                     </div>
//                   )}
//                 </div>
//                 <div className="p-5">
//                   <div className="text-xs uppercase tracking-wider text-rose-500 dark:text-amber-400 font-semibold mb-2">
//                     {t[`news_type_${item.type}`]}
//                   </div>
//                   <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-amber-300 transition-colors leading-snug">
//                     {item.title}
//                   </h3>
//                   {item.excerpt && (
//                     <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
//                       {item.excerpt}
//                     </p>
//                   )}
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </RevealSection>
//       )}

//       {/* ═══════════════════ CTA ═══════════════════ */}
//       <RevealSection className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 pt-24 sm:pt-32 pb-12">
//         <div className="relative overflow-hidden rounded-3xl">
//           {/* Gradient background */}
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-pink-500 to-amber-500 dark:from-amber-600 dark:via-amber-500 dark:to-orange-500" />
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />

//           <div className="relative z-10 px-6 sm:px-12 py-14 sm:py-16 text-center">
//             <Sparkles className="mx-auto h-8 w-8 text-white/60 mb-4" />
//             <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
//               {t.cta_title}
//             </h2>
//             <p className="mt-4 text-white/80 max-w-md mx-auto font-cormorant text-lg tracking-wide">
//               {t.cta_desc}
//             </p>
//             <div className="mt-8">
//               <Link
//                 href={localeHref("/booking", locale)}
//                 className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-rose-700 dark:text-amber-800 font-semibold text-sm shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
//               >
//                 {t.cta_btn}
//                 <ArrowRight className="h-4 w-4" />
//               </Link>
//             </div>
//           </div>
//         </div>
//       </RevealSection>

//       {/* ═══════════════════ CONTACT STRIP ═══════════════════ */}
//       <RevealSection className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pb-20">
//         <div className="text-center mb-10">
//           <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/40 bg-rose-50/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
//             <MapPin className="h-3.5 w-3.5" />
//             {t.contact_tag}
//           </span>
//           <h2 className="font-playfair text-3xl sm:text-4xl font-light tracking-tight text-gray-900 dark:text-white">
//             {t.contact_title}
//           </h2>
//         </div>

//         <div className="grid gap-4 sm:grid-cols-3">
//           {[
//             { icon: MapPin, text: t.contact_address, color: "text-rose-500 dark:text-amber-400" },
//             { icon: Clock, text: t.contact_hours, color: "text-emerald-500 dark:text-emerald-400" },
//             { icon: Phone, text: t.contact_phone, color: "text-sky-500 dark:text-sky-400" },
//           ].map((item, i) => (
//             <div
//               key={i}
//               className="flex items-center gap-4 rounded-2xl border border-rose-100/50 bg-white/70 backdrop-blur-sm p-5 dark:border-white/6 dark:bg-white/[0.03]"
//             >
//               <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-50 dark:bg-white/5 flex items-center justify-center">
//                 <item.icon className={`h-5 w-5 ${item.color}`} />
//               </div>
//               <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
//                 {item.text}
//               </span>
//             </div>
//           ))}
//         </div>

//         <div className="text-center mt-8">
//           <Link
//             href={localeHref("/contacts", locale)}
//             className="group inline-flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-amber-400 hover:text-rose-700 dark:hover:text-amber-300 transition-colors"
//           >
//             {t.contact_map}
//             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//           </Link>
//         </div>
//       </RevealSection>

//       {/* CSS keyframes for gallery scroll */}
//       <style jsx global>{`
//         @keyframes scroll {
//           0% { transform: translateX(0); }
//           100% { transform: translateX(-50%); }
//         }
//       `}</style>
//     </main>
//   );
// }



//-----тестируем новый дизайн главной страницы. Временно отключаем SSR для этого компонента, чтобы не заморачиваться с загрузкой данных для раздела "Новости и статьи"-----
// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import Section from "@/components/section";
// import RainbowCTA from "@/components/RainbowCTA";
// import { useTranslations } from "@/i18n/useTranslations";
// import { useI18n } from "@/i18n/I18nProvider";
// import type { Locale } from "@/i18n/locales";

// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// const TYPE_LABEL_BY_LOCALE: Record<
//   Locale,
//   Record<KnownType, string>
// > = {
//   ru: {
//     ARTICLE: "Статья",
//     NEWS: "Новость",
//     PROMO: "Акция",
//   },
//   de: {
//     ARTICLE: "Artikel",
//     NEWS: "News",
//     PROMO: "Aktion",
//   },
//   en: {
//     ARTICLE: "Article",
//     NEWS: "News",
//     PROMO: "Promo",
//   },
// };

// type HomePageProps = {
//   latest: ArticleItem[];
// };

// export default function HomePage({ latest }: HomePageProps) {
//   const t = useTranslations();
//   const { locale } = useI18n();
//   const typeLabel = TYPE_LABEL_BY_LOCALE[locale];

//   return (
//     <main>
//       {/* HERO */}
//       <section className="relative isolate w-full">
//         {/* MOBILE */}
//         <div className="md:hidden">
//           <div className="container pt-4">
//             <h1 className="text-[26px] leading-[1.15] font-semibold tracking-tight text-[#F5F3EE]">
//               {t("hero_tagline")}
//             </h1>
//           </div>

//           <div className="relative w-full mt-2">
//             <div
//               aria-hidden
//               className="absolute inset-0 -z-10 blur-2xl opacity-50"
//               style={{
//                 backgroundImage: 'url("/images/hero-mobile.webp")',
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 transform: "scale(1.05)",
//                 filter: "blur(40px)",
//               }}
//             />
//             <div className="relative aspect-[3/4] w-full">
//               <Image
//                 src="/images/hero-mobile.webp"
//                 alt="Salon Elen"
//                 fill
//                 sizes="100vw"
//                 className="object-cover"
//                 priority
//               />
//             </div>
//           </div>

//           <div className="container pb-6 mt-4">
//             <p className="text-[14px] leading-relaxed text-[#F5F3EE]/95">
//               {t("hero_subtitle")}
//             </p>
//             <div className="mt-4 flex gap-3">
//               <RainbowCTA
//                 href="/booking"
//                 label={t("hero_cta_book")}
//                 className="h-10 px-5 text-[14px]"
//                 idle
//               />
//               <Link
//                 href="/services"
//                 className="rounded-full px-4 py-2 text-sm font-medium text-[#F5F3EE] border border-white/25 hover:bg-white/10 transition"
//               >
//                 {t("hero_cta_services")}
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* DESKTOP */}
//         <div className="hidden md:block relative w-full overflow-hidden h-[560px] lg:h-[600px] xl:h-[640px]">
//           <Image
//             src="/images/hero.webp"
//             alt="Salon Elen — стильная студия парикмахерских услуг"
//             fill
//             priority
//             sizes="(max-width: 1024px) 100vw, 1280px"
//             className="object-cover object-[68%_50%]"
//           />

//           <div className="absolute inset-y-0 left-0 z-[1] w-[clamp(36%,42vw,48%)] bg-gradient-to-r from-black/85 via-black/55 to-transparent [mask-image:linear-gradient(to_right,black,black,transparent)]" />
//           <div className="absolute inset-0 z-[1] bg-gradient-to-l from-black/35 via-black/10 to-transparent pointer-events-none" />

//           <div className="relative z-10 h-full">
//             <div className="container h-full">
//               <div className="flex h-full items-center">
//                 <div className="max-w-[620px]">
//                   <h1 className="text-[#F5F3EE] font-semibold tracking-tight leading-[1.06] max-w-[14ch] text-[clamp(40px,6vw,64px)]">
//                     {t("hero_tagline")}
//                   </h1>

//                   <p className="mt-5 text-[#F5F3EE]/90 text-[19px] leading-relaxed max-w-[50ch]">
//                     {t("hero_subtitle")}
//                   </p>

//                   <div className="mt-7 flex flex-wrap gap-3">
//                     <RainbowCTA
//                       href="/booking"
//                       label={t("hero_cta_book")}
//                       className="h-12 px-7 text-[15px]"
//                       idle
//                     />
//                     <Link
//                       href="/services"
//                       className="inline-flex h-12 px-7 items-center justify-center rounded-full border border-white/70 text-white hover:bg-white/10 transition"
//                     >
//                       {t("hero_cta_services")}
//                     </Link>
//                   </div>

//                   <div className="mt-4 text-white/70 text-sm">
//                     {t("hero_badge")}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Популярные услуги */}
//       <Section
//         title={t("home_services_title")}
//         subtitle={t("home_services_subtitle")}
//       >
//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//           {/* 1: Стрижка */}
//           <Link
//             href="/coming-soon"
//             className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
//           >
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/haircut.webp"
//                 alt={t("home_services_card1_title")}
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">{t("home_services_card1_title")}</h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
//                 {t("home_services_card1_text")}
//               </p>
//             </div>
//           </Link>

//           {/* 2: Маникюр */}
//           <Link
//             href="/coming-soon"
//             className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
//           >
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/manicure.webp"
//                 alt={t("home_services_card2_title")}
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">{t("home_services_card2_title")}</h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
//                 {t("home_services_card2_text")}
//               </p>
//             </div>
//           </Link>

//           {/* 3: Make-up */}
//           <Link
//             href="/coming-soon"
//             className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
//           >
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/makeup.webp"
//                 alt={t("home_services_card3_title")}
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">{t("home_services_card3_title")}</h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
//                 {t("home_services_card3_text")}
//               </p>
//             </div>
//           </Link>
//         </div>
//       </Section>

//       {/* Новости и статьи */}
//       <Section
//         title={t("home_news_title")}
//         subtitle={t("home_news_subtitle")}
//       >
//         {latest.length === 0 ? (
//           <p className="text-gray-500 dark:text-gray-400">
//             {t("home_news_empty")}
//           </p>
//         ) : (
//           <div className="grid gap-5 md:grid-cols-3">
//             {latest.map((item) => (
//               <Link
//                 key={item.id}
//                 href={`/news/${item.slug}`}
//                 className="group block rounded-2xl border hover:shadow-md transition overflow-hidden bg-white/70 dark:bg-slate-900/60"
//               >
//                 <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
//                   {item.cover ? (
//                     <Image
//                       src={item.cover}
//                       alt={item.title}
//                       fill
//                       sizes="(max-width: 768px) 100vw, 33vw"
//                       className="object-cover transition-transform duration-500 group-hover:scale-105"
//                     />
//                   ) : (
//                     <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
//                       —
//                     </div>
//                   )}
//                 </div>
//                 <div className="p-4">
//                   <div className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">
//                     {typeLabel[item.type]}
//                   </div>
//                   <h3 className="font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
//                     {item.title}
//                   </h3>
//                   {item.excerpt && (
//                     <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
//                       {item.excerpt}
//                     </p>
//                   )}
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </Section>

//       {/* Нижний CTA */}
//       <Section>
//         <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-8 sm:px-10 sm:py-10 text-white">
//           <div className="relative z-10 max-w-xl">
//             <h2 className="text-2xl sm:text-3xl font-semibold mb-2">
//               {t("home_cta_title")}
//             </h2>
//             <p className="text-sm sm:text-base text-white/90 mb-4">
//               {t("home_cta_text")}
//             </p>
//             <RainbowCTA
//               href="/booking"
//               label={t("home_cta_button")}
//               className="h-11 px-6 text-[15px]"
//             />
//           </div>
//           <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-white/25 blur-3xl" />
//         </div>
//       </Section>
//     </main>
//   );
// }
