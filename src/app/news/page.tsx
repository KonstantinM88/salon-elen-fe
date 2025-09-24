import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const now = new Date();
  const list = await prisma.article.findMany({
    where: {
      OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }],
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Новости и акции</h1>
      <div className="space-y-4">
        {list.map((item) => (
          <article key={item.id} className="border rounded-2xl p-4">
            <h2 className="text-lg font-medium">
              <Link href={"/news/" + item.slug} className="underline">
                {item.title}
              </Link>
            </h2>
            {item.excerpt && (
              <p className="text-sm opacity-80 mt-2">{item.excerpt}</p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
