import Link from "next/link";
import Image from "next/image";
import Section from "@/components/section";
// import ImageCard from "@/components/image-card";
import { prisma } from "@/lib/db";

/* ---------- Типы ---------- */
type KnownType = "ARTICLE" | "NEWS" | "PROMO";

const TYPE_LABEL: Record<KnownType, string> = {
  ARTICLE: "Статья",
  NEWS: "Новость",
  PROMO: "Акция",
};

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  cover?: string | null;
  type?: KnownType | null;
};

/* ---------- Данные ---------- */
// последние 3 публикации из модели Article
async function getLatestArticles(): Promise<NewsItem[]> {
  const now = new Date();

  const rows = await prisma.article.findMany({
    where: {
      AND: [
        { OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      cover: true,
      type: true, // ArticleType: "ARTICLE" | "NEWS"
    },
  });

  // приводим ArticleType к нашему KnownType (PROMO остаётся как внутренний fallback)
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    cover: r.cover,
    type: (r.type ?? "NEWS") as KnownType,
  }));
}

/* ---------- Страница ---------- */
export default async function Page() {
  const latest = await getLatestArticles();

  return (
    <main>


 {/* HERO – широкоформатно, картинка целиком */}
<section className="relative isolate overflow-hidden w-full min-h-[clamp(460px,72svh,840px)]">
  <div className="container relative z-10 pt-16 sm:pt-24 pb-16 sm:pb-28">
    <div className="max-w-2xl">
      <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight">
        Salon Elen — красота и уход в Halle
      </h1>
      <p className="mt-4 text-gray-700 dark:text-gray-300">
        Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/booking" className="btn">Записаться</Link>
        <Link href="/services" className="btn border-gray-300 dark:border-gray-700 bg-transparent">Услуги</Link>
      </div>
    </div>
  </div>

  {/* Фон HERO */}
  <div className="absolute inset-0 -z-10 bg-[#efe7de] dark:bg-[#0f1216]">
    {/* Мобила */}
    <div className="md:hidden absolute inset-0">
      <Image
        src="/images/hero-mobile.webp"
        alt="Salon Elen"
        fill
        priority
        fetchPriority="high"
        loading="eager"
        sizes="100vw"
        style={{ objectFit: "contain" }}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyNlZmU3ZGUnLz48L3N2Zz4="
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-2xl opacity-50"
        style={{
          backgroundImage: 'url("/images/hero-mobile.webp")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scale(1.05)",
          filter: "blur(40px)",
        }}
      />
    </div>

    {/* Десктоп */}
    <div className="hidden md:block absolute inset-0">
      <Image
        src="/images/hero.webp"
        alt="Salon Elen"
        fill
        priority
        fetchPriority="high"
        loading="eager"
        sizes="100vw"
        style={{ objectFit: "contain" }}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyNlZmU3ZGUnLz48L3N2Zz4="
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-2xl opacity-50"
        style={{
          backgroundImage: 'url("/images/hero.webp")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scale(1.05)",
          filter: "blur(40px)",
        }}
      />
    </div>

    {/* Лёгкое затемнение для читабельности текста */}
    <div className="absolute inset-0 bg-white/35 dark:bg-black/55" />
  </div>
</section>



      {/* Услуги превью */}
      <Section title="Популярные услуги" subtitle="Что мы делаем лучше всего">
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {/* 1) Макияж — теперь первый */}
    <Link href="/coming-soon" className="group block rounded-2xl border hover:shadow-md transition overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src="/images/services/makeup.webp"
          alt="Макияж"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium">Макияж</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Подчеркнём вашу естественную красоту.</p>
      </div>
    </Link>

    {/* 2) Маникюр — остаётся вторым */}
    <Link href="/coming-soon" className="group block rounded-2xl border hover:shadow-md transition overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src="/images/services/manicure.webp"
          alt="Маникюр"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium">Маникюр</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Эстетика, стерильность и стойкое покрытие.</p>
      </div>
    </Link>

    {/* 3) Стрижка — теперь третья */}
    <Link href="/coming-soon" className="group block rounded-2xl border hover:shadow-md transition overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src="/images/services/haircut.webp"
          alt="Стрижка"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
        />
      </div>
      <div className="p-4">
        <h3 className="font-medium">Стрижка</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Современные техники, уход и подбор формы.</p>
      </div>
    </Link>
  </div>
</Section>


      {/* Новости и акции */}
      <Section title="Новости и акции" subtitle="Свежие публикации" titleHref="/news">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.length > 0 ? (
            latest.map((n) => (


              <Link
  key={n.id}
  href={`/news/${n.slug}`}
  className="group block rounded-2xl border hover:shadow-md transition overflow-hidden"
>
  {n.cover ? (
    <div className="relative aspect-[16/10] overflow-hidden">
      <Image
        src={n.cover}
        alt={n.title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
      />
    </div>
  ) : null}
  <div className="p-4">
    <div className="text-xs text-gray-500 mb-1">
      {TYPE_LABEL[(n.type ?? "NEWS") as KnownType]}
    </div>
    <h3 className="text-base font-medium line-clamp-2">{n.title}</h3>
    {n.excerpt ? (
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{n.excerpt}</p>
    ) : null}
  </div>
</Link>



            ))
          ) : (
            <div className="text-gray-500">Пока нет публикаций.</div>
          )}
        </div>
      </Section>

      {/* Команда */}
      <Section title="Команда" subtitle="Немного о нас">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl overflow-hidden border">
            <div className="relative aspect-[4/3]">
              <Image
                src="/images/team.jpg"
                alt="Команда салона"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium">Наша команда</h3>
              <p className="text-sm text-gray-600 mt-1">
                Сертифицированные мастера с опытом и вниманием к деталям.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA с картинкой */}
      <Section className="pb-16">
        <div className="relative overflow-hidden rounded-3xl min-h-[260px] md:min-h-[320px]">
          <div className="relative z-10 p-6 sm:p-10">
            <h3 className="text-2xl sm:text-3xl font-semibold">
              Готовы к обновлению?
            </h3>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Выберите удобное время и запишитесь онлайн.
            </p>
            <div className="mt-6">
              <Link href="/booking" className="btn">Записаться</Link>
            </div>
          </div>
          <Image
            src="/images/cta.jpg"
            alt="Запись"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 to-black/10 dark:from-black/60" />
        </div>
      </Section>
    </main>
  );
}
