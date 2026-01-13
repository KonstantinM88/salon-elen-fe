// src/app/admin/stats/_components/TopMastersTable.tsx
'use client';

import { motion } from 'framer-motion';

interface MasterData {
  id: string;
  name: string;
  revenue: number;
  count: number;
  avgCheck: number;
}

interface TopMastersTableProps {
  data: MasterData[];
  currency?: string;
}

export default function TopMastersTable({
  data,
  currency = '€',
}: TopMastersTableProps) {
  // Топ-5 мастеров
  const topMasters = data.slice(0, 5);

  const formatMoney = (cents: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl border border-blue-500/20 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white">Топ мастера</h3>
          <p className="text-xs sm:text-sm text-slate-400">По выручке за период</p>
        </div>
      </div>

      {/* Table */}
      {topMasters.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p>Нет данных о мастерах</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {topMasters.map((master, index) => (
            <motion.div
              key={master.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
              className="group relative p-3 sm:p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all duration-300"
            >
              {/* Rank badge */}
              <div className="absolute -top-2 -left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-900 font-bold text-xs sm:text-sm shadow-lg">
                {index + 1}
              </div>

              <div className="flex items-center justify-between">
                {/* Master info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    {/* Avatar */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                      {master.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-semibold text-sm sm:text-base truncate">{master.name}</h4>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        {master.count} {master.count === 1 ? 'запись' : master.count < 5 ? 'записи' : 'записей'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <div className="text-lg sm:text-2xl font-bold text-white mb-1 whitespace-nowrap">
                    {formatMoney(master.revenue)}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400 whitespace-nowrap">
                    Средний: {formatMoney(master.avgCheck)}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(master.revenue / topMasters[0].revenue) * 100}%`,
                  }}
                  transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Decorative glow */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
    </motion.div>
  );
}






// // src/app/admin/stats/_components/TopMastersTable.tsx
// 'use client';

// import { motion } from 'framer-motion';

// interface MasterData {
//   id: string;
//   name: string;
//   revenue: number;
//   count: number;
//   avgCheck: number;
// }

// interface TopMastersTableProps {
//   data: MasterData[];
//   currency?: string;
// }

// export default function TopMastersTable({
//   data,
//   currency = '€',
// }: TopMastersTableProps) {
//   // Топ-5 мастеров
//   const topMasters = data.slice(0, 5);

//   const formatMoney = (cents: number) => {
//     return new Intl.NumberFormat('ru-RU', {
//       style: 'currency',
//       currency: 'EUR',
//       maximumFractionDigits: 0,
//     }).format(cents / 100);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: 0.4 }}
//       className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl border border-blue-500/20 p-6"
//     >
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-6">
//         <div className="p-2 rounded-lg bg-blue-500/10">
//           <svg
//             className="w-6 h-6 text-blue-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
//             />
//           </svg>
//         </div>
//         <div>
//           <h3 className="text-lg font-semibold text-white">Топ мастера</h3>
//           <p className="text-sm text-slate-400">По выручке за период</p>
//         </div>
//       </div>

//       {/* Table */}
//       {topMasters.length === 0 ? (
//         <div className="h-80 flex items-center justify-center text-slate-500">
//           <div className="text-center">
//             <svg
//               className="w-16 h-16 mx-auto mb-4 opacity-30"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1.5}
//                 d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//               />
//             </svg>
//             <p>Нет данных о мастерах</p>
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           {topMasters.map((master, index) => (
//             <motion.div
//               key={master.id}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
//               className="group relative p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all duration-300"
//             >
//               {/* Rank badge */}
//               <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-900 font-bold text-sm shadow-lg">
//                 {index + 1}
//               </div>

//               <div className="flex items-center justify-between">
//                 {/* Master info */}
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-2">
//                     {/* Avatar */}
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
//                       {master.name.charAt(0)}
//                     </div>
//                     <div>
//                       <h4 className="text-white font-semibold">{master.name}</h4>
//                       <p className="text-slate-400 text-sm">
//                         {master.count} {master.count === 1 ? 'запись' : master.count < 5 ? 'записи' : 'записей'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Stats */}
//                 <div className="text-right">
//                   <div className="text-2xl font-bold text-white mb-1">
//                     {formatMoney(master.revenue)}
//                   </div>
//                   <div className="text-sm text-slate-400">
//                     Средний чек: {formatMoney(master.avgCheck)}
//                   </div>
//                 </div>
//               </div>

//               {/* Progress bar */}
//               <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
//                 <motion.div
//                   initial={{ width: 0 }}
//                   animate={{
//                     width: `${(master.revenue / topMasters[0].revenue) * 100}%`,
//                   }}
//                   transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
//                   className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
//                 />
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       )}

//       {/* Decorative glow */}
//       <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
//     </motion.div>
//   );
// }
