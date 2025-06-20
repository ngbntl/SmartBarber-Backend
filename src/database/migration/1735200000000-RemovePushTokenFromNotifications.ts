import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePushTokenFromNotifications1735200000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem cột có tồn tại không trước khi xóa
    const tableColumns = await queryRunner.query(
      `SHOW COLUMNS FROM notifications WHERE Field = 'pushToken'`,
    );
    
    if (tableColumns.length > 0) {
      // Xóa cột pushToken nếu nó tồn tại
      await queryRunner.query(
        `ALTER TABLE notifications DROP COLUMN pushToken`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Thêm lại cột pushToken nếu cần rollback
    await queryRunner.query(
      `ALTER TABLE notifications ADD COLUMN pushToken varchar(255) NULL`,
    );
  }
}