// prisma.config.ts
import { defineConfig } from "prisma/config";

export default defineConfig({
  // путь к схеме
  schema: "prisma/schema.prisma",

  // настройки миграций и сид-скрипта
  migrations: {
    // команда, которую Prisma запустит для сидирования
    seed: "tsx prisma/seed.ts",
  },
});
