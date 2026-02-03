// src/app/layout.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import Providers from '@/app/providers';

import { I18nProvider } from '@/i18n/I18nProvider';
import { LocaleProvider } from '@/i18n/LocaleContext';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-playfair',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://permanent-halle.de'),
  title: 'Salon Elen',
  description: 'Kosmetiksalon in Halle – Leistungen, Preise, Kontakt',
  openGraph: { images: ['/images/hero.webp'] },
  twitter: { images: ['/images/hero.webp'] },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value as Locale | undefined;

  const initialLocale: Locale =
    cookieLocale && LOCALES.includes(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <body
        className={`
          ${playfair.variable}
          ${cormorant.variable}
          bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 antialiased
        `}
      >
        <Providers>
          <I18nProvider initialLocale={initialLocale}>
            <LocaleProvider initialLocale={initialLocale}>
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
            </LocaleProvider>
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
