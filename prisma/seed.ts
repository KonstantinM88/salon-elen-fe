import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const services = [
    { slug: "haircut",   title: "Стрижка",  priceCents: 3000, durationMin: 45 },
    { slug: "manicure",  title: "Маникюр",  priceCents: 3500, durationMin: 60 },
    { slug: "makeup",    title: "Макияж",   priceCents: 5000, durationMin: 60 },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }

  console.log("✓ Services seeded");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
