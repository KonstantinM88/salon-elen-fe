import { prisma } from "@/lib/db";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { deleteArticle } from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
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

  // серверный обработчик формы удаления
  async function remove(fd: FormData) {
    "use server";
    const id = fd.get("id");
    if (typeof id === "string" && id) {
      await deleteArticle(id);
      // обновим список и дашборд
      revalidatePath("/admin/news");
      revalidatePath("/admin");
    }
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Новости</h1>
        <Link href="/admin/news/new" className="rounded-2xl border px-3 py-2">
          Новая запись
        </Link>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="text-left p-3">Заголовок</th>
              <th className="text-left p-3">Слаг</th>
              <th className="text-left p-3">Тип</th>
              <th className="text-left p-3">Публикация</th>
              <th className="p-3 w-44">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-3">{it.title}</td>
                <td className="p-3 text-muted-foreground">{it.slug}</td>
                <td className="p-3">{it.type}</td>
                <td className="p-3">
                  {it.publishedAt ? new Date(it.publishedAt).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/news/${it.id}`} className="rounded-2xl border px-3 py-1">
                      Редактировать
                    </Link>

                    <form action={remove}>
                      <input type="hidden" name="id" value={it.id} />
                      <button
                        className="rounded-2xl border px-3 py-1 text-red-600"
                        onClick={(e) => {
                          if (!confirm("Удалить запись?")) e.preventDefault();
                        }}
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
                <td className="p-6 text-center text-muted-foreground" colSpan={5}>
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
