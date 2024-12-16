-- DropForeignKey
ALTER TABLE "Slide" DROP CONSTRAINT "Slide_sessionId_fkey";

-- AddForeignKey
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
