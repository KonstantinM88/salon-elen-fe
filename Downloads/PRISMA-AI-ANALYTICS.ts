// ═══════════════════════════════════════════════════════════════
// PRISMA SCHEMA — AI ANALYTICS TABLE
// ═══════════════════════════════════════════════════════════════
//
// Add this model to prisma/schema.prisma (before the enums at the end).
// Then run:
//   npx prisma migrate dev --name add_ai_chat_session
//   npx prisma generate
//
// ═══════════════════════════════════════════════════════════════

/*

model AiChatSession {
  id              String   @id @default(cuid())

  /// Client-generated session UUID
  sessionId       String   @unique
  
  /// Detected language: "de" | "ru" | "en"
  locale          String   @default("de") @db.VarChar(5)

  /// User-Agent string (truncated to 512 chars)
  userAgent       String?  @db.VarChar(512)

  /// Device type derived from UA: "mobile" | "desktop" | "tablet" | "unknown"
  deviceType      String   @default("unknown") @db.VarChar(16)

  /// IP address (anonymized: last octet zeroed for IPv4)
  ipAnon          String?  @db.VarChar(45)

  /// Referrer page where chat was opened
  referrer        String?  @db.VarChar(512)

  /// Whether voice input was used at least once
  usedVoice       Boolean  @default(false)

  /// Whether streaming (SSE) was used
  usedStreaming    Boolean  @default(false)

  /// Total user messages sent
  messageCount    Int      @default(0)

  /// Total assistant messages
  assistantMsgCount Int    @default(0)

  /// Number of GPT calls (not fast-path)
  gptCallCount    Int      @default(0)

  /// Number of fast-path responses (no GPT)
  fastPathCount   Int      @default(0)

  /// Total tool invocations
  toolCallCount   Int      @default(0)

  /// Cumulative tool execution time (ms)
  toolTotalMs     Int      @default(0)

  /// Number of errors during session
  errorCount      Int      @default(0)

  /// Number of retries triggered
  retryCount      Int      @default(0)

  /// Furthest booking funnel stage reached:
  ///   "none" | "catalog" | "master" | "date" | "slot" | "contact" | "otp" | "completed"
  funnelStage     String   @default("none") @db.VarChar(24)

  /// Whether booking was successfully completed
  bookingCompleted Boolean @default(false)

  /// ID of the created Appointment (if booking completed)
  appointmentId   String?

  /// Whether consultation mode was entered
  consultationUsed Boolean @default(false)

  /// Consultation topics explored (comma-separated)
  consultationTopics String? @db.VarChar(256)

  /// Session start (first message)
  startedAt       DateTime @default(now())

  /// Session end (last activity)
  endedAt         DateTime @default(now())

  /// Duration in seconds (computed on finalize)
  durationSec     Int      @default(0)

  /// Created timestamp
  createdAt       DateTime @default(now())

  /// Last update
  updatedAt       DateTime @updatedAt

  @@index([startedAt])
  @@index([locale])
  @@index([bookingCompleted])
  @@index([funnelStage])
  @@index([deviceType])
  @@map("ai_chat_session")
}

*/
