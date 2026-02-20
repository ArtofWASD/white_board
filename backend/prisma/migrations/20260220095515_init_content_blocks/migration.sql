-- CreateEnum
CREATE TYPE "ContentLocation" AS ENUM ('LANDING', 'KNOWLEDGE');

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "image_url" TEXT,
    "location" "ContentLocation" NOT NULL DEFAULT 'LANDING',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);
