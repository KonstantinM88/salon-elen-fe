// src/app/admin/news/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { saveImageFile } from "@/lib/upload";
import { ArticleType, Prisma } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/* =========================
 * ВСПОМОГАТЕЛЬНЫЕ ТИПЫ
 * =======================*/

export type FieldErrors = Record<string, string[]>;

export type ActionOk = { ok: true; id?: string };
export type ActionFail = {
  ok: false;
  error: string;
  details?: { fieldErrors?: FieldErrors };
};
export type ActionResult = ActionOk | ActionFail;

/* =========================
 * TYPE GUARD ДЛЯ ОШИБОК PRISMA
 * =======================*/

function isKnownPrismaError(
  e: unknown,
  code?: string
): e is Prisma.PrismaClientKnownRequestError {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    (code ? e.code === code : true)
  );
}

/* =========================
 * ВАЛИДАЦИЯ ПОЛЕЙ ФОРМЫ (Zod)
 * =======================*/

const ArticleSchema = z.object({
  type: z
    .nativeEnum(ArticleType)
    .optional()
    .transform((v) => v ?? ArticleType.ARTICLE),

  title: z.string().min(1, "Укажите заголовок"),
  slug: z
    .string()
    .min(1, "Укажите slug")
    .regex(/^[a-z0-9-]+$/, "Только строчные латинские буквы, цифры и дефисы"),
  excerpt: z.string().optional(),
  body: z.string().min(1, "Текст обязателен"),

  // значения из <input type="datetime-local">
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),

  // Эти поля можно оставить в форме, но в БД их нет — игнорируем
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDesc: z.string().optional(),
});

/* =========================
 * ПАРСИНГ ДАТ ИЗ СТРОК ФОРМЫ
 * =======================*/

function toDates(input: { publishedAt?: string; expiresAt?: string }): {
  publishedAt: Date | null;
  expiresAt: Date | null;
} {
  const input_published = (input.publishedAt ?? "").trim();
  const input_expires = (input.expiresAt ?? "").trim();

  // Добавляем 'Z' чтобы интерпретировать как UTC (форма показывает UTC)
  const publishedAt =
    input_published !== "" ? new Date(input_published + ":00Z") : null;
  const expiresAt = 
    input_expires !== "" ? new Date(input_expires + ":00Z") : null;

  return { publishedAt, expiresAt };
}

/* =========================
 * ПОДГОТОВКА ДАННЫХ ИЗ FormData
 * =======================*/

async function prepareData(
  fd: FormData
): Promise<
  | {
      ok: true;
      data: z.infer<typeof ArticleSchema>;
      publishedAt: Date | null;
      expiresAt: Date | null;
      coverSrc?: string | null; // undefined — не трогаем; null — очистить; string — обновить
    }
  | ActionFail
> {
  const raw = {
    type: fd.get("type")?.toString(),
    title: fd.get("title")?.toString() ?? "",
    slug: fd.get("slug")?.toString() ?? "",
    excerpt: fd.get("excerpt")?.toString() ?? "",
    body: fd.get("body")?.toString() ?? "",

    publishedAt: fd.get("publishedAt")?.toString(),
    expiresAt: fd.get("expiresAt")?.toString(),

    // SEO поля могут присутствовать в форме, но дальше не пишем их в БД
    seoTitle: fd.get("seoTitle")?.toString() ?? "",
    seoDesc: fd.get("seoDesc")?.toString() ?? "",
    ogTitle: fd.get("ogTitle")?.toString() ?? "",
    ogDesc: fd.get("ogDesc")?.toString() ?? "",
  };

  const parsed = ArticleSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      ok: false,
      error: "Некорректные поля формы",
      details: { fieldErrors },
    };
  }

  const { publishedAt, expiresAt } = toDates(parsed.data);

  let coverSrc: string | null | undefined = undefined;
  const coverCandidate = fd.get("coverFile") ?? fd.get("cover");
  
  if (coverCandidate instanceof File) {
    if (coverCandidate.size > 0) {
      try {
        const saved = await saveImageFile(coverCandidate, { dir: "uploads" });
        coverSrc = saved.src;
      } catch {
        return { ok: false, error: "Не удалось сохранить изображение" };
      }
    } else {
      coverSrc = undefined;
    }
  } else if (coverCandidate === null) {
    coverSrc = undefined;
  } else if (typeof coverCandidate === "string" && coverCandidate === "") {
    coverSrc = null;
  }

  return {
    ok: true,
    data: parsed.data,
    publishedAt,
    expiresAt,
    coverSrc,
  };
}

/* =========================
 * СОЗДАНИЕ
 * =======================*/

export async function createArticle(fd: FormData): Promise<ActionResult> {
  const prep = await prepareData(fd);
  if (!prep.ok) return prep;

  try {
    const publishedAtFinal = prep.publishedAt ?? new Date();

    const created = await prisma.article.create({
      data: {
        type: prep.data.type,
        title: prep.data.title,
        slug: prep.data.slug,
        excerpt: prep.data.excerpt || undefined,
        content: prep.data.body,            // ← пишем в content
        cover: prep.coverSrc ?? undefined,
        publishedAt: publishedAtFinal,
        expiresAt: prep.expiresAt ?? undefined,
        // SEO-поля намеренно не пишем — их нет в схеме
      },
      select: { id: true },
    });

    return { ok: true, id: created.id };
  } catch (e: unknown) {
    if (isKnownPrismaError(e, "P2002")) {
      return {
        ok: false,
        error: "Публикация с таким slug уже существует",
        details: { fieldErrors: { slug: ["Slug уже занят"] } },
      };
    }
    if (isKnownPrismaError(e)) {
      console.error("Prisma error:", e.code, e.meta);
    } else {
      console.error("Unknown error:", e);
    }
    return { ok: false, error: "Не удалось сохранить запись" };
  }
}

export async function createArticleAndRedirect(fd: FormData): Promise<void> {
  const res = await createArticle(fd);
  if (res.ok) {
    revalidatePath("/admin/news");
    redirect("/admin/news");
  }
  throw new Error(
    (res as ActionFail).error || "Не удалось сохранить запись (unknown)"
  );
}

/* =========================
 * ОБНОВЛЕНИЕ
 * =======================*/

export async function updateArticle(
  id: string,
  fd: FormData
): Promise<ActionResult> {
  const prep = await prepareData(fd);
  if (!prep.ok) return prep;

  try {
    await prisma.article.update({
      where: { id },
      data: {
        type: prep.data.type,
        title: prep.data.title,
        slug: prep.data.slug,
        excerpt: prep.data.excerpt || undefined,
        content: prep.data.body,            // ← пишем в content
        ...(prep.coverSrc === undefined ? {} : { cover: prep.coverSrc ?? null }),
        publishedAt:
          prep.publishedAt === null ? null : prep.publishedAt ?? undefined,
        expiresAt:
          prep.expiresAt === null ? null : prep.expiresAt ?? undefined,
        // SEO-поля намеренно не пишем
      },
      select: { id: true },
    });

    return { ok: true, id };
  } catch (e: unknown) {
    if (isKnownPrismaError(e, "P2002")) {
      return {
        ok: false,
        error: "Публикация с таким slug уже существует",
        details: { fieldErrors: { slug: ["Slug уже занят"] } },
      };
    }
    if (isKnownPrismaError(e)) {
      console.error("Prisma error:", e.code, e.meta);
    } else {
      console.error("Unknown error:", e);
    }
    return { ok: false, error: "Не удалось сохранить запись" };
  }
}

export async function updateArticleAndRedirect(
  id: string,
  fd: FormData
): Promise<void> {
  const res = await updateArticle(id, fd);
  if (res.ok) {
    revalidatePath("/admin/news");
    redirect("/admin/news");
  }
  throw new Error(
    (res as ActionFail).error || "Не удалось сохранить запись (unknown)"
  );
}

/* =========================
 * УДАЛЕНИЕ
 * =======================*/

export async function deleteArticle(fd: FormData): Promise<ActionResult> {
  const id = fd.get("id")?.toString();
  if (!id) return { ok: false, error: "Не указан id" };

  try {
    await prisma.article.delete({ where: { id } });
    return { ok: true, id };
  } catch (e: unknown) {
    if (isKnownPrismaError(e)) {
      console.error("Prisma error:", e.code, e.meta);
    } else {
      console.error("Unknown error:", e);
    }
    return { ok: false, error: "Не удалось удалить запись" };
  }
}

export async function deleteArticleAndRefresh(fd: FormData): Promise<void> {
  const res = await deleteArticle(fd);
  if (!res.ok) {
    console.warn("deleteArticle fail:", res.error);
  }
  revalidatePath("/admin/news");
  redirect("/admin/news");
}





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
