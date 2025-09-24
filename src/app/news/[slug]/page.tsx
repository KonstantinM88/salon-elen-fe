import { prisma } from "@/lib/db";
import Link from "next/link";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await prisma.article.findMany({ select: { slug: true } });
  return items.map((i) => ({ slug: i.slug }));
}

export default async function NewsItemPage({ params }: Props) {
  const { slug } = await params;

  const item = await prisma.article.findUnique({
    where: { slug },
  });

  if (!item) {
    return (
      <main className="container py-10">
        <p>Публикация не найдена.</p>
        <Link href="/news" className="btn mt-4">
          Все публикации
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-10 space-y-6">
      <nav className="text-sm opacity-70">
        <Link href="/news" className="hover:underline">
          Новости
        </Link>
        <span> / </span>
        <span>{item.title}</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>

      {item.cover && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border">
          {/* Обычный <img> — работает и с /uploads, и с внешними ссылками */}
          <img
            src={item.cover}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {item.excerpt && <p className="text-lg opacity-80">{item.excerpt}</p>}

      <article className="prose dark:prose-invert max-w-none">
        {/* Текст храним как простой markdown/HTML-plain.
            Если будет markdown — добавим парсер позже. */}
        <pre className="whitespace-pre-wrap font-sans text-base leading-7">
          {item.body}
        </pre>
      </article>
    </main>
  );
}
