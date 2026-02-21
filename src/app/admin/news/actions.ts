// src/app/admin/news/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { saveImageFile, saveVideoFile } from "@/lib/upload";
import { ArticleType, Prisma, VideoType } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSeoLocale, type SeoLocale } from "@/lib/seo-locale";

/* =========================
 * ТИПЫ
 * =======================*/

export type FieldErrors = Record<string, string[]>;
export type ActionOk = { ok: true; id?: string };
export type ActionFail = {
  ok: false;
  error: string;
  details?: { fieldErrors?: FieldErrors };
};
export type ActionResult = ActionOk | ActionFail;

type NewsActionCopy = {
  titleRequired: string;
  slugRequired: string;
  slugInvalid: string;
  bodyRequired: string;
  invalidFields: string;
  imageSaveFailed: string;
  videoSaveFailed: string;
  duplicateSlug: string;
  slugBusy: string;
  saveFailed: string;
  idRequired: string;
  deleteFailed: string;
  articleNotFound: string;
  pinToggleFailed: string;
};

const NEWS_ACTION_COPY: Record<SeoLocale, NewsActionCopy> = {
  de: {
    titleRequired: "Titel angeben",
    slugRequired: "Slug angeben",
    slugInvalid: "Nur Kleinbuchstaben (latein), Ziffern und Bindestriche",
    bodyRequired: "Text ist erforderlich",
    invalidFields: "Ungueltige Formularfelder",
    imageSaveFailed: "Bild konnte nicht gespeichert werden",
    videoSaveFailed: "Video konnte nicht gespeichert werden",
    duplicateSlug: "Ein Beitrag mit diesem Slug existiert bereits",
    slugBusy: "Slug ist bereits belegt",
    saveFailed: "Eintrag konnte nicht gespeichert werden",
    idRequired: "ID fehlt",
    deleteFailed: "Eintrag konnte nicht geloescht werden",
    articleNotFound: "Artikel nicht gefunden",
    pinToggleFailed: "Anheften konnte nicht geaendert werden",
  },
  ru: {
    titleRequired: "Укажите заголовок",
    slugRequired: "Укажите slug",
    slugInvalid: "Только строчные латинские буквы, цифры и дефисы",
    bodyRequired: "Текст обязателен",
    invalidFields: "Некорректные поля формы",
    imageSaveFailed: "Не удалось сохранить изображение",
    videoSaveFailed: "Не удалось сохранить видео",
    duplicateSlug: "Публикация с таким slug уже существует",
    slugBusy: "Slug уже занят",
    saveFailed: "Не удалось сохранить запись",
    idRequired: "Не указан id",
    deleteFailed: "Не удалось удалить запись",
    articleNotFound: "Статья не найдена",
    pinToggleFailed: "Не удалось изменить закрепление",
  },
  en: {
    titleRequired: "Enter title",
    slugRequired: "Enter slug",
    slugInvalid: "Only lowercase latin letters, numbers, and hyphens",
    bodyRequired: "Text is required",
    invalidFields: "Invalid form fields",
    imageSaveFailed: "Failed to save image",
    videoSaveFailed: "Failed to save video",
    duplicateSlug: "A publication with this slug already exists",
    slugBusy: "Slug is already taken",
    saveFailed: "Failed to save record",
    idRequired: "ID is required",
    deleteFailed: "Failed to delete record",
    articleNotFound: "Article not found",
    pinToggleFailed: "Failed to change pin state",
  },
};

function localeFromFormData(fd: FormData): SeoLocale {
  const raw = fd.get("locale");
  return isSeoLocale(raw) ? raw : "de";
}

/* =========================
 * PRISMA TYPE GUARD
 * =======================*/

function isKnownPrismaError(
  e: unknown,
  code?: string,
): e is Prisma.PrismaClientKnownRequestError {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    (code ? e.code === code : true)
  );
}

/* =========================
 * ВАЛИДАЦИЯ (Zod)
 * =======================*/

function buildArticleSchema(t: NewsActionCopy) {
  return z.object({
    type: z
      .nativeEnum(ArticleType)
      .optional()
      .transform((v) => v ?? ArticleType.ARTICLE),

    title: z.string().min(1, t.titleRequired),
    slug: z
      .string()
      .min(1, t.slugRequired)
      .regex(/^[a-z0-9-]+$/, t.slugInvalid),
    excerpt: z.string().optional(),
    body: z.string().min(1, t.bodyRequired),

    publishedAt: z.string().optional(),
    expiresAt: z.string().optional(),

    // SEO
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),

    // Закрепление
    isPinned: z.string().optional().transform((v) => v === "on" || v === "true"),
    sortOrder: z
      .string()
      .optional()
      .transform((v) => {
        const n = parseInt(v ?? "0", 10);
        return Number.isNaN(n) ? 0 : n;
      }),

    // Видео (URL для YouTube/Vimeo)
    videoUrl: z.string().optional(),
    videoType: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z.nativeEnum(VideoType).optional(),
    ),
  });
}

/* =========================
 * ПАРСИНГ ДАТ
 * =======================*/

function toDates(input: { publishedAt?: string; expiresAt?: string }) {
  const pub = (input.publishedAt ?? "").trim();
  const exp = (input.expiresAt ?? "").trim();
  return {
    publishedAt: pub !== "" ? new Date(pub + ":00Z") : null,
    expiresAt: exp !== "" ? new Date(exp + ":00Z") : null,
  };
}

/* =========================
 * ПОДГОТОВКА ДАННЫХ
 * =======================*/

type PreparedData = {
  ok: true;
  data: z.infer<ReturnType<typeof buildArticleSchema>>;
  publishedAt: Date | null;
  expiresAt: Date | null;
  coverSrc?: string | null;
  ogImageSrc?: string | null;
  videoSrc?: string | null;
};

async function prepareData(
  fd: FormData,
  locale: SeoLocale,
): Promise<PreparedData | ActionFail> {
  const t = NEWS_ACTION_COPY[locale];
  const raw = {
    type: fd.get("type")?.toString(),
    title: fd.get("title")?.toString() ?? "",
    slug: fd.get("slug")?.toString() ?? "",
    excerpt: fd.get("excerpt")?.toString() ?? "",
    body: fd.get("body")?.toString() ?? "",

    publishedAt: fd.get("publishedAt")?.toString(),
    expiresAt: fd.get("expiresAt")?.toString(),

    seoTitle: fd.get("seoTitle")?.toString() ?? "",
    seoDescription: fd.get("seoDescription")?.toString() ?? "",
    ogTitle: fd.get("ogTitle")?.toString() ?? "",
    ogDescription: fd.get("ogDescription")?.toString() ?? "",

    isPinned: fd.get("isPinned")?.toString() ?? "",
    sortOrder: fd.get("sortOrder")?.toString() ?? "0",

    videoUrl: fd.get("videoUrl")?.toString() ?? "",
    videoType: fd.get("videoType")?.toString() ?? "",
  };

  const parsed = buildArticleSchema(t).safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { ok: false, error: t.invalidFields, details: { fieldErrors } };
  }

  const { publishedAt, expiresAt } = toDates(parsed.data);

  // ── Обложка ──
  let coverSrc: string | null | undefined = undefined;
  let ogImageSrc: string | null | undefined = undefined;
  const coverCandidate = fd.get("coverFile") ?? fd.get("cover");

  if (coverCandidate instanceof File && coverCandidate.size > 0) {
    try {
      const saved = await saveImageFile(coverCandidate, {
        dir: "uploads",
        generateOg: true,
      });
      coverSrc = saved.src;
      ogImageSrc = saved.ogSrc ?? null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.imageSaveFailed;
      return { ok: false, error: msg };
    }
  } else if (coverCandidate instanceof File) {
    coverSrc = undefined; // пустой File — не трогаем
  } else if (typeof coverCandidate === "string" && coverCandidate === "") {
    coverSrc = null; // очистить
  }

  // ── Видео ──
  let videoSrc: string | null | undefined = undefined;
  const videoCandidate = fd.get("videoFile");

  if (videoCandidate instanceof File && videoCandidate.size > 0) {
    try {
      const saved = await saveVideoFile(videoCandidate, { dir: "uploads" });
      videoSrc = saved.src;
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.videoSaveFailed;
      return { ok: false, error: msg };
    }
  }

  return {
    ok: true,
    data: parsed.data,
    publishedAt,
    expiresAt,
    coverSrc,
    ogImageSrc,
    videoSrc,
  };
}

/* =========================
 * СОЗДАНИЕ
 * =======================*/

export async function createArticle(fd: FormData): Promise<ActionResult> {
  const locale = localeFromFormData(fd);
  const t = NEWS_ACTION_COPY[locale];
  const prep = await prepareData(fd, locale);
  if (!prep.ok) return prep;

  try {
    const d = prep.data;
    const publishedAtFinal = prep.publishedAt ?? new Date();

    // Определяем videoUrl — либо загруженное видео, либо внешняя ссылка
    const finalVideoUrl = prep.videoSrc || d.videoUrl || undefined;
    const finalVideoType: VideoType | undefined = prep.videoSrc
      ? VideoType.UPLOAD
      : d.videoType || undefined;

    const created = await prisma.article.create({
      data: {
        type: d.type,
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt || undefined,
        content: d.body,
        cover: prep.coverSrc ?? undefined,
        publishedAt: publishedAtFinal,
        expiresAt: prep.expiresAt ?? undefined,
        // SEO
        seoTitle: d.seoTitle || undefined,
        seoDescription: d.seoDescription || undefined,
        ogTitle: d.ogTitle || undefined,
        ogDescription: d.ogDescription || undefined,
        ogImage: prep.ogImageSrc ?? undefined,
        // Закрепление
        isPinned: d.isPinned,
        sortOrder: d.sortOrder,
        // Видео
        videoUrl: finalVideoUrl,
        videoType: finalVideoType,
      },
      select: { id: true },
    });

    return { ok: true, id: created.id };
  } catch (e: unknown) {
    if (isKnownPrismaError(e, "P2002")) {
      return {
        ok: false,
        error: t.duplicateSlug,
        details: { fieldErrors: { slug: [t.slugBusy] } },
      };
    }
    console.error("Create article error:", e);
    return { ok: false, error: t.saveFailed };
  }
}

export async function createArticleAndRedirect(fd: FormData): Promise<void> {
  const res = await createArticle(fd);
  if (res.ok) {
    revalidatePath("/admin/news");
    redirect("/admin/news");
  }
  throw new Error((res as ActionFail).error || NEWS_ACTION_COPY.de.saveFailed);
}

/* =========================
 * ОБНОВЛЕНИЕ
 * =======================*/

export async function updateArticle(
  id: string,
  fd: FormData,
): Promise<ActionResult> {
  const locale = localeFromFormData(fd);
  const t = NEWS_ACTION_COPY[locale];
  const prep = await prepareData(fd, locale);
  if (!prep.ok) return prep;

  try {
    const d = prep.data;

    const finalVideoUrl = prep.videoSrc || d.videoUrl || undefined;
    const finalVideoType: VideoType | undefined = prep.videoSrc
      ? VideoType.UPLOAD
      : d.videoType || undefined;

    await prisma.article.update({
      where: { id },
      data: {
        type: d.type,
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt || undefined,
        content: d.body,
        ...(prep.coverSrc === undefined ? {} : { cover: prep.coverSrc ?? null }),
        publishedAt:
          prep.publishedAt === null ? null : prep.publishedAt ?? undefined,
        expiresAt:
          prep.expiresAt === null ? null : prep.expiresAt ?? undefined,
        // SEO
        seoTitle: d.seoTitle || null,
        seoDescription: d.seoDescription || null,
        ogTitle: d.ogTitle || null,
        ogDescription: d.ogDescription || null,
        ...(prep.ogImageSrc === undefined ? {} : { ogImage: prep.ogImageSrc }),
        // Закрепление
        isPinned: d.isPinned,
        sortOrder: d.sortOrder,
        // Видео
        ...(finalVideoUrl !== undefined
          ? { videoUrl: finalVideoUrl || null, videoType: finalVideoType ?? null }
          : {}),
      },
      select: { id: true },
    });

    return { ok: true, id };
  } catch (e: unknown) {
    if (isKnownPrismaError(e, "P2002")) {
      return {
        ok: false,
        error: t.duplicateSlug,
        details: { fieldErrors: { slug: [t.slugBusy] } },
      };
    }
    console.error("Update article error:", e);
    return { ok: false, error: t.saveFailed };
  }
}

export async function updateArticleAndRedirect(
  id: string,
  fd: FormData,
): Promise<void> {
  const res = await updateArticle(id, fd);
  if (res.ok) {
    revalidatePath("/admin/news");
    redirect("/admin/news");
  }
  throw new Error((res as ActionFail).error || NEWS_ACTION_COPY.de.saveFailed);
}

/* =========================
 * УДАЛЕНИЕ
 * =======================*/

export async function deleteArticle(fd: FormData): Promise<ActionResult> {
  const locale = localeFromFormData(fd);
  const t = NEWS_ACTION_COPY[locale];
  const id = fd.get("id")?.toString();
  if (!id) return { ok: false, error: t.idRequired };

  try {
    await prisma.article.delete({ where: { id } });
    return { ok: true, id };
  } catch (e: unknown) {
    console.error("Delete article error:", e);
    return { ok: false, error: t.deleteFailed };
  }
}

export async function deleteArticleAndRefresh(fd: FormData): Promise<void> {
  const res = await deleteArticle(fd);
  if (!res.ok) console.warn("deleteArticle fail:", res.error);
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

/* =========================
 * TOGGLE PIN (для быстрого закрепления из списка)
 * =======================*/

export async function togglePinArticle(id: string): Promise<ActionResult> {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
      select: { isPinned: true },
    });
    if (!article) return { ok: false, error: NEWS_ACTION_COPY.de.articleNotFound };

    await prisma.article.update({
      where: { id },
      data: { isPinned: !article.isPinned },
    });

    revalidatePath("/admin/news");
    return { ok: true, id };
  } catch (e) {
    console.error("Toggle pin error:", e);
    return { ok: false, error: NEWS_ACTION_COPY.de.pinToggleFailed };
  }
}



//-----14.02.26 добавляем возможность загружать видео
// // src/app/admin/news/actions.ts
// "use server";

// import { prisma } from "@/lib/db";
// import { saveImageFile } from "@/lib/upload";
// import { ArticleType, Prisma } from "@prisma/client";
// import { z } from "zod";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

// /* =========================
//  * ВСПОМОГАТЕЛЬНЫЕ ТИПЫ
//  * =======================*/

// export type FieldErrors = Record<string, string[]>;

// export type ActionOk = { ok: true; id?: string };
// export type ActionFail = {
//   ok: false;
//   error: string;
//   details?: { fieldErrors?: FieldErrors };
// };
// export type ActionResult = ActionOk | ActionFail;

// /* =========================
//  * TYPE GUARD ДЛЯ ОШИБОК PRISMA
//  * =======================*/

// function isKnownPrismaError(
//   e: unknown,
//   code?: string
// ): e is Prisma.PrismaClientKnownRequestError {
//   return (
//     e instanceof Prisma.PrismaClientKnownRequestError &&
//     (code ? e.code === code : true)
//   );
// }

// /* =========================
//  * ВАЛИДАЦИЯ ПОЛЕЙ ФОРМЫ (Zod)
//  * =======================*/

// const ArticleSchema = z.object({
//   type: z
//     .nativeEnum(ArticleType)
//     .optional()
//     .transform((v) => v ?? ArticleType.ARTICLE),

//   title: z.string().min(1, "Укажите заголовок"),
//   slug: z
//     .string()
//     .min(1, "Укажите slug")
//     .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
//   excerpt: z.string().optional(),
//   body: z.string().min(1, "Текст обязателен"),

//   // значения из <input type="datetime-local">
//   publishedAt: z.string().optional(),
//   expiresAt: z.string().optional(),

//   // Эти поля можно оставить в форме, но в БД их нет — игнорируем
//   seoTitle: z.string().optional(),
//   seoDesc: z.string().optional(),
//   ogTitle: z.string().optional(),
//   ogDesc: z.string().optional(),
// });

// /* =========================
//  * ПАРСИНГ ДАТ ИЗ СТРОК ФОРМЫ
//  * =======================*/

// function toDates(input: { publishedAt?: string; expiresAt?: string }): {
//   publishedAt: Date | null;
//   expiresAt: Date | null;
// } {
//   const input_published = (input.publishedAt ?? "").trim();
//   const input_expires = (input.expiresAt ?? "").trim();

//   // Добавляем 'Z' чтобы интерпретировать как UTC (форма показывает UTC)
//   const publishedAt =
//     input_published !== "" ? new Date(input_published + ":00Z") : null;
//   const expiresAt = 
//     input_expires !== "" ? new Date(input_expires + ":00Z") : null;

//   return { publishedAt, expiresAt };
// }

// /* =========================
//  * ПОДГОТОВКА ДАННЫХ ИЗ FormData
//  * =======================*/

// async function prepareData(
//   fd: FormData
// ): Promise<
//   | {
//       ok: true;
//       data: z.infer<typeof ArticleSchema>;
//       publishedAt: Date | null;
//       expiresAt: Date | null;
//       coverSrc?: string | null; // undefined — не трогаем; null — очистить; string — обновить
//     }
//   | ActionFail
// > {
//   const raw = {
//     type: fd.get("type")?.toString(),
//     title: fd.get("title")?.toString() ?? "",
//     slug: fd.get("slug")?.toString() ?? "",
//     excerpt: fd.get("excerpt")?.toString() ?? "",
//     body: fd.get("body")?.toString() ?? "",

//     publishedAt: fd.get("publishedAt")?.toString(),
//     expiresAt: fd.get("expiresAt")?.toString(),

//     // SEO поля могут присутствовать в форме, но дальше не пишем их в БД
//     seoTitle: fd.get("seoTitle")?.toString() ?? "",
//     seoDesc: fd.get("seoDesc")?.toString() ?? "",
//     ogTitle: fd.get("ogTitle")?.toString() ?? "",
//     ogDesc: fd.get("ogDesc")?.toString() ?? "",
//   };

//   const parsed = ArticleSchema.safeParse(raw);
//   if (!parsed.success) {
//     const fieldErrors: FieldErrors = {};
//     for (const issue of parsed.error.issues) {
//       const key = issue.path.join(".") || "form";
//       (fieldErrors[key] ??= []).push(issue.message);
//     }
//     return {
//       ok: false,
//       error: "Некорректные поля формы",
//       details: { fieldErrors },
//     };
//   }

//   const { publishedAt, expiresAt } = toDates(parsed.data);

//   let coverSrc: string | null | undefined = undefined;
//   const coverCandidate = fd.get("coverFile") ?? fd.get("cover");
  
//   if (coverCandidate instanceof File) {
//     if (coverCandidate.size > 0) {
//       try {
//         const saved = await saveImageFile(coverCandidate, { dir: "uploads" });
//         coverSrc = saved.src;
//       } catch {
//         return { ok: false, error: "Не удалось сохранить изображение" };
//       }
//     } else {
//       coverSrc = undefined;
//     }
//   } else if (coverCandidate === null) {
//     coverSrc = undefined;
//   } else if (typeof coverCandidate === "string" && coverCandidate === "") {
//     coverSrc = null;
//   }

//   return {
//     ok: true,
//     data: parsed.data,
//     publishedAt,
//     expiresAt,
//     coverSrc,
//   };
// }

// /* =========================
//  * СОЗДАНИЕ
//  * =======================*/

// export async function createArticle(fd: FormData): Promise<ActionResult> {
//   const prep = await prepareData(fd);
//   if (!prep.ok) return prep;

//   try {
//     const publishedAtFinal = prep.publishedAt ?? new Date();

//     const created = await prisma.article.create({
//       data: {
//         type: prep.data.type,
//         title: prep.data.title,
//         slug: prep.data.slug,
//         excerpt: prep.data.excerpt || undefined,
//         content: prep.data.body,            // ← пишем в content
//         cover: prep.coverSrc ?? undefined,
//         publishedAt: publishedAtFinal,
//         expiresAt: prep.expiresAt ?? undefined,
//         // SEO-поля намеренно не пишем — их нет в схеме
//       },
//       select: { id: true },
//     });

//     return { ok: true, id: created.id };
//   } catch (e: unknown) {
//     if (isKnownPrismaError(e, "P2002")) {
//       return {
//         ok: false,
//         error: "Публикация с таким slug уже существует",
//         details: { fieldErrors: { slug: ["Slug уже занят"] } },
//       };
//     }
//     if (isKnownPrismaError(e)) {
//       console.error("Prisma error:", e.code, e.meta);
//     } else {
//       console.error("Unknown error:", e);
//     }
//     return { ok: false, error: "Не удалось сохранить запись" };
//   }
// }

// export async function createArticleAndRedirect(fd: FormData): Promise<void> {
//   const res = await createArticle(fd);
//   if (res.ok) {
//     revalidatePath("/admin/news");
//     redirect("/admin/news");
//   }
//   throw new Error(
//     (res as ActionFail).error || "Не удалось сохранить запись (unknown)"
//   );
// }

// /* =========================
//  * ОБНОВЛЕНИЕ
//  * =======================*/

// export async function updateArticle(
//   id: string,
//   fd: FormData
// ): Promise<ActionResult> {
//   const prep = await prepareData(fd);
//   if (!prep.ok) return prep;

//   try {
//     await prisma.article.update({
//       where: { id },
//       data: {
//         type: prep.data.type,
//         title: prep.data.title,
//         slug: prep.data.slug,
//         excerpt: prep.data.excerpt || undefined,
//         content: prep.data.body,            // ← пишем в content
//         ...(prep.coverSrc === undefined ? {} : { cover: prep.coverSrc ?? null }),
//         publishedAt:
//           prep.publishedAt === null ? null : prep.publishedAt ?? undefined,
//         expiresAt:
//           prep.expiresAt === null ? null : prep.expiresAt ?? undefined,
//         // SEO-поля намеренно не пишем
//       },
//       select: { id: true },
//     });

//     return { ok: true, id };
//   } catch (e: unknown) {
//     if (isKnownPrismaError(e, "P2002")) {
//       return {
//         ok: false,
//         error: "Публикация с таким slug уже существует",
//         details: { fieldErrors: { slug: ["Slug уже занят"] } },
//       };
//     }
//     if (isKnownPrismaError(e)) {
//       console.error("Prisma error:", e.code, e.meta);
//     } else {
//       console.error("Unknown error:", e);
//     }
//     return { ok: false, error: "Не удалось сохранить запись" };
//   }
// }

// export async function updateArticleAndRedirect(
//   id: string,
//   fd: FormData
// ): Promise<void> {
//   const res = await updateArticle(id, fd);
//   if (res.ok) {
//     revalidatePath("/admin/news");
//     redirect("/admin/news");
//   }
//   throw new Error(
//     (res as ActionFail).error || "Не удалось сохранить запись (unknown)"
//   );
// }

// /* =========================
//  * УДАЛЕНИЕ
//  * =======================*/

// export async function deleteArticle(fd: FormData): Promise<ActionResult> {
//   const id = fd.get("id")?.toString();
//   if (!id) return { ok: false, error: "Не указан id" };

//   try {
//     await prisma.article.delete({ where: { id } });
//     return { ok: true, id };
//   } catch (e: unknown) {
//     if (isKnownPrismaError(e)) {
//       console.error("Prisma error:", e.code, e.meta);
//     } else {
//       console.error("Unknown error:", e);
//     }
//     return { ok: false, error: "Не удалось удалить запись" };
//   }
// }

// export async function deleteArticleAndRefresh(fd: FormData): Promise<void> {
//   const res = await deleteArticle(fd);
//   if (!res.ok) {
//     console.warn("deleteArticle fail:", res.error);
//   }
//   revalidatePath("/admin/news");
//   redirect("/admin/news");
// }





//--------работал убираем логирование-------
// // src/app/admin/news/actions.ts
// "use server";

// import { prisma } from "@/lib/db";
// import { saveImageFile } from "@/lib/upload";
// import { ArticleType, Prisma } from "@prisma/client";
// import { z } from "zod";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

// /* =========================
//  * ВСПОМОГАТЕЛЬНЫЕ ТИПЫ
//  * =======================*/

// export type FieldErrors = Record<string, string[]>;

// export type ActionOk = { ok: true; id?: string };
// export type ActionFail = {
//   ok: false;
//   error: string;
//   details?: { fieldErrors?: FieldErrors };
// };
// export type ActionResult = ActionOk | ActionFail;

// /* =========================
//  * TYPE GUARD ДЛЯ ОШИБОК PRISMA
//  * =======================*/

// function isKnownPrismaError(
//   e: unknown,
//   code?: string
// ): e is Prisma.PrismaClientKnownRequestError {
//   return (
//     e instanceof Prisma.PrismaClientKnownRequestError &&
//     (code ? e.code === code : true)
//   );
// }

// /* =========================
//  * ВАЛИДАЦИЯ ПОЛЕЙ ФОРМЫ (Zod)
//  * =======================*/

// const ArticleSchema = z.object({
//   type: z
//     .nativeEnum(ArticleType)
//     .optional()
//     .transform((v) => v ?? ArticleType.ARTICLE),

//   title: z.string().min(1, "Укажите заголовок"),
//   slug: z
//     .string()
//     .min(1, "Укажите slug")
//     .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
//   excerpt: z.string().optional(),
//   body: z.string().min(1, "Текст обязателен"),

//   // значения из <input type="datetime-local">
//   publishedAt: z.string().optional(),
//   expiresAt: z.string().optional(),

//   // Эти поля можно оставить в форме, но в БД их нет — игнорируем
//   seoTitle: z.string().optional(),
//   seoDesc: z.string().optional(),
//   ogTitle: z.string().optional(),
//   ogDesc: z.string().optional(),
// });

// /* =========================
//  * ПАРСИНГ ДАТ ИЗ СТРОК ФОРМЫ
//  * =======================*/

// function toDates(input: { publishedAt?: string; expiresAt?: string }): {
//   publishedAt: Date | null;
//   expiresAt: Date | null;
// } {
//   const input_published = (input.publishedAt ?? "").trim();
//   const input_expires = (input.expiresAt ?? "").trim();

//   const publishedAt =
//     input_published !== "" ? new Date(input_published) : null;
//   const expiresAt = input_expires !== "" ? new Date(input_expires) : null;

//   return { publishedAt, expiresAt };
// }

// /* =========================
//  * ПОДГОТОВКА ДАННЫХ ИЗ FormData
//  * =======================*/

// async function prepareData(
//   fd: FormData
// ): Promise<
//   | {
//       ok: true;
//       data: z.infer<typeof ArticleSchema>;
//       publishedAt: Date | null;
//       expiresAt: Date | null;
//       coverSrc?: string | null; // undefined — не трогаем; null — очистить; string — обновить
//     }
//   | ActionFail
// > {
//   const raw = {
//     type: fd.get("type")?.toString(),
//     title: fd.get("title")?.toString() ?? "",
//     slug: fd.get("slug")?.toString() ?? "",
//     excerpt: fd.get("excerpt")?.toString() ?? "",
//     body: fd.get("body")?.toString() ?? "",

//     publishedAt: fd.get("publishedAt")?.toString(),
//     expiresAt: fd.get("expiresAt")?.toString(),

//     // SEO поля могут присутствовать в форме, но дальше не пишем их в БД
//     seoTitle: fd.get("seoTitle")?.toString() ?? "",
//     seoDesc: fd.get("seoDesc")?.toString() ?? "",
//     ogTitle: fd.get("ogTitle")?.toString() ?? "",
//     ogDesc: fd.get("ogDesc")?.toString() ?? "",
//   };

//   const parsed = ArticleSchema.safeParse(raw);
//   if (!parsed.success) {
//     const fieldErrors: FieldErrors = {};
//     for (const issue of parsed.error.issues) {
//       const key = issue.path.join(".") || "form";
//       (fieldErrors[key] ??= []).push(issue.message);
//     }
//     return {
//       ok: false,
//       error: "Некорректные поля формы",
//       details: { fieldErrors },
//     };
//   }

//   const { publishedAt, expiresAt } = toDates(parsed.data);

//   let coverSrc: string | null | undefined = undefined;
//   const coverCandidate = fd.get("coverFile") ?? fd.get("cover");
  
//   // Логирование для отладки
//   console.log("[prepareData] coverCandidate type:", typeof coverCandidate);
//   console.log("[prepareData] coverCandidate:", coverCandidate instanceof File ? `File: ${coverCandidate.name}, size: ${coverCandidate.size}` : coverCandidate);
  
//   if (coverCandidate instanceof File) {
//     if (coverCandidate.size > 0) {
//       try {
//         console.log("[prepareData] Saving image file...");
//         const saved = await saveImageFile(coverCandidate, { dir: "uploads" });
//         coverSrc = saved.src;
//         console.log("[prepareData] Image saved:", coverSrc);
//       } catch (err) {
//         console.error("[prepareData] Error saving image:", err);
//         return { ok: false, error: "Не удалось сохранить изображение" };
//       }
//     } else {
//       console.log("[prepareData] File size is 0, skipping");
//       coverSrc = undefined;
//     }
//   } else if (coverCandidate === null) {
//     coverSrc = undefined;
//   } else if (typeof coverCandidate === "string" && coverCandidate === "") {
//     coverSrc = null;
//   }

//   return {
//     ok: true,
//     data: parsed.data,
//     publishedAt,
//     expiresAt,
//     coverSrc,
//   };
// }

// /* =========================
//  * СОЗДАНИЕ
//  * =======================*/

// export async function createArticle(fd: FormData): Promise<ActionResult> {
//   const prep = await prepareData(fd);
//   if (!prep.ok) return prep;

//   try {
//     const publishedAtFinal = prep.publishedAt ?? new Date();

//     const created = await prisma.article.create({
//       data: {
//         type: prep.data.type,
//         title: prep.data.title,
//         slug: prep.data.slug,
//         excerpt: prep.data.excerpt || undefined,
//         content: prep.data.body,            // ← пишем в content
//         cover: prep.coverSrc ?? undefined,
//         publishedAt: publishedAtFinal,
//         expiresAt: prep.expiresAt ?? undefined,
//         // SEO-поля намеренно не пишем — их нет в схеме
//       },
//       select: { id: true },
//     });

//     return { ok: true, id: created.id };
//   } catch (e: unknown) {
//     if (isKnownPrismaError(e, "P2002")) {
//       return {
//         ok: false,
//         error: "Публикация с таким slug уже существует",
//         details: { fieldErrors: { slug: ["Slug уже занят"] } },
//       };
//     }
//     if (isKnownPrismaError(e)) {
//       console.error("Prisma error:", e.code, e.meta);
//     } else {
//       console.error("Unknown error:", e);
//     }
//     return { ok: false, error: "Не удалось сохранить запись" };
//   }
// }

// export async function createArticleAndRedirect(fd: FormData): Promise<void> {
//   const res = await createArticle(fd);
//   if (res.ok) {
//     revalidatePath("/admin/news");
//     redirect("/admin/news");
//   }
//   throw new Error(
//     (res as ActionFail).error || "Не удалось сохранить запись (unknown)"
//   );
// }

// /* =========================
//  * ОБНОВЛЕНИЕ
//  * =======================*/

// export async function updateArticle(
//   id: string,
//   fd: FormData
// ): Promise<ActionResult> {
//   const prep = await prepareData(fd);
//   if (!prep.ok) return prep;

//   try {
//     await prisma.article.update({
//       where: { id },
//       data: {
//         type: prep.data.type,
//         title: prep.data.title,
//         slug: prep.data.slug,
//         excerpt: prep.data.excerpt || undefined,
//         content: prep.data.body,            // ← пишем в content
//         ...(prep.coverSrc === undefined ? {} : { cover: prep.coverSrc ?? null }),
//         publishedAt:
//           prep.publishedAt === null ? null : prep.publishedAt ?? undefined,
//         expiresAt:
//           prep.expiresAt === null ? null : prep.expiresAt ?? undefined,
//         // SEO-поля намеренно не пишем
//       },
//       select: { id: true },
//     });

//     return { ok: true, id };
//   } catch (e: unknown) {
//     if (isKnownPrismaError(e, "P2002")) {
//       return {
//         ok: false,
//         error: "Публикация с таким slug уже существует",
//         details: { fieldErrors: { slug: ["Slug уже занят"] } },
//       };
//     }
//     if (isKnownPrismaError(e)) {
//       console.error("Prisma error:", e.code, e.meta);
//     } else {
//       console.error("Unknown error:", e);
//     }
//     return { ok: false, error: "Не удалось сохранить запись" };
//   }
// }

// export async function updateArticleAndRedirect(
//   id: string,
//   fd: FormData
// ): Promise<void> {
//   const res = await updateArticle(id, fd);
//   if (res.ok) {
//     revalidatePath("/admin/news");
//     redirect("/admin/news");
//   }
//   throw new Error(
//     (res as ActionFail).error || "Не удалось сохранить запись (unknown)"
//   );
// }

// /* =========================
//  * УДАЛЕНИЕ
//  * =======================*/

// export async function deleteArticle(fd: FormData): Promise<ActionResult> {
//   const id = fd.get("id")?.toString();
//   if (!id) return { ok: false, error: "Не указан id" };

//   try {
//     await prisma.article.delete({ where: { id } });
//     return { ok: true, id };
//   } catch (e: unknown) {
//     if (isKnownPrismaError(e)) {
//       console.error("Prisma error:", e.code, e.meta);
//     } else {
//       console.error("Unknown error:", e);
//     }
//     return { ok: false, error: "Не удалось удалить запись" };
//   }
// }

// export async function deleteArticleAndRefresh(fd: FormData): Promise<void> {
//   const res = await deleteArticle(fd);
//   if (!res.ok) {
//     console.warn("deleteArticle fail:", res.error);
//   }
//   revalidatePath("/admin/news");
//   redirect("/admin/news");
// }




//------работало но криво редактировало новости из админки, пока закоментировал-------
// "use server";

// import { prisma } from "@/lib/db";
// import { saveImageFile } from "@/lib/upload";
// import { ArticleType, Prisma } from "@prisma/client";
// import { z } from "zod";
// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

// /* =========================
//  * ВСПОМОГАТЕЛЬНЫЕ ТИПЫ
//  * =======================*/

// export type FieldErrors = Record<string, string[]>;

// export type ActionOk = { ok: true; id?: string };
// export type ActionFail = {
//   ok: false;
//   error: string;
//   details?: { fieldErrors?: FieldErrors };
// };
// export type ActionResult = ActionOk | ActionFail;

// /* =========================
//  * TYPE GUARD ДЛЯ ОШИБОК PRISMA
//  * =======================*/

// function isKnownPrismaError(
//   e: unknown,
//   code?: string
// ): e is Prisma.PrismaClientKnownRequestError {
//   return (
//     e instanceof Prisma.PrismaClientKnownRequestError &&
//     (code ? e.code === code : true)
//   );
// }

// /* =========================
//  * ВАЛИДАЦИЯ ПОЛЕЙ ФОРМЫ (Zod)
//  * =======================*/

// const ArticleSchema = z.object({
//   type: z
//     .nativeEnum(ArticleType)
//     .optional()
//     .transform((v) => v ?? ArticleType.ARTICLE),

//   title: z.string().min(1, "Укажите заголовок"),
//   slug: z
//     .string()
//     .min(1, "Укажите slug")
//     .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
//   excerpt: z.string().optional(),
//   body: z.string().min(1, "Текст обязателен"),

//   // значения из <input type="datetime-local">
//   publishedAt: z.string().optional(),
//   expiresAt: z.string().optional(),

//   // Эти поля можно оставить в форме, но в БД их нет — игнорируем
//   seoTitle: z.string().optional(),
//   seoDesc: z.string().optional(),
//   ogTitle: z.string().optional(),
//   ogDesc: z.string().optional(),
// });

// /* =========================
//  * ПАРСИНГ ДАТ ИЗ СТРОК ФОРМЫ
//  * =======================*/

// function toDates(input: { publishedAt?: string; expiresAt?: string }): {
//   publishedAt: Date | null;
//   expiresAt: Date | null;
// } {
//   const input_published = (input.publishedAt ?? "").trim();
//   const input_expires = (input.expiresAt ?? "").trim();

//   const publishedAt =
//     input_published !== "" ? new Date(input_published) : null;
//   const expiresAt = input_expires !== "" ? new Date(input_expires) : null;

//   return { publishedAt, expiresAt };
// }

// /* =========================
//  * ПОДГОТОВКА ДАННЫХ ИЗ FormData
//  * =======================*/

// async function prepareData(
//   fd: FormData
// ): Promise<
//   | {
//       ok: true;
//       data: z.infer<typeof ArticleSchema>;
//       publishedAt: Date | null;
//       expiresAt: Date | null;
//       coverSrc?: string | null; // undefined — не трогаем; null — очистить; string — обновить
//     }
//   | ActionFail
// > {
//   const raw = {
//     type: fd.get("type")?.toString(),
//     title: fd.get("title")?.toString() ?? "",
//     slug: fd.get("slug")?.toString() ?? "",
//     excerpt: fd.get("excerpt")?.toString() ?? "",
//     body: fd.get("body")?.toString() ?? "",

//     publishedAt: fd.get("publishedAt")?.toString(),
//     expiresAt: fd.get("expiresAt")?.toString(),

//     // SEO поля могут присутствовать в форме, но дальше не пишем их в БД
//     seoTitle: fd.get("seoTitle")?.toString() ?? "",
//     seoDesc: fd.get("seoDesc")?.toString() ?? "",
//     ogTitle: fd.get("ogTitle")?.toString() ?? "",
//     ogDesc: fd.get("ogDesc")?.toString() ?? "",
//   };

//   const parsed = ArticleSchema.safeParse(raw);
//   if (!parsed.success) {
//     const fieldErrors: FieldErrors = {};
//     for (const issue of parsed.error.issues) {
//       const key = issue.path.join(".") || "form";
//       (fieldErrors[key] ??= []).push(issue.message);
//     }
//     return {
//       ok: false,
//       error: "Некорректные поля формы",
//       details: { fieldErrors },
//     };
//   }

//   const { publishedAt, expiresAt } = toDates(parsed.data);

//   let coverSrc: string | null | undefined = undefined;
//   const coverCandidate = fd.get("coverFile") ?? fd.get("cover");
//   if (coverCandidate instanceof File) {
//     if (coverCandidate.size > 0) {
//       try {
//         const saved = await saveImageFile(coverCandidate, { dir: "uploads" });
//         coverSrc = saved.src;
//       } catch {
//         return { ok: false, error: "Не удалось сохранить изображение" };
//       }
//     } else {
//       coverSrc = undefined;
//     }
//   } else if (coverCandidate === null) {
//     coverSrc = undefined;
//   } else if (typeof coverCandidate === "string" && coverCandidate === "") {
//     coverSrc = null;
//   }

//   return {
//     ok: true,
//     data: parsed.data,
//     publishedAt,
//     expiresAt,
//     coverSrc,
//   };
// }

// /* =========================
//  * СОЗДАНИЕ
//  * =======================*/

// export async function createArticle(fd: FormData): Promise<ActionResult> {
//   const prep = await prepareData(fd);
//   if (!prep.ok) return prep;

//   try {
//     const publishedAtFinal = prep.publishedAt ?? new Date();

//     const created = await prisma.article.create({
//       data: {
//         type: prep.data.type,
//         title: prep.data.title,
//         slug: prep.data.slug,
//         excerpt: prep.data.excerpt || undefined,
//         content: prep.data.body,            // ← пишем в content
//         cover: prep.coverSrc ?? undefined,
//         publishedAt: publishedAtFinal,
//         expiresAt: prep.expiresAt ?? undefined,
//         // SEO-поля намеренно не пишем — их нет в схеме
//       },
//       select: { id: true },
//     });

//     return { ok: true, id: created.id };
//   } catch (e: unknown) {
//     if (isKnownPrismaError(e, "P2002")) {
//       return {
//         ok: false,
//         error: "Публикация с таким slug уже существует",
//         details: { fieldErrors: { slug: ["Slug уже занят"] } },
//       };
//     }
//     if (isKnownPrismaError(e)) {
//       console.error("Prisma error:", e.code, e.meta);
//     } else {
//       console.error("Unknown error:", e);
//     }
//     return { ok: false, error: "Не удалось сохранить запись" };
//   }
// }

// export async function createArticleAndRedirect(fd: FormData): Promise<void> {
//   const res = await createArticle(fd);
//   if (res.ok) {
//     revalidatePath("/admin/news");
//     redirect("/admin/news");
//   }
//   throw new Error(
//     (res as ActionFail).error || "Не удалось сохранить запись (unknown)"
//   );
// }

// /* =========================
//  * ОБНОВЛЕНИЕ
//  * =======================*/

// export async function updateArticle(
//   id: string,
//   fd: FormData
// ): Promise<ActionResult> {
//   const prep = await prepareData(fd);
//   if (!prep.ok) return prep;

//   try {
//     await prisma.article.update({
//       where: { id },
//       data: {
//         type: prep.data.type,
//         title: prep.data.title,
//         slug: prep.data.slug,
//         excerpt: prep.data.excerpt || undefined,
//         content: prep.data.body,            // ← пишем в content
//         ...(prep.coverSrc === undefined ? {} : { cover: prep.coverSrc ?? null }),
//         publishedAt:
//           prep.publishedAt === null ? null : prep.publishedAt ?? undefined,
//         expiresAt:
//           prep.expiresAt === null ? null : prep.expiresAt ?? undefined,
//         // SEO-поля намеренно не пишем
//       },
//       select: { id: true },
//     });

//     return { ok: true, id };
//   } catch (e: unknown) {
//     if (isKnownPrismaError(e, "P2002")) {
//       return {
//         ok: false,
//         error: "Публикация с таким slug уже существует",
//         details: { fieldErrors: { slug: ["Slug уже занят"] } },
//       };
//     }
//     if (isKnownPrismaError(e)) {
//       console.error("Prisma error:", e.code, e.meta);
//     } else {
//       console.error("Unknown error:", e);
//     }
//     return { ok: false, error: "Не удалось сохранить запись" };
//   }
// }

// export async function updateArticleAndRedirect(
//   id: string,
//   fd: FormData
// ): Promise<void> {
//   const res = await updateArticle(id, fd);
//   if (res.ok) {
//     revalidatePath("/admin/news");
//     redirect("/admin/news");
//   }
//   throw new Error(
//     (res as ActionFail).error || "Не удалось сохранить запись (unknown)"
//   );
// }

// /* =========================
//  * УДАЛЕНИЕ
//  * =======================*/

// export async function deleteArticle(fd: FormData): Promise<ActionResult> {
//   const id = fd.get("id")?.toString();
//   if (!id) return { ok: false, error: "Не указан id" };

//   try {
//     await prisma.article.delete({ where: { id } });
//     return { ok: true, id };
//   } catch (e: unknown) {
//     if (isKnownPrismaError(e)) {
//       console.error("Prisma error:", e.code, e.meta);
//     } else {
//       console.error("Unknown error:", e);
//     }
//     return { ok: false, error: "Не удалось удалить запись" };
//   }
// }

// export async function deleteArticleAndRefresh(fd: FormData): Promise<void> {
//   const res = await deleteArticle(fd);
//   if (!res.ok) {
//     console.warn("deleteArticle fail:", res.error);
//   }
//   revalidatePath("/admin/news");
//   redirect("/admin/news");
// }
