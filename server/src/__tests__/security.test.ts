import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('LegalLens Security & Schema Validation Hardening', () => {
  it('rejects empty document text with structured HTTP 400 BadRequest', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: '    ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('BadRequest');
    expect(res.body.message).toContain('required');
  });

  it('rejects compare request when document B is missing with HTTP 400', async () => {
    const res = await request(app)
      .post('/api/compare')
      .send({ docA: 'Valid Agreement A' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('BadRequest');
  });

  it('rejects legal text exceeding 100,000 characters with HTTP 413 Payload Too Large', async () => {
    const massiveText = 'A'.repeat(100005);
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: massiveText });

    expect(res.status).toBe(413);
    expect(res.body.error).toBe('DocumentExceededLimit');
    expect(res.body.providedLength).toBe(100005);
    expect(res.body.maxAllowed).toBe(100000);
  });

  it('strips malicious <script> tags from incoming document payloads', async () => {
    const malicious = 'Contract terms <script>alert("xss")</script> and covenants.';
    const res = await request(app)
      .post('/api/analyze')
      .send({ text: malicious });

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('<script>');
  });

  it('strips javascript: pseudo-protocol URIs from legal text', async () => {
    const malicious = 'Link to javascript:void(0) termination policy.';
    const res = await request(app)
      .post('/api/simplify')
      .send({ text: malicious });

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('javascript:');
  });

  it('rejects non-string malformed JSON payloads in Q&A endpoint', async () => {
    const res = await request(app)
      .post('/api/ask')
      .send({ documentText: 12345, question: true });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('BadRequest');
  });
});
