import type { Metadata } from "next";
import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import type { LegalDocument } from "@/lib/legal-content";
import {
  BASE_URL,
  buildAlternates,
  resolveUrlLocale,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";
import { resolveContentLocale } from "@/lib/seo-locale-server";

const metaTitles: Record<SeoLocale, string> = {
  de: "Datenschutz — Salon Elen",
  en: "Privacy Policy — Salon Elen",
  ru: "Политика конфиденциальности — Salon Elen",
};

const metaDescriptions: Record<SeoLocale, string> = {
  de: "Informationen zur Verarbeitung personenbezogener Daten nach DSGVO.",
  en: "Information on personal data processing under GDPR.",
  ru: "Информация об обработке персональных данных по GDPR.",
};

const docs: Record<SeoLocale, LegalDocument> = {
  de: {
    title: "Datenschutzerklaerung",
    intro: [
      "Mit dieser Datenschutzerklaerung informieren wir Sie ueber die Verarbeitung personenbezogener Daten gemaess Art. 13, 14 DSGVO.",
      "Personenbezogene Daten werden nur verarbeitet, soweit dies fuer Betrieb, Sicherheit und Leistungen unseres Angebots erforderlich ist.",
    ],
    sections: [
      {
        title: "1. Verantwortliche Stelle",
        items: [
          "Salon Elen, Inhaberin Olena Dubrovska",
          "Lessingstr. 37, 06114 Halle (Saale), Deutschland",
          "Telefon: +49 177 899 5106",
          "E-Mail: elen69@web.de",
        ],
      },
      {
        title: "2. Kategorien und Zwecke der Verarbeitung",
        items: [
          "Technische Bereitstellung der Website und IT-Sicherheit",
          "Online-Terminbuchung und Kundenverwaltung",
          "Bearbeitung von Kontaktanfragen",
          "Zahlungsabwicklung bei Online-Zahlungen",
          "Versand von Termin- und Sicherheitsnachrichten (E-Mail, SMS, Messenger)",
          "Bereitstellung optionaler KI-Chat/Voice-Funktionen",
        ],
      },
      {
        title: "3. Rechtsgrundlagen",
        items: [
          "Art. 6 Abs. 1 lit. b DSGVO (Vertrag / vorvertragliche Massnahmen)",
          "Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtungen)",
          "Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen, z. B. Sicherheit)",
          "Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, soweit gesondert eingeholt)",
        ],
      },
      {
        title: "4. Server-Logfiles",
        paragraphs: [
          "Beim Besuch der Website koennen technische Zugriffsdaten (u. a. IP-Adresse, Datum/Uhrzeit, angefragte URL, User-Agent, Referrer) verarbeitet werden.",
          "Dies erfolgt zur Sicherstellung von Stabilitaet und Sicherheit auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.",
        ],
      },
      {
        title: "5. Cookies und lokale Speicherung",
        paragraphs: [
          "Wir nutzen erforderliche Cookies und lokale Speicherwerte, insbesondere fuer Spracheinstellungen (z. B. locale) und technische Funktionen.",
          "Soweit keine Einwilligung eingeholt wird, setzen wir keine nicht notwendigen Marketing-Cookies.",
        ],
      },
      {
        title: "6. Buchung, Account und Kommunikation",
        paragraphs: [
          "Bei Buchung und Kommunikation verarbeiten wir Kontaktdaten und Buchungsdaten (z. B. Name, Telefon, E-Mail, Termin, gewaehlte Leistung).",
          "Diese Verarbeitung ist fuer Vertragsanbahnung und -durchfuehrung erforderlich (Art. 6 Abs. 1 lit. b DSGVO).",
        ],
      },
      {
        title: "7. Zahlungen und externe Dienstleister",
        paragraphs: [
          "Bei Online-Zahlungen werden erforderliche Zahlungsdaten an den jeweiligen Zahlungsanbieter uebermittelt (z. B. Stripe, PayPal).",
          "Fuer Benachrichtigungen koennen E-Mail-/SMS-/Messenger-Dienste eingesetzt werden (z. B. Resend, Zadarma, Telegram).",
        ],
      },
      {
        title: "8. KI-Funktionen",
        paragraphs: [
          "Bei Nutzung von KI-Chat- oder Sprachfunktionen koennen Eingaben an externe KI-Dienstleister (z. B. OpenAI) uebermittelt werden.",
          "Bitte geben Sie dort keine unnoetigen sensiblen Daten ein.",
        ],
      },
      {
        title: "9. Karten und externe Inhalte",
        paragraphs: [
          "Auf der Kontaktseite kann Google Maps eingebunden werden. Beim Laden koennen Daten an Google uebermittelt werden (z. B. IP-Adresse, technische Nutzungsdaten).",
          "Soweit moeglich, wird eine Vorschau bereitgestellt und externe Inhalte werden erst unter den jeweils konfigurierten Bedingungen geladen.",
        ],
      },
      {
        title: "10. Empfaenger, Drittlandtransfer und Speicherdauer",
        paragraphs: [
          "Daten koennen an technische Dienstleister uebermittelt werden, die als Auftragsverarbeiter oder eigenstaendige Verantwortliche taetig sind.",
          "Bei Uebermittlungen in Drittstaaten nutzen wir geeignete Garantien (z. B. Standardvertragsklauseln), soweit erforderlich.",
          "Die Speicherung erfolgt nur solange, wie sie fuer den Zweck oder gesetzliche Aufbewahrungspflichten notwendig ist.",
        ],
      },
      {
        title: "11. Ihre Rechte",
        items: [
          "Auskunft, Berichtigung, Loeschung, Einschraenkung der Verarbeitung",
          "Datenuebertragbarkeit",
          "Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen",
          "Widerruf erteilter Einwilligungen mit Wirkung fuer die Zukunft",
        ],
      },
      {
        title: "12. Beschwerderecht und Hinweise",
        paragraphs: [
          "Sie koennen sich bei einer Datenschutzaufsichtsbehoerde beschweren, insbesondere am Ort Ihres gewoehnlichen Aufenthalts oder unseres Sitzes.",
          "Aufsichtsbehoerde in Sachsen-Anhalt: Landesbeauftragter fuer den Datenschutz Sachsen-Anhalt (https://datenschutz.sachsen-anhalt.de).",
          "Eine automatisierte Entscheidungsfindung im Sinne von Art. 22 DSGVO findet nicht statt.",
        ],
      },
    ],
    updated: "Stand: 1. April 2026",
  },
  en: {
    title: "Privacy Policy",
    intro: [
      "This privacy policy describes how we process personal data under Art. 13 and 14 GDPR.",
      "Personal data is processed only to the extent necessary for website operation, security, and service delivery.",
    ],
    sections: [
      {
        title: "1. Controller",
        items: [
          "Salon Elen, owner Olena Dubrovska",
          "Lessingstr. 37, 06114 Halle (Saale), Germany",
          "Phone: +49 177 899 5106",
          "E-mail: elen69@web.de",
        ],
      },
      {
        title: "2. Processing purposes",
        items: [
          "Website operation and IT security",
          "Online booking and customer management",
          "Handling contact requests",
          "Payment processing for online payments",
          "Appointment/security notifications (e-mail, SMS, messenger)",
          "Optional AI chat/voice features",
        ],
      },
      {
        title: "3. Legal bases",
        items: [
          "Art. 6(1)(b) GDPR (contract or pre-contractual measures)",
          "Art. 6(1)(c) GDPR (legal obligations)",
          "Art. 6(1)(f) GDPR (legitimate interests, e.g., security)",
          "Art. 6(1)(a) GDPR (consent where separately obtained)",
        ],
      },
      {
        title: "4. Server logs and technical data",
        paragraphs: [
          "When you visit the website, technical access data may be processed (e.g., IP address, date/time, URL, user agent, referrer).",
          "This is required for stability and security under Art. 6(1)(f) GDPR.",
        ],
      },
      {
        title: "5. Cookies and local storage",
        paragraphs: [
          "We use necessary cookies and local storage values (for example language settings such as locale and technical preferences).",
          "Unless separate consent is requested, no non-essential marketing cookies are used.",
        ],
      },
      {
        title: "6. Booking, communication, payment",
        paragraphs: [
          "For booking and communication we process contact and appointment data (e.g., name, phone, e-mail, selected service, appointment time).",
          "For online payments, required data is transferred to payment providers (e.g., Stripe, PayPal).",
          "For notifications we may use providers such as Resend, Zadarma, or Telegram.",
        ],
      },
      {
        title: "7. AI features and external content",
        paragraphs: [
          "If AI chat/voice features are used, inputs may be transferred to external AI providers (e.g., OpenAI).",
          "Please do not enter unnecessary sensitive information.",
          "Google Maps may be loaded on the contact page; this may transfer technical usage data to Google.",
        ],
      },
      {
        title: "8. Recipients, transfers, retention",
        paragraphs: [
          "Data may be shared with technical providers acting as processors or independent controllers.",
          "If data is transferred to third countries, we rely on lawful safeguards (e.g., standard contractual clauses), where required.",
          "Data is retained only as long as necessary for the purpose or legal retention duties.",
        ],
      },
      {
        title: "9. Your rights",
        items: [
          "Access, rectification, erasure, restriction of processing",
          "Data portability",
          "Objection to processing based on legitimate interests",
          "Withdrawal of consent for future processing",
        ],
      },
      {
        title: "10. Complaints and final notes",
        paragraphs: [
          "You may lodge a complaint with a supervisory authority, especially at your place of residence or our registered office.",
          "Supervisory authority in Saxony-Anhalt: State Commissioner for Data Protection Saxony-Anhalt (https://datenschutz.sachsen-anhalt.de).",
          "No automated decision-making within the meaning of Art. 22 GDPR is carried out.",
        ],
      },
    ],
    updated: "Last updated: April 1, 2026",
    languageNote:
      "For legal interpretation, the German-language version of this privacy policy prevails.",
  },
  ru: {
    title: "Политика конфиденциальности",
    intro: [
      "Этот документ описывает обработку персональных данных в соответствии со ст. 13 и 14 GDPR.",
      "Данные обрабатываются только в объеме, необходимом для работы сайта, безопасности и оказания услуг.",
    ],
    sections: [
      {
        title: "1. Оператор данных",
        items: [
          "Salon Elen, владелец Olena Dubrovska",
          "Lessingstr. 37, 06114 Halle (Saale), Германия",
          "Телефон: +49 177 899 5106",
          "E-mail: elen69@web.de",
        ],
      },
      {
        title: "2. Цели обработки",
        items: [
          "Работа сайта и информационная безопасность",
          "Онлайн-запись и управление клиентскими записями",
          "Обработка обращений",
          "Платежная обработка при онлайн-оплате",
          "Уведомления о записи и безопасности (e-mail, SMS, мессенджеры)",
          "Опциональные функции ИИ-чата/голоса",
        ],
      },
      {
        title: "3. Правовые основания",
        items: [
          "ст. 6(1)(b) GDPR (договор и преддоговорные меры)",
          "ст. 6(1)(c) GDPR (юридические обязанности)",
          "ст. 6(1)(f) GDPR (законный интерес, например безопасность)",
          "ст. 6(1)(a) GDPR (согласие, если запрашивается отдельно)",
        ],
      },
      {
        title: "4. Серверные логи и технические данные",
        paragraphs: [
          "При посещении сайта могут обрабатываться технические данные доступа (например, IP-адрес, дата/время, URL, user-agent, referrer).",
          "Это необходимо для стабильности и безопасности на основании ст. 6(1)(f) GDPR.",
        ],
      },
      {
        title: "5. Cookies и localStorage",
        paragraphs: [
          "Используются необходимые cookies и локальные значения хранения (включая языковые настройки, например locale, и технические параметры).",
          "Если отдельное согласие не запрашивается, маркетинговые cookies, не являющиеся необходимыми, не используются.",
        ],
      },
      {
        title: "6. Запись, коммуникация и платежи",
        paragraphs: [
          "Для записи и коммуникации обрабатываются контактные и сервисные данные (имя, телефон, e-mail, услуга, время записи).",
          "Для онлайн-оплаты необходимые данные передаются платежным провайдерам (например, Stripe, PayPal).",
          "Для уведомлений могут использоваться сервисы Resend, Zadarma, Telegram.",
        ],
      },
      {
        title: "7. ИИ-функции и внешний контент",
        paragraphs: [
          "При использовании ИИ-чата/голоса введенные данные могут передаваться внешним ИИ-провайдерам (например, OpenAI).",
          "Пожалуйста, не вводите лишние чувствительные данные.",
          "На странице контактов может загружаться Google Maps, что может сопровождаться передачей технических данных Google.",
        ],
      },
      {
        title: "8. Получатели, трансграничная передача и хранение",
        paragraphs: [
          "Данные могут передаваться техническим провайдерам как обработчикам по поручению или самостоятельным операторам.",
          "При передаче в третьи страны применяются допустимые механизмы защиты (например, стандартные договорные условия), если это требуется.",
          "Срок хранения ограничивается целями обработки и обязательными сроками по закону.",
        ],
      },
      {
        title: "9. Ваши права",
        items: [
          "Доступ, исправление, удаление, ограничение обработки",
          "Переносимость данных",
          "Возражение против обработки на основании законного интереса",
          "Отзыв согласия на будущее",
        ],
      },
      {
        title: "10. Жалобы и заключительные положения",
        paragraphs: [
          "Вы вправе подать жалобу в надзорный орган по месту проживания или по месту регистрации нашей компании.",
          "Надзорный орган в Саксонии-Анхальт: Landesbeauftragter fuer den Datenschutz Sachsen-Anhalt (https://datenschutz.sachsen-anhalt.de).",
          "Автоматизированное принятие решений по ст. 22 GDPR не применяется.",
        ],
      },
    ],
    updated: "Дата обновления: 1 апреля 2026 г.",
    languageNote:
      "При юридических расхождениях приоритет имеет немецкая версия этой политики.",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const alts = buildAlternates("/datenschutz", locale);

  return {
    title: metaTitles[locale],
    description: metaDescriptions[locale],
    alternates: alts,
    openGraph: {
      title: metaTitles[locale],
      description: metaDescriptions[locale],
      url: alts.canonical,
      siteName: "Salon Elen",
      type: "website",
      images: [`${BASE_URL}/images/hero.webp`],
      locale: locale === "de" ? "de_DE" : locale === "ru" ? "ru_RU" : "en_US",
    },
  };
}

export default async function DatenschutzPage({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const locale = await resolveContentLocale(searchParams);
  return <LegalDocumentPage doc={docs[locale]} />;
}
