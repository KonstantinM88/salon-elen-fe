// src/app/services/ServicesClient.tsx
"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  ChevronRight,
  Scissors,
  Palette,
  Heart,
  Star,
  ArrowRight,
  Images,
  Flower2,
} from "lucide-react";

type GalleryItem = { id: string; image: string; caption: string | null };

type ServiceChild = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number | null;
  durationMin: number;
  cover: string | null;
  gallery: GalleryItem[];
};

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover: string | null;
  gallery: GalleryItem[];
  children: ServiceChild[];
};

type Props = { categories: Category[]; locale: string };

type GalleryLightboxProps = {
  images: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  serviceName: string;
};

type ServiceDetailModalProps = {
  service: ServiceChild;
  categoryName: string;
  onClose: () => void;
  onOpenGallery: (index: number) => void;
  translations: Record<string, string>;
  locale: string;
};

const GalleryLightbox = dynamic<GalleryLightboxProps>(
  () => import("./GalleryLightbox"),
  { ssr: false },
);

const ServiceDetailModal = dynamic<ServiceDetailModalProps>(
  () => import("./ServiceDetailModal"),
  { ssr: false },
);

const t: Record<string, Record<string, string>> = {
  de: {
    title: "Unsere Leistungen",
    subtitle: "Verwöhnen Sie sich mit Premium-Schönheitspflege",
    bookNow: "Termin buchen",
    from: "ab",
    minutes: "Min.",
    noServices: "Keine Dienstleistungen verfügbar",
    allCategories: "Alle",
    photos: "Fotos",
    close: "Schließen",
    ourWorks: "Unsere Arbeiten",
    services: "Leistungen",
    trustText: "Vertrauen Sie uns Ihre Schönheit an",
    welcomeText: "Willkommen in unserem Salon",
  },
  ru: {
    title: "Наши услуги",
    subtitle: "Побалуйте себя премиальным уходом за красотой",
    bookNow: "Записаться",
    from: "от",
    minutes: "мин.",
    noServices: "Услуги не найдены",
    allCategories: "Все",
    photos: "фото",
    close: "Закрыть",
    ourWorks: "Наши работы",
    services: "услуг",
    trustText: "Доверьте нам вашу красоту",
    welcomeText: "Добро пожаловать в наш салон",
  },
  en: {
    title: "Our Services",
    subtitle: "Indulge yourself with premium beauty care",
    bookNow: "Book Now",
    from: "from",
    minutes: "min.",
    noServices: "No services available",
    allCategories: "All",
    photos: "photos",
    close: "Close",
    ourWorks: "Our Works",
    services: "services",
    trustText: "Trust us with your beauty",
    welcomeText: "Welcome to our salon",
  },
};

const categoryIcons: Record<string, typeof Scissors> = {
  haircut: Scissors,
  haare: Scissors,
  hair: Scissors,
  frisur: Scissors,
  manicure: Palette,
  nails: Palette,
  nagel: Palette,
  makeup: Heart,
  kosmetik: Heart,
  brows: Star,
  lashes: Star,
  permanent: Star,
  default: Flower2,
};

function getCategoryIcon(slug: string) {
  const key = Object.keys(categoryIcons).find((k) =>
    slug.toLowerCase().includes(k),
  );
  return categoryIcons[key || "default"];
}

function formatPrice(cents: number | null, locale: string) {
  if (!cents) return null;
  return new Intl.NumberFormat(
    locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US",
    {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    },
  ).format(cents / 100);
}

const cardGradients = [
  "from-rose-300/50 via-pink-200/50 to-rose-100/50",
  "from-amber-200/50 via-orange-100/50 to-yellow-100/50",
  "from-violet-300/50 via-purple-200/50 to-pink-100/50",
  "from-sky-200/50 via-cyan-100/50 to-teal-100/50",
  "from-emerald-200/50 via-teal-100/50 to-cyan-100/50",
];

// ====== КРАСИВЫЙ АНИМИРОВАННЫЙ ФОН ======
function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-200/90 via-pink-100/80 to-amber-100/70 dark:from-[#080812] dark:via-[#0b0b16] dark:to-[#121227]" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-rose-100/30 dark:from-transparent dark:to-transparent" />

      <motion.div
        className="absolute -top-32 -left-32 h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(251,182,206,0.7) 0%, rgba(251,207,232,0.4) 40%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.5, 0.7] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 -right-32 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(254,202,155,0.6) 0%, rgba(254,215,170,0.3) 40%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.35, 0.6] }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute -bottom-20 left-1/3 h-[450px] w-[450px] sm:h-[650px] sm:w-[650px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(216,180,254,0.5) 0%, rgba(196,181,253,0.25) 40%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {[...Array(35)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: `${(i * 2.9) % 100}%`, top: `${(i * 3.1) % 95}%` }}
          animate={{
            y: [0, -35, 0],
            x: [0, i % 2 === 0 ? 18 : -18, 0],
            rotate: [0, i % 2 === 0 ? 20 : -20, 0],
            opacity: [0.35, 0.75, 0.35],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 6 + (i % 5) * 1.5,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        >
          {i % 4 === 0 ? (
            <Heart
              className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400/80 dark:text-rose-300/25 drop-shadow-sm"
              fill="currentColor"
            />
          ) : i % 4 === 1 ? (
            <Heart
              className="h-3 w-3 sm:h-4 sm:w-4 text-pink-400/70 dark:text-pink-300/20 drop-shadow-sm"
              fill="currentColor"
            />
          ) : i % 4 === 2 ? (
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400/70 dark:text-amber-300/20" />
          ) : (
            <Star
              className="h-3 w-3 sm:h-4 sm:w-4 text-rose-300/60 dark:text-rose-300/15"
              fill="currentColor"
            />
          )}
        </motion.div>
      ))}

      <svg
        className="absolute bottom-0 left-0 w-full h-32 sm:h-48 opacity-20 dark:opacity-10"
        preserveAspectRatio="none"
        viewBox="0 0 1440 120"
      >
        <motion.path
          fill="url(#wave-fill)"
          animate={{
            d: [
              "M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,120 L0,120 Z",
              "M0,40 C360,80 720,40 1080,80 C1260,60 1380,80 1440,40 L1440,120 L0,120 Z",
              "M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,120 L0,120 Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="wave-fill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f9a8d4" />
            <stop offset="50%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

function ServiceCard({
  service,
  categoryName,
  index,
  onOpenDetail,
  onOpenGallery,
  translations,
  locale,
  isPriority,
}: {
  service: ServiceChild;
  categoryName: string;
  index: number;
  onOpenDetail: () => void;
  onOpenGallery: (index: number) => void;
  translations: Record<string, string>;
  locale: string;
  isPriority?: boolean;
}) {
  const hasImage = service.cover || service.gallery.length > 0;
  const imageUrl = service.cover || service.gallery[0]?.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="group"
    >
      <div
        onClick={onOpenDetail}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer bg-white dark:bg-zinc-900/80 border-2 border-rose-200/70 dark:border-white/10 shadow-[0_8px_30px_-12px_rgba(244,63,94,0.25)] dark:shadow-[0_18px_55px_-28px_rgba(0,0,0,0.75)] hover:shadow-[0_20px_50px_-15px_rgba(244,63,94,0.35)] dark:hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.85)] hover:border-rose-300 dark:hover:border-white/20 transition-all duration-500 sm:active:scale-[0.98] sm:hover:-translate-y-2"
      >
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rotate-45" />
        </div>
        <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden bg-white dark:bg-zinc-950">
          {hasImage ? (
            <Image
              src={imageUrl!}
              alt={service.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={isPriority}
              loading={isPriority ? "eager" : "lazy"}
              fetchPriority={isPriority ? "high" : "auto"}
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Flower2 className="w-16 h-16 text-rose-300/70 dark:text-rose-200/20" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-zinc-900 dark:via-zinc-900/40" />
          {service.priceCents && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-bold shadow-lg border border-rose-200/50 dark:border-white/10">
                {translations.from} {formatPrice(service.priceCents, locale)}
              </span>
            </div>
          )}
          {service.gallery.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenGallery(0);
              }}
              className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm flex items-center gap-1.5 text-rose-500 dark:text-rose-200 text-xs hover:bg-rose-50 dark:hover:bg-white/15 transition-colors shadow-lg border border-rose-200/50 dark:border-white/10"
            >
              <Images className="w-3.5 h-3.5" />
              {service.gallery.length}
            </button>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-medium backdrop-blur-sm shadow-md">
              <Heart className="h-2.5 w-2.5" fill="currentColor" />
              {categoryName}
            </span>
          </div>
        </div>
        {/* НИЖНЯЯ ЧАСТЬ С АНИМИРОВАННЫМИ СЕРДЕЧКАМИ */}
        <div className="relative overflow-hidden p-4 sm:p-5 bg-gradient-to-b from-transparent to-rose-50/30 dark:from-rose-950/80 dark:via-slate-950/90 dark:to-purple-950/80">
          {/* Анимированные сердечки для светлой темы */}
          <div className="absolute inset-0 pointer-events-none dark:hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`light-heart-${i}`}
                className="absolute"
                style={{
                  left: `${(i * 20) % 100}%`,
                  top: `${(i * 22) % 100}%`,
                }}
                animate={{ y: [0, -12, 0], x: [0, i % 2 === 0 ? 6 : -6, 0] }}
                transition={{
                  duration: 7 + (i % 3) * 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeInOut",
                }}
              >
                <Heart
                  className={`${i % 2 === 0 ? "w-3.5 h-3.5" : "w-3 h-3"} text-rose-400/60 drop-shadow-[0_1px_6px_rgba(244,63,94,0.25)]`}
                  fill="currentColor"
                />
              </motion.div>
            ))}
          </div>
          {/* Анимированные сердечки для тёмной темы */}
          <div className="absolute inset-0 pointer-events-none hidden dark:block">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`dark-heart-${i}`}
                className="absolute"
                style={{
                  left: `${(i * 20) % 100}%`,
                  top: `${(i * 22) % 100}%`,
                }}
                animate={{ y: [0, -10, 0], x: [0, i % 2 === 0 ? 5 : -5, 0] }}
                transition={{
                  duration: 8 + (i % 3) * 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeInOut",
                }}
              >
                <Heart
                  className={`${i % 2 === 0 ? "w-2.5 h-2.5" : "w-2 h-2"} text-rose-400/25`}
                  fill="currentColor"
                />
              </motion.div>
            ))}
          </div>
          <div className="relative z-10">
            <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors font-playfair">
              {service.name}
            </h3>
            {service.description && (
              <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">
                {service.description}
              </p>
            )}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm">
                <Clock className="w-3.5 h-3.5 text-rose-400 dark:text-rose-300" />
                {service.durationMin} {translations.minutes}
              </span>
            </div>
            <Link
              href={`/booking?service=${service.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-rose-300/40"
            >
              {translations.bookNow}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ServicesClient({ categories, locale }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<{
    service: ServiceChild;
    categoryName: string;
  } | null>(null);
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    images: GalleryItem[];
    currentIndex: number;
    serviceName: string;
  } | null>(null);
  const translations = t[locale] || t.de;

  const openServiceDetail = useCallback(
    (service: ServiceChild, categoryName: string) =>
      setSelectedService({ service, categoryName }),
    [],
  );
  const openLightbox = useCallback(
    (images: GalleryItem[], index: number, serviceName: string) =>
      setLightbox({ isOpen: true, images, currentIndex: index, serviceName }),
    [],
  );
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const goToPrev = useCallback(() => {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      currentIndex:
        lightbox.currentIndex === 0
          ? lightbox.images.length - 1
          : lightbox.currentIndex - 1,
    });
  }, [lightbox]);
  const goToNext = useCallback(() => {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length,
    });
  }, [lightbox]);

  const filteredCategories = categories.filter(
    (cat) => !activeCategory || cat.id === activeCategory,
  );
  let globalServiceIndex = 0;

  return (
    <main className="relative min-h-screen overflow-hidden isolate">
      <PageBackground />
      <div className="relative z-10">
        <AnimatePresence>
          {lightbox?.isOpen && (
            <GalleryLightbox
              images={lightbox.images}
              currentIndex={lightbox.currentIndex}
              onClose={closeLightbox}
              onPrev={goToPrev}
              onNext={goToNext}
              serviceName={lightbox.serviceName}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selectedService && (
            <ServiceDetailModal
              service={selectedService.service}
              categoryName={selectedService.categoryName}
              onClose={() => setSelectedService(null)}
              onOpenGallery={(index) =>
                openLightbox(
                  selectedService.service.gallery,
                  index,
                  selectedService.service.name,
                )
              }
              translations={translations}
              locale={locale}
            />
          )}
        </AnimatePresence>

        <section className="relative pt-8 pb-6 sm:pt-16 sm:pb-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur border border-rose-200 dark:border-white/10 shadow-lg shadow-rose-200/30 mb-4 sm:mb-6"
              >
                <Sparkles className="w-4 h-4 text-rose-500 dark:text-rose-200" />
                <span className="text-sm font-medium text-rose-600 dark:text-rose-200">
                  Premium Beauty Salon
                </span>
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5 font-playfair">
                <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent drop-shadow-sm">
                  {translations.title}
                </span>
              </h1>
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
                <Heart
                  className="w-5 h-5 text-rose-500 dark:text-rose-300"
                  fill="currentColor"
                />
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
              </div>
              <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-200/90 mb-6 sm:mb-8 px-4 font-cormorant font-medium">
                {translations.subtitle}
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-full text-white font-semibold text-sm sm:text-base shadow-xl shadow-rose-300/50 transition-all active:scale-95 hover:scale-105"
              >
                {translations.bookNow}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="sticky top-16 z-40">
          <div className="bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl border-y border-rose-200/50 dark:border-white/10">
            <div className="container mx-auto px-4">
              <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeCategory === null ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40" : "bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-white/12 border border-rose-200 dark:border-white/10"}`}
                >
                  {translations.allCategories}
                </button>
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.slug);
                  return (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setActiveCategory(
                          cat.id === activeCategory ? null : cat.id,
                        )
                      }
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeCategory === cat.id ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40" : "bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-white/12 border border-rose-200 dark:border-white/10"}`}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="whitespace-nowrap">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          className="py-8 sm:py-12 lg:py-16 relative"
          style={{ contentVisibility: "auto", containIntrinsicSize: "1px 1200px" }}
        >
          <div className="container mx-auto px-4">
            {filteredCategories.map((category, catIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: catIndex * 0.08 }}
                className="mb-12 sm:mb-16 last:mb-0"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-white/7 border border-rose-200 dark:border-white/10 shadow-lg shadow-rose-200/20 backdrop-blur">
                    {(() => {
                      const Icon = getCategoryIcon(category.slug);
                      return (
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 dark:text-rose-200" />
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100 truncate font-playfair">
                      {category.name}
                    </h2>
                    <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-300">
                      {category.children.length} {translations.services}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {category.children.map((service, index) => {
                    const currentGlobalIndex = globalServiceIndex++;
                    return (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        categoryName={category.name}
                        index={index}
                        onOpenDetail={() =>
                          openServiceDetail(service, category.name)
                        }
                        onOpenGallery={(idx) =>
                          openLightbox(service.gallery, idx, service.name)
                        }
                        translations={translations}
                        locale={locale}
                        isPriority={currentGlobalIndex < 3}
                      />
                    );
                  })}
                </div>
              </motion.div>
            ))}
            {categories.length === 0 && (
              <div className="text-center py-16 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white dark:bg-white/8 flex items-center justify-center border border-rose-200 dark:border-white/10 shadow-lg">
                  <Flower2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 dark:text-rose-200" />
                </div>
                <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-300">
                  {translations.noServices}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-100/70 via-pink-50/70 to-amber-50/70 dark:from-black/25 dark:via-black/20 dark:to-black/25" />
          <div className="relative container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-3">
                  <Heart
                    className="w-4 h-4 text-rose-400"
                    fill="currentColor"
                  />
                  <div className="w-10 h-px bg-gradient-to-r from-rose-400 to-transparent" />
                  <Heart
                    className="w-5 h-5 text-rose-500 dark:text-rose-300"
                    fill="currentColor"
                  />
                  <div className="w-10 h-px bg-gradient-to-l from-rose-400 to-transparent" />
                  <Heart
                    className="w-4 h-4 text-rose-400"
                    fill="currentColor"
                  />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 sm:mb-4 font-playfair">
                {translations.trustText}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-200 mb-6 sm:mb-8 max-w-md mx-auto font-cormorant font-medium">
                {translations.welcomeText}
              </p>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-rose-300/50 transition-all active:scale-95 hover:scale-105"
              >
                {translations.bookNow}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}




//-------пробую дробить файлы для улучшения скорости загрузки страницы с этим файлом 74-79--------
// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback, memo } from "react";
// import { createPortal } from "react-dom";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Sparkles,
//   Clock,
//   ChevronRight,
//   ChevronLeft,
//   Scissors,
//   Palette,
//   Heart,
//   Star,
//   ArrowRight,
//   X,
//   Images,
//   ZoomIn,
//   Euro,
//   Calendar,
//   Flower2,
// } from "lucide-react";

// type GalleryItem = { id: string; image: string; caption: string | null };

// type ServiceChild = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   priceCents: number | null;
//   durationMin: number;
//   cover: string | null;
//   gallery: GalleryItem[];
// };

// type Category = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   cover: string | null;
//   gallery: GalleryItem[];
//   children: ServiceChild[];
// };

// type Props = { categories: Category[]; locale: string };

// const t: Record<string, Record<string, string>> = {
//   de: {
//     title: "Unsere Leistungen",
//     subtitle: "Verwöhnen Sie sich mit Premium-Schönheitspflege",
//     bookNow: "Termin buchen",
//     from: "ab",
//     minutes: "Min.",
//     noServices: "Keine Dienstleistungen verfügbar",
//     allCategories: "Alle",
//     photos: "Fotos",
//     close: "Schließen",
//     ourWorks: "Unsere Arbeiten",
//     services: "Leistungen",
//     trustText: "Vertrauen Sie uns Ihre Schönheit an",
//     welcomeText: "Willkommen in unserem Salon",
//   },
//   ru: {
//     title: "Наши услуги",
//     subtitle: "Побалуйте себя премиальным уходом за красотой",
//     bookNow: "Записаться",
//     from: "от",
//     minutes: "мин.",
//     noServices: "Услуги не найдены",
//     allCategories: "Все",
//     photos: "фото",
//     close: "Закрыть",
//     ourWorks: "Наши работы",
//     services: "услуг",
//     trustText: "Доверьте нам вашу красоту",
//     welcomeText: "Добро пожаловать в наш салон",
//   },
//   en: {
//     title: "Our Services",
//     subtitle: "Indulge yourself with premium beauty care",
//     bookNow: "Book Now",
//     from: "from",
//     minutes: "min.",
//     noServices: "No services available",
//     allCategories: "All",
//     photos: "photos",
//     close: "Close",
//     ourWorks: "Our Works",
//     services: "services",
//     trustText: "Trust us with your beauty",
//     welcomeText: "Welcome to our salon",
//   },
// };

// const categoryIcons: Record<string, typeof Scissors> = {
//   haircut: Scissors,
//   haare: Scissors,
//   hair: Scissors,
//   frisur: Scissors,
//   manicure: Palette,
//   nails: Palette,
//   nagel: Palette,
//   makeup: Heart,
//   kosmetik: Heart,
//   brows: Star,
//   lashes: Star,
//   permanent: Star,
//   default: Flower2,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) =>
//     slug.toLowerCase().includes(k),
//   );
//   return categoryIcons[key || "default"];
// }

// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   return new Intl.NumberFormat(
//     locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US",
//     {
//       style: "currency",
//       currency: "EUR",
//       minimumFractionDigits: 0,
//     },
//   ).format(cents / 100);
// }

// const cardGradients = [
//   "from-rose-300/50 via-pink-200/50 to-rose-100/50",
//   "from-amber-200/50 via-orange-100/50 to-yellow-100/50",
//   "from-violet-300/50 via-purple-200/50 to-pink-100/50",
//   "from-sky-200/50 via-cyan-100/50 to-teal-100/50",
//   "from-emerald-200/50 via-teal-100/50 to-cyan-100/50",
// ];

// // ====== КРАСИВЫЙ АНИМИРОВАННЫЙ ФОН ======
// function PageBackground() {
//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-br from-rose-200/90 via-pink-100/80 to-amber-100/70 dark:from-[#080812] dark:via-[#0b0b16] dark:to-[#121227]" />
//       <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-rose-100/30 dark:from-transparent dark:to-transparent" />

//       <motion.div
//         className="absolute -top-32 -left-32 h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] rounded-full"
//         style={{
//           background:
//             "radial-gradient(circle, rgba(251,182,206,0.7) 0%, rgba(251,207,232,0.4) 40%, transparent 70%)",
//         }}
//         animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.5, 0.7] }}
//         transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="absolute top-1/4 -right-32 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full"
//         style={{
//           background:
//             "radial-gradient(circle, rgba(254,202,155,0.6) 0%, rgba(254,215,170,0.3) 40%, transparent 70%)",
//         }}
//         animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.35, 0.6] }}
//         transition={{
//           duration: 14,
//           repeat: Infinity,
//           ease: "easeInOut",
//           delay: 2,
//         }}
//       />
//       <motion.div
//         className="absolute -bottom-20 left-1/3 h-[450px] w-[450px] sm:h-[650px] sm:w-[650px] rounded-full"
//         style={{
//           background:
//             "radial-gradient(circle, rgba(216,180,254,0.5) 0%, rgba(196,181,253,0.25) 40%, transparent 70%)",
//         }}
//         animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }}
//         transition={{
//           duration: 16,
//           repeat: Infinity,
//           ease: "easeInOut",
//           delay: 4,
//         }}
//       />

//       {[...Array(35)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute pointer-events-none"
//           style={{ left: `${(i * 2.9) % 100}%`, top: `${(i * 3.1) % 95}%` }}
//           animate={{
//             y: [0, -35, 0],
//             x: [0, i % 2 === 0 ? 18 : -18, 0],
//             rotate: [0, i % 2 === 0 ? 20 : -20, 0],
//             opacity: [0.35, 0.75, 0.35],
//             scale: [1, 1.15, 1],
//           }}
//           transition={{
//             duration: 6 + (i % 5) * 1.5,
//             repeat: Infinity,
//             delay: i * 0.15,
//             ease: "easeInOut",
//           }}
//         >
//           {i % 4 === 0 ? (
//             <Heart
//               className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400/80 dark:text-rose-300/25 drop-shadow-sm"
//               fill="currentColor"
//             />
//           ) : i % 4 === 1 ? (
//             <Heart
//               className="h-3 w-3 sm:h-4 sm:w-4 text-pink-400/70 dark:text-pink-300/20 drop-shadow-sm"
//               fill="currentColor"
//             />
//           ) : i % 4 === 2 ? (
//             <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400/70 dark:text-amber-300/20" />
//           ) : (
//             <Star
//               className="h-3 w-3 sm:h-4 sm:w-4 text-rose-300/60 dark:text-rose-300/15"
//               fill="currentColor"
//             />
//           )}
//         </motion.div>
//       ))}

//       <svg
//         className="absolute bottom-0 left-0 w-full h-32 sm:h-48 opacity-20 dark:opacity-10"
//         preserveAspectRatio="none"
//         viewBox="0 0 1440 120"
//       >
//         <motion.path
//           fill="url(#wave-fill)"
//           animate={{
//             d: [
//               "M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,120 L0,120 Z",
//               "M0,40 C360,80 720,40 1080,80 C1260,60 1380,80 1440,40 L1440,120 L0,120 Z",
//               "M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,120 L0,120 Z",
//             ],
//           }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <defs>
//           <linearGradient id="wave-fill" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#f9a8d4" />
//             <stop offset="50%" stopColor="#fda4af" />
//             <stop offset="100%" stopColor="#fdba74" />
//           </linearGradient>
//         </defs>
//       </svg>

//       <div
//         className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//         }}
//       />
//     </div>
//   );
// }

// function ServiceCard({
//   service,
//   categoryName,
//   index,
//   onOpenDetail,
//   onOpenGallery,
//   translations,
//   locale,
//   isPriority,
// }: {
//   service: ServiceChild;
//   categoryName: string;
//   index: number;
//   onOpenDetail: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
//   locale: string;
//   isPriority?: boolean;
// }) {
//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 18 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay: index * 0.04 }}
//       className="group"
//     >
//       <div
//         onClick={onOpenDetail}
//         className="relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer bg-white dark:bg-zinc-900/80 border-2 border-rose-200/70 dark:border-white/10 shadow-[0_8px_30px_-12px_rgba(244,63,94,0.25)] dark:shadow-[0_18px_55px_-28px_rgba(0,0,0,0.75)] hover:shadow-[0_20px_50px_-15px_rgba(244,63,94,0.35)] dark:hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.85)] hover:border-rose-300 dark:hover:border-white/20 transition-all duration-500 sm:active:scale-[0.98] sm:hover:-translate-y-2"
//       >
//         <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10 pointer-events-none">
//           <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rotate-45" />
//         </div>
//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden bg-white dark:bg-zinc-950">
//           {hasImage ? (
//             <Image
//               src={imageUrl!}
//               alt={service.name}
//               fill
//               className="object-cover transition-transform duration-700 group-hover:scale-105"
//               sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
//               priority={isPriority}
//               loading={isPriority ? "eager" : "lazy"}
//               fetchPriority={isPriority ? "high" : "auto"}
//             />
//           ) : (
//             <div
//               className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}
//             >
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <Flower2 className="w-16 h-16 text-rose-300/70 dark:text-rose-200/20" />
//               </div>
//             </div>
//           )}
//           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-zinc-900 dark:via-zinc-900/40" />
//           {service.priceCents && (
//             <div className="absolute top-3 right-3">
//               <span className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-bold shadow-lg border border-rose-200/50 dark:border-white/10">
//                 {translations.from} {formatPrice(service.priceCents, locale)}
//               </span>
//             </div>
//           )}
//           {service.gallery.length > 0 && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onOpenGallery(0);
//               }}
//               className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm flex items-center gap-1.5 text-rose-500 dark:text-rose-200 text-xs hover:bg-rose-50 dark:hover:bg-white/15 transition-colors shadow-lg border border-rose-200/50 dark:border-white/10"
//             >
//               <Images className="w-3.5 h-3.5" />
//               {service.gallery.length}
//             </button>
//           )}
//           <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
//             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-medium backdrop-blur-sm shadow-md">
//               <Heart className="h-2.5 w-2.5" fill="currentColor" />
//               {categoryName}
//             </span>
//           </div>
//         </div>
//         {/* НИЖНЯЯ ЧАСТЬ С АНИМИРОВАННЫМИ СЕРДЕЧКАМИ */}
//         <div className="relative overflow-hidden p-4 sm:p-5 bg-gradient-to-b from-transparent to-rose-50/30 dark:from-rose-950/80 dark:via-slate-950/90 dark:to-purple-950/80">
//           {/* Анимированные сердечки для светлой темы */}
//           <div className="absolute inset-0 pointer-events-none dark:hidden">
//             {[...Array(5)].map((_, i) => (
//               <motion.div
//                 key={`light-heart-${i}`}
//                 className="absolute"
//                 style={{
//                   left: `${(i * 20) % 100}%`,
//                   top: `${(i * 22) % 100}%`,
//                 }}
//                 animate={{ y: [0, -12, 0], x: [0, i % 2 === 0 ? 6 : -6, 0] }}
//                 transition={{
//                   duration: 7 + (i % 3) * 2,
//                   repeat: Infinity,
//                   delay: i * 0.6,
//                   ease: "easeInOut",
//                 }}
//               >
//                 <Heart
//                   className={`${i % 2 === 0 ? "w-3.5 h-3.5" : "w-3 h-3"} text-rose-400/60 drop-shadow-[0_1px_6px_rgba(244,63,94,0.25)]`}
//                   fill="currentColor"
//                 />
//               </motion.div>
//             ))}
//           </div>
//           {/* Анимированные сердечки для тёмной темы */}
//           <div className="absolute inset-0 pointer-events-none hidden dark:block">
//             {[...Array(5)].map((_, i) => (
//               <motion.div
//                 key={`dark-heart-${i}`}
//                 className="absolute"
//                 style={{
//                   left: `${(i * 20) % 100}%`,
//                   top: `${(i * 22) % 100}%`,
//                 }}
//                 animate={{ y: [0, -10, 0], x: [0, i % 2 === 0 ? 5 : -5, 0] }}
//                 transition={{
//                   duration: 8 + (i % 3) * 2,
//                   repeat: Infinity,
//                   delay: i * 0.6,
//                   ease: "easeInOut",
//                 }}
//               >
//                 <Heart
//                   className={`${i % 2 === 0 ? "w-2.5 h-2.5" : "w-2 h-2"} text-rose-400/25`}
//                   fill="currentColor"
//                 />
//               </motion.div>
//             ))}
//           </div>
//           <div className="relative z-10">
//             <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors font-playfair">
//               {service.name}
//             </h3>
//             {service.description && (
//               <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">
//                 {service.description}
//               </p>
//             )}
//             <div className="flex items-center gap-3 mb-4">
//               <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm">
//                 <Clock className="w-3.5 h-3.5 text-rose-400 dark:text-rose-300" />
//                 {service.durationMin} {translations.minutes}
//               </span>
//             </div>
//             <Link
//               href={`/booking?service=${service.id}`}
//               onClick={(e) => e.stopPropagation()}
//               className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-rose-300/40"
//             >
//               {translations.bookNow}
//               <ChevronRight className="w-4 h-4" />
//             </Link>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// export default function ServicesClient({ categories, locale }: Props) {
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [selectedService, setSelectedService] = useState<{
//     service: ServiceChild;
//     categoryName: string;
//   } | null>(null);
//   const [lightbox, setLightbox] = useState<{
//     isOpen: boolean;
//     images: GalleryItem[];
//     currentIndex: number;
//     serviceName: string;
//   } | null>(null);
//   const translations = t[locale] || t.de;

//   const openServiceDetail = useCallback(
//     (service: ServiceChild, categoryName: string) =>
//       setSelectedService({ service, categoryName }),
//     [],
//   );
//   const openLightbox = useCallback(
//     (images: GalleryItem[], index: number, serviceName: string) =>
//       setLightbox({ isOpen: true, images, currentIndex: index, serviceName }),
//     [],
//   );
//   const closeLightbox = useCallback(() => setLightbox(null), []);
//   const goToPrev = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({
//       ...lightbox,
//       currentIndex:
//         lightbox.currentIndex === 0
//           ? lightbox.images.length - 1
//           : lightbox.currentIndex - 1,
//     });
//   }, [lightbox]);
//   const goToNext = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({
//       ...lightbox,
//       currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length,
//     });
//   }, [lightbox]);

//   const filteredCategories = categories.filter(
//     (cat) => !activeCategory || cat.id === activeCategory,
//   );
//   let globalServiceIndex = 0;

//   return (
//     <main className="relative min-h-screen overflow-hidden isolate">
//       <PageBackground />
//       <div className="relative z-10">
//         <AnimatePresence>
//           {lightbox?.isOpen && (
//             <GalleryLightbox
//               images={lightbox.images}
//               currentIndex={lightbox.currentIndex}
//               onClose={closeLightbox}
//               onPrev={goToPrev}
//               onNext={goToNext}
//               serviceName={lightbox.serviceName}
//             />
//           )}
//         </AnimatePresence>
//         <AnimatePresence>
//           {selectedService && (
//             <ServiceDetailModal
//               service={selectedService.service}
//               categoryName={selectedService.categoryName}
//               onClose={() => setSelectedService(null)}
//               onOpenGallery={(index) =>
//                 openLightbox(
//                   selectedService.service.gallery,
//                   index,
//                   selectedService.service.name,
//                 )
//               }
//               translations={translations}
//               locale={locale}
//             />
//           )}
//         </AnimatePresence>

//         <section className="relative pt-8 pb-6 sm:pt-16 sm:pb-12">
//           <div className="container mx-auto px-4">
//             <motion.div
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//               className="text-center max-w-2xl mx-auto"
//             >
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 0.1 }}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur border border-rose-200 dark:border-white/10 shadow-lg shadow-rose-200/30 mb-4 sm:mb-6"
//               >
//                 <Sparkles className="w-4 h-4 text-rose-500 dark:text-rose-200" />
//                 <span className="text-sm font-medium text-rose-600 dark:text-rose-200">
//                   Premium Beauty Salon
//                 </span>
//               </motion.div>
//               <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5 font-playfair">
//                 <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent drop-shadow-sm">
//                   {translations.title}
//                 </span>
//               </h1>
//               <div className="flex justify-center items-center gap-3 mb-4">
//                 <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
//                 <Heart
//                   className="w-5 h-5 text-rose-500 dark:text-rose-300"
//                   fill="currentColor"
//                 />
//                 <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
//               </div>
//               <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-200/90 mb-6 sm:mb-8 px-4 font-cormorant font-medium">
//                 {translations.subtitle}
//               </p>
//               <Link
//                 href="/booking"
//                 className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-full text-white font-semibold text-sm sm:text-base shadow-xl shadow-rose-300/50 transition-all active:scale-95 hover:scale-105"
//               >
//                 {translations.bookNow}
//                 <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//               </Link>
//             </motion.div>
//           </div>
//         </section>

//         <section className="sticky top-16 z-40">
//           <div className="bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl border-y border-rose-200/50 dark:border-white/10">
//             <div className="container mx-auto px-4">
//               <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
//                 <button
//                   onClick={() => setActiveCategory(null)}
//                   className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeCategory === null ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40" : "bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-white/12 border border-rose-200 dark:border-white/10"}`}
//                 >
//                   {translations.allCategories}
//                 </button>
//                 {categories.map((cat) => {
//                   const Icon = getCategoryIcon(cat.slug);
//                   return (
//                     <button
//                       key={cat.id}
//                       onClick={() =>
//                         setActiveCategory(
//                           cat.id === activeCategory ? null : cat.id,
//                         )
//                       }
//                       className={`flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeCategory === cat.id ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40" : "bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-white/12 border border-rose-200 dark:border-white/10"}`}
//                     >
//                       <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                       <span className="whitespace-nowrap">{cat.name}</span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="py-8 sm:py-12 lg:py-16 relative">
//           <div className="container mx-auto px-4">
//             {filteredCategories.map((category, catIndex) => (
//               <motion.div
//                 key={category.id}
//                 initial={{ opacity: 0, y: 18 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: catIndex * 0.08 }}
//                 className="mb-12 sm:mb-16 last:mb-0"
//               >
//                 <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
//                   <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-white/7 border border-rose-200 dark:border-white/10 shadow-lg shadow-rose-200/20 backdrop-blur">
//                     {(() => {
//                       const Icon = getCategoryIcon(category.slug);
//                       return (
//                         <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 dark:text-rose-200" />
//                       );
//                     })()}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100 truncate font-playfair">
//                       {category.name}
//                     </h2>
//                     <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-300">
//                       {category.children.length} {translations.services}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
//                   {category.children.map((service, index) => {
//                     const currentGlobalIndex = globalServiceIndex++;
//                     return (
//                       <ServiceCard
//                         key={service.id}
//                         service={service}
//                         categoryName={category.name}
//                         index={index}
//                         onOpenDetail={() =>
//                           openServiceDetail(service, category.name)
//                         }
//                         onOpenGallery={(idx) =>
//                           openLightbox(service.gallery, idx, service.name)
//                         }
//                         translations={translations}
//                         locale={locale}
//                         isPriority={currentGlobalIndex < 3}
//                       />
//                     );
//                   })}
//                 </div>
//               </motion.div>
//             ))}
//             {categories.length === 0 && (
//               <div className="text-center py-16 sm:py-20">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white dark:bg-white/8 flex items-center justify-center border border-rose-200 dark:border-white/10 shadow-lg">
//                   <Flower2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 dark:text-rose-200" />
//                 </div>
//                 <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-300">
//                   {translations.noServices}
//                 </p>
//               </div>
//             )}
//           </div>
//         </section>

//         <section className="py-12 sm:py-20 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-r from-rose-100/70 via-pink-50/70 to-amber-50/70 dark:from-black/25 dark:via-black/20 dark:to-black/25" />
//           <div className="relative container mx-auto px-4 text-center">
//             <motion.div
//               initial={{ opacity: 0, y: 18 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//             >
//               <div className="flex justify-center mb-4">
//                 <div className="flex items-center gap-3">
//                   <Heart
//                     className="w-4 h-4 text-rose-400"
//                     fill="currentColor"
//                   />
//                   <div className="w-10 h-px bg-gradient-to-r from-rose-400 to-transparent" />
//                   <Heart
//                     className="w-5 h-5 text-rose-500 dark:text-rose-300"
//                     fill="currentColor"
//                   />
//                   <div className="w-10 h-px bg-gradient-to-l from-rose-400 to-transparent" />
//                   <Heart
//                     className="w-4 h-4 text-rose-400"
//                     fill="currentColor"
//                   />
//                 </div>
//               </div>
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 sm:mb-4 font-playfair">
//                 {translations.trustText}
//               </h2>
//               <p className="text-zinc-600 dark:text-zinc-200 mb-6 sm:mb-8 max-w-md mx-auto font-cormorant font-medium">
//                 {translations.welcomeText}
//               </p>
//               <Link
//                 href="/booking"
//                 className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-rose-300/50 transition-all active:scale-95 hover:scale-105"
//               >
//                 {translations.bookNow}
//                 <ArrowRight className="w-5 h-5" />
//               </Link>
//             </motion.div>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }

//----- работает с частичной анимацией скорость 84, тестим с полной анимацией------
// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback, memo } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Sparkles,
//   Clock,
//   ChevronRight,
//   ChevronLeft,
//   Scissors,
//   Palette,
//   Heart,
//   Star,
//   ArrowRight,
//   X,
//   Images,
//   ZoomIn,
//   Euro,
//   Calendar,
//   Flower2,
// } from "lucide-react";

// type GalleryItem = { id: string; image: string; caption: string | null };

// type ServiceChild = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   priceCents: number | null;
//   durationMin: number;
//   cover: string | null;
//   gallery: GalleryItem[];
// };

// type Category = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   cover: string | null;
//   gallery: GalleryItem[];
//   children: ServiceChild[];
// };

// type Props = { categories: Category[]; locale: string };

// const t: Record<string, Record<string, string>> = {
//   de: {
//     title: "Unsere Leistungen",
//     subtitle: "Verwöhnen Sie sich mit Premium-Schönheitspflege",
//     bookNow: "Termin buchen",
//     from: "ab",
//     minutes: "Min.",
//     noServices: "Keine Dienstleistungen verfügbar",
//     allCategories: "Alle",
//     photos: "Fotos",
//     close: "Schließen",
//     ourWorks: "Unsere Arbeiten",
//     services: "Leistungen",
//     trustText: "Vertrauen Sie uns Ihre Schönheit an",
//     welcomeText: "Willkommen in unserem Salon",
//   },
//   ru: {
//     title: "Наши услуги",
//     subtitle: "Побалуйте себя премиальным уходом за красотой",
//     bookNow: "Записаться",
//     from: "от",
//     minutes: "мин.",
//     noServices: "Услуги не найдены",
//     allCategories: "Все",
//     photos: "фото",
//     close: "Закрыть",
//     ourWorks: "Наши работы",
//     services: "услуг",
//     trustText: "Доверьте нам вашу красоту",
//     welcomeText: "Добро пожаловать в наш салон",
//   },
//   en: {
//     title: "Our Services",
//     subtitle: "Indulge yourself with premium beauty care",
//     bookNow: "Book Now",
//     from: "from",
//     minutes: "min.",
//     noServices: "No services available",
//     allCategories: "All",
//     photos: "photos",
//     close: "Close",
//     ourWorks: "Our Works",
//     services: "services",
//     trustText: "Trust us with your beauty",
//     welcomeText: "Welcome to our salon",
//   },
// };

// const categoryIcons: Record<string, typeof Scissors> = {
//   haircut: Scissors, haare: Scissors, hair: Scissors, frisur: Scissors, стрижка: Scissors,
//   manicure: Palette, maniküre: Palette, nails: Palette, nagel: Palette, маникюр: Palette,
//   makeup: Heart, "make-up": Heart, kosmetik: Heart, макияж: Heart,
//   brows: Star, lashes: Star, permanent: Star, брови: Star, ресницы: Star,
//   default: Flower2,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) => slug.toLowerCase().includes(k));
//   return categoryIcons[key || "default"];
// }

// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
//     style: "currency", currency: "EUR", minimumFractionDigits: 0,
//   }).format(cents / 100);
// }

// const cardGradients = [
//   "from-rose-300/50 via-pink-200/50 to-rose-100/50",
//   "from-amber-200/50 via-orange-100/50 to-yellow-100/50",
//   "from-violet-300/50 via-purple-200/50 to-pink-100/50",
//   "from-sky-200/50 via-cyan-100/50 to-teal-100/50",
//   "from-emerald-200/50 via-teal-100/50 to-cyan-100/50",
// ];

// // ====== КРАСИВЫЙ АНИМИРОВАННЫЙ ФОН (сохранены все анимации!) ======
// function PageBackground() {
//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden">
//       {/* Основной градиент */}
//       <div className="absolute inset-0 bg-gradient-to-br from-rose-200/90 via-pink-100/80 to-amber-100/70 dark:from-[#080812] dark:via-[#0b0b16] dark:to-[#121227]" />

//       {/* Дополнительный слой нежности */}
//       <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-rose-100/30 dark:from-transparent dark:to-transparent" />

//       {/* Большие мягкие сферы с анимацией */}
//       <motion.div
//         className="absolute -top-32 -left-32 h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(251,182,206,0.7) 0%, rgba(251,207,232,0.4) 40%, transparent 70%)" }}
//         animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.5, 0.7] }}
//         transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="absolute top-1/4 -right-32 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(254,202,155,0.6) 0%, rgba(254,215,170,0.3) 40%, transparent 70%)" }}
//         animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.35, 0.6] }}
//         transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//       />
//       <motion.div
//         className="absolute -bottom-20 left-1/3 h-[450px] w-[450px] sm:h-[650px] sm:w-[650px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(216,180,254,0.5) 0%, rgba(196,181,253,0.25) 40%, transparent 70%)" }}
//         animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }}
//         transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
//       />

//       {/* Анимированные сердечки и декоративные элементы */}
//       {[...Array(35)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute pointer-events-none"
//           style={{ left: `${(i * 2.9) % 100}%`, top: `${(i * 3.1) % 95}%` }}
//           animate={{
//             y: [0, -35, 0],
//             x: [0, i % 2 === 0 ? 18 : -18, 0],
//             rotate: [0, i % 2 === 0 ? 20 : -20, 0],
//             opacity: [0.35, 0.75, 0.35],
//             scale: [1, 1.15, 1],
//           }}
//           transition={{ duration: 6 + (i % 5) * 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
//         >
//           {i % 4 === 0 ? (
//             <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400/80 dark:text-rose-300/25 drop-shadow-sm" fill="currentColor" />
//           ) : i % 4 === 1 ? (
//             <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-pink-400/70 dark:text-pink-300/20 drop-shadow-sm" fill="currentColor" />
//           ) : i % 4 === 2 ? (
//             <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400/70 dark:text-amber-300/20" />
//           ) : (
//             <Star className="h-3 w-3 sm:h-4 sm:w-4 text-rose-300/60 dark:text-rose-300/15" fill="currentColor" />
//           )}
//         </motion.div>
//       ))}

//       {/* Анимированная волна */}
//       <svg className="absolute bottom-0 left-0 w-full h-32 sm:h-48 opacity-20 dark:opacity-10" preserveAspectRatio="none" viewBox="0 0 1440 120">
//         <motion.path
//           fill="url(#wave-fill)"
//           animate={{
//             d: [
//               "M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,120 L0,120 Z",
//               "M0,40 C360,80 720,40 1080,80 C1260,60 1380,80 1440,40 L1440,120 L0,120 Z",
//               "M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,120 L0,120 Z",
//             ],
//           }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <defs>
//           <linearGradient id="wave-fill" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#f9a8d4" />
//             <stop offset="50%" stopColor="#fda4af" />
//             <stop offset="100%" stopColor="#fdba74" />
//           </linearGradient>
//         </defs>
//       </svg>

//       {/* Тонкий узор */}
//       <div
//         className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//         }}
//       />
//     </div>
//   );
// }

// // ====== СТАТИЧНЫЙ ФОН ЛАЙТБОКСА ======
// const ServiceCard = memo(function ServiceCard({ service, categoryName, index, onOpenDetail, onOpenGallery, translations, locale, isPriority }: {
//   service: ServiceChild; categoryName: string; index: number; onOpenDetail: () => void; onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string; isPriority?: boolean;
// }) {
//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.04 }} className="group">
//       <div onClick={onOpenDetail}
//         className="relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer bg-white dark:bg-zinc-900/80 border-2 border-rose-200/70 dark:border-white/10 shadow-[0_8px_30px_-12px_rgba(244,63,94,0.25)] dark:shadow-[0_18px_55px_-28px_rgba(0,0,0,0.75)] hover:shadow-[0_20px_50px_-15px_rgba(244,63,94,0.35)] dark:hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.85)] hover:border-rose-300 dark:hover:border-white/20 transition-all duration-500 sm:active:scale-[0.98] sm:hover:-translate-y-2">
//         <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10 pointer-events-none"><div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rotate-45" /></div>
//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden bg-white dark:bg-zinc-950">
//           {hasImage ? (
//             // ОПТИМИЗАЦИЯ: next/image с priority для первых карточек и lazy для остальных
//             <Image src={imageUrl!} alt={service.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" priority={isPriority} loading={isPriority ? "eager" : "lazy"} />
//           ) : (
//             <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}><div className="absolute inset-0 flex items-center justify-center"><Flower2 className="w-16 h-16 text-rose-300/70 dark:text-rose-200/20" /></div></div>
//           )}
//           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-zinc-900 dark:via-zinc-900/40" />
//           {service.priceCents && (<div className="absolute top-3 right-3"><span className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-bold shadow-lg border border-rose-200/50 dark:border-white/10">{translations.from} {formatPrice(service.priceCents, locale)}</span></div>)}
//           {service.gallery.length > 0 && (<button onClick={(e) => { e.stopPropagation(); onOpenGallery(0); }} className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm flex items-center gap-1.5 text-rose-500 dark:text-rose-200 text-xs hover:bg-rose-50 dark:hover:bg-white/15 transition-colors shadow-lg border border-rose-200/50 dark:border-white/10"><Images className="w-3.5 h-3.5" />{service.gallery.length}</button>)}
//           <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-medium backdrop-blur-sm shadow-md"><Heart className="h-2.5 w-2.5" fill="currentColor" />{categoryName}</span></div>
//         </div>
//         <div className="relative overflow-hidden p-4 sm:p-5 bg-gradient-to-b from-transparent to-rose-50/30 dark:from-rose-950/80 dark:via-slate-950/90 dark:to-purple-950/80">
//           <div className="relative z-10">
//             <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors font-playfair">{service.name}</h3>
//             {service.description && (<p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">{service.description}</p>)}
//             <div className="flex items-center gap-3 mb-4"><span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm"><Clock className="w-3.5 h-3.5 text-rose-400 dark:text-rose-300" />{service.durationMin} {translations.minutes}</span></div>
//             <Link href={`/booking?service=${service.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-rose-300/40">{translations.bookNow}<ChevronRight className="w-4 h-4" /></Link>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// });

// // ====== ГЛАВНЫЙ КОМПОНЕНТ ======
// export default function ServicesClient({ categories, locale }: Props) {
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [selectedService, setSelectedService] = useState<{ service: ServiceChild; categoryName: string } | null>(null);
//   const [lightbox, setLightbox] = useState<{ isOpen: boolean; images: GalleryItem[]; currentIndex: number; serviceName: string } | null>(null);
//   const translations = t[locale] || t.de;

//   const openServiceDetail = useCallback((service: ServiceChild, categoryName: string) => setSelectedService({ service, categoryName }), []);
//   const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => setLightbox({ isOpen: true, images, currentIndex: index, serviceName }), []);
//   const closeLightbox = useCallback(() => setLightbox(null), []);
//   const goToPrev = useCallback(() => { if (!lightbox) return; setLightbox({ ...lightbox, currentIndex: lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1 }); }, [lightbox]);
//   const goToNext = useCallback(() => { if (!lightbox) return; setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length }); }, [lightbox]);

//   const filteredCategories = categories.filter((cat) => !activeCategory || cat.id === activeCategory);
//   let globalServiceIndex = 0;

//   return (
//     <main className="relative min-h-screen overflow-hidden isolate">
//       <PageBackground />
//       <div className="relative z-10">
//         <AnimatePresence>{lightbox?.isOpen && (<GalleryLightbox images={lightbox.images} currentIndex={lightbox.currentIndex} onClose={closeLightbox} onPrev={goToPrev} onNext={goToNext} serviceName={lightbox.serviceName} />)}</AnimatePresence>
//         <AnimatePresence>{selectedService && (<ServiceDetailModal service={selectedService.service} categoryName={selectedService.categoryName} onClose={() => setSelectedService(null)} onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)} translations={translations} locale={locale} />)}</AnimatePresence>

//         {/* Hero */}
//         <section className="relative pt-8 pb-6 sm:pt-16 sm:pb-12">
//           <div className="container mx-auto px-4">
//             <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
//               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur border border-rose-200 dark:border-white/10 shadow-lg shadow-rose-200/30 mb-4 sm:mb-6">
//                 <Sparkles className="w-4 h-4 text-rose-500 dark:text-rose-200" /><span className="text-sm font-medium text-rose-600 dark:text-rose-200">Premium Beauty Salon</span>
//               </motion.div>
//               <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5 font-playfair"><span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent">{translations.title}</span></h1>
//               <div className="flex justify-center items-center gap-3 mb-4"><div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" /><Heart className="w-5 h-5 text-rose-500 dark:text-rose-300" fill="currentColor" /><div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" /></div>
//               <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-200/90 mb-6 sm:mb-8 px-4 font-cormorant">{translations.subtitle}</p>
//               <Link href="/booking" className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-full text-white font-semibold text-sm sm:text-base shadow-xl shadow-rose-300/50 transition-all active:scale-95 hover:scale-105">{translations.bookNow}<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></Link>
//             </motion.div>
//           </div>
//         </section>

//         {/* Фильтр категорий */}
//         <section className="sticky top-16 z-40">
//           <div className="bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl border-y border-rose-200/50 dark:border-white/10">
//             <div className="container mx-auto px-4">
//               <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
//                 <button onClick={() => setActiveCategory(null)} className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeCategory === null ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40" : "bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-white/12 border border-rose-200 dark:border-white/10"}`}>{translations.allCategories}</button>
//                 {categories.map((cat) => { const Icon = getCategoryIcon(cat.slug); return (
//                   <button key={cat.id} onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)} className={`flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeCategory === cat.id ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40" : "bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-white/12 border border-rose-200 dark:border-white/10"}`}><Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="whitespace-nowrap">{cat.name}</span></button>
//                 );})}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Услуги */}
//         <section className="py-8 sm:py-12 lg:py-16 relative">
//           <div className="container mx-auto px-4">
//             {filteredCategories.map((category, catIndex) => (
//               <motion.div key={category.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: catIndex * 0.08 }} className="mb-12 sm:mb-16 last:mb-0">
//                 <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
//                   <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-white/7 border border-rose-200 dark:border-white/10 shadow-lg shadow-rose-200/20 backdrop-blur">{(() => { const Icon = getCategoryIcon(category.slug); return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 dark:text-rose-200" />; })()}</div>
//                   <div className="flex-1 min-w-0"><h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100 truncate font-playfair">{category.name}</h2><span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-300">{category.children.length} {translations.services}</span></div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
//                   {category.children.map((service, index) => { const currentGlobalIndex = globalServiceIndex++; return (
//                     <ServiceCard key={service.id} service={service} categoryName={category.name} index={index} onOpenDetail={() => openServiceDetail(service, category.name)} onOpenGallery={(idx) => openLightbox(service.gallery, idx, service.name)} translations={translations} locale={locale} isPriority={currentGlobalIndex < 3} />
//                   );})}
//                 </div>
//               </motion.div>
//             ))}
//             {categories.length === 0 && (<div className="text-center py-16 sm:py-20"><div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white dark:bg-white/8 flex items-center justify-center border border-rose-200 dark:border-white/10 shadow-lg"><Flower2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 dark:text-rose-200" /></div><p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-300">{translations.noServices}</p></div>)}
//           </div>
//         </section>

//         {/* Нижний CTA */}
//         <section className="py-12 sm:py-20 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-r from-rose-100/70 via-pink-50/70 to-amber-50/70 dark:from-black/25 dark:via-black/20 dark:to-black/25" />
//           <div className="relative container mx-auto px-4 text-center">
//             <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
//               <div className="flex justify-center mb-4"><div className="flex items-center gap-3"><Heart className="w-4 h-4 text-rose-400" fill="currentColor" /><div className="w-10 h-px bg-gradient-to-r from-rose-400 to-transparent" /><Heart className="w-5 h-5 text-rose-500 dark:text-rose-300" fill="currentColor" /><div className="w-10 h-px bg-gradient-to-l from-rose-400 to-transparent" /><Heart className="w-4 h-4 text-rose-400" fill="currentColor" /></div></div>
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 sm:mb-4 font-playfair">{translations.trustText}</h2>
//               <p className="text-zinc-600 dark:text-zinc-200 mb-6 sm:mb-8 max-w-md mx-auto font-cormorant">{translations.welcomeText}</p>
//               <Link href="/booking" className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-rose-300/50 transition-all active:scale-95 hover:scale-105">{translations.bookNow}<ArrowRight className="w-5 h-5" /></Link>
//             </motion.div>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }

//----------этот вариант без анимации, выше с анимацией----------
// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback, memo } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Sparkles,
//   Clock,
//   ChevronRight,
//   ChevronLeft,
//   Scissors,
//   Palette,
//   Heart,
//   Star,
//   ArrowRight,
//   X,
//   Images,
//   ZoomIn,
//   Euro,
//   Calendar,
//   Flower2,
// } from "lucide-react";

// type GalleryItem = { id: string; image: string; caption: string | null };

// type ServiceChild = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   priceCents: number | null;
//   durationMin: number;
//   cover: string | null;
//   gallery: GalleryItem[];
// };

// type Category = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   cover: string | null;
//   gallery: GalleryItem[];
//   children: ServiceChild[];
// };

// type Props = { categories: Category[]; locale: string };

// const t: Record<string, Record<string, string>> = {
//   de: {
//     title: "Unsere Leistungen",
//     subtitle: "Verwöhnen Sie sich mit Premium-Schönheitspflege",
//     bookNow: "Termin buchen",
//     from: "ab",
//     minutes: "Min.",
//     noServices: "Keine Dienstleistungen verfügbar",
//     allCategories: "Alle",
//     photos: "Fotos",
//     close: "Schließen",
//     ourWorks: "Unsere Arbeiten",
//     services: "Leistungen",
//     trustText: "Vertrauen Sie uns Ihre Schönheit an",
//     welcomeText: "Willkommen in unserem Salon",
//   },
//   ru: {
//     title: "Наши услуги",
//     subtitle: "Побалуйте себя премиальным уходом за красотой",
//     bookNow: "Записаться",
//     from: "от",
//     minutes: "мин.",
//     noServices: "Услуги не найдены",
//     allCategories: "Все",
//     photos: "фото",
//     close: "Закрыть",
//     ourWorks: "Наши работы",
//     services: "услуг",
//     trustText: "Доверьте нам вашу красоту",
//     welcomeText: "Добро пожаловать в наш салон",
//   },
//   en: {
//     title: "Our Services",
//     subtitle: "Indulge yourself with premium beauty care",
//     bookNow: "Book Now",
//     from: "from",
//     minutes: "min.",
//     noServices: "No services available",
//     allCategories: "All",
//     photos: "photos",
//     close: "Close",
//     ourWorks: "Our Works",
//     services: "services",
//     trustText: "Trust us with your beauty",
//     welcomeText: "Welcome to our salon",
//   },
// };

// const categoryIcons: Record<string, typeof Scissors> = {
//   haircut: Scissors, haare: Scissors, hair: Scissors, frisur: Scissors, стрижка: Scissors,
//   manicure: Palette, maniküre: Palette, nails: Palette, nagel: Palette, маникюр: Palette,
//   makeup: Heart, "make-up": Heart, kosmetik: Heart, макияж: Heart,
//   brows: Star, lashes: Star, permanent: Star, брови: Star, ресницы: Star,
//   default: Flower2,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) => slug.toLowerCase().includes(k));
//   return categoryIcons[key || "default"];
// }

// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
//     style: "currency", currency: "EUR", minimumFractionDigits: 0,
//   }).format(cents / 100);
// }

// const cardGradients = [
//   "from-rose-300/50 via-pink-200/50 to-rose-100/50",
//   "from-amber-200/50 via-orange-100/50 to-yellow-100/50",
//   "from-violet-300/50 via-purple-200/50 to-pink-100/50",
//   "from-sky-200/50 via-cyan-100/50 to-teal-100/50",
//   "from-emerald-200/50 via-teal-100/50 to-cyan-100/50",
// ];

// // ====== ОПТИМИЗИРОВАННЫЙ СТАТИЧНЫЙ ФОН ======
// const PageBackground = memo(() => (
//   <div className="fixed inset-0 -z-10 overflow-hidden">
//     <div className="absolute inset-0 bg-gradient-to-br from-rose-200/90 via-pink-100/80 to-amber-100/70 dark:from-[#080812] dark:via-[#0b0b16] dark:to-[#121227]" />
//     <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-rose-100/30 dark:from-transparent dark:to-transparent" />
//     <div className="absolute -top-32 -left-32 h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] rounded-full opacity-60"
//       style={{ background: "radial-gradient(circle, rgba(251,182,206,0.7) 0%, rgba(251,207,232,0.4) 40%, transparent 70%)" }} />
//     <div className="absolute top-1/4 -right-32 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full opacity-50"
//       style={{ background: "radial-gradient(circle, rgba(254,202,155,0.6) 0%, rgba(254,215,170,0.3) 40%, transparent 70%)" }} />
//     <div className="absolute -bottom-20 left-1/3 h-[450px] w-[450px] sm:h-[650px] sm:w-[650px] rounded-full opacity-40"
//       style={{ background: "radial-gradient(circle, rgba(216,180,254,0.5) 0%, rgba(196,181,253,0.25) 40%, transparent 70%)" }} />
//     {[...Array(10)].map((_, i) => (
//       <div key={i} className="absolute pointer-events-none" style={{ left: `${(i * 10) % 100}%`, top: `${(i * 11) % 95}%` }}>
//         {i % 4 === 0 ? <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400/50 dark:text-rose-300/15" fill="currentColor" />
//           : i % 4 === 1 ? <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-pink-400/40 dark:text-pink-300/10" fill="currentColor" />
//           : i % 4 === 2 ? <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400/40 dark:text-amber-300/10" />
//           : <Star className="h-3 w-3 sm:h-4 sm:w-4 text-rose-300/30 dark:text-rose-300/10" fill="currentColor" />}
//       </div>
//     ))}
//     <svg className="absolute bottom-0 left-0 w-full h-24 sm:h-32 opacity-15 dark:opacity-10" preserveAspectRatio="none" viewBox="0 0 1440 120">
//       <path fill="url(#wave-fill)" d="M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,120 L0,120 Z" />
//       <defs><linearGradient id="wave-fill" x1="0%" y1="0%" x2="100%" y2="0%">
//         <stop offset="0%" stopColor="#f9a8d4" /><stop offset="50%" stopColor="#fda4af" /><stop offset="100%" stopColor="#fdba74" />
//       </linearGradient></defs>
//     </svg>
//   </div>
// ));
// PageBackground.displayName = "PageBackground";

// // ====== СТАТИЧНЫЙ ФОН ЛАЙТБОКСА ======
// const ServiceCard = memo(function ServiceCard({ service, categoryName, index, onOpenDetail, onOpenGallery, translations, locale, isPriority }: {
//   service: ServiceChild; categoryName: string; index: number; onOpenDetail: () => void; onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string; isPriority?: boolean;
// }) {
//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.04 }} className="group">
//       <div onClick={onOpenDetail}
//         className="relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer bg-white dark:bg-zinc-900/80 border-2 border-rose-200/70 dark:border-white/10 shadow-[0_8px_30px_-12px_rgba(244,63,94,0.25)] dark:shadow-[0_18px_55px_-28px_rgba(0,0,0,0.75)] hover:shadow-[0_20px_50px_-15px_rgba(244,63,94,0.35)] dark:hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.85)] hover:border-rose-300 dark:hover:border-white/20 transition-all duration-500 sm:active:scale-[0.98] sm:hover:-translate-y-2">
//         <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10 pointer-events-none"><div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rotate-45" /></div>
//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden bg-white dark:bg-zinc-950">
//           {hasImage ? (<Image src={imageUrl!} alt={service.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" priority={isPriority} loading={isPriority ? "eager" : "lazy"} />)
//             : (<div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}><div className="absolute inset-0 flex items-center justify-center"><Flower2 className="w-16 h-16 text-rose-300/70 dark:text-rose-200/20" /></div></div>)}
//           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-zinc-900 dark:via-zinc-900/40" />
//           {service.priceCents && (<div className="absolute top-3 right-3"><span className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-bold shadow-lg border border-rose-200/50 dark:border-white/10">{translations.from} {formatPrice(service.priceCents, locale)}</span></div>)}
//           {service.gallery.length > 0 && (<button onClick={(e) => { e.stopPropagation(); onOpenGallery(0); }} className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm flex items-center gap-1.5 text-rose-500 dark:text-rose-200 text-xs hover:bg-rose-50 dark:hover:bg-white/15 transition-colors shadow-lg border border-rose-200/50 dark:border-white/10"><Images className="w-3.5 h-3.5" />{service.gallery.length}</button>)}
//           <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-medium backdrop-blur-sm shadow-md"><Heart className="h-2.5 w-2.5" fill="currentColor" />{categoryName}</span></div>
//         </div>
//         <div className="relative overflow-hidden p-4 sm:p-5 bg-gradient-to-b from-transparent to-rose-50/30 dark:from-rose-950/80 dark:via-slate-950/90 dark:to-purple-950/80">
//           <div className="relative z-10">
//             <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{service.name}</h3>
//             {service.description && (<p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">{service.description}</p>)}
//             <div className="flex items-center gap-3 mb-4"><span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm"><Clock className="w-3.5 h-3.5 text-rose-400 dark:text-rose-300" />{service.durationMin} {translations.minutes}</span></div>
//             <Link href={`/booking?service=${service.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-rose-300/40">{translations.bookNow}<ChevronRight className="w-4 h-4" /></Link>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// });

// // ====== ГЛАВНЫЙ КОМПОНЕНТ ======
// export default function ServicesClient({ categories, locale }: Props) {
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [selectedService, setSelectedService] = useState<{ service: ServiceChild; categoryName: string } | null>(null);
//   const [lightbox, setLightbox] = useState<{ isOpen: boolean; images: GalleryItem[]; currentIndex: number; serviceName: string } | null>(null);
//   const translations = t[locale] || t.de;

//   const openServiceDetail = useCallback((service: ServiceChild, categoryName: string) => setSelectedService({ service, categoryName }), []);
//   const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => setLightbox({ isOpen: true, images, currentIndex: index, serviceName }), []);
//   const closeLightbox = useCallback(() => setLightbox(null), []);
//   const goToPrev = useCallback(() => { if (!lightbox) return; setLightbox({ ...lightbox, currentIndex: lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1 }); }, [lightbox]);
//   const goToNext = useCallback(() => { if (!lightbox) return; setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length }); }, [lightbox]);

//   const filteredCategories = categories.filter((cat) => !activeCategory || cat.id === activeCategory);
//   let globalServiceIndex = 0;

//   return (
//     <main className="relative min-h-screen overflow-hidden isolate">
//       <PageBackground />
//       <div className="relative z-10">
//         <AnimatePresence>{lightbox?.isOpen && (<GalleryLightbox images={lightbox.images} currentIndex={lightbox.currentIndex} onClose={closeLightbox} onPrev={goToPrev} onNext={goToNext} serviceName={lightbox.serviceName} />)}</AnimatePresence>
//         <AnimatePresence>{selectedService && (<ServiceDetailModal service={selectedService.service} categoryName={selectedService.categoryName} onClose={() => setSelectedService(null)} onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)} translations={translations} locale={locale} />)}</AnimatePresence>

//         {/* Hero */}
//         <section className="relative pt-8 pb-6 sm:pt-16 sm:pb-12">
//           <div className="container mx-auto px-4">
//             <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
//               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur border border-rose-200 dark:border-white/10 shadow-lg shadow-rose-200/30 mb-4 sm:mb-6">
//                 <Sparkles className="w-4 h-4 text-rose-500 dark:text-rose-200" /><span className="text-sm font-medium text-rose-600 dark:text-rose-200">Premium Beauty Salon</span>
//               </motion.div>
//               <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}><span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent">{translations.title}</span></h1>
//               <div className="flex justify-center items-center gap-3 mb-4"><div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" /><Heart className="w-5 h-5 text-rose-500 dark:text-rose-300" fill="currentColor" /><div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" /></div>
//               <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-200/90 mb-6 sm:mb-8 px-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>{translations.subtitle}</p>
//               <Link href="/booking" className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-full text-white font-semibold text-sm sm:text-base shadow-xl shadow-rose-300/50 transition-all active:scale-95 hover:scale-105">{translations.bookNow}<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></Link>
//             </motion.div>
//           </div>
//         </section>

//         {/* Фильтр категорий */}
//         <section className="sticky top-16 z-40">
//           <div className="bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl border-y border-rose-200/50 dark:border-white/10">
//             <div className="container mx-auto px-4">
//               <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
//                 <button onClick={() => setActiveCategory(null)} className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeCategory === null ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40" : "bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-white/12 border border-rose-200 dark:border-white/10"}`}>{translations.allCategories}</button>
//                 {categories.map((cat) => { const Icon = getCategoryIcon(cat.slug); return (
//                   <button key={cat.id} onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)} className={`flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeCategory === cat.id ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40" : "bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-white/12 border border-rose-200 dark:border-white/10"}`}><Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="whitespace-nowrap">{cat.name}</span></button>
//                 );})}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Услуги */}
//         <section className="py-8 sm:py-12 lg:py-16 relative">
//           <div className="container mx-auto px-4">
//             {filteredCategories.map((category, catIndex) => (
//               <motion.div key={category.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: catIndex * 0.08 }} className="mb-12 sm:mb-16 last:mb-0">
//                 <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
//                   <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-white/7 border border-rose-200 dark:border-white/10 shadow-lg shadow-rose-200/20 backdrop-blur">{(() => { const Icon = getCategoryIcon(category.slug); return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 dark:text-rose-200" />; })()}</div>
//                   <div className="flex-1 min-w-0"><h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100 truncate" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{category.name}</h2><span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-300">{category.children.length} {translations.services}</span></div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
//                   {category.children.map((service, index) => { const currentGlobalIndex = globalServiceIndex++; return (
//                     <ServiceCard key={service.id} service={service} categoryName={category.name} index={index} onOpenDetail={() => openServiceDetail(service, category.name)} onOpenGallery={(idx) => openLightbox(service.gallery, idx, service.name)} translations={translations} locale={locale} isPriority={currentGlobalIndex < 3} />
//                   );})}
//                 </div>
//               </motion.div>
//             ))}
//             {categories.length === 0 && (<div className="text-center py-16 sm:py-20"><div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white dark:bg-white/8 flex items-center justify-center border border-rose-200 dark:border-white/10 shadow-lg"><Flower2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 dark:text-rose-200" /></div><p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-300">{translations.noServices}</p></div>)}
//           </div>
//         </section>

//         {/* Нижний CTA */}
//         <section className="py-12 sm:py-20 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-r from-rose-100/70 via-pink-50/70 to-amber-50/70 dark:from-black/25 dark:via-black/20 dark:to-black/25" />
//           <div className="relative container mx-auto px-4 text-center">
//             <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
//               <div className="flex justify-center mb-4"><div className="flex items-center gap-3"><Heart className="w-4 h-4 text-rose-400" fill="currentColor" /><div className="w-10 h-px bg-gradient-to-r from-rose-400 to-transparent" /><Heart className="w-5 h-5 text-rose-500 dark:text-rose-300" fill="currentColor" /><div className="w-10 h-px bg-gradient-to-l from-rose-400 to-transparent" /><Heart className="w-4 h-4 text-rose-400" fill="currentColor" /></div></div>
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 sm:mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{translations.trustText}</h2>
//               <p className="text-zinc-600 dark:text-zinc-200 mb-6 sm:mb-8 max-w-md mx-auto" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>{translations.welcomeText}</p>
//               <Link href="/booking" className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-rose-300/50 transition-all active:scale-95 hover:scale-105">{translations.bookNow}<ArrowRight className="w-5 h-5" /></Link>
//             </motion.div>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }

//------оптимизирем скорость загрузки страницы---------
// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback, memo } from "react";
// import Link from "next/link";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Sparkles,
//   Clock,
//   ChevronRight,
//   ChevronLeft,
//   Scissors,
//   Palette,
//   Heart,
//   Star,
//   ArrowRight,
//   X,
//   Images,
//   ZoomIn,
//   Euro,
//   Calendar,
//   Flower2,
// } from "lucide-react";

// type GalleryItem = { id: string; image: string; caption: string | null };

// type ServiceChild = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   priceCents: number | null;
//   durationMin: number;
//   cover: string | null;
//   gallery: GalleryItem[];
// };

// type Category = {
//   id: string;
//   slug: string;
//   name: string;
//   description: string | null;
//   cover: string | null;
//   gallery: GalleryItem[];
//   children: ServiceChild[];
// };

// type Props = { categories: Category[]; locale: string };

// const t: Record<string, Record<string, string>> = {
//   de: {
//     title: "Unsere Leistungen",
//     subtitle: "Verwöhnen Sie sich mit Premium-Schönheitspflege",
//     bookNow: "Termin buchen",
//     from: "ab",
//     minutes: "Min.",
//     noServices: "Keine Dienstleistungen verfügbar",
//     allCategories: "Alle",
//     photos: "Fotos",
//     close: "Schließen",
//     ourWorks: "Unsere Arbeiten",
//     services: "Leistungen",
//     trustText: "Vertrauen Sie uns Ihre Schönheit an",
//     welcomeText: "Willkommen in unserem Salon",
//   },
//   ru: {
//     title: "Наши услуги",
//     subtitle: "Побалуйте себя премиальным уходом за красотой",
//     bookNow: "Записаться",
//     from: "от",
//     minutes: "мин.",
//     noServices: "Услуги не найдены",
//     allCategories: "Все",
//     photos: "фото",
//     close: "Закрыть",
//     ourWorks: "Наши работы",
//     services: "услуг",
//     trustText: "Доверьте нам вашу красоту",
//     welcomeText: "Добро пожаловать в наш салон",
//   },
//   en: {
//     title: "Our Services",
//     subtitle: "Indulge yourself with premium beauty care",
//     bookNow: "Book Now",
//     from: "from",
//     minutes: "min.",
//     noServices: "No services available",
//     allCategories: "All",
//     photos: "photos",
//     close: "Close",
//     ourWorks: "Our Works",
//     services: "services",
//     trustText: "Trust us with your beauty",
//     welcomeText: "Welcome to our salon",
//   },
// };

// const categoryIcons: Record<string, typeof Scissors> = {
//   haircut: Scissors, haare: Scissors, hair: Scissors, frisur: Scissors, стрижка: Scissors,
//   manicure: Palette, maniküre: Palette, nails: Palette, nagel: Palette, маникюр: Palette,
//   makeup: Heart, "make-up": Heart, kosmetik: Heart, макияж: Heart,
//   brows: Star, lashes: Star, permanent: Star, брови: Star, ресницы: Star,
//   default: Flower2,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) => slug.toLowerCase().includes(k));
//   return categoryIcons[key || "default"];
// }

// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
//     style: "currency", currency: "EUR", minimumFractionDigits: 0,
//   }).format(cents / 100);
// }

// const cardGradients = [
//   "from-rose-300/50 via-pink-200/50 to-rose-100/50",
//   "from-amber-200/50 via-orange-100/50 to-yellow-100/50",
//   "from-violet-300/50 via-purple-200/50 to-pink-100/50",
//   "from-sky-200/50 via-cyan-100/50 to-teal-100/50",
//   "from-emerald-200/50 via-teal-100/50 to-cyan-100/50",
// ];

// // ====== КРАСИВЫЙ АНИМИРОВАННЫЙ ФОН ======
// function PageBackground() {
//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden">
//       {/* Основной градиент - более насыщенный розовый */}
//       <div className="absolute inset-0 bg-gradient-to-br from-rose-200/90 via-pink-100/80 to-amber-100/70 dark:from-[#080812] dark:via-[#0b0b16] dark:to-[#121227]" />

//       {/* Дополнительный слой нежности */}
//       <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-rose-100/30 dark:from-transparent dark:to-transparent" />

//       {/* Большие мягкие сферы */}
//       <motion.div
//         className="absolute -top-32 -left-32 h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(251,182,206,0.7) 0%, rgba(251,207,232,0.4) 40%, transparent 70%)" }}
//         animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.5, 0.7] }}
//         transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="absolute top-1/4 -right-32 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(254,202,155,0.6) 0%, rgba(254,215,170,0.3) 40%, transparent 70%)" }}
//         animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.35, 0.6] }}
//         transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//       />
//       <motion.div
//         className="absolute -bottom-20 left-1/3 h-[450px] w-[450px] sm:h-[650px] sm:w-[650px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(216,180,254,0.5) 0%, rgba(196,181,253,0.25) 40%, transparent 70%)" }}
//         animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }}
//         transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
//       />

//       {/* МНОГО сердечек и декоративных элементов */}
//       {[...Array(35)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute pointer-events-none"
//           style={{
//             left: `${(i * 2.9) % 100}%`,
//             top: `${(i * 3.1) % 95}%`,
//           }}
//           animate={{
//             y: [0, -35, 0],
//             x: [0, i % 2 === 0 ? 18 : -18, 0],
//             rotate: [0, i % 2 === 0 ? 20 : -20, 0],
//             opacity: [0.35, 0.75, 0.35],
//             scale: [1, 1.15, 1],
//           }}
//           transition={{
//             duration: 6 + (i % 5) * 1.5,
//             repeat: Infinity,
//             delay: i * 0.15,
//             ease: "easeInOut"
//           }}
//         >
//           {i % 4 === 0 ? (
//             <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400/80 dark:text-rose-300/25 drop-shadow-sm" fill="currentColor" />
//           ) : i % 4 === 1 ? (
//             <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-pink-400/70 dark:text-pink-300/20 drop-shadow-sm" fill="currentColor" />
//           ) : i % 4 === 2 ? (
//             <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400/70 dark:text-amber-300/20" />
//           ) : (
//             <Star className="h-3 w-3 sm:h-4 sm:w-4 text-rose-300/60 dark:text-rose-300/15" fill="currentColor" />
//           )}
//         </motion.div>
//       ))}

//       {/* Декоративные линии/волны */}
//       <svg className="absolute bottom-0 left-0 w-full h-32 sm:h-48 opacity-20 dark:opacity-10" preserveAspectRatio="none" viewBox="0 0 1440 120">
//         <motion.path
//           fill="url(#wave-fill)"
//           animate={{
//             d: [
//               "M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,120 L0,120 Z",
//               "M0,40 C360,80 720,40 1080,80 C1260,60 1380,80 1440,40 L1440,120 L0,120 Z",
//               "M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,120 L0,120 Z",
//             ],
//           }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <defs>
//           <linearGradient id="wave-fill" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#f9a8d4" />
//             <stop offset="50%" stopColor="#fda4af" />
//             <stop offset="100%" stopColor="#fdba74" />
//           </linearGradient>
//         </defs>
//       </svg>

//       {/* Тонкий узор */}
//       <div
//         className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//         }}
//       />
//     </div>
//   );
// }

// // ====== СТАТИЧНЫЙ ФОН ЛАЙТБОКСА (без анимаций - предотвращает мерцание) ======
// function ServiceCard({
//   service, categoryName, index, onOpenDetail, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; index: number;
//   onOpenDetail: () => void; onOpenGallery: (index: number) => void;
//   translations: Record<string, string>; locale: string;
// }) {
//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 18 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay: index * 0.04 }}
//       className="group"
//     >
//       <div
//         onClick={onOpenDetail}
//         className="
//           relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer
//           bg-white dark:bg-zinc-900/80
//           border-2 border-rose-200/70 dark:border-white/10
//           shadow-[0_8px_30px_-12px_rgba(244,63,94,0.25)] dark:shadow-[0_18px_55px_-28px_rgba(0,0,0,0.75)]
//           hover:shadow-[0_20px_50px_-15px_rgba(244,63,94,0.35)] dark:hover:shadow-[0_25px_60px_-20px_rgba(0,0,0,0.85)]
//           hover:border-rose-300 dark:hover:border-white/20
//           transition-all duration-500
//           sm:active:scale-[0.98] sm:hover:-translate-y-2
//         "
//       >
//         {/* Декоративный уголок */}
//         <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10 pointer-events-none">
//           <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rotate-45" />
//         </div>

//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden bg-white dark:bg-zinc-950">
//           {hasImage ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
//           ) : (
//             <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <Flower2 className="w-16 h-16 text-rose-300/70 dark:text-rose-200/20" />
//               </div>
//             </div>
//           )}

//           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-zinc-900 dark:via-zinc-900/40" />

//           {service.priceCents && (
//             <div className="absolute top-3 right-3">
//               <span className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-bold shadow-lg border border-rose-200/50 dark:border-white/10">
//                 {translations.from} {formatPrice(service.priceCents, locale)}
//               </span>
//             </div>
//           )}

//           {service.gallery.length > 0 && (
//             <button
//               onClick={(e) => { e.stopPropagation(); onOpenGallery(0); }}
//               className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-white dark:bg-white/10 backdrop-blur-sm flex items-center gap-1.5 text-rose-500 dark:text-rose-200 text-xs hover:bg-rose-50 dark:hover:bg-white/15 transition-colors shadow-lg border border-rose-200/50 dark:border-white/10"
//             >
//               <Images className="w-3.5 h-3.5" />
//               {service.gallery.length}
//             </button>
//           )}

//           <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
//             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-medium backdrop-blur-sm shadow-md">
//               <Heart className="h-2.5 w-2.5" fill="currentColor" />
//               {categoryName}
//             </span>
//           </div>
//         </div>

//         <div className="relative overflow-hidden p-4 sm:p-5 bg-gradient-to-b from-transparent to-rose-50/30 dark:from-rose-950/80 dark:via-slate-950/90 dark:to-purple-950/80">
//           {/* Сердечки для светлой темы - плавное движение */}
//           <div className="absolute inset-0 pointer-events-none dark:hidden">
//             {[...Array(5)].map((_, i) => (
//               <motion.div
//                 key={`light-heart-${i}`}
//                 className="absolute"
//                 style={{ left: `${(i * 20) % 100}%`, top: `${(i * 22) % 100}%` }}
//                 animate={{
//                   y: [0, -12, 0],
//                   x: [0, i % 2 === 0 ? 6 : -6, 0],
//                 }}
//                 transition={{
//                   duration: 7 + (i % 3) * 2,
//                   repeat: Infinity,
//                   delay: i * 0.6,
//                   ease: "easeInOut",
//                 }}
//               >
//                 <Heart
//                   className={`${i % 2 === 0 ? "w-3.5 h-3.5" : "w-3 h-3"} text-rose-400/60 drop-shadow-[0_1px_6px_rgba(244,63,94,0.25)]`}
//                   fill="currentColor"
//                 />
//               </motion.div>
//             ))}
//           </div>

//           {/* Сердечки для тёмной темы - плавное движение */}
//           <div className="absolute inset-0 pointer-events-none hidden dark:block">
//             {[...Array(5)].map((_, i) => (
//               <motion.div
//                 key={`dark-heart-${i}`}
//                 className="absolute"
//                 style={{ left: `${(i * 20) % 100}%`, top: `${(i * 22) % 100}%` }}
//                 animate={{
//                   y: [0, -10, 0],
//                   x: [0, i % 2 === 0 ? 5 : -5, 0],
//                 }}
//                 transition={{
//                   duration: 8 + (i % 3) * 2,
//                   repeat: Infinity,
//                   delay: i * 0.6,
//                   ease: "easeInOut",
//                 }}
//               >
//                 <Heart
//                   className={`${i % 2 === 0 ? "w-2.5 h-2.5" : "w-2 h-2"} text-rose-400/25`}
//                   fill="currentColor"
//                 />
//               </motion.div>
//             ))}
//           </div>

//           <div className="relative z-10">
//             <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors"
//                 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//               {service.name}
//             </h3>

//             {service.description && (
//               <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">{service.description}</p>
//             )}

//             <div className="flex items-center gap-3 mb-4">
//               <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm">
//                 <Clock className="w-3.5 h-3.5 text-rose-400 dark:text-rose-300" />
//                 {service.durationMin} {translations.minutes}
//               </span>
//             </div>

//             <Link
//               href={`/booking?service=${service.id}`}
//               onClick={(e) => e.stopPropagation()}
//               className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-rose-300/40"
//             >
//               {translations.bookNow}
//               <ChevronRight className="w-4 h-4" />
//             </Link>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ====== ГЛАВНЫЙ КОМПОНЕНТ ======
// export default function ServicesClient({ categories, locale }: Props) {
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [selectedService, setSelectedService] = useState<{ service: ServiceChild; categoryName: string } | null>(null);
//   const [lightbox, setLightbox] = useState<{ isOpen: boolean; images: GalleryItem[]; currentIndex: number; serviceName: string } | null>(null);

//   const translations = t[locale] || t.de;

//   const openServiceDetail = useCallback((service: ServiceChild, categoryName: string) => setSelectedService({ service, categoryName }), []);
//   const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => setLightbox({ isOpen: true, images, currentIndex: index, serviceName }), []);
//   const closeLightbox = useCallback(() => setLightbox(null), []);
//   const goToPrev = useCallback(() => { if (!lightbox) return; setLightbox({ ...lightbox, currentIndex: lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1 }); }, [lightbox]);
//   const goToNext = useCallback(() => { if (!lightbox) return; setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length }); }, [lightbox]);

//   const filteredCategories = categories.filter((cat) => !activeCategory || cat.id === activeCategory);

//   return (
//     <>
//       <style jsx global>{`
//         @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&display=swap");
//       `}</style>

//       <main className="relative min-h-screen overflow-hidden isolate">
//         <PageBackground />

//         <div className="relative z-10">
//           <AnimatePresence>
//             {lightbox?.isOpen && (
//               <GalleryLightbox images={lightbox.images} currentIndex={lightbox.currentIndex} onClose={closeLightbox} onPrev={goToPrev} onNext={goToNext} serviceName={lightbox.serviceName} />
//             )}
//           </AnimatePresence>

//           <AnimatePresence>
//             {selectedService && (
//               <ServiceDetailModal
//                 service={selectedService.service} categoryName={selectedService.categoryName}
//                 onClose={() => setSelectedService(null)}
//                 onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)}
//                 translations={translations} locale={locale}
//               />
//             )}
//           </AnimatePresence>

//           {/* Hero */}
//           <section className="relative pt-8 pb-6 sm:pt-16 sm:pb-12">
//             <div className="container mx-auto px-4">
//               <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
//                   className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur border border-rose-200 dark:border-white/10 shadow-lg shadow-rose-200/30 mb-4 sm:mb-6"
//                 >
//                   <Sparkles className="w-4 h-4 text-rose-500 dark:text-rose-200" />
//                   <span className="text-sm font-medium text-rose-600 dark:text-rose-200">Premium Beauty Salon</span>
//                 </motion.div>

//                 <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                   <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent drop-shadow-sm">
//                     {translations.title}
//                   </span>
//                 </h1>

//                 <div className="flex justify-center items-center gap-3 mb-4">
//                   <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
//                   <Heart className="w-5 h-5 text-rose-500 dark:text-rose-300" fill="currentColor" />
//                   <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
//                 </div>

//                 <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-200/90 mb-6 sm:mb-8 px-4"
//                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>
//                   {translations.subtitle}
//                 </p>

//                 <Link href="/booking"
//                   className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-full text-white font-semibold text-sm sm:text-base shadow-xl shadow-rose-300/50 transition-all active:scale-95 hover:scale-105">
//                   {translations.bookNow}
//                   <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//                 </Link>
//               </motion.div>
//             </div>
//           </section>

//           {/* Фильтр категорий */}
//           <section className="sticky top-16 z-40">
//             <div className="bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl border-y border-rose-200/50 dark:border-white/10">
//               <div className="container mx-auto px-4">
//                 <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
//                   <button
//                     onClick={() => setActiveCategory(null)}
//                     className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
//                       activeCategory === null
//                         ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40"
//                         : "bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-white/12 border border-rose-200 dark:border-white/10"
//                     }`}
//                   >
//                     {translations.allCategories}
//                   </button>
//                   {categories.map((cat) => {
//                     const Icon = getCategoryIcon(cat.slug);
//                     return (
//                       <button
//                         key={cat.id}
//                         onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
//                         className={`flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
//                           activeCategory === cat.id
//                             ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-300/40"
//                             : "bg-white dark:bg-white/8 text-zinc-600 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-white/12 border border-rose-200 dark:border-white/10"
//                         }`}
//                       >
//                         <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                         <span className="whitespace-nowrap">{cat.name}</span>
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Услуги */}
//           <section className="py-8 sm:py-12 lg:py-16 relative">
//             <div className="container mx-auto px-4">
//               {filteredCategories.map((category, catIndex) => (
//                 <motion.div key={category.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: catIndex * 0.08 }} className="mb-12 sm:mb-16 last:mb-0">
//                   <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
//                     <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white dark:bg-white/7 border border-rose-200 dark:border-white/10 shadow-lg shadow-rose-200/20 backdrop-blur">
//                       {(() => { const Icon = getCategoryIcon(category.slug); return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 dark:text-rose-200" />; })()}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100 truncate"
//                           style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                         {category.name}
//                       </h2>
//                       <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-300">
//                         {category.children.length} {translations.services}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
//                     {category.children.map((service, index) => (
//                       <ServiceCard key={service.id} service={service} categoryName={category.name} index={index}
//                         onOpenDetail={() => openServiceDetail(service, category.name)}
//                         onOpenGallery={(idx) => openLightbox(service.gallery, idx, service.name)}
//                         translations={translations} locale={locale}
//                       />
//                     ))}
//                   </div>
//                 </motion.div>
//               ))}

//               {categories.length === 0 && (
//                 <div className="text-center py-16 sm:py-20">
//                   <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white dark:bg-white/8 flex items-center justify-center border border-rose-200 dark:border-white/10 shadow-lg">
//                     <Flower2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 dark:text-rose-200" />
//                   </div>
//                   <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-300">{translations.noServices}</p>
//                 </div>
//               )}
//             </div>
//           </section>

//           {/* Нижний CTA */}
//           <section className="py-12 sm:py-20 relative overflow-hidden">
//             <div className="absolute inset-0 bg-gradient-to-r from-rose-100/70 via-pink-50/70 to-amber-50/70 dark:from-black/25 dark:via-black/20 dark:to-black/25" />
//             <div className="relative container mx-auto px-4 text-center">
//               <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
//                 <div className="flex justify-center mb-4">
//                   <div className="flex items-center gap-3">
//                     <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//                     <div className="w-10 h-px bg-gradient-to-r from-rose-400 to-transparent" />
//                     <Heart className="w-5 h-5 text-rose-500 dark:text-rose-300" fill="currentColor" />
//                     <div className="w-10 h-px bg-gradient-to-l from-rose-400 to-transparent" />
//                     <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//                   </div>
//                 </div>

//                 <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 sm:mb-4"
//                     style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                   {translations.trustText}
//                 </h2>

//                 <p className="text-zinc-600 dark:text-zinc-200 mb-6 sm:mb-8 max-w-md mx-auto"
//                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>
//                   {translations.welcomeText}
//                 </p>

//                 <Link href="/booking"
//                   className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-rose-300/50 transition-all active:scale-95 hover:scale-105">
//                   {translations.bookNow}
//                   <ArrowRight className="w-5 h-5" />
//                 </Link>
//               </motion.div>
//             </div>
//           </section>
//         </div>
//       </main>
//     </>
//   );
// }


