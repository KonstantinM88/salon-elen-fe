import assert from 'node:assert/strict';
import test from 'node:test';
import { giftAmount, giftRequestSchema } from './gutschein';
import { giftCopy } from './gutschein-copy';
import { GIFT_DESIGN_KEYS, giftDesigns } from './gutschein-designs';
import { giftDetailsCopy, giftFaq } from './gutschein-details-copy';

const input = {
  requestId: '800b4c99-692d-4b7b-b5e6-9186981585ce', locale: 'de', amount: 100,
  buyerName: 'Test Buyer', email: 'test@example.invalid', phone: '+49 177 8995106',
  recipientName: '', senderName: '', message: '', delivery: 'EMAIL', consent: true, website: '',
};

test('request accepts boundary amounts and normalises contact details', () => {
  for (const amount of [25, 100, 500]) {
    const result = giftRequestSchema.parse({ ...input, amount, buyerName: ' Test Buyer ', email: ' TEST@example.invalid ' });
    assert.equal(result.amount * 100, amount * 100);
    assert.equal(result.buyerName, 'Test Buyer');
    assert.equal(result.email, 'test@example.invalid');
  }
});

test('request rejects invalid financial values, missing consent and honeypot submissions', () => {
  for (const amount of [24, 501, 25.5, -1, NaN, Infinity, '100']) {
    assert.equal(giftRequestSchema.safeParse({ ...input, amount }).success, false);
  }
  for (const change of [ { consent: false }, { consent: undefined }, { website: 'spam' },
    { email: 'invalid' }, { requestId: 'invalid' }, { delivery: 'POST' }, { message: 'x'.repeat(501) },
    { buyerName: 'A\u0000B' }, { amountCents: 1 },
  ]) assert.equal(giftRequestSchema.safeParse({ ...input, ...change }).success, false);
});

test('request accepts international phone formats and rejects arbitrary phone text', () => {
  for (const phone of ['+49 177 899 51 06', '0177/8995106', '+44 (0)20 1234 5678']) {
    assert.equal(giftRequestSchema.safeParse({ ...input, phone }).success, true);
  }
  for (const phone of ['', '   ', '---()/', '12345', '+1234567890123456', 'send a message']) {
    assert.equal(giftRequestSchema.safeParse({ ...input, phone }).success, false);
  }
  assert.equal(giftRequestSchema.safeParse({ ...input, phone: undefined }).success, false);
});

test('all four designs have localized names and invalid designs are rejected', () => {
  for (const designKey of GIFT_DESIGN_KEYS) {
    assert.equal(giftRequestSchema.parse({ ...input, designKey }).designKey, designKey);
    for (const locale of ['de', 'en', 'ru'] as const) assert.ok(giftDesigns[designKey].names[locale]);
  }
  assert.equal(giftRequestSchema.parse(input).designKey, 'orchid');
  assert.equal(giftRequestSchema.safeParse({ ...input, designKey: '../secret' }).success, false);
});

test('all locales explain request fulfilment and expose the same FAQ structure', () => {
  for (const locale of ['de', 'en', 'ru'] as const) {
    assert.ok(giftCopy[locale].note);
    assert.ok(giftCopy[locale].emailNotSent);
    assert.equal(giftCopy[locale].faq.length, 4);
    assert.equal(giftFaq(locale).length, 6);
    assert.equal(giftDetailsCopy[locale].treatments.length, 4);
    for (const status of ['NEW', 'CONTACTED', 'COMPLETED', 'CANCELED']) assert.ok(giftDetailsCopy[locale].statusMessages[status]);
    assert.equal(Object.keys(giftCopy[locale].statuses).length, 4);
    assert.match(giftAmount(10000, locale), /100/);
  }
});
