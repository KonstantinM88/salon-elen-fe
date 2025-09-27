// пример: src/lib/validators.ts
import { z } from "zod";

export const articleInput = z.object({
  type: z.enum(["ARTICLE", "NEWS"]),
  title: z.string().min(3).max(80),
  slug: z.string().min(3).max(60).regex(/^[\p{L}\p{N}-]+$/u, "Только буквы/цифры/дефис"),
  excerpt: z.string().max(200).optional().or(z.literal("")),
  body: z.string().min(50).max(5000),
  cover: z.string().optional().or(z.literal("")), // можно оставить пустым — файл возьмём из coverFile
  publishedAt: z.string().datetime().optional().or(z.literal("")),
  expiresAt: z.string().datetime().optional().or(z.literal("")),
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  seoDesc: z.string().max(200).optional().or(z.literal("")),
  ogTitle: z.string().max(120).optional().or(z.literal("")),
  ogDesc: z.string().max(200).optional().or(z.literal("")),
});
