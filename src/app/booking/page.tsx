import { prisma } from '@/lib/db';
import PublicBookingForm from '@/components/public-booking-form';

export const metadata = { title: 'Онлайн-запись' };
export const dynamic = 'force-dynamic';

export default async function BookingPage() {
  const categories = await prisma.service.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      children: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: { slug: true, name: true, description: true, durationMin: true, priceCents: true },
      },
    },
  });

  return (
    <section className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Запись онлайн</h1>
      <PublicBookingForm categories={categories} />
    </section>
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

