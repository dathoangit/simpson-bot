import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddColumnCommission1710907220435 implements MigrationInterface {
  name = 'AddColumnCommission1710907220435';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "commission" character varying DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "commission"`);
  }
}
