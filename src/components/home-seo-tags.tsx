"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const BASE_URL = "https://permanent-halle.de";

export default function HomeSeoTags() {
  const pathname = usePathname();
  
  // Только для главной страницы
  if (pathname !== "/") return null;

  const injectHreflang = `
    (function() {
      var head = document.head;
      var links = [
        { hreflang: 'de', href: '${BASE_URL}/' },
        { hreflang: 'ru', href: '${BASE_URL}/?lang=ru' },
        { hreflang: 'en', href: '${BASE_URL}/?lang=en' },
        { hreflang: 'x-default', href: '${BASE_URL}/' }
      ];
      links.forEach(function(l) {
        var link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = l.hreflang;
        link.href = l.href;
        head.appendChild(link);
      });
    })();
  `;

  return (
    <Script
      id="home-hreflang"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: injectHreflang }}
    />
  );
}