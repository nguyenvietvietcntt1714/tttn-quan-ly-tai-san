-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANAGER', 'USER', 'INVENTORY_CHECKER');

-- CreateEnum
CREATE TYPE "ManagementStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('GOOD', 'NEEDS_INSPECTION', 'BROKEN');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('HANDOVER', 'TRANSFER', 'RECALL', 'DEACTIVATE');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "departmentId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetGroup" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AssetGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "assetCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "assignedUserId" TEXT,
    "assignedDeptId" TEXT,
    "managementStatus" "ManagementStatus" NOT NULL DEFAULT 'AVAILABLE',
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "model" TEXT,
    "serial" TEXT,
    "brand" TEXT,
    "image" TEXT,
    "notes" TEXT,
    "receiptDate" TIMESTAMP(3),
    "warrantyDate" TIMESTAMP(3),
    "purchaseValue" DECIMAL(65,30) DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'DRAFT',
    "assetId" TEXT NOT NULL,
    "fromAreaId" TEXT,
    "fromUserId" TEXT,
    "fromDeptId" TEXT,
    "fromStatus" "ManagementStatus",
    "toAreaId" TEXT,
    "toUserId" TEXT,
    "toDeptId" TEXT,
    "toStatus" "ManagementStatus",
    "reason" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "confirmerId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "referenceTicketId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetHistory" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_name_key" ON "Facility"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AssetGroup_code_key" ON "AssetGroup"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetCode_key" ON "Asset"("assetCode");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketCode_key" ON "Ticket"("ticketCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AssetGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assignedDeptId_fkey" FOREIGN KEY ("assignedDeptId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_fromAreaId_fkey" FOREIGN KEY ("fromAreaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_fromDeptId_fkey" FOREIGN KEY ("fromDeptId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_toAreaId_fkey" FOREIGN KEY ("toAreaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_toDeptId_fkey" FOREIGN KEY ("toDeptId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_confirmerId_fkey" FOREIGN KEY ("confirmerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHistory" ADD CONSTRAINT "AssetHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHistory" ADD CONSTRAINT "AssetHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
