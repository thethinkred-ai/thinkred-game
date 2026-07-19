import './config/env';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { createServer } from 'http';
import { IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';

import { authRoutes } from './routes/auth';
import { gameRoutes } from './routes/game';
import { stepikRoutes } from './routes/stepik';
import { meRoutes } from './routes/me';
import { errorHandler } from './middleware/errorHandler';
import { attachUser } from './middleware/auth';
import { logger } from './utils/logger';
import { initDatabase, closeDatabase } from './database';
import { UserModel } from './models/UserModel';

async function main() {
  await initDatabase();
  logger.info('Database initialized');

  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const isProd = process.env.NODE_ENV === 'production';

  app.use(helmet());
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
  });
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/game', apiLimiter, attachUser, gameRoutes);
  app.use('/api/stepik', apiLimiter, attachUser, stepikRoutes);
  app.use('/api/me', apiLimiter, attachUser, meRoutes);

  const healthHandler = (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  app.get('/api/legal/privacy', (_req, res) => {
    res.json({
      summary: 'ThinkRed Economic Simulator обрабатывает минимум персональных данных.',
      collected: ['Stepik ID, имя, email (при OAuth)', 'игровой прогресс, предприятия, решения, достижения'],
      storage: 'OAuth-токены и JWT хранятся в HttpOnly cookie. JWT содержит только userId.',
      retention: 'Данные хранятся до удаления аккаунта. JWT действуют 7 дней.',
      rights: ['GET /api/me/export — экспорт данных', 'DELETE /api/me — удаление аккаунта'],
    });
  });

  app.use(errorHandler);

  const wsClients = new Map<WebSocket, { userId: number; role: string }>();

  function getTokenFromCookie(req: IncomingMessage): string | undefined {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return undefined;
    const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  function rejectWs(ws: WebSocket) {
    ws.close(1008, 'Unauthorized');
  }

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const token = getTokenFromCookie(req);
    const origin = req.headers.origin;
    const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
    if (!token) { rejectWs(ws); return; }
    try {
      const secret = process.env.JWT_SECRET || '';
      const decoded = jwt.verify(token, secret) as { userId: number };
      const userModel = new UserModel();
      const user = userModel.findById(decoded.userId);
      if (!user || !user.is_active) { rejectWs(ws); return; }
      if (isProd && origin !== allowedOrigin) { rejectWs(ws); return; }
      wsClients.set(ws, { userId: user.id, role: user.role || 'user' });
      logger.info(`WebSocket authenticated for user ${user.id}`);
    } catch {
      rejectWs(ws);
      return;
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        const session = wsClients.get(ws);
        if (!session) return;
        switch (data.type) {
          case 'game_update':
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === 1 && wsClients.has(client)) {
                client.send(JSON.stringify(data));
              }
            });
            break;
          case 'chat':
            wss.clients.forEach((client) => {
              if (client.readyState === 1) {
                client.send(JSON.stringify({
                  type: 'chat',
                  message: data.message,
                  user: session.userId,
                  timestamp: new Date().toISOString(),
                }));
              }
            });
            break;
          default:
            logger.warn('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        logger.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
      logger.info('WebSocket connection closed');
    });
    ws.on('error', (error) => logger.error('WebSocket error:', error));
  });

  const PORT = process.env.PORT || 3001;

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`WebSocket server ready`);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down');
    closeDatabase();
    server.close(() => process.exit(0));
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down');
    closeDatabase();
    server.close(() => process.exit(0));
  });
}

main().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
