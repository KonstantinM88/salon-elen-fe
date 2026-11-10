'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { assertAdmin } from '@/lib/rbac-guards';
import { prisma } from '@/lib/db';
import { GIFT_STATUSES } from '@/lib/gutschein';
import { notifyGiftRequest } from '@/lib/gutschein-notifications';

const updateSchema = z.object({
  id: z.string().uuid(), status: z.enum(GIFT_STATUSES), note: z.string().trim().max(1000),
  locale: z.enum(['de', 'en', 'ru']),
});

export async function updateGiftRequest(form: FormData): Promise<void> {
  await assertAdmin();
  const data = updateSchema.parse({ id: form.get('id'), status: form.get('status'), note: form.get('note'), locale: form.get('locale') });
  await prisma.giftVoucherRequest.update({ where: { id: data.id }, data: { status: data.status, adminNote: data.note } });
  revalidatePath('/admin/gutscheine');
  redirect(`/admin/gutscheine?lang=${data.locale}&saved=1`);
}

export async function retryGiftNotification(form: FormData): Promise<void> {
  await assertAdmin();
  const id = z.string().uuid().parse(form.get('id'));
  const locale = z.enum(['de', 'en', 'ru']).parse(form.get('locale'));
  const order = await prisma.giftVoucherRequest.findUniqueOrThrow({ where: { id } });
  const ok = order.notifiedAt ? true : await notifyGiftRequest(order);
  revalidatePath('/admin/gutscheine');
  redirect(`/admin/gutscheine?lang=${locale}&notification=${ok ? 'sent' : 'failed'}`);
}
