/*
  Warnings:

  - The `notes` column on the `event_results` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "event_results" DROP COLUMN "notes",
ADD COLUMN     "notes" JSONB DEFAULT '[]';
