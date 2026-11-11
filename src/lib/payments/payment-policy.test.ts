import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { NextRequest } from 'next/server';
import { PAYMENT_OPTIONS, isPaymentMethodAvailable } from './config';
import { onlinePaymentGuard } from './online-payment-guard';
import { translate } from '@/i18n/messages';

// No .env, real customer data, payment credentials, DB or notifications in tests.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.STRIPE_SECRET_KEY = '';
process.env.PAYPAL_CLIENT_ID = '';
process.env.PAYPAL_CLIENT_SECRET = '';
process.env.TELEGRAM_BOT_TOKEN = '';
process.env.TELEGRAM_ADMIN_CHAT_ID = '';
process.env.RESEND_API_KEY = '';
let reads = 0;
let writes = 0;
let note = '';
const appointment = {
  id: 'test-appointment', serviceId: 'test-service', status: 'PENDING',
  paymentStatus: 'PENDING', customerName: 'Test Customer', email: '', phone: '',
  masterId: 'test-master', locale: 'de', bookingMethod: 'WEB',
  startAt: new Date('2026-11-25T09:00:00Z'), endAt: new Date('2026-11-25T09:25:00Z'),
  service: { name: 'Test service', parent: null }, master: { name: 'Test master' },
};
const dbStub = {
  appointment: {
    findUnique: async () => { reads++; return { ...appointment, notes: note }; },
    update: async ({ data }: { data: Record<string, unknown> }) => {
      writes++;
      assert.equal('paymentStatus' in data, false, 'onsite confirmation must not mark an appointment paid');
      note = String(data.notes);
      return { ...appointment, notes: note };
    },
  },
  service: { findUnique: async () => { reads++; return { name: 'Test service', priceCents: 2500 }; } },
  $queryRaw: async () => [],
  $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(dbStub),
};
(globalThis as unknown as { prisma: unknown }).prisma = dbStub;
const { POST: stripe } = await import('../../app/api/payment/create-stripe-intent/route');
const { POST: paypal } = await import('../../app/api/payment/create-paypal-order/route');
const { POST: capture } = await import('../../app/api/payment/capture-paypal-order/route');
const { POST: chooseMethod } = await import('../../app/api/booking/payment/route');
const { POST: confirmOnsite } = await import('../../app/api/booking/confirm-onsite-payment/route');

function request(body: string) {
  return new NextRequest('http://localhost/api/payment/test', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body,
  });
}

test('onsite is the only available choice while online payment is paused', () => {
  assert.equal(PAYMENT_OPTIONS.onlineEnabled, false);
  for (const method of ['onsite', 'cash'] as const) assert.equal(isPaymentMethodAvailable(method), true);
  for (const method of ['stripe', 'paypal', 'card'] as const) assert.equal(isPaymentMethodAvailable(method), false);
});

test('provider routes reject before parsing, database work or provider requests', async () => {
  const network = mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected external request'); });
  try {
    for (const handler of [stripe, paypal, capture]) {
      const req = request('{invalid-json');
      const response = await handler(req);
      assert.equal(response.status, 503);
      assert.equal((await response.json()).code, 'ONLINE_PAYMENTS_DISABLED');
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(req.bodyUsed, false);
    }
    for (const paymentMethod of ['card', 'paypal']) {
      const response = await chooseMethod(request(JSON.stringify({ appointmentId: appointment.id, paymentMethod })));
      assert.equal(response.status, 503);
      assert.equal((await response.json()).code, 'ONLINE_PAYMENTS_DISABLED');
    }
    assert.equal(reads, 0);
    assert.equal(writes, 0);
    assert.equal(network.mock.callCount(), 0);
  } finally { mock.restoreAll(); }
});

test('onsite confirmation remains available, unpaid and idempotent', async () => {
  const network = mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected external request'); });
  try {
    const response = await confirmOnsite(request(JSON.stringify({ appointmentId: appointment.id })));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).success, true);
    assert.match(note, /Клиент выбрал оплату в салоне/);
    assert.equal(writes, 1);
    const duplicate = await confirmOnsite(request(JSON.stringify({ appointmentId: appointment.id })));
    assert.equal((await duplicate.json()).alreadyConfirmed, true);
    assert.equal(writes, 1);
    assert.equal(network.mock.callCount(), 0);
  } finally { mock.restoreAll(); }
});

test('integrations can be restored with the shared switch', () => {
  const testOptions = PAYMENT_OPTIONS as { onlineEnabled: boolean };
  try {
    testOptions.onlineEnabled = true;
    assert.equal(onlinePaymentGuard(), null);
    for (const method of ['onsite', 'cash', 'stripe', 'card', 'paypal'] as const) {
      assert.equal(isPaymentMethodAvailable(method), true);
    }
  } finally { testOptions.onlineEnabled = false; }
});

test('the legacy cash choice remains available without recording a payment', async () => {
  const response = await chooseMethod(request(JSON.stringify({ appointmentId: appointment.id, paymentMethod: 'cash' })));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.match(note, /cash/);
});

test('the paused payment explanation is available in DE/EN/RU', () => {
  for (const locale of ['de', 'en', 'ru'] as const) {
    for (const key of ['booking_payment_onsite_subtitle', 'booking_payment_online_paused',
      'booking_payment_temporarily_unavailable', 'booking_payment_onsite_how_works'] as const) {
      assert.ok(translate(locale, key).length > 5);
      assert.notEqual(translate(locale, key), key);
    }
  }
});
