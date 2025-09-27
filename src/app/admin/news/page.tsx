import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteArticle } from "./actions";

export const dynamic = "force-dynamic";

async function getList() {
  return prisma.article.findMany({
    where: {},
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, type: true, publishedAt: true, createdAt: true },
  });
}

export default async function AdminNewsPage() {
  const rows = await getList();

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Новости</h1>
        <Link className="btn" href="/admin/news/new">
          Новая запись
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Заголовок</th>
              <th className="px-3 py-2 text-left">Тип</th>
              <th className="px-3 py-2 text-left">Публикация</th>
              <th className="px-3 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2">{r.type}</td>
                <td className="px-3 py-2">
                  {r.publishedAt ? new Date(r.publishedAt).toLocaleString() : "—"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    <Link className="btn border" href={`/admin/news/${r.id}`}>
                      Редактировать
                    </Link>

                    {/* Никаких onClick — только server action через formAction */}
                    <form>
                      <button
                        type="submit"
                        className="btn border text-red-600"
                        formAction={async () => {
                          "use server";
                          await deleteArticle(r.id);
                        }}
                      >
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center opacity-60" colSpan={4}>
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
