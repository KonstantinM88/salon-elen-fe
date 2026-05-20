import { BASE_URL } from "@/lib/seo-locale";

export const SALON_SCHEMA_ID = `${BASE_URL}/#salon`;
export const WEBSITE_SCHEMA_ID = `${BASE_URL}/#website`;

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

export function buildSalonJsonLd(extra: Record<string, unknown> = {}) {
  return {
    "@type": ["BeautySalon", "LocalBusiness"],
    "@id": SALON_SCHEMA_ID,
    name: "Salon Elen",
    url: BASE_URL,
    image: [`${BASE_URL}/images/hero.webp`],
    telephone: "+49 177 899 51 06",
    email: "elen69@web.de",
    priceRange: "$$",
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
      "Powder Brows",
      "Lip pigmentation",
      "Lashline enhancement",
      "Nail design",
      "Manicure",
      "Microneedling",
      "Cosmetic treatments",
    ],
    sameAs: ["https://www.instagram.com/salon_elen_halle/"],
    ...extra,
  };
}
