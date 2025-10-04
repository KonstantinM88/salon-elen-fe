"use client";

import Link from "next/link";

export default function RainbowCTA({
  href,
  label = "Записаться",
  className = "",
  idle = false,           // true — всегда переливается (без ховера)
  noReflect = false,      // убрать отражение снизу
}: {
  href: string;
  label?: string;
  className?: string;
  idle?: boolean;
  noReflect?: boolean;
}) {
  const mods = [
    "rainbow-btn",
    idle ? "rainbow-animate-idle" : "",
    noReflect ? "rainbow-no-reflect" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={mods}>
      <span>{label}</span>
    </Link>
  );
}
