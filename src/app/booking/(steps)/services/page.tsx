//src/app/booking/(steps)/services/page.tsx
'use client';

import * as React from 'react';
import { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ChevronRight, AlertTriangle } from 'lucide-react';

type Service = {
  id: string;
  title: string;
  description?: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string | null;
};

type Group = {
  id: string;
  title: string;
  services: Service[];
};

type Promotion = {
  id: string;
  title: string;
  percent: number;
  isGlobal: boolean;
};

type Payload = {
  groups: Group[];
  promotions: Promotion[];
};

function formatPriceEUR(cents: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatMinutes(min: number): string {
  return `${min} мин`;
}

function applyBestDiscount(cents: number, promotions: Promotion[]): number {
  const best = promotions
    .filter(p => p.isGlobal && p.percent > 0)
    .reduce<number>((acc, p) => Math.max(acc, p.percent), 0);
  if (!best) return cents;
  const discounted = Math.round(cents * (100 - best) / 100);
  return Math.max(0, discounted);
}

export default function ServicesPage(): JSX.Element {
  const router = useRouter();
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [masterWarning, setMasterWarning] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/booking/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`Failed to load services: ${res.status}`);
        const data: Payload = await res.json();
        if (!cancelled) {
          setGroups(data.groups ?? []);
          setPromotions(data.promotions ?? []);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load services';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleService = (id: string): void => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Проверка совместимости мастеров
  React.useEffect(() => {
    if (selected.size === 0) {
      setMasterWarning(null);
      return;
    }

    let cancelled = false;

    async function checkMasterCompatibility(): Promise<void> {
      try {
        const serviceIdsParam = Array.from(selected).join(',');
        const res = await fetch(`/api/masters?serviceIds=${encodeURIComponent(serviceIdsParam)}`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to check masters');

        const data = await res.json();
        const masters = Array.isArray(data.masters) ? data.masters : [];

        if (!cancelled) {
          if (masters.length === 0) {
            setMasterWarning(
              'Эти услуги выполняются разными мастерами. Пожалуйста, оформите отдельные записи для несовместимых услуг.'
            );
          } else {
            setMasterWarning(null);
          }
        }
      } catch (e) {
        console.error('Master compatibility check failed:', e);
        if (!cancelled) setMasterWarning(null);
      }
    }

    void checkMasterCompatibility();

    return () => {
      cancelled = true;
    };
  }, [selected]);

  const flatServices: Service[] = React.useMemo(
    () => groups.flatMap(g => g.services),
    [groups],
  );

  const byId: Record<string, Service> = React.useMemo(() => {
    const acc: Record<string, Service> = {};
    for (const s of flatServices) acc[s.id] = s;
    return acc;
  }, [flatServices]);

  const selectedServices: Service[] = React.useMemo(
    () => Array.from(selected).map(id => byId[id]).filter(Boolean),
    [selected, byId],
  );

  const totalDurationMin = React.useMemo(
    () => selectedServices.reduce((sum, s) => sum + (s.durationMin || 0), 0),
    [selectedServices],
  );

  const totalPriceCents = React.useMemo(
    () =>
      selectedServices.reduce((sum, s) => {
        const base = s.priceCents ?? 0;
        return sum + applyBestDiscount(base, promotions);
      }, 0),
    [selectedServices, promotions],
  );

  // КРИТИЧЕСКИЙ ФИКС: правильная генерация URL с множественными параметрами
  const getMasterUrl = React.useCallback((): string => {
    const params = new URLSearchParams();
    Array.from(selected).forEach(id => {
      params.append('s', id);
    });
    return `/booking/master?${params.toString()}`;
  }, [selected]);

  const handleProceed = (e: React.MouseEvent): void => {
    e.preventDefault();
    const url = getMasterUrl();
    console.log('Navigating to:', url);
    router.push(url);
  };

  const canProceed = selected.size > 0 && !masterWarning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-32">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <ShoppingBag className="w-8 h-8" />
              Онлайн запись
            </h1>
            <p className="text-blue-100 mt-2">Шаг 1: Выбор услуг</p>
          </div>

          <div className="p-6 md:p-8">
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Загрузка услуг…</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <p className="text-red-700 font-semibold">Ошибка: {error}</p>
              </div>
            )}

            {masterWarning && (
              <div className="mb-6 rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-800 font-medium">
                    {masterWarning}
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && groups.map(group => (
              <div key={group.id} className="mb-8 last:mb-0">
                <h2 className="text-xl font-bold text-gray-800 mb-4 px-2 border-l-4 border-blue-500 pl-3">
                  {group.title}
                </h2>
                <div className="space-y-3">
                  {group.services.map(svc => {
                    const checked = selected.has(svc.id);
                    const base = svc.priceCents ?? 0;
                    const withDiscount = applyBestDiscount(base, promotions);
                    const hasDiscount = withDiscount !== base;

                    return (
                      <label
                        key={svc.id}
                        className={`
                          group flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all duration-200
                          ${checked 
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-lg ring-2 ring-blue-200' 
                            : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 w-6 h-6 text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          checked={checked}
                          onChange={() => toggleService(svc.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className={`text-lg font-semibold transition-colors ${
                                checked ? 'text-blue-700' : 'text-gray-800 group-hover:text-blue-600'
                              }`}>
                                {svc.title}
                              </h3>
                              {svc.description && (
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                  {svc.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  ⏱️ {formatMinutes(svc.durationMin)}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {hasDiscount ? (
                                <div>
                                  <div className="text-base text-gray-400 line-through">
                                    {formatPriceEUR(base)}
                                  </div>
                                  <div className="text-xl font-bold text-green-600">
                                    {formatPriceEUR(withDiscount)}
                                  </div>
                                  <div className="text-xs text-green-600 font-medium">
                                    Скидка!
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xl font-bold text-gray-800">
                                  {formatPriceEUR(base)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating footer */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
          <div className="max-w-4xl mx-auto px-4 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center sm:text-left">
                <div className="text-sm text-gray-600 mb-1">
                  Выбрано услуг: <span className="font-bold text-blue-600">{selected.size}</span>
                </div>
                <div className="flex items-baseline justify-center sm:justify-start gap-4">
                  <span className="text-3xl font-bold text-gray-800">
                    {formatPriceEUR(totalPriceCents)}
                  </span>
                  <span className="text-base text-gray-600">
                    • {formatMinutes(totalDurationMin)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleProceed}
                disabled={!canProceed}
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform
                  ${canProceed
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                  }
                `}
              >
                Выбрать мастера
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




//----------работал но старый дизайн ниже 03/11----------
// //src/app/booking/(steps)/services/page.tsx
// 'use client';

// import * as React from 'react';
// import { JSX } from 'react';
// import { useRouter } from 'next/navigation';
// import { ShoppingBag, ChevronRight, AlertTriangle } from 'lucide-react';

// type Service = {
//   id: string;
//   title: string;
//   description?: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string | null;
// };

// type Group = {
//   id: string;
//   title: string;
//   services: Service[];
// };

// type Promotion = {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// };

// type Payload = {
//   groups: Group[];
//   promotions: Promotion[];
// };

// function formatPriceEUR(cents: number): string {
//   return new Intl.NumberFormat('de-DE', {
//     style: 'currency',
//     currency: 'EUR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(cents / 100);
// }

// function formatMinutes(min: number): string {
//   return `${min} мин`;
// }

// function applyBestDiscount(cents: number, promotions: Promotion[]): number {
//   const best = promotions
//     .filter(p => p.isGlobal && p.percent > 0)
//     .reduce<number>((acc, p) => Math.max(acc, p.percent), 0);
//   if (!best) return cents;
//   const discounted = Math.round(cents * (100 - best) / 100);
//   return Math.max(0, discounted);
// }

// export default function ServicesPage(): JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = React.useState<Group[]>([]);
//   const [promotions, setPromotions] = React.useState<Promotion[]>([]);
//   const [selected, setSelected] = React.useState<Set<string>>(new Set());
//   const [loading, setLoading] = React.useState<boolean>(true);
//   const [error, setError] = React.useState<string | null>(null);
//   const [masterWarning, setMasterWarning] = React.useState<string | null>(null);

//   React.useEffect(() => {
//     let cancelled = false;

//     async function load(): Promise<void> {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch('/api/booking/services', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         });
//         if (!res.ok) throw new Error(`Failed to load services: ${res.status}`);
//         const data: Payload = await res.json();
//         if (!cancelled) {
//           setGroups(data.groups ?? []);
//           setPromotions(data.promotions ?? []);
//         }
//       } catch (e: unknown) {
//         const msg = e instanceof Error ? e.message : 'Failed to load services';
//         if (!cancelled) setError(msg);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const toggleService = (id: string): void => {
//     setSelected(prev => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };

//   // Проверка совместимости мастеров
//   React.useEffect(() => {
//     if (selected.size === 0) {
//       setMasterWarning(null);
//       return;
//     }

//     let cancelled = false;

//     async function checkMasterCompatibility(): Promise<void> {
//       try {
//         const serviceIdsParam = Array.from(selected).join(',');
//         const res = await fetch(`/api/masters?serviceIds=${encodeURIComponent(serviceIdsParam)}`, {
//           method: 'GET',
//           cache: 'no-store',
//         });

//         if (!res.ok) throw new Error('Failed to check masters');

//         const data = await res.json();
//         const masters = Array.isArray(data.masters) ? data.masters : [];

//         if (!cancelled) {
//           if (masters.length === 0) {
//             setMasterWarning(
//               'Эти услуги выполняются разными мастерами. Пожалуйста, оформите отдельные записи для несовместимых услуг.'
//             );
//           } else {
//             setMasterWarning(null);
//           }
//         }
//       } catch (e) {
//         console.error('Master compatibility check failed:', e);
//         if (!cancelled) setMasterWarning(null);
//       }
//     }

//     void checkMasterCompatibility();

//     return () => {
//       cancelled = true;
//     };
//   }, [selected]);

//   const flatServices: Service[] = React.useMemo(
//     () => groups.flatMap(g => g.services),
//     [groups],
//   );

//   const byId: Record<string, Service> = React.useMemo(() => {
//     const acc: Record<string, Service> = {};
//     for (const s of flatServices) acc[s.id] = s;
//     return acc;
//   }, [flatServices]);

//   const selectedServices: Service[] = React.useMemo(
//     () => Array.from(selected).map(id => byId[id]).filter(Boolean),
//     [selected, byId],
//   );

//   const totalDurationMin = React.useMemo(
//     () => selectedServices.reduce((sum, s) => sum + (s.durationMin || 0), 0),
//     [selectedServices],
//   );

//   const totalPriceCents = React.useMemo(
//     () =>
//       selectedServices.reduce((sum, s) => {
//         const base = s.priceCents ?? 0;
//         return sum + applyBestDiscount(base, promotions);
//       }, 0),
//     [selectedServices, promotions],
//   );

//   // КРИТИЧЕСКИЙ ФИКС: правильная генерация URL с множественными параметрами
//   const getMasterUrl = React.useCallback((): string => {
//     const params = new URLSearchParams();
//     Array.from(selected).forEach(id => {
//       params.append('s', id);
//     });
//     return `/booking/master?${params.toString()}`;
//   }, [selected]);

//   const handleProceed = (e: React.MouseEvent): void => {
//     e.preventDefault();
//     const url = getMasterUrl();
//     console.log('Navigating to:', url);
//     router.push(url);
//   };

//   const canProceed = selected.size > 0 && !masterWarning;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-32">
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
//             <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
//               <ShoppingBag className="w-8 h-8" />
//               Онлайн запись
//             </h1>
//             <p className="text-blue-100 mt-2">Шаг 1: Выбор услуг</p>
//           </div>

//           <div className="p-6 md:p-8">
//             {loading && (
//               <div className="text-center py-12">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
//                 <p className="mt-4 text-gray-600">Загрузка услуг…</p>
//               </div>
//             )}

//             {error && (
//               <div className="rounded-lg border border-red-200 bg-red-50 p-6">
//                 <p className="text-red-700 font-semibold">Ошибка: {error}</p>
//               </div>
//             )}

//             {masterWarning && (
//               <div className="mb-6 rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
//                 <div className="flex items-start gap-3">
//                   <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
//                   <p className="text-amber-800 font-medium">
//                     {masterWarning}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {!loading && !error && groups.map(group => (
//               <div key={group.id} className="mb-8 last:mb-0">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 px-2 border-l-4 border-blue-500 pl-3">
//                   {group.title}
//                 </h2>
//                 <div className="space-y-3">
//                   {group.services.map(svc => {
//                     const checked = selected.has(svc.id);
//                     const base = svc.priceCents ?? 0;
//                     const withDiscount = applyBestDiscount(base, promotions);
//                     const hasDiscount = withDiscount !== base;

//                     return (
//                       <label
//                         key={svc.id}
//                         className={`
//                           group flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all duration-200
//                           ${checked 
//                             ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-lg ring-2 ring-blue-200' 
//                             : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
//                           }
//                         `}
//                       >
//                         <input
//                           type="checkbox"
//                           className="mt-1 w-6 h-6 text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer"
//                           checked={checked}
//                           onChange={() => toggleService(svc.id)}
//                         />
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-start justify-between gap-4">
//                             <div className="flex-1">
//                               <h3 className={`text-lg font-semibold transition-colors ${
//                                 checked ? 'text-blue-700' : 'text-gray-800 group-hover:text-blue-600'
//                               }`}>
//                                 {svc.title}
//                               </h3>
//                               {svc.description && (
//                                 <p className="text-sm text-gray-600 mt-2 leading-relaxed">
//                                   {svc.description}
//                                 </p>
//                               )}
//                               <div className="flex items-center gap-3 mt-3">
//                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
//                                   ⏱️ {formatMinutes(svc.durationMin)}
//                                 </span>
//                               </div>
//                             </div>
//                             <div className="text-right flex-shrink-0">
//                               {hasDiscount ? (
//                                 <div>
//                                   <div className="text-base text-gray-400 line-through">
//                                     {formatPriceEUR(base)}
//                                   </div>
//                                   <div className="text-xl font-bold text-green-600">
//                                     {formatPriceEUR(withDiscount)}
//                                   </div>
//                                   <div className="text-xs text-green-600 font-medium">
//                                     Скидка!
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <div className="text-xl font-bold text-gray-800">
//                                   {formatPriceEUR(base)}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Floating footer */}
//       {selected.size > 0 && (
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
//           <div className="max-w-4xl mx-auto px-4 py-5">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="flex-1 text-center sm:text-left">
//                 <div className="text-sm text-gray-600 mb-1">
//                   Выбрано услуг: <span className="font-bold text-blue-600">{selected.size}</span>
//                 </div>
//                 <div className="flex items-baseline justify-center sm:justify-start gap-4">
//                   <span className="text-3xl font-bold text-gray-800">
//                     {formatPriceEUR(totalPriceCents)}
//                   </span>
//                   <span className="text-base text-gray-600">
//                     • {formatMinutes(totalDurationMin)}
//                   </span>
//                 </div>
//               </div>
              
//               <button
//                 onClick={handleProceed}
//                 disabled={!canProceed}
//                 className={`
//                   flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform
//                   ${canProceed
//                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
//                     : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
//                   }
//                 `}
//               >
//                 Выбрать мастера
//                 <ChevronRight className="w-6 h-6" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }