// src/hooks/useMobileViewport.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface MobileViewport {
  /** Actual visible height in px (shrinks when keyboard opens) */
  height: number;
  /** Whether the on-screen keyboard is likely open */
  keyboardOpen: boolean;
  /** Whether the device is mobile-sized (<640px) */
  isMobile: boolean;
}

/**
 * Tracks the *visual* viewport height — the area actually visible to the user.
 * 
 * On mobile, `100vh` includes the area hidden behind the on-screen keyboard.
 * `window.visualViewport.height` gives us the real usable height.
 * 
 * Falls back to `window.innerHeight` if VisualViewport API is unavailable.
 */
export function useMobileViewport(): MobileViewport {
  const [state, setState] = useState<MobileViewport>({
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    keyboardOpen: false,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  });

  const update = useCallback(() => {
    if (typeof window === 'undefined') return;

    const vv = window.visualViewport;
    const height = vv ? vv.height : window.innerHeight;
    const fullHeight = window.innerHeight;
    const isMobile = window.innerWidth < 640;

    // Keyboard is "open" if visual viewport is significantly smaller than full
    // Threshold: 150px accounts for browser chrome changes
    const keyboardOpen = isMobile && fullHeight - height > 150;

    setState((prev) => {
      // Only update if values actually changed (avoids re-renders)
      if (
        prev.height === height &&
        prev.keyboardOpen === keyboardOpen &&
        prev.isMobile === isMobile
      ) {
        return prev;
      }
      return { height, keyboardOpen, isMobile };
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial measurement
    update();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
    }

    // Fallback for browsers without VisualViewport
    window.addEventListener('resize', update);

    // Also track orientation changes
    window.addEventListener('orientationchange', () => {
      // Delay to let browser finish layout
      setTimeout(update, 100);
    });

    return () => {
      if (vv) {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      }
      window.removeEventListener('resize', update);
    };
  }, [update]);

  return state;
}