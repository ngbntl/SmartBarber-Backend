import {MigrationInterface, QueryRunner} from "typeorm";

export class AddImageColumnToServices1745944050107 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE services ADD COLUMN image VARCHAR(255) NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE services DROP COLUMN image`
        );
    }

}
