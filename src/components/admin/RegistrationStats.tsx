// src/components/admin/RegistrationStats.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
import { MessageSquare, Send, Mail, Chrome } from 'lucide-react';
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
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-70">Google</p>
                <p className="mt-2 text-2xl font-bold">{data.byMethod.google}</p>
              </div>
              <IconGlow tone="rose" className="h-10 w-10 ring-2 ring-rose-400/30 bg-rose-500/10">
                <Chrome className="h-5 w-5 text-rose-300" />
              </IconGlow>
            </div>
            <div className="flex items-start justify-between border-t border-white/10 pt-3">
              <div>
                <p className="text-sm opacity-70">Email</p>
                <p className="mt-2 text-2xl font-bold">{data.byMethod.email}</p>
              </div>
              <IconGlow tone="violet" className="h-10 w-10 ring-2 ring-violet-400/30 bg-violet-500/10">
                <Mail className="h-5 w-5 text-violet-300" />
              </IconGlow>
            </div>
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
          <p className="mt-1 text-sm opacity-70">20 последних записей</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/5 bg-white/5 text-left text-sm">
              <tr>
                <th className="p-4 font-medium">Метод</th>
                <th className="p-4 font-medium">Контакт</th>
                <th className="p-4 font-medium">Статус</th>
                <th className="p-4 font-medium">Дата</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.recentRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-white/[0.02]">
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
                    {reg.contact.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '+*** *** ** $4')}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}




//------------добавляем статистику регистраций клиентов по Email--------
// // src/components/admin/RegistrationStats.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';
// import { Users, Smartphone, Send, AlertCircle } from 'lucide-react';
// import { IconGlow } from '@/components/admin/IconGlow';

// type Period = '7d' | '30d' | '90d' | 'all';

// interface RegistrationData {
//   total: number;
//   byMethod: {
//     sms: number;
//     telegram: number;
//     google: number;
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
//     total: number;
//   }>;
//   recentRegistrations: Array<{
//     id: string;
//     method: 'sms' | 'telegram' | 'google';
//     phone?: string;
//     email?: string;
//     telegramUserId?: string;
//     createdAt: string;
//     verified: boolean;
//   }>;
// }

// interface StatsResponse {
//   success: boolean;
//   period: Period;
//   stats: RegistrationData;
//   error?: string;
// }

// const COLORS = {
//   sms: '#f59e0b', // amber
//   telegram: '#0088cc', // telegram blue
//   google: '#ef4444', // red
// };

// const METHOD_LABELS = {
//   sms: 'SMS',
//   telegram: 'Telegram',
//   google: 'Google',
// };

// const METHOD_ICONS = {
//   sms: Smartphone,
//   telegram: Send,
//   google: Users,
// };

// export function RegistrationStats() {
//   const [data, setData] = useState<RegistrationData | null>(null);
//   const [period, setPeriod] = useState<Period>('30d');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchStats = async (selectedPeriod: Period) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch(`/api/admin/registration-stats?period=${selectedPeriod}`);
//       const result: StatsResponse = await response.json();

//       if (!response.ok || !result.success) {
//         throw new Error(result.error || 'Ошибка загрузки статистики');
//       }

//       setData(result.stats);
//     } catch (err) {
//       console.error('Error fetching registration stats:', err);
//       setError(err instanceof Error ? err.message : 'Ошибка загрузки');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStats(period);
//   }, [period]);

//   const pieData = data
//     ? [
//         { name: METHOD_LABELS.sms, value: data.byMethod.sms, color: COLORS.sms },
//         { name: METHOD_LABELS.telegram, value: data.byMethod.telegram, color: COLORS.telegram },
//         { name: METHOD_LABELS.google, value: data.byMethod.google, color: COLORS.google },
//       ].filter(item => item.value > 0)
//     : [];

//   const periodLabels = {
//     '7d': '7 дней',
//     '30d': '30 дней',
//     '90d': '90 дней',
//     'all': 'Всё время',
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold">Статистика регистраций</h2>
//           <p className="text-sm opacity-70">Анализ методов регистрации клиентов</p>
//         </div>

//         {/* Period selector */}
//         <div className="flex gap-2 rounded-xl bg-white/50 p-1 shadow-sm backdrop-blur-sm">
//           {(['7d', '30d', '90d', 'all'] as Period[]).map((p) => (
//             <button
//               key={p}
//               onClick={() => setPeriod(p)}
//               className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
//                 period === p
//                   ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
//                   : 'text-gray-600 hover:bg-white/60'
//               }`}
//             >
//               {periodLabels[p]}
//             </button>
//           ))}
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex h-96 items-center justify-center rounded-2xl bg-white/50 backdrop-blur-sm">
//           <div className="text-center">
//             <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
//             <p className="text-sm text-gray-600">Загрузка статистики...</p>
//           </div>
//         </div>
//       ) : error ? (
//         <div className="rounded-2xl bg-rose-50 p-8 text-center">
//           <AlertCircle className="mx-auto mb-3 h-12 w-12 text-rose-500" />
//           <p className="mb-2 font-medium text-rose-900">Ошибка загрузки</p>
//           <p className="text-sm text-rose-700">{error}</p>
//           <button
//             onClick={() => fetchStats(period)}
//             className="mt-4 text-sm text-rose-700 underline hover:text-rose-800"
//           >
//             Попробовать снова
//           </button>
//         </div>
//       ) : data ? (
//         <>
//           {/* Summary cards */}
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
//             {/* Total */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="card-glass card-glow transition-all duration-300 hover:-translate-y-0.5"
//             >
//               <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-violet-500/0" />
//               <div className="relative p-6">
//                 <div className="mb-3 flex items-center gap-2">
//                   <IconGlow tone="violet" className="h-10 w-10 ring-2 ring-violet-400/30 bg-white/5">
//                     <Users className="h-5 w-5 text-violet-400" />
//                   </IconGlow>
//                   <h3 className="font-semibold text-gray-700">Всего</h3>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900">{data.total}</div>
//                 <div className="text-xs text-gray-600">регистраций</div>
//               </div>
//             </motion.div>

//             {/* SMS */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="card-glass card-glow transition-all duration-300 hover:-translate-y-0.5"
//             >
//               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-500/0" />
//               <div className="relative p-6">
//                 <div className="mb-3 flex items-center gap-2">
//                   <IconGlow tone="amber" className="h-10 w-10 ring-2 ring-amber-400/30 bg-white/5">
//                     <Smartphone className="h-5 w-5 text-amber-400" />
//                   </IconGlow>
//                   <h3 className="font-semibold text-gray-700">SMS</h3>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900">{data.byMethod.sms}</div>
//                 <div className="text-xs text-gray-600">
//                   {data.total > 0 ? Math.round((data.byMethod.sms / data.total) * 100) : 0}% от общего
//                 </div>
//               </div>
//             </motion.div>

//             {/* Telegram */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="card-glass card-glow transition-all duration-300 hover:-translate-y-0.5"
//             >
//               <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-sky-500/0" />
//               <div className="relative p-6">
//                 <div className="mb-3 flex items-center gap-2">
//                   <IconGlow tone="sky" className="h-10 w-10 ring-2 ring-sky-400/30 bg-white/5">
//                     <Send className="h-5 w-5 text-sky-400" />
//                   </IconGlow>
//                   <h3 className="font-semibold text-gray-700">Telegram</h3>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900">{data.byMethod.telegram}</div>
//                 <div className="text-xs text-gray-600">
//                   {data.total > 0 ? Math.round((data.byMethod.telegram / data.total) * 100) : 0}% от общего
//                 </div>
//               </div>
//             </motion.div>

//             {/* Google */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="card-glass card-glow transition-all duration-300 hover:-translate-y-0.5"
//             >
//               <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-rose-500/0" />
//               <div className="relative p-6">
//                 <div className="mb-3 flex items-center gap-2">
//                   <IconGlow tone="rose" className="h-10 w-10 ring-2 ring-rose-400/30 bg-white/5">
//                     <svg className="h-5 w-5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
//                       <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
//                     </svg>
//                   </IconGlow>
//                   <h3 className="font-semibold text-gray-700">Google</h3>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900">{data.byMethod.google}</div>
//                 <div className="text-xs text-gray-600">
//                   {data.total > 0 ? Math.round((data.byMethod.google / data.total) * 100) : 0}% от общего
//                 </div>
//               </div>
//             </motion.div>
//           </div>

//           {/* Charts */}
//           <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//             {/* Timeline chart */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="card-glass p-4 md:p-6"
//             >
//               <h3 className="mb-4 font-semibold text-sm md:text-base">Динамика регистраций</h3>
//               {data.timeline.length > 0 ? (
//                 <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
//                   <LineChart data={data.timeline} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                     <XAxis
//                       dataKey="date"
//                       tick={{ fontSize: 10 }}
//                       angle={-45}
//                       textAnchor="end"
//                       height={60}
//                       tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
//                     />
//                     <YAxis tick={{ fontSize: 10 }} />
//                     <Tooltip
//                       contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '12px' }}
//                       labelFormatter={(value) => new Date(value).toLocaleDateString('ru-RU')}
//                     />
//                     <Legend wrapperStyle={{ fontSize: '12px' }} />
//                     <Line type="monotone" dataKey="sms" stroke={COLORS.sms} strokeWidth={2} name="SMS" />
//                     <Line type="monotone" dataKey="telegram" stroke={COLORS.telegram} strokeWidth={2} name="Telegram" />
//                     <Line type="monotone" dataKey="google" stroke={COLORS.google} strokeWidth={2} name="Google" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex h-[250px] md:h-[300px] items-center justify-center text-gray-500 text-sm">
//                   Нет данных за выбранный период
//                 </div>
//               )}
//             </motion.div>

//             {/* Pie chart */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//               className="card-glass p-4 md:p-6"
//             >
//               <h3 className="mb-4 font-semibold text-sm md:text-base">Распределение по методам</h3>
//               {pieData.length > 0 ? (
//                 <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
//                   <PieChart>
//                     <Pie
//                       data={pieData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => {
//                         const p = percent !== undefined ? percent : 0;
//                         return `${name}: ${(p * 100).toFixed(0)}%`;
//                       }}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {pieData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip contentStyle={{ fontSize: '12px' }} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex h-[250px] md:h-[300px] items-center justify-center text-gray-500 text-sm">
//                   Нет данных за выбранный период
//                 </div>
//               )}
//             </motion.div>
//           </div>

//           {/* Recent registrations table */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="card-glass p-6"
//           >
//             <h3 className="mb-4 font-semibold">Последние регистрации</h3>
//             {data.recentRegistrations.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b text-left text-sm opacity-70">
//                       <th className="pb-3 font-medium">Метод</th>
//                       <th className="pb-3 font-medium">Контакт</th>
//                       <th className="pb-3 font-medium">Дата</th>
//                       <th className="pb-3 font-medium">Статус</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {data.recentRegistrations.map((reg) => (
//                       <tr key={reg.id} className="text-sm">
//                         <td className="py-3">
//                           <span
//                             className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
//                               reg.method === 'sms'
//                                 ? 'bg-amber-100 text-amber-700'
//                                 : reg.method === 'telegram'
//                                 ? 'bg-sky-100 text-sky-700'
//                                 : 'bg-rose-100 text-rose-700'
//                             }`}
//                           >
//                             {METHOD_LABELS[reg.method]}
//                           </span>
//                         </td>
//                         <td className="py-3">
//                           {reg.phone 
//                             ? `+${reg.phone.substring(0, 5)}***` 
//                             : reg.telegramUserId
//                             ? `TG:${reg.telegramUserId.substring(0, 6)}***`
//                             : reg.email || '—'}
//                         </td>
//                         <td className="py-3 opacity-70">
//                           {new Date(reg.createdAt).toLocaleString('ru-RU', {
//                             day: '2-digit',
//                             month: '2-digit',
//                             hour: '2-digit',
//                             minute: '2-digit',
//                           })}
//                         </td>
//                         <td className="py-3">
//                           {reg.verified ? (
//                             <span className="text-emerald-600">✓ Подтверждено</span>
//                           ) : (
//                             <span className="opacity-50">Ожидает</span>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="py-8 text-center opacity-60">Нет данных</div>
//             )}
//           </motion.div>
//         </>
//       ) : null}
//     </div>
//   );
// }





// // src/components/admin/RegistrationStats.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';
// import { Users, Smartphone, Send, AlertCircle } from 'lucide-react';
// import { IconGlow } from '@/components/admin/IconGlow';

// type Period = '7d' | '30d' | '90d' | 'all';

// interface RegistrationData {
//   total: number;
//   byMethod: {
//     sms: number;
//     telegram: number;
//     google: number;
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
//     total: number;
//   }>;
//   recentRegistrations: Array<{
//     id: string;
//     method: 'sms' | 'telegram' | 'google';
//     phone?: string;
//     email?: string;
//     telegramUserId?: string;
//     createdAt: string;
//     verified: boolean;
//   }>;
// }

// interface StatsResponse {
//   success: boolean;
//   period: Period;
//   stats: RegistrationData;
//   error?: string;
// }

// const COLORS = {
//   sms: '#f59e0b', // amber
//   telegram: '#0088cc', // telegram blue
//   google: '#ef4444', // red
// };

// const METHOD_LABELS = {
//   sms: 'SMS',
//   telegram: 'Telegram',
//   google: 'Google',
// };

// const METHOD_ICONS = {
//   sms: Smartphone,
//   telegram: Send,
//   google: Users,
// };

// export function RegistrationStats() {
//   const [data, setData] = useState<RegistrationData | null>(null);
//   const [period, setPeriod] = useState<Period>('30d');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchStats = async (selectedPeriod: Period) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const response = await fetch(`/api/admin/registration-stats?period=${selectedPeriod}`);
//       const result: StatsResponse = await response.json();

//       if (!response.ok || !result.success) {
//         throw new Error(result.error || 'Ошибка загрузки статистики');
//       }

//       setData(result.stats);
//     } catch (err) {
//       console.error('Error fetching registration stats:', err);
//       setError(err instanceof Error ? err.message : 'Ошибка загрузки');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStats(period);
//   }, [period]);

//   const pieData = data
//     ? [
//         { name: METHOD_LABELS.sms, value: data.byMethod.sms, color: COLORS.sms },
//         { name: METHOD_LABELS.telegram, value: data.byMethod.telegram, color: COLORS.telegram },
//         { name: METHOD_LABELS.google, value: data.byMethod.google, color: COLORS.google },
//       ].filter(item => item.value > 0)
//     : [];

//   const periodLabels = {
//     '7d': '7 дней',
//     '30d': '30 дней',
//     '90d': '90 дней',
//     'all': 'Всё время',
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold">Статистика регистраций</h2>
//           <p className="text-sm opacity-70">Анализ методов регистрации клиентов</p>
//         </div>

//         {/* Period selector */}
//         <div className="flex gap-2 rounded-xl bg-white/50 p-1 shadow-sm backdrop-blur-sm">
//           {(['7d', '30d', '90d', 'all'] as Period[]).map((p) => (
//             <button
//               key={p}
//               onClick={() => setPeriod(p)}
//               className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
//                 period === p
//                   ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
//                   : 'text-gray-600 hover:bg-white/60'
//               }`}
//             >
//               {periodLabels[p]}
//             </button>
//           ))}
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex h-96 items-center justify-center rounded-2xl bg-white/50 backdrop-blur-sm">
//           <div className="text-center">
//             <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
//             <p className="text-sm text-gray-600">Загрузка статистики...</p>
//           </div>
//         </div>
//       ) : error ? (
//         <div className="rounded-2xl bg-rose-50 p-8 text-center">
//           <AlertCircle className="mx-auto mb-3 h-12 w-12 text-rose-500" />
//           <p className="mb-2 font-medium text-rose-900">Ошибка загрузки</p>
//           <p className="text-sm text-rose-700">{error}</p>
//           <button
//             onClick={() => fetchStats(period)}
//             className="mt-4 text-sm text-rose-700 underline hover:text-rose-800"
//           >
//             Попробовать снова
//           </button>
//         </div>
//       ) : data ? (
//         <>
//           {/* Summary cards */}
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
//             {/* Total */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="card-glass card-glow transition-all duration-300 hover:-translate-y-0.5"
//             >
//               <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-violet-500/0" />
//               <div className="relative p-6">
//                 <div className="mb-3 flex items-center gap-2">
//                   <IconGlow tone="violet" className="h-10 w-10 ring-2 ring-violet-400/30 bg-white/5">
//                     <Users className="h-5 w-5 text-violet-400" />
//                   </IconGlow>
//                   <h3 className="font-semibold text-gray-700">Всего</h3>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900">{data.total}</div>
//                 <div className="text-xs text-gray-600">регистраций</div>
//               </div>
//             </motion.div>

//             {/* SMS */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//               className="card-glass card-glow transition-all duration-300 hover:-translate-y-0.5"
//             >
//               <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-500/0" />
//               <div className="relative p-6">
//                 <div className="mb-3 flex items-center gap-2">
//                   <IconGlow tone="amber" className="h-10 w-10 ring-2 ring-amber-400/30 bg-white/5">
//                     <Smartphone className="h-5 w-5 text-amber-400" />
//                   </IconGlow>
//                   <h3 className="font-semibold text-gray-700">SMS</h3>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900">{data.byMethod.sms}</div>
//                 <div className="text-xs text-gray-600">
//                   {data.total > 0 ? Math.round((data.byMethod.sms / data.total) * 100) : 0}% от общего
//                 </div>
//               </div>
//             </motion.div>

//             {/* Telegram */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//               className="card-glass card-glow transition-all duration-300 hover:-translate-y-0.5"
//             >
//               <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-sky-500/0" />
//               <div className="relative p-6">
//                 <div className="mb-3 flex items-center gap-2">
//                   <IconGlow tone="sky" className="h-10 w-10 ring-2 ring-sky-400/30 bg-white/5">
//                     <Send className="h-5 w-5 text-sky-400" />
//                   </IconGlow>
//                   <h3 className="font-semibold text-gray-700">Telegram</h3>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900">{data.byMethod.telegram}</div>
//                 <div className="text-xs text-gray-600">
//                   {data.total > 0 ? Math.round((data.byMethod.telegram / data.total) * 100) : 0}% от общего
//                 </div>
//               </div>
//             </motion.div>

//             {/* Google */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//               className="card-glass card-glow transition-all duration-300 hover:-translate-y-0.5"
//             >
//               <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-rose-500/0" />
//               <div className="relative p-6">
//                 <div className="mb-3 flex items-center gap-2">
//                   <IconGlow tone="rose" className="h-10 w-10 ring-2 ring-rose-400/30 bg-white/5">
//                     <svg className="h-5 w-5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
//                       <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
//                     </svg>
//                   </IconGlow>
//                   <h3 className="font-semibold text-gray-700">Google</h3>
//                 </div>
//                 <div className="text-3xl font-bold text-gray-900">{data.byMethod.google}</div>
//                 <div className="text-xs text-gray-600">
//                   {data.total > 0 ? Math.round((data.byMethod.google / data.total) * 100) : 0}% от общего
//                 </div>
//               </div>
//             </motion.div>
//           </div>

//           {/* Charts */}
//           <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//             {/* Timeline chart */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//               className="card-glass p-6"
//             >
//               <h3 className="mb-4 font-semibold">Динамика регистраций</h3>
//               {data.timeline.length > 0 ? (
//                 <ResponsiveContainer width="100%" height={300}>
//                   <LineChart data={data.timeline}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                     <XAxis
//                       dataKey="date"
//                       tick={{ fontSize: 12 }}
//                       tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
//                     />
//                     <YAxis tick={{ fontSize: 12 }} />
//                     <Tooltip
//                       contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
//                       labelFormatter={(value) => new Date(value).toLocaleDateString('ru-RU')}
//                     />
//                     <Legend />
//                     <Line type="monotone" dataKey="sms" stroke={COLORS.sms} strokeWidth={2} name="SMS" />
//                     <Line type="monotone" dataKey="telegram" stroke={COLORS.telegram} strokeWidth={2} name="Telegram" />
//                     <Line type="monotone" dataKey="google" stroke={COLORS.google} strokeWidth={2} name="Google" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex h-[300px] items-center justify-center text-gray-500">
//                   Нет данных за выбранный период
//                 </div>
//               )}
//             </motion.div>

//             {/* Pie chart */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//               className="card-glass p-6"
//             >
//               <h3 className="mb-4 font-semibold">Распределение по методам</h3>
//               {pieData.length > 0 ? (
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={pieData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                       outerRadius={100}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {pieData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex h-[300px] items-center justify-center text-gray-500">
//                   Нет данных за выбранный период
//                 </div>
//               )}
//             </motion.div>
//           </div>

//           {/* Recent registrations table */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="card-glass p-6"
//           >
//             <h3 className="mb-4 font-semibold">Последние регистрации</h3>
//             {data.recentRegistrations.length > 0 ? (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b text-left text-sm opacity-70">
//                       <th className="pb-3 font-medium">Метод</th>
//                       <th className="pb-3 font-medium">Контакт</th>
//                       <th className="pb-3 font-medium">Дата</th>
//                       <th className="pb-3 font-medium">Статус</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {data.recentRegistrations.map((reg) => (
//                       <tr key={reg.id} className="text-sm">
//                         <td className="py-3">
//                           <span
//                             className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
//                               reg.method === 'sms'
//                                 ? 'bg-amber-100 text-amber-700'
//                                 : reg.method === 'telegram'
//                                 ? 'bg-sky-100 text-sky-700'
//                                 : 'bg-rose-100 text-rose-700'
//                             }`}
//                           >
//                             {METHOD_LABELS[reg.method]}
//                           </span>
//                         </td>
//                         <td className="py-3">
//                           {reg.phone 
//                             ? `+${reg.phone.substring(0, 5)}***` 
//                             : reg.telegramUserId
//                             ? `TG:${reg.telegramUserId.substring(0, 6)}***`
//                             : reg.email || '—'}
//                         </td>
//                         <td className="py-3 opacity-70">
//                           {new Date(reg.createdAt).toLocaleString('ru-RU', {
//                             day: '2-digit',
//                             month: '2-digit',
//                             hour: '2-digit',
//                             minute: '2-digit',
//                           })}
//                         </td>
//                         <td className="py-3">
//                           {reg.verified ? (
//                             <span className="text-emerald-600">✓ Подтверждено</span>
//                           ) : (
//                             <span className="opacity-50">Ожидает</span>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             ) : (
//               <div className="py-8 text-center opacity-60">Нет данных</div>
//             )}
//           </motion.div>
//         </>
//       ) : null}
//     </div>
//   );
// }