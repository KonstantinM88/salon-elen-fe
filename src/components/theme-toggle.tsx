"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";


export default function ThemeToggle() {
const { theme, setTheme, resolvedTheme } = useTheme();
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;


const isDark = (theme ?? resolvedTheme) === "dark";
return (
<button
className="btn"
aria-label="Toggle theme"
onClick={() => setTheme(isDark ? "light" : "dark")}
>
{isDark ? <Sun size={18} /> : <Moon size={18} />}
<span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
</button>
);
}