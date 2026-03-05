-- CreateTable
CREATE TABLE "ai_content_block" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(128) NOT NULL,
    "title" VARCHAR(256) NOT NULL,
    "contentDe" TEXT NOT NULL,
    "contentRu" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "context" VARCHAR(32) NOT NULL,
    "triggerIntent" VARCHAR(64),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "serviceSlug" VARCHAR(128),
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_content_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_service_config" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "showInConsultation" BOOLEAN NOT NULL DEFAULT true,
    "showInAssistantMenu" BOOLEAN NOT NULL DEFAULT true,
    "showInBooking" BOOLEAN NOT NULL DEFAULT true,
    "aiOrder" INTEGER NOT NULL DEFAULT 100,
    "aiTags" VARCHAR(256),
    "aiDescriptionDe" TEXT,
    "aiDescriptionRu" TEXT,
    "aiDescriptionEn" TEXT,
    "idealForDe" TEXT,
    "idealForRu" TEXT,
    "idealForEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_service_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_content_block_key_key" ON "ai_content_block"("key");

-- CreateIndex
CREATE INDEX "ai_content_block_context_idx" ON "ai_content_block"("context");

-- CreateIndex
CREATE INDEX "ai_content_block_triggerIntent_idx" ON "ai_content_block"("triggerIntent");

-- CreateIndex
CREATE INDEX "ai_content_block_enabled_idx" ON "ai_content_block"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "ai_service_config_serviceId_key" ON "ai_service_config"("serviceId");

-- CreateIndex
CREATE INDEX "ai_service_config_showInConsultation_idx" ON "ai_service_config"("showInConsultation");

-- CreateIndex
CREATE INDEX "ai_service_config_aiOrder_idx" ON "ai_service_config"("aiOrder");
