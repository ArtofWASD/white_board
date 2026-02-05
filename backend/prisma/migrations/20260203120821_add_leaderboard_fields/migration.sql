-- AlterTable
ALTER TABLE "event_results" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "scaling" TEXT NOT NULL DEFAULT 'RX',
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "scheme" TEXT NOT NULL DEFAULT 'FOR_TIME';
