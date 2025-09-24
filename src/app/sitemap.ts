import { prisma } from "@/lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000"; // <-- без пробела
  const items: MetadataRoute.Sitemap = [
    { url: base + "/", priority: 1.0 },
    { url: base + "/services", priority: 0.8 },
    { url: base + "/news", priority: 0.6 },
  ];
  const articles = await prisma.article.findMany({ select: { slug: true } }); // ожидается ОК
  for (const a of articles) items.push({ url: base + "/news/" + a.slug, priority: 0.5 });
  return items;
}
