// src/app/admin/news/[id]/translations/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type SaveTranslationInput = {
  articleId: string;
  locale: string;
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
};

type ActionResult = 
  | { ok: true }
  | { ok: false; error: string };

export async function saveArticleTranslation(
  input: SaveTranslationInput
): Promise<ActionResult> {
  const {
    articleId,
    locale,
    title,
    excerpt,
    content,
    seoTitle,
    seoDescription,
    ogTitle,
    ogDescription,
  } = input;

  if (!title.trim()) {
    return { ok: false, error: "Заголовок обязателен" };
  }

  try {
    await prisma.articleTranslation.upsert({
      where: {
        articleId_locale: {
          articleId,
          locale,
        },
      },
      update: {
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim() || null,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        ogTitle: ogTitle.trim() || null,
        ogDescription: ogDescription.trim() || null,
      },
      create: {
        articleId,
        locale,
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim() || null,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        ogTitle: ogTitle.trim() || null,
        ogDescription: ogDescription.trim() || null,
      },
    });

    revalidatePath(`/admin/news/${articleId}/translations`);
    revalidatePath("/news");
    
    return { ok: true };
  } catch (error) {
    console.error("Error saving translation:", error);
    return { ok: false, error: "Не удалось сохранить перевод" };
  }
}

export async function deleteArticleTranslation(
  translationId: string
): Promise<ActionResult> {
  try {
    const translation = await prisma.articleTranslation.delete({
      where: { id: translationId },
    });

    revalidatePath(`/admin/news/${translation.articleId}/translations`);
    revalidatePath("/news");

    return { ok: true };
  } catch (error) {
    console.error("Error deleting translation:", error);
    return { ok: false, error: "Не удалось удалить перевод" };
  }
}
