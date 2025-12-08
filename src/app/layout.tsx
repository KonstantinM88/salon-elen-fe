// src/app/layout.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';

import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import Providers from '@/app/providers';

import { I18nProvider } from '@/i18n/I18nProvider';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://salon-elen.example',
  ),
  title: 'Salon Elen',
  description: 'Kosmetiksalon in Halle – Leistungen, Preise, Kontakt',
  openGraph: { images: ['/images/hero.webp'] },
  twitter: { images: ['/images/hero.webp'] },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  // ВАЖНО: cookies() теперь с await
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value as Locale | undefined;

  const initialLocale: Locale =
    cookieLocale && LOCALES.includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 antialiased">
        <Providers>
          <I18nProvider initialLocale={initialLocale}>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}






// // src/app/layout.tsx
// import type { Metadata } from "next";
// import "./globals.css";
// import SiteHeader from "@/components/site-header";
// import SiteFooter from "@/components/site-footer";
// import Providers from "@/app/providers";

// export const metadata: Metadata = {
//   metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://salon-elen.example"),
//   title: "Salon Elen",
//   description: "Салон красоты в Halle — услуги, цены, контакты",
//   openGraph: { images: ["/images/hero.webp"] },
//   twitter:   { images: ["/images/hero.webp"] },
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="ru" className="dark" suppressHydrationWarning data-allow-motion="true">
//       <head>
//         {/* Preload hero изображений */}
//         <link
//           rel="preload"
//           as="image"
//           href="/images/hero.webp"
//           imageSrcSet="/images/hero.webp 2400w"
//           imageSizes="100vw"
//         />
//         <link
//           rel="preload"
//           as="image"
//           href="/images/hero-mobile.webp"
//           imageSrcSet="/images/hero-mobile.webp 1080w"
//           imageSizes="100vw"
//         />
//       </head>

//       <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 antialiased">
//         <Providers>
//           <SiteHeader />
//           <main>{children}</main>
//           <SiteFooter />
//         </Providers>
//       </body>
//     </html>
//   );
// }








// import type { Metadata } from "next";
// import "./globals.css";
// import { ThemeProvider } from "@/components/theme-provider";
// import SiteHeader from "@/components/site-header";
// import SiteFooter from "@/components/site-footer";

// export const metadata: Metadata = {
//   metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://salon-elen.example"),
//   title: "Salon Elen",
//   description: "Салон красоты в Halle — услуги, цены, контакты",
//   openGraph: { images: ["/images/hero.webp"] },
//   twitter:   { images: ["/images/hero.webp"] },
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     // data-allow-motion="true" — принудительно включает idle-анимации,
//     // даже если у пользователя включено «уменьшение движения».
//     // Убери атрибут, если хочешь уважать системные настройки.
//     <html lang="ru" className="dark" suppressHydrationWarning data-allow-motion="true">
//       <head>
//         {/* Preload hero изображений */}
//         <link
//           rel="preload"
//           as="image"
//           href="/images/hero.webp"
//           imageSrcSet="/images/hero.webp 2400w"
//           imageSizes="100vw"
//         />
//         <link
//           rel="preload"
//           as="image"
//           href="/images/hero-mobile.webp"
//           imageSrcSet="/images/hero-mobile.webp 1080w"
//           imageSizes="100vw"
//         />
//       </head>

//       <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 antialiased">
//         <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
//           <SiteHeader />
//           <main>{children}</main>
//           <SiteFooter />
//         </ThemeProvider>
//       </body>
//     </html>
//   );
// }
