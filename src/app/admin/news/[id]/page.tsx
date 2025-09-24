import { prisma } from "@/lib/db";
import ArticleForm from "@/components/forms/ArticleForm";
import { updateArticle } from "../actions";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.article.findUnique({ where: { id } });
  if (!item) return <main className="p-6">Not found</main>;

  // Получаем точный тип пропса initial из компонента формы
  type FormInitial = Parameters<typeof ArticleForm>[0]["initial"];

  // Нормализация: null -> "", Date -> ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
  const initial: FormInitial = {
    type: item.type,
    title: item.title,
    slug: item.slug,
    body: item.body ?? "",
    excerpt: item.excerpt ?? "",
    cover: item.cover ?? "",
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : "",
    expiresAt: item.expiresAt ? item.expiresAt.toISOString() : "",
    seoTitle: item.seoTitle ?? "",
    seoDesc: item.seoDesc ?? "",
    ogTitle: item.ogTitle ?? "",
    ogDesc: item.ogDesc ?? "",
  };

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Редактировать</h1>
      <ArticleForm
        initial={initial}
        onSubmit={async (fd) => {
          "use server";
          return await updateArticle(id, fd); // важно вернуть результат
        }}
        redirectTo="/admin/news"
      />
    </main>
  );
}
