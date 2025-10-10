// src/app/admin/masters/page.tsx
export const dynamic = "force-dynamic";

import type { ReactElement } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  UserPlus,
  Eye,
  Trash2,
  Phone,
  Mail,
  Cake,
  Scissors,
  CalendarClock,
} from "lucide-react";

function fmt(d: Date): string {
  return format(d, "dd.MM.yyyy", { locale: ru });
}

function Pill({
  value,
  tone = "emerald",
  icon,
}: {
  value: number | string;
  tone?: "emerald" | "sky" | "violet";
  icon?: ReactElement;
}) {
  const map = {
    emerald:
      "bg-emerald-500/12 text-emerald-200 ring-emerald-400/25 data-[empty=true]:text-slate-300 data-[empty=true]:bg-white/6 data-[empty=true]:ring-white/12",
    sky: "bg-sky-500/12 text-sky-200 ring-sky-400/25",
    violet: "bg-violet-500/12 text-violet-200 ring-violet-400/25",
  } as const;

  return (
    <span
      data-empty={String(value) === "0"}
      className={`inline-flex items-center gap-1.5 rounded-full h-7 px-2.5 text-[12px] ring-1 ${map[tone]}`}
    >
      {icon}
      {value}
    </span>
  );
}

export default async function MastersPage(): Promise<ReactElement> {
  const masters = await prisma.master.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { services: true, appointments: true } } },
  });

  return (
    <main className="p-4 sm:p-6 space-y-6">
      {/* Заголовок + CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Сотрудники
          </h1>
          <div className="text-sm opacity-70 mt-1">
            Профили мастеров, услуги и записи
          </div>
        </div>

        <Link
          href="/admin/masters/new"
          className="inline-flex items-center gap-2 rounded-full h-10 px-4 text-sm font-medium text-white
                     bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500
                     ring-1 ring-white/10 shadow-[0_0_20px_rgba(99,102,241,.35)]
                     hover:brightness-110 active:scale-[0.98] transition"
        >
          <UserPlus className="h-4 w-4" />
          Добавить
        </Link>
      </div>

      {/* Мобильные карточки */}
      <div className="grid gap-3 md:hidden">
        {masters.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-4 opacity-70">
            Сотрудников пока нет
          </div>
        ) : (
          masters.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-medium">{m.name}</div>
                  {m.bio ? (
                    <div className="text-sm opacity-70 -mt-0.5">{m.bio}</div>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/masters/${m.id}`}
                    className="inline-flex items-center gap-2 rounded-full h-9 px-3 text-sm
                               border border-white/10 ring-1 ring-white/10 bg-slate-900/60
                               hover:bg-slate-800/70 transition"
                  >
                    <Eye className="h-4 w-4 text-sky-300" />
                    Открыть
                  </Link>
                  <form
                    action={async (fd) => {
                      "use server";
                      const { deleteMaster } = await import("./actions");
                      fd.set("id", m.id);
                      await deleteMaster(fd);
                    }}
                  >
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full h-9 px-3 text-sm
                                 border border-white/10 ring-1 ring-white/10 bg-slate-900/60
                                 hover:bg-rose-900/30 hover:text-rose-200 transition"
                    >
                      <Trash2 className="h-4 w-4 text-rose-300" />
                      Удалить
                    </button>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-300" />
                  <span className="truncate">{m.phone ?? "—"}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-violet-300" />
                  <span className="truncate">{m.email ?? "—"}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Cake className="h-4 w-4 text-amber-300" />
                  <span>{m.birthDate ? fmt(m.birthDate) : "—"}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-cyan-300" />
                  <span>
                    <span className="opacity-70">заявок:</span>{" "}
                    {m._count.appointments}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-70">Услуг:</span>
                <Pill value={m._count.services} tone="violet" icon={<Scissors className="h-3.5 w-3.5" />} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Таблица — десктоп */}
      <div className="hidden md:block rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] bg-slate-950/40">
        <div className="relative overflow-x-auto">
          <table className="min-w-[900px] w-full text-[13.5px]">
            <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
              <tr className="text-left">
                <th className="py-3.5 px-4 font-medium text-slate-300">Имя</th>
                <th className="py-3.5 px-4 font-medium text-slate-300">Телефон</th>
                <th className="py-3.5 px-4 font-medium text-slate-300">E-mail</th>
                <th className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">Д.р.</th>
                <th className="py-3.5 px-4 font-medium text-slate-300">Услуг</th>
                <th className="py-3.5 px-4 font-medium text-slate-300">Заявок</th>
                <th className="py-3.5 px-4 font-medium text-slate-300 w-[180px]">Действия</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-t [&>tr]:border-white/8">
              {masters.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.03] transition-colors align-top">
                  <td className="py-3 px-4">
                    <div className="font-medium text-[14px]">{m.name}</div>
                    {m.bio && (
                      <div className="opacity-60 text-[12.5px] line-clamp-1">{m.bio}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-200">{m.phone ?? "—"}</td>
                  <td className="py-3 px-4 text-slate-200">{m.email ?? "—"}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {m.birthDate ? fmt(m.birthDate) : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <Pill
                      value={m._count.services}
                      tone="violet"
                      icon={<Scissors className="h-3.5 w-3.5" />}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Pill
                      value={m._count.appointments}
                      tone="sky"
                      icon={<CalendarClock className="h-3.5 w-3.5" />}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/masters/${m.id}`}
                        className="inline-flex items-center gap-2 rounded-full h-9 px-3 text-sm
                                   border border-white/10 ring-1 ring-white/10 bg-slate-900/60
                                   hover:bg-slate-800/70 transition"
                      >
                        <Eye className="h-4 w-4 text-sky-300" />
                        Открыть
                      </Link>

                      <form
                        action={async (fd) => {
                          "use server";
                          const { deleteMaster } = await import("./actions");
                          fd.set("id", m.id);
                          await deleteMaster(fd);
                        }}
                      >
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-full h-9 px-3 text-sm
                                     border border-white/10 ring-1 ring-white/10 bg-slate-900/60
                                     hover:bg-rose-900/30 hover:text-rose-200 transition"
                        >
                          <Trash2 className="h-4 w-4 text-rose-300" />
                          Удалить
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}

              {masters.length === 0 && (
                <tr>
                  <td className="p-4 opacity-70" colSpan={7}>
                    Сотрудников пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
