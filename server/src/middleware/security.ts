import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * Validates document character length against 100k cap.
 */
export const validateDocumentLength = (fields: string[] = ['text', 'documentText', 'docA', 'docB']) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const field of fields) {
      const val = req.body[field];
      if (typeof val === 'string' && val.length > config.maxDocumentLength) {
        res.status(413).json({
          error: 'DocumentExceededLimit',
          message: `The provided legal text in '${field}' contains ${val.length.toLocaleString()} characters, which exceeds the maximum allowable limit of ${config.maxDocumentLength.toLocaleString()} characters.`,
          maxAllowed: config.maxDocumentLength,
          providedLength: val.length,
        });
        return;
      }
    }
    next();
  };
};

/**
 * Basic sanitization to strip potential script tags or malicious payload sequences.
 */
export const sanitizeLegalInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '');
      }
    }
  }
  next();
};

/**
 * API rate limiter: 60 requests per minute per IP.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many analysis requests from this IP address. Please wait a moment before trying again.',
    retryAfterSeconds: 60,
  },
});
