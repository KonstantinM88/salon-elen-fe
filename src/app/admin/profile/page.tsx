// src/app/admin/profile/page.tsx
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NameEmailForm from './NameEmailForm';
import PasswordForm from './PasswordForm';
import { ShieldCheck, User } from 'lucide-react';
import {
  type SeoLocale,
  type SearchParamsPromise,
} from '@/lib/seo-locale';
import { resolveContentLocale } from '@/lib/seo-locale-server';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: SearchParamsPromise;
};

type ProfileCopy = {
  title: string;
  subtitle: string;
  nameEmailTitle: string;
  accessTitle: string;
  roleLabel: string;
  masterLabel: string;
  notLinked: string;
  passwordTitle: string;
  form: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    save: string;
  };
  passwordForm: {
    submit: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    minPasswordHint: string;
    hashedHint: string;
  };
};

const PROFILE_COPY: Record<SeoLocale, ProfileCopy> = {
  de: {
    title: 'Profil',
    subtitle: 'Name, E-Mail und Passwort verwalten.',
    nameEmailTitle: 'Name und E-Mail',
    accessTitle: 'Zugang',
    roleLabel: 'Rolle:',
    masterLabel: 'Mitarbeiter:',
    notLinked: 'nicht verknuepft',
    passwordTitle: 'Passwort aendern',
    form: {
      nameLabel: 'Name',
      namePlaceholder: 'Ihr Name',
      emailLabel: 'E-Mail',
      emailPlaceholder: 'you@example.com',
      save: 'Speichern',
    },
    passwordForm: {
      submit: 'Passwort aktualisieren',
      currentPassword: 'Aktuelles Passwort',
      newPassword: 'Neues Passwort',
      confirmPassword: 'Neues Passwort wiederholen',
      minPasswordHint: 'Mindestens 8 Zeichen',
      hashedHint: 'Das Passwort wird als Hash gespeichert.',
    },
  },
  ru: {
    title: 'Профиль',
    subtitle: 'Изменение имени, почты и пароля.',
    nameEmailTitle: 'Имя и email',
    accessTitle: 'Доступ',
    roleLabel: 'Роль:',
    masterLabel: 'Мастер:',
    notLinked: 'не привязан',
    passwordTitle: 'Смена пароля',
    form: {
      nameLabel: 'Имя',
      namePlaceholder: 'Ваше имя',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      save: 'Сохранить',
    },
    passwordForm: {
      submit: 'Обновить пароль',
      currentPassword: 'Текущий пароль',
      newPassword: 'Новый пароль',
      confirmPassword: 'Повторите новый',
      minPasswordHint: 'Минимум 8 символов',
      hashedHint: 'Пароль хранится в виде хеша.',
    },
  },
  en: {
    title: 'Profile',
    subtitle: 'Update your name, email, and password.',
    nameEmailTitle: 'Name and email',
    accessTitle: 'Access',
    roleLabel: 'Role:',
    masterLabel: 'Master:',
    notLinked: 'not linked',
    passwordTitle: 'Change password',
    form: {
      nameLabel: 'Name',
      namePlaceholder: 'Your name',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      save: 'Save',
    },
    passwordForm: {
      submit: 'Update password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Repeat new password',
      minPasswordHint: 'At least 8 characters',
      hashedHint: 'The password is stored as a hash.',
    },
  },
};

export default async function AdminProfilePage({ searchParams }: PageProps) {
  const locale = await resolveContentLocale(searchParams);
  const t = PROFILE_COPY[locale];
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;

  if (!email) {
    redirect('/login');
  }

  const me = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      master: { select: { id: true, name: true } },
    },
  });

  if (!me) redirect('/login');

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,theme(colors.violet.500/10),transparent_35%),radial-gradient(ellipse_at_bottom_right,theme(colors.sky.500/10),transparent_35%)]" />
        <div className="relative p-5 md:p-6 flex items-center gap-3">
          <div className="h-10 w-10 grid place-items-center rounded-xl ring-2 ring-violet-400/30">
            <User className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">{t.title}</h1>
            <p className="text-sm opacity-70">{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Профиль */}
        <div className="rounded-2xl border p-4 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 grid place-items-center rounded-lg ring-2 ring-violet-400/30">
              <User className="h-4 w-4 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold">{t.nameEmailTitle}</h2>
          </div>

          <NameEmailForm
            defaultName={me.name ?? ''}
            defaultEmail={me.email}
            locale={locale}
            labels={t.form}
          />
        </div>

        {/* Сводка */}
        <aside className="rounded-2xl border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 grid place-items-center rounded-lg ring-2 ring-emerald-400/30">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold">{t.accessTitle}</h2>
          </div>

          <div className="text-sm opacity-80">
            <div>
              <span className="opacity-60">{t.roleLabel}</span> <b>{me.role}</b>
            </div>
            <div className="mt-1">
              <span className="opacity-60">{t.masterLabel}</span>{' '}
              {me.master ? (
                <b>#{me.master.id.slice(0, 6)} — {me.master.name}</b>
              ) : (
                <span className="opacity-60">{t.notLinked}</span>
              )}
            </div>
          </div>
        </aside>
      </section>

      {/* Пароль */}
      <section className="rounded-2xl border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 grid place-items-center rounded-lg ring-2 ring-emerald-400/30">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold">{t.passwordTitle}</h2>
        </div>

        <PasswordForm locale={locale} labels={t.passwordForm} />
      </section>
    </main>
  );
}
