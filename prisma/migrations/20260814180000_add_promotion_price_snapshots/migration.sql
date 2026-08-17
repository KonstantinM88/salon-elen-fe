ALTER TABLE "Appointment"
ADD COLUMN "originalPriceCents" INTEGER,
ADD COLUMN "finalPriceCents" INTEGER,
ADD COLUMN "promotionTitle" TEXT,
ADD COLUMN "promotionPercent" INTEGER;

ALTER TABLE "BookingDraft"
ADD COLUMN "originalPriceCents" INTEGER,
ADD COLUMN "finalPriceCents" INTEGER,
ADD COLUMN "promotionTitle" TEXT,
ADD COLUMN "promotionPercent" INTEGER;

ALTER TABLE "GoogleQuickRegistration"
ADD COLUMN "originalPriceCents" INTEGER,
ADD COLUMN "finalPriceCents" INTEGER,
ADD COLUMN "promotionTitle" TEXT,
ADD COLUMN "promotionPercent" INTEGER;

ALTER TABLE "SmsPhoneRegistration"
ADD COLUMN "originalPriceCents" INTEGER,
ADD COLUMN "finalPriceCents" INTEGER,
ADD COLUMN "promotionTitle" TEXT,
ADD COLUMN "promotionPercent" INTEGER;

ALTER TABLE "TelegramVerification"
ADD COLUMN "originalPriceCents" INTEGER,
ADD COLUMN "finalPriceCents" INTEGER,
ADD COLUMN "promotionTitle" TEXT,
ADD COLUMN "promotionPercent" INTEGER;
