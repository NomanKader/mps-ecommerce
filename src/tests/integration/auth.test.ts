import request from 'supertest';

import { app } from '../../app';

describe('Storefront authentication routes', () => {
  it('rejects an OTP request without an international phone number', async () => {
    const response = await request(app)
      .post('/api/v1/auth/otp/request')
      .set('x-tenant-id', 'demo')
      .send({ phone: '09123456789' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Phone number must include a valid country code');
  });

  it('rejects malformed registration OTP values', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .set('x-tenant-id', 'demo')
      .send({
        name: 'Ayesha Rahman',
        email: 'ayesha@example.com',
        phone: '+959123456789',
        otp: '123',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Validation failed');
  });

  it('returns unauthorized for an invalid access token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Authorization token is invalid or expired');
  });
});
