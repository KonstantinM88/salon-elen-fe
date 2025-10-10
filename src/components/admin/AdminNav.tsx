'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Newspaper,
  Scissors,
  ClipboardList,
  Users,
  CalendarDays,
  BarChart3,
  ChevronDown,
} from 'lucide-react';

type NavItem = {
  key:
    | 'dashboard'
    | 'news'
    | 'services'
    | 'bookings'
    | 'clients'
    | 'calendar'
    | 'stats';
  href: string;
  title: string;
  icon: React.ReactNode;
};

const NAV_ALL: NavItem[] = [
  { key: 'dashboard', href: '/admin',          title: 'Дашборд',    icon: <LayoutDashboard className="h-5 w-5" /> },
  { key: 'news',      href: '/admin/news',     title: 'Новости',    icon: <Newspaper className="h-5 w-5" /> },
  { key: 'services',  href: '/admin/services', title: 'Услуги',     icon: <Scissors className="h-5 w-5" /> },
  { key: 'bookings',  href: '/admin/bookings', title: 'Заявки',     icon: <ClipboardList className="h-5 w-5" /> },
  { key: 'clients',   href: '/admin/clients',  title: 'Клиенты',    icon: <Users className="h-5 w-5" /> },
  { key: 'calendar',  href: '/admin/calendar', title: 'Календарь',  icon: <CalendarDays className="h-5 w-5" /> },
  { key: 'stats',     href: '/admin/stats',    title: 'Статистика', icon: <BarChart3 className="h-5 w-5" /> },
];

/**
 * Цветовые пресеты для иконок и подсветок.
 * Важно: классы перечислены явно, чтобы их не выпилил Tailwind purge.
 */
const COLORS: Record<
  NavItem['key'],
  {
    icon: string;      // цвет иконки
    ring: string;      // кольцо вокруг иконки
    chipFrom: string;  // градиент иконки (from)
    chipTo: string;    // градиент иконки (to)
    itemGlow: string;  // свечение активного пункта
  }
> = {
  dashboard: {
    icon: 'text-violet-300',
    ring: 'ring-violet-400/30',
    chipFrom: 'from-violet-600/25',
    chipTo: 'to-sky-500/25',
    itemGlow: 'shadow-[0_0_30px_-8px_rgba(124,58,237,0.45)]',
  },
  news: {
    icon: 'text-sky-300',
    ring: 'ring-sky-400/30',
    chipFrom: 'from-sky-600/25',
    chipTo: 'to-cyan-500/25',
    itemGlow: 'shadow-[0_0_30px_-8px_rgba(2,132,199,0.45)]',
  },
  services: {
    icon: 'text-rose-300',
    ring: 'ring-rose-400/30',
    chipFrom: 'from-rose-600/25',
    chipTo: 'to-pink-500/25',
    itemGlow: 'shadow-[0_0_30px_-8px_rgba(244,63,94,0.45)]',
  },
  bookings: {
    icon: 'text-emerald-300',
    ring: 'ring-emerald-400/30',
    chipFrom: 'from-emerald-600/25',
    chipTo: 'to-teal-500/25',
    itemGlow: 'shadow-[0_0_30px_-8px_rgba(16,185,129,0.45)]',
  },
  clients: {
    icon: 'text-amber-300',
    ring: 'ring-amber-400/30',
    chipFrom: 'from-amber-600/25',
    chipTo: 'to-orange-500/25',
    itemGlow: 'shadow-[0_0_30px_-8px_rgba(245,158,11,0.45)]',
  },
  calendar: {
    icon: 'text-indigo-300',
    ring: 'ring-indigo-400/30',
    chipFrom: 'from-indigo-600/25',
    chipTo: 'to-blue-500/25',
    itemGlow: 'shadow-[0_0_30px_-8px_rgba(79,70,229,0.45)]',
  },
  stats: {
    icon: 'text-fuchsia-300',
    ring: 'ring-fuchsia-400/30',
    chipFrom: 'from-fuchsia-600/25',
    chipTo: 'to-purple-500/25',
    itemGlow: 'shadow-[0_0_30px_-8px_rgba(217,70,239,0.45)]',
  },
};

const baseItem =
  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60';
const activeShell =
  'bg-white/[0.03] border-white/10 ring-1 ring-white/10';
const textMuted = 'text-slate-300';
const textActive = 'text-white';

export default function AdminNav({
  bookingsBadge = 0,
}: {
  bookingsBadge?: number;
}): React.ReactElement {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const [first, ...rest] = NAV_ALL;

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href);
    const c = COLORS[item.key];
    const cls = [
      baseItem,
      active ? `${activeShell} ${c.itemGlow}` : '',
      active ? textActive : textMuted,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Link href={item.href} className={cls} aria-current={active ? 'page' : undefined}>
        {/* живая иконка */}
        <motion.span
          whileHover={{ scale: 1.07, rotate: 1 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className={[
            'inline-flex h-8 w-8 items-center justify-center rounded-lg',
            'bg-gradient-to-br',
            c.chipFrom,
            c.chipTo,
            'ring-1',
            c.ring,
          ].join(' ')}
        >
          <span className={c.icon}>{item.icon}</span>
        </motion.span>

        <span className="font-medium">{item.title}</span>

        {/* бейдж у "Заявки" */}
        {item.key === 'bookings' && bookingsBadge > 0 && (
          <span
            className="ml-auto inline-flex items-center justify-center rounded-full
                       bg-emerald-500/20 text-emerald-300 text-[11px] px-2 py-0.5
                       ring-1 ring-emerald-400/30"
          >
            {bookingsBadge}
          </span>
        )}
      </Link>
    );
  };

  const desktopList = useMemo(
    () => (
      <ul className="hidden lg:block space-y-2">
        {rest.map((item) => (
          <li key={item.key}>{renderItem(item)}</li>
        ))}
      </ul>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, bookingsBadge]
  );

  const IconChevron = (
    <ChevronDown
      className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
    />
  );

  return (
    <nav className="space-y-2">
      {/* Дашборд — всегда виден */}
      <div className="group relative">
        <Link
          href={first.href}
          className={[
            baseItem,
            isActive(first.href)
              ? `${activeShell} ${COLORS.dashboard.itemGlow}`
              : '',
            isActive(first.href) ? textActive : textMuted,
          ].join(' ')}
        >
          {/* иконка дашборда */}
          <motion.span
            whileHover={{ scale: 1.07, rotate: 1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className={[
              'inline-flex h-8 w-8 items-center justify-center rounded-lg',
              'bg-gradient-to-br',
              COLORS.dashboard.chipFrom,
              COLORS.dashboard.chipTo,
              'ring-1',
              COLORS.dashboard.ring,
            ].join(' ')}
          >
            <span className={COLORS.dashboard.icon}>{first.icon}</span>
          </motion.span>

          <span className="font-medium">{first.title}</span>

          {/* раскрытие для мобилы */}
          <button
            type="button"
            aria-label={open ? 'Скрыть разделы' : 'Показать разделы'}
            onClick={(e) => {
              e.preventDefault();
              setOpen((v) => !v);
            }}
            className="ml-auto lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg
                       border border-white/10 bg-white/5 text-slate-300/80
                       hover:bg-white/10 hover:text-white transition"
          >
            {IconChevron}
          </button>
        </Link>
      </div>

      {/* Мобильный раскрывающийся список с анимацией */}
      <div className="lg:hidden">
        <AnimatePresence initial={false}>
          {open && (
            <motion.ul
              key="mobile-list"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-2 overflow-hidden"
            >
              {rest.map((item) => (
                <li key={item.key}>{renderItem(item)}</li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Десктоп — статичный список */}
      {desktopList}
    </nav>
  );
}
