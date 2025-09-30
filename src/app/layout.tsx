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
    <html lang="ru" className="dark" suppressHydrationWarning>
      <head>
        {/* Preload hero изображений без ошибок типов */}
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <SiteHeader />
          {/* ВАЖНО: без container — чтобы hero был full-width.
              Внутри страниц используем <section><div className='container'>…</div></section> */}
          <main>{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
