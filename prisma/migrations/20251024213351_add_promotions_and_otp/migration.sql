-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionItem" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "PromotionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientDiscount" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Promotion_from_idx" ON "Promotion"("from");

-- CreateIndex
CREATE INDEX "Promotion_to_idx" ON "Promotion"("to");

-- CreateIndex
CREATE INDEX "Promotion_isGlobal_idx" ON "Promotion"("isGlobal");

-- CreateIndex
CREATE INDEX "PromotionItem_serviceId_idx" ON "PromotionItem"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "PromotionItem_promotionId_serviceId_key" ON "PromotionItem"("promotionId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientDiscount_clientId_key" ON "ClientDiscount"("clientId");

-- CreateIndex
CREATE INDEX "EmailVerification_email_idx" ON "EmailVerification"("email");

-- CreateIndex
CREATE INDEX "EmailVerification_expiresAt_idx" ON "EmailVerification"("expiresAt");

-- CreateIndex
CREATE INDEX "EmailVerification_used_idx" ON "EmailVerification"("used");

-- AddForeignKey
ALTER TABLE "PromotionItem" ADD CONSTRAINT "PromotionItem_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionItem" ADD CONSTRAINT "PromotionItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDiscount" ADD CONSTRAINT "ClientDiscount_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
