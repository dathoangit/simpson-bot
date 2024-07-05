/* eslint-disable max-len */
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateTableUsersReferrals1710737504498
  implements MigrationInterface
{
  name = 'CreateTableUsersReferrals1710737504498';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "referrals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "referral" character varying, "user_id" uuid, CONSTRAINT "PK_ea9980e34f738b6252817326c08" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "email" character varying, "chat_id" character varying NOT NULL, "is_join_channel" boolean, "is_join_community" boolean, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "referrals" ADD CONSTRAINT "FK_e50e512dfe4917ab32317cd40a1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "referrals" DROP CONSTRAINT "FK_e50e512dfe4917ab32317cd40a1"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "referrals"`);
  }
}
