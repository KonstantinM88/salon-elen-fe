import Link from "next/link";

export default function AdminHome() {
  const cards = [
    { href: "/admin/services", title: "Услуги", desc: "Создание и редактирование услуг" },
    { href: "/admin/bookings", title: "Записи", desc: "Онлайн/офлайн-записи и календарь" },
    { href: "/admin/news", title: "Новости/Акции", desc: "Публикации для сайта" },
    // { href: "/admin/media", title: "Медиа", desc: "Галерея работ (скоро)" },
  ];
  return (
    <div className="space-y-6">
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
    </div>
  );
}
