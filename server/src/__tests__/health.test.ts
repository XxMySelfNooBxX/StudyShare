import request from 'supertest';
import express from 'express';
import helmet from 'helmet';

const app = express();
app.use(helmet());
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

describe('Health Check Endpoint', () => {
  it('should return 200 OK and a timestamp', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should include helmet security headers', async () => {
    const response = await request(app).get('/health');
    expect(response.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
  });
});
