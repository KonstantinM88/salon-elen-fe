// src/app/admin/dashboard/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { Edit3 } from 'lucide-react';
import { ZadarmaBalanceCard } from '@/components/admin/ZadarmaBalanceCard';
import { RegistrationStats } from '@/components/admin/RegistrationStats';
import AiHealthWidget from '../ai/_components/AiHealthWidget';
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
  editPricesCta: string;
  editPricesHint: string;
};

const DASHBOARD_COPY: Record<SeoLocale, DashboardCopy> = {
  de: {
    title: 'Dashboard',
    subtitle: 'SMS-Guthaben und Registrierungsstatistik im Blick',
    editPricesCta: 'Preise bearbeiten',
    editPricesHint: 'Bearbeitung von /prices über Leistungen',
  },
  ru: {
    title: 'Дашборд',
    subtitle: 'Мониторинг SMS-баланса и статистики регистраций',
    editPricesCta: 'Редактировать /prices',
    editPricesHint: 'Изменение цен через раздел услуг',
  },
  en: {
    title: 'Dashboard',
    subtitle: 'Monitor SMS balance and registration statistics',
    editPricesCta: 'Edit /prices',
    editPricesHint: 'Manage pricing through services',
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
        <div className="mt-4">
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium transition hover:border-white/30 hover:bg-white/10"
          >
            <Edit3 className="h-4 w-4" />
            {t.editPricesCta}
          </Link>
          <p className="mt-2 text-xs opacity-70">{t.editPricesHint}</p>
        </div>
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

        <div className="max-w-md">
          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-2xl bg-white/50 backdrop-blur-sm" />
            }
          >
            <AiHealthWidget locale={locale} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
