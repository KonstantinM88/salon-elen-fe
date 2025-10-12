'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { hashPassword, verifyPassword } from '@/lib/password';

export type ActionState = {
  ok: boolean;
  message: string | null;
};

const initialState: ActionState = { ok: false, message: null };

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Укажите имя'),
  email: z.string().trim().email('Некорректный email'),
});

export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getServerSession(authOptions);
  const emailFromSession = session?.user?.email ?? null;

  if (!emailFromSession) {
    return { ok: false, message: 'Требуется авторизация' };
  }

  const parsed = profileSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(', ');
    return { ok: false, message: msg };
  }

  try {
    await prisma.user.update({
      where: { email: emailFromSession },
      data: { name: parsed.data.name, email: parsed.data.email },
      select: { id: true },
    });

    // Принудительно перерисуем страницу
    revalidatePath('/admin/profile');
    return { ok: true, message: 'Профиль обновлён' };
  } catch (e: unknown) {
    // P2002 — уникальность email
    if (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      (e as { code?: string }).code === 'P2002'
    ) {
      return { ok: false, message: 'Такой email уже используется' };
    }
    return { ok: false, message: 'Не удалось обновить профиль' };
  }
}

const passwordSchema = z
  .object({
    current: z.string().min(1, 'Введите текущий пароль'),
    next: z.string().min(8, 'Новый пароль минимум 8 символов'),
    confirm: z.string().min(1, 'Повторите новый пароль'),
  })
  .refine((d) => d.next === d.confirm, {
    message: 'Пароли не совпадают',
    path: ['confirm'],
  });

export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getServerSession(authOptions);
  const emailFromSession = session?.user?.email ?? null;

  if (!emailFromSession) {
    return { ok: false, message: 'Требуется авторизация' };
  }

  const parsed = passwordSchema.safeParse({
    current: String(formData.get('current') ?? ''),
    next: String(formData.get('next') ?? ''),
    confirm: String(formData.get('confirm') ?? ''),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(', ');
    return { ok: false, message: msg };
  }

  const me = await prisma.user.findUnique({
    where: { email: emailFromSession },
    select: { id: true, passwordHash: true },
  });

  if (!me) return { ok: false, message: 'Пользователь не найден' };

  const valid = await verifyPassword(parsed.data.current, me.passwordHash ?? '');
  if (!valid) return { ok: false, message: 'Неверный текущий пароль' };

  const newHash = await hashPassword(parsed.data.next);
  await prisma.user.update({
    where: { id: me.id },
    data: { passwordHash: newHash },
    select: { id: true },
  });

  revalidatePath('/admin/profile');
  return { ok: true, message: 'Пароль обновлён' };
}

export const initialActionState: ActionState = initialState;
