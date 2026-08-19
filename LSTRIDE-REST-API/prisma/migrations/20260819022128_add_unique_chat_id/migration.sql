/*
  Warnings:

  - You are about to drop the column `chatId` on the `follows` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "follows_chatId_key";

-- AlterTable
ALTER TABLE "follows" DROP COLUMN "chatId";
