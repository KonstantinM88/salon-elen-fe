import {
  HOME_FAQ,
  type HomeFaqItem,
  type HomeFaqLocale,
} from '@/lib/home-faq';

export type SalonAssistantLocale = 'de' | 'en' | 'ru';

function normalizeLocale(locale?: string): SalonAssistantLocale {
  if (locale === 'ru' || locale === 'en') return locale;
  return 'de';
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isSalonOverviewIntent(
  text: string,
  locale?: string,
): boolean {
  const value = normalizeText(text);
  if (!value) return false;

  const phrases: Record<SalonAssistantLocale, string[]> = {
    ru: [
      'расскажи о вас',
      'расскажите о вас',
      'расскажи о салоне',
      'расскажите о салоне',
      'что за салон',
      'кто вы',
      'о вас',
      'о салоне',
      'почему выбрать вас',
    ],
    en: [
      'tell me about you',
      'tell me about the salon',
      'about you',
      'about the salon',
      'who are you',
      'why choose you',
    ],
    de: [
      'erzählen sie über sich',
      'erzahlen sie uber sich',
      'erzählen sie mir vom salon',
      'erzahlen sie mir vom salon',
      'über sie',
      'uber sie',
      'über den salon',
      'uber den salon',
      'wer sind sie',
      'warum sie wählen',
      'warum sie waehlen',
    ],
  };

  return phrases[normalizeLocale(locale)].some((phrase) =>
    value.includes(normalizeText(phrase)),
  );
}

export function buildSalonOverviewText(locale?: string): string {
  const normalized = normalizeLocale(locale);

  if (normalized === 'ru') {
    return `Мы — **Salon Elen / Permanent Halle**, салон красоты в Paulusviertel в Галле 🌸

Наша сильная сторона — персональный подбор и естественный результат: перед процедурой мастер Elena спокойно обсуждает пожелания, проверяет кожу и согласовывает форму или оттенок. Консультация доступна на русском, немецком и английском, а я могу показать весь актуальный каталог, цены и свободное время.

Что для вас сейчас важнее — узнать больше о процедурах или подобрать услугу под желаемый результат?

[option] 💬 Подобрать услугу [/option]
[option] 💅 Все услуги и цены [/option]
[option] ❓ Частые вопросы [/option]
[option] 📍 Адрес и часы работы [/option]`;
  }

  if (normalized === 'en') {
    return `We are **Salon Elen / Permanent Halle**, a beauty salon in Halle's Paulusviertel district 🌸

Our focus is personal guidance and natural-looking results: before a treatment, Elena discusses your wishes, checks the skin, and agrees the shape or shade with you. Consultations are available in English, German, and Russian, and I can show you the complete current catalog, prices, and free appointments.

Would you rather learn more about a treatment or find the best service for your desired result?

[option] 💬 Help me choose [/option]
[option] 💅 All services and prices [/option]
[option] ❓ Frequently asked questions [/option]
[option] 📍 Location and hours [/option]`;
  }

  return `Wir sind **Salon Elen / Permanent Halle**, ein Beautysalon im Paulusviertel in Halle 🌸

Unser Fokus liegt auf persönlicher Beratung und natürlichen Ergebnissen: Vor der Behandlung bespricht Elena Ihre Wünsche, prüft die Haut und stimmt Form oder Farbton mit Ihnen ab. Die Beratung ist auf Deutsch, Russisch und Englisch möglich; ich zeige Ihnen gern den vollständigen aktuellen Katalog, Preise und freie Termine.

Möchten Sie mehr über eine Behandlung erfahren oder die passende Leistung für Ihr Wunschresultat finden?

[option] 💬 Passende Leistung finden [/option]
[option] 💅 Alle Leistungen und Preise [/option]
[option] ❓ Häufige Fragen [/option]
[option] 📍 Adresse und Öffnungszeiten [/option]`;
}

export function isSalonFaqMenuIntent(text: string, locale?: string): boolean {
  const value = normalizeText(text);
  if (!value) return false;

  const phrases: Record<SalonAssistantLocale, string[]> = {
    ru: ['частые вопросы', 'вопросы и ответы', 'faq', 'о салоне и faq'],
    en: ['frequently asked questions', 'common questions', 'questions and answers', 'faq'],
    de: ['häufige fragen', 'haufige fragen', 'fragen und antworten', 'faq'],
  };

  return phrases[normalizeLocale(locale)].some((phrase) =>
    value.includes(normalizeText(phrase)),
  );
}

export function findSalonFaqItem(
  text: string,
  locale?: string,
): HomeFaqItem | null {
  const normalizedLocale = normalizeLocale(locale) as HomeFaqLocale;
  const value = normalizeText(text);
  if (!value) return null;

  for (const item of HOME_FAQ[normalizedLocale].items) {
    const question = normalizeText(item.q);
    if (value === question || value.includes(question)) return item;
  }

  return null;
}

export function buildSalonFaqMenuText(locale?: string): string {
  const normalized = normalizeLocale(locale) as HomeFaqLocale;
  const faq = HOME_FAQ[normalized];
  const options = faq.items
    .map((item) => `[option] ${item.q} [/option]`)
    .join('\n');
  const ask =
    normalized === 'ru'
      ? 'Выберите вопрос или напишите свой — отвечу простыми словами и помогу с следующим шагом.'
      : normalized === 'en'
        ? 'Choose a question or write your own. I will explain it clearly and help with the next step.'
        : 'Wählen Sie eine Frage oder schreiben Sie Ihre eigene. Ich erkläre alles verständlich und helfe beim nächsten Schritt.';

  return `**${faq.title}** 🌸\n\n${faq.description}\n\n${options}\n\n${ask}`;
}

export function buildSalonFaqAnswerText(
  item: HomeFaqItem,
  locale?: string,
): string {
  const normalized = normalizeLocale(locale);
  const next =
    normalized === 'ru'
      ? '[option] 💬 Подобрать услугу [/option]\n[option] 💅 Актуальные услуги и цены [/option]\n[option] 📅 Записаться на приём [/option]\n[option] ❓ Частые вопросы [/option]'
      : normalized === 'en'
        ? '[option] 💬 Help me choose [/option]\n[option] 💅 Current services and prices [/option]\n[option] 📅 Book an appointment [/option]\n[option] ❓ Frequently asked questions [/option]'
        : '[option] 💬 Passende Leistung finden [/option]\n[option] 💅 Aktuelle Leistungen und Preise [/option]\n[option] 📅 Termin buchen [/option]\n[option] ❓ Häufige Fragen [/option]';

  return `**${item.q}**\n\n${item.a}\n\n${next}`;
}

export function buildSalonFaqSystemContext(locale?: string): string {
  const normalized = normalizeLocale(locale) as HomeFaqLocale;
  const faq = HOME_FAQ[normalized];
  const entries = faq.items
    .map((item, index) => `${index + 1}. ${item.q}\n   ${item.a}`)
    .join('\n');

  return `AKTUELLE WEBSITE-FAQ (sichtbarer Inhalt und gemeinsame Faktenbasis):
${entries}

Nutze diese Antworten für allgemeine Salonfragen. Bei konkreten Leistungen,
Preisen und Dauern hat der aktive list_services-Katalog immer Vorrang.`;
}
