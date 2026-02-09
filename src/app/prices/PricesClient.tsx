// src/app/prices/PricesClient.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import {
  Sparkles,
  Clock,
  ChevronRight,
  Eye,
  Hand,
  Star,
  Footprints,
  Gem,
  Flower2,
  Scissors,
  Heart,
  ArrowUpRight,
  BadgeEuro,
} from "lucide-react";
import type { Locale } from "@/i18n/locales";

/* ═══════════════════════ TYPES ═══════════════════════ */

type ServiceItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  cover: string | null;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  services: ServiceItem[];
};

type Props = {
  locale: Locale;
  categories: Category[];
};

/* ═══════════════════════ i18n ═══════════════════════ */

const t_map: Record<
  Locale,
  {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    allCategories: string;
    duration: string;
    minutes: string;
    onRequest: string;
    bookNow: string;
    details: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
    servicesCount: (n: number) => string;
    categoryCount: (n: number) => string;
  }
> = {
  de: {
    heroTitle: "Preise & Leistungen",
    heroSubtitle: "Transparente Preise, erstklassige Qualit\u00E4t",
    heroDescription:
      "Alle Behandlungen werden individuell auf Sie abgestimmt. Vereinbaren Sie ein unverbindliches Beratungsgespr\u00E4ch.",
    allCategories: "Alle",
    duration: "Dauer",
    minutes: "Min.",
    onRequest: "Auf Anfrage",
    bookNow: "Buchen",
    details: "Details",
    ctaTitle: "Bereit f\u00FCr Ihren Termin?",
    ctaText:
      "Vereinbaren Sie jetzt Ihren pers\u00F6nlichen Termin und erleben Sie professionelle Sch\u00F6nheitspflege in entspannter Atmosph\u00E4re.",
    ctaButton: "Termin vereinbaren",
    servicesCount: (n) =>
      n === 1 ? "1 Leistung" : `${n} Leistungen`,
    categoryCount: (n) =>
      n === 1 ? "1 Kategorie" : `${n} Kategorien`,
  },
  en: {
    heroTitle: "Prices & Services",
    heroSubtitle: "Transparent prices, first-class quality",
    heroDescription:
      "All treatments are individually tailored to you. Book a complimentary, no-obligation consultation.",
    allCategories: "All",
    duration: "Duration",
    minutes: "min",
    onRequest: "On request",
    bookNow: "Book",
    details: "Details",
    ctaTitle: "Ready for your appointment?",
    ctaText:
      "Book your personal appointment now and experience professional beauty care in a relaxed atmosphere.",
    ctaButton: "Book appointment",
    servicesCount: (n) =>
      n === 1 ? "1 service" : `${n} services`,
    categoryCount: (n) =>
      n === 1 ? "1 category" : `${n} categories`,
  },
  ru: {
    heroTitle: "\u0426\u0435\u043D\u044B \u0438 \u0443\u0441\u043B\u0443\u0433\u0438",
    heroSubtitle: "\u041F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u044B\u0435 \u0446\u0435\u043D\u044B, \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E",
    heroDescription:
      "\u0412\u0441\u0435 \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440\u044B \u043F\u043E\u0434\u0431\u0438\u0440\u0430\u044E\u0442\u0441\u044F \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E. \u0417\u0430\u043F\u0438\u0448\u0438\u0442\u0435\u0441\u044C \u043D\u0430 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0443\u044E \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044E \u0431\u0435\u0437 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432.",
    allCategories: "\u0412\u0441\u0435",
    duration: "\u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
    minutes: "\u043C\u0438\u043D.",
    onRequest: "\u041F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443",
    bookNow: "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F",
    details: "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435",
    ctaTitle: "\u0413\u043E\u0442\u043E\u0432\u044B \u043A \u0432\u0438\u0437\u0438\u0442\u0443?",
    ctaText:
      "\u0417\u0430\u043F\u0438\u0448\u0438\u0442\u0435\u0441\u044C \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441 \u0438 \u043E\u0449\u0443\u0442\u0438\u0442\u0435 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0443\u0445\u043E\u0434 \u0432 \u0440\u0430\u0441\u0441\u043B\u0430\u0431\u043B\u0435\u043D\u043D\u043E\u0439 \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u0435.",
    ctaButton: "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F",
    servicesCount: (n) => {
      if (n === 1) return "1 \u0443\u0441\u043B\u0443\u0433\u0430";
      if (n >= 2 && n <= 4) return `${n} \u0443\u0441\u043B\u0443\u0433\u0438`;
      return `${n} \u0443\u0441\u043B\u0443\u0433`;
    },
    categoryCount: (n) => {
      if (n === 1) return "1 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F";
      if (n >= 2 && n <= 4) return `${n} \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438`;
      return `${n} \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439`;
    },
  },
};

/* ═══════════════════════ helpers ═══════════════════════ */

function localeHref(path: string, locale: Locale) {
  if (locale === "de") return path;
  const hasQuery = path.includes("?");
  return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
}

function formatPrice(cents: number | null, locale: Locale): string {
  if (!cents) return t_map[locale].onRequest;
  const eur = cents / 100;
  return new Intl.NumberFormat(
    locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-GB",
    { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 2 },
  ).format(eur);
}

/* Map category slugs to Lucide icons */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "permanent-make-up": Eye,
  microneedling: Sparkles,
  nageldesign: Hand,
  "nail-design": Hand,
  wimpernverlangerung: Star,
  "eyelash-extensions": Star,
  fusspflege: Footprints,
  "foot-care": Footprints,
};

function getCategoryIcon(slug: string): React.ElementType {
  const lower = slug.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return Gem;
}

/* ═══════════════════════ animation variants ═══════════════════════ */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* ═══════════════════════ sub-components ═══════════════════════ */

/** Floating background particles (deterministic) */
const PARTICLES = [
  { w: 3.5, h: 4.2, x: 8, y: 12, dy: -40, dx: 5, dur: 9, del: 0.3 },
  { w: 2.8, h: 3.1, x: 28, y: 25, dy: -50, dx: -7, dur: 11, del: 1.5 },
  { w: 4.6, h: 2.4, x: 55, y: 8, dy: -35, dx: 4, dur: 8, del: 2.2 },
  { w: 3.2, h: 5.0, x: 78, y: 32, dy: -55, dx: -3, dur: 12, del: 0.9 },
  { w: 2.5, h: 3.8, x: 92, y: 55, dy: -42, dx: 6, dur: 7, del: 3.1 },
  { w: 4.0, h: 2.9, x: 42, y: 70, dy: -48, dx: -5, dur: 10, del: 1.8 },
  { w: 3.8, h: 3.5, x: 15, y: 60, dy: -38, dx: 8, dur: 9, del: 4.0 },
  { w: 2.2, h: 4.5, x: 65, y: 42, dy: -60, dx: -4, dur: 13, del: 0.6 },
  { w: 5.0, h: 2.7, x: 50, y: 85, dy: -45, dx: 3, dur: 8, del: 2.7 },
  { w: 3.0, h: 3.3, x: 85, y: 15, dy: -52, dx: -6, dur: 11, del: 1.2 },
];

function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-pink-400/10 dark:bg-amber-400/8"
          style={{ width: p.w, height: p.h, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, p.dy, 0], x: [0, p.dx, 0], opacity: [0.08, 0.3, 0.08] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.del }}
        />
      ))}
    </div>
  );
}

function DecorativeBlobs() {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute -top-40 -right-40 w-[550px] h-[550px] rounded-full opacity-25 dark:opacity-0"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(244,114,182,0.08) 40%, transparent 70%)" }}
        animate={{ scale: [1, 1.08, 1], x: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-0"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(252,211,77,0.08) 40%, transparent 70%)" }}
        animate={{ scale: [1, 1.12, 1], y: [0, -15, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

/** Animated section with intersection observer */
function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/** Single service card */
function ServiceCard({
  service,
  locale,
  categorySlug,
}: {
  service: ServiceItem;
  locale: Locale;
  categorySlug: string;
}) {
  const t = t_map[locale];
  const Icon = getCategoryIcon(categorySlug);
  const hasPrice = service.priceCents !== null && service.priceCents > 0;

  return (
    <motion.div
      variants={staggerItem}
      layout
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative flex flex-col rounded-2xl border border-pink-200/30 bg-white/85 p-5 shadow-md shadow-pink-100/10 backdrop-blur-sm transition-all duration-400 hover:border-pink-300/50 hover:shadow-xl hover:shadow-pink-200/20 dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none dark:hover:border-amber-500/15"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-50/30 via-transparent to-rose-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-amber-500/[0.04] dark:to-transparent" />

      <div className="relative flex-1">
        {/* Top row: icon + duration */}
        <div className="flex items-start justify-between mb-3">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }}
            transition={{ duration: 0.4 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-rose-50 border border-pink-200/30 dark:from-amber-500/15 dark:to-amber-600/5 dark:border-amber-500/10"
          >
            <Icon className="h-5 w-5 text-pink-600 dark:text-amber-400" />
          </motion.div>

          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{service.durationMin} {t.minutes}</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="font-playfair text-base font-semibold text-gray-900 dark:text-white mb-1.5 leading-snug">
          {service.name}
        </h3>

        {/* Description */}
        {service.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-2">
            {service.description}
          </p>
        )}
        {!service.description && <div className="mb-2" />}

        {/* Details link */}
        <Link
          href={localeHref(`/services?service=${service.id}`, locale)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors group/detail mb-3"
        >
          {t.details}
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover/detail:translate-x-0.5 group-hover/detail:-translate-y-0.5" />
        </Link>
      </div>

      {/* Bottom: price + book */}
      <div className="relative flex items-end justify-between pt-3 border-t border-pink-100/40 dark:border-white/5">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">
            {hasPrice ? "" : ""}
          </p>
          <p
            className={[
              "font-playfair font-bold",
              hasPrice
                ? "text-lg text-rose-700 dark:text-amber-300"
                : "text-sm text-gray-500 dark:text-gray-400 italic",
            ].join(" ")}
          >
            {formatPrice(service.priceCents, locale)}
          </p>
        </div>

        <Link
          href={localeHref(`/booking/services?preselect=${service.id}`, locale)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-pink-300/15 transition-all duration-300 hover:shadow-lg hover:shadow-pink-400/25 hover:scale-[1.03] dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/10"
        >
          {t.bookNow}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function PricesClient({ locale, categories }: Props) {
  const t = t_map[locale];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const totalServices = categories.reduce((acc, c) => acc + c.services.length, 0);

  const filteredCategories = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-pink-50/70 via-rose-50/30 to-amber-50/20 text-gray-900 dark:from-[#0a0a0f] dark:via-[#0f0f1a] dark:to-[#0a0a0f] dark:text-white">
      <FloatingParticles />

      {/* ═══════ HERO ═══════ */}
      <div ref={heroRef} className="relative pt-8 pb-4 sm:pt-12 sm:pb-8 overflow-hidden">
        <DecorativeBlobs />

        {/* Dark radials */}
        <div className="absolute inset-0 hidden dark:block">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(180,150,50,0.10)_0%,_transparent_60%)]" />
        </div>

        {/* Decorative floating icons — light */}
        <motion.div
          className="pointer-events-none absolute top-16 right-12 text-pink-300/20 dark:hidden"
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flower2 className="w-10 h-10" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute bottom-8 left-8 text-rose-300/15 dark:hidden"
          animate={{ y: [0, 8, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        >
          <Scissors className="w-8 h-8" />
        </motion.div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl px-4 text-center"
        >
          {/* Top line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-6 h-px w-20 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
          />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-pink-200/40 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 shadow-sm backdrop-blur mb-5 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-200"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <BadgeEuro className="h-4 w-4 text-pink-500 dark:text-amber-400" />
            </motion.span>
            {t.categoryCount(categories.length)} &middot; {t.servicesCount(totalServices)}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-playfair text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-rose-800 via-pink-700 to-amber-700 dark:from-amber-200 dark:via-amber-100 dark:to-amber-300/80"
          >
            {t.heroTitle}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-3 font-cormorant text-lg sm:text-xl text-rose-700/50 dark:text-amber-100/50 tracking-wide"
          >
            {t.heroSubtitle}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-4 max-w-2xl mx-auto text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            {t.heroDescription}
          </motion.p>

          {/* Bottom line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 h-px w-20 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
          />
        </motion.div>
      </div>

      {/* ═══════ CATEGORY FILTER ═══════ */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 mt-4 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3"
        >
          {/* All button */}
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveCategory(null)}
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
              activeCategory === null
                ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-300/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/15"
                : "border border-pink-200/40 bg-white/70 text-gray-700 shadow-sm hover:border-pink-300/60 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/20",
            ].join(" ")}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t.allCategories}
          </motion.button>

          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-300/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/15"
                    : "border border-pink-200/40 bg-white/70 text-gray-700 shadow-sm hover:border-pink-300/60 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/20",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.name}
                <span className={[
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  isActive
                    ? "bg-white/25 text-white dark:bg-gray-950/20 dark:text-gray-950"
                    : "bg-pink-100/60 text-pink-700 dark:bg-white/10 dark:text-gray-400",
                ].join(" ")}>
                  {cat.services.length}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* ═══════ SERVICE CATEGORIES & CARDS ═══════ */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory ?? "all"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            {filteredCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                locale={locale}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══════ CTA ═══════ */}
      <AnimatedSection className="relative pb-24 pt-8">
        {/* Glow — light */}
        <div className="absolute inset-0 flex items-center justify-center dark:hidden">
          <div className="w-[450px] h-[250px] rounded-full bg-gradient-to-r from-pink-200/25 via-rose-200/15 to-amber-200/25 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div variants={scaleIn} className="mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="mx-auto w-7 h-7 text-pink-500/40 dark:text-amber-400/30" />
            </motion.div>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="font-playfair text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-4"
          >
            {t.ctaTitle}
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="font-cormorant text-base sm:text-lg text-gray-600 dark:text-gray-300/60 leading-relaxed max-w-xl mx-auto mb-8"
          >
            {t.ctaText}
          </motion.p>

          <motion.div variants={fadeInUp}>
            <Link
              href={localeHref("/booking", locale)}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white font-cormorant text-lg tracking-wider transition-all duration-500 shadow-xl shadow-pink-400/20 hover:shadow-pink-500/35 hover:scale-[1.02] dark:from-amber-600/80 dark:to-amber-500/80 dark:hover:from-amber-500 dark:hover:to-amber-400 dark:shadow-amber-500/10 dark:hover:shadow-amber-500/20"
            >
              {t.ctaButton}
              <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-14 mx-auto h-px w-28 bg-gradient-to-r from-transparent via-pink-400/25 to-transparent dark:via-amber-400/20"
          />
        </div>
      </AnimatedSection>
    </main>
  );
}

/* ═══════════════════════ CATEGORY SECTION ═══════════════════════ */

function CategorySection({
  category,
  locale,
}: {
  category: Category;
  locale: Locale;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = getCategoryIcon(category.slug);

  return (
    <div ref={ref} className="mb-14 last:mb-0">
      {/* Category header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3 mb-6"
      >
        <motion.div
          whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.1 }}
          transition={{ duration: 0.4 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-200/60 to-rose-100/40 border border-pink-200/30 dark:from-amber-500/15 dark:to-amber-600/5 dark:border-amber-500/10"
        >
          <Icon className="h-5 w-5 text-pink-600 dark:text-amber-400" />
        </motion.div>
        <div>
          <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-gray-900 dark:text-amber-100/90">
            {category.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t_map[locale].servicesCount(category.services.length)}
          </p>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-pink-200/40 to-transparent dark:from-amber-500/10 ml-3" />
      </motion.div>

      {/* Service grid */}
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {category.services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            locale={locale}
            categorySlug={category.slug}
          />
        ))}
      </motion.div>
    </div>
  );
}


//------добавляем прямую ссылку на карточку услуги в каталоге, чтобы можно было открывать ее по клику на "Подробнее" в прайс-листе. Временное решение, пока не будет реализован полноценный каталог с фильтрацией и отдельными страницами для каждой
// // src/app/prices/PricesClient.tsx
// "use client";

// import { useState, useRef } from "react";
// import Link from "next/link";
// import {
//   motion,
//   useScroll,
//   useTransform,
//   useInView,
//   AnimatePresence,
//   type Variants,
// } from "framer-motion";
// import {
//   Sparkles,
//   Clock,
//   ChevronRight,
//   Eye,
//   Hand,
//   Star,
//   Footprints,
//   Gem,
//   Flower2,
//   Scissors,
//   Heart,
//   ArrowUpRight,
//   BadgeEuro,
// } from "lucide-react";
// import type { Locale } from "@/i18n/locales";

// /* ═══════════════════════ TYPES ═══════════════════════ */

// type ServiceItem = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   cover: string | null;
// };

// type Category = {
//   id: string;
//   slug: string;
//   name: string;
//   services: ServiceItem[];
// };

// type Props = {
//   locale: Locale;
//   categories: Category[];
// };

// /* ═══════════════════════ i18n ═══════════════════════ */

// const t_map: Record<
//   Locale,
//   {
//     heroTitle: string;
//     heroSubtitle: string;
//     heroDescription: string;
//     allCategories: string;
//     duration: string;
//     minutes: string;
//     onRequest: string;
//     bookNow: string;
//     ctaTitle: string;
//     ctaText: string;
//     ctaButton: string;
//     servicesCount: (n: number) => string;
//     categoryCount: (n: number) => string;
//   }
// > = {
//   de: {
//     heroTitle: "Preise & Leistungen",
//     heroSubtitle: "Transparente Preise, erstklassige Qualit\u00E4t",
//     heroDescription:
//       "Alle Behandlungen werden individuell auf Sie abgestimmt. Vereinbaren Sie ein unverbindliches Beratungsgespr\u00E4ch.",
//     allCategories: "Alle",
//     duration: "Dauer",
//     minutes: "Min.",
//     onRequest: "Auf Anfrage",
//     bookNow: "Buchen",
//     ctaTitle: "Bereit f\u00FCr Ihren Termin?",
//     ctaText:
//       "Vereinbaren Sie jetzt Ihren pers\u00F6nlichen Termin und erleben Sie professionelle Sch\u00F6nheitspflege in entspannter Atmosph\u00E4re.",
//     ctaButton: "Termin vereinbaren",
//     servicesCount: (n) =>
//       n === 1 ? "1 Leistung" : `${n} Leistungen`,
//     categoryCount: (n) =>
//       n === 1 ? "1 Kategorie" : `${n} Kategorien`,
//   },
//   en: {
//     heroTitle: "Prices & Services",
//     heroSubtitle: "Transparent prices, first-class quality",
//     heroDescription:
//       "All treatments are individually tailored to you. Book a complimentary, no-obligation consultation.",
//     allCategories: "All",
//     duration: "Duration",
//     minutes: "min",
//     onRequest: "On request",
//     bookNow: "Book",
//     ctaTitle: "Ready for your appointment?",
//     ctaText:
//       "Book your personal appointment now and experience professional beauty care in a relaxed atmosphere.",
//     ctaButton: "Book appointment",
//     servicesCount: (n) =>
//       n === 1 ? "1 service" : `${n} services`,
//     categoryCount: (n) =>
//       n === 1 ? "1 category" : `${n} categories`,
//   },
//   ru: {
//     heroTitle: "\u0426\u0435\u043D\u044B \u0438 \u0443\u0441\u043B\u0443\u0433\u0438",
//     heroSubtitle: "\u041F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u044B\u0435 \u0446\u0435\u043D\u044B, \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E",
//     heroDescription:
//       "\u0412\u0441\u0435 \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440\u044B \u043F\u043E\u0434\u0431\u0438\u0440\u0430\u044E\u0442\u0441\u044F \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E. \u0417\u0430\u043F\u0438\u0448\u0438\u0442\u0435\u0441\u044C \u043D\u0430 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0443\u044E \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044E \u0431\u0435\u0437 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432.",
//     allCategories: "\u0412\u0441\u0435",
//     duration: "\u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
//     minutes: "\u043C\u0438\u043D.",
//     onRequest: "\u041F\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0443",
//     bookNow: "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F",
//     ctaTitle: "\u0413\u043E\u0442\u043E\u0432\u044B \u043A \u0432\u0438\u0437\u0438\u0442\u0443?",
//     ctaText:
//       "\u0417\u0430\u043F\u0438\u0448\u0438\u0442\u0435\u0441\u044C \u043F\u0440\u044F\u043C\u043E \u0441\u0435\u0439\u0447\u0430\u0441 \u0438 \u043E\u0449\u0443\u0442\u0438\u0442\u0435 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0443\u0445\u043E\u0434 \u0432 \u0440\u0430\u0441\u0441\u043B\u0430\u0431\u043B\u0435\u043D\u043D\u043E\u0439 \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u0435.",
//     ctaButton: "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F",
//     servicesCount: (n) => {
//       if (n === 1) return "1 \u0443\u0441\u043B\u0443\u0433\u0430";
//       if (n >= 2 && n <= 4) return `${n} \u0443\u0441\u043B\u0443\u0433\u0438`;
//       return `${n} \u0443\u0441\u043B\u0443\u0433`;
//     },
//     categoryCount: (n) => {
//       if (n === 1) return "1 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F";
//       if (n >= 2 && n <= 4) return `${n} \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438`;
//       return `${n} \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439`;
//     },
//   },
// };

// /* ═══════════════════════ helpers ═══════════════════════ */

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   const hasQuery = path.includes("?");
//   return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
// }

// function formatPrice(cents: number | null, locale: Locale): string {
//   if (!cents) return t_map[locale].onRequest;
//   const eur = cents / 100;
//   return new Intl.NumberFormat(
//     locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-GB",
//     { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 2 },
//   ).format(eur);
// }

// /* Map category slugs to Lucide icons */
// const CATEGORY_ICONS: Record<string, React.ElementType> = {
//   "permanent-make-up": Eye,
//   microneedling: Sparkles,
//   nageldesign: Hand,
//   "nail-design": Hand,
//   wimpernverlangerung: Star,
//   "eyelash-extensions": Star,
//   fusspflege: Footprints,
//   "foot-care": Footprints,
// };

// function getCategoryIcon(slug: string): React.ElementType {
//   const lower = slug.toLowerCase();
//   for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
//     if (lower.includes(key)) return icon;
//   }
//   return Gem;
// }

// /* ═══════════════════════ animation variants ═══════════════════════ */

// const fadeInUp: Variants = {
//   hidden: { opacity: 0, y: 35 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
// };

// const staggerContainer: Variants = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
// };

// const staggerItem: Variants = {
//   hidden: { opacity: 0, y: 25, scale: 0.97 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
//   },
// };

// const scaleIn: Variants = {
//   hidden: { opacity: 0, scale: 0.85 },
//   visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
// };

// /* ═══════════════════════ sub-components ═══════════════════════ */

// /** Floating background particles (deterministic) */
// const PARTICLES = [
//   { w: 3.5, h: 4.2, x: 8, y: 12, dy: -40, dx: 5, dur: 9, del: 0.3 },
//   { w: 2.8, h: 3.1, x: 28, y: 25, dy: -50, dx: -7, dur: 11, del: 1.5 },
//   { w: 4.6, h: 2.4, x: 55, y: 8, dy: -35, dx: 4, dur: 8, del: 2.2 },
//   { w: 3.2, h: 5.0, x: 78, y: 32, dy: -55, dx: -3, dur: 12, del: 0.9 },
//   { w: 2.5, h: 3.8, x: 92, y: 55, dy: -42, dx: 6, dur: 7, del: 3.1 },
//   { w: 4.0, h: 2.9, x: 42, y: 70, dy: -48, dx: -5, dur: 10, del: 1.8 },
//   { w: 3.8, h: 3.5, x: 15, y: 60, dy: -38, dx: 8, dur: 9, del: 4.0 },
//   { w: 2.2, h: 4.5, x: 65, y: 42, dy: -60, dx: -4, dur: 13, del: 0.6 },
//   { w: 5.0, h: 2.7, x: 50, y: 85, dy: -45, dx: 3, dur: 8, del: 2.7 },
//   { w: 3.0, h: 3.3, x: 85, y: 15, dy: -52, dx: -6, dur: 11, del: 1.2 },
// ];

// function FloatingParticles() {
//   return (
//     <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
//       {PARTICLES.map((p, i) => (
//         <motion.div
//           key={i}
//           className="absolute rounded-full bg-pink-400/10 dark:bg-amber-400/8"
//           style={{ width: p.w, height: p.h, left: `${p.x}%`, top: `${p.y}%` }}
//           animate={{ y: [0, p.dy, 0], x: [0, p.dx, 0], opacity: [0.08, 0.3, 0.08] }}
//           transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.del }}
//         />
//       ))}
//     </div>
//   );
// }

// function DecorativeBlobs() {
//   return (
//     <>
//       <motion.div
//         className="pointer-events-none absolute -top-40 -right-40 w-[550px] h-[550px] rounded-full opacity-25 dark:opacity-0"
//         style={{ background: "radial-gradient(circle, rgba(236,72,153,0.25) 0%, rgba(244,114,182,0.08) 40%, transparent 70%)" }}
//         animate={{ scale: [1, 1.08, 1], x: [0, 12, 0] }}
//         transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="pointer-events-none absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-0"
//         style={{ background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(252,211,77,0.08) 40%, transparent 70%)" }}
//         animate={{ scale: [1, 1.12, 1], y: [0, -15, 0] }}
//         transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
//       />
//     </>
//   );
// }

// /** Animated section with intersection observer */
// function AnimatedSection({
//   children,
//   className = "",
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-60px" });
//   return (
//     <motion.section
//       ref={ref}
//       initial="hidden"
//       animate={isInView ? "visible" : "hidden"}
//       variants={staggerContainer}
//       className={className}
//     >
//       {children}
//     </motion.section>
//   );
// }

// /** Single service card */
// function ServiceCard({
//   service,
//   locale,
//   categorySlug,
// }: {
//   service: ServiceItem;
//   locale: Locale;
//   categorySlug: string;
// }) {
//   const t = t_map[locale];
//   const Icon = getCategoryIcon(categorySlug);
//   const hasPrice = service.priceCents !== null && service.priceCents > 0;

//   return (
//     <motion.div
//       variants={staggerItem}
//       layout
//       whileHover={{ y: -6, transition: { duration: 0.25 } }}
//       className="group relative flex flex-col rounded-2xl border border-pink-200/30 bg-white/85 p-5 shadow-md shadow-pink-100/10 backdrop-blur-sm transition-all duration-400 hover:border-pink-300/50 hover:shadow-xl hover:shadow-pink-200/20 dark:border-white/[0.06] dark:bg-white/[0.03] dark:shadow-none dark:hover:border-amber-500/15"
//     >
//       {/* Hover glow */}
//       <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-50/30 via-transparent to-rose-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-amber-500/[0.04] dark:to-transparent" />

//       <div className="relative flex-1">
//         {/* Top row: icon + duration */}
//         <div className="flex items-start justify-between mb-3">
//           <motion.div
//             whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }}
//             transition={{ duration: 0.4 }}
//             className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-rose-50 border border-pink-200/30 dark:from-amber-500/15 dark:to-amber-600/5 dark:border-amber-500/10"
//           >
//             <Icon className="h-5 w-5 text-pink-600 dark:text-amber-400" />
//           </motion.div>

//           <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
//             <Clock className="h-3.5 w-3.5" />
//             <span>{service.durationMin} {t.minutes}</span>
//           </div>
//         </div>

//         {/* Name */}
//         <h3 className="font-playfair text-base font-semibold text-gray-900 dark:text-white mb-1.5 leading-snug">
//           {service.name}
//         </h3>

//         {/* Description */}
//         {service.description && (
//           <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
//             {service.description}
//           </p>
//         )}
//         {!service.description && <div className="mb-4" />}
//       </div>

//       {/* Bottom: price + book */}
//       <div className="relative flex items-end justify-between pt-3 border-t border-pink-100/40 dark:border-white/5">
//         <div>
//           <p className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">
//             {hasPrice ? "" : ""}
//           </p>
//           <p
//             className={[
//               "font-playfair font-bold",
//               hasPrice
//                 ? "text-lg text-rose-700 dark:text-amber-300"
//                 : "text-sm text-gray-500 dark:text-gray-400 italic",
//             ].join(" ")}
//           >
//             {formatPrice(service.priceCents, locale)}
//           </p>
//         </div>

//         <Link
//           href={localeHref("/booking", locale)}
//           className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-pink-300/15 transition-all duration-300 hover:shadow-lg hover:shadow-pink-400/25 hover:scale-[1.03] dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/10"
//         >
//           {t.bookNow}
//           <ChevronRight className="h-3.5 w-3.5" />
//         </Link>
//       </div>
//     </motion.div>
//   );
// }

// /* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

// export default function PricesClient({ locale, categories }: Props) {
//   const t = t_map[locale];
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);

//   const heroRef = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({
//     target: heroRef,
//     offset: ["start start", "end start"],
//   });
//   const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
//   const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

//   const totalServices = categories.reduce((acc, c) => acc + c.services.length, 0);

//   const filteredCategories = activeCategory
//     ? categories.filter((c) => c.id === activeCategory)
//     : categories;

//   return (
//     <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-pink-50/70 via-rose-50/30 to-amber-50/20 text-gray-900 dark:from-[#0a0a0f] dark:via-[#0f0f1a] dark:to-[#0a0a0f] dark:text-white">
//       <FloatingParticles />

//       {/* ═══════ HERO ═══════ */}
//       <div ref={heroRef} className="relative pt-8 pb-4 sm:pt-12 sm:pb-8 overflow-hidden">
//         <DecorativeBlobs />

//         {/* Dark radials */}
//         <div className="absolute inset-0 hidden dark:block">
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(180,150,50,0.10)_0%,_transparent_60%)]" />
//         </div>

//         {/* Decorative floating icons — light */}
//         <motion.div
//           className="pointer-events-none absolute top-16 right-12 text-pink-300/20 dark:hidden"
//           animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
//           transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
//         >
//           <Flower2 className="w-10 h-10" />
//         </motion.div>
//         <motion.div
//           className="pointer-events-none absolute bottom-8 left-8 text-rose-300/15 dark:hidden"
//           animate={{ y: [0, 8, 0], rotate: [0, -8, 0] }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
//         >
//           <Scissors className="w-8 h-8" />
//         </motion.div>

//         <motion.div
//           style={{ y: heroY, opacity: heroOpacity }}
//           className="relative z-10 mx-auto max-w-5xl px-4 text-center"
//         >
//           {/* Top line */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
//             className="mx-auto mb-6 h-px w-20 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
//           />

//           {/* Badge */}
//           <motion.div
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.1 }}
//             className="inline-flex items-center gap-2 rounded-full border border-pink-200/40 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 shadow-sm backdrop-blur mb-5 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-200"
//           >
//             <motion.span
//               animate={{ rotate: [0, 15, -15, 0] }}
//               transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
//             >
//               <BadgeEuro className="h-4 w-4 text-pink-500 dark:text-amber-400" />
//             </motion.span>
//             {t.categoryCount(categories.length)} &middot; {t.servicesCount(totalServices)}
//           </motion.div>

//           {/* Title */}
//           <motion.h1
//             initial={{ opacity: 0, y: 25 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
//             className="font-playfair text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-rose-800 via-pink-700 to-amber-700 dark:from-amber-200 dark:via-amber-100 dark:to-amber-300/80"
//           >
//             {t.heroTitle}
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.4 }}
//             className="mt-3 font-cormorant text-lg sm:text-xl text-rose-700/50 dark:text-amber-100/50 tracking-wide"
//           >
//             {t.heroSubtitle}
//           </motion.p>

//           {/* Description */}
//           <motion.p
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.55 }}
//             className="mt-4 max-w-2xl mx-auto text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
//           >
//             {t.heroDescription}
//           </motion.p>

//           {/* Bottom line */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
//             className="mx-auto mt-8 h-px w-20 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
//           />
//         </motion.div>
//       </div>

//       {/* ═══════ CATEGORY FILTER ═══════ */}
//       <div className="relative z-10 mx-auto max-w-6xl px-4 mt-4 mb-10">
//         <motion.div
//           initial={{ opacity: 0, y: 15 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.6 }}
//           className="flex flex-wrap justify-center gap-2 sm:gap-3"
//         >
//           {/* All button */}
//           <motion.button
//             whileHover={{ scale: 1.04, y: -2 }}
//             whileTap={{ scale: 0.97 }}
//             onClick={() => setActiveCategory(null)}
//             className={[
//               "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
//               activeCategory === null
//                 ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-300/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/15"
//                 : "border border-pink-200/40 bg-white/70 text-gray-700 shadow-sm hover:border-pink-300/60 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/20",
//             ].join(" ")}
//           >
//             <Sparkles className="h-3.5 w-3.5" />
//             {t.allCategories}
//           </motion.button>

//           {categories.map((cat) => {
//             const Icon = getCategoryIcon(cat.slug);
//             const isActive = activeCategory === cat.id;
//             return (
//               <motion.button
//                 key={cat.id}
//                 whileHover={{ scale: 1.04, y: -2 }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => setActiveCategory(isActive ? null : cat.id)}
//                 className={[
//                   "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
//                   isActive
//                     ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-300/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/15"
//                     : "border border-pink-200/40 bg-white/70 text-gray-700 shadow-sm hover:border-pink-300/60 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/20",
//                 ].join(" ")}
//               >
//                 <Icon className="h-3.5 w-3.5" />
//                 {cat.name}
//                 <span className={[
//                   "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
//                   isActive
//                     ? "bg-white/25 text-white dark:bg-gray-950/20 dark:text-gray-950"
//                     : "bg-pink-100/60 text-pink-700 dark:bg-white/10 dark:text-gray-400",
//                 ].join(" ")}>
//                   {cat.services.length}
//                 </span>
//               </motion.button>
//             );
//           })}
//         </motion.div>
//       </div>

//       {/* ═══════ SERVICE CATEGORIES & CARDS ═══════ */}
//       <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={activeCategory ?? "all"}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -15 }}
//             transition={{ duration: 0.35 }}
//           >
//             {filteredCategories.map((category) => (
//               <CategorySection
//                 key={category.id}
//                 category={category}
//                 locale={locale}
//               />
//             ))}
//           </motion.div>
//         </AnimatePresence>
//       </div>

//       {/* ═══════ CTA ═══════ */}
//       <AnimatedSection className="relative pb-24 pt-8">
//         {/* Glow — light */}
//         <div className="absolute inset-0 flex items-center justify-center dark:hidden">
//           <div className="w-[450px] h-[250px] rounded-full bg-gradient-to-r from-pink-200/25 via-rose-200/15 to-amber-200/25 blur-3xl" />
//         </div>

//         <div className="relative max-w-3xl mx-auto px-4 text-center">
//           <motion.div variants={scaleIn} className="mb-6">
//             <motion.div
//               animate={{ rotate: [0, 10, -10, 0] }}
//               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
//             >
//               <Heart className="mx-auto w-7 h-7 text-pink-500/40 dark:text-amber-400/30" />
//             </motion.div>
//           </motion.div>

//           <motion.h2
//             variants={fadeInUp}
//             className="font-playfair text-2xl sm:text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-4"
//           >
//             {t.ctaTitle}
//           </motion.h2>

//           <motion.p
//             variants={fadeInUp}
//             className="font-cormorant text-base sm:text-lg text-gray-600 dark:text-gray-300/60 leading-relaxed max-w-xl mx-auto mb-8"
//           >
//             {t.ctaText}
//           </motion.p>

//           <motion.div variants={fadeInUp}>
//             <Link
//               href={localeHref("/booking", locale)}
//               className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white font-cormorant text-lg tracking-wider transition-all duration-500 shadow-xl shadow-pink-400/20 hover:shadow-pink-500/35 hover:scale-[1.02] dark:from-amber-600/80 dark:to-amber-500/80 dark:hover:from-amber-500 dark:hover:to-amber-400 dark:shadow-amber-500/10 dark:hover:shadow-amber-500/20"
//             >
//               {t.ctaButton}
//               <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
//             </Link>
//           </motion.div>

//           <motion.div
//             variants={fadeInUp}
//             className="mt-14 mx-auto h-px w-28 bg-gradient-to-r from-transparent via-pink-400/25 to-transparent dark:via-amber-400/20"
//           />
//         </div>
//       </AnimatedSection>
//     </main>
//   );
// }

// /* ═══════════════════════ CATEGORY SECTION ═══════════════════════ */

// function CategorySection({
//   category,
//   locale,
// }: {
//   category: Category;
//   locale: Locale;
// }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-50px" });
//   const Icon = getCategoryIcon(category.slug);

//   return (
//     <div ref={ref} className="mb-14 last:mb-0">
//       {/* Category header */}
//       <motion.div
//         initial={{ opacity: 0, x: -20 }}
//         animate={isInView ? { opacity: 1, x: 0 } : {}}
//         transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
//         className="flex items-center gap-3 mb-6"
//       >
//         <motion.div
//           whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.1 }}
//           transition={{ duration: 0.4 }}
//           className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-200/60 to-rose-100/40 border border-pink-200/30 dark:from-amber-500/15 dark:to-amber-600/5 dark:border-amber-500/10"
//         >
//           <Icon className="h-5 w-5 text-pink-600 dark:text-amber-400" />
//         </motion.div>
//         <div>
//           <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-gray-900 dark:text-amber-100/90">
//             {category.name}
//           </h2>
//           <p className="text-xs text-gray-500 dark:text-gray-400">
//             {t_map[locale].servicesCount(category.services.length)}
//           </p>
//         </div>
//         <div className="flex-1 h-px bg-gradient-to-r from-pink-200/40 to-transparent dark:from-amber-500/10 ml-3" />
//       </motion.div>

//       {/* Service grid */}
//       <motion.div
//         initial="hidden"
//         animate={isInView ? "visible" : "hidden"}
//         variants={staggerContainer}
//         className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
//       >
//         {category.services.map((service) => (
//           <ServiceCard
//             key={service.id}
//             service={service}
//             locale={locale}
//             categorySlug={category.slug}
//           />
//         ))}
//       </motion.div>
//     </div>
//   );
// }