import assert from 'node:assert/strict';
import test from 'node:test';
import { BookingClientSchema } from './booking-schema';
import { BookingSchema } from './validation/booking';
import { articleInput } from './validators';

const booking = {
  serviceSlug: 'apparative-pedikuere', dateISO: '2026-11-25',
  startMin: 480, endMin: 505, masterId: 'cm123456789012345678901234',
  name: ' Test Customer ', phone: '+49 177 1234567',
  email: ' customer@example.com ', birthDate: '1990-01-01',
};

test('booking validation keeps real duration, contact normalization and optional defaults', () => {
  const parsed = BookingSchema.parse(booking);
  assert.equal(parsed.endMin - parsed.startMin, 25);
  assert.equal(parsed.name, 'Test Customer');
  assert.equal(parsed.email, 'customer@example.com');
  const client = BookingClientSchema.parse(booking);
  assert.equal(client.referral, '');
  assert.equal(client.notes, '');
  assert.equal(client.birthDate, '1990-01-01');
});

test('booking validation rejects malformed contacts, underage dates and invalid references', () => {
  for (const change of [{ email: 'invalid' }, { phone: 'abc' }, { birthDate: 'invalid' },
    { birthDate: '2090-01-01' }, { referral: 'invented' }]) {
    assert.equal(BookingClientSchema.safeParse({ ...booking, ...change }).success, false);
  }
  for (const change of [{ masterId: '' }, { startMin: -1 }, { endMin: 0 }, { startMin: 480.5 }]) {
    assert.equal(BookingSchema.safeParse({ ...booking, ...change }).success, false);
  }
});

const article = {
  type: 'ARTICLE', title: 'Fußpflege in Halle', slug: 'fusspflege-halle',
  body: 'Information about foot care in Halle and booking an appointment.'.repeat(2),
};

test('article validation keeps Prisma enum, nullable fields and gallery limits', () => {
  const parsed = articleInput.parse({ ...article, excerpt: null, publishedAt: null,
    galleryImages: ['/images/1.webp', '/images/2.webp'] });
  assert.equal(parsed.type, 'ARTICLE');
  assert.equal(parsed.publishedAt, null);
  assert.equal(parsed.galleryImages?.length, 2);
  assert.equal(articleInput.safeParse({ ...article, type: 'invented' }).success, false);
  assert.equal(articleInput.safeParse({ ...article, galleryImages: Array(5).fill('/image.webp') }).success, false);
  assert.equal(articleInput.safeParse({ ...article, publishedAt: 'not-a-date' }).success, false);
});

test('invalid form fields expose structured errors rather than throwing during safeParse', () => {
  const result = articleInput.safeParse({ ...article, title: '', galleryImages: [123] });
  assert.equal(result.success, false);
  if (result.success) return;
  assert.ok(result.error.issues.some(issue => issue.path[0] === 'title'));
  assert.ok(result.error.issues.some(issue => issue.path[0] === 'galleryImages'));
  assert.ok(result.error.format().title?._errors.length);
});
