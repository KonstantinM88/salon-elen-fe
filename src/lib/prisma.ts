import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./prisma-client";

/** Храним клиент в глобале, чтобы не плодить экземпляры в dev */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function readMillisEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  const verboseQueryLogging = process.env.PRISMA_LOG_QUERIES === "1";
  const connectionTimeoutMillis = readMillisEnv("PG_CONNECTION_TIMEOUT_MS", 15_000);
  const idleTimeoutMillis = readMillisEnv("PG_IDLE_TIMEOUT_MS", 300_000);

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis,
    idleTimeoutMillis,
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
