"use client";

import Link from "next/link";

type RainbowCTAProps = {
  href: string;
  label?: string;
  className?: string;
  /** true — всегда переливается (как раньше idle) */
  idle?: boolean;
  /** убрать отражение снизу */
  noReflect?: boolean;
};

export default function RainbowCTA({
  href,
  label = "Записаться",
  className = "",
  idle = false,
  noReflect = false,
}: RainbowCTAProps) {
  const mods = [
    "rainbow-btn",
    idle ? "rainbow-animate-idle" : "",
    noReflect ? "rainbow-no-reflect" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={href}
      className={mods}
      // Центрируем содержимое, не трогая твою расцветку и анимации
      style={{ justifyContent: "center", textAlign: "center" }}
    >
      <span className="leading-tight">
        {label}
      </span>
    </Link>
  );
}