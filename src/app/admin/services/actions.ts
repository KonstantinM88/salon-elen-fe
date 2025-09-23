'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Вспомогалки парсинга
function toEuro(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? '').trim().replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}
function toInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? '').trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

// ВАЖНО: server actions возвращают void | Promise<void>

export async function createService(formData: FormData): Promise<void> {
  const title = String(formData.get('title') ?? '').trim();
  const slugRaw = String(formData.get('slug') ?? '').trim();
  const priceEuro = toEuro(formData.get('priceEuro'));
  const durationMin = toInt(formData.get('durationMin'));
  const description = (String(formData.get('description') ?? '').trim() || null) as string | null;

  if (!title || !priceEuro || !durationMin) {
    // Валидация провалена — просто ничего не делаем.
    return;
  }

  const slug = slugRaw ? slugify(slugRaw) : slugify(title);

  try {
    await prisma.service.create({
      data: {
        title,
        slug,
        priceCents: Math.round(priceEuro * 100),
        durationMin,
        description,
      },
    });
  } catch (e) {
    // В dev можно залогировать
    console.error('createService error:', e);
  } finally {
    revalidatePath('/admin/services');
  }
}

export async function updateService(formData: FormData): Promise<void> {
  const id = toInt(formData.get('id'));
  const title = String(formData.get('title') ?? '').trim();
  const slugRaw = String(formData.get('slug') ?? '').trim();
  const priceEuro = toEuro(formData.get('priceEuro'));
  const durationMin = toInt(formData.get('durationMin'));
  const description = (String(formData.get('description') ?? '').trim() || null) as string | null;

  if (!id || !title || !priceEuro || !durationMin) return;

  const slug = slugify(slugRaw || title);

  try {
    await prisma.service.update({
      where: { id },
      data: {
        title,
        slug,
        priceCents: Math.round(priceEuro * 100),
        durationMin,
        description,
      },
    });
  } catch (e) {
    console.error('updateService error:', e);
  } finally {
    revalidatePath('/admin/services');
  }
}

export async function deleteService(formData: FormData): Promise<void> {
  const id = toInt(formData.get('id'));
  if (!id) return;

  try {
    await prisma.service.delete({ where: { id } });
  } catch (e) {
    console.error('deleteService error:', e);
  } finally {
    revalidatePath('/admin/services');
  }
}
