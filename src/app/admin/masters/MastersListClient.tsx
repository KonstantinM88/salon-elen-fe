// src/app/admin/masters/MastersListClient.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  UserPlus,
  Users,
  Eye,
  Trash2,
  Phone,
  Mail,
  Cake,
  Scissors,
  CalendarClock,
} from 'lucide-react';
import { IconGlow } from '@/components/admin/IconGlow';
import { deleteMaster } from './actions';
import type { ReactElement } from 'react';

type Master = {
  id: string;
  name: string;
  bio: string | null;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  _count: {
    services: number;
    appointments: number;
  };
};

function Pill({
  value,
  tone = 'emerald',
  icon,
}: {
  value: number | string;
  tone?: 'emerald' | 'sky' | 'violet';
  icon?: ReactElement;
}) {
  const map = {
    emerald:
      'bg-emerald-500/12 text-emerald-200 ring-emerald-400/25 data-[empty=true]:text-slate-300 data-[empty=true]:bg-white/6 data-[empty=true]:ring-white/12',
    sky: 'bg-sky-500/12 text-sky-200 ring-sky-400/25',
    violet: 'bg-violet-500/12 text-violet-200 ring-violet-400/25',
  } as const;

  return (
    <span
      data-empty={String(value) === '0'}
      className={`inline-flex items-center gap-1.5 rounded-full h-7 px-2.5 text-[12px] ring-1 ${map[tone]}`}
    >
      {icon}
      {value}
    </span>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function MastersListClient({ masters }: { masters: Master[] }) {
  return (
    <>
      {/* Заголовок + CTA */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass card-glass-accent card-glow"
      >
        <div className="gradient-bg-radial" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <IconGlow tone="fuchsia" className="icon-glow-lg">
              <Users className="h-6 w-6 text-fuchsia-200" />
            </IconGlow>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">
                Сотрудники
              </h1>
              <div className="text-sm text-slate-400 mt-0.5">
                Профили мастеров, услуги и записи
              </div>
            </div>
          </div>

          <Link
            href="/admin/masters/new"
            className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95 transition-transform"
          >
            <UserPlus className="h-4 w-4" />
            Добавить
          </Link>
        </div>
      </motion.div>

      {/* Мобильные карточки */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 md:hidden"
      >
        {masters.length === 0 ? (
          <motion.div
            variants={item}
            className="card-glass card-glow p-6 text-center text-sm text-slate-400"
          >
            Сотрудников пока нет
          </motion.div>
        ) : (
          masters.map((m) => (
            <motion.div
              key={m.id}
              variants={item}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="card-glass-hover card-glass-accent card-glow p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-base font-medium truncate">{m.name}</div>
                  {m.bio ? (
                    <div className="text-sm opacity-70 line-clamp-1">{m.bio}</div>
                  ) : null}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/admin/masters/${m.id}`}
                    className="btn-glass inline-flex items-center gap-2 text-xs px-3 py-1.5 hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Eye className="h-4 w-4 text-sky-300" />
                    <span className="hidden sm:inline">Открыть</span>
                  </Link>
                  <form
                    action={async (fd) => {
                      fd.set('id', m.id);
                      await deleteMaster(fd);
                    }}
                  >
                    <button
                      type="submit"
                      className="btn-glass inline-flex items-center gap-2 text-xs px-3 py-1.5 text-rose-200 border-rose-400/30 hover:bg-rose-500/10 hover:scale-105 active:scale-95 transition-all"
                      onClick={(e) => {
                        if (
                          !confirm(
                            `Удалить мастера "${m.name}"? Это действие необратимо.`
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-rose-300" />
                    </button>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-300" />
                  <span className="truncate">{m.phone ?? '—'}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-violet-300" />
                  <span className="truncate">{m.email ?? '—'}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Cake className="h-4 w-4 text-amber-300" />
                  <span>{m.birthDate ?? '—'}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-cyan-300" />
                  <span>
                    <span className="opacity-70">заявок:</span>{' '}
                    {m._count.appointments}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-70">Услуг:</span>
                <Pill
                  value={m._count.services}
                  tone="violet"
                  icon={<Scissors className="h-3.5 w-3.5" />}
                />
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Таблица — десктоп */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="hidden md:block card-glass-hover card-glass-accent card-glow overflow-hidden"
      >
        <div className="relative overflow-x-auto">
          <table className="min-w-[900px] w-full text-[13.5px]">
            <thead className="sticky top-0 z-10 bg-slate-950/70 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
              <tr className="text-left">
                <th className="py-3.5 px-4 font-medium text-slate-300">Имя</th>
                <th className="py-3.5 px-4 font-medium text-slate-300">Телефон</th>
                <th className="py-3.5 px-4 font-medium text-slate-300">E-mail</th>
                <th className="py-3.5 px-4 font-medium text-slate-300 whitespace-nowrap">
                  Д.р.
                </th>
                <th className="py-3.5 px-4 font-medium text-slate-300">Услуг</th>
                <th className="py-3.5 px-4 font-medium text-slate-300">Заявок</th>
                <th className="py-3.5 px-4 font-medium text-slate-300 w-[200px]">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-t [&>tr]:border-white/8">
              {masters.map((m, index) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  className="align-top"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-[14px]">{m.name}</div>
                    {m.bio && (
                      <div className="opacity-60 text-[12.5px] line-clamp-1">
                        {m.bio}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-200">{m.phone ?? '—'}</td>
                  <td className="py-3 px-4 text-slate-200">{m.email ?? '—'}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {m.birthDate ?? '—'}
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
                        className="btn-glass inline-flex items-center gap-2 text-xs px-3 py-1.5 hover:scale-105 active:scale-95 transition-transform"
                      >
                        <Eye className="h-4 w-4 text-sky-300" />
                        Открыть
                      </Link>

                      <form
                        action={async (fd) => {
                          fd.set('id', m.id);
                          await deleteMaster(fd);
                        }}
                      >
                        <button
                          type="submit"
                          className="btn-glass inline-flex items-center gap-2 text-xs px-3 py-1.5 text-rose-200 border-rose-400/30 hover:bg-rose-500/10 hover:scale-105 active:scale-95 transition-all"
                          onClick={(e) => {
                            if (
                              !confirm(
                                `Удалить мастера "${m.name}"? Это действие необратимо.`
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-rose-300" />
                          Удалить
                        </button>
                      </form>
                    </div>
                  </td>
                </motion.tr>
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
      </motion.div>
    </>
  );
}
