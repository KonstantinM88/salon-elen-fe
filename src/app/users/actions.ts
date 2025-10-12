'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { hashPassword } from '@/lib/password';

/** Проверка, что вызвал админ */
async function ensureAdmin(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Недостаточно прав');
  }
}

/* ───────────────────────── Создание пользователя ───────────────────────── */

const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Укажите имя'),
  email: z.string().trim().email('Некорректный email'),
  password: z.string().min(8, 'Пароль минимум 8 символов'),
  role: z.nativeEnum(Role),
  masterId: z.string().trim().optional().nullable(),
});

export async function createUser(formData: FormData): Promise<void> {
  await ensureAdmin();

  const parsed = createUserSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    role: String(formData.get('role') ?? 'USER'),
    masterId: (formData.get('masterId') as string | null) ?? null,
  });

  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(', ');
    throw new Error(msg);
  }

  const { name, email, password, role, masterId } = parsed.data;
  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    // создаём пользователя
    const user = await tx.user.create({
      data: { name, email, passwordHash, role },
      select: { id: true },
    });

    // если это мастер — можно сразу привязать к существующей карточке мастера
    if (role === 'MASTER' && masterId) {
      const m = await tx.master.findUnique({
        where: { id: masterId },
        select: { userId: true },
      });
      if (m?.userId) {
        throw new Error('К выбранному мастеру уже привязан пользователь');
      }
      await tx.master.update({
        where: { id: masterId },
        data: { userId: user.id },
      });
    }
  });

  revalidatePath('/admin/users');
}

/* ───────────────────────── Смена роли ───────────────────────── */

const updateRoleSchema = z.object({
  userId: z.string().trim().min(1),
  role: z.nativeEnum(Role),
});

export async function updateUserRole(formData: FormData): Promise<void> {
  await ensureAdmin();

  const parsed = updateRoleSchema.safeParse({
    userId: String(formData.get('userId') ?? ''),
    role: String(formData.get('role') ?? ''),
  });
  if (!parsed.success) throw new Error('Некорректные данные');

  const { userId, role } = parsed.data;

  // Нельзя «уронить» последнего админа
  if (role !== 'ADMIN') {
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const isTargetAdmin =
      (await prisma.user.findUnique({ where: { id: userId }, select: { role: true } }))?.role ===
      'ADMIN';
    if (isTargetAdmin && admins <= 1) {
      throw new Error('Должен остаться хотя бы один администратор');
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true },
  });

  revalidatePath('/admin/users');
}

/* ───────────────────────── Привязка/отвязка мастера ───────────────────────── */

const linkSchema = z.object({
  userId: z.string().trim().min(1),
  masterId: z.string().trim().min(1),
});

export async function linkUserToMaster(formData: FormData): Promise<void> {
  await ensureAdmin();

  const parsed = linkSchema.safeParse({
    userId: String(formData.get('userId') ?? ''),
    masterId: String(formData.get('masterId') ?? ''),
  });
  if (!parsed.success) throw new Error('Некорректные данные');

  const { userId, masterId } = parsed.data;

  await prisma.$transaction(async (tx) => {
    const m = await tx.master.findUnique({
      where: { id: masterId },
      select: { userId: true },
    });
    if (m?.userId) throw new Error('К мастеру уже привязан пользователь');

    await tx.master.update({
      where: { id: masterId },
      data: { userId },
    });
  });

  revalidatePath('/admin/users');
}

const unlinkSchema = z.object({
  userId: z.string().trim().min(1),
});

export async function unlinkUserFromMaster(formData: FormData): Promise<void> {
  await ensureAdmin();

  const parsed = unlinkSchema.safeParse({
    userId: String(formData.get('userId') ?? ''),
  });
  if (!parsed.success) throw new Error('Некорректные данные');

  const { userId } = parsed.data;

  await prisma.master.updateMany({
    where: { userId },
    data: { userId: null },
  });

  revalidatePath('/admin/users');
}
