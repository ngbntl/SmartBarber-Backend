// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class AddTimestampsToTimeSlotTemplates1734225854000
//   implements MigrationInterface
// {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(`
//       ALTER TABLE time_slot_templates
//       ADD COLUMN created_at BIGINT NOT NULL DEFAULT UNIX_TIMESTAMP() * 1000,
//       ADD COLUMN updated_at BIGINT NULL,
//       ADD COLUMN deleted_at BIGINT NULL
//     `);
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     await queryRunner.query(`
//       ALTER TABLE time_slot_templates
//       DROP COLUMN created_at,
//       DROP COLUMN updated_at,
//       DROP COLUMN deleted_at
//     `);
//   }
// }
