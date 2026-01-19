// src/components/ui/ClientPortal.tsx
'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children into document.body to avoid issues with CSS properties
 * like `backdrop-filter`, `filter`, or `transform` on ancestors that can
 * break `position: fixed` overlays (fixed becomes relative to that ancestor).
 */
export default function ClientPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return document.body;
  }, []);

  if (!mounted || !container) return null;
  return createPortal(children, container);
}
