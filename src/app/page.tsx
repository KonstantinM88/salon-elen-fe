import Link from "next/link";
import Section from "@/components/section";
import ImageCard from "@/components/image-card";
import { prisma } from "@/lib/db";

/** последние 3 публикации: без даты или с publishedAt <= now, и не истёкшие */
async function getLatestArticles() {
  const now = new Date();
  return prisma.article.findMany({
    where: {
      AND: [
        { OR: [{ publishedAt: null }, { publishedAt: { lte: now } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
      ],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
    select: { id: true, title: true, slug: true, excerpt: true, cover: true, type: true },
  });
}

export const metadata = {
  title: "Salon Elen — красота и уход в Halle",
  description: "Стрижки, маникюр, макияж и уход за кожей. Онлайн-запись.",
};

export default async function Home() {
  const latest = await getLatestArticles();

  return (
    <main>
      {/* HERO */}
      <section className="relative">
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
              <Link href="/services" className="btn border-gray-300 dark:border-gray-700 bg-transparent">
                Услуги
              </Link>
            </div>
          </div>
        </div>

        {/* фоновое изображение с затемнением */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/hero.jpg"
            alt="Salon Elen"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-white/50 dark:bg-black/55 backdrop-blur-[1px]" />
        </div>
      </section>

      {/* Услуги превью */}
      <Section title="Популярные услуги" subtitle="Что мы делаем лучше всего">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ImageCard
            href="/services#haircut"
            src="/images/services/haircut.jpg"
            alt="Стрижка"
            title="Стрижка"
          >
            Современные техники, уход и подбор формы.
          </ImageCard>

          <ImageCard
            href="/services#manicure"
            src="/images/services/manicure.jpg"
            alt="Маникюр"
            title="Маникюр"
          >
            Гигиенический и аппаратный маникюр, покрытие гель-лаком.
          </ImageCard>

          <ImageCard
            href="/services#makeup"
            src="/images/services/makeup.jpg"
            alt="Макияж"
            title="Макияж"
          >
            Дневной, вечерний, свадебный макияж.
          </ImageCard>
        </div>
      </Section>

      {/* Новости и акции */}
      <Section title="Новости и акции" subtitle="Свежие публикации">
        {latest.length === 0 ? (
          <p className="text-sm opacity-70">Пока нет публикаций.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((n) => (
              <Link
                key={n.id}
                href={`/news/${n.slug}`}
                className="block rounded-2xl border hover:shadow-md transition overflow-hidden"
              >
                {n.cover && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {/* Используем обычный <img>, чтобы не требовать настройки доменов */}
                    <img
                      src={n.cover}
                      alt={n.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="text-xs uppercase tracking-wide opacity-60">
                    {n.type === "PROMO" ? "Акция" : "Новость"}
                  </div>
                  <h3 className="mt-1 font-semibold">{n.title}</h3>
                  {n.excerpt && (
                    <p className="mt-2 text-sm opacity-80 line-clamp-3">{n.excerpt}</p>
                  )}
                  <span className="mt-3 inline-block text-sm text-primary-600 dark:text-primary-400">
                    Читать →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link href="/news" className="btn">Все публикации</Link>
        </div>
      </Section>

      {/* О нас */}
      <Section title="Команда" subtitle="Немного о нас">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-gray-200/70 dark:border-gray-800">
            <img
              src="/images/team.jpg"
              alt="Команда салона"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center">
            <p className="text-gray-700 dark:text-gray-300">
              Мы — команда профессионалов с многолетним опытом и вниманием к деталям.
              Доверяя нам, вы получаете не только отличный результат, но и приятные эмоции.
            </p>
          </div>
        </div>
      </Section>

      {/* CTA с картинкой */}
      <Section className="pb-16">
        <div className="relative rounded-3xl overflow-hidden border border-gray-200/70 dark:border-gray-800">
          <div className="relative z-10 p-8 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Готовы к обновлению?
            </h3>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              Выберите удобное время и запишитесь онлайн.
            </p>
            <div className="mt-6">
              <Link href="/booking" className="btn">Записаться</Link>
            </div>
          </div>
          <img
            src="/images/cta.jpg"
            alt="Запись"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 to-black/10 dark:from-black/60" />
        </div>
      </Section>
    </main>
  );
}
