/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `SessionRecording` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SessionRecording_sessionId_key" ON "SessionRecording"("sessionId");
