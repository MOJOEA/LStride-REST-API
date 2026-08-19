/*
  Warnings:

  - You are about to drop the column `order` on the `workout_template_details` table. All the data in the column will be lost.
  - You are about to drop the column `restTime` on the `workout_template_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "workout_template_details" DROP COLUMN "order",
DROP COLUMN "restTime";
