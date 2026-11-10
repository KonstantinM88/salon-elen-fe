import type { Locale } from '@/i18n/locales';
import { giftCopy } from './gutschein-copy';

type Details = {
  heading: string; design: string; designHint: string; phoneHint: string; invalidPhone: string;
  answerTitle: string; answer: string; treatmentsTitle: string; treatmentsIntro: string;
  treatments: [string, string, string][]; extraFaq: [string, string][];
  history: string; retry: string; notificationsPending: string; conflict: string; statusSubject: string;
  statusIntro: string; statusMessages: Record<string, string>;
};

export const giftDetailsCopy: Record<Locale, Details> = {
  de: {
    heading: 'Beauty-Gutschein in Halle (Saale)', design: 'Ihr Design',
    designHint: 'Vier Farbwelten, vier botanische Motive. Ihr gewähltes Design wird mit Ihrer Anfrage gespeichert.',
    phoneHint: 'Pflichtfeld: Unter dieser Nummer stimmen wir die Anfrage persönlich mit Ihnen ab.',
    invalidPhone: 'Bitte geben Sie eine erreichbare Telefonnummer mit 7–15 Ziffern an, gern mit Ländervorwahl.',
    answerTitle: 'Ein Beauty-Geschenk aus dem Paulusviertel.',
    answer: 'Bei Salon Elen in Halle (Saale) können Sie einen persönlichen Beauty-Gutschein von 25 bis 500 € anfragen. Wählen Sie Design, Betrag und Gruß. Wir beraten Sie auf Deutsch, Englisch oder Russisch und klären Zahlung, Einlösebedingungen und Übergabe persönlich. Das Formular löst keine Zahlung aus.',
    treatmentsTitle: 'Welche Auszeit möchten Sie verschenken?',
    treatmentsIntro: 'Ein Wertgutschein lässt Raum für persönliche Wünsche. Entdecken Sie unser Angebot und besprechen Sie mit uns, welche Behandlung und welcher Betrag passen. Ein Gutschein ersetzt keine individuelle Beratung.',
    treatments: [
      ['/fusspflege-halle', 'Fußpflege & Pediküre', 'Eine Geschenkidee für gepflegte Füße. Aktuelle Behandlungen und Preise helfen bei der Wahl des Betrags.'],
      ['/microneedling-halle', 'Kosmetik & Hautpflege', 'Zeit für die eigene Haut: Wünsche, Eignung und passende Pflege klären wir in der Beratung.'],
      ['/wimpernverlaengerung-halle', 'Wimpern & Ausdruck', 'Für einen persönlichen Beauty-Moment. Die passende Wimpernbehandlung wählen wir gemeinsam.'],
      ['/services', 'Permanent Make-up & mehr', 'Alle aktuellen Leistungen im Überblick. Behandlungswünsche und mögliche Zuzahlungen vorab besprechen.'],
    ],
    extraFaq: [
      ['Wo kann ich einen Beauty-Gutschein in Halle abholen?', 'Salon Elen befindet sich in der Lessingstraße 37, 06114 Halle (Saale), im Paulusviertel. Wählen Sie Abholung im Salon; den Termin und die Ausstellung stimmen wir persönlich ab.'],
      ['Kann ich das Design wählen und warum ist eine Telefonnummer erforderlich?', 'Ja. Sie können Orchidee, Pfingstrose, Ginkgo oder Lilie mit passender Farbpalette wählen. Design, Betrag und Gruß werden gespeichert. Ihre Telefonnummer benötigen wir zur persönlichen Abstimmung; eine E-Mail-Adresse ist für Bestätigung und Statusinformationen erforderlich.'],
    ],
    history: 'Statusverlauf & Zustellung', retry: 'Offene Statusmitteilungen erneut senden',
    notificationsPending: 'Status gespeichert. Mindestens eine Zustellung ist noch nicht bestätigt. Bitte im Verlauf prüfen und erneut senden.',
    conflict: 'Die Anfrage wurde zwischenzeitlich geändert. Bitte prüfen Sie den aktuellen Status und versuchen Sie es erneut.',
    statusSubject: 'Neuer Status Ihrer Gutschein-Anfrage', statusIntro: 'Der Bearbeitungsstatus Ihrer Gutschein-Anfrage wurde aktualisiert.',
    statusMessages: {
      NEW: 'Ihre Anfrage wird erneut bearbeitet. Wir melden uns zur persönlichen Abstimmung.',
      CONTACTED: 'Der Salon hat Ihre Anfrage als kontaktiert markiert. Bitte stimmen Sie die weiteren Details direkt mit uns ab.',
      COMPLETED: 'Der Salon hat die Bearbeitung Ihrer Anfrage abgeschlossen. Diese Statusmeldung ist kein Zahlungsbeleg und kein einlösbarer Gutschein. Maßgeblich sind die persönlich vereinbarten Bedingungen und der separat ausgestellte Gutschein.',
      CANCELED: 'Ihre Anfrage wurde storniert. Bei Fragen oder wenn Sie erneut anfragen möchten, kontaktieren Sie bitte den Salon. Diese Nachricht bestätigt keine Rückerstattung.',
    },
  },
  en: {
    heading: 'Beauty gift vouchers in Halle (Saale)', design: 'Your design',
    designHint: 'Four colour palettes, four botanical artworks. Your chosen design is saved with your request.',
    phoneHint: 'Required: we use this number to arrange your request with you personally.',
    invalidPhone: 'Please enter a contact phone number with 7–15 digits, preferably including the country code.',
    answerTitle: 'A beauty gift from the Paulusviertel.',
    answer: 'At Salon Elen in Halle (Saale), you can request a personal beauty gift voucher from €25 to €500. Choose a design, amount and message. We advise in German, English or Russian and personally arrange payment, redemption terms and handover. Submitting the form does not take a payment.',
    treatmentsTitle: 'Which moment of care would you like to give?',
    treatmentsIntro: 'A value voucher leaves room for personal preferences. Explore our services and discuss a suitable treatment and amount with us. A voucher does not replace an individual consultation.',
    treatments: [
      ['/fusspflege-halle', 'Foot care & pedicures', 'A gift idea for well-cared-for feet. Current treatments and prices can help you choose an amount.'],
      ['/microneedling-halle', 'Beauty & skin care', 'Time for their skin: we discuss preferences, suitability and appropriate care during consultation.'],
      ['/wimpernverlaengerung-halle', 'Lashes & expression', 'For a personal beauty moment. We help select an appropriate lash treatment.'],
      ['/services', 'Permanent make-up & more', 'Explore the current service catalogue. Discuss treatment preferences and any additional payment in advance.'],
    ],
    extraFaq: [
      ['Where can I collect a beauty gift voucher in Halle?', 'Salon Elen is at Lessingstraße 37, 06114 Halle (Saale), in the Paulusviertel. Select collection at the salon; collection time and issue are arranged personally.'],
      ['Can I choose a design and why is a phone number required?', 'Yes. Choose Orchid, Peony, Ginkgo or Lily with its colour palette. Your design, amount and message are saved. We need your phone number to arrange the request personally; your email address is needed for confirmation and status updates.'],
    ],
    history: 'Status history & delivery', retry: 'Retry pending status notifications',
    notificationsPending: 'Status saved. At least one delivery is still unconfirmed. Please check the history and retry.',
    conflict: 'The request was changed in the meantime. Please review the current status and try again.',
    statusSubject: 'Your gift voucher request status', statusIntro: 'The processing status of your gift voucher request has been updated.',
    statusMessages: {
      NEW: 'Your request has been reopened. We will contact you to arrange the details personally.',
      CONTACTED: 'The salon has marked your request as contacted. Please arrange the next steps directly with us.',
      COMPLETED: 'The salon has completed processing your request. This update is not proof of payment or a redeemable voucher. The terms agreed personally and the separately issued voucher apply.',
      CANCELED: 'Your request has been canceled. Please contact the salon with any questions or to request again. This message does not confirm a refund.',
    },
  },
  ru: {
    heading: 'Подарочный сертификат в Галле (Заале)', design: 'Ваш дизайн',
    designHint: 'Четыре палитры, четыре ботанических изображения. Выбранный дизайн сохраним вместе с заявкой.',
    phoneHint: 'Обязательное поле: по этому номеру мы свяжемся с вами для согласования заявки.',
    invalidPhone: 'Укажите контактный телефон: от 7 до 15 цифр, желательно с кодом страны.',
    answerTitle: 'Подарок с заботой из Paulusviertel.',
    answer: 'В Salon Elen в Галле (Заале) можно оставить заявку на подарочный сертификат от 25 до 500 €. Выберите дизайн, сумму и пожелание. Мы консультируем на русском, немецком и английском и лично согласуем оплату, условия использования и получение. Отправка формы не списывает деньги.',
    treatmentsTitle: 'Какую заботу вы хотите подарить?',
    treatmentsIntro: 'Сертификат на сумму оставляет свободу выбора. Посмотрите наши услуги и обсудите с нами подходящую процедуру и сумму. Сертификат не заменяет индивидуальную консультацию.',
    treatments: [
      ['/fusspflege-halle', 'Уход за стопами и педикюр', 'Идея подарка для ухоженных стоп. Актуальные процедуры и цены помогут выбрать сумму.'],
      ['/microneedling-halle', 'Косметология и уход за кожей', 'Время для своей кожи: пожелания, ограничения и подходящий уход обсудим на консультации.'],
      ['/wimpernverlaengerung-halle', 'Ресницы и выразительный взгляд', 'Для приятного бьюти-момента. Подходящую процедуру для ресниц подберём вместе.'],
      ['/services', 'Перманентный макияж и другие услуги', 'Актуальный каталог процедур. Пожелания и возможную доплату обсудим заранее.'],
    ],
    extraFaq: [
      ['Где забрать подарочный сертификат в Галле?', 'Salon Elen находится по адресу Lessingstraße 37, 06114 Halle (Saale), в районе Paulusviertel. Выберите получение в салоне; время и оформление согласуем лично.'],
      ['Можно выбрать дизайн и зачем нужен телефон?', 'Да. Доступны орхидея, пион, гинкго и лилия в разных палитрах. Дизайн, сумма и пожелание сохраняются в заявке. Телефон нужен для личного согласования, e-mail — для подтверждения получения и уведомлений о статусе.'],
    ],
    history: 'История статусов и доставки', retry: 'Повторить недоставленные уведомления',
    notificationsPending: 'Статус сохранён, но не все уведомления подтверждены. Проверьте историю и повторите отправку.',
    conflict: 'Заявка уже изменена другим действием. Проверьте актуальный статус и повторите попытку.',
    statusSubject: 'Новый статус заявки на сертификат', statusIntro: 'Статус обработки вашей заявки на подарочный сертификат изменён.',
    statusMessages: {
      NEW: 'Заявка снова в обработке. Мы свяжемся с вами для личного согласования.',
      CONTACTED: 'Салон отметил заявку как «Связались». Дальнейшие детали, пожалуйста, согласуйте с нами напрямую.',
      COMPLETED: 'Салон завершил обработку заявки. Это уведомление не является подтверждением оплаты или действующим сертификатом. Действуют лично согласованные условия и отдельно оформленный сертификат.',
      CANCELED: 'Заявка отменена. Если остались вопросы или хотите оформить её снова, свяжитесь с салоном. Это сообщение не подтверждает возврат средств.',
    },
  },
};

export function giftFaq(locale: Locale) {
  return [...giftCopy[locale].faq, ...giftDetailsCopy[locale].extraFaq];
}
