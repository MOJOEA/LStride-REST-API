/*
  Warnings:

  - The values [NEW_MESSAGE] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `Description` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `bio` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('CLUB_ACTIVITY', 'NEW_FOLLOWER', 'NEW_WORKOUT_TEMPLATE', 'CLUB_INVITATION');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "Description",
ALTER COLUMN "bio" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
