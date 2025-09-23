import Section from "@/components/section";
import ImageCard from "@/components/image-card";
import Link from "next/link";

export const metadata = { title: "Услуги — Salon Elen" };

export default function ServicesPage() {
  const items = [
    {
      id: "haircut",
      title: "Стрижка",
      img: "/images/services/haircut.jpg",
      text: "Женская/мужская стрижка, уход и укладка.",
      duration: "45 мин",
      price: "от 30 €",
    },
    {
      id: "manicure",
      title: "Маникюр",
      img: "/images/services/manicure.jpg",
      text: "Классический и аппаратный маникюр, гель-лак.",
      duration: "60 мин",
      price: "от 35 €",
    },
    {
      id: "makeup",
      title: "Макияж",
      img: "/images/services/makeup.jpg",
      text: "Дневной, вечерний, свадебный.",
      duration: "60 мин",
      price: "от 50 €",
    },
  ];

  return (
    <main className="container py-10 sm:py-14">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6 sm:mb-8">
        Услуги
      </h1>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <div key={s.id} id={s.id}>
            <ImageCard src={s.img} alt={s.title} title={s.title}>
              <p>{s.text}</p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {s.duration} • {s.price}
              </p>
              <div className="mt-3">
                <Link href={`/booking?service=${s.id}`} className="btn">
                  Записаться
                </Link>
              </div>
            </ImageCard>
          </div>
        ))}
      </div>
    </main>
  );
}

