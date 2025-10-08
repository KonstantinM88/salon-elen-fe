// src/components/admin/AdminNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, ReactElement } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  Scissors,
  NotebookPen,
  UserCircle2,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  BarChart3,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
};

const items: readonly NavItem[] = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/news', label: 'Новости', icon: Newspaper },
  { href: '/admin/services', label: 'Услуги', icon: Scissors },
  { href: '/admin/bookings', label: 'Заявки', icon: NotebookPen },
  { href: '/admin/clients', label: 'Клиенты', icon: UserCircle2 },

  // Новые пункты
  { href: '/admin/masters', label: 'Сотрудники', icon: UsersIcon },
  { href: '/admin/calendar', label: 'Календарь', icon: CalendarIcon },
  { href: '/admin/stats', label: 'Статистика', icon: BarChart3 },
];

export default function AdminNav(): ReactElement {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));
        return (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-2 px-3 py-2 rounded-lg transition',
              'hover:bg-muted/50',
              active ? 'bg-muted font-medium' : '',
            ].join(' ')}
            aria-current={active ? 'page' : undefined}
          >
            {Icon ? <Icon size={16} className="shrink-0" /> : null}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
