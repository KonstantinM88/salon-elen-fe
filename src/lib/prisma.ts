import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./prisma-client";

/** Храним клиент в глобале, чтобы не плодить экземпляры в dev */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  const verboseQueryLogging = process.env.PRISMA_LOG_QUERIES === "1";

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Match Prisma 6 timeout behavior while moving pooling to node-postgres.
  const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis: process.env.NODE_ENV === "development" ? 15_000 : 5_000,
    idleTimeoutMillis: 300_000,
  });

  return new PrismaClient({
    adapter,
    log: verboseQueryLogging ? ["query", "error", "warn"] : ["error", "warn"],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
