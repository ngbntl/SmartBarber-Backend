import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateServiceIdType1709910000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng services mới với id kiểu string
    await queryRunner.query(`
      CREATE TABLE services_new (
        id VARCHAR(26) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Copy dữ liệu từ bảng cũ sang bảng mới
    await queryRunner.query(`
      INSERT INTO services_new (id, name, description, price, duration, isActive, createdAt, updatedAt)
      SELECT 
        CONCAT('SVC', LPAD(id, 23, '0')),
        name,
        description,
        price,
        duration,
        isActive,
        createdAt,
        updatedAt
      FROM services
    `);

    // Xóa bảng appointments cũ
    await queryRunner.query(`DROP TABLE IF EXISTS appointments`);

    // Tạo lại bảng appointments với serviceId kiểu string
    await queryRunner.query(`
      CREATE TABLE appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId VARCHAR(26) NOT NULL,
        serviceId VARCHAR(26) NOT NULL,
        appointmentDate DATETIME NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id),
        FOREIGN KEY (serviceId) REFERENCES services_new(id)
      )
    `);

    // Xóa bảng services cũ
    await queryRunner.query(`DROP TABLE services`);

    // Đổi tên bảng services_new thành services
    await queryRunner.query(`RENAME TABLE services_new TO services`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng services cũ với id kiểu number
    await queryRunner.query(`
      CREATE TABLE services_old (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Copy dữ liệu từ bảng mới sang bảng cũ
    await queryRunner.query(`
      INSERT INTO services_old (name, description, price, duration, isActive, createdAt, updatedAt)
      SELECT 
        name,
        description,
        price,
        duration,
        isActive,
        createdAt,
        updatedAt
      FROM services
    `);

    // Xóa bảng appointments
    await queryRunner.query(`DROP TABLE IF EXISTS appointments`);

    // Tạo lại bảng appointments với serviceId kiểu number
    await queryRunner.query(`
      CREATE TABLE appointments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId VARCHAR(26) NOT NULL,
        serviceId INT NOT NULL,
        appointmentDate DATETIME NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES Users(id),
        FOREIGN KEY (serviceId) REFERENCES services_old(id)
      )
    `);

    // Xóa bảng services mới
    await queryRunner.query(`DROP TABLE services`);

    // Đổi tên bảng services_old thành services
    await queryRunner.query(`RENAME TABLE services_old TO services`);
  }
}
