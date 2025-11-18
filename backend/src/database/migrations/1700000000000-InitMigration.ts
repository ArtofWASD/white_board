/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitMigration1700000000000 implements MigrationInterface {
  name = 'InitMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if enum exists before creating it
    const enumExistsResult = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') as exists;`,
    );

    if (!enumExistsResult[0].exists) {
      await queryRunner.query(
        `CREATE TYPE "public"."users_role_enum" AS ENUM('trainer', 'athlete')`,
      );
    }

    // Check if table exists before creating it
    const tableExistsResult = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') as exists;`,
    );

    if (!tableExistsResult[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'athlete', "height" integer, "weight" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists before dropping it
    const tableExistsResult = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') as exists;`,
    );

    if (tableExistsResult[0].exists) {
      await queryRunner.query(`DROP TABLE "users"`);
    }

    // Check if enum exists before dropping it
    const enumExistsResult = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') as exists;`,
    );

    if (enumExistsResult[0].exists) {
      await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
  }
}