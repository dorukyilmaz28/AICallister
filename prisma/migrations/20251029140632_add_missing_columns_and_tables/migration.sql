/*
  Warnings:

  - A unique constraint covering the columns `[teamNumber]` on the table `teams` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "team_members" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'approved';

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "adminId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'member',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "teamId" TEXT;

-- CreateTable
CREATE TABLE "team_join_requests" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "team_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "team_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_join_requests_userId_teamId_key" ON "team_join_requests"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_teamNumber_key" ON "teams"("teamNumber");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_join_requests" ADD CONSTRAINT "team_join_requests_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_notifications" ADD CONSTRAINT "team_notifications_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_notifications" ADD CONSTRAINT "team_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
