import Image from "next/image";
import Section from "@/components/section";

export const metadata = { title: "Контакты — Salon Elen" };

export default function ContactsPage() {
  return (
    <main>
      <Section title="Контакты" subtitle="Как нас найти">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p><b>Адрес:</b> Halle, улица Салона, 123</p>
            <p><b>Телефон:</b> <a href="tel:+491234567890" className="underline-offset-4 hover:underline">+49 123 456 7890</a></p>
            <p><b>Email:</b> <a href="mailto:info@salon-elen.de" className="underline-offset-4 hover:underline">info@salon-elen.de</a></p>
            <p><b>Время работы:</b> Пн–Пт 10:00–19:00, Сб 10:00–16:00</p>
          </div>

          {/* вместо «живой» карты — оптимизированная картинка */}
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-gray-200/70 dark:border-gray-800">
            <Image
              src="/images/cta.jpg" // заменишь на скрин карты /images/map.jpg
              alt="Карта — как нас найти"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </Section>
    </main>
  );
}
