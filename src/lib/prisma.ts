//src/lib/db.ts
import { PrismaClient } from "@prisma/client";

/** Храним клиент в глобале, чтобы не плодить экземпляры в dev */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}



//----------работал раньше пока не начались проблемы с новыми слотами----------//
// // src/lib/prisma.ts
// import { PrismaClient } from "@prisma/client";

// declare global {
 
//   var prisma: PrismaClient | undefined;
// }

// export const prisma =
//   global.prisma ??
//   new PrismaClient({
//     log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
//   });

// if (process.env.NODE_ENV !== "production") {
//   global.prisma = prisma;
// }
