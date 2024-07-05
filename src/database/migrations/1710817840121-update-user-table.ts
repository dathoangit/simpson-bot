import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateUserTable1710817840121 implements MigrationInterface {
  name = 'UpdateUserTable1710817840121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "wallet" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "wallet"`);
  }
}
