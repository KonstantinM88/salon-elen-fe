'use client';

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider /* можно добавить options, например refetchOnWindowFocus={false} */>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
