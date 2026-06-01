import request from 'supertest';

import { app } from '../../app';

describe('GET /api/v1/health', () => {
  it('returns service health details', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });
});
