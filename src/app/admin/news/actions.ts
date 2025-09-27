"use server";

import { prisma } from "@/lib/db";
import { articleInput } from "@/lib/validators";
import { saveImageFile } from "@/lib/upload";
import type { ArticleType } from "@prisma/client";

/** ----- типы ответа для форм ----- */
type FieldErrors = Record<string, string[]>;
type Fail = { ok: false; error: string; details?: { fieldErrors?: FieldErrors } };
type Ok = { ok: true; id: string };
export type Result = Ok | Fail;

/** безопасно достаём строку из FormData */
function fdString(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === "string" ? v : undefined;
}

/** строки → Date|null */
function toDates(d: { publishedAt?: string; expiresAt?: string }) {
  return {
    publishedAt: d.publishedAt ? new Date(d.publishedAt) : null,
    expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
  };
}

/** ---------------- CREATE ---------------- */
export async function createArticle(fd: FormData): Promise<Result> {
  try {
    const json = {
      title: fdString(fd, "title"),
      slug: fdString(fd, "slug"),
      type: fdString(fd, "type"),
      excerpt: fdString(fd, "excerpt"),
      body: fdString(fd, "body"),
      publishedAt: fdString(fd, "publishedAt"),
      expiresAt: fdString(fd, "expiresAt"),
      seoTitle: fdString(fd, "seoTitle"),
      seoDesc: fdString(fd, "seoDesc"),
      ogTitle: fdString(fd, "ogTitle"),
      ogDesc: fdString(fd, "ogDesc"),
    };

    const parsed = articleInput.omit({ cover: true }).safeParse(json);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Некорректные поля",
        details: { fieldErrors: parsed.error.format() as unknown as FieldErrors },
      };
    }

    let cover: string | undefined;
    const raw = fd.get("coverFile");
    if (raw instanceof File && raw.size > 0) {
      const saved = await saveImageFile(raw);
      cover = saved.src;
    }

    const { publishedAt, expiresAt } = toDates(parsed.data);

    const base = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      type: parsed.data.type as ArticleType,
      excerpt: parsed.data.excerpt,
      body: parsed.data.body,
      seoTitle: parsed.data.seoTitle,
      seoDesc: parsed.data.seoDesc,
      ogTitle: parsed.data.ogTitle,
      ogDesc: parsed.data.ogDesc,
    };

    const created = await prisma.article.create({
      data: { ...base, cover, publishedAt, expiresAt },
      select: { id: true },
    });

    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/** ---------------- UPDATE ---------------- */
export async function updateArticle(id: string, fd: FormData): Promise<Result> {
  try {
    const json = {
      title: fdString(fd, "title"),
      slug: fdString(fd, "slug"),
      type: fdString(fd, "type"),
      excerpt: fdString(fd, "excerpt"),
      body: fdString(fd, "body"),
      publishedAt: fdString(fd, "publishedAt"),
      expiresAt: fdString(fd, "expiresAt"),
      seoTitle: fdString(fd, "seoTitle"),
      seoDesc: fdString(fd, "seoDesc"),
      ogTitle: fdString(fd, "ogTitle"),
      ogDesc: fdString(fd, "ogDesc"),
    };

    const parsed = articleInput.omit({ cover: true }).partial().safeParse(json);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Некорректные поля",
        details: { fieldErrors: parsed.error.format() as unknown as FieldErrors },
      };
    }

    const data: Record<string, unknown> = {};

    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.slug !== undefined) data.slug = parsed.data.slug;
    if (parsed.data.type !== undefined) data.type = parsed.data.type as ArticleType;
    if (parsed.data.excerpt !== undefined) data.excerpt = parsed.data.excerpt;
    if (parsed.data.body !== undefined) data.body = parsed.data.body;
    if (parsed.data.seoTitle !== undefined) data.seoTitle = parsed.data.seoTitle;
    if (parsed.data.seoDesc !== undefined) data.seoDesc = parsed.data.seoDesc;
    if (parsed.data.ogTitle !== undefined) data.ogTitle = parsed.data.ogTitle;
    if (parsed.data.ogDesc !== undefined) data.ogDesc = parsed.data.ogDesc;

    if (parsed.data.publishedAt !== undefined) {
      data.publishedAt = parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null;
    }
    if (parsed.data.expiresAt !== undefined) {
      data.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
    }

    const raw = fd.get("coverFile");
    if (raw instanceof File && raw.size > 0) {
      const saved = await saveImageFile(raw);
      data.cover = saved.src;
    }

    const updated = await prisma.article.update({
      where: { id },
      data,
      select: { id: true },
    });

    return { ok: true, id: updated.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/** ---------------- DELETE ---------------- */
export async function deleteArticle(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.article.delete({ where: { id } });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
