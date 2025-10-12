// src/types/next-auth.d.ts
import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client"; // держим роли в синхроне с БД

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"]; // email/name/image приходят отсюда
    masterId?: string | null;   // удобно класть сюда связанного мастера
  }

  interface User {
    id: string;
    role: Role;
    masterId?: string | null;   // можно прокинуть при создании/лоаде пользователя
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    masterId?: string | null;
  }
}




// // src/types/next-auth.d.ts
// import { DefaultSession } from "next-auth";
// import "next-auth";
// import "next-auth/jwt";

// export type AppRole = "USER" | "MASTER" | "ADMIN";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       role: AppRole;
//       email?: string | null;
//       name?: string | null;
//       image?: string | null;
//     } & DefaultSession["user"];
//     masterId?: string | null;
//   }

//   interface User {
//     id: string;
//     role: AppRole;
//     email: string;
//     name?: string | null;
//     image?: string | null;
//     masterId?: string | null;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     role: AppRole;
//     masterId?: string | null;
//   }
// }
