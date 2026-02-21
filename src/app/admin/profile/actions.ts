'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { hashPassword, verifyPassword } from '@/lib/password';
import { isSeoLocale, type SeoLocale } from '@/lib/seo-locale';

export type ActionState = {
  ok: boolean;
  message: string | null;
};

const initialState: ActionState = { ok: false, message: null };

type ActionCopy = {
  nameRequired: string;
  invalidEmail: string;
  unauthorized: string;
  profileUpdated: string;
  emailTaken: string;
  profileUpdateFailed: string;
  currentRequired: string;
  nextMin: string;
  confirmRequired: string;
  mismatch: string;
  userNotFound: string;
  wrongCurrentPassword: string;
  passwordUpdated: string;
};

const ACTION_COPY: Record<SeoLocale, ActionCopy> = {
  de: {
    nameRequired: 'Name angeben',
    invalidEmail: 'Ungueltige E-Mail',
    unauthorized: 'Autorisierung erforderlich',
    profileUpdated: 'Profil aktualisiert',
    emailTaken: 'Diese E-Mail wird bereits verwendet',
    profileUpdateFailed: 'Profil konnte nicht aktualisiert werden',
    currentRequired: 'Aktuelles Passwort eingeben',
    nextMin: 'Neues Passwort mindestens 8 Zeichen',
    confirmRequired: 'Neues Passwort bestaetigen',
    mismatch: 'Passwoerter stimmen nicht ueberein',
    userNotFound: 'Benutzer nicht gefunden',
    wrongCurrentPassword: 'Aktuelles Passwort ist falsch',
    passwordUpdated: 'Passwort aktualisiert',
  },
  ru: {
    nameRequired: 'Укажите имя',
    invalidEmail: 'Некорректный email',
    unauthorized: 'Требуется авторизация',
    profileUpdated: 'Профиль обновлён',
    emailTaken: 'Такой email уже используется',
    profileUpdateFailed: 'Не удалось обновить профиль',
    currentRequired: 'Введите текущий пароль',
    nextMin: 'Новый пароль минимум 8 символов',
    confirmRequired: 'Повторите новый пароль',
    mismatch: 'Пароли не совпадают',
    userNotFound: 'Пользователь не найден',
    wrongCurrentPassword: 'Неверный текущий пароль',
    passwordUpdated: 'Пароль обновлён',
  },
  en: {
    nameRequired: 'Enter a name',
    invalidEmail: 'Invalid email',
    unauthorized: 'Authorization required',
    profileUpdated: 'Profile updated',
    emailTaken: 'This email is already in use',
    profileUpdateFailed: 'Failed to update profile',
    currentRequired: 'Enter current password',
    nextMin: 'New password must be at least 8 characters',
    confirmRequired: 'Repeat the new password',
    mismatch: 'Passwords do not match',
    userNotFound: 'User not found',
    wrongCurrentPassword: 'Current password is incorrect',
    passwordUpdated: 'Password updated',
  },
};

function localeFromFormData(formData: FormData): SeoLocale {
  const raw = formData.get('locale');
  return isSeoLocale(raw) ? raw : 'de';
}

export async function updateProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = localeFromFormData(formData);
  const t = ACTION_COPY[locale];
  const session = await getServerSession(authOptions);
  const emailFromSession = session?.user?.email ?? null;

  if (!emailFromSession) {
    return { ok: false, message: t.unauthorized };
  }

  const profileSchema = z.object({
    name: z.string().trim().min(1, t.nameRequired),
    email: z.string().trim().email(t.invalidEmail),
  });

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
    return { ok: true, message: t.profileUpdated };
  } catch (e: unknown) {
    // P2002 — уникальность email
    if (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      (e as { code?: string }).code === 'P2002'
    ) {
      return { ok: false, message: t.emailTaken };
    }
    return { ok: false, message: t.profileUpdateFailed };
  }
}

export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = localeFromFormData(formData);
  const t = ACTION_COPY[locale];
  const session = await getServerSession(authOptions);
  const emailFromSession = session?.user?.email ?? null;

  if (!emailFromSession) {
    return { ok: false, message: t.unauthorized };
  }

  const passwordSchema = z
    .object({
      current: z.string().min(1, t.currentRequired),
      next: z.string().min(8, t.nextMin),
      confirm: z.string().min(1, t.confirmRequired),
    })
    .refine((d) => d.next === d.confirm, {
      message: t.mismatch,
      path: ['confirm'],
    });

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

  if (!me) return { ok: false, message: t.userNotFound };

  const valid = await verifyPassword(parsed.data.current, me.passwordHash ?? '');
  if (!valid) return { ok: false, message: t.wrongCurrentPassword };

  const newHash = await hashPassword(parsed.data.next);
  await prisma.user.update({
    where: { id: me.id },
    data: { passwordHash: newHash },
    select: { id: true },
  });

  revalidatePath('/admin/profile');
  return { ok: true, message: t.passwordUpdated };
}

export const initialActionState: ActionState = initialState;
