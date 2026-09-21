import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import apiRouter from './routes/api';
import { apiRateLimiter } from './middleware/security';

const app = express();

// Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'http://localhost:5173', 'https://openrouter.ai'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // Allow localhost dev servers
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting
app.use('/api/', apiRateLimiter);

// Body Parsers (supporting up to 5MB legal documents)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Mount API Routes
app.use('/api', apiRouter);

// Root Welcome & Documentation Route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'LegalLens AI Document Intelligence API',
    description: 'GenAI-powered accessible legal assistance & contract comparator',
    documentation: '/api/health',
    status: 'online',
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'NotFound',
    message: 'The requested API endpoint does not exist.',
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Exception]:', err);
  res.status(err.status || 500).json({
    error: 'InternalServerError',
    message: err.message || 'An unexpected error occurred during document processing.',
  });
});

// Start Server if directly invoked
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(config.port, () => {
    console.log(`[LegalLens Server] Ready at http://localhost:${config.port}`);
    console.log(`[LegalLens Server] Model target: ${config.openRouterModel}`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('[LegalLens Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[LegalLens Server] Closed remaining connections.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
