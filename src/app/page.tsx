import Image from "next/image";
import Link from "next/link";
import Section from "@/components/section";
import ImageCard from "@/components/image-card";

export const metadata = {
  title: "Salon Elen — красота и уход в Halle",
  description: "Стрижки, маникюр, макияж и уход за кожей. Онлайн-запись.",
};

export default function Home() {
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
              Парикмахерские услуги, маникюр, уход за кожей и макияж.
              Запишитесь онлайн — это быстро и удобно.
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
          <Image
            src="/images/hero.jpg"
            alt="Salon Elen"
            fill
            priority
            className="object-cover"
            sizes="100vw"
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

      {/* О нас */}
      <Section title="Команда" subtitle="Немного о нас">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-gray-200/70 dark:border-gray-800">
            <Image
              src="/images/team.jpg"
              alt="Команда салона"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
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
          <Image
            src="/images/cta.jpg"
            alt="Запись"
            fill
            className="object-cover -z-10"
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 to-black/10 dark:from-black/60" />
        </div>
      </Section>
    </main>
  );
}
