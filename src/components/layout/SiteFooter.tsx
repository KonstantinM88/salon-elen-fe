import Link from "next/link";
import {
  Instagram,
  Facebook,
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react";

/**
 * Общий футер сайта в стиле админки
 * - стеклянные карточки, мягкий градиент, аккуратные иконки
 * - полностью адаптивен (мобайл → tablet → desktop)
 * - без use client (можно рендерить на сервере)
 */
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        {/* Неоновая линия сверху — как в админке */}
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-fuchsia-500/70 via-sky-400/70 to-cyan-400/70 opacity-60" />

        {/* Контент футера */}
        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Бренд + соцсети */}
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold tracking-tight">
                Salon Elen
              </div>
              <p className="mt-2 text-sm text-slate-300/80">
                Современная система онлайн-записи и админ-панель для салонов
                красоты. Ускоряйте бизнес, оставляя рутину нам.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SocialIcon
                href="https://instagram.com"
                label="Instagram"
                icon={<Instagram className="h-4 w-4" />}
              />
              <SocialIcon
                href="https://facebook.com"
                label="Facebook"
                icon={<Facebook className="h-4 w-4" />}
              />
              <SocialIcon
                href="https://t.me/"
                label="Telegram"
                icon={<Send className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Раздел: Навигация */}
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
              Навигация
            </h3>
            <ul className="space-y-1.5">
              <FooterLink href="/">Главная</FooterLink>
              <FooterLink href="/services">Услуги</FooterLink>
              <FooterLink href="/prices">Цены</FooterLink>
              <FooterLink href="/news">Новости</FooterLink>
              <FooterLink href="/contacts">Контакты</FooterLink>
            </ul>
          </div>

          {/* Раздел: Клиенту */}
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
              Клиенту
            </h3>
            <ul className="space-y-1.5">
              <FooterLink href="/booking">Онлайн-запись</FooterLink>
              <FooterLink href="/faq">Вопросы и ответы</FooterLink>
              <FooterLink href="/privacy">Политика конфиденциальности</FooterLink>
              <FooterLink href="/terms">Условия использования</FooterLink>
            </ul>
          </div>

          {/* Раздел: Контакты */}
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-400">
              Контакты
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 text-sky-400" />
                <span>06114, Halle Saale Lessingstrasse 37.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-400" />
                <a href="tel:+491778995106" className="link">
                  +49 (177) 899-51-06
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-fuchsia-400" />
                <a href="mailto:hello@salon-elen.com" className="link">
                  hello@salon-elen.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 text-amber-400" />
                <span>
                  Ежедневно: 09:00 — 20:00
                  <br />
                  Без выходных
                </span>
              </li>
            </ul>

            <div className="mt-4">
              <Link
                href="/booking"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                Записаться онлайн
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Нижняя плашка */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 bg-slate-950/40 px-6 py-4 sm:flex-row sm:px-8">
          <p className="text-xs text-slate-300/80">
            © {year} Salon Elen · Система онлайн-записи и админ-панель
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/privacy"
              className="btn btn-outline btn-xs rounded-full"
            >
              Конфиденциальность
            </Link>
            <Link href="/terms" className="btn btn-outline btn-xs rounded-full">
              Условия
            </Link>
            <Link
              href="/support"
              className="btn btn-outline btn-xs rounded-full"
            >
              Поддержка
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
      >
        <span className="truncate">{children}</span>
        <ChevronRight className="h-4 w-4 translate-x-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-200" />
      </Link>
    </li>
  );
}

function SocialIcon({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 ring-0 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
    >
      {icon}
    </Link>
  );
}
