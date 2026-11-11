import type { Locale } from '@/i18n/locales';

type HomeGiftCopy = {
  eyebrow: string; title: string; accent: string; description: string;
  features: [string, string, string]; cta: string; details: string; note: string;
  cardTitle: string; cardMessage: string; collection: string; preview: string;
};

export const HOME_GIFT_COPY: Record<Locale, HomeGiftCopy> = {
  de: {
    eyebrow: 'BEAUTY-GUTSCHEIN · HALLE (SAALE)',
    title: 'Schönheit schenken.', accent: 'Von Herzen.',
    description: 'Zum Geburtstag, als Dankeschön oder einfach so: Schenken Sie einen persönlichen Beauty-Moment bei Salon Elen. Mit Ihrem Wunschbetrag, einem liebevollen Gruß und einem Design, das zu Ihrem Lieblingsmenschen passt.',
    features: ['25–500 € Wunschbetrag', '4 besondere Designs', 'Ihr persönlicher Gruß'],
    cta: 'Gutschein gestalten', details: 'Mehr über Gutscheine',
    note: 'Unverbindliche Anfrage, keine sofortige Zahlung. Zahlung und Übergabe stimmen wir persönlich mit Ihnen ab.',
    cardTitle: 'Gutschein', cardMessage: 'Ein Moment. Nur für dich.',
    collection: 'DIE ELEN GIFT COLLECTION', preview: 'Gestaltungsvorschau · noch kein gültiger Gutschein',
  },
  en: {
    eyebrow: 'BEAUTY GIFT VOUCHER · HALLE (SAALE)',
    title: 'Give a little beauty.', accent: 'With love.',
    description: 'For a birthday, a thank-you or just because: give someone a personal beauty moment at Salon Elen. Choose an amount, add a heartfelt message and find a design that feels just like them.',
    features: ['Your amount: €25–€500', '4 beautiful designs', 'Your personal message'],
    cta: 'Create a gift voucher', details: 'Explore gift vouchers',
    note: 'A non-binding request, not an instant payment. We arrange payment and handover with you personally.',
    cardTitle: 'Gift voucher', cardMessage: 'A moment. Just for you.',
    collection: 'THE ELEN GIFT COLLECTION', preview: 'Design preview · not a valid voucher',
  },
  ru: {
    eyebrow: 'ПОДАРОЧНЫЙ СЕРТИФИКАТ · HALLE (SAALE)',
    title: 'Подарите красоту.', accent: 'От всего сердца.',
    description: 'На день рождения, в благодарность или просто так: подарите близкому человеку время для себя в Salon Elen. Выберите сумму, добавьте тёплое пожелание и дизайн, который подойдёт именно ему.',
    features: ['Сумма от 25 до 500 €', '4 красивых дизайна', 'Ваше личное пожелание'],
    cta: 'Создать сертификат', details: 'Подробнее о сертификатах',
    note: 'Это заявка без немедленной оплаты. Оплату и получение мы согласуем с вами лично.',
    cardTitle: 'Сертификат', cardMessage: 'Момент. Только для тебя.',
    collection: 'ПОДАРОЧНАЯ КОЛЛЕКЦИЯ ELEN', preview: 'Предпросмотр · не является действующим сертификатом',
  },
};

export function homeGiftLinks(locale: Locale) {
  const page = `/gutschein${locale === 'de' ? '' : `?lang=${locale}`}`;
  return { page, create: `${page}#gestalten` };
}
