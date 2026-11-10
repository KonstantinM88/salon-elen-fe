import type { Metadata } from 'next';
import GutscheinClient from './GutscheinClient';
import { giftCopy } from '@/lib/gutschein-copy';
import { BASE_URL, buildAlternates, resolveUrlLocale, type SearchParamsPromise } from '@/lib/seo-locale';
import { resolveContentLocale } from '@/lib/seo-locale-server';
import { SALON_SCHEMA_ID } from '@/lib/structured-data';

type Props = { searchParams?: SearchParamsPromise };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = await resolveUrlLocale(searchParams);
  const t = giftCopy[locale];
  const alternates = buildAlternates('/gutschein', locale);
  return { title: t.metaTitle, description: t.metaDescription, alternates,
    openGraph: { title: t.metaTitle, description: t.metaDescription, url: alternates.canonical, type: 'website', locale: { de: 'de_DE', en: 'en_US', ru: 'ru_RU' }[locale] },
  };
}

export default async function GutscheinPage({ searchParams }: Props) {
  const locale = await resolveContentLocale(searchParams);
  const t = giftCopy[locale];
  const url = buildAlternates('/gutschein', locale).canonical;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: t.metaTitle, description: t.metaDescription, inLanguage: locale, about: { '@id': SALON_SCHEMA_ID } },
    { '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Salon Elen', item: `${BASE_URL}/` }, { '@type': 'ListItem', position: 2, name: t.voucher, item: url } ] },
    { '@type': 'FAQPage', mainEntity: t.faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
  ] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><GutscheinClient /></>;
}
