import { z } from "zod";

/** --------- Services (если есть) ---------- */
export const serviceInput = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  durationMin: z.number().int().positive(),
});

/** --------- Articles ---------- */
/**
 * Разрешаем:
 * - cover: локальный путь "/uploads/..." или любой URL
 * - publishedAt/expiresAt: строка из <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
 *   либо полная ISO/RFC строка, либо отсутствие значения.
 * Преобразование в Date делаем в server actions.
 */
const coverSchema = z
  .string()
  .url()
  .or(z.string().startsWith("/"))
  .optional();

const dtLocal = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{3}Z)?)?$/, { message: "Неверный формат даты" })
  .optional();

export const articleInput = z.object({
  type: z.enum(["ARTICLE", "PROMO"]).default("ARTICLE"),
  title: z.string().min(2, "Заголовок слишком короткий"),
  slug: z
    .string()
    .min(2, "Слаг слишком короткий")
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефисы"),
  excerpt: z.string().optional(),
  body: z.string().min(10, "Текст слишком короткий"),
  cover: coverSchema,
  // принимаем и 'YYYY-MM-DDTHH:mm', и ISO; пустое — ок
  publishedAt: dtLocal,
  expiresAt: dtLocal,
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDesc: z.string().optional(),
});

export type ArticleInput = z.infer<typeof articleInput>;
