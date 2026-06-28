import { Review } from '../entities/Review';

export interface IReviewRepository {
  findByReviewedUser(reviewedId: number): Promise<Review[]>;
  findByReviewerAndProduct(reviewerId: number, productId: number): Promise<Review | null>;
  save(review: Review): Promise<Review>;
}
