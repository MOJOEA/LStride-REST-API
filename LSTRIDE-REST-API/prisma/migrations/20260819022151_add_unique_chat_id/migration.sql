/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `follows` will be added. If there are existing duplicate values, this will fail.
  - The required column `chatId` was added to the `follows` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "follows" ADD COLUMN     "chatId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "follows_chatId_key" ON "follows"("chatId");
