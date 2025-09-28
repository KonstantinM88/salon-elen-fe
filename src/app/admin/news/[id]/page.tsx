// src/app/admin/news/[id]/page.tsx
import { prisma } from "@/lib/db";
import ArticleForm from "@/components/forms/ArticleForm";
import { updateArticle, type ActionResult } from "../actions";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Страница рендерится на каждый запрос (чтобы видеть свежие данные)
export const dynamic = "force-dynamic";

// В Next.js 15 params — Promise и его нужно await-ить
type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const item = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      body: true,
      cover: true,
      publishedAt: true,
      expiresAt: true,
      seoTitle: true,
      seoDesc: true,
      ogTitle: true,
      ogDesc: true,
      // type можно не использовать, если в форме ты его не редактируешь
      type: true,
    },
  });

  if (!item) return notFound();

  // ArticleForm ожидает строки или пусто — отдаём ISO-строки
  const initial = {
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? "",
    body: item.body,
    cover: item.cover ?? null,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : "",
    expiresAt: item.expiresAt ? item.expiresAt.toISOString() : "",
    seoTitle: item.seoTitle ?? "",
    seoDesc: item.seoDesc ?? "",
    ogTitle: item.ogTitle ?? "",
    ogDesc: item.ogDesc ?? "",
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Редактировать запись</h1>

      <ArticleForm
        initial={initial}
        articleId={item.id}
        onSubmit={async (fd) => {
          "use server";
          const res = await updateArticle(item.id, fd);
          if (res.ok) {
            // гарантированно обновим список и вернёмся на /admin/news
            revalidatePath("/admin/news");
            redirect("/admin/news");
          }
          // Вернём типобезопасный результат, чтобы форма показала ошибку (если она есть)
          return res as ActionResult;
        }}
        redirectTo="/admin/news"
      />
    </main>
  );
}
