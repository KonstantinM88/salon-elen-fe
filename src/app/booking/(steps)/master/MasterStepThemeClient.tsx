"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import MasterStepClient from "./MasterStepClient";
import MasterStepLightClient from "./MasterStepLightClient";

export default function MasterStepThemeClient(): React.JSX.Element {
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <MasterStepClient />;

  return (resolvedTheme ?? theme) === "light" ? (
    <MasterStepLightClient />
  ) : (
    <MasterStepClient />
  );
}
