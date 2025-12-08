// src/app/page.tsx
import { prisma } from "@/lib/db";
import HomePage from "@/components/home-page";

type KnownType = "ARTICLE" | "NEWS" | "PROMO";

type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  type: KnownType;
};

async function getLatestArticles(): Promise<ArticleItem[]> {
  const rows = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: [{ createdAt: "desc" }],
    take: 3,
  });

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    cover: r.cover,
    type: (r.type ?? "NEWS") as KnownType,
  }));
}

export default async function Page() {
  const latest = await getLatestArticles();
  return <HomePage latest={latest} />;
}




// // src/app/page.tsx
// import Link from "next/link";
// import Image from "next/image";
// import Section from "@/components/section";
// import RainbowCTA from "@/components/RainbowCTA";
// import { prisma } from "@/lib/db";

// import { cookies } from "next/headers";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// /* ---------- Типы ---------- */
// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// /* ---------- Словарь типов статей по языкам ---------- */
// const TYPE_LABEL_BY_LOCALE: Record<Locale, Record<KnownType, string>> = {
//   ru: {
//     ARTICLE: "Статья",
//     NEWS: "Новость",
//     PROMO: "Акция",
//   },
//   de: {
//     ARTICLE: "Artikel",
//     NEWS: "News",
//     PROMO: "Aktion",
//   },
//   en: {
//     ARTICLE: "Article",
//     NEWS: "News",
//     PROMO: "Promo",
//   },
// };

// /* ---------- Данные ---------- */
// async function getLatestArticles(): Promise<ArticleItem[]> {
//   const rows = await prisma.article.findMany({
//     where: { publishedAt: { not: null } },
//     orderBy: [{ createdAt: "desc" }],
//     take: 3,
//   });

//   return rows.map((r) => ({
//     id: r.id,
//     slug: r.slug,
//     title: r.title,
//     excerpt: r.excerpt,
//     cover: r.cover,
//     type: (r.type ?? "NEWS") as KnownType,
//   }));
// }

// /* ---------- Страница ---------- */
// export default async function Page() {
//   const latest = await getLatestArticles();

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
//   const locale: Locale =
//     cookieLocale && LOCALES.includes(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

//   const typeLabel = TYPE_LABEL_BY_LOCALE[locale];

//   return (
//     <main>
//       {/* HERO */}
//       <section className="relative isolate w-full">
//         {/* MOBILE */}
//         <div className="md:hidden">
//           <div className="container pt-4">
//             <h1 className="text-[26px] leading-[1.15] font-semibold tracking-tight text-[#F5F3EE]">
//               {translate(locale, "hero_tagline")}
//             </h1>
//           </div>

//           <div className="relative w-full mt-2">
//             <div
//               aria-hidden
//               className="absolute inset-0 -z-10 blur-2xl opacity-50"
//               style={{
//                 backgroundImage: 'url("/images/hero-mobile.webp")',
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 transform: "scale(1.05)",
//                 filter: "blur(40px)",
//               }}
//             />
//             <div className="relative aspect-[3/4] w-full">
//               <Image
//                 src="/images/hero-mobile.webp"
//                 alt="Salon Elen"
//                 fill
//                 sizes="100vw"
//                 className="object-cover"
//                 priority
//               />
//             </div>
//           </div>

//           <div className="container pb-6 mt-4">
//             <p className="text-[14px] leading-relaxed text-[#F5F3EE]/95">
//               {translate(locale, "hero_subtitle")}
//             </p>
//             <div className="mt-4 flex gap-3">
//               <RainbowCTA
//                 href="/booking"
//                 label={translate(locale, "hero_cta_book")}
//                 className="h-10 px-5 text-[14px]"
//                 idle
//               />
//               <Link
//                 href="/services"
//                 className="rounded-full px-4 py-2 text-sm font-medium text-[#F5F3EE] border border-white/25 hover:bg-white/10 transition"
//               >
//                 {translate(locale, "hero_cta_services")}
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* DESKTOP */}
//         <div className="hidden md:block relative w-full overflow-hidden h-[560px] lg:h-[600px] xl:h-[640px]">
//           <Image
//             src="/images/hero.webp"
//             alt="Salon Elen — стильная студия парикмахерских услуг"
//             fill
//             priority
//             sizes="100vw"
//             className="object-cover object-[68%_50%]"
//           />

//           <div className="absolute inset-y-0 left-0 z-[1] w-[clamp(36%,42vw,48%)] bg-gradient-to-r from-black/85 via-black/55 to-transparent [mask-image:linear-gradient(to_right,black,black,transparent)]" />
//           <div className="absolute inset-0 z-[1] bg-gradient-to-l from-black/35 via-black/10 to-transparent pointer-events-none" />

//           <div className="relative z-10 h-full">
//             <div className="container h-full">
//               <div className="flex h-full items-center">
//                 <div className="max-w-[620px]">
//                   <h1 className="text-[#F5F3EE] font-semibold tracking-tight leading-[1.06] max-w-[14ch] text-[clamp(40px,6vw,64px)]">
//                     {translate(locale, "hero_tagline")}
//                   </h1>

//                   <p className="mt-5 text-[#F5F3EE]/90 text-[19px] leading-relaxed max-w-[50ch]">
//                     {translate(locale, "hero_subtitle")}
//                   </p>

//                   <div className="mt-7 flex flex-wrap gap-3">
//                     <RainbowCTA
//                       href="/booking"
//                       label={translate(locale, "hero_cta_book")}
//                       className="h-12 px-7 text-[15px]"
//                       idle
//                     />
//                     <Link
//                       href="/services"
//                       className="inline-flex h-12 px-7 items-center justify-center rounded-full border border-white/70 text-white hover:bg-white/10 transition"
//                     >
//                       {translate(locale, "hero_cta_services")}
//                     </Link>
//                   </div>

//                   <div className="mt-4 text-white/70 text-sm">
//                     {translate(locale, "hero_badge")}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Популярные услуги */}
//       <Section
//         title={translate(locale, "home_services_title")}
//         subtitle={translate(locale, "home_services_subtitle")}
//       >
//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//           <Link
//             href="/coming-soon"
//             className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
//           >
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/haircut.webp"
//                 alt={translate(locale, "home_services_card1_title")}
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">
//                 {translate(locale, "home_services_card1_title")}
//               </h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
//                 {translate(locale, "home_services_card1_text")}
//               </p>
//             </div>
//           </Link>

//           <Link
//             href="/coming-soon"
//             className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
//           >
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/manicure.webp"
//                 alt={translate(locale, "home_services_card2_title")}
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">
//                 {translate(locale, "home_services_card2_title")}
//               </h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
//                 {translate(locale, "home_services_card2_text")}
//               </p>
//             </div>
//           </Link>

//           <Link
//             href="/coming-soon"
//             className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
//           >
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/makeup.webp"
//                 alt={translate(locale, "home_services_card3_title")}
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">
//                 {translate(locale, "home_services_card3_title")}
//               </h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
//                 {translate(locale, "home_services_card3_text")}
//               </p>
//             </div>
//           </Link>
//         </div>
//       </Section>

//       {/* Новости и статьи */}
//       <Section
//         title={translate(locale, "home_news_title")}
//         subtitle={translate(locale, "home_news_subtitle")}
//       >
//         {latest.length === 0 ? (
//           <p className="text-gray-500 dark:text-gray-400">
//             {translate(locale, "home_news_empty")}
//           </p>
//         ) : (
//           <div className="grid gap-5 md:grid-cols-3">
//             {latest.map((item) => (
//               <Link
//                 key={item.id}
//                 href={`/news/${item.slug}`}
//                 className="group block rounded-2xl border hover:shadow-md transition overflow-hidden bg-white/70 dark:bg-slate-900/60"
//               >
//                 <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
//                   {item.cover ? (
//                     <Image
//                       src={item.cover}
//                       alt={item.title}
//                       fill
//                       sizes="(max-width: 768px) 100vw, 33vw"
//                       className="object-cover transition-transform duration-500 group-hover:scale-105"
//                     />
//                   ) : (
//                     <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
//                       —
//                     </div>
//                   )}
//                 </div>
//                 <div className="p-4">
//                   <div className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">
//                     {typeLabel[item.type]}
//                   </div>
//                   <h3 className="font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
//                     {item.title}
//                   </h3>
//                   {item.excerpt && (
//                     <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
//                       {item.excerpt}
//                     </p>
//                   )}
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </Section>

//       {/* Нижний CTA */}
//       <Section>
//         <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-8 sm:px-10 sm:py-10 text-white">
//           <div className="relative z-10 max-w-xl">
//             <h2 className="text-2xl sm:text-3xl font-semibold mb-2">
//               {translate(locale, "home_cta_title")}
//             </h2>
//             <p className="text-sm sm:text-base text-white/90 mb-4">
//               {translate(locale, "home_cta_text")}
//             </p>
//             <RainbowCTA
//               href="/booking"
//               label={translate(locale, "home_cta_button")}
//               className="h-11 px-6 text-[15px]"
//             />
//           </div>
//           <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-white/25 blur-3xl" />
//         </div>
//       </Section>
//     </main>
//   );
// }





// // src/app/page.tsx
// import Link from "next/link"; 
// import Image from "next/image";
// import Section from "@/components/section";
// // import CTAButton from "@/components/cta-button"; // ← больше не используем в герое
// import RainbowCTA from "@/components/RainbowCTA";   // ← новая градиентная кнопка
// import { prisma } from "@/lib/db";

// import { cookies } from "next/headers";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// /* ---------- Типы ---------- */
// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// const TYPE_LABEL: Record<KnownType, string> = {
//   ARTICLE: "Статья",
//   NEWS: "Новость",
//   PROMO: "Акция",
// };

// type ArticleItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt: string | null;
//   cover: string | null;
//   type: KnownType;
// };

// /* ---------- Данные ---------- */
// async function getLatestArticles(): Promise<ArticleItem[]> {
//   const rows = await prisma.article.findMany({
//     where: { publishedAt: { not: null } },        // ✅ фильтр по publishedAt
//     orderBy: [{ createdAt: "desc" }],
//     take: 3,                                      // ✅ без лишней фигурной скобки
//   });

//   return rows.map((r) => ({
//     id: r.id,
//     slug: r.slug,
//     title: r.title,
//     excerpt: r.excerpt,
//     cover: r.cover,
//     type: (r.type ?? "NEWS") as KnownType,
//   }));
// }


// /* ---------- Страница ---------- */
// export default async function Page() {
//   const latest = await getLatestArticles();
//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
//   const locale: Locale =
//     cookieLocale && LOCALES.includes(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

//   return (
//     <main>
//       {/* HERO — mobile и desktop с новой градиентной кнопкой RainbowCTA */}
//       <section className="relative isolate w-full">
//         {/* ===== MOBILE (до md) ===== */}
//         <div className="md:hidden">
//           {/* заголовок над фото */}
//           <div className="container pt-4">
//             <h1 className="text-[26px] leading-[1.15] font-semibold tracking-tight text-[#F5F3EE]">
//               {translate(locale, "hero_tagline")}
//             </h1>
//           </div>

//           {/* фото целиком */}
//           <div className="relative w-full mt-2">
//             <div
//               aria-hidden
//               className="absolute inset-0 -z-10 blur-2xl opacity-50"
//               style={{
//                 backgroundImage: 'url("/images/hero-mobile.webp")',
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 transform: "scale(1.05)",
//                 filter: "blur(40px)",
//               }}
//             />
//             <div className="relative aspect-[3/4] w-full">
//               <Image
//                 src="/images/hero-mobile.webp"
//                 alt="Salon Elen"
//                 fill
//                 sizes="100vw"
//                 className="object-cover"
//                 priority
//                 placeholder="blur"
//                 blurDataURL="data:image/svg+xml;base64,PHN2ZyB4b...WN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyNlZmU3ZGUnLz48L3N2Zz4="
//               />
//             </div>
//           </div>

//           {/* описание и кнопки под фото */}
//           <div className="container pb-6 mt-4">
//             <p className="text-[14px] leading-relaxed text-[#F5F3EE]/95">
//               {translate(locale, "hero_subtitle")}
//             </p>
//             <div className="mt-4 flex gap-3">
//               {/* Мобильная новая кнопка — компактнее и можно включить idle-анимацию */}
//               <RainbowCTA
//                 href="/booking"
//                 label={translate(locale, "hero_cta_book")}
//                 className="h-10 px-5 text-[14px]"  /* уменьшили габариты */
//                 idle                                     /* всегда переливается мягко */
//               />

//               <Link
//                 href="/services"
//                 className="rounded-full px-4 py-2 text-sm font-medium text-[#F5F3EE] border border-white/25 hover:bg-white/10 transition"
//               >
//                 {translate(locale, "hero_cta_services")}
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* ===== DESKTOP (от md) — обновлённый тёмный вариант ===== */}
//         <div className="hidden md:block relative w-full overflow-hidden h-[560px] lg:h-[600px] xl:h-[640px]">
//           {/* Фон-фото: заполняет ширину, фокус чуть вправо */}
//           <Image
//             src="/images/hero.webp"
//             alt="Salon Elen — стильная студия парикмахерских услуг"
//             fill
//             priority
//             sizes="100vw"
//             className="object-cover object-[68%_50%]"
//           />

//           {/* Левый динамический градиент под текст */}
//           <div
//             className="
//               absolute inset-y-0 left-0 z-[1]
//               w-[clamp(36%,42vw,48%)]
//               bg-gradient-to-r from-black/85 via-black/55 to-transparent
//               [mask-image:linear-gradient(to_right,black,black,transparent)]
//             "
//           />

//           {/* Едва заметная правая виньетка */}
//           <div className="absolute inset-0 z-[1] bg-gradient-to-l from-black/35 via-black/10 to-transparent pointer-events-none" />

//           {/* Контент */}
//           <div className="relative z-10 h-full">
//             <div className="container h-full">
//               <div className="flex h-full items-center">
//                 <div className="max-w-[620px]">
//                   <h1 className="text-[#F5F3EE] font-semibold tracking-tight leading-[1.06] max-w-[14ch] text-[clamp(40px,6vw,64px)]">
//                     {translate(locale, "hero_tagline")}
//                   </h1>

//                   <p className="mt-5 text-[#F5F3EE]/90 text-[19px] leading-relaxed max-w-[50ch]">
//                     {translate(locale, "hero_subtitle")}
//                   </p>

//                   <div className="mt-7 flex flex-wrap gap-3">
//                     <RainbowCTA
//                       href="/booking"
//                       label={translate(locale, "hero_cta_book")}
//                       className="h-12 px-7 text-[15px]"
//                       idle
//                     />

//                     <Link
//                       href="/services"
//                       className="inline-flex h-12 px-7 items-center justify-center rounded-full
//                                  border border-white/70 text-white hover:bg-white/10 transition"
//                     >
//                       {translate(locale, "hero_cta_services")}
//                     </Link>
//                   </div>

//                   <div className="mt-4 text-white/70 text-sm">
//                     {translate(locale, "hero_badge")}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Услуги превью */}
//       <Section title="Популярные услуги" subtitle="Что мы делаем лучше всего">
//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//           <Link href="/coming-soon" className="group block rounded-2xl border hover:shadow-md transition overflow-hidden">
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/haircut.webp"
//                 alt="Стрижка"
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">Женская стрижка</h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Подчеркнём ваш стиль и индивидуальность.</p>
//             </div>
//           </Link>

//           <Link href="/coming-soon" className="group block rounded-2xl border hover:shadow-md transition overflow-hidden">
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/color.webp"
//                 alt="Окрашивание"
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">Окрашивание</h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Современные техники и качественные материалы.</p>
//             </div>
//           </Link>

//           <Link href="/coming-soon" className="group block rounded-2xl border hover:shadow-md transition overflow-hidden">
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/makeup.webp"
//                 alt="Макияж"
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">Макияж</h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Подчеркнём вашу естественную красоту.</p>
//             </div>
//           </Link>
//         </div>
//       </Section>

//       {/* Последние новости / статьи */}
//       <Section title="Новости и статьи" subtitle="Свежие обновления и полезные советы">
//         {latest.length === 0 ? (
//           <p className="text-gray-500 dark:text-gray-400">Пока нет опубликованных материалов.</p>
//         ) : (
//           <div className="grid gap-5 md:grid-cols-3">
//             {latest.map((item) => (
//               <Link
//                 key={item.id}
//                 href={`/news/${item.slug}`}
//                 className="group block rounded-2xl border hover:shadow-md transition overflow-hidden bg-white/70 dark:bg-slate-900/60"
//               >
//                 <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
//                   {item.cover ? (
//                     <Image
//                       src={item.cover}
//                       alt={item.title}
//                       fill
//                       sizes="(max-width: 768px) 100vw, 33vw"
//                       className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
//                     />
//                   ) : (
//                     <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm">
//                       Без изображения
//                     </div>
//                   )}
//                 </div>
//                 <div className="p-4">
//                   <div className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1">
//                     {TYPE_LABEL[item.type]}
//                   </div>
//                   <h3 className="font-medium group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
//                     {item.title}
//                   </h3>
//                   {item.excerpt && (
//                     <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
//                       {item.excerpt}
//                     </p>
//                   )}
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </Section>

//       {/* CTA внизу */}
//       <Section>
//         <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-8 sm:px-10 sm:py-10 text-white">
//           <div className="relative z-10 max-w-xl">
//             <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Готовы к обновлению?</h2>
//             <p className="text-sm sm:text-base text-white/90 mb-4">
//               Запишитесь онлайн и мы подберём для вас идеальный уход и стиль.
//             </p>
//             <RainbowCTA href="/booking" label="Записаться" className="h-11 px-6 text-[15px]" />
//           </div>
//           <div className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-white/25 blur-3xl" />
//         </div>
//       </Section>
//     </main>
//   );
// }




//---------работало, добавляем языки---------
// import Link from "next/link"; 
// import Image from "next/image";
// import Section from "@/components/section";
// // import CTAButton from "@/components/cta-button"; // ← больше не используем в герое
// import RainbowCTA from "@/components/RainbowCTA";   // ← новая градиентная кнопка
// import { prisma } from "@/lib/db";

// /* ---------- Типы ---------- */
// type KnownType = "ARTICLE" | "NEWS" | "PROMO";

// const TYPE_LABEL: Record<KnownType, string> = {
//   ARTICLE: "Статья",
//   NEWS: "Новость",
//   PROMO: "Акция",
// };

// export type NewsItem = {
//   id: string;
//   slug: string;
//   title: string;
//   excerpt?: string | null;
//   cover?: string | null;
//   type?: KnownType | null;
// };

// /* ---------- Данные ---------- */
// async function getLatestArticles(): Promise<NewsItem[]> {
//   const now = new Date();

//   const rows = await prisma.article.findMany({
//     where: {
//       AND: [
//         { OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] },
//         { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
//       ],
//     },
//     orderBy: { publishedAt: "desc" },
//     take: 3,
//     select: {
//       id: true,
//       slug: true,
//       title: true,
//       excerpt: true,
//       cover: true,
//       type: true,
//     },
//   });

//   return rows.map((r) => ({
//     id: r.id,
//     slug: r.slug,
//     title: r.title,
//     excerpt: r.excerpt,
//     cover: r.cover,
//     type: (r.type ?? "NEWS") as KnownType,
//   }));
// }

// /* ---------- Страница ---------- */
// export default async function Page() {
//   const latest = await getLatestArticles();

//   return (
//     <main>
//       {/* HERO — mobile и desktop с новой градиентной кнопкой RainbowCTA */}
//       <section className="relative isolate w-full">
//         {/* ===== MOBILE (до md) ===== */}
//         <div className="md:hidden">
//           {/* заголовок над фото */}
//           <div className="container pt-4">
//             <h1 className="text-[26px] leading-[1.15] font-semibold tracking-tight text-[#F5F3EE]">
//               Salon Elen — красота и уход в Halle
//             </h1>
//           </div>

//           {/* фото целиком */}
//           <div className="relative w-full mt-2">
//             <div
//               aria-hidden
//               className="absolute inset-0 -z-10 blur-2xl opacity-50"
//               style={{
//                 backgroundImage: 'url("/images/hero-mobile.webp")',
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 transform: "scale(1.05)",
//                 filter: "blur(40px)",
//               }}
//             />
//             <div className="relative aspect-[3/4] w-full">
//               <Image
//                 src="/images/hero-mobile.webp"
//                 alt="Salon Elen"
//                 fill
//                 sizes="100vw"
//                 className="object-contain"
//                 priority
//                 placeholder="blur"
//                 blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyNlZmU3ZGUnLz48L3N2Zz4="
//               />
//             </div>
//           </div>

//           {/* описание и кнопки под фото */}
//           <div className="container pb-6 mt-4">
//             <p className="text-[14px] leading-relaxed text-[#F5F3EE]/95">
//               Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.
//             </p>
//             <div className="mt-4 flex gap-3">
//               {/* Мобильная новая кнопка — компактнее и можно включить idle-анимацию */}
//               <RainbowCTA
//                 href="/booking"
//                 label="Записаться"
//                 className="h-10 px-5 text-[14px]"  /* уменьшили габариты */
//                 idle                                     /* всегда переливается мягко */
//               />

//               <Link
//                 href="/services"
//                 className="rounded-full px-4 py-2 text-sm font-medium text-[#F5F3EE]/90 hover:text-[#F5F3EE] border border-white/25 hover:bg-white/10 transition"
//               >
//                 Услуги
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* ===== DESKTOP (от md) — обновлённый тёмный вариант ===== */}
//         <div className="hidden md:block relative w-full overflow-hidden h-[560px] lg:h-[600px] xl:h-[640px]">
//           {/* Фон-фото: заполняет ширину, фокус чуть вправо */}
//           <Image
//             src="/images/hero.webp"
//             alt="Salon Elen — стильная студия парикмахерских услуг"
//             fill
//             priority
//             sizes="100vw"
//             className="object-cover object-[68%_50%]"
//           />

//           {/* Левый динамический градиент под текст */}
//           <div
//             className="
//               absolute inset-y-0 left-0 z-[1]
//               w-[clamp(36%,42vw,48%)]
//               bg-gradient-to-r from-black/85 via-black/55 to-transparent
//               [mask-image:linear-gradient(to_right,black,black,transparent)]
//             "
//           />

//           {/* Едва заметная правая виньетка */}
//           <div className="absolute inset-0 z-[1] bg-gradient-to-l from-black/10 via-transparent to-transparent pointer-events-none" />

//           {/* Контент */}
//           <div className="relative z-10 h-full">
//             <div className="container h-full">
//               <div className="flex h-full items-center">
//                 <div className="max-w-[620px]">
//                   <h1 className="text-[#F5F3EE] font-semibold tracking-tight leading-[1.06] max-w-[14ch] text-[clamp(40px,6vw,64px)]">
//                     Salon Elen — красота и уход в Halle
//                   </h1>

//                   <p className="mt-5 text-[#F5F3EE]/90 text-[19px] leading-relaxed max-w-[50ch]">
//                     Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.
//                   </p>

//                   <div className="mt-7 flex items-center gap-4">
//                     {/* Десктопная новая кнопка — чуть крупнее и idle-анимация */}
//                     <RainbowCTA
//                       href="/booking"
//                       label="Записаться"
//                       className="h-12 px-7 text-[15px]"
//                       idle   /* всегда переливается (в покое тоже) */
//                     />

//                     <Link
//                       href="/services"
//                       className="inline-flex h-12 px-7 items-center justify-center rounded-full
//                                  border border-white/70 text-white hover:bg-white/10 transition"
//                     >
//                       Услуги
//                     </Link>
//                   </div>

//                   <div className="mt-4 text-white/70 text-sm">
//                     Онлайн-запись 24/7 • В центре Halle
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Услуги превью */}
//       <Section title="Популярные услуги" subtitle="Что мы делаем лучше всего">
//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//           <Link href="/coming-soon" className="group block rounded-2xl border hover:shadow-md transition overflow-hidden">
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/makeup.webp"
//                 alt="Макияж"
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">Макияж</h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Подчеркнём вашу естественную красоту.</p>
//             </div>
//           </Link>

//           <Link href="/coming-soon" className="group block rounded-2xl border hover:shadow-md transition overflow-hidden">
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/manicure.webp"
//                 alt="Маникюр"
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">Маникюр</h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Эстетика, стерильность и стойкое покрытие.</p>
//             </div>
//           </Link>

//           <Link href="/coming-soon" className="group block rounded-2xl border hover:shadow-md transition overflow-hidden">
//             <div className="relative aspect-[16/10] overflow-hidden">
//               <Image
//                 src="/images/services/haircut.webp"
//                 alt="Стрижка"
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">Стрижка</h3>
//               <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Современные техники, уход и подбор формы.</p>
//             </div>
//           </Link>
//         </div>
//       </Section>

//       {/* Новости и акции */}
//       <Section title="Новости и акции" subtitle="Свежие публикации" titleHref="/news">
//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//           {latest.length > 0 ? (
//             latest.map((n) => (
//               <Link
//                 key={n.id}
//                 href={`/news/${n.slug}`}
//                 className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
//               >
//                 {n.cover ? (
//                   <div className="relative aspect-[16/10] overflow-hidden">
//                     <Image
//                       src={n.cover}
//                       alt={n.title}
//                       fill
//                       sizes="(max-width: 768px) 100vw, 33vw"
//                       className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
//                     />
//                   </div>
//                 ) : null}
//                 <div className="p-4">
//                   <div className="text-xs text-gray-500 mb-1">
//                     {TYPE_LABEL[(n.type ?? "NEWS") as KnownType]}
//                   </div>
//                   <h3 className="text-base font-medium line-clamp-2">{n.title}</h3>
//                   {n.excerpt ? (
//                     <p className="mt-2 text-sm text-gray-600 line-clamp-2">{n.excerpt}</p>
//                   ) : null}
//                 </div>
//               </Link>
//             ))
//           ) : (
//             <div className="text-gray-500">Пока нет публикаций.</div>
//           )}
//         </div>
//       </Section>

//       {/* Команда */}
//       <Section title="Команда" subtitle="Немного о нас">
//         <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//           <div className="rounded-2xl overflow-hidden border">
//             <div className="relative aspect-[4/3]">
//               <Image
//                 src="/images/team.jpg"
//                 alt="Команда салона"
//                 fill
//                 sizes="(max-width: 768px) 100vw, 33vw"
//                 className="object-cover"
//               />
//             </div>
//             <div className="p-4">
//               <h3 className="font-medium">Наша команда</h3>
//               <p className="text-sm text-gray-600 mt-1">
//                 Сертифицированные мастера с опытом и вниманием к деталям.
//               </p>
//             </div>
//           </div>
//         </div>
//       </Section>

//       {/* CTA с картинкой */}
//       <Section className="pb-16">
//         <div className="relative overflow-hidden rounded-3xl min-h-[260px] md:min-h-[320px]">
//           <div className="relative z-10 p-6 sm:p-10">
//             <h3 className="text-2xl sm:text-3xl font-semibold">Готовы к обновлению?</h3>
//             <p className="mt-2 text-gray-700 dark:text-gray-300">
//               Выберите удобное время и запишитесь онлайн.
//             </p>
//             <div className="mt-6">
//               {/* Здесь можно тоже поставить RainbowCTA, если хочешь единый стиль */}
//               <Link href="/booking" className="btn">Записаться</Link>
//             </div>
//           </div>
//           <Image
//             src="/images/cta.jpg"
//             alt="Запись"
//             fill
//             sizes="100vw"
//             style={{ objectFit: "cover" }}
//           />
//           <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 to-black/10 dark:from-black/60" />
//         </div>
//       </Section>
//     </main>
//   );
// }
