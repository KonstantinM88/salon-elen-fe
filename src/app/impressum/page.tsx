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
  de: "Impressum — Salon Elen",
  en: "Legal Notice — Salon Elen",
  ru: "Impressum — Salon Elen",
};

const metaDescriptions: Record<SeoLocale, string> = {
  de: "Rechtliche Anbieterkennzeichnung von Salon Elen gemaess § 5 DDG.",
  en: "Legal notice and provider information for Salon Elen.",
  ru: "Правовая информация и реквизиты Salon Elen.",
};

const docs: Record<SeoLocale, LegalDocument> = {
  de: {
    title: "Impressum",
    intro: [
      "Angaben gemaess § 5 DDG und § 18 Abs. 2 MStV.",
      "Dieses Impressum gilt fuer https://www.permanent-halle.de.",
    ],
    sections: [
      {
        title: "Diensteanbieterin",
        items: [
          "Salon Elen",
          "Inhaberin: Olena Dubrovska",
          "Lessingstr. 37, 06114 Halle (Saale), Deutschland",
          "Internet: https://www.permanent-halle.de",
        ],
      },
      {
        title: "Kontakt",
        items: ["Telefon: +49 177 899 5106", "E-Mail: elen69@web.de"],
      },
      {
        title: "Kammerzugehoerigkeit",
        items: [
          "Handwerkskammer Halle (Saale)",
          "Mitgliedsnummer: 2403582",
        ],
      },
      {
        title: "Inhaltlich verantwortlich",
        paragraphs: [
          "Olena Dubrovska, Anschrift wie oben, gemaess § 18 Abs. 2 MStV.",
        ],
      },
      {
        title: "Verbraucherstreitbeilegung",
        paragraphs: [
          "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).",
        ],
      },
      {
        title: "EU-Streitbeilegung (ODR)",
        paragraphs: [
          "Die EU-ODR-Plattform wurde am 20. Juli 2025 eingestellt (Verordnung (EU) 2024/3228).",
          "Der bisherige Link https://ec.europa.eu/consumers/odr ist nicht mehr verfuegbar.",
        ],
      },
      {
        title: "Haftungshinweis",
        paragraphs: [
          "Fuer eigene Inhalte erstellen wir die Informationen mit groesstmoeglicher Sorgfalt, uebernehmen jedoch keine Gewaehr fuer Vollstaendigkeit und Aktualitaet.",
          "Bei externen Links sind ausschliesslich deren Betreiber verantwortlich.",
        ],
      },
      {
        title: "Urheberrecht",
        paragraphs: [
          "Texte, Bilder, Design und sonstige Inhalte dieser Website sind urheberrechtlich geschuetzt.",
          "Jede Nutzung ausserhalb der gesetzlichen Grenzen bedarf der vorherigen Zustimmung der Rechteinhaberin.",
        ],
      },
      {
        title: "Hinweis zu KI-gestuetzten Inhalten",
        paragraphs: [
          "Einzelne Dateien und Inhalte der Website koennen mit KI-Unterstuetzung erstellt oder vorbearbeitet worden sein.",
          "Die redaktionelle und rechtliche Endverantwortung liegt bei der Inhaberin.",
        ],
      },
    ],
    updated: "Stand: 1. April 2026",
  },
  en: {
    title: "Legal Notice",
    intro: [
      "Information pursuant to Section 5 DDG and Section 18 (2) MStV (Germany).",
      "This legal notice applies to https://www.permanent-halle.de.",
    ],
    sections: [
      {
        title: "Service provider",
        items: [
          "Salon Elen",
          "Owner: Olena Dubrovska",
          "Lessingstr. 37, 06114 Halle (Saale), Germany",
          "Website: https://www.permanent-halle.de",
        ],
      },
      {
        title: "Contact",
        items: ["Phone: +49 177 899 5106", "E-mail: elen69@web.de"],
      },
      {
        title: "Chamber membership",
        items: [
          "Chamber of Crafts Halle (Saale)",
          "Membership no.: 2403582",
        ],
      },
      {
        title: "Editorial responsibility",
        paragraphs: [
          "Responsible for editorial content under Section 18 (2) MStV: Olena Dubrovska, address as above.",
        ],
      },
      {
        title: "Consumer dispute resolution",
        paragraphs: [
          "We are neither willing nor obliged to participate in consumer arbitration proceedings (Section 36 VSBG).",
        ],
      },
      {
        title: "EU ODR platform",
        paragraphs: [
          "The EU ODR platform was discontinued on July 20, 2025 (Regulation (EU) 2024/3228).",
          "The former URL https://ec.europa.eu/consumers/odr is no longer available.",
        ],
      },
      {
        title: "Liability and links",
        paragraphs: [
          "We prepare our own content carefully but cannot guarantee full accuracy or completeness.",
          "Third-party websites linked from this website are the sole responsibility of their operators.",
        ],
      },
      {
        title: "Copyright",
        paragraphs: [
          "Texts, images, and all other content on this website are protected by copyright.",
        ],
      },
      {
        title: "AI-assisted materials",
        paragraphs: [
          "Some files or content may be generated or pre-processed with AI tools.",
          "Final editorial and legal responsibility remains with the owner.",
        ],
      },
    ],
    updated: "Last updated: April 1, 2026",
    languageNote:
      "For legal interpretation, the German-language version of this legal notice prevails.",
  },
  ru: {
    title: "Impressum (Правовая информация)",
    intro: [
      "Сведения в соответствии с § 5 DDG и § 18 абз. 2 MStV (Германия).",
      "Этот раздел применяется к сайту https://www.permanent-halle.de.",
    ],
    sections: [
      {
        title: "Поставщик услуг",
        items: [
          "Salon Elen",
          "Владелец: Olena Dubrovska",
          "Lessingstr. 37, 06114 Halle (Saale), Германия",
          "Сайт: https://www.permanent-halle.de",
        ],
      },
      {
        title: "Контакты",
        items: ["Телефон: +49 177 899 5106", "E-mail: elen69@web.de"],
      },
      {
        title: "Членство в палате ремесел",
        items: [
          "Handwerkskammer Halle (Saale)",
          "Членский номер: 2403582",
        ],
      },
      {
        title: "Ответственный за редакционный контент",
        paragraphs: [
          "Olena Dubrovska, адрес указан выше, согласно § 18 абз. 2 MStV.",
        ],
      },
      {
        title: "Потребительские споры",
        paragraphs: [
          "Мы не обязаны и не готовы участвовать в процедурах потребительского арбитража (§ 36 VSBG).",
        ],
      },
      {
        title: "Платформа ЕС ODR",
        paragraphs: [
          "Платформа ЕС ODR прекращена 20 июля 2025 года (Регламент (EU) 2024/3228).",
          "Ссылка https://ec.europa.eu/consumers/odr больше недоступна.",
        ],
      },
      {
        title: "Ответственность и внешние ссылки",
        paragraphs: [
          "Мы тщательно готовим собственный контент, но не можем гарантировать абсолютную полноту и актуальность.",
          "За содержание внешних ссылок отвечают соответствующие владельцы ресурсов.",
        ],
      },
      {
        title: "Авторское право",
        paragraphs: [
          "Тексты, изображения и иные материалы сайта защищены авторским правом.",
        ],
      },
      {
        title: "Материалы с поддержкой ИИ",
        paragraphs: [
          "Часть файлов и контента сайта может быть создана или предварительно обработана с помощью ИИ.",
          "Окончательная редакционная и юридическая ответственность остается за владельцем.",
        ],
      },
    ],
    updated: "Дата обновления: 1 апреля 2026 г.",
    languageNote:
      "При юридических расхождениях приоритет имеет немецкая версия этого раздела.",
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const alts = buildAlternates("/impressum", locale);

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

export default async function ImpressumPage({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const locale = await resolveContentLocale(searchParams);
  return <LegalDocumentPage doc={docs[locale]} />;
}
