// src/components/contacts/AnimatedContactCards.tsx
"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  ArrowUpRight,
  MessageCircle,
  Send,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { Locale } from "@/i18n/locales";
import { translate } from "@/i18n/messages";

type Props = {
  locale: Locale;
  salon: { phone: string; email: string };
  mailtoLink: string;
  whatsappLink: string;
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function localeHref(path: string, locale: Locale) {
  if (locale === "de") return path;
  const hasQuery = path.includes("?");
  return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
}

export default function AnimatedContactCards({
  locale,
  salon,
  mailtoLink,
  whatsappLink,
}: Props) {
  const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="space-y-4">
      {/* ── Email Card ── */}
      <motion.a
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={cardVariants}
        transition={{ delay: 0 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        href={mailtoLink}
        className="group relative flex items-center gap-4 rounded-2xl border border-pink-200/30 bg-white/95 p-4 shadow-md shadow-pink-100/15 transition-all duration-300 hover:border-pink-300/50 hover:shadow-lg hover:shadow-pink-200/25 dark:border-white/10 dark:bg-gray-950/40 dark:shadow-none dark:hover:border-amber-500/20"
      >
        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-50/40 via-transparent to-rose-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-400 dark:from-amber-500/3 dark:to-transparent" />

        <motion.div
          whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.15 }}
          transition={{ duration: 0.5 }}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-rose-50 text-pink-600 border border-pink-200/30 shadow-sm dark:from-amber-500/20 dark:to-amber-600/10 dark:text-amber-300 dark:border-amber-500/15"
        >
          <Mail className="h-5 w-5" />
          {/* Subtle pulse ring */}
          <div className="absolute inset-0 rounded-xl border border-pink-300/30 animate-ping dark:border-amber-400/20" style={{ animationDuration: "3s" }} />
        </motion.div>
        <div className="relative flex-1 min-w-0">
          <div className="font-bold text-gray-900 dark:text-white">E-Mail</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{salon.email}</div>
        </div>
        <motion.div
          className="relative"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Send className="h-5 w-5 text-pink-400/60 transition-colors group-hover:text-pink-600 dark:text-gray-500 dark:group-hover:text-amber-400" />
        </motion.div>
      </motion.a>

      {/* ── Phone Card ── */}
      <motion.a
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={cardVariants}
        transition={{ delay: 0.12 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        href={`tel:${salon.phone.replace(/\s+/g, "")}`}
        className="group relative flex items-center gap-4 rounded-2xl border border-pink-200/30 bg-white/95 p-4 shadow-md shadow-pink-100/15 transition-all duration-300 hover:border-blue-300/40 hover:shadow-lg hover:shadow-blue-100/20 dark:border-white/10 dark:bg-gray-950/40 dark:shadow-none dark:hover:border-blue-500/20"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 dark:from-blue-500/3" />

        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-sky-50 text-blue-600 border border-blue-200/30 shadow-sm dark:from-blue-500/20 dark:to-blue-600/10 dark:text-blue-300 dark:border-blue-500/15"
        >
          <Phone className="h-5 w-5" />
        </motion.div>
        <div className="relative flex-1 min-w-0">
          <div className="font-bold text-gray-900 dark:text-white">{t("contacts_phone_label")}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{salon.phone}</div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-blue-400/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600 dark:text-gray-500 dark:group-hover:text-blue-400" />
      </motion.a>

      {/* ── WhatsApp Card ── */}
      <motion.a
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={cardVariants}
        transition={{ delay: 0.24 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center gap-4 rounded-2xl border-2 border-green-300/30 bg-green-50/60 p-4 shadow-sm transition-all duration-300 hover:border-green-400/60 hover:bg-green-50/90 hover:shadow-md hover:shadow-green-200/20 dark:border-green-400/25 dark:bg-green-500/5 dark:hover:border-green-400/40 dark:hover:bg-green-500/10"
      >
        <motion.div
          whileHover={{ scale: 1.15, rotate: 10 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-200/80 to-emerald-100/60 text-green-700 border border-green-300/30 dark:from-green-500/20 dark:to-green-600/10 dark:text-green-300 dark:border-green-500/15"
        >
          <MessageCircle className="h-5 w-5" />
        </motion.div>
        <div className="flex-1">
          <div className="font-bold text-gray-900 dark:text-white">WhatsApp</div>
          <div className="text-sm text-green-700/70 dark:text-green-400/80">
            {locale === "de" ? "Schnelle Antwort" : locale === "en" ? "Quick reply" : "\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u043E\u0442\u0432\u0435\u0442"}
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-green-400/50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-green-600 dark:text-gray-500 dark:group-hover:text-green-400" />
      </motion.a>

      {/* ── Booking CTA Card ── */}
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={cardVariants}
        transition={{ delay: 0.36 }}
        className="relative overflow-hidden rounded-2xl border border-pink-300/30 bg-gradient-to-r from-pink-50/80 via-rose-50/60 to-amber-50/40 p-5 shadow-md shadow-pink-100/15 dark:border-amber-500/20 dark:from-amber-500/8 dark:via-amber-500/4 dark:to-transparent dark:shadow-none"
      >
        {/* Decorative sparkle */}
        <motion.div
          className="absolute top-3 right-3 text-pink-300/30 dark:text-amber-400/20"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        >
          <Sparkles className="h-5 w-5" />
        </motion.div>

        <p className="text-sm font-semibold text-gray-900 dark:text-white pr-8">
          {locale === "de"
            ? "M\u00F6chten Sie direkt einen Termin buchen?"
            : locale === "en"
              ? "Want to book an appointment directly?"
              : "\u0425\u043E\u0442\u0438\u0442\u0435 \u0437\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F \u043D\u0430 \u043F\u0440\u0438\u0451\u043C?"}
        </p>

        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
          <Link
            href={localeHref("/booking", locale)}
            className="group mt-3 inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-pink-400/20 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/30 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/15"
          >
            {t("contacts_quick_book")}
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}



//--------пробую улучшить контакты добавляю анимацию --- IGNORE ---
// "use client";

// import { motion, useInView, type Variants } from "framer-motion";
// import { useRef } from "react";
// import Link from "next/link";
// import {
//   Phone,
//   Mail,
//   ArrowUpRight,
//   MessageCircle,
//   Send,
// } from "lucide-react";
// import type { Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// type Props = {
//   locale: Locale;
//   salon: {
//     phone: string;
//     email: string;
//   };
//   mailtoLink: string;
//   whatsappLink: string;
// };

// const cardVariants: Variants = {
//   hidden: { opacity: 0, y: 40, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: {
//       duration: 0.5,
//       ease: [0.25, 0.46, 0.45, 0.94],
//     },
//   },
// };

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   const hasQuery = path.includes("?");
//   return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
// }

// export default function AnimatedContactCards({
//   locale,
//   salon,
//   mailtoLink,
//   whatsappLink,
// }: Props) {
//   const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, margin: "-100px" });

//   return (
//     <div ref={ref} className="space-y-4">
//       {/* Email Card */}
//       <motion.a
//         initial="hidden"
//         animate={isInView ? "visible" : "hidden"}
//         variants={cardVariants}
//         transition={{ delay: 0 }}
//         whileHover={{ scale: 1.02, y: -4 }}
//         whileTap={{ scale: 0.98 }}
//         href={mailtoLink}
//         className="group flex items-center gap-4 rounded-2xl border border-gray-900/10 bg-white/90 p-4 shadow-soft transition dark:border-white/10 dark:bg-gray-950/40"
//       >
//         <motion.div
//           whileHover={{ rotate: [0, -10, 10, 0] }}
//           transition={{ duration: 0.5 }}
//           className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-500/20 text-gold-700 dark:bg-gold-400/20 dark:text-gold-300"
//         >
//           <Mail className="h-5 w-5" />
//         </motion.div>
//         <div className="flex-1">
//           <div className="font-semibold text-gray-950 dark:text-white">E-Mail</div>
//           <div className="text-sm text-gray-600 dark:text-gray-400">{salon.email}</div>
//         </div>
//         <Send className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-gold-600" />
//       </motion.a>

//       {/* Phone Card */}
//       <motion.a
//         initial="hidden"
//         animate={isInView ? "visible" : "hidden"}
//         variants={cardVariants}
//         transition={{ delay: 0.15 }}
//         whileHover={{ scale: 1.02, y: -4 }}
//         whileTap={{ scale: 0.98 }}
//         href={`tel:${salon.phone.replace(/\s+/g, "")}`}
//         className="group flex items-center gap-4 rounded-2xl border border-gray-900/10 bg-white/90 p-4 shadow-soft transition dark:border-white/10 dark:bg-gray-950/40"
//       >
//         <motion.div
//           animate={{ 
//             scale: [1, 1.1, 1],
//             rotate: [0, 5, -5, 0]
//           }}
//           transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
//           className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300"
//         >
//           <Phone className="h-5 w-5" />
//         </motion.div>
//         <div className="flex-1">
//           <div className="font-semibold text-gray-950 dark:text-white">{t("contacts_phone_label")}</div>
//           <div className="text-sm text-gray-600 dark:text-gray-400">{salon.phone}</div>
//         </div>
//         <ArrowUpRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600" />
//       </motion.a>

//       {/* WhatsApp Card */}
//       <motion.a
//         initial="hidden"
//         animate={isInView ? "visible" : "hidden"}
//         variants={cardVariants}
//         transition={{ delay: 0.3 }}
//         whileHover={{ scale: 1.02, y: -4 }}
//         whileTap={{ scale: 0.98 }}
//         href={whatsappLink}
//         target="_blank"
//         rel="noreferrer"
//         className="group flex items-center gap-4 rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-4 shadow-soft transition hover:border-green-500/50 hover:bg-green-500/10 dark:border-green-400/30 dark:bg-green-500/5"
//       >
//         <motion.div
//           whileHover={{ scale: 1.1 }}
//           className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/20 text-green-700 dark:bg-green-400/20 dark:text-green-300"
//         >
//           <MessageCircle className="h-5 w-5" />
//         </motion.div>
//         <div className="flex-1">
//           <div className="font-semibold text-gray-950 dark:text-white">WhatsApp</div>
//           <div className="text-sm text-gray-600 dark:text-gray-400">
//             {locale === "de" ? "Schnelle Antwort" : locale === "en" ? "Quick reply" : "Быстрый ответ"}
//           </div>
//         </div>
//         <ArrowUpRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-green-600" />
//       </motion.a>

//       {/* Book CTA */}
//       <motion.div
//         initial="hidden"
//         animate={isInView ? "visible" : "hidden"}
//         variants={cardVariants}
//         transition={{ delay: 0.45 }}
//         className="rounded-2xl border border-gold-500/30 bg-gradient-to-r from-gold-500/10 via-gold-500/5 to-transparent p-4 dark:border-gold-400/30"
//       >
//         <p className="text-sm font-medium text-gray-900 dark:text-white">
//           {locale === "de"
//             ? "Möchten Sie direkt einen Termin buchen?"
//             : locale === "en"
//               ? "Want to book an appointment directly?"
//               : "Хотите записаться на приём?"}
//         </p>
//         <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
//           <Link
//             href={localeHref("/booking", locale)}
//             className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-bold text-gray-950 shadow-soft transition hover:shadow-md dark:bg-gold-400"
//           >
//             {t("contacts_quick_book")}
//             <motion.span
//               animate={{ x: [0, 3, 0] }}
//               transition={{ duration: 1.5, repeat: Infinity }}
//             >
//               <ArrowUpRight className="h-4 w-4" />
//             </motion.span>
//           </Link>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }