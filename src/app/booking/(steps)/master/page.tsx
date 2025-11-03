//src/app/booking/(steps)/master/page.tsx
'use client';

import * as React from 'react';
import { JSX, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, ChevronRight } from 'lucide-react';

/* =========================
   Типы
========================= */

type Master = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

/* =========================
   Внутренний компонент
========================= */

function MasterInner(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();

  // Получаем service IDs из параметров URL
  const serviceIds = React.useMemo<string[]>(
    () => params.getAll('s').filter(Boolean),
    [params],
  );

  const [masters, setMasters] = React.useState<Master[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Загрузка мастеров
  React.useEffect(() => {
    let cancelled = false;

    async function loadMasters(): Promise<void> {
      if (serviceIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const qs = new URLSearchParams();
        qs.set('serviceIds', serviceIds.join(','));
        
        const res = await fetch(`/api/masters?${qs.toString()}`, { 
          cache: 'no-store' 
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = (await res.json()) as { masters: Master[] };

        if (!cancelled) {
          setMasters(data.masters ?? []);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Не удалось загрузить мастеров';
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMasters();

    return () => {
      cancelled = true;
    };
  }, [serviceIds]);

  // Переход к календарю с выбранным мастером
  const selectMaster = (masterId: string): void => {
    const qs = new URLSearchParams();
    serviceIds.forEach(id => qs.append('s', id));
    qs.set('m', masterId);
    router.push(`/booking/calendar?${qs.toString()}`);
  };

  // Если услуги не выбраны
  if (serviceIds.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Услуги не выбраны
          </h2>
          <p className="text-gray-600 mb-6">
            Пожалуйста, сначала выберите услуги
          </p>
          <Link
            href="/booking/services"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Выбрать услуги
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <User className="w-8 h-8" />
              Выбор мастера
            </h1>
            <p className="text-blue-100 mt-2">
              Выберите мастера для ваших услуг
            </p>
          </div>

          <div className="p-6 md:p-8">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Загрузка мастеров…</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-red-700 font-semibold mb-2">Ошибка</p>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && masters.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Нет доступных мастеров
                </h3>
                <p className="text-gray-600 mb-6">
                  К сожалению, для выбранных услуг нет мастеров, которые могут выполнить все услуги.
                  Попробуйте выбрать другие услуги или оформите отдельные записи.
                </p>
                <Link
                  href="/booking/services"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Изменить услуги
                </Link>
              </div>
            )}

            {!loading && !error && masters.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {masters.map((master) => (
                  <button
                    key={master.id}
                    onClick={() => selectMaster(master.id)}
                    className="group relative bg-gray-50 rounded-xl p-6 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border-2 border-transparent hover:border-blue-300 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {master.avatarUrl ? (
                          <img
                            src={master.avatarUrl}
                            alt={master.name}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all">
                            <User className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {master.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Нажмите для выбора
                        </p>
                      </div>

                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Навигация назад */}
          <div className="border-t border-gray-200 p-6 md:p-8 bg-gray-50">
            <Link
              href="/booking/services"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Вернуться к выбору услуг
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Обёртка
========================= */

export default function MasterPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка…</p>
          </div>
        </div>
      }
    >
      <MasterInner />
    </Suspense>
  );
}



//------------работал но старый дизайн 03/11
// //src/app/booking/(steps)/master/page.tsx
// 'use client';

// import * as React from 'react';
// import { JSX, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { User, ChevronRight } from 'lucide-react';

// /* =========================
//    Типы
// ========================= */

// type Master = {
//   id: string;
//   name: string;
//   avatarUrl?: string | null;
// };

// /* =========================
//    Внутренний компонент
// ========================= */

// function MasterInner(): JSX.Element {
//   const router = useRouter();
//   const params = useSearchParams();

//   // Получаем service IDs из параметров URL
//   const serviceIds = React.useMemo<string[]>(
//     () => params.getAll('s').filter(Boolean),
//     [params],
//   );

//   const [masters, setMasters] = React.useState<Master[]>([]);
//   const [loading, setLoading] = React.useState<boolean>(true);
//   const [error, setError] = React.useState<string | null>(null);

//   // Загрузка мастеров
//   React.useEffect(() => {
//     let cancelled = false;

//     async function loadMasters(): Promise<void> {
//       if (serviceIds.length === 0) {
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         const qs = new URLSearchParams();
//         qs.set('serviceIds', serviceIds.join(','));
        
//         const res = await fetch(`/api/masters?${qs.toString()}`, { 
//           cache: 'no-store' 
//         });

//         if (!res.ok) {
//           throw new Error(`HTTP ${res.status}`);
//         }

//         const data = (await res.json()) as { masters: Master[] };

//         if (!cancelled) {
//           setMasters(data.masters ?? []);
//         }
//       } catch (e: unknown) {
//         if (!cancelled) {
//           const msg = e instanceof Error ? e.message : 'Не удалось загрузить мастеров';
//           setError(msg);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     void loadMasters();

//     return () => {
//       cancelled = true;
//     };
//   }, [serviceIds]);

//   // Переход к календарю с выбранным мастером
//   const selectMaster = (masterId: string): void => {
//     const qs = new URLSearchParams();
//     serviceIds.forEach(id => qs.append('s', id));
//     qs.set('m', masterId);
//     router.push(`/booking/calendar?${qs.toString()}`);
//   };

//   // Если услуги не выбраны
//   if (serviceIds.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
//           <div className="text-6xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">
//             Услуги не выбраны
//           </h2>
//           <p className="text-gray-600 mb-6">
//             Пожалуйста, сначала выберите услуги
//           </p>
//           <Link
//             href="/booking/services"
//             className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
//           >
//             Выбрать услуги
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
//             <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
//               <User className="w-8 h-8" />
//               Выбор мастера
//             </h1>
//             <p className="text-blue-100 mt-2">
//               Выберите мастера для ваших услуг
//             </p>
//           </div>

//           <div className="p-6 md:p-8">
//             {loading && (
//               <div className="text-center py-12">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
//                 <p className="mt-4 text-gray-600">Загрузка мастеров…</p>
//               </div>
//             )}

//             {error && (
//               <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
//                 <p className="text-red-700 font-semibold mb-2">Ошибка</p>
//                 <p className="text-red-600">{error}</p>
//               </div>
//             )}

//             {!loading && !error && masters.length === 0 && (
//               <div className="text-center py-12">
//                 <div className="text-6xl mb-4">😔</div>
//                 <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                   Нет доступных мастеров
//                 </h3>
//                 <p className="text-gray-600 mb-6">
//                   К сожалению, для выбранных услуг нет мастеров, которые могут выполнить все услуги.
//                   Попробуйте выбрать другие услуги или оформите отдельные записи.
//                 </p>
//                 <Link
//                   href="/booking/services"
//                   className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
//                 >
//                   Изменить услуги
//                 </Link>
//               </div>
//             )}

//             {!loading && !error && masters.length > 0 && (
//               <div className="grid gap-4 md:grid-cols-2">
//                 {masters.map((master) => (
//                   <button
//                     key={master.id}
//                     onClick={() => selectMaster(master.id)}
//                     className="group relative bg-gray-50 rounded-xl p-6 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border-2 border-transparent hover:border-blue-300 transition-all duration-200 text-left"
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className="flex-shrink-0">
//                         {master.avatarUrl ? (
//                           <img
//                             src={master.avatarUrl}
//                             alt={master.name}
//                             className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all"
//                           />
//                         ) : (
//                           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all">
//                             <User className="w-8 h-8 text-white" />
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex-1">
//                         <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
//                           {master.name}
//                         </h3>
//                         <p className="text-sm text-gray-600 mt-1">
//                           Нажмите для выбора
//                         </p>
//                       </div>

//                       <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Навигация назад */}
//           <div className="border-t border-gray-200 p-6 md:p-8 bg-gray-50">
//             <Link
//               href="/booking/services"
//               className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
//             >
//               <svg 
//                 className="w-5 h-5" 
//                 fill="none" 
//                 stroke="currentColor" 
//                 viewBox="0 0 24 24"
//               >
//                 <path 
//                   strokeLinecap="round" 
//                   strokeLinejoin="round" 
//                   strokeWidth={2} 
//                   d="M15 19l-7-7 7-7" 
//                 />
//               </svg>
//               Вернуться к выбору услуг
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* =========================
//    Обёртка
// ========================= */

// export default function MasterPage(): JSX.Element {
//   return (
//     <Suspense
//       fallback={
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-8 shadow-xl">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Загрузка…</p>
//           </div>
//         </div>
//       }
//     >
//       <MasterInner />
//     </Suspense>
//   );
// }



//--------------добавляем аватар
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import PremiumProgressBar from '@/components/PremiumProgressBar';

// // Типы из API
// interface MasterDto {
//   id: string;
//   name: string;
// }

// interface ApiResponse {
//   masters: MasterDto[];
//   defaultMasterId: string | null;
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// export default function MasterPage() {
//   const router = useRouter();
//   const [masters, setMasters] = useState<MasterDto[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedMaster, setSelectedMaster] = useState<string | null>(null);

//   // Загрузка мастеров из API
//   useEffect(() => {
//     const fetchMasters = async () => {
//       try {
//         setLoading(true);

//         // Получаем выбранные услуги из sessionStorage
//         const selectedServicesStr = sessionStorage.getItem('selectedServices');
//         const selectedServices = selectedServicesStr ? JSON.parse(selectedServicesStr) : [];

//         // Формируем URL с параметрами
//         const params = new URLSearchParams();
//         selectedServices.forEach((id: string) => {
//           params.append('serviceIds', id);
//         });

//         const response = await fetch(`/api/masters?${params.toString()}`);

//         if (!response.ok) {
//           throw new Error('Ошибка загрузки мастеров');
//         }

//         const data: ApiResponse = await response.json();
//         setMasters(data.masters);

//         // Автоматически выбираем первого мастера, если есть
//         if (data.defaultMasterId) {
//           setSelectedMaster(data.defaultMasterId);
//         }

//         setError(null);
//       } catch (err) {
//         console.error('Error fetching masters:', err);
//         setError('Не удалось загрузить мастеров');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMasters();
//   }, []);

//   const handleContinue = () => {
//     if (!selectedMaster) return;

//     // Сохраняем выбранного мастера
//     sessionStorage.setItem('selectedMaster', selectedMaster);
//     router.push('/booking/calendar');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="pt-32">
//           <div className="animate-pulse text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
//             Загрузка мастеров...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />
//         <div className="pt-32 text-center">
//           <div className="text-2xl text-red-400 mb-4">❌ {error}</div>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-3 bg-cyan-400 text-black rounded-full font-medium"
//           >
//             Попробовать снова
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Progress Bar */}
//       <PremiumProgressBar currentStep={1} steps={BOOKING_STEPS} />

//       {/* Фоновые эффекты */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
//         <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
//       </div>

//       {/* Основной контент */}
//       <div className="relative pt-32 pb-32 px-4">
//         <div className="container mx-auto max-w-7xl">

//           {/* Заголовок */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-12"
//           >
//             <h1 className="text-5xl md:text-6xl font-bold mb-4">
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600">
//                 Выберите мастера
//               </span>
//             </h1>
//             <p className="text-xl text-white/60">
//               Наши профессионалы создадут идеальный образ для вас
//             </p>
//           </motion.div>

//           {/* Опция "Любой мастер" */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="flex justify-center mb-12"
//           >
//             <motion.div
//               whileHover={{ scale: 1.02 }}
//               onClick={() => setSelectedMaster('any')}
//               className={`
//                 cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 max-w-md
//                 ${selectedMaster === 'any'
//                   ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.3)]'
//                   : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
//                 }
//               `}
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(147,51,234,0.5)]">
//                   🎲
//                 </div>
//                 <div className="flex-1">
//                   <div className="font-bold text-lg mb-1">Любой доступный мастер</div>
//                   <div className="text-white/60 text-sm">Ближайшее свободное время</div>
//                 </div>
//                 {selectedMaster === 'any' && (
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                   >
//                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
//                       <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                       </svg>
//                     </div>
//                   </motion.div>
//                 )}
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* Сетка мастеров */}
//           {masters.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//               <AnimatePresence mode="popLayout">
//                 {masters.map((master, index) => {
//                   const isSelected = selectedMaster === master.id;

//                   return (
//                     <motion.div
//                       key={master.id}
//                       layout
//                       initial={{ opacity: 0, scale: 0.9 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       exit={{ opacity: 0, scale: 0.9 }}
//                       transition={{ delay: index * 0.05 }}
//                       onClick={() => setSelectedMaster(master.id)}
//                       className={`
//                         group relative cursor-pointer rounded-3xl overflow-hidden
//                         transition-all duration-500
//                         ${isSelected
//                           ? 'bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,212,255,0.3)]'
//                           : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
//                         }
//                       `}
//                     >
//                       {/* Контент карточки */}
//                       <div className="p-6">
//                         <div className="flex items-start gap-4 mb-4">
//                           {/* Аватар */}
//                           <div className={`
//                             w-20 h-20 rounded-full flex items-center justify-center text-4xl
//                             bg-gradient-to-br from-cyan-400 to-blue-600
//                             shadow-[0_0_20px_rgba(0,212,255,0.4)]
//                             ${isSelected ? 'scale-110' : ''}
//                             transition-all duration-300
//                           `}>
//                             👤
//                           </div>

//                           <div className="flex-1">
//                             <h3 className="text-2xl font-bold mb-1 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-blue-600 transition-all duration-300">
//                               {master.name}
//                             </h3>
//                             <p className="text-white/60 text-sm">
//                               Профессиональный мастер
//                             </p>
//                           </div>

//                           {/* Чекбокс */}
//                           {isSelected && (
//                             <motion.div
//                               initial={{ scale: 0 }}
//                               animate={{ scale: 1 }}
//                               className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.5)]"
//                             >
//                               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                               </svg>
//                             </motion.div>
//                           )}
//                         </div>
//                       </div>

//                       {/* Эффект свечения при hover */}
//                       <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-blue-600/0 group-hover:from-cyan-400/5 group-hover:to-blue-600/5 transition-all duration-500 pointer-events-none"></div>
//                     </motion.div>
//                   );
//                 })}
//               </AnimatePresence>
//             </div>
//           ) : (
//             <div className="text-center py-20">
//               <div className="text-6xl mb-4">🔍</div>
//               <div className="text-2xl text-white/60 mb-2">Мастера не найдены</div>
//               <div className="text-white/40">Попробуйте выбрать другие услуги</div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Фиксированная нижняя панель */}
//       <AnimatePresence>
//         {selectedMaster && (
//           <motion.div
//             initial={{ y: 100, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 100, opacity: 0 }}
//             className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 p-6"
//           >
//             <div className="container mx-auto max-w-7xl flex items-center justify-between flex-wrap gap-4">
//               <div>
//                 <div className="text-sm text-white/60 mb-1">
//                   Выбранный мастер
//                 </div>
//                 <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
//                   {selectedMaster === 'any'
//                     ? 'Любой доступный мастер'
//                     : masters.find(m => m.id === selectedMaster)?.name
//                   }
//                 </div>
//               </div>

//               <button
//                 onClick={handleContinue}
//                 className="
//                   px-8 py-4 rounded-full font-bold text-lg
//                   bg-gradient-to-r from-cyan-400 to-blue-600
//                   text-black shadow-[0_0_30px_rgba(0,212,255,0.5)]
//                   hover:shadow-[0_0_40px_rgba(0,212,255,0.7)]
//                   hover:scale-105
//                   transition-all duration-300
//                   flex items-center gap-2
//                 "
//               >
//                 Продолжить
//                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
