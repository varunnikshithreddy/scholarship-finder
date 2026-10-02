import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Scholarships API Endpoints', () => {
  it('GET /api/v1/health returns status healthy', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/v1/scholarships lists scholarships with pagination metadata', async () => {
    const res = await request(app).get('/api/v1/scholarships?page=1&pageSize=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.pageSize).toBe(5);
  });

  it('GET /api/v1/scholarships/latest returns latest scholarships', async () => {
    const res = await request(app).get('/api/v1/scholarships/latest?limit=3');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/categories returns active categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('name');
    expect(res.body.data[0]).toHaveProperty('slug');
  });

  it('GET /api/v1/providers returns verified providers', async () => {
    const res = await request(app).get('/api/v1/providers');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('name');
  });
});
