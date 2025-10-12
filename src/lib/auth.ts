// src/lib/auth.ts
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { z } from "zod";
import type { Role } from "@prisma/client";

/* ───────── helpers ───────── */

const credentialsSchema = z.object({
  // сначала trim + email, потом приводим к нижнему регистру
  email: z.string().trim().email().transform((s) => s.toLowerCase()),
  password: z.string().min(8),
});


type MaybeUser = AdapterUser | NextAuthUser;

function isRole(v: unknown): v is Role {
  return v === "USER" || v === "MASTER" || v === "ADMIN";
}
function hasId(u: MaybeUser): u is MaybeUser & { id: string } {
  return "id" in u && typeof (u as { id?: unknown }).id === "string";
}
function hasRole(u: MaybeUser): u is MaybeUser & { role: Role } {
  if (!("role" in u)) return false;
  const r = (u as { role?: unknown }).role;
  return isRole(r);
}
function hasMasterId(u: MaybeUser): u is MaybeUser & { masterId: string | null } {
  if (!("masterId" in u)) return false;
  const v = (u as { masterId?: unknown }).masterId;
  return v === null || typeof v === "string";
}

/* ───────── NextAuth options ───────── */

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Пользователь должен существовать и иметь passwordHash
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            role: true,
            master: { select: { id: true } },
          },
        });
        if (!dbUser?.passwordHash) return null;

        const ok = await verifyPassword(password, dbUser.passwordHash);
        if (!ok) return null;

        // Возвращаем payload, который коллбэки добавят в JWT
        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name ?? null,
          image: dbUser.image ?? null,
          role: dbUser.role as Role,
          masterId: dbUser.master?.id ?? null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // На первом заходе приходит user — кладём id/role/masterId в токен
      if (user) {
        if (hasId(user)) token.id = user.id;
        if (hasRole(user)) token.role = user.role;
        if (hasMasterId(user)) token.masterId = user.masterId;
        return token;
      }

      // Подстраховка: если id ещё нет, возьмём из стандартного sub
      if (!("id" in token) || typeof (token as { id?: unknown }).id !== "string") {
        if (typeof token.sub === "string") token.id = token.sub;
      }

      // Актуализируем роль/masterId из БД (например, если их меняли в админке)
      if (typeof token.id === "string") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, master: { select: { id: true } } },
          });
          if (dbUser) {
            token.role = dbUser.role as Role;
            token.masterId = dbUser.master?.id ?? null;
          }
        } catch {
          // игнорируем временные ошибки/миграции
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // Эти поля расширены в src/types/next-auth.d.ts
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = (token.role as Role) ?? "USER";
      }
      session.masterId = (token.masterId as string | null) ?? null;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};




// // src/lib/auth.ts
// import { type NextAuthOptions, type User as NextAuthUser } from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import type { AdapterUser } from "next-auth/adapters";
// import { prisma } from "@/lib/db";
// import { verifyPassword } from "@/lib/password";
// import { z } from "zod";
// import type { AppRole } from "@/types/next-auth";

// const credentialsSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(8),
// });

// function isAppRole(v: unknown): v is AppRole {
//   return v === "USER" || v === "MASTER" || v === "ADMIN";
// }
// type MaybeUser = AdapterUser | NextAuthUser;

// function hasId(u: MaybeUser): u is MaybeUser & { id: string } {
//   return "id" in u && typeof (u as { id?: unknown }).id === "string";
// }
// function hasRoleProp(u: MaybeUser): u is MaybeUser & { role: AppRole } {
//   if (!("role" in u)) return false;
//   const role = (u as { role?: unknown }).role;
//   return typeof role === "string" && isAppRole(role);
// }
// function hasMasterId(u: MaybeUser): u is MaybeUser & { masterId: string | null } {
//   if (!("masterId" in u)) return false;
//   const v = (u as { masterId?: unknown }).masterId;
//   return v === null || typeof v === "string";
// }

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   session: { strategy: "jwt" },
//   providers: [
//     Credentials({
//       name: "Email & Password",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Пароль", type: "password" },
//       },
//       authorize: async (raw) => {
//         const parsed = credentialsSchema.safeParse(raw);
//         if (!parsed.success) return null;

//         const { email, password } = parsed.data;

//         // Требует модель User (добавим ниже в schema.prisma)
//         const dbUser = await prisma.user.findUnique({
//           where: { email },
//           select: {
//             id: true,
//             email: true,
//             name: true,
//             passwordHash: true,
//             role: true,
//             master: { select: { id: true } },
//           },
//         });
//         if (!dbUser?.passwordHash) return null;

//         const ok = await verifyPassword(password, dbUser.passwordHash);
//         if (!ok) return null;

//         const role = isAppRole(dbUser.role) ? dbUser.role : "USER";

//         return {
//           id: dbUser.id,
//           email: dbUser.email,
//           name: dbUser.name ?? null,
//           image: null,
//           role,
//           masterId: dbUser.master?.id ?? null,
//         };
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/login",
//     error: "/login",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         if (hasId(user)) token.id = user.id;
//         if (hasRoleProp(user)) token.role = user.role;
//         if (hasMasterId(user)) token.masterId = user.masterId;
//         return token;
//       }

//       // Актуализируем роль и masterId из БД
//       try {
//         const dbUser = await prisma.user.findUnique({
//           where: { id: token.id },
//           select: { role: true, master: { select: { id: true } } },
//         });
//         if (dbUser && isAppRole(dbUser.role)) {
//           token.role = dbUser.role;
//           token.masterId = dbUser.master?.id ?? null;
//         }
//       } catch {
//         // схема может быть ещё не обновлена — игнор
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.id;
//         session.user.role = token.role;
//       }
//       session.masterId = token.masterId ?? null;
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };
