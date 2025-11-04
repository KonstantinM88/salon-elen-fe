'use client';

import React, { useEffect } from 'react';

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Включаем режим букинга (чтобы выборочно прятать глобальный хедер сайта)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('booking-scope');
    return () => {
      root.classList.remove('booking-scope');
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {children}

      {/* Глобальные стили ТОЛЬКО для секции букинга */}
      <style jsx global>{`
        /***********************
         * 1) Прячем всё, что относится к общему сайту,
         *    чтобы в букинге остался ТОЛЬКО прогресс-бар шагов
         ************************/
        .booking-scope header:not(.booking-header),
        .booking-scope [data-site-header],
        .booking-scope .site-header,
        .booking-scope .app-header,
        .booking-scope .main-navbar,
        .booking-scope .top-navbar,
        .booking-scope nav[role='navigation']:not(.booking-nav),
        .booking-scope footer.site-footer,
        .booking-scope .global-footer {
          display: none !important;
          visibility: hidden !important;
        }

        /* На всякий случай убираем возможные верхние отступы у внешних контейнеров */
        .booking-scope .page,
        .booking-scope .page-wrapper,
        .booking-scope main {
          padding-top: 0 !important;
          margin-top: 0 !important;
        }

        /***********************
         * 2) Липкая «шапка» букинга — это обёртка,
         *    в которую на страницах вставлен PremiumProgressBar.
         *    Делаем её красивой, с подсветкой и тонкой золотой линией.
         ************************/
        .booking-scope .booking-progress-wrap {
          position: sticky;
          top: calc(env(safe-area-inset-top, 0px) + 8px); /* мягко «опускаем» от края */
          z-index: 50;
          padding: 8px 0; /* визуальное дыхание над/под прогресс-баром */
          backdrop-filter: saturate(140%) blur(8px);
          background: linear-gradient(180deg, rgba(0,0,0,0.72), rgba(0,0,0,0.42));
          border-bottom: 1px solid rgba(255, 215, 0, 0.12);
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.45),
            0 0 0 1px rgba(255, 255, 255, 0.03) inset;
        }
        /* тонкая «золотая» полоса под шапкой (чуть глубины) */
        .booking-scope .booking-progress-wrap::after {
          content: '';
          display: block;
          height: 2px;
          background: linear-gradient(
            90deg,
            rgba(245,197,24,0) 0%,
            rgba(245,197,24,0.55) 15%,
            rgba(253,224,71,0.65) 50%,
            rgba(245,197,24,0.55) 85%,
            rgba(245,197,24,0) 100%
          );
          opacity: 0.85;
        }

        /***********************
         * 3) Контент под шапкой
         *    (используй класс booking-content на корневом блоке страницы)
         ************************/
        .booking-scope .booking-content {
          /* базовый отступ под липкую шапку */
          margin-top: 8px;
          /* если где-то контент прямо у края — пусть будет ещё приятнее */
          scroll-margin-top: 120px;
        }

        /***********************
         * 4) Мелкие полировки для больших экранов
         ************************/
        @media (min-width: 1280px) {
          .booking-scope .booking-progress-wrap {
            top: calc(env(safe-area-inset-top, 0px) + 12px);
            padding: 10px 0;
          }
          .booking-scope .booking-content {
            margin-top: 12px;
          }
        }
      `}</style>
    </div>
  );
}





// // src/app/booking/layout.tsx
// 'use client';

// import type { ReactNode } from 'react';
// import { usePathname } from 'next/navigation';

// /**
//  * Layout для /booking:
//  *  - для шагов бронирования (services/master/calendar/client/verify/payment/confirmation/success)
//  *    НЕ добавляем контейнер/карточку — рендерим «как есть» (full-bleed).
//  *  - для остальных страниц внутри /booking — оставляем прежний компактный вид.
//  */
// export default function BookingLayout({ children }: { children: ReactNode }) {
//   const pathname = usePathname();

//   // Роуты пошагового бронирования (без групп скобок)
//   const stepRoots = [
//     '/booking/services',
//     '/booking/master',
//     '/booking/calendar',
//     '/booking/client',
//     '/booking/verify',
//     '/booking/payment',
//     '/booking/confirmation',
//     '/booking/success',
//   ];

//   const isStep = !!pathname && stepRoots.some((p) => pathname.startsWith(p));

//   if (isStep) {
//     // Для шагов — никаких обёрток: страница полностью управляет своим layout’ом
//     return <>{children}</>;
//   }

//   // Для «обычных» страниц /booking — прежняя карточка
//   return (
//     <div className="container max-w-4xl py-6">
//       <div className="rounded-2xl backdrop-blur-md bg-white/60 dark:bg-neutral-900/50 shadow-lg ring-1 ring-black/5 p-4">
//         <h1 className="text-2xl font-semibold tracking-tight mb-4">Онлайн-запись</h1>
//         {children}
//       </div>
//     </div>
//   );
// }



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
