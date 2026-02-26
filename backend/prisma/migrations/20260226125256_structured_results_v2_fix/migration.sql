-- AlterTable
ALTER TABLE "event_results" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "time" DROP NOT NULL;
