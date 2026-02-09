-- AlterTable
ALTER TABLE "users" ADD COLUMN     "consent_accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consent_accepted_at" TIMESTAMP(3),
ADD COLUMN     "consent_version" TEXT,
ADD COLUMN     "privacy_accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "privacy_accepted_at" TIMESTAMP(3),
ADD COLUMN     "privacy_version" TEXT,
ADD COLUMN     "registration_ip" TEXT,
ADD COLUMN     "terms_accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "terms_accepted_at" TIMESTAMP(3),
ADD COLUMN     "terms_version" TEXT;
