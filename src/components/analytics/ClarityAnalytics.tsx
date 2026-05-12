"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";
import {
  COOKIE_CONSENT_EVENT,
  deleteClarityCookies,
  getStoredCookieConsent,
  isCookieConsentValue,
} from "@/components/analytics/clarityConsent";

let clarityInitialized = false;

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

const clarityAnalyticsGranted = {
  ad_Storage: "denied",
  analytics_Storage: "granted",
} as const;

const clarityDenied = {
  ad_Storage: "denied",
  analytics_Storage: "denied",
} as const;

export default function ClarityAnalytics() {
  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();

    if (!projectId) {
      return;
    }

    const startClarity = () => {
      if (!clarityInitialized) {
        clarityInitialized = true;
        Clarity.init(projectId);
      }

      Clarity.consentV2(clarityAnalyticsGranted);
    };

    const stopClarity = () => {
      if (typeof window.clarity === "function") {
        Clarity.consentV2(clarityDenied);
        Clarity.consent(false);
      }

      deleteClarityCookies();
    };

    const applyConsent = (value: unknown) => {
      if (value === "accepted") {
        startClarity();
        return;
      }

      if (value === "rejected") {
        stopClarity();
      }
    };

    applyConsent(getStoredCookieConsent());

    const handleConsentChange = (event: Event) => {
      if (!(event instanceof CustomEvent) || !isCookieConsentValue(event.detail)) {
        return;
      }

      applyConsent(event.detail);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange);
    };
  }, []);

  return null;
}
