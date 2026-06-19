"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import CalendarStepClient from "./CalendarStepClient";
import CalendarStepLightClient from "./CalendarStepLightClient";

export default function CalendarStepThemeClient(): React.JSX.Element {
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <CalendarStepClient />;

  return (resolvedTheme ?? theme) === "light" ? (
    <CalendarStepLightClient />
  ) : (
    <CalendarStepClient />
  );
}
