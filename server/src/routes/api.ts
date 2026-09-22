import { Router, Request, Response } from 'express';
import { documentAnalyzer } from '../services/documentAnalyzer';
import { documentComparer } from '../services/documentComparer';
import { simplifierService } from '../services/simplifierService';
import { qaService } from '../services/qaService';
import { aiClient } from '../services/aiClient';
import { cacheService } from '../services/cacheService';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import {
  validateDocumentLength,
  sanitizeLegalInput,
  validateBody,
  analyzeRequestSchema,
  compareRequestSchema,
  simplifyRequestSchema,
  qaRequestSchema,
} from '../middleware/security';

const router = Router();

// Apply sanitization across all body inputs
router.use(sanitizeLegalInput);

/**
 * Health Check & Model Status
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'LegalLens AI Document Intelligence',
    version: '1.0.0',
    model: aiClient.getModel(),
    hasActiveKey: aiClient.hasActiveKey(),
    cache: cacheService.getStats(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get Preset Sample Documents for Testing & Demos
 */
router.get('/sample-docs', (_req: Request, res: Response) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json({
    count: SAMPLE_DOCUMENTS.length,
    presets: SAMPLE_DOCUMENTS,
  });
});

/**
 * Cache Statistics Endpoint
 */
router.get('/cache-stats', (_req: Request, res: Response) => {
  res.json(cacheService.getStats());
});

/**
 * POST /api/analyze - Extract structured clauses, calculate risk scores, executive summary, checklist
 */
router.post(
  '/analyze',
  validateDocumentLength(['text']),
  validateBody(analyzeRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, title } = req.body;
      const cacheKey = cacheService.generateKey('analyze', text, title || '');

      const cached = cacheService.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache-Status', 'HIT');
        res.json(cached);
        return;
      }

      const result = await documentAnalyzer.analyzeDocument(text, title);
      cacheService.set(cacheKey, result);
      res.setHeader('X-Cache-Status', 'MISS');
      res.json(result);
    } catch (err: any) {
      console.error('[Route /api/analyze Error]:', err);
      res.status(500).json({
        error: 'AnalysisError',
        message: 'Failed to complete legal document analysis. Please check your document text.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

/**
 * POST /api/compare - Compare two versions or competing contracts
 */
router.post(
  '/compare',
  validateDocumentLength(['docA', 'docB']),
  validateBody(compareRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { docA, docB, titleA, titleB } = req.body;
      const cacheKey = cacheService.generateKey('compare', docA, docB, titleA || '', titleB || '');

      const cached = cacheService.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache-Status', 'HIT');
        res.json(cached);
        return;
      }

      const result = await documentComparer.compareDocuments(docA, docB, titleA, titleB);
      cacheService.set(cacheKey, result);
      res.setHeader('X-Cache-Status', 'MISS');
      res.json(result);
    } catch (err: any) {
      console.error('[Route /api/compare Error]:', err);
      res.status(500).json({
        error: 'ComparisonError',
        message: 'Failed to complete document comparison.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

/**
 * POST /api/simplify - Translate legalese into accessible plain English
 */
router.post(
  '/simplify',
  validateDocumentLength(['text']),
  validateBody(simplifyRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { text } = req.body;
      const cacheKey = cacheService.generateKey('simplify', text);

      const cached = cacheService.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache-Status', 'HIT');
        res.json(cached);
        return;
      }

      const result = await simplifierService.simplifyText(text);
      cacheService.set(cacheKey, result);
      res.setHeader('X-Cache-Status', 'MISS');
      res.json(result);
    } catch (err: any) {
      console.error('[Route /api/simplify Error]:', err);
      res.status(500).json({
        error: 'SimplificationError',
        message: 'Failed to simplify the provided legal text.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

/**
 * POST /api/ask - Context-grounded Q&A with strict citations
 */
router.post(
  '/ask',
  validateDocumentLength(['documentText']),
  validateBody(qaRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { documentText, question } = req.body;
      const cacheKey = cacheService.generateKey('ask', documentText, question);

      const cached = cacheService.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache-Status', 'HIT');
        res.json(cached);
        return;
      }

      const result = await qaService.answerQuestion(documentText, question);
      cacheService.set(cacheKey, result);
      res.setHeader('X-Cache-Status', 'MISS');
      res.json(result);
    } catch (err: any) {
      console.error('[Route /api/ask Error]:', err);
      res.status(500).json({
        error: 'QAError',
        message: 'Failed to answer inquiry based on the document.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  }
);

export default router;
