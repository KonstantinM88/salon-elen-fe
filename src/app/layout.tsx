import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://salon-elen.example"),
  title: "Salon Elen",
  description: "Салон красоты в Halle — услуги, цены, контакты",
  openGraph: { images: ["/images/hero.webp"] },
  twitter:   { images: ["/images/hero.webp"] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // data-allow-motion="true" — принудительно включает idle-анимации,
    // даже если у пользователя включено «уменьшение движения».
    // Убери атрибут, если хочешь уважать системные настройки.
    <html lang="ru" className="dark" suppressHydrationWarning data-allow-motion="true">
      <head>
        {/* Preload hero изображений */}
        <link
          rel="preload"
          as="image"
          href="/images/hero.webp"
          imageSrcSet="/images/hero.webp 2400w"
          imageSizes="100vw"
        />
        <link
          rel="preload"
          as="image"
          href="/images/hero-mobile.webp"
          imageSrcSet="/images/hero-mobile.webp 1080w"
          imageSizes="100vw"
        />
      </head>

      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
