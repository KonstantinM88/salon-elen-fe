'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { JSX } from 'react';

export default function ClientStep(): JSX.Element {
  const params = useSearchParams();

  // читаем то, что приходит с предыдущих шагов
  const serviceIds: string[] = React.useMemo(
    () => params.getAll('s').filter(Boolean),
    [params],
  );
  const masterId = params.get('m');
  const startISO = params.get('start') ?? null;
  const endISO = params.get('end') ?? null;

  // локальная форма (минимум полей; подставь свои, если уже есть готовая разметка)
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
    qs.set('name', name.trim());
    qs.set('phone', phone.trim());
    if (email.trim()) qs.set('email', email.trim());
    if (notes.trim()) qs.set('notes', notes.trim());
    return `/booking/confirm?${qs.toString()}`;
  }, [serviceIds, masterId, startISO, endISO, name, phone, email, notes]);

  const canProceed = name.trim().length > 1 && phone.trim().length >= 7;

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canProceed) {
          window.location.href = nextHref;
        }
      }}
    >
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        {startISO ? <>Начало: <span className="font-medium text-foreground">{startISO}</span>. </> : null}
        {endISO ? <>Окончание: <span className="font-medium text-foreground">{endISO}</span>.</> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm">Ваше имя</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none"
          placeholder="Например, Анна"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Телефон</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none"
          placeholder="+49…"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">E-mail (необязательно)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none"
          placeholder="name@example.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Пожелания (необязательно)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none"
          rows={4}
          placeholder="Комментарий к записи"
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Link
          href={
            serviceIds.length
              ? `/booking/calendar?${serviceIds.map(s => `s=${encodeURIComponent(s)}`).join('&')}${masterId ? `&m=${encodeURIComponent(masterId)}` : ''}`
              : '/booking/services'
          }
          className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Назад
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
          Продолжить
        </button>
      </div>
    </form>
  );
}
