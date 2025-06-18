import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveReviewRatingTable1718700000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Xóa bảng review_ratings
    await queryRunner.query(`DROP TABLE IF EXISTS review_ratings`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Tạo lại bảng review_ratings nếu cần rollback
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS review_ratings (
        id varchar(36) NOT NULL,
        reviewId varchar(36) NOT NULL,
        ratingCategory enum('overall', 'cleanliness', 'value', 'service') NOT NULL,
        score int NOT NULL,
        createdAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        KEY FK_review_ratings_reviewId (reviewId),
        CONSTRAINT FK_review_ratings_reviewId FOREIGN KEY (reviewId) REFERENCES reviews (id) ON DELETE CASCADE
      )
    `);
  }
}
