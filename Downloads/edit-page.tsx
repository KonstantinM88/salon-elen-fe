// src/app/admin/masters/[id]/page.tsx
export const dynamic = 'force-dynamic';

import type { ReactElement } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import {
  updateMaster,
  setMasterServices,
  setMasterWorkingHours,
  addTimeOff,
  removeTimeOff,
  uploadAvatar,
  removeAvatar,
} from './actions';
import { MasterEditClient } from './MasterEditClient';

const DAYS = [
  { label: 'Пн', full: 'Понедельник', value: 1 },
  { label: 'Вт', full: 'Вторник', value: 2 },
  { label: 'Ср', full: 'Среда', value: 3 },
  { label: 'Чт', full: 'Четверг', value: 4 },
  { label: 'Пт', full: 'Пятница', value: 5 },
  { label: 'Сб', full: 'Суббота', value: 6 },
  { label: 'Вс', full: 'Воскресенье', value: 0 },
] as const;

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

function fmtDateTime(d: Date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; saved?: string }>;
};

export default async function MasterPage(props: PageProps): Promise<ReactElement> {
  const { id } = await props.params;
  const { tab = 'profile', saved } = await props.searchParams;

  const master = await prisma.master.findUnique({
    where: { id },
    include: {
      services: { select: { id: true } },
      workingHours: true,
      timeOff: { orderBy: { date: 'desc' } },
      user: { select: { id: true, email: true } },
    },
  });

  if (!master) return notFound();

  // Данные для MasterAccessCard
  const hasLogin = Boolean(master.user);
  const userEmail = master.user?.email ?? null;

  // Список услуг
  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, name: true, parentId: true },
    orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
  });

  const chosenServiceIds = new Set(master.services.map((s) => s.id));

  // Подготовим рабочие часы
  const whMap = new Map<number, { isClosed: boolean; start: number; end: number }>();
  for (const wh of master.workingHours) {
    whMap.set(wh.weekday, {
      isClosed: wh.isClosed,
      start: wh.startMinutes,
      end: wh.endMinutes,
    });
  }

  const dayRows = DAYS.map((d) => {
    const cur = whMap.get(d.value) ?? { isClosed: true, start: 0, end: 0 };
    return {
      value: d.value,
      full: d.full,
      isClosed: cur.isClosed,
      start: cur.start,
      end: cur.end,
    };
  });

  const serializedMaster = {
    id: master.id,
    name: master.name,
    email: master.email,
    phone: master.phone,
    birthDate: master.birthDate
      ? new Date(master.birthDate).toISOString().slice(0, 10)
      : null,
    bio: master.bio,
    avatarUrl: master.avatarUrl,
    createdAt: fmtDateTime(master.createdAt),
    updatedAt: fmtDateTime(master.updatedAt),
    timeOff: master.timeOff.map((t) => ({
      id: t.id,
      date: fmtDate(t.date),
      startMinutes: t.startMinutes,
      endMinutes: t.endMinutes,
      reason: t.reason,
    })),
    // Данные для MasterAccessCard
    hasLogin,
    userEmail,
  };

  // Импортируем changeMasterPassword
  const { changeMasterPassword } = await import('./actions');

  return (
    <main className="space-y-6">
      <MasterEditClient
        master={serializedMaster}
        allServices={allServices}
        chosenServiceIds={Array.from(chosenServiceIds)}
        dayRows={dayRows}
        tab={tab}
        saved={!!saved}
        actions={{
          updateMaster,
          setMasterServices,
          setMasterWorkingHours,
          addTimeOff,
          removeTimeOff,
          uploadAvatar,
          removeAvatar,
          changeMasterPassword,
        }}
      />
    </main>
  );
}
