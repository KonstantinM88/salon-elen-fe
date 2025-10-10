// src/app/admin/masters/[id]/page.tsx
export const dynamic = "force-dynamic";

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
  ArrowLeft,
  User,
  Phone,
  Mail,
  Cake,
  Save,
  Image as ImageIcon,
  Trash2,
  ListChecks,
  Scissors,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";

/* ───────── helpers ───────── */

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

/* ───────── small UI atoms ───────── */

function Card({
  title,
  icon,
  children,
  className = "",
}: {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl ring-1 ring-white/10 bg-slate-950/40 p-4 sm:p-5 ${className}`}
    >
      {title ? (
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
          {icon}
          <span>{title}</span>
        </div>
      ) : null}
      {children}
    </section>
  );
}

function TabLink({
  active,
  href,
  children,
  icon,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 h-10 px-4 rounded-full border border-white/10 ring-1 ring-white/10 transition
      ${
        active
          ? "bg-white/10 text-white"
          : "bg-slate-900/40 hover:bg-slate-800/60 text-slate-200"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

function Pill({
  children,
  tone = "sky",
}: {
  children: React.ReactNode;
  tone?: "sky" | "emerald" | "violet";
}) {
  const map = {
    sky: "bg-sky-500/12 text-sky-200 ring-sky-400/25",
    emerald: "bg-emerald-500/12 text-emerald-200 ring-emerald-400/25",
    violet: "bg-violet-500/12 text-violet-200 ring-violet-400/25",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full h-7 px-2.5 text-[12px] ring-1 ${map[tone]}`}
    >
      {children}
    </span>
  );
}

/* ───────── page ───────── */

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

  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
  const chosenServiceIds = new Set(master.services.map((s) => s.id));

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
    <main className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/masters"
            className="inline-flex items-center gap-2 rounded-full h-9 px-3 text-sm
                       bg-slate-900/50 border border-white/10 ring-1 ring-white/10 hover:bg-slate-800/70 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            К списку
          </Link>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Сотрудник: {master.name}
          </h1>
          <Pill tone="emerald">ID: {master.id.slice(0, 6)}…</Pill>
        </div>

        {/* Быстрые даты */}
        <div className="text-xs opacity-70">
          Создан: {fmtDateTime(master.createdAt)} • Обновлён:{" "}
          {fmtDateTime(master.updatedAt)}
        </div>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-2">
          Сохранено.
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabLink
          href={`?tab=profile`}
          active={tab === "profile"}
          icon={<User className="h-4 w-4 text-sky-300" />}
        >
          Профиль
        </TabLink>
        <TabLink
          href={`?tab=services`}
          active={tab === "services"}
          icon={<Scissors className="h-4 w-4 text-violet-300" />}
        >
          Категории и услуги
        </TabLink>
        <TabLink
          href={`?tab=schedule`}
          active={tab === "schedule"}
          icon={<CalendarIcon className="h-4 w-4 text-emerald-300" />}
        >
          Календарь
        </TabLink>
      </div>

      {/* -------- Профиль -------- */}
      {tab === "profile" && (
        <Card>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Форма профиля */}
            <form action={updateMaster} className="space-y-4 lg:col-span-2">
              <input type="hidden" name="id" value={master.id} />

              <Card title="Основное" icon={<User className="h-4 w-4 text-sky-300" />}>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="grid gap-1 text-sm">
                    <span className="opacity-60">Имя</span>
                    <input
                      name="name"
                      defaultValue={master.name}
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                      required
                    />
                  </label>

                  <label className="grid gap-1 text-sm">
                    <span className="opacity-60">Дата рождения</span>
                    <input
                      type="date"
                      name="birthDate"
                      defaultValue={
                        master.birthDate
                          ? new Date(master.birthDate).toISOString().slice(0, 10)
                          : ""
                      }
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                      required
                    />
                  </label>

                  <label className="grid gap-1 text-sm">
                    <span className="opacity-60">E-mail</span>
                    <div className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-violet-300" />
                      <input
                        type="email"
                        name="email"
                        defaultValue={master.email ?? ""}
                        className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                      />
                    </div>
                  </label>

                  <label className="grid gap-1 text-sm">
                    <span className="opacity-60">Телефон</span>
                    <div className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-emerald-300" />
                      <input
                        name="phone"
                        defaultValue={master.phone ?? ""}
                        className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                      />
                    </div>
                  </label>
                </div>

                <label className="grid gap-1 text-sm mt-3">
                  <span className="opacity-60">О себе</span>
                  <textarea
                    name="bio"
                    defaultValue={master.bio ?? ""}
                    className="w-full min-h-28 rounded-lg border border-white/10 bg-transparent px-3 py-2"
                  />
                </label>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-full h-10 px-4 text-sm font-medium text-white
                               bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500
                               ring-1 ring-white/10 shadow-[0_0_20px_rgba(99,102,241,.35)]
                               hover:brightness-110 active:scale-[0.98] transition"
                    name="intent"
                    value="save_stay"
                  >
                    <Save className="h-4 w-4" />
                    Сохранить
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-full h-10 px-4 text-sm
                               bg-slate-900/50 border border-white/10 ring-1 ring-white/10 hover:bg-slate-800/70 transition"
                    name="intent"
                    value="save_close"
                  >
                    Сохранить и выйти
                  </button>
                </div>
              </Card>
            </form>

            {/* Аватар */}
            <Card title="Аватар" icon={<ImageIcon className="h-4 w-4 text-amber-300" />}>
              <div className="space-y-3">
                {master.avatarUrl ? (
                  <img
                    src={master.avatarUrl}
                    alt="avatar"
                    className="block w-40 h-40 object-cover rounded-xl ring-1 ring-white/10"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-xl border border-white/10 ring-1 ring-white/10 flex items-center justify-center opacity-60">
                    нет фото
                  </div>
                )}

                <AvatarUploader masterId={master.id} action={uploadAvatar} />

                {master.avatarUrl && (
                  <form action={removeAvatar}>
                    <input type="hidden" name="id" value={master.id} />
                    <button
                      className="inline-flex items-center gap-2 rounded-full h-10 px-4 text-sm
                                 bg-slate-900/50 border border-rose-500/30 text-rose-300
                                 ring-1 ring-rose-500/20 hover:bg-rose-900/30 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </button>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </Card>
      )}

      {/* -------- Услуги -------- */}
      {tab === "services" && (
        <Card title="Услуги мастера" icon={<ListChecks className="h-4 w-4 text-violet-300" />}>
          <form action={setMasterServices} className="space-y-4">
            <input type="hidden" name="id" value={master.id} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allServices.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/40 hover:bg-slate-800/60 px-3 py-2 transition"
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

            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full h-10 px-4 text-sm font-medium text-white
                           bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500
                           ring-1 ring-white/10 shadow-[0_0_20px_rgba(99,102,241,.35)]
                           hover:brightness-110 active:scale-[0.98] transition"
                name="intent"
                value="save_stay"
              >
                <Save className="h-4 w-4" />
                Сохранить
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full h-10 px-4 text-sm
                           bg-slate-900/50 border border-white/10 ring-1 ring-white/10 hover:bg-slate-800/70 transition"
                name="intent"
                value="save_close"
              >
                Сохранить и выйти
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* -------- Календарь -------- */}
      {tab === "schedule" && (
        <Card className="space-y-8">
          {/* Рабочий график */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-200">
              <CalendarIcon className="h-4 w-4 text-emerald-300" />
              Рабочий график
            </div>

            <form action={setMasterWorkingHours} className="space-y-3">
              <input type="hidden" name="id" value={master.id} />

              <div className="relative overflow-x-auto rounded-xl ring-1 ring-white/10">
                <table className="min-w-[720px] w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
                    <tr className="text-left">
                      <th className="py-2.5 px-3 font-medium">День</th>
                      <th className="py-2.5 px-3 font-medium">Выходной</th>
                      <th className="py-2.5 px-3 font-medium">Начало</th>
                      <th className="py-2.5 px-3 font-medium">Конец</th>
                    </tr>
                  </thead>
                  <tbody className="[&>tr]:border-t [&>tr]:border-white/8">
                    {DAYS.map((d) => {
                      const cur =
                        whMap.get(d.value) ?? ({ isClosed: true, start: 0, end: 0 } as const);
                      return (
                        <tr key={d.value}>
                          <td className="py-2.5 px-3">{d.label}</td>
                          <td className="py-2.5 px-3">
                            <input
                              type="checkbox"
                              name={`closed_${d.value}`}
                              defaultChecked={cur.isClosed}
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="time"
                              name={`start_${d.value}`}
                              defaultValue={mmToTime(cur.start)}
                              className="rounded-md border border-white/10 bg-transparent px-2 py-1"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="time"
                              name={`end_${d.value}`}
                              defaultValue={mmToTime(cur.end)}
                              className="rounded-md border border-white/10 bg-transparent px-2 py-1"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-full h-10 px-4 text-sm font-medium text-white
                             bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500
                             ring-1 ring-white/10 shadow-[0_0_20px_rgba(99,102,241,.35)]
                             hover:brightness-110 active:scale-[0.98] transition"
                  name="intent"
                  value="save_stay"
                >
                  <Save className="h-4 w-4" />
                  Сохранить график
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full h-10 px-4 text-sm
                             bg-slate-900/50 border border-white/10 ring-1 ring-white/10 hover:bg-slate-800/70 transition"
                  name="intent"
                  value="save_close"
                >
                  Сохранить и выйти
                </button>
              </div>
            </form>
          </div>

          {/* Исключения */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Добавить исключение */}
            <Card title="Добавить исключение" icon={<Clock className="h-4 w-4 text-amber-300" />}>
              <form action={addTimeOff} className="space-y-3">
                <input type="hidden" name="id" value={master.id} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="grid gap-1 text-sm">
                    <span className="opacity-60">Дата с</span>
                    <input
                      type="date"
                      name="to-date-start"
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="opacity-60">Дата по (вкл.)</span>
                    <input
                      type="date"
                      name="to-date-end"
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                    />
                  </label>
                </div>

                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" name="to-closed" />
                  <span>Целый день (выходной)</span>
                </label>

                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="grid gap-1 text-sm">
                    <span className="opacity-60">Начало (если не целый день)</span>
                    <input
                      type="time"
                      name="to-start"
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="opacity-60">Конец</span>
                    <input
                      type="time"
                      name="to-end"
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                    />
                  </label>
                </div>

                <label className="grid gap-1 text-sm">
                  <span className="opacity-60">Причина</span>
                  <input
                    name="to-reason"
                    placeholder="например: отпуск, обучение, тех.работы…"
                    className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2"
                  />
                </label>

                <button className="inline-flex items-center gap-2 rounded-full h-10 px-4 text-sm font-medium text-white
                                   bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500
                                   ring-1 ring-white/10 shadow-[0_0_20px_rgba(99,102,241,.35)]
                                   hover:brightness-110 active:scale-[0.98] transition">
                  <Save className="h-4 w-4" />
                  Добавить
                </button>
              </form>
            </Card>

            {/* Таблица исключений */}
            <Card title="Исключения" icon={<CalendarIcon className="h-4 w-4 text-sky-300" />}>
              {master.timeOff.length === 0 ? (
                <div className="opacity-60">Нет исключений</div>
              ) : (
                <div className="relative overflow-x-auto rounded-xl ring-1 ring-white/10">
                  <table className="min-w-[640px] w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
                      <tr className="text-left">
                        <th className="py-2.5 px-3 font-medium">Дата</th>
                        <th className="py-2.5 px-3 font-medium">Интервал</th>
                        <th className="py-2.5 px-3 font-medium">Причина</th>
                        <th className="py-2.5 px-3 font-medium">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="[&>tr]:border-t [&>tr]:border-white/8">
                      {master.timeOff.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2.5 px-3">{fmtDate(t.date)}</td>
                          <td className="py-2.5 px-3">
                            {t.startMinutes === 0 && t.endMinutes === 1440
                              ? "Целый день"
                              : `${mmToTime(t.startMinutes)} — ${mmToTime(t.endMinutes)}`}
                          </td>
                          <td className="py-2.5 px-3">{t.reason ?? "—"}</td>
                          <td className="py-2.5 px-3">
                            <form action={removeTimeOff} className="inline">
                              <input type="hidden" name="id" value={master.id} />
                              <input type="hidden" name="timeOffId" value={t.id} />
                              <button
                                className="inline-flex items-center gap-2 rounded-full h-9 px-3 text-sm
                                           bg-slate-900/50 border border-rose-500/30 text-rose-300
                                           ring-1 ring-rose-500/20 hover:bg-rose-900/30 transition"
                              >
                                <Trash2 className="h-4 w-4" />
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
            </Card>
          </div>
        </Card>
      )}
    </main>
  );
}
