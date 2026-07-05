CREATE TABLE "TelegramConversationState" (
  "id" TEXT NOT NULL,
  "chatId" TEXT NOT NULL,
  "fromId" TEXT NOT NULL,
  "flow" TEXT NOT NULL,
  "step" TEXT,
  "payload" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TelegramConversationState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TelegramConversationState_chatId_fromId_flow_key"
  ON "TelegramConversationState"("chatId", "fromId", "flow");

CREATE INDEX "TelegramConversationState_chatId_fromId_idx"
  ON "TelegramConversationState"("chatId", "fromId");

CREATE INDEX "TelegramConversationState_expiresAt_idx"
  ON "TelegramConversationState"("expiresAt");
