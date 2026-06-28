import { IReviewRepository } from '../../domain/review/repositories/IReviewRepository';

export class GetUserReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(reviewedId: number) {
    return this.reviewRepository.findByReviewedUser(reviewedId);
  }
}
