// src/app/gallerie/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import GallerieClient from "./GallerieClient";
import {
  resolveUrlLocale,
  resolveContentLocale,
  buildAlternates,
  BASE_URL,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";

export const dynamic = "force-dynamic";

const metaTitles: Record<SeoLocale, string> = {
  de: "Galerie — Salon Elen | Unsere Arbeiten in Halle (Saale)",
  ru: "Галерея — Salon Elen | Наши работы в Галле (Заале)",
  en: "Gallery — Salon Elen | Our Works in Halle (Saale)",
};

const metaDescriptions: Record<SeoLocale, string> = {
  de: "Entdecken Sie unsere Arbeiten: Permanent Make-up, Nageldesign, Wimpernverlängerung, Microneedling und mehr.",
  ru: "Посмотрите наши работы: перманентный макияж, дизайн ногтей, наращивание ресниц и многое другое.",
  en: "Discover our works: permanent make-up, nail design, eyelash extensions, microneedling and more.",
};

export async function generateMetadata({ searchParams }: { searchParams?: SearchParamsPromise }): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const alts = buildAlternates("/gallerie", locale);

  return {
    title: metaTitles[locale],
    description: metaDescriptions[locale],
    alternates: alts,
    openGraph: {
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      url: alts.canonical,
      images: [`${BASE_URL}/images/hero.webp`],
      siteName: "Salon Elen",
      locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
      type: "website",
    },
  };
}

async function getGalleryData(locale: SeoLocale) {
  const categories = await prisma.service.findMany({
    where: { parentId: null, isArchived: false, isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true, slug: true, name: true, cover: true,
      translations: { where: { locale }, select: { name: true } },
      gallery: { orderBy: { sortOrder: "asc" }, select: { id: true, image: true, caption: true } },
      children: {
        where: { isActive: true, isArchived: false },
        select: {
          id: true, name: true, slug: true, cover: true,
          translations: { where: { locale }, select: { name: true } },
          gallery: { orderBy: { sortOrder: "asc" }, select: { id: true, image: true, caption: true } },
        },
      },
    },
  });

  return categories
    .map((cat) => {
      const categoryName = cat.translations[0]?.name ?? cat.name ?? "Service";
      const images: { id: string; src: string; caption: string | null; serviceName: string }[] = [];

      for (const g of cat.gallery) {
        images.push({ id: g.id, src: g.image, caption: g.caption, serviceName: categoryName });
      }
      if (cat.cover) {
        images.push({ id: `cover-${cat.id}`, src: cat.cover, caption: null, serviceName: categoryName });
      }
      for (const child of cat.children) {
        const childName = child.translations[0]?.name ?? child.name ?? categoryName;
        if (child.cover) {
          images.push({ id: `cover-${child.id}`, src: child.cover, caption: null, serviceName: childName });
        }
        for (const g of child.gallery) {
          images.push({ id: g.id, src: g.image, caption: g.caption, serviceName: childName });
        }
      }

      return { id: cat.id, slug: cat.slug, name: categoryName, images };
    })
    .filter((c) => c.images.length > 0);
}

export default async function GalleriePage({ searchParams }: { searchParams?: SearchParamsPromise }) {
  const locale = await resolveContentLocale(searchParams);
  const categories = await getGalleryData(locale);
  const totalImages = categories.reduce((sum, c) => sum + c.images.length, 0);
  const alts = buildAlternates("/gallerie", locale);

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: metaTitles[locale],
    description: metaDescriptions[locale],
    url: alts.canonical,
    numberOfItems: totalImages,
    provider: {
      "@type": "BeautySalon", name: "Salon Elen",
      address: { "@type": "PostalAddress", streetAddress: "Lessingstraße 37", postalCode: "06114", addressLocality: "Halle (Saale)", addressCountry: "DE" },
    },
  });

  return (
    <>
      <GallerieClient locale={locale} categories={categories} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </>
  );
}




//-----------работал до 14.02.26 исправляем для SEO
// // src/app/gallerie/page.tsx
// import type { Metadata } from "next";
// import { cookies } from "next/headers";
// import { prisma } from "@/lib/db";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import GallerieClient from "./GallerieClient";

// export const dynamic = "force-dynamic";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";
// const PAGE_PATH = "/gallerie";

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(sp?: SearchParamsPromise): Promise<string | undefined> {
//   const resolved = sp ? await sp : undefined;
//   const raw = resolved?.lang;
//   return Array.isArray(raw) ? raw[0] : raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;
//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;
//   return DEFAULT_LOCALE;
// }

// function pageUrl(locale: Locale) {
//   return locale === "de" ? `${SITE_URL}${PAGE_PATH}` : `${SITE_URL}${PAGE_PATH}?lang=${locale}`;
// }

// const metaTitles: Record<Locale, string> = {
//   de: "Galerie — Salon Elen | Unsere Arbeiten in Halle (Saale)",
//   ru: "Галерея — Salon Elen | Наши работы в Галле (Заале)",
//   en: "Gallery — Salon Elen | Our Works in Halle (Saale)",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Entdecken Sie unsere Arbeiten: Permanent Make-up, Nageldesign, Wimpernverlängerung, Microneedling und mehr.",
//   ru: "Посмотрите наши работы: перманентный макияж, дизайн ногтей, наращивание ресниц и многое другое.",
//   en: "Discover our works: permanent make-up, nail design, eyelash extensions, microneedling and more.",
// };

// export async function generateMetadata({ searchParams }: { searchParams?: SearchParamsPromise }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);
//   return {
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],
//     alternates: {
//       canonical: pageUrl(locale),
//       languages: { de: pageUrl("de"), en: pageUrl("en"), ru: pageUrl("ru") },
//     },
//     openGraph: {
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       url: pageUrl(locale),
//       images: ["/images/hero.webp"],
//       siteName: "Salon Elen",
//       locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
//       type: "website",
//     },
//   };
// }

// async function getGalleryData(locale: Locale) {
//   const categories = await prisma.service.findMany({
//     where: { parentId: null, isArchived: false, isActive: true },
//     orderBy: { name: "asc" },
//     select: {
//       id: true, slug: true, name: true, cover: true,
//       translations: { where: { locale }, select: { name: true } },
//       gallery: { orderBy: { sortOrder: "asc" }, select: { id: true, image: true, caption: true } },
//       children: {
//         where: { isActive: true, isArchived: false },
//         select: {
//           id: true, name: true, slug: true, cover: true,
//           translations: { where: { locale }, select: { name: true } },
//           gallery: { orderBy: { sortOrder: "asc" }, select: { id: true, image: true, caption: true } },
//         },
//       },
//     },
//   });

//   return categories
//     .map((cat) => {
//       const images: { id: string; src: string; caption: string | null; serviceName: string }[] = [];

//       for (const g of cat.gallery) {
//         images.push({ id: g.id, src: g.image, caption: g.caption, serviceName: cat.translations[0]?.name || cat.name });
//       }
//       if (cat.cover) {
//         images.push({ id: `cover-${cat.id}`, src: cat.cover, caption: null, serviceName: cat.translations[0]?.name || cat.name });
//       }
//       for (const child of cat.children) {
//         const childName = child.translations[0]?.name || child.name;
//         if (child.cover) {
//           images.push({ id: `cover-${child.id}`, src: child.cover, caption: null, serviceName: childName });
//         }
//         for (const g of child.gallery) {
//           images.push({ id: g.id, src: g.image, caption: g.caption, serviceName: childName });
//         }
//       }

//       return { id: cat.id, slug: cat.slug, name: cat.translations[0]?.name || cat.name, images };
//     })
//     .filter((c) => c.images.length > 0);
// }

// export default async function GalleriePage({ searchParams }: { searchParams?: SearchParamsPromise }) {
//   const locale = await resolveLocale(searchParams);
//   const categories = await getGalleryData(locale);
//   const totalImages = categories.reduce((sum, c) => sum + c.images.length, 0);

//   const jsonLd = JSON.stringify({
//     "@context": "https://schema.org",
//     "@type": "ImageGallery",
//     name: metaTitles[locale],
//     description: metaDescriptions[locale],
//     url: pageUrl(locale),
//     numberOfItems: totalImages,
//     provider: {
//       "@type": "BeautySalon", name: "Salon Elen",
//       address: { "@type": "PostalAddress", streetAddress: "Lessingstraße 37", postalCode: "06114", addressLocality: "Halle (Saale)", addressCountry: "DE" },
//     },
//   });

//   return (
//     <>
//       <GallerieClient locale={locale} categories={categories} />
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
//     </>
//   );
// }




//--------работает но хочу сделать сферу-----
// // src/app/gallerie/page.tsx
// import type { Metadata } from "next";
// import { cookies } from "next/headers";
// import { prisma } from "@/lib/db";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import GallerieClient from "./GallerieClient";

// export const dynamic = "force-dynamic";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";
// const PAGE_PATH = "/gallerie";

// /* ─────────────────── locale ─────────────────── */

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   sp?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const resolved = sp ? await sp : undefined;
//   const raw = resolved?.lang;
//   return Array.isArray(raw) ? raw[0] : raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return DEFAULT_LOCALE;
// }

// function pageUrl(locale: Locale) {
//   return locale === "de" ? `${SITE_URL}${PAGE_PATH}` : `${SITE_URL}${PAGE_PATH}?lang=${locale}`;
// }

// /* ─────────────────── SEO ─────────────────── */

// const metaTitles: Record<Locale, string> = {
//   de: "Galerie — Salon Elen | Unsere Arbeiten in Halle (Saale)",
//   ru: "\u0413\u0430\u043B\u0435\u0440\u0435\u044F — Salon Elen | \u041D\u0430\u0448\u0438 \u0440\u0430\u0431\u043E\u0442\u044B \u0432 \u0413\u0430\u043B\u043B\u0435 (\u0417\u0430\u0430\u043B\u0435)",
//   en: "Gallery — Salon Elen | Our Works in Halle (Saale)",
// };

// const metaDescriptions: Record<Locale, string> = {
//   de: "Entdecken Sie unsere Arbeiten: Permanent Make-up, Nageldesign, Wimpernverl\u00E4ngerung, Microneedling und mehr. Professionelle Ergebnisse im Salon Elen.",
//   ru: "\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0438\u0442\u0435 \u043D\u0430\u0448\u0438 \u0440\u0430\u0431\u043E\u0442\u044B: \u043F\u0435\u0440\u043C\u0430\u043D\u0435\u043D\u0442\u043D\u044B\u0439 \u043C\u0430\u043A\u0438\u044F\u0436, \u0434\u0438\u0437\u0430\u0439\u043D \u043D\u043E\u0433\u0442\u0435\u0439, \u043D\u0430\u0440\u0430\u0449\u0438\u0432\u0430\u043D\u0438\u0435 \u0440\u0435\u0441\u043D\u0438\u0446, \u043C\u0438\u043A\u0440\u043E\u043D\u0438\u0434\u043B\u0438\u043D\u0433 \u0438 \u043C\u043D\u043E\u0433\u043E\u0435 \u0434\u0440\u0443\u0433\u043E\u0435.",
//   en: "Discover our works: permanent make-up, nail design, eyelash extensions, microneedling and more. Professional results at Salon Elen.",
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
//       canonical: pageUrl(locale),
//       languages: { de: pageUrl("de"), en: pageUrl("en"), ru: pageUrl("ru") },
//     },
//     openGraph: {
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       url: pageUrl(locale),
//       images: ["/images/hero.webp"],
//       siteName: "Salon Elen",
//       locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
//       type: "website",
//     },
//   };
// }

// /* ─────────────────── data ─────────────────── */

// async function getGalleryData(locale: Locale) {
//   const categories = await prisma.service.findMany({
//     where: { parentId: null, isArchived: false, isActive: true },
//     orderBy: { name: "asc" },
//     select: {
//       id: true,
//       slug: true,
//       name: true,
//       cover: true,
//       translations: {
//         where: { locale },
//         select: { name: true },
//       },
//       gallery: {
//         orderBy: { sortOrder: "asc" },
//         select: { id: true, image: true, caption: true },
//       },
//       children: {
//         where: { isActive: true, isArchived: false },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           cover: true,
//           translations: {
//             where: { locale },
//             select: { name: true },
//           },
//           gallery: {
//             orderBy: { sortOrder: "asc" },
//             select: { id: true, image: true, caption: true },
//           },
//         },
//       },
//     },
//   });

//   return categories
//     .map((cat) => {
//       const images: { id: string; src: string; caption: string | null; serviceName: string }[] = [];

//       for (const g of cat.gallery) {
//         images.push({
//           id: g.id,
//           src: g.image,
//           caption: g.caption,
//           serviceName: cat.translations[0]?.name || cat.name,
//         });
//       }

//       if (cat.cover) {
//         images.push({
//           id: `cover-${cat.id}`,
//           src: cat.cover,
//           caption: null,
//           serviceName: cat.translations[0]?.name || cat.name,
//         });
//       }

//       for (const child of cat.children) {
//         const childName = child.translations[0]?.name || child.name;

//         if (child.cover) {
//           images.push({
//             id: `cover-${child.id}`,
//             src: child.cover,
//             caption: null,
//             serviceName: childName,
//           });
//         }

//         for (const g of child.gallery) {
//           images.push({
//             id: g.id,
//             src: g.image,
//             caption: g.caption,
//             serviceName: childName,
//           });
//         }
//       }

//       return {
//         id: cat.id,
//         slug: cat.slug,
//         name: cat.translations[0]?.name || cat.name,
//         images,
//       };
//     })
//     .filter((c) => c.images.length > 0);
// }

// /* ─────────────────── PAGE ─────────────────── */

// export default async function GalleriePage({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }) {
//   const locale = await resolveLocale(searchParams);
//   const categories = await getGalleryData(locale);
//   const totalImages = categories.reduce((sum, c) => sum + c.images.length, 0);

//   const jsonLd = JSON.stringify({
//     "@context": "https://schema.org",
//     "@type": "ImageGallery",
//     name: metaTitles[locale],
//     description: metaDescriptions[locale],
//     url: pageUrl(locale),
//     numberOfItems: totalImages,
//     provider: {
//       "@type": "BeautySalon",
//       name: "Salon Elen",
//       address: {
//         "@type": "PostalAddress",
//         streetAddress: "Lessingstra\u00DFe 37",
//         postalCode: "06114",
//         addressLocality: "Halle (Saale)",
//         addressCountry: "DE",
//       },
//     },
//   });

//   return (
//     <>
//       <GallerieClient locale={locale} categories={categories} />
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: jsonLd }}
//       />
//     </>
//   );
// }




//--------была заглушка-------
// import Image from "next/image";
// import Section from "@/components/section";

// export const metadata = { title: "Галерея — Salon Elen" };

// const files = ["g1.jpg","g2.jpg","g3.jpg","g4.jpg","g5.jpg"];

// export default function GalleryPage() {
//   return (
//     <main>
//       <Section title="Галерея" subtitle="Наши работы">
//         {/* Простая адаптивная сетка */}
//         <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
//           {files.map((file, i) => (
//             <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200/70 dark:border-gray-800">
//               <Image
//                 src={`/images/gallery/${file}`}
//                 alt={`Работа ${i + 1}`}
//                 fill
//                 className="object-cover"
//                 sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
//               />
//             </div>
//           ))}
//         </div>
//       </Section>
//     </main>
//   );
// }
