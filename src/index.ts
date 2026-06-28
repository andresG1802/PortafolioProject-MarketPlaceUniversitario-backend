import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './infrastructure/http/server';
import { connectDB } from './infrastructure/database/connection';
import { setupSocket } from './infrastructure/socket/chat.socket';

const PORT = process.env.PORT ?? 4000;

const bootstrap = async () => {
  await connectDB();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
      credentials: true,
    },
  });

  setupSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📦 API available at http://localhost:${PORT}/api`);
  });
};

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
