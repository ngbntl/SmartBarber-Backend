import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneNumberToUsers1732000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if PhoneNumber column exists before adding it
    const hasPhoneNumber = await queryRunner.hasColumn('Users', 'PhoneNumber');
    
    if (!hasPhoneNumber) {
      await queryRunner.query(
        `ALTER TABLE Users ADD COLUMN PhoneNumber VARCHAR(32) NULL`,
      );
      console.log('Added PhoneNumber column to Users table');
    } else {
      console.log('PhoneNumber column already exists in Users table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if PhoneNumber column exists before dropping it
    const hasPhoneNumber = await queryRunner.hasColumn('Users', 'PhoneNumber');
    
    if (hasPhoneNumber) {
      await queryRunner.query(`ALTER TABLE Users DROP COLUMN PhoneNumber`);
      console.log('Dropped PhoneNumber column from Users table');
    }
  }
}