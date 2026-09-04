/*
  Warnings:

  - You are about to drop the column `status` on the `club_members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "club_members" DROP COLUMN "status";

-- DropEnum
DROP TYPE "ClubMemberStatus";
