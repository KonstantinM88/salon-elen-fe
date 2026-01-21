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
      _count: {
        select: { translations: true },
      },
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

  const translationsCount = article._count.translations;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-semibold">Редактирование новости</h1>
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/news/${id}/translations`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
          >
            🌐 Переводы
            {translationsCount > 0 && (
              <span className="bg-blue-500/30 px-2 py-0.5 rounded-full text-xs">
                {translationsCount}
              </span>
            )}
          </Link>
          <Link 
            href="/admin/news"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            ← Назад к списку
          </Link>
        </div>
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
