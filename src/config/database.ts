import mongoose from 'mongoose';

import { env } from '@config/env';
import { logger } from '@config/logger';

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('MongoDB connection established');
};
