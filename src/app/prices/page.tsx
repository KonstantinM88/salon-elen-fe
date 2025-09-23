import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function euro(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default async function PricesPage() {
  const services = await prisma.service.findMany({ orderBy: [{ title: "asc" }] });

  return (
    <main className="container py-10 sm:py-14">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6 sm:mb-8">
        Цены
      </h1>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Услуга</th>
              <th>Длительность</th>
              <th>Цена</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-black/5">
            {services.map(s => (
              <tr key={s.id} className="[&>td]:px-3 [&>td]:py-2">
                <td className="font-medium">{s.title}</td>
                <td>{s.durationMin} мин</td>
                <td>{euro(s.priceCents)} €</td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-gray-500">
                  Список пуст
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
