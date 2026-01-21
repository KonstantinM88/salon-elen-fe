// src/app/admin/calendar/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/** HH:MM -> minutes */
function timeToMinutes(v: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v.trim());
  if (!m) return 0;
  const hh = Math.min(23, Math.max(0, Number(m[1])));
  const mm = Math.min(59, Math.max(0, Number(m[2])));
  return hh * 60 + mm;
}

/** 'YYYY-MM-DD' -> UTC date at 00:00 or null */
function parseDateUTC(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(Date.UTC(y, mo - 1, d));
}

function back(intent: string | null): never {
  revalidatePath('/admin/calendar');
  if (intent === 'save_close') redirect('/admin');
  redirect('/admin/calendar?saved=1');
}

/** Сохранить недельный график салона */
export async function setSalonWorkingHours(formData: FormData): Promise<void> {
  const intent = String(formData.get('intent') ?? 'save_stay');

  const jobs: Array<ReturnType<typeof prisma.workingHours.upsert>> = [];
  for (let weekday = 0; weekday <= 6; weekday++) {
    const isClosed = formData.get(`wh-${weekday}-isClosed`) === 'on';

    let start = timeToMinutes(String(formData.get(`wh-${weekday}-start`) ?? '00:00'));
    let end   = timeToMinutes(String(formData.get(`wh-${weekday}-end`)   ?? '00:00'));

    if (isClosed) { start = 0; end = 0; }

    jobs.push(
      prisma.workingHours.upsert({
        where: { weekday },
        update: { isClosed, startMinutes: start, endMinutes: end },
        create: { weekday, isClosed, startMinutes: start, endMinutes: end },
      })
    );
  }

  await Promise.all(jobs);
  back(intent);
}

/** Добавить разовое исключение (один день или период) */
export async function addSalonTimeOff(formData: FormData): Promise<void> {
  // новые имена полей
  const startDateStr = String(formData.get('to-date-start') ?? formData.get('to-date') ?? '');
  const endDateStr   = String(formData.get('to-date-end') ?? '');
  const isClosed = formData.get('to-closed') === 'on';
  const reason = (String(formData.get('to-reason') ?? '') || null);

  let startMinutes = 0, endMinutes = 1440;
  if (!isClosed) {
    startMinutes = timeToMinutes(String(formData.get('to-start') ?? '00:00'));
    endMinutes   = timeToMinutes(String(formData.get('to-end')   ?? '00:00'));
  }

  const startDay = parseDateUTC(startDateStr);
  let endDay = parseDateUTC(endDateStr) ?? startDay;

  if (!startDay) {
    // нет валидной даты — просто вернёмся без ошибки
    redirect('/admin/calendar');
  }
  if (!endDay || endDay.getTime() < startDay.getTime()) {
    endDay = startDay;
  }

  // создаём записи для каждого дня периода (включительно)
  const dayMs = 24 * 60 * 60 * 1000;
  const jobs: Array<ReturnType<typeof prisma.timeOff.create>> = [];
  for (let t = startDay.getTime(); t <= endDay.getTime(); t += dayMs) {
    jobs.push(
      prisma.timeOff.create({
        data: {
          date: new Date(t),
          startMinutes,
          endMinutes,
          reason,
        },
      })
    );
  }
  await Promise.all(jobs);

  revalidatePath('/admin/calendar');
  redirect('/admin/calendar?saved=1');
}

/** Удалить исключение */
export async function removeSalonTimeOff(formData: FormData): Promise<void> {
  const id = String(formData.get('timeOffId') ?? '');
  if (!id) redirect('/admin/calendar');

  await prisma.timeOff.delete({ where: { id } });

  revalidatePath('/admin/calendar');
  redirect('/admin/calendar?saved=1');
}
