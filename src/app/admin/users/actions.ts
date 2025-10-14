// src/app/admin/users/actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma, Role } from "@prisma/client";
import { hashPassword } from "@/lib/password";
import { assertAdminAction } from "@/lib/rbac";

/* ───────────────────────── helpers ───────────────────────── */

function parseOrThrow<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const res = schema.safeParse(input);
  if (!res.success) {
    const msg = res.error.issues.map((i) => i.message).join(", ");
    throw new Error(msg || "Некорректные данные");
  }
  return res.data;
}

/* ───────────────────────── Создание пользователя ───────────────────────── */

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя"),
  email: z.string().trim().email("Некорректный email").transform((s) => s.toLowerCase()),
  password: z.string().min(8, "Пароль минимум 8 символов"),
  role: z.nativeEnum(Role).default(Role.USER),
  masterId: z.string().trim().min(1, "Выберите мастера").optional().nullable(),
});

export async function createUser(formData: FormData): Promise<void> {
  await assertAdminAction();

  const data = parseOrThrow(createUserSchema, {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "USER"),
    masterId: (formData.get("masterId") as string | null) ?? null,
  });

  const { name, email, password, role, masterId } = data;
  const passwordHash = await hashPassword(password);

  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) throw new Error("Пользователь с таким email уже существует");

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash, role },
        select: { id: true },
      });

      if (role === "MASTER" && masterId) {
        const target = await tx.master.findUnique({
          where: { id: masterId },
          select: { userId: true },
        });
        if (target?.userId && target.userId !== user.id) {
          throw new Error("К выбранному мастеру уже привязан другой пользователь");
        }
        await tx.master.update({
          where: { id: masterId },
          data: { userId: user.id },
        });
      }
    });

    revalidatePath("/admin/users");
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new Error("Пользователь с таким email уже существует");
    }
    throw err;
  }
}

/* ───────────────────────── Смена роли ───────────────────────── */

const updateRoleSchema = z.object({
  userId: z.string().trim().min(1, "userId обязателен"),
  role: z.nativeEnum(Role),
});

export async function updateUserRole(formData: FormData): Promise<void> {
  await assertAdminAction();

  const { userId, role } = parseOrThrow(updateRoleSchema, {
    userId: String(formData.get("userId") ?? ""),
    role: String(formData.get("role") ?? ""),
  });

  if (role !== "ADMIN") {
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (current?.role === "ADMIN") {
      const admins = await prisma.user.count({ where: { role: "ADMIN" } });
      if (admins <= 1) {
        throw new Error("Должен остаться хотя бы один администратор");
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { role } });
    if (role !== "MASTER") {
      await tx.master.updateMany({ where: { userId }, data: { userId: null } });
    }
  });

  revalidatePath("/admin/users");
}

/* ───────────────────────── Привязка/отвязка мастера ───────────────────────── */

const linkSchema = z.object({
  userId: z.string().trim().min(1, "userId обязателен"),
  masterId: z.string().trim().min(1, "Выберите мастера"),
});

export async function linkUserToMaster(formData: FormData): Promise<void> {
  await assertAdminAction();

  const { userId, masterId } = parseOrThrow(linkSchema, {
    userId: String(formData.get("userId") ?? ""),
    masterId: String(formData.get("masterId") ?? ""),
  });

  await prisma.$transaction(async (tx) => {
    const target = await tx.master.findUnique({
      where: { id: masterId },
      select: { userId: true },
    });
    if (target?.userId && target.userId !== userId) {
      throw new Error("К мастеру уже привязан другой пользователь");
    }

    await tx.master.updateMany({
      where: { userId, NOT: { id: masterId } },
      data: { userId: null },
    });

    await tx.master.update({
      where: { id: masterId },
      data: { userId },
    });
  });

  revalidatePath("/admin/users");
}

const unlinkSchema = z.object({
  userId: z.string().trim().min(1, "userId обязателен"),
});

export async function unlinkUserFromMaster(formData: FormData): Promise<void> {
  await assertAdminAction();

  const { userId } = parseOrThrow(unlinkSchema, {
    userId: String(formData.get("userId") ?? ""),
  });

  await prisma.master.updateMany({
    where: { userId },
    data: { userId: null },
  });

  revalidatePath("/admin/users");
}

/* ───────────────────────── Удаление пользователя ───────────────────────── */

const deleteSchema = z.object({
  userId: z.string().trim().min(1, "userId обязателен"),
});

export async function deleteUser(formData: FormData): Promise<void> {
  await assertAdminAction();

  const { userId } = parseOrThrow(deleteSchema, {
    userId: String(formData.get("userId") ?? ""),
  });

  await prisma.$transaction(async (tx) => {
    await tx.master.updateMany({ where: { userId }, data: { userId: null } });
    await tx.client.updateMany({ where: { userId }, data: { userId: null } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  revalidatePath("/admin/users");
}







//---------------работало до 13.10.2024---------------- 
// 'use server';

// import { z } from 'zod';
// import { prisma } from '@/lib/db';
// import { revalidatePath } from 'next/cache';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { Prisma, Role } from '@prisma/client';
// import { hashPassword } from '@/lib/password';

// /* ───────────────────────── helpers ───────────────────────── */

// async function ensureAdmin(): Promise<void> {
//   const session = await getServerSession(authOptions);
//   if (session?.user?.role !== 'ADMIN') {
//     throw new Error('Недостаточно прав');
//   }
// }

// /** Универсальный парсер: кидает человеко-читаемую ошибку */
// function parseOrThrow<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
//   const res = schema.safeParse(input);
//   if (!res.success) {
//     const msg = res.error.issues.map((i) => i.message).join(', ');
//     throw new Error(msg || 'Некорректные данные');
//   }
//   return res.data;
// }

// /* ───────────────────────── Создание пользователя ───────────────────────── */

// const createUserSchema = z.object({
//   name: z.string().trim().min(1, 'Укажите имя'),
//   email: z
//     .string()
//     .trim()
//     .email('Некорректный email')
//     .transform((s) => s.toLowerCase()),
//   password: z.string().min(8, 'Пароль минимум 8 символов'),
//   role: z.nativeEnum(Role).default(Role.USER),
//   /** для роли MASTER можно сразу привязать карточку мастера */
//   masterId: z.string().trim().min(1, 'Выберите мастера').optional().nullable(),
// });

// export async function createUser(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const data = parseOrThrow(createUserSchema, {
//     name: String(formData.get('name') ?? ''),
//     email: String(formData.get('email') ?? ''),
//     password: String(formData.get('password') ?? ''),
//     role: String(formData.get('role') ?? 'USER'),
//     masterId: (formData.get('masterId') as string | null) ?? null,
//   });

//   const { name, email, password, role, masterId } = data;
//   const passwordHash = await hashPassword(password);

//   // Дружественная проверка на дубль
//   const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
//   if (exists) throw new Error('Пользователь с таким email уже существует');

//   try {
//     await prisma.$transaction(async (tx) => {
//       const user = await tx.user.create({
//         data: { name, email, passwordHash, role },
//         select: { id: true },
//       });

//       // Если создаём пользователя с ролью MASTER и указан masterId — привязываем
//       if (role === 'MASTER' && masterId) {
//         const target = await tx.master.findUnique({
//           where: { id: masterId },
//           select: { userId: true },
//         });
//         if (target?.userId && target.userId !== user.id) {
//           throw new Error('К выбранному мастеру уже привязан другой пользователь');
//         }
//         await tx.master.update({ where: { id: masterId }, data: { userId: user.id } });
//       }
//     });

//     revalidatePath('/admin/users');
//   } catch (err) {
//     if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
//       throw new Error('Пользователь с таким email уже существует');
//     }
//     throw err;
//   }
// }

// /* ───────────────────────── Смена роли ───────────────────────── */

// const updateRoleSchema = z.object({
//   userId: z.string().trim().min(1, 'userId обязателен'),
//   role: z.nativeEnum(Role),
// });

// export async function updateUserRole(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const { userId, role } = parseOrThrow(updateRoleSchema, {
//     userId: String(formData.get('userId') ?? ''),
//     role: String(formData.get('role') ?? ''),
//   });

//   // Нельзя «уронить» последнего админа
//   if (role !== 'ADMIN') {
//     const current = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
//     if (current?.role === 'ADMIN') {
//       const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
//       if (admins <= 1) throw new Error('Должен остаться хотя бы один администратор');
//     }
//   }

//   await prisma.$transaction(async (tx) => {
//     await tx.user.update({ where: { id: userId }, data: { role } });

//     // Если роль стала не MASTER — отвяжем все карточки мастеров от этого логина
//     if (role !== 'MASTER') {
//       await tx.master.updateMany({ where: { userId }, data: { userId: null } });
//     }
//   });

//   revalidatePath('/admin/users');
// }

// /* ───────────────────────── Привязка / отвязка мастера ───────────────────────── */

// const linkSchema = z.object({
//   userId: z.string().trim().min(1, 'userId обязателен'),
//   masterId: z.string().trim().min(1, 'Выберите мастера'),
// });

// export async function linkUserToMaster(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const { userId, masterId } = parseOrThrow(linkSchema, {
//     userId: String(formData.get('userId') ?? ''),
//     masterId: String(formData.get('masterId') ?? ''),
//   });

//   await prisma.$transaction(async (tx) => {
//     // целевой мастер не должен быть занят другим пользователем
//     const target = await tx.master.findUnique({ where: { id: masterId }, select: { userId: true } });
//     if (target?.userId && target.userId !== userId) {
//       throw new Error('К мастеру уже привязан другой пользователь');
//     }

//     // отвяжем прежнего мастера (если был)
//     await tx.master.updateMany({ where: { userId, NOT: { id: masterId } }, data: { userId: null } });

//     // привяжем нового
//     await tx.master.update({ where: { id: masterId }, data: { userId } });
//   });

//   revalidatePath('/admin/users');
// }

// const unlinkSchema = z.object({
//   userId: z.string().trim().min(1, 'userId обязателен'),
// });

// export async function unlinkUserFromMaster(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const { userId } = parseOrThrow(unlinkSchema, {
//     userId: String(formData.get('userId') ?? ''),
//   });

//   await prisma.master.updateMany({ where: { userId }, data: { userId: null } });
//   revalidatePath('/admin/users');
// }

// /* ───────────────────────── Удаление пользователя ───────────────────────── */

// const deleteUserSchema = z.object({
//   userId: z.string().trim().min(1, 'userId обязателен'),
// });

// /**
//  * Безопасное удаление: проверяет «последнего админа» и
//  * снимает привязки мастеров; чистит сессии/аккаунты NextAuth.
//  * Подходит для кейса «ошибочная учётка».
//  */
// export async function deleteUser(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const { userId } = parseOrThrow(deleteUserSchema, {
//     userId: String(formData.get('userId') ?? ''),
//   });

//   await prisma.$transaction(async (tx) => {
//     const user = await tx.user.findUnique({
//       where: { id: userId },
//       select: { id: true, role: true, email: true },
//     });
//     if (!user) throw new Error('Пользователь не найден');

//     // Нельзя удалить последнего администратора
//     if (user.role === 'ADMIN') {
//       const admins = await tx.user.count({ where: { role: 'ADMIN' } });
//       if (admins <= 1) throw new Error('Нельзя удалить последнего администратора');
//     }

//     // Отвязать всех мастеров
//     await tx.master.updateMany({ where: { userId }, data: { userId: null } });

//     // Почистить NextAuth сущности (если используются стандартные модели)
//     await tx.session?.deleteMany?.({ where: { userId } }).catch(() => {});
//     await tx.account?.deleteMany?.({ where: { userId } }).catch(() => {});
//     if (user.email) {
//       await tx.verificationToken?.deleteMany?.({ where: { identifier: user.email } }).catch(() => {});
//     }

//     // Удалить пользователя
//     await tx.user.delete({ where: { id: userId } });
//   });

//   revalidatePath('/admin/users');
// }

// /**
//  * Жёсткое удаление с попыткой принудительно очистить все связи.
//  * Используйте только если обычное удаление падает из-за внешних ключей.
//  */
// export async function forceDeleteUser(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const { userId } = parseOrThrow(deleteUserSchema, {
//     userId: String(formData.get('userId') ?? ''),
//   });

//   try {
//     await prisma.$transaction(async (tx) => {
//       const user = await tx.user.findUnique({
//         where: { id: userId },
//         select: { id: true, role: true, email: true },
//       });
//       if (!user) return;

//       if (user.role === 'ADMIN') {
//         const admins = await tx.user.count({ where: { role: 'ADMIN' } });
//         if (admins <= 1) throw new Error('Нельзя удалить последнего администратора');
//       }

//       await tx.master.updateMany({ where: { userId }, data: { userId: null } });

//       await tx.session?.deleteMany?.({ where: { userId } }).catch(() => {});
//       await tx.account?.deleteMany?.({ where: { userId } }).catch(() => {});
//       if (user.email) {
//         await tx.verificationToken?.deleteMany?.({ where: { identifier: user.email } }).catch(() => {});
//       }

//       // здесь можно добавить чистку других ваших пользовательских связей, если появятся

//       await tx.user.delete({ where: { id: userId } });
//     });

//     revalidatePath('/admin/users');
//   } catch (err) {
//     if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
//       throw new Error('Нельзя удалить пользователя: есть связанные записи в базе');
//     }
//     throw err;
//   }
// }





//------------работало--------
// 'use server';

// import { z } from 'zod';
// import { prisma } from '@/lib/db';
// import { revalidatePath } from 'next/cache';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { Prisma, Role } from '@prisma/client';
// import { hashPassword } from '@/lib/password';

// /* ───────────────────────── helpers ───────────────────────── */

// async function ensureAdmin(): Promise<void> {
//   const session = await getServerSession(authOptions);
//   if (session?.user?.role !== 'ADMIN') {
//     throw new Error('Недостаточно прав');
//   }
// }

// /** Универсальный парсер: кидает человеко-читаемую ошибку, если не подходит схема */
// function parseOrThrow<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
//   const res = schema.safeParse(input);
//   if (!res.success) {
//     const msg = res.error.issues.map((i) => i.message).join(', ');
//     throw new Error(msg || 'Некорректные данные');
//   }
//   return res.data;
// }

// /* ───────────────────────── Создание пользователя ───────────────────────── */

// const createUserSchema = z.object({
//   name: z.string().trim().min(1, 'Укажите имя'),
//   email: z
//     .string()
//     .trim()
//     .email('Некорректный email')
//     .transform((s) => s.toLowerCase()),
//   password: z.string().min(8, 'Пароль минимум 8 символов'),
//   role: z.nativeEnum(Role).default(Role.USER),
//   /** для роли MASTER можно сразу привязать карточку мастера */
//   masterId: z
//     .string()
//     .trim()
//     .min(1, 'Выберите мастера')
//     .optional()
//     .nullable(),
// });

// export async function createUser(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const data = parseOrThrow(createUserSchema, {
//     name: String(formData.get('name') ?? ''),
//     email: String(formData.get('email') ?? ''),
//     password: String(formData.get('password') ?? ''),
//     role: String(formData.get('role') ?? 'USER'),
//     masterId: (formData.get('masterId') as string | null) ?? null,
//   });

//   const { name, email, password, role, masterId } = data;
//   const passwordHash = await hashPassword(password);

//   // Быстрая проверка на дубль почты (чтобы показать дружественную ошибку)
//   const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
//   if (exists) throw new Error('Пользователь с таким email уже существует');

//   try {
//     await prisma.$transaction(async (tx) => {
//       const user = await tx.user.create({
//         data: { name, email, passwordHash, role },
//         select: { id: true },
//       });

//       // Если создаём пользователя с ролью MASTER и указан masterId — привязываем
//       if (role === 'MASTER' && masterId) {
//         const target = await tx.master.findUnique({
//           where: { id: masterId },
//           select: { userId: true },
//         });
//         if (target?.userId && target.userId !== user.id) {
//           throw new Error('К выбранному мастеру уже привязан другой пользователь');
//         }
//         await tx.master.update({
//           where: { id: masterId },
//           data: { userId: user.id },
//         });
//       }
//     });

//     revalidatePath('/admin/users');
//   } catch (err) {
//     // Перехватываем гонку по уникальности email
//     if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
//       // P2002.meta?.target обычно включает 'email'
//       throw new Error('Пользователь с таким email уже существует');
//     }
//     throw err;
//   }
// }

// /* ───────────────────────── Смена роли ───────────────────────── */

// const updateRoleSchema = z.object({
//   userId: z.string().trim().min(1, 'userId обязателен'),
//   role: z.nativeEnum(Role),
// });

// export async function updateUserRole(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const { userId, role } = parseOrThrow(updateRoleSchema, {
//     userId: String(formData.get('userId') ?? ''),
//     role: String(formData.get('role') ?? ''),
//   });

//   // Нельзя «уронить» последнего админа
//   if (role !== 'ADMIN') {
//     const current = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { role: true },
//     });
//     if (current?.role === 'ADMIN') {
//       const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
//       if (admins <= 1) {
//         throw new Error('Должен остаться хотя бы один администратор');
//       }
//     }
//   }

//   await prisma.$transaction(async (tx) => {
//     await tx.user.update({ where: { id: userId }, data: { role } });

//     // Если роль стала не MASTER — отвяжем все карточки мастеров от этого логина
//     if (role !== 'MASTER') {
//       await tx.master.updateMany({ where: { userId }, data: { userId: null } });
//     }
//   });

//   revalidatePath('/admin/users');
// }

// /* ───────────────────────── Привязка/отвязка мастера ───────────────────────── */

// const linkSchema = z.object({
//   userId: z.string().trim().min(1, 'userId обязателен'),
//   masterId: z.string().trim().min(1, 'Выберите мастера'),
// });

// export async function linkUserToMaster(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const { userId, masterId } = parseOrThrow(linkSchema, {
//     userId: String(formData.get('userId') ?? ''),
//     masterId: String(formData.get('masterId') ?? ''),
//   });

//   await prisma.$transaction(async (tx) => {
//     // 1) целевой мастер не должен быть занят другим пользователем
//     const target = await tx.master.findUnique({
//       where: { id: masterId },
//       select: { userId: true },
//     });
//     if (target?.userId && target.userId !== userId) {
//       throw new Error('К мастеру уже привязан другой пользователь');
//     }

//     // 2) у пользователя может быть только один «активный» мастер:
//     // отвяжем прежнего (если был)
//     await tx.master.updateMany({
//       where: { userId, NOT: { id: masterId } },
//       data: { userId: null },
//     });

//     // 3) привяжем нового
//     await tx.master.update({
//       where: { id: masterId },
//       data: { userId },
//     });
//   });

//   revalidatePath('/admin/users');
// }

// const unlinkSchema = z.object({
//   userId: z.string().trim().min(1, 'userId обязателен'),
// });

// export async function unlinkUserFromMaster(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const { userId } = parseOrThrow(unlinkSchema, {
//     userId: String(formData.get('userId') ?? ''),
//   });

//   await prisma.master.updateMany({
//     where: { userId },
//     data: { userId: null },
//   });

//   revalidatePath('/admin/users');
// }











// 'use server';

// import { z } from 'zod';
// import { prisma } from '@/lib/db';
// import { revalidatePath } from 'next/cache';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { Prisma, Role } from '@prisma/client';
// import { hashPassword } from '@/lib/password';

// /** Только админ */
// async function ensureAdmin(): Promise<void> {
//   const session = await getServerSession(authOptions);
//   if (session?.user?.role !== 'ADMIN') {
//     throw new Error('Недостаточно прав');
//   }
// }

// /* ───────────────────────── Создание пользователя ───────────────────────── */

// const createUserSchema = z.object({
//   name: z.string().trim().min(1, 'Укажите имя'),
//   email: z.string().trim().email('Некорректный email').transform((s) => s.toLowerCase()),
//   password: z.string().min(8, 'Пароль минимум 8 символов'),
//   role: z.nativeEnum(Role),
//   masterId: z.string().trim().optional().nullable(),
// });

// export async function createUser(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const parsed = createUserSchema.safeParse({
//     name: String(formData.get('name') ?? ''),
//     email: String(formData.get('email') ?? ''),
//     password: String(formData.get('password') ?? ''),
//     role: String(formData.get('role') ?? 'USER'),
//     masterId: (formData.get('masterId') as string | null) ?? null,
//   });

//   if (!parsed.success) {
//     const msg = parsed.error.issues.map((i) => i.message).join(', ');
//     throw new Error(msg);
//   }

//   const { name, email, password, role, masterId } = parsed.data;
//   const passwordHash = await hashPassword(password);

//   // Предварительная проверка, чтобы вернуть понятную ошибку
//   const exists = await prisma.user.findUnique({
//     where: { email },
//     select: { id: true },
//   });
//   if (exists) {
//     throw new Error('Пользователь с таким email уже существует');
//   }

//   try {
//     await prisma.$transaction(async (tx) => {
//       const user = await tx.user.create({
//         data: { name, email, passwordHash, role },
//         select: { id: true },
//       });

//       // Если создаём мастера и указан masterId — привязываем
//       if (role === 'MASTER' && masterId) {
//         const m = await tx.master.findUnique({
//           where: { id: masterId },
//           select: { userId: true },
//         });
//         if (m?.userId) {
//           throw new Error('К выбранному мастеру уже привязан пользователь');
//         }
//         await tx.master.update({
//           where: { id: masterId },
//           data: { userId: user.id },
//         });
//       }
//     });

//     revalidatePath('/admin/users');
//   } catch (e) {
//     // На случай гонки: ловим P2002 и возвращаем то же дружелюбное сообщение
//     if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
//       throw new Error('Пользователь с таким email уже существует');
//     }
//     throw e;
//   }
// }

// /* ───────────────────────── Смена роли ───────────────────────── */

// const updateRoleSchema = z.object({
//   userId: z.string().trim().min(1),
//   role: z.nativeEnum(Role),
// });

// export async function updateUserRole(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const parsed = updateRoleSchema.safeParse({
//     userId: String(formData.get('userId') ?? ''),
//     role: String(formData.get('role') ?? ''),
//   });
//   if (!parsed.success) throw new Error('Некорректные данные');

//   const { userId, role } = parsed.data;

//   // Нельзя «уронить» последнего админа
//   if (role !== 'ADMIN') {
//     const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
//     const isTargetAdmin =
//       (await prisma.user.findUnique({ where: { id: userId }, select: { role: true } }))?.role ===
//       'ADMIN';
//     if (isTargetAdmin && admins <= 1) {
//       throw new Error('Должен остаться хотя бы один администратор');
//     }
//   }

//   await prisma.user.update({
//     where: { id: userId },
//     data: { role },
//     select: { id: true },
//   });

//   revalidatePath('/admin/users');
// }

// /* ───────────────────────── Привязка/отвязка мастера ───────────────────────── */

// const linkSchema = z.object({
//   userId: z.string().trim().min(1),
//   masterId: z.string().trim().min(1),
// });

// export async function linkUserToMaster(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const parsed = linkSchema.safeParse({
//     userId: String(formData.get('userId') ?? ''),
//     masterId: String(formData.get('masterId') ?? ''),
//   });
//   if (!parsed.success) throw new Error('Некорректные данные');

//   const { userId, masterId } = parsed.data;

//   await prisma.$transaction(async (tx) => {
//     const target = await tx.master.findUnique({
//       where: { id: masterId },
//       select: { userId: true },
//     });
//     if (target?.userId && target.userId !== userId) {
//       throw new Error('К мастеру уже привязан другой пользователь');
//     }

//     const prev = await tx.master.findFirst({
//       where: { userId },
//       select: { id: true },
//     });
//     if (prev && prev.id !== masterId) {
//       await tx.master.update({
//         where: { id: prev.id },
//         data: { userId: null },
//       });
//     }

//     await tx.master.update({
//       where: { id: masterId },
//       data: { userId },
//     });
//   });

//   revalidatePath('/admin/users');
// }

// const unlinkSchema = z.object({
//   userId: z.string().trim().min(1),
// });

// export async function unlinkUserFromMaster(formData: FormData): Promise<void> {
//   await ensureAdmin();

//   const parsed = unlinkSchema.safeParse({
//     userId: String(formData.get('userId') ?? ''),
//   });
//   if (!parsed.success) throw new Error('Некорректные данные');

//   const { userId } = parsed.data;

//   await prisma.master.updateMany({
//     where: { userId },
//     data: { userId: null },
//   });

//   revalidatePath('/admin/users');
// }
