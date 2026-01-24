// src/app/services/page.tsx
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { Metadata } from "next";
import ServicesClient from "./ServicesClient";

export const dynamic = "force-dynamic";

// Переводы мета-данных
const metaTitles: Record<string, string> = {
  de: "Unsere Leistungen — Salon Elen",
  ru: "Наши услуги — Salon Elen",
  en: "Our Services — Salon Elen",
};

const metaDescriptions: Record<string, string> = {
  de: "Entdecken Sie unser komplettes Angebot an Schönheitsdienstleistungen: Haarpflege, Maniküre, Make-up und vieles mehr.",
  ru: "Откройте для себя полный спектр услуг красоты: уход за волосами, маникюр, макияж и многое другое.",
  en: "Discover our complete range of beauty services: hair care, manicure, makeup and much more.",
};

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "de";
  
  return {
    title: metaTitles[locale] || metaTitles.de,
    description: metaDescriptions[locale] || metaDescriptions.de,
  };
}

export default async function ServicesPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value || "de";

  // Загружаем категории (родительские услуги)
  const categories = await prisma.service.findMany({
    where: {
      isActive: true,
      isArchived: false,
      parentId: null,
    },
    orderBy: { name: "asc" },
    include: {
      translations: {
        where: { locale },
        select: { name: true, description: true },
      },
      gallery: {
        orderBy: { sortOrder: "asc" },
        take: 6,
      },
      children: {
        where: {
          isActive: true,
          isArchived: false,
        },
        orderBy: { name: "asc" },
        include: {
          translations: {
            where: { locale },
            select: { name: true, description: true },
          },
          gallery: {
            orderBy: { sortOrder: "asc" },
            take: 6,
          },
        },
      },
    },
  });

  // Преобразуем данные с переводами
  const categoriesWithTranslations = categories.map((cat) => {
    const catTranslation = cat.translations[0];
    return {
      id: cat.id,
      slug: cat.slug,
      name: catTranslation?.name || cat.name,
      description: catTranslation?.description || cat.description,
      cover: cat.cover,
      gallery: cat.gallery.map((g) => ({
        id: g.id,
        image: g.image,
        caption: g.caption,
      })),
      children: cat.children.map((child) => {
        const childTranslation = child.translations[0];
        return {
          id: child.id,
          slug: child.slug,
          name: childTranslation?.name || child.name,
          description: childTranslation?.description || child.description,
          priceCents: child.priceCents,
          durationMin: child.durationMin,
          cover: child.cover,
          gallery: child.gallery.map((g) => ({
            id: g.id,
            image: g.image,
            caption: g.caption,
          })),
        };
      }),
    };
  });

  return <ServicesClient categories={categoriesWithTranslations} locale={locale} />;
}





//---------была заглушка---------
// // src/app/services/page.tsx

// import ImageCard from "@/components/image-card";
// import Link from "next/link";

// export const metadata = { title: "Услуги — Salon Elen" };

// export default function ServicesPage() {
//   const items = [
//     {
//       id: "haircut",
//       title: "Стрижка",
//       img: "/images/services/haircut.jpg",
//       text: "Женская/мужская стрижка, уход и укладка.",
//       duration: "45 мин",
//       price: "от 30 €",
//     },
//     {
//       id: "manicure",
//       title: "Маникюр",
//       img: "/images/services/manicure.jpg",
//       text: "Классический и аппаратный маникюр, гель-лак.",
//       duration: "60 мин",
//       price: "от 35 €",
//     },
//     {
//       id: "makeup",
//       title: "Макияж",
//       img: "/images/services/makeup.jpg",
//       text: "Дневной, вечерний, свадебный.",
//       duration: "60 мин",
//       price: "от 50 €",
//     },
//   ];

//   return (
//     <main className="container py-10 sm:py-14">
//       <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6 sm:mb-8">
//         Услуги
//       </h1>

//       <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
//         {items.map((s) => (
//           <div key={s.id} id={s.id}>
//             <ImageCard src={s.img} alt={s.title} title={s.title}>
//               <p>{s.text}</p>
//               <p className="mt-2 text-gray-600 dark:text-gray-400">
//                 {s.duration} • {s.price}
//               </p>
//               <div className="mt-3">
//                 <Link href={`/booking?service=${s.id}`} className="btn">
//                   Записаться
//                 </Link>
//               </div>
//             </ImageCard>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }

