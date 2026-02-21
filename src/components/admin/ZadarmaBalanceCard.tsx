// src/components/admin/ZadarmaBalanceCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import { IconGlow } from '@/components/admin/IconGlow';
import type { SeoLocale } from '@/lib/seo-locale';

interface BalanceData {
  balance?: number | string;
  currency?: string;
  timestamp?: string;
}

interface BalanceResponse {
  success: boolean;
  balance?: number | string;
  currency?: string;
  timestamp?: string;
  error?: string;
}

type BalanceCardCopy = {
  title: string;
  subtitle: string;
  refreshTitle: string;
  loadErrorTitle: string;
  retry: string;
  updated: string;
  refill: string;
  fallbackLoadBalance: string;
  fallbackLoad: string;
  status: {
    good: string;
    warning: string;
    critical: string;
  };
};

const INTL_BY_LOCALE: Record<SeoLocale, string> = {
  de: 'de-DE',
  ru: 'ru-RU',
  en: 'en-US',
};

const BALANCE_COPY: Record<SeoLocale, BalanceCardCopy> = {
  de: {
    title: 'Zadarma-Guthaben',
    subtitle: 'SMS / VoIP',
    refreshTitle: 'Aktualisieren',
    loadErrorTitle: 'Fehler beim Laden',
    retry: 'Erneut versuchen',
    updated: 'Aktualisiert:',
    refill: 'Guthaben aufladen',
    fallbackLoadBalance: 'Fehler beim Laden des Guthabens',
    fallbackLoad: 'Fehler beim Laden',
    status: {
      good: 'Ausreichendes Guthaben',
      warning: 'Bald aufgebraucht',
      critical: 'Aufladung erforderlich',
    },
  },
  ru: {
    title: 'Баланс Zadarma',
    subtitle: 'SMS / VoIP',
    refreshTitle: 'Обновить',
    loadErrorTitle: 'Ошибка загрузки',
    retry: 'Попробовать снова',
    updated: 'Обновлено:',
    refill: 'Пополнить баланс',
    fallbackLoadBalance: 'Ошибка загрузки баланса',
    fallbackLoad: 'Ошибка загрузки',
    status: {
      good: 'Достаточно средств',
      warning: 'Скоро закончатся',
      critical: 'Требуется пополнение',
    },
  },
  en: {
    title: 'Zadarma Balance',
    subtitle: 'SMS / VoIP',
    refreshTitle: 'Refresh',
    loadErrorTitle: 'Load error',
    retry: 'Try again',
    updated: 'Updated:',
    refill: 'Top up balance',
    fallbackLoadBalance: 'Failed to load balance',
    fallbackLoad: 'Load error',
    status: {
      good: 'Sufficient balance',
      warning: 'Running low soon',
      critical: 'Top-up required',
    },
  },
};

type ZadarmaBalanceCardProps = {
  locale?: SeoLocale;
};

export function ZadarmaBalanceCard({ locale = 'de' }: ZadarmaBalanceCardProps) {
  const t = BALANCE_COPY[locale];
  const intlLocale = INTL_BY_LOCALE[locale];
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchBalance = async () => {
    try {
      setError(null);

      const response = await fetch('/api/admin/zadarma-balance');
      const result: BalanceResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || t.fallbackLoadBalance);
      }

      setData({
        balance: result.balance,
        currency: result.currency,
        timestamp: result.timestamp,
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching Zadarma balance:', err);
      setError(err instanceof Error ? err.message : t.fallbackLoad);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    // Автообновление каждые 5 минут
    const interval = setInterval(fetchBalance, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchBalance();
  };

  const getBalanceStatus = (balance: number | string): 'good' | 'warning' | 'critical' => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (num >= 10) return 'good';
    if (num >= 5) return 'warning';
    return 'critical';
  };

  const formatBalance = (balance: number | string, currency: string = 'EUR'): string => {
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(intlLocale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const balance = data?.balance !== undefined ? data.balance : 0;
  const currency = data?.currency || 'EUR';
  const status = getBalanceStatus(balance);

  const statusConfig = {
    good: {
      text: t.status.good,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      indicator: 'bg-emerald-500',
    },
    warning: {
      text: t.status.warning,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
      indicator: 'bg-amber-500',
    },
    critical: {
      text: t.status.critical,
      color: 'text-rose-600',
      bg: 'bg-rose-500/10',
      indicator: 'bg-rose-500 animate-pulse',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass card-glow overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-500/0" />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconGlow tone="amber" className="h-12 w-12 ring-2 ring-amber-400/30 bg-white/5">
              <CreditCard className="h-6 w-6 text-amber-400" />
            </IconGlow>
            <div>
              <h3 className="text-lg font-semibold text-white">{t.title}</h3>
              <p className="text-sm text-gray-300">{t.subtitle}</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-lg p-2 transition-all hover:bg-amber-50/10 disabled:opacity-50"
            title={t.refreshTitle}
          >
            <RefreshCw className={`h-5 w-5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content */}
        {loading && !data ? (
          <div className="space-y-3">
            <div className="h-12 w-32 animate-pulse rounded-lg bg-white/10" />
            <div className="h-6 w-48 animate-pulse rounded-lg bg-white/10" />
          </div>
        ) : error ? (
          <div className="rounded-lg bg-rose-500/20 p-4 border border-rose-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-400" />
              <div>
                <p className="font-medium text-rose-200">{t.loadErrorTitle}</p>
                <p className="text-sm text-rose-300">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm text-rose-300 underline hover:text-rose-200"
                >
                  {t.retry}
                </button>
              </div>
            </div>
          </div>
        ) : data ? (
          <>
            {/* Balance amount */}
            <div className="mb-4">
              <div className="text-4xl font-bold text-white drop-shadow-lg">
                {formatBalance(balance, currency)}
              </div>
            </div>

            {/* Status indicator */}
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${statusConfig[status].bg}`}>
              <div className={`h-2 w-2 rounded-full ${statusConfig[status].indicator}`} />
              <span className={`text-sm font-medium ${statusConfig[status].color}`}>
                {statusConfig[status].text}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="text-xs text-gray-300">
                {t.updated} {lastUpdate ? formatTime(lastUpdate) : '—'}
              </div>

              <a
                href="https://my.zadarma.com/billing/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-amber-400 transition-colors hover:text-amber-300"
              >
                {t.refill}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}
