// src/app/api/book/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/booking";

const BookingSchema = z.object({
  serviceSlug: z.string().min(1),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  startMin: z.coerce.number().int().nonnegative(),
  endMin: z.coerce.number().int().positive(),
  masterId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  source: z.string().optional(),
  notes: z.string().optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;

function getErrorMessage(err: unknown): string {
  if (err instanceof z.ZodError) {
    // Вернём первую понятную ошибку валидации
    return err.issues[0]?.message ?? "Validation error";
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

async function readBody(req: Request): Promise<Record<string, unknown>> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const data = await req.json();
    return (data ?? {}) as Record<string, unknown>;
  }
  // поддержим x-www-form-urlencoded и multipart/form-data
  const form = await req.formData();
  const obj: Record<string, unknown> = {};
  for (const [k, v] of form.entries()) obj[k] = typeof v === "string" ? v : v.name;
  return obj;
}

export async function POST(req: Request) {
  try {
    const raw = await readBody(req);
    const input = BookingSchema.parse(raw); // тип: BookingInput
    const result = await createBooking(input);
    // result тоже должен быть типизирован (см. ниже lib/booking.ts)
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const status = err instanceof z.ZodError ? 422 : 400;
    return NextResponse.json({ ok: false, error: getErrorMessage(err) }, { status });
  }
}
