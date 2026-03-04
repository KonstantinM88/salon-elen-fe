-- Manual migration for ai_chat_session.
-- This SQL is intended to match the schema for model AiChatSession.

CREATE TABLE "ai_chat_session" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "locale" VARCHAR(5) NOT NULL DEFAULT 'de',
    "userAgent" VARCHAR(512),
    "deviceType" VARCHAR(16) NOT NULL DEFAULT 'unknown',
    "ipAnon" VARCHAR(45),
    "referrer" VARCHAR(512),
    "usedVoice" BOOLEAN NOT NULL DEFAULT false,
    "usedStreaming" BOOLEAN NOT NULL DEFAULT false,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "assistantMsgCount" INTEGER NOT NULL DEFAULT 0,
    "gptCallCount" INTEGER NOT NULL DEFAULT 0,
    "fastPathCount" INTEGER NOT NULL DEFAULT 0,
    "toolCallCount" INTEGER NOT NULL DEFAULT 0,
    "toolTotalMs" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "funnelStage" VARCHAR(24) NOT NULL DEFAULT 'none',
    "bookingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "appointmentId" TEXT,
    "consultationUsed" BOOLEAN NOT NULL DEFAULT false,
    "consultationTopics" VARCHAR(256),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chat_session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_chat_session_sessionId_key" ON "ai_chat_session"("sessionId");
CREATE INDEX "ai_chat_session_startedAt_idx" ON "ai_chat_session"("startedAt");
CREATE INDEX "ai_chat_session_locale_idx" ON "ai_chat_session"("locale");
CREATE INDEX "ai_chat_session_bookingCompleted_idx" ON "ai_chat_session"("bookingCompleted");
CREATE INDEX "ai_chat_session_funnelStage_idx" ON "ai_chat_session"("funnelStage");
CREATE INDEX "ai_chat_session_deviceType_idx" ON "ai_chat_session"("deviceType");
