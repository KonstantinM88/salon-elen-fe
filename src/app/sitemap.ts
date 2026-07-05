import { prisma } from "@/lib/db";
import { seoLandingPages } from "@/lib/seo-landing-pages";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const BASE_URL = "https://permanent-halle.de";

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry["changeFrequency"]>;

type PublicPage = {
  path: string;
  priority: number;
  changeFrequency?: ChangeFrequency;
};

const ROBOTS_DISALLOWED_PREFIXES = [
  "/admin",
  "/api",
  "/appointments",
  "/booking",
  "/coming-soon",
  "/login",
  "/register",
  "/users",
] as const;

const REDIRECT_ONLY_PATHS = new Set(["/for-masters", "/privacy", "/terms"]);

const publicPages: PublicPage[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  {
    path: "/permanent-make-up-in-der-naehe",
    priority: 0.95,
    changeFrequency: "weekly",
  },
  ...seoLandingPages.map((page) => ({
    path: `/${page.slug}`,
    priority: 0.86,
    changeFrequency: "weekly" as const,
  })),
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/prices", priority: 0.8, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/news", priority: 0.7, changeFrequency: "daily" },
  { path: "/contacts", priority: 0.65, changeFrequency: "monthly" },
  { path: "/gallerie", priority: 0.6, changeFrequency: "monthly" },
  { path: "/impressum", priority: 0.3, changeFrequency: "yearly" },
  { path: "/datenschutz", priority: 0.3, changeFrequency: "yearly" },
  { path: "/nutzungsbedingungen", priority: 0.3, changeFrequency: "yearly" },
];

function normalizePath(path: string): string {
  if (!path || path === "/") {
    return "/";
  }

  return `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function isDisallowedByRobots(path: string): boolean {
  const normalizedPath = normalizePath(path);
  return ROBOTS_DISALLOWED_PREFIXES.some((prefix) =>
    normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
}

function isIndexablePath(path: string): boolean {
  const normalizedPath = normalizePath(path);
  return (
    !isDisallowedByRobots(normalizedPath) &&
    !REDIRECT_ONLY_PATHS.has(normalizedPath)
  );
}

function absoluteUrl(path: string): string {
  const normalizedPath = normalizePath(path);
  return normalizedPath === "/" ? `${BASE_URL}/` : `${BASE_URL}${normalizedPath}`;
}

function createAlternates(path: string): Record<string, string> {
  const normalizedPath = normalizePath(path);
  const baseUrl = absoluteUrl(normalizedPath);
  const separator = normalizedPath === "/" ? "?" : "?";

  return {
    de: baseUrl,
    en: `${baseUrl}${separator}lang=en`,
    ru: `${baseUrl}${separator}lang=ru`,
    "x-default": baseUrl,
  };
}

function pushSitemapEntry(
  items: MetadataRoute.Sitemap,
  seenPaths: Set<string>,
  page: PublicPage,
): void {
  const path = normalizePath(page.path);

  if (!isIndexablePath(path) || seenPaths.has(path)) {
    return;
  }

  seenPaths.add(path);
  items.push({
    url: absoluteUrl(path),
    changeFrequency: page.changeFrequency ?? "weekly",
    priority: page.priority,
    alternates: {
      languages: createAlternates(path),
    },
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items: MetadataRoute.Sitemap = [];
  const seenPaths = new Set<string>();

  for (const page of publicPages) {
    pushSitemapEntry(items, seenPaths, page);
  }

  try {
    const now = new Date();
    const articles = await prisma.article.findMany({
      where: {
        AND: [
          { publishedAt: { not: null, lte: now } },
          { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        ],
      },
      orderBy: [{ updatedAt: "desc" }],
      select: { slug: true, updatedAt: true },
    });

    for (const article of articles) {
      const path = normalizePath(`/news/${article.slug}`);

      if (!isIndexablePath(path) || seenPaths.has(path)) {
        continue;
      }

      seenPaths.add(path);
      items.push({
        url: absoluteUrl(path),
        lastModified: article.updatedAt,
        changeFrequency: "weekly",
        priority: 0.5,
        alternates: {
          languages: createAlternates(path),
        },
      });
    }
  } catch (error) {
    console.error("[Sitemap] Error fetching articles:", error);
  }

  return items;
}
