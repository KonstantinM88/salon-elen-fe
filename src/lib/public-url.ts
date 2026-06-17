const DEFAULT_PUBLIC_BASE_URL = "https://permanent-halle.de";

function isPrivateOrLocalHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (
    host === "localhost" ||
    host === "::1" ||
    host === "0.0.0.0" ||
    host.startsWith("fc") ||
    host.startsWith("fd") ||
    host.startsWith("fe80") ||
    host.endsWith(".localhost") ||
    host.endsWith(".local")
  ) {
    return true;
  }

  const parts = host.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return false;
  }

  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function normalizePublicBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isPrivateOrLocalHost(url.hostname)) return null;

    url.protocol = "https:";
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";

    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return null;
  }
}

export function getPublicBaseUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const baseUrl = normalizePublicBaseUrl(candidate);
    if (baseUrl) return baseUrl;
  }

  return DEFAULT_PUBLIC_BASE_URL;
}

export function buildPublicUrl(path = ""): string {
  const baseUrl = getPublicBaseUrl();
  const cleanPath = path.trim();
  if (!cleanPath) return baseUrl;

  return `${baseUrl}/${cleanPath.replace(/^\/+/, "")}`;
}
