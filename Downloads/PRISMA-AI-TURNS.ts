// ═══════════════════════════════════════════════════════════════
// PRISMA SCHEMA — AiChatTurn + AiToolRun
// ═══════════════════════════════════════════════════════════════
//
// Add these models to prisma/schema.prisma AFTER AiChatSession.
// Then run:
//   npx prisma migrate dev --name add_ai_turn_tracking
//   npx prisma generate
//
// ═══════════════════════════════════════════════════════════════

/*

/// One user message → assistant response cycle
model AiChatTurn {
  id                 String       @id @default(cuid())

  /// References AiChatSession.sessionId
  sessionId          String

  /// Sequential turn number within session (1, 2, 3...)
  turnNumber         Int

  /// User message (PII-redacted: phones → +49***, emails → m***@g***.com)
  userMessage        String?      @db.Text

  /// Assistant response text (PII-redacted)
  assistantMessage   String?      @db.Text

  /// Response mode: "json" (fast-path or non-streaming) | "sse" (streaming)
  responseMode       String       @default("json") @db.VarChar(8)

  /// Whether this was a fast-path (no GPT call)
  isFastPath         Boolean      @default(false)

  /// Fast-path identifier if applicable (e.g. "catalog-selection", "nearest-date")
  fastPathName       String?      @db.VarChar(64)

  /// Whether GPT was called
  isGptCall          Boolean      @default(false)

  /// Number of GPT iterations (tool loops) in this turn
  gptIterations      Int          @default(0)

  /// Time to first delta in SSE mode (ms) — null for JSON mode
  ttfdMs             Int?

  /// Total response time from request start to final response (ms)
  totalMs            Int          @default(0)

  /// Booking funnel stage at END of this turn
  funnelStage        String       @default("none") @db.VarChar(24)

  /// Turn outcome
  outcome            String       @default("ok") @db.VarChar(16)
  /// ^^ "ok" | "error" | "timeout" | "aborted" | "degraded"

  /// Error details (if outcome != "ok")
  errorCategory      String?      @db.VarChar(32)
  errorCode          String?      @db.VarChar(64)
  /// Safe error message (no PII, no internal stack traces)
  errorMessageSafe   String?      @db.VarChar(512)

  /// Whether retry was attempted
  retried            Boolean      @default(false)

  /// Input mode from client
  inputMode          String?      @db.VarChar(8)
  /// ^^ "text" | "voice" | "otp"

  /// Tool runs within this turn
  toolRuns           AiToolRun[]

  /// Timestamps
  startedAt          DateTime     @default(now())
  endedAt            DateTime     @default(now())
  createdAt          DateTime     @default(now())

  /// Relation to session
  session            AiChatSession @relation(fields: [sessionId], references: [sessionId], onDelete: Cascade)

  @@index([sessionId, turnNumber])
  @@index([sessionId])
  @@index([startedAt])
  @@index([outcome])
  @@index([errorCategory])
  @@map("ai_chat_turn")
}

/// One tool invocation within a turn
model AiToolRun {
  id                 String       @id @default(cuid())

  /// Parent turn
  turnId             String

  /// Tool name (e.g. "list_services", "search_availability")
  toolName           String       @db.VarChar(64)

  /// Progress step label (e.g. "loading_services", "searching_slots")
  step               String?      @db.VarChar(64)

  /// Execution order within the turn (0, 1, 2...)
  orderIndex         Int          @default(0)

  /// Duration in milliseconds
  durationMs         Int          @default(0)

  /// Whether execution succeeded
  ok                 Boolean      @default(true)

  /// Error details if failed
  errorCode          String?      @db.VarChar(64)
  errorMessageSafe   String?      @db.VarChar(512)

  /// Timestamps
  startedAt          DateTime     @default(now())
  createdAt          DateTime     @default(now())

  /// Relation
  turn               AiChatTurn   @relation(fields: [turnId], references: [id], onDelete: Cascade)

  @@index([turnId])
  @@index([toolName])
  @@map("ai_tool_run")
}

*/

// ═══════════════════════════════════════════════════════════════
// ALSO: Add relation field to AiChatSession:
//
// In the existing AiChatSession model, add:
//
//   turns  AiChatTurn[]
//
// ═══════════════════════════════════════════════════════════════
