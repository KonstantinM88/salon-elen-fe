import { prisma } from "@/lib/db";
import Link from "next/link";
import { deleteArticle } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const list = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Новости и акции</h1>
        <Link href="/admin/news/new" className="border rounded-2xl px-4 py-2">Добавить</Link>
      </div>

      <div className="overflow-x-auto border rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50">
              <th className="text-left p-2">Заголовок</th>
              <th className="text-left p-2">Тип</th>
              <th className="text-left p-2">Публикация</th>
              <th className="text-left p-2">Действия</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.title}</td>
                <td className="p-2">{item.type}</td>
                <td className="p-2">{item.publishedAt ? new Date(item.publishedAt).toLocaleString() : "-"}</td>
                <td className="p-2 space-x-2">
                  <Link href={"/admin/news/" + item.id} className="underline">Редактировать</Link>
                  <form action={async () => { "use server"; await deleteArticle(item.id); }} className="inline">
                    <button className="text-red-600 underline" formAction={async () => { "use server"; await deleteArticle(item.id); }}>
                      Удалить
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
