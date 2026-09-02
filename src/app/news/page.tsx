// src/app/news/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import {
  resolveUrlLocale,
  buildAlternates,
  BASE_URL,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";
import { resolveContentLocale } from "@/lib/seo-locale-server";
import { PUBLIC_NEWS_TAG } from "@/lib/cache-tags";

export const dynamic = "force-dynamic";

const PUBLIC_NEWS_REVALIDATE_SECONDS = 900;

const metaTitles: Record<SeoLocale, string> = {
  de: "Neuigkeiten & Aktionen — Salon Elen",
  ru: "Новости и акции — Salon Elen",
  en: "News & Promotions — Salon Elen",
};

const metaDescriptions: Record<SeoLocale, string> = {
  de: "Aktuelle Neuigkeiten, Sonderangebote und Aktionen im Salon Elen in Halle (Saale).",
  ru: "Актуальные новости, спецпредложения и акции салона Salon Elen в Галле (Заале).",
  en: "Latest news, special offers and promotions at Salon Elen in Halle (Saale).",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const alts = buildAlternates("/news", locale);

  return {
    title: metaTitles[locale],
    description: metaDescriptions[locale],
    alternates: alts,
    robots: { index: true, follow: true, "max-image-preview": "large" as const },
    openGraph: {
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      url: alts.canonical,
      images: [`${BASE_URL}/images/hero.webp`],
      siteName: "Salon Elen",
      type: "website",
    },
  };
}

const pageTitle: Record<string, string> = {
  de: "Neuigkeiten und Aktionen",
  ru: "Новости и акции",
  en: "News and Promotions",
};

const readMore: Record<string, string> = {
  de: "Weiterlesen →",
  ru: "Читать дальше →",
  en: "Read more →",
};

const noImage: Record<string, string> = {
  de: "Kein Bild",
  ru: "Нет изображения",
  en: "No image",
};

const pageSize = 6;
const prevPageText: Record<string, string> = {
  de: "← Zurück",
  ru: "← Назад",
  en: "← Previous",
};
const nextPageText: Record<string, string> = {
  de: "Weiter →",
  ru: "Далее →",
  en: "Next →",
};

const getNewsPageData = unstable_cache(
  async (locale: SeoLocale, requestedPage: number) => {
    const now = new Date();
    const where = {
      AND: [
        { OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
      ],
    };

    const totalItems = await prisma.article.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(requestedPage, totalPages);
    const skip = (currentPage - 1) * pageSize;

    const items = await prisma.article.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { sortOrder: "desc" },
        { publishedAt: "desc" },
      ],
      skip,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        cover: true,
        isPinned: true,
        videoUrl: true,
        translations: {
          where: { locale },
          select: { title: true, excerpt: true },
        },
      },
    });

    return { currentPage, items, totalPages };
  },
  ["public-news-page-data"],
  {
    revalidate: PUBLIC_NEWS_REVALIDATE_SECONDS,
    tags: [PUBLIC_NEWS_TAG],
  },
);

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const sp = searchParams ? await searchParams : {};
  const locale = await resolveContentLocale(searchParams);
  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const parsedPage = Number(rawPage ?? "1");
  const requestedPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;

  const { currentPage, items, totalPages } = await getNewsPageData(
    locale,
    requestedPage,
  );

  const baseParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (key === "page") continue;
    if (Array.isArray(value)) {
      if (value[0]) baseParams.set(key, value[0]);
      continue;
    }
    if (typeof value === "string" && value !== "") baseParams.set(key, value);
  }
  const pageHref = (page: number) => {
    const params = new URLSearchParams(baseParams);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/news?${qs}` : "/news";
  };

  return (
    <main className="px-4">
      <section className="mx-auto max-w-5xl py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
          {pageTitle[locale] || pageTitle.de}
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => {
            const translation = n.translations[0];
            const title = translation?.title || n.title;
            const excerpt = translation?.excerpt || n.excerpt;

            return (
              <Link
                key={n.id}
                href={`/news/${n.slug}`}
                className={`group rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                  n.isPinned
                    ? "border-amber-400/40 ring-1 ring-amber-400/20"
                    : "border-gray-200/70 dark:border-gray-800"
                }`}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {n.cover ? (
                    n.cover.startsWith("/uploads/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.cover}
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <Image
                        src={n.cover}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-sm opacity-60">
                      {noImage[locale] || noImage.de}
                    </div>
                  )}

                  {/* Бейджи */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {n.isPinned && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 text-white text-xs font-medium px-2 py-0.5 backdrop-blur-sm">
                        📌
                      </span>
                    )}
                    {n.videoUrl && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-xs font-medium px-2 py-0.5 backdrop-blur-sm">
                        ▶
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-medium line-clamp-2">{title}</h3>
                  {excerpt && (
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                      {excerpt}
                    </p>
                  )}
                  <span className="mt-3 inline-block text-sm opacity-70">
                    {readMore[locale] || readMore.de}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3">
            {currentPage > 1 ? (
              <Link
                href={pageHref(currentPage - 1)}
                className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-white/5"
              >
                {prevPageText[locale] || prevPageText.de}
              </Link>
            ) : (
              <span className="rounded-full border px-4 py-2 text-sm opacity-40">
                {prevPageText[locale] || prevPageText.de}
              </span>
            )}

            <span className="text-sm opacity-70">
              {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={pageHref(currentPage + 1)}
                className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-white/5"
              >
                {nextPageText[locale] || nextPageText.de}
              </Link>
            ) : (
              <span className="rounded-full border px-4 py-2 text-sm opacity-40">
                {nextPageText[locale] || nextPageText.de}
              </span>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}



//-------14.02.26 добавляем возможность редактирования SEO и видео -----------
// // src/app/news/page.tsx
// import Link from "next/link";
// import Image from "next/image";
// import { prisma } from "@/lib/db";
// import type { Metadata } from "next";
// import {
//   resolveUrlLocale,
//   resolveContentLocale,
//   buildAlternates,
//   BASE_URL,
//   type SeoLocale,
//   type SearchParamsPromise,
// } from "@/lib/seo-locale";

// // Отключаем кэширование страницы чтобы новые новости появлялись сразу
// export const dynamic = "force-dynamic";

// const metaTitles: Record<SeoLocale, string> = {
//   de: "Neuigkeiten & Aktionen — Salon Elen",
//   ru: "Новости и акции — Salon Elen",
//   en: "News & Promotions — Salon Elen",
// };

// const metaDescriptions: Record<SeoLocale, string> = {
//   de: "Aktuelle Neuigkeiten, Sonderangebote und Aktionen im Salon Elen in Halle (Saale).",
//   ru: "Актуальные новости, спецпредложения и акции салона Salon Elen в Галле (Заале).",
//   en: "Latest news, special offers and promotions at Salon Elen in Halle (Saale).",
// };

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveUrlLocale(searchParams);
//   const alts = buildAlternates("/news", locale);

//   return {
//     title: metaTitles[locale],
//     description: metaDescriptions[locale],
//     alternates: alts,
//     openGraph: {
//       title: metaTitles[locale],
//       description: metaDescriptions[locale],
//       url: alts.canonical,
//       images: [`${BASE_URL}/images/hero.webp`],
//       siteName: "Salon Elen",
//       type: "website",
//     },
//   };
// }

// // Заголовки страницы на разных языках
// const pageTitle: Record<string, string> = {
//   de: "Neuigkeiten und Aktionen",
//   ru: "Новости и акции",
//   en: "News and Promotions",
// };

// const readMore: Record<string, string> = {
//   de: "Weiterlesen →",
//   ru: "Читать дальше →",
//   en: "Read more →",
// };

// const noImage: Record<string, string> = {
//   de: "Kein Bild",
//   ru: "Нет изображения",
//   en: "No image",
// };

// export default async function Page({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }) {
//   const locale = await resolveContentLocale(searchParams);
  

//   const items = await prisma.article.findMany({
//     where: {
//       AND: [
//         { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
//         { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
//       ],
//     },
//     orderBy: { publishedAt: "desc" },
//     take: 30,
//     include: {
//       translations: {
//         where: { locale },
//         select: { title: true, excerpt: true },
//       },
//     },
//   });

//   return (
//     <main className="px-4">
//       <section className="mx-auto max-w-5xl py-8">
//         <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
//           {pageTitle[locale] || pageTitle.de}
//         </h1>

//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {items.map((n) => {
//             // Используем перевод если есть, иначе оригинал
//             const translation = n.translations[0];
//             const title = translation?.title || n.title;
//             const excerpt = translation?.excerpt || n.excerpt;

//             return (
//               <Link
//                 key={n.id}
//                 href={`/news/${n.slug}`}
//                 className="group rounded-2xl border border-gray-200/70 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className="relative aspect-[16/9] overflow-hidden">
//                   {n.cover ? (
//                     n.cover.startsWith("/uploads/") ? (
//                       // Для загруженных картинок - обычный img без кэширования
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img
//                         src={n.cover}
//                         alt={title}
//                         className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                       />
//                     ) : (
//                       <Image
//                         src={n.cover}
//                         alt={title}
//                         fill
//                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
//                         className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                       />
//                     )
//                   ) : (
//                     <div className="absolute inset-0 grid place-items-center text-sm opacity-60">
//                       {noImage[locale] || noImage.de}
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-4">
//                   <h3 className="text-lg font-medium line-clamp-2">{title}</h3>
//                   {excerpt && (
//                     <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
//                       {excerpt}
//                     </p>
//                   )}
//                   <span className="mt-3 inline-block text-sm opacity-70">
//                     {readMore[locale] || readMore.de}
//                   </span>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       </section>
//     </main>
//   );
// }



//--------исправляем 14.02.26 для SEO
// import Link from "next/link";
// import Image from "next/image";
// import { cookies } from "next/headers";
// import { prisma } from "@/lib/db";

// // Отключаем кэширование страницы чтобы новые новости появлялись сразу
// export const dynamic = "force-dynamic";

// // Заголовки страницы на разных языках
// const pageTitle: Record<string, string> = {
//   de: "Neuigkeiten und Aktionen",
//   ru: "Новости и акции",
//   en: "News and Promotions",
// };

// const readMore: Record<string, string> = {
//   de: "Weiterlesen →",
//   ru: "Читать дальше →",
//   en: "Read more →",
// };

// const noImage: Record<string, string> = {
//   de: "Kein Bild",
//   ru: "Нет изображения",
//   en: "No image",
// };

// export default async function Page() {
//   // Получаем локаль из cookies
//   const cookieStore = await cookies();
//   const locale = cookieStore.get("locale")?.value || "de";
  
//   console.log("[NEWS PAGE] locale from cookie:", locale);
//   console.log("[NEWS PAGE] all cookies:", cookieStore.getAll());

//   const items = await prisma.article.findMany({
//     where: {
//       AND: [
//         { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
//         { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
//       ],
//     },
//     orderBy: { publishedAt: "desc" },
//     take: 30,
//     include: {
//       translations: {
//         where: { locale },
//         select: { title: true, excerpt: true },
//       },
//     },
//   });

//   return (
//     <main className="px-4">
//       <section className="mx-auto max-w-5xl py-8">
//         <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
//           {pageTitle[locale] || pageTitle.de}
//         </h1>

//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {items.map((n) => {
//             // Используем перевод если есть, иначе оригинал
//             const translation = n.translations[0];
//             const title = translation?.title || n.title;
//             const excerpt = translation?.excerpt || n.excerpt;

//             return (
//               <Link
//                 key={n.id}
//                 href={`/news/${n.slug}`}
//                 className="group rounded-2xl border border-gray-200/70 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className="relative aspect-[16/9] overflow-hidden">
//                   {n.cover ? (
//                     n.cover.startsWith("/uploads/") ? (
//                       // Для загруженных картинок - обычный img без кэширования
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img
//                         src={n.cover}
//                         alt={title}
//                         className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                       />
//                     ) : (
//                       <Image
//                         src={n.cover}
//                         alt={title}
//                         fill
//                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
//                         className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                       />
//                     )
//                   ) : (
//                     <div className="absolute inset-0 grid place-items-center text-sm opacity-60">
//                       {noImage[locale] || noImage.de}
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-4">
//                   <h3 className="text-lg font-medium line-clamp-2">{title}</h3>
//                   {excerpt && (
//                     <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
//                       {excerpt}
//                     </p>
//                   )}
//                   <span className="mt-3 inline-block text-sm opacity-70">
//                     {readMore[locale] || readMore.de}
//                   </span>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       </section>
//     </main>
//   );
// }



//---------пишем логи
// // src/app/news/page.tsx
// import Link from "next/link";
// import Image from "next/image";
// import { cookies } from "next/headers";
// import { prisma } from "@/lib/db";

// // Отключаем кэширование страницы чтобы новые новости появлялись сразу
// export const dynamic = "force-dynamic";

// // Заголовки страницы на разных языках
// const pageTitle: Record<string, string> = {
//   de: "Neuigkeiten und Aktionen",
//   ru: "Новости и акции",
//   en: "News and Promotions",
// };

// const readMore: Record<string, string> = {
//   de: "Weiterlesen →",
//   ru: "Читать дальше →",
//   en: "Read more →",
// };

// const noImage: Record<string, string> = {
//   de: "Kein Bild",
//   ru: "Нет изображения",
//   en: "No image",
// };

// export default async function Page() {
//   // Получаем локаль из cookies
//   const cookieStore = await cookies();
//   const locale = cookieStore.get("locale")?.value || "de";

//   const items = await prisma.article.findMany({
//     where: {
//       AND: [
//         { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
//         { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
//       ],
//     },
//     orderBy: { publishedAt: "desc" },
//     take: 30,
//     include: {
//       translations: {
//         where: { locale },
//         select: { title: true, excerpt: true },
//       },
//     },
//   });

//   return (
//     <main className="px-4">
//       <section className="mx-auto max-w-5xl py-8">
//         <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
//           {pageTitle[locale] || pageTitle.de}
//         </h1>

//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {items.map((n) => {
//             // Используем перевод если есть, иначе оригинал
//             const translation = n.translations[0];
//             const title = translation?.title || n.title;
//             const excerpt = translation?.excerpt || n.excerpt;

//             return (
//               <Link
//                 key={n.id}
//                 href={`/news/${n.slug}`}
//                 className="group rounded-2xl border border-gray-200/70 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <div className="relative aspect-[16/9] overflow-hidden">
//                   {n.cover ? (
//                     n.cover.startsWith("/uploads/") ? (
//                       // Для загруженных картинок - обычный img без кэширования
//                       // eslint-disable-next-line @next/next/no-img-element
//                       <img
//                         src={n.cover}
//                         alt={title}
//                         className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                       />
//                     ) : (
//                       <Image
//                         src={n.cover}
//                         alt={title}
//                         fill
//                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
//                         className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                       />
//                     )
//                   ) : (
//                     <div className="absolute inset-0 grid place-items-center text-sm opacity-60">
//                       {noImage[locale] || noImage.de}
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-4">
//                   <h3 className="text-lg font-medium line-clamp-2">{title}</h3>
//                   {excerpt && (
//                     <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
//                       {excerpt}
//                     </p>
//                   )}
//                   <span className="mt-3 inline-block text-sm opacity-70">
//                     {readMore[locale] || readMore.de}
//                   </span>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       </section>
//     </main>
//   );
// }
