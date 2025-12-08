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




// "use client";

// import Link from "next/link";
// import { CalendarCheck } from "lucide-react";
// import type { ReactNode } from "react";

// function cx(...xs: Array<string | false | null | undefined>): string {
//   return xs.filter(Boolean).join(" ");
// }

// type RainbowCTAProps = {
//   href: string;
//   label: string;
//   className?: string;
//   showIcon?: boolean;
//   idle?: boolean;
//   children?: ReactNode;
// };

// export default function RainbowCTA({
//   href,
//   label,
//   className,
//   showIcon = true,
//   idle = false,
//   children,
// }: RainbowCTAProps) {
//   return (
//     <Link
//       href={href}
//       className={cx(
//         "relative inline-flex items-center justify-center",
//         "rounded-full select-none",
//         "h-11 px-6",
//         "text-sm font-semibold text-white",
//         "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-sky-500",
//         "shadow-[0_0_18px_rgba(129,140,248,0.45)]",
//         "transition duration-150 hover:brightness-110 active:scale-[0.97]",
//         idle ? "animate-[pulse_7s_ease-in-out_infinite]" : "",
//         className
//       )}
//     >
//       {showIcon && (
//         <CalendarCheck className="mr-2 h-4 w-4 shrink-0" />
//       )}

//       {/* ВАЖНО: блок, который центрирует текст */}
//       <span className="flex flex-col leading-tight text-center">
//         {label}
//       </span>

//       {children}
//     </Link>
//   );
// }





// "use client";

// import Link from "next/link";

// export default function RainbowCTA({
//   href,
//   label = "Записаться",
//   className = "",
//   idle = false,           // true — всегда переливается (без ховера)
//   noReflect = false,      // убрать отражение снизу
// }: {
//   href: string;
//   label?: string;
//   className?: string;
//   idle?: boolean;
//   noReflect?: boolean;
// }) {
//   const mods = [
//     "rainbow-btn",
//     idle ? "rainbow-animate-idle" : "",
//     noReflect ? "rainbow-no-reflect" : "",
//     className,
//   ]
//     .filter(Boolean)
//     .join(" ");

//   return (
//     <Link href={href} className={mods}>
//       <span>{label}</span>
//     </Link>
//   );
// }
