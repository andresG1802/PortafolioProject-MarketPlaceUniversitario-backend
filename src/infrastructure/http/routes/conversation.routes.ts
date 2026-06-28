import { Router, Response, NextFunction } from 'express';
import { PostgresConversationRepository } from '../../database/repositories/PostgresConversationRepository';
import { GetOrCreateConversationUseCase } from '../../../application/conversation/GetOrCreateConversation.usecase';
import { GetConversationsUseCase } from '../../../application/conversation/GetConversations.usecase';
import { SendMessageUseCase } from '../../../application/conversation/SendMessage.usecase';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const repo = new PostgresConversationRepository();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const conversations = await new GetConversationsUseCase(repo).execute(req.userId!);
    res.json({ success: true, conversations });
  } catch (e) { next(e); }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const conversation = await new GetOrCreateConversationUseCase(repo).execute({
      productId: Number(req.body.productId),
      buyerId: req.userId!,
      sellerId: Number(req.body.sellerId),
    });
    res.status(201).json({ success: true, conversation });
  } catch (e) { next(e); }
});

router.get('/:id/messages', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await repo.findMessages(Number(req.params.id));
    await repo.markMessagesAsRead(Number(req.params.id), req.userId!);
    res.json({ success: true, messages });
  } catch (e) { next(e); }
});

router.post('/:id/messages', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const message = await new SendMessageUseCase(repo).execute({
      conversationId: Number(req.params.id),
      senderId: req.userId!,
      content: req.body.content,
    });
    res.status(201).json({ success: true, message });
  } catch (e) { next(e); }
});

export default router;
