// src/app/admin/clients/[id]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateClientSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2),
  phone: z.string().trim().regex(/^[\d\s+()\-]{6,}$/),
  email: z.string().trim().email(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  referral: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export type UpdateClientState = { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function updateClient(_: UpdateClientState, formData: FormData): Promise<UpdateClientState> {
  try {
    const payload = {
      id: String(formData.get("id") ?? ""),
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      birthDate: String(formData.get("birthDate") ?? ""),
      referral: ((): string | undefined => {
        const v = formData.get("referral");
        return typeof v === "string" && v.trim() ? v.trim() : undefined;
      })(),
      notes: ((): string | undefined => {
        const v = formData.get("notes");
        return typeof v === "string" && v.trim() ? v.trim() : undefined;
      })(),
    };

    const parsed = UpdateClientSchema.safeParse(payload);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const k = String(i.path?.[0] ?? "");
        if (k && !fe[k]) fe[k] = i.message;
      }
      return { ok: false, fieldErrors: fe, error: "Исправьте ошибки формы" };
    }

    await prisma.client.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name.trim(),
        phone: parsed.data.phone.trim(),
        email: parsed.data.email.trim(),
        birthDate: new Date(`${parsed.data.birthDate}T00:00:00Z`),
        referral: parsed.data.referral ?? null,
        notes: parsed.data.notes ?? null,
      },
    });

    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${parsed.data.id}`);

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: process.env.NODE_ENV === "development" ? `Server error: ${String(e)}` : "Не удалось сохранить",
    };
  }
}
