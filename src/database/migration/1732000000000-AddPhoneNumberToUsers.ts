import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHairstyleHaircolorTables1732550000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem bảng đã tồn tại chưa
    const hairstylesExists = await queryRunner.hasTable('hairstyles');
    const haircolorsExists = await queryRunner.hasTable('haircolors');

    if (!hairstylesExists) {
      await queryRunner.query(`
        CREATE TABLE hairstyles (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          imageUrl VARCHAR(255) NOT NULL,
          isActive BOOLEAN DEFAULT TRUE,
          category VARCHAR(100),
          tags TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    }

    if (!haircolorsExists) {
      await queryRunner.query(`
        CREATE TABLE haircolors (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          colorCode VARCHAR(50) NOT NULL,
          description TEXT,
          imageUrl VARCHAR(255) NOT NULL,
          isActive BOOLEAN DEFAULT TRUE,
          brand VARCHAR(100),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS haircolors`);
    await queryRunner.query(`DROP TABLE IF EXISTS hairstyles`);
  }
}