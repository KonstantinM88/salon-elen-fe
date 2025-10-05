// src/app/booking/page.tsx
import PublicBookingForm from "@/components/public-booking-form";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Онлайн-запись",
};

// чтобы страница всегда брала свежие услуги
export const dynamic = "force-dynamic";

export default async function BookingPage() {
  // Берём активные услуги. В Prisma поле называется `name`
  // (в БД оно мапится на колонку `title`).
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { slug: "asc" }, // стабильный порядок
    select: { slug: true, name: true, durationMin: true },
  });

  return (
    <main className="px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Онлайн-запись</h1>

      <div className="max-w-xl">
        <PublicBookingForm services={services} />
      </div>
    </main>
  );
}







// import { prisma } from "@/lib/db";
// import BookingForm from "@/components/booking-form";

// export const dynamic = 'force-dynamic';

// export const metadata = {
//   title: "Запись онлайн — Salon Elen",
//   description: "Онлайн-запись в салон красоты Salon Elen (Halle).",
// };

// export default async function BookingPage() {
//   const services = await prisma.service.findMany({
//     orderBy: { title: "asc" },
//     select: { id: true, title: true, durationMin: true, priceCents: true }, // что нужно форме
//   });

// // export default async function BookingPage() {
// //   const res = await fetch('/api/services', { cache: 'no-store' });
// //   const { services } = await res.json();

// // export default async function BookingPage() {
// //   const services = await prisma.service.findMany({
// //     select: { id: true, title: true, durationMin: true },
// //     orderBy: { title: "asc" },
// //   });

//   return (
//     <section className="container py-10">
//       <h1 className="text-3xl font-bold mb-6">Запись онлайн</h1>
//       <BookingForm services={services} />
//     </section>
//   );
// }

