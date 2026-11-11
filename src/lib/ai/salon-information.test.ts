import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Locale } from '@/i18n/locales';
import { giftFaq } from '@/lib/gutschein-details-copy';
import { GIFT_AMOUNTS } from '@/lib/gutschein';
import { giftDesigns, GIFT_DESIGN_KEYS } from '@/lib/gutschein-designs';
import { translate } from '@/i18n/messages';
import { PAYMENT_OPTIONS } from '@/lib/payments/config';
import { buildSalonFaqMenuText } from './salon-assistant-content';
import { buildSystemPrompt } from './system-prompt';
import { safeAssistantOptionUrl } from './option-url';
import { buildInformationMenu, getFootAssistantFaq, getGiftAssistantFaq, resolveSalonInformation } from './salon-information';

const locales: Locale[] = ['de', 'en', 'ru'];
const history = (content: string) => ({ chatHistory: [{ role: 'assistant' as const, content, timestamp: Date.now() }] });

for (const locale of locales) {
  test(`${locale}: gift answers reuse public FAQ, all designs and actual form choices`, () => {
    const entries = getGiftAssistantFaq(locale);
    assert.equal(entries.length, 13);
    assert.equal(new Set(entries.map(item => item.id)).size, entries.length);
    for (const [q, a] of giftFaq(locale)) {
      assert.ok(entries.some(item => item.q === q && item.a.startsWith(a)));
    }
    const design = entries.find(item => item.id === 'design')!.a;
    for (const key of GIFT_DESIGN_KEYS) assert.ok(design.includes(giftDesigns[key].names[locale]));
    const amount = entries.find(item => item.id === 'amount')!.a;
    for (const value of GIFT_AMOUNTS) assert.ok(amount.includes(String(value)));
    assert.ok(amount.includes('500'));
    for (const item of entries) {
      const result = resolveSalonInformation(item.q, locale);
      assert.equal(result?.topic, 'gutschein', item.q);
      assert.ok(result?.text.includes(item.a), item.q);
      assert.ok(result?.text.includes(`/gutschein?lang=${locale}#gestalten`));
    }
  });

  test(`${locale}: all foot FAQ buttons are answered or delegated to live prices`, () => {
    const entries = getFootAssistantFaq(locale);
    assert.equal(entries.length, 17);
    assert.equal(new Set(entries.map(item => item.id)).size, entries.length);
    for (const item of entries) {
      const result = resolveSalonInformation(item.q, locale);
      if (item.id === 'price') {
        assert.equal(result, null);
      } else {
        assert.equal(result?.topic, 'foot-care', item.q);
        assert.ok(result?.text.includes(item.a), item.q);
        assert.ok(result?.text.includes(`/fusspflege-halle?lang=${locale}`));
      }
    }
    assert.equal(entries.find(item => item.id === 'payment')?.a,
      translate(locale, PAYMENT_OPTIONS.onlineEnabled ? 'booking_payment_hero_subtitle' : 'booking_payment_online_paused'));
    assert.doesNotMatch(entries.map(item => item.a).join('\n'), /podolog|podiatr|подолог|\d+\s*(€|EUR|минут|minutes)/i);
  });

  test(`${locale}: both FAQ pages expose every entry with localized clickable destinations`, () => {
    for (const topic of ['gutschein', 'foot-care'] as const) {
      const entries = topic === 'gutschein' ? getGiftAssistantFaq(locale) : getFootAssistantFaq(locale);
      const first = buildInformationMenu(topic, locale);
      const more = buildInformationMenu(topic, locale, true);
      for (const [i, entry] of entries.entries()) {
        assert.ok((i < 8 ? first : more).includes(`[option] ${entry.q} [/option]`));
        assert.ok(!(i < 8 ? more : first).includes(`[option] ${entry.q} [/option]`));
      }
      const paths = [...first.matchAll(/\[option url="([^"]+)"\]/g)];
      assert.equal(paths.length, 1);
      assert.equal(safeAssistantOptionUrl(paths[0][1]), paths[0][1]);
    }
    const salonMenu = buildSalonFaqMenuText(locale);
    assert.match(salonMenu, /🎁/);
    assert.match(salonMenu, /🦶/);
  });

  test(`${locale}: GPT context includes current policies, all FAQ and no invented voucher capabilities`, () => {
    const prompt = buildSystemPrompt(locale);
    for (const entry of [...getGiftAssistantFaq(locale), ...getFootAssistantFaq(locale)]) {
      assert.ok(prompt.includes(entry.a), entry.q);
    }
    assert.ok(prompt.includes(`/gutschein?lang=${locale}#gestalten`));
    assert.match(prompt, /No tool here performs these operations/);
    assert.match(prompt, /Use list_services for every concrete treatment offer/);
    assert.match(prompt, /prompt medical assessment/);
  });
}

test('locales keep the same gift and foot-care coverage', () => {
  for (const locale of locales.slice(1)) {
    assert.deepEqual(getGiftAssistantFaq(locale).map(item => item.id), getGiftAssistantFaq('de').map(item => item.id));
    assert.deepEqual(getFootAssistantFaq(locale).map(item => item.id), getFootAssistantFaq('de').map(item => item.id));
  }
});

test('free-form multilingual voucher questions and contextual follow-ups are routed without booking', () => {
  for (const [locale, question, id] of [
    ['de', 'Welche Farben hat der Gutschein?', 'design'],
    ['en', 'How much is a gift voucher?', 'amount'],
    ['ru', 'Как отменить заявку на сертификат?', 'change'],
    ['ru', 'Какой статус у моего сертификата?', 'status'],
    ['en', 'Can I receive a gift voucher immediately?', 'urgent'],
    ['de', 'Brauche ich eine Telefonnummer für einen Gutschein?', 'fields'],
    ['ru', 'Сертификат на педикюр', 'treatment'],
  ] as const) {
    const result = resolveSalonInformation(question, locale);
    assert.ok(result, question);
    assert.ok(result.text.includes(getGiftAssistantFaq(locale).find(item => item.id === id)!.a), question);
    assert.doesNotMatch(result.text, /option url="\/booking/);
  }
  const gift = history(buildInformationMenu('gutschein', 'ru'));
  assert.ok(resolveSalonInformation('Какая сумма?', 'ru', gift)?.text.includes('500'));
  assert.equal(resolveSalonInformation('да', 'ru', gift), null);
  assert.equal(resolveSalonInformation('123456', 'ru', gift), null);
  assert.equal(resolveSalonInformation('Как подготовиться?', 'ru', history(buildInformationMenu('foot-care', 'ru')))?.topic, 'foot-care');
  assert.equal(resolveSalonInformation('Как часто?', 'ru', { consultationServiceTitle: 'Аппаратный педикюр' })?.topic, 'foot-care');
});

test('prices, dates, durations and ordinary booking intent remain with live tools', () => {
  for (const [locale, message] of [
    ['ru', 'Сколько стоит педикюр?'], ['ru', 'Хочу записаться на педикюр завтра'],
    ['de', 'Was kostet Fußpflege?'], ['en', 'How long is a pedicure?'],
    ['en', 'Book a pedicure'], ['de', 'Pediküre Termin am 20. November'],
  ] as const) assert.equal(resolveSalonInformation(message, locale), null, message);
});

test('acute foot warnings take priority over booking and even combined gift questions', () => {
  for (const [locale, message] of [
    ['ru', 'Запишите на педикюр, вросший ноготь и гной'],
    ['ru', 'Хочу сертификат на педикюр при диабете'],
    ['de', 'Fußpflege buchen bei Diabetes'],
    ['en', 'Gift voucher for a pedicure with an ingrown nail'],
  ] as const) {
    const result = resolveSalonInformation(message, locale);
    assert.equal(result?.topic, 'foot-care', message);
    assert.match(result!.text, /врач|медицин|medizin|arzt|arztlich|ärzt|doctor|medical/i);
    assert.doesNotMatch(result!.text, /option url="\/booking|💅/);
  }
});

test('FAQ never consumes selected booking, registration, contact or OTP state', () => {
  const protectedStates: Array<Parameters<typeof resolveSalonInformation>[2]> = [
    { selectedServiceIds: ['service'] }, { selectedMasterId: 'master' },
    { reservedSlot: { startAt: '2026-11-12T10:00:00Z', endAt: '2026-11-12T11:00:00Z' } },
    { draftId: 'draft' }, { awaitingRegistrationMethod: true }, { awaitingVerificationMethod: true },
    { pendingVerificationMethod: 'email_otp' }, { activeVerificationMethod: 'sms_otp' },
  ];
  for (const state of protectedStates) {
    assert.equal(resolveSalonInformation('Gutschein FAQ', 'de', state), null);
    assert.equal(resolveSalonInformation('Как подготовиться к педикюру?', 'ru', state), null);
  }
});

test('assistant buttons accept only known same-site routes, preserving booking and locale', () => {
  assert.equal(safeAssistantOptionUrl('http://localhost:3000/booking/client?draftId=test', 'http://localhost:3000'), '/booking/client?draftId=test');
  for (const url of ['/gutschein?lang=ru#gestalten', '/fusspflege-halle?lang=en', '/booking/client?draftId=test',
    'https://permanent-halle.de/booking/client?draftId=test']) {
    assert.ok(safeAssistantOptionUrl(url));
  }
  for (const url of ['javascript:alert(1)', 'https://evil.example/booking/client', '//evil.example/gutschein',
    '/admin', '/gutschein-other', '/gutschein/../admin', '/booking/../../admin', '/\\evil.example/booking/client',
    'https://permanent-halle.de@evil.example/gutschein', '/gutschein\n']) {
    assert.equal(safeAssistantOptionUrl(url), undefined, url);
  }
});
