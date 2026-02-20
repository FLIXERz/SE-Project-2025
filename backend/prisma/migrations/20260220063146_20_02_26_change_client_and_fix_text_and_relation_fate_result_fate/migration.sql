/*
  Warnings:

  - You are about to drop the column `soecial_event` on the `FateResult` table. All the data in the column will be lost.
  - You are about to drop the column `Address` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FateResult" DROP COLUMN "soecial_event",
ADD COLUMN     "special_event" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Address",
ADD COLUMN     "address" TEXT;
