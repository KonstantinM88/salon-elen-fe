import { prisma } from "@/lib/db";
import type { MetadataRoute } from "next";

const BASE_URL = "https://permanent-halle.de";
const LOCALES = ['de', 'en', 'ru'] as const;

// Создаёт alternates для всех языков
function createAlternates(path: string): Record<string, string> {
  return {
    de: `${BASE_URL}${path}`,
    en: `${BASE_URL}${path}${path === '/' ? '' : '/'}?lang=en`,
    ru: `${BASE_URL}${path}${path === '/' ? '' : '/'}?lang=ru`,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items: MetadataRoute.Sitemap = [];

  // ========== СТАТИЧЕСКИЕ СТРАНИЦЫ ==========
  const staticPages = [
    { path: '/', priority: 1.0 },
    { path: '/services', priority: 0.9 },
    { path: '/booking', priority: 0.9 },
    { path: '/prices', priority: 0.8 },
    { path: '/news', priority: 0.7 },
    { path: '/contacts', priority: 0.6 },
    { path: '/gallerie', priority: 0.6 },
  ];

  for (const page of staticPages) {
    // Основная страница (немецкая)
    items.push({
      url: `${BASE_URL}${page.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: page.priority,
      alternates: {
        languages: createAlternates(page.path),
      },
    });
  }

  // ========== СТАТЬИ ==========
  try {
    const now = new Date();
    const articles = await prisma.article.findMany({ 
      where: { 
        publishedAt: { 
          not: null,
          lte: now // Опубликованные (дата публикации <= сейчас)
        }
      },
      select: { slug: true, updatedAt: true } 
    });
    
    for (const article of articles) {
      const path = `/news/${article.slug}`;
      items.push({
        url: `${BASE_URL}${path}`,
        lastModified: article.updatedAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
        alternates: {
          languages: createAlternates(path),
        },
      });
    }
  } catch (error) {
    console.error('[Sitemap] Error fetching articles:', error);
  }

  return items;
}




// import { prisma } from "@/lib/db";
// import type { MetadataRoute } from "next";

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const base = process.env.NEXTAUTH_URL || "http://localhost:3000"; // <-- без пробела
//   const items: MetadataRoute.Sitemap = [
//     { url: base + "/", priority: 1.0 },
//     { url: base + "/services", priority: 0.8 },
//     { url: base + "/news", priority: 0.6 },
//   ];
//   const articles = await prisma.article.findMany({ select: { slug: true } }); // ожидается ОК
//   for (const a of articles) items.push({ url: base + "/news/" + a.slug, priority: 0.5 });
//   return items;
// }
