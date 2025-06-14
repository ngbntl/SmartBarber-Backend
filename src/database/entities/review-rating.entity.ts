import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Review } from './review.entity';
import { BaseTimestamp } from './base-timestamp';

@Entity('review_ratings')
export class ReviewRating extends BaseTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reviewId: string;

  @ManyToOne(() => Review, (review) => review.ratings)
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @Column({
    name: 'ratingCategory',
    type: 'enum',
    enum: ['overall', 'cleanliness', 'value', 'service'],
  })
  ratingCategory: 'overall' | 'cleanliness' | 'value' | 'service';

  @Column({ name: 'score', type: 'int' })
  score: number;
}
