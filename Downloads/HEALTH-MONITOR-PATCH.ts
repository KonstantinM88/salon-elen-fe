// ═══════════════════════════════════════════════════════════════
// HEALTH MONITOR INTEGRATION PATCH
// ═══════════════════════════════════════════════════════════════

// ─── CHANGE 1: Add Health Widget to AI Dashboard ────────────
//
// In src/app/admin/ai/page.tsx, import and add the widget
// at the top of the page, before the main dashboard:

/*
import AiHealthWidget from './_components/AiHealthWidget';

// In the JSX, after the header and before <AiDashboardClient>:

<div className="mb-6 max-w-md">
  <AiHealthWidget locale={locale} />
</div>
*/


// ─── CHANGE 2: Also add to main admin dashboard ────────────
//
// In src/app/admin/dashboard/page.tsx, add a compact health
// indicator. Import the widget:

/*
import AiHealthWidget from '../ai/_components/AiHealthWidget';

// Add after the existing cards:
<div className="max-w-md">
  <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-white/50 backdrop-blur-sm" />}>
    <AiHealthWidget locale={locale} />
  </Suspense>
</div>
*/


// ─── CHANGE 3: Cron setup options ───────────────────────────
//
// OPTION A: Vercel Cron (if using Vercel)
//
// Create vercel.json or add to existing:
/*
{
  "crons": [
    {
      "path": "/api/admin/ai-health?action=daily",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/admin/ai-health?action=alert",
      "schedule": "*/15 * * * *"
    }
  ]
}
*/

// OPTION B: System crontab (VPS)
//
// Add to crontab (crontab -e):
/*
# AI Daily Summary at 8:00 AM
0 8 * * * curl -s -X POST "https://permanent-halle.de/api/admin/ai-health?action=daily" -H "Authorization: Bearer YOUR_CRON_SECRET" > /dev/null 2>&1

# AI Error Alert check every 15 min
*/15 * * * * curl -s -X POST "https://permanent-halle.de/api/admin/ai-health?action=alert" -H "Authorization: Bearer YOUR_CRON_SECRET" > /dev/null 2>&1
*/

// OPTION C: GitHub Actions (free, no VPS access needed)
//
// .github/workflows/ai-daily-summary.yml:
/*
name: AI Daily Summary
on:
  schedule:
    - cron: '0 8 * * *'  # 8:00 UTC daily
  workflow_dispatch:

jobs:
  summary:
    runs-on: ubuntu-latest
    steps:
      - name: Send daily summary
        run: |
          curl -s -X POST "${{ secrets.SITE_URL }}/api/admin/ai-health?action=daily" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"

      - name: Check error alert
        run: |
          curl -s -X POST "${{ secrets.SITE_URL }}/api/admin/ai-health?action=alert" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
*/


// ─── CHANGE 4: Add CRON_SECRET env variable ─────────────────
//
// In .env (production):
/*
CRON_SECRET=your-random-secret-here-32-chars
*/


// ═══════════════════════════════════════════════════════════════
// FILE STRUCTURE:
//
// src/lib/ai/ai-health.ts                       ← Health + summary logic
// src/app/api/admin/ai-health/route.ts          ← API endpoint
// src/app/admin/ai/_components/AiHealthWidget.tsx ← Dashboard widget
//
// ═══════════════════════════════════════════════════════════════
//
// TELEGRAM MESSAGE PREVIEW:
//
// 🤖 AI Ассистент — Дневной отчёт
//
// 📅 Дата: 04.03.2026
//
// ━━━━━━━━━━━━━━━━━━━━━
//
// 📊 Основные показатели
// 👥 Сессии: 419
// 📝 Записи: 8  📈 1.9%
// ⏱ Ø Длительность: 12s
// 💬 Ø Сообщений: 1.4
//
// ━━━━━━━━━━━━━━━━━━━━━
//
// ⚡ Техническое
// 🚀 Fast-Path: 85.9%
// 🔧 Ø Tool latency: 620ms
// ✅ Ошибки: 0 (0%)
// 🔄 Повторы: 0
//
// ━━━━━━━━━━━━━━━━━━━━━
//
// 🎯 Использование
// 🎙 Голос: 0.2%
// 📡 Стриминг: 16.7%
// 💬 Консультация: 40.6%
//
// ━━━━━━━━━━━━━━━━━━━━━
//
// 🏆 Топ
// 🌐 Язык: ru (280)
// 📱 Устройство: desktop (310)
// 🎯 Воронка: none (340)
// 💡 Тема: pmu (85)
//
// ═══════════════════════════════════════════════════════════════
//
// ALERT MESSAGE PREVIEW (sent automatically when error rate > 15%):
//
// 🚨 AI Ассистент — ALERT
//
// ⚠️ Высокая доля ошибок за последние 15 мин
//
// 🔴 Ошибки: 5 из 12 запросов (42%)
// 👥 Затронуто сессий: 8
//
// Проверьте логи и /admin/ai
//
// ═══════════════════════════════════════════════════════════════
