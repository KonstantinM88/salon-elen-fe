// src/app/admin/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import { AppointmentStatus } from "@prisma/client";

function fmt(d: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function daysUntilBirthday(birthDate: Date, today: Date): number {
  const m = birthDate.getUTCMonth();
  const d = birthDate.getUTCDate();
  const thisYear = new Date(Date.UTC(today.getUTCFullYear(), m, d));
  const next =
    thisYear >= today
      ? thisYear
      : new Date(Date.UTC(today.getUTCFullYear() + 1, m, d));
  const diff = Math.ceil(
    (next.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
  );
  return diff;
}

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    articleCount,
    appointmentCount,
    clientCount,
    latestArticles,
    clients,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.appointment.count({
      where: {
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
    }),
    prisma.client.count(), // ← счётчик клиентов
    prisma.article.findMany({
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: { id: true, title: true, createdAt: true, publishedAt: true },
    }),
    prisma.client.findMany({
      select: { id: true, name: true, birthDate: true },
    }),
  ]);

  const today = new Date();
  const upcoming = clients
    .map((c) => ({ ...c, inDays: daysUntilBirthday(c.birthDate, today) }))
    .filter((c) => c.inDays >= 0 && c.inDays <= 30)
    .sort((a, b) => a.inDays - b.inDays)
    .slice(0, 10);

  return (
    <main className="p-6 space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-3">Статистика</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="card">
            <div className="card-title">Новости</div>
            <div className="card-value">{articleCount}</div>
          </div>
          <div className="card">
            <div className="card-title">Заявки</div>
            <div className="card-value">{appointmentCount}</div>
          </div>
          {/* Новая карточка */}
          <div className="card">
            <div className="card-title">Клиенты</div>
            <div className="card-value">{clientCount}</div>
          </div>
          <div className="card">
            <div className="card-title">Ближайшие ДР (30 дней)</div>
            <div className="card-value">{upcoming.length}</div>
          </div>
        </div>
      </section>

      {/* Блок быстрых ссылок */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Быстрые ссылки</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-4">
            <div className="card-title mb-1">Сотрудники</div>
            <p className="text-sm opacity-70 mb-3">
              Управление мастерами, их услугами и расписанием.
            </p>
            <Link href="/admin/masters" className="btn">
              Открыть
            </Link>
          </div>
          <div className="card p-4">
            <div className="card-title mb-1">Календарь</div>
            <p className="text-sm opacity-70 mb-3">
              Глобальные рабочие часы салона и исключения по датам.
            </p>
            <Link href="/admin/calendar" className="btn">
              Открыть
            </Link>
          </div>
          <div className="card p-4">
            <div className="card-title mb-1">Статистика</div>
            <p className="text-sm opacity-70 mb-3">
              Заявки и касса по периодам, мастерам и услугам.
            </p>
            <Link href="/admin/stats" className="btn">
              Смотреть
            </Link>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div>
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
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Ближайшие именинники (30 дней)</h2>
            <Link href="/admin/clients?filter=birthdays" className="btn">
              Все
            </Link>
          </div>
          <div className="rounded-2xl border divide-y">
            {upcoming.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs opacity-60">через {c.inDays} дн.</div>
                </div>
                <Link href={`/admin/clients/${c.id}`} className="link">
                  Открыть →
                </Link>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="p-4 opacity-70">Нет ближайших дней рождения</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
