// src/app/services/ServicesClient.tsx
"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  ChevronRight,
  ChevronLeft,
  Scissors,
  Palette,
  Heart,
  Star,
  ArrowRight,
  X,
  Images,
  ZoomIn,
  Euro,
  Calendar,
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

const GalleryLightboxBackground = memo(() => (
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
    <div
      className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
      style={{
        background:
          "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)",
      }}
    />
    <div
      className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25"
      style={{
        background:
          "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
      }}
    />
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
      style={{
        background:
          "radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 60%)",
      }}
    />
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="absolute pointer-events-none"
        style={{ left: `${(i * 10) % 100}%`, top: `${(i * 11) % 100}%` }}
      >
        <Heart
          className={`${i % 3 === 0 ? "w-5 h-5" : i % 3 === 1 ? "w-4 h-4" : "w-3 h-3"} text-rose-400/30`}
          fill="currentColor"
        />
      </div>
    ))}
    {[...Array(15)].map((_, i) => (
      <div
        key={`star-${i}`}
        className="absolute w-1 h-1 rounded-full bg-white/20"
        style={{ left: `${(i * 6.5) % 100}%`, top: `${(i * 7) % 100}%` }}
      />
    ))}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
  </div>
));
GalleryLightboxBackground.displayName = "GalleryLightboxBackground";

function GalleryLightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  serviceName,
}: {
  images: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  serviceName: string;
}) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const minSwipeDistance = 50;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    setDragOffset(currentTouch - touchStart);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && images.length > 1) onNext();
    else if (distance < -minSwipeDistance && images.length > 1) onPrev();
    setIsDragging(false);
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const currentImage = images[currentIndex];
  const swipeDirection = dragOffset > 0 ? 1 : -1;

  const lightbox = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      onClick={onClose}
    >
      <GalleryLightboxBackground />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      <div className="absolute top-4 left-4 z-50">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
          <p className="text-white font-medium">
            {currentIndex + 1}{" "}
            <span className="text-white/60">/ {images.length}</span>
          </p>
        </div>
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            <ChevronLeft className="w-4 h-4 text-white/70" />
            <span className="text-white/70 text-xs font-medium">Свайп</span>
            <ChevronRight className="w-4 h-4 text-white/70" />
          </div>
        </div>
      )}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6" : "bg-white/40 w-2"}`}
              />
            ))}
          </div>
        </div>
      )}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: swipeDirection * 50 }}
        animate={{ opacity: 1, x: isDragging ? dragOffset * 0.3 : 0 }}
        exit={{ opacity: 0, x: -swipeDirection * 50 }}
        transition={{ type: "tween", duration: 0.2 }}
        className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none transform-gpu will-change-transform"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-y" }}
      >
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
          <Image
            src={currentImage.image}
            alt={currentImage.caption || serviceName}
            width={800}
            height={600}
            className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
            draggable={false}
            priority
          />
          {currentImage.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <p className="text-white text-center text-sm font-medium">
                {currentImage.caption}
              </p>
            </div>
          )}
        </div>
        {isDragging && Math.abs(dragOffset) > 30 && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${dragOffset > 0 ? "left-2" : "right-2"}`}
          >
            <div className="p-3 rounded-full bg-black/50 backdrop-blur-md">
              {dragOffset > 0 ? (
                <ChevronLeft className="w-6 h-6 text-white" />
              ) : (
                <ChevronRight className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(lightbox, document.body);
}

function ServiceDetailModal({
  service,
  categoryName,
  onClose,
  onOpenGallery,
  translations,
  locale,
}: {
  service: ServiceChild;
  categoryName: string;
  onClose: () => void;
  onOpenGallery: (index: number) => void;
  translations: Record<string, string>;
  locale: string;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const hasImage = service.cover || service.gallery.length > 0;
  const imageUrl = service.cover || service.gallery[0]?.image;

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] flex items-start justify-center pt-0 lg:pt-16 bg-black/70 lg:bg-black/80 backdrop-blur-sm lg:backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full lg:w-auto lg:max-w-5xl xl:max-w-6xl h-screen min-h-screen max-h-screen lg:h-auto lg:max-h-[85vh] lg:mx-4 overflow-hidden bg-white dark:bg-slate-950 rounded-t-3xl lg:rounded-3xl shadow-2xl border border-rose-200/50 dark:border-rose-500/30 transform-gpu will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 hidden dark:block overflow-hidden rounded-t-3xl lg:rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)",
            }}
          />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
            >
              <Heart
                className={`${i % 2 === 0 ? "w-4 h-4" : "w-3 h-3"} text-rose-400/30`}
                fill="currentColor"
              />
            </div>
          ))}
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row h-full max-h-screen lg:max-h-[85vh]">
          <div className="lg:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-rose-400/50" />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 lg:top-4 lg:right-4 z-20 p-2 lg:p-2.5 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-black/50 dark:hover:bg-black/70 dark:text-rose-300 transition-colors shadow-lg border border-transparent dark:border-white/10"
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <div className="relative flex-shrink-0 h-48 sm:h-64 lg:h-auto lg:w-[45%] xl:w-[50%] overflow-hidden bg-black lg:rounded-l-3xl">
            {hasImage ? (
              <Image
                src={imageUrl!}
                alt={service.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-rose-500/20 dark:via-pink-500/20 dark:to-purple-500/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white dark:from-slate-950 dark:via-slate-950/30 dark:to-transparent lg:dark:from-transparent lg:dark:via-transparent lg:dark:to-slate-950" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">
                {categoryName}
              </span>
            </div>
            {service.priceCents && (
              <div className="absolute bottom-4 right-4 lg:hidden">
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30">
                  {translations.from} {formatPrice(service.priceCents, locale)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto lg:overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8 lg:pl-6">
              <div className="lg:flex lg:items-start lg:justify-between lg:gap-4 mb-4 lg:mb-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-800 dark:text-white pr-8 lg:pr-0 font-playfair">
                  {service.name}
                </h2>
                {service.priceCents && (
                  <div className="hidden lg:block flex-shrink-0 mt-1">
                    <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-rose-500/30">
                      {translations.from}{" "}
                      {formatPrice(service.priceCents, locale)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-5 lg:mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-200 text-sm lg:text-base">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-rose-500 dark:text-rose-400" />
                  {service.durationMin} {translations.minutes}
                </div>
                {service.priceCents && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-200 text-sm lg:text-base lg:hidden">
                    <Euro className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 dark:text-amber-400" />
                    {translations.from}{" "}
                    {formatPrice(service.priceCents, locale)}
                  </div>
                )}
              </div>
              {service.description && (
                <div className="relative mb-6 lg:mb-8 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none dark:hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={`light-desc-heart-${i}`}
                        className="absolute"
                        style={{
                          left: `${(i * 16) % 100}%`,
                          top: `${(i * 18) % 100}%`,
                        }}
                        animate={{
                          y: [0, -15, 0],
                          x: [0, i % 2 === 0 ? 8 : -8, 0],
                        }}
                        transition={{
                          duration: 8 + (i % 3) * 2,
                          repeat: Infinity,
                          delay: i * 0.5,
                          ease: "easeInOut",
                        }}
                      >
                        <Heart
                          className={`${i % 2 === 0 ? "w-4 h-4" : "w-3.5 h-3.5"} text-rose-400/60`}
                          fill="currentColor"
                        />
                      </motion.div>
                    ))}
                  </div>
                  <div className="absolute inset-0 pointer-events-none hidden dark:block">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={`dark-desc-heart-${i}`}
                        className="absolute"
                        style={{
                          left: `${(i * 16) % 100}%`,
                          top: `${(i * 18) % 100}%`,
                        }}
                        animate={{
                          y: [0, -12, 0],
                          x: [0, i % 2 === 0 ? 6 : -6, 0],
                        }}
                        transition={{
                          duration: 9 + (i % 3) * 2,
                          repeat: Infinity,
                          delay: i * 0.5,
                          ease: "easeInOut",
                        }}
                      >
                        <Heart
                          className={`${i % 2 === 0 ? "w-3 h-3" : "w-2.5 h-2.5"} text-rose-400/30`}
                          fill="currentColor"
                        />
                      </motion.div>
                    ))}
                  </div>
                  <p className="relative z-10 text-zinc-600 dark:text-rose-100/80 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </div>
              )}
              {service.gallery.length > 0 && (
                <div className="mb-6 lg:mb-8">
                  <h3 className="text-sm lg:text-base font-semibold text-zinc-700 dark:text-rose-100 mb-3 flex items-center gap-2">
                    <Images className="w-4 h-4 lg:w-5 lg:h-5 text-rose-500 dark:text-rose-400" />
                    {translations.ourWorks} ({service.gallery.length})
                  </h3>
                  <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3">
                    {service.gallery.slice(0, 10).map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => onOpenGallery(idx)}
                        className="relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden group shadow-md border border-rose-100 dark:border-rose-500/30"
                      >
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="80px"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/30 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 lg:w-6 lg:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4 lg:pb-0">
                <Link
                  href={`/booking?service=${service.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 lg:px-8 lg:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl lg:rounded-2xl text-white font-semibold lg:text-lg shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]"
                >
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6" />
                  {translations.bookNow}
                </Link>
                <button
                  onClick={onClose}
                  className="sm:w-auto px-6 py-3.5 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-rose-100 dark:border dark:border-rose-500/20 font-medium lg:text-lg transition-colors"
                >
                  {translations.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
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
      animate={{ opacity: 1, y: 0 }}
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

        <section className="py-8 sm:py-12 lg:py-16 relative">
          <div className="container mx-auto px-4">
            {filteredCategories.map((category, catIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
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
// const GalleryLightboxBackground = memo(() => (
//   <div className="absolute inset-0 -z-10">
//     <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
//     <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)" }} />
//     <div className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }} />
//     {[...Array(10)].map((_, i) => (
//       <div key={i} className="absolute pointer-events-none" style={{ left: `${(i * 10) % 100}%`, top: `${(i * 11) % 100}%` }}>
//         <Heart className={`${i % 2 === 0 ? 'w-5 h-5' : 'w-4 h-4'} text-rose-400/30`} fill="currentColor" />
//       </div>
//     ))}
//     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
//   </div>
// ));
// GalleryLightboxBackground.displayName = "GalleryLightboxBackground";

// // ====== ЛАЙТБОКС ======
// function GalleryLightbox({ images, currentIndex, onClose, onPrev, onNext, serviceName }: {
//   images: GalleryItem[]; currentIndex: number; onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") onPrev(); if (e.key === "ArrowRight") onNext(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); setIsDragging(true); };
//   const onTouchMove = (e: React.TouchEvent) => { if (!touchStart) return; const currentTouch = e.targetTouches[0].clientX; setTouchEnd(currentTouch); setDragOffset(currentTouch - touchStart); };
//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) { setIsDragging(false); setDragOffset(0); return; }
//     const distance = touchStart - touchEnd;
//     if (distance > minSwipeDistance && images.length > 1) onNext();
//     else if (distance < -minSwipeDistance && images.length > 1) onPrev();
//     setIsDragging(false); setDragOffset(0); setTouchStart(null); setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" onClick={onClose}>
//       <GalleryLightboxBackground />
//       <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors"><X className="w-6 h-6" /></button>
//       <div className="absolute top-4 left-4 z-50">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//           <p className="text-white font-medium">{currentIndex + 1} <span className="text-white/60">/ {images.length}</span></p>
//         </div>
//       </div>
//       {images.length > 1 && (<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           <ChevronLeft className="w-4 h-4 text-white/70" /><span className="text-white/70 text-xs font-medium">Свайп</span><ChevronRight className="w-4 h-4 text-white/70" />
//         </div>
//       </div>)}
//       {images.length > 1 && (<>
//         <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"><ChevronLeft className="w-8 h-8" /></button>
//         <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"><ChevronRight className="w-8 h-8" /></button>
//       </>)}
//       {images.length > 1 && (<div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
//         <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           {images.map((_, idx) => (<div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6" : "bg-white/40 w-2"}`} />))}
//         </div>
//       </div>)}
//       <motion.div key={currentIndex} initial={{ opacity: 0, x: swipeDirection * 50 }} animate={{ opacity: 1, x: isDragging ? dragOffset * 0.3 : 0 }} exit={{ opacity: 0, x: -swipeDirection * 50 }}
//         transition={{ type: "tween", duration: 0.2 }} className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ touchAction: "pan-y" }}>
//         <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
//           {/* ОПТИМИЗАЦИЯ: next/image вместо img */}
//           <Image src={currentImage.image} alt={currentImage.caption || serviceName} width={800} height={600} className="max-w-full max-h-[75vh] w-auto h-auto object-contain" draggable={false} priority />
//           {currentImage.caption && (<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent"><p className="text-white text-center text-sm font-medium">{currentImage.caption}</p></div>)}
//         </div>
//         {isDragging && Math.abs(dragOffset) > 30 && (<div className={`absolute top-1/2 -translate-y-1/2 ${dragOffset > 0 ? "left-2" : "right-2"}`}><div className="p-3 rounded-full bg-black/50 backdrop-blur-md">{dragOffset > 0 ? <ChevronLeft className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}</div></div>)}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({ service, categoryName, onClose, onOpenGallery, translations, locale }: {
//   service: ServiceChild; categoryName: string; onClose: () => void; onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end lg:items-center justify-center bg-black/70 lg:bg-black/80 backdrop-blur-sm lg:backdrop-blur-md" onClick={onClose}>
//       <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full lg:w-auto lg:max-w-5xl xl:max-w-6xl max-h-[92vh] lg:max-h-[85vh] lg:mx-4 overflow-hidden bg-white dark:bg-slate-950 rounded-t-3xl lg:rounded-3xl shadow-2xl border border-rose-200/50 dark:border-rose-500/30 transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()}>
//         {/* Фон для тёмной темы */}
//         <div className="absolute inset-0 hidden dark:block overflow-hidden rounded-t-3xl lg:rounded-3xl">
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
//           <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-40" style={{ background: "radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)" }} />
//           <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)" }} />
//           {[...Array(5)].map((_, i) => (<div key={i} className="absolute pointer-events-none" style={{ left: `${(i * 20) % 100}%`, top: `${(i * 22) % 100}%` }}><Heart className={`${i % 2 === 0 ? 'w-3 h-3' : 'w-2 h-2'} text-rose-400/25`} fill="currentColor" /></div>))}
//         </div>

//         <div className="relative z-10 flex flex-col lg:flex-row h-full max-h-[92vh] lg:max-h-[85vh]">
//           <div className="lg:hidden flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-rose-400/50" /></div>
//           <button onClick={onClose} className="absolute top-3 right-3 lg:top-4 lg:right-4 z-20 p-2 lg:p-2.5 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-black/50 dark:hover:bg-black/70 dark:text-rose-300 transition-colors shadow-lg border border-transparent dark:border-white/10"><X className="w-5 h-5 lg:w-6 lg:h-6" /></button>

//           {/* Изображение - ОПТИМИЗАЦИЯ: next/image */}
//           <div className="relative flex-shrink-0 h-48 sm:h-64 lg:h-auto lg:w-[45%] xl:w-[50%] overflow-hidden bg-black lg:rounded-l-3xl">
//             {hasImage ? (<Image src={imageUrl!} alt={service.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />)
//               : (<div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-rose-500/20 dark:via-pink-500/20 dark:to-purple-500/20" />)}
//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white dark:from-slate-950 dark:via-slate-950/30 dark:to-transparent lg:dark:from-transparent lg:dark:via-transparent lg:dark:to-slate-950" />
//             <div className="absolute top-4 left-4"><span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">{categoryName}</span></div>
//             {service.priceCents && (<div className="absolute bottom-4 right-4 lg:hidden"><span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30">{translations.from} {formatPrice(service.priceCents, locale)}</span></div>)}
//           </div>

//           {/* Контент */}
//           <div className="flex-1 overflow-y-auto">
//             <div className="p-4 sm:p-6 lg:p-8 lg:pl-6">
//               <div className="lg:flex lg:items-start lg:justify-between lg:gap-4 mb-4 lg:mb-6">
//                 <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-800 dark:text-white pr-8 lg:pr-0 font-playfair">{service.name}</h2>
//                 {service.priceCents && (<div className="hidden lg:block flex-shrink-0 mt-1"><span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-rose-500/30">{translations.from} {formatPrice(service.priceCents, locale)}</span></div>)}
//               </div>
//               <div className="flex flex-wrap gap-2 mb-5 lg:mb-6">
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-200 text-sm lg:text-base"><Clock className="w-4 h-4 lg:w-5 lg:h-5 text-rose-500 dark:text-rose-400" />{service.durationMin} {translations.minutes}</div>
//                 {service.priceCents && (<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-200 text-sm lg:hidden"><Euro className="w-4 h-4 text-amber-600 dark:text-amber-400" />{translations.from} {formatPrice(service.priceCents, locale)}</div>)}
//               </div>
//               {service.description && (<div className="relative mb-6 lg:mb-8"><p className="text-zinc-600 dark:text-rose-100/80 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-line">{service.description}</p></div>)}
//               {service.gallery.length > 0 && (<div className="mb-6 lg:mb-8">
//                 <h3 className="text-sm lg:text-base font-semibold text-zinc-700 dark:text-rose-100 mb-3 flex items-center gap-2"><Images className="w-4 h-4 lg:w-5 lg:h-5 text-rose-500 dark:text-rose-400" />{translations.ourWorks} ({service.gallery.length})</h3>
//                 <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3">
//                   {service.gallery.slice(0, 10).map((item, idx) => (<button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden group shadow-md border border-rose-100 dark:border-rose-500/30">
//                     {/* ОПТИМИЗАЦИЯ: next/image с lazy loading */}
//                     <Image src={item.image} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-110" sizes="80px" loading="lazy" />
//                     <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/30 transition-colors flex items-center justify-center"><ZoomIn className="w-5 h-5 lg:w-6 lg:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" /></div>
//                   </button>))}
//                 </div>
//               </div>)}
//               <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4 lg:pb-0">
//                 <Link href={`/booking?service=${service.id}`} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 lg:px-8 lg:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl lg:rounded-2xl text-white font-semibold lg:text-lg shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]"><Calendar className="w-5 h-5 lg:w-6 lg:h-6" />{translations.bookNow}</Link>
//                 <button onClick={onClose} className="sm:w-auto px-6 py-3.5 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-rose-100 dark:border dark:border-rose-500/20 font-medium lg:text-lg transition-colors">{translations.close}</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ ======
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
// const GalleryLightboxBackground = memo(() => (
//   <div className="absolute inset-0 -z-10">
//     <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
//     <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)" }} />
//     <div className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }} />
//     {[...Array(8)].map((_, i) => (
//       <div key={i} className="absolute pointer-events-none" style={{ left: `${(i * 12) % 100}%`, top: `${(i * 13) % 100}%` }}>
//         <Heart className={`${i % 2 === 0 ? 'w-4 h-4' : 'w-3 h-3'} text-rose-400/25`} fill="currentColor" />
//       </div>
//     ))}
//     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
//   </div>
// ));
// GalleryLightboxBackground.displayName = "GalleryLightboxBackground";

// // ====== ЛАЙТБОКС ======
// function GalleryLightbox({ images, currentIndex, onClose, onPrev, onNext, serviceName }: {
//   images: GalleryItem[]; currentIndex: number; onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") onPrev(); if (e.key === "ArrowRight") onNext(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); setIsDragging(true); };
//   const onTouchMove = (e: React.TouchEvent) => { if (!touchStart) return; const currentTouch = e.targetTouches[0].clientX; setTouchEnd(currentTouch); setDragOffset(currentTouch - touchStart); };
//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) { setIsDragging(false); setDragOffset(0); return; }
//     const distance = touchStart - touchEnd;
//     if (distance > minSwipeDistance && images.length > 1) onNext();
//     else if (distance < -minSwipeDistance && images.length > 1) onPrev();
//     setIsDragging(false); setDragOffset(0); setTouchStart(null); setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" onClick={onClose}>
//       <GalleryLightboxBackground />
//       <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors"><X className="w-6 h-6" /></button>
//       <div className="absolute top-4 left-4 z-50">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//           <p className="text-white font-medium">{currentIndex + 1} <span className="text-white/60">/ {images.length}</span></p>
//         </div>
//       </div>
//       {images.length > 1 && (<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           <ChevronLeft className="w-4 h-4 text-white/70" /><span className="text-white/70 text-xs font-medium">Свайп</span><ChevronRight className="w-4 h-4 text-white/70" />
//         </div>
//       </div>)}
//       {images.length > 1 && (<>
//         <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"><ChevronLeft className="w-8 h-8" /></button>
//         <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"><ChevronRight className="w-8 h-8" /></button>
//       </>)}
//       {images.length > 1 && (<div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
//         <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           {images.map((_, idx) => (<div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6" : "bg-white/40 w-2"}`} />))}
//         </div>
//       </div>)}
//       <motion.div key={currentIndex} initial={{ opacity: 0, x: swipeDirection * 50 }} animate={{ opacity: 1, x: isDragging ? dragOffset * 0.3 : 0 }} exit={{ opacity: 0, x: -swipeDirection * 50 }}
//         transition={{ type: "tween", duration: 0.2 }} className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ touchAction: "pan-y" }}>
//         <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
//           <Image src={currentImage.image} alt={currentImage.caption || serviceName} width={800} height={600} className="max-w-full max-h-[75vh] w-auto h-auto object-contain" draggable={false} priority />
//           {currentImage.caption && (<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent"><p className="text-white text-center text-sm font-medium">{currentImage.caption}</p></div>)}
//         </div>
//         {isDragging && Math.abs(dragOffset) > 30 && (<div className={`absolute top-1/2 -translate-y-1/2 ${dragOffset > 0 ? "left-2" : "right-2"}`}><div className="p-3 rounded-full bg-black/50 backdrop-blur-md">{dragOffset > 0 ? <ChevronLeft className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}</div></div>)}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({ service, categoryName, onClose, onOpenGallery, translations, locale }: {
//   service: ServiceChild; categoryName: string; onClose: () => void; onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end lg:items-center justify-center bg-black/70 lg:bg-black/80 backdrop-blur-sm lg:backdrop-blur-md" onClick={onClose}>
//       <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full lg:w-auto lg:max-w-5xl xl:max-w-6xl max-h-[92vh] lg:max-h-[85vh] lg:mx-4 overflow-hidden bg-white dark:bg-slate-950 rounded-t-3xl lg:rounded-3xl shadow-2xl border border-rose-200/50 dark:border-rose-500/30 transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()}>
//         {/* Фон для тёмной темы */}
//         <div className="absolute inset-0 hidden dark:block overflow-hidden rounded-t-3xl lg:rounded-3xl">
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
//           <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-40" style={{ background: "radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)" }} />
//           <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)" }} />
//           {[...Array(5)].map((_, i) => (<div key={i} className="absolute pointer-events-none" style={{ left: `${(i * 20) % 100}%`, top: `${(i * 22) % 100}%` }}><Heart className={`${i % 2 === 0 ? 'w-3 h-3' : 'w-2 h-2'} text-rose-400/25`} fill="currentColor" /></div>))}
//         </div>

//         <div className="relative z-10 flex flex-col lg:flex-row h-full max-h-[92vh] lg:max-h-[85vh]">
//           <div className="lg:hidden flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-rose-400/50" /></div>
//           <button onClick={onClose} className="absolute top-3 right-3 lg:top-4 lg:right-4 z-20 p-2 lg:p-2.5 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-black/50 dark:hover:bg-black/70 dark:text-rose-300 transition-colors shadow-lg border border-transparent dark:border-white/10"><X className="w-5 h-5 lg:w-6 lg:h-6" /></button>

//           {/* Изображение */}
//           <div className="relative flex-shrink-0 h-48 sm:h-64 lg:h-auto lg:w-[45%] xl:w-[50%] overflow-hidden bg-black lg:rounded-l-3xl">
//             {hasImage ? (<Image src={imageUrl!} alt={service.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />)
//               : (<div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-rose-500/20 dark:via-pink-500/20 dark:to-purple-500/20" />)}
//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white dark:from-slate-950 dark:via-slate-950/30 dark:to-transparent lg:dark:from-transparent lg:dark:via-transparent lg:dark:to-slate-950" />
//             <div className="absolute top-4 left-4"><span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">{categoryName}</span></div>
//             {service.priceCents && (<div className="absolute bottom-4 right-4 lg:hidden"><span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30">{translations.from} {formatPrice(service.priceCents, locale)}</span></div>)}
//           </div>

//           {/* Контент */}
//           <div className="flex-1 overflow-y-auto">
//             <div className="p-4 sm:p-6 lg:p-8 lg:pl-6">
//               <div className="lg:flex lg:items-start lg:justify-between lg:gap-4 mb-4 lg:mb-6">
//                 <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-800 dark:text-white pr-8 lg:pr-0" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{service.name}</h2>
//                 {service.priceCents && (<div className="hidden lg:block flex-shrink-0 mt-1"><span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-rose-500/30">{translations.from} {formatPrice(service.priceCents, locale)}</span></div>)}
//               </div>
//               <div className="flex flex-wrap gap-2 mb-5 lg:mb-6">
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-200 text-sm lg:text-base"><Clock className="w-4 h-4 lg:w-5 lg:h-5 text-rose-500 dark:text-rose-400" />{service.durationMin} {translations.minutes}</div>
//                 {service.priceCents && (<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-200 text-sm lg:hidden"><Euro className="w-4 h-4 text-amber-600 dark:text-amber-400" />{translations.from} {formatPrice(service.priceCents, locale)}</div>)}
//               </div>
//               {service.description && (<div className="relative mb-6 lg:mb-8"><p className="text-zinc-600 dark:text-rose-100/80 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-line">{service.description}</p></div>)}
//               {service.gallery.length > 0 && (<div className="mb-6 lg:mb-8">
//                 <h3 className="text-sm lg:text-base font-semibold text-zinc-700 dark:text-rose-100 mb-3 flex items-center gap-2"><Images className="w-4 h-4 lg:w-5 lg:h-5 text-rose-500 dark:text-rose-400" />{translations.ourWorks} ({service.gallery.length})</h3>
//                 <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3">
//                   {service.gallery.slice(0, 10).map((item, idx) => (<button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden group shadow-md border border-rose-100 dark:border-rose-500/30">
//                     <Image src={item.image} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-110" sizes="80px" loading="lazy" />
//                     <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/30 transition-colors flex items-center justify-center"><ZoomIn className="w-5 h-5 lg:w-6 lg:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" /></div>
//                   </button>))}
//                 </div>
//               </div>)}
//               <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4 lg:pb-0">
//                 <Link href={`/booking?service=${service.id}`} className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 lg:px-8 lg:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl lg:rounded-2xl text-white font-semibold lg:text-lg shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]"><Calendar className="w-5 h-5 lg:w-6 lg:h-6" />{translations.bookNow}</Link>
//                 <button onClick={onClose} className="sm:w-auto px-6 py-3.5 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-rose-100 dark:border dark:border-rose-500/20 font-medium lg:text-lg transition-colors">{translations.close}</button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ ======
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
// const GalleryLightboxBackground = memo(() => (
//   <div className="absolute inset-0 -z-10">
//     {/* Основной градиент */}
//     <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />

//     {/* Статичные сферы */}
//     <div
//       className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
//       style={{ background: "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)" }}
//     />
//     <div
//       className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25"
//       style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }}
//     />
//     <div
//       className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
//       style={{ background: "radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 60%)" }}
//     />

//     {/* Статичные сердечки */}
//     {[...Array(10)].map((_, i) => (
//       <div
//         key={i}
//         className="absolute pointer-events-none"
//         style={{ left: `${(i * 10) % 100}%`, top: `${(i * 11) % 100}%` }}
//       >
//         <Heart className={`${i % 3 === 0 ? 'w-5 h-5' : i % 3 === 1 ? 'w-4 h-4' : 'w-3 h-3'} text-rose-400/30`} fill="currentColor" />
//       </div>
//     ))}

//     {/* Статичные звёздочки */}
//     {[...Array(15)].map((_, i) => (
//       <div
//         key={`star-${i}`}
//         className="absolute w-1 h-1 rounded-full bg-white/20"
//         style={{ left: `${(i * 6.5) % 100}%`, top: `${(i * 7) % 100}%` }}
//       />
//     ))}

//     {/* Виньетка */}
//     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
//   </div>
// ));

// GalleryLightboxBackground.displayName = "GalleryLightboxBackground";

// // ====== ЛАЙТБОКС С ПОДДЕРЖКОЙ СВАЙПА ======
// function GalleryLightbox({
//   images, currentIndex, onClose, onPrev, onNext, serviceName,
// }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);

//   // Минимальное расстояние для свайпа (в пикселях)
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//     setIsDragging(true);
//   };

//   const onTouchMove = (e: React.TouchEvent) => {
//     if (!touchStart) return;
//     const currentTouch = e.targetTouches[0].clientX;
//     setTouchEnd(currentTouch);
//     setDragOffset(currentTouch - touchStart);
//   };

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) {
//       setIsDragging(false);
//       setDragOffset(0);
//       return;
//     }

//     const distance = touchStart - touchEnd;
//     const isLeftSwipe = distance > minSwipeDistance;
//     const isRightSwipe = distance < -minSwipeDistance;

//     if (isLeftSwipe && images.length > 1) {
//       onNext();
//     } else if (isRightSwipe && images.length > 1) {
//       onPrev();
//     }

//     setIsDragging(false);
//     setDragOffset(0);
//     setTouchStart(null);
//     setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];

//   // Направление анимации
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
//       onClick={onClose}
//     >
//       <GalleryLightboxBackground />
//       {/* Кнопка закрытия */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors"
//       >
//         <X className="w-6 h-6" />
//       </button>

//       {/* Счётчик с сердечком */}
//       <div className="absolute top-4 left-4 z-50">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//           <p className="text-white font-medium">{currentIndex + 1} <span className="text-white/60">/ {images.length}</span></p>
//         </div>
//       </div>

//       {/* Индикатор свайпа на мобильных */}
//       {images.length > 1 && (
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             <ChevronLeft className="w-4 h-4 text-white/70" />
//             <span className="text-white/70 text-xs font-medium">Свайп</span>
//             <ChevronRight className="w-4 h-4 text-white/70" />
//           </div>
//         </div>
//       )}

//       {/* Кнопки навигации (скрыты на мобильных) */}
//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}

//       {/* Точки-индикаторы */}
//       {images.length > 1 && (
//         <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
//           <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             {images.map((_, idx) => (
//               <div
//                 key={idx}
//                 className={`h-2 rounded-full transition-all duration-300 ${
//                   idx === currentIndex
//                     ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6"
//                     : "bg-white/40 w-2"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Изображение с поддержкой свайпа */}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, x: swipeDirection * 50 }}
//         animate={{
//           opacity: 1,
//           x: isDragging ? dragOffset * 0.3 : 0,
//         }}
//         exit={{ opacity: 0, x: -swipeDirection * 50 }}
//         transition={{
//           type: "tween",
//           duration: 0.2,
//         }}
//         className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()}
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//         style={{ touchAction: "pan-y" }}
//       >
//         {/* Контейнер изображения с НЕПРОЗРАЧНЫМ чёрным фоном */}
//         <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src={currentImage.image}
//             alt={currentImage.caption || serviceName}
//             className="max-w-full max-h-[75vh] object-contain pointer-events-none"
//             draggable={false}
//           />

//           {/* Подпись к фото */}
//           {currentImage.caption && (
//             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
//               <p className="text-white text-center text-sm font-medium">{currentImage.caption}</p>
//             </div>
//           )}
//         </div>

//         {/* Визуальная подсказка при свайпе */}
//         {isDragging && Math.abs(dragOffset) > 30 && (
//           <div
//             className={`absolute top-1/2 -translate-y-1/2 ${
//               dragOffset > 0 ? "left-2" : "right-2"
//             }`}
//           >
//             <div className="p-3 rounded-full bg-black/50 backdrop-blur-md">
//               {dragOffset > 0 ? (
//                 <ChevronLeft className="w-6 h-6 text-white" />
//               ) : (
//                 <ChevronRight className="w-6 h-6 text-white" />
//               )}
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({
//   service, categoryName, onClose, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end lg:items-center justify-center bg-black/70 lg:bg-black/80 backdrop-blur-sm lg:backdrop-blur-md"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ y: 100, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         exit={{ y: 100, opacity: 0 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full lg:w-auto lg:max-w-5xl xl:max-w-6xl max-h-[92vh] lg:max-h-[85vh] lg:mx-4 overflow-hidden bg-white dark:bg-slate-950 rounded-t-3xl lg:rounded-3xl shadow-2xl border border-rose-200/50 dark:border-rose-500/30 transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* ====== ФОН ДЛЯ ТЁМНОЙ ТЕМЫ ====== */}
//         <div className="absolute inset-0 hidden dark:block overflow-hidden rounded-t-3xl lg:rounded-3xl">
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />
//           <div
//             className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-40"
//             style={{ background: "radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)" }}
//           />
//           <div
//             className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-30"
//             style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)" }}
//           />
//           {[...Array(6)].map((_, i) => (
//             <div
//               key={i}
//               className="absolute pointer-events-none"
//               style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//             >
//               <Heart className={`${i % 2 === 0 ? 'w-4 h-4' : 'w-3 h-3'} text-rose-400/30`} fill="currentColor" />
//             </div>
//           ))}
//         </div>

//         {/* Контент модалки */}
//         <div className="relative z-10 flex flex-col lg:flex-row h-full max-h-[92vh] lg:max-h-[85vh]">

//           {/* Drag indicator для мобильных */}
//           <div className="lg:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
//             <div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-rose-400/50" />
//           </div>

//           {/* Кнопка закрытия */}
//           <button
//             onClick={onClose}
//             className="absolute top-3 right-3 lg:top-4 lg:right-4 z-20 p-2 lg:p-2.5 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-black/50 dark:hover:bg-black/70 dark:text-rose-300 transition-colors shadow-lg border border-transparent dark:border-white/10"
//           >
//             <X className="w-5 h-5 lg:w-6 lg:h-6" />
//           </button>

//           {/* ===== ИЗОБРАЖЕНИЕ (слева на десктопе) ===== */}
//           <div className="relative flex-shrink-0 h-48 sm:h-64 lg:h-auto lg:w-[45%] xl:w-[50%] overflow-hidden bg-black lg:rounded-l-3xl">
//             {hasImage ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img
//                 src={imageUrl}
//                 alt={service.name}
//                 className="w-full h-full object-cover lg:absolute lg:inset-0"
//               />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-rose-500/20 dark:via-pink-500/20 dark:to-purple-500/20" />
//             )}

//             {/* Градиент поверх изображения */}
//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white dark:from-slate-950 dark:via-slate-950/30 dark:to-transparent lg:dark:from-transparent lg:dark:via-transparent lg:dark:to-slate-950" />

//             {/* Бейдж категории */}
//             <div className="absolute top-4 left-4">
//               <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">
//                 {categoryName}
//               </span>
//             </div>

//             {/* Цена на изображении (только мобильные) */}
//             {service.priceCents && (
//               <div className="absolute bottom-4 right-4 lg:hidden">
//                 <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           {/* ===== КОНТЕНТ (справа на десктопе) ===== */}
//           <div className="flex-1 overflow-y-auto lg:overflow-y-auto">
//             <div className="p-4 sm:p-6 lg:p-8 lg:pl-6">

//               {/* Заголовок и цена */}
//               <div className="lg:flex lg:items-start lg:justify-between lg:gap-4 mb-4 lg:mb-6">
//                 <h2
//                   className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-800 dark:text-white pr-8 lg:pr-0"
//                   style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
//                 >
//                   {service.name}
//                 </h2>

//                 {/* Цена (только десктоп) */}
//                 {service.priceCents && (
//                   <div className="hidden lg:block flex-shrink-0 mt-1">
//                     <span className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-rose-500/30">
//                       {translations.from} {formatPrice(service.priceCents, locale)}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Бейджи времени и цены */}
//               <div className="flex flex-wrap gap-2 mb-5 lg:mb-6">
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-200 text-sm lg:text-base">
//                   <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-rose-500 dark:text-rose-400" />
//                   {service.durationMin} {translations.minutes}
//                 </div>
//                 {service.priceCents && (
//                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-200 text-sm lg:text-base lg:hidden">
//                     <Euro className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 dark:text-amber-400" />
//                     {translations.from} {formatPrice(service.priceCents, locale)}
//                   </div>
//                 )}
//               </div>

//               {/* Описание */}
//               {service.description && (
//                 <div className="relative mb-6 lg:mb-8 overflow-hidden">
//                   {/* Сердечки для светлой темы */}
//                   <div className="absolute inset-0 pointer-events-none dark:hidden">
//                     {[...Array(6)].map((_, i) => (
//                       <motion.div
//                         key={`light-desc-heart-${i}`}
//                         className="absolute"
//                         style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//                         animate={{ y: [0, -15, 0], x: [0, i % 2 === 0 ? 8 : -8, 0] }}
//                         transition={{ duration: 8 + (i % 3) * 2, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
//                       >
//                         <Heart className={`${i % 2 === 0 ? "w-4 h-4" : "w-3.5 h-3.5"} text-rose-400/60`} fill="currentColor" />
//                       </motion.div>
//                     ))}
//                   </div>

//                   {/* Сердечки для тёмной темы */}
//                   <div className="absolute inset-0 pointer-events-none hidden dark:block">
//                     {[...Array(6)].map((_, i) => (
//                       <motion.div
//                         key={`dark-desc-heart-${i}`}
//                         className="absolute"
//                         style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//                         animate={{ y: [0, -12, 0], x: [0, i % 2 === 0 ? 6 : -6, 0] }}
//                         transition={{ duration: 9 + (i % 3) * 2, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
//                       >
//                         <Heart className={`${i % 2 === 0 ? "w-3 h-3" : "w-2.5 h-2.5"} text-rose-400/30`} fill="currentColor" />
//                       </motion.div>
//                     ))}
//                   </div>

//                   <p className="relative z-10 text-zinc-600 dark:text-rose-100/80 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-line">
//                     {service.description}
//                   </p>
//                 </div>
//               )}

//               {/* Галерея */}
//               {service.gallery.length > 0 && (
//                 <div className="mb-6 lg:mb-8">
//                   <h3 className="text-sm lg:text-base font-semibold text-zinc-700 dark:text-rose-100 mb-3 flex items-center gap-2">
//                     <Images className="w-4 h-4 lg:w-5 lg:h-5 text-rose-500 dark:text-rose-400" />
//                     {translations.ourWorks} ({service.gallery.length})
//                   </h3>
//                   <div className="grid grid-cols-4 lg:grid-cols-5 gap-2 lg:gap-3">
//                     {service.gallery.slice(0, 10).map((item, idx) => (
//                       <button
//                         key={item.id}
//                         onClick={() => onOpenGallery(idx)}
//                         className="relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden group shadow-md border border-rose-100 dark:border-rose-500/30"
//                       >
//                         {/* eslint-disable-next-line @next/next/no-img-element */}
//                         <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                         <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/30 transition-colors flex items-center justify-center">
//                           <ZoomIn className="w-5 h-5 lg:w-6 lg:h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                         </div>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Кнопки действий */}
//               <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4 lg:pb-0">
//                 <Link
//                   href={`/booking?service=${service.id}`}
//                   className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 lg:px-8 lg:py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl lg:rounded-2xl text-white font-semibold lg:text-lg shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]"
//                 >
//                   <Calendar className="w-5 h-5 lg:w-6 lg:h-6" />
//                   {translations.bookNow}
//                 </Link>
//                 <button
//                   onClick={onClose}
//                   className="sm:w-auto px-6 py-3.5 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-rose-100 dark:border dark:border-rose-500/20 font-medium lg:text-lg transition-colors"
//                 >
//                   {translations.close}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ - УЛУЧШЕННАЯ ======
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

// ------------делаем адаптацию под десктоп---------
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
// const GalleryLightboxBackground = memo(() => (
//   <div className="absolute inset-0 -z-10">
//     {/* Основной градиент */}
//     <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />

//     {/* Статичные сферы */}
//     <div
//       className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
//       style={{ background: "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)" }}
//     />
//     <div
//       className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25"
//       style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }}
//     />
//     <div
//       className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
//       style={{ background: "radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 60%)" }}
//     />

//     {/* Статичные сердечки */}
//     {[...Array(10)].map((_, i) => (
//       <div
//         key={i}
//         className="absolute pointer-events-none"
//         style={{ left: `${(i * 10) % 100}%`, top: `${(i * 11) % 100}%` }}
//       >
//         <Heart className={`${i % 3 === 0 ? 'w-5 h-5' : i % 3 === 1 ? 'w-4 h-4' : 'w-3 h-3'} text-rose-400/30`} fill="currentColor" />
//       </div>
//     ))}

//     {/* Статичные звёздочки */}
//     {[...Array(15)].map((_, i) => (
//       <div
//         key={`star-${i}`}
//         className="absolute w-1 h-1 rounded-full bg-white/20"
//         style={{ left: `${(i * 6.5) % 100}%`, top: `${(i * 7) % 100}%` }}
//       />
//     ))}

//     {/* Виньетка */}
//     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
//   </div>
// ));

// GalleryLightboxBackground.displayName = "GalleryLightboxBackground";

// // ====== ЛАЙТБОКС С ПОДДЕРЖКОЙ СВАЙПА ======
// function GalleryLightbox({
//   images, currentIndex, onClose, onPrev, onNext, serviceName,
// }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);

//   // Минимальное расстояние для свайпа (в пикселях)
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//     setIsDragging(true);
//   };

//   const onTouchMove = (e: React.TouchEvent) => {
//     if (!touchStart) return;
//     const currentTouch = e.targetTouches[0].clientX;
//     setTouchEnd(currentTouch);
//     setDragOffset(currentTouch - touchStart);
//   };

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) {
//       setIsDragging(false);
//       setDragOffset(0);
//       return;
//     }

//     const distance = touchStart - touchEnd;
//     const isLeftSwipe = distance > minSwipeDistance;
//     const isRightSwipe = distance < -minSwipeDistance;

//     if (isLeftSwipe && images.length > 1) {
//       onNext();
//     } else if (isRightSwipe && images.length > 1) {
//       onPrev();
//     }

//     setIsDragging(false);
//     setDragOffset(0);
//     setTouchStart(null);
//     setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];

//   // Направление анимации
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
//       onClick={onClose}
//     >
//       <GalleryLightboxBackground />
//       {/* Кнопка закрытия */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors"
//       >
//         <X className="w-6 h-6" />
//       </button>

//       {/* Счётчик с сердечком */}
//       <div className="absolute top-4 left-4 z-50">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//           <p className="text-white font-medium">{currentIndex + 1} <span className="text-white/60">/ {images.length}</span></p>
//         </div>
//       </div>

//       {/* Индикатор свайпа на мобильных */}
//       {images.length > 1 && (
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             <ChevronLeft className="w-4 h-4 text-white/70" />
//             <span className="text-white/70 text-xs font-medium">Swipe</span>
//             <ChevronRight className="w-4 h-4 text-white/70" />
//           </div>
//         </div>
//       )}

//       {/* Кнопки навигации (скрыты на мобильных) */}
//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-colors hidden sm:flex"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}

//       {/* Точки-индикаторы */}
//       {images.length > 1 && (
//         <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
//           <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             {images.map((_, idx) => (
//               <div
//                 key={idx}
//                 className={`h-2 rounded-full transition-all duration-300 ${
//                   idx === currentIndex
//                     ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6"
//                     : "bg-white/40 w-2"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Изображение с поддержкой свайпа */}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, x: swipeDirection * 50 }}
//         animate={{
//           opacity: 1,
//           x: isDragging ? dragOffset * 0.3 : 0,
//         }}
//         exit={{ opacity: 0, x: -swipeDirection * 50 }}
//         transition={{
//           type: "tween",
//           duration: 0.2,
//         }}
//         className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()}
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//         style={{ touchAction: "pan-y" }}
//       >
//         {/* Контейнер изображения с НЕПРОЗРАЧНЫМ чёрным фоном */}
//         <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src={currentImage.image}
//             alt={currentImage.caption || serviceName}
//             className="max-w-full max-h-[75vh] object-contain pointer-events-none"
//             draggable={false}
//           />

//           {/* Подпись к фото */}
//           {currentImage.caption && (
//             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
//               <p className="text-white text-center text-sm font-medium">{currentImage.caption}</p>
//             </div>
//           )}
//         </div>

//         {/* Визуальная подсказка при свайпе */}
//         {isDragging && Math.abs(dragOffset) > 30 && (
//           <div
//             className={`absolute top-1/2 -translate-y-1/2 ${
//               dragOffset > 0 ? "left-2" : "right-2"
//             }`}
//           >
//             <div className="p-3 rounded-full bg-black/50 backdrop-blur-md">
//               {dragOffset > 0 ? (
//                 <ChevronLeft className="w-6 h-6 text-white" />
//               ) : (
//                 <ChevronRight className="w-6 h-6 text-white" />
//               )}
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({
//   service, categoryName, onClose, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   return (
//     <motion.div
//       className="fixed inset-0 z-[90] flex items-start justify-center bg-white/95 dark:bg-black/75 sm:bg-black/50 sm:dark:bg-black/50 backdrop-blur-0 sm:backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-transparent sm:rounded-3xl rounded-t-3xl shadow-2xl border border-rose-200/80 dark:border-rose-500/60 sm:border-rose-200/50 sm:dark:border-rose-500/30 transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()}>

//         {/* Тонкая маска сверху для мобильной тёмной темы (убирает краткий "просвет") */}
//         <div className="absolute -top-px left-0 right-0 h-3 sm:hidden hidden dark:block z-20 pointer-events-none bg-gradient-to-r from-rose-950 via-slate-950 to-purple-950" />
//         <div className="absolute top-2 left-0 right-0 h-px sm:hidden hidden dark:block z-20 pointer-events-none bg-gradient-to-r from-rose-950/50 via-slate-950/40 to-purple-950/50" />

//         {/* ====== КРАСИВЫЙ ФОН ДЛЯ ТЁМНОЙ ТЕМЫ (статичный) ====== */}
//         <div className="absolute inset-0 hidden dark:block overflow-hidden rounded-t-3xl sm:rounded-3xl">
//           {/* Основной градиент */}
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />

//           {/* Статичные сферы */}
//           <div
//             className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-40"
//             style={{ background: "radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)" }}
//           />
//           <div
//             className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-30"
//             style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)" }}
//           />
//           <div
//             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-20"
//             style={{ background: "radial-gradient(circle, rgba(251,113,133,0.4) 0%, transparent 60%)" }}
//           />

//           {/* Статичные сердечки */}
//           {[...Array(6)].map((_, i) => (
//             <div
//               key={i}
//               className="absolute pointer-events-none"
//               style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//             >
//               <Heart className={`${i % 2 === 0 ? 'w-4 h-4' : 'w-3 h-3'} text-rose-400/30`} fill="currentColor" />
//             </div>
//           ))}
//         </div>

//         {/* Контент модалки */}
//         <div className="relative z-10">
//           <div className="sm:hidden flex justify-center pt-3 pb-1">
//             <div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-rose-400/50" />
//           </div>

//           <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-black/50 dark:hover:bg-black/70 dark:text-rose-300 transition-colors shadow-lg border border-transparent dark:border-white/10">
//             <X className="w-5 h-5" />
//           </button>

//           <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//             {/* Контейнер изображения с НЕПРОЗРАЧНЫМ фоном */}
//             <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden bg-black">
//               {service.cover || service.gallery.length > 0 ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//               ) : (
//                 <div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-rose-500/20 dark:via-pink-500/20 dark:to-purple-500/20" />
//               )}
//               <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-black/90 dark:via-black/40 dark:to-transparent" />

//               <div className="absolute top-4 left-4">
//                 <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">
//                   {categoryName}
//                 </span>
//               </div>

//               {service.priceCents && (
//                 <div className="absolute bottom-4 right-4">
//                   <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/30">
//                     {translations.from} {formatPrice(service.priceCents, locale)}
//                   </span>
//                 </div>
//               )}
//             </div>

//             <div className="relative p-4 sm:p-6 sm:-mt-6 bg-white dark:bg-gradient-to-b dark:from-rose-950/90 dark:via-slate-950/95 dark:to-purple-950/90 sm:bg-transparent sm:dark:bg-transparent">
//               <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-white mb-4 pr-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                 {service.name}
//               </h2>

//               <div className="flex flex-wrap gap-2 mb-5">
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-200 text-sm">
//                   <Clock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
//                   {service.durationMin} {translations.minutes}
//                 </div>
//                 {service.priceCents && (
//                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-200 text-sm">
//                     <Euro className="w-4 h-4 text-amber-600 dark:text-amber-400" />
//                     {translations.from} {formatPrice(service.priceCents, locale)}
//                   </div>
//                 )}
//             </div>

//             {service.description && (
//               <div className="relative mb-6 overflow-hidden">
//                 {/* Сердечки для светлой темы - плавное движение */}
//                 <div className="absolute inset-0 pointer-events-none dark:hidden">
//                   {[...Array(6)].map((_, i) => (
//                     <motion.div
//                       key={`light-desc-heart-${i}`}
//                       className="absolute"
//                       style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//                       animate={{
//                         y: [0, -15, 0],
//                         x: [0, i % 2 === 0 ? 8 : -8, 0],
//                       }}
//                       transition={{
//                         duration: 8 + (i % 3) * 2,
//                         repeat: Infinity,
//                         delay: i * 0.5,
//                         ease: "easeInOut",
//                       }}
//                     >
//                       <Heart
//                         className={`${i % 2 === 0 ? "w-4 h-4" : "w-3.5 h-3.5"} text-rose-400/60 drop-shadow-[0_1px_6px_rgba(244,63,94,0.25)]`}
//                         fill="currentColor"
//                       />
//                     </motion.div>
//                   ))}
//                 </div>

//                 {/* Сердечки для тёмной темы - плавное движение */}
//                 <div className="absolute inset-0 pointer-events-none hidden dark:block">
//                   {[...Array(6)].map((_, i) => (
//                     <motion.div
//                       key={`dark-desc-heart-${i}`}
//                       className="absolute"
//                       style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//                       animate={{
//                         y: [0, -12, 0],
//                         x: [0, i % 2 === 0 ? 6 : -6, 0],
//                       }}
//                       transition={{
//                         duration: 9 + (i % 3) * 2,
//                         repeat: Infinity,
//                         delay: i * 0.5,
//                         ease: "easeInOut",
//                       }}
//                     >
//                       <Heart
//                         className={`${i % 2 === 0 ? "w-3 h-3" : "w-2.5 h-2.5"} text-rose-400/30`}
//                         fill="currentColor"
//                       />
//                     </motion.div>
//                   ))}
//                 </div>

//                 <p className="relative z-10 text-zinc-600 dark:text-rose-100/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">
//                   {service.description}
//                 </p>
//               </div>
//             )}

//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-zinc-700 dark:text-rose-100 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-500 dark:text-rose-400" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-rose-100 dark:border-rose-500/30">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/30 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl text-white font-semibold shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]">
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>
//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-rose-100 dark:border dark:border-rose-500/20 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ - УЛУЧШЕННАЯ ======
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

//---------фиксю клаудом---
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

// const GalleryLightboxBackground = memo(() => (
//   <div className="absolute inset-0 -z-10">
//     {/* Основной градиент */}
//     <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />

//     {/* Анимированные сферы */}
//     <motion.div
//       className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
//       style={{ background: "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)" }}
//       animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
//       transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//     />
//     <motion.div
//       className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25"
//       style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }}
//       animate={{ scale: [1, 1.15, 1], x: [0, -40, 0], y: [0, -50, 0] }}
//       transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//     />
//     <motion.div
//       className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
//       style={{ background: "radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 60%)" }}
//       animate={{ scale: [1, 1.3, 1] }}
//       transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//     />

//     {/* Плавающие сердечки */}
//     {[...Array(12)].map((_, i) => (
//       <motion.div
//         key={i}
//         className="absolute pointer-events-none"
//         style={{ left: `${(i * 8.5) % 100}%`, top: `${(i * 9.2) % 100}%` }}
//         animate={{
//           y: [0, -40, 0],
//           x: [0, i % 2 === 0 ? 20 : -20, 0],
//           opacity: [0.15, 0.4, 0.15],
//           scale: [1, 1.2, 1],
//         }}
//         transition={{ duration: 5 + (i % 4) * 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
//       >
//         <Heart className={`${i % 3 === 0 ? 'w-6 h-6' : i % 3 === 1 ? 'w-4 h-4' : 'w-5 h-5'} text-rose-400/50`} fill="currentColor" />
//       </motion.div>
//     ))}

//     {/* Звёздочки/блёстки */}
//     {[...Array(20)].map((_, i) => (
//       <motion.div
//         key={`star-${i}`}
//         className="absolute w-1 h-1 rounded-full bg-white/30"
//         style={{ left: `${(i * 5.1) % 100}%`, top: `${(i * 5.7) % 100}%` }}
//         animate={{ opacity: [0.1, 0.6, 0.1], scale: [1, 1.5, 1] }}
//         transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
//       />
//     ))}

//     {/* Виньетка */}
//     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
//   </div>
// ));

// GalleryLightboxBackground.displayName = "GalleryLightboxBackground";

// // ====== ЛАЙТБОКС С ПОДДЕРЖКОЙ СВАЙПА ======
// function GalleryLightbox({
//   images, currentIndex, onClose, onPrev, onNext, serviceName,
// }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);

//   // Минимальное расстояние для свайпа (в пикселях)
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//     setIsDragging(true);
//   };

//   const onTouchMove = (e: React.TouchEvent) => {
//     if (!touchStart) return;
//     const currentTouch = e.targetTouches[0].clientX;
//     setTouchEnd(currentTouch);
//     setDragOffset(currentTouch - touchStart);
//   };

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) {
//       setIsDragging(false);
//       setDragOffset(0);
//       return;
//     }

//     const distance = touchStart - touchEnd;
//     const isLeftSwipe = distance > minSwipeDistance;
//     const isRightSwipe = distance < -minSwipeDistance;

//     if (isLeftSwipe && images.length > 1) {
//       onNext();
//     } else if (isRightSwipe && images.length > 1) {
//       onPrev();
//     }

//     setIsDragging(false);
//     setDragOffset(0);
//     setTouchStart(null);
//     setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];

//   // Направление анимации
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
//       onClick={onClose}
//     >
//       <GalleryLightboxBackground />
//       {/* Кнопка закрытия */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105"
//       >
//         <X className="w-6 h-6" />
//       </button>

//       {/* Счётчик с сердечком */}
//       <div className="absolute top-4 left-4 z-50">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//           <p className="text-white font-medium">{currentIndex + 1} <span className="text-white/60">/ {images.length}</span></p>
//         </div>
//       </div>

//       {/* Индикатор свайпа на мобильных */}
//       {images.length > 1 && (
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             <ChevronLeft className="w-4 h-4 text-white/70" />
//             <span className="text-white/70 text-xs font-medium">Свайп</span>
//             <ChevronRight className="w-4 h-4 text-white/70" />
//           </div>
//         </div>
//       )}

//       {/* Кнопки навигации (скрыты на мобильных) */}
//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105 hidden sm:flex"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105 hidden sm:flex"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}

//       {/* Точки-индикаторы */}
//       {images.length > 1 && (
//         <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
//           <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             {images.map((_, idx) => (
//               <div
//                 key={idx}
//                 className={`h-2 rounded-full transition-all duration-300 ${
//                   idx === currentIndex
//                     ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6"
//                     : "bg-white/40 w-2"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Изображение с поддержкой свайпа */}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, x: swipeDirection * 50 }}
//         animate={{
//           opacity: 1,
//           x: isDragging ? dragOffset * 0.3 : 0,
//         }}
//         exit={{ opacity: 0, x: -swipeDirection * 50 }}
//         transition={{
//           type: "tween",
//           duration: 0.2,
//         }}
//         className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()}
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//         style={{ touchAction: "pan-y" }}
//       >
//         {/* Контейнер изображения с НЕПРОЗРАЧНЫМ чёрным фоном */}
//         <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src={currentImage.image}
//             alt={currentImage.caption || serviceName}
//             className="max-w-full max-h-[75vh] object-contain pointer-events-none"
//             draggable={false}
//           />

//           {/* Подпись к фото */}
//           {currentImage.caption && (
//             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
//               <p className="text-white text-center text-sm font-medium">{currentImage.caption}</p>
//             </div>
//           )}
//         </div>

//         {/* Визуальная подсказка при свайпе */}
//         {isDragging && Math.abs(dragOffset) > 30 && (
//           <div
//             className={`absolute top-1/2 -translate-y-1/2 ${
//               dragOffset > 0 ? "left-2" : "right-2"
//             }`}
//           >
//             <div className="p-3 rounded-full bg-black/50 backdrop-blur-md">
//               {dragOffset > 0 ? (
//                 <ChevronLeft className="w-6 h-6 text-white" />
//               ) : (
//                 <ChevronRight className="w-6 h-6 text-white" />
//               )}
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({
//   service, categoryName, onClose, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   return (
//     <motion.div
//       className="fixed inset-0 z-[90] flex items-start justify-center bg-white/95 dark:bg-black/75 sm:bg-black/50 sm:dark:bg-black/50 backdrop-blur-0 sm:backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-transparent sm:rounded-3xl rounded-t-3xl shadow-2xl border border-rose-200/80 dark:border-rose-500/60 sm:border-rose-200/50 sm:dark:border-rose-500/30 transform-gpu will-change-transform"
//         onClick={(e) => e.stopPropagation()}>

//         {/* Тонкая маска сверху для мобильной тёмной темы (убирает краткий "просвет") */}
//         <div className="absolute -top-px left-0 right-0 h-3 sm:hidden hidden dark:block z-20 pointer-events-none bg-gradient-to-r from-rose-950 via-slate-950 to-purple-950" />
//         <div className="absolute top-2 left-0 right-0 h-px sm:hidden hidden dark:block z-20 pointer-events-none bg-gradient-to-r from-rose-950/50 via-slate-950/40 to-purple-950/50" />

//         {/* ====== КРАСИВЫЙ АНИМИРОВАННЫЙ ФОН ДЛЯ ТЁМНОЙ ТЕМЫ ====== */}
//         <div className="absolute inset-0 hidden dark:block overflow-hidden rounded-t-3xl sm:rounded-3xl">
//           {/* Основной градиент */}
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />

//           {/* Статичные сферы (без анимации для предотвращения мерцания) */}
//           <div
//             className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-40"
//             style={{ background: "radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)" }}
//           />
//           <div
//             className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-30"
//             style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)" }}
//           />
//           <div
//             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-20"
//             style={{ background: "radial-gradient(circle, rgba(251,113,133,0.4) 0%, transparent 60%)" }}
//           />

//           {/* Статичные сердечки (без анимации) */}
//           {[...Array(6)].map((_, i) => (
//             <div
//               key={i}
//               className="absolute pointer-events-none"
//               style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//             >
//               <Heart className={`${i % 2 === 0 ? 'w-4 h-4' : 'w-3 h-3'} text-rose-400/30`} fill="currentColor" />
//             </div>
//           ))}
//         </div>

//         {/* Контент модалки */}
//         <div className="relative z-10">
//           <div className="sm:hidden flex justify-center pt-3 pb-1">
//             <div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-rose-400/50" />
//           </div>

//           <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-black/50 dark:hover:bg-black/70 dark:text-rose-300 transition-colors shadow-lg border border-transparent dark:border-white/10">
//             <X className="w-5 h-5" />
//           </button>

//           <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//             {/* Контейнер изображения с НЕПРОЗРАЧНЫМ фоном */}
//             <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden bg-black">
//               {service.cover || service.gallery.length > 0 ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//               ) : (
//                 <div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-rose-500/20 dark:via-pink-500/20 dark:to-purple-500/20" />
//               )}
//               <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-black/90 dark:via-black/40 dark:to-transparent" />

//               <div className="absolute top-4 left-4">
//                 <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">
//                   {categoryName}
//                 </span>
//               </div>

//               {service.priceCents && (
//                 <div className="absolute bottom-4 right-4">
//                   <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/30">
//                     {translations.from} {formatPrice(service.priceCents, locale)}
//                   </span>
//                 </div>
//               )}
//             </div>

//             <div className="relative p-4 sm:p-6 sm:-mt-6 bg-white dark:bg-gradient-to-b dark:from-rose-950/90 dark:via-slate-950/95 dark:to-purple-950/90 sm:bg-transparent sm:dark:bg-transparent">
//               <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-white mb-4 pr-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                 {service.name}
//               </h2>

//               <div className="flex flex-wrap gap-2 mb-5">
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-200 text-sm">
//                   <Clock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
//                   {service.durationMin} {translations.minutes}
//                 </div>
//                 {service.priceCents && (
//                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-200 text-sm">
//                     <Euro className="w-4 h-4 text-amber-600 dark:text-amber-400" />
//                     {translations.from} {formatPrice(service.priceCents, locale)}
//                   </div>
//                 )}
//             </div>

//             {service.description && (
//               <div className="relative mb-6 overflow-hidden">
//                 {/* Светлая тема: на мобильных статично, на >=sm анимация */}
//                 <div className="absolute inset-0 pointer-events-none hidden dark:hidden">
//                   {[...Array(6)].map((_, i) => (
//                     <div
//                       key={`light-desc-heart-static-${i}`}
//                       className="absolute"
//                       style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//                     >
//                       <Heart
//                         className={`${i % 2 === 0 ? "w-4 h-4" : "w-3.5 h-3.5"} text-rose-400/60 drop-shadow-[0_1px_6px_rgba(244,63,94,0.25)]`}
//                         fill="currentColor"
//                       />
//                     </div>
//                   ))}
//                 </div>
//                 <div className="absolute inset-0 pointer-events-none dark:hidden">
//                   {[...Array(6)].map((_, i) => (
//                     <motion.div
//                       key={`light-desc-heart-${i}`}
//                       className="absolute"
//                       style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//                       animate={{
//                         y: [0, -15, 0],
//                         x: [0, i % 2 === 0 ? 8 : -8, 0],
//                       }}
//                       transition={{
//                         duration: 8 + (i % 3) * 2,
//                         repeat: Infinity,
//                         delay: i * 0.5,
//                         ease: "easeInOut",
//                       }}
//                     >
//                       <Heart
//                         className={`${i % 2 === 0 ? "w-4 h-4" : "w-3.5 h-3.5"} text-rose-400/60 drop-shadow-[0_1px_6px_rgba(244,63,94,0.25)]`}
//                         fill="currentColor"
//                       />
//                     </motion.div>
//                   ))}
//                 </div>

//                 {/* Тёмная тема: на мобильных статично, на >=sm анимация */}
//                 <div className="absolute inset-0 pointer-events-none hidden dark:hidden">
//                   {[...Array(6)].map((_, i) => (
//                     <div
//                       key={`dark-desc-heart-static-${i}`}
//                       className="absolute"
//                       style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//                     >
//                       <Heart
//                         className={`${i % 2 === 0 ? "w-3 h-3" : "w-2.5 h-2.5"} text-rose-400/30`}
//                         fill="currentColor"
//                       />
//                     </div>
//                   ))}
//                 </div>
//                 <div className="absolute inset-0 pointer-events-none hidden dark:block">
//                   {[...Array(6)].map((_, i) => (
//                     <motion.div
//                       key={`dark-desc-heart-${i}`}
//                       className="absolute"
//                       style={{ left: `${(i * 16) % 100}%`, top: `${(i * 18) % 100}%` }}
//                       animate={{
//                         y: [0, -12, 0],
//                         x: [0, i % 2 === 0 ? 6 : -6, 0],
//                       }}
//                       transition={{
//                         duration: 9 + (i % 3) * 2,
//                         repeat: Infinity,
//                         delay: i * 0.5,
//                         ease: "easeInOut",
//                       }}
//                     >
//                       <Heart
//                         className={`${i % 2 === 0 ? "w-3 h-3" : "w-2.5 h-2.5"} text-rose-400/30`}
//                         fill="currentColor"
//                       />
//                     </motion.div>
//                   ))}
//                 </div>

//                 <p className="relative z-10 text-zinc-600 dark:text-rose-100/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">
//                   {service.description}
//                 </p>
//               </div>
//             )}

//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-zinc-700 dark:text-rose-100 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-500 dark:text-rose-400" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-rose-100 dark:border-rose-500/30">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/30 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl text-white font-semibold shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]">
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>
//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-rose-100 dark:border dark:border-rose-500/20 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ - УЛУЧШЕННАЯ ======
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
//           {/* Сердечки для светлой темы */}
//           <div className="absolute inset-0 pointer-events-none hidden dark:hidden">
//             {[...Array(5)].map((_, i) => (
//               <div
//                 key={`light-heart-static-${i}`}
//                 className="absolute"
//                 style={{ left: `${(i * 20) % 100}%`, top: `${(i * 22) % 100}%` }}
//               >
//                 <Heart
//                   className={`${i % 2 === 0 ? "w-3.5 h-3.5" : "w-3 h-3"} text-rose-400/60 drop-shadow-[0_1px_6px_rgba(244,63,94,0.25)]`}
//                   fill="currentColor"
//                 />
//               </div>
//             ))}
//           </div>
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

//           {/* Сердечки для тёмной темы */}
//           <div className="absolute inset-0 pointer-events-none hidden dark:hidden">
//             {[...Array(5)].map((_, i) => (
//               <div
//                 key={`dark-heart-static-${i}`}
//                 className="absolute"
//                 style={{ left: `${(i * 20) % 100}%`, top: `${(i * 22) % 100}%` }}
//               >
//                 <Heart
//                   className={`${i % 2 === 0 ? "w-2.5 h-2.5" : "w-2 h-2"} text-rose-400/25`}
//                   fill="currentColor"
//                 />
//               </div>
//             ))}
//           </div>
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

//------------работает убираем мерцание-----------
// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
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

// // ====== ЛАЙТБОКС С ПОДДЕРЖКОЙ СВАЙПА ======
// function GalleryLightbox({
//   images, currentIndex, onClose, onPrev, onNext, serviceName,
// }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);

//   // Минимальное расстояние для свайпа (в пикселях)
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//     setIsDragging(true);
//   };

//   const onTouchMove = (e: React.TouchEvent) => {
//     if (!touchStart) return;
//     const currentTouch = e.targetTouches[0].clientX;
//     setTouchEnd(currentTouch);
//     setDragOffset(currentTouch - touchStart);
//   };

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) {
//       setIsDragging(false);
//       setDragOffset(0);
//       return;
//     }

//     const distance = touchStart - touchEnd;
//     const isLeftSwipe = distance > minSwipeDistance;
//     const isRightSwipe = distance < -minSwipeDistance;

//     if (isLeftSwipe && images.length > 1) {
//       onNext();
//     } else if (isRightSwipe && images.length > 1) {
//       onPrev();
//     }

//     setIsDragging(false);
//     setDragOffset(0);
//     setTouchStart(null);
//     setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];

//   // Направление анимации
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
//       onClick={onClose}
//     >
//       {/* ====== КРАСИВЫЙ АНИМИРОВАННЫЙ ФОН ====== */}
//       <div className="absolute inset-0 -z-10">
//         {/* Основной градиент */}
//         <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />

//         {/* Анимированные сферы */}
//         <motion.div
//           className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
//           style={{ background: "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)" }}
//           animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <motion.div
//           className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25"
//           style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }}
//           animate={{ scale: [1, 1.15, 1], x: [0, -40, 0], y: [0, -50, 0] }}
//           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//         />
//         <motion.div
//           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
//           style={{ background: "radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 60%)" }}
//           animate={{ scale: [1, 1.3, 1] }}
//           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//         />

//         {/* Плавающие сердечки */}
//         {[...Array(12)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute pointer-events-none"
//             style={{ left: `${(i * 8.5) % 100}%`, top: `${(i * 9.2) % 100}%` }}
//             animate={{
//               y: [0, -40, 0],
//               x: [0, i % 2 === 0 ? 20 : -20, 0],
//               opacity: [0.15, 0.4, 0.15],
//               scale: [1, 1.2, 1],
//             }}
//             transition={{ duration: 5 + (i % 4) * 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
//           >
//             <Heart className={`${i % 3 === 0 ? 'w-6 h-6' : i % 3 === 1 ? 'w-4 h-4' : 'w-5 h-5'} text-rose-400/50`} fill="currentColor" />
//           </motion.div>
//         ))}

//         {/* Звёздочки/блёстки */}
//         {[...Array(20)].map((_, i) => (
//           <motion.div
//             key={`star-${i}`}
//             className="absolute w-1 h-1 rounded-full bg-white/30"
//             style={{ left: `${(i * 5.1) % 100}%`, top: `${(i * 5.7) % 100}%` }}
//             animate={{ opacity: [0.1, 0.6, 0.1], scale: [1, 1.5, 1] }}
//             transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
//           />
//         ))}

//         {/* Виньетка */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)]" />
//       </div>
//       {/* Кнопка закрытия */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105"
//       >
//         <X className="w-6 h-6" />
//       </button>

//       {/* Счётчик с сердечком */}
//       <div className="absolute top-4 left-4 z-50">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//           <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//           <p className="text-white font-medium">{currentIndex + 1} <span className="text-white/60">/ {images.length}</span></p>
//         </div>
//       </div>

//       {/* Индикатор свайпа на мобильных */}
//       {images.length > 1 && (
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             <ChevronLeft className="w-4 h-4 text-white/70" />
//             <span className="text-white/70 text-xs font-medium">Свайп</span>
//             <ChevronRight className="w-4 h-4 text-white/70" />
//           </div>
//         </div>
//       )}

//       {/* Кнопки навигации (скрыты на мобильных) */}
//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105 hidden sm:flex"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105 hidden sm:flex"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}

//       {/* Точки-индикаторы */}
//       {images.length > 1 && (
//         <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
//           <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
//             {images.map((_, idx) => (
//               <div
//                 key={idx}
//                 className={`h-2 rounded-full transition-all duration-300 ${
//                   idx === currentIndex
//                     ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6"
//                     : "bg-white/40 w-2"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Изображение с поддержкой свайпа */}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, x: swipeDirection * 50 }}
//         animate={{
//           opacity: 1,
//           x: isDragging ? dragOffset * 0.3 : 0,
//         }}
//         exit={{ opacity: 0, x: -swipeDirection * 50 }}
//         transition={{
//           type: "tween",
//           duration: 0.2,
//         }}
//         className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none"
//         onClick={(e) => e.stopPropagation()}
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//         style={{ touchAction: "pan-y" }}
//       >
//         {/* Контейнер изображения с НЕПРОЗРАЧНЫМ чёрным фоном */}
//         <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src={currentImage.image}
//             alt={currentImage.caption || serviceName}
//             className="max-w-full max-h-[75vh] object-contain pointer-events-none"
//             draggable={false}
//           />

//           {/* Подпись к фото */}
//           {currentImage.caption && (
//             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
//               <p className="text-white text-center text-sm font-medium">{currentImage.caption}</p>
//             </div>
//           )}
//         </div>

//         {/* Визуальная подсказка при свайпе */}
//         {isDragging && Math.abs(dragOffset) > 30 && (
//           <div
//             className={`absolute top-1/2 -translate-y-1/2 ${
//               dragOffset > 0 ? "left-2" : "right-2"
//             }`}
//           >
//             <div className="p-3 rounded-full bg-black/50 backdrop-blur-md">
//               {dragOffset > 0 ? (
//                 <ChevronLeft className="w-6 h-6 text-white" />
//               ) : (
//                 <ChevronRight className="w-6 h-6 text-white" />
//               )}
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({
//   service, categoryName, onClose, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
//       <motion.div
//         initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-transparent sm:rounded-3xl rounded-t-3xl shadow-2xl border border-rose-200/50 dark:border-rose-500/30"
//         onClick={(e) => e.stopPropagation()}>

//         {/* ====== КРАСИВЫЙ АНИМИРОВАННЫЙ ФОН ДЛЯ ТЁМНОЙ ТЕМЫ ====== */}
//         <div className="absolute inset-0 hidden dark:block overflow-hidden rounded-t-3xl sm:rounded-3xl">
//           {/* Основной градиент */}
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />

//           {/* Анимированные сферы */}
//           <motion.div
//             className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-40"
//             style={{ background: "radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)" }}
//             animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
//             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <motion.div
//             className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-30"
//             style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)" }}
//             animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, -30, 0] }}
//             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//           />
//           <motion.div
//             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-20"
//             style={{ background: "radial-gradient(circle, rgba(251,113,133,0.4) 0%, transparent 60%)" }}
//             animate={{ scale: [1, 1.3, 1] }}
//             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//           />

//           {/* Плавающие сердечки */}
//           {[...Array(8)].map((_, i) => (
//             <motion.div
//               key={i}
//               className="absolute pointer-events-none"
//               style={{ left: `${(i * 12.5) % 100}%`, top: `${(i * 14) % 100}%` }}
//               animate={{
//                 y: [0, -25, 0],
//                 x: [0, i % 2 === 0 ? 12 : -12, 0],
//                 opacity: [0.2, 0.5, 0.2],
//                 scale: [1, 1.15, 1],
//               }}
//               transition={{ duration: 5 + (i % 3) * 1.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
//             >
//               <Heart className={`${i % 2 === 0 ? 'w-4 h-4' : 'w-3 h-3'} text-rose-400/60`} fill="currentColor" />
//             </motion.div>
//           ))}

//           {/* Мерцающие звёздочки */}
//           {[...Array(15)].map((_, i) => (
//             <motion.div
//               key={`star-${i}`}
//               className="absolute w-1 h-1 rounded-full bg-white/40"
//               style={{ left: `${(i * 6.7) % 100}%`, top: `${(i * 7.3) % 100}%` }}
//               animate={{ opacity: [0.15, 0.6, 0.15], scale: [1, 1.5, 1] }}
//               transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
//             />
//           ))}
//         </div>

//         {/* Контент модалки */}
//         <div className="relative z-10">
//           <div className="sm:hidden flex justify-center pt-3 pb-1">
//             <div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-rose-400/50" />
//           </div>

//           <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-black/50 dark:hover:bg-black/70 dark:text-rose-300 transition-colors shadow-lg border border-transparent dark:border-white/10">
//             <X className="w-5 h-5" />
//           </button>

//           <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//             {/* Контейнер изображения с НЕПРОЗРАЧНЫМ фоном */}
//             <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden bg-black">
//               {service.cover || service.gallery.length > 0 ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//               ) : (
//                 <div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-rose-500/20 dark:via-pink-500/20 dark:to-purple-500/20" />
//               )}
//               <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-black/90 dark:via-black/40 dark:to-transparent" />

//               <div className="absolute top-4 left-4">
//                 <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-black/60 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">
//                   {categoryName}
//                 </span>
//               </div>

//               {service.priceCents && (
//                 <div className="absolute bottom-4 right-4">
//                   <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/30">
//                     {translations.from} {formatPrice(service.priceCents, locale)}
//                   </span>
//                 </div>
//               )}
//             </div>

//             <div className="p-4 sm:p-6 -mt-6 relative">
//               <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-white mb-4 pr-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                 {service.name}
//               </h2>

//               <div className="flex flex-wrap gap-2 mb-5">
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-400/30 dark:text-rose-200 text-sm">
//                   <Clock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
//                   {service.durationMin} {translations.minutes}
//                 </div>
//                 {service.priceCents && (
//                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-400/30 dark:text-amber-200 text-sm">
//                     <Euro className="w-4 h-4 text-amber-600 dark:text-amber-400" />
//                     {translations.from} {formatPrice(service.priceCents, locale)}
//                   </div>
//                 )}
//             </div>

//             {service.description && (
//               <div className="relative mb-6 overflow-hidden">
//                 <div className="absolute inset-0 pointer-events-none dark:hidden">
//                   {[...Array(10)].map((_, i) => (
//                     <motion.div
//                       key={`light-desc-heart-${i}`}
//                       className="absolute"
//                       style={{ left: `${(i * 10.5) % 100}%`, top: `${(i * 11.5) % 100}%` }}
//                       animate={{
//                         y: [0, -22, 0],
//                         x: [0, i % 2 === 0 ? 12 : -12, 0],
//                         opacity: [0.2, 0.6, 0.2],
//                         scale: [1, 1.2, 1],
//                       }}
//                       transition={{
//                         duration: 5.5 + (i % 4) * 1.2,
//                         repeat: Infinity,
//                         delay: i * 0.25,
//                         ease: "easeInOut",
//                       }}
//                     >
//                       <Heart
//                         className={`${i % 2 === 0 ? "w-4 h-4" : "w-3.5 h-3.5"} text-rose-400/60 drop-shadow-[0_1px_6px_rgba(244,63,94,0.25)]`}
//                         fill="currentColor"
//                       />
//                     </motion.div>
//                   ))}
//                 </div>
//                 <div className="absolute inset-0 pointer-events-none hidden dark:block">
//                   {[...Array(10)].map((_, i) => (
//                     <motion.div
//                       key={`dark-desc-heart-${i}`}
//                       className="absolute"
//                       style={{ left: `${(i * 10.5) % 100}%`, top: `${(i * 11.5) % 100}%` }}
//                       animate={{
//                         y: [0, -20, 0],
//                         x: [0, i % 2 === 0 ? 12 : -12, 0],
//                         opacity: [0.18, 0.5, 0.18],
//                         scale: [1, 1.18, 1],
//                       }}
//                       transition={{
//                         duration: 6 + (i % 4) * 1.2,
//                         repeat: Infinity,
//                         delay: i * 0.25,
//                         ease: "easeInOut",
//                       }}
//                     >
//                       <Heart
//                         className={`${i % 2 === 0 ? "w-3.5 h-3.5" : "w-3 h-3"} text-rose-400/40`}
//                         fill="currentColor"
//                       />
//                     </motion.div>
//                   ))}
//                 </div>

//                 <p className="relative z-10 text-zinc-600 dark:text-rose-100/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">
//                   {service.description}
//                 </p>
//               </div>
//             )}

//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-zinc-700 dark:text-rose-100 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-500 dark:text-rose-400" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-rose-100 dark:border-rose-500/30">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/30 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl text-white font-semibold shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]">
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>
//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-rose-100 dark:border dark:border-rose-500/20 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ - УЛУЧШЕННАЯ ======
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
//           active:scale-[0.98] sm:hover:-translate-y-2
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
//           <div className="absolute inset-0 pointer-events-none dark:hidden">
//             {[...Array(8)].map((_, i) => (
//               <motion.div
//                 key={`light-heart-${i}`}
//                 className="absolute"
//                 style={{ left: `${(i * 12.5) % 100}%`, top: `${(i * 14) % 100}%` }}
//                 animate={{
//                   y: [0, -20, 0],
//                   x: [0, i % 2 === 0 ? 12 : -12, 0],
//                   opacity: [0.2, 0.6, 0.2],
//                   scale: [1, 1.2, 1],
//                 }}
//                 transition={{
//                   duration: 5 + (i % 3) * 1.4,
//                   repeat: Infinity,
//                   delay: i * 0.35,
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
//           <div className="absolute inset-0 pointer-events-none hidden dark:block">
//             {[...Array(8)].map((_, i) => (
//               <motion.div
//                 key={`dark-heart-${i}`}
//                 className="absolute"
//                 style={{ left: `${(i * 12.5) % 100}%`, top: `${(i * 14) % 100}%` }}
//                 animate={{
//                   y: [0, -18, 0],
//                   x: [0, i % 2 === 0 ? 10 : -10, 0],
//                   opacity: [0.15, 0.45, 0.15],
//                   scale: [1, 1.15, 1],
//                 }}
//                 transition={{
//                   duration: 5 + (i % 3) * 1.4,
//                   repeat: Infinity,
//                   delay: i * 0.35,
//                   ease: "easeInOut",
//                 }}
//               >
//                 <Heart
//                   className={`${i % 2 === 0 ? "w-3 h-3" : "w-2.5 h-2.5"} text-rose-400/40`}
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

// убераем мерцания при свайпе------
// "use client";

// import { useState, useEffect, useCallback } from "react";
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

// // ====== ЛАЙТБОКС С ПОДДЕРЖКОЙ СВАЙПА ======
// function GalleryLightbox({
//   images, currentIndex, onClose, onPrev, onNext, serviceName,
// }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);

//   // Минимальное расстояние для свайпа (в пикселях)
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//     setIsDragging(true);
//   };

//   const onTouchMove = (e: React.TouchEvent) => {
//     if (!touchStart) return;
//     const currentTouch = e.targetTouches[0].clientX;
//     setTouchEnd(currentTouch);
//     setDragOffset(currentTouch - touchStart);
//   };

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) {
//       setIsDragging(false);
//       setDragOffset(0);
//       return;
//     }

//     const distance = touchStart - touchEnd;
//     const isLeftSwipe = distance > minSwipeDistance;
//     const isRightSwipe = distance < -minSwipeDistance;

//     if (isLeftSwipe && images.length > 1) {
//       onNext();
//     } else if (isRightSwipe && images.length > 1) {
//       onPrev();
//     }

//     setIsDragging(false);
//     setDragOffset(0);
//     setTouchStart(null);
//     setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];

//   // Направление анимации
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
//       onClick={onClose}
//     >
//       {/* ====== КРАСИВЫЙ АНИМИРОВАННЫЙ ФОН ====== */}
//       <div className="absolute inset-0 -z-10">
//         {/* Основной градиент */}
//         <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />

//         {/* Анимированные сферы */}
//         <motion.div
//           className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
//           style={{ background: "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)" }}
//           animate={{
//             scale: [1, 1.2, 1],
//             x: [0, 50, 0],
//             y: [0, 30, 0],
//           }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <motion.div
//           className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25"
//           style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }}
//           animate={{
//             scale: [1, 1.15, 1],
//             x: [0, -40, 0],
//             y: [0, -50, 0],
//           }}
//           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//         />
//         <motion.div
//           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
//           style={{ background: "radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 60%)" }}
//           animate={{ scale: [1, 1.3, 1] }}
//           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//         />

//         {/* Плавающие сердечки */}
//         {[...Array(12)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute pointer-events-none"
//             style={{
//               left: `${(i * 8.5) % 100}%`,
//               top: `${(i * 9.2) % 100}%`,
//             }}
//             animate={{
//               y: [0, -40, 0],
//               x: [0, i % 2 === 0 ? 20 : -20, 0],
//               opacity: [0.15, 0.4, 0.15],
//               scale: [1, 1.2, 1],
//               rotate: [0, i % 2 === 0 ? 15 : -15, 0],
//             }}
//             transition={{
//               duration: 5 + (i % 4) * 1.5,
//               repeat: Infinity,
//               delay: i * 0.3,
//               ease: "easeInOut"
//             }}
//           >
//             <Heart
//               className={`${i % 3 === 0 ? 'w-6 h-6' : i % 3 === 1 ? 'w-4 h-4' : 'w-5 h-5'} text-rose-400/50`}
//               fill="currentColor"
//             />
//           </motion.div>
//         ))}

//         {/* Звёздочки/блёстки */}
//         {[...Array(20)].map((_, i) => (
//           <motion.div
//             key={`star-${i}`}
//             className="absolute w-1 h-1 rounded-full bg-white/30"
//             style={{
//               left: `${(i * 5.1) % 100}%`,
//               top: `${(i * 5.7) % 100}%`,
//             }}
//             animate={{
//               opacity: [0.1, 0.6, 0.1],
//               scale: [1, 1.5, 1],
//             }}
//             transition={{
//               duration: 2 + (i % 3),
//               repeat: Infinity,
//               delay: i * 0.2,
//               ease: "easeInOut"
//             }}
//           />
//         ))}

//         {/* Сетка/узор */}
//         <div
//           className="absolute inset-0 opacity-[0.03]"
//           style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           }}
//         />

//         {/* Виньетка */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />
//       </div>
//       {/* Кнопка закрытия */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105"
//       >
//         <X className="w-6 h-6" />
//       </button>

//       {/* Счётчик с красивым оформлением */}
//       <div className="absolute top-4 left-4 z-50">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
//           <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//           <p className="text-white font-medium">{currentIndex + 1} <span className="text-white/60">/ {images.length}</span></p>
//         </div>
//       </div>

//       {/* Индикатор свайпа на мобильных */}
//       {images.length > 1 && (
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
//             <ChevronLeft className="w-4 h-4 text-white/70" />
//             <span className="text-white/70 text-xs font-medium">Свайп</span>
//             <ChevronRight className="w-4 h-4 text-white/70" />
//           </div>
//         </div>
//       )}

//       {/* Кнопки навигации (скрыты на мобильных) */}
//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-110 hidden sm:flex"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-110 hidden sm:flex"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}

//       {/* Точки-индикаторы */}
//       {images.length > 1 && (
//         <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
//           <div className="flex gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
//             {images.map((_, idx) => (
//               <motion.div
//                 key={idx}
//                 className={`h-2 rounded-full transition-all duration-300 ${
//                   idx === currentIndex
//                     ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6"
//                     : "bg-white/40 hover:bg-white/60 w-2"
//                 }`}
//                 animate={idx === currentIndex ? { scale: [1, 1.1, 1] } : {}}
//                 transition={{ duration: 0.5 }}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Изображение с поддержкой свайпа и красивой рамкой */}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, x: swipeDirection * 100, scale: 0.95 }}
//         animate={{
//           opacity: 1,
//           x: isDragging ? dragOffset * 0.5 : 0,
//           scale: isDragging ? 0.98 : 1,
//           rotate: isDragging ? dragOffset * 0.02 : 0
//         }}
//         exit={{ opacity: 0, x: -swipeDirection * 100, scale: 0.95 }}
//         transition={{
//           type: isDragging ? "tween" : "spring",
//           duration: isDragging ? 0 : 0.3,
//           damping: 25,
//           stiffness: 300
//         }}
//         className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none"
//         onClick={(e) => e.stopPropagation()}
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//         style={{ touchAction: "pan-y" }}
//       >
//         {/* Декоративная рамка вокруг изображения */}
//         <div className="relative p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-400/30 via-pink-500/30 to-purple-500/30 shadow-2xl shadow-rose-500/20">
//           <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={currentImage.image}
//               alt={currentImage.caption || serviceName}
//               className="max-w-full max-h-[75vh] object-contain pointer-events-none"
//               draggable={false}
//             />

//             {/* Подпись к фото */}
//             {currentImage.caption && (
//               <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
//                 <p className="text-white text-center text-sm font-medium">{currentImage.caption}</p>
//               </div>
//             )}
//           </div>

//           {/* Декоративные уголки */}
//           <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-rose-400/50 rounded-tl-2xl" />
//           <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-rose-400/50 rounded-tr-2xl" />
//           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-rose-400/50 rounded-bl-2xl" />
//           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-rose-400/50 rounded-br-2xl" />
//         </div>

//         {/* Визуальная подсказка при свайпе */}
//         {isDragging && Math.abs(dragOffset) > 20 && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className={`absolute top-1/2 -translate-y-1/2 ${
//               dragOffset > 0 ? "left-4" : "right-4"
//             }`}
//           >
//             <div className="p-4 rounded-full bg-gradient-to-br from-rose-500/80 to-pink-500/80 backdrop-blur-md shadow-xl">
//               {dragOffset > 0 ? (
//                 <ChevronLeft className="w-8 h-8 text-white" />
//               ) : (
//                 <ChevronRight className="w-8 h-8 text-white" />
//               )}
//             </div>
//           </motion.div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({
//   service, categoryName, onClose, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
//       <motion.div
//         initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-transparent sm:rounded-3xl rounded-t-3xl shadow-2xl border border-rose-200/50 dark:border-rose-500/30"
//         onClick={(e) => e.stopPropagation()}>

//         {/* ====== ПРЕМИАЛЬНЫЙ ФОН ДЛЯ ТЁМНОЙ ТЕМЫ ====== */}
//         <div className="absolute inset-0 hidden dark:block overflow-hidden rounded-t-3xl sm:rounded-3xl">
//           {/* Основной градиент */}
//           <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />

//           {/* Анимированные сферы */}
//           <motion.div
//             className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-40"
//             style={{ background: "radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)" }}
//             animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
//             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <motion.div
//             className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-30"
//             style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)" }}
//             animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, -30, 0] }}
//             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//           />
//           <motion.div
//             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-20"
//             style={{ background: "radial-gradient(circle, rgba(251,113,133,0.4) 0%, transparent 60%)" }}
//             animate={{ scale: [1, 1.3, 1] }}
//             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//           />

//           {/* Плавающие сердечки */}
//           {[...Array(8)].map((_, i) => (
//             <motion.div
//               key={i}
//               className="absolute pointer-events-none"
//               style={{ left: `${(i * 12.5) % 100}%`, top: `${(i * 14) % 100}%` }}
//               animate={{
//                 y: [0, -25, 0],
//                 x: [0, i % 2 === 0 ? 12 : -12, 0],
//                 opacity: [0.2, 0.5, 0.2],
//                 scale: [1, 1.15, 1],
//               }}
//               transition={{ duration: 5 + (i % 3) * 1.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
//             >
//               <Heart className={`${i % 2 === 0 ? 'w-4 h-4' : 'w-3 h-3'} text-rose-400/60`} fill="currentColor" />
//             </motion.div>
//           ))}

//           {/* Мерцающие звёздочки */}
//           {[...Array(15)].map((_, i) => (
//             <motion.div
//               key={`star-${i}`}
//               className="absolute w-1 h-1 rounded-full bg-white/40"
//               style={{ left: `${(i * 6.7) % 100}%`, top: `${(i * 7.3) % 100}%` }}
//               animate={{ opacity: [0.15, 0.6, 0.15], scale: [1, 1.5, 1] }}
//               transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
//             />
//           ))}

//           {/* Тонкий узор */}
//           <div
//             className="absolute inset-0 opacity-[0.03]"
//             style={{
//               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//             }}
//           />
//         </div>

//         {/* Контент модалки */}
//         <div className="relative z-10">
//           <div className="sm:hidden flex justify-center pt-3 pb-1">
//             <div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-rose-400/50" />
//           </div>

//           <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-white/10 dark:hover:bg-white/20 dark:text-rose-300 transition-colors shadow-lg dark:shadow-rose-500/10 border border-transparent dark:border-rose-500/20">
//             <X className="w-5 h-5" />
//           </button>

//           <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//             <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
//               {service.cover || service.gallery.length > 0 ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//               ) : (
//                 <div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-rose-500/20 dark:via-pink-500/20 dark:to-purple-500/20" />
//               )}
//               <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-transparent dark:via-transparent dark:to-transparent" />

//               {/* Градиент снизу для тёмной темы */}
//               <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-rose-950/90 via-rose-950/40 to-transparent" />

//               <div className="absolute top-4 left-4">
//                 <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-rose-500/20 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-rose-400/30">
//                   {categoryName}
//                 </span>
//               </div>

//               {service.priceCents && (
//                 <div className="absolute bottom-4 right-4">
//                   <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/30">
//                     {translations.from} {formatPrice(service.priceCents, locale)}
//                   </span>
//                 </div>
//               )}
//             </div>

//             <div className="p-4 sm:p-6 -mt-6 relative">
//               <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-white mb-4 pr-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                 {service.name}
//               </h2>

//               <div className="flex flex-wrap gap-2 mb-5">
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-400/30 dark:text-rose-200 text-sm">
//                   <Clock className="w-4 h-4 text-rose-500 dark:text-rose-400" />
//                   {service.durationMin} {translations.minutes}
//                 </div>
//                 {service.priceCents && (
//                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-400/30 dark:text-amber-200 text-sm">
//                     <Euro className="w-4 h-4 text-amber-600 dark:text-amber-400" />
//                     {translations.from} {formatPrice(service.priceCents, locale)}
//                   </div>
//                 )}
//             </div>

//             {service.description && (
//               <div className="mb-6">
//                 <p className="text-zinc-600 dark:text-rose-100/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">{service.description}</p>
//               </div>
//             )}

//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-zinc-700 dark:text-rose-100 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-500 dark:text-rose-400" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-rose-100 dark:border-rose-500/30 dark:shadow-rose-500/10">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/30 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl text-white font-semibold shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]">
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>
//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-rose-100 dark:border dark:border-rose-500/20 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ - УЛУЧШЕННАЯ ======
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
//           active:scale-[0.98] sm:hover:-translate-y-2
//         "
//       >
//         {/* Декоративный уголок */}
//         <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10 pointer-events-none">
//           <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rotate-45" />
//         </div>

//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
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

//         <div className="p-4 sm:p-5 bg-gradient-to-b from-transparent to-rose-50/30 dark:to-transparent">
//           <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors"
//               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//             {service.name}
//           </h3>

//           {service.description && (
//             <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">{service.description}</p>
//           )}

//           <div className="flex items-center gap-3 mb-4">
//             <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm">
//               <Clock className="w-3.5 h-3.5 text-rose-400 dark:text-rose-300" />
//               {service.durationMin} {translations.minutes}
//             </span>
//           </div>

//           <Link
//             href={`/booking?service=${service.id}`}
//             onClick={(e) => e.stopPropagation()}
//             className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-rose-300/40"
//           >
//             {translations.bookNow}
//             <ChevronRight className="w-4 h-4" />
//           </Link>
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

//------меня фон модалки для тёмной темы----
// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
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

// // ====== ЛАЙТБОКС С ПОДДЕРЖКОЙ СВАЙПА ======
// function GalleryLightbox({
//   images, currentIndex, onClose, onPrev, onNext, serviceName,
// }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);

//   // Минимальное расстояние для свайпа (в пикселях)
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//     setIsDragging(true);
//   };

//   const onTouchMove = (e: React.TouchEvent) => {
//     if (!touchStart) return;
//     const currentTouch = e.targetTouches[0].clientX;
//     setTouchEnd(currentTouch);
//     setDragOffset(currentTouch - touchStart);
//   };

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) {
//       setIsDragging(false);
//       setDragOffset(0);
//       return;
//     }

//     const distance = touchStart - touchEnd;
//     const isLeftSwipe = distance > minSwipeDistance;
//     const isRightSwipe = distance < -minSwipeDistance;

//     if (isLeftSwipe && images.length > 1) {
//       onNext();
//     } else if (isRightSwipe && images.length > 1) {
//       onPrev();
//     }

//     setIsDragging(false);
//     setDragOffset(0);
//     setTouchStart(null);
//     setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];

//   // Направление анимации
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
//       onClick={onClose}
//     >
//       {/* ====== КРАСИВЫЙ АНИМИРОВАННЫЙ ФОН ====== */}
//       <div className="absolute inset-0 -z-10">
//         {/* Основной градиент */}
//         <div className="absolute inset-0 bg-gradient-to-br from-rose-950 via-slate-950 to-purple-950" />

//         {/* Анимированные сферы */}
//         <motion.div
//           className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-30"
//           style={{ background: "radial-gradient(circle, rgba(244,63,94,0.4) 0%, transparent 70%)" }}
//           animate={{
//             scale: [1, 1.2, 1],
//             x: [0, 50, 0],
//             y: [0, 30, 0],
//           }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <motion.div
//           className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-25"
//           style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }}
//           animate={{
//             scale: [1, 1.15, 1],
//             x: [0, -40, 0],
//             y: [0, -50, 0],
//           }}
//           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//         />
//         <motion.div
//           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
//           style={{ background: "radial-gradient(circle, rgba(251,113,133,0.3) 0%, transparent 60%)" }}
//           animate={{ scale: [1, 1.3, 1] }}
//           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//         />

//         {/* Плавающие сердечки */}
//         {[...Array(12)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute pointer-events-none"
//             style={{
//               left: `${(i * 8.5) % 100}%`,
//               top: `${(i * 9.2) % 100}%`,
//             }}
//             animate={{
//               y: [0, -40, 0],
//               x: [0, i % 2 === 0 ? 20 : -20, 0],
//               opacity: [0.15, 0.4, 0.15],
//               scale: [1, 1.2, 1],
//               rotate: [0, i % 2 === 0 ? 15 : -15, 0],
//             }}
//             transition={{
//               duration: 5 + (i % 4) * 1.5,
//               repeat: Infinity,
//               delay: i * 0.3,
//               ease: "easeInOut"
//             }}
//           >
//             <Heart
//               className={`${i % 3 === 0 ? 'w-6 h-6' : i % 3 === 1 ? 'w-4 h-4' : 'w-5 h-5'} text-rose-400/50`}
//               fill="currentColor"
//             />
//           </motion.div>
//         ))}

//         {/* Звёздочки/блёстки */}
//         {[...Array(20)].map((_, i) => (
//           <motion.div
//             key={`star-${i}`}
//             className="absolute w-1 h-1 rounded-full bg-white/30"
//             style={{
//               left: `${(i * 5.1) % 100}%`,
//               top: `${(i * 5.7) % 100}%`,
//             }}
//             animate={{
//               opacity: [0.1, 0.6, 0.1],
//               scale: [1, 1.5, 1],
//             }}
//             transition={{
//               duration: 2 + (i % 3),
//               repeat: Infinity,
//               delay: i * 0.2,
//               ease: "easeInOut"
//             }}
//           />
//         ))}

//         {/* Сетка/узор */}
//         <div
//           className="absolute inset-0 opacity-[0.03]"
//           style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           }}
//         />

//         {/* Виньетка */}
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />
//       </div>
//       {/* Кнопка закрытия */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-105"
//       >
//         <X className="w-6 h-6" />
//       </button>

//       {/* Счётчик с красивым оформлением */}
//       <div className="absolute top-4 left-4 z-50">
//         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
//           <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />
//           <p className="text-white font-medium">{currentIndex + 1} <span className="text-white/60">/ {images.length}</span></p>
//         </div>
//       </div>

//       {/* Индикатор свайпа на мобильных */}
//       {images.length > 1 && (
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
//             <ChevronLeft className="w-4 h-4 text-white/70" />
//             <span className="text-white/70 text-xs font-medium">Свайп</span>
//             <ChevronRight className="w-4 h-4 text-white/70" />
//           </div>
//         </div>
//       )}

//       {/* Кнопки навигации (скрыты на мобильных) */}
//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-110 hidden sm:flex"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg transition-all hover:scale-110 hidden sm:flex"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}

//       {/* Точки-индикаторы */}
//       {images.length > 1 && (
//         <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50">
//           <div className="flex gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
//             {images.map((_, idx) => (
//               <motion.div
//                 key={idx}
//                 className={`h-2 rounded-full transition-all duration-300 ${
//                   idx === currentIndex
//                     ? "bg-gradient-to-r from-rose-400 to-pink-400 w-6"
//                     : "bg-white/40 hover:bg-white/60 w-2"
//                 }`}
//                 animate={idx === currentIndex ? { scale: [1, 1.1, 1] } : {}}
//                 transition={{ duration: 0.5 }}
//               />
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Изображение с поддержкой свайпа и красивой рамкой */}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, x: swipeDirection * 100, scale: 0.95 }}
//         animate={{
//           opacity: 1,
//           x: isDragging ? dragOffset * 0.5 : 0,
//           scale: isDragging ? 0.98 : 1,
//           rotate: isDragging ? dragOffset * 0.02 : 0
//         }}
//         exit={{ opacity: 0, x: -swipeDirection * 100, scale: 0.95 }}
//         transition={{
//           type: isDragging ? "tween" : "spring",
//           duration: isDragging ? 0 : 0.3,
//           damping: 25,
//           stiffness: 300
//         }}
//         className="relative max-w-[95vw] max-h-[80vh] mx-4 touch-pan-y select-none"
//         onClick={(e) => e.stopPropagation()}
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//         style={{ touchAction: "pan-y" }}
//       >
//         {/* Декоративная рамка вокруг изображения */}
//         <div className="relative p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-400/30 via-pink-500/30 to-purple-500/30 shadow-2xl shadow-rose-500/20">
//           <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm">
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={currentImage.image}
//               alt={currentImage.caption || serviceName}
//               className="max-w-full max-h-[75vh] object-contain pointer-events-none"
//               draggable={false}
//             />

//             {/* Подпись к фото */}
//             {currentImage.caption && (
//               <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
//                 <p className="text-white text-center text-sm font-medium">{currentImage.caption}</p>
//               </div>
//             )}
//           </div>

//           {/* Декоративные уголки */}
//           <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-rose-400/50 rounded-tl-2xl" />
//           <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-rose-400/50 rounded-tr-2xl" />
//           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-rose-400/50 rounded-bl-2xl" />
//           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-rose-400/50 rounded-br-2xl" />
//         </div>

//         {/* Визуальная подсказка при свайпе */}
//         {isDragging && Math.abs(dragOffset) > 20 && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className={`absolute top-1/2 -translate-y-1/2 ${
//               dragOffset > 0 ? "left-4" : "right-4"
//             }`}
//           >
//             <div className="p-4 rounded-full bg-gradient-to-br from-rose-500/80 to-pink-500/80 backdrop-blur-md shadow-xl">
//               {dragOffset > 0 ? (
//                 <ChevronLeft className="w-8 h-8 text-white" />
//               ) : (
//                 <ChevronRight className="w-8 h-8 text-white" />
//               )}
//             </div>
//           </motion.div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({
//   service, categoryName, onClose, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
//       <motion.div
//         initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-zinc-950/95 sm:rounded-3xl rounded-t-3xl shadow-2xl border border-rose-200/50 dark:border-white/10"
//         onClick={(e) => e.stopPropagation()}>

//         <div className="sm:hidden flex justify-center pt-3 pb-1">
//           <div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-white/20" />
//         </div>

//         <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-white/10 dark:hover:bg-white/15 dark:text-rose-200 transition-colors shadow-lg">
//           <X className="w-5 h-5" />
//         </button>

//         <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//           <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
//             {service.cover || service.gallery.length > 0 ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-white/5 dark:via-white/5 dark:to-white/0" />
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-zinc-950 dark:via-zinc-950/40" />

//             <div className="absolute top-4 left-4">
//               <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-white/10 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">
//                 {categoryName}
//               </span>
//             </div>

//             {service.priceCents && (
//               <div className="absolute bottom-4 right-4">
//                 <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-300/50">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           <div className="p-4 sm:p-6 -mt-6 relative">
//             <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 pr-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//               {service.name}
//             </h2>

//             <div className="flex flex-wrap gap-2 mb-5">
//               <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 text-sm">
//                 <Clock className="w-4 h-4 text-rose-500 dark:text-rose-300" />
//                 {service.durationMin} {translations.minutes}
//               </div>
//               {service.priceCents && (
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 text-sm">
//                   <Euro className="w-4 h-4 text-amber-600 dark:text-amber-300" />
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </div>
//               )}
//             </div>

//             {service.description && (
//               <div className="mb-6">
//                 <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">{service.description}</p>
//               </div>
//             )}

//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-100 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-500 dark:text-rose-300" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-rose-100 dark:border-white/10">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/20 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl text-white font-semibold shadow-lg shadow-rose-300/50 transition-all active:scale-[0.98]">
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>
//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/15 dark:text-zinc-200 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ - УЛУЧШЕННАЯ ======
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
//           active:scale-[0.98] sm:hover:-translate-y-2
//         "
//       >
//         {/* Декоративный уголок */}
//         <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10 pointer-events-none">
//           <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rotate-45" />
//         </div>

//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
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

//         <div className="p-4 sm:p-5 bg-gradient-to-b from-transparent to-rose-50/30 dark:to-transparent">
//           <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors"
//               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//             {service.name}
//           </h3>

//           {service.description && (
//             <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">{service.description}</p>
//           )}

//           <div className="flex items-center gap-3 mb-4">
//             <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm">
//               <Clock className="w-3.5 h-3.5 text-rose-400 dark:text-rose-300" />
//               {service.durationMin} {translations.minutes}
//             </span>
//           </div>

//           <Link
//             href={`/booking?service=${service.id}`}
//             onClick={(e) => e.stopPropagation()}
//             className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-rose-300/40"
//           >
//             {translations.bookNow}
//             <ChevronRight className="w-4 h-4" />
//           </Link>
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

//---------меняем задний фон галереи--------
// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
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

// // ====== ЛАЙТБОКС С ПОДДЕРЖКОЙ СВАЙПА ======
// function GalleryLightbox({
//   images, currentIndex, onClose, onPrev, onNext, serviceName,
// }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   const [touchStart, setTouchStart] = useState<number | null>(null);
//   const [touchEnd, setTouchEnd] = useState<number | null>(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);

//   // Минимальное расстояние для свайпа (в пикселях)
//   const minSwipeDistance = 50;

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const onTouchStart = (e: React.TouchEvent) => {
//     setTouchEnd(null);
//     setTouchStart(e.targetTouches[0].clientX);
//     setIsDragging(true);
//   };

//   const onTouchMove = (e: React.TouchEvent) => {
//     if (!touchStart) return;
//     const currentTouch = e.targetTouches[0].clientX;
//     setTouchEnd(currentTouch);
//     setDragOffset(currentTouch - touchStart);
//   };

//   const onTouchEnd = () => {
//     if (!touchStart || !touchEnd) {
//       setIsDragging(false);
//       setDragOffset(0);
//       return;
//     }

//     const distance = touchStart - touchEnd;
//     const isLeftSwipe = distance > minSwipeDistance;
//     const isRightSwipe = distance < -minSwipeDistance;

//     if (isLeftSwipe && images.length > 1) {
//       onNext();
//     } else if (isRightSwipe && images.length > 1) {
//       onPrev();
//     }

//     setIsDragging(false);
//     setDragOffset(0);
//     setTouchStart(null);
//     setTouchEnd(null);
//   };

//   const currentImage = images[currentIndex];

//   // Направление анимации
//   const swipeDirection = dragOffset > 0 ? 1 : -1;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
//       onClick={onClose}
//     >
//       {/* Кнопка закрытия */}
//       <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//         <X className="w-6 h-6" />
//       </button>

//       {/* Счётчик */}
//       <div className="absolute top-4 left-4 z-50">
//         <p className="text-white/80 text-sm">{currentIndex + 1} / {images.length}</p>
//       </div>

//       {/* Индикатор свайпа на мобильных */}
//       {images.length > 1 && (
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 sm:hidden">
//           <ChevronLeft className="w-4 h-4 text-white/50" />
//           <span className="text-white/50 text-xs">Свайп</span>
//           <ChevronRight className="w-4 h-4 text-white/50" />
//         </div>
//       )}

//       {/* Кнопки навигации (скрыты на мобильных) */}
//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white hidden sm:flex"
//           >
//             <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white hidden sm:flex"
//           >
//             <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//         </>
//       )}

//       {/* Точки-индикаторы */}
//       {images.length > 1 && (
//         <div className="absolute bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-1.5">
//           {images.map((_, idx) => (
//             <div
//               key={idx}
//               className={`w-2 h-2 rounded-full transition-all duration-300 ${
//                 idx === currentIndex
//                   ? "bg-white w-6"
//                   : "bg-white/40 hover:bg-white/60"
//               }`}
//             />
//           ))}
//         </div>
//       )}

//       {/* Изображение с поддержкой свайпа */}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, x: swipeDirection * 100, scale: 0.95 }}
//         animate={{
//           opacity: 1,
//           x: isDragging ? dragOffset * 0.5 : 0,
//           scale: isDragging ? 0.98 : 1,
//           rotate: isDragging ? dragOffset * 0.02 : 0
//         }}
//         exit={{ opacity: 0, x: -swipeDirection * 100, scale: 0.95 }}
//         transition={{
//           type: isDragging ? "tween" : "spring",
//           duration: isDragging ? 0 : 0.3,
//           damping: 25,
//           stiffness: 300
//         }}
//         className="relative max-w-[95vw] max-h-[85vh] mx-4 touch-pan-y select-none"
//         onClick={(e) => e.stopPropagation()}
//         onTouchStart={onTouchStart}
//         onTouchMove={onTouchMove}
//         onTouchEnd={onTouchEnd}
//         style={{ touchAction: "pan-y" }}
//       >
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={currentImage.image}
//           alt={currentImage.caption || serviceName}
//           className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl pointer-events-none"
//           draggable={false}
//         />
//         {currentImage.caption && (
//           <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
//             <p className="text-white text-center text-sm">{currentImage.caption}</p>
//           </div>
//         )}

//         {/* Визуальная подсказка при свайпе */}
//         {isDragging && Math.abs(dragOffset) > 20 && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className={`absolute top-1/2 -translate-y-1/2 ${
//               dragOffset > 0 ? "left-4" : "right-4"
//             }`}
//           >
//             <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
//               {dragOffset > 0 ? (
//                 <ChevronLeft className="w-8 h-8 text-white" />
//               ) : (
//                 <ChevronRight className="w-8 h-8 text-white" />
//               )}
//             </div>
//           </motion.div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({
//   service, categoryName, onClose, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
//       <motion.div
//         initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-zinc-950/95 sm:rounded-3xl rounded-t-3xl shadow-2xl border border-rose-200/50 dark:border-white/10"
//         onClick={(e) => e.stopPropagation()}>

//         <div className="sm:hidden flex justify-center pt-3 pb-1">
//           <div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-white/20" />
//         </div>

//         <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-white/10 dark:hover:bg-white/15 dark:text-rose-200 transition-colors shadow-lg">
//           <X className="w-5 h-5" />
//         </button>

//         <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//           <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
//             {service.cover || service.gallery.length > 0 ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-white/5 dark:via-white/5 dark:to-white/0" />
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-zinc-950 dark:via-zinc-950/40" />

//             <div className="absolute top-4 left-4">
//               <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-white/10 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">
//                 {categoryName}
//               </span>
//             </div>

//             {service.priceCents && (
//               <div className="absolute bottom-4 right-4">
//                 <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-300/50">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           <div className="p-4 sm:p-6 -mt-6 relative">
//             <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 pr-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//               {service.name}
//             </h2>

//             <div className="flex flex-wrap gap-2 mb-5">
//               <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 text-sm">
//                 <Clock className="w-4 h-4 text-rose-500 dark:text-rose-300" />
//                 {service.durationMin} {translations.minutes}
//               </div>
//               {service.priceCents && (
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 text-sm">
//                   <Euro className="w-4 h-4 text-amber-600 dark:text-amber-300" />
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </div>
//               )}
//             </div>

//             {service.description && (
//               <div className="mb-6">
//                 <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">{service.description}</p>
//               </div>
//             )}

//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-100 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-500 dark:text-rose-300" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-rose-100 dark:border-white/10">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/20 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl text-white font-semibold shadow-lg shadow-rose-300/50 transition-all active:scale-[0.98]">
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>
//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/15 dark:text-zinc-200 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ - УЛУЧШЕННАЯ ======
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
//           active:scale-[0.98] sm:hover:-translate-y-2
//         "
//       >
//         {/* Декоративный уголок */}
//         <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10 pointer-events-none">
//           <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rotate-45" />
//         </div>

//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
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

//         <div className="p-4 sm:p-5 bg-gradient-to-b from-transparent to-rose-50/30 dark:to-transparent">
//           <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors"
//               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//             {service.name}
//           </h3>

//           {service.description && (
//             <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">{service.description}</p>
//           )}

//           <div className="flex items-center gap-3 mb-4">
//             <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm">
//               <Clock className="w-3.5 h-3.5 text-rose-400 dark:text-rose-300" />
//               {service.durationMin} {translations.minutes}
//             </span>
//           </div>

//           <Link
//             href={`/booking?service=${service.id}`}
//             onClick={(e) => e.stopPropagation()}
//             className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-rose-300/40"
//           >
//             {translations.bookNow}
//             <ChevronRight className="w-4 h-4" />
//           </Link>
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

//--------добавляем свайп просмотра фото в карточках--------
// "use client";

// import { useState, useEffect, useCallback } from "react";
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

// // ====== ЛАЙТБОКС ======
// function GalleryLightbox({
//   images, currentIndex, onClose, onPrev, onNext, serviceName,
// }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const currentImage = images[currentIndex];

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl" onClick={onClose}>
//       <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//         <X className="w-6 h-6" />
//       </button>
//       <div className="absolute top-4 left-4 z-50">
//         <p className="text-white/80 text-sm">{currentIndex + 1} / {images.length}</p>
//       </div>
//       {images.length > 1 && (
//         <>
//           <button onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//             <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//           <button onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//             <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//         </>
//       )}
//       <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
//         className="relative max-w-[95vw] max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src={currentImage.image} alt={currentImage.caption || serviceName} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
//         {currentImage.caption && (
//           <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
//             <p className="text-white text-center text-sm">{currentImage.caption}</p>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({
//   service, categoryName, onClose, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
//       <motion.div
//         initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-white dark:bg-zinc-950/95 sm:rounded-3xl rounded-t-3xl shadow-2xl border border-rose-200/50 dark:border-white/10"
//         onClick={(e) => e.stopPropagation()}>

//         <div className="sm:hidden flex justify-center pt-3 pb-1">
//           <div className="w-10 h-1 rounded-full bg-rose-300 dark:bg-white/20" />
//         </div>

//         <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-rose-500 dark:bg-white/10 dark:hover:bg-white/15 dark:text-rose-200 transition-colors shadow-lg">
//           <X className="w-5 h-5" />
//         </button>

//         <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//           <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
//             {service.cover || service.gallery.length > 0 ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-rose-300 via-pink-200 to-amber-200 dark:from-white/5 dark:via-white/5 dark:to-white/0" />
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-zinc-950 dark:via-zinc-950/40" />

//             <div className="absolute top-4 left-4">
//               <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-white/10 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-md border border-rose-200/50 dark:border-white/10">
//                 {categoryName}
//               </span>
//             </div>

//             {service.priceCents && (
//               <div className="absolute bottom-4 right-4">
//                 <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-300/50">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           <div className="p-4 sm:p-6 -mt-6 relative">
//             <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 pr-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//               {service.name}
//             </h2>

//             <div className="flex flex-wrap gap-2 mb-5">
//               <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 text-sm">
//                 <Clock className="w-4 h-4 text-rose-500 dark:text-rose-300" />
//                 {service.durationMin} {translations.minutes}
//               </div>
//               {service.priceCents && (
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 text-sm">
//                   <Euro className="w-4 h-4 text-amber-600 dark:text-amber-300" />
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </div>
//               )}
//             </div>

//             {service.description && (
//               <div className="mb-6">
//                 <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">{service.description}</p>
//               </div>
//             )}

//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-100 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-500 dark:text-rose-300" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-rose-100 dark:border-white/10">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/20 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 rounded-xl text-white font-semibold shadow-lg shadow-rose-300/50 transition-all active:scale-[0.98]">
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>
//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/15 dark:text-zinc-200 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ - УЛУЧШЕННАЯ ======
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
//           active:scale-[0.98] sm:hover:-translate-y-2
//         "
//       >
//         {/* Декоративный уголок */}
//         <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden z-10 pointer-events-none">
//           <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rotate-45" />
//         </div>

//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
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

//         <div className="p-4 sm:p-5 bg-gradient-to-b from-transparent to-rose-50/30 dark:to-transparent">
//           <h3 className="text-base sm:text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors"
//               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//             {service.name}
//           </h3>

//           {service.description && (
//             <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">{service.description}</p>
//           )}

//           <div className="flex items-center gap-3 mb-4">
//             <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm">
//               <Clock className="w-3.5 h-3.5 text-rose-400 dark:text-rose-300" />
//               {service.durationMin} {translations.minutes}
//             </span>
//           </div>

//           <Link
//             href={`/booking?service=${service.id}`}
//             onClick={(e) => e.stopPropagation()}
//             className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-lg shadow-rose-300/40"
//           >
//             {translations.bookNow}
//             <ChevronRight className="w-4 h-4" />
//           </Link>
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

//---------работало, дорабатываем под светлую тему------
// "use client";

// import { useState, useEffect, useCallback } from "react";
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
//   haircut: Scissors,
//   haare: Scissors,
//   hair: Scissors,
//   frisur: Scissors,
//   стрижка: Scissors,
//   manicure: Palette,
//   maniküre: Palette,
//   nails: Palette,
//   nagel: Palette,
//   маникюр: Palette,
//   makeup: Heart,
//   "make-up": Heart,
//   kosmetik: Heart,
//   макияж: Heart,
//   brows: Star,
//   lashes: Star,
//   permanent: Star,
//   брови: Star,
//   ресницы: Star,
//   default: Flower2,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) => slug.toLowerCase().includes(k));
//   return categoryIcons[key || "default"];
// }

// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
//     style: "currency",
//     currency: "EUR",
//     minimumFractionDigits: 0,
//   }).format(cents / 100);
// }

// const cardGradients = [
//   "from-rose-200/70 via-pink-100/70 to-rose-50/70 dark:from-rose-500/10 dark:via-fuchsia-500/10 dark:to-transparent",
//   "from-amber-100/70 via-orange-50/70 to-yellow-50/70 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-transparent",
//   "from-violet-200/70 via-purple-100/70 to-pink-50/70 dark:from-violet-500/10 dark:via-fuchsia-500/10 dark:to-transparent",
//   "from-sky-100/70 via-cyan-50/70 to-teal-50/70 dark:from-sky-500/10 dark:via-cyan-500/10 dark:to-transparent",
//   "from-emerald-100/70 via-teal-50/70 to-cyan-50/70 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-transparent",
// ];

// function PageBackground() {
//   return (
//     <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
//       <div className="absolute inset-0 bg-gradient-to-br from-rose-100/80 via-rose-50 to-amber-50/70 dark:from-[#080812] dark:via-[#0b0b16] dark:to-[#121227]" />
//       <div className="absolute inset-0 bg-rose-50/45 dark:bg-black/45" />

//       <motion.div
//         className="absolute -top-16 -left-16 h-72 w-72 sm:h-[440px] sm:w-[440px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(251,207,232,0.55) 0%, transparent 70%)" }}
//         animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.35, 0.55] }}
//         transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="absolute top-1/4 -right-20 h-72 w-72 sm:h-[520px] sm:w-[520px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(254,215,170,0.45) 0%, transparent 70%)" }}
//         animate={{ scale: [1, 1.1, 1], opacity: [0.45, 0.28, 0.45] }}
//         transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//       />
//       <motion.div
//         className="absolute bottom-0 left-1/4 h-80 w-80 sm:h-[620px] sm:w-[620px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(196,181,253,0.35) 0%, transparent 70%)" }}
//         animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.22, 0.35] }}
//         transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//       />

//       {[...Array(18)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute"
//           style={{ left: `${(i * 6.1) % 100}%`, top: `${(i * 8.3) % 90}%` }}
//           animate={{ y: [0, -26, 0], x: [0, i % 2 === 0 ? 14 : -14, 0], opacity: [0.22, 0.45, 0.22] }}
//           transition={{ duration: 7 + (i % 4) * 2, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
//         >
//           {i % 3 === 0 ? (
//             <Heart className="h-4 w-4 text-rose-300/70 dark:text-rose-300/20" fill="currentColor" />
//           ) : i % 3 === 1 ? (
//             <Sparkles className="h-4 w-4 text-amber-300/70 dark:text-amber-300/20" />
//           ) : (
//             <Star className="h-4 w-4 text-pink-300/70 dark:text-pink-300/20" fill="currentColor" />
//           )}
//         </motion.div>
//       ))}

//       <div
//         className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
//         style={{
//           backgroundImage:
//             "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M40 0h1v80h-1zM0 40h80v1H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
//         }}
//       />
//     </div>
//   );
// }

// function GalleryLightbox({
//   images,
//   currentIndex,
//   onClose,
//   onPrev,
//   onNext,
//   serviceName,
// }: {
//   images: GalleryItem[];
//   currentIndex: number;
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   serviceName: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose, onPrev, onNext]);

//   const currentImage = images[currentIndex];

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl" onClick={onClose}>
//       <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//         <X className="w-6 h-6" />
//       </button>

//       <div className="absolute top-4 left-4 z-50">
//         <p className="text-white/80 text-sm">
//           {currentIndex + 1} / {images.length}
//         </p>
//       </div>

//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onPrev();
//             }}
//             className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
//           >
//             <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onNext();
//             }}
//             className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
//           >
//             <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//         </>
//       )}

//       <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-[95vw] max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src={currentImage.image} alt={currentImage.caption || serviceName} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
//         {currentImage.caption && (
//           <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
//             <p className="text-white text-center text-sm">{currentImage.caption}</p>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// function ServiceDetailModal({
//   service,
//   categoryName,
//   onClose,
//   onOpenGallery,
//   translations,
//   locale,
// }: {
//   service: ServiceChild;
//   categoryName: string;
//   onClose: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
//   locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose]);

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
//       <motion.div
//         initial={{ opacity: 0, y: 100 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-white/90 dark:bg-zinc-950/85 sm:rounded-3xl rounded-t-3xl shadow-2xl border border-black/5 dark:border-white/10"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="sm:hidden flex justify-center pt-3 pb-1">
//           <div className="w-10 h-1 rounded-full bg-rose-200 dark:bg-white/10" />
//         </div>

//         <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-rose-500 dark:bg-white/10 dark:hover:bg-white/15 dark:text-rose-200 transition-colors shadow-md">
//           <X className="w-5 h-5" />
//         </button>

//         <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//           <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
//             {service.cover || service.gallery.length > 0 ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100 dark:from-white/5 dark:via-white/5 dark:to-white/0" />
//             )}

//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/25 to-transparent dark:from-zinc-950 dark:via-zinc-950/40" />

//             <div className="absolute top-4 left-4">
//               <span className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-sm">
//                 {categoryName}
//               </span>
//             </div>

//             {service.priceCents && (
//               <div className="absolute bottom-4 right-4">
//                 <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold text-sm sm:text-base shadow-lg">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           <div className="p-4 sm:p-6 -mt-6 relative">
//             <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 pr-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//               {service.name}
//             </h2>

//             <div className="flex flex-wrap gap-2 mb-5">
//               <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-zinc-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 text-sm">
//                 <Clock className="w-4 h-4 text-rose-500/70 dark:text-rose-200" />
//                 {service.durationMin} {translations.minutes}
//               </div>

//               {service.priceCents && (
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-zinc-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 text-sm">
//                   <Euro className="w-4 h-4 text-amber-600/80 dark:text-amber-200" />
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </div>
//               )}
//             </div>

//             {service.description && (
//               <div className="mb-6">
//                 <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">{service.description}</p>
//               </div>
//             )}

//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-500/70 dark:text-rose-200" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>

//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-black/5 dark:border-white/10">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/20 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link
//                 href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 rounded-xl text-white font-semibold shadow-lg shadow-rose-200/40 transition-all active:scale-[0.98]"
//               >
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>

//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/15 dark:text-zinc-200 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
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
// }: {
//   service: ServiceChild;
//   categoryName: string;
//   index: number;
//   onOpenDetail: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
//   locale: string;
// }) {
//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.04 }} className="group">
//       <div
//         onClick={onOpenDetail}
//         className="relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer bg-white/85 dark:bg-white/7 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] dark:shadow-[0_18px_55px_-28px_rgba(0,0,0,0.75)] hover:shadow-[0_18px_55px_-28px_rgba(0,0,0,0.45)] transition-all duration-500 active:scale-[0.98] sm:hover:-translate-y-1"
//       >
//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
//           {hasImage ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
//           ) : (
//             <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <Flower2 className="w-16 h-16 text-rose-200/60 dark:text-rose-200/20" />
//               </div>
//             </div>
//           )}

//           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/15 to-transparent dark:from-zinc-950 dark:via-zinc-950/35" />

//           {service.priceCents && (
//             <div className="absolute top-3 right-3">
//               <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-white/10 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-bold shadow-sm border border-black/5 dark:border-white/10">
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
//               className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-white/95 dark:bg-white/10 backdrop-blur flex items-center gap-1.5 text-rose-500 dark:text-rose-200 text-xs hover:bg-white dark:hover:bg-white/15 transition-colors shadow-sm border border-black/5 dark:border-white/10"
//             >
//               <Images className="w-3.5 h-3.5" />
//               {service.gallery.length}
//             </button>
//           )}

//           <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
//             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 text-white text-[11px] backdrop-blur dark:bg-black/40">
//               <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
//               {categoryName}
//             </span>
//           </div>
//         </div>

//         <div className="p-4 sm:p-5">
//           <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//             {service.name}
//           </h3>

//           {service.description && <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">{service.description}</p>}

//           <div className="flex items-center gap-3 mb-4">
//             <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm">
//               <Clock className="w-3.5 h-3.5 text-rose-500/70 dark:text-rose-200" />
//               {service.durationMin} {translations.minutes}
//             </span>
//           </div>

//           <Link
//             href={`/booking?service=${service.id}`}
//             onClick={(e) => e.stopPropagation()}
//             className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-md shadow-rose-200/40"
//           >
//             {translations.bookNow}
//             <ChevronRight className="w-4 h-4" />
//           </Link>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// export default function ServicesClient({ categories, locale }: Props) {
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [selectedService, setSelectedService] = useState<{ service: ServiceChild; categoryName: string } | null>(null);
//   const [lightbox, setLightbox] = useState<{ isOpen: boolean; images: GalleryItem[]; currentIndex: number; serviceName: string } | null>(null);

//   const translations = t[locale] || t.de;

//   const openServiceDetail = useCallback((service: ServiceChild, categoryName: string) => setSelectedService({ service, categoryName }), []);

//   const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => setLightbox({ isOpen: true, images, currentIndex: index, serviceName }), []);

//   const closeLightbox = useCallback(() => setLightbox(null), []);

//   const goToPrev = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({ ...lightbox, currentIndex: lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1 });
//   }, [lightbox]);

//   const goToNext = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length });
//   }, [lightbox]);

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
//                 service={selectedService.service}
//                 categoryName={selectedService.categoryName}
//                 onClose={() => setSelectedService(null)}
//                 onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)}
//                 translations={translations}
//                 locale={locale}
//               />
//             )}
//           </AnimatePresence>

//           <section className="relative pt-8 pb-6 sm:pt-16 sm:pb-12">
//             <div className="container mx-auto px-4">
//               <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.1 }}
//                   className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur border border-black/5 dark:border-white/10 shadow-sm mb-4 sm:mb-6"
//                 >
//                   <Sparkles className="w-4 h-4 text-rose-500/80 dark:text-rose-200" />
//                   <span className="text-sm font-medium text-rose-600 dark:text-rose-200">Premium Beauty Salon</span>
//                 </motion.div>

//                 <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                   <span className="bg-gradient-to-r from-rose-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">{translations.title}</span>
//                 </h1>

//                 <div className="flex justify-center items-center gap-3 mb-4">
//                   <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300/80 to-transparent dark:via-white/20" />
//                   <Heart className="w-4 h-4 text-rose-400 dark:text-rose-200" fill="currentColor" />
//                   <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300/80 to-transparent dark:via-white/20" />
//                 </div>

//                 <p className="text-sm sm:text-base md:text-lg text-zinc-700/90 dark:text-zinc-200/90 mb-6 sm:mb-8 px-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>
//                   {translations.subtitle}
//                 </p>

//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 rounded-full text-white font-semibold text-sm sm:text-base shadow-lg shadow-rose-200/40 transition-all active:scale-95 hover:scale-105"
//                 >
//                   {translations.bookNow}
//                   <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//                 </Link>
//               </motion.div>
//             </div>
//           </section>

//           <section className="sticky top-16 z-40">
//             <div className="bg-white/70 dark:bg-zinc-950/55 backdrop-blur-xl border-y border-black/5 dark:border-white/10">
//               <div className="container mx-auto px-4">
//                 <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
//                   <button
//                     onClick={() => setActiveCategory(null)}
//                     className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
//                       activeCategory === null
//                         ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-200/40"
//                         : "bg-white/85 dark:bg-white/8 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-white/12 border border-black/5 dark:border-white/10"
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
//                             ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-200/40"
//                             : "bg-white/85 dark:bg-white/8 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-white/12 border border-black/5 dark:border-white/10"
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

//           <section className="py-8 sm:py-12 lg:py-16 relative">
//             <div className="container mx-auto px-4">
//               {filteredCategories.map((category, catIndex) => (
//                 <motion.div key={category.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: catIndex * 0.08 }} className="mb-12 sm:mb-16 last:mb-0">
//                   <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
//                     <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/75 dark:bg-white/7 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur">
//                       {(() => {
//                         const Icon = getCategoryIcon(category.slug);
//                         return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500/80 dark:text-rose-200" />;
//                       })()}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 truncate" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                         {category.name}
//                       </h2>
//                       <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
//                         {category.children.length} {translations.services}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//                     {category.children.map((service, index) => (
//                       <ServiceCard
//                         key={service.id}
//                         service={service}
//                         categoryName={category.name}
//                         index={index}
//                         onOpenDetail={() => openServiceDetail(service, category.name)}
//                         onOpenGallery={(idx) => openLightbox(service.gallery, idx, service.name)}
//                         translations={translations}
//                         locale={locale}
//                       />
//                     ))}
//                   </div>
//                 </motion.div>
//               ))}

//               {categories.length === 0 && (
//                 <div className="text-center py-16 sm:py-20">
//                   <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white/70 dark:bg-white/8 flex items-center justify-center border border-black/5 dark:border-white/10">
//                     <Flower2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400/70 dark:text-rose-200" />
//                   </div>
//                   <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300">{translations.noServices}</p>
//                 </div>
//               )}
//             </div>
//           </section>

//           <section className="py-12 sm:py-20 relative overflow-hidden">
//             <div className="absolute inset-0 bg-white/55 dark:bg-black/25" />
//             <div className="relative container mx-auto px-4 text-center">
//               <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
//                 <div className="flex justify-center mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-px bg-gradient-to-r from-transparent to-rose-300/80 dark:to-white/20" />
//                     <Heart className="w-5 h-5 text-rose-400 dark:text-rose-200" fill="currentColor" />
//                     <div className="w-10 h-px bg-gradient-to-l from-transparent to-rose-300/80 dark:to-white/20" />
//                   </div>
//                 </div>

//                 <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 sm:mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                   {translations.trustText}
//                 </h2>

//                 <p className="text-zinc-700 dark:text-zinc-200 mb-6 sm:mb-8 max-w-md mx-auto" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>
//                   {translations.welcomeText}
//                 </p>

//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-rose-200/40 transition-all active:scale-95 hover:scale-105"
//                 >
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

// "use client";

// import { useState, useEffect, useCallback } from "react";
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
//   haircut: Scissors,
//   haare: Scissors,
//   hair: Scissors,
//   frisur: Scissors,
//   стрижка: Scissors,
//   manicure: Palette,
//   maniküre: Palette,
//   nails: Palette,
//   nagel: Palette,
//   маникюр: Palette,
//   makeup: Heart,
//   "make-up": Heart,
//   kosmetik: Heart,
//   макияж: Heart,
//   brows: Star,
//   lashes: Star,
//   permanent: Star,
//   брови: Star,
//   ресницы: Star,
//   default: Flower2,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) => slug.toLowerCase().includes(k));
//   return categoryIcons[key || "default"];
// }

// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
//     style: "currency",
//     currency: "EUR",
//     minimumFractionDigits: 0,
//   }).format(cents / 100);
// }

// const cardGradients = [
//   "from-rose-200/70 via-pink-100/70 to-rose-50/70 dark:from-rose-500/10 dark:via-fuchsia-500/10 dark:to-transparent",
//   "from-amber-100/70 via-orange-50/70 to-yellow-50/70 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-transparent",
//   "from-violet-200/70 via-purple-100/70 to-pink-50/70 dark:from-violet-500/10 dark:via-fuchsia-500/10 dark:to-transparent",
//   "from-sky-100/70 via-cyan-50/70 to-teal-50/70 dark:from-sky-500/10 dark:via-cyan-500/10 dark:to-transparent",
//   "from-emerald-100/70 via-teal-50/70 to-cyan-50/70 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-transparent",
// ];

// function PageBackground() {
//   return (
//     <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
//       <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-amber-50/60 dark:from-[#080812] dark:via-[#0b0b16] dark:to-[#121227]" />
//       <div className="absolute inset-0 bg-white/40 dark:bg-black/45" />

//       <motion.div
//         className="absolute -top-16 -left-16 h-72 w-72 sm:h-[440px] sm:w-[440px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(251,207,232,0.55) 0%, transparent 70%)" }}
//         animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.35, 0.55] }}
//         transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="absolute top-1/4 -right-20 h-72 w-72 sm:h-[520px] sm:w-[520px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(254,215,170,0.45) 0%, transparent 70%)" }}
//         animate={{ scale: [1, 1.1, 1], opacity: [0.45, 0.28, 0.45] }}
//         transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//       />
//       <motion.div
//         className="absolute bottom-0 left-1/4 h-80 w-80 sm:h-[620px] sm:w-[620px] rounded-full"
//         style={{ background: "radial-gradient(circle, rgba(196,181,253,0.35) 0%, transparent 70%)" }}
//         animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.22, 0.35] }}
//         transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//       />

//       {[...Array(18)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute"
//           style={{ left: `${(i * 6.1) % 100}%`, top: `${(i * 8.3) % 90}%` }}
//           animate={{ y: [0, -26, 0], x: [0, i % 2 === 0 ? 14 : -14, 0], opacity: [0.22, 0.45, 0.22] }}
//           transition={{ duration: 7 + (i % 4) * 2, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
//         >
//           {i % 3 === 0 ? (
//             <Heart className="h-4 w-4 text-rose-300/70 dark:text-rose-300/20" fill="currentColor" />
//           ) : i % 3 === 1 ? (
//             <Sparkles className="h-4 w-4 text-amber-300/70 dark:text-amber-300/20" />
//           ) : (
//             <Star className="h-4 w-4 text-pink-300/70 dark:text-pink-300/20" fill="currentColor" />
//           )}
//         </motion.div>
//       ))}

//       <div
//         className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
//         style={{
//           backgroundImage:
//             "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M40 0h1v80h-1zM0 40h80v1H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
//         }}
//       />
//     </div>
//   );
// }

// function GalleryLightbox({
//   images,
//   currentIndex,
//   onClose,
//   onPrev,
//   onNext,
//   serviceName,
// }: {
//   images: GalleryItem[];
//   currentIndex: number;
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   serviceName: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose, onPrev, onNext]);

//   const currentImage = images[currentIndex];

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl" onClick={onClose}>
//       <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//         <X className="w-6 h-6" />
//       </button>

//       <div className="absolute top-4 left-4 z-50">
//         <p className="text-white/80 text-sm">
//           {currentIndex + 1} / {images.length}
//         </p>
//       </div>

//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onPrev();
//             }}
//             className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
//           >
//             <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onNext();
//             }}
//             className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
//           >
//             <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//         </>
//       )}

//       <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="relative max-w-[95vw] max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src={currentImage.image} alt={currentImage.caption || serviceName} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
//         {currentImage.caption && (
//           <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
//             <p className="text-white text-center text-sm">{currentImage.caption}</p>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// function ServiceDetailModal({
//   service,
//   categoryName,
//   onClose,
//   onOpenGallery,
//   translations,
//   locale,
// }: {
//   service: ServiceChild;
//   categoryName: string;
//   onClose: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
//   locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose]);

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
//       <motion.div
//         initial={{ opacity: 0, y: 100 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-white/90 dark:bg-zinc-950/85 sm:rounded-3xl rounded-t-3xl shadow-2xl border border-black/5 dark:border-white/10"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="sm:hidden flex justify-center pt-3 pb-1">
//           <div className="w-10 h-1 rounded-full bg-rose-200 dark:bg-white/10" />
//         </div>

//         <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-rose-500 dark:bg-white/10 dark:hover:bg-white/15 dark:text-rose-200 transition-colors shadow-md">
//           <X className="w-5 h-5" />
//         </button>

//         <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//           <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
//             {service.cover || service.gallery.length > 0 ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100 dark:from-white/5 dark:via-white/5 dark:to-white/0" />
//             )}

//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/25 to-transparent dark:from-zinc-950 dark:via-zinc-950/40" />

//             <div className="absolute top-4 left-4">
//               <span className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-medium shadow-sm">
//                 {categoryName}
//               </span>
//             </div>

//             {service.priceCents && (
//               <div className="absolute bottom-4 right-4">
//                 <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold text-sm sm:text-base shadow-lg">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           <div className="p-4 sm:p-6 -mt-6 relative">
//             <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 pr-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//               {service.name}
//             </h2>

//             <div className="flex flex-wrap gap-2 mb-5">
//               <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-zinc-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 text-sm">
//                 <Clock className="w-4 h-4 text-rose-500/70 dark:text-rose-200" />
//                 {service.durationMin} {translations.minutes}
//               </div>

//               {service.priceCents && (
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-zinc-700 dark:bg-white/5 dark:border-white/10 dark:text-zinc-200 text-sm">
//                   <Euro className="w-4 h-4 text-amber-600/80 dark:text-amber-200" />
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </div>
//               )}
//             </div>

//             {service.description && (
//               <div className="mb-6">
//                 <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">{service.description}</p>
//               </div>
//             )}

//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-500/70 dark:text-rose-200" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>

//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-black/5 dark:border-white/10">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/20 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link
//                 href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 rounded-xl text-white font-semibold shadow-lg shadow-rose-200/40 transition-all active:scale-[0.98]"
//               >
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>

//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:hover:bg-white/15 dark:text-zinc-200 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
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
// }: {
//   service: ServiceChild;
//   categoryName: string;
//   index: number;
//   onOpenDetail: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
//   locale: string;
// }) {
//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.04 }} className="group">
//       <div
//         onClick={onOpenDetail}
//         className="relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer bg-white/85 dark:bg-white/7 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] dark:shadow-[0_18px_55px_-28px_rgba(0,0,0,0.75)] hover:shadow-[0_18px_55px_-28px_rgba(0,0,0,0.45)] transition-all duration-500 active:scale-[0.98] sm:hover:-translate-y-1"
//       >
//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
//           {hasImage ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
//           ) : (
//             <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <Flower2 className="w-16 h-16 text-rose-200/60 dark:text-rose-200/20" />
//               </div>
//             </div>
//           )}

//           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/15 to-transparent dark:from-zinc-950 dark:via-zinc-950/35" />

//           {service.priceCents && (
//             <div className="absolute top-3 right-3">
//               <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-white/10 backdrop-blur text-rose-600 dark:text-rose-200 text-xs sm:text-sm font-bold shadow-sm border border-black/5 dark:border-white/10">
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
//               className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-white/95 dark:bg-white/10 backdrop-blur flex items-center gap-1.5 text-rose-500 dark:text-rose-200 text-xs hover:bg-white dark:hover:bg-white/15 transition-colors shadow-sm border border-black/5 dark:border-white/10"
//             >
//               <Images className="w-3.5 h-3.5" />
//               {service.gallery.length}
//             </button>
//           )}

//           <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
//             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 text-white text-[11px] backdrop-blur dark:bg-black/40">
//               <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
//               {categoryName}
//             </span>
//           </div>
//         </div>

//         <div className="p-4 sm:p-5">
//           <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 line-clamp-2 group-hover:text-rose-600 dark:group-hover:text-rose-200 transition-colors" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//             {service.name}
//           </h3>

//           {service.description && <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm line-clamp-2 mb-3">{service.description}</p>}

//           <div className="flex items-center gap-3 mb-4">
//             <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-300 text-xs sm:text-sm">
//               <Clock className="w-3.5 h-3.5 text-rose-500/70 dark:text-rose-200" />
//               {service.durationMin} {translations.minutes}
//             </span>
//           </div>

//           <Link
//             href={`/booking?service=${service.id}`}
//             onClick={(e) => e.stopPropagation()}
//             className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-md shadow-rose-200/40"
//           >
//             {translations.bookNow}
//             <ChevronRight className="w-4 h-4" />
//           </Link>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// export default function ServicesClient({ categories, locale }: Props) {
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [selectedService, setSelectedService] = useState<{ service: ServiceChild; categoryName: string } | null>(null);
//   const [lightbox, setLightbox] = useState<{ isOpen: boolean; images: GalleryItem[]; currentIndex: number; serviceName: string } | null>(null);

//   const translations = t[locale] || t.de;

//   const openServiceDetail = useCallback((service: ServiceChild, categoryName: string) => setSelectedService({ service, categoryName }), []);

//   const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => setLightbox({ isOpen: true, images, currentIndex: index, serviceName }), []);

//   const closeLightbox = useCallback(() => setLightbox(null), []);

//   const goToPrev = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({ ...lightbox, currentIndex: lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1 });
//   }, [lightbox]);

//   const goToNext = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length });
//   }, [lightbox]);

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
//                 service={selectedService.service}
//                 categoryName={selectedService.categoryName}
//                 onClose={() => setSelectedService(null)}
//                 onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)}
//                 translations={translations}
//                 locale={locale}
//               />
//             )}
//           </AnimatePresence>

//           <section className="relative pt-8 pb-6 sm:pt-16 sm:pb-12">
//             <div className="container mx-auto px-4">
//               <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.1 }}
//                   className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur border border-black/5 dark:border-white/10 shadow-sm mb-4 sm:mb-6"
//                 >
//                   <Sparkles className="w-4 h-4 text-rose-500/80 dark:text-rose-200" />
//                   <span className="text-sm font-medium text-rose-600 dark:text-rose-200">Premium Beauty Salon</span>
//                 </motion.div>

//                 <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                   <span className="bg-gradient-to-r from-rose-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">{translations.title}</span>
//                 </h1>

//                 <div className="flex justify-center items-center gap-3 mb-4">
//                   <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300/80 to-transparent dark:via-white/20" />
//                   <Heart className="w-4 h-4 text-rose-400 dark:text-rose-200" fill="currentColor" />
//                   <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300/80 to-transparent dark:via-white/20" />
//                 </div>

//                 <p className="text-sm sm:text-base md:text-lg text-zinc-700/90 dark:text-zinc-200/90 mb-6 sm:mb-8 px-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>
//                   {translations.subtitle}
//                 </p>

//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 rounded-full text-white font-semibold text-sm sm:text-base shadow-lg shadow-rose-200/40 transition-all active:scale-95 hover:scale-105"
//                 >
//                   {translations.bookNow}
//                   <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//                 </Link>
//               </motion.div>
//             </div>
//           </section>

//           <section className="sticky top-16 z-40">
//             <div className="bg-white/70 dark:bg-zinc-950/55 backdrop-blur-xl border-y border-black/5 dark:border-white/10">
//               <div className="container mx-auto px-4">
//                 <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
//                   <button
//                     onClick={() => setActiveCategory(null)}
//                     className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
//                       activeCategory === null
//                         ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-200/40"
//                         : "bg-white/85 dark:bg-white/8 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-white/12 border border-black/5 dark:border-white/10"
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
//                             ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-200/40"
//                             : "bg-white/85 dark:bg-white/8 text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-white/12 border border-black/5 dark:border-white/10"
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

//           <section className="py-8 sm:py-12 lg:py-16 relative">
//             <div className="container mx-auto px-4">
//               {filteredCategories.map((category, catIndex) => (
//                 <motion.div key={category.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: catIndex * 0.08 }} className="mb-12 sm:mb-16 last:mb-0">
//                   <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
//                     <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/75 dark:bg-white/7 border border-black/5 dark:border-white/10 shadow-sm backdrop-blur">
//                       {(() => {
//                         const Icon = getCategoryIcon(category.slug);
//                         return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500/80 dark:text-rose-200" />;
//                       })()}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 truncate" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                         {category.name}
//                       </h2>
//                       <span className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
//                         {category.children.length} {translations.services}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//                     {category.children.map((service, index) => (
//                       <ServiceCard
//                         key={service.id}
//                         service={service}
//                         categoryName={category.name}
//                         index={index}
//                         onOpenDetail={() => openServiceDetail(service, category.name)}
//                         onOpenGallery={(idx) => openLightbox(service.gallery, idx, service.name)}
//                         translations={translations}
//                         locale={locale}
//                       />
//                     ))}
//                   </div>
//                 </motion.div>
//               ))}

//               {categories.length === 0 && (
//                 <div className="text-center py-16 sm:py-20">
//                   <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-white/70 dark:bg-white/8 flex items-center justify-center border border-black/5 dark:border-white/10">
//                     <Flower2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400/70 dark:text-rose-200" />
//                   </div>
//                   <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300">{translations.noServices}</p>
//                 </div>
//               )}
//             </div>
//           </section>

//           <section className="py-12 sm:py-20 relative overflow-hidden">
//             <div className="absolute inset-0 bg-white/55 dark:bg-black/25" />
//             <div className="relative container mx-auto px-4 text-center">
//               <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
//                 <div className="flex justify-center mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-px bg-gradient-to-r from-transparent to-rose-300/80 dark:to-white/20" />
//                     <Heart className="w-5 h-5 text-rose-400 dark:text-rose-200" fill="currentColor" />
//                     <div className="w-10 h-px bg-gradient-to-l from-transparent to-rose-300/80 dark:to-white/20" />
//                   </div>
//                 </div>

//                 <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 sm:mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                   {translations.trustText}
//                 </h2>

//                 <p className="text-zinc-700 dark:text-zinc-200 mb-6 sm:mb-8 max-w-md mx-auto" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>
//                   {translations.welcomeText}
//                 </p>

//                 <Link
//                   href="/booking"
//                   className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-rose-200/40 transition-all active:scale-95 hover:scale-105"
//                 >
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

// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
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

// // =====================
// // Types
// // =====================

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

// // =====================
// // i18n
// // =====================

// const t: Record<string, Record<string, string>> = {
//   de: {
//     title: "Unsere Leistungen",
//     subtitle: "Premium-Treatments für deinen perfekten Glow",
//     bookNow: "Termin buchen",
//     from: "ab",
//     minutes: "Min.",
//     noServices: "Keine Dienstleistungen verfügbar",
//     allCategories: "Alle",
//     photos: "Fotos",
//     close: "Schließen",
//     ourWorks: "Unsere Arbeiten",
//     services: "Leistungen",
//     trustText: "Zeit für dich. Wir kümmern uns um den Rest.",
//     welcomeText: "Entspann dich — wir machen deinen Look strahlend.",
//   },
//   ru: {
//     title: "Наши услуги",
//     subtitle: "Премиальный уход — для твоего идеального образа",
//     bookNow: "Записаться",
//     from: "от",
//     minutes: "мин.",
//     noServices: "Услуги не найдены",
//     allCategories: "Все",
//     photos: "фото",
//     close: "Закрыть",
//     ourWorks: "Наши работы",
//     services: "услуг",
//     trustText: "Время для себя. Остальное — мы.",
//     welcomeText: "Расслабься — мы подчеркнём твою красоту.",
//   },
//   en: {
//     title: "Our Services",
//     subtitle: "Premium care for your best, effortless look",
//     bookNow: "Book Now",
//     from: "from",
//     minutes: "min.",
//     noServices: "No services available",
//     allCategories: "All",
//     photos: "photos",
//     close: "Close",
//     ourWorks: "Our Works",
//     services: "services",
//     trustText: "Time for you. We handle the rest.",
//     welcomeText: "Relax — we’ll enhance your natural beauty.",
//   },
// };

// // =====================
// // Helpers
// // =====================

// const categoryIcons: Record<string, typeof Scissors> = {
//   haircut: Scissors,
//   haare: Scissors,
//   hair: Scissors,
//   frisur: Scissors,
//   стрижка: Scissors,

//   manicure: Palette,
//   maniküre: Palette,
//   nails: Palette,
//   nagel: Palette,
//   маникюр: Palette,

//   makeup: Heart,
//   "make-up": Heart,
//   kosmetik: Heart,
//   макияж: Heart,

//   brows: Star,
//   lashes: Star,
//   permanent: Star,
//   брови: Star,
//   ресницы: Star,

//   default: Flower2,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) => slug.toLowerCase().includes(k));
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
//     }
//   ).format(cents / 100);
// }

// const cardGradients = [
//   "from-rose-200/60 via-pink-100/60 to-rose-50/60",
//   "from-amber-100/60 via-orange-50/60 to-yellow-50/60",
//   "from-violet-200/60 via-purple-100/60 to-pink-50/60",
//   "from-sky-100/60 via-cyan-50/60 to-teal-50/60",
//   "from-emerald-100/60 via-teal-50/60 to-cyan-50/60",
// ];

// // =====================
// // Background
// // =====================

// function AnimatedBackground() {
//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden">
//       {/* Base */}
//       <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-amber-50/40 dark:from-zinc-950 dark:via-zinc-950 dark:to-rose-950/20" />

//       {/* Soft mesh */}
//       <div
//         className="absolute inset-0 opacity-[0.08] dark:opacity-[0.06]"
//         style={{
//           backgroundImage:
//             "radial-gradient(circle at 20% 20%, rgba(244,114,182,0.25), transparent 35%), radial-gradient(circle at 80% 10%, rgba(251,191,36,0.18), transparent 35%), radial-gradient(circle at 70% 70%, rgba(168,85,247,0.16), transparent 35%), radial-gradient(circle at 15% 75%, rgba(34,211,238,0.14), transparent 35%)",
//         }}
//       />

//       {/* Animated waves (lighter than before to improve contrast) */}
//       <svg
//         className="absolute bottom-0 left-0 w-full h-auto opacity-25 dark:opacity-15"
//         viewBox="0 0 1440 320"
//         preserveAspectRatio="none"
//       >
//         <motion.path
//           fill="url(#wave-gradient-1)"
//           animate={{
//             d: [
//               "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,213.3C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
//               "M0,192L48,186.7C96,181,192,171,288,186.7C384,203,480,245,576,234.7C672,224,768,160,864,154.7C960,149,1056,203,1152,218.7C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
//               "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,213.3C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
//             ],
//           }}
//           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <defs>
//           <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#fecdd3" />
//             <stop offset="50%" stopColor="#fbcfe8" />
//             <stop offset="100%" stopColor="#fde68a" />
//           </linearGradient>
//         </defs>
//       </svg>

//       {/* Floating tiny accents */}
//       {[...Array(14)].map((_, i) => (
//         <motion.div
//           // eslint-disable-next-line react/no-array-index-key
//           key={i}
//           className="absolute pointer-events-none"
//           style={{
//             left: `${(i * 7.1) % 100}%`,
//             top: `${(i * 9.3) % 78}%`,
//           }}
//           animate={{
//             y: [0, -26, 0],
//             x: [0, i % 2 === 0 ? 14 : -14, 0],
//             rotate: [0, i % 2 === 0 ? 12 : -12, 0],
//             scale: [1, 1.08, 1],
//             opacity: [0.25, 0.55, 0.25],
//           }}
//           transition={{
//             duration: 6 + (i % 4) * 2,
//             repeat: Infinity,
//             delay: i * 0.25,
//             ease: "easeInOut",
//           }}
//         >
//           {i % 3 === 0 ? (
//             <Heart className="w-4 h-4 text-rose-300/70 dark:text-rose-200/30" fill="currentColor" />
//           ) : i % 3 === 1 ? (
//             <Sparkles className="w-4 h-4 text-amber-300/70 dark:text-amber-200/30" />
//           ) : (
//             <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-rose-300/60 to-pink-200/50 dark:from-rose-200/25 dark:to-pink-200/15" />
//           )}
//         </motion.div>
//       ))}

//       {/* Subtle grid */}
//       <div
//         className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
//         style={{
//           backgroundImage:
//             "url(\"data:image/svg+xml,%3Csvg width='72' height='72' viewBox='0 0 72 72' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 0V72M0 36H72' stroke='%23000' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")",
//         }}
//       />
//     </div>
//   );
// }

// function HeroVisual() {
//   return (
//     <div className="relative h-64 sm:h-80 lg:h-[420px] w-full overflow-hidden rounded-3xl">
//       <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-rose-50/70 to-amber-50/60 dark:from-zinc-900/60 dark:via-zinc-900/40 dark:to-rose-950/20" />

//       {/* Decorative blobs */}
//       <motion.div
//         className="absolute -top-20 -left-16 h-56 w-56 rounded-full"
//         style={{
//           background: "radial-gradient(circle, rgba(244,114,182,0.32) 0%, transparent 70%)",
//         }}
//         animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0.45, 0.7] }}
//         transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full"
//         style={{
//           background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)",
//         }}
//         animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.4, 0.6] }}
//         transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
//       />
//       <motion.div
//         className="absolute top-10 right-12 h-44 w-44 rounded-full"
//         style={{
//           background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)",
//         }}
//         animate={{ y: [0, -10, 0], opacity: [0.45, 0.28, 0.45] }}
//         transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* Icon chips */}
//       <div className="absolute inset-0 p-6 sm:p-7">
//         <div className="absolute left-6 top-6 sm:left-7 sm:top-7 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-100">
//           <Sparkles className="h-4 w-4 text-rose-400" />
//           Glow & Care
//         </div>

//         <div className="absolute right-6 bottom-6 sm:right-7 sm:bottom-7 grid grid-cols-2 gap-3">
//           {[Heart, Star, Palette, Scissors].map((Icon, idx) => (
//             <div
//               // eslint-disable-next-line react/no-array-index-key
//               key={idx}
//               className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/55"
//             >
//               <Icon className="h-6 w-6 text-rose-400" />
//             </div>
//           ))}
//         </div>

//         <div className="absolute left-6 bottom-6 sm:left-7 sm:bottom-7 w-[55%] max-w-[340px] rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/55">
//           <div className="flex items-center gap-3">
//             <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-400 shadow-sm" />
//             <div className="min-w-0">
//               <div className="h-2.5 w-24 rounded-full bg-stone-200/80 dark:bg-white/10" />
//               <div className="mt-2 h-2.5 w-32 rounded-full bg-stone-200/60 dark:bg-white/10" />
//             </div>
//           </div>
//           <div className="mt-3 grid grid-cols-3 gap-2">
//             <div className="h-8 rounded-2xl bg-gradient-to-br from-rose-200/70 to-pink-100/70 dark:from-rose-950/30 dark:to-pink-950/10" />
//             <div className="h-8 rounded-2xl bg-gradient-to-br from-amber-100/70 to-yellow-50/70 dark:from-amber-950/25 dark:to-yellow-950/10" />
//             <div className="h-8 rounded-2xl bg-gradient-to-br from-violet-200/60 to-fuchsia-100/60 dark:from-violet-950/25 dark:to-fuchsia-950/10" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // =====================
// // Lightbox
// // =====================

// function GalleryLightbox({
//   images,
//   currentIndex,
//   onClose,
//   onPrev,
//   onNext,
//   serviceName,
// }: {
//   images: GalleryItem[];
//   currentIndex: number;
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   serviceName: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose, onPrev, onNext]);

//   const currentImage = images[currentIndex];

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
//       onClick={onClose}
//     >
//       <button
//         onClick={onClose}
//         className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
//       >
//         <X className="h-6 w-6" />
//       </button>

//       <div className="absolute left-4 top-4 z-50">
//         <p className="text-sm text-white/80">
//           {currentIndex + 1} / {images.length}
//         </p>
//       </div>

//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onPrev();
//             }}
//             className="absolute left-2 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4 sm:p-3"
//           >
//             <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
//           </button>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onNext();
//             }}
//             className="absolute right-2 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4 sm:p-3"
//           >
//             <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
//           </button>
//         </>
//       )}

//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, scale: 0.94 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="relative mx-4 max-h-[85vh] max-w-[95vw]"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={currentImage.image}
//           alt={currentImage.caption || serviceName}
//           className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
//         />
//         {currentImage.caption && (
//           <div className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-black/80 to-transparent p-3">
//             <p className="text-center text-sm text-white">{currentImage.caption}</p>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // =====================
// // Service modal
// // =====================

// function ServiceDetailModal({
//   service,
//   categoryName,
//   onClose,
//   onOpenGallery,
//   translations,
//   locale,
// }: {
//   service: ServiceChild;
//   categoryName: string;
//   onClose: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
//   locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose]);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end justify-center bg-stone-900/50 backdrop-blur-sm sm:items-center"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 100 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full max-h-[92vh] overflow-hidden rounded-t-3xl border border-white/70 bg-gradient-to-b from-white to-rose-50/30 shadow-2xl dark:border-white/10 dark:from-zinc-950 dark:to-zinc-950 sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-center pb-1 pt-3 sm:hidden">
//           <div className="h-1 w-10 rounded-full bg-rose-200" />
//         </div>

//         <button
//           onClick={onClose}
//           className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-2 text-rose-500 shadow-md transition-colors hover:bg-white hover:text-rose-600 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-900 sm:right-4 sm:top-4"
//         >
//           <X className="h-5 w-5" />
//         </button>

//         <div className="max-h-[92vh] overflow-y-auto sm:max-h-[90vh]">
//           <div className="relative h-52 overflow-hidden sm:h-64 md:h-72">
//             {service.cover || service.gallery.length > 0 ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img
//                 src={service.cover || service.gallery[0]?.image}
//                 alt={service.name}
//                 className="h-full w-full object-cover"
//               />
//             ) : (
//               <div className="h-full w-full bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100" />
//             )}

//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/35 to-transparent dark:from-zinc-950 dark:via-zinc-950/30" />

//             <div className="absolute left-4 top-4">
//               <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-100 sm:text-sm">
//                 {categoryName}
//               </span>
//             </div>

//             {service.priceCents && (
//               <div className="absolute bottom-4 right-4">
//                 <span className="rounded-full bg-gradient-to-r from-rose-400 to-pink-400 px-4 py-2 text-sm font-bold text-white shadow-lg sm:text-base">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           <div className="relative -mt-6 p-4 sm:p-6">
//             <h2
//               className="mb-4 pr-10 text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl"
//               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
//             >
//               {service.name}
//             </h2>

//             <div className="mb-5 flex flex-wrap gap-2">
//               <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-sm text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
//                 <Clock className="h-4 w-4 text-rose-400" />
//                 {service.durationMin} {translations.minutes}
//               </div>
//               {service.priceCents && (
//                 <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-sm text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
//                   <Euro className="h-4 w-4 text-amber-500" />
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </div>
//               )}
//             </div>

//             {service.description && (
//               <div className="mb-6">
//                 <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600 dark:text-zinc-300 sm:text-base">
//                   {service.description}
//                 </p>
//               </div>
//             )}

//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-800 dark:text-zinc-100">
//                   <Images className="h-4 w-4 text-rose-400" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>

//                 <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button
//                       key={item.id}
//                       onClick={() => onOpenGallery(idx)}
//                       className="group relative aspect-square overflow-hidden rounded-xl shadow-sm outline-none ring-1 ring-white/60 transition focus-visible:ring-2 focus-visible:ring-rose-400 dark:ring-white/10"
//                     >
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img
//                         src={item.image}
//                         alt=""
//                         className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
//                       />
//                       <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
//                         <ZoomIn className="h-5 w-5 text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col gap-3 pb-6 pt-2 sm:flex-row sm:pb-4">
//               <Link
//                 href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 px-6 py-3.5 font-semibold text-white shadow-lg shadow-rose-200/40 transition-all active:scale-[0.98] hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 dark:shadow-none"
//               >
//                 <Calendar className="h-5 w-5" />
//                 {translations.bookNow}
//               </Link>

//               <button
//                 onClick={onClose}
//                 className="rounded-xl bg-stone-100 px-6 py-3.5 font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
//               >
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // =====================
// // Service card
// // =====================

// function ServiceCard({
//   service,
//   categoryName,
//   index,
//   onOpenDetail,
//   onOpenGallery,
//   translations,
//   locale,
// }: {
//   service: ServiceChild;
//   categoryName: string;
//   index: number;
//   onOpenDetail: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
//   locale: string;
// }) {
//   const hasImage = Boolean(service.cover || service.gallery.length > 0);
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 18 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.45, delay: index * 0.04 }}
//       className="group"
//     >
//       <div
//         onClick={onOpenDetail}
//         className="relative cursor-pointer rounded-3xl p-[1px] transition-transform duration-500 sm:hover:-translate-y-1"
//       >
//         {/* Gradient border */}
//         <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/70 via-rose-200/50 to-amber-200/45 opacity-80 blur-[0.5px] dark:from-white/10 dark:via-rose-400/10 dark:to-amber-400/10" />

//         {/* Inner */}
//         <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm backdrop-blur-xl transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-rose-200/40 dark:border-white/10 dark:bg-zinc-950/50 dark:shadow-none">
//           {/* Top media */}
//           <div className="relative h-44 overflow-hidden sm:h-48 lg:h-52">
//             {hasImage ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img
//                 src={imageUrl}
//                 alt={service.name}
//                 className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
//               />
//             ) : (
//               <div
//                 className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}
//               >
//                 <div className="absolute inset-0 flex items-center justify-center">
//                   <Flower2 className="h-16 w-16 text-rose-200/60" />
//                 </div>
//               </div>
//             )}

//             {/* Overlays */}
//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/25 to-transparent dark:from-zinc-950 dark:via-zinc-950/20" />

//             {/* Category chip */}
//             <div className="absolute bottom-3 left-3">
//               <span className="inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/75 px-3 py-1.5 text-[11px] font-semibold text-stone-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100">
//                 <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
//                 <span className="max-w-[140px] truncate">{categoryName}</span>
//               </span>
//             </div>

//             {/* Price */}
//             {service.priceCents && (
//               <div className="absolute right-3 top-3">
//                 <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm backdrop-blur dark:bg-zinc-900/60 dark:text-zinc-100 sm:text-sm">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}

//             {/* Gallery count */}
//             {service.gallery.length > 0 && (
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onOpenGallery(0);
//                 }}
//                 className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-xs font-medium text-rose-500 shadow-sm backdrop-blur transition-colors hover:bg-white dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:bg-zinc-900"
//               >
//                 <Images className="h-3.5 w-3.5" />
//                 {service.gallery.length}
//               </button>
//             )}

//             {/* Shine */}
//             <div className="pointer-events-none absolute -left-24 top-0 h-full w-24 -skew-x-12 bg-white/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
//           </div>

//           {/* Content */}
//           <div className="p-4 sm:p-5">
//             <h3
//               className="mb-1.5 line-clamp-2 text-base font-bold text-stone-900 transition-colors group-hover:text-rose-600 dark:text-white sm:text-lg"
//               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
//             >
//               {service.name}
//             </h3>

//             {service.description && (
//               <p className="mb-4 line-clamp-2 text-xs text-stone-600 dark:text-zinc-300 sm:text-sm">
//                 {service.description}
//               </p>
//             )}

//             <div className="mb-4 flex items-center justify-between gap-3">
//               <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-zinc-300 sm:text-sm">
//                 <Clock className="h-4 w-4 text-rose-400" />
//                 {service.durationMin} {translations.minutes}
//               </span>

//               {/* Micro badge */}
//               <span className="rounded-full bg-gradient-to-r from-rose-50 to-amber-50 px-3 py-1 text-[11px] font-semibold text-stone-600 ring-1 ring-rose-100/60 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10">
//                 Premium
//               </span>
//             </div>

//             <Link
//               href={`/booking?service=${service.id}`}
//               onClick={(e) => e.stopPropagation()}
//               className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200/40 transition-all active:scale-[0.98] hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 dark:shadow-none sm:py-3"
//             >
//               {translations.bookNow}
//               <ChevronRight className="h-4 w-4" />
//             </Link>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // =====================
// // Page
// // =====================

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
//     (service: ServiceChild, categoryName: string) => setSelectedService({ service, categoryName }),
//     []
//   );

//   const openLightbox = useCallback(
//     (images: GalleryItem[], index: number, serviceName: string) =>
//       setLightbox({ isOpen: true, images, currentIndex: index, serviceName }),
//     []
//   );

//   const closeLightbox = useCallback(() => setLightbox(null), []);

//   const goToPrev = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({
//       ...lightbox,
//       currentIndex:
//         lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1,
//     });
//   }, [lightbox]);

//   const goToNext = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({
//       ...lightbox,
//       currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length,
//     });
//   }, [lightbox]);

//   const filteredCategories = categories.filter((cat) => !activeCategory || cat.id === activeCategory);

//   return (
//     <>
//       {/* Fonts */}
//       <style jsx global>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&display=swap');
//       `}</style>

//       <main className="relative min-h-screen">
//         <AnimatedBackground />

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
//                 openLightbox(selectedService.service.gallery, index, selectedService.service.name)
//               }
//               translations={translations}
//               locale={locale}
//             />
//           )}
//         </AnimatePresence>

//         {/* Hero */}
//         <section className="relative pb-8 pt-6 sm:pb-10 sm:pt-12">
//           <div className="container mx-auto px-4">
//             <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
//               <motion.div
//                 initial={{ opacity: 0, y: 18 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6 }}
//               >
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.08 }}
//                   className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-100/60 bg-white/70 px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/50 dark:text-rose-200"
//                 >
//                   <Sparkles className="h-4 w-4" />
//                   Premium Beauty Salon
//                 </motion.div>

//                 <h1
//                   className="text-4xl font-bold leading-[1.04] text-stone-900 dark:text-white sm:text-5xl md:text-6xl"
//                   style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
//                 >
//                   <span className="bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400 bg-clip-text text-transparent">
//                     {translations.title}
//                   </span>
//                 </h1>

//                 <div className="mt-4 flex items-center gap-3">
//                   <div className="h-px w-14 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
//                   <Heart className="h-4 w-4 text-rose-300" fill="currentColor" />
//                   <div className="h-px w-14 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
//                 </div>

//                 <p
//                   className="mt-4 max-w-xl text-base text-stone-600 dark:text-zinc-300 sm:text-lg"
//                   style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
//                 >
//                   {translations.subtitle}
//                 </p>

//                 <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
//                   <Link
//                     href="/booking"
//                     className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-200/50 transition-all active:scale-95 hover:scale-[1.02] hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 dark:shadow-none sm:text-base"
//                   >
//                     {translations.bookNow}
//                     <ArrowRight className="h-5 w-5" />
//                   </Link>

//                   <div className="inline-flex items-center justify-center gap-3 rounded-full border border-white/70 bg-white/60 px-5 py-3 text-xs font-medium text-stone-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-300 sm:justify-start sm:text-sm">
//                     <span className="inline-flex items-center gap-2">
//                       <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
//                       4.9/5
//                     </span>
//                     <span className="h-4 w-px bg-stone-200 dark:bg-white/10" />
//                     <span className="inline-flex items-center gap-2">
//                       <Sparkles className="h-4 w-4 text-rose-400" />
//                       {Math.max(
//                         0,
//                         categories.reduce((acc, c) => acc + c.children.length, 0)
//                       )}{" "}
//                       {translations.services}
//                     </span>
//                   </div>
//                 </div>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 18 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: 0.1 }}
//                 className="hidden lg:block"
//               >
//                 <HeroVisual />
//               </motion.div>
//             </div>
//           </div>
//         </section>

//         {/* Category filter */}
//         <section className="sticky top-16 z-40 border-y border-rose-100/30 bg-white/65 backdrop-blur-xl shadow-[0_8px_30px_rgba(244,63,94,0.06)] dark:border-white/10 dark:bg-zinc-950/60 dark:shadow-none">
//           <div className="container mx-auto px-4">
//             <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide sm:py-4">
//               <button
//                 onClick={() => setActiveCategory(null)}
//                 className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all sm:px-5 sm:py-2.5 sm:text-sm ${
//                   activeCategory === null
//                     ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-200/40"
//                     : "border border-rose-100/60 bg-white/80 text-stone-600 hover:bg-white hover:text-rose-600 dark:border-white/10 dark:bg-zinc-950/50 dark:text-zinc-200 dark:hover:bg-zinc-950"
//                 }`}
//               >
//                 {translations.allCategories}
//               </button>

//               {categories.map((cat) => {
//                 const Icon = getCategoryIcon(cat.slug);
//                 const isActive = activeCategory === cat.id;

//                 return (
//                   <button
//                     key={cat.id}
//                     onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
//                     className={`group flex-shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all sm:px-5 sm:py-2.5 sm:text-sm ${
//                       isActive
//                         ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-200/40"
//                         : "border border-rose-100/60 bg-white/80 text-stone-600 hover:bg-white hover:text-rose-600 dark:border-white/10 dark:bg-zinc-950/50 dark:text-zinc-200 dark:hover:bg-zinc-950"
//                     }`}
//                   >
//                     <Icon
//                       className={`h-4 w-4 ${
//                         isActive
//                           ? "text-white"
//                           : "text-rose-400 group-hover:text-rose-500 dark:text-rose-300"
//                       }`}
//                     />
//                     <span className="whitespace-nowrap">{cat.name}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Services */}
//         <section className="relative py-8 sm:py-12 lg:py-16">
//           <div className="container mx-auto px-4">
//             {filteredCategories.map((category, catIndex) => (
//               <motion.div
//                 key={category.id}
//                 initial={{ opacity: 0, y: 16 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: catIndex * 0.08 }}
//                 className="mb-12 sm:mb-16 last:mb-0"
//               >
//                 {/* Category header */}
//                 <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
//                   <div className="rounded-2xl border border-rose-100/60 bg-white/70 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/45">
//                     {(() => {
//                       const Icon = getCategoryIcon(category.slug);
//                       return <Icon className="h-6 w-6 text-rose-400" />;
//                     })()}
//                   </div>

//                   <div className="min-w-0 flex-1">
//                     <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
//                       <h2
//                         className="truncate text-xl font-bold text-stone-900 dark:text-white sm:text-2xl md:text-3xl"
//                         style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
//                       >
//                         {category.name}
//                       </h2>
//                       <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-stone-600 ring-1 ring-rose-100/60 dark:bg-zinc-950/45 dark:text-zinc-300 dark:ring-white/10">
//                         {category.children.length} {translations.services}
//                       </span>
//                     </div>

//                     {category.description && (
//                       <p className="mt-1 line-clamp-2 max-w-3xl text-sm text-stone-600 dark:text-zinc-300">
//                         {category.description}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Grid */}
//                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
//                   {category.children.map((service, index) => (
//                     <ServiceCard
//                       key={service.id}
//                       service={service}
//                       categoryName={category.name}
//                       index={index}
//                       onOpenDetail={() => openServiceDetail(service, category.name)}
//                       onOpenGallery={(idx) => openLightbox(service.gallery, idx, service.name)}
//                       translations={translations}
//                       locale={locale}
//                     />
//                   ))}
//                 </div>
//               </motion.div>
//             ))}

//             {categories.length === 0 && (
//               <div className="py-20 text-center">
//                 <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 dark:bg-white/5">
//                   <Flower2 className="h-10 w-10 text-rose-300" />
//                 </div>
//                 <p className="text-lg text-stone-500 dark:text-zinc-300 sm:text-xl">
//                   {translations.noServices}
//                 </p>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* Bottom CTA */}
//         <section className="relative overflow-hidden py-14 sm:py-20">
//           <div className="absolute inset-0 bg-gradient-to-r from-rose-100/35 via-white/60 to-amber-50/35 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950" />
//           <div className="relative container mx-auto px-4 text-center">
//             <motion.div
//               initial={{ opacity: 0, y: 16 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//             >
//               <div className="mb-4 flex justify-center">
//                 <div className="flex items-center gap-3">
//                   <div className="h-px w-10 bg-gradient-to-r from-transparent to-rose-300" />
//                   <Heart className="h-5 w-5 text-rose-400" fill="currentColor" />
//                   <div className="h-px w-10 bg-gradient-to-l from-transparent to-rose-300" />
//                 </div>
//               </div>

//               <h2
//                 className="mb-3 text-2xl font-bold text-stone-900 dark:text-white sm:mb-4 sm:text-3xl md:text-4xl"
//                 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
//               >
//                 {translations.trustText}
//               </h2>

//               <p
//                 className="mx-auto mb-7 max-w-xl text-stone-600 dark:text-zinc-300"
//                 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
//               >
//                 {translations.welcomeText}
//               </p>

//               <Link
//                 href="/booking"
//                 className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 px-9 py-4 text-base font-bold text-white shadow-xl shadow-rose-200/50 transition-all active:scale-95 hover:scale-[1.02] hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 dark:shadow-none sm:px-11 sm:py-5"
//               >
//                 {translations.bookNow}
//                 <ArrowRight className="h-5 w-5" />
//               </Link>
//             </motion.div>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }

//-------------GPT test

// "use client";

// import { useState, useEffect, useCallback } from "react";
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
//   Flower2
// } from "lucide-react";

// // Типы
// type GalleryItem = { id: string; image: string; caption: string | null };
// type ServiceChild = {
//   id: string; slug: string; name: string; description: string | null;
//   priceCents: number | null; durationMin: number; cover: string | null;
//   gallery: GalleryItem[];
// };
// type Category = {
//   id: string; slug: string; name: string; description: string | null;
//   cover: string | null; gallery: GalleryItem[]; children: ServiceChild[];
// };
// type Props = { categories: Category[]; locale: string };

// // Переводы
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

// // Иконки
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

// // Нежные градиенты для карточек без изображений
// const cardGradients = [
//   "from-rose-200/60 via-pink-100/60 to-rose-50/60",
//   "from-amber-100/60 via-orange-50/60 to-yellow-50/60",
//   "from-violet-200/60 via-purple-100/60 to-pink-50/60",
//   "from-sky-100/60 via-cyan-50/60 to-teal-50/60",
//   "from-emerald-100/60 via-teal-50/60 to-cyan-50/60",
// ];

// // ====== АНИМИРОВАННЫЙ ФОН ======
// function AnimatedBackground() {
//   return (
//     <div className="fixed inset-0 -z-10 overflow-hidden">
//       {/* Базовый градиент */}
//       <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-amber-50/50" />

//       {/* Анимированные волны */}
//       <svg className="absolute bottom-0 left-0 w-full h-auto opacity-30" viewBox="0 0 1440 320" preserveAspectRatio="none">
//         <motion.path
//           fill="url(#wave-gradient-1)"
//           animate={{
//             d: [
//               "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,213.3C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
//               "M0,192L48,186.7C96,181,192,171,288,186.7C384,203,480,245,576,234.7C672,224,768,160,864,154.7C960,149,1056,203,1152,218.7C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
//               "M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,213.3C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
//             ],
//           }}
//           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <defs>
//           <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#fecdd3" />
//             <stop offset="50%" stopColor="#fbcfe8" />
//             <stop offset="100%" stopColor="#fde68a" />
//           </linearGradient>
//         </defs>
//       </svg>

//       <svg className="absolute bottom-0 left-0 w-full h-auto opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
//         <motion.path
//           fill="url(#wave-gradient-2)"
//           animate={{
//             d: [
//               "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
//               "M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,197.3C672,213,768,235,864,240C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
//               "M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
//             ],
//           }}
//           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
//         />
//         <defs>
//           <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%" stopColor="#c4b5fd" />
//             <stop offset="50%" stopColor="#f9a8d4" />
//             <stop offset="100%" stopColor="#fcd34d" />
//           </linearGradient>
//         </defs>
//       </svg>

//       {/* Плавающие декоративные элементы */}
//       {[...Array(20)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute pointer-events-none"
//           style={{
//             left: `${(i * 5.3) % 100}%`,
//             top: `${(i * 7.7) % 80}%`,
//           }}
//           animate={{
//             y: [0, -30, 0],
//             x: [0, i % 2 === 0 ? 15 : -15, 0],
//             rotate: [0, i % 2 === 0 ? 15 : -15, 0],
//             scale: [1, 1.1, 1],
//             opacity: [0.4, 0.7, 0.4],
//           }}
//           transition={{
//             duration: 5 + (i % 4) * 2,
//             repeat: Infinity,
//             delay: i * 0.3,
//             ease: "easeInOut",
//           }}
//         >
//           {i % 4 === 0 ? (
//             <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300/60" fill="currentColor" />
//           ) : i % 4 === 1 ? (
//             <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300/60" />
//           ) : i % 4 === 2 ? (
//             <Star className="w-3 h-3 sm:w-4 sm:h-4 text-pink-300/60" fill="currentColor" />
//           ) : (
//             <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-rose-300/40 to-pink-200/40" />
//           )}
//         </motion.div>
//       ))}

//       {/* Мягкие градиентные сферы */}
//       <motion.div
//         className="absolute top-20 left-10 w-64 h-64 sm:w-96 sm:h-96 rounded-full"
//         style={{
//           background: "radial-gradient(circle, rgba(251,207,232,0.4) 0%, transparent 70%)",
//         }}
//         animate={{
//           scale: [1, 1.2, 1],
//           opacity: [0.5, 0.3, 0.5],
//         }}
//         transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         className="absolute top-1/3 right-0 w-72 h-72 sm:w-[500px] sm:h-[500px] rounded-full -mr-20"
//         style={{
//           background: "radial-gradient(circle, rgba(254,215,170,0.3) 0%, transparent 70%)",
//         }}
//         animate={{
//           scale: [1, 1.15, 1],
//           opacity: [0.4, 0.25, 0.4],
//         }}
//         transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//       />
//       <motion.div
//         className="absolute bottom-1/4 left-1/4 w-80 h-80 sm:w-[600px] sm:h-[600px] rounded-full"
//         style={{
//           background: "radial-gradient(circle, rgba(196,181,253,0.25) 0%, transparent 70%)",
//         }}
//         animate={{
//           scale: [1, 1.1, 1],
//           opacity: [0.3, 0.2, 0.3],
//         }}
//         transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
//       />

//       {/* Тонкий узор */}
//       <div
//         className="absolute inset-0 opacity-[0.015]"
//         style={{
//           backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L30 60M0 30L60 30' stroke='%23000' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
//         }}
//       />
//     </div>
//   );
// }

// // ====== ЛАЙТБОКС ======
// function GalleryLightbox({ images, currentIndex, onClose, onPrev, onNext, serviceName }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void; serviceName: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose, onPrev, onNext]);

//   const currentImage = images[currentIndex];

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl" onClick={onClose}>
//       <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//         <X className="w-6 h-6" />
//       </button>
//       <div className="absolute top-4 left-4 z-50"><p className="text-white/80 text-sm">{currentIndex + 1} / {images.length}</p></div>
//       {images.length > 1 && (
//         <>
//           <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//             <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//           <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//             <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//         </>
//       )}
//       <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
//         className="relative max-w-[95vw] max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src={currentImage.image} alt={currentImage.caption || serviceName} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
//         {currentImage.caption && (
//           <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
//             <p className="text-white text-center text-sm">{currentImage.caption}</p>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА УСЛУГИ ======
// function ServiceDetailModal({ service, categoryName, onClose, onOpenGallery, translations, locale }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void; translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => { window.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
//   }, [onClose]);

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={onClose}>
//       <motion.div
//         initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-gradient-to-b from-white to-rose-50/30 sm:rounded-3xl rounded-t-3xl shadow-2xl"
//         onClick={(e) => e.stopPropagation()}>
//         <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-rose-200" /></div>
//         <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-rose-400 hover:text-rose-500 transition-colors shadow-md">
//           <X className="w-5 h-5" />
//         </button>
//         <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//           <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
//             {service.cover || service.gallery.length > 0 ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100" />
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
//             <div className="absolute top-4 left-4">
//               <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-rose-600 text-xs sm:text-sm font-medium shadow-sm">{categoryName}</span>
//             </div>
//             {service.priceCents && (
//               <div className="absolute bottom-4 right-4">
//                 <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold text-sm sm:text-base shadow-lg font-sans">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>
//           <div className="p-4 sm:p-6 -mt-6 relative">
//             <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4 pr-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//               {service.name}
//             </h2>
//             <div className="flex flex-wrap gap-2 mb-5">
//               <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-stone-600 text-sm">
//                 <Clock className="w-4 h-4 text-rose-400" />{service.durationMin} {translations.minutes}
//               </div>
//               {service.priceCents && (
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-stone-600 text-sm">
//                   <Euro className="w-4 h-4 text-amber-500" />{translations.from} {formatPrice(service.priceCents, locale)}
//                 </div>
//               )}
//             </div>
//             {service.description && (<div className="mb-6"><p className="text-stone-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">{service.description}</p></div>)}
//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-400" />{translations.ourWorks} ({service.gallery.length})
//                 </h3>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/20 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 rounded-xl text-white font-semibold shadow-lg shadow-rose-200 transition-all active:scale-[0.98]">
//                 <Calendar className="w-5 h-5" />{translations.bookNow}
//               </Link>
//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ ======
// function ServiceCard({ service, categoryName, index, onOpenDetail, onOpenGallery, translations, locale }: {
//   service: ServiceChild; categoryName: string; index: number;
//   onOpenDetail: () => void; onOpenGallery: (index: number) => void;
//   translations: Record<string, string>; locale: string;
// }) {
//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay: index * 0.05 }}
//       className="group"
//     >
//       <div onClick={onOpenDetail}
//         className="relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-xl hover:shadow-rose-100/60 transition-all duration-500 active:scale-[0.98] sm:hover:-translate-y-1">
//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
//           {hasImage ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
//           ) : (
//             <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <Flower2 className="w-16 h-16 text-rose-200/50" />
//               </div>
//             </div>
//           )}
//           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
//           {service.priceCents && (
//             <div className="absolute top-3 right-3">
//               <span className="px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-rose-500 text-xs sm:text-sm font-bold shadow-sm">
//                 {translations.from} {formatPrice(service.priceCents, locale)}
//               </span>
//             </div>
//           )}
//           {service.gallery.length > 0 && (
//             <button onClick={(e) => { e.stopPropagation(); onOpenGallery(0); }}
//               className="absolute top-3 left-3 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur flex items-center gap-1.5 text-rose-400 text-xs hover:bg-white transition-colors shadow-sm">
//               <Images className="w-3.5 h-3.5" />{service.gallery.length}
//             </button>
//           )}
//         </div>
//         <div className="p-4 sm:p-5">
//           <h3 className="text-base sm:text-lg font-bold text-stone-800 mb-1.5 line-clamp-2 group-hover:text-rose-500 transition-colors"
//               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//             {service.name}
//           </h3>
//           {service.description && (<p className="text-stone-500 text-xs sm:text-sm line-clamp-2 mb-3">{service.description}</p>)}
//           <div className="flex items-center gap-3 mb-4">
//             <span className="inline-flex items-center gap-1 text-stone-400 text-xs sm:text-sm">
//               <Clock className="w-3.5 h-3.5 text-rose-300" />{service.durationMin} {translations.minutes}
//             </span>
//           </div>
//           <Link href={`/booking?service=${service.id}`} onClick={(e) => e.stopPropagation()}
//             className="flex items-center justify-center gap-2 w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 text-white font-semibold text-sm transition-all active:scale-[0.98] shadow-md shadow-rose-100/50">
//             {translations.bookNow}<ChevronRight className="w-4 h-4" />
//           </Link>
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
//       {/* Подключение шрифта */}
//       <style jsx global>{`
//         @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600&display=swap');
//       `}</style>

//       <main className="min-h-screen relative">
//         <AnimatedBackground />

//         <AnimatePresence>
//           {lightbox?.isOpen && (
//             <GalleryLightbox images={lightbox.images} currentIndex={lightbox.currentIndex} onClose={closeLightbox} onPrev={goToPrev} onNext={goToNext} serviceName={lightbox.serviceName} />
//           )}
//         </AnimatePresence>

//         <AnimatePresence>
//           {selectedService && (
//             <ServiceDetailModal service={selectedService.service} categoryName={selectedService.categoryName}
//               onClose={() => setSelectedService(null)}
//               onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)}
//               translations={translations} locale={locale} />
//           )}
//         </AnimatePresence>

//         {/* Hero */}
//         <section className="relative pt-8 pb-6 sm:pt-16 sm:pb-12">
//           <div className="container mx-auto px-4">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
//               className="text-center max-w-2xl mx-auto">
//               {/* Badge */}
//               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-rose-100 shadow-sm mb-4 sm:mb-6">
//                 <Sparkles className="w-4 h-4 text-rose-400" />
//                 <span className="text-sm font-medium text-rose-500">Premium Beauty Salon</span>
//               </motion.div>

//               {/* Title */}
//               <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5"
//                   style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                 <span className="bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400 bg-clip-text text-transparent">
//                   {translations.title}
//                 </span>
//               </h1>

//               {/* Decorative line */}
//               <div className="flex justify-center items-center gap-3 mb-4">
//                 <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
//                 <Heart className="w-4 h-4 text-rose-300" fill="currentColor" />
//                 <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent" />
//               </div>

//               {/* Subtitle */}
//               <p className="text-sm sm:text-base md:text-lg text-stone-500 mb-6 sm:mb-8 px-4"
//                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>
//                 {translations.subtitle}
//               </p>

//               {/* CTA */}
//               <Link href="/booking"
//                 className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 rounded-full text-white font-semibold text-sm sm:text-base shadow-lg shadow-rose-200/50 transition-all active:scale-95 hover:scale-105">
//                 {translations.bookNow}
//                 <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//               </Link>
//             </motion.div>
//           </div>
//         </section>

//         {/* Category Filter */}
//         <section className="sticky top-16 z-40 bg-white/60 backdrop-blur-xl border-y border-rose-100/30">
//           <div className="container mx-auto px-4">
//             <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
//               <button onClick={() => setActiveCategory(null)}
//                 className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
//                   activeCategory === null
//                     ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-100/50"
//                     : "bg-white/80 text-stone-500 hover:bg-white hover:text-rose-500 border border-rose-100/50"
//                 }`}>
//                 {translations.allCategories}
//               </button>
//               {categories.map((cat) => {
//                 const Icon = getCategoryIcon(cat.slug);
//                 return (
//                   <button key={cat.id} onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
//                     className={`flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
//                       activeCategory === cat.id
//                         ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-100/50"
//                         : "bg-white/80 text-stone-500 hover:bg-white hover:text-rose-500 border border-rose-100/50"
//                     }`}>
//                     <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                     <span className="whitespace-nowrap">{cat.name}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         </section>

//         {/* Services */}
//         <section className="py-8 sm:py-12 lg:py-16 relative">
//           <div className="container mx-auto px-4">
//             {filteredCategories.map((category, catIndex) => (
//               <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: catIndex * 0.1 }} className="mb-12 sm:mb-16 last:mb-0">
//                 {/* Category Header */}
//                 <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
//                   <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-100/80 to-pink-50/80 border border-rose-100/50 shadow-sm backdrop-blur">
//                     {(() => { const Icon = getCategoryIcon(category.slug); return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />; })()}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-800 truncate"
//                         style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                       {category.name}
//                     </h2>
//                     <span className="text-xs sm:text-sm text-stone-400">{category.children.length} {translations.services}</span>
//                   </div>
//                 </div>

//                 {/* Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//                   {category.children.map((service, index) => (
//                     <ServiceCard key={service.id} service={service} categoryName={category.name} index={index}
//                       onOpenDetail={() => openServiceDetail(service, category.name)}
//                       onOpenGallery={(idx) => openLightbox(service.gallery, idx, service.name)}
//                       translations={translations} locale={locale} />
//                   ))}
//                 </div>
//               </motion.div>
//             ))}

//             {categories.length === 0 && (
//               <div className="text-center py-16 sm:py-20">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
//                   <Flower2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-300" />
//                 </div>
//                 <p className="text-lg sm:text-xl text-stone-400">{translations.noServices}</p>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* Bottom CTA */}
//         <section className="py-12 sm:py-20 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-r from-rose-100/40 via-white/60 to-amber-50/40" />
//           <div className="relative container mx-auto px-4 text-center">
//             <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
//               <div className="flex justify-center mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-px bg-gradient-to-r from-transparent to-rose-300" />
//                   <Heart className="w-5 h-5 text-rose-400" fill="currentColor" />
//                   <div className="w-10 h-px bg-gradient-to-l from-transparent to-rose-300" />
//                 </div>
//               </div>
//               <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 mb-3 sm:mb-4"
//                   style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
//                 {translations.trustText}
//               </h2>
//               <p className="text-stone-500 mb-6 sm:mb-8 max-w-md mx-auto"
//                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500 }}>
//                 {translations.welcomeText}
//               </p>
//               <Link href="/booking"
//                 className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-rose-200/50 transition-all active:scale-95 hover:scale-105">
//                 {translations.bookNow}<ArrowRight className="w-5 h-5" />
//               </Link>
//             </motion.div>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }

// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
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
//   Flower2
// } from "lucide-react";

// // Типы
// type GalleryItem = {
//   id: string;
//   image: string;
//   caption: string | null;
// };

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

// type Props = {
//   categories: Category[];
//   locale: string;
// };

// // Переводы
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
//   },
// };

// // Иконки для категорий
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

// // Форматирование цены
// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   const euros = cents / 100;
//   return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
//     style: "currency",
//     currency: "EUR",
//     minimumFractionDigits: 0,
//   }).format(euros);
// }

// // Нежные градиенты для карточек
// const cardGradients = [
//   "from-rose-100/80 to-pink-50/80",
//   "from-amber-50/80 to-orange-100/80",
//   "from-violet-100/80 to-purple-50/80",
//   "from-sky-50/80 to-cyan-100/80",
//   "from-emerald-50/80 to-teal-100/80",
// ];

// // Декоративные лепестки
// function FloatingPetals() {
//   return (
//     <div className="absolute inset-0 overflow-hidden pointer-events-none">
//       {[...Array(15)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute"
//           style={{
//             left: `${(i * 7) % 100}%`,
//             top: `${(i * 11) % 100}%`,
//           }}
//           animate={{
//             y: [0, -20, 0],
//             x: [0, 10, 0],
//             rotate: [0, 10, -10, 0],
//             opacity: [0.3, 0.6, 0.3],
//           }}
//           transition={{
//             duration: 6 + (i % 4),
//             repeat: Infinity,
//             delay: i * 0.5,
//             ease: "easeInOut",
//           }}
//         >
//           <div
//             className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
//             style={{
//               background: `radial-gradient(circle, ${
//                 i % 3 === 0 ? 'rgba(251, 207, 232, 0.6)' :
//                 i % 3 === 1 ? 'rgba(254, 215, 170, 0.5)' :
//                 'rgba(221, 214, 254, 0.5)'
//               } 0%, transparent 70%)`,
//             }}
//           />
//         </motion.div>
//       ))}
//     </div>
//   );
// }

// // ====== ЛАЙТБОКС ГАЛЕРЕИ ======
// function GalleryLightbox({
//   images, currentIndex, onClose, onPrev, onNext, serviceName,
// }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void;
//   serviceName: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose, onPrev, onNext]);

//   const currentImage = images[currentIndex];

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
//       onClick={onClose}
//     >
//       <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//         <X className="w-6 h-6" />
//       </button>

//       <div className="absolute top-4 left-4 z-50">
//         <p className="text-white/80 text-sm">{currentIndex + 1} / {images.length}</p>
//       </div>

//       {images.length > 1 && (
//         <>
//           <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//             <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//           <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//             <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//         </>
//       )}

//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="relative max-w-[95vw] max-h-[85vh] mx-4"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src={currentImage.image} alt={currentImage.caption || serviceName} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
//         {currentImage.caption && (
//           <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
//             <p className="text-white text-center text-sm">{currentImage.caption}</p>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА ДЕТАЛЕЙ УСЛУГИ ======
// function ServiceDetailModal({
//   service, categoryName, onClose, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose]);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 100 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-gradient-to-b from-white to-rose-50/50 sm:rounded-3xl rounded-t-3xl shadow-2xl"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Mobile drag indicator */}
//         <div className="sm:hidden flex justify-center pt-3 pb-1">
//           <div className="w-10 h-1 rounded-full bg-rose-200" />
//         </div>

//         <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-rose-400 hover:text-rose-500 transition-colors shadow-md">
//           <X className="w-5 h-5" />
//         </button>

//         <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//           {/* Header Image */}
//           <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
//             {service.cover || service.gallery.length > 0 ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100" />
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

//             {/* Category badge */}
//             <div className="absolute top-4 left-4">
//               <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-rose-600 text-xs sm:text-sm font-medium shadow-sm">
//                 {categoryName}
//               </span>
//             </div>

//             {/* Price badge */}
//             {service.priceCents && (
//               <div className="absolute bottom-4 right-4">
//                 <span className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-400 text-white font-bold text-sm sm:text-base shadow-lg">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           {/* Content */}
//           <div className="p-4 sm:p-6 -mt-6 relative">
//             <h2 className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4 pr-8">
//               {service.name}
//             </h2>

//             {/* Meta chips */}
//             <div className="flex flex-wrap gap-2 mb-5">
//               <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-stone-600 text-sm">
//                 <Clock className="w-4 h-4 text-rose-400" />
//                 {service.durationMin} {translations.minutes}
//               </div>
//               {service.priceCents && (
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-stone-600 text-sm">
//                   <Euro className="w-4 h-4 text-amber-500" />
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </div>
//               )}
//             </div>

//             {/* Description */}
//             {service.description && (
//               <div className="mb-6">
//                 <p className="text-stone-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
//                   {service.description}
//                 </p>
//               </div>
//             )}

//             {/* Gallery */}
//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-rose-400" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/20 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
//                       </div>
//                       {idx === 7 && service.gallery.length > 8 && (
//                         <div className="absolute inset-0 bg-rose-900/60 flex items-center justify-center">
//                           <span className="text-white font-bold">+{service.gallery.length - 8}</span>
//                         </div>
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* CTA */}
//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link
//                 href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 rounded-xl text-white font-semibold shadow-lg shadow-rose-200 transition-all active:scale-[0.98]"
//               >
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>
//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ ======
// function ServiceCard({
//   service, categoryName, index, onOpenDetail, onOpenGallery, translations, locale
// }: {
//   service: ServiceChild; categoryName: string; index: number;
//   onOpenDetail: () => void; onOpenGallery: (index: number) => void;
//   translations: Record<string, string>; locale: string;
// }) {
//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay: index * 0.05 }}
//       className="group"
//     >
//       <div
//         onClick={onOpenDetail}
//         className="
//           relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer
//           bg-white
//           border border-rose-100/50
//           shadow-sm hover:shadow-xl hover:shadow-rose-100/50
//           transition-all duration-500
//           active:scale-[0.98] sm:hover:-translate-y-1
//         "
//       >
//         {/* Image */}
//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
//           {hasImage ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
//           ) : (
//             <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}>
//               <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(244, 114, 182, 0.3) 1px, transparent 0)", backgroundSize: "20px 20px" }} />
//             </div>
//           )}

//           <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />

//           {/* Price */}
//           {service.priceCents && (
//             <div className="absolute top-3 right-3">
//               <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-rose-500 text-xs sm:text-sm font-bold shadow-sm">
//                 {translations.from} {formatPrice(service.priceCents, locale)}
//               </span>
//             </div>
//           )}

//           {/* Gallery count */}
//           {service.gallery.length > 0 && (
//             <button
//               onClick={(e) => { e.stopPropagation(); onOpenGallery(0); }}
//               className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/90 backdrop-blur flex items-center gap-1 text-rose-400 text-xs hover:bg-white transition-colors shadow-sm"
//             >
//               <Images className="w-3 h-3" />
//               {service.gallery.length}
//             </button>
//           )}
//         </div>

//         {/* Content */}
//         <div className="p-4 sm:p-5">
//           <h3 className="text-base sm:text-lg font-bold text-stone-800 mb-1.5 line-clamp-2 group-hover:text-rose-500 transition-colors">
//             {service.name}
//           </h3>

//           {service.description && (
//             <p className="text-stone-500 text-xs sm:text-sm line-clamp-2 mb-3">
//               {service.description}
//             </p>
//           )}

//           {/* Meta */}
//           <div className="flex items-center gap-3 mb-4">
//             <span className="inline-flex items-center gap-1 text-stone-400 text-xs sm:text-sm">
//               <Clock className="w-3.5 h-3.5 text-rose-300" />
//               {service.durationMin} {translations.minutes}
//             </span>
//           </div>

//           {/* CTA */}
//           <Link
//             href={`/booking?service=${service.id}`}
//             onClick={(e) => e.stopPropagation()}
//             className="
//               flex items-center justify-center gap-2 w-full
//               px-4 py-2.5 sm:py-3 rounded-xl
//               bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400
//               hover:from-rose-500 hover:via-pink-500 hover:to-rose-500
//               text-white font-semibold text-sm
//               transition-all active:scale-[0.98]
//               shadow-md shadow-rose-100
//             "
//           >
//             {translations.bookNow}
//             <ChevronRight className="w-4 h-4" />
//           </Link>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ====== MAIN COMPONENT ======
// export default function ServicesClient({ categories, locale }: Props) {
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [selectedService, setSelectedService] = useState<{ service: ServiceChild; categoryName: string } | null>(null);
//   const [lightbox, setLightbox] = useState<{ isOpen: boolean; images: GalleryItem[]; currentIndex: number; serviceName: string } | null>(null);

//   const translations = t[locale] || t.de;

//   const openServiceDetail = useCallback((service: ServiceChild, categoryName: string) => {
//     setSelectedService({ service, categoryName });
//   }, []);

//   const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => {
//     setLightbox({ isOpen: true, images, currentIndex: index, serviceName });
//   }, []);

//   const closeLightbox = useCallback(() => setLightbox(null), []);

//   const goToPrev = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({ ...lightbox, currentIndex: lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1 });
//   }, [lightbox]);

//   const goToNext = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length });
//   }, [lightbox]);

//   const filteredCategories = categories.filter((cat) => !activeCategory || cat.id === activeCategory);

//   return (
//     <main className="min-h-screen relative overflow-hidden">
//       {/* Нежный градиентный фон */}
//       <div className="fixed inset-0 -z-10">
//         {/* Основной градиент */}
//         <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-white to-amber-50/30" />

//         {/* Декоративные круги */}
//         <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-rose-100/40 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
//         <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-pink-100/30 to-transparent rounded-full blur-3xl translate-x-1/2" />
//         <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-to-t from-amber-100/30 to-transparent rounded-full blur-3xl" />
//         <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-violet-100/20 to-transparent rounded-full blur-3xl" />

//         {/* Тонкий узор */}
//         <div
//           className="absolute inset-0 opacity-[0.03]"
//           style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//           }}
//         />
//       </div>

//       {/* Плавающие лепестки */}
//       <FloatingPetals />

//       {/* Lightbox */}
//       <AnimatePresence>
//         {lightbox?.isOpen && (
//           <GalleryLightbox images={lightbox.images} currentIndex={lightbox.currentIndex} onClose={closeLightbox} onPrev={goToPrev} onNext={goToNext} serviceName={lightbox.serviceName} />
//         )}
//       </AnimatePresence>

//       {/* Detail Modal */}
//       <AnimatePresence>
//         {selectedService && (
//           <ServiceDetailModal
//             service={selectedService.service}
//             categoryName={selectedService.categoryName}
//             onClose={() => setSelectedService(null)}
//             onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)}
//             translations={translations}
//             locale={locale}
//           />
//         )}
//       </AnimatePresence>

//       {/* Hero */}
//       <section className="relative pt-8 pb-6 sm:pt-16 sm:pb-12">
//         <div className="container mx-auto px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="text-center max-w-2xl mx-auto"
//           >
//             {/* Badge */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.1 }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-rose-100 shadow-sm mb-4 sm:mb-6"
//             >
//               <Sparkles className="w-4 h-4 text-rose-400" />
//               <span className="text-sm font-medium text-rose-500">Premium Beauty Salon</span>
//             </motion.div>

//             {/* Title */}
//             <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
//               <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 bg-clip-text text-transparent">
//                 {translations.title}
//               </span>
//             </h1>

//             {/* Subtitle */}
//             <p className="text-sm sm:text-base md:text-lg text-stone-500 mb-6 sm:mb-8 px-4">
//               {translations.subtitle}
//             </p>

//             {/* CTA */}
//             <Link
//               href="/booking"
//               className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 rounded-full text-white font-semibold text-sm sm:text-base shadow-lg shadow-rose-200 transition-all active:scale-95"
//             >
//               {translations.bookNow}
//               <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//             </Link>
//           </motion.div>
//         </div>
//       </section>

//       {/* Category Filter */}
//       <section className="sticky top-16 z-40 bg-white/70 backdrop-blur-xl border-y border-rose-100/50">
//         <div className="container mx-auto px-4">
//           <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
//             <button
//               onClick={() => setActiveCategory(null)}
//               className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
//                 activeCategory === null
//                   ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-100"
//                   : "bg-white/80 text-stone-500 hover:bg-white hover:text-rose-500 border border-rose-100"
//               }`}
//             >
//               {translations.allCategories}
//             </button>
//             {categories.map((cat) => {
//               const Icon = getCategoryIcon(cat.slug);
//               return (
//                 <button
//                   key={cat.id}
//                   onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
//                   className={`flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
//                     activeCategory === cat.id
//                       ? "bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md shadow-rose-100"
//                       : "bg-white/80 text-stone-500 hover:bg-white hover:text-rose-500 border border-rose-100"
//                   }`}
//                 >
//                   <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                   <span className="whitespace-nowrap">{cat.name}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Services */}
//       <section className="py-8 sm:py-12 lg:py-16 relative">
//         <div className="container mx-auto px-4">
//           {filteredCategories.map((category, catIndex) => (
//             <motion.div
//               key={category.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: catIndex * 0.1 }}
//               className="mb-12 sm:mb-16 last:mb-0"
//             >
//               {/* Category Header */}
//               <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
//                 <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-rose-100 to-pink-50 border border-rose-100 shadow-sm">
//                   {(() => {
//                     const Icon = getCategoryIcon(category.slug);
//                     return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />;
//                   })()}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-800 truncate">
//                     {category.name}
//                   </h2>
//                   <span className="text-xs sm:text-sm text-stone-400">
//                     {category.children.length} {translations.services}
//                   </span>
//                 </div>
//               </div>

//               {/* Services Grid */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//                 {category.children.map((service, index) => (
//                   <ServiceCard
//                     key={service.id}
//                     service={service}
//                     categoryName={category.name}
//                     index={index}
//                     onOpenDetail={() => openServiceDetail(service, category.name)}
//                     onOpenGallery={(idx) => openLightbox(service.gallery, idx, service.name)}
//                     translations={translations}
//                     locale={locale}
//                   />
//                 ))}
//               </div>
//             </motion.div>
//           ))}

//           {/* Empty State */}
//           {categories.length === 0 && (
//             <div className="text-center py-16 sm:py-20">
//               <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
//                 <Flower2 className="w-8 h-8 sm:w-10 sm:h-10 text-rose-300" />
//               </div>
//               <p className="text-lg sm:text-xl text-stone-400">{translations.noServices}</p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Bottom CTA */}
//       <section className="py-12 sm:py-20 relative overflow-hidden">
//         {/* Decorative background */}
//         <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 via-pink-50/50 to-amber-50/50" />
//         <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl" />
//         <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl" />

//         <div className="relative container mx-auto px-4 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             {/* Decorative element */}
//             <div className="flex justify-center mb-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-8 h-px bg-gradient-to-r from-transparent to-rose-300" />
//                 <Heart className="w-5 h-5 text-rose-400" fill="currentColor" />
//                 <div className="w-8 h-px bg-gradient-to-l from-transparent to-rose-300" />
//               </div>
//             </div>

//             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 mb-3 sm:mb-4">
//               {translations.trustText}
//             </h2>

//             <p className="text-stone-500 mb-6 sm:mb-8 max-w-md mx-auto">
//               {locale === "de" ? "Wir freuen uns auf Ihren Besuch" :
//                locale === "ru" ? "Мы ждём вас в нашем салоне" :
//                "We look forward to your visit"}
//             </p>

//             <Link
//               href="/booking"
//               className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 hover:from-rose-500 hover:via-pink-500 hover:to-rose-500 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-rose-200 transition-all active:scale-95"
//             >
//               {translations.bookNow}
//               <ArrowRight className="w-5 h-5" />
//             </Link>
//           </motion.div>
//         </div>
//       </section>
//     </main>
//   );
// }

//----------работает, делаем женский дизайн---
// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
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
//   Calendar
// } from "lucide-react";

// // Типы
// type GalleryItem = {
//   id: string;
//   image: string;
//   caption: string | null;
// };

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

// type Props = {
//   categories: Category[];
//   locale: string;
// };

// // Переводы
// const t: Record<string, Record<string, string>> = {
//   de: {
//     title: "Unsere Leistungen",
//     subtitle: "Entdecken Sie die Welt der Schönheit",
//     bookNow: "Jetzt buchen",
//     from: "ab",
//     minutes: "Min.",
//     noServices: "Keine Dienstleistungen verfügbar",
//     allCategories: "Alle",
//     photos: "Fotos",
//     close: "Schließen",
//     ourWorks: "Unsere Arbeiten",
//     services: "Leistungen",
//   },
//   ru: {
//     title: "Наши услуги",
//     subtitle: "Откройте мир красоты и ухода",
//     bookNow: "Записаться",
//     from: "от",
//     minutes: "мин.",
//     noServices: "Услуги не найдены",
//     allCategories: "Все",
//     photos: "фото",
//     close: "Закрыть",
//     ourWorks: "Наши работы",
//     services: "услуг",
//   },
//   en: {
//     title: "Our Services",
//     subtitle: "Discover the world of beauty",
//     bookNow: "Book Now",
//     from: "from",
//     minutes: "min.",
//     noServices: "No services available",
//     allCategories: "All",
//     photos: "photos",
//     close: "Close",
//     ourWorks: "Our Works",
//     services: "services",
//   },
// };

// // Иконки для категорий
// const categoryIcons: Record<string, typeof Scissors> = {
//   haircut: Scissors, haare: Scissors, hair: Scissors, frisur: Scissors, стрижка: Scissors,
//   manicure: Palette, maniküre: Palette, nails: Palette, nagel: Palette, маникюр: Palette,
//   makeup: Heart, "make-up": Heart, kosmetik: Heart, макияж: Heart,
//   brows: Star, lashes: Star, permanent: Star, брови: Star, ресницы: Star,
//   default: Star,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) => slug.toLowerCase().includes(k));
//   return categoryIcons[key || "default"];
// }

// // Форматирование цены
// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   const euros = cents / 100;
//   return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
//     style: "currency",
//     currency: "EUR",
//     minimumFractionDigits: 0,
//   }).format(euros);
// }

// // Градиенты
// const gradients = [
//   "from-rose-500/30 via-fuchsia-500/30 to-violet-500/30",
//   "from-amber-500/30 via-orange-500/30 to-rose-500/30",
//   "from-emerald-500/30 via-teal-500/30 to-cyan-500/30",
//   "from-blue-500/30 via-indigo-500/30 to-violet-500/30",
//   "from-pink-500/30 via-rose-500/30 to-orange-500/30",
// ];

// // ====== ЛАЙТБОКС ГАЛЕРЕИ ======
// function GalleryLightbox({
//   images, currentIndex, onClose, onPrev, onNext, serviceName,
// }: {
//   images: GalleryItem[]; currentIndex: number;
//   onClose: () => void; onPrev: () => void; onNext: () => void;
//   serviceName: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose, onPrev, onNext]);

//   const currentImage = images[currentIndex];

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
//       onClick={onClose}
//     >
//       {/* Close */}
//       <button onClick={onClose} className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//         <X className="w-6 h-6" />
//       </button>

//       {/* Counter */}
//       <div className="absolute top-4 left-4 z-50">
//         <p className="text-white/80 text-sm">{currentIndex + 1} / {images.length}</p>
//       </div>

//       {/* Navigation */}
//       {images.length > 1 && (
//         <>
//           <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//             <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//           <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white">
//             <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
//           </button>
//         </>
//       )}

//       {/* Image */}
//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="relative max-w-[95vw] max-h-[85vh] mx-4"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img src={currentImage.image} alt={currentImage.caption || serviceName} className="max-w-full max-h-[85vh] object-contain rounded-xl sm:rounded-2xl" />
//         {currentImage.caption && (
//           <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl sm:rounded-b-2xl">
//             <p className="text-white text-center text-sm">{currentImage.caption}</p>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== МОДАЛКА ДЕТАЛЕЙ УСЛУГИ ======
// function ServiceDetailModal({
//   service, categoryName, onClose, onOpenGallery, translations, locale,
// }: {
//   service: ServiceChild; categoryName: string; onClose: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>; locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose]);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 100 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: 100 }}
//         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//         className="relative w-full sm:max-w-lg md:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 sm:rounded-3xl rounded-t-3xl shadow-2xl border-t sm:border border-white/10"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Mobile drag indicator */}
//         <div className="sm:hidden flex justify-center pt-3 pb-1">
//           <div className="w-10 h-1 rounded-full bg-white/20" />
//         </div>

//         {/* Close button */}
//         <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors">
//           <X className="w-5 h-5" />
//         </button>

//         {/* Scrollable content */}
//         <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh]">
//           {/* Header Image */}
//           <div className="relative h-48 sm:h-64 md:h-72 overflow-hidden">
//             {service.cover || service.gallery.length > 0 ? (
//               // eslint-disable-next-line @next/next/no-img-element
//               <img src={service.cover || service.gallery[0]?.image} alt={service.name} className="w-full h-full object-cover" />
//             ) : (
//               <div className="w-full h-full bg-gradient-to-br from-fuchsia-600/40 to-violet-600/40" />
//             )}
//             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

//             {/* Category badge */}
//             <div className="absolute top-4 left-4">
//               <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur text-white text-xs sm:text-sm font-medium">
//                 {categoryName}
//               </span>
//             </div>

//             {/* Price badge */}
//             {service.priceCents && (
//               <div className="absolute bottom-4 right-4">
//                 <span className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold text-sm sm:text-base shadow-lg">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           {/* Content */}
//           <div className="p-4 sm:p-6 -mt-6 relative">
//             <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 pr-8">
//               {service.name}
//             </h2>

//             {/* Meta chips */}
//             <div className="flex flex-wrap gap-2 mb-5">
//               <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-sm">
//                 <Clock className="w-4 h-4 text-fuchsia-400" />
//                 {service.durationMin} {translations.minutes}
//               </div>
//               {service.priceCents && (
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-sm">
//                   <Euro className="w-4 h-4 text-emerald-400" />
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </div>
//               )}
//             </div>

//             {/* Description */}
//             {service.description && (
//               <div className="mb-6">
//                 <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
//                   {service.description}
//                 </p>
//               </div>
//             )}

//             {/* Gallery */}
//             {service.gallery.length > 0 && (
//               <div className="mb-6">
//                 <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
//                   <Images className="w-4 h-4 text-fuchsia-400" />
//                   {translations.ourWorks} ({service.gallery.length})
//                 </h3>
//                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                   {service.gallery.slice(0, 8).map((item, idx) => (
//                     <button key={item.id} onClick={() => onOpenGallery(idx)} className="relative aspect-square rounded-xl overflow-hidden group">
//                       {/* eslint-disable-next-line @next/next/no-img-element */}
//                       <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
//                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
//                         <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
//                       </div>
//                       {idx === 7 && service.gallery.length > 8 && (
//                         <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
//                           <span className="text-white font-bold">+{service.gallery.length - 8}</span>
//                         </div>
//                       )}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* CTA */}
//             <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 sm:pb-4">
//               <Link
//                 href={`/booking?service=${service.id}`}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 rounded-xl text-white font-semibold shadow-lg shadow-fuchsia-500/25 transition-all active:scale-[0.98]"
//               >
//                 <Calendar className="w-5 h-5" />
//                 {translations.bookNow}
//               </Link>
//               <button onClick={onClose} className="sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors">
//                 {translations.close}
//               </button>
//             </div>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // ====== КАРТОЧКА УСЛУГИ ======
// function ServiceCard({
//   service, categoryName, index, onOpenDetail, onOpenGallery, translations, locale
// }: {
//   service: ServiceChild; categoryName: string; index: number;
//   onOpenDetail: () => void; onOpenGallery: (index: number) => void;
//   translations: Record<string, string>; locale: string;
// }) {
//   const hasImage = service.cover || service.gallery.length > 0;
//   const imageUrl = service.cover || service.gallery[0]?.image;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, delay: index * 0.05 }}
//       className="group"
//     >
//       <div
//         onClick={onOpenDetail}
//         className={`
//           relative overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer
//           bg-gradient-to-br ${gradients[index % gradients.length]}
//           border border-white/10 hover:border-fuchsia-500/40
//           transition-all duration-500
//           hover:shadow-xl hover:shadow-fuchsia-500/10
//           active:scale-[0.98] sm:hover:-translate-y-1
//         `}
//       >
//         {/* Image */}
//         <div className="relative h-40 sm:h-48 lg:h-52 overflow-hidden">
//           {hasImage ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img src={imageUrl} alt={service.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
//           ) : (
//             <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
//               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "20px 20px" }} />
//             </div>
//           )}

//           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

//           {/* Price */}
//           {service.priceCents && (
//             <div className="absolute top-3 right-3">
//               <span className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs sm:text-sm font-bold">
//                 {translations.from} {formatPrice(service.priceCents, locale)}
//               </span>
//             </div>
//           )}

//           {/* Gallery count */}
//           {service.gallery.length > 0 && (
//             <button
//               onClick={(e) => { e.stopPropagation(); onOpenGallery(0); }}
//               className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur flex items-center gap-1 text-white text-xs hover:bg-black/70 transition-colors"
//             >
//               <Images className="w-3 h-3" />
//               {service.gallery.length}
//             </button>
//           )}
//         </div>

//         {/* Content */}
//         <div className="p-4 sm:p-5">
//           <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 line-clamp-2 group-hover:text-fuchsia-200 transition-colors">
//             {service.name}
//           </h3>

//           {service.description && (
//             <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 mb-3">
//               {service.description}
//             </p>
//           )}

//           {/* Meta */}
//           <div className="flex items-center gap-3 mb-4">
//             <span className="inline-flex items-center gap-1 text-slate-400 text-xs sm:text-sm">
//               <Clock className="w-3.5 h-3.5" />
//               {service.durationMin} {translations.minutes}
//             </span>
//           </div>

//           {/* CTA */}
//           <Link
//             href={`/booking?service=${service.id}`}
//             onClick={(e) => e.stopPropagation()}
//             className="
//               flex items-center justify-center gap-2 w-full
//               px-4 py-2.5 sm:py-3 rounded-xl
//               bg-gradient-to-r from-fuchsia-600 to-violet-600
//               hover:from-fuchsia-500 hover:to-violet-500
//               text-white font-semibold text-sm
//               transition-all active:scale-[0.98]
//               shadow-lg shadow-fuchsia-500/20
//             "
//           >
//             {translations.bookNow}
//             <ChevronRight className="w-4 h-4" />
//           </Link>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ====== MAIN COMPONENT ======
// export default function ServicesClient({ categories, locale }: Props) {
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [selectedService, setSelectedService] = useState<{ service: ServiceChild; categoryName: string } | null>(null);
//   const [lightbox, setLightbox] = useState<{ isOpen: boolean; images: GalleryItem[]; currentIndex: number; serviceName: string } | null>(null);

//   const translations = t[locale] || t.de;

//   const openServiceDetail = useCallback((service: ServiceChild, categoryName: string) => {
//     setSelectedService({ service, categoryName });
//   }, []);

//   const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => {
//     setLightbox({ isOpen: true, images, currentIndex: index, serviceName });
//   }, []);

//   const closeLightbox = useCallback(() => setLightbox(null), []);

//   const goToPrev = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({ ...lightbox, currentIndex: lightbox.currentIndex === 0 ? lightbox.images.length - 1 : lightbox.currentIndex - 1 });
//   }, [lightbox]);

//   const goToNext = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length });
//   }, [lightbox]);

//   const filteredCategories = categories.filter((cat) => !activeCategory || cat.id === activeCategory);

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
//       {/* Lightbox */}
//       <AnimatePresence>
//         {lightbox?.isOpen && (
//           <GalleryLightbox images={lightbox.images} currentIndex={lightbox.currentIndex} onClose={closeLightbox} onPrev={goToPrev} onNext={goToNext} serviceName={lightbox.serviceName} />
//         )}
//       </AnimatePresence>

//       {/* Detail Modal */}
//       <AnimatePresence>
//         {selectedService && (
//           <ServiceDetailModal
//             service={selectedService.service}
//             categoryName={selectedService.categoryName}
//             onClose={() => setSelectedService(null)}
//             onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)}
//             translations={translations}
//             locale={locale}
//           />
//         )}
//       </AnimatePresence>

//       {/* Hero */}
//       <section className="relative overflow-hidden pt-8 pb-6 sm:pt-16 sm:pb-12">
//         {/* Background */}
//         <div className="absolute inset-0 pointer-events-none">
//           <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
//           <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-violet-500/10 rounded-full blur-3xl" />
//         </div>

//         <div className="relative container mx-auto px-4">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="text-center max-w-2xl mx-auto"
//           >
//             {/* Badge */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.1 }}
//               className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 mb-4 sm:mb-6"
//             >
//               <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fuchsia-400" />
//               <span className="text-xs sm:text-sm font-medium text-fuchsia-300">Premium Beauty</span>
//             </motion.div>

//             {/* Title */}
//             <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
//               <span className="bg-gradient-to-r from-white via-fuchsia-100 to-violet-200 bg-clip-text text-transparent">
//                 {translations.title}
//               </span>
//             </h1>

//             {/* Subtitle */}
//             <p className="text-sm sm:text-base md:text-lg text-slate-400 mb-6 sm:mb-8 px-4">
//               {translations.subtitle}
//             </p>

//             {/* CTA */}
//             <Link
//               href="/booking"
//               className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 rounded-full text-white font-semibold text-sm sm:text-base shadow-lg shadow-fuchsia-500/25 transition-all active:scale-95"
//             >
//               {translations.bookNow}
//               <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//             </Link>
//           </motion.div>
//         </div>
//       </section>

//       {/* Category Filter */}
//       <section className="sticky top-16 z-40 bg-slate-950/90 backdrop-blur-xl border-y border-white/5">
//         <div className="container mx-auto px-4">
//           <div className="flex gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
//             <button
//               onClick={() => setActiveCategory(null)}
//               className={`flex-shrink-0 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
//                 activeCategory === null
//                   ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg"
//                   : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
//               }`}
//             >
//               {translations.allCategories}
//             </button>
//             {categories.map((cat) => {
//               const Icon = getCategoryIcon(cat.slug);
//               return (
//                 <button
//                   key={cat.id}
//                   onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
//                   className={`flex-shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
//                     activeCategory === cat.id
//                       ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg"
//                       : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
//                   }`}
//                 >
//                   <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                   <span className="whitespace-nowrap">{cat.name}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Services */}
//       <section className="py-8 sm:py-12 lg:py-16">
//         <div className="container mx-auto px-4">
//           {filteredCategories.map((category, catIndex) => (
//             <motion.div
//               key={category.id}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: catIndex * 0.1 }}
//               className="mb-12 sm:mb-16 last:mb-0"
//             >
//               {/* Category Header */}
//               <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
//                 <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/20">
//                   {(() => {
//                     const Icon = getCategoryIcon(category.slug);
//                     return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-fuchsia-400" />;
//                   })()}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">
//                     {category.name}
//                   </h2>
//                   <span className="text-xs sm:text-sm text-slate-500">
//                     {category.children.length} {translations.services}
//                   </span>
//                 </div>
//               </div>

//               {/* Services Grid */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//                 {category.children.map((service, index) => (
//                   <ServiceCard
//                     key={service.id}
//                     service={service}
//                     categoryName={category.name}
//                     index={index}
//                     onOpenDetail={() => openServiceDetail(service, category.name)}
//                     onOpenGallery={(idx) => openLightbox(service.gallery, idx, service.name)}
//                     translations={translations}
//                     locale={locale}
//                   />
//                 ))}
//               </div>
//             </motion.div>
//           ))}

//           {/* Empty State */}
//           {categories.length === 0 && (
//             <div className="text-center py-16 sm:py-20">
//               <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
//                 <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
//               </div>
//               <p className="text-lg sm:text-xl text-slate-500">{translations.noServices}</p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Bottom CTA */}
//       <section className="py-12 sm:py-20 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/10 via-violet-600/10 to-fuchsia-600/10" />

//         <div className="relative container mx-auto px-4 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//           >
//             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
//               {locale === "de" ? "Bereit für Ihre Verwandlung?" :
//                locale === "ru" ? "Готовы к преображению?" :
//                "Ready for Your Transformation?"}
//             </h2>
//             <Link
//               href="/booking"
//               className="inline-flex items-center gap-2 px-8 py-4 sm:px-10 sm:py-5 bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold text-base sm:text-lg shadow-xl transition-all active:scale-95"
//             >
//               {translations.bookNow}
//               <ArrowRight className="w-5 h-5" />
//             </Link>
//           </motion.div>
//         </div>
//       </section>
//     </main>
//   );
// }

//--------обновляем дизайн----
// // src/app/services/ServicesClient.tsx
// "use client";

// import { useState, useEffect, useCallback } from "react";
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
//   Info,
//   Calendar
// } from "lucide-react";

// // Типы
// type GalleryItem = {
//   id: string;
//   image: string;
//   caption: string | null;
// };

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

// type Props = {
//   categories: Category[];
//   locale: string;
// };

// // Переводы
// const t: Record<string, Record<string, string>> = {
//   de: {
//     title: "Unsere Leistungen",
//     subtitle: "Entdecken Sie die Welt der Schönheit und Entspannung",
//     bookNow: "Jetzt buchen",
//     from: "ab",
//     minutes: "Min.",
//     viewAll: "Alle anzeigen",
//     noServices: "Keine Dienstleistungen verfügbar",
//     exploreCategory: "Kategorie erkunden",
//     popularServices: "Beliebte Dienstleistungen",
//     allCategories: "Alle Kategorien",
//     gallery: "Galerie",
//     viewGallery: "Galerie ansehen",
//     photos: "Fotos",
//     close: "Schließen",
//     moreInfo: "Mehr erfahren",
//     duration: "Dauer",
//     price: "Preis",
//     description: "Beschreibung",
//     ourWorks: "Unsere Arbeiten",
//     services: "Leistungen",
//   },
//   ru: {
//     title: "Наши услуги",
//     subtitle: "Откройте для себя мир красоты и релаксации",
//     bookNow: "Записаться",
//     from: "от",
//     minutes: "мин.",
//     viewAll: "Смотреть все",
//     noServices: "Услуги не найдены",
//     exploreCategory: "Подробнее",
//     popularServices: "Популярные услуги",
//     allCategories: "Все категории",
//     gallery: "Галерея",
//     viewGallery: "Смотреть галерею",
//     photos: "фото",
//     close: "Закрыть",
//     moreInfo: "Подробнее",
//     duration: "Длительность",
//     price: "Цена",
//     description: "Описание",
//     ourWorks: "Наши работы",
//     services: "услуг",
//   },
//   en: {
//     title: "Our Services",
//     subtitle: "Discover the world of beauty and relaxation",
//     bookNow: "Book Now",
//     from: "from",
//     minutes: "min.",
//     viewAll: "View all",
//     noServices: "No services available",
//     exploreCategory: "Explore",
//     popularServices: "Popular Services",
//     allCategories: "All Categories",
//     gallery: "Gallery",
//     viewGallery: "View Gallery",
//     photos: "photos",
//     close: "Close",
//     moreInfo: "Learn more",
//     duration: "Duration",
//     price: "Price",
//     description: "Description",
//     ourWorks: "Our Works",
//     services: "services",
//   },
// };

// // Иконки для категорий
// const categoryIcons: Record<string, typeof Scissors> = {
//   haircut: Scissors,
//   haare: Scissors,
//   hair: Scissors,
//   frisur: Scissors,
//   стрижка: Scissors,
//   manicure: Palette,
//   maniküre: Palette,
//   nails: Palette,
//   nagel: Palette,
//   маникюр: Palette,
//   makeup: Heart,
//   "make-up": Heart,
//   kosmetik: Heart,
//   макияж: Heart,
//   brows: Star,
//   lashes: Star,
//   permanent: Star,
//   default: Star,
// };

// function getCategoryIcon(slug: string) {
//   const key = Object.keys(categoryIcons).find((k) =>
//     slug.toLowerCase().includes(k)
//   );
//   return categoryIcons[key || "default"];
// }

// // Форматирование цены
// function formatPrice(cents: number | null, locale: string) {
//   if (!cents) return null;
//   const euros = cents / 100;
//   return new Intl.NumberFormat(locale === "de" ? "de-DE" : locale === "ru" ? "ru-RU" : "en-US", {
//     style: "currency",
//     currency: "EUR",
//     minimumFractionDigits: 0,
//   }).format(euros);
// }

// // Градиенты для карточек
// const gradients = [
//   "from-rose-500/30 via-fuchsia-500/30 to-violet-500/30",
//   "from-amber-500/30 via-orange-500/30 to-rose-500/30",
//   "from-emerald-500/30 via-teal-500/30 to-cyan-500/30",
//   "from-blue-500/30 via-indigo-500/30 to-violet-500/30",
//   "from-pink-500/30 via-rose-500/30 to-orange-500/30",
// ];

// // Компонент лайтбокса для галереи
// function GalleryLightbox({
//   images,
//   currentIndex,
//   onClose,
//   onPrev,
//   onNext,
//   serviceName,
// }: {
//   images: GalleryItem[];
//   currentIndex: number;
//   onClose: () => void;
//   onPrev: () => void;
//   onNext: () => void;
//   serviceName: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onPrev();
//       if (e.key === "ArrowRight") onNext();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [onClose, onPrev, onNext]);

//   const currentImage = images[currentIndex];

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl"
//       onClick={onClose}
//     >
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//       >
//         <X className="w-6 h-6" />
//       </button>

//       <div className="absolute top-4 left-4 z-50">
//         <h3 className="text-white font-semibold text-lg">{serviceName}</h3>
//         <p className="text-white/60 text-sm">{currentIndex + 1} / {images.length}</p>
//       </div>

//       {images.length > 1 && (
//         <>
//           <button
//             onClick={(e) => { e.stopPropagation(); onPrev(); }}
//             className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//           >
//             <ChevronLeft className="w-8 h-8" />
//           </button>
//           <button
//             onClick={(e) => { e.stopPropagation(); onNext(); }}
//             className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//           >
//             <ChevronRight className="w-8 h-8" />
//           </button>
//         </>
//       )}

//       <motion.div
//         key={currentIndex}
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         transition={{ duration: 0.3 }}
//         className="relative max-w-5xl max-h-[80vh] mx-4"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={currentImage.image}
//           alt={currentImage.caption || serviceName}
//           className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
//         />
//         {currentImage.caption && (
//           <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
//             <p className="text-white text-center">{currentImage.caption}</p>
//           </div>
//         )}
//       </motion.div>

//       {images.length > 1 && (
//         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur">
//           {images.map((img, idx) => (
//             <div
//               key={img.id}
//               className={`
//                 relative w-12 h-12 rounded-lg overflow-hidden transition-all
//                 ${idx === currentIndex ? "ring-2 ring-fuchsia-500 scale-110" : "opacity-60"}
//               `}
//             >
//               {/* eslint-disable-next-line @next/next/no-img-element */}
//               <img src={img.image} alt="" className="w-full h-full object-cover" />
//             </div>
//           ))}
//         </div>
//       )}
//     </motion.div>
//   );
// }

// // Модальное окно с деталями услуги
// function ServiceDetailModal({
//   service,
//   categoryName,
//   onClose,
//   onOpenGallery,
//   translations,
//   locale,
// }: {
//   service: ServiceChild;
//   categoryName: string;
//   onClose: () => void;
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
//   locale: string;
// }) {
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [onClose]);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95, y: 20 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.95, y: 20 }}
//         transition={{ duration: 0.3 }}
//         className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/10"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Close button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//         >
//           <X className="w-5 h-5" />
//         </button>

//         {/* Header Image */}
//         <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-3xl">
//           {service.cover || service.gallery.length > 0 ? (
//             // eslint-disable-next-line @next/next/no-img-element
//             <img
//               src={service.cover || service.gallery[0]?.image}
//               alt={service.name}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30">
//               <div className="absolute inset-0" style={{
//                 backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
//                 backgroundSize: "24px 24px"
//               }} />
//             </div>
//           )}
//           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

//           {/* Category badge */}
//           <div className="absolute top-4 left-4">
//             <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm">
//               {categoryName}
//             </span>
//           </div>

//           {/* Price badge */}
//           {service.priceCents && (
//             <div className="absolute top-4 right-16">
//               <span className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-bold">
//                 {translations.from} {formatPrice(service.priceCents, locale)}
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Content */}
//         <div className="p-6 sm:p-8 -mt-16 relative">
//           <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
//             {service.name}
//           </h2>

//           {/* Meta info */}
//           <div className="flex flex-wrap items-center gap-4 mb-6">
//             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
//               <Clock className="w-5 h-5 text-fuchsia-400" />
//               <span className="text-white">
//                 {service.durationMin} {translations.minutes}
//               </span>
//             </div>
//             {service.priceCents && (
//               <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
//                 <Euro className="w-5 h-5 text-emerald-400" />
//                 <span className="text-white">
//                   {translations.from} {formatPrice(service.priceCents, locale)}
//                 </span>
//               </div>
//             )}
//           </div>

//           {/* Description */}
//           {service.description && (
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
//                 <Info className="w-5 h-5 text-fuchsia-400" />
//                 {translations.description}
//               </h3>
//               <p className="text-slate-300 leading-relaxed whitespace-pre-line">
//                 {service.description}
//               </p>
//             </div>
//           )}

//           {/* Gallery */}
//           {service.gallery.length > 0 && (
//             <div className="mb-8">
//               <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
//                 <Images className="w-5 h-5 text-fuchsia-400" />
//                 {translations.ourWorks} ({service.gallery.length} {translations.photos})
//               </h3>
//               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
//                 {service.gallery.map((item, idx) => (
//                   <button
//                     key={item.id}
//                     onClick={() => onOpenGallery(idx)}
//                     className="relative aspect-square rounded-xl overflow-hidden group"
//                   >
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img
//                       src={item.image}
//                       alt={item.caption || ""}
//                       className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
//                     />
//                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
//                       <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* CTA */}
//           <div className="flex flex-col sm:flex-row gap-4">
//             <Link
//               href={`/booking?service=${service.id}`}
//               className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 rounded-xl text-white font-semibold text-lg shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all"
//             >
//               <Calendar className="w-5 h-5" />
//               {translations.bookNow}
//             </Link>
//             <button
//               onClick={onClose}
//               className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
//             >
//               {translations.close}
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// // Компонент мини-галереи в карточке услуги
// function ServiceGalleryPreview({
//   gallery,
//   onOpenGallery,
//   translations
// }: {
//   gallery: GalleryItem[];
//   onOpenGallery: (index: number) => void;
//   translations: Record<string, string>;
// }) {
//   if (gallery.length === 0) return null;

//   return (
//     <div className="mt-4">
//       <div className="flex items-center gap-2 mb-2">
//         <Images className="w-4 h-4 text-fuchsia-400" />
//         <span className="text-xs text-slate-400">
//           {gallery.length} {translations.photos}
//         </span>
//       </div>
//       <div className="flex gap-1.5">
//         {gallery.slice(0, 4).map((item, idx) => (
//           <button
//             key={item.id}
//             onClick={(e) => {
//               e.stopPropagation();
//               onOpenGallery(idx);
//             }}
//             className="relative group/thumb flex-1 aspect-square rounded-lg overflow-hidden"
//           >
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src={item.image}
//               alt={item.caption || ""}
//               className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
//             />
//             <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
//               <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
//             </div>
//             {idx === 3 && gallery.length > 4 && (
//               <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
//                 <span className="text-white font-semibold">+{gallery.length - 4}</span>
//               </div>
//             )}
//           </button>
//         ))}
//       </div>
//     </div>
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

//   // Открыть модалку услуги
//   const openServiceDetail = useCallback((service: ServiceChild, categoryName: string) => {
//     setSelectedService({ service, categoryName });
//   }, []);

//   // Открыть лайтбокс
//   const openLightbox = useCallback((images: GalleryItem[], index: number, serviceName: string) => {
//     setLightbox({ isOpen: true, images, currentIndex: index, serviceName });
//   }, []);

//   // Закрыть лайтбокс
//   const closeLightbox = useCallback(() => {
//     setLightbox(null);
//   }, []);

//   // Навигация в лайтбоксе
//   const goToPrev = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({
//       ...lightbox,
//       currentIndex: lightbox.currentIndex === 0
//         ? lightbox.images.length - 1
//         : lightbox.currentIndex - 1
//     });
//   }, [lightbox]);

//   const goToNext = useCallback(() => {
//     if (!lightbox) return;
//     setLightbox({
//       ...lightbox,
//       currentIndex: (lightbox.currentIndex + 1) % lightbox.images.length
//     });
//   }, [lightbox]);

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
//       {/* Лайтбокс */}
//       <AnimatePresence>
//         {lightbox?.isOpen && (
//           <GalleryLightbox
//             images={lightbox.images}
//             currentIndex={lightbox.currentIndex}
//             onClose={closeLightbox}
//             onPrev={goToPrev}
//             onNext={goToNext}
//             serviceName={lightbox.serviceName}
//           />
//         )}
//       </AnimatePresence>

//       {/* Модалка деталей услуги */}
//       <AnimatePresence>
//         {selectedService && (
//           <ServiceDetailModal
//             service={selectedService.service}
//             categoryName={selectedService.categoryName}
//             onClose={() => setSelectedService(null)}
//             onOpenGallery={(index) => openLightbox(selectedService.service.gallery, index, selectedService.service.name)}
//             translations={translations}
//             locale={locale}
//           />
//         )}
//       </AnimatePresence>

//       {/* Hero Section */}
//       <section className="relative overflow-hidden">
//         {/* Background Effects */}
//         <div className="absolute inset-0">
//           <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" />
//           <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-rose-500/5 via-fuchsia-500/5 to-violet-500/5 rounded-full blur-3xl" />
//         </div>

//         {/* Decorative dots pattern */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
//           <div className="absolute inset-0" style={{
//             backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
//             backgroundSize: "40px 40px"
//           }} />
//         </div>

//         <div className="relative container mx-auto px-4 pt-20 pb-16">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, ease: "easeOut" }}
//             className="text-center max-w-4xl mx-auto"
//           >
//             {/* Badge */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.2 }}
//               className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border border-fuchsia-500/20 mb-6"
//             >
//               <Sparkles className="w-4 h-4 text-fuchsia-400" />
//               <span className="text-sm font-medium text-fuchsia-300">
//                 Premium Beauty Services
//               </span>
//             </motion.div>

//             {/* Title */}
//             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
//               <span className="bg-gradient-to-r from-white via-fuchsia-100 to-violet-200 bg-clip-text text-transparent">
//                 {translations.title}
//               </span>
//             </h1>

//             {/* Subtitle */}
//             <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
//               {translations.subtitle}
//             </p>

//             {/* CTA Button */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//             >
//               <Link
//                 href="/booking"
//                 className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 rounded-full text-white font-semibold text-lg shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 transition-all duration-300 hover:scale-105"
//               >
//                 {translations.bookNow}
//                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               </Link>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Categories Navigation */}
//       <section className="sticky top-16 z-40 bg-slate-950/80 backdrop-blur-xl border-y border-white/5">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
//             <button
//               onClick={() => setActiveCategory(null)}
//               className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
//                 activeCategory === null
//                   ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/25"
//                   : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
//               }`}
//             >
//               {translations.allCategories}
//             </button>
//             {categories.map((cat) => {
//               const Icon = getCategoryIcon(cat.slug);
//               return (
//                 <button
//                   key={cat.id}
//                   onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
//                   className={`flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
//                     activeCategory === cat.id
//                       ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-lg shadow-fuchsia-500/25"
//                       : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
//                   }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   {cat.name}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Services Grid */}
//       <section className="py-16">
//         <div className="container mx-auto px-4">
//           {categories
//             .filter((cat) => !activeCategory || cat.id === activeCategory)
//             .map((category, catIndex) => (
//               <motion.div
//                 key={category.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: catIndex * 0.1 }}
//                 className="mb-20 last:mb-0"
//               >
//                 {/* Category Header */}
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
//                   <div className="flex items-center gap-4">
//                     <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/20 shadow-lg shadow-fuchsia-500/10">
//                       {(() => {
//                         const Icon = getCategoryIcon(category.slug);
//                         return <Icon className="w-8 h-8 text-fuchsia-400" />;
//                       })()}
//                     </div>
//                     <div>
//                       <h2 className="text-3xl sm:text-4xl font-bold text-white">
//                         {category.name}
//                       </h2>
//                       {category.description && (
//                         <p className="text-slate-400 mt-2 max-w-xl">{category.description}</p>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     {category.gallery.length > 0 && (
//                       <button
//                         onClick={() => openLightbox(category.gallery, 0, category.name)}
//                         className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-sm"
//                       >
//                         <Images className="w-4 h-4" />
//                         {translations.viewGallery}
//                       </button>
//                     )}
//                     <span className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-full">
//                       {category.children.length} {translations.services}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Services Grid */}
//                 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                   {category.children.map((service, index) => (
//                     <motion.div
//                       key={service.id}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.5, delay: index * 0.05 }}
//                       className="group relative cursor-pointer"
//                       onClick={() => openServiceDetail(service, category.name)}
//                     >
//                       <div className={`
//                         relative overflow-hidden rounded-3xl
//                         bg-gradient-to-br ${gradients[index % gradients.length]}
//                         border border-white/10 hover:border-fuchsia-500/30
//                         transition-all duration-500
//                         hover:shadow-2xl hover:shadow-fuchsia-500/10
//                         hover:-translate-y-2
//                       `}>
//                         {/* Cover Image or Gradient */}
//                         <div className="relative h-52 overflow-hidden">
//                           {service.cover || service.gallery.length > 0 ? (
//                             // eslint-disable-next-line @next/next/no-img-element
//                             <img
//                               src={service.cover || service.gallery[0]?.image}
//                               alt={service.name}
//                               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                             />
//                           ) : (
//                             <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
//                               <div className="absolute inset-0 opacity-30">
//                                 <div className="absolute inset-0" style={{
//                                   backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)",
//                                   backgroundSize: "24px 24px"
//                                 }} />
//                               </div>
//                             </div>
//                           )}

//                           {/* Overlay */}
//                           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

//                           {/* Price Badge */}
//                           {service.priceCents && (
//                             <div className="absolute top-4 right-4">
//                               <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
//                                 <span className="text-sm font-bold text-white">
//                                   {translations.from} {formatPrice(service.priceCents, locale)}
//                                 </span>
//                               </div>
//                             </div>
//                           )}

//                           {/* Gallery indicator */}
//                           {service.gallery.length > 0 && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 openLightbox(service.gallery, 0, service.name);
//                               }}
//                               className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-white text-xs hover:bg-black/60 transition-colors"
//                             >
//                               <Images className="w-3.5 h-3.5" />
//                               {service.gallery.length}
//                             </button>
//                           )}

//                           {/* More info hint */}
//                           <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
//                             <div className="px-3 py-1.5 rounded-full bg-fuchsia-500/80 backdrop-blur text-white text-xs font-medium flex items-center gap-1">
//                               <Info className="w-3 h-3" />
//                               {translations.moreInfo}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Content */}
//                         <div className="relative p-6 -mt-6">
//                           <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-200 transition-colors">
//                             {service.name}
//                           </h3>

//                           {service.description && (
//                             <p className="text-slate-400 text-sm line-clamp-2 mb-4">
//                               {service.description}
//                             </p>
//                           )}

//                           {/* Meta Info */}
//                           <div className="flex items-center gap-4 mb-4">
//                             <div className="flex items-center gap-1.5 text-slate-400">
//                               <Clock className="w-4 h-4" />
//                               <span className="text-sm">{service.durationMin} {translations.minutes}</span>
//                             </div>
//                           </div>

//                           {/* Gallery Preview */}
//                           {service.gallery.length > 0 && (
//                             <ServiceGalleryPreview
//                               gallery={service.gallery}
//                               onOpenGallery={(index) => openLightbox(service.gallery, index, service.name)}
//                               translations={translations}
//                             />
//                           )}

//                           {/* CTA Button */}
//                           <Link
//                             href={`/booking?service=${service.id}`}
//                             onClick={(e) => e.stopPropagation()}
//                             className="
//                               inline-flex items-center gap-2 w-full justify-center
//                               px-5 py-3.5 rounded-xl mt-4
//                               bg-gradient-to-r from-fuchsia-600 to-violet-600
//                               hover:from-fuchsia-500 hover:to-violet-500
//                               text-white font-semibold text-sm
//                               transition-all duration-300
//                               shadow-lg shadow-fuchsia-500/20
//                               hover:shadow-fuchsia-500/40
//                               hover:scale-[1.02]
//                             "
//                           >
//                             {translations.bookNow}
//                             <ChevronRight className="w-4 h-4" />
//                           </Link>
//                         </div>

//                         {/* Hover Glow Effect */}
//                         <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-fuchsia-500/5 to-violet-500/5" />
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               </motion.div>
//             ))}

//           {/* Empty State */}
//           {categories.length === 0 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-center py-20"
//             >
//               <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
//                 <Sparkles className="w-12 h-12 text-slate-500" />
//               </div>
//               <p className="text-2xl text-slate-400 font-medium">{translations.noServices}</p>
//             </motion.div>
//           )}
//         </div>
//       </section>

//       {/* Bottom CTA */}
//       <section className="py-24 relative overflow-hidden">
//         <div className="absolute inset-0">
//           <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 via-violet-600/20 to-fuchsia-600/20" />
//           <div className="absolute inset-0 opacity-30">
//             <div className="absolute inset-0" style={{
//               backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
//               backgroundSize: "32px 32px"
//             }} />
//           </div>
//         </div>

//         <div className="relative container mx-auto px-4 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6 }}
//           >
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
//               <Sparkles className="w-4 h-4 text-fuchsia-300" />
//               <span className="text-sm font-medium text-white/80">
//                 {locale === "de" ? "Jetzt verfügbar" : locale === "ru" ? "Доступно сейчас" : "Available now"}
//               </span>
//             </div>
//             <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
//               {locale === "de" ? "Bereit für Ihre Verwandlung?" :
//                locale === "ru" ? "Готовы к преображению?" :
//                "Ready for Your Transformation?"}
//             </h2>
//             <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
//               {locale === "de" ? "Buchen Sie jetzt Ihren Termin und erleben Sie Premium-Schönheitsservice." :
//                locale === "ru" ? "Запишитесь сейчас и ощутите премиальный сервис красоты." :
//                "Book your appointment now and experience premium beauty service."}
//             </p>
//             <Link
//               href="/booking"
//               className="
//                 inline-flex items-center gap-3 px-12 py-5
//                 bg-white text-slate-900 hover:bg-slate-100
//                 rounded-full font-bold text-lg
//                 shadow-2xl shadow-white/25
//                 hover:shadow-white/40
//                 transition-all duration-300
//                 hover:scale-105
//               "
//             >
//               {translations.bookNow}
//               <ArrowRight className="w-5 h-5" />
//             </Link>
//           </motion.div>
//         </div>
//       </section>
//     </main>
//   );
// }
