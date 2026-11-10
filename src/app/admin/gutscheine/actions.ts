'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { assertAdmin } from '@/lib/rbac-guards';
import { prisma } from '@/lib/db';
import { GIFT_STATUSES } from '@/lib/gutschein';
import { notifyGiftRequest } from '@/lib/gutschein-notifications';
import { changeGiftStatus, GiftRequestConflict } from '@/lib/gutschein-status';
import { deliverGiftStatus } from '@/lib/gutschein-status-notifications';

const updateSchema = z.object({
  id: z.string().uuid(), status: z.enum(GIFT_STATUSES), note: z.string().trim().max(1000),
  locale: z.enum(['de', 'en', 'ru']),
  updatedAt: z.string().datetime(),
});

export async function updateGiftRequest(form: FormData): Promise<void> {
  const admin = await assertAdmin();
  const data = updateSchema.parse({ id: form.get('id'), status: form.get('status'), note: form.get('note'), locale: form.get('locale'), updatedAt: form.get('updatedAt') });
  let event;
  try {
    event = await changeGiftStatus({ id: data.id, status: data.status, note: data.note, actorId: admin.user.id, expectedUpdatedAt: new Date(data.updatedAt) });
  } catch (error) {
    if (error instanceof GiftRequestConflict) redirect(`/admin/gutscheine?lang=${data.locale}&conflict=1`);
    throw error;
  }
  const delivered = event ? await deliverGiftStatus(event.id).catch(() => false) : true;
  revalidatePath('/admin/gutscheine');
  redirect(`/admin/gutscheine?lang=${data.locale}&saved=1${delivered ? '' : '&statusNotification=pending'}`);
}

export async function retryGiftStatusNotification(form: FormData): Promise<void> {
  await assertAdmin();
  const id = z.string().uuid().parse(form.get('eventId'));
  const locale = z.enum(['de', 'en', 'ru']).parse(form.get('locale'));
  const ok = await deliverGiftStatus(id).catch(() => false);
  revalidatePath('/admin/gutscheine');
  redirect(`/admin/gutscheine?lang=${locale}&notification=${ok ? 'sent' : 'failed'}`);
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
