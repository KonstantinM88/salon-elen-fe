import type { Locale } from '@/i18n/locales';
import type { AiSession } from './session-store';
import { giftFaq, giftDetailsCopy } from '@/lib/gutschein-details-copy';
import { giftCopy } from '@/lib/gutschein-copy';
import { GIFT_AMOUNTS } from '@/lib/gutschein';
import { GIFT_DESIGN_KEYS, giftDesigns } from '@/lib/gutschein-designs';
import { PAYMENT_OPTIONS } from '@/lib/payments/config';
import { translate } from '@/i18n/messages';
import { FOOT_CARE_FAQ } from './foot-care-faq';

type Topic = 'gutschein' | 'foot-care';
type Entry = { id: string; q: string; a: string };
type InformationContext = Pick<AiSession['context'],
  'selectedServiceIds' | 'selectedMasterId' | 'reservedSlot' | 'draftId' |
  'awaitingRegistrationMethod' | 'awaitingVerificationMethod' |
  'pendingVerificationMethod' | 'activeVerificationMethod' |
  'consultationServiceTitle' | 'chatHistory'>;

const COPY = {
  de: { gift: 'Gutschein: Fragen & Antworten', foot: 'Fragen zur Fußpflege', moreGift: 'Weitere Fragen zum Gutschein', moreFoot: 'Weitere Fragen zur Fußpflege',
    design: 'Gutschein gestalten und anfragen', footPage: 'Fußpflege: Leistungen und Preise', catalogue: '💅 Alle Leistungen und Preise',
    amountQ: 'Welche Gutschein-Beträge sind möglich?', amountA: 'Vorschläge: {amounts} €. Eigener Betrag: {hint}. Ein Wertgutschein ist noch keine Buchung einer bestimmten Behandlung.',
    personalQ: 'Kann ich den Gutschein persönlich beschriften?', personalA: 'Empfängername, Absendername und Gruß sind optional. Tragen Sie diese Angaben im Formular ein; die Vorschau ist noch kein gültiger Gutschein.',
    receiptQ: 'Ist die Eingangsbestätigung schon der Gutschein?', receiptA: 'Nein. Die Eingangsbestätigung geht an die anfragende Person, nicht automatisch an den beschenkten Menschen. Sie bestätigt die gespeicherte Anfrage, nicht Zahlung oder Ausstellung.',
    statusQ: 'Was bedeuten die Statusmeldungen meiner Gutschein-Anfrage?', statusA: 'Statusänderungen werden per E-Mail an die anfragende Person gemeldet. Ich kann den persönlichen Status hier nicht nachsehen und bestätige weder Zahlung noch Ausstellung. Allgemeine Bedeutungen:',
    urgentQ: 'Kann ich den Gutschein heute oder sofort erhalten?', urgentA: 'Eine sofortige Ausgabe oder Zustellung zu einem bestimmten Zeitpunkt können wir nicht zusagen. Bitte klären Sie einen dringenden Wunsch direkt mit dem Salon; auch Abholung wird persönlich vereinbart.',
    changeQ: 'Wie ändere oder storniere ich eine Gutschein-Anfrage?', changeA: 'Kontaktieren Sie den Salon mit Ihrer Anfragenummer. Im Chat kann ich keine Anfrage ändern oder stornieren, keinen Gutschein ausstellen und keine Rückzahlung bestätigen. Bedingungen zu Einlösung, Restwert oder Erstattung werden persönlich geklärt.',
    fieldsQ: 'Welche Angaben braucht der Salon für einen Gutschein?', fieldsA: 'Im Formular werden vollständiger Name, E-Mail, eine erreichbare Telefonnummer und die Einwilligung zur Kontaktaufnahme benötigt. Design, Betrag und gewünschte Übergabe wählen Sie dort. Bitte keine Zahlungsdaten oder vollständigen Kundendaten in diesen Chat senden.',
    paymentQ: 'Kann ich meine Fußpflege online bezahlen?', requestOnly: 'Eine Anfrage hier im Chat ist nicht bestellt oder bezahlt. Verwenden Sie das Formular; der Salon bestätigt die Einzelheiten persönlich.',
  },
  en: { gift: 'Gift voucher questions & answers', foot: 'Foot-care questions', moreGift: 'More gift voucher questions', moreFoot: 'More foot-care questions',
    design: 'Design and request a gift voucher', footPage: 'Foot-care services and prices', catalogue: '💅 All services and prices',
    amountQ: 'Which gift voucher amounts can I choose?', amountA: 'Suggested amounts: €{amounts}. Custom amount: {hint}. A value voucher is not yet a booking for a particular treatment.',
    personalQ: 'Can I personalise the gift voucher?', personalA: 'Recipient name, sender name and a greeting are optional. Enter these details in the form; the preview is not a valid voucher.',
    receiptQ: 'Is the request receipt already my gift voucher?', receiptA: 'No. The receipt is sent to the person making the request, not automatically to the gift recipient. It confirms the saved request, not payment or issue.',
    statusQ: 'What do my gift voucher request status updates mean?', statusA: 'Status changes are emailed to the person making the request. I cannot look up your personal status here or confirm payment or issue. The general meanings are:',
    urgentQ: 'Can I receive a gift voucher today or immediately?', urgentA: 'We cannot promise immediate issue or delivery by a specific time. Discuss an urgent request directly with the salon; collection is also arranged personally.',
    changeQ: 'How do I change or cancel a gift voucher request?', changeA: 'Contact the salon with your request reference. I cannot change or cancel requests, issue a voucher or confirm a refund in chat. Redemption, remaining value and refund terms are agreed personally.',
    fieldsQ: 'Which details does the salon need for a gift voucher?', fieldsA: 'The form requires your full name, email, a reachable phone number and consent to contact you. Select the design, amount and preferred handover there. Please do not send payment details or complete customer details in this chat.',
    paymentQ: 'Can I pay for my foot care online?', requestOnly: 'A message in this chat does not place or pay for an order. Use the form; the salon confirms the details personally.',
  },
  ru: { gift: 'Сертификат: вопросы и ответы', foot: 'Вопросы о педикюре', moreGift: 'Ещё вопросы о сертификате', moreFoot: 'Ещё вопросы о педикюре',
    design: 'Оформить заявку на сертификат', footPage: 'Услуги и цены на педикюр', catalogue: '💅 Все услуги и цены',
    amountQ: 'На какую сумму можно оформить сертификат?', amountA: 'Готовые варианты: {amounts} €. Своя сумма: {hint}. Сертификат на сумму ещё не является записью на конкретную процедуру.',
    personalQ: 'Можно подписать сертификат и добавить пожелание?', personalA: 'Имя получателя, подпись дарителя и пожелание необязательны. Укажите их в форме; предпросмотр ещё не является действующим сертификатом.',
    receiptQ: 'Письмо о получении заявки — это уже сертификат?', receiptA: 'Нет. Подтверждение отправляется тому, кто оформил заявку, а не автоматически получателю подарка. Оно подтверждает сохранённую заявку, но не оплату и не выдачу сертификата.',
    statusQ: 'Что означают статусы заявки на сертификат?', statusA: 'При изменении статуса письмо отправляется тому, кто оформил заявку. Я не могу проверить ваш личный статус в чате или подтвердить оплату и выдачу. Общие значения:',
    urgentQ: 'Можно получить сертификат сегодня или сразу?', urgentA: 'Мгновенную выдачу или доставку к определённому времени обещать нельзя. Срочное пожелание обсудите напрямую с салоном; получение в салоне тоже согласуется лично.',
    changeQ: 'Как изменить или отменить заявку на сертификат?', changeA: 'Свяжитесь с салоном и сообщите номер заявки. В чате я не могу изменить или отменить заявку, выпустить сертификат или подтвердить возврат денег. Условия использования, остатка суммы и возврата согласуются лично.',
    fieldsQ: 'Какие данные нужны для заявки на сертификат?', fieldsA: 'В форме обязательны полное имя, e-mail, доступный номер телефона и согласие на связь. Там же выберите дизайн, сумму и способ получения. Не отправляйте платёжные реквизиты и полные персональные данные в этот чат.',
    paymentQ: 'Можно оплатить педикюр онлайн?', requestOnly: 'Сообщение в чате не оформляет и не оплачивает заказ. Используйте форму — детали лично подтвердит салон.',
  },
} satisfies Record<Locale, Record<string, string>>;

export function getGiftAssistantFaq(locale: Locale): Entry[] {
  const c = COPY[locale];
  const siteIds = ['order', 'treatment', 'delivery', 'terms', 'pickup', 'design'];
  const entries = giftFaq(locale).map(([q, a], i) => ({ id: siteIds[i] ?? `site-${i}`, q, a }));
  // Design names, form facts and status explanations come from the website,
  // not an independently maintained AI price or voucher ledger.
  entries.find(item => item.id === 'design')!.a += '\n' + GIFT_DESIGN_KEYS.map(key => giftDesigns[key].names[locale]).join(' · ');
  return [...entries,
    { id: 'amount', q: c.amountQ, a: c.amountA.replace('{amounts}', GIFT_AMOUNTS.join(' / ')).replace('{hint}', giftCopy[locale].amountHint) },
    { id: 'personal', q: c.personalQ, a: c.personalA },
    { id: 'receipt', q: c.receiptQ, a: c.receiptA },
    { id: 'status', q: c.statusQ, a: c.statusA + '\n' + (Object.keys(giftCopy[locale].statuses) as Array<keyof typeof giftCopy[typeof locale]['statuses']>)
      .map(key => `${giftCopy[locale].statuses[key]}: ${giftDetailsCopy[locale].statusMessages[key]}`).join('\n') },
    { id: 'urgent', q: c.urgentQ, a: c.urgentA },
    { id: 'change', q: c.changeQ, a: c.changeA },
    { id: 'fields', q: c.fieldsQ, a: c.fieldsA },
  ];
}

export function getFootAssistantFaq(locale: Locale): Entry[] {
  return [...FOOT_CARE_FAQ[locale], {
    id: 'payment', q: COPY[locale].paymentQ,
    a: translate(locale, PAYMENT_OPTIONS.onlineEnabled ? 'booking_payment_hero_subtitle' : 'booking_payment_online_paused'),
  }];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, 'е').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/([a-z])\p{M}+/gu, '$1').normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}

function explicitTopic(text: string): Topic | null {
  if (/gutschein|gift\s*(voucher|card|certificate)|voucher|сертификат|сертифекат|гутшайн|подарочн/.test(text)) return 'gutschein';
  if (/fusspflege|fuss pflege|pedikur|pedicu|foot care|педикюр|педикур|стоп|пятк|ногт[яеь].*ног/.test(text)) return 'foot-care';
  return null;
}

function recentTopic(context: InformationContext): Topic | null {
  const last = context.chatHistory?.filter(item => item.role === 'assistant').at(-1)?.content ?? '';
  if (last.includes('/gutschein?lang=')) return 'gutschein';
  if (last.includes('/fusspflege-halle?lang=')) return 'foot-care';
  return context.consultationServiceTitle ? explicitTopic(normalize(context.consultationServiceTitle)) : null;
}

const GIFT_MATCH: Array<[string, RegExp]> = [
  ['change', /andern|storn|cancel|change|refund|отмен|измен|исправ|возврат/],
  ['status', /status|статус|обработ|готов|ready|fertig|номер заявки/],
  ['receipt', /empfanger|recipient|получател|receipt|eingangs|подтверждени|письмо/],
  ['urgent', /heute|sofort|today|immediat|instant|сегодн|сразу|сроч/],
  ['terms', /gultig|valid|ablauf|expir|redeem|einlos|срок|действ|использ|остат|restwert|restbetrag|remaining|год|years/],
  ['design', /design|motiv|farbe|colour|color|дизайн|палитр|картин|цвет|orchid|peony|ginkgo|lily|орхиде|пион|гинкго|лили/],
  ['fields', /telefon|phone|contact details|обязат|телефон|контакт|consent|privacy|согласие|какие данные/],
  ['personal', /personalis|gruss|greeting|message|name|поздрав|пожелан|имя|подпис/],
  ['pickup', /abhol|collect|pick up|pickup|забрать|самовывоз|адрес/],
  ['delivery', /mail|digital|elektron|электрон|почт|достав|получить|send|versand/],
  ['amount', /betrag|summe|amount|value|wert|how much|preis|kost|price|cost|сколько|сумм|стоим|номинал|euro|евро/],
  ['treatment', /behandlung|treatment|procedure|процед|услуг|pedik|педик|fusspflege|foot care/],
  ['order', /bestell|anfrag|order|buy|kaufen|заяв|заказ|купить|оформ|code|код|ausstell|выпуст|создай|оплати/],
];
const FOOT_MATCH: Array<[string, RegExp]> = [
  ['diabetes', /diabet|risikofuss|high risk|диабет|проблемн.{0,8}стоп/],
  ['ingrown', /eingewachs|entzundet|ingrown|pus|вросш|воспал|гно[йя]/],
  ['nail_changes', /pilz|fung|verdickt|discolour|thick|утолщ|гриб|измен.{0,12}цвет/],
  ['callus', /hornhaut|riss|callus|crack|натоптыш|мозол|трещин|пятк/],
  ['comfort', /schmerz|weh|empfind|pain|sensitiv|больно|боль|чувствител|боюсь/],
  ['preparation', /vorbereit|prepar|подготов|стесня|embarrass/],
  ['frequency', /wie oft|how often|как часто|интервал|кажд.*месяц/],
  ['hygiene', /hygien|steril|product|allerg|гигиен|стерил|инструмент|средств|аллерг/],
  ['removal', /entfern|remov|снят|снимать|уже есть/],
  ['polish', /lack|polish|покрыт|гель лак|гельлак|лак/],
  ['men', /herren|manner|\bmen\b|мужчин|мужск/],
  ['mobile', /mobil|hausbesuch|home visit|выезд|на дому|на дом/],
  ['efile', /apparat|e file|аппарат/],
  ['classic', /klassisch|classic|классич|входит|included/],
  ['payment', /bezahl|zahlung|payment|pay online|оплат/],
  ['choice', /wahl|passt|choose|suits|выбрать|подойдет|подходит|какой/],
];

export function buildInformationMenu(topic: Topic, locale: Locale, more = false): string {
  const c = COPY[locale];
  const entries = topic === 'gutschein' ? getGiftAssistantFaq(locale) : getFootAssistantFaq(locale);
  const selected = entries.slice(more ? 8 : 0, more ? undefined : 8);
  const moreLabel = topic === 'gutschein' ? c.moreGift : c.moreFoot;
  return `**${topic === 'gutschein' ? c.gift : c.foot}**\n\n` + selected.map(item => `[option] ${item.q} [/option]`).join('\n')
    + (!more ? `\n[option] ${moreLabel} [/option]` : '') + '\n\n' + topicLink(topic, locale);
}

export function buildInformationTopicOptions(locale: Locale): string {
  return `[option] 🎁 ${COPY[locale].gift} [/option]\n[option] 🦶 ${COPY[locale].foot} [/option]`;
}

function topicLink(topic: Topic, locale: Locale): string {
  const c = COPY[locale];
  return topic === 'gutschein'
    ? `[option url="/gutschein?lang=${locale}#gestalten"] ${c.design} [/option]`
    : `[option url="/fusspflege-halle?lang=${locale}"] ${c.footPage} [/option]`;
}

/** Deterministic consultation only; never consumes a live booking/OTP answer. */
export function resolveSalonInformation(message: string, locale: Locale, context: InformationContext = {}): { text: string; topic: Topic; preferOverCatalog?: boolean } | null {
  if (context.selectedMasterId || context.selectedServiceIds?.length || context.reservedSlot || context.draftId ||
    context.awaitingRegistrationMethod || context.awaitingVerificationMethod || context.pendingVerificationMethod || context.activeVerificationMethod) return null;
  const value = normalize(message);
  if (!value || /^\d+$/.test(value)) return null;
  const gift = getGiftAssistantFaq(locale);
  const foot = getFootAssistantFaq(locale);
  const exactGift = gift.find(item => normalize(item.q) === value);
  const exactFoot = foot.find(item => normalize(item.q) === value);
  const footSafety = /fusspflege|pedik|pedicu|foot|педик|стоп|ногт/.test(value) &&
    /diabet|ingrown|entzund|wound|eitr|pus|диабет|вросш|воспал|гно[йя]|ран[аыу]|кров/.test(value);
  const topic = footSafety ? 'foot-care' : exactGift ? 'gutschein' : exactFoot ? 'foot-care' : explicitTopic(value) ?? recentTopic(context);
  if (!topic) return null;
  if (/faq|fragen|questions|вопрос/.test(value) && !exactGift && !exactFoot) {
    return { topic, text: buildInformationMenu(topic, locale, /weitere|more|еще/.test(value)), preferOverCatalog: explicitTopic(value) === 'gutschein' };
  }
  const entries = topic === 'gutschein' ? gift : foot;
  const match = (topic === 'gutschein' ? GIFT_MATCH : FOOT_MATCH).find(([, pattern]) => pattern.test(value));
  const entry = (footSafety ? exactFoot : exactGift ?? exactFoot) ?? entries.find(item => item.id === match?.[0]) ??
    (footSafety ? foot.find(item => item.id === 'comfort') : undefined);
  // Health warnings must not turn an informational booking request into an
  // invitation to a routine cosmetic appointment. No treatment is approved here.
  const safetyAnswer = topic === 'foot-care' && entry && (
    ['diabetes', 'ingrown', 'nail_changes'].includes(entry.id) ||
    /wund|wound|eitr|bleed|starke schmerz|severe pain|гно[йя]|ран[аыу]|кров|сильн.{0,8}бол/.test(value)
  );
  // Current prices, durations, dates and explicit appointment requests reach the
  // existing live-catalog/booking handlers, never static numeric answers.
  if (topic === 'foot-care' && !safetyAnswer && /preis|kost|price|cost|dauer|duration|how long|сколько|стоим|цен|длится|времени|buchen|termin|\bbook\b|запис|свободн|\d/.test(value)) return null;
  if (!entry && (topic === 'foot-care' || !explicitTopic(value))) return null;
  const c = COPY[locale];
  const intro = entry ? `**${entry.q}**\n\n${entry.a}` : giftDetailsCopy[locale].answer + '\n\n' + c.requestOnly;
  const faqTitle = topic === 'gutschein' ? c.gift : c.foot;
  return { topic, preferOverCatalog: Boolean(safetyAnswer) || (topic === 'gutschein' && (Boolean(exactGift) || explicitTopic(value) === 'gutschein')),
    text: intro + '\n\n' + topicLink(topic, locale)
    + `\n\n[option] ${faqTitle} [/option]` + (!safetyAnswer ? `\n[option] ${c.catalogue} [/option]` : '') };
}

/** Always available to GPT, including follow-ups that do not use a fast path. */
export function buildSalonInformationContext(locale: Locale): string {
  return [
    'GUTSCHEIN: verified website/form knowledge, separate from the treatment catalogue.',
    giftDetailsCopy[locale].answer,
    ...getGiftAssistantFaq(locale).map(item => `${item.q}\n${item.a}`),
    topicLink('gutschein', locale),
    'Never claim a voucher was ordered, issued, paid, redeemed, checked or canceled by chat. No tool here performs these operations. Do not request card data. No invented expiry, refund, remaining-balance, instant-delivery or tax/legal guarantees. Request processing statuses are not a financial ledger. Do not send customers to treatment booking to order a voucher.',
    'FOOT CARE: general consultation, not a static list of available treatments or prices.',
    ...getFootAssistantFaq(locale).map(item => `${item.q}\n${item.a}`),
    topicLink('foot-care', locale),
    'Use list_services for every concrete treatment offer, price, duration and promotion; use availability tools for appointments. Do not invent sterilisation methods, credentials or health suitability. Do not use Podologie/podiatry or their Russian equivalents in customer-facing copy. No diagnosis, prescribing or cure guarantees. For acute inflammation, wounds, pus, severe pain or a diabetic-foot warning, advise prompt medical assessment, not a routine cosmetic booking. These safety limits take priority over any generic invitation to book.',
    PAYMENT_OPTIONS.onlineEnabled ? 'Use only the payment methods actually enabled in the booking page.' : translate(locale, 'booking_payment_online_paused'),
  ].join('\n\n');
}
