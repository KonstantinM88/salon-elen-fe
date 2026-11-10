import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { GiftVoucherRequest, GiftVoucherStatusEvent } from './prisma-client';

// No environment loading, real database, email or Telegram in this suite.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.TELEGRAM_ADMIN_CHAT_ID = '101,202';
process.env.TELEGRAM_BOT_TOKEN = '';
process.env.RESEND_API_KEY = '';
const instant = new Date('2026-11-10T12:00:00Z');
let order: GiftVoucherRequest;
let event: GiftVoucherStatusEvent;
let failCompare = false;
let eventsCreated = 0;
function reset() {
  failCompare = false; eventsCreated = 0;
  order = { id: '800b4c99-692d-4b7b-b5e6-9186981585ce', reference: 'ELEN-TEST', amountCents: 10000,
    locale: 'de', buyerName: 'Test', email: 'test@example.invalid', phone: '+49 177 8995106',
    recipientName: '', senderName: '', message: '', delivery: 'EMAIL', designKey: 'ginkgo', status: 'NEW',
    adminNote: 'PRIVATE INTERNAL NOTE', consentAt: instant, consentVersion: 'v1', notifiedAt: null, receiptSentAt: null,
    createdAt: instant, updatedAt: instant,
  };
  event = { id: '900b4c99-692d-4b7b-b5e6-9186981585ce', requestId: order.id, previousStatus: 'NEW', status: 'CONTACTED',
    createdById: 'admin-test', createdAt: instant, clientNotifiedAt: null, adminChatIds: ['101', '202'],
    adminDeliveredChatIds: [], adminNotifiedAt: null, deliveryLockedUntil: null, deliveryLockToken: null,
  };
}
reset();
const db = {
  giftVoucherRequest: {
    findUniqueOrThrow: async () => ({ ...order }),
    updateMany: async ({ data }: { data: Partial<GiftVoucherRequest> }) => {
      if (failCompare) return { count: 0 };
      order = { ...order, ...data }; return { count: 1 };
    },
  },
  giftVoucherStatusEvent: {
    create: async ({ data }: { data: Partial<GiftVoucherStatusEvent> }) => { eventsCreated++; event = { ...event, ...data }; return { ...event }; },
    findUniqueOrThrow: async () => ({ ...event, request: { ...order } }),
    update: async ({ data }: { data: Partial<GiftVoucherStatusEvent> }) => { event = { ...event, ...data }; return { ...event }; },
    updateMany: async ({ where, data }: { where: { OR?: unknown; deliveryLockToken?: string }; data: Partial<GiftVoucherStatusEvent> }) => {
      if (where.OR && event.deliveryLockedUntil && event.deliveryLockedUntil > new Date()) return { count: 0 };
      if (where.deliveryLockToken && where.deliveryLockToken !== event.deliveryLockToken) return { count: 0 };
      event = { ...event, ...data }; return { count: 1 };
    },
  },
};
const prismaMock = { ...db, $transaction: async (callback: (tx: typeof db) => Promise<unknown>) => callback(db) };
(globalThis as unknown as { prisma: unknown }).prisma = prismaMock;
const { changeGiftStatus, GiftRequestConflict } = await import('./gutschein-status');
const { deliverGiftStatus, giftStatusMessage } = await import('./gutschein-status-notifications');

test('only a real status transition creates a durable event; a note edit does not notify', async () => {
  reset();
  const input = { id: order.id, status: 'NEW' as const, note: 'private', actorId: 'admin-test', expectedUpdatedAt: instant };
  assert.equal(await changeGiftStatus(input), null);
  assert.equal(eventsCreated, 0);
  const changed = await changeGiftStatus({ ...input, status: 'CONTACTED' });
  assert.equal(changed?.previousStatus, 'NEW');
  assert.equal(changed?.status, 'CONTACTED');
  assert.deepEqual(changed?.adminChatIds, ['101', '202']);
  assert.equal(order.status, 'CONTACTED');
  assert.equal(eventsCreated, 1);
  assert.equal(await changeGiftStatus({ ...input, status: 'CONTACTED' }), null);
  assert.equal(eventsCreated, 1);
});

test('stale forms and concurrent compare-and-swap conflicts cannot overwrite the request', async () => {
  reset();
  const input = { id: order.id, status: 'CANCELED' as const, note: '', actorId: 'admin-test', expectedUpdatedAt: new Date(0) };
  await assert.rejects(changeGiftStatus(input), GiftRequestConflict);
  failCompare = true;
  await assert.rejects(changeGiftStatus({ ...input, expectedUpdatedAt: instant }), GiftRequestConflict);
  assert.equal(eventsCreated, 0);
  assert.equal(order.status, 'NEW');
});

test('email and each Telegram admin are acknowledged independently; retry skips delivered channels', async () => {
  reset();
  let emailCalls = 0;
  const telegramCalls: string[] = [];
  const first = await deliverGiftStatus(event.id, {
    email: async () => { emailCalls++; return true; },
    telegram: async (_, chatId) => { telegramCalls.push(chatId); return chatId === '101'; },
  });
  assert.equal(first, false);
  assert.ok(event.clientNotifiedAt);
  assert.equal(event.adminNotifiedAt, null);
  assert.deepEqual(event.adminDeliveredChatIds, ['101']);
  assert.equal(event.deliveryLockToken, null);
  const retry = await deliverGiftStatus(event.id, {
    email: async () => { emailCalls++; throw new Error('Do not resend'); },
    telegram: async (_, chatId) => { telegramCalls.push(chatId); return true; },
  });
  assert.equal(retry, true);
  assert.equal(emailCalls, 1);
  assert.deepEqual(telegramCalls, ['101', '202', '202']);
  assert.ok(event.adminNotifiedAt);
});

test('provider failure preserves pending email and still notifies Telegram; active delivery lease prevents duplicate sends', async () => {
  reset();
  let calls = 0;
  const providers = { email: async () => { calls++; throw new Error('Provider unavailable'); }, telegram: async () => true };
  assert.equal(await deliverGiftStatus(event.id, providers), false);
  assert.equal(event.clientNotifiedAt, null);
  assert.ok(event.adminNotifiedAt);
  event.deliveryLockedUntil = new Date(Date.now() + 60_000);
  assert.equal(await deliverGiftStatus(event.id, providers), false);
  assert.equal(calls, 1);
});

test('all status emails are localized, identify the design, and never expose an internal note or claim payment', () => {
  reset();
  for (const locale of ['de', 'en', 'ru']) for (const status of ['NEW', 'CONTACTED', 'COMPLETED', 'CANCELED']) {
    const message = giftStatusMessage({ ...event, status, request: { ...order, locale } });
    assert.ok(message.text.includes(order.reference));
    assert.equal(message.text.includes(order.adminNote), false);
    assert.match(message.text, /100/);
    assert.match(message.text, /Ginkgo|Гинкго/);
    assert.ok(message.subject);
  }
});
