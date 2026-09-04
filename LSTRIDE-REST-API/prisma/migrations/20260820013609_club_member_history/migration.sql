-- CreateEnum
CREATE TYPE "ClubMemberHistoryAction" AS ENUM ('JOIN', 'LEAVE');

-- CreateTable
CREATE TABLE "club_member_history" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "ClubMemberHistoryAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_member_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "club_member_history_clubId_idx" ON "club_member_history"("clubId");

-- CreateIndex
CREATE INDEX "club_member_history_userId_idx" ON "club_member_history"("userId");

-- CreateIndex
CREATE INDEX "club_member_history_createdAt_idx" ON "club_member_history"("createdAt");

-- AddForeignKey
ALTER TABLE "club_member_history" ADD CONSTRAINT "club_member_history_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_member_history" ADD CONSTRAINT "club_member_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
