'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type EmailCheck =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'ok' }
  | { state: 'fail'; reason?: string }
  | { state: 'unavailable' };

type ReferralKind = 'google' | 'facebook' | 'instagram' | 'friends' | 'other';

function isValidEmailSyntax(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yearsAgo(n: number): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - n);
  return d;
}

function ClientForm(): React.JSX.Element {
  const params = useSearchParams();
  const router = useRouter();

  const serviceIds = React.useMemo<string[]>(
    () => params.getAll('s').filter(Boolean),
    [params],
  );
  const masterId = params.get('m') ?? '';
  const startISO = params.get('start') ?? '';
  const endISO = params.get('end') ?? '';

  const [name, setName] = React.useState<string>('');
  const [phone, setPhone] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [emailCheck, setEmailCheck] = React.useState<EmailCheck>({ state: 'idle' });

  const [birth, setBirth] = React.useState<string>('');
  const [referral, setReferral] = React.useState<ReferralKind | ''>('');
  const [referralOther, setReferralOther] = React.useState<string>('');
  const [comment, setComment] = React.useState<string>('');

  const [submitErr, setSubmitErr] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const maxBirth = formatYMD(new Date());
  const minBirth = formatYMD(yearsAgo(120));
  const minAdult = formatYMD(yearsAgo(16));

  const nameErr = name.trim().length < 2 ? 'Укажите имя полностью' : null;
  const phoneErr = phone.trim().length < 6 ? 'Укажите корректный номер телефона' : null;

  const birthDate = birth ? new Date(birth + 'T00:00:00') : null;
  let birthErr: string | null = null;
  if (!birth) birthErr = 'Дата рождения обязательна';
  else if (birthDate && birthDate > new Date()) birthErr = 'Дата в будущем недопустима';
  else if (birth && birth > minAdult) birthErr = 'Для онлайн-записи требуется возраст 16+';

  let emailErr: string | null = null;
  if (email) {
    if (!isValidEmailSyntax(email)) emailErr = 'Некорректный e-mail';
    else if (emailCheck.state === 'fail') emailErr = emailCheck.reason ?? 'E-mail не подтвержден';
  }

  const referralErr =
    referral === ''
      ? 'Выберите вариант'
      : referral === 'other' && !referralOther.trim()
      ? 'Уточните источник'
      : null;

  const baseDisabled = !serviceIds.length || !masterId || !startISO || !endISO;

  const formValid =
    !baseDisabled &&
    !nameErr &&
    !phoneErr &&
    !birthErr &&
    !emailErr &&
    !referralErr &&
    emailCheck.state !== 'checking';

  // Проверка email с задержкой
  React.useEffect(() => {
    if (!email || !isValidEmailSyntax(email)) {
      setEmailCheck({ state: 'idle' });
      return;
    }

    setEmailCheck({ state: 'checking' });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/email-check?email=${encodeURIComponent(email)}`);
        if (!res.ok) {
          setEmailCheck({ state: 'unavailable' });
          return;
        }
        const data = await res.json();
        if (data.ok) {
          setEmailCheck({ state: 'ok' });
        } else {
          setEmailCheck({ state: 'fail', reason: data.reason });
        }
      } catch {
        setEmailCheck({ state: 'unavailable' });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formValid || submitting) return;

    setSubmitting(true);
    setSubmitErr(null);

    try {
      // Формируем query string с параметрами
      const qs = new URLSearchParams();
      serviceIds.forEach(id => qs.append('s', id));
      qs.set('m', masterId);
      qs.set('start', startISO);
      qs.set('end', endISO);

      // Отправляем POST запрос на API endpoint
      const res = await fetch(`/api/booking/client?${qs.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          birthDateISO: birth || undefined,
          referral: referral === 'other' ? 'other' : referral || undefined,
          notes: comment.trim() || undefined,
        }),
      });

      // Если статус НЕ 2xx - это ошибка
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      // Если статус 2xx - парсим успешный ответ
      const result = await res.json();
      
      // API возвращает { draftId: string } при успехе
      if (result.draftId) {
        // Успешно создана запись
        // Переходим на страницу подтверждения
        const confirmUrl = `/booking/confirmation?id=${result.draftId}`;
        router.push(confirmUrl);
      } else {
        throw new Error('Некорректный ответ от сервера');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось создать запись';
      setSubmitErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (baseDisabled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-destructive">Некорректные параметры. Пожалуйста, начните запись заново.</p>
          <Link href="/booking" className="mt-4 inline-block text-sm underline">
            Вернуться к выбору услуг
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28">
      <h1 className="mt-6 text-2xl font-semibold">Онлайн-запись</h1>
      <h2 className="mt-2 text-lg text-muted-foreground">Ваши данные</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Имя */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Имя <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            placeholder="Ваше полное имя"
            required
          />
          {nameErr && <p className="mt-1 text-sm text-destructive">{nameErr}</p>}
        </div>

        {/* Телефон */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Телефон <span className="text-destructive">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            placeholder="+7 (xxx) xxx-xx-xx"
            required
          />
          {phoneErr && <p className="mt-1 text-sm text-destructive">{phoneErr}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-mail <span className="text-muted-foreground">(необязательно)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            placeholder="your@email.com"
          />
          {emailCheck.state === 'checking' && (
            <p className="mt-1 text-sm text-muted-foreground">Проверка...</p>
          )}
          {emailCheck.state === 'ok' && (
            <p className="mt-1 text-sm text-green-600">✓ E-mail подтвержден</p>
          )}
          {emailErr && <p className="mt-1 text-sm text-destructive">{emailErr}</p>}
        </div>

        {/* Дата рождения */}
        <div>
          <label htmlFor="birth" className="block text-sm font-medium">
            Дата рождения <span className="text-destructive">*</span>
          </label>
          <input
            id="birth"
            type="date"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            min={minBirth}
            max={maxBirth}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            required
          />
          {birthErr && <p className="mt-1 text-sm text-destructive">{birthErr}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Для онлайн-записи требуется возраст 16+
          </p>
        </div>

        {/* Как узнали о нас */}
        <div>
          <label htmlFor="referral" className="block text-sm font-medium">
            Как вы узнали о нас? <span className="text-destructive">*</span>
          </label>
          <select
            id="referral"
            value={referral}
            onChange={(e) => setReferral(e.target.value as ReferralKind | '')}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            required
          >
            <option value="">Выберите вариант</option>
            <option value="google">Google</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="friends">Рекомендация друзей</option>
            <option value="other">Другое</option>
          </select>
          {referral === 'other' && (
            <input
              type="text"
              value={referralOther}
              onChange={(e) => setReferralOther(e.target.value)}
              placeholder="Уточните источник"
              className="mt-2 w-full rounded-md border bg-background px-3 py-2"
            />
          )}
          {referralErr && <p className="mt-1 text-sm text-destructive">{referralErr}</p>}
        </div>

        {/* Комментарий */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium">
            Комментарий <span className="text-muted-foreground">(необязательно)</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            placeholder="Дополнительная информация или пожелания"
          />
        </div>

        {/* Ошибка отправки */}
        {submitErr && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{submitErr}</p>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-6 py-2 hover:bg-muted"
            disabled={submitting}
          >
            Назад
          </button>
          <button
            type="submit"
            disabled={!formValid || submitting}
            className="flex-1 rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Создание записи...' : 'Забронировать'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ClientPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-6 max-w-2xl rounded-lg border p-4">
          Загрузка формы...
        </div>
      }
    >
      <ClientForm />
    </Suspense>
  );
}
