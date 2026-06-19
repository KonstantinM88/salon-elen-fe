"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/locales";

const VISIT_ID_KEY = "salon-elen-site-visit-id-v1";
const ATTRIBUTION_KEY = "salon-elen-site-attribution-v1";

type VisitAttribution = {
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

function getVisitId(): string | null {
  try {
    const existing = window.sessionStorage.getItem(VISIT_ID_KEY);
    if (existing) return existing;

    const next =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(VISIT_ID_KEY, next);
    return next;
  } catch {
    return null;
  }
}

function shouldTrackPath(pathname: string): boolean {
  return (
    pathname.startsWith("/") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next")
  );
}

function getAttribution(): VisitAttribution {
  try {
    const existing = window.sessionStorage.getItem(ATTRIBUTION_KEY);
    if (existing) return JSON.parse(existing) as VisitAttribution;

    const params = new URLSearchParams(window.location.search);
    const attribution: VisitAttribution = {
      referrer: document.referrer || undefined,
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
    };

    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
    return attribution;
  } catch {
    return {};
  }
}

export default function SiteVisitTracker({
  locale,
}: {
  locale: Locale;
}): React.JSX.Element | null {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !shouldTrackPath(pathname)) return;

    const visitId = getVisitId();
    if (!visitId) return;
    const attribution = getAttribution();

    const body = JSON.stringify({
      visitId,
      path: pathname,
      locale,
      ...attribution,
    });

    if (typeof navigator.sendBeacon === "function") {
      const sent = navigator.sendBeacon(
        "/api/site-visit",
        new Blob([body], { type: "application/json" }),
      );
      if (sent) return;
    }

    void fetch("/api/site-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  }, [locale, pathname]);

  return null;
}
