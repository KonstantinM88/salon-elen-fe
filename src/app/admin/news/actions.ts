"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { articleInput } from "@/lib/validators";
import { ArticleType } from "@prisma/client"; // ← ВАЖНО: импорт enum

// утилита: строку из формы -> enum
function toArticleType(v: unknown): ArticleType {
  return v === "PROMO" ? ArticleType.PROMO : ArticleType.ARTICLE;
}

export async function createArticle(form: FormData) {
  const p = Object.fromEntries(form.entries());

  // валидация (получим строки)
  const parsed = articleInput.safeParse({
    type: (p.type as string) || "ARTICLE",
    title: p.title as string,
    slug: p.slug as string,
    excerpt: (p.excerpt as string) || undefined,
    body: p.body as string,
    cover: (p.cover as string) || undefined,
    publishedAt: p.publishedAt ? new Date(p.publishedAt as string).toISOString() : undefined,
    expiresAt: p.expiresAt ? new Date(p.expiresAt as string).toISOString() : undefined,
    seoTitle: (p.seoTitle as string) || undefined,
    seoDesc: (p.seoDesc as string) || undefined,
    ogTitle: (p.ogTitle as string) || undefined,
    ogDesc: (p.ogDesc as string) || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Validation error", details: parsed.error.flatten() };

  // приводим type к enum, даты к Date | null, пустые строки к undefined/null
  await prisma.article.create({
    data: {
      type: toArticleType(parsed.data.type), // ← enum
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt || undefined,
      body: parsed.data.body,
      cover: parsed.data.cover || undefined,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDesc: parsed.data.seoDesc || undefined,
      ogTitle: parsed.data.ogTitle || undefined,
      ogDesc: parsed.data.ogDesc || undefined,
    },
  });

  revalidatePath("/admin/news");
  return { ok: true };
}

export async function updateArticle(id: string, form: FormData) {
  const p = Object.fromEntries(form.entries());

  // можно без полной валидации — мягко приводим поля
  await prisma.article.update({
    where: { id },
    data: {
      type: toArticleType(p.type), // ← enum
      title: (p.title as string) || undefined,
      slug: (p.slug as string) || undefined,
      excerpt: (p.excerpt as string) || undefined,
      body: (p.body as string) || undefined,
      cover: (p.cover as string) || undefined,
      publishedAt: p.publishedAt ? new Date(p.publishedAt as string) : null,
      expiresAt: p.expiresAt ? new Date(p.expiresAt as string) : null,
      seoTitle: (p.seoTitle as string) || undefined,
      seoDesc: (p.seoDesc as string) || undefined,
      ogTitle: (p.ogTitle as string) || undefined,
      ogDesc: (p.ogDesc as string) || undefined,
    },
  });

  revalidatePath("/admin/news");
  return { ok: true };
}

export async function deleteArticle(id: string) {
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/news");
  return { ok: true };
}
