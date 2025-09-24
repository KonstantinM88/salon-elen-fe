"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { articleInput } from "@/lib/validators";
import { ArticleType, Prisma } from "@prisma/client";
import { saveImageFile } from "@/lib/upload";

/* ---------- строгие типы результата ---------- */
/* eslint-disable @typescript-eslint/no-empty-object-type */
type Ok<T = {}> = { ok: true } & T;
type Fail = { ok: false; error: string; details?: unknown };
export type Result<T = {}> = Ok<T> | Fail;
/* eslint-enable @typescript-eslint/no-empty-object-type */

/* ---------- утилиты ---------- */
function toType(v: unknown): ArticleType {
  return v === "PROMO" ? ArticleType.PROMO : ArticleType.ARTICLE;
}
function valToString(v: FormDataEntryValue | undefined): string | undefined {
  if (v === undefined) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}
function valToDate(v: FormDataEntryValue | undefined): Date | null {
  const s = valToString(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** простой ретрай на случай временного обрыва (Neon "Closed" и т.п.) */
async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e: unknown) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      const transient =
        msg.includes("Closed") || msg.includes("ECONN") || msg.includes("socket");
      if (transient && i + 1 < attempts) continue;
      throw e;
    }
  }
  throw lastErr;
}

/* ---------- actions ---------- */

export async function createArticle(form: FormData): Promise<Result<{ id: string }>> {
  // локальная загрузка файла (если передан)
  const coverFile = form.get("coverFile");
  let uploadedSrc: string | undefined;
  if (coverFile instanceof File && coverFile.size > 0) {
    const saved = await saveImageFile(coverFile, { dir: "uploads", maxWidth: 1600 });
    uploadedSrc = saved.src; // /uploads/xxxx.webp
  }

  const p = Object.fromEntries(form.entries()) as Record<string, FormDataEntryValue>;

  // валидация через Zod
  const parsed = articleInput.safeParse({
    type: valToString(p.type) ?? "ARTICLE",
    title: valToString(p.title) ?? "",
    slug: valToString(p.slug) ?? "",
    excerpt: valToString(p.excerpt),
    body: valToString(p.body) ?? "",
    // приоритет у загруженного файла; иначе берём введённый URL
    cover: uploadedSrc ?? valToString(p.cover),
    publishedAt: valToString(p.publishedAt),
    expiresAt: valToString(p.expiresAt),
    seoTitle: valToString(p.seoTitle),
    seoDesc: valToString(p.seoDesc),
    ogTitle: valToString(p.ogTitle),
    ogDesc: valToString(p.ogDesc),
  });

  if (!parsed.success) {
    return { ok: false, error: "Некорректные поля", details: parsed.error.flatten() };
  }

  try {
    const created = await withRetry(() =>
      prisma.article.create({
        data: {
          type: toType(parsed.data.type),
          title: parsed.data.title,
          slug: parsed.data.slug,
          excerpt: parsed.data.excerpt,
          body: parsed.data.body,
          cover: parsed.data.cover,
          publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
          expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
          seoTitle: parsed.data.seoTitle,
          seoDesc: parsed.data.seoDesc,
          ogTitle: parsed.data.ogTitle,
          ogDesc: parsed.data.ogDesc,
        },
      })
    );

    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");
    return { ok: true, id: created.id };
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Такой slug уже существует" };
    }
    const msg = e instanceof Error ? e.message : "Не удалось сохранить статью";
    return { ok: false, error: msg };
  }
}

export async function updateArticle(
  id: string,
  form: FormData
): Promise<Result<{ id: string }>> {
  // локальная загрузка нового файла (если передан)
  const coverFile = form.get("coverFile");
  let uploadedSrc: string | undefined;
  if (coverFile instanceof File && coverFile.size > 0) {
    const saved = await saveImageFile(coverFile, { dir: "uploads", maxWidth: 1600 });
    uploadedSrc = saved.src;
  }

  const p = Object.fromEntries(form.entries()) as Record<string, FormDataEntryValue>;

  try {
    const updated = await withRetry(() =>
      prisma.article.update({
        where: { id },
        data: {
          type: toType(p.type),
          title: valToString(p.title),
          slug: valToString(p.slug),
          excerpt: valToString(p.excerpt),
          body: valToString(p.body),
          // новый локальный файл имеет приоритет, иначе текстовое поле cover
          cover: uploadedSrc ?? valToString(p.cover),
          publishedAt: valToDate(p.publishedAt),
          expiresAt: valToDate(p.expiresAt),
          seoTitle: valToString(p.seoTitle),
          seoDesc: valToString(p.seoDesc),
          ogTitle: valToString(p.ogTitle),
          ogDesc: valToString(p.ogDesc),
        },
      })
    );

    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");
    return { ok: true, id: updated.id };
  } catch (e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: "Такой slug уже существует" };
    }
    const msg = e instanceof Error ? e.message : "Не удалось обновить статью";
    return { ok: false, error: msg };
  }
}

export async function deleteArticle(id: string): Promise<Result> {
  try {
    await withRetry(() => prisma.article.delete({ where: { id } }));
    revalidatePath("/admin/news");
    revalidatePath("/news");
    revalidatePath("/");
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Не удалось удалить статью";
    return { ok: false, error: msg };
  }
}
