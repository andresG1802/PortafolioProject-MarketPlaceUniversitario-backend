import { Server } from 'socket.io';
import { verifyToken } from '../../shared/utils/jwt.util';
import { PostgresConversationRepository } from '../database/repositories/PostgresConversationRepository';
import { SendMessageUseCase } from '../../application/conversation/SendMessage.usecase';

export const setupSocket = (io: Server): void => {
  const repo = new PostgresConversationRepository();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as number;
    console.log(`[Socket] User ${userId} connected`);

    socket.on('join:conversation', (conversationId: number) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave:conversation', (conversationId: number) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('message:send', async (data: { conversationId: number; content: string }) => {
      try {
        const useCase = new SendMessageUseCase(repo);
        const message = await useCase.execute({
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
        });
        io.to(`conversation:${data.conversationId}`).emit('message:new', message);
      } catch (err) {
        socket.emit('error', { message: (err as Error).message });
      }
    });

    socket.on('typing:start', (conversationId: number) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { userId });
    });

    socket.on('typing:stop', (conversationId: number) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} disconnected`);
    });
  });
};
