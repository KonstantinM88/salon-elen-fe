import { z } from 'zod';

export const GIFT_AMOUNTS = [25, 50, 75, 100, 150, 200] as const;
export const GIFT_STATUSES = ['NEW', 'CONTACTED', 'COMPLETED', 'CANCELED'] as const;
export type GiftStatus = typeof GIFT_STATUSES[number];

const shortText = (max: number) => z.string().trim().max(max)
  .refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value));

export const giftRequestSchema = z.object({
  requestId: z.string().uuid(),
  locale: z.enum(['de', 'en', 'ru']),
  amount: z.number().int().min(25).max(500),
  buyerName: shortText(100).pipe(z.string().min(2)),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  phone: shortText(40).refine(value => value === '' || /^[+()\d\s./-]{6,40}$/.test(value)),
  recipientName: shortText(100),
  senderName: shortText(100),
  message: shortText(500),
  delivery: z.enum(['EMAIL', 'PICKUP']),
  consent: z.literal(true),
  website: z.string().max(0),
}).strict();

export type GiftRequestInput = z.infer<typeof giftRequestSchema>;

export function giftAmount(amountCents: number, locale = 'de'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
    .format(amountCents / 100);
}
