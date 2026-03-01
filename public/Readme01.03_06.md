# Readme01.03_06

Change report since last commit.

- Base commit (short): `0fddb80`
- Generated at: `01.03.2026 19:18:00,45`

## git status --short

```bash
 M middleware.ts
 M next.config.mjs
 M next.config.ts
 M src/middleware.ts
?? public/Readme01.03_06.md
```

## git diff --name-status HEAD

```bash
M	middleware.ts
M	next.config.mjs
M	next.config.ts
M	src/middleware.ts
```

## git diff --stat HEAD

```bash
 middleware.ts     | 14 ++++++++++----
 next.config.mjs   | 13 +++++++++++++
 next.config.ts    | 10 ++++++++++
 src/middleware.ts |  1 +
 4 files changed, 34 insertions(+), 4 deletions(-)
```

## Full diff (tracked files)

```diff
diff --git a/middleware.ts b/middleware.ts
index f2f09cd..439886d 100644
--- a/middleware.ts
+++ b/middleware.ts
@@ -2,6 +2,12 @@ import { NextRequest, NextResponse } from "next/server";
 import { auth } from "@/auth";
 
 const ADMIN_PREFIX = "/admin";
+const PERMISSIONS_POLICY_VALUE = "microphone=(self)";
+
+function withPermissionsPolicy(res: NextResponse): NextResponse {
+  res.headers.set("Permissions-Policy", PERMISSIONS_POLICY_VALUE);
+  return res;
+}
 
 export async function middleware(req: NextRequest) {
   const { pathname } = req.nextUrl;
@@ -14,14 +20,14 @@ export async function middleware(req: NextRequest) {
   if (urlLang && SUPPORTED.has(urlLang)) {
     const res = NextResponse.next();
     res.cookies.set("locale", urlLang, { path: "/", maxAge: 31536000 });
-    return res;
+    return withPermissionsPolicy(res);
   }
 
   // ✅ 2) если lang нет, но cookie ru/en — редиректим в URL с lang=
   if (!urlLang && cookieLocale && SUPPORTED.has(cookieLocale) && cookieLocale !== "de") {
     const url = req.nextUrl.clone();
     url.searchParams.set("lang", cookieLocale);
-    return NextResponse.redirect(url);
+    return withPermissionsPolicy(NextResponse.redirect(url));
   }
 
   // --- Админ защита ---
@@ -31,14 +37,14 @@ export async function middleware(req: NextRequest) {
       const url = req.nextUrl.clone();
       url.pathname = "/api/auth/signin";
       url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
-      return NextResponse.redirect(url);
+      return withPermissionsPolicy(NextResponse.redirect(url));
     }
   }
 
   const response = NextResponse.next();
   response.headers.set("x-pathname", pathname);
   response.headers.set("x-locale", cookieLocale || "de");
-  return response;
+  return withPermissionsPolicy(response);
 }
 
 export const config = {
diff --git a/next.config.mjs b/next.config.mjs
index cd70061..af031ee 100644
--- a/next.config.mjs
+++ b/next.config.mjs
@@ -10,5 +10,18 @@ const nextConfig = {
       // Минимальный кэш для динамических изображений
       minimumCacheTTL: 0,
     },
+    async headers() {
+      return [
+        {
+          source: "/(.*)",
+          headers: [
+            {
+              key: "Permissions-Policy",
+              value: "microphone=(self)",
+            },
+          ],
+        },
+      ];
+    },
   };
 export default nextConfig;
diff --git a/next.config.ts b/next.config.ts
index da032e4..0638d87 100644
--- a/next.config.ts
+++ b/next.config.ts
@@ -37,6 +37,16 @@ const nextConfig: NextConfig = {
   // ====== ЗАГОЛОВКИ ДЛЯ КЕШИРОВАНИЯ ======
   async headers() {
     return [
+      {
+        // Allow microphone in this document (required for getUserMedia in production)
+        source: '/(.*)',
+        headers: [
+          {
+            key: 'Permissions-Policy',
+            value: 'microphone=(self)',
+          },
+        ],
+      },
       {
         // Кеширование загруженных изображений
         source: '/uploads/:path*',
diff --git a/src/middleware.ts b/src/middleware.ts
index 343b011..6bbcc97 100644
--- a/src/middleware.ts
+++ b/src/middleware.ts
@@ -70,6 +70,7 @@ export async function middleware(req: NextRequest) {
   const response = NextResponse.next({
     request: { headers: requestHeaders },
   });
+  response.headers.set("Permissions-Policy", "microphone=(self)");
 
   const langParam = req.nextUrl.searchParams.get("lang");
   if (langParam && isLocale(langParam)) {
``` 
