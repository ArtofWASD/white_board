/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `content_exercises` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `wods` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "content_exercises" ADD COLUMN     "preview" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "wods" ADD COLUMN     "preview" TEXT,
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "content_exercises_slug_key" ON "content_exercises"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "wods_slug_key" ON "wods"("slug");
