import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminHome() {
  const cards = [
    { href: "/admin/services", title: "Услуги", desc: "Создание и редактирование услуг" },
    { href: "/admin/bookings", title: "Записи", desc: "Онлайн/офлайн-записи и календарь" },
    { href: "/admin/news", title: "Новости/Акции", desc: "Публикации для сайта" },
    // { href: "/admin/media", title: "Медиа", desc: "Галерея работ" },
  ] as const;

  // последние 5 публикаций (новости/акции)
  const latest = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, title: true, slug: true, publishedAt: true, type: true },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Дашборд</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border p-4 hover:shadow-md transition"
          >
            <div className="text-lg font-medium">{c.title}</div>
            <div className="text-sm opacity-70 mt-1">{c.desc}</div>
          </Link>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Последние публикации</h2>
          <Link href="/admin/news/new" className="text-sm underline">Добавить</Link>
        </div>

        {latest.length === 0 ? (
          <p className="text-sm opacity-60">Пока новостей нет.</p>
        ) : (
          <ul className="divide-y border rounded-2xl">
            {latest.map((a) => (
              <li key={a.id} className="flex items-center justify-between p-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{a.title}</div>
                  <div className="text-xs opacity-60">
                    {a.type} · {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "черновик"}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/news/${a.slug}`} className="text-sm underline">Открыть</Link>
                  <Link href={`/admin/news/${a.id}`} className="text-sm underline">Редактировать</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
