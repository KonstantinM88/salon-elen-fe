// src/app/page.tsx
import { prisma } from "@/lib/db";
import HomePage from "@/components/home-page";

type KnownType = "ARTICLE" | "NEWS" | "PROMO";

type ArticleItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  type: KnownType;
};

async function getLatestArticles(): Promise<ArticleItem[]> {
  const rows = await prisma.article.findMany({
    where: { publishedAt: { not: null } },
    orderBy: [{ createdAt: "desc" }],
    take: 3,
  });

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    cover: r.cover,
    type: (r.type ?? "NEWS") as KnownType,
  }));
}

export default async function Page() {
  const latest = await getLatestArticles();
  return <HomePage latest={latest} />;
}
