import { prisma } from "@/lib/db";
import BookingForm from "@/components/booking-form";

export const metadata = {
  title: "Запись онлайн — Salon Elen",
  description: "Онлайн-запись в салон красоты Salon Elen (Halle).",
};

export default async function BookingPage() {
  const services = await prisma.service.findMany({
    select: { id: true, title: true, durationMin: true },
    orderBy: { title: "asc" },
  });

  return (
    <section className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Запись онлайн</h1>
      <BookingForm services={services} />
    </section>
  );
}

