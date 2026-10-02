import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes';
import { standardRateLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/error.middleware';
import { env } from './config/env';

export const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS setup
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev origins dynamically
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Root & Healthcheck handlers (for cloud platforms like Render)
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Scholarship Finder Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api_v1: '/api/v1'
    }
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Scholarship Finder API'
  });
});

// Mount API routes
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// 404 handler for unknown API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Centralized error handler
app.use(errorHandler);
