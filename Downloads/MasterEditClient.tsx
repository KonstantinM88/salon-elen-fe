// src/app/admin/masters/[id]/MasterEditClient.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CalendarDays,
  ChevronRight,
  FolderTree,
  Layers,
  User2,
} from 'lucide-react';
import { IconGlow } from '@/components/admin/IconGlow';
import AvatarUploader from './AvatarUploader';
import ResponsiveHoursFields from './ResponsiveHoursFields';
import { MasterAccessCardClient } from '../_components/MasterAccessCardClient';
import { useState } from 'react';

type Service = {
  id: string;
  name: string;
  parentId: string | null;
};

type DayRow = {
  value: number;
  full: string;
  isClosed: boolean;
  start: number;
  end: number;
};

type TimeOff = {
  id: string;
  date: string;
  startMinutes: number;
  endMinutes: number;
  reason: string | null;
};

type Master = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  timeOff: TimeOff[];
  hasLogin: boolean;
  userEmail: string | null;
};

type Actions = {
  updateMaster: (formData: FormData) => void;
  setMasterServices: (formData: FormData) => void;
  setMasterWorkingHours: (formData: FormData) => void;
  addTimeOff: (formData: FormData) => void;
  removeTimeOff: (formData: FormData) => void;
  uploadAvatar: (formData: FormData) => void;
  removeAvatar: (formData: FormData) => void;
  changeMasterPassword: (formData: FormData) => void;
};

type NodeT = {
  id: string;
  name: string;
  parentId: string | null;
  children: NodeT[];
};

const coll = new Intl.Collator('ru', { sensitivity: 'base' });

function buildTree(items: ReadonlyArray<Service>): NodeT[] {
  const byId = new Map<string, NodeT>();
  const roots: NodeT[] = [];

  for (const s of items) {
    byId.set(s.id, {
      id: s.id,
      name: s.name,
      parentId: s.parentId,
      children: [],
    });
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

function RenderTree({
  node,
  chosen,
  level = 0,
}: {
  node: NodeT;
  chosen: Set<string>;
  level?: number;
}) {
  const isLeaf = node.children.length === 0;

  if (isLeaf) {
    return (
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 transition">
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

function mmToTime(mm: number | null | undefined): string {
  const v = typeof mm === 'number' && Number.isFinite(mm) ? mm : 0;
  const h = Math.floor(v / 60);
  const m = v % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function MasterEditClient({
  master,
  allServices,
  chosenServiceIds,
  dayRows,
  tab,
  saved,
  actions,
}: {
  master: Master;
  allServices: Service[];
  chosenServiceIds: string[];
  dayRows: DayRow[];
  tab: string;
  saved: boolean;
  actions: Actions;
}) {
  const chosenSet = new Set(chosenServiceIds);
  const selectedCount = chosenSet.size;

  const tabBase =
    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border border-white/10 bg-white/5 hover:bg-white/10 transition';
  const tabActive =
    'bg-gradient-to-r from-fuchsia-500/20 via-violet-500/20 to-sky-500/20 border-white/20 text-white';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass card-glass-accent card-glow"
      >
        <div className="gradient-bg-radial" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <IconGlow tone="sky" className="icon-glow-lg">
              <User2 className="h-6 w-6 text-sky-200" />
            </IconGlow>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">
                Сотрудник: {master.name}
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Профиль, услуги и расписание мастера
              </p>
            </div>
          </div>

          <Link
            href="/admin/masters"
            className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95 transition-transform"
          >
            ← К списку
          </Link>
        </div>
      </motion.div>

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card-glass border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 px-4 py-3 text-sm"
          >
            Сохранено.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Табы */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <Link
          href="?tab=profile"
          className={`${tabBase} ${tab === 'profile' ? tabActive : ''}`}
        >
          Профиль
        </Link>
        <Link
          href="?tab=services"
          className={`${tabBase} ${tab === 'services' ? tabActive : ''}`}
        >
          Категории и услуги
        </Link>
        <Link
          href="?tab=schedule"
          className={`${tabBase} ${tab === 'schedule' ? tabActive : ''}`}
        >
          Календарь
        </Link>
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === 'profile' && (
          <motion.section
            key="profile"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="card-glass card-glass-accent card-glow p-4 sm:p-6 space-y-6"
          >
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Форма профиля */}
              <form action={actions.updateMaster} className="space-y-4 lg:col-span-2">
                <input type="hidden" name="id" value={master.id} />
                <div>
                  <div className="text-sm text-slate-400 mb-2">Имя</div>
                  <input
                    name="name"
                    defaultValue={master.name}
                    className="input-glass"
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-400 mb-2">E-mail</div>
                    <input
                      type="email"
                      name="email"
                      defaultValue={master.email ?? ''}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Телефон</div>
                    <input
                      name="phone"
                      defaultValue={master.phone ?? ''}
                      className="input-glass"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-2">Дата рождения</div>
                    <input
                      type="date"
                      name="birthDate"
                      defaultValue={master.birthDate ?? ''}
                      className="input-glass"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-2">О себе</div>
                  <textarea
                    name="bio"
                    defaultValue={master.bio ?? ''}
                    className="input-glass min-h-28"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-gradient-emerald rounded-xl px-6 py-2.5 text-sm transition-transform"
                    name="intent"
                    value="save_stay"
                  >
                    Сохранить
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-glass inline-flex items-center gap-2 text-sm px-5 py-2.5 transition-transform"
                    name="intent"
                    value="save_close"
                  >
                    Сохранить и выйти
                  </motion.button>
                </div>
              </form>

              {/* Правая колонка */}
              <div className="space-y-6">
                {/* Аватар */}
                <div className="space-y-3">
                  <div className="text-sm text-slate-300">Аватар</div>
                  <div className="card-glass card-glass-accent p-3 space-y-3">
                    {master.avatarUrl ? (
                      <img
                        src={master.avatarUrl}
                        alt="avatar"
                        className="block w-40 h-40 object-cover rounded-xl ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-500">
                        нет фото
                      </div>
                    )}

                    <AvatarUploader masterId={master.id} action={actions.uploadAvatar} />

                    {master.avatarUrl && (
                      <form action={actions.removeAvatar}>
                        <input type="hidden" name="id" value={master.id} />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn-glass inline-flex items-center gap-2 text-sm px-4 py-2 text-rose-200 border-rose-400/30 hover:bg-rose-500/10 transition-all"
                        >
                          Удалить
                        </motion.button>
                      </form>
                    )}
                  </div>

                  <div className="text-xs text-slate-400">
                    Создан: {master.createdAt}
                    <br />
                    Обновлён: {master.updatedAt}
                  </div>
                </div>

                <MasterAccessCardClient
                  masterId={master.id}
                  hasLogin={master.hasLogin}
                  email={master.userEmail}
                  action={actions.changeMasterPassword}
                />
              </div>
            </div>
          </motion.section>
        )}

        {tab === 'services' && (
          <motion.section
            key="services"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="card-glass card-glass-accent card-glow p-4 sm:p-6 space-y-4"
          >
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
              const tree = buildTree(allServices);

              return (
                <form action={actions.setMasterServices} className="space-y-4">
                  <input type="hidden" name="id" value={master.id} />

                  <div className="grid gap-3">
                    {tree.map((n) => (
                      <RenderTree key={n.id} node={n} chosen={chosenSet} />
                    ))}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-gradient-emerald rounded-xl px-6 py-2.5 text-sm transition-transform"
                      name="intent"
                      value="save_stay"
                    >
                      Сохранить
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-glass inline-flex items-center gap-2 text-sm px-5 py-2.5 transition-transform"
                      name="intent"
                      value="save_close"
                    >
                      Сохранить и выйти
                    </motion.button>
                  </div>
                </form>
              );
            })()}
          </motion.section>
        )}

        {tab === 'schedule' && (
          <motion.section
            key="schedule"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="card-glass card-glass-accent card-glow p-4 sm:p-6 space-y-8"
          >
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

              <form action={actions.setMasterWorkingHours} className="space-y-3">
                <input type="hidden" name="id" value={master.id} />

                <ResponsiveHoursFields days={dayRows} />

                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-gradient-emerald rounded-xl px-6 py-2.5 text-sm transition-transform"
                    name="intent"
                    value="save_stay"
                  >
                    Сохранить график
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-glass inline-flex items-center gap-2 text-sm px-5 py-2.5 transition-transform"
                    name="intent"
                    value="save_close"
                  >
                    Сохранить и выйти
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Исключения */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Форма добавления */}
              <div className="card-glass card-glass-accent p-4 space-y-3 bg-gradient-to-br from-white/5 to-transparent">
                <h3 className="font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-amber-300" />
                  Добавить исключение
                </h3>
                <form action={actions.addTimeOff} className="space-y-3">
                  <input type="hidden" name="id" value={master.id} />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-400 mb-2">Дата с</div>
                      <input
                        type="date"
                        name="to-date-start"
                        className="input-glass"
                        required
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-2">
                        Дата по (вкл.)
                      </div>
                      <input
                        type="date"
                        name="to-date-end"
                        className="input-glass"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="to-closed"
                      className="accent-emerald-500"
                    />
                    <span className="text-sm text-slate-300">
                      Целый день (выходной)
                    </span>
                  </label>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-400 mb-2">
                        Начало (если не целый день)
                      </div>
                      <input
                        type="time"
                        name="to-start"
                        className="input-glass"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-2">Конец</div>
                      <input type="time" name="to-end" className="input-glass" />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 mb-2">Причина</div>
                    <input
                      name="to-reason"
                      placeholder="например: отпуск, обучение, тех.работы…"
                      className="input-glass"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-gradient-emerald rounded-xl px-6 py-2.5 text-sm transition-transform"
                  >
                    Добавить
                  </motion.button>
                </form>
              </div>

              {/* Таблица исключений */}
              <div className="rounded-2xl border border-white/10 p-4 space-y-3">
                <h3 className="font-medium">Исключения</h3>
                {master.timeOff.length === 0 ? (
                  <div className="text-sm text-slate-400">Нет исключений</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table-glass min-w-[640px]">
                      <thead className="text-left">
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
                            <td className="py-2 pr-3">{t.date}</td>
                            <td className="py-2 pr-3">
                              {t.startMinutes === 0 && t.endMinutes === 1440
                                ? 'Целый день'
                                : `${mmToTime(t.startMinutes)} — ${mmToTime(
                                    t.endMinutes
                                  )}`}
                            </td>
                            <td className="py-2 pr-3">{t.reason ?? '—'}</td>
                            <td className="py-2 pr-3">
                              <form action={actions.removeTimeOff}>
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
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="btn-glass inline-flex items-center gap-2 text-sm px-4 py-2 text-rose-200 border-rose-400/30 hover:bg-rose-500/10 transition-all"
                                >
                                  Удалить
                                </motion.button>
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
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
