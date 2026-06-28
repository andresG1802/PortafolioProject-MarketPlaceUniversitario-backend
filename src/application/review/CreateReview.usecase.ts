import { IReviewRepository } from '../../domain/review/repositories/IReviewRepository';
import { Review } from '../../domain/review/entities/Review';
import { ConflictError, DomainError } from '../../shared/errors/AppError';

export interface CreateReviewDTO {
  reviewerId: number;
  reviewedId: number;
  productId: number;
  rating: number;
  comment?: string;
}

export class CreateReviewUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(dto: CreateReviewDTO): Promise<Review> {
    if (dto.reviewerId === dto.reviewedId) {
      throw new DomainError('No puedes calificarte a ti mismo');
    }
    const existing = await this.reviewRepository.findByReviewerAndProduct(dto.reviewerId, dto.productId);
    if (existing) throw new ConflictError('Ya calificaste esta transacción');

    const review = new Review(dto);
    return this.reviewRepository.save(review);
  }
}
