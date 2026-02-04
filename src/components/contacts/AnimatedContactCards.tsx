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
} from "lucide-react";
import type { Locale } from "@/i18n/locales";
import { translate } from "@/i18n/messages";

type Props = {
  locale: Locale;
  salon: {
    phone: string;
    email: string;
  };
  mailtoLink: string;
  whatsappLink: string;
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
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
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="space-y-4">
      {/* Email Card */}
      <motion.a
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={cardVariants}
        transition={{ delay: 0 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        href={mailtoLink}
        className="group flex items-center gap-4 rounded-2xl border border-gray-900/10 bg-white/90 p-4 shadow-soft transition dark:border-white/10 dark:bg-gray-950/40"
      >
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-500/20 text-gold-700 dark:bg-gold-400/20 dark:text-gold-300"
        >
          <Mail className="h-5 w-5" />
        </motion.div>
        <div className="flex-1">
          <div className="font-semibold text-gray-950 dark:text-white">E-Mail</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{salon.email}</div>
        </div>
        <Send className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-gold-600" />
      </motion.a>

      {/* Phone Card */}
      <motion.a
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={cardVariants}
        transition={{ delay: 0.15 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        href={`tel:${salon.phone.replace(/\s+/g, "")}`}
        className="group flex items-center gap-4 rounded-2xl border border-gray-900/10 bg-white/90 p-4 shadow-soft transition dark:border-white/10 dark:bg-gray-950/40"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300"
        >
          <Phone className="h-5 w-5" />
        </motion.div>
        <div className="flex-1">
          <div className="font-semibold text-gray-950 dark:text-white">{t("contacts_phone_label")}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{salon.phone}</div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600" />
      </motion.a>

      {/* WhatsApp Card */}
      <motion.a
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={cardVariants}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-4 rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-4 shadow-soft transition hover:border-green-500/50 hover:bg-green-500/10 dark:border-green-400/30 dark:bg-green-500/5"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/20 text-green-700 dark:bg-green-400/20 dark:text-green-300"
        >
          <MessageCircle className="h-5 w-5" />
        </motion.div>
        <div className="flex-1">
          <div className="font-semibold text-gray-950 dark:text-white">WhatsApp</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {locale === "de" ? "Schnelle Antwort" : locale === "en" ? "Quick reply" : "Быстрый ответ"}
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-green-600" />
      </motion.a>

      {/* Book CTA */}
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={cardVariants}
        transition={{ delay: 0.45 }}
        className="rounded-2xl border border-gold-500/30 bg-gradient-to-r from-gold-500/10 via-gold-500/5 to-transparent p-4 dark:border-gold-400/30"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {locale === "de"
            ? "Möchten Sie direkt einen Termin buchen?"
            : locale === "en"
              ? "Want to book an appointment directly?"
              : "Хотите записаться на приём?"}
        </p>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
          <Link
            href={localeHref("/booking", locale)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-bold text-gray-950 shadow-soft transition hover:shadow-md dark:bg-gold-400"
          >
            {t("contacts_quick_book")}
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowUpRight className="h-4 w-4" />
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}