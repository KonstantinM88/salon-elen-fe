// src/app/booking/(steps)/services/page.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import ServicesStepClient from "./ServicesStepClient";

export const dynamic = "force-dynamic";

const SUPPORTED = ["de", "ru", "en"] as const;
type Locale = (typeof SUPPORTED)[number];

type SearchParams = Record<string, string | string[] | undefined>;
type SearchParamsPromise = Promise<SearchParams>;

function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
}

function getLangFromSearchParamsObj(sp?: SearchParams): string | undefined {
  const raw = sp?.lang;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
  const sp = searchParams ? await searchParams : undefined;

  const urlLang = getLangFromSearchParamsObj(sp);
  if (isLocale(urlLang)) return urlLang;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  return "de";
}

const metaTitles: Record<Locale, string> = {
  de: "Termin buchen — Salon Elen",
  ru: "Запись онлайн — Salon Elen",
  en: "Book an appointment — Salon Elen",
};

const metaDescriptions: Record<Locale, string> = {
  de: "Wählen Sie Leistungen und buchen Sie Ihren Termin online.",
  ru: "Выберите услуги и запишитесь онлайн.",
  en: "Choose services and book your appointment online.",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveLocale(searchParams);

  return {
    title: metaTitles[locale],
    description: metaDescriptions[locale],

    // ✅ букинг не индексируем (как и master)
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        "max-snippet": -1,
        "max-image-preview": "none",
        "max-video-preview": -1,
      },
    },

    alternates: {
      canonical: "/booking/services",
      languages: {
        de: "/booking/services",
        ru: "/booking/services?lang=ru",
        en: "/booking/services?lang=en",
        "x-default": "/booking/services",
      },
    },
  };
}

export default function Page(): React.JSX.Element {
  return <ServicesStepClient />;
}




// // src/app/booking/(steps)/services/page.tsx
// import type { Metadata } from "next";
// import { cookies } from "next/headers";
// import ServicesStepClient from "./ServicesStepClient";

// export const dynamic = "force-dynamic";

// const SUPPORTED = ["de", "ru", "en"] as const;
// type Locale = (typeof SUPPORTED)[number];

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
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

//   return "de";
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Termin buchen — Salon Elen",
//   ru: "Запись онлайн — Salon Elen",
//   en: "Book an appointment — Salon Elen",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Wählen Sie Leistungen und buchen Sie Ihren Termin online.",
//   ru: "Выберите услуги и запишитесь онлайн.",
//   en: "Choose services and book your appointment online.",
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
//       canonical: "/booking/services",
//       languages: {
//         de: "/booking/services",
//         ru: "/booking/services?lang=ru",
//         en: "/booking/services?lang=en",
//         "x-default": "/booking/services",
//       },
//     },
//   };
// }

// export default function Page(): React.JSX.Element {
//   return <ServicesStepClient />;
// }





// // src/app/booking/(steps)/services/page.tsx
// import type { Metadata } from "next";
// import { cookies } from "next/headers";
// import ServicesStepClient from "./ServicesStepClient";

// export const dynamic = "force-dynamic";

// const SUPPORTED = ["de", "ru", "en"] as const;
// type Locale = (typeof SUPPORTED)[number];

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
// }

// async function resolveLocale(
//   searchParams?: { lang?: string },
// ): Promise<Locale> {
//   const urlLang = searchParams?.lang;
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return "de";
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Termin buchen — Salon Elen",
//   ru: "Запись онлайн — Salon Elen",
//   en: "Book an appointment — Salon Elen",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Wählen Sie Leistungen und buchen Sie Ihren Termin online.",
//   ru: "Выберите услуги и запишитесь онлайн.",
//   en: "Choose services and book your appointment online.",
// };

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: { lang?: string };
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   return {
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],
//     alternates: {
//       canonical: "/booking/services",
//       languages: {
//         de: "/booking/services",
//         ru: "/booking/services?lang=ru",
//         en: "/booking/services?lang=en",
//         "x-default": "/booking/services",
//       },
//     },
//   };
// }

// export default function Page(): React.JSX.Element {
//   return <ServicesStepClient />;
// }

