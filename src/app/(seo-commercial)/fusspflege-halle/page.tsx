import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import FootCareLandingPage, {
  type FootCareServiceCard,
} from "@/components/seo/FootCareLandingPage";
import { PUBLIC_SERVICE_CATALOG_TAG } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";
import {
  FOOT_CARE_CATEGORY_SLUG,
  FOOT_CARE_FROM_PRICE_SLUGS,
  FOOT_CARE_IMAGE_BASE_PATH,
  FOOT_CARE_PATH,
  getFootCareGroup,
  getFootCareLandingCopy,
} from "@/lib/foot-care-landing";
import {
  BASE_URL,
  buildAlternates,
  resolveUrlLocale,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";
import { resolveContentLocale } from "@/lib/seo-locale-server";
import { SALON_SCHEMA_ID, WEBSITE_SCHEMA_ID, buildSalonJsonLd } from "@/lib/structured-data";

export const dynamic = "force-dynamic";

const REVALIDATE_SECONDS = 900;

const openGraphLocales: Record<SeoLocale, string> = {
  de: "de_DE",
  en: "en_US",
  ru: "ru_RU",
};

type PageProps = {
  searchParams?: SearchParamsPromise;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const copy = getFootCareLandingCopy(locale);
  const alternates = buildAlternates(FOOT_CARE_PATH, locale);
  const heroImage = `${BASE_URL}${FOOT_CARE_IMAGE_BASE_PATH}/apparative-pedikuere.webp`;

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    keywords: copy.keywords,
    alternates,
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: alternates.canonical,
      siteName: "Salon Elen",
      locale: openGraphLocales[locale],
      type: "website",
      images: [
        {
          url: heroImage,
          width: 1254,
          height: 1254,
          alt: copy.heroTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.metaTitle,
      description: copy.metaDescription,
      images: [heroImage],
    },
  };
}

const getFootCareServices = unstable_cache(
  async (locale: SeoLocale): Promise<FootCareServiceCard[]> => {
    const category = await prisma.service.findFirst({
      where: {
        parentId: null,
        isActive: true,
        isArchived: false,
        OR: [{ slug: FOOT_CARE_CATEGORY_SLUG }, { name: "Fußpflege" }],
      },
      select: { id: true },
    });

    if (!category) return [];

    const services = await prisma.service.findMany({
      where: {
        parentId: category.id,
        isActive: true,
        isArchived: false,
        durationMin: { gt: 0 },
      },
      orderBy: [{ priceCents: "asc" }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        priceCents: true,
        durationMin: true,
        cover: true,
        translations: {
          where: { locale },
          take: 1,
          select: { name: true, description: true },
        },
      },
    });

    return services.map((service) => {
      const translation = service.translations[0];
      return {
        id: service.id,
        slug: service.slug,
        name: translation?.name || service.name,
        description: translation?.description || service.description,
        priceCents: service.priceCents,
        durationMin: service.durationMin,
        cover: service.cover || `${FOOT_CARE_IMAGE_BASE_PATH}/${service.slug}.webp`,
        group: getFootCareGroup(service.slug),
        isFromPrice: FOOT_CARE_FROM_PRICE_SLUGS.has(service.slug),
      };
    });
  },
  ["foot-care-landing-services-v2"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: [PUBLIC_SERVICE_CATALOG_TAG],
  },
);

function buildJsonLd(
  locale: SeoLocale,
  copy: ReturnType<typeof getFootCareLandingCopy>,
  services: FootCareServiceCard[],
) {
  const url = buildAlternates(FOOT_CARE_PATH, locale).canonical;
  const serviceId = `${url}#foot-care-service`;
  const catalogId = `${url}#offer-catalog`;
  const webpageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildSalonJsonLd({
        image: [
          `${BASE_URL}${FOOT_CARE_IMAGE_BASE_PATH}/apparative-pedikuere.webp`,
          `${BASE_URL}${FOOT_CARE_IMAGE_BASE_PATH}/klassische-pedikuere.webp`,
          `${BASE_URL}${FOOT_CARE_IMAGE_BASE_PATH}/mobile-intensive-fusspflege.webp`,
        ],
      }),
      {
        "@type": "WebPage",
        "@id": webpageId,
        url,
        name: copy.metaTitle,
        description: copy.metaDescription,
        inLanguage: locale,
        isPartOf: { "@id": WEBSITE_SCHEMA_ID },
        about: { "@id": serviceId },
        breadcrumb: { "@id": breadcrumbId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${BASE_URL}${FOOT_CARE_IMAGE_BASE_PATH}/apparative-pedikuere.webp`,
          width: 1254,
          height: 1254,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: copy.breadcrumbHome,
            item: `${BASE_URL}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: copy.breadcrumbCurrent,
            item: url,
          },
        ],
      },
      {
        "@type": "Service",
        "@id": serviceId,
        url,
        name: copy.breadcrumbCurrent,
        description: copy.metaDescription,
        serviceType: ["Fußpflege", "Pediküre", "Mobile Fußpflege"],
        provider: { "@id": SALON_SCHEMA_ID },
        areaServed: [
          { "@type": "City", name: "Halle (Saale)" },
          "Saalekreis",
        ],
        availableLanguage: ["de", "en", "ru"],
        hasOfferCatalog: { "@id": catalogId },
      },
      {
        "@type": "OfferCatalog",
        "@id": catalogId,
        name: copy.catalogTitle,
        url,
        itemListElement: services.map((service, index) => ({
          "@type": "Offer",
          position: index + 1,
          url: `${url}#service-${service.slug}`,
          availability: "https://schema.org/InStock",
          ...(typeof service.priceCents === "number"
            ? {
                price: (service.priceCents / 100).toFixed(2),
                priceCurrency: "EUR",
              }
            : {}),
          itemOffered: {
            "@type": "Service",
            name: service.name,
            ...(service.description ? { description: service.description } : {}),
            serviceType: copy.groups.find((group) => group.key === service.group)?.title,
            duration: `PT${service.durationMin}M`,
            provider: { "@id": SALON_SCHEMA_ID },
            areaServed: { "@type": "City", name: "Halle (Saale)" },
          },
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: locale,
        mainEntity: copy.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export default async function FootCareHallePage({ searchParams }: PageProps) {
  const locale = await resolveContentLocale(searchParams);
  const copy = getFootCareLandingCopy(locale);
  const services = await getFootCareServices(locale);
  const jsonLd = buildJsonLd(locale, copy, services);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <FootCareLandingPage locale={locale} copy={copy} services={services} />
    </>
  );
}
