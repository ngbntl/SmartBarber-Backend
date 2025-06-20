// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class AddInProgressStatus1735168000000 implements MigrationInterface {
//   public async up(queryRunner: QueryRunner): Promise<void> {
//     // Modify the Status enum column in appointments table to include 'in-progress'
//     await queryRunner.query(`
//       ALTER TABLE appointments
//       MODIFY COLUMN Status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'in-progress')
//       DEFAULT 'pending';
//     `);
//   }

//   public async down(queryRunner: QueryRunner): Promise<void> {
//     // Revert back to original enum without 'in-progress'
//     // First convert any appointments with 'in-progress' status back to 'confirmed'
//     await queryRunner.query(`
//       UPDATE appointments
//       SET Status = 'confirmed'
//       WHERE Status = 'in-progress';
//     `);

//     // Then modify the column back to original enum
//     await queryRunner.query(`
//       ALTER TABLE appointments
//       MODIFY COLUMN Status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show')
//       DEFAULT 'pending';
//     `);
//   }
// }
