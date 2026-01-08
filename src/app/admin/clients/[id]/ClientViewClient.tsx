'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteClientForm from './DeleteClientForm';
import { 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Edit2, 
  Save, 
  X, 
  MessageCircle,
  Send
} from 'lucide-react';
import { AppointmentStatus } from '@prisma/client';

// ✅ Правильные типы без any
type ServiceData = {
  id: string;
  slug: string;
  name: string;  // ✅ В Prisma поле называется 'name' (не title!)
  priceCents: number | null;
};

type MasterData = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

type AppointmentData = {
  id: string;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  service: ServiceData | null;
  master: MasterData | null;
};

type ClientData = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  birthDate: Date;
  referral: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  appointments: AppointmentData[];
};

type Props = {
  client: ClientData;
  visits: AppointmentData[];
  lastVisit: Date | null;
  totalVisits: number;
  totalSpent: number;
  avgVisitValue: number;
  editMode: boolean;
  hasError: boolean;
  submitUpdate: (formData: FormData) => Promise<void>;
};

export default function ClientViewClient({
  client,
  visits,
  lastVisit,
  totalVisits,
  totalSpent,
  avgVisitValue,
  editMode,
  hasError,
  submitUpdate,
}: Props) {
  const [isEditing, setIsEditing] = useState(editMode);

  // ✅ Функции форматирования перемещены В Client Component
  const fmtDate = (d: Date): string => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  };

  const fmtDateTime = (d: Date): string => {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const toInputDate = (d: Date | null | undefined): string => {
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'text-cyan-400';
      case AppointmentStatus.DONE:
        return 'text-emerald-400';
      case AppointmentStatus.CANCELED:
        return 'text-red-400';
      default:
        return 'text-amber-400';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'Подтверждён';
      case AppointmentStatus.DONE:
        return 'Завершён';
      case AppointmentStatus.CANCELED:
        return 'Отменён';
      default:
        return 'Ожидает';
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Link
              href="/admin/clients"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-2"
            >
              ← К списку клиентов
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {client.name}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400/50 transition-all"
              >
                <Edit2 size={16} />
                Редактировать
              </motion.button>
            )}
            <DeleteClientForm clientId={client.id} clientName={client.name} />
          </div>
        </div>

        {/* Stats Cards - Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Visits */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-cyan-400" size={24} />
              <div className="text-2xl font-bold text-white">{totalVisits}</div>
            </div>
            <div className="text-sm text-gray-400">Всего визитов</div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
          </motion.div>

          {/* Total Spent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-emerald-400" size={24} />
              <div className="text-2xl font-bold text-white">
                {formatCurrency(totalSpent)}
              </div>
            </div>
            <div className="text-sm text-gray-400">Потрачено всего</div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          </motion.div>

          {/* Avg Visit Value */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-purple-400" size={24} />
              <div className="text-2xl font-bold text-white">
                {formatCurrency(avgVisitValue)}
              </div>
            </div>
            <div className="text-sm text-gray-400">Средний чек</div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
          </motion.div>

          {/* Last Visit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-amber-400" size={24} />
              <div className="text-lg font-bold text-white">
                {lastVisit ? fmtDate(lastVisit) : '—'}
              </div>
            </div>
            <div className="text-sm text-gray-400">Последний визит</div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Contacts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 backdrop-blur-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
            
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="text-cyan-400" size={20} />
              Профиль
            </h2>

            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  action={submitUpdate}
                  className="space-y-4"
                >
                  <input type="hidden" name="id" value={client.id} />

                  {hasError && (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-200 text-sm">
                      Не удалось сохранить. Проверьте поля.
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Имя</label>
                    <input
                      name="name"
                      defaultValue={client.name ?? ""}
                      className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Телефон</label>
                    <input
                      name="phone"
                      defaultValue={client.phone ?? ""}
                      className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">E-mail</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={client.email ?? ""}
                      className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Дата рождения</label>
                    <input
                      type="date"
                      name="birthDate"
                      defaultValue={toInputDate(client.birthDate)}
                      className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Как узнали</label>
                    <input
                      name="referral"
                      defaultValue={client.referral ?? ""}
                      className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                      placeholder="Google / Instagram..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Заметки</label>
                    <textarea
                      name="notes"
                      defaultValue={client.notes ?? ""}
                      rows={3}
                      className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-400 hover:to-blue-400 transition-all"
                    >
                      <Save size={16} />
                      Сохранить
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-700 transition-colors"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <Phone size={14} />
                      Телефон
                    </div>
                    <div className="text-white">{client.phone}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <Mail size={14} />
                      E-mail
                    </div>
                    <div className="text-white">{client.email ?? "—"}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <Calendar size={14} />
                      Дата рождения
                    </div>
                    <div className="text-white">{fmtDate(client.birthDate)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">Как узнали</div>
                    <div className="text-white">{client.referral ?? "—"}</div>
                  </div>

                  {client.notes && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Заметки</div>
                      <div className="text-white whitespace-pre-wrap text-sm bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                        {client.notes}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-700/50 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Создан</span>
                      <span className="text-white">{fmtDateTime(client.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Обновлён</span>
                      <span className="text-white">{fmtDateTime(client.updatedAt)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Contact Actions Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 backdrop-blur-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full blur-3xl" />
            
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <MessageCircle className="text-emerald-400" size={20} />
              Контакты
            </h2>

            <div className="grid grid-cols-1 gap-2">
              <motion.a
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                href={`tel:${client.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-300 hover:border-cyan-400/50 transition-all"
              >
                <Phone size={18} />
                <span>Позвонить</span>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                href={`https://wa.me/${client.phone.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 text-emerald-300 hover:border-emerald-400/50 transition-all"
              >
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                href={`https://t.me/${client.phone.replace(/[^\d+]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-300 hover:border-blue-400/50 transition-all"
              >
                <Send size={18} />
                <span>Telegram</span>
              </motion.a>

              {client.email && (
                <motion.a
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-300 hover:border-purple-400/50 transition-all"
                >
                  <Mail size={18} />
                  <span>E-mail</span>
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Visits History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
          
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="text-purple-400" size={20} />
            История визитов
          </h2>

          {visits.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Пока нет подтверждённых или завершённых визитов
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {visits.map((visit, index) => (
                <motion.div
                  key={visit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-4 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-lg font-semibold text-white">
                          {visit.service?.name ?? "—"}
                        </div>
                        <div className={`text-sm ${getStatusColor(visit.status)}`}>
                          {getStatusLabel(visit.status)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {fmtDate(visit.startAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Intl.DateTimeFormat("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(visit.startAt)}
                          {" - "}
                          {new Intl.DateTimeFormat("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(visit.endAt)}
                        </div>
                        {visit.master && (
                          <div className="flex items-center gap-1">
                            {visit.master.avatarUrl ? (
                              <img
                                src={visit.master.avatarUrl}
                                alt={visit.master.name}
                                className="w-4 h-4 rounded-full"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
                            )}
                            {visit.master.name}
                          </div>
                        )}
                      </div>
                    </div>

                    {visit.service?.priceCents && (
                      <div className="text-xl font-bold text-cyan-400">
                        {formatCurrency(visit.service.priceCents)}
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </main>
  );
}




// //src/app/admin/clients/[id]/ClientViewClient.tsx
// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { motion, AnimatePresence } from 'framer-motion';
// import DeleteClientForm from './DeleteClientForm';
// import { 
//   Phone, 
//   Mail, 
//   Calendar, 
//   MapPin, 
//   TrendingUp, 
//   DollarSign, 
//   Clock, 
//   Edit2, 
//   Save, 
//   X, 
//   MessageCircle,
//   Send
// } from 'lucide-react';
// import { AppointmentStatus } from '@prisma/client';

// // ✅ Правильные типы без any
// type ServiceData = {
//   id: string;
//   slug: string;
//   title: string;
//   priceCents: number | null;
// };

// type MasterData = {
//   id: string;
//   name: string;
//   avatarUrl: string | null;
// };

// type AppointmentData = {
//   id: string;
//   startAt: Date;
//   endAt: Date;
//   status: AppointmentStatus;
//   service: ServiceData | null;
//   master: MasterData | null;
// };

// type ClientData = {
//   id: string;
//   name: string;
//   phone: string;
//   email: string | null;
//   birthDate: Date;
//   referral: string | null;
//   notes: string | null;
//   createdAt: Date;
//   updatedAt: Date;
//   appointments: AppointmentData[];
// };

// type Props = {
//   client: ClientData;
//   visits: AppointmentData[];
//   lastVisit: Date | null;
//   totalVisits: number;
//   totalSpent: number;
//   avgVisitValue: number;
//   editMode: boolean;
//   hasError: boolean;
//   submitUpdate: (formData: FormData) => Promise<void>;
//   fmtDate: (d: Date) => string;
//   fmtDateTime: (d: Date) => string;
//   toInputDate: (d: Date | null | undefined) => string;
// };

// export default function ClientViewClient({
//   client,
//   visits,
//   lastVisit,
//   totalVisits,
//   totalSpent,
//   avgVisitValue,
//   editMode,
//   hasError,
//   submitUpdate,
//   fmtDate,
//   fmtDateTime,
//   toInputDate,
// }: Props) {
//   const [isEditing, setIsEditing] = useState(editMode);

//   const formatCurrency = (cents: number) => {
//     return new Intl.NumberFormat('ru-RU', {
//       style: 'currency',
//       currency: 'EUR',
//     }).format(cents / 100);
//   };

//   const getStatusColor = (status: AppointmentStatus) => {
//     switch (status) {
//       case AppointmentStatus.CONFIRMED:
//         return 'text-cyan-400';
//       case AppointmentStatus.DONE:
//         return 'text-emerald-400';
//       case AppointmentStatus.CANCELED:
//         return 'text-red-400';
//       default:
//         return 'text-amber-400';
//     }
//   };

//   const getStatusLabel = (status: AppointmentStatus) => {
//     switch (status) {
//       case AppointmentStatus.CONFIRMED:
//         return 'Подтверждён';
//       case AppointmentStatus.DONE:
//         return 'Завершён';
//       case AppointmentStatus.CANCELED:
//         return 'Отменён';
//       default:
//         return 'Ожидает';
//     }
//   };

//   return (
//     <main className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
//       {/* Header */}
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-7xl mx-auto mb-6"
//       >
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//           <div>
//             <Link
//               href="/admin/clients"
//               className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-2"
//             >
//               ← К списку клиентов
//             </Link>
//             <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
//               {client.name}
//             </h1>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             {!isEditing && (
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setIsEditing(true)}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400/50 transition-all"
//               >
//                 <Edit2 size={16} />
//                 Редактировать
//               </motion.button>
//             )}
//             <DeleteClientForm clientId={client.id} clientName={client.name} />
//           </div>
//         </div>

//         {/* Stats Cards - Mobile Responsive */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {/* Total Visits */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.1 }}
//             className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-4 backdrop-blur-xl"
//           >
//             <div className="flex items-center justify-between mb-2">
//               <Calendar className="text-cyan-400" size={24} />
//               <div className="text-2xl font-bold text-white">{totalVisits}</div>
//             </div>
//             <div className="text-sm text-gray-400">Всего визитов</div>
//             <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
//           </motion.div>

//           {/* Total Spent */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.2 }}
//             className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 p-4 backdrop-blur-xl"
//           >
//             <div className="flex items-center justify-between mb-2">
//               <DollarSign className="text-emerald-400" size={24} />
//               <div className="text-2xl font-bold text-white">
//                 {formatCurrency(totalSpent)}
//               </div>
//             </div>
//             <div className="text-sm text-gray-400">Потрачено всего</div>
//             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
//           </motion.div>

//           {/* Avg Visit Value */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.3 }}
//             className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4 backdrop-blur-xl"
//           >
//             <div className="flex items-center justify-between mb-2">
//               <TrendingUp className="text-purple-400" size={24} />
//               <div className="text-2xl font-bold text-white">
//                 {formatCurrency(avgVisitValue)}
//               </div>
//             </div>
//             <div className="text-sm text-gray-400">Средний чек</div>
//             <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
//           </motion.div>

//           {/* Last Visit */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.4 }}
//             className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 backdrop-blur-xl"
//           >
//             <div className="flex items-center justify-between mb-2">
//               <Clock className="text-amber-400" size={24} />
//               <div className="text-lg font-bold text-white">
//                 {lastVisit ? fmtDate(lastVisit) : '—'}
//               </div>
//             </div>
//             <div className="text-sm text-gray-400">Последний визит</div>
//             <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
//           </motion.div>
//         </div>
//       </motion.div>

//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Profile & Contacts */}
//         <div className="lg:col-span-1 space-y-6">
//           {/* Profile Card */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.5 }}
//             className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 backdrop-blur-xl"
//           >
//             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
            
//             <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
//               <MapPin className="text-cyan-400" size={20} />
//               Профиль
//             </h2>

//             <AnimatePresence mode="wait">
//               {isEditing ? (
//                 <motion.form
//                   key="edit"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   action={submitUpdate}
//                   className="space-y-4"
//                 >
//                   <input type="hidden" name="id" value={client.id} />

//                   {hasError && (
//                     <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-200 text-sm">
//                       Не удалось сохранить. Проверьте поля.
//                     </div>
//                   )}

//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">Имя</label>
//                     <input
//                       name="name"
//                       defaultValue={client.name ?? ""}
//                       className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">Телефон</label>
//                     <input
//                       name="phone"
//                       defaultValue={client.phone ?? ""}
//                       className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">E-mail</label>
//                     <input
//                       type="email"
//                       name="email"
//                       defaultValue={client.email ?? ""}
//                       className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">Дата рождения</label>
//                     <input
//                       type="date"
//                       name="birthDate"
//                       defaultValue={toInputDate(client.birthDate)}
//                       className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">Как узнали</label>
//                     <input
//                       name="referral"
//                       defaultValue={client.referral ?? ""}
//                       className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
//                       placeholder="Google / Instagram..."
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm text-gray-400 mb-1">Заметки</label>
//                     <textarea
//                       name="notes"
//                       defaultValue={client.notes ?? ""}
//                       rows={3}
//                       className="w-full rounded-lg bg-slate-800/50 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors resize-none"
//                     />
//                   </div>

//                   <div className="flex gap-2 pt-2">
//                     <motion.button
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       type="submit"
//                       className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-400 hover:to-blue-400 transition-all"
//                     >
//                       <Save size={16} />
//                       Сохранить
//                     </motion.button>
//                     <motion.button
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.95 }}
//                       type="button"
//                       onClick={() => setIsEditing(false)}
//                       className="px-4 py-2 rounded-lg bg-slate-700/50 text-white hover:bg-slate-700 transition-colors"
//                     >
//                       <X size={16} />
//                     </motion.button>
//                   </div>
//                 </motion.form>
//               ) : (
//                 <motion.div
//                   key="view"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="space-y-4"
//                 >
//                   <div>
//                     <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
//                       <Phone size={14} />
//                       Телефон
//                     </div>
//                     <div className="text-white">{client.phone}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
//                       <Mail size={14} />
//                       E-mail
//                     </div>
//                     <div className="text-white">{client.email ?? "—"}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
//                       <Calendar size={14} />
//                       Дата рождения
//                     </div>
//                     <div className="text-white">{fmtDate(client.birthDate)}</div>
//                   </div>

//                   <div>
//                     <div className="text-sm text-gray-400 mb-1">Как узнали</div>
//                     <div className="text-white">{client.referral ?? "—"}</div>
//                   </div>

//                   {client.notes && (
//                     <div>
//                       <div className="text-sm text-gray-400 mb-1">Заметки</div>
//                       <div className="text-white whitespace-pre-wrap text-sm bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
//                         {client.notes}
//                       </div>
//                     </div>
//                   )}

//                   <div className="pt-4 border-t border-slate-700/50 space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Создан</span>
//                       <span className="text-white">{fmtDateTime(client.createdAt)}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-400">Обновлён</span>
//                       <span className="text-white">{fmtDateTime(client.updatedAt)}</span>
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </motion.div>

//           {/* Contact Actions Card */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.6 }}
//             className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 backdrop-blur-xl"
//           >
//             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full blur-3xl" />
            
//             <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
//               <MessageCircle className="text-emerald-400" size={20} />
//               Контакты
//             </h2>

//             <div className="grid grid-cols-1 gap-2">
//               <motion.a
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 whileTap={{ scale: 0.98 }}
//                 href={`tel:${client.phone.replace(/\s+/g, "")}`}
//                 className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-300 hover:border-cyan-400/50 transition-all"
//               >
//                 <Phone size={18} />
//                 <span>Позвонить</span>
//               </motion.a>

//               <motion.a
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 whileTap={{ scale: 0.98 }}
//                 href={`https://wa.me/${client.phone.replace(/[^\d]/g, "")}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 text-emerald-300 hover:border-emerald-400/50 transition-all"
//               >
//                 <MessageCircle size={18} />
//                 <span>WhatsApp</span>
//               </motion.a>

//               <motion.a
//                 whileHover={{ scale: 1.02, x: 5 }}
//                 whileTap={{ scale: 0.98 }}
//                 href={`https://t.me/${client.phone.replace(/[^\d+]/g, "")}`}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-300 hover:border-blue-400/50 transition-all"
//               >
//                 <Send size={18} />
//                 <span>Telegram</span>
//               </motion.a>

//               {client.email && (
//                 <motion.a
//                   whileHover={{ scale: 1.02, x: 5 }}
//                   whileTap={{ scale: 0.98 }}
//                   href={`mailto:${client.email}`}
//                   className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-300 hover:border-purple-400/50 transition-all"
//                 >
//                   <Mail size={18} />
//                   <span>E-mail</span>
//                 </motion.a>
//               )}
//             </div>
//           </motion.div>
//         </div>

//         {/* Right Column - Visits History */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.7 }}
//           className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-6 backdrop-blur-xl"
//         >
//           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
          
//           <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
//             <Calendar className="text-purple-400" size={20} />
//             История визитов
//           </h2>

//           {visits.length === 0 ? (
//             <div className="text-center py-12 text-gray-400">
//               Пока нет подтверждённых или завершённых визитов
//             </div>
//           ) : (
//             <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
//               {visits.map((visit, index) => (
//                 <motion.div
//                   key={visit.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.8 + index * 0.05 }}
//                   className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-4 hover:border-cyan-500/30 transition-all group"
//                 >
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-2 mb-2">
//                         <div className="text-lg font-semibold text-white">
//                           {visit.service?.title ?? "—"}
//                         </div>
//                         <div className={`text-sm ${getStatusColor(visit.status)}`}>
//                           {getStatusLabel(visit.status)}
//                         </div>
//                       </div>

//                       <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
//                         <div className="flex items-center gap-1">
//                           <Calendar size={14} />
//                           {fmtDate(visit.startAt)}
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Clock size={14} />
//                           {new Intl.DateTimeFormat("ru-RU", {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           }).format(visit.startAt)}
//                           {" - "}
//                           {new Intl.DateTimeFormat("ru-RU", {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           }).format(visit.endAt)}
//                         </div>
//                         {visit.master && (
//                           <div className="flex items-center gap-1">
//                             {visit.master.avatarUrl ? (
//                               <img
//                                 src={visit.master.avatarUrl}
//                                 alt={visit.master.name}
//                                 className="w-4 h-4 rounded-full"
//                               />
//                             ) : (
//                               <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
//                             )}
//                             {visit.master.name}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {visit.service?.priceCents && (
//                       <div className="text-xl font-bold text-cyan-400">
//                         {formatCurrency(visit.service.priceCents)}
//                       </div>
//                     )}
//                   </div>

//                   <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
//                 </motion.div>
//               ))}
//             </div>
//           )}
//         </motion.div>
//       </div>

//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 8px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgba(15, 23, 42, 0.3);
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(6, 182, 212, 0.3);
//           border-radius: 10px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: rgba(6, 182, 212, 0.5);
//         }
//       `}</style>
//     </main>
//   );
// }