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
  // Тип можно не выводить в форме — по умолчанию ARTICLE
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

  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDesc: z.string().optional(),
});

/* =========================
 * ПАРСИНГ ДАТ ИЗ СТРОК ФОРМЫ
 * =======================*/

/** Преобразует значения из формы в Date|null */
function toDates(input: { publishedAt?: string; expiresAt?: string }): {
  publishedAt: Date | null;
  expiresAt: Date | null;
} {
  const input_published = (input.publishedAt ?? "").trim();
  const input_expires = (input.expiresAt ?? "").trim();

  const publishedAt =
    input_published !== "" ? new Date(input_published) : null;
  const expiresAt = input_expires !== "" ? new Date(input_expires) : null;

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
      coverSrc?: string | null; // undefined — не трогать; null — очистить; string — обновить
    }
  | ActionFail
> {
  // собираем значения из формы
  const raw = {
    type: fd.get("type")?.toString(),
    title: fd.get("title")?.toString() ?? "",
    slug: fd.get("slug")?.toString() ?? "",
    excerpt: fd.get("excerpt")?.toString() ?? "",
    body: fd.get("body")?.toString() ?? "",

    publishedAt: fd.get("publishedAt")?.toString(),
    expiresAt: fd.get("expiresAt")?.toString(),

    seoTitle: fd.get("seoTitle")?.toString() ?? "",
    seoDesc: fd.get("seoDesc")?.toString() ?? "",
    ogTitle: fd.get("ogTitle")?.toString() ?? "",
    ogDesc: fd.get("ogDesc")?.toString() ?? "",
  };

  // валидируем
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

  // даты
  const { publishedAt, expiresAt } = toDates(parsed.data);

  // обложка — поддерживаем name="coverFile" ИЛИ name="cover"
  let coverSrc: string | null | undefined = undefined;
  const coverCandidate = fd.get("coverFile") ?? fd.get("cover");
  if (coverCandidate instanceof File) {
    if (coverCandidate.size > 0) {
      try {
        const saved = await saveImageFile(coverCandidate, { dir: "uploads" });
        coverSrc = saved.src; // /uploads/xxx.webp
      } catch {
        return { ok: false, error: "Не удалось сохранить изображение" };
      }
    } else {
      // Пустой файл пришёл — считаем, что поле не менялось
      coverSrc = undefined;
    }
  } else if (coverCandidate === null) {
    // Поля нет — не трогаем cover
    coverSrc = undefined;
  } else if (typeof coverCandidate === "string" && coverCandidate === "") {
    // Явно хотели очистить (например, скрытым input с пустой строкой)
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
    // Если дата публикации пустая — публикуем сейчас
    const publishedAtFinal = prep.publishedAt ?? new Date();

    const created = await prisma.article.create({
      data: {
        type: prep.data.type, // по умолчанию ARTICLE
        title: prep.data.title,
        slug: prep.data.slug,
        excerpt: prep.data.excerpt || undefined,
        body: prep.data.body,
        cover: prep.coverSrc ?? undefined,
        publishedAt: publishedAtFinal,
        expiresAt: prep.expiresAt ?? undefined,
        seoTitle: prep.data.seoTitle || undefined,
        seoDesc: prep.data.seoDesc || undefined,
        ogTitle: prep.data.ogTitle || undefined,
        ogDesc: prep.data.ogDesc || undefined,
      },
      select: { id: true },
    });

    return { ok: true, id: created.id };
  } catch (e: unknown) {
    // Уникальный индекс: slug уже занят
    if (isKnownPrismaError(e, "P2002")) {
      return {
        ok: false,
        error: "Публикация с таким slug уже существует",
        details: { fieldErrors: { slug: ["Slug уже занят"] } },
      };
    }

    // Логируем прочее
    if (isKnownPrismaError(e)) {
      console.error("Prisma error:", e.code, e.meta);
    } else {
      console.error("Unknown error:", e);
    }
    return { ok: false, error: "Не удалось сохранить запись" };
  }
}

/** Удобный вариант: создать и сразу перейти в /admin/news */
export async function createArticleAndRedirect(fd: FormData): Promise<void> {
  const res = await createArticle(fd);
  if (res.ok) {
    revalidatePath("/admin/news");
    redirect("/admin/news");
  }
  // Если не ок — пробросим, пусть страница покажет ошибку как раньше
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
        body: prep.data.body,

        // cover:
        //  - undefined — не трогаем
        //  - null — обнулим
        //  - string — обновим
        ...(prep.coverSrc === undefined
          ? {}
          : { cover: prep.coverSrc ?? null }),

        // Даты:
        //  - null — сохраняем null
        //  - undefined — оставляем как есть
        publishedAt:
          prep.publishedAt === null ? null : prep.publishedAt ?? undefined,
        expiresAt: prep.expiresAt === null ? null : prep.expiresAt ?? undefined,

        seoTitle: prep.data.seoTitle || undefined,
        seoDesc: prep.data.seoDesc || undefined,
        ogTitle: prep.data.ogTitle || undefined,
        ogDesc: prep.data.ogDesc || undefined,
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

/** Удобный вариант: обновить и сразу вернуться на список */
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

/** Вариант для формы в списке: удалить + revalidate + redirect */
export async function deleteArticleAndRefresh(fd: FormData): Promise<void> {
  const res = await deleteArticle(fd);
  // Даже если запись уже удалена — просто обновим список.
  if (!res.ok) {
    // Не роняем UX, но лог в консоль
    console.warn("deleteArticle fail:", res.error);
  }
  revalidatePath("/admin/news");
  redirect("/admin/news");
}
