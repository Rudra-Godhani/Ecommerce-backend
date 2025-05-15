import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747305430983 implements MigrationInterface {
    name = 'Init1747305430983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "consumed_session" RENAME COLUMN "sessionId" TO "sessionid"`);
        await queryRunner.query(`ALTER TABLE "consumed_session" RENAME CONSTRAINT "UQ_b9a4884b47ee6865ddc199ca58f" TO "UQ_a8bf1cf235ef5e305d819271e7b"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "consumed_session" RENAME CONSTRAINT "UQ_a8bf1cf235ef5e305d819271e7b" TO "UQ_b9a4884b47ee6865ddc199ca58f"`);
        await queryRunner.query(`ALTER TABLE "consumed_session" RENAME COLUMN "sessionid" TO "sessionId"`);
    }

}
