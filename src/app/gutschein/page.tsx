import type { Metadata } from 'next';
import GutscheinClient from './GutscheinClient';
import { giftCopy } from '@/lib/gutschein-copy';
import { giftDetailsCopy, giftFaq } from '@/lib/gutschein-details-copy';
import { BASE_URL, buildAlternates, resolveUrlLocale, type SearchParamsPromise } from '@/lib/seo-locale';
import { resolveContentLocale } from '@/lib/seo-locale-server';
import { buildSalonJsonLd, SALON_SCHEMA_ID, WEBSITE_SCHEMA_ID } from '@/lib/structured-data';

type Props = { searchParams?: SearchParamsPromise };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const t = giftCopy[locale];
  const alternates = buildAlternates('/gutschein', locale);
  return { title: t.metaTitle, description: t.metaDescription, alternates,
    openGraph: { title: t.metaTitle, description: t.metaDescription, url: alternates.canonical, type: 'website', locale: { de: 'de_DE', en: 'en_US', ru: 'ru_RU' }[locale], images: [{ url: `${BASE_URL}/images/gutschein/og.webp`, width: 1200, height: 630, alt: t.metaTitle }] },
    twitter: { card: 'summary_large_image', title: t.metaTitle, description: t.metaDescription, images: [`${BASE_URL}/images/gutschein/og.webp`] },
  };
}

export default async function GutscheinPage({ searchParams }: Props) {
  const locale = await resolveContentLocale(searchParams);
  const t = giftCopy[locale];
  const detail = giftDetailsCopy[locale];
  const url = buildAlternates('/gutschein', locale).canonical;
  const schema = { '@context': 'https://schema.org', '@graph': [
    buildSalonJsonLd(),
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: t.metaTitle, description: detail.answer, inLanguage: locale, about: { '@id': SALON_SCHEMA_ID }, isPartOf: { '@id': WEBSITE_SCHEMA_ID }, primaryImageOfPage: { '@type': 'ImageObject', url: `${BASE_URL}/images/gutschein/og.webp`, width: 1200, height: 630 }, mainEntity: { '@id': `${url}#service` } },
    { '@type': 'Service', '@id': `${url}#service`, name: detail.heading, description: detail.answer, serviceType: 'Beauty gift voucher request', url, provider: { '@id': SALON_SCHEMA_ID }, areaServed: { '@type': 'City', name: 'Halle (Saale)' }, availableChannel: { '@type': 'ServiceChannel', serviceUrl: url, availableLanguage: ['de', 'en', 'ru'] } },
    { '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Salon Elen', item: `${BASE_URL}/` }, { '@type': 'ListItem', position: 2, name: t.voucher, item: url } ] },
    { '@type': 'FAQPage', '@id': `${url}#faq`, isPartOf: { '@id': `${url}#webpage` }, inLanguage: locale, mainEntity: giftFaq(locale).map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><GutscheinClient /></>;
}
