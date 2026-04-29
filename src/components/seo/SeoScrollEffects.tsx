"use client";

import type { ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";

type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "none";

const easeOut = [0.22, 1, 0.36, 1] as const;

function hiddenState(direction: RevealDirection) {
  switch (direction) {
    case "down":
      return { opacity: 0, y: -34, filter: "blur(8px)" };
    case "left":
      return { opacity: 0, x: -42, filter: "blur(8px)" };
    case "right":
      return { opacity: 0, x: 42, filter: "blur(8px)" };
    case "scale":
      return { opacity: 0, scale: 0.96, filter: "blur(8px)" };
    case "none":
      return { opacity: 0, filter: "blur(6px)" };
    case "up":
    default:
      return { opacity: 0, y: 34, filter: "blur(8px)" };
  }
}

export function SeoScrollProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.35,
  });

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 top-0 z-[90] h-0.5 w-full origin-left bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-300 shadow-[0_0_18px_rgba(244,114,182,0.45)]"
      style={{ scaleX }}
    />
  );
}

export function SeoHeroVisual({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 82]);
  const scale = useTransform(scrollY, [0, 700], [1.02, 1.1]);
  const opacity = useTransform(scrollY, [0, 620], [1, 0.78]);

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={reduceMotion ? undefined : { y, scale, opacity }}
    >
      {children}
    </motion.div>
  );
}

export function SeoReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  amount = 0.22,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  amount?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants: Variants = {
    hidden: hiddenState(direction),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { duration: 0.72, delay, ease: easeOut },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: "0px 0px -12% 0px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
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
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: "0px 0px -10% 0px" }}
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: { delayChildren: delay, staggerChildren: 0.08 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
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
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: hiddenState(direction),
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.64, ease: easeOut },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
