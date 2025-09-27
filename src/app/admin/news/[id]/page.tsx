import { prisma } from "@/lib/db";
import ArticleForm from "@/components/forms/ArticleForm";
import { updateArticle } from "../actions";

/** Типы результата без any */
type FieldErrors = Record<string, string[]>;
type ActionFail = { ok: false; error: string; details?: { fieldErrors?: FieldErrors } };
type ActionSuccess = { ok: true; id?: string };
type ActionResult = ActionSuccess | ActionFail;

/** Прокси-экшен для формы */
export async function updateArticleAction(form: FormData): Promise<ActionResult> {
  "use server";
  const id = String(form.get("id") ?? "");
  const res = await updateArticle(id, form);
  if (res.ok) return { ok: true, id: (res as { ok: true; id?: string }).id };

  const details =
    "details" in res ? (res as { details?: { fieldErrors?: FieldErrors } }).details : undefined;
  return { ok: false, error: (res as { ok: false; error: string }).error, details };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await prisma.article.findUnique({ where: { id } });
  if (!item) return <main className="p-6">Not found</main>;

  type FormInitial = Parameters<typeof ArticleForm>[0]["initial"];
  type AllowedType = Exclude<NonNullable<FormInitial>["type"], undefined>; // "ARTICLE" | "NEWS"

  // Приведение типа из БД к форме:
  function mapToFormType(t: string): AllowedType {
    switch (t) {
      case "ARTICLE":
        return "ARTICLE";
      case "NEWS":
        return "NEWS";
      // если вдруг попадётся старое "PROMO" — считаем это "NEWS"
      case "PROMO":
        return "NEWS";
      default:
        return "ARTICLE";
    }
  }

  const safeType = mapToFormType(String(item.type));

  const initial: FormInitial = {
    type: safeType,
    title: item.title ?? "",
    slug: item.slug ?? "",
    excerpt: item.excerpt ?? "",
    body: item.body ?? "",
    cover: "",
    publishedAt: item.publishedAt ?? null,
    expiresAt: item.expiresAt ?? null,
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
        articleId={id}
        onSubmit={updateArticleAction}
        redirectTo="/admin/news"
      />
    </main>
  );
}
