import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NameEmailForm from './NameEmailForm';
import PasswordForm from './PasswordForm';
import { ShieldCheck, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
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
            <h1 className="text-2xl md:text-3xl font-semibold">Профиль</h1>
            <p className="text-sm opacity-70">Изменение имени, почты и пароля.</p>
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
            <h2 className="text-lg font-semibold">Имя и email</h2>
          </div>

          <NameEmailForm defaultName={me.name ?? ''} defaultEmail={me.email} />
        </div>

        {/* Сводка */}
        <aside className="rounded-2xl border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 grid place-items-center rounded-lg ring-2 ring-emerald-400/30">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold">Доступ</h2>
          </div>

          <div className="text-sm opacity-80">
            <div><span className="opacity-60">Роль:</span> <b>{me.role}</b></div>
            <div className="mt-1">
              <span className="opacity-60">Мастер:</span>{' '}
              {me.master ? (
                <b>#{me.master.id.slice(0, 6)} — {me.master.name}</b>
              ) : (
                <span className="opacity-60">не привязан</span>
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
          <h2 className="text-lg font-semibold">Смена пароля</h2>
        </div>

        <PasswordForm />
      </section>
    </main>
  );
}
