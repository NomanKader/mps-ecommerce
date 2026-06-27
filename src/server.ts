import mongoose from 'mongoose';

import { app } from './app';

import { preloadApplicationData } from '@config/bootstrap';
import { connectDatabase } from '@config/database';
import { env } from '@config/env';
import { logger } from '@config/logger';

const startServer = async (): Promise<void> => {
  await connectDatabase();
  await preloadApplicationData();

  const server = app.listen(env.PORT, () => {
    logger.info(`${env.APP_NAME} listening on port ${env.PORT}`);
    logger.info(`API running at http://localhost:${env.PORT}${env.API_PREFIX}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Starting graceful shutdown`);
    server.close(async () => {
      await mongoose.connection.close();
      logger.info('HTTP server and MongoDB connection closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
};

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { stack: error.stack, message: error.message });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

void startServer();
