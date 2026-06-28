import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import userRoutes from './routes/user.routes';
import reviewRoutes from './routes/review.routes';
import conversationRoutes from './routes/conversation.routes';
import favoriteRoutes from './routes/favorite.routes';
import { errorMiddleware } from './middlewares/error.middleware';

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/conversations', conversationRoutes);
  app.use('/api/favorites', favoriteRoutes);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

  app.use(errorMiddleware);

  return app;
};
