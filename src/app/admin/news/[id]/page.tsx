// src/app/admin/news/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleForm from "@/components/forms/ArticleForm";
import { updateArticle, type ActionResult } from "../actions";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminNewsEditPage({ params }: PageProps) {
  // Next.js 15: params нужно await'ить
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      cover: true,
      type: true,
      publishedAt: true,
      expiresAt: true,
    },
  });

  if (!article) return notFound();

  // Преобразуем данные для формы
  const initial = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    body: article.content ?? "",
    cover: article.cover,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    expiresAt: article.expiresAt?.toISOString() ?? null,
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Редактирование новости</h1>
        <Link 
          href="/admin/news"
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          ← Назад к списку
        </Link>
      </div>

      <ArticleForm
        initial={initial}
        articleId={article.id}
        onSubmit={async (fd) => {
          "use server";
          const res = await updateArticle(id, fd);
          if (res.ok) {
            revalidatePath("/admin/news");
            redirect("/admin/news");
          }
          return res as ActionResult;
        }}
      />
    </main>
  );
}






//--------исправляем редактирование новостей-----------
// // src/app/admin/news/[id]/page.tsx
// import { notFound } from "next/navigation";
// import { prisma } from "@/lib/prisma";

// export const dynamic = "force-dynamic";

// type PageProps = {
//   params: { id: string };
// };

// export default async function AdminNewsEditPage({ params }: PageProps) {
//   const article = await prisma.article.findUnique({
//     where: { id: params.id },
//     select: {
//       id: true,
//       slug: true,
//       title: true,
//       excerpt: true,
//       // ВАЖНО: в схеме это поле называется content (не body)
//       content: true,
//       cover: true,
//       type: true,
//       publishedAt: true,
//       expiresAt: true,
//     },
//   });

//   if (!article) return notFound();

//   // Минимальная разметка (можете заменить своим редактором)
//   return (
//     <main className="container py-8">
//       <h1 className="text-2xl font-semibold">Редактирование новости</h1>

//       <div className="mt-6 grid gap-4">
//         <div>
//           <div className="text-sm text-gray-500">Заголовок</div>
//           <div className="font-medium">{article.title}</div>
//         </div>

//         <div>
//           <div className="text-sm text-gray-500">Slug</div>
//           <div className="font-mono">{article.slug}</div>
//         </div>

//         <div>
//           <div className="text-sm text-gray-500">Краткое описание</div>
//           <div>{article.excerpt}</div>
//         </div>

//         <div>
//           <div className="text-sm text-gray-500">Содержимое</div>
//           <pre className="whitespace-pre-wrap rounded bg-neutral-900/5 p-3">
//             {article.content}
//           </pre>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <div className="text-sm text-gray-500">Опубликована</div>
//             <div>{article.publishedAt ? new Date(article.publishedAt).toLocaleString() : "—"}</div>
//           </div>
//           <div>
//             <div className="text-sm text-gray-500">Истекает</div>
//             <div>{article.expiresAt ? new Date(article.expiresAt).toLocaleString() : "—"}</div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }
