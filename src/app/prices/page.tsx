// src/app/prices/page.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
import PricesClient from "./PricesClient";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";
const PAGE_PATH = "/prices";

/* ─────────────────── locale resolution ─────────────────── */

type SearchParams = Record<string, string | string[] | undefined>;
type SearchParamsPromise = Promise<SearchParams>;

function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

async function getLangFromSearchParams(
  searchParams?: SearchParamsPromise,
): Promise<string | undefined> {
  const sp = searchParams ? await searchParams : undefined;
  const raw = sp?.lang;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
  const urlLang = await getLangFromSearchParams(searchParams);
  if (isLocale(urlLang)) return urlLang;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  return DEFAULT_LOCALE;
}

function pageUrl(locale: Locale) {
  if (locale === "de") return `${SITE_URL}${PAGE_PATH}`;
  return `${SITE_URL}${PAGE_PATH}?lang=${locale}`;
}

/* ─────────────────── SEO metadata ─────────────────── */

const metaTitles: Record<Locale, string> = {
  de: "Preise & Leistungen — Salon Elen | Kosmetiksalon in Halle (Saale)",
  ru: "\u0426\u0435\u043D\u044B \u0438 \u0443\u0441\u043B\u0443\u0433\u0438 — Salon Elen | \u041A\u043E\u0441\u043C\u0435\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0441\u0430\u043B\u043E\u043D \u0432 \u0413\u0430\u043B\u043B\u0435",
  en: "Prices & Services — Salon Elen | Beauty Salon in Halle (Saale)",
};

const metaDescriptions: Record<Locale, string> = {
  de: "Transparente Preise f\u00FCr Permanent Make-up, Microneedling, Nageldesign, Wimpernverl\u00E4ngerung und Fu\u00DFpflege. Hochwertige Behandlungen im Salon Elen in Halle (Saale).",
  ru: "\u041F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u044B\u0435 \u0446\u0435\u043D\u044B \u043D\u0430 \u043F\u0435\u0440\u043C\u0430\u043D\u0435\u043D\u0442\u043D\u044B\u0439 \u043C\u0430\u043A\u0438\u044F\u0436, \u043C\u0438\u043A\u0440\u043E\u043D\u0438\u0434\u043B\u0438\u043D\u0433, \u0434\u0438\u0437\u0430\u0439\u043D \u043D\u043E\u0433\u0442\u0435\u0439, \u043D\u0430\u0440\u0430\u0449\u0438\u0432\u0430\u043D\u0438\u0435 \u0440\u0435\u0441\u043D\u0438\u0446 \u0438 \u043F\u0435\u0434\u0438\u043A\u044E\u0440. \u041F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440\u044B \u0432 Salon Elen, \u0413\u0430\u043B\u043B\u0435 (\u0417\u0430\u0430\u043B\u0435).",
  en: "Transparent prices for permanent make-up, microneedling, nail design, eyelash extensions and foot care. Premium treatments at Salon Elen in Halle (Saale).",
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
      canonical: pageUrl(locale),
      languages: {
        de: pageUrl("de"),
        en: pageUrl("en"),
        ru: pageUrl("ru"),
      },
    },
    openGraph: {
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      url: pageUrl(locale),
      images: ["/images/hero.webp"],
      siteName: "Salon Elen",
      locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
      type: "website",
    },
  };
}

/* ─────────────────── JSON-LD ─────────────────── */

type ServiceForLd = {
  name: string;
  description: string | null;
  priceCents: number | null;
  durationMin: number;
};

function buildJsonLd(locale: Locale, services: ServiceForLd[]) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["BeautySalon", "LocalBusiness"],
    name: "Salon Elen",
    url: pageUrl(locale),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Lessingstra\u00DFe 37",
      postalCode: "06114",
      addressLocality: "Halle (Saale)",
      addressCountry: "DE",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name:
        locale === "de"
          ? "Preisliste"
          : locale === "ru"
            ? "\u041F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442"
            : "Price List",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          ...(s.description ? { description: s.description } : {}),
        },
        ...(s.priceCents
          ? {
              price: (s.priceCents / 100).toFixed(2),
              priceCurrency: "EUR",
            }
          : {}),
      })),
    },
  };
  return JSON.stringify(data);
}

/* ─────────────────── data fetching ─────────────────── */

async function getCategories(locale: Locale) {
  const categories = await prisma.service.findMany({
    where: { parentId: null, isArchived: false, isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      translations: {
        where: { locale },
        select: { name: true, description: true },
      },
      children: {
        where: { isArchived: false, isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          durationMin: true,
          priceCents: true,
          cover: true,
          translations: {
            where: { locale },
            select: { name: true, description: true },
          },
        },
      },
    },
  });

  return categories
    .filter((c) => c.children.length > 0)
    .map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.translations[0]?.name || cat.name,
      services: cat.children.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.translations[0]?.name || s.name,
        description: s.translations[0]?.description ?? s.description ?? null,
        durationMin: s.durationMin,
        priceCents: s.priceCents,
        cover: s.cover,
      })),
    }));
}

/* ─────────────────── PAGE ─────────────────── */

export default async function PricesPage({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const locale = await resolveLocale(searchParams);
  const categories = await getCategories(locale);

  // Flat list for JSON-LD
  const allServices = categories.flatMap((c) =>
    c.services.map((s) => ({
      name: s.name,
      description: s.description,
      priceCents: s.priceCents,
      durationMin: s.durationMin,
    })),
  );

  return (
    <>
      <PricesClient locale={locale} categories={categories} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildJsonLd(locale, allServices) }}
      />
    </>
  );
}




//-------была заглушка---------
// import { notFound } from "next/navigation";
// import Image from "next/image";
// import { prisma } from "@/lib/db";

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

// export default async function Page({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params; // Next.js 15: params — Promise

//   const item = await prisma.article.findFirst({
//     where: {
//       slug,
//       AND: [
//         { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
//         { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
//       ],
//     },
//     // Можно явно перечислить поля, но и без select тип уже знает content
//     // select: { id: true, slug: true, title: true, excerpt: true, cover: true, content: true, publishedAt: true, expiresAt: true, type: true },
//   });
//   if (!item) return notFound();

//   return (
//     <main className="px-4">
//       <article className="mx-auto max-w-3xl py-8">
//         <header className="mb-6">
//           <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
//             {item.title}
//           </h1>

//           {item.publishedAt && (
//             <time
//               dateTime={item.publishedAt.toISOString()}
//               className="mt-2 block text-sm opacity-60"
//             >
//               {new Date(item.publishedAt).toLocaleDateString("ru", {
//                 day: "2-digit",
//                 month: "long",
//                 year: "numeric",
//               })}
//             </time>
//           )}

//           {item.excerpt && (
//             <p className="mt-4 text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium">
//               {item.excerpt}
//             </p>
//           )}
//         </header>

//         {item.cover && (
//           <figure className="group overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800 shadow-sm mb-6">
//             <div className="relative aspect-[16/9]">
//               <Image
//                 src={item.cover}
//                 alt={item.title}
//                 fill
//                 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px"
//                 className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                 priority
//               />
//             </div>
//           </figure>
//         )}

//         {/* ВАЖНО: используем content вместо body */}
//         {item.content && <RichBody body={item.content} />}
//       </article>
//     </main>
//   );
// }
