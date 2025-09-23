import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { title: "asc" } });
  return (
    <section className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Услуги</h1>
      <ul className="space-y-4">
        {services.map(s => (
          <li key={s.id} className="flex items-center justify-between border-b pb-3">
            <span>{s.title}</span>
            <span className="tabular-nums">{(s.priceCents/100).toFixed(2)} €</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
