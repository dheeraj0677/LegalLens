import { Router, Request, Response } from 'express';
import { documentAnalyzer } from '../services/documentAnalyzer';
import { documentComparer } from '../services/documentComparer';
import { simplifierService } from '../services/simplifierService';
import { qaService } from '../services/qaService';
import { aiClient } from '../services/aiClient';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import { validateDocumentLength, sanitizeLegalInput } from '../middleware/security';

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
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get Preset Sample Documents for Testing & Demos
 */
router.get('/sample-docs', (_req: Request, res: Response) => {
  res.json({
    count: SAMPLE_DOCUMENTS.length,
    presets: SAMPLE_DOCUMENTS,
  });
});

/**
 * POST /api/analyze - Extract structured clauses, calculate risk scores, executive summary, checklist
 */
router.post(
  '/analyze',
  validateDocumentLength(['text']),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { text, title } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'Document text is required and cannot be empty.',
        });
        return;
      }

      const result = await documentAnalyzer.analyzeDocument(text, title);
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
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { docA, docB, titleA, titleB } = req.body;

      if (!docA || !docB || typeof docA !== 'string' || typeof docB !== 'string') {
        res.status(400).json({
          error: 'BadRequest',
          message: 'Both docA and docB are required for document comparison.',
        });
        return;
      }

      const result = await documentComparer.compareDocuments(docA, docB, titleA, titleB);
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
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'Text to simplify is required.',
        });
        return;
      }

      const result = await simplifierService.simplifyText(text);
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
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { documentText, question } = req.body;

      if (!documentText || !question || typeof documentText !== 'string' || typeof question !== 'string') {
        res.status(400).json({
          error: 'BadRequest',
          message: 'Both documentText and question are required.',
        });
        return;
      }

      const result = await qaService.answerQuestion(documentText, question);
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
