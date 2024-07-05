import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddColumnWallet1710908683029 implements MigrationInterface {
  name = 'AddColumnWallet1710908683029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "wallet" SET DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "wallet" DROP DEFAULT`,
    );
  }
}
