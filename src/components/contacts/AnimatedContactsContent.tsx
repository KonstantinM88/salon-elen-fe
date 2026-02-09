// src/components/contacts/AnimatedContactsContent.tsx
"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight,
  MessageCircle,
  Heart,
  Flower2,
} from "lucide-react";
import type { Locale } from "@/i18n/locales";
import { translate } from "@/i18n/messages";

type Props = {
  locale: Locale;
  salon: {
    name: string;
    streetAddress: string;
    postalCode: string;
    addressLocality: string;
    phone: string;
    email: string;
  };
  mapsUrl: string;
  mailtoLink: string;
  whatsappLink: string;
};

/* ── animation variants ── */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function localeHref(path: string, locale: Locale) {
  if (locale === "de") return path;
  const hasQuery = path.includes("?");
  return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
}

/* ── Contact info row ── */
function ContactRow({
  icon: Icon,
  label,
  children,
  continuousRotate,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  continuousRotate?: boolean;
}) {
  return (
    <motion.div variants={staggerItem} className="group flex gap-3.5 items-start">
      <motion.div
        whileHover={{ scale: 1.25, rotate: 10 }}
        {...(continuousRotate ? { animate: { rotate: 360 }, transition: { duration: 20, repeat: Infinity, ease: "linear" as const } } : {})}
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-100 to-rose-50 border border-pink-200/30 transition-colors group-hover:from-pink-200 group-hover:to-rose-100 dark:from-amber-500/15 dark:to-amber-600/5 dark:border-amber-500/15 dark:group-hover:from-amber-500/25"
      >
        <Icon className="h-4 w-4 text-pink-600 dark:text-amber-400" />
      </motion.div>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════ MAIN ═══════════════════════ */

export default function AnimatedContactsContent({
  locale,
  salon,
  mapsUrl,
  mailtoLink,
  whatsappLink,
}: Props) {
  const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);

  return (
    <div className="relative grid gap-6 p-5 sm:gap-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
      {/* ── Decorative floating elements (light only) ── */}
      <motion.div
        className="pointer-events-none absolute top-6 right-8 text-pink-300/20 dark:hidden"
        animate={{ y: [0, -8, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Flower2 className="h-8 w-8" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute bottom-10 left-10 text-rose-300/15 dark:hidden"
        animate={{ scale: [1, 1.2, 1], rotate: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <Heart className="h-6 w-6" />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute top-1/2 right-1/3 text-amber-300/15 dark:hidden"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="h-5 w-5" />
      </motion.div>

      {/* ═══════ LEFT COLUMN ═══════ */}
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-4">
        {/* Badge */}
        <motion.p
          variants={fadeInLeft}
          className="inline-flex items-center gap-2 rounded-full border border-pink-200/40 bg-white/80 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-rose-700 shadow-sm backdrop-blur dark:border-amber-500/20 dark:bg-gray-900/50 dark:text-amber-200"
        >
          <motion.span
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="h-4 w-4 text-pink-500 dark:text-amber-400" />
          </motion.span>
          {t("contacts_subtitle")}
        </motion.p>

        {/* Title */}
        <motion.h1
          variants={fadeInUp}
          className="font-playfair text-3xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-4xl"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-rose-800 to-gray-900 dark:from-white dark:via-amber-200 dark:to-white">
            {t("contacts_title")}
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeInUp}
          className="max-w-2xl text-sm leading-relaxed text-gray-700 dark:text-gray-300"
        >
          {t("contacts_intro")}
        </motion.p>

        {/* Quick Actions */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="!mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3"
        >
          {/* Phone – Primary CTA */}
          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            href={`tel:${salon.phone.replace(/\s+/g, "")}`}
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-pink-400/20 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/15 sm:w-auto sm:justify-start"
          >
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <motion.span
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Phone className="h-4 w-4" />
            </motion.span>
            {t("contacts_quick_call")}
          </motion.a>

          {/* WhatsApp */}
          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-green-400/40 bg-green-50/80 px-5 py-3.5 text-sm font-bold text-green-700 shadow-sm backdrop-blur transition hover:border-green-500/60 hover:bg-green-100/80 hover:shadow-md dark:border-green-400/30 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20 sm:w-auto sm:justify-start"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </motion.a>

          {/* Book */}
          <motion.div variants={staggerItem}>
            <Link
              href={localeHref("/booking", locale)}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-200/40 bg-white/90 px-5 py-3.5 text-sm font-bold text-gray-900 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-pink-300/60 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto sm:justify-start"
            >
              {t("contacts_quick_book")}
              <ArrowUpRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </Link>
          </motion.div>

          {/* Route */}
          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-200/40 bg-white/90 px-5 py-3.5 text-sm font-bold text-gray-900 shadow-sm backdrop-blur transition hover:border-pink-300/60 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto sm:justify-start"
          >
            {t("contacts_quick_route")}
            <ArrowUpRight className="h-4 w-4 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* ═══════ RIGHT COLUMN – Contact Details Card ═══════ */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInRight}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="group/card relative overflow-hidden rounded-3xl border border-pink-200/30 bg-white/90 shadow-lg shadow-pink-100/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-200/30 dark:border-white/10 dark:bg-gray-900/60 dark:shadow-none dark:hover:border-amber-500/20"
      >
        {/* Card background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-transparent to-rose-50/30 dark:from-amber-500/5 dark:via-transparent dark:to-purple-500/3" />

        {/* Animated accent line at top */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-400/60 to-transparent dark:via-amber-400/40"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="relative p-5 sm:p-6">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            >
              <MapPin className="h-4 w-4 text-pink-500 dark:text-amber-400" />
            </motion.div>
            <p className="text-xs font-bold uppercase tracking-widest text-rose-700/80 dark:text-amber-200/80">
              {t("contacts_details_title")}
            </p>
          </motion.div>

          {/* Contact rows */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-5 space-y-4"
          >
            {/* Address */}
            <ContactRow icon={MapPin} label={t("contacts_address_label")}>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="hover:text-pink-700 dark:hover:text-amber-300 transition-colors underline-offset-4 hover:underline">
                {salon.streetAddress}, {salon.postalCode} {salon.addressLocality}
              </a>
            </ContactRow>

            {/* Phone */}
            <ContactRow icon={Phone} label={t("contacts_phone_label")}>
              <a href={`tel:${salon.phone.replace(/\s+/g, "")}`} className="hover:text-pink-700 dark:hover:text-amber-300 transition-colors underline-offset-4 hover:underline">
                {salon.phone}
              </a>
            </ContactRow>

            {/* Email */}
            <ContactRow icon={Mail} label={t("contacts_email_label")}>
              <a href={`mailto:${salon.email}`} className="hover:text-pink-700 dark:hover:text-amber-300 transition-colors underline-offset-4 hover:underline">
                {salon.email}
              </a>
            </ContactRow>

            {/* Hours */}
            <ContactRow icon={Clock} label={t("contacts_hours_label")} continuousRotate>
              {t("contacts_hours_value")}
            </ContactRow>
          </motion.div>

          {/* Divider */}
          <div className="my-5 h-px bg-gradient-to-r from-transparent via-pink-200/50 to-transparent dark:via-white/10" />

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-2.5"
          >
            <motion.a
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href={mailtoLink}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-pink-300/20 transition-shadow hover:shadow-lg hover:shadow-pink-400/30 dark:from-amber-500 dark:to-amber-600 dark:text-gray-950 dark:shadow-amber-500/15 sm:w-auto"
            >
              <Mail className="h-4 w-4" />
              {t("contacts_form_send")}
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-pink-200/40 bg-white/90 px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm backdrop-blur transition hover:border-pink-300/60 dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto"
            >
              {t("contacts_open_maps")}
              <ArrowUpRight className="h-4 w-4 opacity-60" />
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}



//-----пробую улучшить анимацию для страницы контактов
// // src/components/contacts/AnimatedContactsContent.tsx
// "use client";

// import { motion, type Variants } from "framer-motion";
// import Link from "next/link";
// import {
//   Phone,
//   Mail,
//   MapPin,
//   Clock,
//   Sparkles,
//   ArrowUpRight,
//   MessageCircle,
// } from "lucide-react";
// import type { Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// type Props = {
//   locale: Locale;
//   salon: {
//     name: string;
//     streetAddress: string;
//     postalCode: string;
//     addressLocality: string;
//     phone: string;
//     email: string;
//   };
//   mapsUrl: string;
//   mailtoLink: string;
//   whatsappLink: string;
// };

// const fadeInUp: Variants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: { opacity: 1, y: 0 },
// };

// const fadeInLeft: Variants = {
//   hidden: { opacity: 0, x: -30 },
//   visible: { opacity: 1, x: 0 },
// };

// const fadeInRight: Variants = {
//   hidden: { opacity: 0, x: 30 },
//   visible: { opacity: 1, x: 0 },
// };

// const staggerContainer: Variants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//       delayChildren: 0.2,
//     },
//   },
// };

// const staggerItem: Variants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.5, ease: "easeOut" },
//   },
// };

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   const hasQuery = path.includes("?");
//   return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
// }

// export default function AnimatedContactsContent({
//   locale,
//   salon,
//   mapsUrl,
//   mailtoLink,
//   whatsappLink,
// }: Props) {
//   const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);

//   return (
//     <div className="relative grid gap-6 p-5 sm:gap-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
//       {/* Left Column */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={staggerContainer}
//         className="space-y-4"
//       >
//         {/* Badge */}
//         <motion.p
//           variants={fadeInLeft}
//           className="inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-gray-900 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/50 dark:text-white"
//         >
//           <motion.span
//             animate={{ rotate: [0, 15, -15, 0] }}
//             transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
//           >
//             <Sparkles className="h-4 w-4 text-gold-600" />
//           </motion.span>
//           {t("contacts_subtitle")}
//         </motion.p>

//         {/* Title */}
//         <motion.h1
//           variants={fadeInUp}
//           className="font-playfair text-3xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-4xl"
//         >
//           {t("contacts_title")}
//         </motion.h1>

//         {/* Description */}
//         <motion.p
//           variants={fadeInUp}
//           className="max-w-2xl text-sm leading-relaxed text-gray-800/80 dark:text-gray-300"
//         >
//           {t("contacts_intro")}
//         </motion.p>

//         {/* Quick Actions */}
//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           animate="visible"
//           className="!mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3"
//         >
//           {/* Phone - Primary */}
//           <motion.a
//             variants={staggerItem}
//             whileHover={{ scale: 1.02, y: -2 }}
//             whileTap={{ scale: 0.98 }}
//             href={`tel:${salon.phone.replace(/\s+/g, "")}`}
//             className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-soft dark:bg-white dark:text-gray-950 sm:w-auto sm:justify-start"
//           >
//             <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-0 transition group-hover:opacity-100" />
//             <motion.span
//               animate={{ scale: [1, 1.2, 1] }}
//               transition={{ duration: 1.5, repeat: Infinity }}
//             >
//               <Phone className="h-4 w-4" />
//             </motion.span>
//             {t("contacts_quick_call")}
//           </motion.a>

//           {/* WhatsApp */}
//           <motion.a
//             variants={staggerItem}
//             whileHover={{ scale: 1.02, y: -2 }}
//             whileTap={{ scale: 0.98 }}
//             href={whatsappLink}
//             target="_blank"
//             rel="noreferrer"
//             className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-700 shadow-soft backdrop-blur transition hover:border-green-500/50 hover:bg-green-500/20 dark:border-green-400/30 dark:bg-green-500/10 dark:text-green-300 sm:w-auto sm:justify-start"
//           >
//             <MessageCircle className="h-4 w-4" />
//             WhatsApp
//           </motion.a>

//           {/* Book */}
//           <motion.div variants={staggerItem}>
//             <Link
//               href={localeHref("/booking", locale)}
//               className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto sm:justify-start"
//             >
//               {t("contacts_quick_book")}
//               <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
//             </Link>
//           </motion.div>

//           {/* Route */}
//           <motion.a
//             variants={staggerItem}
//             whileHover={{ scale: 1.02, y: -2 }}
//             whileTap={{ scale: 0.98 }}
//             href={mapsUrl}
//             target="_blank"
//             rel="noreferrer"
//             className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto sm:justify-start"
//           >
//             {t("contacts_quick_route")}
//             <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
//           </motion.a>
//         </motion.div>
//       </motion.div>

//       {/* Right Column - Contact Card */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={fadeInRight}
//         transition={{ duration: 0.6, delay: 0.3 }}
//         className="relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60"
//       >
//         <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,193,7,0.16),transparent_35%,rgba(236,72,153,0.10))] dark:bg-[linear-gradient(115deg,rgba(255,193,7,0.08),transparent_35%,rgba(56,189,248,0.06))]" />
//         <div className="relative p-5 sm:p-6">
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5 }}
//             className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-200"
//           >
//             {t("contacts_details_title")}
//           </motion.p>

//           <motion.div
//             variants={staggerContainer}
//             initial="hidden"
//             animate="visible"
//             className="mt-4 space-y-3 text-sm text-gray-900/90 dark:text-gray-200"
//           >
//             {/* Address */}
//             <motion.div variants={staggerItem} className="flex gap-3">
//               <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="mt-0.5">
//                 <MapPin className="h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//               </motion.div>
//               <div>
//                 <div className="text-xs text-gray-600 dark:text-gray-400">
//                   {t("contacts_address_label")}
//                 </div>
//                 <div className="font-semibold">
//                   {salon.streetAddress}, {salon.postalCode} {salon.addressLocality}
//                 </div>
//               </div>
//             </motion.div>

//             {/* Phone */}
//             <motion.div variants={staggerItem} className="flex gap-3">
//               <motion.div whileHover={{ scale: 1.2, rotate: -10 }} className="mt-0.5">
//                 <Phone className="h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//               </motion.div>
//               <div>
//                 <div className="text-xs text-gray-600 dark:text-gray-400">
//                   {t("contacts_phone_label")}
//                 </div>
//                 <a
//                   className="font-semibold underline-offset-4 hover:underline"
//                   href={`tel:${salon.phone.replace(/\s+/g, "")}`}
//                 >
//                   {salon.phone}
//                 </a>
//               </div>
//             </motion.div>

//             {/* Email */}
//             <motion.div variants={staggerItem} className="flex gap-3">
//               <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="mt-0.5">
//                 <Mail className="h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//               </motion.div>
//               <div>
//                 <div className="text-xs text-gray-600 dark:text-gray-400">
//                   {t("contacts_email_label")}
//                 </div>
//                 <a
//                   className="font-semibold underline-offset-4 hover:underline"
//                   href={`mailto:${salon.email}`}
//                 >
//                   {salon.email}
//                 </a>
//               </div>
//             </motion.div>

//             {/* Hours */}
//             <motion.div variants={staggerItem} className="flex gap-3">
//               <motion.div
//                 whileHover={{ scale: 1.2 }}
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//                 className="mt-0.5"
//               >
//                 <Clock className="h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//               </motion.div>
//               <div>
//                 <div className="text-xs text-gray-600 dark:text-gray-400">
//                   {t("contacts_hours_label")}
//                 </div>
//                 <div className="font-semibold">{t("contacts_hours_value")}</div>
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* Action buttons */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.8 }}
//             className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2"
//           >
//             <motion.a
//               whileHover={{ scale: 1.02, y: -2 }}
//               whileTap={{ scale: 0.98 }}
//               href={mailtoLink}
//               className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-500 px-4 py-3 text-sm font-extrabold text-gray-950 shadow-soft dark:bg-gold-400 sm:w-auto"
//             >
//               <Mail className="h-4 w-4" />
//               {t("contacts_form_send")}
//             </motion.a>

//             <motion.a
//               whileHover={{ scale: 1.02, y: -2 }}
//               whileTap={{ scale: 0.98 }}
//               href={mapsUrl}
//               target="_blank"
//               rel="noreferrer"
//               className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/85 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto"
//             >
//               {t("contacts_open_maps")}
//               <ArrowUpRight className="h-4 w-4 opacity-70" />
//             </motion.a>
//           </motion.div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }



//---------изменён цвет текста для файла с анимацией--------
// // src/components/contacts/AnimatedContactsContent.tsx
// "use client";

// import { motion, type Variants } from "framer-motion";
// import Link from "next/link";
// import {
//   Phone,
//   Mail,
//   MapPin,
//   Clock,
//   Sparkles,
//   ArrowUpRight,
//   MessageCircle,
// } from "lucide-react";
// import type { Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// type Props = {
//   locale: Locale;
//   salon: {
//     name: string;
//     streetAddress: string;
//     postalCode: string;
//     addressLocality: string;
//     phone: string;
//     email: string;
//   };
//   mapsUrl: string;
//   mailtoLink: string;
//   whatsappLink: string;
// };

// const fadeInUp: Variants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: { opacity: 1, y: 0 },
// };

// const fadeInLeft: Variants = {
//   hidden: { opacity: 0, x: -30 },
//   visible: { opacity: 1, x: 0 },
// };

// const fadeInRight: Variants = {
//   hidden: { opacity: 0, x: 30 },
//   visible: { opacity: 1, x: 0 },
// };

// const staggerContainer: Variants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//       delayChildren: 0.2,
//     },
//   },
// };

// const staggerItem: Variants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.5, ease: "easeOut" },
//   },
// };

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   const hasQuery = path.includes("?");
//   return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
// }

// export default function AnimatedContactsContent({
//   locale,
//   salon,
//   mapsUrl,
//   mailtoLink,
//   whatsappLink,
// }: Props) {
//   const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);

//   return (
//     <div className="relative grid gap-6 p-5 sm:gap-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
//       {/* Left Column */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={staggerContainer}
//         className="space-y-4"
//       >
//         {/* Badge */}
//         <motion.p
//           variants={fadeInLeft}
//           className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-soft backdrop-blur"
//         >
//           <motion.span
//             animate={{ rotate: [0, 15, -15, 0] }}
//             transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
//           >
//             <Sparkles className="h-4 w-4 text-gold-400" />
//           </motion.span>
//           {t("contacts_subtitle")}
//         </motion.p>

//         {/* Title */}
//         <motion.h1
//           variants={fadeInUp}
//           className="font-playfair text-3xl font-semibold tracking-tight text-white sm:text-4xl"
//         >
//           {t("contacts_title")}
//         </motion.h1>

//         {/* Description */}
//         <motion.p variants={fadeInUp} className="max-w-2xl text-sm leading-relaxed text-white/80">
//           {t("contacts_intro")}
//         </motion.p>

//         {/* Quick Actions */}
//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           animate="visible"
//           className="!mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3"
//         >
//           {/* Phone - Primary */}
//           <motion.a
//             variants={staggerItem}
//             whileHover={{ scale: 1.02, y: -2 }}
//             whileTap={{ scale: 0.98 }}
//             href={`tel:${salon.phone.replace(/\s+/g, "")}`}
//             className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft sm:w-auto sm:justify-start"
//           >
//             <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,transparent,rgba(255,193,7,0.35),transparent)] opacity-0 transition group-hover:opacity-100" />
//             <motion.span
//               animate={{ scale: [1, 1.2, 1] }}
//               transition={{ duration: 1.5, repeat: Infinity }}
//             >
//               <Phone className="h-4 w-4" />
//             </motion.span>
//             {t("contacts_quick_call")}
//           </motion.a>

//           {/* WhatsApp */}
//           <motion.a
//             variants={staggerItem}
//             whileHover={{ scale: 1.02, y: -2 }}
//             whileTap={{ scale: 0.98 }}
//             href={whatsappLink}
//             target="_blank"
//             rel="noreferrer"
//             className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-green-400/50 bg-green-500/20 px-4 py-3 text-sm font-semibold text-green-300 shadow-soft backdrop-blur transition hover:border-green-400 hover:bg-green-500/30 sm:w-auto sm:justify-start"
//           >
//             <MessageCircle className="h-4 w-4" />
//             WhatsApp
//           </motion.a>

//           {/* Book */}
//           <motion.div variants={staggerItem}>
//             <Link
//               href={localeHref("/booking", locale)}
//               className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-md sm:w-auto sm:justify-start"
//             >
//               {t("contacts_quick_book")}
//               <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
//             </Link>
//           </motion.div>

//           {/* Route */}
//           <motion.a
//             variants={staggerItem}
//             whileHover={{ scale: 1.02, y: -2 }}
//             whileTap={{ scale: 0.98 }}
//             href={mapsUrl}
//             target="_blank"
//             rel="noreferrer"
//             className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-soft backdrop-blur transition hover:bg-white/20 sm:w-auto sm:justify-start"
//           >
//             {t("contacts_quick_route")}
//             <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
//           </motion.a>
//         </motion.div>
//       </motion.div>

//       {/* Right Column - Contact Card */}
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         variants={fadeInRight}
//         transition={{ duration: 0.6, delay: 0.3 }}
//         className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-md"
//       >
//         <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 via-transparent to-pink-500/10" />
//         <div className="relative p-5 sm:p-6">
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5 }}
//             className="text-xs font-bold uppercase tracking-widest text-white/80"
//           >
//             {t("contacts_details_title")}
//           </motion.p>

//           <motion.div
//             variants={staggerContainer}
//             initial="hidden"
//             animate="visible"
//             className="mt-4 space-y-3 text-sm text-white/90"
//           >
//             {/* Address */}
//             <motion.div variants={staggerItem} className="flex gap-3">
//               <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="mt-0.5">
//                 <MapPin className="h-4 w-4 shrink-0 text-gold-400" />
//               </motion.div>
//               <div>
//                 <div className="text-xs text-white/60">{t("contacts_address_label")}</div>
//                 <div className="font-semibold text-white">
//                   {salon.streetAddress}, {salon.postalCode} {salon.addressLocality}
//                 </div>
//               </div>
//             </motion.div>

//             {/* Phone */}
//             <motion.div variants={staggerItem} className="flex gap-3">
//               <motion.div whileHover={{ scale: 1.2, rotate: -10 }} className="mt-0.5">
//                 <Phone className="h-4 w-4 shrink-0 text-gold-400" />
//               </motion.div>
//               <div>
//                 <div className="text-xs text-white/60">{t("contacts_phone_label")}</div>
//                 <a
//                   className="font-semibold text-white underline-offset-4 hover:underline"
//                   href={`tel:${salon.phone.replace(/\s+/g, "")}`}
//                 >
//                   {salon.phone}
//                 </a>
//               </div>
//             </motion.div>

//             {/* Email */}
//             <motion.div variants={staggerItem} className="flex gap-3">
//               <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="mt-0.5">
//                 <Mail className="h-4 w-4 shrink-0 text-gold-400" />
//               </motion.div>
//               <div>
//                 <div className="text-xs text-white/60">{t("contacts_email_label")}</div>
//                 <a
//                   className="font-semibold text-white underline-offset-4 hover:underline"
//                   href={`mailto:${salon.email}`}
//                 >
//                   {salon.email}
//                 </a>
//               </div>
//             </motion.div>

//             {/* Hours */}
//             <motion.div variants={staggerItem} className="flex gap-3">
//               <motion.div
//                 whileHover={{ scale: 1.2 }}
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//                 className="mt-0.5"
//               >
//                 <Clock className="h-4 w-4 shrink-0 text-gold-400" />
//               </motion.div>
//               <div>
//                 <div className="text-xs text-white/60">{t("contacts_hours_label")}</div>
//                 <div className="font-semibold text-white">{t("contacts_hours_value")}</div>
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* Action buttons */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.8 }}
//             className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2"
//           >
//             <motion.a
//               whileHover={{ scale: 1.02, y: -2 }}
//               whileTap={{ scale: 0.98 }}
//               href={mailtoLink}
//               className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-500 px-4 py-3 text-sm font-extrabold text-gray-950 shadow-soft sm:w-auto"
//             >
//               <Mail className="h-4 w-4" />
//               {t("contacts_form_send")}
//             </motion.a>

//             <motion.a
//               whileHover={{ scale: 1.02, y: -2 }}
//               whileTap={{ scale: 0.98 }}
//               href={mapsUrl}
//               target="_blank"
//               rel="noreferrer"
//               className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-soft backdrop-blur sm:w-auto"
//             >
//               {t("contacts_open_maps")}
//               <ArrowUpRight className="h-4 w-4 opacity-70" />
//             </motion.a>
//           </motion.div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }