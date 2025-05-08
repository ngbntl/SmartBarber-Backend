import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeDatabase1730548000000 implements MigrationInterface {
  name = 'OptimizeDatabase1730548000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Thay đổi cấu trúc bảng appointments
    // 1.1 Sao lưu dữ liệu từ bảng hiện tại để khôi phục sau khi thay đổi cấu trúc
    await queryRunner.query(
      `CREATE TEMPORARY TABLE appointments_backup AS SELECT * FROM appointments`,
    );

    // 1.2 Chuyển ID của appointment từ số tự tăng thành UUID
    await queryRunner.query(`ALTER TABLE appointments DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE appointments MODIFY id varchar(36) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE appointments ADD PRIMARY KEY (id)`);

    // 1.3 Thêm cột DurationMinutes vào bảng appointments
    await queryRunner.query(
      `ALTER TABLE appointments ADD COLUMN DurationMinutes int NOT NULL DEFAULT 30 AFTER StartTime`,
    );

    // 1.4 Cập nhật DurationMinutes dựa trên EndTime - StartTime (nếu có dữ liệu)
    await queryRunner.query(`
      UPDATE appointments 
      SET DurationMinutes = 
        TIME_TO_SEC(TIMEDIFF(EndTime, StartTime)) / 60
      WHERE EndTime IS NOT NULL AND StartTime IS NOT NULL
    `);

    // 1.5 Xóa cột EndTime sau khi đã chuyển đổi dữ liệu
    await queryRunner.query(`ALTER TABLE appointments DROP COLUMN EndTime`);

    // 2. Thay đổi cấu trúc bảng time_slots
    await queryRunner.query(`ALTER TABLE time_slots DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE time_slots MODIFY id varchar(36) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE time_slots ADD PRIMARY KEY (id)`);

    // 3. Thêm UUID trigger để tự động thêm UUID cho các bản ghi mới
    await queryRunner.query(`
      CREATE TRIGGER before_insert_appointments 
      BEFORE INSERT ON appointments 
      FOR EACH ROW 
      BEGIN
        IF NEW.id IS NULL OR NEW.id = '' THEN 
          SET NEW.id = UUID();
        END IF; 
      END
    `);

    await queryRunner.query(`
      CREATE TRIGGER before_insert_time_slots 
      BEFORE INSERT ON time_slots 
      FOR EACH ROW 
      BEGIN
        IF NEW.id IS NULL OR NEW.id = '' THEN 
          SET NEW.id = UUID();
        END IF; 
      END
    `);

    // 4. Tạo bảng review_ratings mới
    await queryRunner.query(`
      CREATE TABLE review_ratings (
        CreateAt bigint DEFAULT NULL,
        UpdateAt bigint DEFAULT NULL,
        DeleteAt bigint DEFAULT NULL,
        id varchar(36) NOT NULL,
        reviewId varchar(36) NOT NULL,
        ratingCategory enum('overall','cleanliness','value','service') NOT NULL,
        score int NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (reviewId) REFERENCES reviews (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // 5. Cập nhật các tham chiếu từ reviews đến bảng users thay vì stylists
    // 5.1 Di chuyển dữ liệu từ bảng stylists vào bảng users
    await queryRunner.query(`
      INSERT INTO users (id, FirstName, LastName, Avatar, Bio, Specialization, 
                        ExperienceYears, Rating, RatingCount, IsActive, BranchId,
                        CreateAt, UpdateAt, DeleteAt, RoleType)
      SELECT id, firstName, lastName, avatar, bio, specialization, 
             experienceYears, rating, ratingCount, isActive, branchId,
             CreateAt, UpdateAt, DeleteAt, 'sys_stylist'
      FROM stylists s
      WHERE NOT EXISTS (
        SELECT 1 FROM users u WHERE u.id = s.id
      )
    `);

    // 5.2 Cập nhật liên kết của bảng review từ stylists đến users
    // Kiểm tra xem foreign key có tồn tại không trước khi drop
    await queryRunner
      .query(
        `
      SELECT 1
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE() AND
            CONSTRAINT_NAME = 'FK_d340d6a7a8a9f9620598cf3806c' AND
            TABLE_NAME = 'reviews'
    `,
      )
      .then(async (result) => {
        if (result && result.length > 0) {
          await queryRunner.query(`
          ALTER TABLE reviews 
          DROP FOREIGN KEY FK_d340d6a7a8a9f9620598cf3806c
        `);
        }
      });

    // Chuyển mối quan hệ sang bảng users
    await queryRunner.query(`
      ALTER TABLE reviews 
      ADD CONSTRAINT FK_stylist_user_id 
      FOREIGN KEY (stylistId) REFERENCES users (id)
      ON DELETE SET NULL ON UPDATE CASCADE
    `);

    // 5.3 Xóa bảng stylists sau khi đã di chuyển dữ liệu
    await queryRunner.query(`DROP TABLE IF EXISTS stylists`);

    // 6. Tạo các chỉ mục (index) cho hiệu suất truy vấn
    await queryRunner.query(
      `CREATE INDEX idx_appointments_date ON appointments(AppointmentDate)`,
    );
    await queryRunner.query(`CREATE INDEX idx_users_email ON users(Email)`);
    await queryRunner.query(
      `CREATE INDEX idx_services_active ON services(IsActive, Price)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_appointments_status ON appointments(Status)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_promotions_active_dates ON promotions(isActive, startDate, endDate)`,
    );

    // 7. Thêm trigger cho việc xóa mềm
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS before_users_delete
    `);

    await queryRunner.query(`
      CREATE TRIGGER before_users_delete
      BEFORE DELETE ON users
      FOR EACH ROW
      BEGIN
          IF OLD.DeleteAt IS NULL THEN
              SIGNAL SQLSTATE '45000' 
              SET MESSAGE_TEXT = 'Sử dụng xóa mềm bằng cách cập nhật DeleteAt';
          END IF;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 7. Xóa trigger
    await queryRunner.query(`DROP TRIGGER IF EXISTS before_users_delete`);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS before_insert_appointments`,
    );
    await queryRunner.query(`DROP TRIGGER IF EXISTS before_insert_time_slots`);

    // 6. Xóa các chỉ mục
    await queryRunner.query(`DROP INDEX idx_appointments_date ON appointments`);
    await queryRunner.query(`DROP INDEX idx_users_email ON users`);
    await queryRunner.query(`DROP INDEX idx_services_active ON services`);
    await queryRunner.query(
      `DROP INDEX idx_appointments_status ON appointments`,
    );
    await queryRunner.query(
      `DROP INDEX idx_promotions_active_dates ON promotions`,
    );

    // 5.3 Tạo lại bảng stylists nếu cần thiết
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS stylists (
        CreateAt bigint DEFAULT NULL,
        UpdateAt bigint DEFAULT NULL,
        DeleteAt bigint DEFAULT NULL,
        id varchar(36) NOT NULL,
        firstName varchar(255) NOT NULL,
        lastName varchar(255) NOT NULL,
        avatar varchar(255) DEFAULT NULL,
        bio text,
        specialization varchar(255) DEFAULT NULL,
        experienceYears int NOT NULL DEFAULT '0',
        rating decimal(3,2) NOT NULL DEFAULT '0.00',
        ratingCount int NOT NULL DEFAULT '0',
        isActive tinyint NOT NULL DEFAULT '1',
        branchId varchar(255) DEFAULT NULL,
        PRIMARY KEY (id),
        CONSTRAINT FK_70a8f079befdffa133b1c25ba1d FOREIGN KEY (branchId) REFERENCES branches (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    // 5.2 Copy stylists from users table back to stylists table
    await queryRunner.query(`
      INSERT INTO stylists (id, firstName, lastName, avatar, bio, specialization,
                           experienceYears, rating, ratingCount, isActive, branchId,
                           CreateAt, UpdateAt, DeleteAt)
      SELECT id, FirstName, LastName, Avatar, Bio, Specialization,
             ExperienceYears, Rating, RatingCount, IsActive, BranchId,
             CreateAt, UpdateAt, DeleteAt
      FROM users
      WHERE RoleType = 'sys_stylist' AND
            NOT EXISTS (SELECT 1 FROM stylists s WHERE s.id = users.id)
    `);

    // 5.1 Revert reviews table foreign key to reference stylists again
    await queryRunner.query(
      `ALTER TABLE reviews DROP FOREIGN KEY FK_stylist_user_id`,
    );
    await queryRunner.query(`
      ALTER TABLE reviews 
      ADD CONSTRAINT FK_d340d6a7a8a9f9620598cf3806c
      FOREIGN KEY (stylistId) REFERENCES stylists (id)
    `);

    // 4. Xóa bảng review_ratings
    await queryRunner.query(`DROP TABLE IF EXISTS review_ratings`);

    // 2 & 3. Khôi phục cấu trúc cũ của bảng time_slots và appointments
    // Khôi phục bảng time_slots
    await queryRunner.query(`ALTER TABLE time_slots DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE time_slots MODIFY id int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE time_slots ADD PRIMARY KEY (id)`);

    // Khôi phục bảng appointments
    await queryRunner.query(
      `ALTER TABLE appointments ADD COLUMN EndTime time NULL AFTER StartTime`,
    );

    // Khôi phục dữ liệu cho EndTime từ DurationMinutes
    await queryRunner.query(`
      UPDATE appointments 
      SET EndTime = ADDTIME(StartTime, SEC_TO_TIME(DurationMinutes * 60))
      WHERE StartTime IS NOT NULL AND DurationMinutes IS NOT NULL
    `);

    // Xóa DurationMinutes sau khi đã chuyển đổi dữ liệu
    await queryRunner.query(
      `ALTER TABLE appointments DROP COLUMN DurationMinutes`,
    );

    // Khôi phục trường ID của appointment
    await queryRunner.query(`ALTER TABLE appointments DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE appointments MODIFY id int NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE appointments ADD PRIMARY KEY (id)`);

    // Khôi phục dữ liệu từ bảng backup
    await queryRunner.query(
      `DROP TEMPORARY TABLE IF EXISTS appointments_backup`,
    );
  }
}
