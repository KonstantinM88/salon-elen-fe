// src/app/booking/layout.tsx
'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Layout для /booking:
 *  - для шагов бронирования (services/master/calendar/client/verify/payment/confirmation/success)
 *    НЕ добавляем контейнер/карточку — рендерим «как есть» (full-bleed).
 *  - для остальных страниц внутри /booking — оставляем прежний компактный вид.
 */
export default function BookingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Роуты пошагового бронирования (без групп скобок)
  const stepRoots = [
    '/booking/services',
    '/booking/master',
    '/booking/calendar',
    '/booking/client',
    '/booking/verify',
    '/booking/payment',
    '/booking/confirmation',
    '/booking/success',
  ];

  const isStep = !!pathname && stepRoots.some((p) => pathname.startsWith(p));

  if (isStep) {
    // Для шагов — никаких обёрток: страница полностью управляет своим layout’ом
    return <>{children}</>;
  }

  // Для «обычных» страниц /booking — прежняя карточка
  return (
    <div className="container max-w-4xl py-6">
      <div className="rounded-2xl backdrop-blur-md bg-white/60 dark:bg-neutral-900/50 shadow-lg ring-1 ring-black/5 p-4">
        <h1 className="text-2xl font-semibold tracking-tight mb-4">Онлайн-запись</h1>
        {children}
      </div>
    </div>
  );
}



//------был до 04/11
// // src/app/booking/layout.tsx
// import type { ReactNode } from "react";

// export default function BookingLayout({ children }: { children: ReactNode }) {
//   return (
//     <div className="container max-w-4xl py-6">
//       <div className="rounded-2xl backdrop-blur-md bg-white/60 dark:bg-neutral-900/50 shadow-lg ring-1 ring-black/5 p-4">
//         <h1 className="text-2xl font-semibold tracking-tight mb-4">Онлайн-запись</h1>
//         {children}
//       </div>
//     </div>
//   );
// }
