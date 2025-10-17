// src/app/admin/services/actions.ts
'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/* -------------------- helpers -------------------- */

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function toInt(v: FormDataEntryValue | null, fallback: number): number {
  if (typeof v !== 'string') return fallback;
  const n = Number(v.trim());
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
}

function toMoney(v: FormDataEntryValue | null): number | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  const n = Number(t.replace(',', '.'));
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : null;
}

function s(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v : '';
}

/* -------------------- CREATE -------------------- */

export async function createService(formData: FormData): Promise<void> {
  const name = s(formData.get('name')).trim();
  const rawSlug = s(formData.get('slug')).trim();
  const descriptionStr = s(formData.get('description')).trim();
  const description = descriptionStr ? descriptionStr : null;

  const kind = s(formData.get('kind')) === 'service' ? 'service' : 'category';
  // чекбокс: если ключ присутствует — true, если нет — false
  const isActive = formData.has('isActive');

  const slug = rawSlug ? slugify(rawSlug) : slugify(name || 'service');

  let parentId: string | null = null;
  let durationMin = 0;
  let priceCents: number | null = null;

  if (kind === 'service') {
    const p = s(formData.get('parentId')).trim();
    parentId = p || null;
    durationMin = toInt(formData.get('durationMin'), 0);
    priceCents = toMoney(formData.get('price'));
  }

  if (!name) {
    revalidatePath('/admin/services');
    return;
  }

  await prisma.service.create({
    data: {
      name,
      slug,
      description,
      isActive,
      durationMin, // 0 для категории
      priceCents,  // null для категории
      parentId,    // null для категории
    },
  });

  revalidatePath('/admin/services');
}

/* -------------------- UPDATE -------------------- */

export async function updateService(formData: FormData): Promise<void> {
  const id = s(formData.get('id')).trim();
  if (!id) {
    revalidatePath('/admin/services');
    return;
  }

  const kind = s(formData.get('kind')) === 'service' ? 'service' : 'category';

  // читаем «как есть» из текущей формы
  const nameRaw = s(formData.get('name'));
  const name = nameRaw.trim() || undefined;

  const rawSlug = s(formData.get('slug'));
  const slug = rawSlug.trim() ? slugify(rawSlug) : undefined;

  const descriptionRaw = s(formData.get('description'));
  const description =
    descriptionRaw === '' ? null : (descriptionRaw ?? undefined);

  // чекбокс: если поля нет в форме — галка снята
  const isActive = formData.has('isActive');

  let parentId: string | null | undefined = undefined;
  let durationMin: number | undefined = undefined;
  let priceCents: number | null | undefined = undefined;

  if (kind === 'category') {
    parentId = null;
    durationMin = 0;
    priceCents = null;
  } else {
    const p = s(formData.get('parentId')).trim();
    parentId = p ? p : null;

    durationMin = toInt(formData.get('durationMin'), 0);
    priceCents = toMoney(formData.get('price'));
  }

  // защита от самоссылки
  if (parentId) {
    const current = await prisma.service.findUnique({
      where: { id },
      select: { parentId: true },
    });
    if (parentId === id) {
      parentId = current?.parentId ?? null;
    }
  }

  await prisma.service.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(description !== undefined ? { description } : {}),
      isActive, // всегда обновляем из чекбокса текущей формы
      ...(parentId !== undefined ? { parentId } : {}),
      ...(durationMin !== undefined ? { durationMin } : {}),
      ...(priceCents !== undefined ? { priceCents } : {}),
    },
  });

  revalidatePath('/admin/services');
}

/* -------------------- DELETE -------------------- */

/**
 * Полное удаление услуги/категории:
 * 1) Собираем id самой услуги и всех её потомков (многоуровнево).
 * 2) Удаляем Appointment по этим serviceId.
 * 3) Удаляем сначала детей, затем саму услугу.
 */
export async function deleteService(formData: FormData): Promise<void> {
  const id = s(formData.get('id')).trim();
  if (!id) return;

  await prisma.$transaction(async (tx) => {
    const toDelete = new Set<string>([id]);
    let frontier: string[] = [id];

    while (frontier.length > 0) {
      const children = await tx.service.findMany({
        where: { parentId: { in: frontier } },
        select: { id: true },
      });
      const next: string[] = [];
      for (const c of children) {
        if (!toDelete.has(c.id)) {
          toDelete.add(c.id);
          next.push(c.id);
        }
      }
      frontier = next;
    }

    const ids = Array.from(toDelete);
    const childIds = ids.filter((sid) => sid !== id);

    await tx.appointment.deleteMany({ where: { serviceId: { in: ids } } });

    if (childIds.length > 0) {
      await tx.service.deleteMany({ where: { id: { in: childIds } } });
    }
    await tx.service.delete({ where: { id } });
  });

  revalidatePath('/admin/services');
}









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
