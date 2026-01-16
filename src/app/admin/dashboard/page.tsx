// src/app/admin/dashboard/page.tsx
/**
 * Дашборд администратора с балансом Zadarma и статистикой регистраций
 * 
 * Страница защищена middleware (требуется ADMIN роль)
 */

import { Suspense } from 'react';
import { ZadarmaBalanceCard } from '@/components/admin/ZadarmaBalanceCard';
import { RegistrationStats } from '@/components/admin/RegistrationStats';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Дашборд</h1>
        <p className="opacity-70">
          Мониторинг SMS баланса и статистика регистраций
        </p>
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
            <ZadarmaBalanceCard />
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
          <RegistrationStats />
        </Suspense>
      </div>
    </div>
  );
}