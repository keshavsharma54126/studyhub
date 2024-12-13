/*
  Warnings:

  - You are about to drop the column `tags` on the `Session` table. All the data in the column will be lost.
  - Made the column `description` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "tags",
ALTER COLUMN "description" SET NOT NULL;
