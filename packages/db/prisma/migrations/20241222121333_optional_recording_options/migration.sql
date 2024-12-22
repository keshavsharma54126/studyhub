-- AlterTable
ALTER TABLE "SessionRecording" ALTER COLUMN "eventType" DROP NOT NULL,
ALTER COLUMN "eventData" DROP NOT NULL,
ALTER COLUMN "timestamp" DROP NOT NULL;
