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

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function localeHref(path: string, locale: Locale) {
  if (locale === "de") return path;
  const hasQuery = path.includes("?");
  return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
}

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
      {/* Left Column */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-4"
      >
        {/* Badge */}
        <motion.p
          variants={fadeInLeft}
          className="inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-gray-900 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/50 dark:text-white"
        >
          <motion.span
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="h-4 w-4 text-gold-600" />
          </motion.span>
          {t("contacts_subtitle")}
        </motion.p>

        {/* Title */}
        <motion.h1
          variants={fadeInUp}
          className="font-playfair text-3xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-4xl"
        >
          {t("contacts_title")}
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeInUp}
          className="max-w-2xl text-sm leading-relaxed text-gray-800/80 dark:text-gray-300"
        >
          {t("contacts_intro")}
        </motion.p>

        {/* Quick Actions */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="!mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3"
        >
          {/* Phone - Primary */}
          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            href={`tel:${salon.phone.replace(/\s+/g, "")}`}
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-soft dark:bg-white dark:text-gray-950 sm:w-auto sm:justify-start"
          >
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-0 transition group-hover:opacity-100" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Phone className="h-4 w-4" />
            </motion.span>
            {t("contacts_quick_call")}
          </motion.a>

          {/* WhatsApp */}
          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-700 shadow-soft backdrop-blur transition hover:border-green-500/50 hover:bg-green-500/20 dark:border-green-400/30 dark:bg-green-500/10 dark:text-green-300 sm:w-auto sm:justify-start"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </motion.a>

          {/* Book */}
          <motion.div variants={staggerItem}>
            <Link
              href={localeHref("/booking", locale)}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto sm:justify-start"
            >
              {t("contacts_quick_book")}
              <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </Link>
          </motion.div>

          {/* Route */}
          <motion.a
            variants={staggerItem}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto sm:justify-start"
          >
            {t("contacts_quick_route")}
            <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Right Column - Contact Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInRight}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60"
      >
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,193,7,0.16),transparent_35%,rgba(236,72,153,0.10))] dark:bg-[linear-gradient(115deg,rgba(255,193,7,0.08),transparent_35%,rgba(56,189,248,0.06))]" />
        <div className="relative p-5 sm:p-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-200"
          >
            {t("contacts_details_title")}
          </motion.p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-4 space-y-3 text-sm text-gray-900/90 dark:text-gray-200"
          >
            {/* Address */}
            <motion.div variants={staggerItem} className="flex gap-3">
              <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="mt-0.5">
                <MapPin className="h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
              </motion.div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t("contacts_address_label")}
                </div>
                <div className="font-semibold">
                  {salon.streetAddress}, {salon.postalCode} {salon.addressLocality}
                </div>
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div variants={staggerItem} className="flex gap-3">
              <motion.div whileHover={{ scale: 1.2, rotate: -10 }} className="mt-0.5">
                <Phone className="h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
              </motion.div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t("contacts_phone_label")}
                </div>
                <a
                  className="font-semibold underline-offset-4 hover:underline"
                  href={`tel:${salon.phone.replace(/\s+/g, "")}`}
                >
                  {salon.phone}
                </a>
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={staggerItem} className="flex gap-3">
              <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="mt-0.5">
                <Mail className="h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
              </motion.div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t("contacts_email_label")}
                </div>
                <a
                  className="font-semibold underline-offset-4 hover:underline"
                  href={`mailto:${salon.email}`}
                >
                  {salon.email}
                </a>
              </div>
            </motion.div>

            {/* Hours */}
            <motion.div variants={staggerItem} className="flex gap-3">
              <motion.div
                whileHover={{ scale: 1.2 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mt-0.5"
              >
                <Clock className="h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
              </motion.div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t("contacts_hours_label")}
                </div>
                <div className="font-semibold">{t("contacts_hours_value")}</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2"
          >
            <motion.a
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href={mailtoLink}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-500 px-4 py-3 text-sm font-extrabold text-gray-950 shadow-soft dark:bg-gold-400 sm:w-auto"
            >
              <Mail className="h-4 w-4" />
              {t("contacts_form_send")}
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/85 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto"
            >
              {t("contacts_open_maps")}
              <ArrowUpRight className="h-4 w-4 opacity-70" />
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}



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