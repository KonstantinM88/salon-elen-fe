import Image from "next/image";
import Section from "@/components/section";

export const metadata = { title: "Галерея — Salon Elen" };

const files = ["g1.jpg","g2.jpg","g3.jpg","g4.jpg","g5.jpg"];

export default function GalleryPage() {
  return (
    <main>
      <Section title="Галерея" subtitle="Наши работы">
        {/* Простая адаптивная сетка */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {files.map((file, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200/70 dark:border-gray-800">
              <Image
                src={`/images/gallery/${file}`}
                alt={`Работа ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
