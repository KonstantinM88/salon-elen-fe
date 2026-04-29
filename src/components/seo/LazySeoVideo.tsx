"use client";

import { useEffect, useRef, useState } from "react";

export function LazySeoVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setEnabled(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled]);

  return (
    <div ref={rootRef} className="h-full w-full">
      {enabled ? (
        <video
          aria-label={label}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster={poster}
          className={className}
        >
          <source src={src} type="video/webm" />
        </video>
      ) : (
        <div
          aria-label={label}
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 text-sm font-semibold text-rose-700 dark:from-white/[0.08] dark:via-white/[0.04] dark:to-amber-400/10 dark:text-rose-100 ${className ?? ""}`}
          role="img"
        >
          {label}
        </div>
      )}
    </div>
  );
}
