/*
  Warnings:

  - A unique constraint covering the columns `[providerCallId]` on the table `CallLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CallLog" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "providerCallId" TEXT,
ADD COLUMN     "recordingUrl" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telephonyExtension" TEXT;

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_externalId_key" ON "Message"("externalId");

-- CreateIndex
CREATE INDEX "Message_leadId_idx" ON "Message"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "CallLog_providerCallId_key" ON "CallLog"("providerCallId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
