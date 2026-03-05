BEGIN;

CREATE TABLE IF NOT EXISTS "ai_chat_turn" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "turnNumber" INTEGER NOT NULL,
  "userMessage" TEXT,
  "assistantMessage" TEXT,
  "responseMode" VARCHAR(8) NOT NULL DEFAULT 'json',
  "isFastPath" BOOLEAN NOT NULL DEFAULT false,
  "fastPathName" VARCHAR(64),
  "isGptCall" BOOLEAN NOT NULL DEFAULT false,
  "gptIterations" INTEGER NOT NULL DEFAULT 0,
  "ttfdMs" INTEGER,
  "totalMs" INTEGER NOT NULL DEFAULT 0,
  "funnelStage" VARCHAR(24) NOT NULL DEFAULT 'none',
  "outcome" VARCHAR(16) NOT NULL DEFAULT 'ok',
  "errorCategory" VARCHAR(32),
  "errorCode" VARCHAR(64),
  "errorMessageSafe" VARCHAR(512),
  "retried" BOOLEAN NOT NULL DEFAULT false,
  "inputMode" VARCHAR(8),
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_chat_turn_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ai_chat_turn_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "ai_chat_session"("sessionId")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ai_tool_run" (
  "id" TEXT NOT NULL,
  "turnId" TEXT NOT NULL,
  "toolName" VARCHAR(64) NOT NULL,
  "step" VARCHAR(64),
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "durationMs" INTEGER NOT NULL DEFAULT 0,
  "ok" BOOLEAN NOT NULL DEFAULT true,
  "errorCode" VARCHAR(64),
  "errorMessageSafe" VARCHAR(512),
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_tool_run_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ai_tool_run_turnId_fkey"
    FOREIGN KEY ("turnId") REFERENCES "ai_chat_turn"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ai_chat_turn_sessionId_turnNumber_idx" ON "ai_chat_turn"("sessionId", "turnNumber");
CREATE INDEX IF NOT EXISTS "ai_chat_turn_sessionId_idx" ON "ai_chat_turn"("sessionId");
CREATE INDEX IF NOT EXISTS "ai_chat_turn_startedAt_idx" ON "ai_chat_turn"("startedAt");
CREATE INDEX IF NOT EXISTS "ai_chat_turn_outcome_idx" ON "ai_chat_turn"("outcome");
CREATE INDEX IF NOT EXISTS "ai_chat_turn_errorCategory_idx" ON "ai_chat_turn"("errorCategory");

CREATE INDEX IF NOT EXISTS "ai_tool_run_turnId_idx" ON "ai_tool_run"("turnId");
CREATE INDEX IF NOT EXISTS "ai_tool_run_toolName_idx" ON "ai_tool_run"("toolName");

COMMIT;
