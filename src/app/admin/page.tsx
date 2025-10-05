// src/app/admin/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";

export const revalidate = 0;             // отключаем ISR
export const dynamic = "force-dynamic";  // принудительно динамическая страница

function fmt(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default async function AdminDashboard() {
  const [articleCount, appointmentCount, latestArticles] = await Promise.all([
    prisma.article.count(),
    prisma.appointment.count({
      where: {
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
    }),
    prisma.article.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: { id: true, title: true, createdAt: true, publishedAt: true },
    }),
  ]);

  return (
    <main className="p-6 space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">Статистика</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="card">
            <div className="card-title">Новости</div>
            <div className="card-value">{articleCount}</div>
          </div>
          <div className="card">
            <div className="card-title">Заявки</div>
            <div className="card-value">{appointmentCount}</div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Последние публикации</h2>
          <Link href="/admin/news/new" className="btn btn-primary">
            Добавить
          </Link>
        </div>
        <div className="rounded-2xl border divide-y">
          {latestArticles.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs opacity-60">
                  {fmt(a.publishedAt ?? a.createdAt)}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/news/${a.id}`} className="btn btn-sm">
                  Редактировать
                </Link>
              </div>
            </div>
          ))}
          {latestArticles.length === 0 && (
            <div className="p-4 opacity-70">Пока нет публикаций</div>
          )}
        </div>
      </section>
    </main>
  );
}
