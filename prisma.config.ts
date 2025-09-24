import "dotenv/config"; // ← это загрузит .env перед разбором конфига
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Add your configuration here without the unsupported 'seed' property
});

