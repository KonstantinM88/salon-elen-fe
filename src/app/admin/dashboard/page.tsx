// src/app/admin/dashboard/page.tsx
import { Suspense } from 'react';
import { ZadarmaBalanceCard } from '@/components/admin/ZadarmaBalanceCard';
import { RegistrationStats } from '@/components/admin/RegistrationStats';
import {
  type SearchParamsPromise,
  type SeoLocale,
} from '@/lib/seo-locale';
import { resolveContentLocale } from '@/lib/seo-locale-server';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: SearchParamsPromise;
};

type DashboardCopy = {
  title: string;
  subtitle: string;
};

const DASHBOARD_COPY: Record<SeoLocale, DashboardCopy> = {
  de: {
    title: 'Dashboard',
    subtitle: 'SMS-Guthaben und Registrierungsstatistik im Blick',
  },
  ru: {
    title: 'Дашборд',
    subtitle: 'Мониторинг SMS-баланса и статистики регистраций',
  },
  en: {
    title: 'Dashboard',
    subtitle: 'Monitor SMS balance and registration statistics',
  },
};

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const locale = await resolveContentLocale(searchParams);
  const t = DASHBOARD_COPY[locale];

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="opacity-70">{t.subtitle}</p>
      </div>

      {/* Main content */}
      <div className="space-y-8">
        {/* Zadarma balance card */}
        <div className="max-w-md">
          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-2xl bg-white/50 backdrop-blur-sm" />
            }
          >
            <ZadarmaBalanceCard locale={locale} />
          </Suspense>
        </div>

        {/* Registration statistics */}
        <Suspense
          fallback={
            <div className="space-y-6">
              <div className="h-32 animate-pulse rounded-2xl bg-white/50 backdrop-blur-sm" />
              <div className="h-96 animate-pulse rounded-2xl bg-white/50 backdrop-blur-sm" />
            </div>
          }
        >
          <RegistrationStats locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}
