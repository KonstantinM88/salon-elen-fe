import { randomUUID } from 'node:crypto';
import { Resend } from 'resend';
import type { Locale } from '@/i18n/locales';
import { prisma } from '@/lib/db';
import type { GiftVoucherRequest, GiftVoucherStatusEvent } from '@/lib/prisma-client';
import { sendTelegramMessage } from '@/lib/telegram/sender';
import { parseTelegramAdminChatIds } from '@/lib/telegram-admin-chat-ids';
import { getPublicBaseUrl } from '@/lib/public-url';
import { ORG_TZ } from '@/lib/orgTime';
import { giftCopy } from './gutschein-copy';
import { giftDetailsCopy } from './gutschein-details-copy';
import { giftAmount, type GiftStatus } from './gutschein';
import { getGiftDesign } from './gutschein-designs';

type EventWithRequest = GiftVoucherStatusEvent & { request: GiftVoucherRequest };

export function giftStatusMessage(event: EventWithRequest) {
  const order = event.request;
  const locale: Locale = order.locale === 'en' || order.locale === 'ru' ? order.locale : 'de';
  const t = giftCopy[locale];
  const detail = giftDetailsCopy[locale];
  const status = t.statuses[event.status as GiftStatus];
  const at = new Intl.DateTimeFormat(locale, { timeZone: ORG_TZ, dateStyle: 'medium', timeStyle: 'short' }).format(event.createdAt);
  return {
    subject: `Salon Elen · ${detail.statusSubject} · ${order.reference}`,
    text: [detail.statusIntro, `${t.reference}: ${order.reference}`,
      `${t.voucher}: ${giftAmount(order.amountCents, locale)}`,
      `${detail.design}: ${getGiftDesign(order.designKey).names[locale]}`,
      `${status} · ${at} (${ORG_TZ})`, detail.statusMessages[event.status], t.note,
      'Salon Elen · Lessingstraße 37 · 06114 Halle (Saale)',
      '+49 177 899 51 06 · elen69@web.de', `${getPublicBaseUrl()}/contacts?lang=${locale}`,
    ].join('\n\n'),
  };
}

async function emailStatus(event: EventWithRequest): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  const message = giftStatusMessage(event);
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.RESEND_FROM || 'Salon Elen <onboarding@resend.dev>',
    to: event.request.email, ...message,
  }, { idempotencyKey: `gift-status/${event.id}` });
  return !result.error && !!result.data?.id;
}

async function telegramStatus(event: EventWithRequest, chatId: string): Promise<boolean> {
  const order = event.request;
  const result = await sendTelegramMessage({ chatId, text: [
    '🎁 Изменён статус заявки на Gutschein',
    `№ ${order.reference} · ${giftAmount(order.amountCents)}`,
    `${giftCopy.ru.statuses[event.previousStatus as GiftStatus]} → ${giftCopy.ru.statuses[event.status as GiftStatus]}`,
    `Клиент: ${order.buyerName}`, `Телефон: ${order.phone || '—'}`, `E-mail: ${order.email}`,
    `Дизайн: ${getGiftDesign(order.designKey).names.ru}`,
    `Дата: ${new Intl.DateTimeFormat('ru', { timeZone: ORG_TZ, dateStyle: 'medium', timeStyle: 'short' }).format(event.createdAt)}`,
    'Статус обработки не подтверждает оплату или выдачу сертификата.',
  ].join('\n'), replyMarkup: { inline_keyboard: [[{ text: '🎁 Открыть заявку', url: `${getPublicBaseUrl()}/admin/gutscheine#${order.id}` }]] } });
  return result.ok;
}

/** Separate channel acknowledgements; retry only undelivered recipients. No new cron/polling. */
export async function deliverGiftStatus(eventId: string, providers = { email: emailStatus, telegram: telegramStatus }): Promise<boolean> {
  const token = randomUUID();
  const claimed = await prisma.giftVoucherStatusEvent.updateMany({
    where: { id: eventId, OR: [{ deliveryLockedUntil: null }, { deliveryLockedUntil: { lt: new Date() } }] },
    data: { deliveryLockToken: token, deliveryLockedUntil: new Date(Date.now() + 300_000) },
  });
  if (!claimed.count) return false;
  try {
    const event = await prisma.giftVoucherStatusEvent.findUniqueOrThrow({ where: { id: eventId }, include: { request: true } });
    const recipients = event.adminChatIds.length ? event.adminChatIds : parseTelegramAdminChatIds();
    if (!event.adminChatIds.length && recipients.length) {
      await prisma.giftVoucherStatusEvent.update({ where: { id: eventId }, data: { adminChatIds: recipients } });
    }
    const channels = [
      (async () => {
        if (!event.clientNotifiedAt && await providers.email(event)) {
          await prisma.giftVoucherStatusEvent.update({ where: { id: eventId }, data: { clientNotifiedAt: new Date() } });
        }
      })(),
      (async () => {
        if (event.adminNotifiedAt) return;
        const acknowledged = new Set(event.adminDeliveredChatIds);
        for (const chatId of recipients) {
          if (acknowledged.has(chatId)) continue;
          try {
            if (await providers.telegram(event, chatId)) {
              acknowledged.add(chatId);
              await prisma.giftVoucherStatusEvent.update({ where: { id: eventId }, data: { adminDeliveredChatIds: [...acknowledged] } });
            }
          } catch { /* Keep this recipient pending, but try the remaining admins. */ }
        }
        if (recipients.length && recipients.every(chatId => acknowledged.has(chatId))) {
          await prisma.giftVoucherStatusEvent.update({ where: { id: eventId }, data: { adminNotifiedAt: new Date() } });
        }
      })(),
    ];
    const results = await Promise.allSettled(channels);
    if (results.some(result => result.status === 'rejected')) console.warn('[Gutschein] Status notification pending', { eventId });
    const delivered = await prisma.giftVoucherStatusEvent.findUniqueOrThrow({ where: { id: eventId } });
    return !!delivered.clientNotifiedAt && !!delivered.adminNotifiedAt;
  } finally {
    await prisma.giftVoucherStatusEvent.updateMany({
      where: { id: eventId, deliveryLockToken: token },
      data: { deliveryLockedUntil: null, deliveryLockToken: null },
    });
  }
}
