// Адаптивные компоненты для admin/page.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IconGlow, type GlowTone } from "@/components/admin/IconGlow";

/* ───────── KPI CARD - Адаптивная карточка метрик ───────── */
export function KPICard({
  title,
  value,
  icon,
  tone = "sky",
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  tone?: "sky" | "emerald" | "violet" | "rose";
}) {
  const tones = {
    sky: {
      ring: "ring-sky-400/30",
      icon: "text-sky-400",
      bg: "from-sky-500/10 to-sky-500/0",
    },
    emerald: {
      ring: "ring-emerald-400/30",
      icon: "text-emerald-400",
      bg: "from-emerald-500/10 to-emerald-500/0",
    },
    violet: {
      ring: "ring-violet-400/30",
      icon: "text-violet-300",
      bg: "from-violet-500/10 to-violet-500/0",
    },
    rose: {
      ring: "ring-rose-400/30",
      icon: "text-rose-300",
      bg: "from-rose-500/10 to-rose-500/0",
    },
  }[tone];

  return (
    <div
      className="card-glass card-glow p-4 sm:p-5 transition-all duration-300
                 hover:-translate-y-0.5 hover:border-white/20"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${tones.bg}`} />
      <div className="relative flex items-start gap-3">
        <IconGlow
          tone={tone}
          className={`h-10 w-10 sm:h-12 sm:w-12 ring-2 ${tones.ring} bg-white/5 shrink-0`}
        >
          <span className={tones.icon}>{icon}</span>
        </IconGlow>
        <div className="grow min-w-0">
          <div className="text-xs sm:text-sm opacity-70 mb-1">{title}</div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-semibold truncate">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── LINK CARD - Карточка-ссылка ───────── */
export function LinkCard({
  title,
  description,
  href,
  icon,
  color = "sky",
  cta = "Открыть",
}: {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  color?: "sky" | "violet" | "emerald";
  cta?: string;
}) {
  const map = {
    sky: "bg-sky-600 hover:bg-sky-500",
    violet: "bg-violet-600 hover:bg-violet-500",
    emerald: "bg-emerald-600 hover:bg-emerald-500",
  }[color];
  const ringMap = {
    sky: "ring-sky-400/30",
    violet: "ring-violet-400/30",
    emerald: "ring-emerald-400/30",
  }[color];

  return (
    <div
      className="card-glass card-glow p-4 sm:p-5 space-y-3
                 transition-all duration-300 hover:-translate-y-0.5
                 hover:border-white/20"
    >
      <div className="flex items-center gap-3">
        <IconGlow
          tone={color}
          className={`h-10 w-10 ring-2 ${ringMap} bg-white/5 shrink-0`}
        >
          {icon}
        </IconGlow>
        <div className="text-base font-medium truncate">{title}</div>
      </div>
      <p className="text-sm opacity-70 line-clamp-2">{description}</p>
      <Link
        href={href}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white ${map} 
                   transition-all hover:scale-105 active:scale-95 text-sm`}
      >
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ───────── SECTION WRAPPER - Обёртка секции ───────── */
export function SectionWrapper({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-lg sm:text-xl font-semibold text-white/90">{title}</h2>
      )}
      {children}
    </section>
  );
}

/* ───────── RESPONSIVE GRID - Адаптивная сетка ───────── */
export function ResponsiveGrid({
  children,
  cols = 3,
}: {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
}) {
  const colsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols];

  return <div className={`grid ${colsMap} gap-4`}>{children}</div>;
}

/* ───────── TABLE WRAPPER - Обёртка для таблиц с горизонтальным скроллом ───────── */
export function TableWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-white/5 rounded-xl">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ───────── INFO CARD - Информационная карточка ───────── */
export function InfoCard({
  title,
  value,
  subtitle,
  icon,
  tone = "slate",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  tone?: GlowTone;
}) {
  return (
    <div
      className="card-glow rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-4
                 hover:bg-white/[0.04] transition-colors"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <IconGlow
            tone={tone}
            className="h-8 w-8 bg-white/5 ring-1 ring-white/10 shrink-0"
          >
            {icon}
          </IconGlow>
        )}
        <div className="grow min-w-0">
          <div className="text-xs opacity-70 mb-0.5">{title}</div>
          <div className="text-base sm:text-lg font-semibold truncate">{value}</div>
          {subtitle && (
            <div className="text-xs opacity-60 mt-0.5 truncate">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
}
