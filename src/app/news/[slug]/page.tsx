import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import {
  resolveUrlLocale,
  resolveContentLocale,
  buildAlternates,
  BASE_URL,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";

// Отключаем кэширование страницы чтобы новые новости появлялись сразу
export const dynamic = "force-dynamic";

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

// Заголовки страницы на разных языках
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

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const locale = await resolveContentLocale(searchParams);
  

  const items = await prisma.article.findMany({
    where: {
      AND: [
        { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: {
      translations: {
        where: { locale },
        select: { title: true, excerpt: true },
      },
    },
  });

  return (
    <main className="px-4">
      <section className="mx-auto max-w-5xl py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
          {pageTitle[locale] || pageTitle.de}
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => {
            // Используем перевод если есть, иначе оригинал
            const translation = n.translations[0];
            const title = translation?.title || n.title;
            const excerpt = translation?.excerpt || n.excerpt;

            return (
              <Link
                key={n.id}
                href={`/news/${n.slug}`}
                className="group rounded-2xl border border-gray-200/70 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {n.cover ? (
                    n.cover.startsWith("/uploads/") ? (
                      // Для загруженных картинок - обычный img без кэширования
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
      </section>
    </main>
  );
}



//-------исправляем 14.02.26 для SEO
// // src/app/news/[slug]/page.tsx
// import { notFound } from "next/navigation";
// import Image from "next/image";
// import { cookies } from "next/headers";
// import { prisma } from "@/lib/db";

// // Отключаем кэширование страницы
// export const dynamic = "force-dynamic";

// /* ---------- utils ---------- */

// function escapeHtml(s: string) {
//   return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
// }
// function inlineHtml(s: string) {
//   let out = escapeHtml(s);
//   out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
//   out = out.replace(/_(.+?)_/g, "<em>$1</em>");
//   return out;
// }

// /** Делим текст на читабельные блоки с «защитой от простыни». */
// function splitToBlocks(raw: string): string[] {
//   const text = raw.trim().replace(/\r\n/g, "\n");
//   if (!text) return [];

//   // 1) Абзацы разделены пустой строкой
//   if (/\n{2,}/.test(text)) {
//     return text.split(/\n{2,}/);
//   }

//   // 2) Одинарные переносы — группируем строки
//   const lines = text.split("\n");
//   if (lines.length > 1) {
//     const blocks: string[] = [];
//     let buf: string[] = [];
//     let mode: "list" | "quote" | null = null;

//     const flush = () => {
//       if (buf.length) blocks.push(buf.join("\n"));
//       buf = [];
//       mode = null;
//     };

//     for (const line of lines) {
//       const t = line.trim();
//       if (!t) {
//         flush();
//         continue;
//       }
//       if (t.startsWith("## ")) {
//         flush();
//         blocks.push(line);
//         continue;
//       }
//       if (t.startsWith("- ")) {
//         if (mode !== "list") flush();
//         mode = "list";
//         buf.push(line);
//         continue;
//       }
//       if (t.startsWith("> ")) {
//         if (mode !== "quote") flush();
//         mode = "quote";
//         buf.push(line);
//         continue;
//       }
//       // обычная строка → самостоятельный абзац
//       flush();
//       blocks.push(line);
//     }
//     flush();
//     return blocks;
//   }

//   // 3) Переносов нет — делим по предложениям
//   const parts: string[] = [];
//   const re = /([^.!?…]+[.!?…]+)(\s+|$)/gu;
//   let m: RegExpExecArray | null;
//   let i = 0;
//   while ((m = re.exec(text))) {
//     parts.push(m[1].trim());
//     i = re.lastIndex;
//   }
//   if (i < text.length) parts.push(text.slice(i).trim());
//   if (parts.length <= 1) return [text];

//   // Сгруппируем предложения в абзацы ~350–450 символов
//   const blocks: string[] = [];
//   let acc = "";

//   for (const sent of parts) {
//     const next = acc ? `${acc} ${sent}` : sent;
//     if (next.length > 420) {
//       if (acc) blocks.push(acc);
//       acc = sent;
//     } else {
//       acc = next;
//     }
//   }
//   if (acc) blocks.push(acc);
//   return blocks;
// }

// /* ---------- renderer ---------- */

// function RichBody({ body }: { body: string }) {
//   const blocks = splitToBlocks(body);
//   let key = 0;
//   return (
//     <div className="prose prose-elen dark:prose-invert">
//       {blocks.map((block) => {
//         key += 1;
//         const trimmed = block.trim();
//         const lines = block.split("\n");

//         // список
//         if (lines.every((l) => l.trim().startsWith("- "))) {
//           const items = lines.map((l) => l.replace(/^-+\s*/, "").trim()).filter(Boolean);
//           return (
//             <ul key={key}>
//               {items.map((it, i) => (
//                 <li key={i} dangerouslySetInnerHTML={{ __html: inlineHtml(it) }} />
//               ))}
//             </ul>
//           );
//         }

//         // цитата
//         if (lines.every((l) => l.trim().startsWith("> "))) {
//           const text = lines.map((l) => l.replace(/^>\s*/, "")).join(" ");
//           return <blockquote key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(text) }} />;
//         }

//         // подзаголовок
//         if (trimmed.startsWith("## ")) {
//           const text = trimmed.replace(/^##\s+/, "");
//           return <h2 key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(text) }} />;
//         }

//         // обычный абзац
//         return <p key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(block) }} />;
//       })}
//     </div>
//   );
// }

// // Локализация даты
// const dateLocales: Record<string, string> = {
//   de: "de-DE",
//   ru: "ru-RU",
//   en: "en-US",
// };

// export default async function Page({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params; // Next.js 15: params — Promise

//   // Получаем локаль из cookies
//   const cookieStore = await cookies();
//   const locale = cookieStore.get("locale")?.value || "de";

//   const item = await prisma.article.findFirst({
//     where: {
//       slug,
//       AND: [
//         { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
//         { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
//       ],
//     },
//     include: {
//       translations: {
//         where: { locale },
//         select: { title: true, excerpt: true, content: true },
//       },
//     },
//   });
//   if (!item) return notFound();

//   // Используем перевод если есть, иначе оригинал
//   const translation = item.translations[0];
//   const title = translation?.title || item.title;
//   const excerpt = translation?.excerpt || item.excerpt;
//   const content = translation?.content || item.content;

//   return (
//     <main className="px-4">
//       <article className="mx-auto max-w-3xl py-8">
//         <header className="mb-6">
//           <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
//             {title}
//           </h1>

//           {item.publishedAt && (
//             <time
//               dateTime={item.publishedAt.toISOString()}
//               className="mt-2 block text-sm opacity-60"
//             >
//               {new Date(item.publishedAt).toLocaleDateString(dateLocales[locale] || "de-DE", {
//                 day: "2-digit",
//                 month: "long",
//                 year: "numeric",
//               })}
//             </time>
//           )}

//           {excerpt && (
//             <p className="mt-4 text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium">
//               {excerpt}
//             </p>
//           )}
//         </header>

//         {item.cover && (
//           <figure className="group overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800 shadow-sm mb-6">
//             <div className="relative aspect-[16/9]">
//               {item.cover.startsWith("/uploads/") ? (
//                 // Для загруженных картинок - обычный img без кэширования
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={item.cover}
//                   alt={title}
//                   className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                 />
//               ) : (
//                 <Image
//                   src={item.cover}
//                   alt={title}
//                   fill
//                   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px"
//                   className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                   priority
//                 />
//               )}
//             </div>
//           </figure>
//         )}

//         {/* Используем переведённый контент */}
//         {content && <RichBody body={content} />}
//       </article>
//     </main>
//   );
// }





// // src/app/news/[slug]/page.tsx
// import { notFound } from "next/navigation";
// import Image from "next/image";
// import { cookies } from "next/headers";
// import { prisma } from "@/lib/db";

// // Отключаем кэширование страницы
// export const dynamic = "force-dynamic";

// /* ---------- utils ---------- */

// function escapeHtml(s: string) {
//   return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
// }
// function inlineHtml(s: string) {
//   let out = escapeHtml(s);
//   out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
//   out = out.replace(/_(.+?)_/g, "<em>$1</em>");
//   return out;
// }

// /** Делим текст на читабельные блоки с «защитой от простыни». */
// function splitToBlocks(raw: string): string[] {
//   const text = raw.trim().replace(/\r\n/g, "\n");
//   if (!text) return [];

//   // 1) Абзацы разделены пустой строкой
//   if (/\n{2,}/.test(text)) {
//     return text.split(/\n{2,}/);
//   }

//   // 2) Одинарные переносы — группируем строки
//   const lines = text.split("\n");
//   if (lines.length > 1) {
//     const blocks: string[] = [];
//     let buf: string[] = [];
//     let mode: "list" | "quote" | null = null;

//     const flush = () => {
//       if (buf.length) blocks.push(buf.join("\n"));
//       buf = [];
//       mode = null;
//     };

//     for (const line of lines) {
//       const t = line.trim();
//       if (!t) {
//         flush();
//         continue;
//       }
//       if (t.startsWith("## ")) {
//         flush();
//         blocks.push(line);
//         continue;
//       }
//       if (t.startsWith("- ")) {
//         if (mode !== "list") flush();
//         mode = "list";
//         buf.push(line);
//         continue;
//       }
//       if (t.startsWith("> ")) {
//         if (mode !== "quote") flush();
//         mode = "quote";
//         buf.push(line);
//         continue;
//       }
//       // обычная строка → самостоятельный абзац
//       flush();
//       blocks.push(line);
//     }
//     flush();
//     return blocks;
//   }

//   // 3) Переносов нет — делим по предложениям
//   const parts: string[] = [];
//   const re = /([^.!?…]+[.!?…]+)(\s+|$)/gu;
//   let m: RegExpExecArray | null;
//   let i = 0;
//   while ((m = re.exec(text))) {
//     parts.push(m[1].trim());
//     i = re.lastIndex;
//   }
//   if (i < text.length) parts.push(text.slice(i).trim());
//   if (parts.length <= 1) return [text];

//   // Сгруппируем предложения в абзацы ~350–450 символов
//   const blocks: string[] = [];
//   let acc = "";

//   for (const sent of parts) {
//     const next = acc ? `${acc} ${sent}` : sent;
//     if (next.length > 420) {
//       if (acc) blocks.push(acc);
//       acc = sent;
//     } else {
//       acc = next;
//     }
//   }
//   if (acc) blocks.push(acc);
//   return blocks;
// }

// /* ---------- renderer ---------- */

// function RichBody({ body }: { body: string }) {
//   const blocks = splitToBlocks(body);
//   let key = 0;
//   return (
//     <div className="prose prose-elen dark:prose-invert">
//       {blocks.map((block) => {
//         key += 1;
//         const trimmed = block.trim();
//         const lines = block.split("\n");

//         // список
//         if (lines.every((l) => l.trim().startsWith("- "))) {
//           const items = lines.map((l) => l.replace(/^-+\s*/, "").trim()).filter(Boolean);
//           return (
//             <ul key={key}>
//               {items.map((it, i) => (
//                 <li key={i} dangerouslySetInnerHTML={{ __html: inlineHtml(it) }} />
//               ))}
//             </ul>
//           );
//         }

//         // цитата
//         if (lines.every((l) => l.trim().startsWith("> "))) {
//           const text = lines.map((l) => l.replace(/^>\s*/, "")).join(" ");
//           return <blockquote key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(text) }} />;
//         }

//         // подзаголовок
//         if (trimmed.startsWith("## ")) {
//           const text = trimmed.replace(/^##\s+/, "");
//           return <h2 key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(text) }} />;
//         }

//         // обычный абзац
//         return <p key={key} dangerouslySetInnerHTML={{ __html: inlineHtml(block) }} />;
//       })}
//     </div>
//   );
// }

// // Локализация даты
// const dateLocales: Record<string, string> = {
//   de: "de-DE",
//   ru: "ru-RU",
//   en: "en-US",
// };

// export default async function Page({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params; // Next.js 15: params — Promise

//   // Получаем локаль из cookies
//   const cookieStore = await cookies();
//   const locale = cookieStore.get("NEXT_LOCALE")?.value || "de";

//   const item = await prisma.article.findFirst({
//     where: {
//       slug,
//       AND: [
//         { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
//         { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
//       ],
//     },
//     include: {
//       translations: {
//         where: { locale },
//         select: { title: true, excerpt: true, content: true },
//       },
//     },
//   });
//   if (!item) return notFound();

//   // Используем перевод если есть, иначе оригинал
//   const translation = item.translations[0];
//   const title = translation?.title || item.title;
//   const excerpt = translation?.excerpt || item.excerpt;
//   const content = translation?.content || item.content;

//   return (
//     <main className="px-4">
//       <article className="mx-auto max-w-3xl py-8">
//         <header className="mb-6">
//           <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
//             {title}
//           </h1>

//           {item.publishedAt && (
//             <time
//               dateTime={item.publishedAt.toISOString()}
//               className="mt-2 block text-sm opacity-60"
//             >
//               {new Date(item.publishedAt).toLocaleDateString(dateLocales[locale] || "de-DE", {
//                 day: "2-digit",
//                 month: "long",
//                 year: "numeric",
//               })}
//             </time>
//           )}

//           {excerpt && (
//             <p className="mt-4 text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium">
//               {excerpt}
//             </p>
//           )}
//         </header>

//         {item.cover && (
//           <figure className="group overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800 shadow-sm mb-6">
//             <div className="relative aspect-[16/9]">
//               {item.cover.startsWith("/uploads/") ? (
//                 // Для загруженных картинок - обычный img без кэширования
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={item.cover}
//                   alt={title}
//                   className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                 />
//               ) : (
//                 <Image
//                   src={item.cover}
//                   alt={title}
//                   fill
//                   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px"
//                   className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                   priority
//                 />
//               )}
//             </div>
//           </figure>
//         )}

//         {/* Используем переведённый контент */}
//         {content && <RichBody body={content} />}
//       </article>
//     </main>
//   );
// }
