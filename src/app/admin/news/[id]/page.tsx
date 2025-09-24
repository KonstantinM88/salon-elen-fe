import { prisma } from "@/lib/db";
import ArticleForm from "@/components/forms/ArticleForm";
import { updateArticle } from "../actions";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.article.findUnique({ where: { id } });
  if (!item) return <main className="p-6">Not found</main>;

  // приведение типов: null -> undefined, даты -> ISO-строки
  const initial = {
    type: item.type,
    title: item.title,
    slug: item.slug,
    body: item.body,
    excerpt: item.excerpt ?? undefined,
    cover: item.cover ?? undefined,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    expiresAt: item.expiresAt ? item.expiresAt.toISOString() : null,
    seoTitle: item.seoTitle ?? undefined,
    seoDesc: item.seoDesc ?? undefined,
    ogTitle: item.ogTitle ?? undefined,
    ogDesc: item.ogDesc ?? undefined,
  } satisfies import("@/lib/validators").ArticleInput | Partial<import("@/lib/validators").ArticleInput>;

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Редактировать</h1>
      <ArticleForm initial={initial} onSubmit={async (fd) => { "use server"; await updateArticle(id, fd); }} />
    </main>
  );
}

