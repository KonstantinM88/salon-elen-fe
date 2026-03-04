// ═══════════════════════════════════════════════════════════════
// SIDEBAR NAV UPDATE — Add AI Dashboard
// ═══════════════════════════════════════════════════════════════
//
// File: src/app/admin/_components/AdminSidebarServer.tsx
//
// ═══════════════════════════════════════════════════════════════

// ─── CHANGE 1: Add Bot import ───────────────────────────────
//
// Update the lucide-react import:

/*
import {
  LayoutGrid,
  Newspaper,
  Scissors,
  ClipboardList,
  Users2,
  CalendarDays,
  BarChart3,
  Bot,         // ← ADD
} from "lucide-react";
*/


// ─── CHANGE 2: Add AI item to nav array ─────────────────────
//
// In the `items` array, add after "Статистика":

/*
    { label: "AI Ассистент", href: "/admin/ai", icon: <Bot className="h-4 w-4" />, tone: "violet" as const },
*/

// Full items array should look like:
/*
  const items = [
    { label: "Дашборд", href: "/admin", icon: <LayoutGrid className="h-4 w-4" />, tone: "violet" as const },
    { label: "Новости", href: "/admin/news", icon: <Newspaper className="h-4 w-4" />, tone: "violet" as const, badge: drafts || null },
    { label: "Услуги", href: "/admin/services", icon: <Scissors className="h-4 w-4" />, tone: "emerald" as const },
    { label: "Заявки", href: "/admin/bookings", icon: <ClipboardList className="h-4 w-4" />, tone: "amber" as const, badge: pending || null },
    { label: "Клиенты", href: "/admin/clients", icon: <Users2 className="h-4 w-4" />, tone: "sky" as const },
    { label: "Календарь", href: "/admin/calendar", icon: <CalendarDays className="h-4 w-4" />, tone: "sky" as const },
    { label: "Статистика", href: "/admin/stats", icon: <BarChart3 className="h-4 w-4" />, tone: "emerald" as const },
    { label: "AI Ассистент", href: "/admin/ai", icon: <Bot className="h-4 w-4" />, tone: "violet" as const },
  ];
*/


// ─── CHANGE 3 (optional): AdminNav.tsx ──────────────────────
//
// If AdminNav.tsx is a separate component that also defines nav items
// (used in mobile menu), add the same AI item there:

/*
  { label: "AI Ассистент", href: "/admin/ai", icon: <Bot className="h-4 w-4" />, tone: "violet" as const },
*/


// ═══════════════════════════════════════════════════════════════
// FILE STRUCTURE:
//
// src/app/admin/ai/
//   page.tsx                     ← Server page (data fetching)
//   _components/
//     AiDashboardClient.tsx      ← Client component (UI)
//
// ═══════════════════════════════════════════════════════════════
//
// DEPLOYMENT:
//
// 1. Create directory: src/app/admin/ai/_components/
// 2. Copy ai-dashboard-page.tsx → src/app/admin/ai/page.tsx
// 3. Copy AiDashboardClient.tsx → src/app/admin/ai/_components/AiDashboardClient.tsx
// 4. Update AdminSidebarServer.tsx (Change 1 + 2)
// 5. Optionally update AdminNav.tsx (Change 3)
// 6. Test: visit /admin/ai
//
// ═══════════════════════════════════════════════════════════════
