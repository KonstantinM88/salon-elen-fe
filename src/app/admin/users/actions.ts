// src/app/admin/users/actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma, Role } from "@prisma/client";
import { hashPassword } from "@/lib/password";
import { assertAdminAction } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isSeoLocale } from "@/lib/seo-locale";

/* ───────────────────────── helpers ───────────────────────── */

function parseOrThrow<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const res = schema.safeParse(input);
  if (!res.success) {
    const msg = res.error.issues.map((i) => i.message).join(", ");
    throw new Error(msg || "Некорректные данные");
  }
  return res.data;
}

type UsersNoticeStatus = "success" | "error";

type UsersNoticeCode =
  | "user-created"
  | "role-updated"
  | "master-linked"
  | "master-unlinked"
  | "user-deleted"
  | "validation"
  | "user-exists"
  | "select-master"
  | "master-already-linked"
  | "last-admin"
  | "cannot-delete-self"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "unknown";

async function buildUsersRedirectUrl(
  status: UsersNoticeStatus,
  code: UsersNoticeCode,
): Promise<string> {
  const headerStore = await headers();
  const referer = headerStore.get("referer");
  const params = new URLSearchParams();

  if (referer) {
    try {
      const url = new URL(referer);
      const lang = url.searchParams.get("lang");
      if (isSeoLocale(lang)) {
        params.set("lang", lang);
      }
    } catch {
      // ignore invalid referer and fall back to base path
    }
  }

  params.set("usersStatus", status);
  params.set("usersCode", code);

  return `/admin/users?${params.toString()}`;
}

async function redirectToUsers(
  status: UsersNoticeStatus,
  code: UsersNoticeCode,
): Promise<never> {
  redirect(await buildUsersRedirectUrl(status, code));
}

function mapUsersActionError(error: unknown): UsersNoticeCode {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "user-exists";
    if (error.code === "P2025") return "not-found";
  }

  if (!(error instanceof Error)) return "unknown";

  const message = error.message.trim();

  if (
    message === "Некорректные данные" ||
    message.includes("Укажите имя") ||
    message.includes("Некорректный email") ||
    message.includes("Пароль минимум 8 символов") ||
    message.includes("userId обязателен")
  ) {
    return "validation";
  }

  if (message === "Пользователь с таким email уже существует") return "user-exists";
  if (message === "Выберите мастера") return "select-master";
  if (
    message === "К выбранному мастеру уже привязан другой пользователь" ||
    message === "К мастеру уже привязан другой пользователь"
  ) {
    return "master-already-linked";
  }
  if (message === "Должен остаться хотя бы один администратор") return "last-admin";
  if (message === "Нельзя удалить себя") return "cannot-delete-self";
  if (message === "Unauthorized") return "unauthorized";
  if (message === "Forbidden") return "forbidden";
  if (message === "Пользователь не найден") return "not-found";

  return "unknown";
}

/* ───────────────────────── Создание пользователя ───────────────────────── */

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя"),
  email: z.string().trim().email("Некорректный email").transform((s) => s.toLowerCase()),
  password: z.string().min(8, "Пароль минимум 8 символов"),
  role: z.nativeEnum(Role).default(Role.USER),
  masterId: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    },
    z.string().trim().min(1, "Выберите мастера").nullable().optional(),
  ),
});

export async function createUser(formData: FormData): Promise<void> {
  try {
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
  } catch (err) {
    const code = mapUsersActionError(err);
    if (code === "unknown") {
      console.error("[admin/users] createUser failed", err);
    }
    await redirectToUsers("error", code);
  }

  revalidatePath("/admin/users");
  await redirectToUsers("success", "user-created");
}

/* ───────────────────────── Смена роли ───────────────────────── */

const updateRoleSchema = z.object({
  userId: z.string().trim().min(1, "userId обязателен"),
  role: z.nativeEnum(Role),
});

export async function updateUserRole(formData: FormData): Promise<void> {
  try {
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
      if (!current) {
        throw new Error("Пользователь не найден");
      }
      if (current.role === "ADMIN") {
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
  } catch (err) {
    const code = mapUsersActionError(err);
    if (code === "unknown") {
      console.error("[admin/users] updateUserRole failed", err);
    }
    await redirectToUsers("error", code);
  }

  revalidatePath("/admin/users");
  await redirectToUsers("success", "role-updated");
}

/* ───────────────────────── Привязка/отвязка мастера ───────────────────────── */

const linkSchema = z.object({
  userId: z.string().trim().min(1, "userId обязателен"),
  masterId: z.string().trim().min(1, "Выберите мастера"),
});

export async function linkUserToMaster(formData: FormData): Promise<void> {
  try {
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
  } catch (err) {
    const code = mapUsersActionError(err);
    if (code === "unknown") {
      console.error("[admin/users] linkUserToMaster failed", err);
    }
    await redirectToUsers("error", code);
  }

  revalidatePath("/admin/users");
  await redirectToUsers("success", "master-linked");
}

const unlinkSchema = z.object({
  userId: z.string().trim().min(1, "userId обязателен"),
});

export async function unlinkUserFromMaster(formData: FormData): Promise<void> {
  try {
    await assertAdminAction();

    const { userId } = parseOrThrow(unlinkSchema, {
      userId: String(formData.get("userId") ?? ""),
    });

    await prisma.master.updateMany({
      where: { userId },
      data: { userId: null },
    });
  } catch (err) {
    const code = mapUsersActionError(err);
    if (code === "unknown") {
      console.error("[admin/users] unlinkUserFromMaster failed", err);
    }
    await redirectToUsers("error", code);
  }

  revalidatePath("/admin/users");
  await redirectToUsers("success", "master-unlinked");
}

/* ───────────────────────── Удаление пользователя ───────────────────────── */

const deleteSchema = z.object({
  userId: z.string().trim().min(1, "userId обязателен"),
});

export async function deleteUser(formData: FormData): Promise<void> {
  try {
    const session = await assertAdminAction();

    const { userId } = parseOrThrow(deleteSchema, {
      userId: String(formData.get("userId") ?? ""),
    });

    if (userId === session.user.id) {
      throw new Error("Нельзя удалить себя");
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      throw new Error("Пользователь не найден");
    }

    if (targetUser.role === "ADMIN") {
      const admins = await prisma.user.count({ where: { role: "ADMIN" } });
      if (admins <= 1) {
        throw new Error("Должен остаться хотя бы один администратор");
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.master.updateMany({ where: { userId }, data: { userId: null } });
      await tx.client.updateMany({ where: { userId }, data: { userId: null } });
      await tx.account.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
  } catch (err) {
    const code = mapUsersActionError(err);
    if (code === "unknown") {
      console.error("[admin/users] deleteUser failed", err);
    }
    await redirectToUsers("error", code);
  }

  revalidatePath("/admin/users");
  await redirectToUsers("success", "user-deleted");
}
