-- CreateTable
CREATE TABLE "event_result_likes" (
    "id" TEXT NOT NULL,
    "event_result_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_result_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_result_likes_event_result_id_user_id_key" ON "event_result_likes"("event_result_id", "user_id");

-- AddForeignKey
ALTER TABLE "event_result_likes" ADD CONSTRAINT "event_result_likes_event_result_id_fkey" FOREIGN KEY ("event_result_id") REFERENCES "event_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_result_likes" ADD CONSTRAINT "event_result_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
