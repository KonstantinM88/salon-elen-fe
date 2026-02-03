// src/app/booking/(steps)/master/page.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import MasterStepClient from "./MasterStepClient";

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
  de: "Master wählen — Salon Elen",
  ru: "Выбор мастера — Salon Elen",
  en: "Choose a master — Salon Elen",
};

const metaDescriptions: Record<Locale, string> = {
  de: "Wählen Sie einen Master für die gewählten Leistungen.",
  ru: "Выберите мастера для выбранных услуг.",
  en: "Choose a master for selected services.",
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

    // ✅ букинг не индексируем
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
      canonical: "/booking/master",
      languages: {
        de: "/booking/master",
        ru: "/booking/master?lang=ru",
        en: "/booking/master?lang=en",
        "x-default": "/booking/master",
      },
    },
  };
}

export default function Page(): React.JSX.Element {
  return <MasterStepClient />;
}




// // src/app/booking/(steps)/master/page.tsx
// import type { Metadata } from "next";
// import { cookies } from "next/headers";
// import MasterStepClient from "./MasterStepClient";

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
//   de: "Master wählen — Salon Elen",
//   ru: "Выбор мастера — Salon Elen",
//   en: "Choose a master — Salon Elen",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Wählen Sie einen Master für die gewählten Leistungen.",
//   ru: "Выберите мастера для выбранных услуг.",
//   en: "Choose a master for selected services.",
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

//     // Вариант A: букинг не индексируем
//     robots: {
//       index: false,
//       follow: false,
//       nocache: true,
//       googleBot: {
//         index: false,
//         follow: false,
//         "max-snippet": -1,
//         "max-image-preview": "none",
//         "max-video-preview": -1,
//       },
//     },

//     alternates: {
//       canonical: "/booking/master",
//       languages: {
//         de: "/booking/master",
//         ru: "/booking/master?lang=ru",
//         en: "/booking/master?lang=en",
//         "x-default": "/booking/master",
//       },
//     },
//   };
// }

// export default function Page(): React.JSX.Element {
//   return <MasterStepClient />;
// }
