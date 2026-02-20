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
    "dashboard", "profile", "news", "services", "bookings",
    "clients", "masters", "calendar", "users", "stats", "monitoring",
  ],
  MASTER: ["dashboard", "profile", "bookings", "clients", "calendar"],
  USER: ["dashboard", "profile"],
};

const COLORS: Record<
  NavItem["key"],
  {
    iconLight: string;
    iconDark: string;
    ring: string;
    chipFrom: string;
    chipTo: string;
    itemGlow: string;
    glow: GlowTone;
  }
> = {
  dashboard: {
    iconLight: "text-violet-600",
    iconDark: "text-violet-300",
    ring: "ring-violet-400/30",
    chipFrom: "from-violet-600/25",
    chipTo: "to-sky-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(124,58,237,0.45)]",
    glow: "violet",
  },
  profile: {
    iconLight: "text-cyan-600",
    iconDark: "text-cyan-300",
    ring: "ring-cyan-400/30",
    chipFrom: "from-cyan-600/25",
    chipTo: "to-sky-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(8,145,178,0.45)]",
    glow: "cyan",
  },
  news: {
    iconLight: "text-sky-600",
    iconDark: "text-sky-300",
    ring: "ring-sky-400/30",
    chipFrom: "from-sky-600/25",
    chipTo: "to-cyan-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(2,132,199,0.45)]",
    glow: "sky",
  },
  services: {
    iconLight: "text-rose-600",
    iconDark: "text-rose-300",
    ring: "ring-rose-400/30",
    chipFrom: "from-rose-600/25",
    chipTo: "to-pink-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(244,63,94,0.45)]",
    glow: "rose",
  },
  bookings: {
    iconLight: "text-emerald-600",
    iconDark: "text-emerald-300",
    ring: "ring-emerald-400/30",
    chipFrom: "from-emerald-600/25",
    chipTo: "to-teal-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(16,185,129,0.45)]",
    glow: "emerald",
  },
  clients: {
    iconLight: "text-amber-600",
    iconDark: "text-amber-300",
    ring: "ring-amber-400/30",
    chipFrom: "from-amber-600/25",
    chipTo: "to-orange-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(245,158,11,0.45)]",
    glow: "amber",
  },
  masters: {
    iconLight: "text-teal-600",
    iconDark: "text-teal-300",
    ring: "ring-teal-400/30",
    chipFrom: "from-teal-600/25",
    chipTo: "to-cyan-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(20,184,166,0.45)]",
    glow: "teal",
  },
  calendar: {
    iconLight: "text-indigo-600",
    iconDark: "text-indigo-300",
    ring: "ring-indigo-400/30",
    chipFrom: "from-indigo-600/25",
    chipTo: "to-blue-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(79,70,229,0.45)]",
    glow: "indigo",
  },
  users: {
    iconLight: "text-lime-600",
    iconDark: "text-lime-300",
    ring: "ring-lime-400/30",
    chipFrom: "from-lime-600/25",
    chipTo: "to-green-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(132,204,22,0.45)]",
    glow: "lime",
  },
  stats: {
    iconLight: "text-fuchsia-600",
    iconDark: "text-fuchsia-300",
    ring: "ring-fuchsia-400/30",
    chipFrom: "from-fuchsia-600/25",
    chipTo: "to-purple-500/25",
    itemGlow: "shadow-[0_0_30px_-8px_rgba(217,70,239,0.45)]",
    glow: "fuchsia",
  },
  monitoring: {
    iconLight: "text-orange-600",
    iconDark: "text-orange-300",
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
  onNavigate,
}: {
  bookingsBadge?: number;
  role: Role;
  onNavigate?: () => void;
}): React.ReactElement {
  const pathname = usePathname();

  const visibleKeys = VISIBLE_BY_ROLE[role];

  const items = useMemo(
    () => NAV_ALL.filter((i) => visibleKeys.includes(i.key)),
    [visibleKeys],
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
            onClick={onNavigate}
            className={`
              flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all
              border
              ${
                active
                  ? `bg-gray-100 dark:bg-white/[0.06] border-gray-200 dark:border-white/10 
                     ring-1 ring-gray-200 dark:ring-white/10 
                     shadow-sm dark:${c.itemGlow}`
                  : "border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:border-gray-100 dark:hover:border-white/5"
              }
              ${active ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-slate-300"}
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
                <span className={`${c.iconLight} dark:${c.iconDark}`}>{item.icon}</span>
              </IconGlow>
            </motion.span>

            <span className="font-medium truncate">{item.title}</span>

            {item.key === "bookings" && bookingsBadge > 0 && (
              <span
                className="ml-auto inline-flex items-center justify-center rounded-full shrink-0
                           bg-emerald-100 dark:bg-emerald-500/20 
                           text-emerald-700 dark:text-emerald-300 
                           text-[11px] px-2 py-0.5
                           ring-1 ring-emerald-300 dark:ring-emerald-400/30 
                           font-semibold min-w-[24px]"
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



//--------19.02.26 адаптируем под светлую тему
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
//     | "stats"
//     | "monitoring";
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
//   { key: "monitoring", href: "/admin/dashboard", title: "Мониторинг", icon: <LayoutDashboard className="h-5 w-5" /> },
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
//     "monitoring",
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
//   monitoring: {
//     icon: "text-orange-300",
//     ring: "ring-orange-400/30",
//     chipFrom: "from-orange-600/25",
//     chipTo: "to-amber-500/25",
//     itemGlow: "shadow-[0_0_30px_-8px_rgba(251,146,60,0.45)]",
//     glow: "amber",
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