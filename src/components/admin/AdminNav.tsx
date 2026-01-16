// src/components/admin/AdminNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Newspaper,
  Scissors,
  ClipboardList,
  Users,
  CalendarDays,
  BarChart3,
  UserCog,
  UserSquare2,
  User,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { IconGlow, type GlowTone } from "./IconGlow";

type NavItem = {
  key:
    | "dashboard"
    | "profile"
    | "news"
    | "services"
    | "bookings"
    | "clients"
    | "masters"
    | "calendar"
    | "users"
    | "stats"
    | "monitoring";
  href: string;
  title: string;
  icon: React.ReactNode;
};

const NAV_ALL: NavItem[] = [
  { key: "dashboard", href: "/admin", title: "Дашборд", icon: <LayoutDashboard className="h-5 w-5" /> },
  { key: "profile", href: "/admin/profile", title: "Профиль", icon: <User className="h-5 w-5" /> },
  { key: "news", href: "/admin/news", title: "Новости", icon: <Newspaper className="h-5 w-5" /> },
  { key: "services", href: "/admin/services", title: "Услуги", icon: <Scissors className="h-5 w-5" /> },
  { key: "bookings", href: "/admin/bookings", title: "Заявки", icon: <ClipboardList className="h-5 w-5" /> },
  { key: "clients", href: "/admin/clients", title: "Клиенты", icon: <Users className="h-5 w-5" /> },
  { key: "masters", href: "/admin/masters", title: "Мастера", icon: <UserSquare2 className="h-5 w-5" /> },
  { key: "calendar", href: "/admin/calendar", title: "Календарь", icon: <CalendarDays className="h-5 w-5" /> },
  { key: "users", href: "/admin/users", title: "Пользователи", icon: <UserCog className="h-5 w-5" /> },
  { key: "stats", href: "/admin/stats", title: "Статистика", icon: <BarChart3 className="h-5 w-5" /> },
  { key: "monitoring", href: "/admin/dashboard", title: "Мониторинг", icon: <LayoutDashboard className="h-5 w-5" /> },
];

const VISIBLE_BY_ROLE: Record<Role, NavItem["key"][]> = {
  ADMIN: [
    "dashboard",
    "profile",
    "news",
    "services",
    "bookings",
    "clients",
    "masters",
    "calendar",
    "users",
    "stats",
    "monitoring",
  ],
  MASTER: ["dashboard", "profile", "bookings", "clients", "calendar"],
  USER: ["dashboard", "profile"],
};

const COLORS: Record<
  NavItem["key"],
  {
    icon: string;
    ring: string;
    chipFrom: string;
    chipTo: string;
    itemGlow: string;
    glow: GlowTone;
  }
> = {
  dashboard: {
    icon: "text-violet-300",
    ring: "ring-violet-400/30",
    chipFrom: "from-violet-600/25",
    chipTo: "to-sky-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(124,58,237,0.45)]",
    glow: "violet",
  },
  profile: {
    icon: "text-cyan-300",
    ring: "ring-cyan-400/30",
    chipFrom: "from-cyan-600/25",
    chipTo: "to-sky-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(8,145,178,0.45)]",
    glow: "cyan",
  },
  news: {
    icon: "text-sky-300",
    ring: "ring-sky-400/30",
    chipFrom: "from-sky-600/25",
    chipTo: "to-cyan-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(2,132,199,0.45)]",
    glow: "sky",
  },
  services: {
    icon: "text-rose-300",
    ring: "ring-rose-400/30",
    chipFrom: "from-rose-600/25",
    chipTo: "to-pink-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(244,63,94,0.45)]",
    glow: "rose",
  },
  bookings: {
    icon: "text-emerald-300",
    ring: "ring-emerald-400/30",
    chipFrom: "from-emerald-600/25",
    chipTo: "to-teal-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(16,185,129,0.45)]",
    glow: "emerald",
  },
  clients: {
    icon: "text-amber-300",
    ring: "ring-amber-400/30",
    chipFrom: "from-amber-600/25",
    chipTo: "to-orange-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(245,158,11,0.45)]",
    glow: "amber",
  },
  masters: {
    icon: "text-teal-300",
    ring: "ring-teal-400/30",
    chipFrom: "from-teal-600/25",
    chipTo: "to-cyan-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(20,184,166,0.45)]",
    glow: "teal",
  },
  calendar: {
    icon: "text-indigo-300",
    ring: "ring-indigo-400/30",
    chipFrom: "from-indigo-600/25",
    chipTo: "to-blue-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(79,70,229,0.45)]",
    glow: "indigo",
  },
  users: {
    icon: "text-lime-300",
    ring: "ring-lime-400/30",
    chipFrom: "from-lime-600/25",
    chipTo: "to-green-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(132,204,22,0.45)]",
    glow: "lime",
  },
  stats: {
    icon: "text-fuchsia-300",
    ring: "ring-fuchsia-400/30",
    chipFrom: "from-fuchsia-600/25",
    chipTo: "to-purple-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(217,70,239,0.45)]",
    glow: "fuchsia",
  },
  monitoring: {
    icon: "text-orange-300",
    ring: "ring-orange-400/30",
    chipFrom: "from-orange-600/25",
    chipTo: "to-amber-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(251,146,60,0.45)]",
    glow: "amber",
  },
};

export default function AdminNav({
  bookingsBadge = 0,
  role,
}: {
  bookingsBadge?: number;
  role: Role;
}): React.ReactElement {
  const pathname = usePathname();

  const visibleKeys = VISIBLE_BY_ROLE[role];

  const items = useMemo(
    () => NAV_ALL.filter((i) => visibleKeys.includes(i.key)),
    [visibleKeys]
  );

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="space-y-1.5">
      {items.map((item) => {
        const active = isActive(item.href);
        const c = COLORS[item.key];

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`
              flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all
              border border-white/5 
              ${
                active
                  ? `bg-white/[0.06] border-white/10 ring-1 ring-white/10 ${c.itemGlow}`
                  : "bg-white/[0.02] hover:bg-white/[0.05]"
              }
              ${active ? "text-white" : "text-slate-300"}
              focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60
              active:scale-[0.98]
            `}
            aria-current={active ? "page" : undefined}
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="shrink-0"
            >
              <IconGlow
                tone={c.glow}
                className={`h-9 w-9 ring-1 ${c.ring} bg-gradient-to-br ${c.chipFrom} ${c.chipTo}`}
              >
                <span className={c.icon}>{item.icon}</span>
              </IconGlow>
            </motion.span>

            <span className="font-medium truncate">{item.title}</span>

            {item.key === "bookings" && bookingsBadge > 0 && (
              <span
                className="ml-auto inline-flex items-center justify-center rounded-full shrink-0
                           bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5
                           ring-1 ring-emerald-400/30 font-semibold min-w-[24px]"
              >
                {bookingsBadge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}






//-----------добавляем кнопку Мониторинг регистрации--------
// // src/components/admin/AdminNav.tsx
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useMemo } from "react";
// import { motion } from "framer-motion";
// import {
//   LayoutDashboard,
//   Newspaper,
//   Scissors,
//   ClipboardList,
//   Users,
//   CalendarDays,
//   BarChart3,
//   UserCog,
//   UserSquare2,
//   User,
// } from "lucide-react";
// import type { Role } from "@prisma/client";
// import { IconGlow, type GlowTone } from "./IconGlow";

// type NavItem = {
//   key:
//     | "dashboard"
//     | "profile"
//     | "news"
//     | "services"
//     | "bookings"
//     | "clients"
//     | "masters"
//     | "calendar"
//     | "users"
//     | "stats";
//   href: string;
//   title: string;
//   icon: React.ReactNode;
// };

// const NAV_ALL: NavItem[] = [
//   { key: "dashboard", href: "/admin", title: "Дашборд", icon: <LayoutDashboard className="h-5 w-5" /> },
//   { key: "profile", href: "/admin/profile", title: "Профиль", icon: <User className="h-5 w-5" /> },
//   { key: "news", href: "/admin/news", title: "Новости", icon: <Newspaper className="h-5 w-5" /> },
//   { key: "services", href: "/admin/services", title: "Услуги", icon: <Scissors className="h-5 w-5" /> },
//   { key: "bookings", href: "/admin/bookings", title: "Заявки", icon: <ClipboardList className="h-5 w-5" /> },
//   { key: "clients", href: "/admin/clients", title: "Клиенты", icon: <Users className="h-5 w-5" /> },
//   { key: "masters", href: "/admin/masters", title: "Мастера", icon: <UserSquare2 className="h-5 w-5" /> },
//   { key: "calendar", href: "/admin/calendar", title: "Календарь", icon: <CalendarDays className="h-5 w-5" /> },
//   { key: "users", href: "/admin/users", title: "Пользователи", icon: <UserCog className="h-5 w-5" /> },
//   { key: "stats", href: "/admin/stats", title: "Статистика", icon: <BarChart3 className="h-5 w-5" /> },
// ];

// const VISIBLE_BY_ROLE: Record<Role, NavItem["key"][]> = {
//   ADMIN: [
//     "dashboard",
//     "profile",
//     "news",
//     "services",
//     "bookings",
//     "clients",
//     "masters",
//     "calendar",
//     "users",
//     "stats",
//   ],
//   MASTER: ["dashboard", "profile", "bookings", "clients", "calendar"],
//   USER: ["dashboard", "profile"],
// };

// const COLORS: Record<
//   NavItem["key"],
//   {
//     icon: string;
//     ring: string;
//     chipFrom: string;
//     chipTo: string;
//     itemGlow: string;
//     glow: GlowTone;
//   }
// > = {
//   dashboard: {
//     icon: "text-violet-300",
//     ring: "ring-violet-400/30",
//     chipFrom: "from-violet-600/25",
//     chipTo: "to-sky-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(124,58,237,0.45)]",
//     glow: "violet",
//   },
//   profile: {
//     icon: "text-cyan-300",
//     ring: "ring-cyan-400/30",
//     chipFrom: "from-cyan-600/25",
//     chipTo: "to-sky-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(8,145,178,0.45)]",
//     glow: "cyan",
//   },
//   news: {
//     icon: "text-sky-300",
//     ring: "ring-sky-400/30",
//     chipFrom: "from-sky-600/25",
//     chipTo: "to-cyan-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(2,132,199,0.45)]",
//     glow: "sky",
//   },
//   services: {
//     icon: "text-rose-300",
//     ring: "ring-rose-400/30",
//     chipFrom: "from-rose-600/25",
//     chipTo: "to-pink-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(244,63,94,0.45)]",
//     glow: "rose",
//   },
//   bookings: {
//     icon: "text-emerald-300",
//     ring: "ring-emerald-400/30",
//     chipFrom: "from-emerald-600/25",
//     chipTo: "to-teal-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(16,185,129,0.45)]",
//     glow: "emerald",
//   },
//   clients: {
//     icon: "text-amber-300",
//     ring: "ring-amber-400/30",
//     chipFrom: "from-amber-600/25",
//     chipTo: "to-orange-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(245,158,11,0.45)]",
//     glow: "amber",
//   },
//   masters: {
//     icon: "text-teal-300",
//     ring: "ring-teal-400/30",
//     chipFrom: "from-teal-600/25",
//     chipTo: "to-cyan-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(20,184,166,0.45)]",
//     glow: "teal",
//   },
//   calendar: {
//     icon: "text-indigo-300",
//     ring: "ring-indigo-400/30",
//     chipFrom: "from-indigo-600/25",
//     chipTo: "to-blue-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(79,70,229,0.45)]",
//     glow: "indigo",
//   },
//   users: {
//     icon: "text-lime-300",
//     ring: "ring-lime-400/30",
//     chipFrom: "from-lime-600/25",
//     chipTo: "to-green-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(132,204,22,0.45)]",
//     glow: "lime",
//   },
//   stats: {
//     icon: "text-fuchsia-300",
//     ring: "ring-fuchsia-400/30",
//     chipFrom: "from-fuchsia-600/25",
//     chipTo: "to-purple-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(217,70,239,0.45)]",
//     glow: "fuchsia",
//   },
// };

// export default function AdminNav({
//   bookingsBadge = 0,
//   role,
// }: {
//   bookingsBadge?: number;
//   role: Role;
// }): React.ReactElement {
//   const pathname = usePathname();

//   const visibleKeys = VISIBLE_BY_ROLE[role];

//   const items = useMemo(
//     () => NAV_ALL.filter((i) => visibleKeys.includes(i.key)),
//     [visibleKeys]
//   );

//   const isActive = (href: string) =>
//     href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

//   return (
//     <nav className="space-y-1.5">
//       {items.map((item) => {
//         const active = isActive(item.href);
//         const c = COLORS[item.key];

//         return (
//           <Link
//             key={item.key}
//             href={item.href}
//             className={`
//               flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all
//               border border-white/5 
//               ${
//                 active
//                   ? `bg-white/[0.06] border-white/10 ring-1 ring-white/10 ${c.itemGlow}`
//                   : "bg-white/[0.02] hover:bg-white/[0.05]"
//               }
//               ${active ? "text-white" : "text-slate-300"}
//               focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60
//               active:scale-[0.98]
//             `}
//             aria-current={active ? "page" : undefined}
//           >
//             <motion.span
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               transition={{ type: "spring", stiffness: 400, damping: 20 }}
//               className="shrink-0"
//             >
//               <IconGlow
//                 tone={c.glow}
//                 className={`h-9 w-9 ring-1 ${c.ring} bg-gradient-to-br ${c.chipFrom} ${c.chipTo}`}
//               >
//                 <span className={c.icon}>{item.icon}</span>
//               </IconGlow>
//             </motion.span>

//             <span className="font-medium truncate">{item.title}</span>

//             {item.key === "bookings" && bookingsBadge > 0 && (
//               <span
//                 className="ml-auto inline-flex items-center justify-center rounded-full shrink-0
//                            bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5
//                            ring-1 ring-emerald-400/30 font-semibold min-w-[24px]"
//               >
//                 {bookingsBadge}
//               </span>
//             )}
//           </Link>
//         );
//       })}
//     </nav>
//   );
// }





//--------работало до 05.01.26 делаем адаптацию----------
// // src/components/admin/AdminNav.tsx
// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState, useMemo } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   LayoutDashboard,
//   Newspaper,
//   Scissors,
//   ClipboardList,
//   Users,
//   CalendarDays,
//   BarChart3,
//   ChevronDown,
//   UserCog,
//   UserSquare2,
//   User, // ← иконка профиля
// } from "lucide-react";
// import type { Role } from "@prisma/client";

// type NavItem = {
//   key:
//     | "dashboard"
//     | "profile"   // ← добавили
//     | "news"
//     | "services"
//     | "bookings"
//     | "clients"
//     | "masters"
//     | "calendar"
//     | "users"
//     | "stats";
//   href: string;
//   title: string;
//   icon: React.ReactNode;
// };

// const NAV_ALL: NavItem[] = [
//   { key: "dashboard", href: "/admin",           title: "Дашборд",      icon: <LayoutDashboard className="h-5 w-5" /> },
//   { key: "profile",   href: "/admin/profile",   title: "Профиль",      icon: <User className="h-5 w-5" /> },
//   { key: "news",      href: "/admin/news",      title: "Новости",      icon: <Newspaper className="h-5 w-5" /> },
//   { key: "services",  href: "/admin/services",  title: "Услуги",       icon: <Scissors className="h-5 w-5" /> },
//   { key: "bookings",  href: "/admin/bookings",  title: "Заявки",       icon: <ClipboardList className="h-5 w-5" /> },
//   { key: "clients",   href: "/admin/clients",   title: "Клиенты",      icon: <Users className="h-5 w-5" /> },
//   { key: "masters",   href: "/admin/masters",   title: "Мастера",      icon: <UserSquare2 className="h-5 w-5" /> },
//   { key: "calendar",  href: "/admin/calendar",  title: "Календарь",    icon: <CalendarDays className="h-5 w-5" /> },
//   { key: "users",     href: "/admin/users",     title: "Пользователи", icon: <UserCog className="h-5 w-5" /> },
//   { key: "stats",     href: "/admin/stats",     title: "Статистика",   icon: <BarChart3 className="h-5 w-5" /> },
// ];

// /** Какие пункты видны каждой роли */
// const VISIBLE_BY_ROLE: Record<Role, NavItem["key"][]> = {
//   ADMIN: [
//     "dashboard",
//     "profile",
//     "news",
//     "services",
//     "bookings",
//     "clients",
//     "masters",
//     "calendar",
//     "users",
//     "stats",
//   ],
//   MASTER: ["dashboard", "profile", "bookings", "clients", "calendar"],
//   USER: ["dashboard", "profile"],
// };

// /** Цветовые пресеты (явные классы, чтобы Tailwind не выкинул) */
// const COLORS: Record<
//   NavItem["key"],
//   {
//     icon: string;
//     ring: string;
//     chipFrom: string;
//     chipTo: string;
//     itemGlow: string;
//   }
// > = {
//   dashboard: {
//     icon: "text-violet-300",
//     ring: "ring-violet-400/30",
//     chipFrom: "from-violet-600/25",
//     chipTo: "to-sky-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(124,58,237,0.45)]",
//   },
//   profile: {
//     icon: "text-cyan-300",
//     ring: "ring-cyan-400/30",
//     chipFrom: "from-cyan-600/25",
//     chipTo: "to-sky-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(8,145,178,0.45)]",
//   },
//   news: {
//     icon: "text-sky-300",
//     ring: "ring-sky-400/30",
//     chipFrom: "from-sky-600/25",
//     chipTo: "to-cyan-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(2,132,199,0.45)]",
//   },
//   services: {
//     icon: "text-rose-300",
//     ring: "ring-rose-400/30",
//     chipFrom: "from-rose-600/25",
//     chipTo: "to-pink-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(244,63,94,0.45)]",
//   },
//   bookings: {
//     icon: "text-emerald-300",
//     ring: "ring-emerald-400/30",
//     chipFrom: "from-emerald-600/25",
//     chipTo: "to-teal-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(16,185,129,0.45)]",
//   },
//   clients: {
//     icon: "text-amber-300",
//     ring: "ring-amber-400/30",
//     chipFrom: "from-amber-600/25",
//     chipTo: "to-orange-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(245,158,11,0.45)]",
//   },
//   masters: {
//     icon: "text-teal-300",
//     ring: "ring-teal-400/30",
//     chipFrom: "from-teal-600/25",
//     chipTo: "to-cyan-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(20,184,166,0.45)]",
//   },
//   calendar: {
//     icon: "text-indigo-300",
//     ring: "ring-indigo-400/30",
//     chipFrom: "from-indigo-600/25",
//     chipTo: "to-blue-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(79,70,229,0.45)]",
//   },
//   users: {
//     icon: "text-lime-300",
//     ring: "ring-lime-400/30",
//     chipFrom: "from-lime-600/25",
//     chipTo: "to-green-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(132,204,22,0.45)]",
//   },
//   stats: {
//     icon: "text-fuchsia-300",
//     ring: "ring-fuchsia-400/30",
//     chipFrom: "from-fuchsia-600/25",
//     chipTo: "to-purple-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(217,70,239,0.45)]",
//   },
// };

// const baseItem =
//   "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60";
// const activeShell = "bg-white/[0.03] border-white/10 ring-1 ring-white/10";
// const textMuted = "text-slate-300";
// const textActive = "text-white";

// export default function AdminNav({
//   bookingsBadge = 0,
//   role,
// }: {
//   bookingsBadge?: number;
//   role: Role;
// }): React.ReactElement {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);

//   const visibleKeys = VISIBLE_BY_ROLE[role];

//   // Список пунктов по роли
//   const items = useMemo(
//     () => NAV_ALL.filter((i) => visibleKeys.includes(i.key)),
//     [visibleKeys]
//   );

//   const isActive = (href: string) =>
//     href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

//   const [first, ...rest] = items;

//   const renderItem = (item: NavItem) => {
//     const active = isActive(item.href);
//     const c = COLORS[item.key];
//     const cls = [
//       baseItem,
//       active ? `${activeShell} ${c.itemGlow}` : "",
//       active ? textActive : textMuted,
//     ]
//       .filter(Boolean)
//       .join(" ");

//     return (
//       <Link
//         href={item.href}
//         className={cls}
//         aria-current={active ? "page" : undefined}
//       >
//         <motion.span
//           whileHover={{ scale: 1.07, rotate: 1 }}
//           whileTap={{ scale: 0.96 }}
//           transition={{ type: "spring", stiffness: 300, damping: 18 }}
//           className={[
//             "inline-flex h-8 w-8 items-center justify-center rounded-lg",
//             "bg-gradient-to-br",
//             c.chipFrom,
//             c.chipTo,
//             "ring-1",
//             c.ring,
//           ].join(" ")}
//         >
//           <span className={c.icon}>{item.icon}</span>
//         </motion.span>

//         <span className="font-medium">{item.title}</span>

//         {item.key === "bookings" && bookingsBadge > 0 && (
//           <span
//             className="ml-auto inline-flex items-center justify-center rounded-full
//                        bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5
//                        ring-1 ring-emerald-400/30"
//           >
//             {bookingsBadge}
//           </span>
//         )}
//       </Link>
//     );
//   };

//   const desktopList = useMemo(() => {
//     return (
//       <ul className="hidden lg:block space-y-2">
//         {rest.map((item) => (
//           <li key={item.key}>{renderItem(item)}</li>
//         ))}
//       </ul>
//     );
//   }, [pathname, bookingsBadge, role, rest]);

//   const IconChevron = (
//     <ChevronDown
//       className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
//     />
//   );

//   return (
//     <nav className="space-y-2">
//       {first && (
//         <>
//           {/* первый пункт (Дашборд) */}
//           <div className="group relative">
//             <Link
//               href={first.href}
//               className={[
//                 baseItem,
//                 isActive(first.href)
//                   ? `${activeShell} ${COLORS.dashboard.itemGlow}`
//                   : "",
//                 isActive(first.href) ? textActive : textMuted,
//               ].join(" ")}
//             >
//               <motion.span
//                 whileHover={{ scale: 1.07, rotate: 1 }}
//                 whileTap={{ scale: 0.96 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 18 }}
//                 className={[
//                   "inline-flex h-8 w-8 items-center justify-center rounded-lg",
//                   "bg-gradient-to-br",
//                   COLORS.dashboard.chipFrom,
//                   COLORS.dashboard.chipTo,
//                   "ring-1",
//                   COLORS.dashboard.ring,
//                 ].join(" ")}
//               >
//                 <span className={COLORS.dashboard.icon}>{first.icon}</span>
//               </motion.span>

//               <span className="font-medium">{first.title}</span>

//               <button
//                 type="button"
//                 aria-label={open ? "Скрыть разделы" : "Показать разделы"}
//                 onClick={(e) => {
//                   e.preventDefault();
//                   setOpen((v) => !v);
//                 }}
//                 className="ml-auto lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg
//                            border border-white/10 bg-white/5 text-slate-300/80
//                            hover:bg-white/10 hover:text-white transition"
//               >
//                 {IconChevron}
//               </button>
//             </Link>
//           </div>

//           {/* моб. список */}
//           <div className="lg:hidden">
//             <AnimatePresence initial={false}>
//               {open && (
//                 <motion.ul
//                   key="mobile-list"
//                   initial={{ height: 0, opacity: 0 }}
//                   animate={{ height: "auto", opacity: 1 }}
//                   exit={{ height: 0, opacity: 0 }}
//                   transition={{ duration: 0.25, ease: "easeOut" }}
//                   className="space-y-2 overflow-hidden"
//                 >
//                   {rest.map((item) => (
//                     <li key={item.key}>{renderItem(item)}</li>
//                   ))}
//                 </motion.ul>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* десктоп список */}
//           {desktopList}
//         </>
//       )}
//     </nav>
//   );
// }









// --------------оставим пока------------------------
// src/components/admin/AdminNav.tsx
//"use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState, useMemo } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   LayoutDashboard,
//   Newspaper,
//   Scissors,
//   ClipboardList,
//   Users,
//   CalendarDays,
//   BarChart3,
//   ChevronDown,
//   UserCog,
//   UserSquare2,
// } from "lucide-react";
// import type { Role } from "@prisma/client";

// type NavItem = {
//   key:
//     | "dashboard"
//     | "news"
//     | "services"
//     | "bookings"
//     | "clients"
//     | "masters"
//     | "calendar"
//     | "users"
//     | "stats";
//   href: string;
//   title: string;
//   icon: React.ReactNode;
// };

// const NAV_ALL: NavItem[] = [
//   { key: "dashboard", href: "/admin",          title: "Дашборд",      icon: <LayoutDashboard className="h-5 w-5" /> },
//   { key: "news",      href: "/admin/news",     title: "Новости",      icon: <Newspaper className="h-5 w-5" /> },
//   { key: "services",  href: "/admin/services", title: "Услуги",       icon: <Scissors className="h-5 w-5" /> },
//   { key: "bookings",  href: "/admin/bookings", title: "Заявки",       icon: <ClipboardList className="h-5 w-5" /> },
//   { key: "clients",   href: "/admin/clients",  title: "Клиенты",      icon: <Users className="h-5 w-5" /> },
//   { key: "masters",   href: "/admin/masters",  title: "Мастера",      icon: <UserSquare2 className="h-5 w-5" /> },
//   { key: "calendar",  href: "/admin/calendar", title: "Календарь",    icon: <CalendarDays className="h-5 w-5" /> },
//   { key: "users",     href: "/admin/users",    title: "Пользователи", icon: <UserCog className="h-5 w-5" /> },
//   { key: "stats",     href: "/admin/stats",    title: "Статистика",   icon: <BarChart3 className="h-5 w-5" /> },
// ];

// /** Какие пункты видны каждой роли */
// const VISIBLE_BY_ROLE: Record<Role, NavItem["key"][]> = {
//   ADMIN: [
//     "dashboard",
//     "news",
//     "services",
//     "bookings",
//     "clients",
//     "masters",
//     "calendar",
//     "users",
//     "stats",
//   ],
//   MASTER: ["dashboard", "bookings", "clients", "calendar"],
//   USER: ["dashboard"],
// };

// /** Цветовые пресеты (явные классы, чтобы Tailwind не выкинул) */
// const COLORS: Record<
//   NavItem["key"],
//   {
//     icon: string;
//     ring: string;
//     chipFrom: string;
//     chipTo: string;
//     itemGlow: string;
//   }
// > = {
//   dashboard: {
//     icon: "text-violet-300",
//     ring: "ring-violet-400/30",
//     chipFrom: "from-violet-600/25",
//     chipTo: "to-sky-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(124,58,237,0.45)]",
//   },
//   news: {
//     icon: "text-sky-300",
//     ring: "ring-sky-400/30",
//     chipFrom: "from-sky-600/25",
//     chipTo: "to-cyan-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(2,132,199,0.45)]",
//   },
//   services: {
//     icon: "text-rose-300",
//     ring: "ring-rose-400/30",
//     chipFrom: "from-rose-600/25",
//     chipTo: "to-pink-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(244,63,94,0.45)]",
//   },
//   bookings: {
//     icon: "text-emerald-300",
//     ring: "ring-emerald-400/30",
//     chipFrom: "from-emerald-600/25",
//     chipTo: "to-teal-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(16,185,129,0.45)]",
//   },
//   clients: {
//     icon: "text-amber-300",
//     ring: "ring-amber-400/30",
//     chipFrom: "from-amber-600/25",
//     chipTo: "to-orange-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(245,158,11,0.45)]",
//   },
//   masters: {
//     icon: "text-teal-300",
//     ring: "ring-teal-400/30",
//     chipFrom: "from-teal-600/25",
//     chipTo: "to-cyan-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(20,184,166,0.45)]",
//   },
//   calendar: {
//     icon: "text-indigo-300",
//     ring: "ring-indigo-400/30",
//     chipFrom: "from-indigo-600/25",
//     chipTo: "to-blue-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(79,70,229,0.45)]",
//   },
//   users: {
//     icon: "text-lime-300",
//     ring: "ring-lime-400/30",
//     chipFrom: "from-lime-600/25",
//     chipTo: "to-green-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(132,204,22,0.45)]",
//   },
//   stats: {
//     icon: "text-fuchsia-300",
//     ring: "ring-fuchsia-400/30",
//     chipFrom: "from-fuchsia-600/25",
//     chipTo: "to-purple-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(217,70,239,0.45)]",
//   },
// };

// const baseItem =
//   "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60";
// const activeShell = "bg-white/[0.03] border-white/10 ring-1 ring-white/10";
// const textMuted = "text-slate-300";
// const textActive = "text-white";

// export default function AdminNav({
//   bookingsBadge = 0,
//   role,
// }: {
//   bookingsBadge?: number;
//   role: Role;
// }): React.ReactElement {
//   const pathname = usePathname();
//   const [open, setOpen] = useState(false);

//   const visibleKeys = VISIBLE_BY_ROLE[role];

//   // Фильтруем список пунктов по роли (хук вызывается всегда)
//   const items = useMemo(
//     () => NAV_ALL.filter((i) => visibleKeys.includes(i.key)),
//     [visibleKeys]
//   );

//   const isActive = (href: string) =>
//     href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

//   const [first, ...rest] = items;

//   const renderItem = (item: NavItem) => {
//     const active = isActive(item.href);
//     const c = COLORS[item.key];
//     const cls = [
//       baseItem,
//       active ? `${activeShell} ${c.itemGlow}` : "",
//       active ? textActive : textMuted,
//     ]
//       .filter(Boolean)
//       .join(" ");

//     return (
//       <Link
//         href={item.href}
//         className={cls}
//         aria-current={active ? "page" : undefined}
//       >
//         <motion.span
//           whileHover={{ scale: 1.07, rotate: 1 }}
//           whileTap={{ scale: 0.96 }}
//           transition={{ type: "spring", stiffness: 300, damping: 18 }}
//           className={[
//             "inline-flex h-8 w-8 items-center justify-center rounded-lg",
//             "bg-gradient-to-br",
//             c.chipFrom,
//             c.chipTo,
//             "ring-1",
//             c.ring,
//           ].join(" ")}
//         >
//           <span className={c.icon}>{item.icon}</span>
//         </motion.span>

//         <span className="font-medium">{item.title}</span>

//         {item.key === "bookings" && bookingsBadge > 0 && (
//           <span
//             className="ml-auto inline-flex items-center justify-center rounded-full
//                        bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5
//                        ring-1 ring-emerald-400/30"
//           >
//             {bookingsBadge}
//           </span>
//         )}
//       </Link>
//     );
//   };

//   // Мемоизированный десктоп-список (хук вызывается ВСЕГДА)
//   const desktopList = useMemo(() => {
//     return (
//       <ul className="hidden lg:block space-y-2">
//         {rest.map((item) => (
//           <li key={item.key}>{renderItem(item)}</li>
//         ))}
//       </ul>
//     );
//   }, [pathname, bookingsBadge, role, rest]); // завиcимости указаны явно

//   const IconChevron = (
//     <ChevronDown
//       className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
//     />
//   );

//   return (
//     <nav className="space-y-2">
//       {/* Если нет доступных пунктов, просто ничего не рисуем */}
//       {first && (
//         <>
//           {/* Дашборд — всегда первый */}
//           <div className="group relative">
//             <Link
//               href={first.href}
//               className={[
//                 baseItem,
//                 isActive(first.href)
//                   ? `${activeShell} ${COLORS.dashboard.itemGlow}`
//                   : "",
//                 isActive(first.href) ? textActive : textMuted,
//               ].join(" ")}
//             >
//               <motion.span
//                 whileHover={{ scale: 1.07, rotate: 1 }}
//                 whileTap={{ scale: 0.96 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 18 }}
//                 className={[
//                   "inline-flex h-8 w-8 items-center justify-center rounded-lg",
//                   "bg-gradient-to-br",
//                   COLORS.dashboard.chipFrom,
//                   COLORS.dashboard.chipTo,
//                   "ring-1",
//                   COLORS.dashboard.ring,
//                 ].join(" ")}
//               >
//                 <span className={COLORS.dashboard.icon}>{first.icon}</span>
//               </motion.span>

//               <span className="font-medium">{first.title}</span>

//               {/* раскрытие для мобилы */}
//               <button
//                 type="button"
//                 aria-label={open ? "Скрыть разделы" : "Показать разделы"}
//                 onClick={(e) => {
//                   e.preventDefault();
//                   setOpen((v) => !v);
//                 }}
//                 className="ml-auto lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg
//                            border border-white/10 bg-white/5 text-slate-300/80
//                            hover:bg-white/10 hover:text-white transition"
//               >
//                 {IconChevron}
//               </button>
//             </Link>
//           </div>

//           {/* Мобилка: список с анимацией */}
//           <div className="lg:hidden">
//             <AnimatePresence initial={false}>
//               {open && (
//                 <motion.ul
//                   key="mobile-list"
//                   initial={{ height: 0, opacity: 0 }}
//                   animate={{ height: "auto", opacity: 1 }}
//                   exit={{ height: 0, opacity: 0 }}
//                   transition={{ duration: 0.25, ease: "easeOut" }}
//                   className="space-y-2 overflow-hidden"
//                 >
//                   {rest.map((item) => (
//                     <li key={item.key}>{renderItem(item)}</li>
//                   ))}
//                 </motion.ul>
//               )}
//             </AnimatePresence>
//           </div>

//           {/* Десктоп — статичный список */}
//           {desktopList}
//         </>
//       )}
//     </nav>
//   );
// }
