// src/app/admin/masters/new/NewMasterFormClient.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { IconGlow } from '@/components/admin/IconGlow';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function NewMasterFormClient({
  errorText,
  action,
}: {
  errorText: string | null;
  action: (formData: FormData) => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass card-glass-accent card-glow"
      >
        <div className="gradient-bg-radial" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <IconGlow tone="fuchsia" className="icon-glow-lg">
              <UserPlus className="h-6 w-6 text-fuchsia-200" />
            </IconGlow>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">
                Новый сотрудник
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Создание профиля мастера
              </p>
            </div>
          </div>

          <Link
            href="/admin/masters"
            className="btn-glass inline-flex items-center gap-2 text-sm hover:scale-105 active:scale-95 transition-transform"
          >
            ← Назад
          </Link>
        </div>
      </motion.div>

      {errorText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-glass border border-rose-500/30 bg-rose-500/10 text-rose-200 px-4 py-3 text-sm"
        >
          {errorText}
        </motion.div>
      )}

      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="card-glass card-glass-accent card-glow p-4 sm:p-6"
      >
        <form action={action} className="space-y-4">
          <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-400">Имя</span>
              <input
                name="name"
                required
                minLength={2}
                maxLength={100}
                className="input-glass"
                placeholder="Иван Иванов"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-400">Телефон</span>
              <input
                name="phone"
                required
                className="input-glass"
                placeholder="+49 123 4567"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-400">E-mail</span>
              <input
                name="email"
                type="email"
                required
                className="input-glass"
                placeholder="name@example.com"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-400">Дата рождения</span>
              <input
                name="birthDate"
                type="date"
                required
                className="input-glass"
              />
            </label>
          </motion.div>

          <motion.label variants={item} className="grid gap-2">
            <span className="text-sm text-slate-400">Короткое описание</span>
            <textarea
              name="bio"
              rows={4}
              maxLength={500}
              className="input-glass min-h-28"
              placeholder="Опыт, специализация и т.п."
            />
          </motion.label>

          <motion.div variants={item} className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="btn-gradient-emerald rounded-xl px-6 py-2.5 text-sm hover:scale-105 active:scale-95 transition-transform"
            >
              Сохранить
            </button>
            <Link
              href="/admin/masters"
              className="btn-glass inline-flex items-center gap-2 text-sm px-5 py-2.5 hover:scale-105 active:scale-95 transition-transform"
            >
              Отмена
            </Link>
          </motion.div>
        </form>
      </motion.section>
    </>
  );
}
