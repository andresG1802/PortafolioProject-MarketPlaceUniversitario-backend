import { Router, Response, NextFunction } from 'express';
import { PostgresFavoriteRepository } from '../../database/repositories/PostgresFavoriteRepository';
import { ToggleFavoriteUseCase } from '../../../application/favorite/ToggleFavorite.usecase';
import { GetFavoritesUseCase } from '../../../application/favorite/GetFavorites.usecase';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const repo = new PostgresFavoriteRepository();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const favorites = await new GetFavoritesUseCase(repo).execute(req.userId!);
    res.json({ success: true, favorites });
  } catch (e) { next(e); }
});

router.post('/:productId/toggle', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await new ToggleFavoriteUseCase(repo).execute(req.userId!, Number(req.params.productId));
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
});

export default router;
