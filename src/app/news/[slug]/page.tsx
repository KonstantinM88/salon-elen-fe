/* eslint-disable @next/next/no-img-element */
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const list = await prisma.article.findMany({ select: { slug: true } });
  return list.map((x) => ({ slug: x.slug }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // <-- распаковка

  const item = await prisma.article.findUnique({ where: { slug } });
  if (!item) return notFound();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{item.title}</h1>
      {item.cover && <img src={item.cover} alt={item.seoTitle || item.title} className="w-full rounded-2xl" />}
      <div className="prose" dangerouslySetInnerHTML={{ __html: item.body.replace(/\n/g, "<br/>") }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: item.seoTitle || item.title,
            datePublished: item.publishedAt || item.createdAt,
            image: item.cover || undefined,
          }),
        }}
      />
    </main>
  );
}
