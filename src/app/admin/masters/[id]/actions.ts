'use server';

import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import path from 'node:path';
import { unlink, mkdir, writeFile } from 'node:fs/promises';

/* ───────── helpers ───────── */

function minutes(v: string | null | undefined, def = 0): number {
  if (!v) return def;
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(1440, Math.trunc(n))) : def;
}

/** HH:MM → minutes */
function timeToMinutes(v: string | null | undefined): number {
  if (!v) return 0;
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(v).trim());
  if (!m) return 0;
  const hh = Math.min(23, Math.max(0, Number(m[1])));
  const mm = Math.min(59, Math.max(0, Number(m[2])));
  return hh * 60 + mm;
}

/** 'YYYY-MM-DD' -> UTC 00:00 or null */
function parseDateUTC(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

function backToProfile(id: string, tab: 'profile' | 'services' | 'schedule', intent?: string | null): never {
  revalidatePath(`/admin/masters/${id}`);
  if (intent === 'save_close') redirect('/admin/masters');
  redirect(`/admin/masters/${id}?tab=${tab}&saved=1`);
}

/* ───────── profile ───────── */

export async function updateMaster(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const intent = String(formData.get('intent') ?? 'save_stay');

  await prisma.master.update({
    where: { id },
    data: {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      birthDate: new Date(String(formData.get('birthDate') ?? '')),
      bio: (String(formData.get('bio') ?? '') || null),
    },
  });

  backToProfile(id, 'profile', intent);
}

/* ───────── services ───────── */

export async function setMasterServices(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const intent = String(formData.get('intent') ?? 'save_stay');

  const current = await prisma.master.findUnique({
    where: { id },
    select: { services: { select: { id: true } } },
  });
  const existing = new Set((current?.services ?? []).map(s => s.id));

  const chosen = new Set<string>();
  for (const v of formData.getAll('serviceId')) chosen.add(String(v));

  const toAdd: string[] = [];
  const toRemove: string[] = [];
  for (const x of chosen) if (!existing.has(x)) toAdd.push(x);
  for (const x of existing) if (!chosen.has(x)) toRemove.push(x);

  await prisma.$transaction([
    prisma.master.update({
      where: { id },
      data: { services: { connect: toAdd.map(x => ({ id: x })) } },
    }),
    prisma.master.update({
      where: { id },
      data: { services: { disconnect: toRemove.map(x => ({ id: x })) } },
    }),
  ]);

  backToProfile(id, 'services', intent);
}

/* ───────── working hours ───────── */

export async function setMasterWorkingHours(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const intent = String(formData.get('intent') ?? 'save_stay');

  const jobs = [];
  for (let weekday = 0; weekday <= 6; weekday++) {
    const isClosed = formData.get(`wh-${weekday}-isClosed`) === 'on';
    let start = minutes(String(formData.get(`wh-${weekday}-start`)));
    let end = minutes(String(formData.get(`wh-${weekday}-end`)));
    if (isClosed) { start = 0; end = 0; }

    jobs.push(
      prisma.masterWorkingHours.upsert({
        where: { masterId_weekday: { masterId: id, weekday } },
        update: { isClosed, startMinutes: start, endMinutes: end },
        create: { masterId: id, weekday, isClosed, startMinutes: start, endMinutes: end },
      })
    );
  }
  await Promise.all(jobs);

  backToProfile(id, 'schedule', intent);
}

/* ───────── time off (NOW WITH RANGE) ───────── */

export async function addTimeOff(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');

  // поддержка диапазона: to-date-start / to-date-end
  const startDateStr = String(formData.get('to-date-start') ?? formData.get('to-date') ?? '');
  const endDateStr   = String(formData.get('to-date-end') ?? '');
  const isClosed = formData.get('to-closed') === 'on';
  const reason = (String(formData.get('to-reason') ?? '') || null);

  let startMinutes = 0, endMinutes = 1440;
  if (!isClosed) {
    // принимаем HH:MM; если пришли числа — тоже обработаем
    const startRaw = formData.get('to-start');
    const endRaw   = formData.get('to-end');
    startMinutes = typeof startRaw === 'string' && startRaw.includes(':') ? timeToMinutes(startRaw) : minutes(String(startRaw));
    endMinutes   = typeof endRaw === 'string' && endRaw.includes(':')     ? timeToMinutes(endRaw)   : minutes(String(endRaw));
  }

  const startDay = parseDateUTC(startDateStr);
  let endDay = parseDateUTC(endDateStr) ?? startDay;

  if (!startDay) redirect(`/admin/masters/${id}?tab=schedule`);

  if (!endDay || endDay.getTime() < startDay.getTime()) endDay = startDay;

  const dayMs = 24 * 60 * 60 * 1000;
  const tx = [];
  for (let t = startDay!.getTime(); t <= endDay!.getTime(); t += dayMs) {
    tx.push(prisma.masterTimeOff.create({
      data: {
        masterId: id,
        date: new Date(t),
        startMinutes,
        endMinutes,
        reason,
      },
    }));
  }
  await prisma.$transaction(tx);

  revalidatePath(`/admin/masters/${id}`);
  redirect(`/admin/masters/${id}?tab=schedule&saved=1`);
}

export async function removeTimeOff(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const timeOffId = String(formData.get('timeOffId') ?? '');

  if (timeOffId) {
    await prisma.masterTimeOff.delete({ where: { id: timeOffId } });
  }
  revalidatePath(`/admin/masters/${id}`);
  redirect(`/admin/masters/${id}?tab=schedule&saved=1`);
}

/* ───────── avatar upload / delete ───────── */

export async function uploadAvatar(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const file = formData.get('avatar') as File | null;
  if (!file) redirect(`/admin/masters/${id}?tab=profile&error=upload`);

  const type = file.type || '';
  if (!/(^image\/)(jpeg|jpg|png|webp)$/i.test(type)) {
    redirect(`/admin/masters/${id}?tab=profile&error=type`);
  }
  if (file.size > 5 * 1024 * 1024) {
    redirect(`/admin/masters/${id}?tab=profile&error=too_big`);
  }

  const prev = await prisma.master.findUnique({
    where: { id },
    select: { avatarUrl: true },
  });

  // удаляем старый файл (если был)
  if (prev?.avatarUrl) {
    try {
      const rel = prev.avatarUrl.replace(/^\/+/, '');
      const oldPath = path.join(process.cwd(), 'public', rel);
      await unlink(oldPath);
    } catch {/* ignore */}
  }

  const ext = type.split('/')[1] || 'jpg';
  const dir = path.join(process.cwd(), 'public', 'uploads', 'masters', id);
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}.${ext}`;
  const abs = path.join(dir, filename);
  await writeFile(abs, Buffer.from(await file.arrayBuffer()));

  const publicUrl = `/uploads/masters/${id}/${filename}`;
  await prisma.master.update({ where: { id }, data: { avatarUrl: publicUrl } });

  revalidatePath(`/admin/masters/${id}`);
  redirect(`/admin/masters/${id}?tab=profile&saved=1`);
}

export async function removeAvatar(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');

  const prev = await prisma.master.findUnique({
    where: { id },
    select: { avatarUrl: true },
  });

  if (prev?.avatarUrl) {
    try {
      const rel = prev.avatarUrl.replace(/^\/+/, '');
      const oldPath = path.join(process.cwd(), 'public', rel);
      await unlink(oldPath);
    } catch {/* ignore */}
  }

  await prisma.master.update({ where: { id }, data: { avatarUrl: null } });

  revalidatePath(`/admin/masters/${id}`);
  redirect(`/admin/masters/${id}?tab=profile&saved=1`);
}
