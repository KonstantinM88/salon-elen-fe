// src/app/admin/services/page.tsx
import { prisma } from "@/lib/db";
import { createService, updateService, deleteService } from "./actions";
import ServiceCreateForm from "./ServiceCreateForm";

function euro(cents: number | null): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format((cents ?? 0) / 100);
}

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const categories = await prisma.service.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      durationMin: true,
      priceCents: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      children: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          durationMin: true,
          priceCents: true,
          isActive: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  const parentOptions = categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <main className="container py-8 space-y-8">
      <h1 className="text-2xl font-semibold">Услуги</h1>

      {/* Create */}
      <section className="rounded-xl border border-white/10 p-4">
        <h2 className="text-lg font-medium mb-3">Добавить</h2>
        <ServiceCreateForm parentOptions={parentOptions} action={createService} />
      </section>

      {/* ======== DESKTOP (table) ======== */}
      <section className="rounded-xl border border-white/10 overflow-x-auto hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Название</th>
              <th>Slug</th>
              <th>Цена</th>
              <th>Мин</th>
              <th>Активна</th>
              <th>Категория</th>
              <th>Описание</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="[&>td]:px-3 [&>td]:py-2 align-top border-t border-white/10">
                <td className="font-medium">{c.name}</td>
                <td>{c.slug}</td>
                <td>{euro(c.priceCents)}</td>
                <td>{c.durationMin}</td>
                <td>{c.isActive ? "Да" : "Нет"}</td>
                <td>—</td>
                <td className="max-w-[32rem]">{c.description ?? "—"}</td>
                <td className="min-w-[22rem]">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Update category */}
                    <form action={updateService} className="grid grid-cols-2 gap-2 col-span-2">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="kind" value="category" />
                      <input name="name" defaultValue={c.name} className="rounded-lg border bg-transparent px-2 py-1 col-span-2" />
                      <input name="slug" defaultValue={c.slug} className="rounded-lg border bg-transparent px-2 py-1" />
                      <div className="flex items-center gap-2">
                        <input id={`active-${c.id}`} name="isActive" type="checkbox" defaultChecked={c.isActive} className="rounded" />
                        <label htmlFor={`active-${c.id}`}>Активна</label>
                      </div>
                      <textarea name="description" defaultValue={c.description ?? ""} rows={2} className="rounded-lg border bg-transparent px-2 py-1 col-span-2" />
                      <div className="col-span-2">
                        <button className="rounded-full px-3 py-1.5 border hover:bg-white/10 transition">Сохранить</button>
                      </div>
                    </form>

                    {/* Children */}
                    {c.children.map((s) => (
                      <div key={s.id} className="col-span-2 border-t border-white/10 pt-3">
                        <div className="pl-6 font-medium mb-2">{s.name}</div>
                        <div className="grid grid-cols-2 gap-2">
                          <form action={updateService} className="grid grid-cols-2 gap-2 col-span-2">
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="kind" value="service" />
                            <input name="name" defaultValue={s.name} className="rounded-lg border bg-transparent px-2 py-1 col-span-2" />
                            <input name="slug" defaultValue={s.slug} className="rounded-lg border bg-transparent px-2 py-1" />
                            <input name="durationMin" type="number" min={0} step={5} defaultValue={s.durationMin} className="rounded-lg border bg-transparent px-2 py-1" />
                            <input name="price" inputMode="decimal" defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ""} className="rounded-lg border bg-transparent px-2 py-1" />
                            <div className="flex items-center gap-2">
                              <input id={`active-${s.id}`} name="isActive" type="checkbox" defaultChecked={s.isActive} className="rounded" />
                              <label htmlFor={`active-${s.id}`}>Активна</label>
                            </div>
                            <select name="parentId" defaultValue={s.parentId ?? ""} className="rounded-lg border bg-transparent px-2 py-1">
                              <option value="">— без категории —</option>
                              {parentOptions.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <textarea name="description" defaultValue={s.description ?? ""} rows={2} className="rounded-lg border bg-transparent px-2 py-1 col-span-2" />
                            <div className="col-span-2">
                              <button className="rounded-full px-3 py-1.5 border hover:bg-white/10 transition">Сохранить</button>
                            </div>
                          </form>

                          {/* Delete child (отдельная форма, НЕ внутри update-формы) */}
                          <form action={deleteService} className="col-span-2">
                            <input type="hidden" name="id" value={s.id} />
                            <button className="rounded-full px-3 py-1.5 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">
                              Удалить
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}

                    {/* Delete category (отдельная форма, НЕ внутри update-формы) */}
                    <form action={deleteService} className="col-span-2 mt-2">
                      <input type="hidden" name="id" value={c.id} />
                      <button className="rounded-full px-3 py-1.5 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">Удалить категорию</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={8}>
                  Услуг пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* ======== MOBILE (cards/accordions) ======== */}
      <section className="md:hidden space-y-4">
        {categories.length === 0 && (
          <div className="rounded-xl border border-white/10 p-4 text-sm text-gray-400">Услуг пока нет</div>
        )}

        {categories.map((c) => (
          <details key={c.id} className="rounded-xl border border-white/10 overflow-hidden">
            <summary className="cursor-pointer select-none px-4 py-3 bg-white/5 flex items-center justify-between">
              <span className="font-medium">{c.name}</span>
              <span className="text-xs opacity-70">{c.isActive ? "активна" : "выкл"}</span>
            </summary>

            {/* Категория — форма */}
            <div className="p-4 space-y-3">
              <form action={updateService} className="grid grid-cols-1 gap-3">
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="kind" value="category" />
                <div>
                  <label className="block text-xs mb-1 opacity-80">Название</label>
                  <input name="name" defaultValue={c.name} className="w-full rounded-lg border bg-transparent px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs mb-1 opacity-80">Slug</label>
                  <input name="slug" defaultValue={c.slug} className="w-full rounded-lg border bg-transparent px-3 py-2" />
                </div>
                <div className="flex items-center gap-2">
                  <input id={`active-m-${c.id}`} name="isActive" type="checkbox" defaultChecked={c.isActive} className="rounded" />
                  <label htmlFor={`active-m-${c.id}`} className="text-sm">Активна</label>
                </div>
                <div>
                  <label className="block text-xs mb-1 opacity-80">Описание</label>
                  <textarea name="description" defaultValue={c.description ?? ""} rows={3} className="w-full rounded-lg border bg-transparent px-3 py-2" />
                </div>
                <div>
                  <button className="w-full rounded-full px-4 py-2 border hover:bg-white/10 transition">Сохранить</button>
                </div>
              </form>

              {/* Отдельная форма удаления категории */}
              <form action={deleteService}>
                <input type="hidden" name="id" value={c.id} />
                <button className="w-full rounded-full px-4 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">
                  Удалить категорию
                </button>
              </form>

              {/* Подуслуги */}
              {c.children.length > 0 && (
                <div className="mt-2 space-y-3">
                  <p className="text-xs uppercase tracking-wide opacity-60">Подуслуги</p>
                  {c.children.map((s) => (
                    <div key={s.id} className="rounded-lg border border-white/10 p-3 space-y-3">
                      <form action={updateService} className="grid grid-cols-1 gap-3">
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="kind" value="service" />
                        <div>
                          <label className="block text-xs mb-1 opacity-80">Название</label>
                          <input name="name" defaultValue={s.name} className="w-full rounded-lg border bg-transparent px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-xs mb-1 opacity-80">Slug</label>
                          <input name="slug" defaultValue={s.slug} className="w-full rounded-lg border bg-transparent px-3 py-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs mb-1 opacity-80">Минуты</label>
                            <input name="durationMin" type="number" min={0} step={5} defaultValue={s.durationMin} className="w-full rounded-lg border bg-transparent px-3 py-2" />
                          </div>
                          <div>
                            <label className="block text-xs mb-1 opacity-80">Цена (€)</label>
                            <input name="price" inputMode="decimal" defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ""} className="w-full rounded-lg border bg-transparent px-3 py-2" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center gap-2">
                            <input id={`active-s-${s.id}`} name="isActive" type="checkbox" defaultChecked={s.isActive} className="rounded" />
                            <label htmlFor={`active-s-${s.id}`} className="text-sm">Активна</label>
                          </div>
                          <div>
                            <label className="block text-xs mb-1 opacity-80">Категория</label>
                            <select name="parentId" defaultValue={s.parentId ?? ""} className="w-full rounded-lg border bg-transparent px-3 py-2">
                              <option value="">— без категории —</option>
                              {parentOptions.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs mb-1 opacity-80">Описание</label>
                          <textarea name="description" defaultValue={s.description ?? ""} rows={3} className="w-full rounded-lg border bg-transparent px-3 py-2" />
                        </div>
                        <div>
                          <button className="w-full rounded-full px-4 py-2 border hover:bg-white/10 transition">Сохранить</button>
                        </div>
                      </form>

                      {/* Отдельная форма удаления подуслуги */}
                      <form action={deleteService}>
                        <input type="hidden" name="id" value={s.id} />
                        <button className="w-full rounded-full px-4 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500/10 transition">
                          Удалить
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </details>
        ))}
      </section>
    </main>
  );
}
