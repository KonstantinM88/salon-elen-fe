// src/app/services/page.tsx
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

const SUPPORTED = ["de", "ru", "en"] as const;
type SeoLocale = (typeof SUPPORTED)[number];

type SearchParams = Record<string, string | string[] | undefined>;
type SearchParamsPromise = Promise<SearchParams>;

function isSeoLocale(v: unknown): v is SeoLocale {
  return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
}

async function getLangFromSearchParams(
  searchParams?: SearchParamsPromise,
): Promise<string | undefined> {
  const sp = searchParams ? await searchParams : undefined;
  const raw = sp?.lang;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

async function resolveLocale(searchParams?: SearchParamsPromise): Promise<SeoLocale> {
  const urlLang = await getLangFromSearchParams(searchParams);
  if (isSeoLocale(urlLang)) return urlLang;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  if (isSeoLocale(cookieLocale)) return cookieLocale;

  return "de";
}

const metaTitles: Record<SeoLocale, string> = {
  de: "Unsere Leistungen — Salon Elen",
  ru: "Наши услуги — Salon Elen",
  en: "Our Services — Salon Elen",
};

const metaDescriptions: Record<SeoLocale, string> = {
  de: "Entdecken Sie unser komplettes Angebot an Schönheitsdienstleistungen: Haarpflege, Maniküre, Make-up und vieles mehr.",
  ru: "Откройте для себя полный спектр услуг красоты: уход за волосами, маникюр, макияж и многое другое.",
  en: "Discover our complete range of beauty services: hair care, manicure, makeup and much more.",
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
    alternates: {
      canonical: locale === "de" ? "/services" : `/services?lang=${locale}`,
      languages: {
        de: "/services",
        ru: "/services?lang=ru",
        en: "/services?lang=en",
        "x-default": "/services",
      },
    },
  };
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const locale = await resolveLocale(searchParams);

  const categories = await prisma.service.findMany({
    where: {
      isActive: true,
      isArchived: false,
      parentId: null,
    },
    orderBy: { name: "asc" },
    include: {
      translations: {
        where: { locale },
        select: { name: true, description: true },
      },
      gallery: {
        orderBy: { sortOrder: "asc" },
        take: 6,
      },
      children: {
        where: {
          isActive: true,
          isArchived: false,
        },
        orderBy: { name: "asc" },
        include: {
          translations: {
            where: { locale },
            select: { name: true, description: true },
          },
          gallery: {
            orderBy: { sortOrder: "asc" },
            take: 6,
          },
        },
      },
    },
  });

  const categoriesWithTranslations = categories.map((cat) => {
    const catTranslation = cat.translations[0];
    return {
      id: cat.id,
      slug: cat.slug,
      name: catTranslation?.name || cat.name,
      description: catTranslation?.description || cat.description,
      cover: cat.cover,
      gallery: cat.gallery.map((g) => ({
        id: g.id,
        image: g.image,
        caption: g.caption,
      })),
      children: cat.children.map((child) => {
        const childTranslation = child.translations[0];
        return {
          id: child.id,
          slug: child.slug,
          name: childTranslation?.name || child.name,
          description: childTranslation?.description || child.description,
          priceCents: child.priceCents,
          durationMin: child.durationMin,
          cover: child.cover,
          gallery: child.gallery.map((g) => ({
            id: g.id,
            image: g.image,
            caption: g.caption,
          })),
        };
      }),
    };
  });

  return <ServicesClient categories={categoriesWithTranslations} locale={locale} />;
}





//-----------03.02.26 меняю почему-то ещё раз
// // src/app/services/page.tsx
// import { cookies } from "next/headers";
// import { prisma } from "@/lib/db";
// import type { Metadata } from "next";
// import ServicesClient from "./ServicesClient";

// export const dynamic = "force-dynamic";

// // ===== SEO / i18n helpers =====
// const SUPPORTED = ["de", "ru", "en"] as const;
// type SeoLocale = (typeof SUPPORTED)[number];

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isSeoLocale(v: unknown): v is SeoLocale {
//   return typeof v === "string" && (SUPPORTED as readonly string[]).includes(v);
// }

// function getLangFromSearchParamsObj(sp?: SearchParams): string | undefined {
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<SeoLocale> {
//   const sp = searchParams ? await searchParams : undefined;

//   const urlLang = getLangFromSearchParamsObj(sp);
//   if (isSeoLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isSeoLocale(cookieLocale)) return cookieLocale;

//   return "de";
// }

// // Переводы мета-данных
// const metaTitles: Record<SeoLocale, string> = {
//   de: "Unsere Leistungen — Salon Elen",
//   ru: "Наши услуги — Salon Elen",
//   en: "Our Services — Salon Elen",
// };

// const metaDescriptions: Record<SeoLocale, string> = {
//   de: "Entdecken Sie unser komplettes Angebot an Schönheitsdienstleistungen: Haarpflege, Maniküre, Make-up und vieles mehr.",
//   ru: "Откройте для себя полный спектр услуг красоты: уход за волосами, маникюр, макияж и многое другое.",
//   en: "Discover our complete range of beauty services: hair care, manicure, makeup and much more.",
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
//       canonical: "/services",
//       languages: {
//         de: "/services",
//         ru: "/services?lang=ru",
//         en: "/services?lang=en",
//         "x-default": "/services",
//       },
//     },
//   };
// }

// export default async function ServicesPage({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }) {
//   const locale = await resolveLocale(searchParams);

//   const categories = await prisma.service.findMany({
//     where: {
//       isActive: true,
//       isArchived: false,
//       parentId: null,
//     },
//     orderBy: { name: "asc" },
//     include: {
//       translations: {
//         where: { locale },
//         select: { name: true, description: true },
//       },
//       gallery: {
//         orderBy: { sortOrder: "asc" },
//         take: 6,
//       },
//       children: {
//         where: {
//           isActive: true,
//           isArchived: false,
//         },
//         orderBy: { name: "asc" },
//         include: {
//           translations: {
//             where: { locale },
//             select: { name: true, description: true },
//           },
//           gallery: {
//             orderBy: { sortOrder: "asc" },
//             take: 6,
//           },
//         },
//       },
//     },
//   });

//   const categoriesWithTranslations = categories.map((cat) => {
//     const catTranslation = cat.translations[0];
//     return {
//       id: cat.id,
//       slug: cat.slug,
//       name: catTranslation?.name || cat.name,
//       description: catTranslation?.description || cat.description,
//       cover: cat.cover,
//       gallery: cat.gallery.map((g) => ({
//         id: g.id,
//         image: g.image,
//         caption: g.caption,
//       })),
//       children: cat.children.map((child) => {
//         const childTranslation = child.translations[0];
//         return {
//           id: child.id,
//           slug: child.slug,
//           name: childTranslation?.name || child.name,
//           description: childTranslation?.description || child.description,
//           priceCents: child.priceCents,
//           durationMin: child.durationMin,
//           cover: child.cover,
//           gallery: child.gallery.map((g) => ({
//             id: g.id,
//             image: g.image,
//             caption: g.caption,
//           })),
//         };
//       }),
//     };
//   });

//   return <ServicesClient categories={categoriesWithTranslations} locale={locale} />;
// }






//---------03.02.26 меняем для SEO-------
// // src/app/services/page.tsx
  // import { cookies } from "next/headers";
  // import { prisma } from "@/lib/db";
  // import { Metadata } from "next";
  // import ServicesClient from "./ServicesClient";


  // export const dynamic = "force-dynamic";

  // // Переводы мета-данных
  // const metaTitles: Record<string, string> = {
  //   de: "Unsere Leistungen — Salon Elen",
  //   ru: "Наши услуги — Salon Elen",
  //   en: "Our Services — Salon Elen",
  // };

  // const metaDescriptions: Record<string, string> = {
  //   de: "Entdecken Sie unser komplettes Angebot an Schönheitsdienstleistungen: Haarpflege, Maniküre, Make-up und vieles mehr.",
  //   ru: "Откройте для себя полный спектр услуг красоты: уход за волосами, маникюр, макияж и многое другое.",
  //   en: "Discover our complete range of beauty services: hair care, manicure, makeup and much more.",
  // };

  // export async function generateMetadata(): Promise<Metadata> {
  //   const cookieStore = await cookies();
  //   const locale = cookieStore.get("locale")?.value || "de";
    
  //   return {
  //     title: metaTitles[locale] || metaTitles.de,
  //     description: metaDescriptions[locale] || metaDescriptions.de,
  //   };
  // }

  // export default async function ServicesPage() {
  //   const cookieStore = await cookies();
  //   const locale = cookieStore.get("locale")?.value || "de";

  //   // Загружаем категории (родительские услуги)
  //   const categories = await prisma.service.findMany({
  //     where: {
  //       isActive: true,
  //       isArchived: false,
  //       parentId: null,
  //     },
  //     orderBy: { name: "asc" },
  //     include: {
  //       translations: {
  //         where: { locale },
  //         select: { name: true, description: true },
  //       },
  //       gallery: {
  //         orderBy: { sortOrder: "asc" },
  //         take: 6,
  //       },
  //       children: {
  //         where: {
  //           isActive: true,
  //           isArchived: false,
  //         },
  //         orderBy: { name: "asc" },
  //         include: {
  //           translations: {
  //             where: { locale },
  //             select: { name: true, description: true },
  //           },
  //           gallery: {
  //             orderBy: { sortOrder: "asc" },
  //             take: 6,
  //           },
  //         },
  //       },
  //     },
  //   });

  //   // Преобразуем данные с переводами
  //   const categoriesWithTranslations = categories.map((cat) => {
  //     const catTranslation = cat.translations[0];
  //     return {
  //       id: cat.id,
  //       slug: cat.slug,
  //       name: catTranslation?.name || cat.name,
  //       description: catTranslation?.description || cat.description,
  //       cover: cat.cover,
  //       gallery: cat.gallery.map((g) => ({
  //         id: g.id,
  //         image: g.image,
  //         caption: g.caption,
  //       })),
  //       children: cat.children.map((child) => {
  //         const childTranslation = child.translations[0];
  //         return {
  //           id: child.id,
  //           slug: child.slug,
  //           name: childTranslation?.name || child.name,
  //           description: childTranslation?.description || child.description,
  //           priceCents: child.priceCents,
  //           durationMin: child.durationMin,
  //           cover: child.cover,
  //           gallery: child.gallery.map((g) => ({
  //             id: g.id,
  //             image: g.image,
  //             caption: g.caption,
  //           })),
  //         };
  //       }),
  //     };
  //   });

  //   return <ServicesClient categories={categoriesWithTranslations} locale={locale} />;
  // }




// // src/app/services/page.tsx
// import { cookies } from "next/headers";
// import { prisma } from "@/lib/db";
// import { Metadata } from "next";
// import ServicesClient from "./ServicesClient";

// export const dynamic = "force-dynamic";

// // Переводы мета-данных
// const metaTitles: Record<string, string> = {
//   de: "Unsere Leistungen — Salon Elen",
//   ru: "Наши услуги — Salon Elen",
//   en: "Our Services — Salon Elen",
// };

// const metaDescriptions: Record<string, string> = {
//   de: "Entdecken Sie unser komplettes Angebot an Schönheitsdienstleistungen: Haarpflege, Maniküre, Make-up und vieles mehr.",
//   ru: "Откройте для себя полный спектр услуг красоты: уход за волосами, маникюр, макияж и многое другое.",
//   en: "Discover our complete range of beauty services: hair care, manicure, makeup and much more.",
// };

// export async function generateMetadata(): Promise<Metadata> {
//   const cookieStore = await cookies();
//   const locale = cookieStore.get("locale")?.value || "de";
  
//   return {
//     title: metaTitles[locale] || metaTitles.de,
//     description: metaDescriptions[locale] || metaDescriptions.de,
//   };
// }

// export default async function ServicesPage() {
//   const cookieStore = await cookies();
//   const locale = cookieStore.get("locale")?.value || "de";

//   // Загружаем категории (родительские услуги)
//   const categories = await prisma.service.findMany({
//     where: {
//       isActive: true,
//       isArchived: false,
//       parentId: null,
//     },
//     orderBy: { name: "asc" },
//     include: {
//       translations: {
//         where: { locale },
//         select: { name: true, description: true },
//       },
//       gallery: {
//         orderBy: { sortOrder: "asc" },
//         take: 6,
//       },
//       children: {
//         where: {
//           isActive: true,
//           isArchived: false,
//         },
//         orderBy: { name: "asc" },
//         include: {
//           translations: {
//             where: { locale },
//             select: { name: true, description: true },
//           },
//           gallery: {
//             orderBy: { sortOrder: "asc" },
//             take: 6,
//           },
//         },
//       },
//     },
//   });

//   // Преобразуем данные с переводами
//   const categoriesWithTranslations = categories.map((cat) => {
//     const catTranslation = cat.translations[0];
//     return {
//       id: cat.id,
//       slug: cat.slug,
//       name: catTranslation?.name || cat.name,
//       description: catTranslation?.description || cat.description,
//       cover: cat.cover,
//       gallery: cat.gallery.map((g) => ({
//         id: g.id,
//         image: g.image,
//         caption: g.caption,
//       })),
//       children: cat.children.map((child) => {
//         const childTranslation = child.translations[0];
//         return {
//           id: child.id,
//           slug: child.slug,
//           name: childTranslation?.name || child.name,
//           description: childTranslation?.description || child.description,
//           priceCents: child.priceCents,
//           durationMin: child.durationMin,
//           cover: child.cover,
//           gallery: child.gallery.map((g) => ({
//             id: g.id,
//             image: g.image,
//             caption: g.caption,
//           })),
//         };
//       }),
//     };
//   });

//   return <ServicesClient categories={categoriesWithTranslations} locale={locale} />;
// }
