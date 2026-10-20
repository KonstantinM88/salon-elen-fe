"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // next-themes 0.4.6 renders its inline bootstrap script again during the
  // client pass. React 19.2 warns about that script and Next.js opens a dev
  // error overlay. Keep the executable script for SSR (it prevents a theme
  // flash), but make the redundant client-rendered copy inert.
  const scriptProps =
    typeof window === "undefined"
      ? props.scriptProps
      : { ...props.scriptProps, type: "application/json" };

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"  // system | light | dark
      enableSystem
      {...props}
      scriptProps={scriptProps}
    >
      {children}
    </NextThemesProvider>
  );
}
