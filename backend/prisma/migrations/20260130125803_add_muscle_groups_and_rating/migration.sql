-- AlterTable
ALTER TABLE "content_exercises" ADD COLUMN     "muscle_groups" TEXT[],
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "wods" ADD COLUMN     "muscle_groups" TEXT[],
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
