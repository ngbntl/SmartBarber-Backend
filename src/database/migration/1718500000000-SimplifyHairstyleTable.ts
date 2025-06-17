import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyHairstyleTable1718500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem các cột còn tồn tại không trước khi xóa
    const table = await queryRunner.getTable('hairstyles');
    
    if (table) {
      // Xóa các cột không cần thiết
      if (table.findColumnByName('description')) {
        await queryRunner.query('ALTER TABLE hairstyles DROP COLUMN description');
      }
      
      if (table.findColumnByName('isActive')) {
        await queryRunner.query('ALTER TABLE hairstyles DROP COLUMN isActive');
      }
      
      if (table.findColumnByName('category')) {
        await queryRunner.query('ALTER TABLE hairstyles DROP COLUMN category');
      }
      
      if (table.findColumnByName('tags')) {
        await queryRunner.query('ALTER TABLE hairstyles DROP COLUMN tags');
      }
      
      // Đảm bảo các cột cần thiết vẫn tồn tại hoặc được tạo
      if (!table.findColumnByName('created_at')) {
        await queryRunner.query('ALTER TABLE hairstyles ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      }
      
      if (!table.findColumnByName('updated_at')) {
        await queryRunner.query('ALTER TABLE hairstyles ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Khôi phục lại các cột đã xóa
    await queryRunner.query('ALTER TABLE hairstyles ADD COLUMN IF NOT EXISTS description TEXT NULL');
    await queryRunner.query('ALTER TABLE hairstyles ADD COLUMN IF NOT EXISTS isActive BOOLEAN DEFAULT TRUE');
    await queryRunner.query('ALTER TABLE hairstyles ADD COLUMN IF NOT EXISTS category VARCHAR(255) NULL');
    await queryRunner.query('ALTER TABLE hairstyles ADD COLUMN IF NOT EXISTS tags TEXT NULL');
  }
}