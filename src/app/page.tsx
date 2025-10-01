import Link from "next/link";
import Image from "next/image";
import Section from "@/components/section";
import CTAButton from "@/components/cta-button"; // ← живая кнопка
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
      type: true,
    },
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

/* ---------- Страница ---------- */
export default async function Page() {
  const latest = await getLatestArticles();

  return (
    <main>
      {/* HERO — mobile старый layout, но кнопка заменена на CTAButton; desktop — обновлённый тёмный */}
      <section className="relative isolate w-full">
        {/* ===== MOBILE (до md) ===== */}
        <div className="md:hidden">
          {/* заголовок над фото */}
          <div className="container pt-4">
            <h1 className="text-[26px] leading-[1.15] font-semibold tracking-tight text-[#F5F3EE]">
              Salon Elen — красота и уход в Halle
            </h1>
          </div>

          {/* фото целиком */}
          <div className="relative w-full mt-2">
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
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/images/hero-mobile.webp"
                alt="Salon Elen"
                fill
                sizes="100vw"
                className="object-contain"
                priority
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9JyNlZmU3ZGUnLz48L3N2Zz4="
              />
            </div>
          </div>

          {/* описание и кнопки под фото */}
          <div className="container pb-6 mt-4">
            <p className="text-[14px] leading-relaxed text-[#F5F3EE]/95">
              Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.
            </p>
            <div className="mt-4 flex gap-3">
              {/* Мобильная «живая» кнопка — делаем компактнее высоту/паддинги */}
              <CTAButton href="/booking" idle="aura" className="h-10 px-5 text-sm">
  Записаться
</CTAButton>


              <Link
                href="/services"
                className="rounded-full px-4 py-2 text-sm font-medium text-[#F5F3EE]/90 hover:text-[#F5F3EE] border border-white/25 hover:bg-white/10 transition"
              >
                Услуги
              </Link>
            </div>
          </div>
        </div>

        {/* ===== DESKTOP (от md) — обновлённый тёмный вариант ===== */}
        <div className="hidden md:block relative w-full overflow-hidden h-[560px] lg:h-[600px] xl:h-[640px]">
          {/* Фон-фото: заполняет ширину, фокус чуть вправо */}
          <Image
            src="/images/hero.webp"
            alt="Salon Elen — стильная студия парикмахерских услуг"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_50%]"
          />

          {/* Левый динамический градиент под текст */}
          <div
            className="
              absolute inset-y-0 left-0 z-[1]
              w-[clamp(36%,42vw,48%)]
              bg-gradient-to-r from-black/85 via-black/55 to-transparent
              [mask-image:linear-gradient(to_right,black,black,transparent)]
            "
          />

          {/* Едва заметная правая виньетка */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-l from-black/10 via-transparent to-transparent pointer-events-none" />

          {/* Контент */}
          <div className="relative z-10 h-full">
            <div className="container h-full">
              <div className="flex h-full items-center">
                <div className="max-w-[620px]">
                  <h1 className="text-[#F5F3EE] font-semibold tracking-tight leading-[1.06] max-w-[14ch] text-[clamp(40px,6vw,64px)]">
                    Salon Elen — красота и уход в Halle
                  </h1>

                  <p className="mt-5 text-[#F5F3EE]/90 text-[19px] leading-relaxed max-w-[50ch]">
                    Парикмахерские услуги, маникюр, уход за кожей и макияж. Запишитесь онлайн — это быстро и удобно.
                  </p>

                  <div className="mt-7 flex items-center gap-4">
                    {/* Десктопная «живая» кнопка */}
                    {/* <CTAButton href="/booking" idle="sheen">Записаться</CTAButton> */}
                    {/* Десктопная «живая» кнопка — делаем заметнее */}
<CTAButton
  href="/booking"
  ariaLabel="Записаться онлайн"
  idle="gradient"                            // мягкий тёплый перелив
  className="cta-boost idle-sheen"           // + редкий автоблик и усиление для десктопа
>
  Записаться
</CTAButton>



                    <Link
                      href="/services"
                      className="inline-flex h-12 px-7 items-center justify-center rounded-full
                                 border border-white/70 text-white hover:bg-white/10 transition"
                    >
                      Услуги
                    </Link>
                  </div>

                  <div className="mt-4 text-white/70 text-sm">
                    Онлайн-запись 24/7 • В центре Halle
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Услуги превью */}
      <Section title="Популярные услуги" subtitle="Что мы делаем лучше всего">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <h3 className="text-2xl sm:text-3xl font-semibold">Готовы к обновлению?</h3>
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
