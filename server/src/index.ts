import './config/env';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { authRoutes } from './routes/auth';
import { gameRoutes } from './routes/game';
import { stepikRoutes } from './routes/stepik';
import { errorHandler } from './middleware/errorHandler';
import { attachUser } from './middleware/auth';
import { logger } from './utils/logger';
import { initDatabase, closeDatabase } from './database';

async function main() {
  await initDatabase();
  logger.info('Database initialized');

  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(helmet());
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/auth', authRoutes);
  app.use('/api/game', attachUser, gameRoutes);
  app.use('/api/stepik', stepikRoutes);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(errorHandler);

  // Serve static client in production
  const path = require('path');
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  wss.on('connection', (ws) => {
    logger.info('New WebSocket connection established');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        switch (data.type) {
          case 'game_update':
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === 1) {
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
                  user: data.user,
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

    ws.on('close', () => logger.info('WebSocket connection closed'));
    ws.on('error', (error) => logger.error('WebSocket error:', error));
  });

  const PORT = process.env.PORT || 3001;

  server.listen(PORT, '127.0.0.1', () => {
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
