-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dashboard_layout" TEXT[] DEFAULT ARRAY['exercise-tracker', 'weight-tracker', 'recent-activities']::TEXT[],
ADD COLUMN     "dashboard_layout_mode" TEXT NOT NULL DEFAULT 'asymmetric';

-- CreateTable
CREATE TABLE "strength_workout_results" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "week" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "strength_workout_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "strength_workout_results" ADD CONSTRAINT "strength_workout_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strength_workout_results" ADD CONSTRAINT "strength_workout_results_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
