// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  title: "Salon Elen",
  description: "Салон красоты в Halle — услуги, цены, контакты",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
        <body>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <SiteHeader />
    <main className="container py-8">{children}</main>
  </ThemeProvider>
</body>
      {/* <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          <main className="container py-8">{children}</main>
        </ThemeProvider>
      </body> */}
    </html>
  );
}
