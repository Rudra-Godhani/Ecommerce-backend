import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747305877754 implements MigrationInterface {
    name = 'Init1747305877754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "retailPrice" TO "retailprice"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "retailprice" TO "retailPrice"`);
    }

}
