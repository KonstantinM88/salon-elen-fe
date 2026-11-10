import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

// Never load .env or connect to a live database in this test.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.TELEGRAM_ADMIN_CHAT_ID = '';
process.env.TELEGRAM_BOT_TOKEN = '';
process.env.RESEND_API_KEY = '';
const stored: Record<string, unknown>[] = [];
let existing: Record<string, unknown> | null = null;
let recentCount = 0;
let failWrite = false;
const dbStub = { giftVoucherRequest: {
  findUnique: async () => existing,
  count: async () => recentCount,
  create: async (args: { data: Record<string, unknown> }) => {
    if (failWrite) throw new Error('DB unavailable');
    stored.push(args.data);
    return { ...args.data, createdAt: new Date(), receiptSentAt: null };
  },
} };
(globalThis as unknown as { prisma: unknown }).prisma = dbStub;
const { POST } = await import('./route');

const data = {
  requestId: '800b4c99-692d-4b7b-b5e6-9186981585ce', locale: 'de', amount: 100,
  buyerName: 'Test Buyer', email: 'test@example.invalid', phone: '',
  recipientName: 'Recipient', senderName: '', message: '', delivery: 'EMAIL', consent: true, website: '',
};
let address = 1;
function request(payload: unknown, origin = 'http://localhost:3115') {
  return new Request('http://localhost:3115/api/gutschein', { method: 'POST',
    headers: { origin, 'Content-Type': 'application/json', 'x-real-ip': `192.0.2.${address++}` },
    body: JSON.stringify(payload),
  });
}

test('voucher request endpoint guards writes, persists before notification, and deduplicates retries', async () => {
  const network = mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected real network request'); });
  try {
    assert.equal((await POST(request(data, 'https://external.invalid'))).status, 403);
    assert.equal((await POST(request({ ...data, amount: 1 }))).status, 400);
    assert.equal(stored.length, 0);
    const response = await POST(request(data));
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.equal(result.ok, true);
    assert.equal(result.receiptSent, false);
    assert.equal(stored[0].amountCents, 10000);
    assert.equal(stored[0].email, data.email);
    assert.match(result.reference, /^ELEN-[0-9A-F]{12}$/);
    assert.equal('email' in result, false);
    existing = { ...stored[0], receiptSentAt: null };
    const duplicate = await POST(request(data));
    assert.equal(duplicate.status, 200);
    assert.equal((await duplicate.json()).reference, result.reference);
    assert.equal(stored.length, 1);
    existing = null;
    recentCount = 3;
    assert.equal((await POST(request(data))).status, 429);
    assert.equal(stored.length, 1);
    recentCount = 0;
    failWrite = true;
    const failed = await POST(request(data));
    assert.equal(failed.status, 503);
    assert.equal((await failed.json()).ok, undefined);
    assert.equal(network.mock.callCount(), 0);
  } finally {
    mock.restoreAll();
  }
});
