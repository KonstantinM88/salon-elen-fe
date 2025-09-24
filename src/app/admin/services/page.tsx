import { prisma } from '@/lib/db';
import { createService, updateService, deleteService } from './actions';

export const dynamic = 'force-dynamic';

function euro(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

export default async function AdminServicesPage() {
  const rows = await prisma.service.findMany({
    orderBy: [{ id: 'asc' }],
  });

  return (
    <main className="container py-8 space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Услуги</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Управляйте списком услуг, ценами, длительностью и описанием
          </p>
        </div>
      </header>

      {/* Добавление */}
      <section className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <h2 className="font-medium mb-4">Добавить услугу</h2>

        <form action={createService} className="grid gap-3 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label htmlFor="new-title" className="block text-sm mb-1">
              Название*
            </label>
            <input id="new-title" name="title" className="input w-full" required />
          </div>

          <div>
            <label htmlFor="new-slug" className="block text-sm mb-1">
              Слаг (если пусто — из названия)
            </label>
            <input id="new-slug" name="slug" className="input w-full" />
          </div>

          <div>
            <label htmlFor="new-price" className="block text-sm mb-1">
              Цена, €
            </label>
            <input
              id="new-price"
              name="priceEuro"
              type="number"
              step="0.01"
              className="input w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="new-duration" className="block text-sm mb-1">
              Мин.*
            </label>
            <input
              id="new-duration"
              name="durationMin"
              type="number"
              className="input w-full"
              required
            />
          </div>

          <div className="sm:col-span-5">
            <label htmlFor="new-description" className="block text-sm mb-1">
              Описание (необязательно)
            </label>
            <textarea
              id="new-description"
              name="description"
              className="input w-full min-h-[88px]"
            />
          </div>

          <div className="sm:col-span-5">
            <button className="btn">Сохранить</button>
          </div>
        </form>
      </section>

      {/* Таблица */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>ID</th>
              <th>Название</th>
              <th>Слаг</th>
              <th>Цена, €</th>
              <th>Мин.</th>
              <th>Описание</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-black/5">
            {rows.map((s) => (
              <tr key={s.id} className="[&>td]:px-3 [&>td]:py-2 align-top">
                <td className="whitespace-nowrap">{s.id}</td>
                <td className="min-w-[14rem]">{s.title}</td>
                <td className="min-w-[10rem]">{s.slug}</td>
                <td>{euro(s.priceCents)}</td>
                <td>{s.durationMin}</td>
                <td className="max-w-[40ch] text-gray-700 dark:text-gray-300">
                  {s.description ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="min-w-[18rem]">
                  {/* Inline-редактирование */}
                  <form action={updateService} className="grid gap-2 sm:grid-cols-5">
                    <input type="hidden" name="id" value={s.id} />

                    <div className="sm:col-span-2">
                      <label htmlFor={`title-${s.id}`} className="sr-only">
                        Название
                      </label>
                      <input
                        id={`title-${s.id}`}
                        name="title"
                        defaultValue={s.title}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor={`slug-${s.id}`} className="sr-only">
                        Слаг
                      </label>
                      <input
                        id={`slug-${s.id}`}
                        name="slug"
                        defaultValue={s.slug}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor={`price-${s.id}`} className="sr-only">
                        Цена, €
                      </label>
                      <input
                        id={`price-${s.id}`}
                        name="priceEuro"
                        type="number"
                        step="0.01"
                        defaultValue={euro(s.priceCents)}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor={`duration-${s.id}`} className="sr-only">
                        Мин.
                      </label>
                      <input
                        id={`duration-${s.id}`}
                        name="durationMin"
                        type="number"
                        defaultValue={String(s.durationMin)}
                        className="input w-full"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label htmlFor={`desc-${s.id}`} className="sr-only">
                        Описание
                      </label>
                      <textarea
                        id={`desc-${s.id}`}
                        name="description"
                        defaultValue={s.description ?? ''}
                        className="input w-full min-h-[72px]"
                      />
                    </div>

                    <div className="sm:col-span-5 flex gap-2">
                      <button className="btn">Обновить</button>

                      {/* Вторая операция в той же форме */}
                      <button
                        className="btn border-red-300 dark:border-red-700 bg-transparent"
                        // name="id"
                        // value={s.id}
                        formAction={deleteService}
                      >
                        Удалить
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                  Пока нет услуг — добавьте первую выше
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
