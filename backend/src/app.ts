import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { env } from './config/env';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors());

// Request logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter for authentication routes
const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authRateLimiter);

// Application routes
app.use('/api', routes);

// API Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management System API is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Catch-all 404 Route
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
