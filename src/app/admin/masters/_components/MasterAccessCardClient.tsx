// src/app/admin/masters/_components/MasterAccessCardClient.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, Mail, User2, KeyRound, Link2 } from 'lucide-react';

export function MasterAccessCardClient({
  masterId,
  hasLogin,
  email,
  action,
}: {
  masterId: string;
  hasLogin: boolean;
  email: string | null;
  action: (formData: FormData) => Promise<void> | void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass card-glass-accent p-4 space-y-4"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Доступ к панели</h3>
      </div>

      {!hasLogin ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200"
        >
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4" />
            У мастера нет привязанного логина.
          </div>
          <div className="mt-2 text-sm text-amber-200/80">
            Создайте пользователя и привяжите его на странице{' '}
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-200 transition-colors"
            >
              Пользователи
              <Link2 className="h-4 w-4" />
            </Link>
            .
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-400" />
              <div className="text-sm text-slate-200">
                Привязанный логин: <b>{email ?? '—'}</b>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            action={action}
            className="rounded-xl border border-white/10 bg-white/5 p-3 flex flex-wrap items-center gap-3"
          >
            <input type="hidden" name="masterId" value={masterId} />
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-violet-400" />
              <label className="text-sm text-slate-300">Новый пароль</label>
            </div>
            <input
              type="password"
              name="password"
              minLength={6}
              required
              placeholder="не короче 6 символов"
              className="input-glass w-full sm:w-64 px-3 py-1.5 text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-glass inline-flex items-center gap-2 text-sm px-4 py-2 transition-transform"
            >
              Обновить
            </motion.button>
          </motion.form>
        </motion.div>
      )}
    </motion.section>
  );
}
