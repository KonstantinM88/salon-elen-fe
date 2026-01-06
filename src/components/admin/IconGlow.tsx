import type { ReactNode } from "react";

export type GlowTone =
  | "sky"
  | "emerald"
  | "fuchsia"
  | "amber"
  | "cyan"
  | "violet"
  | "slate"
  | "rose"
  | "teal"
  | "indigo"
  | "lime";

type IconGlowProps = {
  tone?: GlowTone;
  className?: string;
  children: ReactNode;
};

export function IconGlow({ tone = "sky", className, children }: IconGlowProps) {
  const classes = `icon-glow icon-glow-${tone} ${className ?? ""}`.trim();

  return <span className={classes}>{children}</span>;
}
