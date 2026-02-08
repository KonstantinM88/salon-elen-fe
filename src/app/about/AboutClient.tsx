// src/app/about/AboutClient.tsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from "framer-motion";
import {
  Award,
  Heart,
  Sparkles,
  Star,
  Calendar,
  Shield,
  ChevronRight,
  Quote,
  Gem,
  Eye,
  Hand,
  Footprints,
  Flower2,
  Scissors,
} from "lucide-react";
import type { Locale } from "@/i18n/locales";

/* ─────────────────────── i18n content ─────────────────────── */

const content: Record<
  Locale,
  {
    heroTitle: string;
    heroSubtitle: string;
    philosophyQuote: string;
    storyTitle: string;
    storyParagraphs: string[];
    servicesTitle: string;
    services: { icon: string; title: string; description: string }[];
    valuesTitle: string;
    values: { title: string; description: string }[];
    certificatesTitle: string;
    certificatesSubtitle: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton: string;
    since: string;
    experience: string;
    quality: string;
  }
> = {
  de: {
    heroTitle: "Elena",
    heroSubtitle: "Ihre Spezialistin f\u00FCr nat\u00FCrliche Sch\u00F6nheit",
    philosophyQuote:
      "Sch\u00F6nheit beginnt dort, wo wir uns selbst annehmen.",
    storyTitle: "Mein Weg",
    storyParagraphs: [
      "Menschen auf diesem Weg zu begleiten, ihre nat\u00FCrliche Ausstrahlung zu unterstreichen und sich in ihrer Haut wirklich wohlzuf\u00FChlen \u2013 das ist meine Herzensangelegenheit.",
      "Meine fachliche Basis habe ich in Gie\u00DFen im renommierten Salon \u201ESch\u00E4fer\u201C gelegt, wo ich meine Ausbildung zur Permanent Make-up Artistin absolvierte. Erg\u00E4nzend dazu habe ich mich bei CNI zur Nageldesignerin weitergebildet und mein Wissen im Bereich moderner Gel-Systeme vertieft.",
      "Mit der Er\u00F6ffnung meines eigenen Salons im Jahr 2014 habe ich mir einen gro\u00DFen Lebenstraum erf\u00FCllt: einen Ort zu schaffen, an dem Menschen ankommen d\u00FCrfen, sich gesehen f\u00FChlen und Zeit nur f\u00FCr sich haben.",
      "Ob Permanent Make-up, Microneedling, Nageldesign, Wimpernverl\u00E4ngerung oder Fu\u00DFpflege \u2013 jede Behandlung ist so individuell wie der Mensch selbst. Ich nehme mir Zeit, h\u00F6re zu und berate ehrlich und transparent. Sorgfalt, Feingef\u00FChl und Vertrauen stehen f\u00FCr mich an erster Stelle.",
      "Ich arbeite nach aktuellen fachlichen Standards und verwende ausschlie\u00DFlich hochwertige, exklusive Produkte und moderne Techniken, von deren Qualit\u00E4t ich \u00FCberzeugt bin.",
    ],
    servicesTitle: "Meine Expertise",
    services: [
      { icon: "eye", title: "Permanent Make-up", description: "Professionelle Pigmentierung f\u00FCr nat\u00FCrlich betonte Augenbrauen, Lippen und Lidstriche" },
      { icon: "sparkles", title: "Microneedling", description: "Hautverj\u00FCngung und Kollagenbildung durch modernste Nadeltherapie" },
      { icon: "hand", title: "Nageldesign", description: "Kreatives Nageldesign mit hochwertigen Gel-Systemen f\u00FCr perfekte N\u00E4gel" },
      { icon: "star", title: "Wimpernverl\u00E4ngerung", description: "Individuelle Wimpernverl\u00E4ngerung f\u00FCr einen ausdrucksstarken Blick" },
      { icon: "footprints", title: "Fu\u00DFpflege", description: "Professionelle Fu\u00DFpflege f\u00FCr gesunde und gepflegte F\u00FC\u00DFe" },
    ],
    valuesTitle: "Meine Werte",
    values: [
      { title: "Individualit\u00E4t", description: "Jede Behandlung wird pers\u00F6nlich auf Sie abgestimmt" },
      { title: "Qualit\u00E4t", description: "Ausschlie\u00DFlich hochwertige, exklusive Produkte" },
      { title: "Vertrauen", description: "Ehrliche, transparente Beratung in jeder Situation" },
      { title: "Sorgfalt", description: "Feingef\u00FChl und Pr\u00E4zision bei jeder Behandlung" },
    ],
    certificatesTitle: "Zertifikate & Qualifikationen",
    certificatesSubtitle: "St\u00E4ndige Weiterbildung und gepr\u00FCfte Fachkompetenz",
    ctaTitle: "Ich lade Sie herzlich ein",
    ctaText: "Besuchen Sie meinen Salon und vereinbaren Sie ein unverbindliches, selbstverst\u00E4ndlich kostenfreies Beratungsgespr\u00E4ch. Ich freue mich darauf, Sie kennenzulernen.",
    ctaButton: "Termin vereinbaren",
    since: "Seit 2014",
    experience: "10+ Jahre Erfahrung",
    quality: "Gepr\u00FCfte Qualit\u00E4t",
  },
  en: {
    heroTitle: "Elena",
    heroSubtitle: "Your specialist for natural beauty",
    philosophyQuote: "True beauty begins with feeling comfortable in your own skin.",
    storyTitle: "My Journey",
    storyParagraphs: [
      "Supporting people on this journey, highlighting their natural radiance and helping them feel confident and at ease \u2013 this is what truly fulfills me.",
      "My professional journey began in Gie\u00DFen at the renowned \"Sch\u00E4fer\" salon, where I completed my training as a Permanent Make-up Artist. I later expanded my expertise with a professional education as a Nail Designer at CNI, specializing in modern gel systems.",
      "Opening my own salon in 2014 was a dream come true. I wanted to create a place where people feel welcome, understood and cared for \u2013 a space dedicated to quality, time and genuine human connection.",
      "Whether it's permanent make-up, microneedling, nail design, eyelash extensions or foot care, every treatment is tailored to your individual needs. I take the time to listen, offer honest advice and work with precision and care.",
      "I continuously develop my skills and work with high-quality, exclusive products and modern techniques that I truly trust.",
    ],
    servicesTitle: "My Expertise",
    services: [
      { icon: "eye", title: "Permanent Make-up", description: "Professional pigmentation for naturally enhanced eyebrows, lips and eyeliner" },
      { icon: "sparkles", title: "Microneedling", description: "Skin rejuvenation and collagen stimulation through advanced needle therapy" },
      { icon: "hand", title: "Nail Design", description: "Creative nail design with premium gel systems for perfect nails" },
      { icon: "star", title: "Eyelash Extensions", description: "Individual eyelash extensions for an expressive look" },
      { icon: "footprints", title: "Foot Care", description: "Professional foot care for healthy and well-groomed feet" },
    ],
    valuesTitle: "My Values",
    values: [
      { title: "Individuality", description: "Every treatment is personally tailored to you" },
      { title: "Quality", description: "Exclusively high-quality, premium products" },
      { title: "Trust", description: "Honest, transparent advice in every situation" },
      { title: "Precision", description: "Care and precision in every treatment" },
    ],
    certificatesTitle: "Certificates & Qualifications",
    certificatesSubtitle: "Continuous education and certified expertise",
    ctaTitle: "You are warmly invited",
    ctaText: "Visit my salon and book a complimentary, no-obligation consultation. I look forward to welcoming you in person.",
    ctaButton: "Book appointment",
    since: "Since 2014",
    experience: "10+ years experience",
    quality: "Certified quality",
  },
  ru: {
    heroTitle: "\u0415\u043B\u0435\u043D\u0430",
    heroSubtitle: "\u0412\u0430\u0448 \u0441\u043F\u0435\u0446\u0438\u0430\u043B\u0438\u0441\u0442 \u043F\u043E \u043D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u043E\u0439 \u043A\u0440\u0430\u0441\u043E\u0442\u0435",
    philosophyQuote: "\u041D\u0430\u0441\u0442\u043E\u044F\u0449\u0430\u044F \u043A\u0440\u0430\u0441\u043E\u0442\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0441 \u043F\u0440\u0438\u043D\u044F\u0442\u0438\u044F \u0441\u0435\u0431\u044F.",
    storyTitle: "\u041C\u043E\u0439 \u043F\u0443\u0442\u044C",
    storyParagraphs: [
      "\u041F\u043E\u043C\u043E\u0433\u0430\u0442\u044C \u043B\u044E\u0434\u044F\u043C \u0440\u0430\u0441\u043A\u0440\u044B\u0432\u0430\u0442\u044C \u0441\u0432\u043E\u044E \u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u0443\u044E \u043F\u0440\u0438\u0432\u043B\u0435\u043A\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C, \u0447\u0443\u0432\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0438 \u043A\u043E\u043C\u0444\u043E\u0440\u0442 \u0432 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u043C \u0442\u0435\u043B\u0435 \u2014 \u044D\u0442\u043E \u0434\u0435\u043B\u043E \u043C\u043E\u0435\u0433\u043E \u0441\u0435\u0440\u0434\u0446\u0430.",
      "\u041C\u043E\u0439 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u043D\u0430\u0447\u0430\u043B\u0441\u044F \u0432 \u0433\u043E\u0440\u043E\u0434\u0435 \u0413\u0438\u0441\u0435\u043D, \u0432 \u043E\u0434\u043D\u043E\u043C \u0438\u0437 \u0441\u0430\u043C\u044B\u0445 \u0443\u0432\u0430\u0436\u0430\u0435\u043C\u044B\u0445 \u0441\u0430\u043B\u043E\u043D\u043E\u0432 \u2014 \u00ABSch\u00E4fer\u00BB, \u0433\u0434\u0435 \u044F \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0430 \u043A\u0432\u0430\u043B\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044E \u043C\u0430\u0441\u0442\u0435\u0440\u0430 \u043F\u0435\u0440\u043C\u0430\u043D\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u043C\u0430\u043A\u0438\u044F\u0436\u0430. \u041F\u043E\u0437\u0434\u043D\u0435\u0435 \u044F \u043F\u0440\u043E\u0448\u043B\u0430 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u0435 \u043A\u0430\u043A nail-\u0434\u0438\u0437\u0430\u0439\u043D\u0435\u0440 \u0432 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438 CNI, \u0443\u0433\u043B\u0443\u0431\u0438\u0432 \u0437\u043D\u0430\u043D\u0438\u044F \u0432 \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 \u0433\u0435\u043B\u0435\u0432\u044B\u0445 \u0441\u0438\u0441\u0442\u0435\u043C\u0430\u0445.",
      "\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u0441\u0430\u043B\u043E\u043D\u0430 \u0432 2014 \u0433\u043E\u0434\u0443 \u0441\u0442\u0430\u043B\u043E \u0438\u0441\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435\u043C \u043C\u043E\u0435\u0439 \u043C\u0435\u0447\u0442\u044B \u2014 \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E, \u0433\u0434\u0435 \u043A\u0430\u0436\u0434\u044B\u0439 \u0447\u0435\u043B\u043E\u0432\u0435\u043A \u0447\u0443\u0432\u0441\u0442\u0432\u0443\u0435\u0442 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435, \u0437\u0430\u0431\u043E\u0442\u0443 \u0438 \u043C\u043E\u0436\u0435\u0442 \u043F\u043E-\u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u043C\u0443 \u0440\u0430\u0441\u0441\u043B\u0430\u0431\u0438\u0442\u044C\u0441\u044F.",
      "\u041F\u0435\u0440\u043C\u0430\u043D\u0435\u043D\u0442\u043D\u044B\u0439 \u043C\u0430\u043A\u0438\u044F\u0436, \u043C\u0438\u043A\u0440\u043E\u043D\u0438\u0434\u043B\u0438\u043D\u0433, \u0434\u0438\u0437\u0430\u0439\u043D \u043D\u043E\u0433\u0442\u0435\u0439, \u043D\u0430\u0440\u0430\u0449\u0438\u0432\u0430\u043D\u0438\u0435 \u0440\u0435\u0441\u043D\u0438\u0446 \u0438\u043B\u0438 \u0443\u0445\u043E\u0434 \u0437\u0430 \u0441\u0442\u043E\u043F\u0430\u043C\u0438 \u2014 \u043A\u0430\u0436\u0434\u0430\u044F \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440\u0430 \u043F\u043E\u0434\u0431\u0438\u0440\u0430\u0435\u0442\u0441\u044F \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E. \u042F \u0432\u043D\u0438\u043C\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0441\u043B\u0443\u0448\u0430\u044E, \u0447\u0435\u0441\u0442\u043D\u043E \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0438\u0440\u0443\u044E \u0438 \u0440\u0430\u0431\u043E\u0442\u0430\u044E \u0441 \u043B\u044E\u0431\u043E\u0432\u044C\u044E \u043A \u0434\u0435\u0442\u0430\u043B\u044F\u043C.",
      "\u042F \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u043E \u0441\u043E\u0432\u0435\u0440\u0448\u0435\u043D\u0441\u0442\u0432\u0443\u044E\u0441\u044C, \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0435 \u0442\u0435\u0445\u043D\u0438\u043A\u0438 \u0438 \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u044B\u0441\u043E\u043A\u043E\u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435, \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u044B\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B, \u0432 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435 \u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u0443\u0432\u0435\u0440\u0435\u043D\u0430.",
    ],
    servicesTitle: "\u041C\u043E\u044F \u044D\u043A\u0441\u043F\u0435\u0440\u0442\u0438\u0437\u0430",
    services: [
      { icon: "eye", title: "\u041F\u0435\u0440\u043C\u0430\u043D\u0435\u043D\u0442\u043D\u044B\u0439 \u043C\u0430\u043A\u0438\u044F\u0436", description: "\u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u0438\u0433\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0434\u043B\u044F \u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0445 \u0431\u0440\u043E\u0432\u0435\u0439, \u0433\u0443\u0431 \u0438 \u0441\u0442\u0440\u0435\u043B\u043E\u043A" },
      { icon: "sparkles", title: "\u041C\u0438\u043A\u0440\u043E\u043D\u0438\u0434\u043B\u0438\u043D\u0433", description: "\u041E\u043C\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u043A\u043E\u0436\u0438 \u0438 \u0441\u0442\u0438\u043C\u0443\u043B\u044F\u0446\u0438\u044F \u043A\u043E\u043B\u043B\u0430\u0433\u0435\u043D\u0430 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0439 \u0442\u0435\u0440\u0430\u043F\u0438\u0438" },
      { icon: "hand", title: "\u0414\u0438\u0437\u0430\u0439\u043D \u043D\u043E\u0433\u0442\u0435\u0439", description: "\u041A\u0440\u0435\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u0434\u0438\u0437\u0430\u0439\u043D \u043D\u043E\u0433\u0442\u0435\u0439 \u0441 \u043F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0433\u0435\u043B\u0435\u0432\u044B\u043C\u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u0430\u043C\u0438" },
      { icon: "star", title: "\u041D\u0430\u0440\u0430\u0449\u0438\u0432\u0430\u043D\u0438\u0435 \u0440\u0435\u0441\u043D\u0438\u0446", description: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E\u0435 \u043D\u0430\u0440\u0430\u0449\u0438\u0432\u0430\u043D\u0438\u0435 \u0440\u0435\u0441\u043D\u0438\u0446 \u0434\u043B\u044F \u0432\u044B\u0440\u0430\u0437\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0432\u0437\u0433\u043B\u044F\u0434\u0430" },
      { icon: "footprints", title: "\u0423\u0445\u043E\u0434 \u0437\u0430 \u0441\u0442\u043E\u043F\u0430\u043C\u0438", description: "\u041F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0435\u0434\u0438\u043A\u044E\u0440 \u0434\u043B\u044F \u0437\u0434\u043E\u0440\u043E\u0432\u044B\u0445 \u0438 \u0443\u0445\u043E\u0436\u0435\u043D\u043D\u044B\u0445 \u043D\u043E\u0433" },
    ],
    valuesTitle: "\u041C\u043E\u0438 \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u0438",
    values: [
      { title: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C", description: "\u041A\u0430\u0436\u0434\u0430\u044F \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440\u0430 \u043F\u043E\u0434\u0431\u0438\u0440\u0430\u0435\u0442\u0441\u044F \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u043E \u0434\u043B\u044F \u0432\u0430\u0441" },
      { title: "\u041A\u0430\u0447\u0435\u0441\u0442\u0432\u043E", description: "\u0422\u043E\u043B\u044C\u043A\u043E \u0432\u044B\u0441\u043E\u043A\u043E\u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435, \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u044B\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B" },
      { title: "\u0414\u043E\u0432\u0435\u0440\u0438\u0435", description: "\u0427\u0435\u0441\u0442\u043D\u0430\u044F, \u043F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u0430\u044F \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044F \u0432 \u043B\u044E\u0431\u043E\u0439 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u0438" },
      { title: "\u0422\u043E\u0447\u043D\u043E\u0441\u0442\u044C", description: "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u043A \u0434\u0435\u0442\u0430\u043B\u044F\u043C \u0438 \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u0432 \u043A\u0430\u0436\u0434\u043E\u0439 \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440\u0435" },
    ],
    certificatesTitle: "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u044B \u0438 \u043A\u0432\u0430\u043B\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438",
    certificatesSubtitle: "\u041F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u043E\u0435 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435 \u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u0430\u044F \u044D\u043A\u0441\u043F\u0435\u0440\u0442\u0438\u0437\u0430",
    ctaTitle: "\u0421 \u0440\u0430\u0434\u043E\u0441\u0442\u044C\u044E \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0430\u044E \u0432\u0430\u0441",
    ctaText: "\u041F\u043E\u0441\u0435\u0442\u0438\u0442\u0435 \u043C\u043E\u0439 \u0441\u0430\u043B\u043E\u043D \u0438 \u0437\u0430\u043F\u0438\u0448\u0438\u0442\u0435\u0441\u044C \u043D\u0430 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0443\u044E \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0442\u0430\u0446\u0438\u044E \u0431\u0435\u0437 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u0441\u0442\u0432. \u0411\u0443\u0434\u0443 \u0440\u0430\u0434\u0430 \u043F\u043E\u0437\u043D\u0430\u043A\u043E\u043C\u0438\u0442\u044C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438 \u043B\u0438\u0447\u043D\u043E.",
    ctaButton: "\u0417\u0430\u043F\u0438\u0441\u0430\u0442\u044C\u0441\u044F",
    since: "\u0421 2014 \u0433\u043E\u0434\u0430",
    experience: "10+ \u043B\u0435\u0442 \u043E\u043F\u044B\u0442\u0430",
    quality: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u043E\u0435 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E",
  },
};

/* ─────────────────────── icon map ─────────────────────── */

const iconMap: Record<string, React.ElementType> = {
  eye: Eye,
  sparkles: Sparkles,
  hand: Hand,
  star: Star,
  footprints: Footprints,
};

/* ─────────────────────── animation variants ─────────────────────── */

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ─────────────────────── Animated Icon Wrapper ─────────────────────── */

function AnimatedIcon({ icon: Icon, className = "" }: { icon: React.ElementType; className?: string }) {
  return (
    <motion.div
      whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.2 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Icon className="w-5 h-5" />
    </motion.div>
  );
}

/* ─────────────────────── Section wrapper ─────────────────────── */

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
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

/* ─────────────────────── Decorative Blobs ─────────────────────── */

function DecorativeBlobs() {
  return (
    <>
      {/* Top-right pink blob — light */}
      <motion.div
        className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-0"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(244,114,182,0.1) 40%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], x: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Bottom-left warm blob — light */}
      <motion.div
        className="pointer-events-none absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-25 dark:opacity-0"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.25) 0%, rgba(252,211,77,0.1) 40%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], y: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Mid violet blob — light */}
      <motion.div
        className="pointer-events-none absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full opacity-15 dark:opacity-0"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 60%)" }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

/* ─────────────────────── Floating Particles ─────────────────────── */

const PARTICLES = [
  { w: 4.2, h: 3.1, x: 12, y: 8, dy: -45, dx: 5, dur: 9, del: 0.2 },
  { w: 2.8, h: 5.3, x: 35, y: 22, dy: -55, dx: -8, dur: 11, del: 1.4 },
  { w: 5.1, h: 2.5, x: 58, y: 15, dy: -38, dx: 3, dur: 7, del: 2.8 },
  { w: 3.5, h: 4.7, x: 82, y: 35, dy: -62, dx: -6, dur: 12, del: 0.8 },
  { w: 2.3, h: 3.8, x: 7, y: 52, dy: -42, dx: 9, dur: 8, del: 3.5 },
  { w: 4.8, h: 2.2, x: 45, y: 68, dy: -50, dx: -4, dur: 10, del: 1.1 },
  { w: 3.0, h: 5.6, x: 91, y: 12, dy: -35, dx: 7, dur: 6, del: 4.2 },
  { w: 5.5, h: 3.4, x: 23, y: 78, dy: -58, dx: -2, dur: 13, del: 0.5 },
  { w: 2.6, h: 4.1, x: 67, y: 45, dy: -40, dx: 6, dur: 9, del: 2.3 },
  { w: 4.4, h: 2.9, x: 50, y: 88, dy: -48, dx: -7, dur: 11, del: 3.8 },
  { w: 3.3, h: 5.0, x: 15, y: 33, dy: -55, dx: 4, dur: 8, del: 1.7 },
  { w: 5.8, h: 3.7, x: 78, y: 60, dy: -37, dx: -9, dur: 10, del: 4.6 },
  { w: 2.1, h: 4.5, x: 40, y: 5, dy: -65, dx: 2, dur: 7, del: 0.9 },
  { w: 4.0, h: 2.7, x: 95, y: 72, dy: -43, dx: -5, dur: 12, del: 2.0 },
];

function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-pink-400/15 dark:bg-amber-400/10"
          style={{ width: p.w, height: p.h, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, p.dy, 0], x: [0, p.dx, 0], opacity: [0.1, 0.35, 0.1] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.del }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function AboutClient({ locale }: { locale: Locale }) {
  const t = content[locale];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-pink-50/80 via-rose-50/40 to-amber-50/30 text-gray-900 dark:from-[#0a0a0f] dark:via-[#0f0f1a] dark:to-[#0a0a0f] dark:text-white">
      <FloatingParticles />

      {/* ═══════ HERO ═══════ */}
      <div ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <DecorativeBlobs />

        {/* Dark-mode radials */}
        <div className="absolute inset-0 hidden dark:block">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(180,150,50,0.12)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(120,80,200,0.08)_0%,_transparent_50%)]" />
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(200,170,60,0.06) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Decorative floating icons — light only */}
        <motion.div
          className="absolute top-20 right-16 text-pink-300/30 dark:hidden"
          animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flower2 className="w-12 h-12" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-12 text-rose-300/25 dark:hidden"
          animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <Scissors className="w-10 h-10" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-1/4 text-amber-300/20 dark:hidden"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-pink-400/60 to-transparent dark:via-amber-400/60"
          />

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 30, letterSpacing: "0.3em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.2em" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-rose-700 via-pink-600 to-amber-600 dark:from-amber-200 dark:via-amber-100 dark:to-amber-300/80"
          >
            {t.heroTitle}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-5 font-cormorant text-lg sm:text-xl md:text-2xl text-rose-800/60 dark:text-amber-100/60 tracking-wide"
          >
            {t.heroSubtitle}
          </motion.p>

          {/* Stats badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            {[
              { icon: Calendar, label: t.since },
              { icon: Award, label: t.experience },
              { icon: Shield, label: t.quality },
            ].map((badge, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-pink-300/30 bg-white/60 backdrop-blur-sm shadow-sm dark:border-amber-500/15 dark:bg-amber-500/5 dark:shadow-none"
              >
                <badge.icon className="w-4 h-4 text-pink-600/70 dark:text-amber-400/70" />
                <span className="text-sm font-cormorant tracking-wider text-rose-800/70 dark:text-amber-200/70">
                  {badge.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-pink-400/60 to-transparent dark:via-amber-400/60"
          />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-6 h-10 rounded-full border border-pink-400/30 dark:border-amber-400/20 flex items-start justify-center p-1.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-pink-500/50 dark:bg-amber-400/50" animate={{ y: [0, 16, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </motion.div>
      </div>

      {/* ═══════ PHILOSOPHY QUOTE ═══════ */}
      <AnimatedSection className="relative py-24 md:py-32">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div variants={scaleIn}>
            <Quote className="mx-auto w-10 h-10 text-pink-400/40 dark:text-amber-400/30 mb-6" />
          </motion.div>
          <motion.blockquote
            variants={fadeInUp}
            className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-gray-800 dark:text-amber-100/80 italic"
          >
            {t.philosophyQuote}
          </motion.blockquote>
          <motion.div
            variants={fadeInUp}
            className="mt-8 mx-auto h-px w-16 bg-gradient-to-r from-transparent via-pink-400/50 to-transparent dark:via-amber-400/40"
          />
        </div>
      </AnimatedSection>

      {/* ═══════ PHOTO + STORY ═══════ */}
      <AnimatedSection className="relative py-16 md:py-24">
        {/* Background shape — light */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-100/50 to-transparent rounded-l-[100px] dark:from-transparent" />

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
            {/* Photo Column */}
            <motion.div variants={fadeInLeft} className="lg:col-span-2">
              <div className="relative group">
                <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-pink-300/20 via-transparent to-amber-300/15 dark:from-amber-400/10 dark:to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 border border-pink-200/40 shadow-lg shadow-pink-200/20 dark:from-amber-900/20 dark:via-[#1a1a2e] dark:to-amber-900/10 dark:border-amber-500/10 dark:shadow-none">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-pink-400/40 dark:text-amber-400/30 gap-3">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                      <Gem className="w-16 h-16" />
                    </motion.div>
                    <span className="font-cormorant text-lg tracking-wider">FOTO</span>
                  </div>

                  Uncomment when photo is available:
                  <Image
                    src="/images/about/elena.webp"
                    alt="Elena \u2013 Salon Elen"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                 

                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent dark:from-[#0a0a0f]/60" />
                </div>

                {/* Name tag */}
                <div className="absolute -bottom-4 left-6 right-6 bg-white/95 backdrop-blur-xl border border-pink-200/30 rounded-xl px-5 py-3 text-center shadow-lg shadow-pink-100/30 dark:bg-[#12121f]/90 dark:border-amber-500/15 dark:shadow-none">
                  <p className="font-playfair text-lg text-rose-800 dark:text-amber-200 tracking-wide">Elena</p>
                  <p className="text-xs text-rose-600/50 dark:text-amber-100/40 font-cormorant tracking-widest mt-0.5 uppercase">
                    Salon Elen &middot; {t.since}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Story Column */}
            <motion.div variants={fadeInRight} className="lg:col-span-3 pt-4">
              <motion.h2
                variants={fadeInUp}
                className="font-playfair text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-8"
              >
                {t.storyTitle}
              </motion.h2>
              <div className="space-y-5">
                {t.storyParagraphs.map((paragraph, i) => (
                  <motion.p key={i} variants={staggerItem} className="font-cormorant text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300/80">
                    {paragraph}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════ SERVICES / EXPERTISE ═══════ */}
      <AnimatedSection className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/60 to-transparent dark:via-amber-950/5" />

        {/* Floating decorative — light */}
        <motion.div
          className="absolute top-10 left-10 text-rose-200/40 dark:hidden"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <Flower2 className="w-16 h-16" />
        </motion.div>

        <div className="relative max-w-6xl mx-auto px-4">
          <motion.h2
            variants={fadeInUp}
            className="text-center font-playfair text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-14"
          >
            {t.servicesTitle}
          </motion.h2>

          <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.services.map((service, i) => {
              const Icon = iconMap[service.icon] || Sparkles;
              return (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group relative p-6 rounded-2xl border border-pink-200/40 bg-white/80 backdrop-blur-sm shadow-md shadow-pink-100/20 hover:border-pink-300/60 hover:shadow-lg hover:shadow-pink-200/30 transition-all duration-500 dark:border-amber-500/8 dark:bg-white/[0.03] dark:shadow-none dark:hover:border-amber-400/20"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-50/50 via-transparent to-amber-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-amber-400/5 dark:to-transparent" />
                  <div className="relative">
                    <motion.div
                      whileHover={{ rotate: [0, -12, 12, -6, 0], scale: 1.15 }}
                      transition={{ duration: 0.5 }}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-50 border border-pink-200/40 flex items-center justify-center mb-4 group-hover:from-pink-200 group-hover:to-rose-100 transition-colors duration-500 dark:from-amber-500/10 dark:to-amber-600/5 dark:border-amber-500/10 dark:group-hover:from-amber-500/20"
                    >
                      <Icon className="w-5 h-5 text-pink-600 group-hover:text-rose-700 transition-colors duration-500 dark:text-amber-400/70 dark:group-hover:text-amber-300" />
                    </motion.div>
                    <h3 className="font-playfair text-lg text-gray-900 dark:text-amber-100/90 mb-2">{service.title}</h3>
                    <p className="font-cormorant text-sm text-gray-600 dark:text-gray-400/80 leading-relaxed">{service.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════ VALUES ═══════ */}
      <AnimatedSection className="relative py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2
            variants={fadeInUp}
            className="text-center font-playfair text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-14"
          >
            {t.valuesTitle}
          </motion.h2>

          <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 gap-6">
            {t.values.map((value, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="relative flex gap-5 p-6 rounded-2xl border border-pink-200/30 bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300 dark:border-white/5 dark:bg-white/[0.02] dark:shadow-none"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-200/60 to-rose-100/40 border border-pink-200/40 flex items-center justify-center dark:from-amber-500/15 dark:to-amber-600/5 dark:border-amber-500/10"
                >
                  <Heart className="w-4 h-4 text-pink-600/70 dark:text-amber-400/60" />
                </motion.div>
                <div>
                  <h3 className="font-playfair text-lg text-gray-900 dark:text-amber-100/90 mb-1">{value.title}</h3>
                  <p className="font-cormorant text-sm text-gray-600 dark:text-gray-400/80">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════ CERTIFICATES ═══════ */}
      <AnimatedSection className="relative py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-50/50 to-transparent dark:via-amber-950/5" />

        <div className="relative max-w-6xl mx-auto px-4">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <h2 className="font-playfair text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide">
              {t.certificatesTitle}
            </h2>
            <p className="mt-3 font-cormorant text-base text-gray-500 dark:text-amber-100/40 tracking-wider">{t.certificatesSubtitle}</p>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ scale: 1.04, y: -4, transition: { duration: 0.3 } }}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-pink-200/30 bg-gradient-to-br from-pink-50/60 to-white shadow-sm cursor-pointer hover:shadow-lg hover:shadow-pink-200/20 transition-shadow duration-500 dark:border-amber-500/10 dark:from-white/[0.03] dark:to-transparent dark:shadow-none"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-pink-400/30 dark:text-amber-400/20 gap-2">
                  <motion.div whileHover={{ rotate: 15, scale: 1.1 }}>
                    <Award className="w-10 h-10" />
                  </motion.div>
                  <span className="font-cormorant text-xs tracking-widest uppercase">Zertifikat {i + 1}</span>
                </div>

                Uncomment when certificate images are available:
                <Image
                  src={`/images/about/cert-${i + 1}.webp`}
                  alt={`Certificate ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
               

                <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-[#0a0a0f]/80" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════ CTA ═══════ */}
      <AnimatedSection className="relative py-24 md:py-32">
        {/* Pink glow behind CTA — light */}
        <div className="absolute inset-0 flex items-center justify-center dark:hidden">
          <div className="w-[500px] h-[300px] rounded-full bg-gradient-to-r from-pink-200/30 via-rose-200/20 to-amber-200/30 blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div variants={scaleIn} className="mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="mx-auto w-8 h-8 text-pink-500/50 dark:text-amber-400/40" />
            </motion.div>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="font-playfair text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-6"
          >
            {t.ctaTitle}
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="font-cormorant text-lg text-gray-600 dark:text-gray-300/70 leading-relaxed max-w-xl mx-auto mb-10"
          >
            {t.ctaText}
          </motion.p>

          <motion.div variants={fadeInUp}>
            <Link
              href="/booking"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white font-cormorant text-lg tracking-wider transition-all duration-500 shadow-xl shadow-pink-400/25 hover:shadow-pink-500/40 hover:scale-[1.02] dark:from-amber-600/80 dark:to-amber-500/80 dark:hover:from-amber-500 dark:hover:to-amber-400 dark:shadow-amber-500/10 dark:hover:shadow-amber-500/25"
            >
              {t.ctaButton}
              <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-16 mx-auto h-px w-32 bg-gradient-to-r from-transparent via-pink-400/30 to-transparent dark:via-amber-400/30"
          />
        </div>
      </AnimatedSection>

      <div className="h-8" />
    </div>
  );
}


//--------работает, но плохая светая тема, добавляю анимацию --- IGNORE ---
// // src/app/about/AboutClient.tsx
// "use client";

// import { useRef } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   motion,
//   useScroll,
//   useTransform,
//   useInView,
//   type Variants,
// } from "framer-motion";
// import {
//   Award,
//   Heart,
//   Sparkles,
//   Star,
//   Calendar,
//   Shield,
//   ChevronRight,
//   Quote,
//   Gem,
//   Eye,
//   Hand,
//   Footprints,
// } from "lucide-react";
// import type { Locale } from "@/i18n/locales";

// /* ─────────────────────── i18n content ─────────────────────── */

// const content: Record<
//   Locale,
//   {
//     heroTitle: string;
//     heroSubtitle: string;
//     philosophyQuote: string;
//     storyTitle: string;
//     storyParagraphs: string[];
//     servicesTitle: string;
//     services: { icon: string; title: string; description: string }[];
//     valuesTitle: string;
//     values: { title: string; description: string }[];
//     certificatesTitle: string;
//     certificatesSubtitle: string;
//     ctaTitle: string;
//     ctaText: string;
//     ctaButton: string;
//     since: string;
//     experience: string;
//     quality: string;
//   }
// > = {
//   de: {
//     heroTitle: "Elena",
//     heroSubtitle: "Ihre Spezialistin für natürliche Schönheit",
//     philosophyQuote:
//       "Schönheit beginnt dort, wo wir uns selbst annehmen.",
//     storyTitle: "Mein Weg",
//     storyParagraphs: [
//       "Menschen auf diesem Weg zu begleiten, ihre natürliche Ausstrahlung zu unterstreichen und sich in ihrer Haut wirklich wohlzufühlen – das ist meine Herzensangelegenheit.",
//       "Meine fachliche Basis habe ich in Gießen im renommierten Salon \u201ESchäfer\u201C gelegt, wo ich meine Ausbildung zur Permanent Make-up Artistin absolvierte. Ergänzend dazu habe ich mich bei CNI zur Nageldesignerin weitergebildet und mein Wissen im Bereich moderner Gel-Systeme vertieft.",
//       "Mit der Eröffnung meines eigenen Salons im Jahr 2014 habe ich mir einen großen Lebenstraum erfüllt: einen Ort zu schaffen, an dem Menschen ankommen dürfen, sich gesehen fühlen und Zeit nur für sich haben.",
//       "Ob Permanent Make-up, Microneedling, Nageldesign, Wimpernverlängerung oder Fußpflege – jede Behandlung ist so individuell wie der Mensch selbst. Ich nehme mir Zeit, höre zu und berate ehrlich und transparent. Sorgfalt, Feingefühl und Vertrauen stehen für mich an erster Stelle.",
//       "Ich arbeite nach aktuellen fachlichen Standards und verwende ausschließlich hochwertige, exklusive Produkte und moderne Techniken, von deren Qualität ich überzeugt bin.",
//     ],
//     servicesTitle: "Meine Expertise",
//     services: [
//       {
//         icon: "eye",
//         title: "Permanent Make-up",
//         description:
//           "Professionelle Pigmentierung für natürlich betonte Augenbrauen, Lippen und Lidstriche",
//       },
//       {
//         icon: "sparkles",
//         title: "Microneedling",
//         description:
//           "Hautverjüngung und Kollagenbildung durch modernste Nadeltherapie",
//       },
//       {
//         icon: "hand",
//         title: "Nageldesign",
//         description:
//           "Kreatives Nageldesign mit hochwertigen Gel-Systemen für perfekte Nägel",
//       },
//       {
//         icon: "star",
//         title: "Wimpernverlängerung",
//         description:
//           "Individuelle Wimpernverlängerung für einen ausdrucksstarken Blick",
//       },
//       {
//         icon: "footprints",
//         title: "Fußpflege",
//         description:
//           "Professionelle Fußpflege für gesunde und gepflegte Füße",
//       },
//     ],
//     valuesTitle: "Meine Werte",
//     values: [
//       {
//         title: "Individualität",
//         description: "Jede Behandlung wird persönlich auf Sie abgestimmt",
//       },
//       {
//         title: "Qualität",
//         description: "Ausschließlich hochwertige, exklusive Produkte",
//       },
//       {
//         title: "Vertrauen",
//         description: "Ehrliche, transparente Beratung in jeder Situation",
//       },
//       {
//         title: "Sorgfalt",
//         description: "Feingefühl und Präzision bei jeder Behandlung",
//       },
//     ],
//     certificatesTitle: "Zertifikate & Qualifikationen",
//     certificatesSubtitle:
//       "Ständige Weiterbildung und geprüfte Fachkompetenz",
//     ctaTitle: "Ich lade Sie herzlich ein",
//     ctaText:
//       "Besuchen Sie meinen Salon und vereinbaren Sie ein unverbindliches, selbstverständlich kostenfreies Beratungsgespräch. Ich freue mich darauf, Sie kennenzulernen.",
//     ctaButton: "Termin vereinbaren",
//     since: "Seit 2014",
//     experience: "10+ Jahre Erfahrung",
//     quality: "Geprüfte Qualität",
//   },
//   en: {
//     heroTitle: "Elena",
//     heroSubtitle: "Your specialist for natural beauty",
//     philosophyQuote:
//       "True beauty begins with feeling comfortable in your own skin.",
//     storyTitle: "My Journey",
//     storyParagraphs: [
//       "Supporting people on this journey, highlighting their natural radiance and helping them feel confident and at ease – this is what truly fulfills me.",
//       "My professional journey began in Gießen at the renowned \"Schäfer\" salon, where I completed my training as a Permanent Make-up Artist. I later expanded my expertise with a professional education as a Nail Designer at CNI, specializing in modern gel systems.",
//       "Opening my own salon in 2014 was a dream come true. I wanted to create a place where people feel welcome, understood and cared for – a space dedicated to quality, time and genuine human connection.",
//       "Whether it's permanent make-up, microneedling, nail design, eyelash extensions or foot care, every treatment is tailored to your individual needs. I take the time to listen, offer honest advice and work with precision and care.",
//       "I continuously develop my skills and work with high-quality, exclusive products and modern techniques that I truly trust.",
//     ],
//     servicesTitle: "My Expertise",
//     services: [
//       {
//         icon: "eye",
//         title: "Permanent Make-up",
//         description:
//           "Professional pigmentation for naturally enhanced eyebrows, lips and eyeliner",
//       },
//       {
//         icon: "sparkles",
//         title: "Microneedling",
//         description:
//           "Skin rejuvenation and collagen stimulation through advanced needle therapy",
//       },
//       {
//         icon: "hand",
//         title: "Nail Design",
//         description:
//           "Creative nail design with premium gel systems for perfect nails",
//       },
//       {
//         icon: "star",
//         title: "Eyelash Extensions",
//         description:
//           "Individual eyelash extensions for an expressive look",
//       },
//       {
//         icon: "footprints",
//         title: "Foot Care",
//         description:
//           "Professional foot care for healthy and well-groomed feet",
//       },
//     ],
//     valuesTitle: "My Values",
//     values: [
//       {
//         title: "Individuality",
//         description: "Every treatment is personally tailored to you",
//       },
//       {
//         title: "Quality",
//         description: "Exclusively high-quality, premium products",
//       },
//       {
//         title: "Trust",
//         description: "Honest, transparent advice in every situation",
//       },
//       {
//         title: "Precision",
//         description: "Care and precision in every treatment",
//       },
//     ],
//     certificatesTitle: "Certificates & Qualifications",
//     certificatesSubtitle:
//       "Continuous education and certified expertise",
//     ctaTitle: "You are warmly invited",
//     ctaText:
//       "Visit my salon and book a complimentary, no-obligation consultation. I look forward to welcoming you in person.",
//     ctaButton: "Book appointment",
//     since: "Since 2014",
//     experience: "10+ years experience",
//     quality: "Certified quality",
//   },
//   ru: {
//     heroTitle: "Елена",
//     heroSubtitle: "Ваш специалист по натуральной красоте",
//     philosophyQuote:
//       "Настоящая красота начинается с принятия себя.",
//     storyTitle: "Мой путь",
//     storyParagraphs: [
//       "Помогать людям раскрывать свою естественную привлекательность, чувствовать уверенность и комфорт в собственном теле — это дело моего сердца.",
//       "Мой профессиональный путь начался в городе Гисен, в одном из самых уважаемых салонов — «Schäfer», где я получила квалификацию мастера перманентного макияжа. Позднее я прошла профессиональное обучение как nail-дизайнер в компании CNI, углубив знания в современных гелевых системах.",
//       "Открытие собственного салона в 2014 году стало исполнением моей мечты — создать пространство, где каждый человек чувствует внимание, заботу и может по-настоящему расслабиться.",
//       "Перманентный макияж, микронидлинг, дизайн ногтей, наращивание ресниц или уход за стопами — каждая процедура подбирается индивидуально. Я внимательно слушаю, честно консультирую и работаю с любовью к деталям.",
//       "Я постоянно совершенствуюсь, использую современные техники и только высококачественные, проверенные продукты, в качестве которых уверена.",
//     ],
//     servicesTitle: "Моя экспертиза",
//     services: [
//       {
//         icon: "eye",
//         title: "Перманентный макияж",
//         description:
//           "Профессиональная пигментация для естественных бровей, губ и стрелок",
//       },
//       {
//         icon: "sparkles",
//         title: "Микронидлинг",
//         description:
//           "Омоложение кожи и стимуляция коллагена с помощью современной терапии",
//       },
//       {
//         icon: "hand",
//         title: "Дизайн ногтей",
//         description:
//           "Креативный дизайн ногтей с премиальными гелевыми системами",
//       },
//       {
//         icon: "star",
//         title: "Наращивание ресниц",
//         description:
//           "Индивидуальное наращивание ресниц для выразительного взгляда",
//       },
//       {
//         icon: "footprints",
//         title: "Уход за стопами",
//         description:
//           "Профессиональный педикюр для здоровых и ухоженных ног",
//       },
//     ],
//     valuesTitle: "Мои ценности",
//     values: [
//       {
//         title: "Индивидуальность",
//         description: "Каждая процедура подбирается персонально для вас",
//       },
//       {
//         title: "Качество",
//         description: "Только высококачественные, проверенные продукты",
//       },
//       {
//         title: "Доверие",
//         description: "Честная, прозрачная консультация в любой ситуации",
//       },
//       {
//         title: "Точность",
//         description: "Внимание к деталям и точность в каждой процедуре",
//       },
//     ],
//     certificatesTitle: "Сертификаты и квалификации",
//     certificatesSubtitle:
//       "Постоянное развитие и подтверждённая экспертиза",
//     ctaTitle: "С радостью приглашаю вас",
//     ctaText:
//       "Посетите мой салон и запишитесь на бесплатную консультацию без обязательств. Буду рада познакомиться с вами лично.",
//     ctaButton: "Записаться",
//     since: "С 2014 года",
//     experience: "10+ лет опыта",
//     quality: "Подтверждённое качество",
//   },
// };

// /* ─────────────────────── icon map ─────────────────────── */

// const iconMap: Record<string, React.ElementType> = {
//   eye: Eye,
//   sparkles: Sparkles,
//   hand: Hand,
//   star: Star,
//   footprints: Footprints,
// };

// /* ─────────────────────── animation variants ─────────────────────── */

// const fadeInUp: Variants = {
//   hidden: { opacity: 0, y: 40 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
// };

// const fadeInLeft: Variants = {
//   hidden: { opacity: 0, x: -60 },
//   visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
// };

// const fadeInRight: Variants = {
//   hidden: { opacity: 0, x: 60 },
//   visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
// };

// const scaleIn: Variants = {
//   hidden: { opacity: 0, scale: 0.85 },
//   visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
// };

// const staggerContainer: Variants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { staggerChildren: 0.12, delayChildren: 0.15 },
//   },
// };

// const staggerItem: Variants = {
//   hidden: { opacity: 0, y: 25 },
//   visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
// };

// /* ─────────────────────── Section wrapper ─────────────────────── */

// function AnimatedSection({
//   children,
//   className = "",
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const isInView = useInView(ref, { once: true, margin: "-80px" });

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

// /* ─────────────────────── Floating Particles (both themes) ─────────────────────── */

// // Pre-computed particle data to avoid Math.random() hydration mismatch
// const PARTICLES = [
//   { w: 4.2, h: 3.1, x: 12, y: 8, dy: -45, dx: 5, dur: 9, del: 0.2 },
//   { w: 2.8, h: 5.3, x: 35, y: 22, dy: -55, dx: -8, dur: 11, del: 1.4 },
//   { w: 5.1, h: 2.5, x: 58, y: 15, dy: -38, dx: 3, dur: 7, del: 2.8 },
//   { w: 3.5, h: 4.7, x: 82, y: 35, dy: -62, dx: -6, dur: 12, del: 0.8 },
//   { w: 2.3, h: 3.8, x: 7, y: 52, dy: -42, dx: 9, dur: 8, del: 3.5 },
//   { w: 4.8, h: 2.2, x: 45, y: 68, dy: -50, dx: -4, dur: 10, del: 1.1 },
//   { w: 3.0, h: 5.6, x: 91, y: 12, dy: -35, dx: 7, dur: 6, del: 4.2 },
//   { w: 5.5, h: 3.4, x: 23, y: 78, dy: -58, dx: -2, dur: 13, del: 0.5 },
//   { w: 2.6, h: 4.1, x: 67, y: 45, dy: -40, dx: 6, dur: 9, del: 2.3 },
//   { w: 4.4, h: 2.9, x: 50, y: 88, dy: -48, dx: -7, dur: 11, del: 3.8 },
//   { w: 3.3, h: 5.0, x: 15, y: 33, dy: -55, dx: 4, dur: 8, del: 1.7 },
//   { w: 5.8, h: 3.7, x: 78, y: 60, dy: -37, dx: -9, dur: 10, del: 4.6 },
//   { w: 2.1, h: 4.5, x: 40, y: 5, dy: -65, dx: 2, dur: 7, del: 0.9 },
//   { w: 4.0, h: 2.7, x: 95, y: 72, dy: -43, dx: -5, dur: 12, del: 2.0 },
//   { w: 3.7, h: 5.2, x: 28, y: 95, dy: -52, dx: 8, dur: 9, del: 3.1 },
//   { w: 5.3, h: 3.0, x: 62, y: 28, dy: -46, dx: -3, dur: 11, del: 1.5 },
//   { w: 2.5, h: 4.8, x: 8, y: 82, dy: -60, dx: 5, dur: 6, del: 4.0 },
//   { w: 4.6, h: 2.4, x: 53, y: 50, dy: -41, dx: -6, dur: 10, del: 2.6 },
// ];

// function FloatingParticles() {
//   return (
//     <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
//       {PARTICLES.map((p, i) => (
//         <motion.div
//           key={i}
//           className="absolute rounded-full bg-gold-400/10 dark:bg-amber-400/10"
//           style={{ width: p.w, height: p.h, left: `${p.x}%`, top: `${p.y}%` }}
//           animate={{
//             y: [0, p.dy, 0],
//             x: [0, p.dx, 0],
//             opacity: [0.08, 0.3, 0.08],
//           }}
//           transition={{
//             duration: p.dur,
//             repeat: Infinity,
//             ease: "easeInOut",
//             delay: p.del,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// /* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

// type Props = { locale: Locale };

// export default function AboutClient({ locale }: Props) {
//   const t = content[locale];

//   const heroRef = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({
//     target: heroRef,
//     offset: ["start start", "end start"],
//   });
//   const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
//   const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white text-gray-900 dark:from-[#0a0a0f] dark:via-[#0f0f1a] dark:to-[#0a0a0f] dark:text-white">
//       <FloatingParticles />

//       {/* ═══════ HERO SECTION ═══════ */}
//       <div ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
//         {/* Animated gradient background — light */}
//         <div className="absolute inset-0 dark:hidden">
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.10)_0%,_transparent_60%)]" />
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(180,140,200,0.06)_0%,_transparent_50%)]" />
//           <motion.div
//             className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
//             style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)" }}
//             animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
//             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//           />
//         </div>

//         {/* Animated gradient background — dark */}
//         <div className="absolute inset-0 hidden dark:block">
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(180,150,50,0.12)_0%,_transparent_60%)]" />
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(120,80,200,0.08)_0%,_transparent_50%)]" />
//           <motion.div
//             className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
//             style={{ background: "radial-gradient(circle, rgba(200,170,60,0.06) 0%, transparent 70%)" }}
//             animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
//             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//           />
//         </div>

//         <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
//           {/* Decorative line */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
//             className="mx-auto mb-8 h-px w-24 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent dark:via-amber-400/60"
//           />

//           {/* Name */}
//           <motion.h1
//             initial={{ opacity: 0, y: 30, letterSpacing: "0.3em" }}
//             animate={{ opacity: 1, y: 0, letterSpacing: "0.2em" }}
//             transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
//             className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-gold-700 via-gold-600 to-gold-500 dark:from-amber-200 dark:via-amber-100 dark:to-amber-300/80"
//           >
//             {t.heroTitle}
//           </motion.h1>

//           {/* Subtitle */}
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.6 }}
//             className="mt-5 font-cormorant text-lg sm:text-xl md:text-2xl text-gold-700/60 dark:text-amber-100/60 tracking-wide"
//           >
//             {t.heroSubtitle}
//           </motion.p>

//           {/* Stats badges */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.9 }}
//             className="mt-10 flex flex-wrap justify-center gap-4"
//           >
//             {[
//               { icon: Calendar, label: t.since },
//               { icon: Award, label: t.experience },
//               { icon: Shield, label: t.quality },
//             ].map((badge, i) => (
//               <div
//                 key={i}
//                 className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold-400/20 bg-gold-50/50 backdrop-blur-sm dark:border-amber-500/15 dark:bg-amber-500/5"
//               >
//                 <badge.icon className="w-4 h-4 text-gold-600/70 dark:text-amber-400/70" />
//                 <span className="text-sm font-cormorant tracking-wider text-gold-700/70 dark:text-amber-200/70">
//                   {badge.label}
//                 </span>
//               </div>
//             ))}
//           </motion.div>

//           {/* Decorative line bottom */}
//           <motion.div
//             initial={{ scaleX: 0 }}
//             animate={{ scaleX: 1 }}
//             transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
//             className="mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent dark:via-amber-400/60"
//           />
//         </motion.div>

//         {/* Scroll indicator */}
//         <motion.div
//           className="absolute bottom-8 left-1/2 -translate-x-1/2"
//           animate={{ y: [0, 10, 0] }}
//           transition={{ duration: 2, repeat: Infinity }}
//         >
//           <div className="w-6 h-10 rounded-full border border-gold-400/25 dark:border-amber-400/20 flex items-start justify-center p-1.5">
//             <motion.div
//               className="w-1.5 h-1.5 rounded-full bg-gold-500/50 dark:bg-amber-400/50"
//               animate={{ y: [0, 16, 0] }}
//               transition={{ duration: 2, repeat: Infinity }}
//             />
//           </div>
//         </motion.div>
//       </div>

//       {/* ═══════ PHILOSOPHY QUOTE ═══════ */}
//       <AnimatedSection className="relative py-24 md:py-32">
//         <div className="relative max-w-4xl mx-auto px-4 text-center">
//           <motion.div variants={scaleIn}>
//             <Quote className="mx-auto w-10 h-10 text-gold-400/30 dark:text-amber-400/30 mb-6" />
//           </motion.div>
//           <motion.blockquote
//             variants={fadeInUp}
//             className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light leading-tight text-gray-800/80 dark:text-amber-100/80 italic"
//           >
//             {t.philosophyQuote}
//           </motion.blockquote>
//           <motion.div
//             variants={fadeInUp}
//             className="mt-8 mx-auto h-px w-16 bg-gradient-to-r from-transparent via-gold-400/40 to-transparent dark:via-amber-400/40"
//           />
//         </div>
//       </AnimatedSection>

//       {/* ═══════ PHOTO + STORY SECTION ═══════ */}
//       <AnimatedSection className="relative py-16 md:py-24">
//         <div className="max-w-6xl mx-auto px-4">
//           <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
//             {/* Photo Column */}
//             <motion.div variants={fadeInLeft} className="lg:col-span-2">
//               <div className="relative group">
//                 {/* Decorative frame */}
//                 <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-gold-400/10 via-transparent to-gold-600/10 dark:from-amber-400/10 dark:to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

//                 {/* Photo placeholder */}
//                 <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-gradient-to-br from-gold-100/40 via-gray-50 to-gold-100/20 border border-gold-300/15 dark:from-amber-900/20 dark:via-[#1a1a2e] dark:to-amber-900/10 dark:border-amber-500/10">
//                   {/* Replace this div with Image when photo is available */}
//                   <div className="absolute inset-0 flex flex-col items-center justify-center text-gold-400/30 dark:text-amber-400/30 gap-3">
//                     <Gem className="w-16 h-16" />
//                     <span className="font-cormorant text-lg tracking-wider">FOTO</span>
//                   </div>

//                   {/* Uncomment when photo is available:
//                   <Image
//                     src="/images/about/elena.webp"
//                     alt="Elena – Salon Elen"
//                     fill
//                     className="object-cover"
//                     sizes="(max-width: 1024px) 100vw, 40vw"
//                     priority
//                   />
//                   */}

//                   {/* Overlay gradient */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent dark:from-[#0a0a0f]/60" />
//                 </div>

//                 {/* Name tag */}
//                 <div className="absolute -bottom-4 left-6 right-6 bg-white/90 backdrop-blur-xl border border-gold-300/15 rounded-xl px-5 py-3 text-center shadow-soft dark:bg-[#12121f]/90 dark:border-amber-500/15 dark:shadow-none">
//                   <p className="font-playfair text-lg text-gold-800 dark:text-amber-200 tracking-wide">Elena</p>
//                   <p className="text-xs text-gold-600/50 dark:text-amber-100/40 font-cormorant tracking-widest mt-0.5 uppercase">
//                     Salon Elen · {t.since}
//                   </p>
//                 </div>
//               </div>
//             </motion.div>

//             {/* Story Column */}
//             <motion.div variants={fadeInRight} className="lg:col-span-3 pt-4">
//               <motion.h2
//                 variants={fadeInUp}
//                 className="font-playfair text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-8"
//               >
//                 {t.storyTitle}
//               </motion.h2>

//               <div className="space-y-5">
//                 {t.storyParagraphs.map((paragraph, i) => (
//                   <motion.p
//                     key={i}
//                     variants={staggerItem}
//                     className="font-cormorant text-base sm:text-lg leading-relaxed text-gray-700/90 dark:text-gray-300/80"
//                   >
//                     {paragraph}
//                   </motion.p>
//                 ))}
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </AnimatedSection>

//       {/* ═══════ SERVICES / EXPERTISE ═══════ */}
//       <AnimatedSection className="relative py-20 md:py-28">
//         {/* Background accent */}
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-50/30 to-transparent dark:via-amber-950/5" />

//         <div className="relative max-w-6xl mx-auto px-4">
//           <motion.h2
//             variants={fadeInUp}
//             className="text-center font-playfair text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-14"
//           >
//             {t.servicesTitle}
//           </motion.h2>

//           <motion.div
//             variants={staggerContainer}
//             className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
//           >
//             {t.services.map((service, i) => {
//               const Icon = iconMap[service.icon] || Sparkles;
//               return (
//                 <motion.div
//                   key={i}
//                   variants={staggerItem}
//                   whileHover={{ y: -6, transition: { duration: 0.3 } }}
//                   className="group relative p-6 rounded-2xl border border-gray-200/60 bg-white/70 backdrop-blur-sm shadow-soft hover:border-gold-300/40 hover:shadow-md transition-all duration-500 dark:border-amber-500/8 dark:bg-white/[0.03] dark:shadow-none dark:hover:border-amber-400/20"
//                 >
//                   {/* Glow on hover */}
//                   <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-amber-400/5" />

//                   <div className="relative">
//                     <div className="w-12 h-12 rounded-xl bg-gold-100/50 border border-gold-200/30 flex items-center justify-center mb-4 group-hover:bg-gold-200/50 transition-colors duration-500 dark:bg-amber-500/8 dark:border-amber-500/10 dark:group-hover:bg-amber-500/15">
//                       <Icon className="w-5 h-5 text-gold-600/80 group-hover:text-gold-700 transition-colors duration-500 dark:text-amber-400/70 dark:group-hover:text-amber-300" />
//                     </div>
//                     <h3 className="font-playfair text-lg text-gray-900 dark:text-amber-100/90 mb-2">
//                       {service.title}
//                     </h3>
//                     <p className="font-cormorant text-sm text-gray-600 dark:text-gray-400/80 leading-relaxed">
//                       {service.description}
//                     </p>
//                   </div>
//                 </motion.div>
//               );
//             })}
//           </motion.div>
//         </div>
//       </AnimatedSection>

//       {/* ═══════ VALUES ═══════ */}
//       <AnimatedSection className="relative py-20 md:py-28">
//         <div className="max-w-5xl mx-auto px-4">
//           <motion.h2
//             variants={fadeInUp}
//             className="text-center font-playfair text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-14"
//           >
//             {t.valuesTitle}
//           </motion.h2>

//           <motion.div
//             variants={staggerContainer}
//             className="grid sm:grid-cols-2 gap-6"
//           >
//             {t.values.map((value, i) => (
//               <motion.div
//                 key={i}
//                 variants={staggerItem}
//                 className="relative flex gap-5 p-6 rounded-2xl border border-gray-200/50 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]"
//               >
//                 <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gold-200/40 to-gold-100/20 border border-gold-200/30 flex items-center justify-center dark:from-amber-500/15 dark:to-amber-600/5 dark:border-amber-500/10">
//                   <Heart className="w-4 h-4 text-gold-600/60 dark:text-amber-400/60" />
//                 </div>
//                 <div>
//                   <h3 className="font-playfair text-lg text-gray-900 dark:text-amber-100/90 mb-1">
//                     {value.title}
//                   </h3>
//                   <p className="font-cormorant text-sm text-gray-600 dark:text-gray-400/80">
//                     {value.description}
//                   </p>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </AnimatedSection>

//       {/* ═══════ CERTIFICATES GALLERY ═══════ */}
//       <AnimatedSection className="relative py-20 md:py-28">
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-50/30 to-transparent dark:via-amber-950/5" />

//         <div className="relative max-w-6xl mx-auto px-4">
//           <motion.div variants={fadeInUp} className="text-center mb-14">
//             <h2 className="font-playfair text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide">
//               {t.certificatesTitle}
//             </h2>
//             <p className="mt-3 font-cormorant text-base text-gray-500 dark:text-amber-100/40 tracking-wider">
//               {t.certificatesSubtitle}
//             </p>
//           </motion.div>

//           {/* Certificate placeholders grid */}
//           <motion.div
//             variants={staggerContainer}
//             className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
//           >
//             {Array.from({ length: 4 }).map((_, i) => (
//               <motion.div
//                 key={i}
//                 variants={staggerItem}
//                 whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
//                 className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-200/50 bg-gradient-to-br from-gold-50/30 to-gray-50 cursor-pointer dark:border-amber-500/10 dark:from-white/[0.03] dark:to-transparent"
//               >
//                 {/* Replace this with Image component for actual certificates */}
//                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gold-400/25 dark:text-amber-400/20 gap-2">
//                   <Award className="w-10 h-10" />
//                   <span className="font-cormorant text-xs tracking-widest uppercase">
//                     Zertifikat {i + 1}
//                   </span>
//                 </div>

//                 {/* Uncomment when certificate images are available:
//                 <Image
//                   src={`/images/about/cert-${i + 1}.webp`}
//                   alt={`Certificate ${i + 1}`}
//                   fill
//                   className="object-cover transition-transform duration-700 group-hover:scale-105"
//                   sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
//                 />
//                 */}

//                 {/* Hover overlay */}
//                 <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-[#0a0a0f]/80" />
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </AnimatedSection>

//       {/* ═══════ CTA SECTION ═══════ */}
//       <AnimatedSection className="relative py-24 md:py-32">
//         <div className="max-w-3xl mx-auto px-4 text-center">
//           {/* Decorative element */}
//           <motion.div variants={scaleIn} className="mb-8">
//             <Sparkles className="mx-auto w-8 h-8 text-gold-400/40 dark:text-amber-400/40" />
//           </motion.div>

//           <motion.h2
//             variants={fadeInUp}
//             className="font-playfair text-3xl md:text-4xl font-light text-gray-900 dark:text-amber-100/90 tracking-wide mb-6"
//           >
//             {t.ctaTitle}
//           </motion.h2>

//           <motion.p
//             variants={fadeInUp}
//             className="font-cormorant text-lg text-gray-600 dark:text-gray-300/70 leading-relaxed max-w-xl mx-auto mb-10"
//           >
//             {t.ctaText}
//           </motion.p>

//           <motion.div variants={fadeInUp}>
//             <Link
//               href="/booking"
//               className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white font-cormorant text-lg tracking-wider transition-all duration-500 shadow-lg shadow-gold-500/15 hover:shadow-gold-500/30 dark:from-amber-600/80 dark:to-amber-500/80 dark:hover:from-amber-500 dark:hover:to-amber-400 dark:shadow-amber-500/10 dark:hover:shadow-amber-500/25"
//             >
//               {t.ctaButton}
//               <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
//             </Link>
//           </motion.div>

//           {/* Bottom decoration */}
//           <motion.div
//             variants={fadeInUp}
//             className="mt-16 mx-auto h-px w-32 bg-gradient-to-r from-transparent via-gold-400/30 to-transparent dark:via-amber-400/30"
//           />
//         </div>
//       </AnimatedSection>

//       {/* Footer spacing */}
//       <div className="h-8" />
//     </div>
//   );
// }