import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTable1763554780504 implements MigrationInterface {
  name = 'CreateEventsTable1763554780504';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the events table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "event_date" TIMESTAMP NOT NULL,
        "status" character varying NOT NULL DEFAULT 'future',
        "exercise_type" character varying,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_40731c7151fe4be3111c072f9bf" PRIMARY KEY ("id")
      )
    `);

    // Create foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "events"
      ADD CONSTRAINT "FK_49a59b85d0c5d7d9d3e5f8b8b9d"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    // Create enum type for status if it doesn't exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'events_status_enum') THEN
          CREATE TYPE "public"."events_status_enum" AS ENUM('past', 'future');
        END IF;
      END
      $$;
    `);

    // Apply the enum type to the status column
    await queryRunner.query(`
      ALTER TABLE "events"
      ALTER COLUMN "status" TYPE "public"."events_status_enum"
      USING "status"::"public"."events_status_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "events" DROP CONSTRAINT "FK_49a59b85d0c5d7d9d3e5f8b8b9d"
    `);

    // Drop the events table
    await queryRunner.query(`
      DROP TABLE IF EXISTS "events"
    `);

    // Drop the enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS "public"."events_status_enum"
    `);
  }
}