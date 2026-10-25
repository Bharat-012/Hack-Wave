import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('PatchMyCity Express API Integration Tests', () => {
  it('GET /api/v1/health returns status ok and gemini status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('PatchMyCity API');
    expect(res.body).toHaveProperty('gemini_status');
  });

  it('GET /api/v1/reports returns seeded demo reports', async () => {
    const res = await request(app).get('/api/v1/reports');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it('POST /api/v1/reports rejects invalid schema with 400', async () => {
    const res = await request(app).post('/api/v1/reports').send({
      title: 'Hi', // too short
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/reports successfully creates a live report', async () => {
    const res = await request(app).post('/api/v1/reports').send({
      title: 'Broken Storm Drain Grating',
      description: 'Heavy metal grating cracked and sunken by 10cm near intersection.',
      category: 'water_drainage',
      severity: 'high',
      latitude: 28.64,
      longitude: 77.21,
      address: 'Pusa Road, Delhi',
      image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Broken Storm Drain Grating');
    expect(res.body.data.is_demo).toBe(false); // Live submission!
  });

  it('POST /api/v1/ai/analyze-image returns structured analysis', async () => {
    const res = await request(app).post('/api/v1/ai/analyze-image').send({
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
      userContext: 'Pothole on asphalt road',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('category');
    expect(res.body.data).toHaveProperty('visible_evidence');
    expect(res.body.data).toHaveProperty('suggested_severity');
    expect(res.body.data).toHaveProperty('confidence');
  });

  it('GET /api/v1/dashboard/impact separates live and demo metrics', async () => {
    const res = await request(app).get('/api/v1/dashboard/impact');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics.total_reports).toHaveProperty('combined');
    expect(res.body.data.metrics.total_reports).toHaveProperty('live');
    expect(res.body.data.metrics.total_reports).toHaveProperty('demo');
  });
});
