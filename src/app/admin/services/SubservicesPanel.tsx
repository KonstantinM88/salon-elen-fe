"use client";

import React, { useMemo, useState, ChangeEvent } from "react";
import { useActionState } from "react";
import type { ActionResult } from "./actions"; // ← единый тип

type ParentOption = { id: string; name: string };

type Sub = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  durationMin: number | null;
  priceCents: number | null;
  isActive: boolean;
  parentId: string | null;
  parentName: string;
  createdAt: string;
  updatedAt: string;
};

type ViewMode = "cards" | "table";
type SortKey = "name" | "price" | "minutes";

type Props = {
  parentOptions: ParentOption[];
  subservices: Sub[];
  updateAction: (formData: FormData) => Promise<ActionResult>;
  deleteAction: (formData: FormData) => Promise<ActionResult>;
};

function euro(cents: number | null): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "EUR" })
    .format((cents ?? 0) / 100);
}

/** адаптер под server action */
function useServerAction(
  action: (fd: FormData) => Promise<ActionResult>,
  initial: ActionResult = { ok: true }
) {
  const [state, formAction] = useActionState(
    async (_prev: ActionResult, formData: FormData) => {
      try {
        const res = await action(formData);
        return res ?? { ok: true };
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Произошла неизвестная ошибка";
        return { ok: false, message: msg };
      }
    },
    initial
  );
  return { state, formAction };
}

/* ======================= ГЛАВНАЯ ПАНЕЛЬ ======================= */

export default function SubservicesPanel({
  parentOptions,
  subservices,
  updateAction,
  deleteAction,
}: Props) {
  const [q, setQ] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<ViewMode>("cards");
  const [filterParent, setFilterParent] = useState("all");

  const filtered = useMemo<Sub[]>(() => {
    const query = q.trim().toLowerCase();
    const list = subservices.filter((s) => {
      if (onlyActive && !s.isActive) return false;
      if (filterParent !== "all" && s.parentId !== filterParent) return false;
      if (!query) return true;
      const hay = `${s.name} ${s.slug ?? ""} ${s.parentName} ${
        s.description ?? ""
      }`.toLowerCase();
      return hay.includes(query);
    });

    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price") return (a.priceCents ?? 0) - (b.priceCents ?? 0);
      return (a.durationMin ?? 0) - (b.durationMin ?? 0);
    });

    return list;
  }, [subservices, onlyActive, filterParent, q, sort]);

  return (
    <section className="admin-section space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-medium">Подуслуги</h2>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по названию, описанию…"
            className="admin-input min-w-[14rem]"
          />

          <select
            value={filterParent}
            onChange={(e) => setFilterParent(e.target.value)}
            className="admin-select"
          >
            <option value="all">Все категории</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="admin-select"
          >
            <option value="name">Сортировать: имя</option>
            <option value="price">Сортировать: цена</option>
            <option value="minutes">Сортировать: минуты</option>
          </select>

          <label className="inline-flex select-none items-center gap-2 rounded-full border border-white/15 px-3 py-2">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="admin-switch"
            />
            Только активные
          </label>

          <div className="ml-1 inline-flex rounded-full border border-white/15 p-1">
            <button
              type="button"
              onClick={() => setView("cards")}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                view === "cards" ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              Карточки
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                view === "table" ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              Таблица
            </button>
          </div>
        </div>
      </header>

      {view === "cards" ? (
        <CardsView
          items={filtered}
          parentOptions={parentOptions}
          updateAction={updateAction}
          deleteAction={deleteAction}
        />
      ) : (
        <TableView
          items={filtered}
          parentOptions={parentOptions}
          updateAction={updateAction}
          deleteAction={deleteAction}
        />
      )}
    </section>
  );
}

/* ===================== УТИЛИТНЫЕ ФОРМЫ ===================== */

function UpdateServiceForm({
  s,
  parentOptions,
  updateAction,
  layout = "grid",
}: {
  s: Sub;
  parentOptions: ParentOption[];
  updateAction: (fd: FormData) => Promise<ActionResult>;
  layout?: "grid" | "stack";
}) {
  const { state, formAction } = useServerAction(updateAction, { ok: true });
  const grid =
    layout === "grid" ? "grid grid-cols-2 gap-2" : "grid grid-cols-1 gap-2";

  return (
    <>
      <form action={formAction} className={grid}>
        <input type="hidden" name="id" value={s.id} />
        <input type="hidden" name="kind" value="service" />

        <div className="col-span-2">
          <label className="mb-1 block text-xs opacity-70">Название</label>
          <input name="name" defaultValue={s.name} className="admin-input" />
        </div>

        <div>
          <label className="mb-1 block text-xs opacity-70">Минуты</label>
          <input
            name="durationMin"
            type="number"
            min={0}
            step={5}
            defaultValue={s.durationMin ?? 0}
            className="admin-input"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs opacity-70">Цена (€)</label>
          <input
            name="price"
            inputMode="decimal"
            defaultValue={s.priceCents ? String(s.priceCents / 100) : ""}
            className="admin-input"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs opacity-70">Категория</label>
          <select
            name="parentId"
            defaultValue={s.parentId ?? ""}
            className="admin-select"
          >
            <option value="">— без категории —</option>
            {parentOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            id={`active-${s.id}`}
            name="isActive"
            type="checkbox"
            defaultChecked={s.isActive}
            className="admin-switch"
          />
          <label htmlFor={`active-${s.id}`} className="text-sm">
            Активна
          </label>
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-xs opacity-70">Описание</label>
          <textarea
            name="description"
            defaultValue={s.description ?? ""}
            rows={2}
            className="admin-textarea"
          />
        </div>

        <div className="col-span-2 mt-1">
          <button className="btn-primary">Сохранить</button>
        </div>
      </form>

      {!state.ok && state.message && (
        <p className="mt-2 text-sm text-rose-300/90">{state.message}</p>
      )}
    </>
  );
}

function DeleteServiceForm({
  id,
  deleteAction,
  compact = false,
}: {
  id: string;
  deleteAction: (fd: FormData) => Promise<ActionResult>;
  compact?: boolean;
}) {
  const { state, formAction } = useServerAction(deleteAction, { ok: true });

  return (
    <>
      <form action={formAction} className={compact ? "inline-block" : ""}>
        <input type="hidden" name="id" value={id} />
        <button className="btn-danger">Удалить</button>
      </form>
      {!state.ok && state.message && (
        <p className="mt-2 text-sm text-rose-300/90">{state.message}</p>
      )}
    </>
  );
}

/* ===================== ВИД: КАРТОЧКИ ===================== */

function CardsView(props: {
  items: Sub[];
  parentOptions: ParentOption[];
  updateAction: (formData: FormData) => Promise<ActionResult>;
  deleteAction: (formData: FormData) => Promise<ActionResult>;
}) {
  const { items, parentOptions, updateAction, deleteAction } = props;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 p-6 text-center text-white/60">
        Ничего не найдено
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((s) => (
        <article key={s.id} className="admin-card p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-medium">{s.name}</div>
              <div className="text-xs text-white/50">{s.parentName}</div>
            </div>
            {s.isActive ? (
              <span className="tag-active">активна</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
                выкл
              </span>
            )}
          </div>

          <UpdateServiceForm
            s={s}
            parentOptions={parentOptions}
            updateAction={updateAction}
            layout="grid"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-white/45">
              Цена: {euro(s.priceCents)} · Мин: {s.durationMin ?? 0}
            </span>
            <DeleteServiceForm id={s.id} deleteAction={deleteAction} compact />
          </div>
        </article>
      ))}
    </div>
  );
}

/* ===================== ВИД: ТАБЛИЦА ===================== */

function TableView(props: {
  items: Sub[];
  parentOptions: ParentOption[];
  updateAction: (formData: FormData) => Promise<ActionResult>;
  deleteAction: (formData: FormData) => Promise<ActionResult>;
}) {
  const { items, parentOptions, updateAction, deleteAction } = props;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="table">
        <thead className="thead">
          <tr>
            <th className="th">Название</th>
            <th className="th">Категория</th>
            <th className="th">Цена</th>
            <th className="th">Мин</th>
            <th className="th">Активна</th>
            <th className="th">Описание</th>
            <th className="th" style={{ width: 220 }} />
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} className="row">
              <td className="td font-medium">{s.name}</td>
              <td className="td">{s.parentName || "—"}</td>
              <td className="td">{euro(s.priceCents)}</td>
              <td className="td">{s.durationMin ?? 0}</td>
              <td className="td">
                {s.isActive ? (
                  <span className="tag-active">Да</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
                    Нет
                  </span>
                )}
              </td>
              <td className="td max-w-[32rem]">
                <span className="block truncate">{s.description ?? "—"}</span>
              </td>
              <td className="td">
                <details className="relative">
                  <summary className="btn-secondary cursor-pointer list-none">
                    Редактировать
                  </summary>

                  <div className="popover">
                    <UpdateServiceForm
                      s={s}
                      parentOptions={parentOptions}
                      updateAction={updateAction}
                      layout="grid"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-white/45">
                        ID: {s.id.slice(0, 8)}… · Slug:{" "}
                        <span className="font-mono opacity-80">
                          {s.slug ?? "—"}
                        </span>
                      </span>
                      <DeleteServiceForm
                        id={s.id}
                        deleteAction={deleteAction}
                        compact
                      />
                    </div>
                  </div>
                </details>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td className="td py-6 text-center text-white/50" colSpan={7}>
                Ничего не найдено
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}






//--------работал в преведущей версии до удаления
// //SubservicesPanel.tsx
// 'use client';

// import React, { useMemo, useState, ChangeEvent } from 'react';
// import { useActionState } from 'react'; // React 19

// // Тип результата серверного экшена (должен совпадать с actions.ts)
// export type ActionResult = {
//   ok: boolean;
//   message?: string;
// };

// type ParentOption = { id: string; name: string };

// type Sub = {
//   id: string;
//   name: string;
//   slug: string | null;
//   description: string | null;
//   durationMin: number | null;
//   priceCents: number | null;
//   isActive: boolean;
//   parentId: string | null;
//   parentName: string;
//   createdAt: string;
//   updatedAt: string;
// };

// type ViewMode = 'cards' | 'table';
// type SortKey = 'name' | 'price' | 'minutes';

// type Props = {
//   parentOptions: ParentOption[];
//   subservices: Sub[];
//   updateAction: (formData: FormData) => Promise<ActionResult>;
//   deleteAction: (formData: FormData) => Promise<ActionResult>;
// };

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', {
//     style: 'currency',
//     currency: 'EUR',
//   }).format((cents ?? 0) / 100);
// }

// /** Небольшой адаптер: делает удобный хук под server action */
// function useServerAction(
//   action: (fd: FormData) => Promise<ActionResult>,
//   initial: ActionResult = { ok: true }
// ) {
//   // useActionState принимает reducer-like экшен
//   const [state, formAction] = useActionState(
//     async (_prev: ActionResult, formData: FormData) => {
//       try {
//         const res = await action(formData);
//         return res ?? { ok: true };
//       } catch (e: unknown) {
//         const msg =
//           e instanceof Error ? e.message : 'Произошла неизвестная ошибка';
//         return { ok: false, message: msg };
//       }
//     },
//     initial
//   );

//   return { state, formAction };
// }

// /* ======================= ГЛАВНАЯ ПАНЕЛЬ ======================= */

// export default function SubservicesPanel({
//   parentOptions,
//   subservices,
//   updateAction,
//   deleteAction,
// }: Props) {
//   const [q, setQ] = useState<string>('');
//   const [onlyActive, setOnlyActive] = useState<boolean>(false);
//   const [sort, setSort] = useState<SortKey>('name');
//   const [view, setView] = useState<ViewMode>('cards');
//   const [filterParent, setFilterParent] = useState<string>('all');

//   const filtered = useMemo<Sub[]>(() => {
//     const query = q.trim().toLowerCase();
//     const list = subservices.filter((s) => {
//       if (onlyActive && !s.isActive) return false;
//       if (filterParent !== 'all' && s.parentId !== filterParent) return false;
//       if (!query) return true;
//       const hay = `${s.name} ${s.slug ?? ''} ${s.parentName} ${
//         s.description ?? ''
//       }`.toLowerCase();
//       return hay.includes(query);
//     });

//     list.sort((a, b) => {
//       if (sort === 'name') return a.name.localeCompare(b.name);
//       if (sort === 'price') return (a.priceCents ?? 0) - (b.priceCents ?? 0);
//       return (a.durationMin ?? 0) - (b.durationMin ?? 0);
//     });

//     return list;
//   }, [subservices, onlyActive, filterParent, q, sort]);

//   return (
//     <section className="admin-section space-y-4">
//       <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <h2 className="text-lg font-medium">Подуслуги</h2>

//         <div className="flex flex-wrap items-center gap-2">
//           <input
//             value={q}
//             onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
//             placeholder="Поиск по названию, описанию…"
//             className="admin-input min-w-[14rem]"
//           />

//           <select
//             value={filterParent}
//             onChange={(e: ChangeEvent<HTMLSelectElement>) =>
//               setFilterParent(e.target.value)
//             }
//             className="admin-select"
//           >
//             <option value="all">Все категории</option>
//             {parentOptions.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.name}
//               </option>
//             ))}
//           </select>

//           <select
//             value={sort}
//             onChange={(e: ChangeEvent<HTMLSelectElement>) =>
//               setSort(e.target.value as SortKey)
//             }
//             className="admin-select"
//           >
//             <option value="name">Сортировать: имя</option>
//             <option value="price">Сортировать: цена</option>
//             <option value="minutes">Сортировать: минуты</option>
//           </select>

//           <label className="inline-flex select-none items-center gap-2 rounded-full border border-white/15 px-3 py-2">
//             <input
//               type="checkbox"
//               checked={onlyActive}
//               onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                 setOnlyActive(e.target.checked)
//               }
//               className="admin-switch"
//             />
//             Только активные
//           </label>

//           <div className="ml-1 inline-flex rounded-full border border-white/15 p-1">
//             <button
//               type="button"
//               onClick={() => setView('cards')}
//               className={`rounded-full px-3 py-1.5 text-sm transition ${
//                 view === 'cards' ? 'bg-white/10' : 'hover:bg-white/5'
//               }`}
//             >
//               Карточки
//             </button>
//             <button
//               type="button"
//               onClick={() => setView('table')}
//               className={`rounded-full px-3 py-1.5 text-sm transition ${
//                 view === 'table' ? 'bg-white/10' : 'hover:bg-white/5'
//               }`}
//             >
//               Таблица
//             </button>
//           </div>
//         </div>
//       </header>

//       {view === 'cards' ? (
//         <CardsView
//           items={filtered}
//           parentOptions={parentOptions}
//           updateAction={updateAction}
//           deleteAction={deleteAction}
//         />
//       ) : (
//         <TableView
//           items={filtered}
//           parentOptions={parentOptions}
//           updateAction={updateAction}
//           deleteAction={deleteAction}
//         />
//       )}
//     </section>
//   );
// }

// /* ===================== УТИЛИТНЫЕ ФОРМЫ ===================== */

// function UpdateServiceForm({
//   s,
//   parentOptions,
//   updateAction,
//   layout = 'grid',
// }: {
//   s: Sub;
//   parentOptions: ParentOption[];
//   updateAction: (fd: FormData) => Promise<ActionResult>;
//   /** 'grid' — две колонки, 'stack' — одна колонка */
//   layout?: 'grid' | 'stack';
// }) {
//   const initial: ActionResult = { ok: true };
//   const { state, formAction } = useServerAction(updateAction, initial);

//   const gridClass =
//     layout === 'grid'
//       ? 'grid grid-cols-2 gap-2'
//       : 'grid grid-cols-1 gap-2';

//   return (
//     <>
//       <form action={formAction} className={gridClass}>
//         <input type="hidden" name="id" value={s.id} />
//         <input type="hidden" name="kind" value="service" />

//         <div className="col-span-2">
//           <label className="mb-1 block text-xs opacity-70">Название</label>
//           <input name="name" defaultValue={s.name} className="admin-input" />
//         </div>

//         <div>
//           <label className="mb-1 block text-xs opacity-70">Минуты</label>
//           <input
//             name="durationMin"
//             type="number"
//             min={0}
//             step={5}
//             defaultValue={s.durationMin ?? 0}
//             className="admin-input"
//           />
//         </div>

//         <div>
//           <label className="mb-1 block text-xs opacity-70">Цена (€)</label>
//           <input
//             name="price"
//             inputMode="decimal"
//             defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ''}
//             className="admin-input"
//           />
//         </div>

//         <div>
//           <label className="mb-1 block text-xs opacity-70">Категория</label>
//           <select
//             name="parentId"
//             defaultValue={s.parentId ?? ''}
//             className="admin-select"
//           >
//             <option value="">— без категории —</option>
//             {parentOptions.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex items-center gap-2">
//           <input
//             id={`active-${s.id}`}
//             name="isActive"
//             type="checkbox"
//             defaultChecked={s.isActive}
//             className="admin-switch"
//           />
//           <label htmlFor={`active-${s.id}`} className="text-sm">
//             Активна
//           </label>
//         </div>

//         <div className="col-span-2">
//           <label className="mb-1 block text-xs opacity-70">Описание</label>
//           <textarea
//             name="description"
//             defaultValue={s.description ?? ''}
//             rows={2}
//             className="admin-textarea"
//           />
//         </div>

//         <div className="col-span-2 mt-1">
//           <button className="btn-primary">Сохранить</button>
//         </div>
//       </form>

//       {!state.ok && state.message && (
//         <p className="mt-2 text-sm text-rose-300/90">{state.message}</p>
//       )}
//     </>
//   );
// }

// function DeleteServiceForm({
//   id,
//   deleteAction,
//   compact = false,
// }: {
//   id: string;
//   deleteAction: (fd: FormData) => Promise<ActionResult>;
//   compact?: boolean;
// }) {
//   const { state, formAction } = useServerAction(deleteAction, { ok: true });

//   return (
//     <>
//       <form action={formAction} className={compact ? 'inline-block' : ''}>
//         <input type="hidden" name="id" value={id} />
//         <button className="btn-danger">Удалить</button>
//       </form>
//       {!state.ok && state.message && (
//         <p className="mt-2 text-sm text-rose-300/90">{state.message}</p>
//       )}
//     </>
//   );
// }

// /* ===================== ВИД: КАРТОЧКИ ===================== */

// function CardsView({
//   items,
//   parentOptions,
//   updateAction,
//   deleteAction,
// }: {
//   items: Sub[];
//   parentOptions: ParentOption[];
//   updateAction: (formData: FormData) => Promise<ActionResult>;
//   deleteAction: (formData: FormData) => Promise<ActionResult>;
// }) {
//   if (items.length === 0) {
//     return (
//       <div className="rounded-xl border border-white/10 p-6 text-center text-white/60">
//         Ничего не найдено
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//       {items.map((s) => (
//         <article key={s.id} className="admin-card p-4">
//           <div className="mb-3 flex items-start justify-between gap-3">
//             <div>
//               <div className="text-base font-medium">{s.name}</div>
//               <div className="text-xs text-white/50">{s.parentName}</div>
//             </div>
//             {s.isActive ? (
//               <span className="tag-active">активна</span>
//             ) : (
//               <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                 выкл
//               </span>
//             )}
//           </div>

//           {/* ОБНОВЛЕНИЕ */}
//           <UpdateServiceForm
//             s={s}
//             parentOptions={parentOptions}
//             updateAction={updateAction}
//             layout="grid"
//           />

//           {/* УДАЛЕНИЕ — ОТДЕЛЬНАЯ ФОРМА, НЕ вложенная */}
//           <div className="mt-2 flex items-center justify-between">
//             <span className="text-xs text-white/45">
//               Цена: {euro(s.priceCents)} · Мин: {s.durationMin ?? 0}
//             </span>
//             <DeleteServiceForm
//               id={s.id}
//               deleteAction={deleteAction}
//               compact
//             />
//           </div>
//         </article>
//       ))}
//     </div>
//   );
// }

// /* ===================== ВИД: ТАБЛИЦА ===================== */

// function TableView({
//   items,
//   parentOptions,
//   updateAction,
//   deleteAction,
// }: {
//   items: Sub[];
//   parentOptions: ParentOption[];
//   updateAction: (formData: FormData) => Promise<ActionResult>;
//   deleteAction: (formData: FormData) => Promise<ActionResult>;
// }) {
//   return (
//     <div className="overflow-x-auto rounded-xl border border-white/10">
//       <table className="table">
//         <thead className="thead">
//           <tr>
//             <th className="th">Название</th>
//             <th className="th">Категория</th>
//             <th className="th">Цена</th>
//             <th className="th">Мин</th>
//             <th className="th">Активна</th>
//             <th className="th">Описание</th>
//             <th className="th" style={{ width: 220 }} />
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((s) => (
//             <tr key={s.id} className="row">
//               <td className="td font-medium">{s.name}</td>
//               <td className="td">{s.parentName || '—'}</td>
//               <td className="td">{euro(s.priceCents)}</td>
//               <td className="td">{s.durationMin ?? 0}</td>
//               <td className="td">
//                 {s.isActive ? (
//                   <span className="tag-active">Да</span>
//                 ) : (
//                   <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                     Нет
//                   </span>
//                 )}
//               </td>
//               <td className="td max-w-[32rem]">
//                 <span className="block truncate">{s.description ?? '—'}</span>
//               </td>
//               <td className="td">
//                 <details className="relative">
//                   <summary className="btn-secondary cursor-pointer list-none">
//                     Редактировать
//                   </summary>

//                   <div className="popover">
//                     {/* ОБНОВЛЕНИЕ */}
//                     <UpdateServiceForm
//                       s={s}
//                       parentOptions={parentOptions}
//                       updateAction={updateAction}
//                       layout="grid"
//                     />

//                     {/* УДАЛЕНИЕ — РЯДОМ, НЕ ВЛОЖЕНО */}
//                     <div className="mt-2 flex items-center justify-between">
//                       <span className="text-xs text-white/45">
//                         ID: {s.id.slice(0, 8)}… · Slug:{' '}
//                         <span className="font-mono opacity-80">
//                           {s.slug ?? '—'}
//                         </span>
//                       </span>
//                       <DeleteServiceForm
//                         id={s.id}
//                         deleteAction={deleteAction}
//                         compact
//                       />
//                     </div>
//                   </div>
//                 </details>
//               </td>
//             </tr>
//           ))}

//           {items.length === 0 && (
//             <tr>
//               <td className="td py-6 text-center text-white/50" colSpan={7}>
//                 Ничего не найдено
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }






// 'use client';

// import React, { useMemo, useState, ChangeEvent } from 'react';

// type ParentOption = { id: string; name: string };

// type Sub = {
//   id: string;
//   name: string;
//   slug: string | null;                 // показываем при необходимости, не редактируем
//   description: string | null;
//   durationMin: number | null;
//   priceCents: number | null;
//   isActive: boolean;
//   parentId: string | null;
//   parentName: string;                  // приходит с сервера
//   createdAt: string;                   // ISO
//   updatedAt: string;                   // ISO
// };

// type ViewMode = 'cards' | 'table';
// type SortKey = 'name' | 'price' | 'minutes';

// type Props = {
//   parentOptions: ParentOption[];
//   subservices: Sub[];
//   updateAction: (formData: FormData) => Promise<void>;
//   deleteAction: (formData: FormData) => Promise<void>;
// };

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format((cents ?? 0) / 100);
// }

// export default function SubservicesPanel({
//   parentOptions,
//   subservices,
//   updateAction,
//   deleteAction,
// }: Props) {
//   const [q, setQ] = useState<string>('');
//   const [onlyActive, setOnlyActive] = useState<boolean>(false);
//   const [sort, setSort] = useState<SortKey>('name');
//   const [view, setView] = useState<ViewMode>('cards');
//   const [filterParent, setFilterParent] = useState<string>('all');

//   const filtered = useMemo<Sub[]>(() => {
//     const query = q.trim().toLowerCase();
//     const arr = subservices.filter((s) => {
//       if (onlyActive && !s.isActive) return false;
//       if (filterParent !== 'all' && s.parentId !== filterParent) return false;
//       if (!query) return true;
//       const hay = `${s.name} ${s.slug ?? ''} ${s.parentName} ${s.description ?? ''}`.toLowerCase();
//       return hay.includes(query);
//     });

//     arr.sort((a, b) => {
//       if (sort === 'name') return a.name.localeCompare(b.name);
//       if (sort === 'price') return (a.priceCents ?? 0) - (b.priceCents ?? 0);
//       // minutes
//       return (a.durationMin ?? 0) - (b.durationMin ?? 0);
//     });

//     return arr;
//   }, [subservices, onlyActive, filterParent, q, sort]);

//   return (
//     <section className="admin-section space-y-4">
//       <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <h2 className="text-lg font-medium">Подуслуги</h2>

//         {/* Фильтры / вид */}
//         <div className="flex flex-wrap items-center gap-2">
//           <input
//             value={q}
//             onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
//             placeholder="Поиск по названию, описанию…"
//             className="admin-input min-w-[14rem]"
//           />

//           <select
//             value={filterParent}
//             onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterParent(e.target.value)}
//             className="admin-select"
//           >
//             <option value="all">Все категории</option>
//             {parentOptions.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.name}
//               </option>
//             ))}
//           </select>

//           <select
//             value={sort}
//             onChange={(e: ChangeEvent<HTMLSelectElement>) =>
//               setSort(e.target.value as SortKey)
//             }
//             className="admin-select"
//           >
//             <option value="name">Сортировать: имя</option>
//             <option value="price">Сортировать: цена</option>
//             <option value="minutes">Сортировать: минуты</option>
//           </select>

//           <label className="inline-flex select-none items-center gap-2 rounded-full border border-white/15 px-3 py-2">
//             <input
//               type="checkbox"
//               checked={onlyActive}
//               onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                 setOnlyActive(e.target.checked)
//               }
//               className="admin-switch"
//             />
//             Только активные
//           </label>

//           <div className="ml-1 inline-flex rounded-full border border-white/15 p-1">
//             <button
//               type="button"
//               onClick={() => setView('cards')}
//               className={`rounded-full px-3 py-1.5 text-sm transition ${
//                 view === 'cards' ? 'bg-white/10' : 'hover:bg-white/5'
//               }`}
//             >
//               Карточки
//             </button>
//             <button
//               type="button"
//               onClick={() => setView('table')}
//               className={`rounded-full px-3 py-1.5 text-sm transition ${
//                 view === 'table' ? 'bg-white/10' : 'hover:bg-white/5'
//               }`}
//             >
//               Таблица
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* ==== Рендер ==== */}
//       {view === 'cards' ? (
//         <CardsView
//           items={filtered}
//           parentOptions={parentOptions}
//           updateAction={updateAction}
//           deleteAction={deleteAction}
//         />
//       ) : (
//         <TableView
//           items={filtered}
//           parentOptions={parentOptions}
//           updateAction={updateAction}
//           deleteAction={deleteAction}
//         />
//       )}
//     </section>
//   );
// }

// /* ===================== ВИД: КАРТОЧКИ ===================== */

// function CardsView({
//   items,
//   parentOptions,
//   updateAction,
//   deleteAction,
// }: {
//   items: Sub[];
//   parentOptions: ParentOption[];
//   updateAction: (formData: FormData) => Promise<void>;
//   deleteAction: (formData: FormData) => Promise<void>;
// }) {
//   if (items.length === 0) {
//     return (
//       <div className="rounded-xl border border-white/10 p-6 text-center text-white/60">
//         Ничего не найдено
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//       {items.map((s) => (
//         <article key={s.id} className="admin-card p-4">
//           <div className="mb-3 flex items-start justify-between gap-3">
//             <div>
//               <div className="text-base font-medium">{s.name}</div>
//               <div className="text-xs text-white/50">{s.parentName}</div>
//             </div>
//             {s.isActive ? (
//               <span className="tag-active">активна</span>
//             ) : (
//               <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                 выкл
//               </span>
//             )}
//           </div>

//           {/* ЕДИНАЯ форма: сохранение (action) + удаление (formAction) */}
//           <form action={updateAction} className="grid grid-cols-2 gap-2">
//             <input type="hidden" name="id" value={s.id} />
//             <input type="hidden" name="kind" value="service" />

//             <div className="col-span-2">
//               <label className="mb-1 block text-xs opacity-70">Название</label>
//               <input name="name" defaultValue={s.name} className="admin-input" />
//             </div>

//             <div>
//               <label className="mb-1 block text-xs opacity-70">Минуты</label>
//               <input
//                 name="durationMin"
//                 type="number"
//                 min={0}
//                 step={5}
//                 defaultValue={s.durationMin ?? 0}
//                 className="admin-input"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-xs opacity-70">Цена (€)</label>
//               <input
//                 name="price"
//                 inputMode="decimal"
//                 defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ''}
//                 className="admin-input"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-xs opacity-70">Категория</label>
//               <select
//                 name="parentId"
//                 defaultValue={s.parentId ?? ''}
//                 className="admin-select"
//               >
//                 <option value="">— без категории —</option>
//                 {parentOptions.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex items-center gap-2">
//               <input
//                 id={`active-${s.id}`}
//                 name="isActive"
//                 type="checkbox"
//                 defaultChecked={s.isActive}
//                 className="admin-switch"
//               />
//               <label htmlFor={`active-${s.id}`} className="text-sm">
//                 Активна
//               </label>
//             </div>

//             <div className="col-span-2">
//               <label className="mb-1 block text-xs opacity-70">Описание</label>
//               <textarea
//                 name="description"
//                 defaultValue={s.description ?? ''}
//                 rows={2}
//                 className="admin-textarea"
//               />
//             </div>

//             <div className="col-span-2 mt-1 flex items-center justify-between gap-2">
//               <button className="btn-primary">Сохранить</button>

//               {/* Удаление без вложенной формы */}
//               <button formAction={deleteAction} className="btn-danger">
//                 Удалить
//               </button>
//             </div>
//           </form>

//           {/* тонкая подпись с системной инфой */}
//           <div className="mt-3 flex items-center justify-between text-xs text-white/40">
//             <span>Цена: {euro(s.priceCents)}</span>
//             <span>Мин: {s.durationMin ?? 0}</span>
//           </div>
//         </article>
//       ))}
//     </div>
//   );
// }

// /* ===================== ВИД: ТАБЛИЦА ===================== */

// function TableView({
//   items,
//   parentOptions,
//   updateAction,
//   deleteAction,
// }: {
//   items: Sub[];
//   parentOptions: ParentOption[];
//   updateAction: (formData: FormData) => Promise<void>;
//   deleteAction: (formData: FormData) => Promise<void>;
// }) {
//   return (
//     <div className="overflow-x-auto rounded-xl border border-white/10">
//       <table className="table">
//         <thead className="thead">
//           <tr>
//             <th className="th">Название</th>
//             <th className="th">Категория</th>
//             <th className="th">Цена</th>
//             <th className="th">Мин</th>
//             <th className="th">Активна</th>
//             <th className="th">Описание</th>
//             <th className="th" style={{ width: 220 }} />
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((s) => (
//             <tr key={s.id} className="row">
//               <td className="td font-medium">{s.name}</td>
//               <td className="td">{s.parentName || '—'}</td>
//               <td className="td">{euro(s.priceCents)}</td>
//               <td className="td">{s.durationMin ?? 0}</td>
//               <td className="td">
//                 {s.isActive ? (
//                   <span className="tag-active">Да</span>
//                 ) : (
//                   <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                     Нет
//                   </span>
//                 )}
//               </td>
//               <td className="td max-w-[32rem]">
//                 <span className="block truncate">{s.description ?? '—'}</span>
//               </td>
//               <td className="td">
//                 <details className="relative">
//                   <summary className="btn-secondary cursor-pointer list-none">
//                     Редактировать
//                   </summary>

//                   {/* Поповер с ЕДИНОЙ формой (удаление через formAction) */}
//                   <div className="popover">
//                     <form action={updateAction} className="grid grid-cols-2 gap-2">
//                       <input type="hidden" name="id" value={s.id} />
//                       <input type="hidden" name="kind" value="service" />

//                       <div className="col-span-2">
//                         <label className="mb-1 block text-xs opacity-70">Название</label>
//                         <input name="name" defaultValue={s.name} className="admin-input" />
//                       </div>

//                       <div>
//                         <label className="mb-1 block text-xs opacity-70">Минуты</label>
//                         <input
//                           name="durationMin"
//                           type="number"
//                           min={0}
//                           step={5}
//                           defaultValue={s.durationMin ?? 0}
//                           className="admin-input"
//                         />
//                       </div>

//                       <div>
//                         <label className="mb-1 block text-xs opacity-70">Цена (€)</label>
//                         <input
//                           name="price"
//                           inputMode="decimal"
//                           defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ''}
//                           className="admin-input"
//                         />
//                       </div>

//                       <div>
//                         <label className="mb-1 block text-xs opacity-70">Категория</label>
//                         <select
//                           name="parentId"
//                           defaultValue={s.parentId ?? ''}
//                           className="admin-select"
//                         >
//                           <option value="">— без категории —</option>
//                           {parentOptions.map((p) => (
//                             <option key={p.id} value={p.id}>
//                               {p.name}
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <input
//                           id={`active-pop-${s.id}`}
//                           name="isActive"
//                           type="checkbox"
//                           defaultChecked={s.isActive}
//                           className="admin-switch"
//                         />
//                         <label htmlFor={`active-pop-${s.id}`} className="text-sm">
//                           Активна
//                         </label>
//                       </div>

//                       <div className="col-span-2">
//                         <label className="mb-1 block text-xs opacity-70">Описание</label>
//                         <textarea
//                           name="description"
//                           defaultValue={s.description ?? ''}
//                           rows={2}
//                           className="admin-textarea"
//                         />
//                       </div>

//                       <div className="col-span-2 mt-1 flex items-center justify-between gap-2">
//                         <button className="btn-primary">Сохранить</button>
//                         <button formAction={deleteAction} className="btn-danger">
//                           Удалить
//                         </button>
//                       </div>
//                     </form>
//                   </div>
//                 </details>
//               </td>
//             </tr>
//           ))}

//           {items.length === 0 && (
//             <tr>
//               <td className="td py-6 text-center text-white/50" colSpan={7}>
//                 Ничего не найдено
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }






//------------пока оставим
// 'use client';

// import React, { useMemo, useState, ChangeEvent } from 'react';

// type ParentOption = { id: string; name: string };

// type Sub = {
//   id: string;
//   name: string;
//   slug: string | null;                 // отображаем, но НЕ редактируем
//   description: string | null;
//   durationMin: number | null;
//   priceCents: number | null;
//   isActive: boolean;
//   parentId: string | null;
//   parentName: string;                  // приходит из страницы
//   createdAt: string;                   // ISO
//   updatedAt: string;                   // ISO
// };

// type ViewMode = 'cards' | 'table';
// type SortKey = 'name' | 'price' | 'minutes';

// type Props = {
//   parentOptions: ParentOption[];
//   subservices: Sub[];
//   updateAction: (formData: FormData) => Promise<void>;
//   deleteAction: (formData: FormData) => Promise<void>;
// };

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format((cents ?? 0) / 100);
// }

// export default function SubservicesPanel({
//   parentOptions,
//   subservices,
//   updateAction,
//   deleteAction,
// }: Props) {
//   const [q, setQ] = useState<string>('');
//   const [onlyActive, setOnlyActive] = useState<boolean>(false);
//   const [sort, setSort] = useState<SortKey>('name');
//   const [view, setView] = useState<ViewMode>('cards');
//   const [filterParent, setFilterParent] = useState<string>('all');

//   const filtered = useMemo<Sub[]>(() => {
//     const query = q.trim().toLowerCase();
//     const arr = subservices.filter((s) => {
//       if (onlyActive && !s.isActive) return false;
//       if (filterParent !== 'all' && s.parentId !== filterParent) return false;
//       if (!query) return true;
//       const hay = `${s.name} ${s.slug ?? ''} ${s.parentName} ${s.description ?? ''}`.toLowerCase();
//       return hay.includes(query);
//     });

//     arr.sort((a, b) => {
//       if (sort === 'name') return a.name.localeCompare(b.name);
//       if (sort === 'price') return (a.priceCents ?? 0) - (b.priceCents ?? 0);
//       // minutes
//       return (a.durationMin ?? 0) - (b.durationMin ?? 0);
//     });

//     return arr;
//   }, [subservices, onlyActive, filterParent, q, sort]);

//   return (
//     <section className="admin-section space-y-4">
//       <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <h2 className="text-lg font-medium">Подуслуги</h2>

//         {/* Фильтры / вид */}
//         <div className="flex flex-wrap items-center gap-2">
//           <input
//             value={q}
//             onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
//             placeholder="Поиск по названию, описанию…"
//             className="admin-input min-w-[14rem]"
//           />

//           <select
//             value={filterParent}
//             onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilterParent(e.target.value)}
//             className="admin-select"
//           >
//             <option value="all">Все категории</option>
//             {parentOptions.map((p) => (
//               <option key={p.id} value={p.id}>
//                 {p.name}
//               </option>
//             ))}
//           </select>

//           <select
//             value={sort}
//             onChange={(e: ChangeEvent<HTMLSelectElement>) =>
//               setSort(e.target.value as SortKey)
//             }
//             className="admin-select"
//           >
//             <option value="name">Сортировать: имя</option>
//             <option value="price">Сортировать: цена</option>
//             <option value="minutes">Сортировать: минуты</option>
//           </select>

//           <label className="inline-flex select-none items-center gap-2 rounded-full border border-white/15 px-3 py-2">
//             <input
//               type="checkbox"
//               checked={onlyActive}
//               onChange={(e: ChangeEvent<HTMLInputElement>) =>
//                 setOnlyActive(e.target.checked)
//               }
//               className="admin-switch"
//             />
//             Только активные
//           </label>

//           <div className="ml-1 inline-flex rounded-full border border-white/15 p-1">
//             <button
//               type="button"
//               onClick={() => setView('cards')}
//               className={`rounded-full px-3 py-1.5 text-sm transition ${
//                 view === 'cards' ? 'bg-white/10' : 'hover:bg-white/5'
//               }`}
//             >
//               Карточки
//             </button>
//             <button
//               type="button"
//               onClick={() => setView('table')}
//               className={`rounded-full px-3 py-1.5 text-sm transition ${
//                 view === 'table' ? 'bg-white/10' : 'hover:bg-white/5'
//               }`}
//             >
//               Таблица
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* ==== Рендер ==== */}
//       {view === 'cards' ? (
//         <CardsView
//           items={filtered}
//           parentOptions={parentOptions}
//           updateAction={updateAction}
//           deleteAction={deleteAction}
//         />
//       ) : (
//         <TableView
//           items={filtered}
//           parentOptions={parentOptions}
//           updateAction={updateAction}
//           deleteAction={deleteAction}
//         />
//       )}
//     </section>
//   );
// }

// /* ===================== ВИД: КАРТОЧКИ ===================== */

// function CardsView({
//   items,
//   parentOptions,
//   updateAction,
//   deleteAction,
// }: {
//   items: Sub[];
//   parentOptions: ParentOption[];
//   updateAction: (formData: FormData) => Promise<void>;
//   deleteAction: (formData: FormData) => Promise<void>;
// }) {
//   if (items.length === 0) {
//     return (
//       <div className="rounded-xl border border-white/10 p-6 text-center text-white/60">
//         Ничего не найдено
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
//       {items.map((s) => (
//         <article key={s.id} className="admin-card p-4">
//           <div className="mb-3 flex items-start justify-between gap-3">
//             <div>
//               <div className="text-base font-medium">{s.name}</div>
//               <div className="text-xs text-white/50">{s.parentName}</div>
//             </div>
//             {s.isActive ? (
//               <span className="tag-active">активна</span>
//             ) : (
//               <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                 выкл
//               </span>
//             )}
//           </div>

//           {/* Форма обновления — ОТДЕЛЬНО */}
//           <form action={updateAction} className="grid grid-cols-2 gap-2">
//             <input type="hidden" name="id" value={s.id} />
//             <input type="hidden" name="kind" value="service" />

//             <div className="col-span-2">
//               <label className="mb-1 block text-xs opacity-70">Название</label>
//               <input name="name" defaultValue={s.name} className="admin-input" />
//             </div>

//             <div>
//               <label className="mb-1 block text-xs opacity-70">Минуты</label>
//               <input
//                 name="durationMin"
//                 type="number"
//                 min={0}
//                 step={5}
//                 defaultValue={s.durationMin ?? 0}
//                 className="admin-input"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-xs opacity-70">Цена (€)</label>
//               <input
//                 name="price"
//                 inputMode="decimal"
//                 defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ''}
//                 className="admin-input"
//               />
//             </div>

//             <div>
//               <label className="mb-1 block text-xs opacity-70">Категория</label>
//               <select
//                 name="parentId"
//                 defaultValue={s.parentId ?? ''}
//                 className="admin-select"
//               >
//                 <option value="">— без категории —</option>
//                 {parentOptions.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex items-center gap-2">
//               <input
//                 id={`active-${s.id}`}
//                 name="isActive"
//                 type="checkbox"
//                 defaultChecked={s.isActive}
//                 className="admin-switch"
//               />
//               <label htmlFor={`active-${s.id}`} className="text-sm">
//                 Активна
//               </label>
//             </div>

//             <div className="col-span-2">
//               <label className="mb-1 block text-xs opacity-70">Описание</label>
//               <textarea
//                 name="description"
//                 defaultValue={s.description ?? ''}
//                 rows={2}
//                 className="admin-textarea"
//               />
//             </div>

//             <div className="col-span-2 mt-1 flex items-center justify-between gap-2">
//               <button className="btn-primary">Сохранить</button>

//               {/* ВАЖНО: форма удаления — ОТДЕЛЬНАЯ, НЕ внутри form выше */}
//               <form action={deleteAction}>
//                 <input type="hidden" name="id" value={s.id} />
//                 <button className="btn-danger">Удалить</button>
//               </form>
//             </div>
//           </form>

//           {/* тонкая подпись с системной инфой */}
//           <div className="mt-3 flex items-center justify-between text-xs text-white/40">
//             <span>Цена: {euro(s.priceCents)}</span>
//             <span>Мин: {s.durationMin ?? 0}</span>
//           </div>
//         </article>
//       ))}
//     </div>
//   );
// }

// /* ===================== ВИД: ТАБЛИЦА ===================== */

// function TableView({
//   items,
//   parentOptions,
//   updateAction,
//   deleteAction,
// }: {
//   items: Sub[];
//   parentOptions: ParentOption[];
//   updateAction: (formData: FormData) => Promise<void>;
//   deleteAction: (formData: FormData) => Promise<void>;
// }) {
//   return (
//     <div className="overflow-x-auto rounded-xl border border-white/10">
//       <table className="table">
//         <thead className="thead">
//           <tr>
//             <th className="th">Название</th>
//             <th className="th">Категория</th>
//             <th className="th">Цена</th>
//             <th className="th">Мин</th>
//             <th className="th">Активна</th>
//             <th className="th">Описание</th>
//             <th className="th" style={{ width: 220 }} />
//           </tr>
//         </thead>
//         <tbody>
//           {items.map((s) => (
//             <tr key={s.id} className="row">
//               <td className="td font-medium">{s.name}</td>
//               <td className="td">{s.parentName || '—'}</td>
//               <td className="td">{euro(s.priceCents)}</td>
//               <td className="td">{s.durationMin ?? 0}</td>
//               <td className="td">
//                 {s.isActive ? (
//                   <span className="tag-active">Да</span>
//                 ) : (
//                   <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">
//                     Нет
//                   </span>
//                 )}
//               </td>
//               <td className="td max-w-[32rem]">
//                 <span className="block truncate">{s.description ?? '—'}</span>
//               </td>
//               <td className="td">
//                 <details className="relative">
//                   <summary className="btn-secondary cursor-pointer list-none">
//                     Редактировать
//                   </summary>

//                   {/* поповер с формой: ОТДЕЛЬНАЯ форма удаления */}
//                   <div className="popover">
//                     <form action={updateAction} className="grid grid-cols-2 gap-2">
//                       <input type="hidden" name="id" value={s.id} />
//                       <input type="hidden" name="kind" value="service" />

//                       <div className="col-span-2">
//                         <label className="mb-1 block text-xs opacity-70">Название</label>
//                         <input name="name" defaultValue={s.name} className="admin-input" />
//                       </div>

//                       <div>
//                         <label className="mb-1 block text-xs opacity-70">Минуты</label>
//                         <input
//                           name="durationMin"
//                           type="number"
//                           min={0}
//                           step={5}
//                           defaultValue={s.durationMin ?? 0}
//                           className="admin-input"
//                         />
//                       </div>

//                       <div>
//                         <label className="mb-1 block text-xs opacity-70">Цена (€)</label>
//                         <input
//                           name="price"
//                           inputMode="decimal"
//                           defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ''}
//                           className="admin-input"
//                         />
//                       </div>

//                       <div>
//                         <label className="mb-1 block text-xs opacity-70">Категория</label>
//                         <select
//                           name="parentId"
//                           defaultValue={s.parentId ?? ''}
//                           className="admin-select"
//                         >
//                           <option value="">— без категории —</option>
//                           {parentOptions.map((p) => (
//                             <option key={p.id} value={p.id}>
//                               {p.name}
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <input
//                           id={`active-pop-${s.id}`}
//                           name="isActive"
//                           type="checkbox"
//                           defaultChecked={s.isActive}
//                           className="admin-switch"
//                         />
//                         <label htmlFor={`active-pop-${s.id}`} className="text-sm">
//                           Активна
//                         </label>
//                       </div>

//                       <div className="col-span-2">
//                         <label className="mb-1 block text-xs opacity-70">Описание</label>
//                         <textarea
//                           name="description"
//                           defaultValue={s.description ?? ''}
//                           rows={2}
//                           className="admin-textarea"
//                         />
//                       </div>

//                       <div className="col-span-2 mt-1 flex items-center justify-between gap-2">
//                         <button className="btn-primary">Сохранить</button>

//                         {/* Отдельная форма удаления, НЕ вложенная */}
//                         <form action={deleteAction}>
//                           <input type="hidden" name="id" value={s.id} />
//                           <button className="btn-danger">Удалить</button>
//                         </form>
//                       </div>
//                     </form>
//                   </div>
//                 </details>
//               </td>
//             </tr>
//           ))}

//           {items.length === 0 && (
//             <tr>
//               <td className="td py-6 text-center text-white/50" colSpan={7}>
//                 Ничего не найдено
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }







// 'use client';

// import { useMemo, useState } from 'react';

// type ParentOption = { id: string; name: string };

// type Sub = {
//   id: string;
//   name: string;
//   slug: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   isActive: boolean;
//   parentId: string | null;
//   parentName: string | null;
//   createdAt: string; // ISO
//   updatedAt: string; // ISO
// };

// type Props = {
//   parentOptions: ParentOption[];
//   subservices: Sub[];
//   updateAction: (formData: FormData) => Promise<void>;
//   deleteAction: (formData: FormData) => Promise<void>;
// };

// function euro(cents: number | null): string {
//   if (cents === null) return '—';
//   return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'EUR' }).format((cents ?? 0) / 100);
// }

// type SortKey = 'name' | 'price' | 'minutes' | 'updated';
// type ViewMode = 'cards' | 'table';

// export default function SubservicesPanel({
//   parentOptions,
//   subservices,
//   updateAction,
//   deleteAction,
// }: Props) {
//   const [q, setQ] = useState<string>('');
//   const [sort, setSort] = useState<SortKey>('name');
//   const [onlyActive, setOnlyActive] = useState<boolean>(false);
//   const [categoryId, setCategoryId] = useState<string>('');
//   const [view, setView] = useState<ViewMode>('cards');

//   const filtered = useMemo(() => {
//     const query = q.trim().toLowerCase();

//     const arr = subservices.filter((s) => {
//       if (onlyActive && !s.isActive) return false;
//       if (categoryId && s.parentId !== categoryId) return false;
//       if (!query) return true;
//       const hay = `${s.name} ${s.slug} ${s.parentName ?? ''}`.toLowerCase();
//       return hay.includes(query);
//     });

//     arr.sort((a, b) => {
//       if (sort === 'name') return a.name.localeCompare(b.name);
//       if (sort === 'price') return (a.priceCents ?? 0) - (b.priceCents ?? 0);
//       if (sort === 'minutes') return a.durationMin - b.durationMin;
//       // updated
//       return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
//     });

//     return arr;
//   }, [subservices, q, sort, onlyActive, categoryId]);

//   return (
//     <section className="rounded-xl border border-white/10 p-4">
//       {/* Панель фильтров */}
//       <div className="sticky top-0 z-10 px-3 py-2 -mx-4 mb-3 border-b border-white/10 bg-[#0b1220]/80 backdrop-blur-sm flex flex-wrap gap-2 items-center">
//         <input
//           value={q}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
//           placeholder="Поиск по названию, slug, категории…"
//           className="flex-1 min-w-[14rem] rounded-lg border bg-transparent px-3 py-2"
//         />

//         <select
//           value={categoryId}
//           onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryId(e.target.value)}
//           className="rounded-lg border bg-transparent px-3 py-2"
//           aria-label="Фильтр по категории"
//         >
//           <option value="">Все категории</option>
//           {parentOptions.map((p) => (
//             <option key={p.id} value={p.id}>
//               {p.name}
//             </option>
//           ))}
//         </select>

//         <select
//           value={sort}
//           onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSort(e.target.value as SortKey)}
//           className="rounded-lg border bg-transparent px-3 py-2"
//           aria-label="Сортировка"
//         >
//           <option value="name">Сортировать: имя</option>
//           <option value="price">Сортировать: цена</option>
//           <option value="minutes">Сортировать: минуты</option>
//           <option value="updated">Сортировать: обновлено</option>
//         </select>

//         <label className="inline-flex items-center gap-2 text-sm ml-2">
//           <input
//             type="checkbox"
//             checked={onlyActive}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOnlyActive(e.target.checked)}
//             className="rounded"
//           />
//           Только активные
//         </label>

//         <div className="ml-auto flex items-center gap-1">
//           <button
//             type="button"
//             onClick={() => setView('cards')}
//             className={`rounded-full px-3 py-1.5 border transition ${
//               view === 'cards' ? 'bg-white/10 border-white/40' : 'hover:bg-white/10'
//             }`}
//             aria-pressed={view === 'cards'}
//           >
//             Карточки
//           </button>
//           <button
//             type="button"
//             onClick={() => setView('table')}
//             className={`rounded-full px-3 py-1.5 border transition ${
//               view === 'table' ? 'bg-white/10 border-white/40' : 'hover:bg-white/10'
//             }`}
//             aria-pressed={view === 'table'}
//           >
//             Таблица
//           </button>
//         </div>
//       </div>

//       {/* Вид: Карточки */}
//       {view === 'cards' && (
//         <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
//           {filtered.map((s) => (
//             <div key={s.id} className="rounded-xl border border-white/10 p-3 space-y-3">
//               <header className="flex items-center justify-between">
//                 <div className="font-medium">{s.name}</div>
//                 <span
//                   className={`text-xs px-2 py-0.5 rounded-full ${
//                     s.isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-zinc-500/10 text-zinc-300'
//                   }`}
//                 >
//                   {s.isActive ? 'активна' : 'выкл'}
//                 </span>
//               </header>

//               <form action={updateAction} className="grid grid-cols-2 gap-2">
//                 <input type="hidden" name="id" value={s.id} />
//                 <input type="hidden" name="kind" value="service" />
//                 <input
//                   name="name"
//                   defaultValue={s.name}
//                   className="rounded-lg border bg-transparent px-2 py-1 col-span-2"
//                 />
//                 <input name="slug" defaultValue={s.slug} className="rounded-lg border bg-transparent px-2 py-1" />
//                 <input
//                   name="durationMin"
//                   type="number"
//                   min={0}
//                   step={5}
//                   defaultValue={s.durationMin}
//                   className="rounded-lg border bg-transparent px-2 py-1"
//                 />
//                 <input
//                   name="price"
//                   inputMode="decimal"
//                   defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ''}
//                   placeholder="€"
//                   className="rounded-lg border bg-transparent px-2 py-1"
//                 />
//                 <div className="flex items-center gap-2">
//                   <input id={`active-${s.id}`} name="isActive" type="checkbox" defaultChecked={s.isActive} className="rounded" />
//                   <label htmlFor={`active-${s.id}`}>Активна</label>
//                 </div>
//                 <select name="parentId" defaultValue={s.parentId ?? ''} className="rounded-lg border bg-transparent px-2 py-1">
//                   <option value="">— без категории —</option>
//                   {parentOptions.map((p) => (
//                     <option key={p.id} value={p.id}>
//                       {p.name}
//                     </option>
//                   ))}
//                 </select>
//                 <textarea
//                   name="description"
//                   defaultValue={s.description ?? ''}
//                   rows={2}
//                   className="rounded-lg border bg-transparent px-2 py-1 col-span-2"
//                 />
//                 <div className="col-span-2 flex gap-2">
//                   <button className="rounded-full px-3 py-1.5 border hover:bg-white/10 transition">Сохранить</button>

//                   {/* ВАЖНО: форма удаления — отдельная, не вложенная */}
//                   <form action={deleteAction}>
//                     <input type="hidden" name="id" value={s.id} />
//                     <button className="rounded-full px-3 py-1.5 border border-rose-500 text-rose-400 hover:bg-rose-500/10 transition">
//                       Удалить
//                     </button>
//                   </form>
//                 </div>
//               </form>
//             </div>
//           ))}
//           {filtered.length === 0 && (
//             <div className="text-sm text-gray-400 px-2 py-6">Ничего не найдено по текущим фильтрам.</div>
//           )}
//         </div>
//       )}

//       {/* Вид: Таблица */}
//       {view === 'table' && (
//         <div className="overflow-x-auto">
//           <table className="min-w-[960px] w-full text-sm">
//             <thead className="bg-white/5">
//               <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
//                 <th>Название</th>
//                 <th>Категория</th>
//                 <th>Slug</th>
//                 <th>Цена</th>
//                 <th>Мин</th>
//                 <th>Активна</th>
//                 <th>Описание</th>
//                 <th style={{ width: 220 }}></th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((s) => (
//                 <tr key={s.id} className="[&>td]:px-3 [&>td]:py-2 align-top border-t border-white/10">
//                   <td className="font-medium">{s.name}</td>
//                   <td>{s.parentName ?? '—'}</td>
//                   <td>{s.slug}</td>
//                   <td>{euro(s.priceCents)}</td>
//                   <td>{s.durationMin}</td>
//                   <td>{s.isActive ? 'Да' : 'Нет'}</td>
//                   <td className="max-w-[28rem] truncate">{s.description ?? '—'}</td>
//                   <td>
//                     <div className="flex gap-2">
//                       <details className="relative">
//                         <summary className="cursor-pointer rounded-full px-3 py-1.5 border hover:bg-white/10 transition list-none">
//                           Редактировать
//                         </summary>
//                         <div className="absolute right-0 z-20 mt-2 w-[32rem] rounded-xl border border-white/10 bg-[#0b1220] p-3 shadow-xl">
//                           <form action={updateAction} className="grid grid-cols-2 gap-2">
//                             <input type="hidden" name="id" value={s.id} />
//                             <input type="hidden" name="kind" value="service" />
//                             <input
//                               name="name"
//                               defaultValue={s.name}
//                               className="rounded-lg border bg-transparent px-2 py-1 col-span-2"
//                             />
//                             <input name="slug" defaultValue={s.slug} className="rounded-lg border bg-transparent px-2 py-1" />
//                             <input
//                               name="durationMin"
//                               type="number"
//                               min={0}
//                               step={5}
//                               defaultValue={s.durationMin}
//                               className="rounded-lg border bg-transparent px-2 py-1"
//                             />
//                             <input
//                               name="price"
//                               inputMode="decimal"
//                               defaultValue={s.priceCents ? (s.priceCents / 100).toString() : ''}
//                               className="rounded-lg border bg-transparent px-2 py-1"
//                             />
//                             <div className="flex items-center gap-2">
//                               <input id={`act-${s.id}`} name="isActive" type="checkbox" defaultChecked={s.isActive} className="rounded" />
//                               <label htmlFor={`act-${s.id}`}>Активна</label>
//                             </div>
//                             <select name="parentId" defaultValue={s.parentId ?? ''} className="rounded-lg border bg-transparent px-2 py-1">
//                               <option value="">— без категории —</option>
//                               {parentOptions.map((p) => (
//                                 <option key={p.id} value={p.id}>
//                                   {p.name}
//                                 </option>
//                               ))}
//                             </select>
//                             <textarea
//                               name="description"
//                               defaultValue={s.description ?? ''}
//                               rows={2}
//                               className="rounded-lg border bg-transparent px-2 py-1 col-span-2"
//                             />
//                             <div className="col-span-2 flex gap-2">
//                               <button className="rounded-full px-3 py-1.5 border hover:bg-white/10 transition">
//                                 Сохранить
//                               </button>
//                               <form action={deleteAction}>
//                                 <input type="hidden" name="id" value={s.id} />
//                                 <button className="rounded-full px-3 py-1.5 border border-rose-500 text-rose-400 hover:bg-rose-500/10 transition">
//                                   Удалить
//                                 </button>
//                               </form>
//                             </div>
//                           </form>
//                         </div>
//                       </details>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//               {filtered.length === 0 && (
//                 <tr>
//                   <td className="px-3 py-6 text-center text-gray-500" colSpan={8}>
//                     Ничего не найдено по текущим фильтрам.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </section>
//   );
// }

