-- Additive: existing requests retain the original plum design, including old empty phones.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

ALTER TABLE "GiftVoucherRequest" ADD COLUMN "designKey" VARCHAR(20) NOT NULL DEFAULT 'orchid';
ALTER TABLE "GiftVoucherRequest" ADD CONSTRAINT "GiftVoucherRequest_designKey_check"
  CHECK ("designKey" IN ('orchid', 'peony', 'ginkgo', 'lily'));

CREATE TABLE "GiftVoucherStatusEvent" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "previousStatus" VARCHAR(12) NOT NULL,
  "status" VARCHAR(12) NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clientNotifiedAt" TIMESTAMP(3),
  "adminChatIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "adminDeliveredChatIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "adminNotifiedAt" TIMESTAMP(3),
  "deliveryLockedUntil" TIMESTAMP(3),
  "deliveryLockToken" TEXT,
  CONSTRAINT "GiftVoucherStatusEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GiftVoucherStatusEvent_previousStatus_check" CHECK ("previousStatus" IN ('NEW', 'CONTACTED', 'COMPLETED', 'CANCELED')),
  CONSTRAINT "GiftVoucherStatusEvent_status_check" CHECK ("status" IN ('NEW', 'CONTACTED', 'COMPLETED', 'CANCELED')),
  CONSTRAINT "GiftVoucherStatusEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "GiftVoucherRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "GiftVoucherStatusEvent_requestId_createdAt_idx" ON "GiftVoucherStatusEvent"("requestId", "createdAt");

COMMIT;
