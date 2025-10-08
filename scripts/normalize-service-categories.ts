// scripts/normalize-service-categories.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Считаем верхним уровнем всё с parentId = null.
  // Приводим такие записи к "категории": durationMin=0, priceCents=null.
  const updated = await prisma.service.updateMany({
    where: {
      parentId: null,
      OR: [
        { durationMin: { not: 0 } },
        { priceCents: { not: null } },
      ],
    },
    data: {
      durationMin: 0,
      priceCents: null,
    },
  });

  console.log(`Normalized top-level categories: ${updated.count}`);

  // (По желанию) можно удалить "подозрительные" пустые дети без parentId и без детей.
  // Но безопаснее просто оставить.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
});
