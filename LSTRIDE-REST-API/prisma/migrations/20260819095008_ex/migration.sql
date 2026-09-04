/*
  Warnings:

  - You are about to drop the column `description` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `exampleImage` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `exerciseType` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `movement` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `primaryMuscle` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryMuscle` on the `exercises` table. All the data in the column will be lost.
  - Added the required column `category` to the `exercises` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `exercises` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "exercises" DROP COLUMN "description",
DROP COLUMN "difficulty",
DROP COLUMN "exampleImage",
DROP COLUMN "exerciseType",
DROP COLUMN "movement",
DROP COLUMN "primaryMuscle",
DROP COLUMN "secondaryMuscle",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "force" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "instructions" TEXT[],
ADD COLUMN     "level" TEXT NOT NULL,
ADD COLUMN     "mechanic" TEXT,
ADD COLUMN     "primaryMuscles" TEXT[],
ADD COLUMN     "secondaryMuscles" TEXT[];

-- CreateIndex
CREATE INDEX "exercises_level_idx" ON "exercises"("level");

-- CreateIndex
CREATE INDEX "exercises_equipment_idx" ON "exercises"("equipment");

-- CreateIndex
CREATE INDEX "exercises_category_idx" ON "exercises"("category");
