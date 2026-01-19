// src/app/admin/masters/[id]/MasterEditClient.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  FolderTree,
  Layers,
  User2,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Camera,
  Upload,
  X,
  Trash2,
} from "lucide-react";
import { IconGlow } from "@/components/admin/IconGlow";
import AvatarUploader from "./AvatarUploader";
import ResponsiveHoursFields from "./ResponsiveHoursFields";
import { MasterAccessCardClient } from "../_components/MasterAccessCardClient";
import { useState } from "react";

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

const coll = new Intl.Collator("ru", { sensitivity: "base" });

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

type RenderTreeProps = {
  node: NodeT;
  chosen: Set<string>;
  depth?: number;
};

function RenderTree({ node, chosen, depth = 0 }: RenderTreeProps) {
  const idt = depth * 1.5;
  const isLeaf = node.children.length === 0;

  return (
    <div key={node.id} className="space-y-2">
      <label
        className={`
          flex items-center gap-3 p-2.5 rounded-lg
          ${depth === 0 ? "card-glass card-glass-accent" : "hover:bg-white/5"}
          cursor-pointer transition-colors group
        `}
        style={{ paddingLeft: `${idt + 0.625}rem` }}
      >
        {isLeaf ? (
          <input
            type="checkbox"
            name="serviceId"
            value={node.id}
            defaultChecked={chosen.has(node.id)}
            className="accent-emerald-500 rounded transition-transform group-hover:scale-110"
          />
        ) : (
          <Layers className="h-4 w-4 text-violet-400" />
        )}
        <span className={depth === 0 ? "font-medium" : "text-sm"}>
          {node.name}
        </span>
        {node.children.length > 0 && (
          <ChevronRight className="h-4 w-4 text-slate-500 ml-auto group-hover:text-slate-300 transition-colors" />
        )}
      </label>
      {node.children.map((c) => (
        <RenderTree key={c.id} node={c} chosen={chosen} depth={depth + 1} />
      ))}
    </div>
  );
}

function mmToTime(m: number): string {
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

type Props = {
  master: Master;
  allServices: ReadonlyArray<Service>;
  chosenServiceIds: string[];
  dayRows: DayRow[]; // Изменено с ReadonlyArray<DayRow> на DayRow[]
  tab: string;
  saved: boolean;
  actions: Actions;
};

const tabBase =
  "px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap";
const tabActive =
  "bg-gradient-to-r from-sky-500/20 to-violet-500/20 text-white border border-sky-500/30 shadow-lg";

const tabVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export function MasterEditClient({
  master,
  allServices,
  chosenServiceIds,
  dayRows,
  tab,
  saved,
  actions,
}: Props) {
  const chosenSet = new Set(chosenServiceIds);
  const selectedCount = chosenServiceIds.length;

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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 overflow-x-auto pb-2"
      >
        <Link
          href="?tab=profile"
          className={`${tabBase} ${
            tab === "profile" ? tabActive : "btn-glass"
          }`}
        >
          <span className="inline sm:hidden">👤 Профиль</span>
          <span className="hidden sm:inline">Профиль</span>
        </Link>

        <Link
          href="?tab=services"
          className={`${tabBase} ${
            tab === "services" ? tabActive : "btn-glass"
          }`}
        >
          <span className="inline sm:hidden">📋 Услуги</span>
          <span className="hidden sm:inline">Категории и услуги</span>
        </Link>

        <Link
          href="?tab=schedule"
          className={`${tabBase} ${
            tab === "schedule" ? tabActive : "btn-glass"
          }`}
        >
          <span className="inline sm:hidden">📅 Календарь</span>
          <span className="hidden sm:inline">Календарь</span>
        </Link>
      </motion.div>

      {/* Адаптивные табы
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 overflow-x-auto pb-2"
      >
        <Link
          href="?tab=profile"
          className={`${tabBase} ${tab === 'profile' ? tabActive : 'btn-glass'}`}
        >
          <span className="hidden sm:inline">Профиль</span>
          <span className="sm:hidden">👤</span>
        </Link>
        <Link
          href="?tab=services"
          className={`${tabBase} ${tab === 'services' ? tabActive : 'btn-glass'}`}
        >
          <span className="hidden sm:inline">Категории и услуги</span>
          <span className="sm:hidden">📋</span>
        </Link>
        <Link
          href="?tab=schedule"
          className={`${tabBase} ${tab === 'schedule' ? tabActive : 'btn-glass'}`}
        >
          <span className="hidden sm:inline">Календарь</span>
          <span className="sm:hidden">📅</span>
        </Link>
      </motion.div> */}

      <AnimatePresence mode="wait">
        {tab === "profile" && (
          <motion.section
            key="profile"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Адаптивный grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Левая колонка - Аватар на мобильных / Desktop */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="card-glass card-glass-accent card-glow p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Camera className="w-5 h-5 text-amber-500" />
                    Аватар
                  </h2>

                  {/* Avatar Preview */}
                  <div className="relative">
                    <div className="relative w-full aspect-square max-w-xs mx-auto lg:max-w-none rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-amber-500/20">
                      {master.avatarUrl ? (
                        <img
                          src={master.avatarUrl}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <User className="w-20 h-20 text-slate-600" />
                        </div>
                      )}

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>

                  {/* Upload Button */}
                  <AvatarUploader
                    masterId={master.id}
                    action={actions.uploadAvatar}
                  />

                  {/* Remove Avatar Button */}
                  {master.avatarUrl && (
                    <form action={actions.removeAvatar}>
                      <input type="hidden" name="id" value={master.id} />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 hover:from-red-500/20 hover:to-red-600/20 rounded-xl flex items-center justify-center gap-2 transition-all text-red-300 hover:text-red-200"
                      >
                        <X className="w-4 h-4" />
                        Удалить аватар
                      </motion.button>
                    </form>
                  )}

                  {/* Metadata */}
                  <div className="pt-6 border-t border-slate-700/50 space-y-2 text-sm">
                    <p className="text-slate-400">
                      Создан:{" "}
                      <span className="text-white">{master.createdAt}</span>
                    </p>
                    <p className="text-slate-400">
                      Обновлён:{" "}
                      <span className="text-white">{master.updatedAt}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Правая колонка - Форма */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <div className="card-glass card-glass-accent card-glow p-4 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-500" />
                    Личные данные
                  </h2>

                  <form action={actions.updateMaster} className="space-y-6">
                    <input type="hidden" name="id" value={master.id} />

                    {/* Name Field */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Имя
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          name="name"
                          defaultValue={master.name}
                          className="input-glass pl-12"
                          required
                          placeholder="Введите имя"
                        />
                      </div>
                    </div>

                    {/* Email and Phone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Email Field */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          E-mail
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            defaultValue={master.email ?? ""}
                            className="input-glass pl-12"
                            placeholder="example@mail.com"
                          />
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div className="relative">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Телефон
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            name="phone"
                            defaultValue={master.phone ?? ""}
                            className="input-glass pl-12"
                            placeholder="+7 (999) 999-99-99"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Birth Date Field */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Дата рождения
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          name="birthDate"
                          defaultValue={master.birthDate ?? ""}
                          className="input-glass pl-12 [color-scheme:dark]"
                          required
                        />
                      </div>
                    </div>

                    {/* About Field */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        О себе
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <textarea
                          name="bio"
                          defaultValue={master.bio ?? ""}
                          className="input-glass min-h-28 pl-12 resize-none"
                          placeholder="Расскажите о себе..."
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 btn-gradient-emerald rounded-xl px-6 py-3 text-sm font-medium transition-transform"
                        name="intent"
                        value="save_stay"
                      >
                        Сохранить
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 btn-glass inline-flex items-center justify-center gap-2 text-sm px-5 py-3 transition-transform"
                        name="intent"
                        value="save_close"
                      >
                        Сохранить и выйти
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Master Access Card - Below form on mobile, integrated on desktop */}
                <div className="mt-6">
                  <MasterAccessCardClient
                    masterId={master.id}
                    hasLogin={master.hasLogin}
                    email={master.userEmail}
                    action={actions.changeMasterPassword}
                  />
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {tab === "services" && (
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

        {tab === "schedule" && (
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-sky-400" />
                  Рабочий график
                </h2>
                <span className="text-xs opacity-70">
                  Отметьте выходной или укажите время
                </span>
              </div>

              <form
                action={actions.setMasterWorkingHours}
                className="space-y-3"
              >
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

            {/* Адаптивный раздел исключений */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-amber-400" />
                Исключения
              </h3>

              {/* Форма добавления - всегда на полную ширину */}
              <div className="card-glass card-glass-accent p-4 sm:p-6 space-y-4 bg-gradient-to-br from-white/5 to-transparent">
                <h4 className="font-medium flex items-center gap-2 text-amber-300">
                  <CalendarDays className="h-4 w-4" />
                  Добавить исключение
                </h4>
                <form action={actions.addTimeOff} className="space-y-4">
                  <input type="hidden" name="id" value={master.id} />

                  {/* Даты */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">
                        Дата с
                      </label>
                      <input
                        type="date"
                        name="to-date-start"
                        className="input-glass [color-scheme:dark]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">
                        Дата по (вкл.)
                      </label>
                      <input
                        type="date"
                        name="to-date-end"
                        className="input-glass [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="to-closed"
                      className="accent-emerald-500 w-4 h-4"
                    />
                    <span className="text-sm text-slate-300">
                      Целый день (выходной)
                    </span>
                  </label>

                  {/* Время */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">
                        Начало (если не целый день)
                      </label>
                      <input
                        type="time"
                        name="to-start"
                        className="input-glass [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-2">
                        Конец
                      </label>
                      <input
                        type="time"
                        name="to-end"
                        className="input-glass [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Причина */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Причина
                    </label>
                    <input
                      name="to-reason"
                      placeholder="например: отпуск, обучение, тех.работы…"
                      className="input-glass"
                    />
                  </div>

                  {/* Кнопка добавления */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto btn-gradient-emerald rounded-xl px-6 py-2.5 text-sm transition-transform"
                  >
                    Добавить
                  </motion.button>
                </form>
              </div>

              {/* Список исключений - адаптивный */}
              <div className="card-glass card-glass-accent p-4 sm:p-6 space-y-4">
                <h4 className="font-medium">Список исключений</h4>

                {master.timeOff.length === 0 ? (
                  <div className="text-sm text-slate-400 py-8 text-center">
                    Нет исключений
                  </div>
                ) : (
                  <>
                    {/* Desktop - Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="table-glass w-full">
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
                                  ? "Целый день"
                                  : `${mmToTime(t.startMinutes)} — ${mmToTime(
                                      t.endMinutes
                                    )}`}
                              </td>
                              <td className="py-2 pr-3">{t.reason ?? "—"}</td>
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
                                    className="btn-glass inline-flex items-center gap-2 text-xs px-3 py-1.5 text-rose-200 border-rose-400/30 hover:bg-rose-500/10 transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Удалить
                                  </motion.button>
                                </form>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile - Cards */}
                    <div className="md:hidden space-y-3">
                      {master.timeOff.map((t) => (
                        <div
                          key={t.id}
                          className="card-glass p-4 space-y-3 border border-white/10"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-2 flex-1">
                              <div>
                                <div className="text-xs text-slate-400">
                                  Дата
                                </div>
                                <div className="text-white font-medium">
                                  {t.date}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-slate-400">
                                  Интервал
                                </div>
                                <div className="text-white">
                                  {t.startMinutes === 0 && t.endMinutes === 1440
                                    ? "Целый день"
                                    : `${mmToTime(t.startMinutes)} — ${mmToTime(
                                        t.endMinutes
                                      )}`}
                                </div>
                              </div>
                              {t.reason && (
                                <div>
                                  <div className="text-xs text-slate-400">
                                    Причина
                                  </div>
                                  <div className="text-white">{t.reason}</div>
                                </div>
                              )}
                            </div>
                          </div>
                          <form action={actions.removeTimeOff}>
                            <input type="hidden" name="id" value={master.id} />
                            <input
                              type="hidden"
                              name="timeOffId"
                              value={t.id}
                            />
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full btn-glass flex items-center justify-center gap-2 text-sm px-4 py-2.5 text-rose-200 border-rose-400/30 hover:bg-rose-500/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                              Удалить исключение
                            </motion.button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

// // src/app/admin/masters/[id]/MasterEditClient.tsx
// 'use client';

// import { motion, AnimatePresence } from 'framer-motion';
// import Link from 'next/link';
// import {
//   CalendarDays,
//   ChevronRight,
//   FolderTree,
//   Layers,
//   User2,
// } from 'lucide-react';
// import { IconGlow } from '@/components/admin/IconGlow';
// import AvatarUploader from './AvatarUploader';
// import ResponsiveHoursFields from './ResponsiveHoursFields';
// import { MasterAccessCardClient } from '../_components/MasterAccessCardClient';
// import { useState } from 'react';

// type Service = {
//   id: string;
//   name: string;
//   parentId: string | null;
// };

// type DayRow = {
//   value: number;
//   full: string;
//   isClosed: boolean;
//   start: number;
//   end: number;
// };

// type TimeOff = {
//   id: string;
//   date: string;
//   startMinutes: number;
//   endMinutes: number;
//   reason: string | null;
// };

// type Master = {
//   id: string;
//   name: string;
//   email: string | null;
//   phone: string | null;
//   birthDate: string | null;
//   bio: string | null;
//   avatarUrl: string | null;
//   createdAt: string;
//   updatedAt: string;
//   timeOff: TimeOff[];
//   hasLogin: boolean;
//   userEmail: string | null;
// };

// type Actions = {
//   updateMaster: (formData: FormData) => void;
//   setMasterServices: (formData: FormData) => void;
//   setMasterWorkingHours: (formData: FormData) => void;
//   addTimeOff: (formData: FormData) => void;
//   removeTimeOff: (formData: FormData) => void;
//   uploadAvatar: (formData: FormData) => void;
//   removeAvatar: (formData: FormData) => void;
//   changeMasterPassword: (formData: FormData) => void;
// };

// type NodeT = {
//   id: string;
//   name: string;
//   parentId: string | null;
//   children: NodeT[];
// };

// const coll = new Intl.Collator('ru', { sensitivity: 'base' });

// function buildTree(items: ReadonlyArray<Service>): NodeT[] {
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

// function RenderTree({
//   node,
//   chosen,
//   level = 0,
// }: {
//   node: NodeT;
//   chosen: Set<string>;
//   level?: number;
// }) {
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

// function mmToTime(mm: number | null | undefined): string {
//   const v = typeof mm === 'number' && Number.isFinite(mm) ? mm : 0;
//   const h = Math.floor(v / 60);
//   const m = v % 60;
//   const pad = (n: number) => String(n).padStart(2, '0');
//   return `${pad(h)}:${pad(m)}`;
// }

// const tabVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0 },
//   exit: { opacity: 0, y: -20 },
// };

// export function MasterEditClient({
//   master,
//   allServices,
//   chosenServiceIds,
//   dayRows,
//   tab,
//   saved,
//   actions,
// }: {
//   master: Master;
//   allServices: Service[];
//   chosenServiceIds: string[];
//   dayRows: DayRow[];
//   tab: string;
//   saved: boolean;
//   actions: Actions;
// }) {
//   const chosenSet = new Set(chosenServiceIds);
//   const selectedCount = chosenSet.size;

//   const tabBase =
//     'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border border-white/10 bg-white/5 hover:bg-white/10 transition';
//   const tabActive =
//     'bg-gradient-to-r from-fuchsia-500/20 via-violet-500/20 to-sky-500/20 border-white/20 text-white';

//   return (
//     <>
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="card-glass card-glass-accent card-glow"
//       >
//         <div className="gradient-bg-radial" />
//         <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 sm:p-6">
//           <div className="flex items-center gap-3">
//             <IconGlow tone="sky" className="icon-glow-lg">
//               <User2 className="h-6 w-6 text-sky-200" />
//             </IconGlow>
//             <div>
//               <h1 className="text-xl sm:text-2xl font-semibold text-white">
//                 Сотрудник: {master.name}
//               </h1>
//               <p className="text-sm text-slate-400 mt-0.5">
//                 Профиль, услуги и расписание мастера
//               </p>
//             </div>
//           </div>

//           <Link
//             href="/admin/masters"
//             className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95 transition-transform"
//           >
//             ← К списку
//           </Link>
//         </div>
//       </motion.div>

//       <AnimatePresence>
//         {saved && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             className="card-glass border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 px-4 py-3 text-sm"
//           >
//             Сохранено.
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Табы */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 0.1 }}
//         className="flex flex-wrap gap-2"
//       >
//         <Link
//           href="?tab=profile"
//           className={`${tabBase} ${tab === 'profile' ? tabActive : ''}`}
//         >
//           Профиль
//         </Link>
//         <Link
//           href="?tab=services"
//           className={`${tabBase} ${tab === 'services' ? tabActive : ''}`}
//         >
//           Категории и услуги
//         </Link>
//         <Link
//           href="?tab=schedule"
//           className={`${tabBase} ${tab === 'schedule' ? tabActive : ''}`}
//         >
//           Календарь
//         </Link>
//       </motion.div>

//       <AnimatePresence mode="wait">
//         {tab === 'profile' && (
//           <motion.section
//             key="profile"
//             variants={tabVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             transition={{ duration: 0.3 }}
//             className="card-glass card-glass-accent card-glow p-4 sm:p-6 space-y-6"
//           >
//             <div className="grid lg:grid-cols-3 gap-6">
//               {/* Форма профиля */}
//               <form action={actions.updateMaster} className="space-y-4 lg:col-span-2">
//                 <input type="hidden" name="id" value={master.id} />
//                 <div>
//                   <div className="text-sm text-slate-400 mb-2">Имя</div>
//                   <input
//                     name="name"
//                     defaultValue={master.name}
//                     className="input-glass"
//                     required
//                   />
//                 </div>
//                 <div className="grid sm:grid-cols-2 gap-4">
//                   <div>
//                     <div className="text-sm text-slate-400 mb-2">E-mail</div>
//                     <input
//                       type="email"
//                       name="email"
//                       defaultValue={master.email ?? ''}
//                       className="input-glass"
//                     />
//                   </div>
//                   <div>
//                     <div className="text-sm text-slate-400 mb-2">Телефон</div>
//                     <input
//                       name="phone"
//                       defaultValue={master.phone ?? ''}
//                       className="input-glass"
//                     />
//                   </div>
//                   <div>
//                     <div className="text-sm text-slate-400 mb-2">Дата рождения</div>
//                     <input
//                       type="date"
//                       name="birthDate"
//                       defaultValue={master.birthDate ?? ''}
//                       className="input-glass"
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-sm text-slate-400 mb-2">О себе</div>
//                   <textarea
//                     name="bio"
//                     defaultValue={master.bio ?? ''}
//                     className="input-glass min-h-28"
//                   />
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     className="btn-gradient-emerald rounded-xl px-6 py-2.5 text-sm transition-transform"
//                     name="intent"
//                     value="save_stay"
//                   >
//                     Сохранить
//                   </motion.button>
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     className="btn-glass inline-flex items-center gap-2 text-sm px-5 py-2.5 transition-transform"
//                     name="intent"
//                     value="save_close"
//                   >
//                     Сохранить и выйти
//                   </motion.button>
//                 </div>
//               </form>

//               {/* Правая колонка */}
//               <div className="space-y-6">
//                 {/* Аватар */}
//                 <div className="space-y-3">
//                   <div className="text-sm text-slate-300">Аватар</div>
//                   <div className="card-glass card-glass-accent p-3 space-y-3">
//                     {master.avatarUrl ? (
//                       <img
//                         src={master.avatarUrl}
//                         alt="avatar"
//                         className="block w-40 h-40 object-cover rounded-xl ring-1 ring-white/10"
//                       />
//                     ) : (
//                       <div className="w-40 h-40 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-500">
//                         нет фото
//                       </div>
//                     )}

//                     <AvatarUploader masterId={master.id} action={actions.uploadAvatar} />

//                     {master.avatarUrl && (
//                       <form action={actions.removeAvatar}>
//                         <input type="hidden" name="id" value={master.id} />
//                         <motion.button
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                           className="btn-glass inline-flex items-center gap-2 text-sm px-4 py-2 text-rose-200 border-rose-400/30 hover:bg-rose-500/10 transition-all"
//                         >
//                           Удалить
//                         </motion.button>
//                       </form>
//                     )}
//                   </div>

//                   <div className="text-xs text-slate-400">
//                     Создан: {master.createdAt}
//                     <br />
//                     Обновлён: {master.updatedAt}
//                   </div>
//                 </div>

//                 <MasterAccessCardClient
//                   masterId={master.id}
//                   hasLogin={master.hasLogin}
//                   email={master.userEmail}
//                   action={actions.changeMasterPassword}
//                 />
//               </div>
//             </div>
//           </motion.section>
//         )}

//         {tab === 'services' && (
//           <motion.section
//             key="services"
//             variants={tabVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             transition={{ duration: 0.3 }}
//             className="card-glass card-glass-accent card-glow p-4 sm:p-6 space-y-4"
//           >
//             <div className="flex items-center justify-between">
//               <h2 className="text-lg font-semibold flex items-center gap-2">
//                 <FolderTree className="h-5 w-5 text-violet-400" />
//                 Услуги мастера
//               </h2>
//               <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs">
//                 Выбрано: <b className="font-semibold">{selectedCount}</b>
//               </span>
//             </div>

//             {(() => {
//               const tree = buildTree(allServices);

//               return (
//                 <form action={actions.setMasterServices} className="space-y-4">
//                   <input type="hidden" name="id" value={master.id} />

//                   <div className="grid gap-3">
//                     {tree.map((n) => (
//                       <RenderTree key={n.id} node={n} chosen={chosenSet} />
//                     ))}
//                   </div>

//                   <div className="pt-2 flex flex-wrap gap-2">
//                     <motion.button
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       className="btn-gradient-emerald rounded-xl px-6 py-2.5 text-sm transition-transform"
//                       name="intent"
//                       value="save_stay"
//                     >
//                       Сохранить
//                     </motion.button>
//                     <motion.button
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       className="btn-glass inline-flex items-center gap-2 text-sm px-5 py-2.5 transition-transform"
//                       name="intent"
//                       value="save_close"
//                     >
//                       Сохранить и выйти
//                     </motion.button>
//                   </div>
//                 </form>
//               );
//             })()}
//           </motion.section>
//         )}

//         {tab === 'schedule' && (
//           <motion.section
//             key="schedule"
//             variants={tabVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//             transition={{ duration: 0.3 }}
//             className="card-glass card-glass-accent card-glow p-4 sm:p-6 space-y-8"
//           >
//             {/* Рабочий график */}
//             <div>
//               <div className="flex items-center justify-between mb-3">
//                 <h2 className="text-lg font-semibold flex items-center gap-2">
//                   <CalendarDays className="h-5 w-5 text-sky-400" />
//                   Рабочий график
//                 </h2>
//                 <span className="text-xs opacity-70 hidden sm:block">
//                   Отметьте выходной или укажите время
//                 </span>
//               </div>

//               <form action={actions.setMasterWorkingHours} className="space-y-3">
//                 <input type="hidden" name="id" value={master.id} />

//                 <ResponsiveHoursFields days={dayRows} />

//                 <div className="flex flex-wrap gap-2">
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     className="btn-gradient-emerald rounded-xl px-6 py-2.5 text-sm transition-transform"
//                     name="intent"
//                     value="save_stay"
//                   >
//                     Сохранить график
//                   </motion.button>
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     className="btn-glass inline-flex items-center gap-2 text-sm px-5 py-2.5 transition-transform"
//                     name="intent"
//                     value="save_close"
//                   >
//                     Сохранить и выйти
//                   </motion.button>
//                 </div>
//               </form>
//             </div>

//             {/* Исключения */}
//             <div className="grid lg:grid-cols-2 gap-6">
//               {/* Форма добавления */}
//               <div className="card-glass card-glass-accent p-4 space-y-3 bg-gradient-to-br from-white/5 to-transparent">
//                 <h3 className="font-medium flex items-center gap-2">
//                   <CalendarDays className="h-4 w-4 text-amber-300" />
//                   Добавить исключение
//                 </h3>
//                 <form action={actions.addTimeOff} className="space-y-3">
//                   <input type="hidden" name="id" value={master.id} />
//                   <div className="grid sm:grid-cols-2 gap-3">
//                     <div>
//                       <div className="text-xs text-slate-400 mb-2">Дата с</div>
//                       <input
//                         type="date"
//                         name="to-date-start"
//                         className="input-glass"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <div className="text-xs text-slate-400 mb-2">
//                         Дата по (вкл.)
//                       </div>
//                       <input
//                         type="date"
//                         name="to-date-end"
//                         className="input-glass"
//                       />
//                     </div>
//                   </div>

//                   <label className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       name="to-closed"
//                       className="accent-emerald-500"
//                     />
//                     <span className="text-sm text-slate-300">
//                       Целый день (выходной)
//                     </span>
//                   </label>

//                   <div className="grid sm:grid-cols-2 gap-3">
//                     <div>
//                       <div className="text-xs text-slate-400 mb-2">
//                         Начало (если не целый день)
//                       </div>
//                       <input
//                         type="time"
//                         name="to-start"
//                         className="input-glass"
//                       />
//                     </div>
//                     <div>
//                       <div className="text-xs text-slate-400 mb-2">Конец</div>
//                       <input type="time" name="to-end" className="input-glass" />
//                     </div>
//                   </div>

//                   <div>
//                     <div className="text-xs text-slate-400 mb-2">Причина</div>
//                     <input
//                       name="to-reason"
//                       placeholder="например: отпуск, обучение, тех.работы…"
//                       className="input-glass"
//                     />
//                   </div>

//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     className="btn-gradient-emerald rounded-xl px-6 py-2.5 text-sm transition-transform"
//                   >
//                     Добавить
//                   </motion.button>
//                 </form>
//               </div>

//               {/* Таблица исключений */}
//               <div className="rounded-2xl border border-white/10 p-4 space-y-3">
//                 <h3 className="font-medium">Исключения</h3>
//                 {master.timeOff.length === 0 ? (
//                   <div className="text-sm text-slate-400">Нет исключений</div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="table-glass min-w-[640px]">
//                       <thead className="text-left">
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
//                             <td className="py-2 pr-3">{t.date}</td>
//                             <td className="py-2 pr-3">
//                               {t.startMinutes === 0 && t.endMinutes === 1440
//                                 ? 'Целый день'
//                                 : `${mmToTime(t.startMinutes)} — ${mmToTime(
//                                     t.endMinutes
//                                   )}`}
//                             </td>
//                             <td className="py-2 pr-3">{t.reason ?? '—'}</td>
//                             <td className="py-2 pr-3">
//                               <form action={actions.removeTimeOff}>
//                                 <input
//                                   type="hidden"
//                                   name="id"
//                                   value={master.id}
//                                 />
//                                 <input
//                                   type="hidden"
//                                   name="timeOffId"
//                                   value={t.id}
//                                 />
//                                 <motion.button
//                                   whileHover={{ scale: 1.05 }}
//                                   whileTap={{ scale: 0.95 }}
//                                   className="btn-glass inline-flex items-center gap-2 text-sm px-4 py-2 text-rose-200 border-rose-400/30 hover:bg-rose-500/10 transition-all"
//                                 >
//                                   Удалить
//                                 </motion.button>
//                               </form>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </motion.section>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }
