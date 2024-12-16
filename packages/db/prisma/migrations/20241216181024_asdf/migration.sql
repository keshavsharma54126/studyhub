/*
  Warnings:

  - A unique constraint covering the columns `[secretCode]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Made the column `secretCode` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "secretCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_secretCode_key" ON "Session"("secretCode");
