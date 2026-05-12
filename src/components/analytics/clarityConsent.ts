export const COOKIE_CONSENT_STORAGE_KEY = "salon_elen_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "salon-elen:cookie-consent";
export const OPEN_COOKIE_SETTINGS_EVENT = "salon-elen:open-cookie-settings";

export type CookieConsentValue = "accepted" | "rejected";

export function isCookieConsentValue(value: unknown): value is CookieConsentValue {
  return value === "accepted" || value === "rejected";
}

export function getStoredCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return isCookieConsentValue(value) ? value : null;
  } catch {
    return null;
  }
}

export function setStoredCookieConsent(value: CookieConsentValue): void {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  } catch {
    // If storage is blocked, the current-page consent event still applies.
  }
}

export function dispatchCookieConsentChange(value: CookieConsentValue): void {
  window.dispatchEvent(
    new CustomEvent<CookieConsentValue>(COOKIE_CONSENT_EVENT, {
      detail: value,
    }),
  );
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}

export function deleteClarityCookies(): void {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const host = window.location.hostname;
  const rootDomain = getRootDomain(host);
  const domains = Array.from(
    new Set([undefined, host, `.${host}`, rootDomain ? `.${rootDomain}` : undefined]),
  );

  for (const name of ["_clck", "_clsk"]) {
    for (const domain of domains) {
      const domainPart = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${secure}${domainPart}`;
    }
  }
}

function getRootDomain(hostname: string): string | null {
  const parts = hostname.split(".").filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  return parts.slice(-2).join(".");
}
