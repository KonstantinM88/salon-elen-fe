// src/app/admin/_components/AdminShellClient.tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { Role } from "@/lib/prisma-client";
import { useTheme } from "next-themes";

import AdminNav from "@/components/admin/AdminNav";
import AdminFooter from "../_components/AdminFooter";
import type { SeoLocale } from "@/lib/seo-locale";

type AdminShellClientProps = {
  children: ReactNode;
  bookingsBadge: number;
  role: Role;
  locale: SeoLocale;
};

type AdminShellCopy = {
  adminMenu: string;
  closeMenu: string;
  adminPanel: string;
  openMenu: string;
  adminShort: string;
};

const ADMIN_SHELL_COPY: Record<SeoLocale, AdminShellCopy> = {
  de: {
    adminMenu: "Admin-Menue",
    closeMenu: "Menue schliessen",
    adminPanel: "Admin-Panel",
    openMenu: "Menue oeffnen",
    adminShort: "Admin",
  },
  ru: {
    adminMenu: "Меню админки",
    closeMenu: "Закрыть меню",
    adminPanel: "Панель админа",
    openMenu: "Открыть меню",
    adminShort: "Админ",
  },
  en: {
    adminMenu: "Admin Menu",
    closeMenu: "Close menu",
    adminPanel: "Admin Panel",
    openMenu: "Open menu",
    adminShort: "Admin",
  },
};

export default function AdminShellClient({
  children,
  bookingsBadge,
  role,
  locale,
}: AdminShellClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { setTheme } = useTheme();
  const didForceDark = useRef(false);
  const t = ADMIN_SHELL_COPY[locale];

  // На входе в админку всегда стартуем с dark.
  // Пользователь может переключить тему вручную в интерфейсе.
  useEffect(() => {
    if (didForceDark.current) return;
    didForceDark.current = true;
    setTheme("dark");
  }, [setTheme]);

  return (
    <>
      {/* ── МОБИЛЬНОЕ МЕНЮ — Полноэкранный оверлей ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Затемнение */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Панель меню */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw]
                         bg-white dark:bg-slate-950 
                         border-r border-gray-200 dark:border-slate-800 
                         z-50 overflow-y-auto lg:hidden
                         shadow-2xl dark:shadow-black/50"
            >
              <div className="p-4">
                {/* Хедер */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    {t.adminMenu}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label={t.closeMenu}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl
                               border border-gray-200 dark:border-white/10 
                               bg-gray-50 dark:bg-white/5 
                               hover:bg-gray-100 dark:hover:bg-white/10 transition"
                  >
                    <X className="h-5 w-5 text-gray-700 dark:text-slate-200" />
                  </button>
                </div>

                <AdminNav
                  role={role}
                  bookingsBadge={bookingsBadge}
                  onNavigate={() => setMobileMenuOpen(false)}
                  locale={locale}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── ОСНОВНОЙ LAYOUT ── */}
      <div className="admin-shell min-h-screen p-3 sm:p-4 lg:p-6">
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-[260px_1fr]">
          {/* 📱 МОБИЛЬНАЯ ШАПКА */}
          <div className="lg:hidden">
            <div className="card-glass card-glass-accent card-glow p-4 flex items-center justify-between">
              <div className="text-sm uppercase tracking-wider text-gray-500 dark:text-slate-400">
                {t.adminPanel}
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label={t.openMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl
                           border border-gray-200 dark:border-white/10 
                           bg-gray-50 dark:bg-white/5 
                           hover:bg-gray-100 dark:hover:bg-white/10 
                           transition-all hover:scale-105 active:scale-95"
              >
                <Menu className="h-5 w-5 text-gray-700 dark:text-slate-200" />
              </button>
            </div>
          </div>

          {/* 🖥️ ДЕСКТОПНЫЙ САЙДБАР */}
          <aside className="hidden lg:block card-glass card-glass-accent card-glow p-4 h-fit sticky top-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400">
                {t.adminShort}
              </div>
            </div>
            <AdminNav role={role} bookingsBadge={bookingsBadge} locale={locale} />
          </aside>

          {/* 📄 КОНТЕНТ */}
          <section className="card-glass card-glass-accent card-glow p-4 sm:p-5 lg:p-6 overflow-x-auto overflow-y-visible">
            {children}
            <AdminFooter locale={locale} />
          </section>
        </div>
      </div>
    </>
  );
}



//-----19.02.26 адаптируем под светлую тему
// "use client";

// import { useState, type ReactNode } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Menu, X } from "lucide-react";
// import type { Role } from "@prisma/client";

// import AdminNav from "@/components/admin/AdminNav";
// import AdminFooter from "../_components/AdminFooter";

// type AdminShellClientProps = {
//   children: ReactNode;
//   bookingsBadge: number;
//   role: Role;
// };

// export default function AdminShellClient({
//   children,
//   bookingsBadge,
//   role,
// }: AdminShellClientProps) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

//   return (
//     <>
//       {/* 🔥 МОБИЛЬНОЕ МЕНЮ - Полноэкранный оверлей */}
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <>
//             {/* Затемнение фона */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setMobileMenuOpen(false)}
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
//             />

//             {/* Панель меню */}
//             <motion.aside
//               initial={{ x: "-100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "-100%" }}
//               transition={{ type: "spring", damping: 30, stiffness: 300 }}
//               className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] 
//                          bg-slate-950 border-r border-slate-800 z-50 overflow-y-auto lg:hidden
//                          shadow-2xl shadow-black/50"
//             >
//               <div className="p-4">
//                 {/* Хедер с кнопкой закрытия */}
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="text-sm uppercase tracking-wider text-slate-400">
//                     Admin Menu
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setMobileMenuOpen(false)}
//                     aria-label="Закрыть меню"
//                     className="inline-flex h-10 w-10 items-center justify-center rounded-xl 
//                                border border-white/10 bg-white/5 hover:bg-white/10 transition"
//                   >
//                     <X className="h-5 w-5 text-slate-200" />
//                   </button>
//                 </div>

//                 {/* Навигация */}
//                 <AdminNav role={role} bookingsBadge={bookingsBadge} />
//               </div>
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>

//       {/* 🖥️ ОСНОВНОЙ LAYOUT */}
//       <div className="admin-shell min-h-screen p-3 sm:p-4 lg:p-6">
//         <div className="grid gap-4 lg:gap-6 lg:grid-cols-[260px_1fr]">
//           {/* 📱 МОБИЛЬНАЯ ШАПКА (только на мобильных) */}
//           <div className="lg:hidden">
//             <div className="card-glass card-glass-accent card-glow p-4 flex items-center justify-between">
//               <div className="text-sm uppercase tracking-wider text-slate-400">
//                 Admin Panel
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setMobileMenuOpen(true)}
//                 aria-label="Открыть меню"
//                 className="inline-flex h-10 w-10 items-center justify-center rounded-xl 
//                            border border-white/10 bg-white/5 hover:bg-white/10 transition-all
//                            hover:scale-105 active:scale-95"
//               >
//                 <Menu className="h-5 w-5 text-slate-200" />
//               </button>
//             </div>
//           </div>

//           {/* 🖥️ ДЕСКТОПНЫЙ САЙДБАР (скрыт на мобильных) */}
//           <aside className="hidden lg:block card-glass card-glass-accent card-glow p-4 h-fit sticky top-6">
//             <div className="mb-4 flex items-center justify-between">
//               <div className="text-xs uppercase tracking-wider text-slate-400">
//                 Admin
//               </div>
//             </div>
//             <AdminNav role={role} bookingsBadge={bookingsBadge} />
//           </aside>

//           {/* 📄 КОНТЕНТ */}
//           <section className="card-glass card-glass-accent card-glow p-4 sm:p-5 lg:p-6 overflow-x-auto overflow-y-visible">
//             {children}
//             <AdminFooter />
//           </section>
//         </div>
//       </div>
//     </>
//   );
// }





//--------работало до 05.01.25 делаем адаптацию----------
// "use client";

// import { useState, type ReactNode } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Menu, ChevronLeft } from "lucide-react";
// import type { Role } from "@prisma/client";

// import AdminNav from "@/components/admin/AdminNav";
// import AdminFooter from "../_components/AdminFooter";

// type AdminShellClientProps = {
//   children: ReactNode;
//   bookingsBadge: number;
//   role: Role; // ← добавили
// };

// export default function AdminShellClient({
//   children,
//   bookingsBadge,
//   role,
// }: AdminShellClientProps) {
//   const [open, setOpen] = useState<boolean>(false);

//   return (
//     <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
//       {/* Сайдбар */}
//       <aside className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
//         {/* Хедер сайдбара */}
//         <div className="mb-3 flex items-center justify-between">
//           <div className="text-xs uppercase tracking-wider text-slate-400">
//             Admin
//           </div>

//           {/* Тогглер (мобилка) */}
//           <div className="flex items-center gap-2 lg:hidden">
//             {!open ? (
//               <button
//                 type="button"
//                 onClick={() => setOpen(true)}
//                 aria-label="Открыть меню"
//                 title="Открыть меню"
//                 className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5"
//               >
//                 <Menu className="h-5 w-5 text-slate-200" />
//                 <span className="sr-only">Открыть меню</span>
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 onClick={() => setOpen(false)}
//                 aria-label="Свернуть меню"
//                 title="Свернуть меню"
//                 className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5"
//               >
//                 <ChevronLeft className="h-5 w-5 text-slate-200" />
//                 <span className="sr-only">Свернуть меню</span>
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Навигация */}
//         <div className="lg:block">
//           <AnimatePresence>
//             {open && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 28 }}
//                 className="overflow-hidden lg:hidden"
//               >
//                 <AdminNav role={role} bookingsBadge={bookingsBadge} />
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Десктоп */}
//           <div className="hidden lg:block">
//             <AdminNav role={role} bookingsBadge={bookingsBadge} />
//           </div>
//         </div>
//       </aside>

//       {/* Контент */}
//       <section className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 lg:p-6">
//         {children}
//         <AdminFooter />
//       </section>
//     </div>
//   );
// }

