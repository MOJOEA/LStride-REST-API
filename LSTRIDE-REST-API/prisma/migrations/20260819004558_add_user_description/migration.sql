/*
  Warnings:

  - A unique constraint covering the columns `[chatId]` on the table `follows` will be added. If there are existing duplicate values, this will fail.
  - Made the column `gender` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "Description" VARCHAR(100),
ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "gender" SET DEFAULT 'Not Specified',
ALTER COLUMN "password" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "follows_chatId_key" ON "follows"("chatId");
