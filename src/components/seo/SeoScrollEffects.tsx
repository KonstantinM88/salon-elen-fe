"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "none";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

function useOnceInView<T extends HTMLElement>({
  amount,
  initialVisible = false,
}: {
  amount: number;
  initialVisible?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(initialVisible);

  useEffect(() => {
    setMounted(true);

    if (reducedMotion || initialVisible) {
      setVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: Math.min(Math.max(amount, 0), 1),
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [amount, initialVisible, reducedMotion]);

  return { ref, mounted, visible: visible || reducedMotion };
}

export function SeoScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (ref.current) {
        ref.current.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
      }
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed left-0 top-0 z-[90] h-0.5 w-full origin-left bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-300 shadow-[0_0_18px_rgba(244,114,182,0.45)]"
      style={{ transform: "scaleX(0)" }}
    />
  );
}

export function SeoHeroVisual({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const raw = Math.min(window.scrollY / 700, 1);
      const y = raw * 82;
      const scale = 1.02 + raw * 0.08;
      const opacity = 1 - raw * 0.22;
      if (ref.current) {
        ref.current.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
        ref.current.style.opacity = String(opacity);
      }
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 will-change-transform">
      {children}
    </div>
  );
}

export function SeoReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  amount = 0.22,
  initialVisible = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  amount?: number;
  initialVisible?: boolean;
}) {
  const { ref, mounted, visible } = useOnceInView<HTMLDivElement>({
    amount,
    initialVisible,
  });

  return (
    <div
      ref={ref}
      data-seo-enabled={mounted ? "true" : "false"}
      data-seo-visible={visible ? "true" : "false"}
      data-seo-direction={direction}
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
  amount = 0.16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  const { ref, mounted, visible } = useOnceInView<HTMLDivElement>({ amount });

  return (
    <div
      ref={ref}
      data-seo-enabled={mounted ? "true" : "false"}
      data-seo-visible={visible ? "true" : "false"}
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

