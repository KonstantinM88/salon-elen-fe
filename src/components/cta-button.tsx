"use client";
import Link from "next/link";
import { useRef } from "react";

type IdleMode = "breathe" | "sheen" | "aura" | "gradient" | "none";

export default function CTAButton({
  href,
  children,
  className,
  ariaLabel,
  idle = "sheen", // режим в покое по умолчанию
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  idle?: IdleMode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onClick = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.style.position = "absolute";
    ripple.style.left = `${e.clientX - r.left}px`;
    ripple.style.top  = `${e.clientY - r.top}px`;
    ripple.style.width = ripple.style.height = "160px";
    ripple.style.borderRadius = "9999px";
    ripple.style.background = "rgba(0,0,0,.18)";
    ripple.style.transform = "translate(-50%, -50%) scale(.2)";
    ripple.style.animation = "btn-ripple 600ms ease-out forwards";
    ripple.style.pointerEvents = "none";
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  };

  const idleClass =
    idle === "breathe"  ? "animate-breathe" :
    idle === "sheen"    ? "idle-sheen" :
    idle === "aura"     ? "idle-aura" :
    idle === "gradient" ? "idle-gradient" :
    "";

  return (
    <Link
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        // base
        "btn-primary relative inline-flex h-12 px-7 items-center justify-center rounded-full",
        "bg-white text-gray-900 font-medium",
        "shadow-[0_6px_22px_rgba(255,255,255,0.10)] hover:shadow-[0_10px_28px_rgba(255,255,255,0.16)]",
        // interaction
        "transition-transform duration-300 will-transform btn-primary-sheen btn-primary-hover-shimmer",
        "hover:-translate-y-0.5 active:translate-y-0",
        "focus-visible:focus-ring",
        // idle mode
        idleClass,
        // не мешаем hover/focus анимациями покоя
        "hover:animation-none focus:animation-none",
        className || "",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
