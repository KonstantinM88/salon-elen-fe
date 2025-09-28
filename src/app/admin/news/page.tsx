import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteArticle } from "./actions";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

async function deleteAction(formData: FormData): Promise<void> {
  "use server";
  await deleteArticle(formData);
}

export default async function Page() {
  const items = await prisma.article.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Новости</h1>
        <Link href="/admin/news/new" className="btn btn-primary">
          Новая запись
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Заголовок</th>
              <th className="p-3 text-left">Публикация</th>
              <th className="p-3 text-left">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((n) => (
              <tr key={n.id} className="border-t">
                <td className="p-3">{n.title}</td>
                <td className="p-3">{fmt(n.publishedAt ?? n.createdAt)}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/news/${n.id}`} className="btn btn-sm">
                      Редактировать
                    </Link>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <button className="btn btn-sm btn-danger" type="submit">
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-4 opacity-70" colSpan={3}>
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
