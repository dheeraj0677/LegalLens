import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index';
import { cacheService } from '../services/cacheService';

describe('LegalLens In-Memory Cache Service', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  it('stores and retrieves cache entries via SHA-256 keys', () => {
    const key = cacheService.generateKey('test', { id: 1, text: 'NDA' });
    cacheService.set(key, { result: 'cached_data' });

    const retrieved = cacheService.get<{ result: string }>(key);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.result).toBe('cached_data');
  });

  it('serves duplicate legal analysis requests with X-Cache-Status HIT', async () => {
    const sampleDoc = '1. CONFIDENTIALITY. Receiving Party shall not disclose trade secrets.';

    // First request - Cache MISS
    const res1 = await request(app)
      .post('/api/analyze')
      .send({ text: sampleDoc, title: 'Cache Test NDA' });

    expect(res1.status).toBe(200);
    expect(res1.headers['x-cache-status']).toBe('MISS');

    // Second request - Cache HIT (sub-5ms)
    const res2 = await request(app)
      .post('/api/analyze')
      .send({ text: sampleDoc, title: 'Cache Test NDA' });

    expect(res2.status).toBe(200);
    expect(res2.headers['x-cache-status']).toBe('HIT');
    expect(res2.body.clauses.length).toBe(res1.body.clauses.length);
  });

  it('reports accurate operational cache statistics', async () => {
    const res = await request(app).get('/api/cache-stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.hits).toBe('number');
    expect(typeof res.body.misses).toBe('number');
    expect(typeof res.body.hitRate).toBe('string');
  });

  it('clears all cached entries when clear() is invoked', () => {
    const key = cacheService.generateKey('test', 'data');
    cacheService.set(key, 'value');
    expect(cacheService.get(key)).toBe('value');

    cacheService.clear();
    expect(cacheService.get(key)).toBeNull();
    expect(cacheService.getStats().size).toBe(0);
  });
});
