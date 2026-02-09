// src/app/gallerie/GallerieClient.tsx
"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Flower2,
  Camera,
  Images,
  Heart,
} from "lucide-react";
import type { Locale } from "@/i18n/locales";

/* ═══════════════════════ TYPES ═══════════════════════ */

type GalleryImage = {
  id: string;
  src: string;
  caption: string | null;
  serviceName: string;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  images: GalleryImage[];
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
    photoCount: (n: number) => string;
    close: string;
    noImages: string;
    ctaTitle: string;
    ctaButton: string;
  }
> = {
  de: {
    heroTitle: "Unsere Galerie",
    heroSubtitle: "Sch\u00F6nheit in jedem Detail",
    heroDescription:
      "Entdecken Sie unsere besten Arbeiten \u2014 lassen Sie sich von den Ergebnissen inspirieren.",
    allCategories: "Alle",
    photoCount: (n) => (n === 1 ? "1 Foto" : `${n} Fotos`),
    close: "Schlie\u00DFen",
    noImages: "Noch keine Bilder vorhanden.",
    ctaTitle: "Gefallen Ihnen unsere Arbeiten?",
    ctaButton: "Termin vereinbaren",
  },
  en: {
    heroTitle: "Our Gallery",
    heroSubtitle: "Beauty in every detail",
    heroDescription:
      "Discover our best works \u2014 let the results inspire you.",
    allCategories: "All",
    photoCount: (n) => (n === 1 ? "1 photo" : `${n} photos`),
    close: "Close",
    noImages: "No images yet.",
    ctaTitle: "Like what you see?",
    ctaButton: "Book appointment",
  },
  ru: {
    heroTitle: "\u041D\u0430\u0448\u0430 \u0433\u0430\u043B\u0435\u0440\u0435\u044F",
    heroSubtitle: "\u041A\u0440\u0430\u0441\u043E\u0442\u0430 \u0432 \u043A\u0430\u0436\u0434\u043E\u0439 \u0434\u0435\u0442\u0430\u043B\u0438",
    heroDescription:
      "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u043D\u0430\u0448\u0438 \u043B\u0443\u0447\u0448\u0438\u0435 \u0440\u0430\u0431\u043E\u0442\u044B \u2014 \u0432\u0434\u043E\u0445\u043D\u043E\u0432\u0438\u0442\u0435\u0441\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\u043C\u0438.",
    allCategories: "\u0412\u0441\u0435",
    photoCount: (n) => {
      if (n === 1) return "1 \u0444\u043E\u0442\u043E";
      return `${n} \u0444\u043E\u0442\u043E`;
    },
    close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    noImages: "\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442.",
    ctaTitle: "\u041D\u0440\u0430\u0432\u044F\u0442\u0441\u044F \u043D\u0430\u0448\u0438 \u0440\u0430\u0431\u043E\u0442\u044B?",
    ctaButton: "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F",
  },
};

/* ═══════════════════════ helpers ═══════════════════════ */

function localeHref(path: string, locale: Locale) {
  if (locale === "de") return path;
  return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
}

/* ═══════════════════════ DOME GALLERY ═══════════════════════ */

/**
 * Dome Gallery — grid of images with 3D dome/curved perspective.
 * Mouse parallax tilts the dome. Each row curves based on position.
 * Matches the reactbits.dev dome-gallery visual style.
 */
function DomeGallery({
  images,
  onImageClick,
}: {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(false);

  // Auto-animation for idle state (subtle breathing)
  const autoTiltX = useMotionValue(0);
  const autoTiltY = useMotionValue(0);
  const autoRef = useRef<number>(0);
  const isInteracting = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Idle auto-animation
  useEffect(() => {
    let running = true;
    const tick = (t: number) => {
      if (!running) return;
      if (!isInteracting.current) {
        autoTiltX.set(Math.sin(t * 0.0008) * 0.15);
        autoTiltY.set(Math.cos(t * 0.0006) * 0.12);
      }
      autoRef.current = requestAnimationFrame(tick);
    };
    autoRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(autoRef.current);
    };
  }, [autoTiltX, autoTiltY]);

  // Combined input = mouse/touch + auto
  const combinedX = useTransform([mouseX, autoTiltX], ([m, a]: number[]) => m + a);
  const combinedY = useTransform([mouseY, autoTiltY], ([m, a]: number[]) => m + a);

  const rotateX = useSpring(
    useTransform(combinedY, [-0.5, 0.5], [isMobile ? 15 : 12, isMobile ? -15 : -12]),
    { stiffness: 80, damping: 25 },
  );
  const rotateY = useSpring(
    useTransform(combinedX, [-0.5, 0.5], [isMobile ? -10 : -8, isMobile ? 10 : 8]),
    { stiffness: 80, damping: 25 },
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      isInteracting.current = true;
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY],
  );

  const handlePointerLeave = useCallback(() => {
    isInteracting.current = false;
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Cols based on viewport
  const [cols, setCols] = useState(5);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setCols(3);
      else if (w < 768) setCols(4);
      else if (w < 1024) setCols(5);
      else setCols(6);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const rows = useMemo(() => {
    const result: GalleryImage[][] = [];
    for (let i = 0; i < images.length; i += cols) {
      result.push(images.slice(i, i + cols));
    }
    return result;
  }, [images, cols]);

  const totalRows = rows.length;

  // Stronger curvature on mobile since viewport is smaller
  const curveMult = isMobile ? 1.4 : 1;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-6 sm:py-10 touch-pan-y"
      style={{ perspective: isMobile ? "600px" : "900px" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className="mx-auto"
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
        }}
      >
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          {rows.map((row, rowIdx) => {
            const centerRow = (totalRows - 1) / 2;
            const distFromCenter = totalRows > 1 ? (rowIdx - centerRow) / Math.max(centerRow, 0.5) : 0;
            const rowRotateX = distFromCenter * -18 * curveMult;
            const rowScale = 1 - Math.abs(distFromCenter) * 0.06 * curveMult;
            const rowZ = -Math.abs(distFromCenter) * 55 * curveMult;

            return (
              <motion.div
                key={rowIdx}
                className="flex justify-center gap-2 sm:gap-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: rowIdx * 0.07 }}
                style={{
                  transformStyle: "preserve-3d",
                  transform: `rotateX(${rowRotateX}deg) translateZ(${rowZ}px) scale(${rowScale})`,
                }}
              >
                {row.map((img, colIdx) => {
                  const centerCol = (row.length - 1) / 2;
                  const distFromColCenter = row.length > 1
                    ? (colIdx - centerCol) / Math.max(centerCol, 0.5)
                    : 0;
                  const itemRotateY = distFromColCenter * 12 * curveMult;
                  const itemZ = -Math.abs(distFromColCenter) * 25 * curveMult;

                  const globalIdx =
                    rows.slice(0, rowIdx).reduce((s, r) => s + r.length, 0) + colIdx;

                  return (
                    <motion.button
                      key={img.id}
                      onClick={() => onImageClick(globalIdx)}
                      className="group relative flex-shrink-0 overflow-hidden rounded-xl sm:rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:focus-visible:ring-amber-400"
                      style={{
                        width: "clamp(80px, 14vw, 160px)",
                        height: "clamp(80px, 14vw, 160px)",
                        transformStyle: "preserve-3d",
                        transform: `rotateY(${itemRotateY}deg) translateZ(${itemZ}px)`,
                      }}
                      whileHover={{ scale: 1.12, z: 40 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Image
                        src={img.src}
                        alt={img.caption || img.serviceName}
                        fill
                        sizes="160px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-inset ring-white/15 dark:ring-white/5" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                        <p className="text-white text-[10px] font-semibold drop-shadow-lg leading-tight truncate">
                          {img.serviceName}
                        </p>
                        <ZoomIn className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-white/70" />
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Edge fades for dome illusion */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 sm:h-12 bg-gradient-to-b from-pink-50/90 via-pink-50/40 to-transparent dark:from-[#0a0a0f] dark:via-[#0a0a0f]/50 dark:to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 sm:h-12 bg-gradient-to-t from-pink-50/90 via-pink-50/40 to-transparent dark:from-[#0a0a0f] dark:via-[#0a0a0f]/50 dark:to-transparent" />
      <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-10 sm:w-12 bg-gradient-to-r from-pink-50/70 to-transparent dark:from-[#0a0a0f] dark:to-transparent" />
      <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-10 sm:w-12 bg-gradient-to-l from-pink-50/70 to-transparent dark:from-[#0a0a0f] dark:to-transparent" />
    </div>
  );
}

/* ═══════════════════════ LIGHTBOX ═══════════════════════ */

function Lightbox({
  images,
  currentIndex,
  onClose,
  onChange,
  locale,
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onChange: (i: number) => void;
  locale: Locale;
}) {
  const t = t_map[locale];
  const img = images[currentIndex];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        onChange((currentIndex - 1 + images.length) % images.length);
      if (e.key === "ArrowRight")
        onChange((currentIndex + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [currentIndex, images.length, onChange, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-2xl"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label={t.close}
      >
        <X className="w-5 h-5" />
      </button>

      <div className="absolute top-5 left-5 text-white/50 text-sm font-medium tabular-nums">
        {currentIndex + 1} / {images.length}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onChange((currentIndex - 1 + images.length) % images.length);
        }}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onChange((currentIndex + 1) % images.length);
        }}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={img.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={img.src}
            alt={img.caption || img.serviceName}
            width={1200}
            height={900}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
            sizes="90vw"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <p className="text-white font-semibold text-sm">{img.serviceName}</p>
        {img.caption && (
          <p className="text-white/40 text-xs mt-1">{img.caption}</p>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════ MASONRY GRID ═══════════════════════ */

function MasonryGrid({
  images,
  onImageClick,
}: {
  images: GalleryImage[];
  onImageClick: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3"
    >
      {images.map((img, i) => (
        <motion.button
          key={img.id}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.8) }}
          whileHover={{ scale: 1.02, y: -4 }}
          onClick={() => onImageClick(i)}
          className="group relative w-full break-inside-avoid rounded-xl overflow-hidden border border-pink-200/25 shadow-md shadow-pink-100/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-white/[0.06] dark:shadow-none dark:focus-visible:ring-amber-400"
        >
          <Image
            src={img.src}
            alt={img.caption || img.serviceName}
            width={400}
            height={500}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <p className="text-white text-xs font-semibold drop-shadow-lg">
              {img.serviceName}
            </p>
            {img.caption && (
              <p className="text-white/60 text-[10px] mt-0.5">{img.caption}</p>
            )}
            <ZoomIn className="absolute top-2 right-2 w-4 h-4 text-white/70" />
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function GallerieClient({ locale, categories }: Props) {
  const t = t_map[locale];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{
    images: GalleryImage[];
    index: number;
  } | null>(null);

  const allImages = categories.flatMap((c) => c.images);
  const filteredImages = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.images ?? []
    : allImages;

  const totalImages = allImages.length;

  const openLightbox = useCallback(
    (images: GalleryImage[], index: number) => {
      setLightbox({ images, index });
    },
    [],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-pink-50/60 via-rose-50/20 to-white text-gray-900 dark:from-[#0a0a0f] dark:via-[#0f0f1a] dark:to-[#0a0a0f] dark:text-white">
      {/* ─── Background ─── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <motion.div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-25 dark:opacity-0"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 65%)",
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-24 w-[450px] h-[450px] rounded-full opacity-20 dark:opacity-0"
          style={{
            background: "radial-gradient(circle, rgba(251,191,36,0.20) 0%, transparent 65%)",
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_top,_rgba(180,150,50,0.08)_0%,_transparent_55%)]" />
      </div>

      {/* ═══════ HERO ═══════ */}
      <section className="relative z-10 pt-8 pb-4 sm:pt-12 sm:pb-6">
        <motion.div
          className="pointer-events-none absolute top-14 right-16 text-pink-300/15 dark:hidden"
          animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Camera className="w-9 h-9" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute bottom-2 left-10 text-rose-300/15 dark:hidden"
          animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <Flower2 className="w-7 h-7" />
        </motion.div>

        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-5 h-px w-20 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-pink-200/40 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 shadow-sm backdrop-blur mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-200"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Images className="h-4 w-4 text-pink-500 dark:text-amber-400" />
            </motion.span>
            {t.photoCount(totalImages)}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-playfair text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-rose-800 via-pink-700 to-amber-700 dark:from-amber-200 dark:via-amber-100 dark:to-amber-300/80"
          >
            {t.heroTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-2 font-cormorant text-lg sm:text-xl text-rose-700/50 dark:text-amber-100/50 tracking-wide"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-3 max-w-xl mx-auto text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            {t.heroDescription}
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
          />
        </div>
      </section>

      {/* ═══════ CATEGORY FILTER ═══════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 mt-2 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveCategory(null)}
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
              !activeCategory
                ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-300/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/15"
                : "border border-pink-200/40 bg-white/70 text-gray-700 shadow-sm hover:border-pink-300/60 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/20",
            ].join(" ")}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t.allCategories}
            <span
              className={[
                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                !activeCategory
                  ? "bg-white/25 dark:bg-gray-950/20"
                  : "bg-pink-100/60 text-pink-700 dark:bg-white/10 dark:text-gray-400",
              ].join(" ")}
            >
              {totalImages}
            </span>
          </motion.button>

          {categories.map((cat) => {
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
                    ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-300/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950"
                    : "border border-pink-200/40 bg-white/70 text-gray-700 shadow-sm hover:border-pink-300/60 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/20",
                ].join(" ")}
              >
                {cat.name}
                <span
                  className={[
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    isActive
                      ? "bg-white/25 dark:bg-gray-950/20"
                      : "bg-pink-100/60 text-pink-700 dark:bg-white/10 dark:text-gray-400",
                  ].join(" ")}
                >
                  {cat.images.length}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      {/* ═══════ DOME GALLERY ═══════ */}
      {filteredImages.length > 0 && (
        <section className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory ?? "all"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <DomeGallery
                images={filteredImages}
                onImageClick={(i) => openLightbox(filteredImages, i)}
              />
            </motion.div>
          </AnimatePresence>
        </section>
      )}

      {/* ═══════ DIVIDER ═══════ */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
        <div className="h-px bg-gradient-to-r from-transparent via-pink-300/30 to-transparent dark:via-amber-500/15" />
      </div>

      {/* ═══════ MASONRY GRID ═══════ */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
        {filteredImages.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={(activeCategory ?? "all") + "-grid"}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MasonryGrid
                images={filteredImages}
                onImageClick={(i) => openLightbox(filteredImages, i)}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-20 font-cormorant text-lg">
            {t.noImages}
          </p>
        )}
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="relative z-10 pb-20">
        <div className="absolute inset-0 flex items-center justify-center dark:hidden pointer-events-none">
          <div className="w-[400px] h-[200px] rounded-full bg-gradient-to-r from-pink-200/20 via-rose-200/10 to-amber-200/20 blur-3xl" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Heart className="mx-auto w-6 h-6 text-pink-500/30 dark:text-amber-400/25 mb-4" />
          </motion.div>

          <h2 className="font-playfair text-2xl sm:text-3xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-3">
            {t.ctaTitle}
          </h2>

          <a
            href={localeHref("/booking", locale)}
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white font-cormorant text-lg tracking-wider transition-all duration-500 shadow-xl shadow-pink-400/15 hover:shadow-pink-500/30 hover:scale-[1.02] dark:from-amber-600/80 dark:to-amber-500/80 dark:hover:from-amber-500 dark:hover:to-amber-400 dark:shadow-amber-500/10"
          >
            {t.ctaButton}
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </a>

          <div className="mt-12 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent dark:via-amber-400/15" />
        </div>
      </section>

      {/* ═══════ LIGHTBOX ═══════ */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            images={lightbox.images}
            currentIndex={lightbox.index}
            onClose={() => setLightbox(null)}
            onChange={(i) =>
              setLightbox((prev) => (prev ? { ...prev, index: i } : null))
            }
            locale={locale}
          />
        )}
      </AnimatePresence>
    </main>
  );
}



//------исправляем для мобильной версии
// // src/app/gallerie/GallerieClient.tsx
// "use client";

// import {
//   useState,
//   useRef,
//   useCallback,
//   useEffect,
//   useMemo,
// } from "react";
// import Image from "next/image";
// import { motion, AnimatePresence, useInView, useMotionValue, useTransform, useSpring } from "framer-motion";
// import {
//   Sparkles,
//   X,
//   ChevronLeft,
//   ChevronRight,
//   ZoomIn,
//   Flower2,
//   Camera,
//   Images,
//   Heart,
// } from "lucide-react";
// import type { Locale } from "@/i18n/locales";

// /* ═══════════════════════ TYPES ═══════════════════════ */

// type GalleryImage = {
//   id: string;
//   src: string;
//   caption: string | null;
//   serviceName: string;
// };

// type Category = {
//   id: string;
//   slug: string;
//   name: string;
//   images: GalleryImage[];
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
//     photoCount: (n: number) => string;
//     close: string;
//     noImages: string;
//     ctaTitle: string;
//     ctaButton: string;
//   }
// > = {
//   de: {
//     heroTitle: "Unsere Galerie",
//     heroSubtitle: "Sch\u00F6nheit in jedem Detail",
//     heroDescription:
//       "Entdecken Sie unsere besten Arbeiten \u2014 lassen Sie sich von den Ergebnissen inspirieren.",
//     allCategories: "Alle",
//     photoCount: (n) => (n === 1 ? "1 Foto" : `${n} Fotos`),
//     close: "Schlie\u00DFen",
//     noImages: "Noch keine Bilder vorhanden.",
//     ctaTitle: "Gefallen Ihnen unsere Arbeiten?",
//     ctaButton: "Termin vereinbaren",
//   },
//   en: {
//     heroTitle: "Our Gallery",
//     heroSubtitle: "Beauty in every detail",
//     heroDescription:
//       "Discover our best works \u2014 let the results inspire you.",
//     allCategories: "All",
//     photoCount: (n) => (n === 1 ? "1 photo" : `${n} photos`),
//     close: "Close",
//     noImages: "No images yet.",
//     ctaTitle: "Like what you see?",
//     ctaButton: "Book appointment",
//   },
//   ru: {
//     heroTitle: "\u041D\u0430\u0448\u0430 \u0433\u0430\u043B\u0435\u0440\u0435\u044F",
//     heroSubtitle: "\u041A\u0440\u0430\u0441\u043E\u0442\u0430 \u0432 \u043A\u0430\u0436\u0434\u043E\u0439 \u0434\u0435\u0442\u0430\u043B\u0438",
//     heroDescription:
//       "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u043D\u0430\u0448\u0438 \u043B\u0443\u0447\u0448\u0438\u0435 \u0440\u0430\u0431\u043E\u0442\u044B \u2014 \u0432\u0434\u043E\u0445\u043D\u043E\u0432\u0438\u0442\u0435\u0441\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\u043C\u0438.",
//     allCategories: "\u0412\u0441\u0435",
//     photoCount: (n) => {
//       if (n === 1) return "1 \u0444\u043E\u0442\u043E";
//       return `${n} \u0444\u043E\u0442\u043E`;
//     },
//     close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
//     noImages: "\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442.",
//     ctaTitle: "\u041D\u0440\u0430\u0432\u044F\u0442\u0441\u044F \u043D\u0430\u0448\u0438 \u0440\u0430\u0431\u043E\u0442\u044B?",
//     ctaButton: "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F",
//   },
// };

// /* ═══════════════════════ helpers ═══════════════════════ */

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
// }

// /* ═══════════════════════ DOME GALLERY ═══════════════════════ */

// /**
//  * Dome Gallery — grid of images with 3D dome/curved perspective.
//  * Mouse parallax tilts the dome. Each row curves based on position.
//  * Matches the reactbits.dev dome-gallery visual style.
//  */
// function DomeGallery({
//   images,
//   onImageClick,
// }: {
//   images: GalleryImage[];
//   onImageClick: (index: number) => void;
// }) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);

//   const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), {
//     stiffness: 100,
//     damping: 30,
//   });
//   const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
//     stiffness: 100,
//     damping: 30,
//   });

//   const handleMouseMove = useCallback(
//     (e: React.MouseEvent) => {
//       const rect = containerRef.current?.getBoundingClientRect();
//       if (!rect) return;
//       mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
//       mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
//     },
//     [mouseX, mouseY],
//   );

//   const handleMouseLeave = useCallback(() => {
//     mouseX.set(0);
//     mouseY.set(0);
//   }, [mouseX, mouseY]);

//   // Calculate cols based on viewport + image count
//   const [cols, setCols] = useState(5);
//   useEffect(() => {
//     const update = () => {
//       const w = window.innerWidth;
//       if (w < 480) setCols(3);
//       else if (w < 768) setCols(4);
//       else if (w < 1024) setCols(5);
//       else setCols(6);
//     };
//     update();
//     window.addEventListener("resize", update);
//     return () => window.removeEventListener("resize", update);
//   }, []);

//   // Split into rows
//   const rows = useMemo(() => {
//     const result: GalleryImage[][] = [];
//     for (let i = 0; i < images.length; i += cols) {
//       result.push(images.slice(i, i + cols));
//     }
//     return result;
//   }, [images, cols]);

//   const totalRows = rows.length;

//   return (
//     <div
//       ref={containerRef}
//       className="relative w-full overflow-hidden py-6 sm:py-10"
//       style={{ perspective: "900px" }}
//       onMouseMove={handleMouseMove}
//       onMouseLeave={handleMouseLeave}
//     >
//       <motion.div
//         className="mx-auto"
//         style={{
//           transformStyle: "preserve-3d",
//           rotateX,
//           rotateY,
//         }}
//       >
//         <div className="flex flex-col items-center gap-2.5 sm:gap-3">
//           {rows.map((row, rowIdx) => {
//             const centerRow = (totalRows - 1) / 2;
//             const distFromCenter = totalRows > 1 ? (rowIdx - centerRow) / centerRow : 0;
//             // Dome curvature: rows curve backward based on vertical distance from center
//             const rowRotateX = distFromCenter * -18;
//             const rowScale = 1 - Math.abs(distFromCenter) * 0.05;
//             const rowZ = -Math.abs(distFromCenter) * 50;

//             return (
//               <motion.div
//                 key={rowIdx}
//                 className="flex justify-center gap-2.5 sm:gap-3"
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: rowIdx * 0.07 }}
//                 style={{
//                   transformStyle: "preserve-3d",
//                   transform: `rotateX(${rowRotateX}deg) translateZ(${rowZ}px) scale(${rowScale})`,
//                 }}
//               >
//                 {row.map((img, colIdx) => {
//                   const centerCol = (row.length - 1) / 2;
//                   const distFromColCenter = row.length > 1
//                     ? (colIdx - centerCol) / centerCol
//                     : 0;
//                   const itemRotateY = distFromColCenter * 10;
//                   const itemZ = -Math.abs(distFromColCenter) * 20;

//                   const globalIdx =
//                     rows.slice(0, rowIdx).reduce((s, r) => s + r.length, 0) + colIdx;

//                   return (
//                     <motion.button
//                       key={img.id}
//                       onClick={() => onImageClick(globalIdx)}
//                       className="group relative flex-shrink-0 overflow-hidden rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:focus-visible:ring-amber-400"
//                       style={{
//                         width: "clamp(90px, 14vw, 160px)",
//                         height: "clamp(90px, 14vw, 160px)",
//                         transformStyle: "preserve-3d",
//                         transform: `rotateY(${itemRotateY}deg) translateZ(${itemZ}px)`,
//                       }}
//                       whileHover={{ scale: 1.12, z: 40 }}
//                       transition={{ duration: 0.25 }}
//                     >
//                       <Image
//                         src={img.src}
//                         alt={img.caption || img.serviceName}
//                         fill
//                         sizes="160px"
//                         className="object-cover transition-transform duration-500 group-hover:scale-110"
//                       />
//                       {/* Inner ring for depth */}
//                       <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15 dark:ring-white/5" />
//                       {/* Hover overlay */}
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
//                         <p className="text-white text-[10px] font-semibold drop-shadow-lg leading-tight truncate">
//                           {img.serviceName}
//                         </p>
//                         <ZoomIn className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-white/70" />
//                       </div>
//                     </motion.button>
//                   );
//                 })}
//               </motion.div>
//             );
//           })}
//         </div>
//       </motion.div>

//       {/* Edge fades for dome illusion */}
//       <div className="pointer-events-none absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-pink-50/80 to-transparent dark:from-[#0a0a0f] dark:to-transparent" />
//       <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-pink-50/80 to-transparent dark:from-[#0a0a0f] dark:to-transparent" />
//       <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-pink-50/60 to-transparent dark:from-[#0a0a0f] dark:to-transparent" />
//       <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-pink-50/60 to-transparent dark:from-[#0a0a0f] dark:to-transparent" />
//     </div>
//   );
// }

// /* ═══════════════════════ LIGHTBOX ═══════════════════════ */

// function Lightbox({
//   images,
//   currentIndex,
//   onClose,
//   onChange,
//   locale,
// }: {
//   images: GalleryImage[];
//   currentIndex: number;
//   onClose: () => void;
//   onChange: (i: number) => void;
//   locale: Locale;
// }) {
//   const t = t_map[locale];
//   const img = images[currentIndex];

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft")
//         onChange((currentIndex - 1 + images.length) % images.length);
//       if (e.key === "ArrowRight")
//         onChange((currentIndex + 1) % images.length);
//     };
//     window.addEventListener("keydown", onKey);
//     document.body.style.overflow = "hidden";
//     return () => {
//       window.removeEventListener("keydown", onKey);
//       document.body.style.overflow = "";
//     };
//   }, [currentIndex, images.length, onChange, onClose]);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-2xl"
//       onClick={onClose}
//     >
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//         aria-label={t.close}
//       >
//         <X className="w-5 h-5" />
//       </button>

//       <div className="absolute top-5 left-5 text-white/50 text-sm font-medium tabular-nums">
//         {currentIndex + 1} / {images.length}
//       </div>

//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           onChange((currentIndex - 1 + images.length) % images.length);
//         }}
//         className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//       >
//         <ChevronLeft className="w-6 h-6" />
//       </button>

//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           onChange((currentIndex + 1) % images.length);
//         }}
//         className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//       >
//         <ChevronRight className="w-6 h-6" />
//       </button>

//       <AnimatePresence mode="wait">
//         <motion.div
//           key={img.id}
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.95 }}
//           transition={{ duration: 0.25 }}
//           className="relative"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <Image
//             src={img.src}
//             alt={img.caption || img.serviceName}
//             width={1200}
//             height={900}
//             className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
//             sizes="90vw"
//             priority
//           />
//         </motion.div>
//       </AnimatePresence>

//       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
//         <p className="text-white font-semibold text-sm">{img.serviceName}</p>
//         {img.caption && (
//           <p className="text-white/40 text-xs mt-1">{img.caption}</p>
//         )}
//       </div>
//     </motion.div>
//   );
// }

// /* ═══════════════════════ MASONRY GRID ═══════════════════════ */

// function MasonryGrid({
//   images,
//   onImageClick,
// }: {
//   images: GalleryImage[];
//   onImageClick: (index: number) => void;
// }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-40px" });

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0 }}
//       animate={isInView ? { opacity: 1 } : {}}
//       transition={{ duration: 0.5 }}
//       className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3"
//     >
//       {images.map((img, i) => (
//         <motion.button
//           key={img.id}
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.8) }}
//           whileHover={{ scale: 1.02, y: -4 }}
//           onClick={() => onImageClick(i)}
//           className="group relative w-full break-inside-avoid rounded-xl overflow-hidden border border-pink-200/25 shadow-md shadow-pink-100/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-white/[0.06] dark:shadow-none dark:focus-visible:ring-amber-400"
//         >
//           <Image
//             src={img.src}
//             alt={img.caption || img.serviceName}
//             width={400}
//             height={500}
//             sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
//             className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
//             <p className="text-white text-xs font-semibold drop-shadow-lg">
//               {img.serviceName}
//             </p>
//             {img.caption && (
//               <p className="text-white/60 text-[10px] mt-0.5">{img.caption}</p>
//             )}
//             <ZoomIn className="absolute top-2 right-2 w-4 h-4 text-white/70" />
//           </div>
//         </motion.button>
//       ))}
//     </motion.div>
//   );
// }

// /* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

// export default function GallerieClient({ locale, categories }: Props) {
//   const t = t_map[locale];
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [lightbox, setLightbox] = useState<{
//     images: GalleryImage[];
//     index: number;
//   } | null>(null);

//   const allImages = categories.flatMap((c) => c.images);
//   const filteredImages = activeCategory
//     ? categories.find((c) => c.id === activeCategory)?.images ?? []
//     : allImages;

//   const totalImages = allImages.length;

//   const openLightbox = useCallback(
//     (images: GalleryImage[], index: number) => {
//       setLightbox({ images, index });
//     },
//     [],
//   );

//   return (
//     <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-pink-50/60 via-rose-50/20 to-white text-gray-900 dark:from-[#0a0a0f] dark:via-[#0f0f1a] dark:to-[#0a0a0f] dark:text-white">
//       {/* ─── Background ─── */}
//       <div className="pointer-events-none fixed inset-0 z-0">
//         <motion.div
//           className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-25 dark:opacity-0"
//           style={{
//             background: "radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 65%)",
//           }}
//           animate={{ scale: [1, 1.1, 1] }}
//           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <motion.div
//           className="absolute -bottom-40 -left-24 w-[450px] h-[450px] rounded-full opacity-20 dark:opacity-0"
//           style={{
//             background: "radial-gradient(circle, rgba(251,191,36,0.20) 0%, transparent 65%)",
//           }}
//           animate={{ scale: [1, 1.08, 1] }}
//           transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//         />
//         <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_top,_rgba(180,150,50,0.08)_0%,_transparent_55%)]" />
//       </div>

//       {/* ═══════ HERO ═══════ */}
//       <section className="relative z-10 pt-8 pb-4 sm:pt-12 sm:pb-6">
//         <motion.div
//           className="pointer-events-none absolute top-14 right-16 text-pink-300/15 dark:hidden"
//           animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
//           transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
//         >
//           <Camera className="w-9 h-9" />
//         </motion.div>
//         <motion.div
//           className="pointer-events-none absolute bottom-2 left-10 text-rose-300/15 dark:hidden"
//           animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }}
//           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
//         >
//           <Flower2 className="w-7 h-7" />
//         </motion.div>

//         <div className="mx-auto max-w-5xl px-4 text-center">
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
//             className="mx-auto mb-5 h-px w-20 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
//           />

//           <motion.div
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.1 }}
//             className="inline-flex items-center gap-2 rounded-full border border-pink-200/40 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 shadow-sm backdrop-blur mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-200"
//           >
//             <motion.span
//               animate={{ rotate: [0, 15, -15, 0] }}
//               transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
//             >
//               <Images className="h-4 w-4 text-pink-500 dark:text-amber-400" />
//             </motion.span>
//             {t.photoCount(totalImages)}
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.2 }}
//             className="font-playfair text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-rose-800 via-pink-700 to-amber-700 dark:from-amber-200 dark:via-amber-100 dark:to-amber-300/80"
//           >
//             {t.heroTitle}
//           </motion.h1>

//           <motion.p
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.4 }}
//             className="mt-2 font-cormorant text-lg sm:text-xl text-rose-700/50 dark:text-amber-100/50 tracking-wide"
//           >
//             {t.heroSubtitle}
//           </motion.p>

//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.6, delay: 0.55 }}
//             className="mt-3 max-w-xl mx-auto text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
//           >
//             {t.heroDescription}
//           </motion.p>

//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ duration: 1, delay: 0.5 }}
//             className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
//           />
//         </div>
//       </section>

//       {/* ═══════ CATEGORY FILTER ═══════ */}
//       <section className="relative z-10 mx-auto max-w-6xl px-4 mt-2 mb-4">
//         <motion.div
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.6 }}
//           className="flex flex-wrap justify-center gap-2"
//         >
//           <motion.button
//             whileHover={{ scale: 1.04, y: -2 }}
//             whileTap={{ scale: 0.97 }}
//             onClick={() => setActiveCategory(null)}
//             className={[
//               "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
//               !activeCategory
//                 ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-300/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/15"
//                 : "border border-pink-200/40 bg-white/70 text-gray-700 shadow-sm hover:border-pink-300/60 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/20",
//             ].join(" ")}
//           >
//             <Sparkles className="h-3.5 w-3.5" />
//             {t.allCategories}
//             <span
//               className={[
//                 "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
//                 !activeCategory
//                   ? "bg-white/25 dark:bg-gray-950/20"
//                   : "bg-pink-100/60 text-pink-700 dark:bg-white/10 dark:text-gray-400",
//               ].join(" ")}
//             >
//               {totalImages}
//             </span>
//           </motion.button>

//           {categories.map((cat) => {
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
//                     ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-300/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950"
//                     : "border border-pink-200/40 bg-white/70 text-gray-700 shadow-sm hover:border-pink-300/60 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/20",
//                 ].join(" ")}
//               >
//                 {cat.name}
//                 <span
//                   className={[
//                     "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
//                     isActive
//                       ? "bg-white/25 dark:bg-gray-950/20"
//                       : "bg-pink-100/60 text-pink-700 dark:bg-white/10 dark:text-gray-400",
//                   ].join(" ")}
//                 >
//                   {cat.images.length}
//                 </span>
//               </motion.button>
//             );
//           })}
//         </motion.div>
//       </section>

//       {/* ═══════ DOME GALLERY ═══════ */}
//       {filteredImages.length > 0 && (
//         <section className="relative z-10">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={activeCategory ?? "all"}
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.35 }}
//             >
//               <DomeGallery
//                 images={filteredImages}
//                 onImageClick={(i) => openLightbox(filteredImages, i)}
//               />
//             </motion.div>
//           </AnimatePresence>
//         </section>
//       )}

//       {/* ═══════ DIVIDER ═══════ */}
//       <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
//         <div className="h-px bg-gradient-to-r from-transparent via-pink-300/30 to-transparent dark:via-amber-500/15" />
//       </div>

//       {/* ═══════ MASONRY GRID ═══════ */}
//       <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
//         {filteredImages.length > 0 ? (
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={(activeCategory ?? "all") + "-grid"}
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <MasonryGrid
//                 images={filteredImages}
//                 onImageClick={(i) => openLightbox(filteredImages, i)}
//               />
//             </motion.div>
//           </AnimatePresence>
//         ) : (
//           <p className="text-center text-gray-500 dark:text-gray-400 py-20 font-cormorant text-lg">
//             {t.noImages}
//           </p>
//         )}
//       </section>

//       {/* ═══════ CTA ═══════ */}
//       <section className="relative z-10 pb-20">
//         <div className="absolute inset-0 flex items-center justify-center dark:hidden pointer-events-none">
//           <div className="w-[400px] h-[200px] rounded-full bg-gradient-to-r from-pink-200/20 via-rose-200/10 to-amber-200/20 blur-3xl" />
//         </div>

//         <div className="relative max-w-2xl mx-auto px-4 text-center">
//           <motion.div
//             animate={{ rotate: [0, 8, -8, 0] }}
//             transition={{ duration: 4, repeat: Infinity }}
//           >
//             <Heart className="mx-auto w-6 h-6 text-pink-500/30 dark:text-amber-400/25 mb-4" />
//           </motion.div>

//           <h2 className="font-playfair text-2xl sm:text-3xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-3">
//             {t.ctaTitle}
//           </h2>

//           <a
//             href={localeHref("/booking", locale)}
//             className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white font-cormorant text-lg tracking-wider transition-all duration-500 shadow-xl shadow-pink-400/15 hover:shadow-pink-500/30 hover:scale-[1.02] dark:from-amber-600/80 dark:to-amber-500/80 dark:hover:from-amber-500 dark:hover:to-amber-400 dark:shadow-amber-500/10"
//           >
//             {t.ctaButton}
//             <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
//           </a>

//           <div className="mt-12 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent dark:via-amber-400/15" />
//         </div>
//       </section>

//       {/* ═══════ LIGHTBOX ═══════ */}
//       <AnimatePresence>
//         {lightbox && (
//           <Lightbox
//             images={lightbox.images}
//             currentIndex={lightbox.index}
//             onClose={() => setLightbox(null)}
//             onChange={(i) =>
//               setLightbox((prev) => (prev ? { ...prev, index: i } : null))
//             }
//             locale={locale}
//           />
//         )}
//       </AnimatePresence>
//     </main>
//   );
// }




// // src/app/gallerie/GallerieClient.tsx
// "use client";

// import {
//   useState,
//   useRef,
//   useCallback,
//   useEffect,
//   type PointerEvent as ReactPointerEvent,
// } from "react";
// import Image from "next/image";
// import { motion, AnimatePresence, useInView } from "framer-motion";
// import {
//   Sparkles,
//   X,
//   ChevronLeft,
//   ChevronRight,
//   ZoomIn,
//   Flower2,
//   Camera,
//   Images,
//   Heart,
//   RotateCcw,
// } from "lucide-react";
// import type { Locale } from "@/i18n/locales";

// /* ═══════════════════════ TYPES ═══════════════════════ */

// type GalleryImage = {
//   id: string;
//   src: string;
//   caption: string | null;
//   serviceName: string;
// };

// type Category = {
//   id: string;
//   slug: string;
//   name: string;
//   images: GalleryImage[];
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
//     photoCount: (n: number) => string;
//     dragHint: string;
//     close: string;
//     openFullscreen: string;
//     noImages: string;
//     ctaTitle: string;
//     ctaButton: string;
//   }
// > = {
//   de: {
//     heroTitle: "Unsere Galerie",
//     heroSubtitle: "Sch\u00F6nheit in jedem Detail",
//     heroDescription:
//       "Entdecken Sie unsere besten Arbeiten \u2014 lassen Sie sich von den Ergebnissen inspirieren.",
//     allCategories: "Alle",
//     photoCount: (n) => (n === 1 ? "1 Foto" : `${n} Fotos`),
//     dragHint: "Ziehen zum Drehen",
//     close: "Schlie\u00DFen",
//     openFullscreen: "Vergr\u00F6\u00DFern",
//     noImages: "Noch keine Bilder vorhanden.",
//     ctaTitle: "Gefallen Ihnen unsere Arbeiten?",
//     ctaButton: "Termin vereinbaren",
//   },
//   en: {
//     heroTitle: "Our Gallery",
//     heroSubtitle: "Beauty in every detail",
//     heroDescription:
//       "Discover our best works \u2014 let the results inspire you.",
//     allCategories: "All",
//     photoCount: (n) => (n === 1 ? "1 photo" : `${n} photos`),
//     dragHint: "Drag to rotate",
//     close: "Close",
//     openFullscreen: "View full size",
//     noImages: "No images yet.",
//     ctaTitle: "Like what you see?",
//     ctaButton: "Book appointment",
//   },
//   ru: {
//     heroTitle: "\u041D\u0430\u0448\u0430 \u0433\u0430\u043B\u0435\u0440\u0435\u044F",
//     heroSubtitle: "\u041A\u0440\u0430\u0441\u043E\u0442\u0430 \u0432 \u043A\u0430\u0436\u0434\u043E\u0439 \u0434\u0435\u0442\u0430\u043B\u0438",
//     heroDescription:
//       "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u043D\u0430\u0448\u0438 \u043B\u0443\u0447\u0448\u0438\u0435 \u0440\u0430\u0431\u043E\u0442\u044B \u2014 \u0432\u0434\u043E\u0445\u043D\u043E\u0432\u0438\u0442\u0435\u0441\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\u043C\u0438.",
//     allCategories: "\u0412\u0441\u0435",
//     photoCount: (n) => {
//       if (n === 1) return "1 \u0444\u043E\u0442\u043E";
//       if (n >= 2 && n <= 4) return `${n} \u0444\u043E\u0442\u043E`;
//       return `${n} \u0444\u043E\u0442\u043E`;
//     },
//     dragHint: "\u041F\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u0434\u043B\u044F \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u044F",
//     close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
//     openFullscreen: "\u0423\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C",
//     noImages: "\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442.",
//     ctaTitle: "\u041D\u0440\u0430\u0432\u044F\u0442\u0441\u044F \u043D\u0430\u0448\u0438 \u0440\u0430\u0431\u043E\u0442\u044B?",
//     ctaButton: "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F",
//   },
// };

// /* ═══════════════════════ helpers ═══════════════════════ */

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   return `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`;
// }

// /* ═══════════════════════ DOME GALLERY ═══════════════════════ */

// const CARD_WIDTH = 280;
// const CARD_HEIGHT = 360;
// const CARD_WIDTH_SM = 200;
// const CARD_HEIGHT_SM = 260;

// function DomeGallery({
//   images,
//   onImageClick,
// }: {
//   images: GalleryImage[];
//   onImageClick: (index: number) => void;
// }) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [rotation, setRotation] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [isSmall, setIsSmall] = useState(false);
//   const dragStart = useRef({ x: 0, rotation: 0 });
//   const velocity = useRef(0);
//   const lastX = useRef(0);
//   const lastTime = useRef(0);
//   const animFrame = useRef<number>(0);

//   const count = images.length;
//   const angleStep = 360 / Math.max(count, 1);
//   const cw = isSmall ? CARD_WIDTH_SM : CARD_WIDTH;
//   const ch = isSmall ? CARD_HEIGHT_SM : CARD_HEIGHT;
//   // Radius: circumference = count * (cardWidth + gap)
//   const radius = Math.max((count * (cw + 24)) / (2 * Math.PI), 320);

//   useEffect(() => {
//     const check = () => setIsSmall(window.innerWidth < 640);
//     check();
//     window.addEventListener("resize", check);
//     return () => window.removeEventListener("resize", check);
//   }, []);

//   // Auto-rotate when not dragging
//   useEffect(() => {
//     if (isDragging || count <= 1) return;
//     let running = true;
//     let lastTs = 0;

//     const tick = (ts: number) => {
//       if (!running) return;
//       if (lastTs) {
//         const dt = ts - lastTs;
//         // Apply velocity decay + slow auto-rotate
//         if (Math.abs(velocity.current) > 0.01) {
//           velocity.current *= 0.97;
//           setRotation((prev) => prev + velocity.current * dt * 0.06);
//         } else {
//           velocity.current = 0;
//           setRotation((prev) => prev + dt * 0.005); // slow auto-rotate
//         }
//       }
//       lastTs = ts;
//       animFrame.current = requestAnimationFrame(tick);
//     };
//     animFrame.current = requestAnimationFrame(tick);
//     return () => {
//       running = false;
//       cancelAnimationFrame(animFrame.current);
//     };
//   }, [isDragging, count]);

//   const onPointerDown = useCallback(
//     (e: ReactPointerEvent) => {
//       setIsDragging(true);
//       velocity.current = 0;
//       dragStart.current = { x: e.clientX, rotation };
//       lastX.current = e.clientX;
//       lastTime.current = performance.now();
//       (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
//     },
//     [rotation],
//   );

//   const onPointerMove = useCallback(
//     (e: ReactPointerEvent) => {
//       if (!isDragging) return;
//       const dx = e.clientX - dragStart.current.x;
//       const sensitivity = 0.3;
//       setRotation(dragStart.current.rotation + dx * sensitivity);

//       const now = performance.now();
//       const dt = now - lastTime.current;
//       if (dt > 0) {
//         velocity.current = (e.clientX - lastX.current) / dt;
//       }
//       lastX.current = e.clientX;
//       lastTime.current = now;
//     },
//     [isDragging],
//   );

//   const onPointerUp = useCallback(() => {
//     setIsDragging(false);
//   }, []);

//   if (count === 0) return null;

//   return (
//     <div
//       ref={containerRef}
//       className="relative w-full overflow-hidden select-none"
//       style={{
//         height: ch + 120,
//         perspective: "1200px",
//         cursor: isDragging ? "grabbing" : "grab",
//       }}
//       onPointerDown={onPointerDown}
//       onPointerMove={onPointerMove}
//       onPointerUp={onPointerUp}
//       onPointerLeave={onPointerUp}
//     >
//       {/* 3D rotating cylinder */}
//       <div
//         className="absolute left-1/2 top-1/2"
//         style={{
//           width: 0,
//           height: 0,
//           transformStyle: "preserve-3d",
//           transform: `translateX(-50%) translateY(-55%) rotateY(${rotation}deg)`,
//           transition: isDragging ? "none" : undefined,
//         }}
//       >
//         {images.map((img, i) => {
//           const angle = i * angleStep;
//           return (
//             <div
//               key={img.id}
//               className="absolute"
//               style={{
//                 width: cw,
//                 height: ch,
//                 left: -cw / 2,
//                 top: -ch / 2,
//                 transformStyle: "preserve-3d",
//                 transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
//                 backfaceVisibility: "hidden",
//               }}
//             >
//               <button
//                 onClick={() => onImageClick(i)}
//                 className="group relative w-full h-full rounded-2xl overflow-hidden border-2 border-pink-200/30 shadow-xl shadow-pink-100/10 transition-all duration-300 hover:border-pink-400/50 hover:shadow-2xl hover:shadow-pink-200/25 dark:border-white/10 dark:shadow-black/30 dark:hover:border-amber-500/40 dark:hover:shadow-amber-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:focus-visible:ring-amber-400"
//               >
//                 <Image
//                   src={img.src}
//                   alt={img.caption || img.serviceName}
//                   fill
//                   sizes="300px"
//                   className="object-cover transition-transform duration-500 group-hover:scale-110"
//                 />
//                 {/* Hover overlay */}
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
//                   <p className="text-white text-sm font-semibold drop-shadow-lg">
//                     {img.serviceName}
//                   </p>
//                   {img.caption && (
//                     <p className="text-white/70 text-xs mt-0.5 drop-shadow">
//                       {img.caption}
//                     </p>
//                   )}
//                   <ZoomIn className="absolute top-3 right-3 w-5 h-5 text-white/80" />
//                 </div>
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {/* Reflection fade at bottom */}
//       <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-pink-50/70 via-pink-50/40 to-transparent dark:from-[#0a0a0f] dark:via-[#0a0a0f]/60 dark:to-transparent pointer-events-none" />
//     </div>
//   );
// }

// /* ═══════════════════════ LIGHTBOX ═══════════════════════ */

// function Lightbox({
//   images,
//   currentIndex,
//   onClose,
//   onChange,
//   locale,
// }: {
//   images: GalleryImage[];
//   currentIndex: number;
//   onClose: () => void;
//   onChange: (i: number) => void;
//   locale: Locale;
// }) {
//   const t = t_map[locale];
//   const img = images[currentIndex];

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") onChange((currentIndex - 1 + images.length) % images.length);
//       if (e.key === "ArrowRight") onChange((currentIndex + 1) % images.length);
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [currentIndex, images.length, onChange, onClose]);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
//       onClick={onClose}
//     >
//       {/* Close button */}
//       <button
//         onClick={onClose}
//         className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//         aria-label={t.close}
//       >
//         <X className="w-6 h-6" />
//       </button>

//       {/* Counter */}
//       <div className="absolute top-4 left-4 text-white/60 text-sm font-medium">
//         {currentIndex + 1} / {images.length}
//       </div>

//       {/* Prev */}
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           onChange((currentIndex - 1 + images.length) % images.length);
//         }}
//         className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//       >
//         <ChevronLeft className="w-6 h-6" />
//       </button>

//       {/* Next */}
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           onChange((currentIndex + 1) % images.length);
//         }}
//         className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
//       >
//         <ChevronRight className="w-6 h-6" />
//       </button>

//       {/* Image */}
//       <motion.div
//         key={img.id}
//         initial={{ opacity: 0, scale: 0.92 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.92 }}
//         transition={{ duration: 0.3 }}
//         className="relative max-w-[90vw] max-h-[85vh] aspect-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <Image
//           src={img.src}
//           alt={img.caption || img.serviceName}
//           width={1200}
//           height={900}
//           className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
//           sizes="90vw"
//           priority
//         />
//       </motion.div>

//       {/* Caption */}
//       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
//         <p className="text-white font-semibold text-sm">{img.serviceName}</p>
//         {img.caption && <p className="text-white/50 text-xs mt-1">{img.caption}</p>}
//       </div>
//     </motion.div>
//   );
// }

// /* ═══════════════════════ GRID GALLERY (mobile fallback + below dome) ═══════════════════════ */

// function MasonryGrid({
//   images,
//   onImageClick,
// }: {
//   images: GalleryImage[];
//   onImageClick: (index: number) => void;
// }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-40px" });

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0 }}
//       animate={isInView ? { opacity: 1 } : {}}
//       transition={{ duration: 0.5 }}
//       className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3"
//     >
//       {images.map((img, i) => (
//         <motion.button
//           key={img.id}
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.8) }}
//           whileHover={{ scale: 1.02, y: -4 }}
//           onClick={() => onImageClick(i)}
//           className="group relative w-full break-inside-avoid rounded-xl overflow-hidden border border-pink-200/25 shadow-md shadow-pink-100/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:border-white/[0.06] dark:shadow-none dark:focus-visible:ring-amber-400"
//         >
//           <Image
//             src={img.src}
//             alt={img.caption || img.serviceName}
//             width={400}
//             height={500}
//             sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
//             className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
//           />
//           {/* Hover overlay */}
//           <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
//             <p className="text-white text-xs font-semibold drop-shadow-lg">
//               {img.serviceName}
//             </p>
//             {img.caption && (
//               <p className="text-white/60 text-[10px] mt-0.5">{img.caption}</p>
//             )}
//             <ZoomIn className="absolute top-2 right-2 w-4 h-4 text-white/70" />
//           </div>
//         </motion.button>
//       ))}
//     </motion.div>
//   );
// }

// /* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

// export default function GallerieClient({ locale, categories }: Props) {
//   const t = t_map[locale];
//   const [activeCategory, setActiveCategory] = useState<string | null>(null);
//   const [lightbox, setLightbox] = useState<{
//     images: GalleryImage[];
//     index: number;
//   } | null>(null);

//   const allImages = categories.flatMap((c) => c.images);
//   const filteredImages = activeCategory
//     ? categories.find((c) => c.id === activeCategory)?.images ?? []
//     : allImages;

//   const totalImages = allImages.length;

//   const openLightbox = useCallback(
//     (images: GalleryImage[], index: number) => {
//       setLightbox({ images, index });
//     },
//     [],
//   );

//   return (
//     <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-pink-50/60 via-rose-50/20 to-white text-gray-900 dark:from-[#0a0a0f] dark:via-[#0f0f1a] dark:to-[#0a0a0f] dark:text-white">
//       {/* Background orbs */}
//       <div className="pointer-events-none fixed inset-0 z-0">
//         <motion.div
//           className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-25 dark:opacity-0"
//           style={{
//             background:
//               "radial-gradient(circle, rgba(236,72,153,0.22) 0%, transparent 65%)",
//           }}
//           animate={{ scale: [1, 1.1, 1] }}
//           transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
//         />
//         <motion.div
//           className="absolute -bottom-40 -left-24 w-[450px] h-[450px] rounded-full opacity-20 dark:opacity-0"
//           style={{
//             background:
//               "radial-gradient(circle, rgba(251,191,36,0.20) 0%, transparent 65%)",
//           }}
//           animate={{ scale: [1, 1.08, 1] }}
//           transition={{
//             duration: 14,
//             repeat: Infinity,
//             ease: "easeInOut",
//             delay: 2,
//           }}
//         />
//         {/* Dark mode radial */}
//         <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_top,_rgba(180,150,50,0.08)_0%,_transparent_55%)]" />
//       </div>

//       {/* ═══════ HERO ═══════ */}
//       <section className="relative z-10 pt-8 pb-4 sm:pt-12 sm:pb-6">
//         {/* Floating icons */}
//         <motion.div
//           className="pointer-events-none absolute top-14 right-16 text-pink-300/15 dark:hidden"
//           animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
//           transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
//         >
//           <Camera className="w-9 h-9" />
//         </motion.div>
//         <motion.div
//           className="pointer-events-none absolute bottom-2 left-10 text-rose-300/15 dark:hidden"
//           animate={{ y: [0, 6, 0], rotate: [0, -10, 0] }}
//           transition={{
//             duration: 8,
//             repeat: Infinity,
//             ease: "easeInOut",
//             delay: 2,
//           }}
//         >
//           <Flower2 className="w-7 h-7" />
//         </motion.div>

//         <div className="mx-auto max-w-5xl px-4 text-center">
//           {/* Line */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
//             className="mx-auto mb-5 h-px w-20 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
//           />

//           {/* Badge */}
//           <motion.div
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.1 }}
//             className="inline-flex items-center gap-2 rounded-full border border-pink-200/40 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-rose-700 shadow-sm backdrop-blur mb-4 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-200"
//           >
//             <motion.span
//               animate={{ rotate: [0, 15, -15, 0] }}
//               transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
//             >
//               <Images className="h-4 w-4 text-pink-500 dark:text-amber-400" />
//             </motion.span>
//             {t.photoCount(totalImages)}
//           </motion.div>

//           {/* Title */}
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.7, delay: 0.2 }}
//             className="font-playfair text-4xl sm:text-5xl md:text-6xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-rose-800 via-pink-700 to-amber-700 dark:from-amber-200 dark:via-amber-100 dark:to-amber-300/80"
//           >
//             {t.heroTitle}
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.4 }}
//             className="mt-2 font-cormorant text-lg sm:text-xl text-rose-700/50 dark:text-amber-100/50 tracking-wide"
//           >
//             {t.heroSubtitle}
//           </motion.p>

//           {/* Description */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.6, delay: 0.55 }}
//             className="mt-3 max-w-xl mx-auto text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
//           >
//             {t.heroDescription}
//           </motion.p>

//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ duration: 1, delay: 0.5 }}
//             className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
//           />
//         </div>
//       </section>

//       {/* ═══════ CATEGORY FILTER ═══════ */}
//       <section className="relative z-10 mx-auto max-w-6xl px-4 mt-2 mb-6">
//         <motion.div
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.6 }}
//           className="flex flex-wrap justify-center gap-2"
//         >
//           <motion.button
//             whileHover={{ scale: 1.04, y: -2 }}
//             whileTap={{ scale: 0.97 }}
//             onClick={() => setActiveCategory(null)}
//             className={[
//               "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
//               !activeCategory
//                 ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-300/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/15"
//                 : "border border-pink-200/40 bg-white/70 text-gray-700 shadow-sm hover:border-pink-300/60 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/20",
//             ].join(" ")}
//           >
//             <Sparkles className="h-3.5 w-3.5" />
//             {t.allCategories}
//             <span
//               className={[
//                 "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
//                 !activeCategory
//                   ? "bg-white/25 dark:bg-gray-950/20"
//                   : "bg-pink-100/60 text-pink-700 dark:bg-white/10 dark:text-gray-400",
//               ].join(" ")}
//             >
//               {totalImages}
//             </span>
//           </motion.button>

//           {categories.map((cat) => {
//             const isActive = activeCategory === cat.id;
//             return (
//               <motion.button
//                 key={cat.id}
//                 whileHover={{ scale: 1.04, y: -2 }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() =>
//                   setActiveCategory(isActive ? null : cat.id)
//                 }
//                 className={[
//                   "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
//                   isActive
//                     ? "bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-lg shadow-pink-300/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950"
//                     : "border border-pink-200/40 bg-white/70 text-gray-700 shadow-sm hover:border-pink-300/60 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-amber-500/20",
//                 ].join(" ")}
//               >
//                 {cat.name}
//                 <span
//                   className={[
//                     "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
//                     isActive
//                       ? "bg-white/25 dark:bg-gray-950/20"
//                       : "bg-pink-100/60 text-pink-700 dark:bg-white/10 dark:text-gray-400",
//                   ].join(" ")}
//                 >
//                   {cat.images.length}
//                 </span>
//               </motion.button>
//             );
//           })}
//         </motion.div>
//       </section>

//       {/* ═══════ DOME GALLERY (desktop) ═══════ */}
//       {filteredImages.length > 0 && (
//         <section className="relative z-10 hidden sm:block">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={activeCategory ?? "all"}
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.35 }}
//             >
//               <DomeGallery
//                 images={filteredImages}
//                 onImageClick={(i) => openLightbox(filteredImages, i)}
//               />
//             </motion.div>
//           </AnimatePresence>

//           {/* Drag hint */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 1.5 }}
//             className="text-center -mt-6 mb-6"
//           >
//             <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
//               <RotateCcw className="w-3 h-3" />
//               {t.dragHint}
//             </span>
//           </motion.div>
//         </section>
//       )}

//       {/* ═══════ MASONRY GRID ═══════ */}
//       <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16">
//         {filteredImages.length > 0 ? (
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={activeCategory ?? "all-grid"}
//               initial={{ opacity: 0, y: 15 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <MasonryGrid
//                 images={filteredImages}
//                 onImageClick={(i) => openLightbox(filteredImages, i)}
//               />
//             </motion.div>
//           </AnimatePresence>
//         ) : (
//           <p className="text-center text-gray-500 dark:text-gray-400 py-20 font-cormorant text-lg">
//             {t.noImages}
//           </p>
//         )}
//       </section>

//       {/* ═══════ CTA ═══════ */}
//       <section className="relative z-10 pb-20">
//         <div className="absolute inset-0 flex items-center justify-center dark:hidden pointer-events-none">
//           <div className="w-[400px] h-[200px] rounded-full bg-gradient-to-r from-pink-200/20 via-rose-200/10 to-amber-200/20 blur-3xl" />
//         </div>

//         <div className="relative max-w-2xl mx-auto px-4 text-center">
//           <motion.div
//             animate={{ rotate: [0, 8, -8, 0] }}
//             transition={{ duration: 4, repeat: Infinity }}
//           >
//             <Heart className="mx-auto w-6 h-6 text-pink-500/30 dark:text-amber-400/25 mb-4" />
//           </motion.div>

//           <h2 className="font-playfair text-2xl sm:text-3xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-3">
//             {t.ctaTitle}
//           </h2>

//           <a
//             href={localeHref("/booking", locale)}
//             className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white font-cormorant text-lg tracking-wider transition-all duration-500 shadow-xl shadow-pink-400/15 hover:shadow-pink-500/30 hover:scale-[1.02] dark:from-amber-600/80 dark:to-amber-500/80 dark:hover:from-amber-500 dark:hover:to-amber-400 dark:shadow-amber-500/10"
//           >
//             {t.ctaButton}
//             <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
//           </a>

//           <div className="mt-12 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent dark:via-amber-400/15" />
//         </div>
//       </section>

//       {/* ═══════ LIGHTBOX ═══════ */}
//       <AnimatePresence>
//         {lightbox && (
//           <Lightbox
//             images={lightbox.images}
//             currentIndex={lightbox.index}
//             onClose={() => setLightbox(null)}
//             onChange={(i) =>
//               setLightbox((prev) => (prev ? { ...prev, index: i } : null))
//             }
//             locale={locale}
//           />
//         )}
//       </AnimatePresence>
//     </main>
//   );
// }