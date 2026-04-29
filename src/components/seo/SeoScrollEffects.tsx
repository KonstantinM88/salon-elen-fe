import type { CSSProperties, ReactNode } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "none";

export function SeoScrollProgress() {
  return <div aria-hidden="true" className="seo-scroll-progress" />;
}

export function SeoHeroVisual({ children }: { children: ReactNode }) {
  return <div className="seo-hero-visual absolute inset-0">{children}</div>;
}

export function SeoReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  initialVisible = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  amount?: number;
  initialVisible?: boolean;
}) {
  return (
    <div
      data-seo-direction={direction}
      data-seo-visible={initialVisible ? "true" : "false"}
      className={`seo-reveal ${className ?? ""}`}
      style={{ "--seo-reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function SeoStagger({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  return (
    <div
      className={`seo-stagger ${className ?? ""}`}
      style={{ "--seo-stagger-base-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function SeoStaggerItem({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
}) {
  return (
    <div
      data-seo-direction={direction}
      className={`seo-stagger-item ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
