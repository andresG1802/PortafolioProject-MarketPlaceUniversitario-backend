import { pool } from '../connection';
import { IReviewRepository } from '../../../domain/review/repositories/IReviewRepository';
import { Review } from '../../../domain/review/entities/Review';

export class PostgresReviewRepository implements IReviewRepository {
  async findByReviewedUser(reviewedId: number): Promise<Review[]> {
    const { rows } = await pool.query(
      `SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
       FROM reviews r JOIN users u ON u.id = r.reviewer_id
       WHERE r.reviewed_id = $1 ORDER BY r.created_at DESC`,
      [reviewedId]
    );
    return rows.map((row) => this.toEntity(row));
  }

  async findByReviewerAndProduct(reviewerId: number, productId: number): Promise<Review | null> {
    const { rows } = await pool.query(
      'SELECT * FROM reviews WHERE reviewer_id = $1 AND product_id = $2',
      [reviewerId, productId]
    );
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async save(review: Review): Promise<Review> {
    const { rows } = await pool.query(
      `INSERT INTO reviews (reviewer_id, reviewed_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [review.reviewerId, review.reviewedId, review.productId, review.rating, review.comment]
    );
    return this.toEntity(rows[0]);
  }

  private toEntity(row: Record<string, unknown>): Review {
    const r = new Review({
      id: row.id as number,
      reviewerId: row.reviewer_id as number,
      reviewedId: row.reviewed_id as number,
      productId: row.product_id as number | null,
      rating: row.rating as number,
      comment: row.comment as string | null,
      createdAt: row.created_at as Date,
    });
    (r as unknown as Record<string, unknown>).reviewerName = row.reviewer_name;
    (r as unknown as Record<string, unknown>).reviewerAvatar = row.reviewer_avatar;
    return r;
  }
}
