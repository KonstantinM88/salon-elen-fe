import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  CommercialLandingRoute,
  createCommercialLandingMetadata,
} from "@/components/seo/CommercialLandingPage";
import { getSeoLandingPage } from "@/lib/seo-landing-pages";
import type { SearchParamsPromise } from "@/lib/seo-locale";
import { resolveContentLocale } from "@/lib/seo-locale-server";

type MetadataProps = {
  searchParams?: SearchParamsPromise;
};

function resolveLandingPage(slug: string) {
  const page = getSeoLandingPage(slug);
  if (!page) notFound();
  return page;
}

export function createSeoLandingPage(slug: string) {
  return async function SeoLandingPage({
    searchParams,
  }: MetadataProps) {
    const locale = await resolveContentLocale(searchParams);

    return <CommercialLandingRoute page={resolveLandingPage(slug)} locale={locale} />;
  };
}

export function createSeoLandingMetadata(slug: string) {
  return async function generateMetadata({
    searchParams,
  }: MetadataProps): Promise<Metadata> {
    return createCommercialLandingMetadata(resolveLandingPage(slug), searchParams);
  };
}
