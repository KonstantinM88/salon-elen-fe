"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

/* ======================= ВАЛИДАЦИЯ ======================= */

const UpdateClientSchema = z.object({
  id: z.string().cuid(),
  name: z.string().trim().min(2, "Укажите имя"),
  phone: z
    .string()
    .trim()
    .min(5, "Укажите телефон")
    .transform((s) => s.replace(/\s+/g, "")),
  email: z
    .union([z.string().trim().email("Неверный e-mail"), z.literal("")])
    .transform((v) => (v === "" ? undefined : v)),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Формат YYYY-MM-DD")
    .transform((s) => new Date(`${s}T00:00:00.000Z`)),
  referral: z
    .string()
    .trim()
    .max(120, "Слишком длинно")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  notes: z
    .string()
    .trim()
    .max(5000, "Слишком длинно")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
});

export type UpdateClientState = {
  ok: boolean;
  formError?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof UpdateClientSchema>, string>>;
};

const initialState: UpdateClientState = { ok: false };

/* ======================= ОБНОВЛЕНИЕ ======================= */

export async function updateClient(
  _prev: UpdateClientState = initialState,
  formData: FormData
): Promise<UpdateClientState> {
  const raw = {
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: (formData.get("email") ?? "") as string,
    birthDate: String(formData.get("birthDate") ?? ""),
    referral: (formData.get("referral") ?? "") as string,
    notes: (formData.get("notes") ?? "") as string,
  };

  const parsed = UpdateClientSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: UpdateClientState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof UpdateClientSchema>;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const data = parsed.data;

  try {
    const updateData: Prisma.ClientUpdateInput = {
      name: data.name,
      phone: data.phone,
      birthDate: data.birthDate,
      referral: data.referral,
      notes: data.notes,
    };
    if (data.email !== undefined) {
      updateData.email = data.email;
    }

    await prisma.client.update({
      where: { id: data.id },
      data: updateData,
    });

    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${data.id}`);

    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const target = Array.isArray(e.meta?.target) ? (e.meta.target as string[]) : [];
      const fieldErrors: UpdateClientState["fieldErrors"] = {};
      if (target.includes("phone")) fieldErrors.phone = "Такой телефон уже используется";
      if (target.includes("email")) fieldErrors.email = "Такой e-mail уже используется";
      return { ok: false, fieldErrors };
    }
    return { ok: false, formError: "Не удалось сохранить изменения" };
  }
}

/* ======================= УДАЛЕНИЕ ======================= */

export type DeleteClientState = {
  ok: boolean;
  formError?: string;
  fieldErrors?: { id?: string };
};

const DeleteSchema = z.object({
  id: z.string().min(1, "Не указан id клиента"),
});

export async function deleteClient(
  _prev: DeleteClientState,
  formData: FormData
): Promise<DeleteClientState> {
  const parsed = DeleteSchema.safeParse({
    id: String(formData.get("id") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: { id: parsed.error.issues[0]?.message ?? "Неверные данные" },
    };
  }

  const clientId = parsed.data.id;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.appointment.updateMany({
        where: { clientId },
        data: { clientId: null },
      });
      await tx.client.delete({ where: { id: clientId } });
    });
  } catch {
    return { ok: false, formError: "Не удалось удалить клиента" };
  }

  // ВАЖНО: redirect должен быть ВНЕ try/catch
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  redirect("/admin/clients");

  // недостижимо, оставлено для типизации
  // return { ok: true };
}
