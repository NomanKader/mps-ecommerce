import winston from 'winston';

import { env } from '@config/env';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts, stack }) =>
  `${ts} ${level}: ${stack ?? message}`
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: env.APP_NAME },
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === 'development'
          ? combine(colorize(), timestamp(), errors({ stack: true }), consoleFormat)
          : combine(timestamp(), errors({ stack: true }), json())
    })
  ]
});
