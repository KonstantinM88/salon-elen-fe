import { readFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

type Locale = "de" | "en" | "ru";

type LocalizedArticle = {
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
};

const SLUG = "fusspflege-halle-ratgeber";
const COVER = "/images/news/fusspflege-halle-ratgeber.webp";
const OG_IMAGE = "/images/news/fusspflege-halle-ratgeber-og.webp";
const CONTENT_DIR = path.join(process.cwd(), "content", "news");

const COPY: Record<Locale, LocalizedArticle> = {
  de: {
    title: "Fußpflege in Halle: Welche Behandlung passt zu Ihren Füßen?",
    excerpt:
      "Pediküre, Hornhautpflege, sensible Nägel oder Hausbesuch: Dieser Ratgeber hilft Ihnen, die passende Fußpflege in Halle sicher und transparent auszuwählen.",
    seoTitle: "Fußpflege Halle: Pediküre, Hornhautpflege & Beratung",
    seoDescription:
      "Welche Fußpflege passt? Salon Elen in Halle erklärt Pediküre, Hornhaut- und Nagelpflege, Hausbesuche, Vorbereitung, Sicherheit und FAQ.",
    ogTitle: "Welche Fußpflege passt zu mir? Der Halle-Ratgeber",
    ogDescription:
      "Von klassischer Pediküre bis mobile Fußpflege: verständliche Auswahlhilfe, Ablauf, Sicherheit und Antworten von Salon Elen in Halle.",
  },
  en: {
    title: "Foot Care in Halle: Which Treatment Is Right for Your Feet?",
    excerpt:
      "Pedicure, callus care, sensitive nails or a home visit: this guide helps you choose suitable professional foot care in Halle with confidence.",
    seoTitle: "Foot Care Halle: Pedicure, Callus Care & Advice",
    seoDescription:
      "Which foot care is right for you? Salon Elen explains pedicures, callus and nail care, home visits, preparation, safety and FAQs in Halle.",
    ogTitle: "Which Foot Care Is Right for Me? A Halle Guide",
    ogDescription:
      "From classic pedicures to mobile foot care: a clear guide to choosing, preparing and booking at Salon Elen in Halle.",
  },
  ru: {
    title: "Уход за стопами в Галле: какую процедуру выбрать?",
    excerpt:
      "Педикюр, натоптыши, чувствительные ногти или выезд на дом: подробный гид поможет уверенно выбрать подходящий уход за стопами в Галле.",
    seoTitle: "Педикюр в Галле: уход за стопами и консультация",
    seoDescription:
      "Какой педикюр выбрать в Галле? Salon Elen объясняет уход за ногтями и стопами, натоптыши, выезд на дом, подготовку, безопасность и FAQ.",
    ogTitle: "Какой уход за стопами выбрать? Гид по Галле",
    ogDescription:
      "От классического педикюра до выезда на дом: понятный выбор, подготовка, безопасность и запись в Salon Elen в Галле.",
  },
};

async function readContent(locale: Locale): Promise<string> {
  return (
    await readFile(
      path.join(CONTENT_DIR, `fusspflege-halle-ratgeber.${locale}.md`),
      "utf8",
    )
  ).trim();
}

function validateCopy(content: Record<Locale, string>): void {
  const forbidden = new RegExp(["podo", "log"].join(""), "iu");

  for (const locale of ["de", "en", "ru"] as const) {
    const fields = [
      COPY[locale].title,
      COPY[locale].excerpt,
      COPY[locale].seoTitle,
      COPY[locale].seoDescription,
      COPY[locale].ogTitle,
      COPY[locale].ogDescription,
      content[locale],
    ];

    if (fields.some((value) => forbidden.test(value))) {
      throw new Error(`Forbidden terminology found in ${locale} content.`);
    }
    if (!content[locale].includes("/fusspflege-halle")) {
      throw new Error(`Missing Fußpflege landing-page link in ${locale} content.`);
    }
    if (!content[locale].includes("/booking/services")) {
      throw new Error(`Missing booking link in ${locale} content.`);
    }
    if (!content[locale].includes("## ")) {
      throw new Error(`Missing answer-oriented headings in ${locale} content.`);
    }
  }
}

async function main(): Promise<void> {
  loadEnvConfig(process.cwd());

  const apply = process.argv.includes("--apply");
  const publish = process.argv.includes("--publish");

  if (apply && !publish) {
    throw new Error(
      "This project exposes articles with an empty publishedAt. Use --apply --publish together.",
    );
  }

  const content = {
    de: await readContent("de"),
    en: await readContent("en"),
    ru: await readContent("ru"),
  } satisfies Record<Locale, string>;

  validateCopy(content);

  const { prisma } = await import("../src/lib/prisma");

  try {
    const existing = await prisma.article.findUnique({
      where: { slug: SLUG },
      select: {
        id: true,
        publishedAt: true,
        translations: { select: { locale: true } },
      },
    });

    console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`);
    console.log(`Article: ${SLUG}`);
    console.log(`Operation: ${existing ? "update" : "create"}`);
    console.log("Locales: de, en, ru");
    console.log(`Cover: ${COVER}`);
    console.log(`Open Graph image: ${OG_IMAGE}`);
    console.log(
      `Content characters: de=${content.de.length}; en=${content.en.length}; ru=${content.ru.length}`,
    );
    console.log(
      "SEO/GEO/AIO: answer-first introduction, intent table, local Halle context, safety boundaries, internal links and FAQ.",
    );

    if (!apply) {
      console.log("Dry run complete. Use --apply --publish only after the image assets are deployed.");
      return;
    }

    const publishedAt = existing?.publishedAt ?? new Date();

    const article = await prisma.$transaction(async (tx) => {
      const saved = await tx.article.upsert({
        where: { slug: SLUG },
        create: {
          slug: SLUG,
          type: "ARTICLE",
          title: COPY.de.title,
          excerpt: COPY.de.excerpt,
          content: content.de,
          cover: COVER,
          ogImage: OG_IMAGE,
          seoTitle: COPY.de.seoTitle,
          seoDescription: COPY.de.seoDescription,
          ogTitle: COPY.de.ogTitle,
          ogDescription: COPY.de.ogDescription,
          publishedAt,
          isPinned: false,
          sortOrder: 0,
        },
        update: {
          type: "ARTICLE",
          title: COPY.de.title,
          excerpt: COPY.de.excerpt,
          content: content.de,
          cover: COVER,
          ogImage: OG_IMAGE,
          seoTitle: COPY.de.seoTitle,
          seoDescription: COPY.de.seoDescription,
          ogTitle: COPY.de.ogTitle,
          ogDescription: COPY.de.ogDescription,
          publishedAt,
        },
        select: { id: true },
      });

      for (const locale of ["de", "en", "ru"] as const) {
        const localized = COPY[locale];
        await tx.articleTranslation.upsert({
          where: {
            articleId_locale: { articleId: saved.id, locale },
          },
          create: {
            articleId: saved.id,
            locale,
            title: localized.title,
            excerpt: localized.excerpt,
            content: content[locale],
            seoTitle: localized.seoTitle,
            seoDescription: localized.seoDescription,
            ogTitle: localized.ogTitle,
            ogDescription: localized.ogDescription,
          },
          update: {
            title: localized.title,
            excerpt: localized.excerpt,
            content: content[locale],
            seoTitle: localized.seoTitle,
            seoDescription: localized.seoDescription,
            ogTitle: localized.ogTitle,
            ogDescription: localized.ogDescription,
          },
        });
      }

      return saved;
    });

    console.log(`Import completed successfully: ${article.id}`);
    console.log(`Public URL: https://permanent-halle.de/news/${SLUG}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
