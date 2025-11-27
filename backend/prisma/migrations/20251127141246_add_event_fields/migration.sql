-- AlterTable
ALTER TABLE "events" ADD COLUMN     "rounds" TEXT,
ADD COLUMN     "team_id" TEXT,
ADD COLUMN     "time_cap" TEXT;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
