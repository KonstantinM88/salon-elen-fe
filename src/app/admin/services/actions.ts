// src/app/admin/services/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isSeoLocale, type SeoLocale } from "@/lib/seo-locale";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

type ServicesActionCopy = {
  enterName: string;
  selectCategoryForService: string;
  minutesMustBeNonNegative: string;
  created: string;
  createFailed: string;
  idNotFound: string;
  saved: string;
  updateCategoryFailed: string;
  selectCategory: string;
  updateServiceFailed: string;
  serviceNotFound: string;
  archivedBranch: string;
  deleted: string;
  movedToArchive: string;
  deleteOrArchiveFailed: string;
};

const SERVICES_ACTION_COPY: Record<SeoLocale, ServicesActionCopy> = {
  de: {
    enterName: "Name eingeben.",
    selectCategoryForService: "Kategorie fuer die Leistung auswaehlen.",
    minutesMustBeNonNegative: "Minuten muessen eine nicht-negative Zahl sein.",
    created: "Erstellt.",
    createFailed: "Eintrag konnte nicht erstellt werden.",
    idNotFound: "ID nicht gefunden.",
    saved: "Gespeichert.",
    updateCategoryFailed: "Kategorie konnte nicht aktualisiert werden.",
    selectCategory: "Kategorie auswaehlen.",
    updateServiceFailed: "Leistung konnte nicht aktualisiert werden.",
    serviceNotFound: "Leistung nicht gefunden.",
    archivedBranch: "Verknuepfungen gefunden - Zweig ausgeblendet (Archiv).",
    deleted: "Geloescht.",
    movedToArchive: "In Archiv verschoben.",
    deleteOrArchiveFailed: "Loeschen/Archivieren fehlgeschlagen.",
  },
  ru: {
    enterName: "Введите название.",
    selectCategoryForService: "Выберите категорию для услуги.",
    minutesMustBeNonNegative: "Минуты должны быть неотрицательным числом.",
    created: "Создано.",
    createFailed: "Не удалось создать запись.",
    idNotFound: "Не найден ID.",
    saved: "Сохранено.",
    updateCategoryFailed: "Не удалось обновить категорию.",
    selectCategory: "Выберите категорию.",
    updateServiceFailed: "Не удалось обновить услугу.",
    serviceNotFound: "Услуга не найдена.",
    archivedBranch: "Связи обнаружены — ветка скрыта (архив).",
    deleted: "Удалено.",
    movedToArchive: "Перемещено в архив.",
    deleteOrArchiveFailed: "Не удалось удалить/архивировать.",
  },
  en: {
    enterName: "Enter name.",
    selectCategoryForService: "Select a category for the service.",
    minutesMustBeNonNegative: "Minutes must be a non-negative number.",
    created: "Created.",
    createFailed: "Failed to create record.",
    idNotFound: "ID not found.",
    saved: "Saved.",
    updateCategoryFailed: "Failed to update category.",
    selectCategory: "Select category.",
    updateServiceFailed: "Failed to update service.",
    serviceNotFound: "Service not found.",
    archivedBranch: "Relations detected - branch was hidden (archive).",
    deleted: "Deleted.",
    movedToArchive: "Moved to archive.",
    deleteOrArchiveFailed: "Failed to delete/archive.",
  },
};

function localeFromFormData(formData: FormData): SeoLocale {
  const raw = formData.get("locale");
  return isSeoLocale(raw) ? raw : "de";
}

/* ───────────────── helpers ───────────────── */

function toSlug(input: string): string {
  // очень компактная транслитерация ru → lat + нормализация
  const map: Record<string, string> = {
    ё: "yo", й: "i", ц: "ts", у: "u", к: "k", е: "e", н: "n", г: "g", ш: "sh",
    щ: "sch", з: "z", х: "h", ф: "f", ы: "y", в: "v", а: "a", п: "p", р: "r",
    о: "o", л: "l", д: "d", ж: "zh", э: "e", я: "ya", ч: "ch", с: "s", м: "m",
    и: "i", т: "t", ь: "", б: "b", ю: "yu", ъ: "",
  };
  return input
    .trim()
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

async function ensureUniqueSlug(base: string): Promise<string> {
  const candidate = toSlug(base) || "service";
  let slug = candidate;
  let i = 1;
  // добьём до уникальности
  while (await prisma.service.findUnique({ where: { slug } })) {
    slug = `${candidate}-${++i}`;
  }
  return slug;
}

/** рекурсивная архивация ветки */
async function archiveSubtree(serviceId: string): Promise<void> {
  await prisma.service.update({
    where: { id: serviceId },
    data: { isArchived: true, isActive: false },
  });
  const children = await prisma.service.findMany({
    where: { parentId: serviceId, isArchived: false },
    select: { id: true },
  });
  for (const ch of children) await archiveSubtree(ch.id);
}

/* ───────────────── actions ───────────────── */

/** Создание категории или подуслуги (определяется по `kind`) */
export async function createService(formData: FormData): Promise<ActionResult> {
  const t = SERVICES_ACTION_COPY[localeFromFormData(formData)];
  try {
    const kind = String(formData.get("kind") ?? "category"); // "category" | "service"
    const name = String(formData.get("name") ?? "").trim();
    const description =
      (formData.get("description")?.toString().trim() ?? "") || null;
    const isActive = formData.get("isActive") ? true : false;

    if (!name) return { ok: false, message: t.enterName };

    if (kind === "category") {
      // категория: без parentId, без цены, минуты = 0
      const slug = await ensureUniqueSlug(name);
      await prisma.service.create({
        data: {
          name,
          slug,
          description,
          durationMin: 0,
          priceCents: null,
          parentId: null,
          isActive,
          isArchived: false,
        },
      });
    } else {
      // подуслуга
      const parentId =
        (formData.get("parentId")?.toString().trim() || "") || null;
      const durationMin = Number(formData.get("durationMin") ?? 0);
      const priceStr = formData.get("price")?.toString().trim() ?? "";
      const priceCents =
        priceStr === "" ? null : Math.round(Number(priceStr.replace(",", ".")) * 100);

      if (!parentId) {
        return { ok: false, message: t.selectCategoryForService };
      }
      if (!Number.isFinite(durationMin) || durationMin < 0) {
        return { ok: false, message: t.minutesMustBeNonNegative };
      }

      const slug = await ensureUniqueSlug(name);
      await prisma.service.create({
        data: {
          name,
          slug,
          description,
          durationMin,
          priceCents,
          parentId,
          isActive,
          isArchived: false,
        },
      });
    }

    revalidatePath("/admin/services");
    return { ok: true, message: t.created };
  } catch {
    return { ok: false, message: t.createFailed };
  }
}

/** Обновление КАТЕГОРИИ (parentId: null) */
export async function updateCategory(formData: FormData): Promise<ActionResult> {
  const t = SERVICES_ACTION_COPY[localeFromFormData(formData)];
  try {
    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const description =
      (formData.get("description")?.toString().trim() ?? "") || null;
    const isActive = formData.get("isActive") ? true : false;

    if (!id) return { ok: false, message: t.idNotFound };
    if (!name) return { ok: false, message: t.enterName };

    await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
        // гарантируем, что это именно категория
        parentId: null,
        durationMin: 0,
        priceCents: null,
      },
    });

    revalidatePath("/admin/services");
    return { ok: true, message: t.saved };
  } catch {
    return { ok: false, message: t.updateCategoryFailed };
  }
}

/** Обновление ПОДУСЛУГИ */
export async function updateSubservice(
  formData: FormData
): Promise<ActionResult> {
  const t = SERVICES_ACTION_COPY[localeFromFormData(formData)];
  try {
    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const description =
      (formData.get("description")?.toString().trim() ?? "") || null;
    const isActive = formData.get("isActive") ? true : false;
    const parentId = (formData.get("parentId")?.toString().trim() || "") || null;

    const durationMin = Number(formData.get("durationMin") ?? 0);
    const priceStr = formData.get("price")?.toString().trim() ?? "";
    const priceCents =
      priceStr === "" ? null : Math.round(Number(priceStr.replace(",", ".")) * 100);

    if (!id) return { ok: false, message: t.idNotFound };
    if (!name) return { ok: false, message: t.enterName };
    if (!parentId) return { ok: false, message: t.selectCategory };
    if (!Number.isFinite(durationMin) || durationMin < 0) {
      return { ok: false, message: t.minutesMustBeNonNegative };
    }

    await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
        parentId,
        durationMin,
        priceCents,
      },
    });

    revalidatePath("/admin/services");
    return { ok: true, message: t.saved };
  } catch {
    return { ok: false, message: t.updateServiceFailed };
  }
}

/** Удалить (или заархивировать, если есть связи) */
export async function deleteService(formData: FormData): Promise<ActionResult> {
  const t = SERVICES_ACTION_COPY[localeFromFormData(formData)];
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, message: t.idNotFound };

    const svc = await prisma.service.findUnique({
      where: { id },
      select: { id: true, isArchived: true },
    });
    if (!svc) return { ok: false, message: t.serviceNotFound };

    const [children, appts, masters] = await Promise.all([
      prisma.service.count({ where: { parentId: id, isArchived: false } }),
      prisma.appointment.count({
        where: { OR: [{ serviceId: id }, { service: { parentId: id } }] },
      }),
      prisma.master.count({ where: { services: { some: { id } } } }),
    ]);

    const used = children > 0 || appts > 0 || masters > 0;

    if (used) {
      await archiveSubtree(id);
      revalidatePath("/admin/services");
      return {
        ok: true,
        message: t.archivedBranch,
      };
    }

    await prisma.service.delete({ where: { id } });
    revalidatePath("/admin/services");
    return { ok: true, message: t.deleted };
  } catch {
    // страховка: если FK помешали — архивируем
    try {
      const id = String(formData.get("id") ?? "");
      if (id) await archiveSubtree(id);
      revalidatePath("/admin/services");
      return { ok: true, message: t.movedToArchive };
    } catch {
      return { ok: false, message: t.deleteOrArchiveFailed };
    }
  }
}
