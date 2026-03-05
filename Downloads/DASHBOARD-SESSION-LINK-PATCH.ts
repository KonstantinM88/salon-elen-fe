// ═══════════════════════════════════════════════════════════════
// AiDashboardClient.tsx — SESSION LINK PATCH
// ═══════════════════════════════════════════════════════════════
//
// Add clickable rows in the Sessions tab that link to detail page.
//
// ═══════════════════════════════════════════════════════════════

// ─── CHANGE 1: Add import ───────────────────────────────────

/*
import Link from 'next/link';
// or use router.push
*/


// ─── CHANGE 2: Make session rows clickable ──────────────────
//
// In the SessionsTab table body, wrap each <tr> with Link
// or add onClick. Replace the existing <tr> with:

/*
  <tr
    key={s.id}
    onClick={() => router.push(`/admin/ai/session/${s.sessionId}`)}
    className="border-b border-white/5 cursor-pointer transition-colors hover:bg-white/8"
  >
*/

// Or alternatively, add a "detail" column with a link icon:

/*
  <td className="px-3 py-2">
    <Link
      href={`/admin/ai/session/${s.sessionId}`}
      className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
    >
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  </td>
*/


// ═══════════════════════════════════════════════════════════════
// FILE STRUCTURE AFTER ALL CHANGES:
//
// src/app/admin/ai/
//   page.tsx                              ← Overview dashboard
//   _components/
//     AiDashboardClient.tsx               ← Dashboard tabs UI
//     SessionReplayClient.tsx             ← Session detail/replay UI
//   session/
//     [sessionId]/
//       page.tsx                          ← Session detail server page
//
// src/lib/ai/
//   turn-tracker.ts                       ← Turn recording + queries
//   ai-analytics.ts                       ← Session-level analytics (existing)
//   resilience.ts                         ← Error recovery (existing)
//
// ═══════════════════════════════════════════════════════════════
