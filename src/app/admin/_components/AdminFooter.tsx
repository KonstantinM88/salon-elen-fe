// src/app/admin/_components/AdminFooter.tsx
'use client';

import Link from 'next/link';
import {
  ArrowUp,
  BarChart3,
  CalendarRange,
  Layers3,
  Newspaper,
  Scissors,
  Users,
  PanelsTopLeft,
  LifeBuoy,
  Send,
} from 'lucide-react';
import { useCallback } from 'react';

export default function AdminFooter() {
  const year = new Date().getFullYear();

  const scrollTop = useCallback(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // no-op
    }
  }, []);

  return (
    <footer className="mt-6 md:mt-8">
      {/* Основная стеклянная панель */}
      <div
        className="relative overflow-hidden rounded-3xl border
                   border-gray-200 dark:border-slate-800/80
                   bg-white/80 dark:bg-slate-950/50
                   backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-950/40
                   p-5 md:p-6 shadow-sm dark:shadow-none"
      >
        {/* Акцентный градиент */}
        <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-72 rounded-full bg-gradient-to-r from-violet-600/10 dark:from-violet-600/30 via-fuchsia-500/10 dark:via-fuchsia-500/25 to-cyan-500/10 dark:to-cyan-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-72 rounded-full bg-gradient-to-r from-cyan-500/10 dark:from-cyan-500/25 via-sky-500/10 dark:via-sky-500/20 to-violet-600/10 dark:to-violet-600/25 blur-3xl" />

        {/* Верхняя строка */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-violet-600/10 dark:from-violet-600/20 to-sky-500/5 dark:to-sky-500/10 p-2.5 ring-1 ring-violet-200 dark:ring-white/5">
              <PanelsTopLeft className="h-5 w-5 text-violet-500 dark:text-violet-300" />
            </div>
            <div>
              <div className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                Панель администратора
                <span className="ml-2 align-middle rounded-full bg-emerald-100 dark:bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-400/20">
                  Online
                </span>
              </div>
              <p className="text-[13px] text-gray-500 dark:text-white/70">
                Быстрые ссылки, поддержка и полезные материалы — всегда под рукой.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-600/20 transition hover:brightness-110"
            >
              <Scissors className="h-4 w-4" />
              Быстрая запись
            </Link>
            <button
              onClick={scrollTop}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium
                         text-gray-700 dark:text-slate-200
                         ring-1 ring-gray-200 dark:ring-white/10
                         hover:bg-gray-50 dark:hover:bg-white/5 transition"
              title="Наверх"
            >
              <ArrowUp className="h-4 w-4" />
              Вверх
            </button>
          </div>
        </div>

        {/* Ссылки */}
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <FooterLink href="/admin/news" icon={<Newspaper className="h-4 w-4" />} label="Новости" />
          <FooterLink href="/admin/services" icon={<Scissors className="h-4 w-4" />} label="Услуги" />
          <FooterLink href="/admin/bookings" icon={<CalendarRange className="h-4 w-4" />} label="Заявки" />
          <FooterLink href="/admin/clients" icon={<Users className="h-4 w-4" />} label="Клиенты" />
          <FooterLink href="/admin/promotions" icon={<Users className="h-4 w-4" />} label="Акции" />
          <FooterLink href="/admin/masters" icon={<Layers3 className="h-4 w-4" />} label="Сотрудники" />
          <FooterLink href="/admin/calendar" icon={<CalendarRange className="h-4 w-4" />} label="Календарь" />
          <FooterLink href="/admin/stats" icon={<BarChart3 className="h-4 w-4" />} label="Статистика" />
          <FooterLink href="/admin" icon={<PanelsTopLeft className="h-4 w-4" />} label="Дашборд" />
        </div>

        {/* Нижняя строка */}
        <div
          className="mt-6 flex flex-col-reverse items-start gap-3
                     border-t border-gray-200 dark:border-white/5 pt-4
                     md:flex-row md:items-center md:justify-between"
        >
          <div className="text-[13px] text-gray-500 dark:text-white/70">
            © {year} Salon Elen · Система онлайн-записи и админ-панель
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px]
                         text-gray-700 dark:text-slate-200
                         ring-1 ring-gray-200 dark:ring-white/10
                         hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              <LifeBuoy className="h-4 w-4" />
              Поддержка
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px]
                         text-gray-700 dark:text-slate-200
                         ring-1 ring-gray-200 dark:ring-white/10
                         hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              <Send className="h-4 w-4" />
              Telegram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center justify-between rounded-2xl
                 border border-gray-100 dark:border-white/5
                 bg-gray-50/50 dark:bg-white/[0.02]
                 px-3 py-2 text-sm
                 text-gray-700 dark:text-slate-100
                 transition
                 hover:bg-gray-100 dark:hover:bg-white/[0.04]
                 hover:border-gray-200 dark:hover:border-white/10"
    >
      <span className="inline-flex items-center gap-2">
        <span className="rounded-lg bg-gray-100 dark:bg-white/5 p-1.5 ring-1 ring-gray-200 dark:ring-white/10 text-gray-600 dark:text-slate-200">
          {icon}
        </span>
        {label}
      </span>
      <ArrowUp className="h-4 w-4 rotate-90 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-70" />
    </Link>
  );
}


//-----19.02.26 адаптируем под светлую тему
// 'use client';

// import Link from 'next/link';
// import {
//   ArrowUp,
//   BarChart3,
//   CalendarRange,
//   Layers3,
//   Newspaper,
//   Scissors,
//   Users,
//   PanelsTopLeft,
//   LifeBuoy,
//   Send,
// } from 'lucide-react';
// import { useCallback } from 'react';

// export default function AdminFooter() {
//   const year = new Date().getFullYear();

//   const scrollTop = useCallback(() => {
//     try {
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     } catch {
//       // no-op
//     }
//   }, []);

//   return (
//     <footer className="mt-6 md:mt-8">
//       {/* Основная стеклянная панель */}
//       <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/50 backdrop-blur supports-[backdrop-filter]:bg-slate-950/40 p-5 md:p-6">
//         {/* Акцентный градиент */}
//         <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-72 rounded-full bg-gradient-to-r from-violet-600/30 via-fuchsia-500/25 to-cyan-500/25 blur-3xl" />
//         <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-72 rounded-full bg-gradient-to-r from-cyan-500/25 via-sky-500/20 to-violet-600/25 blur-3xl" />

//         {/* Верхняя строка */}
//         <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//           <div className="flex items-center gap-3">
//             <div className="rounded-xl bg-gradient-to-br from-violet-600/20 to-sky-500/10 p-2.5 ring-1 ring-white/5">
//               <PanelsTopLeft className="h-5 w-5 text-violet-300" />
//             </div>
//             <div>
//               <div className="text-base md:text-lg font-semibold">
//                 Панель администратора
//                 <span className="ml-2 align-middle rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/20">
//                   Online
//                 </span>
//               </div>
//               <p className="text-[13px] opacity-70">
//                 Быстрые ссылки, поддержка и полезные материалы — всегда под рукой.
//               </p>
//             </div>
//           </div>

//           <div className="flex gap-2">
//             <Link
//               href="/admin/bookings"
//               className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-600/20 transition hover:brightness-110"
//             >
//               <Scissors className="h-4 w-4" />
//               Быстрая запись
//             </Link>
//             <button
//               onClick={scrollTop}
//               className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/10 hover:bg-white/5 transition"
//               title="Наверх"
//             >
//               <ArrowUp className="h-4 w-4" />
//               Вверх
//             </button>
//           </div>
//         </div>

//         {/* Ссылки */}
//         <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
//           <FooterLink href="/admin/news" icon={<Newspaper className="h-4 w-4" />} label="Новости" />
//           <FooterLink href="/admin/services" icon={<Scissors className="h-4 w-4" />} label="Услуги" />
//           <FooterLink href="/admin/bookings" icon={<CalendarRange className="h-4 w-4" />} label="Заявки" />
//           <FooterLink href="/admin/clients" icon={<Users className="h-4 w-4" />} label="Клиенты" />
//           <FooterLink href="/admin/promotions" icon={<Users className="h-4 w-4" />} label="Акции" />
//           <FooterLink href="/admin/masters" icon={<Layers3 className="h-4 w-4" />} label="Сотрудники" />
//           <FooterLink href="/admin/calendar" icon={<CalendarRange className="h-4 w-4" />} label="Календарь" />
//           <FooterLink href="/admin/stats" icon={<BarChart3 className="h-4 w-4" />} label="Статистика" />
//           <FooterLink href="/admin" icon={<PanelsTopLeft className="h-4 w-4" />} label="Дашборд" />
//         </div>

//         {/* Нижняя строка */}
//         <div className="mt-6 flex flex-col-reverse items-start gap-3 border-t border-white/5 pt-4 md:flex-row md:items-center md:justify-between">
//           <div className="text-[13px] opacity-70">
//             © {year} Salon Elen · Система онлайн-записи и админ-панель
//           </div>
//           <div className="flex flex-wrap items-center gap-2">
//             <a
//               href="#"
//               className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] text-slate-200 ring-1 ring-white/10 hover:bg-white/5 transition"
//             >
//               <LifeBuoy className="h-4 w-4" />
//               Поддержка
//             </a>
//             <a
//               href="#"
//               className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] text-slate-200 ring-1 ring-white/10 hover:bg-white/5 transition"
//             >
//               <Send className="h-4 w-4" />
//               Telegram
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

// function FooterLink({
//   href,
//   icon,
//   label,
// }: {
//   href: string;
//   icon: React.ReactNode;
//   label: string;
// }) {
//   return (
//     <Link
//       href={href}
//       className="group inline-flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-slate-100 transition
//                  hover:bg-white/[0.04] hover:border-white/10"
//     >
//       <span className="inline-flex items-center gap-2">
//         <span className="rounded-lg bg-white/5 p-1.5 ring-1 ring-white/10 text-slate-200">
//           {icon}
//         </span>
//         {label}
//       </span>
//       <ArrowUp className="h-4 w-4 rotate-90 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-70" />
//     </Link>
//   );
// }
