import { BASE_URL } from "@/lib/seo-locale";

export const SALON_SCHEMA_ID = `${BASE_URL}/#salon`;
export const WEBSITE_SCHEMA_ID = `${BASE_URL}/#website`;
export const SALON_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Lessingstrasse+37%2C+06114+Halle+(Saale)";

export const salonAddressJsonLd = {
  "@type": "PostalAddress",
  streetAddress: "Lessingstrasse 37",
  postalCode: "06114",
  addressLocality: "Halle (Saale)",
  addressCountry: "DE",
} as const;

export const salonOpeningHoursJsonLd = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "10:00",
    closes: "19:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Saturday",
    opens: "10:00",
    closes: "16:00",
  },
] as const;

const salonServiceCatalogJsonLd = {
  "@type": "OfferCatalog",
  name: "Salon Elen Beauty Services",
  itemListElement: [
    {
      "@type": "Offer",
      url: `${BASE_URL}/microblading-halle`,
      itemOffered: {
        "@type": "Service",
        name: "Hairstroke Brows / Microblading",
        areaServed: "Halle (Saale)",
        provider: { "@id": SALON_SCHEMA_ID },
      },
    },
    {
      "@type": "Offer",
      url: `${BASE_URL}/powder-brows-halle`,
      itemOffered: {
        "@type": "Service",
        name: "Powder Brows",
        areaServed: "Halle (Saale)",
        provider: { "@id": SALON_SCHEMA_ID },
      },
    },
    {
      "@type": "Offer",
      url: `${BASE_URL}/permanent-make-up-lippen-halle`,
      itemOffered: {
        "@type": "Service",
        name: "Permanent Make-up Lippen",
        areaServed: "Halle (Saale)",
        provider: { "@id": SALON_SCHEMA_ID },
      },
    },
    {
      "@type": "Offer",
      url: `${BASE_URL}/wimpernkranzverdichtung-halle`,
      itemOffered: {
        "@type": "Service",
        name: "Wimpernkranzverdichtung",
        areaServed: "Halle (Saale)",
        provider: { "@id": SALON_SCHEMA_ID },
      },
    },
    {
      "@type": "Offer",
      url: `${BASE_URL}/microneedling-halle`,
      itemOffered: {
        "@type": "Service",
        name: "Microneedling",
        areaServed: "Halle (Saale)",
        provider: { "@id": SALON_SCHEMA_ID },
      },
    },
  ],
} as const;

export function buildSalonJsonLd(extra: Record<string, unknown> = {}) {
  return {
    "@type": ["BeautySalon", "LocalBusiness"],
    "@id": SALON_SCHEMA_ID,
    name: "Salon Elen",
    url: BASE_URL,
    logo: `${BASE_URL}/icon-512x512.png`,
    image: [`${BASE_URL}/images/hero.webp`],
    description:
      "Beauty Salon in Halle (Saale) for permanent make-up, Hairstroke Brows, Powder Brows, lashes and cosmetic skin treatments.",
    telephone: "+49 177 899 51 06",
    email: "elen69@web.de",
    priceRange: "€€",
    currenciesAccepted: "EUR",
    hasMap: SALON_MAP_URL,
    address: salonAddressJsonLd,
    openingHoursSpecification: salonOpeningHoursJsonLd,
    areaServed: [
      {
        "@type": "City",
        name: "Halle (Saale)",
      },
      "Saalekreis",
    ],
    knowsAbout: [
      "Permanent Make-up",
      "Hairstroke Brows",
      "Microblading",
      "Powder Brows",
      "Lip pigmentation",
      "Lashline enhancement",
      "Lash extensions",
      "Microneedling",
      "Cosmetic treatments",
    ],
    hasOfferCatalog: salonServiceCatalogJsonLd,
    sameAs: ["https://www.instagram.com/salon_elen_halle/"],
    ...extra,
  };
}
