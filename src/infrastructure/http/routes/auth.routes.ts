import { Router, Request, Response, NextFunction } from 'express';
import { PostgresUserRepository } from '../../database/repositories/PostgresUserRepository';
import { CreateUserUseCase } from '../../../application/user/CreateUser.usecase';
import { LoginUserUseCase } from '../../../application/user/LoginUser.usecase';
import { GetUserProfileUseCase } from '../../../application/user/GetUserProfile.usecase';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const repo = new PostgresUserRepository();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await new CreateUserUseCase(repo).execute(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (e) { next(e); }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await new LoginUserUseCase(repo).execute(req.body);
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await new GetUserProfileUseCase(repo).execute(req.userId!);
    res.json({ success: true, user });
  } catch (e) { next(e); }
});

export default router;
