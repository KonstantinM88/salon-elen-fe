"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

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
  try {
    const kind = String(formData.get("kind") ?? "category"); // "category" | "service"
    const name = String(formData.get("name") ?? "").trim();
    const description =
      (formData.get("description")?.toString().trim() ?? "") || null;
    const isActive = formData.get("isActive") ? true : false;

    if (!name) return { ok: false, message: "Введите название." };

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
        return { ok: false, message: "Выберите категорию для услуги." };
      }
      if (!Number.isFinite(durationMin) || durationMin < 0) {
        return { ok: false, message: "Минуты должны быть неотрицательным числом." };
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
    return { ok: true, message: "Создано." };
  } catch {
    return { ok: false, message: "Не удалось создать запись." };
  }
}

/** Обновление КАТЕГОРИИ (parentId: null) */
export async function updateCategory(formData: FormData): Promise<ActionResult> {
  try {
    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const description =
      (formData.get("description")?.toString().trim() ?? "") || null;
    const isActive = formData.get("isActive") ? true : false;

    if (!id) return { ok: false, message: "Не найден ID." };
    if (!name) return { ok: false, message: "Введите название." };

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
    return { ok: true, message: "Сохранено." };
  } catch {
    return { ok: false, message: "Не удалось обновить категорию." };
  }
}

/** Обновление ПОДУСЛУГИ */
export async function updateSubservice(
  formData: FormData
): Promise<ActionResult> {
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

    if (!id) return { ok: false, message: "Не найден ID." };
    if (!name) return { ok: false, message: "Введите название." };
    if (!parentId) return { ok: false, message: "Выберите категорию." };
    if (!Number.isFinite(durationMin) || durationMin < 0) {
      return { ok: false, message: "Минуты должны быть неотрицательным числом." };
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
    return { ok: true, message: "Сохранено." };
  } catch {
    return { ok: false, message: "Не удалось обновить услугу." };
  }
}

/** Удалить (или заархивировать, если есть связи) */
export async function deleteService(formData: FormData): Promise<ActionResult> {
  try {
    const id = String(formData.get("id") ?? "");
    if (!id) return { ok: false, message: "Не найден ID." };

    const svc = await prisma.service.findUnique({
      where: { id },
      select: { id: true, isArchived: true },
    });
    if (!svc) return { ok: false, message: "Услуга не найдена." };

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
        message:
          "Связи обнаружены — ветка скрыта (архив).",
      };
    }

    await prisma.service.delete({ where: { id } });
    revalidatePath("/admin/services");
    return { ok: true, message: "Удалено." };
  } catch {
    // страховка: если FK помешали — архивируем
    try {
      const id = String(formData.get("id") ?? "");
      if (id) await archiveSubtree(id);
      revalidatePath("/admin/services");
      return { ok: true, message: "Перемещено в архив." };
    } catch {
      return { ok: false, message: "Не удалось удалить/архивировать." };
    }
  }
}









//--------работал добавляем удаление
// 'use server';

// import { prisma } from '@/lib/db';
// import { revalidatePath } from 'next/cache';

// /* ───────── Types ───────── */

// export type Kind = 'category' | 'service';

// export type ActionResult =
//   | { ok: true }
//   | { ok: false; message: string };

// /* ───────── Helpers ───────── */

// function asMessage(err: unknown, fallback = 'Неизвестная ошибка'): string {
//   return err instanceof Error ? err.message : fallback;
// }

// /** Простое slugify без зависимостей */
// function slugify(src: string): string {
//   return src
//     .toLowerCase()
//     .normalize('NFKD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/-{2,}/g, '-')
//     .replace(/^-|-$/g, '');
// }

// /** Обеспечивает уникальность slug (добавляет -01, -02, …) */
// async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
//   let slug = base || 'item';
//   let i = 1;

//   // исключаем текущую запись при апдейте
//   // чтобы не ловить конфликт "сама с собой"
//   // (NOT: { id: excludeId })
//   // eslint-disable-next-line no-constant-condition
//   while (true) {
//     const exists = await prisma.service.findFirst({
//       where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
//       select: { id: true },
//     });
//     if (!exists) return slug;
//     i += 1;
//     slug = `${base}-${String(i).padStart(2, '0')}`;
//   }
// }

// /** "10,5" -> 1050 (центов), пустое -> 0 */
// function euroToCents(v: FormDataEntryValue | null): number {
//   const str = String(v ?? '').replace(',', '.').trim();
//   if (!str) return 0;
//   const n = Number(str);
//   return Number.isFinite(n) ? Math.round(n * 100) : 0;
// }

// /* ───────── Actions ───────── */

// export async function createService(formData: FormData): Promise<ActionResult> {
//   try {
//     const kind = (formData.get('kind') as Kind) ?? 'category';
//     const name = String(formData.get('name') ?? '').trim();
//     if (!name) return { ok: false, message: 'Название обязательно' };

//     const isActive = Boolean(formData.get('isActive'));
//     const description = (formData.get('description') as string) || null;

//     const parentIdRaw = (formData.get('parentId') as string) || '';
//     const parentId = kind === 'service' && parentIdRaw ? parentIdRaw : null;

//     const durationMin = kind === 'service'
//       ? Math.max(0, Number(formData.get('durationMin') || 0))
//       : 0;

//     const priceCents = kind === 'service'
//       ? euroToCents(formData.get('price'))
//       : null;

//     const base = slugify(name);
//     const slug = await ensureUniqueSlug(base);

//     await prisma.service.create({
//       data: {
//         name,
//         slug,
//         description,
//         isActive,       // ← сохраняем активность
//         durationMin,
//         priceCents,
//         parentId,
//       },
//     });

//     revalidatePath('/admin/services');
//     return { ok: true };
//   } catch (err: unknown) {
//     return { ok: false, message: asMessage(err, 'Ошибка создания') };
//   }
// }

// export async function updateService(formData: FormData): Promise<ActionResult> {
//   try {
//     const id = String(formData.get('id') ?? '');
//     if (!id) return { ok: false, message: 'Не передан id' };

//     const kind = (formData.get('kind') as Kind) ?? 'category';
//     const name = String(formData.get('name') ?? '').trim();
//     const description = (formData.get('description') as string) || null;
//     const isActive = Boolean(formData.get('isActive'));

//     const parentIdRaw = (formData.get('parentId') as string) || '';
//     const parentId = kind === 'service' && parentIdRaw ? parentIdRaw : null;

//     const durationMin = kind === 'service'
//       ? Math.max(0, Number(formData.get('durationMin') || 0))
//       : 0;

//     const priceCents = kind === 'service'
//       ? euroToCents(formData.get('price'))
//       : null;

//     const current = await prisma.service.findUnique({
//       where: { id },
//       select: { id: true, name: true, slug: true },
//     });
//     if (!current) return { ok: false, message: 'Услуга не найдена' };

//     let slugToSave: string | undefined;
//     if (name) {
//       const base = slugify(name);
//       if (base && base !== current.slug) {
//         slugToSave = await ensureUniqueSlug(base, id);
//       }
//     }

//     await prisma.service.update({
//       where: { id },
//       data: {
//         name,
//         description,
//         isActive,       // ← обновляем активность
//         durationMin,
//         priceCents,
//         parentId,
//         ...(slugToSave ? { slug: slugToSave } : {}),
//       },
//     });

//     revalidatePath('/admin/services');
//     return { ok: true };
//   } catch (err: unknown) {
//     return { ok: false, message: asMessage(err, 'Ошибка обновления') };
//   }
// }

// /**
//  * Безопасное удаление:
//  *  - Категория: запрещаем, если есть подуслуги или записи, связанные с её подуслугами.
//  *  - Подуслуга: запрещаем, если есть связанные записи.
//  *  Возвращаем ActionResult вместо необработанных исключений.
//  */
// export async function deleteService(formData: FormData): Promise<ActionResult> {
//   try {
//     const id = String(formData.get('id') ?? '');
//     if (!id) return { ok: false, message: 'Не передан id' };

//     const svc = await prisma.service.findUnique({
//       where: { id },
//       select: { id: true, name: true, parentId: true },
//     });
//     if (!svc) {
//       revalidatePath('/admin/services');
//       return { ok: true };
//     }

//     if (svc.parentId === null) {
//       // Категория
//       const childrenCount = await prisma.service.count({ where: { parentId: id } });
//       if (childrenCount > 0) {
//         return {
//           ok: false,
//           message: `Нельзя удалить категорию «${svc.name}»: у неё есть ${childrenCount} подуслуг(и). Сначала удалите/перенесите подуслуги.`,
//         };
//       }

//       // На всякий случай — записи, привязанные напрямую к категории (если такие когда-то попадут)
//       const apptsDirect = await prisma.appointment.count({ where: { serviceId: id } });
//       if (apptsDirect > 0) {
//         return {
//           ok: false,
//           message: `Нельзя удалить категорию «${svc.name}»: с ней связано ${apptsDirect} записей(ь). Перенесите/удалите их.`,
//         };
//       }

//       const apptsViaChildren = await prisma.appointment.count({
//         where: { service: { parentId: id } },
//       });
//       if (apptsViaChildren > 0) {
//         return {
//           ok: false,
//           message: `Нельзя удалить категорию «${svc.name}»: с её услугами связано ${apptsViaChildren} записей(ь). Перенесите/удалите их.`,
//         };
//       }
//     } else {
//       // Подуслуга
//       const apptCount = await prisma.appointment.count({ where: { serviceId: id } });
//       if (apptCount > 0) {
//         return {
//           ok: false,
//           message: `Нельзя удалить услугу «${svc.name}»: с ней связано ${apptCount} записей(ь). Перенесите/удалите их.`,
//         };
//       }
//     }

//     await prisma.service.delete({ where: { id } });
//     revalidatePath('/admin/services');
//     return { ok: true };
//   } catch (err: unknown) {
//     const message =
//       (err as { code?: string })?.code === 'P2003'
//         ? 'Нельзя удалить: есть связанные записи. Перенесите/удалите их и попробуйте снова.'
//         : asMessage(err, 'Ошибка удаления');
//     return { ok: false, message };
//   }
// }








// 'use server';

// import { revalidatePath } from 'next/cache';
// import { prisma } from '@/lib/db';

// /** Простой slugify без внешних пакетов */
// function slugify(src: string) {
//   const base = src
//     .toLowerCase()
//     .normalize('NFKD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/-{2,}/g, '-')
//     .replace(/^-|-$/g, '');
//   return base || 'item';
// }

// /** Гарантирует уникальность с суффиксом -01, -02, ... */
// async function ensureUniqueSlug(base: string, excludeId?: string) {
//   let slug = base || 'item';
//   let i = 1;
//   // защищаемся от бесконечного цикла
//   // (на практике i не вырастет больше пары десятков)
//   // eslint-disable-next-line no-constant-condition
//   while (true) {
//     const exists = await prisma.service.findFirst({
//       where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
//       select: { id: true },
//     });
//     if (!exists) return slug;
//     i += 1;
//     slug = `${base}-${String(i).padStart(2, '0')}`;
//   }
// }

// /* ===================== CREATE ===================== */

// export async function createService(formData: FormData) {
//   const kind = (formData.get('kind') as 'category' | 'service') ?? 'category';
//   const name = String(formData.get('name') ?? '').trim();
//   if (!name) throw new Error('Название обязательно');

//   const isActive = !!formData.get('isActive');
//   const description = (formData.get('description') as string) || null;

//   const parentIdRaw = (formData.get('parentId') as string) || '';
//   const parentId = kind === 'service' && parentIdRaw ? parentIdRaw : null;

//   const durationMin =
//     kind === 'service' ? Number(formData.get('durationMin') || 0) : 0;

//   const priceCents =
//     kind === 'service'
//       ? (() => {
//           const v = String(formData.get('price') ?? '').replace(',', '.');
//           const num = Number(v || 0);
//           return Number.isFinite(num) ? Math.round(num * 100) : 0;
//         })()
//       : null;

//   // генерируем slug автоматически из названия
//   const base = slugify(name);
//   const slug = await ensureUniqueSlug(base);

//   await prisma.service.create({
//     data: {
//       name,
//       slug,
//       description,
//       isActive,
//       durationMin,
//       priceCents,
//       parentId,
//     },
//   });

//   revalidatePath('/admin/services');
// }

// /* ===================== UPDATE ===================== */

// export async function updateService(formData: FormData) {
//   const id = String(formData.get('id') || '');
//   if (!id) throw new Error('Не передан id');

//   const kind = (formData.get('kind') as 'category' | 'service') ?? 'category';
//   const name = String(formData.get('name') ?? '').trim();
//   const description = (formData.get('description') as string) || null;
//   const isActive = !!formData.get('isActive');

//   const parentIdRaw = (formData.get('parentId') as string) || '';
//   const parentId = kind === 'service' && parentIdRaw ? parentIdRaw : null;

//   const durationMin =
//     kind === 'service' ? Number(formData.get('durationMin') || 0) : 0;

//   const priceCents =
//     kind === 'service'
//       ? (() => {
//           const v = String(formData.get('price') ?? '').replace(',', '.');
//           const num = Number(v || 0);
//           return Number.isFinite(num) ? Math.round(num * 100) : 0;
//         })()
//       : null;

//   // Если поменяли имя — пересчитаем slug и обеспечим уникальность
//   let slugToSave: string | undefined;
//   if (name) {
//     const base = slugify(name);
//     slugToSave = await ensureUniqueSlug(base, id);
//   }

//   await prisma.service.update({
//     where: { id },
//     data: {
//       name,
//       description,
//       isActive,
//       durationMin,
//       priceCents,
//       parentId,
//       ...(slugToSave ? { slug: slugToSave } : {}),
//     },
//   });

//   revalidatePath('/admin/services');
// }

// /* ===================== DELETE (с запретом при зависимостях) ===================== */
// /**
//  * Поведение:
//  * - Если это КАТЕГОРИЯ (parentId = null) и у неё есть подуслуги — бросаем ошибку
//  * - Если это ПОДУСЛУГА и на неё есть заявки (Appointment) — бросаем ошибку
//  * - Иначе удаляем
//  *
//  * Это предотвращает P2003 (Foreign key constraint violated)
//  * и сохраняет целостность без изменения схемы БД.
//  */
// export async function deleteService(formData: FormData) {
//   const id = String(formData.get('id') || '');
//   if (!id) throw new Error('Не передан id');

//   const svc = await prisma.service.findUnique({
//     where: { id },
//     select: { id: true, parentId: true, name: true },
//   });
//   if (!svc) throw new Error('Услуга/категория не найдена');

//   // Категория: запрещаем удаление, если есть подуслуги
//   if (svc.parentId === null) {
//     const childrenCount = await prisma.service.count({
//       where: { parentId: id },
//     });
//     if (childrenCount > 0) {
//       throw new Error(
//         `Нельзя удалить категорию «${svc.name}»: у неё есть ${childrenCount} подуслуг(и). ` +
//           'Сначала удалите/перенесите подуслуги.',
//       );
//     }

//     await prisma.service.delete({ where: { id } });
//     revalidatePath('/admin/services');
//     return;
//   }

//   // Подуслуга: запрещаем удаление, если на неё ссылаются заявки
//   const apptCount = await prisma.appointment.count({
//     where: { serviceId: id },
//   });
//   if (apptCount > 0) {
//     throw new Error(
//       `Нельзя удалить услугу «${svc.name}»: с ней связано ${apptCount} заявок(и). ` +
//         'Отвяжите или перенесите заявки.',
//     );
//   }

//   await prisma.service.delete({ where: { id } });
//   revalidatePath('/admin/services');
// }






//-------------работал но не удалял категорию
// 'use server';

// import { prisma } from '@/lib/db';

// /** очень простое slugify без внешних пакетов */
// function slugify(src: string) {
//   return src
//     .toLowerCase()
//     .normalize('NFKD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/-{2,}/g, '-')
//     .replace(/^-|-$/g, '');
// }

// /** гарантирует уникальность с добавкой -01, -02 ... */
// async function ensureUniqueSlug(base: string, excludeId?: string) {
//   let slug = base || 'item';
//   let i = 1;
//   while (true) {
//     const exists = await prisma.service.findFirst({
//       where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
//       select: { id: true },
//     });
//     if (!exists) return slug;
//     i += 1;
//     slug = `${base}-${String(i).padStart(2, '0')}`;
//   }
// }

// export async function createService(formData: FormData) {
//   const kind = (formData.get('kind') as 'category' | 'service') ?? 'category';
//   const name = String(formData.get('name') ?? '').trim();
//   if (!name) throw new Error('Название обязательно');

//   const isActive = formData.get('isActive') ? true : false;
//   const description = (formData.get('description') as string) || null;

//   const parentIdRaw = (formData.get('parentId') as string) || '';
//   const parentId = kind === 'service' && parentIdRaw ? parentIdRaw : null;

//   const durationMin =
//     kind === 'service' ? Number(formData.get('durationMin') || 0) : 0;
//   const priceCents =
//     kind === 'service'
//       ? (() => {
//           const v = String(formData.get('price') ?? '').replace(',', '.');
//           const num = Number(v || 0);
//           return Number.isFinite(num) ? Math.round(num * 100) : 0;
//         })()
//       : null;

//   // генерируем slug только по названию
//   const base = slugify(name);
//   const slug = await ensureUniqueSlug(base);

//   await prisma.service.create({
//     data: {
//       name,
//       slug,
//       description,
//       isActive,
//       durationMin,
//       priceCents,
//       parentId,
//     },
//   });
// }

// export async function updateService(formData: FormData) {
//   const id = String(formData.get('id') || '');
//   if (!id) throw new Error('Не передан id');

//   const kind = (formData.get('kind') as 'category' | 'service') ?? 'category';
//   const name = String(formData.get('name') ?? '').trim();
//   const description = (formData.get('description') as string) || null;
//   const isActive = formData.get('isActive') ? true : false;

//   const parentIdRaw = (formData.get('parentId') as string) || '';
//   const parentId = kind === 'service' && parentIdRaw ? parentIdRaw : null;

//   const durationMin =
//     kind === 'service' ? Number(formData.get('durationMin') || 0) : 0;
//   const priceCents =
//     kind === 'service'
//       ? (() => {
//           const v = String(formData.get('price') ?? '').replace(',', '.');
//           const num = Number(v || 0);
//           return Number.isFinite(num) ? Math.round(num * 100) : 0;
//         })()
//       : null;

//   // если поменяли имя — пересчитаем slug (но сохраним уникальность)
//   let slugToSave: string | undefined;
//   if (name) {
//     const base = slugify(name);
//     slugToSave = await ensureUniqueSlug(base, id);
//   }

//   await prisma.service.update({
//     where: { id },
//     data: {
//       name,
//       description,
//       isActive,
//       durationMin,
//       priceCents,
//       parentId,
//       ...(slugToSave ? { slug: slugToSave } : {}),
//     },
//   });
// }

// export async function deleteService(formData: FormData) {
//   const id = String(formData.get('id') || '');
//   if (!id) throw new Error('Не передан id');

//   await prisma.service.delete({ where: { id } });
// }








//--------------работал оставлю пока не проверю
// 'use server';

// import { revalidatePath } from 'next/cache';
// import { prisma } from '@/lib/db';

// /** Транслитерация RU -> LAT и нормализация в slug */
// function slugify(input: string): string {
//   const map: Record<string, string> = {
//     а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i', й:'i',
//     к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t', у:'u', ф:'f',
//     х:'h', ц:'c', ч:'ch', ш:'sh', щ:'sch', ь:'', ы:'y', ъ:'', э:'e', ю:'yu', я:'ya',
//     '’':'', 'ʼ':'', '\'':'',
//   };
//   const lower = input.trim().toLowerCase();
//   const translit = lower.split('').map(ch => map[ch] ?? ch).join('');
//   let slug = translit
//     .normalize('NFKD')
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/-{2,}/g, '-')
//     .replace(/^-|-$/g, '');
//   if (!slug) slug = 'item';
//   return slug;
// }

// /** Уникальность slug: базовый + суффиксы -2, -3, ... */
// async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
//   const isFree = async (s: string) =>
//     !(await prisma.service.findFirst({
//       where: excludeId ? { slug: s, NOT: { id: excludeId } } : { slug: s },
//       select: { id: true },
//     }));

//   if (await isFree(base)) return base;
//   for (let i = 2; i < 200; i++) {
//     const next = `${base}-${i}`;
//     if (await isFree(next)) return next;
//   }
//   return `${base}-${Math.random().toString(36).slice(2, 6)}`;
// }

// /** helpers без any */
// function getStr(fd: FormData, name: string): string | undefined {
//   const v = fd.get(name);
//   return typeof v === 'string' ? v : undefined;
// }
// function getNum(fd: FormData, name: string): number | undefined {
//   const raw = getStr(fd, name);
//   if (raw == null || raw === '') return undefined;
//   const n = Number(raw);
//   return Number.isFinite(n) ? n : undefined;
// }
// function getMoneyCents(fd: FormData, name: string): number | null {
//   const raw = getStr(fd, name);
//   if (!raw) return null;
//   const normalized = raw.replace(',', '.').replace(/\s+/g, '');
//   const val = Number(normalized);
//   if (!Number.isFinite(val)) return null;
//   const cents = Math.round(val * 100);
//   return cents >= 0 ? cents : null;
// }
// function getCheckbox(fd: FormData, name: string): boolean {
//   return fd.has(name);
// }

// export async function createService(formData: FormData) {
//   const kind = (getStr(formData, 'kind') === 'service' ? 'service' : 'category') as 'category' | 'service';

//   const name = getStr(formData, 'name')?.trim() ?? '';
//   if (!name) throw new Error('Название обязательно');

//   // slug всегда генерим с сервера из name
//   const slug = await ensureUniqueSlug(slugify(name));

//   const description = getStr(formData, 'description')?.trim() || null;
//   const isActive = getCheckbox(formData, 'isActive');

//   if (kind === 'category') {
//     await prisma.service.create({
//       data: { name, slug, description, isActive, durationMin: 0, priceCents: null, parentId: null },
//     });
//   } else {
//     const parentId = getStr(formData, 'parentId') || null;
//     const durationMin = getNum(formData, 'durationMin') ?? 0;
//     const priceCents = getMoneyCents(formData, 'price');

//     await prisma.service.create({
//       data: { name, slug, description, isActive, durationMin, priceCents, parentId },
//     });
//   }

//   revalidatePath('/admin/services');
// }

// export async function updateService(formData: FormData) {
//   const id = getStr(formData, 'id');
//   if (!id) throw new Error('Не указан id');

//   const kind = (getStr(formData, 'kind') === 'service' ? 'service' : 'category') as 'category' | 'service';

//   const name = getStr(formData, 'name')?.trim() ?? '';
//   if (!name) throw new Error('Название обязательно');

//   // при апдейте тоже формируем slug из текущего name (и сохраняем уникальность)
//   const slug = await ensureUniqueSlug(slugify(name), id);

//   const description = getStr(formData, 'description')?.trim() || null;
//   const isActive = getCheckbox(formData, 'isActive');

//   if (kind === 'category') {
//     await prisma.service.update({
//       where: { id },
//       data: { name, slug, description, isActive, durationMin: 0, priceCents: null, parentId: null },
//     });
//   } else {
//     const parentId = getStr(formData, 'parentId') || null;
//     const durationMin = getNum(formData, 'durationMin') ?? 0;
//     const priceCents = getMoneyCents(formData, 'price');

//     await prisma.service.update({
//       where: { id },
//       data: { name, slug, description, isActive, durationMin, priceCents, parentId },
//     });
//   }

//   revalidatePath('/admin/services');
// }

// export async function deleteService(formData: FormData) {
//   const id = getStr(formData, 'id');
//   if (!id) throw new Error('Не указан id');
//   await prisma.service.delete({ where: { id } });
//   revalidatePath('/admin/services');
// }







//----------хорошо но под старый дизайн nextjs-----------
// // src/app/admin/services/actions.ts
// 'use server';

// import { prisma } from '@/lib/db';
// import { revalidatePath } from 'next/cache';

// /* -------------------- helpers -------------------- */

// function slugify(input: string): string {
//   return input
//     .trim()
//     .toLowerCase()
//     .normalize('NFKD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/(^-|-$)+/g, '');
// }

// function toInt(v: FormDataEntryValue | null, fallback: number): number {
//   if (typeof v !== 'string') return fallback;
//   const n = Number(v.trim());
//   return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
// }

// function toMoney(v: FormDataEntryValue | null): number | null {
//   if (typeof v !== 'string') return null;
//   const t = v.trim();
//   if (!t) return null;
//   const n = Number(t.replace(',', '.'));
//   return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : null;
// }

// function s(v: FormDataEntryValue | null): string {
//   return typeof v === 'string' ? v : '';
// }

// /* -------------------- CREATE -------------------- */

// export async function createService(formData: FormData): Promise<void> {
//   const name = s(formData.get('name')).trim();
//   const rawSlug = s(formData.get('slug')).trim();
//   const descriptionStr = s(formData.get('description')).trim();
//   const description = descriptionStr ? descriptionStr : null;

//   const kind = s(formData.get('kind')) === 'service' ? 'service' : 'category';
//   // чекбокс: если ключ присутствует — true, если нет — false
//   const isActive = formData.has('isActive');

//   const slug = rawSlug ? slugify(rawSlug) : slugify(name || 'service');

//   let parentId: string | null = null;
//   let durationMin = 0;
//   let priceCents: number | null = null;

//   if (kind === 'service') {
//     const p = s(formData.get('parentId')).trim();
//     parentId = p || null;
//     durationMin = toInt(formData.get('durationMin'), 0);
//     priceCents = toMoney(formData.get('price'));
//   }

//   if (!name) {
//     revalidatePath('/admin/services');
//     return;
//   }

//   await prisma.service.create({
//     data: {
//       name,
//       slug,
//       description,
//       isActive,
//       durationMin, // 0 для категории
//       priceCents,  // null для категории
//       parentId,    // null для категории
//     },
//   });

//   revalidatePath('/admin/services');
// }

// /* -------------------- UPDATE -------------------- */

// export async function updateService(formData: FormData): Promise<void> {
//   const id = s(formData.get('id')).trim();
//   if (!id) {
//     revalidatePath('/admin/services');
//     return;
//   }

//   const kind = s(formData.get('kind')) === 'service' ? 'service' : 'category';

//   // читаем «как есть» из текущей формы
//   const nameRaw = s(formData.get('name'));
//   const name = nameRaw.trim() || undefined;

//   const rawSlug = s(formData.get('slug'));
//   const slug = rawSlug.trim() ? slugify(rawSlug) : undefined;

//   const descriptionRaw = s(formData.get('description'));
//   const description =
//     descriptionRaw === '' ? null : (descriptionRaw ?? undefined);

//   // чекбокс: если поля нет в форме — галка снята
//   const isActive = formData.has('isActive');

//   let parentId: string | null | undefined = undefined;
//   let durationMin: number | undefined = undefined;
//   let priceCents: number | null | undefined = undefined;

//   if (kind === 'category') {
//     parentId = null;
//     durationMin = 0;
//     priceCents = null;
//   } else {
//     const p = s(formData.get('parentId')).trim();
//     parentId = p ? p : null;

//     durationMin = toInt(formData.get('durationMin'), 0);
//     priceCents = toMoney(formData.get('price'));
//   }

//   // защита от самоссылки
//   if (parentId) {
//     const current = await prisma.service.findUnique({
//       where: { id },
//       select: { parentId: true },
//     });
//     if (parentId === id) {
//       parentId = current?.parentId ?? null;
//     }
//   }

//   await prisma.service.update({
//     where: { id },
//     data: {
//       ...(name !== undefined ? { name } : {}),
//       ...(slug !== undefined ? { slug } : {}),
//       ...(description !== undefined ? { description } : {}),
//       isActive, // всегда обновляем из чекбокса текущей формы
//       ...(parentId !== undefined ? { parentId } : {}),
//       ...(durationMin !== undefined ? { durationMin } : {}),
//       ...(priceCents !== undefined ? { priceCents } : {}),
//     },
//   });

//   revalidatePath('/admin/services');
// }

// /* -------------------- DELETE -------------------- */

// /**
//  * Полное удаление услуги/категории:
//  * 1) Собираем id самой услуги и всех её потомков (многоуровнево).
//  * 2) Удаляем Appointment по этим serviceId.
//  * 3) Удаляем сначала детей, затем саму услугу.
//  */
// export async function deleteService(formData: FormData): Promise<void> {
//   const id = s(formData.get('id')).trim();
//   if (!id) return;

//   await prisma.$transaction(async (tx) => {
//     const toDelete = new Set<string>([id]);
//     let frontier: string[] = [id];

//     while (frontier.length > 0) {
//       const children = await tx.service.findMany({
//         where: { parentId: { in: frontier } },
//         select: { id: true },
//       });
//       const next: string[] = [];
//       for (const c of children) {
//         if (!toDelete.has(c.id)) {
//           toDelete.add(c.id);
//           next.push(c.id);
//         }
//       }
//       frontier = next;
//     }

//     const ids = Array.from(toDelete);
//     const childIds = ids.filter((sid) => sid !== id);

//     await tx.appointment.deleteMany({ where: { serviceId: { in: ids } } });

//     if (childIds.length > 0) {
//       await tx.service.deleteMany({ where: { id: { in: childIds } } });
//     }
//     await tx.service.delete({ where: { id } });
//   });

//   revalidatePath('/admin/services');
// }









// 'use server';

// import { prisma } from '@/lib/db';
// import { revalidatePath } from 'next/cache';

// function slugify(input: string): string {
//   return input
//     .trim()
//     .toLowerCase()
//     .normalize('NFKD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/(^-|-$)+/g, '');
// }

// function toInt(v: FormDataEntryValue | null, fallback: number): number {
//   if (typeof v !== 'string') return fallback;
//   const n = Number(v.trim());
//   return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
// }
// function toMoney(v: FormDataEntryValue | null): number | null {
//   if (typeof v !== 'string') return null;
//   const t = v.trim();
//   if (!t) return null;
//   const n = Number(t.replace(',', '.'));
//   return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : null;
// }

// export async function createService(formData: FormData): Promise<void> {
//   const name = String(formData.get('name') ?? '').trim();
//   const rawSlug = String(formData.get('slug') ?? '').trim();
//   const description = String(formData.get('description') ?? '').trim() || null;
//   const kind = String(formData.get('kind') ?? 'category') === 'service' ? 'service' : 'category';
//   const isActive = String(formData.get('isActive') ?? 'on') === 'on';

//   const slug = rawSlug ? slugify(rawSlug) : slugify(name || 'service');

//   let parentId: string | null = null;
//   let durationMin = 0;
//   let priceCents: number | null = null;

//   if (kind === 'service') {
//     parentId = String(formData.get('parentId') ?? '').trim() || null;
//     durationMin = toInt(formData.get('durationMin'), 0);
//     priceCents = toMoney(formData.get('price'));
//   }

//   if (!name) {
//     revalidatePath('/admin/services');
//     return;
//   }

//   await prisma.service.create({
//     data: {
//       name,
//       slug,
//       description,
//       isActive,
//       durationMin, // 0 для категории
//       priceCents,  // null для категории
//       parentId,    // null для категории
//     },
//   });

//   revalidatePath('/admin/services');
// }

// export async function updateService(formData: FormData): Promise<void> {
//   const id = String(formData.get('id') ?? '').trim();
//   if (!id) {
//     revalidatePath('/admin/services');
//     return;
//   }

//   const name = String(formData.get('name') ?? '').trim() || undefined;
//   const rawSlug = String(formData.get('slug') ?? '').trim();
//   const slug = rawSlug ? slugify(rawSlug) : undefined;
//   const description = ((): string | null | undefined => {
//     const v = formData.get('description');
//     if (typeof v !== 'string') return undefined;
//     const t = v.trim();
//     return t === '' ? null : t;
//   })();

//   const nextKind: 'category' | 'service' | undefined =
//     String(formData.get('kind') ?? '') === 'service'
//       ? 'service'
//       : String(formData.get('kind') ?? '') === 'category'
//       ? 'category'
//       : undefined;

//   const isActive =
//     String(formData.get('isActive') ?? '') ?
//       (String(formData.get('isActive')) === 'on') :
//       undefined;

//   const current = await prisma.service.findUnique({
//     where: { id },
//     select: { parentId: true },
//   });

//   let parentId: string | null | undefined = undefined;
//   let durationMin: number | undefined = undefined;
//   let priceCents: number | null | undefined = undefined;

//   if (nextKind === 'category') {
//     parentId = null;
//     durationMin = 0;
//     priceCents = null;
//   } else if (nextKind === 'service') {
//     parentId = String(formData.get('parentId') ?? '').trim() || null;
//     durationMin = toInt(formData.get('durationMin'), 0);
//     priceCents = toMoney(formData.get('price'));
//   } else {
//     if (formData.get('parentId') !== null) {
//       const p = String(formData.get('parentId') ?? '').trim();
//       parentId = p ? p : null;
//     }
//     if (formData.get('durationMin') !== null) {
//       durationMin = toInt(formData.get('durationMin'), 0);
//     }
//     if (formData.get('price') !== null) {
//       priceCents = toMoney(formData.get('price'));
//     }
//   }

//   // самоссылка запрещена
//   if (parentId && parentId === id) {
//     parentId = current?.parentId ?? null;
//   }

//   await prisma.service.update({
//     where: { id },
//     data: {
//       ...(name !== undefined ? { name } : {}),
//       ...(slug !== undefined ? { slug } : {}),
//       ...(description !== undefined ? { description } : {}),
//       ...(isActive !== undefined ? { isActive } : {}),
//       ...(parentId !== undefined ? { parentId } : {}),
//       ...(durationMin !== undefined ? { durationMin } : {}),
//       ...(priceCents !== undefined ? { priceCents } : {}),
//     },
//   });

//   revalidatePath('/admin/services');
// }

// /**
//  * Полное удаление услуги/категории:
//  * 1) Собираем id самой услуги и всех её потомков (многоуровнево).
//  * 2) Удаляем все связанные Appointment по этим serviceId.
//  * 3) Удаляем сначала детей, затем саму услугу.
//  *
//  * ВНИМАНИЕ: операция необратима — история записей по этой услуге будет удалена.
//  */
// export async function deleteService(formData: FormData): Promise<void> {
//   const id = String(formData.get('id') ?? '').trim();
//   if (!id) return;

//   await prisma.$transaction(async (tx) => {
//     // 1) Соберём всех потомков (BFS)
//     const toDelete = new Set<string>([id]);
//     let frontier: string[] = [id];

//     while (frontier.length > 0) {
//       const children = await tx.service.findMany({
//         where: { parentId: { in: frontier } },
//         select: { id: true },
//       });
//       const next: string[] = [];
//       for (const c of children) {
//         if (!toDelete.has(c.id)) {
//           toDelete.add(c.id);
//           next.push(c.id);
//         }
//       }
//       frontier = next;
//     }

//     const ids = Array.from(toDelete);
//     const childIds = ids.filter((sid) => sid !== id);

//     // 2) Сносим привязанные записи
//     await tx.appointment.deleteMany({
//       where: { serviceId: { in: ids } },
//     });

//     // 3) Сначала дети, потом корень
//     if (childIds.length > 0) {
//       await tx.service.deleteMany({ where: { id: { in: childIds } } });
//     }
//     await tx.service.delete({ where: { id } });
//   });

//   revalidatePath('/admin/services');
// }
