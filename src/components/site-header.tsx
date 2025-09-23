"use client";
import Link from "next/link";
import { useState } from "react";
import  ThemeToggle from "@/components/theme-toggle";


const NAV = [
{ href: "/", label: "Главная" },
{ href: "/services", label: "Услуги" },
{ href: "/prices", label: "Цены" },
{ href: "/contacts", label: "Контакты" },
];


export default function SiteHeader() {
const [open, setOpen] = useState(false);
return (
    <header className="sticky top-0 z-50 border-b backdrop-blur
  bg-white/80 supports-[backdrop-filter]:bg-white/60 border-gray-200/70
  dark:bg-gray-900/80 supports-[backdrop-filter]:dark:bg-gray-900/60 dark:border-gray-800/60
  transition-colors">

{/* <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-900/70"> */}
<div className="container flex h-16 items-center justify-between">
<div className="flex items-center gap-3">
<button className="md:hidden" onClick={() => setOpen(v => !v)} aria-label="Toggle menu">
<div className="h-5 w-6 space-y-1.5">
<span className={`block h-0.5 w-6 bg-current transition ${open ? 'translate-y-2 rotate-45' : ''}`}></span>
<span className={`block h-0.5 w-6 bg-current transition ${open ? 'opacity-0' : ''}`}></span>
<span className={`block h-0.5 w-6 bg-current transition ${open ? '-translate-y-2 -rotate-45' : ''}`}></span>
</div>
</button>
<Link href="/" className="font-semibold tracking-tight">Salon Elen</Link>
</div>


<nav className="hidden md:flex items-center gap-6">
{NAV.map((item) => (
<Link key={item.href} href={item.href} className="link">
{item.label}
</Link>
))}
</nav>


<div className="flex items-center gap-2">
<ThemeToggle />
<Link href="/booking" className="btn">Записаться</Link>
</div>
</div>

{/* mobile panel */}
{open && (
<div className="md:hidden border-t border-gray-200 dark:border-gray-800">
<nav className="container py-3 flex flex-col gap-3">
{NAV.map((item) => (
<Link key={item.href} href={item.href} className="link text-lg" onClick={() => setOpen(false)}>
{item.label}
</Link>
))}
</nav>
</div>
)}
</header>
);
}