// src/app/admin/news/[id]/translations/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ArticleTranslationForm from "./ArticleTranslationForm";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

const LOCALES = [
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "en", name: "English", flag: "🇬🇧" },
] as const;

export default async function ArticleTranslationsPage({ params }: PageProps) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      translations: {
        select: {
          id: true,
          locale: true,
          title: true,
          excerpt: true,
          content: true,
          // SEO
          seoTitle: true,
          seoDescription: true,
          ogTitle: true,
          ogDescription: true,
        },
      },
    },
  });

  if (!article) return notFound();

  const translationsMap = new Map(
    article.translations.map((t) => [t.locale, t]),
  );

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Переводы новости</h1>
          <p className="text-sm text-white/60 mt-1">
            Оригинал: {article.title}
          </p>
        </div>
        <Link
          href={`/admin/news/${id}`}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          ← Назад к редактированию
        </Link>
      </div>

      <div className="grid gap-6">
        {LOCALES.map((locale) => {
          const translation = translationsMap.get(locale.code);
          return (
            <div
              key={locale.code}
              className="rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{locale.flag}</span>
                <h2 className="text-lg font-medium">{locale.name}</h2>
                {translation && (
                  <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                    Переведено
                  </span>
                )}
              </div>

              <ArticleTranslationForm
                articleId={article.id}
                locale={locale.code}
                original={{
                  title: article.title,
                  excerpt: article.excerpt ?? "",
                  content: article.content ?? "",
                }}
                translation={
                  translation
                    ? {
                        id: translation.id,
                        title: translation.title,
                        excerpt: translation.excerpt ?? "",
                        content: translation.content ?? "",
                        seoTitle: translation.seoTitle ?? "",
                        seoDescription: translation.seoDescription ?? "",
                        ogTitle: translation.ogTitle ?? "",
                        ogDescription: translation.ogDescription ?? "",
                      }
                    : null
                }
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}



//-------14.02.26 добавляем возможность редактирования SEO и видео -----------
// // src/app/admin/news/[id]/translations/page.tsx
// import { notFound } from "next/navigation";
// import { prisma } from "@/lib/prisma";
// import Link from "next/link";
// import ArticleTranslationForm from "./ArticleTranslationForm";

// export const dynamic = "force-dynamic";

// type PageProps = {
//   params: Promise<{ id: string }>;
// };

// const LOCALES = [
//   { code: "de", name: "Deutsch", flag: "🇩🇪" },
//   { code: "ru", name: "Русский", flag: "🇷🇺" },
//   { code: "en", name: "English", flag: "🇬🇧" },
// ] as const;

// export default async function ArticleTranslationsPage({ params }: PageProps) {
//   const { id } = await params;

//   const article = await prisma.article.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       title: true,
//       excerpt: true,
//       content: true,
//       translations: {
//         select: {
//           id: true,
//           locale: true,
//           title: true,
//           excerpt: true,
//           content: true,
//         },
//       },
//     },
//   });

//   if (!article) return notFound();

//   // Создаём карту переводов по локали
//   const translationsMap = new Map(
//     article.translations.map((t) => [t.locale, t])
//   );

//   return (
//     <main className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-semibold">Переводы новости</h1>
//           <p className="text-sm text-white/60 mt-1">
//             Оригинал: {article.title}
//           </p>
//         </div>
//         <Link
//           href={`/admin/news/${id}`}
//           className="text-sm text-white/60 hover:text-white transition-colors"
//         >
//           ← Назад к редактированию
//         </Link>
//       </div>

//       <div className="grid gap-6">
//         {LOCALES.map((locale) => {
//           const translation = translationsMap.get(locale.code);
//           return (
//             <div
//               key={locale.code}
//               className="rounded-xl border border-white/10 bg-white/5 p-6"
//             >
//               <div className="flex items-center gap-2 mb-4">
//                 <span className="text-2xl">{locale.flag}</span>
//                 <h2 className="text-lg font-medium">{locale.name}</h2>
//                 {translation && (
//                   <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
//                     Переведено
//                   </span>
//                 )}
//               </div>

//               <ArticleTranslationForm
//                 articleId={article.id}
//                 locale={locale.code}
//                 original={{
//                   title: article.title,
//                   excerpt: article.excerpt ?? "",
//                   content: article.content ?? "",
//                 }}
//                 translation={
//                   translation
//                     ? {
//                         id: translation.id,
//                         title: translation.title,
//                         excerpt: translation.excerpt ?? "",
//                         content: translation.content ?? "",
//                       }
//                     : null
//                 }
//               />
//             </div>
//           );
//         })}
//       </div>
//     </main>
//   );
// }