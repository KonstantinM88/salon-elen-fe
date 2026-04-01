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
  de: "Nutzungsbedingungen — Salon Elen",
  en: "Terms of Use — Salon Elen",
  ru: "Условия использования — Salon Elen",
};

const metaDescriptions: Record<SeoLocale, string> = {
  de: "Nutzungsbedingungen fuer die Website und Buchungsfunktionen von Salon Elen.",
  en: "Terms of use for the website and booking features of Salon Elen.",
  ru: "Условия использования сайта и функций записи Salon Elen.",
};

const docs: Record<SeoLocale, LegalDocument> = {
  de: {
    title: "Nutzungsbedingungen",
    intro: [
      "Diese Bedingungen regeln die Nutzung von https://www.permanent-halle.de und den bereitgestellten Funktionen.",
      "Mit Nutzung der Website akzeptieren Sie diese Bedingungen.",
    ],
    sections: [
      {
        title: "1. Anbieter und Geltungsbereich",
        paragraphs: [
          "Anbieterin ist Salon Elen, Inhaberin Olena Dubrovska, Lessingstr. 37, 06114 Halle (Saale).",
          "Die Bedingungen gelten fuer Besucherinnen/Besucher sowie fuer Nutzerinnen/Nutzer von Buchungs- und Kommunikationsfunktionen.",
        ],
      },
      {
        title: "2. Leistungen",
        paragraphs: [
          "Die Website informiert ueber Leistungen des Salons und ermoeglicht elektronische Terminanfragen bzw. Buchungen.",
          "Einzelne Funktionen koennen zeitweise eingeschraenkt verfuegbar sein.",
        ],
      },
      {
        title: "3. Buchungen und Vertragsschluss",
        paragraphs: [
          "Eine abgesendete Buchung ist zunaechst eine Anfrage bzw. Reservierung im System.",
          "Ein verbindlicher Vertrag kommt erst durch Bestaetigung des Salons oder nach den im Buchungsprozess angezeigten Schritten zustande.",
        ],
      },
      {
        title: "4. Preise, Zahlungen, Storno",
        paragraphs: [
          "Massgeblich sind die im Buchungsprozess oder individuell kommunizierten Preise.",
          "Bei Online-Zahlungen gelten zusaetzlich die Bedingungen der eingesetzten Zahlungsdienstleister.",
          "Storno- oder No-Show-Regelungen werden im konkreten Buchungsprozess bzw. in Terminbestaetigungen mitgeteilt.",
        ],
      },
      {
        title: "5. Pflichten der Nutzerinnen und Nutzer",
        items: [
          "Nur richtige, vollstaendige und aktuelle Angaben machen.",
          "Website nicht missbraeuchlich oder rechtswidrig verwenden.",
          "Keine technischen Angriffe, Manipulationen oder Stoerungen ausfuehren.",
        ],
      },
      {
        title: "6. Verfuegbarkeit",
        paragraphs: [
          "Wir bemuehen uns um eine hohe Verfuegbarkeit, koennen aber eine jederzeit unterbrechungsfreie Nutzung nicht garantieren.",
          "Wartung, Sicherheitsupdates oder Stoerungen koennen zu temporaeren Ausfaellen fuehren.",
        ],
      },
      {
        title: "7. Inhalte, Urheberrecht und Nutzung",
        paragraphs: [
          "Sämtliche Inhalte dieser Website (Texte, Bilder, Struktur, Quelltexte, Datenbanken) sind rechtlich geschuetzt.",
          "Die rein private Informationsnutzung ist zulaessig; weitergehende Nutzung bedarf der vorherigen Zustimmung.",
        ],
      },
      {
        title: "8. KI-gestuetzte Inhalte",
        paragraphs: [
          "Einzelne Inhalte oder Dateien koennen mit KI-Unterstuetzung erstellt, bearbeitet oder uebersetzt worden sein.",
          "Diese Inhalte dienen der Information und ersetzen keine individuelle medizinische, steuerliche oder rechtliche Beratung.",
          "Die Endverantwortung fuer veroeffentlichte Inhalte liegt bei der Betreiberin.",
        ],
      },
      {
        title: "9. Haftung",
        paragraphs: [
          "Unbeschraenkte Haftung besteht bei Vorsatz, grober Fahrlaessigkeit sowie bei Verletzung von Leben, Koerper oder Gesundheit.",
          "Bei leicht fahrlaessiger Verletzung wesentlicher Pflichten ist die Haftung auf den vorhersehbaren, typischen Schaden begrenzt.",
          "Im Uebrigen ist die Haftung im gesetzlich zulaessigen Umfang ausgeschlossen.",
        ],
      },
      {
        title: "10. Externe Links",
        paragraphs: [
          "Bei verlinkten externen Angeboten handelt es sich um fremde Inhalte. Fuer diese sind ausschliesslich die jeweiligen Betreiber verantwortlich.",
        ],
      },
      {
        title: "11. Datenschutz",
        paragraphs: [
          "Details zur Datenverarbeitung finden Sie in der Datenschutzerklaerung.",
        ],
      },
      {
        title: "12. Aenderungen und anwendbares Recht",
        paragraphs: [
          "Wir koennen diese Bedingungen fuer die Zukunft anpassen, insbesondere bei rechtlichen oder technischen Aenderungen.",
          "Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts, soweit zwingendes Verbraucherschutzrecht nicht entgegensteht.",
        ],
      },
      {
        title: "13. Sprachfassungen",
        paragraphs: [
          "Diese Bedingungen koennen in mehreren Sprachen bereitgestellt werden. Massgeblich ist die deutsche Fassung.",
        ],
      },
    ],
    updated: "Stand: 1. April 2026",
  },
  en: {
    title: "Terms of Use",
    intro: [
      "These terms govern the use of https://www.permanent-halle.de and its features.",
      "By using the website, you accept these terms.",
    ],
    sections: [
      {
        title: "1. Provider and scope",
        paragraphs: [
          "Provider: Salon Elen, owner Olena Dubrovska, Lessingstr. 37, 06114 Halle (Saale), Germany.",
          "These terms apply to all visitors and users of booking and communication features.",
        ],
      },
      {
        title: "2. Services",
        paragraphs: [
          "The website provides information about salon services and supports electronic booking requests.",
          "Some features may be temporarily limited or unavailable.",
        ],
      },
      {
        title: "3. Booking and contract formation",
        paragraphs: [
          "Submitting a booking form is initially a request or reservation step.",
          "A binding service contract is formed only after salon confirmation or according to the booking flow shown on the website.",
        ],
      },
      {
        title: "4. Prices, payments, cancellations",
        paragraphs: [
          "The decisive prices are those shown during booking or communicated individually.",
          "Online payments are additionally subject to the terms of the relevant payment provider.",
          "Cancellation/no-show rules are communicated in the specific booking flow or confirmation.",
        ],
      },
      {
        title: "5. User obligations",
        items: [
          "Provide accurate and complete information.",
          "Do not use the website for unlawful or abusive purposes.",
          "Do not perform technical attacks, manipulation, or disruption.",
        ],
      },
      {
        title: "6. Availability",
        paragraphs: [
          "We aim for high availability but cannot guarantee uninterrupted access at all times.",
          "Maintenance, security updates, or outages may lead to temporary downtime.",
        ],
      },
      {
        title: "7. Content and copyright",
        paragraphs: [
          "All website content (texts, images, structure, source code, databases) is legally protected.",
          "Private informational use is allowed; any extended use requires prior permission.",
        ],
      },
      {
        title: "8. AI-assisted content",
        paragraphs: [
          "Some files or content may be created, edited, or translated with AI support.",
          "Such content is informational and does not replace medical, tax, or legal advice.",
          "Final responsibility for published content remains with the operator.",
        ],
      },
      {
        title: "9. Liability",
        paragraphs: [
          "We are fully liable for intent, gross negligence, and injury to life, body, or health.",
          "For slight negligence regarding essential obligations, liability is limited to foreseeable typical damage.",
          "Otherwise, liability is excluded to the extent permitted by law.",
        ],
      },
      {
        title: "10. External links",
        paragraphs: [
          "External links lead to third-party content. Those operators are solely responsible for such content.",
        ],
      },
      {
        title: "11. Privacy",
        paragraphs: [
          "Please see our privacy policy for details on personal data processing.",
        ],
      },
      {
        title: "12. Changes and governing law",
        paragraphs: [
          "We may update these terms for future use, especially due to legal or technical changes.",
          "German law applies, excluding the UN Sales Convention, unless mandatory consumer law requires otherwise.",
        ],
      },
      {
        title: "13. Language versions",
        paragraphs: [
          "These terms may be available in multiple languages. The German version prevails for legal interpretation.",
        ],
      },
    ],
    updated: "Last updated: April 1, 2026",
    languageNote:
      "For legal interpretation, the German-language version of these terms prevails.",
  },
  ru: {
    title: "Условия использования",
    intro: [
      "Эти условия регулируют использование сайта https://www.permanent-halle.de и его функций.",
      "Используя сайт, вы принимаете настоящие условия.",
    ],
    sections: [
      {
        title: "1. Оператор и сфера действия",
        paragraphs: [
          "Оператор: Salon Elen, владелец Olena Dubrovska, Lessingstr. 37, 06114 Halle (Saale), Германия.",
          "Условия действуют для всех посетителей и пользователей функций записи и коммуникации.",
        ],
      },
      {
        title: "2. Сервис",
        paragraphs: [
          "Сайт предоставляет информацию об услугах салона и поддерживает электронные запросы на запись.",
          "Некоторые функции могут быть временно ограничены или недоступны.",
        ],
      },
      {
        title: "3. Запись и заключение договора",
        paragraphs: [
          "Отправка формы записи является запросом/резервированием в системе.",
          "Обязательный договор об услуге возникает только после подтверждения салона или согласно шагам процесса записи.",
        ],
      },
      {
        title: "4. Цены, платежи, отмена",
        paragraphs: [
          "Определяющими являются цены, указанные в процессе записи или согласованные индивидуально.",
          "При онлайн-оплате дополнительно действуют условия соответствующего платежного провайдера.",
          "Правила отмены и no-show сообщаются в конкретном процессе записи или подтверждении.",
        ],
      },
      {
        title: "5. Обязанности пользователя",
        items: [
          "Указывать корректные и полные данные.",
          "Не использовать сайт в незаконных или злоупотребляющих целях.",
          "Не предпринимать технических атак, манипуляций и действий, нарушающих работу сайта.",
        ],
      },
      {
        title: "6. Доступность",
        paragraphs: [
          "Мы стремимся к высокой доступности, но не гарантируем полностью бесперебойный доступ.",
          "Обслуживание, обновления безопасности и сбои могут вызывать временные перерывы.",
        ],
      },
      {
        title: "7. Контент и авторские права",
        paragraphs: [
          "Весь контент сайта (тексты, изображения, структура, исходный код, базы данных) защищен законом.",
          "Допустимо только частное информационное использование; иное требует предварительного согласия.",
        ],
      },
      {
        title: "8. Контент с поддержкой ИИ",
        paragraphs: [
          "Часть файлов и контента может создаваться, редактироваться или переводиться с поддержкой ИИ.",
          "Такой контент носит информационный характер и не заменяет медицинскую, налоговую или юридическую консультацию.",
          "Окончательная ответственность за опубликованный контент остается за оператором.",
        ],
      },
      {
        title: "9. Ответственность",
        paragraphs: [
          "Полная ответственность сохраняется при умысле, грубой неосторожности и вреде жизни/здоровью.",
          "При легкой неосторожности по существенным обязанностям ответственность ограничивается типичным предсказуемым ущербом.",
          "В остальном ответственность исключается в пределах, допустимых законом.",
        ],
      },
      {
        title: "10. Внешние ссылки",
        paragraphs: [
          "Внешние ссылки ведут к контенту третьих лиц. За такой контент отвечают соответствующие операторы.",
        ],
      },
      {
        title: "11. Защита данных",
        paragraphs: [
          "Подробности обработки персональных данных приведены в Политике конфиденциальности.",
        ],
      },
      {
        title: "12. Изменения и применимое право",
        paragraphs: [
          "Мы можем обновлять эти условия на будущее, особенно при юридических или технических изменениях.",
          "Применяется право Германии с исключением Конвенции ООН о купле-продаже, если иное не следует из обязательных норм защиты потребителей.",
        ],
      },
      {
        title: "13. Языковые версии",
        paragraphs: [
          "Условия могут быть доступны на нескольких языках. Для юридического толкования приоритет имеет немецкая версия.",
        ],
      },
    ],
    updated: "Дата обновления: 1 апреля 2026 г.",
    languageNote:
      "При юридических расхождениях приоритет имеет немецкая версия этих условий.",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const alts = buildAlternates("/nutzungsbedingungen", locale);

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

export default async function NutzungsbedingungenPage({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const locale = await resolveContentLocale(searchParams);
  return <LegalDocumentPage doc={docs[locale]} />;
}
