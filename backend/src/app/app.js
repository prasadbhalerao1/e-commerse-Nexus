import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// swagger-ui-express removed — using custom CDN-based handler instead
import routes from './routes.js';
import globalErrorHandler from '../core/exceptions/globalErrorHandler.js';
import { NotFoundError } from '../core/errors.js';
import { apiLimiter } from '../common/middleware/rateLimiter.js';
import env from '../config/env.js';
import landingHandler from './landing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openapiPath = path.join(__dirname, '../docs/openapi.json');
const openapiDoc = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));

const app = express();

// Security headers — allow unpkg CDN for Swagger UI assets on /api-docs
app.use((req, res, next) => {
  if (req.path.startsWith('/api-docs')) {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "unpkg.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "unpkg.com"],
          imgSrc: ["'self'", "data:", "validator.swagger.io"],
          connectSrc: ["'self'", "unpkg.com"],
          workerSrc: ["blob:"]
        }
      }
    })(req, res, next);
  }
  return helmet()(req, res, next);
});

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

// Swagger UI — fully self-contained HTML loading all assets from unpkg CDN.
// Spec is embedded inline as a JS object so no network fetch is needed for spec.json,
// avoiding connect-src issues and req.protocol mismatch behind Vercel's HTTPS terminator.
app.get('/api-docs', (req, res) => {
  const specJson = JSON.stringify(openapiDoc);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Project Nexus — API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function () {
      SwaggerUIBundle({
        spec: ${specJson},
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout',
        deepLinking: true
      });
    };
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
});

// API route entry point
app.use('/api', routes);

// Root health check endpoint
app.get('/', landingHandler);

// Catch all unregistered routes
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Endpoint ${req.originalUrl} does not exist`));
});

// Global error wrapper middleware
app.use(globalErrorHandler);

export default app;
