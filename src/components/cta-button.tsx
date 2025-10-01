"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type IdleMode = "breathe" | "sheen" | "aura" | "gradient" | "none";

export default function CTAButton({
  href,
  children,
  className,
  ariaLabel,
  idle = "sheen",
  cycleText,
  cycleIntervalMs = 4000,
  hoverText,
  pressText,
  cycleBg = false,
}: {
  href: string;
  children: React.ReactNode;           // базовая надпись, например "Записаться"
  className?: string;
  ariaLabel?: string;                  // постоянная aria-метка, чтобы не дёргать скринридер
  idle?: IdleMode;
  cycleText?: string[];                // массив фраз для ротации
  cycleIntervalMs?: number;            // интервал переключения
  hoverText?: string;                  // текст при hover/focus
  pressText?: string;                  // текст при mousedown/press
  cycleBg?: boolean;                   // плавный тёплый перелив фона
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  // ---- текстовая ротация с учётом reduced motion и паузой при hover/focus ----
  const baseText = useMemo(() => {
    // children гарантированно строка в нашем кейсе
    return typeof children === "string" ? children : "";
  }, [children]);

  const phrases = useMemo(() => {
    const arr = (cycleText && cycleText.length > 0) ? cycleText : [];
    // исключаем дубли с базовым текстом подряд
    return [baseText, ...arr.filter(t => t && t !== baseText)];
  }, [baseText, cycleText]);

  const [index, setIndex] = useState(0);
  const [isHoverOrFocus, setHold] = useState(false);
  const [isPress, setPress] = useState(false);
  const reduce = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    []
  );

  useEffect(() => {
    if (reduce || phrases.length <= 1) return;   // не крутим текст при reduced motion
    if (isHoverOrFocus || isPress) return;       // делаем паузу при взаимодействии
    const id = setInterval(() => {
      setIndex(i => (i + 1) % phrases.length);
    }, Math.max(1800, cycleIntervalMs));         // защитим от слишком маленьких интервалов
    return () => clearInterval(id);
  }, [phrases.length, cycleIntervalMs, reduce, isHoverOrFocus, isPress]);

  const currentLabel = useMemo(() => {
    if (isPress && pressText) return pressText;
    if (isHoverOrFocus && hoverText) return hoverText;
    return phrases[index] ?? baseText;
  }, [isPress, pressText, isHoverOrFocus, hoverText, phrases, index, baseText]);

  const onMouseEnter = () => setHold(true);
  const onMouseLeave = () => { setHold(false); setPress(false); };
  const onFocus = () => setHold(true);
  const onBlur = () => { setHold(false); setPress(false); };
  const onMouseDown = () => setPress(true);
  const onMouseUp = () => setPress(false);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") setPress(true);
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") setPress(false);
  };

  // ripple по клику
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
      aria-label={ariaLabel || baseText}  // aria остаётся стабильной
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className={[
        "btn-primary relative inline-flex h-12 px-7 items-center justify-center rounded-full",
        // фон и текст
        "text-gray-900 font-medium",
        cycleBg ? "btn-cycle-bg" : "bg-white",
        // тени/взаимодействие
        "shadow-[0_6px_22px_rgba(255,255,255,0.10)] hover:shadow-[0_10px_28px_rgba(255,255,255,0.16)]",
        "transition-transform duration-300 will-transform btn-primary-sheen btn-primary-hover-shimmer",
        "hover:-translate-y-0.5 active:translate-y-0 focus-visible:focus-ring",
        // idle режимы (аура/градиент/блик и т.п.)
        idleClass,
        // чтобы idle-анимация не спорила при реальном взаимодействии
        "hover:animation-none focus:animation-none",
        className || "",
      ].join(" ")}
    >
      {/* визуальная надпись; aria-live выключен, чтобы не мешать читателям экрана */}
      <span aria-hidden className="btn-text-fade">{currentLabel}</span>
    </Link>
  );
}
