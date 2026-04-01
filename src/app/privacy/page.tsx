import { permanentRedirect } from "next/navigation";
import type { SearchParamsPromise } from "@/lib/seo-locale";

type QueryParams = Record<string, string | string[] | undefined>;

function toQueryString(params?: QueryParams): string {
  if (!params) return "";

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === "string") qs.append(key, v);
      }
    } else if (typeof value === "string") {
      qs.append(key, value);
    }
  }
  return qs.toString();
}

export default async function PrivacyAliasPage({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const params = searchParams ? await searchParams : undefined;
  const qs = toQueryString(params);
  permanentRedirect(qs ? `/datenschutz?${qs}` : "/datenschutz");
}
