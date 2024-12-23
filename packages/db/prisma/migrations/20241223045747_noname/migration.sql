/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,userId]` on the table `SessionRecording` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SessionRecording_sessionId_userId_key" ON "SessionRecording"("sessionId", "userId");
