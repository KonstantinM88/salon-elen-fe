"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/locales";

const VISIT_ID_KEY = "salon-elen-site-visit-id-v1";

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

    const body = JSON.stringify({
      visitId,
      path: pathname,
      locale,
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
