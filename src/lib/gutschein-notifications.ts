import { Resend } from 'resend';
import { prisma } from '@/lib/db';
import { sendTelegramAdminMessage } from '@/lib/telegram/sender';
import { getPublicBaseUrl } from '@/lib/public-url';
import type { Locale } from '@/i18n/locales';
import { giftCopy } from '@/lib/gutschein-copy';
import { giftAmount } from '@/lib/gutschein';
import type { GiftVoucherRequest } from '@/lib/prisma-client';
import { getGiftDesign } from '@/lib/gutschein-designs';
import { giftDetailsCopy } from '@/lib/gutschein-details-copy';

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

export async function notifyGiftRequest(order: GiftVoucherRequest): Promise<boolean> {
  const results = await sendTelegramAdminMessage([
    '🎁 Новая заявка на Gutschein (ещё не оплачена)',
    `№ ${order.reference} · ${giftAmount(order.amountCents)}`,
    `Клиент: ${order.buyerName}`, `E-mail: ${order.email}`, `Телефон: ${order.phone || '—'}`,
    `Получатель: ${order.recipientName || '—'}`, `От: ${order.senderName || '—'}`,
    `Пожелание: ${order.message || '—'}`,
    `Получение: ${order.delivery === 'PICKUP' ? 'Забрать в салоне' : 'Электронно (по согласованию)'}`,
    `Язык: ${order.locale.toUpperCase()}`,
    `Дизайн: ${getGiftDesign(order.designKey).names.ru}`,
    'Согласуйте оплату, условия и выдачу с клиентом.',
  ].join('\n'), {
    replyMarkup: { inline_keyboard: [[{ text: '🎁 Gutschein — админка', url: `${getPublicBaseUrl()}/admin/gutscheine` }]] },
  });
  const delivered = results.length > 0 && results.every(result => result.ok);
  if (delivered) {
    await prisma.giftVoucherRequest.update({ where: { id: order.id }, data: { notifiedAt: new Date() } });
  }
  return delivered;
}

export async function sendGiftReceipt(order: GiftVoucherRequest): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  const copy = giftCopy[order.locale as Locale] ?? giftCopy.de;
  const amount = giftAmount(order.amountCents, order.locale);
  const locale: Locale = order.locale === 'en' || order.locale === 'ru' ? order.locale : 'de';
  const design = getGiftDesign(order.designKey);
  const designLabel = `${giftDetailsCopy[locale].design}: ${design.names[locale]}`;
  const text = `${copy.success}\n\n${copy.reference}: ${order.reference}\n${amount}\n${designLabel}\n\n${copy.note}\n\nSalon Elen\nLessingstraße 37, 06114 Halle (Saale)\n+49 177 899 51 06`;
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.RESEND_FROM || 'Salon Elen <onboarding@resend.dev>',
    to: order.email,
    subject: `Salon Elen · ${copy.voucher} · ${order.reference}`,
    text,
    html: `<html lang="${locale}"><body style="margin:0;background:#f7eeeb;font-family:Arial,sans-serif;color:#34252d"><main style="max-width:560px;margin:30px auto;background:#fffaf6;padding:32px;border-radius:20px"><p style="letter-spacing:3px;color:#854958">SALON ELEN</p><h1>${escapeHtml(copy.successTitle)}</h1><p style="line-height:1.7">${escapeHtml(copy.success)}</p><div style="padding:24px;background:${design.background};border-radius:14px;color:${design.foreground}"><p>${escapeHtml(copy.reference)}</p><strong>${escapeHtml(order.reference)}</strong><p style="font-size:36px">${escapeHtml(amount)}</p><p>${escapeHtml(designLabel)}</p></div><p style="line-height:1.7">${escapeHtml(copy.note)}</p><p>Salon Elen · Lessingstraße 37 · Halle (Saale)<br>+49 177 899 51 06</p></main></body></html>`,
  }, { idempotencyKey: `gift-receipt/${order.id}` });
  if (result.error) return false;
  await prisma.giftVoucherRequest.update({ where: { id: order.id }, data: { receiptSentAt: new Date() } });
  return true;
}
