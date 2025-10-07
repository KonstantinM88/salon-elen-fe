"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export type CreateClientState = {
  ok: boolean;
  id?: string;
  formError?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof CreateClientSchema>, string>>;
};

const initialState: CreateClientState = { ok: false };

/** Валидация полей формы создания клиента */
const CreateClientSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя"),
  phone: z
    .string()
    .trim()
    .min(5, "Укажите телефон")
    .transform((s) => s.replace(/\s+/g, "")),
  email: z.string().trim().email("Неверный e-mail"),
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

export async function createClient(
  _prev: CreateClientState = initialState,
  formData: FormData
): Promise<CreateClientState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    referral: (formData.get("referral") ?? "") as string,
    notes: (formData.get("notes") ?? "") as string,
  };

  const parsed = CreateClientSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: CreateClientState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof CreateClientSchema>;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const data = parsed.data;

  try {
    const created = await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        birthDate: data.birthDate,
        referral: data.referral, // nullable
        notes: data.notes,       // nullable
      },
      select: { id: true },
    });

    // Обновим список клиентов
    revalidatePath("/admin/clients");

    return { ok: true, id: created.id };
  } catch (e) {
    // ловим конфликты уникальности (телефон / e-mail)
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const target = Array.isArray(e.meta?.target) ? (e.meta?.target as string[]) : [];
      const fieldErrors: CreateClientState["fieldErrors"] = {};
      if (target.includes("phone")) fieldErrors.phone = "Такой телефон уже используется";
      if (target.includes("email")) fieldErrors.email = "Такой e-mail уже используется";
      return { ok: false, fieldErrors };
    }
    return { ok: false, formError: "Не удалось создать клиента" };
  }
}
