import { createSign } from "node:crypto";
import { Temporal } from "@js-temporal/polyfill";
import { ORG_TZ } from "@/lib/orgTime";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_CONSOLE_API_URL = "https://www.googleapis.com/webmasters/v3";
const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const SEARCH_CONSOLE_TIMEOUT_MS = 20_000;
const SEARCH_CONSOLE_QUERY_LIMIT = 250;

export interface SearchConsoleQueryMetric {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export type SearchConsoleReportStatus = "ok" | "not_configured" | "error";

export interface SearchConsoleQueryReport {
  status: SearchConsoleReportStatus;
  startDate: string;
  endDate: string;
  siteUrl: string;
  rows: SearchConsoleQueryMetric[];
  totals: SearchConsoleTotals;
  errorType?: string;
}

interface SearchConsoleApiRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface SearchConsoleApiResponse {
  rows?: SearchConsoleApiRow[];
}

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}

interface CachedGoogleToken {
  value: string;
  expiresAt: number;
}

let cachedToken: CachedGoogleToken | null = null;

class SearchConsoleRequestError extends Error {
  constructor(
    readonly errorType: string,
    readonly status?: number,
  ) {
    super(errorType);
  }
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function getPrivateKey(): string | null {
  const base64Value = process.env.GSC_PRIVATE_KEY_BASE64?.trim();
  if (base64Value) {
    try {
      return Buffer.from(base64Value, "base64").toString("utf8").replace(/\\n/g, "\n");
    } catch {
      return null;
    }
  }

  const rawValue = process.env.GSC_PRIVATE_KEY?.trim();
  return rawValue ? rawValue.replace(/\\n/g, "\n") : null;
}

function resolvePeriod(): { startDate: string; endDate: string } {
  const endDate = Temporal.Now.zonedDateTimeISO(ORG_TZ)
    .toPlainDate()
    .subtract({ days: 2 });

  return {
    startDate: endDate.subtract({ days: 6 }).toString(),
    endDate: endDate.toString(),
  };
}

function emptyTotals(): SearchConsoleTotals {
  return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
}

function createFallback(
  status: Exclude<SearchConsoleReportStatus, "ok">,
  errorType?: string,
): SearchConsoleQueryReport {
  const period = resolvePeriod();
  return {
    status,
    ...period,
    siteUrl: process.env.GSC_SITE_URL?.trim() || "https://permanent-halle.de/",
    rows: [],
    totals: emptyTotals(),
    ...(errorType ? { errorType } : {}),
  };
}

async function getAccessToken({
  clientEmail,
  privateKey,
  signal,
}: {
  clientEmail: string;
  privateKey: string;
  signal: AbortSignal;
}): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const encodedHeader = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const encodedClaims = base64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: SEARCH_CONSOLE_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      iat: nowSeconds,
      exp: nowSeconds + 3_600,
    }),
  );
  const signingInput = `${encodedHeader}.${encodedClaims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const assertion = `${signingInput}.${signer.sign(privateKey, "base64url")}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal,
  });
  const result = (await response.json().catch(() => null)) as GoogleTokenResponse | null;

  if (!response.ok || !result?.access_token) {
    throw new SearchConsoleRequestError("google_token_request_failed", response.status);
  }

  cachedToken = {
    value: result.access_token,
    expiresAt: Date.now() + Math.max(60, result.expires_in ?? 3_600) * 1_000,
  };

  return result.access_token;
}

async function querySearchConsole({
  accessToken,
  siteUrl,
  startDate,
  endDate,
  dimensions,
  rowLimit,
  signal,
}: {
  accessToken: string;
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: string[];
  rowLimit?: number;
  signal: AbortSignal;
}): Promise<SearchConsoleApiResponse> {
  const response = await fetch(
    `${SEARCH_CONSOLE_API_URL}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        type: "web",
        ...(dimensions ? { dimensions } : {}),
        ...(rowLimit ? { rowLimit } : {}),
      }),
      signal,
    },
  );
  const result = (await response.json().catch(() => null)) as SearchConsoleApiResponse | null;

  if (!response.ok || !result) {
    throw new SearchConsoleRequestError("search_analytics_request_failed", response.status);
  }

  return result;
}

function finiteMetric(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function selectTopSearchConsoleQueries(
  rows: SearchConsoleQueryMetric[],
  limit = 10,
): SearchConsoleQueryMetric[] {
  return [...rows]
    .sort(
      (a, b) =>
        b.impressions - a.impressions ||
        b.clicks - a.clicks ||
        (a.position || Number.POSITIVE_INFINITY) -
          (b.position || Number.POSITIVE_INFINITY),
    )
    .slice(0, Math.max(0, limit));
}

export async function getSearchConsoleQueryReport(): Promise<SearchConsoleQueryReport> {
  const clientEmail = process.env.GSC_CLIENT_EMAIL?.trim();
  const privateKey = getPrivateKey();

  if (!clientEmail || !privateKey) {
    return createFallback("not_configured", "missing_service_account_config");
  }

  const siteUrl = process.env.GSC_SITE_URL?.trim() || "https://permanent-halle.de/";
  const { startDate, endDate } = resolvePeriod();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SEARCH_CONSOLE_TIMEOUT_MS);

  try {
    const accessToken = await getAccessToken({
      clientEmail,
      privateKey,
      signal: controller.signal,
    });
    const [queryResult, totalsResult] = await Promise.all([
      querySearchConsole({
        accessToken,
        siteUrl,
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: SEARCH_CONSOLE_QUERY_LIMIT,
        signal: controller.signal,
      }),
      querySearchConsole({
        accessToken,
        siteUrl,
        startDate,
        endDate,
        signal: controller.signal,
      }),
    ]);

    const rows = (queryResult.rows ?? []).flatMap((row) => {
      const query = row.keys?.[0]?.trim();
      if (!query) return [];

      return [{
        query,
        clicks: finiteMetric(row.clicks),
        impressions: finiteMetric(row.impressions),
        ctr: finiteMetric(row.ctr),
        position: finiteMetric(row.position),
      }];
    });
    const totalsRow = totalsResult.rows?.[0];

    return {
      status: "ok",
      startDate,
      endDate,
      siteUrl,
      rows: selectTopSearchConsoleQueries(rows, SEARCH_CONSOLE_QUERY_LIMIT),
      totals: {
        clicks: finiteMetric(totalsRow?.clicks),
        impressions: finiteMetric(totalsRow?.impressions),
        ctr: finiteMetric(totalsRow?.ctr),
        position: finiteMetric(totalsRow?.position),
      },
    };
  } catch (error) {
    const errorType = error instanceof SearchConsoleRequestError
      ? error.errorType
      : error instanceof DOMException && error.name === "AbortError"
        ? "timeout"
        : error instanceof Error
          ? error.name
          : "unknown_error";
    const status = error instanceof SearchConsoleRequestError ? error.status : undefined;
    console.warn("[GSC] Search analytics unavailable", {
      status: status ?? "unavailable",
      errorType,
    });
    return createFallback("error", errorType);
  } finally {
    clearTimeout(timeout);
  }
}
