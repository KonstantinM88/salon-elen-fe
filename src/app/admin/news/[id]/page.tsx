import { prisma } from "@/lib/db";
import ArticleForm from "@/components/forms/ArticleForm";
import { updateArticle, type ActionResult } from "../actions";
import { redirect, notFound } from "next/navigation";

// В Next.js 15 params нужно await-ить
type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  // ✅ Правильное чтение динамического параметра
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
      type: true,
    },
  });

  if (!item) return notFound();

  const initial = {
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? "",
    body: item.body,
    cover: item.cover ?? null,
    // форма ожидает строки (ISO) либо пусто
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : "",
    expiresAt: item.expiresAt ? item.expiresAt.toISOString() : "",
    seoTitle: item.seoTitle ?? "",
    seoDesc: item.seoDesc ?? "",
    ogTitle: item.ogTitle ?? "",
    ogDesc: item.ogDesc ?? "",
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Редактировать</h1>

      <ArticleForm
        initial={initial}
        articleId={item.id}
        onSubmit={async (fd) => {
          "use server";
          const res = await updateArticle(item.id, fd);
          if (res.ok) {
            redirect("/admin/news");
          }
          return res as ActionResult;
        }}
      />
    </main>
  );
}
