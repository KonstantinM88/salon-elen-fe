'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Master = { id: string; name: string };
type MastersPayload = { masters: Master[]; defaultMasterId: string | null };

function useSelectedServiceIds(): string[] {
  const params = useSearchParams();
  return React.useMemo(() => {
    const all = new URLSearchParams(params.toString()).getAll('s');
    return Array.from(new Set(all.filter(Boolean)));
  }, [params]);
}

function isErrorWithMessage(e: unknown): e is { message: string } {
  return typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message: unknown }).message === 'string';
}
function isAbortError(e: unknown): boolean {
  if (typeof e !== 'object' || e === null) return false;
  const maybeName = (e as { name?: unknown }).name;
  return typeof maybeName === 'string' && maybeName === 'AbortError';
}

export default function MasterStepClient(): React.JSX.Element {
  const serviceIds = useSelectedServiceIds();
  const serviceKey = React.useMemo(() => serviceIds.join(','), [serviceIds]);

  const [masters, setMasters] = React.useState<Master[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const qs = serviceKey ? `?serviceIds=${encodeURIComponent(serviceKey)}` : '';
        const res = await fetch(`/api/masters${qs}`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`Failed to load masters: ${res.status}`);
        const data: MastersPayload = await res.json();
        if (!mounted) return;

        const baseMasters = Array.isArray(data.masters) ? data.masters : [];

        setMasters(baseMasters);
        setSelectedId(data.defaultMasterId ?? null);
      } catch (e: unknown) {
        if (!mounted || isAbortError(e)) return;
        const msg = isErrorWithMessage(e) ? e.message : 'Failed to load masters';
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [serviceKey, serviceIds]);

  const nextHref =
    selectedId && serviceIds.length > 0
      ? `/booking/calendar?${serviceIds.map(s => `s=${encodeURIComponent(s)}`).join('&')}&m=${encodeURIComponent(selectedId)}`
      : '#';

  return (
    <>
      {loading && (
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          Загрузка доступных мастеров…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Ошибка: {error}
        </div>
      )}

      {!loading && !error && masters.length === 0 && (
        <div className="mt-6 rounded-lg border border-border bg-card p-4">
          Нет подходящих мастеров для выбранных услуг. Вернитесь и скорректируйте выбор.
        </div>
      )}

      {!loading && !error && masters.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {masters.map(m => {
            const active = m.id === selectedId;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition
                    ${active ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-border hover:border-indigo-300'}`}
                  aria-pressed={active}
                >
                  <div className="font-medium">{m.name}</div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/booking/services"
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Назад
          </Link>
          <Link
            href={nextHref}
            aria-disabled={!selectedId || serviceIds.length === 0}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition
              ${!selectedId || serviceIds.length === 0
                ? 'pointer-events-none bg-muted text-muted-foreground'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
          >
            Продолжить
          </Link>
        </div>
      </div>
    </>
  );
}
