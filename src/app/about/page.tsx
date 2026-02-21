// src/app/about/page.tsx
import type { Metadata } from "next";
import { type Locale } from "@/i18n/locales";
import AboutClient from "./AboutClient";
import {
  resolveUrlLocale,
  buildAlternates,
  BASE_URL,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";
import { resolveContentLocale } from "@/lib/seo-locale-server";

export const dynamic = "force-dynamic";

const metaTitles: Record<SeoLocale, string> = {
  de: "Über mich — Salon Elen | Kosmetiksalon in Halle (Saale)",
  ru: "Обо мне — Salon Elen | Косметический салон в Галле",
  en: "About me — Salon Elen | Beauty Salon in Halle (Saale)",
};

const metaDescriptions: Record<SeoLocale, string> = {
  de: "Lernen Sie Elena kennen – Ihre Spezialistin für Permanent Make-up, Nageldesign & Mikroneedling in Halle (Saale). Seit 2014 mit Herz und Fachkompetenz für Ihre Schönheit.",
  ru: "Познакомьтесь с Еленой — специалистом по перманентному макияжу, дизайну ногтей и микронидлингу в Галле (Заале). С 2014 года с любовью и профессионализмом для вашей красоты.",
  en: "Meet Elena – your specialist for permanent make-up, nail design & microneedling in Halle (Saale). Since 2014 with heart and expertise for your beauty.",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const alts = buildAlternates("/about", locale);

  return {
    title: metaTitles[locale],
    description: metaDescriptions[locale],
    alternates: alts,
    openGraph: {
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      url: alts.canonical,
      siteName: "Salon Elen",
      images: [
        {
          url: `${BASE_URL}/images/hero.webp`,
          width: 1200,
          height: 630,
          alt: "Salon Elen – About",
        },
      ],
      locale: locale === "de" ? "de_DE" : locale === "ru" ? "ru_RU" : "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitles[locale],
      description: metaDescriptions[locale],
    },
  };
}

export default async function AboutPage({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const locale = await resolveContentLocale(searchParams);

  // JSON-LD structured data for the salon owner
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: "Salon Elen",
    url: BASE_URL,
    image: `${BASE_URL}/images/hero.webp`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Lessingstraße 37",
      postalCode: "06114",
      addressLocality: "Halle (Saale)",
      addressCountry: "DE",
    },
    founder: {
      "@type": "Person",
      name: "Elena",
      jobTitle: "Permanent Make-up Artistin & Kosmetikerin",
    },
    foundingDate: "2014",
    description: metaDescriptions[locale],
    priceRange: "€€",
    areaServed: {
      "@type": "City",
      name: "Halle (Saale)",
    },
    knowsAbout: [
      "Permanent Make-up",
      "Microneedling",
      "Nail Design",
      "Eyelash Extensions",
      "Foot Care",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient locale={locale} />
    </>
  );
}



//--------работал до 14.02.26 исправляем для SEO
// // src/app/about/page.tsx
// import type { Metadata } from "next";
// import { cookies } from "next/headers";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import AboutClient from "./AboutClient";

// export const dynamic = "force-dynamic";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";
// const PAGE_PATH = "/about";

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   searchParams?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const sp = searchParams ? await searchParams : undefined;
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return DEFAULT_LOCALE;
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Über mich — Salon Elen | Kosmetiksalon in Halle (Saale)",
//   ru: "Обо мне — Salon Elen | Косметический салон в Галле",
//   en: "About me — Salon Elen | Beauty Salon in Halle (Saale)",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Lernen Sie Elena kennen – Ihre Spezialistin für Permanent Make-up, Nageldesign & Mikroneedling in Halle (Saale). Seit 2014 mit Herz und Fachkompetenz für Ihre Schönheit.",
//   ru: "Познакомьтесь с Еленой — специалистом по перманентному макияжу, дизайну ногтей и микронидлингу в Галле (Заале). С 2014 года с любовью и профессионализмом для вашей красоты.",
//   en: "Meet Elena – your specialist for permanent make-up, nail design & microneedling in Halle (Saale). Since 2014 with heart and expertise for your beauty.",
// };

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   return {
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],
//     alternates: {
//       canonical: locale === "de" ? PAGE_PATH : `${PAGE_PATH}?lang=${locale}`,
//       languages: {
//         de: PAGE_PATH,
//         ru: `${PAGE_PATH}?lang=ru`,
//         en: `${PAGE_PATH}?lang=en`,
//         "x-default": PAGE_PATH,
//       },
//     },
//     openGraph: {
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       url: locale === "de" ? `${SITE_URL}${PAGE_PATH}` : `${SITE_URL}${PAGE_PATH}?lang=${locale}`,
//       siteName: "Salon Elen",
//       images: [
//         {
//           url: `${SITE_URL}/images/hero.webp`,
//           width: 1200,
//           height: 630,
//           alt: "Salon Elen – About",
//         },
//       ],
//       locale: locale === "de" ? "de_DE" : locale === "ru" ? "ru_RU" : "en_US",
//       type: "profile",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//     },
//   };
// }

// export default async function AboutPage({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }) {
//   const locale = await resolveLocale(searchParams);

//   // JSON-LD structured data for the salon owner
//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "BeautySalon",
//     name: "Salon Elen",
//     url: SITE_URL,
//     image: `${SITE_URL}/images/hero.webp`,
//     address: {
//       "@type": "PostalAddress",
//       streetAddress: "Lessingstraße 37",
//       postalCode: "06114",
//       addressLocality: "Halle (Saale)",
//       addressCountry: "DE",
//     },
//     founder: {
//       "@type": "Person",
//       name: "Elena",
//       jobTitle: "Permanent Make-up Artistin & Kosmetikerin",
//     },
//     foundingDate: "2014",
//     description: metaDescriptions[locale],
//     priceRange: "€€",
//     areaServed: {
//       "@type": "City",
//       name: "Halle (Saale)",
//     },
//     knowsAbout: [
//       "Permanent Make-up",
//       "Microneedling",
//       "Nail Design",
//       "Eyelash Extensions",
//       "Foot Care",
//     ],
//   };

//   return (
//     <>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />
//       <AboutClient locale={locale} />
//     </>
//   );
// }
