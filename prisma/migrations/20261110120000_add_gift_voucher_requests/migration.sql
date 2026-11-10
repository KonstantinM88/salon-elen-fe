CREATE TABLE "GiftVoucherRequest" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "locale" VARCHAR(2) NOT NULL,
    "buyerName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "recipientName" VARCHAR(100) NOT NULL,
    "senderName" VARCHAR(100) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "delivery" VARCHAR(10) NOT NULL,
    "status" VARCHAR(12) NOT NULL DEFAULT 'NEW',
    "adminNote" VARCHAR(1000) NOT NULL DEFAULT '',
    "consentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentVersion" TEXT NOT NULL DEFAULT 'gutschein-request-v1',
    "notifiedAt" TIMESTAMP(3),
    "receiptSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GiftVoucherRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "GiftVoucherRequest_amount_check" CHECK ("amountCents" BETWEEN 2500 AND 50000 AND "amountCents" % 100 = 0),
    CONSTRAINT "GiftVoucherRequest_status_check" CHECK ("status" IN ('NEW', 'CONTACTED', 'COMPLETED', 'CANCELED')),
    CONSTRAINT "GiftVoucherRequest_delivery_check" CHECK ("delivery" IN ('EMAIL', 'PICKUP'))
);
CREATE UNIQUE INDEX "GiftVoucherRequest_reference_key" ON "GiftVoucherRequest"("reference");
CREATE INDEX "GiftVoucherRequest_status_createdAt_idx" ON "GiftVoucherRequest"("status", "createdAt");
CREATE INDEX "GiftVoucherRequest_email_createdAt_idx" ON "GiftVoucherRequest"("email", "createdAt");
