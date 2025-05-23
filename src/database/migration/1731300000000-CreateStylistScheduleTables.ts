// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class AddTimestampsToStylistSchedules1731400000000
//   implements MigrationInterface
// {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(`
//       ALTER TABLE stylist_schedules 
//       ADD COLUMN CreateAt BIGINT NULL DEFAULT NULL,
//       ADD COLUMN UpdateAt BIGINT NULL DEFAULT NULL,
//       ADD COLUMN DeleteAt BIGINT NULL DEFAULT NULL
//     `);
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(`
//       ALTER TABLE stylist_schedules 
//       DROP COLUMN CreateAt,
//       DROP COLUMN UpdateAt,
//       DROP COLUMN DeleteAt
//     `);
//   }
// }
