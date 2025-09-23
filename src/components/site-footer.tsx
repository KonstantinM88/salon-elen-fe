
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Instagram,
  Facebook,
  Youtube,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

/* --- Кастомные SVG (цвет берётся из currentColor) --- */
const Telegram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M9.04 13.66 8.7 17.3c.48 0 .69-.2.94-.44l2.26-2.16 4.68 3.43c.86.47 1.47.22 1.7-.79l3.08-14.46h.01c.27-1.25-.45-1.74-1.28-1.43L1.2 8.9c-1.23.48-1.21 1.16-.21 1.47l4.76 1.49L18.73 5.2c.7-.46 1.35-.21.82.25L9.04 13.66Z"/>
  </svg>
);

const WhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.52 3.49A11.91 11.91 0 0 0 12.01 0C5.37 0 .02 5.35.02 12c0 2.11.55 4.19 1.59 6.02L0 24l6.15-1.6A12 12 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.51ZM12 21.58c-2.02 0-3.98-.55-5.69-1.6l-.41-.25-3.65.95.98-3.56-.26-.42A9.59 9.59 0 1 1 12 21.58Zm5.49-7.2c-.3-.16-1.77-.88-2.04-.98-.27-.1-.47-.16-.67.16-.19.3-.77.97-.95 1.17-.18.2-.35.22-.65.06-.3-.16-1.25-.46-2.38-1.48-.88-.79-1.48-1.77-1.65-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.04-.38-.02-.54-.06-.16-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.5-.17 0-.37-.02-.57-.02s-.53.07-.81.38c-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.58-.36Z"/>
  </svg>
);

const Viber = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M17.3 2.03C8.88-.23 3.27 3.8 3.27 3.8S.2 5.93.2 10.5c0 2.7 1.6 5.47 3.04 7.03 1.29 1.4 2.63 1.35 2.63 1.35l.03 3.1s3.38-.87 5.37-2.23c1.99-1.36 9.11-.8 10.74-7.65 1.64-6.85-3.99-9.25-4.71-9.07Zm-2.02 10.59c-.16.3-.93.58-1.27.61-.34.03-.55.15-1.28-.18-.73-.33-2.41-1.1-3.77-3.01-1.37-1.9-1.64-3.29-1.73-3.63-.09-.34.09-.92.4-1.07.32-.15.7-.27.9-.22.2.05.57.94.7 1.29.13.35.44.93.31 1.23-.13.3-.67.44-.49.76.19.32.83 1.54 1.9 2.5 1.24 1.13 2.29 1.47 2.61 1.6.32.13.52-.18.82-.42.3-.25.54-.53.85-.43.31.1 1.97.93 2.31 1.09.34.16.28.54.12.84Zm.75-2.14-.84-.36a.29.29 0 0 1-.17-.38l.02-.05c.08-.2.3-.3.5-.22l.84.36a.29.29 0 0 1 .17.38l-.02.05a.4.4 0 0 1-.5.22Zm.93-1.81-1.19-.51a.4.4 0 0 1-.23-.53l.03-.06a.41.41 0 0 1 .54-.22l1.19.51c.2.08.3.32.21.53l-.03.06a.41.41 0 0 1-.52.22Zm.96-1.85-1.48-.63a.47.47 0 0 1-.27-.61l.02-.06a.49.49 0 0 1 .63-.27l1.49.63c.23.1.34.39.23.63l-.02.05a.5.5 0 0 1-.6.26Z"/>
  </svg>
);

/* --- Тип и утилита под цветные бейджи --- */
type Social = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** tailwind-градиент или одноцветная заливка бейджа */
  bg: string; // пример: "bg-[#1877F2]" или "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#833AB4]"
};

const socials: Social[] = [
  { name: "Telegram", href: "https://t.me/username", icon: Telegram, bg: "bg-[#229ED9]" },
  { name: "WhatsApp", href: "https://wa.me/380000000000", icon: WhatsApp, bg: "bg-[#25D366]" },
  { name: "Viber", href: "https://invite.viber.com", icon: Viber, bg: "bg-[#7360F2]" },
  {
    name: "Instagram",
    href: "https://instagram.com/yourbrand",
    icon: Instagram,
    bg: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#833AB4]",
  },
  { name: "Facebook", href: "https://facebook.com/yourbrand", icon: Facebook, bg: "bg-[#1877F2]" },
  { name: "YouTube", href: "https://youtube.com/@yourbrand", icon: Youtube, bg: "bg-[#FF0000]" },
  { name: "LinkedIn", href: "https://linkedin.com/company/yourbrand", icon: Linkedin, bg: "bg-[#0A66C2]" },
  { name: "GitHub", href: "https://github.com/yourorg", icon: Github, bg: "bg-gradient-to-br from-slate-800 to-slate-900" },
];

/* --- Сам футер --- */
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200/70 dark:border-gray-800">
      <div className="container py-10">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Бренд / контакты */}
          <div className="space-y-3">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              Salon Elen
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Красота и уход в Halle: стрижки, маникюр, уход за кожей и макияж.
            </p>
            <div className="flex items-center gap-3 pt-1 text-sm text-gray-700 dark:text-gray-300">
              <Phone size={16} className="opacity-70" />
              <a href="tel:+491234567890" className="hover:underline">
                +49 123 456 7890
              </a>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <Mail size={16} className="opacity-70" />
              <a href="mailto:info@salon-elen.de" className="hover:underline">
                info@salon-elen.de
              </a>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
              <MapPin size={16} className="mt-0.5 opacity-70" />
              <span>Halle, адрес салона 123</span>
            </div>
          </div>

          {/* Навигация */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Навигация
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li><Link className="hover:underline" href="/">Главная</Link></li>
              <li><Link className="hover:underline" href="/services">Услуги</Link></li>
              <li><Link className="hover:underline" href="/prices">Цены</Link></li>
              <li><Link className="hover:underline" href="/contacts">Контакты</Link></li>
              <li><Link className="hover:underline" href="/booking">Запись</Link></li>
            </ul>
          </div>

          {/* Время работы */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Время работы
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Пн–Пт: 10:00–19:00</li>
              <li>Сб: 10:00–16:00</li>
              <li>Вс: выходной</li>
            </ul>
          </div>

          {/* Соцсети (цветные) */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Мы на связи
            </h4>

            <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-5">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="group inline-flex items-center justify-center"
                >
                  <span
                    className={[
                      // цветной бейдж
                      "inline-flex h-10 w-10 items-center justify-center rounded-full",
                      s.bg,
                      // эффект свечения/тени на ховере
                      "shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition",
                      "group-hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)]",
                      "group-hover:translate-y-[-2px]",
                    ].join(" ")}
                  >
                    <s.icon className="h-5 w-5 text-white" />
                  </span>
                </a>
              ))}
            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Напишите в удобном мессенджере — ответим быстро ✨
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200/70 pt-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400 md:flex-row">
          <p>© {year} Salon Elen. Все права защищены.</p>
          <div className="flex gap-4">
            <Link className="hover:underline" href="/privacy">Политика конфиденциальности</Link>
            <Link className="hover:underline" href="/terms">Условия использования</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
