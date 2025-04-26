import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppointmentTables1709910000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng services
    await queryRunner.query(`
      CREATE TABLE services (
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

    // Tạo bảng time_slots
    await queryRunner.query(`
      CREATE TABLE time_slots (
        id INT PRIMARY KEY AUTO_INCREMENT,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        isAvailable BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tạo bảng appointments
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
        FOREIGN KEY (serviceId) REFERENCES services(id)
      )
    `);

    // Thêm dữ liệu mẫu cho bảng time_slots
    await queryRunner.query(`
      INSERT INTO time_slots (startTime, endTime) VALUES
      ('09:00:00', '10:00:00'),
      ('10:00:00', '11:00:00'),
      ('11:00:00', '12:00:00'),
      ('14:00:00', '15:00:00'),
      ('15:00:00', '16:00:00'),
      ('16:00:00', '17:00:00')
    `);

    // Thêm dữ liệu mẫu cho bảng services
    await queryRunner.query(`
      INSERT INTO services (name, description, price, duration) VALUES
      ('Cắt tóc nam', 'Cắt tóc nam cơ bản', 50000, 30),
      ('Cắt tóc nam cao cấp', 'Cắt tóc nam với các kỹ thuật cao cấp', 80000, 45),
      ('Uốn tóc', 'Uốn tóc với các kỹ thuật hiện đại', 150000, 120),
      ('Nhuộm tóc', 'Nhuộm tóc với các màu sắc đa dạng', 200000, 120)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS appointments`);
    await queryRunner.query(`DROP TABLE IF EXISTS time_slots`);
    await queryRunner.query(`DROP TABLE IF EXISTS services`);
  }
}
