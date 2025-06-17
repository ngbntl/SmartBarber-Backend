import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyHaircolorTable1718500000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem các cột còn tồn tại không trước khi xóa
    const table = await queryRunner.getTable('haircolors');
    
    if (table) {
      // Xóa các cột không cần thiết
      if (table.findColumnByName('description')) {
        await queryRunner.query('ALTER TABLE haircolors DROP COLUMN description');
      }
      
      if (table.findColumnByName('isActive')) {
        await queryRunner.query('ALTER TABLE haircolors DROP COLUMN isActive');
      }
      
      if (table.findColumnByName('brand')) {
        await queryRunner.query('ALTER TABLE haircolors DROP COLUMN brand');
      }
      
      // Đảm bảo các cột cần thiết vẫn tồn tại hoặc được tạo
      if (!table.findColumnByName('created_at')) {
        await queryRunner.query('ALTER TABLE haircolors ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      }
      
      if (!table.findColumnByName('updated_at')) {
        await queryRunner.query('ALTER TABLE haircolors ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Khôi phục lại các cột đã xóa
    await queryRunner.query('ALTER TABLE haircolors ADD COLUMN IF NOT EXISTS description TEXT NULL');
    await queryRunner.query('ALTER TABLE haircolors ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE');
    await queryRunner.query('ALTER TABLE haircolors ADD COLUMN IF NOT EXISTS brand VARCHAR(255) NULL');
  }
}