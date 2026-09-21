import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('LegalLens Server API Endpoints', () => {
  it('GET /api/health returns healthy status and model information', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toContain('LegalLens');
    expect(res.body.model).toBeDefined();
  });

  it('GET /api/sample-docs returns pre-configured legal document presets', async () => {
    const res = await request(app).get('/api/sample-docs');
    expect(res.status).toBe(200);
    expect(res.body.count).toBeGreaterThan(0);
    expect(Array.isArray(res.body.presets)).toBe(true);
    expect(res.body.presets[0].documentA.text).toBeDefined();
  });

  it('POST /api/analyze extracts clauses and assesses risk', async () => {
    const sampleContract = `
      1. INDEMNIFICATION AND LIABILITY.
      Contractor agrees to indemnify and hold harmless Client against any claims, losses, or damages.
      Total liability under this contract is unlimited.

      2. TERMINATION.
      Client may terminate this agreement immediately without notice or cause.
    `;

    const res = await request(app)
      .post('/api/analyze')
      .send({ text: sampleContract, title: 'Test Consulting Contract' });

    expect(res.status).toBe(200);
    expect(res.body.documentTitle).toBe('Test Consulting Contract');
    expect(res.body.clauses.length).toBeGreaterThan(0);
    expect(res.body.overallRiskLevel).toBeDefined();
    expect(res.body.actionChecklist.length).toBeGreaterThan(0);
    expect(res.body.suggestedQuestionsForLawyer.length).toBeGreaterThan(0);
  });

  it('POST /api/analyze returns 400 when text is empty', async () => {
    const res = await request(app).post('/api/analyze').send({ text: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('BadRequest');
  });

  it('POST /api/analyze rejects text exceeding 100k characters with 413', async () => {
    const hugeText = 'A'.repeat(100005);
    const res = await request(app).post('/api/analyze').send({ text: hugeText });
    expect(res.status).toBe(413);
    expect(res.body.error).toBe('DocumentExceededLimit');
  });

  it('POST /api/compare returns matched clauses and favorability', async () => {
    const docA = `1. TERMINATION. Either party may terminate with 30 days notice.`;
    const docB = `1. TERMINATION. Client may terminate immediately without cause.`;

    const res = await request(app).post('/api/compare').send({
      docA,
      docB,
      titleA: 'Draft 1',
      titleB: 'Draft 2',
    });

    expect(res.status).toBe(200);
    expect(res.body.favorability).toBeDefined();
    expect(res.body.matchedClauses.length).toBeGreaterThan(0);
    expect(res.body.keyDifferences.length).toBeGreaterThan(0);
  });

  it('POST /api/simplify translates legalese and returns readability metrics', async () => {
    const legalese = `Notwithstanding anything herein to the contrary, the receiving party shall indemnify and hold harmless the disclosing party in perpetuity.`;
    const res = await request(app).post('/api/simplify').send({ text: legalese });

    expect(res.status).toBe(200);
    expect(res.body.simplifiedText).toBeDefined();
    expect(res.body.readingGradeBefore).toBeDefined();
    expect(res.body.readingGradeAfter).toBeDefined();
    expect(res.body.jargonGlossary.length).toBeGreaterThan(0);
  });

  it('POST /api/ask returns grounded answers with citations and disclaimer', async () => {
    const doc = `SECTION 5. GOVERNING LAW. This agreement is governed by the laws of the State of California. Any disputes must be arbitrated in San Francisco.`;
    const res = await request(app).post('/api/ask').send({
      documentText: doc,
      question: 'Which state law governs this contract?',
    });

    expect(res.status).toBe(200);
    expect(res.body.answer).toBeDefined();
    expect(res.body.citations.length).toBeGreaterThan(0);
    expect(res.body.disclaimer).toContain('legal advice');
  });
});
