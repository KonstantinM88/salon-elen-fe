// src/app/admin/services/page.tsx
import { prisma } from "@/lib/db";
import { createService, updateService, deleteService } from "./actions";

function euro(cents: number | null): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format((cents ?? 0) / 100);
}

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      createdAt: true,
      name: true, // было title
      slug: true,
      durationMin: true,
      priceCents: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return (
    <main className="container py-8 space-y-8">
      <h1 className="text-2xl font-semibold">Услуги</h1>

      {/* Create */}
      <section className="rounded-xl border border-white/10 p-4">
        <h2 className="text-lg font-medium mb-3">Добавить услугу</h2>
        <form action={createService} className="grid gap-3 md:grid-cols-5 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Название</label>
            <input
              name="name"
              className="w-full rounded-lg border bg-transparent px-3 py-2"
              placeholder="Стрижка"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input
              name="slug"
              className="w-full rounded-lg border bg-transparent px-3 py-2"
              placeholder="haircut"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Цена (€)</label>
            <input
              name="priceEuro"
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-lg border bg-transparent px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Длительность (мин)</label>
            <input
              name="durationMin"
              type="number"
              min="1"
              className="w-full rounded-lg border bg-transparent px-3 py-2"
              required
            />
          </div>
          <div className="md:col-span-5">
            <button className="rounded-full px-4 py-2 border hover:bg-white/10 transition">
              Создать
            </button>
          </div>
        </form>
      </section>

      {/* List */}
      <section className="rounded-xl border border-white/10 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>ID</th>
              <th>Название</th>
              <th>Slug</th>
              <th>Цена</th>
              <th>Мин</th>
              <th>Активна</th>
              <th>Обновлена</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr
                key={s.id}
                className="[&>td]:px-3 [&>td]:py-2 align-top border-t border-white/10"
              >
                <td className="whitespace-nowrap">{s.id}</td>
                <td className="min-w-[14rem]">{s.name}</td>
                <td className="min-w-[10rem]">{s.slug}</td>
                <td>{euro(s.priceCents)}</td>
                <td>{s.durationMin}</td>
                <td>{s.isActive ? "Да" : "Нет"}</td>
                <td className="whitespace-nowrap">
                  {new Date(s.updatedAt).toLocaleString()}
                </td>
                <td className="min-w-[22rem]">
                  {/* Update form */}
                  <form
                    action={updateService}
                    className="grid gap-2 md:grid-cols-[1fr,1fr,8rem,8rem,auto]"
                  >
                    <input type="hidden" name="id" value={String(s.id)} />
                    <input
                      name="name"
                      defaultValue={s.name}
                      className="rounded-lg border bg-transparent px-3 py-1.5"
                    />
                    <input
                      name="slug"
                      defaultValue={s.slug}
                      className="rounded-lg border bg-transparent px-3 py-1.5"
                    />
                    <input
                      name="priceEuro"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={
                        s.priceCents !== null ? (s.priceCents / 100).toFixed(2) : ""
                      }
                      className="rounded-lg border bg-transparent px-3 py-1.5"
                    />
                    <input
                      name="durationMin"
                      type="number"
                      min="1"
                      defaultValue={s.durationMin}
                      className="rounded-lg border bg-transparent px-3 py-1.5"
                    />
                    <button className="rounded-full px-3 py-1.5 border hover:bg-white/10 transition">
                      Сохранить
                    </button>
                  </form>

                  {/* Delete form */}
                  <form action={deleteService} className="mt-2">
                    <input type="hidden" name="id" value={String(s.id)} />
                    <button className="rounded-full px-3 py-1.5 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">
                      Удалить
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={8}>
                  Услуг пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
