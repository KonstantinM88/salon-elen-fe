import { PrismaClient } from "@prisma/client";

// объявляем глобальную переменную с типом
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma; // кэшируем в dev, чтобы не плодить коннекты при HMR
}
