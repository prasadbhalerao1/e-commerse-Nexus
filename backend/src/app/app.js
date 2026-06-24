import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import routes from './routes.js';
import globalErrorHandler from '../core/exceptions/globalErrorHandler.js';
import { NotFoundError } from '../core/errors.js';
import { apiLimiter } from '../common/middleware/rateLimiter.js';
import env from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openapiPath = path.join(__dirname, '../docs/openapi.json');
const openapiDoc = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));

const app = express();

// Security headers
app.use(helmet());

// CORS configuration supporting credentials with normalized origin checks
app.use(cors({
  origin: (origin, callback) => {
    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
    const isAllowed = !origin || env.CORS_ORIGINS.some(
      (allowed) => allowed.replace(/\/$/, '') === normalizedOrigin
    );
    if (isAllowed) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true
}));

// Apply general API rate limiter
app.use('/api', apiLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Swagger UI documentation server
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

// API route entry point
app.use('/api', routes);

// Catch all unregistered routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Endpoint ${req.originalUrl} does not exist`));
});

// Global error wrapper middleware
app.use(globalErrorHandler);

export default app;
