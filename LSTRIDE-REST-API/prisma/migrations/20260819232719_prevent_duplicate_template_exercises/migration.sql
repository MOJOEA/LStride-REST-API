/*
  Warnings:

  - A unique constraint covering the columns `[templateId,exerciseId]` on the table `workout_template_details` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "workout_template_details_templateId_exerciseId_key" ON "workout_template_details"("templateId", "exerciseId");
