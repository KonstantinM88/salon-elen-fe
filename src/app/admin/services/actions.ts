'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/* helpers */

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function toEuro(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? '').trim().replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
}
function toInt(value: FormDataEntryValue | null): number | null {
  const n = Number(String(value ?? '').trim());
  return Number.isInteger(n) && n > 0 ? n : null;
}

/* server actions: void | Promise<void> */

export async function createService(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim();
  const slugRaw = String(formData.get('slug') ?? '').trim();
  const priceEuro = toEuro(formData.get('priceEuro'));
  const durationMin = toInt(formData.get('durationMin'));

  if (!name || !priceEuro || !durationMin) return;

  const slug = slugRaw ? slugify(slugRaw) : slugify(name);

  try {
    await prisma.service.create({
      data: {
        name,
        slug,
        priceCents: Math.round(priceEuro * 100),
        durationMin,
      },
    });
  } catch (e) {
    console.error('createService error:', e);
  } finally {
    revalidatePath('/admin/services');
  }
}

export async function updateService(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim(); // cuid string
  const name = String(formData.get('name') ?? '').trim();
  const slugRaw = String(formData.get('slug') ?? '').trim();
  const priceEuro = toEuro(formData.get('priceEuro'));
  const durationMin = toInt(formData.get('durationMin'));

  if (!id || !name || !priceEuro || !durationMin) return;

  const slug = slugify(slugRaw || name);

  try {
    await prisma.service.update({
      where: { id },
      data: {
        name,
        slug,
        priceCents: Math.round(priceEuro * 100),
        durationMin,
      },
    });
  } catch (e) {
    console.error('updateService error:', e);
  } finally {
    revalidatePath('/admin/services');
  }
}

export async function deleteService(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '').trim(); // cuid string
  if (!id) return;

  try {
    await prisma.service.delete({ where: { id } });
  } catch (e) {
    console.error('deleteService error:', e);
  } finally {
    revalidatePath('/admin/services');
  }
}
