/*
  Warnings:

  - Added the required column `startTime` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
