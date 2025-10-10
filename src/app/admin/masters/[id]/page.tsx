// src/app/admin/masters/[id]/page.tsx
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

export const dynamic = "force-dynamic";

// Next 15: params/searchParams — асинхронные
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; saved?: string }>;
};

function mmToTime(mm: number | null | undefined): string {
  const v = typeof mm === "number" && Number.isFinite(mm) ? mm : 0;
  const h = Math.floor(v / 60);
  const m = v % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}`;
}

const DAYS = [
  { label: "Пн", value: 1 },
  { label: "Вт", value: 2 },
  { label: "Ср", value: 3 },
  { label: "Чт", value: 4 },
  { label: "Пт", value: 5 },
  { label: "Сб", value: 6 },
  { label: "Вс", value: 0 },
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

export default async function MasterPage(props: PageProps) {
  const { id } = await props.params;
  const { tab = "profile", saved } = await props.searchParams;

  const master = await prisma.master.findUnique({
    where: { id },
    include: {
      services: { select: { id: true } },
      workingHours: true, // MasterWorkingHours[]
      timeOff: { orderBy: { date: "desc" } },
    },
  });
  if (!master) return notFound();

  // Список всех активных услуг (плоско, для чекбоксов)
  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
  const chosenServiceIds = new Set(master.services.map((s) => s.id));

  // Подготовим рабочие часы в удобную структуру
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

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Сотрудник: {master.name}</h1>
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
          </div>
        </section>
      )}

      {/* -------- Услуги -------- */}
      {tab === "services" && (
        <section className="rounded-2xl border p-4 space-y-4">
          <h2 className="text-lg font-medium">Услуги мастера</h2>
          <form action={setMasterServices} className="space-y-4">
            <input type="hidden" name="id" value={master.id} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allServices.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <input
                    type="checkbox"
                    name="serviceId"
                    value={s.id}
                    defaultChecked={chosenServiceIds.has(s.id)}
                  />
                  <span>{s.name}</span>
                </label>
              ))}
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
        </section>
      )}

      {/* -------- Календарь (рабочие часы + исключения) -------- */}
      {tab === "schedule" && (
        <section className="rounded-2xl border p-4 space-y-8">
          {/* Рабочий график */}
          <div>
            <h2 className="text-lg font-medium mb-3">Рабочий график</h2>
            <form action={setMasterWorkingHours} className="space-y-3">
              <input type="hidden" name="id" value={master.id} />

              <div className="overflow-x-auto">
                <table className="min-w-[720px] w-full text-sm">
                  <thead className="text-left opacity-70">
                    <tr>
                      <th className="py-2 pr-3">День</th>
                      <th className="py-2 pr-3">Выходной</th>
                      <th className="py-2 pr-3">Начало</th>
                      <th className="py-2 pr-3">Конец</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {DAYS.map((d) => {
                      const cur = whMap.get(d.value) ?? {
                        isClosed: true,
                        start: 0,
                        end: 0,
                      };
                      return (
                        <tr key={d.value}>
                          <td className="py-2 pr-3">{d.label}</td>
                          <td className="py-2 pr-3">
                            <input
                              type="checkbox"
                              name={`closed_${d.value}`}
                              defaultChecked={cur.isClosed}
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="time"
                              name={`start_${d.value}`}
                              defaultValue={mmToTime(cur.start)}
                              className="rounded-md border bg-transparent px-2 py-1"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="time"
                              name={`end_${d.value}`}
                              defaultValue={mmToTime(cur.end)}
                              className="rounded-md border bg-transparent px-2 py-1"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2">
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
            <div className="rounded-xl border p-4 space-y-3">
              <h3 className="font-medium">Добавить исключение</h3>
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
                    <div className="text-xs opacity-60 mb-1">
                      Дата по (вкл.)
                    </div>
                    <input
                      type="date"
                      name="to-date-end"
                      className="w-full rounded-lg border bg-transparent px-3 py-2"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="to-closed" />
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
            <div className="rounded-xl border p-4 space-y-3">
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
                              : `${mmToTime(t.startMinutes)} — ${mmToTime(t.endMinutes)}`}
                          </td>
                          <td className="py-2 pr-3">{t.reason ?? "—"}</td>
                          <td className="py-2 pr-3">
                            <form action={removeTimeOff}>
                              <input
                                type="hidden"
                                name="id"
                                value={master.id}
                              />
                              <input
                                type="hidden"
                                name="timeOffId"
                                value={t.id}
                              />
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
