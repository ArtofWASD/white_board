import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHeightWeightToUsers1763647109609 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем колонку height, если её нет
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "height" integer
    `);

    // Добавляем колонку weight, если её нет
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "weight" integer
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем колонку weight, если она существует
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "weight"
    `);

    // Удаляем колонку height, если она существует
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "height"
    `);
  }
}
