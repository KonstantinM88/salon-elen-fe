'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const masterSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа').max(100),
  email: z.string().email('Некорректный email'),
  phone: z
    .string()
    .min(5, 'Слишком короткий номер')
    .max(20, 'Слишком длинный номер')
    .regex(/^[+0-9().\-\s]+$/, 'Допустимы цифры, пробел, +, -, (, )'),
  birthDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Неверная дата'), // YYYY-MM-DD
  bio: z.string().max(500).optional().nullable(),
});

function toDateOnly(dateISO: string): Date {
  const [y, m, d] = dateISO.split('-').map((x) => Number(x));
  return new Date(Date.UTC(y, m - 1, d));
}

export async function createMaster(formData: FormData): Promise<void> {
  const raw = Object.fromEntries(formData.entries());
  const data = {
    name: String(raw.name ?? ''),
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    birthDate: String(raw.birthDate ?? ''),
    bio: raw.bio ? String(raw.bio) : null,
  };

  const parsed = masterSchema.safeParse(data);
  if (!parsed.success) {
    redirect('/admin/masters/new?error=validation');
  }

  try {
    await prisma.master.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        birthDate: toDateOnly(parsed.data.birthDate),
        bio: parsed.data.bio ?? null,
      },
    });
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      redirect('/admin/masters/new?error=unique');
    }
    redirect('/admin/masters/new?error=save');
  }

  revalidatePath('/admin/masters');
  redirect('/admin/masters');
}

export async function deleteMaster(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  try {
    await prisma.master.delete({ where: { id } });
  } catch {
    // Если есть связанные Appointment, удаление может упасть по FK — обработаем в UI позже.
  }
  revalidatePath('/admin/masters');
}
