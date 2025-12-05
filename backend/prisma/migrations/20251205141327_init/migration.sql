-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dashboard_layout" TEXT[] DEFAULT ARRAY['exercise-tracker', 'weight-tracker', 'recent-activities']::TEXT[],
ADD COLUMN     "dashboard_layout_mode" TEXT NOT NULL DEFAULT 'asymmetric';
