"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import ServicesStepClient from "./ServicesStepClient";
import ServicesStepLightClient from "./ServicesStepLightClient";

export default function ServicesStepThemeClient(): React.JSX.Element {
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <ServicesStepClient />;

  return (resolvedTheme ?? theme) === "light" ? (
    <ServicesStepLightClient />
  ) : (
    <ServicesStepClient />
  );
}
