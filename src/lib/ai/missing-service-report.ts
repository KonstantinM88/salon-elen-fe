// src/lib/ai/missing-service-report.ts
// Reports when users ask for services that don't exist in the catalog.
// Useful for salon owner to see demand for new services.

import type { ChatHistoryEntry } from './session-store';

interface MissingServiceReport {
  sessionId: string;
  locale: string;
  query: string;
  transcript: ChatHistoryEntry[];
  alternatives: Array<{
    title: string;
    groupTitle?: string | null;
    durationMin?: number | null;
    priceCents?: number | null;
  }>;
}

/**
 * Report a missing service inquiry.
 * Currently logs to console; extend to write to DB table or send Telegram notification.
 */
export async function reportMissingServiceInquiry(
  report: MissingServiceReport,
): Promise<void> {
  const altNames = report.alternatives.map((a) => a.title).join(', ');
  const lastMessages = report.transcript
    .slice(-4)
    .map((m) => `[${m.role}] ${m.content.slice(0, 100)}`)
    .join('\n  ');

  console.log(
    `[Missing Service] session=${report.sessionId.slice(0, 8)}... ` +
      `locale=${report.locale} query="${report.query}" ` +
      `alternatives=[${altNames}]`,
  );

  if (lastMessages) {
    console.log(`  Recent context:\n  ${lastMessages}`);
  }

  // TODO: Extend with one of:
  // 1. Write to Prisma `MissingServiceLog` table
  // 2. Send Telegram notification to admin
  // 3. Aggregate and email weekly digest
  //
  // Example Prisma extension:
  // await prisma.missingServiceLog.create({
  //   data: {
  //     sessionId: report.sessionId,
  //     locale: report.locale,
  //     query: report.query,
  //     alternativesSuggested: altNames,
  //   },
  // });
}



// // src/lib/ai/missing-service-report.ts
// // Persist and notify when AI could not match a requested service.

// import { prisma } from '@/lib/prisma';
// import { sendAdminMissingServiceNotification } from '@/lib/send-admin-notification';

// interface AlternativeItem {
//   title: string;
//   groupTitle?: string | null;
//   durationMin?: number | null;
//   priceCents?: number | null;
// }

// interface SessionMessage {
//   role: 'user' | 'assistant';
//   content: string;
//   at?: string;
// }

// interface ReportMissingServiceArgs {
//   sessionId: string;
//   locale: string;
//   query: string;
//   transcript: SessionMessage[];
//   alternatives?: AlternativeItem[];
// }

// function compactText(value: string, max = 1000): string {
//   return value.replace(/\s+/g, ' ').trim().slice(0, max);
// }

// export async function reportMissingServiceInquiry(
//   args: ReportMissingServiceArgs,
// ): Promise<{ ok: true; logId: string } | { ok: false; error: string }> {
//   const query = compactText(args.query, 300);
//   if (!query) return { ok: false, error: 'EMPTY_QUERY' };

//   const transcript = (args.transcript ?? []).slice(-20).map((m) => ({
//     role: m.role,
//     content: compactText(m.content, 800),
//     at: m.at ?? new Date().toISOString(),
//   }));

//   const alternatives = (args.alternatives ?? []).slice(0, 12).map((a) => ({
//     title: compactText(a.title, 120),
//     groupTitle: a.groupTitle ? compactText(a.groupTitle, 120) : null,
//     durationMin: typeof a.durationMin === 'number' ? a.durationMin : null,
//     priceCents: typeof a.priceCents === 'number' ? a.priceCents : null,
//   }));

//   try {
//     const created = await prisma.booking.create({
//       data: {
//         name: 'AI Missing Service',
//         phone: `AI-${args.sessionId.slice(0, 20)}`,
//         email: null,
//         message: JSON.stringify(
//           {
//             type: 'ai_missing_service',
//             createdAt: new Date().toISOString(),
//             sessionId: args.sessionId,
//             locale: args.locale,
//             query,
//             alternatives,
//             transcript,
//           },
//           null,
//           2,
//         ),
//       },
//       select: { id: true },
//     });

//     await sendAdminMissingServiceNotification({
//       sessionId: args.sessionId,
//       locale: args.locale,
//       query,
//       bookingLogId: created.id,
//       alternatives,
//       transcript,
//     });

//     return { ok: true, logId: created.id };
//   } catch (error) {
//     console.error('[AI Missing Service] Failed to persist/report:', error);
//     return { ok: false, error: 'PERSIST_FAILED' };
//   }
// }
