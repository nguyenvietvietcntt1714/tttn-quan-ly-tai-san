/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Area" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "AssetGroup" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Facility" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
