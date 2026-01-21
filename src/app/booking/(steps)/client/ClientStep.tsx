// src/app/booking/(steps)/client/ClientStep.tsx
// страница ввода данных клиента в многошаговом бронировании

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { JSX } from 'react';
import { useTranslations } from '@/i18n/useTranslations';

export default function ClientStep(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const t = useTranslations();

  const serviceIds: string[] = React.useMemo(
    () => params.getAll('s').filter(Boolean),
    [params],
  );
  const masterId = params.get('m') ?? undefined;
  const startISO = params.get('start') ?? null;
  const endISO = params.get('end') ?? null;
  const dateISO = params.get('d') ?? undefined;

  const [name, setName] = React.useState<string>('');
  const [phone, setPhone] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');

  const nextHref = React.useMemo(() => {
    const qs = new URLSearchParams();
    serviceIds.forEach(s => qs.append('s', s));
    if (masterId) qs.set('m', masterId);
    if (startISO) qs.set('start', startISO);
    if (endISO) qs.set('end', endISO);
    if (dateISO) qs.set('d', dateISO);
    qs.set('name', name.trim());
    qs.set('phone', phone.trim());
    if (email.trim()) qs.set('email', email.trim());
    if (notes.trim()) qs.set('notes', notes.trim());
    return `/booking/success?${qs.toString()}`;
  }, [serviceIds, masterId, startISO, endISO, dateISO, name, phone, email, notes]);

  const canProceed = name.trim().length > 1 && phone.trim().length >= 7;

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canProceed) {
          router.push(nextHref);
        }
      }}
    >
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        {startISO ? (
          <>
            {t('booking_client_step_start_label')}{' '}
            <span className="font-medium text-foreground">{startISO}</span>.{' '}
          </>
        ) : null}
        {endISO ? (
          <>
            {t('booking_client_step_end_label')}{' '}
            <span className="font-medium text-foreground">{endISO}</span>.
          </>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm">{t('booking_client_step_name_label')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none"
          placeholder={t('booking_client_step_name_placeholder')}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">{t('booking_client_step_phone_label')}</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none"
          placeholder={t('booking_client_step_phone_placeholder')}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">{t('booking_client_step_email_label')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none"
          placeholder={t('booking_client_step_email_placeholder')}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">{t('booking_client_step_notes_label')}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none"
          rows={4}
          placeholder={t('booking_client_step_notes_placeholder')}
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Link
          href={
            serviceIds.length
              ? `/booking/calendar?${serviceIds.map(s => `s=${encodeURIComponent(s)}`).join('&')}${masterId ? `&m=${encodeURIComponent(masterId)}` : ''}${dateISO ? `&d=${encodeURIComponent(dateISO)}` : ''}`
              : '/booking/services'
          }
          className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {t('booking_client_step_back')}
        </Link>

        <button
          type="submit"
          disabled={!canProceed}
          className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
            canProceed
              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
              : 'cursor-not-allowed bg-muted text-muted-foreground'
          }`}
        >
          {t('booking_client_step_continue')}
        </button>
      </div>
    </form>
  );
}


