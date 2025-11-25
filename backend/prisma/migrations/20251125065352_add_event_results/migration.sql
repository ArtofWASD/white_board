-- CreateTable
CREATE TABLE "event_results" (
    "id" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "date_added" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,

    CONSTRAINT "event_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "event_results" ADD CONSTRAINT "event_results_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
