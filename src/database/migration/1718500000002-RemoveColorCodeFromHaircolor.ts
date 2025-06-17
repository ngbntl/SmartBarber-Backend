import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveColorCodeFromHaircolor1718500000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem cột còn tồn tại không trước khi xóa
    const table = await queryRunner.getTable('haircolors');
    
    if (table && table.findColumnByName('colorCode')) {
      await queryRunner.query('ALTER TABLE haircolors DROP COLUMN colorCode');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Khôi phục lại cột đã xóa
    await queryRunner.query('ALTER TABLE haircolors ADD COLUMN IF NOT EXISTS colorCode VARCHAR(255) NULL');
  }
}