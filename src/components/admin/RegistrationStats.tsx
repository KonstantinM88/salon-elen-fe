// src/components/admin/RegistrationStats.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MessageSquare, Send, Mail, Chrome, ExternalLink } from 'lucide-react';
import { IconGlow } from './IconGlow';

type RegistrationMethod = 'sms' | 'telegram' | 'google' | 'email';

type Stats = {
  total: number;
  byMethod: {
    sms: number;
    telegram: number;
    google: number;
    email: number;
  };
  byStatus: {
    completed: number;
    pending: number;
  };
  timeline: Array<{
    date: string;
    sms: number;
    telegram: number;
    google: number;
    email: number;
  }>;
  recentRegistrations: Array<{
    id: string;
    method: RegistrationMethod;
    contact: string;
    status: 'completed' | 'pending';
    createdAt: string;
    appointmentId: string | null;
  }>;
};

const COLORS = {
  sms: '#f59e0b',      // amber
  telegram: '#0088cc', // telegram blue
  google: '#ef4444',   // red
  email: '#8b5cf6',    // violet
};

const METHOD_LABELS = {
  sms: 'SMS',
  telegram: 'Telegram',
  google: 'Google',
  email: 'Email',
};

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

export function RegistrationStats() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/registration-stats?period=${period}`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        const result = await response.json();
        if (result.success) {
          setData(result.stats);
        } else {
          setError(result.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
        <p className="font-medium">Ошибка загрузки статистики</p>
        {error && <p className="mt-1 text-sm opacity-80">{error}</p>}
      </div>
    );
  }

  const pieData = [
    { name: 'SMS', value: data.byMethod.sms, color: COLORS.sms },
    { name: 'Telegram', value: data.byMethod.telegram, color: COLORS.telegram },
    { name: 'Google', value: data.byMethod.google, color: COLORS.google },
    { name: 'Email', value: data.byMethod.email, color: COLORS.email },
  ].filter(item => item.value > 0);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Статистика регистраций</h2>
          <p className="mt-1 text-sm opacity-70">Анализ методов регистрации клиентов</p>
        </div>

        {/* Period selector */}
        <div className="inline-flex rounded-xl bg-white/5 p-1">
          {(['7d', '30d', '90d', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                rounded-lg px-4 py-2 text-sm font-medium transition-all
                ${
                  period === p
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }
              `}
            >
              {p === '7d' ? '7 дней' : p === '30d' ? '30 дней' : p === '90d' ? '90 дней' : 'Всё время'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <motion.div variants={item} className="card-glass p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-70">Всего регистраций</p>
              <p className="mt-2 text-3xl font-bold">{data.total}</p>
            </div>
            <IconGlow tone="violet" className="h-12 w-12 ring-2 ring-violet-400/30 bg-violet-500/10">
              <MessageSquare className="h-6 w-6 text-violet-300" />
            </IconGlow>
          </div>
        </motion.div>

        {/* SMS */}
        <motion.div variants={item} className="card-glass p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-70">SMS</p>
              <p className="mt-2 text-3xl font-bold">{data.byMethod.sms}</p>
            </div>
            <IconGlow tone="amber" className="h-12 w-12 ring-2 ring-amber-400/30 bg-amber-500/10">
              <MessageSquare className="h-6 w-6 text-amber-300" />
            </IconGlow>
          </div>
        </motion.div>

        {/* Telegram */}
        <motion.div variants={item} className="card-glass p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-70">Telegram</p>
              <p className="mt-2 text-3xl font-bold">{data.byMethod.telegram}</p>
            </div>
            <IconGlow tone="sky" className="h-12 w-12 ring-2 ring-sky-400/30 bg-sky-500/10">
              <Send className="h-6 w-6 text-sky-300" />
            </IconGlow>
          </div>
        </motion.div>

        {/* Google + Email */}
        <motion.div variants={item} className="card-glass p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-70">Google / Email</p>
              <p className="mt-2 text-3xl font-bold">{data.byMethod.google + data.byMethod.email}</p>
            </div>
            <IconGlow tone="rose" className="h-12 w-12 ring-2 ring-rose-400/30 bg-rose-500/10">
              <Mail className="h-6 w-6 text-rose-300" />
            </IconGlow>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Timeline chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glass p-4 md:p-6"
        >
          <h3 className="mb-4 font-semibold text-sm md:text-base">Динамика регистраций</h3>
          {data.timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
              <LineChart data={data.timeline} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('ru-RU')}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="sms" stroke={COLORS.sms} strokeWidth={2} name="SMS" />
                <Line type="monotone" dataKey="telegram" stroke={COLORS.telegram} strokeWidth={2} name="Telegram" />
                <Line type="monotone" dataKey="google" stroke={COLORS.google} strokeWidth={2} name="Google" />
                <Line type="monotone" dataKey="email" stroke={COLORS.email} strokeWidth={2} name="Email" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] md:h-[300px] items-center justify-center text-gray-500 text-sm">
              Нет данных за выбранный период
            </div>
          )}
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-glass p-4 md:p-6"
        >
          <h3 className="mb-4 font-semibold text-sm md:text-base">Распределение по методам</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const p = percent !== undefined ? percent : 0;
                    return `${name}: ${(p * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] md:h-[300px] items-center justify-center text-gray-500 text-sm">
              Нет данных за выбранный период
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent registrations table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card-glass overflow-hidden"
      >
        <div className="border-b border-white/10 p-6">
          <h3 className="font-semibold">Последние регистрации</h3>
          <p className="mt-1 text-sm opacity-70">20 последних записей • Кликните для просмотра заявки</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/5 bg-white/5 text-left text-sm">
              <tr>
                <th className="p-4 font-medium">Метод</th>
                <th className="p-4 font-medium">Контакт</th>
                <th className="p-4 font-medium">Статус</th>
                <th className="p-4 font-medium">Дата</th>
                <th className="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recentRegistrations.map((reg) => (
                <tr 
                  key={reg.id}
                  onClick={() => {
                    if (reg.appointmentId) {
                      router.push(`/admin/bookings?search=${reg.appointmentId}`);
                    }
                  }}
                  className={`hover:bg-white/[0.02] transition-colors ${reg.appointmentId ? 'cursor-pointer' : ''}`}
                >
                  <td className="p-4">
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                         style={{ 
                           backgroundColor: `${COLORS[reg.method]}20`,
                           color: COLORS[reg.method]
                         }}>
                      {METHOD_LABELS[reg.method]}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">
                    {/* Показываем полный контакт без маскировки */}
                    {reg.contact}
                  </td>
                  <td className="p-4">
                    {reg.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                        ✓ Завершено
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
                        ⏳ В ожидании
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm opacity-70">
                    {new Date(reg.createdAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-4">
                    {reg.appointmentId && (
                      <div className="flex items-center gap-1 text-xs text-sky-400 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-3 w-3" />
                        <span className="hidden lg:inline">Открыть</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}





//---------показываем номера целиком и делаем кликабельными--------
// // src/components/admin/RegistrationStats.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import {
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';
// import { MessageSquare, Send, Mail, Chrome } from 'lucide-react';
// import { IconGlow } from './IconGlow';

// type RegistrationMethod = 'sms' | 'telegram' | 'google' | 'email';

// type Stats = {
//   total: number;
//   byMethod: {
//     sms: number;
//     telegram: number;
//     google: number;
//     email: number;
//   };
//   byStatus: {
//     completed: number;
//     pending: number;
//   };
//   timeline: Array<{
//     date: string;
//     sms: number;
//     telegram: number;
//     google: number;
//     email: number;
//   }>;
//   recentRegistrations: Array<{
//     id: string;
//     method: RegistrationMethod;
//     contact: string;
//     status: 'completed' | 'pending';
//     createdAt: string;
//   }>;
// };

// const COLORS = {
//   sms: '#f59e0b',      // amber
//   telegram: '#0088cc', // telegram blue
//   google: '#ef4444',   // red
//   email: '#8b5cf6',    // violet
// };

// const METHOD_LABELS = {
//   sms: 'SMS',
//   telegram: 'Telegram',
//   google: 'Google',
//   email: 'Email',
// };

// const container = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// const item = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0 },
// };

// export function RegistrationStats() {
//   const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
//   const [data, setData] = useState<Stats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchStats() {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await fetch(`/api/admin/registration-stats?period=${period}`);
//         if (!response.ok) throw new Error('Failed to fetch stats');
//         const result = await response.json();
//         if (result.success) {
//           setData(result.stats);
//         } else {
//           setError(result.error || 'Unknown error');
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Failed to load stats');
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStats();
//   }, [period]);

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
//         <div className="grid gap-4 md:grid-cols-4">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="h-32 animate-pulse rounded-xl bg-white/10" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (error || !data) {
//     return (
//       <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
//         <p className="font-medium">Ошибка загрузки статистики</p>
//         {error && <p className="mt-1 text-sm opacity-80">{error}</p>}
//       </div>
//     );
//   }

//   const pieData = [
//     { name: 'SMS', value: data.byMethod.sms, color: COLORS.sms },
//     { name: 'Telegram', value: data.byMethod.telegram, color: COLORS.telegram },
//     { name: 'Google', value: data.byMethod.google, color: COLORS.google },
//     { name: 'Email', value: data.byMethod.email, color: COLORS.email },
//   ].filter(item => item.value > 0);

//   return (
//     <motion.div
//       variants={container}
//       initial="hidden"
//       animate="show"
//       className="space-y-6"
//     >
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h2 className="text-2xl font-bold">Статистика регистраций</h2>
//           <p className="mt-1 text-sm opacity-70">Анализ методов регистрации клиентов</p>
//         </div>

//         {/* Period selector */}
//         <div className="inline-flex rounded-xl bg-white/5 p-1">
//           {(['7d', '30d', '90d', 'all'] as const).map((p) => (
//             <button
//               key={p}
//               onClick={() => setPeriod(p)}
//               className={`
//                 rounded-lg px-4 py-2 text-sm font-medium transition-all
//                 ${
//                   period === p
//                     ? 'bg-amber-500 text-white shadow-lg'
//                     : 'text-gray-300 hover:text-white'
//                 }
//               `}
//             >
//               {p === '7d' ? '7 дней' : p === '30d' ? '30 дней' : p === '90d' ? '90 дней' : 'Всё время'}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Summary cards */}
//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {/* Total */}
//         <motion.div variants={item} className="card-glass p-6">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm opacity-70">Всего регистраций</p>
//               <p className="mt-2 text-3xl font-bold">{data.total}</p>
//             </div>
//             <IconGlow tone="violet" className="h-12 w-12 ring-2 ring-violet-400/30 bg-violet-500/10">
//               <MessageSquare className="h-6 w-6 text-violet-300" />
//             </IconGlow>
//           </div>
//         </motion.div>

//         {/* SMS */}
//         <motion.div variants={item} className="card-glass p-6">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm opacity-70">SMS</p>
//               <p className="mt-2 text-3xl font-bold">{data.byMethod.sms}</p>
//             </div>
//             <IconGlow tone="amber" className="h-12 w-12 ring-2 ring-amber-400/30 bg-amber-500/10">
//               <MessageSquare className="h-6 w-6 text-amber-300" />
//             </IconGlow>
//           </div>
//         </motion.div>

//         {/* Telegram */}
//         <motion.div variants={item} className="card-glass p-6">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm opacity-70">Telegram</p>
//               <p className="mt-2 text-3xl font-bold">{data.byMethod.telegram}</p>
//             </div>
//             <IconGlow tone="sky" className="h-12 w-12 ring-2 ring-sky-400/30 bg-sky-500/10">
//               <Send className="h-6 w-6 text-sky-300" />
//             </IconGlow>
//           </div>
//         </motion.div>

//         {/* Google + Email */}
//         <motion.div variants={item} className="card-glass p-6">
//           <div className="space-y-3">
//             <div className="flex items-start justify-between">
//               <div>
//                 <p className="text-sm opacity-70">Google</p>
//                 <p className="mt-2 text-2xl font-bold">{data.byMethod.google}</p>
//               </div>
//               <IconGlow tone="rose" className="h-10 w-10 ring-2 ring-rose-400/30 bg-rose-500/10">
//                 <Chrome className="h-5 w-5 text-rose-300" />
//               </IconGlow>
//             </div>
//             <div className="flex items-start justify-between border-t border-white/10 pt-3">
//               <div>
//                 <p className="text-sm opacity-70">Email</p>
//                 <p className="mt-2 text-2xl font-bold">{data.byMethod.email}</p>
//               </div>
//               <IconGlow tone="violet" className="h-10 w-10 ring-2 ring-violet-400/30 bg-violet-500/10">
//                 <Mail className="h-5 w-5 text-violet-300" />
//               </IconGlow>
//             </div>
//           </div>
//         </motion.div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//         {/* Timeline chart */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className="card-glass p-4 md:p-6"
//         >
//           <h3 className="mb-4 font-semibold text-sm md:text-base">Динамика регистраций</h3>
//           {data.timeline.length > 0 ? (
//             <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
//               <LineChart data={data.timeline} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis
//                   dataKey="date"
//                   tick={{ fontSize: 10 }}
//                   angle={-45}
//                   textAnchor="end"
//                   height={60}
//                   tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
//                 />
//                 <YAxis tick={{ fontSize: 10 }} />
//                 <Tooltip
//                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '12px' }}
//                   labelFormatter={(value) => new Date(value).toLocaleDateString('ru-RU')}
//                 />
//                 <Legend wrapperStyle={{ fontSize: '12px' }} />
//                 <Line type="monotone" dataKey="sms" stroke={COLORS.sms} strokeWidth={2} name="SMS" />
//                 <Line type="monotone" dataKey="telegram" stroke={COLORS.telegram} strokeWidth={2} name="Telegram" />
//                 <Line type="monotone" dataKey="google" stroke={COLORS.google} strokeWidth={2} name="Google" />
//                 <Line type="monotone" dataKey="email" stroke={COLORS.email} strokeWidth={2} name="Email" />
//               </LineChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="flex h-[250px] md:h-[300px] items-center justify-center text-gray-500 text-sm">
//               Нет данных за выбранный период
//             </div>
//           )}
//         </motion.div>

//         {/* Pie chart */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5 }}
//           className="card-glass p-4 md:p-6"
//         >
//           <h3 className="mb-4 font-semibold text-sm md:text-base">Распределение по методам</h3>
//           {pieData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent }) => {
//                     const p = percent !== undefined ? percent : 0;
//                     return `${name}: ${(p * 100).toFixed(0)}%`;
//                   }}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip contentStyle={{ fontSize: '12px' }} />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="flex h-[250px] md:h-[300px] items-center justify-center text-gray-500 text-sm">
//               Нет данных за выбранный период
//             </div>
//           )}
//         </motion.div>
//       </div>

//       {/* Recent registrations table */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.6 }}
//         className="card-glass overflow-hidden"
//       >
//         <div className="border-b border-white/10 p-6">
//           <h3 className="font-semibold">Последние регистрации</h3>
//           <p className="mt-1 text-sm opacity-70">20 последних записей</p>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="border-b border-white/5 bg-white/5 text-left text-sm">
//               <tr>
//                 <th className="p-4 font-medium">Метод</th>
//                 <th className="p-4 font-medium">Контакт</th>
//                 <th className="p-4 font-medium">Статус</th>
//                 <th className="p-4 font-medium">Дата</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/5">
//               {data.recentRegistrations.map((reg) => (
//                 <tr key={reg.id} className="hover:bg-white/[0.02]">
//                   <td className="p-4">
//                     <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
//                          style={{ 
//                            backgroundColor: `${COLORS[reg.method]}20`,
//                            color: COLORS[reg.method]
//                          }}>
//                       {METHOD_LABELS[reg.method]}
//                     </div>
//                   </td>
//                   <td className="p-4 font-mono text-sm">
//                     {reg.contact.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '+*** *** ** $4')}
//                   </td>
//                   <td className="p-4">
//                     {reg.status === 'completed' ? (
//                       <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
//                         ✓ Завершено
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
//                         ⏳ В ожидании
//                       </span>
//                     )}
//                   </td>
//                   <td className="p-4 text-sm opacity-70">
//                     {new Date(reg.createdAt).toLocaleDateString('ru-RU', {
//                       day: '2-digit',
//                       month: '2-digit',
//                       year: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit',
//                     })}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }