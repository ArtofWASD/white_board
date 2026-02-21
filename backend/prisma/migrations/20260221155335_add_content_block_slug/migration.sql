/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `content_blocks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "content_blocks" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "content_blocks_slug_key" ON "content_blocks"("slug");
