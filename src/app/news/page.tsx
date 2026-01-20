// src/app/news/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

export default async function Page() {
  const items = await prisma.article.findMany({
    where: {
      AND: [
        { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
        { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  return (
    <main className="px-4">
      <section className="mx-auto max-w-5xl py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
          Новости и акции
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => (
            <Link
              key={n.id}
              href={`/news/${n.slug}`}
              className="group rounded-2xl border border-gray-200/70 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                {n.cover ? (
                  <Image
                    src={n.cover}
                    alt={n.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    unoptimized={n.cover.startsWith("/uploads/")}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-sm opacity-60">
                    Нет изображения
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-medium line-clamp-2">{n.title}</h3>
                {n.excerpt && (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {n.excerpt}
                  </p>
                )}
                <span className="mt-3 inline-block text-sm opacity-70">
                  Читать&nbsp;дальше →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}




//----------исправляем кеширование картинок новостей------------------
// import Link from "next/link";
// import Image from "next/image";
// import { prisma } from "@/lib/db";

// export default async function Page() {
//   const items = await prisma.article.findMany({
//     where: {
//       AND: [
//         { OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] },
//         { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
//       ],
//     },
//     orderBy: { publishedAt: "desc" },
//     take: 30,
//   });

//   return (
//     <main className="px-4">
//       <section className="mx-auto max-w-5xl py-8">
//         <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
//           Новости и акции
//         </h1>

//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {items.map((n) => (
//             <Link
//               key={n.id}
//               href={`/news/${n.slug}`}
//               className="group rounded-2xl border border-gray-200/70 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
//             >
//               <div className="relative aspect-[16/9] overflow-hidden">
//                 {n.cover ? (
//                   <Image
//                     src={n.cover}
//                     alt={n.title}
//                     fill
//                     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
//                     className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//                   />
//                 ) : (
//                   <div className="absolute inset-0 grid place-items-center text-sm opacity-60">
//                     Нет изображения
//                   </div>
//                 )}
//               </div>

//               <div className="p-4">
//                 <h3 className="text-lg font-medium line-clamp-2">{n.title}</h3>
//                 {n.excerpt && (
//                   <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
//                     {n.excerpt}
//                   </p>
//                 )}
//                 <span className="mt-3 inline-block text-sm opacity-70">
//                   Читать&nbsp;дальше →
//                 </span>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </section>
//     </main>
//   );
// }
