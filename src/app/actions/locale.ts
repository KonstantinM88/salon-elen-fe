"use server";

import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n-utils";

export async function setLocale(locale: string) {
  console.log("[setLocale] Setting locale to:", locale);
  
  // Проверяем что локаль валидна
  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    console.log("[setLocale] Invalid locale!");
    return { ok: false, error: "Invalid locale" };
  }

  const cookieStore = await cookies();
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: 31536000, // 1 год
    sameSite: "lax",
  });

  console.log("[setLocale] Cookie set successfully");
  return { ok: true };
}


//--------логи
// "use server";

// import { cookies } from "next/headers";
// import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n-utils";

// export async function setLocale(locale: string) {
//   // Проверяем что локаль валидна
//   if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
//     return { ok: false, error: "Invalid locale" };
//   }

//   const cookieStore = await cookies();
//   cookieStore.set("locale", locale, {
//     path: "/",
//     maxAge: 31536000, // 1 год
//     sameSite: "lax",
//   });

//   return { ok: true };
// }