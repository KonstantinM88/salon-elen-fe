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