import assert from 'node:assert/strict';
import test from 'node:test';
import { HOME_GIFT_COPY, homeGiftLinks } from './home-gutschein';

test('homepage gift section has complete DE/EN/RU copy and preserves non-binding fulfilment', () => {
  for (const locale of ['de', 'en', 'ru'] as const) {
    const copy = HOME_GIFT_COPY[locale];
    for (const value of Object.values(copy)) {
      if (typeof value === 'string') assert.ok(value.trim().length > 0);
    }
    assert.equal(copy.features.length, 3);
    assert.match(copy.features[0], /25.*500/);
    assert.match(copy.features[1], /4/);
    assert.match(copy.eyebrow, /HALLE \(SAALE\)/);
    assert.match(copy.note, /keine sofortige Zahlung|not an instant payment|без немедленной оплаты/);
  }
});

test('homepage gift links preserve language and take the primary CTA to the designer', () => {
  assert.deepEqual(homeGiftLinks('de'), { page: '/gutschein', create: '/gutschein#gestalten' });
  for (const locale of ['en', 'ru'] as const) {
    const links = homeGiftLinks(locale);
    assert.equal(links.page, `/gutschein?lang=${locale}`);
    assert.equal(links.create, `/gutschein?lang=${locale}#gestalten`);
  }
});
