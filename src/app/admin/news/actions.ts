"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { articleInput } from "@/lib/validators";
import { saveImageFile } from "@/lib/upload";
import type { Prisma } from "@prisma/client";
import { ArticleType } from "@prisma/client";

/** Результаты для форм */
type FieldErrors = Record<string, unknown>;
export type ActionFail = { ok: false; error: string; details?: { fieldErrors?: FieldErrors } };
export type ActionOk = { ok: true; id?: string };
export type ActionResult = ActionOk | ActionFail;

/** Строка ISO → Date | undefined */
function toDateU(v?: string): Date | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** CREATE */
export async function createArticle(fd: FormData): Promise<ActionResult> {
  try {
    const json = Object.fromEntries(fd.entries());
    const parsed = articleInput.safeParse(json);
    if (!parsed.success) {
      return { ok: false, error: "Некорректные поля", details: { fieldErrors: parsed.error.format() } };
    }

    // файл обложки
    let coverU: string | undefined = undefined;
    const raw = fd.get("coverFile");
    if (raw instanceof File && raw.size > 0) {
      const saved = await saveImageFile(raw);
      coverU = saved.src;
    }

    // публикуем СЕЙЧАС, если publishedAt не пришёл
    const publishedAt = toDateU(parsed.data.publishedAt) ?? new Date();

    const data: Prisma.ArticleCreateInput = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      type: parsed.data.type as ArticleType,
      body: parsed.data.body,
      excerpt: parsed.data.excerpt ?? undefined,
      cover: coverU,
      seoTitle: parsed.data.seoTitle ?? undefined,
      seoDesc: parsed.data.seoDesc ?? undefined,
      ogTitle: parsed.data.ogTitle ?? undefined,
      ogDesc: parsed.data.ogDesc ?? undefined,
      publishedAt,
      expiresAt: toDateU(parsed.data.expiresAt),
    };

    const created = await prisma.article.create({ data, select: { id: true } });
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка сохранения" };
  }
}

/** UPDATE */
export async function updateArticle(id: string, fd: FormData): Promise<ActionResult> {
  try {
    const json = Object.fromEntries(fd.entries());
    const parsed = articleInput.partial().safeParse(json);
    if (!parsed.success) {
      return { ok: false, error: "Некорректные поля", details: { fieldErrors: parsed.error.format() } };
    }

    let coverU: string | undefined = undefined;
    const raw = fd.get("coverFile");
    if (raw instanceof File && raw.size > 0) {
      const saved = await saveImageFile(raw);
      coverU = saved.src;
    }

    const data: Prisma.ArticleUpdateInput = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.slug !== undefined) data.slug = parsed.data.slug;
    if (parsed.data.type !== undefined) data.type = parsed.data.type as ArticleType;
    if (parsed.data.body !== undefined) data.body = parsed.data.body;

    if (parsed.data.excerpt !== undefined) data.excerpt = parsed.data.excerpt ?? undefined;
    if (coverU !== undefined) data.cover = coverU;
    if (parsed.data.seoTitle !== undefined) data.seoTitle = parsed.data.seoTitle ?? undefined;
    if (parsed.data.seoDesc !== undefined) data.seoDesc = parsed.data.seoDesc ?? undefined;
    if (parsed.data.ogTitle !== undefined) data.ogTitle = parsed.data.ogTitle ?? undefined;
    if (parsed.data.ogDesc !== undefined) data.ogDesc = parsed.data.ogDesc ?? undefined;

    if (parsed.data.publishedAt !== undefined) data.publishedAt = toDateU(parsed.data.publishedAt);
    if (parsed.data.expiresAt !== undefined) data.expiresAt = toDateU(parsed.data.expiresAt);

    await prisma.article.update({ where: { id }, data });
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка обновления" };
  }
}

/** DELETE */
export async function deleteArticle(id: string): Promise<ActionResult> {
  try {
    await prisma.article.delete({ where: { id } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ошибка удаления" };
  }
}
