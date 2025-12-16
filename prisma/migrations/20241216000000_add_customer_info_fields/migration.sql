-- Add customerName and birthday fields
-- Migration: add_customer_name_and_birthday

-- Обновляем GoogleQuickRegistration
ALTER TABLE "GoogleQuickRegistration" ADD COLUMN "customerName" TEXT;
ALTER TABLE "GoogleQuickRegistration" ADD COLUMN "birthday" TIMESTAMP(3);

-- Обновляем Appointment
ALTER TABLE "Appointment" ADD COLUMN "birthday" TIMESTAMP(3);

-- Update existing records with empty customerName
UPDATE "GoogleQuickRegistration" 
SET "customerName" = COALESCE(email, '')
WHERE "customerName" IS NULL;