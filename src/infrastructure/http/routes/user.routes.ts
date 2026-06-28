import { Router, Response, NextFunction } from 'express';
import { PostgresUserRepository } from '../../database/repositories/PostgresUserRepository';
import { GetUserProfileUseCase } from '../../../application/user/GetUserProfile.usecase';
import { UpdateUserProfileUseCase } from '../../../application/user/UpdateUserProfile.usecase';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
const repo = new PostgresUserRepository();

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await new GetUserProfileUseCase(repo).execute(Number(req.params.id));
    res.json({ success: true, user });
  } catch (e) { next(e); }
});

router.put('/me', authMiddleware, upload.single('avatar'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const user = await new UpdateUserProfileUseCase(repo).execute({
      userId: req.userId!,
      ...req.body,
      avatarUrl,
    });
    res.json({ success: true, user });
  } catch (e) { next(e); }
});

export default router;
