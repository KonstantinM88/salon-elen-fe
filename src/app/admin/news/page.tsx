import Link from "next/link";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ArticleType } from "@prisma/client";

export const dynamic = "force-dynamic";

function fmt(date: Date | null) {
  if (!date) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// поддерживаем и старые записи с NEWS
type AnyType = ArticleType | "NEWS";
const TYPE_LABEL: Record<AnyType, string> = {
  ARTICLE: "ARTICLE",
  PROMO: "PROMO",
  NEWS: "NEWS",
};

export default async function NewsList() {
  const items = await prisma.article.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  // server action для удаления
  async function deleteAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    if (!id) return;

    await prisma.article.delete({ where: { id } });

    revalidatePath("/admin/news");
    revalidatePath("/admin");
    revalidatePath("/news");
    revalidatePath("/");
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Новости</h1>
        <Link
          href="/admin/news/new"
          className="rounded-xl px-3 py-2 bg-emerald-600 hover:bg-emerald-500 transition text-white"
        >
          Новая запись
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-300">
            <tr>
              <th className="py-2 pr-4">Заголовок</th>
              <th className="py-2 pr-4">Тип</th>
              <th className="py-2 pr-4">Публикация</th>
              <th className="py-2 pr-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id} className="border-t border-slate-800">
                <td className="py-2 pr-4">{n.title}</td>
                <td className="py-2 pr-4">
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs">
                    {TYPE_LABEL[n.type as AnyType]}
                  </span>
                </td>
                <td className="py-2 pr-4">{fmt(n.publishedAt ?? n.createdAt)}</td>
                <td className="py-2 pr-2">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/news/${n.id}`}
                      className="rounded-lg px-2 py-1 bg-slate-800 hover:bg-slate-700"
                    >
                      Редактировать
                    </Link>

                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <button
                        className="rounded-lg px-2 py-1 bg-rose-700/90 hover:bg-rose-600 text-white"
                        aria-label={`Удалить "${n.title}"`}
                      >
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {items.length === 0 && (
              <tr>
                <td className="py-4 text-slate-400" colSpan={4}>
                  Записей пока нет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
