import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
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
 * Strict Input Sanitization to strip potential script tags, javascript: URIs, or malicious event handlers.
 */
export const sanitizeLegalInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    }
  }
  next();
};

/**
 * Zod Schemas for Strict Request Validation
 */
export const analyzeRequestSchema = z.object({
  text: z.string().trim().min(1, 'Document text is required and cannot be empty.'),
  title: z.string().max(200).optional(),
});

export const compareRequestSchema = z.object({
  docA: z.string().trim().min(1, 'Document A (Original) is required and cannot be empty.'),
  docB: z.string().trim().min(1, 'Document B (Revision) is required and cannot be empty.'),
  titleA: z.string().max(200).optional(),
  titleB: z.string().max(200).optional(),
});

export const simplifyRequestSchema = z.object({
  text: z.string().trim().min(1, 'Legal text to simplify is required and cannot be empty.'),
  title: z.string().max(200).optional(),
});

export const qaRequestSchema = z.object({
  documentText: z.string().trim().min(1, 'Document text is required and cannot be empty.'),
  question: z.string().trim().min(1, 'Question is required and cannot be empty.'),
});

/**
 * Middleware factory for validating request bodies against Zod schemas
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'BadRequest',
        message: parsed.error.errors[0]?.message || 'Invalid request body format.',
        details: parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
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
