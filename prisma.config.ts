// prisma.config.ts
import "dotenv/config";              // <-- грузим .env из корня проекта
import { defineConfig } from "prisma/config";

export default defineConfig({
  // путь к вашей схеме
  schema: "prisma/schema.prisma",
  

  // настройки миграций/сида
  migrations: {
    // команда, которую Prisma запустит для сидирования
    seed: "tsx prisma/seed.ts",
    // при необходимости можно добавить initShadowDb здесь
    // initShadowDb: `... SQL для внешних таблиц ...`,
  },

  // при необходимости можно включить другие опции:
  // views: { path: "prisma/views" },
  // typedSql: { path: "prisma/queries" },
  // experimental: { adapter: false, externalTables: false, studio: false },
});
