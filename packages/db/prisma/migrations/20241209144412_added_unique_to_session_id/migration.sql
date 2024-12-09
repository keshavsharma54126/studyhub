/*
  Warnings:

  - A unique constraint covering the columns `[sessionId]` on the table `Slide` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Slide_sessionId_key" ON "Slide"("sessionId");
