// ESM-версия
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // идемпотентный upsert — можно гонять хоть каждый день
  const data = [
    { slug: 'haircut',  title: 'Стрижка',  priceCents: 3000, durationMin: 45 },
    { slug: 'manicure', title: 'Маникюр',  priceCents: 3500, durationMin: 60 },
    { slug: 'makeup',   title: 'Макияж',   priceCents: 5000, durationMin: 60 },
  ];

  for (const s of data) {
    await prisma.service.upsert({
      where:  { slug: s.slug },
      update: { title: s.title, priceCents: s.priceCents, durationMin: s.durationMin },
      create: s,
    });
  }

  console.log('Seed OK');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
