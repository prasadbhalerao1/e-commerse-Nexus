import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes.js';
import globalErrorHandler from '../core/exceptions/globalErrorHandler.js';
import { NotFoundError } from '../core/errors.js';
import { apiLimiter } from '../common/middleware/rateLimiter.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration supporting credentials
app.use(cors({
  origin: true,
  credentials: true
}));

// Apply general API rate limiter
app.use('/api', apiLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API route entry point
app.use('/api', routes);

// Catch all unregistered routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Endpoint ${req.originalUrl} does not exist`));
});

// Global error wrapper middleware
app.use(globalErrorHandler);

export default app;
