export const dynamic = "force-dynamic";

import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  updateMaster,
  setMasterServices,
  setMasterWorkingHours,
  addTimeOff,
  removeTimeOff,
  uploadAvatar,
  removeAvatar,
} from "./actions";
import AvatarUploader from "./AvatarUploader";
import {
  CalendarDays,
  ChevronRight,
  FolderTree,
  Layers,
  User2,
} from "lucide-react";

// ⬇️ Клиентский адаптивный блок для графика
import ResponsiveHoursFields from "./ResponsiveHoursFields";

// ⬇️ Новая карточка управления доступом мастера
import MasterAccessCard from "../_components/MasterAccessCard";

/* ───────── helpers ───────── */

function mmToTime(mm: number | null | undefined): string {
  const v = typeof mm === "number" && Number.isFinite(mm) ? mm : 0;
  const h = Math.floor(v / 60);
  const m = v % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

const DAYS = [
  { label: "Пн", full: "Понедельник", value: 1 },
  { label: "Вт", full: "Вторник", value: 2 },
  { label: "Ср", full: "Среда", value: 3 },
  { label: "Чт", full: "Четверг", value: 4 },
  { label: "Пт", full: "Пятница", value: 5 },
  { label: "Сб", full: "Суббота", value: 6 },
  { label: "Вс", full: "Воскресенье", value: 0 },
] as const;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function fmtDateTime(d: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/* ───────── дерево категорий/услуг ───────── */

type SItem = { id: string; name: string; parentId: string | null };
type NodeT = { id: string; name: string; parentId: string | null; children: NodeT[] };

const coll = new Intl.Collator("ru", { sensitivity: "base" });

function buildTree(items: ReadonlyArray<SItem>): NodeT[] {
  const byId = new Map<string, NodeT>();
  const roots: NodeT[] = [];

  for (const s of items) {
    byId.set(s.id, { id: s.id, name: s.name, parentId: s.parentId, children: [] });
  }
  for (const s of items) {
    const node = byId.get(s.id)!;
    if (s.parentId && byId.has(s.parentId)) {
      byId.get(s.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortRec = (ns: NodeT[]) => {
    ns.sort((a, b) => coll.compare(a.name, b.name));
    ns.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);

  return roots;
}

/** Категория (accordion) + листья-чекбоксы в нашем стиле */
function RenderTree({
  node,
  chosen,
  level = 0,
}: {
  node: NodeT;
  chosen: Set<string>;
  level?: number;
}): ReactElement {
  const isLeaf = node.children.length === 0;

  if (isLeaf) {
    return (
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5/5 px-3 py-2 hover:bg-white/10 transition">
        <input
          type="checkbox"
          className="accent-emerald-500"
          name="serviceId"
          value={node.id}
          defaultChecked={chosen.has(node.id)}
          aria-label={node.name}
        />
        <span className="text-sm">{node.name}</span>
      </label>
    );
  }

  return (
    <details
      className="group rounded-2xl border border-white/10 bg-gradient-to-r from-sky-400/5 via-transparent to-purple-400/5 p-3"
      open
    >
      <summary className="list-none flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-2">
          {level === 0 ? (
            <Layers className="h-4 w-4 text-sky-400" aria-hidden />
          ) : (
            <FolderTree className="h-4 w-4 text-violet-400" aria-hidden />
          )}
          <span className="font-medium">{node.name}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-white/50 transition group-open:rotate-90" />
      </summary>

      <div className="mt-3 grid gap-2 pl-1 sm:grid-cols-2 lg:grid-cols-3">
        {node.children.map((child) => (
          <RenderTree key={child.id} node={child} chosen={chosen} level={level + 1} />
        ))}
      </div>
    </details>
  );
}

/* ───────── типы для Next 15 ───────── */

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; saved?: string }>;
};

export default async function MasterPage(props: PageProps) {
  const { id } = await props.params;
  const { tab = "profile", saved } = await props.searchParams;

  const master = await prisma.master.findUnique({
    where: { id },
    include: {
      services: { select: { id: true } },
      workingHours: true,
      timeOff: { orderBy: { date: "desc" } },
    },
  });
  if (!master) return notFound();

  // список услуг
  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
  const chosenServiceIds = new Set(master.services.map((s) => s.id));

  // подготовим рабочие часы (Map -> сериализуемый массив для Client Component)
  const whMap = new Map<
    number,
    { isClosed: boolean; start: number; end: number }
  >();
  for (const wh of master.workingHours) {
    whMap.set(wh.weekday, {
      isClosed: wh.isClosed,
      start: wh.startMinutes,
      end: wh.endMinutes,
    });
  }
  const dayRows = DAYS.map((d) => {
    const cur = whMap.get(d.value) ?? { isClosed: true, start: 0, end: 0 };
    return {
      value: d.value,
      full: d.full,
      isClosed: cur.isClosed,
      start: cur.start,
      end: cur.end,
    };
  });

  const selectedCount = chosenServiceIds.size;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <User2 className="h-5 w-5 text-sky-400" /> Сотрудник: {master.name}
        </h1>
        <div className="flex gap-2">
          <Link href="/admin/masters" className="btn">
            ← К списку
          </Link>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-2">
          Сохранено.
        </div>
      )}

      {/* Табы */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`?tab=profile`}
          className={`px-3 py-1.5 rounded-full border transition ${
            tab === "profile" ? "bg-white/10" : "hover:bg-white/10"
          }`}
        >
          Профиль
        </Link>
        <Link
          href={`?tab=services`}
          className={`px-3 py-1.5 rounded-full border transition ${
            tab === "services" ? "bg-white/10" : "hover:bg-white/10"
          }`}
        >
          Категории и услуги
        </Link>
        <Link
          href={`?tab=schedule`}
          className={`px-3 py-1.5 rounded-full border transition ${
            tab === "schedule" ? "bg-white/10" : "hover:bg-white/10"
          }`}
        >
          Календарь
        </Link>
      </div>

      {/* -------- Профиль -------- */}
      {tab === "profile" && (
        <section className="rounded-2xl border p-4 space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Форма профиля */}
            <form action={updateMaster} className="space-y-3 lg:col-span-2">
              <input type="hidden" name="id" value={master.id} />
              <div>
                <div className="text-xs opacity-60 mb-1">Имя</div>
                <input
                  name="name"
                  defaultValue={master.name}
                  className="w-full rounded-lg border bg-transparent px-3 py-2"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs opacity-60 mb-1">E-mail</div>
                  <input
                    type="email"
                    name="email"
                    defaultValue={master.email ?? ""}
                    className="w-full rounded-lg border bg-transparent px-3 py-2"
                  />
                </div>
                <div>
                  <div className="text-xs opacity-60 mb-1">Телефон</div>
                  <input
                    name="phone"
                    defaultValue={master.phone ?? ""}
                    className="w-full rounded-lg border bg-transparent px-3 py-2"
                  />
                </div>
                <div>
                  <div className="text-xs opacity-60 mb-1">Дата рождения</div>
                  <input
                    type="date"
                    name="birthDate"
                    defaultValue={
                      master.birthDate
                        ? new Date(master.birthDate).toISOString().slice(0, 10)
                        : ""
                    }
                    className="w-full rounded-lg border bg-transparent px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="text-xs opacity-60 mb-1">О себе</div>
                <textarea
                  name="bio"
                  defaultValue={master.bio ?? ""}
                  className="w-full min-h-24 rounded-lg border bg-transparent px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button className="btn" name="intent" value="save_stay">
                  Сохранить
                </button>
                <button className="btn" name="intent" value="save_close">
                  Сохранить и выйти
                </button>
              </div>
            </form>

            {/* Правая колонка: Аватар + Доступ мастера */}
            <div className="space-y-6">
              {/* Аватар */}
              <div className="space-y-3">
                <div className="text-sm opacity-80">Аватар</div>
                <div className="rounded-xl border p-3 space-y-3">
                  {master.avatarUrl ? (
                    <img
                      src={master.avatarUrl}
                      alt="avatar"
                      className="block w-40 h-40 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-xl border flex items-center justify-center opacity-60">
                      нет фото
                    </div>
                  )}

                  <AvatarUploader masterId={master.id} action={uploadAvatar} />

                  {master.avatarUrl && (
                    <form action={removeAvatar}>
                      <input type="hidden" name="id" value={master.id} />
                      <button className="btn border-rose-500 text-rose-400 hover:bg-rose-500/10">
                        Удалить
                      </button>
                    </form>
                  )}
                </div>

                <div className="text-xs opacity-60">
                  Создан: {fmtDateTime(master.createdAt)}
                  <br />
                  Обновлён: {fmtDateTime(master.updatedAt)}
                </div>
              </div>

              {/* ⬇️ Карточка создания/управления логином для этого мастера */}
              <MasterAccessCard masterId={master.id} />
            </div>
          </div>
        </section>
      )}

      {/* -------- Услуги (дерево, наш стиль) -------- */}
      {tab === "services" && (
        <section className="rounded-2xl border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-violet-400" />
              Услуги мастера
            </h2>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs">
              Выбрано: <b className="font-semibold">{selectedCount}</b>
            </span>
          </div>

          {(() => {
            const tree = buildTree(
              allServices.map((s) => ({ id: s.id, name: s.name, parentId: s.parentId }))
            );

            return (
              <form action={setMasterServices} className="space-y-4">
                <input type="hidden" name="id" value={master.id} />

                <div className="grid gap-3">
                  {tree.map((n) => (
                    <RenderTree key={n.id} node={n} chosen={chosenServiceIds} />
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button className="btn" name="intent" value="save_stay">
                    Сохранить
                  </button>
                  <button className="btn" name="intent" value="save_close">
                    Сохранить и выйти
                  </button>
                </div>
              </form>
            );
          })()}
        </section>
      )}

      {/* -------- Календарь (рабочие часы + исключения, адаптив) -------- */}
      {tab === "schedule" && (
        <section className="rounded-2xl border p-4 space-y-8">
          {/* Рабочий график */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-sky-400" />
                Рабочий график
              </h2>
              <span className="text-xs opacity-70 hidden sm:block">
                Отметьте выходной или укажите время
              </span>
            </div>

            <form action={setMasterWorkingHours} className="space-y-3">
              <input type="hidden" name="id" value={master.id} />

              {/* один адаптивный набор полей */}
              <ResponsiveHoursFields days={dayRows} />

              <div className="flex flex-wrap gap-2">
                <button className="btn" name="intent" value="save_stay">
                  Сохранить график
                </button>
                <button className="btn" name="intent" value="save_close">
                  Сохранить и выйти
                </button>
              </div>
            </form>
          </div>

          {/* Исключения (выходные / перерывы) */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Добавить исключение */}
            <div className="rounded-2xl border p-4 space-y-3 bg-gradient-to-br from-white/5 to-transparent">
              <h3 className="font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-amber-300" />
                Добавить исключение
              </h3>
              <form action={addTimeOff} className="space-y-3">
                <input type="hidden" name="id" value={master.id} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs opacity-60 mb-1">Дата с</div>
                    <input
                      type="date"
                      name="to-date-start"
                      className="w-full rounded-lg border bg-transparent px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <div className="text-xs opacity-60 mb-1">Дата по (вкл.)</div>
                    <input
                      type="date"
                      name="to-date-end"
                      className="w-full rounded-lg border bg-transparent px-3 py-2"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="to-closed" className="accent-emerald-500" />
                  <span>Целый день (выходной)</span>
                </label>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs opacity-60 mb-1">
                      Начало (если не целый день)
                    </div>
                    <input
                      type="time"
                      name="to-start"
                      className="w-full rounded-lg border bg-transparent px-3 py-2"
                    />
                  </div>
                  <div>
                    <div className="text-xs opacity-60 mb-1">Конец</div>
                    <input
                      type="time"
                      name="to-end"
                      className="w-full rounded-lg border bg-transparent px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs opacity-60 mb-1">Причина</div>
                  <input
                    name="to-reason"
                    placeholder="например: отпуск, обучение, тех.работы…"
                    className="w-full rounded-lg border bg-transparent px-3 py-2"
                  />
                </div>

                <button className="btn">Добавить</button>
              </form>
            </div>

            {/* Таблица исключений */}
            <div className="rounded-2xl border p-4 space-y-3">
              <h3 className="font-medium">Исключения</h3>
              {master.timeOff.length === 0 ? (
                <div className="opacity-60">Нет исключений</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[640px] w-full text-sm">
                    <thead className="text-left opacity-70">
                      <tr>
                        <th className="py-2 pr-3">Дата</th>
                        <th className="py-2 pr-3">Интервал</th>
                        <th className="py-2 pr-3">Причина</th>
                        <th className="py-2 pr-3">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {master.timeOff.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2 pr-3">{fmtDate(t.date)}</td>
                          <td className="py-2 pr-3">
                            {t.startMinutes === 0 && t.endMinutes === 1440
                              ? "Целый день"
                              : `${mmToTime(t.startMinutes)} — ${mmToTime(
                                  t.endMinutes
                                )}`}
                          </td>
                          <td className="py-2 pr-3">{t.reason ?? "—"}</td>
                          <td className="py-2 pr-3">
                            <form action={removeTimeOff}>
                              <input type="hidden" name="id" value={master.id} />
                              <input type="hidden" name="timeOffId" value={t.id} />
                              <button className="btn border-rose-500 text-rose-400 hover:bg-rose-500/10">
                                Удалить
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}








//--------------работал корректно оставлю на всякий случай----------------
// export const dynamic = "force-dynamic";

// import type { ReactElement } from "react";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { prisma } from "@/lib/db";
// import {
//   updateMaster,
//   setMasterServices,
//   setMasterWorkingHours,
//   addTimeOff,
//   removeTimeOff,
//   uploadAvatar,
//   removeAvatar,
// } from "./actions";
// import AvatarUploader from "./AvatarUploader";
// import {
//   CalendarDays,
//   ChevronRight,
//   FolderTree,
//   Layers,
//   User2,
// } from "lucide-react";

// // ⬇️ NEW: респонсивные поля расписания (клиентский компонент)
// import ResponsiveHoursFields from "./ResponsiveHoursFields";

// /* ───────── helpers ───────── */

// function mmToTime(mm: number | null | undefined): string {
//   const v = typeof mm === "number" && Number.isFinite(mm) ? mm : 0;
//   const h = Math.floor(v / 60);
//   const m = v % 60;
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${pad(h)}:${pad(m)}`;
// }

// const DAYS = [
//   { label: "Пн", full: "Понедельник", value: 1 },
//   { label: "Вт", full: "Вторник", value: 2 },
//   { label: "Ср", full: "Среда", value: 3 },
//   { label: "Чт", full: "Четверг", value: 4 },
//   { label: "Пт", full: "Пятница", value: 5 },
//   { label: "Сб", full: "Суббота", value: 6 },
//   { label: "Вс", full: "Воскресенье", value: 0 },
// ] as const;

// function fmtDate(d: Date) {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

// function fmtDateTime(d: Date) {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// /* ───────── дерево категорий/услуг ───────── */

// type SItem = { id: string; name: string; parentId: string | null };
// type NodeT = { id: string; name: string; parentId: string | null; children: NodeT[] };

// const coll = new Intl.Collator("ru", { sensitivity: "base" });

// function buildTree(items: ReadonlyArray<SItem>): NodeT[] {
//   const byId = new Map<string, NodeT>();
//   const roots: NodeT[] = [];

//   for (const s of items) {
//     byId.set(s.id, { id: s.id, name: s.name, parentId: s.parentId, children: [] });
//   }
//   for (const s of items) {
//     const node = byId.get(s.id)!;
//     if (s.parentId && byId.has(s.parentId)) {
//       byId.get(s.parentId)!.children.push(node);
//     } else {
//       roots.push(node);
//     }
//   }
//   const sortRec = (ns: NodeT[]) => {
//     ns.sort((a, b) => coll.compare(a.name, b.name));
//     ns.forEach((n) => sortRec(n.children));
//   };
//   sortRec(roots);

//   return roots;
// }

// /** Категория (accordion) + листья-чекбоксы в нашем стиле */
// function RenderTree({
//   node,
//   chosen,
//   level = 0,
// }: {
//   node: NodeT;
//   chosen: Set<string>;
//   level?: number;
// }): ReactElement {
//   const isLeaf = node.children.length === 0;

//   if (isLeaf) {
//     return (
//       <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5/5 px-3 py-2 hover:bg-white/10 transition">
//         <input
//           type="checkbox"
//           className="accent-emerald-500"
//           name="serviceId"
//           value={node.id}
//           defaultChecked={chosen.has(node.id)}
//           aria-label={node.name}
//         />
//         <span className="text-sm">{node.name}</span>
//       </label>
//     );
//   }

//   return (
//     <details
//       className="group rounded-2xl border border-white/10 bg-gradient-to-r from-sky-400/5 via-transparent to-purple-400/5 p-3"
//       open
//     >
//       <summary className="list-none flex items-center justify-between cursor-pointer">
//         <div className="flex items-center gap-2">
//           {level === 0 ? (
//             <Layers className="h-4 w-4 text-sky-400" aria-hidden />
//           ) : (
//             <FolderTree className="h-4 w-4 text-violet-400" aria-hidden />
//           )}
//           <span className="font-medium">{node.name}</span>
//         </div>
//         <ChevronRight className="h-4 w-4 text-white/50 transition group-open:rotate-90" />
//       </summary>

//       <div className="mt-3 grid gap-2 pl-1 sm:grid-cols-2 lg:grid-cols-3">
//         {node.children.map((child) => (
//           <RenderTree key={child.id} node={child} chosen={chosen} level={level + 1} />
//         ))}
//       </div>
//     </details>
//   );
// }

// /* ───────── типы для Next 15 ───────── */

// type PageProps = {
//   params: Promise<{ id: string }>;
//   searchParams: Promise<{ tab?: string; saved?: string }>;
// };

// export default async function MasterPage(props: PageProps) {
//   const { id } = await props.params;
//   const { tab = "profile", saved } = await props.searchParams;

//   const master = await prisma.master.findUnique({
//     where: { id },
//     include: {
//       services: { select: { id: true } },
//       workingHours: true,
//       timeOff: { orderBy: { date: "desc" } },
//     },
//   });
//   if (!master) return notFound();

//   // список услуг
//   const allServices = await prisma.service.findMany({
//     where: { isActive: true },
//     select: { id: true, name: true, parentId: true },
//     orderBy: [{ parentId: "asc" }, { name: "asc" }],
//   });
//   const chosenServiceIds = new Set(master.services.map((s) => s.id));

//   // подготовим рабочие часы (Map -> сериализуемый массив для Client Component)
//   const whMap = new Map<
//     number,
//     { isClosed: boolean; start: number; end: number }
//   >();
//   for (const wh of master.workingHours) {
//     whMap.set(wh.weekday, {
//       isClosed: wh.isClosed,
//       start: wh.startMinutes,
//       end: wh.endMinutes,
//     });
//   }
//   const dayRows = DAYS.map((d) => {
//     const cur = whMap.get(d.value) ?? { isClosed: true, start: 0, end: 0 };
//     return {
//       value: d.value,
//       full: d.full,
//       isClosed: cur.isClosed,
//       start: cur.start,
//       end: cur.end,
//     };
//   });

//   const selectedCount = chosenServiceIds.size;

//   return (
//     <main className="p-6 space-y-6">
//       <div className="flex items-center justify-between gap-4">
//         <h1 className="text-2xl font-semibold flex items-center gap-2">
//           <User2 className="h-5 w-5 text-sky-400" /> Сотрудник: {master.name}
//         </h1>
//         <div className="flex gap-2">
//           <Link href="/admin/masters" className="btn">
//             ← К списку
//           </Link>
//         </div>
//       </div>

//       {saved && (
//         <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-2">
//           Сохранено.
//         </div>
//       )}

//       {/* Табы */}
//       <div className="flex flex-wrap gap-2">
//         <Link
//           href={`?tab=profile`}
//           className={`px-3 py-1.5 rounded-full border transition ${
//             tab === "profile" ? "bg-white/10" : "hover:bg-white/10"
//           }`}
//         >
//           Профиль
//         </Link>
//         <Link
//           href={`?tab=services`}
//           className={`px-3 py-1.5 rounded-full border transition ${
//             tab === "services" ? "bg-white/10" : "hover:bg-white/10"
//           }`}
//         >
//           Категории и услуги
//         </Link>
//         <Link
//           href={`?tab=schedule`}
//           className={`px-3 py-1.5 rounded-full border transition ${
//             tab === "schedule" ? "bg-white/10" : "hover:bg-white/10"
//           }`}
//         >
//           Календарь
//         </Link>
//       </div>

//       {/* -------- Профиль -------- */}
//       {tab === "profile" && (
//         <section className="rounded-2xl border p-4 space-y-6">
//           <div className="grid lg:grid-cols-3 gap-6">
//             {/* Форма профиля */}
//             <form action={updateMaster} className="space-y-3 lg:col-span-2">
//               <input type="hidden" name="id" value={master.id} />
//               <div>
//                 <div className="text-xs opacity-60 mb-1">Имя</div>
//                 <input
//                   name="name"
//                   defaultValue={master.name}
//                   className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   required
//                 />
//               </div>
//               <div className="grid sm:grid-cols-2 gap-3">
//                 <div>
//                   <div className="text-xs opacity-60 mb-1">E-mail</div>
//                   <input
//                     type="email"
//                     name="email"
//                     defaultValue={master.email ?? ""}
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <div className="text-xs opacity-60 mb-1">Телефон</div>
//                   <input
//                     name="phone"
//                     defaultValue={master.phone ?? ""}
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <div className="text-xs opacity-60 mb-1">Дата рождения</div>
//                   <input
//                     type="date"
//                     name="birthDate"
//                     defaultValue={
//                       master.birthDate
//                         ? new Date(master.birthDate).toISOString().slice(0, 10)
//                         : ""
//                     }
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     required
//                   />
//                 </div>
//               </div>
//               <div>
//                 <div className="text-xs opacity-60 mb-1">О себе</div>
//                 <textarea
//                   name="bio"
//                   defaultValue={master.bio ?? ""}
//                   className="w-full min-h-24 rounded-lg border bg-transparent px-3 py-2"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <button className="btn" name="intent" value="save_stay">
//                   Сохранить
//                 </button>
//                 <button className="btn" name="intent" value="save_close">
//                   Сохранить и выйти
//                 </button>
//               </div>
//             </form>

//             {/* Аватар */}
//             <div className="space-y-3">
//               <div className="text-sm opacity-80">Аватар</div>
//               <div className="rounded-xl border p-3 space-y-3">
//                 {master.avatarUrl ? (
//                   <img
//                     src={master.avatarUrl}
//                     alt="avatar"
//                     className="block w-40 h-40 object-cover rounded-xl"
//                   />
//                 ) : (
//                   <div className="w-40 h-40 rounded-xl border flex items-center justify-center opacity-60">
//                     нет фото
//                   </div>
//                 )}

//                 <AvatarUploader masterId={master.id} action={uploadAvatar} />

//                 {master.avatarUrl && (
//                   <form action={removeAvatar}>
//                     <input type="hidden" name="id" value={master.id} />
//                     <button className="btn border-rose-500 text-rose-400 hover:bg-rose-500/10">
//                       Удалить
//                     </button>
//                   </form>
//                 )}
//               </div>

//               <div className="text-xs opacity-60">
//                 Создан: {fmtDateTime(master.createdAt)}
//                 <br />
//                 Обновлён: {fmtDateTime(master.updatedAt)}
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* -------- Услуги (дерево, наш стиль) -------- */}
//       {tab === "services" && (
//         <section className="rounded-2xl border p-4 space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold flex items-center gap-2">
//               <FolderTree className="h-5 w-5 text-violet-400" />
//               Услуги мастера
//             </h2>
//             <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs">
//               Выбрано: <b className="font-semibold">{selectedCount}</b>
//             </span>
//           </div>

//           {(() => {
//             const tree = buildTree(
//               allServices.map((s) => ({ id: s.id, name: s.name, parentId: s.parentId }))
//             );

//             return (
//               <form action={setMasterServices} className="space-y-4">
//                 <input type="hidden" name="id" value={master.id} />

//                 <div className="grid gap-3">
//                   {tree.map((n) => (
//                     <RenderTree key={n.id} node={n} chosen={chosenServiceIds} />
//                   ))}
//                 </div>

//                 <div className="pt-2 flex flex-wrap gap-2">
//                   <button className="btn" name="intent" value="save_stay">
//                     Сохранить
//                   </button>
//                   <button className="btn" name="intent" value="save_close">
//                     Сохранить и выйти
//                   </button>
//                 </div>
//               </form>
//             );
//           })()}
//         </section>
//       )}

//       {/* -------- Календарь (рабочие часы + исключения, адаптив) -------- */}
//       {tab === "schedule" && (
//         <section className="rounded-2xl border p-4 space-y-8">
//           {/* Рабочий график */}
//           <div>
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-lg font-semibold flex items-center gap-2">
//                 <CalendarDays className="h-5 w-5 text-sky-400" />
//                 Рабочий график
//               </h2>
//               <span className="text-xs opacity-70 hidden sm:block">
//                 Отметьте выходной или укажите время
//               </span>
//             </div>

//             <form action={setMasterWorkingHours} className="space-y-3">
//               <input type="hidden" name="id" value={master.id} />

//               {/* ⬇️ Больше нет двух наборов полей. Рендерится ровно один вариант. */}
//               <ResponsiveHoursFields days={dayRows} />

//               <div className="flex flex-wrap gap-2">
//                 <button className="btn" name="intent" value="save_stay">
//                   Сохранить график
//                 </button>
//                 <button className="btn" name="intent" value="save_close">
//                   Сохранить и выйти
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Исключения (выходные / перерывы) */}
//           <div className="grid lg:grid-cols-2 gap-6">
//             {/* Добавить исключение */}
//             <div className="rounded-2xl border p-4 space-y-3 bg-gradient-to-br from-white/5 to-transparent">
//               <h3 className="font-medium flex items-center gap-2">
//                 <CalendarDays className="h-4 w-4 text-amber-300" />
//                 Добавить исключение
//               </h3>
//               <form action={addTimeOff} className="space-y-3">
//                 <input type="hidden" name="id" value={master.id} />
//                 <div className="grid sm:grid-cols-2 gap-3">
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">Дата с</div>
//                     <input
//                       type="date"
//                       name="to-date-start"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">Дата по (вкл.)</div>
//                     <input
//                       type="date"
//                       name="to-date-end"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     />
//                   </div>
//                 </div>

//                 <label className="flex items-center gap-2">
//                   <input type="checkbox" name="to-closed" className="accent-emerald-500" />
//                   <span>Целый день (выходной)</span>
//                 </label>

//                 <div className="grid sm:grid-cols-2 gap-3">
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">
//                       Начало (если не целый день)
//                     </div>
//                     <input
//                       type="time"
//                       name="to-start"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     />
//                   </div>
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">Конец</div>
//                     <input
//                       type="time"
//                       name="to-end"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <div className="text-xs opacity-60 mb-1">Причина</div>
//                   <input
//                     name="to-reason"
//                     placeholder="например: отпуск, обучение, тех.работы…"
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>

//                 <button className="btn">Добавить</button>
//               </form>
//             </div>

//             {/* Таблица исключений */}
//             <div className="rounded-2xl border p-4 space-y-3">
//               <h3 className="font-medium">Исключения</h3>
//               {master.timeOff.length === 0 ? (
//                 <div className="opacity-60">Нет исключений</div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-[640px] w-full text-sm">
//                     <thead className="text-left opacity-70">
//                       <tr>
//                         <th className="py-2 pr-3">Дата</th>
//                         <th className="py-2 pr-3">Интервал</th>
//                         <th className="py-2 pr-3">Причина</th>
//                         <th className="py-2 pr-3">Действия</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-white/10">
//                       {master.timeOff.map((t) => (
//                         <tr key={t.id}>
//                           <td className="py-2 pr-3">{fmtDate(t.date)}</td>
//                           <td className="py-2 pr-3">
//                             {t.startMinutes === 0 && t.endMinutes === 1440
//                               ? "Целый день"
//                               : `${mmToTime(t.startMinutes)} — ${mmToTime(
//                                   t.endMinutes
//                                 )}`}
//                           </td>
//                           <td className="py-2 pr-3">{t.reason ?? "—"}</td>
//                           <td className="py-2 pr-3">
//                             <form action={removeTimeOff}>
//                               <input type="hidden" name="id" value={master.id} />
//                               <input type="hidden" name="timeOffId" value={t.id} />
//                               <button className="btn border-rose-500 text-rose-400 hover:bg-rose-500/10">
//                                 Удалить
//                               </button>
//                             </form>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>
//       )}
//     </main>
//   );
// }








//-------------------мобильная вёрстка ок, но не работает сохранение графика ----------------
// export const dynamic = "force-dynamic";

// import type { ReactElement } from "react";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { prisma } from "@/lib/db";
// import {
//   updateMaster,
//   setMasterServices,
//   setMasterWorkingHours,
//   addTimeOff,
//   removeTimeOff,
//   uploadAvatar,
//   removeAvatar,
// } from "./actions";
// import AvatarUploader from "./AvatarUploader";
// import {
//   CalendarDays,
//   ChevronRight,
//   FolderTree,
//   Layers,
//   User2,
//   Trash2,
// } from "lucide-react";

// /* ───────── helpers ───────── */

// function mmToTime(mm: number | null | undefined): string {
//   const v = typeof mm === "number" && Number.isFinite(mm) ? mm : 0;
//   const h = Math.floor(v / 60);
//   const m = v % 60;
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${pad(h)}:${pad(m)}`;
// }

// const DAYS = [
//   { label: "Пн", full: "Понедельник", value: 1 },
//   { label: "Вт", full: "Вторник", value: 2 },
//   { label: "Ср", full: "Среда", value: 3 },
//   { label: "Чт", full: "Четверг", value: 4 },
//   { label: "Пт", full: "Пятница", value: 5 },
//   { label: "Сб", full: "Суббота", value: 6 },
//   { label: "Вс", full: "Воскресенье", value: 0 },
// ] as const;

// function fmtDate(d: Date) {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

// function fmtDateTime(d: Date) {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// /* ───────── дерево категорий/услуг ───────── */

// type SItem = { id: string; name: string; parentId: string | null };
// type NodeT = { id: string; name: string; parentId: string | null; children: NodeT[] };

// const coll = new Intl.Collator("ru", { sensitivity: "base" });

// function buildTree(items: ReadonlyArray<SItem>): NodeT[] {
//   const byId = new Map<string, NodeT>();
//   const roots: NodeT[] = [];

//   for (const s of items) {
//     byId.set(s.id, { id: s.id, name: s.name, parentId: s.parentId, children: [] });
//   }
//   for (const s of items) {
//     const node = byId.get(s.id)!;
//     if (s.parentId && byId.has(s.parentId)) {
//       byId.get(s.parentId)!.children.push(node);
//     } else {
//       roots.push(node);
//     }
//   }
//   const sortRec = (ns: NodeT[]) => {
//     ns.sort((a, b) => coll.compare(a.name, b.name));
//     ns.forEach((n) => sortRec(n.children));
//   };
//   sortRec(roots);

//   return roots;
// }

// /** Категория (accordion) + листья-чекбоксы в нашем стиле */
// function RenderTree({
//   node,
//   chosen,
//   level = 0,
// }: {
//   node: NodeT;
//   chosen: Set<string>;
//   level?: number;
// }): ReactElement {
//   const isLeaf = node.children.length === 0;

//   if (isLeaf) {
//     return (
//       <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition">
//         <input
//           type="checkbox"
//           className="accent-emerald-500"
//           name="serviceId"
//           value={node.id}
//           defaultChecked={chosen.has(node.id)}
//           aria-label={node.name}
//         />
//         <span className="text-sm">{node.name}</span>
//       </label>
//     );
//   }

//   return (
//     <details
//       className="group rounded-2xl border border-white/10 bg-gradient-to-r from-sky-400/5 via-transparent to-purple-400/5 p-3"
//       open
//     >
//       <summary className="list-none flex items-center justify-between cursor-pointer">
//         <div className="flex items-center gap-2">
//           {level === 0 ? (
//             <Layers className="h-4 w-4 text-sky-400" aria-hidden />
//           ) : (
//             <FolderTree className="h-4 w-4 text-violet-400" aria-hidden />
//           )}
//           <span className="font-medium">{node.name}</span>
//         </div>
//         <ChevronRight className="h-4 w-4 text-white/50 transition group-open:rotate-90" />
//       </summary>

//       <div className="mt-3 grid gap-2 pl-1 sm:grid-cols-2 lg:grid-cols-3">
//         {node.children.map((child) => (
//           <RenderTree key={child.id} node={child} chosen={chosen} level={level + 1} />
//         ))}
//       </div>
//     </details>
//   );
// }

// /* ───────── типы для Next 15 ───────── */

// type PageProps = {
//   params: Promise<{ id: string }>;
//   searchParams: Promise<{ tab?: string; saved?: string }>;
// };

// export default async function MasterPage(props: PageProps) {
//   const { id } = await props.params;
//   const { tab = "profile", saved } = await props.searchParams;

//   const master = await prisma.master.findUnique({
//     where: { id },
//     include: {
//       services: { select: { id: true } },
//       workingHours: true,
//       timeOff: { orderBy: { date: "desc" } },
//     },
//   });
//   if (!master) return notFound();

//   // список услуг
//   const allServices = await prisma.service.findMany({
//     where: { isActive: true },
//     select: { id: true, name: true, parentId: true },
//     orderBy: [{ parentId: "asc" }, { name: "asc" }],
//   });
//   const chosenServiceIds = new Set(master.services.map((s) => s.id));

//   // подготовим рабочие часы
//   const whMap = new Map<
//     number,
//     { isClosed: boolean; start: number; end: number }
//   >();
//   for (const wh of master.workingHours) {
//     whMap.set(wh.weekday, {
//       isClosed: wh.isClosed,
//       start: wh.startMinutes,
//       end: wh.endMinutes,
//     });
//   }

//   const selectedCount = chosenServiceIds.size;

//   return (
//     <main className="p-6 space-y-6">
//       <div className="flex items-center justify-between gap-4">
//         <h1 className="text-2xl font-semibold flex items-center gap-2">
//           <User2 className="h-5 w-5 text-sky-400" /> Сотрудник: {master.name}
//         </h1>
//         <div className="flex gap-2">
//           <Link href="/admin/masters" className="btn">
//             ← К списку
//           </Link>
//         </div>
//       </div>

//       {saved && (
//         <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-2">
//           Сохранено.
//         </div>
//       )}

//       {/* Табы */}
//       <div className="flex flex-wrap gap-2">
//         <Link
//           href={`?tab=profile`}
//           className={`px-3 py-1.5 rounded-full border transition ${
//             tab === "profile" ? "bg-white/10" : "hover:bg-white/10"
//           }`}
//         >
//           Профиль
//         </Link>
//         <Link
//           href={`?tab=services`}
//           className={`px-3 py-1.5 rounded-full border transition ${
//             tab === "services" ? "bg-white/10" : "hover:bg-white/10"
//           }`}
//         >
//           Категории и услуги
//         </Link>
//         <Link
//           href={`?tab=schedule`}
//           className={`px-3 py-1.5 rounded-full border transition ${
//             tab === "schedule" ? "bg-white/10" : "hover:bg-white/10"
//           }`}
//         >
//           Календарь
//         </Link>
//       </div>

//       {/* -------- Профиль -------- */}
//       {tab === "profile" && (
//         <section className="rounded-2xl border p-4 space-y-6">
//           <div className="grid lg:grid-cols-3 gap-6">
//             {/* Форма профиля */}
//             <form action={updateMaster} className="space-y-3 lg:col-span-2">
//               <input type="hidden" name="id" value={master.id} />
//               <div>
//                 <div className="text-xs opacity-60 mb-1">Имя</div>
//                 <input
//                   name="name"
//                   defaultValue={master.name}
//                   className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   required
//                 />
//               </div>
//               <div className="grid sm:grid-cols-2 gap-3">
//                 <div>
//                   <div className="text-xs opacity-60 mb-1">E-mail</div>
//                   <input
//                     type="email"
//                     name="email"
//                     defaultValue={master.email ?? ""}
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <div className="text-xs opacity-60 mb-1">Телефон</div>
//                   <input
//                     name="phone"
//                     defaultValue={master.phone ?? ""}
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <div className="text-xs opacity-60 mb-1">Дата рождения</div>
//                   <input
//                     type="date"
//                     name="birthDate"
//                     defaultValue={
//                       master.birthDate
//                         ? new Date(master.birthDate).toISOString().slice(0, 10)
//                         : ""
//                     }
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     required
//                   />
//                 </div>
//               </div>
//               <div>
//                 <div className="text-xs opacity-60 mb-1">О себе</div>
//                 <textarea
//                   name="bio"
//                   defaultValue={master.bio ?? ""}
//                   className="w-full min-h-24 rounded-lg border bg-transparent px-3 py-2"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <button className="btn" name="intent" value="save_stay">
//                   Сохранить
//                 </button>
//                 <button className="btn" name="intent" value="save_close">
//                   Сохранить и выйти
//                 </button>
//               </div>
//             </form>

//             {/* Аватар */}
//             <div className="space-y-3">
//               <div className="text-sm opacity-80">Аватар</div>
//               <div className="rounded-xl border p-3 space-y-3">
//                 {master.avatarUrl ? (
//                   <img
//                     src={master.avatarUrl}
//                     alt="avatar"
//                     className="block w-40 h-40 object-cover rounded-xl"
//                   />
//                 ) : (
//                   <div className="w-40 h-40 rounded-xl border flex items-center justify-center opacity-60">
//                     нет фото
//                   </div>
//                 )}

//                 <AvatarUploader masterId={master.id} action={uploadAvatar} />

//                 {master.avatarUrl && (
//                   <form action={removeAvatar}>
//                     <input type="hidden" name="id" value={master.id} />
//                     <button className="btn border-rose-500 text-rose-400 hover:bg-rose-500/10">
//                       Удалить
//                     </button>
//                   </form>
//                 )}
//               </div>

//               <div className="text-xs opacity-60">
//                 Создан: {fmtDateTime(master.createdAt)}
//                 <br />
//                 Обновлён: {fmtDateTime(master.updatedAt)}
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* -------- Услуги (дерево, наш стиль) -------- */}
//       {tab === "services" && (
//         <section className="rounded-2xl border p-4 space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold flex items-center gap-2">
//               <FolderTree className="h-5 w-5 text-violet-400" />
//               Услуги мастера
//             </h2>
//             <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs">
//               Выбрано: <b className="font-semibold">{selectedCount}</b>
//             </span>
//           </div>

//           {(() => {
//             const tree = buildTree(
//               allServices.map((s) => ({ id: s.id, name: s.name, parentId: s.parentId }))
//             );

//             return (
//               <form action={setMasterServices} className="space-y-4">
//                 <input type="hidden" name="id" value={master.id} />

//                 <div className="grid gap-3">
//                   {tree.map((n) => (
//                     <RenderTree key={n.id} node={n} chosen={chosenServiceIds} />
//                   ))}
//                 </div>

//                 <div className="pt-2 flex flex-wrap gap-2">
//                   <button className="btn" name="intent" value="save_stay">
//                     Сохранить
//                   </button>
//                   <button className="btn" name="intent" value="save_close">
//                     Сохранить и выйти
//                   </button>
//                 </div>
//               </form>
//             );
//           })()}
//         </section>
//       )}

//       {/* -------- Календарь (рабочие часы + исключения, адаптив) -------- */}
//       {tab === "schedule" && (
//         <section className="rounded-2xl border p-4 space-y-8">
//           {/* Рабочий график */}
//           <div>
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-lg font-semibold flex items-center gap-2">
//                 <CalendarDays className="h-5 w-5 text-sky-400" />
//                 Рабочий график
//               </h2>
//               <span className="text-xs opacity-70 hidden sm:block">
//                 Отметьте выходной или укажите время
//               </span>
//             </div>

//             <form action={setMasterWorkingHours} className="space-y-3">
//               <input type="hidden" name="id" value={master.id} />

//               {/* Mobile layout (cards) */}
//               <div className="grid gap-3 sm:hidden">
//                 {DAYS.map((d) => {
//                   const cur = whMap.get(d.value) ?? {
//                     isClosed: true,
//                     start: 0,
//                     end: 0,
//                   };
//                   return (
//                     <div
//                       key={d.value}
//                       className="rounded-xl border border-white/10 p-3 bg-white/5"
//                     >
//                       <div className="mb-2 flex items-center justify-between">
//                         <div className="font-medium">{d.full}</div>
//                         <label className="inline-flex items-center gap-2 text-sm">
//                           <input
//                             type="checkbox"
//                             name={`wh-${d.value}-isClosed`}
//                             defaultChecked={cur.isClosed}
//                             className="accent-emerald-500"
//                           />
//                           Выходной
//                         </label>
//                       </div>
//                       <div className="grid grid-cols-2 gap-2">
//                         <label className="text-xs opacity-70">
//                           Начало
//                           <input
//                             type="time"
//                             name={`wh-${d.value}-start`}
//                             defaultValue={mmToTime(cur.start)}
//                             className="mt-1 w-full rounded-md border bg-transparent px-2 py-1"
//                             aria-label={`Начало ${d.full}`}
//                           />
//                         </label>
//                         <label className="text-xs opacity-70">
//                           Конец
//                           <input
//                             type="time"
//                             name={`wh-${d.value}-end`}
//                             defaultValue={mmToTime(cur.end)}
//                             className="mt-1 w-full rounded-md border bg-transparent px-2 py-1"
//                             aria-label={`Конец ${d.full}`}
//                           />
//                         </label>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Desktop table */}
//               <div className="overflow-x-auto hidden sm:block">
//                 <table className="min-w-[720px] w-full text-sm">
//                   <thead className="text-left opacity-70">
//                     <tr>
//                       <th className="py-2 pr-3">День</th>
//                       <th className="py-2 pr-3">Выходной</th>
//                       <th className="py-2 pr-3">Начало</th>
//                       <th className="py-2 pr-3">Конец</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-white/10">
//                     {DAYS.map((d) => {
//                       const cur = whMap.get(d.value) ?? {
//                         isClosed: true,
//                         start: 0,
//                         end: 0,
//                       };
//                       return (
//                         <tr key={d.value}>
//                           <td className="py-2 pr-3">{d.full}</td>
//                           <td className="py-2 pr-3">
//                             <input
//                               type="checkbox"
//                               name={`wh-${d.value}-isClosed`}
//                               defaultChecked={cur.isClosed}
//                               className="accent-emerald-500"
//                               aria-label={`${d.full}: выходной`}
//                             />
//                           </td>
//                           <td className="py-2 pr-3">
//                             <input
//                               type="time"
//                               name={`wh-${d.value}-start`}
//                               defaultValue={mmToTime(cur.start)}
//                               className="rounded-md border bg-transparent px-2 py-1"
//                               aria-label={`${d.full}: начало`}
//                             />
//                           </td>
//                           <td className="py-2 pr-3">
//                             <input
//                               type="time"
//                               name={`wh-${d.value}-end`}
//                               defaultValue={mmToTime(cur.end)}
//                               className="rounded-md border bg-transparent px-2 py-1"
//                               aria-label={`${d.full}: конец`}
//                             />
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 <button className="btn" name="intent" value="save_stay">
//                   Сохранить график
//                 </button>
//                 <button className="btn" name="intent" value="save_close">
//                   Сохранить и выйти
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Исключения (выходные / перерывы) */}
//           <div className="grid lg:grid-cols-2 gap-6">
//             {/* Добавить исключение */}
//             <div className="rounded-2xl border p-4 space-y-3 bg-gradient-to-br from-white/5 to-transparent">
//               <h3 className="font-medium flex items-center gap-2">
//                 <CalendarDays className="h-4 w-4 text-amber-300" />
//                 Добавить исключение
//               </h3>
//               <form action={addTimeOff} className="space-y-3">
//                 <input type="hidden" name="id" value={master.id} />
//                 <div className="grid sm:grid-cols-2 gap-3">
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">Дата с</div>
//                     <input
//                       type="date"
//                       name="to-date-start"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">Дата по (вкл.)</div>
//                     <input
//                       type="date"
//                       name="to-date-end"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     />
//                   </div>
//                 </div>

//                 <label className="flex items-center gap-2">
//                   <input type="checkbox" name="to-closed" className="accent-emerald-500" />
//                   <span>Целый день (выходной)</span>
//                 </label>

//                 <div className="grid sm:grid-cols-2 gap-3">
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">
//                       Начало (если не целый день)
//                     </div>
//                     <input
//                       type="time"
//                       name="to-start"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     />
//                   </div>
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">Конец</div>
//                     <input
//                       type="time"
//                       name="to-end"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <div className="text-xs opacity-60 mb-1">Причина</div>
//                   <input
//                     name="to-reason"
//                     placeholder="например: отпуск, обучение, тех.работы…"
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>

//                 <button className="btn">Добавить</button>
//               </form>
//             </div>

//             {/* Исключения — адаптивный список */}
//             <div className="rounded-2xl border p-4 space-y-3">
//               <h3 className="font-medium">Исключения</h3>

//               {master.timeOff.length === 0 ? (
//                 <div className="opacity-60">Нет исключений</div>
//               ) : (
//                 <>
//                   {/* Mobile cards */}
//                   <div className="grid gap-3 sm:hidden">
//                     {master.timeOff.map((t) => {
//                       const interval =
//                         t.startMinutes === 0 && t.endMinutes === 1440
//                           ? "Целый день"
//                           : `${mmToTime(t.startMinutes)} — ${mmToTime(t.endMinutes)}`;
//                       return (
//                         <div key={t.id} className="rounded-xl border p-3 bg-white/5">
//                           <div className="flex items-start justify-between gap-3">
//                             <div>
//                               <div className="font-medium">{fmtDate(t.date)}</div>
//                               <div className="text-sm opacity-80">{interval}</div>
//                               <div className="text-xs opacity-70 mt-1">
//                                 {t.reason ?? "—"}
//                               </div>
//                             </div>
//                             <form action={removeTimeOff}>
//                               <input type="hidden" name="id" value={master.id} />
//                               <input type="hidden" name="timeOffId" value={t.id} />
//                               <button
//                                 className="btn btn-sm border-rose-500 text-rose-400 hover:bg-rose-500/10"
//                                 title="Удалить исключение"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </button>
//                             </form>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Desktop table */}
//                   <div className="overflow-x-auto hidden sm:block">
//                     <table className="min-w-[640px] w-full text-sm">
//                       <thead className="text-left opacity-70">
//                         <tr>
//                           <th className="py-2 pr-3">Дата</th>
//                           <th className="py-2 pr-3">Интервал</th>
//                           <th className="py-2 pr-3">Причина</th>
//                           <th className="py-2 pr-3">Действия</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-white/10">
//                         {master.timeOff.map((t) => (
//                           <tr key={t.id}>
//                             <td className="py-2 pr-3">{fmtDate(t.date)}</td>
//                             <td className="py-2 pr-3">
//                               {t.startMinutes === 0 && t.endMinutes === 1440
//                                 ? "Целый день"
//                                 : `${mmToTime(t.startMinutes)} — ${mmToTime(
//                                     t.endMinutes
//                                   )}`}
//                             </td>
//                             <td className="py-2 pr-3">{t.reason ?? "—"}</td>
//                             <td className="py-2 pr-3">
//                               <form action={removeTimeOff}>
//                                 <input type="hidden" name="id" value={master.id} />
//                                 <input type="hidden" name="timeOffId" value={t.id} />
//                                 <button className="btn border-rose-500 text-rose-400 hover:bg-rose-500/10">
//                                   Удалить
//                                 </button>
//                               </form>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </section>
//       )}
//     </main>
//   );
// }


//------------------  работает сохранение графика -------------------

// export const dynamic = "force-dynamic";

// import type { ReactElement } from "react";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { prisma } from "@/lib/db";
// import {
//   updateMaster,
//   setMasterServices,
//   setMasterWorkingHours,
//   addTimeOff,
//   removeTimeOff,
//   uploadAvatar,
//   removeAvatar,
// } from "./actions";
// import AvatarUploader from "./AvatarUploader";
// import {
//   CalendarDays,
//   ChevronRight,
//   FolderTree,
//   Layers,
//   User2,
// } from "lucide-react";

// /* ───────── helpers ───────── */

// function mmToTime(mm: number | null | undefined): string {
//   const v = typeof mm === "number" && Number.isFinite(mm) ? mm : 0;
//   const h = Math.floor(v / 60);
//   const m = v % 60;
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${pad(h)}:${pad(m)}`;
// }

// const DAYS = [
//   { label: "Пн", full: "Понедельник", value: 1 },
//   { label: "Вт", full: "Вторник", value: 2 },
//   { label: "Ср", full: "Среда", value: 3 },
//   { label: "Чт", full: "Четверг", value: 4 },
//   { label: "Пт", full: "Пятница", value: 5 },
//   { label: "Сб", full: "Суббота", value: 6 },
//   { label: "Вс", full: "Воскресенье", value: 0 },
// ] as const;

// function fmtDate(d: Date) {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   }).format(d);
// }

// function fmtDateTime(d: Date) {
//   return new Intl.DateTimeFormat("ru-RU", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

// /* ───────── дерево категорий/услуг ───────── */

// type SItem = { id: string; name: string; parentId: string | null };
// type NodeT = {
//   id: string;
//   name: string;
//   parentId: string | null;
//   children: NodeT[];
// };

// const coll = new Intl.Collator("ru", { sensitivity: "base" });

// function buildTree(items: ReadonlyArray<SItem>): NodeT[] {
//   const byId = new Map<string, NodeT>();
//   const roots: NodeT[] = [];

//   for (const s of items) {
//     byId.set(s.id, {
//       id: s.id,
//       name: s.name,
//       parentId: s.parentId,
//       children: [],
//     });
//   }
//   for (const s of items) {
//     const node = byId.get(s.id)!;
//     if (s.parentId && byId.has(s.parentId)) {
//       byId.get(s.parentId)!.children.push(node);
//     } else {
//       roots.push(node);
//     }
//   }
//   const sortRec = (ns: NodeT[]) => {
//     ns.sort((a, b) => coll.compare(a.name, b.name));
//     ns.forEach((n) => sortRec(n.children));
//   };
//   sortRec(roots);

//   return roots;
// }

// /** Категория (accordion) + листья-чекбоксы в нашем стиле */
// function RenderTree({
//   node,
//   chosen,
//   level = 0,
// }: {
//   node: NodeT;
//   chosen: Set<string>;
//   level?: number;
// }): ReactElement {
//   const isLeaf = node.children.length === 0;

//   if (isLeaf) {
//     return (
//       <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5/5 px-3 py-2 hover:bg-white/10 transition">
//         <input
//           type="checkbox"
//           className="accent-emerald-500"
//           name="serviceId"
//           value={node.id}
//           defaultChecked={chosen.has(node.id)}
//           aria-label={node.name}
//         />
//         <span className="text-sm">{node.name}</span>
//       </label>
//     );
//   }

//   return (
//     <details
//       className="group rounded-2xl border border-white/10 bg-gradient-to-r from-sky-400/5 via-transparent to-purple-400/5 p-3"
//       open
//     >
//       <summary className="list-none flex items-center justify-between cursor-pointer">
//         <div className="flex items-center gap-2">
//           {level === 0 ? (
//             <Layers className="h-4 w-4 text-sky-400" aria-hidden />
//           ) : (
//             <FolderTree className="h-4 w-4 text-violet-400" aria-hidden />
//           )}
//           <span className="font-medium">{node.name}</span>
//         </div>
//         <ChevronRight className="h-4 w-4 text-white/50 transition group-open:rotate-90" />
//       </summary>

//       <div className="mt-3 grid gap-2 pl-1 sm:grid-cols-2 lg:grid-cols-3">
//         {node.children.map((child) => (
//           <RenderTree
//             key={child.id}
//             node={child}
//             chosen={chosen}
//             level={level + 1}
//           />
//         ))}
//       </div>
//     </details>
//   );
// }

// /* ───────── типы для Next 15 ───────── */

// type PageProps = {
//   params: Promise<{ id: string }>;
//   searchParams: Promise<{ tab?: string; saved?: string }>;
// };

// export default async function MasterPage(props: PageProps) {
//   const { id } = await props.params;
//   const { tab = "profile", saved } = await props.searchParams;

//   const master = await prisma.master.findUnique({
//     where: { id },
//     include: {
//       services: { select: { id: true } },
//       workingHours: true,
//       timeOff: { orderBy: { date: "desc" } },
//     },
//   });
//   if (!master) return notFound();

//   // список услуг
//   const allServices = await prisma.service.findMany({
//     where: { isActive: true },
//     select: { id: true, name: true, parentId: true },
//     orderBy: [{ parentId: "asc" }, { name: "asc" }],
//   });
//   const chosenServiceIds = new Set(master.services.map((s) => s.id));

//   // подготовим рабочие часы
//   const whMap = new Map<
//     number,
//     { isClosed: boolean; start: number; end: number }
//   >();
//   for (const wh of master.workingHours) {
//     whMap.set(wh.weekday, {
//       isClosed: wh.isClosed,
//       start: wh.startMinutes,
//       end: wh.endMinutes,
//     });
//   }

//   const selectedCount = chosenServiceIds.size;

//   return (
//     <main className="p-6 space-y-6">
//       <div className="flex items-center justify-between gap-4">
//         <h1 className="text-2xl font-semibold flex items-center gap-2">
//           <User2 className="h-5 w-5 text-sky-400" /> Сотрудник: {master.name}
//         </h1>
//         <div className="flex gap-2">
//           <Link href="/admin/masters" className="btn">
//             ← К списку
//           </Link>
//         </div>
//       </div>

//       {saved && (
//         <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-2">
//           Сохранено.
//         </div>
//       )}

//       {/* Табы */}
//       <div className="flex flex-wrap gap-2">
//         <Link
//           href={`?tab=profile`}
//           className={`px-3 py-1.5 rounded-full border transition ${
//             tab === "profile" ? "bg-white/10" : "hover:bg-white/10"
//           }`}
//         >
//           Профиль
//         </Link>
//         <Link
//           href={`?tab=services`}
//           className={`px-3 py-1.5 rounded-full border transition ${
//             tab === "services" ? "bg-white/10" : "hover:bg-white/10"
//           }`}
//         >
//           Категории и услуги
//         </Link>
//         <Link
//           href={`?tab=schedule`}
//           className={`px-3 py-1.5 rounded-full border transition ${
//             tab === "schedule" ? "bg-white/10" : "hover:bg-white/10"
//           }`}
//         >
//           Календарь
//         </Link>
//       </div>

//       {/* -------- Профиль -------- */}
//       {tab === "profile" && (
//         <section className="rounded-2xl border p-4 space-y-6">
//           <div className="grid lg:grid-cols-3 gap-6">
//             {/* Форма профиля */}
//             <form action={updateMaster} className="space-y-3 lg:col-span-2">
//               <input type="hidden" name="id" value={master.id} />
//               <div>
//                 <div className="text-xs opacity-60 mb-1">Имя</div>
//                 <input
//                   name="name"
//                   defaultValue={master.name}
//                   className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   required
//                 />
//               </div>
//               <div className="grid sm:grid-cols-2 gap-3">
//                 <div>
//                   <div className="text-xs opacity-60 mb-1">E-mail</div>
//                   <input
//                     type="email"
//                     name="email"
//                     defaultValue={master.email ?? ""}
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <div className="text-xs opacity-60 mb-1">Телефон</div>
//                   <input
//                     name="phone"
//                     defaultValue={master.phone ?? ""}
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>
//                 <div>
//                   <div className="text-xs opacity-60 mb-1">Дата рождения</div>
//                   <input
//                     type="date"
//                     name="birthDate"
//                     defaultValue={
//                       master.birthDate
//                         ? new Date(master.birthDate).toISOString().slice(0, 10)
//                         : ""
//                     }
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     required
//                   />
//                 </div>
//               </div>
//               <div>
//                 <div className="text-xs opacity-60 mb-1">О себе</div>
//                 <textarea
//                   name="bio"
//                   defaultValue={master.bio ?? ""}
//                   className="w-full min-h-24 rounded-lg border bg-transparent px-3 py-2"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <button className="btn" name="intent" value="save_stay">
//                   Сохранить
//                 </button>
//                 <button className="btn" name="intent" value="save_close">
//                   Сохранить и выйти
//                 </button>
//               </div>
//             </form>

//             {/* Аватар */}
//             <div className="space-y-3">
//               <div className="text-sm opacity-80">Аватар</div>
//               <div className="rounded-xl border p-3 space-y-3">
//                 {master.avatarUrl ? (
//                   <img
//                     src={master.avatarUrl}
//                     alt="avatar"
//                     className="block w-40 h-40 object-cover rounded-xl"
//                   />
//                 ) : (
//                   <div className="w-40 h-40 rounded-xl border flex items-center justify-center opacity-60">
//                     нет фото
//                   </div>
//                 )}

//                 <AvatarUploader masterId={master.id} action={uploadAvatar} />

//                 {master.avatarUrl && (
//                   <form action={removeAvatar}>
//                     <input type="hidden" name="id" value={master.id} />
//                     <button className="btn border-rose-500 text-rose-400 hover:bg-rose-500/10">
//                       Удалить
//                     </button>
//                   </form>
//                 )}
//               </div>

//               <div className="text-xs opacity-60">
//                 Создан: {fmtDateTime(master.createdAt)}
//                 <br />
//                 Обновлён: {fmtDateTime(master.updatedAt)}
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* -------- Услуги (дерево, наш стиль) -------- */}
//       {tab === "services" && (
//         <section className="rounded-2xl border p-4 space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold flex items-center gap-2">
//               <FolderTree className="h-5 w-5 text-violet-400" />
//               Услуги мастера
//             </h2>
//             <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs">
//               Выбрано: <b className="font-semibold">{selectedCount}</b>
//             </span>
//           </div>

//           {(() => {
//             const tree = buildTree(
//               allServices.map((s) => ({
//                 id: s.id,
//                 name: s.name,
//                 parentId: s.parentId,
//               }))
//             );

//             return (
//               <form action={setMasterServices} className="space-y-4">
//                 <input type="hidden" name="id" value={master.id} />

//                 <div className="grid gap-3">
//                   {tree.map((n) => (
//                     <RenderTree key={n.id} node={n} chosen={chosenServiceIds} />
//                   ))}
//                 </div>

//                 <div className="pt-2 flex flex-wrap gap-2">
//                   <button className="btn" name="intent" value="save_stay">
//                     Сохранить
//                   </button>
//                   <button className="btn" name="intent" value="save_close">
//                     Сохранить и выйти
//                   </button>
//                 </div>
//               </form>
//             );
//           })()}
//         </section>
//       )}

//       {/* -------- Календарь (один набор инпутов, адаптив) -------- */}
//       {tab === "schedule" && (
//         <section className="rounded-2xl border p-4 space-y-8">
//           {/* Рабочий график */}
//           <div>
//             <div className="flex items-center justify-between mb-3">
//               <h2 className="text-lg font-semibold flex items-center gap-2">
//                 <CalendarDays className="h-5 w-5 text-sky-400" />
//                 Рабочий график
//               </h2>
//               <span className="text-xs opacity-70 hidden sm:block">
//                 Отметьте выходной или укажите время
//               </span>
//             </div>

//             <form action={setMasterWorkingHours} className="space-y-3">
//               <input type="hidden" name="id" value={master.id} />

//               {/* ⬇ Один набор инпутов. На sm+ выглядит как таблица 4 колонки */}
//               <div className="rounded-xl border overflow-hidden">
//                 {/* Заголовок для sm+ */}
//                 <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 py-2 text-left text-xs opacity-70 bg-white/5">
//                   <div>День</div>
//                   <div>Выходной</div>
//                   <div>Начало</div>
//                   <div>Конец</div>
//                 </div>

//                 {DAYS.map((d, idx) => {
//                   const cur = whMap.get(d.value) ?? {
//                     isClosed: true,
//                     start: 0,
//                     end: 0,
//                   };
//                   return (
//                     <div
//                       key={d.value}
//                       className={`grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-3 py-3 border-t border-white/10 ${
//                         idx === 0 ? "border-t-0" : ""
//                       }`}
//                     >
//                       {/* День */}
//                       <div className="font-medium">{d.full}</div>

//                       {/* Выходной */}
//                       <label className="inline-flex items-center gap-2 text-sm">
//                         <input
//                           type="checkbox"
//                           name={`wh-${d.value}-isClosed`}
//                           defaultChecked={cur.isClosed}
//                           className="accent-emerald-500"
//                           aria-label={`${d.full}: выходной`}
//                         />
//                         <span className="sm:hidden">Выходной</span>
//                       </label>

//                       {/* Начало */}
//                       <label className="text-xs sm:text-sm opacity-70 sm:opacity-100">
//                         <span className="sm:hidden block mb-1">Начало</span>
//                         <input
//                           type="time"
//                           name={`wh-${d.value}-start`}
//                           defaultValue={mmToTime(cur.start)}
//                           className="w-full rounded-md border bg-transparent px-2 py-1"
//                           aria-label={`${d.full}: начало`}
//                         />
//                       </label>

//                       {/* Конец */}
//                       <label className="text-xs sm:text-sm opacity-70 sm:opacity-100">
//                         <span className="sm:hidden block mb-1">Конец</span>
//                         <input
//                           type="time"
//                           name={`wh-${d.value}-end`}
//                           defaultValue={mmToTime(cur.end)}
//                           className="w-full rounded-md border bg-transparent px-2 py-1"
//                           aria-label={`${d.full}: конец`}
//                         />
//                       </label>
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 <button className="btn" name="intent" value="save_stay">
//                   Сохранить график
//                 </button>
//                 <button className="btn" name="intent" value="save_close">
//                   Сохранить и выйти
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Исключения (выходные / перерывы) */}
//           <div className="grid lg:grid-cols-2 gap-6">
//             {/* Добавить исключение */}
//             <div className="rounded-2xl border p-4 space-y-3 bg-gradient-to-br from-white/5 to-transparent">
//               <h3 className="font-medium flex items-center gap-2">
//                 <CalendarDays className="h-4 w-4 text-amber-300" />
//                 Добавить исключение
//               </h3>
//               <form action={addTimeOff} className="space-y-3">
//                 <input type="hidden" name="id" value={master.id} />
//                 <div className="grid sm:grid-cols-2 gap-3">
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">Дата с</div>
//                     <input
//                       type="date"
//                       name="to-date-start"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">Дата по (вкл.)</div>
//                     <input
//                       type="date"
//                       name="to-date-end"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     />
//                   </div>
//                 </div>

//                 <label className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     name="to-closed"
//                     className="accent-emerald-500"
//                   />
//                   <span>Целый день (выходной)</span>
//                 </label>

//                 <div className="grid sm:grid-cols-2 gap-3">
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">
//                       Начало (если не целый день)
//                     </div>
//                     <input
//                       type="time"
//                       name="to-start"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     />
//                   </div>
//                   <div>
//                     <div className="text-xs opacity-60 mb-1">Конец</div>
//                     <input
//                       type="time"
//                       name="to-end"
//                       className="w-full rounded-lg border bg-transparent px-3 py-2"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <div className="text-xs opacity-60 mb-1">Причина</div>
//                   <input
//                     name="to-reason"
//                     placeholder="например: отпуск, обучение, тех.работы…"
//                     className="w-full rounded-lg border bg-transparent px-3 py-2"
//                   />
//                 </div>

//                 <button className="btn">Добавить</button>
//               </form>
//             </div>

//             {/* Таблица исключений */}
//             <div className="rounded-2xl border p-4 space-y-3">
//               <h3 className="font-medium">Исключения</h3>
//               {master.timeOff.length === 0 ? (
//                 <div className="opacity-60">Нет исключений</div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-[640px] w-full text-sm">
//                     <thead className="text-left opacity-70">
//                       <tr>
//                         <th className="py-2 pr-3">Дата</th>
//                         <th className="py-2 pr-3">Интервал</th>
//                         <th className="py-2 pr-3">Причина</th>
//                         <th className="py-2 pr-3">Действия</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-white/10">
//                       {master.timeOff.map((t) => (
//                         <tr key={t.id}>
//                           <td className="py-2 pr-3">{fmtDate(t.date)}</td>
//                           <td className="py-2 pr-3">
//                             {t.startMinutes === 0 && t.endMinutes === 1440
//                               ? "Целый день"
//                               : `${mmToTime(t.startMinutes)} — ${mmToTime(
//                                   t.endMinutes
//                                 )}`}
//                           </td>
//                           <td className="py-2 pr-3">{t.reason ?? "—"}</td>
//                           <td className="py-2 pr-3">
//                             <form action={removeTimeOff}>
//                               <input
//                                 type="hidden"
//                                 name="id"
//                                 value={master.id}
//                               />
//                               <input
//                                 type="hidden"
//                                 name="timeOffId"
//                                 value={t.id}
//                               />
//                               <button className="btn border-rose-500 text-rose-400 hover:bg-rose-500/10">
//                                 Удалить
//                               </button>
//                             </form>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>
//       )}
//     </main>
//   );
// }
