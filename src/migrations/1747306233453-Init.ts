import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747306233453 implements MigrationInterface {
    name = 'Init1747306233453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "retailprice" TO "retailPrice"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "retailPrice" TO "retailprice"`);
    }

}
