// src/lib/validators.ts
import { z } from "zod";
import { ArticleType } from "@prisma/client";

/**
 * Единый валидатор входных данных статьи/новости.
 * ВАЖНО: type завязан на Prisma enum через nativeEnum,
 * чтобы типы совпадали везде (UI, actions, Prisma).
 */
export const articleInput = z.object({
  type: z.nativeEnum(ArticleType),

  title: z.string().min(3).max(80),
  slug: z.string().min(3).max(60),

  excerpt: z.string().max(200).optional().nullable(),
  body: z.string().min(50).max(5000),

  cover: z.string().optional().nullable(),    // путь к файлу (если уже сохранён)

  // строки-ISO (или пусто), UI преобразует перед отправкой
  publishedAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),

  seoTitle: z.string().max(120).optional().nullable(),
  seoDesc: z.string().max(200).optional().nullable(),
  ogTitle: z.string().max(120).optional().nullable(),
  ogDesc: z.string().max(200).optional().nullable(),
});

export type ArticleInput = z.infer<typeof articleInput>;

/** Удобная «форма» для начальных данных из БД */
export type FormInitial = Partial<
  Omit<ArticleInput, "publishedAt" | "expiresAt"> & {
    publishedAt?: string | Date | null;
    expiresAt?: string | Date | null;
  }
>;
