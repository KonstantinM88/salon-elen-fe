// src/app/contacts/page.tsx
import type { Metadata } from "next";

import Section from "@/components/section";
import ContactsMapEmbed from "@/components/ContactsMapEmbed";
import AnimatedContactsContent from "@/components/contacts/AnimatedContactsContent";
import AnimatedContactCards from "@/components/contacts/AnimatedContactCards";
import { translate } from "@/i18n/messages";
import {
  resolveUrlLocale,
  resolveContentLocale,
  buildAlternates,
  BASE_URL,
  type SeoLocale,
  type SearchParamsPromise,
} from "@/lib/seo-locale";

import styles from "./contacts.module.css";

const SALON = {
  name: "Salon Elen",
  streetAddress: "Lessingstraße 37",
  postalCode: "06114",
  addressLocality: "Halle (Saale)",
  addressCountry: "DE",
  phone: "+49 177 899 51 06",
  email: "elen69@web.de",
  whatsapp: "491778995106",
  telegram: "salonelen",
  mapsQuery: "Lessingstraße 37, 06114 Halle (Saale)",
};

function localeHref(path: string, locale: SeoLocale) {
  if (locale === "de") return path;
  const hasQuery = path.includes("?");
  return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const alts = buildAlternates("/contacts", locale);

  const title =
    locale === "de"
      ? "Kontakt — Salon Elen"
      : locale === "en"
        ? "Contact — Salon Elen"
        : "Контакты — Salon Elen";

  const description = translate(locale, "contacts_seo_description");

  return {
    metadataBase: undefined,
    title,
    description,
    alternates: alts,
    openGraph: {
      title,
      description,
      url: alts.canonical,
      images: [`${BASE_URL}/images/hero.webp`],
      siteName: "Salon Elen",
      locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
      type: "website",
    },
  };
}

function jsonLd(locale: SeoLocale) {
  const alts = buildAlternates("/contacts", locale);
  const data = {
    "@context": "https://schema.org",
    "@type": ["BeautySalon", "LocalBusiness"],
    name: SALON.name,
    telephone: SALON.phone,
    email: SALON.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: SALON.streetAddress,
      postalCode: SALON.postalCode,
      addressLocality: SALON.addressLocality,
      addressCountry: SALON.addressCountry,
    },
    url: alts.canonical,
    openingHoursSpecification: [
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
    ],
  };
  return JSON.stringify(data);
}

function mailtoLink(locale: SeoLocale) {
  const subject =
    locale === "de"
      ? "Anfrage – Salon Elen"
      : locale === "en"
        ? "Inquiry – Salon Elen"
        : "Запрос — Salon Elen";

  const body =
    locale === "de"
      ? "Hallo!\n\nIch möchte einen Termin / eine Beratung.\n\nName:\nTelefon:\nNachricht:\n\nVielen Dank!"
      : locale === "en"
        ? "Hi!\n\nI'd like to book an appointment / ask a question.\n\nName:\nPhone:\nMessage:\n\nThank you!"
        : "Здравствуйте!\n\nХочу записаться / задать вопрос.\n\nИмя:\nТелефон:\nСообщение:\n\nСпасибо!";

  return `mailto:${SALON.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function whatsappLink(locale: SeoLocale) {
  const text =
    locale === "de"
      ? "Hallo! Ich möchte einen Termin vereinbaren."
      : locale === "en"
        ? "Hello! I'd like to book an appointment."
        : "Здравствуйте! Хочу записаться на приём.";
  return `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(text)}`;
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const locale = await resolveContentLocale(searchParams);
  const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);

  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(SALON.mapsQuery);

  const embedUrl =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(SALON.mapsQuery) +
    "&z=15&output=embed";

  const localizedLocaleHref = (path: string) => localeHref(path, locale);

  return (
    <main className="relative bg-gradient-to-b from-pink-50/60 via-rose-50/30 to-white dark:from-transparent dark:via-transparent dark:to-transparent">
      {/* Background gradients */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={[
            "absolute -top-28 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-3xl",
            "bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.22),transparent_60%)]",
            "dark:bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.14),transparent_60%)]",
            styles.orbFloat,
          ].join(" ")}
        />
        <div
          className={[
            "absolute -bottom-28 -left-28 h-[520px] w-[520px] rounded-full blur-3xl",
            "bg-[radial-gradient(circle_at_center,rgba(251,113,133,0.20),transparent_60%)]",
            "dark:bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.10),transparent_60%)]",
            styles.orbFloat2,
          ].join(" ")}
        />
        <div
          className={[
            "absolute -bottom-40 right-[-80px] h-[620px] w-[620px] rounded-full blur-3xl",
            "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_60%)]",
            "dark:bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.10),transparent_60%)]",
            styles.orbFloat3,
          ].join(" ")}
        />
        <div className={["absolute inset-0", styles.noiseMask].join(" ")} />
      </div>

      {/* HERO */}
      <section className="relative pt-8 sm:pt-12 lg:pt-14">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl border border-pink-200/40 bg-white/80 shadow-lg shadow-pink-100/15 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/60 dark:shadow-none">
            {/* Inner gradients */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_12%_18%,rgba(236,72,153,0.12),transparent_60%),radial-gradient(900px_circle_at_88%_28%,rgba(251,191,36,0.10),transparent_60%),radial-gradient(900px_circle_at_40%_98%,rgba(244,114,182,0.08),transparent_60%)] dark:bg-[radial-gradient(900px_circle_at_12%_18%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(900px_circle_at_88%_28%,rgba(168,85,247,0.10),transparent_62%),radial-gradient(900px_circle_at_40%_98%,rgba(56,189,248,0.08),transparent_62%)]" />
              <div className={["absolute inset-0", styles.shimmerLine].join(" ")} />
            </div>

            <AnimatedContactsContent
             locale={locale}
             salon={SALON}
              mapsUrl={mapsUrl}
             mailtoLink={mailtoLink(locale)}
             whatsappLink={whatsappLink(locale)}
            />

            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-300/20 to-transparent dark:via-white/10" />
          </div>
        </div>
      </section>

      {/* Map & Contact Section */}
      <Section title={t("contacts_map_title")} subtitle={t("contacts_quick_title")} className="relative">
        <div className="grid gap-6 lg:grid-cols-2">
          <ContactsMapEmbed
            title={t("contacts_map_title")}
            caption={t("contacts_map_caption")}
            openMapsLabel={t("contacts_open_maps")}
            showMapLabel={t("contacts_show_map")}
            privacyNote={t("contacts_map_privacy")}
            previewImageSrc="/images/cta.jpg"
            previewAlt={t("contacts_map_title")}
            mapsUrl={mapsUrl}
            embedUrl={embedUrl}
            eagerDesktop
          />

          {/* Contact Cards */}
          <div className="relative overflow-hidden rounded-3xl border border-pink-200/30 bg-white/85 shadow-lg shadow-pink-100/15 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60 dark:shadow-none">
            <div className="absolute inset-0 bg-[radial-gradient(650px_circle_at_25%_15%,rgba(236,72,153,0.10),transparent_60%),radial-gradient(650px_circle_at_85%_35%,rgba(251,191,36,0.08),transparent_60%)] dark:bg-[radial-gradient(650px_circle_at_25%_15%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(650px_circle_at_85%_35%,rgba(56,189,248,0.08),transparent_62%)]" />
            <div className="relative p-5 sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
                {t("contacts_form_title")}
              </h2>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {t("contacts_form_note")}
              </p>

              <div className="mt-6">
                <AnimatedContactCards
                  locale={locale}
                  salon={SALON}
                  mailtoLink={mailtoLink(locale)}
                  whatsappLink={whatsappLink(locale)}
                />
              </div>
            </div>
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(locale) }} />
      </Section>
    </main>
  );
}



//-----работал до 14.02.26 исправляем для SEO
// // src/app/contacts/page.tsx
// import type { Metadata } from "next";
// import { cookies } from "next/headers";

// import Section from "@/components/section";
// import ContactsMapEmbed from "@/components/ContactsMapEmbed";
// import AnimatedContactsContent from "@/components/contacts/AnimatedContactsContent";
// import AnimatedContactCards from "@/components/contacts/AnimatedContactCards";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// import styles from "./contacts.module.css";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";

// const SALON = {
//   name: "Salon Elen",
//   streetAddress: "Lessingstraße 37",
//   postalCode: "06114",
//   addressLocality: "Halle (Saale)",
//   addressCountry: "DE",
//   phone: "+49 177 899 51 06",
//   email: "elen69@web.de",
//   whatsapp: "491778995106",
//   telegram: "salonelen",
//   mapsQuery: "Lessingstraße 37, 06114 Halle (Saale)",
// };

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   searchParams?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const sp = searchParams ? await searchParams : undefined;
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return DEFAULT_LOCALE;
// }

// function pageUrl(locale: Locale) {
//   if (locale === "de") return `${SITE_URL}/contacts`;
//   return `${SITE_URL}/contacts?lang=${locale}`;
// }

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   const hasQuery = path.includes("?");
//   return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
// }

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   const title =
//     locale === "de"
//       ? "Kontakt — Salon Elen"
//       : locale === "en"
//         ? "Contact — Salon Elen"
//         : "Контакты — Salon Elen";

//   const description = translate(locale, "contacts_seo_description");

//   return {
//     metadataBase: undefined,
//     title,
//     description,
//     alternates: {
//       canonical: pageUrl(locale),
//       languages: {
//         de: pageUrl("de"),
//         en: pageUrl("en"),
//         ru: pageUrl("ru"),
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url: pageUrl(locale),
//       images: ["/images/hero.webp"],
//       siteName: "Salon Elen",
//       locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
//       type: "website",
//     },
//   };
// }

// function jsonLd(locale: Locale) {
//   const data = {
//     "@context": "https://schema.org",
//     "@type": ["BeautySalon", "LocalBusiness"],
//     name: SALON.name,
//     telephone: SALON.phone,
//     email: SALON.email,
//     address: {
//       "@type": "PostalAddress",
//       streetAddress: SALON.streetAddress,
//       postalCode: SALON.postalCode,
//       addressLocality: SALON.addressLocality,
//       addressCountry: SALON.addressCountry,
//     },
//     url: pageUrl(locale),
//     openingHoursSpecification: [
//       {
//         "@type": "OpeningHoursSpecification",
//         dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
//         opens: "10:00",
//         closes: "19:00",
//       },
//       {
//         "@type": "OpeningHoursSpecification",
//         dayOfWeek: "Saturday",
//         opens: "10:00",
//         closes: "16:00",
//       },
//     ],
//   };
//   return JSON.stringify(data);
// }

// function mailtoLink(locale: Locale) {
//   const subject =
//     locale === "de"
//       ? "Anfrage – Salon Elen"
//       : locale === "en"
//         ? "Inquiry – Salon Elen"
//         : "Запрос — Salon Elen";

//   const body =
//     locale === "de"
//       ? "Hallo!\n\nIch möchte einen Termin / eine Beratung.\n\nName:\nTelefon:\nNachricht:\n\nVielen Dank!"
//       : locale === "en"
//         ? "Hi!\n\nI'd like to book an appointment / ask a question.\n\nName:\nPhone:\nMessage:\n\nThank you!"
//         : "Здравствуйте!\n\nХочу записаться / задать вопрос.\n\nИмя:\nТелефон:\nСообщение:\n\nСпасибо!";

//   return `mailto:${SALON.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
// }

// function whatsappLink(locale: Locale) {
//   const text =
//     locale === "de"
//       ? "Hallo! Ich möchte einen Termin vereinbaren."
//       : locale === "en"
//         ? "Hello! I'd like to book an appointment."
//         : "Здравствуйте! Хочу записаться на приём.";
//   return `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(text)}`;
// }

// export default async function ContactsPage({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }) {
//   const locale = await resolveLocale(searchParams);
//   const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);

//   const mapsUrl =
//     "https://www.google.com/maps/search/?api=1&query=" +
//     encodeURIComponent(SALON.mapsQuery);

//   const embedUrl =
//     "https://www.google.com/maps?q=" +
//     encodeURIComponent(SALON.mapsQuery) +
//     "&z=15&output=embed";

//   const localizedLocaleHref = (path: string) => localeHref(path, locale);

//   return (
//     <main className="relative bg-gradient-to-b from-pink-50/60 via-rose-50/30 to-white dark:from-transparent dark:via-transparent dark:to-transparent">
//       {/* Background gradients */}
//       <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div
//           className={[
//             "absolute -top-28 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.22),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.14),transparent_60%)]",
//             styles.orbFloat,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-28 -left-28 h-[520px] w-[520px] rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(251,113,133,0.20),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.10),transparent_60%)]",
//             styles.orbFloat2,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-40 right-[-80px] h-[620px] w-[620px] rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.10),transparent_60%)]",
//             styles.orbFloat3,
//           ].join(" ")}
//         />
//         <div className={["absolute inset-0", styles.noiseMask].join(" ")} />
//       </div>

//       {/* HERO */}
//       <section className="relative pt-8 sm:pt-12 lg:pt-14">
//         <div className="container">
//           <div className="relative overflow-hidden rounded-3xl border border-pink-200/40 bg-white/80 shadow-lg shadow-pink-100/15 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/60 dark:shadow-none">
//             {/* Inner gradients */}
//             <div className="absolute inset-0">
//               <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_12%_18%,rgba(236,72,153,0.12),transparent_60%),radial-gradient(900px_circle_at_88%_28%,rgba(251,191,36,0.10),transparent_60%),radial-gradient(900px_circle_at_40%_98%,rgba(244,114,182,0.08),transparent_60%)] dark:bg-[radial-gradient(900px_circle_at_12%_18%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(900px_circle_at_88%_28%,rgba(168,85,247,0.10),transparent_62%),radial-gradient(900px_circle_at_40%_98%,rgba(56,189,248,0.08),transparent_62%)]" />
//               <div className={["absolute inset-0", styles.shimmerLine].join(" ")} />
//             </div>

//             <AnimatedContactsContent
//              locale={locale}
//              salon={SALON}
//               mapsUrl={mapsUrl}
//              mailtoLink={mailtoLink(locale)}
//              whatsappLink={whatsappLink(locale)}
//             />

//             <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-300/20 to-transparent dark:via-white/10" />
//           </div>
//         </div>
//       </section>

//       {/* Map & Contact Section */}
//       <Section title={t("contacts_map_title")} subtitle={t("contacts_quick_title")} className="relative">
//         <div className="grid gap-6 lg:grid-cols-2">
//           <ContactsMapEmbed
//             title={t("contacts_map_title")}
//             caption={t("contacts_map_caption")}
//             openMapsLabel={t("contacts_open_maps")}
//             showMapLabel={t("contacts_show_map")}
//             privacyNote={t("contacts_map_privacy")}
//             previewImageSrc="/images/cta.jpg"
//             previewAlt={t("contacts_map_title")}
//             mapsUrl={mapsUrl}
//             embedUrl={embedUrl}
//             eagerDesktop
//           />

//           {/* Contact Cards */}
//           <div className="relative overflow-hidden rounded-3xl border border-pink-200/30 bg-white/85 shadow-lg shadow-pink-100/15 backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60 dark:shadow-none">
//             <div className="absolute inset-0 bg-[radial-gradient(650px_circle_at_25%_15%,rgba(236,72,153,0.10),transparent_60%),radial-gradient(650px_circle_at_85%_35%,rgba(251,191,36,0.08),transparent_60%)] dark:bg-[radial-gradient(650px_circle_at_25%_15%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(650px_circle_at_85%_35%,rgba(56,189,248,0.08),transparent_62%)]" />
//             <div className="relative p-5 sm:p-6">
//               <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
//                 {t("contacts_form_title")}
//               </h2>
//               <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
//                 {t("contacts_form_note")}
//               </p>

//               <div className="mt-6">
//                 <AnimatedContactCards
//                   locale={locale}
//                   salon={SALON}
//                   mailtoLink={mailtoLink(locale)}
//                   whatsappLink={whatsappLink(locale)}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(locale) }} />
//       </Section>
//     </main>
//   );
// }


//--------пробую улучшить анимацию заднего фона херо, добавив звёздное небо, на тёмном фоне хорошо а белая тема не очень
// // src/app/contacts/page.tsx
// import type { Metadata } from "next";
// import { cookies } from "next/headers";

// import Section from "@/components/section";
// import ContactsMapEmbed from "@/components/ContactsMapEmbed";
// import AnimatedContactsContent from "@/components/contacts/AnimatedContactsContent";
// import AnimatedContactCards from "@/components/contacts/AnimatedContactCards";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// import styles from "./contacts.module.css";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";

// const SALON = {
//   name: "Salon Elen",
//   streetAddress: "Lessingstraße 37",
//   postalCode: "06114",
//   addressLocality: "Halle (Saale)",
//   addressCountry: "DE",
//   phone: "+49 177 899 51 06",
//   email: "elen69@web.de",
//   whatsapp: "491778995106",
//   telegram: "salonelen",
//   mapsQuery: "Lessingstraße 37, 06114 Halle (Saale)",
// };

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   searchParams?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const sp = searchParams ? await searchParams : undefined;
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return DEFAULT_LOCALE;
// }

// function pageUrl(locale: Locale) {
//   if (locale === "de") return `${SITE_URL}/contacts`;
//   return `${SITE_URL}/contacts?lang=${locale}`;
// }

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   const hasQuery = path.includes("?");
//   return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
// }

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   const title =
//     locale === "de"
//       ? "Kontakt — Salon Elen"
//       : locale === "en"
//         ? "Contact — Salon Elen"
//         : "Контакты — Salon Elen";

//   const description = translate(locale, "contacts_seo_description");

//   return {
//     metadataBase: undefined,
//     title,
//     description,
//     alternates: {
//       canonical: pageUrl(locale),
//       languages: {
//         de: pageUrl("de"),
//         en: pageUrl("en"),
//         ru: pageUrl("ru"),
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url: pageUrl(locale),
//       images: ["/images/hero.webp"],
//       siteName: "Salon Elen",
//       locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
//       type: "website",
//     },
//   };
// }

// function jsonLd(locale: Locale) {
//   const data = {
//     "@context": "https://schema.org",
//     "@type": ["BeautySalon", "LocalBusiness"],
//     name: SALON.name,
//     telephone: SALON.phone,
//     email: SALON.email,
//     address: {
//       "@type": "PostalAddress",
//       streetAddress: SALON.streetAddress,
//       postalCode: SALON.postalCode,
//       addressLocality: SALON.addressLocality,
//       addressCountry: SALON.addressCountry,
//     },
//     url: pageUrl(locale),
//     openingHoursSpecification: [
//       {
//         "@type": "OpeningHoursSpecification",
//         dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
//         opens: "10:00",
//         closes: "19:00",
//       },
//       {
//         "@type": "OpeningHoursSpecification",
//         dayOfWeek: "Saturday",
//         opens: "10:00",
//         closes: "16:00",
//       },
//     ],
//   };
//   return JSON.stringify(data);
// }

// function mailtoLink(locale: Locale) {
//   const subject =
//     locale === "de"
//       ? "Anfrage – Salon Elen"
//       : locale === "en"
//         ? "Inquiry – Salon Elen"
//         : "Запрос — Salon Elen";

//   const body =
//     locale === "de"
//       ? "Hallo!\n\nIch möchte einen Termin / eine Beratung.\n\nName:\nTelefon:\nNachricht:\n\nVielen Dank!"
//       : locale === "en"
//         ? "Hi!\n\nI'd like to book an appointment / ask a question.\n\nName:\nPhone:\nMessage:\n\nThank you!"
//         : "Здравствуйте!\n\nХочу записаться / задать вопрос.\n\nИмя:\nТелефон:\nСообщение:\n\nСпасибо!";

//   return `mailto:${SALON.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
// }

// function whatsappLink(locale: Locale) {
//   const text =
//     locale === "de"
//       ? "Hallo! Ich möchte einen Termin vereinbaren."
//       : locale === "en"
//         ? "Hello! I'd like to book an appointment."
//         : "Здравствуйте! Хочу записаться на приём.";
//   return `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(text)}`;
// }

// export default async function ContactsPage({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }) {
//   const locale = await resolveLocale(searchParams);
//   const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);

//   const mapsUrl =
//     "https://www.google.com/maps/search/?api=1&query=" +
//     encodeURIComponent(SALON.mapsQuery);

//   const embedUrl =
//     "https://www.google.com/maps?q=" +
//     encodeURIComponent(SALON.mapsQuery) +
//     "&z=15&output=embed";

//   const localizedLocaleHref = (path: string) => localeHref(path, locale);

//   return (
//     <main className="relative">
//       {/* Background gradients */}
//       <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div
//           className={[
//             "absolute -top-28 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.30),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.14),transparent_60%)]",
//             styles.orbFloat,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-28 -left-28 h-[520px] w-[520px] rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.20),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.10),transparent_60%)]",
//             styles.orbFloat2,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-40 right-[-80px] h-[620px] w-[620px] rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.10),transparent_60%)]",
//             styles.orbFloat3,
//           ].join(" ")}
//         />
//         <div className={["absolute inset-0", styles.noiseMask].join(" ")} />
//       </div>

//       {/* HERO */}
//       <section className="relative pt-8 sm:pt-12 lg:pt-14">
//         <div className="container">
//           <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/75 shadow-soft backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/60">
//             {/* Inner gradients */}
//             <div className="absolute inset-0">
//               <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_12%_18%,rgba(255,193,7,0.22),transparent_60%),radial-gradient(900px_circle_at_88%_28%,rgba(236,72,153,0.14),transparent_60%),radial-gradient(900px_circle_at_40%_98%,rgba(56,189,248,0.12),transparent_60%)] dark:bg-[radial-gradient(900px_circle_at_12%_18%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(900px_circle_at_88%_28%,rgba(168,85,247,0.10),transparent_62%),radial-gradient(900px_circle_at_40%_98%,rgba(56,189,248,0.08),transparent_62%)]" />
//               <div className={["absolute inset-0", styles.shimmerLine].join(" ")} />
//             </div>

//             <AnimatedContactsContent
//              locale={locale}
//              salon={SALON}
//               mapsUrl={mapsUrl}
//              mailtoLink={mailtoLink(locale)}
//              whatsappLink={whatsappLink(locale)}
//             />

//             <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-900/10 to-transparent dark:via-white/10" />
//           </div>
//         </div>
//       </section>

//       {/* Map & Contact Section */}
//       <Section title={t("contacts_map_title")} subtitle={t("contacts_quick_title")} className="relative">
//         <div className="grid gap-6 lg:grid-cols-2">
//           <ContactsMapEmbed
//             title={t("contacts_map_title")}
//             caption={t("contacts_map_caption")}
//             openMapsLabel={t("contacts_open_maps")}
//             showMapLabel={t("contacts_show_map")}
//             privacyNote={t("contacts_map_privacy")}
//             previewImageSrc="/images/cta.jpg"
//             previewAlt={t("contacts_map_title")}
//             mapsUrl={mapsUrl}
//             embedUrl={embedUrl}
//             eagerDesktop
//           />

//           {/* Contact Cards */}
//           <div className="relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
//             <div className="absolute inset-0 bg-[radial-gradient(650px_circle_at_25%_15%,rgba(255,193,7,0.18),transparent_60%),radial-gradient(650px_circle_at_85%_35%,rgba(236,72,153,0.12),transparent_60%)] dark:bg-[radial-gradient(650px_circle_at_25%_15%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(650px_circle_at_85%_35%,rgba(56,189,248,0.08),transparent_62%)]" />
//             <div className="relative p-5 sm:p-6">
//               <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
//                 {t("contacts_form_title")}
//               </h2>
//               <p className="mt-1 text-sm text-gray-800/80 dark:text-gray-300">
//                 {t("contacts_form_note")}
//               </p>

//               <div className="mt-6">
//                 <AnimatedContactCards
//                   locale={locale}
//                   salon={SALON}
//                   mailtoLink={mailtoLink(locale)}
//                   whatsappLink={whatsappLink(locale)}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(locale) }} />
//       </Section>
//     </main>
//   );
// }


//--------рабочий файл с анимацией заднего фона херо звёздное небо, на тёмном фоне хорошо а белая тема не очень
// // src/app/contacts/page.tsx
// import type { Metadata } from "next";
// import { cookies } from "next/headers";

// import Section from "@/components/section";
// import ContactsMapEmbed from "@/components/ContactsMapEmbed";
// import AnimatedContactsContent from "@/components/contacts/AnimatedContactsContent";
// import AnimatedContactCards from "@/components/contacts/AnimatedContactCards";
// import GalaxyBackground from "@/components/ui/GalaxyBackground";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// import styles from "./contacts.module.css";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";

// const SALON = {
//   name: "Salon Elen",
//   streetAddress: "Lessingstraße 37",
//   postalCode: "06114",
//   addressLocality: "Halle (Saale)",
//   addressCountry: "DE",
//   phone: "+49 177 899 51 06",
//   email: "elen69@web.de",
//   whatsapp: "491778995106",
//   telegram: "salonelen",
//   mapsQuery: "Lessingstraße 37, 06114 Halle (Saale)",
// };

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   searchParams?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const sp = searchParams ? await searchParams : undefined;
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return DEFAULT_LOCALE;
// }

// function pageUrl(locale: Locale) {
//   if (locale === "de") return `${SITE_URL}/contacts`;
//   return `${SITE_URL}/contacts?lang=${locale}`;
// }

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   const title =
//     locale === "de"
//       ? "Kontakt — Salon Elen"
//       : locale === "en"
//         ? "Contact — Salon Elen"
//         : "Контакты — Salon Elen";

//   const description = translate(locale, "contacts_seo_description");

//   return {
//     metadataBase: undefined,
//     title,
//     description,
//     alternates: {
//       canonical: pageUrl(locale),
//       languages: {
//         de: pageUrl("de"),
//         en: pageUrl("en"),
//         ru: pageUrl("ru"),
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url: pageUrl(locale),
//       images: ["/images/hero.webp"],
//       siteName: "Salon Elen",
//       locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
//       type: "website",
//     },
//   };
// }

// function jsonLd(locale: Locale) {
//   const data = {
//     "@context": "https://schema.org",
//     "@type": ["BeautySalon", "LocalBusiness"],
//     name: SALON.name,
//     telephone: SALON.phone,
//     email: SALON.email,
//     address: {
//       "@type": "PostalAddress",
//       streetAddress: SALON.streetAddress,
//       postalCode: SALON.postalCode,
//       addressLocality: SALON.addressLocality,
//       addressCountry: SALON.addressCountry,
//     },
//     url: pageUrl(locale),
//     openingHoursSpecification: [
//       {
//         "@type": "OpeningHoursSpecification",
//         dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
//         opens: "10:00",
//         closes: "19:00",
//       },
//       {
//         "@type": "OpeningHoursSpecification",
//         dayOfWeek: "Saturday",
//         opens: "10:00",
//         closes: "16:00",
//       },
//     ],
//   };
//   return JSON.stringify(data);
// }

// function mailtoLink(locale: Locale) {
//   const subject =
//     locale === "de"
//       ? "Anfrage – Salon Elen"
//       : locale === "en"
//         ? "Inquiry – Salon Elen"
//         : "Запрос — Salon Elen";

//   const body =
//     locale === "de"
//       ? "Hallo!\n\nIch möchte einen Termin / eine Beratung.\n\nName:\nTelefon:\nNachricht:\n\nVielen Dank!"
//       : locale === "en"
//         ? "Hi!\n\nI'd like to book an appointment / ask a question.\n\nName:\nPhone:\nMessage:\n\nThank you!"
//         : "Здравствуйте!\n\nХочу записаться / задать вопрос.\n\nИмя:\nТелефон:\nСообщение:\n\nСпасибо!";

//   return `mailto:${SALON.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
// }

// function whatsappLink(locale: Locale) {
//   const text =
//     locale === "de"
//       ? "Hallo! Ich möchte einen Termin vereinbaren."
//       : locale === "en"
//         ? "Hello! I'd like to book an appointment."
//         : "Здравствуйте! Хочу записаться на приём.";
//   return `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(text)}`;
// }

// export default async function ContactsPage({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }) {
//   const locale = await resolveLocale(searchParams);
//   const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);

//   const mapsUrl =
//     "https://www.google.com/maps/search/?api=1&query=" +
//     encodeURIComponent(SALON.mapsQuery);

//   const embedUrl =
//     "https://www.google.com/maps?q=" +
//     encodeURIComponent(SALON.mapsQuery) +
//     "&z=15&output=embed";

//   return (
//     <main className="relative">
//       {/* Background gradients */}
//       <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div
//           className={[
//             "absolute -top-28 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.30),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.14),transparent_60%)]",
//             styles.orbFloat,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-28 -left-28 h-[520px] w-[520px] rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.20),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.10),transparent_60%)]",
//             styles.orbFloat2,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-40 right-[-80px] h-[620px] w-[620px] rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.10),transparent_60%)]",
//             styles.orbFloat3,
//           ].join(" ")}
//         />
//         <div className={["absolute inset-0", styles.noiseMask].join(" ")} />
//       </div>

//       {/* HERO with Galaxy */}
//       <section className="relative pt-8 sm:pt-12 lg:pt-14">
//         <div className="container">
//           <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gray-950 shadow-2xl">
//             {/* Galaxy Background */}
//             <div className="absolute inset-0 overflow-hidden rounded-3xl">
//               <GalaxyBackground
//                 starCount={180}
//                 starColor={[255, 193, 7]}
//                 starSize={2.5}
//                 speed={0.25}
//               />
//               {/* Gradient overlays for depth */}
//               <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-transparent to-gray-950/80" />
//               <div className="absolute inset-0 bg-gradient-to-r from-gray-950/40 via-transparent to-gray-950/40" />
//             </div>

//             {/* Shimmer line effect */}
//             <div className={["absolute inset-0 z-10", styles.shimmerLine].join(" ")} />

//             {/* Content */}
//             <div className="relative z-20">
//               <AnimatedContactsContent
//                 locale={locale}
//                 salon={SALON}
//                 mapsUrl={mapsUrl}
//                 mailtoLink={mailtoLink(locale)}
//                 whatsappLink={whatsappLink(locale)}
//               />
//             </div>

//             {/* Bottom border glow */}
//             <div className="absolute inset-x-0 bottom-0 z-10 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
//           </div>
//         </div>
//       </section>

//       {/* Map & Contact Section */}
//       <Section title={t("contacts_map_title")} subtitle={t("contacts_quick_title")} className="relative">
//         <div className="grid gap-6 lg:grid-cols-2">
//           <ContactsMapEmbed
//             title={t("contacts_map_title")}
//             caption={t("contacts_map_caption")}
//             openMapsLabel={t("contacts_open_maps")}
//             showMapLabel={t("contacts_show_map")}
//             privacyNote={t("contacts_map_privacy")}
//             previewImageSrc="/images/cta.jpg"
//             previewAlt={t("contacts_map_title")}
//             mapsUrl={mapsUrl}
//             embedUrl={embedUrl}
//             eagerDesktop
//           />

//           {/* Contact Cards */}
//           <div className="relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
//             <div className="absolute inset-0 bg-[radial-gradient(650px_circle_at_25%_15%,rgba(255,193,7,0.18),transparent_60%),radial-gradient(650px_circle_at_85%_35%,rgba(236,72,153,0.12),transparent_60%)] dark:bg-[radial-gradient(650px_circle_at_25%_15%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(650px_circle_at_85%_35%,rgba(56,189,248,0.08),transparent_62%)]" />
//             <div className="relative p-5 sm:p-6">
//               <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
//                 {t("contacts_form_title")}
//               </h2>
//               <p className="mt-1 text-sm text-gray-800/80 dark:text-gray-300">
//                 {t("contacts_form_note")}
//               </p>

//               <div className="mt-6">
//                 <AnimatedContactCards
//                   locale={locale}
//                   salon={SALON}
//                   mailtoLink={mailtoLink(locale)}
//                   whatsappLink={whatsappLink(locale)}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(locale) }} />
//       </Section>
//     </main>
//   );
// }




//-------работает, хочу добавить эффектов
// // src/app/contacts/page.tsx
// import type { Metadata } from "next";
// import Link from "next/link";
// import { cookies } from "next/headers";
// import {
//   Phone,
//   Mail,
//   MapPin,
//   Clock,
//   Sparkles,
//   ArrowUpRight,
//   MessageCircle,
//   Send,
// } from "lucide-react";

// import Section from "@/components/section";
// import ContactsMapEmbed from "@/components/ContactsMapEmbed";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// import styles from "./contacts.module.css";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";

// const SALON = {
//   name: "Salon Elen",
//   streetAddress: "Lessingstraße 37",
//   postalCode: "06114",
//   addressLocality: "Halle (Saale)",
//   addressCountry: "DE",
//   phone: "+49 177 899 51 06",
//   email: "elen69@web.de",
//   whatsapp: "491778995106",
//   telegram: "salonelen",
//   mapsQuery: "Lessingstraße 37, 06114 Halle (Saale)",
// };

// type SearchParams = Record<string, string | string[] | undefined>;
// type SearchParamsPromise = Promise<SearchParams>;

// function isLocale(v: unknown): v is Locale {
//   return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
// }

// async function getLangFromSearchParams(
//   searchParams?: SearchParamsPromise,
// ): Promise<string | undefined> {
//   const sp = searchParams ? await searchParams : undefined;
//   const raw = sp?.lang;
//   if (Array.isArray(raw)) return raw[0];
//   return raw;
// }

// async function resolveLocale(searchParams?: SearchParamsPromise): Promise<Locale> {
//   const urlLang = await getLangFromSearchParams(searchParams);
//   if (isLocale(urlLang)) return urlLang;

//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value;
//   if (isLocale(cookieLocale)) return cookieLocale;

//   return DEFAULT_LOCALE;
// }

// function pageUrl(locale: Locale) {
//   if (locale === "de") return `${SITE_URL}/contacts`;
//   return `${SITE_URL}/contacts?lang=${locale}`;
// }

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   const hasQuery = path.includes("?");
//   return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
// }

// export async function generateMetadata({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }): Promise<Metadata> {
//   const locale = await resolveLocale(searchParams);

//   const title =
//     locale === "de"
//       ? "Kontakt — Salon Elen"
//       : locale === "en"
//         ? "Contact — Salon Elen"
//         : "Контакты — Salon Elen";

//   const description = translate(locale, "contacts_seo_description");

//   return {
//     metadataBase: undefined, // was null (invalid for Metadata typing in many setups)
//     title,
//     description,
//     alternates: {
//       canonical: pageUrl(locale),
//       languages: {
//         de: pageUrl("de"),
//         en: pageUrl("en"),
//         ru: pageUrl("ru"),
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url: pageUrl(locale),
//       images: ["/images/hero.webp"],
//       siteName: "Salon Elen",
//       locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
//       type: "website",
//     },
//   };
// }

// function jsonLd(locale: Locale) {
//   const data = {
//     "@context": "https://schema.org",
//     "@type": ["BeautySalon", "LocalBusiness"],
//     name: SALON.name,
//     telephone: SALON.phone,
//     email: SALON.email,
//     address: {
//       "@type": "PostalAddress",
//       streetAddress: SALON.streetAddress,
//       postalCode: SALON.postalCode,
//       addressLocality: SALON.addressLocality,
//       addressCountry: SALON.addressCountry,
//     },
//     url: pageUrl(locale),
//     openingHoursSpecification: [
//       {
//         "@type": "OpeningHoursSpecification",
//         dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
//         opens: "10:00",
//         closes: "19:00",
//       },
//       {
//         "@type": "OpeningHoursSpecification",
//         dayOfWeek: "Saturday",
//         opens: "10:00",
//         closes: "16:00",
//       },
//     ],
//   };
//   return JSON.stringify(data);
// }

// function mailtoLink(locale: Locale) {
//   const subject =
//     locale === "de"
//       ? "Anfrage – Salon Elen"
//       : locale === "en"
//         ? "Inquiry – Salon Elen"
//         : "Запрос — Salon Elen";

//   const body =
//     locale === "de"
//       ? "Hallo!\n\nIch möchte einen Termin / eine Beratung.\n\nName:\nTelefon:\nNachricht:\n\nVielen Dank!"
//       : locale === "en"
//         ? "Hi!\n\nI'd like to book an appointment / ask a question.\n\nName:\nPhone:\nMessage:\n\nThank you!"
//         : "Здравствуйте!\n\nХочу записаться / задать вопрос.\n\nИмя:\nТелефон:\nСообщение:\n\nСпасибо!";

//   return `mailto:${SALON.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
// }

// function whatsappLink(locale: Locale) {
//   const text =
//     locale === "de"
//       ? "Hallo! Ich möchte einen Termin vereinbaren."
//       : locale === "en"
//         ? "Hello! I'd like to book an appointment."
//         : "Здравствуйте! Хочу записаться на приём.";
//   return `https://wa.me/${SALON.whatsapp}?text=${encodeURIComponent(text)}`;
// }

// export default async function ContactsPage({
//   searchParams,
// }: {
//   searchParams?: SearchParamsPromise;
// }) {
//   const locale = await resolveLocale(searchParams);
//   const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);

//   const mapsUrl =
//     "https://www.google.com/maps/search/?api=1&query=" +
//     encodeURIComponent(SALON.mapsQuery);

//   const embedUrl =
//     "https://www.google.com/maps?q=" +
//     encodeURIComponent(SALON.mapsQuery) +
//     "&z=15&output=embed";

//   return (
//     <main className="relative">
//       {/* Background gradients */}
//       <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div
//           className={[
//             "absolute -top-28 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.30),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.14),transparent_60%)]",
//             styles.orbFloat,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-28 -left-28 h-[520px] w-[520px] rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.20),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.10),transparent_60%)]",
//             styles.orbFloat2,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-40 right-[-80px] h-[620px] w-[620px] rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.10),transparent_60%)]",
//             styles.orbFloat3,
//           ].join(" ")}
//         />
//         <div className={["absolute inset-0", styles.noiseMask].join(" ")} />
//       </div>

//       {/* HERO */}
//       <section className="relative pt-8 sm:pt-12 lg:pt-14">
//         <div className="container">
//           <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/75 shadow-soft backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/60">
//             {/* Inner gradients */}
//             <div className="absolute inset-0">
//               <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_12%_18%,rgba(255,193,7,0.22),transparent_60%),radial-gradient(900px_circle_at_88%_28%,rgba(236,72,153,0.14),transparent_60%),radial-gradient(900px_circle_at_40%_98%,rgba(56,189,248,0.12),transparent_60%)] dark:bg-[radial-gradient(900px_circle_at_12%_18%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(900px_circle_at_88%_28%,rgba(168,85,247,0.10),transparent_62%),radial-gradient(900px_circle_at_40%_98%,rgba(56,189,248,0.08),transparent_62%)]" />
//               <div className={["absolute inset-0", styles.shimmerLine].join(" ")} />
//             </div>

//             <div className="relative grid gap-6 p-5 sm:gap-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
//               {/* Left */}
//               <div className="animate-slideUp">
//                 <p className="inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-gray-900 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/50 dark:text-white">
//                   <Sparkles className="h-4 w-4 text-gold-600" />
//                   {t("contacts_subtitle")}
//                 </p>

//                 <h1 className="mt-4 font-playfair text-3xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
//                   {t("contacts_title")}
//                 </h1>

//                 <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-800/80 dark:text-gray-300">
//                   {t("contacts_intro")}
//                 </p>

//                 {/* Quick Actions */}
//                 <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
//                   {/* Phone - Primary */}
//                   <a
//                     href={`tel:${SALON.phone.replace(/\s+/g, "")}`}
//                     className="group relative inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-gray-950 sm:w-auto sm:justify-start"
//                   >
//                     <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-0 transition group-hover:opacity-100" />
//                     <Phone className="h-4 w-4" />
//                     {t("contacts_quick_call")}
//                   </a>

//                   {/* WhatsApp */}
//                   <a
//                     href={whatsappLink(locale)}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-700 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:border-green-500/50 hover:bg-green-500/20 hover:shadow-md dark:border-green-400/30 dark:bg-green-500/10 dark:text-green-300 dark:hover:border-green-400/50 sm:w-auto sm:justify-start"
//                   >
//                     <MessageCircle className="h-4 w-4" />
//                     WhatsApp
//                   </a>

//                   {/* Book */}
//                   <Link
//                     href={localeHref("/booking", locale)}
//                     className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto sm:justify-start"
//                   >
//                     {t("contacts_quick_book")}
//                     <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
//                   </Link>

//                   {/* Route */}
//                   <a
//                     href={mapsUrl}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto sm:justify-start"
//                   >
//                     {t("contacts_quick_route")}
//                     <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
//                   </a>
//                 </div>
//               </div>

//               {/* Right card - Contact Details */}
//               <div className="relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60">
//                 <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,193,7,0.16),transparent_35%,rgba(236,72,153,0.10))] dark:bg-[linear-gradient(115deg,rgba(255,193,7,0.08),transparent_35%,rgba(56,189,248,0.06))]" />
//                 <div className="relative p-5 sm:p-6">
//                   <p className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-200">
//                     {t("contacts_details_title")}
//                   </p>

//                   <div className="mt-4 space-y-3 text-sm text-gray-900/90 dark:text-gray-200">
//                     <div className="flex gap-3">
//                       <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">
//                           {t("contacts_address_label")}
//                         </div>
//                         <div className="font-semibold">
//                           {SALON.streetAddress}, {SALON.postalCode} {SALON.addressLocality}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">
//                           {t("contacts_phone_label")}
//                         </div>
//                         <a
//                           className="font-semibold underline-offset-4 hover:underline"
//                           href={`tel:${SALON.phone.replace(/\s+/g, "")}`}
//                         >
//                           {SALON.phone}
//                         </a>
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">
//                           {t("contacts_email_label")}
//                         </div>
//                         <a
//                           className="font-semibold underline-offset-4 hover:underline"
//                           href={`mailto:${SALON.email}`}
//                         >
//                           {SALON.email}
//                         </a>
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">
//                           {t("contacts_hours_label")}
//                         </div>
//                         <div className="font-semibold">{t("contacts_hours_value")}</div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Quick contact buttons */}
//                   <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
//                     <a
//                       href={mailtoLink(locale)}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-500 px-4 py-3 text-sm font-extrabold text-gray-950 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gold-400 sm:w-auto"
//                     >
//                       <Mail className="h-4 w-4" />
//                       {t("contacts_form_send")}
//                     </a>

//                     <a
//                       href={mapsUrl}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/85 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto"
//                     >
//                       {t("contacts_open_maps")}
//                       <ArrowUpRight className="h-4 w-4 opacity-70" />
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-900/10 to-transparent dark:via-white/10" />
//           </div>
//         </div>
//       </section>

//       {/* Map & Contact Form Section */}
//       <Section title={t("contacts_map_title")} subtitle={t("contacts_quick_title")} className="relative">
//         <div className="grid gap-6 lg:grid-cols-2">
//           <ContactsMapEmbed
//             title={t("contacts_map_title")}
//             caption={t("contacts_map_caption")}
//             openMapsLabel={t("contacts_open_maps")}
//             showMapLabel={t("contacts_show_map")}
//             privacyNote={t("contacts_map_privacy")}
//             previewImageSrc="/images/cta.jpg"
//             previewAlt={t("contacts_map_title")}
//             mapsUrl={mapsUrl}
//             embedUrl={embedUrl}
//             eagerDesktop
//           />

//           {/* Contact Form Card */}
//           <div className="relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
//             <div className="absolute inset-0 bg-[radial-gradient(650px_circle_at_25%_15%,rgba(255,193,7,0.18),transparent_60%),radial-gradient(650px_circle_at_85%_35%,rgba(236,72,153,0.12),transparent_60%)] dark:bg-[radial-gradient(650px_circle_at_25%_15%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(650px_circle_at_85%_35%,rgba(56,189,248,0.08),transparent_62%)]" />
//             <div className="relative p-5 sm:p-6">
//               <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
//                 {t("contacts_form_title")}
//               </h2>
//               <p className="mt-1 text-sm text-gray-800/80 dark:text-gray-300">
//                 {t("contacts_form_note")}
//               </p>

//               <div className="mt-6 space-y-4">
//                 {/* Email */}
//                 <a
//                   href={mailtoLink(locale)}
//                   className="group flex items-center gap-4 rounded-2xl border border-gray-900/10 bg-white/90 p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-950/40"
//                 >
//                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-500/20 text-gold-700 dark:bg-gold-400/20 dark:text-gold-300">
//                     <Mail className="h-5 w-5" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-semibold text-gray-950 dark:text-white">E-Mail</div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">{SALON.email}</div>
//                   </div>
//                   <Send className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-gold-600" />
//                 </a>

//                 {/* Phone */}
//                 <a
//                   href={`tel:${SALON.phone.replace(/\s+/g, "")}`}
//                   className="group flex items-center gap-4 rounded-2xl border border-gray-900/10 bg-white/90 p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-950/40"
//                 >
//                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300">
//                     <Phone className="h-5 w-5" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-semibold text-gray-950 dark:text-white">{t("contacts_phone_label")}</div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">{SALON.phone}</div>
//                   </div>
//                   <ArrowUpRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600" />
//                 </a>

//                 {/* WhatsApp */}
//                 <a
//                   href={whatsappLink(locale)}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="group flex items-center gap-4 rounded-2xl border-2 border-green-500/30 bg-green-500/5 p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-green-500/50 hover:bg-green-500/10 hover:shadow-md dark:border-green-400/30 dark:bg-green-500/5"
//                 >
//                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/20 text-green-700 dark:bg-green-400/20 dark:text-green-300">
//                     <MessageCircle className="h-5 w-5" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="font-semibold text-gray-950 dark:text-white">WhatsApp</div>
//                     <div className="text-sm text-gray-600 dark:text-gray-400">
//                       {locale === "de" ? "Schnelle Antwort" : locale === "en" ? "Quick reply" : "Быстрый ответ"}
//                     </div>
//                   </div>
//                   <ArrowUpRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-green-600" />
//                 </a>
//               </div>

//               {/* Book appointment CTA */}
//               <div className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-500/10 p-4 dark:border-gold-400/30 dark:bg-gold-500/10">
//                 <p className="text-sm font-medium text-gray-900 dark:text-white">
//                   {locale === "de"
//                     ? "Möchten Sie direkt einen Termin buchen?"
//                     : locale === "en"
//                       ? "Want to book an appointment directly?"
//                       : "Хотите записаться на приём?"}
//                 </p>
//                 <Link
//                   href={localeHref("/booking", locale)}
//                   className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-bold text-gray-950 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gold-400"
//                 >
//                   {t("contacts_quick_book")}
//                   <ArrowUpRight className="h-4 w-4" />
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>

//         <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(locale) }} />
//       </Section>
//     </main>
//   );
// }




//--------улучшаем с клаудом----------
// // src/app/contacts/page.tsx
// import type { Metadata } from "next";
// import Link from "next/link";
// import { cookies } from "next/headers";
// import { Phone, Mail, MapPin, Clock, Sparkles, ArrowUpRight } from "lucide-react";

// import Section from "@/components/section";
// import ContactsMapEmbed from "@/components/ContactsMapEmbed";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// import styles from "./contacts.module.css";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";

// const SALON = {
//   name: "Salon Elen",
//   streetAddress: "Lessingstraße 37",
//   postalCode: "06114",
//   addressLocality: "Halle (Saale)",
//   addressCountry: "DE",
//   phone: "+49 177 899 51 06",
//   email: "elen69@web.de",
//   mapsQuery: "Lessingstraße 37, 06114 Halle (Saale)",
// };

// function pageUrl(locale: Locale) {
//   const u = new URL("/contacts", SITE_URL);
//   if (locale !== "de") u.searchParams.set("lang", locale);
//   return u.toString();
// }

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   const hasQuery = path.includes("?");
//   return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
// }

// async function resolveLocaleFromCookies(): Promise<Locale> {
//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
//   if (cookieLocale && LOCALES.includes(cookieLocale)) return cookieLocale;
//   return DEFAULT_LOCALE;
// }

// export async function generateMetadata(): Promise<Metadata> {
//   const locale = await resolveLocaleFromCookies();

//   const title =
//     locale === "de"
//       ? "Kontakt — Salon Elen"
//       : locale === "en"
//       ? "Contact — Salon Elen"
//       : "Контакты — Salon Elen";

//   const description = translate(locale, "contacts_seo_description");

//   return {
//     title,
//     description,
//     alternates: {
//       canonical: pageUrl(locale),
//       languages: {
//         de: pageUrl("de"),
//         en: pageUrl("en"),
//         ru: pageUrl("ru"),
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url: pageUrl(locale),
//       images: ["/images/hero.webp"],
//       siteName: "Salon Elen",
//       locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
//       type: "website",
//     },
//   };
// }

// function jsonLd(locale: Locale) {
//   const data = {
//     "@context": "https://schema.org",
//     "@type": ["BeautySalon", "LocalBusiness"],
//     name: SALON.name,
//     telephone: SALON.phone,
//     email: SALON.email,
//     address: {
//       "@type": "PostalAddress",
//       streetAddress: SALON.streetAddress,
//       postalCode: SALON.postalCode,
//       addressLocality: SALON.addressLocality,
//       addressCountry: SALON.addressCountry,
//     },
//     url: pageUrl(locale),
//   };
//   return JSON.stringify(data);
// }

// function mailtoLink(locale: Locale) {
//   const subject =
//     locale === "de"
//       ? "Anfrage – Salon Elen"
//       : locale === "en"
//       ? "Inquiry – Salon Elen"
//       : "Запрос — Salon Elen";

//   const body =
//     locale === "de"
//       ? "Hallo!%0D%0A%0D%0AIch möchte einen Termin / eine Beratung.%0D%0A%0D%0AName:%0D%0ATelefon:%0D%0ANachricht:%0D%0A%0D%0AVielen Dank!"
//       : locale === "en"
//       ? "Hi!%0D%0A%0D%0AI'd like to book an appointment / ask a question.%0D%0A%0D%0AName:%0D%0APhone:%0D%0AMessage:%0D%0A%0D%0AThank you!"
//       : "Здравствуйте!%0D%0A%0D%0AХочу записаться / задать вопрос.%0D%0A%0D%0AИмя:%0D%0AТелефон:%0D%0AСообщение:%0D%0A%0D%0AСпасибо!";

//   return `mailto:${SALON.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
// }

// export default async function ContactsPage() {
//   const locale = await resolveLocaleFromCookies();
//   const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);

//   const mapsUrl =
//     "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(SALON.mapsQuery);

//   const embedUrl =
//     "https://www.google.com/maps?q=" + encodeURIComponent(SALON.mapsQuery) + "&z=15&output=embed";

//   return (
//     <main className="relative">
//       {/* Background WAU: brighter light gradients + soft grain */}
//       <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div
//           className={[
//             "absolute -top-28 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.30),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(255,193,7,0.14),transparent_60%)]",
//             styles.orbFloat,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-28 -left-28 h-[520px] w-[520px] rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.20),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.10),transparent_60%)]",
//             styles.orbFloat2,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-40 right-[-80px] h-[620px] w-[620px] rounded-full blur-3xl",
//             "bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_60%)]",
//             "dark:bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.10),transparent_60%)]",
//             styles.orbFloat3,
//           ].join(" ")}
//         />
//         <div className={["absolute inset-0", styles.noiseMask].join(" ")} />
//       </div>

//       {/* HERO */}
//       <section className="relative pt-8 sm:pt-12 lg:pt-14">
//         <div className="container">
//           <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/75 shadow-soft backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/60">
//             {/* inner gradients */}
//             <div className="absolute inset-0">
//               <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_12%_18%,rgba(255,193,7,0.22),transparent_60%),radial-gradient(900px_circle_at_88%_28%,rgba(236,72,153,0.14),transparent_60%),radial-gradient(900px_circle_at_40%_98%,rgba(56,189,248,0.12),transparent_60%)] dark:bg-[radial-gradient(900px_circle_at_12%_18%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(900px_circle_at_88%_28%,rgba(168,85,247,0.10),transparent_62%),radial-gradient(900px_circle_at_40%_98%,rgba(56,189,248,0.08),transparent_62%)]" />
//               <div className={["absolute inset-0", styles.shimmerLine].join(" ")} />
//             </div>

//             <div className="relative grid gap-6 p-5 sm:gap-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
//               {/* Left */}
//               <div className="animate-slideUp">
//                 <p className="inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-white/70 px-3 py-1 text-xs font-semibold tracking-wide text-gray-900 shadow-soft backdrop-blur dark:border-white/10 dark:bg-gray-900/50 dark:text-white">
//                   <Sparkles className="h-4 w-4 text-gold-600" />
//                   {t("contacts_subtitle")}
//                 </p>

//                 <h1 className="mt-4 font-playfair text-3xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
//                   {t("contacts_title")}
//                 </h1>

//                 <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-800/80 dark:text-gray-300">
//                   {t("contacts_intro")}
//                 </p>

//                 <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
//                   {/* Primary */}
//                   <a
//                     href={`tel:${SALON.phone.replace(/\s+/g, "")}`}
//                     className="group relative inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-gray-950 sm:w-auto sm:justify-start"
//                   >
//                     <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-0 transition group-hover:opacity-100" />
//                     <Phone className="h-4 w-4" />
//                     {t("contacts_quick_call")}
//                     <span className="opacity-70">·</span>
//                     <span className="opacity-90">{SALON.phone}</span>
//                   </a>

//                   {/* Secondary */}
//                   <Link
//                     href={localeHref("/booking", locale)}
//                     className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto sm:justify-start"
//                   >
//                     {t("contacts_quick_book")}
//                     <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
//                   </Link>

//                   {/* Secondary */}
//                   <a
//                     href={mapsUrl}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/80 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto sm:justify-start"
//                   >
//                     {t("contacts_quick_route")}
//                     <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
//                   </a>
//                 </div>
//               </div>

//               {/* Right card */}
//               <div className="relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60">
//                 <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,193,7,0.16),transparent_35%,rgba(236,72,153,0.10))] dark:bg-[linear-gradient(115deg,rgba(255,193,7,0.08),transparent_35%,rgba(56,189,248,0.06))]" />
//                 <div className="relative p-5 sm:p-6">
//                   <p className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-200">
//                     {t("contacts_details_title")}
//                   </p>

//                   <div className="mt-4 space-y-3 text-sm text-gray-900/90 dark:text-gray-200">
//                     <div className="flex gap-3">
//                       <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">{t("contacts_address_label")}</div>
//                         <div className="font-semibold">
//                           {SALON.streetAddress}, {SALON.postalCode} {SALON.addressLocality}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">{t("contacts_phone_label")}</div>
//                         <a className="font-semibold underline-offset-4 hover:underline" href={`tel:${SALON.phone.replace(/\s+/g, "")}`}>
//                           {SALON.phone}
//                         </a>
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">{t("contacts_email_label")}</div>
//                         <a className="font-semibold underline-offset-4 hover:underline" href={`mailto:${SALON.email}`}>
//                           {SALON.email}
//                         </a>
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">{t("contacts_hours_label")}</div>
//                         <div className="font-semibold">{t("contacts_hours_value")}</div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
//                     <a
//                       href={mailtoLink(locale)}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-500 px-4 py-3 text-sm font-extrabold text-gray-950 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gold-400 sm:w-auto"
//                     >
//                       <Mail className="h-4 w-4" />
//                       {t("contacts_form_send")}
//                     </a>

//                     <a
//                       href={mapsUrl}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-900/10 bg-white/85 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-gray-900/60 dark:text-white sm:w-auto"
//                     >
//                       {t("contacts_open_maps")}
//                       <ArrowUpRight className="h-4 w-4 opacity-70" />
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-900/10 to-transparent dark:via-white/10" />
//           </div>
//         </div>
//       </section>

//       {/* Content */}
//       <Section title={t("contacts_map_title")} subtitle={t("contacts_quick_title")} className="relative">
//         <div className="grid gap-6 lg:grid-cols-2">
//           <ContactsMapEmbed
//             title={t("contacts_map_title")}
//             caption={t("contacts_map_caption")}
//             openMapsLabel={t("contacts_open_maps")}
//             showMapLabel={t("contacts_show_map")}
//             privacyNote={t("contacts_map_privacy")}
//             previewImageSrc="/images/cta.jpg"
//             previewAlt={t("contacts_map_title")}
//             mapsUrl={mapsUrl}
//             embedUrl={embedUrl}
//             eagerDesktop
//           />

//           <div className="relative overflow-hidden rounded-3xl border border-gray-900/10 bg-white/80 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/60">
//             <div className="absolute inset-0 bg-[radial-gradient(650px_circle_at_25%_15%,rgba(255,193,7,0.18),transparent_60%),radial-gradient(650px_circle_at_85%_35%,rgba(236,72,153,0.12),transparent_60%)] dark:bg-[radial-gradient(650px_circle_at_25%_15%,rgba(255,193,7,0.10),transparent_62%),radial-gradient(650px_circle_at_85%_35%,rgba(56,189,248,0.08),transparent_62%)]" />
//             <div className="relative p-5 sm:p-6">
//               <h2 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white">
//                 {t("contacts_form_title")}
//               </h2>
//               <p className="mt-1 text-sm text-gray-800/80 dark:text-gray-300">
//                 {t("contacts_form_note")}
//               </p>

//               <form className="mt-5 space-y-3" action={mailtoLink(locale)} method="post" encType="text/plain">
//                 <label className="block">
//                   <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400">
//                     {t("contacts_form_name")}
//                   </span>
//                   <input
//                     name="name"
//                     required
//                     className="w-full rounded-2xl border border-gray-900/10 bg-white/90 px-4 py-3 text-sm text-gray-950 outline-none ring-gold-400/30 transition focus:ring-4 dark:border-white/10 dark:bg-gray-950/40 dark:text-white"
//                     placeholder={t("contacts_form_name")}
//                   />
//                 </label>

//                 <label className="block">
//                   <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400">
//                     {t("contacts_form_phone")}
//                   </span>
//                   <input
//                     name="phone"
//                     className="w-full rounded-2xl border border-gray-900/10 bg-white/90 px-4 py-3 text-sm text-gray-950 outline-none ring-gold-400/30 transition focus:ring-4 dark:border-white/10 dark:bg-gray-950/40 dark:text-white"
//                     placeholder={t("contacts_form_phone")}
//                   />
//                 </label>

//                 <label className="block">
//                   <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-400">
//                     {t("contacts_form_message")}
//                   </span>
//                   <textarea
//                     name="message"
//                     required
//                     rows={5}
//                     className="w-full resize-none rounded-2xl border border-gray-900/10 bg-white/90 px-4 py-3 text-sm text-gray-950 outline-none ring-gold-400/30 transition focus:ring-4 dark:border-white/10 dark:bg-gray-950/40 dark:text-white"
//                     placeholder={t("contacts_form_message")}
//                   />
//                 </label>

//                 <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
//                   <button
//                     type="submit"
//                     className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-gray-950 sm:w-auto"
//                   >
//                     <Mail className="h-4 w-4" />
//                     {t("contacts_form_send")}
//                   </button>

//                   <a
//                     href={`mailto:${SALON.email}`}
//                     className="text-center text-sm font-semibold text-gray-900 underline-offset-4 hover:underline dark:text-gray-300 sm:text-left"
//                   >
//                     {SALON.email}
//                   </a>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>

//         <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(locale) }} />
//       </Section>
//     </main>
//   );
// }





//---------переходим на tailwind и новый дизайн страницы контактов------------------- --- IGNORE ---
// // src/app/contacts/page.tsx
// import type { Metadata } from "next";
// import Link from "next/link";
// import { cookies } from "next/headers";
// import { Phone, Mail, MapPin, Clock, Sparkles, ArrowUpRight } from "lucide-react";

// import Section from "@/components/section";
// import ContactsMapEmbed from "@/components/ContactsMapEmbed";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import { translate } from "@/i18n/messages";

// import styles from "./contacts.module.css";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";

// const SALON = {
//   name: "Salon Elen",
//   streetAddress: "Lessingstraße 37",
//   postalCode: "06114",
//   addressLocality: "Halle (Saale)",
//   addressCountry: "DE",
//   phone: "+49 177 899 51 06",
//   email: "elen69@web.de",
//   mapsQuery: "Lessingstraße 37, 06114 Halle (Saale)",
// };

// function pageUrl(locale: Locale) {
//   const u = new URL("/contacts", SITE_URL);
//   if (locale !== "de") u.searchParams.set("lang", locale);
//   return u.toString();
// }

// function localeHref(path: string, locale: Locale) {
//   if (locale === "de") return path;
//   const hasQuery = path.includes("?");
//   return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
// }

// async function resolveLocaleFromCookies(): Promise<Locale> {
//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
//   if (cookieLocale && LOCALES.includes(cookieLocale)) return cookieLocale;
//   return DEFAULT_LOCALE;
// }

// export async function generateMetadata(): Promise<Metadata> {
//   // ✅ metadata тоже берём из cookies (без searchParams => нет sync-dynamic warning)
//   const locale = await resolveLocaleFromCookies();

//   const title =
//     locale === "de"
//       ? "Kontakt — Salon Elen"
//       : locale === "en"
//       ? "Contact — Salon Elen"
//       : "Контакты — Salon Elen";

//   const description = translate(locale, "contacts_seo_description");

//   return {
//     title,
//     description,
//     alternates: {
//       canonical: pageUrl(locale),
//       languages: {
//         de: pageUrl("de"),
//         en: pageUrl("en"),
//         ru: pageUrl("ru"),
//       },
//     },
//     openGraph: {
//       title,
//       description,
//       url: pageUrl(locale),
//       images: ["/images/hero.webp"],
//       siteName: "Salon Elen",
//       locale: locale === "de" ? "de_DE" : locale === "en" ? "en_US" : "ru_RU",
//       type: "website",
//     },
//   };
// }

// function jsonLd(locale: Locale) {
//   const data = {
//     "@context": "https://schema.org",
//     "@type": ["BeautySalon", "LocalBusiness"],
//     name: SALON.name,
//     telephone: SALON.phone,
//     email: SALON.email,
//     address: {
//       "@type": "PostalAddress",
//       streetAddress: SALON.streetAddress,
//       postalCode: SALON.postalCode,
//       addressLocality: SALON.addressLocality,
//       addressCountry: SALON.addressCountry,
//     },
//     url: pageUrl(locale),
//   };
//   return JSON.stringify(data);
// }

// function mailtoLink(locale: Locale) {
//   const subject =
//     locale === "de"
//       ? "Anfrage – Salon Elen"
//       : locale === "en"
//       ? "Inquiry – Salon Elen"
//       : "Запрос — Salon Elen";

//   const body =
//     locale === "de"
//       ? "Hallo!%0D%0A%0D%0AIch möchte einen Termin / eine Beratung.%0D%0A%0D%0AName:%0D%0ATelefon:%0D%0ANachricht:%0D%0A%0D%0AVielen Dank!"
//       : locale === "en"
//       ? "Hi!%0D%0A%0D%0AI'd like to book an appointment / ask a question.%0D%0A%0D%0AName:%0D%0APhone:%0D%0AMessage:%0D%0A%0D%0AThank you!"
//       : "Здравствуйте!%0D%0A%0D%0AХочу записаться / задать вопрос.%0D%0A%0D%0AИмя:%0D%0AТелефон:%0D%0AСообщение:%0D%0A%0D%0AСпасибо!";

//   return `mailto:${SALON.email}?subject=${encodeURIComponent(subject)}&body=${body}`;
// }

// export default async function ContactsPage() {
//   const locale = await resolveLocaleFromCookies();
//   const t = (k: Parameters<typeof translate>[1]) => translate(locale, k);

//   const mapsUrl =
//     "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(SALON.mapsQuery);

//   const embedUrl =
//   "https://www.google.com/maps?q=" + encodeURIComponent(SALON.mapsQuery) + "&z=15&output=embed";


//   return (
//     <main className="relative">
//       {/* Decorative background */}
//       <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div
//           className={[
//             "absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gold-300/20 blur-3xl dark:bg-gold-400/10",
//             styles.orbFloat,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-24 -left-24 h-[440px] w-[440px] rounded-full bg-gray-200/60 blur-3xl dark:bg-gray-800/60",
//             styles.orbFloat2,
//           ].join(" ")}
//         />
//         <div
//           className={[
//             "absolute -bottom-32 right-0 h-[520px] w-[520px] rounded-full bg-gold-200/25 blur-3xl dark:bg-gold-500/10",
//             styles.orbFloat3,
//           ].join(" ")}
//         />
//         <div className={["absolute inset-0", styles.noiseMask].join(" ")} />
//       </div>

//       {/* Hero */}
//       <section className="relative pt-8 sm:pt-12 lg:pt-14">
//         <div className="container">
//           <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/70 shadow-soft backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
//             <div className="absolute inset-0">
//               <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_20%,rgba(255,193,7,0.18),transparent_55%),radial-gradient(800px_circle_at_80%_40%,rgba(0,0,0,0.06),transparent_55%),radial-gradient(600px_circle_at_40%_90%,rgba(255,214,79,0.16),transparent_50%)] dark:bg-[radial-gradient(800px_circle_at_20%_20%,rgba(255,193,7,0.10),transparent_55%),radial-gradient(800px_circle_at_80%_40%,rgba(255,255,255,0.06),transparent_55%),radial-gradient(600px_circle_at_40%_90%,rgba(255,214,79,0.10),transparent_50%)]" />
//               <div className={["absolute inset-0", styles.shimmerLine].join(" ")} />
//             </div>

//             <div className="relative grid gap-6 p-5 sm:gap-8 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
//               {/* Left */}
//               <div className="animate-slideUp">
//                 <p className="inline-flex items-center gap-2 rounded-full border border-gray-200/70 bg-white/70 px-3 py-1 text-xs font-medium tracking-wide text-gray-700 backdrop-blur dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-200">
//                   <Sparkles className="h-4 w-4 text-gold-600" />
//                   {t("contacts_subtitle")}
//                 </p>

//                 <h1 className="mt-4 font-playfair text-3xl font-semibold tracking-tight sm:text-4xl">
//                   {t("contacts_title")}
//                 </h1>

//                 <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700 dark:text-gray-300">
//                   {t("contacts_intro")}
//                 </p>

//                 <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
//                   <a
//                     href={`tel:${SALON.phone.replace(/\s+/g, "")}`}
//                     className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-gray-900 sm:w-auto sm:justify-start"
//                   >
//                     <Phone className="h-4 w-4" />
//                     {t("contacts_quick_call")}
//                     <span className="opacity-70 group-hover:opacity-100">·</span>
//                     <span className="opacity-80 group-hover:opacity-100">{SALON.phone}</span>
//                   </a>

//                   <Link
//                     href={localeHref("/booking", locale)}
//                     className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200/70 bg-white/70 px-4 py-3 text-sm font-medium text-gray-900 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100 sm:w-auto sm:justify-start"
//                   >
//                     {t("contacts_quick_book")}
//                     <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
//                   </Link>

//                   <a
//                     href={mapsUrl}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200/70 bg-white/70 px-4 py-3 text-sm font-medium text-gray-900 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100 sm:w-auto sm:justify-start"
//                   >
//                     {t("contacts_quick_route")}
//                     <ArrowUpRight className="h-4 w-4 opacity-70 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
//                   </a>
//                 </div>
//               </div>

//               {/* Right */}
//               <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/70 shadow-soft backdrop-blur dark:border-gray-800 dark:bg-gray-900/60">
//                 <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,193,7,0.14),transparent_35%,rgba(255,214,79,0.10))] dark:bg-[linear-gradient(115deg,rgba(255,193,7,0.08),transparent_35%,rgba(255,214,79,0.06))]" />
//                 <div className="relative p-5 sm:p-6">
//                   <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-300">
//                     {t("contacts_details_title")}
//                   </p>

//                   <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-200">
//                     <div className="flex gap-3">
//                       <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">{t("contacts_address_label")}</div>
//                         <div className="font-medium">
//                           {SALON.streetAddress}, {SALON.postalCode} {SALON.addressLocality}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">{t("contacts_phone_label")}</div>
//                         <a className="font-medium underline-offset-4 hover:underline" href={`tel:${SALON.phone.replace(/\s+/g, "")}`}>
//                           {SALON.phone}
//                         </a>
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">{t("contacts_email_label")}</div>
//                         <a className="font-medium underline-offset-4 hover:underline" href={`mailto:${SALON.email}`}>
//                           {SALON.email}
//                         </a>
//                       </div>
//                     </div>

//                     <div className="flex gap-3">
//                       <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-700 dark:text-gold-400" />
//                       <div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">{t("contacts_hours_label")}</div>
//                         <div className="font-medium">{t("contacts_hours_value")}</div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
//                     <a
//                       href={mailtoLink(locale)}
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3 text-sm font-semibold text-gray-950 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gold-400 sm:w-auto"
//                     >
//                       <Mail className="h-4 w-4" />
//                       {t("contacts_form_send")}
//                     </a>

//                     <a
//                       href={mapsUrl}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200/70 bg-white/70 px-4 py-3 text-sm font-semibold text-gray-900 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100 sm:w-auto"
//                     >
//                       {t("contacts_open_maps")}
//                       <ArrowUpRight className="h-4 w-4 opacity-70" />
//                     </a>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-800" />
//           </div>
//         </div>
//       </section>

//       <Section title={t("contacts_map_title")} subtitle={t("contacts_quick_title")} className="relative">
//         <div className="grid gap-6 lg:grid-cols-2">
//           <ContactsMapEmbed
//             title={t("contacts_map_title")}
//             caption={t("contacts_map_caption")}
//             openMapsLabel={t("contacts_open_maps")}
//             showMapLabel={t("contacts_show_map")}
//             privacyNote={t("contacts_map_privacy")}
//             previewImageSrc="/images/cta.jpg"
//             previewAlt={t("contacts_map_title")}
//             mapsUrl={mapsUrl}
//             embedUrl={embedUrl}
//           />

//           <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/60 shadow-soft backdrop-blur dark:border-gray-800 dark:bg-gray-900/50">
//             <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_30%_20%,rgba(255,193,7,0.14),transparent_60%)] dark:bg-[radial-gradient(600px_circle_at_30%_20%,rgba(255,193,7,0.08),transparent_60%)]" />
//             <div className="relative p-5 sm:p-6">
//               <h2 className="text-xl font-semibold tracking-tight">{t("contacts_form_title")}</h2>
//               <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{t("contacts_form_note")}</p>

//               <form className="mt-5 space-y-3" action={mailtoLink(locale)} method="post" encType="text/plain">
//                 <label className="block">
//                   <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-gray-600 dark:text-gray-400">
//                     {t("contacts_form_name")}
//                   </span>
//                   <input
//                     name="name"
//                     required
//                     className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm outline-none ring-gold-400/40 transition focus:ring-4 dark:border-gray-800 dark:bg-gray-950/40"
//                     placeholder={t("contacts_form_name")}
//                   />
//                 </label>

//                 <label className="block">
//                   <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-gray-600 dark:text-gray-400">
//                     {t("contacts_form_phone")}
//                   </span>
//                   <input
//                     name="phone"
//                     className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm outline-none ring-gold-400/40 transition focus:ring-4 dark:border-gray-800 dark:bg-gray-950/40"
//                     placeholder={t("contacts_form_phone")}
//                   />
//                 </label>

//                 <label className="block">
//                   <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-gray-600 dark:text-gray-400">
//                     {t("contacts_form_message")}
//                   </span>
//                   <textarea
//                     name="message"
//                     required
//                     rows={5}
//                     className="w-full resize-none rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm outline-none ring-gold-400/40 transition focus:ring-4 dark:border-gray-800 dark:bg-gray-950/40"
//                     placeholder={t("contacts_form_message")}
//                   />
//                 </label>

//                 <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
//                   <button
//                     type="submit"
//                     className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-gray-950 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gold-400 sm:w-auto"
//                   >
//                     <Mail className="h-4 w-4" />
//                     {t("contacts_form_send")}
//                   </button>

//                   <a
//                     href={`mailto:${SALON.email}`}
//                     className="text-center text-sm font-medium text-gray-700 underline-offset-4 hover:underline dark:text-gray-300 sm:text-left"
//                   >
//                     {SALON.email}
//                   </a>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>

//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: jsonLd(locale) }}
//         />
//       </Section>
//     </main>
//   );
// }








// // src/app/contacts/page.tsx
// import type { Metadata } from "next";
// import Image from "next/image";
// import { cookies } from "next/headers";
// import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/locales";
// import { translate, type MessageKey } from "@/i18n/messages";
// import {
//   MapPin,
//   Phone,
//   Mail,
//   Clock,
//   Sparkles,
//   ArrowRight,
//   ExternalLink,
// } from "lucide-react";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://permanent-halle.de";

// async function resolveLocale(): Promise<Locale> {
//   const cookieStore = await cookies();
//   const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
//   if (cookieLocale && LOCALES.includes(cookieLocale)) return cookieLocale;
//   return DEFAULT_LOCALE;
// }

// function localeHref(path: string, locale: Locale) {
//   // de = без lang, ru/en = ?lang=
//   if (locale === "de") return path;
//   const hasQuery = path.includes("?");
//   return `${path}${hasQuery ? "&" : "?"}lang=${locale}`;
// }

// export async function generateMetadata(): Promise<Metadata> {
//   const locale = await resolveLocale();
//   const t = (key: MessageKey) => translate(locale, key);

//   const canonicalPath = localeHref("/contacts", locale);
//   const canonical = new URL(canonicalPath, SITE_URL);

//   return {
//     title: t("contacts_meta_title"),
//     description: t("contacts_meta_description"),
//     alternates: {
//       canonical,
//       languages: {
//         de: new URL("/contacts", SITE_URL),
//         en: new URL(localeHref("/contacts", "en"), SITE_URL),
//         ru: new URL(localeHref("/contacts", "ru"), SITE_URL),
//       },
//     },
//     openGraph: {
//       title: t("contacts_meta_title"),
//       description: t("contacts_meta_description"),
//       url: canonical,
//       type: "website",
//       images: ["/images/hero.webp"],
//     },
//   };
// }

// export default async function ContactsPage() {
//   const locale = await resolveLocale();
//   const t = (key: MessageKey) => translate(locale, key);

//   // Данные (можешь потом вынести в config)
//   const addressShort = "Lessingstrasse 37, 06114 Halle (Saale)";
//   const phoneDisplay = "+49 177 899 51 06";
//   const phoneHref = "tel:+491778995106";
//   const email = "elen69@web.de";
//   const hours = t("contacts_hours_value");

//   const mapsQuery = encodeURIComponent(addressShort);
//   const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

//   const jsonLd = {
//     "@context": "https://schema.org",
//     "@type": "BeautySalon",
//     name: "Salon Elen",
//     url: new URL(localeHref("/", locale), SITE_URL).toString(),
//     telephone: "+491778995106",
//     email,
//     address: {
//       "@type": "PostalAddress",
//       streetAddress: "Lessingstrasse 37",
//       postalCode: "06114",
//       addressLocality: "Halle (Saale)",
//       addressCountry: "DE",
//     },
//     openingHoursSpecification: [
//       { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "10:00", closes: "19:00" },
//       { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "10:00", closes: "16:00" },
//     ],
//     sameAs: [],
//   };

//   return (
//     <main className="relative overflow-hidden">
//       {/* фоновые спец-эффекты */}
//       <div className="pointer-events-none absolute inset-0 -z-10">
//         {/* мягкий градиент */}
//         <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_20%_10%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(900px_600px_at_90%_20%,rgba(217,70,239,0.16),transparent_55%),radial-gradient(900px_700px_at_50%_100%,rgba(16,185,129,0.14),transparent_55%)]" />
//         {/* орбы */}
//         <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/20 blur-3xl dark:bg-white/10 animate-[pulse_6s_ease-in-out_infinite]" />
//         <div className="absolute top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-white/20 blur-3xl dark:bg-white/10 animate-[pulse_7.5s_ease-in-out_infinite]" />
//         {/* “noise” как лёгкая текстура */}
//         <div className="absolute inset-0 opacity-[0.06] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')] mix-blend-overlay dark:opacity-[0.08]" />
//       </div>

//       {/* JSON-LD для локального SEO */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
//       />

//       <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:pb-16 sm:pt-14">
//         {/* HERO */}
//         <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/40 sm:p-10">
//           <div className="absolute inset-0 opacity-70 dark:opacity-80 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]">
//             <div className="absolute -left-10 -top-10 h-52 w-52 rounded-full bg-gradient-to-br from-sky-400/40 to-cyan-300/10 blur-2xl" />
//             <div className="absolute right-0 top-10 h-60 w-60 rounded-full bg-gradient-to-br from-fuchsia-400/30 to-violet-300/10 blur-2xl" />
//           </div>

//           <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
//             <div>
//               <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/70 bg-white/70 px-3 py-1 text-xs text-gray-700 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-200">
//                 <Sparkles className="h-4 w-4" />
//                 <span>{t("contacts_hero_kicker")}</span>
//               </div>

//               <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
//                 {t("contacts_hero_title")}
//               </h1>

//               <p className="mt-3 max-w-xl text-base leading-7 text-gray-700 dark:text-gray-300">
//                 {t("contacts_hero_subtitle")}
//               </p>

//               <div className="mt-6 flex flex-wrap gap-3">
//                 <a
//                   href={phoneHref}
//                   className="btn btn-gradient-emerald rounded-2xl px-5 py-3 text-sm"
//                 >
//                   {t("contacts_action_call")}
//                   <ArrowRight className="h-4 w-4" />
//                 </a>

//                 <a
//                   href={localeHref("/booking", locale)}
//                   className="btn btn-gradient-violet rounded-2xl px-5 py-3 text-sm"
//                 >
//                   {t("contacts_action_book")}
//                   <ArrowRight className="h-4 w-4" />
//                 </a>

//                 <a
//                   href={mapsUrl}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="btn rounded-2xl px-5 py-3 text-sm"
//                 >
//                   {t("contacts_action_route")}
//                   <ExternalLink className="h-4 w-4" />
//                 </a>
//               </div>
//             </div>

//             {/* “мини-карта” / визуальный блок */}
//             <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/60 shadow-sm dark:border-gray-800 dark:bg-gray-950/35">
//               <div className="absolute inset-0">
//                 <Image
//                   src="/images/cta.jpg"
//                   alt={t("contacts_map_alt")}
//                   fill
//                   className="object-cover opacity-80 dark:opacity-70"
//                   sizes="(max-width: 1024px) 100vw, 45vw"
//                   priority
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
//               </div>

//               <div className="relative p-6 sm:p-8">
//                 <h2 className="text-lg font-semibold text-white">
//                   {t("contacts_map_title")}
//                 </h2>
//                 <p className="mt-1 text-sm text-white/80">
//                   {t("contacts_map_hint")}
//                 </p>

//                 <a
//                   href={mapsUrl}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur hover:bg-white/15 transition"
//                 >
//                   {t("contacts_map_open")}
//                   <ExternalLink className="h-4 w-4" />
//                 </a>

//                 <div className="mt-5 grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 text-white/90 backdrop-blur">
//                   <div className="flex items-start gap-3">
//                     <MapPin className="mt-0.5 h-5 w-5 text-white/80" />
//                     <div className="text-sm">
//                       <div className="font-medium">{t("contacts_address_label")}</div>
//                       <div className="text-white/80">{addressShort}</div>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <Clock className="mt-0.5 h-5 w-5 text-white/80" />
//                     <div className="text-sm">
//                       <div className="font-medium">{t("contacts_hours_label")}</div>
//                       <div className="text-white/80">{hours}</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* shimmer линия */}
//           <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-900/10 to-transparent dark:via-white/10" />
//         </div>

//         {/* Контент: карточки + форма */}
//         <div className="mt-10 grid gap-6 lg:grid-cols-2">
//           {/* карточка контактов */}
//           <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/40 sm:p-8">
//             <h2 className="text-xl font-semibold">{t("contacts_card_title")}</h2>
//             <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
//               {t("contacts_card_subtitle")}
//             </p>

//             <div className="mt-6 space-y-4">
//               <div className="flex items-start gap-3">
//                 <MapPin className="mt-0.5 h-5 w-5 text-gray-700 dark:text-gray-300" />
//                 <div>
//                   <div className="text-sm font-medium">{t("contacts_address_label")}</div>
//                   <div className="text-sm text-gray-700 dark:text-gray-300">{addressShort}</div>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3">
//                 <Phone className="mt-0.5 h-5 w-5 text-gray-700 dark:text-gray-300" />
//                 <div>
//                   <div className="text-sm font-medium">{t("contacts_phone_label")}</div>
//                   <a
//                     href={phoneHref}
//                     className="text-sm text-gray-700 underline-offset-4 hover:underline dark:text-gray-300"
//                   >
//                     {phoneDisplay}
//                   </a>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3">
//                 <Mail className="mt-0.5 h-5 w-5 text-gray-700 dark:text-gray-300" />
//                 <div>
//                   <div className="text-sm font-medium">{t("contacts_email_label")}</div>
//                   <a
//                     href={`mailto:${email}`}
//                     className="text-sm text-gray-700 underline-offset-4 hover:underline dark:text-gray-300"
//                   >
//                     {email}
//                   </a>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3">
//                 <Clock className="mt-0.5 h-5 w-5 text-gray-700 dark:text-gray-300" />
//                 <div>
//                   <div className="text-sm font-medium">{t("contacts_hours_label")}</div>
//                   <div className="text-sm text-gray-700 dark:text-gray-300">{hours}</div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-7 flex flex-wrap gap-3">
//               <a href={phoneHref} className="btn rounded-2xl px-5 py-3 text-sm">
//                 {t("contacts_action_call")}
//                 <ArrowRight className="h-4 w-4" />
//               </a>
//               <a href={localeHref("/booking", locale)} className="btn rounded-2xl px-5 py-3 text-sm">
//                 {t("contacts_action_book")}
//                 <ArrowRight className="h-4 w-4" />
//               </a>
//               <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn rounded-2xl px-5 py-3 text-sm">
//                 {t("contacts_action_route")}
//                 <ExternalLink className="h-4 w-4" />
//               </a>
//             </div>
//           </div>

//           {/* форма: отправка через mailto (SEO-safe, без бэка) */}
//           <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/40 sm:p-8">
//             <h2 className="text-xl font-semibold">{t("contacts_form_title")}</h2>
//             <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
//               {t("contacts_form_subtitle")}
//             </p>

//             <form
//               className="mt-6 space-y-4"
//               action={`mailto:${email}`}
//               method="post"
//               encType="text/plain"
//             >
//               <div>
//                 <label className="mb-1 block text-sm font-medium">
//                   {t("contacts_form_name")}
//                 </label>
//                 <input
//                   name="name"
//                   className="w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm outline-none ring-0 focus:border-gray-300 dark:border-gray-800 dark:bg-gray-950/40 dark:focus:border-gray-700"
//                   placeholder={t("contacts_form_name_ph")}
//                 />
//               </div>

//               <div>
//                 <label className="mb-1 block text-sm font-medium">
//                   {t("contacts_form_message")}
//                 </label>
//                 <textarea
//                   name="message"
//                   rows={5}
//                   className="w-full resize-none rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm outline-none ring-0 focus:border-gray-300 dark:border-gray-800 dark:bg-gray-950/40 dark:focus:border-gray-700"
//                   placeholder={t("contacts_form_message_ph")}
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="btn btn-gradient-sky w-full rounded-2xl px-5 py-3 text-sm justify-center"
//               >
//                 {t("contacts_form_send")}
//                 <ArrowRight className="h-4 w-4" />
//               </button>

//               <p className="text-xs text-gray-600 dark:text-gray-400">
//                 {t("contacts_form_note")}
//               </p>
//             </form>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }




//-----делаем заглушку вместо страницы контактов с картой------------------- IGNORE ---
// import Image from "next/image";
// import Section from "@/components/section";

// export const metadata = { title: "Контакты — Salon Elen" };

// export default function ContactsPage() {
//   return (
//     <main>
//       <Section title="Контакты" subtitle="Как нас найти">
//         <div className="grid gap-6 lg:grid-cols-2">
//           <div className="space-y-3 text-gray-700 dark:text-gray-300">
//             <p><b>Адрес:</b> 06114, Halle Saale Lessingstrasse 37.</p>
//             <p><b>Телефон:</b> <a href="tel:+491778995106" className="underline-offset-4 hover:underline">+49 177 899 51 06</a></p>
//             <p><b>Email:</b> <a href="mailto:elen69@web.de" className="underline-offset-4 hover:underline">elen69@web.de</a></p>
//             <p><b>Время работы:</b> Пн–Пт 10:00–19:00, Сб 10:00–16:00</p>
//           </div>

//           {/* вместо «живой» карты — оптимизированная картинка */}
//           <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-gray-200/70 dark:border-gray-800">
//             <Image
//               src="/images/cta.jpg" // заменишь на скрин карты /images/map.jpg
//               alt="Карта — как нас найти"
//               fill
//               className="object-cover"
//               sizes="(max-width: 1024px) 100vw, 50vw"
//             />
//           </div>
//         </div>
//       </Section>
//     </main>
//   );
// }
