-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "VideoType" AS ENUM ('UPLOAD', 'YOUTUBE', 'VIMEO');

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "appt_range",
ADD COLUMN     "deletedAt" TIMESTAMP(6),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "locale" TEXT DEFAULT 'de',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ogDescription" TEXT,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "ogTitle" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videoType" "VideoType",
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "BookingDraft" ADD COLUMN     "locale" TEXT DEFAULT 'de';

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "deletedAt" TIMESTAMP(6),
ADD COLUMN     "deletedBy" TEXT;

-- AlterTable
ALTER TABLE "GoogleQuickRegistration" DROP COLUMN "birthday",
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "locale" TEXT DEFAULT 'de';

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "cover" TEXT;

-- AlterTable
ALTER TABLE "TelegramUser" ADD COLUMN     "phone" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SmsPhoneRegistration" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "pinExpiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "serviceId" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT,
    "email" TEXT,
    "birthDate" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "appointmentId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locale" TEXT DEFAULT 'de',

    CONSTRAINT "SmsPhoneRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramVerification" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "telegramUserId" BIGINT,
    "code" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "serviceId" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "startAt" TEXT NOT NULL,
    "endAt" TEXT NOT NULL,
    "email" TEXT,
    "birthDate" TIMESTAMP(3),
    "appointmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "locale" TEXT DEFAULT 'de',

    CONSTRAINT "TelegramVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemporarySlotReservation" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemporarySlotReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_otp" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "admin_otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_status_logs" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "previousStatus" "AppointmentStatus",
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT,
    "reason" TEXT,

    CONSTRAINT "appointment_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_translations" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,

    CONSTRAINT "article_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_gallery" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_translations" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmsPhoneRegistration_appointmentId_key" ON "SmsPhoneRegistration"("appointmentId" ASC);

-- CreateIndex
CREATE INDEX "SmsPhoneRegistration_expiresAt_idx" ON "SmsPhoneRegistration"("expiresAt" ASC);

-- CreateIndex
CREATE INDEX "SmsPhoneRegistration_phone_idx" ON "SmsPhoneRegistration"("phone" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "SmsPhoneRegistration_state_key" ON "SmsPhoneRegistration"("state" ASC);

-- CreateIndex
CREATE INDEX "SmsPhoneRegistration_verified_idx" ON "SmsPhoneRegistration"("verified" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramVerification_appointmentId_key" ON "TelegramVerification"("appointmentId" ASC);

-- CreateIndex
CREATE INDEX "TelegramVerification_phone_idx" ON "TelegramVerification"("phone" ASC);

-- CreateIndex
CREATE INDEX "TelegramVerification_sessionId_idx" ON "TelegramVerification"("sessionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramVerification_sessionId_key" ON "TelegramVerification"("sessionId" ASC);

-- CreateIndex
CREATE INDEX "TelegramVerification_telegramUserId_idx" ON "TelegramVerification"("telegramUserId" ASC);

-- CreateIndex
CREATE INDEX "TemporarySlotReservation_expiresAt_idx" ON "TemporarySlotReservation"("expiresAt" ASC);

-- CreateIndex
CREATE INDEX "TemporarySlotReservation_masterId_startAt_endAt_idx" ON "TemporarySlotReservation"("masterId" ASC, "startAt" ASC, "endAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TemporarySlotReservation_sessionId_key" ON "TemporarySlotReservation"("sessionId" ASC);

-- CreateIndex
CREATE INDEX "admin_otp_adminEmail_idx" ON "admin_otp"("adminEmail" ASC);

-- CreateIndex
CREATE INDEX "admin_otp_code_idx" ON "admin_otp"("code" ASC);

-- CreateIndex
CREATE INDEX "admin_otp_expiresAt_idx" ON "admin_otp"("expiresAt" ASC);

-- CreateIndex
CREATE INDEX "appointment_status_logs_appointmentId_idx" ON "appointment_status_logs"("appointmentId" ASC);

-- CreateIndex
CREATE INDEX "appointment_status_logs_changedAt_idx" ON "appointment_status_logs"("changedAt" ASC);

-- CreateIndex
CREATE INDEX "article_translations_articleId_idx" ON "article_translations"("articleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "article_translations_articleId_locale_key" ON "article_translations"("articleId" ASC, "locale" ASC);

-- CreateIndex
CREATE INDEX "article_translations_locale_idx" ON "article_translations"("locale" ASC);

-- CreateIndex
CREATE INDEX "service_gallery_serviceId_idx" ON "service_gallery"("serviceId" ASC);

-- CreateIndex
CREATE INDEX "service_translations_locale_idx" ON "service_translations"("locale" ASC);

-- CreateIndex
CREATE INDEX "service_translations_serviceId_idx" ON "service_translations"("serviceId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "service_translations_serviceId_locale_key" ON "service_translations"("serviceId" ASC, "locale" ASC);

-- CreateIndex
CREATE INDEX "Appointment_deletedAt_idx" ON "Appointment"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "Appointment_paymentStatus_idx" ON "Appointment"("paymentStatus" ASC);

-- CreateIndex
CREATE INDEX "Article_isPinned_sortOrder_publishedAt_idx" ON "Article"("isPinned" DESC, "sortOrder" DESC, "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Client_deletedAt_idx" ON "Client"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email" ASC);

-- CreateIndex
CREATE INDEX "Client_phone_idx" ON "Client"("phone" ASC);

-- CreateIndex
CREATE INDEX "TelegramUser_phone_idx" ON "TelegramUser"("phone" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_phone_key" ON "TelegramUser"("phone" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_telegramChatId_key" ON "TelegramUser"("telegramChatId" ASC);

-- AddForeignKey
ALTER TABLE "SmsPhoneRegistration" ADD CONSTRAINT "SmsPhoneRegistration_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsPhoneRegistration" ADD CONSTRAINT "SmsPhoneRegistration_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsPhoneRegistration" ADD CONSTRAINT "SmsPhoneRegistration_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramVerification" ADD CONSTRAINT "TelegramVerification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_status_logs" ADD CONSTRAINT "appointment_status_logs_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_translations" ADD CONSTRAINT "article_translations_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_gallery" ADD CONSTRAINT "service_gallery_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

