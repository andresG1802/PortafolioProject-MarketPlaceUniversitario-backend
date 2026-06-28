import { Router, Response, NextFunction } from 'express';
import { PostgresReviewRepository } from '../../database/repositories/PostgresReviewRepository';
import { CreateReviewUseCase } from '../../../application/review/CreateReview.usecase';
import { GetUserReviewsUseCase } from '../../../application/review/GetUserReviews.usecase';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const repo = new PostgresReviewRepository();

router.get('/user/:userId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reviews = await new GetUserReviewsUseCase(repo).execute(Number(req.params.userId));
    res.json({ success: true, reviews });
  } catch (e) { next(e); }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await new CreateReviewUseCase(repo).execute({
      ...req.body,
      reviewerId: req.userId!,
      rating: Number(req.body.rating),
    });
    res.status(201).json({ success: true, review });
  } catch (e) { next(e); }
});

export default router;
