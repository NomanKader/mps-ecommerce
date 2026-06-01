import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { clean as sanitizeXss } from 'xss-clean/lib/xss';

import { env } from '@config/env';
import { logger } from '@config/logger';
import { errorMiddleware } from '@middlewares/error.middleware';
import { notFoundMiddleware } from '@middlewares/notFound.middleware';
import { apiRateLimit } from '@middlewares/rateLimit.middleware';
import routes from '@routes/index';
import { createRequestId } from '@shared/lib/request-id';

const app = express();

app.disable('x-powered-by');

app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] ?? createRequestId();
  res.setHeader('x-request-id', req.headers['x-request-id']);
  next();
});

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(apiRateLimit);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => {
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
    req.body = sanitizeXss(req.body);
  }

  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params);
    req.params = sanitizeXss(req.params) as typeof req.params;
  }

  if (req.headers) {
    req.headers = mongoSanitize.sanitize(req.headers);
  }

  next();
});
app.use(hpp());

app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

app.use(env.API_PREFIX, routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };
